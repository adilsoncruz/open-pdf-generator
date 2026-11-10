package io.pdfgenerator.cli.serve

import com.google.gson.JsonObject
import com.google.gson.JsonParser
import com.pdfgenerator.api.PDFGenerator
import com.pdfgenerator.api.PDFGeneratorConfig
import java.io.ByteArrayOutputStream
import java.nio.charset.StandardCharsets
import java.nio.file.Files
import java.nio.file.Path
import kotlin.test.Test
import kotlin.test.assertContains
import kotlin.test.assertEquals
import kotlin.test.assertFalse
import kotlin.test.assertTrue

class PdfRequestServerTest {
    private val template =
        """
        {
          "version": "1.0",
          "metadata": { "name": "serve-test" },
          "pageSettings": {
            "size": "A4",
            "orientation": "portrait",
            "margins": { "top": 36, "right": 36, "bottom": 36, "left": 36 }
          },
          "page": [
            { "type": "text", "id": "t1", "x": 0, "y": 0, "value": "hello", "style": { "fontSize": 12 } }
          ]
        }
        """.trimIndent()

    private fun server() = PdfRequestServer(generator = PDFGenerator(PDFGeneratorConfig()))

    private fun serve(
        server: PdfRequestServer,
        vararg lines: String,
    ): List<JsonObject> {
        val input = lines.joinToString("\n").plus("\n").byteInputStream(StandardCharsets.UTF_8)
        val output = ByteArrayOutputStream()
        server.serve(input, output)
        return output
            .toString(StandardCharsets.UTF_8)
            .lines()
            .filter { it.isNotBlank() }
            .map { JsonParser.parseString(it).asJsonObject }
    }

    private fun writeTemplate(
        dir: Path,
        body: String = template,
    ): Path = Files.writeString(dir.resolve("tpl.json"), body)

    @Test
    fun `generates a pdf and echoes the request id`() {
        val dir = Files.createTempDirectory("serve-ok")
        val path = writeTemplate(dir)

        val response =
            serve(
                server(),
                """{"id":7,"template":"$path","data":{"name":"Ada"}}""",
            ).single()

        assertTrue(response["ok"].asBoolean)
        assertEquals(7, response["id"].asInt)
        assertTrue(response["bytes"].asInt > 0)
        val pdf = String(java.util.Base64.getDecoder().decode(response["pdf"].asString), StandardCharsets.ISO_8859_1)
        assertTrue(pdf.startsWith("%PDF-"))
    }

    @Test
    fun `keeps serving after invalid requests`() {
        val dir = Files.createTempDirectory("serve-isolation")
        val path = writeTemplate(dir)

        val responses =
            serve(
                server(),
                "not json",
                """{"id":2,"template":"$path","data":[]}""",
                """{"id":3,"template":"/does/not/exist.json","data":{}}""",
                """{"id":4,"template":"$path","data":{}}""",
            )

        assertEquals(4, responses.size)
        assertFalse(responses[0]["ok"].asBoolean)
        assertFalse(responses[1]["ok"].asBoolean)
        assertContains(responses[1]["error"].asString, "data")
        assertFalse(responses[2]["ok"].asBoolean)
        assertContains(responses[2]["error"].asString, "Template not found")
        assertTrue(responses[3]["ok"].asBoolean)
        assertEquals(4, responses[3]["id"].asInt)
    }

    @Test
    fun `writes to outputPath instead of base64`() {
        val dir = Files.createTempDirectory("serve-path")
        val path = writeTemplate(dir)
        val target = dir.resolve("nested/out.pdf")

        val response =
            serve(
                server(),
                """{"id":"a","template":"$path","data":{},"outputPath":"$target"}""",
            ).single()

        assertTrue(response["ok"].asBoolean)
        assertEquals("a", response["id"].asString)
        assertFalse(response.has("pdf"))
        assertEquals(target.toString(), response["path"].asString)
        assertTrue(Files.size(target) > 0)
        assertTrue(Files.readAllBytes(target).toString(StandardCharsets.ISO_8859_1).startsWith("%PDF-"))
    }

    @Test
    fun `reloads a template when the file changes`() {
        val dir = Files.createTempDirectory("serve-reload")
        val path = writeTemplate(dir)
        val server = server()

        val first = serve(server, """{"id":1,"template":"$path","data":{}}""").single()
        writeTemplate(dir, template.replace("hello", "hello world with a longer value"))
        val second = serve(server, """{"id":2,"template":"$path","data":{}}""").single()

        assertTrue(first["ok"].asBoolean)
        assertTrue(second["ok"].asBoolean)
        assertTrue(second["bytes"].asInt != first["bytes"].asInt)
    }

    @Test
    fun `accounts for served and failed requests`() {
        val dir = Files.createTempDirectory("serve-stats")
        val path = writeTemplate(dir)
        val input =
            (
                """{"id":1,"template":"$path","data":{}}""" + "\n" +
                    "garbage\n" +
                    """{"id":2,"template":"$path","data":{}}""" + "\n"
            ).byteInputStream(StandardCharsets.UTF_8)
        val output = ByteArrayOutputStream()

        val stats = server().serve(input, output)

        assertEquals(2, stats.served)
        assertEquals(1, stats.failed)
        assertEquals(3, output.toString(StandardCharsets.UTF_8).lines().count { it.isNotBlank() })
    }

    @Test
    fun `handles max request bytes and preload`() {
        val dir = Files.createTempDirectory("serve-max")
        val path = writeTemplate(dir)
        var logMessage = ""
        val s =
            PdfRequestServer(
                generator = PDFGenerator(PDFGeneratorConfig()),
                maxRequestBytes = 20,
                log = { logMessage = it },
            )
        s.preload(listOf(path.toString()))

        val responses = serve(s, """{"id":1,"template":"$path","data":{}}""")
        assertFalse(responses.single()["ok"].asBoolean)
        assertContains(responses.single()["error"].asString, "exceeds 20 bytes")
        assertTrue(logMessage.isNotEmpty())
    }

    @Test
    fun `handles missing template property and array input`() {
        val s = server()
        val r1 = serve(s, """{"id":99}""").single()
        assertFalse(r1["ok"].asBoolean)
        assertContains(r1["error"].asString, "Missing 'template'")

        val r2 = serve(s, "null").single()
        assertFalse(r2["ok"].asBoolean)
        assertContains(r2["error"].asString, "Invalid JSON request")

        val r3 = serve(s, "[]").single()
        assertFalse(r3["ok"].asBoolean)
        assertContains(r3["error"].asString, "Invalid JSON request")
    }

    @Test
    fun `logs generation error when generator throws`() {
        val dir = Files.createTempDirectory("serve-err")
        val brokenTpl = dir.resolve("broken.json")
        // Template missing required fields so generator.generateToStream throws
        Files.writeString(brokenTpl, """{"version":"1.0"}""")
        var logged = ""
        val s =
            PdfRequestServer(
                generator = PDFGenerator(PDFGeneratorConfig()),
                log = { logged += it },
            )
        val res = serve(s, """{"id":55,"template":"$brokenTpl","data":{}}""").single()
        assertFalse(res["ok"].asBoolean)
        assertTrue(logged.contains("failed template="))
    }
}
