# Cabeçalho e Rodapé Fixos

Cabeçalhos e rodapés fixos são elementos que se repetem em todas as páginas do documento, ideais para logotipos, títulos, numeração de páginas e informações legais.

## Visão Geral

```
┌─────────────────────────────────────────┐
│  ┌───────────────────────────────────┐  │
│  │         FIXED HEADER              │  │ ← Repeats on all pages
│  └───────────────────────────────────┘  │
│                                         │
│           PAGE CONTENT                  │
│           (Body / Elements)             │
│                                         │
│  ┌───────────────────────────────────┐  │
│  │         FIXED FOOTER              │  │ ← Repeats on all pages
│  └───────────────────────────────────┘  │
└─────────────────────────────────────────┘
```

---

## Estrutura do Template

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
  "fixedHeader": {
    "height": 80,
    "elements": [...]
  },
  "fixedFooter": {
    "height": 50,
    "elements": [...]
  },
  "elements": [...]
}
```

---

## Cabeçalho Fixo

### Propriedades

| Propriedade | Tipo | Obrigatório | Descrição |
|----------|------|----------|-------------|
| `height` | number | ✅ | Altura do cabeçalho em pontos |
| `elements` | array | ✅ | Lista de elementos |

### Exemplo Básico

```json
{
  "fixedHeader": {
    "height": 80,
    "elements": [
      {
        "type": "rectangle",
        "id": "header-bg",
        "x": 0,
        "y": 0,
        "width": "100%",
        "height": 80,
        "style": {
          "fillColor": "#1e40af"
        }
      },
      {
        "type": "image",
        "id": "logo",
        "x": 30,
        "y": 15,
        "width": 120,
        "height": 50,
        "source": "https://company.com/logo.png",
        "fit": "contain"
      },
      {
        "type": "text",
        "id": "company-name",
        "x": 170,
        "y": 25,
        "value": "MY COMPANY LTD",
        "style": {
          "fontSize": 16,
          "fontWeight": "bold",
          "color": "#ffffff"
        }
      },
      {
        "type": "text",
        "id": "company-id",
        "x": 170,
        "y": 50,
        "value": "ID: 12.345.678/0001-99",
        "style": {
          "fontSize": 10,
          "color": "#93c5fd"
        }
      }
    ]
  }
}
```

---

## Rodapé Fixo

### Propriedades

| Propriedade | Tipo | Obrigatório | Descrição |
|----------|------|----------|-------------|
| `height` | number | ✅ | Altura do rodapé em pontos |
| `elements` | array | ✅ | Lista de elementos |

### Exemplo Básico

```json
{
  "fixedFooter": {
    "height": 50,
    "elements": [
      {
        "type": "line",
        "id": "footer-line",
        "x": 30,
        "y": 0,
        "width": 565,
        "height": 0,
        "style": {
          "color": "#d1d5db",
          "width": 1
        }
      },
      {
        "type": "text",
        "id": "footer-text",
        "x": 30,
        "y": 15,
        "value": "Automatically generated document",
        "style": {
          "fontSize": 8,
          "color": "#6b7280"
        }
      },
      {
        "type": "text",
        "id": "footer-page",
        "x": 500,
        "y": 15,
        "value": "Page ${_pageNumber}",
        "style": {
          "fontSize": 8,
          "color": "#6b7280"
        }
      }
    ]
  }
}
```

---

## Variáveis de Sistema

Dentro de cabeçalhos e rodapés, você pode usar variáveis de sistema especiais:

| Variável | Descrição | Exemplo |
|----------|-------------|---------|
| `_pageNumber` | Número da página atual | 1, 2, 3... |
| `_date` | Data atual (YYYY-MM-DD) | 2026-01-16 |
| `_dateTime` | Data e hora atuais | 2026-01-16T14:30:45 |

### Exemplo de Uso

```json
{
  "type": "text",
  "dataBinding": "_pageNumber",
  "style": {
    "fontSize": 9
  }
}
```

Ou combinado com texto:

```json
{
  "type": "text",
  "value": "Page ${_pageNumber}",
  "style": {
    "fontSize": 9
  }
}
```

### Data no Rodapé

```json
{
  "type": "text",
  "value": "Generated on: ${_date}",
  "style": {
    "fontSize": 8,
    "color": "#6b7280"
  }
}
```

---

## Cabeçalho/Rodapé Condicional

Você pode controlar quando o cabeçalho/rodapé é exibido usando `printCondition`:

### Propriedades

| Propriedade | Tipo | Descrição |
|----------|------|-------------|
| `printCondition` | string | Condição para exibir/ocultar o cabeçalho/rodapé |

### Exibir Cabeçalho Apenas da Página 2 em Diante

```json
{
  "header": {
    "height": 60,
    "printCondition": "_pageNumber > 1",
    "elements": [...]
  }
}
```

### Exibir Rodapé Apenas na Primeira Página

```json
{
  "footer": {
    "height": 40,
    "printCondition": "_pageNumber == 1",
    "elements": [...]
  }
}
```

### Com Base nos Dados

```json
{
  "header": {
    "height": 80,
    "printCondition": "showHeader == true",
    "elements": [...]
  }
}
```

::: tip Espaço Dinâmico
Ao usar `printCondition` com `_pageNumber`, o espaço do cabeçalho/rodapé é ajustado automaticamente por página. Por exemplo, se o cabeçalho só aparece da página 2 em diante, a página 1 terá mais espaço para o conteúdo.
:::

---

## Coordenadas

### Sistema de Coordenadas

Dentro de `fixedHeader` e `fixedFooter`, as coordenadas são **relativas** ao contêiner:

```
Header (height: 80)
┌─────────────────────────────────────────┐
│ (0,0)                           (565,0) │
│                                         │
│                                         │
│ (0,80)                         (565,80) │
└─────────────────────────────────────────┘

