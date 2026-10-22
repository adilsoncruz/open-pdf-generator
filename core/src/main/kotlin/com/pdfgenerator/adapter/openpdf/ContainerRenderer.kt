package com.pdfgenerator.adapter.openpdf

import com.pdfgenerator.engine.RenderContext
import com.pdfgenerator.engine.RenderEngine
import com.pdfgenerator.engine.Renderer
import com.pdfgenerator.model.BarcodeElement
import com.pdfgenerator.model.ContainerElement
import com.pdfgenerator.model.Element
import com.pdfgenerator.model.ImageElement
import com.pdfgenerator.model.LineElement
import com.pdfgenerator.model.LoopElement
import com.pdfgenerator.model.RectangleElement
import com.pdfgenerator.model.StaticTextElement
import com.pdfgenerator.model.TableElement
import com.pdfgenerator.model.TextElement
import com.pdfgenerator.util.ColorUtil
import com.pdfgenerator.util.ConditionEvaluator

class ContainerRenderer(private val renderEngine: RenderEngine) : Renderer<ContainerElement> {
    override fun render(
        element: ContainerElement,
        context: RenderContext,
    ) {
        if (!ConditionEvaluator.evaluate(element.printCondition, context.data, context.loopContext)) {
            return
        }

        // Container is always treated as full-width and relative in body flow.
        val containerX = 0f
        val containerY = element.y
        val containerWidth = context.containerWidth ?: element.resolveWidth(595.28f)
        val resolvedHeight = element.resolveHeight(context.containerHeight ?: 0f)
        val baseHeight = if (resolvedHeight > 0f) resolvedHeight else (context.containerHeight ?: 0f)
        val maxAvailableHeight =
            (context.document.pageSize.height - context.resolveY(containerY) - context.document.bottomMargin()).coerceAtLeast(10f)
        val containerHeight = if (element.isAutoHeight()) {
            val contentHeight = element.elements.maxOfOrNull { child ->
                val chH = when (child) {
                    is com.pdfgenerator.model.TextElement -> child.height ?: (child.style?.fontSize ?: 12f)
                    is com.pdfgenerator.model.StaticTextElement -> child.height ?: (child.style?.fontSize ?: 12f)
                    is com.pdfgenerator.model.RichTextElement -> child.height ?: (child.style?.fontSize ?: 12f)
                    is com.pdfgenerator.model.ImageElement -> child.height
                    is com.pdfgenerator.model.RectangleElement -> if (child.height is Number) (child.height as Number).toFloat() else 25f
                    is com.pdfgenerator.model.LineElement -> 1f
                    is com.pdfgenerator.model.BarcodeElement -> child.height
                    else -> 25f
                }
                child.y + chH
            } ?: 0f
            kotlin.math.min(kotlin.math.max(baseHeight, contentHeight), maxAvailableHeight)
        } else {
            kotlin.math.min(baseHeight, maxAvailableHeight)
        }

        element.style?.let { style ->
            val cb =
                if (context.useContentUnder) {
                    context.writer.directContentUnder
                } else {
                    context.writer.directContent
                }
            val pageHeight = context.document.pageSize.height
            val x = context.resolveX(containerX)
            val y = context.resolveY(containerY)
            val yPosition = pageHeight - y - containerHeight

            cb.saveState()

            val fillColor = style.getEffectiveFillColor()
            if (!fillColor.isNullOrBlank() && !fillColor.equals("transparent", ignoreCase = true)) {
                cb.setColorFill(ColorUtil.hexToColor(fillColor))
                if (style.cornerRadius > 0) {
                    cb.roundRectangle(x, yPosition, containerWidth, containerHeight, style.cornerRadius)
                } else {
                    cb.rectangle(x, yPosition, containerWidth, containerHeight)
                }
                cb.fill()
            }

            val hasExplicitBorder =
                style.getEffectivePenStyle()?.lowercase() != "none" &&
                    (style.borderColor != null || style.strokeColor != null || (style.strokeWidth ?: 0f) > 0f)
            if (hasExplicitBorder) {
                val borderColor = style.getEffectiveBorderColor() ?: "#000000"
                val borderWidth = if (style.getEffectiveBorderWidth() > 0f) style.getEffectiveBorderWidth() else 1f
                cb.setColorStroke(ColorUtil.hexToColor(borderColor))
                cb.setLineWidth(borderWidth)

                when (style.getEffectivePenStyle()?.lowercase()) {
                    "dashed" -> cb.setLineDash(floatArrayOf(6f, 3f), 0f)
                    "dotted" -> cb.setLineDash(floatArrayOf(1f, 2f), 0f)
                    else -> {}
                }

                if (style.cornerRadius > 0) {
                    cb.roundRectangle(x, yPosition, containerWidth, containerHeight, style.cornerRadius)
                } else {
                    cb.rectangle(x, yPosition, containerWidth, containerHeight)
                }
                cb.stroke()
            }

            cb.restoreState()
        }

        element.elements.forEach { childElement ->
            val adjustedElement =
                adjustElementPosition(
                    element = childElement,
                    containerX = containerX,
                    containerY = containerY,
                    containerWidth = containerWidth,
                    containerHeight = containerHeight,
                )

            val childContext =
                if (childElement is LoopElement) {
                    context.copy(containerWidth = containerWidth, containerHeight = context.containerHeight)
                } else {
                    context.copy(containerWidth = containerWidth, containerHeight = containerHeight)
                }

            renderEngine.render(adjustedElement, childContext)
        }
    }

