# Elemento Barcode

O `BarcodeElement` gera QR Codes e códigos de barras dinamicamente a partir dos dados vinculados.

## Funcionalidades

- ✅ **QR Code**: Códigos 2D para URLs, PIX, dados complexos
- ✅ **Código de barras**: Code 128 para SKUs, produtos
- ✅ **Correção de erro**: 4 níveis para QR Code
- ✅ **Alta qualidade**: Escalado 2x para impressão
- ✅ **Data binding**: Valores dinâmicos a partir dos dados

---

## Propriedades

| Propriedade | Tipo | Obrigatório | Descrição |
|-------------|------|-------------|-----------|
| `type` | string | ✅ | Deve ser `"barcode"` |
| `id` | string | ✅ | Identificador único |
| `x` | number | ✅ | Posição X |
| `y` | number | ✅ | Posição Y |
| `width` | number | ✅ | Largura |
| `height` | number | ✅ | Altura |
| `barcodeType` | string | ✅ | `"qrcode"` ou `"barcode"` |
| `dataBinding` | string | ✅ | Campo com os dados a codificar |
| `style` | object | ❌ | Estilos (somente QR Code) |
| `printCondition` | string | ❌ | Condição para renderizar |

---

## Tipos de Código

### QR Code

```json
{
  "type": "barcode",
  "id": "qr-pix",
  "x": 400,
  "y": 650,
  "width": 150,
  "height": 150,
  "barcodeType": "qrcode",
  "dataBinding": "payment.pixQrCode"
}
```

**Ideal para:**
- URLs e links
- PIX (QR Code do Banco Central)
- Dados complexos (JSON, XML)
- Credenciais de Wi-Fi
- vCards (contatos)

---

### Código de Barras (Code 128)

```json
{
  "type": "barcode",
  "id": "product-code",
  "x": 50,
  "y": 700,
  "width": 250,
  "height": 80,
  "barcodeType": "barcode",
  "dataBinding": "product.sku"
}
```

**Ideal para:**
- SKUs de produtos
- Números de série
- Códigos de rastreamento
- Identificadores simples

---

## QR Code

### Exemplo Completo

```json
{
  "type": "barcode",
  "id": "qr-payment-link",
  "x": 50,
  "y": 600,
  "width": 120,
  "height": 120,
  "barcodeType": "qrcode",
  "dataBinding": "order.paymentLink",
  "style": {
    "errorCorrection": "M"
  }
}
```

**Dados:**
```json
{
  "order": {
    "number": "12345",
    "paymentLink": "https://payment.example.com/order/12345"
  }
}
```

---

### Níveis de Correção de Erro

```json
{
  "style": {
    "errorCorrection": "M"
  }
}
```

| Nível | Recuperação | Tamanho | Uso Recomendado |
|-------|-------------|---------|-----------------|
| `L` | ~7% | Menor | Telas digitais, impressão de alta qualidade |
| `M` | ~15% | Médio | **Uso geral** (padrão), impressão comum |
| `Q` | ~25% | Maior | Etiquetas expostas, ambientes com sujeira |
| `H` | ~30% | Máximo | Ambientes adversos, superfícies irregulares |

::: tip Recomendação
Use `M` (padrão) na maioria dos casos. Use `H` apenas se a etiqueta for ficar exposta a condições adversas.
:::

---

### Tamanho Recomendado

Para uma leitura confiável do código:

```json
// Mínimo
{ "width": 80, "height": 80 }

// Recomendado
{ "width": 120, "height": 120 }

// Ideal
{ "width": 150, "height": 150 }
```

::: warning Atenção
QR Codes muito pequenos (< 60x60pt) podem ser difíceis de escanear, especialmente no nível `H`.
:::

---

### Tipos de Dados

#### URL

```json
{
  "dataBinding": "url"
}
```

**Dados:**
```json
{
  "url": "https://example.com/product/123"
}
```

---

#### PIX (Copiar e Colar)

```json
{
  "dataBinding": "pix.qrCode"
}
```

