<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { withBase } from 'vitepress'

const currentSlide = ref(0)
const isHovered = ref(false)
let timer = null

const totalSlides = 5

function nextSlide() {
  currentSlide.value = (currentSlide.value + 1) % totalSlides
}

function prevSlide() {
  currentSlide.value = (currentSlide.value - 1 + totalSlides) % totalSlides
}

function setSlide(idx) {
  currentSlide.value = idx
}

onMounted(() => {
  timer = setInterval(() => {
    if (!isHovered.value) {
      nextSlide()
    }
  }, 5000)
})

onUnmounted(() => {
  if (timer) clearInterval(timer)
})
</script>

<template>
  <div 
    class="hero-slider-frame"
    @mouseenter="isHovered = true"
    @mouseleave="isHovered = false"
  >
    <!-- Background Ambient Glow -->
    <div class="ambient-glow" :class="'glow-slide-' + currentSlide"></div>

    <!-- Slides Container -->
    <div class="slides-viewport">

      <!-- 1. Container Concurrency & Throughput -->
      <div v-show="currentSlide === 0" class="slide-pane">
        <div class="slide-badge">⚡ Throughput & Concurrency</div>

        <div class="stat-center-block">
          <div class="gauge-arc-wrap">
            <svg viewBox="0 0 160 85" class="gauge-svg">
              <defs>
                <linearGradient id="gaugeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stop-color="#6366f1" />
                  <stop offset="60%" stop-color="#8b5cf6" />
                  <stop offset="100%" stop-color="#10b981" />
                </linearGradient>
              </defs>
              <!-- Background Arc -->
              <path
                d="M 15 75 A 65 65 0 0 1 145 75"
                fill="none"
                class="track-arc"
                stroke-width="12"
                stroke-linecap="round"
              />
              <!-- Active Fill Arc -->
              <path
                d="M 15 75 A 65 65 0 0 1 145 75"
                fill="none"
                stroke="url(#gaugeGradient)"
                stroke-width="12"
                stroke-dasharray="204.2"
                stroke-dashoffset="20"
                stroke-linecap="round"
                class="active-arc"
              />
              <!-- Jasper marker (38% capacity) -->
              <circle cx="50" cy="27" r="4" fill="#f59e0b" />
            </svg>
          </div>

          <!-- Giant Number -->
          <div class="giant-stat text-brand">
            8,650
            <span class="giant-unit">docs/s</span>
          </div>

          <div class="speed-delta-badge">
            <span class="delta-arrow">▲</span>
            <span>+144% vs JasperReports 7</span>
          </div>
        </div>

        <div class="metrics-pill-row">
          <div class="mini-chip highlight-chip">
            <span class="chip-dot"></span>
            <span>Open PDF: <strong>8,650/s</strong></span>
          </div>
          <div class="mini-chip muted-chip">
            <span>Jasper 7: 3,539/s</span>
          </div>
        </div>

        <p class="slide-caption">
          <strong>100% lock-free parallel execution</strong> in 2-core container stress tests.
        </p>
      </div>

      <!-- 2. Complex Documents with Native Barcodes -->
      <div v-show="currentSlide === 1" class="slide-pane">
        <div class="slide-badge">🏷️ Native Barcodes & QR</div>

        <div class="stat-center-block">
          <!-- Mini Code Visual -->
          <div class="code-visual-header">
            <div class="code-bars-icon">
              <span></span><span></span><span></span><span></span><span></span><span></span>
            </div>
            <div class="qr-cube-icon">
              <div class="qr-cube-dot active"></div><div class="qr-cube-dot"></div>
              <div class="qr-cube-dot"></div><div class="qr-cube-dot active"></div>
            </div>
          </div>

          <!-- Giant Number -->
          <div class="giant-stat text-emerald">
            9.8x
            <span class="giant-unit">FASTER</span>
          </div>

          <div class="compare-row-pill">
            <span class="pill-openpdf">Open PDF: <strong>1.22 ms</strong></span>
            <span class="pill-divider">vs</span>
            <span class="pill-jasper">Jasper: 11.88 ms</span>
          </div>
        </div>

        <div class="metrics-pill-row">
          <div class="mini-chip highlight-chip">
            <span><strong>9.9x less RAM</strong> (928 KB vs 9.1 MB)</span>
          </div>
          <div class="mini-chip muted-chip">
            <span>3.8 KB PDF size</span>
          </div>
        </div>

        <p class="slide-caption">
          <strong>Direct PDF vector operators</strong> eliminate heavy AWT BufferedImage rasters.
        </p>
      </div>

      <!-- 3. Cold Start & Serverless Readiness -->
      <div v-show="currentSlide === 2" class="slide-pane">
        <div class="slide-badge">⏱️ Cold Start & Serverless</div>

        <div class="stat-center-block">
          <div class="timer-dial-wrap">
            <svg viewBox="0 0 160 85" class="gauge-svg">
              <defs>
                <linearGradient id="coldGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stop-color="#10b981" />
                  <stop offset="100%" stop-color="#6366f1" />
                </linearGradient>
              </defs>
              <path
                d="M 15 75 A 65 65 0 0 1 145 75"
                fill="none"
                class="track-arc"
                stroke-width="12"
                stroke-linecap="round"
              />
              <path
                d="M 15 75 A 65 65 0 0 1 145 75"
                fill="none"
                stroke="url(#coldGradient)"
                stroke-width="12"
                stroke-dasharray="204.2"
                stroke-dashoffset="170"
                stroke-linecap="round"
                class="active-arc"
              />
            </svg>
          </div>

          <!-- Giant Number -->
          <div class="giant-stat text-indigo">
            195
            <span class="giant-unit">ms</span>
          </div>

          <div class="speed-delta-badge delta-indigo">
            <span class="delta-arrow">▲</span>
            <span>4.3x Faster First Document</span>
          </div>
        </div>

        <div class="metrics-pill-row">
          <div class="mini-chip highlight-chip">
            <span>Open PDF: <strong>195 ms</strong></span>
          </div>
          <div class="mini-chip muted-chip">
            <span>Jasper 7: 742 ms</span>
          </div>
          <div class="mini-chip alert-chip">
            <span>Jasper 6: 1,166 ms</span>
          </div>
        </div>

        <p class="slide-caption">
          <strong>Instant JSON parsing</strong> without XML compilation for AWS Lambda & Cloud Run.
        </p>
      </div>

      <!-- 4. Memory Allocation & Dependency Footprint -->
      <div v-show="currentSlide === 3" class="slide-pane">
        <div class="slide-badge">💾 Cloud FinOps & Footprint</div>

        <div class="stat-center-block">
          <!-- Giant Number -->
          <div class="giant-stat text-emerald">
            -60%
            <span class="giant-unit">CLOUD BILL</span>
          </div>

          <div class="finops-duo-row">
            <div class="duo-item">
              <span class="duo-val">4.0 MB</span>
              <span class="duo-lbl">6.3x lighter JAR</span>
            </div>
            <div class="duo-sep"></div>
            <div class="duo-item">
              <span class="duo-val">128 MB</span>
              <span class="duo-lbl">25% lower RAM</span>
            </div>
          </div>
        </div>

        <div class="metrics-pill-row">
          <div class="mini-chip highlight-chip">
            <span>Zero Apache Commons</span>
          </div>
          <div class="mini-chip highlight-chip">
            <span>Zero ECJ Compiler</span>
          </div>
        </div>

        <p class="slide-caption">
          Runs comfortably in <strong>512MB / 1GB containers</strong> without OOM GC thrashing.
        </p>
      </div>

      <!-- 5. Studio & Ecosystem (Logo with Badges) -->
      <div v-show="currentSlide === 4" class="slide-pane logo-pane">
        <div class="logo-center-wrap">
          <img 
            :src="withBase('/icon.png')" 
            alt="Open PDF Generator"
            class="hero-logo-img"
          />

          <!-- Floating Badges -->
          <div class="floating-badge badge-tr">
            <span>⚡ 9.8x Barcodes</span>
          </div>
          <div class="floating-badge badge-bl">
            <span>🚀 195ms Boot</span>
          </div>
          <div class="floating-badge badge-br">
            <span>⭐ LGPL-3.0 Free</span>
          </div>
        </div>

        <p class="slide-caption logo-caption">
          <strong>Open PDF Studio</strong> & Engine: Modern JSON-first PDF ecosystem.
        </p>
      </div>

    </div>

    <!-- Navigation Dots and Arrow Bar -->
    <div class="slider-controls-bar">
      <button class="arrow-btn" @click.stop="prevSlide" title="Previous Slide">‹</button>
      
      <div class="dots-track">
        <button 
          v-for="i in totalSlides"
          :key="i"
          class="dot-pill"
          :class="{ active: currentSlide === (i - 1) }"
          @click.stop="setSlide(i - 1)"
          :title="'Slide ' + i"
        ></button>
      </div>

      <button class="arrow-btn" @click.stop="nextSlide" title="Next Slide">›</button>
    </div>
  </div>
