# Elemento Rectangle

O `RectangleElement` desenha retângulos para fundos, bordas, divisores e decorações visuais.

## Funcionalidades

- ✅ **Dimensões flexíveis**: Valores absolutos ou percentuais
- ✅ **Cores personalizáveis**: Preenchimento e borda
- ✅ **Cantos arredondados**: Raio dos cantos configurável
- ✅ **Estilos de borda**: Sólida, tracejada, pontilhada
- ✅ **Transparência**: Suporta preenchimento ou borda transparentes

---

## Propriedades

| Propriedade | Tipo | Obrigatório | Descrição |
|-------------|------|-------------|-----------|
| `type` | string | ✅ | Deve ser `"rectangle"` |
| `id` | string | ✅ | Identificador único |
| `x` | number | ✅ | Posição X |
| `y` | number | ✅ | Posição Y |
| `width` | number\|string | ✅ | Largura (número ou "100%") |
| `height` | number\|string | ✅ | Altura (número ou "100%") |
| `style` | object | ❌ | Estilos do retângulo |
| `printCondition` | string | ❌ | Condição para renderizar |

---

## Estilos

```json
{
  "style": {
    "fillColor": "#2563eb",
    "borderColor": "#1e40af",
    "borderWidth": 2,
    "cornerRadius": 8,
    "penStyle": "solid"
  }
}
```

| Propriedade | Tipo | Descrição | Padrão |
|-------------|------|-----------|--------|
| `fillColor` | hex | Cor de preenchimento | `null` (transparente) |
| `borderColor` | hex | Cor da borda | `null` |
| `borderWidth` | number | Espessura da borda | `1` |
| `cornerRadius` | number | Raio dos cantos | `0` (quadrado) |
| `penStyle` | string | Estilo da linha | `solid` |

---

## Exemplo Básico

### Retângulo Simples

```json
{
  "type": "rectangle",
  "id": "box",
  "x": 50,
  "y": 100,
  "width": 200,
  "height": 100,
  "style": {
    "fillColor": "#dbeafe",
    "borderColor": "#2563eb",
    "borderWidth": 1
  }
}
```

---

## Dimensões

### Valores Absolutos

```json
{
  "width": 200,
  "height": 100
}
```

Valores fixos em pontos (pt).

---

### Valores Percentuais

```json
{
  "width": "100%",
  "height": "50%"
}
```

Percentual do container (cabeçalho, corpo ou rodapé).

**Exemplo prático:**
```json
{
  "type": "rectangle",
  "id": "header-background",
  "x": 0,
  "y": 0,
  "width": "100%",
  "height": 100,
  "style": {
    "fillColor": "#1e40af"
  }
}
```

Preenche toda a largura do cabeçalho com 100pt de altura.

---

## Cores

### Preenchimento

```json
{
  "style": {
    "fillColor": "#3b82f6"
  }
}
```

Retângulo preenchido, sem borda.

---

### Borda

```json
{
  "style": {
    "borderColor": "#ef4444",
    "borderWidth": 2
  }
}
```

Retângulo transparente com borda vermelha de 2pt.

---

### Ambos

```json
{
  "style": {
    "fillColor": "#fef3c7",
    "borderColor": "#f59e0b",
    "borderWidth": 1
  }
}
```

Retângulo amarelo claro com borda laranja.

---

### Transparente

Para um retângulo completamente transparente (marcador de posição):

```json
{
  "style": {
    "fillColor": null,
    "borderColor": null
  }
}
```

---

## Cantos Arredondados

### Raio dos Cantos

```json
{
  "style": {
    "cornerRadius": 12
  }
}
```

| Valor | Resultado |
|-------|-----------|
| `0` | Cantos quadrados (padrão) |
| `4-8` | Levemente arredondado |
| `12-16` | Moderadamente arredondado |
| `24+` | Bem arredondado |
| `width/2` | Círculo perfeito (se width = height) |

**Exemplos visuais:**

```json
// Cantos quadrados
{ "cornerRadius": 0 }
┌────────┐
│        │
└────────┘

// Levemente arredondado
{ "cornerRadius": 8 }
╭────────╮
│        │
╰────────╯

// Bem arredondado
{ "cornerRadius": 20 }
╭────────╮
│        │
╰────────╯

// Formato de pílula (height/2)
{ "cornerRadius": 25, "height": 50 }
╭───────╮
│       │
╰───────╯
```

---

## Estilos de Borda

### Sólida (padrão)

```json
{
  "style": {
    "penStyle": "solid"
  }
}
```

