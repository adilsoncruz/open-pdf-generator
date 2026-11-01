# Elemento List (Lista)

O `ListElement` renderiza listas demarcadas, numeradas ou estilizadas de itens, com suporte a data binding dinâmico, quebra de linha automática (multiline), espaçamento customizado e paginação automática entre páginas.

## Recursos

- ✅ **Estilos de Marcador**: `BULLETED` (•), `NUMBERED` (1, 2, 3), `START` (★), `DASH` (–), `DIAMOND` (◆)
- ✅ **Data Binding**: Vinculação a arrays de strings ou objetos no payload (`dataBinding: "items"`)
- ✅ **Itens Estáticos**: Definição direta de itens estáticos no template (`items: ["Item 1", "Item 2"]`)
- ✅ **Controle de Numeração**: Configuração de `startNumber` (início em 1, 5, 10, etc.)
- ✅ **Espaçamento**: Ajuste fino do espaçamento vertical entre itens com `itemSpacing`
- ✅ **Quebra Automática**: Texto longo quebra linhas respeitando a largura do elemento
- ✅ **Fluxo Multi-página**: Itens fluem e quebram de página automaticamente quando ultrapassam a área útil

---

## Propriedades

| Propriedade | Tipo | Obrigatório | Descrição |
|-------------|------|-------------|-----------|
| `type` | string | ✅ | Deve ser `"list"` |
| `id` | string | ✅ | Identificador único do elemento |
| `x` | number | ✅ | Posição horizontal (pt) |
| `y` | number | ✅ | Posição vertical (pt) |
| `width` | number / string | ❌ | Largura em pontos ou `"100%"` (padrão: 400) |
| `height` | number | ❌ | Altura em pontos (padrão: 50) |
| `dataBinding` | string | ❌ | Caminho para lista/array no JSON de dados (ex: `"items"` ou `"pedido.itens"`) |
| `items` | array | ❌ | Array de strings estáticas (usado quando não houver data binding) |
| `listStyle` | string | ❌ | `"BULLETED"` (padrão), `"NUMBERED"`, `"START"`, `"DASH"` ou `"DIAMOND"` |
| `startNumber` | number | ❌ | Número inicial para listas numeradas (padrão: 1) |
| `itemSpacing` | number | ❌ | Espaçamento vertical entre itens em pontos (padrão: 10) |
| `startY` | number | ❌ | Ponto vertical inicial customizado |
| `style` | object | ❌ | Propriedades visuais (`fontSize`, `fontFamily`, `color`, `backgroundColor`) |
| `printCondition` | string | ❌ | Expressão condicional para renderização |

---

## Exemplos em JSON

### Lista Dinâmica Numerada

```json
{
  "type": "list",
  "id": "etapas-pedido",
  "x": 40,
  "y": 120,
  "width": 500,
  "dataBinding": "etapas",
  "listStyle": "NUMBERED",
  "itemSpacing": 8,
  "style": {
    "fontSize": 11,
    "fontFamily": "Helvetica",
    "color": "#1e293b"
  }
}
```

### Lista Estática com Marcadores

```json
{
  "type": "list",
  "id": "beneficios",
  "x": 40,
  "y": 250,
  "width": "100%",
  "listStyle": "BULLETED",
  "items": [
    "Alta performance de renderização com OpenPDF",
    "Paginação e fluxo automático multi-página",
    "Editor visual de alta fidelidade e CLI integrada"
  ],
  "itemSpacing": 6,
  "style": {
    "fontSize": 12,
    "fontFamily": "Helvetica",
    "color": "#0f172a"
  }
}
```

---

## DSL Programática em Kotlin

```kotlin
val template = TemplateBuilder()
    .addList {
        id = "termos-list"
        x = 40f
        y = 150f
        width = 515f
        dataBinding = "termos"
        listStyle = ListMode.BULLETED
        itemSpacing = 8f
        style = TextStyle(fontSize = 10f, color = "#475569")
    }
    .build()
```
