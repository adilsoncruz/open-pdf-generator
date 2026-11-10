package com.pdfgenerator.suite

import com.pdfgenerator.util.BuiltinFunctions
import org.junit.jupiter.api.Test
import java.util.Date
import kotlin.test.assertEquals
import kotlin.test.assertTrue

class BuiltinFunctionsCoverageTest {

    @Test
    fun `test BuiltinFunctions math operations`() {
        assertEquals(10, BuiltinFunctions.abs(10))
        assertEquals(15L, BuiltinFunctions.abs(-15L))
        assertEquals(2.5f, BuiltinFunctions.abs(-2.5f))
        assertEquals(3.14, BuiltinFunctions.abs(-3.14))
        assertEquals(4.5, BuiltinFunctions.abs("-4.5"))
        assertEquals(0.0, BuiltinFunctions.abs("invalid"))
        assertEquals(0, BuiltinFunctions.abs(null))

        assertEquals(3.14, BuiltinFunctions.round(3.14159, 2))
        assertEquals(0.0, BuiltinFunctions.round("invalid", 2))
        assertEquals(0.0, BuiltinFunctions.round(null, 2))

        assertEquals(3L, BuiltinFunctions.floor(3.99))
        assertEquals(3L, BuiltinFunctions.floor("3.99"))
        assertEquals(0L, BuiltinFunctions.floor("invalid"))
        assertEquals(0L, BuiltinFunctions.floor(null))

        assertEquals(4L, BuiltinFunctions.ceil(3.01))
        assertEquals(4L, BuiltinFunctions.ceil("3.01"))
        assertEquals(0L, BuiltinFunctions.ceil("invalid"))
        assertEquals(0L, BuiltinFunctions.ceil(null))
    }

    @Test
    fun `test BuiltinFunctions string and formatting operations`() {
        assertEquals("Hello World", BuiltinFunctions.capitalize("hello world"))
        assertEquals("123", BuiltinFunctions.defaultValue(null, "123"))
        assertEquals("abc", BuiltinFunctions.defaultValue("abc", "123"))

        assertEquals("Hello...", BuiltinFunctions.truncate("Hello World From Antigravity", 8, "..."))
        assertEquals("Short", BuiltinFunctions.truncate("Short", 10, "..."))

        assertEquals("00042", BuiltinFunctions.padLeft("42", 5, "0"))
        assertEquals("42   ", BuiltinFunctions.padRight("42", 5, " "))

        // Array and List valueToString
        assertEquals("a, b", BuiltinFunctions.valueToString(listOf("a", "b")))
        assertEquals("x, y", BuiltinFunctions.valueToString(arrayOf("x", "y")))

        // numberFormat locales
        assertTrue(BuiltinFunctions.numberFormat(1234.56, "pt-BR").isNotEmpty())
        assertTrue(BuiltinFunctions.numberFormat(1234.56, "en-US").isNotEmpty())
        assertTrue(BuiltinFunctions.numberFormat(1234.56, "es-AR").isNotEmpty())
        assertTrue(BuiltinFunctions.numberFormat(1234.56, "es-MX").isNotEmpty())
        assertTrue(BuiltinFunctions.numberFormat(1234.56, "unknown").isNotEmpty())
        assertEquals("not-a-number", BuiltinFunctions.numberFormat("not-a-number", "en-US"))
        assertEquals("", BuiltinFunctions.numberFormat(null, "en-US"))

        // formatCurrency
        assertTrue(BuiltinFunctions.formatCurrency(100.5, "USD").isNotEmpty())
        assertTrue(BuiltinFunctions.formatCurrency(100.5, "EUR").isNotEmpty())
        assertTrue(BuiltinFunctions.formatCurrency(100.5, "BRL").isNotEmpty())
        assertTrue(BuiltinFunctions.formatCurrency(100.5, "ARS").isNotEmpty())
        assertTrue(BuiltinFunctions.formatCurrency(100.5, "MXN").isNotEmpty())
        assertEquals("invalid", BuiltinFunctions.formatCurrency("invalid", "BRL"))

        // formatDate
        assertTrue(BuiltinFunctions.formatDate(Date(), "yyyy-MM-dd").isNotEmpty())
        assertTrue(BuiltinFunctions.formatDate(System.currentTimeMillis(), "dd/MM/yyyy").isNotEmpty())
        assertEquals("2026-11-10", BuiltinFunctions.formatDate("2026-11-10", "yyyy-MM-dd"))
        assertEquals("invalid-date", BuiltinFunctions.formatDate("invalid-date", "dd/MM/yyyy"))
        assertEquals("", BuiltinFunctions.formatDate(null, "dd/MM/yyyy"))

        // apply dispatch
        assertEquals("ABC", BuiltinFunctions.apply("abc", "uppercase"))
        assertEquals("abc", BuiltinFunctions.apply("ABC", "lowercase"))
        assertEquals("custom", BuiltinFunctions.apply("custom", "nonexistent_fn"))
    }
}
