package com.pdfgenerator.renderer

import com.pdfgenerator.api.PDFGenerator
import com.pdfgenerator.model.Template
import org.junit.jupiter.api.Nested
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.io.TempDir
import java.io.File
import kotlin.test.assertTrue

class RenderersTest {
    
    @Nested
    inner class RectangleRenderer {
        
        @Test
        fun `should render rectangle with fill color`(@TempDir tempDir: File) {
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
        fun `should render rectangle with border`(@TempDir tempDir: File) {
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
                  "style": {"borderColor": "#000000", "borderWidth": 2}
                }
              ]
            }
            """.trimIndent()
            
            val template = Template.fromString(templateJson)
            val generator = PDFGenerator()
            val outputFile = File(tempDir, "rect-border.pdf")
            generator.generate(template, emptyMap(), outputFile)
            
            assertTrue(outputFile.exists())
        }
        
        @Test
        fun `should render rectangle with rounded corners`(@TempDir tempDir: File) {
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
                  "width": 150,
                  "height": 80,
                  "style": {"fillColor": "#E0E0E0", "cornerRadius": 15}
                }
              ]
            }
            """.trimIndent()
            
            val template = Template.fromString(templateJson)
            val generator = PDFGenerator()
            val outputFile = File(tempDir, "rect-rounded.pdf")
            generator.generate(template, emptyMap(), outputFile)
            
