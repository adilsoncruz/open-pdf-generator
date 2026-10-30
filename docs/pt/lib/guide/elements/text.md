# Elemento Text

O `TextElement` renderiza textos estáticos ou dinâmicos com suporte a data binding, transformações e estilos avançados.

## Funcionalidades

- ✅ **Data binding**: Vincula dados dinâmicos
- ✅ **Transformações**: Aplica pipes de formatação
- ✅ **Estilos avançados**: Fonte, cor, alinhamento, padding
- ✅ **Multilinha**: Texto com múltiplas linhas
- ✅ **Recuo**: Indentação da primeira linha
- ✅ **Altura de linha**: Controle do espaçamento entre linhas

---

## Propriedades

| Propriedade | Tipo | Obrigatório | Descrição |
|-------------|------|-------------|-----------|
| `type` | string | ✅ | Deve ser `"text"` |
| `id` | string | ✅ | Identificador único |
| `x` | number | ✅ | Posição X |
| `y` | number | ✅ | Posição Y |
| `width` | number | ❌ | Largura do container |
| `height` | number | ❌ | Altura do container |
| `value` | string | ❌ | Texto estático |
| `dataBinding` | string | ❌ | Caminho para dados dinâmicos |
| `style` | object | ❌ | Estilos do texto |
| `printCondition` | string | ❌ | Condição para renderizar |
| `positionMode` | string | ❌ | `ABSOLUTE` (padrão) ou `RELATIVE` |
| `relativeOffsetY` | number | ❌ | Deslocamento em Y quando `RELATIVE` |

::: tip Dica
Use `value` para textos fixos ou `dataBinding` para textos dinâmicos. É possível usar os dois com a interpolação `{{}}`.
:::

---

## Exemplo Básico

### Texto Estático

```json
{
  "type": "text",
  "id": "title",
  "x": 50,
  "y": 100,
  "value": "Electronic Invoice",
  "style": {
    "fontSize": 18,
    "fontWeight": "bold",
    "color": "#1e40af"
  }
}
```

### Texto Dinâmico

```json
{
  "type": "text",
  "id": "customer-name",
  "x": 50,
  "y": 150,
  "dataBinding": "customer.name",
  "style": {
    "fontSize": 14
  }
}
```

**Dados:**
```json
{
  "customer": {
    "name": "John Smith"
  }
}
```

**Resultado:** `John Smith`

---

## Data Binding com Interpolação

Misture texto estático com dados dinâmicos:

```json
{
  "type": "text",
  "value": "Customer: {{customer.name}}",
  "style": {
    "fontSize": 12
  }
}
```

**Resultado:** `Customer: John Smith`

---

## Transformações (Pipes)

Aplique transformações aos dados:

```json
{
  "type": "text",
  "dataBinding": "customer.name | upperCase"
}
```

**Resultado:** `JOHN SMITH`

### Múltiplas Transformações

```json
{
  "dataBinding": "description | trim | truncate:50 | capitalize"
}
```

Consulte [Transformações](/pt/lib/guide/transformations) para ver a lista completa.

---

## Estilos

### Propriedades de Estilo

```json
{
  "style": {
    "fontSize": 12,
    "fontFamily": "Helvetica",
    "fontWeight": "normal",
    "fontStyle": "normal",
    "color": "#000000",
    "backgroundColor": "#f3f4f6",
    "alignment": "left",
    "verticalAlignment": "center",
    "lineHeight": 1.5,
    "multiline": true,
    "firstLineIndent": 20,
    "paddingTop": 5,
    "paddingBottom": 5,
    "paddingLeft": 10,
    "paddingRight": 10
  }
}
```

### Fonte

| Propriedade | Valores | Descrição |
|-------------|---------|-----------|
| `fontSize` | number | Tamanho em pontos (padrão: `12`) |
| `fontFamily` | string | `Helvetica`, `Times`, `Courier` |
| `fontWeight` | string | `normal`, `bold` |
| `fontStyle` | string | `normal`, `italic` |

