package com.pdfgenerator.util

import com.pdfgenerator.engine.LoopContext
import org.junit.jupiter.api.Nested
import org.junit.jupiter.api.Test
import kotlin.test.assertFalse
import kotlin.test.assertTrue

class ExpressionEvaluatorTest {
    @Nested
    inner class SimplePropertyEvaluation {
        @Test
        fun `should evaluate truthy boolean property`() {
            val data = mapOf("active" to true)

            assertTrue(ExpressionEvaluator.evaluate("active", data))
        }

        @Test
        fun `should evaluate falsy boolean property`() {
            val data = mapOf("active" to false)

            assertFalse(ExpressionEvaluator.evaluate("active", data))
        }

        @Test
        fun `should evaluate non-empty string as truthy`() {
            val data = mapOf("name" to "John")

            assertTrue(ExpressionEvaluator.evaluate("name", data))
        }

        @Test
        fun `should evaluate empty string as falsy`() {
            val data = mapOf("name" to "")

            assertFalse(ExpressionEvaluator.evaluate("name", data))
        }

        @Test
        fun `should evaluate non-zero number as truthy`() {
            val data = mapOf("count" to 5)

            assertTrue(ExpressionEvaluator.evaluate("count", data))
        }

        @Test
        fun `should evaluate zero number as falsy`() {
            val data = mapOf("count" to 0)

            assertFalse(ExpressionEvaluator.evaluate("count", data))
        }

        @Test
        fun `should evaluate null as falsy`() {
            val data = mapOf("value" to null)

            assertFalse(ExpressionEvaluator.evaluate("value", data))
        }

        @Test
        fun `should evaluate non-empty collection as truthy`() {
            val data = mapOf("items" to listOf(1, 2, 3))

            assertTrue(ExpressionEvaluator.evaluate("items", data))
        }

        @Test
        fun `should evaluate empty collection as falsy`() {
            val data = mapOf("items" to emptyList<Any>())

            assertFalse(ExpressionEvaluator.evaluate("items", data))
        }

        @Test
        fun `should evaluate missing property as falsy`() {
            val data = emptyMap<String, Any?>()

            assertFalse(ExpressionEvaluator.evaluate("missing", data))
        }
    }

    @Nested
    inner class EqualityComparison {
        @Test
        fun `should evaluate equality with string literal single quotes`() {
            val data = mapOf("status" to "active")

            assertTrue(ExpressionEvaluator.evaluate("status == 'active'", data))
        }

        @Test
        fun `should evaluate equality with string literal double quotes`() {
            val data = mapOf("status" to "active")

            assertTrue(ExpressionEvaluator.evaluate("status == \"active\"", data))
        }

        @Test
        fun `should evaluate equality with boolean true`() {
            val data = mapOf("enabled" to true)

            assertTrue(ExpressionEvaluator.evaluate("enabled == true", data))
        }

        @Test
        fun `should evaluate equality with boolean false`() {
            val data = mapOf("enabled" to false)

            assertTrue(ExpressionEvaluator.evaluate("enabled == false", data))
        }

        @Test
        fun `should evaluate equality with number`() {
            val data = mapOf("count" to 10.0)

            // Numbers are parsed as Double, so use 10.0 for equality
            assertTrue(ExpressionEvaluator.evaluate("count == 10", data))
        }

        @Test
        fun `should evaluate equality with null`() {
            val data = mapOf("value" to null)

            assertTrue(ExpressionEvaluator.evaluate("value == null", data))
        }

        @Test
        fun `should evaluate inequality`() {
            val data = mapOf("status" to "active")

            assertTrue(ExpressionEvaluator.evaluate("status != 'inactive'", data))
        }

        @Test
        fun `should return false for unequal values`() {
            val data = mapOf("status" to "active")

            assertFalse(ExpressionEvaluator.evaluate("status == 'pending'", data))
        }
    }

    @Nested
    inner class NumericComparison {
        @Test
        fun `should evaluate greater than`() {
            val data = mapOf("age" to 25)

            assertTrue(ExpressionEvaluator.evaluate("age > 20", data))
            assertFalse(ExpressionEvaluator.evaluate("age > 30", data))
        }

        @Test
        fun `should evaluate less than`() {
            val data = mapOf("age" to 25)

            assertTrue(ExpressionEvaluator.evaluate("age < 30", data))
            assertFalse(ExpressionEvaluator.evaluate("age < 20", data))
        }

        @Test
        fun `should evaluate greater than or equal`() {
            val data = mapOf("age" to 25)

            assertTrue(ExpressionEvaluator.evaluate("age >= 25", data))
            assertTrue(ExpressionEvaluator.evaluate("age >= 20", data))
            assertFalse(ExpressionEvaluator.evaluate("age >= 30", data))
        }

        @Test
        fun `should evaluate less than or equal`() {
            val data = mapOf("age" to 25)

            assertTrue(ExpressionEvaluator.evaluate("age <= 25", data))
            assertTrue(ExpressionEvaluator.evaluate("age <= 30", data))
            assertFalse(ExpressionEvaluator.evaluate("age <= 20", data))
        }

        @Test
        fun `should evaluate with decimal numbers`() {
            val data = mapOf("price" to 99.99)

            assertTrue(ExpressionEvaluator.evaluate("price > 50.00", data))
            assertTrue(ExpressionEvaluator.evaluate("price < 100.00", data))
        }

        @Test
        fun `should return false for non-numeric comparison`() {
            val data = mapOf("name" to "John")

            assertFalse(ExpressionEvaluator.evaluate("name > 10", data))
        }
    }