    private fun adjustElementPosition(
        element: Element,
        containerX: Float,
        containerY: Float,
        containerWidth: Float,
        containerHeight: Float,
    ): Element {
        return when (element) {
            is TextElement ->
                element.copy(
                    x = containerX + element.x,
                    y = containerY + element.y,
                    width = resolveWidth(element.width, containerWidth),
                )
            is StaticTextElement ->
                element.copy(
                    x = containerX + element.x,
                    y = containerY + element.y,
                    width = resolveWidth(element.width, containerWidth),
                )
            is ImageElement ->
                element.copy(
                    x = containerX + element.x,
                    y = containerY + element.y,
                    width = resolveFloatDimension(element.width, containerWidth),
                    height = resolveFloatDimension(element.height, containerHeight),
                )
            is TableElement -> element.copy(x = containerX + element.x, y = containerY + element.y)
            is RectangleElement -> {
                val isFullWidth = element.width?.toString() == "100%" || element.width?.toString() == "100.0%"
                val isFullHeight = element.height?.toString() == "100%" || element.height?.toString() == "100.0%"
                element.copy(
                    x = if (isFullWidth) containerX else containerX + element.x,
                    y = if (isFullHeight) containerY else containerY + element.y,
                    width = resolveDimension(element.width, containerWidth),
                    height = resolveDimension(element.height, containerHeight),
                )
            }
            is LineElement ->
                element.copy(
                    x = containerX + element.x,
                    y = containerY + element.y,
                    width = element.resolveWidth(containerWidth),
                    height = element.resolveHeight(containerHeight),
                )
            is BarcodeElement ->
                element.copy(
                    x = containerX + element.x,
                    y = containerY + element.y,
                )
            is LoopElement ->
                element.copy(
                    x = containerX + element.x,
                    y = containerY + element.y,
                )
            is ContainerElement ->
                element.copy(
                    x = containerX + element.x,
                    y = containerY + element.y,
                )
            else -> element
        }
    }

    private fun resolveDimension(
        value: Any?,
        containerDimension: Float,
    ): Any {
        return when (value) {
            is Number -> value.toFloat()
            is String -> {
                if (value.endsWith("%")) {
                    val percentage = value.removeSuffix("%").toFloatOrNull() ?: 100f
                    containerDimension * (percentage / 100f)
                } else {
                    value.toFloatOrNull() ?: value
                }
            }

            null -> containerDimension
            else -> value
        }
    }

    private fun resolveFloatDimension(
        value: Float,
        containerDimension: Float,
    ): Float {
        return if (value == -1f) containerDimension else value
    }

    private fun resolveWidth(
        value: Float?,
        containerWidth: Float,
    ): Float? {
        return if (value == null) {
            null
        } else if (value.toString().endsWith("%") || value == -1f) {
            containerWidth
        } else {
            value
        }
    }
}
