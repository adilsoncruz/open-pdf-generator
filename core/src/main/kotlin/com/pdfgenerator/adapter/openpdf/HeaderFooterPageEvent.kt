package com.pdfgenerator.adapter.openpdf

import com.lowagie.text.Document
import com.lowagie.text.pdf.PdfPageEventHelper
import com.lowagie.text.pdf.PdfWriter
import com.pdfgenerator.api.PDFGeneratorConfig
import com.pdfgenerator.engine.RenderContext
import com.pdfgenerator.engine.RenderEngine
import com.pdfgenerator.model.BarcodeElement
import com.pdfgenerator.model.BodyBackground
import com.pdfgenerator.model.Element
import com.pdfgenerator.model.ElementGroup
import com.pdfgenerator.model.HeaderFooter
import com.pdfgenerator.model.ImageElement
import com.pdfgenerator.model.LineElement
import com.pdfgenerator.model.RectangleElement
import com.pdfgenerator.model.StaticTextElement
import com.pdfgenerator.model.Template
import com.pdfgenerator.model.TextElement
import com.pdfgenerator.util.ConditionEvaluator
import com.pdfgenerator.util.withSyntheticBindings
import org.slf4j.LoggerFactory

class HeaderFooterPageEvent(
    private val template: Template,
    private val data: Map<String, Any?>,
    private val config: PDFGeneratorConfig,
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

    private fun shouldRenderElement(
        element: Element,
        groups: List<ElementGroup>?,
    ): Boolean {
        if (groups.isNullOrEmpty()) return true
        val group = groups.find { it.elementIds.contains(element.id) } ?: return true
        return ConditionEvaluator.evaluate(group.printCondition, data)
    }

    override fun onStartPage(
        writer: PdfWriter,
        document: Document,
    ) {
        try {
            if (!initialized) {
                initializeTemplates(writer, document)
                initialized = true
            }

            val pageData =
                withSyntheticBindings(
                    data,
                    mapOf(
                        "_pageNumber" to writer.pageNumber,
                        "_date" to java.time.LocalDate.now().toString(),
                        "_dateTime" to java.time.LocalDateTime.now().toString(),
                    ),
                )

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

    override fun onEndPage(
        writer: PdfWriter,
        document: Document,
    ) {
        try {
            val pageData =
                withSyntheticBindings(
                    data,
                    mapOf(
                        "_pageNumber" to writer.pageNumber,
                        "_date" to java.time.LocalDate.now().toString(),
                        "_dateTime" to java.time.LocalDateTime.now().toString(),
                    ),
                )

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

    private fun initializeTemplates(
        writer: PdfWriter,
        document: Document,
    ) {
        val margins = template.pageSettings.margins
        val containerWidth = document.pageSize.width - margins.left - margins.right

        template.pageSettings.header?.let { header ->
            headerAdjustedElements =
                header.elements
                    .filter { shouldRenderElement(it, header.groups) }

            headerContext =
                RenderContext(
                    document = document,
                    writer = writer,
                    template = template,
                    data = data,
                    config = config,
                    useContentUnder = false,
                    containerWidth = containerWidth,
                    containerHeight = header.height,
                    offsetX = margins.left,
                    offsetY = margins.top,
                )
        }

        template.pageSettings.footer?.let { footer ->
            val pageHeight = document.pageSize.height
            val footerTopY = pageHeight - margins.bottom - footer.height

            footerAdjustedElements =
                footer.elements
                    .filter { shouldRenderElement(it, footer.groups) }

            footerContext =
                RenderContext(
                    document = document,
                    writer = writer,
                    template = template,
                    data = data,
                    config = config,
                    useContentUnder = false,
                    containerWidth = containerWidth,
                    containerHeight = footer.height,
                    offsetX = margins.left,
                    offsetY = footerTopY,
                )
        }

        template.pageSettings.bodyBackground?.let { bodyBackground ->
            val containerHeight = document.pageSize.height - margins.top - margins.bottom

            bodyBackgroundAdjustedElements =
                bodyBackground.elements
                    .filter { shouldRenderElement(it, bodyBackground.groups) }

            bodyBackgroundContext =
                RenderContext(
                    document = document,
                    writer = writer,
                    template = template,
                    data = data,
                    config = config,
                    useContentUnder = true,
                    containerWidth = containerWidth,
                    containerHeight = containerHeight,
                    offsetX = margins.left,
                    offsetY = margins.top,
                )
        }
    }

    private fun renderHeaderOptimized(
        writer: PdfWriter,
        document: Document,
        header: HeaderFooter,
        pageData: Map<String, Any?>,
    ) {
        val cb = writer.directContent
        cb.saveState()

        try {
            val elements = headerAdjustedElements ?: return
            val baseContext = headerContext ?: return
            val context = baseContext.copy(data = pageData)

            elements.forEach { element ->
                renderEngine.render(element, context)
            }
        } finally {
            cb.restoreState()
        }
    }

    private fun renderFooterOptimized(
        writer: PdfWriter,
        document: Document,
        footer: HeaderFooter,
        pageData: Map<String, Any?>,
    ) {
        val cb = writer.directContent
        cb.saveState()

        try {
            val elements = footerAdjustedElements ?: return
            val baseContext = footerContext ?: return
            val context = baseContext.copy(data = pageData)

            elements.forEach { element ->
                renderEngine.render(element, context)
            }
        } finally {
            cb.restoreState()
        }
    }

    private fun renderBodyBackgroundOptimized(
        writer: PdfWriter,
        document: Document,
        bodyBackground: BodyBackground,
    ) {
        val elements = bodyBackgroundAdjustedElements ?: return
        val context = bodyBackgroundContext ?: return

        elements.forEach { element ->
            renderEngine.render(element, context)
        }
    }
}
