package io.pdfgenerator.cli.converter.jasper

import com.pdfgenerator.model.BarcodeElement
import com.pdfgenerator.model.ContainerElement
import com.pdfgenerator.model.LineElement
import com.pdfgenerator.model.RectangleElement
import com.pdfgenerator.model.TextElement
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Assertions.assertNotNull
import org.junit.jupiter.api.Assertions.assertNull
import org.junit.jupiter.api.Assertions.assertTrue
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.io.TempDir
import java.io.ByteArrayInputStream
import java.nio.file.Path

@Suppress("LargeClass")
class JasperTemplateConverterCoverageTest {
    @TempDir
    lateinit var tempDir: Path

    @Test
    fun testHasSubreportAndFromInputStream() {
        val jrxmlWithSubreport = """<?xml version="1.0" encoding="UTF-8"?>
<jasperReport xmlns="http://jasperreports.sourceforge.net/jasperreports"
              name="sub_test" pageWidth="595" pageHeight="842" columnWidth="555"
              leftMargin="20" rightMargin="20" topMargin="20" bottomMargin="20">
    <detail>
        <band height="100">
            <subreport>
                <reportElement x="0" y="0" width="200" height="50"/>
                <subreportExpression><![CDATA["subreport.jasper"]]></subreportExpression>
            </subreport>
        </band>
    </detail>
</jasperReport>
"""
        val file = tempDir.resolve("with_sub.jrxml").toFile()
        file.writeText(jrxmlWithSubreport)
        assertTrue(JasperTemplateConverter.hasSubreport(file))

        val stream = ByteArrayInputStream(jrxmlWithSubreport.toByteArray())
        val template = JasperTemplateConverter.fromInputStream(stream)
        assertNotNull(template)
    }

    @Test
    fun testParseCode128AndQrCode() {
        val jrxml = """<?xml version="1.0" encoding="UTF-8"?>
<jasperReport xmlns="http://jasperreports.sourceforge.net/jasperreports"
              xmlns:jr="http://jasperreports.sourceforge.net/jasperreports/components"
              name="barcodes" pageWidth="595" pageHeight="842" columnWidth="555"
              leftMargin="20" rightMargin="20" topMargin="20" bottomMargin="20">
    <detail>
        <band height="150">
            <componentElement>
                <reportElement x="10" y="10" width="150" height="40"/>
                <jr:Code128>
                    <jr:codeExpression><![CDATA[${'$'}F{barcodeValue}]]></jr:codeExpression>
                </jr:Code128>
            </componentElement>
            <componentElement>
                <reportElement x="10" y="60" width="60" height="60">
                    <printWhenExpression><![CDATA[${'$'}F{showQr} == true]]></printWhenExpression>
                </reportElement>
                <jr:QRCode>
                    <jr:codeExpression><![CDATA["STATIC_QR"]]></jr:codeExpression>
                </jr:QRCode>
            </componentElement>
        </band>
    </detail>
</jasperReport>
"""
        val template = JasperTemplateConverter.fromString(jrxml)
        val elements = template.bodyElements()
        val barcodes = elements.filterIsInstance<BarcodeElement>()
        assertEquals(2, barcodes.size)
        val c128 = barcodes.first { it.barcodeType == "code128" }
        assertEquals("barcodeValue", c128.dataBinding)
        val qr = barcodes.first { it.barcodeType == "qr_code" }
        assertEquals("STATIC_QR", qr.value)
        assertEquals("showQr == true", qr.printCondition)
    }

