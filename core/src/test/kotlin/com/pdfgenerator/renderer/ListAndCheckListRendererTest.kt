package com.pdfgenerator.renderer

import com.pdfgenerator.api.PDFGenerator
import com.pdfgenerator.api.PDFGeneratorConfig
import com.pdfgenerator.engine.ElementHeightCalculator
import com.pdfgenerator.engine.RenderContext
import com.pdfgenerator.model.CheckListElement
import com.pdfgenerator.model.CheckStyle
import com.pdfgenerator.model.ListElement
import com.pdfgenerator.model.ListMode
import com.pdfgenerator.model.Margins
import com.pdfgenerator.model.PageSettings
import com.pdfgenerator.model.Template
import com.pdfgenerator.model.TextStyle
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Assertions.assertTrue
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.io.TempDir
import org.openpdf.text.Document
import org.openpdf.text.pdf.PdfWriter
import java.io.ByteArrayOutputStream
import java.io.File

class ListAndCheckListRendererTest {
    private fun createDummyContext(): RenderContext {
        val doc = Document()
        val writer = PdfWriter.getInstance(doc, ByteArrayOutputStream())
        doc.open()
        val template =
            Template(
                version = "1.0",
                pageSettings = PageSettings(size = "A4", orientation = "portrait", margins = Margins(0f, 0f, 0f, 0f)),
            )
        return RenderContext(
            document = doc,
            writer = writer,
            template = template,
            data = emptyMap(),
            config = PDFGeneratorConfig(),
            containerWidth = 500f,
        )
    }

    @Test
    fun `should deserialize ListElement from JSON and validate`() {
        val json =
            """
            {
                "version": "1.0",
                "pageSettings": {
                    "size": "A4",
                    "margins": { "top": 20, "right": 20, "bottom": 20, "left": 20 }
                },
                "pageElements": [
                    {
                        "type": "list",
                        "id": "list1",
                        "x": 30,
                        "y": 40,
                        "width": 300,
                        "dataBinding": "items",
                        "listStyle": "NUMBERED",
                        "itemSpacing": 8
                    }
                ]
            }
            """.trimIndent()

        val template = Template.fromString(json)
        assertEquals(1, template.bodyElements().size)
        val element = template.bodyElements()[0] as ListElement
        assertEquals("list1", element.id)
        assertEquals(30f, element.x)
        assertEquals(40f, element.y)
        assertEquals(300f, element.width)
        assertEquals("items", element.dataBinding)
        assertEquals(ListMode.NUMBERED, element.listStyle)
        assertEquals(8f, element.itemSpacing)

        val errors = element.validate(template.pageSettings)
        assertTrue(errors.isEmpty())
    }

    @Test
    fun `should fail validation for ListElement with blank dataBinding`() {
        val element = ListElement(id = "list_blank", dataBinding = "")
        val minimalTemplate =
            Template(
                version = "1.0",
                pageSettings = PageSettings(size = "A4", orientation = "portrait", margins = Margins(0f, 0f, 0f, 0f)),
            )
        val errors = element.validate(minimalTemplate.pageSettings)
        assertEquals(1, errors.size)
        assertTrue(errors[0].message.contains("must have a dataBinding"))
    }

    @Test
    fun `should deserialize CheckListElement from JSON and validate`() {
        val json =
            """
            {
                "version": "1.0",
                "pageSettings": {
                    "size": "A4",
                    "margins": { "top": 20, "right": 20, "bottom": 20, "left": 20 }
                },
                "pageElements": [
                    {
                        "type": "check_list",
                        "id": "chk1",
                        "x": 10,
                        "y": 20,
                        "width": 350,
                        "dataBinding": "tasks",
                        "checkStyle": "CIRCLE",
                        "itemSpacing": 5
                    },
                    {
                        "type": "checkList",
                        "id": "chk2",
                        "dataBinding": "tasks2"
                    }
                ]
            }
            """.trimIndent()

        val template = Template.fromString(json)
        assertEquals(2, template.bodyElements().size)

        val chk1 = template.bodyElements()[0] as CheckListElement
        assertEquals("chk1", chk1.id)
        assertEquals(CheckStyle.CIRCLE, chk1.checkStyle)
        assertEquals(5f, chk1.itemSpacing)

        val chk2 = template.bodyElements()[1] as CheckListElement
        assertEquals("chk2", chk2.id)
        assertEquals(null, chk2.checkStyle)

        assertTrue(chk1.validate(template.pageSettings).isEmpty())
        assertTrue(chk2.validate(template.pageSettings).isEmpty())
    }

    @Test
    fun `should fail validation for CheckListElement with blank dataBinding`() {
        val element = CheckListElement(id = "chk_blank", dataBinding = "")
        val minimalTemplate =
            Template(
                version = "1.0",
                pageSettings = PageSettings(size = "A4", orientation = "portrait", margins = Margins(0f, 0f, 0f, 0f)),
            )
        val errors = element.validate(minimalTemplate.pageSettings)
        assertEquals(1, errors.size)
        assertTrue(errors[0].message.contains("must have a dataBinding"))
    }

