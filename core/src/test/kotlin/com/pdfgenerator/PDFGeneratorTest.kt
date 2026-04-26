package com.pdfgenerator

import com.github.adilsoncruz.pdfsnapshottesting.EnablePdfSnapshots
import com.github.adilsoncruz.pdfsnapshottesting.PdfSnapshotTest
import com.github.adilsoncruz.pdfsnapshottesting.assertPdfByFile
import com.github.adilsoncruz.pdfsnapshottesting.models.PdfRegion
import com.github.adilsoncruz.pdfsnapshottesting.models.SnapshotConfig
import com.google.gson.GsonBuilder
import com.pdfgenerator.api.PDFGenerationException
import com.pdfgenerator.api.PDFGenerator
import com.pdfgenerator.model.CheckListElement
import com.pdfgenerator.model.CheckStyle
import com.pdfgenerator.model.ListElement
import com.pdfgenerator.model.ListMode
import com.pdfgenerator.model.Template
import com.pdfgenerator.model.TextStyle
import org.junit.jupiter.api.DynamicTest
import org.junit.jupiter.api.Nested
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.TestFactory
import org.junit.jupiter.api.assertThrows
import org.junit.jupiter.api.io.TempDir
import java.io.File
import kotlin.test.assertNotNull
import kotlin.test.assertTrue

@EnablePdfSnapshots
class PDFGeneratorTest {
    private val basicTemplateJson =
        """
        {
          "version": "1.0",
          "pageSettings": {
            "size": "A4",
            "orientation": "portrait",
            "margins": {
              "top": 30,
              "right": 30,
              "bottom": 30,
              "left": 30
            }
          },
          "pageElements": [
            {
              "type": "text",
              "id": "title",
              "x": 50,
              "y": 50,
              "value": "Hello, World!",
              "style": {
                "fontSize": 24,
                "fontWeight": "bold"
              }
            }
          ]
        }
        """.trimIndent()

    @Nested
    inner class BasicGeneration {
        @Test
        fun `should generate PDF from template to file`(
            @TempDir tempDir: File,
        ) {
            val template = Template.fromString(basicTemplateJson)
            val data = emptyMap<String, Any?>()

            val generator = PDFGenerator()
            val outputFile = File(tempDir, "test.pdf")
            generator.generate(template, data, outputFile)

            assertTrue(outputFile.exists())
            assertTrue(outputFile.length() > 0)
        }

        @Test
        fun `should generate PDF from template to ByteArray`() {
            val template = Template.fromString(basicTemplateJson)
            val data = emptyMap<String, Any?>()

            val generator = PDFGenerator()
            val pdfBytes = generator.generate(template, data)

            assertNotNull(pdfBytes)
            assertTrue(pdfBytes.isNotEmpty())
            assertTrue(pdfBytes.size > 100)
        }

        @Test
        fun `should generate PDF from JSON strings to ByteArray`() {
            val dataJson = "{}"

            val generator = PDFGenerator()
            val pdfBytes = generator.generate(basicTemplateJson, dataJson)

            assertNotNull(pdfBytes)
            assertTrue(pdfBytes.isNotEmpty())
        }

        @Test
        fun `should generate PDF from JSON strings to file`(
            @TempDir tempDir: File,
        ) {
            val dataJson = "{}"

            val generator = PDFGenerator()
            val outputFile = File(tempDir, "test-json.pdf")
            generator.generate(basicTemplateJson, dataJson, outputFile)

            assertTrue(outputFile.exists())
            assertTrue(outputFile.length() > 0)
        }

        @Test
        fun `should generate PDF with landscape orientation`() {
            val templateJson =
                """
                {
                  "version": "1.0",
                  "pageSettings": {
                    "size": "A4",
                    "orientation": "landscape",
                    "margins": { "top": 30, "right": 30, "bottom": 30, "left": 30 }
                  },
                  "pageElements": [
                    { "type": "text", "id": "text1", "x": 50, "y": 50, "value": "Landscape" }
                  ]
                }
                """.trimIndent()

            val template = Template.fromString(templateJson)
            val generator = PDFGenerator()
            val pdfBytes = generator.generate(template, emptyMap())

            assertTrue(pdfBytes.isNotEmpty())
        }

        @Test
        fun `should generate PDF with custom page size`() {
            val templateJson =
                """
                {
                  "version": "1.0",
                  "pageSettings": {
                    "size": "CUSTOM",
                    "orientation": "portrait",
                    "margins": { "top": 20, "right": 20, "bottom": 20, "left": 20 },
                    "customSize": { "width": 400, "height": 600 }
                  },
                  "pageElements": [
                    { "type": "text", "id": "text1", "x": 50, "y": 50, "value": "Custom Size" }
                  ]
                }
                """.trimIndent()

            val template = Template.fromString(templateJson)
            val generator = PDFGenerator()
            val pdfBytes = generator.generate(template, emptyMap())

            assertTrue(pdfBytes.isNotEmpty())
        }
    }

