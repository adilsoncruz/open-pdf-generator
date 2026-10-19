package com.pdfgenerator.validator

import com.pdfgenerator.api.PDFGenerator
import com.pdfgenerator.api.PDFSchemaValidationException
import com.pdfgenerator.model.Margins
import com.pdfgenerator.model.PageSettings
import com.pdfgenerator.model.Template
import com.pdfgenerator.model.TextElement
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.assertThrows
import kotlin.test.assertEquals
import kotlin.test.assertFalse
import kotlin.test.assertNotNull
import kotlin.test.assertTrue

class SchemaValidatorTest {
    @Test
    fun `should validate data successfully against simple schema`() {
        val schema =
            mapOf(
                "type" to "object",
                "properties" to
                    mapOf(
                        "name" to mapOf("type" to "string"),
                        "age" to mapOf("type" to "integer"),
                    ),
                "required" to listOf("name"),
            )
        val data =
            mapOf(
                "name" to "Alice",
                "age" to 30,
            )

        val errors = SchemaValidator.validate(schema, data)
        assertTrue(errors.isEmpty(), "Expected no validation errors")
    }

    @Test
    fun `should return detailed errors when required field is missing and type is invalid`() {
        val schema =
            mapOf(
                "type" to "object",
                "properties" to
                    mapOf(
                        "title" to mapOf("type" to "string"),
                        "count" to mapOf("type" to "integer"),
                    ),
                "required" to listOf("title"),
            )
        val data =
            mapOf(
                "count" to "not-a-number",
            )

        val errors = SchemaValidator.validate(schema, data)
        assertEquals(2, errors.size)

        val countError = errors.find { it.path.contains("count") }
        assertNotNull(countError)
        assertEquals("type", countError.keyword)

        val titleError = errors.find { it.keyword == "required" }
        assertNotNull(titleError)
    }

    @Test
    fun `should validate with JSON string overloads`() {
        val schemaJson =
            """
            {
                "type": "object",
                "properties": {
                    "id": { "type": "number" }
                },
                "required": ["id"]
            }
            """.trimIndent()
        val validDataJson = """{ "id": 123 }"""
        val invalidDataJson = """{ "id": "abc" }"""

        assertTrue(SchemaValidator.validate(schemaJson, validDataJson).isEmpty())
        val errors = SchemaValidator.validate(schemaJson, invalidDataJson)
        assertEquals(1, errors.size)
        assertEquals("$.id", errors[0].path)
    }

    @Test
    fun `should support Draft 2020-12 and Draft 7 schemas`() {
        val schema2020 =
            mapOf(
                "${'$'}schema" to "https://json-schema.org/draft/2020-12/schema",
                "type" to "object",
                "properties" to
                    mapOf(
                        "prefix" to mapOf("type" to "string", "minLength" to 3),
                    ),
            )
        val invalidData = mapOf("prefix" to "ab")
        val errors = SchemaValidator.validate(schema2020, invalidData)
        assertEquals(1, errors.size)
        assertEquals("minLength", errors[0].keyword)

        SchemaValidator.validateSchema(schema2020)
        SchemaValidator.validateSchema("""{"${'$'}schema": "http://json-schema.org/draft-07/schema#", "type": "object"}""")
    }

    @Test
    fun `Template validate should detect malformed schema`() {
        val pageSettings = PageSettings("A4", "portrait", Margins(20f, 20f, 20f, 20f))
        val invalidSchema = mapOf("type" to 12345) // invalid type value in JSON Schema

        val template =
            Template(
                version = "1.0",
                pageSettings = pageSettings,
                schema = invalidSchema,
            )

        val result = template.validate()
        assertFalse(result.isValid)
        assertTrue(result.errors.any { it.path == "schema" })
    }

    @Test
    fun `Template validate should pass with valid schema and null schema`() {
        val pageSettings = PageSettings("A4", "portrait", Margins(20f, 20f, 20f, 20f))
        val validTemplate =
            Template(
                version = "1.0",
                pageSettings = pageSettings,
                schema = mapOf("type" to "object"),
            )
        assertTrue(validTemplate.validate().isValid)

        val nullSchemaTemplate =
            Template(
                version = "1.0",
                pageSettings = pageSettings,
                schema = null,
            )
        assertTrue(nullSchemaTemplate.validate().isValid)
    }

    @Test
    fun `PDFGenerator should throw PDFSchemaValidationException with non-generic message when data is invalid`() {
        val pageSettings = PageSettings("A4", "portrait", Margins(20f, 20f, 20f, 20f))
        val template =
            Template(
                version = "1.0",
                pageSettings = pageSettings,
                schema =
                    mapOf(
                        "type" to "object",
                        "properties" to
                            mapOf(
                                "invoiceNumber" to mapOf("type" to "string"),
                                "amount" to mapOf("type" to "number"),
                            ),
                        "required" to listOf("invoiceNumber", "amount"),
                    ),
                page =
                    listOf(
                        TextElement(
                            id = "t1",
                            value = "Invoice {{invoiceNumber}}",
                            x = 10f,
                            y = 10f,
                            width = 200f,
                            height = 20f,
                        ),
                    ),
            )

        val invalidData = mapOf("amount" to "one-hundred")
        val generator = PDFGenerator()

        val ex =
            assertThrows<PDFSchemaValidationException> {
                generator.generate(template, invalidData)
            }

        assertTrue(ex.errors.isNotEmpty())
        assertTrue(ex.message!!.contains("Data schema validation failed"))
        assertTrue(ex.message!!.contains("invoiceNumber"))
        assertTrue(ex.message!!.contains("amount"))
    }

    @Test
    fun `PDFGenerator should succeed when data satisfies schema`() {
        val pageSettings = PageSettings("A4", "portrait", Margins(20f, 20f, 20f, 20f))
        val template =
            Template(
                version = "1.0",
                pageSettings = pageSettings,
                schema =
                    mapOf(
                        "type" to "object",
                        "properties" to
                            mapOf(
                                "customer" to mapOf("type" to "string"),
                            ),
                        "required" to listOf("customer"),
                    ),
                page =
                    listOf(
                        TextElement(
                            id = "t1",
                            value = "Hello {{customer}}",
                            x = 10f,
                            y = 10f,
                            width = 200f,
                            height = 20f,
                        ),
                    ),
            )

        val validData = mapOf("customer" to "Acme Corp")
        val generator = PDFGenerator()
        val pdf = generator.generate(template, validData)
        assertTrue(pdf.isNotEmpty())
    }

    @Test
    fun `PDFSchemaValidationException should allow custom message`() {
        val ex =
            PDFSchemaValidationException(
                errors = emptyList(),
                customMessage = "Custom error message",
            )
        assertEquals("Custom error message", ex.message)
    }
}
