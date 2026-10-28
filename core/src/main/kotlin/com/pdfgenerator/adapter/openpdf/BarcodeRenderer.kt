package com.pdfgenerator.adapter.openpdf

import com.google.zxing.BarcodeFormat
import com.google.zxing.EncodeHintType
import com.google.zxing.MultiFormatWriter
import com.google.zxing.common.BitMatrix
import com.google.zxing.qrcode.decoder.ErrorCorrectionLevel
import com.pdfgenerator.engine.RenderContext
import com.pdfgenerator.engine.Renderer
import com.pdfgenerator.model.BarcodeElement
import com.pdfgenerator.util.ConditionEvaluator
import com.pdfgenerator.util.DataBindingResolver
import org.openpdf.text.Image
import org.openpdf.text.pdf.Barcode
import org.openpdf.text.pdf.Barcode128
import org.openpdf.text.pdf.Barcode39
import org.openpdf.text.pdf.BarcodeEAN
import org.openpdf.text.pdf.BarcodePDF417
import org.slf4j.LoggerFactory

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
            val image = generateBarcodeImage(element, data, context)

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
        context: RenderContext,
    ): Image {
        val effectiveType = (element.barcodeType ?: "qrcode").lowercase()
        val canvas = if (context.useContentUnder) context.writer.directContentUnder else context.writer.directContent

        return when (effectiveType) {
            "barcode", "code128", "code_128" -> {
                try {
                    val b = Barcode128()
                    b.code = data
                    b.createImageWithBarcode(canvas, null, null)
                } catch (e: Exception) {
                    generateZxingImage(element, data, BarcodeFormat.CODE_128)
                }
            }
            "code39", "code_39" -> {
                try {
                    val b = Barcode39()
                    b.code = data
                    b.createImageWithBarcode(canvas, null, null)
                } catch (e: Exception) {
                    generateZxingImage(element, data, BarcodeFormat.CODE_39)
                }
            }
            "ean13", "ean_13" -> {
                try {
                    val b = BarcodeEAN()
                    b.codeType = Barcode.EAN13
                    b.code = data
                    b.createImageWithBarcode(canvas, null, null)
                } catch (e: Exception) {
                    generateZxingImage(element, data, BarcodeFormat.EAN_13)
                }
            }
            "ean8", "ean_8" -> {
                try {
                    val b = BarcodeEAN()
                    b.codeType = Barcode.EAN8
                    b.code = data
                    b.createImageWithBarcode(canvas, null, null)
                } catch (e: Exception) {
                    generateZxingImage(element, data, BarcodeFormat.EAN_8)
                }
            }
            "upc_a", "upca" -> {
                try {
                    val b = BarcodeEAN()
                    b.codeType = Barcode.UPCA
                    b.code = data
                    b.createImageWithBarcode(canvas, null, null)
                } catch (e: Exception) {
                    generateZxingImage(element, data, BarcodeFormat.UPC_A)
                }
            }
            "upc_e", "upce" -> {
                try {
                    val b = BarcodeEAN()
                    b.codeType = Barcode.UPCE
                    b.code = data
                    b.createImageWithBarcode(canvas, null, null)
                } catch (e: Exception) {
                    generateZxingImage(element, data, BarcodeFormat.UPC_E)
                }
            }
            "pdf417" -> {
                try {
                    val b = BarcodePDF417()
                    b.setText(data)
                    b.image
                } catch (e: Exception) {
                    generateZxingImage(element, data, BarcodeFormat.PDF_417)
                }
            }
            "qrcode", "qr_code" -> generateZxingImage(element, data, BarcodeFormat.QR_CODE)
            "datamatrix", "data_matrix" -> generateZxingImage(element, data, BarcodeFormat.DATA_MATRIX)
            else -> throw IllegalArgumentException("Unsupported barcode type: ${element.barcodeType}")
        }
    }

    private fun generateZxingImage(
        element: BarcodeElement,
        data: String,
        format: BarcodeFormat,
    ): Image {
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

        val width = (if (element.width > 0f) element.width.toInt() else 100).coerceAtLeast(10)
        val height = (if (element.height > 0f) element.height.toInt() else 100).coerceAtLeast(10)

        val writer = MultiFormatWriter()
        val bitMatrix =
            try {
                writer.encode(data, format, width, height, hints)
            } catch (e: Exception) {
                logger.warn("Fallback para CODE_128 no barcode ${element.id} devido a conteúdo incompatível '$data': ${e.message}")
                writer.encode(data, BarcodeFormat.CODE_128, width, height)
            }

        return bitMatrixToImage(bitMatrix)
    }

    private fun bitMatrixToImage(bitMatrix: BitMatrix): Image {
        val width = bitMatrix.width
        val height = bitMatrix.height
        val bufferedImage = java.awt.image.BufferedImage(width, height, java.awt.image.BufferedImage.TYPE_INT_RGB)
        val black = 0xFF000000.toInt()
        val white = 0xFFFFFFFF.toInt()

        for (y in 0 until height) {
            for (x in 0 until width) {
                bufferedImage.setRGB(x, y, if (bitMatrix.get(x, y)) black else white)
            }
        }

        val baos = java.io.ByteArrayOutputStream()
        javax.imageio.ImageIO.write(bufferedImage, "png", baos)
        return Image.getInstance(baos.toByteArray())
    }
}
