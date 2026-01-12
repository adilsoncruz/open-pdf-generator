package com.pdfgenerator.engine

import com.pdfgenerator.adapter.openpdf.*
import com.pdfgenerator.api.PDFGeneratorConfig
import com.pdfgenerator.model.*
import org.slf4j.LoggerFactory

class RenderEngine(private val config: PDFGeneratorConfig) {
    private val logger = LoggerFactory.getLogger(RenderEngine::class.java)

    private val textRenderer = TextRenderer()
    private val staticTextRenderer = StaticTextRenderer()
    private val imageRenderer = ImageRenderer(config)
    private val tableRenderer = TableRenderer()
    private val rectangleRenderer = RectangleRenderer()
    private val lineRenderer = LineRenderer()
    private val barcodeRenderer = BarcodeRenderer()
    private val conditionalRenderer = ConditionalRenderer(this)
    private val loopRenderer = LoopRenderer(this)

    fun render(element: Element, context: RenderContext) {
        when (element) {
            is TextElement -> textRenderer.render(element, context)
            is StaticTextElement -> staticTextRenderer.render(element, context)
            is ImageElement -> imageRenderer.render(element, context)
            is TableElement -> tableRenderer.render(element, context)
            is RectangleElement -> rectangleRenderer.render(element, context)
            is LineElement -> lineRenderer.render(element, context)
            is BarcodeElement -> barcodeRenderer.render(element, context)
            is ConditionalElement -> conditionalRenderer.render(element, context)
            is LoopElement -> loopRenderer.render(element, context)
        }
    }
}

