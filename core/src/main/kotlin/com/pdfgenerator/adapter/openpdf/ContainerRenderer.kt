package com.pdfgenerator.adapter.openpdf

import com.pdfgenerator.engine.RenderContext
import com.pdfgenerator.engine.RenderEngine
import com.pdfgenerator.engine.Renderer
import com.pdfgenerator.model.ContainerElement
import com.pdfgenerator.model.LoopElement

class ContainerRenderer(private val renderEngine: RenderEngine) : Renderer<ContainerElement> {
    override fun render(
        element: ContainerElement,
        context: RenderContext,
    ) {
        val containerContext =
            context.copy(
                offsetX = context.offsetX + element.x,
                offsetY = context.offsetY + element.y,
                containerWidth = element.width,
                containerHeight = element.height,
            )

        element.elements.forEach { childElement ->
            val childContext =
                if (childElement is LoopElement) {
                    // Loop pagination must use page/body available height, not the container box height.
                    containerContext.copy(containerHeight = context.containerHeight)
                } else {
                    containerContext
                }
            renderEngine.render(childElement, childContext)
        }
    }
}
