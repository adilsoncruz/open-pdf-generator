# Instalação da CLI

A CLI do Open PDF Generator está disponível em três formatos principais: **Binário Nativo Standalone** (GraalVM, sem Java), **Container Docker** e **JAR Standalone** (JVM 17+).

---

## Opção 1: Binário Nativo Standalone (Recomendado — Zero Java)

Executável autônomo compilado com GraalVM. Não requer Java nem runtime instalado no host, com inicialização instantânea (~10 ms):

### Download Direto (GitHub Releases)

::: code-group

```bash [Linux (x86_64)]
# Baixar e instalar no /usr/local/bin
curl -L https://github.com/adilsoncruz/open-pdf-generator/releases/latest/download/pdf-generator-linux-amd64 \
  -o /usr/local/bin/pdf-generator
chmod +x /usr/local/bin/pdf-generator

# Verificar instalação
pdf-generator version
```

```bash [macOS (Apple Silicon arm64)]
# Baixar e instalar no /usr/local/bin
curl -L https://github.com/adilsoncruz/open-pdf-generator/releases/latest/download/pdf-generator-darwin-arm64 \
  -o /usr/local/bin/pdf-generator
chmod +x /usr/local/bin/pdf-generator

# Verificar instalação
pdf-generator version
```

```powershell [Windows (x86_64)]
# Baixar via PowerShell
Invoke-WebRequest -Uri "https://github.com/adilsoncruz/open-pdf-generator/releases/latest/download/pdf-generator-windows-amd64.exe" -OutFile "pdf-generator.exe"

# Verificar instalação
.\pdf-generator.exe version
```

:::

### Uso em Dockerfile de Aplicações (Go, Node.js, Python, Ruby)

```dockerfile
# Baixe diretamente no seu container de produção — sem instalar Java
RUN curl -L https://github.com/adilsoncruz/open-pdf-generator/releases/latest/download/pdf-generator-linux-amd64 \
    -o /usr/local/bin/pdf-generator && chmod +x /usr/local/bin/pdf-generator
```

---

## Opção 2: Container Docker Oficial

Para isolamento completo de ambiente ou execução em pipelines CI/CD:

```bash
# Execução baseada em arquivos montados
docker run --rm -v "$PWD:/data" open-pdf-generator:cli \
  generate /data/invoice.json -d /data/data.json -o /data/invoice.pdf

# Execução via Pipe (stdin -> stdout)
cat data.json | docker run --rm -i \
  -v "$PWD/templates:/templates:ro" open-pdf-generator:cli \
  generate /templates/invoice.json -d - -o - > invoice.pdf
```

---

## Opção 3: JAR Standalone (JVM 17+)

Se você já possui o Java 17 ou 21 instalado:

```bash
# Baixar o JAR do release
curl -L https://github.com/adilsoncruz/open-pdf-generator/releases/latest/download/pdf-generator-cli-1.0.0.jar \
  -o pdf-generator-cli.jar

# Executar
java -jar pdf-generator-cli.jar generate template.json -d data.json -o output.pdf
```

### Criar Wrapper em `/usr/local/bin/pdf-generator`

```bash
#!/bin/bash
java -jar /caminho/para/pdf-generator-cli.jar "$@"
```

```bash
chmod +x /usr/local/bin/pdf-generator
```

---

## Compilar a Partir do Código-Fonte

```bash
# Clonar repositório
git clone https://github.com/adilsoncruz/open-pdf-generator.git
cd open-pdf-generator

# Gerar JAR Fat da CLI
./gradlew :tools:cli:shadowJar

# Compilar imagem nativa GraalVM via Docker
docker build -f tools/cli/Dockerfile.native -t open-pdf-generator:native .
```
