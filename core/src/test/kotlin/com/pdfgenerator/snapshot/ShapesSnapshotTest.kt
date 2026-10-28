package com.pdfgenerator.snapshot

import com.github.adilsoncruz.pdfsnapshottesting.EnablePdfSnapshots
import com.github.adilsoncruz.pdfsnapshottesting.assertPdfByFile
import com.pdfgenerator.api.PDFGenerator
import org.junit.jupiter.api.DisplayName
import org.junit.jupiter.api.Test

@EnablePdfSnapshots
class ShapesSnapshotTest {
    private val generator = PDFGenerator()

    @Test
    @DisplayName("Shapes: Rectangles with fills, borders, corner radius, dashed strokes")
    fun testRectanglesFillsBordersAndCorners() {
        val templateJson =
            """
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
                  "id": "title",
                  "x": 0,
                  "y": 0,
                  "value": "Rectangle Shapes: Fills, Borders & Rounded Corners",
                  "style": { "fontSize": 18, "fontWeight": "bold", "color": "#0f172a" }
                },
                {
                  "type": "text",
                  "id": "sub",
                  "x": 0,
                  "y": 26,
                  "value": "Visual verification of vector rectangles, fills, corner radii, and stroke styling.",
                  "style": { "fontSize": 10, "color": "#64748b" }
                },

                {
                  "type": "rectangle",
                  "id": "rect-solid",
                  "x": 0,
                  "y": 60,
                  "width": 120,
                  "height": 70,
                  "style": { "fillColor": "#4f46e5", "cornerRadius": 0, "borderWidth": 0 }
                },
                {
                  "type": "text",
                  "id": "lbl-solid",
                  "x": 10,
                  "y": 85,
                  "multiline": true,
                  "value": "Solid Fill\n(No border)",
                  "style": { "fontSize": 10, "fontWeight": "bold", "color": "#ffffff" }
                },

                {
                  "type": "rectangle",
                  "id": "rect-rounded",
                  "x": 134,
                  "y": 60,
                  "width": 120,
                  "height": 70,
                  "style": { "fillColor": "#e0e7ff", "borderColor": "#4338ca", "borderWidth": 1.5, "cornerRadius": 12 }
                },
                {
                  "type": "text",
                  "id": "lbl-rounded",
                  "x": 144,
                  "y": 85,
                  "multiline": true,
                  "value": "Rounded (r=12)\nIndigo Stroke",
                  "style": { "fontSize": 10, "fontWeight": "bold", "color": "#312e81" }
                },

                {
                  "type": "rectangle",
                  "id": "rect-pill",
                  "x": 268,
                  "y": 60,
                  "width": 120,
                  "height": 70,
                  "style": { "fillColor": "#fef3c7", "borderColor": "#d97706", "borderWidth": 2, "cornerRadius": 25 }
                },
                {
                  "type": "text",
                  "id": "lbl-pill",
                  "x": 280,
                  "y": 85,
                  "multiline": true,
                  "value": "Pill (r=25)\nAmber 2pt",
                  "style": { "fontSize": 10, "fontWeight": "bold", "color": "#78350f" }
                },

                {
                  "type": "rectangle",
                  "id": "rect-dashed",
                  "x": 402,
                  "y": 60,
                  "width": 120,
                  "height": 70,
                  "style": { "fillColor": "#f8fafc", "borderColor": "#64748b", "borderWidth": 1.5, "penStyle": "dashed", "cornerRadius": 8 }
                },
                {
                  "type": "text",
                  "id": "lbl-dashed",
                  "x": 412,
                  "y": 85,
                  "multiline": true,
                  "value": "Dashed Outline\nUpload zone",
                  "style": { "fontSize": 10, "fontWeight": "bold", "color": "#475569" }
                },

                {
                  "type": "rectangle",
                  "id": "card-container",
                  "x": 0,
                  "y": 155,
                  "width": "100%",
                  "height": 105,
                  "style": { "fillColor": "#f1f5f9", "borderColor": "#cbd5e1", "borderWidth": 1, "cornerRadius": 10 }
                },
                {
                  "type": "rectangle",
                  "id": "card-accent-bar",
                  "x": 0,
                  "y": 155,
                  "width": 8,
                  "height": 105,
                  "style": { "fillColor": "#2563eb", "cornerRadius": 0, "borderWidth": 0 }
                },
                {
                  "type": "text",
                  "id": "card-header",
                  "x": 20,
                  "y": 170,
                  "value": "System Audit Notification & Status Panel",
                  "style": { "fontSize": 12, "fontWeight": "bold", "color": "#0f172a" }
                },
                {
                  "type": "text",
                  "id": "card-desc",
                  "x": 20,
                  "y": 192,
                  "width": 480,
                  "multiline": true,
                  "value": "Composite shapes demonstrated above: nested background rectangles simulating complex modern cards with left accent markers, rounded subtle borders, and layered typography.",
                  "style": { "fontSize": 10, "color": "#475569", "lineHeight": 1.4 }
                }
              ]
            }
            """.trimIndent()

        val pdfBytes = generator.generate(templateJson, "{}")
        assertPdfByFile("shapes/shapes-rectangles.pdf", pdfBytes)
    }

