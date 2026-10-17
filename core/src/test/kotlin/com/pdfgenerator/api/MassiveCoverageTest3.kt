package com.pdfgenerator.api

import com.pdfgenerator.model.Template
import org.junit.jupiter.api.Assertions.*
import org.junit.jupiter.api.Test
import java.io.File

class MassiveCoverageTest3 {

    @Test
    fun `test text and static_text edge cases`() {
        val generator = PDFGenerator()
        val templateJson = """
            {
                "version": "1.0",
                "pageSettings": { 
                    "size": "A4", 
                    "orientation": "portrait",
                    "margins": { "top": 10, "right": 10, "bottom": 10, "left": 10 }
                },
                "pageElements": [
                    {
                        "type": "text",
                        "id": "text_justify",
                        "x": 10, "y": 50,
                        "dataBinding": "multiline",
                        "width": 100,
                        "height": 50,
                        "style": { "alignment": "justify", "backgroundColor": "#FF0000" }
                    },
                    {
                        "type": "text",
                        "id": "text_right",
                        "x": 10, "y": 120,
                        "dataBinding": "multiline",
                        "width": 100,
                        "height": 50,
                        "style": { "alignment": "right", "backgroundColor": "transparent" }
                    },
                    {
                        "type": "static_text",
                        "id": "static_justify",
                        "x": 10, "y": 200,
                        "value": "Line 1\n\nLine 3",
                        "width": 100,
                        "height": 50,
                        "style": { "alignment": "justify", "backgroundColor": "#00FF00" }
                    },
                    {
                        "type": "static_text",
                        "id": "static_right",
                        "x": 10, "y": 280,
                        "value": "Line 1\nLine 2",
                        "width": 100,
                        "height": 50,
                        "style": { "alignment": "right" }
                    }
                ]
            }
        """.trimIndent()
        
        val template = Template.fromString(templateJson)
        val data = mapOf(
            "multiline" to "Line 1\n\nLine 3"
        )
        val bytes = generator.generate(template, data)
        assertTrue(bytes.isNotEmpty())
    }
}
