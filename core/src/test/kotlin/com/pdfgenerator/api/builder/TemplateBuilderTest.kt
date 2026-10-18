package com.pdfgenerator.api.builder

import com.pdfgenerator.model.BarcodeElement
import com.pdfgenerator.model.ImageElement
import com.pdfgenerator.model.LineElement
import com.pdfgenerator.model.RectangleElement
import com.pdfgenerator.model.TableElement
import com.pdfgenerator.model.TextElement
import org.junit.jupiter.api.Nested
import org.junit.jupiter.api.Test
import kotlin.test.assertEquals
import kotlin.test.assertNotNull

class TemplateBuilderTest {
    @Nested
    inner class BasicTemplateConstruction {
        @Test
        fun `should create template with default values`() {
            val template = TemplateBuilder().build()

            assertEquals("1.0", template.version)
            assertEquals("A4", template.pageSettings.size)
            assertEquals("portrait", template.pageSettings.orientation)
            assertEquals(0, template.bodyElements().size)
        }

        @Test
        fun `should create template with custom version`() {
            val template =
                TemplateBuilder()
                    .version("2.0")
                    .build()

            assertEquals("2.0", template.version)
        }

        @Test
        fun `should create template with metadata`() {
            val template =
                TemplateBuilder()
                    .metadata {
                        name = "Invoice Template"
                        description = "Template for generating invoices"
                        author = "Test Author"
                        created = "2024-01-01"
                        modified = "2024-01-15"
                        tags = listOf("invoice", "finance")
                    }
                    .build()

            assertEquals("Invoice Template", template.metadata.name)
            assertEquals("Template for generating invoices", template.metadata.description)
            assertEquals("Test Author", template.metadata.author)
            assertEquals("2024-01-01", template.metadata.created)
            assertEquals("2024-01-15", template.metadata.modified)
            assertEquals(listOf("invoice", "finance"), template.metadata.tags)
        }

        @Test
        fun `should create template with page size`() {
            val template =
                TemplateBuilder()
                    .pageSize("LETTER")
                    .build()

            assertEquals("LETTER", template.pageSettings.size)
        }

        @Test
        fun `should create template with landscape orientation`() {
            val template =
                TemplateBuilder()
                    .orientation("landscape")
                    .build()

            assertEquals("landscape", template.pageSettings.orientation)
        }

        @Test
        fun `should create template with custom margins`() {
            val template =
                TemplateBuilder()
                    .margins(10f, 20f, 30f, 40f)
                    .build()

            assertEquals(10f, template.pageSettings.margins.top)
            assertEquals(20f, template.pageSettings.margins.right)
            assertEquals(30f, template.pageSettings.margins.bottom)
            assertEquals(40f, template.pageSettings.margins.left)
        }

        @Test
        fun `should create template with custom page size`() {
            val template =
                TemplateBuilder()
                    .customSize(500f, 700f)
                    .build()

            assertEquals("CUSTOM", template.pageSettings.size)
            assertNotNull(template.pageSettings.customSize)
            assertEquals(500f, template.pageSettings.customSize?.width)
            assertEquals(700f, template.pageSettings.customSize?.height)
        }
    }

    @Nested
    inner class TextElementConstruction {
        @Test
        fun `should add text element with basic properties`() {
            val template =
                TemplateBuilder()
                    .addText {
                        id = "text1"
                        x = 50f
                        y = 100f
                        value = "Hello World"
                    }
                    .build()

            assertEquals(1, template.bodyElements().size)
            val element = template.bodyElements()[0] as TextElement
            assertEquals("text1", element.id)
            assertEquals(50f, element.x)
            assertEquals(100f, element.y)
            assertEquals("Hello World", element.value)
        }

        @Test
        fun `should add text element with data binding`() {
            val template =
                TemplateBuilder()
                    .addText {
                        id = "text1"
                        x = 50f
                        y = 100f
                        dataBinding = "customer.name"
                    }
                    .build()

            val element = template.bodyElements()[0] as TextElement
            assertEquals("customer.name", element.dataBinding)
        }

        @Test
        fun `should add text element with style`() {
            val template =
                TemplateBuilder()
                    .addText {
                        id = "text1"
                        x = 50f
                        y = 100f
                        fontSize = 24f
                        fontFamily = "Arial"
                        fontWeight = "bold"
                        fontStyle = "italic"
                        color = "#FF0000"
                        alignment = "center"
                    }
                    .build()

            val element = template.bodyElements()[0] as TextElement
            assertNotNull(element.style)
            assertEquals(24f, element.style?.fontSize)
            assertEquals("Arial", element.style?.fontFamily)
            assertEquals("bold", element.style?.fontWeight)
            assertEquals("italic", element.style?.fontStyle)
            assertEquals("#FF0000", element.style?.color)
            assertEquals("center", element.style?.alignment)
        }

        @Test
        fun `should add text element with multiline settings`() {
            val template =
                TemplateBuilder()
                    .addText {
                        id = "text1"
                        x = 50f
                        y = 100f
                        width = 200f
                        height = 100f
                        multiline = true
                        lineHeight = 1.8f
                        firstLineIndent = 20f
                    }
                    .build()

            val element = template.bodyElements()[0] as TextElement
            assertEquals(200f, element.width)
            assertEquals(100f, element.height)
            assertEquals(true, element.style?.multiline)
            assertEquals(1.8f, element.style?.lineHeight)
            assertEquals(20f, element.style?.firstLineIndent)
        }
    }

