# GitHub Project Seed — open-pdf-generator

Este arquivo transforma o backlog de performance em tarefas prontas para criar no GitHub.

## Nome sugerido do projeto

- `open-pdf-generator`

## Tarefas sugeridas (Issues)

### P0
1. [P0] Indexar grupos para evitar lookup repetido por elemento
2. [P0] Remover `row.mapKeys` por célula em `TableRenderer`
3. [P0] Normalizar mapa de item do loop uma única vez por iteração
4. [P0] Cachear parsing de expressões e pipeline de transformações

### P1
5. [P1] Reduzir `copy()` de elementos com offsets no `RenderContext`
6. [P1] Reaproveitar medição de texto entre layout e render
7. [P1] Implementar política de cache limitada por memória (LRU/bytes)

### P2
8. [P2] Reutilizar instância singleton de `Gson`
9. [P2] Evitar `toMutableMap()` em checagens de paginação
10. [P2] Pré-computar plano de render para summary/background

### P3
11. [P3] Adicionar micro-benchmarks (JMH/Kotlin benchmark)
12. [P3] Expor métricas de runtime e cache no `config`

## Script exemplo (GitHub CLI)

> Requisitos: `gh` instalado e autenticado (`gh auth login`).

```bash
#!/usr/bin/env bash
set -euo pipefail

REPO="<OWNER>/open-pdf-generator"
PROJECT_TITLE="open-pdf-generator"

# Cria 12 issues
issues=(
  "[P0] Indexar grupos para evitar lookup repetido por elemento"
  "[P0] Remover row.mapKeys por célula em TableRenderer"
  "[P0] Normalizar mapa de item do loop uma única vez por iteração"
  "[P0] Cachear parsing de expressões e pipeline de transformações"
  "[P1] Reduzir copy() de elementos com offsets no RenderContext"
  "[P1] Reaproveitar medição de texto entre layout e render"
  "[P1] Implementar política de cache limitada por memória (LRU/bytes)"
  "[P2] Reutilizar instância singleton de Gson"
  "[P2] Evitar toMutableMap() em checagens de paginação"
  "[P2] Pré-computar plano de render para summary/background"
  "[P3] Adicionar micro-benchmarks (JMH/Kotlin benchmark)"
  "[P3] Expor métricas de runtime e cache no config"
)

for t in "${issues[@]}"; do
  gh issue create --repo "$REPO" --title "$t" --body "Originado de core/docs/PERFORMANCE_TASKS_2026-04-27.md"
done

# Cria projeto (escopo do dono do repositório)
OWNER="<OWNER>"
gh project create --owner "$OWNER" --title "$PROJECT_TITLE"

echo "Projeto e issues criados. Em seguida, adicione as issues ao projeto via interface ou API do gh project."
```

## Colunas sugeridas no projeto

- Backlog
- Ready
- In Progress
- Review
- Done

## Campos sugeridos

- Priority: P0, P1, P2, P3
- Area: Render, Cache, DataBinding, Observability
- Effort: S, M, L
