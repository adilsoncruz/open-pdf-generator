package com.pdfgenerator.util

import com.pdfgenerator.engine.LoopContext

object ConditionEvaluator {
    fun evaluate(
        condition: String?,
        data: Map<String, Any?>,
        loopContext: LoopContext? = null,
    ): Boolean {
        if (condition == null || condition.isBlank()) {
            return true
        }

        return try {
            evaluateExpression(condition.trim(), data, loopContext)
        } catch (e: Exception) {
            true
        }
    }

    private fun evaluateExpression(
        expression: String,
        data: Map<String, Any?>,
        loopContext: LoopContext?,
    ): Boolean {
        if (expression.contains(" in ", ignoreCase = true)) {
            val parts = expression.split(Regex("\\s+in\\s+", RegexOption.IGNORE_CASE), limit = 2)
            if (parts.size == 2) {
                val left = parts[0].trim()
                val right = parts[1].trim()

                val leftValue = resolveValue(left, data, loopContext)
                val rightList = parseList(right, data, loopContext)

                return isInList(leftValue, rightList)
            }
        }

        val operators = listOf("==", "!=", ">=", "<=", ">", "<")

        for (operator in operators) {
            val parts = expression.split(operator, limit = 2)
            if (parts.size == 2) {
                val left = parts[0].trim()
                val right = parts[1].trim()

                val leftValue = resolveValue(left, data, loopContext)
                val rightValue = resolveValue(right, data, loopContext)

                return compareValues(leftValue, rightValue, operator)
            }
        }

        val value = resolveValue(expression, data, loopContext)
        return when (value) {
            is Boolean -> value
            is String -> value.lowercase() == "true"
            is Number -> value.toDouble() != 0.0
            null -> false
            else -> true
        }
    }

    private fun resolveValue(
        valueStr: String,
        data: Map<String, Any?>,
        loopContext: LoopContext?,
    ): Any? {
        val trimmed = valueStr.trim()

        if ((trimmed.startsWith("'") && trimmed.endsWith("'")) ||
            (trimmed.startsWith("\"") && trimmed.endsWith("\""))
        ) {
            return trimmed.substring(1, trimmed.length - 1)
        }

        if (trimmed.lowercase() == "true") return true
        if (trimmed.lowercase() == "false") return false
        if (trimmed.lowercase() == "null") return null

        trimmed.toDoubleOrNull()?.let { return it }

        return DataBindingResolver.resolve(trimmed, data, loopContext)
    }

    private fun compareValues(
        left: Any?,
        right: Any?,
        operator: String,
    ): Boolean {
        return when (operator) {
            "==" -> equals(left, right)
            "!=" -> !equals(left, right)
            ">" -> compare(left, right) > 0
            "<" -> compare(left, right) < 0
            ">=" -> compare(left, right) >= 0
            "<=" -> compare(left, right) <= 0
            else -> false
        }
    }

    private fun equals(
        left: Any?,
        right: Any?,
    ): Boolean {
        if (left == null && right == null) return true
        if (left == null || right == null) return false

        if (left is Number && right is Number) {
            return left.toDouble() == right.toDouble()
        }

        if (left is String && right is String) {
            return left.equals(right, ignoreCase = true)
        }

        return left == right
    }

    private fun compare(
        left: Any?,
        right: Any?,
    ): Int {
        if (left == null || right == null) return 0

        if (left is Number && right is Number) {
            return left.toDouble().compareTo(right.toDouble())
        }

        if (left is String && right is String) {
            return left.compareTo(right, ignoreCase = true)
        }

        return 0
    }

    private fun parseList(
        listStr: String,
        data: Map<String, Any?>,
        loopContext: LoopContext?,
    ): List<Any?> {
        val trimmed = listStr.trim()

        if (!trimmed.startsWith("[")) {
            val value = DataBindingResolver.resolve(trimmed, data, loopContext)
            return when (value) {
                is List<*> -> value
                is Array<*> -> value.toList()
                else -> emptyList()
            }
        }

        val content = trimmed.removeSurrounding("[", "]").trim()
        if (content.isEmpty()) return emptyList()

        val items = content.split(",").map { it.trim() }

        return items.map { item ->
            resolveValue(item, data, loopContext)
        }
    }

    private fun isInList(
        value: Any?,
        list: List<Any?>,
    ): Boolean {
        if (list.isEmpty()) return false

        return list.any { item ->
            equals(value, item)
        }
    }
}
