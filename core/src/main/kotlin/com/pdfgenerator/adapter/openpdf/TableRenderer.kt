package com.pdfgenerator.adapter.openpdf

import com.pdfgenerator.engine.RenderContext
import com.pdfgenerator.engine.Renderer
import com.pdfgenerator.model.TableElement
import com.pdfgenerator.util.ConditionEvaluator
import com.pdfgenerator.util.DataBindingResolver

class TableRenderer(
    private val cellRenderer: TableCellRenderer = TableCellRenderer(),
    private val layoutCalculator: TableLayoutCalculator = TableLayoutCalculator(),
) : Renderer<TableElement> {

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

        val pageWidth = context.document.pageSize.width
        val margins = context.template.pageSettings.margins
        val availableWidth = context.containerWidth ?: (pageWidth - margins.left - margins.right)

        val table = layoutCalculator.createTable(element, availableWidth)

        cellRenderer.addHeaders(table, element, tableData.isNotEmpty())
        cellRenderer.addDataRows(table, element, tableData)

        val shouldPaginate = element.paginated ?: true
        val usePagination = shouldPaginate && !context.isSummaryPage

        layoutCalculator.renderTable(table, element, context, usePagination)
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
}
