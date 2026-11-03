<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { withBase } from 'vitepress'

const currentSlide = ref(0)
const isPaused = ref(false)
let timer = null

const slides = [
  {
    id: 'throughput',
    tag: '⚡ 2.5x Higher Throughput',
    title: 'Container Concurrency & Throughput',
    description: '100,000 unique invoice stress test in Linux container (2 vCPU, 1 GB RAM cgroup limits).',
    badge: '100% Lock-Free Parallelism',
    bars: [
      { name: 'Open PDF Generator', value: '8,650 docs/sec', width: '100%', highlight: true, note: 'Finished in 11.5s' },
      { name: 'JasperReports 7.0.3', value: '3,539 docs/sec', width: '41%', highlight: false, note: 'Finished in 28.3s (Lock contention)' },
      { name: 'JasperReports 6.21.4', value: '3,338 docs/sec', width: '38%', highlight: false, note: 'Finished in 29.9s (GC stalls)' },
    ],
    highlightStat: '8,650',
    highlightUnit: 'docs/s',
    highlightLabel: '+144% faster vs JasperReports 7',
    footerTip: 'Open PDF uses 100% lock-free concurrency, eliminating JVM thread contention on HTTP endpoints.'
  },
  {
    id: 'barcodes',
    tag: '🏷️ 9.8x Faster Barcode & QR',
    title: 'Complex Documents with Native Barcodes',
    description: 'Document with vector Code 128 barcode, 1-bit QR Code, watermarks and conditional rules.',
    badge: 'Pure PDF Vector Instructions',
    bars: [
      { name: 'Open PDF Generator', value: '1.22 ms', width: '10%', highlight: true, note: 'Direct PDF vector operators' },
      { name: 'JasperReports 6.21.4', value: '10.58 ms', width: '89%', highlight: false, note: 'AWT / Batik SVG overhead' },
      { name: 'JasperReports 7.0.3', value: '11.88 ms', width: '100%', highlight: false, note: 'Barcode4J BufferedImage pipeline' },
    ],
    highlightStat: '9.8x',
    highlightUnit: 'speedup',
    highlightLabel: '9.9x less RAM allocated per doc (928 KB vs 9.1 MB)',
    footerTip: 'Open PDF draws barcodes via native PDF vector commands instead of heavyweight BufferedImage rasters.'
  },
  {
    id: 'coldstart',
    tag: '⏱️ 4.3x Faster Boot',
    title: 'Cold Start & Serverless Readiness',
    description: 'First document generation latency from cold JVM boot (AWS Lambda / Google Cloud Run).',
    badge: 'Zero XML Bytecode Compilation',
    bars: [
      { name: 'Open PDF Generator', value: '195 ms', width: '17%', highlight: true, note: 'Instant JSON template parse' },
      { name: 'JasperReports 7.0.3', value: '742 ms', width: '64%', highlight: false, note: 'Modular compiler init' },
      { name: 'JasperReports 6.21.4', value: '1,166 ms', width: '100%', highlight: false, note: 'Legacy ECJ compiler bootstrap' },
    ],
    highlightStat: '195',
    highlightUnit: 'ms',
    highlightLabel: '3.8x to 4.3x faster cold execution',
    footerTip: 'Declarative JSON requires no bytecode compiling, making Open PDF ideal for instant serverless scale-out.'
  },
  {
    id: 'memory',
    tag: '💾 6.3x Lighter & Cloud FinOps',
    title: 'Memory Allocation & Dependency Footprint',
    description: 'Production container footprint and total runtime dependency size in Docker image.',
    badge: 'Zero Apache Commons / ECJ Bloat',
    bars: [
      { name: 'Open PDF Generator', value: '4.0 MB', width: '16%', highlight: true, note: '128 MB Peak RAM (Zero GC pauses)' },
      { name: 'JasperReports 6.21.4', value: '13.6 MB', width: '54%', highlight: false, note: '164 MB Peak RAM (Frequent GC pauses)' },
      { name: 'JasperReports 7.0.3', value: '25.2 MB', width: '100%', highlight: false, note: '171 MB Peak RAM (Modular + JDT compiler)' },
    ],
    highlightStat: '4.0',
    highlightUnit: 'MB',
    highlightLabel: '60%+ reduction in monthly cloud billing',
    footerTip: 'Smaller containers deploy faster, cost less in Cloud Run/Lambda, and prevent OutOfMemory errors.'
  },
  {
    id: 'community',
    tag: '⭐ Free & Open Source',
    title: 'Modernizing PDF Generation Together',
    description: 'Open PDF Generator is 100% free and open-source under AGPL-3.0. Built by developers, for developers.',
    badge: 'Community Driven',
    bars: [],
    highlightStat: '100%',
    highlightUnit: 'free',
    highlightLabel: 'AGPL-3.0 License (Copyleft / Open Source)',
    footerTip: 'Help us build the fastest open-source PDF generator by starring the repo and sharing with colleagues.'
  }
]

