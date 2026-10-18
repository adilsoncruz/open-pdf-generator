package com.pdfgenerator.api

import com.pdfgenerator.model.Margins
import com.pdfgenerator.model.PageBreakElement
import com.pdfgenerator.model.PageSettings
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Assertions.assertTrue
import org.junit.jupiter.api.Test

class PageBreakElementTest {
    @Test
    fun `should create and validate PageBreakElement`() {
        val pageBreak =
            PageBreakElement(
                id = "pb1",
            )

        assertEquals("page_break", pageBreak.type)

        val errors = pageBreak.validate(PageSettings(size = "A4", orientation = "portrait", margins = Margins(0f, 0f, 0f, 0f)))
        assertTrue(errors.isEmpty())
    }
}
