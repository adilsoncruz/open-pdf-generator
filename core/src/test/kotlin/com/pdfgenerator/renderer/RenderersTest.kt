package com.pdfgenerator.renderer

import com.pdfgenerator.api.PDFGenerator
import com.pdfgenerator.model.Template
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.io.TempDir
import java.io.File
import kotlin.test.assertTrue

class RenderersTest {
    
    @Test
    fun `should render PDF with rectangle`(@TempDir tempDir: File) {
        val templateJson = """
        {
          "version": "1.0",
          "pageSettings": {
            "size": "A4",
            "orientation": "portrait",
            "margins": {"top": 30, "right": 30, "bottom": 30, "left": 30}
          },
          "pageElements": [
            {
              "type": "rectangle",
              "id": "rect1",
              "x": 50,
              "y": 50,
              "width": 100,
              "height": 50,
              "style": {"fillColor": "#FF0000"}
            }
          ]
        }
        """.trimIndent()
        
        val template = Template.fromString(templateJson)
        val generator = PDFGenerator()
        val outputFile = File(tempDir, "rect.pdf")
        generator.generate(template, emptyMap(), outputFile)
        
        assertTrue(outputFile.exists())
        assertTrue(outputFile.length() > 0)
    }
    
    @Test
    fun `should render PDF with line`(@TempDir tempDir: File) {
        val templateJson = """
        {
          "version": "1.0",
          "pageSettings": {
            "size": "A4",
            "orientation": "portrait",
            "margins": {"top": 30, "right": 30, "bottom": 30, "left": 30}
          },
          "pageElements": [
            {
              "type": "line",
              "id": "line1",
              "x": 50,
              "y": 50,
              "x2": 200,
              "y2": 50,
              "style": {"color": "#000000", "width": 2}
            }
          ]
        }
        """.trimIndent()
        
        val template = Template.fromString(templateJson)
        val generator = PDFGenerator()
        val outputFile = File(tempDir, "line.pdf")
        generator.generate(template, emptyMap(), outputFile)
        
        assertTrue(outputFile.exists())
    }
    
    @Test
    fun `should render PDF with table`(@TempDir tempDir: File) {
        val templateJson = """
        {
          "version": "1.0",
          "pageSettings": {
            "size": "A4",
            "orientation": "portrait",
            "margins": {"top": 30, "right": 30, "bottom": 30, "left": 30}
          },
          "pageElements": [
            {
              "type": "table",
              "id": "table1",
              "x": 50,
              "y": 50,
              "dataBinding": "items",
              "columns": [
                {"header": "Name", "field": "name", "width": 100},
                {"header": "Price", "field": "price", "width": 80}
              ]
            }
          ]
        }
        """.trimIndent()
        
        val data = mapOf(
            "items" to listOf(
                mapOf("name" to "Item 1", "price" to 100),
                mapOf("name" to "Item 2", "price" to 200)
            )
        )
        
        val template = Template.fromString(templateJson)
        val generator = PDFGenerator()
        val outputFile = File(tempDir, "table.pdf")
        generator.generate(template, data, outputFile)
        
        assertTrue(outputFile.exists())
    }
    
}
