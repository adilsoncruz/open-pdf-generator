package com.pdfgenerator.adapter.openpdf

import com.lowagie.text.Document
import com.lowagie.text.pdf.BaseFont
import com.lowagie.text.pdf.PdfWriter
import com.pdfgenerator.api.PDFGenerator
import com.pdfgenerator.api.PDFGeneratorConfig
import com.pdfgenerator.engine.RenderContext
import com.pdfgenerator.engine.RenderEngine
import com.pdfgenerator.model.ContainerElement
import com.pdfgenerator.model.Element
import com.pdfgenerator.model.ElementGroup
import com.pdfgenerator.model.PositionMode
import com.pdfgenerator.model.RectangleElement
import com.pdfgenerator.model.Template
import com.pdfgenerator.util.ColorUtil
import com.pdfgenerator.util.ConditionEvaluator
import com.pdfgenerator.util.FontCache

class HeaderFooterSectionRenderer(
    private val template: Template,
    private val data: Map<String, Any?>,
    private val config: PDFGeneratorConfig,
    private val renderEngine: RenderEngine,
) {
    private var headerAdjustedElements: List<Element>? = null
    private var footerAdjustedElements: List<Element>? = null
    private var bodyBackgroundAdjustedElements: List<Element>? = null

    private var headerContext: RenderContext? = null
    private var footerContext: RenderContext? = null
    private var bodyBackgroundContext: RenderContext? = null

    fun initialize(
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

    fun renderHeader(
        writer: PdfWriter,
        pageData: Map<String, Any?>,
    ) {
        renderFlowElements(writer, headerAdjustedElements, headerContext, pageData)
    }

    fun renderFooter(
        writer: PdfWriter,
        pageData: Map<String, Any?>,
    ) {
        renderFlowElements(writer, footerAdjustedElements, footerContext, pageData)
    }

    fun renderBodyBackground(writer: PdfWriter) {
        val elements = bodyBackgroundAdjustedElements ?: return
        val context = bodyBackgroundContext ?: return

        elements.forEach { element ->
            renderEngine.render(element, context)
        }
    }

    private fun renderFlowElements(
        writer: PdfWriter,
        elements: List<Element>?,
        baseContext: RenderContext?,
        pageData: Map<String, Any?>,
    ) {
        val cb = writer.directContent
        cb.saveState()

        try {
            val elementList = elements ?: return
            val contextBase = baseContext ?: return
            val context = contextBase.copy(data = pageData)

            var flowY = 0f
            elementList.forEach { element ->
                val isRelativeFlow = element.positionMode == PositionMode.RELATIVE || element is ContainerElement
                val effectiveY =
                    if (isRelativeFlow) {
                        val isHeightFull =
                            when (element) {
                                is RectangleElement -> element.height?.toString() == "100%" || element.height?.toString() == "100.0%"
                                is ContainerElement -> element.height?.toString() == "100%" || element.height?.toString() == "100.0%"
                                else -> false
                            }
                        val offsetY = if (isHeightFull) 0f else (element.relativeOffsetY ?: 0f)
                        if (flowY == 0f) {
                            if (isHeightFull) {
                                0f
                            } else if (element.y > 0f) {
                                element.y
                            } else {
                                offsetY
                            }
                        } else {
                            flowY + offsetY
                        }
                    } else {
                        element.y
                    }
                val renderContext =
                    if (isRelativeFlow) {
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

    fun renderMarginGuidelines(
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
                cb.showTextAligned(
                    com.lowagie.text.Element.ALIGN_CENTER,
                    topLabel,
                    pageWidth / 2f,
                    pageHeight - (margins.top / 2f) - (fontSize / 2f),
                    0f,
                )
            }

            // Bottom margin label
            if (margins.bottom >= 14f) {
                val bottomLabel = "Bottom Margin: ${margins.bottom.toInt()} pt"
                cb.showTextAligned(
                    com.lowagie.text.Element.ALIGN_CENTER,
                    bottomLabel,
                    pageWidth / 2f,
                    (margins.bottom / 2f) - (fontSize / 2f),
                    0f,
                )
            }

            // Left margin label
            if (margins.left >= 14f) {
                val leftLabel = "Left: ${margins.left.toInt()} pt"
                cb.showTextAligned(com.lowagie.text.Element.ALIGN_CENTER, leftLabel, (margins.left / 2f), pageHeight / 2f, 90f)
            }

            // Right margin label
            if (margins.right >= 14f) {
                val rightLabel = "Right: ${margins.right.toInt()} pt"
                cb.showTextAligned(
                    com.lowagie.text.Element.ALIGN_CENTER,
                    rightLabel,
                    pageWidth - (margins.right / 2f),
                    pageHeight / 2f,
                    -90f,
                )
            }

            // Info badge at the top-left of the usable box
            val badge =
                "Margin Guide [Top: ${margins.top.toInt()}pt, Left: ${margins.left.toInt()}pt, " +
                    "Right: ${margins.right.toInt()}pt, Bottom: ${margins.bottom.toInt()}pt | " +
                    "Usable Area: ${width.toInt()}x${height.toInt()} pt]"
            cb.showTextAligned(com.lowagie.text.Element.ALIGN_LEFT, badge, x + 2, pageHeight - margins.top + 2, 0f)

            cb.endText()
        } finally {
            cb.restoreState()
        }
    }

    private fun shouldRenderElement(
        element: Element,
        groups: List<ElementGroup>?,
    ): Boolean {
        if (groups.isNullOrEmpty()) return true
        val group = groups.find { it.elementIds.contains(element.id) } ?: return true
        return ConditionEvaluator.evaluate(group.printCondition, data)
    }
}
