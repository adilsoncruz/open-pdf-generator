package com.pdfgenerator.adapter.openpdf

import com.pdfgenerator.api.PDFGenerator
import com.pdfgenerator.engine.RenderContext
import com.pdfgenerator.engine.RenderEngine
import com.pdfgenerator.engine.Renderer
import com.pdfgenerator.model.Element
import com.pdfgenerator.model.ImageElement
import com.pdfgenerator.model.LineElement
import com.pdfgenerator.model.LoopElement
import com.pdfgenerator.model.PositionMode
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
        val loopBaseY = element.y

        val margins = context.template.pageSettings.margins
        val containerWidth = context.containerWidth ?: (context.document.pageSize.width - margins.left - margins.right)
        val loopWidth = element.resolveWidth(containerWidth)
        val loopHeight = element.height

        val calculatedItemHeight = calculateItemHeight(element.elements, loopWidth, loopHeight)
        val itemHeight = if (loopHeight > 0f) loopHeight else calculatedItemHeight
        val itemSpacing = element.itemSpacing.coerceAtLeast(0f)

        val pageBreakHandler =
            LoopPageBreakHandler(
                context = context,
                loopBaseY = loopBaseY,
                itemHeight = itemHeight,
                itemSpacing = itemSpacing,
            )

        loopData.forEachIndexed { index, item ->
            val placement = pageBreakHandler.prepareItemPosition()
            val iterationScope = LoopIterationScope(item = item, index = index)
            val itemContext =
                iterationScope.createItemContext(
                    parentContext = context,
                    loopX = loopX,
                    pageOffsetY = placement.pageOffsetY,
                    itemStartY = placement.itemStartY,
                    loopWidth = loopWidth,
                    itemHeight = itemHeight,
                )

            var flowY = 0f
            val childEffectiveYList =
                element.elements.map { child ->
                    val isChildRelative = child.positionMode == PositionMode.RELATIVE
                    val isChildHeightFull =
                        child is RectangleElement &&
                            (child.height?.toString() == "100%" || child.height?.toString() == "100.0%")
                    val offset = if (isChildHeightFull) 0f else (child.relativeOffsetY ?: 0f)
                    val effectiveChildY =
                        if (isChildRelative) {
                            if (flowY == 0f) {
                                if (isChildHeightFull) {
                                    0f
                                } else if (child.y > 0f) {
                                    child.y
                                } else {
                                    offset
                                }
                            } else {
                                flowY + offset
                            }
                        } else {
                            child.y
                        }
                    val childH = PDFGenerator.getElementHeight(child, context.data, itemContext)
                    flowY = if (isChildRelative) flowY + childH else kotlin.math.max(flowY, child.y + childH)
                    effectiveChildY
                }

            element.elements.forEachIndexed { childIndex, childElement ->
                val childEffectiveY = childEffectiveYList[childIndex]
                val adjustedElement =
                    iterationScope.adjustElementPosition(
                        element = childElement,
                        containerWidth = loopWidth,
                        containerHeight = itemHeight,
                        childEffectiveY = childEffectiveY,
                    )
                renderEngine.render(adjustedElement, itemContext)
            }

            pageBreakHandler.onItemRendered()
        }

        pageBreakHandler.updateRenderState()
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
                        if (element.height.toString() == "100%" || element.height.toString() == "100.0%") loopHeight else element.height
                    }
                    is RectangleElement ->
                        when (val h = element.height) {
                            is String -> if (h == "100%" || h == "100.0%") loopHeight else h.toFloatOrNull() ?: 20f
                            is Number -> h.toFloat()
                            else -> 20f
                        }
                    is LineElement -> {
                        val lh = element.resolveHeight(loopHeight)
                        if (lh > 0) kotlin.math.abs(lh) else 1f
                    }
                    else -> 20f
                }
            val isFull =
                element is RectangleElement &&
                    (element.height?.toString() == "100%" || element.height?.toString() == "100.0%")
            val offset = if (isFull) 0f else (element.relativeOffsetY ?: 0f)
            val effectiveY =
                if (isRelative) {
                    if (flowY == 0f) {
                        if (isFull) {
                            0f
                        } else if (element.y > 0f) {
                            element.y
                        } else {
                            offset
                        }
                    } else {
                        flowY + offset
                    }
                } else {
                    element.y
                }
            flowY = if (isRelative) effectiveY + height else kotlin.math.max(flowY, element.y + height)
            val bottom = effectiveY + height
            if (bottom > maxBottom) {
                maxBottom = bottom
            }
        }
        return if (maxBottom > 0f) maxBottom else 20f
    }
}
