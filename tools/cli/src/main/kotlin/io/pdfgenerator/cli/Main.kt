package io.pdfgenerator.cli

import com.github.ajalt.clikt.core.CliktCommand
import com.github.ajalt.clikt.core.subcommands
import io.pdfgenerator.cli.serve.ServeCommand

typealias GenerateCommand = io.pdfgenerator.cli.commands.GenerateCommand
typealias ValidateCommand = io.pdfgenerator.cli.commands.ValidateCommand
typealias ConvertCommand = io.pdfgenerator.cli.commands.ConvertCommand
typealias CacheCommand = io.pdfgenerator.cli.commands.CacheCommand
typealias CacheClearCommand = io.pdfgenerator.cli.commands.CacheClearCommand
typealias CacheStatsCommand = io.pdfgenerator.cli.commands.CacheStatsCommand
typealias VersionCommand = io.pdfgenerator.cli.commands.VersionCommand

class PdfGeneratorCli : CliktCommand(
    name = "pdf-generator",
    help = "Generate PDFs from JSON templates",
) {
    override fun run() = Unit
}

/**
 * Keeps stderr quiet for command-line usage: the core logs one DEBUG line per rendered
 * element, which is useful in the editor but wasteful when generating from a pipe.
 */
internal fun applyCliLogLevel(verbose: Boolean) {
    val level =
        if (verbose) {
            ch.qos.logback.classic.Level.DEBUG
        } else {
            ch.qos.logback.classic.Level.WARN
        }
    (org.slf4j.LoggerFactory.getLogger("com.pdfgenerator") as? ch.qos.logback.classic.Logger)?.level = level
}

fun main(args: Array<String>) {
    // Keep AWT headless: PDF rendering never needs a display, and the GraalVM
    // native image has no libawt to load.
    System.setProperty("java.awt.headless", "true")

    val cacheCmd =
        CacheCommand().subcommands(
            CacheClearCommand(),
            CacheStatsCommand(),
        )

    PdfGeneratorCli()
        .subcommands(
            GenerateCommand(),
            ValidateCommand(),
            ServeCommand(),
            ConvertCommand(),
            cacheCmd,
            VersionCommand(),
        )
        .main(args)
}
