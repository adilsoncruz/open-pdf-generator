package com.pdfgenerator.renderer

import com.lowagie.text.pdf.BaseFont
import com.pdfgenerator.adapter.openpdf.TextSpanBuilder
import com.pdfgenerator.engine.RenderContext
import com.pdfgenerator.model.TextElement
import com.pdfgenerator.model.TextStyle
import io.mockk.every
import io.mockk.mockk
import org.junit.jupiter.api.Assertions.*
import org.junit.jupiter.api.Test

class TextSpanBuilderTest {
    @Test
    fun `test resolveBaseFontName for various combinations`() {
        assertEquals(BaseFont.TIMES_BOLDITALIC, TextSpanBuilder.resolveBaseFontName("times", "bold", "italic"))
        assertEquals(BaseFont.TIMES_BOLD, TextSpanBuilder.resolveBaseFontName("times", "bold", "normal"))
        assertEquals(BaseFont.TIMES_ITALIC, TextSpanBuilder.resolveBaseFontName("times", "normal", "italic"))
        assertEquals(BaseFont.TIMES_ROMAN, TextSpanBuilder.resolveBaseFontName("times", "normal", "normal"))

        assertEquals(BaseFont.COURIER_BOLDOBLIQUE, TextSpanBuilder.resolveBaseFontName("courier", "bold", "italic"))
        assertEquals(BaseFont.COURIER_BOLD, TextSpanBuilder.resolveBaseFontName("courier", "bold", "normal"))
        assertEquals(BaseFont.COURIER_OBLIQUE, TextSpanBuilder.resolveBaseFontName("courier", "normal", "italic"))
        assertEquals(BaseFont.COURIER, TextSpanBuilder.resolveBaseFontName("courier", "normal", "normal"))

        assertEquals(BaseFont.HELVETICA_BOLDOBLIQUE, TextSpanBuilder.resolveBaseFontName("helvetica", "bold", "italic"))
        assertEquals(BaseFont.HELVETICA_BOLD, TextSpanBuilder.resolveBaseFontName("helvetica", "bold", "normal"))
        assertEquals(BaseFont.HELVETICA_OBLIQUE, TextSpanBuilder.resolveBaseFontName("helvetica", "normal", "italic"))
        assertEquals(BaseFont.HELVETICA, TextSpanBuilder.resolveBaseFontName("helvetica", "normal", "normal"))
    }

    @Test
    fun `test createFont with element and style`() {
        val style = TextStyle(fontSize = 14f, color = "#ff0000", fontWeight = "bold")
        val font = TextSpanBuilder.createFont(style)
        assertEquals(14f, font.size)
        assertNotNull(font.color)

        val element = TextElement(id = "txt1", x = 0f, y = 0f, style = style)
        val fontFromElement = TextSpanBuilder.createFont(element)
        assertEquals(14f, fontFromElement.size)
    }

    @Test
    fun `test buildChunk with decorations`() {
        val style = TextStyle(fontSize = 12f)
        val font = TextSpanBuilder.createFont(style)

        val plainChunk = TextSpanBuilder.buildChunk("Plain", font)
        assertNotNull(plainChunk)
        assertEquals("Plain", plainChunk.content)

        val decoratedChunk = TextSpanBuilder.buildChunk("Decorated", font, underline = true, strikethrough = true)
        assertNotNull(decoratedChunk)
        assertEquals("Decorated", decoratedChunk.content)
    }

    @Test
    fun `test resolveText variants`() {
        val context = mockk<RenderContext>(relaxed = true)
        every { context.data } returns mapOf("var1" to "value1", "person" to mapOf("name" to "Alice"))
        every { context.loopContext } returns null

        val elDirect = TextElement(id = "1", x = 0f, y = 0f, value = "Simple text")
        assertEquals("Simple text", TextSpanBuilder.resolveText(elDirect, context))

        val elBinding = TextElement(id = "2", x = 0f, y = 0f, dataBinding = "person.name")
        assertEquals("Alice", TextSpanBuilder.resolveText(elBinding, context))

        val elTemplate = TextElement(id = "3", x = 0f, y = 0f, dataBinding = "Hello \${person.name}")
        assertEquals("Hello Alice", TextSpanBuilder.resolveText(elTemplate, context))

        val elEmpty = TextElement(id = "4", x = 0f, y = 0f, value = "")
        assertNull(TextSpanBuilder.resolveText(elEmpty, context))
    }
}
