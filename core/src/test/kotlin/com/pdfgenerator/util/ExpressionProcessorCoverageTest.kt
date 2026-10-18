package com.pdfgenerator.util

import org.junit.jupiter.api.Test
import kotlin.test.assertEquals

class ExpressionProcessorCoverageTest {

    @Test
    fun `test cache eviction`() {
        // Line 23: MAX_EXPRESSION_CACHE_SIZE is 1024
        // To trigger eviction, we need to process 1025 unique expressions
        for (i in 0..1025) {
            ExpressionProcessor.process("var$i", emptyMap())
        }
    }

    @Test
    fun `test applyTemplate non-map value`() {
        // Line 108: if (value !is Map<*, *>)
        assertEquals("string", ExpressionProcessor.process("val | template:'\${prop}'", mapOf("val" to "string")))
    }

    @Test
    fun `test applyTemplate with multiple transformations`() {
        // Line 123-127
        val data = mapOf("obj" to mapOf("name" to "  john  "))
        val method = ExpressionProcessor::class.java.getDeclaredMethod("applyTemplate", Any::class.java, String::class.java)
        method.isAccessible = true
        val result = method.invoke(ExpressionProcessor, data["obj"], "\${name | trim | upper}")
        assertEquals("JOHN", result)
    }

    @Test
    fun `test resolvePropPath edge cases`() {
        // Line 142-154
        // Not a map or list
        assertEquals("", ExpressionProcessor.process("obj.nested.name", mapOf("obj" to "string")))
        
        // List size and out of bounds
        val listData = mapOf("list" to listOf("a", "b"))
        assertEquals("2", ExpressionProcessor.process("list.size", listData))
        assertEquals("", ExpressionProcessor.process("list.5", listData)) // returns null, so empty string
        assertEquals("", ExpressionProcessor.process("list.-1", listData)) // out of bounds
        assertEquals("a", ExpressionProcessor.process("list.0", listData)) 
    }

    @Test
    fun `test concat empty separator and no args`() {
        // Line 164
        assertEquals("val", ExpressionProcessor.process("val | concat", mapOf("val" to "val")))
    }

    @Test
    fun `test parseExpression empty`() {
        // Line 190
        assertEquals("", ExpressionProcessor.process("  ", emptyMap()))
        assertEquals("", ExpressionProcessor.process(" | ", emptyMap()))
    }

    @Test
    fun `test parseTransformation argument fallbacks`() {
        // Line 217-221
        assertEquals("val", ExpressionProcessor.process("val | replace:'old':", mapOf("val" to "val"))) // missing 2nd arg
        assertEquals("long...", ExpressionProcessor.process("val | truncate:7", mapOf("val" to "longvalue"))) // missing suffix arg
    }

    @Test
    fun `test valueToString arrays`() {
        // Line 235-237
        assertEquals("1, 2", ExpressionProcessor.process("arr", mapOf("arr" to arrayOf(1, 2))))
    }

    @Test
    fun `test capitalize empty word`() {
        // Line 252
        assertEquals("  ", ExpressionProcessor.process("val | cap", mapOf("val" to "  ")))
    }

    @Test
    fun `test truncate no change`() {
        // Line 266-269
        assertEquals("val", ExpressionProcessor.process("val | truncate:10", mapOf("val" to "val")))
    }

    @Test
    fun `test pad empty char`() {
        // Line 279, 289
        assertEquals(" val", ExpressionProcessor.process("val | padleft:4:''", mapOf("val" to "val")))
        assertEquals("val ", ExpressionProcessor.process("val | padright:4:''", mapOf("val" to "val")))
    }

    @Test
    fun `test join, first, last on arrays and strings`() {
        // Line 324-342
        val arrData = mapOf("arr" to arrayOf("a", "b", "c"), "str" to "xyz")
        assertEquals("a, b, c", ExpressionProcessor.process("arr | join", arrData))
        assertEquals("a", ExpressionProcessor.process("arr | first", arrData))
        assertEquals("c", ExpressionProcessor.process("arr | last", arrData))
        assertEquals("x", ExpressionProcessor.process("str | first", arrData))
        assertEquals("z", ExpressionProcessor.process("str | last", arrData))
    }

    @Test
    fun `test format fallbacks`() {
        // Number conversions
        assertEquals("notanumber", ExpressionProcessor.process("val | format", mapOf("val" to "notanumber")))
        assertEquals("notanumber", ExpressionProcessor.process("val | currency", mapOf("val" to "notanumber")))
        assertEquals("notanumber", ExpressionProcessor.process("val | numfmt", mapOf("val" to "notanumber")))
    }
    
    @Test
    fun `test length on array`() {
        assertEquals("3", ExpressionProcessor.process("arr | length", mapOf("arr" to arrayOf(1,2,3))))
    }
    
    @Test
    fun `test abs fallbacks`() {
        assertEquals("42.0", ExpressionProcessor.process("val | abs", mapOf("val" to "-42.0")))
        assertEquals("0.0", ExpressionProcessor.process("val | abs", mapOf("val" to "notanumber")))
    }
    
    @Test
    fun `test round fallbacks`() {
        assertEquals("0.0", ExpressionProcessor.process("val | round", mapOf("val" to "notanumber")))
    }

    @Test
    fun `test floor ceil fallbacks`() {
        assertEquals("0", ExpressionProcessor.process("val | floor", mapOf("val" to "notanumber")))
        assertEquals("0", ExpressionProcessor.process("val | ceil", mapOf("val" to "notanumber")))
    }

    @Test
    fun `test date fallbacks`() {
        assertEquals("notadate", ExpressionProcessor.process("val | date", mapOf("val" to "notadate")))
    }
}
