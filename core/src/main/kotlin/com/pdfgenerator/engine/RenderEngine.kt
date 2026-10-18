package com.pdfgenerator.engine

import com.pdfgenerator.adapter.openpdf.BarcodeRenderer
import com.pdfgenerator.adapter.openpdf.ConditionalRenderer
import com.pdfgenerator.adapter.openpdf.ContainerRenderer
import com.pdfgenerator.adapter.openpdf.ImageRenderer
import com.pdfgenerator.adapter.openpdf.LineRenderer
import com.pdfgenerator.adapter.openpdf.LinkRenderer
import com.pdfgenerator.adapter.openpdf.LoopRenderer
import com.pdfgenerator.adapter.openpdf.PageBreakRenderer
import com.pdfgenerator.adapter.openpdf.RectangleRenderer
import com.pdfgenerator.adapter.openpdf.RichTextRenderer
import com.pdfgenerator.adapter.openpdf.SpacerRenderer
import com.pdfgenerator.adapter.openpdf.StaticTextRenderer
import com.pdfgenerator.adapter.openpdf.TableRenderer
import com.pdfgenerator.adapter.openpdf.TextRenderer
import com.pdfgenerator.api.PDFGeneratorConfig
import com.pdfgenerator.model.BarcodeElement
import com.pdfgenerator.model.ConditionalElement
import com.pdfgenerator.model.ContainerElement
import com.pdfgenerator.model.Element
import com.pdfgenerator.model.ImageElement
import com.pdfgenerator.model.LineElement
import com.pdfgenerator.model.LinkElement
import com.pdfgenerator.model.LoopElement
import com.pdfgenerator.model.PageBreakElement
import com.pdfgenerator.model.RectangleElement
import com.pdfgenerator.model.RichTextElement
import com.pdfgenerator.model.SpacerElement
import com.pdfgenerator.model.StaticTextElement
import com.pdfgenerator.model.TableElement
import com.pdfgenerator.model.TextElement
import org.slf4j.LoggerFactory

class RenderEngine(private val config: PDFGeneratorConfig) {
    private val logger = LoggerFactory.getLogger(RenderEngine::class.java)
    private val textRenderer = TextRenderer()
    private val richTextRenderer = RichTextRenderer()
    private val staticTextRenderer = StaticTextRenderer()
    private val imageRenderer = ImageRenderer(config)
    private val tableRenderer = TableRenderer()
    private val rectangleRenderer = RectangleRenderer()
    private val lineRenderer = LineRenderer()
    private val barcodeRenderer = BarcodeRenderer()
    private val conditionalRenderer = ConditionalRenderer(this)
    private val loopRenderer = LoopRenderer(this)
    private val containerRenderer = ContainerRenderer(this)

    private val spacerRenderer = SpacerRenderer()
    private val linkRenderer = LinkRenderer()

    fun render(
        element: Element,
        context: RenderContext,
    ) {
        logger.debug(
            "Rendering element type={} id={} x={} y={} positionMode={} offsetX={} offsetY={} bodyOffsetY={}",
            element.type,
            element.id,
            element.x,
            element.y,
            element.positionMode,
            context.offsetX,
            context.offsetY,
            context.bodyOffsetY,
        )
        when (element) {
            is TextElement -> textRenderer.render(element, context)
            is RichTextElement -> richTextRenderer.render(element, context)
            is StaticTextElement -> staticTextRenderer.render(element, context)
            is ImageElement -> imageRenderer.render(element, context)
            is TableElement -> tableRenderer.render(element, context)
            is RectangleElement -> rectangleRenderer.render(element, context)
            is LineElement -> lineRenderer.render(element, context)
            is BarcodeElement -> barcodeRenderer.render(element, context)
            is ConditionalElement -> conditionalRenderer.render(element, context)
            is LoopElement -> loopRenderer.render(element, context)
            is ContainerElement -> containerRenderer.render(element, context)
            is PageBreakElement -> PageBreakRenderer.render(element, context)
            is SpacerElement -> spacerRenderer.render(element, context)
            is LinkElement -> linkRenderer.render(element, context)
        }
    }
}
