package com.pdfgenerator.api

import com.pdfgenerator.model.Template
import org.junit.jupiter.api.AfterEach
import org.junit.jupiter.api.Assertions.*
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import java.io.File
import java.nio.file.Files

class PDFGeneratorTest {

    private lateinit var pdfGenerator: PDFGenerator

    @BeforeEach
    fun setUp() {
        pdfGenerator = PDFGenerator()
        PDFGenerator.clearCache()
    }

    @AfterEach
    fun tearDown() {
        PDFGenerator.clearCache()
    }

    @Test
    fun `test generate with invalid json template`() {
        val invalidJsonTemplate = "{"
        val dataJson = "{}"

        val exception = assertThrows(PDFGenerationException::class.java) {
            pdfGenerator.generate(invalidJsonTemplate, dataJson)
        }
        assertTrue(exception.message!!.contains("Erro de sintaxe JSON") || exception.message!!.contains("JSON syntax error"))
    }

    @Test
    fun `test generate with non json object data`() {
        val validTemplate = "{ \"version\": \"1.0\", \"pageSettings\": { \"size\": \"A4\", \"orientation\": \"portrait\", \"margins\": { \"top\": 10, \"right\": 10, \"bottom\": 10, \"left\": 10 } }, \"pageElements\": [] }"
        val invalidData = "[]"

        val exception = assertThrows(PDFGenerationException::class.java) {
            pdfGenerator.generate(validTemplate, invalidData)
        }
        assertTrue(exception.message!!.contains("JSON data must be a JSON object"))
    }

    @Test
    fun `test template cache size and clear`() {
        val templatePath = "test-template.json"
        val validTemplate = "{ \"version\": \"1.0\", \"pageSettings\": { \"size\": \"A4\", \"orientation\": \"portrait\", \"margins\": { \"top\": 10, \"right\": 10, \"bottom\": 10, \"left\": 10 } }, \"pageElements\": [] }"
        val tempFile = File(templatePath)
        tempFile.writeText(validTemplate)

        try {
            pdfGenerator.generateFromPath(templatePath, emptyMap<String, Any>())
            assertEquals(1, PDFGenerator.cacheSize())

            PDFGenerator.invalidateCache(templatePath)
            assertEquals(0, PDFGenerator.cacheSize())

            pdfGenerator.generateFromPath(templatePath, "{}")
            assertEquals(1, PDFGenerator.cacheSize())

            PDFGenerator.clearCache()
            assertEquals(0, PDFGenerator.cacheSize())
        } finally {
            tempFile.delete()
        }
    }

    @Test
    fun `test generate with output file`() {
        val validTemplate = "{ \"version\": \"1.0\", \"pageSettings\": { \"size\": \"A4\", \"orientation\": \"portrait\", \"margins\": { \"top\": 10, \"right\": 10, \"bottom\": 10, \"left\": 10 } }, \"pageElements\": [] }"
        val template = Template.fromString(validTemplate)
        val tempFile = Files.createTempFile("test", ".pdf").toFile()

        try {
            pdfGenerator.generate(template, emptyMap(), tempFile)
            assertTrue(tempFile.exists())
            assertTrue(tempFile.length() > 0)
        } finally {
            tempFile.delete()
        }
    }

    @Test
    fun `test generate with custom page size and landscape`() {
        val validTemplate = "{ \"version\": \"1.0\", \"pageSettings\": { \"size\": \"CUSTOM\", \"customSize\": {\"width\": 800, \"height\": 600}, \"orientation\": \"landscape\", \"margins\": { \"top\": 10, \"right\": 10, \"bottom\": 10, \"left\": 10 } }, \"pageElements\": [] }"
        val template = Template.fromString(validTemplate)
        
        val pdfBytes = pdfGenerator.generate(template, emptyMap())
        assertTrue(pdfBytes.isNotEmpty())
    }

    @Test
    fun `test generate from path exception handling`() {
        val exception = assertThrows(PDFGenerationException::class.java) {
            pdfGenerator.generateFromPath("non-existent-template.json", "{}")
        }
        assertTrue(exception.message!!.contains("Template not found") || exception.message!!.contains("Error generating PDF with template"))
    }

    @Test
    fun `test generate overload with outputFile`() {
        val templateJson = "{ \"version\": \"1.0\", \"pageSettings\": { \"size\": \"A4\", \"orientation\": \"portrait\", \"margins\": { \"top\": 10, \"right\": 10, \"bottom\": 10, \"left\": 10 } }, \"pageElements\": [] }"
        val tempFile = Files.createTempFile("out", ".pdf").toFile()
        try {
            pdfGenerator.generate(templateJson, "{}", tempFile)
            assertTrue(tempFile.exists() && tempFile.length() > 0)
        } finally {
            tempFile.delete()
        }
    }

    @Test
    fun `test generateFromPath overload with outputFile`() {
        val templatePath = "test-template-output.json"
        val templateJson = "{ \"version\": \"1.0\", \"pageSettings\": { \"size\": \"A4\", \"orientation\": \"portrait\", \"margins\": { \"top\": 10, \"right\": 10, \"bottom\": 10, \"left\": 10 } }, \"pageElements\": [] }"
        val tempTemplateFile = File(templatePath)
        tempTemplateFile.writeText(templateJson)

        val tempOutFile = Files.createTempFile("out2", ".pdf").toFile()
        try {
            pdfGenerator.generateFromPath(templatePath, emptyMap<String, Any>(), tempOutFile)
            assertTrue(tempOutFile.exists() && tempOutFile.length() > 0)

            pdfGenerator.generateFromPath(templatePath, "{}", tempOutFile)
            assertTrue(tempOutFile.exists() && tempOutFile.length() > 0)
        } finally {
            tempTemplateFile.delete()
            tempOutFile.delete()
        }
    }
}
