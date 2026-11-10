# Templates

Templates são definidos em JSON e descrevem o layout e o conteúdo do PDF.

## Estrutura Básica

```json
{
  "version": "1.0",
  "pageSettings": {
    "size": "A4",
    "orientation": "portrait",
    "margins": {
      "top": 30,
      "right": 30,
      "bottom": 30,
      "left": 30
    }
  },
  "pageElements": []
}
```

## Configurações de Página

### Tamanho

| Valor | Dimensões |
|-------|-----------|
| `A4` | 595 x 842 pt |
| `A3` | 842 x 1191 pt |
| `LETTER` | 612 x 792 pt |
| `LEGAL` | 612 x 1008 pt |

### Orientação

| Valor | Descrição |
|-------|-----------|
| `portrait` | Vertical (padrão) |
| `landscape` | Horizontal |

### Margens

```json
{
  "margins": {
    "top": 30,
    "right": 30,
    "bottom": 30,
    "left": 30
  }
}
```

Todos os valores são em pontos (pt). 1 polegada = 72 pt.

---

## Elementos

Os elementos são os blocos de construção do seu PDF. Cada elemento possui:

```json
{
  "type": "text",
  "id": "unique-id",
  "x": 50,
  "y": 100,
  "width": 200,
  "height": 50
}
```

### Propriedades Comuns

| Propriedade | Tipo | Obrigatório | Descrição |
|-------------|------|-------------|-----------|
| `type` | string | ✅ | Tipo do elemento |
| `id` | string | ✅ | Identificador único |
| `x` | number | ✅ | Posição X (a partir da esquerda) |
| `y` | number | ✅ | Posição Y (a partir do topo) |
| `width` | number | ❌ | Largura |
| `height` | number | ❌ | Altura |
| `printCondition` | string | ❌ | Condição para renderização |

### Elementos Disponíveis

| Tipo | Descrição |
|------|-----------|
| `text` | Texto estático ou dinâmico |
| `image` | Imagens (URL, arquivo, base64) |
| `table` | Tabelas com paginação |
| `rectangle` | Retângulos e fundos |
| `line` | Linhas |
| `barcode` | QR Codes e códigos de barra |
| `conditional` | Grupos condicionais |
| `loop` | Repetição de elementos |
| `container` | Bloco modular com elementos filhos, auto-height e bordas |
| `rich-text` | Texto formatado com Markdown (negrito, itálico) |
| `link` | Links clicáveis (URL ou email) |
| `list` | Listas numeradas ou com marcadores |
| `check-list` | Listas de verificação (checkbox) |
| `spacer` | Espaçador vertical para fluxo dinâmico |

---

## Header e Footer Fixos

```json
{
  "version": "1.0",
  "pageSettings": { ... },
  "fixedHeader": {
    "height": 80,
    "elements": [
      {
        "type": "text",
        "id": "header-title",
        "x": 50,
        "y": 30,
        "value": "Company Name"
      }
    ]
  },
  "fixedFooter": {
    "height": 50,
    "elements": [
      {
        "type": "text",
        "id": "page-number",
        "x": 280,
        "y": 20,
        "dataBinding": "$currentPage | prefix:'Page ' | suffix:' of ' | concat:$totalPages"
      }
    ]
  },
  "pageElements": [ ... ]
}
```

Headers e footers se repetem automaticamente em todas as páginas.

---

## Próximos Passos

- [Data Binding](/lib/guide/data-binding) - Vincule dados dinâmicos
- [Elementos](/lib/guide/elements/text) - Conheça cada elemento
- [Exemplos](/lib/examples/) - Veja exemplos práticos
