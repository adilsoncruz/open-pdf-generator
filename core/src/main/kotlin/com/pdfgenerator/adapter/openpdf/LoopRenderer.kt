package com.pdfgenerator.adapter.openpdf

import com.pdfgenerator.engine.LoopContext
import com.pdfgenerator.engine.RenderContext
import com.pdfgenerator.engine.RenderEngine
import com.pdfgenerator.engine.Renderer
import com.pdfgenerator.model.BarcodeElement
import com.pdfgenerator.model.Element
import com.pdfgenerator.model.ImageElement
import com.pdfgenerator.model.LineElement
import com.pdfgenerator.model.LoopElement
import com.pdfgenerator.model.RectangleElement
import com.pdfgenerator.model.StaticTextElement
import com.pdfgenerator.model.TableElement
import com.pdfgenerator.model.TextElement
import com.pdfgenerator.util.DataBindingResolver
import org.slf4j.LoggerFactory

class LoopRenderer(private val renderEngine: RenderEngine) : Renderer<LoopElement> {
    private val logger = LoggerFactory.getLogger(LoopRenderer::class.java)

    override fun render(
        element: LoopElement,
        context: RenderContext,
    ) {
        val loopData = DataBindingResolver.resolve(element.dataBinding, context.data, context.loopContext)

        if (loopData !is List<*>) {
            logger.warn("Data binding ${element.dataBinding} did not return a list for loop ${element.id}")
            return
        }

        if (loopData.isEmpty()) {
            return
        }

        val loopX = element.x
        val loopStartY = element.startY ?: element.y

        val loopWidth = element.width
        val loopHeight = element.height

        val itemHeight = calculateItemHeight(element.elements, loopWidth, loopHeight)

        val pageHeight = context.document.pageSize.height
        val margins = context.template.pageSettings.margins
        val headerHeight = context.template.pageSettings.header?.height ?: 0f
        val footerHeight = context.template.pageSettings.footer?.height ?: 0f

        val contentAreaTop = margins.top + headerHeight
        val contentAreaBottom = pageHeight - margins.bottom - footerHeight
        val availableContentHeight = contentAreaBottom - contentAreaTop

        val maxYInTemplate = availableContentHeight

        var currentY = loopStartY
        var itemsRenderedOnCurrentPage = 0

        loopData.forEachIndexed { index, item ->
            val itemEndY = currentY + itemHeight

            if (itemEndY > maxYInTemplate && itemsRenderedOnCurrentPage > 0) {
                context.document.newPage()
                currentY = loopStartY
                itemsRenderedOnCurrentPage = 0
            }

            val loopContext = LoopContext(item, index)
            val newContext = context.copy(loopContext = loopContext)

            element.elements.forEach { childElement ->
                val adjustedElement = adjustElementPosition(childElement, loopX, currentY, loopWidth, itemHeight)
                renderEngine.render(adjustedElement, newContext)
            }

            itemsRenderedOnCurrentPage++
            currentY += itemHeight + element.itemSpacing
        }

        context.renderState?.let { state ->
            val finalYAbsolute = currentY - element.itemSpacing
            val finalYRelative = finalYAbsolute - context.bodyOffsetY
            state.currentY = finalYRelative
        }
    }

    private fun calculateItemHeight(
        elements: List<Element>,
        loopWidth: Float,
        loopHeight: Float,
    ): Float {
        if (elements.isEmpty()) return 0f

        return elements.maxOfOrNull { element ->
            val y = element.y
            val height =
                when (element) {
                    is TextElement -> element.height ?: 20f
                    is StaticTextElement -> element.height ?: 20f
                    is ImageElement -> {
                        if (element.height.toString() == "100%" || element.height.toString() == "100.0%") {
                            loopHeight
                        } else {
                            element.height
                        }
                    }
                    is RectangleElement -> {
                        when (val h = element.height) {
                            is String -> {
                                if (h == "100%" || h == "100.0%") loopHeight else 20f
                            }
                            is Number -> h.toFloat()
                            else -> 20f
                        }
                    }
                    is LineElement -> {
                        val lineHeight = element.resolveHeight(loopHeight)
                        if (lineHeight > 0) kotlin.math.abs(lineHeight) else 1f
                    }
                    else -> 20f
                }
            y + height
        } ?: 20f
    }

    private fun adjustElementPosition(
        element: Element,
        loopX: Float,
        currentY: Float,
        loopWidth: Float,
        itemHeight: Float,
    ): Element {
        return when (element) {
            is TextElement ->
                element.copy(
                    x = loopX + element.x,
                    y = currentY + element.y,
                    width = resolveWidth(element.width, loopWidth),
                )
            is StaticTextElement ->
                element.copy(
                    x = loopX + element.x,
                    y = currentY + element.y,
                    width = resolveWidth(element.width, loopWidth),
                )
            is ImageElement ->
                element.copy(
                    x = loopX + element.x,
                    y = currentY + element.y,
                    width = resolveFloatDimension(element.width, loopWidth),
                    height = resolveFloatDimension(element.height, itemHeight),
                )
            is TableElement ->
                element.copy(
                    x = loopX + element.x,
                    y = currentY + element.y,
                )
            is RectangleElement -> {
                val isFullWidth =
                    element.width.toString() == "100%" ||
                        element.width.toString() == "100.0%"
                val isFullHeight =
                    element.height.toString() == "100%" ||
                        element.height.toString() == "100.0%"
                element.copy(
                    x = if (isFullWidth) loopX else loopX + element.x,
                    y = if (isFullHeight) currentY else currentY + element.y,
                    width = resolveDimension(element.width, loopWidth),
                    height = resolveDimension(element.height, itemHeight),
                )
            }
            is LineElement -> {
                val resolvedWidth = element.resolveWidth(loopWidth)
                val resolvedHeight = element.resolveHeight(itemHeight)
                element.copy(
                    x = loopX + element.x,
                    y = currentY + element.y,
                    width = resolvedWidth,
                    height = resolvedHeight,
                )
            }
            is BarcodeElement ->
                element.copy(
                    x = loopX + element.x,
                    y = currentY + element.y,
                )
            else -> element
        }
    }

    private fun resolveDimension(
        value: Any?,
        loopDimension: Float,
    ): Any {
        return when (value) {
            is String -> {
                if (value == "100%" || value == "100.0%") {
                    loopDimension
                } else {
                    value.toFloatOrNull() ?: value
                }
            }
            is Number -> value
            else -> value ?: 0f
        }
    }

    private fun resolveFloatDimension(
        value: Float,
        loopDimension: Float,
    ): Float {
        return if (value.toString().endsWith("%")) {
            loopDimension
        } else {
            value
        }
    }

    private fun resolveWidth(
        value: Float?,
        loopWidth: Float,
    ): Float? {
        return if (value == null) {
            null
        } else if (value.toString().endsWith("%") || value == -1f) {
            loopWidth
        } else {
            value
        }
    }
}
