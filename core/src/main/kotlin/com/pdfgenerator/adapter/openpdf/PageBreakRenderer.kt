package com.pdfgenerator.adapter.openpdf

import com.pdfgenerator.engine.RenderContext
import com.pdfgenerator.engine.Renderer
import com.pdfgenerator.model.PageBreakElement
import com.pdfgenerator.util.ConditionEvaluator

object PageBreakRenderer : Renderer<PageBreakElement> {
    override fun render(
        element: PageBreakElement,
        context: RenderContext,
    ) {
        if (!ConditionEvaluator.evaluate(element.printCondition, context.data, context.loopContext)) {
            return
        }
        context.document.newPage()
        context.renderState?.currentY = 0f
    }
}
