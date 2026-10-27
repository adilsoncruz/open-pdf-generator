package com.pdfgenerator.adapter.openpdf

import com.lowagie.text.Document
import com.lowagie.text.Rectangle
import com.lowagie.text.pdf.PdfContentByte
import com.lowagie.text.pdf.PdfWriter
import com.pdfgenerator.api.PDFGeneratorConfig
import com.pdfgenerator.engine.RenderEngine
import com.pdfgenerator.model.WatermarkConfig
import com.pdfgenerator.model.WatermarkType
import io.mockk.every
import io.mockk.mockk
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.assertThrows
import kotlin.test.assertTrue

class WatermarkPainterTest {

    private val transparentPngBase64 =
        "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=="

    @Test
    fun `test watermark painter text repeat and transformations`() {
        val config = PDFGeneratorConfig(strictMode = true)
        val renderEngine = RenderEngine(config)
        val painter = WatermarkPainter(renderEngine, config)

        val writer = mockk<PdfWriter>(relaxed = true)
        val document = mockk<Document>(relaxed = true)
        val cb = mockk<PdfContentByte>(relaxed = true)
        every { writer.directContentUnder } returns cb
        every { document.pageSize } returns Rectangle(0f, 0f, 200f, 200f)

        // 1. Text repeat with spacing
        val textRepeatWatermark = WatermarkConfig(
            type = WatermarkType.TEXT,
            text = "REPEAT ME",
            repeat = true,
            spacingX = 50f,
            spacingY = 50f,
            opacity = 0.5f,
            onTop = false,
        )
        painter.renderWatermark(writer, document, textRepeatWatermark, emptyMap())

        // 2. DataBinding with transformation
        val textTransformWatermark = WatermarkConfig(
            type = WatermarkType.TEXT,
            dataBinding = "title | uppercase",
            repeat = false,
            opacity = 0.5f,
            onTop = false,
        )
        painter.renderWatermark(writer, document, textTransformWatermark, mapOf("title" to "hello"))

        // 3. Blank text or null rawText
        val blankWatermark = WatermarkConfig(
            type = WatermarkType.TEXT,
            text = "   ",
            opacity = 0.5f,
            onTop = false,
        )
        painter.renderWatermark(writer, document, blankWatermark, emptyMap())
    }

    @Test
    fun `test watermark painter image repeat and dimensions`() {
        val config = PDFGeneratorConfig(strictMode = true)
        val renderEngine = RenderEngine(config)
        val painter = WatermarkPainter(renderEngine, config)

        val writer = mockk<PdfWriter>(relaxed = true)
        val document = mockk<Document>(relaxed = true)
        val cb = mockk<PdfContentByte>(relaxed = true)
        every { writer.directContent } returns cb
        every { document.pageSize } returns Rectangle(0f, 0f, 200f, 200f)

        // 1. Image with width only
        val imgWidthOnly = WatermarkConfig(
            type = WatermarkType.IMAGE,
            imageSource = transparentPngBase64,
            width = 50f,
            onTop = true,
        )
        painter.renderWatermark(writer, document, imgWidthOnly, emptyMap())

        // 2. Image with height only
        val imgHeightOnly = WatermarkConfig(
            type = WatermarkType.IMAGE,
            imageSource = transparentPngBase64,
            height = 50f,
            onTop = true,
        )
        painter.renderWatermark(writer, document, imgHeightOnly, emptyMap())

        // 3. Image repeat mode
        val imgRepeat = WatermarkConfig(
            type = WatermarkType.IMAGE,
            imageSource = transparentPngBase64,
            repeat = true,
            spacingX = 60f,
            spacingY = 60f,
            onTop = true,
        )
        painter.renderWatermark(writer, document, imgRepeat, emptyMap())

        // 4. Image with blank source
        val imgBlank = WatermarkConfig(
            type = WatermarkType.IMAGE,
            imageSource = "",
            onTop = true,
        )
        painter.renderWatermark(writer, document, imgBlank, emptyMap())
    }

    @Test
    fun `test watermark painter exception handling in strict and lax mode`() {
        val strictConfig = PDFGeneratorConfig(strictMode = true)
        val renderEngine = RenderEngine(strictConfig)
        val strictPainter = WatermarkPainter(renderEngine, strictConfig)

        val writer = mockk<PdfWriter>(relaxed = true)
        val document = mockk<Document>(relaxed = true)
        every { document.pageSize } throws RuntimeException("Page size error")

        val watermark = WatermarkConfig(
            type = WatermarkType.TEXT,
            text = "ERR",
            onTop = false,
        )

        assertThrows<RuntimeException> {
            strictPainter.renderWatermark(writer, document, watermark, emptyMap())
        }

        val laxConfig = PDFGeneratorConfig(strictMode = false)
        val laxPainter = WatermarkPainter(renderEngine, laxConfig)
        // Should catch and not throw
        laxPainter.renderWatermark(writer, document, watermark, emptyMap())
    }
}
