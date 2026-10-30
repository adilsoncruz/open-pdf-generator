# Elemento Image

O `ImageElement` insere imagens no PDF a partir de URLs, arquivos locais ou dados base64, com controle de ajuste e alinhamento.

## Funcionalidades

- ✅ **Múltiplas fontes**: URL, arquivo local, base64, data binding
- ✅ **Modos de ajuste (fit)**: contain, cover, fill, scale-down
- ✅ **Alinhamento**: 9 posições diferentes
- ✅ **Cache automático**: As imagens são armazenadas em cache por performance
- ✅ **Formatos suportados**: JPEG, PNG, GIF

---

## Propriedades

| Propriedade | Tipo | Obrigatório | Descrição |
|-------------|------|-------------|-----------|
| `type` | string | ✅ | Deve ser `"image"` |
| `id` | string | ✅ | Identificador único |
| `x` | number | ✅ | Posição X |
| `y` | number | ✅ | Posição Y |
| `width` | number | ✅ | Largura do container |
| `height` | number | ✅ | Altura do container |
| `source` | string | ❌ | URL ou caminho (estático) |
| `dataBinding` | string | ❌ | Caminho para URL ou base64 (dinâmico) |
| `fit` | string | ❌ | Modo de ajuste (padrão: `contain`) |
| `alignment` | string | ❌ | Alinhamento (padrão: `center`) |
| `printCondition` | string | ❌ | Condição para renderizar |

::: warning Importante
Você DEVE informar `source` OU `dataBinding` (pelo menos um dos dois).
:::

---

## Exemplo Básico

### Imagem Estática (URL)

```json
{
  "type": "image",
  "id": "logo",
  "x": 50,
  "y": 50,
  "width": 150,
  "height": 80,
  "source": "https://example.com/logo.png",
  "fit": "contain"
}
```

### Imagem Dinâmica (Data Binding)

```json
{
  "type": "image",
  "id": "product-photo",
  "x": 200,
  "y": 200,
  "width": 200,
  "height": 200,
  "dataBinding": "product.image",
  "fit": "cover"
}
```

**Dados:**
```json
{
  "product": {
    "name": "Notebook",
    "image": "https://example.com/product123.jpg"
  }
}
```

---

## Fontes de Imagem

### 1. URL (HTTP/HTTPS)

```json
{
  "source": "https://example.com/image.jpg"
}
```

### 2. Arquivo Local

```json
{
  "source": "file:///full/path/image.png"
}
```

Ou caminho relativo:
```json
{
  "source": "resources/images/logo.png"
}
```

### 3. Base64

```json
{
  "dataBinding": "base64Image"
}
```

**Dados:**
```json
{
  "base64Image": "data:image/png;base64,iVBORw0KGgoAAAANS..."
}
```

---

## Modos de Ajuste (fit)

### contain (Padrão)

Imagem inteira visível, mantém as proporções, mas pode ter espaços vazios.

```json
{
  "fit": "contain"
}
```

**Ideal para:**
- Logos
- Ícones
- Imagens que não podem ser cortadas

**Exemplo visual:**
```
┌──────────────────┐
│                  │
│  ┌──────────┐   │
│  │  IMAGE   │   │
│  └──────────┘   │
│                  │
└──────────────────┘
```

---

### cover

Preenche todo o container, mantém as proporções, mas pode cortar partes da imagem.

```json
{
  "fit": "cover"
}
```

**Ideal para:**
- Fundos (backgrounds)
- Fotos de produtos
- Imagens decorativas

**Exemplo visual:**
```
┌──────────────────┐
│ IMMMMMMMMMMMAGE  │
│ IMMMMMMMMMMMAGE  │
│ IMMMMMMMMMMMAGE  │
│ IMMMMMMMMMMMAGE  │
└──────────────────┘
```

As partes da imagem fora do container são cortadas.

---

### fill

Estica a imagem para preencher exatamente o container (pode distorcer).

```json
{
  "fit": "fill"
}
```

**Ideal para:**
- Imagens que já têm as proporções do container
- Fundos simples

::: warning Atenção
Pode distorcer a imagem se as proporções forem diferentes!
:::

---

### scale-down

Como `contain`, mas nunca aumenta além do tamanho original.

```json
{
  "fit": "scale-down"
}
```

**Ideal para:**
- Preservar a qualidade
- Imagens de alta resolução
- QR Codes prontos

---

## Alinhamento (alignment)

### Valores Disponíveis

| Valor | Descrição |
|-------|-----------|
| `center` | Centro (padrão) |
| `left` | Esquerda (centro vertical) |
| `right` | Direita (centro vertical) |
| `top` | Topo (centro horizontal) |
| `bottom` | Base (centro horizontal) |
| `top-left` | Canto superior esquerdo |
| `top-right` | Canto superior direito |
| `bottom-left` | Canto inferior esquerdo |
| `bottom-right` | Canto inferior direito |

