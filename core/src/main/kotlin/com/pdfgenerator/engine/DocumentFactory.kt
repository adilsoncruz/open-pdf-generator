package com.pdfgenerator.engine

import com.lowagie.text.Document
import com.lowagie.text.PageSize
import com.lowagie.text.Rectangle
import com.lowagie.text.pdf.PdfWriter
import com.pdfgenerator.adapter.openpdf.HeaderFooterPageEvent
import com.pdfgenerator.api.PDFGeneratorConfig
import com.pdfgenerator.model.CustomSize
import com.pdfgenerator.model.Margins
import com.pdfgenerator.model.PageSettings
import com.pdfgenerator.model.Template
import com.pdfgenerator.util.ConditionEvaluator
import com.pdfgenerator.util.withSyntheticBindings
import com.pdfgenerator.util.withSyntheticPageNumber
import java.io.OutputStream

data class DocumentLayout(
    val document: Document,
    val writer: PdfWriter,
    val effectiveHeaderHeightPage1: Float,
    val effectiveFooterHeightPage1: Float,
    val bodyContainerWidth: Float,
    val bodyContainerHeight: Float,
    val bodyOffsetX: Float,
    val bodyOffsetY: Float,
)

data class DocumentSession(
    val layout: DocumentLayout,
    val context: RenderContext,
) {
    fun finalizeBaseLayer() {
        val cb = layout.writer.directContent
        cb.saveState()
        cb.setColorFill(java.awt.Color(255, 255, 255, 0)) // Fully transparent
        cb.rectangle(0f, 0f, 1f, 1f)
        cb.fill()
        cb.restoreState()
    }

    fun close() {
        layout.document.close()
    }
}

object DocumentFactory {
    fun createDocument(
        pageSize: Rectangle,
        margins: Margins,
        marginTop: Float = margins.top,
        marginBottom: Float = margins.bottom,
    ): Document = Document(pageSize, margins.left, margins.right, marginTop, marginBottom)

    fun resolvePageSize(pageSettings: PageSettings): Rectangle = pageSettings.getPageSize()

    fun resolvePageSize(
        size: String,
        orientation: String,
        customSize: CustomSize? = null,
    ): Rectangle {
        val baseSize =
            when (size.uppercase()) {
                "A4" -> PageSize.A4
                "A3" -> PageSize.A3
                "A5" -> PageSize.A5
                "LETTER" -> PageSize.LETTER
                "LEGAL" -> PageSize.LEGAL
                "CUSTOM" ->
                    customSize?.let { Rectangle(it.width, it.height) }
                        ?: throw IllegalArgumentException("Custom size required when size is CUSTOM")
                else -> throw IllegalArgumentException("Unknown page size: $size")
            }

        return when (orientation.lowercase()) {
            "portrait" -> baseSize
            "landscape" -> baseSize.rotate()
            else -> throw IllegalArgumentException("Unknown orientation: $orientation")
        }
    }

    fun calculateHeaderFooterHeights(
        template: Template,
        data: Map<String, Any?>,
    ): Pair<Float, Float> {
        val page1Data = withSyntheticPageNumber(data, 1)

        val headerVisiblePage1 =
            template.pageSettings.header?.let { header ->
                val condition = header.printCondition
                condition == null || ConditionEvaluator.evaluate(condition, page1Data, null)
            } ?: false

        val footerVisiblePage1 =
            template.pageSettings.footer?.let { footer ->
                val condition = footer.printCondition
                condition == null || ConditionEvaluator.evaluate(condition, page1Data, null)
            } ?: false

        val effectiveHeaderHeight = if (headerVisiblePage1) template.pageSettings.header?.height ?: 0f else 0f
        val effectiveFooterHeight = if (footerVisiblePage1) template.pageSettings.footer?.height ?: 0f else 0f

        return Pair(effectiveHeaderHeight, effectiveFooterHeight)
    }

    fun setupDocument(
        template: Template,
        data: Map<String, Any?>,
        output: OutputStream,
        config: PDFGeneratorConfig,
        securityConfigurator: PDFSecurityConfigurator? = null,
    ): DocumentLayout {
        val (effectiveHeaderHeightPage1, effectiveFooterHeightPage1) =
            calculateHeaderFooterHeights(template, data)

        val margins = template.pageSettings.margins
        val effectiveMarginTop = margins.top + effectiveHeaderHeightPage1
        val effectiveMarginBottom = margins.bottom + effectiveFooterHeightPage1

        val document =
            createDocument(
                pageSize = resolvePageSize(template.pageSettings),
                margins = margins,
                marginTop = effectiveMarginTop,
                marginBottom = effectiveMarginBottom,
            )

        val writer = PdfWriter.getInstance(document, output)
        securityConfigurator?.configure(writer)

        if (template.pageSettings.header != null ||
            template.pageSettings.footer != null ||
            template.pageSettings.bodyBackground != null ||
            template.pageSettings.watermark != null
        ) {
            writer.pageEvent = HeaderFooterPageEvent(template, data, config)
        }

        document.open()

        val bodyContainerWidth = document.pageSize.width - margins.left - margins.right
        val bodyContainerHeight =
            document.pageSize.height - margins.top - margins.bottom -
                effectiveHeaderHeightPage1 - effectiveFooterHeightPage1

        val bodyOffsetY = margins.top + effectiveHeaderHeightPage1
        val bodyOffsetX = margins.left

        return DocumentLayout(
            document = document,
            writer = writer,
            effectiveHeaderHeightPage1 = effectiveHeaderHeightPage1,
            effectiveFooterHeightPage1 = effectiveFooterHeightPage1,
            bodyContainerWidth = bodyContainerWidth,
            bodyContainerHeight = bodyContainerHeight,
            bodyOffsetX = bodyOffsetX,
            bodyOffsetY = bodyOffsetY,
        )
    }

    fun createSession(
        template: Template,
        data: Map<String, Any?>,
        output: OutputStream,
        config: PDFGeneratorConfig,
        securityConfigurator: PDFSecurityConfigurator? = null,
    ): DocumentSession {
        val layout = setupDocument(template, data, output, config, securityConfigurator)

        val enrichedData =
            withSyntheticBindings(
                data,
                mapOf(
                    "_pageNumber" to 1,
                    "_date" to java.time.LocalDate.now().toString(),
                    "_dateTime" to java.time.LocalDateTime.now().toString(),
                ),
            )

        val context =
            RenderContext(
                document = layout.document,
                writer = layout.writer,
                template = template,
                data = enrichedData,
                config = config,
                containerWidth = layout.bodyContainerWidth,
                containerHeight = layout.bodyContainerHeight,
                renderState = RenderState(),
                offsetX = layout.bodyOffsetX,
                offsetY = layout.bodyOffsetY,
                bodyOffsetY = layout.bodyOffsetY,
                headerPrintCondition = template.pageSettings.header?.printCondition,
                footerPrintCondition = template.pageSettings.footer?.printCondition,
                templateHeaderHeight = template.pageSettings.header?.height ?: 0f,
                templateFooterHeight = template.pageSettings.footer?.height ?: 0f,
            )

        return DocumentSession(layout, context)
    }
}
