package com.pdfgenerator.renderer

import com.lowagie.text.Document
import com.lowagie.text.Rectangle
import com.lowagie.text.pdf.PdfWriter
import com.pdfgenerator.adapter.openpdf.HeaderFooterPageEvent
import com.pdfgenerator.api.PDFGeneratorConfig
import com.pdfgenerator.model.*
import io.mockk.every
import io.mockk.mockk
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.assertThrows

class HeaderFooterPageEventCoverageTest {
    @Test
    fun `test coverage for print conditions and element types`() {
        val elements =
            listOf(
                TextElement(id = "text1", value = "text", x = 10f, y = 10f),
                RectangleElement(id = "rect1", width = 10f, height = 10f, x = 10f, y = 10f),
                BarcodeElement(id = "bar1", dataBinding = "test", barcodeType = "QR", width = 50f, height = 50f, x = 10f, y = 10f),
                LineElement(id = "line1", width = 10f, height = 10f, x = 10f, y = 10f),
                ContainerElement(id = "cont1", elements = emptyList(), x = 10f, y = 10f), // falls to else
                TextElement(id = "text2", value = "not in group", x = 10f, y = 10f),
            )

        // group contains all elements except text2
        val groups =
            listOf(
                ElementGroup(id = "group1", elementIds = listOf("text1", "rect1", "bar1", "line1", "cont1"), printCondition = "true"),
            )

        val header = HeaderFooter(height = 50f, elements = elements, groups = groups, printCondition = "true")
        val footer = HeaderFooter(height = 50f, elements = elements, groups = groups, printCondition = "true")
        val bg = BodyBackground(elements = elements, groups = groups, printCondition = "true")

        val pageSettings =
            PageSettings(
                size = "A4",
                orientation = "portrait",
                header = header,
                footer = footer,
                bodyBackground = bg,
                margins = Margins(10f, 10f, 10f, 10f),
            )
        val template = Template(version = "1.0", pageSettings = pageSettings)

        val config = PDFGeneratorConfig(strictMode = true)
        val event = HeaderFooterPageEvent(template, mapOf(), config)

        val writer = mockk<PdfWriter>(relaxed = true)
        val document = mockk<Document>(relaxed = true)
        every { writer.pageNumber } returns 1
        every { document.pageSize } returns Rectangle(0f, 0f, 500f, 800f)

        // Normal path hits
        event.onStartPage(writer, document)
        event.onEndPage(writer, document)

        // Also call with printCondition = null
        val headerNull = HeaderFooter(height = 50f, elements = elements, groups = groups, printCondition = null)
        val footerNull = HeaderFooter(height = 50f, elements = elements, groups = groups, printCondition = null)
        val bgNull = BodyBackground(elements = elements, groups = groups, printCondition = null)
        val templateNull =
            Template(
                version = "1.0",
                pageSettings =
                    PageSettings(
                        size = "A4",
                        orientation = "portrait",
                        margins = Margins(10f, 10f, 10f, 10f),
                        header = headerNull,
                        footer = footerNull,
                        bodyBackground = bgNull,
                    ),
            )
        val eventNull = HeaderFooterPageEvent(templateNull, mapOf(), config)
        eventNull.onStartPage(writer, document)
        eventNull.onEndPage(writer, document)

        // Also call with printCondition = false to short-circuit
        val headerFalse = HeaderFooter(height = 50f, elements = elements, groups = groups, printCondition = "false")
        val footerFalse = HeaderFooter(height = 50f, elements = elements, groups = groups, printCondition = "false")
        val bgFalse = BodyBackground(elements = elements, groups = groups, printCondition = "false")
        val templateFalse =
            Template(
                version = "1.0",
                pageSettings =
                    PageSettings(
                        size = "A4",
                        orientation = "portrait",
                        margins = Margins(10f, 10f, 10f, 10f),
                        header = headerFalse,
                        footer = footerFalse,
                        bodyBackground = bgFalse,
                    ),
            )
        val eventFalse = HeaderFooterPageEvent(templateFalse, mapOf(), config)
        eventFalse.onStartPage(writer, document)
        eventFalse.onEndPage(writer, document)
    }

    @Test
    fun `test adjust methods short circuits when onStartPage not called`() {
        val elements = listOf(TextElement(id = "text1", value = "test", x = 0f, y = 0f))
        val template =
            Template(
                version = "1.0",
                pageSettings =
                    PageSettings(
                        size = "A4",
                        orientation = "portrait",
                        margins = Margins(10f, 10f, 10f, 10f),
                        header = HeaderFooter(height = 50f, elements = elements, printCondition = "true"),
                        footer = HeaderFooter(height = 50f, elements = elements, printCondition = "true"),
                        bodyBackground = BodyBackground(elements = elements, printCondition = "true"),
                    ),
            )
        val event = HeaderFooterPageEvent(template, mapOf(), PDFGeneratorConfig())

        val writer = mockk<PdfWriter>(relaxed = true)
        val document = mockk<Document>(relaxed = true)
        every { writer.pageNumber } returns 1

        // Calling onEndPage without onStartPage will leave adjustedElements as null, hitting the ?: return branches
        event.onEndPage(writer, document)
    }

    @Test
    fun `test exceptions handling`() {
        val elements = listOf(TextElement(id = "t1", value = "test", x = 0f, y = 0f))
        val template =
            Template(
                version = "1.0",
                pageSettings =
                    PageSettings(
                        size = "A4",
                        orientation = "portrait",
                        margins = Margins(10f, 10f, 10f, 10f),
                        header = HeaderFooter(height = 50f, elements = elements, printCondition = "true"),
                        footer = HeaderFooter(height = 50f, elements = elements, printCondition = "true"),
                        bodyBackground = BodyBackground(elements = elements, printCondition = "true"),
                    ),
            )

        val writer = mockk<PdfWriter>(relaxed = true)
        val document = mockk<Document>(relaxed = true)
        every { writer.pageNumber } throws RuntimeException("Forced exception for coverage")

        // Strict mode true - should throw
        val eventStrict = HeaderFooterPageEvent(template, mapOf(), PDFGeneratorConfig(strictMode = true))
        assertThrows<RuntimeException> {
            eventStrict.onStartPage(writer, document)
        }
        assertThrows<RuntimeException> {
            eventStrict.onEndPage(writer, document)
        }

        // Strict mode false - should catch and log
        val eventLax = HeaderFooterPageEvent(template, mapOf(), PDFGeneratorConfig(strictMode = false))
        eventLax.onStartPage(writer, document)
        eventLax.onEndPage(writer, document)
    }
}
