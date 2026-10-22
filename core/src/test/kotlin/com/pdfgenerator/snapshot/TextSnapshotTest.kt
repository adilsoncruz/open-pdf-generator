package com.pdfgenerator.snapshot

import com.github.adilsoncruz.pdfsnapshottesting.EnablePdfSnapshots
import com.github.adilsoncruz.pdfsnapshottesting.assertPdfByFile
import com.pdfgenerator.api.PDFGenerator
import org.junit.jupiter.api.DisplayName
import org.junit.jupiter.api.Test

@EnablePdfSnapshots
class TextSnapshotTest {

    private val generator = PDFGenerator()

    @Test
    @DisplayName("Text: Font families (Helvetica, Times, Courier), weights, styles, and background highlights")
    fun testTextFontFamiliesAndStyles() {
        val templateJson = """
        {
          "version": "1.0",
          "pageSettings": {
            "size": "A4",
            "orientation": "portrait",
            "margins": { "top": 36, "right": 36, "bottom": 36, "left": 36 }
          },
          "pageElements": [
            {
              "type": "text",
              "id": "h-title",
              "x": 36,
              "y": 36,
              "value": "Text Element - Font Families & Styling Matrix",
              "style": { "fontSize": 18, "fontWeight": "bold", "color": "#0f172a" }
            },
            {
              "type": "text",
              "id": "helvetica-normal",
              "x": 36,
              "y": 70,
              "value": "Helvetica Normal (12pt) - Quick brown fox jumps over the lazy dog",
              "style": { "fontFamily": "Helvetica", "fontSize": 12, "color": "#1e293b" }
            },
            {
              "type": "text",
              "id": "helvetica-bold",
              "x": 36,
              "y": 95,
              "value": "Helvetica Bold (12pt) - High performance parallel document engine",
              "style": { "fontFamily": "Helvetica", "fontSize": 12, "fontWeight": "bold", "color": "#4338ca" }
            },
            {
              "type": "text",
              "id": "helvetica-italic",
              "x": 36,
              "y": 120,
              "value": "Helvetica Italic (11pt) - Direct vector operator emission",
              "style": { "fontFamily": "Helvetica", "fontSize": 11, "fontStyle": "italic", "color": "#64748b" }
            },
            {
              "type": "text",
              "id": "times-roman",
              "x": 36,
              "y": 150,
              "value": "Times-Roman Serif (13pt) - Legal contracts, terms, and formal documentation",
              "style": { "fontFamily": "Times", "fontSize": 13, "color": "#0f172a" }
            },
            {
              "type": "text",
              "id": "times-bold-italic",
              "x": 36,
              "y": 175,
              "value": "Times Bold Italic (12pt) - Executive summary and audited financial clauses",
              "style": { "fontFamily": "Times", "fontSize": 12, "fontWeight": "bold", "fontStyle": "italic", "color": "#047857" }
            },
            {
              "type": "text",
              "id": "courier-mono",
              "x": 36,
              "y": 205,
              "value": "Courier Monospace (11pt) - val stream = PDFGenerator().generate(tpl, data)",
              "style": { "fontFamily": "Courier", "fontSize": 11, "color": "#0369a1" }
            },
            {
              "type": "text",
              "id": "courier-bold",
              "x": 36,
              "y": 230,
              "value": "Courier Bold (11pt) - STATUS_CODE_200_OK_VERIFIED",
              "style": { "fontFamily": "Courier", "fontSize": 11, "fontWeight": "bold", "color": "#b45309" }
            },
            {
              "type": "text",
              "id": "bg-highlight-1",
              "x": 36,
              "y": 260,
              "width": 260,
              "height": 22,
              "value": " Highlighted Amber Notice Badge ",
              "style": { "fontSize": 11, "fontWeight": "bold", "color": "#78350f", "backgroundColor": "#fef3c7" }
            },
            {
              "type": "text",
              "id": "bg-highlight-2",
              "x": 310,
              "y": 260,
              "width": 210,
              "height": 22,
              "value": " Emerald Success Pill Tag ",
              "style": { "fontSize": 11, "fontWeight": "bold", "color": "#064e3b", "backgroundColor": "#d1fae5" }
            }
          ]
        }
        """.trimIndent()

        val pdfBytes = generator.generate(templateJson, "{}")
        assertPdfByFile("text/text-font-families-styles.pdf", pdfBytes)
    }

