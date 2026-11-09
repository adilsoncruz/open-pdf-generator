package io.pdfgenerator.cli.converter.jasper

import com.github.adilsoncruz.pdfsnapshottesting.EnablePdfSnapshots
import com.github.adilsoncruz.pdfsnapshottesting.assertPdfByFile
import com.pdfgenerator.api.PDFGenerator
import org.junit.jupiter.api.DisplayName
import org.junit.jupiter.api.Test
import java.io.File

/**
 * End-to-end visual regression tests for the JasperReports (.jrxml) converter.
 *
 * Pipeline under test:
 * `.jrxml` -> [JasperTemplateConverter] -> JSON `Template` -> [PDFGenerator.generate] -> PDF Snapshot comparison.
 */
@EnablePdfSnapshots
class JasperPdfSnapshotTest {
    private val generator = PDFGenerator()

    private fun resolvePath(vararg candidates: String): File =
        candidates.map { File(it) }.firstOrNull { it.exists() }
            ?: error("Could not find sample file in candidates: ${candidates.joinToString()}")

    @Test
    @DisplayName("Snapshot E2E: benchmark/jasper6/invoice.jrxml converted and rendered to PDF")
    fun testJasper6InvoiceSnapshot() {
        val jrxmlFile =
            resolvePath(
                "benchmark/jasper6/src/main/resources/templates/jasper/invoice.jrxml",
                "../../benchmark/jasper6/src/main/resources/templates/jasper/invoice.jrxml",
            )

        val template = JasperTemplateConverter.fromFile(jrxmlFile.absolutePath)
        val templateJson = template.toJson()

        val dataJson =
            """
            {
              "invoiceNumber": "INV-2026-000001",
              "date": "2026-10-21",
              "customerName": "Customer #1 Global Industries",
              "customerEmail": "client-1@globalcorp.internal",
              "customerAddress": "1 Enterprise Way, Suite 400, Austin, TX",
              "subtotal": 2355.0,
              "tax": 235.5,
              "total": 2590.5,
              "items": [
                { "description": "Item #1 - Enterprise Module Pack (Batch #1)", "quantity": 3, "unitPrice": 16.0, "total": 48.0 },
                { "description": "Item #2 - Enterprise Module Pack (Batch #1)", "quantity": 4, "unitPrice": 31.0, "total": 124.0 },
                { "description": "Item #3 - Enterprise Module Pack (Batch #1)", "quantity": 5, "unitPrice": 46.0, "total": 230.0 },
                { "description": "Item #4 - Enterprise Module Pack (Batch #1)", "quantity": 1, "unitPrice": 61.0, "total": 61.0 },
                { "description": "Item #5 - Enterprise Module Pack (Batch #1)", "quantity": 2, "unitPrice": 76.0, "total": 152.0 },
                { "description": "Item #6 - Enterprise Module Pack (Batch #1)", "quantity": 3, "unitPrice": 91.0, "total": 273.0 },
                { "description": "Item #7 - Enterprise Module Pack (Batch #1)", "quantity": 4, "unitPrice": 106.0, "total": 424.0 },
                { "description": "Item #8 - Enterprise Module Pack (Batch #1)", "quantity": 5, "unitPrice": 121.0, "total": 605.0 },
                { "description": "Item #9 - Enterprise Module Pack (Batch #1)", "quantity": 1, "unitPrice": 136.0, "total": 136.0 },
                { "description": "Item #10 - Enterprise Module Pack (Batch #1)", "quantity": 2, "unitPrice": 151.0, "total": 302.0 }
              ]
            }
            """.trimIndent()

        val pdfBytes = generator.generate(templateJson, dataJson)
        assertPdfByFile("jasper/jasper6-invoice.pdf", pdfBytes)
    }

    @Test
    @DisplayName("Snapshot E2E: fatura_servico.jrxml converted and rendered to PDF")
    fun testFaturaServicoSnapshot() {
        val jrxmlFile =
            resolvePath(
                "tools/editor/samples/jasper/fatura_servico.jrxml",
                "../editor/samples/jasper/fatura_servico.jrxml",
                "../../tools/editor/samples/jasper/fatura_servico.jrxml",
            )

        val template = JasperTemplateConverter.fromFile(jrxmlFile.absolutePath)
        val templateJson = template.toJson()

        val dataJson =
            """
            {
              "numeroFatura": "FAT-2026-089",
              "dataEmissao": "09/11/2026",
              "vencimento": "20/11/2026",
              "nomeCliente": "Horizon Sistemas S.A.",
              "documentoCliente": "CNPJ: 45.987.123/0001-10",
              "enderecoCliente": "Av. Paulista, 1000 - São Paulo, SP",
              "valorTotal": "R$ 4.850,00",
              "chavePix": "00020126360014BR.GOV.BCB.PIX0114+55119999999995204000053039865802BR",
              "items": [
                {
                  "item": 1,
                  "descricao": "Assinatura Plataforma Enterprise",
                  "quantidade": 1,
                  "precoUnitario": "3.500,00",
                  "totalItem": "3.500,00"
                },
                {
                  "item": 2,
                  "descricao": "Pacote Adicional de Processamento PDF",
                  "quantidade": 3,
                  "precoUnitario": "450,00",
                  "totalItem": "1.350,00"
                }
              ]
            }
            """.trimIndent()

        val pdfBytes = generator.generate(templateJson, dataJson)
        assertPdfByFile("jasper/fatura-servico.pdf", pdfBytes)
    }

    @Test
    @DisplayName("Snapshot E2E: relatorio_pedidos.jrxml converted and rendered to PDF")
    fun testRelatorioPedidosSnapshot() {
        val jrxmlFile =
            resolvePath(
                "tools/editor/samples/jasper/relatorio_pedidos.jrxml",
                "../editor/samples/jasper/relatorio_pedidos.jrxml",
                "../../tools/editor/samples/jasper/relatorio_pedidos.jrxml",
            )

        val template =
            JasperTemplateConverter.fromFile(
                jrxmlFile.absolutePath,
                JasperConversionOptions(defaultItemsBinding = "pedidos"),
            )
        val templateJson = template.toJson()

        val dataJson =
            """
            {
              "nomeEmpresa": "Open PDF E-Commerce",
              "periodoRelatorio": "01/11/2026 a 09/11/2026",
              "geradoEm": "09/11/2026 08:30",
              "totalGeral": "R$ 3.420,00",
              "pedidos": [
                {
                  "idPedido": "#1042",
                  "cliente": "Ana Carolina Souza",
                  "dataPedido": "03/11/2026",
                  "status": "APROVADO",
                  "valor": "1.200,00"
                },
                {
                  "idPedido": "#1043",
                  "cliente": "Carlos Eduardo Lima",
                  "dataPedido": "05/11/2026",
                  "status": "ENVIADO",
                  "valor": "2.220,00"
                }
              ]
            }
            """.trimIndent()

        val pdfBytes = generator.generate(templateJson, dataJson)
        assertPdfByFile("jasper/relatorio-pedidos.pdf", pdfBytes)
    }
}