    @Nested
    inner class DataBinding {
        @Test
        fun `should generate PDF with data binding`(
            @TempDir tempDir: File,
        ) {
            val templateJson =
                """
                {
                  "version": "1.0",
                  "pageSettings": {
                    "size": "A4",
                    "orientation": "portrait",
                    "margins": { "top": 30, "right": 30, "bottom": 30, "left": 30 }
                  },
                  "pageElements": [
                    {
                      "type": "text",
                      "id": "user-name",
                      "x": 50,
                      "y": 50,
                      "dataBinding": "user.name",
                      "style": { "fontSize": 18 }
                    }
                  ]
                }
                """.trimIndent()

            val template = Template.fromString(templateJson)
            val data = mapOf("user" to mapOf("name" to "John Doe"))

            val generator = PDFGenerator()
            val outputFile = File(tempDir, "test-binding.pdf")
            generator.generate(template, data, outputFile)

            assertTrue(outputFile.exists())
        }

        @Test
        fun `should handle missing data binding gracefully`() {
            val templateJson =
                """
                {
                  "version": "1.0",
                  "pageSettings": {
                    "size": "A4",
                    "orientation": "portrait",
                    "margins": { "top": 30, "right": 30, "bottom": 30, "left": 30 }
                  },
                  "pageElements": [
                    { "type": "text", "id": "text1", "x": 50, "y": 50, "dataBinding": "missing.property" }
                  ]
                }
                """.trimIndent()

            val template = Template.fromString(templateJson)
            val generator = PDFGenerator()
            val pdfBytes = generator.generate(template, emptyMap())

            assertTrue(pdfBytes.isNotEmpty())
        }

        @TestFactory
        fun `should process transformations in data binding`(): Collection<DynamicTest> {
            val templateJson =
                """
                {
                  "version": "1.0",
                  "pageSettings": {
                    "size": "A4",
                    "orientation": "portrait",
                    "margins": { "top": 30, "right": 30, "bottom": 30, "left": 30 }
                  },
                  "pageElements": [
                    { "type": "text", "id": "text1", "x": 0, "y": 0, "dataBinding": "name | uppercase" },
                    { "type": "text", "id": "text2", "x": 0, "y": 50, "dataBinding": "name | lowercase" },
                    { "type": "text", "id": "text3", "x": 0, "y": 100, "dataBinding": "name | capitalize" },
                    { "type": "text", "id": "text4", "x": 0, "y": 150, "dataBinding": "name | prefix:'Name:'" },
                    { "type": "text", "id": "text5", "x": 0, "y": 200, "dataBinding": "items | suffix:' units'" }
                  ]
                }
                """.trimIndent()

            val template = Template.fromString(templateJson)
            val data = mapOf("name" to "Fulano", "items" to 9)
            val generator = PDFGenerator()
            val pdfBytes = generator.generate(template, data)

            assertTrue(pdfBytes.isNotEmpty())

            return PdfSnapshotTest(
                expectedPdf = "dataBinding/transforms/teste",
                pdfBytes,
            )
                .page(0)
                .region("uppercase", PdfRegion(30f, 30f, 65f, 20f))
                .region("lowercase", PdfRegion(30f, 80f, 60f, 20f))
                .region("capitalize", PdfRegion(30f, 130f, 60f, 20f))
                .region("prefix", PdfRegion(30f, 180f, 100f, 20f))
                .region("sufix", PdfRegion(30f, 230f, 60f, 20f))
                .assertPdfBySnapshot()
        }
    }

