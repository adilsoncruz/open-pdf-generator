package com.pdfgenerator.adapter.openpdf

import com.google.zxing.BarcodeFormat
import com.google.zxing.EncodeHintType
import com.google.zxing.MultiFormatWriter
import com.google.zxing.client.j2se.MatrixToImageWriter
import com.google.zxing.common.BitMatrix
import com.google.zxing.qrcode.decoder.ErrorCorrectionLevel
import com.lowagie.text.Image
import com.pdfgenerator.engine.RenderContext
import com.pdfgenerator.engine.Renderer
import com.pdfgenerator.model.BarcodeElement
import com.pdfgenerator.util.ConditionEvaluator
import com.pdfgenerator.util.DataBindingResolver
import org.slf4j.LoggerFactory
import java.io.ByteArrayOutputStream
import javax.imageio.ImageIO

class BarcodeRenderer : Renderer<BarcodeElement> {
    private val logger = LoggerFactory.getLogger(BarcodeRenderer::class.java)

    override fun render(
        element: BarcodeElement,
        context: RenderContext,
    ) {
        if (!ConditionEvaluator.evaluate(element.printCondition, context.data, context.loopContext)) {
            return
        }

        val data = resolveData(element, context)
        if (data.isNullOrBlank()) return

        try {
            val scaleFactor = 3
            val image = generateBarcodeImage(element, data, scaleFactor)

            val pageHeight = context.document.pageSize.height
            val x = context.resolveX(element.x)
            val y = context.resolveY(element.y)
            val yPosition = pageHeight - y - element.height

            image.scaleAbsolute(element.width, element.height)
            image.setAbsolutePosition(x, yPosition)

            if (context.useContentUnder) {
                context.writer.directContentUnder.addImage(image)
            } else {
                context.writer.directContent.addImage(image)
            }
        } catch (e: Exception) {
            logger.error("Erro ao renderizar barcode ${element.id}: ${e.message}", e)
        }
    }

    private fun resolveData(
        element: BarcodeElement,
        context: RenderContext,
    ): String? {
        val rawBinding = element.dataBinding?.trim() ?: ""
        val rawValue = element.value?.trim() ?: ""
        val effectiveType = (element.barcodeType ?: "qrcode").lowercase()

        // 1. Try resolving dataBinding from context data / loopContext
        if (rawBinding.isNotEmpty()) {
            val cleanKey = rawBinding.removePrefix("{{").removeSuffix("}}").removePrefix("\${").removeSuffix("}").trim()
            val resolved =
                DataBindingResolver.resolve(
                    cleanKey,
                    context.data,
                    context.loopContext,
                )?.toString()
            if (!resolved.isNullOrBlank()) {
                return resolved
            }
            if (context.data.containsKey(cleanKey)) {
                return null
            }
        }

        // 2. Try resolving value from context data if it looks like a binding
        if (rawValue.isNotEmpty()) {
            val cleanValKey = rawValue.removePrefix("{{").removeSuffix("}}").removePrefix("\${").removeSuffix("}").trim()
            val resolvedVal =
                DataBindingResolver.resolve(
                    cleanValKey,
                    context.data,
                    context.loopContext,
                )?.toString()
            if (!resolvedVal.isNullOrBlank()) {
                return resolvedVal
            }
            return rawValue
        }

        // 3. Fallback to literal dataBinding string or default sample
        if (rawBinding.isNotEmpty()) {
            return rawBinding
        }

        return if (effectiveType in listOf("qrcode", "qr_code")) {
            "https://openpdf.dev"
        } else {
            "123456789012"
        }
    }

    private fun generateBarcodeImage(
        element: BarcodeElement,
        data: String,
        scaleFactor: Int = 1,
    ): Image {
        val effectiveType = (element.barcodeType ?: "qrcode").lowercase()
        val format =
            when (effectiveType) {
                "qrcode", "qr_code" -> BarcodeFormat.QR_CODE
                "barcode", "code128", "code_128" -> BarcodeFormat.CODE_128
                "code39", "code_39" -> BarcodeFormat.CODE_39
                "ean13", "ean_13" -> BarcodeFormat.EAN_13
                "ean8", "ean_8" -> BarcodeFormat.EAN_8
                "upc_a", "upca" -> BarcodeFormat.UPC_A
                "upc_e", "upce" -> BarcodeFormat.UPC_E
                "pdf417" -> BarcodeFormat.PDF_417
                "datamatrix", "data_matrix" -> BarcodeFormat.DATA_MATRIX
                else -> throw IllegalArgumentException("Unsupported barcode type: ${element.barcodeType}")
            }

        val hints = mutableMapOf<EncodeHintType, Any>()
        if (format == BarcodeFormat.QR_CODE) {
            val errorCorrection =
                when (element.style?.errorCorrection) {
                    "L" -> ErrorCorrectionLevel.L
                    "M" -> ErrorCorrectionLevel.M
                    "Q" -> ErrorCorrectionLevel.Q
                    "H" -> ErrorCorrectionLevel.H
                    else -> ErrorCorrectionLevel.M
                }
            hints[EncodeHintType.ERROR_CORRECTION] = errorCorrection
            hints[EncodeHintType.MARGIN] = 0
        }

        val width = (if (element.width > 0f) element.width.toInt() else 100).coerceAtLeast(10) * scaleFactor
        val height = (if (element.height > 0f) element.height.toInt() else 100).coerceAtLeast(10) * scaleFactor

        val writer = MultiFormatWriter()
        val bitMatrix: BitMatrix =
            try {
                writer.encode(
                    data,
                    format,
                    width,
                    height,
                    hints,
                )
            } catch (e: Exception) {
                logger.warn("Fallback para CODE_128 no barcode ${element.id} ($effectiveType) devido a conteúdo incompatível '$data': ${e.message}")
                writer.encode(
                    data,
                    BarcodeFormat.CODE_128,
                    width,
                    height,
                )
            }

        val bufferedImage = MatrixToImageWriter.toBufferedImage(bitMatrix)

        val outputStream = ByteArrayOutputStream()
        ImageIO.write(bufferedImage, "PNG", outputStream)
        val imageBytes = outputStream.toByteArray()

        return Image.getInstance(imageBytes)
    }
}
