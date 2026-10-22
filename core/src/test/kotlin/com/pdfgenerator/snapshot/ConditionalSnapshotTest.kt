package com.pdfgenerator.snapshot

import com.github.adilsoncruz.pdfsnapshottesting.EnablePdfSnapshots
import com.github.adilsoncruz.pdfsnapshottesting.assertPdfByFile
import com.pdfgenerator.api.PDFGenerator
import org.junit.jupiter.api.DisplayName
import org.junit.jupiter.api.Test
import java.io.File

@EnablePdfSnapshots
class ConditionalSnapshotTest {

    private val generator = PDFGenerator()

    @Test
    @DisplayName("Conditional: Conditional block rendering with truthy and falsy expressions")
    fun testConditionalElementsDisplay() {
        val templateJson = """
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
              "id": "cond-title",
              "x": 0,
              "y": 10,
              "value": "Customer Account Statement & Risk Evaluation",
              "style": { "fontSize": 16, "fontWeight": "bold", "color": "#0f172a" }
            },
            {
              "type": "text",
              "id": "cond-sub",
              "x": 0,
              "y": 35,
              "value": "Verifying ConditionalElement blocks evaluated with dynamic boolean and numerical expressions.",
              "style": { "fontSize": 10, "color": "#64748b" }
            },
            {
              "type": "conditional",
              "id": "vip-block",
              "condition": "isVip == true",
              "elements": [
                {
                  "type": "rectangle",
                  "id": "vip-card",
                  "x": 0,
                  "y": 65,
                  "width": 523,
                  "height": 50,
                  "style": { "fillColor": "#eff6ff", "strokeColor": "#93c5fd", "strokeWidth": 1.0, "cornerRadius": 6 }
                },
                {
                  "type": "text",
                  "id": "vip-badge",
                  "x": 16,
                  "y": 75,
                  "value": "PREMIUM VIP ACCOUNT ACTIVE",
                  "style": { "fontSize": 11, "fontWeight": "bold", "color": "#1d4ed8" }
                },
                {
                  "type": "text",
                  "id": "vip-desc",
                  "x": 16,
                  "y": 93,
                  "value": "Priority customer status grants access to 24/7 dedicated wealth advisory and zero wire fees.",
                  "style": { "fontSize": 8.5, "color": "#2563eb" }
                }
              ]
            },
            {
              "type": "conditional",
              "id": "high-risk-block",
              "condition": "creditScore < 600",
              "elements": [
                {
                  "type": "rectangle",
                  "id": "risk-card",
                  "x": 0,
                  "y": 125,
                  "width": 523,
                  "height": 50,
                  "style": { "fillColor": "#fef2f2", "strokeColor": "#fca5a5", "strokeWidth": 1.0, "cornerRadius": 6 }
                },
                {
                  "type": "text",
                  "id": "risk-badge",
                  "x": 16,
                  "y": 135,
                  "value": "CREDIT WARNING - ACTION REQUIRED",
                  "style": { "fontSize": 11, "fontWeight": "bold", "color": "#b91c1c" }
                }
              ]
            },
            {
              "type": "conditional",
              "id": "good-credit-block",
              "condition": "creditScore >= 600",
              "elements": [
                {
                  "type": "rectangle",
                  "id": "good-card",
                  "x": 0,
                  "y": 125,
                  "width": 523,
                  "height": 50,
                  "style": { "fillColor": "#f0fdf4", "strokeColor": "#86efac", "strokeWidth": 1.0, "cornerRadius": 6 }
                },
                {
                  "type": "text",
                  "id": "good-badge",
                  "x": 16,
                  "y": 135,
                  "value": "CREDIT RATING: EXCELLENT (Score: {{creditScore}})",
                  "style": { "fontSize": 11, "fontWeight": "bold", "color": "#15803d" }
                },
                {
                  "type": "text",
                  "id": "good-desc",
                  "x": 16,
                  "y": 153,
                  "value": "Account standing is prime. No collateral constraints applied to standard overdraft facilities.",
                  "style": { "fontSize": 8.5, "color": "#166534" }
                }
              ]
            }
          ]
        }
        """.trimIndent()

        val dataJson = """{"isVip": true, "creditScore": 780}"""
        val pdfBytes = generator.generate(templateJson, dataJson)
        assertPdfByFile("conditionals/conditional-elements-display.pdf", pdfBytes)
    }
}