    @Nested
    inner class HeaderAndFooter {
        @Test
        fun `should generate PDF with header and footer`() {
            val templateJson =
                """
                {
                  "version": "1.0",
                  "pageSettings": {
                    "size": "A4",
                    "orientation": "portrait",
                    "margins": { "top": 30, "right": 30, "bottom": 30, "left": 30 },
                    "header": {
                      "height": 50,
                      "elements": [
                        {
                          "type": "rectangle",
                          "id": "rect1",
                          "x": 10,
                          "y": 10,
                          "width": 100,
                          "height": 50,
                          "style": { "fillColor": "#cccccc", "borderWidth": 2, "borderColor": "#000000" }
                        },
                        { "type": "text", "id": "header-title", "x": 20, "y": 20, "value": "123 teste", "style": { "font-size": "30px"} }
                      ]
                    },
                    "footer": {
                      "height": 50,
                      "elements": [
                        { "type": "text", "id": "footer-text", "x": 60, "y": 10, "value": "AAAAAA" }
                      ]
                    }
                  },
                  "pageElements": [
                    { "type": "text", "id": "body-text", "x": 60, "y": 50, "value": "asd asd asdasd"  }
                  ],
                  "summaryPage": {
                    "elements": [
                      { "type": "text", "id": "total", "x": 50, "y": 80, "dataBinding": "total" }
                    ]
                  }
                }
                """.trimIndent()

            val template = Template.fromString(templateJson)
            val generator = PDFGenerator()
            val pdfBytes = generator.generate(template, emptyMap())

            assertTrue(pdfBytes.isNotEmpty())

            assertPdfByFile(
                expected = "elements/text.pdf",
                pdfBytes,
                config = SnapshotConfig(tolerancePercent = 0.0000001f),
            )
        }

        @Test
        fun `should generate PDF with header containing line`() {
            val templateJson =
                """
                {
                  "version": "1.0",
                  "pageSettings": {
                    "size": "A4",
                    "orientation": "portrait",
                    "margins": { "top": 30, "right": 30, "bottom": 30, "left": 30 },
                    "header": {
                      "height": 50,
                      "elements": [
                        { "type": "text", "id": "title", "x": 0, "y": 10, "value": "Report" },
                        { "type": "line", "id": "separator", "x": 0, "y": 45, "width": 500, "height": 0, "style": { "width": 1 } }
                      ]
                    }
                  },
                  "pageElements": []
                }
                """.trimIndent()

            val template = Template.fromString(templateJson)
            val generator = PDFGenerator()
            val pdfBytes = generator.generate(template, emptyMap())

            assertTrue(pdfBytes.isNotEmpty())
        }
    }

