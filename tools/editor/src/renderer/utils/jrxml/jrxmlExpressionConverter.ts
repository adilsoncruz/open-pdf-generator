/**
 * Conversão e mapeamento de expressões JasperReports ($P{...}, $F{...}, ternários, métodos Java)
 * para o formato compatível com o Open PDF Generator (${...} e pipes).
 */

export interface MappedJasperExpression {
  value?: string
  dataBinding?: string
}

/**
 * Mapeia expressões JasperReports em dataBinding / value do Open PDF Generator.
 * Exemplos:
 * - $P{customerName} -> { dataBinding: 'customerName' }
 * - $F{total} -> { dataBinding: 'total' }
 * - "Number: " + $P{invoiceNumber} -> { dataBinding: "invoiceNumber | prefix:'Number: '" }
 * - $P{companyName}.toUpperCase() -> { dataBinding: "companyName | uppercase" }
 * - "ACME INC" -> { value: "ACME INC" }
 */
export function mapJasperExpression(rawExpr?: string | null): MappedJasperExpression {
  if (!rawExpr) return {}

  const expr = rawExpr
    .replace(/<!\[CDATA\[/g, '')
    .replace(/\]\]>/g, '')
    .trim()

  if (!expr) return {}

  // 1. Literal de string entre aspas: "Hello World"
  const quotedMatch = expr.match(/^"([^"]*)"$/)
  if (quotedMatch) {
    return { value: quotedMatch[1] }
  }

  // 2. Parâmetro ou campo direto: $P{field} ou $F{field}
  const pureFieldMatch = expr.match(/^\$[PF]\{([A-Za-z0-9_.]+)\}$/)
  if (pureFieldMatch) {
    return { dataBinding: pureFieldMatch[1] }
  }

  // 3. Concatenação com prefixo: "Prefix: " + $P{field}
  const prefixMatch = expr.match(/^"([^"]+)"\s*\+\s*\$[PF]\{([A-Za-z0-9_.]+)\}$/)
  if (prefixMatch) {
    return { dataBinding: `${prefixMatch[2]} | prefix:'${prefixMatch[1]}'` }
  }

  // 4. Concatenação com sufixo: $P{field} + " Suffix"
  const suffixMatch = expr.match(/^\$[PF]\{([A-Za-z0-9_.]+)\}\s*\+\s*"([^"]+)"$/)
  if (suffixMatch) {
    return { dataBinding: `${suffixMatch[1]} | suffix:'${suffixMatch[2]}'` }
  }

  // 5. Transformação de caixa: $P{field}.toUpperCase()
  const upperMatch = expr.match(/^\$[PF]\{([A-Za-z0-9_.]+)\}\.toUpperCase\(\)$/)
  if (upperMatch) {
    return { dataBinding: `${upperMatch[1]} | uppercase` }
  }

  // Transformação lowercase: $P{field}.toLowerCase()
  const lowerMatch = expr.match(/^\$[PF]\{([A-Za-z0-9_.]+)\}\.toLowerCase\(\)$/)
  if (lowerMatch) {
    return { dataBinding: `${lowerMatch[1]} | lowercase` }
  }

  // 6. Formatação de data Java: new SimpleDateFormat("dd/MM/yyyy").format($F{date})
  const dateMatch = expr.match(/new\s+(?:java\.text\.)?SimpleDateFormat\("([^"]+)"\)\.format\(\$[PF]\{([A-Za-z0-9_.]+)\}\)/)
  if (dateMatch) {
    return { dataBinding: `${dateMatch[2]} | date:'${dateMatch[1]}'` }
  }

  // 7. Formatação de número Java: new DecimalFormat("#,##0.00").format($F{amount})
  const numMatch = expr.match(/new\s+(?:java\.text\.)?DecimalFormat\("([^"]+)"\)\.format\(\$[PF]\{([A-Za-z0-9_.]+)\}\)/)
  if (numMatch) {
    return { dataBinding: `${numMatch[2]} | number:'${numMatch[1]}'` }
  }

  // 8. Substituição genérica de $F{...} e $P{...}
  const cleaned = expr.replace(/\$[PF]\{([A-Za-z0-9_.]+)\}/g, '$1')
  return { dataBinding: cleaned }
}
