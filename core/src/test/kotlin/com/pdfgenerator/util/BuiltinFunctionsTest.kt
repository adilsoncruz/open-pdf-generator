package com.pdfgenerator.util

import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Assertions.assertTrue
import org.junit.jupiter.api.Test
import java.util.Date

class BuiltinFunctionsTest {

    @Test
    fun `test string transformations`() {
        assertEquals("HELLO", BuiltinFunctions.toUpperCase("hello"))
        assertEquals("hello", BuiltinFunctions.toLowerCase("HELLO"))
        assertEquals("Hello World", BuiltinFunctions.capitalize("hello world"))
        assertEquals("clean", BuiltinFunctions.trim("  clean  "))
        assertEquals("hel...", BuiltinFunctions.truncate("hello world", 6, "..."))
        assertEquals("hello", BuiltinFunctions.truncate("hello", 10, "..."))
        assertEquals("007", BuiltinFunctions.padLeft(7, 3, "0"))
        assertEquals("700", BuiltinFunctions.padRight(7, 3, "0"))
        assertEquals("foo bar", BuiltinFunctions.replace("foo baz", "baz", "bar"))
        assertEquals("prefix-val", BuiltinFunctions.prefix("val", "prefix-"))
        assertEquals("val-suffix", BuiltinFunctions.suffix("val", "-suffix"))
        assertEquals("cba", BuiltinFunctions.reverse("abc"))
        assertEquals("default", BuiltinFunctions.defaultValue("", "default"))
        assertEquals("actual", BuiltinFunctions.defaultValue("actual", "default"))
    }

    @Test
    fun `test collection operations`() {
        val list = listOf("a", "b", "c")
        val array = arrayOf(1, 2, 3)
        assertEquals("a, b, c", BuiltinFunctions.join(list, ", "))
        assertEquals("1-2-3", BuiltinFunctions.join(array, "-"))
        assertEquals("plain", BuiltinFunctions.join("plain", ","))

        assertEquals("a", BuiltinFunctions.first(list))
        assertEquals(1, BuiltinFunctions.first(array))
        assertEquals("x", BuiltinFunctions.first("xyz"))
        assertEquals(42, BuiltinFunctions.first(42))

        assertEquals("c", BuiltinFunctions.last(list))
        assertEquals(3, BuiltinFunctions.last(array))
        assertEquals("z", BuiltinFunctions.last("xyz"))
        assertEquals(42, BuiltinFunctions.last(42))

        assertEquals(3, BuiltinFunctions.length(list))
        assertEquals(3, BuiltinFunctions.length(array))
        assertEquals(5, BuiltinFunctions.length("hello"))
        assertEquals(2, BuiltinFunctions.length(42))
    }

    @Test
    fun `test numeric and math functions`() {
        assertEquals(10, BuiltinFunctions.abs(-10))
        assertEquals(10L, BuiltinFunctions.abs(-10L))
        assertEquals(10.5f, BuiltinFunctions.abs(-10.5f))
        assertEquals(10.5, BuiltinFunctions.abs(-10.5))
        assertEquals(42.0, BuiltinFunctions.abs("-42.0"))
        assertEquals(0.0, BuiltinFunctions.abs("invalid"))

        assertEquals(10.55, BuiltinFunctions.round(10.546, 2))
        assertEquals(0.0, BuiltinFunctions.round("invalid", 2))

        assertEquals(10L, BuiltinFunctions.floor(10.9))
        assertEquals(0L, BuiltinFunctions.floor("invalid"))

        assertEquals(11L, BuiltinFunctions.ceil(10.1))
        assertEquals(0L, BuiltinFunctions.ceil("invalid"))
    }

    @Test
    fun `test format and currency functions`() {
        val formattedUs = BuiltinFunctions.format(1234.56, "#,##0.00", "en-US")
        assertTrue(formattedUs.contains("1,234.56"))

        val formattedPtBr = BuiltinFunctions.format(1234.56, "#,##0.00", "pt-BR")
        assertTrue(formattedPtBr.contains("1.234,56"))

        assertEquals("invalid", BuiltinFunctions.format("invalid", "#,##0.00"))
        assertEquals("", BuiltinFunctions.format(null, "#,##0.00"))

        val currBrl = BuiltinFunctions.formatCurrency(100.5, "BRL")
        assertTrue(currBrl.contains("100,50") || currBrl.contains("R$"))

        val numFmt = BuiltinFunctions.numberFormat(1234.5, "pt-BR")
        assertTrue(numFmt.contains("1.234,5"))
    }

    @Test
    fun `test date formatting`() {
        val date = Date(1600000000000L)
        val formatted = BuiltinFunctions.formatDate(date, "yyyy-MM-dd")
        assertTrue(formatted.matches(Regex("""\d{4}-\d{2}-\d{2}""")))

        val fromTimestamp = BuiltinFunctions.formatDate(1600000000000L, "yyyy")
        assertTrue(fromTimestamp.matches(Regex("""\d{4}""")))

        val fromString = BuiltinFunctions.formatDate("2026-10-27", "dd/MM/yyyy")
        assertEquals("27/10/2026", fromString)

        assertEquals("notadate", BuiltinFunctions.formatDate("notadate", "dd/MM/yyyy"))
        assertEquals("", BuiltinFunctions.formatDate(null, "dd/MM/yyyy"))
    }

    @Test
    fun `test apply dispatcher and fallback`() {
        assertEquals("BAR", BuiltinFunctions.apply("bar", "uppercase"))
        assertEquals("bar", BuiltinFunctions.apply("BAR", "lowercase"))
        assertEquals("unknown-fn", BuiltinFunctions.apply("unknown-fn", "nonexistent"))
    }
}
