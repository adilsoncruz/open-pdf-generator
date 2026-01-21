package com.pdfgenerator.util

import java.text.DecimalFormat
import java.text.DecimalFormatSymbols
import java.text.NumberFormat
import java.text.SimpleDateFormat
import java.util.*

object ExpressionProcessor {

    fun process(expression: String, data: Map<String, Any?>, loopContext: com.pdfgenerator.engine.LoopContext? = null): String {
        val parts = expression.split("|").map { it.trim() }
        
        if (parts.isEmpty()) return ""
        
        val binding = parts[0]
        val rawValue = DataBindingResolver.resolve(binding, data, loopContext)
        
        if (parts.size == 1) {
            return valueToString(rawValue)
        }
        
        var currentValue: Any? = rawValue
        for (i in 1 until parts.size) {
            currentValue = applyTransformation(currentValue, parts[i])
        }
        
        return valueToString(currentValue)
    }
    
    fun hasTransformations(expression: String): Boolean {
        return expression.contains("|")
    }
    
    fun extractBinding(expression: String): String {
        return expression.split("|").firstOrNull()?.trim() ?: expression
    }
    
    private fun applyTransformation(value: Any?, transformation: String): Any? {
        val (funcName, args) = parseTransformation(transformation)
        
        return when (funcName.lowercase()) {
            "uppercase", "upper" -> toUpperCase(value)
            "lowercase", "lower" -> toLowerCase(value)
            "capitalize", "cap" -> capitalize(value)
            "format" -> format(value, args.getOrNull(0) ?: "#,##0.00")
            "date" -> formatDate(value, args.getOrNull(0) ?: "dd/MM/yyyy")
            "join" -> join(value, args.getOrNull(0) ?: ", ")
            "default" -> defaultValue(value, args.getOrNull(0) ?: "")
            "truncate" -> truncate(value, args.getOrNull(0)?.toIntOrNull() ?: 50, args.getOrNull(1) ?: "...")
            "currency" -> formatCurrency(value, args.getOrNull(0) ?: "BRL")
            "padleft", "lpad" -> padLeft(value, args.getOrNull(0)?.toIntOrNull() ?: 10, args.getOrNull(1) ?: " ")
            "padright", "rpad" -> padRight(value, args.getOrNull(0)?.toIntOrNull() ?: 10, args.getOrNull(1) ?: " ")
            "replace" -> replace(value, args.getOrNull(0) ?: "", args.getOrNull(1) ?: "")
            "trim" -> trim(value)
            "first" -> first(value)
            "last" -> last(value)
            "reverse" -> reverse(value)
            "length", "len" -> length(value)
            "abs" -> abs(value)
            "round" -> round(value, args.getOrNull(0)?.toIntOrNull() ?: 0)
            "floor" -> floor(value)
            "ceil" -> ceil(value)
            "prefix" -> prefix(value, args.getOrNull(0) ?: "")
            "suffix" -> suffix(value, args.getOrNull(0) ?: "")
            "numberformat", "numfmt" -> numberFormat(value, args.getOrNull(0) ?: "pt-BR")
            "template", "tpl" -> applyTemplate(value, args.getOrNull(0) ?: "")
            "concat" -> concat(value, args)
            else -> value
        }
    }
    
    private fun applyTemplate(value: Any?, templateStr: String): String {
        if (value !is Map<*, *>) {
            return valueToString(value)
        }
        
        @Suppress("UNCHECKED_CAST")
        val objMap = value as Map<String, Any?>
        
        val regex = """\$\{([^}]+)\}""".toRegex()
        
        return regex.replace(templateStr) { match ->
            val propPath = match.groupValues[1].trim()
            
            if (propPath.contains("|")) {
                val parts = propPath.split("|").map { it.trim() }
                val propName = parts[0]
                val propValue = resolvePropPath(propName, objMap)
                
                var currentValue: Any? = propValue
                for (i in 1 until parts.size) {
                    currentValue = applyTransformation(currentValue, parts[i])
                }
                valueToString(currentValue)
            } else {
                valueToString(resolvePropPath(propPath, objMap))
            }
        }
    }
    
    private fun resolvePropPath(path: String, obj: Map<String, Any?>): Any? {
        val parts = path.split(".")
        var current: Any? = obj
        
        for (part in parts) {
            current = when (val curr = current) {
                is Map<*, *> -> curr[part]
                is List<*> -> {
                    when (part) {
                        "length", "size" -> curr.size
                        else -> part.toIntOrNull()?.let { idx -> 
                            if (idx >= 0 && idx < curr.size) curr[idx] else null 
                        }
                    }
                }
                else -> return null
            }
            if (current == null) return null
        }
        
        return current
    }
    
