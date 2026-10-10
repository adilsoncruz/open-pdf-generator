package com.pdfgenerator.api

import com.pdfgenerator.model.*
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.Assertions.*

class RichTextElementTest {
    @Test
    fun `should create and validate RichTextElement`() {
        val richText = RichTextElement(
            id = "rt1",
            x = 0f,
            y = 0f,
            value = "**Bold** text"
        )
        
        assertEquals("rich_text", richText.type)
        assertEquals("**Bold** text", richText.value)
        
        val errors = richText.validate(PageSettings(size = "A4", orientation = "portrait", margins = Margins(0f, 0f, 0f, 0f)))
        assertTrue(errors.isEmpty())
    }

    @Test
    fun `should fail validation for RichTextElement without value or dataBinding`() {
        val richText = RichTextElement(
            id = "rt1",
            x = 0f,
            y = 0f
        )
        
        val errors = richText.validate(PageSettings(size = "A4", orientation = "portrait", margins = Margins(0f, 0f, 0f, 0f)))
        assertEquals(1, errors.size)
        assertTrue(errors[0].message.contains("dataBinding or value"))
    }
}
