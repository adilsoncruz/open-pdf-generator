# Paginação

A biblioteca oferece controle de paginação automático e manual para documentos de múltiplas páginas.

## Visão Geral

```
┌─────────────────┐   ┌─────────────────┐   ┌─────────────────┐
│   Page 1        │   │   Page 2        │   │   Page 3        │
│ ┌─────────────┐ │   │ ┌─────────────┐ │   │ ┌─────────────┐ │
│ │   Header    │ │   │ │   Header    │ │   │ │   Header    │ │
│ └─────────────┘ │   │ └─────────────┘ │   │ └─────────────┘ │
│                 │   │                 │   │                 │
│  Table Pt 1     │   │  Table Pt 2     │   │  Table Pt 3     │
│  ───────────    │   │  ───────────    │   │  ───────────    │
│  row 1          │   │  row 21         │   │  row 41         │
│  row 2          │   │  row 22         │   │  row 42         │
│  ...            │   │  ...            │   │  ...            │
│  row 20         │   │  row 40         │   │  row 50         │
│                 │   │                 │   │                 │
│ ┌─────────────┐ │   │ ┌─────────────┐ │   │ ┌─────────────┐ │
│ │   Footer    │ │   │ │   Footer    │ │   │ │   Footer    │ │
│ └─────────────┘ │   │ └─────────────┘ │   │ └─────────────┘ │
└─────────────────┘   └─────────────────┘   └─────────────────┘
```

---

## Paginação Automática

### Tabelas

Tabelas com `paginated: true` são quebradas automaticamente:

```json
{
  "type": "table",
  "id": "product-list",
  "dataBinding": "products",
  "paginated": true,
  "columns": [...]
}
```

**Comportamento:**
- ✅ Quebra automática ao atingir o fim da área útil
- ✅ O cabeçalho da tabela se repete em cada página
- ✅ Respeita `fixedHeader` e `fixedFooter`
- ✅ As linhas não são cortadas ao meio

### Valores para `paginated`

| Valor | Comportamento |
|-------|----------|
| `true` | Paginação automática (recomendado) |
| `false` | Posição fixa, sem quebra |
| `null` (omitido) | Padrão: `true` |

---

## Variáveis de Página

Use estas variáveis em qualquer texto:

| Variável | Descrição | Exemplo |
|----------|-------------|---------|
| <code v-pre>{{pageNumber}}</code> | Página atual | 1, 2, 3... |
| <code v-pre>{{totalPages}}</code> | Total de páginas | 10 |

### Exemplos de Uso

```json
{
  "type": "text",
  "value": "Page {{pageNumber}}",
  "style": { "fontSize": 9 }
}
```

**Resultado:** `Page 3`

```json
{
  "type": "text",
  "value": "{{pageNumber}} of {{totalPages}}",
  "style": { "fontSize": 9 }
}
```

**Resultado:** `3 of 10`

```json
{
  "type": "text",
  "value": "Sheet {{pageNumber}}/{{totalPages}}",
  "style": { "fontSize": 9 }
}
```

**Resultado:** `Sheet 3/10`

---

## Área Útil de Impressão

### Cálculo

```
Usable area = Page height 
            - Top margin 
            - Bottom margin 
            - Header height 
            - Footer height
```

### Exemplo (A4 Retrato)

```
A4 Page: 842pt height
Margins: 30pt (top) + 30pt (bottom) = 60pt
Header: 80pt
Footer: 50pt

Usable area = 842 - 60 - 80 - 50 = 652pt
```

A tabela ocupará no máximo 652pt por página antes de quebrar.

---

## Paginação Manual

Para controle total, use `paginated: false`:

```json
{
  "type": "table",
  "id": "summary",
  "x": 50,
  "y": 500,
  "paginated": false,
  "dataBinding": "summary",
  "columns": [...]
}
```

**Comportamento:**
- Tabela posicionada exatamente em (x, y)
- Não quebra páginas automaticamente
- Pode ser cortada se exceder a área da página

::: warning Atenção
Use `paginated: false` apenas para tabelas pequenas ou quando precisar de posicionamento exato (ex.: resumos, totais).
:::

---

## Cabeçalho da Tabela em Cada Página

Com `paginated: true`, o cabeçalho da tabela se repete automaticamente:

```json
{
  "type": "table",
  "paginated": true,
  "columns": [
    { "header": "Code", "field": "$item.code" },
    { "header": "Description", "field": "$item.description" },
    { "header": "Value", "field": "$item.value" }
  ]
}
```

**Página 1:**
```
┌─────────┬───────────────┬─────────┐
│ Code    │ Description   │ Value   │  ← Header
├─────────┼───────────────┼─────────┤
│ 001     │ Product A     │ $100    │
│ 002     │ Product B     │ $200    │
│ ...     │ ...           │ ...     │
└─────────┴───────────────┴─────────┘
```

**Página 2:**
```
┌─────────┬───────────────┬─────────┐
│ Code    │ Description   │ Value   │  ← Header repeats
├─────────┼───────────────┼─────────┤
│ 021     │ Product U     │ $500    │
│ 022     │ Product V     │ $600    │
│ ...     │ ...           │ ...     │
└─────────┴───────────────┴─────────┘
```

---

## Numeração de Páginas no Rodapé

### Exemplo Completo

