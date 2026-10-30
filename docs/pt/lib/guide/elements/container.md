# Elemento Container

O `ContainerElement` funciona como uma caixa delimitadora e um contexto de layout relativo para múltiplos elementos filhos. Ele permite aninhar elementos, aplicar estilos de fundo e bordas e estruturar layouts dinâmicos de documentos.

## Funcionalidades

- ✅ **Layouts aninhados**: Contém uma lista de elementos filhos (`text`, `image`, `shape` etc.) posicionados relativos ao container.
- ✅ **Largura e altura dinâmicas**: Suporta valores fixos (`400`), percentuais (`"100%"`) e `autoHeight`.
- ✅ **Estilização**: Cor de fundo, bordas, raio dos cantos e padding via `style`.
- ✅ **Renderização condicional**: Suporta `printCondition` para mostrar ou ocultar todo o container e seus filhos.
- ✅ **Cálculo de altura automática**: Se expande automaticamente com base no conteúdo interno quando `autoHeight: true`.

---

## Propriedades

| Propriedade | Tipo | Obrigatório | Descrição |
|-------------|------|-------------|-----------|
| `type` | string | ✅ | Deve ser `"container"` |
| `id` | string | ✅ | Identificador único do elemento |
| `x` | number | ❌ | Posição X (padrão: `0`) |
| `y` | number | ❌ | Posição Y (padrão: `0`) |
| `width` | number \| string | ❌ | Largura em pontos ou percentual, como `"100%"` (padrão: `400`) |
| `height` | number \| string | ❌ | Altura em pontos ou percentual (padrão: `50`) |
| `autoHeight` | boolean | ❌ | Ajusta automaticamente a altura ao conteúdo (padrão: `true`) |
| `heightMode` | string | ❌ | `"auto"` ou `"fixed"` (padrão: `"auto"`) |
| `elements` | array | ✅ | Lista de elementos filhos dentro do container |
| `style` | object | ❌ | Estilo: `backgroundColor`, `borderColor`, `borderWidth`, `borderRadius` |
| `printCondition` | string | ❌ | Expressão de condição para renderizar o container |
| `positionMode` | string | ❌ | Modo de posição (`"absolute"` ou `"relative"`) |
| `relativeOffsetY` | number | ❌ | Espaçamento quando posicionado abaixo do conteúdo de fluxo anterior |

---

## Exemplo: Container de Card com Elementos Aninhados

```json
{
  "type": "container",
  "id": "customer-card",
  "x": 30,
  "y": 120,
  "width": "100%",
  "autoHeight": true,
  "style": {
    "backgroundColor": "#F8FAFC",
    "borderColor": "#E2E8F0",
    "borderWidth": 1,
    "borderRadius": 8
  },
  "elements": [
    {
      "type": "text",
      "id": "card-title",
      "x": 15,
      "y": 15,
      "text": "Customer Information",
      "font": { "size": 12, "style": "bold", "color": "#0F172A" }
    },
    {
      "type": "text",
      "id": "customer-name",
      "x": 15,
      "y": 35,
      "text": "Name: {{customer.name}}",
      "font": { "size": 10, "color": "#334155" }
    },
    {
      "type": "text",
      "id": "customer-email",
      "x": 15,
      "y": 50,
      "text": "Email: {{customer.email}}",
      "font": { "size": 10, "color": "#334155" }
    }
  ]
}
```

---

## Containers de Fundo Ocupando Toda a Largura

Containers também podem se estender a `100%` da largura para criar cabeçalhos de seção, banners ou cards de destaque:

```json
{
  "type": "container",
  "id": "header-banner",
  "x": 0,
  "y": 0,
  "width": "100%",
  "height": 60,
  "autoHeight": false,
  "style": {
    "backgroundColor": "#0F172A"
  },
  "elements": [
    {
      "type": "text",
      "id": "banner-text",
      "x": 30,
      "y": 20,
      "text": "ORDER CONFIRMATION",
      "font": { "size": 16, "style": "bold", "color": "#FFFFFF" }
    }
  ]
}
```
