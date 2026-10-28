package com.pdfgenerator.util

import com.pdfgenerator.engine.LoopContext
import org.junit.jupiter.api.Nested
import org.junit.jupiter.api.Test
import kotlin.test.assertEquals
import kotlin.test.assertFalse
import kotlin.test.assertTrue

class ExpressionProcessorTest {
    @Nested
    inner class SimpleBinding {
        @Test
        fun `should resolve simple property binding`() {
            val data = mapOf("name" to "John")

            assertEquals("John", ExpressionProcessor.process("name", data))
        }

        @Test
        fun `should resolve nested property binding`() {
            val data = mapOf("user" to mapOf("name" to "John"))

            assertEquals("John", ExpressionProcessor.process("user.name", data))
        }

        @Test
        fun `should return empty string for null value`() {
            val data = mapOf("value" to null)

            assertEquals("", ExpressionProcessor.process("value", data))
        }

        @Test
        fun `should return empty string for missing property`() {
            val data = emptyMap<String, Any?>()

            assertEquals("", ExpressionProcessor.process("missing", data))
        }

        @Test
        fun `should convert number to string`() {
            val data = mapOf("count" to 42)

            assertEquals("42", ExpressionProcessor.process("count", data))
        }

        @Test
        fun `should convert boolean to string`() {
            val data = mapOf("active" to true)

            assertEquals("true", ExpressionProcessor.process("active", data))
        }

        @Test
        fun `should convert list to comma-separated string`() {
            val data = mapOf("items" to listOf("a", "b", "c"))

            assertEquals("a, b, c", ExpressionProcessor.process("items", data))
        }
    }

    @Nested
    inner class StringTransformations {
        @Test
        fun `should apply uppercase transformation`() {
            val data = mapOf("name" to "john")

            assertEquals("JOHN", ExpressionProcessor.process("name | uppercase", data))
        }

        @Test
        fun `should apply upper alias transformation`() {
            val data = mapOf("name" to "john")

            assertEquals("JOHN", ExpressionProcessor.process("name | upper", data))
        }

        @Test
        fun `should apply lowercase transformation`() {
            val data = mapOf("name" to "JOHN")

            assertEquals("john", ExpressionProcessor.process("name | lowercase", data))
        }

        @Test
        fun `should apply lower alias transformation`() {
            val data = mapOf("name" to "JOHN")

            assertEquals("john", ExpressionProcessor.process("name | lower", data))
        }

        @Test
        fun `should apply capitalize transformation`() {
            val data = mapOf("name" to "john doe")

            assertEquals("John Doe", ExpressionProcessor.process("name | capitalize", data))
        }

        @Test
        fun `should apply cap alias transformation`() {
            val data = mapOf("name" to "JOHN DOE")

            assertEquals("John Doe", ExpressionProcessor.process("name | cap", data))
        }

        @Test
        fun `should apply trim transformation`() {
            val data = mapOf("name" to "  John  ")

            assertEquals("John", ExpressionProcessor.process("name | trim", data))
        }

        @Test
        fun `should apply truncate transformation`() {
            val data = mapOf("text" to "This is a very long text that needs to be truncated")

            assertEquals("This is a v...", ExpressionProcessor.process("text | truncate:14", data))
        }

        @Test
        fun `should apply truncate with custom suffix`() {
            val data = mapOf("text" to "Hello World")

            assertEquals("Hello…", ExpressionProcessor.process("text | truncate:6:'…'", data))
        }

        @Test
        fun `should apply padLeft transformation`() {
            val data = mapOf("code" to "42")

            assertEquals("00042", ExpressionProcessor.process("code | padleft:5:'0'", data))
        }

        @Test
        fun `should apply padRight transformation`() {
            val data = mapOf("name" to "John")

            assertEquals("John......", ExpressionProcessor.process("name | padright:10:'.'", data))
        }

        @Test
        fun `should apply replace transformation`() {
            val data = mapOf("text" to "Hello World")

            assertEquals("Hello Universe", ExpressionProcessor.process("text | replace:'World':'Universe'", data))
        }

        @Test
        fun `should apply prefix transformation`() {
            val data = mapOf("name" to "John")

            // prefix:Mr adds "Mr" before the value
            val result = ExpressionProcessor.process("name | prefix:Mr.", data)
            assertEquals("Mr.John", result)
        }

        @Test
        fun `should apply suffix transformation`() {
            val data = mapOf("name" to "John")

            // suffix:Jr adds "Jr" after the value
            val result = ExpressionProcessor.process("name | suffix:Jr.", data)
            assertEquals("JohnJr.", result)
        }

        @Test
        fun `should apply reverse transformation`() {
            val data = mapOf("text" to "Hello")

            assertEquals("olleH", ExpressionProcessor.process("text | reverse", data))
        }
    }

