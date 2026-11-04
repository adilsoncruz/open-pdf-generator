plugins {
    kotlin("jvm") version "2.0.21"
    application
    id("com.gradleup.shadow") version "9.6.1"
    id("io.gitlab.arturbosch.detekt") version "1.23.8"
    id("org.jlleitschuh.gradle.ktlint") version "12.1.0"
}

group = "io.github.adilsoncruz"
version = "1.0.0"

repositories {
    mavenCentral()
    mavenLocal()
    maven { url = uri("https://jitpack.io") }
}

dependencies {
    // PDF Generator Core Library
    implementation("io.github.adilsoncruz:open-pdf-generator:1.0.0")

    // Dependencies used directly by the CLI
    implementation("com.google.code.gson:gson:2.15.0")
    implementation("org.slf4j:slf4j-api:2.0.16")
    implementation("ch.qos.logback:logback-classic:1.6.6")

    // CLI Framework
    implementation("com.github.ajalt.clikt:clikt:4.2.1")

    // Async support
    implementation("org.jetbrains.kotlinx:kotlinx-coroutines-core:1.9.0")

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

tasks.named("distZip") { dependsOn(tasks.shadowJar) }
tasks.named("distTar") { dependsOn(tasks.shadowJar) }
tasks.named("startScripts") { dependsOn(tasks.shadowJar) }
tasks.named("startShadowScripts") { dependsOn(tasks.jar) }

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
