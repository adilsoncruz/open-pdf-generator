package com.pdfgenerator.api

import com.pdfgenerator.model.ElementGroup
import com.pdfgenerator.model.Margins
import com.pdfgenerator.model.PageSettings
import com.pdfgenerator.model.Template
import com.pdfgenerator.model.TextElement
import org.junit.jupiter.api.Assertions.*
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.io.TempDir
import java.io.File

class ApiCoverageBoostTest {

    @TempDir
    lateinit var tempDir: File

    @Test
    fun `test Version and PDFGeneratorConfig metadata`() {
        assertEquals("Open PDF Generator", Version.NAME)
        assertEquals("1.0.0", Version.VERSION)
        assertTrue(Version.info().contains("1.0.0"))

        val validationErr = SchemaValidationError("path.to.prop", "Must not be null", "required")
        assertEquals("path.to.prop", validationErr.path)
        assertEquals("Must not be null", validationErr.message)
        assertEquals("required", validationErr.keyword)

        val schemaEx = PDFSchemaValidationException(listOf(validationErr))
        assertTrue(schemaEx.message!!.contains("path.to.prop"))
        assertTrue(schemaEx.message!!.contains("Must not be null"))

        val config = PDFGeneratorConfig(
            fontDirectory = tempDir,
            defaultFont = "Courier",
            strictMode = false,
            enableImageCache = false,
            imageCacheSize = 50,
            resourcesDirectory = tempDir,
            showMargins = true
        )
        assertTrue(config.showMargins)
        assertFalse(config.strictMode)
        assertEquals("Courier", config.defaultFont)
        assertEquals(tempDir, config.fontDirectory)
    }

    @Test
    fun `test PDFGenerator companion cache methods and static bytecode bridges`() {
        PDFGenerator.clearCache()
        assertEquals(0, PDFGenerator.cacheSize())

        // Call bytecode static bridges via Java reflection
        val clearMethod = PDFGenerator::class.java.getMethod("clearCache")
        val invMethod = PDFGenerator::class.java.getMethod("invalidateCache", String::class.java)
        val sizeMethod = PDFGenerator::class.java.getMethod("cacheSize")

        clearMethod.invoke(null)
        invMethod.invoke(null, "dummy")
        val sz = sizeMethod.invoke(null) as Int
        assertEquals(0, sz)

        val templateFile = File(tempDir, "test-template.json")
        templateFile.writeText("""
        {
          "version": "1.0",
          "pageSettings": {
            "size": "A4",
            "orientation": "portrait",
            "margins": { "top": 10, "right": 10, "bottom": 10, "left": 10 }
          },
          "pageElements": [
            { "type": "text", "id": "t1", "x": 0, "y": 0, "value": "Cached" }
          ]
        }
        """.trimIndent())

        val generator = PDFGenerator()
        val template = Template.fromString(templateFile.readText())

        // Test all overloads
        val bytes1 = generator.generateFromPath(templateFile.absolutePath, emptyMap())
        assertTrue(bytes1.isNotEmpty())
        assertEquals(1, PDFGenerator.cacheSize())

        val bytes2 = generator.generateFromPath(templateFile.absolutePath, "{}")
        assertTrue(bytes2.isNotEmpty())

        val out1 = File(tempDir, "out1.pdf")
        generator.generate(template, emptyMap(), out1)
        assertTrue(out1.exists())

        val out2 = File(tempDir, "out2.pdf")
        generator.generateFromPath(templateFile.absolutePath, emptyMap(), out2)
        assertTrue(out2.exists())

        val out3 = File(tempDir, "out3.pdf")
        generator.generateFromPath(templateFile.absolutePath, "{}", out3)
        assertTrue(out3.exists())

        val out4 = File(tempDir, "out4.pdf")
        generator.generate(templateFile.readText(), "{}", out4)
        assertTrue(out4.exists())

        PDFGenerator.clearCache()
        assertEquals(0, PDFGenerator.cacheSize())
    }

