package com.pdfgenerator.template

import com.pdfgenerator.model.Template
import org.junit.jupiter.api.Test
import kotlin.test.assertEquals
import kotlin.test.assertFalse
import kotlin.test.assertTrue

class TemplateTest {
    
    @Test
    fun `should parse valid template`() {
        val json = """
        {
          "version": "1.0",
          "pageSettings": {
            "size": "A4",
            "orientation": "portrait",
            "margins": {
              "top": 20,
              "right": 20,
              "bottom": 20,
              "left": 20
            }
          },
          "pageElements": [
            {
              "type": "text",
              "id": "title",
              "x": 50,
              "y": 50,
              "value": "Test"
            }
          ]
        }
        """.trimIndent()
        
        val template = Template.fromString(json)
        
        assertEquals("1.0", template.version)
        assertEquals("A4", template.pageSettings.size)
        assertEquals(1, template.pageElements.size)
        assertEquals("title", template.pageElements[0].id)
    }
    
    @Test
    fun `should validate template successfully`() {
        val json = """
        {
          "version": "1.0",
          "pageSettings": {
            "size": "A4",
            "orientation": "portrait",
            "margins": {
              "top": 20,
              "right": 20,
              "bottom": 20,
              "left": 20
            }
          },
          "pageElements": [
            {
              "type": "text",
              "id": "title",
              "x": 50,
              "y": 50,
              "value": "Test"
            }
          ]
        }
        """.trimIndent()
        
        val template = Template.fromString(json)
        val result = template.validate()
        
        assertTrue(result.isValid)
        assertEquals(0, result.errors.size)
    }
    
    @Test
    fun `should detect duplicate IDs`() {
        val json = """
        {
          "version": "1.0",
          "pageSettings": {
            "size": "A4",
            "orientation": "portrait",
            "margins": {
              "top": 20,
              "right": 20,
              "bottom": 20,
              "left": 20
            }
          },
          "pageElements": [
            {
              "type": "text",
              "id": "title",
              "x": 50,
              "y": 50,
              "value": "Test"
            },
            {
              "type": "text",
              "id": "title",
              "x": 50,
              "y": 100,
              "value": "Test 2"
            }
          ]
        }
        """.trimIndent()
        
        val template = Template.fromString(json)
        val result = template.validate()
        
        assertFalse(result.isValid)
        assertTrue(result.errors.any { it.message.contains("Duplicate IDs") })
    }
}

