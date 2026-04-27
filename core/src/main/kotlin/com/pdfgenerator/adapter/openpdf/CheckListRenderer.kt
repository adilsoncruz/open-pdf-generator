package com.pdfgenerator.adapter.openpdf

import com.pdfgenerator.engine.RenderContext
import com.pdfgenerator.engine.RenderEngine
import com.pdfgenerator.engine.Renderer
import com.pdfgenerator.model.CheckListElement
import com.pdfgenerator.model.CheckStyle
import com.pdfgenerator.model.PositionMode
import com.pdfgenerator.model.RectangleElement
import com.pdfgenerator.model.RectangleStyle
import com.pdfgenerator.model.StaticTextElement
import com.pdfgenerator.model.TextStyle
import com.pdfgenerator.util.DataBindingResolver
import org.slf4j.LoggerFactory

class CheckListRenderer(private val renderEngine: RenderEngine) : Renderer<CheckListElement> {
    private val logger = LoggerFactory.getLogger(CheckListRenderer::class.java)

    override fun render(
        element: CheckListElement,
        context: RenderContext,
    ) {
        val listData = DataBindingResolver.resolve(element.dataBinding, context.data, context.loopContext)

        if (listData !is Map<*, *>) {
            logger.warn("Data binding ${element.dataBinding} did not return a map for check list ${element.id}")
            return
        }

        if (listData.isEmpty()) {
            return
        }

        val listX = element.x
        val listStartY = element.startY ?: element.y
        val paddingLeft = element.style?.paddingLeft ?: 0f
        val paddingRight = element.style?.paddingRight ?: 0f
        val paddingTop = element.style?.paddingTop ?: 0f
        val paddingBottom = element.style?.paddingBottom ?: 0f
        val contentStartX = listX + paddingLeft
        val contentWidth = kotlin.math.max(10f, element.width - paddingLeft - paddingRight)

        val pageHeight = context.document.pageSize.height
        val margins = context.template.pageSettings.margins
        val footerHeight = context.template.pageSettings.footer?.height ?: 0f

        val contentAreaBottom = pageHeight - margins.bottom - footerHeight

        val maxYInTemplate = contentAreaBottom - paddingBottom

        var itemsRenderedOnCurrentPage = 0
        var currentY = listStartY + paddingTop

        val backgroundColor = element.style?.backgroundColor

        val checkStyle = buildCheckStyle(element)
        listData.entries.forEachIndexed { index, entry ->
            val w = element.style!!.fontSize
            val measurementTextElement =
                StaticTextElement(
                    id = "${element.id}-item-$index",
                    x = contentStartX + w + 3f,
                    y = currentY,
                    width = kotlin.math.max(10f, contentWidth - w - 3f),
                    height = element.itemSpacing + (element.style?.fontSize ?: 10f),
                    value = "${entry.key}",
                    positionMode = PositionMode.RELATIVE,
                    style =
                        element.style?.copy(
                            firstLineIndent = 0f,
                            multiline = true,
                            overflow = "auto",
                            paddingLeft = 0f,
                            backgroundColor = "transparent",
                        ) ?: TextStyle(multiline = true),
                )
            val itemHeight = getTextHeight(measurementTextElement)
            val itemEndY = currentY + itemHeight
            if (itemEndY > maxYInTemplate && itemsRenderedOnCurrentPage > 0) {
                context.document.newPage()
                currentY = listStartY + paddingTop
                itemsRenderedOnCurrentPage = 0
            }

            val currentCheckStyle =
                if (entry.value == true) {
                    checkStyle.copy(fillColor = element.style.color)
                } else {
                    checkStyle
                }

            val prefixElement =
                RectangleElement(
                    id = "check-${element.id}-item-$index",
                    x = contentStartX,
                    y = currentY,
                    width = w,
                    height = w,
                    positionMode = PositionMode.RELATIVE,
                    style = currentCheckStyle,
                )
            val textElement = measurementTextElement.copy(y = currentY)

            if (!backgroundColor.isNullOrBlank() && backgroundColor.lowercase() != "transparent") {
                val isFirstItemOnPage = itemsRenderedOnCurrentPage == 0
                val rowBackgroundY = if (isFirstItemOnPage) listStartY else currentY
                val rowBackgroundHeight = itemHeight + element.itemSpacing + if (isFirstItemOnPage) paddingTop else 0f
                val rowBackground =
                    RectangleElement(
                        id = "${element.id}-background-$index",
                        x = element.x,
                        y = rowBackgroundY,
                        width = element.width,
                        height = rowBackgroundHeight,
                        positionMode = PositionMode.RELATIVE,
                        style =
                            RectangleStyle(
                                borderWidth = 0f,
                                fillColor = backgroundColor,
                            ),
                    )
                renderEngine.render(rowBackground, context)
            }

            renderEngine.render(prefixElement, context)
            renderEngine.render(textElement, context)
            itemsRenderedOnCurrentPage++
            currentY += itemHeight + element.itemSpacing
            context.renderState?.let { state ->
                val finalYAbsolute = currentY - element.itemSpacing
                val finalYRelative = finalYAbsolute - context.bodyOffsetY
                state.currentY = finalYRelative
            }
        }
    }

    private fun buildCheckStyle(element: CheckListElement): RectangleStyle {
        return when (element.checkStyle) {
            CheckStyle.RECTANGLE ->
                RectangleStyle(
                    borderWidth = 1.5f,
                    cornerRadius = 0f,
                    borderColor = element.style!!.color,
                )
            CheckStyle.BORDERED ->
                RectangleStyle(
                    borderWidth = 1.5f,
                    cornerRadius = 2f,
                    borderColor = element.style!!.color,
                )
            CheckStyle.CIRCLE ->
                RectangleStyle(
                    borderWidth = 1.5f,
                    cornerRadius = element.style!!.fontSize / 2,
                    borderColor = element.style!!.color,
                )
            else -> RectangleStyle(borderWidth = 1.5f, cornerRadius = 0f)
        }
    }

    private fun getTextHeight(element: StaticTextElement): Float {
        val overflow = element.style?.overflow?.lowercase() ?: "visible"
        val definedHeight = element.height ?: (element.style?.fontSize ?: 12f)

        if (overflow == "auto" && element.style?.multiline == true && element.width != null) {
            return TextRenderer.calculateContentHeight(
                text = element.value,
                boxWidth = element.width,
                fontSize = element.style.fontSize,
                lineHeight = element.style.lineHeight,
                paddingTop = element.style.paddingTop,
                paddingBottom = element.style.paddingBottom,
                paddingLeft = element.style.paddingLeft,
                paddingRight = element.style.paddingRight,
                firstLineIndent = element.style.firstLineIndent,
                fontFamily = element.style.fontFamily,
            )
        } else {
            return definedHeight
        }
    }
}
