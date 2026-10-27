/**
 * Re-export para retrocompatibilidade com imports existentes de jrxmlImporter.
 * O módulo foi dividido internamente em:
 * - jrxml/jrxmlImporter.ts (orquestrador principal)
 * - jrxml/jrxmlBandParser.ts (parser de bandas e elementos gráficos/visuais)
 * - jrxml/jrxmlExpressionConverter.ts (conversão de expressões Jasper para sintaxe OpenPDF)
 */

export * from './jrxml'
