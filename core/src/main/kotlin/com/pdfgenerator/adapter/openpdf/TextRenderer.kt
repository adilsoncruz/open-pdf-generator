package com.pdfgenerator.adapter.openpdf

import com.lowagie.text.Chunk
import com.lowagie.text.Element
import com.lowagie.text.Font
import com.lowagie.text.Paragraph
import com.lowagie.text.Phrase
import com.lowagie.text.pdf.BaseFont
import com.lowagie.text.pdf.ColumnText
import com.pdfgenerator.engine.RenderContext
import com.pdfgenerator.engine.Renderer
import com.pdfgenerator.model.TextElement
import com.pdfgenerator.util.ColorUtil
import com.pdfgenerator.util.ConditionEvaluator
import com.pdfgenerator.util.DataBindingResolver
import com.pdfgenerator.util.ExpressionProcessor
import com.pdfgenerator.util.FontCache
import java.awt.Color as AwtColor

class TextRenderer : Renderer<TextElement> {
    private val logger = org.slf4j.LoggerFactory.getLogger(TextRenderer::class.java)

    companion object {
        private val companionLogger = org.slf4j.LoggerFactory.getLogger(TextRenderer::class.java)

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
            fontFamily: String
        ): Float {
            val lineSpacing = fontSize * (lineHeight ?: 1f)
            val availableBoxWidth = boxWidth - paddingLeft - paddingRight

            val baseFontName = when {
                fontFamily.lowercase().contains("times") -> BaseFont.TIMES_ROMAN
                fontFamily.lowercase().contains("courier") -> BaseFont.COURIER
                else -> BaseFont.HELVETICA
            }
            val baseFont = FontCache.getFont(baseFontName)

            val paragraphs = text.split("\n", "\\n")
            val lines = mutableListOf<String>()

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
                    val lineWidth = baseFont.getWidthPoint(testLine, fontSize)

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

            val contentHeight = paddingTop + (lines.size * lineSpacing) + paddingBottom
            return contentHeight
        }
    }

    override fun render(element: TextElement, context: RenderContext) {
        if (!ConditionEvaluator.evaluate(element.printCondition, context.data, context.loopContext)) {
            return
        }

        val text = resolveText(element, context)
        if (text.isNullOrBlank()) {
            return
        }

        val isMultiline = element.style?.multiline == true

        if (isMultiline) {
            renderMultiline(element, text, context)
        } else {
            renderSingleLine(element, text, context)
        }
    }

    private fun renderSingleLine(element: TextElement, text: String, context: RenderContext) {
        val font = createFont(element)

        val alignment = when (element.style?.alignment?.lowercase()) {
            "center" -> Element.ALIGN_CENTER
            "right" -> Element.ALIGN_RIGHT
            "justify" -> Element.ALIGN_JUSTIFIED
            else -> Element.ALIGN_LEFT
        }

        val pageHeight = context.document.pageSize.height
        val yTop = pageHeight - element.y

        val contentByte = if (context.useContentUnder) {
            context.writer.directContentUnder
        } else {
            context.writer.directContent
        }

        val backgroundColor = element.style?.backgroundColor
        if (backgroundColor != null && backgroundColor != "transparent") {
            val boxHeight = element.height ?: (element.style?.fontSize ?: 12f)
            val boxWidth = element.width ?: 100f
            val bgColor = ColorUtil.hexToColor(backgroundColor)
            contentByte.saveState()
            contentByte.setColorFill(bgColor)
            contentByte.rectangle(element.x, yTop - boxHeight, boxWidth, boxHeight)
            contentByte.fill()
            contentByte.restoreState()
        }

        val fontSize = element.style?.fontSize ?: 12f
        val boxHeight = element.height ?: fontSize
        val verticalAlign = element.style?.verticalAlignment?.lowercase() ?: "center"

        val paddingTop = element.style?.paddingTop ?: 0f
        val paddingBottom = element.style?.paddingBottom ?: 0f

        val lineHeightMultiplier = element.style?.lineHeight ?: 1.2f
        val textBoxHeight = fontSize * lineHeightMultiplier

        val availableHeight = boxHeight - paddingTop - paddingBottom

        val textY = when (verticalAlign) {
            "top" -> yTop - paddingTop - (textBoxHeight * 0.8f)
            "bottom" -> yTop - boxHeight + paddingBottom + (textBoxHeight * 0.2f)
            "center" -> {
                val spaceAbove = (availableHeight - textBoxHeight) / 2f
                yTop - paddingTop - spaceAbove - (textBoxHeight * 0.8f)
            }
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
                val xPos = element.x + (boxWidth - textWidth) / 2f
                contentByte.setTextMatrix(xPos, textY)
            }
            Element.ALIGN_RIGHT -> {
                val textWidth = font.baseFont.getWidthPoint(text, fontSize)
                val boxWidth = element.width ?: textWidth
                val xPos = element.x + boxWidth - textWidth
                contentByte.setTextMatrix(xPos, textY)
            }
            else -> {
                contentByte.setTextMatrix(element.x, textY)
            }
        }

        contentByte.showText(text)
        contentByte.endText()
    }

    private fun renderMultiline(element: TextElement, text: String, context: RenderContext) {
        val font = createFont(element)
        val fontSize = element.style?.fontSize ?: 12f
        val pageHeight = context.document.pageSize.height

        val yTop = pageHeight - element.y
        val boxWidth = (element.width as? Number)?.toFloat() ?: 100f
        val boxHeight = (element.height as? Number)?.toFloat() ?: 100f

        val paddingTop = element.style?.paddingTop ?: 0f
        val paddingBottom = element.style?.paddingBottom ?: 0f
        val paddingLeft = element.style?.paddingLeft ?: 0f
        val paddingRight = element.style?.paddingRight ?: 0f
        val firstLineIndent = element.style?.firstLineIndent ?: 0f

        val lineHeight = element.style?.lineHeight ?: 1f
        val lineSpacing = fontSize * lineHeight

        val contentByte = if (context.useContentUnder) {
            context.writer.directContentUnder
        } else {
            context.writer.directContent
        }

        val backgroundColor = element.style?.backgroundColor
        if (backgroundColor != null && backgroundColor != "transparent") {
            val bgColor = ColorUtil.hexToColor(backgroundColor)
            contentByte.saveState()
            contentByte.setColorFill(bgColor)
            contentByte.rectangle(element.x, yTop - boxHeight, boxWidth, boxHeight)
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

        val overflow = element.style?.overflow?.lowercase() ?: "visible"
        val linesToRender = if (overflow == "hidden") {
            val availableHeight = boxHeight - paddingTop - paddingBottom
            val maxLines = (availableHeight / lineSpacing).toInt().coerceAtLeast(1)
            lines.take(maxLines)
        } else {
            lines
        }

        contentByte.beginText()
        contentByte.setFontAndSize(font.baseFont, fontSize)
        if (font.color != null) {
            contentByte.setColorFill(font.color)
        }

        val alignment = element.style?.alignment?.lowercase() ?: "left"

        val extraSpace = lineSpacing - fontSize
        val spaceAbove = extraSpace / 2f

        linesToRender.forEachIndexed { lineIndex, line ->
            val baselineFromLineBoxTop = spaceAbove + (fontSize * 0.8f)
            val baselineOffset = paddingTop + baselineFromLineBoxTop + (lineIndex * lineSpacing)

            val yPos = yTop - baselineOffset

            val indent = if (lineIndex == 0) firstLineIndent else 0f
            val xStart = element.x + paddingLeft + indent
            val lineWidth = font.baseFont.getWidthPoint(line, fontSize)

            val xPos = when (alignment) {
                "center" -> element.x + paddingLeft + (availableBoxWidth - indent - lineWidth) / 2f + indent
                "right" -> element.x + boxWidth - paddingRight - lineWidth
                else -> xStart
            }

            contentByte.setTextMatrix(xPos, yPos)
            contentByte.showText(line)
        }

        contentByte.endText()
    }

    private fun resolveText(element: TextElement, context: RenderContext): String? {
        return when {
            !element.dataBinding.isNullOrBlank() -> {
                if (ExpressionProcessor.hasTransformations(element.dataBinding)) {
                    ExpressionProcessor.process(element.dataBinding, context.data, context.loopContext)
                } else {
                    val value = DataBindingResolver.resolve(element.dataBinding, context.data, context.loopContext)
                    value?.toString()
                }
            }
            else -> element.value
        }
    }

    private fun createFont(element: TextElement): Font {
        val style = element.style
        val fontSize = style?.fontSize ?: 12f

        val fontFamilyLower = style?.fontFamily?.lowercase() ?: "helvetica"
        val normalizedFamily = fontFamilyLower
            .replace("-bold", "")
            .replace("-roman", "")
            .replace("-oblique", "")
            .trim()

        val baseFontName = when {
            normalizedFamily.contains("times") -> when {
                style?.fontWeight == "bold" && style.fontStyle == "italic" -> BaseFont.TIMES_BOLDITALIC
                style?.fontWeight == "bold" -> BaseFont.TIMES_BOLD
                style?.fontStyle == "italic" -> BaseFont.TIMES_ITALIC
                else -> BaseFont.TIMES_ROMAN
            }
            normalizedFamily.contains("courier") -> when {
                style?.fontWeight == "bold" && style.fontStyle == "italic" -> BaseFont.COURIER_BOLDOBLIQUE
                style?.fontWeight == "bold" -> BaseFont.COURIER_BOLD
                style?.fontStyle == "italic" -> BaseFont.COURIER_OBLIQUE
                else -> BaseFont.COURIER
            }
            else -> when {
                style?.fontWeight == "bold" && style.fontStyle == "italic" -> BaseFont.HELVETICA_BOLDOBLIQUE
                style?.fontWeight == "bold" -> BaseFont.HELVETICA_BOLD
                style?.fontStyle == "italic" -> BaseFont.HELVETICA_OBLIQUE
                else -> BaseFont.HELVETICA
            }
        }

        val cachedBaseFont = FontCache.getFont(baseFontName)

        val font = Font(
            cachedBaseFont,
            fontSize,
            Font.NORMAL
        )

        style?.color?.let { colorHex ->
            font.color = ColorUtil.hexToColor(colorHex)
        }

        return font
    }
}

