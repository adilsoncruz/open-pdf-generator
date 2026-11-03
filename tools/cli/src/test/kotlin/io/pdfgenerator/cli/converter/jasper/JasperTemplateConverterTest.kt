package io.pdfgenerator.cli.converter.jasper
import com.pdfgenerator.model.ImageElement
import com.pdfgenerator.model.LineElement
import com.pdfgenerator.model.LoopElement
import com.pdfgenerator.model.StaticTextElement
import com.pdfgenerator.model.TableElement
import com.pdfgenerator.model.TextElement
import java.io.File
import kotlin.test.Test
import kotlin.test.assertEquals
import kotlin.test.assertIs
import kotlin.test.assertNotNull
import kotlin.test.assertNull

class JasperTemplateConverterTest {
    @Test
    fun `should convert basic jrxml to template`() {
        val jrxml =
            """
                <jasperReport name="invoice" pageWidth="595" pageHeight="842" topMargin="10" leftMargin="15" rightMargin="15" bottomMargin="10">
                  <title>
                    <band height="40">
                      <rectangle>
                    <reportElement x="-20" y="-20" width="595" height="19" backcolor="#FFE44C" uuid="9dff2f50-2f03-4551-9b43-928bb470e5cd"/>
                    <graphicElement>
                        <pen lineWidth="0.0"/>
                    </graphicElement>
                </rectangle>
                      <staticText>
                        <reportElement x="10" y="5" width="200" height="20" key="title-1"/>
                        <textElement textAlignment="Center">
                          <font fontName="Helvetica" size="16" isBold="true"/>
                        </textElement>
                        <text><![CDATA[Invoice]]></text>
                      </staticText>
                    </band>
                  </title>
                <background>
            <band height="802" splitType="Stretch">
                <frame>
                    <reportElement x="284" y="9" width="270" height="172" uuid="d3b92e46-5b1a-4e82-853e-e428760d8fd1">
                        <property name="com.jaspersoft.studio.unit.x" value="px"/>
                        <property name="com.jaspersoft.studio.unit.y" value="px"/>
                        <property name="com.jaspersoft.studio.unit.width" value="px"/>
                        <property name="com.jaspersoft.studio.unit.height" value="px"/>
                    </reportElement>
                    <rectangle radius="5">
                        <reportElement x="-4" y="0" width="270" height="170" backcolor="#CCCCCC" uuid="46fe7234-f740-4ace-bc41-df39466079f1">
                            <property name="com.jaspersoft.studio.unit.width" value="px"/>
                            <property name="com.jaspersoft.studio.unit.x" value="px"/>
                            <property name="com.jaspersoft.studio.unit.y" value="px"/>
                            <property name="com.jaspersoft.studio.unit.height" value="px"/>
                        </reportElement>
                        <graphicElement>
                            <pen lineWidth="0.0"/>
                        </graphicElement>
                    </rectangle>
                </frame>
                <rectangle radius="5">
                    <reportElement x="0" y="0" width="555" height="802" forecolor="#ADADAD" uuid="aa31b788-5987-414c-bd4e-27d24e799201">
                        <property name="com.jaspersoft.studio.unit.x" value="px"/>
                        <property name="com.jaspersoft.studio.unit.y" value="px"/>
                        <property name="com.jaspersoft.studio.unit.width" value="px"/>
                        <property name="com.jaspersoft.studio.unit.height" value="px"/>
                    </reportElement>
                </rectangle>
                <componentElement>
                    <reportElement x="4" y="11" width="105" height="105" isPrintInFirstWholeBand="true" uuid="bfdf73ae-addf-4164-bfe1-749217ca36be">
                        <property name="com.jaspersoft.studio.unit.margin" value="px"/>
                        <property name="com.jaspersoft.studio.unit.x" value="px"/>
                    </reportElement>
                    <jr:list xmlns:jr="http://jasperreports.sourceforge.net/jasperreports/components" xsi:schemaLocation="http://jasperreports.sourceforge.net/jasperreports/components http://jasperreports.sourceforge.net/xsd/components.xsd" printOrder="Vertical">
                        <datasetRun subDataset="Data" uuid="a2041552-12ea-4e6b-a713-8622e5fc9393">
                            <dataSourceExpression><![CDATA[new net.sf.jasperreports.engine.data.JRBeanCollectionDataSource(${'$'}F{document})]]></dataSourceExpression>
                        </datasetRun>
                        <jr:listContents height="19" width="555">
                            <textField>
                                <reportElement x="10" y="0" width="110" height="19" uuid="2c241b9d-7d87-4b56-858d-2d4268d52e18"/>
                                <box>
                                    <pen lineColor="#EFEFEF"/>
                                    <topPen lineWidth="2.0" lineStyle="Solid" lineColor="#EFEFEF"/>
                                    <leftPen lineWidth="2.0" lineStyle="Solid" lineColor="#EFEFEF"/>
                                    <bottomPen lineWidth="2.0" lineStyle="Solid" lineColor="#EFEFEF"/>
                                    <rightPen lineWidth="2.0" lineStyle="Solid" lineColor="#EFEFEF"/>
                                </box>
                                <textElement verticalAlignment="Middle">
                                    <font size="10"/>
                                    <paragraph firstLineIndent="3"/>
                                </textElement>
                                <textFieldExpression><![CDATA[${'$'}F{type}]]></textFieldExpression>
                            </textField>
                            <textField>
                                <reportElement x="120" y="0" width="80" height="19" uuid="dadcf954-fc41-4954-ac45-6087c62e223b"/>
                                <box>
                                    <pen lineColor="#EFEFEF"/>
                                    <topPen lineWidth="2.0" lineStyle="Solid" lineColor="#EFEFEF"/>
                                    <leftPen lineWidth="2.0" lineStyle="Solid" lineColor="#EFEFEF"/>
                                    <bottomPen lineWidth="2.0" lineStyle="Solid" lineColor="#EFEFEF"/>
                                    <rightPen lineWidth="2.0" lineStyle="Solid" lineColor="#EFEFEF"/>
                                </box>
                                <textElement verticalAlignment="Middle">
                                    <font size="10"/>
                                    <paragraph firstLineIndent="3"/>
                                </textElement>
                                <textFieldExpression><![CDATA[${'$'}F{period}]]></textFieldExpression>
                            </textField>
                            <textField>
                                <reportElement x="200" y="0" width="60" height="19" uuid="dadcf954-fc41-4954-ac45-6087c62e223b"/>
                                <box>
                                    <pen lineColor="#EFEFEF"/>
                                    <topPen lineWidth="2.0" lineStyle="Solid" lineColor="#EFEFEF"/>
                                    <leftPen lineWidth="2.0" lineStyle="Solid" lineColor="#EFEFEF"/>
                                    <bottomPen lineWidth="2.0" lineStyle="Solid" lineColor="#EFEFEF"/>
                                    <rightPen lineWidth="2.0" lineStyle="Solid" lineColor="#EFEFEF"/>
                                </box>
                                <textElement verticalAlignment="Middle">
                                    <font size="10"/>
                                    <paragraph firstLineIndent="3"/>
                                </textElement>
                                <textFieldExpression><![CDATA[${'$'}F{quantity}]]></textFieldExpression>
                            </textField>
                            <textField>
                                <reportElement x="260" y="0" width="40" height="19" uuid="dadcf954-fc41-4954-ac45-6087c62e223b"/>
                                <box>
                                    <pen lineColor="#EFEFEF"/>
                                    <topPen lineWidth="2.0" lineStyle="Solid" lineColor="#EFEFEF"/>
                                    <leftPen lineWidth="2.0" lineStyle="Solid" lineColor="#EFEFEF"/>
                                    <bottomPen lineWidth="2.0" lineStyle="Solid" lineColor="#EFEFEF"/>
                                    <rightPen lineWidth="2.0" lineStyle="Solid" lineColor="#EFEFEF"/>
                                </box>
                                <textElement verticalAlignment="Middle">
                                    <font size="10"/>
                                    <paragraph firstLineIndent="3"/>
                                </textElement>
                                <textFieldExpression><![CDATA[${'$'}F{percentage}]]></textFieldExpression>
                            </textField>
                            <textField>
                                <reportElement x="300" y="0" width="90" height="19" uuid="dadcf954-fc41-4954-ac45-6087c62e223b"/>
                                <box>
                                    <pen lineColor="#EFEFEF"/>
                                    <topPen lineWidth="2.0" lineStyle="Solid" lineColor="#EFEFEF"/>
                                    <leftPen lineWidth="2.0" lineStyle="Solid" lineColor="#EFEFEF"/>
                                    <bottomPen lineWidth="2.0" lineStyle="Solid" lineColor="#EFEFEF"/>
                                    <rightPen lineWidth="2.0" lineStyle="Solid" lineColor="#EFEFEF"/>
                                </box>
                                <textElement verticalAlignment="Middle">
                                    <font size="10"/>
                                    <paragraph firstLineIndent="3"/>
                                </textElement>
                                <textFieldExpression><![CDATA[${'$'}F{total}]]></textFieldExpression>
                            </textField>
                            <textField>
                                <reportElement x="390" y="0" width="80" height="19" uuid="dadcf954-fc41-4954-ac45-6087c62e223b"/>
                                <box>
                                    <pen lineColor="#EFEFEF"/>
                                    <topPen lineWidth="2.0" lineStyle="Solid" lineColor="#EFEFEF"/>
                                    <leftPen lineWidth="2.0" lineStyle="Solid" lineColor="#EFEFEF"/>
                                    <bottomPen lineWidth="2.0" lineStyle="Solid" lineColor="#EFEFEF"/>
                                    <rightPen lineWidth="2.0" lineStyle="Solid" lineColor="#EFEFEF"/>
                                </box>
                                <textElement verticalAlignment="Middle">
                                    <font size="10"/>
                                    <paragraph firstLineIndent="3"/>
                                </textElement>
                                <textFieldExpression><![CDATA[${'$'}F{netValue}]]></textFieldExpression>
                            </textField>
                            <textField>
                                <reportElement x="470" y="0" width="80" height="19" uuid="dadcf954-fc41-4954-ac45-6087c62e223b"/>
                                <box>
                                    <pen lineColor="#EFEFEF"/>
                                    <topPen lineWidth="2.0" lineStyle="Solid" lineColor="#EFEFEF"/>
                                    <leftPen lineWidth="2.0" lineStyle="Solid" lineColor="#EFEFEF"/>
                                    <bottomPen lineWidth="2.0" lineStyle="Solid" lineColor="#EFEFEF"/>
                                    <rightPen lineWidth="2.0" lineStyle="Solid" lineColor="#EFEFEF"/>
                                </box>
                                <textElement verticalAlignment="Middle">
                                    <font size="10"/>
                                    <paragraph firstLineIndent="3"/>
                                </textElement>
                                <textFieldExpression><![CDATA[${'$'}F{taxValue}]]></textFieldExpression>
                            </textField>
                        </jr:listContents>
                    </jr:list>
                </componentElement>
            </band>
            </background>
                  <detail>
                    <band height="60">
                    <textField textAdjust="ScaleFont">
                    <reportElement isPrintRepeatedValues="false" x="349" y="33" width="111" height="19" isPrintInFirstWholeBand="true" uuid="8b8a090a-c66a-4570-9705-37b16f8f9c06">
                        <property name="com.jaspersoft.studio.unit.width" value="px"/>
                    </reportElement>
                    <textElement>
                        <font fontName="Courier New" isBold="true"/>
                    </textElement>
                    <textFieldExpression><![CDATA["Fecha de Emisión:"]]></textFieldExpression>
                </textField>
                      <textField>
                        <reportElement isPrintRepeatedValues="false" x="60" y="223" width="102" height="17" isPrintInFirstWholeBand="true" backcolor="#0D0C0C" uuid="a8e46346-4183-47fd-8a35-b4385db645d2">
                          <printWhenExpression><![CDATA[${'$'}F{warranty} != null]]></printWhenExpression>
                        </reportElement>
                        <textFieldExpression><![CDATA[${'$'}F{customer.name}]]></textFieldExpression>
                      </textField>
                      <line>
                        <reportElement x="10" y="35" width="300" height="0" key="line-1"/>
                      </line>
                      <image>
                        <reportElement x="350" y="5" width="120" height="40" key="logo"/>
                        <imageExpression><![CDATA[${'$'}P{logoPath}]]></imageExpression>
                      </image>
                    </band>
                  </detail>
                </jasperReport>
            """.trimIndent()

        val template = JasperTemplateConverter.fromString(jrxml, JasperConversionOptions(author = "migration-bot"))

        val elements = template.pageElements!!
        assertEquals(6, elements.size)

        val title = assertIs<StaticTextElement>(elements[1])
        assertEquals("Invoice", title.value)
        assertEquals("bold", title.style?.fontWeight)

        val text = assertIs<TextElement>(elements[3])
        assertEquals("customer.name", text.dataBinding)
        assertNull(text.value)

        val line = assertIs<LineElement>(elements[4])
        assertEquals(300f, line.width)

        val image = assertIs<ImageElement>(elements[5])
        assertEquals("logoPath", image.dataBinding)
    }

