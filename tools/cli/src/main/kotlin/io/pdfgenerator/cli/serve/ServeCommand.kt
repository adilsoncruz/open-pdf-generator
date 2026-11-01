package io.pdfgenerator.cli.serve

import com.github.ajalt.clikt.core.CliktCommand
import com.github.ajalt.clikt.parameters.options.default
import com.github.ajalt.clikt.parameters.options.flag
import com.github.ajalt.clikt.parameters.options.multiple
import com.github.ajalt.clikt.parameters.options.option
import com.github.ajalt.clikt.parameters.types.file
import com.github.ajalt.clikt.parameters.types.int
import com.github.ajalt.clikt.parameters.types.long
import com.pdfgenerator.adapter.openpdf.ImageRenderer
import com.pdfgenerator.api.PDFGenerator
import com.pdfgenerator.api.PDFGeneratorConfig
import io.pdfgenerator.cli.applyCliLogLevel

class ServeCommand : CliktCommand(
    name = "serve",
    help = "Generate PDFs over a warm NDJSON stdin/stdout loop (one request, one PDF)",
) {
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

    private val imageCacheSize by option(
        "--image-cache-size",
        help = "Maximum number of images to cache",
    ).int().default(100)

    private val noImageCache by option(
        "--no-image-cache",
        help = "Disable image caching",
    ).flag(default = false)

    private val strictMode by option(
        "--strict",
        help = "Enable strict mode (fail on errors)",
    ).flag("--no-strict", default = true)

    private val preload by option(
        "--preload",
        help = "Template path to parse before serving (repeatable)",
    ).multiple()

    private val maxRequestBytes by option(
        "--max-request-bytes",
        help = "Reject request lines larger than this many bytes",
    ).long().default(PdfRequestServer.DEFAULT_MAX_REQUEST_BYTES.toLong())

    private val verbose by option(
        "-v",
        "--verbose",
        help = "Log each request to stderr",
    ).flag(default = false)

    override fun run() {
        applyCliLogLevel(verbose)
        ImageRenderer.setMaxCacheSize(imageCacheSize)

        val config =
            PDFGeneratorConfig(
                fontDirectory = fontDir,
                defaultFont = defaultFont,
                strictMode = strictMode,
                enableImageCache = !noImageCache,
                imageCacheSize = imageCacheSize,
                resourcesDirectory = resourcesDir,
            )

        val server =
            PdfRequestServer(
                generator = PDFGenerator(config),
                maxRequestBytes = maxRequestBytes.coerceAtMost(Int.MAX_VALUE.toLong()).toInt(),
                log = { if (verbose) echo(it, err = true) },
            )

        preload.forEach { path ->
            runCatching { server.preload(listOf(path)) }
                .onFailure { echo("✗ Could not preload '$path': ${it.message}", err = true) }
        }

        // stderr, so the NDJSON stream on stdout stays protocol-only.
        echo("serve: ready (NDJSON on stdin/stdout)", err = true)

        val stats = server.serve(System.`in`, System.out.buffered())

        echo(
            "serve: exit served=${stats.served} failed=${stats.failed} elapsedMs=${stats.elapsedMs}",
            err = true,
        )
    }
}
