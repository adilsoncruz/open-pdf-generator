package io.pdfgenerator.cli.commands

import com.github.ajalt.clikt.core.CliktCommand
import com.github.ajalt.clikt.parameters.arguments.argument
import com.github.ajalt.clikt.parameters.options.default
import com.github.ajalt.clikt.parameters.options.flag
import com.github.ajalt.clikt.parameters.options.option
import com.github.ajalt.clikt.parameters.types.file
import io.pdfgenerator.cli.converter.jasper.JasperConversionOptions
import io.pdfgenerator.cli.converter.jasper.JasperTemplateConverter
import java.io.File

class ConvertCommand : CliktCommand(
    name = "convert",
    help = "Convert JasperReports 6.x JRXML template to JSON template",
) {
    private val input by argument(
        help = "Path to the JasperReports 6.x JRXML file",
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

    private val itemsBinding by option(
        "--items-binding",
        help = "Data binding property name for inferred tables or loops (default: items)",
    ).default("items")

    private val disableTableInference by option(
        "--disable-table-inference",
        help = "Disable automatic TableElement inference and force LoopElement for detail bands",
    ).flag(default = false)

    override fun run() {
        require(input.extension.equals("jrxml", ignoreCase = true)) {
            "Input file must have .jrxml extension"
        }
        require(stdout || output != null) {
            "Use --output <file> or --stdout"
        }
        val template =
            JasperTemplateConverter.fromFile(
                input.absolutePath,
                options =
                    JasperConversionOptions(
                        failOnUnsupportedElement = failOnUnsupported,
                        defaultItemsBinding = itemsBinding,
                        enableTableInference = !disableTableInference,
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