    @Nested
    inner class Elements {
        @Test
        fun `should generate PDF with rectangle`() {
            val templateJson =
                """
                {
                  "version": "1.0",
                  "pageSettings": {
                    "size": "A4",
                    "orientation": "portrait",
                    "margins": { "top": 30, "right": 30, "bottom": 30, "left": 30 }
                  },
                  "pageElements": [
                    {
                      "type": "rectangle",
                      "id": "rect1",
                      "x": 50,
                      "y": 50,
                      "width": 100,
                      "height": 50,
                      "style": { "fillColor": "#000000", "borderWidth": 2, "borderColor": "#000000" }
                    },
                    {
                      "type": "rectangle",
                      "id": "rect2",
                      "x": 0,
                      "y": 0,
                      "width": 40,
                      "height": 40,
                      "style": { "fillColor": "#000000", "borderWidth": 2, "borderColor": "#000000" }
                    },
                    {
                      "type": "rectangle",
                      "id": "rect3",
                      "x": 50,
                      "y": 0,
                      "width": 40,
                      "height": 40,
                      "style": { "fillColor": "#000000", "borderWidth": 2, "borderColor": "#000000" }
                    }
                  ]
                }
                """.trimIndent()

            val template = Template.fromString(templateJson)
            val generator = PDFGenerator()
            val pdfBytes = generator.generate(template, emptyMap())

            assertTrue(pdfBytes.isNotEmpty())

            assertPdfByFile(
                expected = "elements/rectangle.pdf",
                pdfBytes,
                config = SnapshotConfig(tolerancePercent = 0.0000001f),
            )
        }

        @Test
        fun `should generate PDF with rectangle 100 percent width`() {
            val templateJson =
                """
                {
                  "version": "1.0",
                  "pageSettings": {
                    "size": "A4",
                    "orientation": "portrait",
                    "margins": { "top": 30, "right": 30, "bottom": 30, "left": 30 }
                  },
                  "pageElements": [
                    {
                      "type": "rectangle",
                      "id": "rect1",
                      "x": 0,
                      "y": 50,
                      "width": "100%",
                      "height": 50,
                      "style": { "fillColor": "#FF0000" }
                    }
                  ]
                }
                """.trimIndent()

            val template = Template.fromString(templateJson)
            val generator = PDFGenerator()
            val pdfBytes = generator.generate(template, emptyMap())

            assertTrue(pdfBytes.isNotEmpty())
        }

        @Test
        fun `should generate PDF with line using width and height`() {
            val templateJson =
                """
                {
                  "version": "1.0",
                  "pageSettings": {
                    "size": "A4",
                    "orientation": "portrait",
                    "margins": { "top": 30, "right": 30, "bottom": 30, "left": 30 }
                  },
                  "pageElements": [
                    {
                      "type": "line",
                      "id": "line1",
                      "x": 50,
                      "y": 50,
                      "width": 200,
                      "height": 0,
                      "style": { "color": "#000000", "width": 2 }
                    }
                  ]
                }
                """.trimIndent()

            val template = Template.fromString(templateJson)
            val generator = PDFGenerator()
            val pdfBytes = generator.generate(template, emptyMap())

            assertTrue(pdfBytes.isNotEmpty())
        }

        @Test
        fun `should generate PDF with line 100 percent width`() {
            val templateJson =
                """
                {
                  "version": "1.0",
                  "pageSettings": {
                    "size": "A4",
                    "orientation": "portrait",
                    "margins": { "top": 30, "right": 30, "bottom": 30, "left": 30 }
                  },
                  "pageElements": [
                    {
                      "type": "line",
                      "id": "line1",
                      "x": 0,
                      "y": 100,
                      "width": "100%",
                      "height": 0,
                      "style": { "color": "#333333", "width": 1 }
                    }
                  ]
                }
                """.trimIndent()

            val template = Template.fromString(templateJson)
            val generator = PDFGenerator()
            val pdfBytes = generator.generate(template, emptyMap())

            assertTrue(pdfBytes.isNotEmpty())
//        pdfSnapshotTesting(
//          pdfBytes = pdfBytes,
//        ).assertSnapshot("line_100_percent.png")
        }

        @Test
        fun `should generate PDF with diagonal line`() {
            val templateJson =
                """
                {
                  "version": "1.0",
                  "pageSettings": {
                    "size": "A4",
                    "orientation": "portrait",
                    "margins": { "top": 30, "right": 30, "bottom": 30, "left": 30 }
                  },
                  "pageElements": [
                    {
                      "type": "line",
                      "id": "line1",
                      "x": 50,
                      "y": 50,
                      "width": 100,
                      "height": 100,
                      "style": { "color": "#000000", "width": 2 }
                    }
                  ]
                }
                """.trimIndent()

            val template = Template.fromString(templateJson)
            val generator = PDFGenerator()
            val pdfBytes = generator.generate(template, emptyMap())

            assertTrue(pdfBytes.isNotEmpty())
        }

        @Test
        fun `should generate PDF with table`() {
            val templateJson =
                """
                {
                  "version": "1.0",
                  "pageSettings": {
                    "size": "A4",
                    "orientation": "portrait",
                    "margins": { "top": 30, "right": 30, "bottom": 30, "left": 30 }
                  },
                  "pageElements": [
                    {
                      "type": "table",
                      "id": "table1",
                      "x": 0,
                      "y": 50,
                      "dataBinding": "items",
                      "columns": [
                        { "header": "Name", "field": "name", "width": 200 },
                        { "header": "Price", "field": "price", "width": 100, "alignment": "right" }
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
                            mapOf("name" to "Item 1", "price" to "10.00"),
                            mapOf("name" to "Item 2", "price" to "20.00"),
                        ),
                )
            val generator = PDFGenerator()
            val pdfBytes = generator.generate(template, data)

            assertTrue(pdfBytes.isNotEmpty())
        }

        @Test
        fun `should generate PDF with rectangle with rounded corners`() {
            val templateJson =
                """
                {
                  "version": "1.0",
                  "pageSettings": {
                    "size": "A4",
                    "orientation": "portrait",
                    "margins": { "top": 30, "right": 30, "bottom": 30, "left": 30 }
                  },
                  "pageElements": [
                    {
                      "type": "rectangle",
                      "id": "rect1",
                      "x": 150,
                      "y": 80,
                      "width": 200,
                      "height": 100,
                      "style": { "fillColor": "#E0E0E0", "cornerRadius": 60 }
                    }
                  ]
                }
                """.trimIndent()

            val template = Template.fromString(templateJson)
            val generator = PDFGenerator()
            val pdfBytes = generator.generate(template, emptyMap())

            assertTrue(pdfBytes.isNotEmpty())

            assertPdfByFile(
                expected = "elements/rectangle/rounded",
                pdfBytes,
            )
    }

    @Nested
    inner class ConditionalAndLoop {
        @Test
        fun `should generate PDF with conditional element`() {
            val templateJson =
                """
                {
                  "version": "1.0",
                  "pageSettings": {
                    "size": "A4",
                    "orientation": "portrait",
                    "margins": { "top": 30, "right": 30, "bottom": 30, "left": 30 }
                  },
                  "pageElements": [
                    {
                      "type": "conditional",
                      "id": "cond1",
                      "x": 50,
                      "y": 50,
                      "condition": "showTitle == true",
                      "elements": [
                        { "type": "text", "id": "title", "x": 0, "y": 0, "value": "Title Visible" }
                      ]
                    }
                  ]
                }
                """.trimIndent()

            val template = Template.fromString(templateJson)
            val data = mapOf("showTitle" to true)
            val generator = PDFGenerator()
            val pdfBytes = generator.generate(template, data)

            assertTrue(pdfBytes.isNotEmpty())
        }

        @Test
        fun `should generate PDF with loop element`() {
            val templateJson =
                """
                {
                  "version": "1.0",
                  "pageSettings": {
                    "size": "A4",
                    "orientation": "portrait",
                    "margins": { "top": 30, "right": 30, "bottom": 30, "left": 30 }
                  },
                  "pageElements": [
                    {
                      "type": "loop",
                      "id": "loop1",
                      "x": 50,
                      "y": 50,
                      "dataBinding": "items",
                      "direction": "vertical",
                      "itemHeight": 30,
                      "elements": [
                        { "type": "text", "id": "itemName", "x": 0, "y": 0, "dataBinding": "item.name" }
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
                            mapOf("name" to "Item 3"),
                        ),
                )
            val generator = PDFGenerator()
            val pdfBytes = generator.generate(template, data)

            assertTrue(pdfBytes.isNotEmpty())
        }

        @Test
        fun `should generate PDF with nested conditional in loop`() {
            val templateJson =
                """
                {
                  "version": "1.0",
                  "pageSettings": {
                    "size": "A4",
                    "orientation": "portrait",
                    "margins": { "top": 30, "right": 30, "bottom": 30, "left": 30 }
                  },
                  "pageElements": [
                    {
                      "type": "loop",
                      "id": "loop1",
                      "x": 50,
                      "y": 50,
                      "dataBinding": "items",
                      "direction": "vertical",
                      "itemHeight": 30,
                      "elements": [
                        { "type": "text", "id": "itemName", "x": 0, "y": 0, "dataBinding": "item.name" },
                        {
                          "type": "conditional",
                          "id": "cond1",
                          "x": 200,
                          "y": 0,
                          "condition": "item.highlighted == true",
                          "elements": [
                            { "type": "text", "id": "star", "x": 0, "y": 0, "value": "★" }
                          ]
                        }
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
                            mapOf("name" to "Item 1", "highlighted" to true),
                            mapOf("name" to "Item 2", "highlighted" to false),
                            mapOf("name" to "Item 3", "highlighted" to true),
                        ),
                )
            val generator = PDFGenerator()
            val pdfBytes = generator.generate(template, data)

            assertTrue(pdfBytes.isNotEmpty())
        }
    }

    @Nested
    inner class SummaryPage {
        @Test
        fun `should generate PDF with summary page`() {
            val templateJson =
                """
                {
                  "version": "1.0",
                  "pageSettings": {
                    "size": "A4",
                    "orientation": "portrait",
                    "margins": { "top": 30, "right": 30, "bottom": 30, "left": 30 }
                  },
                  "pageElements": [
                    { "type": "text", "id": "mainContent", "x": 50, "y": 50, "value": "Main Page" }
                  ],
                  "summaryPage": {
                    "elements": [
                      { "type": "text", "id": "summaryTitle", "x": 50, "y": 50, "value": "Summary" },
                      { "type": "text", "id": "total", "x": 50, "y": 80, "dataBinding": "total" }
                    ]
                  }
                }
                """.trimIndent()

            val template = Template.fromString(templateJson)
            val data = mapOf("total" to "R$ 1.500,00")
            val generator = PDFGenerator()
            val pdfBytes = generator.generate(template, data)

            assertTrue(pdfBytes.isNotEmpty())

            assertPdfByFile(
                expected = "elements/summary.pdf",
                pdfBytes,
                config = SnapshotConfig(tolerancePercent = 0.0000001f),
            )
        }
    }

    @Nested
    inner class BodyBackground {
        @Test
        fun `should generate PDF with body background`() {
            val templateJson =
                """
                {
                  "version": "1.0",
                  "pageSettings": {
                    "size": "A4",
                    "orientation": "portrait",
                    "margins": { "top": 30, "right": 30, "bottom": 30, "left": 30 },
                    "bodyBackground": {
                      "elements": [
                        {
                          "type": "rectangle",
                          "id": "bg",
                          "x": 0,
                          "y": 0,
                          "width": "100%",
                          "height": "100%"
                        }
                      ]
                    }
                  },
                  "pageElements": [
                    { "type": "text", "id": "text1", "x": 50, "y": 50, "value": "Content Test Content Test" }
                  ]
                }
                """.trimIndent()

            val template = Template.fromString(templateJson)
            val generator = PDFGenerator()
            val pdfBytes = generator.generate(template, emptyMap())

            assertTrue(pdfBytes.isNotEmpty())

            assertPdfByFile(
                expected = "background/background.pdf",
                pdfBytes,
            )
        }
    }

    @Nested
    inner class MultilineText {
        @Test
        fun `should generate PDF with multiline text`() {
            val templateJson =
                """
                {
                  "version": "1.0",
                  "pageSettings": {
                    "size": "A4",
                    "orientation": "portrait",
                    "margins": { "top": 30, "right": 30, "bottom": 30, "left": 30 }
                  },
                  "pageElements": [
                    {
                      "type": "text",
                      "id": "multiline",
                      "x": 50,
                      "y": 50,
                      "width": 200,
                      "height": 100,
                      "value": "This is a long text that should wrap across multiple lines when rendered in the PDF document.",
                      "style": { "fontSize": 12, "multiline": true, "lineHeight": 1.5 }
                    }
                  ]
                }
                """.trimIndent()

            val template = Template.fromString(templateJson)
            val generator = PDFGenerator()
            val pdfBytes = generator.generate(template, emptyMap())

            assertTrue(pdfBytes.isNotEmpty())
        }
    }

    @Nested
    inner class ErrorHandling {
        @Test
        fun `should throw exception for invalid template JSON`() {
            val invalidJson = "{ invalid json }"

            val generator = PDFGenerator()

            assertThrows<Exception> {
                generator.generate(invalidJson, "{}")
            }
        }

        @Test
        fun `should throw exception for invalid data JSON`() {
            val invalidDataJson = "{ invalid }"

            val generator = PDFGenerator()

            assertThrows<Exception> {
                generator.generate(basicTemplateJson, invalidDataJson)
            }
        }

        @Test
        fun `should throw exception when data JSON is not an object`() {
            val arrayDataJson = "[1, 2, 3]"

            val generator = PDFGenerator()

            val exception =
                assertThrows<PDFGenerationException> {
                    generator.generate(basicTemplateJson, arrayDataJson)
                }

            assertTrue(exception.message!!.contains("JSON data must be a JSON object"))
        }

        @Test
        fun `should generate PDF with barcode when data is provided`() {
            val templateJson =
                """
                {
                  "version": "1.0",
                  "pageSettings": {
                    "size": "A4",
                    "orientation": "portrait",
                    "margins": { "top": 30, "right": 30, "bottom": 30, "left": 30 }
                  },
                  "pageElements": [
                    {
                      "type": "barcode",
                      "id": "qr1",
                      "x": 50,
                      "y": 50,
                      "width": 100,
                      "height": 100,
                      "barcodeType": "qrcode",
                      "dataBinding": "code"
                    }
                  ]
                }
                """.trimIndent()

            val template = Template.fromString(templateJson)
            val data = mapOf("code" to "TEST-12345")
            val generator = PDFGenerator()
            val pdfBytes = generator.generate(template, data)

            assertTrue(pdfBytes.isNotEmpty())
        }
    }

    @Nested
    inner class TextStylesTest {
        @Test
        fun `should generate PDF with styled text`() {
            val templateJson =
                """
                {
                  "version": "1.0",
                  "pageSettings": {
                    "size": "A4",
                    "orientation": "portrait",
                    "margins": { "top": 30, "right": 30, "bottom": 30, "left": 30 }
                  },
                  "pageElements": [
                    {
                      "type": "text",
                      "id": "bold",
                      "x": 50,
                      "y": 50,
                      "value": "Bold Text",
                      "style": { "fontSize": 18, "fontWeight": "bold" }
                    },
                    {
                      "type": "text",
                      "id": "italic",
                      "x": 50,
                      "y": 80,
                      "value": "Italic Text",
                      "style": { "fontSize": 18, "fontStyle": "italic" }
                    },
                    {
                      "type": "text",
                      "id": "colored",
                      "x": 50,
                      "y": 110,
                      "value": "Red Text",
                      "style": { "fontSize": 18, "color": "#FF0000" }
                    },
                    {
                      "type": "text",
                      "id": "centered",
                      "x": 50,
                      "y": 140,
                      "width": 200,
                      "value": "Centered Text",
                      "style": { "fontSize": 18, "alignment": "center" }
                    }
                  ]
                }
                """.trimIndent()

            val template = Template.fromString(templateJson)
            val generator = PDFGenerator()
            val pdfBytes = generator.generate(template, emptyMap())

            assertTrue(pdfBytes.isNotEmpty())
        }
    }

    @Nested
    inner class ListElementTest {
        @TestFactory
        fun `should generate PDF with checkList element and check style`(): Collection<DynamicTest> {
            val pageElements = mutableMapOf<String, ListElement>()
            var index = 1
            var spaceX = 0f
            ListMode.entries.map {
                pageElements.put(
                    "$it - unchecked items",
                    value =
                        ListElement(
                            id = "${index++}",
                            x = spaceX,
                            y = 0f,
                            width = 100f,
                            height = 180f,
                            style = TextStyle(fontSize = 12f),
                            dataBinding = "items",
                            itemSpacing = 10f,
                            listStyle = it,
                        ),
                )
                spaceX += 80f
            }

            val gson = GsonBuilder().setPrettyPrinting().create()

            val templateMap =
                mapOf(
                    "version" to "1.0",
                    "pageSettings" to
                        mapOf(
                            "size" to "A4",
                            "orientation" to "portrait",
                            "margins" to
                                mapOf(
                                    "top" to 20,
                                    "right" to 20,
                                    "bottom" to 20,
                                    "left" to 20,
                                ),
                        ),
                    "pageElements" to pageElements.values.toList(),
                )

            val templateJson = gson.toJson(templateMap)

            val data =
                mapOf(
                    "items" to
                        listOf(
                            "item 1",
                            "item 2",
                            "item 3",
                            "item 4",
                            "item 5",
                        ),
                )
            val template = Template.fromString(templateJson)
            val generator = PDFGenerator()

            val pdfBytes = generator.generate(template, data)

            val snapshot =
                PdfSnapshotTest(
                    expectedPdf = "list.pdf",
                    pdfBytes = pdfBytes,
                ).page(0)

            pageElements.forEach { (name, element) ->
                snapshot.region(
                    name,
                    PdfRegion(
                        element.x,
                        element.y,
                        element.width,
                        element.height,
                    ),
                )
            }

            return snapshot.assertPdfBySnapshot()
        }
    }

    @Nested
    inner class CheckListElementTest {
        @TestFactory
        fun `should generate PDF with checkList element and check style`(): Collection<DynamicTest> {
            val pageElements = mutableMapOf<String, CheckListElement>()
            var index = 1
            var spaceX = 0f
            CheckStyle.entries.map {
                pageElements.put(
                    "$it - unchecked items",
                    value =
                        CheckListElement(
                            id = "${index++}",
                            x = spaceX,
                            y = 0f,
                            width = 120f,
                            height = 180f,
                            style = TextStyle(fontSize = 12f),
                            dataBinding = "items",
                            itemSpacing = 10f,
                            checkStyle = it,
                        ),
                )
                pageElements.put(
                    "$it - with  checked items",
                    value =
                        CheckListElement(
                            id = "${index++}",
                            x = spaceX,
                            y = 200f,
                            width = 120f,
                            height = 180f,
                            style = TextStyle(fontSize = 12f),
                            dataBinding = "items_checked",
                            itemSpacing = 10f,
                            checkStyle = it,
                        ),
                )
                spaceX += 120f
            }

            val gson = GsonBuilder().setPrettyPrinting().create()

            val templateMap =
                mapOf(
                    "version" to "1.0",
                    "pageSettings" to
                        mapOf(
                            "size" to "A4",
                            "orientation" to "portrait",
                            "margins" to
                                mapOf(
                                    "top" to 30,
                                    "right" to 30,
                                    "bottom" to 30,
                                    "left" to 30,
                                ),
                        ),
                    "pageElements" to pageElements.values.toList(),
                )

            val templateJson = gson.toJson(templateMap)

            val data =
                mapOf(
                    "items" to
                        mapOf(
                            "item 1" to false,
                            "item 2" to false,
                            "item 3" to false,
                            "item 4" to false,
                            "item 5" to false,
                        ),
                    "items_checked" to
                        mapOf(
                            "item 1" to false,
                            "item 2" to true,
                            "item 3" to true,
                            "item 4" to true,
                            "item 5" to true,
                        ),
                )
            val template = Template.fromString(templateJson)
            val generator = PDFGenerator()

            val pdfBytes = generator.generate(template, data)

            val snapshot =
                PdfSnapshotTest(
                    expectedPdf = "checklist/checklist.pdf",
                    pdfBytes = pdfBytes,
                ).page(0)

            pageElements.forEach { (name, element) ->
                snapshot.region(
                    name,
                    PdfRegion(
                        element.x,
                        element.y,
                        element.width,
                        element.height,
                    ),
                )
            }

            return snapshot.assertPdfBySnapshot()
        }
    }
}