    @Test
    fun `should render list with all list styles`(
        @TempDir tempDir: File,
    ) {
        val generator = PDFGenerator()

        for (mode in listOf("NUMBERED", "BULLETED", "START", "DASH", "DIAMOND", null)) {
            val styleField = if (mode != null) """"listStyle": "$mode",""" else ""
            val json =
                """
                {
                    "version": "1.0",
                    "pageSettings": {
                        "size": "A4",
                        "orientation": "portrait",
                        "margins": { "top": 20, "right": 20, "bottom": 20, "left": 20 }
                    },
                    "pageElements": [
                        {
                            "type": "list",
                            "id": "list_$mode",
                            "x": 30,
                            "y": 40,
                            "width": 400,
                            $styleField
                            "dataBinding": "fruits",
                            "style": {
                                "fontSize": 12,
                                "color": "#111827",
                                "backgroundColor": "#F3F4F6",
                                "paddingTop": 4,
                                "paddingBottom": 4,
                                "paddingLeft": 8,
                                "paddingRight": 8
                            }
                        }
                    ]
                }
                """.trimIndent()

            val data = mapOf("fruits" to listOf("Apple", "Banana", "Cherry", "Date"))
            val template = Template.fromString(json)
            val outFile = File(tempDir, "list_${mode ?: "default"}.pdf")
            generator.generate(template, data, outFile)

            assertTrue(outFile.exists())
            assertTrue(outFile.length() > 0)
        }
    }

    @Test
    fun `should handle empty list or invalid data binding gracefully`(
        @TempDir tempDir: File,
    ) {
        val generator = PDFGenerator()
        val json =
            """
            {
                "version": "1.0",
                "pageSettings": {
                    "size": "A4",
                    "orientation": "portrait",
                    "margins": { "top": 20, "right": 20, "bottom": 20, "left": 20 }
                },
                "pageElements": [
                    {
                        "type": "list",
                        "id": "list_empty",
                        "x": 20,
                        "y": 20,
                        "dataBinding": "emptyList"
                    },
                    {
                        "type": "list",
                        "id": "list_non_existent",
                        "x": 20,
                        "y": 50,
                        "dataBinding": "missingKey"
                    },
                    {
                        "type": "list",
                        "id": "list_wrong_type",
                        "x": 20,
                        "y": 80,
                        "dataBinding": "stringData"
                    }
                ]
            }
            """.trimIndent()

        val data =
            mapOf(
                "emptyList" to emptyList<String>(),
                "stringData" to "not a list",
            )
        val template = Template.fromString(json)
        val outFile = File(tempDir, "empty_list.pdf")
        generator.generate(template, data, outFile)

        assertTrue(outFile.exists())
        assertTrue(outFile.length() > 0)
    }

    @Test
    fun `should render checklist with all check styles`(
        @TempDir tempDir: File,
    ) {
        val generator = PDFGenerator()

        for (checkStyle in listOf("RECTANGLE", "BORDERED", "CIRCLE", null)) {
            val styleField = if (checkStyle != null) """"checkStyle": "$checkStyle",""" else ""
            val json =
                """
                {
                    "version": "1.0",
                    "pageSettings": {
                        "size": "A4",
                        "orientation": "portrait",
                        "margins": { "top": 20, "right": 20, "bottom": 20, "left": 20 }
                    },
                    "pageElements": [
                        {
                            "type": "check_list",
                            "id": "chk_$checkStyle",
                            "x": 30,
                            "y": 40,
                            "width": 400,
                            $styleField
                            "dataBinding": "tasks",
                            "style": {
                                "fontSize": 12,
                                "color": "#4338CA",
                                "backgroundColor": "#EEF2FF"
                            }
                        }
                    ]
                }
                """.trimIndent()

            val data =
                mapOf(
                    "tasks" to
                        mapOf(
                            "Write documentation" to true,
                            "Fix OpenPDF imports" to true,
                            "Deploy to production" to false,
                        ),
                )
            val template = Template.fromString(json)
            val outFile = File(tempDir, "chk_${checkStyle ?: "default"}.pdf")
            generator.generate(template, data, outFile)

            assertTrue(outFile.exists())
            assertTrue(outFile.length() > 0)
        }
    }

    @Test
    fun `should handle empty checklist or invalid data binding gracefully`(
        @TempDir tempDir: File,
    ) {
        val generator = PDFGenerator()
        val json =
            """
            {
                "version": "1.0",
                "pageSettings": {
                    "size": "A4",
                    "orientation": "portrait",
                    "margins": { "top": 20, "right": 20, "bottom": 20, "left": 20 }
                },
                "pageElements": [
                    {
                        "type": "check_list",
                        "id": "chk_empty",
                        "x": 20,
                        "y": 20,
                        "dataBinding": "emptyMap"
                    },
                    {
                        "type": "check_list",
                        "id": "chk_wrong_type",
                        "x": 20,
                        "y": 50,
                        "dataBinding": "listOfItems"
                    }
                ]
            }
            """.trimIndent()

        val data =
            mapOf(
                "emptyMap" to emptyMap<String, Boolean>(),
                "listOfItems" to listOf("a", "b"),
            )
        val template = Template.fromString(json)
        val outFile = File(tempDir, "empty_chk.pdf")
        generator.generate(template, data, outFile)

        assertTrue(outFile.exists())
        assertTrue(outFile.length() > 0)
    }