    @Test
    fun `test PDFGenerator error handling and syntax exceptions`() {
        val generator = PDFGenerator()

        // Invalid JSON template string
        assertThrows(PDFGenerationException::class.java) {
            generator.generate("invalid json", "{}")
        }

        // Invalid JSON data string
        assertThrows(PDFGenerationException::class.java) {
            val validTemplate = """
            {
              "version": "1.0",
              "pageSettings": {
                "size": "A4",
                "orientation": "portrait",
                "margins": { "top": 10, "right": 10, "bottom": 10, "left": 10 }
              },
              "pageElements": []
            }
            """.trimIndent()
            generator.generate(validTemplate, "not a valid json")
        }

        // Non-existent template path
        assertThrows(PDFGenerationException::class.java) {
            generator.generateFromPath("/non/existent/path/template.json", emptyMap())
        }

        // Malformed template file
        val badFile = File(tempDir, "bad-template.json")
        badFile.writeText("{ malformed json }")
        assertThrows(PDFGenerationException::class.java) {
            generator.generateFromPath(badFile.absolutePath, emptyMap())
        }

        // generateFromPath with invalid data JSON syntax
        val validTemplateFile = File(tempDir, "valid-temp.json")
        validTemplateFile.writeText("""
        {
          "version": "1.0",
          "pageSettings": { "size": "A4", "orientation": "portrait", "margins": { "top": 10, "right": 10, "bottom": 10, "left": 10 } },
          "pageElements": []
        }
        """.trimIndent())
        assertThrows(PDFGenerationException::class.java) {
            generator.generateFromPath(validTemplateFile.absolutePath, "invalid data json syntax {")
        }

        // generate with outputFile rethrowing PDFGenerationException
        val dummyOut = File(tempDir, "dummy.pdf")
        assertThrows(PDFGenerationException::class.java) {
            generator.generate("{ invalid json }", "{}", dummyOut)
        }

        // Template with invalid orientation throws IllegalArgumentException in getPageSize -> caught by generate Exception handler
        val badOrientationTemplate = """
        {
          "version": "1.0",
          "pageSettings": { "size": "A4", "orientation": "diagonal", "margins": { "top": 10, "right": 10, "bottom": 10, "left": 10 } },
          "pageElements": []
        }
        """.trimIndent()
        assertThrows(PDFGenerationException::class.java) {
            generator.generate(badOrientationTemplate, "{}")
        }
        assertThrows(PDFGenerationException::class.java) {
            generator.generate(badOrientationTemplate, "{}", dummyOut)
        }
        val badOrientationFile = File(tempDir, "bad-orientation.json")
        badOrientationFile.writeText(badOrientationTemplate)
        assertThrows(PDFGenerationException::class.java) {
            generator.generateFromPath(badOrientationFile.absolutePath, "{}")
        }
    }

    @Test
    fun `test PDFGenerator element group skipping and element heights`() {
        val templateJson = """
        {
          "version": "1.0",
          "pageSettings": {
            "size": "A4",
            "orientation": "portrait",
            "margins": { "top": 20, "right": 20, "bottom": 20, "left": 20 }
          },
          "groups": [
            {
              "id": "inactive-grp",
              "name": "Inactive Group",
              "elementIds": ["grp-elem"],
              "printCondition": "showGroup == true"
            }
          ],
          "pageElements": [
            {
              "type": "text",
              "id": "grp-elem",
              "x": 0,
              "y": 0,
              "value": "Should be skipped"
            },
            {
              "type": "rich_text",
              "id": "rt-elem",
              "x": 0,
              "y": 50,
              "width": 300,
              "value": "Rich text content **bold**",
              "style": { "multiline": true }
            },
            {
              "type": "link",
              "id": "lk-elem",
              "x": 0,
              "y": 100,
              "width": 200,
              "value": "Open Link with multiline flow enabled",
              "url": "https://example.com",
              "style": { "multiline": true }
            },
            {
              "type": "container",
              "id": "ct-elem",
              "x": 0,
              "y": 150,
              "width": "100%",
              "height": "auto",
              "elements": [
                { "type": "spacer", "id": "sp-1", "height": 20 },
                { "type": "pageBreak", "id": "pb-1" }
              ]
            }
          ]
        }
        """.trimIndent()

        val generator = PDFGenerator()
        val pdfBytes = generator.generate(templateJson, """{"showGroup": false}""")
        assertTrue(pdfBytes.isNotEmpty())
    }

