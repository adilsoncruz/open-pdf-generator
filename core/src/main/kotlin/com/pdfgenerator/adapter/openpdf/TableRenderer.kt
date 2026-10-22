package com.pdfgenerator.adapter.openpdf

import com.lowagie.text.Element
import com.lowagie.text.Font
import com.lowagie.text.Phrase
import com.lowagie.text.pdf.BaseFont
import com.lowagie.text.pdf.ColumnText
import com.lowagie.text.pdf.PdfPCell
import com.lowagie.text.pdf.PdfPTable
import com.pdfgenerator.engine.RenderContext
import com.pdfgenerator.engine.Renderer
import com.pdfgenerator.model.TableElement
import com.pdfgenerator.model.TableStyle
import com.pdfgenerator.util.ColorUtil
import com.pdfgenerator.util.ConditionEvaluator
import com.pdfgenerator.util.DataBindingResolver
import com.pdfgenerator.util.ExpressionProcessor
import com.pdfgenerator.util.FontCache
import com.pdfgenerator.util.Formatter
import com.pdfgenerator.util.withSyntheticPageNumber
import org.slf4j.LoggerFactory

class TableRenderer : Renderer<TableElement> {
    private val logger = LoggerFactory.getLogger(TableRenderer::class.java)

    private data class BorderValues(val top: Float, val right: Float, val bottom: Float, val left: Float)

    private fun getHeaderBorderValues(style: TableStyle?): BorderValues {
        val borderWidth = style?.headerBorderWidth ?: style?.borderWidth ?: 1f
        val borderType = style?.headerBorderType

        return when (borderType) {
            "none", null -> BorderValues(0f, 0f, 0f, 0f)
            "row", "all" -> BorderValues(borderWidth, borderWidth, borderWidth, borderWidth)
            "columns" -> BorderValues(borderWidth, borderWidth, borderWidth, borderWidth)
            "top-bottom" -> BorderValues(borderWidth, 0f, borderWidth, 0f)
            "left-right" -> BorderValues(0f, borderWidth, 0f, borderWidth)
            else -> BorderValues(borderWidth, borderWidth, borderWidth, borderWidth)
        }
    }

    private fun getCellBorderValues(style: TableStyle?): BorderValues {
        val borderWidth = style?.borderWidth ?: 1f
        val borderType = style?.cellBorderType

        return when (borderType) {
            "none", null -> BorderValues(0f, 0f, 0f, 0f)
            "row", "all" -> BorderValues(borderWidth, borderWidth, borderWidth, borderWidth)
            "cells" -> BorderValues(borderWidth, borderWidth, borderWidth, borderWidth)
            "top-bottom" -> BorderValues(borderWidth, 0f, borderWidth, 0f)
            "left-right" -> BorderValues(0f, borderWidth, 0f, borderWidth)
            else -> BorderValues(borderWidth, borderWidth, borderWidth, borderWidth)
        }
    }