```
────────────────
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
─── ─── ─── ───
```

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
· · · · · · · ·
```

---

## Casos de Uso

### Fundo do Cabeçalho

```json
{
  "type": "rectangle",
  "id": "header-bg",
  "x": 0,
  "y": 0,
  "width": "100%",
  "height": 100,
  "style": {
    "fillColor": "#1e40af"
  }
}
```

---

### Caixa de Informação

```json
{
  "type": "rectangle",
  "id": "info-box",
  "x": 50,
  "y": 200,
  "width": 495,
  "height": 80,
  "style": {
    "fillColor": "#fef3c7",
    "borderColor": "#f59e0b",
    "borderWidth": 1,
    "cornerRadius": 8
  }
}
```

Com texto sobreposto:

```json
{
  "elements": [
    {
      "type": "rectangle",
      "id": "box",
      "x": 50,
      "y": 200,
      "width": 495,
      "height": 80,
      "style": {
        "fillColor": "#fef3c7",
        "borderColor": "#f59e0b",
        "borderWidth": 1,
        "cornerRadius": 8
      }
    },
    {
      "type": "text",
      "id": "box-text",
      "x": 70,
      "y": 230,
      "value": "⚠️ Attention: Electronic fiscal document",
      "style": {
        "fontSize": 12,
        "fontWeight": "bold",
        "color": "#92400e"
      }
    }
  ]
}
```

---

### Divisor Visual

```json
{
  "type": "rectangle",
  "id": "divider",
  "x": 50,
  "y": 300,
  "width": 495,
  "height": 2,
  "style": {
    "fillColor": "#e5e7eb"
  }
}
```

---

### Badge/Tag

```json
{
  "type": "rectangle",
  "id": "vip-badge",
  "x": 450,
  "y": 50,
  "width": 80,
  "height": 30,
  "style": {
    "fillColor": "#dc2626",
    "cornerRadius": 15
  }
}
```

Com texto:

```json
{
  "type": "text",
  "x": 465,
  "y": 60,
  "value": "VIP",
  "style": {
    "fontSize": 12,
    "fontWeight": "bold",
    "color": "#ffffff"
  }
}
```

---

### Borda Tracejada (Linha de Corte)

```json
{
  "type": "rectangle",
  "id": "cut-line",
  "x": 20,
  "y": 750,
  "width": 555,
  "height": 1,
  "style": {
    "borderColor": "#9ca3af",
    "borderWidth": 1,
    "penStyle": "dashed"
  }
}
```

---

### Fundo com Gradiente (Simulado)

Como não há suporte nativo a gradientes, simule com múltiplos retângulos:

```json
{
  "elements": [
    {
      "type": "rectangle",
      "x": 0,
      "y": 0,
      "width": "100%",
      "height": 20,
      "style": {
        "fillColor": "#1e40af"
      }
    },
    {
      "type": "rectangle",
      "x": 0,
      "y": 20,
      "width": "100%",
      "height": 20,
      "style": {
        "fillColor": "#2563eb"
      }
    },
    {
      "type": "rectangle",
      "x": 0,
      "y": 40,
      "width": "100%",
      "height": 20,
      "style": {
        "fillColor": "#3b82f6"
      }
    }
  ]
}
```

---

## Auxiliar de Grade/Layout

Use retângulos transparentes para depurar o layout:

```json
{
  "type": "rectangle",
  "id": "debug-area",
  "x": 50,
  "y": 100,
  "width": 200,
  "height": 300,
  "style": {
    "borderColor": "#ff0000",
    "borderWidth": 1,
    "penStyle": "dotted"
  }
}
```

::: tip Dica de Depuração
Adicione retângulos com borda vermelha pontilhada para visualizar as áreas dos elementos durante o desenvolvimento. Remova antes de ir para produção!
:::

---

## Condições

Exiba o retângulo apenas sob determinadas condições:

```json
{
  "type": "rectangle",
  "style": {
    "fillColor": "#dcfce7",
    "borderColor": "#16a34a"
  },
  "printCondition": "status == 'approved'"
}
```

---

## Sobreposição (Z-index)

Os retângulos são renderizados na ordem em que aparecem no template:

```json
{
  "elements": [
    {
      "type": "rectangle",
      "id": "background",
      "x": 50,
      "y": 100,
      "width": 200,
      "height": 100,
      "style": {
        "fillColor": "#dbeafe"
      }
    },
    {
      "type": "rectangle",
      "id": "foreground",
      "x": 100,
      "y": 150,
      "width": 100,
      "height": 50,
      "style": {
        "fillColor": "#fef3c7"
      }
    }
  ]
}
```

O segundo retângulo aparece por cima do primeiro.

---

## Performance

::: tip Otimização
- Retângulos são muito leves
- Use livremente para fundos e divisores
- Prefira retângulos a imagens quando possível
- A renderização é instantânea
:::

---

## Limitações

- ❌ Não suporta gradientes nativos
- ❌ Não suporta sombras
- ❌ Não suporta transformações (rotação, inclinação)
- ❌ `cornerRadius` é o mesmo para todos os cantos
- ❌ Não suporta múltiplas bordas (dupla, chanfrada etc.)

---

## Cores Hexadecimais

Use sempre o formato de 6 dígitos:

```json
✅ "#2563eb"
✅ "#ff0000"
✅ "#f3f4f6"

❌ "#fff"  // Não funciona
❌ "blue"  // Não funciona
❌ "rgb(255,0,0)"  // Não funciona
```

---

## Próximos Passos

- [Elemento Line](/pt/lib/guide/elements/line) - Linhas e divisores
- [Elemento Image](/pt/lib/guide/elements/image) - Fundos com imagens
- [Elemento Text](/pt/lib/guide/elements/text) - Texto sobreposto
- [Exemplos](/pt/lib/examples/) - Veja o Rectangle em ação
