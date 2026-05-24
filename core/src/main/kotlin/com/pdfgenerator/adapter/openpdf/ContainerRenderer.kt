package com.pdfgenerator.adapter.openpdf

import com.pdfgenerator.engine.RenderContext
import com.pdfgenerator.engine.RenderEngine
import com.pdfgenerator.engine.Renderer
import com.pdfgenerator.model.ContainerElement

class ContainerRenderer(private val renderEngine: RenderEngine) : Renderer<ContainerElement> {
    override fun render(
        element: ContainerElement,
        context: RenderContext,
    ) {
        val childContext =
            context.copy(
                offsetX = context.offsetX + element.x,
                offsetY = context.offsetY + element.y,
                containerWidth = element.width,
                containerHeight = element.height,
            )

        element.elements.forEach { childElement ->
            renderEngine.render(childElement, childContext)
        }
    }
}
