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

class ContainerRenderer(private val renderEngine: RenderEngine) : Renderer<ContainerElement> {
    override fun render(
        element: ContainerElement,
        context: RenderContext,
    ) {
        // Container is always treated as full-width and relative in body flow.
        val containerX = 0f
        val containerY = element.y
        val containerWidth = context.containerWidth ?: element.width
        val containerHeight = if (element.height > 0f) element.height else (context.containerHeight ?: 0f)

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
                val isFullWidth = element.width.toString() == "100%" || element.width.toString() == "100.0%"
                val isFullHeight = element.height.toString() == "100%" || element.height.toString() == "100.0%"
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
