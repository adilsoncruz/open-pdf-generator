plugins {
    kotlin("jvm") version "2.0.21"
    kotlin("kapt") version "2.0.21"
    id("me.champeau.jmh") version "0.7.2"
    id("com.github.johnrengelman.shadow") version "8.1.1"
    application
}

group = "com.pdfgenerator"
version = "1.0.0"

repositories {
    mavenCentral()
    maven { url = uri("https://jitpack.io") }
}

val coreLibsDir = file("../core/build/libs")
val coreJarPath =
    coreLibsDir.listFiles()
        ?.filter {
            it.name.startsWith("open-pdf-generator-") &&
                it.name.endsWith(".jar") &&
                !it.name.contains("sources") &&
                !it.name.contains("javadoc")
        }?.maxByOrNull {
            it.lastModified()
        } ?: file("../core/build/libs/open-pdf-generator-1.0.1.jar")

dependencies {
    // Open PDF Generator (Local Build)
    implementation(files(coreJarPath))

    // Open PDF Core Transitive Dependencies
    implementation("com.github.librepdf:openpdf:2.0.3")
    implementation("com.google.code.gson:gson:2.11.0")
    implementation("com.networknt:json-schema-validator:1.5.1")
    implementation("com.google.zxing:core:3.5.3")
    implementation("com.google.zxing:javase:3.5.3")
    implementation("org.slf4j:slf4j-api:2.0.9")
    implementation("ch.qos.logback:logback-classic:1.4.14")

    // JasperReports (Standard Stable 6.21.x)
    implementation("net.sf.jasperreports:jasperreports:6.21.4")

    // Jackson
    implementation("com.fasterxml.jackson.module:jackson-module-kotlin:2.17.2")

    // JMH
    jmh("org.openjdk.jmh:jmh-core:1.37")
    kaptJmh("org.openjdk.jmh:jmh-generator-annprocess:1.37")
}

application {
    mainClass.set("com.pdfgenerator.benchmark.BenchmarkStandaloneRunnerKt")
}

tasks.shadowJar {
    archiveBaseName.set("open-pdf-benchmark")
    archiveClassifier.set("")
    archiveVersion.set("")
    manifest {
        attributes["Main-Class"] = "com.pdfgenerator.benchmark.BenchmarkStandaloneRunnerKt"
    }
}

jmh {
    jmhVersion.set("1.37")
    warmupIterations.set(2)
    iterations.set(3)
    fork.set(1)
    failOnError.set(true)
    resultFormat.set("JSON")
    resultsFile.set(project.layout.buildDirectory.file("reports/jmh/results.json"))
}

kotlin {
    jvmToolchain(21)
}
