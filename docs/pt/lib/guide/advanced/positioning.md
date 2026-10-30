# Posicionamento de Elementos

Por padrão, todos os elementos usam posicionamento absoluto com coordenadas X e Y fixas. A partir da versão 1.1, você pode usar **posicionamento relativo** para criar layouts dinâmicos.

## Modo de Posição

| Modo | Comportamento |
|------|----------|
| `ABSOLUTE` | Posição fixa no canvas (padrão) |
| `RELATIVE` | Posição baseada no conteúdo anterior |

---

## Posicionamento Absoluto

O modo padrão. As coordenadas `x` e `y` definem a posição exata do elemento na página.

```json
{
  "type": "text",
  "x": 50,
  "y": 100,
  "value": "This text is at position (50, 100)"
}
```

**Use quando:**
- O layout é fixo e previsível
- Os elementos não dependem de conteúdo dinâmico
- Cabeçalhos, rodapés e rótulos estáticos

---

## Posicionamento Relativo

O elemento é posicionado em relação ao elemento anterior. O `y` do canvas é ignorado e `relativeOffsetY` é usado para definir o espaçamento.

```json
{
  "type": "text",
  "x": 50,
  "positionMode": "RELATIVE",
  "relativeOffsetY": 20,
  "value": "This text appears 20pt below the previous element"
}
```

### Propriedades

| Propriedade | Tipo | Descrição |
|----------|------|-------------|
| `positionMode` | string | `"ABSOLUTE"` ou `"RELATIVE"` |
| `relativeOffsetY` | number | Espaçamento vertical (padrão: 10) |

**Use quando:**
- O layout depende de conteúdo dinâmico
- Depois de loops com número variável de itens
- Depois de textos multilinhas com `overflow: auto`

---

## Exemplo: Fatura com Loop

Um caso comum é ter os itens de um loop seguidos pelo total:

```json
{
  "elements": [
    {
      "type": "text",
      "id": "title",
      "x": 50,
      "y": 50,
      "value": "INVOICE ITEMS",
      "style": { "fontWeight": "bold" }
    },
    {
      "type": "loop",
      "id": "items",
      "dataBinding": "items",
      "x": 50,
      "y": 80,
      "width": 500,
      "height": 30,
      "itemSpacing": 5,
      "elements": [
        {
          "type": "text",
          "x": 0,
          "y": 5,
          "dataBinding": "name"
        },
        {
          "type": "text",
          "x": 400,
          "y": 5,
          "dataBinding": "price | currency:'BRL'"
        }
      ]
    },
    {
      "type": "line",
      "id": "separator",
      "x": 50,
      "y": 0,
      "width": 550,
      "height": 0,
      "positionMode": "RELATIVE",
      "relativeOffsetY": 10
    },
    {
      "type": "text",
      "id": "total",
      "x": 400,
      "y": 0,
      "positionMode": "RELATIVE",
      "relativeOffsetY": 15,
      "dataBinding": "total | currency:'BRL'",
      "style": { 
        "fontWeight": "bold",
        "fontSize": 14 
      }
    }
  ]
}
```

### Comportamento

1. **Título** - Posição absoluta em (50, 50)
2. **Loop** - Inicia em (50, 80), cada item tem 30pt de altura + 5pt de espaçamento
3. **Linha separadora** - Posicionada 10pt abaixo do último item do loop
4. **Total** - Posicionado 15pt abaixo da linha

Não importa quantos itens o loop tenha: a separadora e o total são sempre posicionados corretamente!

---

## Combinando com Overflow Auto

Para textos multilinhas que podem ter tamanhos variáveis:

```json
[
  {
    "type": "text",
    "id": "description",
    "x": 50,
    "y": 100,
    "width": 500,
    "height": 50,
    "dataBinding": "description",
    "style": {
      "multiline": true,
      "overflow": "auto"
    }
  },
  {
    "type": "text",
    "id": "signature",
    "x": 50,
    "positionMode": "RELATIVE",
    "relativeOffsetY": 30,
    "value": "_____________________\nSignature"
  }
]
```

O `overflow: auto` faz com que a altura do texto se ajuste ao conteúdo, e o elemento de assinatura é posicionado após todo o texto, não importa quantas linhas ele tenha.

---

## Ordem dos Elementos

::: warning Importante
O posicionamento relativo depende da **ordem dos elementos** no array. O cálculo do `currentY` é feito sequencialmente.
:::

Elementos com `positionMode: RELATIVE` são posicionados em relação ao `currentY` acumulado, que é atualizado após cada elemento renderizado.

---

## Limitações

- ❌ Não funciona no cabeçalho e no rodapé (use layout fixo)
- ❌ Não afeta a posição X (apenas o Y é relativo)
- ❌ Elementos dentro de loops usam posicionamento local ao loop

---

## Próximos Passos

- [Elemento Loop](/pt/lib/guide/elements/loop) - Loops com paginação automática
- [Elemento Text](/pt/lib/guide/elements/text) - Texto multilinha com overflow
- [Paginação](/pt/lib/guide/advanced/pagination) - Entenda como a paginação funciona
