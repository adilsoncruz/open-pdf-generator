package com.pdfgenerator.renderer

import com.pdfgenerator.adapter.openpdf.TextRenderer
import com.pdfgenerator.engine.RenderContext
import com.pdfgenerator.engine.TextLayoutCacheKey
import com.pdfgenerator.engine.TextLayoutMeasurement
import com.pdfgenerator.model.TextElement
import com.pdfgenerator.model.TextStyle
import io.mockk.every
import io.mockk.mockk
import org.junit.jupiter.api.Assertions.*
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.openpdf.text.Document
import org.openpdf.text.PageSize
import org.openpdf.text.pdf.PdfContentByte
import org.openpdf.text.pdf.PdfWriter

class TextRendererCoverageTest {
    private lateinit var document: Document
    private lateinit var writer: PdfWriter
    private lateinit var contentByte: PdfContentByte
    private lateinit var context: RenderContext

    @BeforeEach
    fun setUp() {
        document = mockk(relaxed = true)
        every { document.pageSize } returns PageSize.A4

        writer = mockk(relaxed = true)
        contentByte = mockk(relaxed = true)

        every { writer.directContent } returns contentByte
        every { writer.directContentUnder } returns contentByte

        context = mockk(relaxed = true)
        every { context.document } returns document
        every { context.writer } returns writer
        every { context.data } returns mapOf("myText" to "resolvedFromData")
        every { context.loopContext } returns mockk(relaxed = true)
        every { context.resolveX(any()) } answers { firstArg() }
        every { context.resolveY(any()) } answers { firstArg() }
        every { context.useContentUnder } returns false
    }

    @Test
    fun `test cache hit in getOrMeasureMultilineLayout`() {
        val cache = mutableMapOf<TextLayoutCacheKey, TextLayoutMeasurement>()
        val key = TextLayoutCacheKey("id1", "text", 0)
        val measurement = TextLayoutMeasurement(listOf("text"), 12f, 12f)
        cache[key] = measurement

        val result =
            TextRenderer.getOrMeasureMultilineLayout(
                elementId = "id1",
                resolvedText = "text",
                styleHash = 0,
                boxWidth = 100f,
                fontSize = 12f,
                lineHeight = 1f,
                paddingTop = 0f,
                paddingBottom = 0f,
                paddingLeft = 0f,
                paddingRight = 0f,
                firstLineIndent = 0f,
                fontFamily = "Helvetica",
                cache = cache,
            )
        assertEquals(measurement, result)

        // Call without cache and baseFont to hit default parameters
        val resultNoCache =
            TextRenderer.getOrMeasureMultilineLayout(
                elementId = "id2",
                resolvedText = "text",
                styleHash = 0,
                boxWidth = 100f,
                fontSize = 12f,
                lineHeight = 1f,
                paddingTop = 0f,
                paddingBottom = 0f,
                paddingLeft = 0f,
                paddingRight = 0f,
                firstLineIndent = 0f,
                fontFamily = "Helvetica",
            )
        assertNotNull(resultNoCache)
    }

    @Test
    fun `test calculateContentHeight and measureMultilineLayout`() {
        val height =
            TextRenderer.calculateContentHeight(
                text = "Hello\n\nWorld",
                boxWidth = 100f,
                fontSize = 12f,
                lineHeight = 1.2f,
                paddingTop = 5f,
                paddingBottom = 5f,
                paddingLeft = 2f,
                paddingRight = 2f,
                firstLineIndent = 10f,
                fontFamily = "times",
            )
        assertTrue(height > 0)

        // courier font coverage
        val heightCourier =
            TextRenderer.calculateContentHeight(
                text = "Some very long text that will wrap around because the box width is very small",
                boxWidth = 50f,
                fontSize = 12f,
                lineHeight = 1.0f,
                paddingTop = 0f,
                paddingBottom = 0f,
                paddingLeft = 0f,
                paddingRight = 0f,
                firstLineIndent = 0f,
                fontFamily = "courier",
            )
        assertTrue(heightCourier > 0)
    }

    @Test
    fun `test render conditions and empty texts`() {
        val renderer = TextRenderer()

        // False condition
        val el1 = TextElement(id = "1", x = 0f, y = 0f, value = "Test", printCondition = "1 == 2")
        renderer.render(el1, context)

        // Null text
        val el2 = TextElement(id = "2", x = 0f, y = 0f, value = "")
        renderer.render(el2, context)

        // Expression in value with loop context
        val el3 = TextElement(id = "3", x = 0f, y = 0f, value = "myText | uppercase")
        renderer.render(el3, context)

        // Data binding with transformations
        val el4 = TextElement(id = "4", x = 0f, y = 0f, dataBinding = "myText | uppercase")
        renderer.render(el4, context)
    }

