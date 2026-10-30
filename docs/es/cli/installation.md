# Instalación

## Descarga

### Desde GitHub Releases

Descarga el último release desde GitHub:

```bash
curl -L https://github.com/adilsoncruz/open-pdf-generator/releases/latest/download/pdf-generator-cli.jar \
  -o pdf-generator-cli.jar
```

### Desde JitPack

```bash
curl -L https://jitpack.io/com/github/user/open-pdf-generator/cli/1.0.0/cli-1.0.0.jar \
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
