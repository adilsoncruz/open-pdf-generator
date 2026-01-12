plugins {
    kotlin("jvm") version "2.0.21"
    `maven-publish`
    id("java-library")
    jacoco
}

group = "com.pdfgenerator"
version = "1.0.0-SNAPSHOT"

repositories {
    mavenCentral()
}

dependencies {
    // OpenPDF for PDF generation
    // Updated: 1.3.30 -> 2.0.3 (major version with improvements)
    implementation("com.github.librepdf:openpdf:2.0.3")
    
    // Gson for JSON parsing
    // Updated: 2.10.1 -> 2.11.0
    implementation("com.google.code.gson:gson:2.11.0")
    
    // JSON Schema validation - REMOVED: not used in code (~6MB total saving)
    // implementation("com.networknt:json-schema-validator:1.0.87")
    
    // ZXing for barcode/QR code generation (already latest)
    implementation("com.google.zxing:core:3.5.3")
    implementation("com.google.zxing:javase:3.5.3") {
        // Exclude JCommander - not used (~170KB saving)
        exclude(group = "com.beust", module = "jcommander")
    }
    
    // Kotlin standard library (without reflect - ~8.3MB saving)
    implementation(kotlin("stdlib"))
    // Removed: implementation(kotlin("reflect")) - not needed, ::class.java works without it
    
    // Logging - Logback for better performance
    // Updated: 2.0.9 -> 2.0.16, 1.4.11 -> 1.5.12 (SECURITY FIX)
    implementation("org.slf4j:slf4j-api:2.0.16")
    runtimeOnly("ch.qos.logback:logback-classic:1.5.12")
    
    // Testing
    // Updated: 5.10.0 -> 5.11.3, 1.13.8 -> 1.13.13, 3.24.2 -> 3.26.3
    testImplementation(kotlin("test"))
    testImplementation("org.junit.jupiter:junit-jupiter:5.11.3")
    testImplementation("io.mockk:mockk:1.13.13")
    testImplementation("org.assertj:assertj-core:3.26.3")
    
}

tasks.test {
    useJUnitPlatform()
    finalizedBy(tasks.jacocoTestReport)
    
    // Mostrar output dos testes no console
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
        files(classDirectories.files.map {
            fileTree(it) {
                exclude(
                    "**/examples/**",
                    "**/builder/**",
                    "**/cli/**"
                )
            }
        })
    )
}

tasks.jacocoTestCoverageVerification {
    dependsOn(tasks.classes)
    
    classDirectories.setFrom(
        files(classDirectories.files.map {
            fileTree(it) {
                exclude(
                    "**/examples/**",
                    "**/builder/**",
                    "**/cli/**"
                )
            }
        })
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