    @Nested
    inner class ImageElementConstruction {
        @Test
        fun `should add image element with source`() {
            val template =
                TemplateBuilder()
                    .addImage {
                        id = "img1"
                        x = 50f
                        y = 100f
                        width = 150f
                        height = 100f
                        source = "path/to/image.png"
                    }
                    .build()

            assertEquals(1, template.bodyElements().size)
            val element = template.bodyElements()[0] as ImageElement
            assertEquals("img1", element.id)
            assertEquals(50f, element.x)
            assertEquals(100f, element.y)
            assertEquals(150f, element.width)
            assertEquals(100f, element.height)
            assertEquals("path/to/image.png", element.source)
        }

        @Test
        fun `should add image element with data binding`() {
            val template =
                TemplateBuilder()
                    .addImage {
                        id = "img1"
                        x = 50f
                        y = 100f
                        dataBinding = "product.image"
                    }
                    .build()

            val element = template.bodyElements()[0] as ImageElement
            assertEquals("product.image", element.dataBinding)
        }

        @Test
        fun `should add image element with fit and alignment`() {
            val template =
                TemplateBuilder()
                    .addImage {
                        id = "img1"
                        x = 50f
                        y = 100f
                        fit = "cover"
                        alignment = "top-left"
                    }
                    .build()

            val element = template.bodyElements()[0] as ImageElement
            assertEquals("cover", element.fit)
            assertEquals("top-left", element.alignment)
        }
    }

    @Nested
    inner class TableElementConstruction {
        @Test
        fun `should add table element with columns`() {
            val template =
                TemplateBuilder()
                    .addTable {
                        id = "table1"
                        x = 50f
                        y = 100f
                        dataBinding = "items"
                        column("Name", "name", 100f)
                        column("Price", "price", 80f, "right", "currency")
                    }
                    .build()

            assertEquals(1, template.bodyElements().size)
            val element = template.bodyElements()[0] as TableElement
            assertEquals("table1", element.id)
            assertEquals("items", element.dataBinding)
            assertEquals(2, element.columns.size)

            assertEquals("Name", element.columns[0].header)
            assertEquals("name", element.columns[0].field)
            assertEquals(100f, element.columns[0].width)
            assertEquals("left", element.columns[0].alignment)

            assertEquals("Price", element.columns[1].header)
            assertEquals("price", element.columns[1].field)
            assertEquals(80f, element.columns[1].width)
            assertEquals("right", element.columns[1].alignment)
            assertEquals("currency", element.columns[1].format)
        }

        @Test
        fun `should add table element with width`() {
            val template =
                TemplateBuilder()
                    .addTable {
                        id = "table1"
                        x = 50f
                        y = 100f
                        width = 400f
                        dataBinding = "items"
                    }
                    .build()

            val element = template.bodyElements()[0] as TableElement
            assertEquals(400f, element.width)
        }
    }

    @Nested
    inner class RectangleElementConstruction {
        @Test
        fun `should add rectangle element`() {
            val template =
                TemplateBuilder()
                    .addRectangle {
                        id = "rect1"
                        x = 50f
                        y = 100f
                        width = 200f
                        height = 150f
                    }
                    .build()

            assertEquals(1, template.bodyElements().size)
            val element = template.bodyElements()[0] as RectangleElement
            assertEquals("rect1", element.id)
            assertEquals(50f, element.x)
            assertEquals(100f, element.y)
            assertEquals(200f, element.resolveWidth(500f))
            assertEquals(150f, element.resolveHeight(800f))
        }

        @Test
        fun `should add rectangle element with style`() {
            val template =
                TemplateBuilder()
                    .addRectangle {
                        id = "rect1"
                        x = 50f
                        y = 100f
                        width = 200f
                        height = 150f
                        fillColor = "#FF0000"
                        borderColor = "#000000"
                        borderWidth = 2f
                        cornerRadius = 10f
                    }
                    .build()

            val element = template.bodyElements()[0] as RectangleElement
            assertEquals("#FF0000", element.style?.fillColor)
            assertEquals("#000000", element.style?.borderColor)
            assertEquals(2f, element.style?.borderWidth)
            assertEquals(10f, element.style?.cornerRadius)
        }
    }