    private fun concat(value: Any?, args: List<String>): String {
        val separator = args.getOrNull(0) ?: ""
        val parts = mutableListOf(valueToString(value))
        
        for (i in 1 until args.size) {
            parts.add(args[i])
        }
        
        return parts.joinToString(separator)
    }
    
    private fun parseTransformation(transformation: String): Pair<String, List<String>> {
        val colonIndex = transformation.indexOf(':')
        
        if (colonIndex == -1) {
            return Pair(transformation.trim(), emptyList())
        }
        
        val funcName = transformation.substring(0, colonIndex).trim()
        val argsStr = transformation.substring(colonIndex + 1)
        
        val args = mutableListOf<String>()
        val regex = """'([^']*)'|"([^"]*)"|([^:]+)""".toRegex()
        
        regex.findAll(argsStr).forEach { match ->
            val arg = match.groupValues[1].ifEmpty { 
                match.groupValues[2].ifEmpty { 
                    match.groupValues[3] 
                } 
            }
            if (arg.isNotEmpty()) {
                args.add(arg.trim())
            }
        }
        
        return Pair(funcName, args)
    }
    
    private fun valueToString(value: Any?): String {
        return when (value) {
            null -> ""
            is String -> value
            is Number -> value.toString()
            is Boolean -> value.toString()
            is List<*> -> value.joinToString(", ")
            is Array<*> -> value.joinToString(", ")
            else -> value.toString()
        }
    }
    
    private fun toUpperCase(value: Any?): String {
        return valueToString(value).uppercase()
    }
    
    private fun toLowerCase(value: Any?): String {
        return valueToString(value).lowercase()
    }
    
    private fun capitalize(value: Any?): String {
        val str = valueToString(value)
        return str.split(" ").joinToString(" ") { word ->
            word.lowercase().replaceFirstChar { it.uppercase() }
        }
    }
    
    private fun trim(value: Any?): String {
        return valueToString(value).trim()
    }
    
    private fun truncate(value: Any?, maxLength: Int, suffix: String): String {
        val str = valueToString(value)
        return if (str.length > maxLength) {
            str.take(maxLength - suffix.length) + suffix
        } else {
            str
        }
    }
    
    private fun padLeft(value: Any?, length: Int, padChar: String): String {
        val str = valueToString(value)
        val pad = padChar.firstOrNull() ?: ' '
        return str.padStart(length, pad)
    }
    
    private fun padRight(value: Any?, length: Int, padChar: String): String {
        val str = valueToString(value)
        val pad = padChar.firstOrNull() ?: ' '
        return str.padEnd(length, pad)
    }
    
    private fun replace(value: Any?, oldStr: String, newStr: String): String {
        return valueToString(value).replace(oldStr, newStr)
    }
    
    private fun prefix(value: Any?, prefixStr: String): String {
        return prefixStr + valueToString(value)
    }
    
    private fun suffix(value: Any?, suffixStr: String): String {
        return valueToString(value) + suffixStr
    }
    
    private fun reverse(value: Any?): String {
        return valueToString(value).reversed()
    }
    
    private fun join(value: Any?, separator: String): String {
        return when (value) {
            is List<*> -> value.filterNotNull().joinToString(separator)
            is Array<*> -> value.filterNotNull().joinToString(separator)
            else -> valueToString(value)
        }
    }
    
    private fun first(value: Any?): Any? {
        return when (value) {
            is List<*> -> value.firstOrNull()
            is Array<*> -> value.firstOrNull()
            is String -> value.firstOrNull()?.toString() ?: ""
            else -> value
        }
    }
    
    private fun last(value: Any?): Any? {
        return when (value) {
            is List<*> -> value.lastOrNull()
            is Array<*> -> value.lastOrNull()
            is String -> value.lastOrNull()?.toString() ?: ""
            else -> value
        }
    }
    
    private fun length(value: Any?): Int {
        return when (value) {
            is List<*> -> value.size
            is Array<*> -> value.size
            is String -> value.length
            else -> valueToString(value).length
        }
    }
    
