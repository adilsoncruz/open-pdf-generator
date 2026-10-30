# Elemento Table

O `TableElement` renderiza dados tabulares com suporte a paginação automática, cabeçalhos fixos e estilos personalizáveis.

## Funcionalidades

- ✅ **Paginação automática**: Os cabeçalhos se repetem em cada página
- ✅ **Largura flexível**: Suporta valores fixos, percentuais ou automáticos
- ✅ **Linhas zebra**: Cores alternadas entre linhas
- ✅ **Estilos personalizáveis**: Cores, bordas, fontes, alinhamentos
- ✅ **Transformações**: Aplica pipes aos dados das células
- ✅ **Responsivo**: Ajuste automático da largura das colunas

---

## Propriedades

| Propriedade | Tipo | Obrigatório | Descrição |
|-------------|------|-------------|-----------|
| `type` | string | ✅ | Deve ser `"table"` |
| `id` | string | ✅ | Identificador único |
| `x` | number | ✅ | Posição X |
| `y` | number | ✅ | Posição Y (ignorada se `paginated=true`) |
| `dataBinding` | string | ✅ | Caminho para o array de dados |
| `columns` | array | ✅ | Definições das colunas |
| `width` | number\|string | ❌ | Largura (número, "100%" ou auto) |
| `paginated` | boolean | ❌ | Paginação automática (padrão: `true`) |
| `style` | object | ❌ | Estilos da tabela |
| `printCondition` | string | ❌ | Condição para renderizar |

---

## Colunas

Cada coluna possui as seguintes propriedades:

| Propriedade | Tipo | Obrigatório | Descrição |
|-------------|------|-------------|-----------|
| `header` | string | ✅ | Texto do cabeçalho |
| `field` | string | ✅ | Campo de data binding (pode usar `$item`) |
| `width` | number | ❌ | Largura da coluna |
| `alignment` | string | ❌ | Alinhamento horizontal (`left`, `center`, `right`) |
| `verticalAlignment` | string | ❌ | Alinhamento vertical (`top`, `middle`, `bottom`) |
| `headerAlignment` | string | ❌ | Alinhamento do cabeçalho (sobrepõe `alignment`) |
| `format` | string | ❌ | Formato (`text`, `number`, `currency`) |

---

## Exemplo Básico

```json
{
  "type": "table",
  "id": "products-table",
  "x": 30,
  "y": 150,
  "dataBinding": "products",
  "columns": [
    {
      "header": "Code",
      "field": "code",
      "width": 80,
      "alignment": "center"
    },
    {
      "header": "Product",
      "field": "name",
      "width": 200,
      "alignment": "left"
    },
    {
      "header": "Price",
      "field": "price",
      "width": 100,
      "alignment": "right"
    }
  ]
}
```

**Dados:**
```json
{
  "products": [
    { "code": "001", "name": "Notebook", "price": 3500.00 },
    { "code": "002", "name": "Mouse", "price": 50.00 },
    { "code": "003", "name": "Keyboard", "price": 150.00 }
  ]
}
```

---

## Transformações nas Colunas

Use pipes em `field` para transformar os dados:

```json
{
  "columns": [
    {
      "header": "Name",
      "field": "$item.name | upperCase"
    },
    {
      "header": "Price",
      "field": "$item.price | currency:'BRL'"
    },
    {
      "header": "Date",
      "field": "$item.date | date:'dd/MM/yyyy'"
    },
    {
      "header": "Code",
      "field": "$item.code | padLeft:6:'0'"
    }
  ]
}
```

---

## Largura da Tabela

### Valor Fixo

```json
{
  "width": 535
}
```

### Percentual

```json
{
  "width": "100%"
}
```

Usa 100% da largura disponível (página menos as margens).

### Auto

```json
{
  "width": null
}
```

Ou simplesmente omita a propriedade. Usa a soma das larguras das colunas.

---

## Paginação

### Automática (padrão)

```json
{
  "paginated": true
}
```

- ✅ A tabela quebra automaticamente entre as páginas
- ✅ O cabeçalho se repete em cada nova página
- ✅ Respeita margens e cabeçalho/rodapé fixos
- ✅ Recomendado para tabelas longas

### Desativada

```json
{
  "paginated": false
}
```

- ⚠️ Usa posicionamento fixo (X, Y)
- ⚠️ Não quebra páginas automaticamente
- ⚠️ Pode ser cortada no fim da página
- ✅ Use para tabelas pequenas ou resumos

---

## Estilos

### Propriedades de Estilo