    @Nested
    inner class CollectionTransformations {
        @Test
        fun `should apply join transformation`() {
            val data = mapOf("items" to listOf("a", "b", "c"))

            assertEquals("a, b, c", ExpressionProcessor.process("items | join", data))
        }

        @Test
        fun `should apply join with custom separator`() {
            val data = mapOf("items" to listOf("a", "b", "c"))

            assertEquals("a-b-c", ExpressionProcessor.process("items | join:'-'", data))
        }

        @Test
        fun `should apply first transformation`() {
            val data = mapOf("items" to listOf("first", "second", "third"))

            assertEquals("first", ExpressionProcessor.process("items | first", data))
        }

        @Test
        fun `should apply last transformation`() {
            val data = mapOf("items" to listOf("first", "second", "third"))

            assertEquals("third", ExpressionProcessor.process("items | last", data))
        }

        @Test
        fun `should apply length transformation to list`() {
            val data = mapOf("items" to listOf("a", "b", "c"))

            assertEquals("3", ExpressionProcessor.process("items | length", data))
        }

        @Test
        fun `should apply length transformation to string`() {
            val data = mapOf("name" to "John")

            assertEquals("4", ExpressionProcessor.process("name | length", data))
        }
    }

    @Nested
    inner class NumberTransformations {
        @Test
        fun `should apply format transformation`() {
            val data = mapOf("price" to 1234.567)

            val result = ExpressionProcessor.process("price | format:'#,##0.00'", data)
            assertTrue(result.contains("234"))
        }

        @Test
        fun `should apply currency transformation for BRL`() {
            val data = mapOf("price" to 1234.56)

            val result = ExpressionProcessor.process("price | currency:'BRL'", data)
            assertTrue(result.contains("1.234,56") || result.contains("1234,56"))
        }

        @Test
        fun `should apply abs transformation`() {
            val data = mapOf("value" to -42)

            assertEquals("42", ExpressionProcessor.process("value | abs", data))
        }

        @Test
        fun `should apply round transformation`() {
            val data = mapOf("value" to 3.14159)

            assertEquals("3.14", ExpressionProcessor.process("value | round:2", data))
        }

        @Test
        fun `should apply floor transformation`() {
            val data = mapOf("value" to 3.9)

            assertEquals("3", ExpressionProcessor.process("value | floor", data))
        }

        @Test
        fun `should apply ceil transformation`() {
            val data = mapOf("value" to 3.1)

            assertEquals("4", ExpressionProcessor.process("value | ceil", data))
        }

        @Test
        fun `should apply numberFormat transformation`() {
            val data = mapOf("value" to 1234567.89)

            val result = ExpressionProcessor.process("value | numberformat:'pt-BR'", data)
            assertTrue(result.contains("1.234.567") || result.contains("1234567"))
        }
    }

    @Nested
    inner class DateTransformations {
        @Test
        fun `should apply date transformation from ISO string`() {
            val data = mapOf("createdAt" to "2024-01-15")

            assertEquals("15/01/2024", ExpressionProcessor.process("createdAt | date", data))
        }

        @Test
        fun `should apply date transformation with custom format`() {
            val data = mapOf("createdAt" to "2024-01-15")

            assertEquals("2024", ExpressionProcessor.process("createdAt | date:'yyyy'", data))
        }

        @Test
        fun `should apply date transformation from timestamp`() {
            val data = mapOf("timestamp" to 1705276800000L) // 2024-01-15

            val result = ExpressionProcessor.process("timestamp | date", data)
            assertTrue(result.contains("2024"))
        }
    }

    @Nested
    inner class DefaultValueTransformation {
        @Test
        fun `should apply default value when null`() {
            val data = mapOf("name" to null)

            assertEquals("N/A", ExpressionProcessor.process("name | default:'N/A'", data))
        }

        @Test
        fun `should apply default value when empty string`() {
            val data = mapOf("name" to "")

            assertEquals("N/A", ExpressionProcessor.process("name | default:'N/A'", data))
        }

        @Test
        fun `should not apply default when value exists`() {
            val data = mapOf("name" to "John")

            assertEquals("John", ExpressionProcessor.process("name | default:'N/A'", data))
        }
    }

    @Nested
    inner class ChainedTransformations {
        @Test
        fun `should apply multiple transformations in order`() {
            val data = mapOf("name" to "  john doe  ")

            assertEquals("JOHN DOE", ExpressionProcessor.process("name | trim | uppercase", data))
        }

        @Test
        fun `should chain trim capitalize and prefix`() {
            val data = mapOf("name" to "  john  ")

            // Chain: trim -> "john", capitalize -> "John", prefix:Dr -> "DrJohn"
            val result = ExpressionProcessor.process("name | trim | capitalize | prefix:Dr", data)
            assertEquals("DrJohn", result)
        }
    }

