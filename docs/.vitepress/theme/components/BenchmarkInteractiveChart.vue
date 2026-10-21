<script setup>
import { ref } from 'vue'

const activeMetric = ref('throughput')

const metrics = {
  throughput: {
    title: 'Throughput (2 vCPU Container)',
    unit: 'docs / sec',
    higherIsBetter: true,
    bars: [
      { name: 'Open PDF Generator', value: 8650, display: '8,650 docs/s', width: '100%', highlight: true, note: 'Finished in 11.5s (+144% capacity)' },
      { name: 'JasperReports 7.0.3', value: 3539, display: '3,539 docs/s', width: '41%', highlight: false, note: 'Finished in 28.3s (Lock contention)' },
      { name: 'JasperReports 6.21.4', value: 3338, display: '3,338 docs/s', width: '38%', highlight: false, note: 'Finished in 29.9s (GC pauses)' },
    ],
    takeaway: 'Open PDF finishes 100,000 invoices in ~11.5s. Jasper throttles on internal classloader and font synchronization locks.'
  },
  barcode: {
    title: 'Complex Doc (Barcode 128 + QR Code + Watermark)',
    unit: 'ms latency (p50)',
    higherIsBetter: false,
    bars: [
      { name: 'Open PDF Generator', value: 1.22, display: '1.22 ms', width: '10%', highlight: true, note: 'Pure PDF vector commands (9.8x faster)' },
      { name: 'JasperReports 6.21.4', value: 10.58, display: '10.58 ms', width: '89%', highlight: false, note: 'Batik SVG rasterizer' },
      { name: 'JasperReports 7.0.3', value: 11.88, display: '11.88 ms', width: '100%', highlight: false, note: 'Barcode4J AWT BufferedImage' },
    ],
    takeaway: 'Open PDF draws barcodes directly as native vector operators in the PDF stream, allocating 9.9x less RAM (928 KB vs 9.1 MB).'
  },
  coldstart: {
    title: 'Cold Start Latency (1st Document Render)',
    unit: 'ms latency',
    higherIsBetter: false,
    bars: [
      { name: 'Open PDF Generator', value: 195, display: '195 ms', width: '17%', highlight: true, note: 'Instant JSON parse (4.3x faster)' },
      { name: 'JasperReports 7.0.3', value: 742, display: '742 ms', width: '64%', highlight: false, note: 'Modular compiler init' },
      { name: 'JasperReports 6.21.4', value: 1166, display: '1,166 ms', width: '100%', highlight: false, note: 'Eclipse ECJ bootstrap' },
    ],
    takeaway: 'Zero XML bytecode compilation. Essential for Serverless (AWS Lambda, Cloud Run) and scale-to-zero microservices.'
  },
  memory: {
    title: 'Physical Container RAM (Peak RSS for 100k docs)',
    unit: 'MB RSS RAM',
    higherIsBetter: false,
    bars: [
      { name: 'Open PDF Generator', value: 128, display: '128 MB', width: '75%', highlight: true, note: 'Flat memory profile, zero GC stalls' },
      { name: 'JasperReports 6.21.4', value: 164, display: '164 MB', width: '96%', highlight: false, note: 'Frequent GC pauses' },
      { name: 'JasperReports 7.0.3', value: 171, display: '171 MB', width: '100%', highlight: false, note: 'Higher baseline allocation' },
    ],
    takeaway: 'Open PDF uses 25% less physical RAM and runs comfortably within 512MB / 1GB container quotas without thrashing.'
  }
}
</script>

