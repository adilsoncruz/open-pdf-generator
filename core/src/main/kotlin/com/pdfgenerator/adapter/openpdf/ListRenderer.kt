package com.pdfgenerator.adapter.openpdf

import com.pdfgenerator.engine.RenderContext
import com.pdfgenerator.engine.RenderEngine
import com.pdfgenerator.engine.Renderer
import com.pdfgenerator.model.ListElement
import com.pdfgenerator.model.ListMode
import com.pdfgenerator.model.PositionMode
import com.pdfgenerator.model.StaticTextElement
import com.pdfgenerator.util.DataBindingResolver
import com.pdfgenerator.util.FontCache
import org.openpdf.text.pdf.BaseFont
import org.slf4j.LoggerFactory

class ListRenderer(private val renderEngine: RenderEngine) : Renderer<ListElement> {
    private val logger = LoggerFactory.getLogger(ListRenderer::class.java)

    override fun render(
        element: ListElement,
        context: RenderContext,
    ) {
        val listData = DataBindingResolver.resolve(element.dataBinding, context.data, context.loopContext)

        if (listData !is List<*>) {
            logger.warn("Data binding {} did not return a list for list {}", element.dataBinding, element.id)
            return
        }

        if (listData.isEmpty()) {
            return
        }

        val style = element.style
        val paddingLeft = style?.paddingLeft ?: 0f
        val paddingRight = style?.paddingRight ?: 0f
        val paddingTop = style?.paddingTop ?: 0f
        val paddingBottom = style?.paddingBottom ?: 0f
        val contentStartX = element.x + paddingLeft
        val contentWidth = kotlin.math.max(10f, element.width - paddingLeft - paddingRight)

        val listStartY = element.startY ?: element.y
        val pageHeight = context.document.pageSize.height
        val margins = context.template.pageSettings.margins
        val footerHeight = context.template.pageSettings.footer?.height ?: 0f
        val maxYInTemplate = pageHeight - margins.bottom - footerHeight - paddingBottom

        var itemsRenderedOnCurrentPage = 0
        var currentY = listStartY + paddingTop
        val rowStyle = ListItemLayout.rowStyle(style)
        val backgroundColor = style?.backgroundColor

        listData.forEachIndexed { index, item ->
            val prefix = getRenderablePrefix(buildPrefix(element, index), element)
            val prefixOffset = getPrefixOffset(prefix, element)
            val itemText = item?.toString() ?: ""
            val itemWidth = kotlin.math.max(10f, contentWidth - prefixOffset)

            val itemHeight = ListItemLayout.contentHeight(itemText, itemWidth, rowStyle)
            if (currentY + itemHeight > maxYInTemplate && itemsRenderedOnCurrentPage > 0) {
                context.document.newPage()
                currentY = listStartY + paddingTop
                itemsRenderedOnCurrentPage = 0
            }

            if (ListItemLayout.isVisibleBackground(backgroundColor)) {
                val isFirstItemOnPage = itemsRenderedOnCurrentPage == 0
                val rowBackgroundY = if (isFirstItemOnPage) listStartY else currentY - 0.25f
                val rowBackgroundHeight = itemHeight + element.itemSpacing + if (isFirstItemOnPage) paddingTop else 0f
                ListItemLayout.renderRowBackground(
                    renderEngine = renderEngine,
                    context = context,
                    elementId = element.id,
                    index = index,
                    x = element.x,
                    width = element.width,
                    rowY = rowBackgroundY,
                    rowHeight = rowBackgroundHeight + if (isFirstItemOnPage) 0f else 0.5f,
                    backgroundColor = backgroundColor!!,
                )
            }

            renderEngine.render(
                StaticTextElement(
                    id = "${element.id}-prefix-$index",
                    x = contentStartX,
                    y = currentY,
                    width = contentWidth,
                    height = itemHeight,
                    value = prefix,
                    positionMode = PositionMode.RELATIVE,
                    style = rowStyle,
                ),
                context,
            )
            renderEngine.render(
                StaticTextElement(
                    id = "${element.id}-item-$index",
                    x = contentStartX + prefixOffset,
                    y = currentY,
                    width = itemWidth,
                    height = itemHeight,
                    value = itemText,
                    positionMode = PositionMode.RELATIVE,
                    style = rowStyle,
                ),
                context,
            )

            itemsRenderedOnCurrentPage++
            currentY += itemHeight + element.itemSpacing
            context.renderState?.let { state ->
                state.currentY = currentY - element.itemSpacing - context.bodyOffsetY
            }
        }
    }

    private fun buildPrefix(
        element: ListElement,
        index: Int,
    ): String =
        when (element.listStyle) {
            ListMode.NUMBERED -> "${index + 1}. "
            ListMode.BULLETED -> "• "
            ListMode.START -> "★ "
            ListMode.DASH -> "– "
            ListMode.DIAMOND -> "◆ "
            null -> " "
        }

    private fun getPrefixOffset(
        prefix: String,
        element: ListElement,
    ): Float {
        val fontSize = element.style?.fontSize ?: 12f
        val prefixWidth = getBaseFont(element).getWidthPoint(prefix, fontSize)
        val minGap = 4f
        return prefixWidth + minGap
    }

    private fun getRenderablePrefix(
        prefix: String,
        element: ListElement,
    ): String {
        val baseFont = getBaseFont(element)
        val isRenderable = prefix.all { char -> char.isWhitespace() || baseFont.charExists(char.code) }
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
