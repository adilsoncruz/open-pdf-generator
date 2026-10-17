package com.pdfgenerator.renderer

import com.pdfgenerator.api.PDFGenerator
import com.pdfgenerator.model.Template
import org.junit.jupiter.api.Nested
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.io.TempDir
import java.io.File
import kotlin.test.assertTrue

class MissingRenderersTest {

    @Nested
    inner class StaticTextRendererTest {
        @Test
        fun `should render static_text`(
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
                      "type": "static_text",
                      "id": "stext1",
                      "x": 50,
                      "y": 50,
                      "value": "Static Text Content"
                    },
                    {
                      "type": "static_text",
                      "id": "stext2",
                      "x": 50,
                      "y": 100,
                      "width": 100,
                      "height": 50,
                      "value": "Static Text Multiline Content\nLine 2",
                      "style": {"multiline": true, "backgroundColor": "#FF0000", "alignment": "center"}
                    }
                  ]
                }
                """.trimIndent()

            val template = Template.fromString(templateJson)
            val generator = PDFGenerator()
            val outputFile = File(tempDir, "static-text.pdf")
            generator.generate(template, emptyMap(), outputFile)

            assertTrue(outputFile.exists())
            assertTrue(outputFile.length() > 0)
        }
    }

    @Nested
    inner class ImageRendererTest {
        @Test
        fun `should render image`(
            @TempDir tempDir: File,
        ) {
            // Need a valid 1px base64 image or similar to prevent PDF generation error
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
                      "type": "image",
                      "id": "img1",
                      "x": 50,
                      "y": 50,
                      "width": 100,
                      "height": 100,
                      "source": "data:image/png;base64,${'$'}base64Image",
                      "fit": "contain"
                    }
                  ]
                }
                """.trimIndent()

            val template = Template.fromString(templateJson.replace("${'$'}base64Image", base64Image))
            val generator = PDFGenerator()
            val outputFile = File(tempDir, "image.pdf")
            generator.generate(template, emptyMap(), outputFile)

            assertTrue(outputFile.exists())
            assertTrue(outputFile.length() > 0)
        }
    }

    @Nested
    inner class ContainerRendererTest {
        @Test
        fun `should render container with nested elements`(
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
                      "id": "container1",
                      "x": 50,
                      "y": 50,
                      "width": 200,
                      "height": 200,
                      "style": {"backgroundColor": "#DDDDDD"},
                      "elements": [
                        {
                          "type": "text",
                          "id": "t1",
                          "x": 10,
                          "y": 10,
                          "value": "Inside container"
                        }
                      ]
                    }
                  ]
                }
                """.trimIndent()

            val template = Template.fromString(templateJson)
            val generator = PDFGenerator()
            val outputFile = File(tempDir, "container.pdf")
            generator.generate(template, emptyMap(), outputFile)

            assertTrue(outputFile.exists())
            assertTrue(outputFile.length() > 0)
        }
    }
}