    override fun render(
        element: TableElement,
        context: RenderContext,
    ) {
        if (!ConditionEvaluator.evaluate(element.printCondition, context.data, context.loopContext)) {
            return
        }

        val tableData = resolveTableData(element, context)
        if (tableData.isEmpty()) {
            return
        }

        val columnCount = element.columns.size
        val table = PdfPTable(columnCount)

        val pageWidth = context.document.pageSize.width
        val margins = context.template.pageSettings.margins
        val availableWidth = context.containerWidth ?: (pageWidth - margins.left - margins.right)

        val resolvedTableWidth = element.resolveWidth(availableWidth)

        val columnWidths = element.columns.map { it.width ?: 100f }
        val specifiedWidth = columnWidths.sum()

        val totalWidth = resolvedTableWidth

        val adjustedWidths =
            if (specifiedWidth != resolvedTableWidth) {
                val ratio = resolvedTableWidth / specifiedWidth
                columnWidths.map { it * ratio }.toFloatArray()
            } else {
                columnWidths.toFloatArray()
            }

        table.setWidths(adjustedWidths)
        table.totalWidth = totalWidth
        table.isLockedWidth = true

        addHeaders(table, element, tableData.isNotEmpty())
        addDataRows(table, element, tableData)

        val shouldPaginate = element.paginated ?: true
        val usePagination = shouldPaginate && !context.isSummaryPage

        if (usePagination) {
            table.headerRows = 1
            table.isSkipFirstHeader = false

            try {
                val pageHeight = context.document.pageSize.height

                fun getHeaderHeightForPage(pageNum: Int): Float {
                    val condition = context.headerPrintCondition
                    if (condition == null) return context.templateHeaderHeight
                    val pageData = withSyntheticPageNumber(context.data, pageNum)
                    return if (ConditionEvaluator.evaluate(condition, pageData, null)) {
                        context.templateHeaderHeight
                    } else {
                        0f
                    }
                }

                fun getFooterHeightForPage(pageNum: Int): Float {
                    val condition = context.footerPrintCondition
                    if (condition == null) return context.templateFooterHeight
                    val pageData = withSyntheticPageNumber(context.data, pageNum)
                    return if (ConditionEvaluator.evaluate(condition, pageData, null)) {
                        context.templateFooterHeight
                    } else {
                        0f
                    }
                }

                var currentPage = context.writer.pageNumber
                val footerHeightPage1 = getFooterHeightForPage(currentPage)
                val resolvedX = context.resolveX(element.x)
                val resolvedY = context.resolveY(element.y)
                val startY = pageHeight - resolvedY
                val bottomY = margins.bottom + footerHeightPage1

                table.calculateHeights(true)
                val canvas = context.writer.directContent
                val leftX = resolvedX
                val totalRows = table.size()
                val headerRowsCount = table.headerRows.coerceAtLeast(0)
                val headerHeight =
                    if (headerRowsCount > 0) {
                        (0 until headerRowsCount).sumOf { table.getRowHeight(it).toDouble() }.toFloat()
                    } else {
                        0f
                    }

                var currentRow = headerRowsCount
                var isFirstPage = true
                var firstPageHeight = 0f

                while (currentRow < totalRows) {
                    val pageStartY: Float
                    val pageBottomY: Float

                    if (isFirstPage) {
                        pageStartY = startY
                        pageBottomY = bottomY
                    } else {
                        context.document.newPage()
                        currentPage++
                        val headerHeightForPage = getHeaderHeightForPage(currentPage)
                        val footerHeightForPage = getFooterHeightForPage(currentPage)
                        pageStartY = pageHeight - margins.top - headerHeightForPage
                        pageBottomY = margins.bottom + footerHeightForPage
                    }

                    var currentY = pageStartY

                    if (headerRowsCount > 0) {
                        currentY = table.writeSelectedRows(0, headerRowsCount, leftX, currentY, canvas)
                    }

                    val startRow = currentRow
                    while (currentRow < totalRows) {
                        val rowHeight = table.getRowHeight(currentRow)
                        if (currentY - rowHeight < pageBottomY && currentRow > startRow) {
                            break
                        }
                        currentY -= rowHeight
                        currentRow++
                    }

                    val endRow = currentRow
                    val drawnBottomY =
                        table.writeSelectedRows(
                            startRow,
                            endRow,
                            leftX,
                            if (headerRowsCount > 0) pageStartY - headerHeight else pageStartY,
                            canvas,
                        )

                    if (isFirstPage) {
                        firstPageHeight = pageStartY - drawnBottomY
                        isFirstPage = false
                    }
                }

                if (context.renderState != null) {
                    val elementY = context.resolveY(element.y) - context.bodyOffsetY
                    context.renderState.updateMaxY(elementY + kotlin.math.abs(firstPageHeight))
                }
            } catch (e: Exception) {
                logger.error("Error adding table ${element.id}: ${e.message}", e)
                if (context.config.strictMode) {
                    throw e
                }
            }
        } else {
            val pageHeight = context.document.pageSize.height
            val resolvedX = context.resolveX(element.x)
            val resolvedY = context.resolveY(element.y)
            val yPosition = pageHeight - resolvedY

            val tableHeight =
                table.writeSelectedRows(
                    0,
                    -1,
                    resolvedX,
                    yPosition,
                    context.writer.directContent,
                )

            if (context.renderState != null) {
                val actualHeight = kotlin.math.abs(tableHeight)
                val elementY = context.resolveY(element.y) - context.bodyOffsetY
                context.renderState.updateMaxY(elementY + actualHeight)
            }
        }
    }

    private fun resolveTableData(
        element: TableElement,
        context: RenderContext,
    ): List<Map<String, Any?>> {
        val data = DataBindingResolver.resolve(element.dataBinding, context.data, context.loopContext)

        return when (data) {
            is List<*> ->
                data.mapNotNull { item ->
                    when (item) {
                        is Map<*, *> -> toStringKeyMap(item)
                        else -> null
                    }
                }
            else -> emptyList()
        }
    }

