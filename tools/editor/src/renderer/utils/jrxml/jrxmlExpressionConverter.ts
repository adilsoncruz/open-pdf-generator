/**
 * Conversão e mapeamento de expressões JasperReports ($P{...}, $F{...}, $V{...}, ternários, métodos Java)
 * para o formato compatível com o Open PDF Generator (${...} e pipes).
 */

export interface MappedJasperExpression {
  value?: string
  dataBinding?: string
}

export function normalizeJasperVar(name: string): string {
  return name === 'PAGE_NUMBER' ? 'pageNumber' : name
}

/**
 * Mapeia expressões JasperReports em dataBinding / value do Open PDF Generator.
 * Exemplos:
 * - $P{customerName} -> { dataBinding: 'customerName' }
 * - $F{total} -> { dataBinding: 'total' }
 * - $V{PAGE_NUMBER} -> { dataBinding: 'pageNumber' }
 * - "Página " + $V{PAGE_NUMBER} -> { dataBinding: "pageNumber | prefix:'Página '" }
 * - $V{PAGE_NUMBER} + " de " -> { dataBinding: "pageNumber | suffix:' de '" }
 * - "Página " + $V{PAGE_NUMBER} + " de " + $P{total} -> { value: "Página ${pageNumber} de ${total}" }
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

  // 2. Parâmetro, campo ou variável direta: $P{field}, $F{field}, $V{PAGE_NUMBER}
  const pureFieldMatch = expr.match(/^\$[PFV]\{([A-Za-z0-9_.]+)\}$/)
  if (pureFieldMatch) {
    return { dataBinding: normalizeJasperVar(pureFieldMatch[1]) }
  }

  // 3. Concatenação com prefixo: "Prefix: " + $P{field} ou "Página " + $V{PAGE_NUMBER}
  const prefixMatch = expr.match(/^"([^"]+)"\s*\+\s*\$[PFV]\{([A-Za-z0-9_.]+)\}$/)
  if (prefixMatch) {
    return { dataBinding: `${normalizeJasperVar(prefixMatch[2])} | prefix:'${prefixMatch[1]}'` }
  }

  // 4. Concatenação com sufixo: $P{field} + " Suffix" ou $V{PAGE_NUMBER} + " de "
  const suffixMatch = expr.match(/^\$[PFV]\{([A-Za-z0-9_.]+)\}\s*\+\s*"([^"]+)"$/)
  if (suffixMatch) {
    return { dataBinding: `${normalizeJasperVar(suffixMatch[1])} | suffix:'${suffixMatch[2]}'` }
  }

  // 5. Transformação de caixa: $P{field}.toUpperCase()
  const upperMatch = expr.match(/^\$[PFV]\{([A-Za-z0-9_.]+)\}\.toUpperCase\(\)$/)
  if (upperMatch) {
    return { dataBinding: `${normalizeJasperVar(upperMatch[1])} | uppercase` }
  }

  // Transformação lowercase: $P{field}.toLowerCase()
  const lowerMatch = expr.match(/^\$[PFV]\{([A-Za-z0-9_.]+)\}\.toLowerCase\(\)$/)
  if (lowerMatch) {
    return { dataBinding: `${normalizeJasperVar(lowerMatch[1])} | lowercase` }
  }

  // 6. Formatação de data Java: new SimpleDateFormat("dd/MM/yyyy").format($F{date})
  const dateMatch = expr.match(/new\s+(?:java\.text\.)?SimpleDateFormat\("([^"]+)"\)\.format\(\$[PFV]\{([A-Za-z0-9_.]+)\}\)/)
  if (dateMatch) {
    return { dataBinding: `${normalizeJasperVar(dateMatch[2])} | date:'${dateMatch[1]}'` }
  }

  // 7. Formatação de número Java: new DecimalFormat("#,##0.00").format($F{amount})
  const numMatch = expr.match(/new\s+(?:java\.text\.)?DecimalFormat\("([^"]+)"\)\.format\(\$[PFV]\{([A-Za-z0-9_.]+)\}\)/)
  if (numMatch) {
    return { dataBinding: `${normalizeJasperVar(numMatch[2])} | number:'${numMatch[1]}'` }
  }

  // 8. Concatenações gerais com + e strings (ex: "Página " + $V{PAGE_NUMBER} + " de " + $P{total})
  if (expr.includes('+') && /\$[PFV]\{([A-Za-z0-9_.]+)\}/.test(expr)) {
    const parts = expr.split('+')
    let isValidConcat = true
    let interpolated = ''
    for (const part of parts) {
      const p = part.trim()
      if (p.startsWith('"') && p.endsWith('"') && p.length >= 2) {
        interpolated += p.substring(1, p.length - 1)
      } else {
        const varMatch = p.match(/^\$[PFV]\{([A-Za-z0-9_.]+)\}$/)
        if (varMatch) {
          interpolated += `\${${normalizeJasperVar(varMatch[1])}}`
        } else {
          isValidConcat = false
          break
        }
      }
    }
    if (isValidConcat) {
      return { value: interpolated }
    }
  }

  // 9. Substituição genérica de $F{...}, $P{...} e $V{...}
  const cleaned = expr.replace(/\$[PFV]\{([A-Za-z0-9_.]+)\}/g, (_, name) => normalizeJasperVar(name))
  return { dataBinding: cleaned }
}
