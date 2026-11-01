package main

import (
	"encoding/json"
	"fmt"
	"math"
	"os"
	"path/filepath"
	"runtime"
	"sort"
	"strconv"
	"sync/atomic"
	"time"
)

// Uniform results contract shared by every engine runner (Go, Node, CLI):
//   results.json -> { engine, language, model, environment, scenarios[] }

type scenario struct {
	Name   string
	Kind   string // invoice | listing | complex
	Trials int
	Rows   int
}

type scenarioResult struct {
	Name         string  `json:"name"`
	Kind         string  `json:"kind"`
	Trials       int     `json:"trials"`
	Warmup       int     `json:"warmup"`
	P50Ms        float64 `json:"p50Ms"`
	P95Ms        float64 `json:"p95Ms"`
	MeanMs       float64 `json:"meanMs"`
	MinMs        float64 `json:"minMs"`
	MaxMs        float64 `json:"maxMs"`
	Throughput   float64 `json:"throughputDocsPerSec"`
	AvgPDFSizeKb float64 `json:"avgPdfSizeKb"`
	PeakMemoryMb float64 `json:"peakMemoryMb"`
}

type summary struct {
	Engine      string            `json:"engine"`
	Language    string            `json:"language"`
	Model       string            `json:"model"`
	Environment map[string]string `json:"environment"`
	Scenarios   []scenarioResult  `json:"scenarios"`
}

func main() {
	reportsDir := "/app/reports"
	if len(os.Args) > 1 {
		reportsDir = os.Args[1]
	}
	_ = os.MkdirAll(filepath.Join(reportsDir, "samples"), 0o755)

	cliBin := os.Getenv("CLI_BIN")
	if cliBin == "" {
		cliBin = "/usr/local/bin/pdf-generator"
	}
	templatesDir := os.Getenv("TEMPLATES_DIR")
	if templatesDir == "" {
		templatesDir = "/app/templates"
	}

	engineName := os.Getenv("ENGINE")
	if engineName == "" {
		engineName = "maroto"
	}

	var gen Generator
	var err error
	switch engineName {
	case "go-pdfgen-exec":
		gen = NewPDFGenExecGenerator(cliBin, templatesDir)
	case "go-pdfgen-serve":
		gen, err = NewPDFGenServeGenerator(cliBin, templatesDir)
		if err != nil {
			fmt.Fprintf(os.Stderr, "failed to start serve: %v\n", err)
			os.Exit(1)
		}
	default:
		gen = &MarotoGenerator{}
	}
	defer gen.Close()

	scale := envFloat("BENCH_TRIALS_SCALE", 1.0)
	specs := []scenario{
		{Name: "invoice", Kind: "invoice", Trials: scaleTrials(300, scale), Rows: 1},
		{Name: "listing_100", Kind: "listing", Trials: scaleTrials(150, scale), Rows: 100},
		{Name: "complex", Kind: "complex", Trials: scaleTrials(150, scale), Rows: 1},
		{Name: "massive_1000", Kind: "listing", Trials: scaleTrials(12, scale), Rows: 1000},
	}

	peak := &atomic.Uint64{}
	stop := make(chan struct{})
	go sampleMemory(peak, stop)

	results := make([]scenarioResult, 0, len(specs))
	for _, spec := range specs {
		results = append(results, runScenario(gen, spec, filepath.Join(reportsDir, "samples"), peak))
	}
	close(stop)

	report := summary{
		Engine:   gen.Name(),
		Language: runtime.Version(),
		Model:    gen.Model(),
		Environment: map[string]string{
			"goos":        runtime.GOOS,
			"goarch":      runtime.GOARCH,
			"gomaxprocs":  strconv.Itoa(runtime.GOMAXPROCS(0)),
			"trialsScale": strconv.FormatFloat(scale, 'f', 2, 64),
			"engine":      gen.Name(),
		},
		Scenarios: results,
	}

	out, err := json.MarshalIndent(report, "", "  ")
	if err != nil {
		fmt.Fprintln(os.Stderr, "marshal:", err)
		os.Exit(1)
	}
	path := filepath.Join(reportsDir, "results.json")
	if err := os.WriteFile(path, out, 0o644); err != nil {
		fmt.Fprintln(os.Stderr, "write:", err)
		os.Exit(1)
	}
	fmt.Printf("%s results -> %s\n", gen.Name(), path)
}

