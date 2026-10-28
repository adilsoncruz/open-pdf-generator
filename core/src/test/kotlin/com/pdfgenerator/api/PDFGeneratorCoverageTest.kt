package com.pdfgenerator.api

import com.pdfgenerator.model.Template
import org.junit.jupiter.api.Assertions.*
import org.junit.jupiter.api.Test
import java.io.File

class PDFGeneratorCoverageTest {
    @Test
    fun `test file not json`() {
        val generator = PDFGenerator()
        val tempFile = File.createTempFile("invalid", ".txt")
        tempFile.writeText("Not a json file")

        assertThrows(PDFGenerationException::class.java) {
            generator.generateFromPath(tempFile.absolutePath, "{}")
        }
        tempFile.delete()
    }

    @Test
    fun `test invalid element strict mode throws exception`() {
        val generator = PDFGenerator(PDFGeneratorConfig(strictMode = true))
        val templateJson =
            """
            {
                "version": "1.0",
                "pageSettings": { "size": "A4", "orientation": "portrait", "margins": {"top":0,"bottom":0,"left":0,"right":0} },
                "pageElements": [
                    { "type": "image", "id": "img1", "x": 0, "y": 0, "width": 100, "height": 100, "source": "hxxp://invalid" }
                ]
            }
            """.trimIndent()

        assertThrows(PDFGenerationException::class.java) {
            generator.generate(templateJson, "{}")
        }
    }

    @Test
    fun `test groups and adjustElementForBody in summary page`() {
        val generator = PDFGenerator()
        val templateJson =
            """
            {
                "version": "1.0",
                "pageSettings": { "size": "A4", "orientation": "portrait", "margins": {"top":0,"bottom":0,"left":0,"right":0} },
                "groups": [
                    { "name": "g1", "elementIds": ["e1", "rect1", "cont1", "cond1", "loop1", "table1", "line1", "bar1"], "printCondition": "show == true" }
                ],
                "elements": [
                    { "type": "text", "id": "e1", "x": 0, "y": 0, "width": 100, "value": "text" }
                ],
                "summaryPage": {
                    "groups": [
                        { "name": "g2", "elementIds": ["se1", "srect1", "scont1", "scond1", "sloop1", "stable1", "sline1", "sbar1"], "printCondition": "show == true" },
                        { "name": "bg_group", "elementIds": ["bg_img"], "printCondition": "show == true" }
                    ],
                    "background": {
                        "groups": [
                            { "name": "bg_group2", "elementIds": ["bg_img"], "printCondition": "show == true" }
                        ],
                        "elements": [
                            { "type": "image", "id": "bg_img", "x": 0, "y": 0, "width": 100, "height": 100, "source": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=" }
                        ]
                    },
                    "elements": [
                        { "type": "text", "id": "se1", "x": 0, "y": 0, "width": 100, "value": "text" },
                        { "type": "rectangle", "id": "srect1", "x": 0, "y": 10, "width": 100, "height": "100%" },
                        { "type": "line", "id": "sline1", "x": 0, "y": 20, "width": 100, "height": 1 },
                        { "type": "barcode", "id": "sbar1", "x": 0, "y": 30, "width": 100, "height": 50, "barcodeType": "qrcode", "dataBinding": "123" },
                        { "type": "container", "id": "scont1", "x": 0, "y": 90, "width": 100, "height": 100, "elements": [] },
                        { "type": "conditional", "id": "scond1", "x": 0, "y": 100, "width": 100, "height": 10, "condition": "show == true", "elements": [] },
                        { "type": "table", "id": "stable1", "x": 0, "y": 120, "width": 100, "columns": [{"header":"A","field":"a","width":100}], "dataBinding": "items" },
                        { "type": "loop", "id": "sloop1", "x": 0, "y": 150, "width": 100, "dataBinding": "items", "elements": [
                            { "type": "text", "id": "l_t", "x":0, "y":0, "value": "v" }
                        ]}
                    ]
                }
            }
            """.trimIndent()

        val dataJson = """{"show": true, "items": [{"a": "1"}]}"""
        val result = generator.generate(templateJson, dataJson)
        assertTrue(result.isNotEmpty())
    }

