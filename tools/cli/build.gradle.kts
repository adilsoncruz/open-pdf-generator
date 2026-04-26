plugins {
    kotlin("jvm") version "2.0.21"
    application
    id("com.github.johnrengelman.shadow") version "8.1.1"
    id("io.gitlab.arturbosch.detekt") version "1.23.5"
    id("org.jlleitschuh.gradle.ktlint") version "12.1.0"
}

group = "io.pdfgenerator"
version = "1.0.0"

repositories {
    mavenCentral()
    maven { url = uri("https://jitpack.io") }
}

// Path to core library JAR (finds the most recent build, supports both release and SNAPSHOT versions)
val coreLibsDir = file("../../core/build/libs")
val coreJarPath =
    coreLibsDir.listFiles()
        ?.filter {
            it.name.startsWith("open-pdf-generator-") &&
                it.name.endsWith(".jar") &&
                !it.name.contains("sources") &&
                !it.name.contains("javadoc")
        }?.maxByOrNull {
            it.lastModified()
        } ?: file("../../core/build/libs/open-pdf-generator-1.0.0-SNAPSHOT.jar")

dependencies {
    // PDF Generator Core Library (from local JAR)
    implementation(files(coreJarPath))

    // Core's transitive dependencies (needed since we're using a JAR)
    implementation("com.github.librepdf:openpdf:2.0.3")
    implementation("com.google.code.gson:gson:2.11.0")
    implementation("com.google.zxing:core:3.5.3")
    implementation("com.google.zxing:javase:3.5.3")
    implementation("org.slf4j:slf4j-api:2.0.9")
    implementation("ch.qos.logback:logback-classic:1.4.14")

    // CLI Framework
    implementation("com.github.ajalt.clikt:clikt:4.2.1")

    // Async support
    implementation("org.jetbrains.kotlinx:kotlinx-coroutines-core:1.7.3")

    testImplementation(kotlin("test"))
}

application {
    mainClass.set("io.pdfgenerator.cli.MainKt")
}

tasks.shadowJar {
    archiveBaseName.set("pdf-generator-cli")
    archiveClassifier.set("")
    archiveVersion.set(version.toString())
    manifest {
        attributes["Main-Class"] = "io.pdfgenerator.cli.MainKt"
    }
}

tasks.test {
    useJUnitPlatform()
}

kotlin {
    jvmToolchain(21)
}

// Task to print version for CI/CD
tasks.register("printVersion") {
    doLast {
        println(project.version)
    }
}

detekt {
    buildUponDefaultConfig = true
    allRules = false
    config.setFrom(files("$rootDir/config/detekt/detekt.yml"))
}

ktlint {
    version.set("1.1.1")
    android.set(false)
    outputToConsole.set(true)
    ignoreFailures.set(false)
}
