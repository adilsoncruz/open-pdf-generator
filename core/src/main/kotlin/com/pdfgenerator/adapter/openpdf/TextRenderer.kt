package com.pdfgenerator.adapter.openpdf

import com.pdfgenerator.engine.RenderContext
import com.pdfgenerator.engine.Renderer
import com.pdfgenerator.engine.TextLayoutCacheKey
import com.pdfgenerator.engine.TextLayoutMeasurement
import com.pdfgenerator.model.TextElement
import com.pdfgenerator.util.ColorUtil
import com.pdfgenerator.util.ConditionEvaluator
import org.openpdf.text.pdf.BaseFont
import org.openpdf.text.pdf.PdfContentByte

class TextRenderer : Renderer<TextElement> {
    companion object {
        fun getOrMeasureMultilineLayout(
            elementId: String,
            resolvedText: String,
            styleHash: Int,
            boxWidth: Float,
            fontSize: Float,
            lineHeight: Float?,
            paddingTop: Float,
            paddingBottom: Float,
            paddingLeft: Float,
            paddingRight: Float,
            firstLineIndent: Float,
            fontFamily: String,
            cache: MutableMap<TextLayoutCacheKey, TextLayoutMeasurement>? = null,
            baseFont: BaseFont? = null,
        ): TextLayoutMeasurement =
            TextLayoutHelper.getOrMeasureMultilineLayout(
                elementId, resolvedText, styleHash, boxWidth, fontSize, lineHeight,
                paddingTop, paddingBottom, paddingLeft, paddingRight, firstLineIndent, fontFamily, cache, baseFont,
            )

        fun calculateContentHeight(
            text: String,
            boxWidth: Float,
            fontSize: Float,
            lineHeight: Float?,
            paddingTop: Float,
            paddingBottom: Float,
            paddingLeft: Float,
            paddingRight: Float,
            firstLineIndent: Float,
            fontFamily: String,
        ): Float =
            TextLayoutHelper.calculateContentHeight(
                text, boxWidth, fontSize, lineHeight,
                paddingTop, paddingBottom, paddingLeft, paddingRight, firstLineIndent, fontFamily,
            )
    }

    override fun render(
        element: TextElement,
        context: RenderContext,
    ) {
        if (!ConditionEvaluator.evaluate(element.printCondition, context.data, context.loopContext)) {
            return
        }

        val text = TextSpanBuilder.resolveText(element, context)
        if (text.isNullOrBlank()) {
            return
        }

        val isMultiline = element.multiline == true || element.style?.multiline == true || text.contains("\n")
        if (isMultiline) {
            renderMultiline(element, text, context)
        } else {
            renderSingleLine(element, text, context)
        }
    }

    private fun renderSingleLine(
        element: TextElement,
        text: String,
        context: RenderContext,
    ) {
        val font = TextSpanBuilder.createFont(element.style)
        val fontSize = element.style?.fontSize ?: 12f
        val boxHeight = element.height ?: fontSize
        val boxWidth = element.width ?: 100f

        val pageHeight = context.document.pageSize.height
        val x = context.resolveX(element.x)
        val y = context.resolveY(element.y)
        val yTop = CoordinateUtils.topYToPdfTop(pageHeight, y)

        val contentByte = if (context.useContentUnder) context.writer.directContentUnder else context.writer.directContent
        renderBackground(contentByte, element.style?.backgroundColor, x, yTop, boxWidth, boxHeight)

        val verticalAlign = element.style?.verticalAlignment
        val paddingTop = element.style?.paddingTop ?: 0f
        val paddingBottom = element.style?.paddingBottom ?: 0f
        val lineHeightMultiplier = element.style?.lineHeight ?: 1.2f
        val textBoxHeight = fontSize * lineHeightMultiplier

        val textY =
            TextLayoutHelper.calculateSingleLineY(
                yTop,
                boxHeight,
                verticalAlign,
                paddingTop,
                paddingBottom,
                textBoxHeight,
            )

        val alignment = TextLayoutHelper.resolveAlignment(element.style?.alignment)
        val textWidth = font.baseFont.getWidthPoint(text, fontSize)
        val textX =
            TextLayoutHelper.calculateSingleLineX(
                alignment,
                x,
                element.width ?: textWidth,
                textWidth,
            )

        contentByte.beginText()
        contentByte.setFontAndSize(font.baseFont, fontSize)
        if (font.color != null) {
            contentByte.setColorFill(font.color)
        }
        contentByte.setTextMatrix(textX, textY)
        contentByte.showText(text)
        contentByte.endText()
    }

