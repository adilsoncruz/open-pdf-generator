package com.pdfgenerator.adapter.openpdf

import com.pdfgenerator.api.PDFGeneratorConfig
import com.pdfgenerator.engine.RenderEngine
import com.pdfgenerator.model.Template
import com.pdfgenerator.util.ConditionEvaluator
import com.pdfgenerator.util.withSyntheticBindings
import org.openpdf.text.Document
import org.openpdf.text.pdf.PdfPageEventHelper
import org.openpdf.text.pdf.PdfWriter
import org.slf4j.LoggerFactory

class HeaderFooterPageEvent(
    private val template: Template,
    private val data: Map<String, Any?>,
    private val config: PDFGeneratorConfig,
) : PdfPageEventHelper() {
    private val logger = LoggerFactory.getLogger(HeaderFooterPageEvent::class.java)
    private val renderEngine = RenderEngine(config)
    private val sectionRenderer = HeaderFooterSectionRenderer(template, data, config, renderEngine)
    private val watermarkPainter = WatermarkPainter(renderEngine, config)

    private var initialized = false

    override fun onStartPage(
        writer: PdfWriter,
        document: Document,
    ) {
        try {
            if (!initialized) {
                sectionRenderer.initialize(writer, document)
                initialized = true
            }

            val pageData = buildPageData(writer)

            template.pageSettings.bodyBackground?.let { bodyBackground ->
                val bgCondition = bodyBackground.printCondition
                if (bgCondition == null || ConditionEvaluator.evaluate(bgCondition, pageData, null)) {
                    sectionRenderer.renderBodyBackground(writer)
                }
            }

            template.pageSettings.watermark?.let { watermark ->
                if (!watermark.onTop) {
                    val watermarkCondition = watermark.printCondition
                    if (watermarkCondition == null || ConditionEvaluator.evaluate(watermarkCondition, pageData, null)) {
                        watermarkPainter.renderWatermark(writer, document, watermark, pageData)
                    }
                }
            }
        } catch (e: Exception) {
            logger.error("Error rendering body background or watermark: ${e.message}", e)
            if (config.strictMode) {
                throw e
            }
        }
    }

    override fun onEndPage(
        writer: PdfWriter,
        document: Document,
    ) {
        try {
            val pageData = buildPageData(writer)

            template.pageSettings.header?.let { header ->
                val headerCondition = header.printCondition
                if (headerCondition == null || ConditionEvaluator.evaluate(headerCondition, pageData, null)) {
                    sectionRenderer.renderHeader(writer, pageData)
                }
            }

            template.pageSettings.footer?.let { footer ->
                val footerCondition = footer.printCondition
                if (footerCondition == null || ConditionEvaluator.evaluate(footerCondition, pageData, null)) {
                    sectionRenderer.renderFooter(writer, pageData)
                }
            }

            template.pageSettings.watermark?.let { watermark ->
                if (watermark.onTop) {
                    val watermarkCondition = watermark.printCondition
                    if (watermarkCondition == null || ConditionEvaluator.evaluate(watermarkCondition, pageData, null)) {
                        watermarkPainter.renderWatermark(writer, document, watermark, pageData)
                    }
                }
            }

            if (template.pageSettings.showMargins || config.showMargins) {
                sectionRenderer.renderMarginGuidelines(writer, document)
            }
        } catch (e: Exception) {
            logger.error("Error rendering header/footer: ${e.message}", e)
            if (config.strictMode) {
                throw e
            }
        }
    }

    private fun buildPageData(writer: PdfWriter): Map<String, Any?> {
        return withSyntheticBindings(
            data,
            mapOf(
                "_pageNumber" to writer.pageNumber,
                "pageNumber" to writer.pageNumber,
                "page" to writer.pageNumber,
                "_date" to java.time.LocalDate.now().toString(),
                "_dateTime" to java.time.LocalDateTime.now().toString(),
            ),
        )
    }
}
