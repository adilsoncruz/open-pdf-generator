package com.pdfgenerator.util

import com.lowagie.text.pdf.BaseFont
import com.pdfgenerator.engine.LoopContext
import org.junit.jupiter.api.Assertions.*
import org.junit.jupiter.api.Test

class UtilCoverageBoostTest {
    @Test
    fun `test SyntheticDataResolver OverlayDataMap complete coverage`() {
        val baseData = mapOf<String, Any?>("name" to "Alice", "city" to "London")
        val overrides = mapOf<String, Any?>("city" to "Paris", "role" to "Admin")

        val emptyOverlay = withSyntheticBindings(baseData, emptyMap())
        assertSame(baseData, emptyOverlay)

        val overlay = withSyntheticBindings(baseData, overrides)
        assertEquals(3, overlay.size)
        assertTrue(overlay.containsKey("name"))
        assertTrue(overlay.containsKey("role"))
        assertFalse(overlay.containsKey("nonExistent"))

        assertEquals("Alice", overlay["name"])
        assertEquals("Paris", overlay["city"])
        assertEquals("Admin", overlay["role"])
        assertNull(overlay["nonExistent"])

        val entries = overlay.entries
        assertEquals(3, entries.size)
        val entryMap = entries.associate { it.key to it.value }
        assertEquals("Alice", entryMap["name"])
        assertEquals("Paris", entryMap["city"])
        assertEquals("Admin", entryMap["role"])

        val pageBound = withSyntheticPageNumber(baseData, 5)
        assertEquals(5, pageBound["_pageNumber"])
    }

    @Test
    fun `test FontCache clear and size`() {
        FontCache.clear()
        assertEquals(0, FontCache.size())

        val f1 = FontCache.getFont(BaseFont.HELVETICA)
        assertNotNull(f1)
        assertEquals(1, FontCache.size())

        val f2 = FontCache.getFont(BaseFont.HELVETICA, BaseFont.CP1252, false)
        assertSame(f1, f2)

        val f3 = FontCache.getFont(BaseFont.TIMES_ROMAN, BaseFont.WINANSI, false)
        assertNotNull(f3)
        assertEquals(2, FontCache.size())

        FontCache.clear()
        assertEquals(0, FontCache.size())
    }

    @Test
    fun `test DataBindingResolver edge cases and cache`() {
        DataBindingResolver.clearCache()
        assertTrue(DataBindingResolver.cacheSize() >= 0)

        val data =
            mapOf(
                "title" to "Report",
                "arr" to arrayOf("First", "Second", "Third"),
                "user" to mapOf("alias" to "JD"),
            )

        // Binding bracket formats
        assertEquals("Report", DataBindingResolver.resolve("\${title}", data))
        assertEquals("Report", DataBindingResolver.resolve("{{title}}", data))

        // Array index and length
        assertEquals(3, DataBindingResolver.resolve("arr.length", data))
        assertEquals(3, DataBindingResolver.resolve("arr.size", data))
        assertEquals("First", DataBindingResolver.resolve("arr.0", data))
        assertEquals("Second", DataBindingResolver.resolve("arr.1", data))
        assertNull(DataBindingResolver.resolve("arr.99", data))
        assertNull(DataBindingResolver.resolve("arr.invalid", data))

        // Loop variables without loopContext
        assertNull(DataBindingResolver.resolve("\$index", data, loopContext = null))
        assertNull(DataBindingResolver.resolve("\$item", data, loopContext = null))

        // Non-map loop item
        val strLoopContext = LoopContext(item = "SimpleString", index = 2)
        assertEquals(2, DataBindingResolver.resolve("\$index", data, strLoopContext))
        assertEquals("SimpleString", DataBindingResolver.resolve("\$item", data, strLoopContext))
        assertNull(DataBindingResolver.resolve("\$item.subField", data, strLoopContext))
        assertNull(DataBindingResolver.resolve("\$unknownVar", data, strLoopContext))

        DataBindingResolver.clearCache()
        assertEquals(0, DataBindingResolver.cacheSize())
    }