function nextSlide() {
  currentSlide.value = (currentSlide.value + 1) % slides.length
}

function prevSlide() {
  currentSlide.value = (currentSlide.value - 1 + slides.length) % slides.length
}

function selectSlide(idx) {
  currentSlide.value = idx
}

onMounted(() => {
  timer = setInterval(() => {
    if (!isPaused.value) {
      nextSlide()
    }
  }, 6000)
})

onUnmounted(() => {
  if (timer) clearInterval(timer)
})
</script>

<template>
  <div 
    class="benchmark-card"
    @mouseenter="isPaused = true"
    @mouseleave="isPaused = false"
  >
    <!-- Slide Tabs -->
    <div class="benchmark-tabs">
      <button
        v-for="(s, idx) in slides"
        :key="s.id"
        class="tab-btn"
        :class="{ active: currentSlide === idx }"
        @click="selectSlide(idx)"
      >
        <span>{{ s.tag }}</span>
      </button>
    </div>

    <!-- Active Slide Content -->
    <div class="slide-content">
      <div class="slide-header">
        <div class="header-left">
          <div class="badge-row">
            <span class="pill-badge">{{ slides[currentSlide].badge }}</span>
            <span class="env-tag">Tested on Linux Cgroups (2 vCPU, 1 GB RAM)</span>
          </div>
          <h3>{{ slides[currentSlide].title }}</h3>
          <p class="subtitle">{{ slides[currentSlide].description }}</p>
        </div>

        <div class="stat-highlight">
          <div class="stat-val">
            {{ slides[currentSlide].highlightStat }}
            <span class="unit">{{ slides[currentSlide].highlightUnit }}</span>
          </div>
          <div class="stat-caption">{{ slides[currentSlide].highlightLabel }}</div>
        </div>
      </div>

      <!-- Comparative Bar Chart (for slides 0 to 3) -->
      <div v-if="slides[currentSlide].bars.length > 0" class="bars-container">
        <div 
          v-for="bar in slides[currentSlide].bars"
          :key="bar.name"
          class="bar-row"
        >
          <div class="bar-info">
            <span class="bar-name" :class="{ 'name-highlight': bar.highlight }">
              {{ bar.name }}
            </span>
            <span class="bar-val" :class="{ 'val-highlight': bar.highlight }">
              {{ bar.value }}
              <span class="bar-note">({{ bar.note }})</span>
            </span>
          </div>

          <div class="bar-track">
            <div 
              class="bar-fill" 
              :class="{ 'fill-primary': bar.highlight, 'fill-secondary': !bar.highlight }"
              :style="{ width: bar.width }"
            ></div>
          </div>
        </div>
      </div>

      <!-- Community & Sponsor Card (for slide 4) -->
      <div v-else class="community-banner">
        <div class="community-grid">
          <div class="community-box star-box">
            <h4>⭐ Star on GitHub</h4>
            <p>Show your support! Stars help more engineers discover this high-performance alternative to JasperReports.</p>
            <a 
              href="https://github.com/adilsoncruz/open-pdf-generator" 
              target="_blank" 
              rel="noopener noreferrer"
              class="cta-btn star-btn"
            >
              <span>Star Open PDF Generator</span>
              <span class="btn-arrow">→</span>
            </a>
          </div>

          <div class="community-box sponsor-box">
            <h4>☕ Sponsor & Donate</h4>
            <p>Support continuous development, cloud benchmark infrastructure, and open-source documentation.</p>
            <a 
              href="https://github.com/sponsors/adilsoncruz" 
              target="_blank" 
              rel="noopener noreferrer"
              class="cta-btn sponsor-btn"
            >
              <span>Become a Sponsor</span>
              <span class="btn-arrow">♥</span>
            </a>
          </div>
        </div>
      </div>
    </div>

    <!-- Navigation Dots & Footer Link -->
    <div class="benchmark-footer">
      <div class="nav-controls">
        <button class="nav-arrow" @click="prevSlide" title="Previous Slide">‹</button>
        <div class="dots-list">
          <span 
            v-for="(s, idx) in slides"
            :key="idx"
            class="dot"
            :class="{ active: currentSlide === idx }"
            @click="selectSlide(idx)"
          ></span>
        </div>
        <button class="nav-arrow" @click="nextSlide" title="Next Slide">›</button>
      </div>

      <div class="footer-tip">
        <span>💡 {{ slides[currentSlide].footerTip }}</span>
      </div>

      <a :href="withBase('/lib/benchmark')" class="benchmark-link">
        <span>Full Technical Benchmark →</span>
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

