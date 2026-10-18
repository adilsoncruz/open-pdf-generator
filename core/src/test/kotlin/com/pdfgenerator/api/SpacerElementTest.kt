package com.pdfgenerator.api

import com.pdfgenerator.model.Margins
import com.pdfgenerator.model.PageSettings
import com.pdfgenerator.model.SpacerElement
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Assertions.assertTrue
import org.junit.jupiter.api.Test

class SpacerElementTest {
    @Test
    fun `should create and validate SpacerElement`() {
        val spacer =
            SpacerElement(
                id = "s1",
                x = 0f,
                y = 0f,
                width = 100f,
                height = 50f,
            )

        assertEquals("spacer", spacer.type)
        assertEquals(50f, spacer.height)

        val errors = spacer.validate(PageSettings(size = "A4", orientation = "portrait", margins = Margins(0f, 0f, 0f, 0f)))
        assertTrue(errors.isEmpty())
    }
}
