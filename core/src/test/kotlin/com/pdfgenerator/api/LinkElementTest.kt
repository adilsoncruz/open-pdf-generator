package com.pdfgenerator.api

import com.pdfgenerator.model.*
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.Assertions.*

class LinkElementTest {
    @Test
    fun `should create and validate LinkElement`() {
        val link = LinkElement(
            id = "l1",
            x = 0f,
            y = 0f,
            value = "Click Here",
            url = "https://example.com"
        )
        
        assertEquals("link", link.type)
        assertEquals("https://example.com", link.url)
        
        val errors = link.validate(PageSettings(size = "A4", orientation = "portrait", margins = Margins(0f, 0f, 0f, 0f)))
        assertTrue(errors.isEmpty())
    }

    @Test
    fun `should fail validation for LinkElement with blank url`() {
        val link = LinkElement(
            id = "l1",
            x = 0f,
            y = 0f,
            value = "Click Here",
            url = ""
        )
        
        val errors = link.validate(PageSettings(size = "A4", orientation = "portrait", margins = Margins(0f, 0f, 0f, 0f)))
        assertEquals(1, errors.size)
        assertTrue(errors[0].message.contains("valid url"))
    }
}
