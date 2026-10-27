package com.pdfgenerator.adapter.openpdf

import com.pdfgenerator.engine.LoopContext
import com.pdfgenerator.engine.RenderContext
import com.pdfgenerator.engine.RenderState
import com.pdfgenerator.model.BarcodeElement
import com.pdfgenerator.model.ContainerElement
import com.pdfgenerator.model.Element
import com.pdfgenerator.model.ImageElement
import com.pdfgenerator.model.LineElement
import com.pdfgenerator.model.LinkElement
import com.pdfgenerator.model.LoopElement
import com.pdfgenerator.model.RectangleElement
import com.pdfgenerator.model.RichTextElement
import com.pdfgenerator.model.SpacerElement
import com.pdfgenerator.model.StaticTextElement
import com.pdfgenerator.model.TableElement
import com.pdfgenerator.model.TextElement

/**
 * Handles iteration scoping, data map enrichment, and element placement adjustment for loop items.
 */
class LoopIterationScope(
    val item: Any?,
    val index: Int,
    val normalizedItemMap: Map<String, Any?>? = (item as? Map<*, *>)?.mapKeys { it.key.toString() },
) {
    val loopContext: LoopContext = LoopContext(
        item = item,
        index = index,
        normalizedItemMap = normalizedItemMap,
    )

    fun createItemContext(
        parentContext: RenderContext,
        loopX: Float,
        pageOffsetY: Float,
        itemStartY: Float,
        loopWidth: Float,
        itemHeight: Float,
    ): RenderContext {
        return parentContext.copy(
            loopContext = loopContext,
            offsetX = parentContext.offsetX + loopX,
            offsetY = pageOffsetY + itemStartY,
            containerWidth = loopWidth,
            containerHeight = itemHeight,
            renderState = RenderState(),
        )
    }

    fun buildEnrichedData(baseData: Map<String, Any?>?): Map<String, Any?> {
        val enriched = (baseData ?: emptyMap()).toMutableMap()
        enriched["\$index"] = index
        enriched["\$item"] = item
        if (normalizedItemMap != null) {
            enriched.putAll(normalizedItemMap)
        }
        return enriched
    }

    fun adjustElementPosition(
        element: Element,
        containerWidth: Float,
        containerHeight: Float,
        childEffectiveY: Float,
    ): Element {
        val targetY = childEffectiveY
        return when (element) {
            is TextElement ->
                element.copy(
                    x = element.x,
                    y = targetY,
                    width = resolveWidth(element.width, containerWidth),
                )
            is StaticTextElement ->
                element.copy(
                    x = element.x,
                    y = targetY,
                    width = resolveWidth(element.width, containerWidth),
                )
            is ImageElement ->
                element.copy(
                    x = element.x,
                    y = targetY,
                    width = resolveFloatDimension(element.width, containerWidth),
                    height = resolveFloatDimension(element.height, containerHeight),
                )
            is TableElement -> element.copy(x = element.x, y = targetY)
            is RectangleElement -> {
                val isFullWidth = element.width?.toString() == "100%" || element.width?.toString() == "100.0%"
                val isFullHeight = element.height?.toString() == "100%" || element.height?.toString() == "100.0%"
                element.copy(
                    x = if (isFullWidth) 0f else element.x,
                    y = if (isFullHeight) 0f else targetY,
                    width = resolveDimension(element.width, containerWidth),
                    height = resolveDimension(element.height, containerHeight),
                )
            }
            is LineElement ->
                element.copy(
                    x = element.x,
                    y = targetY,
                    width = element.resolveWidth(containerWidth),
                    height = element.resolveHeight(containerHeight),
                )
            is BarcodeElement -> element.copy(x = element.x, y = targetY)
            is LoopElement -> element.copy(x = element.x, y = targetY)
            is ContainerElement -> element.copy(x = element.x, y = targetY)
            is RichTextElement -> element.copy(x = element.x, y = targetY)
            is LinkElement ->
                element.copy(
                    x = element.x,
                    y = targetY,
                    width = resolveWidth(element.width, containerWidth),
                )
            is SpacerElement ->
                element.copy(
                    x = element.x,
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
