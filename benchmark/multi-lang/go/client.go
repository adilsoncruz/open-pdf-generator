package main

import (
	"bufio"
	"bytes"
	"encoding/base64"
	"encoding/json"
	"fmt"
	"io"
	"os"
	"os/exec"
	"path/filepath"
	"sync"
)

type Generator interface {
	Name() string
	Model() string
	Generate(spec scenario, seq int) ([]byte, error)
	Close() error
}

// MarotoGenerator runs Maroto in-process
type MarotoGenerator struct{}

func (m *MarotoGenerator) Name() string  { return "maroto" }
func (m *MarotoGenerator) Model() string { return "in-process" }

func (m *MarotoGenerator) Generate(spec scenario, seq int) ([]byte, error) {
	switch spec.Kind {
	case "invoice":
		return renderInvoice(createInvoiceData(seq))
	case "complex":
		return renderComplex(createComplexData())
	default:
		return renderListing(createListingData(spec.Rows))
	}
}

func (m *MarotoGenerator) Close() error { return nil }

// PDFGenExecGenerator runs pdf-generator generate via exec.Command
type PDFGenExecGenerator struct {
	cliBin       string
	templatesDir string
}

func NewPDFGenExecGenerator(cliBin, templatesDir string) *PDFGenExecGenerator {
	return &PDFGenExecGenerator{
		cliBin:       cliBin,
		templatesDir: templatesDir,
	}
}

func (p *PDFGenExecGenerator) Name() string  { return "go-pdfgen-exec" }
func (p *PDFGenExecGenerator) Model() string { return "exec-per-document (from Go)" }

func (p *PDFGenExecGenerator) Generate(spec scenario, seq int) ([]byte, error) {
	var jsonData []byte
	var err error
	templateFile := ""

	switch spec.Kind {
	case "invoice":
		templateFile = "invoice.json"
		jsonData, err = json.Marshal(createInvoiceData(seq))
	case "complex":
		templateFile = "complex.json"
		jsonData, err = json.Marshal(createComplexData())
	default:
		templateFile = "listing.json"
		jsonData, err = json.Marshal(createListingData(spec.Rows))
	}
	if err != nil {
		return nil, fmt.Errorf("marshal data: %w", err)
	}

	templatePath := filepath.Join(p.templatesDir, templateFile)
	cmd := exec.Command(p.cliBin, "generate", templatePath, "-d", "-", "-o", "-")
	cmd.Stdin = bytes.NewReader(jsonData)

	var stdout, stderr bytes.Buffer
	cmd.Stdout = &stdout
	cmd.Stderr = &stderr

	if err := cmd.Run(); err != nil {
		return nil, fmt.Errorf("exec %s: %w, stderr: %s", templatePath, err, stderr.String())
	}
	return stdout.Bytes(), nil
}

func (p *PDFGenExecGenerator) Close() error { return nil }

// PDFGenServeGenerator keeps a pdf-generator serve process alive over NDJSON
type PDFGenServeGenerator struct {
	cliBin       string
	templatesDir string
	cmd          *exec.Cmd
	stdin        io.WriteCloser
	scanner      *bufio.Scanner
	mu           sync.Mutex
	reqID        int
}

type serveRequest struct {
	ID       int            `json:"id"`
	Template string         `json:"template"`
	Data     map[string]any `json:"data"`
}

type serveResponse struct {
	ID    int     `json:"id"`
	OK    bool    `json:"ok"`
	Bytes int     `json:"bytes"`
	Ms    float64 `json:"ms"`
	PDF   string  `json:"pdf"`
	Error string  `json:"error,omitempty"`
}

func NewPDFGenServeGenerator(cliBin, templatesDir string) (*PDFGenServeGenerator, error) {
	cmd := exec.Command(cliBin, "serve")
	stdin, err := cmd.StdinPipe()
	if err != nil {
		return nil, fmt.Errorf("stdin pipe: %w", err)
	}
	stdout, err := cmd.StdoutPipe()
	if err != nil {
		return nil, fmt.Errorf("stdout pipe: %w", err)
	}
	cmd.Stderr = os.Stderr

	if err := cmd.Start(); err != nil {
		return nil, fmt.Errorf("start serve: %w", err)
	}

	scanner := bufio.NewScanner(stdout)
	buf := make([]byte, 1024*1024)
	scanner.Buffer(buf, 64*1024*1024)

	return &PDFGenServeGenerator{
		cliBin:       cliBin,
		templatesDir: templatesDir,
		cmd:          cmd,
		stdin:        stdin,
		scanner:      scanner,
	}, nil
}

func (s *PDFGenServeGenerator) Name() string  { return "go-pdfgen-serve" }
func (s *PDFGenServeGenerator) Model() string { return "resident serve via NDJSON (from Go)" }

func (s *PDFGenServeGenerator) Generate(spec scenario, seq int) ([]byte, error) {
	s.mu.Lock()
	defer s.mu.Unlock()

	s.reqID++
	templateFile := ""
	var rawData any

	switch spec.Kind {
	case "invoice":
		templateFile = "invoice.json"
		rawData = createInvoiceData(seq)
	case "complex":
		templateFile = "complex.json"
		rawData = createComplexData()
	default:
		templateFile = "listing.json"
		rawData = createListingData(spec.Rows)
	}

	dataBytes, err := json.Marshal(rawData)
	if err != nil {
		return nil, fmt.Errorf("marshal data: %w", err)
	}

	var dataMap map[string]any
	if err := json.Unmarshal(dataBytes, &dataMap); err != nil {
		return nil, fmt.Errorf("unmarshal to map: %w", err)
	}

	req := serveRequest{
		ID:       s.reqID,
		Template: filepath.Join(s.templatesDir, templateFile),
		Data:     dataMap,
	}

	reqBytes, err := json.Marshal(req)
	if err != nil {
		return nil, fmt.Errorf("marshal req: %w", err)
	}

	reqBytes = append(reqBytes, '\n')
	if _, err := s.stdin.Write(reqBytes); err != nil {
		return nil, fmt.Errorf("write serve stdin: %w", err)
	}

	if !s.scanner.Scan() {
		if err := s.scanner.Err(); err != nil {
			return nil, fmt.Errorf("scan serve response: %w", err)
		}
		return nil, fmt.Errorf("unexpected EOF from serve")
	}

	line := s.scanner.Bytes()
	var resp serveResponse
	if err := json.Unmarshal(line, &resp); err != nil {
		return nil, fmt.Errorf("unmarshal serve resp (%s): %w", string(line), err)
	}

	if !resp.OK {
		return nil, fmt.Errorf("serve error: %s", resp.Error)
	}

	pdfBytes, err := base64.StdEncoding.DecodeString(resp.PDF)
	if err != nil {
		return nil, fmt.Errorf("decode pdf base64: %w", err)
	}
	return pdfBytes, nil
}

func (s *PDFGenServeGenerator) Close() error {
	if s.stdin != nil {
		_ = s.stdin.Close()
	}
	if s.cmd != nil && s.cmd.Process != nil {
		_ = s.cmd.Process.Kill()
		_ = s.cmd.Wait()
	}
	return nil
}
