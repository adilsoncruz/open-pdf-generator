package com.pdfgenerator.snapshot

import com.github.adilsoncruz.pdfsnapshottesting.EnablePdfSnapshots
import com.github.adilsoncruz.pdfsnapshottesting.assertPdfByFile
import com.pdfgenerator.api.PDFGenerator
import org.junit.jupiter.api.DisplayName
import org.junit.jupiter.api.Test

@EnablePdfSnapshots
class SummarySnapshotTest {
    private val generator = PDFGenerator()

    @Test
    @DisplayName("Summary: Standalone summary page with metrics, totals, approval signature block and background card")
    fun testSummaryPageMetricsTotals() {
        val templateJson =
            """
            {
              "version": "1.0",
              "pageSettings": {
                "size": "A4",
                "orientation": "portrait",
                "showMargins": true,
                "margins": { "top": 36, "right": 36, "bottom": 36, "left": 36 }
              },
              "pageElements": [
                {
                  "type": "text",
                  "id": "p1-title",
                  "x": 0,
                  "y": 10,
                  "value": "Monthly Logistics & Inventory Report",
                  "style": { "fontSize": 18, "fontWeight": "bold", "color": "#0f172a" }
                },
                {
                  "type": "text",
                  "id": "p1-sub",
                  "x": 0,
                  "y": 35,
                  "value": "Primary operations log for warehouse hubs in Region North.",
                  "style": { "fontSize": 10, "color": "#64748b" }
                },
                {
                  "type": "table",
                  "id": "p1-table",
                  "x": 0,
                  "y": 60,
                  "width": 523,
                  "dataBinding": "hubs",
                  "columns": [
                    { "header": "Distribution Hub", "field": "hub", "width": 180, "alignment": "left" },
                    { "header": "Units Dispatched", "field": "units", "width": 110, "alignment": "center" },
                    { "header": "On-Time SLA", "field": "sla", "width": 110, "alignment": "center" },
                    { "header": "Status", "field": "status", "width": 123, "alignment": "center" }
                  ],
                  "style": {
                    "headerBackground": "#312e81",
                    "headerTextColor": "#ffffff",
                    "headerFontSize": 9.5,
                    "rowFontSize": 9,
                    "borderColor": "#cbd5e1",
                    "borderWidth": 0.75,
                    "padding": 5
                  }
                },
                {
                  "type": "text",
                  "id": "p1-notice",
                  "x": 0,
                  "y": 190,
                  "value": "Note: Detailed closure metrics and executive sign-offs are provided on the final Summary Page.",
                  "style": { "fontSize": 9, "fontStyle": "italic", "color": "#475569" }
                }
              ],
              "summaryPage": {
                "background": {
                  "elements": [
                    {
                      "type": "rectangle",
                      "id": "sum-bg-frame",
                      "x": 0,
                      "y": 0,
                      "width": 523,
                      "height": 760,
                      "style": {
                        "fillColor": "#f8fafc",
                        "strokeColor": "#cbd5e1",
                        "strokeWidth": 1.0,
                        "cornerRadius": 8
                      }
                    },
                    {
                      "type": "rectangle",
                      "id": "sum-header-band",
                      "x": 0,
                      "y": 0,
                      "width": 523,
                      "height": 55,
                      "style": {
                        "fillColor": "#4338ca",
                        "cornerRadius": 8
                      }
                    }
                  ]
                },
                "elements": [
                  {
                    "type": "text",
                    "id": "sum-title",
                    "x": 20,
                    "y": 18,
                    "value": "EXECUTIVE AUDIT SUMMARY",
                    "style": { "fontSize": 15, "fontWeight": "bold", "color": "#ffffff" }
                  },
                  {
                    "type": "text",
                    "id": "sum-subtitle",
                    "x": 350,
                    "y": 20,
                    "value": "FINANCIAL YEAR 2026",
                    "style": { "fontSize": 9.5, "fontWeight": "bold", "color": "#c7d2fe", "alignment": "right" }
                  },
                  {
                    "type": "text",
                    "id": "sum-kpi-heading",
                    "x": 20,
                    "y": 75,
                    "value": "CONSOLIDATED PERFORMANCE METRICS",
                    "style": { "fontSize": 11, "fontWeight": "bold", "color": "#1e293b" }
                  },
                  {
                    "type": "rectangle",
                    "id": "kpi-card-1",
                    "x": 20,
                    "y": 95,
                    "width": 150,
                    "height": 60,
                    "style": { "fillColor": "#ffffff", "strokeColor": "#e2e8f0", "strokeWidth": 1, "cornerRadius": 4 }
                  },
                  {
                    "type": "text",
                    "id": "kpi-lbl-1",
                    "x": 30,
                    "y": 105,
                    "value": "TOTAL SHIPMENTS",
                    "style": { "fontSize": 8, "color": "#64748b", "fontWeight": "bold" }
                  },
                  {
                    "type": "text",
                    "id": "kpi-val-1",
                    "x": 30,
                    "y": 122,
                    "value": "54,580 Units",
                    "style": { "fontSize": 14, "fontWeight": "bold", "color": "#4338ca" }
                  },
                  {
                    "type": "rectangle",
                    "id": "kpi-card-2",
                    "x": 185,
                    "y": 95,
                    "width": 150,
                    "height": 60,
                    "style": { "fillColor": "#ffffff", "strokeColor": "#e2e8f0", "strokeWidth": 1, "cornerRadius": 4 }
                  },
                  {
                    "type": "text",
                    "id": "kpi-lbl-2",
                    "x": 195,
                    "y": 105,
                    "value": "AVERAGE ON-TIME SLA",
                    "style": { "fontSize": 8, "color": "#64748b", "fontWeight": "bold" }
                  },
                  {
                    "type": "text",
                    "id": "kpi-val-2",
                    "x": 195,
                    "y": 122,
                    "value": "98.8%",
                    "style": { "fontSize": 14, "fontWeight": "bold", "color": "#059669" }
                  },
                  {
                    "type": "rectangle",
                    "id": "kpi-card-3",
                    "x": 350,
                    "y": 95,
                    "width": 150,
                    "height": 60,
                    "style": { "fillColor": "#ffffff", "strokeColor": "#e2e8f0", "strokeWidth": 1, "cornerRadius": 4 }
                  },
                  {
                    "type": "text",
                    "id": "kpi-lbl-3",
                    "x": 360,
                    "y": 105,
                    "value": "GROSS EXPENDITURE",
                    "style": { "fontSize": 8, "color": "#64748b", "fontWeight": "bold" }
                  },
                  {
                    "type": "text",
                    "id": "kpi-val-3",
                    "x": 360,
                    "y": 122,
                    "value": "€ 428,500.00",
                    "style": { "fontSize": 14, "fontWeight": "bold", "color": "#0f172a" }
                  },
                  {
                    "type": "text",
                    "id": "sum-statement",
                    "x": 20,
                    "y": 180,
                    "width": 480,
                    "multiline": true,
                    "value": "This summary page is automatically appended at the end of the document stream. All audit trails, regulatory checklists, and operational thresholds have been reconciled against primary source records.",
                    "style": { "fontSize": 9.5, "color": "#334155", "lineHeight": 1.4 }
                  },
                  {
                    "type": "line",
                    "id": "sig-line-1",
                    "x": 30,
                    "y": 300,
                    "width": 200,
                    "height": 0,
                    "style": { "strokeColor": "#475569", "strokeWidth": 1 }
                  },
                  {
                    "type": "text",
                    "id": "sig-lbl-1",
                    "x": 30,
                    "y": 308,
                    "value": "Chief Operations Officer",
                    "style": { "fontSize": 9, "fontWeight": "bold", "color": "#1e293b" }
                  },
                  {
                    "type": "line",
                    "id": "sig-line-2",
                    "x": 290,
                    "y": 300,
                    "width": 200,
                    "height": 0,
                    "style": { "strokeColor": "#475569", "strokeWidth": 1 }
                  },
                  {
                    "type": "text",
                    "id": "sig-lbl-2",
                    "x": 290,
                    "y": 308,
                    "value": "Lead Auditor / Compliance Officer",
                    "style": { "fontSize": 9, "fontWeight": "bold", "color": "#1e293b" }
                  }
                ]
              }
            }
            """.trimIndent()

        val dataJson =
            """
            {
              "hubs": [
                { "hub": "Hub Alpha (Berlin)", "units": "14,250", "sla": "99.4%", "status": "COMPLIANT" },
                { "hub": "Hub Beta (Munich)", "units": "9,820", "sla": "98.7%", "status": "COMPLIANT" },
                { "hub": "Hub Gamma (Hamburg)", "units": "12,110", "sla": "99.1%", "status": "COMPLIANT" },
                { "hub": "Hub Delta (Frankfurt)", "units": "18,400", "sla": "97.9%", "status": "FLAGGED" }
              ]
            }
            """.trimIndent()
        val pdfBytes = generator.generate(templateJson, dataJson)
        assertPdfByFile("summary/summary-page-metrics-totals.pdf", pdfBytes)
    }

