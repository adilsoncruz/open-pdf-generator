package com.pdfgenerator.snapshot

import com.github.adilsoncruz.pdfsnapshottesting.EnablePdfSnapshots
import com.github.adilsoncruz.pdfsnapshottesting.assertPdfByFile
import com.pdfgenerator.api.PDFGenerator
import org.junit.jupiter.api.DisplayName
import org.junit.jupiter.api.Test

@EnablePdfSnapshots
class ContainerSnapshotTest {

    private val generator = PDFGenerator()

    @Test
    @DisplayName("Container: Styled card panels with rounded borders, background fills, and relative children")
    fun testStyledCardsWithRelativeChildren() {
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
              "id": "title",
              "x": 36,
              "y": 36,
              "value": "Container Element: Card Panels & Layouts",
              "style": { "fontSize": 18, "fontWeight": "bold", "color": "#0f172a" }
            },
            {
              "type": "text",
              "id": "sub",
              "x": 36,
              "y": 62,
              "value": "Containers encapsulating backgrounds, borders, and children with relative offset coordinates.",
              "style": { "fontSize": 10, "color": "#64748b" }
            },

            {
              "type": "container",
              "id": "card-invoice-summary",
              "x": 0,
              "y": 90,
              "width": "100%",
              "height": 130,
              "style": {
                "fillColor": "#f8fafc",
                "borderColor": "#cbd5e1",
                "borderWidth": 1.0,
                "cornerRadius": 8
              },
              "elements": [
                {
                  "type": "rectangle",
                  "id": "card-header-bar",
                  "x": 0,
                  "y": 0,
                  "width": "100%",
                  "height": 32,
                  "style": {
                    "fillColor": "#e2e8f0",
                    "cornerRadius": 8
                  }
                },
                {
                  "type": "text",
                  "id": "card-header-title",
                  "x": 16,
                  "y": 9,
                  "value": "ORDER DISPATCH SUMMARY #88392",
                  "style": { "fontSize": 11, "fontWeight": "bold", "color": "#1e293b" }
                },
                {
                  "type": "text",
                  "id": "card-status-pill",
                  "x": 420,
                  "y": 6,
                  "width": 90,
                  "height": 20,
                  "value": "CONFIRMED",
                  "style": {
                    "fontSize": 9,
                    "fontWeight": "bold",
                    "color": "#065f46",
                    "backgroundColor": "#a7f3d0",
                    "alignment": "center"
                  }
                },
                {
                  "type": "text",
                  "id": "card-body-left",
                  "x": 16,
                  "y": 44,
                  "width": 240,
                  "multiline": true,
                  "value": "Customer: Acme Logistics Corp\nDelivery: Avenida Paulista 1000, SP\nEstimated Transit: 2 Business Days",
                  "style": { "fontSize": 9.5, "color": "#334155", "lineHeight": 1.4 }
                },
                {
                  "type": "line",
                  "id": "card-inner-divider",
                  "x": 265,
                  "y": 42,
                  "width": 0,
                  "height": 75,
                  "style": { "strokeColor": "#cbd5e1", "strokeWidth": 1.0, "penStyle": "dashed" }
                },
                {
                  "type": "text",
                  "id": "card-body-right",
                  "x": 280,
                  "y": 44,
                  "width": 230,
                  "multiline": true,
                  "value": "Subtotal: $ 1,450.00\nFreight: $ 45.00\nTotal Amount: $ 1,495.00",
                  "style": { "fontSize": 9.5, "fontWeight": "bold", "color": "#0f172a", "lineHeight": 1.4 }
                }
              ]
            },

