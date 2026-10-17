package com.pdfgenerator.api

import org.junit.jupiter.api.Assertions.*
import org.junit.jupiter.api.Test

class PDFGeneratorExceptionsTest {
    private val pdfGenerator = PDFGenerator(PDFGeneratorConfig(strictMode = true))

    @Test
    fun `test generator exceptions`() {
        val badData = "{"
        assertThrows(PDFGenerationException::class.java) {
             pdfGenerator.generateFromPath("non_existent_file.json", badData)
        }
        val emptyTemplate = "{}"
        assertThrows(PDFGenerationException::class.java) {
             pdfGenerator.generate(emptyTemplate, badData)
        }
    }


    @Test
    fun `test classpath template loading`() {
        val data = """{"textData": "test"}"""
        val pdfBytes = pdfGenerator.generateFromPath("classpath-template.json", data)
        assertTrue(pdfBytes.isNotEmpty())
    }
}