    @Test
    @DisplayName("Summary: Conditional summary page rendered only when printCondition evaluates to true")
    fun testSummaryConditionalDisplay() {
        val templateJson =
            """
            {
              "version": "1.0",
              "pageSettings": {
                "size": "A4",
                "orientation": "portrait",
                "showMargins": true,
                "margins": { "top": 36, "right": 36, "bottom": 36, "left": 36 }
              },
              "pageElements": [
                {
                  "type": "text",
                  "id": "main-title",
                  "x": 0,
                  "y": 10,
                  "value": "Sales Invoice #INV-2026-089",
                  "style": { "fontSize": 16, "fontWeight": "bold", "color": "#0f172a" }
                },
                {
                  "type": "text",
                  "id": "main-body",
                  "x": 0,
                  "y": 35,
                  "value": "Standard customer invoice page. Condition 'includeSummary' activates executive appendix.",
                  "style": { "fontSize": 10, "color": "#475569" }
                }
              ],
              "summaryPage": {
                "printCondition": "includeSummary == true",
                "background": {
                  "elements": [
                    {
                      "type": "rectangle",
                      "id": "cond-bg",
                      "x": 0,
                      "y": 0,
                      "width": 523,
                      "height": 760,
                      "style": { "fillColor": "#f0fdf4", "strokeColor": "#bbf7d0", "strokeWidth": 1, "cornerRadius": 6 }
                    }
                  ]
                },
                "elements": [
                  {
                    "type": "text",
                    "id": "cond-title",
                    "x": 20,
                    "y": 20,
                    "value": "CONDITIONAL SUMMARY APPENDIX",
                    "style": { "fontSize": 14, "fontWeight": "bold", "color": "#166534" }
                  },
                  {
                    "type": "text",
                    "id": "cond-desc",
                    "x": 20,
                    "y": 50,
                    "value": "This summary page is only generated when includeSummary is explicitly true in the dataset.",
                    "style": { "fontSize": 9.5, "color": "#15803d" }
                  },
                  {
                    "type": "text",
                    "id": "cond-auth",
                    "x": 20,
                    "y": 80,
                    "value": "Authorized By: {{authorizedBy}}",
                    "style": { "fontSize": 11, "fontWeight": "bold", "color": "#0f172a" }
                  }
                ]
              }
            }
            """.trimIndent()

        val dataJson = """{"includeSummary": true, "authorizedBy": "Director of Finance"}"""
        val pdfBytes = generator.generate(templateJson, dataJson)
        assertPdfByFile("summary/summary-conditional-display.pdf", pdfBytes)
    }
}