Footer (height: 50)
┌─────────────────────────────────────────┐
│ (0,0)                           (565,0) │
│                                         │
│ (0,50)                         (565,50) │
└─────────────────────────────────────────┘
```

- `x=0` → margem esquerda da página
- `y=0` → topo do contêiner (cabeçalho) ou topo do rodapé
- Largura disponível: `pageWidth - marginLeft - marginRight`

---

## Largura de 100%

Use `"100%"` para preencher toda a largura:

```json
{
  "type": "rectangle",
  "x": 0,
  "y": 0,
  "width": "100%",
  "height": 80,
  "style": {
    "fillColor": "#1e40af"
  }
}
```

O retângulo ocupará toda a largura disponível (página - margens).

---

## Exemplo Completo: Fatura

```json
{
  "version": "1.0",
  "pageSettings": {
    "size": "A4",
    "orientation": "portrait",
    "margins": {
      "top": 20,
      "right": 30,
      "bottom": 20,
      "left": 30
    }
  },
  "fixedHeader": {
    "height": 120,
    "elements": [
      {
        "type": "rectangle",
        "id": "header-bg",
        "x": 0,
        "y": 0,
        "width": "100%",
        "height": 120,
        "style": {
          "fillColor": "#1e3a8a"
        }
      },
      {
        "type": "image",
        "id": "logo",
        "x": 20,
        "y": 20,
        "width": 100,
        "height": 80,
        "source": "logo.png",
        "fit": "contain"
      },
      {
        "type": "text",
        "id": "company",
        "x": 140,
        "y": 25,
        "value": "EXAMPLE COMPANY INC.",
        "style": {
          "fontSize": 18,
          "fontWeight": "bold",
          "color": "#ffffff"
        }
      },
      {
        "type": "text",
        "id": "company-id",
        "x": 140,
        "y": 50,
        "value": "ID: 12.345.678/0001-99",
        "style": {
          "fontSize": 10,
          "color": "#93c5fd"
        }
      },
      {
        "type": "text",
        "id": "address",
        "x": 140,
        "y": 70,
        "value": "123 Main Street - New York/NY",
        "style": {
          "fontSize": 9,
          "color": "#93c5fd"
        }
      },
      {
        "type": "text",
        "id": "inv-label",
        "x": 400,
        "y": 30,
        "value": "INVOICE",
        "style": {
          "fontSize": 14,
          "fontWeight": "bold",
          "color": "#fbbf24"
        }
      },
      {
        "type": "text",
        "id": "inv-number",
        "x": 400,
        "y": 50,
        "dataBinding": "invoice.number | padLeft:9:'0'",
        "style": {
          "fontSize": 12,
          "color": "#ffffff"
        }
      }
    ]
  },
  "fixedFooter": {
    "height": 60,
    "elements": [
      {
        "type": "line",
        "id": "footer-line",
        "x": 0,
        "y": 5,
        "width": 535,
        "height": 5,
        "style": {
          "color": "#d1d5db",
          "width": 0.5
        }
      },
      {
        "type": "text",
        "id": "footer-info",
        "x": 0,
        "y": 20,
        "value": "This document is a graphical representation of the invoice",
        "style": {
          "fontSize": 7,
          "color": "#9ca3af"
        }
      },
      {
        "type": "text",
        "id": "footer-key",
        "x": 0,
        "y": 35,
        "dataBinding": "invoice.key",
        "style": {
          "fontSize": 6,
          "fontFamily": "Courier",
          "color": "#6b7280"
        }
      },
      {
        "type": "text",
        "id": "page",
        "x": 480,
        "y": 20,
        "value": "Page ${_pageNumber}",
        "style": {
          "fontSize": 9,
          "color": "#6b7280"
        }
      }
    ]
  },
  "elements": [
    {
      "type": "table",
      "id": "items",
      "x": 0,
      "y": 20,
      "dataBinding": "invoice.items",
      "paginated": true,
      "columns": [...]
    }
  ]
}
```

---

## Layout Multi-Column no Cabeçalho

Crie layouts complexos posicionando os elementos manualmente:

```json
{
  "fixedHeader": {
    "height": 100,
    "elements": [
      {
        "type": "rectangle",
        "x": 0,
        "y": 0,
        "width": "100%",
        "height": 100,
        "style": { "fillColor": "#f3f4f6" }
      },
      
      {
        "type": "text",
        "x": 20,
        "y": 15,
        "value": "COLUMN 1",
        "style": { "fontWeight": "bold" }
      },
      {
        "type": "text",
        "x": 20,
        "y": 35,
        "value": "Line 1"
      },
      {
        "type": "text",
        "x": 20,
        "y": 50,
        "value": "Line 2"
      },
      
      {
        "type": "text",
        "x": 200,
        "y": 15,
        "value": "COLUMN 2",
        "style": { "fontWeight": "bold" }
      },
      {
        "type": "text",
        "x": 200,
        "y": 35,
        "value": "Line 1"
      },
      {
        "type": "text",
        "x": 200,
        "y": 50,
        "value": "Line 2"
      },
      
      {
        "type": "text",
        "x": 380,
        "y": 15,
        "value": "COLUMN 3",
        "style": { "fontWeight": "bold" }
      },
      {
        "type": "text",
        "x": 380,
        "y": 35,
        "value": "Line 1"
      },
      {
        "type": "text",
        "x": 380,
        "y": 50,
        "value": "Line 2"
      }
    ]
  }
}
```

---

## Dicas

### 1. Calcule a Área Útil

```
Usable body area = pageHeight - marginTop - marginBottom - headerHeight - footerHeight

