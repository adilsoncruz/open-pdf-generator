package com.pdfgenerator

import com.pdfgenerator.api.PDFGenerationException
import com.pdfgenerator.api.PDFGenerator
import com.pdfgenerator.model.Template
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.io.TempDir
import org.junit.jupiter.api.assertThrows
import java.io.File
import kotlin.test.assertEquals
import kotlin.test.assertNotNull
import kotlin.test.assertTrue

class PDFGeneratorTest {
    
    private val basicTemplateJson = """
        {
          "version": "1.0",
          "pageSettings": {
            "size": "A4",
            "orientation": "portrait",
            "margins": {
              "top": 30,
              "right": 30,
              "bottom": 30,
              "left": 30
            }
          },
          "pageElements": [
            {
              "type": "text",
              "id": "title",
              "x": 50,
              "y": 50,
              "value": "Hello, World!",
              "style": {
                "fontSize": 24,
                "fontWeight": "bold"
              }
            }
          ]
        }
    """.trimIndent()
    
    @Test
    fun `should generate PDF from template to file`(@TempDir tempDir: File) {
        val template = Template.fromString(basicTemplateJson)
        val data = emptyMap<String, Any?>()
        
        val generator = PDFGenerator()
        val outputFile = File(tempDir, "test.pdf")
        generator.generate(template, data, outputFile)
        
        assertTrue(outputFile.exists())
        assertTrue(outputFile.length() > 0)
    }
    
    @Test
    fun `should generate PDF from template to ByteArray`() {
        val template = Template.fromString(basicTemplateJson)
        val data = emptyMap<String, Any?>()
        
        val generator = PDFGenerator()
        val pdfBytes = generator.generate(template, data)
        
        assertNotNull(pdfBytes)
        assertTrue(pdfBytes.isNotEmpty())
        assertTrue(pdfBytes.size > 100)
    }
    
    @Test
    fun `should generate PDF from JSON strings to ByteArray`() {
        val dataJson = "{}"
        
        val generator = PDFGenerator()
        val pdfBytes = generator.generate(basicTemplateJson, dataJson)
        
        assertNotNull(pdfBytes)
        assertTrue(pdfBytes.isNotEmpty())
    }
    
    @Test
    fun `should generate PDF from JSON strings to file`(@TempDir tempDir: File) {
        val dataJson = "{}"
        
        val generator = PDFGenerator()
        val outputFile = File(tempDir, "test-json.pdf")
        generator.generate(basicTemplateJson, dataJson, outputFile)
        
        assertTrue(outputFile.exists())
        assertTrue(outputFile.length() > 0)
    }
    
    @Test
    fun `should generate PDF with data binding`(@TempDir tempDir: File) {
        val templateJson = """
        {
          "version": "1.0",
          "pageSettings": {
            "size": "A4",
            "orientation": "portrait",
            "margins": {
              "top": 30,
              "right": 30,
              "bottom": 30,
              "left": 30
            }
          },
          "pageElements": [
            {
              "type": "text",
              "id": "user-name",
              "x": 50,
              "y": 50,
              "dataBinding": "user.name",
              "style": {
                "fontSize": 18
              }
            }
          ]
        }
        """.trimIndent()
        
        val template = Template.fromString(templateJson)
        val data = mapOf(
            "user" to mapOf(
                "name" to "John Doe"
            )
        )
        
        val generator = PDFGenerator()
        val outputFile = File(tempDir, "test-binding.pdf")
        generator.generate(template, data, outputFile)
        
        assertTrue(outputFile.exists())
        assertTrue(outputFile.length() > 0)
    }
    
    @Test
    fun `should generate PDF with header and footer`(@TempDir tempDir: File) {
        val templateJson = """
        {
          "version": "1.0",
          "pageSettings": {
            "size": "A4",
            "orientation": "portrait",
            "margins": {
              "top": 30,
              "right": 30,
              "bottom": 30,
              "left": 30
            },
            "header": {
              "height": 50,
              "elements": [
                {
                  "type": "text",
                  "id": "header-title",
                  "x": 50,
                  "y": 10,
                  "value": "Document Header",
                  "style": {
                    "fontSize": 12
                  }
                }
              ]
            },
            "footer": {
              "height": 50,
              "elements": [
                {
                  "type": "text",
                  "id": "footer-text",
                  "x": 50,
                  "y": 10,
                  "value": "Page Footer",
                  "style": {
                    "fontSize": 10
                  }
                }
              ]
            }
          },
          "pageElements": [
            {
              "type": "text",
              "id": "body-text",
              "x": 50,
              "y": 50,
              "value": "Body content",
              "style": {
                "fontSize": 14
              }
            }
          ]
        }
        """.trimIndent()
        
        val template = Template.fromString(templateJson)
        val generator = PDFGenerator()
        val pdfBytes = generator.generate(template, emptyMap())
        
        assertTrue(pdfBytes.isNotEmpty())
    }
    
