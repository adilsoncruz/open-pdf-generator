package com.pdfgenerator.engine

import com.lowagie.text.PageSize
import com.pdfgenerator.api.PDFGeneratorConfig
import com.pdfgenerator.model.BodyBackground
import com.pdfgenerator.model.CustomSize
import com.pdfgenerator.model.HeaderFooter
import com.pdfgenerator.model.Margins
import com.pdfgenerator.model.PageSettings
import com.pdfgenerator.model.Template
import com.pdfgenerator.model.WatermarkConfig
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Assertions.assertNotNull
import org.junit.jupiter.api.Assertions.assertThrows
import org.junit.jupiter.api.Assertions.assertTrue
import org.junit.jupiter.api.Test
import java.io.ByteArrayOutputStream

class DocumentFactoryTest {

    @Test
    fun `test createDocument with margins`() {
        val margins = Margins(top = 10f, right = 20f, bottom = 30f, left = 40f)
        val doc = DocumentFactory.createDocument(PageSize.A4, margins, 15f, 35f)
        assertEquals(PageSize.A4.width, doc.pageSize.width)
        assertEquals(PageSize.A4.height, doc.pageSize.height)
        assertEquals(40f, doc.leftMargin())
        assertEquals(20f, doc.rightMargin())
        assertEquals(15f, doc.topMargin())
        assertEquals(35f, doc.bottomMargin())
    }

    @Test
    fun `test resolvePageSize standard and custom sizes`() {
        val a4 = DocumentFactory.resolvePageSize("A4", "portrait")
        assertEquals(PageSize.A4.width, a4.width)
        assertEquals(PageSize.A4.height, a4.height)

        val a4Landscape = DocumentFactory.resolvePageSize("A4", "landscape")
        assertEquals(PageSize.A4.height, a4Landscape.width)
        assertEquals(PageSize.A4.width, a4Landscape.height)

        val a3 = DocumentFactory.resolvePageSize("a3", "portrait")
        assertEquals(PageSize.A3.width, a3.width)

        val a5 = DocumentFactory.resolvePageSize("a5", "portrait")
        assertEquals(PageSize.A5.width, a5.width)

        val letter = DocumentFactory.resolvePageSize("LETTER", "portrait")
        assertEquals(PageSize.LETTER.width, letter.width)

        val legal = DocumentFactory.resolvePageSize("legal", "portrait")
        assertEquals(PageSize.LEGAL.width, legal.width)

        val custom = DocumentFactory.resolvePageSize("custom", "portrait", CustomSize(300f, 600f))
        assertEquals(300f, custom.width)
        assertEquals(600f, custom.height)

        assertThrows(IllegalArgumentException::class.java) {
            DocumentFactory.resolvePageSize("custom", "portrait", null)
        }
        assertThrows(IllegalArgumentException::class.java) {
            DocumentFactory.resolvePageSize("invalid_size", "portrait")
        }
        assertThrows(IllegalArgumentException::class.java) {
            DocumentFactory.resolvePageSize("a4", "invalid_orientation")
        }
    }

    @Test
    fun `test resolvePageSize with PageSettings`() {
        val settings = PageSettings(
            size = "A4",
            orientation = "portrait",
            margins = Margins(10f, 10f, 10f, 10f),
        )
        val rect = DocumentFactory.resolvePageSize(settings)
        assertEquals(PageSize.A4.width, rect.width)
    }

    @Test
    fun `test calculateHeaderFooterHeights`() {
        val template = Template(
            version = "1.0",
            pageSettings = PageSettings(
                size = "A4",
                orientation = "portrait",
                margins = Margins(10f, 10f, 10f, 10f),
                header = HeaderFooter(height = 50f, printCondition = "showHeader == true"),
                footer = HeaderFooter(height = 30f, printCondition = "showFooter == true"),
            ),
        )

        // Conditions met
        val (h1, f1) = DocumentFactory.calculateHeaderFooterHeights(
            template,
            mapOf("showHeader" to true, "showFooter" to true),
        )
        assertEquals(50f, h1)
        assertEquals(30f, f1)

        // Conditions false
        val (h2, f2) = DocumentFactory.calculateHeaderFooterHeights(
            template,
            mapOf("showHeader" to false, "showFooter" to false),
        )
        assertEquals(0f, h2)
        assertEquals(0f, f2)

        // No header/footer
        val emptyTemplate = Template(
            version = "1.0",
            pageSettings = PageSettings(
                size = "A4",
                orientation = "portrait",
                margins = Margins(10f, 10f, 10f, 10f),
            ),
        )
        val (h3, f3) = DocumentFactory.calculateHeaderFooterHeights(emptyTemplate, emptyMap())
        assertEquals(0f, h3)
        assertEquals(0f, f3)
    }

    @Test
    fun `test createSession and finalizeBaseLayer and close`() {
        val template = Template(
            version = "1.0",
            pageSettings = PageSettings(
                size = "A4",
                orientation = "portrait",
                margins = Margins(10f, 10f, 10f, 10f),
                header = HeaderFooter(height = 40f),
                watermark = WatermarkConfig(text = "DRAFT"),
                bodyBackground = BodyBackground(),
            ),
        )

        val output = ByteArrayOutputStream()
        val config = PDFGeneratorConfig()
        val session = DocumentFactory.createSession(
            template = template,
            data = mapOf("name" to "Test"),
            output = output,
            config = config,
            securityConfigurator = PDFSecurityConfigurator(),
        )

        assertNotNull(session.context)
        assertEquals(template, session.context.template)
        assertTrue(session.layout.document.isOpen)

        session.finalizeBaseLayer()
        session.close()

        assertTrue(!session.layout.document.isOpen)
        assertTrue(output.size() > 0)
    }
}
