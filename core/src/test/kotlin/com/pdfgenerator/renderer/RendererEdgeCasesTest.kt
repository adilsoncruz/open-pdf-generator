package com.pdfgenerator.renderer

import com.pdfgenerator.api.PDFGenerator
import com.pdfgenerator.model.Template
import org.junit.jupiter.api.Nested
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.io.TempDir
import java.io.File
import kotlin.test.assertTrue

class RendererEdgeCasesTest {
    @Nested
    inner class ImageRendererEdgeCases {
        @Test
        fun `should render image with different fits`(
            @TempDir tempDir: File,
        ) {
            val base64Image = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII="

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
                      "type": "image", "id": "img_cover", "x": 50, "y": 50, "width": 100, "height": 100,
                      "source": "data:image/png;base64,${'$'}base64Image", "fit": "cover", "alignment": "center"
                    },
                    {
                      "type": "image", "id": "img_fill", "x": 50, "y": 200, "width": 100, "height": 100,
                      "source": "data:image/png;base64,${'$'}base64Image", "fit": "fill", "alignment": "top-left"
                    },
                    {
                      "type": "image", "id": "img_none", "x": 50, "y": 350, "width": 100, "height": 100,
                      "source": "data:image/png;base64,${'$'}base64Image", "fit": "none", "alignment": "bottom-right"
                    }
                  ]
                }
                """.trimIndent()

            val template = Template.fromString(templateJson.replace("${'$'}base64Image", base64Image))
            val generator = PDFGenerator()
            val outputFile = File(tempDir, "image-edge.pdf")
            generator.generate(template, emptyMap(), outputFile)

            assertTrue(outputFile.exists())
            assertTrue(outputFile.length() > 0)
        }
    }

    @Nested
    inner class ContainerRendererEdgeCases {
        @Test
        fun `should render container with padding and borders`(
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
                      "type": "container",
                      "id": "container_border",
                      "x": 50,
                      "y": 50,
                      "width": 200,
                      "height": 200,
                      "style": {
                        "backgroundColor": "#FFFFFF",
                        "borderColor": "#000000",
                        "borderWidth": 2,
                        "cornerRadius": 10,
                        "paddingTop": 10,
                        "paddingRight": 10,
                        "paddingBottom": 10,
                        "paddingLeft": 10
                      },
                      "elements": [
                        {
                          "type": "text",
                          "id": "t1",
                          "x": 0,
                          "y": 0,
                          "value": "Inside container with padding"
                        }
                      ]
                    }
                  ]
                }
                """.trimIndent()

            val template = Template.fromString(templateJson)
            val generator = PDFGenerator()
            val outputFile = File(tempDir, "container-edge.pdf")
            generator.generate(template, emptyMap(), outputFile)

            assertTrue(outputFile.exists())
            assertTrue(outputFile.length() > 0)
        }
    }

    @Nested
    inner class LoopRendererEdgeCases {
        @Test
        fun `should handle empty or null loop data`(
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
                      "type": "loop",
                      "id": "loop1",
                      "x": 50,
                      "y": 50,
                      "width": 200,
                      "height": 50,
                      "dataBinding": "items",
                      "elements": [
                        {"type": "text", "id": "t1", "x": 0, "y": 0, "dataBinding": "name"}
                      ]
                    }
                  ]
                }
                """.trimIndent()

            val template = Template.fromString(templateJson)
            val generator = PDFGenerator()
            val outputFile = File(tempDir, "loop-edge.pdf")

            // Empty map means 'items' is null
            generator.generate(template, emptyMap(), outputFile)

            assertTrue(outputFile.exists())
            assertTrue(outputFile.length() > 0)
        }

        @Test
        fun `should render loop with pagination`(
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
                      "type": "loop",
                      "id": "loop1",
                      "x": 50,
                      "y": 700,
                      "width": 400,
                      "dataBinding": "items",
                      "itemSpacing": 100,
                      "elements": [
                        {"type": "text", "id": "t1", "x": 0, "y": 0, "dataBinding": "name"}
                      ]
                    }
                  ]
                }
                """.trimIndent()

            val template = Template.fromString(templateJson)
            val generator = PDFGenerator()
            val outputFile = File(tempDir, "loop-pagination.pdf")

            val items = (1..20).map { mapOf("name" to "Item ${'$'}it") }
            generator.generate(template, mapOf("items" to items), outputFile)

            assertTrue(outputFile.exists())
            assertTrue(outputFile.length() > 0)
        }
    }
}
