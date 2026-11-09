package io.pdfgenerator.cli.commands

import com.github.ajalt.clikt.core.CliktCommand
import com.github.ajalt.clikt.parameters.options.flag
import com.github.ajalt.clikt.parameters.options.option
import com.pdfgenerator.adapter.openpdf.ImageRenderer
import com.pdfgenerator.api.PDFGenerator

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