    @Test
    fun testFrameWithPrintWhenConditionAndChildren() {
        val jrxml = """<?xml version="1.0" encoding="UTF-8"?>
<jasperReport xmlns="http://jasperreports.sourceforge.net/jasperreports"
              name="frame_test" pageWidth="595" pageHeight="842" columnWidth="555"
              leftMargin="20" rightMargin="20" topMargin="20" bottomMargin="20">
    <detail>
        <band height="200">
            <frame>
                <reportElement x="10" y="10" width="400" height="150">
                    <printWhenExpression><![CDATA[${'$'}F{active} == true]]></printWhenExpression>
                </reportElement>
                <rectangle radius="4">
                    <reportElement x="0" y="0" width="100" height="50" backcolor="#FF0000"/>
                    <graphicElement>
                        <pen lineWidth="1.5" lineColor="#000000"/>
                    </graphicElement>
                </rectangle>
                <line>
                    <reportElement x="0" y="60" width="200" height="1"/>
                    <graphicElement>
                        <pen lineWidth="2.0" lineColor="#333333"/>
                    </graphicElement>
                </line>
                <staticText>
                    <reportElement x="0" y="70" width="100" height="20"/>
                    <text><![CDATA[Static in frame]]></text>
                </staticText>
                <textField>
                    <reportElement x="110" y="70" width="100" height="20"/>
                    <textFieldExpression><![CDATA[${'$'}F{dynamicText}]]></textFieldExpression>
                </textField>
            </frame>
        </band>
    </detail>
</jasperReport>
"""
        val template = JasperTemplateConverter.fromString(jrxml)
        val elements = template.bodyElements()
        assertTrue(elements.isNotEmpty())
        for (el in elements) {
            when (el) {
                is RectangleElement -> assertEquals("active == true", el.printCondition)
                is LineElement -> assertEquals("active == true", el.printCondition)
                is TextElement -> assertEquals("active == true", el.printCondition)
                else -> {}
            }
        }
    }

    @Test
    fun testMultipleBandsInSection() {
        val jrxml = """<?xml version="1.0" encoding="UTF-8"?>
<jasperReport xmlns="http://jasperreports.sourceforge.net/jasperreports"
              name="multibands" pageWidth="595" pageHeight="842" columnWidth="555"
              leftMargin="20" rightMargin="20" topMargin="20" bottomMargin="20">
    <pageHeader>
        <band height="40">
            <staticText>
                <reportElement x="0" y="0" width="100" height="20"/>
                <text><![CDATA[Header Band 1]]></text>
            </staticText>
        </band>
        <band height="30">
            <staticText>
                <reportElement x="0" y="0" width="100" height="20"/>
                <text><![CDATA[Header Band 2]]></text>
            </staticText>
        </band>
    </pageHeader>
    <detail>
        <band height="50">
            <staticText>
                <reportElement x="0" y="0" width="100" height="20"/>
                <text><![CDATA[Detail]]></text>
            </staticText>
        </band>
    </detail>
</jasperReport>
"""
        val template = JasperTemplateConverter.fromString(jrxml)
        assertNotNull(template.pageSettings.header)
        val headerElements = template.pageSettings.header!!.elements
        assertTrue(headerElements.any { it is ContainerElement })
    }

    @Test
    fun testStylesInheritanceAndProperties() {
        val jrxml = """<?xml version="1.0" encoding="UTF-8"?>
<jasperReport xmlns="http://jasperreports.sourceforge.net/jasperreports"
              name="styles_test" pageWidth="595" pageHeight="842" columnWidth="555"
              leftMargin="20" rightMargin="20" topMargin="20" bottomMargin="20">
    <style name="BaseStyle" fontName="Courier" fontSize="12" isBold="true" forecolor="#111111" backcolor="#EEEEEE"/>
    <style name="ChildStyle" style="BaseStyle" isItalic="true" fontSize="14"/>
    <title>
        <band height="50">
            <staticText>
                <reportElement style="ChildStyle" x="0" y="0" width="200" height="30"/>
                <textElement textAlignment="Right" verticalAlignment="Middle"/>
                <text><![CDATA[Styled text]]></text>
            </staticText>
        </band>
    </title>
</jasperReport>
"""
        val template = JasperTemplateConverter.fromString(jrxml)
        val text = template.bodyElements().filterIsInstance<com.pdfgenerator.model.StaticTextElement>().first()
        assertEquals("Courier", text.style?.fontFamily)
        assertEquals(14f, text.style?.fontSize)
        assertEquals("bold", text.style?.fontWeight)
        assertEquals("italic", text.style?.fontStyle)
        assertEquals("#111111", text.style?.color)
        assertEquals("right", text.style?.alignment)
    }

    @Test
    fun testConversionException() {
        val ex = JasperTemplateConversionException("Failed reason")
        assertEquals("Failed reason", ex.message)
    }