            {
              "type": "container",
              "id": "card-alert-warning",
              "x": 0,
              "y": 235,
              "width": "100%",
              "height": 75,
              "style": {
                "fillColor": "#fffbeb",
                "borderColor": "#fde68a",
                "borderWidth": 1.5,
                "cornerRadius": 6
              },
              "elements": [
                {
                  "type": "rectangle",
                  "id": "alert-stripe",
                  "x": 0,
                  "y": 0,
                  "width": 6,
                  "height": "100%",
                  "style": { "fillColor": "#d97706" }
                },
                {
                  "type": "text",
                  "id": "alert-title",
                  "x": 18,
                  "y": 12,
                  "value": "Important Compliance Requirement",
                  "style": { "fontSize": 11, "fontWeight": "bold", "color": "#92400e" }
                },
                {
                  "type": "text",
                  "id": "alert-text",
                  "x": 18,
                  "y": 30,
                  "width": 490,
                  "multiline": true,
                  "value": "Physical signature and stamp required upon recipient delivery confirmation. Keep this electronic voucher for fiscal verification.",
                  "style": { "fontSize": 9, "color": "#78350f", "lineHeight": 1.3 }
                }
              ]
            }
          ]
        }
        """.trimIndent()

        val pdfBytes = generator.generate(templateJson, "{}")
        assertPdfByFile("container-styled-cards.pdf", pdfBytes)
    }

    @Test
    @DisplayName("Container: Auto-height behavior with multiline dynamic content")
    fun testContainerAutoHeight() {
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
              "id": "title",
              "x": 36,
              "y": 36,
              "value": "Container Auto-Height Adaptation",
              "style": { "fontSize": 18, "fontWeight": "bold", "color": "#0f172a" }
            },
            {
              "type": "container",
              "id": "auto-card",
              "x": 0,
              "y": 80,
              "width": "100%",
              "heightMode": "auto",
              "autoHeight": true,
              "style": {
                "fillColor": "#f1f5f9",
                "borderColor": "#cbd5e1",
                "borderWidth": 1.0,
                "cornerRadius": 8
              },
              "elements": [
                {
                  "type": "text",
                  "id": "auto-title",
                  "x": 16,
                  "y": 14,
                  "value": "Dynamic Content Expansion Box",
                  "style": { "fontSize": 12, "fontWeight": "bold", "color": "#1e293b" }
                },
                {
                  "type": "text",
                  "id": "auto-content",
                  "x": 16,
                  "y": 36,
                  "width": 490,
                  "height": 65,
                  "multiline": true,
                  "value": "Open PDF Generator dynamically computes container bounds from inner element extents. This prevents overflow defects when multiline notes or nested tables vary in length between reports.",
                  "style": { "fontSize": 10, "color": "#475569", "lineHeight": 1.4 }
                }
              ]
            }
          ]
        }
        """.trimIndent()

        val pdfBytes = generator.generate(templateJson, "{}")
        assertPdfByFile("container-auto-height.pdf", pdfBytes)
    }

    @Test
    @DisplayName("Container: Nested structures with inner badges and QR code")
    fun testNestedContainerStructure() {
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
              "id": "title",
              "x": 36,
              "y": 36,
              "value": "Nested Container Layouts",
              "style": { "fontSize": 18, "fontWeight": "bold", "color": "#0f172a" }
            },
            {
              "type": "container",
              "id": "outer-container",
              "x": 0,
              "y": 80,
              "width": "100%",
              "height": 160,
              "style": {
                "fillColor": "#ffffff",
                "borderColor": "#e2e8f0",
                "borderWidth": 2.0,
                "cornerRadius": 12
              },
              "elements": [
                {
                  "type": "text",
                  "id": "outer-title",
                  "x": 20,
                  "y": 18,
                  "value": "EVENT BADGE & ACCESS CREDENTIAL",
                  "style": { "fontSize": 12, "fontWeight": "bold", "color": "#0f172a" }
                },
                {
                  "type": "container",
                  "id": "inner-badge",
                  "x": 20,
                  "y": 45,
                  "width": 320,
                  "height": 95,
                  "style": {
                    "fillColor": "#f8fafc",
                    "borderColor": "#6366f1",
                    "borderWidth": 1.0,
                    "cornerRadius": 6
                  },
                  "elements": [
                    {
                      "type": "text",
                      "id": "attendee-name",
                      "x": 12,
                      "y": 12,
                      "value": "Adilson Cruz",
                      "style": { "fontSize": 14, "fontWeight": "bold", "color": "#1e293b" }
                    },
                    {
                      "type": "text",
                      "id": "attendee-role",
                      "x": 12,
                      "y": 32,
                      "value": "Lead Systems Architect & Maintainer",
                      "style": { "fontSize": 9.5, "color": "#64748b" }
                    },
                    {
                      "type": "text",
                      "id": "attendee-tier",
                      "x": 12,
                      "y": 60,
                      "width": 110,
                      "height": 20,
                      "value": "VIP SPEAKER",
                      "style": {
                        "fontSize": 9,
                        "fontWeight": "bold",
                        "color": "#ffffff",
                        "backgroundColor": "#4f46e5",
                        "alignment": "center"
                      }
                    }
                  ]
                },
                {
                  "type": "barcode",
                  "id": "inner-qr",
                  "x": 380,
                  "y": 45,
                  "width": 95,
                  "height": 95,
                  "barcodeType": "qrcode",
                  "value": "TICKET:ACRUZ-2026-VIP"
                }
              ]
            }
          ]
        }
        """.trimIndent()

        val pdfBytes = generator.generate(templateJson, "{}")
        assertPdfByFile("container-nested-layout.pdf", pdfBytes)
    }
}
