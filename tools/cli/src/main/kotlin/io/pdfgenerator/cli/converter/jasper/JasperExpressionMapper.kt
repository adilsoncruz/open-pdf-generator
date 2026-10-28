package io.pdfgenerator.cli.converter.jasper
import io.pdfgenerator.cli.converter.jasper.JasperExpressionMapper.parameterRegex

object JasperExpressionMapper {
    private val fieldRegex = Regex("^\\\$F\\{([A-Za-z0-9_.]+)}\$")
    private val parameterRegex = Regex("^\\\$P\\{([A-Za-z0-9_.]+)}\$")

    /**
     * Converts the most common Jasper expressions into our dataBinding format.
     *
     * Examples:
     * - $F{customer.name} -> customer.name
     * - $P{logoUrl} -> logoUrl
     */
    fun toDataBinding(expression: String?): String? {
        if (expression.isNullOrBlank()) return null
        val normalized = expression.replace("<![CDATA[", "").replace("]]>", "").trim()

        fieldRegex.find(normalized)?.let { return it.groupValues[1] }
        parameterRegex.find(normalized)?.let { return it.groupValues[1] }

        return null
    }

    fun toExpression(expression: String): String? {
        val regexCampo = Regex("\\$[FPVR]\\{([^}]+)}")

        var result =
            expression
                .replace("<![CDATA[", "")
                .replace("]]>", "")
                .replace("]]", "")
                .trim()

        if (result.isEmpty()) return null

        // unicode operators
        result =
            result
                .replace("!\\u003d", "!=")
                .replace("\\u003d\\u003d", "==")
                .replace("\\u003e\\u003d", ">=")
                .replace("\\u003c\\u003d", "<=")
                .replace("\\u003d", "=")
                .replace("\\u003e", ">")
                .replace("\\u003c", "<")

        // campos Jasper
        result = result.replace(regexCampo, "$1")

        // equals
        result =
            result.replace(
                Regex("""([a-zA-Z0-9_.]+)\.equals\((.*?)\)"""),
                "$1 == $2",
            )

        // uppercase
        result =
            result.replace(
                Regex("""([a-zA-Z0-9_.]+)\.toUpperCase\(\)"""),
                "$1 | uppercase",
            )

        result = result.replace(Regex("\\s+"), " ").trim()

        // ✅ Se string inteira está entre aspas, remove
        if (result.matches(Regex("^\".*\"$"))) {
            result = result.substring(1, result.length - 1)
            return result
        }

        return result
    }
}