    @Test
    fun testTableInferenceSuccess() {
        val jrxml = """<?xml version="1.0" encoding="UTF-8"?>
<jasperReport xmlns="http://jasperreports.sourceforge.net/jasperreports"
              name="table_inf" pageWidth="595" pageHeight="842" columnWidth="555"
              leftMargin="20" rightMargin="20" topMargin="20" bottomMargin="20">
    <columnHeader>
        <band height="30">
            <rectangle>
                <reportElement x="0" y="0" width="555" height="30" backcolor="#E2E8F0" forecolor="#CBD5E1"/>
                <graphicElement><pen lineWidth="1.0" lineColor="#0000FF"/></graphicElement>
            </rectangle>
            <staticText>
                <reportElement x="10" y="5" width="200" height="20" forecolor="#1E293B"/>
                <textElement textAlignment="Left"/>
                <text><![CDATA[Item Description]]></text>
            </staticText>
            <staticText>
                <reportElement x="220" y="5" width="100" height="20" forecolor="#1E293B"/>
                <textElement textAlignment="Right"/>
                <text><![CDATA[Amount]]></text>
            </staticText>
        </band>
    </columnHeader>
    <detail>
        <band height="25">
            <line>
                <reportElement x="0" y="24" width="555" height="1" forecolor="#EEEEEE"/>
                <graphicElement><pen lineWidth="0.5" lineColor="#CCCCCC"/></graphicElement>
            </line>
            <textField>
                <reportElement x="10" y="2" width="200" height="20"/>
                <textFieldExpression><![CDATA[${'$'}F{desc}]]></textFieldExpression>
            </textField>
            <textField pattern="${'$'}#,##0.00">
                <reportElement x="220" y="2" width="100" height="20"/>
                <textFieldExpression><![CDATA[${'$'}F{total}]]></textFieldExpression>
            </textField>
        </band>
    </detail>
</jasperReport>
"""
        val template = JasperTemplateConverter.fromString(jrxml)
        val elements = template.bodyElements()
        val tables = elements.filterIsInstance<com.pdfgenerator.model.TableElement>()
        assertEquals(1, tables.size)
        val t = tables[0]
        assertEquals(2, t.columns.size)
        assertEquals("desc", t.columns[0].field)
        assertTrue(t.columns[1].field.contains("total"))
    }

    @Test
    fun testTableInferenceFailuresAndFallbacks() {
        // 1. Mismatched column counts -> falls back to loop or elements
        val jrxmlMismatched = """<?xml version="1.0" encoding="UTF-8"?>
<jasperReport xmlns="http://jasperreports.sourceforge.net/jasperreports"
              name="mismatch" pageWidth="595" pageHeight="842" columnWidth="555"
              leftMargin="20" rightMargin="20" topMargin="20" bottomMargin="20">
    <columnHeader>
        <band height="30">
            <staticText>
                <reportElement x="10" y="5" width="200" height="20"/>
                <text><![CDATA[Col 1]]></text>
            </staticText>
            <staticText>
                <reportElement x="220" y="5" width="100" height="20"/>
                <text><![CDATA[Col 2]]></text>
            </staticText>
        </band>
    </columnHeader>
    <detail>
        <band height="25">
            <textField>
                <reportElement x="10" y="2" width="200" height="20"/>
                <textFieldExpression><![CDATA[${'$'}F{desc}]]></textFieldExpression>
            </textField>
        </band>
    </detail>
</jasperReport>
"""
        val tpl1 = JasperTemplateConverter.fromString(jrxmlMismatched)
        val tables1 = tpl1.bodyElements().filterIsInstance<com.pdfgenerator.model.TableElement>()
        assertTrue(tables1.isEmpty())

        // 2. Disqualifier (image inside detail) -> table inference returns null
        val jrxmlDisqualified = """<?xml version="1.0" encoding="UTF-8"?>
<jasperReport xmlns="http://jasperreports.sourceforge.net/jasperreports"
              name="disqualified" pageWidth="595" pageHeight="842" columnWidth="555"
              leftMargin="20" rightMargin="20" topMargin="20" bottomMargin="20">
    <columnHeader>
        <band height="30">
            <staticText>
                <reportElement x="10" y="5" width="100" height="20"/>
                <text><![CDATA[Col 1]]></text>
            </staticText>
        </band>
    </columnHeader>
    <detail>
        <band height="40">
            <textField>
                <reportElement x="10" y="2" width="100" height="20"/>
                <textFieldExpression><![CDATA[${'$'}F{desc}]]></textFieldExpression>
            </textField>
            <image>
                <reportElement x="120" y="2" width="30" height="30"/>
                <imageExpression><![CDATA["logo.png"]]></imageExpression>
            </image>
        </band>
    </detail>
</jasperReport>
"""
        val tpl2 = JasperTemplateConverter.fromString(jrxmlDisqualified)
        val tables2 = tpl2.bodyElements().filterIsInstance<com.pdfgenerator.model.TableElement>()
        assertTrue(tables2.isEmpty())
    }

