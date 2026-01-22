package com.pdfgenerator.util

import org.junit.jupiter.api.Test
import kotlin.test.assertFalse
import kotlin.test.assertTrue

class ConditionEvaluatorTest {
    @Test
    fun `should evaluate simple equality condition`() {
        val data = mapOf("status" to "active")

        assertTrue(ConditionEvaluator.evaluate("status == 'active'", data))
        assertFalse(ConditionEvaluator.evaluate("status == 'inactive'", data))
    }

    @Test
    fun `should evaluate simple inequality condition`() {
        val data = mapOf("status" to "active")

        assertTrue(ConditionEvaluator.evaluate("status != 'inactive'", data))
        assertFalse(ConditionEvaluator.evaluate("status != 'active'", data))
    }

    @Test
    fun `should evaluate numeric comparison greater than`() {
        val data = mapOf("age" to 25)

        assertTrue(ConditionEvaluator.evaluate("age > 20", data))
        assertFalse(ConditionEvaluator.evaluate("age > 30", data))
    }

    @Test
    fun `should evaluate numeric comparison less than`() {
        val data = mapOf("age" to 25)

        assertTrue(ConditionEvaluator.evaluate("age < 30", data))
        assertFalse(ConditionEvaluator.evaluate("age < 20", data))
    }

    @Test
    fun `should evaluate numeric comparison greater than or equal`() {
        val data = mapOf("age" to 25)

        assertTrue(ConditionEvaluator.evaluate("age >= 25", data))
        assertTrue(ConditionEvaluator.evaluate("age >= 20", data))
        assertFalse(ConditionEvaluator.evaluate("age >= 30", data))
    }

    @Test
    fun `should evaluate numeric comparison less than or equal`() {
        val data = mapOf("age" to 25)

        assertTrue(ConditionEvaluator.evaluate("age <= 25", data))
        assertTrue(ConditionEvaluator.evaluate("age <= 30", data))
        assertFalse(ConditionEvaluator.evaluate("age <= 20", data))
    }

    @Test
    fun `should evaluate nested object property`() {
        val data =
            mapOf(
                "user" to
                    mapOf(
                        "active" to true,
                    ),
            )

        assertTrue(ConditionEvaluator.evaluate("user.active == true", data))
        assertFalse(ConditionEvaluator.evaluate("user.active == false", data))
    }

    @Test
    fun `should evaluate array length`() {
        val data =
            mapOf(
                "items" to listOf("item1", "item2", "item3"),
            )

        assertTrue(ConditionEvaluator.evaluate("items.length > 0", data))
        assertTrue(ConditionEvaluator.evaluate("items.length == 3", data))
        assertFalse(ConditionEvaluator.evaluate("items.length > 5", data))
    }

    @Test
    fun `should evaluate array size`() {
        val data =
            mapOf(
                "items" to listOf("item1", "item2"),
            )

        assertTrue(ConditionEvaluator.evaluate("items.size == 2", data))
        assertFalse(ConditionEvaluator.evaluate("items.size == 3", data))
    }

    @Test
    fun `should evaluate indexed array access`() {
        val data =
            mapOf(
                "items" to
                    listOf(
                        mapOf("name" to "Item 1"),
                        mapOf("name" to "Item 2"),
                    ),
            )

        assertTrue(ConditionEvaluator.evaluate("items.0.name == 'Item 1'", data))
        assertTrue(ConditionEvaluator.evaluate("items.1.name == 'Item 2'", data))
    }

    @Test
    fun `should return true for null condition`() {
        val data = emptyMap<String, Any?>()

        assertTrue(ConditionEvaluator.evaluate(null, data))
    }

    @Test
    fun `should return true for empty condition`() {
        val data = emptyMap<String, Any?>()

        assertTrue(ConditionEvaluator.evaluate("", data))
    }

    @Test
    fun `should return false for condition with missing property`() {
        val data = emptyMap<String, Any?>()

        assertFalse(ConditionEvaluator.evaluate("user.active == true", data))
    }

    @Test
    fun `should evaluate boolean property`() {
        val data = mapOf("active" to true)

        assertTrue(ConditionEvaluator.evaluate("active == true", data))
        assertFalse(ConditionEvaluator.evaluate("active == false", data))
    }

    @Test
    fun `should evaluate string equality with single quotes`() {
        val data = mapOf("status" to "pending")

        assertTrue(ConditionEvaluator.evaluate("status == 'pending'", data))
    }

    @Test
    fun `should evaluate string equality with double quotes`() {
        val data = mapOf("status" to "pending")

        assertTrue(ConditionEvaluator.evaluate("status == \"pending\"", data))
    }

    @Test
    fun `should handle null values`() {
        val data = mapOf("value" to null)

        assertTrue(ConditionEvaluator.evaluate("value == null", data))
    }

    @Test
    fun `should evaluate deeply nested properties`() {
        val data =
            mapOf(
                "invoice" to
                    mapOf(
                        "customer" to
                            mapOf(
                                "address" to
                                    mapOf(
                                        "city" to "New York",
                                    ),
                            ),
                    ),
            )

        assertTrue(ConditionEvaluator.evaluate("invoice.customer.address.city == 'New York'", data))
    }

    @Test
    fun `should evaluate with numeric property in nested object`() {
        val data =
            mapOf(
                "invoice" to
                    mapOf(
                        "total" to 1500.50,
                    ),
            )

        assertTrue(ConditionEvaluator.evaluate("invoice.total > 1000", data))
        assertTrue(ConditionEvaluator.evaluate("invoice.total >= 1500.50", data))
        assertFalse(ConditionEvaluator.evaluate("invoice.total < 1000", data))
    }
}
