package com.pdfgenerator.adapter.openpdf

import com.pdfgenerator.engine.RenderContext
import com.pdfgenerator.engine.Renderer
import com.pdfgenerator.model.SpacerElement

class SpacerRenderer : Renderer<SpacerElement> {
    override fun render(
        element: SpacerElement,
        context: RenderContext,
    ) {
        // Do nothing, it's just a spacer
    }
}
