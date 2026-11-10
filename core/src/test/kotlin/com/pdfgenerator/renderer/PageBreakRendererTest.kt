package com.pdfgenerator.renderer

import com.pdfgenerator.adapter.openpdf.PageBreakRenderer
import com.pdfgenerator.engine.RenderContext
import com.pdfgenerator.engine.RenderState
import com.pdfgenerator.model.PageBreakElement
import io.mockk.every
import io.mockk.mockk
import io.mockk.verify
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.openpdf.text.Document

class PageBreakRendererTest {
    private lateinit var document: Document
    private lateinit var renderState: RenderState
    private lateinit var context: RenderContext

    @BeforeEach
    fun setUp() {
        document = mockk(relaxed = true)
        renderState = RenderState().apply { currentY = 150f }
        context = mockk(relaxed = true)
        every { context.document } returns document
        every { context.renderState } returns renderState
        every { context.data } returns mapOf("shouldBreak" to true, "counter" to 5)
        every { context.loopContext } returns null
    }

    @Test
    fun `should create new page when printCondition is null`() {
        val element = PageBreakElement(id = "pb1")
        PageBreakRenderer.render(element, context)

        verify(exactly = 1) { document.newPage() }
        assertEquals(0f, renderState.currentY)
    }

    @Test
    fun `should create new page when printCondition evaluates to true`() {
        val element = PageBreakElement(id = "pb2", printCondition = "shouldBreak == true")
        PageBreakRenderer.render(element, context)

        verify(exactly = 1) { document.newPage() }
        assertEquals(0f, renderState.currentY)
    }

    @Test
    fun `should not create new page when printCondition evaluates to false`() {
        val element = PageBreakElement(id = "pb3", printCondition = "counter > 10")
        PageBreakRenderer.render(element, context)

        verify(exactly = 0) { document.newPage() }
        assertEquals(150f, renderState.currentY)
    }
}
