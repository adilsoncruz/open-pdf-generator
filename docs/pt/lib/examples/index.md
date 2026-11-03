# Exemplos e Modelos Prontos

Explore modelos práticos e prontos para produção inclusos no Open PDF Generator. Você pode testar e personalizar cada um diretamente no navegador usando o [Playground Web Interativo](/playground/) ou executá-los localmente via CLI e biblioteca Kotlin.

---

## 1. Fatura Comercial Corporativa (`invoice.json`)

Fatura comercial completa com cabeçalho da empresa, dados de cobrança do cliente, tabela dinâmica de itens, cálculo de totais, código de barras Code128 e QR code de pagamento PIX/link.

<div style="margin: 16px 0;">
  <a href="/playground/" target="_blank" style="display: inline-block; padding: 10px 20px; background: #4f46e5; color: white; border-radius: 8px; font-weight: 600; text-decoration: none;">
    🎮 Testar Fatura no Playground Web →
  </a>
</div>

### Recursos do Modelo

- **Tabela com Data Binding**: Mapeia o array `items` em colunas com larguras e alinhamentos automáticos.
- **Código de Barras e QR Code**: Elementos Code128 e QR Code 2D vinculados a `${fatura.codigoBarras}` e `${fatura.linkPagamento}`.
- **Expressões Dinâmicas**: Formatação de valores monetários e cálculos automáticos.

```bash
# Gerar via CLI
pdf-generator generate invoice.json -d data.json -o fatura.pdf
```

---

## 2. Catálogo de Produtos e Inventário (`listing.json`)

Relatório tabular de inventário multipágina com cabeçalho e rodapé fixos, aviso de confidencialidade e bordas tabulares limpas.

<div style="margin: 16px 0;">
  <a href="/playground/" target="_blank" style="display: inline-block; padding: 10px 20px; background: #059669; color: white; border-radius: 8px; font-weight: 600; text-decoration: none;">
    🎮 Testar Catálogo no Playground Web →
  </a>
</div>

### Recursos do Modelo

- **Cabeçalho e Rodapé Fixos**: Repetição automática em todas as páginas com paginação (`pageNumber | prefix:'Página '`).
- **Formatação com Pipes**: Formatação de moeda (`price | format:'#,##0.00' | prefix:'R$ '`).
- **Alta Performance**: Geração de centenas de páginas por segundo sem travamentos de memória.

```bash
# Gerar via CLI
pdf-generator generate listing.json -d data_listing.json -o catalogo.pdf
```

---

## 3. Certificado de Conclusão (`certificate.json`)

Certificado em orientação paisagem (landscape) com tipografia destacada para premiações, cursos e certificações.

<div style="margin: 16px 0;">
  <a href="/playground/" target="_blank" style="display: inline-block; padding: 10px 20px; background: #7c3aed; color: white; border-radius: 8px; font-weight: 600; text-decoration: none;">
    🎮 Testar Certificado no Playground Web →
  </a>
</div>

### Recursos do Modelo

- **Orientação Paisagem**: Configurada com `"orientation": "landscape"` no bloco `pageSettings`.
- **Tipografia Centralizada**: Destaque para o nome do aluno e curso com hierarquia visual clara.
- **Código de Autenticação**: Inclui data de emissão e hash único de autenticidade.

```bash
# Gerar via CLI
pdf-generator generate certificate.json -d data_cert.json -o certificado.pdf
```