    @Test
    fun `test PDFGenerator calculateLoopItemHeight and relative flow`() {
        val templateJson = """
        {
          "version": "1.0",
          "pageSettings": {
            "size": "A4",
            "orientation": "portrait",
            "margins": { "top": 20, "right": 20, "bottom": 20, "left": 20 }
          },
          "pageElements": [
            {
              "type": "loop",
              "id": "test-loop",
              "x": 0,
              "y": 0,
              "dataBinding": "items",
              "direction": "vertical",
              "elements": [
                {
                  "type": "rectangle",
                  "id": "lp-rect-pct",
                  "x": 0,
                  "y": 0,
                  "width": "100%",
                  "height": "100%"
                },
                {
                  "type": "line",
                  "id": "lp-line",
                  "x": 0,
                  "y": 10,
                  "width": "100%",
                  "height": 0
                },
                {
                  "type": "barcode",
                  "id": "lp-bc",
                  "x": 0,
                  "y": 20,
                  "format": "CODE_128",
                  "value": "12345",
                  "height": 25
                }
              ]
            }
          ]
        }
        """.trimIndent()

        val generator = PDFGenerator()
        val pdfBytes = generator.generate(templateJson, """{"items": [{"id": 1}]}""")
        assertTrue(pdfBytes.isNotEmpty())

        // Empty loop and ImageElement 100% inside loop
        val templateLoopExtra = """
        {
          "version": "1.0",
          "pageSettings": {
            "size": "A4",
            "orientation": "portrait",
            "margins": { "top": 20, "right": 20, "bottom": 20, "left": 20 }
          },
          "pageElements": [
            {
              "type": "loop",
              "id": "empty-loop",
              "x": 0,
              "y": 0,
              "dataBinding": "emptyItems",
              "elements": []
            },
            {
              "type": "loop",
              "id": "img-loop",
              "x": 0,
              "y": 50,
              "dataBinding": "items",
              "elements": [
                {
                  "type": "image",
                  "id": "lp-img-full",
                  "x": 0,
                  "y": 0,
                  "width": 100,
                  "height": 50,
                  "source": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=="
                },
                {
                  "type": "container",
                  "id": "lp-ct",
                  "x": 0,
                  "y": 20,
                  "width": 100,
                  "height": 40,
                  "elements": []
                }
              ]
            }
          ]
        }
        """.trimIndent()
        val bytesExtra = generator.generate(templateLoopExtra, """{"items": [{"id": 1}], "emptyItems": []}""")
        assertTrue(bytesExtra.isNotEmpty())
    }

