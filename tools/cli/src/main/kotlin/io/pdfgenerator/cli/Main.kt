package io.pdfgenerator.cli

import com.github.ajalt.clikt.core.CliktCommand
import com.github.ajalt.clikt.core.subcommands
import com.github.ajalt.clikt.parameters.arguments.argument
import com.github.ajalt.clikt.parameters.options.default
import com.github.ajalt.clikt.parameters.options.flag
import com.github.ajalt.clikt.parameters.options.option
import com.github.ajalt.clikt.parameters.types.file
import com.github.ajalt.clikt.parameters.types.int
import com.pdfgenerator.adapter.openpdf.ImageRenderer
import com.pdfgenerator.api.PDFGenerator
import com.pdfgenerator.api.PDFGeneratorConfig
import com.pdfgenerator.api.Version
import io.pdfgenerator.cli.converter.jasper.JasperConversionOptions
import io.pdfgenerator.cli.converter.jasper.JasperTemplateConverter
import com.pdfgenerator.model.Template
import java.io.File

class PdfGeneratorCli : CliktCommand(
    name = "pdf-generator",
    help = "Generate PDFs from JSON templates",
) {
    override fun run() = Unit
}

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
        help = "Path to the JSON data file",
    ).file(mustExist = true)

    private val output by option(
        "--output",
        help = "Output PDF file path",
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
        if (verbose) {
            echo("PDF Generator CLI v1.0.0")
            echo("========================")
        }

        // Clear caches if requested
        if (clearCache) {
            if (verbose) echo("Clearing caches...")
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
            echo("Configuration:")
            echo("  Font directory: ${fontDir?.absolutePath ?: "default"}")
            echo("  Default font: $defaultFont")
            echo("  Resources directory: ${resourcesDir?.absolutePath ?: "default"}")
            echo("  Image cache: ${if (!noImageCache) "enabled (max $imageCacheSize)" else "disabled"}")
            echo("  Strict mode: $strictMode")
            echo()
        }

        echo("Generating PDF...")
        if (verbose) {
            echo("  Template: ${template.absolutePath}")
            data?.let { echo("  Data: ${it.absolutePath}") }
            echo("  Output: $output")
        }

        try {
            val generator = PDFGenerator(config)
            val templateObj = Template.fromFile(template)
            val dataJson = data?.readText() ?: "{}"
            val dataMap = parseJson(dataJson)

            generator.generate(templateObj, dataMap, File(output))

            echo("✓ PDF generated successfully: $output")

            if (verbose) {
                echo()
                echo("Cache stats:")
                echo("  Templates cached: ${PDFGenerator.cacheSize()}")
                echo("  Images cached: ${ImageRenderer.cacheSize()}")
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

class ValidateCommand : CliktCommand(
    name = "validate",
    help = "Validate a JSON template",
) {
    private val template by argument(
        help = "Path to the JSON template file",
    ).file(mustExist = true)

    private val verbose by option(
        "-v",
        "--verbose",
        help = "Enable verbose output",
    ).flag(default = false)

    override fun run() {
        echo("Validating template: ${template.absolutePath}")

        try {
            val templateObj = Template.fromFile(template)

            // Check for required fields that Gson might have set to null
            require(templateObj.version != null) { "Missing required field: 'version'" }
            require(templateObj.pageSettings != null) { "Missing required field: 'pageSettings'" }

            // Run the template's built-in validation
            val validationResult = templateObj.validate()
            if (!validationResult.isValid) {
                val errorMessages = validationResult.errors.joinToString("\n  - ") { "${it.path}: ${it.message}" }
                throw IllegalArgumentException("Template validation failed:\n  - $errorMessages")
            }

            if (verbose) {
                echo()
                echo("Template details:")
                echo("  Version: ${templateObj.version}")
                echo("  Page size: ${templateObj.pageSettings.size}")
                echo("  Page orientation: ${templateObj.pageSettings.orientation}")
                echo("  Header: ${if (templateObj.pageSettings.header != null) "yes" else "no"}")
                echo("  Footer: ${if (templateObj.pageSettings.footer != null) "yes" else "no"}")
                echo("  Elements: ${templateObj.bodyElements().size}")
            }

            echo("✓ Template is valid")
        } catch (e: Exception) {
            echo("✗ Template validation failed: ${e.message}", err = true)
            if (verbose) {
                echo(e.stackTraceToString(), err = true)
            }
            throw e
        }
    }
}

class ConvertCommand : CliktCommand(
    name = "convert",
    help = "Convert Jasper JRXML template to JSON template",
) {
    private val input by argument(
        help = "Path to the Jasper JRXML file",
    ).file(mustExist = true)

    private val output by option(
        "--output",
        help = "Output JSON template file path (required unless --stdout is used)",
    )

    private val stdout by option(
        "--stdout",
        help = "Print converted JSON to stdout",
    ).flag(default = false)

    private val failOnUnsupported by option(
        "--fail-on-unsupported",
        help = "Fail conversion when an unsupported Jasper element is found",
    ).flag(default = false)

    override fun run() {
        if (!input.extension.equals("jrxml", ignoreCase = true)) {
            throw IllegalArgumentException("Input file must have .jrxml extension")
        }
        if (!stdout && output == null) {
            throw IllegalArgumentException("Use --output <file> or --stdout")
        }
        val template =
            JasperTemplateConverter.fromFile(
                input.absolutePath,
                options =
                    JasperConversionOptions(
                        failOnUnsupportedElement = failOnUnsupported,
                    ),
            )

        val json = template.toJson()
        if (stdout) {
            echo(json)
        }
        output?.let {
            val outputFile = File(it)
            outputFile.parentFile?.mkdirs()
            outputFile.writeText(json)
            echo("✓ Template converted successfully: ${outputFile.absolutePath}")
        }
    }
}

class CacheCommand : CliktCommand(
    name = "cache",
    help = "Manage template and image caches",
) {
    override fun run() = Unit
}

class CacheClearCommand : CliktCommand(
    name = "clear",
    help = "Clear all caches",
) {
    private val templates by option(
        "--templates",
        "-t",
        help = "Clear only template cache",
    ).flag(default = false)

    private val images by option(
        "--images",
        "-i",
        help = "Clear only image cache",
    ).flag(default = false)

    override fun run() {
        val clearAll = !templates && !images

        if (clearAll || templates) {
            PDFGenerator.clearCache()
            echo("✓ Template cache cleared")
        }

        if (clearAll || images) {
            ImageRenderer.clearCache()
            echo("✓ Image cache cleared")
        }
    }
}

class CacheStatsCommand : CliktCommand(
    name = "stats",
    help = "Show cache statistics",
) {
    override fun run() {
        echo("Cache Statistics")
        echo("================")
        echo("Templates cached: ${PDFGenerator.cacheSize()}")
        echo("Images cached: ${ImageRenderer.cacheSize()}")
    }
}

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

fun main(args: Array<String>) {
    val cacheCmd =
        CacheCommand().subcommands(
            CacheClearCommand(),
            CacheStatsCommand(),
        )

    PdfGeneratorCli()
        .subcommands(
            GenerateCommand(),
            ValidateCommand(),
            ConvertCommand(),
            cacheCmd,
            VersionCommand(),
        )
        .main(args)
}
