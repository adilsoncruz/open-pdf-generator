package io.pdfgenerator.cli.commands

import com.github.ajalt.clikt.core.CliktCommand
import com.github.ajalt.clikt.parameters.arguments.argument
import com.github.ajalt.clikt.parameters.options.flag
import com.github.ajalt.clikt.parameters.options.option
import com.github.ajalt.clikt.parameters.types.file
import com.pdfgenerator.model.Template

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
                echo("  Schema: ${if (templateObj.schema != null) "defined" else "none"}")
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