**Famílias de fonte:**
- `Helvetica` → Sem serifa, moderna (padrão)
- `Times` → Com serifa, formal
- `Courier` → Monoespaçada, código

---

### Cores

| Propriedade | Tipo | Descrição |
|-------------|------|-----------|
| `color` | hex | Cor do texto (padrão: `#000000`) |
| `backgroundColor` | hex | Cor de fundo (opcional) |

```json
{
  "style": {
    "color": "#1e40af",
    "backgroundColor": "#dbeafe"
  }
}
```

---

### Alinhamento

#### Horizontal

| Valor | Descrição |
|-------|-----------|
| `left` | Alinhado à esquerda (padrão) |
| `center` | Centralizado |
| `right` | Alinhado à direita |
| `justify` | Justificado |

```json
{
  "style": {
    "alignment": "center"
  }
}
```

#### Vertical

| Valor | Descrição |
|-------|-----------|
| `top` | Topo do container |
| `center` | Centro (padrão) |
| `bottom` | Base do container |

```json
{
  "style": {
    "verticalAlignment": "top"
  }
}
```

---

### Texto Multilinha

Para textos com múltiplas linhas:

```json
{
  "type": "text",
  "x": 50,
  "y": 100,
  "width": 400,
  "height": 100,
  "value": "This is a long text that will be automatically wrapped into multiple lines within the specified container.",
  "style": {
    "multiline": true,
    "fontSize": 10,
    "lineHeight": 1.5,
    "alignment": "justify"
  }
}
```

**Comportamento:**
- O texto quebra automaticamente na largura especificada em `width`
- `lineHeight` controla o espaçamento entre as linhas
- `height` define a altura máxima do container

---

### Overflow (Controle de Altura)

::: tip Novidade na v1.1
Controla como o texto multilinha se comporta quando excede a altura definida.
:::

| Valor | Comportamento |
|-------|---------------|
| `visible` | O texto pode exceder a altura (padrão) |
| `hidden` | O texto é cortado na altura definida |
| `auto` | A altura se ajusta ao conteúdo real |

```json
{
  "type": "text",
  "x": 50,
  "y": 100,
  "width": 400,
  "height": 50,
  "dataBinding": "description",
  "style": {
    "multiline": true,
    "overflow": "auto"
  }
}
```

::: warning Importante
Use `overflow: auto` quando houver um elemento com `positionMode: RELATIVE` logo abaixo. Assim o próximo elemento será posicionado após o conteúdo real do texto.
:::

---

### Altura de Linha

```json
{
  "style": {
    "fontSize": 12,
    "lineHeight": 1.5
  }
}
```

- `lineHeight` é um multiplicador de `fontSize`
- `1.0` = sem espaço extra
- `1.5` = 50% de espaço extra (recomendado)
- `2.0` = linha dupla

---

### Recuo da Primeira Linha

```json
{
  "style": {
    "firstLineIndent": 20,
    "multiline": true
  }
}
```

**Resultado:**
```
    Este é o primeiro parágrafo com
indentação na primeira linha. As linhas
seguintes não têm indentação.
```

---

### Padding

```json
{
  "style": {
    "paddingTop": 5,
    "paddingBottom": 5,
    "paddingLeft": 10,
    "paddingRight": 10,
    "backgroundColor": "#f3f4f6"
  }
}
```

Útil quando combinado com `backgroundColor` para criar "caixas" de texto.

---

## Exemplos Práticos

### Título de Seção

```json
{
  "type": "text",
  "x": 50,
  "y": 100,
  "value": "CUSTOMER DETAILS",
  "style": {
    "fontSize": 14,
    "fontWeight": "bold",
    "color": "#1e40af",
    "letterSpacing": 1
  }
}
```

### Rótulo + Valor

```json
{
  "type": "text",
  "x": 50,
  "y": 150,
  "value": "Name: {{customer.name | upperCase}}",
  "style": {
    "fontSize": 10
  }
}
```

### Texto com Fundo

