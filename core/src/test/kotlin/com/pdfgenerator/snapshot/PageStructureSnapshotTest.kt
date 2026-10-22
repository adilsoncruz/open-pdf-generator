package com.pdfgenerator.snapshot

import com.github.adilsoncruz.pdfsnapshottesting.EnablePdfSnapshots
import com.github.adilsoncruz.pdfsnapshottesting.assertPdfByFile
import com.pdfgenerator.api.PDFGenerator
import org.junit.jupiter.api.DisplayName
import org.junit.jupiter.api.Test

@EnablePdfSnapshots
class PageStructureSnapshotTest {

    private val generator = PDFGenerator()

    @Test
    @DisplayName("Page Structure: A4 Landscape orientation with wide tables and boundary margins")
    fun testA4LandscapeOrientation() {
        val templateJson = """
        {
          "version": "1.0",
          "pageSettings": {
            "size": "A4",
            "orientation": "landscape",
            "showMargins": true,
            "margins": { "top": 36, "right": 36, "bottom": 36, "left": 36 }
          },
          "pageElements": [
            {
              "type": "text",
              "id": "title",
              "x": 0,
              "y": 0,
              "value": "A4 Landscape Financial Dashboard (842 x 595 pt)",
              "style": { "fontSize": 18, "fontWeight": "bold", "color": "#0f172a" }
            },
            {
              "type": "text",
              "id": "sub",
              "x": 0,
              "y": 26,
              "value": "Wide layout spreadsheet testing full width grid spanning 762pt between margins.",
              "style": { "fontSize": 10, "color": "#64748b" }
            },
            {
              "type": "table",
              "id": "landscape-table",
              "x": 0,
              "y": 55,
              "width": "100%",
              "columns": [
                { "key": "dept", "header": "Department / Unit", "width": 160 },
                { "key": "q1", "header": "Q1 (USD)", "width": 100, "alignment": "right" },
                { "key": "q2", "header": "Q2 (USD)", "width": 100, "alignment": "right" },
                { "key": "q3", "header": "Q3 (USD)", "width": 100, "alignment": "right" },
                { "key": "q4", "header": "Q4 (USD)", "width": 100, "alignment": "right" },
                { "key": "total", "header": "Annual Total", "width": 102, "alignment": "right" },
                { "key": "variance", "header": "YoY %", "width": 100, "alignment": "center" }
              ],
              "dataBinding": "{{departments}}",
              "style": {
                "headerBackgroundColor": "#1e293b",
                "headerTextColor": "#ffffff",
                "headerFontSize": 9,
                "fontSize": 9,
                "cellPaddingTop": 6,
                "cellPaddingBottom": 6,
                "alternateRowColor": "#f8fafc",
                "borderColor": "#cbd5e1"
              }
            }
          ]
        }
        """.trimIndent()

        val dataJson = """
        {
          "departments": [
            { "dept": "Core Engineering", "q1": "$ 240,000", "q2": "$ 255,000", "q3": "$ 270,000", "q4": "$ 290,000", "total": "$ 1,055,000", "variance": "+12.4%" },
            { "dept": "Cloud Infrastructure", "q1": "$ 180,000", "q2": "$ 195,000", "q3": "$ 210,000", "q4": "$ 225,000", "total": "$ 810,000", "variance": "+8.1%" },
            { "dept": "Customer Operations", "q1": "$ 95,000", "q2": "$ 98,000", "q3": "$ 102,000", "q4": "$ 105,000", "total": "$ 400,000", "variance": "+4.2%" },
            { "dept": "Product & UX Design", "q1": "$ 85,000", "q2": "$ 88,000", "q3": "$ 90,000", "q4": "$ 95,000", "total": "$ 358,000", "variance": "+5.8%" }
          ]
        }
        """.trimIndent()

        val pdfBytes = generator.generate(templateJson, dataJson)
        assertPdfByFile("pages/page-a4-landscape.pdf", pdfBytes)
    }

