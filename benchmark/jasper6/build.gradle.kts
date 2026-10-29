plugins {
    kotlin("jvm")
    kotlin("kapt")
    id("me.champeau.jmh") version "0.7.2"
    id("com.github.johnrengelman.shadow") version "8.1.1"
    application
}

dependencies {
    implementation(project(":common"))

    // JasperReports 6.21.4 (Standard Stable)
    implementation("net.sf.jasperreports:jasperreports:6.21.4")
    implementation(fileTree("libs") { include("*.jar") })
    implementation("net.sf.barcode4j:barcode4j:2.1")
    implementation("org.apache.xmlgraphics:batik-bridge:1.17")
    implementation("com.google.zxing:core:3.5.3")
    implementation("com.google.zxing:javase:3.5.3")
    implementation("com.fasterxml.jackson.module:jackson-module-kotlin:2.17.2")

    // JMH
    jmh("org.openjdk.jmh:jmh-core:1.37")
    kaptJmh("org.openjdk.jmh:jmh-generator-annprocess:1.37")
}

application {
    mainClass.set("com.pdfgenerator.benchmark.BenchmarkStandaloneRunnerKt")
}

tasks.shadowJar {
    archiveBaseName.set("open-pdf-benchmark-jasper6")
    archiveClassifier.set("")
    archiveVersion.set("")
    mergeServiceFiles()
    append("jasperreports_extension.properties")
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
