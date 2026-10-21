<script setup>
import { withBase } from 'vitepress'
</script>

<template>
  <div class="benchmark-card">
    <div class="benchmark-header">
      <div class="benchmark-badge-row">
        <span class="benchmark-pill">⚡ Benchmark Case Study</span>
        <span class="benchmark-env">Tested on Linux Container Cgroups (2 vCPU, 1 GB RAM)</span>
      </div>
      <h3>Engineered for High-Density Microservices & Cloud Run</h3>
      <p class="benchmark-subtitle">
        Stress test generating <strong>100,000 unique dynamic invoices</strong> against JasperReports 6.21.4 with zero template caching.
      </p>
    </div>

    <div class="benchmark-grid">
      <div class="benchmark-stat-item">
        <span class="benchmark-stat-label">Throughput</span>
        <div class="benchmark-stat-val">
          8,310 <span class="unit">docs/s</span>
        </div>
        <span class="benchmark-stat-delta">▲ 2.5x faster</span>
        <span class="benchmark-stat-desc">Jasper achieved 3,338 docs/s under identical quotas</span>
      </div>

      <div class="benchmark-stat-item">
        <span class="benchmark-stat-label">Cold Start</span>
        <div class="benchmark-stat-val">
          273 <span class="unit">ms</span>
        </div>
        <span class="benchmark-stat-delta">▲ 4.3x faster</span>
        <span class="benchmark-stat-desc">Jasper takes 1,166 ms to compile and render doc #1</span>
      </div>

      <div class="benchmark-stat-item">
        <span class="benchmark-stat-label">Peak RSS RAM</span>
        <div class="benchmark-stat-val">
          128 <span class="unit">MB</span>
        </div>
        <span class="benchmark-stat-delta">▲ 22% lower</span>
        <span class="benchmark-stat-desc">Zero GC stalls; Jasper required 165 MB with pauses</span>
      </div>

      <div class="benchmark-stat-item">
        <span class="benchmark-stat-label">Footprint</span>
        <div class="benchmark-stat-val">
          4.0 <span class="unit">MB</span>
        </div>
        <span class="benchmark-stat-delta">▲ 3.4x smaller</span>
        <span class="benchmark-stat-desc">No heavy compilation deps (Jasper: 13.6 MB JAR tree)</span>
      </div>
    </div>

    <div class="benchmark-footer">
      <span class="benchmark-footer-text">
        Looking to cut cloud infrastructure costs or replace legacy Jasper?
      </span>
      <a :href="withBase('/lib/benchmark')" class="benchmark-link">
        <span>Read Full Technical Benchmark & FinOps Analysis →</span>
      </a>
    </div>
  </div>
</template>

<style scoped>
.benchmark-card {
  margin: 36px 0 44px 0;
  border-radius: 16px;
  background: var(--vp-c-bg-alt);
  border: 1px solid var(--vp-c-border);
  overflow: hidden;
  box-shadow: 0 4px 20px -2px rgba(0, 0, 0, 0.05);
  transition: all 0.25s ease;
}

:deep(.dark) .benchmark-card,
.dark .benchmark-card {
  background: #0f172a;
  border-color: #1e293b;
  box-shadow: 0 8px 30px -4px rgba(0, 0, 0, 0.4);
}

.benchmark-card:hover {
  border-color: rgba(99, 102, 241, 0.4);
}

.benchmark-header {
  padding: 24px 28px 18px 28px;
  border-bottom: 1px solid var(--vp-c-divider);
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.benchmark-badge-row {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.benchmark-pill {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 10px;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--vp-c-brand-1);
  background: var(--vp-c-brand-soft);
  border: 1px solid rgba(99, 102, 241, 0.25);
  border-radius: 9999px;
  font-family: var(--vp-font-family-mono);
}

.benchmark-env {
  font-size: 12px;
  color: var(--vp-c-text-3);
  font-weight: 500;
}

.benchmark-header h3 {
  margin: 0 !important;
  padding: 0 !important;
  font-size: 20px !important;
  font-weight: 700 !important;
  color: var(--vp-c-text-1) !important;
  border-top: none !important;
  line-height: 1.3 !important;
}

.benchmark-subtitle {
  margin: 0 !important;
  font-size: 13.5px !important;
  color: var(--vp-c-text-2) !important;
  line-height: 1.5 !important;
}

.benchmark-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  background: var(--vp-c-divider);
  gap: 1px;
}

@media (max-width: 860px) {
  .benchmark-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 480px) {
  .benchmark-grid {
    grid-template-columns: 1fr;
  }
}

.benchmark-stat-item {
  background: var(--vp-c-bg-alt);
  padding: 22px 20px;
  display: flex;
  flex-direction: column;
  gap: 6px;
  transition: background 0.2s ease;
}

:deep(.dark) .benchmark-stat-item,
.dark .benchmark-stat-item {
  background: #0f172a;
}

.benchmark-stat-item:hover {
  background: rgba(99, 102, 241, 0.04);
}

.benchmark-stat-label {
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  color: var(--vp-c-text-2);
}

.benchmark-stat-val {
  font-size: 28px;
  font-weight: 700;
  font-family: var(--vp-font-family-mono);
  color: var(--vp-c-text-1);
  display: flex;
  align-items: baseline;
  gap: 4px;
}

.benchmark-stat-val span.unit {
  font-size: 14px;
  font-weight: 500;
  color: var(--vp-c-text-2);
}

.benchmark-stat-delta {
  display: inline-flex;
  align-items: center;
  font-size: 12px;
  font-weight: 600;
  color: #10b981;
  margin-top: 2px;
}

.benchmark-stat-desc {
  font-size: 12px;
  color: var(--vp-c-text-3);
  line-height: 1.4;
}

.benchmark-footer {
  padding: 14px 28px;
  background: rgba(99, 102, 241, 0.04);
  border-top: 1px solid var(--vp-c-divider);
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 12px;
}

.benchmark-footer-text {
  font-size: 13px;
  color: var(--vp-c-text-2);
}

.benchmark-link {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  color: var(--vp-c-brand-1);
  font-weight: 600;
  font-size: 13.5px;
  text-decoration: none;
  transition: gap 0.2s ease;
}

.benchmark-link:hover {
  gap: 12px;
  color: var(--vp-c-brand-2);
}
</style>
