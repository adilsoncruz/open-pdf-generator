package com.pdfgenerator.engine

import com.pdfgenerator.model.TableElement
import com.pdfgenerator.util.DataBindingResolver

/**
 * Calculates height for table elements, rows, headers, and pagination splits.
 */
object TableHeightCalculator {
    fun calculateTableHeight(
        element: TableElement,
        data: Map<String, Any?>,
    ): Float {
        val tableData = DataBindingResolver.resolve(element.dataBinding, data, null)
        val itemCount = if (tableData is List<*>) tableData.size else 0
        return calculateHeaderHeight(element) + (itemCount * calculateRowHeight(element))
    }

    fun calculateHeaderHeight(element: TableElement): Float {
        val headerFontSize = element.style?.headerFontSize ?: 12f
        val headerPadding = (element.style?.headerPaddingTop ?: 5f) + (element.style?.headerPaddingBottom ?: 5f)
        return headerFontSize + headerPadding
    }

    fun calculateRowHeight(element: TableElement): Float {
        val fontSize = element.style?.fontSize ?: 10f
        val cellPadding = (element.style?.cellPaddingTop ?: 5f) + (element.style?.cellPaddingBottom ?: 5f)
        return fontSize + cellPadding
    }

    fun calculateRowsHeight(
        element: TableElement,
        rowCount: Int,
    ): Float {
        return rowCount * calculateRowHeight(element)
    }

    fun estimateRowsPerPage(
        element: TableElement,
        availableHeight: Float,
        includeHeader: Boolean = true,
    ): Int {
        val rowH = calculateRowHeight(element)
        if (rowH <= 0f) return 0
        val headerH = if (includeHeader) calculateHeaderHeight(element) else 0f
        val remainingH = availableHeight - headerH
        return if (remainingH > 0f) (remainingH / rowH).toInt() else 0
    }
}
