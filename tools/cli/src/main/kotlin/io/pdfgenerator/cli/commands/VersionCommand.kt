package io.pdfgenerator.cli.commands

import com.github.ajalt.clikt.core.CliktCommand
import com.pdfgenerator.api.Version

class VersionCommand : CliktCommand(
    name = "version",
    help = "Show version information",
) {
    override fun run() {
        echo("PDF Generator CLI v1.0.0")
        echo("Core Library: ${Version.FULL_NAME}")
        echo()
        echo("Java: ${System.getProperty("java.version")}")
        echo("Kotlin: ${KotlinVersion.CURRENT}")
        echo("OS: ${System.getProperty("os.name")} ${System.getProperty("os.version")}")
        echo()
        echo("Documentation: https://adilsoncruz.github.io/open-pdf-generator/")
    }
}