    @Suppress("UNCHECKED_CAST")
    private fun toStringKeyMap(map: Map<*, *>): Map<String, Any?> {
        return map as? Map<String, Any?> ?: map.mapKeys { it.key.toString() }
    }

    private fun addHeaders(
        table: PdfPTable,
        element: TableElement,
        hasDataRows: Boolean = true,
    ) {
        val style = element.style
        val headerFontSize = style?.headerFontSize ?: 12f
        val headerFontFamily = style?.headerFontFamily ?: "Helvetica"
        val headerBorderType = style?.headerBorderType

        element.columns.forEachIndexed { colIndex, column ->
            val baseFontName =
                when (headerFontFamily.lowercase()) {
                    "helvetica-bold" -> BaseFont.HELVETICA_BOLD
                    "times" -> BaseFont.TIMES_ROMAN
                    "courier" -> BaseFont.COURIER
                    else -> BaseFont.HELVETICA
                }

            val headerFont =
                Font(
                    FontCache.getFont(baseFontName),
                    headerFontSize,
                    if (style?.headerFontWeight == "bold") Font.BOLD else Font.NORMAL,
                )
            val effectiveHeaderColor = style?.getEffectiveHeaderColor() ?: "#000000"
            headerFont.color = ColorUtil.hexToColor(effectiveHeaderColor)


            val cell = PdfPCell(Phrase(column.header, headerFont))

            val headerBg = style?.headerBackground
            if (headerBg != null && headerBg != "transparent") {
                cell.backgroundColor = ColorUtil.hexToColor(headerBg)
            }

            val paddingTop = style?.getEffectiveHeaderPaddingTop() ?: 5f
            val paddingRight = style?.getEffectiveHeaderPaddingRight() ?: 5f
            val paddingBottom = style?.getEffectiveHeaderPaddingBottom() ?: 5f
            val paddingLeft = style?.getEffectiveHeaderPaddingLeft() ?: 5f

            cell.paddingTop = paddingTop
            cell.paddingRight = paddingRight
            cell.paddingBottom = paddingBottom
            cell.paddingLeft = paddingLeft

            val headerAlign = column.headerAlignment ?: column.alignment
            cell.horizontalAlignment = getAlignment(headerAlign)

            val headerVertAlign = column.headerVerticalAlignment ?: "center"
            cell.verticalAlignment = getVerticalAlignment(headerVertAlign)

            val headerBorderColor = style?.getEffectiveHeaderBorderColor()?.let { ColorUtil.hexToColor(it) }
            cell.borderColor = headerBorderColor

            val isFirstColumn = colIndex == 0
            val isLastColumn = colIndex == element.columns.size - 1
            val borderValues = getHeaderBorderValues(style)

            when (headerBorderType) {
                "columns" -> {
                    cell.borderWidthTop = borderValues.top
                    cell.borderWidthBottom = if (hasDataRows) borderValues.bottom / 2f else borderValues.bottom
                    cell.borderWidthLeft = if (isFirstColumn) borderValues.left else borderValues.left / 2f
                    cell.borderWidthRight = if (isLastColumn) borderValues.right else borderValues.right / 2f
                }
                "row" -> {
                    cell.borderWidthTop = borderValues.top
                    cell.borderWidthBottom = if (hasDataRows) borderValues.bottom / 2f else borderValues.bottom
                    cell.borderWidthLeft = if (isFirstColumn) borderValues.left else 0f
                    cell.borderWidthRight = if (isLastColumn) borderValues.right else 0f
                }
                else -> {
                    cell.borderWidthTop = borderValues.top
                    cell.borderWidthRight = borderValues.right
                    cell.borderWidthBottom = if (hasDataRows) borderValues.bottom / 2f else borderValues.bottom
                    cell.borderWidthLeft = borderValues.left
                }
            }

            table.addCell(cell)
        }
    }

    private data class ColumnMeta(
        val field: String?,
        val format: String?,
        val hasTransformations: Boolean,
        val hAlign: Int,
        val vAlign: Int,
        val isFirst: Boolean,
        val isLast: Boolean,
    )

