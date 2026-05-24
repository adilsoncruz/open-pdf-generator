package com.pdfgenerator.adapter.openpdf

import com.pdfgenerator.engine.LoopContext
import com.pdfgenerator.engine.RenderContext
import com.pdfgenerator.engine.RenderEngine
import com.pdfgenerator.engine.RenderState
import com.pdfgenerator.engine.Renderer
import com.pdfgenerator.model.Element
import com.pdfgenerator.model.ImageElement
import com.pdfgenerator.model.LineElement
import com.pdfgenerator.model.LoopElement
import com.pdfgenerator.model.RectangleElement
import com.pdfgenerator.model.StaticTextElement
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
            logger.debug("Loop ${element.id} com lista vazia, nada a renderizar")
            return
        }

        val loopX = element.x
        // Use template-local Y for loop stacking. startY may already be absolute and include body/header offsets.
        val loopBaseY = element.y

        val containerWidth =
            context.containerWidth
                ?: (
                    context.document.pageSize.width -
                        context.template.pageSettings.margins.left -
                        context.template.pageSettings.margins.right
                )
        val loopWidth = element.resolveWidth(containerWidth)
        val loopHeight = element.height

        val calculatedItemHeight = calculateItemHeight(element.elements, loopWidth, loopHeight)
        val itemHeight = if (loopHeight > 0f) loopHeight else calculatedItemHeight

        val maxYInTemplate =
            context.containerHeight ?: run {
                val pageHeight = context.document.pageSize.height
                val margins = context.template.pageSettings.margins
                val headerHeight = context.template.pageSettings.header?.height ?: 0f
                val footerHeight = context.template.pageSettings.footer?.height ?: 0f
                val contentAreaTop = margins.top + headerHeight
                val contentAreaBottom = pageHeight - margins.bottom - footerHeight
                contentAreaBottom - contentAreaTop
            }

        val itemSpacing = element.itemSpacing.coerceAtLeast(0f)

        var itemsRenderedOnCurrentPage = 0
        var totalItemsRendered = 0
        var currentYOffset = 0f

        val contextOffsetInBody = context.offsetY - context.bodyOffsetY

        loopData.forEachIndexed { index, item ->
            var itemStartY = loopBaseY + currentYOffset
            var itemEndY = itemStartY + itemHeight
            var itemEndYInBody = contextOffsetInBody + itemEndY

            if (itemEndYInBody > maxYInTemplate && itemsRenderedOnCurrentPage > 0) {
                context.document.newPage()
                itemsRenderedOnCurrentPage = 0
                currentYOffset = 0f
                val restartAtTopOfBody = contextOffsetInBody > 0f
                itemStartY = if (restartAtTopOfBody) 0f else loopBaseY
                itemEndY = itemStartY + itemHeight
                itemEndYInBody = if (restartAtTopOfBody) itemEndY else contextOffsetInBody + itemEndY
            }

            val normalizedItemMap = (item as? Map<*, *>)?.mapKeys { it.key.toString() }
            val loopContext = LoopContext(item = item, index = index, normalizedItemMap = normalizedItemMap)
            val itemContext =
                context.copy(
                    loopContext = loopContext,
                    offsetX = context.offsetX + loopX,
                    offsetY = context.offsetY + itemStartY,
                    containerWidth = loopWidth,
                    containerHeight = itemHeight,
                    renderState = RenderState(),
                )

            element.elements.forEach { childElement ->
                renderEngine.render(childElement, itemContext)
            }

            itemsRenderedOnCurrentPage++
            totalItemsRendered++
            currentYOffset += itemHeight + itemSpacing
        }

        context.renderState?.let { state ->
            val renderedHeight = (totalItemsRendered * itemHeight) + ((totalItemsRendered - 1).coerceAtLeast(0) * itemSpacing)
            val finalYAbsolute = context.offsetY + loopBaseY + renderedHeight
            val finalYRelative = finalYAbsolute - context.bodyOffsetY
            state.updateMaxY(finalYRelative)
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
                                if (h == "100%" || h == "100.0%") loopHeight else h.toFloatOrNull() ?: 20f
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
