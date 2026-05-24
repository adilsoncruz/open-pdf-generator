package com.pdfgenerator.adapter.openpdf

import com.pdfgenerator.engine.RenderContext
import com.pdfgenerator.engine.RenderEngine
import com.pdfgenerator.engine.Renderer
import com.pdfgenerator.model.ContainerElement
import com.pdfgenerator.model.LoopElement
import com.pdfgenerator.model.RectangleElement
import kotlin.math.max

class ContainerRenderer(private val renderEngine: RenderEngine) : Renderer<ContainerElement> {
    override fun render(
        element: ContainerElement,
        context: RenderContext,
    ) {
        val effectiveContainerHeight =
            context.containerHeight?.let { parentHeight -> max(parentHeight, element.height) } ?: element.height

        val containerContext =
            context.copy(
                offsetX = context.offsetX + element.x,
                offsetY = context.offsetY + element.y,
                containerWidth = element.width,
                containerHeight = effectiveContainerHeight,
            )

        element.elements.forEach { childElement ->
            val childContext =
                if (childElement is LoopElement) {
                    // Loop pagination must use page/body available height, not the container box height.
                    containerContext.copy(containerHeight = context.containerHeight)
                } else {
                    containerContext
                }

            val adjustedChildElement =
                if (childElement is RectangleElement) {
                    val isFullWidth = childElement.width.toString() == "100%" || childElement.width.toString() == "100.0%"
                    val isFullHeight = childElement.height.toString() == "100%" || childElement.height.toString() == "100.0%"
                    childElement.copy(
                        x = if (isFullWidth) 0f else childElement.x,
                        y = if (isFullHeight) 0f else childElement.y,
                    )
                } else {
                    childElement
                }

            renderEngine.render(adjustedChildElement, childContext)
        }
    }
}
