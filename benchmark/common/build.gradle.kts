plugins {
    kotlin("jvm")
}

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
        } ?: file("../../core/build/libs/open-pdf-generator-1.0.1.jar")

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
    implementation("com.fasterxml.jackson.module:jackson-module-kotlin:2.17.2")
}

kotlin {
    jvmToolchain(21)
}
