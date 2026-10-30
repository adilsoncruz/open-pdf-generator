# Elemento Line

O `LineElement` desenha linhas retas (horizontais, verticais ou diagonais) para divisores, sublinhados e decorações.

## Funcionalidades

- ✅ **Qualquer direção**: Horizontal, vertical ou diagonal
- ✅ **Diversos estilos**: Sólida, tracejada, pontilhada
- ✅ **Espessura personalizável**: De linhas finíssimas a grossas
- ✅ **Padrões personalizados**: Padrões de tracejado flexíveis
- ✅ **Leve e rápida**: Renderização instantânea

---

## Propriedades

| Propriedade | Tipo | Obrigatório | Descrição |
|-------------|------|-------------|-----------|
| `type` | string | ✅ | Deve ser `"line"` |
| `id` | string | ✅ | Identificador único |
| `x` | number | ✅ | Posição X inicial |
| `y` | number | ✅ | Posição Y inicial |
| `width` | number | ✅ | Posição X final |
| `height` | number | ✅ | Posição Y final |
| `style` | object | ❌ | Estilos da linha |
| `printCondition` | string | ❌ | Condição para renderizar |

---

## Estilos

```json
{
  "style": {
    "color": "#9ca3af",
    "width": 1,
    "penStyle": "solid",
    "dashPattern": null
  }
}
```

| Propriedade | Tipo | Descrição | Padrão |
|-------------|------|-----------|--------|
| `color` | hex | Cor da linha | `#000000` |
| `width` | number | Espessura em pontos | `1` |
| `penStyle` | string | Estilo: `solid`, `dashed`, `dotted` | `solid` |
| `dashPattern` | array | Padrão personalizado `[traço, intervalo]` | `null` |

::: tip Dica
`penStyle` tem prioridade sobre `dashPattern`. Use um ou outro.
:::

---

## Exemplo Básico

### Linha Horizontal

```json
{
  "type": "line",
  "id": "divider",
  "x": 50,
  "y": 300,
  "width": 545,
  "height": 300,
  "style": {
    "color": "#d1d5db",
    "width": 1
  }
}
```

### Linha Vertical

```json
{
  "type": "line",
  "id": "separator",
  "x": 300,
  "y": 100,
  "width": 300,
  "height": 700,
  "style": {
    "color": "#9ca3af",
    "width": 0.5
  }
}
```

### Linha Diagonal

```json
{
  "type": "line",
  "id": "diagonal",
  "x": 50,
  "y": 50,
  "width": 200,
  "height": 150,
  "style": {
    "color": "#ef4444",
    "width": 2
  }
}
```

---

## Direções

### Horizontal (→)

```json
{
  "x": 50,
  "y": 300,
  "width": 545,
  "height": 300
}
```

`y` igual, `width > x`

---

### Vertical (↓)

```json
{
  "x": 300,
  "y": 100,
  "width": 300,
  "height": 700
}
```

`x` igual, `height > y`

---

### Diagonal (↘)

```json
{
  "x": 50,
  "y": 50,
  "width": 200,
  "height": 200
}
```

`width > x` e `height > y`

---

### Diagonal Inversa (↙)

```json
{
  "x": 200,
  "y": 50,
  "width": 50,
  "height": 200
}
```

`width < x` e `height > y`

---

## Espessura

### Finíssima (Hairline)

```json
{
  "style": {
    "width": 0.5
  }
}
```

```
────────────────
```

Ideal para: Detalhes delicados, linhas sutis

---

### Normal

```json
{
  "style": {
    "width": 1
  }
}
```

```
────────────────
```

Ideal para: Divisores padrão, bordas

---

### Média

```json
{
  "style": {
    "width": 2
  }
}
```

```
━━━━━━━━━━━━━━━━
```

Ideal para: Títulos, seções importantes

---

### Grossa

```json
{
  "style": {
    "width": 4
  }
}
```

```
████████████████
```

Ideal para: Grandes divisões, ênfase

