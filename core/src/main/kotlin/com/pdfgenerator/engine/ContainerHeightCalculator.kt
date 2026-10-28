package com.pdfgenerator.engine

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
import com.pdfgenerator.model.StaticTextElement
import com.pdfgenerator.model.TextElement
import com.pdfgenerator.util.DataBindingResolver

/**
 * Height calculator for container elements and loops (including nested flows and auto-height).
 */
object ContainerHeightCalculator {
    fun calculateContainerHeight(
        element: ContainerElement,
        data: Map<String, Any?>,
        context: RenderContext,
    ): Float {
        var flowY = 0f
        var maxContentBottom = 0f
        val defaultWidth = context.containerWidth ?: element.resolveWidth(595.28f)
        val defaultHeight = context.containerHeight ?: (context.document.pageSize?.height ?: 842f)
        val childContext = context.copy(containerWidth = defaultWidth, containerHeight = defaultHeight)

        element.elements.forEach { child ->
            val isChildRelative = child.positionMode == PositionMode.RELATIVE
            val isChildHeightFull =
                when (child) {
                    is RectangleElement -> child.height?.toString() == "100%" || child.height?.toString() == "100.0%"
                    is ContainerElement -> child.height?.toString() == "100%" || child.height?.toString() == "100.0%"
                    else -> false
                }
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
            val childH = ElementHeightCalculator.getElementHeight(child, data, childContext)
            if (isChildRelative) {
                flowY = effectiveChildY + childH
            } else {
                flowY = kotlin.math.max(flowY, child.y + childH)
            }
            val bottom = effectiveChildY + childH
            if (bottom > maxContentBottom) {
                maxContentBottom = bottom
            }
        }
        val resolvedH = element.resolveHeight(defaultHeight)
        return if (element.isAutoHeight()) {
            kotlin.math.max(resolvedH, maxContentBottom)
        } else {
            resolvedH
        }
    }

    fun calculateLoopHeight(
        element: LoopElement,
        data: Map<String, Any?>,
    ): Float {
        val loopData = DataBindingResolver.resolve(element.dataBinding, data, null)
        val itemCount = if (loopData is List<*>) loopData.size else 0
        val calculatedItemHeight = calculateLoopItemHeight(element.elements, element.width, element.height)
        val itemHeight = if (element.height > 0f) element.height else calculatedItemHeight
        val spacing = element.itemSpacing.coerceAtLeast(0f)
        val totalSpacing = if (itemCount > 1) spacing * (itemCount - 1) else 0f
        return (itemCount * itemHeight) + totalSpacing
    }

    fun calculateLoopItemHeight(
        elements: List<Element>,
        loopWidth: Any?,
        loopHeight: Float,
    ): Float {
        if (elements.isEmpty()) {
            return 0f
        }

        var flowY = 0f
        var maxBottom = 0f

        elements.forEach { element ->
            val isRelative = element.positionMode == PositionMode.RELATIVE
            val height =
                when (element) {
                    is LinkElement -> element.height ?: 20f
                    is RichTextElement -> element.height ?: 20f
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
                        val h = element.height
                        when (h) {
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

                    is BarcodeElement -> element.height
                    is ContainerElement -> element.resolveHeight(loopHeight)
                    else -> 20f
                }
            val isFull =
                when (element) {
                    is RectangleElement -> element.height?.toString() == "100%" || element.height?.toString() == "100.0%"
                    else -> false
                }
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
}
