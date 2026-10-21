---
name: template-preview-test
description: Validação e teste de templates JSON via CLI e visualização de PDF gerado, confrontando dados dinâmicos, quebra de página e fidelidade visual com o editor.
---

# Workflow: Teste e Validação de Templates

Utilize este workflow para validar alterações na estrutura de templates JSON ou no motor de geração antes de commitar.

## 1. Localização dos Templates de Teste
- Templates base: `tools/cli/teste-simple.json`, `tools/cli/teste-merge.json`, `tools/cli/teste-merge-2.json`.
- Dados de exemplo: `tools/cli/data.json`.

## 2. Validação de Sintaxe e Schema
Execute o script auxiliar para validar o JSON:
```bash
.agents/skills/scripts/run-template-test.sh tools/cli/teste-simple.json
```

## 3. Teste com Dados Dinâmicos
Para templates que utilizam interpolação `${...}` ou repetição de listas:
```bash
.agents/skills/scripts/run-template-test.sh tools/cli/teste-merge.json tools/cli/data.json tools/cli/output-merge.pdf
```

## 4. Checklist de Fidelidade Visual
- [ ] O arquivo PDF abre sem erros de corrupção.
- [ ] Posicionamento absoluto e relativo de bandas (Header, Body, Footer, Summary) está correto.
- [ ] Quebras de página ocorrem nos limites esperados sem sobreposição de textos.
- [ ] Imagens base64 ou URLs são carregadas e respeitam as dimensões configuradas.
- [ ] Caracteres especiais e fontes unicode são renderizados corretamente.
