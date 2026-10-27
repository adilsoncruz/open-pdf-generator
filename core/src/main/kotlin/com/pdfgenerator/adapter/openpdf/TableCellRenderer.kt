package com.pdfgenerator.adapter.openpdf

import com.lowagie.text.Element
import com.lowagie.text.Font
import com.lowagie.text.Phrase
import com.lowagie.text.pdf.BaseFont
import com.lowagie.text.pdf.PdfPCell
import com.lowagie.text.pdf.PdfPTable
import com.pdfgenerator.model.TableElement
import com.pdfgenerator.model.TableStyle
import com.pdfgenerator.util.ColorUtil
import com.pdfgenerator.util.ExpressionProcessor
import com.pdfgenerator.util.FontCache
import com.pdfgenerator.util.Formatter

class TableCellRenderer {
    private data class BorderValues(val top: Float, val right: Float, val bottom: Float, val left: Float)

    private data class ColumnMeta(
        val field: String?,
        val format: String?,
        val hasTransformations: Boolean,
        val hAlign: Int,
        val vAlign: Int,
        val isFirst: Boolean,
        val isLast: Boolean,
    )

    fun addHeaders(
        table: PdfPTable,
        element: TableElement,
        hasDataRows: Boolean = true,
    ) {
        val style = element.style
        val headerFontSize = style?.headerFontSize ?: 12f
        val headerFontFamily = style?.headerFontFamily ?: "Helvetica"
        val headerBorderType = style?.headerBorderType
        val baseFontName = getBaseFontName(headerFontFamily)

        val headerFont = Font(
            FontCache.getFont(baseFontName),
            headerFontSize,
            if (style?.headerFontWeight == "bold") Font.BOLD else Font.NORMAL,
        ).apply {
            color = ColorUtil.hexToColor(style?.getEffectiveHeaderColor() ?: "#000000")
        }

        val headerBg = style?.headerBackground?.takeIf { it != "transparent" }?.let { ColorUtil.hexToColor(it) }
        val paddingTop = style?.getEffectiveHeaderPaddingTop() ?: 5f
        val paddingRight = style?.getEffectiveHeaderPaddingRight() ?: 5f
        val paddingBottom = style?.getEffectiveHeaderPaddingBottom() ?: 5f
        val paddingLeft = style?.getEffectiveHeaderPaddingLeft() ?: 5f
        val headerBorderColor = style?.getEffectiveHeaderBorderColor()?.let { ColorUtil.hexToColor(it) }
        val borderValues = getHeaderBorderValues(style)
        val totalCols = element.columns.size

        element.columns.forEachIndexed { colIndex, column ->
            val cell = PdfPCell(Phrase(column.header, headerFont)).apply {
                if (headerBg != null) backgroundColor = headerBg
                this.paddingTop = paddingTop
                this.paddingRight = paddingRight
                this.paddingBottom = paddingBottom
                this.paddingLeft = paddingLeft
                horizontalAlignment = getAlignment(column.headerAlignment ?: column.alignment)
                verticalAlignment = getVerticalAlignment(column.headerVerticalAlignment ?: "center")
                borderColor = headerBorderColor
            }

            val isFirstColumn = colIndex == 0
            val isLastColumn = colIndex == totalCols - 1

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

    fun addDataRows(
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

        val baseFontName = getBaseFontName(cellFontFamily)
        val cellFont = Font(FontCache.getFont(baseFontName), cellFontSize, Font.NORMAL).apply {
            color = ColorUtil.hexToColor(style?.getEffectiveCellColor() ?: "#000000")
        }

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

                val cell = PdfPCell(Phrase(formattedValue, cellFont)).apply {
                    if (rowBgColor != null) backgroundColor = rowBgColor
                    this.paddingTop = paddingTop
                    this.paddingRight = paddingRight
                    this.paddingBottom = paddingBottom
                    this.paddingLeft = paddingLeft
                    horizontalAlignment = colMeta.hAlign
                    verticalAlignment = colMeta.vAlign
                    this.borderColor = borderColor
                }

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

    private fun getBaseFontName(fontFamily: String?): String {
        return when (fontFamily?.lowercase()) {
            "helvetica-bold" -> BaseFont.HELVETICA_BOLD
            "times" -> BaseFont.TIMES_ROMAN
            "courier" -> BaseFont.COURIER
            else -> BaseFont.HELVETICA
        }
    }

    private fun getHeaderBorderValues(style: TableStyle?): BorderValues {
        val borderWidth = style?.headerBorderWidth ?: style?.borderWidth ?: 1f
        return when (style?.headerBorderType) {
            "none" -> BorderValues(0f, 0f, 0f, 0f)
            "row", "all", "columns" -> BorderValues(borderWidth, borderWidth, borderWidth, borderWidth)
            "top-bottom" -> BorderValues(borderWidth, 0f, borderWidth, 0f)
            "left-right" -> BorderValues(0f, borderWidth, 0f, borderWidth)
            null -> BorderValues(0f, 0f, 0f, 0f)
            else -> BorderValues(borderWidth, borderWidth, borderWidth, borderWidth)
        }
    }

    private fun getCellBorderValues(style: TableStyle?): BorderValues {
        val borderWidth = style?.borderWidth ?: 1f
        return when (style?.cellBorderType) {
            "none" -> BorderValues(0f, 0f, 0f, 0f)
            "row", "all", "cells" -> BorderValues(borderWidth, borderWidth, borderWidth, borderWidth)
            "top-bottom" -> BorderValues(borderWidth, 0f, borderWidth, 0f)
            "left-right" -> BorderValues(0f, borderWidth, 0f, borderWidth)
            null -> BorderValues(0f, 0f, 0f, 0f)
            else -> BorderValues(borderWidth, borderWidth, borderWidth, borderWidth)
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
