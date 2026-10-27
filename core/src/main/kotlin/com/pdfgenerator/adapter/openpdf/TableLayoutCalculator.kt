package com.pdfgenerator.adapter.openpdf

import com.lowagie.text.pdf.PdfPTable
import com.pdfgenerator.engine.RenderContext
import com.pdfgenerator.model.TableElement
import com.pdfgenerator.util.ConditionEvaluator
import com.pdfgenerator.util.withSyntheticPageNumber
import org.slf4j.LoggerFactory
import kotlin.math.abs

class TableLayoutCalculator {
    private val logger = LoggerFactory.getLogger(TableLayoutCalculator::class.java)

    fun calculateColumnWidths(
        element: TableElement,
        availableWidth: Float,
    ): FloatArray {
        val resolvedTableWidth = element.resolveWidth(availableWidth)
        val columnWidths = element.columns.map { it.width ?: 100f }
        val specifiedWidth = columnWidths.sum()

        return if (specifiedWidth != resolvedTableWidth) {
            val ratio = resolvedTableWidth / specifiedWidth
            columnWidths.map { it * ratio }.toFloatArray()
        } else {
            columnWidths.toFloatArray()
        }
    }

    fun createTable(
        element: TableElement,
        availableWidth: Float,
    ): PdfPTable {
        val columnCount = element.columns.size
        val table = PdfPTable(columnCount)
        val resolvedTableWidth = element.resolveWidth(availableWidth)
        val adjustedWidths = calculateColumnWidths(element, availableWidth)

        table.setWidths(adjustedWidths)
        table.totalWidth = resolvedTableWidth
        table.isLockedWidth = true
        return table
    }

    fun renderTable(
        table: PdfPTable,
        element: TableElement,
        context: RenderContext,
        usePagination: Boolean,
    ) {
        if (usePagination) {
            renderPaginated(table, element, context)
        } else {
            renderUnpaginated(table, element, context)
        }
    }

    private fun renderPaginated(
        table: PdfPTable,
        element: TableElement,
        context: RenderContext,
    ) {
        val margins = context.template.pageSettings.margins
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
                context.renderState.updateMaxY(elementY + abs(firstPageHeight))
            }
        } catch (e: Exception) {
            logger.error("Error adding table ${element.id}: ${e.message}", e)
            if (context.config.strictMode) {
                throw e
            }
        }
    }

    private fun renderUnpaginated(
        table: PdfPTable,
        element: TableElement,
        context: RenderContext,
    ) {
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
            val actualHeight = abs(tableHeight)
            val elementY = context.resolveY(element.y) - context.bodyOffsetY
            context.renderState.updateMaxY(elementY + actualHeight)
        }
    }
}
