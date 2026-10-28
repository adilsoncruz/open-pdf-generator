package com.pdfgenerator.renderer

import com.pdfgenerator.adapter.openpdf.HeaderFooterPageEvent
import com.pdfgenerator.api.PDFGenerator
import com.pdfgenerator.api.PDFGeneratorConfig
import com.pdfgenerator.model.Margins
import com.pdfgenerator.model.PageSettings
import com.pdfgenerator.model.Template
import com.pdfgenerator.model.TextElement
import com.pdfgenerator.model.WatermarkConfig
import com.pdfgenerator.model.WatermarkType
import io.mockk.every
import io.mockk.mockk
import io.mockk.verify
import org.junit.jupiter.api.Test
import org.openpdf.text.Document
import org.openpdf.text.Rectangle
import org.openpdf.text.pdf.PdfContentByte
import org.openpdf.text.pdf.PdfWriter
import kotlin.test.assertNotNull
import kotlin.test.assertTrue

class WatermarkRenderingTest {
    @Test
    fun `should generate PDF with text watermark`() {
        val template =
            Template(
                version = "1.0",
                pageSettings =
                    PageSettings(
                        size = "A4",
                        orientation = "portrait",
                        margins = Margins(20f, 20f, 20f, 20f),
                        watermark =
                            WatermarkConfig(
                                type = WatermarkType.TEXT,
                                text = "CONFIDENTIAL",
                                opacity = 0.25f,
                                rotation = 45f,
                                fontSize = 50f,
                                color = "#FF0000",
                            ),
                    ),
                page = listOf(TextElement(id = "content", value = "Main Page Content", x = 50f, y = 50f)),
            )

        val generator = PDFGenerator()
        val pdfBytes = generator.generate(template, emptyMap())

        assertNotNull(pdfBytes)
        assertTrue(pdfBytes.isNotEmpty())

        val reader = org.openpdf.text.pdf.PdfReader(pdfBytes)
        val page = reader.getPageN(1)
        val resources = page.getAsDict(org.openpdf.text.pdf.PdfName.RESOURCES)
        val extGState = resources?.getAsDict(org.openpdf.text.pdf.PdfName.EXTGSTATE)
        assertNotNull(extGState)
        val hasOpacity =
            extGState.keys.any { key ->
                val gs = extGState.getAsDict(key as org.openpdf.text.pdf.PdfName)
                val fillCa = gs?.getAsNumber(org.openpdf.text.pdf.PdfName("ca"))?.floatValue()
                val strokeCa = gs?.getAsNumber(org.openpdf.text.pdf.PdfName("CA"))?.floatValue()
                fillCa == 0.25f || strokeCa == 0.25f
            }
        assertTrue(hasOpacity, "ExtGState should contain 0.25 opacity")
    }

    @Test
    fun `should generate PDF with dataBinding in watermark text`() {
        val template =
            Template(
                version = "1.0",
                pageSettings =
                    PageSettings(
                        size = "A4",
                        orientation = "portrait",
                        margins = Margins(20f, 20f, 20f, 20f),
                        watermark =
                            WatermarkConfig(
                                type = WatermarkType.TEXT,
                                dataBinding = "docStatus | uppercase",
                                opacity = 0.3f,
                                rotation = 45f,
                            ),
                    ),
                page = listOf(TextElement(id = "content", value = "Invoice #1234", x = 50f, y = 50f)),
            )

        val generator = PDFGenerator()
        val pdfBytes = generator.generate(template, mapOf("docStatus" to "draft"))

        assertNotNull(pdfBytes)
        assertTrue(pdfBytes.isNotEmpty())
    }

    @Test
    fun `should evaluate printCondition on watermark`() {
        val template =
            Template(
                version = "1.0",
                pageSettings =
                    PageSettings(
                        size = "A4",
                        orientation = "portrait",
                        margins = Margins(20f, 20f, 20f, 20f),
                        watermark =
                            WatermarkConfig(
                                type = WatermarkType.TEXT,
                                text = "DRAFT",
                                printCondition = "isDraft == true",
                            ),
                    ),
                page = listOf(TextElement(id = "content", value = "Testing condition", x = 50f, y = 50f)),
            )

        val generator = PDFGenerator()
        val pdfWithDraft = generator.generate(template, mapOf("isDraft" to true))
        val pdfWithoutDraft = generator.generate(template, mapOf("isDraft" to false))

        assertTrue(pdfWithDraft.isNotEmpty())
        assertTrue(pdfWithoutDraft.isNotEmpty())
    }

    @Test
    fun `should generate PDF with base64 image watermark`() {
        // 1x1 transparent PNG in base64
        val transparentPngBase64 =
            "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=="

        val template =
            Template(
                version = "1.0",
                pageSettings =
                    PageSettings(
                        size = "A4",
                        orientation = "portrait",
                        margins = Margins(20f, 20f, 20f, 20f),
                        watermark =
                            WatermarkConfig(
                                type = WatermarkType.IMAGE,
                                imageSource = transparentPngBase64,
                                width = 100f,
                                height = 100f,
                                opacity = 0.5f,
                                rotation = 15f,
                                onTop = true,
                            ),
                    ),
                page = listOf(TextElement(id = "content", value = "With Image Watermark", x = 50f, y = 50f)),
            )

        val generator = PDFGenerator()
        val pdfBytes = generator.generate(template, emptyMap())

        assertNotNull(pdfBytes)
        assertTrue(pdfBytes.isNotEmpty())

        val reader = org.openpdf.text.pdf.PdfReader(pdfBytes)
        val page = reader.getPageN(1)
        val resources = page.getAsDict(org.openpdf.text.pdf.PdfName.RESOURCES)
        val extGState = resources?.getAsDict(org.openpdf.text.pdf.PdfName.EXTGSTATE)
        assertNotNull(extGState)
        val hasOpacity =
            extGState.keys.any { key ->
                val gs = extGState.getAsDict(key as org.openpdf.text.pdf.PdfName)
                val fillCa = gs?.getAsNumber(org.openpdf.text.pdf.PdfName("ca"))?.floatValue()
                val strokeCa = gs?.getAsNumber(org.openpdf.text.pdf.PdfName("CA"))?.floatValue()
                fillCa == 0.5f || strokeCa == 0.5f
            }
        assertTrue(hasOpacity, "ExtGState should contain 0.5 opacity")
    }

    @Test
    fun `should render watermark with Times and Courier font styles`() {
        val writer = mockk<PdfWriter>(relaxed = true)
        val document = mockk<Document>(relaxed = true)
        val contentByte = mockk<PdfContentByte>(relaxed = true)

        every { writer.pageNumber } returns 1
        every { writer.directContentUnder } returns contentByte
        every { writer.directContent } returns contentByte
        every { document.pageSize } returns Rectangle(0f, 0f, 595f, 842f)

        listOf("times", "courier", "helvetica").forEach { fontName ->
            listOf("normal", "bold", "italic", "bolditalic").forEach { fontStyle ->
                val template =
                    Template(
                        version = "1.0",
                        pageSettings =
                            PageSettings(
                                size = "A4",
                                orientation = "portrait",
                                margins = Margins(10f, 10f, 10f, 10f),
                                watermark =
                                    WatermarkConfig(
                                        text = "SAMPLE",
                                        fontName = fontName,
                                        fontStyle = fontStyle,
                                    ),
                            ),
                    )

                val event = HeaderFooterPageEvent(template, emptyMap(), PDFGeneratorConfig(strictMode = true))
                event.onStartPage(writer, document)
            }
        }

        verify(atLeast = 1) { contentByte.showTextAligned(any(), any(), any(), any(), any()) }
    }
}
