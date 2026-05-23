package com.pdfgenerator.adapter.openpdf

import com.pdfgenerator.engine.LoopContext
import com.pdfgenerator.engine.RenderContext
import com.pdfgenerator.engine.RenderEngine
import com.pdfgenerator.engine.RenderState
import com.pdfgenerator.engine.Renderer
import com.pdfgenerator.model.Element
import com.pdfgenerator.model.LineElement
import com.pdfgenerator.model.LoopElement
import com.pdfgenerator.model.RectangleElement
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
            logger.debug("Loop ${element.id} com lista vazia, nada a renderizar")
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
            val itemContext =
                context.copy(
                    loopContext = loopContext,
                    offsetX = context.offsetX + loopX,
                    offsetY = context.offsetY + currentY,
                    containerWidth = loopWidth,
                    containerHeight = itemHeight,
                    renderState = RenderState(),
                )

            element.elements.forEach { childElement ->
                renderEngine.render(childElement, itemContext)
            }

            itemsRenderedOnCurrentPage++
            currentY += itemHeight + element.itemSpacing
        }

        context.renderState?.let { state ->
            val finalYAbsolute = context.offsetY + (currentY - element.itemSpacing)
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

}
