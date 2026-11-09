# Integración Multilenguaje (Go, Node.js, Python, C#, PHP)

La CLI de Open PDF Generator está diseñada para funcionar como un motor universal de generación de PDFs para cualquier stack de backend. Al admitir entrada por **stdin** y salida binaria directa por **stdout**, su aplicación puede generar documentos en milisegundos sin necesidad de guardar archivos temporales en disco.

::: tip Cero Dependencia de Java en el Host
Al utilizar el **binario nativo autónomo** (`pdf-generator-linux-amd64` / `darwin-arm64`) o el contenedor **Docker**, no es necesario instalar JDK ni JRE en su servidor de aplicaciones.
:::

---

## 1. Patrones de Integración

Puede integrar la CLI en sus servicios mediante dos patrones:

| Patrón | Cómo funciona | Latencia | Cuándo usar |
|---|---|---|---|
| **One-Shot (`generate`)** | Invoca un proceso por documento vía stdin/stdout | ~10–15 ms (nativo) | Scripts, tareas cron, APIs con tráfico estándar |
| **Daemon Residente (`serve`)** | Mantiene un único proceso abierto mediante tuberías NDJSON | < 1 ms por PDF | APIs de alto rendimiento (> 1.000 PDFs/minuto) |

---

## 2. Go (Golang)

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
		return nil, fmt.Errorf("error serializando json: %w", err)
	}

	// -d - lee JSON de stdin; -o - emite PDF binario en stdout
	cmd := exec.Command("pdf-generator", "generate", templatePath, "-d", "-", "-o", "-")
	cmd.Stdin = bytes.NewReader(jsonData)

	var stdout, stderr bytes.Buffer
	cmd.Stdout = &stdout
	cmd.Stderr = &stderr // Registros y diagnósticos van a stderr

	if err := cmd.Run(); err != nil {
		return nil, fmt.Errorf("error al generar pdf: %w, stderr: %s", err, stderr.String())
	}

	return stdout.Bytes(), nil
}

func main() {
	payload := map[string]any{
		"factura": map[string]any{"numero": "INV-2026-100", "total": "550.00"},
		"cliente": map[string]any{"nombre": "Empresa XYZ"},
	}

	pdfBytes, err := GeneratePDF("templates/invoice.json", payload)
	if err != nil {
		panic(err)
	}

	_ = os.WriteFile("factura.pdf", pdfBytes, 0644)
	fmt.Printf("✓ PDF generado correctamente (%d bytes)\n", len(pdfBytes))
}
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
        reject(new Error(`PDF CLI falló con código ${code}: ${errors.join('')}`));
      }
    });

    child.on('error', reject);

    // Enviar JSON directamente a stdin
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
        raise RuntimeError(f"Error en CLI PDF ({result.returncode}): {result.stderr.decode('utf-8')}")
        
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
            throw new Exception($"Generación de PDF falló ({process.ExitCode}): {stderr}");
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
            throw new Exception("Error al generar PDF ($returnCode): " . $stderr);
        }

        return $pdfBytes;
    }

    throw new Exception("No fue posible iniciar el proceso pdf-generator");
}
```
