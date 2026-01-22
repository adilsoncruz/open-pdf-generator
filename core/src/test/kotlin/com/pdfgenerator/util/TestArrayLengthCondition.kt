package com.pdfgenerator.util

import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Assertions.assertFalse
import org.junit.jupiter.api.Assertions.assertTrue
import org.junit.jupiter.api.Test

class TestArrayLengthCondition {
    @Test
    fun `should evaluate array length condition correctly`() {
        val data =
            mapOf(
                "invoice" to
                    mapOf(
                        "taxes" to
                            listOf(
                                mapOf("name" to "IVA", "value" to 21.0),
                                mapOf("name" to "IIBB", "value" to 5.0),
                            ),
                    ),
            )

        // Should be true because taxes.length = 2 > 1
        val result1 = ConditionEvaluator.evaluate("invoice.taxes.length > 1", data)
        assertTrue(result1, "invoice.taxes.length > 1 should be true")

        // Should be false because taxes.length = 2 < 3
        val result2 = ConditionEvaluator.evaluate("invoice.taxes.length > 3", data)
        assertFalse(result2, "invoice.taxes.length > 3 should be false")

        // Should be true because taxes.length = 2 == 2
        val result3 = ConditionEvaluator.evaluate("invoice.taxes.length == 2", data)
        assertTrue(result3, "invoice.taxes.length == 2 should be true")

        // Also test with size
        val result4 = ConditionEvaluator.evaluate("invoice.taxes.size > 1", data)
        assertTrue(result4, "invoice.taxes.size > 1 should be true")
    }

    @Test
    fun `should evaluate empty array length`() {
        val data =
            mapOf(
                "invoice" to
                    mapOf(
                        "taxes" to emptyList<Any>(),
                    ),
            )

        // Should be false because taxes.length = 0
        val result = ConditionEvaluator.evaluate("invoice.taxes.length > 0", data)
        assertFalse(result, "invoice.taxes.length > 0 should be false for empty array")

        // Should be true because taxes.length = 0
        val result2 = ConditionEvaluator.evaluate("invoice.taxes.length == 0", data)
        assertTrue(result2, "invoice.taxes.length == 0 should be true for empty array")
    }

    @Test
    fun `should access array element by index`() {
        val data =
            mapOf(
                "items" to
                    listOf(
                        mapOf("name" to "Product A", "price" to 100.0),
                        mapOf("name" to "Product B", "price" to 200.0),
                    ),
            )

        // Access first item
        val value = DataBindingResolver.resolve("items.0.name", data)
        assertEquals("Product A", value)

        // Access second item
        val value2 = DataBindingResolver.resolve("items.1.price", data)
        assertEquals(200.0, value2)
    }
}