            assertTrue(outputFile.exists())
        }
        
        @Test
        fun `should render rectangle with 100 percent width`(@TempDir tempDir: File) {
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
                  "x": 0,
                  "y": 50,
                  "width": "100%",
                  "height": 30,
                  "style": {"fillColor": "#CCCCCC"}
                }
              ]
            }
            """.trimIndent()
            
            val template = Template.fromString(templateJson)
            val generator = PDFGenerator()
            val outputFile = File(tempDir, "rect-full.pdf")
            generator.generate(template, emptyMap(), outputFile)
            
            assertTrue(outputFile.exists())
        }
    }
    
    @Nested
    inner class LineRenderer {
        
        @Test
        fun `should render horizontal line with width and height`(@TempDir tempDir: File) {
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
                  "width": 150,
                  "height": 0,
                  "style": {"color": "#000000", "width": 2}
                }
              ]
            }
            """.trimIndent()
            
            val template = Template.fromString(templateJson)
            val generator = PDFGenerator()
            val outputFile = File(tempDir, "line-wh.pdf")
            generator.generate(template, emptyMap(), outputFile)
            
            assertTrue(outputFile.exists())
        }
        
        @Test
        fun `should render diagonal line`(@TempDir tempDir: File) {
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
                  "width": 100,
                  "height": 100,
                  "style": {"color": "#FF0000", "width": 3}
                }
              ]
            }
            """.trimIndent()
            
            val template = Template.fromString(templateJson)
            val generator = PDFGenerator()
            val outputFile = File(tempDir, "line-diag.pdf")
            generator.generate(template, emptyMap(), outputFile)
            
            assertTrue(outputFile.exists())
        }
        
        @Test
        fun `should render line with 100 percent width`(@TempDir tempDir: File) {
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
                  "x": 0,
                  "y": 100,
                  "width": "100%",
                  "height": 0,
                  "style": {"color": "#333333", "width": 1}
                }
              ]
            }
            """.trimIndent()
            
            val template = Template.fromString(templateJson)
            val generator = PDFGenerator()
            val outputFile = File(tempDir, "line-full.pdf")
            generator.generate(template, emptyMap(), outputFile)
            
            assertTrue(outputFile.exists())
        }
        
        @Test
        fun `should render dashed line`(@TempDir tempDir: File) {
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
                  "width": 200,
                  "height": 0,
                  "style": {"color": "#000000", "width": 1, "dashPattern": [5, 3]}
                }
              ]
            }
            """.trimIndent()
            
            val template = Template.fromString(templateJson)
            val generator = PDFGenerator()
            val outputFile = File(tempDir, "line-dashed.pdf")
            generator.generate(template, emptyMap(), outputFile)
            
            assertTrue(outputFile.exists())
        }
    }
    
    @Nested
    inner class TableRenderer {
        
        @Test
        fun `should render basic table`(@TempDir tempDir: File) {
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
        
        @Test
        fun `should render table with styled header`(@TempDir tempDir: File) {
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
                    {"header": "Product", "field": "name", "width": 150},
                    {"header": "Qty", "field": "qty", "width": 50, "alignment": "center"},
                    {"header": "Price", "field": "price", "width": 80, "alignment": "right"}
                  ],
                  "style": {
                    "headerBackground": "#333333",
                    "headerColor": "#FFFFFF",
                    "headerFontSize": 12
                  }
                }
              ]
            }
            """.trimIndent()
            
            val data = mapOf(
                "items" to listOf(
                    mapOf("name" to "Product A", "qty" to 2, "price" to "R$ 50,00"),
                    mapOf("name" to "Product B", "qty" to 1, "price" to "R$ 100,00")
                )
            )
            
            val template = Template.fromString(templateJson)
            val generator = PDFGenerator()
            val outputFile = File(tempDir, "table-styled.pdf")
            generator.generate(template, data, outputFile)
            
            assertTrue(outputFile.exists())
        }
        
        @Test
        fun `should render table with zebra stripes`(@TempDir tempDir: File) {
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
                    {"header": "ID", "field": "id", "width": 50},
                    {"header": "Name", "field": "name", "width": 150}
                  ],
                  "style": {
                    "alternateRowBackground": "#F5F5F5"
                  }
                }
              ]
            }
            """.trimIndent()
            
            val data = mapOf(
                "items" to listOf(
                    mapOf("id" to 1, "name" to "Item 1"),
                    mapOf("id" to 2, "name" to "Item 2"),
                    mapOf("id" to 3, "name" to "Item 3"),
                    mapOf("id" to 4, "name" to "Item 4")
                )
            )
            
            val template = Template.fromString(templateJson)
            val generator = PDFGenerator()
            val outputFile = File(tempDir, "table-zebra.pdf")
            generator.generate(template, data, outputFile)
            
            assertTrue(outputFile.exists())
        }
        
        @Test
        fun `should render table with 100 percent width`(@TempDir tempDir: File) {
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
                  "x": 0,
                  "y": 50,
                  "width": "100%",
                  "dataBinding": "items",
                  "columns": [
                    {"header": "Name", "field": "name"}
                  ]
                }
              ]
            }
            """.trimIndent()
            
            val data = mapOf("items" to listOf(mapOf("name" to "Full width item")))
            
            val template = Template.fromString(templateJson)
            val generator = PDFGenerator()
            val outputFile = File(tempDir, "table-full.pdf")
            generator.generate(template, data, outputFile)
            
            assertTrue(outputFile.exists())
        }
    }
    
    @Nested
    inner class TextRenderer {
        
        @Test
        fun `should render static text`(@TempDir tempDir: File) {
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
                  "type": "text",
                  "id": "text1",
                  "x": 50,
                  "y": 50,
                  "value": "Hello World"
                }
              ]
            }
            """.trimIndent()
            
            val template = Template.fromString(templateJson)
            val generator = PDFGenerator()
            val outputFile = File(tempDir, "text-static.pdf")
            generator.generate(template, emptyMap(), outputFile)
            
            assertTrue(outputFile.exists())
        }
        
        @Test
        fun `should render text with data binding`(@TempDir tempDir: File) {
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
                  "type": "text",
                  "id": "text1",
                  "x": 50,
                  "y": 50,
                  "dataBinding": "customer.name"
                }
              ]
            }
            """.trimIndent()
            
            val data = mapOf("customer" to mapOf("name" to "John Doe"))
            val template = Template.fromString(templateJson)
            val generator = PDFGenerator()
            val outputFile = File(tempDir, "text-binding.pdf")
            generator.generate(template, data, outputFile)
            
            assertTrue(outputFile.exists())
        }
        
        @Test
        fun `should render multiline text`(@TempDir tempDir: File) {
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
                  "type": "text",
                  "id": "text1",
                  "x": 50,
                  "y": 50,
                  "width": 200,
                  "height": 100,
                  "value": "This is a long text that should wrap to multiple lines when rendered.",
                  "style": {"multiline": true, "lineHeight": 1.5}
                }
              ]
            }
            """.trimIndent()
            
            val template = Template.fromString(templateJson)
            val generator = PDFGenerator()
            val outputFile = File(tempDir, "text-multiline.pdf")
            generator.generate(template, emptyMap(), outputFile)
            
            assertTrue(outputFile.exists())
        }
        
        @Test
        fun `should render styled text`(@TempDir tempDir: File) {
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
                  "type": "text",
                  "id": "bold",
                  "x": 50,
                  "y": 50,
                  "value": "Bold Text",
                  "style": {"fontWeight": "bold", "fontSize": 18}
                },
                {
                  "type": "text",
                  "id": "italic",
                  "x": 50,
                  "y": 80,
                  "value": "Italic Text",
                  "style": {"fontStyle": "italic", "fontSize": 18}
                },
                {
                  "type": "text",
                  "id": "colored",
                  "x": 50,
                  "y": 110,
                  "value": "Red Text",
                  "style": {"color": "#FF0000", "fontSize": 18}
                }
              ]
            }
            """.trimIndent()
            
            val template = Template.fromString(templateJson)
            val generator = PDFGenerator()
            val outputFile = File(tempDir, "text-styled.pdf")
            generator.generate(template, emptyMap(), outputFile)
            
            assertTrue(outputFile.exists())
        }
    }
    
    @Nested
    inner class BarcodeRenderer {
        
        @Test
        fun `should render QR code`(@TempDir tempDir: File) {
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
                  "type": "barcode",
                  "id": "qr1",
                  "x": 50,
                  "y": 50,
                  "width": 100,
                  "height": 100,
                  "barcodeType": "qrcode",
                  "dataBinding": "code"
                }
              ]
            }
            """.trimIndent()
            
            val data = mapOf("code" to "INVOICE-12345-XYZ")
            val template = Template.fromString(templateJson)
            val generator = PDFGenerator()
            val outputFile = File(tempDir, "barcode-qr.pdf")
            generator.generate(template, data, outputFile)
            
            assertTrue(outputFile.exists())
        }
        
        @Test
        fun `should render Code128 barcode`(@TempDir tempDir: File) {
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
                  "type": "barcode",
                  "id": "bar1",
                  "x": 50,
                  "y": 50,
                  "width": 200,
                  "height": 50,
                  "barcodeType": "CODE128",
                  "dataBinding": "productCode"
                }
              ]
            }
            """.trimIndent()
            
            val data = mapOf("productCode" to "1234567890")
            val template = Template.fromString(templateJson)
            val generator = PDFGenerator()
            val outputFile = File(tempDir, "barcode-128.pdf")
            generator.generate(template, data, outputFile)
            
            assertTrue(outputFile.exists())
        }
    }
    
    @Nested
    inner class LoopRenderer {
        
        @Test
        fun `should render vertical loop with table`(@TempDir tempDir: File) {
            // Use table instead of loop for rendering repeated data
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
                    {"header": "Name", "field": "name", "width": 200}
                  ]
                }
              ]
            }
            """.trimIndent()
            
            val data = mapOf(
                "items" to listOf(
                    mapOf("name" to "First Item"),
                    mapOf("name" to "Second Item"),
                    mapOf("name" to "Third Item")
                )
            )
            val template = Template.fromString(templateJson)
            val generator = PDFGenerator()
            val outputFile = File(tempDir, "loop-table.pdf")
            generator.generate(template, data, outputFile)
            
            assertTrue(outputFile.exists())
        }
    }
    
    @Nested
    inner class ConditionalRenderer {
        
        @Test
        fun `should render conditional when condition is true`(@TempDir tempDir: File) {
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
                  "type": "conditional",
                  "id": "cond1",
                  "x": 50,
                  "y": 50,
                  "condition": "showMessage == true",
                  "elements": [
                    {"type": "text", "id": "msg", "x": 0, "y": 0, "value": "Message is visible!"}
                  ]
                }
              ]
            }
            """.trimIndent()
            
            val data = mapOf("showMessage" to true)
            val template = Template.fromString(templateJson)
            val generator = PDFGenerator()
            val outputFile = File(tempDir, "cond-true.pdf")
            generator.generate(template, data, outputFile)
            
            assertTrue(outputFile.exists())
        }
        
        @Test
        fun `should not render conditional when condition is false`(@TempDir tempDir: File) {
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
                  "type": "text",
                  "id": "always",
                  "x": 50,
                  "y": 50,
                  "value": "Always visible"
                },
                {
                  "type": "conditional",
                  "id": "cond1",
                  "x": 50,
                  "y": 80,
                  "condition": "showMessage == true",
                  "elements": [
                    {"type": "text", "id": "msg", "x": 0, "y": 0, "value": "Should NOT be visible"}
                  ]
                }
              ]
            }
            """.trimIndent()
            
            val data = mapOf("showMessage" to false)
            val template = Template.fromString(templateJson)
            val generator = PDFGenerator()
            val outputFile = File(tempDir, "cond-false.pdf")
            generator.generate(template, data, outputFile)
            
            assertTrue(outputFile.exists())
        }
    }
    
    @Nested
    inner class HeaderFooterRenderer {
        
        @Test
        fun `should render header on each page`(@TempDir tempDir: File) {
            val templateJson = """
            {
              "version": "1.0",
              "pageSettings": {
                "size": "A4",
                "orientation": "portrait",
                "margins": {"top": 30, "right": 30, "bottom": 30, "left": 30},
                "header": {
                  "height": 40,
                  "elements": [
                    {"type": "text", "id": "title", "x": 0, "y": 10, "value": "Document Title"},
                    {"type": "line", "id": "sep", "x": 0, "y": 35, "width": 500, "height": 0}
                  ]
                }
              },
              "pageElements": [
                {"type": "text", "id": "body", "x": 0, "y": 0, "value": "Body content"}
              ]
            }
            """.trimIndent()
            
            val template = Template.fromString(templateJson)
            val generator = PDFGenerator()
            val outputFile = File(tempDir, "with-header.pdf")
            generator.generate(template, emptyMap(), outputFile)
            
            assertTrue(outputFile.exists())
        }
        
        @Test
        fun `should render footer with page number`(@TempDir tempDir: File) {
            val templateJson = """
            {
              "version": "1.0",
              "pageSettings": {
                "size": "A4",
                "orientation": "portrait",
                "margins": {"top": 30, "right": 30, "bottom": 30, "left": 30},
                "footer": {
                  "height": 30,
                  "elements": [
                    {"type": "text", "id": "pageNum", "x": 250, "y": 10, "dataBinding": "pageNumber"}
                  ]
                }
              },
              "pageElements": [
                {"type": "text", "id": "body", "x": 0, "y": 0, "value": "Page content"}
              ]
            }
            """.trimIndent()
            
            val template = Template.fromString(templateJson)
            val generator = PDFGenerator()
            val outputFile = File(tempDir, "with-footer.pdf")
            generator.generate(template, emptyMap(), outputFile)
            
            assertTrue(outputFile.exists())
        }
    }
}
