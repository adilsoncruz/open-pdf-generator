package com.pdfgenerator.converter.jasper

object JasperExpressionMapper {
    private val fieldRegex = Regex("^\\$F\\{([A-Za-z0-9_.]+)}$")
    private val parameterRegex = Regex("^\\$P\\{([A-Za-z0-9_.]+)}$")

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

        fieldRegex.matchEntire(normalized)?.let { return it.groupValues[1] }
        parameterRegex.matchEntire(normalized)?.let { return it.groupValues[1] }

        return null
    }
}
