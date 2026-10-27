package com.pdfgenerator.adapter.openpdf

import com.lowagie.text.Document
import com.lowagie.text.Rectangle
import com.lowagie.text.pdf.PdfContentByte
import com.lowagie.text.pdf.PdfWriter
import com.pdfgenerator.api.PDFGeneratorConfig
import com.pdfgenerator.engine.RenderEngine
import com.pdfgenerator.model.BodyBackground
import com.pdfgenerator.model.ContainerElement
import com.pdfgenerator.model.ElementGroup
import com.pdfgenerator.model.HeaderFooter
import com.pdfgenerator.model.Margins
import com.pdfgenerator.model.PageSettings
import com.pdfgenerator.model.PositionMode
import com.pdfgenerator.model.RectangleElement
import com.pdfgenerator.model.Template
import com.pdfgenerator.model.TextElement
import io.mockk.every
import io.mockk.mockk
import org.junit.jupiter.api.Test
import kotlin.test.assertNotNull

class HeaderFooterSectionRendererTest {

    @Test
    fun `test section renderer relative flow and margin guides`() {
        val elements = listOf(
            TextElement(id = "text1", value = "Header Item", x = 0f, y = 0f, positionMode = PositionMode.RELATIVE, relativeOffsetY = 5f),
            RectangleElement(id = "rect1", x = 0f, y = 0f, width = 100f, height = "100%", positionMode = PositionMode.RELATIVE),
            ContainerElement(id = "cont1", x = 0f, y = 0f, height = "100%", elements = emptyList()),
            TextElement(id = "text2", value = "Excluded", x = 10f, y = 10f)
        )
        val groups = listOf(
            ElementGroup(id = "g1", elementIds = listOf("text1", "rect1", "cont1"), printCondition = "true"),
            ElementGroup(id = "g2", elementIds = listOf("text2"), printCondition = "false")
        )

        val header = HeaderFooter(height = 60f, elements = elements, groups = groups)
        val footer = HeaderFooter(height = 40f, elements = elements, groups = groups)
        val bodyBg = BodyBackground(elements = elements, groups = groups)

        val template = Template(
            version = "1.0",
            pageSettings = PageSettings(
                size = "A4",
                orientation = "portrait",
                margins = Margins(top = 20f, bottom = 20f, left = 20f, right = 20f),
                header = header,
                footer = footer,
                bodyBackground = bodyBg,
                showMargins = true,
            )
        )

        val config = PDFGeneratorConfig(strictMode = true, showMargins = true)
        val renderEngine = RenderEngine(config)
        val renderer = HeaderFooterSectionRenderer(template, emptyMap(), config, renderEngine)

        val writer = mockk<PdfWriter>(relaxed = true)
        val document = mockk<Document>(relaxed = true)
        val cb = mockk<PdfContentByte>(relaxed = true)

        every { writer.directContent } returns cb
        every { document.pageSize } returns Rectangle(0f, 0f, 500f, 800f)

        renderer.initialize(writer, document)
        renderer.renderHeader(writer, emptyMap())
        renderer.renderFooter(writer, emptyMap())
        renderer.renderBodyBackground(writer)
        renderer.renderMarginGuidelines(writer, document)

        assertNotNull(renderer)
    }
}
