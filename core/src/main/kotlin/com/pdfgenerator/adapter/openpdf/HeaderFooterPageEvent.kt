package com.pdfgenerator.adapter.openpdf

import com.lowagie.text.Document
import com.lowagie.text.pdf.PdfPageEventHelper
import com.lowagie.text.pdf.PdfWriter
import com.pdfgenerator.api.PDFGeneratorConfig
import com.pdfgenerator.engine.RenderContext
import com.pdfgenerator.engine.RenderEngine
import com.pdfgenerator.model.*
import com.pdfgenerator.util.ConditionEvaluator
import org.slf4j.LoggerFactory

class HeaderFooterPageEvent(
    private val template: Template,
    private val data: Map<String, Any?>,
    private val config: PDFGeneratorConfig
) : PdfPageEventHelper() {

    private val logger = LoggerFactory.getLogger(HeaderFooterPageEvent::class.java)
    private val renderEngine = RenderEngine(config)

    private var headerAdjustedElements: List<Element>? = null
    private var footerAdjustedElements: List<Element>? = null
    private var bodyBackgroundAdjustedElements: List<Element>? = null

    private var headerContext: RenderContext? = null
    private var footerContext: RenderContext? = null
    private var bodyBackgroundContext: RenderContext? = null

    private var initialized = false

    private fun shouldRenderElement(element: Element, groups: List<ElementGroup>?): Boolean {
        if (groups.isNullOrEmpty()) return true
        val group = groups.find { it.elementIds.contains(element.id) } ?: return true
        return ConditionEvaluator.evaluate(group.printCondition, data)
    }

    override fun onStartPage(writer: PdfWriter, document: Document) {
        try {
            if (!initialized) {
                initializeTemplates(writer, document)
                initialized = true
            }

            // Enrich data with system variables
            val pageData = data.toMutableMap().apply {
                put("_pageNumber", writer.pageNumber)
                put("_date", java.time.LocalDate.now().toString())
                put("_dateTime", java.time.LocalDateTime.now().toString())
            }

            template.pageSettings.bodyBackground?.let { bodyBackground ->
                val bgCondition = bodyBackground.printCondition
                if (bgCondition == null || ConditionEvaluator.evaluate(bgCondition, pageData, null)) {
                    renderBodyBackgroundOptimized(writer, document, bodyBackground)
                }
            }
        } catch (e: Exception) {
            logger.error("Error rendering body background: ${e.message}", e)
            if (config.strictMode) {
                throw e
            }
        }
    }

    override fun onEndPage(writer: PdfWriter, document: Document) {
        try {
            // Enrich data with system variables
            val pageData = data.toMutableMap().apply {
                put("_pageNumber", writer.pageNumber)
                put("_date", java.time.LocalDate.now().toString())
                put("_dateTime", java.time.LocalDateTime.now().toString())
            }

            template.pageSettings.header?.let { header ->
                val headerCondition = header.printCondition
                if (headerCondition == null || ConditionEvaluator.evaluate(headerCondition, pageData, null)) {
                    renderHeaderOptimized(writer, document, header, pageData)
                }
            }

            template.pageSettings.footer?.let { footer ->
                val footerCondition = footer.printCondition
                if (footerCondition == null || ConditionEvaluator.evaluate(footerCondition, pageData, null)) {
                    renderFooterOptimized(writer, document, footer, pageData)
                }
            }
        } catch (e: Exception) {
            logger.error("Error rendering header/footer: ${e.message}", e)
            if (config.strictMode) {
                throw e
            }
        }
    }

    private fun initializeTemplates(writer: PdfWriter, document: Document) {
        val margins = template.pageSettings.margins
        val containerWidth = document.pageSize.width - margins.left - margins.right

        template.pageSettings.header?.let { header ->
            headerAdjustedElements = header.elements
                .filter { shouldRenderElement(it, header.groups) }
                .map { adjustElementForHeader(it, document) }

            headerContext = RenderContext(
                document = document,
                writer = writer,
                template = template,
                data = data,
                config = config,
                useContentUnder = false,
                containerWidth = containerWidth,
                containerHeight = header.height
            )
        }

        template.pageSettings.footer?.let { footer ->
            footerAdjustedElements = footer.elements
                .filter { shouldRenderElement(it, footer.groups) }
                .map { adjustElementForFooter(it, document, footer) }

            footerContext = RenderContext(
                document = document,
                writer = writer,
                template = template,
                data = data,
                config = config,
                useContentUnder = false,
                containerWidth = containerWidth,
                containerHeight = footer.height
            )
        }

        template.pageSettings.bodyBackground?.let { bodyBackground ->
            val containerHeight = document.pageSize.height - margins.top - margins.bottom

            bodyBackgroundAdjustedElements = bodyBackground.elements
                .filter { shouldRenderElement(it, bodyBackground.groups) }
                .map { adjustElementForBackground(it, document) }

            bodyBackgroundContext = RenderContext(
                document = document,
                writer = writer,
                template = template,
                data = data,
                config = config,
                useContentUnder = true,
                containerWidth = containerWidth,
                containerHeight = containerHeight
            )
        }
    }

    private fun renderHeaderOptimized(writer: PdfWriter, document: Document, header: HeaderFooter, pageData: Map<String, Any?>) {
        val cb = writer.directContent
        cb.saveState()

        try {
            val elements = headerAdjustedElements ?: return
            val baseContext = headerContext ?: return
            
            // Create context with page-enriched data (includes pageNumber)
            val context = baseContext.copy(data = pageData)

            elements.forEach { element ->
                renderEngine.render(element, context)
            }
        } finally {
            cb.restoreState()
        }
    }

    private fun renderFooterOptimized(writer: PdfWriter, document: Document, footer: HeaderFooter, pageData: Map<String, Any?>) {
        val cb = writer.directContent
        cb.saveState()

        try {
            val elements = footerAdjustedElements ?: return
            val baseContext = footerContext ?: return
            
            // Create context with page-enriched data (includes pageNumber)
            val context = baseContext.copy(data = pageData)

            elements.forEach { element ->
                renderEngine.render(element, context)
            }
        } finally {
            cb.restoreState()
        }
    }

    private fun renderBodyBackgroundOptimized(writer: PdfWriter, document: Document, bodyBackground: BodyBackground) {
        val elements = bodyBackgroundAdjustedElements ?: return
        val context = bodyBackgroundContext ?: return

        elements.forEach { element ->
            renderEngine.render(element, context)
        }
    }

    private fun adjustElementForHeader(element: Element, document: Document): Element {
        val leftMargin = template.pageSettings.margins.left
        val topMargin = template.pageSettings.margins.top
        val adjustedX = leftMargin + element.x
        val adjustedY = topMargin + element.y

        return when (element) {
            is TextElement -> element.copy(x = adjustedX, y = adjustedY)
            is StaticTextElement -> element.copy(x = adjustedX, y = adjustedY)
            is ImageElement -> element.copy(x = adjustedX, y = adjustedY)
            is RectangleElement -> element.copy(x = adjustedX, y = adjustedY)
            is BarcodeElement -> element.copy(x = adjustedX, y = adjustedY)
            is LineElement -> element.copy(
                x = adjustedX,
                y = adjustedY,
                x2 = adjustedX + (element.x2 - element.x),
                y2 = adjustedY + (element.y2 - element.y)
            )
            else -> element
        }
    }

    private fun adjustElementForFooter(element: Element, document: Document, footer: HeaderFooter): Element {
        val pageHeight = document.pageSize.height
        val leftMargin = template.pageSettings.margins.left
        val bottomMargin = template.pageSettings.margins.bottom
        val footerTopY = pageHeight - bottomMargin - footer.height
        val adjustedX = leftMargin + element.x
        val adjustedY = footerTopY + element.y

        return when (element) {
            is TextElement -> element.copy(x = adjustedX, y = adjustedY)
            is StaticTextElement -> element.copy(x = adjustedX, y = adjustedY)
            is ImageElement -> element.copy(x = adjustedX, y = adjustedY)
            is RectangleElement -> element.copy(x = adjustedX, y = adjustedY)
            is BarcodeElement -> element.copy(x = adjustedX, y = adjustedY)
            is LineElement -> element.copy(
                x = adjustedX,
                y = adjustedY,
                x2 = adjustedX + (element.x2 - element.x),
                y2 = adjustedY + (element.y2 - element.y)
            )
            else -> element
        }
    }

    private fun adjustElementForBackground(element: Element, document: Document): Element {
        val leftMargin = template.pageSettings.margins.left
        val topMargin = template.pageSettings.margins.top
        val adjustedX = leftMargin + element.x
        val adjustedY = topMargin + element.y

        return when (element) {
            is TextElement -> element.copy(x = adjustedX, y = adjustedY)
            is StaticTextElement -> element.copy(x = adjustedX, y = adjustedY)
            is ImageElement -> element.copy(x = adjustedX, y = adjustedY)
            is RectangleElement -> element.copy(x = adjustedX, y = adjustedY)
            is BarcodeElement -> element.copy(x = adjustedX, y = adjustedY)
            is LineElement -> {
                val deltaX = element.x2 - element.x
                val deltaY = element.y2 - element.y
                element.copy(
                    x = adjustedX,
                    y = adjustedY,
                    x2 = adjustedX + deltaX,
                    y2 = adjustedY + deltaY
                )
            }
            else -> element
        }
    }
}