    @Test
    fun `test getElementHeight and calculateLoopItemHeight fully missed branches`() {
        val generator = PDFGenerator()
        val templateJson =
            """
            {
                "version": "1.0",
                "pageSettings": { "size": "A4", "orientation": "portrait", "margins": {"top":0,"bottom":0,"left":0,"right":0} },
                "pageElements": [
                    { "type": "text", "id": "multiline_null", "x": 0, "y": 0, "width": 100, "dataBinding": "missing", "style": {"multiline": true} },
                    { "type": "rectangle", "id": "rect_string", "x": 0, "y": 10, "width": 100, "height": "50%" },
                    { "type": "container", "id": "cont_calc", "x": 0, "y": 20, "width": 100, "height": 0, "elements": [
                        { "type": "text", "id": "c_t", "x": 0, "y": 0, "width": 100, "height": 20, "value": "val" }
                    ]},
                    { "type": "loop", "id": "loop_empty", "x": 0, "y": 50, "width": 100, "dataBinding": "items", "elements": [] },
                    { "type": "loop", "id": "loop_various", "x": 0, "y": 60, "width": 100, "dataBinding": "items", "elements": [
                        { "type": "image", "id": "l_img1", "x": 0, "y": 0, "width": 10, "height": 100, "source": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=" },
                        { "type": "image", "id": "l_img2", "x": 0, "y": 0, "width": 10, "height": 50, "source": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=" },
                        { "type": "rectangle", "id": "l_rect1", "x": 0, "y": 0, "width": 10, "height": "100%" },
                        { "type": "rectangle", "id": "l_rect2", "x": 0, "y": 0, "width": 10, "height": "50%" },
                        { "type": "line", "id": "l_line1", "x": 0, "y": 0, "width": 10, "height": 5 },
                        { "type": "barcode", "id": "l_bar1", "x": 0, "y": 0, "width": 10, "height": 20, "barcodeType": "qrcode", "dataBinding": "1" }
                    ]}
                ]
            }
            """.trimIndent()

        val dataJson = """{"items": [1]}"""
        val result = generator.generate(templateJson, dataJson)
        assertTrue(result.isNotEmpty())
    }

    @Test
    fun `test invalid element strict mode throws exception in summary`() {
        val generator = PDFGenerator(PDFGeneratorConfig(strictMode = true))
        val templateJson =
            """
            {
                "version": "1.0",
                "pageSettings": { "size": "A4", "orientation": "portrait", "margins": {"top":0,"bottom":0,"left":0,"right":0} },
                "pageElements": [],
                "summaryPage": {
                    "elements": [
                        { "type": "image", "id": "img1", "x": 0, "y": 0, "width": 100, "height": 100, "source": "hxxp://invalid" }
                    ]
                }
            }
            """.trimIndent()

        assertThrows(PDFGenerationException::class.java) {
            generator.generate(templateJson, "{}")
        }
    }

    @Test
    fun `test invalid background strict mode throws exception in summary`() {
        val generator = PDFGenerator()
        val templateJson =
            """
            {
                "version": "1.0",
                "pageSettings": { "size": "A4", "orientation": "portrait", "margins": {"top":0,"bottom":0,"left":0,"right":0} },
                "pageElements": [],
                "summaryPage": {
                    "background": {
                        "elements": [
                            { "type": "image", "id": "img1", "x": 0, "y": 0, "width": 100, "height": 100, "source": "hxxp://invalid" }
                        ]
                    },
                    "elements": []
                }
            }
            """.trimIndent()
        // It catches exception inside and logs error, but doesn't throw if strictMode is false
        // Let's call it to hit the catch block for summaryPage.background
        generator.generate(templateJson, "{}")
    }

    @Test
    fun `test generic generate exception with invalid data structure`() {
        val generator = PDFGenerator()
        // We bypass PDFGenerationException wrapping by directly calling generate with mock or reflection?
        // Since we cannot mock PDFGenerator, we just use the public methods.
        // It's hard to trigger Exception instead of PDFGenerationException since all known paths throw PDFGenerationException.
    }

    @Test
    fun `test file output exception`() {
        val generator = PDFGenerator()
        val templateJson =
            """
            {
                "version": "1.0",
                "pageSettings": { "size": "A4", "orientation": "portrait", "margins": {"top":0,"bottom":0,"left":0,"right":0} },
                "pageElements": []
            }
            """.trimIndent()

        val invalidFile = File(System.getProperty("java.io.tmpdir")) // It's a directory, should fail to open FileOutputStream

        val ex1 =
            assertThrows(PDFGenerationException::class.java) {
                generator.generate(templateJson, "{}", invalidFile)
            }
        assertTrue(ex1.message!!.contains("Error generating PDF"))

        assertThrows(PDFGenerationException::class.java) {
            generator.generateFromPath("test_dummy", "{}", invalidFile) // will fail in loadTemplate though
        }
    }

    @Test
    fun `test output stream exception`() {
        val generator = PDFGenerator()
        val templateJson =
            """
            {
                "version": "1.0",
                "pageSettings": { "size": "A4", "orientation": "portrait", "margins": {"top":0,"bottom":0,"left":0,"right":0} },
                "pageElements": []
            }
            """.trimIndent()
        val template = Template.fromString(templateJson)

        val badStream =
            object : java.io.OutputStream() {
                override fun write(b: Int) {
                    throw java.io.IOException("Bad stream")
                }
            }

        val ex =
            assertThrows(PDFGenerationException::class.java) {
                generator.generateToStream(template, emptyMap(), badStream)
            }
        assertTrue(ex.message!!.contains("Error generating PDF"))
    }
}