/* Tabs */
.benchmark-tabs {
  display: flex;
  overflow-x: auto;
  background: rgba(15, 23, 42, 0.03);
  border-bottom: 1px solid var(--vp-c-divider);
  scrollbar-width: none;
}

:deep(.dark) .benchmark-tabs,
.dark .benchmark-tabs {
  background: #0b1120;
}

.benchmark-tabs::-webkit-scrollbar {
  display: none;
}

.tab-btn {
  padding: 12px 18px;
  font-size: 12.5px;
  font-weight: 600;
  color: var(--vp-c-text-2);
  border: none;
  background: transparent;
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.2s ease;
  border-bottom: 2px solid transparent;
}

.tab-btn:hover {
  color: var(--vp-c-text-1);
  background: rgba(99, 102, 241, 0.04);
}

.tab-btn.active {
  color: var(--vp-c-brand-1);
  border-bottom-color: var(--vp-c-brand-1);
  background: rgba(99, 102, 241, 0.08);
  font-weight: 700;
}

/* Slide Content */
.slide-content {
  padding: 24px 28px;
}

.slide-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 20px;
  margin-bottom: 24px;
}

.header-left {
  flex: 1;
}

.badge-row {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 8px;
  flex-wrap: wrap;
}

.pill-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 3px 10px;
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--vp-c-brand-1);
  background: var(--vp-c-brand-soft);
  border: 1px solid rgba(99, 102, 241, 0.25);
  border-radius: 9999px;
  font-family: var(--vp-font-family-mono);
}

.env-tag {
  font-size: 11.5px;
  color: var(--vp-c-text-3);
  font-weight: 500;
}

.slide-header h3 {
  margin: 0 0 6px 0 !important;
  font-size: 20px !important;
  font-weight: 700 !important;
  color: var(--vp-c-text-1) !important;
  border-top: none !important;
  line-height: 1.3 !important;
}

.subtitle {
  margin: 0 !important;
  font-size: 13.5px !important;
  color: var(--vp-c-text-2) !important;
  line-height: 1.5 !important;
}

.stat-highlight {
  text-align: right;
  flex-shrink: 0;
  background: rgba(99, 102, 241, 0.06);
  padding: 10px 16px;
  border-radius: 12px;
  border: 1px solid rgba(99, 102, 241, 0.15);
}

.stat-val {
  font-size: 32px;
  font-weight: 800;
  font-family: var(--vp-font-family-mono);
  color: var(--vp-c-brand-1);
  line-height: 1;
  display: flex;
  align-items: baseline;
  justify-content: flex-end;
  gap: 4px;
}

.stat-val .unit {
  font-size: 14px;
  font-weight: 600;
  color: var(--vp-c-text-2);
}

.stat-caption {
  font-size: 11px;
  font-weight: 600;
  color: #10b981;
  margin-top: 4px;
}

/* Comparative Bars */
.bars-container {
  display: flex;
  flex-direction: column;
  gap: 14px;
  background: rgba(15, 23, 42, 0.02);
  padding: 18px 20px;
  border-radius: 12px;
  border: 1px solid var(--vp-c-divider);
}

:deep(.dark) .bars-container,
.dark .bars-container {
  background: #090e17;
  border-color: #1e293b;
}

.bar-row {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.bar-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 13px;
  flex-wrap: wrap;
  gap: 8px;
}

.bar-name {
  font-weight: 600;
  color: var(--vp-c-text-2);
}

