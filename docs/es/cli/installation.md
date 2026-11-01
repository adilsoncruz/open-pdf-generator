# Instalación

## Binario Nativo Standalone (Recomendado — Sin necesidad de Java)

Descarga el ejecutable precompilado GraalVM para inicio instantáneo (~10 ms), sin requerir Java ni Docker:

```bash
# Linux x86_64
curl -L https://github.com/adilsoncruz/open-pdf-generator/releases/latest/download/pdf-generator-linux-amd64 \
  -o /usr/local/bin/pdf-generator
chmod +x /usr/local/bin/pdf-generator

# Verificar instalación
pdf-generator version
```

En el `Dockerfile` de tu aplicación (Go, Node.js, Python):

```dockerfile
# Descarga directa dentro del contenedor — sin Java
RUN curl -L https://github.com/adilsoncruz/open-pdf-generator/releases/latest/download/pdf-generator-linux-amd64 \
    -o /usr/local/bin/pdf-generator && chmod +x /usr/local/bin/pdf-generator
```

---

## JAR Standalone (Requiere Java 17+)

Si prefieres ejecutar en la JVM:

```bash
curl -L https://github.com/adilsoncruz/open-pdf-generator/releases/latest/download/pdf-generator-cli.jar \
  -o pdf-generator-cli.jar
```

## Configuración

### Opción 1: Crear un Alias

Agrega a tu `~/.zshrc` o `~/.bashrc`:

```bash
alias pdf-generator="java -jar /path/to/pdf-generator-cli.jar"
```

Luego recarga:

```bash
source ~/.zshrc
```

### Opción 2: Crear un Script Wrapper

Crea `/usr/local/bin/pdf-generator`:

```bash
#!/bin/bash
java -jar /path/to/pdf-generator-cli.jar "$@"
```

Hazlo ejecutable:

```bash
chmod +x /usr/local/bin/pdf-generator
```

### Opción 3: Instalar en el Directorio Home

```bash
mkdir -p ~/.pdf-generator
mv pdf-generator-cli.jar ~/.pdf-generator/
echo 'alias pdf-generator="java -jar ~/.pdf-generator/pdf-generator-cli.jar"' >> ~/.zshrc
source ~/.zshrc
```

## Verificar la Instalación

```bash
pdf-generator version
```

Salida esperada:

```
PDF Generator CLI v1.0.0
Core Library v1.0.0
```

## Compilar desde el Código Fuente

```bash
git clone https://github.com/adilsoncruz/open-pdf-generator.git
cd open-pdf-generator/tools/cli
../../gradlew shadowJar
```

El JAR estará en `build/libs/pdf-generator-cli-1.0.0.jar`.
