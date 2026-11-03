# Multi-Language Integration (Go, Node.js, Python, C#, PHP)

The Open PDF Generator CLI is designed as a universal PDF generation backend for any technology stack. By supporting **stdin** input and **stdout** binary streaming, your application can generate PDFs in milliseconds without writing temporary files to disk.

::: tip Zero Host Java Required
When using the **standalone native binary** (`pdf-generator-linux-amd64` / `darwin-arm64`) or the **Docker container**, you do not need to install a JDK or JRE on your application host.
:::

---

## 1. Integration Patterns

You can integrate the CLI into your backend services using two patterns:

| Pattern | How it Works | Latency | When to Use |
|---|---|---|---|
| **One-Shot (`generate`)** | Spawns a process per document via stdin/stdout | ~10–15 ms (native) | CLI scripts, cron jobs, standard API traffic |
| **Resident Daemon (`serve`)** | Keeps a long-lived process open over NDJSON pipes | < 1 ms per PDF | High-throughput APIs (> 1,000 PDFs/min) |

---

## 2. Go (Golang)

### One-Shot via stdin/stdout

```go
package main

import (
	"bytes"
	"encoding/json"
	"fmt"
	"os"
	"os/exec"
)

func GeneratePDF(templatePath string, data any) ([]byte, error) {
	jsonData, err := json.Marshal(data)
	if err != nil {
		return nil, fmt.Errorf("error serializing json: %w", err)
	}

	// -d - reads JSON from stdin; -o - writes binary PDF to stdout
	cmd := exec.Command("pdf-generator", "generate", templatePath, "-d", "-", "-o", "-")
	cmd.Stdin = bytes.NewReader(jsonData)

	var stdout, stderr bytes.Buffer
	cmd.Stdout = &stdout
	cmd.Stderr = &stderr // Diagnostics and logs are routed to stderr

	if err := cmd.Run(); err != nil {
		return nil, fmt.Errorf("failed to generate pdf: %w, stderr: %s", err, stderr.String())
	}

	return stdout.Bytes(), nil
}

func main() {
	payload := map[string]any{
		"invoice": map[string]any{"number": "INV-2026-100", "total": "550.00"},
		"customer": map[string]any{"name": "Acme Corp"},
	}

	pdfBytes, err := GeneratePDF("templates/invoice.json", payload)
	if err != nil {
		panic(err)
	}

	_ = os.WriteFile("invoice.pdf", pdfBytes, 0644)
	fmt.Printf("✓ PDF successfully generated (%d bytes)\n", len(pdfBytes))
}
```

### Production Dockerfile for Go

```dockerfile
# Stage 1: Build Go application
FROM golang:1.24-bookworm AS builder
WORKDIR /app
COPY go.mod go.sum ./
RUN go mod download
COPY . .
RUN CGO_ENABLED=0 go build -o /app/server .

# Stage 2: Final runtime container
FROM debian:bookworm-slim
WORKDIR /app

# Install curl and download the native CLI binary
RUN apt-get update && apt-get install -y --no-install-recommends ca-certificates curl \
    && curl -L https://github.com/adilsoncruz/open-pdf-generator/releases/latest/download/pdf-generator-linux-amd64 \
       -o /usr/local/bin/pdf-generator \
    && chmod +x /usr/local/bin/pdf-generator \
    && rm -rf /var/lib/apt/lists/*

COPY templates/ /app/templates/
COPY --from=builder /app/server /app/server

EXPOSE 8080
CMD ["/app/server"]
```

---

## 3. Node.js / TypeScript

```typescript
import { spawn } from 'node:child_process';
import { promises as fs } from 'node:fs';

export async function generatePdf(templatePath: string, data: Record<string, unknown>): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const child = spawn('pdf-generator', ['generate', templatePath, '-d', '-', '-o', '-']);

    const chunks: Buffer[] = [];
    const errors: string[] = [];

    child.stdout.on('data', (chunk: Buffer) => chunks.push(chunk));
    child.stderr.on('data', (err: Buffer) => errors.push(err.toString()));

    child.on('close', (code) => {
      if (code === 0) {
        resolve(Buffer.concat(chunks));
      } else {
        reject(new Error(`PDF CLI failed with exit code ${code}: ${errors.join('')}`));
      }
    });

    child.on('error', reject);

    // Stream the data JSON directly to stdin
    child.stdin.write(JSON.stringify(data));
    child.stdin.end();
  });
}
```

---

## 4. Python (FastAPI / Django / Flask)

```python
import subprocess
import json
from pathlib import Path

def generate_pdf(template_path: str, data: dict) -> bytes:
    json_bytes = json.dumps(data).encode('utf-8')
    
    result = subprocess.run(
        ["pdf-generator", "generate", template_path, "-d", "-", "-o", "-"],
        input=json_bytes,
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        check=False
    )
    
    if result.returncode != 0:
        raise RuntimeError(f"PDF CLI error ({result.returncode}): {result.stderr.decode('utf-8')}")
        
    return result.stdout
```

---

## 5. C# (.NET)

```csharp
using System;
using System.Diagnostics;
using System.IO;
using System.Text.Json;
using System.Threading.Tasks;

public class PdfService
{
    public static async Task<byte[]> GeneratePdfAsync(string templatePath, object data)
    {
        var psi = new ProcessStartInfo
        {
            FileName = "pdf-generator",
            Arguments = $"generate \"{templatePath}\" -d - -o -",
            RedirectStandardInput = true,
            RedirectStandardOutput = true,
            RedirectStandardError = true,
            UseShellExecute = false,
            CreateNoWindow = true
        };

        using var process = new Process { StartInfo = psi };
        process.Start();

        string json = JsonSerializer.Serialize(data);
        await process.StandardInput.WriteAsync(json);
        process.StandardInput.Close();

        using var memoryStream = new MemoryStream();
        await process.StandardOutput.BaseStream.CopyToAsync(memoryStream);

        string stderr = await process.StandardError.ReadToEndAsync();
        await process.WaitForExitAsync();

        if (process.ExitCode != 0)
        {
            throw new Exception($"PDF Generation failed ({process.ExitCode}): {stderr}");
        }

        return memoryStream.ToArray();
    }
}
```

---

## 6. PHP

```php
<?php

function generatePdf(string $templatePath, array $data): string {
    $descriptorSpec = [
        0 => ["pipe", "r"], // stdin
        1 => ["pipe", "w"], // stdout
        2 => ["pipe", "w"]  // stderr
    ];

    $process = proc_open("pdf-generator generate " . escapeshellarg($templatePath) . " -d - -o -", $descriptorSpec, $pipes);

    if (is_resource($process)) {
        fwrite($pipes[0], json_encode($data));
        fclose($pipes[0]);

        $pdfBytes = stream_get_contents($pipes[1]);
        fclose($pipes[1]);

        $stderr = stream_get_contents($pipes[2]);
        fclose($pipes[2]);

        $returnCode = proc_close($process);

        if ($returnCode !== 0) {
            throw new Exception("PDF generation failed ($returnCode): " . $stderr);
        }

        return $pdfBytes;
    }

    throw new Exception("Unable to spawn pdf-generator process");
}
```