    @Nested
    inner class LogicalOperators {
        @Test
        fun `should evaluate AND operator with both true`() {
            val data = mapOf("a" to true, "b" to true)

            assertTrue(ExpressionEvaluator.evaluate("a && b", data))
        }

        @Test
        fun `should evaluate AND operator with one false`() {
            val data = mapOf("a" to true, "b" to false)

            assertFalse(ExpressionEvaluator.evaluate("a && b", data))
        }

        @Test
        fun `should evaluate OR operator with both true`() {
            val data = mapOf("a" to true, "b" to true)

            assertTrue(ExpressionEvaluator.evaluate("a || b", data))
        }

        @Test
        fun `should evaluate OR operator with one true`() {
            val data = mapOf("a" to false, "b" to true)

            assertTrue(ExpressionEvaluator.evaluate("a || b", data))
        }

        @Test
        fun `should evaluate OR operator with both false`() {
            val data = mapOf("a" to false, "b" to false)

            assertFalse(ExpressionEvaluator.evaluate("a || b", data))
        }

        @Test
        fun `should evaluate complex AND expression`() {
            val data = mapOf("status" to "active", "age" to 25)

            assertTrue(ExpressionEvaluator.evaluate("status == 'active' && age > 18", data))
        }

        @Test
        fun `should evaluate complex OR expression`() {
            val data = mapOf("status" to "pending", "priority" to "high")

            assertTrue(ExpressionEvaluator.evaluate("status == 'active' || priority == 'high'", data))
        }
    }

    @Nested
    inner class NestedProperties {
        @Test
        fun `should evaluate nested property`() {
            val data = mapOf("user" to mapOf("active" to true))

            assertTrue(ExpressionEvaluator.evaluate("user.active == true", data))
        }

        @Test
        fun `should evaluate deeply nested property`() {
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

            assertTrue(ExpressionEvaluator.evaluate("invoice.customer.address.city == 'New York'", data))
        }

        @Test
        fun `should evaluate array length comparison`() {
            val data = mapOf("items" to listOf(1, 2, 3))

            // Use numeric operators for comparing length (returns Int)
            assertTrue(ExpressionEvaluator.evaluate("items.length >= 3", data))
            assertTrue(ExpressionEvaluator.evaluate("items.length > 0", data))
        }
    }

    @Nested
    inner class LoopContextIntegration {
        @Test
        fun `should evaluate expression with loop context item`() {
            val data = mapOf("items" to listOf(mapOf("name" to "Item 1")))
            val loopContext =
                LoopContext(
                    item = mapOf("name" to "Item 1"),
                    index = 0,
                )

            // Using $item syntax for loop context
            assertTrue(ExpressionEvaluator.evaluate("\$item.name == 'Item 1'", data, loopContext))
        }

        @Test
        fun `should evaluate index comparison in loop`() {
            val loopContext =
                LoopContext(
                    item = mapOf("value" to 100),
                    index = 2,
                )

            // Use numeric operator for Int comparison
            assertTrue(ExpressionEvaluator.evaluate("\$index >= 2", emptyMap(), loopContext))
        }

        @Test
        fun `should evaluate loopIndex comparison`() {
            val loopContext =
                LoopContext(
                    item = null,
                    index = 5,
                )

            // Use numeric operator for Int comparison
            assertTrue(ExpressionEvaluator.evaluate("loopIndex >= 5", emptyMap(), loopContext))
        }

        @Test
        fun `should resolve item properties directly from loop context`() {
            val loopContext =
                LoopContext(
                    item = mapOf("name" to "Test", "price" to 100),
                    index = 0,
                )

            // Properties of item can be accessed directly without $item prefix
            assertTrue(ExpressionEvaluator.evaluate("name == 'Test'", emptyMap(), loopContext))
            assertTrue(ExpressionEvaluator.evaluate("price > 50", emptyMap(), loopContext))
        }
    }

    @Nested
    inner class EdgeCases {
        @Test
        fun `should return false for malformed expression`() {
            val data = mapOf("value" to 10)

            assertFalse(ExpressionEvaluator.evaluate("value > > 5", data))
        }

        @Test
        fun `should return false for expression with invalid operator`() {
            val data = mapOf("value" to 10)

            assertFalse(ExpressionEvaluator.evaluate("value <> 5", data))
        }

        @Test
        fun `should handle exception gracefully`() {
            val data = mapOf("value" to "not a number")

            assertFalse(ExpressionEvaluator.evaluate("value > 10", data))
        }
    }
}
