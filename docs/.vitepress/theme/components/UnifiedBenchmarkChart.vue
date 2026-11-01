<script setup lang="ts">
import { ref, computed } from 'vue'
import { useData } from 'vitepress'

const { lang } = useData()

const activeTab = ref<'java' | 'go' | 'node'>('java')

interface BarItem {
  name: string
  value: number
  display: string
  width: string
  highlight: boolean
  note: string
}

interface BenchmarkTab {
  id: 'java' | 'go' | 'node'
  title: string
  headline: string
  badge: string
  unit: string
  higherIsBetter: boolean
  bars: BarItem[]
  takeaway: string
  detailsLink: string
  detailsText: string
}

const dataByLang = computed<Record<'java' | 'go' | 'node', BenchmarkTab>>(() => {
  const isPt = lang.value.startsWith('pt')
  const isEs = lang.value.startsWith('es')

  if (isPt) {
    return {
      java: {
        id: 'java',
        title: '☕ Java/Kotlin (vs JasperReports)',
        headline: 'Open PDF Generator vs JasperReports 6 & 7',
        badge: 'Throughput (2 vCPU Container)',
        unit: 'docs / seg',
        higherIsBetter: true,
        bars: [
          { name: 'Open PDF Generator (Core JVM)', value: 8650, display: '8.650 docs/s', width: '100%', highlight: true, note: '11,5s p/ 100k faturas (+144% capacidade)' },
          { name: 'JasperReports 7.0.3', value: 3539, display: '3.539 docs/s', width: '41%', highlight: false, note: 'Contenção interna de locks' },
          { name: 'JasperReports 6.21.4', value: 3338, display: '3.338 docs/s', width: '38%', highlight: false, note: 'Pausas frequentes de GC' },
        ],
        takeaway: '4.7x menor latência (0.50 ms vs 2.24 ms) e 41.6% menos RAM em container. Zero travamentos sob 100k docs.',
        detailsLink: '/lib/benchmark',
        detailsText: 'Ver Benchmark JasperReports Completo →'
      },
      go: {
        id: 'go',
        title: '🐹 Go (vs Maroto)',
        headline: 'Open PDF Generator CLI vs Maroto (Go in-process)',
        badge: 'Latência por Fatura (p50)',
        unit: 'ms latência (menor é melhor)',
        higherIsBetter: false,
        bars: [
          { name: 'Go → Open PDF (Native serve)', value: 0.60, display: '0.60 ms', width: '10%', highlight: true, note: '9.6x mais rápido (1.283 docs/s)' },
          { name: 'Maroto (Go in-process)', value: 5.74, display: '5.74 ms', width: '58%', highlight: false, note: 'Motor em Go puro (172 docs/s)' },
          { name: 'Go → Open PDF (Native exec)', value: 9.88, display: '9.88 ms', width: '100%', highlight: false, note: 'Processo isolado por doc (100 docs/s)' },
        ],
        takeaway: 'O modo serve residente via NDJSON supera Maroto in-process por 9.6x, gerando PDFs 5x menores (2.5 KB vs 12.5 KB).',
        detailsLink: '/lib/benchmark-multilang',
        detailsText: 'Ver Benchmark Go & Node Completo →'
      },
      node: {
        id: 'node',
        title: '🟢 Node.js (vs pdfmake)',
        headline: 'Open PDF Generator CLI vs pdfmake (Node.js in-process)',
        badge: 'Latência por Fatura (p50)',
        unit: 'ms latência (menor é melhor)',
        higherIsBetter: false,
        bars: [
          { name: 'Node.js → Open PDF (Native serve)', value: 0.57, display: '0.57 ms', width: '8%', highlight: true, note: '12.2x mais rápido (1.415 docs/s)' },
          { name: 'pdfmake (Node in-process)', value: 6.95, display: '6.95 ms', width: '66%', highlight: false, note: 'Motor V8 in-process (134 docs/s)' },
          { name: 'Node.js → Open PDF (Native exec)', value: 10.44, display: '10.44 ms', width: '100%', highlight: false, note: 'Spawn isolado por doc (95 docs/s)' },
        ],
        takeaway: '12.2x mais rápido que pdfmake com 30% menos RAM (67 MB vs 96 MB) e PDFs 7x mais compactos (2.5 KB vs 17.7 KB).',
        detailsLink: '/lib/benchmark-multilang',
        detailsText: 'Ver Benchmark Go & Node Completo →'
      }
    }
  }

  if (isEs) {
    return {
      java: {
        id: 'java',
        title: '☕ Java/Kotlin (vs JasperReports)',
        headline: 'Open PDF Generator vs JasperReports 6 y 7',
        badge: 'Throughput (Contenedor 2 vCPU)',
        unit: 'docs / seg',
        higherIsBetter: true,
        bars: [
          { name: 'Open PDF Generator (Core JVM)', value: 8650, display: '8.650 docs/s', width: '100%', highlight: true, note: '11,5s para 100k facturas (+144% capacidad)' },
          { name: 'JasperReports 7.0.3', value: 3539, display: '3.539 docs/s', width: '41%', highlight: false, note: 'Contención interna de locks' },
          { name: 'JasperReports 6.21.4', value: 3338, display: '3.338 docs/s', width: '38%', highlight: false, note: 'Pausas frecuentes de GC' },
        ],
        takeaway: '4.7x menor latencia (0.50 ms vs 2.24 ms) y 41.6% menos RAM en contenedor. Cero bloqueos bajo 100k docs.',
        detailsLink: '/lib/benchmark',
        detailsText: 'Ver Benchmark JasperReports Completo →'
      },
      go: {
        id: 'go',
        title: '🐹 Go (vs Maroto)',
        headline: 'Open PDF Generator CLI vs Maroto (Go in-process)',
        badge: 'Latencia por Factura (p50)',
        unit: 'ms latencia (menor es mejor)',
        higherIsBetter: false,
        bars: [
          { name: 'Go → Open PDF (Native serve)', value: 0.60, display: '0.60 ms', width: '10%', highlight: true, note: '9.6x más rápido (1.283 docs/s)' },
          { name: 'Maroto (Go in-process)', value: 5.74, display: '5.74 ms', width: '58%', highlight: false, note: 'Motor en Go puro (172 docs/s)' },
          { name: 'Go → Open PDF (Native exec)', value: 9.88, display: '9.88 ms', width: '100%', highlight: false, note: 'Proceso aislado por doc (100 docs/s)' },
        ],
        takeaway: 'El modo serve residente vía NDJSON supera a Maroto in-process por 9.6x, generando PDFs 5x más pequeños.',
        detailsLink: '/lib/benchmark-multilang',
        detailsText: 'Ver Benchmark Go & Node Completo →'
      },
      node: {
        id: 'node',
        title: '🟢 Node.js (vs pdfmake)',
        headline: 'Open PDF Generator CLI vs pdfmake (Node.js in-process)',
        badge: 'Latencia por Factura (p50)',
        unit: 'ms latencia (menor es mejor)',
        higherIsBetter: false,
        bars: [
          { name: 'Node.js → Open PDF (Native serve)', value: 0.57, display: '0.57 ms', width: '8%', highlight: true, note: '12.2x más rápido (1.415 docs/s)' },
          { name: 'pdfmake (Node in-process)', value: 6.95, display: '6.95 ms', width: '66%', highlight: false, note: 'Motor V8 in-process (134 docs/s)' },
          { name: 'Node.js → Open PDF (Native exec)', value: 10.44, display: '10.44 ms', width: '100%', highlight: false, note: 'Spawn aislado por doc (95 docs/s)' },
        ],
        takeaway: '12.2x más rápido que pdfmake con 30% menos RAM (67 MB vs 96 MB) y PDFs 7x más compactos.',
        detailsLink: '/lib/benchmark-multilang',
        detailsText: 'Ver Benchmark Go & Node Completo →'
      }
    }
  }

  // Default: EN
  return {
    java: {
      id: 'java',
      title: '☕ Java/Kotlin (vs JasperReports)',
      headline: 'Open PDF Generator vs JasperReports 6 & 7',
      badge: 'Throughput (2 vCPU Container)',
      unit: 'docs / sec',
      higherIsBetter: true,
      bars: [
        { name: 'Open PDF Generator (Core JVM)', value: 8650, display: '8,650 docs/s', width: '100%', highlight: true, note: '11.5s for 100k invoices (+144% capacity)' },
        { name: 'JasperReports 7.0.3', value: 3539, display: '3,539 docs/s', width: '41%', highlight: false, note: 'Lock contention & thread stalls' },
        { name: 'JasperReports 6.21.4', value: 3338, display: '3,338 docs/s', width: '38%', highlight: false, note: 'Heavy GC pauses' },
      ],
      takeaway: '4.7x lower latency (0.50 ms vs 2.24 ms) and 41.6% lower container RAM. Zero lockups under 100k invoices.',
      detailsLink: '/lib/benchmark',
      detailsText: 'View Full JasperReports Benchmark →'
    },
    go: {
      id: 'go',
      title: '🐹 Go (vs Maroto)',
      headline: 'Open PDF Generator CLI vs Maroto (Go in-process)',
      badge: 'Latency per Invoice (p50)',
      unit: 'ms latency (lower is better)',
      higherIsBetter: false,
      bars: [
        { name: 'Go → Open PDF (Native serve)', value: 0.60, display: '0.60 ms', width: '10%', highlight: true, note: '9.6x faster (1,283 docs/s)' },
        { name: 'Maroto (Go in-process)', value: 5.74, display: '5.74 ms', width: '58%', highlight: false, note: 'Pure Go engine (172 docs/s)' },
        { name: 'Go → Open PDF (Native exec)', value: 9.88, display: '9.88 ms', width: '100%', highlight: false, note: 'Isolated process per doc (100 docs/s)' },
      ],
      takeaway: 'Resident serve mode via NDJSON beats in-process Maroto by 9.6x with 5x smaller output files (2.5 KB vs 12.5 KB).',
      detailsLink: '/lib/benchmark-multilang',
      detailsText: 'View Full Go & Node Benchmark →'
    },
    node: {
      id: 'node',
      title: '🟢 Node.js (vs pdfmake)',
      headline: 'Open PDF Generator CLI vs pdfmake (Node.js in-process)',
      badge: 'Latency per Invoice (p50)',
      unit: 'ms latency (lower is better)',
      higherIsBetter: false,
      bars: [
        { name: 'Node.js → Open PDF (Native serve)', value: 0.57, display: '0.57 ms', width: '8%', highlight: true, note: '12.2x faster (1,415 docs/s)' },
        { name: 'pdfmake (Node in-process)', value: 6.95, display: '6.95 ms', width: '66%', highlight: false, note: 'In-process V8 engine (134 docs/s)' },
        { name: 'Node.js → Open PDF (Native exec)', value: 10.44, display: '10.44 ms', width: '100%', highlight: false, note: 'Isolated spawn per doc (95 docs/s)' },
      ],
      takeaway: '12.2x faster than pdfmake with 30% lower RAM (67 MB vs 96 MB) and 7x smaller PDF size (2.5 KB vs 17.7 KB).',
      detailsLink: '/lib/benchmark-multilang',
      detailsText: 'View Full Go & Node Benchmark →'
    }
  }
})

