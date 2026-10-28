package com.pdfgenerator.engine

import com.pdfgenerator.api.PDFGeneratorConfig
import com.pdfgenerator.model.Template
import org.openpdf.text.Document
import org.openpdf.text.pdf.PdfWriter

class RenderState {
    var currentY: Float = 0f

    fun updateMaxY(newY: Float) {
        if (newY > currentY) {
            currentY = newY
        }
    }
}

data class TextLayoutCacheKey(
    val elementId: String,
    val resolvedText: String,
    val styleHash: Int,
)

data class TextLayoutMeasurement(
    val lines: List<String>,
    val lineSpacing: Float,
    val contentHeight: Float,
)

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
    val textLayoutCache: MutableMap<TextLayoutCacheKey, TextLayoutMeasurement> = mutableMapOf(),
) {
    fun resolveX(x: Float): Float = offsetX + x

    fun resolveY(y: Float): Float = offsetY + y
}

data class LoopContext(
    val item: Any?,
    val index: Int,
    val normalizedItemMap: Map<String, Any?>? = null,
)
