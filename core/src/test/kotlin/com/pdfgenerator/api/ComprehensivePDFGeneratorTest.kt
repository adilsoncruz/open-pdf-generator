package com.pdfgenerator.api

import org.junit.jupiter.api.Assertions.*
import org.junit.jupiter.api.Test

class ComprehensivePDFGeneratorTest {
    private val pdfGenerator = PDFGenerator()

    @Test
    fun `test table border combinations`() {
        // Table with different border types
        val validTemplate =
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
                  "x": 10, "y": 10, "width": 500,
                  "columns": [
                    { "header": "H1", "field": "f1", "width": 50 }
                  ],
                  "style": {
                     "headerBorderType": "row",
                     "cellBorderType": "top-bottom"
                  },
                  "dataBinding": "items"
                },
                {
                  "type": "table",
                  "id": "table2",
                  "x": 10, "y": 100, "width": 500,
                  "columns": [
                    { "header": "H2", "field": "f2", "width": 50 }
                  ],
                  "style": {
                     "headerBorderType": "left-right",
                     "cellBorderType": "left-right"
                  },
                  "dataBinding": "items"
                },
                {
                  "type": "table",
                  "id": "table3",
                  "x": 10, "y": 200, "width": 500,
                  "columns": [
                    { "header": "H3", "field": "f3", "width": 50 }
                  ],
                  "style": {
                     "headerBorderType": "columns",
                     "cellBorderType": "cells"
                  },
                  "dataBinding": "items"
                }
              ]
            }
            """.trimIndent()

        val data =
            """
            {
              "items": [
                 { "f1": "A", "f2": "B", "f3": "C" }
              ]
            }
            """.trimIndent()

        val pdfBytes = pdfGenerator.generate(validTemplate, data)
        assertTrue(pdfBytes.isNotEmpty())
    }

    @Test
    fun `test invalid conditions in generator`() {
        val badTemplateJson1 = """ { "invalid json" } """
        val e1 =
            assertThrows(PDFGenerationException::class.java) {
                pdfGenerator.generate(badTemplateJson1, "{}")
            }
        assertTrue(e1.message!!.contains("Erro de sintaxe JSON") || e1.message!!.contains("JSON syntax error"))

        val e2 =
            assertThrows(PDFGenerationException::class.java) {
                pdfGenerator.generateFromPath("non-existent-template-file.json", "{}")
            }
        assertTrue(e2.message!!.contains("Template not found") || e2.message!!.contains("Error generating PDF"))
    }
}