    @Test
    @DisplayName("Shapes: Lines (horizontal, vertical, diagonal, dashed, dotted, line weights)")
    fun testLinesAndStrokes() {
        val templateJson =
            """
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
                  "id": "title",
                  "x": 0,
                  "y": 0,
                  "value": "Line Shapes: Orientations, Dash Patterns & Weights",
                  "style": { "fontSize": 18, "fontWeight": "bold", "color": "#0f172a" }
                },
                {
                  "type": "text",
                  "id": "sub",
                  "x": 0,
                  "y": 26,
                  "value": "Testing horizontal separators, vertical column dividers, dashed/dotted styles, and diagonals.",
                  "style": { "fontSize": 10, "color": "#64748b" }
                },

                {
                  "type": "text",
                  "id": "lbl-h1",
                  "x": 0,
                  "y": 55,
                  "value": "Hairline Solid Separator (0.5pt Slate):",
                  "style": { "fontSize": 9, "color": "#475569" }
                },
                {
                  "type": "line",
                  "id": "line-h1",
                  "x": 0,
                  "y": 72,
                  "width": "100%",
                  "height": 0,
                  "style": { "strokeColor": "#94a3b8", "strokeWidth": 0.5 }
                },

                {
                  "type": "text",
                  "id": "lbl-h2",
                  "x": 0,
                  "y": 88,
                  "value": "Dashed Rule (6pt dash, 3pt gap, 1.5pt Indigo):",
                  "style": { "fontSize": 9, "color": "#475569" }
                },
                {
                  "type": "line",
                  "id": "line-h2",
                  "x": 0,
                  "y": 105,
                  "width": "100%",
                  "height": 0,
                  "style": { "strokeColor": "#4f46e5", "strokeWidth": 1.5, "penStyle": "dashed" }
                },

                {
                  "type": "text",
                  "id": "lbl-h3",
                  "x": 0,
                  "y": 122,
                  "value": "Dotted Rule (1pt dot, 2pt gap, 2pt Rose):",
                  "style": { "fontSize": 9, "color": "#475569" }
                },
                {
                  "type": "line",
                  "id": "line-h3",
                  "x": 0,
                  "y": 139,
                  "width": "100%",
                  "height": 0,
                  "style": { "strokeColor": "#e11d48", "strokeWidth": 2.0, "penStyle": "dotted" }
                },

                {
                  "type": "text",
                  "id": "lbl-h4",
                  "x": 0,
                  "y": 156,
                  "value": "Bold Header Bar (4pt Emerald):",
                  "style": { "fontSize": 9, "color": "#475569" }
                },
                {
                  "type": "line",
                  "id": "line-h4",
                  "x": 0,
                  "y": 174,
                  "width": "100%",
                  "height": 0,
                  "style": { "strokeColor": "#059669", "strokeWidth": 4.0 }
                },

                {
                  "type": "text",
                  "id": "lbl-vert",
                  "x": 0,
                  "y": 196,
                  "value": "Vertical Dividers between column sections:",
                  "style": { "fontSize": 9, "fontWeight": "bold", "color": "#334155" }
                },
                {
                  "type": "text",
                  "id": "col-1",
                  "x": 0,
                  "y": 218,
                  "width": 155,
                  "multiline": true,
                  "value": "Column A Details\nMetric: 99.4%\nStatus: ACTIVE",
                  "style": { "fontSize": 10, "lineHeight": 1.4 }
                },
                {
                  "type": "line",
                  "id": "v-divider-1",
                  "x": 165,
                  "y": 218,
                  "width": 0,
                  "height": 55,
                  "style": { "strokeColor": "#cbd5e1", "strokeWidth": 1.0 }
                },
                {
                  "type": "text",
                  "id": "col-2",
                  "x": 178,
                  "y": 218,
                  "width": 155,
                  "multiline": true,
                  "value": "Column B Details\nLatency: 12ms\nCluster: SA-EAST-1",
                  "style": { "fontSize": 10, "lineHeight": 1.4 }
                },
                {
                  "type": "line",
                  "id": "v-divider-2",
                  "x": 344,
                  "y": 218,
                  "width": 0,
                  "height": 55,
                  "style": { "strokeColor": "#cbd5e1", "strokeWidth": 1.0, "penStyle": "dashed" }
                },
                {
                  "type": "text",
                  "id": "col-3",
                  "x": 356,
                  "y": 218,
                  "width": 155,
                  "multiline": true,
                  "value": "Column C Details\nInstances: 8 nodes\nUptime: 99.99%",
                  "style": { "fontSize": 10, "lineHeight": 1.4 }
                },

                {
                  "type": "text",
                  "id": "lbl-diag",
                  "x": 0,
                  "y": 290,
                  "value": "Diagonal Vector Lines:",
                  "style": { "fontSize": 9, "fontWeight": "bold", "color": "#334155" }
                },
                {
                  "type": "line",
                  "id": "diag-down",
                  "x": 0,
                  "y": 310,
                  "width": 240,
                  "height": 40,
                  "style": { "strokeColor": "#8b5cf6", "strokeWidth": 2.0 }
                },
                {
                  "type": "line",
                  "id": "diag-up",
                  "x": 260,
                  "y": 350,
                  "width": 240,
                  "height": -40,
                  "style": { "strokeColor": "#ec4899", "strokeWidth": 2.0, "penStyle": "dashed" }
                }
              ]
            }
            """.trimIndent()

        val pdfBytes = generator.generate(templateJson, "{}")
        assertPdfByFile("shapes/shapes-lines.pdf", pdfBytes)
    }