    @Test
    fun `should generate PDF with rectangle`() {
        val templateJson = """
        {
          "version": "1.0",
          "pageSettings": {
            "size": "A4",
            "orientation": "portrait",
            "margins": {
              "top": 30,
              "right": 30,
              "bottom": 30,
              "left": 30
            }
          },
          "pageElements": [
            {
              "type": "rectangle",
              "id": "rect1",
              "x": 50,
              "y": 50,
              "width": 100,
              "height": 50,
              "style": {
                "fillColor": "#FF0000",
                "borderWidth": 2,
                "borderColor": "#000000"
              }
            }
          ]
        }
        """.trimIndent()
        
        val template = Template.fromString(templateJson)
        val generator = PDFGenerator()
        val pdfBytes = generator.generate(template, emptyMap())
        
        assertTrue(pdfBytes.isNotEmpty())
    }
    
    @Test
    fun `should generate PDF with rectangle 100 percent width`() {
        val templateJson = """
        {
          "version": "1.0",
          "pageSettings": {
            "size": "A4",
            "orientation": "portrait",
            "margins": {
              "top": 30,
              "right": 30,
              "bottom": 30,
              "left": 30
            }
          },
          "pageElements": [
            {
              "type": "rectangle",
              "id": "rect1",
              "x": 0,
              "y": 50,
              "width": "100%",
              "height": 50,
              "style": {
                "fillColor": "#FF0000"
              }
            }
          ]
        }
        """.trimIndent()
        
        val template = Template.fromString(templateJson)
        val generator = PDFGenerator()
        val pdfBytes = generator.generate(template, emptyMap())
        
        assertTrue(pdfBytes.isNotEmpty())
    }
    
    @Test
    fun `should generate PDF with line`() {
        val templateJson = """
        {
          "version": "1.0",
          "pageSettings": {
            "size": "A4",
            "orientation": "portrait",
            "margins": {
              "top": 30,
              "right": 30,
              "bottom": 30,
              "left": 30
            }
          },
          "pageElements": [
            {
              "type": "line",
              "id": "line1",
              "x": 50,
              "y": 50,
              "x2": 200,
              "y2": 50,
              "style": {
                "color": "#000000",
                "width": 2
              }
            }
          ]
        }
        """.trimIndent()
        
        val template = Template.fromString(templateJson)
        val generator = PDFGenerator()
        val pdfBytes = generator.generate(template, emptyMap())
        
        assertTrue(pdfBytes.isNotEmpty())
    }
    
    @Test
    fun `should throw exception for invalid template JSON`() {
        val invalidJson = "{ invalid json }"
        
        val generator = PDFGenerator()
        
        assertThrows<Exception> {
            generator.generate(invalidJson, "{}")
        }
    }
    
    @Test
    fun `should throw exception for invalid data JSON`() {
        val invalidDataJson = "{ invalid }"
        
        val generator = PDFGenerator()
        
        assertThrows<Exception> {
            generator.generate(basicTemplateJson, invalidDataJson)
        }
    }
    
    @Test
    fun `should throw exception when data JSON is not an object`() {
        val arrayDataJson = "[1, 2, 3]"
        
        val generator = PDFGenerator()
        
        val exception = assertThrows<PDFGenerationException> {
            generator.generate(basicTemplateJson, arrayDataJson)
        }
        
        assertTrue(exception.message!!.contains("Dados JSON devem ser um objeto JSON"))
    }
    
    @Test
    fun `should generate PDF with landscape orientation`() {
        val templateJson = """
        {
          "version": "1.0",
          "pageSettings": {
            "size": "A4",
            "orientation": "landscape",
            "margins": {
              "top": 30,
              "right": 30,
              "bottom": 30,
              "left": 30
            }
          },
          "pageElements": [
            {
              "type": "text",
              "id": "text1",
              "x": 50,
              "y": 50,
              "value": "Landscape orientation",
              "style": {
                "fontSize": 14
              }
            }
          ]
        }
        """.trimIndent()
        
        val template = Template.fromString(templateJson)
        val generator = PDFGenerator()
        val pdfBytes = generator.generate(template, emptyMap())
        
        assertTrue(pdfBytes.isNotEmpty())
    }
}