    @Nested
    inner class LineElementConstruction {
        @Test
        fun `should add horizontal line element`() {
            val template =
                TemplateBuilder()
                    .addLine {
                        id = "line1"
                        x = 50f
                        y = 100f
                        width = 200f
                        height = 0f
                    }
                    .build()

            assertEquals(1, template.bodyElements().size)
            val element = template.bodyElements()[0] as LineElement
            assertEquals("line1", element.id)
            assertEquals(50f, element.x)
            assertEquals(100f, element.y)
            assertEquals(200f, element.resolveWidth(500f))
            assertEquals(0f, element.resolveHeight(800f))
        }

        @Test
        fun `should add diagonal line element`() {
            val template =
                TemplateBuilder()
                    .addLine {
                        id = "line1"
                        x = 50f
                        y = 50f
                        width = 100f
                        height = 100f
                    }
                    .build()

            val element = template.bodyElements()[0] as LineElement
            assertEquals(150f, element.getEndX(500f))
            assertEquals(150f, element.getEndY(800f))
        }

        @Test
        fun `should add line element with 100 percent width`() {
            val template =
                TemplateBuilder()
                    .addLine {
                        id = "line1"
                        x = 0f
                        y = 100f
                        width = "100%"
                        height = 0f
                    }
                    .build()

            val element = template.bodyElements()[0] as LineElement
            assertEquals(500f, element.resolveWidth(500f))
        }

        @Test
        fun `should add line element with style`() {
            val template =
                TemplateBuilder()
                    .addLine {
                        id = "line1"
                        x = 50f
                        y = 100f
                        width = 200f
                        height = 0f
                        color = "#FF0000"
                        strokeWidth = 2f
                        dashPattern = listOf(5f, 3f)
                    }
                    .build()

            val element = template.bodyElements()[0] as LineElement
            assertEquals("#FF0000", element.style?.color)
            assertEquals(2f, element.style?.width)
            assertEquals(listOf(5f, 3f), element.style?.dashPattern)
        }
    }

    @Nested
    inner class BarcodeElementConstruction {
        @Test
        fun `should add barcode element`() {
            val template =
                TemplateBuilder()
                    .addBarcode {
                        id = "barcode1"
                        x = 50f
                        y = 100f
                        width = 200f
                        height = 200f
                        barcodeType = "qrcode"
                        dataBinding = "invoice.code"
                    }
                    .build()

            assertEquals(1, template.bodyElements().size)
            val element = template.bodyElements()[0] as BarcodeElement
            assertEquals("barcode1", element.id)
            assertEquals(50f, element.x)
            assertEquals(100f, element.y)
            assertEquals(200f, element.width)
            assertEquals(200f, element.height)
            assertEquals("qrcode", element.barcodeType)
            assertEquals("invoice.code", element.dataBinding)
        }

        @Test
        fun `should add barcode element with error correction`() {
            val template =
                TemplateBuilder()
                    .addBarcode {
                        id = "barcode1"
                        x = 50f
                        y = 100f
                        errorCorrection = "H"
                    }
                    .build()

            val element = template.bodyElements()[0] as BarcodeElement
            assertEquals("H", element.style?.errorCorrection)
        }
    }

    @Nested
    inner class MultipleElements {
        @Test
        fun `should add multiple elements`() {
            val template =
                TemplateBuilder()
                    .addText {
                        id = "text1"
                        x = 50f
                        y = 50f
                        value = "Title"
                    }
                    .addLine {
                        id = "line1"
                        x = 50f
                        y = 80f
                        width = 400f
                        height = 0f
                    }
                    .addTable {
                        id = "table1"
                        x = 50f
                        y = 100f
                        dataBinding = "items"
                    }
                    .addRectangle {
                        id = "rect1"
                        x = 50f
                        y = 300f
                        width = 100f
                        height = 50f
                    }
                    .build()

            assertEquals(4, template.bodyElements().size)
            assertEquals("text", template.bodyElements()[0].type)
            assertEquals("line", template.bodyElements()[1].type)
            assertEquals("table", template.bodyElements()[2].type)
            assertEquals("rectangle", template.bodyElements()[3].type)
        }

        @Test
        fun `should chain builder methods fluently`() {
            val template =
                TemplateBuilder()
                    .version("1.0")
                    .pageSize("A4")
                    .orientation("portrait")
                    .margins(20f, 20f, 20f, 20f)
                    .metadata {
                        name = "Test Template"
                        author = "Test"
                    }
                    .addText {
                        id = "title"
                        x = 0f
                        y = 0f
                        value = "Report"
                        fontSize = 24f
                        fontWeight = "bold"
                    }
                    .build()

            assertEquals("1.0", template.version)
            assertEquals("A4", template.pageSettings.size)
            assertEquals("portrait", template.pageSettings.orientation)
            assertEquals(20f, template.pageSettings.margins.top)
            assertEquals("Test Template", template.metadata.name)
            assertEquals(1, template.bodyElements().size)
        }
    }
}
