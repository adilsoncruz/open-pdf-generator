package io.pdfgenerator.cli.commands

import com.github.ajalt.clikt.core.CliktCommand
import com.github.ajalt.clikt.parameters.arguments.argument
import com.github.ajalt.clikt.parameters.options.default
import com.github.ajalt.clikt.parameters.options.flag
import com.github.ajalt.clikt.parameters.options.option
import com.github.ajalt.clikt.parameters.types.file
import com.github.ajalt.clikt.parameters.types.int
import com.pdfgenerator.adapter.openpdf.ImageRenderer
import com.pdfgenerator.api.PDFGenerator
import com.pdfgenerator.api.PDFGeneratorConfig
import com.pdfgenerator.model.Template
import io.pdfgenerator.cli.applyCliLogLevel
import java.io.File

class GenerateCommand : CliktCommand(
    name = "generate",
    help = "Generate a PDF from a template and data",
) {
    // Required arguments
    private val template by argument(
        help = "Path to the JSON template file",
    ).file(mustExist = true)

    // Output options
    private val data by option(
        "-d",
        "--data",
        help = "Path to the JSON data file, or '-' to read data from stdin",
    ).file()

    private val output by option(
        "-o",
        "--output",
        help = "Output PDF file path, or '-' to stream the PDF to stdout",
    ).default("output.pdf")

    // Configuration options
    private val fontDir by option(
        "--font-dir",
        help = "Directory containing custom fonts",
    ).file(mustExist = true, canBeFile = false)

    private val defaultFont by option(
        "--default-font",
        help = "Default font to use",
    ).default("Helvetica")

    private val resourcesDir by option(
        "--resources-dir",
        help = "Base directory for resources (images, fonts)",
    ).file(mustExist = true, canBeFile = false)

    // Cache options
    private val noImageCache by option(
        "--no-image-cache",
        help = "Disable image caching",
    ).flag(default = false)

    private val imageCacheSize by option(
        "--image-cache-size",
        help = "Maximum number of images to cache",
    ).int().default(100)

    private val clearCache by option(
        "--clear-cache",
        help = "Clear all caches before generating",
    ).flag(default = false)

    // Mode options
    private val strictMode by option(
        "--strict",
        help = "Enable strict mode (fail on errors)",
    ).flag("--no-strict", default = true)

    private val verbose by option(
        "-v",
        "--verbose",
        help = "Enable verbose output",
    ).flag(default = false)

    override fun run() {
        applyCliLogLevel(verbose)

        val stdoutPdf = output == "-"

        // Suppress all informational messages when the PDF is streamed to stdout,
        // so the binary stream stays clean for piping (e.g. `> invoice.pdf`).
        fun say(
            message: String = "",
            error: Boolean = false,
        ) {
            if (stdoutPdf && !error) return
            echo(message, err = error)
        }

        if (verbose) {
            say("PDF Generator CLI v1.0.0")
            say("========================")
        }

        // Clear caches if requested
        if (clearCache) {
            if (verbose) say("Clearing caches...")
            PDFGenerator.clearCache()
            ImageRenderer.clearCache()
        }

        // Configure image cache size
        ImageRenderer.setMaxCacheSize(imageCacheSize)

        // Build configuration
        val config =
            PDFGeneratorConfig(
                fontDirectory = fontDir,
                defaultFont = defaultFont,
                strictMode = strictMode,
                enableImageCache = !noImageCache,
                imageCacheSize = imageCacheSize,
                resourcesDirectory = resourcesDir,
            )

        if (verbose) {
            say("Configuration:")
            say("  Font directory: ${fontDir?.absolutePath ?: "default"}")
            say("  Default font: $defaultFont")
            say("  Resources directory: ${resourcesDir?.absolutePath ?: "default"}")
            say("  Image cache: ${if (!noImageCache) "enabled (max $imageCacheSize)" else "disabled"}")
            say("  Strict mode: $strictMode")
            say()
        }

        say("Generating PDF...")
        if (verbose) {
            say("  Template: ${template.absolutePath}")
            data?.let { say("  Data: ${it.absolutePath}") }
            say("  Output: $output")
        }

        try {
            val generator = PDFGenerator(config)
            val templateObj = Template.fromFile(template)

            val dataFile = data
            val dataJson =
                when {
                    dataFile == null -> "{}"
                    dataFile.path == "-" -> System.`in`.readBytes().decodeToString()
                    else -> {
                        require(dataFile.exists()) { "Data file does not exist: $dataFile" }
                        dataFile.readText()
                    }
                }
            val dataMap = parseJson(dataJson)

            if (stdoutPdf) {
                System.out.buffered().use { pdfStream ->
                    generator.generateToStream(templateObj, dataMap, pdfStream)
                }
            } else {
                generator.generate(templateObj, dataMap, File(output))
            }

            say("✓ PDF generated successfully: $output")

            if (verbose) {
                say()
                say("Cache stats:")
                say("  Templates cached: ${PDFGenerator.cacheSize()}")
                say("  Images cached: ${ImageRenderer.cacheSize()}")
            }
        } catch (e: Exception) {
            echo("✗ Error generating PDF: ${e.message}", err = true)
            if (verbose) {
                echo(e.stackTraceToString(), err = true)
            }
            throw e
        }
    }

    @Suppress("UNCHECKED_CAST")
    private fun parseJson(json: String): Map<String, Any?> {
        val gson = com.google.gson.Gson()
        return gson.fromJson(json, Map::class.java) as? Map<String, Any?> ?: emptyMap()
    }
}
