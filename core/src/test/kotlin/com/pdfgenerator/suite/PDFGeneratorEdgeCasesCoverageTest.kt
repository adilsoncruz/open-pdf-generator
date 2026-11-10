package com.pdfgenerator.suite

import com.pdfgenerator.api.PDFGenerationException
import com.pdfgenerator.api.PDFGenerator
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.assertThrows
import org.junit.jupiter.api.io.TempDir
import java.io.File
import kotlin.test.assertEquals
import kotlin.test.assertTrue

class PDFGeneratorEdgeCasesCoverageTest {

    @Test
    fun `test generateFromPath and file outputs`(@TempDir tempDir: File) {
        val templateFile = File(tempDir, "sample-template.json")
        templateFile.writeText("""
        {
          "version": "1.0",
          "pageSettings": {
            "size": "A4",
            "orientation": "portrait",
            "margins": {"top": 10, "right": 10, "bottom": 10, "left": 10}
          },
          "pageElements": [
            { "type": "static_text", "id": "t1", "x": 10, "y": 10, "value": "From Path Value" }
          ]
        }
        """.trimIndent())

        val generator = PDFGenerator()
        val dataMap = mapOf("name" to "Antigravity")
        val dataJson = """{"name": "Antigravity"}"""

        // generateFromPath ByteArray with Map
        val bytesMap = generator.generateFromPath(templateFile.absolutePath, dataMap)
        assertTrue(bytesMap.isNotEmpty())

        // generateFromPath ByteArray with JSON string (tests cache hit too!)
        val bytesJson = generator.generateFromPath(templateFile.absolutePath, dataJson)
        assertTrue(bytesJson.isNotEmpty())

        // generateFromPath File with Map
        val out1 = File(tempDir, "out1.pdf")
        generator.generateFromPath(templateFile.absolutePath, dataMap, out1)
        assertTrue(out1.exists() && out1.length() > 0)

        // generateFromPath File with JSON string
        val out2 = File(tempDir, "out2.pdf")
        generator.generateFromPath(templateFile.absolutePath, dataJson, out2)
        assertTrue(out2.exists() && out2.length() > 0)

        // generate File overload
        val out3 = File(tempDir, "out3.pdf")
        generator.generate(templateFile.readText(), dataJson, out3)
        assertTrue(out3.exists() && out3.length() > 0)
    }

    @Test
    fun `test template not found exception`() {
        val generator = PDFGenerator()
        val ex = assertThrows<PDFGenerationException> {
            generator.generateFromPath("/non/existent/path/template.json", emptyMap())
        }
        assertTrue(ex.message!!.contains("Template not found"))
    }

    @Test
    fun `test json syntax error with templatePath`() {
        val generator = PDFGenerator()
        val ex = assertThrows<PDFGenerationException> {
            generator.generateFromPath("some/template.json", "{ invalid json data")
        }
        assertTrue(ex.message!!.contains("JSON syntax error") || ex.message!!.contains("Template not found"))
    }

    @Test
    fun `test json syntax error without templatePath`() {
        val generator = PDFGenerator()
        val ex = assertThrows<PDFGenerationException> {
            generator.generate("{ invalid json template", "{}")
        }
        assertTrue(ex.message!!.contains("JSON syntax error"))
    }

    @Test
    fun `test non-object dataJson error`() {
        val templateJson = """{ "version": "1.0", "pageSettings": {"size":"A4"}, "pageElements": [] }"""
        val generator = PDFGenerator()
        val ex = assertThrows<PDFGenerationException> {
            generator.generate(templateJson, "[1, 2, 3]")
        }
        assertTrue(ex.message!!.contains("must be a JSON object"))
    }

    @Test
    fun `test PDFGenerator image cache static helpers`() {
        PDFGenerator.setMaxImageCacheSize(200)
        PDFGenerator.clearImageCache()
        assertEquals(0, PDFGenerator.imageCacheSize())

        // Test Companion delegate helpers
        val resolved = PDFGenerator.resolveTextForHeight("user.name", null, mapOf("user" to mapOf("name" to "Adilson")))
        assertEquals("Adilson", resolved)

        val loopH = PDFGenerator.calculateLoopItemHeight(emptyList(), 400f, 50f)
        assertEquals(0f, loopH)
    }
}
