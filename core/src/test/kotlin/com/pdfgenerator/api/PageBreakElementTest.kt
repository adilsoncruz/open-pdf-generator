package com.pdfgenerator.api

import com.pdfgenerator.model.*
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.Assertions.*

class PageBreakElementTest {
    @Test
    fun `should create and validate PageBreakElement`() {
        val pageBreak = PageBreakElement(
            id = "pb1"
        )
        
        assertEquals("page_break", pageBreak.type)
        
        val errors = pageBreak.validate(PageSettings(size = "A4", orientation = "portrait", margins = Margins(0f, 0f, 0f, 0f)))
        assertTrue(errors.isEmpty())
    }
}