    @Test
    fun testSummaryAndColumnFooter() {
        val jrxmlSummaryNewPage = """<?xml version="1.0" encoding="UTF-8"?>
<jasperReport xmlns="http://jasperreports.sourceforge.net/jasperreports"
              name="summary_test" pageWidth="595" pageHeight="842" columnWidth="555"
              leftMargin="20" rightMargin="20" topMargin="20" bottomMargin="20"
              isSummaryNewPage="true">
    <columnFooter>
        <band height="20">
            <staticText>
                <reportElement x="0" y="0" width="100" height="20"/>
                <text><![CDATA[Col Footer]]></text>
            </staticText>
        </band>
    </columnFooter>
    <summary>
        <band height="40">
            <staticText>
                <reportElement x="0" y="0" width="200" height="30"/>
                <text><![CDATA[Summary text]]></text>
            </staticText>
        </band>
    </summary>
</jasperReport>
"""
        val tpl1 = JasperTemplateConverter.fromString(jrxmlSummaryNewPage)
        assertNotNull(tpl1.summaryPage)
        assertTrue(tpl1.summaryPage!!.elements.isNotEmpty())

        val jrxmlSummarySamePage = jrxmlSummaryNewPage.replace("isSummaryNewPage=\"true\"", "isSummaryNewPage=\"false\"")
        val tpl2 = JasperTemplateConverter.fromString(jrxmlSummarySamePage)
        assertNull(tpl2.summaryPage)
        assertTrue(tpl2.bodyElements().any { it is com.pdfgenerator.model.StaticTextElement && it.value == "Summary text" })
    }

    @Test
    fun testUnsupportedElementHandling() {
        val jrxmlUnsupported = """<?xml version="1.0" encoding="UTF-8"?>
<jasperReport xmlns="http://jasperreports.sourceforge.net/jasperreports"
              name="unsupp" pageWidth="595" pageHeight="842" columnWidth="555"
              leftMargin="20" rightMargin="20" topMargin="20" bottomMargin="20">
    <detail>
        <band height="50">
            <ellipse>
                <reportElement x="0" y="0" width="50" height="50"/>
            </ellipse>
        </band>
    </detail>
</jasperReport>
"""
        // 1. With failOnUnsupportedElement = true -> throws exception
        org.junit.jupiter.api.assertThrows<JasperTemplateConversionException> {
            JasperTemplateConverter.fromString(
                jrxmlUnsupported,
                JasperConversionOptions(failOnUnsupportedElement = true),
            )
        }

        // 2. Default: skips unsupported element
        val tpl = JasperTemplateConverter.fromString(jrxmlUnsupported)
        assertTrue(tpl.bodyElements().isEmpty())
    }

    @Test
    fun testTableInferenceWithFrameAndTextFieldHeaders() {
        val jrxml = """<?xml version="1.0" encoding="UTF-8"?>
<jasperReport xmlns="http://jasperreports.sourceforge.net/jasperreports"
              name="table_frame_headers" pageWidth="595" pageHeight="842" columnWidth="555"
              leftMargin="20" rightMargin="20" topMargin="20" bottomMargin="20">
    <columnHeader>
        <band height="30">
            <frame>
                <reportElement x="0" y="0" width="555" height="30"/>
                <textField>
                    <reportElement x="10" y="5" width="200" height="20" forecolor="#333333"/>
                    <textElement textAlignment="Center"/>
                    <textFieldExpression><![CDATA["Product Name"]]></textFieldExpression>
                </textField>
                <staticText>
                    <reportElement x="220" y="5" width="100" height="20"/>
                    <textElement textAlignment="Right"/>
                    <text><![CDATA[Unit Price]]></text>
                </staticText>
            </frame>
        </band>
    </columnHeader>
    <detail>
        <band height="25">
            <frame>
                <reportElement x="0" y="0" width="555" height="25"/>
                <textField>
                    <reportElement x="10" y="2" width="200" height="20"/>
                    <textFieldExpression><![CDATA[${'$'}F{product}]]></textFieldExpression>
                </textField>
                <textField>
                    <reportElement x="220" y="2" width="100" height="20"/>
                    <textFieldExpression><![CDATA[${'$'}F{price}]]></textFieldExpression>
                </textField>
            </frame>
        </band>
    </detail>
</jasperReport>
"""
        val template = JasperTemplateConverter.fromString(jrxml)
        val elements = template.bodyElements()
        val tables = elements.filterIsInstance<com.pdfgenerator.model.TableElement>()
        assertEquals(1, tables.size)
        assertEquals(2, tables[0].columns.size)
        assertEquals("Product Name", tables[0].columns[0].header)
        assertEquals("product", tables[0].columns[0].field)
    }