const current = computed(() => dataByLang.value[activeTab.value])
</script>

<template>
  <div class="unified-chart-card">
    <div class="chart-header">
      <div class="header-nav">
        <button 
          v-for="tab in ['java', 'go', 'node'] as const"
          :key="tab"
          class="nav-tab"
          :class="{ active: activeTab === tab }"
          @click="activeTab = tab"
        >
          {{ dataByLang[tab].title }}
        </button>
      </div>
    </div>

    <div class="chart-body">
      <div class="headline-row">
        <div>
          <h4 class="chart-headline">{{ current.headline }}</h4>
          <span class="chart-sub">{{ current.badge }}</span>
        </div>
        <span class="unit-badge">
          {{ current.higherIsBetter ? '▲ Higher is better' : '▼ Lower is better' }}
        </span>
      </div>

      <div class="bars-container">
        <div 
          v-for="bar in current.bars" 
          :key="bar.name" 
          class="bar-item"
        >
          <div class="bar-labels">
            <span class="engine-name" :class="{ 'highlight-text': bar.highlight }">
              {{ bar.name }}
            </span>
            <span class="engine-val" :class="{ 'highlight-text': bar.highlight }">
              {{ bar.display }}
              <span class="engine-note">({{ bar.note }})</span>
            </span>
          </div>

          <div class="bar-track">
            <div 
              class="bar-fill" 
              :class="{ 'fill-primary': bar.highlight, 'fill-muted': !bar.highlight }"
              :style="{ width: bar.width }"
            ></div>
          </div>
        </div>
      </div>

      <div class="chart-footer">
        <div class="takeaway">
          <span class="takeaway-badge">💡</span>
          <span>{{ current.takeaway }}</span>
        </div>
        <a :href="current.detailsLink" class="details-link">
          {{ current.detailsText }}
        </a>
      </div>
    </div>
  </div>
