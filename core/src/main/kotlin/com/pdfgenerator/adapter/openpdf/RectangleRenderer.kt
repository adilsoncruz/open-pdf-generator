package com.pdfgenerator.adapter.openpdf

import com.pdfgenerator.engine.RenderContext
import com.pdfgenerator.engine.Renderer
import com.pdfgenerator.model.RectangleElement
import com.pdfgenerator.util.ColorUtil
import com.pdfgenerator.util.ConditionEvaluator

class RectangleRenderer : Renderer<RectangleElement> {
    override fun render(
        element: RectangleElement,
        context: RenderContext,
    ) {
        if (!ConditionEvaluator.evaluate(element.printCondition, context.data, context.loopContext)) {
            return
        }

        val cb =
            if (context.useContentUnder) {
                context.writer.directContentUnder
            } else {
                context.writer.directContent
            }

        val resolvedWidth =
            if (context.containerWidth != null) {
                element.resolveWidth(context.containerWidth)
            } else {
                val margins = context.template.pageSettings.margins
                element.resolveWidth(context.document.pageSize.width - margins.left - margins.right)
            }

        val resolvedHeight =
            if (context.containerHeight != null) {
                element.resolveHeight(context.containerHeight)
            } else {
                val margins = context.template.pageSettings.margins
                element.resolveHeight(context.document.pageSize.height - margins.top - margins.bottom)
            }

        val pageHeight = context.document.pageSize.height
        val x = context.resolveX(element.x)
        val y = context.resolveY(element.y)
        val yPosition = pageHeight - y - resolvedHeight

        cb.saveState()

        element.style?.fillColor?.let { fillColor ->
            cb.setColorFill(ColorUtil.hexToColor(fillColor))

            if (element.style.cornerRadius > 0) {
                cb.roundRectangle(
                    x,
                    yPosition,
                    resolvedWidth,
                    resolvedHeight,
                    element.style.cornerRadius,
                )
                cb.fill()
            } else {
                cb.rectangle(x, yPosition, resolvedWidth, resolvedHeight)
                cb.fill()
            }
        }

        element.style?.let { style ->
            if (style.shouldDrawBorder()) {
                val borderColor = style.getEffectiveBorderColor() ?: "#000000"
                cb.setColorStroke(ColorUtil.hexToColor(borderColor))
                cb.setLineWidth(style.borderWidth)

                when (style.getEffectivePenStyle()?.lowercase()) {
                    "dashed" -> cb.setLineDash(floatArrayOf(6f, 3f), 0f)
                    "dotted" -> cb.setLineDash(floatArrayOf(1f, 2f), 0f)
                    else -> { }
                }

                if (style.cornerRadius > 0) {
                    cb.roundRectangle(
                        x,
                        yPosition,
                        resolvedWidth,
                        resolvedHeight,
                        style.cornerRadius,
                    )
                    cb.stroke()
                } else {
                    cb.rectangle(x, yPosition, resolvedWidth, resolvedHeight)
                    cb.stroke()
                }
            }
        }

        cb.restoreState()
    }
}