    @Test
    fun testFrameConditionWithAllElementTypes() {
        val jrxml = """<?xml version="1.0" encoding="UTF-8"?>
<jasperReport xmlns="http://jasperreports.sourceforge.net/jasperreports"
              xmlns:jr="http://jasperreports.sourceforge.net/jasperreports/components"
              name="frame_all_types" pageWidth="595" pageHeight="842" columnWidth="555"
              leftMargin="20" rightMargin="20" topMargin="20" bottomMargin="20">
    <detail>
        <band height="300">
            <frame>
                <reportElement x="10" y="10" width="500" height="280">
                    <printWhenExpression><![CDATA[${'$'}F{showAll} == true]]></printWhenExpression>
                </reportElement>
                <image>
                    <reportElement x="0" y="0" width="50" height="50"/>
                    <imageExpression><![CDATA["icon.png"]]></imageExpression>
                </image>
                <componentElement>
                    <reportElement x="60" y="0" width="150" height="40"/>
                    <jr:Code128>
                        <jr:codeExpression><![CDATA["STATIC-CODE-128"]]></jr:codeExpression>
                    </jr:Code128>
                </componentElement>
                <frame>
                    <reportElement x="0" y="60" width="200" height="40"/>
                    <staticText>
                        <reportElement x="0" y="0" width="100" height="20"/>
                        <text><![CDATA[nested]]></text>
                    </staticText>
                </frame>
            </frame>
        </band>
    </detail>
</jasperReport>
"""
        val template = JasperTemplateConverter.fromString(jrxml)
        val elements = template.bodyElements()
        assertTrue(elements.isNotEmpty())
    }

    @Test
    fun testCode128StaticValue() {
        val jrxml = """<?xml version="1.0" encoding="UTF-8"?>
<jasperReport xmlns="http://jasperreports.sourceforge.net/jasperreports"
              xmlns:jr="http://jasperreports.sourceforge.net/jasperreports/components"
              name="c128_static" pageWidth="595" pageHeight="842" columnWidth="555"
              leftMargin="20" rightMargin="20" topMargin="20" bottomMargin="20">
    <detail>
        <band height="60">
            <componentElement>
                <reportElement x="10" y="10" width="120" height="30"/>
                <jr:Code128>
                    <jr:codeExpression><![CDATA["123456789"]]></jr:codeExpression>
                </jr:Code128>
            </componentElement>
        </band>
    </detail>
</jasperReport>
"""
        val template = JasperTemplateConverter.fromString(jrxml)
        val barcode = template.bodyElements().filterIsInstance<BarcodeElement>().first()
        assertEquals("123456789", barcode.value)
    }

