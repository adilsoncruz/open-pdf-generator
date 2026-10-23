---
name: ai-pdf-template-importer
description: Procedimento passo a passo para converter arquivos PDF e relatórios Jasper (.jrxml) em templates JSON compatíveis com o Open PDF Generator, utilizando inferência determinística ou IA Multimodal com Structured Outputs.
---

# Workflow: Importação de PDF e Jasper para Template JSON

Este procedimento orienta a conversão de layouts existentes (PDFs de faturas, relatórios, boletos ou arquivos JasperReports `.jrxml`) para o schema declarativo de template do Open PDF Generator.

---

## 1. Conversão Determinística de JasperReports (.jrxml)

Para converter relatórios legados do JasperReports sem custo de API e com preservação exata de coordenadas:

### Via Desktop Editor:
1. Abra o **Open PDF Generator Studio**.
2. Acesse o menu **Arquivo > Importar Jasper (.jrxml)** (ou use o atalho de abertura).
3. Selecione o arquivo `.jrxml`. O parser nativo mapeia:
   - Bandas de cabeçalho (`title`, `pageHeader`) para `pageSettings.header`.
   - Bandas de corpo (`columnHeader`, `detail`, `columnFooter`) para `page`.
   - Rodapé (`pageFooter`) para `pageSettings.footer`.
   - Marca d'água (`background`) para `pageSettings.watermark`.
   - Expressões `$P{var}`, `$F{var}`, `$P{var}.toUpperCase()` para dataBindings do engine (`var`, `var | uppercase`).
4. Clique em **Salvar Como...** para salvar o template `.json` convertido.

### Via CLI:
```bash
java -jar tools/cli/build/libs/pdf-generator-cli-*.jar convert template.jrxml -o template.json
```

---

## 2. Conversão de PDF com IA Multimodal

Quando o documento de origem é um PDF já renderizado (sem XML semântico), utilizamos visão multimodal para reconstruir o layout e inferir campos dinâmicos.

### 2.1 Configuração de Provedor no Desktop Editor:
1. Abra o menu **Arquivo > Importar PDF com IA...**.
2. Configure o provedor:
   - **Google Gemini** (Recomendado: `gemini-2.5-flash` pelo baixo custo e alta precisão com Structured Outputs).
   - **OpenAI** (`gpt-4o` / `gpt-4o-mini`).
   - **Ollama / Local** (ex: `llama3.2-vision` ou `minicpm-v`).
3. Insira sua chave de API (armazenada localmente).

---

## 3. Prompt de Sistema do Agente / IA (Structured Output)

Ao utilizar o agente ou API para converter o PDF, utilize o system prompt estruturado abaixo:

```markdown
Você é um especialista em engenharia de layout e design de templates para o Open PDF Generator.
Sua missão é analisar visualmente o documento PDF fornecido e convertê-lo em um JSON Template estritamente compatível.

### Regras de Conversão:
1. **Página e Coordenadas**:
   - Padrão A4: largura 595pt, altura 842pt (margens padrão: 36pt).
   - Calcule coordenadas X e Y absolutas relativas ao início da página ou banda.
2. **Separação de Rótulos e Dados Dinâmicos**:
   - NÃO mescle texto estático com variáveis dinâmicas em um único texto fixo.
   - Exemplo: para "Cliente: João da Silva", gere dois elementos:
     - Elemento 1: `{ "type": "text", "value": "Cliente: ", "style": { "bold": true } }`
     - Elemento 2: `{ "type": "text", "dataBinding": "cliente.nome" }`
3. **Identificação de Tabelas**:
   - Se houver colunas repetidas (itens de fatura, produtos), gere um elemento do tipo "table":
     - `dataBinding`: "itens"
     - `columns`: array com `header`, `field`, `width`, `alignment`
4. **Cores e Tipografia**:
   - Extraia cores hexadecimais (ex: #1e293b, #4f46e5).
   - Indique `fontSize`, `bold: true/false`, `alignment: "left" | "center" | "right"`.

### Formato de Saída (JSON):
{
  "version": "1.0",
  "metadata": {
    "name": "<Nome do Documento>",
    "description": "Template inferido via IA"
  },
  "pageSettings": {
    "size": "A4",
    "orientation": "portrait",
    "margins": { "top": 36, "right": 36, "bottom": 36, "left": 36 }
  },
  "page": [
    ...
  ]
}
```

---

## 4. Checklist de Validação do Template Convertido

- [ ] Margens e tamanho da folha batem com o documento original.
- [ ] Textos e tabelas não sofrem sobreposição visual no canvas.
- [ ] Variáveis em `dataBinding` correspondem à estrutura de payload JSON esperada.
- [ ] Pré-visualização PDF renderiza com fidelidade no painel de preview.
