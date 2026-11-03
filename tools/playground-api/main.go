package main

import (
	"context"
	"encoding/base64"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
	"os"
	"os/exec"
	"path/filepath"
	"strings"
	"time"
)

type PreviewRequest struct {
	TemplateJson string          `json:"templateJson"`
	DataJson     string          `json:"dataJson"`
	Template     json.RawMessage `json:"template,omitempty"`
	Data         json.RawMessage `json:"data,omitempty"`
}

type PreviewResponse struct {
	Success   bool   `json:"success"`
	PdfBase64 string `json:"pdfBase64,omitempty"`
	ErrorCode string `json:"errorCode,omitempty"`
	CliError  string `json:"cliError,omitempty"`
}

func getCliCommand() (string, []string) {
	if bin := os.Getenv("PDF_GENERATOR_BIN"); bin != "" {
		return bin, nil
	}
	if _, err := exec.LookPath("pdf-generator"); err == nil {
		return "pdf-generator", nil
	}
	if jar := os.Getenv("PDF_GENERATOR_JAR"); jar != "" {
		return "java", []string{"-jar", jar}
	}
	return "/usr/local/bin/pdf-generator", nil
}

func corsMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", "*")
		w.Header().Set("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Accept, Authorization")
		w.Header().Set("Access-Control-Max-Age", "86400")

		if r.Method == http.MethodOptions {
			w.WriteHeader(http.StatusNoContent)
			return
		}
		next.ServeHTTP(w, r)
	})
}

func handleHealth(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	_, _ = w.Write([]byte(`{"status":"ok","service":"open-pdf-generator-api"}`))
}

func handleRoot(w http.ResponseWriter, r *http.Request) {
	if r.URL.Path != "/" {
		http.NotFound(w, r)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	_, _ = w.Write([]byte(`{"status":"online","service":"Open PDF Generator API","endpoints":["/health","/api/generate-preview","/api/render"]}`))
}

func handleGeneratePreview(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, `{"error":"Method not allowed"}`, http.StatusMethodNotAllowed)
		return
	}

	r.Body = http.MaxBytesReader(w, r.Body, 10*1024*1024) // 10MB max
	body, err := io.ReadAll(r.Body)
	if err != nil {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusBadRequest)
		_ = json.NewEncoder(w).Encode(PreviewResponse{
			Success:   false,
			ErrorCode: "REQUEST_TOO_LARGE",
			CliError:  err.Error(),
		})
		return
	}

	var req PreviewRequest
	if err := json.Unmarshal(body, &req); err != nil {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusBadRequest)
		_ = json.NewEncoder(w).Encode(PreviewResponse{
			Success:   false,
			ErrorCode: "INVALID_JSON",
			CliError:  err.Error(),
		})
		return
	}

	// Resolve template string
	templateStr := strings.TrimSpace(req.TemplateJson)
	if templateStr == "" && len(req.Template) > 0 {
		templateStr = string(req.Template)
	}

	// Resolve data string
	dataStr := strings.TrimSpace(req.DataJson)
	if dataStr == "" && len(req.Data) > 0 {
		dataStr = string(req.Data)
	}
	if dataStr == "" {
		dataStr = "{}"
	}

	if templateStr == "" {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusBadRequest)
		_ = json.NewEncoder(w).Encode(PreviewResponse{
			Success:   false,
			ErrorCode: "MISSING_TEMPLATE",
			CliError:  "Template payload cannot be empty",
		})
		return
	}

	// Create temporary directory for generation
	tmpDir, err := os.MkdirTemp("", "open-pdf-preview-*")
	if err != nil {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusInternalServerError)
		_ = json.NewEncoder(w).Encode(PreviewResponse{
			Success:   false,
			ErrorCode: "TMP_DIR_ERROR",
			CliError:  err.Error(),
		})
		return
	}
	defer func() { _ = os.RemoveAll(tmpDir) }()

	templatePath := filepath.Join(tmpDir, "template.json")
	dataPath := filepath.Join(tmpDir, "data.json")
	outputPath := filepath.Join(tmpDir, "output.pdf")

	if err := os.WriteFile(templatePath, []byte(templateStr), 0600); err != nil {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusInternalServerError)
		_ = json.NewEncoder(w).Encode(PreviewResponse{
			Success:   false,
			ErrorCode: "IO_ERROR",
			CliError:  err.Error(),
		})
		return
	}

	if err := os.WriteFile(dataPath, []byte(dataStr), 0600); err != nil {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusInternalServerError)
		_ = json.NewEncoder(w).Encode(PreviewResponse{
			Success:   false,
			ErrorCode: "IO_ERROR",
			CliError:  err.Error(),
		})
		return
	}

	bin, baseArgs := getCliCommand()
	args := append([]string{}, baseArgs...)
	args = append(args, "generate", templatePath, "-d", dataPath, "-o", outputPath)

	ctx, cancel := context.WithTimeout(r.Context(), 15*time.Second)
	defer cancel()

	cmd := exec.CommandContext(ctx, bin, args...)
	output, cmdErr := cmd.CombinedOutput()

	w.Header().Set("Content-Type", "application/json")

	if cmdErr != nil {
		w.WriteHeader(http.StatusOK) // Return 200 with success: false for editor consistency
		_ = json.NewEncoder(w).Encode(PreviewResponse{
			Success:   false,
			ErrorCode: "ERROR_GENERATING_PDF",
			CliError:  fmt.Sprintf("%s\n%s", cmdErr.Error(), string(output)),
		})
		return
	}

	pdfBytes, err := os.ReadFile(outputPath)
	if err != nil {
		w.WriteHeader(http.StatusOK)
		_ = json.NewEncoder(w).Encode(PreviewResponse{
			Success:   false,
			ErrorCode: "ERROR_READING_PDF",
			CliError:  err.Error(),
		})
		return
	}

	encoded := base64.StdEncoding.EncodeToString(pdfBytes)
	_ = json.NewEncoder(w).Encode(PreviewResponse{
		Success:   true,
		PdfBase64: encoded,
	})
}

