package io.pdfgenerator.cli.commands

import io.pdfgenerator.cli.serve.ServeCommand
import org.junit.jupiter.api.Assertions.assertFalse
import org.junit.jupiter.api.Assertions.assertTrue
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.assertThrows
import org.junit.jupiter.api.io.TempDir
import java.io.ByteArrayInputStream
import java.io.ByteArrayOutputStream
import java.io.PrintStream
import java.nio.file.Path

class CliCommandsTest {
    @TempDir
    lateinit var tempDir: Path

    private val sampleTemplateJson =
        """
        {
          "version": "1.0",
          "metadata": { "name": "sample" },
          "pageSettings": {
            "size": "A4",
            "orientation": "portrait",
            "margins": { "top": 20, "right": 20, "bottom": 20, "left": 20 },
            "header": { "height": 30, "elements": [] },
            "footer": { "height": 30, "elements": [] }
          },
          "schema": {
            "type": "object",
            "properties": { "name": { "type": "string" } }
          },
          "page": [
            { "type": "text", "id": "t1", "x": 10, "y": 10, "value": "Hello ${'$'}{name}" }
          ]
        }
        """.trimIndent()

    private fun captureOutput(action: () -> Unit): Pair<String, String> {
        val originalOut = System.out
        val originalErr = System.err
        val outBaos = ByteArrayOutputStream()
        val errBaos = ByteArrayOutputStream()
        try {
            System.setOut(PrintStream(outBaos))
            System.setErr(PrintStream(errBaos))
            action()
        } finally {
            System.setOut(originalOut)
            System.setErr(originalErr)
        }
        return Pair(outBaos.toString(), errBaos.toString())
    }

    @Test
    fun testVersionCommand() {
        val (out, _) =
            captureOutput {
                VersionCommand().parse(emptyList())
            }
        assertTrue(out.contains("PDF Generator CLI v1.0.0"))
        assertTrue(out.contains("Documentation:"))
    }

    @Test
    fun testCacheCommands() {
        // CacheStatsCommand
        val (statsOut, _) =
            captureOutput {
                CacheStatsCommand().parse(emptyList())
            }
        assertTrue(statsOut.contains("Cache Statistics"))
        assertTrue(statsOut.contains("Templates cached:"))

        // CacheClearCommand default (clear both)
        val (clearOutAll, _) =
            captureOutput {
                CacheClearCommand().parse(emptyList())
            }
        assertTrue(clearOutAll.contains("Template cache cleared"))
        assertTrue(clearOutAll.contains("Image cache cleared"))

        // Clear only templates
        val (clearTemplatesOut, _) =
            captureOutput {
                CacheClearCommand().parse(listOf("-t"))
            }
        assertTrue(clearTemplatesOut.contains("Template cache cleared"))
        assertFalse(clearTemplatesOut.contains("Image cache cleared"))

        // Clear only images
        val (clearImagesOut, _) =
            captureOutput {
                CacheClearCommand().parse(listOf("-i"))
            }
        assertFalse(clearImagesOut.contains("Template cache cleared"))
        assertTrue(clearImagesOut.contains("Image cache cleared"))

        // Top level CacheCommand
        CacheCommand().parse(emptyList())
    }

    @Test
    fun testValidateCommandSuccessAndVerbose() {
        val tplFile = tempDir.resolve("template.json").toFile()
        tplFile.writeText(sampleTemplateJson)

        val (out, _) =
            captureOutput {
                ValidateCommand().parse(listOf(tplFile.absolutePath, "-v"))
            }
        assertTrue(out.contains("Validating template:"))
        assertTrue(out.contains("Template details:"))
        assertTrue(out.contains("Template is valid"))
    }

    @Test
    fun testValidateCommandFailure() {
        val invalidTpl = tempDir.resolve("invalid.json").toFile()
        invalidTpl.writeText("""{"version": "1.0"}""") // missing pageSettings

        val (_, err) =
            captureOutput {
                assertThrows<Exception> {
                    ValidateCommand().parse(listOf(invalidTpl.absolutePath, "-v"))
                }
            }
        assertTrue(err.contains("Template validation failed"))

        val noVersionTpl = tempDir.resolve("no_version.json").toFile()
        noVersionTpl.writeText(
            """{"pageSettings": {"size": "A4", "orientation": "portrait",""" +
                """"margins": {"top": 10, "right": 10, "bottom": 10, "left": 10}}}""",
        )
        val (_, err2) =
            captureOutput {
                assertThrows<Exception> {
                    ValidateCommand().parse(listOf(noVersionTpl.absolutePath, "-v"))
                }
            }
        assertTrue(err2.contains("Missing required field: 'version'"))
    }

