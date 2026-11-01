package com.pdfgenerator.engine

import com.pdfgenerator.adapter.openpdf.ListItemLayout
import com.pdfgenerator.adapter.openpdf.TextRenderer
import com.pdfgenerator.model.BarcodeElement
import com.pdfgenerator.model.CheckListElement
import com.pdfgenerator.model.ConditionalElement
import com.pdfgenerator.model.ContainerElement
import com.pdfgenerator.model.Element
import com.pdfgenerator.model.ImageElement
import com.pdfgenerator.model.LineElement
import com.pdfgenerator.model.LinkElement
import com.pdfgenerator.model.ListElement
import com.pdfgenerator.model.LoopElement
import com.pdfgenerator.model.PageBreakElement
import com.pdfgenerator.model.RectangleElement
import com.pdfgenerator.model.RichTextElement
import com.pdfgenerator.model.SpacerElement
import com.pdfgenerator.model.StaticTextElement
import com.pdfgenerator.model.TableElement
import com.pdfgenerator.model.TextElement
import com.pdfgenerator.model.TextStyle
import com.pdfgenerator.util.DataBindingResolver

object ElementHeightCalculator {
    fun getElementHeight(
        element: Element,
        data: Map<String, Any?>,
        context: RenderContext,
    ): Float {
        return when (element) {
            is TextElement ->
                measureTextHeight(
                    elementId = element.id,
                    text = resolveTextForHeight(element.dataBinding, element.value, data),
                    definedHeight = element.height,
                    width = element.width,
                    style = element.style,
                    context = context,
                )
            is StaticTextElement ->
                measureTextHeight(
                    elementId = element.id,
                    text = element.value,
                    definedHeight = element.height,
                    width = element.width,
                    style = element.style,
                    context = context,
                )
            is RichTextElement ->
                measureTextHeight(
                    elementId = element.id,
                    text = resolveTextForHeight(element.dataBinding, element.value, data),
                    definedHeight = element.height,
                    width = element.width,
                    style = element.style,
                    context = context,
                )
            is LinkElement ->
                measureTextHeight(
                    elementId = element.id,
                    text = resolveTextForHeight(element.dataBinding, element.value, data),
                    definedHeight = element.height,
                    width = element.width,
                    style = element.style,
                    context = context,
                )
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
            is TableElement -> TableHeightCalculator.calculateTableHeight(element, data)
            is LoopElement -> ContainerHeightCalculator.calculateLoopHeight(element, data)
            is ConditionalElement -> {
                element.elements.maxOfOrNull { getElementHeight(it, data, context) } ?: 0f
            }
            is ContainerElement -> ContainerHeightCalculator.calculateContainerHeight(element, data, context)
            is ListElement -> measureListHeight(element, data)
            is CheckListElement -> measureCheckListHeight(element, data)
            is PageBreakElement -> 0f
            is SpacerElement -> element.height
            else -> 0f
        }
    }

    private fun measureListHeight(
        element: ListElement,
        data: Map<String, Any?>,
    ): Float {
        val items = DataBindingResolver.resolve(element.dataBinding, data, null) as? List<*> ?: return 0f
        if (items.isEmpty()) return 0f
        val style = element.style
        val rowStyle = ListItemLayout.rowStyle(style)
        val contentWidth = elementContentWidth(element.width, style?.paddingLeft ?: 0f, style?.paddingRight ?: 0f)
        val contentHeight =
            items.sumOf { item ->
                (ListItemLayout.contentHeight(item?.toString() ?: "", contentWidth, rowStyle) + element.itemSpacing).toDouble()
            }.toFloat() - element.itemSpacing
        return contentHeight + (style?.paddingTop ?: 0f) + (style?.paddingBottom ?: 0f)
    }

    private fun measureCheckListHeight(
        element: CheckListElement,
        data: Map<String, Any?>,
    ): Float {
        val items = DataBindingResolver.resolve(element.dataBinding, data, null) as? Map<*, *> ?: return 0f
        if (items.isEmpty()) return 0f
        val style = element.style
        val rowStyle = ListItemLayout.rowStyle(style)
        val contentWidth = elementContentWidth(element.width, style?.paddingLeft ?: 0f, style?.paddingRight ?: 0f)
        val contentHeight =
            items.keys.sumOf { key ->
                (ListItemLayout.contentHeight(key?.toString() ?: "", contentWidth, rowStyle) + element.itemSpacing).toDouble()
            }.toFloat() - element.itemSpacing
        return contentHeight + (style?.paddingTop ?: 0f) + (style?.paddingBottom ?: 0f)
    }

    private fun elementContentWidth(
        width: Float,
        paddingLeft: Float,
        paddingRight: Float,
    ): Float = kotlin.math.max(10f, width - paddingLeft - paddingRight)

    private fun measureTextHeight(
        elementId: String,
        text: String?,
        definedHeight: Float?,
        width: Float?,
        style: TextStyle?,
        context: RenderContext,
    ): Float {
        val fallbackHeight = definedHeight ?: (style?.fontSize ?: 12f)
        val boxWidth = width ?: context.containerWidth
        if (style?.multiline == true && boxWidth != null && text != null) {
            val contentHeight =
                TextRenderer
                    .getOrMeasureMultilineLayout(
                        elementId = elementId,
                        resolvedText = text,
                        styleHash = style.hashCode(),
                        boxWidth = boxWidth,
                        fontSize = style.fontSize ?: 12f,
                        lineHeight = style.lineHeight,
                        paddingTop = style.paddingTop ?: 0f,
                        paddingBottom = style.paddingBottom ?: 0f,
                        paddingLeft = style.paddingLeft ?: 0f,
                        paddingRight = style.paddingRight ?: 0f,
                        firstLineIndent = style.firstLineIndent ?: 0f,
                        fontFamily = style.fontFamily ?: "Helvetica",
                        cache = context.textLayoutCache,
                    ).contentHeight
            return kotlin.math.max(fallbackHeight, contentHeight)
        }
        return fallbackHeight
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
    ): Float = ContainerHeightCalculator.calculateLoopItemHeight(elements, loopWidth, loopHeight)
}
