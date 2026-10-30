# Instalación

Agrega la PDF Generator Library a tu proyecto usando JitPack.

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

## Versiones

| Versión | Fecha | Notas |
|---------|-------|-------|
| `1.0.0` | 2025 | Lanzamiento inicial |

::: tip Tip
Para usar la última versión de la rama `main`:

```kotlin
implementation("com.github.adilsoncruz:open-pdf-generator:main")
```
:::

---

## Requisitos

### Java

- **Mínimo**: Java 11
- **Recomendado**: Java 17 o 21

### Kotlin

- **Mínimo**: Kotlin 1.8
- **Recomendado**: Kotlin 1.9+

---

## Dependencias Transitivas

La librería incluye automáticamente:

| Dependencia | Versión | Propósito |
|-------------|---------|-----------|
| OpenPDF | 2.0.3+ | Generación de PDF |
| ZXing | 3.5.3+ | Código QR y Código de Barra |
| Gson | 2.11+ | Parser de JSON |
| SLF4J | 2.0+ | Logging |

::: warning Conflictos
Si tu proyecto ya usa versiones diferentes de estas dependencias, pueden ocurrir conflictos. Usa `dependencyInsight` para diagnosticar:

```bash
./gradlew dependencyInsight --dependency openpdf
```
:::

---

## Verificación

Después de agregar la dependencia, verifica que funcione:

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

## Uso de la CLI (Línea de Comandos)

La librería también puede usarse como una CLI independiente, sin necesidad de un proyecto Kotlin/Java:

### Instalación de la CLI

```bash
# Crear el directorio
mkdir -p ~/.pdf-generator

# Descargar el JAR (o compilar localmente)
# Opción 1: Descargar desde el release
curl -L -o ~/.pdf-generator/pdf-generator.jar \
  https://github.com/adilsoncruz/open-pdf-generator/releases/download/v1.0.0/open-pdf-generator-1.0.0-standalone.jar

# Opción 2: Compilar localmente
cd library
./gradlew fatJar
cp build/libs/open-pdf-generator-1.0.0-standalone.jar ~/.pdf-generator/pdf-generator.jar

# Crear el archivo de versión
echo "1.0.0" > ~/.pdf-generator/version.txt
```

### Uso de la CLI

```bash
# Mostrar ayuda
java -jar ~/.pdf-generator/pdf-generator.jar --help

# Mostrar versión
java -jar ~/.pdf-generator/pdf-generator.jar --version

# Generar un PDF
java -jar ~/.pdf-generator/pdf-generator.jar \
  --template template.json \
  --data data.json \
  --output output.pdf
```

::: tip Aplicación Desktop
Si usas el **PDF Template Editor** (aplicación desktop), ¡éste gestiona la instalación de la CLI automáticamente!
:::

---

## Instalación Local (JAR)

Si prefieres usar el JAR directamente en un proyecto sin JitPack:

### 1. Descarga el JAR

Descarga `open-pdf-generator-1.0.0-standalone.jar` desde la página de releases.

### 2. Agrégalo al Proyecto

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

## Estructura del Proyecto

Recomendamos la siguiente estructura:

```
your-project/
├── src/
│   ├── main/
│   │   ├── kotlin/
│   │   │   └── com/yourcompany/
│   │   │       └── PdfService.kt
│   │   └── resources/
│   │       └── templates/
│   │           ├── invoice.json      ← Plantillas
│   │           └── report.json
│   └── test/
│       └── resources/
│           └── data/
│               └── sample.json       ← Datos de prueba
├── build.gradle.kts
└── output/                           ← PDFs generados
```

---

## Configuración de Logging

La librería usa SLF4J. Configura el nivel de log en tu `logback.xml`:

```xml
<logger name="com.pdfgenerator" level="INFO"/>
```

Niveles disponibles:
- `DEBUG`: Detalles del renderizado
- `INFO`: Información general
- `WARN`: Advertencias
- `ERROR`: Errores

---

## Problemas Comunes

### JitPack no encuentra la dependencia

1. Verifica que el repositorio sea público en GitHub
2. Accede a `https://jitpack.io/#adilsoncruz/open-pdf-generator` para revisar el estado del build
3. Espera unos minutos (el primer build puede tardar)

### Conflicto de versión de OpenPDF

```kotlin
configurations.all {
    resolutionStrategy {
        force("com.github.librepdf:openpdf:2.0.3")
    }
}
```

### ClassNotFoundException

Asegúrate de usar el JAR `standalone`, que incluye todas las dependencias.

---

## Próximos Pasos

- [Primeros Pasos](/es/lib/guide/first-steps) - Crea tu primer PDF
- [Plantillas](/es/lib/guide/templates) - Entiende la estructura JSON
- [Ejemplos](/lib/examples/) - Ve ejemplos prácticos
