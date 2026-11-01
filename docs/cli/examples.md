# Examples

## Basic Invoice Generation

### Template (`invoice-template.json`)

```json
{
  "page": {
    "format": "A4",
    "orientation": "portrait",
    "margins": { "top": 20, "right": 20, "bottom": 20, "left": 20 }
  },
  "body": {
    "elements": [
      {
        "type": "text",
        "x": 10,
        "y": 10,
        "text": "Invoice #{{invoiceNumber}}",
        "fontSize": 24,
        "fontWeight": "bold"
      },
      {
        "type": "text",
        "x": 10,
        "y": 40,
        "text": "Customer: {{customer.name}}"
      },
      {
        "type": "text",
        "x": 10,
        "y": 55,
        "text": "Date: {{date}}"
      }
    ]
  }
}
```

### Data (`invoice-data.json`)

```json
{
  "invoiceNumber": "INV-2025-001",
  "customer": {
    "name": "Acme Corporation",
    "email": "billing@acme.com"
  },
  "date": "2025-01-07"
}
```

### Command

```bash
pdf-generator generate invoice-template.json -d invoice-data.json -o invoice.pdf
```

## Batch Processing

Generate multiple invoices from a list:

```bash
#!/bin/bash

for i in {1..10}; do
  # Generate data file
  cat > /tmp/data-$i.json << EOF
{
  "invoiceNumber": "INV-2025-$(printf '%03d' $i)",
  "customer": { "name": "Customer $i" },
  "date": "$(date +%Y-%m-%d)"
}
EOF

  # Generate PDF
  pdf-generator generate invoice-template.json \
    -d /tmp/data-$i.json \
    -o invoices/invoice-$i.pdf
done
```

## CI/CD Integration

### GitHub Actions

```yaml
name: Generate Reports

on:
  schedule:
    - cron: '0 8 * * 1'  # Every Monday at 8am

jobs:
  generate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Java
        uses: actions/setup-java@v4
        with:
          java-version: '17'
          distribution: 'temurin'
      
      - name: Download CLI
        run: |
          curl -L https://github.com/adilsoncruz/open-pdf-generator/releases/latest/download/pdf-generator-cli.jar \
            -o pdf-generator-cli.jar
      
      - name: Generate Report
        run: |
          java -jar pdf-generator-cli.jar generate \
            templates/weekly-report.json \
            -d data/report-data.json \
            -o reports/weekly-report.pdf
      
      - name: Upload Artifact
        uses: actions/upload-artifact@v4
        with:
          name: weekly-report
          path: reports/weekly-report.pdf
```

### Docker

```dockerfile
FROM eclipse-temurin:17-jre-alpine

WORKDIR /app

# Download CLI
RUN wget -O pdf-generator-cli.jar \
    https://github.com/adilsoncruz/open-pdf-generator/releases/latest/download/pdf-generator-cli.jar

# Copy templates
COPY templates/ /app/templates/

ENTRYPOINT ["java", "-jar", "pdf-generator-cli.jar"]
```

Usage:

```bash
docker build -t pdf-generator .
docker run -v $(pwd)/output:/app/output pdf-generator \
  generate templates/invoice.json -d data.json -o output/invoice.pdf
```

## Validation in Pre-commit Hook

`.git/hooks/pre-commit`:

```bash
#!/bin/bash

# Validate all template files before commit
for file in $(git diff --cached --name-only | grep '\.json$'); do
  if [[ $file == templates/* ]]; then
    echo "Validating $file..."
    java -jar ~/.pdf-generator/pdf-generator-cli.jar validate "$file"
    if [ $? -ne 0 ]; then
      echo "❌ Template validation failed: $file"
      exit 1
    fi
  fi
done

echo "✅ All templates valid"
```

## Go Integration

### How to Add the CLI to your Go Project

#### Approach A: Multi-stage Dockerfile (Recommended for Production)

Copy the pre-compiled GraalVM native binary (~40 MB, no JVM needed) directly into your Go app's container:

```dockerfile
# Stage 1: Build your Go application
FROM golang:1.24-bookworm AS build
WORKDIR /app
COPY go.mod go.sum ./
RUN go mod download
COPY . .
RUN CGO_ENABLED=0 go build -o /out/api .

# Stage 2: Final runtime container
FROM debian:bookworm-slim
WORKDIR /app

# Copy the native pdf-generator binary directly from the official image
COPY --from=open-pdf-generator:native /usr/local/bin/pdf-generator /usr/local/bin/pdf-generator

# Copy your templates and Go binary
COPY templates/ /app/templates/
COPY --from=build /out/api /app/api

CMD ["/app/api"]
```

Now your Go code simply calls `"pdf-generator"` locally within the container!

---

#### Approach B: Calling via `docker run` directly from Go

If you are running Go on your host machine without containerizing the app itself:

```go
// Calls the container directly — no local installation needed
cmd := exec.Command("docker", "run", "--rm", "-i",
    "-v", "/absolute/path/to/templates:/templates:ro",
    "open-pdf-generator:native",
    "generate", "/templates/invoice.json", "-d", "-", "-o", "-")
```

---

### Option 1: Resident Daemon Client (`serve` — Recommended: ~0.6 ms per PDF)

A complete, runnable `main.go` client that starts `pdf-generator serve` in the background and sends requests over NDJSON pipes:

```go
package main

import (
	"bufio"
	"encoding/base64"
	"encoding/json"
	"fmt"
	"io"
	"os"
	"os/exec"
	"sync"
	"time"
)

// PDFClient manages a long-lived resident `pdf-generator serve` process.
type PDFClient struct {
	cmd     *exec.Cmd
	stdin   io.WriteCloser
	scanner *bufio.Scanner
	mu      sync.Mutex
	reqID   int
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
	PDF   string  `json:"pdf"` // Base64 encoded payload
	Error string  `json:"error,omitempty"`
}

func NewPDFClient(cliBinPath string) (*PDFClient, error) {
	cmd := exec.Command(cliBinPath, "serve")
	stdin, err := cmd.StdinPipe()
	if err != nil {
		return nil, fmt.Errorf("stdin pipe error: %w", err)
	}
	stdout, err := cmd.StdoutPipe()
	if err != nil {
		return nil, fmt.Errorf("stdout pipe error: %w", err)
	}
	cmd.Stderr = os.Stderr // Logs and readiness written to stderr

	if err := cmd.Start(); err != nil {
		return nil, fmt.Errorf("failed to start serve: %w", err)
	}

	scanner := bufio.NewScanner(stdout)
	// Buffer up to 64MB for large PDF responses
	buf := make([]byte, 1024*1024)
	scanner.Buffer(buf, 64*1024*1024)

	return &PDFClient{
		cmd:     cmd,
		stdin:   stdin,
		scanner: scanner,
	}, nil
}

func (c *PDFClient) Generate(templatePath string, data map[string]any) ([]byte, error) {
	c.mu.Lock()
	defer c.mu.Unlock()

	c.reqID++
	req := serveRequest{
		ID:       c.reqID,
		Template: templatePath,
		Data:     data,
	}

	reqBytes, err := json.Marshal(req)
	if err != nil {
		return nil, fmt.Errorf("marshal request error: %w", err)
	}
	reqBytes = append(reqBytes, '\n')

	if _, err := c.stdin.Write(reqBytes); err != nil {
		return nil, fmt.Errorf("stdin write error: %w", err)
	}

	if !c.scanner.Scan() {
		if err := c.scanner.Err(); err != nil {
			return nil, fmt.Errorf("scanner error: %w", err)
		}
		return nil, fmt.Errorf("unexpected EOF from pdf-generator")
	}

	var resp serveResponse
	if err := json.Unmarshal(c.scanner.Bytes(), &resp); err != nil {
		return nil, fmt.Errorf("unmarshal response error: %w", err)
	}

	if !resp.OK {
		return nil, fmt.Errorf("pdf generation failed: %s", resp.Error)
	}

	pdfBytes, err := base64.StdEncoding.DecodeString(resp.PDF)
	if err != nil {
		return nil, fmt.Errorf("base64 decode error: %w", err)
	}
	return pdfBytes, nil
}

func (c *PDFClient) Close() error {
	if c.stdin != nil {
		_ = c.stdin.Close()
	}
	if c.cmd != nil && c.cmd.Process != nil {
		_ = c.cmd.Process.Kill()
		_ = c.cmd.Wait()
	}
	return nil
}

func main() {
	client, err := NewPDFClient("pdf-generator")
	if err != nil {
		panic(err)
	}
	defer client.Close()

	data := map[string]any{
		"invoiceNumber": "INV-2026-001",
		"customer": map[string]any{
			"name":  "Acme Corp",
			"email": "contact@acme.com",
		},
		"total": 1250.50,
	}

	start := time.Now()
	pdf, err := client.Generate("templates/invoice.json", data)
	if err != nil {
		panic(err)
	}

	if err := os.WriteFile("invoice.pdf", pdf, 0o644); err != nil {
		panic(err)
	}

	fmt.Printf("✓ Generated invoice.pdf (%d bytes) in %v\n", len(pdf), time.Since(start))
}
```

---

### Option 2: One-shot Execution (`generate` — Simple: ~10 ms per PDF)

A standalone `main.go` that runs one process per document without background daemons:

```go
package main

import (
	"bytes"
	"encoding/json"
	"fmt"
	"os"
	"os/exec"
	"time"
)

func GenerateOneShot(templatePath string, data any) ([]byte, error) {
	jsonData, err := json.Marshal(data)
	if err != nil {
		return nil, fmt.Errorf("marshal data error: %w", err)
	}

	// -d - reads JSON from stdin; -o - streams binary PDF to stdout
	cmd := exec.Command("pdf-generator", "generate", templatePath, "-d", "-", "-o", "-")
	cmd.Stdin = bytes.NewReader(jsonData)

	var stdout, stderr bytes.Buffer
	cmd.Stdout = &stdout
	cmd.Stderr = &stderr

	if err := cmd.Run(); err != nil {
		return nil, fmt.Errorf("generate failed: %w (stderr: %s)", err, stderr.String())
	}
	return stdout.Bytes(), nil
}

func main() {
	data := map[string]any{
		"invoiceNumber": "INV-2026-002",
		"customer": map[string]any{
			"name": "Global Tech",
		},
		"total": 450.00,
	}

	start := time.Now()
	pdf, err := GenerateOneShot("templates/invoice.json", data)
	if err != nil {
		panic(err)
	}

	if err := os.WriteFile("invoice-oneshot.pdf", pdf, 0o644); err != nil {
		panic(err)
	}

	fmt.Printf("✓ Generated invoice-oneshot.pdf (%d bytes) in %v\n", len(pdf), time.Since(start))
}
```

---

## Node.js Integration

### Option 1: Resident Daemon Client (`serve` — Recommended: ~0.6 ms per PDF)

A complete, runnable `generate.mjs` script with a promise-based client communicating over NDJSON:

```javascript
import { spawn } from 'node:child_process';
import readline from 'node:readline';
import { promises as fs } from 'node:fs';

export class PDFClient {
  constructor(cliBin = 'pdf-generator') {
    this.cliBin = cliBin;
    this.reqId = 0;
    this.pending = new Map();

    this.process = spawn(this.cliBin, ['serve']);
    this.process.stderr.on('data', (data) => {
      // Diagnostic logs from serve appear on stderr
    });

    this.rl = readline.createInterface({ input: this.process.stdout });
    this.rl.on('line', (line) => {
      if (!line.trim()) return;
      try {
        const res = JSON.parse(line);
        const resolver = this.pending.get(res.id);
        if (resolver) {
          this.pending.delete(res.id);
          if (res.ok) {
            resolver.resolve(Buffer.from(res.pdf, 'base64'));
          } else {
            resolver.reject(new Error(res.error || 'PDF generation failed'));
          }
        }
      } catch (err) {
        console.error('Failed to parse NDJSON line:', line, err);
      }
    });
  }

  generate(templatePath, data = {}) {
    return new Promise((resolve, reject) => {
      this.reqId++;
      const id = this.reqId;
      this.pending.set(id, { resolve, reject });

      const requestPayload = JSON.stringify({
        id,
        template: templatePath,
        data,
      }) + '\n';

      this.process.stdin.write(requestPayload);
    });
  }

  close() {
    this.process.stdin.end();
    this.process.kill();
  }
}

// Runnable example
async function main() {
  const client = new PDFClient('pdf-generator');

  try {
    const data = {
      invoiceNumber: 'INV-2026-003',
      customer: { name: 'Acme Node Corp', email: 'billing@node.org' },
      total: 890.00,
    };

    const start = performance.now();
    const pdfBuffer = await client.generate('templates/invoice.json', data);
    const elapsed = (performance.now() - start).toFixed(2);

    await fs.writeFile('invoice-node.pdf', pdfBuffer);
    console.log(`✓ Generated invoice-node.pdf (${pdfBuffer.length} bytes) in ${elapsed}ms`);
  } finally {
    client.close();
  }
}

main().catch(console.error);
```

---

### Option 2: One-shot Execution (`generate` — Simple: ~10 ms per PDF)

A standalone `generate-oneshot.mjs` script using `child_process.execFile`:

```javascript
import { execFile } from 'node:child_process';
import { promises as fs } from 'node:fs';

export function generateOneShot(templatePath, data, cliBin = 'pdf-generator') {
  return new Promise((resolve, reject) => {
    const child = execFile(
      cliBin,
      ['generate', templatePath, '-d', '-', '-o', '-'],
      { encoding: 'buffer', maxBuffer: 50 * 1024 * 1024 },
      (err, stdout, stderr) => {
        if (err) {
          return reject(new Error(stderr.toString() || err.message));
        }
        resolve(stdout);
      }
    );

    child.stdin.end(JSON.stringify(data));
  });
}

// Runnable example
async function main() {
  const data = {
    invoiceNumber: 'INV-2026-004',
    customer: { name: 'Fast Delivery Ltd' },
    total: 310.25,
  };

  const start = performance.now();
  const pdfBuffer = await generateOneShot('templates/invoice.json', data);
  const elapsed = (performance.now() - start).toFixed(2);

  await fs.writeFile('invoice-oneshot-node.pdf', pdfBuffer);
  console.log(`✓ Generated invoice-oneshot-node.pdf (${pdfBuffer.length} bytes) in ${elapsed}ms`);
}

main().catch(console.error);
```