func handleRenderDirect(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	r.Body = http.MaxBytesReader(w, r.Body, 10*1024*1024)
	body, err := io.ReadAll(r.Body)
	if err != nil {
		http.Error(w, "Request too large", http.StatusBadRequest)
		return
	}

	var req PreviewRequest
	if err := json.Unmarshal(body, &req); err != nil {
		http.Error(w, "Invalid JSON payload", http.StatusBadRequest)
		return
	}

	templateStr := strings.TrimSpace(req.TemplateJson)
	if templateStr == "" && len(req.Template) > 0 {
		templateStr = string(req.Template)
	}

	dataStr := strings.TrimSpace(req.DataJson)
	if dataStr == "" && len(req.Data) > 0 {
		dataStr = string(req.Data)
	}
	if dataStr == "" {
		dataStr = "{}"
	}

	if templateStr == "" {
		http.Error(w, "Missing template", http.StatusBadRequest)
		return
	}

	tmpDir, err := os.MkdirTemp("", "open-pdf-render-*")
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	defer func() { _ = os.RemoveAll(tmpDir) }()

	templatePath := filepath.Join(tmpDir, "template.json")
	dataPath := filepath.Join(tmpDir, "data.json")
	outputPath := filepath.Join(tmpDir, "output.pdf")

	if err := os.WriteFile(templatePath, []byte(templateStr), 0600); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	if err := os.WriteFile(dataPath, []byte(dataStr), 0600); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	bin, baseArgs := getCliCommand()
	args := append([]string{}, baseArgs...)
	args = append(args, "generate", templatePath, "-d", dataPath, "-o", outputPath)

	ctx, cancel := context.WithTimeout(r.Context(), 15*time.Second)
	defer cancel()

	cmd := exec.CommandContext(ctx, bin, args...)
	if output, cmdErr := cmd.CombinedOutput(); cmdErr != nil {
		http.Error(w, fmt.Sprintf("Generation failed: %s (%s)", cmdErr.Error(), string(output)), http.StatusUnprocessableEntity)
		return
	}

	pdfBytes, err := os.ReadFile(outputPath)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/pdf")
	w.Header().Set("Content-Disposition", "inline; filename=\"output.pdf\"")
	w.Header().Set("Content-Length", fmt.Sprintf("%d", len(pdfBytes)))
	w.WriteHeader(http.StatusOK)
	_, _ = w.Write(pdfBytes)
}

func main() {
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	mux := http.NewServeMux()
	mux.HandleFunc("/", handleRoot)
	mux.HandleFunc("/health", handleHealth)
	mux.HandleFunc("/api/generate-preview", handleGeneratePreview)
	mux.HandleFunc("/api/render", handleRenderDirect)

	handler := corsMiddleware(mux)

	log.Printf("Starting Open PDF Generator API on port %s...", port)
	if err := http.ListenAndServe(":"+port, handler); err != nil {
		log.Fatalf("Server error: %v", err)
	}
}
