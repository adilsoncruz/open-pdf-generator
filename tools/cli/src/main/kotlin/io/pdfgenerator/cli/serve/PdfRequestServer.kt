package io.pdfgenerator.cli.serve

import com.google.gson.Gson
import com.google.gson.JsonElement
import com.google.gson.JsonObject
import com.pdfgenerator.api.PDFGenerator
import com.pdfgenerator.model.Template
import java.io.BufferedReader
import java.io.ByteArrayOutputStream
import java.io.File
import java.io.InputStream
import java.io.InputStreamReader
import java.io.OutputStream
import java.io.OutputStreamWriter
import java.nio.charset.StandardCharsets
import java.util.Base64

/**
 * NDJSON request/response server for PDF generation.
 *
 * One line in, one line out — a request is still a single PDF, it just does not pay
 * process start-up, template parsing or font initialisation per document.
 *
 * Request:  {"id":1,"template":"/templates/invoice.json","data":{...},"outputPath":"/tmp/a.pdf"}
 * Response: {"id":1,"ok":true,"bytes":2537,"ms":1.8,"pdf":"JVBERi0..."}
 *           {"id":1,"ok":false,"error":"Template not found: '...'"}
 *
 * `outputPath` is optional: when present the PDF is written to that file and the
 * response omits the base64 payload (useful for large documents).
 */
class PdfRequestServer(
    private val generator: PDFGenerator,
    private val maxRequestBytes: Int = DEFAULT_MAX_REQUEST_BYTES,
    private val log: (String) -> Unit = {},
) {
    private data class CachedTemplate(
        val modified: Long,
        val length: Long,
        val template: Template,
    )

    data class Stats(
        val served: Int,
        val failed: Int,
        val elapsedMs: Long,
    )

    private val gson = Gson()
    private val templates = HashMap<String, CachedTemplate>()

    /** Parses templates up front so the first request does not pay for it. */
    fun preload(paths: List<String>) {
        paths.forEach { loadTemplate(it) }
    }

    /**
     * Serves requests until [input] reaches EOF. Requests are processed sequentially;
     * a failing request produces an error line and never stops the server.
     */
    fun serve(
        input: InputStream,
        output: OutputStream,
    ): Stats {
        val reader = BufferedReader(InputStreamReader(input, StandardCharsets.UTF_8))
        val writer = OutputStreamWriter(output, StandardCharsets.UTF_8)
        var served = 0
        var failed = 0
        val started = System.nanoTime()

        var line = reader.readLine()
        while (line != null) {
            if (line.isNotBlank()) {
                val response = handleLine(line)
                if (response.get("ok")?.asBoolean == true) served++ else failed++

                writer.write(gson.toJson(response))
                writer.write("\n")
                writer.flush()
            }
            line = reader.readLine()
        }

        return Stats(served, failed, (System.nanoTime() - started) / 1_000_000)
    }

    private fun handleLine(line: String): JsonObject {
        if (line.length > maxRequestBytes) {
            return errorResponse(null, "Request exceeds $maxRequestBytes bytes")
        }

        val request =
            try {
                gson.fromJson(line, JsonObject::class.java)
            } catch (e: Exception) {
                return errorResponse(null, "Invalid JSON request: ${e.message}")
            } ?: return errorResponse(null, "Request must be a JSON object")

        val id = request.get("id")

        val templatePath =
            request.get("template")?.takeString()
                ?: return errorResponse(id, "Missing 'template' (string path)")

        val dataElement = request.get("data")
        if (dataElement != null && !dataElement.isJsonNull && !dataElement.isJsonObject) {
            return errorResponse(id, "'data' must be a JSON object")
        }

        val started = System.nanoTime()
        return try {
            val template = loadTemplate(templatePath)
            val data = toDataMap(dataElement)
            val buffer = ByteArrayOutputStream(DEFAULT_RESPONSE_BUFFER_BYTES)
            generator.generateToStream(template, data, buffer)
            val pdf = buffer.toByteArray()
            val elapsedMs = (System.nanoTime() - started) / 1_000_000.0
            log(
                "served template=$templatePath bytes=${pdf.size} " +
                    "ms=${String.format(java.util.Locale.ROOT, "%.2f", elapsedMs)}",
            )

            request.get("outputPath")?.takeString()?.let { path ->
                val file = File(path)
                file.parentFile?.mkdirs()
                file.writeBytes(pdf)
                okResponse(id, pdf.size, elapsedMs).apply { addProperty("path", file.absolutePath) }
            } ?: okResponse(id, pdf.size, elapsedMs).apply {
                addProperty("pdf", Base64.getEncoder().encodeToString(pdf))
            }
        } catch (e: Exception) {
            val message = e.message ?: e.javaClass.simpleName
            log("failed template=$templatePath error=$message")
            errorResponse(id, message)
        }
    }

    @Suppress("UNCHECKED_CAST")
    private fun toDataMap(element: JsonElement?): Map<String, Any?> {
        if (element == null || element.isJsonNull) return emptyMap()
        return gson.fromJson(element, Map::class.java) as? Map<String, Any?> ?: emptyMap()
    }

    /**
     * Templates are cached per path and re-read when the file changes, so a long-lived
     * server picks up edited templates without a restart.
     */
    private fun loadTemplate(path: String): Template {
        val file = File(path)
        require(file.isFile) { "Template not found: '$path'" }

        val cached = templates[path]
        if (cached != null && cached.modified == file.lastModified() && cached.length == file.length()) {
            return cached.template
        }

        val template = Template.fromFile(file)
        templates[path] = CachedTemplate(file.lastModified(), file.length(), template)
        log("template cache: loaded $path")
        return template
    }

    private fun JsonElement.takeString(): String? = if (isJsonPrimitive && asJsonPrimitive.isString) asString else null

    private fun okResponse(
        id: JsonElement?,
        bytes: Int,
        elapsedMs: Double,
    ): JsonObject =
        JsonObject().apply {
            id?.let { add("id", it) }
            addProperty("ok", true)
            addProperty("bytes", bytes)
            addProperty("ms", elapsedMs)
        }

    private fun errorResponse(
        id: JsonElement?,
        message: String,
    ): JsonObject =
        JsonObject().apply {
            id?.let { add("id", it) }
            addProperty("ok", false)
            addProperty("error", message)
        }

    companion object {
        const val DEFAULT_MAX_REQUEST_BYTES: Int = 16 * 1024 * 1024
        private const val DEFAULT_RESPONSE_BUFFER_BYTES: Int = 8 * 1024
    }
}
