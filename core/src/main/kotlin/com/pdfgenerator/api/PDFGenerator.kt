package com.pdfgenerator.api

import com.lowagie.text.Document
import com.lowagie.text.pdf.PdfWriter
import com.pdfgenerator.adapter.openpdf.HeaderFooterPageEvent
import com.pdfgenerator.adapter.openpdf.TextRenderer
import com.pdfgenerator.engine.RenderContext
import com.pdfgenerator.engine.RenderEngine
import com.pdfgenerator.engine.RenderState
import com.pdfgenerator.model.BarcodeElement
import com.pdfgenerator.model.ConditionalElement
import com.pdfgenerator.model.Element
import com.pdfgenerator.model.ElementGroup
import com.pdfgenerator.model.ImageElement
import com.pdfgenerator.model.LineElement
import com.pdfgenerator.model.LoopElement
import com.pdfgenerator.model.PositionMode
import com.pdfgenerator.model.RectangleElement
import com.pdfgenerator.model.StaticTextElement
import com.pdfgenerator.model.TableElement
import com.pdfgenerator.model.Template
import com.pdfgenerator.model.TextElement
import com.pdfgenerator.util.ConditionEvaluator
import com.pdfgenerator.util.DataBindingResolver
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

    companion object {
        private val templateCache = ConcurrentHashMap<String, Template>()

        @JvmStatic
        fun clearCache() {
            templateCache.clear()
        }

        @JvmStatic
        fun invalidateCache(templatePath: String) {
            templateCache.remove(templatePath)
        }

        @JvmStatic
        fun cacheSize(): Int = templateCache.size
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
        val estimatedPages = maxOf(1, template.pageElements.size / 10)
        val initialSize = estimatedPages * 50 * 1024
        val output = ByteArrayOutputStream(initialSize)
        generateToStream(template, data, output)
        return output.toByteArray()
    }

    fun generate(
        templateJson: String,
        dataJson: String,
    ): ByteArray {
        try {
            val template = Template.fromString(templateJson)
            val data = parseDataJson(dataJson)
            return generate(template, data)
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
            val template = Template.fromString(templateJson)
            val data = parseDataJson(dataJson)
            generate(template, data, outputFile)
        } catch (e: PDFGenerationException) {
            throw e
        } catch (e: Exception) {
            throw PDFGenerationException("Error generating PDF: ${e.message}", e)
        }
    }

    fun generateFromPath(
        templatePath: String,
        data: Map<String, Any?>,
    ): ByteArray {
        val template = getOrLoadTemplate(templatePath)
        return generate(template, data)
    }

    fun generateFromPath(
        templatePath: String,
        dataJson: String,
    ): ByteArray {
        try {
            val template = getOrLoadTemplate(templatePath)
            val data = parseDataJson(dataJson)
            return generate(template, data)
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
    ) {
        val template = getOrLoadTemplate(templatePath)
        generate(template, data, outputFile)
    }

    fun generateFromPath(
        templatePath: String,
        dataJson: String,
        outputFile: File,
    ) {
        val template = getOrLoadTemplate(templatePath)
        val data = parseDataJson(dataJson)
        generate(template, data, outputFile)
    }

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
            throw PDFGenerationException(
                "Erro de sintaxe JSON no template '$templatePath': ${e.message}.",
                e,
            )
        } catch (e: Exception) {
            throw PDFGenerationException(
                "Erro ao parsear template '$templatePath': ${e.message}",
                e,
            )
        }
    }

    private fun minifyJson(json: String): String {
        return try {
            val gson = com.google.gson.Gson()
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
            val gson = com.google.gson.Gson()
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

            val headerCondition = template.pageSettings.header?.printCondition
            val footerCondition = template.pageSettings.footer?.printCondition
            val templateHeaderHeight = template.pageSettings.header?.height ?: 0f
            val templateFooterHeight = template.pageSettings.footer?.height ?: 0f

            val page1Data = data.toMutableMap().apply { put("_pageNumber", 1) }

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
                template.pageSettings.bodyBackground != null
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
                data.toMutableMap().apply {
                    put("_pageNumber", 1) // Initial page
                    put("_date", java.time.LocalDate.now().toString())
                    put("_dateTime", java.time.LocalDateTime.now().toString())
                }

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

            template.pageElements.forEach { element ->
                try {
                    if (shouldRenderElement(element, template.groups, data)) {
                        val effectiveY =
                            if (element.positionMode == PositionMode.RELATIVE) {
                                val offsetY = element.relativeOffsetY ?: 10f
                                renderState.currentY + offsetY
                            } else {
                                element.y
                            }

                        val renderContext =
                            if (element.positionMode == PositionMode.RELATIVE) {
                                context.copy(offsetY = bodyOffsetY + (effectiveY - element.y))
                            } else {
                                context
                            }
                        renderEngine.render(element, renderContext)

                        if (element !is LoopElement && element !is TableElement) {
                            val elementHeight = getElementHeight(element, data, context)
                            renderState.updateMaxY(effectiveY + elementHeight)
                        }
                    }
                } catch (e: Exception) {
                    logger.error("Erro ao renderizar elemento ${element.id}: ${e.message}", e)
                    if (config.strictMode) {
                        throw PDFGenerationException("Erro ao renderizar elemento ${element.id}", e)
                    }
                }
            }

            val cb = writer.directContent
            cb.saveState()
            cb.setColorFill(java.awt.Color(255, 255, 255, 0)) // Fully transparent
            cb.rectangle(0f, 0f, 1f, 1f)
            cb.fill()
            cb.restoreState()

            if (template.summaryPage != null && template.summaryPage.elements.isNotEmpty()) {
                val summaryCondition = template.summaryPage.printCondition
                if (summaryCondition == null || ConditionEvaluator.evaluate(summaryCondition, data, null)) {
                    document.newPage()
                    writer.pageEvent = null

                    val summaryOffsetX = margins.left
                    val summaryOffsetY = margins.top
                    val summaryContainerWidth = document.pageSize.width - margins.left - margins.right
                    val summaryContainerHeight = document.pageSize.height - margins.top - margins.bottom

                    val summaryContext =
                        context.copy(
                            isSummaryPage = true,
                            containerWidth = summaryContainerWidth,
                            containerHeight = summaryContainerHeight,
                            offsetX = summaryOffsetX,
                            offsetY = summaryOffsetY,
                            bodyOffsetY = summaryOffsetY,
                        )

                    template.summaryPage.background?.let { bg ->
                        bg.elements.forEach { element ->
                            try {
                                if (shouldRenderElement(element, bg.groups, data)) {
                                    renderEngine.render(element, summaryContext.copy(useContentUnder = true))
                                }
                            } catch (e: Exception) {
                                logger.error("Erro ao renderizar background da summary ${element.id}: ${e.message}", e)
                            }
                        }
                    }

                    template.summaryPage.elements.forEach { element ->
                        try {
                            if (shouldRenderElement(element, template.summaryPage.groups, data)) {
                                renderEngine.render(element, summaryContext)
                            }
                        } catch (e: Exception) {
                            logger.error("Erro ao renderizar elemento da summary ${element.id}: ${e.message}", e)
                            if (config.strictMode) {
                                throw PDFGenerationException("Erro ao renderizar elemento da summary ${element.id}", e)
                            }
                        }
                    }
                }
            }

            document.close()
        } catch (e: PDFGenerationException) {
            throw e
        } catch (e: Exception) {
            throw PDFGenerationException("Error generating PDF: ${e.message}", e)
        }
    }

    private fun shouldRenderElement(
        element: Element,
        groups: List<ElementGroup>?,
        data: Map<String, Any?>,
    ): Boolean {
        if (groups.isNullOrEmpty()) {
            return true
        }

        val group = groups.find { it.elementIds.contains(element.id) }

        if (group == null) {
            return true
        }

        val shouldRender = ConditionEvaluator.evaluate(group.printCondition, data)

        if (!shouldRender) {
            logger.debug("Elemento ${element.id} SKIPPED (grupo '${group.name}' printCondition='${group.printCondition}' = false)")
        }

        return shouldRender
    }

    private fun getElementHeight(
        element: Element,
        data: Map<String, Any?>,
        context: RenderContext,
    ): Float {
        return when (element) {
            is TextElement -> {
                val overflow = element.style?.overflow?.lowercase() ?: "visible"
                val definedHeight = element.height ?: (element.style?.fontSize ?: 12f)

                if (overflow == "auto" && element.style?.multiline == true && element.width != null) {
                    val text = resolveTextForHeight(element.dataBinding, element.value, data)
                    if (text != null) {
                        TextRenderer.calculateContentHeight(
                            text = text,
                            boxWidth = element.width,
                            fontSize = element.style?.fontSize ?: 12f,
                            lineHeight = element.style?.lineHeight,
                            paddingTop = element.style?.paddingTop ?: 0f,
                            paddingBottom = element.style?.paddingBottom ?: 0f,
                            paddingLeft = element.style?.paddingLeft ?: 0f,
                            paddingRight = element.style?.paddingRight ?: 0f,
                            firstLineIndent = element.style?.firstLineIndent ?: 0f,
                            fontFamily = element.style?.fontFamily ?: "Helvetica",
                        )
                    } else {
                        definedHeight
                    }
                } else {
                    definedHeight
                }
            }
            is StaticTextElement -> {
                val overflow = element.style?.overflow?.lowercase() ?: "visible"
                val definedHeight = element.height ?: (element.style?.fontSize ?: 12f)

                if (overflow == "auto" && element.style?.multiline == true && element.width != null) {
                    TextRenderer.calculateContentHeight(
                        text = element.value,
                        boxWidth = element.width,
                        fontSize = element.style?.fontSize ?: 12f,
                        lineHeight = element.style?.lineHeight,
                        paddingTop = element.style?.paddingTop ?: 0f,
                        paddingBottom = element.style?.paddingBottom ?: 0f,
                        paddingLeft = element.style?.paddingLeft ?: 0f,
                        paddingRight = element.style?.paddingRight ?: 0f,
                        firstLineIndent = element.style?.firstLineIndent ?: 0f,
                        fontFamily = element.style?.fontFamily ?: "Helvetica",
                    )
                } else {
                    definedHeight
                }
            }
            is ImageElement -> element.height
            is RectangleElement -> {
                when (val h = element.height) {
                    is Number -> h.toFloat()
                    is String -> if (h == "100%") context.containerHeight ?: 100f else 100f
                    else -> 100f
                }
            }
            is BarcodeElement -> element.height
            is LineElement -> {
                val containerHeight = context.containerHeight ?: 100f
                kotlin.math.abs(element.resolveHeight(containerHeight)).coerceAtLeast(1f)
            }
            is TableElement -> {
                val tableData = DataBindingResolver.resolve(element.dataBinding, data, null)
                val itemCount = if (tableData is List<*>) tableData.size else 0
                val fontSize = element.style?.fontSize ?: 10f
                val headerFontSize = element.style?.headerFontSize ?: 12f
                val headerPadding = (element.style?.headerPaddingTop ?: 5f) + (element.style?.headerPaddingBottom ?: 5f)
                val cellPadding = (element.style?.cellPaddingTop ?: 5f) + (element.style?.cellPaddingBottom ?: 5f)
                val headerHeight = headerFontSize + headerPadding
                val rowHeight = fontSize + cellPadding
                headerHeight + (itemCount * rowHeight)
            }
            is LoopElement -> {
                val loopData = DataBindingResolver.resolve(element.dataBinding, data, null)
                val itemCount = if (loopData is List<*>) loopData.size else 0
                val itemHeight = calculateLoopItemHeight(element.elements, element.width, element.height)
                val totalSpacing = if (itemCount > 1) element.itemSpacing * (itemCount - 1) else 0f
                (itemCount * itemHeight) + totalSpacing
            }
            is ConditionalElement -> {
                element.elements.maxOfOrNull { getElementHeight(it, data, context) } ?: 0f
            }
        }
    }

    private fun resolveTextForHeight(
        dataBinding: String?,
        value: String?,
        data: Map<String, Any?>,
    ): String? {
        return when {
            !dataBinding.isNullOrBlank() -> {
                val resolved = DataBindingResolver.resolve(dataBinding, data, null)
                resolved?.toString()
            }
            else -> value
        }
    }

    private fun calculateLoopItemHeight(
        elements: List<Element>,
        loopWidth: Float,
        loopHeight: Float,
    ): Float {
        if (elements.isEmpty()) {
            return 0f
        }

        return elements.maxOfOrNull { element ->
            val y = element.y
            val height =
                when (element) {
                    is TextElement -> element.height ?: 20f
                    is StaticTextElement -> element.height ?: 20f
                    is ImageElement -> {
                        if (element.height.toString() == "100%" || element.height.toString() == "100.0%") {
                            loopHeight
                        } else {
                            element.height
                        }
                    }
                    is RectangleElement -> {
                        val h = element.height
                        when (h) {
                            is String -> {
                                if (h == "100%" || h == "100.0%") loopHeight else h.toFloatOrNull() ?: 20f
                            }
                            is Number -> h.toFloat()
                            else -> 20f
                        }
                    }
                    is LineElement -> {
                        val lineHeight = element.resolveHeight(loopHeight)
                        if (lineHeight > 0) kotlin.math.abs(lineHeight) else 1f
                    }
                    is BarcodeElement -> element.height
                    else -> 20f
                }
            y + height
        } ?: 20f
    }
}
