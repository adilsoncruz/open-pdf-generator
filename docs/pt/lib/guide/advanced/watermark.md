# Marca d'Água

O PDF Generator suporta marcas d'água de texto e imagem configuradas dentro de `pageSettings`. Marcas d'água podem ser aplicadas em todas as páginas com opacidade, rotação e renderização condicional personalizadas.

## Recursos

- ✅ **Tipos Texto e Imagem**: Carimbos de texto diagonais (ex.: `CONFIDENTIAL`, `DRAFT`) ou imagens de logotipo da empresa.
- ✅ **Data Binding Dinâmico**: Vincule o texto da marca d'água a variáveis dos dados do template.
- ✅ **Ordem de Camadas**: Escolha se a marca d'água é impressa no fundo (`onTop: false`) ou sobre o conteúdo (`onTop: true`).
- ✅ **Marcas d'Água Condicionais**: Use `printCondition` para exibir apenas em situações específicas (ex.: status `draft` ou `preview`).

---

## Propriedades de Configuração

Configuradas em `template.pageSettings.watermark`:

| Propriedade | Tipo | Padrão | Descrição |
|----------|------|---------|-------------|
| `type` | string | `"text"` | Tipo da marca d'água: `"text"` ou `"image"` |
| `text` | string | `null` | Texto estático da marca d'água |
| `dataBinding` | string | `null` | Caminho da variável para texto dinâmico (ex.: `"docStatus"`) |
| `imageSource` | string | `null` | Caminho da imagem ou data URL em base64 para marcas d'água de imagem |
| `fontName` | string | `"Helvetica"` | Família de fontes para marcas d'água de texto |
| `fontSize` | number | `60` | Tamanho da fonte em pontos |
| `fontStyle` | string | `"bold"` | `"normal"`, `"bold"` ou `"italic"` |
| `color` | string | `"#CCCCCC"` | Código de cor hexadecimal |
| `opacity` | number | `0.2` | Nível de transparência de `0.0` (invisível) a `1.0` (opaca) |
| `rotation` | number | `45` | Ângulo de rotação em graus |
| `onTop` | boolean | `false` | Quando `true`, renderiza sobre os elementos da página; quando `false`, renderiza atrás |
| `repeat` | boolean | `false` | Quando `true`, repete a marca d'água pela página em um padrão alternado |
| `spacingX` | number | `null` | Espaçamento horizontal entre marcas d'água repetidas em pontos |
| `spacingY` | number | `null` | Espaçamento vertical entre marcas d'água repetidas em pontos |
| `printCondition` | string | `null` | expressão booleana que decide se a marca d'água é renderizada |

---

## Exemplo: Marca d'Água de Texto "Draft"

```json
{
  "version": "1.0",
  "pageSettings": {
    "size": "A4",
    "orientation": "portrait",
    "margins": { "top": 36, "right": 36, "bottom": 36, "left": 36 },
    "watermark": {
      "type": "text",
      "text": "DRAFT",
      "fontSize": 72,
      "color": "#DC2626",
      "opacity": 0.15,
      "rotation": 45,
      "printCondition": "status == 'draft'"
    }
  },
  "page": []
}
```

---

## Exemplo: Marca d'Água Dinâmica com Data Binding

```json
{
  "watermark": {
    "type": "text",
    "dataBinding": "watermarkLabel",
    "fontSize": 54,
    "color": "#64748B",
    "opacity": 0.2,
    "rotation": -30
  }
}
```

---

## Exemplo: Marca d'Água Repetida (Padrão Ladrilhado)

Para repetir um carimbo de segurança diagonalmente por toda a página:

```json
{
  "watermark": {
    "type": "text",
    "text": "CONFIDENTIAL",
    "fontSize": 32,
    "color": "#94A3B8",
    "opacity": 0.12,
    "rotation": 45,
    "repeat": true,
    "spacingX": 200,
    "spacingY": 140
  }
}
```
