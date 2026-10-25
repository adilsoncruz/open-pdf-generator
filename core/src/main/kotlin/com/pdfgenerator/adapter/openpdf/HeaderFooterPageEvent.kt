package com.pdfgenerator.adapter.openpdf

import com.lowagie.text.Document
import com.lowagie.text.pdf.BaseFont
import com.lowagie.text.pdf.PdfGState
import com.lowagie.text.pdf.PdfPageEventHelper
import com.lowagie.text.pdf.PdfWriter
import com.pdfgenerator.api.PDFGenerator
import com.pdfgenerator.api.PDFGeneratorConfig
import com.pdfgenerator.engine.RenderContext
import com.pdfgenerator.engine.RenderEngine
import com.pdfgenerator.model.BodyBackground
import com.pdfgenerator.model.ContainerElement
import com.pdfgenerator.model.Element
import com.pdfgenerator.model.ElementGroup
import com.pdfgenerator.model.HeaderFooter
import com.pdfgenerator.model.PositionMode
import com.pdfgenerator.model.RectangleElement
import com.pdfgenerator.model.Template
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
                        "pageNumber" to writer.pageNumber,
                        "page" to writer.pageNumber,
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
                if (!watermark.onTop) {
                    val watermarkCondition = watermark.printCondition
                    if (watermarkCondition == null || ConditionEvaluator.evaluate(watermarkCondition, pageData, null)) {
                        renderWatermark(writer, document, watermark, pageData)
                    }
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
                        "pageNumber" to writer.pageNumber,
                        "page" to writer.pageNumber,
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

            template.pageSettings.watermark?.let { watermark ->
                if (watermark.onTop) {
                    val watermarkCondition = watermark.printCondition
                    if (watermarkCondition == null || ConditionEvaluator.evaluate(watermarkCondition, pageData, null)) {
                        renderWatermark(writer, document, watermark, pageData)
                    }
                }
            }

            if (template.pageSettings.showMargins || config.showMargins) {
                drawMarginGuidelines(writer, document)
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

            var flowY = 0f
            elements.forEach { element ->
                val isRelativeFlow = element.positionMode == PositionMode.RELATIVE || element is ContainerElement
                val effectiveY = if (isRelativeFlow) {
                    val isHeightFull = when (element) {
                        is RectangleElement -> element.height?.toString() == "100%" || element.height?.toString() == "100.0%"
                        is ContainerElement -> element.height?.toString() == "100%" || element.height?.toString() == "100.0%"
                        else -> false
                    }
                    val offsetY = if (isHeightFull) 0f else (element.relativeOffsetY ?: 0f)
                    if (flowY == 0f) {
                        if (isHeightFull) 0f else if (element.y > 0f) element.y else offsetY
                    } else {
                        flowY + offsetY
                    }
                } else {
                    element.y
                }
                val renderContext = if (isRelativeFlow) {
                    context.copy(offsetY = context.offsetY + (effectiveY - element.y))
                } else {
                    context
                }
                renderEngine.render(element, renderContext)
                val elementHeight = PDFGenerator.getElementHeight(element, pageData, renderContext)
                if (isRelativeFlow) {
                    flowY = effectiveY + elementHeight
                } else {
                    flowY = kotlin.math.max(flowY, element.y + elementHeight)
                }
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

            var flowY = 0f
            elements.forEach { element ->
                val isRelativeFlow = element.positionMode == PositionMode.RELATIVE || element is ContainerElement
                val effectiveY = if (isRelativeFlow) {
                    val isHeightFull = when (element) {
                        is RectangleElement -> element.height?.toString() == "100%" || element.height?.toString() == "100.0%"
                        is ContainerElement -> element.height?.toString() == "100%" || element.height?.toString() == "100.0%"
                        else -> false
                    }
                    val offsetY = if (isHeightFull) 0f else (element.relativeOffsetY ?: 0f)
                    if (flowY == 0f) {
                        if (isHeightFull) 0f else if (element.y > 0f) element.y else offsetY
                    } else {
                        flowY + offsetY
                    }
                } else {
                    element.y
                }
                val renderContext = if (isRelativeFlow) {
                    context.copy(offsetY = context.offsetY + (effectiveY - element.y))
                } else {
                    context
                }
                renderEngine.render(element, renderContext)
                val elementHeight = PDFGenerator.getElementHeight(element, pageData, renderContext)
                if (isRelativeFlow) {
                    flowY = effectiveY + elementHeight
                } else {
                    flowY = kotlin.math.max(flowY, element.y + elementHeight)
                }
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
                            if (ExpressionProcessor.containsTemplateExpression(binding)) {
                                ExpressionProcessor.processTemplate(binding, pageData)
                            } else if (ExpressionProcessor.hasTransformations(binding)) {
                                ExpressionProcessor.process(binding, pageData)
                            } else {
                                DataBindingResolver.resolve(binding, pageData)?.toString()
                            }
                        } ?: watermark.text?.let { text ->
                            if (ExpressionProcessor.containsTemplateExpression(text)) {
                                ExpressionProcessor.processTemplate(text, pageData)
                            } else {
                                text
                            }
                        }

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
                        val baseColor = ColorUtil.hexToColor(watermark.color)
                        val alphaInt = (opacity * 255f).toInt().coerceIn(0, 255)
                        val colorWithAlpha = java.awt.Color(baseColor.red, baseColor.green, baseColor.blue, alphaInt)

                        cb.setColorFill(colorWithAlpha)
                        cb.setGState(gState)

                        cb.beginText()
                        cb.setFontAndSize(baseFont, watermark.fontSize)

                        if (watermark.repeat) {
                            val estimatedTextWidth = watermark.fontSize * (rawText.length * 0.6f)
                            val defaultStepX = (estimatedTextWidth * 1.5f).coerceIn(160f, 320f)
                            val defaultStepY = (watermark.fontSize * 3.5f).coerceIn(120f, 260f)
                            val stepX = watermark.spacingX ?: defaultStepX
                            val stepY = watermark.spacingY ?: defaultStepY

                            var rowIndex = 0
                            var y = -stepY / 2f
                            while (y <= pageHeight + stepY) {
                                val offsetX = if (rowIndex % 2 != 0) stepX / 2f else 0f
                                var x = -stepX / 2f + offsetX
                                while (x <= pageWidth + stepX) {
                                    cb.showTextAligned(
                                        com.lowagie.text.Element.ALIGN_CENTER,
                                        rawText,
                                        x,
                                        y,
                                        watermark.rotation,
                                    )
                                    x += stepX
                                }
                                y += stepY
                                rowIndex++
                            }
                        } else {
                            cb.showTextAligned(
                                com.lowagie.text.Element.ALIGN_CENTER,
                                rawText,
                                centerX,
                                centerY,
                                watermark.rotation,
                            )
                        }
                        cb.endText()
                    }
                }
                WatermarkType.IMAGE -> {
                    val source = watermark.imageSource
                    if (!source.isNullOrBlank()) {
                        val image = renderEngine.loadImage(source)
                        val imgW = image.width.coerceAtLeast(1f)
                        val imgH = image.height.coerceAtLeast(1f)
                        val rawW = watermark.width?.takeIf { it > 0f }
                        val rawH = watermark.height?.takeIf { it > 0f }

                        val (targetW, targetH) = when {
                            rawW != null && rawH != null -> rawW to rawH
                            rawW != null -> rawW to (imgH * (rawW / imgW))
                            rawH != null -> (imgW * (rawH / imgH)) to rawH
                            watermark.repeat -> {
                                val defaultSize = (pageWidth * 0.25f).coerceIn(80f, 180f)
                                defaultSize to (imgH * (defaultSize / imgW))
                            }
                            else -> {
                                val maxW = pageWidth * 0.7f
                                val maxH = pageHeight * 0.7f
                                val scale = minOf(maxW / imgW, maxH / imgH, 1f)
                                (imgW * scale) to (imgH * scale)
                            }
                        }
                        image.scaleToFit(targetW.coerceAtLeast(1f), targetH.coerceAtLeast(1f))
                        image.setRotationDegrees(watermark.rotation)
                        val scaledW = image.scaledWidth
                        val scaledH = image.scaledHeight

                        if (watermark.repeat) {
                            val defaultStepX = (scaledW * 1.8f).coerceAtLeast(40f)
                            val defaultStepY = (scaledH * 1.8f).coerceAtLeast(40f)
                            val stepX = watermark.spacingX ?: defaultStepX
                            val stepY = watermark.spacingY ?: defaultStepY

                            var rowIndex = 0
                            var y = -stepY / 2f
                            while (y <= pageHeight + stepY) {
                                val offsetX = if (rowIndex % 2 != 0) stepX / 2f else 0f
                                var x = -stepX / 2f + offsetX
                                while (x <= pageWidth + stepX) {
                                    val imgCopy = com.lowagie.text.Image.getInstance(image)
                                    imgCopy.setAbsolutePosition(x - (scaledW / 2f), y - (scaledH / 2f))
                                    cb.addImage(imgCopy)
                                    x += stepX
                                }
                                y += stepY
                                rowIndex++
                            }
                        } else {
                            image.setAbsolutePosition(centerX - (scaledW / 2f), centerY - (scaledH / 2f))
                            cb.addImage(image)
                        }
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

    private fun drawMarginGuidelines(
        writer: PdfWriter,
        document: Document,
    ) {
        val cb = writer.directContent
        cb.saveState()
        try {
            val pageWidth = document.pageSize.width
            val pageHeight = document.pageSize.height
            val margins = template.pageSettings.margins

            val x = margins.left
            val y = margins.bottom
            val width = pageWidth - margins.left - margins.right
            val height = pageHeight - margins.top - margins.bottom

            // 1. Draw dashed bounding box of printable area
            cb.setColorStroke(ColorUtil.hexToColor("#94a3b8"))
            cb.setLineWidth(0.5f)
            cb.setLineDash(floatArrayOf(3f, 3f), 0f)
            cb.rectangle(x, y, width, height)
            cb.stroke()

            // 2. Draw margin dimension labels
            val font = FontCache.getFont(BaseFont.HELVETICA)
            val fontSize = 7f
            cb.setColorFill(ColorUtil.hexToColor("#64748b"))

            cb.beginText()
            cb.setFontAndSize(font, fontSize)

            // Top margin label
            if (margins.top >= 14f) {
                val topLabel = "Top Margin: ${margins.top.toInt()} pt"
                cb.showTextAligned(com.lowagie.text.Element.ALIGN_CENTER, topLabel, pageWidth / 2f, pageHeight - (margins.top / 2f) - (fontSize / 2f), 0f)
            }

            // Bottom margin label
            if (margins.bottom >= 14f) {
                val bottomLabel = "Bottom Margin: ${margins.bottom.toInt()} pt"
                cb.showTextAligned(com.lowagie.text.Element.ALIGN_CENTER, bottomLabel, pageWidth / 2f, (margins.bottom / 2f) - (fontSize / 2f), 0f)
            }

            // Left margin label
            if (margins.left >= 14f) {
                val leftLabel = "Left: ${margins.left.toInt()} pt"
                cb.showTextAligned(com.lowagie.text.Element.ALIGN_CENTER, leftLabel, (margins.left / 2f), pageHeight / 2f, 90f)
            }

            // Right margin label
            if (margins.right >= 14f) {
                val rightLabel = "Right: ${margins.right.toInt()} pt"
                cb.showTextAligned(com.lowagie.text.Element.ALIGN_CENTER, rightLabel, pageWidth - (margins.right / 2f), pageHeight / 2f, -90f)
            }

            // Info badge at the top-left of the usable box
            val badge = "Margin Guide [Top: ${margins.top.toInt()}pt, Left: ${margins.left.toInt()}pt, Right: ${margins.right.toInt()}pt, Bottom: ${margins.bottom.toInt()}pt | Usable Area: ${width.toInt()}x${height.toInt()} pt]"
            cb.showTextAligned(com.lowagie.text.Element.ALIGN_LEFT, badge, x + 2, pageHeight - margins.top + 2, 0f)

            cb.endText()
        } finally {
            cb.restoreState()
        }
    }
}
