# Instalação

Adicione a PDF Generator Library ao seu projeto usando o JitPack.

## Gradle (Kotlin DSL)

```kotlin
// build.gradle.kts

repositories {
    mavenCentral()
    maven { url = uri("https://jitpack.io") }
}

dependencies {
    implementation("io.github.adilsoncruz:open-pdf-generator:1.0.0")
}
```

## Gradle (Groovy)

```groovy
// build.gradle

repositories {
    mavenCentral()
    maven { url 'https://jitpack.io' }
}

dependencies {
    implementation 'io.github.adilsoncruz:open-pdf-generator:1.0.0'
}
```

## Maven

```xml
<!-- pom.xml -->

<repositories>
    <repository>
        <id>jitpack.io</id>
        <url>https://jitpack.io</url>
    </repository>
</repositories>

<dependencies>
    <dependency>
        <groupId>io.github.adilsoncruz</groupId>
        <artifactId>open-pdf-generator</artifactId>
        <version>1.0.0</version>
    </dependency>
</dependencies>
```

---

## Versões

| Versão | Data | Notas |
|--------|------|-------|
| `1.0.0` | 2025 | Lançamento inicial |

::: tip Dica
Para usar a versão mais recente do branch `main`:

```kotlin
implementation("io.github.adilsoncruz:open-pdf-generator:main")
```
:::

---

## Requisitos

### Java

- **Mínimo**: Java 11
- **Recomendado**: Java 17 ou 21

### Kotlin

- **Mínimo**: Kotlin 1.8
- **Recomendado**: Kotlin 1.9+

---

## Dependências Transitivas

A biblioteca inclui automaticamente:

| Dependência | Versão | Finalidade |
|-------------|--------|------------|
| OpenPDF | 2.0.3+ | Geração de PDF |
| ZXing | 3.5.3+ | QR Code e Código de Barras |
| Gson | 2.11+ | Parser JSON |
| SLF4J | 2.0+ | Logging |

::: warning Conflitos
Se o seu projeto já usa versões diferentes dessas dependências, conflitos podem ocorrer. Use `dependencyInsight` para diagnosticar:

```bash
./gradlew dependencyInsight --dependency openpdf
```
:::

---

## Verificação

Após adicionar a dependência, verifique se está funcionando:

### Kotlin

```kotlin
import com.pdfgenerator.PDFGenerator

fun main() {
    val generator = PDFGenerator()
    println("PDF Generator Library v1.0.0 ✅")
}
```

### Java

```java
import com.pdfgenerator.PDFGenerator;

public class Main {
    public static void main(String[] args) {
        PDFGenerator generator = new PDFGenerator();
        System.out.println("PDF Generator Library v1.0.0 ✅");
    }
}
```

---

## Uso via CLI (Linha de Comando)

A biblioteca também pode ser usada como uma CLI standalone, sem necessidade de um projeto Kotlin/Java:

### Instalação da CLI

```bash
# Create directory
mkdir -p ~/.pdf-generator

# Download the JAR (or compile locally)
# Option 1: Download from release
curl -L -o ~/.pdf-generator/pdf-generator.jar \
  https://github.com/adilsoncruz/open-pdf-generator/releases/download/v1.0.0/open-pdf-generator-1.0.0-standalone.jar

# Option 2: Compile locally
cd library
./gradlew fatJar
cp build/libs/open-pdf-generator-1.0.0-standalone.jar ~/.pdf-generator/pdf-generator.jar

# Create version file
echo "1.0.0" > ~/.pdf-generator/version.txt
```

### Uso da CLI

```bash
# Show help
java -jar ~/.pdf-generator/pdf-generator.jar --help

# Show version
java -jar ~/.pdf-generator/pdf-generator.jar --version

# Generate PDF
java -jar ~/.pdf-generator/pdf-generator.jar \
  --template template.json \
  --data data.json \
  --output output.pdf
```

::: tip Aplicativo Desktop
Se você usa o **PDF Template Editor** (aplicativo desktop), ele gerencia a instalação da CLI automaticamente!
:::

---

## Instalação Local (JAR)

Se você preferir usar o JAR diretamente em um projeto sem o JitPack:

### 1. Baixe o JAR

Baixe o `open-pdf-generator-1.0.0-standalone.jar` na página de releases.

### 2. Adicione ao Projeto

**Gradle:**

```kotlin
dependencies {
    implementation(files("libs/open-pdf-generator-1.0.0-standalone.jar"))
}
```

**Maven:**

```xml
<dependency>
    <groupId>com.pdfgenerator</groupId>
    <artifactId>pdf-generator</artifactId>
    <version>1.0.0</version>
    <scope>system</scope>
    <systemPath>${project.basedir}/libs/open-pdf-generator-1.0.0-standalone.jar</systemPath>
</dependency>
```

---

## Estrutura do Projeto

Recomendamos a seguinte estrutura:

```
your-project/
├── src/
│   ├── main/
│   │   ├── kotlin/
│   │   │   └── com/yourcompany/
│   │   │       └── PdfService.kt
│   │   └── resources/
│   │       └── templates/
│   │           ├── invoice.json      ← Templates
│   │           └── report.json
│   └── test/
│       └── resources/
│           └── data/
│               └── sample.json       ← Test data
├── build.gradle.kts
└── output/                           ← Generated PDFs
```

---

## Configuração de Logging

A biblioteca usa SLF4J. Configure o nível de log no seu `logback.xml`:

```xml
<logger name="com.pdfgenerator" level="INFO"/>
```

Níveis disponíveis:
- `DEBUG`: Detalhes da renderização
- `INFO`: Informações gerais
- `WARN`: Avisos
- `ERROR`: Erros

---

## Problemas Comuns

### O JitPack não encontra a dependência

1. Verifique se o repositório é público no GitHub
2. Acesse `https://jitpack.io/#adilsoncruz/open-pdf-generator` para conferir o status do build
3. Aguarde alguns minutos (o primeiro build pode demorar)

### Conflito de versão do OpenPDF

```kotlin
configurations.all {
    resolutionStrategy {
        force("com.github.librepdf:openpdf:2.0.3")
    }
}
```

### ClassNotFoundException

Certifique-se de usar o JAR `standalone`, que inclui todas as dependências.

---

## Próximos Passos

- [Primeiros Passos](/pt/lib/guide/first-steps) - Crie seu primeiro PDF
- [Templates](/pt/lib/guide/templates) - Entenda a estrutura JSON
- [Exemplos](/lib/examples/) - Veja exemplos práticos
