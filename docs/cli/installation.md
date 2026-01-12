# Installation

## Download

### From GitHub Releases

Download the latest release from GitHub:

```bash
curl -L https://github.com/adilsoncruz/open-pdf-generator/releases/latest/download/pdf-generator-cli.jar \
  -o pdf-generator-cli.jar
```

### From JitPack

```bash
curl -L https://jitpack.io/com/github/user/open-pdf-generator/cli/1.0.0/cli-1.0.0.jar \
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



