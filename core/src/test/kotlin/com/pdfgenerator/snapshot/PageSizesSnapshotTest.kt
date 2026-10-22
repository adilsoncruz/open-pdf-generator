package com.pdfgenerator.snapshot

import com.github.adilsoncruz.pdfsnapshottesting.EnablePdfSnapshots
import com.github.adilsoncruz.pdfsnapshottesting.assertPdfByFile
import com.pdfgenerator.api.PDFGenerator
import org.junit.jupiter.api.DisplayName
import org.junit.jupiter.api.Test
import java.io.File

@EnablePdfSnapshots
class PageSizesSnapshotTest {

    private val generator = PDFGenerator()

    @Test
    @DisplayName("Page Structure: Letter format and custom dimensions")
    fun testPageLetterAndCustomSize() {
        val templateJson = """
        {
          "version": "1.0",
          "pageSettings": {
            "size": "LETTER",
            "orientation": "portrait",
            "showMargins": true,
            "margins": { "top": 36, "right": 36, "bottom": 36, "left": 36 }
          },
          "pageElements": [
            {
              "type": "text",
              "id": "letter-title",
              "x": 0,
              "y": 10,
              "value": "US Letter Page Format (8.5 x 11 inches / 612 x 792 pt)",
              "style": { "fontSize": 15, "fontWeight": "bold", "color": "#0f172a" }
            },
            {
              "type": "text",
              "id": "letter-desc",
              "x": 0,
              "y": 35,
              "width": 540,
              "multiline": true,
              "value": "Verifying standard North American Letter format layout geometry. Visible page guidelines illustrate margin boundaries and container width relative to A4.",
              "style": { "fontSize": 10, "color": "#334155", "lineHeight": 1.4 }
            },
            {
              "type": "rectangle",
              "id": "letter-card",
              "x": 0,
              "y": 80,
              "width": 540,
              "height": 100,
              "style": {
                "fillColor": "#f1f5f9",
                "strokeColor": "#94a3b8",
                "strokeWidth": 1.0,
                "cornerRadius": 6
              }
            },
            {
              "type": "text",
              "id": "card-inner",
              "x": 20,
              "y": 100,
              "value": "Standard Letter Printable Width: 540pt (612pt - 2x36pt margins)",
              "style": { "fontSize": 11, "fontWeight": "bold", "color": "#1e293b" }
            },
            {
              "type": "text",
              "id": "card-dim",
              "x": 20,
              "y": 125,
              "value": "Dimensions: 612.0 x 792.0 points | Portrait Orientation",
              "style": { "fontSize": 9.5, "color": "#475569" }
            }
          ]
        }
        """.trimIndent()

        val pdfBytes = generator.generate(templateJson, "{}")
        assertPdfByFile("pages/page-letter-and-legal.pdf", pdfBytes)
    }
}