    @Test
    fun `test PDFGenerator getElementHeight and calculateLoopItemHeight exhaustive coverage`() {
        val templateJson = """
        {
          "version": "1.0",
          "pageSettings": {
            "size": "A4",
            "orientation": "portrait",
            "margins": { "top": 20, "right": 20, "bottom": 20, "left": 20 }
          },
          "pageElements": [
            {
              "type": "text",
              "id": "rel-text",
              "positionMode": "relative",
              "x": 0,
              "y": 0,
              "value": "Relative text testing line 393"
            },
            {
              "type": "image",
              "id": "img-no-h",
              "positionMode": "relative",
              "x": 0,
              "y": 0,
              "width": 100,
              "source": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=="
            },
            {
              "type": "conditional",
              "id": "cond-empty",
              "positionMode": "relative",
              "condition": "true",
              "elements": []
            },
            {
              "type": "rich_text",
              "id": "rt-missing-text",
              "positionMode": "relative",
              "width": 200,
              "dataBinding": "nonExistentField",
              "style": { "multiline": true }
            },
            {
              "type": "link",
              "id": "lk-missing-text",
              "positionMode": "relative",
              "width": 200,
              "dataBinding": "nonExistentField",
              "url": "https://example.com",
              "style": { "multiline": true }
            },
            {
              "type": "container",
              "id": "ct-with-loops",
              "positionMode": "relative",
              "height": "auto",
              "elements": [
                {
                  "type": "loop",
                  "id": "loop-all-types",
                  "width": 400,
                  "height": 0,
                  "dataBinding": "items",
                  "direction": "vertical",
                  "elements": [
                    { "type": "link", "id": "l1", "value": "L", "url": "https://x.com", "height": 18 },
                    { "type": "rich_text", "id": "r1", "value": "R", "height": 18 },
                    { "type": "text", "id": "t1", "value": "T", "height": 18 },
                    { "type": "static_text", "id": "s1", "value": "S", "height": 18 },
                    { "type": "image", "id": "i1", "width": 50, "height": 30, "source": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==" },
                    { "type": "rectangle", "id": "rc1", "width": 50, "height": 35 },
                    { "type": "rectangle", "id": "rc2", "width": 50, "height": "100%" },
                    { "type": "line", "id": "ln1", "width": 50, "height": 5 },
                    { "type": "barcode", "id": "b1", "format": "CODE_128", "value": "99", "height": 22 },
                    { "type": "container", "id": "c1", "width": 50, "height": 40, "elements": [] }
                  ]
                },
                {
                  "type": "loop",
                  "id": "loop-empty-calc",
                  "width": 400,
                  "height": 0,
                  "dataBinding": "items",
                  "direction": "vertical",
                  "elements": []
                }
              ]
            }
          ]
        }
        """.trimIndent()

        val generator = PDFGenerator()
        val bytes = generator.generate(templateJson, """{"items": [{"id": 1}]}""")
        assertTrue(bytes.isNotEmpty())
    }

    @Test
    fun `test remaining PDFGenerator generateFromPath and error branches`() {
        val tempTemplate = File.createTempFile("temp-tpl", ".json")
        tempTemplate.deleteOnExit()
        tempTemplate.writeText("""
        {
          "version": "1.0",
          "pageSettings": {
            "size": "A4",
            "orientation": "portrait",
            "margins": { "top": 20, "right": 20, "bottom": 20, "left": 20 }
          },
          "pageElements": [{ "type": "text", "id": "t1", "value": "Hi" }]
        }
        """.trimIndent())

        val generator = PDFGenerator()

        // Test SchemaValidationError fields
        val err = SchemaValidationError("path.prop", "error message", "required")
        assertEquals("path.prop", err.path)
        assertEquals("error message", err.message)
        assertEquals("required", err.keyword)
        val copyErr = err.copy(keyword = "type")
        assertEquals("type", copyErr.keyword)

        // 1. generateFromPath with invalid data JSON syntax
        val exSyntax = assertThrows(PDFGenerationException::class.java) {
            generator.generateFromPath(tempTemplate.absolutePath, "{not-valid-json")
        }
        assertTrue(exSyntax.message?.contains("JSON data syntax error") == true)

        // 2. generateFromPath with missing template
        val exMissingTpl = assertThrows(PDFGenerationException::class.java) {
            generator.generateFromPath("/non/existent/path/template.json", "{}")
        }
        assertTrue(exMissingTpl.message?.contains("Template not found") == true)

        // 3. generate(templateJson, dataJson, outputFile) with invalid dataJson
        val outTmp = File.createTempFile("out-valid", ".pdf")
        outTmp.deleteOnExit()
        assertThrows(PDFGenerationException::class.java) {
            generator.generate("""{"version":"1.0","pageElements":[]}""", "{bad-json", outTmp)
        }

        // 4. generate(templateJson, dataJson, outputFile) writing to unwriteable destination
        val invalidDir = File("/non-existent-dir-12345/out.pdf")
        assertThrows(PDFGenerationException::class.java) {
            generator.generate("""{"version":"1.0","pageElements":[]}""", "{}", invalidDir)
        }

        // 5. generateFromPath(templatePath, data, outputFile) with valid data
        val outPathTmp = File.createTempFile("out-path", ".pdf")
        outPathTmp.deleteOnExit()
        generator.generateFromPath(tempTemplate.absolutePath, emptyMap(), outPathTmp)
        assertTrue(outPathTmp.exists() && outPathTmp.length() > 0)
    }
}
