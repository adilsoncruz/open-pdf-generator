# Elemento Link

O `LinkElement` (`"type": "link"`) renderiza um hiperlink clicável no documento PDF. Ele se comporta como um elemento de texto com uma anotação de URL associada, que o leitor pode clicar para abrir em um navegador externo.

## Funcionalidades

- ✅ **Hiperlinks clicáveis**: Incorpora anotações nativas de link do PDF apontando para uma `url` de destino.
- ✅ **Texto dinâmico ou estático**: O rótulo exibido pode ser estático (`value`) ou interpolado via `dataBinding`.
- ✅ **Estilo de texto**: Suporte completo a estilos de fonte (`fontSize`, `color`, `fontFamily`, `fontWeight`, underline/estilo).
- ✅ **Renderização condicional**: Controlado com `printCondition`.

---

## Propriedades

| Propriedade | Tipo | Obrigatório | Descrição |
|-------------|------|-------------|-----------|
| `type` | string | ✅ | Deve ser `"link"` |
| `id` | string | ✅ | Identificador único do elemento |
| `x` | number | ✅ | Posição horizontal em pontos |
| `y` | number | ✅ | Posição vertical em pontos |
| `url` | string | ✅ | URL de destino (ex.: `https://example.com`) |
| `value` | string | ⚠️ | Rótulo de texto estático (obrigatório se `dataBinding` não for definido) |
| `dataBinding` | string | ⚠️ | Caminho dinâmico para os dados do rótulo (obrigatório se `value` não for definido) |
| `width` | number | ❌ | Largura da caixa delimitadora em pontos |
| `height` | number | ❌ | Altura da caixa delimitadora em pontos |
| `style` | object | ❌ | Opções de estilo de fonte e texto |
| `printCondition` | string | ❌ | Expressão de condição para renderizar o link |
| `positionMode` | string | ❌ | `"absolute"` ou `"relative"` |
| `relativeOffsetY` | number | ❌ | Deslocamento relativo ao elemento de fluxo anterior |

---

## Exemplo: Link para Site Externo

```json
{
  "type": "link",
  "id": "company-portal",
  "x": 50,
  "y": 700,
  "width": 200,
  "height": 20,
  "value": "Visit our Customer Portal",
  "url": "https://portal.example.com",
  "style": {
    "fontSize": 12,
    "fontFamily": "Helvetica",
    "color": "#2563EB",
    "fontWeight": "bold"
  }
}
```

## Exemplo: Link Dinâmico com Data Binding

```json
{
  "type": "link",
  "id": "invoice-url",
  "x": 50,
  "y": 720,
  "dataBinding": "customer.website",
  "url": "https://company.org/invoices",
  "style": {
    "fontSize": 10,
    "color": "#4F46E5"
  }
}
```