</template>

<style scoped>
.unified-chart-card {
  margin: 28px 0 36px 0;
  border-radius: 14px;
  background: var(--vp-c-bg-alt);
  border: 1px solid var(--vp-c-divider);
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.04);
}

.dark .unified-chart-card {
  background: #0f172a;
  border-color: #1e293b;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.25);
}

.chart-header {
  border-bottom: 1px solid var(--vp-c-divider);
  background: rgba(15, 23, 42, 0.03);
}

.dark .chart-header {
  background: #0b1120;
}

.header-nav {
  display: flex;
  overflow-x: auto;
  scrollbar-width: none;
}

.header-nav::-webkit-scrollbar {
  display: none;
}

.nav-tab {
  padding: 12px 20px;
  font-size: 13.5px;
  font-weight: 600;
  color: var(--vp-c-text-2);
  border: none;
  background: transparent;
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.2s ease;
  border-bottom: 2px solid transparent;
}

.nav-tab:hover {
  color: var(--vp-c-text-1);
}

.nav-tab.active {
  color: var(--vp-c-brand-1);
  border-bottom-color: var(--vp-c-brand-1);
  background: rgba(99, 102, 241, 0.08);
}

.chart-body {
  padding: 22px 26px;
}

.headline-row {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 20px;
  gap: 12px;
}