</template>

<style scoped>
/* Main Card Frame (Theme-Adaptive) */
.hero-slider-frame {
  position: relative;
  width: 100%;
  max-width: 360px;
  aspect-ratio: 1 / 1;
  border-radius: 28px;
  background: var(--vp-c-bg-alt);
  border: 1px solid var(--vp-c-border);
  box-shadow: 0 16px 40px -10px rgba(99, 102, 241, 0.12),
              0 4px 16px rgba(0, 0, 0, 0.04);
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  overflow: hidden;
  user-select: none;
  transition: transform 0.3s ease, border-color 0.3s ease, box-shadow 0.3s ease;
  margin: 0 auto;
}

:deep(.dark) .hero-slider-frame,
.dark .hero-slider-frame {
  background: #0f172a;
  border-color: #1e293b;
  box-shadow: 0 20px 50px -10px rgba(0, 0, 0, 0.5),
              inset 0 1px 0 rgba(255, 255, 255, 0.1);
}

.hero-slider-frame:hover {
  border-color: var(--vp-c-brand-1);
  transform: translateY(-2px);
}

/* Ambient Radial Glow */
.ambient-glow {
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  border-radius: 50%;
  pointer-events: none;
  transition: all 0.8s ease;
  z-index: 0;
  opacity: 0.6;
}

