package com.pdfgenerator.snapshot

import com.github.adilsoncruz.pdfsnapshottesting.EnablePdfSnapshots
import com.github.adilsoncruz.pdfsnapshottesting.assertPdfByFile
import com.pdfgenerator.api.PDFGenerator
import org.junit.jupiter.api.DisplayName
import org.junit.jupiter.api.Test

@EnablePdfSnapshots
class WatermarkSnapshotTest {

    private val generator = PDFGenerator()

    @Test
    @DisplayName("Watermark: Single centered text with rotation and custom opacity")
    fun testWatermarkSingleCentered() {
        val templateJson = """
        {
          "version": "1.0",
          "pageSettings": {
            "size": "A4",
            "orientation": "portrait",
            "showMargins": true,
            "margins": { "top": 36, "right": 36, "bottom": 36, "left": 36 },
            "watermark": {
              "type": "text",
              "text": "CONFIDENTIAL",
              "fontName": "Helvetica",
              "fontSize": 54,
              "fontStyle": "bold",
              "color": "#ef4444",
              "opacity": 0.18,
              "rotation": 45,
              "onTop": false,
              "repeat": false
            }
          },
          "pageElements": [
            {
              "type": "text",
              "id": "title",
              "x": 0,
              "y": 0,
              "value": "Single Centered Security Watermark",
              "style": { "fontSize": 18, "fontWeight": "bold", "color": "#0f172a" }
            },
            {
              "type": "text",
              "id": "content",
              "x": 0,
              "y": 30,
              "width": 520,
              "multiline": true,
              "value": "The single watermark is centered on the page at a 45 degree angle underneath the document content. The visible dashed outline shows the exact printable margin boundaries.",
              "style": { "fontSize": 11, "color": "#334155", "lineHeight": 1.4 }
            }
          ]
        }
        """.trimIndent()

        val pdfBytes = generator.generate(templateJson, "{}")
        assertPdfByFile("watermark-single-centered.pdf", pdfBytes)
    }

    @Test
    @DisplayName("Watermark: Repeated grid matrix spanning entire document")
    fun testWatermarkRepeatedGrid() {
        val templateJson = """
        {
          "version": "1.0",
          "pageSettings": {
            "size": "A4",
            "orientation": "portrait",
            "showMargins": true,
            "margins": { "top": 36, "right": 36, "bottom": 36, "left": 36 },
            "watermark": {
              "type": "text",
              "text": "SAMPLE DRAFT",
              "fontName": "Helvetica",
              "fontSize": 24,
              "fontStyle": "bold",
              "color": "#6366f1",
              "opacity": 0.14,
              "rotation": -30,
              "repeat": true,
              "spacingX": 180,
              "spacingY": 120,
              "onTop": false
            }
          },
          "pageElements": [
            {
              "type": "text",
              "id": "title",
              "x": 0,
              "y": 0,
              "value": "Continuous Grid Matrix Watermark",
              "style": { "fontSize": 18, "fontWeight": "bold", "color": "#0f172a" }
            },
            {
              "type": "text",
              "id": "content",
              "x": 0,
              "y": 30,
              "width": 520,
              "multiline": true,
              "value": "Repeated watermarks tile across the entire canvas with alternating row offsets, ensuring every quadrant has anti-copy marking while preserving text readability.",
              "style": { "fontSize": 11, "color": "#334155", "lineHeight": 1.4 }
            }
          ]
        }
        """.trimIndent()

        val pdfBytes = generator.generate(templateJson, "{}")
        assertPdfByFile("watermark-repeated-grid.pdf", pdfBytes)
    }

    @Test
    @DisplayName("Watermark: Dynamic data-bound watermark with condition")
    fun testWatermarkDataBinding() {
        val templateJson = """
        {
          "version": "1.0",
          "pageSettings": {
            "size": "A4",
            "orientation": "portrait",
            "showMargins": true,
            "margins": { "top": 36, "right": 36, "bottom": 36, "left": 36 },
            "watermark": {
              "type": "text",
              "dataBinding": "{{document.auditStatus}}",
              "fontName": "Helvetica",
              "fontSize": 48,
              "fontStyle": "bold",
              "color": "#d97706",
              "opacity": 0.20,
              "rotation": 45,
              "onTop": false,
              "repeat": false
            }
          },
          "pageElements": [
            {
              "type": "text",
              "id": "title",
              "x": 0,
              "y": 0,
              "value": "Dynamic Data-Bound Watermark",
              "style": { "fontSize": 18, "fontWeight": "bold", "color": "#0f172a" }
            },
            {
              "type": "text",
              "id": "content",
              "x": 0,
              "y": 30,
              "width": 520,
              "multiline": true,
              "value": "Watermark dynamically resolved from dataBinding '{{document.auditStatus}}'. Current document state: PENDING APPROVAL.",
              "style": { "fontSize": 11, "color": "#334155", "lineHeight": 1.4 }
            }
          ]
        }
        """.trimIndent()

        val dataJson = """
        {
          "document": {
            "auditStatus": "PENDING APPROVAL"
          }
        }
        """.trimIndent()

        val pdfBytes = generator.generate(templateJson, dataJson)
        assertPdfByFile("watermark-dynamic-binding.pdf", pdfBytes)
    }

    @Test
    @DisplayName("Watermark: onTop=true overlay stamping over foreground content")
    fun testWatermarkOnTopOverlay() {
        val templateJson = """
        {
          "version": "1.0",
          "pageSettings": {
            "size": "A4",
            "orientation": "portrait",
            "showMargins": true,
            "margins": { "top": 36, "right": 36, "bottom": 36, "left": 36 },
            "watermark": {
              "type": "text",
              "text": "VOID / CANCELLED",
              "fontName": "Helvetica",
              "fontSize": 52,
              "fontStyle": "bold",
              "color": "#dc2626",
              "opacity": 0.28,
              "rotation": -35,
              "onTop": true,
              "repeat": false
            }
          },
          "pageElements": [
            {
              "type": "text",
              "id": "title",
              "x": 0,
              "y": 0,
              "value": "Fiscal Invoice Cancellation Notice",
              "style": { "fontSize": 18, "fontWeight": "bold", "color": "#0f172a" }
            },
            {
              "type": "rectangle",
              "id": "invoice-box",
              "x": 0,
              "y": 40,
              "width": "100%",
              "height": 180,
              "style": { "fillColor": "#f8fafc", "borderColor": "#cbd5e1", "borderWidth": 1.0, "cornerRadius": 8 }
            },
            {
              "type": "text",
              "id": "box-content",
              "x": 20,
              "y": 60,
              "width": 480,
              "multiline": true,
              "value": "This invoice content is overlaid by the 'VOID / CANCELLED' watermark because onTop=true renders in directContent over all page layers.",
              "style": { "fontSize": 11, "color": "#1e293b", "lineHeight": 1.5 }
            }
          ]
        }
        """.trimIndent()

        val pdfBytes = generator.generate(templateJson, "{}")
        assertPdfByFile("watermark-ontop-overlay.pdf", pdfBytes)
    }
}