<template>
  <div class="interactive-chart">
    <div class="chart-header">
      <div class="chart-tabs">
        <button 
          class="metric-tab" 
          :class="{ active: activeMetric === 'throughput' }"
          @click="activeMetric = 'throughput'"
        >
          ⚡ Throughput
        </button>
        <button 
          class="metric-tab" 
          :class="{ active: activeMetric === 'barcode' }"
          @click="activeMetric = 'barcode'"
        >
          🏷️ Barcodes (9.8x)
        </button>
        <button 
          class="metric-tab" 
          :class="{ active: activeMetric === 'coldstart' }"
          @click="activeMetric = 'coldstart'"
        >
          ⏱️ Cold Start
        </button>
        <button 
          class="metric-tab" 
          :class="{ active: activeMetric === 'memory' }"
          @click="activeMetric = 'memory'"
        >
          💾 RAM (RSS)
        </button>
      </div>
    </div>

    <div class="chart-body">
      <div class="chart-title-row">
        <h4>{{ metrics[activeMetric].title }}</h4>
        <span class="unit-badge">
          {{ metrics[activeMetric].higherIsBetter ? '▲ Higher is better' : '▼ Lower is better' }}
        </span>
      </div>

      <div class="bars-wrapper">
        <div 
          v-for="bar in metrics[activeMetric].bars" 
          :key="bar.name" 
          class="chart-bar-row"
        >
          <div class="bar-labels">
            <span class="name" :class="{ 'text-primary': bar.highlight }">
              {{ bar.name }}
            </span>
            <span class="val" :class="{ 'text-primary': bar.highlight }">
              {{ bar.display }}
              <span class="note">({{ bar.note }})</span>
            </span>
          </div>

          <div class="track">
            <div 
              class="fill" 
              :class="{ 'fill-indigo': bar.highlight, 'fill-slate': !bar.highlight }"
              :style="{ width: bar.width }"
            ></div>
          </div>
        </div>
      </div>

      <div class="takeaway-box">
        <span class="takeaway-icon">💡</span>
        <span class="takeaway-text">{{ metrics[activeMetric].takeaway }}</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.interactive-chart {
  margin: 24px 0 32px 0;
  border-radius: 12px;
  background: var(--vp-c-bg-alt);
  border: 1px solid var(--vp-c-border);
  overflow: hidden;
}

:deep(.dark) .interactive-chart,
.dark .interactive-chart {
  background: #0f172a;
  border-color: #1e293b;
}

.chart-header {
  border-bottom: 1px solid var(--vp-c-divider);
  background: rgba(15, 23, 42, 0.02);
}

:deep(.dark) .chart-header,
.dark .chart-header {
  background: #0b1120;
}

.chart-tabs {
  display: flex;
  overflow-x: auto;
  scrollbar-width: none;
}

.chart-tabs::-webkit-scrollbar {
  display: none;
}

.metric-tab {
  padding: 10px 16px;
  font-size: 13px;
  font-weight: 600;
  color: var(--vp-c-text-2);
  border: none;
  background: transparent;
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.2s ease;
  border-bottom: 2px solid transparent;
}

.metric-tab:hover {
  color: var(--vp-c-text-1);
}

.metric-tab.active {
  color: var(--vp-c-brand-1);
  border-bottom-color: var(--vp-c-brand-1);
  background: rgba(99, 102, 241, 0.08);
}

.chart-body {
  padding: 20px 24px;
}

.chart-title-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 18px;
}

.chart-title-row h4 {
  margin: 0 !important;
  font-size: 16px !important;
  font-weight: 700 !important;
  color: var(--vp-c-text-1) !important;
  border: none !important;
  padding: 0 !important;
}

.unit-badge {
  font-size: 11px;
  font-weight: 600;
  color: var(--vp-c-text-3);
  background: var(--vp-c-divider);
  padding: 2px 8px;
  border-radius: 9999px;
  font-family: var(--vp-font-family-mono);
}

.bars-wrapper {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.chart-bar-row {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.bar-labels {
  display: flex;
  justify-content: space-between;
  font-size: 12.5px;
  flex-wrap: wrap;
  gap: 6px;
}

.name {
  font-weight: 600;
  color: var(--vp-c-text-2);
}

.val {
  font-family: var(--vp-font-family-mono);
  font-weight: 600;
  color: var(--vp-c-text-2);
}

.text-primary {
  color: var(--vp-c-brand-1) !important;
  font-weight: 700 !important;
}

.note {
  font-size: 11.5px;
  color: var(--vp-c-text-3);
  font-weight: 400;
  margin-left: 6px;
}

.track {
  height: 9px;
  background: var(--vp-c-divider);
  border-radius: 9999px;
  overflow: hidden;
}

:deep(.dark) .track,
.dark .track {
  background: #1e293b;
}

.fill {
  height: 100%;
  border-radius: 9999px;
  transition: width 0.5s cubic-bezier(0.16, 1, 0.3, 1);
}

.fill-indigo {
  background: linear-gradient(90deg, #6366f1 0%, #818cf8 100%);
  box-shadow: 0 0 10px rgba(99, 102, 241, 0.4);
}

.fill-slate {
  background: #64748b;
  opacity: 0.6;
}

.takeaway-box {
  margin-top: 18px;
  padding: 10px 14px;
  border-radius: 8px;
  background: rgba(99, 102, 241, 0.05);
  border: 1px solid rgba(99, 102, 241, 0.15);
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12.5px;
  color: var(--vp-c-text-2);
}
</style>
