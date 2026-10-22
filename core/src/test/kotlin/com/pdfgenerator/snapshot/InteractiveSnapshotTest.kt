package com.pdfgenerator.snapshot

import com.github.adilsoncruz.pdfsnapshottesting.EnablePdfSnapshots
import com.github.adilsoncruz.pdfsnapshottesting.assertPdfByFile
import com.pdfgenerator.api.PDFGenerator
import org.junit.jupiter.api.DisplayName
import org.junit.jupiter.api.Test
import java.io.File

@EnablePdfSnapshots
class InteractiveSnapshotTest {

    private val generator = PDFGenerator()

    @Test
    @DisplayName("Links & Spacers: Clickable hyperlinks, spacer vertical flow and static text")
    fun testLinkAndSpacerElements() {
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
              "type": "static_text",
              "id": "static-hdr",
              "x": 0,
              "y": 10,
              "value": "Enterprise Document Portal & Resources",
              "style": { "fontSize": 16, "fontWeight": "bold", "color": "#0f172a" }
            },
            {
              "type": "static_text",
              "id": "static-sub",
              "x": 0,
              "y": 35,
              "value": "Verifying LinkElement interactive anchors, SpacerElement flow adjustments, and StaticTextElement efficiency.",
              "style": { "fontSize": 10, "color": "#64748b" }
            },
            {
              "type": "rectangle",
              "id": "link-card-1",
              "x": 0,
              "y": 70,
              "width": 523,
              "height": 55,
              "style": { "fillColor": "#f8fafc", "strokeColor": "#cbd5e1", "strokeWidth": 1.0, "cornerRadius": 6 }
            },
            {
              "type": "text",
              "id": "card-1-label",
              "x": 16,
              "y": 80,
              "value": "Core Documentation & API Reference",
              "style": { "fontSize": 10.5, "fontWeight": "bold", "color": "#1e293b" }
            },
            {
              "type": "link",
              "id": "link-1",
              "x": 16,
              "y": 98,
              "width": 250,
              "height": 16,
              "value": "https://open-pdf.example.com/docs",
              "url": "https://open-pdf.example.com/docs",
              "style": { "fontSize": 9.5, "color": "#2563eb", "textDecoration": "underline" }
            },
            {
              "type": "rectangle",
              "id": "link-card-2",
              "x": 0,
              "y": 140,
              "width": 523,
              "height": 55,
              "style": { "fillColor": "#f8fafc", "strokeColor": "#cbd5e1", "strokeWidth": 1.0, "cornerRadius": 6 }
            },
            {
              "type": "text",
              "id": "card-2-label",
              "x": 16,
              "y": 150,
              "value": "GitHub Repository & Release Artifacts",
              "style": { "fontSize": 10.5, "fontWeight": "bold", "color": "#1e293b" }
            },
            {
              "type": "link",
              "id": "link-2",
              "x": 16,
              "y": 168,
              "width": 300,
              "height": 16,
              "value": "https://github.com/adilsoncruz/open-pdf-generator",
              "url": "https://github.com/adilsoncruz/open-pdf-generator",
              "style": { "fontSize": 9.5, "color": "#4338ca", "textDecoration": "underline" }
            }
          ]
        }
        """.trimIndent()

        val pdfBytes = generator.generate(templateJson, "{}")
        assertPdfByFile("links/link-and-spacer-elements.pdf", pdfBytes)
    }
}
