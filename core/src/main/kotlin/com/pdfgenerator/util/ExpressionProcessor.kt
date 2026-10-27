package com.pdfgenerator.util

import com.pdfgenerator.engine.LoopContext

object ExpressionProcessor {
    private const val EXPRESSION_PART_SEPARATOR = "|"
    private const val TRANSFORMATION_ARG_SEPARATOR = ':'
    private const val MAX_EXPRESSION_CACHE_SIZE = 1024

    private val templatePlaceholderRegex = """(?:\$\{([^}]+)\}|\{\{([^}]+)\}\})""".toRegex()
    private val functionCallRegex = """^([a-zA-Z0-9_]+)\s*\((.*)\)$""".toRegex()
    private val functionArgsRegex = """\s*(?:'([^']*)'|"([^"]*)"|([^,]+))\s*""".toRegex()
    private val colonArgsRegex = """\s*(?:'([^']*)'|"([^"]*)"|([^:]+))\s*""".toRegex()

    private val expressionCacheLock = Any()
    private val parsedExpressionCache =
        object : LinkedHashMap<String, ParsedExpression>(MAX_EXPRESSION_CACHE_SIZE, 0.75f, true) {
            override fun removeEldestEntry(eldest: MutableMap.MutableEntry<String, ParsedExpression>?): Boolean {
                return size > MAX_EXPRESSION_CACHE_SIZE
            }
        }

    internal data class ParsedExpression(
        val binding: String,
        val transformations: List<ParsedTransformation>,
    )

    internal data class ParsedTransformation(
        val functionName: String,
        val args: List<String>,
    )

    fun containsTemplateExpression(text: String?): Boolean {
        if (text == null) return false
        return (text.contains("\${") && text.contains("}")) || (text.contains("{{") && text.contains("}}"))
    }

    fun processTemplate(
        template: String,
        data: Map<String, Any?>,
        loopContext: LoopContext? = null,
    ): String {
        if (!containsTemplateExpression(template)) {
            return template
        }

        return templatePlaceholderRegex.replace(template) { match ->
            val expr = match.groupValues[1].ifEmpty { match.groupValues[2] }.trim()
            process(expr, data, loopContext)
        }
    }

    fun process(
        expression: String,
        data: Map<String, Any?>,
        loopContext: LoopContext? = null,
    ): String {
        val trimmed = expression.trim()
        val cleanExpr = when {
            trimmed.startsWith("\${") && trimmed.endsWith("}") ->
                trimmed.substring(2, trimmed.length - 1).trim()
            trimmed.startsWith("{{") && trimmed.endsWith("}}") ->
                trimmed.substring(2, trimmed.length - 2).trim()
            else -> trimmed
        }

        val parsedExpression = getOrParseExpression(cleanExpr)
        val rawValue = DataBindingResolver.resolve(parsedExpression.binding, data, loopContext)

        if (parsedExpression.transformations.isEmpty()) {
            return valueToString(rawValue)
        }

        var currentValue: Any? = rawValue
        for (transformation in parsedExpression.transformations) {
            currentValue = applyTransformation(currentValue, transformation)
        }

        return valueToString(currentValue)
    }

    fun hasTransformations(expression: String?): Boolean {
        return expression?.contains(EXPRESSION_PART_SEPARATOR) == true
    }

    fun extractBinding(expression: String): String {
        return getOrParseExpression(expression).binding
    }

    private fun applyTransformation(
        value: Any?,
        transformation: ParsedTransformation,
    ): Any? {
        val funcName = transformation.functionName
        val args = transformation.args

        return when (funcName.lowercase()) {
            "template", "tpl" -> applyTemplate(value, args.getOrNull(0) ?: "")
            else -> BuiltinFunctions.apply(value, funcName, args)
        }
    }

    private fun applyTemplate(
        value: Any?,
        templateStr: String,
    ): String {
        if (value !is Map<*, *>) {
            return valueToString(value)
        }

        @Suppress("UNCHECKED_CAST")
        val objMap = value as Map<String, Any?>

        return templatePlaceholderRegex.replace(templateStr) { match ->
            val propPath = match.groupValues[1].ifEmpty { match.groupValues[2] }.trim()

            val parsedExpression = getOrParseExpression(propPath)
            val propValue = resolvePropPath(parsedExpression.binding, objMap)

            if (parsedExpression.transformations.isEmpty()) {
                valueToString(propValue)
            } else {
                var currentValue: Any? = propValue
                for (transformation in parsedExpression.transformations) {
                    currentValue = applyTransformation(currentValue, transformation)
                }
                valueToString(currentValue)
            }
        }
    }

    private fun resolvePropPath(
        path: String,
        obj: Map<String, Any?>,
    ): Any? = ExpressionEvaluator.resolvePropPath(path, obj)

    private fun getOrParseExpression(expression: String): ParsedExpression {
        synchronized(expressionCacheLock) {
            parsedExpressionCache[expression]?.let { return it }
        }

        val parsedExpression = parseExpression(expression)

        synchronized(expressionCacheLock) {
            parsedExpressionCache[expression] = parsedExpression
        }

        return parsedExpression
    }

    private fun parseExpression(expression: String): ParsedExpression {
        val parts = expression.split(EXPRESSION_PART_SEPARATOR).map { it.trim() }
        if (parts.isEmpty()) {
            return ParsedExpression("", emptyList())
        }

        val binding = parts[0]
        if (parts.size == 1) {
            return ParsedExpression(binding, emptyList())
        }

        val transformations = parts.drop(1).map(::parseTransformation)
        return ParsedExpression(binding, transformations)
    }

    private fun parseTransformation(transformation: String): ParsedTransformation {
        val trimmed = transformation.trim()

        val funcMatch = functionCallRegex.matchEntire(trimmed)
        if (funcMatch != null) {
            val funcName = funcMatch.groupValues[1].trim()
            val argsStr = funcMatch.groupValues[2].trim()
            val args = if (argsStr.isEmpty()) emptyList() else parseArgs(argsStr, functionArgsRegex)
            return ParsedTransformation(funcName, args)
        }

        val colonIndex = trimmed.indexOf(TRANSFORMATION_ARG_SEPARATOR)
        if (colonIndex == -1) {
            return ParsedTransformation(trimmed, emptyList())
        }

        val funcName = trimmed.substring(0, colonIndex).trim()
        val argsStr = trimmed.substring(colonIndex + 1)
        val args = parseArgs(argsStr, colonArgsRegex)
        return ParsedTransformation(funcName, args)
    }

    private fun parseArgs(argsStr: String, regex: Regex): List<String> {
        val args = mutableListOf<String>()
        regex.findAll(argsStr).forEach { match ->
            val single = match.groups[1]
            val double = match.groups[2]
            val unquoted = match.groups[3]

            when {
                single != null -> args.add(single.value)
                double != null -> args.add(double.value)
                unquoted != null -> {
                    val trimmed = unquoted.value.trim()
                    if (trimmed.isNotEmpty()) {
                        args.add(trimmed)
                    }
                }
            }
        }
        return args
    }

    private fun valueToString(value: Any?): String = BuiltinFunctions.valueToString(value)
}