    @Test
    @DisplayName("Text: Horizontal alignments (left, center, right, justify) in fixed widths")
    fun testTextAlignmentsAndJustify() {
        val templateJson = """
        {
          "version": "1.0",
          "pageSettings": {
            "size": "A4",
            "orientation": "portrait",
            "margins": { "top": 36, "right": 36, "bottom": 36, "left": 36 }
          },
          "pageElements": [
            {
              "type": "text",
              "id": "h-align",
              "x": 36,
              "y": 36,
              "value": "Text Alignment Matrix (Box Width 480pt)",
              "style": { "fontSize": 16, "fontWeight": "bold", "color": "#0f172a" }
            },
            {
              "type": "text",
              "id": "align-left-box",
              "x": 36,
              "y": 70,
              "width": 480,
              "height": 22,
              "value": "Left Aligned Text: Standard paragraph starting flush against left boundary.",
              "style": { "fontSize": 11, "alignment": "left", "color": "#1e293b", "backgroundColor": "#f1f5f9" }
            },
            {
              "type": "text",
              "id": "align-center-box",
              "x": 36,
              "y": 105,
              "width": 480,
              "height": 22,
              "value": "Center Aligned Text: Balanced symmetrically inside the container box.",
              "style": { "fontSize": 11, "alignment": "center", "color": "#4338ca", "backgroundColor": "#e0e7ff" }
            },
            {
              "type": "text",
              "id": "align-right-box",
              "x": 36,
              "y": 140,
              "width": 480,
              "height": 22,
              "value": "Right Aligned Text: Flush against right boundary (ideal for numbers and dates).",
              "style": { "fontSize": 11, "alignment": "right", "color": "#047857", "backgroundColor": "#d1fae5" }
            },
            {
              "type": "text",
              "id": "align-justify-box",
              "x": 36,
              "y": 175,
              "width": 480,
              "height": 55,
              "value": "Justified Multiline Block: Open PDF Generator automatically computes line word-spacing so that both left and right edges are perfectly aligned across multiple rendered lines without ragged text artifacts.",
              "style": { "fontSize": 10, "alignment": "justify", "multiline": true, "lineHeight": 1.4, "color": "#334155", "backgroundColor": "#f8fafc" }
            }
          ]
        }
        """.trimIndent()

        val pdfBytes = generator.generate(templateJson, "{}")
        assertPdfByFile("text/text-alignments-justify.pdf", pdfBytes)
    }

    @Test
    @DisplayName("Text: Vertical alignments (top, center, bottom) and custom paddings")
    fun testTextVerticalAlignmentAndPaddings() {
        val templateJson = """
        {
          "version": "1.0",
          "pageSettings": {
            "size": "A4",
            "orientation": "portrait",
            "margins": { "top": 36, "right": 36, "bottom": 36, "left": 36 }
          },
          "pageElements": [
            {
              "type": "text",
              "id": "valign-top",
              "x": 36,
              "y": 36,
              "width": 150,
              "height": 70,
              "value": "Top Aligned Text",
              "style": { "fontSize": 11, "fontWeight": "bold", "verticalAlignment": "top", "backgroundColor": "#fee2e2", "color": "#991b1b" }
            },
            {
              "type": "text",
              "id": "valign-center",
              "x": 200,
              "y": 36,
              "width": 150,
              "height": 70,
              "value": "Center Aligned Text",
              "style": { "fontSize": 11, "fontWeight": "bold", "verticalAlignment": "center", "backgroundColor": "#e0e7ff", "color": "#3730a3" }
            },
            {
              "type": "text",
              "id": "valign-bottom",
              "x": 364,
              "y": 36,
              "width": 150,
              "height": 70,
              "value": "Bottom Aligned Text",
              "style": { "fontSize": 11, "fontWeight": "bold", "verticalAlignment": "bottom", "backgroundColor": "#dcfce7", "color": "#166534" }
            },
            {
              "type": "text",
              "id": "padded-box",
              "x": 36,
              "y": 125,
              "width": 478,
              "height": 55,
              "value": "Padded Box: 12pt Top, 16pt Left/Right padding creates breathing room inside card elements.",
              "style": {
                "fontSize": 10,
                "color": "#1e293b",
                "backgroundColor": "#f8fafc",
                "paddingTop": 12,
                "paddingBottom": 8,
                "paddingLeft": 16,
                "paddingRight": 16
              }
            }
          ]
        }
        """.trimIndent()

        val pdfBytes = generator.generate(templateJson, "{}")
        assertPdfByFile("text/text-vertical-align-paddings.pdf", pdfBytes)
    }

