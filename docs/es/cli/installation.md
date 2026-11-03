# Instalación de la CLI

La CLI de Open PDF Generator se puede ejecutar mediante **Docker** (sin necesidad de Java en el host), como un **JAR Standalone** (requiere JVM 17+), o compilarse localmente desde el código fuente como un **Binario Nativo con GraalVM**.

::: tip Nota sobre Binarios Nativos
No distribuimos descargas directas de binarios nativos precompilados en las releases de GitHub. Para entornos sin Java, utilice el **contenedor Docker** oficial o compile el binario nativo localmente mediante GraalVM/Docker.
:::

---

## Opción 1: Docker (Recomendado — Sin Java en el host)

La imagen Docker es la forma más sencilla de utilizar la CLI desde **Go, Node.js, Python, Ruby o scripts bash**, sin instalar la JVM en su máquina host.

### Construir la Imagen Localmente

```bash
# Clonar el repositorio
git clone https://github.com/adilsoncruz/open-pdf-generator.git
cd open-pdf-generator

# Construir el JAR de la CLI y la imagen Docker
./gradlew :tools:cli:shadowJar
docker build -t open-pdf-generator:cli tools/cli/
```

### Ejecutar con Docker

```bash
# Uso basado en archivos (montando el directorio de trabajo)
docker run --rm -v "$PWD:/data" open-pdf-generator:cli \
  generate /data/invoice.json -d /data/data.json -o /data/invoice.pdf

# Uso mediante Pipe (JSON vía stdin, PDF hacia stdout)
cat data.json | docker run --rm -i \
  -v "$PWD/templates:/templates:ro" open-pdf-generator:cli \
  generate /templates/invoice.json -d - -o - > invoice.pdf
```

En modo pipe (`-d -` y `-o -`), la salida informativa se redirige a `stderr`, dejando `stdout` exclusivamente con el flujo binario del PDF.

---

## Opción 2: JAR Standalone (Requiere Java 17+)

Si ya tiene Java 17 o 21 instalado en su entorno, puede ejecutar directamente el JAR standalone.

### Compilar el JAR desde el Código Fuente

```bash
git clone https://github.com/adilsoncruz/open-pdf-generator.git
cd open-pdf-generator
./gradlew :tools:cli:shadowJar
```

El archivo ejecutable se generará en:
`tools/cli/build/libs/pdf-generator-cli-1.0.0.jar`

### Configurar el Comando CLI

#### Método A: Crear un Script Wrapper (Recomendado)

Cree `/usr/local/bin/pdf-generator`:

```bash
#!/bin/bash
java -jar /ruta/a/open-pdf-generator/tools/cli/build/libs/pdf-generator-cli-1.0.0.jar "$@"
```

Habilite permisos de ejecución:

```bash
chmod +x /usr/local/bin/pdf-generator
```

#### Método B: Crear un Alias en Shell

Agregue a su `~/.zshrc` o `~/.bashrc`:

```bash
alias pdf-generator="java -jar /ruta/a/open-pdf-generator/tools/cli/build/libs/pdf-generator-cli-1.0.0.jar"
```

Recargue la configuración:

```bash
source ~/.zshrc # o source ~/.bashrc
```

---

## Opción 3: Compilar Binario Nativo GraalVM (Desde el Código Fuente)

Para latencia inferior al milisegundo y sin runtime JVM, compile localmente la imagen nativa mediante Docker:

```bash
# Compilar imagen nativa con Docker
docker build -f tools/cli/Dockerfile.native -t open-pdf-generator:native .

# Verificar versión compilada
docker run --rm open-pdf-generator:native version
```

---

## Verificar la Instalación

Verifique que el comando funciona correctamente:

```bash
pdf-generator version
```

Salida esperada:

```
PDF Generator CLI v1.0.0
Core Library v1.0.0
```
