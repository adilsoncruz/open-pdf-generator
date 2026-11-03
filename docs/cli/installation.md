# CLI Installation

The Open PDF Generator CLI is available in three formats: **Standalone Native Binary** (GraalVM, zero Java required), **Docker Container**, and **Standalone JAR** (JVM 17+).

---

## Option 1: Standalone Native Binary (Recommended — Zero Java)

Pre-compiled GraalVM native binary with instant startup (~10 ms) and zero runtime dependencies:

### Direct Download (GitHub Releases)

::: code-group

```bash [Linux (x86_64)]
# Download and install to /usr/local/bin
curl -L https://github.com/adilsoncruz/open-pdf-generator/releases/latest/download/pdf-generator-linux-amd64 \
  -o /usr/local/bin/pdf-generator
chmod +x /usr/local/bin/pdf-generator

# Verify
pdf-generator version
```

```bash [macOS (Apple Silicon arm64)]
# Download and install to /usr/local/bin
curl -L https://github.com/adilsoncruz/open-pdf-generator/releases/latest/download/pdf-generator-darwin-arm64 \
  -o /usr/local/bin/pdf-generator
chmod +x /usr/local/bin/pdf-generator

# Verify
pdf-generator version
```

```powershell [Windows (x86_64)]
# Download via PowerShell
Invoke-WebRequest -Uri "https://github.com/adilsoncruz/open-pdf-generator/releases/latest/download/pdf-generator-windows-amd64.exe" -OutFile "pdf-generator.exe"

# Verify
.\pdf-generator.exe version
```

:::

### In Production Dockerfiles (Go, Node.js, Python, Ruby)

```dockerfile
# Download directly into any container — zero Java dependencies
RUN curl -L https://github.com/adilsoncruz/open-pdf-generator/releases/latest/download/pdf-generator-linux-amd64 \
    -o /usr/local/bin/pdf-generator && chmod +x /usr/local/bin/pdf-generator
```

---

## Option 2: Docker Container

For fully isolated execution or CI/CD pipelines:

```bash
# File-based usage (mounted directory)
docker run --rm -v "$PWD:/data" open-pdf-generator:cli \
  generate /data/invoice.json -d /data/data.json -o /data/invoice.pdf

# Piped usage (stream stdin to stdout)
cat data.json | docker run --rm -i \
  -v "$PWD/templates:/templates:ro" open-pdf-generator:cli \
  generate /templates/invoice.json -d - -o - > invoice.pdf
```

---

## Option 3: Standalone JAR (Requires Java 17+)

If you already have Java 17+ installed on your system:

```bash
# Download the standalone fat JAR
curl -L https://github.com/adilsoncruz/open-pdf-generator/releases/latest/download/pdf-generator-cli-1.0.0.jar \
  -o pdf-generator-cli.jar

# Run directly
java -jar pdf-generator-cli.jar generate template.json -d data.json -o output.pdf
```

### Create a Wrapper Script

```bash
#!/bin/bash
java -jar /path/to/pdf-generator-cli.jar "$@"
```

```bash
chmod +x /usr/local/bin/pdf-generator
```

---

## Build from Source

```bash
# Clone the repository
git clone https://github.com/adilsoncruz/open-pdf-generator.git
cd open-pdf-generator

# Build CLI Fat JAR
./gradlew :tools:cli:shadowJar

# Build GraalVM native image via Docker
docker build -f tools/cli/Dockerfile.native -t open-pdf-generator:native .
```
