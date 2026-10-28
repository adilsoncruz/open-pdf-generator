package com.pdfgenerator.adapter.openpdf

import com.pdfgenerator.engine.RenderContext

/**
 * Handles page boundary validation, automatic pagination, offset progression, and render state updates for loops.
 */
class LoopPageBreakHandler(
    private val context: RenderContext,
    private val loopBaseY: Float,
    private val itemHeight: Float,
    private val itemSpacing: Float = 0f,
) {
    val maxYInTemplate: Float = calculateMaxContentHeight(context)
    val contextOffsetInBody: Float = context.offsetY - context.bodyOffsetY

    var itemsRenderedOnCurrentPage: Int = 0
        private set
    var totalItemsRendered: Int = 0
        private set
    var currentYOffset: Float = 0f
        private set
    var pageOffsetY: Float = context.offsetY
        private set
    var pageOffsetInBody: Float = contextOffsetInBody
        private set

    data class ItemPlacement(
        val pageOffsetY: Float,
        val itemStartY: Float,
    )

    fun prepareItemPosition(): ItemPlacement {
        var itemStartY = loopBaseY + currentYOffset
        val itemEndY = itemStartY + itemHeight
        val itemEndYInBody = pageOffsetInBody + itemEndY

        if (itemEndYInBody > maxYInTemplate && itemsRenderedOnCurrentPage > 0) {
            context.document.newPage()
            itemsRenderedOnCurrentPage = 0
            currentYOffset = 0f
            val restartAtTopOfBody = contextOffsetInBody > 0f
            pageOffsetY = if (restartAtTopOfBody) context.bodyOffsetY else context.offsetY
            pageOffsetInBody = if (restartAtTopOfBody) 0f else contextOffsetInBody
            itemStartY = if (restartAtTopOfBody) 0f else loopBaseY
        }

        return ItemPlacement(
            pageOffsetY = pageOffsetY,
            itemStartY = itemStartY,
        )
    }

    fun onItemRendered() {
        itemsRenderedOnCurrentPage++
        totalItemsRendered++
        currentYOffset += itemHeight + itemSpacing
    }

    fun updateRenderState() {
        context.renderState?.let { state ->
            val renderedHeight =
                (totalItemsRendered * itemHeight) +
                    ((totalItemsRendered - 1).coerceAtLeast(0) * itemSpacing)
            val finalYAbsolute = context.offsetY + loopBaseY + renderedHeight
            val finalYRelative = finalYAbsolute - context.bodyOffsetY
            state.updateMaxY(finalYRelative)
        }
    }

    companion object {
        fun calculateMaxContentHeight(context: RenderContext): Float {
            return context.containerHeight ?: run {
                val pageHeight = context.document.pageSize.height
                val margins = context.template.pageSettings.margins
                val headerHeight = context.template.pageSettings.header?.height ?: 0f
                val footerHeight = context.template.pageSettings.footer?.height ?: 0f
                val contentAreaTop = margins.top + headerHeight
                val contentAreaBottom = pageHeight - margins.bottom - footerHeight
                contentAreaBottom - contentAreaTop
            }
        }
    }
}