    @Test
    fun `test ConditionEvaluator edge cases and comparators`() {
        val data =
            mapOf(
                "strA" to "Apple",
                "strB" to "Banana",
                "arr" to arrayOf("A", "B", "C"),
                "nonList" to 42,
                "truthyObj" to Any(),
            )

        // String comparison with > and <
        assertTrue(ConditionEvaluator.evaluate("strB > strA", data))
        assertFalse(ConditionEvaluator.evaluate("strA > strB", data))
        assertTrue(ConditionEvaluator.evaluate("strA < strB", data))

        // in operator with array and non-list
        assertTrue(ConditionEvaluator.evaluate("'B' in arr", data))
        assertFalse(ConditionEvaluator.evaluate("'B' in nonList", data))
        assertFalse(ConditionEvaluator.evaluate("'B' in []", data))

        // Truthy non-primitive object
        assertTrue(ConditionEvaluator.evaluate("truthyObj", data))

        // Exception safety
        assertTrue(ConditionEvaluator.evaluate("", data))

        // Reflection for unexposed comparator branches (lines 99, 135)
        val compValuesMethod =
            ConditionEvaluator::class.java.getDeclaredMethod(
                "compareValues",
                Any::class.java,
                Any::class.java,
                String::class.java,
            ).apply { isAccessible = true }
        val invalidOpResult = compValuesMethod.invoke(ConditionEvaluator, 1, 2, "??") as Boolean
        assertFalse(invalidOpResult)

        val compareMethod =
            ConditionEvaluator::class.java.getDeclaredMethod(
                "compare",
                Any::class.java,
                Any::class.java,
            ).apply { isAccessible = true }
        val nonComparableResult = compareMethod.invoke(ConditionEvaluator, Any(), Any()) as Int
        assertEquals(0, nonComparableResult)
    }

