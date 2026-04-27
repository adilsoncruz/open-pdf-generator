package com.pdfgenerator.adapter.openpdf

import com.lowagie.text.pdf.BaseFont
import com.pdfgenerator.engine.RenderContext
import com.pdfgenerator.engine.RenderEngine
import com.pdfgenerator.engine.Renderer
import com.pdfgenerator.model.ListElement
import com.pdfgenerator.model.ListMode
import com.pdfgenerator.model.PositionMode
import com.pdfgenerator.model.StaticTextElement
import com.pdfgenerator.model.TextStyle
import com.pdfgenerator.util.DataBindingResolver
import com.pdfgenerator.util.FontCache
import org.slf4j.LoggerFactory

class ListRenderer(private val renderEngine: RenderEngine) : Renderer<ListElement> {
    private val logger = LoggerFactory.getLogger(ListRenderer::class.java)

    override fun render(
        element: ListElement,
        context: RenderContext,
    ) {
        val listData = DataBindingResolver.resolve(element.dataBinding, context.data, context.loopContext)

        if (listData !is List<*>) {
            logger.warn("Data binding ${element.dataBinding} did not return a list for list ${element.id}")
            return
        }

        if (listData.isEmpty()) {
            return
        }

        val listX = element.x
        val listStartY = element.startY ?: element.y
        val paddingLeft = element.style?.paddingLeft ?: element.style?.paddingX ?: 0f
        val paddingRight = element.style?.paddingRight ?: element.style?.paddingX ?: 0f
        val paddingTop = element.style?.paddingTop ?: element.style?.paddingY ?: 0f
        val paddingBottom = element.style?.paddingBottom ?: element.style?.paddingY ?: 0f
        val contentStartX = listX + paddingLeft
        val contentWidth = kotlin.math.max(10f, element.width - paddingLeft - paddingRight)

        val pageHeight = context.document.pageSize.height
        val margins = context.template.pageSettings.margins
        val footerHeight = context.template.pageSettings.footer?.height ?: 0f

        val contentAreaBottom = pageHeight - margins.bottom - footerHeight

        val maxYInTemplate = contentAreaBottom - paddingBottom

        var itemsRenderedOnCurrentPage = 0
        var currentY = listStartY + paddingTop

        listData.forEachIndexed { index, item ->
            val prefix = getRenderablePrefix(buildPrefix(element, index), element)
            val prefixOffset = getPrefixOffset(prefix, element)
            val measurementTextElement =
                StaticTextElement(
                    id = "${element.id}-item-$index",
                    x = contentStartX + prefixOffset,
                    y = currentY,
                    width = kotlin.math.max(10f, contentWidth - prefixOffset),
                    height = element.itemSpacing + (element.style?.fontSize ?: 10f),
                    value = "$item",
                    positionMode = PositionMode.RELATIVE,
                    style =
                        element.style?.copy(
                            firstLineIndent = 0f,
                            multiline = true,
                            overflow = "auto",
                            paddingLeft = 0f,
                        ) ?: TextStyle(multiline = true),
                )
            val itemHeight = getTextHeight(measurementTextElement)
            val itemEndY = currentY + itemHeight
            if (itemEndY > maxYInTemplate && itemsRenderedOnCurrentPage > 0) {
                context.document.newPage()
                currentY = listStartY + paddingTop
                itemsRenderedOnCurrentPage = 0
            }

            val prefixElement =
                StaticTextElement(
                    id = "${element.id}-prefix-$index",
                    x = contentStartX,
                    y = currentY,
                    width = contentWidth,
                    height = element.itemSpacing + (element.style?.fontSize ?: 10f),
                    value = prefix,
                    positionMode = PositionMode.RELATIVE,
                    style =
                        element.style?.copy(
                            firstLineIndent = 0f,
                            multiline = true,
                            overflow = "auto",
                            paddingLeft = 0f,
                        ) ?: TextStyle(multiline = true),
                )
            val textElement = measurementTextElement.copy(y = currentY)

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

    private fun buildPrefix(
        element: ListElement,
        index: Int,
    ): String {
        if (element.listStyle == null) {
            return " "
        }
        return when (element.listStyle) {
            ListMode.NUMBERED -> "${index + 1}. "
            ListMode.BULLETED -> "• "
            ListMode.START -> "★ "
            ListMode.DASH -> "– "
            ListMode.DIAMOND -> "◆ "
        }
    }

    private fun getPrefixOffset(
        prefix: String,
        element: ListElement,
    ): Float {
        val baseFont = getBaseFont(element)
        val fontSize = element.style?.fontSize ?: 12f
        val prefixWidth = baseFont.getWidthPoint(prefix, fontSize)
        val minGap = 4f
        return prefixWidth + minGap
    }

    private fun getRenderablePrefix(
        prefix: String,
        element: ListElement,
    ): String {
        val baseFont = getBaseFont(element)
        val isRenderable =
            prefix.all { char ->
                char.isWhitespace() || baseFont.charExists(char.code)
            }

        if (isRenderable) return prefix

        return when (element.listStyle) {
            ListMode.START -> "* "
            ListMode.DIAMOND -> "+ "
            else -> prefix
        }
    }

    private fun getBaseFont(element: ListElement): BaseFont {
        val fontFamily = element.style?.fontFamily ?: "Helvetica"
        val baseFontName =
            when {
                fontFamily.lowercase().contains("times") -> BaseFont.TIMES_ROMAN
                fontFamily.lowercase().contains("courier") -> BaseFont.COURIER
                else -> BaseFont.HELVETICA
            }
        return FontCache.getFont(baseFontName)
    }
}
