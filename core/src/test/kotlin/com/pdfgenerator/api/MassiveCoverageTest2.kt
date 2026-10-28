package com.pdfgenerator.api

import com.pdfgenerator.model.Template
import org.junit.jupiter.api.Assertions.*
import org.junit.jupiter.api.Test

class MassiveCoverageTest2 {
    @Test
    fun `test table fixed layout without autoflow`() {
        val generator = PDFGenerator()
        val templateJson =
            """
            {
                "version": "1.0",
                "pageSettings": { 
                    "size": "A4", 
                    "orientation": "portrait",
                    "margins": { "top": 10, "right": 10, "bottom": 10, "left": 10 }
                },
                "pageElements": [
                    {
                        "type": "table",
                        "id": "table1",
                        "x": 10, "y": 50,
                        "paginated": false,
                        "dataBinding": "items",
                        "columns": [
                            { "header": "Name", "field": "name", "width": 100 }
                        ]
                    }
                ]
            }
            """.trimIndent()

        val template = Template.fromString(templateJson)
        val data =
            mapOf(
                "items" to
                    listOf(
                        mapOf("name" to "Item 1"),
                        mapOf("name" to "Item 2"),
                    ),
            )
        val bytes = generator.generate(template, data)
        assertTrue(bytes.isNotEmpty())
    }
}
