package com.pdfgenerator.snapshot

import com.github.adilsoncruz.pdfsnapshottesting.EnablePdfSnapshots
import com.github.adilsoncruz.pdfsnapshottesting.assertPdfByFile
import com.pdfgenerator.api.PDFGenerator
import org.junit.jupiter.api.DisplayName
import org.junit.jupiter.api.Test

@EnablePdfSnapshots
class HeaderFooterSnapshotTest {
    private val generator = PDFGenerator()

    @Test
    @DisplayName("Header & Footer: Brand header with title, status badge and footer with page numbers and confidentiality notice")
    fun testHeaderFooterBrandingPagination() {
        val templateJson =
            """
            {
              "version": "1.0",
              "pageSettings": {
                "size": "A4",
                "orientation": "portrait",
                "showMargins": true,
                "margins": { "top": 36, "right": 36, "bottom": 36, "left": 36 },
                "header": {
                  "height": 40,
                  "elements": [
                    {
                      "type": "text",
                      "id": "hdr-brand",
                      "x": 0,
                      "y": 5,
                      "value": "CYBERNETIC DEFENSE SYSTEMS",
                      "style": { "fontSize": 11, "fontWeight": "bold", "color": "#0f172a" }
                    },
                    {
                      "type": "text",
                      "id": "hdr-tagline",
                      "x": 0,
                      "y": 20,
                      "value": "Autonomous Threat Detection & Security Audit",
                      "style": { "fontSize": 8, "color": "#64748b" }
                    },
                    {
                      "type": "rectangle",
                      "id": "hdr-badge-bg",
                      "x": 395,
                      "y": 5,
                      "width": 128,
                      "height": 20,
                      "style": { "fillColor": "#fee2e2", "strokeColor": "#fca5a5", "strokeWidth": 0.75, "cornerRadius": 3 }
                    },
                    {
                      "type": "text",
                      "id": "hdr-badge-txt",
                      "x": 395,
                      "y": 10,
                      "width": 128,
                      "value": "RESTRICTED ACCESS",
                      "style": { "fontSize": 7.5, "fontWeight": "bold", "color": "#991b1b", "alignment": "center" }
                    },
                    {
                      "type": "line",
                      "id": "hdr-separator",
                      "x": 0,
                      "y": 32,
                      "width": "100%",
                      "height": 0,
                      "style": { "strokeColor": "#cbd5e1", "strokeWidth": 1.0 }
                    }
                  ]
                },
                "footer": {
                  "height": 35,
                  "elements": [
                    {
                      "type": "line",
                      "id": "ftr-separator",
                      "x": 0,
                      "y": 0,
                      "width": "100%",
                      "height": 0,
                      "style": { "strokeColor": "#cbd5e1", "strokeWidth": 1.0 }
                    },
                    {
                      "type": "text",
                      "id": "ftr-copy",
                      "x": 0,
                      "y": 10,
                      "value": "Doc Ref: CDS-AUDIT-2026-X9 // Unauthorized distribution prohibited.",
                      "style": { "fontSize": 8, "color": "#64748b" }
                    },
                    {
                      "type": "text",
                      "id": "ftr-paging",
                      "x": 423,
                      "y": 10,
                      "width": 100,
                      "value": "Page {{pageNumber}}",
                      "style": { "fontSize": 8.5, "fontWeight": "bold", "color": "#0f172a", "alignment": "right" }
                    }
                  ]
                }
              },
              "pageElements": [
                {
                  "type": "text",
                  "id": "p1-headline",
                  "x": 0,
                  "y": 15,
                  "value": "Section 1: Perimeter Intrusion Analysis",
                  "style": { "fontSize": 15, "fontWeight": "bold", "color": "#1e293b" }
                },
                {
                  "type": "text",
                  "id": "p1-desc",
                  "x": 0,
                  "y": 40,
                  "width": 523,
                  "multiline": true,
                  "value": "This first page establishes standard margins and demonstrates persistent header injection above the body viewport and footer pagination pinned to the bottom. Header and footer heights automatically adjust the printable body bounding box.",
                  "style": { "fontSize": 10, "color": "#334155", "lineHeight": 1.4 }
                },
                {
                  "type": "pageBreak",
                  "id": "break-1"
                },
                {
                  "type": "text",
                  "id": "p2-headline",
                  "x": 0,
                  "y": 15,
                  "value": "Section 2: Forensic Evidence & Log Reconciliation",
                  "style": { "fontSize": 15, "fontWeight": "bold", "color": "#1e293b" }
                },
                {
                  "type": "text",
                  "id": "p2-desc",
                  "x": 0,
                  "y": 40,
                  "width": 523,
                  "multiline": true,
                  "value": "Second page following explicit page break. Notice the footer dynamically updates to 'Page 2' via synthetic data-binding while preserving header branding.",
                  "style": { "fontSize": 10, "color": "#334155", "lineHeight": 1.4 }
                }
              ]
            }
            """.trimIndent()

        val pdfBytes = generator.generate(templateJson, "{}")
        assertPdfByFile("headers-footers/header-footer-branding-pagination.pdf", pdfBytes)
    }

