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

type pdfGenError struct {
	Code    string
	Message string
	Status  int
}

func (e *pdfGenError) Error() string {
	return e.Message
}

func runPdfGenerator(ctx context.Context, req PreviewRequest) ([]byte, *pdfGenError) {
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
		return nil, &pdfGenError{
			Code:    "MISSING_TEMPLATE",
			Message: "Template payload cannot be empty",
			Status:  http.StatusBadRequest,
		}
	}

	tmpDir, err := os.MkdirTemp("", "open-pdf-*")
	if err != nil {
		return nil, &pdfGenError{
			Code:    "TMP_DIR_ERROR",
			Message: err.Error(),
			Status:  http.StatusInternalServerError,
		}
	}
	defer func() { _ = os.RemoveAll(tmpDir) }()

	templatePath := filepath.Join(tmpDir, "template.json")
	dataPath := filepath.Join(tmpDir, "data.json")
	outputPath := filepath.Join(tmpDir, "output.pdf")

	if err := os.WriteFile(templatePath, []byte(templateStr), 0600); err != nil {
		return nil, &pdfGenError{
			Code:    "IO_ERROR",
			Message: err.Error(),
			Status:  http.StatusInternalServerError,
		}
	}

	if err := os.WriteFile(dataPath, []byte(dataStr), 0600); err != nil {
		return nil, &pdfGenError{
			Code:    "IO_ERROR",
			Message: err.Error(),
			Status:  http.StatusInternalServerError,
		}
	}

	bin, baseArgs := getCliCommand()
	args := append([]string{}, baseArgs...)
	args = append(args, "generate", templatePath, "-d", dataPath, "-o", outputPath)

	execCtx, cancel := context.WithTimeout(ctx, 60*time.Second)
	defer cancel()

	cmd := exec.CommandContext(execCtx, bin, args...)
	if output, cmdErr := cmd.CombinedOutput(); cmdErr != nil {
		return nil, &pdfGenError{
			Code:    "ERROR_GENERATING_PDF",
			Message: fmt.Sprintf("%s\n%s", cmdErr.Error(), string(output)),
			Status:  http.StatusUnprocessableEntity,
		}
	}

	pdfBytes, err := os.ReadFile(outputPath)
	if err != nil {
		return nil, &pdfGenError{
			Code:    "ERROR_READING_PDF",
			Message: err.Error(),
			Status:  http.StatusInternalServerError,
		}
	}

	return pdfBytes, nil
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

	pdfBytes, genErr := runPdfGenerator(r.Context(), req)
	w.Header().Set("Content-Type", "application/json")

	if genErr != nil {
		status := genErr.Status
		if genErr.Code == "ERROR_GENERATING_PDF" || genErr.Code == "ERROR_READING_PDF" {
			status = http.StatusOK // Return 200 with success: false for editor consistency
		}
		w.WriteHeader(status)
		_ = json.NewEncoder(w).Encode(PreviewResponse{
			Success:   false,
			ErrorCode: genErr.Code,
			CliError:  genErr.Message,
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

	pdfBytes, genErr := runPdfGenerator(r.Context(), req)
	if genErr != nil {
		http.Error(w, genErr.Message, genErr.Status)
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
