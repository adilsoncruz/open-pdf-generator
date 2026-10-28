package com.pdfgenerator.adapter.openpdf

import com.pdfgenerator.engine.RenderContext
import com.pdfgenerator.model.TextElement
import com.pdfgenerator.model.TextStyle
import com.pdfgenerator.util.ColorUtil
import com.pdfgenerator.util.DataBindingResolver
import com.pdfgenerator.util.ExpressionProcessor
import com.pdfgenerator.util.FontCache
import org.openpdf.text.Chunk
import org.openpdf.text.Font
import org.openpdf.text.pdf.BaseFont

object TextSpanBuilder {
    fun resolveBaseFontName(
        fontFamily: String?,
        fontWeight: String?,
        fontStyle: String?,
    ): String {
        val fontFamilyLower = fontFamily?.lowercase() ?: "helvetica"
        val normalizedFamily =
            fontFamilyLower
                .replace("-bold", "")
                .replace("-roman", "")
                .replace("-oblique", "")
                .trim()

        val isBold = fontWeight == "bold"
        val isItalic = fontStyle == "italic"

        return when {
            normalizedFamily.contains("times") ->
                when {
                    isBold && isItalic -> BaseFont.TIMES_BOLDITALIC
                    isBold -> BaseFont.TIMES_BOLD
                    isItalic -> BaseFont.TIMES_ITALIC
                    else -> BaseFont.TIMES_ROMAN
                }
            normalizedFamily.contains("courier") ->
                when {
                    isBold && isItalic -> BaseFont.COURIER_BOLDOBLIQUE
                    isBold -> BaseFont.COURIER_BOLD
                    isItalic -> BaseFont.COURIER_OBLIQUE
                    else -> BaseFont.COURIER
                }
            else ->
                when {
                    isBold && isItalic -> BaseFont.HELVETICA_BOLDOBLIQUE
                    isBold -> BaseFont.HELVETICA_BOLD
                    isItalic -> BaseFont.HELVETICA_OBLIQUE
                    else -> BaseFont.HELVETICA
                }
        }
    }

    fun createFont(style: TextStyle?): Font {
        val fontSize = style?.fontSize ?: 12f
        val baseFontName = resolveBaseFontName(style?.fontFamily, style?.fontWeight, style?.fontStyle)
        val cachedBaseFont = FontCache.getFont(baseFontName)

        val font =
            Font(
                cachedBaseFont,
                fontSize,
                Font.NORMAL,
            )

        style?.color?.let { colorHex ->
            font.color = ColorUtil.hexToColor(colorHex)
        }

        return font
    }

    fun createFont(element: TextElement): Font = createFont(element.style)

    fun resolveText(
        element: TextElement,
        context: RenderContext,
    ): String? {
        val fromBinding =
            if (!element.dataBinding.isNullOrBlank()) {
                val binding = element.dataBinding
                when {
                    ExpressionProcessor.containsTemplateExpression(binding) ->
                        ExpressionProcessor.processTemplate(binding, context.data, context.loopContext)
                    ExpressionProcessor.hasTransformations(binding) ->
                        ExpressionProcessor.process(binding, context.data, context.loopContext)
                    else ->
                        DataBindingResolver.resolve(binding, context.data, context.loopContext)?.toString()
                }
            } else {
                null
            }

        if (fromBinding != null) {
            return fromBinding
        }

        val rawValue = element.value
        return when {
            rawValue.isNullOrBlank() -> null
            ExpressionProcessor.containsTemplateExpression(rawValue) ->
                ExpressionProcessor.processTemplate(rawValue, context.data, context.loopContext)
            context.loopContext != null -> {
                if (ExpressionProcessor.hasTransformations(rawValue)) {
                    ExpressionProcessor.process(rawValue, context.data, context.loopContext)
                } else {
                    val fieldValue = DataBindingResolver.resolve(rawValue, context.data, context.loopContext)
                    fieldValue?.toString() ?: rawValue
                }
            }
            else -> rawValue
        }
    }

    fun buildChunk(
        text: String,
        font: Font,
        underline: Boolean = false,
        strikethrough: Boolean = false,
    ): Chunk {
        val chunk = Chunk(text, font)
        if (underline) {
            chunk.setUnderline(0.8f, -2f)
        }
        if (strikethrough) {
            chunk.setUnderline(0.8f, 3f)
        }
        return chunk
    }
}
