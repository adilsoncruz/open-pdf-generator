import { describe, it, expect } from 'vitest'
import fs from 'fs'
import path from 'path'
import { convertJrxmlToTemplate, mapJasperExpression } from './jrxmlImporter'

describe('jrxmlImporter', () => {
  describe('mapJasperExpression', () => {
    it('maps pure parameter expression', () => {
      expect(mapJasperExpression('$P{customerName}')).toEqual({
        dataBinding: 'customerName',
      })
    })

    it('maps pure field expression', () => {
      expect(mapJasperExpression('$F{unitPrice}')).toEqual({
        dataBinding: 'unitPrice',
      })
    })

    it('maps prefix string concatenation', () => {
      expect(mapJasperExpression('"Number: " + $P{invoiceNumber}')).toEqual({
        dataBinding: "invoiceNumber | prefix:'Number: '",
      })
    })

    it('maps suffix string concatenation', () => {
      expect(mapJasperExpression('$P{amount} + " USD"')).toEqual({
        dataBinding: "amount | suffix:' USD'",
      })
    })

    it('maps uppercase method call', () => {
      expect(mapJasperExpression('$P{companyName}.toUpperCase()')).toEqual({
        dataBinding: 'companyName | uppercase',
      })
    })

    it('maps quoted literal string as value', () => {
      expect(mapJasperExpression('"INVOICE"')).toEqual({
        value: 'INVOICE',
      })
    })
  })

  describe('convertJrxmlToTemplate', () => {
    const sampleJrxml = `<?xml version="1.0" encoding="UTF-8"?>
<jasperReport xmlns="http://jasperreports.sourceforge.net/jasperreports"
              name="invoice" pageWidth="595" pageHeight="842" columnWidth="523"
              leftMargin="36" rightMargin="36" topMargin="36" bottomMargin="36">
    <parameter name="invoiceNumber" class="java.lang.String"/>
    <parameter name="customerName" class="java.lang.String"/>

    <background>
        <band height="770">
            <staticText>
                <reportElement x="50" y="280" width="450" height="100" forecolor="#E0E7FF"/>
                <textElement textAlignment="Center">
                    <font size="48" isBold="true"/>
                </textElement>
                <text><![CDATA[DRAFT COPY]]></text>
            </staticText>
        </band>
    </background>

    <pageHeader>
        <band height="35">
            <textField>
                <reportElement x="0" y="5" width="200" height="20" forecolor="#1E293B"/>
                <textFieldExpression><![CDATA["Report: " + $P{invoiceNumber}]]></textFieldExpression>
            </textField>
        </band>
    </pageHeader>

    <title>
        <band height="100">
            <staticText>
                <reportElement x="0" y="0" width="300" height="25" forecolor="#1E293B"/>
                <textElement>
                    <font size="18" isBold="true"/>
                </textElement>
                <text><![CDATA[ACME ENTERPRISE SOLUTIONS]]></text>
            </staticText>
            <textField>
                <reportElement x="323" y="28" width="200" height="14" forecolor="#64748B"/>
                <textElement textAlignment="Right"/>
                <textFieldExpression><![CDATA["Number: " + $P{invoiceNumber}]]></textFieldExpression>
            </textField>
            <line>
                <reportElement x="0" y="65" width="523" height="1" forecolor="#E2E8F0"/>
            </line>
            <componentElement>
                <reportElement x="440" y="0" width="60" height="60"/>
                <jr:QRCode xmlns:jr="http://jasperreports.sourceforge.net/jasperreports/components">
                    <![CDATA[$P{invoiceNumber}]]>
                </jr:QRCode>
            </componentElement>
        </band>
    </title>

    <pageFooter>
        <band height="25">
            <staticText>
                <reportElement x="0" y="5" width="100" height="15"/>
                <text><![CDATA[Footer Text]]></text>
            </staticText>
        </band>
    </pageFooter>
</jasperReport>`

    it('converts complete JRXML to Open PDF Generator template schema', () => {
      const template = convertJrxmlToTemplate(sampleJrxml)

      expect(template.version).toBe('1.0')
      expect(template.metadata.name).toBe('invoice')
      expect(template.pageSettings.size).toBe('A4')
      expect(template.pageSettings.orientation).toBe('portrait')
      expect(template.pageSettings.margins).toEqual({
        top: 36,
        right: 36,
        bottom: 36,
        left: 36,
      })

      // Watermark from background band
      expect(template.pageSettings.watermark).toBeDefined()
      expect(template.pageSettings.watermark?.text).toBe('DRAFT COPY')
      expect(template.pageSettings.watermark?.fontSize).toBe(48)
      expect(template.pageSettings.watermark?.color).toBe('#e0e7ff')

      // Header from pageHeader band
      expect(template.pageSettings.header).toBeDefined()
      expect(template.pageSettings.header?.height).toBe(35)
      expect(template.pageSettings.header?.elements.length).toBe(1)
      expect(template.pageSettings.header?.elements[0].dataBinding).toBe("invoiceNumber | prefix:'Report: '")

      // Body elements from title band
      expect(template.page.length).toBe(4) // staticText, textField, line, qrcode

      const staticTxt = template.page.find(e => e.type === 'text' && e.value === 'ACME ENTERPRISE SOLUTIONS')
      expect(staticTxt).toBeDefined()
      expect(staticTxt?.x).toBe(0)
      expect(staticTxt?.y).toBe(0)
      expect(staticTxt?.style?.fontSize).toBe(18)
      expect(staticTxt?.style?.bold).toBe(true)

      const dynTxt = template.page.find(e => e.type === 'text' && e.dataBinding === "invoiceNumber | prefix:'Number: '")
      expect(dynTxt).toBeDefined()
      expect(dynTxt?.x).toBe(323)
      expect(dynTxt?.style?.alignment).toBe('right')

      const lineElem = template.page.find(e => e.type === 'line')
      expect(lineElem).toBeDefined()
      expect(lineElem?.width).toBe(523)

      const qrElem = template.page.find(e => e.type === 'qrcode')
      expect(qrElem).toBeDefined()
      expect(qrElem?.dataBinding).toBe('invoiceNumber')

      // Footer from pageFooter band
      expect(template.pageSettings.footer).toBeDefined()
      expect(template.pageSettings.footer?.height).toBe(25)
      expect(template.pageSettings.footer?.elements[0].value).toBe('Footer Text')
    })

    it('throws error for invalid XML', () => {
      expect(() => convertJrxmlToTemplate('<invalid><unclosed>')).toThrow()
    })

    it('throws error if jasperReport root is missing', () => {
      expect(() => convertJrxmlToTemplate('<?xml version="1.0"?><otherRoot></otherRoot>')).toThrow(
        /tag raiz <jasperReport> não encontrada/
      )
    })

    it('converts real benchmark invoice.jrxml file cleanly', () => {
      const filePath = path.resolve(__dirname, '../../../../../benchmark/jasper6/src/main/resources/templates/jasper/invoice.jrxml')
      if (fs.existsSync(filePath)) {
        const content = fs.readFileSync(filePath, 'utf-8')
        const template = convertJrxmlToTemplate(content)
        expect(template.version).toBe('1.0')
        expect(template.metadata.name).toBe('invoice')
        expect(template.pageSettings.size).toBe('A4')
        expect(template.page.length).toBeGreaterThan(5)
      }
    })

    it('converts real benchmark complex.jrxml file cleanly', () => {
      const filePath = path.resolve(__dirname, '../../../../../benchmark/jasper6/src/main/resources/templates/jasper/complex.jrxml')
      if (fs.existsSync(filePath)) {
        const content = fs.readFileSync(filePath, 'utf-8')
        const template = convertJrxmlToTemplate(content)
        expect(template.version).toBe('1.0')
        expect(template.pageSettings.watermark?.text).toBe('ORIGINAL COPY')
        expect(template.page.some(e => e.type === 'qrcode')).toBe(true)
      }
    })

    it('converts sample fatura_servico.jrxml cleanly', () => {
      const filePath = path.resolve(__dirname, '../../../samples/jasper/fatura_servico.jrxml')
      expect(fs.existsSync(filePath)).toBe(true)
      const content = fs.readFileSync(filePath, 'utf-8')
      const template = convertJrxmlToTemplate(content)
      expect(template.metadata.name).toBe('fatura_servico')
      expect(template.pageSettings.size).toBe('A4')
      expect(template.pageSettings.footer).toBeDefined()
      expect(template.summaryPage).toBeDefined()
      expect(template.summaryPage?.elements.some(e => e.type === 'qrcode')).toBe(true)
    })

    it('converts sample relatorio_pedidos.jrxml cleanly', () => {
      const filePath = path.resolve(__dirname, '../../../samples/jasper/relatorio_pedidos.jrxml')
      expect(fs.existsSync(filePath)).toBe(true)
      const content = fs.readFileSync(filePath, 'utf-8')
      const template = convertJrxmlToTemplate(content)
      expect(template.metadata.name).toBe('relatorio_pedidos')
      expect(template.pageSettings.header).toBeDefined()
      expect(template.pageSettings.footer).toBeDefined()
      expect(template.page.length).toBeGreaterThan(5)
    })

    it('converts sample certificado_conclusao.jrxml with landscape orientation', () => {
      const filePath = path.resolve(__dirname, '../../../samples/jasper/certificado_conclusao.jrxml')
      expect(fs.existsSync(filePath)).toBe(true)
      const content = fs.readFileSync(filePath, 'utf-8')
      const template = convertJrxmlToTemplate(content)
      expect(template.metadata.name).toBe('certificado_conclusao')
      expect(template.pageSettings.size).toBe('A4')
      expect(template.pageSettings.orientation).toBe('landscape')
      expect(template.pageSettings.watermark?.text).toBe('CERTIFICADO')
      expect(template.page.some(e => e.type === 'barcode')).toBe(true)
    })
  })
})