    @Test
    fun testSubreportFileResolutionAndEmbedding() {
        // Child subreport
        val childJrxml = """<?xml version="1.0" encoding="UTF-8"?>
<jasperReport xmlns="http://jasperreports.sourceforge.net/jasperreports"
              name="child_sub" pageWidth="500" pageHeight="100" columnWidth="460"
              leftMargin="20" rightMargin="20" topMargin="20" bottomMargin="20">
    <detail>
        <band height="30">
            <staticText>
                <reportElement x="0" y="0" width="150" height="20"/>
                <text><![CDATA[Embedded child]]></text>
            </staticText>
        </band>
    </detail>
</jasperReport>
"""
        val childFile = tempDir.resolve("child_sub.jrxml").toFile()
        childFile.writeText(childJrxml)

        // Parent report referencing child_sub.jasper
        val parentJrxml = """<?xml version="1.0" encoding="UTF-8"?>
<jasperReport xmlns="http://jasperreports.sourceforge.net/jasperreports"
              name="parent_sub" pageWidth="595" pageHeight="842" columnWidth="555"
              leftMargin="20" rightMargin="20" topMargin="20" bottomMargin="20">
    <detail>
        <band height="100">
            <subreport>
                <reportElement x="10" y="10" width="300" height="60"/>
                <subreportExpression><![CDATA["child_sub.jasper"]]></subreportExpression>
            </subreport>
        </band>
    </detail>
</jasperReport>
"""
        val parentFile = tempDir.resolve("parent_sub.jrxml").toFile()
        parentFile.writeText(parentJrxml)

        val tpl =
            JasperTemplateConverter.fromFile(
                parentFile.absolutePath,
                JasperConversionOptions(baseDir = tempDir.toFile()),
            )
        val container = tpl.bodyElements().filterIsInstance<ContainerElement>().first()
        assertTrue(container.elements.isNotEmpty())

        // Test broken child subreport
        val brokenFile = tempDir.resolve("broken.jrxml").toFile()
        brokenFile.writeText("invalid xml")
        val parentBrokenJrxml = parentJrxml.replace("child_sub.jasper", "broken.jrxml")
        val tplBroken =
            JasperTemplateConverter.fromString(
                parentBrokenJrxml,
                JasperConversionOptions(baseDir = tempDir.toFile()),
            )
        val containerBroken = tplBroken.bodyElements().filterIsInstance<ContainerElement>().first()
        assertTrue(containerBroken.elements.isEmpty())
    }

    @Test
    fun testStyleAlignmentsAndVerticalAlignments() {
        val jrxml = """<?xml version="1.0" encoding="UTF-8"?>
<jasperReport xmlns="http://jasperreports.sourceforge.net/jasperreports"
              name="align_test" pageWidth="595" pageHeight="842" columnWidth="555"
              leftMargin="20" rightMargin="20" topMargin="20" bottomMargin="20">
    <style name="JustifyBottom" textAlignment="Justify" verticalAlignment="Bottom"/>
    <style name="CenterTop" textAlignment="Center" verticalAlignment="Top"/>
    <style name="DefaultAlign" vTextAlign="Middle" hTextAlign="Left"/>
    <detail>
        <band height="100">
            <staticText>
                <reportElement style="JustifyBottom" x="0" y="0" width="100" height="20"/>
                <text><![CDATA[Justified]]></text>
            </staticText>
            <staticText>
                <reportElement style="CenterTop" x="0" y="30" width="100" height="20"/>
                <text><![CDATA[Center]]></text>
            </staticText>
            <staticText>
                <reportElement style="DefaultAlign" x="0" y="60" width="100" height="20"/>
                <text><![CDATA[Middle]]></text>
            </staticText>
        </band>
    </detail>
</jasperReport>
"""
        val tpl = JasperTemplateConverter.fromString(jrxml)
        val texts = tpl.bodyElements().filterIsInstance<com.pdfgenerator.model.StaticTextElement>()
        assertEquals("justify", texts[0].style?.alignment)
        assertEquals("bottom", texts[0].style?.verticalAlignment)
        assertEquals("center", texts[1].style?.alignment)
        assertEquals("top", texts[1].style?.verticalAlignment)
        assertEquals("center", texts[2].style?.verticalAlignment)
    }

