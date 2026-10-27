package com.pdfgenerator.engine

import com.lowagie.text.Document
import com.lowagie.text.PageSize
import com.lowagie.text.pdf.PdfWriter
import com.pdfgenerator.api.PDFGenerator
import com.pdfgenerator.api.PDFGeneratorConfig
import com.pdfgenerator.model.Margins
import com.pdfgenerator.model.PageSettings
import com.pdfgenerator.model.Template
import com.pdfgenerator.model.TextElement
import org.junit.jupiter.api.Assertions.assertFalse
import org.junit.jupiter.api.Assertions.assertTrue
import org.junit.jupiter.api.Test
import java.io.ByteArrayOutputStream

class PDFSecurityConfiguratorTest {

    @Test
    fun `test PDFSecurityConfig defaults and isConfigured`() {
        val defaultConfig = PDFSecurityConfig()
        assertFalse(defaultConfig.isConfigured)

        val userConfig = PDFSecurityConfig(userPassword = "user123")
        assertTrue(userConfig.isConfigured)

        val ownerConfig = PDFSecurityConfig(ownerPassword = "owner123")
        assertTrue(ownerConfig.isConfigured)

        val permConfig = PDFSecurityConfig(permissions = PdfWriter.ALLOW_PRINTING)
        assertTrue(permConfig.isConfigured)
    }

    @Test
    fun `test configure with null or unconfigured settings`() {
        val doc = Document(PageSize.A4)
        val output = ByteArrayOutputStream()
        val writer = PdfWriter.getInstance(doc, output)

        // null config
        val configuratorNull = PDFSecurityConfigurator(null)
        configuratorNull.configure(writer)

        // unconfigured default
        val configuratorDefault = PDFSecurityConfigurator(PDFSecurityConfig())
        configuratorDefault.configure(writer)
    }

    @Test
    fun `test configure handles encryption gracefully when BouncyCastle is absent`() {
        val userPassword = "secretUserPass"
        val ownerPassword = "secretOwnerPass"
        val config = PDFSecurityConfig(
            userPassword = userPassword,
            ownerPassword = ownerPassword,
            permissions = PdfWriter.ALLOW_PRINTING,
            encryptionType = PdfWriter.STANDARD_ENCRYPTION_128,
        )
        val configurator = PDFSecurityConfigurator(config)

        val doc = Document(PageSize.A4)
        val output = ByteArrayOutputStream()
        val writer = PdfWriter.getInstance(doc, output)

        // Should not throw NoClassDefFoundError
        configurator.configure(writer)
        doc.open()
        doc.add(com.lowagie.text.Paragraph("Document with security settings"))
        doc.close()

        val pdfBytes = output.toByteArray()
        assertTrue(pdfBytes.isNotEmpty())
    }

    @Test
    fun `test applySecurity companion method`() {
        val doc = Document(PageSize.A4)
        val output = ByteArrayOutputStream()
        val writer = PdfWriter.getInstance(doc, output)

        // Should not crash with null passwords
        PDFSecurityConfigurator.applySecurity(writer, null, null)

        // Apply with password - handles missing BouncyCastle gracefully
        PDFSecurityConfigurator.applySecurity(writer, "pass1", "pass2")
        doc.open()
        doc.add(com.lowagie.text.Paragraph("Secure"))
        doc.close()

        val pdfBytes = output.toByteArray()
        assertTrue(pdfBytes.isNotEmpty())
    }

    @Test
    fun `test PDFGenerator with custom securityConfigurator constructor`() {
        val userPassword = "generatorUserPass"
        val securityConfig = PDFSecurityConfig(
            userPassword = userPassword,
            ownerPassword = "generatorOwnerPass",
        )
        val configurator = PDFSecurityConfigurator(securityConfig)
        val generator = PDFGenerator(PDFGeneratorConfig(), configurator)

        val template = Template(
            version = "1.0",
            pageSettings = PageSettings(
                size = "A4",
                orientation = "portrait",
                margins = Margins(10f, 10f, 10f, 10f),
            ),
            pageElements = listOf(
                TextElement(
                    id = "t1",
                    x = 10f,
                    y = 10f,
                    value = "Protected Content",
                ),
            ),
        )

        val bytes = generator.generate(template, emptyMap())
        assertTrue(bytes.isNotEmpty())
    }
}