    @Test
    fun testValidateCommandValidationErrors() {
        val dupIdTpl = tempDir.resolve("dup_ids.json").toFile()
        dupIdTpl.writeText(
            """
            {
              "version": "1.0",
              "pageSettings": { "size": "A4", "orientation": "portrait", "margins": { "top": 10, "right": 10, "bottom": 10, "left": 10 } },
              "page": [
                { "type": "text", "id": "dup", "x": 0, "y": 0, "value": "A" },
                { "type": "text", "id": "dup", "x": 0, "y": 10, "value": "B" }
              ]
            }
            """.trimIndent(),
        )

        val (_, err) =
            captureOutput {
                assertThrows<IllegalArgumentException> {
                    ValidateCommand().parse(listOf(dupIdTpl.absolutePath, "-v"))
                }
            }
        assertTrue(err.contains("Duplicate IDs"))
    }

    @Test
    fun testGenerateCommandWithFontAndResourceDirs() {
        val tplFile = tempDir.resolve("template.json").toFile()
        tplFile.writeText(sampleTemplateJson)
        val dummyDir = tempDir.resolve("dummy_res").toFile()
        dummyDir.mkdirs()
        val outFile = tempDir.resolve("out_res.pdf").toFile()

        val (out, _) =
            captureOutput {
                GenerateCommand().parse(
                    listOf(
                        tplFile.absolutePath,
                        "-o", outFile.absolutePath,
                        "-v",
                        "--font-dir", dummyDir.absolutePath,
                        "--resources-dir", dummyDir.absolutePath,
                        "--default-font", "Courier",
                    ),
                )
            }
        assertTrue(out.contains("Font directory:"))
        assertTrue(out.contains("Resources directory:"))
    }

    @Test
    fun testServeCommandPreloadFailure() {
        val originalIn = System.`in`
        val originalErr = System.err
        val errBaos = ByteArrayOutputStream()
        try {
            System.setIn(ByteArrayInputStream("".toByteArray()))
            System.setErr(PrintStream(errBaos))
            ServeCommand().parse(
                listOf(
                    "-v",
                    "--preload",
                    "/non/existent/path/for/preload.json",
                ),
            )
        } finally {
            System.setIn(originalIn)
            System.setErr(originalErr)
        }
        val err = errBaos.toString()
        assertTrue(err.contains("Could not preload"))
    }

    @Test
    fun testGenerateCommandBasicAndVerbose() {
        val tplFile = tempDir.resolve("template.json").toFile()
        tplFile.writeText(sampleTemplateJson)
        val dataFile = tempDir.resolve("data.json").toFile()
        dataFile.writeText("""{"name": "World"}""")
        val outFile = tempDir.resolve("out.pdf").toFile()

        val (out, _) =
            captureOutput {
                GenerateCommand().parse(
                    listOf(
                        tplFile.absolutePath,
                        "-d", dataFile.absolutePath,
                        "-o", outFile.absolutePath,
                        "-v",
                        "--clear-cache",
                        "--image-cache-size", "50",
                        "--strict",
                    ),
                )
            }
        assertTrue(outFile.exists())
        assertTrue(outFile.length() > 0)
        assertTrue(out.contains("PDF generated successfully"))
        assertTrue(out.contains("Cache stats:"))
    }

    @Test
    fun testGenerateCommandStdinData() {
        val tplFile = tempDir.resolve("template.json").toFile()
        tplFile.writeText(sampleTemplateJson)
        val outFile = tempDir.resolve("out_stdin.pdf").toFile()

        val originalIn = System.`in`
        try {
            System.setIn(ByteArrayInputStream("""{"name": "StdinUser"}""".toByteArray()))
            GenerateCommand().parse(
                listOf(
                    tplFile.absolutePath,
                    "-d",
                    "-",
                    "-o",
                    outFile.absolutePath,
                ),
            )
        } finally {
            System.setIn(originalIn)
        }
        assertTrue(outFile.exists())
        assertTrue(outFile.length() > 0)
    }

