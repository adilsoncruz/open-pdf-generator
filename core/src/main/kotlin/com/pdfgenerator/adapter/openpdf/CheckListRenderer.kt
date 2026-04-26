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

        val pageHeight = context.document.pageSize.height
        val margins = context.template.pageSettings.margins
        val footerHeight = context.template.pageSettings.footer?.height ?: 0f

        val contentAreaBottom = pageHeight - margins.bottom - footerHeight

        val maxYInTemplate = contentAreaBottom

        var itemsRenderedOnCurrentPage = 0
        var currentY = listStartY

        val checkStyle = buildCheckStyle(element)
        listData.entries.forEachIndexed { index, entry ->
            val w = element.style!!.fontSize
            var currentCheckStyle: RectangleStyle = checkStyle

            if (entry.value == true) {
                currentCheckStyle = checkStyle.copy(fillColor = element.style.color)
            }
            val prefixElement =
                RectangleElement(
                    id = "check-${element.id}-item-$index",
                    x = listX,
                    y = currentY,
                    width = w,
                    height = w,
                    positionMode = PositionMode.RELATIVE,
                    style = currentCheckStyle,
                )
            val textElement =
                StaticTextElement(
                    id = "${element.id}-item-$index",
                    x = listX + w + 3f,
                    y = currentY,
                    width = element.width - 10f,
                    height = element.itemSpacing + (element.style?.fontSize ?: 10f),
                    value = "${entry.key}",
                    positionMode = PositionMode.RELATIVE,
                    style =
                        element.style?.copy(
                            firstLineIndent = 0f,
                            multiline = true,
                            overflow = "auto",
                            paddingLeft = 0f,
                        ) ?: TextStyle(multiline = true),
                )
            val itemHeight = getTextHeight(textElement)
            val itemEndY = currentY + itemHeight
            if (itemEndY > maxYInTemplate && itemsRenderedOnCurrentPage > 0) {
                context.document.newPage()
                currentY = listStartY
                itemsRenderedOnCurrentPage = 0
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
