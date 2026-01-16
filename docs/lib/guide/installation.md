# Installation

Add PDF Generator Library to your project using JitPack.

## Gradle (Kotlin DSL)

```kotlin
// build.gradle.kts

repositories {
    mavenCentral()
    maven { url = uri("https://jitpack.io") }
}

dependencies {
    implementation("com.github.adilsoncruz:open-pdf-generator:1.0.0")
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
    implementation 'com.github.adilsoncruz:open-pdf-generator:1.0.0'
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
        <groupId>com.github.adilsoncruz</groupId>
        <artifactId>open-pdf-generator</artifactId>
        <version>1.0.0</version>
    </dependency>
</dependencies>
```

---

## Versions

| Version | Date | Notes |
|---------|------|-------|
| `1.0.0` | 2025 | Initial release |

::: tip Tip
To use the latest version from the `main` branch:

```kotlin
implementation("com.github.adilsoncruz:open-pdf-generator:main")
```
:::

---

## Requirements

### Java

- **Minimum**: Java 11
- **Recommended**: Java 17 or 21

### Kotlin

- **Minimum**: Kotlin 1.8
- **Recommended**: Kotlin 1.9+

---

## Transitive Dependencies

The library automatically includes:

| Dependency | Version | Purpose |
|------------|---------|---------|
| OpenPDF | 2.0.3+ | PDF generation |
| ZXing | 3.5.3+ | QR Code and Barcode |
| Gson | 2.11+ | JSON parser |
| SLF4J | 2.0+ | Logging |

::: warning Conflicts
If your project already uses different versions of these dependencies, conflicts may occur. Use `dependencyInsight` to diagnose:

```bash
./gradlew dependencyInsight --dependency openpdf
```
:::

---

## Verification

After adding the dependency, verify it's working:

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

## CLI Usage (Command Line)

The library can also be used as a standalone CLI, without needing a Kotlin/Java project:

### CLI Installation

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

### CLI Usage

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

::: tip Desktop App
If you use the **PDF Template Editor** (desktop app), it manages CLI installation automatically!
:::

---

## Local Installation (JAR)

If you prefer to use the JAR directly in a project without JitPack:

### 1. Download the JAR

Download `open-pdf-generator-1.0.0-standalone.jar` from the releases page.

### 2. Add to Project

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

## Project Structure

We recommend the following structure:

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

## Logging Configuration

The library uses SLF4J. Configure the log level in your `logback.xml`:

```xml
<logger name="com.pdfgenerator" level="INFO"/>
```

Available levels:
- `DEBUG`: Rendering details
- `INFO`: General information
- `WARN`: Warnings
- `ERROR`: Errors

---

## Common Issues

### JitPack can't find the dependency

1. Verify the repository is public on GitHub
2. Access `https://jitpack.io/#adilsoncruz/open-pdf-generator` to check build status
3. Wait a few minutes (first build may take time)

### OpenPDF version conflict

```kotlin
configurations.all {
    resolutionStrategy {
        force("com.github.librepdf:openpdf:2.0.3")
    }
}
```

### ClassNotFoundException

Make sure to use the `standalone` JAR that includes all dependencies.

---

## Next Steps

- [First Steps](/lib/guide/first-steps) - Create your first PDF
- [Templates](/lib/guide/templates) - Understand JSON structure
- [Examples](/lib/examples/) - See practical examples