.dark .ambient-glow {
  opacity: 1;
}

.glow-slide-0 {
  background: radial-gradient(circle at 50% 50%, rgba(99, 102, 241, 0.18) 0%, transparent 60%);
}

.glow-slide-1 {
  background: radial-gradient(circle at 50% 50%, rgba(16, 185, 129, 0.18) 0%, transparent 60%);
}

.glow-slide-2 {
  background: radial-gradient(circle at 50% 50%, rgba(99, 102, 241, 0.18) 0%, transparent 60%);
}

.glow-slide-3 {
  background: radial-gradient(circle at 50% 50%, rgba(16, 185, 129, 0.18) 0%, transparent 60%);
}

.glow-slide-4 {
  background: radial-gradient(circle at 50% 50%, rgba(99, 102, 241, 0.22) 0%, transparent 60%);
}

/* Slide Viewport */
.slides-viewport {
  position: relative;
  z-index: 1;
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 18px 20px 10px 20px;
}

.slide-pane {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-between;
  text-align: center;
  animation: fadeIn 0.35s ease-out;
}

@keyframes fadeIn {
  from { opacity: 0; transform: scale(0.96); }
  to { opacity: 1; transform: scale(1); }
}

/* Top Pill Badge */
.slide-badge {
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--vp-c-brand-1);
  background: var(--vp-c-brand-soft);
  border: 1px solid rgba(99, 102, 241, 0.25);
  padding: 3px 10px;
  border-radius: 9999px;
  font-family: var(--vp-font-family-mono);
}

