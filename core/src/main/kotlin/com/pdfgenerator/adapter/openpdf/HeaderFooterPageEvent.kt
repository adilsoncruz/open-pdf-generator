package com.pdfgenerator.adapter.openpdf

import com.lowagie.text.Document
import com.lowagie.text.pdf.BaseFont
import com.lowagie.text.pdf.PdfGState
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
import com.pdfgenerator.model.WatermarkConfig
import com.pdfgenerator.model.WatermarkType
import com.pdfgenerator.util.ColorUtil
import com.pdfgenerator.util.ConditionEvaluator
import com.pdfgenerator.util.DataBindingResolver
import com.pdfgenerator.util.ExpressionProcessor
import com.pdfgenerator.util.FontCache
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

            template.pageSettings.watermark?.let { watermark ->
                val watermarkCondition = watermark.printCondition
                if (watermarkCondition == null || ConditionEvaluator.evaluate(watermarkCondition, pageData, null)) {
                    renderWatermark(writer, document, watermark, pageData)
                }
            }
        } catch (e: Exception) {
            logger.error("Error rendering body background or watermark: ${e.message}", e)
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
                    .map { adjustElementForHeader(it, document) }

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
                )
        }

        template.pageSettings.footer?.let { footer ->
            footerAdjustedElements =
                footer.elements
                    .filter { shouldRenderElement(it, footer.groups) }
                    .map { adjustElementForFooter(it, document, footer) }

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
                )
        }

        template.pageSettings.bodyBackground?.let { bodyBackground ->
            val containerHeight = document.pageSize.height - margins.top - margins.bottom

            bodyBackgroundAdjustedElements =
                bodyBackground.elements
                    .filter { shouldRenderElement(it, bodyBackground.groups) }
                    .map { adjustElementForBackground(it, document) }

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

    private fun adjustElementForHeader(
        element: Element,
        document: Document,
    ): Element {
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
            is LineElement -> element.copy(x = adjustedX, y = adjustedY)
            else -> element
        }
    }

    private fun adjustElementForFooter(
        element: Element,
        document: Document,
        footer: HeaderFooter,
    ): Element {
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
            is LineElement -> element.copy(x = adjustedX, y = adjustedY)
            else -> element
        }
    }

    private fun adjustElementForBackground(
        element: Element,
        document: Document,
    ): Element {
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
            is LineElement -> element.copy(x = adjustedX, y = adjustedY)
            else -> element
        }
    }

    private fun renderWatermark(
        writer: PdfWriter,
        document: Document,
        watermark: WatermarkConfig,
        pageData: Map<String, Any?>,
    ) {
        val cb = if (watermark.onTop) writer.directContent else writer.directContentUnder
        cb.saveState()

        try {
            val gState = PdfGState()
            val opacity = watermark.opacity.coerceIn(0f, 1f)
            gState.setFillOpacity(opacity)
            gState.setStrokeOpacity(opacity)
            cb.setGState(gState)

            val pageWidth = document.pageSize.width
            val pageHeight = document.pageSize.height
            val centerX = pageWidth / 2f
            val centerY = pageHeight / 2f

            when (watermark.type) {
                WatermarkType.TEXT -> {
                    val rawText =
                        watermark.dataBinding?.let { binding ->
                            if (ExpressionProcessor.hasTransformations(binding)) {
                                ExpressionProcessor.process(binding, pageData)
                            } else {
                                DataBindingResolver.resolve(binding, pageData)?.toString()
                            }
                        } ?: watermark.text

                    if (!rawText.isNullOrBlank()) {
                        val isBold = watermark.fontStyle.contains("bold", ignoreCase = true)
                        val isItalic = watermark.fontStyle.contains("italic", ignoreCase = true)
                        val familyLower = watermark.fontName.lowercase()
                        val baseFontName =
                            when {
                                familyLower.contains("times") ->
                                    when {
                                        isBold && isItalic -> BaseFont.TIMES_BOLDITALIC
                                        isBold -> BaseFont.TIMES_BOLD
                                        isItalic -> BaseFont.TIMES_ITALIC
                                        else -> BaseFont.TIMES_ROMAN
                                    }
                                familyLower.contains("courier") ->
                                    when {
                                        isBold && isItalic -> BaseFont.COURIER_BOLDOBLIQUE
                                        isBold -> BaseFont.COURIER_BOLD
                                        isItalic -> BaseFont.COURIER_OBLIQUE
                                        else -> BaseFont.COURIER
                                    }
                                else ->
                                    when {
                                        isBold && isItalic -> BaseFont.HELVETICA_BOLDOBLIQUE
                                        isBold -> BaseFont.HELVETICA_BOLD
                                        isItalic -> BaseFont.HELVETICA_OBLIQUE
                                        else -> BaseFont.HELVETICA
                                    }
                            }
                        val baseFont = FontCache.getFont(baseFontName)
                        val color = ColorUtil.hexToColor(watermark.color)

                        cb.beginText()
                        cb.setFontAndSize(baseFont, watermark.fontSize)
                        cb.setColorFill(color)
                        cb.showTextAligned(
                            com.lowagie.text.Element.ALIGN_CENTER,
                            rawText,
                            centerX,
                            centerY,
                            watermark.rotation,
                        )
                        cb.endText()
                    }
                }
                WatermarkType.IMAGE -> {
                    val source = watermark.imageSource
                    if (!source.isNullOrBlank()) {
                        val image = renderEngine.loadImage(source)
                        val w = watermark.width ?: image.width
                        val h = watermark.height ?: image.height
                        image.scaleToFit(w, h)
                        image.setRotationDegrees(watermark.rotation)
                        val scaledW = image.scaledWidth
                        val scaledH = image.scaledHeight
                        image.setAbsolutePosition(centerX - (scaledW / 2f), centerY - (scaledH / 2f))
                        cb.addImage(image)
                    }
                }
            }
        } catch (e: Exception) {
            logger.error("Error rendering watermark: ${e.message}", e)
            if (config.strictMode) {
                throw e
            }
        } finally {
            cb.restoreState()
        }
    }
}
