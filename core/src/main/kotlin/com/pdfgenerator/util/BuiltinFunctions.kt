package com.pdfgenerator.util

import java.text.DecimalFormat
import java.text.DecimalFormatSymbols
import java.text.NumberFormat
import java.text.SimpleDateFormat
import java.util.Currency
import java.util.Date
import java.util.Locale

object BuiltinFunctions {
    private val dateFormats = listOf(
        "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'", "yyyy-MM-dd'T'HH:mm:ss'Z'",
        "yyyy-MM-dd'T'HH:mm:ss", "yyyy-MM-dd HH:mm:ss", "yyyy-MM-dd",
        "dd/MM/yyyy HH:mm:ss", "dd/MM/yyyy",
    )

    fun apply(
        value: Any?,
        functionName: String,
        args: List<String> = emptyList(),
    ): Any? = when (functionName.lowercase()) {
        "uppercase", "upper" -> toUpperCase(value)
        "lowercase", "lower" -> toLowerCase(value)
        "capitalize", "cap" -> capitalize(value)
        "format" -> format(value, args.getOrNull(0) ?: "#,##0.00", args.getOrNull(1) ?: "en-US")
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
        "concat" -> concat(value, args)
        else -> value
    }

    fun valueToString(value: Any?): String = when (value) {
        null -> ""
        is String -> value
        is Number, is Boolean -> value.toString()
        is List<*> -> value.joinToString(", ")
        is Array<*> -> value.joinToString(", ")
        else -> value.toString()
    }

    fun toUpperCase(value: Any?): String = valueToString(value).uppercase()

    fun toLowerCase(value: Any?): String = valueToString(value).lowercase()

    fun capitalize(value: Any?): String =
        valueToString(value).split(" ").joinToString(" ") { word ->
            word.lowercase().replaceFirstChar { it.uppercase() }
        }

    fun trim(value: Any?): String = valueToString(value).trim()

    fun truncate(value: Any?, maxLength: Int, suffix: String): String {
        val str = valueToString(value)
        return if (str.length > maxLength) str.take(maxLength - suffix.length) + suffix else str
    }

    fun padLeft(value: Any?, length: Int, padChar: String): String =
        valueToString(value).padStart(length, padChar.firstOrNull() ?: ' ')

    fun padRight(value: Any?, length: Int, padChar: String): String =
        valueToString(value).padEnd(length, padChar.firstOrNull() ?: ' ')

    fun replace(value: Any?, oldStr: String, newStr: String): String =
        valueToString(value).replace(oldStr, newStr)

    fun prefix(value: Any?, prefixStr: String): String = prefixStr + valueToString(value)

    fun suffix(value: Any?, suffixStr: String): String = valueToString(value) + suffixStr

    fun reverse(value: Any?): String = valueToString(value).reversed()

    fun join(value: Any?, separator: String): String = when (value) {
        is List<*> -> value.filterNotNull().joinToString(separator)
        is Array<*> -> value.filterNotNull().joinToString(separator)
        else -> valueToString(value)
    }

    fun first(value: Any?): Any? = when (value) {
        is List<*> -> value.firstOrNull()
        is Array<*> -> value.firstOrNull()
        is String -> value.firstOrNull()?.toString() ?: ""
        else -> value
    }

    fun last(value: Any?): Any? = when (value) {
        is List<*> -> value.lastOrNull()
        is Array<*> -> value.lastOrNull()
        is String -> value.lastOrNull()?.toString() ?: ""
        else -> value
    }

    fun length(value: Any?): Int = when (value) {
        is List<*> -> value.size
        is Array<*> -> value.size
        is String -> value.length
        else -> valueToString(value).length
    }

    fun concat(value: Any?, args: List<String>): String {
        val separator = args.getOrNull(0) ?: ""
        val parts = mutableListOf(valueToString(value))
        for (i in 1 until args.size) parts.add(args[i])
        return parts.joinToString(separator)
    }

    fun format(value: Any?, pattern: String, localeTag: String = "en-US"): String {
        val number = when (value) {
            is Number -> value.toDouble()
            is String -> value.toDoubleOrNull() ?: return value
            else -> return valueToString(value)
        }
        return try {
            val locale = if (localeTag == "pt-BR") Locale.forLanguageTag("pt-BR") else Locale.US
            val symbols = DecimalFormatSymbols(locale)
            DecimalFormat(pattern, symbols).format(number)
        } catch (e: Exception) {
            valueToString(value)
        }
    }

    fun formatCurrency(value: Any?, currencyCode: String): String {
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

    fun numberFormat(value: Any?, locale: String): String {
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

    fun abs(value: Any?): Number = when (value) {
        is Int -> kotlin.math.abs(value)
        is Long -> kotlin.math.abs(value)
        is Float -> kotlin.math.abs(value)
        is Double -> kotlin.math.abs(value)
        is Number -> kotlin.math.abs(value.toDouble())
        is String -> value.toDoubleOrNull()?.let { kotlin.math.abs(it) } ?: 0.0
        else -> 0
    }

    fun round(value: Any?, decimals: Int): Number {
        val number = when (value) {
            is Number -> value.toDouble()
            is String -> value.toDoubleOrNull() ?: return 0.0
            else -> return 0.0
        }
        val factor = Math.pow(10.0, decimals.toDouble())
        return Math.round(number * factor) / factor
    }

    fun floor(value: Any?): Long {
        val number = when (value) {
            is Number -> value.toDouble()
            is String -> value.toDoubleOrNull() ?: return 0L
            else -> return 0L
        }
        return kotlin.math.floor(number).toLong()
    }

    fun ceil(value: Any?): Long {
        val number = when (value) {
            is Number -> value.toDouble()
            is String -> value.toDoubleOrNull() ?: return 0L
            else -> return 0L
        }
        return kotlin.math.ceil(number).toLong()
    }

    fun formatDate(value: Any?, pattern: String): String {
        return try {
            val date = when (value) {
                is Date -> value
                is Long -> Date(value)
                is String -> {
                    var parsed: Date? = null
                    for (format in dateFormats) {
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

    fun defaultValue(value: Any?, default: String): Any? =
        if (valueToString(value).isBlank()) default else value
}