    @Test
    fun testGenerateCommandStdoutPdf() {
        val tplFile = tempDir.resolve("template.json").toFile()
        tplFile.writeText(sampleTemplateJson)

        val (out, _) =
            captureOutput {
                GenerateCommand().parse(
                    listOf(
                        tplFile.absolutePath,
                        "-o",
                        "-",
                        "--no-image-cache",
                        "--no-strict",
                    ),
                )
            }
        assertTrue(out.startsWith("%PDF-"))
    }

    @Test
    fun testGenerateCommandMissingDataFile() {
        val tplFile = tempDir.resolve("template.json").toFile()
        tplFile.writeText(sampleTemplateJson)

        val (_, err) =
            captureOutput {
                assertThrows<Exception> {
                    GenerateCommand().parse(
                        listOf(
                            tplFile.absolutePath,
                            "-d",
                            tempDir.resolve("missing.json").toFile().absolutePath,
                            "-v",
                        ),
                    )
                }
            }
        assertTrue(err.contains("Error generating PDF"))
    }

    @Test
    fun testConvertCommand() {
        val jrxmlContent = """<?xml version="1.0" encoding="UTF-8"?>
<jasperReport xmlns="http://jasperreports.sourceforge.net/jasperreports"
              xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
              xsi:schemaLocation="http://jasperreports.sourceforge.net/jasperreports http://jasperreports.sourceforge.net/xsd/jasperreport.xsd"
              name="simple_test" pageWidth="595" pageHeight="842" columnWidth="555"
              leftMargin="20" rightMargin="20" topMargin="20" bottomMargin="20">
    <title>
        <band height="50">
            <staticText>
                <reportElement x="0" y="0" width="200" height="30"/>
                <text><![CDATA[Test Title]]></text>
            </staticText>
        </band>
    </title>
</jasperReport>
"""
        val jrxmlFile = tempDir.resolve("test.jrxml").toFile()
        jrxmlFile.writeText(jrxmlContent)
        val jsonOutput = tempDir.resolve("converted.json").toFile()

        // 1. Output to file
        val (out1, _) =
            captureOutput {
                ConvertCommand().parse(
                    listOf(
                        jrxmlFile.absolutePath,
                        "--output",
                        jsonOutput.absolutePath,
                        "--items-binding",
                        "records",
                    ),
                )
            }
        assertTrue(jsonOutput.exists())
        assertTrue(out1.contains("Template converted successfully"))

        // 2. Output to stdout
        val (out2, _) =
            captureOutput {
                ConvertCommand().parse(
                    listOf(
                        jrxmlFile.absolutePath,
                        "--stdout",
                        "--fail-on-unsupported",
                        "--disable-table-inference",
                    ),
                )
            }
        assertTrue(out2.contains("\"version\""))

        // 3. Invalid extension
        val badExtFile = tempDir.resolve("test.txt").toFile()
        badExtFile.writeText("hello")
        assertThrows<IllegalArgumentException> {
            ConvertCommand().parse(listOf(badExtFile.absolutePath, "--stdout"))
        }

        // 4. Missing both output and stdout
        assertThrows<IllegalArgumentException> {
            ConvertCommand().parse(listOf(jrxmlFile.absolutePath))
        }
    }

    @Test
    fun testServeCommandOptionsAndExit() {
        val tplFile = tempDir.resolve("template.json").toFile()
        tplFile.writeText(sampleTemplateJson)

        val originalIn = System.`in`
        val originalErr = System.err
        val errBaos = ByteArrayOutputStream()
        try {
            System.setIn(ByteArrayInputStream("".toByteArray()))
            System.setErr(PrintStream(errBaos))
            ServeCommand().parse(
                listOf(
                    "-v",
                    "--preload", tplFile.absolutePath,
                    "--image-cache-size", "20",
                    "--no-image-cache",
                    "--strict",
                    "--max-request-bytes", "1024",
                ),
            )
        } finally {
            System.setIn(originalIn)
            System.setErr(originalErr)
        }
        val err = errBaos.toString()
        assertTrue(err.contains("serve: ready"))
        assertTrue(err.contains("serve: exit"))
    }
}
