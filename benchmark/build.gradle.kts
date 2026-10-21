plugins {
    kotlin("jvm") version "2.0.21" apply false
    kotlin("kapt") version "2.0.21" apply false
    id("me.champeau.jmh") version "0.7.2" apply false
    id("com.github.johnrengelman.shadow") version "8.1.1" apply false
}

allprojects {
    group = "com.pdfgenerator"
    version = "1.0.0"

    repositories {
        mavenCentral()
        maven { url = uri("https://jitpack.io") }
    }
}
