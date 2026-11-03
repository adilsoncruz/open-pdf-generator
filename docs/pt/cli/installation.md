# Instalação da CLI

A CLI do Open PDF Generator pode ser executada via **Docker** (sem necessidade de Java no host), através do **JAR Standalone** (requer JVM 17+), ou compilada localmente a partir do código-fonte como um **Binário Nativo com GraalVM**.

::: tip Observação sobre Binários Nativos
Não disponibilizamos download direto de binários nativos pré-compilados nas releases. Para ambientes sem Java, utilize o **container Docker** oficial ou compile o binário nativo localmente via GraalVM/Docker.
:::

---

## Opção 1: Docker (Recomendado — Sem Java no host)

A imagem Docker é a forma mais rápida e limpa de consumir a CLI a partir de aplicações em **Go, Node.js, Python, Ruby ou scripts bash**, sem precisar instalar a JVM na máquina host.

### Gerar Imagem Localmente

```bash
# Clonar o repositório
git clone https://github.com/adilsoncruz/open-pdf-generator.git
cd open-pdf-generator

# Construir o JAR da CLI e a imagem Docker
./gradlew :tools:cli:shadowJar
docker build -t open-pdf-generator:cli tools/cli/
```

### Executar via Docker

```bash
# Execução baseada em arquivos (montando diretório de trabalho)
docker run --rm -v "$PWD:/data" open-pdf-generator:cli \
  generate /data/invoice.json -d /data/data.json -o /data/invoice.pdf

# Execução via Pipe (JSON via stdin, PDF gerado no stdout)
cat data.json | docker run --rm -i \
  -v "$PWD/templates:/templates:ro" open-pdf-generator:cli \
  generate /templates/invoice.json -d - -o - > invoice.pdf
```

No modo pipe (`-d -` e `-o -`), mensagens informativas vão para o `stderr`, mantendo o `stdout` estritamente com os bytes do PDF.

---

## Opção 2: JAR Standalone (Requer Java 17+)

Se você já possui o Java 17 ou 21 instalado, pode rodar o JAR executável diretamente.

### Gerar o JAR a partir do Código-Fonte

```bash
git clone https://github.com/adilsoncruz/open-pdf-generator.git
cd open-pdf-generator
./gradlew :tools:cli:shadowJar
```

O arquivo executável será gerado em:
`tools/cli/build/libs/pdf-generator-cli-1.0.0.jar`

### Configurar o Comando da CLI

#### Método A: Criar um Script Wrapper (Recomendado)

Crie o arquivo `/usr/local/bin/pdf-generator`:

```bash
#!/bin/bash
java -jar /caminho/para/open-pdf-generator/tools/cli/build/libs/pdf-generator-cli-1.0.0.jar "$@"
```

Dê permissão de execução:

```bash
chmod +x /usr/local/bin/pdf-generator
```

#### Método B: Criar um Alias no Shell

Adicione ao seu `~/.zshrc` ou `~/.bashrc`:

```bash
alias pdf-generator="java -jar /caminho/para/open-pdf-generator/tools/cli/build/libs/pdf-generator-cli-1.0.0.jar"
```

Recarregue as configurações do terminal:

```bash
source ~/.zshrc # ou source ~/.bashrc
```

---

## Opção 3: Compilar Binário Nativo GraalVM (A Partir do Código-Fonte)

Para execução com latência de sub-milissegundo e sem runtime da JVM, você pode compilar o executável nativo localmente usando o Dockerfile com GraalVM:

```bash
# Compilar imagem nativa com Docker
docker build -f tools/cli/Dockerfile.native -t open-pdf-generator:native .

# Verificar versão compilada
docker run --rm open-pdf-generator:native version
```

---

## Verificar Instalação

Valide que o comando está acessível:

```bash
pdf-generator version
```

Saída esperada:

```
PDF Generator CLI v1.0.0
Core Library v1.0.0
```