    private fun addDataRows(
        table: PdfPTable,
        element: TableElement,
        data: List<Map<String, Any?>>,
    ) {
        val style = element.style
        val cellFontSize = style?.getEffectiveCellFontSize() ?: 10f
        val cellFontFamily = style?.fontFamily ?: "Helvetica"
        val cellBorderType = style?.cellBorderType
        val totalRows = data.size

        val borderValues = getCellBorderValues(style)
        val borderColor = style?.borderColor?.let { ColorUtil.hexToColor(it) }
        val paddingTop = style?.getEffectiveCellPaddingTop() ?: 5f
        val paddingRight = style?.getEffectiveCellPaddingRight() ?: 5f
        val paddingBottom = style?.getEffectiveCellPaddingBottom() ?: 5f
        val paddingLeft = style?.getEffectiveCellPaddingLeft() ?: 5f

        val normalBgColor = style?.cellBackground?.let { if (it != "transparent") ColorUtil.hexToColor(it) else null }
        val altBgColor =
            if (style?.alternateRowBackground != null && style.alternateRowBackground != "transparent") {
                ColorUtil.hexToColor(style.alternateRowBackground)
            } else {
                normalBgColor
            }

        val baseFontName =
            when (cellFontFamily.lowercase()) {
                "helvetica-bold" -> BaseFont.HELVETICA_BOLD
                "times" -> BaseFont.TIMES_ROMAN
                "courier" -> BaseFont.COURIER
                else -> BaseFont.HELVETICA
            }
        val cellFont = Font(FontCache.getFont(baseFontName), cellFontSize, Font.NORMAL)
        cellFont.color = ColorUtil.hexToColor(style?.getEffectiveCellColor() ?: "#000000")

        val columnMetas =
            element.columns.mapIndexed { index, col ->
                ColumnMeta(
                    field = col.field,
                    format = col.format,
                    hasTransformations = ExpressionProcessor.hasTransformations(col.field),
                    hAlign = getAlignment(col.alignment),
                    vAlign = getVerticalAlignment(col.verticalAlignment ?: "center"),
                    isFirst = index == 0,
                    isLast = index == element.columns.size - 1,
                )
            }

        data.forEachIndexed { rowIndex, row ->
            val isLastRow = rowIndex == totalRows - 1
            val rowBgColor = if (rowIndex % 2 == 1) altBgColor else normalBgColor

            columnMetas.forEach { colMeta ->
                val value =
                    when {
                        colMeta.field == null -> ""
                        colMeta.hasTransformations -> ExpressionProcessor.process(colMeta.field, row, null)
                        else -> row[colMeta.field]
                    }
                val formattedValue = Formatter.format(value, colMeta.format)

                val cell = PdfPCell(Phrase(formattedValue, cellFont))
                if (rowBgColor != null) {
                    cell.backgroundColor = rowBgColor
                }

                cell.paddingTop = paddingTop
                cell.paddingRight = paddingRight
                cell.paddingBottom = paddingBottom
                cell.paddingLeft = paddingLeft

                cell.horizontalAlignment = colMeta.hAlign
                cell.verticalAlignment = colMeta.vAlign
                cell.borderColor = borderColor

                when (cellBorderType) {
                    "cells" -> {
                        cell.borderWidthTop = borderValues.top / 2f
                        cell.borderWidthBottom = if (isLastRow) borderValues.bottom else borderValues.bottom / 2f
                        cell.borderWidthLeft = if (colMeta.isFirst) borderValues.left else borderValues.left / 2f
                        cell.borderWidthRight = if (colMeta.isLast) borderValues.right else borderValues.right / 2f
                    }
                    "row" -> {
                        cell.borderWidthTop = borderValues.top / 2f
                        cell.borderWidthBottom = if (isLastRow) borderValues.bottom else borderValues.bottom / 2f
                        cell.borderWidthLeft = if (colMeta.isFirst) borderValues.left else 0f
                        cell.borderWidthRight = if (colMeta.isLast) borderValues.right else 0f
                    }
                    else -> {
                        cell.borderWidthTop = borderValues.top / 2f
                        cell.borderWidthRight = borderValues.right
                        cell.borderWidthBottom = if (isLastRow) borderValues.bottom else borderValues.bottom / 2f
                        cell.borderWidthLeft = borderValues.left
                    }
                }

                table.addCell(cell)
            }
        }
    }

    private fun getAlignment(alignment: String?): Int {
        return when (alignment?.lowercase()) {
            "center" -> Element.ALIGN_CENTER
            "right" -> Element.ALIGN_RIGHT
            else -> Element.ALIGN_LEFT
        }
    }

    private fun getVerticalAlignment(alignment: String?): Int {
        return when (alignment?.lowercase()) {
            "top" -> Element.ALIGN_TOP
            "bottom" -> Element.ALIGN_BOTTOM
            else -> Element.ALIGN_MIDDLE
        }
    }
}
