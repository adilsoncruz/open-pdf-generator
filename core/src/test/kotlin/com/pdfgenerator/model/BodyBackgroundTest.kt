package com.pdfgenerator.model

import org.junit.jupiter.api.Nested
import org.junit.jupiter.api.Test
import kotlin.test.assertEquals
import kotlin.test.assertNull
import kotlin.test.assertTrue

class BodyBackgroundTest {
    @Nested
    inner class Construction {
        @Test
        fun `should create empty body background`() {
            val background = BodyBackground()

            assertTrue(background.elements.isEmpty())
            assertNull(background.groups)
            assertNull(background.printCondition)
        }

        @Test
        fun `should create body background with elements`() {
            val elements =
                listOf(
                    RectangleElement(
                        id = "bg",
                        x = 0f,
                        y = 0f,
                        width = 100,
                        height = 100,
                        style = RectangleStyle(fillColor = "#F0F0F0"),
                    ),
                    ImageElement(
                        id = "watermark",
                        x = 100f,
                        y = 200f,
                        width = 200f,
                        height = 200f,
                        source = "watermark.png",
                    ),
                )

            val background = BodyBackground(elements = elements)

            assertEquals(2, background.elements.size)
            assertEquals("rectangle", background.elements[0].type)
            assertEquals("image", background.elements[1].type)
        }

        @Test
        fun `should create body background with groups`() {
            val groups =
                listOf(
                    ElementGroup(id = "bgGroup", elementIds = listOf("bg", "watermark")),
                )

            val background =
                BodyBackground(
                    elements = emptyList(),
                    groups = groups,
                )

            assertEquals(1, background.groups?.size)
            assertEquals("bgGroup", background.groups?.first()?.id)
        }

        @Test
        fun `should create body background with print condition`() {
            val background =
                BodyBackground(
                    printCondition = "showBackground == true",
                )

            assertEquals("showBackground == true", background.printCondition)
        }

        @Test
        fun `should create body background with all properties`() {
            val background =
                BodyBackground(
                    elements =
                        listOf(
                            RectangleElement(id = "bg", x = 0f, y = 0f, width = "100%", height = "100%"),
                        ),
                    groups =
                        listOf(
                            ElementGroup(id = "bgElements", elementIds = listOf("bg")),
                        ),
                    printCondition = "isPremium == true",
                )

            assertEquals(1, background.elements.size)
            assertEquals(1, background.groups?.size)
            assertEquals("isPremium == true", background.printCondition)
        }
    }

    @Nested
    inner class DataClassBehavior {
        @Test
        fun `should support equals and hashCode`() {
            val bg1 = BodyBackground()
            val bg2 = BodyBackground()
            val bg3 = BodyBackground(printCondition = "condition")

            assertEquals(bg1, bg2)
            assertEquals(bg1.hashCode(), bg2.hashCode())
            assertTrue(bg1 != bg3)
        }

        @Test
        fun `should support copy`() {
            val original = BodyBackground(printCondition = "always")
            val copy = original.copy(printCondition = "never")

            assertEquals("never", copy.printCondition)
        }
    }
}
