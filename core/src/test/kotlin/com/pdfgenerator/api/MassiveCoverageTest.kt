package com.pdfgenerator.api

import com.pdfgenerator.model.Template
import org.junit.jupiter.api.Assertions.*
import org.junit.jupiter.api.Test

class MassiveCoverageTest {
    @Test
    fun `test summaryPage and getElementHeight with loops and tables`() {
        val generator = PDFGenerator()
        val templateJson = """
            {
                "version": "1.0",
                "pageSettings": { 
                    "size": "A4", 
                    "orientation": "portrait", 
                    "margins": { "top": 10, "right": 10, "bottom": 10, "left": 10 },
                    "header": {
                        "elements": [
                            { "type": "static_text", "id": "h1", "value": "Header", "x": 0, "y": 0, "width": 100, "height": 20 }
                        ]
                    }
                },
                "pageElements": [
                    {
                        "type": "container",
                        "id": "body_container",
                        "x": 0, "y": 0, "width": 200, "height": 200,
                        "elements": [
                            {
                                "type": "loop",
                                "id": "loop1",
                                "x": 10, "y": 10,
                                "dataBinding": "items",
                                "width": 100,
                                "height": 20,
                                "elements": [
                                    { "type": "text", "id": "text1", "dataBinding": "name", "x": 0, "y": 0, "width": 100, "height": 20 }
                                ]
                            },
                            {
                                "type": "table",
                                "id": "table1",
                                "x": 10, "y": 50,
                                "dataBinding": "items",
                                "columns": [
                                    { "header": "Name", "field": "name", "width": 100 }
                                ]
                            },
                            {
                                "type": "conditional",
                                "id": "cond1",
                                "x": 10, "y": 100,
                                "condition": "show == 'true'",
                                "elements": [
                                    { "type": "line", "id": "line1", "x1": 0, "y1": 0, "x2": 10, "y2": 10 }
                                ]
                            }
                        ]
                    }
                ],
                "summaryPage": {
                    "background": {
                        "elements": [
                            { "type": "rectangle", "id": "rect_bg", "x": 0, "y": 0, "width": 100, "height": 100 }
                        ]
                    },
                    "elements": [
                        { "type": "static_text", "id": "sum1", "value": "Summary Text", "x": 50, "y": 50, "width": 100, "height": 20 }
                    ]
                }
            }
        """.trimIndent()
        
        val template = Template.fromString(templateJson)
        val data = mapOf(
            "items" to listOf(
                mapOf("name" to "Item 1"),
                mapOf("name" to "Item 2")
            ),
            "show" to "true"
        )
        generator.generate(template, data)
    }
}