    private fun format(value: Any?, pattern: String): String {
        val number = when (value) {
            is Number -> value.toDouble()
            is String -> value.toDoubleOrNull() ?: return value
            else -> return valueToString(value)
        }
        
        return try {
            val symbols = DecimalFormatSymbols(Locale.forLanguageTag("pt-BR"))
            val formatter = DecimalFormat(pattern, symbols)
            formatter.format(number)
        } catch (e: Exception) {
            valueToString(value)
        }
    }
    
    private fun formatCurrency(value: Any?, currencyCode: String): String {
        val number = when (value) {
            is Number -> value.toDouble()
            is String -> value.toDoubleOrNull() ?: return value
            else -> return valueToString(value)
        }
        
        return try {
            val locale = when (currencyCode.uppercase()) {
                "BRL" -> Locale.forLanguageTag("pt-BR")
                "USD" -> Locale.US
                "EUR" -> Locale.GERMANY
                "ARS" -> Locale.forLanguageTag("es-AR")
                "MXN" -> Locale.forLanguageTag("es-MX")
                else -> Locale.getDefault()
            }
            val formatter = NumberFormat.getCurrencyInstance(locale)
            formatter.currency = Currency.getInstance(currencyCode.uppercase())
            formatter.format(number)
        } catch (e: Exception) {
            valueToString(value)
        }
    }
    
    private fun numberFormat(value: Any?, locale: String): String {
        val number = when (value) {
            is Number -> value.toDouble()
            is String -> value.toDoubleOrNull() ?: return value
            else -> return valueToString(value)
        }
        
        return try {
            val loc = when (locale.lowercase()) {
                "pt-br", "pt_br" -> Locale.forLanguageTag("pt-BR")
                "en-us", "en_us" -> Locale.US
                "es-ar", "es_ar" -> Locale.forLanguageTag("es-AR")
                "es-mx", "es_mx" -> Locale.forLanguageTag("es-MX")
                else -> Locale.getDefault()
            }
            NumberFormat.getNumberInstance(loc).format(number)
        } catch (e: Exception) {
            valueToString(value)
        }
    }
    
    private fun abs(value: Any?): Number {
        return when (value) {
            is Int -> kotlin.math.abs(value)
            is Long -> kotlin.math.abs(value)
            is Float -> kotlin.math.abs(value)
            is Double -> kotlin.math.abs(value)
            is String -> value.toDoubleOrNull()?.let { kotlin.math.abs(it) } ?: 0.0
            else -> 0
        }
    }
    
    private fun round(value: Any?, decimals: Int): Number {
        val number = when (value) {
            is Number -> value.toDouble()
            is String -> value.toDoubleOrNull() ?: return 0.0
            else -> return 0.0
        }
        
        val factor = Math.pow(10.0, decimals.toDouble())
        return Math.round(number * factor) / factor
    }
    
    private fun floor(value: Any?): Long {
        val number = when (value) {
            is Number -> value.toDouble()
            is String -> value.toDoubleOrNull() ?: return 0L
            else -> return 0L
        }
        return kotlin.math.floor(number).toLong()
    }
    
    private fun ceil(value: Any?): Long {
        val number = when (value) {
            is Number -> value.toDouble()
            is String -> value.toDoubleOrNull() ?: return 0L
            else -> return 0L
        }
        return kotlin.math.ceil(number).toLong()
    }
    
    private fun formatDate(value: Any?, pattern: String): String {
        return try {
            val date = when (value) {
                is Date -> value
                is Long -> Date(value)
                is String -> {
                    val formats = listOf(
                        "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'",
                        "yyyy-MM-dd'T'HH:mm:ss'Z'",
                        "yyyy-MM-dd'T'HH:mm:ss",
                        "yyyy-MM-dd HH:mm:ss",
                        "yyyy-MM-dd",
                        "dd/MM/yyyy HH:mm:ss",
                        "dd/MM/yyyy"
                    )
                    var parsed: Date? = null
                    for (format in formats) {
                        try {
                            parsed = SimpleDateFormat(format, Locale.getDefault()).parse(value)
                            if (parsed != null) break
                        } catch (e: Exception) {
                            // Try next format
                        }
                    }
                    parsed ?: return value
                }
                else -> return valueToString(value)
            }
            
            SimpleDateFormat(pattern, Locale.forLanguageTag("pt-BR")).format(date)
        } catch (e: Exception) {
            valueToString(value)
        }
    }
    
    private fun defaultValue(value: Any?, default: String): Any? {
        val str = valueToString(value)
        return if (str.isBlank()) default else value
    }
}