**Dados:**
```json
{
  "pix": {
    "qrCode": "00020126580014BR.GOV.BCB.PIX..."
  }
}
```

---

#### Texto Simples

```json
{
  "dataBinding": "message"
}
```

**Dados:**
```json
{
  "message": "Scan for more information"
}
```

---

#### JSON (Dados Complexos)

```json
{
  "dataBinding": "orderJson"
}
```

**Dados:**
```json
{
  "orderJson": "{\"id\":123,\"customer\":\"John\",\"total\":1500}"
}
```

---

## Código de Barras

### Exemplo Completo

```json
{
  "type": "barcode",
  "id": "tracking-code",
  "x": 50,
  "y": 750,
  "width": 300,
  "height": 60,
  "barcodeType": "barcode",
  "dataBinding": "tracking.code"
}
```

**Dados:**
```json
{
  "tracking": {
    "code": "BR123456789BR"
  }
}
```

---

### Tamanho Recomendado

Para uma leitura confiável do código:

```json
// Mínimo
{ "width": 150, "height": 40 }

// Recomendado
{ "width": 250, "height": 60 }

// Ideal (com texto)
{ "width": 300, "height": 80 }
```

---

### Code 128

O formato padrão é o **Code 128**, que suporta:
- ✅ Números: `0-9`
- ✅ Letras maiúsculas: `A-Z`
- ✅ Letras minúsculas: `a-z`
- ✅ Símbolos: `!@#$%^&*()-_=+[]{};:'",.<>/?`
- ✅ Controle: ASCII completo

**Exemplos válidos:**
```
1234567890
ABC-123-XYZ
SKU2024001
BR123456789BR
```

---

## Casos de Uso

### QR Code de PIX

```json
{
  "type": "barcode",
  "id": "qr-pix",
  "x": 400,
  "y": 600,
  "width": 150,
  "height": 150,
  "barcodeType": "qrcode",
  "dataBinding": "pix.copyPaste",
  "style": {
    "errorCorrection": "M"
  }
}
```

Com texto:

```json
{
  "type": "text",
  "x": 400,
  "y": 765,
  "value": "Pay with PIX",
  "style": {
    "fontSize": 10,
    "alignment": "center"
  }
}
```

---

### Link de Rastreamento

```json
{
  "type": "barcode",
  "id": "qr-tracking",
  "x": 50,
  "y": 600,
  "width": 100,
  "height": 100,
  "barcodeType": "qrcode",
  "dataBinding": "tracking.url"
}
```

**Dados:**
```json
{
  "tracking": {
    "code": "BR123456789BR",
    "url": "https://tracking.postal.com/BR123456789BR"
  }
}
```

---

### Código de Produto (SKU)

```json
{
  "elements": [
    {
      "type": "barcode",
      "id": "sku-barcode",
      "x": 50,
      "y": 700,
      "width": 200,
      "height": 50,
      "barcodeType": "barcode",
      "dataBinding": "product.sku"
    },
    {
      "type": "text",
      "x": 50,
      "y": 760,
      "dataBinding": "product.sku",
      "style": {
        "fontSize": 9,
        "fontFamily": "Courier",
        "alignment": "center"
      }
    }
  ]
}
```

---

### Autenticação de Documento

```json
{
  "type": "barcode",
  "id": "qr-authentication",
  "x": 450,
  "y": 750,
  "width": 80,
  "height": 80,
  "barcodeType": "qrcode",
  "dataBinding": "document.authenticationHash",
  "style": {
    "errorCorrection": "Q"
  }
}
```

**Dados:**
```json
{
  "document": {
    "number": "INV-12345",
    "authenticationHash": "https://validation.example.com/verify/abc123xyz"
  }
}
```

---

### Link de Feedback

```json
{
  "type": "barcode",
  "id": "qr-feedback",
  "x": 250,
  "y": 700,
  "width": 100,
  "height": 100,
  "barcodeType": "qrcode",
  "dataBinding": "feedback.url"
}
```

Com moldura:

```json
{
  "elements": [
    {
      "type": "rectangle",
      "x": 240,
      "y": 690,
      "width": 120,
      "height": 140,
      "style": {
        "fillColor": "#f3f4f6",
        "borderColor": "#d1d5db",
        "borderWidth": 1,
        "cornerRadius": 8
      }
    },
    {
      "type": "barcode",
      "id": "qr",
      "x": 250,
      "y": 700,
      "width": 100,
      "height": 100,
      "barcodeType": "qrcode",
      "dataBinding": "feedback.url"
    },
    {
      "type": "text",
      "x": 300,
      "y": 810,
      "value": "Rate us!",
      "style": {
        "fontSize": 9,
        "alignment": "center"
      }
    }
  ]
}
```

---

## Dentro de Loops

```json
{
  "type": "loop",
  "dataBinding": "products",
  "ySpacing": 120,
  "elements": [
    {
      "type": "text",
      "x": 50,
      "y": 0,
      "dataBinding": "$item.name",
      "style": {
        "fontSize": 12,
        "fontWeight": "bold"
      }
    },
    {
      "type": "barcode",
      "x": 50,
      "y": 25,
      "width": 150,
      "height": 40,
      "barcodeType": "barcode",
      "dataBinding": "$item.sku"
    }
  ]
}
```

---

## Condições

Exiba o código apenas sob determinadas condições:

```json
{
  "type": "barcode",
  "barcodeType": "qrcode",
  "dataBinding": "pix.qrCode",
  "printCondition": "paymentMethod == 'pix'"
}
```

---

## Performance

### Geração

A geração dos códigos é feita pela biblioteca **ZXing** (Zebra Crossing):
- ✅ QR Code: ~5-10ms
- ✅ Código de barras: ~2-5ms

### Otimização de Qualidade

Os códigos são gerados em escala 2x e depois reduzidos para garantir a qualidade da impressão:

```kotlin
// Internamente, a biblioteca faz:
val scaleFactor = 2
val scaledWidth = width * scaleFactor
// Gera a imagem maior
// Reduz para o tamanho final (anti-aliasing)
```

---

## Limitações

### QR Code

- ❌ A margem (quiet zone) é removida para economizar espaço
- ❌ Não suporta QR Code colorido
- ❌ Não suporta logo no centro
- ❌ Limite de ~3KB de dados (depende da correção)

### Código de Barras

- ❌ Apenas Code 128 (outros formatos não são suportados)
- ❌ Não inclui texto abaixo automaticamente
- ❌ Não suporta checksum personalizado
- ❌ Altura mínima recomendada: 40pt

---

## Solução de Problemas

### O QR Code não escaneia

1. ✅ Aumente o tamanho (mínimo 80x80pt)
2. ✅ Reduza a correção de erro (`L` ou `M`)
3. ✅ Verifique se os dados estão corretos
4. ✅ Imprima em alta resolução (300 DPI+)

### Código de barras ilegível

1. ✅ Aumente a largura (mínimo 150pt)
2. ✅ Aumente a altura (mínimo 40pt)
3. ✅ Verifique se os dados são válidos
4. ✅ Adicione um texto abaixo do código

### Dados muito longos

Para QR Codes com muitos dados:
- Use a correção `L` (QR menor)
- Aumente o tamanho (200x200pt ou mais)
- Considere encurtar a URL com bit.ly ou similar

---

## Tamanhos por Correção (Referência)

Para uma URL de 50 caracteres:

| Correção | Tamanho Mínimo | Recomendado |
|----------|----------------|-------------|
| L | 80x80pt | 100x100pt |
| M | 90x90pt | 120x120pt |
| Q | 100x100pt | 150x150pt |
| H | 120x120pt | 180x180pt |

---

## Próximos Passos

- [Elemento Image](/pt/lib/guide/elements/image) - Alternativa para códigos prontos
- [Elemento Text](/pt/lib/guide/elements/text) - Adicionar rótulos
- [Elemento Rectangle](/pt/lib/guide/elements/rectangle) - Criar molduras
- [Exemplos](/pt/lib/examples/) - Veja o Barcode em ação