    @Test
    fun testTableInferenceEdgeCases() {
        // Spread of Y > 15f between fields
        val jrxmlYSread = """<?xml version="1.0" encoding="UTF-8"?>
<jasperReport xmlns="http://jasperreports.sourceforge.net/jasperreports"
              name="yspread" pageWidth="595" pageHeight="842" columnWidth="555"
              leftMargin="20" rightMargin="20" topMargin="20" bottomMargin="20">
    <columnHeader>
        <band height="30">
            <staticText><reportElement x="0" y="0" width="50" height="20"/><text><![CDATA[A]]></text></staticText>
            <staticText><reportElement x="60" y="0" width="50" height="20"/><text><![CDATA[B]]></text></staticText>
        </band>
    </columnHeader>
    <detail>
        <band height="50">
            <textField><reportElement x="0" y="0" width="50" height="20"/><textFieldExpression><![CDATA[${'$'}F{a}]]></textFieldExpression></textField>
            <textField><reportElement x="60" y="25" width="50" height="20"/><textFieldExpression><![CDATA[${'$'}F{b}]]></textFieldExpression></textField>
        </band>
    </detail>
</jasperReport>
"""
        val tpl1 = JasperTemplateConverter.fromString(jrxmlYSread)
        assertTrue(tpl1.bodyElements().none { it is com.pdfgenerator.model.TableElement })

        // Spread of X > 30f between header and field
        val jrxmlXSpread = """<?xml version="1.0" encoding="UTF-8"?>
<jasperReport xmlns="http://jasperreports.sourceforge.net/jasperreports"
              name="xspread" pageWidth="595" pageHeight="842" columnWidth="555"
              leftMargin="20" rightMargin="20" topMargin="20" bottomMargin="20">
    <columnHeader>
        <band height="30">
            <staticText><reportElement x="0" y="0" width="50" height="20"/><text><![CDATA[A]]></text></staticText>
        </band>
    </columnHeader>
    <detail>
        <band height="30">
            <textField><reportElement x="40" y="0" width="50" height="20"/><textFieldExpression><![CDATA[${'$'}F{a}]]></textFieldExpression></textField>
        </band>
    </detail>
</jasperReport>
"""
        val tpl2 = JasperTemplateConverter.fromString(jrxmlXSpread)
        assertTrue(tpl2.bodyElements().none { it is com.pdfgenerator.model.TableElement })
    }

    @Test
    fun testLineDirectionsAndGraphicElements() {
        val jrxml = """<?xml version="1.0" encoding="UTF-8"?>
<jasperReport xmlns="http://jasperreports.sourceforge.net/jasperreports"
              name="lines_and_rects" pageWidth="595" pageHeight="842" columnWidth="555"
              leftMargin="20" rightMargin="20" topMargin="20" bottomMargin="20">
    <detail>
        <band height="100">
            <line direction="BottomUp">
                <reportElement x="10" y="10" width="50" height="30"/>
                <graphicElement><pen lineWidth="1.0" lineColor="#123456"/></graphicElement>
            </line>
            <rectangle>
                <reportElement x="70" y="10" width="40" height="40"/>
                <graphicElement><pen/></graphicElement>
            </rectangle>
            <staticText>
                <reportElement x="120" y="10" width="50" height="20"/>
                <text><![CDATA[]]></text>
            </staticText>
            <textField pattern="#,##0.00">
                <reportElement x="180" y="10" width="80" height="20"/>
                <textFieldExpression><![CDATA[${'$'}F{rawNumber}]]></textFieldExpression>
            </textField>
        </band>
    </detail>
</jasperReport>
"""
        val tpl = JasperTemplateConverter.fromString(jrxml)
        val elements = tpl.bodyElements()
        assertTrue(elements.isNotEmpty())
    }

    @Test
    fun testSubreportExpressionFormats() {
        // Subreport without extension and unquoted
        val jrxml = """<?xml version="1.0" encoding="UTF-8"?>
<jasperReport xmlns="http://jasperreports.sourceforge.net/jasperreports"
              name="sub_formats" pageWidth="595" pageHeight="842" columnWidth="555"
              leftMargin="20" rightMargin="20" topMargin="20" bottomMargin="20">
    <detail>
        <band height="120">
            <subreport>
                <reportElement x="0" y="0" width="100" height="30"/>
                <subreportExpression><![CDATA["sub_no_ext"]]></subreportExpression>
            </subreport>
            <subreport>
                <reportElement x="0" y="40" width="100" height="30"/>
                <subreportExpression><![CDATA[direct_name.jrxml]]></subreportExpression>
            </subreport>
            <subreport>
                <reportElement x="0" y="80" width="100" height="30"/>
                <subreportExpression><![CDATA[]]></subreportExpression>
            </subreport>
        </band>
    </detail>
</jasperReport>
"""
        val tpl = JasperTemplateConverter.fromString(jrxml)
        val containers = tpl.bodyElements().filterIsInstance<ContainerElement>()
        assertEquals(3, containers.size)
    }
}
