package com.pdfgenerator.renderer

import com.pdfgenerator.api.PDFGenerator
import com.pdfgenerator.model.Template
import org.junit.jupiter.api.Nested
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.io.TempDir
import java.io.File
import kotlin.test.assertTrue

class TableRendererEdgeCasesTest {
    @Nested
    inner class TableRendererEdgeCases {
        @Test
        fun `should render table with missing data and various styles`(
            @TempDir tempDir: File,
        ) {
            val templateJson =
                """
                {
                  "version": "1.0",
                  "pageSettings": {
                    "size": "A4",
                    "orientation": "portrait",
                    "margins": {"top": 30, "right": 30, "bottom": 30, "left": 30}
                  },
                  "pageElements": [
                    {
                      "type": "table",
                      "id": "table1",
                      "x": 50,
                      "y": 50,
                      "width": 400,
                      "dataBinding": "items",
                      "columns": [
                        {"header": "Col 1", "field": "f1", "width": 100, "alignment": "center"},
                        {"header": "Col 2", "field": "f2", "width": 100, "alignment": "right"}
                      ],
                      "style": {
                        "headerBackground": "#000000",
                        "headerColor": "#FFFFFF",
                        "headerFontSize": 14,
                        "alternateRowBackground": "#EEEEEE",
                        "borderColor": "#FF0000",
                        "borderWidth": 1,
                        "padding": 5
                      }
                    }
                  ]
                }
                """.trimIndent()

            val template = Template.fromString(templateJson)
            val generator = PDFGenerator()
            val outputFile = File(tempDir, "table-edge.pdf")

            // Missing data should just render empty or handle nulls
            generator.generate(template, emptyMap(), outputFile)

            // Or with valid data with missing fields
            val data =
                mapOf(
                    "items" to
                        listOf(
                            mapOf("f1" to "Val 1", "f2" to "Val 2"),
                            mapOf("f1" to "Val 3"), // Missing f2
                        ),
                )

            generator.generate(template, data, outputFile)

            assertTrue(outputFile.exists())
            assertTrue(outputFile.length() > 0)
        }

        @Test
        fun `should render table with all border types, fonts and alignments`(
            @TempDir tempDir: File,
        ) {
            val variations =
                listOf(
                    // borders
                    mapOf("headerBorderType" to "none", "cellBorderType" to "none"),
                    mapOf("headerBorderType" to "row", "cellBorderType" to "row"),
                    mapOf("headerBorderType" to "columns", "cellBorderType" to "cells"),
                    mapOf("headerBorderType" to "top-bottom", "cellBorderType" to "top-bottom"),
                    mapOf("headerBorderType" to "left-right", "cellBorderType" to "left-right"),
                    mapOf("headerBorderType" to "invalid", "cellBorderType" to "invalid"),
                    // fonts
                    mapOf("headerFontFamily" to "times", "fontFamily" to "times", "headerFontWeight" to "bold"),
                    mapOf("headerFontFamily" to "courier", "fontFamily" to "courier", "headerFontWeight" to "normal"),
                    mapOf("headerFontFamily" to "helvetica-bold", "fontFamily" to "helvetica-bold"),
                )

            val alignments =
                listOf(
                    mapOf(
                        "headerAlignment" to "center",
                        "headerVerticalAlignment" to "top",
                        "alignment" to "center",
                        "verticalAlignment" to "top",
                    ),
                    mapOf(
                        "headerAlignment" to "right",
                        "headerVerticalAlignment" to "bottom",
                        "alignment" to "right",
                        "verticalAlignment" to "bottom",
                    ),
                    mapOf(
                        "headerAlignment" to "left",
                        "headerVerticalAlignment" to "middle",
                        "alignment" to "left",
                        "verticalAlignment" to "middle",
                    ),
                )

            var i = 0
            for (v in variations) {
                for (a in alignments) {
                    val templateJson =
                        """
                        {
                          "version": "1.0",
                          "pageSettings": {
                            "size": "A4",
                            "orientation": "portrait",
                            "margins": {"top": 30, "right": 30, "bottom": 30, "left": 30}
                          },
                          "pageElements": [
                            {
                              "type": "table",
                              "id": "table1",
                              "x": 50,
                              "y": 50,
                              "width": 400,
                              "dataBinding": "items",
                              "columns": [
                                {
                                  "header": "Col 1", 
                                  "field": "f1", 
                                  "width": 100, 
                                  "alignment": "${a["alignment"]}",
                                  "verticalAlignment": "${a["verticalAlignment"]}",
                                  "headerAlignment": "${a["headerAlignment"]}",
                                  "headerVerticalAlignment": "${a["headerVerticalAlignment"]}"
                                },
                                {
                                  "header": "Col 2", 
                                  "field": "f2", 
                                  "width": 100, 
                                  "alignment": "${a["alignment"]}",
                                  "verticalAlignment": "${a["verticalAlignment"]}",
                                  "headerAlignment": "${a["headerAlignment"]}",
                                  "headerVerticalAlignment": "${a["headerVerticalAlignment"]}"
                                }
                              ],
                              "style": {
                                "headerBorderType": "${v["headerBorderType"] ?: "all"}",
                                "cellBorderType": "${v["cellBorderType"] ?: "all"}",
                                "headerFontFamily": "${v["headerFontFamily"] ?: "helvetica"}",
                                "fontFamily": "${v["fontFamily"] ?: "helvetica"}",
                                "headerFontWeight": "${v["headerFontWeight"] ?: "normal"}",
                                "borderWidth": 2,
                                "headerBorderWidth": 2,
                                "paddingTop": 2,
                                "paddingRight": 2,
                                "paddingBottom": 2,
                                "paddingLeft": 2
                              }
                            }
                          ]
                        }
                        """.trimIndent()

                    val template = Template.fromString(templateJson)
                    val generator = PDFGenerator()
                    val outputFile = File(tempDir, "table-full-coverage-${i++}.pdf")

                    val data =
                        mapOf(
                            "items" to
                                listOf(
                                    mapOf("f1" to "V1", "f2" to "V2"),
                                    mapOf("f1" to "V3", "f2" to "V4"),
                                ),
                        )

                    generator.generate(template, data, outputFile)
                    assertTrue(outputFile.exists())
                }
            }
        }
    }
}