    @Test
    fun `should convert tabular columnHeader and detail to TableElement`() {
        val jrxml =
            """
            <jasperReport name="orders" pageWidth="595" pageHeight="842" topMargin="20" leftMargin="20" rightMargin="20" bottomMargin="20">
                <title>
                    <band height="30">
                        <staticText>
                            <reportElement x="0" y="0" width="200" height="25"/>
                            <text><![CDATA[Orders Report]]></text>
                        </staticText>
                    </band>
                </title>
                <columnHeader>
                    <band height="20">
                        <rectangle>
                            <reportElement x="0" y="0" width="500" height="20" backcolor="#1E293B" forecolor="#0F172A"/>
                        </rectangle>
                        <staticText>
                            <reportElement x="10" y="2" width="100" height="16" forecolor="#FFFFFF"/>
                            <textElement textAlignment="Left"/>
                            <text><![CDATA[Item Code]]></text>
                        </staticText>
                        <staticText>
                            <reportElement x="120" y="2" width="250" height="16" forecolor="#FFFFFF"/>
                            <textElement textAlignment="Left"/>
                            <text><![CDATA[Description]]></text>
                        </staticText>
                        <staticText>
                            <reportElement x="380" y="2" width="100" height="16" forecolor="#FFFFFF"/>
                            <textElement textAlignment="Right"/>
                            <text><![CDATA[Total]]></text>
                        </staticText>
                    </band>
                </columnHeader>
                <detail>
                    <band height="18">
                        <textField>
                            <reportElement x="10" y="1" width="100" height="16"/>
                            <textFieldExpression><![CDATA[${'$'}F{code}]]></textFieldExpression>
                        </textField>
                        <textField>
                            <reportElement x="120" y="1" width="250" height="16"/>
                            <textFieldExpression><![CDATA[${'$'}F{description}]]></textFieldExpression>
                        </textField>
                        <textField>
                            <reportElement x="380" y="1" width="100" height="16"/>
                            <textElement textAlignment="Right"/>
                            <textFieldExpression><![CDATA[${'$'}F{total}]]></textFieldExpression>
                        </textField>
                    </band>
                </detail>
            </jasperReport>
            """.trimIndent()

        val template = JasperTemplateConverter.fromString(
            jrxml,
            JasperConversionOptions(defaultItemsBinding = "orderItems"),
        )

        val elements = template.pageElements!!
        // title static text + inferred table
        assertEquals(2, elements.size)
        val table = assertIs<TableElement>(elements[1])
        assertEquals("orderItems", table.dataBinding)
        assertEquals(30f, table.y) // Starts after title (height 30)
        assertEquals(500f, table.width)
        assertEquals(3, table.columns.size)

        assertEquals("Item Code", table.columns[0].header)
        assertEquals("code", table.columns[0].field)
        assertEquals(100f, table.columns[0].width)
        assertEquals("left", table.columns[0].alignment)

        assertEquals("Description", table.columns[1].header)
        assertEquals("description", table.columns[1].field)

        assertEquals("Total", table.columns[2].header)
        assertEquals("total", table.columns[2].field)
        assertEquals("right", table.columns[2].alignment)

        assertEquals("#1E293B", table.style?.headerBackground)
        assertEquals("#FFFFFF", table.style?.headerColor)
    }

