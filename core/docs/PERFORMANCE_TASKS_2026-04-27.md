# Core Performance & Memory Review (2026-04-27)

This document lists practical next tasks for improving performance and memory usage in `core`.

## Scope

- Module reviewed: `core`
- Focus: render path, allocation hotspots, cache behavior, and repeated computation

## Priority roadmap

## P0 — High impact / low-to-medium complexity

1. **Avoid repeated group lookup per element render**
   - Current behavior: `shouldRenderElement()` does `groups.find { it.elementIds.contains(element.id) }` for each element.
   - Impact: worst-case `O(elements * groups * idsPerGroup)` overhead in every page/summary render.
   - Task:
     - Build an index once per section (`Map<String, ElementGroup>`) before iterating elements.
     - Pass indexed map to `shouldRenderElement()`.

2. **Remove per-cell map cloning in table transformations**
   - Current behavior: in `TableRenderer.addDataRows()`, expressions call `ExpressionProcessor.process(column.field, row.mapKeys { it.key }, null)`.
   - Impact: allocates a new map for each transformed cell.
   - Task:
     - Reuse row map directly with safe cast helper.
     - Only normalize keys once in `resolveTableData()`.

3. **Reduce loop item map conversion churn**
   - Current behavior: `DataBindingResolver.resolveFromLoopItem()` and `$item.*` path both perform `item.mapKeys { it.key.toString() }`.
   - Impact: repeated map allocations per binding resolution in loops.
   - Task:
     - Normalize loop item map once when creating `LoopContext` (or cache normalized map in context).
     - Reuse across all element renders for the same loop row.

4. **Cache parsed expressions/transform pipelines**
   - Current behavior: `ExpressionProcessor.process()` repeatedly performs `split("|")`, parsing of transformations and regex creation for template placeholders.
   - Impact: high CPU + short-lived allocations in table-heavy templates.
   - Task:
     - Introduce bounded cache for parsed expression AST/pipeline.
     - Make regex instances static precompiled constants.

## P1 — High impact / medium complexity

5. **Avoid element `copy()` allocations during coordinate adjustment**
   - Current behavior: `adjustElementForBody*()` and loop `adjustElementPosition()` create copied data classes for almost every element.
   - Impact: heavy allocation pressure in large documents.
   - Task:
     - Introduce lightweight render offsets in `RenderContext` (`offsetX`, `offsetY`) and apply in renderer layer.
     - Keep original immutable model objects unchanged.

6. **Prevent duplicated expensive text height calculation**
   - Current behavior: `getElementHeight()` computes multiline wrapping (`TextRenderer.calculateContentHeight`) before render; `TextRenderer` computes wrapping again during actual render.
   - Impact: duplicated width calculations and string work.
   - Task:
     - Cache measured text layout per element+resolvedText+style hash in render pass.
     - Reuse measured lines for render and for relative positioning.

7. **Bound caches by memory, not only entry count**
   - Current behavior:
     - `ImageRenderer` cache limit is entry-count only (`maxCacheSize`), eviction is non-LRU (`keys.firstOrNull()` from `ConcurrentHashMap`).
     - `PDFGenerator.templateCache` and `DataBindingResolver.pathCache` are effectively unbounded.
   - Impact: unpredictable memory growth and cache thrashing.
   - Task:
     - Move to bounded cache policy (LRU by weight/bytes for images; size-limited for template/path caches).
     - Expose clear metrics (`hits`, `misses`, `evictions`, `bytes`).

## P2 — Medium impact / low complexity

8. **Reuse Gson instances**
   - Current behavior: new `Gson()` created in `minifyJson()` and `parseDataJson()`.
   - Impact: avoidable object creation in hot API paths.
   - Task:
     - Use shared immutable singleton (`private val gson = Gson()`).

9. **Reduce temporary map creation in pagination condition checks**
   - Current behavior: table pagination helper creates `context.data.toMutableMap().apply { put("_pageNumber", pageNum) }` for each page and header/footer check.
   - Impact: repeated per-page allocations.
   - Task:
     - Use lightweight wrapper/resolver for synthetic `_pageNumber` instead of cloning whole map.

10. **Improve relative positioning/group precomputation in summary/background loops**
   - Current behavior: summary and background passes rerun group scan logic and element adjustments independently.
   - Impact: duplicate processing in multi-page summary use-cases.
   - Task:
     - Precompute per-section render plans (eligible elements + static offsets).

## P3 — Observability and safety

11. **Add micro-benchmarks for regressions**
   - Add JMH (or Kotlin benchmark) scenarios:
     - Large loop with nested text bindings
     - 1k-row table with expression transforms
     - Templates with many group conditions

12. **Expose optional runtime stats in config**
   - Render counters per document:
     - elements processed/rendered/skipped
     - expression evaluations
     - cache hit/miss counters
     - peak memory estimate for caches

## Suggested implementation order

1. P0-1 group index
2. P0-2 table map cloning
3. P0-3 loop map normalization
4. P0-4 expression parse cache
5. P1-7 cache policy overhaul
6. P1-6 text measurement reuse
7. P1-5 context offsets (remove `copy()` churn)
8. P2/P3 observability + benchmarks

## Quick wins checklist (single sprint)

- [ ] Add group lookup index
- [ ] Remove `row.mapKeys` in table transformed fields
- [ ] Precompile regex and cache parsed transformations
- [ ] Reuse one `Gson` instance
- [ ] Replace image cache eviction with true LRU and byte cap

## Tracking

- Suggested GitHub Project: `open-pdf-generator`
- Issue seed list and automation snippet: `core/docs/GITHUB_PROJECT_TASKS.md`
