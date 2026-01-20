package com.pdfgenerator.template

import com.pdfgenerator.model.*
import org.junit.jupiter.api.Nested
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.io.TempDir
import java.io.File
import kotlin.test.assertEquals
import kotlin.test.assertFalse
import kotlin.test.assertNotNull
import kotlin.test.assertTrue

class TemplateTest {
    
    @Nested
    inner class Parsing {
        
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
        fun `should parse template with metadata`() {
            val json = """
            {
              "version": "1.0",
              "metadata": {
                "name": "Invoice Template",
                "description": "A template for invoices",
                "author": "Test Author",
                "created": "2024-01-01",
                "modified": "2024-01-15",
                "tags": ["invoice", "finance"]
              },
              "pageSettings": {
                "size": "A4",
                "orientation": "portrait",
                "margins": { "top": 20, "right": 20, "bottom": 20, "left": 20 }
              },
              "pageElements": []
            }
            """.trimIndent()
            
            val template = Template.fromString(json)
            
            assertEquals("Invoice Template", template.metadata.name)
            assertEquals("A template for invoices", template.metadata.description)
            assertEquals("Test Author", template.metadata.author)
            assertEquals(listOf("invoice", "finance"), template.metadata.tags)
        }
        
        @Test
        fun `should parse template with header and footer`() {
            val json = """
            {
              "version": "1.0",
              "pageSettings": {
                "size": "A4",
                "orientation": "portrait",
                "margins": { "top": 20, "right": 20, "bottom": 20, "left": 20 },
                "header": {
                  "height": 50,
                  "elements": [
                    { "type": "text", "id": "headerTitle", "x": 0, "y": 20, "value": "Header" }
                  ]
                },
                "footer": {
                  "height": 30,
                  "elements": [
                    { "type": "text", "id": "pageNum", "x": 0, "y": 10, "dataBinding": "pageNumber" }
                  ]
                }
              },
              "pageElements": []
            }
            """.trimIndent()
            
            val template = Template.fromString(json)
            
            assertNotNull(template.pageSettings.header)
            assertEquals(50f, template.pageSettings.header?.height)
            assertEquals(1, template.pageSettings.header?.elements?.size)
            
            assertNotNull(template.pageSettings.footer)
            assertEquals(30f, template.pageSettings.footer?.height)
        }
        
        @Test
        fun `should parse template with body background`() {
            val json = """
            {
              "version": "1.0",
              "pageSettings": {
                "size": "A4",
                "orientation": "portrait",
                "margins": { "top": 20, "right": 20, "bottom": 20, "left": 20 },
                "bodyBackground": {
                  "elements": [
                    { "type": "rectangle", "id": "bg", "x": 0, "y": 0, "width": 100, "height": 100 }
                  ]
                }
              },
              "pageElements": []
            }
            """.trimIndent()
            
            val template = Template.fromString(json)
            
            assertNotNull(template.pageSettings.bodyBackground)
            assertEquals(1, template.pageSettings.bodyBackground?.elements?.size)
        }
        
        @Test
        fun `should parse template with summary page`() {
            val json = """
            {
              "version": "1.0",
              "pageSettings": {
                "size": "A4",
                "orientation": "portrait",
                "margins": { "top": 20, "right": 20, "bottom": 20, "left": 20 }
              },
              "pageElements": [],
              "summaryPage": {
                "elements": [
                  { "type": "text", "id": "summary", "x": 50, "y": 50, "value": "Summary" }
                ]
              }
            }
            """.trimIndent()
            
            val template = Template.fromString(json)
            
            assertNotNull(template.summaryPage)
            assertEquals(1, template.summaryPage?.elements?.size)
        }
        
        @Test
        fun `should parse all element types`() {
            val json = """
            {
              "version": "1.0",
              "pageSettings": {
                "size": "A4",
                "orientation": "portrait",
                "margins": { "top": 20, "right": 20, "bottom": 20, "left": 20 }
              },
              "pageElements": [
                { "type": "text", "id": "text1", "x": 0, "y": 0, "value": "Hello" },
                { "type": "image", "id": "img1", "x": 0, "y": 50, "width": 100, "height": 100, "source": "image.png" },
                { "type": "rectangle", "id": "rect1", "x": 0, "y": 150, "width": 100, "height": 50 },
                { "type": "line", "id": "line1", "x": 0, "y": 200, "width": 100, "height": 0 },
                { "type": "table", "id": "table1", "x": 0, "y": 220, "dataBinding": "items", "columns": [] },
                { "type": "barcode", "id": "barcode1", "x": 0, "y": 300, "width": 100, "height": 100, "barcodeType": "qrcode", "dataBinding": "code" }
              ]
            }
            """.trimIndent()
            
            val template = Template.fromString(json)
            
            assertEquals(6, template.pageElements.size)
            assertEquals("text", template.pageElements[0].type)
            assertEquals("image", template.pageElements[1].type)
            assertEquals("rectangle", template.pageElements[2].type)
            assertEquals("line", template.pageElements[3].type)
            assertEquals("table", template.pageElements[4].type)
            assertEquals("barcode", template.pageElements[5].type)
        }
        
        @Test
        fun `should parse conditional and loop elements`() {
            val json = """
            {
              "version": "1.0",
              "pageSettings": {
                "size": "A4",
                "orientation": "portrait",
                "margins": { "top": 20, "right": 20, "bottom": 20, "left": 20 }
              },
              "pageElements": [
                {
                  "type": "conditional",
                  "id": "cond1",
                  "x": 0,
                  "y": 0,
                  "condition": "showTitle == true",
                  "elements": [
                    { "type": "text", "id": "title", "x": 0, "y": 0, "value": "Title" }
                  ]
                },
                {
                  "type": "loop",
                  "id": "loop1",
                  "x": 0,
                  "y": 50,
                  "dataBinding": "items",
                  "elements": [
                    { "type": "text", "id": "itemName", "x": 0, "y": 0, "dataBinding": "item.name" }
                  ]
                }
              ]
            }
            """.trimIndent()
            
            val template = Template.fromString(json)
            
            assertEquals(2, template.pageElements.size)
            
            val conditional = template.pageElements[0] as ConditionalElement
            assertEquals("showTitle == true", conditional.condition)
            assertEquals(1, conditional.elements.size)
            
            val loop = template.pageElements[1] as LoopElement
            assertEquals("items", loop.dataBinding)
            assertEquals(1, loop.elements.size)
        }
        
        @Test
        fun `should parse template with custom page size`() {
            val json = """
            {
              "version": "1.0",
              "pageSettings": {
                "size": "CUSTOM",
                "orientation": "portrait",
                "margins": { "top": 20, "right": 20, "bottom": 20, "left": 20 },
                "customSize": { "width": 500, "height": 700 }
              },
              "pageElements": []
            }
            """.trimIndent()
            
            val template = Template.fromString(json)
            
            assertEquals("CUSTOM", template.pageSettings.size)
            assertNotNull(template.pageSettings.customSize)
            assertEquals(500f, template.pageSettings.customSize?.width)
            assertEquals(700f, template.pageSettings.customSize?.height)
        }
        
        @Test
        fun `should parse line element with 100 percent width`() {
            val json = """
            {
              "version": "1.0",
              "pageSettings": {
                "size": "A4",
                "orientation": "portrait",
                "margins": { "top": 20, "right": 20, "bottom": 20, "left": 20 }
              },
              "pageElements": [
                { "type": "line", "id": "line1", "x": 0, "y": 50, "width": "100%", "height": 0 }
              ]
            }
            """.trimIndent()
            
            val template = Template.fromString(json)
            val line = template.pageElements[0] as LineElement
            
            assertEquals(555f, line.resolveWidth(555f)) // 100% of container
        }
    }
    
