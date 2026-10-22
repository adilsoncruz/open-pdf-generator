package com.pdfgenerator.snapshot

import com.github.adilsoncruz.pdfsnapshottesting.EnablePdfSnapshots
import com.github.adilsoncruz.pdfsnapshottesting.assertPdfByFile
import com.pdfgenerator.api.PDFGenerator
import org.junit.jupiter.api.DisplayName
import org.junit.jupiter.api.Test
import java.io.File

@EnablePdfSnapshots
class ElementGroupSnapshotTest {

    private val generator = PDFGenerator()

    @Test
    @DisplayName("Groups: Element groups collective conditional visibility")
    fun testElementGroupsVisibility() {
        val templateJson = """
        {
          "version": "1.0",
          "pageSettings": {
            "size": "A4",
            "orientation": "portrait",
            "showMargins": true,
            "margins": { "top": 36, "right": 36, "bottom": 36, "left": 36 }
          },
          "groups": [
            {
              "id": "confidential-group",
              "name": "Confidential Security Classification",
              "elementIds": ["sec-card", "sec-badge", "sec-notice"],
              "printCondition": "clearanceLevel >= 3"
            }
          ],
          "pageElements": [
            {
              "type": "text",
              "id": "grp-title",
              "x": 0,
              "y": 10,
              "value": "Security Dossier & Classification Clearance",
              "style": { "fontSize": 16, "fontWeight": "bold", "color": "#0f172a" }
            },
            {
              "type": "text",
              "id": "grp-sub",
              "x": 0,
              "y": 35,
              "value": "Verifying ElementGroup collective conditional rendering linked across multiple distinct element IDs.",
              "style": { "fontSize": 10, "color": "#64748b" }
            },
            {
              "type": "rectangle",
              "id": "sec-card",
              "x": 0,
              "y": 70,
              "width": 523,
              "height": 65,
              "style": { "fillColor": "#fef2f2", "strokeColor": "#f87171", "strokeWidth": 1.0, "cornerRadius": 6 }
            },
            {
              "type": "text",
              "id": "sec-badge",
              "x": 16,
              "y": 82,
              "value": "TOP SECRET // LEVEL 3 CLEARANCE GRANTED",
              "style": { "fontSize": 11, "fontWeight": "bold", "color": "#b91c1c" }
            },
            {
              "type": "text",
              "id": "sec-notice",
              "x": 16,
              "y": 102,
              "value": "All members of group 'confidential-group' are visibly rendered simultaneously via clearanceLevel >= 3.",
              "style": { "fontSize": 8.5, "color": "#991b1b" }
            }
          ]
        }
        """.trimIndent()

        val dataJson = """{"clearanceLevel": 4}"""
        val pdfBytes = generator.generate(templateJson, dataJson)
        assertPdfByFile("groups/element-groups-visibility.pdf", pdfBytes)
    }
}
