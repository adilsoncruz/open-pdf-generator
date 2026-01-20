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

    override fun render(element: BarcodeElement, context: RenderContext) {
        if (!ConditionEvaluator.evaluate(element.printCondition, context.data, context.loopContext)) {
            return
        }

        val data = resolveData(element, context)
        if (data.isNullOrBlank()) return

        try {
            val scaleFactor = 3
            val image = generateBarcodeImage(element, data, scaleFactor)

            val pageHeight = context.document.pageSize.height
            val yPosition = pageHeight - element.y - element.height

            image.scaleAbsolute(element.width, element.height)
            image.setAbsolutePosition(element.x, yPosition)

            if (context.useContentUnder) {
                context.writer.directContentUnder.addImage(image)
            } else {
                context.writer.directContent.addImage(image)
            }
        } catch (e: Exception) {
            logger.error("Erro ao renderizar barcode ${element.id}: ${e.message}", e)
        }
    }

    private fun resolveData(element: BarcodeElement, context: RenderContext): String? {
        return DataBindingResolver.resolve(
            element.dataBinding,
            context.data,
            context.loopContext
        )?.toString()
    }

    private fun generateBarcodeImage(element: BarcodeElement, data: String, scaleFactor: Int = 1): Image {
        val format = when (element.barcodeType.lowercase()) {
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
            val errorCorrection = when (element.style?.errorCorrection) {
                "L" -> ErrorCorrectionLevel.L
                "M" -> ErrorCorrectionLevel.M
                "Q" -> ErrorCorrectionLevel.Q
                "H" -> ErrorCorrectionLevel.H
                else -> ErrorCorrectionLevel.M
            }
            hints[EncodeHintType.ERROR_CORRECTION] = errorCorrection
            hints[EncodeHintType.MARGIN] = 0
        }

        val width = element.width.toInt() * scaleFactor
        val height = element.height.toInt() * scaleFactor

        val writer = MultiFormatWriter()
        val bitMatrix: BitMatrix = writer.encode(
            data,
            format,
            width,
            height,
            hints
        )

        val bufferedImage = MatrixToImageWriter.toBufferedImage(bitMatrix)

        val outputStream = ByteArrayOutputStream()
        ImageIO.write(bufferedImage, "PNG", outputStream)
        val imageBytes = outputStream.toByteArray()

        return Image.getInstance(imageBytes)
    }
}

