package com.pdfgenerator.adapter.openpdf

import com.lowagie.text.Chunk
import com.lowagie.text.Element
import com.lowagie.text.Font
import com.lowagie.text.Paragraph
import com.lowagie.text.pdf.BaseFont
import com.lowagie.text.pdf.ColumnText
import com.pdfgenerator.engine.RenderContext
import com.pdfgenerator.engine.Renderer
import com.pdfgenerator.model.RichTextElement
import com.pdfgenerator.util.ColorUtil
import com.pdfgenerator.util.ConditionEvaluator
import com.pdfgenerator.util.DataBindingResolver
import com.pdfgenerator.util.ExpressionProcessor
import com.pdfgenerator.util.FontCache

class RichTextRenderer : Renderer<RichTextElement> {
    override fun render(
        element: RichTextElement,
        context: RenderContext,
    ) {
        if (!ConditionEvaluator.evaluate(element.printCondition, context.data, context.loopContext)) {
            return
        }

        val text = resolveText(element, context)
        if (text.isNullOrBlank()) {
            return
        }

        val pageHeight = context.document.pageSize.height
        val x = context.resolveX(element.x)
        val y = context.resolveY(element.y)
        val width = element.resolveWidth(context.document.pageSize.width - context.document.leftMargin() - context.document.rightMargin())
        val overflow = element.style?.overflow?.lowercase() ?: "visible"
        val yTop = CoordinateUtils.topYToPdfTop(pageHeight, y)
        val renderHeight =
            if (overflow == "hidden") {
                element.height ?: 50f
            } else {
                yTop - context.document.bottomMargin()
            }
        val yBottom = yTop - renderHeight

        val contentByte =
            if (context.useContentUnder) {
                context.writer.directContentUnder
            } else {
                context.writer.directContent
            }

        val paragraph = Paragraph()
        val alignment =
            when (element.style?.alignment?.lowercase()) {
                "center" -> Element.ALIGN_CENTER
                "right" -> Element.ALIGN_RIGHT
                "justify" -> Element.ALIGN_JUSTIFIED
                else -> Element.ALIGN_LEFT
            }
        paragraph.alignment = alignment

        val baseFontName =
            when {
                element.style?.fontFamily?.lowercase()?.contains("times") == true -> BaseFont.TIMES_ROMAN
                element.style?.fontFamily?.lowercase()?.contains("courier") == true -> BaseFont.COURIER
                else -> BaseFont.HELVETICA
            }
        val baseFont = FontCache.getFont(baseFontName)
        val fontSize = element.style?.fontSize ?: 12f
        val color = ColorUtil.hexToColor(element.style?.color ?: "#000000")

        val normalFont = Font(baseFont, fontSize, Font.NORMAL, color)
        val boldFont = Font(baseFont, fontSize, Font.BOLD, color)
        val italicFont = Font(baseFont, fontSize, Font.ITALIC, color)
        val boldItalicFont = Font(baseFont, fontSize, Font.BOLDITALIC, color)

        val chunks = parseMarkdown(text, normalFont, boldFont, italicFont, boldItalicFont)
        chunks.forEach { paragraph.add(it) }

        val ct = ColumnText(contentByte)
        ct.setSimpleColumn(x, yBottom, x + width, yTop)
        ct.addElement(paragraph)
        ct.go()
    }

    private fun resolveText(
        element: RichTextElement,
        context: RenderContext,
    ): String? {
        return when {
            !element.dataBinding.isNullOrBlank() -> {
                if (ExpressionProcessor.hasTransformations(element.dataBinding)) {
                    ExpressionProcessor.process(element.dataBinding, context.data, context.loopContext)
                } else {
                    val value = DataBindingResolver.resolve(element.dataBinding, context.data, context.loopContext)
                    value?.toString()
                }
            }
            !element.value.isNullOrBlank() && context.loopContext != null -> {
                if (ExpressionProcessor.hasTransformations(element.value)) {
                    ExpressionProcessor.process(element.value, context.data, context.loopContext)
                } else {
                    val fieldValue = DataBindingResolver.resolve(element.value, context.data, context.loopContext)
                    fieldValue?.toString() ?: element.value
                }
            }
            else -> element.value
        }
    }

    private fun parseMarkdown(
        text: String,
        normalFont: Font,
        boldFont: Font,
        italicFont: Font,
        boldItalicFont: Font,
    ): List<Chunk> {
        val chunks = mutableListOf<Chunk>()
        var currentIdx = 0
        while (currentIdx < text.length) {
            val boldIdx = text.indexOf("**", currentIdx)
            val italicIdx = text.indexOf("*", currentIdx)

            val validItalicIdx = if (italicIdx != -1 && italicIdx == boldIdx) text.indexOf("*", boldIdx + 2) else italicIdx
            val hasBold = boldIdx != -1
            val hasItalic = validItalicIdx != -1 && (boldIdx == -1 || validItalicIdx < boldIdx || validItalicIdx > boldIdx + 1)

            if (!hasBold && !hasItalic) {
                chunks.add(Chunk(text.substring(currentIdx), normalFont))
                currentIdx = text.length
                continue
            }

            if (hasBold && (!hasItalic || boldIdx <= validItalicIdx)) {
                if (boldIdx > currentIdx) {
                    chunks.add(Chunk(text.substring(currentIdx, boldIdx), normalFont))
                }
                val endBoldIdx = text.indexOf("**", boldIdx + 2)
                if (endBoldIdx != -1) {
                    chunks.add(Chunk(text.substring(boldIdx + 2, endBoldIdx), boldFont))
                    currentIdx = endBoldIdx + 2
                } else {
                    chunks.add(Chunk(text.substring(boldIdx), normalFont))
                    currentIdx = text.length
                }
            } else if (hasItalic) {
                if (validItalicIdx > currentIdx) {
                    chunks.add(Chunk(text.substring(currentIdx, validItalicIdx), normalFont))
                }
                val endItalicIdx = text.indexOf("*", validItalicIdx + 1)
                var realEndItalicIdx = endItalicIdx
                while (realEndItalicIdx != -1 && realEndItalicIdx + 1 < text.length && text[realEndItalicIdx + 1] == '*') {
                    realEndItalicIdx = text.indexOf("*", realEndItalicIdx + 2)
                }

                if (realEndItalicIdx != -1) {
                    chunks.add(Chunk(text.substring(validItalicIdx + 1, realEndItalicIdx), italicFont))
                    currentIdx = realEndItalicIdx + 1
                } else {
                    chunks.add(Chunk(text.substring(validItalicIdx), normalFont))
                    currentIdx = text.length
                }
            }
        }
        return chunks
    }
}
