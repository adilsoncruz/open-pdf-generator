package com.pdfgenerator.adapter.openpdf

import com.pdfgenerator.engine.RenderContext
import com.pdfgenerator.model.PageBreakElement

object PageBreakRenderer {
    fun render(
        element: PageBreakElement,
        context: RenderContext,
    ) {
        context.document.newPage()
        context.renderState?.currentY = 0f
    }
}