    private fun renderMultiline(
        element: TextElement,
        text: String,
        context: RenderContext,
    ) {
        val font = TextSpanBuilder.createFont(element.style)
        val fontSize = element.style?.fontSize ?: 12f
        val pageHeight = context.document.pageSize.height

        val x = context.resolveX(element.x)
        val y = context.resolveY(element.y)
        val yTop = CoordinateUtils.topYToPdfTop(pageHeight, y)
        val boxWidth = (element.width as? Number)?.toFloat() ?: 100f
        val boxHeight = (element.height as? Number)?.toFloat() ?: 100f

        val paddingTop = element.style?.paddingTop ?: 0f
        val paddingBottom = element.style?.paddingBottom ?: 0f
        val paddingLeft = element.style?.paddingLeft ?: 0f
        val paddingRight = element.style?.paddingRight ?: 0f
        val firstLineIndent = element.style?.firstLineIndent ?: 0f

        val contentByte = if (context.useContentUnder) context.writer.directContentUnder else context.writer.directContent
        renderBackground(contentByte, element.style?.backgroundColor, x, yTop, boxWidth, boxHeight)

        val measuredLayout =
            TextLayoutHelper.getOrMeasureMultilineLayout(
                elementId = element.id,
                resolvedText = text,
                styleHash = element.style?.hashCode() ?: 0,
                boxWidth = boxWidth,
                fontSize = fontSize,
                lineHeight = element.style?.lineHeight,
                paddingTop = paddingTop,
                paddingBottom = paddingBottom,
                paddingLeft = paddingLeft,
                paddingRight = paddingRight,
                firstLineIndent = firstLineIndent,
                fontFamily = element.style?.fontFamily ?: "Helvetica",
                cache = context.textLayoutCache,
                baseFont = font.baseFont,
            )

        val linesToRender =
            TextLayoutHelper.filterLinesForOverflow(
                lines = measuredLayout.lines,
                overflow = element.style?.overflow,
                boxHeight = boxHeight,
                paddingTop = paddingTop,
                paddingBottom = paddingBottom,
                lineSpacing = measuredLayout.lineSpacing,
            )

        contentByte.beginText()
        contentByte.setFontAndSize(font.baseFont, fontSize)
        if (font.color != null) {
            contentByte.setColorFill(font.color)
        }

        val alignment = element.style?.alignment
        linesToRender.forEachIndexed { lineIndex, line ->
            val yPos =
                TextLayoutHelper.calculateMultilineLineY(
                    yTop,
                    paddingTop,
                    fontSize,
                    measuredLayout.lineSpacing,
                    lineIndex,
                )
            val lineWidth = font.baseFont.getWidthPoint(line, fontSize)
            val xPos =
                TextLayoutHelper.calculateMultilineLineX(
                    alignment,
                    x,
                    boxWidth,
                    paddingLeft,
                    paddingRight,
                    firstLineIndent,
                    lineIndex,
                    lineWidth,
                )
            contentByte.setTextMatrix(xPos, yPos)
            contentByte.showText(line)
        }

        contentByte.endText()
    }

    private fun renderBackground(
        contentByte: PdfContentByte,
        backgroundColor: String?,
        x: Float,
        yTop: Float,
        boxWidth: Float,
        boxHeight: Float,
    ) {
        if (backgroundColor != null && backgroundColor != "transparent") {
            contentByte.saveState()
            contentByte.setColorFill(ColorUtil.hexToColor(backgroundColor))
            contentByte.rectangle(x, yTop - boxHeight, boxWidth, boxHeight)
            contentByte.fill()
            contentByte.restoreState()
        }
    }
}
