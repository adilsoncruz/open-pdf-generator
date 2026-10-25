package com.pdfgenerator.adapter.openpdf

import com.pdfgenerator.api.PDFGenerator
import com.pdfgenerator.engine.LoopContext
import com.pdfgenerator.engine.RenderContext
import com.pdfgenerator.engine.RenderEngine
import com.pdfgenerator.engine.RenderState
import com.pdfgenerator.engine.Renderer
import com.pdfgenerator.model.BarcodeElement
import com.pdfgenerator.model.ContainerElement
import com.pdfgenerator.model.Element
import com.pdfgenerator.model.ImageElement
import com.pdfgenerator.model.LineElement
import com.pdfgenerator.model.LinkElement
import com.pdfgenerator.model.LoopElement
import com.pdfgenerator.model.PositionMode
import com.pdfgenerator.model.RectangleElement
import com.pdfgenerator.model.RichTextElement
import com.pdfgenerator.model.SpacerElement
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
        var pageOffsetY = context.offsetY
        var pageOffsetInBody = contextOffsetInBody

        loopData.forEachIndexed { index, item ->
            var itemStartY = loopBaseY + currentYOffset
            var itemEndY = itemStartY + itemHeight
            var itemEndYInBody = pageOffsetInBody + itemEndY

            if (itemEndYInBody > maxYInTemplate && itemsRenderedOnCurrentPage > 0) {
                context.document.newPage()
                itemsRenderedOnCurrentPage = 0
                currentYOffset = 0f
                val restartAtTopOfBody = contextOffsetInBody > 0f
                pageOffsetY = if (restartAtTopOfBody) context.bodyOffsetY else context.offsetY
                pageOffsetInBody = if (restartAtTopOfBody) 0f else contextOffsetInBody
                itemStartY = if (restartAtTopOfBody) 0f else loopBaseY
                itemEndY = itemStartY + itemHeight
                itemEndYInBody = pageOffsetInBody + itemEndY
            }

            val normalizedItemMap = (item as? Map<*, *>)?.mapKeys { it.key.toString() }
            val loopContext = LoopContext(item = item, index = index, normalizedItemMap = normalizedItemMap)
            val itemContext =
                context.copy(
                    loopContext = loopContext,
                    offsetX = context.offsetX + loopX,
                    offsetY = pageOffsetY + itemStartY,
                    containerWidth = loopWidth,
                    containerHeight = itemHeight,
                    renderState = RenderState(),
                )

            var flowY = 0f
            val childEffectiveYList = element.elements.map { child ->
                val isChildRelative = child.positionMode == PositionMode.RELATIVE
                val isChildHeightFull = when (child) {
                    is RectangleElement -> child.height?.toString() == "100%" || child.height?.toString() == "100.0%"
                    else -> false
                }
                val offset = if (isChildHeightFull) 0f else (child.relativeOffsetY ?: 0f)
                val effectiveChildY = if (isChildRelative) {
                    if (flowY == 0f) {
                        if (isChildHeightFull) 0f else if (child.y > 0f) child.y else offset
                    } else {
                        flowY + offset
                    }
                } else {
                    child.y
                }
                val childH = PDFGenerator.getElementHeight(child, context.data, itemContext)
                if (isChildRelative) {
                    flowY = effectiveChildY + childH
                } else {
                    flowY = kotlin.math.max(flowY, child.y + childH)
                }
                effectiveChildY
            }

            element.elements.forEachIndexed { childIndex, childElement ->
                val childEffectiveY = childEffectiveYList[childIndex]
                val adjustedElement =
                    adjustElementPosition(
                        element = childElement,
                        containerX = 0f,
                        containerY = 0f,
                        containerWidth = loopWidth,
                        containerHeight = itemHeight,
                        childEffectiveY = childEffectiveY,
                    )
                renderEngine.render(adjustedElement, itemContext)
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

        var flowY = 0f
        var maxBottom = 0f

        elements.forEach { element ->
            val isRelative = element.positionMode == PositionMode.RELATIVE
            val height =
                when (element) {
                    is TextElement -> element.height ?: 20f
                    is StaticTextElement -> element.height ?: 20f
                    is ImageElement -> {
                        if (element.height?.toString() == "100%" || element.height?.toString() == "100.0%") {
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
            val isFull = when (element) {
                is RectangleElement -> element.height?.toString() == "100%" || element.height?.toString() == "100.0%"
                else -> false
            }
            val offset = if (isFull) 0f else (element.relativeOffsetY ?: 0f)
            val effectiveY = if (isRelative) {
                if (flowY == 0f) {
                    if (isFull) 0f else if (element.y > 0f) element.y else offset
                } else {
                    flowY + offset
                }
            } else {
                element.y
            }
            if (isRelative) {
                flowY = effectiveY + height
            } else {
                flowY = kotlin.math.max(flowY, element.y + height)
            }
            val bottom = effectiveY + height
            if (bottom > maxBottom) {
                maxBottom = bottom
            }
        }
        return if (maxBottom > 0f) maxBottom else 20f
    }

    private fun adjustElementPosition(
        element: Element,
        containerX: Float,
        containerY: Float,
        containerWidth: Float,
        containerHeight: Float,
        childEffectiveY: Float,
    ): Element {
        val targetY = containerY + childEffectiveY
        return when (element) {
            is TextElement ->
                element.copy(
                    x = containerX + element.x,
                    y = targetY,
                    width = resolveWidth(element.width, containerWidth),
                )
            is StaticTextElement ->
                element.copy(
                    x = containerX + element.x,
                    y = targetY,
                    width = resolveWidth(element.width, containerWidth),
                )
            is ImageElement ->
                element.copy(
                    x = containerX + element.x,
                    y = targetY,
                    width = resolveFloatDimension(element.width, containerWidth),
                    height = resolveFloatDimension(element.height, containerHeight),
                )
            is TableElement -> element.copy(x = containerX + element.x, y = targetY)
            is RectangleElement -> {
                val isFullWidth = element.width?.toString() == "100%" || element.width?.toString() == "100.0%"
                val isFullHeight = element.height?.toString() == "100%" || element.height?.toString() == "100.0%"
                element.copy(
                    x = if (isFullWidth) containerX else containerX + element.x,
                    y = if (isFullHeight) containerY else targetY,
                    width = resolveDimension(element.width, containerWidth),
                    height = resolveDimension(element.height, containerHeight),
                )
            }
            is LineElement ->
                element.copy(
                    x = containerX + element.x,
                    y = targetY,
                    width = element.resolveWidth(containerWidth),
                    height = element.resolveHeight(containerHeight),
                )
            is BarcodeElement ->
                element.copy(
                    x = containerX + element.x,
                    y = targetY,
                )
            is LoopElement ->
                element.copy(
                    x = containerX + element.x,
                    y = targetY,
                )
            is ContainerElement ->
                element.copy(
                    x = containerX + element.x,
                    y = targetY,
                )
            is RichTextElement ->
                element.copy(
                    x = containerX + element.x,
                    y = targetY,
                )
            is LinkElement ->
                element.copy(
                    x = containerX + element.x,
                    y = targetY,
                    width = resolveWidth(element.width, containerWidth),
                )
            is SpacerElement ->
                element.copy(
                    x = containerX + element.x,
                    y = targetY,
                    width = element.width ?: "100%",
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
            containerWidth
        } else if (value.toString().endsWith("%") || value == -1f) {
            containerWidth
        } else {
            value
        }
    }
}