    @Test
    @DisplayName("Header & Footer: Conditional header and footer rendering based on page data condition")
    fun testHeaderFooterConditional() {
        val templateJson =
            """
            {
              "version": "1.0",
              "pageSettings": {
                "size": "A4",
                "orientation": "portrait",
                "showMargins": true,
                "margins": { "top": 36, "right": 36, "bottom": 36, "left": 36 },
                "header": {
                  "height": 35,
                  "printCondition": "enableBranding == true",
                  "elements": [
                    {
                      "type": "text",
                      "id": "cond-hdr-title",
                      "x": 0,
                      "y": 5,
                      "value": "FINANCIAL AUDIT DIVISION // {{systemName}}",
                      "style": { "fontSize": 10, "fontWeight": "bold", "color": "#047857" }
                    },
                    {
                      "type": "line",
                      "id": "cond-hdr-line",
                      "x": 0,
                      "y": 25,
                      "width": "100%",
                      "height": 0,
                      "style": { "strokeColor": "#a7f3d0", "strokeWidth": 1.0 }
                    }
                  ]
                },
                "footer": {
                  "height": 30,
                  "printCondition": "enableBranding == true",
                  "elements": [
                    {
                      "type": "line",
                      "id": "cond-ftr-line",
                      "x": 0,
                      "y": 0,
                      "width": "100%",
                      "height": 0,
                      "style": { "strokeColor": "#a7f3d0", "strokeWidth": 1.0 }
                    },
                    {
                      "type": "text",
                      "id": "cond-ftr-txt",
                      "x": 0,
                      "y": 8,
                      "value": "Authorized Release - Confidential Audit Report",
                      "style": { "fontSize": 8, "color": "#065f46" }
                    }
                  ]
                }
              },
              "pageElements": [
                {
                  "type": "text",
                  "id": "body-title",
                  "x": 0,
                  "y": 15,
                  "value": "Quarterly Financial Compliance Statement",
                  "style": { "fontSize": 15, "fontWeight": "bold", "color": "#064e3b" }
                },
                {
                  "type": "text",
                  "id": "body-text",
                  "x": 0,
                  "y": 40,
                  "width": 523,
                  "multiline": true,
                  "value": "Both header and footer specify printCondition 'enableBranding == true'. Since the dataset supplies enableBranding=true, both elements are rendered with dynamic data interpolation.",
                  "style": { "fontSize": 10, "color": "#065f46", "lineHeight": 1.4 }
                }
              ]
            }
            """.trimIndent()

        val dataJson = """{"enableBranding": true, "systemName": "Audit Core v2"}"""
        val pdfBytes = generator.generate(templateJson, dataJson)
        assertPdfByFile("headers-footers/header-footer-conditional.pdf", pdfBytes)
    }
}
