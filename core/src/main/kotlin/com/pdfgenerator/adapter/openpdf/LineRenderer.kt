package com.pdfgenerator.adapter.openpdf

import com.pdfgenerator.engine.RenderContext
import com.pdfgenerator.engine.Renderer
import com.pdfgenerator.model.LineElement
import com.pdfgenerator.util.ColorUtil
import com.pdfgenerator.util.ConditionEvaluator
import org.slf4j.LoggerFactory

class LineRenderer : Renderer<LineElement> {
    private val logger = LoggerFactory.getLogger(LineRenderer::class.java)

    override fun render(element: LineElement, context: RenderContext) {
        if (!ConditionEvaluator.evaluate(element.printCondition, context.data, context.loopContext)) {
            return
        }

        val cb = if (context.useContentUnder) {
            context.writer.directContentUnder
        } else {
            context.writer.directContent
        }

        val pageHeight = context.document.pageSize.height
        val pageWidth = context.document.pageSize.width
        val margins = context.template.pageSettings.margins
        
        // Get container dimensions for resolving "100%"
        val containerWidth = context.containerWidth ?: (pageWidth - margins.left - margins.right)
        val containerHeight = context.containerHeight ?: (pageHeight - margins.top - margins.bottom)
        
        // Resolve width and height first
        val resolvedWidth = element.resolveWidth(containerWidth)
        val resolvedHeight = element.resolveHeight(containerHeight)
        
        // Calculate end coordinates: start position + resolved dimensions
        val endX = element.x + resolvedWidth
        val endY = element.y + resolvedHeight
        
        logger.debug("LineRenderer - id: ${element.id}, x: ${element.x}, y: ${element.y}")
        logger.debug("LineRenderer - width raw: ${element.width}, height raw: ${element.height}")
        logger.debug("LineRenderer - containerWidth: $containerWidth, containerHeight: $containerHeight")
        logger.debug("LineRenderer - resolvedWidth: $resolvedWidth, resolvedHeight: $resolvedHeight")
        logger.debug("LineRenderer - endX: $endX, endY: $endY")
        
        val y1Position = pageHeight - element.y
        val y2Position = pageHeight - endY

        cb.saveState()

        val style = element.style
        val color = style?.getEffectiveColor() ?: "#000000"
        val strokeWidth = style?.getEffectiveWidth() ?: 1f

        cb.setColorStroke(ColorUtil.hexToColor(color))
        cb.setLineWidth(strokeWidth)

        when (style?.getEffectivePenStyle()?.lowercase()) {
            "dashed" -> cb.setLineDash(floatArrayOf(6f, 3f), 0f)
            "dotted" -> cb.setLineDash(floatArrayOf(1f, 2f), 0f)
            else -> {
                style?.dashPattern?.let { pattern ->
                    cb.setLineDash(pattern.toFloatArray(), 0f)
                }
            }
        }

        cb.moveTo(element.x, y1Position)
        cb.lineTo(endX, y2Position)
        cb.stroke()

        cb.restoreState()
    }
}

