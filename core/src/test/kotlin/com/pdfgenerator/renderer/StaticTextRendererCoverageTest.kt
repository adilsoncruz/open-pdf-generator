package com.pdfgenerator.renderer

import com.pdfgenerator.adapter.openpdf.StaticTextRenderer
import com.pdfgenerator.engine.RenderContext
import com.pdfgenerator.model.StaticTextElement
import com.pdfgenerator.model.TextStyle
import com.lowagie.text.Document
import com.lowagie.text.PageSize
import com.lowagie.text.pdf.PdfContentByte
import com.lowagie.text.pdf.PdfWriter
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import io.mockk.every
import io.mockk.mockk
import io.mockk.verify

class StaticTextRendererCoverageTest {

    private lateinit var document: Document
    private lateinit var context: RenderContext
    private lateinit var writer: PdfWriter
    private lateinit var contentByte: PdfContentByte
    private lateinit var contentUnder: PdfContentByte
    private lateinit var renderer: StaticTextRenderer

    @BeforeEach
    fun setUp() {
        document = mockk(relaxed = true)
        every { document.pageSize } returns PageSize.A4

        contentByte = mockk(relaxed = true)
        contentUnder = mockk(relaxed = true)

        writer = mockk(relaxed = true)
        every { writer.directContent } returns contentByte
        every { writer.directContentUnder } returns contentUnder

        context = mockk(relaxed = true)
        every { context.document } returns document
        every { context.writer } returns writer
        every { context.resolveX(any()) } answers { firstArg() as Float }
        every { context.resolveY(any()) } answers { firstArg() as Float }
        every { context.useContentUnder } returns false

        renderer = StaticTextRenderer()
    }

    @Test
    fun `test single line with center and right alignment, fonts, and useContentUnder`() {
        // Test useContentUnder
        every { context.useContentUnder } returns true

        val element = StaticTextElement(
            id = "t1",
            value = "Hello Center",
            x = 10f,
            y = 20f,
            width = 100f,
            height = 20f,
            style = TextStyle(
                alignment = "center",
                fontFamily = "times",
                fontWeight = "bold",
                fontStyle = "italic",
                color = "#FF0000",
                backgroundColor = "#00FF00",
                verticalAlignment = "center"
            )
        )
        renderer.render(element, context)
        verify { writer.directContentUnder }

        // Test right alignment and courier font
        val elementRight = StaticTextElement(
            id = "t2",
            value = "Hello Right",
            x = 10f,
            y = 20f,
            width = 100f,
            style = TextStyle(
                alignment = "right",
                fontFamily = "courier",
                fontWeight = "bold",
                fontStyle = "normal",
                verticalAlignment = "bottom"
            )
        )
        every { context.useContentUnder } returns false
        renderer.render(elementRight, context)
    }

    @Test
    fun `test multiline with center and right alignment, empty paragraph, and useContentUnder`() {
        every { context.useContentUnder } returns true

        val element = StaticTextElement(
            id = "t1",
            value = "Line 1\n\nLine 3",
            x = 10f,
            y = 20f,
            width = 100f,
            height = 50f,
            style = TextStyle(
                multiline = true,
                alignment = "center",
                fontFamily = "helvetica",
                fontWeight = "bold",
                fontStyle = "italic",
                color = "#0000FF",
                backgroundColor = "#FF0000"
            )
        )
        renderer.render(element, context)
        verify { writer.directContentUnder }

        val elementRight = StaticTextElement(
            id = "t2",
            value = "Multiline\nRight",
            x = 10f,
            y = 20f,
            width = 100f,
            style = TextStyle(
                multiline = true,
                alignment = "right",
                fontFamily = "times-roman",
                fontWeight = "normal",
                fontStyle = "italic"
            )
        )
        every { context.useContentUnder } returns false
        renderer.render(elementRight, context)
    }

    @Test
    fun `test other font variations`() {
        val variations = listOf(
            TextStyle(fontFamily = "times", fontWeight = "normal", fontStyle = "normal"),
            TextStyle(fontFamily = "times", fontWeight = "bold", fontStyle = "normal"),
            TextStyle(fontFamily = "times", fontWeight = "normal", fontStyle = "italic"),
            TextStyle(fontFamily = "courier", fontWeight = "normal", fontStyle = "normal"),
            TextStyle(fontFamily = "courier", fontWeight = "normal", fontStyle = "italic"),
            TextStyle(fontFamily = "courier", fontWeight = "bold", fontStyle = "italic"),
            TextStyle(fontFamily = "helvetica", fontWeight = "normal", fontStyle = "italic"),
            TextStyle(fontFamily = "helvetica", fontWeight = "bold", fontStyle = "normal")
        )

        for (style in variations) {
            val element = StaticTextElement(
                id = "t1",
                value = "Test",
                x = 10f,
                y = 20f,
                style = style
            )
            renderer.render(element, context)
        }
    }
}
