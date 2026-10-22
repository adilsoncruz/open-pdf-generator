package com.pdfgenerator.snapshot

import com.github.adilsoncruz.pdfsnapshottesting.EnablePdfSnapshots
import com.github.adilsoncruz.pdfsnapshottesting.assertPdfByFile
import com.pdfgenerator.api.PDFGenerator
import org.junit.jupiter.api.DisplayName
import org.junit.jupiter.api.Test
import java.io.File

@EnablePdfSnapshots
class LoopSnapshotTest {

    private val generator = PDFGenerator()

    @Test
    @DisplayName("Loop: Dynamic list repetition with card templates, itemSpacing and data binding")
    fun testLoopListItemsSpacing() {
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
              "id": "loop-title",
              "x": 0,
              "y": 10,
              "value": "Project Milestones & Task Deliverables",
              "style": { "fontSize": 16, "fontWeight": "bold", "color": "#0f172a" }
            },
            {
              "type": "text",
              "id": "loop-sub",
              "x": 0,
              "y": 35,
              "value": "Verifying loop repetition engine with card layouts, itemSpacing, and nested data interpolation.",
              "style": { "fontSize": 10, "color": "#64748b" }
            },
            {
              "type": "loop",
              "id": "milestone-loop",
              "x": 0,
              "y": 65,
              "dataBinding": "milestones",
              "direction": "vertical",
              "itemHeight": 55,
              "itemSpacing": 10,
              "elements": [
                {
                  "type": "rectangle",
                  "id": "card-bg",
                  "x": 0,
                  "y": 0,
                  "width": 523,
                  "height": 55,
                  "style": { "fillColor": "#f8fafc", "strokeColor": "#e2e8f0", "strokeWidth": 1.0, "cornerRadius": 6 }
                },
                {
                  "type": "rectangle",
                  "id": "status-bar",
                  "x": 0,
                  "y": 0,
                  "width": 5,
                  "height": 55,
                  "style": { "fillColor": "#4f46e5" }
                },
                {
                  "type": "text",
                  "id": "card-title",
                  "x": 18,
                  "y": 10,
                  "dataBinding": "item.title",
                  "style": { "fontSize": 11, "fontWeight": "bold", "color": "#1e293b" }
                },
                {
                  "type": "text",
                  "id": "card-owner",
                  "x": 18,
                  "y": 30,
                  "dataBinding": "item.owner",
                  "style": { "fontSize": 8.5, "color": "#64748b" }
                },
                {
                  "type": "text",
                  "id": "card-status",
                  "x": 380,
                  "y": 10,
                  "width": 125,
                  "dataBinding": "item.status",
                  "style": { "fontSize": 9.5, "fontWeight": "bold", "color": "#059669", "alignment": "right" }
                },
                {
                  "type": "text",
                  "id": "card-due",
                  "x": 380,
                  "y": 30,
                  "width": 125,
                  "dataBinding": "item.dueDate",
                  "style": { "fontSize": 8.5, "color": "#64748b", "alignment": "right" }
                }
              ]
            }
          ]
        }
        """.trimIndent()

        val dataJson = """
        {
          "milestones": [
            { "title": "Phase 1: Architecture Sign-Off", "owner": "Adilson Cruz", "status": "COMPLETED", "dueDate": "2026-03-15" },
            { "title": "Phase 2: Core Engine Optimization", "owner": "Core Engineering Team", "status": "COMPLETED", "dueDate": "2026-06-30" },
            { "title": "Phase 3: Electron Desktop Studio", "owner": "UI/UX Frontline", "status": "IN PROGRESS", "dueDate": "2026-09-15" },
            { "title": "Phase 4: Multi-Layer Snapshot Test Coverage", "owner": "QA Automation Guild", "status": "ACTIVE", "dueDate": "2026-10-31" }
          ]
        }
        """.trimIndent()

        val pdfBytes = generator.generate(templateJson, dataJson)
        assertPdfByFile("loops/loop-list-items-spacing.pdf", pdfBytes)
    }
}
