# Instalación de la CLI

La CLI de Open PDF Generator está disponible en tres formatos: **Binario Nativo Autónomo** (GraalVM, sin necesidad de Java), **Contenedor Docker** y **JAR Autónomo** (JVM 17+).

---

## Opción 1: Binario Nativo Autónomo (Recomendado — Cero Java)

Ejecutable autónomo precompilado con GraalVM, inicio instantáneo (~10 ms) y sin dependencias de Java:

### Descarga Directa (GitHub Releases)

::: code-group

```bash [Linux (x86_64)]
# Descargar e instalar en /usr/local/bin
curl -L https://github.com/adilsoncruz/open-pdf-generator/releases/latest/download/pdf-generator-linux-amd64 \
  -o /usr/local/bin/pdf-generator
chmod +x /usr/local/bin/pdf-generator

# Verificar
pdf-generator version
```

```bash [macOS (Apple Silicon arm64)]
# Descargar e instalar en /usr/local/bin
curl -L https://github.com/adilsoncruz/open-pdf-generator/releases/latest/download/pdf-generator-darwin-arm64 \
  -o /usr/local/bin/pdf-generator
chmod +x /usr/local/bin/pdf-generator

# Verificar
pdf-generator version
```

```powershell [Windows (x86_64)]
# Descargar mediante PowerShell
Invoke-WebRequest -Uri "https://github.com/adilsoncruz/open-pdf-generator/releases/latest/download/pdf-generator-windows-amd64.exe" -OutFile "pdf-generator.exe"

# Verificar
.\pdf-generator.exe version
```

:::

### Uso en Dockerfile de Producción (Go, Node.js, Python, Ruby)

```dockerfile
# Descarga directa en el contenedor sin instalar Java
RUN curl -L https://github.com/adilsoncruz/open-pdf-generator/releases/latest/download/pdf-generator-linux-amd64 \
    -o /usr/local/bin/pdf-generator && chmod +x /usr/local/bin/pdf-generator
```

---

## Opción 2: Contenedor Docker

Para ejecución aislada o integración en pipelines CI/CD:

```bash
# Uso con archivos montados
docker run --rm -v "$PWD:/data" open-pdf-generator:cli \
  generate /data/invoice.json -d /data/data.json -o /data/invoice.pdf

# Uso vía Pipe (stdin -> stdout)
cat data.json | docker run --rm -i \
  -v "$PWD/templates:/templates:ro" open-pdf-generator:cli \
  generate /templates/invoice.json -d - -o - > invoice.pdf
```

---

## Opción 3: JAR Autónomo (JVM 17+)

Si ya dispone de Java 17+ instalado:

```bash
# Descargar el JAR del release
curl -L https://github.com/adilsoncruz/open-pdf-generator/releases/latest/download/pdf-generator-cli-1.0.0.jar \
  -o pdf-generator-cli.jar

# Ejecutar
java -jar pdf-generator-cli.jar generate template.json -d data.json -o output.pdf
```

---

## Compilar desde el Código Fuente

```bash
# Clonar el repositorio
git clone https://github.com/adilsoncruz/open-pdf-generator.git
cd open-pdf-generator

# Generar JAR de la CLI
./gradlew :tools:cli:shadowJar

# Compilar imagen nativa GraalVM con Docker
docker build -f tools/cli/Dockerfile.native -t open-pdf-generator:native .
```