---

## Estilos de Linha

### Sólida (padrão)

```json
{
  "style": {
    "penStyle": "solid"
  }
}
```

```
────────────────────────
```

---

### Tracejada

```json
{
  "style": {
    "penStyle": "dashed"
  }
}
```

```
─── ─── ─── ─── ─── ───
```

Padrão interno: `[6, 3]`

---

### Pontilhada

```json
{
  "style": {
    "penStyle": "dotted"
  }
}
```

```
· · · · · · · · · · · ·
```

Padrão interno: `[1, 2]`

---

## Padrões Personalizados (dashPattern)

### Formato

```json
{
  "style": {
    "dashPattern": [dash, gap]
  }
}
```

O array define o padrão de traços e intervalos.

---

### Exemplos de Padrões

#### Traços Curtos

```json
{
  "dashPattern": [5, 3]
}
```

```
─── ─── ─── ─── ───
```

---

#### Traços Longos

```json
{
  "dashPattern": [10, 5]
}
```

```
────── ────── ──────
```

---

#### Pontos

```json
{
  "dashPattern": [1, 3]
}
```

```
· · · · · · · · · ·
```

---

#### Traço-Ponto

```json
{
  "dashPattern": [10, 3, 2, 3]
}
```

```
────── · ────── · ──────
```

---

#### Traço-Ponto-Ponto

```json
{
  "dashPattern": [10, 3, 2, 3, 2, 3]
}
```

```
────── · · ────── · · ──────
```

---

## Casos de Uso

### Divisor de Seção

```json
{
  "type": "line",
  "id": "section-divider",
  "x": 50,
  "y": 250,
  "width": 545,
  "height": 250,
  "style": {
    "color": "#e5e7eb",
    "width": 1
  }
}
```

---

### Linha de Corte

```json
{
  "type": "line",
  "id": "cut-line",
  "x": 20,
  "y": 750,
  "width": 575,
  "height": 750,
  "style": {
    "color": "#9ca3af",
    "width": 0.5,
    "dashPattern": [10, 5]
  }
}
```

Com texto:

```json
{
  "type": "text",
  "x": 10,
  "y": 745,
  "value": "✂",
  "style": {
    "fontSize": 12,
    "color": "#9ca3af"
  }
}
```

---

### Sublinhado

```json
{
  "type": "text",
  "id": "title",
  "x": 50,
  "y": 100,
  "value": "ANNUAL REPORT 2025",
  "style": {
    "fontSize": 18,
    "fontWeight": "bold"
  }
}
{
  "type": "line",
  "id": "underline",
  "x": 50,
  "y": 122,
  "width": 250,
  "height": 122,
  "style": {
    "color": "#2563eb",
    "width": 2
  }
}
```

---

### Grade / Tabela Manual

```json
{
  "elements": [
    {
      "type": "line",
      "id": "line-h1",
      "x": 50,
      "y": 200,
      "width": 545,
      "height": 200
    },
    {
      "type": "line",
      "id": "line-h2",
      "x": 50,
      "y": 230,
      "width": 545,
      "height": 230
    },
    {
      "type": "line",
      "id": "line-v1",
      "x": 50,
      "y": 200,
      "width": 50,
      "height": 230
    },
    {
      "type": "line",
      "id": "line-v2",
      "x": 250,
      "y": 200,
      "width": 250,
      "height": 230
    },
    {
      "type": "line",
      "id": "line-v3",
      "x": 545,
      "y": 200,
      "width": 545,
      "height": 230
    }
  ]
}
```

::: tip Dica
Para tabelas, use o [`TableElement`](/pt/lib/guide/elements/table), que é mais fácil!
:::

---

### Borda de Caixa