    @Test
    @DisplayName("Shapes: Responsive percentage widths (100%, 75%, 50%, 25%)")
    fun testPercentageDimensions() {
        val templateJson =
            """
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
                  "id": "title",
                  "x": 0,
                  "y": 0,
                  "value": "Responsive Percentage Sizing in Shapes",
                  "style": { "fontSize": 18, "fontWeight": "bold", "color": "#0f172a" }
                },
                {
                  "type": "text",
                  "id": "sub",
                  "x": 0,
                  "y": 26,
                  "value": "Evaluation of width='100%', '75%', '50%', '25%' aligned to printable margin boundaries.",
                  "style": { "fontSize": 10, "color": "#64748b" }
                },

                {
                  "type": "rectangle",
                  "id": "pct-100",
                  "x": 0,
                  "y": 60,
                  "width": "100%",
                  "height": 30,
                  "style": { "fillColor": "#3b82f6", "cornerRadius": 4 }
                },
                {
                  "type": "text",
                  "id": "lbl-100",
                  "x": 10,
                  "y": 69,
                  "value": "Width: 100% (spans exactly between left and right margins)",
                  "style": { "fontSize": 10, "fontWeight": "bold", "color": "#ffffff" }
                },

                {
                  "type": "rectangle",
                  "id": "pct-75",
                  "x": 0,
                  "y": 100,
                  "width": "75%",
                  "height": 30,
                  "style": { "fillColor": "#6366f1", "cornerRadius": 4 }
                },
                {
                  "type": "text",
                  "id": "lbl-75",
                  "x": 10,
                  "y": 109,
                  "value": "Width: 75%",
                  "style": { "fontSize": 10, "fontWeight": "bold", "color": "#ffffff" }
                },

                {
                  "type": "rectangle",
                  "id": "pct-50",
                  "x": 0,
                  "y": 140,
                  "width": "50%",
                  "height": 30,
                  "style": { "fillColor": "#8b5cf6", "cornerRadius": 4 }
                },
                {
                  "type": "text",
                  "id": "lbl-50",
                  "x": 10,
                  "y": 149,
                  "value": "Width: 50%",
                  "style": { "fontSize": 10, "fontWeight": "bold", "color": "#ffffff" }
                },

                {
                  "type": "rectangle",
                  "id": "pct-25",
                  "x": 0,
                  "y": 180,
                  "width": "25%",
                  "height": 30,
                  "style": { "fillColor": "#a855f7", "cornerRadius": 4 }
                },
                {
                  "type": "text",
                  "id": "lbl-25",
                  "x": 10,
                  "y": 189,
                  "value": "Width: 25%",
                  "style": { "fontSize": 10, "fontWeight": "bold", "color": "#ffffff" }
                },

                {
                  "type": "line",
                  "id": "line-pct-100",
                  "x": 0,
                  "y": 230,
                  "width": "100%",
                  "height": 0,
                  "style": { "strokeColor": "#0f172a", "strokeWidth": 2.0 }
                },
                {
                  "type": "text",
                  "id": "lbl-line-100",
                  "x": 0,
                  "y": 238,
                  "value": "Line with width='100%' spanning the entire printable area exactly from left margin to right margin.",
                  "style": { "fontSize": 9, "color": "#64748b" }
                }
              ]
            }
            """.trimIndent()

        val pdfBytes = generator.generate(templateJson, "{}")
        assertPdfByFile("shapes/shapes-percentages.pdf", pdfBytes)
    }
}
