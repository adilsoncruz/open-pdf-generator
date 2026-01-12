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
        val y1Position = pageHeight - element.y
        val y2Position = pageHeight - element.y2

        cb.saveState()

        val style = element.style
        val color = style?.getEffectiveColor() ?: "#000000"
        val width = style?.getEffectiveWidth() ?: 1f

        cb.setColorStroke(ColorUtil.hexToColor(color))
        cb.setLineWidth(width)

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
        cb.lineTo(element.x2, y2Position)
        cb.stroke()

        cb.restoreState()
    }
}