func runScenario(gen Generator, spec scenario, samplesDir string, peak *atomic.Uint64) scenarioResult {
	warmup := 10
	if spec.Trials < 10 {
		warmup = 3
	}

	for i := 1; i <= warmup; i++ {
		if _, err := gen.Generate(spec, i); err != nil {
			fmt.Fprintf(os.Stderr, "warmup %s: %v\n", spec.Name, err)
			os.Exit(1)
		}
	}

	durations := make([]float64, 0, spec.Trials)
	sizes := make([]float64, 0, spec.Trials)
	startAll := time.Now()
	for trial := 1; trial <= spec.Trials; trial++ {
		start := time.Now()
		pdfBytes, err := gen.Generate(spec, trial)
		elapsed := float64(time.Since(start).Microseconds()) / 1000.0
		if err != nil {
			fmt.Fprintf(os.Stderr, "%s trial %d: %v\n", spec.Name, trial, err)
			os.Exit(1)
		}
		durations = append(durations, elapsed)
		sizes = append(sizes, float64(len(pdfBytes))/1024.0)
		if trial == 1 {
			sample := filepath.Join(samplesDir, spec.Name+".pdf")
			_ = os.WriteFile(sample, pdfBytes, 0o644)
		}
	}
	wall := time.Since(startAll).Seconds()

	return scenarioResult{
		Name:         spec.Name,
		Kind:         spec.Kind,
		Trials:       spec.Trials,
		Warmup:       warmup,
		P50Ms:        round2(percentile(durations, 50)),
		P95Ms:        round2(percentile(durations, 95)),
		MeanMs:       round2(mean(durations)),
		MinMs:        round2(minValue(durations)),
		MaxMs:        round2(maxValue(durations)),
		Throughput:   round2(float64(spec.Trials) / wall),
		AvgPDFSizeKb: round2(mean(sizes)),
		PeakMemoryMb: round2(float64(peak.Load()) / (1024 * 1024)),
	}
}

func sampleMemory(peak *atomic.Uint64, stop <-chan struct{}) {
	var stats runtime.MemStats
	ticker := time.NewTicker(20 * time.Millisecond)
	defer ticker.Stop()
	for {
		select {
		case <-stop:
			return
		case <-ticker.C:
			runtime.ReadMemStats(&stats)
			if stats.Sys > peak.Load() {
				peak.Store(stats.Sys)
			}
		}
	}
}

func percentile(values []float64, p float64) float64 {
	if len(values) == 0 {
		return 0
	}
	sorted := make([]float64, len(values))
	copy(sorted, values)
	sort.Float64s(sorted)
	idx := int(math.Ceil(p/100*float64(len(sorted)))) - 1
	if idx < 0 {
		idx = 0
	}
	if idx >= len(sorted) {
		idx = len(sorted) - 1
	}
	return sorted[idx]
}

func mean(values []float64) float64 {
	if len(values) == 0 {
		return 0
	}
	total := 0.0
	for _, v := range values {
		total += v
	}
	return total / float64(len(values))
}

func minValue(values []float64) float64 {
	if len(values) == 0 {
		return 0
	}
	m := values[0]
	for _, v := range values[1:] {
		if v < m {
			m = v
		}
	}
	return m
}

func maxValue(values []float64) float64 {
	if len(values) == 0 {
		return 0
	}
	m := values[0]
	for _, v := range values[1:] {
		if v > m {
			m = v
		}
	}
	return m
}

func round2(v float64) float64 {
	return math.Round(v*100) / 100
}

func scaleTrials(base int, scale float64) int {
	n := int(math.Round(float64(base) * scale))
	if n < 3 {
		n = 3
	}
	return n
}

func envFloat(key string, fallback float64) float64 {
	raw := os.Getenv(key)
	if raw == "" {
		return fallback
	}
	value, err := strconv.ParseFloat(raw, 64)
	if err != nil || value <= 0 {
		return fallback
	}
	return value
}
