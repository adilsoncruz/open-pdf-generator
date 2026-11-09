package com.pdfgenerator.api

import com.google.gson.Gson
import com.google.gson.JsonElement
import com.google.gson.JsonSyntaxException
import com.pdfgenerator.adapter.openpdf.ImageRenderer
import com.pdfgenerator.engine.DocumentFactory
import com.pdfgenerator.engine.ElementHeightCalculator
import com.pdfgenerator.engine.PDFSecurityConfigurator
import com.pdfgenerator.engine.PageFlowOrchestrator
import com.pdfgenerator.engine.RenderContext
import com.pdfgenerator.engine.RenderEngine
import com.pdfgenerator.model.Element
import com.pdfgenerator.model.Template
import com.pdfgenerator.util.FontCache
import com.pdfgenerator.validator.SchemaValidator
import org.slf4j.LoggerFactory
import java.io.ByteArrayOutputStream
import java.io.File
import java.io.FileOutputStream
import java.io.OutputStream
import java.util.concurrent.ConcurrentHashMap

class PDFGenerator(
    private val config: PDFGeneratorConfig = PDFGeneratorConfig(),
) {
    private val logger = LoggerFactory.getLogger(PDFGenerator::class.java)
    private val renderEngine = RenderEngine(config)
    private val pageFlowOrchestrator = PageFlowOrchestrator(renderEngine, config)
    private var securityConfigurator = PDFSecurityConfigurator()

    constructor(
        config: PDFGeneratorConfig,
        securityConfigurator: PDFSecurityConfigurator,
    ) : this(config) {
        this.securityConfigurator = securityConfigurator
    }

    companion object {
        private val sharedGson = Gson()
        private val bufferPool = object : ThreadLocal<ByteArrayOutputStream>() {
            override fun initialValue(): ByteArrayOutputStream = ByteArrayOutputStream(32 * 1024)
        }

        init {
            FontCache.prewarm()
        }

        private val templateCache = ConcurrentHashMap<String, Template>()

        @JvmStatic
        fun clearCache() = templateCache.clear()

        @JvmStatic
        fun invalidateCache(templatePath: String) = templateCache.remove(templatePath)

        @JvmStatic
        fun cacheSize(): Int = templateCache.size

        @JvmStatic
        fun clearImageCache() = ImageRenderer.clearCache()

        @JvmStatic
        fun imageCacheSize(): Int = ImageRenderer.cacheSize()

        @JvmStatic
        fun setMaxImageCacheSize(size: Int) = ImageRenderer.setMaxCacheSize(size)

        internal fun getElementHeight(
            element: Element,
            data: Map<String, Any?>,
            context: RenderContext,
        ): Float = ElementHeightCalculator.getElementHeight(element, data, context)

        internal fun resolveTextForHeight(
            dataBinding: String?,
            value: String?,
            data: Map<String, Any?>,
        ): String? = ElementHeightCalculator.resolveTextForHeight(dataBinding, value, data)

        internal fun calculateLoopItemHeight(
            elements: List<Element>,
            loopWidth: Any?,
            loopHeight: Float,
        ): Float = ElementHeightCalculator.calculateLoopItemHeight(elements, loopWidth, loopHeight)
    }

    fun generate(
        template: Template,
        data: Map<String, Any?>,
        outputFile: File,
    ) {
        logger.info("Gerando PDF em: ${outputFile.absolutePath}")
        outputFile.parentFile?.mkdirs()
        FileOutputStream(outputFile).use { output -> generateToStream(template, data, output) }
        logger.info("PDF gerado com sucesso: ${outputFile.absolutePath}")
    }

    fun generate(
        template: Template,
        data: Map<String, Any?>,
    ): ByteArray {
        val output = bufferPool.get()
        output.reset()
        generateToStream(template, data, output)
        val bytes = output.toByteArray()
        if (output.size() > 512 * 1024) {
            bufferPool.set(ByteArrayOutputStream(32 * 1024))
        } else {
            output.reset()
        }
        return bytes
    }

    fun generate(
        templateJson: String,
        dataJson: String,
    ): ByteArray = runCatchingJson { generate(Template.fromString(templateJson), parseDataJson(dataJson)) }

    fun generate(
        templateJson: String,
        dataJson: String,
        outputFile: File,
    ) = runCatchingJson { generate(Template.fromString(templateJson), parseDataJson(dataJson), outputFile) }

    fun generateFromPath(
        templatePath: String,
        data: Map<String, Any?>,
    ): ByteArray = generate(getOrLoadTemplate(templatePath), data)

    fun generateFromPath(
        templatePath: String,
        dataJson: String,
    ): ByteArray = runCatchingJson(templatePath) { generate(getOrLoadTemplate(templatePath), parseDataJson(dataJson)) }

    fun generateFromPath(
        templatePath: String,
        data: Map<String, Any?>,
        outputFile: File,
    ) = generate(getOrLoadTemplate(templatePath), data, outputFile)

    fun generateFromPath(
        templatePath: String,
        dataJson: String,
        outputFile: File,
    ) = generate(getOrLoadTemplate(templatePath), parseDataJson(dataJson), outputFile)

    private inline fun <T> runCatchingJson(
        templatePath: String? = null,
        action: () -> T,
    ): T =
        try {
            action()
        } catch (e: PDFGenerationException) {
            throw e
        } catch (e: JsonSyntaxException) {
            val msg =
                if (templatePath != null) {
                    "JSON syntax error processing data: ${e.message}. Verify that the data is valid JSON."
                } else {
                    "JSON syntax error: ${e.message}. Verify that template and data are valid JSON."
                }
            throw PDFGenerationException(msg, e)
        } catch (e: Exception) {
            val msg =
                if (templatePath != null) {
                    "Error generating PDF with template '$templatePath': ${e.message}"
                } else {
                    "Error generating PDF: ${e.message}"
                }
            throw PDFGenerationException(msg, e)
        }

    private fun getOrLoadTemplate(templatePath: String): Template =
        templateCache.getOrPut(templatePath) {
            logger.info("Loading template: $templatePath (first time, will be cached)")
            loadTemplate(templatePath)
        }

    private fun loadTemplate(path: String): Template =
        tryLoadFromClasspath(path)?.let { parseTemplateContent(it, path) }
            ?: File(path).takeIf { it.isFile }?.let { parseTemplateContent(it.readText(), path) }
            ?: throw PDFGenerationException("Template not found: '$path'. Verify that the file exists in the classpath or specified path.")

    private fun parseTemplateContent(
        content: String,
        templatePath: String,
    ): Template {
        val clean = content.trimStart('\uFEFF').trim()
        if (!clean.startsWith("{")) {
            throw PDFGenerationException("Template '$templatePath' is not valid JSON. Expected JSON object starting with '{'.")
        }
        return try {
            Template.fromString(clean)
        } catch (e: JsonSyntaxException) {
            throw PDFGenerationException("Erro de sintaxe JSON no template '$templatePath': ${e.message}.", e)
        } catch (e: Exception) {
            throw PDFGenerationException("Erro ao parsear template '$templatePath': ${e.message}", e)
        }
    }

    private fun tryLoadFromClasspath(path: String): String? =
        listOf(path, "/$path", path.removePrefix("/")).firstNotNullOfOrNull {
            (this::class.java.classLoader.getResourceAsStream(it) ?: this::class.java.getResourceAsStream(it))
                ?.bufferedReader()?.use { reader -> reader.readText() }
        }

    @Suppress("UNCHECKED_CAST")
    private fun parseDataJson(dataJson: String): Map<String, Any?> =
        try {
            val result = jsonToMap(sharedGson.fromJson(dataJson, JsonElement::class.java))
            if (result !is Map<*, *>) {
                throw PDFGenerationException(
                    "JSON data must be a JSON object (starting with '{'). Received type: ${result?.javaClass?.simpleName ?: "null"}",
                )
            }
            result as Map<String, Any?>
        } catch (e: PDFGenerationException) {
            throw e
        } catch (e: JsonSyntaxException) {
            throw PDFGenerationException("JSON data syntax error: ${e.message}. Verify that the data is valid JSON.", e)
        } catch (e: Exception) {
            throw PDFGenerationException("Erro ao processar dados JSON: ${e.message}", e)
        }

    @Suppress("UNCHECKED_CAST")
    private fun jsonToMap(el: JsonElement): Any? =
        when {
            el.isJsonNull -> null
            el.isJsonPrimitive ->
                with(el.asJsonPrimitive) {
                    if (isBoolean) {
                        asBoolean
                    } else if (isNumber) {
                        asNumber
                    } else {
                        asString
                    }
                }
            el.isJsonArray -> el.asJsonArray.map { jsonToMap(it) }
            el.isJsonObject -> el.asJsonObject.entrySet().associate { it.key to jsonToMap(it.value) }
            else -> null
        }

    fun generateToStream(
        template: Template,
        data: Map<String, Any?>,
        output: OutputStream,
    ) {
        try {
            val validationResult = template.validate()
            if (!validationResult.isValid) {
                throw PDFGenerationException("Invalid template: ${validationResult.errors.joinToString(", ") { it.message }}")
            }
            if (template.schema != null) {
                val schemaErrors = SchemaValidator.validate(template.schema, data)
                if (schemaErrors.isNotEmpty()) throw PDFSchemaValidationException(schemaErrors)
            }

            val session = DocumentFactory.createSession(template, data, output, config, securityConfigurator)
            pageFlowOrchestrator.renderBodyElements(template.bodyElements(), template.groups, session.context, data)
            session.finalizeBaseLayer()

            if (template.summaryPage != null && template.summaryPage.elements.isNotEmpty()) {
                pageFlowOrchestrator.renderSummaryPage(template.summaryPage, session.context, data)
            }
            session.close()
        } catch (e: PDFGenerationException) {
            throw e
        } catch (e: Exception) {
            throw PDFGenerationException("Error generating PDF: ${e.message}", e)
        }
    }
}