    @Test
    fun `should convert detail to LoopElement when detail has non-tabular elements`() {
        val jrxml =
            """
            <jasperReport name="cards" pageWidth="595" pageHeight="842" topMargin="20" leftMargin="20" rightMargin="20" bottomMargin="20">
                <columnHeader>
                    <band height="20">
                        <staticText>
                            <reportElement x="0" y="0" width="500" height="18"/>
                            <text><![CDATA[Card Listing]]></text>
                        </staticText>
                    </band>
                </columnHeader>
                <detail>
                    <band height="50">
                        <image>
                            <reportElement x="10" y="5" width="40" height="40"/>
                            <imageExpression><![CDATA[${'$'}F{photo}]]></imageExpression>
                        </image>
                        <textField>
                            <reportElement x="60" y="5" width="200" height="20"/>
                            <textFieldExpression><![CDATA[${'$'}F{name}]]></textFieldExpression>
                        </textField>
                    </band>
                </detail>
            </jasperReport>
            """.trimIndent()

        val template = JasperTemplateConverter.fromString(jrxml)
        val elements = template.pageElements!!

        // columnHeader static text + detail LoopElement
        assertEquals(2, elements.size)
        assertIs<StaticTextElement>(elements[0])

        val loop = assertIs<LoopElement>(elements[1])
        assertEquals("items", loop.dataBinding)
        assertEquals(20f, loop.y) // Positioned after columnHeader (height 20)
        assertEquals(50f, loop.height)
        assertEquals(2, loop.elements.size)

        val img = assertIs<ImageElement>(loop.elements[0])
        assertEquals("photo", img.dataBinding)
        assertEquals(5f, img.y) // Relative to item row

        val txt = assertIs<TextElement>(loop.elements[1])
        assertEquals("name", txt.dataBinding)
        assertEquals(5f, txt.y) // Relative to item row
    }

