package com.pdfgenerator.engine

import com.pdfgenerator.adapter.openpdf.BarcodeRenderer
import com.pdfgenerator.adapter.openpdf.CheckListRenderer
import com.pdfgenerator.adapter.openpdf.ConditionalRenderer
import com.pdfgenerator.adapter.openpdf.ImageRenderer
import com.pdfgenerator.adapter.openpdf.LineRenderer
import com.pdfgenerator.adapter.openpdf.ListRenderer
import com.pdfgenerator.adapter.openpdf.LoopRenderer
import com.pdfgenerator.adapter.openpdf.RectangleRenderer
import com.pdfgenerator.adapter.openpdf.StaticTextRenderer
import com.pdfgenerator.adapter.openpdf.TableRenderer
import com.pdfgenerator.adapter.openpdf.TextRenderer
import com.pdfgenerator.api.PDFGeneratorConfig
import com.pdfgenerator.model.BarcodeElement
import com.pdfgenerator.model.CheckListElement
import com.pdfgenerator.model.ConditionalElement
import com.pdfgenerator.model.Element
import com.pdfgenerator.model.ImageElement
import com.pdfgenerator.model.LineElement
import com.pdfgenerator.model.ListElement
import com.pdfgenerator.model.LoopElement
import com.pdfgenerator.model.RectangleElement
import com.pdfgenerator.model.StaticTextElement
import com.pdfgenerator.model.TableElement
import com.pdfgenerator.model.TextElement

class RenderEngine(private val config: PDFGeneratorConfig) {
    private val textRenderer = TextRenderer()
    private val staticTextRenderer = StaticTextRenderer()
    private val imageRenderer = ImageRenderer(config)
    private val tableRenderer = TableRenderer()
    private val rectangleRenderer = RectangleRenderer()
    private val lineRenderer = LineRenderer()
    private val barcodeRenderer = BarcodeRenderer()
    private val conditionalRenderer = ConditionalRenderer(this)
    private val loopRenderer = LoopRenderer(this)
    private val listRenderer = ListRenderer(this)
    private val checkListRenderer = CheckListRenderer(this)

    fun render(
        element: Element,
        context: RenderContext,
    ) {
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
            is ListElement -> listRenderer.render(element, context)
            is CheckListElement -> checkListRenderer.render(element, context)
        }
    }
}