.name-highlight {
  color: var(--vp-c-brand-1);
  font-weight: 700;
}

.bar-val {
  font-family: var(--vp-font-family-mono);
  font-weight: 600;
  color: var(--vp-c-text-2);
}

.val-highlight {
  color: var(--vp-c-text-1);
  font-weight: 700;
}

.bar-note {
  font-size: 11.5px;
  color: var(--vp-c-text-3);
  font-weight: 400;
  margin-left: 6px;
}

.bar-track {
  height: 10px;
  background: var(--vp-c-divider);
  border-radius: 9999px;
  overflow: hidden;
}

:deep(.dark) .bar-track,
.dark .bar-track {
  background: #1e293b;
}

.bar-fill {
  height: 100%;
  border-radius: 9999px;
  transition: width 0.6s cubic-bezier(0.16, 1, 0.3, 1);
}

.fill-primary {
  background: linear-gradient(90deg, #6366f1 0%, #818cf8 100%);
  box-shadow: 0 0 12px rgba(99, 102, 241, 0.5);
}

.fill-secondary {
  background: #64748b;
  opacity: 0.6;
}

/* Community & Star Banner */
.community-banner {
  padding: 6px 0;
}

.community-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

@media (max-width: 640px) {
  .community-grid {
    grid-template-columns: 1fr;
  }
}

.community-box {
  padding: 20px;
  border-radius: 12px;
  border: 1px solid var(--vp-c-divider);
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.star-box {
  background: rgba(99, 102, 241, 0.05);
  border-color: rgba(99, 102, 241, 0.2);
}

.sponsor-box {
  background: rgba(236, 72, 153, 0.05);
  border-color: rgba(236, 72, 153, 0.2);
}

.community-box h4 {
  margin: 0 !important;
  font-size: 16px !important;
  font-weight: 700 !important;
}

.community-box p {
  margin: 0 !important;
  font-size: 13px !important;
  color: var(--vp-c-text-2) !important;
  line-height: 1.5 !important;
  flex: 1;
}

.cta-btn {
  display: inline-flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 16px;
  border-radius: 8px;
  font-weight: 600;
  font-size: 13px;
  text-decoration: none !important;
  transition: all 0.2s ease;
  margin-top: 4px;
}

.star-btn {
  background: #6366f1;
  color: #ffffff !important;
}

.star-btn:hover {
  background: #4f46e5;
  transform: translateY(-1px);
}

.sponsor-btn {
  background: #ec4899;
  color: #ffffff !important;
}

.sponsor-btn:hover {
  background: #db2777;
  transform: translateY(-1px);
}

/* Footer & Controls */
.benchmark-footer {
  padding: 14px 28px;
  background: rgba(99, 102, 241, 0.04);
  border-top: 1px solid var(--vp-c-divider);
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 14px;
}

.nav-controls {
  display: flex;
  align-items: center;
  gap: 8px;
}

.nav-arrow {
  width: 26px;
  height: 26px;
  border-radius: 6px;
  border: 1px solid var(--vp-c-divider);
  background: var(--vp-c-bg);
  color: var(--vp-c-text-1);
  font-size: 16px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  line-height: 1;
}

.nav-arrow:hover {
  background: var(--vp-c-brand-soft);
  color: var(--vp-c-brand-1);
  border-color: var(--vp-c-brand-1);
}

.dots-list {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 0 4px;
}

.dot {
  width: 7px;
  height: 7px;
  border-radius: 9999px;
  background: var(--vp-c-divider);
  cursor: pointer;
  transition: all 0.2s ease;
}

.dot.active {
  width: 20px;
  background: var(--vp-c-brand-1);
}

.footer-tip {
  font-size: 12.5px;
  color: var(--vp-c-text-2);
  flex: 1;
  min-width: 240px;
}

.benchmark-link {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  color: var(--vp-c-brand-1);
  font-weight: 600;
  font-size: 13.5px;
  text-decoration: none;
  transition: gap 0.2s ease;
  white-space: nowrap;
}

.benchmark-link:hover {
  gap: 10px;
  color: var(--vp-c-brand-2);
}

@media (max-width: 720px) {
  .slide-header {
    flex-direction: column;
  }
  .stat-highlight {
    text-align: left;
    width: 100%;
  }
  .stat-val {
    justify-content: flex-start;
  }
}
</style>