    @Test
    @DisplayName("Text: Multiline line wrapping, line-height multipliers, and first-line indents")
    fun testTextMultilineAndLineHeights() {
        val templateJson = """
        {
          "version": "1.0",
          "pageSettings": {
            "size": "A4",
            "orientation": "portrait",
            "margins": { "top": 36, "right": 36, "bottom": 36, "left": 36 }
          },
          "pageElements": [
            {
              "type": "text",
              "id": "tight-line-height",
              "x": 36,
              "y": 36,
              "width": 480,
              "height": 50,
              "value": "Tight Line Spacing (1.1x): High density invoice disclaimer paragraphs. Designed for small print sections where vertical space is constrained and maximum information density is required.",
              "style": { "fontSize": 9.5, "multiline": true, "lineHeight": 1.1, "color": "#334155" }
            },
            {
              "type": "text",
              "id": "relaxed-line-height",
              "x": 36,
              "y": 95,
              "width": 480,
              "height": 65,
              "value": "Relaxed Line Spacing (1.6x) with First Line Indent (20pt): Optimal editorial reading experience for certificates, letters, and reports. Every paragraph starts with an indentation matching professional typesetting standards.",
              "style": { "fontSize": 10, "multiline": true, "lineHeight": 1.6, "firstLineIndent": 20, "color": "#0f172a" }
            }
          ]
        }
        """.trimIndent()

        val pdfBytes = generator.generate(templateJson, "{}")
        assertPdfByFile("text/text-multiline-line-heights.pdf", pdfBytes)
    }

    @Test
    @DisplayName("Text: Data bindings with format and string transformations")
    fun testTextDataBindingAndTransformations() {
        val templateJson = """
        {
          "version": "1.0",
          "pageSettings": {
            "size": "A4",
            "orientation": "portrait",
            "margins": { "top": 36, "right": 36, "bottom": 36, "left": 36 }
          },
          "pageElements": [
            {
              "type": "text",
              "id": "raw-binding",
              "x": 36,
              "y": 36,
              "value": "Customer Name: ${'$'}{customer.name}",
              "style": { "fontSize": 11, "color": "#1e293b" }
            },
            {
              "type": "text",
              "id": "upper-transform",
              "x": 36,
              "y": 60,
              "value": "Uppercase Account: ${'$'}{customer.account | uppercase}",
              "style": { "fontSize": 11, "fontWeight": "bold", "color": "#4f46e5" }
            },
            {
              "type": "text",
              "id": "padded-transform",
              "x": 36,
              "y": 85,
              "value": "Padded Ref: ${'$'}{customer.refId | padLeft(10, '0')}",
              "style": { "fontSize": 11, "fontFamily": "Courier", "color": "#0369a1" }
            },
            {
              "type": "text",
              "id": "currency-transform",
              "x": 36,
              "y": 110,
              "value": "Subtotal Amount: ${'$'}{financial.subtotal | currency}",
              "style": { "fontSize": 12, "fontWeight": "bold", "color": "#047857" }
            },
            {
              "type": "text",
              "id": "date-transform",
              "x": 36,
              "y": 135,
              "value": "Billing Date: ${'$'}{financial.issueDate | date('yyyy-MM-dd')}",
              "style": { "fontSize": 10, "color": "#64748b" }
            }
          ]
        }
        """.trimIndent()

        val dataJson = """
        {
          "customer": {
            "name": "Acme Technologies Corporation",
            "account": "acme-gold-tier",
            "refId": "4892"
          },
          "financial": {
            "subtotal": 1450.75,
            "issueDate": "2026-10-22"
          }
        }
        """.trimIndent()

        val pdfBytes = generator.generate(templateJson, dataJson)
        assertPdfByFile("text/text-databinding-transformations.pdf", pdfBytes)
    }
}
