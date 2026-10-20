package com.pdfgenerator.model

import org.junit.jupiter.api.Nested
import org.junit.jupiter.api.Test
import kotlin.test.assertEquals
import kotlin.test.assertFalse
import kotlin.test.assertNotNull
import kotlin.test.assertNull
import kotlin.test.assertTrue

class WatermarkConfigTest {
    @Nested
    inner class Construction {
        @Test
        fun `should create default text watermark config`() {
            val config = WatermarkConfig(text = "DRAFT")

            assertEquals(WatermarkType.TEXT, config.type)
            assertEquals("DRAFT", config.text)
            assertNull(config.dataBinding)
            assertNull(config.imageSource)
            assertEquals("Helvetica", config.fontName)
            assertEquals(60f, config.fontSize)
            assertEquals("bold", config.fontStyle)
            assertEquals("#CCCCCC", config.color)
            assertEquals(0.2f, config.opacity)
            assertEquals(45f, config.rotation)
            assertFalse(config.onTop)
            assertNull(config.printCondition)
        }

        @Test
        fun `should create image watermark config`() {
            val config =
                WatermarkConfig(
                    type = WatermarkType.IMAGE,
                    imageSource = "logo.png",
                    width = 200f,
                    height = 100f,
                    opacity = 0.15f,
                    rotation = 0f,
                    onTop = true,
                    printCondition = "hasWatermark == true",
                )

            assertEquals(WatermarkType.IMAGE, config.type)
            assertEquals("logo.png", config.imageSource)
            assertEquals(200f, config.width)
            assertEquals(100f, config.height)
            assertEquals(0.15f, config.opacity)
            assertEquals(0f, config.rotation)
            assertTrue(config.onTop)
            assertEquals("hasWatermark == true", config.printCondition)
        }
    }

    @Nested
    inner class Deserialization {
        @Test
        fun `should deserialize template with text watermark`() {
            val json =
                """
                {
                  "version": "1.0",
                  "pageSettings": {
                    "size": "A4",
                    "orientation": "portrait",
                    "margins": { "top": 20, "right": 20, "bottom": 20, "left": 20 },
                    "watermark": {
                      "type": "text",
                      "text": "CONFIDENCIAL",
                      "fontSize": 72,
                      "color": "#FF0000",
                      "opacity": 0.3,
                      "rotation": 30,
                      "fontName": "Courier",
                      "fontStyle": "italic"
                    }
                  },
                  "page": []
                }
                """.trimIndent()

            val template = Template.fromString(json)
            val watermark = template.pageSettings.watermark

            assertNotNull(watermark)
            assertEquals(WatermarkType.TEXT, watermark.type)
            assertEquals("CONFIDENCIAL", watermark.text)
            assertEquals(72f, watermark.fontSize)
            assertEquals("#FF0000", watermark.color)
            assertEquals(0.3f, watermark.opacity)
            assertEquals(30f, watermark.rotation)
            assertEquals("Courier", watermark.fontName)
            assertEquals("italic", watermark.fontStyle)
        }

        @Test
        fun `should deserialize template with image watermark`() {
            val json =
                """
                {
                  "version": "1.0",
                  "pageSettings": {
                    "size": "A4",
                    "orientation": "portrait",
                    "margins": { "top": 20, "right": 20, "bottom": 20, "left": 20 },
                    "watermark": {
                      "type": "image",
                      "imageSource": "assets/watermark.png",
                      "width": 300,
                      "height": 150,
                      "opacity": 0.1,
                      "onTop": true,
                      "printCondition": "isDraft == true"
                    }
                  },
                  "page": []
                }
                """.trimIndent()

            val template = Template.fromString(json)
            val watermark = template.pageSettings.watermark

            assertNotNull(watermark)
            assertEquals(WatermarkType.IMAGE, watermark.type)
            assertEquals("assets/watermark.png", watermark.imageSource)
            assertEquals(300f, watermark.width)
            assertEquals(150f, watermark.height)
            assertEquals(0.1f, watermark.opacity)
            assertTrue(watermark.onTop)
            assertEquals("isDraft == true", watermark.printCondition)
        }
    }
}
