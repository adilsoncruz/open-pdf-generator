package com.pdfgenerator.engine

import com.lowagie.text.Document
import com.lowagie.text.pdf.PdfWriter
import com.pdfgenerator.api.PDFGeneratorConfig
import com.pdfgenerator.model.Template

class RenderState {
    var currentY: Float = 0f

    fun updateMaxY(newY: Float) {
        if (newY > currentY) {
            currentY = newY
        }
    }
}

data class RenderContext(
    val document: Document,
    val writer: PdfWriter,
    val template: Template,
    val data: Map<String, Any?>,
    val config: PDFGeneratorConfig,
    val loopContext: LoopContext? = null,
    val useContentUnder: Boolean = false,
    val containerWidth: Float? = null,
    val containerHeight: Float? = null,
    val isSummaryPage: Boolean = false,
    val renderState: RenderState? = null,
    val offsetX: Float = 0f,
    val offsetY: Float = 0f,
    val bodyOffsetY: Float = 0f,
    val headerPrintCondition: String? = null,
    val footerPrintCondition: String? = null,
    val templateHeaderHeight: Float = 0f,
    val templateFooterHeight: Float = 0f,
) {
    fun resolveX(x: Float): Float = offsetX + x

    fun resolveY(y: Float): Float = offsetY + y
}

data class LoopContext(
    val item: Any?,
    val index: Int,
)
