package io.pdfgenerator.cli.converter.jasper

import com.pdfgenerator.model.ImageElement
import com.pdfgenerator.model.LineElement
import com.pdfgenerator.model.StaticTextElement
import com.pdfgenerator.model.TextElement
import kotlin.test.Test
import kotlin.test.assertEquals
import kotlin.test.assertIs
import kotlin.test.assertNull

class JasperTemplateConverterTest {
    @Test
    fun `should convert basic jrxml to template`() {
        val jrxml =
            """
            <jasperReport name="invoice" pageWidth="595" pageHeight="842" topMargin="10" leftMargin="15" rightMargin="15" bottomMargin="10">
              <title>
                <band height="40">
                  <staticText>
                    <reportElement x="10" y="5" width="200" height="20" key="title-1"/>
                    <textElement textAlignment="Center">
                      <font fontName="Helvetica" size="16" isBold="true"/>
                    </textElement>
                    <text><![CDATA[Invoice]]></text>
                  </staticText>
                </band>
              </title>
              <detail>
                <band height="60">
                  <textField>
                    <reportElement x="10" y="10" width="180" height="16" key="customer-name"/>
                    <textFieldExpression><![CDATA[$F{customer.name}]]></textFieldExpression>
                  </textField>
                  <line>
                    <reportElement x="10" y="35" width="300" height="0" key="line-1"/>
                  </line>
                  <image>
                    <reportElement x="350" y="5" width="120" height="40" key="logo"/>
                    <imageExpression><![CDATA[$P{logoPath}]]></imageExpression>
                  </image>
                </band>
              </detail>
            </jasperReport>
            """.trimIndent()

        val template = JasperTemplateConverter.fromString(jrxml, JasperConversionOptions(author = "migration-bot"))

        assertEquals("invoice", template.metadata.name)
        assertEquals("migration-bot", template.metadata.author)
        assertEquals("CUSTOM", template.pageSettings.size)
        assertEquals(4, template.pageElements.size)

        val title = assertIs<StaticTextElement>(template.pageElements[0])
        assertEquals("Invoice", title.value)
        assertEquals("bold", title.style?.fontWeight)

        val text = assertIs<TextElement>(template.pageElements[1])
        assertEquals("customer.name", text.dataBinding)
        assertNull(text.value)
        assertEquals(50f, text.y)

        val line = assertIs<LineElement>(template.pageElements[2])
        assertEquals(300f, line.width)

        val image = assertIs<ImageElement>(template.pageElements[3])
        assertEquals("logoPath", image.dataBinding)
    }
}
