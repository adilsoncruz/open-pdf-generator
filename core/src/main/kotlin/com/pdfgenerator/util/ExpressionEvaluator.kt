package com.pdfgenerator.util

import com.pdfgenerator.engine.LoopContext

object ExpressionEvaluator {
    fun evaluate(
        expression: String,
        data: Map<String, Any?>,
        loopContext: LoopContext? = null,
    ): Boolean {
        try {
            if (!expression.contains(" ")) {
                val value = DataBindingResolver.resolve(expression, data, loopContext)
                return when (value) {
                    null -> false
                    is Boolean -> value
                    is Number -> value.toDouble() != 0.0
                    is String -> value.isNotEmpty()
                    is Collection<*> -> value.isNotEmpty()
                    else -> true
                }
            }

            if (expression.contains(" && ")) {
                return expression.split(" && ").all { evaluate(it.trim(), data, loopContext) }
            }
            if (expression.contains(" || ")) {
                return expression.split(" || ").any { evaluate(it.trim(), data, loopContext) }
            }

            return when {
                expression.contains(" >= ") -> evaluateComparison(expression, data, loopContext, ">=")
                expression.contains(" <= ") -> evaluateComparison(expression, data, loopContext, "<=")
                expression.contains(" > ") -> evaluateComparison(expression, data, loopContext, ">")
                expression.contains(" < ") -> evaluateComparison(expression, data, loopContext, "<")
                expression.contains(" == ") -> evaluateComparison(expression, data, loopContext, "==")
                expression.contains(" != ") -> evaluateComparison(expression, data, loopContext, "!=")
                else -> false
            }
        } catch (e: Exception) {
            return false
        }
    }

    private fun evaluateComparison(
        expression: String,
        data: Map<String, Any?>,
        loopContext: LoopContext?,
        operator: String,
    ): Boolean {
        val parts = expression.split(" $operator ")
        if (parts.size != 2) return false

        val left = parts[0].trim()
        val right = parts[1].trim()

        val leftValue = resolveValue(left, data, loopContext)
        val rightValue = resolveValue(right, data, loopContext)

        return compare(leftValue, rightValue, operator)
    }

    private fun resolveValue(
        value: String,
        data: Map<String, Any?>,
        loopContext: LoopContext?,
    ): Any? {
        return when {
            value.startsWith("'") && value.endsWith("'") -> value.substring(1, value.length - 1)
            value.startsWith("\"") && value.endsWith("\"") -> value.substring(1, value.length - 1)
            value.toDoubleOrNull() != null -> value.toDouble()
            value == "true" -> true
            value == "false" -> false
            value == "null" -> null
            else -> DataBindingResolver.resolve(value, data, loopContext)
        }
    }

    private fun compare(
        left: Any?,
        right: Any?,
        operator: String,
    ): Boolean {
        return when (operator) {
            "==" -> left == right
            "!=" -> left != right
            ">", "<", ">=", "<=" -> {
                val leftNum = (left as? Number)?.toDouble() ?: return false
                val rightNum = (right as? Number)?.toDouble() ?: return false

                when (operator) {
                    ">" -> leftNum > rightNum
                    "<" -> leftNum < rightNum
                    ">=" -> leftNum >= rightNum
                    "<=" -> leftNum <= rightNum
                    else -> false
                }
            }
            else -> false
        }
    }
}