/* Center Block with Giant Number */
.stat-center-block {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
  margin: auto 0;
}

/* SVG Gauge */
.gauge-arc-wrap, .timer-dial-wrap {
  width: 100%;
  max-width: 180px;
  margin-bottom: -18px;
}

.gauge-svg {
  width: 100%;
  height: auto;
  overflow: visible;
}

.track-arc {
  stroke: var(--vp-c-divider);
}

:deep(.dark) .track-arc,
.dark .track-arc {
  stroke: rgba(255, 255, 255, 0.08);
}

.active-arc {
  animation: arcDash 1s ease-out;
}

@keyframes arcDash {
  from { stroke-dashoffset: 204.2; }
  to { stroke-dashoffset: 20; }
}

/* Giant Number Styling */
.giant-stat {
  font-size: 46px;
  font-weight: 900;
  font-family: var(--vp-font-family-mono);
  line-height: 1;
  letter-spacing: -0.03em;
  display: flex;
  align-items: baseline;
  justify-content: center;
  gap: 6px;
}

.giant-unit {
  font-size: 14px;
  font-weight: 700;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  color: var(--vp-c-text-2);
}

.text-brand {
  color: var(--vp-c-brand-1);
}

.text-emerald {
  color: #10b981;
}

.text-indigo {
  color: #6366f1;
}

:deep(.dark) .text-indigo,
.dark .text-indigo {
  color: #818cf8;
}

/* Delta Badge */
.speed-delta-badge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 11.5px;
  font-weight: 700;
  color: #059669;
  background: rgba(16, 185, 129, 0.1);
  padding: 2px 8px;
  border-radius: 9999px;
  margin-top: 6px;
}

:deep(.dark) .speed-delta-badge,
.dark .speed-delta-badge {
  color: #34d399;
  background: rgba(16, 185, 129, 0.15);
}

.delta-indigo {
  color: var(--vp-c-brand-1) !important;
  background: var(--vp-c-brand-soft) !important;
}

.delta-arrow {
  font-size: 10px;
}

/* Code Visual Header */
.code-visual-header {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 14px;
  margin-bottom: 6px;
}

.code-bars-icon {
  display: flex;
  align-items: center;
  gap: 2.5px;
  height: 20px;
}

.code-bars-icon span {
  width: 2.5px;
  height: 100%;
  background: var(--vp-c-brand-1);
  border-radius: 1px;
}

.code-bars-icon span:nth-child(2),
.code-bars-icon span:nth-child(4) {
  width: 4px;
}

.qr-cube-icon {
  display: grid;
  grid-template-columns: repeat(2, 7px);
  gap: 2px;
}

.qr-cube-dot {
  width: 7px;
  height: 7px;
  border: 1px solid var(--vp-c-brand-1);
  border-radius: 1px;
}

.qr-cube-dot.active {
  background: #10b981;
  border-color: #10b981;
}

/* Compare Row Pill */
.compare-row-pill {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 11px;
  font-family: var(--vp-font-family-mono);
  background: var(--vp-c-bg-soft);
  padding: 3px 10px;
  border-radius: 9999px;
  border: 1px solid var(--vp-c-border);
  margin-top: 6px;
}

.pill-openpdf strong {
  color: #10b981;
}

.pill-divider {
  color: var(--vp-c-text-3);
  font-size: 9px;
}

.pill-jasper {
  color: var(--vp-c-text-3);
  text-decoration: line-through;
}

/* FinOps Duo Row */
.finops-duo-row {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
  margin-top: 6px;
}