```json
{
  "type": "text",
  "x": 50,
  "y": 200,
  "value": "PAID",
  "style": {
    "fontSize": 12,
    "fontWeight": "bold",
    "color": "#ffffff",
    "backgroundColor": "#10b981",
    "paddingTop": 5,
    "paddingBottom": 5,
    "paddingLeft": 15,
    "paddingRight": 15
  }
}
```

### Parágrafo Justificado

```json
{
  "type": "text",
  "x": 50,
  "y": 300,
  "width": 500,
  "height": 150,
  "dataBinding": "contract.text",
  "style": {
    "fontSize": 9,
    "multiline": true,
    "alignment": "justify",
    "lineHeight": 1.4,
    "firstLineIndent": 20
  }
}
```

### Valor Monetário

```json
{
  "type": "text",
  "x": 400,
  "y": 500,
  "dataBinding": "total | currency:'USD'",
  "style": {
    "fontSize": 16,
    "fontWeight": "bold",
    "color": "#059669",
    "alignment": "right"
  }
}
```

### Data Formatada

```json
{
  "type": "text",
  "x": 50,
  "y": 550,
  "dataBinding": "issueDate | date:'MM/dd/yyyy HH:mm'",
  "style": {
    "fontSize": 9,
    "color": "#6b7280"
  }
}
```

---

## Condições

Renderize apenas sob determinadas condições:

```json
{
  "type": "text",
  "value": "⚠️ DISCOUNT APPLIED",
  "style": {
    "color": "#dc2626",
    "fontWeight": "bold"
  },
  "printCondition": "discount > 0"
}
```

Consulte [Condições](/pt/lib/guide/conditions) para mais detalhes.

---

## Dentro de Loops

```json
{
  "type": "loop",
  "dataBinding": "items",
  "elements": [
    {
      "type": "text",
      "dataBinding": "$item.name | capitalize",
      "style": {
        "fontSize": 10
      }
    }
  ]
}
```

Consulte o [Elemento Loop](/pt/lib/guide/elements/loop) para mais detalhes.

---

## Posicionamento Relativo

::: tip Novidade na v1.1
Posicione elementos dinamicamente com base no conteúdo anterior!
:::

### Modo de Posição

| Modo | Comportamento |
|------|---------------|
| `ABSOLUTE` | Posição fixa no canvas (padrão) |
| `RELATIVE` | Posição com base no elemento anterior |

### Exemplo: Texto Após Loop

Quando você tem um loop com quantidade variável de itens e quer posicionar um texto depois dele:

```json
[
  {
    "type": "loop",
    "id": "items",
    "dataBinding": "items",
    "x": 50,
    "y": 100,
    "height": 30,
    "itemSpacing": 5,
    "elements": [...]
  },
  {
    "type": "text",
    "id": "total",
    "x": 50,
    "y": 0,
    "positionMode": "RELATIVE",
    "relativeOffsetY": 20,
    "value": "Total: {{total}}",
    "style": { "fontWeight": "bold" }
  }
]
```

**Comportamento:**
- O texto "Total" será posicionado 20pt abaixo do último item do loop
- Não importa quantos itens o loop tenha
- O `y` no canvas é ignorado quando `positionMode: RELATIVE`
- `relativeOffsetY` define o espaço entre os elementos

---

## Limitações

- ❌ Não suporta texto rotacionado
- ❌ Não suporta sombra no texto
- ❌ Não suporta gradientes de cor

---

## Performance

::: tip Otimização
- Textos curtos são mais rápidos
- `multiline: false` é mais eficiente
- Evite `backgroundColor` desnecessário
- O cache de fontes é automático
:::

---

## Próximos Passos

- [Transformações](/pt/lib/guide/transformations) - Formatar dados
- [Condições](/pt/lib/guide/conditions) - Renderização condicional
- [Elemento Image](/pt/lib/guide/elements/image) - Adicionar imagens
- [Exemplos](/pt/lib/examples/) - Veja o Text em ação