    @Test
    fun `test renderSingleLine variations`() {
        val renderer = TextRenderer()
        every { context.useContentUnder } returns true

        // Background color, useContentUnder, verticalAlign bottom and else, alignment center and right
        val elCenter =
            TextElement(
                id = "1",
                x = 0f,
                y = 0f,
                value = "Center",
                style =
                    TextStyle(
                        alignment = "center",
                        verticalAlignment = "bottom",
                        backgroundColor = "#ff0000",
                    ),
            )
        renderer.render(elCenter, context)

        val elCenterV =
            TextElement(
                id = "1v",
                x = 0f,
                y = 0f,
                value = "CenterV",
                style = TextStyle(verticalAlignment = "center"),
            )
        renderer.render(elCenterV, context)

        val elRight =
            TextElement(
                id = "2",
                x = 0f,
                y = 0f,
                value = "Right",
                style = TextStyle(alignment = "right", verticalAlignment = "other"),
            )
        renderer.render(elRight, context)

        val elJustify =
            TextElement(
                id = "3",
                x = 0f,
                y = 0f,
                value = "Justify",
                style = TextStyle(alignment = "justify", fontWeight = "bold", fontStyle = "italic", fontFamily = "times"),
            )
        renderer.render(elJustify, context)

        val elCourier =
            TextElement(
                id = "4",
                x = 0f,
                y = 0f,
                value = "Courier",
                style = TextStyle(fontWeight = "bold", fontStyle = "italic", fontFamily = "courier"),
            )
        renderer.render(elCourier, context)

        val elTimesBold =
            TextElement(
                id = "5",
                x = 0f,
                y = 0f,
                value = "TimesBold",
                style = TextStyle(fontWeight = "bold", fontFamily = "times"),
            )
        renderer.render(elTimesBold, context)

        val elTimesItalic =
            TextElement(
                id = "6",
                x = 0f,
                y = 0f,
                value = "TimesItalic",
                style = TextStyle(fontStyle = "italic", fontFamily = "times"),
            )
        renderer.render(elTimesItalic, context)

        val elCourierBold =
            TextElement(
                id = "7",
                x = 0f,
                y = 0f,
                value = "CourierBold",
                style = TextStyle(fontWeight = "bold", fontFamily = "courier"),
            )
        renderer.render(elCourierBold, context)

        val elCourierItalic =
            TextElement(
                id = "8",
                x = 0f,
                y = 0f,
                value = "CourierItalic",
                style = TextStyle(fontStyle = "italic", fontFamily = "courier"),
            )
        renderer.render(elCourierItalic, context)

        val elHelvBoldItalic =
            TextElement(
                id = "9",
                x = 0f,
                y = 0f,
                value = "HelvBoldItalic",
                style = TextStyle(fontWeight = "bold", fontStyle = "italic", fontFamily = "helvetica"),
            )
        renderer.render(elHelvBoldItalic, context)

        val elHelvBold =
            TextElement(
                id = "10",
                x = 0f,
                y = 0f,
                value = "HelvBold",
                style = TextStyle(fontWeight = "bold", fontFamily = "helvetica"),
            )
        renderer.render(elHelvBold, context)

        val elHelvItalic =
            TextElement(
                id = "11",
                x = 0f,
                y = 0f,
                value = "HelvItalic",
                style = TextStyle(fontStyle = "italic", fontFamily = "helvetica"),
            )
        renderer.render(elHelvItalic, context)
    }

    @Test
    fun `test renderMultiline variations`() {
        val renderer = TextRenderer()
        every { context.useContentUnder } returns true

        // Background color, useContentUnder, overflow hidden
        val elHidden =
            TextElement(
                id = "m1",
                x = 0f,
                y = 0f,
                value = "Line 1\nLine 2\nLine 3",
                style = TextStyle(multiline = true, backgroundColor = "#00ff00", overflow = "hidden"),
            )
        renderer.render(elHidden, context)

        val elRight =
            TextElement(
                id = "m2",
                x = 0f,
                y = 0f,
                value = "Right aligned\ntext",
                style = TextStyle(multiline = true, alignment = "right"),
            )
        renderer.render(elRight, context)

        val elCenter =
            TextElement(
                id = "m3",
                x = 0f,
                y = 0f,
                value = "Center aligned\ntext",
                style = TextStyle(multiline = true, alignment = "center"),
            )
        renderer.render(elCenter, context)
    }
}
