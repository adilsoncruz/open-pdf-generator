package com.pdfgenerator.snapshot

import com.github.adilsoncruz.pdfsnapshottesting.EnablePdfSnapshots
import com.github.adilsoncruz.pdfsnapshottesting.assertPdfByFile
import com.pdfgenerator.api.PDFGenerator
import org.junit.jupiter.api.DisplayName
import org.junit.jupiter.api.Test

@EnablePdfSnapshots
class TableSnapshotTest {
    private val generator = PDFGenerator()

    @Test
    @DisplayName("Table: Column alignments (left, center, right) and data formats (currency, date, number, text)")
    fun testTableColumnAlignmentsAndFormats() {
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
                  "id": "tbl-title",
                  "x": 0,
                  "y": 0,
                  "value": "Table Column Alignments & Formats",
                  "style": { "fontSize": 16, "fontWeight": "bold", "color": "#0f172a" }
                },
                {
                  "type": "table",
                  "id": "align-format-table",
                  "x": 0,
                  "y": 30,
                  "dataBinding": "records",
                  "columns": [
                    { "header": "Transaction ID", "field": "txId", "width": 110, "alignment": "left" },
                    { "header": "Status", "field": "status", "width": 80, "alignment": "center" },
                    { "header": "Date", "field": "date", "width": 90, "alignment": "center", "format": "date" },
                    { "header": "Units", "field": "units", "width": 70, "alignment": "right", "format": "number" },
                    { "header": "Gross Total", "field": "amount", "width": 100, "alignment": "right", "format": "currency" }
                  ],
                  "style": {
                    "headerBackground": "#1e293b",
                    "headerTextColor": "#ffffff",
                    "borderColor": "#cbd5e1",
                    "borderWidth": 0.5,
                    "fontSize": 9,
                    "padding": 5
                  }
                }
              ]
            }
            """.trimIndent()

        val dataJson =
            """
            {
              "records": [
                { "txId": "TXN-90210-A", "status": "COMPLETED", "date": "2026-10-22", "units": 1500, "amount": 4500.50 },
                { "txId": "TXN-90211-B", "status": "PENDING", "date": "2026-10-21", "units": 320, "amount": 960.00 },
                { "txId": "TXN-90212-C", "status": "COMPLETED", "date": "2026-10-20", "units": 2840, "amount": 8520.75 },
                { "txId": "TXN-90213-D", "status": "REFUNDED", "date": "2026-10-19", "units": 50, "amount": 150.25 }
              ]
            }
            """.trimIndent()

        val pdfBytes = generator.generate(templateJson, dataJson)
        assertPdfByFile("tables/table-column-alignments-formats.pdf", pdfBytes)
    }

    @Test
    @DisplayName("Table: Header styling (brand indigo background, custom font size, padding)")
    fun testTableHeaderStylesAndColors() {
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
                  "id": "header-style-title",
                  "x": 0,
                  "y": 0,
                  "value": "Enterprise Styled Header Table",
                  "style": { "fontSize": 16, "fontWeight": "bold", "color": "#0f172a" }
                },
                {
                  "type": "table",
                  "id": "styled-header-table",
                  "x": 0,
                  "y": 30,
                  "dataBinding": "tiers",
                  "columns": [
                    { "header": "Plan Name", "field": "name", "width": 140 },
                    { "header": "Monthly Concurrency", "field": "throughput", "width": 140, "alignment": "center" },
                    { "header": "Support SLA", "field": "sla", "width": 100, "alignment": "center" },
                    { "header": "Price", "field": "price", "width": 90, "alignment": "right" }
                  ],
                  "style": {
                    "headerBackground": "#4f46e5",
                    "headerTextColor": "#ffffff",
                    "headerFontSize": 11,
                    "headerFontWeight": "bold",
                    "headerPadding": 8,
                    "borderColor": "#c7d2fe",
                    "borderWidth": 1.0,
                    "fontSize": 9.5,
                    "padding": 6
                  }
                }
              ]
            }
            """.trimIndent()

        val dataJson =
            """
            {
              "tiers": [
                { "name": "Standard Core Engine", "throughput": "10,000 docs/day", "sla": "99.9%", "price": "$149/mo" },
                { "name": "Dedicated Cluster Pro", "throughput": "250,000 docs/day", "sla": "99.95%", "price": "$499/mo" },
                { "name": "Enterprise Unlimited", "throughput": "Uncapped (Lock-Free)", "sla": "99.99%", "price": "Custom" }
              ]
            }
            """.trimIndent()

        val pdfBytes = generator.generate(templateJson, dataJson)
        assertPdfByFile("tables/table-header-styles-colors.pdf", pdfBytes)
    }

    @Test
    @DisplayName("Table: Border variations (subtle borders vs clean borderless style)")
    fun testTableBordersAndPadding() {
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
                  "id": "title-subtle",
                  "x": 0,
                  "y": 0,
                  "value": "1. Subtle Modern Border Style (0.25pt)",
                  "style": { "fontSize": 13, "fontWeight": "bold", "color": "#1e293b" }
                },
                {
                  "type": "table",
                  "id": "subtle-border-table",
                  "x": 0,
                  "y": 24,
                  "dataBinding": "items",
                  "columns": [
                    { "header": "Service Description", "field": "desc", "width": 300 },
                    { "header": "Quantity", "field": "qty", "width": 80, "alignment": "center" },
                    { "header": "Total", "field": "total", "width": 100, "alignment": "right" }
                  ],
                  "style": {
                    "headerBackground": "#f8fafc",
                    "headerTextColor": "#475569",
                    "borderColor": "#e2e8f0",
                    "borderWidth": 0.25,
                    "fontSize": 9,
                    "padding": 6
                  }
                },
                {
                  "type": "text",
                  "id": "title-borderless",
                  "x": 0,
                  "y": 140,
                  "value": "2. Clean Borderless Table Style (0pt border)",
                  "style": { "fontSize": 13, "fontWeight": "bold", "color": "#1e293b" }
                },
                {
                  "type": "table",
                  "id": "borderless-table",
                  "x": 0,
                  "y": 165,
                  "dataBinding": "items",
                  "columns": [
                    { "header": "Service Description", "field": "desc", "width": 300 },
                    { "header": "Quantity", "field": "qty", "width": 80, "alignment": "center" },
                    { "header": "Total", "field": "total", "width": 100, "alignment": "right" }
                  ],
                  "style": {
                    "headerBackground": "#ffffff",
                    "headerTextColor": "#64748b",
                    "borderColor": "#ffffff",
                    "borderWidth": 0,
                    "fontSize": 9,
                    "padding": 5
                  }
                }
              ]
            }
            """.trimIndent()

        val dataJson =
            """
            {
              "items": [
                { "desc": "High-Throughput PDF Generation Worker Instance", "qty": "1", "total": "$250.00" },
                { "desc": "Custom TrueType / OpenType Font Rendering License", "qty": "1", "total": "$95.00" },
                { "desc": "Microservices Cloud Run Autoscaling Adapter", "qty": "2", "total": "$180.00" }
              ]
            }
            """.trimIndent()

        val pdfBytes = generator.generate(templateJson, dataJson)
        assertPdfByFile("tables/table-borders-padding.pdf", pdfBytes)
    }

    @Test
    @DisplayName("Table: Multi-page document autoflow with repeated table headers")
    fun testTableMultiPageAutoflow() {
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
                  "id": "flow-title",
                  "x": 0,
                  "y": 0,
                  "value": "Multi-Page Continuous Table Stream",
                  "style": { "fontSize": 15, "fontWeight": "bold", "color": "#0f172a" }
                },
                {
                  "type": "table",
                  "id": "flow-table",
                  "x": 0,
                  "y": 28,
                  "dataBinding": "logs",
                  "paginated": true,
                  "columns": [
                    { "header": "Seq #", "field": "id", "width": 50, "alignment": "center" },
                    { "header": "Timestamp", "field": "time", "width": 110 },
                    { "header": "Audit Log Event Message", "field": "message", "width": 240 },
                    { "header": "Latency", "field": "latency", "width": 80, "alignment": "right" }
                  ],
                  "style": {
                    "headerBackground": "#0f172a",
                    "headerTextColor": "#ffffff",
                    "borderColor": "#cbd5e1",
                    "borderWidth": 0.5,
                    "fontSize": 8.5,
                    "padding": 4
                  }
                }
              ]
            }
            """.trimIndent()

        // 45 rows to guarantee clean two-page autoflow
        val rows =
            (1..45).map { idx ->
                mapOf(
                    "id" to idx.toString(),
                    "time" to "2026-10-22 10:${String.format("%02d", idx % 60)}:00",
                    "message" to "Generated transaction receipt doc #$idx for user payload",
                    "latency" to "${(idx * 7) % 25 + 5} ms",
                )
            }
        val dataJson = com.google.gson.Gson().toJson(mapOf("logs" to rows))

        val pdfBytes = generator.generate(templateJson, dataJson)
        assertPdfByFile("tables/table-multipage-autoflow.pdf", pdfBytes)
    }
}
