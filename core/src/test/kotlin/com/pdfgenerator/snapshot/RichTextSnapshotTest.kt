package com.pdfgenerator.snapshot

import com.github.adilsoncruz.pdfsnapshottesting.EnablePdfSnapshots
import com.github.adilsoncruz.pdfsnapshottesting.assertPdfByFile
import com.pdfgenerator.api.PDFGenerator
import org.junit.jupiter.api.DisplayName
import org.junit.jupiter.api.Test
import java.io.File

@EnablePdfSnapshots
class RichTextSnapshotTest {

    private val generator = PDFGenerator()

    @Test
    @DisplayName("Rich Text: Markdown formatted text with bold, italic, alignments and colors")
    fun testRichTextMarkdownFormatting() {
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
              "id": "rt-title",
              "x": 0,
              "y": 10,
              "value": "Rich Text & Inline Markdown Formatting",
              "style": { "fontSize": 16, "fontWeight": "bold", "color": "#0f172a" }
            },
            {
              "type": "text",
              "id": "rt-sub",
              "x": 0,
              "y": 35,
              "value": "Verifying RichTextElement markdown syntax parsing (**bold**, *italic*, ***bold-italic***) with flowing ColumnText.",
              "style": { "fontSize": 10, "color": "#64748b" }
            },
            {
              "type": "rich_text",
              "id": "rt-clause-1",
              "x": 0,
              "y": 65,
              "width": 523,
              "value": "Clause 1.1: The **Licensee** acknowledges that the **Open PDF Generator** software, including all related *intellectual property*, documentation, and source code, remains the exclusive property of the **Licensor**.",
              "style": {
                "fontSize": 10.5,
                "color": "#1e293b",
                "alignment": "justify"
              }
            },
            {
              "type": "rich_text",
              "id": "rt-clause-2",
              "x": 0,
              "y": 115,
              "width": 523,
              "value": "Clause 1.2: Any *unauthorized copying*, reverse engineering, or distribution without prior written consent shall constitute a ***material breach of contract*** and result in immediate termination.",
              "style": {
                "fontSize": 10.5,
                "color": "#991b1b",
                "alignment": "justify"
              }
            },
            {
              "type": "rich_text",
              "id": "rt-clause-3",
              "x": 0,
              "y": 165,
              "width": 523,
              "value": "Notice: Contact legal counsel at **legal@example.org** or visit our *compliance department* for questions regarding *cross-border licensing agreements*.",
              "style": {
                "fontSize": 9.5,
                "color": "#475569",
                "alignment": "left"
              }
            }
          ]
        }
        """.trimIndent()

        val pdfBytes = generator.generate(templateJson, "{}")
        assertPdfByFile("rich-text/rich-text-markdown-formatting.pdf", pdfBytes)
    }
}
