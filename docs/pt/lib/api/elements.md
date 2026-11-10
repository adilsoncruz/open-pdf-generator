# Elementos

Referência completa de todos os elementos disponíveis para templates.

---

## Visão Geral

| Elemento | Descrição | Data Binding |
|---------|-------------|--------------|
| [TextElement](#textelement) | Texto estático ou dinâmico | ✅ |
| [RichTextElement](#richtextelement) | Texto inline formatado em Markdown | ✅ |
| [LinkElement](#linkelement) | Anotações de hyperlink clicáveis | ✅ |
| [ImageElement](#imageelement) | Imagens (URL, base64) | ✅ |
| [TableElement](#tableelement) | Tabelas com paginação automática | ✅ |
| [ContainerElement](#containerelement) | Caixa delimitadora para elementos filhos aninhados | ❌ |
| [RectangleElement](#rectangleelement) | Retângulos e fundos | ❌ |
| [LineElement](#lineelement) | Linhas e divisores | ❌ |
| [SpacerElement](#spacerelement) | Espaçamento vertical/horizontal no layout | ❌ |
| [BarcodeElement](#barcodeelement) | QR Code e códigos de barras | ✅ |
| [ConditionalElement](#conditionalelement) | Renderização condicional | ✅ |
| [LoopElement](#loopelement) | Repetição de elementos | ✅ |
| [ListElement](#listelement) | Listas com marcadores ou numeradas | ✅ |
| [CheckListElement](#checklistelement) | Listas de verificação com checkboxes | ✅ |

---

## Propriedades Comuns

Todos os elementos compartilham estas propriedades:

```json
{
  "type": "text",
  "id": "unique-element",
  "x": 50,
  "y": 100,
  "width": 200,
  "height": 50,
  "printCondition": "data.active == true"
}
```

| Propriedade | Tipo | Obrigatória | Descrição |
|----------|------|----------|-------------|
| `type` | string | ✅ | Tipo do elemento |
| `id` | string | ⚠️ Recomendada | Identificador único |
| `x` | number | ✅ | Posição horizontal (pt) |
| `y` | number | ✅ | Posição vertical (pt) |
| `width` | number | ⚠️ Depende | Largura |
| `height` | number | ⚠️ Depende | Altura |
| `printCondition` | string | ❌ | Condição para renderizar |

---

## TextElement

Renderiza texto estático ou com data binding.

### Propriedades

```json
{
  "type": "text",
  "id": "title",
  "x": 50,
  "y": 100,
  "width": 400,
  "value": "Static Text",
  "dataBinding": "customer.name | uppercase",
  "fontSize": 14,
  "fontFamily": "Helvetica",
  "fontWeight": "bold",
  "fontStyle": "normal",
  "color": "#2563eb",
  "alignment": "left",
  "lineHeight": 1.5
}
```

| Propriedade | Tipo | Padrão | Descrição |
|----------|------|---------|-------------|
| `value` | string | - | Texto estático |
| `dataBinding` | string | - | Caminho dos dados + pipes |
| `fontSize` | number | 12 | Tamanho da fonte (pt) |
| `fontFamily` | string | Helvetica | Família da fonte |
| `fontWeight` | string | normal | `normal` ou `bold` |
| `fontStyle` | string | normal | `normal` ou `italic` |
| `color` | string | #000000 | Cor em hexadecimal |
| `alignment` | string | left | `left`, `center`, `right`, `justify` |
| `lineHeight` | number | 1.2 | Altura da linha |

### Exemplos

```json
// Static text
{
  "type": "text",
  "id": "title",
  "x": 50,
  "y": 50,
  "value": "MONTHLY REPORT",
  "fontSize": 24,
  "fontWeight": "bold"
}

// Data binding with transformation
{
  "type": "text",
  "id": "customer",
  "x": 50,
  "y": 100,
  "dataBinding": "order.customer.name | uppercase",
  "fontSize": 14
}

// Inline date
{
  "type": "text",
  "id": "date",
  "x": 50,
  "y": 130,
  "dataBinding": "order.date | date:'MM/dd/yyyy'"
}
```

---

## ImageElement

Renderiza imagens a partir de URL ou base64.

### Propriedades

```json
{
  "type": "image",
  "id": "logo",
  "x": 50,
  "y": 50,
  "width": 150,
  "height": 80,
  "source": "https://example.com/logo.png",
  "dataBinding": "company.logo",
  "fit": "contain",
  "alignment": "center"
}
```

| Propriedade | Tipo | Padrão | Descrição |
|----------|------|---------|-------------|
| `source` | string | - | URL estática ou base64 |
| `dataBinding` | string | - | Caminho dos dados para a URL |
| `fit` | string | contain | Modo de ajuste |
| `alignment` | string | center | Alinhamento |

### Modos de Ajuste (Fit)

| Modo | Comportamento |
|------|----------|
| `contain` | Mantém a proporção, cabe inteiramente na área |
| `cover` | Mantém a proporção, preenche a área |
| `fill` | Estica para preencher |
| `scale-down` | Reduz se necessário |

---

## TableElement

Renderiza tabelas com paginação automática.

### Propriedades

```json
{
  "type": "table",
  "id": "items",
  "x": 30,
  "y": 200,
  "width": 535,
  "dataBinding": "order.items",
  "columns": [
    {
      "header": "Código",
      "dataBinding": "$item.code",
      "width": 80,
      "alignment": "center"
    },
    {
      "header": "Descrição",
      "dataBinding": "$item.description",
      "width": 300
    },
    {
      "header": "Valor",
      "dataBinding": "$item.value | currency:'USD'",
      "width": 155,
      "alignment": "right"
    }
  ],
  "style": {
    "headerBackground": "#2563eb",
    "headerColor": "#ffffff",
    "headerFontSize": 10,
    "headerFontWeight": "bold",
    "rowFontSize": 9,
    "alternateRowBackground": "#f3f4f6",
    "borderWidth": 0.5,
    "borderColor": "#d1d5db",
    "cellPadding": 5
  }
}
```

### Coluna

| Propriedade | Tipo | Descrição |
|----------|------|-------------|
| `header` | string | Texto do cabeçalho |
| `dataBinding` | string | `$item.campo` para os dados |
| `width` | number | Largura da coluna |
| `alignment` | string | `left`, `center`, `right` |

### Estilo

| Propriedade | Tipo | Descrição |
|----------|------|-------------|
| `headerBackground` | string | Cor de fundo do cabeçalho |
| `headerColor` | string | Cor do texto do cabeçalho |
| `alternateRowBackground` | string | Cor das linhas alternadas |
| `borderWidth` | number | Espessura da borda |
| `borderColor` | string | Cor da borda |
| `cellPadding` | number | Espaçamento interno da célula |

---

## RectangleElement

Renderiza retângulos para fundos, bordas e decorações.

### Propriedades

```json
{
  "type": "rectangle",
  "id": "background",
  "x": 0,
  "y": 0,
  "width": 595,
  "height": 100,
  "fillColor": "#2563eb",
  "borderColor": "#1e40af",
  "borderWidth": 2,
  "cornerRadius": 8
}
```

| Propriedade | Tipo | Padrão | Descrição |
|----------|------|---------|-------------|
| `fillColor` | string | - | Cor de preenchimento |
| `borderColor` | string | - | Cor da borda |
| `borderWidth` | number | 0 | Espessura da borda |
| `cornerRadius` | number | 0 | Raio dos cantos |

---

## LineElement

Renderiza linhas horizontais, verticais ou diagonais.

### Propriedades

```json
{
  "type": "line",
  "id": "divider",
  "x": 50,
  "y": 200,
  "width": 545,
  "height": 200,
  "color": "#d1d5db",
  "width": 1,
  "dashPattern": [5, 3]
}
```

| Propriedade | Tipo | Padrão | Descrição |
|----------|------|---------|-------------|
| `width` | number | - | X final |
| `height` | number | - | Y final |
| `color` | string | #000000 | Cor da linha |
| `width` | number | 1 | Espessura |
| `dashPattern` | array | - | Padrão de tracejado [traço, espaço] |

---

## BarcodeElement

Renderiza QR Codes e códigos de barras.

### Propriedades

```json
{
  "type": "barcode",
  "id": "qrcode",
  "x": 400,
  "y": 650,
  "width": 100,
  "height": 100,
  "barcodeType": "qrcode",
  "dataBinding": "payment.pixCode",
  "errorCorrection": "M"
}
```

| Propriedade | Tipo | Valores | Descrição |
|----------|------|--------|-------------|
| `barcodeType` | string | `qrcode`, `barcode` | Tipo |
| `dataBinding` | string | - | Dados a codificar |
| `value` | string | - | Valor estático |
| `errorCorrection` | string | `L`, `M`, `Q`, `H` | Nível de correção (QR) |

---

## ConditionalElement

Renderiza elementos filhos condicionalmente.

### Propriedades

```json
{
  "type": "conditional",
  "id": "stock-alert",
  "condition": "product.stock < 10",
  "elements": [
    {
      "type": "rectangle",
      "x": 400,
      "y": 100,
      "width": 120,
      "height": 25,
      "fillColor": "#fef2f2",
      "borderColor": "#f87171"
    },
    {
      "type": "text",
      "x": 410,
      "y": 107,
      "value": "⚠️ Low stock",
      "color": "#dc2626",
      "fontSize": 10
    }
  ]
}
```

| Propriedade | Tipo | Descrição |
|----------|------|-------------|
| `condition` | string | Expressão booleana |
| `elements` | array | Elementos a renderizar |

### Operadores

- `==`, `!=` - Igualdade
- `>`, `<`, `>=`, `<=` - Comparação
- `&&`, `||` - Lógicos
- `in` - Pertencimento

---

## LoopElement

Repete elementos para cada item de uma lista.

### Propriedades

```json
{
  "type": "loop",
  "id": "product-list",
  "dataBinding": "order.products",
  "x": 50,
  "y": 200,
  "itemHeight": 30,
  "elements": [
    {
      "type": "text",
      "x": 0,
      "y": 0,
      "dataBinding": "$item.name"
    },
    {
      "type": "text",
      "x": 300,
      "y": 0,
      "dataBinding": "$item.value | currency:'USD'"
    }
  ]
}
```

| Propriedade | Tipo | Descrição |
|----------|------|-------------|
| `dataBinding` | string | Caminho para o array |
| `itemHeight` | number | Altura de cada item |
| `elements` | array | Template para cada item |

### Variáveis Especiais

- `$item` - Item da iteração atual
- `$index` - Índice (base 0)

---

## ContainerElement

Funciona como um contêiner de layout que agrupa elementos filhos com estilização de fundo e borda.

### Propriedades

```json
{
  "type": "container",
  "id": "card-box",
  "x": 50,
  "y": 100,
  "width": "100%",
  "autoHeight": true,
  "style": {
    "backgroundColor": "#F8FAFC",
    "borderColor": "#CBD5E1",
    "borderWidth": 1,
    "borderRadius": 6
  },
  "elements": []
}
```

| Propriedade | Tipo | Padrão | Descrição |
|----------|------|---------|-------------|
| `elements` | array | `[]` | Lista de elementos filhos aninhados |
| `autoHeight` | boolean | `true` | Ajusta automaticamente a altura do contêiner ao conteúdo |
| `heightMode` | string | `auto` | Modo de dimensionamento da altura (`auto` ou `fixed`) |
| `pageBreakBefore` | boolean | `false` | Quando true, renderiza o container em uma nova página |
| `pageBreakCondition` | string | `null` | Expressão opcional para avaliar condicionalmente a quebra |
| `style` | object | - | Estilização (`backgroundColor`, `borderColor`, `borderWidth`, `borderRadius`) |

---

## RichTextElement

Renderiza texto inline formatado com suporte a Markdown (`**negrito**`, `*itálico*`).

### Propriedades

```json
{
  "type": "rich_text",
  "id": "notice",
  "x": 50,
  "y": 200,
  "width": 500,
  "value": "Total amount due is **${order.total}**. Please pay before *${order.dueDate}*.",
  "style": {
    "fontSize": 12,
    "fontFamily": "Helvetica",
    "color": "#1E293B",
    "alignment": "left"
  }
}
```

| Propriedade | Tipo | Descrição |
|----------|------|-------------|
| `value` | string | String formatada em Markdown com `${expressão}` opcional |
| `dataBinding` | string | Fonte dinâmica contendo texto em Markdown |
| `style` | object | Configuração de tipografia e alinhamento |

---

## LinkElement

Renderiza uma anotação de hyperlink clicável no PDF.

### Propriedades

```json
{
  "type": "link",
  "id": "website-link",
  "x": 50,
  "y": 300,
  "url": "https://example.com",
  "value": "Visit our website",
  "style": {
    "fontSize": 12,
    "color": "#2563EB"
  }
}
```

| Propriedade | Tipo | Descrição |
|----------|------|-------------|
| `url` | string | URL de destino do hyperlink |
| `value` | string | Rótulo de texto estático |
| `dataBinding` | string | Rótulo de texto dinâmico |
| `style` | object | Estilos de fonte e cor |

---

## SpacerElement

Insere espaço vertical ou horizontal vazio em layouts de fluxo relativo.

### Propriedades

```json
{
  "type": "spacer",
  "id": "spacer-1",
  "height": 20,
  "width": "100%"
}
```

| Propriedade | Tipo | Padrão | Descrição |
|----------|------|---------|-------------|
| `height` | number | `0` | Altura do espaçamento em pontos |
| `width` | number \| string | `"100%"` | Largura do espaçamento em pontos ou porcentagem |

---

## ListElement

Renderiza listas com marcadores, numeradas ou personalizadas com suporte a fluxo multi-página e quebra automática.

### Propriedades

```json
{
  "type": "list",
  "id": "beneficios-list",
  "x": 40,
  "y": 150,
  "width": 500,
  "dataBinding": "beneficios",
  "listStyle": "BULLETED",
  "itemSpacing": 8,
  "style": {
    "fontSize": 11,
    "fontFamily": "Helvetica",
    "color": "#1e293b"
  }
}
```

| Propriedade | Tipo | Padrão | Descrição |
|-------------|------|--------|-----------|
| `dataBinding` | string | `""` | Caminho do array no payload |
| `items` | array | `[]` | Array de strings estáticas (fallback) |
| `listStyle` | string | `"BULLETED"` | `"BULLETED"`, `"NUMBERED"`, `"START"`, `"DASH"`, `"DIAMOND"` |
| `startNumber` | number | `1` | Número inicial para listas numeradas |
| `itemSpacing` | number | `10` | Espaço vertical entre itens em pontos |
| `startY` | number | `null` | Posição Y inicial opcional |

---

## CheckListElement

Renderiza listas de tarefas com caixas de seleção customizáveis (`RECTANGLE`, `BORDERED`, `CIRCLE`).

### Propriedades

```json
{
  "type": "check_list",
  "id": "tarefas-checklist",
  "x": 40,
  "y": 280,
  "width": 500,
  "dataBinding": "tarefas",
  "checkStyle": "BORDERED",
  "itemSpacing": 4,
  "style": {
    "fontSize": 11,
    "fontFamily": "Helvetica",
    "color": "#0f172a"
  }
}
```

| Propriedade | Tipo | Padrão | Descrição |
|-------------|------|--------|-----------|
| `dataBinding` | string | `""` | Caminho do mapa `{ "Rótulo": boolean }` |
| `items` | object | `{}` | Mapa estático de tarefas `{ "Item": true }` |
| `checkStyle` | string | `"RECTANGLE"` | `"RECTANGLE"`, `"BORDERED"`, `"CIRCLE"` |
| `itemSpacing` | number | `0` | Espaço vertical entre tarefas em pontos |
| `startY` | number | `null` | Posição Y inicial opcional |

---

## Próximos Passos

- [Templates JSON](/pt/lib/guide/templates) - Estrutura completa
- [Data Binding](/pt/lib/guide/data-binding) - Ligação de dados
- [Transformações](/pt/lib/guide/transformations) - Pipes disponíveis