### Exemplo

```json
{
  "type": "image",
  "source": "logo.png",
  "width": 200,
  "height": 100,
  "fit": "contain",
  "alignment": "top-left"
}
```

**Exemplo visual:**
```
┌──────────────────┐
│ ┌────┐           │
│ │LOGO│           │
│ └────┘           │
│                  │
└──────────────────┘
```

---

## Casos de Uso

### Logo no Cabeçalho

```json
{
  "type": "image",
  "id": "company-logo",
  "x": 30,
  "y": 20,
  "width": 120,
  "height": 60,
  "source": "https://company.com/logo.png",
  "fit": "contain",
  "alignment": "left"
}
```

---

### Foto de Produto

```json
{
  "type": "image",
  "id": "product-photo",
  "x": 50,
  "y": 200,
  "width": 250,
  "height": 250,
  "dataBinding": "product.photo",
  "fit": "cover",
  "alignment": "center"
}
```

---

### Fundo Ocupando Toda a Largura

```json
{
  "type": "image",
  "id": "background",
  "x": 0,
  "y": 0,
  "width": 595,
  "height": 842,
  "source": "background-pattern.png",
  "fit": "cover"
}
```

::: tip Dica
Para fundos, use o elemento renderizado "embaixo" (atrás do conteúdo).
:::

---

### Assinatura Digital

```json
{
  "type": "image",
  "id": "signature",
  "x": 50,
  "y": 700,
  "width": 200,
  "height": 80,
  "dataBinding": "contract.signatureBase64",
  "fit": "contain",
  "alignment": "bottom-left"
}
```

**Dados:**
```json
{
  "contract": {
    "signatureBase64": "data:image/png;base64,iVBORw..."
  }
}
```

---

### Múltiplas Imagens em Loop

```json
{
  "type": "loop",
  "dataBinding": "products",
  "ySpacing": 120,
  "elements": [
    {
      "type": "image",
      "x": 50,
      "y": 0,
      "width": 100,
      "height": 100,
      "dataBinding": "$item.image",
      "fit": "cover"
    },
    {
      "type": "text",
      "x": 170,
      "y": 40,
      "dataBinding": "$item.name"
    }
  ]
}
```

---

## Imagens Condicionais

Exiba a imagem apenas sob determinadas condições:

```json
{
  "type": "image",
  "source": "certified-seal.png",
  "printCondition": "product.certified == true"
}
```

---

## Performance e Cache

### Cache Automático

A biblioteca armazena imagens carregadas em cache automaticamente:

```kotlin
// Limpar o cache (se necessário)
ImageRenderer.clearCache()

// Verificar o tamanho do cache
val size = ImageRenderer.cacheSize()

// Configurar o tamanho máximo
ImageRenderer.setMaxCacheSize(100) // 100 imagens
```

### Dicas de Performance

::: tip Otimização
- ✅ Use imagens otimizadas (JPEG comprimido)
- ✅ Dimensione as imagens próximas do tamanho de uso
- ✅ Evite imagens muito grandes (> 2 MB)
- ✅ Use o cache para imagens repetidas
- ✅ Prefira JPEG para fotos e PNG para logos/ícones
:::

---

## Limitações

- ❌ Não suporta SVG (converta para PNG/JPEG antes)
- ❌ Não suporta GIF animado (apenas o primeiro quadro)
- ❌ Não suporta rotação
- ❌ Não suporta filtros (brilho, contraste etc.)
- ❌ Não suporta transparência ajustável (alpha fixo)

---

## Formatos Suportados

| Formato | Extensão | Recomendado para |
|---------|----------|------------------|
| JPEG | `.jpg`, `.jpeg` | Fotos, imagens complexas |
| PNG | `.png` | Logos, ícones, transparência |
| GIF | `.gif` | Imagens simples (sem animação) |

---

## Solução de Problemas

### A imagem não aparece

1. ✅ Verifique se a URL está acessível
2. ✅ Confirme se o formato é suportado
3. ✅ Verifique se o base64 está completo
4. ✅ Teste com `fit: "fill"` para depuração

### Imagem cortada

- Use `fit: "contain"` em vez de `cover`
- Ajuste `width` e `height` para manter as proporções

### Imagem distorcida

- Use `fit: "contain"` ou `cover`
- Nunca use `fit: "fill"` com proporções diferentes

### Performance lenta

- Reduza o tamanho das imagens
- Comprima os JPEGs
- Verifique se o cache está habilitado

---

## Próximos Passos

- [Elemento Barcode](/pt/lib/guide/elements/barcode) - QR Codes e códigos de barras
- [Elemento Rectangle](/pt/lib/guide/elements/rectangle) - Fundos e bordas
- [Elemento Loop](/pt/lib/guide/elements/loop) - Múltiplas imagens
- [Exemplos](/pt/lib/examples/) - Veja o Image em ação
