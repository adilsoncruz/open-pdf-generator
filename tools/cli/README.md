# PDF Generator CLI

Command-line interface for generating PDFs from JSON templates.

## Installation

### From JitPack

```bash
# Download the latest release
curl -L https://jitpack.io/com/github/user/open-pdf-generator/cli/1.0.0/cli-1.0.0.jar -o pdf-generator-cli.jar

# Make it executable (optional)
alias pdf-generator="java -jar pdf-generator-cli.jar"
```

### From Source

```bash
cd tools/cli
../gradlew shadowJar
java -jar build/libs/pdf-generator-cli-1.0.0.jar
```

### Docker (for Go, Node.js and any other host language)

The CLI image can be consumed from any application that can spawn a process:

```bash
# Build from the repository root
docker build -t open-pdf-generator:cli tools/cli/

# Mounted workdir
docker run --rm -v "$PWD:/data" open-pdf-generator:cli \
  generate /data/invoice.json -d /data/data.json -o /data/invoice.pdf

# Piped: JSON via stdin, PDF via stdout — needs only the templates mounted
cat data.json | docker run --rm -i \
  -v "$PWD/templates:/templates:ro" open-pdf-generator:cli \
  generate /templates/invoice.json -d - -o - > invoice.pdf
```

> `-d -` reads data from stdin and `-o -` streams the PDF to stdout. Logs go to stderr
> and informational messages are suppressed in streaming mode.

<details>
<summary><b>Go example</b></summary>

```go
cmd := exec.Command("docker", "run", "--rm", "-i",
    "-v", tplDir+":/templates:ro", "open-pdf-generator:cli",
    "generate", "/templates/invoice.json", "-d", "-", "-o", "-")
cmd.Stdin = strings.NewReader(dataJSON)
var pdf bytes.Buffer
cmd.Stdout = &pdf
if err := cmd.Run(); err != nil { /* handle */ }
```
</details>

<details>
<summary><b>Node.js example</b></summary>

```js
const { spawn } = require("node:child_process");

const child = spawn("docker", ["run", "--rm", "-i",
  "-v", `${tplDir}:/templates:ro`, "open-pdf-generator:cli",
  "generate", "/templates/invoice.json", "-d", "-", "-o", "-"],
  { stdio: ["pipe", "pipe", "inherit"] });

child.stdin.end(JSON.stringify(data));
const chunks = [];
child.stdout.on("data", (chunk) => chunks.push(chunk));
child.on("close", (code) => {
  if (code !== 0) throw new Error(`CLI exited with ${code}`);
  fs.writeFileSync("invoice.pdf", Buffer.concat(chunks));
});
```
</details>

### Native binary (GraalVM, no JVM)

The JVM container pays one JVM start per document (~250 ms even for a one-page
invoice). The GraalVM native image removes the JVM entirely and keeps the exact same
templates and CLI flags:

```bash
# Build from the repository root — compiles the binary, takes several minutes
docker build -f tools/cli/Dockerfile.native -t open-pdf-generator:native .
# or: make cli-native

docker run --rm open-pdf-generator:native version

cat data.json | docker run --rm -i \
  -v "$PWD/templates:/templates:ro" open-pdf-generator:native \
  generate /templates/invoice.json -d - -o - > invoice.pdf
```

| | `open-pdf-generator:cli` | `open-pdf-generator:native` |
|---|---|---|
| Start-up per document | ~250 ms (JVM boot) | **~10–20 ms** |
| Image size | ~334 MB | ~214 MB |
| Java on host | not needed | not needed |
| Runtime deps | JRE in image | static binary in Debian slim |

The native binary is built in three stages: fat JAR → tracing agent + generated
`reflect-config.json` (Gson) → `native-image --no-fallback`. It supports every command
(`generate`, `validate`, `convert`, `version`) and the same PDF output — including
barcodes, which the core renders as raw 1-bit images instead of AWT.

> Rebuild the native image after changing the core library or CLI: the binary embeds
> both. See `benchmark/multi-lang/` for measured numbers.

### Warm process mode (`serve`)

For an API that renders one PDF per request, start the process **once** and send
newline-delimited JSON. A request is still a single PDF — it just stops paying
start-up, template parsing and font initialisation per document.

```bash
docker run --rm -i -v "$PWD/templates:/templates:ro" \
  open-pdf-generator:native serve --preload /templates/invoice.json
```

```
--> {"id":1,"template":"/templates/invoice.json","data":{"invoiceNumber":"INV-001"}}
<-- {"id":1,"ok":true,"bytes":2537,"ms":0.41,"pdf":"JVBERi0xLjQK..."}
<-- {"id":2,"ok":false,"error":"Template not found: '/templates/nope.json'"}
```

```js
// Node.js — one pipe, one response per request
child.stdin.write(JSON.stringify({ id: 1, template: "/templates/invoice.json", data }) + "\n");
const line = await nextLine(child.stdout);
const pdf = Buffer.from(JSON.parse(line).pdf, "base64");
```

| Mode | p50 per invoice | Notes |
|---|---|---|
| `serve` (resident, NDJSON) | **0.4 ms** | no start-up at all; sequential requests |
| native binary, one process per doc | 12 ms | start-up per document |
| JVM CLI, one process per doc | 263 ms | JVM boot per document |

`serve` writes errors per request (`ok:false`) and keeps running; `--verbose` logs each
request and its timing to stderr. Add `"outputPath"` to a request to write the PDF to a
file instead of receiving it base64-encoded.

## Usage

### Generate PDF

```bash
# Basic usage
pdf-generator generate template.json

# With data file
pdf-generator generate template.json -d data.json

# Specify output file
pdf-generator generate template.json -d data.json -o invoice.pdf

# Pipe data in and PDF out
cat data.json | pdf-generator generate template.json -d - -o - > invoice.pdf
```

### Validate Template

```bash
pdf-generator validate template.json
```

### Convert Jasper (JRXML -> JSON)

```bash
# Save converted template to file
pdf-generator convert invoice.jrxml -o invoice-template.json

# Print converted template to stdout
pdf-generator convert invoice.jrxml --stdout
```

### Version

```bash
pdf-generator version
```

## Examples

### Invoice Generation

```bash
pdf-generator generate examples/invoice-template.json \
  -d examples/invoice-data.json \
  -o invoice.pdf
```

### Report with Multiple Pages

```bash
pdf-generator generate examples/report-template.json \
  -d examples/report-data.json \
  -o report.pdf
```

## Exit Codes

- `0` - Success
- `1` - Error (invalid template, missing file, etc.)

## Development

```bash
# Run in development
../gradlew run --args="generate template.json"

# Run tests
../gradlew test

# Build fat JAR
../gradlew shadowJar
```

## License

LGPL-3.0


