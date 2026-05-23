package com.pdfgenerator.adapter.openpdf

import com.lowagie.text.Element
import com.lowagie.text.Font
import com.lowagie.text.pdf.BaseFont
import com.pdfgenerator.engine.RenderContext
import com.pdfgenerator.engine.Renderer
import com.pdfgenerator.model.StaticTextElement
import com.pdfgenerator.util.ColorUtil
import com.pdfgenerator.util.FontCache
import org.slf4j.LoggerFactory

class StaticTextRenderer : Renderer<StaticTextElement> {
    private val logger = LoggerFactory.getLogger(StaticTextRenderer::class.java)
    override fun render(
        element: StaticTextElement,
        context: RenderContext,
    ) {
        val text = element.value
        if (text.isBlank()) return

        val isMultiline = element.style?.multiline == true

        if (isMultiline) {
            renderMultiline(element, text, context)
        } else {
            renderSingleLine(element, text, context)
        }
    }

    private fun renderSingleLine(
        element: StaticTextElement,
        text: String,
        context: RenderContext,
    ) {
        val font = createFont(element)
        val fontSize = element.style?.fontSize ?: 12f

        val alignment =
            when (element.style?.alignment?.lowercase()) {
                "center" -> Element.ALIGN_CENTER
                "right" -> Element.ALIGN_RIGHT
                else -> Element.ALIGN_LEFT
            }

        val pageHeight = context.document.pageSize.height
        val x = context.resolveX(element.x)
        val y = if (element.positionMode == com.pdfgenerator.model.PositionMode.RELATIVE || context.loopContext != null) context.resolveY(element.y) else context.bodyOffsetY + element.y
        val yTop = CoordinateUtils.topYToPdfTop(pageHeight, y)

        val contentByte =
            if (context.useContentUnder) {
                context.writer.directContentUnder
            } else {
                context.writer.directContent
            }

        val backgroundColor = element.style?.backgroundColor
        if (backgroundColor != null && backgroundColor != "transparent") {
            val boxHeight = element.height ?: fontSize
            val boxWidth = element.width ?: 100f
            val bgColor = ColorUtil.hexToColor(backgroundColor)
            contentByte.saveState()
            contentByte.setColorFill(bgColor)
            contentByte.rectangle(x, yTop - boxHeight, boxWidth, boxHeight)
            contentByte.fill()
            contentByte.restoreState()
        }

        val boxHeight = element.height ?: fontSize
        val verticalAlign = element.style?.verticalAlignment?.lowercase() ?: "top"
        val paddingTop = element.style?.paddingTop ?: 0f
        val paddingBottom = element.style?.paddingBottom ?: 0f
        val lineHeightMultiplier = element.style?.lineHeight ?: 1.2f
        val textBoxHeight = fontSize * lineHeightMultiplier
        val availableHeight = boxHeight - paddingTop - paddingBottom

        val textY =
            when (verticalAlign) {
                "top" -> yTop - paddingTop - (textBoxHeight * 0.8f)
                "bottom" -> yTop - boxHeight + paddingBottom + (textBoxHeight * 0.2f)
                else -> {
                    val spaceAbove = (availableHeight - textBoxHeight) / 2f
                    yTop - paddingTop - spaceAbove - (textBoxHeight * 0.8f)
                }
            }

        contentByte.beginText()
        contentByte.setFontAndSize(font.baseFont, fontSize)
        if (font.color != null) {
            contentByte.setColorFill(font.color)
        }

        when (alignment) {
            Element.ALIGN_CENTER -> {
                val textWidth = font.baseFont.getWidthPoint(text, fontSize)
                val boxWidth = element.width ?: textWidth
                val xPos = x + (boxWidth - textWidth) / 2f
                contentByte.setTextMatrix(xPos, textY)
            }
            Element.ALIGN_RIGHT -> {
                val textWidth = font.baseFont.getWidthPoint(text, fontSize)
                val boxWidth = element.width ?: textWidth
                val xPos = x + boxWidth - textWidth
                contentByte.setTextMatrix(xPos, textY)
            }
            else -> contentByte.setTextMatrix(x, textY)
        }

        contentByte.showText(text)
        contentByte.endText()

        logger.debug("StaticText {} pos mode={} x={} y={} bodyOffsetY={} offsetY={} yTop={} textY={} pageHeight={}", element.id, element.positionMode, x, y, context.bodyOffsetY, context.offsetY, yTop, textY, pageHeight)
    }

