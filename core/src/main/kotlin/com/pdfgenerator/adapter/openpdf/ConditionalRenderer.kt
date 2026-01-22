package com.pdfgenerator.adapter.openpdf

import com.pdfgenerator.engine.RenderContext
import com.pdfgenerator.engine.RenderEngine
import com.pdfgenerator.engine.Renderer
import com.pdfgenerator.model.ConditionalElement
import com.pdfgenerator.util.ExpressionEvaluator

class ConditionalRenderer(private val renderEngine: RenderEngine) : Renderer<ConditionalElement> {
    override fun render(
        element: ConditionalElement,
        context: RenderContext,
    ) {
        val conditionResult = ExpressionEvaluator.evaluate(element.condition, context.data, context.loopContext)

        if (conditionResult == true) {
            element.elements.forEach { childElement ->
                renderEngine.render(childElement, context)
            }
        }
    }
}