A4 Portrait:
842 - 30 - 30 - 80 - 50 = 652pt usable area for content
```

### 2. Use Linhas Divisórias

```json
{
  "type": "line",
  "x": 0,
  "y": 79,
  "width": 535,
  "height": 79,
  "style": {
    "color": "#e5e7eb",
    "width": 1
  }
}
```

### 3. QR Code no Rodapé

```json
{
  "type": "barcode",
  "id": "qr-validation",
  "x": 480,
  "y": 5,
  "width": 45,
  "height": 45,
  "barcodeType": "qrcode",
  "dataBinding": "document.validationUrl"
}
```

---

## Limitações

- ❌ A altura é fixa (não se ajusta automaticamente ao conteúdo)
- ❌ Não suporta múltiplos cabeçalhos/rodapés (apenas um cabeçalho e um rodapé)
- ❌ `totalPages` ainda não é suportado (apenas `_pageNumber` está disponível)

---

## Desempenho

::: tip Otimização
- Cabeçalhos/rodapés são renderizados uma vez e replicados
- Imagens no cabeçalho são armazenadas em cache automaticamente
- Prefira SVG/PNG leves para logotipos
:::

---

## Próximos Passos

- [Paginação](/pt/lib/guide/advanced/pagination) - Controle de quebra de página
- [Elemento Table](/pt/lib/guide/elements/table) - Tabelas paginadas com cabeçalho repetido
- [Exemplos](/pt/lib/examples/) - Veja cabeçalho/rodapé em ação