.duo-item {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.duo-val {
  font-size: 14px;
  font-weight: 800;
  font-family: var(--vp-font-family-mono);
  color: var(--vp-c-text-1);
}

.duo-lbl {
  font-size: 10px;
  font-weight: 500;
  color: var(--vp-c-text-2);
}

.duo-sep {
  width: 1px;
  height: 22px;
  background: var(--vp-c-border);
}

/* Chips Row */
.metrics-pill-row {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  flex-wrap: wrap;
  margin-top: 6px;
}

.mini-chip {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 3px 8px;
  border-radius: 6px;
  font-size: 11px;
  font-family: var(--vp-font-family-mono);
  background: var(--vp-c-bg-soft);
  border: 1px solid var(--vp-c-border);
  color: var(--vp-c-text-2);
}

.highlight-chip {
  background: var(--vp-c-brand-soft);
  border-color: rgba(99, 102, 241, 0.25);
  color: var(--vp-c-text-1);
}

.highlight-chip strong {
  color: var(--vp-c-brand-1);
}

.chip-dot {
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: #10b981;
}

.muted-chip {
  color: var(--vp-c-text-3);
}

.alert-chip {
  background: rgba(244, 63, 94, 0.08);
  border-color: rgba(244, 63, 94, 0.2);
  color: #e11d48;
}

:deep(.dark) .alert-chip,
.dark .alert-chip {
  color: #fca5a5;
  background: rgba(244, 63, 94, 0.15);
}

/* Caption */
.slide-caption {
  margin: 6px 0 0 0 !important;
  font-size: 11.5px !important;
  color: var(--vp-c-text-2) !important;
  line-height: 1.4 !important;
}

.slide-caption strong {
  color: var(--vp-c-text-1);
}

/* Logo Pane */
.logo-pane {
  justify-content: center;
  position: relative;
}

.logo-center-wrap {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 190px;
  height: 190px;
}

.hero-logo-img {
  width: 140px;
  height: 140px;
  object-fit: contain;
  filter: drop-shadow(0 10px 25px rgba(99, 102, 241, 0.35));
}

.floating-badge {
  position: absolute;
  padding: 4px 9px;
  border-radius: 9999px;
  font-size: 10px;
  font-weight: 700;
  backdrop-filter: blur(10px);
  white-space: nowrap;
  box-shadow: 0 4px 12px rgba(0,0,0,0.12);
  border: 1px solid var(--vp-c-border);
}

.badge-tr {
  top: 10px;
  right: -15px;
  background: var(--vp-c-bg-soft);
  color: var(--vp-c-brand-1);
}

.badge-bl {
  bottom: 12px;
  left: -20px;
  background: var(--vp-c-bg-soft);
  color: #10b981;
}

.badge-br {
  bottom: -4px;
  right: -5px;
  background: var(--vp-c-bg-soft);
  color: #f59e0b;
}

.logo-caption {
  margin-top: 10px !important;
}

/* Controls Bar */
.slider-controls-bar {
  position: relative;
  z-index: 2;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 16px;
  background: var(--vp-c-bg-soft);
  border-top: 1px solid var(--vp-c-border);
}

.arrow-btn {
  width: 22px;
  height: 22px;
  border-radius: 5px;
  background: var(--vp-c-bg);
  border: 1px solid var(--vp-c-border);
  color: var(--vp-c-text-2);
  font-size: 15px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  line-height: 1;
  transition: all 0.2s ease;
}

.arrow-btn:hover {
  background: var(--vp-c-brand-1);
  color: #ffffff;
  border-color: var(--vp-c-brand-1);
}

.dots-track {
  display: flex;
  align-items: center;
  gap: 6px;
}

.dot-pill {
  width: 6px;
  height: 6px;
  border-radius: 9999px;
  background: var(--vp-c-divider);
  border: none;
  cursor: pointer;
  padding: 0;
  transition: all 0.25s ease;
}

.dot-pill.active {
  width: 18px;
  background: var(--vp-c-brand-1);
  box-shadow: 0 0 8px rgba(99, 102, 241, 0.4);
}
</style>
