package com.pdfgenerator.adapter.openpdf

import com.lowagie.text.Document
import com.lowagie.text.PageSize
import com.lowagie.text.pdf.PdfWriter
import com.pdfgenerator.api.PDFGeneratorConfig
import com.pdfgenerator.engine.RenderContext
import com.pdfgenerator.engine.RenderState
import com.pdfgenerator.model.HeaderFooter
import com.pdfgenerator.model.Margins
import com.pdfgenerator.model.PageSettings
import com.pdfgenerator.model.Template
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Assertions.assertTrue
import org.junit.jupiter.api.Test
import java.io.ByteArrayOutputStream

class LoopPageBreakHandlerTest {
    private fun createDummyContext(
        containerHeight: Float? = null,
        offsetY: Float = 50f,
        bodyOffsetY: Float = 50f,
        headerHeight: Float = 40f,
        footerHeight: Float = 30f,
    ): Pair<Document, RenderContext> {
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
                        header = HeaderFooter(height = headerHeight),
                        footer = HeaderFooter(height = footerHeight),
                    ),
                pageElements = emptyList(),
            )
        val config = PDFGeneratorConfig()
        val context =
            RenderContext(
                document = document,
                writer = writer,
                template = template,
                data = emptyMap(),
                config = config,
                containerHeight = containerHeight,
                offsetY = offsetY,
                bodyOffsetY = bodyOffsetY,
                renderState = RenderState(),
            )
        return Pair(document, context)
    }

    @Test
    fun `should calculate max content height correctly`() {
        val (_, contextWithOverride) = createDummyContext(containerHeight = 450f)
        assertEquals(450f, LoopPageBreakHandler.calculateMaxContentHeight(contextWithOverride))

        val (_, contextFromTemplate) = createDummyContext(containerHeight = null)
        val pageHeight = contextFromTemplate.document.pageSize.height
        val margins = contextFromTemplate.template.pageSettings.margins
        val headerHeight = contextFromTemplate.template.pageSettings.header?.height ?: 0f
        val footerHeight = contextFromTemplate.template.pageSettings.footer?.height ?: 0f
        val expectedHeight = (pageHeight - margins.bottom - footerHeight) - (margins.top + headerHeight)
        assertEquals(expectedHeight, LoopPageBreakHandler.calculateMaxContentHeight(contextFromTemplate), 0.01f)
    }

    @Test
    fun `should advance offsets without page break when fitting inside page`() {
        val (_, context) = createDummyContext(containerHeight = 500f)
        val handler =
            LoopPageBreakHandler(
                context = context,
                loopBaseY = 10f,
                itemHeight = 40f,
                itemSpacing = 5f,
            )

        val pos0 = handler.prepareItemPosition()
        assertEquals(50f, pos0.pageOffsetY)
        assertEquals(10f, pos0.itemStartY)
        handler.onItemRendered()

        assertEquals(1, handler.itemsRenderedOnCurrentPage)
        assertEquals(1, handler.totalItemsRendered)
        assertEquals(45f, handler.currentYOffset)

        val pos1 = handler.prepareItemPosition()
        assertEquals(50f, pos1.pageOffsetY)
        assertEquals(55f, pos1.itemStartY) // 10 + 45
        handler.onItemRendered()

        assertEquals(2, handler.itemsRenderedOnCurrentPage)
        assertEquals(2, handler.totalItemsRendered)
    }

    @Test
    fun `should trigger page break and reset offset when exceeding page limit`() {
        val (document, context) =
            createDummyContext(
                containerHeight = 100f,
                offsetY = 70f,
                bodyOffsetY = 50f, // contextOffsetInBody = 20f > 0
            )
        val handler =
            LoopPageBreakHandler(
                context = context,
                loopBaseY = 10f,
                itemHeight = 45f,
                itemSpacing = 5f,
            )

        // Item 0: startY = 10, endY = 55. itemEndYInBody = 20 + 55 = 75 <= 100. Fits!
        val pos0 = handler.prepareItemPosition()
        assertEquals(70f, pos0.pageOffsetY)
        assertEquals(10f, pos0.itemStartY)
        handler.onItemRendered()
        // currentYOffset = 50

        // Item 1: startY = 10 + 50 = 60, endY = 105. itemEndYInBody = 20 + 105 = 125 > 100.
        // itemsRenderedOnCurrentPage = 1 > 0 -> page break triggered!
        val pageNumberBefore = document.pageNumber
        val pos1 = handler.prepareItemPosition()

        assertTrue(document.pageNumber >= pageNumberBefore)
        assertEquals(0, handler.itemsRenderedOnCurrentPage)
        assertEquals(0f, handler.currentYOffset)
        // restartAtTopOfBody is true because contextOffsetInBody (20) > 0
        assertEquals(50f, pos1.pageOffsetY) // reset to bodyOffsetY
        assertEquals(0f, pos1.itemStartY) // reset to 0f
    }

    @Test
    fun `should update render state on completion`() {
        val (_, context) = createDummyContext(containerHeight = 500f, offsetY = 60f, bodyOffsetY = 50f)
        val handler =
            LoopPageBreakHandler(
                context = context,
                loopBaseY = 20f,
                itemHeight = 30f,
                itemSpacing = 10f,
            )

        handler.prepareItemPosition()
        handler.onItemRendered()

        handler.prepareItemPosition()
        handler.onItemRendered()

        handler.prepareItemPosition()
        handler.onItemRendered()

        handler.updateRenderState()

        // 3 items: renderedHeight = (3 * 30) + (2 * 10) = 110
        // finalYAbsolute = 60 + 20 + 110 = 190
        // finalYRelative = 190 - 50 = 140
        assertEquals(140f, context.renderState?.currentY)
    }
}
