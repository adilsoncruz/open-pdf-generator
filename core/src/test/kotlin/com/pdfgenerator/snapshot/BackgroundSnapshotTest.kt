package com.pdfgenerator.snapshot

import com.github.adilsoncruz.pdfsnapshottesting.EnablePdfSnapshots
import com.github.adilsoncruz.pdfsnapshottesting.assertPdfByFile
import com.pdfgenerator.api.PDFGenerator
import org.junit.jupiter.api.DisplayName
import org.junit.jupiter.api.Test

@EnablePdfSnapshots
class BackgroundSnapshotTest {

    private val generator = PDFGenerator()

    @Test
    @DisplayName("Background: Full body decorative background with container frame, watermark-style motifs and filled underlays")
    fun testBodyBackgroundFrameCard() {
        val templateJson = """
        {
          "version": "1.0",
          "pageSettings": {
            "size": "A4",
            "orientation": "portrait",
            "showMargins": true,
            "margins": { "top": 36, "right": 36, "bottom": 36, "left": 36 },
            "bodyBackground": {
              "elements": [
                {
                  "type": "rectangle",
                  "id": "bg-outer-card",
                  "x": 0,
                  "y": 0,
                  "width": 523,
                  "height": 770,
                  "style": {
                    "fillColor": "#fafafa",
                    "strokeColor": "#e2e8f0",
                    "strokeWidth": 1.5,
                    "cornerRadius": 8
                  }
                },
                {
                  "type": "rectangle",
                  "id": "bg-left-stripe",
                  "x": 0,
                  "y": 0,
                  "width": 6,
                  "height": 770,
                  "style": {
                    "fillColor": "#4f46e5"
                  }
                },
                {
                  "type": "rectangle",
                  "id": "bg-top-accent",
                  "x": 16,
                  "y": 16,
                  "width": 491,
                  "height": 65,
                  "style": {
                    "fillColor": "#eef2ff",
                    "strokeColor": "#c7d2fe",
                    "strokeWidth": 1,
                    "cornerRadius": 6
                  }
                }
              ]
            }
          },
          "pageElements": [
            {
              "type": "text",
              "id": "content-title",
              "x": 30,
              "y": 30,
              "value": "Enterprise Security Certificate & Clearance",
              "style": { "fontSize": 15, "fontWeight": "bold", "color": "#312e81" }
            },
            {
              "type": "text",
              "id": "content-sub",
              "x": 30,
              "y": 52,
              "value": "Background elements act as persistent canvas underlays behind body flow.",
              "style": { "fontSize": 9, "color": "#4338ca" }
            },
            {
              "type": "text",
              "id": "sec-title",
              "x": 30,
              "y": 105,
              "value": "1. Clearance Details",
              "style": { "fontSize": 12, "fontWeight": "bold", "color": "#0f172a" }
            },
            {
              "type": "text",
              "id": "p-1",
              "x": 30,
              "y": 125,
              "width": 460,
              "multiline": true,
              "value": "The bodyBackground configuration in pageSettings renders its visual shapes to the underContent layer on each page prior to normal flow elements. This creates seamless certificate frames, accent borders, or watermarked canvas geometry without displacing layout flow coordinates.",
              "style": { "fontSize": 10, "color": "#334155", "lineHeight": 1.45 }
            },
            {
              "type": "table",
              "id": "details-tbl",
              "x": 30,
              "y": 195,
              "width": 460,
              "dataBinding": "attributes",
              "columns": [
                { "header": "Security Attribute", "field": "field", "width": 160, "alignment": "left" },
                { "header": "Assigned Parameter", "field": "val", "width": 200, "alignment": "left" },
                { "header": "Verification", "field": "status", "width": 100, "alignment": "center" }
              ],
              "style": {
                "headerBackground": "#1e1b4b",
                "headerTextColor": "#ffffff",
                "headerFontSize": 9,
                "rowFontSize": 8.5,
                "borderColor": "#cbd5e1",
                "borderWidth": 0.5,
                "padding": 5
              }
            }
          ]
        }
        """.trimIndent()

        val dataJson = """
        {
          "attributes": [
            { "field": "Protocol Version", "val": "TLS 1.3 / FIPS-140-3", "status": "VERIFIED" },
            { "field": "Issuer Organization", "val": "Global Cyber Trust Authority", "status": "VERIFIED" },
            { "field": "Signature Algorithm", "val": "ECDSA SHA-384", "status": "ACTIVE" }
          ]
        }
        """.trimIndent()
        val pdfBytes = generator.generate(templateJson, dataJson)
        assertPdfByFile("backgrounds/body-background-frame-card.pdf", pdfBytes)
    }

    @Test
    @DisplayName("Background: Conditional body background active on selected pages or condition")
    fun testBodyBackgroundConditional() {
        val templateJson = """
        {
          "version": "1.0",
          "pageSettings": {
            "size": "A4",
            "orientation": "portrait",
            "showMargins": true,
            "margins": { "top": 36, "right": 36, "bottom": 36, "left": 36 },
            "bodyBackground": {
              "printCondition": "applySpecialTheme == true",
              "elements": [
                {
                  "type": "rectangle",
                  "id": "cond-bg-rect",
                  "x": 0,
                  "y": 0,
                  "width": 523,
                  "height": 770,
                  "style": {
                    "fillColor": "#fffbeb",
                    "strokeColor": "#fde68a",
                    "strokeWidth": 1.5,
                    "cornerRadius": 6
                  }
                },
                {
                  "type": "rectangle",
                  "id": "cond-bg-stripe",
                  "x": 0,
                  "y": 0,
                  "width": 523,
                  "height": 8,
                  "style": { "fillColor": "#f59e0b" }
                }
              ]
            }
          },
          "pageElements": [
            {
              "type": "text",
              "id": "alert-title",
              "x": 20,
              "y": 25,
              "value": "Urgent Operational Notice",
              "style": { "fontSize": 16, "fontWeight": "bold", "color": "#78350f" }
            },
            {
              "type": "text",
              "id": "alert-body",
              "x": 20,
              "y": 55,
              "width": 480,
              "multiline": true,
              "value": "The warning amber background underlay is conditionally enabled when applySpecialTheme evaluates to true.",
              "style": { "fontSize": 10.5, "color": "#92400e", "lineHeight": 1.4 }
            }
          ]
        }
        """.trimIndent()

        val dataJson = """{"applySpecialTheme": true}"""
        val pdfBytes = generator.generate(templateJson, dataJson)
        assertPdfByFile("backgrounds/body-background-conditional.pdf", pdfBytes)
    }
}