.chart-headline {
  margin: 0 !important;
  font-size: 16.5px !important;
  font-weight: 700 !important;
  color: var(--vp-c-text-1) !important;
  border: none !important;
  padding: 0 !important;
}

.chart-sub {
  display: block;
  font-size: 12px;
  color: var(--vp-c-text-3);
  margin-top: 3px;
}

.unit-badge {
  font-size: 11px;
  font-weight: 600;
  color: var(--vp-c-text-2);
  background: var(--vp-c-default-soft);
  padding: 3px 10px;
  border-radius: 9999px;
  font-family: var(--vp-font-family-mono);
  white-space: nowrap;
}

.bars-container {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.bar-item {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.bar-labels {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  font-size: 13px;
  flex-wrap: wrap;
  gap: 8px;
}

.engine-name {
  font-weight: 600;
  color: var(--vp-c-text-2);
}

.engine-val {
  font-family: var(--vp-font-family-mono);
  font-weight: 600;
  color: var(--vp-c-text-2);
}

.engine-note {
  font-size: 11.5px;
  font-weight: 400;
  color: var(--vp-c-text-3);
  margin-left: 4px;
}

.highlight-text {
  color: var(--vp-c-brand-1) !important;
}

.bar-track {
  width: 100%;
  height: 10px;
  background: var(--vp-c-divider);
  border-radius: 9999px;
  overflow: hidden;
}

.dark .bar-track {
  background: #1e293b;
}

.bar-fill {
  height: 100%;
  border-radius: 9999px;
  transition: width 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.fill-primary {
  background: linear-gradient(90deg, #6366f1, #818cf8);
}

.fill-muted {
  background: #94a3b8;
}

.dark .fill-muted {
  background: #475569;
}

.chart-footer {
  margin-top: 22px;
  padding-top: 16px;
  border-top: 1px solid var(--vp-c-divider);
  display: flex;
  flex-direction: column;
  gap: 12px;
}

@media (min-width: 640px) {
  .chart-footer {
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
  }
}

.takeaway {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  font-size: 12.5px;
  color: var(--vp-c-text-2);
  line-height: 1.5;
  flex: 1;
}

.takeaway-badge {
  font-size: 14px;
}

.details-link {
  font-size: 12.5px;
  font-weight: 600;
  color: var(--vp-c-brand-1);
  text-decoration: none;
  white-space: nowrap;
}

.details-link:hover {
  text-decoration: underline;
}
</style>
