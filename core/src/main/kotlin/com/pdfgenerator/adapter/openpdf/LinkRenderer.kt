package com.pdfgenerator.adapter.openpdf

import com.pdfgenerator.engine.RenderContext
import com.pdfgenerator.engine.Renderer
import com.pdfgenerator.model.LinkElement
import com.pdfgenerator.model.TextElement
import org.openpdf.text.Rectangle
import org.openpdf.text.pdf.PdfAction
import org.openpdf.text.pdf.PdfAnnotation

class LinkRenderer : Renderer<LinkElement> {
    private val textRenderer = TextRenderer()

    override fun render(
        element: LinkElement,
        context: RenderContext,
    ) {
        // Render the text using TextRenderer
        val textElement =
            TextElement(
                id = element.id,
                x = element.x,
                y = element.y,
                positionMode = element.positionMode,
                relativeOffsetY = element.relativeOffsetY,
                width = element.width,
                height = element.height,
                dataBinding = element.dataBinding,
                value = element.value,
                style = element.style,
                printCondition = element.printCondition,
            )
        textRenderer.render(textElement, context)

        // Calculate bounding box for the hyperlink
        val x = context.resolveX(element.x)
        val y = context.resolveY(element.y)
        val pageHeight = context.document.pageSize.height
        val yTop = CoordinateUtils.topYToPdfTop(pageHeight, y)

        val width = element.width ?: 100f
        val height = element.height ?: (element.style?.fontSize ?: 12f)

        // yTop is the top edge. The bottom edge is yTop - height
        val rect = Rectangle(x, yTop - height, x + width, yTop)

        // Resolve URL data binding if needed, for simplicity we just use the url directly or could resolve it
        val url = element.url // If you want to support data binding for URL, you can resolve it here.

        val action = PdfAction(url)
        val annotation = PdfAnnotation.createLink(context.writer, rect, PdfAnnotation.HIGHLIGHT_INVERT, action)
        context.writer.addAnnotation(annotation)
    }
}
