package com.pdfgenerator.adapter.openpdf

import com.lowagie.text.Document
import com.lowagie.text.PageSize
import com.lowagie.text.pdf.PdfWriter
import com.pdfgenerator.api.PDFGeneratorConfig
import com.pdfgenerator.engine.RenderContext
import com.pdfgenerator.model.BarcodeElement
import com.pdfgenerator.model.ImageElement
import com.pdfgenerator.model.LineElement
import com.pdfgenerator.model.LinkElement
import com.pdfgenerator.model.Margins
import com.pdfgenerator.model.PageSettings
import com.pdfgenerator.model.RectangleElement
import com.pdfgenerator.model.SpacerElement
import com.pdfgenerator.model.TableElement
import com.pdfgenerator.model.Template
import com.pdfgenerator.model.TextElement
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Assertions.assertNotNull
import org.junit.jupiter.api.Assertions.assertNull
import org.junit.jupiter.api.Test
import java.io.ByteArrayOutputStream

class LoopIterationScopeTest {
    private fun createDummyContext(): RenderContext {
        val document = Document(PageSize.A4)
        val os = ByteArrayOutputStream()
        val writer = PdfWriter.getInstance(document, os)
        document.open()
        val template =
            Template(
                version = "1.0",
                pageSettings =
                    PageSettings(
                        size = "A4",
                        orientation = "portrait",
                        margins = Margins(top = 20f, right = 20f, bottom = 20f, left = 20f),
                    ),
                pageElements = emptyList(),
            )
        val config = PDFGeneratorConfig()
        return RenderContext(
            document = document,
            writer = writer,
            template = template,
            data = mapOf("global" to "value"),
            config = config,
            offsetX = 10f,
            offsetY = 30f,
            bodyOffsetY = 30f,
        )
    }

    @Test
    fun `should create scope with normalized map for map items`() {
        val item = mapOf("id" to 123, "name" to "Alpha")
        val scope = LoopIterationScope(item = item, index = 2)

        assertEquals(2, scope.index)
        assertEquals(item, scope.item)
        assertNotNull(scope.normalizedItemMap)
        assertEquals(123, scope.normalizedItemMap?.get("id"))
        assertEquals("Alpha", scope.normalizedItemMap?.get("name"))
        assertEquals(2, scope.loopContext.index)
        assertEquals(item, scope.loopContext.item)
    }

    @Test
    fun `should handle non-map items gracefully`() {
        val item = "string-item"
        val scope = LoopIterationScope(item = item, index = 0)

        assertNull(scope.normalizedItemMap)
        assertEquals("string-item", scope.loopContext.item)
        assertEquals(0, scope.loopContext.index)
    }

    @Test
    fun `should enrich data map with synthetic index and item`() {
        val item = mapOf("title" to "Widget", "price" to 19.99)
        val scope = LoopIterationScope(item = item, index = 5)
        val baseData = mapOf("currency" to "USD")

        val enriched = scope.buildEnrichedData(baseData)

        assertEquals(5, enriched["\$index"])
        assertEquals(item, enriched["\$item"])
        assertEquals("Widget", enriched["title"])
        assertEquals(19.99, enriched["price"])
        assertEquals("USD", enriched["currency"])
    }

    @Test
    fun `should create item context with correct bounds and offsets`() {
        val dummyContext = createDummyContext()
        val scope = LoopIterationScope(item = mapOf("id" to 1), index = 0)

        val itemContext =
            scope.createItemContext(
                parentContext = dummyContext,
                loopX = 15f,
                pageOffsetY = 50f,
                itemStartY = 25f,
                loopWidth = 300f,
                itemHeight = 60f,
            )

        assertEquals(25f, itemContext.offsetX) // parent offsetX (10) + loopX (15)
        assertEquals(75f, itemContext.offsetY) // pageOffsetY (50) + itemStartY (25)
        assertEquals(300f, itemContext.containerWidth)
        assertEquals(60f, itemContext.containerHeight)
        assertNotNull(itemContext.renderState)
        assertEquals(scope.loopContext, itemContext.loopContext)
    }

    @Test
    fun `should adjust element positions and dimensions accurately`() {
        val scope = LoopIterationScope(item = null, index = 0)

        val text = TextElement(id = "t1", x = 10f, y = 5f, value = "Hello", width = 100f)
        val adjustedText = scope.adjustElementPosition(text, 200f, 50f, 12f) as TextElement
        assertEquals(10f, adjustedText.x)
        assertEquals(12f, adjustedText.y)
        assertEquals(100f, adjustedText.width)

        val fullWidthRect = RectangleElement(id = "r1", x = 5f, y = 2f, width = "100%", height = "100%")
        val adjustedRect = scope.adjustElementPosition(fullWidthRect, 250f, 80f, 15f) as RectangleElement
        assertEquals(0f, adjustedRect.x)
        assertEquals(0f, adjustedRect.y)
        assertEquals(250f, adjustedRect.width)
        assertEquals(80f, adjustedRect.height)

        val customRect = RectangleElement(id = "r2", x = 5f, y = 2f, width = "50%", height = 40f)
        val adjustedCustomRect = scope.adjustElementPosition(customRect, 200f, 80f, 15f) as RectangleElement
        assertEquals(5f, adjustedCustomRect.x)
        assertEquals(15f, adjustedCustomRect.y)
        assertEquals(100f, adjustedCustomRect.width)
        assertEquals(40f, adjustedCustomRect.height)

        val image = ImageElement(id = "img", x = 4f, y = 3f, source = "data:image/png;base64,...", width = -1f, height = -1f)
        val adjustedImage = scope.adjustElementPosition(image, 150f, 90f, 20f) as ImageElement
        assertEquals(4f, adjustedImage.x)
        assertEquals(20f, adjustedImage.y)
        assertEquals(150f, adjustedImage.width)
        assertEquals(90f, adjustedImage.height)

        val line = LineElement(id = "l1", x = 0f, y = 0f, width = "100%")
        val adjustedLine = scope.adjustElementPosition(line, 200f, 50f, 10f) as LineElement
        assertEquals(0f, adjustedLine.x)
        assertEquals(10f, adjustedLine.y)
        assertEquals(200f, adjustedLine.width)

        val table = TableElement(id = "tbl", x = 8f, y = 0f, dataBinding = "items", columns = emptyList())
        val adjustedTable = scope.adjustElementPosition(table, 200f, 50f, 14f) as TableElement
        assertEquals(8f, adjustedTable.x)
        assertEquals(14f, adjustedTable.y)

        val barcode = BarcodeElement(id = "bc", x = 3f, y = 0f, value = "123456")
        val adjustedBarcode = scope.adjustElementPosition(barcode, 200f, 50f, 16f) as BarcodeElement
        assertEquals(3f, adjustedBarcode.x)
        assertEquals(16f, adjustedBarcode.y)

        val link = LinkElement(id = "lnk", x = 2f, y = 0f, url = "https://example.com", value = "Link")
        val adjustedLink = scope.adjustElementPosition(link, 200f, 50f, 18f) as LinkElement
        assertEquals(2f, adjustedLink.x)
        assertEquals(18f, adjustedLink.y)

        val spacer = SpacerElement(id = "sp", x = 0f, y = 0f, height = 10f)
        val adjustedSpacer = scope.adjustElementPosition(spacer, 200f, 50f, 22f) as SpacerElement
        assertEquals(0f, adjustedSpacer.x)
        assertEquals(22f, adjustedSpacer.y)
        assertEquals("100%", adjustedSpacer.width)
    }
}