    @Nested
    inner class Validation {
        
        @Test
        fun `should validate template successfully`() {
            val json = """
            {
              "version": "1.0",
              "pageSettings": {
                "size": "A4",
                "orientation": "portrait",
                "margins": { "top": 20, "right": 20, "bottom": 20, "left": 20 }
              },
              "pageElements": [
                { "type": "text", "id": "title", "x": 50, "y": 50, "value": "Test" }
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
                "margins": { "top": 20, "right": 20, "bottom": 20, "left": 20 }
              },
              "pageElements": [
                { "type": "text", "id": "title", "x": 50, "y": 50, "value": "Test" },
                { "type": "text", "id": "title", "x": 50, "y": 100, "value": "Test 2" }
              ]
            }
            """.trimIndent()
            
            val template = Template.fromString(json)
            val result = template.validate()
            
            assertFalse(result.isValid)
            assertTrue(result.errors.any { it.message.contains("Duplicate IDs") })
        }
        
        @Test
        fun `should validate version format`() {
            val template = Template(
                version = "invalid",
                pageSettings = PageSettings(
                    size = "A4",
                    orientation = "portrait",
                    margins = Margins(20f, 20f, 20f, 20f)
                )
            )
            
            val result = template.validate()
            
            assertFalse(result.isValid)
            assertTrue(result.errors.any { it.message.contains("Version must be in X.Y format") })
        }
        
        @Test
        fun `should accept valid version formats`() {
            val validVersions = listOf("1.0", "2.1", "10.20", "0.1")
            
            validVersions.forEach { version ->
                val template = Template(
                    version = version,
                    pageSettings = PageSettings(
                        size = "A4",
                        orientation = "portrait",
                        margins = Margins(20f, 20f, 20f, 20f)
                    )
                )
                
                val result = template.validate()
                assertTrue(result.isValid)
            }
        }
        
        @Test
        fun `should validate empty template`() {
            val template = Template(
                version = "1.0",
                pageSettings = PageSettings(
                    size = "A4",
                    orientation = "portrait",
                    margins = Margins(20f, 20f, 20f, 20f)
                ),
                pageElements = emptyList()
            )
            
            val result = template.validate()
            
            assertTrue(result.isValid)
        }
    }
    
