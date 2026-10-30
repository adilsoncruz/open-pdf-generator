# Elemento Rich Text

O `RichTextElement` (`"type": "rich_text"` ou `"richText"`) renderiza texto embutido com estilos, com suporte leve a formatação Markdown, como negrito (`**bold**`) e itálico (`*italic*`) dentro do mesmo bloco.

## Funcionalidades

- ✅ **Formatação Markdown embutida**: Suporta tokens de `**negrito**` e `*itálico*` no mesmo parágrafo de texto.
- ✅ **Expressões de template**: Suporta interpolação de strings `${variavel}` e transformações de dados.
- ✅ **Alinhamento de parágrafo**: Suporta `left`, `center`, `right` e `justify`.
- ✅ **Texto dinâmico ou estático**: Funciona com `value` estático ou `dataBinding` dinâmico.

---

## Propriedades

| Propriedade | Tipo | Obrigatório | Descrição |
|-------------|------|-------------|-----------|
| `type` | string | ✅ | Deve ser `"rich_text"` ou `"richText"` |
| `id` | string | ✅ | Identificador único do elemento |
| `x` | number | ✅ | Posição horizontal em pontos |
| `y` | number | ✅ | Posição vertical em pontos |
| `value` | string | ⚠️ | Texto estático com marcação Markdown (obrigatório se `dataBinding` não for definido) |
| `dataBinding` | string | ⚠️ | Expressão ou caminho que resolve para texto Markdown |
| `width` | number | ❌ | Largura em pontos (usa por padrão toda a área imprimível) |
| `height` | number | ❌ | Altura em pontos (usada quando `overflow: "hidden"`) |
| `style` | object | ❌ | Opções de estilo (`fontSize`, `fontFamily`, `color`, `alignment`, `overflow`) |
| `printCondition` | string | ❌ | Expressão de condição para renderizar o elemento |
| `positionMode` | string | ❌ | `"absolute"` ou `"relative"` |
| `relativeOffsetY` | number | ❌ | Deslocamento relativo ao elemento de fluxo anterior |

---

## Exemplo: Parágrafo Formatado com Markdown

```json
{
  "type": "rich_text",
  "id": "terms-and-conditions",
  "x": 50,
  "y": 600,
  "width": 500,
  "value": "Please note that all **payments** are due within *30 days* of invoice issuance. Late fees may apply.",
  "style": {
    "fontSize": 11,
    "fontFamily": "Helvetica",
    "color": "#334155",
    "alignment": "justify"
  }
}
```

## Exemplo: Texto Dinâmico com Markdown

```json
{
  "type": "rich_text",
  "id": "dynamic-notes",
  "x": 50,
  "y": 680,
  "width": 500,
  "dataBinding": "Order status for **${order.id}** is currently *${order.status}*.",
  "style": {
    "fontSize": 10,
    "color": "#1E293B"
  }
}
```