    @Test
    fun `should allow disabling table inference to force LoopElement`() {
        val jrxml =
            """
            <jasperReport name="orders" pageWidth="595" pageHeight="842" topMargin="20" leftMargin="20" rightMargin="20" bottomMargin="20">
                <columnHeader>
                    <band height="20">
                        <staticText>
                            <reportElement x="10" y="2" width="100" height="16"/>
                            <text><![CDATA[Code]]></text>
                        </staticText>
                    </band>
                </columnHeader>
                <detail>
                    <band height="18">
                        <textField>
                            <reportElement x="10" y="1" width="100" height="16"/>
                            <textFieldExpression><![CDATA[${'$'}F{code}]]></textFieldExpression>
                        </textField>
                    </band>
                </detail>
            </jasperReport>
            """.trimIndent()

        val template = JasperTemplateConverter.fromString(
            jrxml,
            JasperConversionOptions(enableTableInference = false),
        )

        val elements = template.pageElements!!
        assertEquals(2, elements.size)
        assertIs<StaticTextElement>(elements[0])
        val loop = assertIs<LoopElement>(elements[1])
        assertEquals("items", loop.dataBinding)
        assertEquals(18f, loop.height)
    }

    @Test
    fun `should convert real sample relatorio_pedidos jrxml to TableElement`() {
        val sampleFile = listOf(
            File("tools/editor/samples/jasper/relatorio_pedidos.jrxml"),
            File("../editor/samples/jasper/relatorio_pedidos.jrxml"),
            File("../../tools/editor/samples/jasper/relatorio_pedidos.jrxml"),
        ).firstOrNull { it.exists() } ?: File("tools/editor/samples/jasper/relatorio_pedidos.jrxml")
        val template = JasperTemplateConverter.fromFile(
            sampleFile.absolutePath,
            JasperConversionOptions(defaultItemsBinding = "pedidos"),
        )

        val elements = template.pageElements!!
        val table = elements.filterIsInstance<TableElement>().firstOrNull()
        assertNotNull(table, "Deve inferir TableElement do relatorio_pedidos.jrxml")

        assertEquals("pedidos", table.dataBinding)
        assertEquals(5, table.columns.size)
        assertEquals(listOf("Pedido", "Cliente", "Data", "Status", "Valor (R$)"), table.columns.map { it.header })
        assertEquals(listOf("idPedido", "cliente", "dataPedido", "status", "valor"), table.columns.map { it.field })
        assertEquals("right", table.columns[4].alignment)
        assertEquals("#0F172A", table.style?.headerBackground)
    }

    @Test
    fun `should convert sample fatura_servico jrxml with table and summary`() {
        val sampleFile = listOf(
            File("tools/editor/samples/jasper/fatura_servico.jrxml"),
            File("../editor/samples/jasper/fatura_servico.jrxml"),
            File("../../tools/editor/samples/jasper/fatura_servico.jrxml"),
        ).firstOrNull { it.exists() } ?: File("tools/editor/samples/jasper/fatura_servico.jrxml")
        val template = JasperTemplateConverter.fromFile(sampleFile.absolutePath)

        val elements = template.pageElements!!
        val table = elements.filterIsInstance<TableElement>().firstOrNull()
        assertNotNull(table, "Deve inferir TableElement da fatura_servico.jrxml")

        assertEquals(5, table.columns.size)
        assertEquals(listOf("#", "Descrição do Serviço", "Qtd", "Unitário", "Total (R$)"), table.columns.map { it.header })
        assertEquals(listOf("item", "descricao", "quantidade", "precoUnitario", "totalItem"), table.columns.map { it.field })
        assertEquals("items", table.dataBinding)
        assertEquals("#F8FAFC", table.style?.headerBackground)
    }
}
