package com.pdfgenerator.snapshot

import com.github.adilsoncruz.pdfsnapshottesting.EnablePdfSnapshots
import com.github.adilsoncruz.pdfsnapshottesting.assertPdfByFile
import com.pdfgenerator.api.PDFGenerator
import org.junit.jupiter.api.DisplayName
import org.junit.jupiter.api.Test

@EnablePdfSnapshots
class TransformationsSnapshotTest {

    private val generator = PDFGenerator()

    @Test
    @DisplayName("Transformations: Complete catalog covering all 25+ string, math, date, and collection filters")
    fun testAllTransformationsCatalog() {
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
              "id": "header-title",
              "x": 36,
              "y": 36,
              "value": "Transformations Catalog: Complete Built-in Engine",
              "style": { "fontSize": 15, "fontWeight": "bold", "color": "#1e293b" }
            },
            {
              "type": "text",
              "id": "header-sub",
              "x": 36,
              "y": 56,
              "value": "Exhaustive verification of string, numeric, mathematical, date, collection and chaining filters.",
              "style": { "fontSize": 8.5, "color": "#64748b" }
            },
            {
              "type": "text",
              "id": "sec-strings",
              "x": 36,
              "y": 78,
              "value": "1. STRING TRANSFORMATIONS",
              "style": { "fontSize": 9.5, "fontWeight": "bold", "color": "#4338ca" }
            },
            {
              "type": "text",
              "id": "t-upper",
              "x": 36,
              "y": 94,
              "value": "• uppercase: ${'$'}{rawText | uppercase} | upper alias: ${'$'}{rawText | upper}",
              "style": { "fontSize": 8, "color": "#334155" }
            },
            {
              "type": "text",
              "id": "t-lower",
              "x": 36,
              "y": 108,
              "value": "• lowercase: ${'$'}{mixedText | lowercase} | lower alias: ${'$'}{mixedText | lower}",
              "style": { "fontSize": 8, "color": "#334155" }
            },
            {
              "type": "text",
              "id": "t-cap",
              "x": 36,
              "y": 122,
              "value": "• capitalize: ${'$'}{lowerSentence | capitalize} | cap alias: ${'$'}{lowerSentence | cap}",
              "style": { "fontSize": 8, "color": "#334155" }
            },
            {
              "type": "text",
              "id": "t-trim",
              "x": 36,
              "y": 136,
              "value": "• trim: [${'$'}{paddedText | trim}] (whitespaces stripped cleanly)",
              "style": { "fontSize": 8, "color": "#334155" }
            },
            {
              "type": "text",
              "id": "t-truncate",
              "x": 36,
              "y": 150,
              "value": "• truncate: ${'$'}{longText | truncate(25, '...')} | colon: ${'$'}{longText | truncate:20:'[+]'}",
              "style": { "fontSize": 8, "color": "#334155" }
            },
            {
              "type": "text",
              "id": "t-pad",
              "x": 36,
              "y": 164,
              "value": "• padLeft: [${'$'}{idNumber | padLeft(8, '0')}] | padRight: [${'$'}{idNumber | padRight(8, '.')}]",
              "style": { "fontSize": 8, "color": "#334155" }
            },
            {
              "type": "text",
              "id": "t-replace",
              "x": 36,
              "y": 178,
              "value": "• replace: ${'$'}{envMode | replace('dev', 'production')}",
              "style": { "fontSize": 8, "color": "#334155" }
            },
            {
              "type": "text",
              "id": "t-affixes",
              "x": 36,
              "y": 192,
              "value": "• prefix: ${'$'}{invoiceRef | prefix('INV-')} | suffix: ${'$'}{invoiceRef | suffix('-2026')}",
              "style": { "fontSize": 8, "color": "#334155" }
            },
            {
              "type": "text",
              "id": "t-reverse",
              "x": 36,
              "y": 206,
              "value": "• reverse: ${'$'}{rawText | reverse}",
              "style": { "fontSize": 8, "color": "#334155" }
            },
            {
              "type": "text",
              "id": "sec-math",
              "x": 36,
              "y": 226,
              "value": "2. NUMERIC & MATHEMATICAL TRANSFORMATIONS",
              "style": { "fontSize": 9.5, "fontWeight": "bold", "color": "#047857" }
            },
            {
              "type": "text",
              "id": "t-curr-brl",
              "x": 36,
              "y": 242,
              "value": "• currency (default BRL): ${'$'}{subtotal | currency} | USD: ${'$'}{subtotal | currency('USD')}",
              "style": { "fontSize": 8, "color": "#334155" }
            },
            {
              "type": "text",
              "id": "t-curr-eur",
              "x": 36,
              "y": 256,
              "value": "• currency EUR: ${'$'}{subtotal | currency('EUR')}",
              "style": { "fontSize": 8, "color": "#334155" }
            },
            {
              "type": "text",
              "id": "t-format",
              "x": 36,
              "y": 270,
              "value": "• format pattern: ${'$'}{subtotal | format('#,##0.0000', 'en-US')} | format BR: ${'$'}{subtotal | format('#,##0.00', 'pt-BR')}",
              "style": { "fontSize": 8, "color": "#334155" }
            },
            {
              "type": "text",
              "id": "t-numfmt",
              "x": 36,
              "y": 284,
              "value": "• numberFormat: ${'$'}{subtotal | numberFormat('pt-BR')} | numfmt alias: ${'$'}{subtotal | numfmt('en-US')}",
              "style": { "fontSize": 8, "color": "#334155" }
            },
            {
              "type": "text",
              "id": "t-math-ops",
              "x": 36,
              "y": 298,
              "value": "• abs: ${'$'}{negativeValue | abs} | round(2): ${'$'}{piVal | round(2)} | floor: ${'$'}{piVal | floor} | ceil: ${'$'}{piVal | ceil}",
              "style": { "fontSize": 8, "color": "#334155" }
            },
            {
              "type": "text",
              "id": "sec-collections",
              "x": 36,
              "y": 318,
              "value": "3. COLLECTIONS & DATES TRANSFORMATIONS",
              "style": { "fontSize": 9.5, "fontWeight": "bold", "color": "#b45309" }
            },
            {
              "type": "text",
              "id": "t-join",
              "x": 36,
              "y": 334,
              "value": "• join default: ${'$'}{tags | join} | join custom separator: ${'$'}{tags | join(' • ')}",
              "style": { "fontSize": 8, "color": "#334155" }
            },
            {
              "type": "text",
              "id": "t-first-last",
              "x": 36,
              "y": 348,
              "value": "• first: ${'$'}{tags | first} | last: ${'$'}{tags | last} | length of list: ${'$'}{tags | length} | len string: ${'$'}{rawText | len}",
              "style": { "fontSize": 8, "color": "#334155" }
            },
            {
              "type": "text",
              "id": "t-dates",
              "x": 36,
              "y": 362,
              "value": "• date ISO to dd/MM/yyyy: ${'$'}{createdDate | date('dd/MM/yyyy')} | date custom: ${'$'}{createdDate | date('yyyy-MM-dd')}",
              "style": { "fontSize": 8, "color": "#334155" }
            },
            {
              "type": "text",
              "id": "sec-utilities",
              "x": 36,
              "y": 382,
              "value": "4. UTILITIES, FALLBACKS & PIPELINE CHAINING",
              "style": { "fontSize": 9.5, "fontWeight": "bold", "color": "#be123c" }
            },
            {
              "type": "text",
              "id": "t-default",
              "x": 36,
              "y": 398,
              "value": "• default present: ${'$'}{existingField | default('N/A')} | default missing: ${'$'}{missingField | default('FALLBACK_VALUE')}",
              "style": { "fontSize": 8, "color": "#334155" }
            },
            {
              "type": "text",
              "id": "t-concat",
              "x": 36,
              "y": 412,
              "value": "• concat: ${'$'}{userFirstName | concat(' ', 'Santos', 'Cruz')}",
              "style": { "fontSize": 8, "color": "#334155" }
            },
            {
              "type": "text",
              "id": "t-chained",
              "x": 36,
              "y": 426,
              "value": "• chained (trim | uppercase | prefix): ${'$'}{dirtyInput | trim | uppercase | prefix('CERT-')}",
              "style": { "fontSize": 8, "fontWeight": "bold", "color": "#4338ca" }
            }
          ]
        }
        """.trimIndent()

        val dataJson = """
        {
          "rawText": "open pdf generator",
          "mixedText": "ReAcT & eLeCtRoN aPpLiCaTiOn",
          "lowerSentence": "enterprise high throughput document rendering engine",
          "paddedText": "   untrimmed content with margins   ",
          "longText": "High density dynamic reporting system with automatic pagination",
          "idNumber": "7429",
          "envMode": "dev-environment",
          "invoiceRef": "99214",
          "subtotal": 12450.85,
          "negativeValue": -450.75,
          "piVal": 3.14159265,
          "tags": ["Finance", "Audit", "Compliance", "Verified"],
          "createdDate": "2026-10-22",
          "existingField": "Active Record",
          "userFirstName": "Adilson",
          "dirtyInput": "   validated release payload   "
        }
        """.trimIndent()

        val pdfBytes = generator.generate(templateJson, dataJson)
        assertPdfByFile("transformations/all-transformations-catalog.pdf", pdfBytes)
    }

    @Test
    @DisplayName("Transformations: Mustache double-curly and dollar-bracket expressions")
    fun testTemplateInterpolationFormats() {
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
              "id": "title",
              "x": 36,
              "y": 36,
              "value": "Dual Syntax Interpolation: Mustache {{...}} & Dollar ${'$'}{...}",
              "style": { "fontSize": 15, "fontWeight": "bold", "color": "#0f172a" }
            },
            {
              "type": "text",
              "id": "mustache-demo",
              "x": 36,
              "y": 65,
              "value": "Client: {{account.holder | uppercase}} | Account: {{account.number | padLeft(10, '0')}} | Balance: {{account.balance | currency}}",
              "style": { "fontSize": 10, "color": "#1e293b", "backgroundColor": "#f8fafc" }
            },
            {
              "type": "text",
              "id": "dollar-demo",
              "x": 36,
              "y": 95,
              "value": "Client: ${'$'}{account.holder | uppercase} | Account: ${'$'}{account.number | padLeft(10, '0')} | Balance: ${'$'}{account.balance | currency}",
              "style": { "fontSize": 10, "color": "#1e293b", "backgroundColor": "#e0e7ff" }
            },
            {
              "type": "text",
              "id": "mixed-inline",
              "x": 36,
              "y": 125,
              "value": "Status: {{status.code | upper}} (Report generated on ${'$'}{reportDate | date('yyyy-MM-dd')})",
              "style": { "fontSize": 9.5, "fontWeight": "bold", "color": "#047857" }
            }
          ]
        }
        """.trimIndent()

        val dataJson = """
        {
          "account": {
            "holder": "Atlas Global Logistics Ltd",
            "number": "89314",
            "balance": 87520.40
          },
          "status": {
            "code": "audit_completed"
          },
          "reportDate": "2026-10-22"
        }
        """.trimIndent()

        val pdfBytes = generator.generate(templateJson, dataJson)
        assertPdfByFile("transformations/template-interpolation-formats.pdf", pdfBytes)
    }
}