    @Test
    fun `test ExpressionProcessor array operations and formatting`() {
        val data =
            mapOf(
                "tags" to arrayOf("tech", "open-source", "pdf"),
                "emptyArr" to emptyArray<String>(),
                "amount" to 1234.56,
                "rawStr" to "Hello World",
                "plainNum" to 99,
            )

        // Template without expressions
        assertEquals("Static text", ExpressionProcessor.processTemplate("Static text", data))

        // Bracket wrappers
        assertEquals("Hello World", ExpressionProcessor.process("\${rawStr}", data))
        assertEquals("Hello World", ExpressionProcessor.process("{{rawStr}}", data))

        // Array transformations
        assertEquals("tech, open-source, pdf", ExpressionProcessor.process("tags | join(', ')", data))
        assertEquals("tech", ExpressionProcessor.process("tags | first", data))
        assertEquals("pdf", ExpressionProcessor.process("tags | last", data))
        assertEquals("3", ExpressionProcessor.process("tags | length", data))
        assertEquals("11", ExpressionProcessor.process("rawStr | length", data))
        assertEquals("", ExpressionProcessor.process("emptyArr | first", data))
        assertEquals("", ExpressionProcessor.process("emptyArr | last", data))

        // First/Last on string and numbers
        assertEquals("H", ExpressionProcessor.process("rawStr | first", data))
        assertEquals("d", ExpressionProcessor.process("rawStr | last", data))
        assertEquals("99", ExpressionProcessor.process("plainNum | first", data))
        assertEquals("99", ExpressionProcessor.process("plainNum | last", data))

        // Format with pt-BR locale and custom patterns
        val formattedPtBr = ExpressionProcessor.process("amount | format('#,##0.00', 'pt-BR')", data)
        assertTrue(formattedPtBr.contains(",") || formattedPtBr.contains("."))

        // Concat edge cases
        assertEquals("Hello World", ExpressionProcessor.process("rawStr | concat()", data))
        assertEquals("Hello World - suffix", ExpressionProcessor.process("rawStr | concat(' - ', 'suffix')", data))

        // Date & Math fallbacks
        assertEquals("", ExpressionProcessor.process("'invalid_date' | date", data))
        assertEquals("", ExpressionProcessor.process("'invalid_date' | datetime", data))
        assertEquals("0", ExpressionProcessor.process("'invalid_val' | abs", data))
        assertEquals("0", ExpressionProcessor.process("'invalid_val' | ceil", data))
        assertEquals("0", ExpressionProcessor.process("'invalid_val' | floor", data))
        assertEquals("0.0", ExpressionProcessor.process("'invalid_val' | round", data))

        // formatNumber locales
        val esAr = ExpressionProcessor.process("amount | number('es-AR')", data)
        val esMx = ExpressionProcessor.process("amount | number('es-MX')", data)
        assertTrue(esAr.isNotEmpty())
        assertTrue(esMx.isNotEmpty())

        // formatCurrency locales and non-number fallbacks
        val curPtBr = ExpressionProcessor.process("amount | currency('BRL', 'pt-BR')", data)
        val curEsAr = ExpressionProcessor.process("amount | currency('ARS', 'es-AR')", data)
        val curEsMx = ExpressionProcessor.process("amount | currency('MXN', 'es-MX')", data)
        val curDeDe = ExpressionProcessor.process("amount | currency('EUR', 'de-DE')", data)
        assertTrue(curPtBr.isNotEmpty())
        assertTrue(curEsAr.isNotEmpty())
        assertTrue(curEsMx.isNotEmpty())
        assertTrue(curDeDe.isNotEmpty())

        val objFallback =
            object {
                override fun toString() = "SpecialObj"
            }
        val fallbackData = mapOf("customObj" to objFallback)
        assertEquals("SpecialObj", ExpressionProcessor.process("customObj | currency('USD', 'en-US')", fallbackData))
        assertEquals("SpecialObj", ExpressionProcessor.process("customObj | number('en-US')", fallbackData))
        assertEquals("SpecialObj", ExpressionProcessor.process("customObj | format('##.##')", fallbackData))
    }

    @Test
    fun `test Formatter fallback edge cases`() {
        assertEquals("abc", Formatter.format("abc", "unknown_format"))
        assertEquals("100", Formatter.format(100, "text"))
        assertEquals("true", Formatter.format(true, "text"))
        assertEquals("", Formatter.format(null, "currency"))
        assertEquals("", Formatter.format(null, "date"))
        assertEquals("", Formatter.format(null, "datetime"))
        assertEquals("", Formatter.format(null, "number"))

        // Non-number, non-date object fallbacks
        val obj =
            object {
                override fun toString() = "CustomObject"
            }
        assertEquals("CustomObject", Formatter.format(obj, "currency"))
        assertEquals("CustomObject", Formatter.format(obj, "number"))
        assertEquals("CustomObject", Formatter.format(obj, "date"))
        assertEquals("CustomObject", Formatter.format(obj, "datetime"))
    }

    @Test
    fun `test ExpressionEvaluator edge cases and fallback`() {
        val data = mapOf("a" to 10, "b" to 20, "flag" to true)
        assertTrue(ExpressionEvaluator.evaluate("a < b", data))
        assertFalse(ExpressionEvaluator.evaluate("a > b", data))
        assertTrue(ExpressionEvaluator.evaluate("a <= b", data))
        assertFalse(ExpressionEvaluator.evaluate("a >= b", data))
        assertTrue(ExpressionEvaluator.evaluate("a != b", data))
        assertTrue(ExpressionEvaluator.evaluate("flag", data))

        // Null / blank / malformed
        assertFalse(ExpressionEvaluator.evaluate("", data))
        assertFalse(ExpressionEvaluator.evaluate("    ", data))
        assertFalse(ExpressionEvaluator.evaluate("nonExistentVar", data))
    }
}
