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
            logger.warn("Data binding {} did not return a map for check list {}", element.dataBinding, element.id)
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

        val boxSize = style?.fontSize ?: 12f
        val checkColor = style?.color ?: "#000000"
        val baseCheckStyle = buildCheckStyle(element.checkStyle, checkColor, boxSize)
        val labelStartX = contentStartX + boxSize + 3f
        val labelWidth = kotlin.math.max(10f, contentWidth - boxSize - 3f)

        listData.entries.forEachIndexed { index, entry ->
            val label = entry.key?.toString() ?: ""
            val isChecked = entry.value == true
            val itemHeight = ListItemLayout.contentHeight(label, labelWidth, rowStyle)

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
                RectangleElement(
                    id = "${element.id}-box-$index",
                    x = contentStartX,
                    y = currentY,
                    width = boxSize,
                    height = boxSize,
                    positionMode = PositionMode.RELATIVE,
                    style = if (isChecked) baseCheckStyle.copy(fillColor = checkColor) else baseCheckStyle,
                ),
                context,
            )
            renderEngine.render(
                StaticTextElement(
                    id = "${element.id}-item-$index",
                    x = labelStartX,
                    y = currentY,
                    width = labelWidth,
                    height = itemHeight,
                    value = label,
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

    private fun buildCheckStyle(
        checkStyle: CheckStyle?,
        color: String,
        boxSize: Float,
    ): RectangleStyle =
        when (checkStyle) {
            CheckStyle.RECTANGLE ->
                RectangleStyle(borderWidth = 1.5f, cornerRadius = 0f, borderColor = color)
            CheckStyle.BORDERED ->
                RectangleStyle(borderWidth = 1.5f, cornerRadius = 2f, borderColor = color)
            CheckStyle.CIRCLE ->
                RectangleStyle(borderWidth = 1.5f, cornerRadius = boxSize / 2f, borderColor = color)
            null -> RectangleStyle(borderWidth = 1.5f, cornerRadius = 0f)
        }
}
