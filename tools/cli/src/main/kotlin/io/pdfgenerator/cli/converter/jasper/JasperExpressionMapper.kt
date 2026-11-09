package io.pdfgenerator.cli.converter.jasper

data class MappedExpression(
    val dataBinding: String? = null,
    val value: String? = null,
)

object JasperExpressionMapper {
    private val pureVarRegex = Regex("""^\$[PFV]\{([A-Za-z0-9_.]+)}$""")
    private val prefixRegex = Regex("""^"([^"]+)"\s*\+\s*\$[PFV]\{([A-Za-z0-9_.]+)}$""")
    private val suffixRegex = Regex("""^\$[PFV]\{([A-Za-z0-9_.]+)}\s*\+\s*"([^"]+)"$""")
    private val upperRegex = Regex("""^\$[PFV]\{([A-Za-z0-9_.]+)}\.toUpperCase\(\)$""")
    private val lowerRegex = Regex("""^\$[PFV]\{([A-Za-z0-9_.]+)}\.toLowerCase\(\)$""")
    private val dateFormatRegex = Regex("""new\s+(?:java\.text\.)?SimpleDateFormat\("([^"]+)"\)\.format\(\$[PFV]\{([A-Za-z0-9_.]+)}\)""")
    private val anyVarRegex = Regex("""\$[PFV]\{([A-Za-z0-9_.]+)}""")
    private val dataSourceCollectionRegex = Regex("""JRBean(?:Collection|Array)?DataSource\(\s*\$[PFV]\{([A-Za-z0-9_.]+)}\s*\)""")

    fun normalizeVar(name: String): String {
        return if (name == "PAGE_NUMBER") "pageNumber" else name
    }

    /**
     * Maps Jasper expressions ($P{...}, $F{...}, $V{PAGE_NUMBER}, concatenations and methods)
     * to Open PDF Generator format.
     */
    fun mapExpression(rawExpr: String?): MappedExpression {
        if (rawExpr.isNullOrBlank()) return MappedExpression()
        val expr =
            rawExpr
                .replace("<![CDATA[", "")
                .replace("]]>", "")
                .replace("]]", "")
                .trim()

        if (expr.isEmpty()) return MappedExpression()

        // 1. Literal de string pura entre aspas: "Hello World"
        if (expr.startsWith("\"") && expr.endsWith("\"") && !expr.substring(1, expr.length - 1).contains("\"")) {
            return MappedExpression(value = expr.substring(1, expr.length - 1))
        }

        // 2. Variável direta: $P{field}, $F{field}, $V{PAGE_NUMBER}
        pureVarRegex.find(expr)?.let {
            return MappedExpression(dataBinding = normalizeVar(it.groupValues[1]))
        }

        // 3. DataSource collection wrapping: new JRBeanCollectionDataSource($F{orderItems})
        dataSourceCollectionRegex.find(expr)?.let {
            return MappedExpression(dataBinding = normalizeVar(it.groupValues[1]))
        }

        // 4. Concatenação simples com prefixo: "Prefix: " + $P{field}
        prefixRegex.find(expr)?.let {
            val prefix = it.groupValues[1]
            val varName = normalizeVar(it.groupValues[2])
            return MappedExpression(dataBinding = "$varName | prefix:'$prefix'")
        }

        // 5. Concatenação simples com sufixo: $P{field} + " Suffix"
        suffixRegex.find(expr)?.let {
            val varName = normalizeVar(it.groupValues[1])
            val suffix = it.groupValues[2]
            return MappedExpression(dataBinding = "$varName | suffix:'$suffix'")
        }

        // 6. Transformação uppercase: $P{field}.toUpperCase()
        upperRegex.find(expr)?.let {
            val varName = normalizeVar(it.groupValues[1])
            return MappedExpression(dataBinding = "$varName | uppercase")
        }

        // Transformação lowercase: $P{field}.toLowerCase()
        lowerRegex.find(expr)?.let {
            val varName = normalizeVar(it.groupValues[1])
            return MappedExpression(dataBinding = "$varName | lowercase")
        }

        // 7. Formatação de data Java: new SimpleDateFormat("dd/MM/yyyy").format($F{date})
        dateFormatRegex.find(expr)?.let {
            val pattern = it.groupValues[1]
            val varName = normalizeVar(it.groupValues[2])
            return MappedExpression(dataBinding = "$varName | date:'$pattern'")
        }

        // 8. Concatenações gerais envolvendo partes estáticas e variáveis:
        // Ex: "Página " + $V{PAGE_NUMBER} + " de " + $P{totalPages}
        if (expr.contains("+") && anyVarRegex.containsMatchIn(expr)) {
            val interpolated = convertConcatToInterpolation(expr)
            if (interpolated != null) {
                return MappedExpression(value = interpolated)
            }
        }

        return MappedExpression()
    }

    /**
     * Applies a Jasper number/currency pattern (e.g. `#,##0.00`, `$#,##0.00`, `Final Amount Due: $#,##0.00`)
     * to a dataBinding or expression.
     */
    fun applyPattern(
        binding: String?,
        pattern: String?,
    ): String? {
        if (binding.isNullOrBlank()) return binding
        if (pattern.isNullOrBlank()) return binding

        val trimmedPattern = pattern.trim()

        // 1. Prefix + Currency pattern: "Final Amount Due: $#,##0.00"
        val prefixCurrencyMatch = Regex("""^(.*?)\$([#,0.]+.*)$""").find(trimmedPattern)
        if (prefixCurrencyMatch != null) {
            val prefix = prefixCurrencyMatch.groupValues[1]
            val numPattern = prefixCurrencyMatch.groupValues[2]
            return "$binding | format:'$numPattern' | prefix:'${prefix}\$'"
        }

        // 2. Simple currency pattern with dollar: "$#,##0.00"
        if (trimmedPattern.startsWith("$")) {
            val numPattern = trimmedPattern.removePrefix("$")
            return "$binding | format:'$numPattern' | prefix:'\$'"
        }

        // 3. Direct number format pattern: "#,##0.00"
        return "$binding | format:'$trimmedPattern'"
    }

    private fun convertConcatToInterpolation(expr: String): String? {
        val parts = expr.split("+")
        val sb = StringBuilder()
        for (part in parts) {
            val p = part.trim()
            if (p.startsWith("\"") && p.endsWith("\"") && p.length >= 2) {
                sb.append(p.substring(1, p.length - 1))
            } else {
                val varMatch = pureVarRegex.find(p)
                if (varMatch != null) {
                    val varName = normalizeVar(varMatch.groupValues[1])
                    sb.append("\${$varName}")
                } else {
                    return null
                }
            }
        }
        return sb.toString()
    }

    fun toDataBinding(expression: String?): String? {
        return mapExpression(expression).dataBinding
    }

    fun toExpression(expression: String): String? {
        val regexCampo = Regex("""\$[FPVR]\{([^}]+)}""")

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

        // campos Jasper normalizados
        result = result.replace(regexCampo) { normalizeVar(it.groupValues[1]) }

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

        // Se string inteira está entre aspas, remove
        if (result.matches(Regex("^\".*\"$"))) {
            result = result.substring(1, result.length - 1)
            return result
        }

        return result
    }
}
