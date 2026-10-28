package com.pdfgenerator.adapter.openpdf

import com.pdfgenerator.engine.TextLayoutCacheKey
import com.pdfgenerator.engine.TextLayoutMeasurement
import com.pdfgenerator.util.FontCache
import org.openpdf.text.Element
import org.openpdf.text.pdf.BaseFont

object TextLayoutHelper {
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
    ): TextLayoutMeasurement {
        val cacheKey = TextLayoutCacheKey(elementId, resolvedText, styleHash)
        cache?.get(cacheKey)?.let { return it }

        val measuredLayout =
            measureMultilineLayout(
                text = resolvedText,
                boxWidth = boxWidth,
                fontSize = fontSize,
                lineHeight = lineHeight,
                paddingTop = paddingTop,
                paddingBottom = paddingBottom,
                paddingLeft = paddingLeft,
                paddingRight = paddingRight,
                firstLineIndent = firstLineIndent,
                fontFamily = fontFamily,
                baseFont = baseFont,
            )

        cache?.put(cacheKey, measuredLayout)
        return measuredLayout
    }

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
    ): Float {
        return measureMultilineLayout(
            text = text,
            boxWidth = boxWidth,
            fontSize = fontSize,
            lineHeight = lineHeight,
            paddingTop = paddingTop,
            paddingBottom = paddingBottom,
            paddingLeft = paddingLeft,
            paddingRight = paddingRight,
            firstLineIndent = firstLineIndent,
            fontFamily = fontFamily,
        ).contentHeight
    }

    fun measureMultilineLayout(
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
        baseFont: BaseFont? = null,
    ): TextLayoutMeasurement {
        val lineSpacing = fontSize * (lineHeight ?: 1f)
        val availableBoxWidth = boxWidth - paddingLeft - paddingRight

        val fontForMeasurement =
            baseFont ?: run {
                val baseFontName =
                    when {
                        fontFamily.lowercase().contains("times") -> BaseFont.TIMES_ROMAN
                        fontFamily.lowercase().contains("courier") -> BaseFont.COURIER
                        else -> BaseFont.HELVETICA
                    }
                FontCache.getFont(baseFontName)
            }

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
                val lineWidth = fontForMeasurement.getWidthPoint(testLine, fontSize)

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

        return TextLayoutMeasurement(
            lines = lines,
            lineSpacing = lineSpacing,
            contentHeight = paddingTop + (lines.size * lineSpacing) + paddingBottom,
        )
    }

    fun resolveAlignment(alignmentStr: String?): Int =
        when (alignmentStr?.lowercase()) {
            "center" -> Element.ALIGN_CENTER
            "right" -> Element.ALIGN_RIGHT
            "justify" -> Element.ALIGN_JUSTIFIED
            else -> Element.ALIGN_LEFT
        }

    fun calculateSingleLineX(
        alignment: Int,
        startX: Float,
        boxWidth: Float,
        textWidth: Float,
    ): Float =
        when (alignment) {
            Element.ALIGN_CENTER -> startX + (boxWidth - textWidth) / 2f
            Element.ALIGN_RIGHT -> startX + boxWidth - textWidth
            else -> startX
        }

    fun calculateSingleLineY(
        yTop: Float,
        boxHeight: Float,
        verticalAlign: String?,
        paddingTop: Float,
        paddingBottom: Float,
        textBoxHeight: Float,
    ): Float {
        val availableHeight = boxHeight - paddingTop - paddingBottom
        return when (verticalAlign?.lowercase()) {
            "top" -> yTop - paddingTop - (textBoxHeight * 0.8f)
            "bottom" -> yTop - boxHeight + paddingBottom + (textBoxHeight * 0.2f)
            else -> {
                val spaceAbove = (availableHeight - textBoxHeight) / 2f
                yTop - paddingTop - spaceAbove - (textBoxHeight * 0.8f)
            }
        }
    }

    fun calculateMultilineLineX(
        alignment: String?,
        startX: Float,
        boxWidth: Float,
        paddingLeft: Float,
        paddingRight: Float,
        firstLineIndent: Float,
        lineIndex: Int,
        lineWidth: Float,
    ): Float {
        val indent = if (lineIndex == 0) firstLineIndent else 0f
        val availableBoxWidth = boxWidth - paddingLeft - paddingRight
        return when (alignment?.lowercase()) {
            "center" -> startX + paddingLeft + (availableBoxWidth - indent - lineWidth) / 2f + indent
            "right" -> startX + boxWidth - paddingRight - lineWidth
            else -> startX + paddingLeft + indent
        }
    }

    fun calculateMultilineLineY(
        yTop: Float,
        paddingTop: Float,
        fontSize: Float,
        lineSpacing: Float,
        lineIndex: Int,
    ): Float {
        val extraSpace = lineSpacing - fontSize
        val spaceAbove = extraSpace / 2f
        val baselineFromLineBoxTop = spaceAbove + (fontSize * 0.8f)
        val baselineOffset = paddingTop + baselineFromLineBoxTop + (lineIndex * lineSpacing)
        return yTop - baselineOffset
    }

    fun filterLinesForOverflow(
        lines: List<String>,
        overflow: String?,
        boxHeight: Float,
        paddingTop: Float,
        paddingBottom: Float,
        lineSpacing: Float,
    ): List<String> {
        return if (overflow?.lowercase() == "hidden") {
            val availableHeight = boxHeight - paddingTop - paddingBottom
            val maxLines = (availableHeight / lineSpacing).toInt().coerceAtLeast(1)
            lines.take(maxLines)
        } else {
            lines
        }
    }
}
