package com.pdfgenerator.adapter.openpdf

import com.lowagie.text.Element
import com.lowagie.text.Font
import com.lowagie.text.Phrase
import com.lowagie.text.pdf.BaseFont
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

    override fun render(element: TableElement, context: RenderContext) {
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

        val adjustedWidths = if (specifiedWidth != resolvedTableWidth) {
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
                // For relative positioning, we need to use absolute positioning
                // to respect the calculated Y position
                val pageHeight = context.document.pageSize.height
                val yPosition = pageHeight - element.y
                
                // Write table at the calculated position
                val tableHeight = table.writeSelectedRows(
                    0, -1,
                    element.x, yPosition,
                    context.writer.directContent
                )
                
                // Update render state with the actual table height
                if (context.renderState != null) {
                    val actualHeight = kotlin.math.abs(tableHeight)
                    val elementY = element.y - context.bodyOffsetY
                    context.renderState.updateMaxY(elementY + actualHeight)
                }
            } catch (e: Exception) {
                logger.error("Error adding table ${element.id}: ${e.message}", e)
                if (context.config.strictMode) {
                    throw e
                }
            }
        } else {
            val pageHeight = context.document.pageSize.height
            val yPosition = pageHeight - element.y

            val tableHeight = table.writeSelectedRows(
                0, -1,
                element.x, yPosition,
                context.writer.directContent
            )
            
            // Update render state with the actual table height
            if (context.renderState != null) {
                val actualHeight = kotlin.math.abs(tableHeight)
                val elementY = element.y - context.bodyOffsetY
                context.renderState.updateMaxY(elementY + actualHeight)
            }
        }
    }

    private fun resolveTableData(element: TableElement, context: RenderContext): List<Map<String, Any?>> {
        val data = DataBindingResolver.resolve(element.dataBinding, context.data, context.loopContext)

        return when (data) {
            is List<*> -> data.mapNotNull { item ->
                when (item) {
                    is Map<*, *> -> item.mapKeys { it.key.toString() }
                    else -> null
                }
            }
            else -> emptyList()
        }
    }

    private fun addHeaders(table: PdfPTable, element: TableElement, hasDataRows: Boolean = true) {
        val style = element.style
        val headerFontSize = style?.headerFontSize ?: 12f
        val headerFontFamily = style?.headerFontFamily ?: "Helvetica"
        val headerBorderType = style?.headerBorderType

        element.columns.forEachIndexed { colIndex, column ->
            val baseFontName = when (headerFontFamily.lowercase()) {
                "helvetica-bold" -> BaseFont.HELVETICA_BOLD
                "times" -> BaseFont.TIMES_ROMAN
                "courier" -> BaseFont.COURIER
                else -> BaseFont.HELVETICA
            }

            val headerFont = Font(
                FontCache.getFont(baseFontName),
                headerFontSize,
                if (style?.headerFontWeight == "bold") Font.BOLD else Font.NORMAL
            )
            headerFont.color = style?.headerColor?.let { ColorUtil.hexToColor(it) }

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

    private fun addDataRows(table: PdfPTable, element: TableElement, data: List<Map<String, Any?>>) {
        val style = element.style
        val cellFontSize = style?.getEffectiveCellFontSize() ?: 10f
        val cellFontFamily = style?.fontFamily ?: "Helvetica"
        val cellBorderType = style?.cellBorderType
        val totalRows = data.size

        data.forEachIndexed { rowIndex, row ->
            val isFirstRow = rowIndex == 0
            val isLastRow = rowIndex == totalRows - 1

            element.columns.forEachIndexed { colIndex, column ->
                val value = if (ExpressionProcessor.hasTransformations(column.field)) {
                    ExpressionProcessor.process(column.field, row.mapKeys { it.key }, null)
                } else {
                    row[column.field]
                }
                val formattedValue = Formatter.format(value, column.format)

                val baseFontName = when (cellFontFamily.lowercase()) {
                    "helvetica-bold" -> BaseFont.HELVETICA_BOLD
                    "times" -> BaseFont.TIMES_ROMAN
                    "courier" -> BaseFont.COURIER
                    else -> BaseFont.HELVETICA
                }

                val cellFont = Font(
                    FontCache.getFont(baseFontName),
                    cellFontSize,
                    Font.NORMAL
                )
                cellFont.color = ColorUtil.hexToColor(style?.getEffectiveCellColor() ?: "#000000")

                val cell = PdfPCell(Phrase(formattedValue, cellFont))

                val cellBg = if (rowIndex % 2 == 1 && style?.alternateRowBackground != null) {
                    style.alternateRowBackground
                } else {
                    style?.cellBackground
                }

                if (cellBg != null && cellBg != "transparent") {
                    cell.backgroundColor = ColorUtil.hexToColor(cellBg)
                }

                val paddingTop = style?.getEffectiveCellPaddingTop() ?: 5f
                val paddingRight = style?.getEffectiveCellPaddingRight() ?: 5f
                val paddingBottom = style?.getEffectiveCellPaddingBottom() ?: 5f
                val paddingLeft = style?.getEffectiveCellPaddingLeft() ?: 5f

                cell.paddingTop = paddingTop
                cell.paddingRight = paddingRight
                cell.paddingBottom = paddingBottom
                cell.paddingLeft = paddingLeft

                cell.horizontalAlignment = getAlignment(column.alignment)

                val vertAlign = column.verticalAlignment ?: "center"
                cell.verticalAlignment = getVerticalAlignment(vertAlign)

                cell.borderColor = style?.borderColor?.let { ColorUtil.hexToColor(it) }

                val isFirstColumn = colIndex == 0
                val isLastColumn = colIndex == element.columns.size - 1
                val borderValues = getCellBorderValues(style)

                when (cellBorderType) {
                    "cells" -> {
                        cell.borderWidthTop = borderValues.top / 2f
                        cell.borderWidthBottom = if (isLastRow) borderValues.bottom else borderValues.bottom / 2f
                        cell.borderWidthLeft = if (isFirstColumn) borderValues.left else borderValues.left / 2f
                        cell.borderWidthRight = if (isLastColumn) borderValues.right else borderValues.right / 2f
                    }
                    "row" -> {
                        cell.borderWidthTop = borderValues.top / 2f
                        cell.borderWidthBottom = if (isLastRow) borderValues.bottom else borderValues.bottom / 2f
                        cell.borderWidthLeft = if (isFirstColumn) borderValues.left else 0f
                        cell.borderWidthRight = if (isLastColumn) borderValues.right else 0f
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