    @Test
    @DisplayName("Page Structure: Watermarks (diagonal single & repeated matrix)")
    fun testWatermarkStyles() {
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
              "text": "STRICTLY CONFIDENTIAL",
              "fontName": "Helvetica",
              "fontSize": 48,
              "fontStyle": "bold",
              "color": "#e11d48",
              "opacity": 0.15,
              "rotation": 45,
              "onTop": false
            }
          },
          "pageElements": [
            {
              "type": "text",
              "id": "title",
              "x": 0,
              "y": 0,
              "value": "Confidential Agreement & Watermark Test",
              "style": { "fontSize": 18, "fontWeight": "bold", "color": "#0f172a" }
            },
            {
              "type": "text",
              "id": "body",
              "x": 0,
              "y": 30,
              "width": 523,
              "multiline": true,
              "value": "This document contains proprietary information rendered with a background security watermark tilted at 45 degrees. The watermark is positioned in directContentUnder so body text, vector rules, and barcodes remain crisp and legible above it.",
              "style": { "fontSize": 11, "color": "#334155", "lineHeight": 1.5 }
            },
            {
              "type": "rectangle",
              "id": "box",
              "x": 0,
              "y": 95,
              "width": "100%",
              "height": 100,
              "style": { "fillColor": "#f8fafc", "borderColor": "#cbd5e1", "borderWidth": 1.0, "cornerRadius": 6 }
            },
            {
              "type": "text",
              "id": "box-text",
              "x": 20,
              "y": 130,
              "value": "Foreground container verifying transparency and layered content order.",
              "style": { "fontSize": 11, "fontWeight": "bold", "color": "#1e293b" }
            }
          ]
        }
        """.trimIndent()

        val pdfBytes = generator.generate(templateJson, "{}")
        assertPdfByFile("pages/page-watermark-confidential.pdf", pdfBytes)
    }

    @Test
    @DisplayName("Page Structure: Multi-page flow with header, footer, page breaks and page numbers")
    fun testHeaderFooterWithPageNumbers() {
        val templateJson = """
        {
          "version": "1.0",
          "pageSettings": {
            "size": "A4",
            "orientation": "portrait",
            "showMargins": true,
            "margins": { "top": 36, "right": 36, "bottom": 36, "left": 36 },
            "header": {
              "height": 45,
              "elements": [
                {
                  "type": "text",
                  "id": "hdr-title",
                  "x": 0,
                  "y": 0,
                  "value": "ACME ENTERPRISE AUDIT REPORT",
                  "style": { "fontSize": 10, "fontWeight": "bold", "color": "#4338ca" }
                },
                {
                  "type": "text",
                  "id": "hdr-date",
                  "x": 380,
                  "y": 0,
                  "width": 140,
                  "value": "OCTOBER 2026",
                  "style": { "fontSize": 9, "color": "#64748b", "alignment": "right" }
                },
                {
                  "type": "line",
                  "id": "hdr-rule",
                  "x": 0,
                  "y": 18,
                  "width": "100%",
                  "height": 0,
                  "style": { "strokeColor": "#e2e8f0", "strokeWidth": 1.0 }
                }
              ]
            },
            "footer": {
              "height": 35,
              "elements": [
                {
                  "type": "line",
                  "id": "ftr-rule",
                  "x": 0,
                  "y": 0,
                  "width": "100%",
                  "height": 0,
                  "style": { "strokeColor": "#e2e8f0", "strokeWidth": 1.0 }
                },
                {
                  "type": "text",
                  "id": "ftr-disclaimer",
                  "x": 0,
                  "y": 10,
                  "value": "Generated by Open PDF Generator - All rights reserved",
                  "style": { "fontSize": 8.5, "color": "#94a3b8" }
                },
                {
                  "type": "text",
                  "id": "ftr-page-num",
                  "x": 420,
                  "y": 10,
                  "width": 100,
                  "value": "Page {{pageNumber}}",
                  "style": { "fontSize": 8.5, "fontWeight": "bold", "color": "#475569", "alignment": "right" }
                }
              ]
            }
          },
          "pageElements": [
            {
              "type": "text",
              "id": "page1-title",
              "x": 0,
              "y": 0,
              "value": "Executive Summary & Initial Findings",
              "style": { "fontSize": 16, "fontWeight": "bold", "color": "#0f172a" }
            },
            {
              "type": "text",
              "id": "page1-content",
              "x": 0,
              "y": 30,
              "width": 520,
              "multiline": true,
              "value": "This first page establishes standard margins and demonstrates the dynamic header and footer injection on page 1 of the multi-page document.",
              "style": { "fontSize": 10.5, "color": "#334155", "lineHeight": 1.4 }
            },
            {
              "type": "pageBreak",
              "id": "pb-1"
            },
            {
              "type": "text",
              "id": "page2-title",
              "x": 0,
              "y": 0,
              "value": "Section 2: Detailed Performance Telemetry",
              "style": { "fontSize": 16, "fontWeight": "bold", "color": "#0f172a" }
            },
            {
              "type": "text",
              "id": "page2-content",
              "x": 0,
              "y": 30,
              "width": 520,
              "multiline": true,
              "value": "Second page following an explicit pageBreak. Header and footer are seamlessly rendered with updated pageNumber={{pageNumber}}.",
              "style": { "fontSize": 10.5, "color": "#334155", "lineHeight": 1.4 }
            }
          ]
        }
        """.trimIndent()

        val pdfBytes = generator.generate(templateJson, "{}")
        assertPdfByFile("pages/page-header-footer-flow.pdf", pdfBytes)
    }
}