```json
{
  "fixedFooter": {
    "height": 40,
    "elements": [
      {
        "type": "line",
        "x": 0,
        "y": 5,
        "x2": 535,
        "y2": 5,
        "style": {
          "color": "#e5e7eb",
          "width": 0.5
        }
      },
      {
        "type": "text",
        "x": 0,
        "y": 15,
        "value": "Confidential document",
        "style": {
          "fontSize": 8,
          "color": "#9ca3af"
        }
      },
      {
        "type": "text",
        "x": 480,
        "y": 15,
        "value": "Page {{pageNumber}} of {{totalPages}}",
        "style": {
          "fontSize": 8,
          "color": "#6b7280"
        }
      }
    ]
  }
}
```

---

## Elementos que Afetam a Paginação

### Elementos Paginados

| Elemento | Paginação |
|---------|------------|
| Table (`paginated: true`) | ✅ Automática |
| Table (`paginated: false`) | ❌ Manual |
| Loop | ❌ Não pagina automaticamente |
| Text, Image, Rectangle, Line | ❌ Posição fixa |

### Impacto do fixedHeader/Footer

```
Without header/footer:
┌─────────────────────────────────┐
│ ← Top margin (30pt)             │
│                                 │
│        Full usable area         │
│           (782pt)               │
│                                 │
│ ← Bottom margin (30pt)          │
└─────────────────────────────────┘

With header (80pt) and footer (50pt):
┌─────────────────────────────────┐
│ ← Top margin (30pt)             │
│ ┌─────────────────────────────┐ │
│ │      Header (80pt)          │ │
│ └─────────────────────────────┘ │
│                                 │
│        Reduced usable area      │
│           (652pt)               │
│                                 │
│ ┌─────────────────────────────┐ │
│ │      Footer (50pt)          │ │
│ └─────────────────────────────┘ │
│ ← Bottom margin (30pt)          │
└─────────────────────────────────┘
```

---

## Forçar Nova Página

Atualmente não há suporte nativo para forçar quebras de página. Alternativas:

### 1. Dividir os Dados

Processe os dados antecipadamente e crie templates separados:

```kotlin
val data1 = data.filter { /* first half */ }
val data2 = data.filter { /* second half */ }

generator.generate(template, data1, File("part1.pdf"))
generator.generate(template, data2, File("part2.pdf"))

// Concatenate PDFs if needed
```

### 2. Usar Múltiplas Tabelas

```json
{
  "elements": [
    {
      "type": "table",
      "dataBinding": "section1",
      "paginated": true
    },
    {
      "type": "table",
      "dataBinding": "section2",
      "paginated": true
    }
  ]
}
```

Cada tabela pode começar em uma nova página se a anterior ocupar espaço suficiente.

---

## Desempenho

### Dicas de Otimização

::: tip Otimização
1. **Limite as linhas por página**: Evite tabelas com milhares de linhas
2. **Pré-calcule os totais**: Não use transformações pesadas em cada célula
3. **Cache de imagens**: Cabeçalhos com imagens são armazenados em cache automaticamente
4. **Evite loops grandes**: Prefira tabelas para dados tabulares
:::

### Estimativa de Páginas

```kotlin
val rowsPerPage = (usableArea / rowHeight).toInt()
val totalPages = ceil(totalRows / rowsPerPage)
```

---

## Exemplos Práticos

### Relatório com Muitos Dados

```json
{
  "fixedHeader": {
    "height": 60,
    "elements": [
      {
        "type": "text",
        "value": "Sales Report - 2025"
      }
    ]
  },
  "fixedFooter": {
    "height": 30,
    "elements": [
      {
        "type": "text",
        "value": "{{pageNumber}}/{{totalPages}}"
      }
    ]
  },
  "elements": [
    {
      "type": "table",
      "dataBinding": "sales",
      "paginated": true,
      "columns": [
        { "header": "Date", "field": "$item.date | date:'dd/MM/yyyy'" },
        { "header": "Customer", "field": "$item.customer" },
        { "header": "Value", "field": "$item.value | currency:'BRL'" }
      ]
    }
  ]
}
```

### Fatura com Itens

```json
{
  "fixedHeader": {
    "height": 120,
    "elements": [...]
  },
  "fixedFooter": {
    "height": 80,
    "elements": [
      {
        "type": "text",
        "value": "Access key: {{invoice.key}}"
      },
      {
        "type": "barcode",
        "barcodeType": "qrcode",
        "dataBinding": "invoice.qrcode"
      },
      {
        "type": "text",
        "value": "Sheet {{pageNumber}} of {{totalPages}}"
      }
    ]
  },
  "elements": [
    {
      "type": "table",
      "dataBinding": "invoice.items",
      "paginated": true
    }
  ]
}
```

---

## Limitações

- ❌ Não suporta quebra de página forçada
- ❌ Loop não pagina automaticamente
- ❌ Textos longos não são quebrados entre páginas
- ❌ Imagens não são quebradas entre páginas
- ❌ Não suporta "manter junto" (manter elementos juntos)

---

## Próximos Passos

- [Cabeçalho e Rodapé](/pt/lib/guide/advanced/header-footer) - Cabeçalhos e rodapés fixos
- [Elemento Table](/pt/lib/guide/elements/table) - Detalhes da tabela paginada
- [Desempenho](/pt/lib/guide/advanced/performance) - Otimização para grandes volumes
