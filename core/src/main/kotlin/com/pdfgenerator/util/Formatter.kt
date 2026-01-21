package com.pdfgenerator.util

import java.text.NumberFormat
import java.text.SimpleDateFormat
import java.util.*

object Formatter {
    
    private val ptBrLocale: Locale = Locale.forLanguageTag("pt-BR")
    private val currencyFormat = NumberFormat.getCurrencyInstance(ptBrLocale)
    private val numberFormat = NumberFormat.getNumberInstance(ptBrLocale)
    private val dateFormat = SimpleDateFormat("dd/MM/yyyy", ptBrLocale)
    private val dateTimeFormat = SimpleDateFormat("dd/MM/yyyy HH:mm", ptBrLocale)
    
    fun format(value: Any?, format: String? = "text"): String {
        if (value == null) return ""
        
        return when (format?.lowercase() ?: "text") {
            "currency" -> formatCurrency(value)
            "number" -> formatNumber(value)
            "date" -> formatDate(value)
            "datetime" -> formatDateTime(value)
            "uppercase" -> value.toString().uppercase()
            "lowercase" -> value.toString().lowercase()
            else -> value.toString()
        }
    }
    
    private fun formatCurrency(value: Any): String {
        return when (value) {
            is Number -> currencyFormat.format(value)
            is String -> {
                value.toDoubleOrNull()?.let { currencyFormat.format(it) } ?: value
            }
            else -> value.toString()
        }
    }
    
    private fun formatNumber(value: Any): String {
        return when (value) {
            is Number -> numberFormat.format(value)
            is String -> {
                value.toDoubleOrNull()?.let { numberFormat.format(it) } ?: value
            }
            else -> value.toString()
        }
    }
    
    private fun formatDate(value: Any): String {
        return when (value) {
            is Date -> dateFormat.format(value)
            is Long -> dateFormat.format(Date(value))
            is String -> {
                tryParseDate(value)?.let { dateFormat.format(it) } ?: value
            }
            else -> value.toString()
        }
    }
    
    private fun formatDateTime(value: Any): String {
        return when (value) {
            is Date -> dateTimeFormat.format(value)
            is Long -> dateTimeFormat.format(Date(value))
            is String -> {
                tryParseDate(value)?.let { dateTimeFormat.format(it) } ?: value
            }
            else -> value.toString()
        }
    }
    
    private fun tryParseDate(value: String): Date? {
        val formats = listOf(
            "yyyy-MM-dd",
            "dd/MM/yyyy",
            "MM/dd/yyyy",
            "yyyy-MM-dd'T'HH:mm:ss",
            "yyyy-MM-dd'T'HH:mm:ss.SSS"
        )
        
        for (format in formats) {
            try {
                return SimpleDateFormat(format, Locale.US).parse(value)
            } catch (e: Exception) {
                // Try next format
            }
        }
        
        return null
    }
}
