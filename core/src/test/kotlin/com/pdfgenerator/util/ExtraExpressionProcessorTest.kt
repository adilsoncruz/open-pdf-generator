package com.pdfgenerator.util

import org.junit.jupiter.api.Assertions.*
import org.junit.jupiter.api.Test

class ExtraExpressionProcessorTest {

    @Test
    fun `test resolvePropPath with lists`() {
        val data = mapOf(
            "myList" to listOf("a", "b", "c")
        )
        // Pass the whole data as '.' binding? Let's just use the binding
        val resultLength = ExpressionProcessor.process("myList.length", data, null)
        assertEquals("3", resultLength)
        
        val resultSize = ExpressionProcessor.process("myList.size", data, null)
        assertEquals("3", resultSize)
        
        val resultIndex0 = ExpressionProcessor.process("myList.0", data, null)
        assertEquals("a", resultIndex0)

        val resultIndex1 = ExpressionProcessor.process("myList.1", data, null)
        assertEquals("b", resultIndex1)
        
        val resultOob = ExpressionProcessor.process("myList.5", data, null)
        assertEquals("", resultOob)
    }
}
