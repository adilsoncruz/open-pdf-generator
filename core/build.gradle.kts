plugins {
    kotlin("jvm") version "2.0.21"
    `maven-publish`
    id("java-library")
    jacoco
    id("io.gitlab.arturbosch.detekt") version "1.23.5"
    id("org.jlleitschuh.gradle.ktlint") version "12.1.0"
}

group = "com.pdfgenerator"
version = "1.0.1"

repositories {
    mavenCentral()
    mavenLocal()
    maven { url = uri("$projectDir/maven-repo") }
}

dependencies {
    implementation("com.github.librepdf:openpdf:2.0.3")

    implementation("com.google.code.gson:gson:2.11.0")
    implementation("com.networknt:json-schema-validator:1.5.6")

    implementation("com.google.zxing:core:3.5.3")
    implementation("com.google.zxing:javase:3.5.3") {
        // Exclude JCommander - not used (~170KB saving)
        exclude(group = "com.beust", module = "jcommander")
    }

    implementation(kotlin("stdlib"))

    implementation("org.slf4j:slf4j-api:2.0.16")
    runtimeOnly("ch.qos.logback:logback-classic:1.6.6")

    testImplementation(kotlin("test"))
    testImplementation("org.junit.jupiter:junit-jupiter:6.1.3")
    testImplementation("io.mockk:mockk:1.14.11")
    testImplementation("org.assertj:assertj-core:3.27.3")
    testImplementation("org.apache.pdfbox:pdfbox:2.0.32")
    testImplementation("io.github.adilsoncruz:pdf-snapshot-junit:0.1.0")
}

tasks.test {
    useJUnitPlatform()
    finalizedBy(tasks.jacocoTestReport)

    testLogging {
        showStandardStreams = true
        events("passed", "skipped", "failed")
    }
}

tasks.jacocoTestReport {
    dependsOn(tasks.test)
    reports {
        xml.required.set(true)
        html.required.set(true)
        csv.required.set(false)
    }
    classDirectories.setFrom(
        files(
            classDirectories.files.map {
                fileTree(it) {
                    exclude(
                        "**/examples/**",
                        "**/builder/**",
                        "**/cli/**",
                    )
                }
            },
        ),
    )
}

tasks.jacocoTestCoverageVerification {
    dependsOn(tasks.classes)

    classDirectories.setFrom(
        files(
            classDirectories.files.map {
                fileTree(it) {
                    exclude(
                        "**/examples/**",
                        "**/builder/**",
                        "**/cli/**",
                    )
                }
            },
        ),
    )
    violationRules {
        rule {
            limit {
                minimum = "0.90".toBigDecimal()
            }
        }
    }
}

tasks.check {
    dependsOn(tasks.jacocoTestCoverageVerification)
}

kotlin {
    jvmToolchain(21)
}

base {
    archivesName.set("open-pdf-generator")
}

// Create fat JAR with all dependencies (library only, no main class)
tasks.register<Jar>("fatJar") {
    archiveClassifier.set("standalone")
    archiveBaseName.set("open-pdf-generator")
    duplicatesStrategy = DuplicatesStrategy.EXCLUDE

    manifest {
        attributes["Implementation-Version"] = project.version
        attributes["Implementation-Title"] = "Open PDF Generator"
    }

    from(configurations.runtimeClasspath.get().map { if (it.isDirectory) it else zipTree(it) }) {
        // Exclude unnecessary files to reduce JAR size
        exclude("META-INF/*.SF", "META-INF/*.DSA", "META-INF/*.RSA") // Signatures
        exclude("META-INF/MANIFEST.MF") // Will be replaced
        exclude("META-INF/LICENSE*", "META-INF/NOTICE*", "META-INF/DEPENDENCIES")
        exclude("META-INF/maven/**") // Maven metadata (~150KB)
        exclude("META-INF/versions/**") // Multi-release JAR files
        exclude("META-INF/native-image/**") // GraalVM native-image configs
        exclude("META-INF/proguard/**") // ProGuard rules
        exclude("META-INF/services/javax.annotation.processing.Processor") // Annotation processors

        // Exclude CJK fonts from OpenPDF (~1.8MB saving)
        // Comment out if you need Chinese/Japanese/Korean support:
        exclude("com/lowagie/text/pdf/fonts/Uni*-UCS2-*.cmap")
        exclude("com/lowagie/text/pdf/fonts/Adobe-*-UCS2.cmap")

        // Exclude kotlin-reflect classes that may come transitively
        exclude("kotlin/reflect/jvm/internal/**")

        // Exclude unused file types (but NOT .txt from OpenPDF fonts - needed for glyphlist.txt!)
        exclude("**/*.md")
        exclude("**/package.html", "**/overview.html")
        // Keep com/lowagie/text/pdf/fonts/*.txt (glyphlist.txt is essential for font metrics)

        // Exclude font-fallback (LiberationSans) if using system fonts (~400KB)
        // Uncomment if you don't need embedded fallback fonts:
        // exclude("font-fallback/**")
    }
    from(sourceSets.main.get().output)
}

java {
    withSourcesJar()
    withJavadocJar()
}

publishing {
    publications {
        create<MavenPublication>("maven") {
            groupId = "com.github.adilsoncruz"
            artifactId = "open-pdf-generator"
            version = project.version.toString()

            from(components["java"])

            pom {
                name.set("PDF Generator Library")
                description.set("A Kotlin/Java library for generating PDFs from JSON templates using OpenPDF")
                url.set("https://github.com/adilsoncruz/open-pdf-generator")

                licenses {
                    license {
                        name.set("GNU Lesser General Public License v3.0")
                        url.set("https://www.gnu.org/licenses/lgpl-3.0.html")
                    }
                }

                developers {
                    developer {
                        id.set("adilsoncruz")
                        name.set("Adi Cruz")
                    }
                }

                scm {
                    connection.set("scm:git:git://github.com/adilsoncruz/open-pdf-generator.git")
                    developerConnection.set("scm:git:ssh://github.com/adilsoncruz/open-pdf-generator.git")
                    url.set("https://github.com/adilsoncruz/open-pdf-generator")
                }
            }
        }
    }
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
    ignoreFailures.set(true)
}

tasks.register<JavaExec>("runTestSpacer") {
    mainClass.set("com.pdfgenerator.TestSpacerKt")
    classpath = sourceSets["main"].runtimeClasspath
}
