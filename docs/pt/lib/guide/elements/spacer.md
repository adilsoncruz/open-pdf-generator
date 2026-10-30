# Elemento Spacer

O `SpacerElement` (`"type": "spacer"`) define espaçamento vertical ou horizontal vazio em layouts de fluxo, especialmente dentro de containers ou fluxos de posicionamento relativo, quando é necessária uma separação dinâmica entre elementos.

## Funcionalidades

- ✅ **Dimensões flexíveis**: Suporta pontos fixos (`height: 20`) ou larguras percentuais (`"100%"`).
- ✅ **Espaço no layout**: Empurra os elementos de fluxo subsequentes para baixo conforme a altura configurada.
- ✅ **Espaçamento condicional**: Pode ser ativado ou ocultado condicionalmente com `printCondition`.

---

## Propriedades

| Propriedade | Tipo | Obrigatório | Descrição |
|-------------|------|-------------|-----------|
| `type` | string | ✅ | Deve ser `"spacer"` |
| `id` | string | ✅ | Identificador único do elemento |
| `x` | number | ❌ | Posição horizontal (padrão: `0`) |
| `y` | number | ❌ | Posição vertical (padrão: `0`) |
| `width` | number \| string | ❌ | Largura em pontos ou percentual (padrão: `"100%"`) |
| `height` | number | ❌ | Altura do espaçamento vertical em pontos (padrão: `0`) |
| `printCondition` | string | ❌ | Expressão de condição para ativar o espaçador |
| `positionMode` | string | ❌ | `"absolute"` ou `"relative"` |
| `relativeOffsetY` | number | ❌ | Espaçamento quando posicionado abaixo do conteúdo de fluxo anterior |

---

## Exemplo: Espaçamento Vertical Entre Seções

```json
{
  "type": "spacer",
  "id": "section-gap",
  "height": 24,
  "width": "100%"
}
```
