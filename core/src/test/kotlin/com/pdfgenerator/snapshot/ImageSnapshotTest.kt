package com.pdfgenerator.snapshot

import com.github.adilsoncruz.pdfsnapshottesting.EnablePdfSnapshots
import com.github.adilsoncruz.pdfsnapshottesting.assertPdfByFile
import com.pdfgenerator.api.PDFGenerator
import org.junit.jupiter.api.DisplayName
import org.junit.jupiter.api.Test
import java.io.File

@EnablePdfSnapshots
class ImageSnapshotTest {

    private val generator = PDFGenerator()

    @Test
    @DisplayName("Image: Base64 embedded PNG image with dimensions and styling")
    fun testImageBase64Rendering() {
        val samplePngBase64 = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=="

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
              "id": "img-title",
              "x": 0,
              "y": 10,
              "value": "Corporate Asset Identification",
              "style": { "fontSize": 16, "fontWeight": "bold", "color": "#0f172a" }
            },
            {
              "type": "text",
              "id": "img-desc",
              "x": 0,
              "y": 35,
              "value": "Verifying raster image decoding, aspect ratio handling, and embedded data URI rendering.",
              "style": { "fontSize": 10, "color": "#64748b" }
            },
            {
              "type": "image",
              "id": "brand-logo",
              "x": 0,
              "y": 65,
              "width": 140,
              "height": 70,
              "source": "$samplePngBase64"
            },
            {
              "type": "rectangle",
              "id": "img-border-frame",
              "x": 0,
              "y": 65,
              "width": 140,
              "height": 70,
              "style": {
                "strokeColor": "#3b82f6",
                "strokeWidth": 1.5,
                "cornerRadius": 4
              }
            },
            {
              "type": "text",
              "id": "caption",
              "x": 0,
              "y": 145,
              "value": "Figure 1: High-resolution raster badge rendered inline with vector framing.",
              "style": { "fontSize": 8.5, "fontStyle": "italic", "color": "#475569" }
            }
          ]
        }
        """.trimIndent()

        val pdfBytes = generator.generate(templateJson, "{}")
        assertPdfByFile("images/image-base64-rendering.pdf", pdfBytes)
    }
}
