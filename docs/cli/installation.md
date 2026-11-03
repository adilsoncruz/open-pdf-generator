# CLI Installation

The Open PDF Generator CLI can be executed via **Docker** (no host Java required), as a **Standalone JAR** (runs on JVM 17+), or compiled locally from source into a **GraalVM Native Image**.

::: tip Note on Native Binaries
Pre-compiled native binaries are not distributed as pre-built downloads. For environments without Java, use the official **Docker container** or build a native binary locally from source using GraalVM.
:::

---

## Option 1: Docker (Recommended — No Java on host)

The Docker image is the easiest and cleanest way to run the CLI from **Go, Node.js, Python, Ruby, or shell scripts** without installing a JVM on the host machine.

### Build Image Locally

```bash
# Clone the repository
git clone https://github.com/adilsoncruz/open-pdf-generator.git
cd open-pdf-generator

# Build CLI JAR and Docker container
./gradlew :tools:cli:shadowJar
docker build -t open-pdf-generator:cli tools/cli/
```

### Run via Docker

```bash
# File-based usage (mounting current directory)
docker run --rm -v "$PWD:/data" open-pdf-generator:cli \
  generate /data/invoice.json -d /data/data.json -o /data/invoice.pdf

# Piped usage (stream JSON in on stdin, PDF out on stdout)
cat data.json | docker run --rm -i \
  -v "$PWD/templates:/templates:ro" open-pdf-generator:cli \
  generate /templates/invoice.json -d - -o - > invoice.pdf
```

In piped mode (`-d -` and `-o -`), all logs are routed to `stderr`, leaving `stdout` pure binary PDF for piping.

---

## Option 2: Standalone JAR (Requires Java 17+)

If you already have Java 17 or 21 installed on your system, you can run the standalone fat JAR directly.

### Build the JAR from Source

```bash
git clone https://github.com/adilsoncruz/open-pdf-generator.git
cd open-pdf-generator
./gradlew :tools:cli:shadowJar
```

The executable JAR is generated at:
`tools/cli/build/libs/pdf-generator-cli-1.0.0.jar`

### Setup CLI Command

#### Method A: Create a Wrapper Script (Recommended)

Create `/usr/local/bin/pdf-generator`:

```bash
#!/bin/bash
java -jar /path/to/open-pdf-generator/tools/cli/build/libs/pdf-generator-cli-1.0.0.jar "$@"
```

Make it executable:

```bash
chmod +x /usr/local/bin/pdf-generator
```

#### Method B: Create a Shell Alias

Add to your `~/.zshrc` or `~/.bashrc`:

```bash
alias pdf-generator="java -jar /path/to/open-pdf-generator/tools/cli/build/libs/pdf-generator-cli-1.0.0.jar"
```

Then reload:

```bash
source ~/.zshrc # or source ~/.bashrc
```

---

## Option 3: Compile GraalVM Native Image (From Source)

For sub-millisecond execution without a JVM runtime, you can compile a native binary locally using GraalVM or the provided multi-stage Dockerfile:

```bash
# Build native image using Docker
docker build -f tools/cli/Dockerfile.native -t open-pdf-generator:native .

# Verify native build
docker run --rm open-pdf-generator:native version
```

---

## Verify Installation

Check that the CLI is working:

```bash
pdf-generator version
```

Expected output:

```
PDF Generator CLI v1.0.0
Core Library v1.0.0
```
