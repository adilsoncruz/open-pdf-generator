# Instalação

## Binário Nativo Standalone (Recomendado — Sem necessidade de Java)

Baixe o executável pré-compilado GraalVM para inicialização instantânea (~10 ms), sem precisar de Java ou Docker:

```bash
# Linux x86_64
curl -L https://github.com/adilsoncruz/open-pdf-generator/releases/latest/download/pdf-generator-linux-amd64 \
  -o /usr/local/bin/pdf-generator
chmod +x /usr/local/bin/pdf-generator

# Verificar instalação
pdf-generator version
```

No `Dockerfile` da sua aplicação (Go, Node.js, Python):

```dockerfile
# Download direto dentro do container — sem Java
RUN curl -L https://github.com/adilsoncruz/open-pdf-generator/releases/latest/download/pdf-generator-linux-amd64 \
    -o /usr/local/bin/pdf-generator && chmod +x /usr/local/bin/pdf-generator
```

---

## JAR Standalone (Requer Java 17+)

Se preferir rodar sobre a JVM:

```bash
curl -L https://github.com/adilsoncruz/open-pdf-generator/releases/latest/download/pdf-generator-cli.jar \
  -o pdf-generator-cli.jar
```

## Configuração

### Opção 1: Criar um Alias

Adicione ao seu `~/.zshrc` ou `~/.bashrc`:

```bash
alias pdf-generator="java -jar /path/to/pdf-generator-cli.jar"
```

Em seguida, recarregue:

```bash
source ~/.zshrc
```

### Opção 2: Criar um Script Wrapper

Crie `/usr/local/bin/pdf-generator`:

```bash
#!/bin/bash
java -jar /path/to/pdf-generator-cli.jar "$@"
```

Torne-o executável:

```bash
chmod +x /usr/local/bin/pdf-generator
```

### Opção 3: Instalar no Diretório Home

```bash
mkdir -p ~/.pdf-generator
mv pdf-generator-cli.jar ~/.pdf-generator/
echo 'alias pdf-generator="java -jar ~/.pdf-generator/pdf-generator-cli.jar"' >> ~/.zshrc
source ~/.zshrc
```

## Verificar a Instalação

```bash
pdf-generator version
```

Saída esperada:

```
PDF Generator CLI v1.0.0
Core Library v1.0.0
```

## Build a Partir do Código-Fonte

```bash
git clone https://github.com/adilsoncruz/open-pdf-generator.git
cd open-pdf-generator/tools/cli
../../gradlew shadowJar
```

O JAR ficará em `build/libs/pdf-generator-cli-1.0.0.jar`.
