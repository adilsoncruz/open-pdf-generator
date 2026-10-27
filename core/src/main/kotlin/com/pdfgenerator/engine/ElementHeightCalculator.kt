package com.pdfgenerator.engine

import com.pdfgenerator.adapter.openpdf.TextRenderer
import com.pdfgenerator.model.BarcodeElement
import com.pdfgenerator.model.ConditionalElement
import com.pdfgenerator.model.ContainerElement
import com.pdfgenerator.model.Element
import com.pdfgenerator.model.ImageElement
import com.pdfgenerator.model.LineElement
import com.pdfgenerator.model.LinkElement
import com.pdfgenerator.model.LoopElement
import com.pdfgenerator.model.PageBreakElement
import com.pdfgenerator.model.PositionMode
import com.pdfgenerator.model.RectangleElement
import com.pdfgenerator.model.RichTextElement
import com.pdfgenerator.model.SpacerElement
import com.pdfgenerator.model.StaticTextElement
import com.pdfgenerator.model.TableElement
import com.pdfgenerator.model.TextElement
import com.pdfgenerator.util.DataBindingResolver

object ElementHeightCalculator {

    fun getElementHeight(
        element: Element,
        data: Map<String, Any?>,
        context: RenderContext,
    ): Float {
        return when (element) {
            is TextElement -> {
                val definedHeight = element.height ?: (element.style?.fontSize ?: 12f)
                val boxWidth = element.width ?: context.containerWidth
                if (element.style?.multiline == true && boxWidth != null) {
                    val text = resolveTextForHeight(element.dataBinding, element.value, data)
                    if (text != null) {
                        val contentHeight = TextRenderer
                            .getOrMeasureMultilineLayout(
                                elementId = element.id,
                                resolvedText = text,
                                styleHash = element.style?.hashCode() ?: 0,
                                boxWidth = boxWidth,
                                fontSize = element.style?.fontSize ?: 12f,
                                lineHeight = element.style?.lineHeight,
                                paddingTop = element.style?.paddingTop ?: 0f,
                                paddingBottom = element.style?.paddingBottom ?: 0f,
                                paddingLeft = element.style?.paddingLeft ?: 0f,
                                paddingRight = element.style?.paddingRight ?: 0f,
                                firstLineIndent = element.style?.firstLineIndent ?: 0f,
                                fontFamily = element.style?.fontFamily ?: "Helvetica",
                                cache = context.textLayoutCache,
                            ).contentHeight
                        kotlin.math.max(definedHeight, contentHeight)
                    } else {
                        definedHeight
                    }
                } else {
                    definedHeight
                }
            }
            is StaticTextElement -> {
                val definedHeight = element.height ?: (element.style?.fontSize ?: 12f)
                val boxWidth = element.width ?: context.containerWidth

                if (element.style?.multiline == true && boxWidth != null) {
                    val contentHeight = TextRenderer
                        .getOrMeasureMultilineLayout(
                            elementId = element.id,
                            resolvedText = element.value,
                            styleHash = element.style?.hashCode() ?: 0,
                            boxWidth = boxWidth,
                            fontSize = element.style?.fontSize ?: 12f,
                            lineHeight = element.style?.lineHeight,
                            paddingTop = element.style?.paddingTop ?: 0f,
                            paddingBottom = element.style?.paddingBottom ?: 0f,
                            paddingLeft = element.style?.paddingLeft ?: 0f,
                            paddingRight = element.style?.paddingRight ?: 0f,
                            firstLineIndent = element.style?.firstLineIndent ?: 0f,
                            fontFamily = element.style?.fontFamily ?: "Helvetica",
                            cache = context.textLayoutCache,
                        ).contentHeight
                    kotlin.math.max(definedHeight, contentHeight)
                } else {
                    definedHeight
                }
            }
            is ImageElement -> element.height
            is RectangleElement -> {
                when (val h = element.height) {
                    is Number -> h.toFloat()
                    is String -> if (h == "100%") context.containerHeight ?: 100f else 100f
                    else -> 100f
                }
            }
            is BarcodeElement -> element.height
            is LineElement -> {
                val containerHeight = context.containerHeight ?: 100f
                kotlin.math.abs(element.resolveHeight(containerHeight)).coerceAtLeast(1f)
            }
            is TableElement -> {
                val tableData = DataBindingResolver.resolve(element.dataBinding, data, null)
                val itemCount = if (tableData is List<*>) tableData.size else 0
                val fontSize = element.style?.fontSize ?: 10f
                val headerFontSize = element.style?.headerFontSize ?: 12f
                val headerPadding = (element.style?.headerPaddingTop ?: 5f) + (element.style?.headerPaddingBottom ?: 5f)
                val cellPadding = (element.style?.cellPaddingTop ?: 5f) + (element.style?.cellPaddingBottom ?: 5f)
                val headerHeight = headerFontSize + headerPadding
                val rowHeight = fontSize + cellPadding
                headerHeight + (itemCount * rowHeight)
            }
            is LoopElement -> {
                val loopData = DataBindingResolver.resolve(element.dataBinding, data, null)
                val itemCount = if (loopData is List<*>) loopData.size else 0
                val calculatedItemHeight = calculateLoopItemHeight(element.elements, element.width, element.height)
                val itemHeight = if (element.height > 0f) element.height else calculatedItemHeight
                val spacing = element.itemSpacing.coerceAtLeast(0f)
                val totalSpacing = if (itemCount > 1) spacing * (itemCount - 1) else 0f
                (itemCount * itemHeight) + totalSpacing
            }
            is ConditionalElement -> {
                element.elements.maxOfOrNull { getElementHeight(it, data, context) } ?: 0f
            }
            is ContainerElement -> {
                var flowY = 0f
                var maxContentBottom = 0f
                val defaultWidth = context.containerWidth ?: element.resolveWidth(595.28f)
                val defaultHeight = context.containerHeight ?: (context.document.pageSize?.height ?: 842f)
                val childContext = context.copy(containerWidth = defaultWidth, containerHeight = defaultHeight)

                element.elements.forEach { child ->
                    val isChildRelative = child.positionMode == PositionMode.RELATIVE
                    val isChildHeightFull = when (child) {
                        is RectangleElement -> child.height?.toString() == "100%" || child.height?.toString() == "100.0%"
                        is ContainerElement -> child.height?.toString() == "100%" || child.height?.toString() == "100.0%"
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
                    val childH = getElementHeight(child, data, childContext)
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
                if (element.isAutoHeight()) {
                    kotlin.math.max(resolvedH, maxContentBottom)
                } else {
                    resolvedH
                }
            }
            is PageBreakElement -> 0f
            is SpacerElement -> element.height
            is RichTextElement -> {
                val definedHeight = element.height ?: (element.style?.fontSize ?: 12f)
                val boxWidth = element.width ?: context.containerWidth
                if (element.style?.multiline == true && boxWidth != null) {
                    val text = resolveTextForHeight(element.dataBinding, element.value, data)
                    if (text != null) {
                        val contentHeight = TextRenderer
                            .getOrMeasureMultilineLayout(
                                elementId = element.id,
                                resolvedText = text,
                                styleHash = element.style?.hashCode() ?: 0,
                                boxWidth = boxWidth,
                                fontSize = element.style?.fontSize ?: 12f,
                                lineHeight = element.style?.lineHeight,
                                paddingTop = element.style?.paddingTop ?: 0f,
                                paddingBottom = element.style?.paddingBottom ?: 0f,
                                paddingLeft = element.style?.paddingLeft ?: 0f,
                                paddingRight = element.style?.paddingRight ?: 0f,
                                firstLineIndent = element.style?.firstLineIndent ?: 0f,
                                fontFamily = element.style?.fontFamily ?: "Helvetica",
                                cache = context.textLayoutCache,
                            ).contentHeight
                        kotlin.math.max(definedHeight, contentHeight)
                    } else {
                        definedHeight
                    }
                } else {
                    definedHeight
                }
            }
            is LinkElement -> {
                val definedHeight = element.height ?: (element.style?.fontSize ?: 12f)
                val boxWidth = element.width ?: context.containerWidth
                if (element.style?.multiline == true && boxWidth != null) {
                    val text = resolveTextForHeight(element.dataBinding, element.value, data)
                    if (text != null) {
                        val contentHeight = TextRenderer
                            .getOrMeasureMultilineLayout(
                                elementId = element.id,
                                resolvedText = text,
                                styleHash = element.style?.hashCode() ?: 0,
                                boxWidth = boxWidth,
                                fontSize = element.style?.fontSize ?: 12f,
                                lineHeight = element.style?.lineHeight,
                                paddingTop = element.style?.paddingTop ?: 0f,
                                paddingBottom = element.style?.paddingBottom ?: 0f,
                                paddingLeft = element.style?.paddingLeft ?: 0f,
                                paddingRight = element.style?.paddingRight ?: 0f,
                                firstLineIndent = element.style?.firstLineIndent ?: 0f,
                                fontFamily = element.style?.fontFamily ?: "Helvetica",
                                cache = context.textLayoutCache,
                            ).contentHeight
                        kotlin.math.max(definedHeight, contentHeight)
                    } else {
                        definedHeight
                    }
                } else {
                    definedHeight
                }
            }
            else -> 0f
        }
    }

    fun resolveTextForHeight(
        dataBinding: String?,
        value: String?,
        data: Map<String, Any?>,
    ): String? {
        return when {
            !dataBinding.isNullOrBlank() -> {
                val resolved = DataBindingResolver.resolve(dataBinding, data, null)
                resolved?.toString()
            }
            else -> value
        }
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
}
