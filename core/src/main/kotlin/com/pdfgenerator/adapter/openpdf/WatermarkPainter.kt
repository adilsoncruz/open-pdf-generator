package com.pdfgenerator.adapter.openpdf

import com.pdfgenerator.api.PDFGeneratorConfig
import com.pdfgenerator.engine.RenderEngine
import com.pdfgenerator.model.WatermarkConfig
import com.pdfgenerator.model.WatermarkType
import com.pdfgenerator.util.ColorUtil
import com.pdfgenerator.util.DataBindingResolver
import com.pdfgenerator.util.ExpressionProcessor
import com.pdfgenerator.util.FontCache
import org.openpdf.text.Document
import org.openpdf.text.Element
import org.openpdf.text.Image
import org.openpdf.text.pdf.BaseFont
import org.openpdf.text.pdf.PdfContentByte
import org.openpdf.text.pdf.PdfGState
import org.openpdf.text.pdf.PdfWriter
import org.slf4j.LoggerFactory
import java.awt.Color

class WatermarkPainter(
    private val renderEngine: RenderEngine,
    private val config: PDFGeneratorConfig,
) {
    private val logger = LoggerFactory.getLogger(WatermarkPainter::class.java)

    fun renderWatermark(
        writer: PdfWriter,
        document: Document,
        watermark: WatermarkConfig,
        pageData: Map<String, Any?>,
    ) {
        val cb = if (watermark.onTop) writer.directContent else writer.directContentUnder
        cb.saveState()

        try {
            val gState = PdfGState()
            val opacity = watermark.opacity.coerceIn(0f, 1f)
            gState.setFillOpacity(opacity)
            gState.setStrokeOpacity(opacity)
            cb.setGState(gState)

            val pageWidth = document.pageSize.width
            val pageHeight = document.pageSize.height
            val centerX = pageWidth / 2f
            val centerY = pageHeight / 2f

            when (watermark.type) {
                WatermarkType.TEXT -> {
                    renderTextWatermark(cb, watermark, pageData, opacity, gState, pageWidth, pageHeight, centerX, centerY)
                }
                WatermarkType.IMAGE -> {
                    renderImageWatermark(cb, watermark, pageWidth, pageHeight, centerX, centerY)
                }
            }
        } catch (e: Exception) {
            logger.error("Error rendering watermark: ${e.message}", e)
            if (config.strictMode) {
                throw e
            }
        } finally {
            cb.restoreState()
        }
    }

    private fun renderTextWatermark(
        cb: PdfContentByte,
        watermark: WatermarkConfig,
        pageData: Map<String, Any?>,
        opacity: Float,
        gState: PdfGState,
        pageWidth: Float,
        pageHeight: Float,
        centerX: Float,
        centerY: Float,
    ) {
        val rawText =
            watermark.dataBinding?.let { binding ->
                if (ExpressionProcessor.containsTemplateExpression(binding)) {
                    ExpressionProcessor.processTemplate(binding, pageData)
                } else if (ExpressionProcessor.hasTransformations(binding)) {
                    ExpressionProcessor.process(binding, pageData)
                } else {
                    DataBindingResolver.resolve(binding, pageData)?.toString()
                }
            } ?: watermark.text?.let { text ->
                if (ExpressionProcessor.containsTemplateExpression(text)) {
                    ExpressionProcessor.processTemplate(text, pageData)
                } else {
                    text
                }
            }

        if (rawText.isNullOrBlank()) return

        val baseFontName = resolveBaseFontName(watermark.fontName, watermark.fontStyle)
        val baseFont = FontCache.getFont(baseFontName)
        val baseColor = ColorUtil.hexToColor(watermark.color)
        val alphaInt = (opacity * 255f).toInt().coerceIn(0, 255)
        val colorWithAlpha = Color(baseColor.red, baseColor.green, baseColor.blue, alphaInt)

        cb.setColorFill(colorWithAlpha)
        cb.setGState(gState)

        cb.beginText()
        cb.setFontAndSize(baseFont, watermark.fontSize)

        if (watermark.repeat) {
            val estimatedTextWidth = watermark.fontSize * (rawText.length * 0.6f)
            val defaultStepX = (estimatedTextWidth * 1.5f).coerceIn(160f, 320f)
            val defaultStepY = (watermark.fontSize * 3.5f).coerceIn(120f, 260f)
            val stepX = watermark.spacingX ?: defaultStepX
            val stepY = watermark.spacingY ?: defaultStepY

            var rowIndex = 0
            var y = -stepY / 2f
            while (y <= pageHeight + stepY) {
                val offsetX = if (rowIndex % 2 != 0) stepX / 2f else 0f
                var x = -stepX / 2f + offsetX
                while (x <= pageWidth + stepX) {
                    cb.showTextAligned(
                        Element.ALIGN_CENTER,
                        rawText,
                        x,
                        y,
                        watermark.rotation,
                    )
                    x += stepX
                }
                y += stepY
                rowIndex++
            }
        } else {
            cb.showTextAligned(
                Element.ALIGN_CENTER,
                rawText,
                centerX,
                centerY,
                watermark.rotation,
            )
        }
        cb.endText()
    }

    private fun renderImageWatermark(
        cb: PdfContentByte,
        watermark: WatermarkConfig,
        pageWidth: Float,
        pageHeight: Float,
        centerX: Float,
        centerY: Float,
    ) {
        val source = watermark.imageSource
        if (source.isNullOrBlank()) return

        val image = renderEngine.loadImage(source)
        val imgW = image.width.coerceAtLeast(1f)
        val imgH = image.height.coerceAtLeast(1f)
        val rawW = watermark.width?.takeIf { it > 0f }
        val rawH = watermark.height?.takeIf { it > 0f }

        val (targetW, targetH) =
            when {
                rawW != null && rawH != null -> rawW to rawH
                rawW != null -> rawW to (imgH * (rawW / imgW))
                rawH != null -> (imgW * (rawH / imgH)) to rawH
                watermark.repeat -> {
                    val defaultSize = (pageWidth * 0.25f).coerceIn(80f, 180f)
                    defaultSize to (imgH * (defaultSize / imgW))
                }
                else -> {
                    val maxW = pageWidth * 0.7f
                    val maxH = pageHeight * 0.7f
                    val scale = minOf(maxW / imgW, maxH / imgH, 1f)
                    (imgW * scale) to (imgH * scale)
                }
            }
        image.scaleToFit(targetW.coerceAtLeast(1f), targetH.coerceAtLeast(1f))
        image.setRotationDegrees(watermark.rotation)
        val scaledW = image.scaledWidth
        val scaledH = image.scaledHeight

        if (watermark.repeat) {
            val defaultStepX = (scaledW * 1.8f).coerceAtLeast(40f)
            val defaultStepY = (scaledH * 1.8f).coerceAtLeast(40f)
            val stepX = watermark.spacingX ?: defaultStepX
            val stepY = watermark.spacingY ?: defaultStepY

            var rowIndex = 0
            var y = -stepY / 2f
            while (y <= pageHeight + stepY) {
                val offsetX = if (rowIndex % 2 != 0) stepX / 2f else 0f
                var x = -stepX / 2f + offsetX
                while (x <= pageWidth + stepX) {
                    val imgCopy = Image.getInstance(image)
                    imgCopy.setAbsolutePosition(x - (scaledW / 2f), y - (scaledH / 2f))
                    cb.addImage(imgCopy)
                    x += stepX
                }
                y += stepY
                rowIndex++
            }
        } else {
            image.setAbsolutePosition(centerX - (scaledW / 2f), centerY - (scaledH / 2f))
            cb.addImage(image)
        }
    }

    private fun resolveBaseFontName(
        fontName: String,
        fontStyle: String,
    ): String {
        val isBold = fontStyle.contains("bold", ignoreCase = true)
        val isItalic = fontStyle.contains("italic", ignoreCase = true)
        val familyLower = fontName.lowercase()
        return when {
            familyLower.contains("times") ->
                when {
                    isBold && isItalic -> BaseFont.TIMES_BOLDITALIC
                    isBold -> BaseFont.TIMES_BOLD
                    isItalic -> BaseFont.TIMES_ITALIC
                    else -> BaseFont.TIMES_ROMAN
                }
            familyLower.contains("courier") ->
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
}