```json
{
  "style": {
    "headerBackground": "#2563eb",
    "headerColor": "#ffffff",
    "headerFontSize": 10,
    "headerFontWeight": "bold",
    "headerAlignment": "center",
    
    "fontSize": 9,
    "cellColor": "#374151",
    "cellBackground": "#ffffff",
    "alternateRowBackground": "#f3f4f6",
    
    "borderColor": "#d1d5db",
    "borderWidth": 0.5,
    "cellBorderType": "all",
    
    "cellPadding": 6,
    "rowHeight": 25
  }
}
```

### Cabeçalho

| Propriedade | Descrição | Padrão |
|-------------|-----------|--------|
| `headerBackground` | Cor de fundo | `#f0f0f0` |
| `headerColor` | Cor do texto | `#000000` |
| `headerFontSize` | Tamanho da fonte | `10` |
| `headerFontWeight` | Espessura da fonte | `bold` |
| `headerAlignment` | Alinhamento | `center` |
| `headerHeight` | Altura do cabeçalho | `30` |

### Células

| Propriedade | Descrição | Padrão |
|-------------|-----------|--------|
| `fontSize` | Tamanho da fonte | `9` |
| `cellColor` | Cor do texto | `#000000` |
| `cellBackground` | Cor de fundo | `#ffffff` |
| `alternateRowBackground` | Cor alternada (zebra) | `null` |
| `cellPadding` | Espaçamento interno | `5` |
| `rowHeight` | Altura mínima da linha | `auto` |

### Bordas

| Propriedade | Descrição | Padrão |
|-------------|-----------|--------|
| `borderColor` | Cor da borda | `#000000` |
| `borderWidth` | Espessura da borda | `1` |
| `cellBorderType` | Tipo de borda | `all` |

#### Tipos de Borda

- `all`: Bordas em todas as células
- `row`: Apenas bordas horizontais
- `cells`: Bordas completas em cada célula
- `top-bottom`: Apenas bordas superior e inferior
- `left-right`: Apenas bordas esquerda e direita
- `none`: Sem bordas

---

## Linhas Zebra (Cores Alternadas)

```json
{
  "style": {
    "cellBackground": "#ffffff",
    "alternateRowBackground": "#f9fafb"
  }
}
```

Linhas pares e ímpares terão cores diferentes automaticamente.

---

## Alinhamento

### Por Coluna

```json
{
  "columns": [
    {
      "header": "Code",
      "field": "code",
      "alignment": "center"
    },
    {
      "header": "Price",
      "field": "price",
      "alignment": "right"
    }
  ]
}
```

### Cabeçalho vs Células

```json
{
  "header": "Quantity",
  "field": "qty",
  "alignment": "right",
  "headerAlignment": "center"
}
```

- Cabeçalho centralizado
- Células alinhadas à direita

---

## Exemplo Completo: Fatura

```json
{
  "type": "table",
  "id": "invoice-items",
  "x": 30,
  "y": 200,
  "width": "100%",
  "dataBinding": "items",
  "paginated": true,
  "columns": [
    {
      "header": "Code",
      "field": "$item.code | padLeft:6:'0'",
      "width": 60,
      "alignment": "center"
    },
    {
      "header": "Product Description",
      "field": "$item.description | capitalize",
      "width": 220,
      "alignment": "left"
    },
    {
      "header": "Qty.",
      "field": "$item.quantity",
      "width": 50,
      "alignment": "center"
    },
    {
      "header": "Unit",
      "field": "$item.unit | upperCase",
      "width": 50,
      "alignment": "center"
    },
    {
      "header": "Unit Price",
      "field": "$item.unitPrice | currency:'BRL'",
      "width": 80,
      "alignment": "right"
    },
    {
      "header": "Total",
      "field": "$item.total | currency:'BRL'",
      "width": 75,
      "alignment": "right"
    }
  ],
  "style": {
    "headerBackground": "#1e40af",
    "headerColor": "#ffffff",
    "headerFontSize": 9,
    "headerFontWeight": "bold",
    "headerAlignment": "center",
    "headerHeight": 25,
    
    "fontSize": 8,
    "cellColor": "#1f2937",
    "cellBackground": "#ffffff",
    "alternateRowBackground": "#f9fafb",
    
    "borderColor": "#d1d5db",
    "borderWidth": 0.5,
    "cellBorderType": "all",
    
    "cellPadding": 5
  },
  "printCondition": "items.length > 0"
}
```

---

## Larguras Responsivas

As larguras das colunas são ajustadas proporcionalmente quando necessário:

```json
{
  "width": 500,
  "columns": [
    { "header": "A", "field": "a", "width": 100 },
    { "header": "B", "field": "b", "width": 200 },
    { "header": "C", "field": "c", "width": 100 }
  ]
}
```

- Soma das colunas: 400
- Largura da tabela: 500
- Razão: 500 / 400 = 1,25
- Larguras ajustadas: 125, 250, 125

---

## Dentro de Loops

Você pode aninhar tabelas dentro de loops:

```json
{
  "type": "loop",
  "dataBinding": "orders",
  "ySpacing": 200,
  "elements": [
    {
      "type": "text",
      "dataBinding": "$item.number | prefix:'Order: #'",
      "style": { "fontSize": 14, "fontWeight": "bold" }
    },
    {
      "type": "table",
      "y": 25,
      "dataBinding": "$item.items",
      "paginated": false,
      "columns": [
        { "header": "Product", "field": "$item.name" },
        { "header": "Quantity", "field": "$item.qty" },
        { "header": "Value", "field": "$item.value | currency:'BRL'" }
      ]
    }
  ]
}
```

::: warning Atenção
Quando estiver dentro de um loop, use `paginated: false` para evitar comportamentos inesperados.
:::

---

## Tabelas Vazias

Se `dataBinding` retornar um array vazio:
- ✅ O cabeçalho é renderizado
- ✅ Nenhuma linha de dados
- 💡 Use `printCondition` para ocultar completamente

```json
{
  "type": "table",
  "dataBinding": "items",
  "printCondition": "items.length > 0",
  "columns": [...]
}
```

---

## Performance

::: tip Otimização
- Tabelas paginadas são mais eficientes
- Limite a quantidade de colunas (< 10 é recomendado)
- Use `truncate` em textos longos
- Evite transformações complexas nas células
:::

---

## Limitações

- ❌ Não suporta células mescladas (colspan/rowspan)
- ❌ Não suporta subcabeçalhos
- ❌ A altura das linhas é uniforme
- ❌ Não suporta imagens dentro das células (use apenas `text`)

Para layouts mais complexos, use o [LoopElement](/pt/lib/guide/elements/loop).

---

## Comparação: Table vs Loop

| Aspecto | TableElement | LoopElement |
|---------|--------------|-------------|
| **Paginação** | Automática | Manual |
| **Cabeçalhos** | Sim | Não |
| **Linhas zebra** | Sim | Manual |
| **Colunas uniformes** | Sim | Manual |
| **Layout livre** | Não | Sim |
| **Complexidade** | Baixa | Alta |
| **Melhor para** | Dados tabulares | Layouts personalizados |

---

## Casos de Uso

### Relatório de Vendas

```json
{
  "type": "table",
  "dataBinding": "sales",
  "columns": [
    { "header": "Date", "field": "$item.date | date:'dd/MM/yyyy'" },
    { "header": "Salesperson", "field": "$item.salesperson | capitalize'" },
    { "header": "Customer", "field": "$item.customer" },
    { "header": "Amount", "field": "$item.amount | currency:'BRL'" },
    { "header": "Status", "field": "$item.status | upperCase" }
  ],
  "style": {
    "alternateRowBackground": "#f3f4f6"
  }
}
```

### Extrato Bancário

```json
{
  "type": "table",
  "dataBinding": "transactions",
  "columns": [
    { "header": "Date", "field": "$item.date | date:'dd/MM'" },
    { "header": "Description", "field": "$item.description | truncate:40" },
    { "header": "Debit", "field": "$item.debit | currency:'BRL'" },
    { "header": "Credit", "field": "$item.credit | currency:'BRL'" },
    { "header": "Balance", "field": "$item.balance | currency:'BRL'" }
  ],
  "style": {
    "fontSize": 8,
    "cellPadding": 4,
    "borderWidth": 0.3
  }
}
```

### Lista de Presença

```json
{
  "type": "table",
  "dataBinding": "participants",
  "columns": [
    { "header": "No.", "field": "$index | concat:1", "width": 40 },
    { "header": "Name", "field": "$item.name", "width": 200 },
    { "header": "ID", "field": "$item.id", "width": 120 },
    { "header": "Signature", "field": "", "width": 175 }
  ],
  "style": {
    "headerBackground": "#1f2937",
    "headerColor": "#ffffff",
    "rowHeight": 35
  }
}
```

---

## Próximos Passos

- [LoopElement](/pt/lib/guide/elements/loop) - Alternativa para layouts complexos
- [Transformações](/pt/lib/guide/transformations) - Formatar dados das células
- [Exemplos](/pt/lib/examples/) - Veja as tabelas em ação