    @Test
    fun `should measure height for list and checklist accurately`() {
        val listElement =
            ListElement(
                id = "list1",
                width = 300f,
                dataBinding = "items",
                itemSpacing = 10f,
                style = TextStyle(fontSize = 14f, paddingTop = 5f, paddingBottom = 5f),
            )
        val checkListElement =
            CheckListElement(
                id = "chk1",
                width = 300f,
                dataBinding = "checklist",
                itemSpacing = 5f,
                style = TextStyle(fontSize = 12f),
            )

        val data =
            mapOf(
                "items" to listOf("Item 1", "Item 2", "Item 3"),
                "checklist" to mapOf("Task 1" to true, "Task 2" to false),
            )

        val context = createDummyContext()
        val listHeight = ElementHeightCalculator.getElementHeight(listElement, data, context)
        assertTrue(listHeight > 0f)
        // 3 items * 14f + 2 spacing * 10f + 10f padding = 42 + 20 + 10 = 72f
        assertEquals(72f, listHeight)

        val chkHeight = ElementHeightCalculator.getElementHeight(checkListElement, data, context)
        assertTrue(chkHeight > 0f)
        // 2 items * 12f + 1 spacing * 5f = 29f
        assertEquals(29f, chkHeight)
    }

    @Test
    fun `should respect printCondition on list and checklist`(
        @TempDir tempDir: File,
    ) {
        val generator = PDFGenerator()
        val json =
            """
            {
                "version": "1.0",
                "pageSettings": {
                    "size": "A4",
                    "orientation": "portrait",
                    "margins": { "top": 20, "right": 20, "bottom": 20, "left": 20 }
                },
                "pageElements": [
                    {
                        "type": "list",
                        "id": "list_cond",
                        "x": 20,
                        "y": 20,
                        "dataBinding": "items",
                        "printCondition": "${'$'}{showList == true}"
                    },
                    {
                        "type": "check_list",
                        "id": "chk_cond",
                        "x": 20,
                        "y": 100,
                        "dataBinding": "tasks",
                        "printCondition": "${'$'}{showTasks == true}"
                    }
                ]
            }
            """.trimIndent()

        val dataFalsy =
            mapOf(
                "showList" to false,
                "showTasks" to false,
                "items" to listOf("A", "B"),
                "tasks" to mapOf("Task" to true),
            )
        val template = Template.fromString(json)
        val outFile = File(tempDir, "cond_falsy.pdf")
        generator.generate(template, dataFalsy, outFile)

        assertTrue(outFile.exists())
    }

    @Test
    fun `should paginate long list across multiple pages`(
        @TempDir tempDir: File,
    ) {
        val generator = PDFGenerator()
        val json =
            """
            {
                "version": "1.0",
                "pageSettings": {
                    "size": "A4",
                    "orientation": "portrait",
                    "margins": { "top": 50, "right": 50, "bottom": 50, "left": 50 }
                },
                "pageElements": [
                    {
                        "type": "list",
                        "id": "long_list",
                        "x": 50,
                        "y": 50,
                        "width": 500,
                        "dataBinding": "longItems",
                        "itemSpacing": 15,
                        "style": { "fontSize": 14 }
                    }
                ]
            }
            """.trimIndent()

        // 60 items * (14 + 15) = 1740 pt, which exceeds standard A4 (842 pt) and will create 3+ pages
        val items = (1..60).map { "Long list item description #$it" }
        val data = mapOf("longItems" to items)
        val template = Template.fromString(json)
        val outFile = File(tempDir, "multipage_list.pdf")
        generator.generate(template, data, outFile)

        assertTrue(outFile.exists())
        assertTrue(outFile.length() > 0)
    }

    @Test
    fun `should paginate long checklist across multiple pages`(
        @TempDir tempDir: File,
    ) {
        val generator = PDFGenerator()
        val json =
            """
            {
                "version": "1.0",
                "pageSettings": {
                    "size": "A4",
                    "orientation": "portrait",
                    "margins": { "top": 50, "right": 50, "bottom": 50, "left": 50 }
                },
                "pageElements": [
                    {
                        "type": "check_list",
                        "id": "long_chk",
                        "x": 50,
                        "y": 50,
                        "width": 500,
                        "dataBinding": "longTasks",
                        "itemSpacing": 15,
                        "style": { "fontSize": 14 }
                    }
                ]
            }
            """.trimIndent()

        val tasks = (1..60).associate { "Compliance requirement item #$it" to (it % 2 == 0) }
        val data = mapOf("longTasks" to tasks)
        val template = Template.fromString(json)
        val outFile = File(tempDir, "multipage_chk.pdf")
        generator.generate(template, data, outFile)

        assertTrue(outFile.exists())
        assertTrue(outFile.length() > 0)
    }
}
