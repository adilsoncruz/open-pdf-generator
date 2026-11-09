# Uso em Outras Linguagens (Go, Node.js, Python, C#, PHP)

O Open PDF Generator foi projetado para ser consumido como um gerador universal de PDFs por qualquer stack de backend. Como a CLI aceita entrada por **stdin** e devolve o PDF binário por **stdout**, sua aplicação pode gerar documentos em milissegundos sem salvar arquivos temporários em disco.

::: tip Zero Java em Produção
Ao utilizar o **binário nativo standalone** (`pdf-generator-linux-amd64` / `darwin-arm64`) ou a imagem **Docker**, você não precisa instalar JDK nem JRE no servidor de aplicação.
:::

---

## 1. Padrões de Integração

Você pode integrar a CLI em seus serviços de duas formas:

| Padrão | Como funciona | Latência | Quando usar |
|---|---|---|---|
| **One-Shot (`generate`)** | Invoca o processo por documento via stdin/stdout | ~10–15 ms (nativo) | Scripts, cron jobs, APIs com tráfego padrão |
| **Daemon Residente (`serve`)** | Mantém um único processo aberto via NDJSON | < 1 ms por PDF | APIs de alto throughput (> 1.000 PDFs/minuto) |

---

## 2. Go (Golang)

### Exemplo Direto (One-Shot via stdin/stdout)

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
		return nil, fmt.Errorf("erro serializando json: %w", err)
	}

	// -d - lê JSON do stdin; -o - emite PDF binário no stdout
	cmd := exec.Command("pdf-generator", "generate", templatePath, "-d", "-", "-o", "-")
	cmd.Stdin = bytes.NewReader(jsonData)

	var stdout, stderr bytes.Buffer
	cmd.Stdout = &stdout
	cmd.Stderr = &stderr // Logs e diagnósticos são enviados para stderr

	if err := cmd.Run(); err != nil {
		return nil, fmt.Errorf("falha ao gerar pdf: %w, stderr: %s", err, stderr.String())
	}

	return stdout.Bytes(), nil
}

func main() {
	payload := map[string]any{
		"fatura": map[string]any{"numero": "INV-2026-100", "total": "550.00"},
		"cliente": map[string]any{"nome": "Empresa XPTO"},
	}

	pdfBytes, err := GeneratePDF("templates/invoice.json", payload)
	if err != nil {
		panic(err)
	}

	_ = os.WriteFile("fatura.pdf", pdfBytes, 0644)
	fmt.Printf("✓ PDF gerado com sucesso (%d bytes)\n", len(pdfBytes))
}
```

### Dockerfile de Produção para Go

```dockerfile
# Estágio 1: Build da aplicação Go
FROM golang:1.24-bookworm AS builder
WORKDIR /app
COPY go.mod go.sum ./
RUN go mod download
COPY . .
RUN CGO_ENABLED=0 go build -o /app/server .

# Estágio 2: Container final de runtime
FROM debian:bookworm-slim
WORKDIR /app

# Instalar curl e baixar o binário nativo da CLI
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

### Exemplo Direto com Streams (`child_process.spawn`)

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
        reject(new Error(`PDF CLI falhou com código ${code}: ${errors.join('')}`));
      }
    });

    child.on('error', reject);

    // Envia o JSON dos dados diretamente para o stdin do processo
    child.stdin.write(JSON.stringify(data));
    child.stdin.end();
  });
}

// Exemplo em rota Express:
// app.get('/fatura/:id', async (req, res) => {
//   const pdfBuffer = await generatePdf('./templates/invoice.json', { id: req.params.id });
//   res.contentType('application/pdf');
//   res.send(pdfBuffer);
// });
```

---

## 4. Python (FastAPI / Django / Flask)

### Exemplo com `subprocess.run`

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
        raise RuntimeError(f"Erro na CLI do PDF ({result.returncode}): {result.stderr.decode('utf-8')}")
        
    return result.stdout

# Exemplo de uso:
if __name__ == "__main__":
    data = {"cliente": {"nome": "Maria Silva"}, "total": 120.50}
    pdf_bytes = generate_pdf("templates/invoice.json", data)
    Path("fatura.pdf").write_bytes(pdf_bytes)
    print(f"✓ PDF gerado ({len(pdf_bytes)} bytes)")
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

        // Envia JSON para stdin
        string json = JsonSerializer.Serialize(data);
        await process.StandardInput.WriteAsync(json);
        process.StandardInput.Close();

        // Lê binário do stdout
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
            throw new Exception("Falha ao gerar PDF ($returnCode): " . $stderr);
        }

        return $pdfBytes;
    }

    throw new Exception("Não foi possível iniciar o processo pdf-generator");
}
```
