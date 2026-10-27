package com.pdfgenerator.api

import com.google.gson.Gson
import com.lowagie.text.Document
import com.lowagie.text.pdf.PdfWriter
import com.pdfgenerator.adapter.openpdf.HeaderFooterPageEvent
import com.pdfgenerator.engine.ElementHeightCalculator
import com.pdfgenerator.engine.PageFlowOrchestrator
import com.pdfgenerator.engine.RenderContext
import com.pdfgenerator.engine.RenderEngine
import com.pdfgenerator.engine.RenderState
import com.pdfgenerator.model.Element
import com.pdfgenerator.model.Template
import com.pdfgenerator.util.ConditionEvaluator
import com.pdfgenerator.util.withSyntheticBindings
import com.pdfgenerator.util.withSyntheticPageNumber
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
    private val gson = Gson()

    companion object {
        private val templateCache = ConcurrentHashMap<String, Template>()

        @JvmStatic
        fun clearCache() = templateCache.clear()

        @JvmStatic
        fun invalidateCache(templatePath: String) = templateCache.remove(templatePath)

        @JvmStatic
        fun cacheSize(): Int = templateCache.size

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
        FileOutputStream(outputFile).use { output ->
            generateToStream(template, data, output)
        }
        logger.info("PDF gerado com sucesso: ${outputFile.absolutePath}")
    }

    fun generate(
        template: Template,
        data: Map<String, Any?>,
    ): ByteArray {
        val output = ByteArrayOutputStream(maxOf(1, (template.pageElements?.size ?: 0) / 10) * 50 * 1024)
        generateToStream(template, data, output)
        return output.toByteArray()
    }

    fun generate(
        templateJson: String,
        dataJson: String,
    ): ByteArray {
        try {
            return generate(Template.fromString(templateJson), parseDataJson(dataJson))
        } catch (e: PDFGenerationException) {
            throw e
        } catch (e: com.google.gson.JsonSyntaxException) {
            throw PDFGenerationException(
                "JSON syntax error: ${e.message}. Verify that template and data are valid JSON.",
                e,
            )
        } catch (e: Exception) {
            throw PDFGenerationException("Error generating PDF: ${e.message}", e)
        }
    }

    fun generate(
        templateJson: String,
        dataJson: String,
        outputFile: File,
    ) {
        try {
            generate(Template.fromString(templateJson), parseDataJson(dataJson), outputFile)
        } catch (e: PDFGenerationException) {
            throw e
        } catch (e: Exception) {
            throw PDFGenerationException("Error generating PDF: ${e.message}", e)
        }
    }

    fun generateFromPath(
        templatePath: String,
        data: Map<String, Any?>,
    ): ByteArray = generate(getOrLoadTemplate(templatePath), data)

    fun generateFromPath(
        templatePath: String,
        dataJson: String,
    ): ByteArray {
        try {
            return generate(getOrLoadTemplate(templatePath), parseDataJson(dataJson))
        } catch (e: PDFGenerationException) {
            throw e
        } catch (e: com.google.gson.JsonSyntaxException) {
            throw PDFGenerationException(
                "JSON syntax error processing data: ${e.message}. Verify that the data is valid JSON.",
                e,
            )
        } catch (e: Exception) {
            throw PDFGenerationException(
                "Error generating PDF with template '$templatePath': ${e.message}",
                e,
            )
        }
    }

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

    private fun getOrLoadTemplate(templatePath: String): Template {
        return templateCache.getOrPut(templatePath) {
            logger.info("Loading template: $templatePath (first time, will be cached)")
            loadTemplate(templatePath)
        }
    }

    private fun loadTemplate(templatePath: String): Template {
        val classpathContent = tryLoadFromClasspath(templatePath)
        if (classpathContent != null) {
            logger.debug("Template carregado do classpath: $templatePath")
            return parseTemplateContent(classpathContent, templatePath)
        }

        val file = File(templatePath)
        if (file.exists() && file.isFile) {
            logger.debug("Template carregado do filesystem: $templatePath")
            val content = file.readText()
            return parseTemplateContent(content, templatePath)
        }

        throw PDFGenerationException(
            "Template not found: '$templatePath'. Verify that the file exists in the classpath or specified path.",
        )
    }

    private fun parseTemplateContent(
        content: String,
        templatePath: String,
    ): Template {
        val cleanContent = content.trimStart('\uFEFF').trim()

        if (!cleanContent.startsWith("{")) {
            throw PDFGenerationException(
                "Template '$templatePath' is not valid JSON. Expected JSON object starting with '{'.",
            )
        }

        return try {
            val minified = minifyJson(cleanContent)
            Template.fromString(minified)
        } catch (e: com.google.gson.JsonSyntaxException) {
            throw PDFGenerationException("Erro de sintaxe JSON no template '$templatePath': ${e.message}.", e)
        } catch (e: Exception) {
            throw PDFGenerationException("Erro ao parsear template '$templatePath': ${e.message}", e)
        }
    }

    private fun minifyJson(json: String): String {
        return try {
            val jsonElement = gson.fromJson(json, com.google.gson.JsonElement::class.java)
            gson.toJson(jsonElement)
        } catch (e: Exception) {
            logger.debug("Could not minify JSON, using original")
            json
        }
    }

    private fun tryLoadFromClasspath(resourcePath: String): String? {
        val paths = listOf(resourcePath, "/$resourcePath", resourcePath.removePrefix("/"))

        for (path in paths) {
            val stream =
                this::class.java.classLoader.getResourceAsStream(path)
                    ?: this::class.java.getResourceAsStream(path)
            if (stream != null) {
                return stream.bufferedReader().use { it.readText() }
            }
        }

        return null
    }

    @Suppress("UNCHECKED_CAST")
    private fun parseDataJson(dataJson: String): Map<String, Any?> {
        try {
            val jsonElement = gson.fromJson(dataJson, com.google.gson.JsonElement::class.java)
            val result = jsonToMap(jsonElement)
            if (result !is Map<*, *>) {
                throw PDFGenerationException(
                    "JSON data must be a JSON object (starting with '{'). Received type: ${result?.javaClass?.simpleName ?: "null"}",
                )
            }
            @Suppress("UNCHECKED_CAST")
            return result as Map<String, Any?>
        } catch (e: PDFGenerationException) {
            throw e
        } catch (e: com.google.gson.JsonSyntaxException) {
            throw PDFGenerationException(
                "JSON data syntax error: ${e.message}. Verify that the data is valid JSON.",
                e,
            )
        } catch (e: Exception) {
            throw PDFGenerationException("Erro ao processar dados JSON: ${e.message}", e)
        }
    }

    @Suppress("UNCHECKED_CAST")
    private fun jsonToMap(element: com.google.gson.JsonElement): Any? {
        return when {
            element.isJsonNull -> null
            element.isJsonPrimitive -> {
                val primitive = element.asJsonPrimitive
                when {
                    primitive.isBoolean -> primitive.asBoolean
                    primitive.isNumber -> primitive.asNumber
                    else -> primitive.asString
                }
            }
            element.isJsonArray -> {
                element.asJsonArray.map { jsonToMap(it) }
            }
            element.isJsonObject -> {
                element.asJsonObject.entrySet().associate { (key, value) ->
                    key to jsonToMap(value)
                }
            }
            else -> null
        }
    }

    fun generateToStream(
        template: Template,
        data: Map<String, Any?>,
        output: OutputStream,
    ) {
        try {
            val validationResult = template.validate()
            if (!validationResult.isValid) {
                throw PDFGenerationException(
                    "Invalid template: ${validationResult.errors.joinToString(", ") { it.message }}",
                )
            }

            if (template.schema != null) {
                val schemaErrors = com.pdfgenerator.validator.SchemaValidator.validate(template.schema, data)
                if (schemaErrors.isNotEmpty()) {
                    throw PDFSchemaValidationException(schemaErrors)
                }
            }

            val headerCondition = template.pageSettings.header?.printCondition
            val footerCondition = template.pageSettings.footer?.printCondition
            val templateHeaderHeight = template.pageSettings.header?.height ?: 0f
            val templateFooterHeight = template.pageSettings.footer?.height ?: 0f

            val page1Data = withSyntheticPageNumber(data, 1)

            val headerVisiblePage1 =
                template.pageSettings.header?.let { header ->
                    val condition = header.printCondition
                    condition == null || ConditionEvaluator.evaluate(condition, page1Data, null)
                } ?: false

            val footerVisiblePage1 =
                template.pageSettings.footer?.let { footer ->
                    val condition = footer.printCondition
                    condition == null || ConditionEvaluator.evaluate(condition, page1Data, null)
                } ?: false

            val effectiveHeaderHeightPage1 = if (headerVisiblePage1) templateHeaderHeight else 0f
            val effectiveFooterHeightPage1 = if (footerVisiblePage1) templateFooterHeight else 0f

            val effectiveMarginTop = template.pageSettings.margins.top + effectiveHeaderHeightPage1
            val effectiveMarginBottom = template.pageSettings.margins.bottom + effectiveFooterHeightPage1

            val document =
                Document(
                    template.pageSettings.getPageSize(),
                    template.pageSettings.margins.left,
                    template.pageSettings.margins.right,
                    effectiveMarginTop,
                    effectiveMarginBottom,
                )

            val writer = PdfWriter.getInstance(document, output)

            if (template.pageSettings.header != null ||
                template.pageSettings.footer != null ||
                template.pageSettings.bodyBackground != null ||
                template.pageSettings.watermark != null
            ) {
                writer.pageEvent = HeaderFooterPageEvent(template, data, config)
            }

            document.open()

            val margins = template.pageSettings.margins
            val bodyContainerWidth = document.pageSize.width - margins.left - margins.right
            val bodyContainerHeight =
                document.pageSize.height - margins.top - margins.bottom -
                    effectiveHeaderHeightPage1 - effectiveFooterHeightPage1

            val renderState = RenderState()

            val bodyOffsetY = margins.top + effectiveHeaderHeightPage1
            val bodyOffsetX = margins.left

            val enrichedData =
                withSyntheticBindings(
                    data,
                    mapOf(
                        "_pageNumber" to 1,
                        "_date" to java.time.LocalDate.now().toString(),
                        "_dateTime" to java.time.LocalDateTime.now().toString(),
                    ),
                )

            val context =
                RenderContext(
                    document = document,
                    writer = writer,
                    template = template,
                    data = enrichedData,
                    config = config,
                    containerWidth = bodyContainerWidth,
                    containerHeight = bodyContainerHeight,
                    renderState = renderState,
                    offsetX = bodyOffsetX,
                    offsetY = bodyOffsetY,
                    bodyOffsetY = bodyOffsetY,
                    headerPrintCondition = headerCondition,
                    footerPrintCondition = footerCondition,
                    templateHeaderHeight = templateHeaderHeight,
                    templateFooterHeight = templateFooterHeight,
                )

            pageFlowOrchestrator.renderBodyElements(template.bodyElements(), template.groups, context, data)

            val cb = writer.directContent
            cb.saveState()
            cb.setColorFill(java.awt.Color(255, 255, 255, 0)) // Fully transparent
            cb.rectangle(0f, 0f, 1f, 1f)
            cb.fill()
            cb.restoreState()

            if (template.summaryPage != null && template.summaryPage.elements.isNotEmpty()) {
                pageFlowOrchestrator.renderSummaryPage(template.summaryPage, context, data)
            }
            document.close()
        } catch (e: PDFGenerationException) {
            throw e
        } catch (e: Exception) {
            throw PDFGenerationException("Error generating PDF: ${e.message}", e)
        }
    }
}