    private fun renderMultiline(
        element: StaticTextElement,
        text: String,
        context: RenderContext,
    ) {
        val font = createFont(element)
        val fontSize = element.style?.fontSize ?: 12f
        val pageHeight = context.document.pageSize.height

        val x = context.resolveX(element.x)
        val y = if (element.positionMode == com.pdfgenerator.model.PositionMode.RELATIVE || context.loopContext != null) context.resolveY(element.y) else context.bodyOffsetY + element.y
        val yTop = CoordinateUtils.topYToPdfTop(pageHeight, y)
        val boxWidth = element.width ?: 100f
        val boxHeight = element.height ?: 100f

        val paddingTop = element.style?.paddingTop ?: 0f
        val paddingLeft = element.style?.paddingLeft ?: 0f
        val paddingRight = element.style?.paddingRight ?: 0f
        val firstLineIndent = element.style?.firstLineIndent ?: 0f
        val lineHeight = element.style?.lineHeight ?: 1f
        val lineSpacing = fontSize * lineHeight

        val contentByte =
            if (context.useContentUnder) {
                context.writer.directContentUnder
            } else {
                context.writer.directContent
            }

        val backgroundColor = element.style?.backgroundColor
        if (backgroundColor != null && backgroundColor != "transparent") {
            val bgColor = ColorUtil.hexToColor(backgroundColor)
            contentByte.saveState()
            contentByte.setColorFill(bgColor)
            contentByte.rectangle(x, yTop - boxHeight, boxWidth, boxHeight)
            contentByte.fill()
            contentByte.restoreState()
        }

        val availableBoxWidth = boxWidth - paddingLeft - paddingRight
        val lines = mutableListOf<String>()

        val paragraphs = text.split("\n", "\\n")

        for (paragraph in paragraphs) {
            if (paragraph.isEmpty()) {
                lines.add("")
                continue
            }

            val words = paragraph.split(" ")
            var currentLine = ""

            for (word in words) {
                val testLine = if (currentLine.isEmpty()) word else "$currentLine $word"
                val indent = if (lines.isEmpty()) firstLineIndent else 0f
                val availableWidth = availableBoxWidth - indent
                val lineWidth = font.baseFont.getWidthPoint(testLine, fontSize)

                if (lineWidth > availableWidth && currentLine.isNotEmpty()) {
                    lines.add(currentLine)
                    currentLine = word
                } else {
                    currentLine = testLine
                }
            }
            if (currentLine.isNotEmpty()) {
                lines.add(currentLine)
            }
        }

        contentByte.beginText()
        contentByte.setFontAndSize(font.baseFont, fontSize)
        if (font.color != null) {
            contentByte.setColorFill(font.color)
        }

        val alignment = element.style?.alignment?.lowercase() ?: "left"
        val extraSpace = lineSpacing - fontSize
        val spaceAbove = extraSpace / 2f

        lines.forEachIndexed { lineIndex, line ->
            val baselineFromLineBoxTop = spaceAbove + (fontSize * 0.8f)
            val baselineOffset = paddingTop + baselineFromLineBoxTop + (lineIndex * lineSpacing)
            val yPos = yTop - baselineOffset

            val indent = if (lineIndex == 0) firstLineIndent else 0f
            val xStart = x + paddingLeft + indent
            val lineWidth = font.baseFont.getWidthPoint(line, fontSize)

            val xPos =
                when (alignment) {
                    "center" -> x + paddingLeft + (availableBoxWidth - indent - lineWidth) / 2f + indent
                    "right" -> x + boxWidth - paddingRight - lineWidth
                    else -> xStart
                }

            contentByte.setTextMatrix(xPos, yPos)
            contentByte.showText(line)
        }

        contentByte.endText()
    }

    private fun createFont(element: StaticTextElement): Font {
        val style = element.style
        val fontSize = style?.fontSize ?: 12f

        val fontFamilyLower = style?.fontFamily?.lowercase() ?: "helvetica"
        val normalizedFamily =
            fontFamilyLower
                .replace("-bold", "")
                .replace("-roman", "")
                .replace("-oblique", "")
                .trim()

        val baseFontName =
            when {
                normalizedFamily.contains("times") ->
                    when {
                        style?.fontWeight == "bold" && style.fontStyle == "italic" -> BaseFont.TIMES_BOLDITALIC
                        style?.fontWeight == "bold" -> BaseFont.TIMES_BOLD
                        style?.fontStyle == "italic" -> BaseFont.TIMES_ITALIC
                        else -> BaseFont.TIMES_ROMAN
                    }
                normalizedFamily.contains("courier") ->
                    when {
                        style?.fontWeight == "bold" && style.fontStyle == "italic" -> BaseFont.COURIER_BOLDOBLIQUE
                        style?.fontWeight == "bold" -> BaseFont.COURIER_BOLD
                        style?.fontStyle == "italic" -> BaseFont.COURIER_OBLIQUE
                        else -> BaseFont.COURIER
                    }
                else ->
                    when {
                        style?.fontWeight == "bold" && style.fontStyle == "italic" -> BaseFont.HELVETICA_BOLDOBLIQUE
                        style?.fontWeight == "bold" -> BaseFont.HELVETICA_BOLD
                        style?.fontStyle == "italic" -> BaseFont.HELVETICA_OBLIQUE
                        else -> BaseFont.HELVETICA
                    }
            }

        val font =
            Font(
                FontCache.getFont(baseFontName),
                fontSize,
                Font.NORMAL,
            )

        style?.color?.let { colorHex ->
            font.color = ColorUtil.hexToColor(colorHex)
        }

        return font
    }
}