    @Nested
    inner class Serialization {
        
        @Test
        fun `should convert template to JSON`() {
            val template = Template(
                version = "1.0",
                metadata = TemplateMetadata(name = "Test"),
                pageSettings = PageSettings(
                    size = "A4",
                    orientation = "portrait",
                    margins = Margins(20f, 20f, 20f, 20f)
                ),
                pageElements = listOf(
                    TextElement(id = "text1", x = 50f, y = 50f, value = "Hello")
                )
            )
            
            val json = template.toJson()
            
            assertTrue(json.contains("\"version\": \"1.0\""))
            assertTrue(json.contains("\"name\": \"Test\""))
            assertTrue(json.contains("\"id\": \"text1\""))
        }
        
        @Test
        fun `should round-trip template through JSON`() {
            val original = Template(
                version = "1.0",
                metadata = TemplateMetadata(name = "Original", author = "Test"),
                pageSettings = PageSettings(
                    size = "A4",
                    orientation = "landscape",
                    margins = Margins(10f, 20f, 30f, 40f)
                ),
                pageElements = listOf(
                    TextElement(id = "text1", x = 100f, y = 200f, value = "Test Value"),
                    RectangleElement(id = "rect1", x = 50f, y = 50f, width = 100, height = 50)
                )
            )
            
            val json = original.toJson()
            val restored = Template.fromString(json)
            
            assertEquals(original.version, restored.version)
            assertEquals(original.metadata.name, restored.metadata.name)
            assertEquals(original.pageSettings.size, restored.pageSettings.size)
            assertEquals(original.pageSettings.orientation, restored.pageSettings.orientation)
            assertEquals(original.pageElements.size, restored.pageElements.size)
        }
    }
    
    @Nested
    inner class FileOperations {
        
        @Test
        fun `should save and load template from file`(@TempDir tempDir: File) {
            val template = Template(
                version = "1.0",
                metadata = TemplateMetadata(name = "File Test"),
                pageSettings = PageSettings(
                    size = "A4",
                    orientation = "portrait",
                    margins = Margins(20f, 20f, 20f, 20f)
                )
            )
            
            val file = File(tempDir, "test-template.json")
            template.saveToFile(file)
            
            assertTrue(file.exists())
            
            val loaded = Template.fromFile(file)
            assertEquals("File Test", loaded.metadata.name)
        }
        
        @Test
        fun `should create parent directories when saving`(@TempDir tempDir: File) {
            val template = Template(
                version = "1.0",
                pageSettings = PageSettings(
                    size = "A4",
                    orientation = "portrait",
                    margins = Margins(20f, 20f, 20f, 20f)
                )
            )
            
            val file = File(tempDir, "nested/deep/template.json")
            template.saveToFile(file)
            
            assertTrue(file.exists())
            assertTrue(file.parentFile.exists())
        }
    }
    
    @Nested
    inner class PageSettings {
        
        @Test
        fun `should get A4 page size`() {
            val settings = PageSettings(
                size = "A4",
                orientation = "portrait",
                margins = Margins(20f, 20f, 20f, 20f)
            )
            
            val pageSize = settings.getPageSize()
            
            assertEquals(595f, pageSize.width, 1f)
            assertEquals(842f, pageSize.height, 1f)
        }
        
        @Test
        fun `should get A4 landscape page size`() {
            val settings = PageSettings(
                size = "A4",
                orientation = "landscape",
                margins = Margins(20f, 20f, 20f, 20f)
            )
            
            val pageSize = settings.getPageSize()
            
            assertEquals(842f, pageSize.width, 1f)
            assertEquals(595f, pageSize.height, 1f)
        }
        
        @Test
        fun `should get letter page size`() {
            val settings = PageSettings(
                size = "LETTER",
                orientation = "portrait",
                margins = Margins(20f, 20f, 20f, 20f)
            )
            
            val pageSize = settings.getPageSize()
            
            assertEquals(612f, pageSize.width, 1f)
            assertEquals(792f, pageSize.height, 1f)
        }
        
        @Test
        fun `should get custom page size`() {
            val settings = PageSettings(
                size = "CUSTOM",
                orientation = "portrait",
                margins = Margins(20f, 20f, 20f, 20f),
                customSize = CustomSize(400f, 600f)
            )
            
            val pageSize = settings.getPageSize()
            
            assertEquals(400f, pageSize.width)
            assertEquals(600f, pageSize.height)
        }
    }
}