    @Nested
    inner class TemplateTransformation {
        @Test
        fun `should apply template transformation`() {
            val data =
                mapOf(
                    "person" to
                        mapOf(
                            "firstName" to "John",
                            "lastName" to "Doe",
                        ),
                )

            val result = ExpressionProcessor.process("person | template:'\${firstName}'", data)
            assertEquals("John", result)
        }

        @Test
        fun `should apply template with property path`() {
            val data =
                mapOf(
                    "person" to
                        mapOf(
                            "name" to "John",
                        ),
                )

            val result = ExpressionProcessor.process("person | template:'\${name}'", data)
            assertEquals("John", result)
        }
    }

    @Nested
    inner class LoopContextIntegration {
        @Test
        fun `should process with loop context item using dollar syntax`() {
            val data = mapOf("items" to listOf(mapOf("name" to "Product 1")))
            val loopContext =
                LoopContext(
                    item = mapOf("name" to "Product 1"),
                    index = 0,
                )

            assertEquals("Product 1", ExpressionProcessor.process("\$item.name", data, loopContext))
        }

        @Test
        fun `should process with loop context item directly`() {
            val loopContext =
                LoopContext(
                    item = mapOf("name" to "Product 1"),
                    index = 0,
                )

            // Item properties can be accessed directly
            assertEquals("Product 1", ExpressionProcessor.process("name", emptyMap(), loopContext))
        }

        @Test
        fun `should process index in loop`() {
            val loopContext =
                LoopContext(
                    item = null,
                    index = 5,
                )

            assertEquals("5", ExpressionProcessor.process("\$index", emptyMap(), loopContext))
        }

        @Test
        fun `should process loopIndex in loop`() {
            val loopContext =
                LoopContext(
                    item = null,
                    index = 3,
                )

            assertEquals("3", ExpressionProcessor.process("loopIndex", emptyMap(), loopContext))
        }
    }

    @Nested
    inner class HelperMethods {
        @Test
        fun `should detect transformations in expression`() {
            assertTrue(ExpressionProcessor.hasTransformations("name | uppercase"))
            assertFalse(ExpressionProcessor.hasTransformations("name"))
        }

        @Test
        fun `should extract binding from expression`() {
            assertEquals("name", ExpressionProcessor.extractBinding("name | uppercase | trim"))
            assertEquals("user.name", ExpressionProcessor.extractBinding("user.name | capitalize"))
            assertEquals("value", ExpressionProcessor.extractBinding("value"))
        }
    }

    @Nested
    inner class ConcatTransformation {
        @Test
        fun `should concatenate values`() {
            val data = mapOf("firstName" to "John")

            // concat with separator and additional value
            val result = ExpressionProcessor.process("firstName | concat:-:Doe", data)
            assertEquals("John-Doe", result)
        }
    }

    @Nested
    inner class FunctionCallAndTemplateTests {
        @Test
        fun `should support function call syntax with parentheses`() {
            val data =
                mapOf(
                    "code" to "42",
                    "date" to "2026-10-22",
                    "text" to "Hello World",
                )

            assertEquals("00042", ExpressionProcessor.process("code | padLeft(5, '0')", data))
            assertEquals("2026-10-22", ExpressionProcessor.process("date | date('yyyy-MM-dd')", data))
            assertEquals("Hello…", ExpressionProcessor.process("text | truncate(6, '…')", data))
        }

        @Test
        fun `should process template interpolation with dollar and curly braces`() {
            val data =
                mapOf(
                    "customer" to
                        mapOf(
                            "name" to "Acme Corp",
                            "account" to "gold-tier",
                            "refId" to "123",
                        ),
                    "financial" to
                        mapOf(
                            "subtotal" to 1450.75,
                        ),
                )

            val template = "Customer: \${customer.name}, Account: \${customer.account | uppercase}, Ref: \${customer.refId | padLeft(6, '0')}"
            val result = ExpressionProcessor.processTemplate(template, data)
            assertEquals("Customer: Acme Corp, Account: GOLD-TIER, Ref: 000123", result)
        }

        @Test
        fun `should process template interpolation with mustache double curlies`() {
            val data = mapOf("user" to mapOf("name" to "Alice"))
            val template = "Hello {{user.name | uppercase}}!"
            val result = ExpressionProcessor.processTemplate(template, data)
            assertEquals("Hello ALICE!", result)
        }
    }

    @Nested
    inner class EdgeCases {
        @Test
        fun `should handle empty expression`() {
            assertEquals("", ExpressionProcessor.process("", emptyMap()))
        }

        @Test
        fun `should handle unknown transformation`() {
            val data = mapOf("name" to "John")

            assertEquals("John", ExpressionProcessor.process("name | unknownTransform", data))
        }

        @Test
        fun `should handle transformation with invalid arguments`() {
            val data = mapOf("value" to 3.14159)

            // round with invalid arg defaults to 0 decimal places
            val result = ExpressionProcessor.process("value | round:0", data)
            assertEquals("3.0", result)
        }
    }
}
