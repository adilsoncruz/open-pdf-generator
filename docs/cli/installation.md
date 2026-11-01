# Installation

## Standalone Native Binary (Recommended — No Java required)

Download the pre-compiled GraalVM native binary for instant start-up (~10 ms) without needing Java or Docker:

```bash
# Linux x86_64
curl -L https://github.com/adilsoncruz/open-pdf-generator/releases/latest/download/pdf-generator-linux-amd64 \
  -o /usr/local/bin/pdf-generator
chmod +x /usr/local/bin/pdf-generator

# Verify
pdf-generator version
```

In your application's `Dockerfile` (Go, Node.js, Python, Ruby):

```dockerfile
# Download directly into any Debian/Ubuntu container — zero Java dependencies
RUN curl -L https://github.com/adilsoncruz/open-pdf-generator/releases/latest/download/pdf-generator-linux-amd64 \
    -o /usr/local/bin/pdf-generator && chmod +x /usr/local/bin/pdf-generator
```

---

## Java Standalone JAR (Requires Java 17+)

If you prefer running on the JVM:

```bash
curl -L https://github.com/adilsoncruz/open-pdf-generator/releases/latest/download/pdf-generator-cli.jar \
  -o pdf-generator-cli.jar
```

## Setup

### Option 1: Create an Alias

Add to your `~/.zshrc` or `~/.bashrc`:

```bash
alias pdf-generator="java -jar /path/to/pdf-generator-cli.jar"
```

Then reload:

```bash
source ~/.zshrc
```

### Option 2: Create a Wrapper Script

Create `/usr/local/bin/pdf-generator`:

```bash
#!/bin/bash
java -jar /path/to/pdf-generator-cli.jar "$@"
```

Make it executable:

```bash
chmod +x /usr/local/bin/pdf-generator
```

### Option 3: Install to Home Directory

```bash
mkdir -p ~/.pdf-generator
mv pdf-generator-cli.jar ~/.pdf-generator/
echo 'alias pdf-generator="java -jar ~/.pdf-generator/pdf-generator-cli.jar"' >> ~/.zshrc
source ~/.zshrc
```

### Option 4: Docker

The image is the easiest way to consume the CLI from **Go, Node.js, Python or any other
language** — no JVM on the host and no version drift between services.

```bash
# Build from the repository root
docker build -t open-pdf-generator:cli tools/cli/

# File-based usage (mounted workdir)
docker run --rm -v "$PWD:/data" open-pdf-generator:cli \
  generate /data/invoice.json -d /data/data.json -o /data/invoice.pdf

# Piped usage — JSON in on stdin, PDF out on stdout (no volume needed)
cat data.json | docker run --rm -i \
  -v "$PWD/templates:/templates:ro" open-pdf-generator:cli \
  generate /templates/invoice.json -d - -o - > invoice.pdf
```

<Note>
`-d -` reads the data payload from stdin and `-o -` streams the PDF to stdout. All
informational output is suppressed (and logs go to stderr) in streaming mode, so the
binary stream stays clean.
</Note>

### Option 5: Native Binary (GraalVM)

A `java -jar` invocation starts a JVM per document (~250 ms). If you call the CLI once
per request — the common case for an API that renders one PDF per call — build the
native image instead: same templates, same flags, **no JVM**, ~10–20 ms per document.

```bash
# Build from the repository root (several minutes: native-image compilation)
docker build -f tools/cli/Dockerfile.native -t open-pdf-generator:native .
# or: make cli-native

docker run --rm open-pdf-generator:native version

# Piped usage — identical to the JVM image
cat data.json | docker run --rm -i \
  -v "$PWD/templates:/templates:ro" open-pdf-generator:native \
  generate /templates/invoice.json -d - -o - > invoice.pdf
```

| | `open-pdf-generator:cli` (JVM) | `open-pdf-generator:native` |
|---|---|---|
| Start-up per document | ~250 ms | ~10–20 ms |
| Image size | ~334 MB | ~214 MB |
| Java on host | not needed | not needed |

The binary embeds the core library and the CLI, so rebuild it whenever either changes.
Numbers and methodology: [Multi-language benchmark](/lib/benchmark-multilang).

For an API that renders one PDF per request, add `serve` to keep the process warm:

```bash
docker run --rm -i -v "$PWD/templates:/templates:ro" \
  open-pdf-generator:native serve --preload /templates/invoice.json
# then write one NDJSON request per line on stdin and read one response per line
```

Measured at **0.4 ms per invoice** versus 12 ms for one process per document and 263 ms
for the JVM CLI — see the [benchmark](/lib/benchmark-multilang).

## Verify Installation

```bash
pdf-generator version
```

Expected output:

```
PDF Generator CLI v1.0.0
Core Library v1.0.0
```

## Build from Source

```bash
git clone https://github.com/adilsoncruz/open-pdf-generator.git
cd open-pdf-generator/tools/cli
../../gradlew shadowJar
```

The JAR will be at `build/libs/pdf-generator-cli-1.0.0.jar`.