```json
{
  "elements": [
    {
      "type": "line",
      "id": "top",
      "x": 50,
      "y": 100,
      "width": 250,
      "height": 100
    },
    {
      "type": "line",
      "id": "bottom",
      "x": 50,
      "y": 200,
      "width": 250,
      "height": 200
    },
    {
      "type": "line",
      "id": "left",
      "x": 50,
      "y": 100,
      "width": 50,
      "height": 200
    },
    {
      "type": "line",
      "id": "right",
      "x": 250,
      "y": 100,
      "width": 250,
      "height": 200
    }
  ]
}
```

::: tip Dica
Para retângulos, use o [`RectangleElement`](/pt/lib/guide/elements/rectangle), que é mais simples!
:::

---

### Seta (Simulada)

```json
{
  "elements": [
    {
      "type": "line",
      "id": "arrow-body",
      "x": 100,
      "y": 200,
      "width": 300,
      "height": 200,
      "style": {
        "color": "#2563eb",
        "width": 2
      }
    },
    {
      "type": "line",
      "id": "arrow-tip-1",
      "x": 300,
      "y": 200,
      "width": 285,
      "height": 190,
      "style": {
        "color": "#2563eb",
        "width": 2
      }
    },
    {
      "type": "line",
      "id": "arrow-tip-2",
      "x": 300,
      "y": 200,
      "width": 285,
      "height": 210,
      "style": {
        "color": "#2563eb",
        "width": 2
      }
    }
  ]
}
```

---

## Condições

Exiba a linha apenas sob determinadas condições:

```json
{
  "type": "line",
  "x": 50,
  "y": 500,
  "width": 545,
  "height": 500,
  "printCondition": "showDivider == true"
}
```

---

## Dentro de Loops

```json
{
  "type": "loop",
  "dataBinding": "items",
  "ySpacing": 40,
  "elements": [
    {
      "type": "text",
      "x": 50,
      "y": 0,
      "dataBinding": "$item.name"
    },
    {
      "type": "line",
      "x": 50,
      "y": 25,
      "width": 545,
      "height": 25,
      "style": {
        "color": "#e5e7eb",
        "width": 0.5
      }
    }
  ]
}
```

Cria uma linha divisória depois de cada item.

---

## Performance

::: tip Otimização
- Linhas são extremamente leves
- Use livremente para divisores e decorações
- A renderização é instantânea
- Sem impacto no tamanho do PDF
:::

---

## Limitações

- ❌ Não suporta curvas (apenas linhas retas)
- ❌ Não suporta setas nativas
- ❌ Não suporta gradientes
- ❌ Não suporta sombras
- ❌ Padrões de tracejado muito complexos podem não renderizar bem

---

## Cálculo de Coordenadas

### Linha Horizontal Ocupando Toda a Largura

```json
{
  "x": 30,
  "y": 300,
  "width": 565,  // 595 (A4) - 30 (margem)
  "height": 300
}
```

### Linha Vertical Ocupando Toda a Altura

```json
{
  "x": 300,
  "y": 30,
  "width": 300,
  "height": 812  // 842 (A4) - 30 (margem)
}
```

---

## Cores

Use sempre o formato hexadecimal de 6 dígitos:

```json
✅ "#9ca3af"
✅ "#000000"
✅ "#ff0000"

❌ "#aaa"  // Não funciona
❌ "gray"  // Não funciona
❌ "rgb(156,163,175)"  // Não funciona
```

---

## Dicas de Design

### Divisores Sutis

```json
{
  "style": {
    "color": "#e5e7eb",
    "width": 0.5
  }
}
```

### Divisores Médios

```json
{
  "style": {
    "color": "#d1d5db",
    "width": 1
  }
}
```

### Divisores Fortes

```json
{
  "style": {
    "color": "#9ca3af",
    "width": 2
  }
}
```

---

## Próximos Passos

- [Elemento Rectangle](/pt/lib/guide/elements/rectangle) - Alternativa para bordas completas
- [Elemento Text](/pt/lib/guide/elements/text) - Combine com sublinhados
- [Elemento Table](/pt/lib/guide/elements/table) - Alternativa para grades
- [Exemplos](/pt/lib/examples/) - Veja o Line em ação
