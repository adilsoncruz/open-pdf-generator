<script setup>
import { onMounted, onUnmounted } from 'vue'
import { withBase } from 'vitepress'
import { currentSlide, isPaused, nextSlide } from '../composables/useHeroSlider'

let timer = null

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
    class="hero-graphic-viewport"
    @mouseenter="isPaused = true"
    @mouseleave="isPaused = false"
  >
    <!-- Background Ambient Glow (Free-floating) -->
    <div class="ambient-glow" :class="'glow-slide-' + currentSlide"></div>

    <!-- Slides Viewport (No bounding square box) -->
    <div class="slides-content">

      <!-- 0. Main Logo (Original Hero Experience) -->
      <transition name="fade-scale" mode="out-in">
        <div v-if="currentSlide === 0" key="slide-0" class="graphic-pane logo-pane">
          <div class="hero-logo-wrapper">
            <img 
              :src="withBase('/icon.png')" 
              alt="Open PDF Generator"
              class="hero-main-logo"
            />
          </div>
        </div>

        <!-- 1. Container Concurrency & Throughput -->
        <div v-else-if="currentSlide === 1" key="slide-1" class="graphic-pane metric-pane">
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
                  stroke="url(#gaugeGradient)"
                  stroke-width="12"
                  stroke-dasharray="204.2"
                  stroke-dashoffset="20"
                  stroke-linecap="round"
                  class="active-arc"
                />
                <circle cx="50" cy="27" r="4.5" fill="#f59e0b" />
              </svg>
            </div>

            <!-- Giant Stat -->
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
            <strong>100% lock-free parallel execution</strong> in container stress tests.
          </p>
        </div>

        <!-- 2. Complex Documents with Native Barcodes -->
        <div v-else-if="currentSlide === 2" key="slide-2" class="graphic-pane metric-pane">
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

            <!-- Giant Stat -->
            <div class="giant-stat text-emerald">
              1.22
              <span class="giant-unit">ms</span>
            </div>

            <div class="speed-delta-badge delta-emerald">
              <span class="delta-arrow">⚡</span>
              <span>9.8x Faster Document Generation</span>
            </div>
          </div>

          <div class="metrics-pill-row">
            <div class="mini-chip highlight-chip">
              <span><strong>9.9x less RAM</strong> (928 KB vs 9.1 MB)</span>
            </div>
            <div class="mini-chip muted-chip">
              <span>Jasper 7: 11.88 ms</span>
            </div>
          </div>

          <p class="slide-caption">
            <strong>Direct PDF vector operators</strong> eliminate heavy AWT BufferedImage rasters.
          </p>
        </div>

        <!-- 3. Cold Start & Serverless Readiness -->
        <div v-else-if="currentSlide === 3" key="slide-3" class="graphic-pane metric-pane">
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

            <!-- Giant Stat -->
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
        <div v-else-if="currentSlide === 4" key="slide-4" class="graphic-pane metric-pane">
          <div class="slide-badge">💾 Cloud FinOps & Footprint</div>

          <div class="stat-center-block">
            <!-- Giant Stat -->
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
      </transition>

    </div>
  </div>
</template>

<style scoped>
/* Main Viewport: Clean, spacious, NO square box */
.hero-graphic-viewport {
  position: relative;
  width: 100%;
  max-width: 440px;
  min-height: 340px;
  display: flex;
  align-items: center;
  justify-content: center;
  user-select: none;
  margin: 0 auto;
}

/* Ambient Radial Glow */
.ambient-glow {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 320px;
  height: 320px;
  border-radius: 50%;
  transform: translate(-50%, -50%);
  pointer-events: none;
  filter: blur(65px);
  z-index: 0;
  opacity: 0.4;
  transition: all 0.8s ease;
}

.dark .ambient-glow {
  opacity: 0.6;
}

.glow-slide-0 {
  background: radial-gradient(circle, rgba(99, 102, 241, 0.45) 0%, rgba(168, 85, 247, 0.25) 60%, transparent 80%);
}

.glow-slide-1 {
  background: radial-gradient(circle, rgba(99, 102, 241, 0.5) 0%, rgba(16, 185, 129, 0.25) 60%, transparent 80%);
}

.glow-slide-2 {
  background: radial-gradient(circle, rgba(16, 185, 129, 0.45) 0%, rgba(99, 102, 241, 0.25) 60%, transparent 80%);
}

.glow-slide-3 {
  background: radial-gradient(circle, rgba(99, 102, 241, 0.5) 0%, rgba(59, 130, 246, 0.25) 60%, transparent 80%);
}

.glow-slide-4 {
  background: radial-gradient(circle, rgba(16, 185, 129, 0.5) 0%, rgba(139, 92, 246, 0.25) 60%, transparent 80%);
}

/* Slides Content Container */
.slides-content {
  position: relative;
  z-index: 1;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* Graphic Pane */
.graphic-pane {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
}

/* Slide 0: Logo Pane (Original Hero Experience) */
.logo-pane {
  padding: 10px;
}

.hero-logo-wrapper {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}

.hero-main-logo {
  width: 270px;
  height: 270px;
  max-width: 100%;
  object-fit: contain;
  filter: drop-shadow(0 20px 35px rgba(99, 102, 241, 0.28));
  animation: floatLogo 5s ease-in-out infinite;
}

@keyframes floatLogo {
  0%, 100% {
    transform: translateY(0px) scale(1);
  }
  50% {
    transform: translateY(-8px) scale(1.02);
  }
}

/* Slide Badge */
.slide-badge {
  display: inline-flex;
  align-items: center;
  padding: 4px 14px;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  color: var(--vp-c-brand-1);
  background: var(--vp-c-brand-soft);
  border: 1px solid rgba(99, 102, 241, 0.25);
  border-radius: 9999px;
  margin-bottom: 14px;
}

/* Center Stat Block */
.stat-center-block {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  margin-bottom: 16px;
}

/* SVG Gauges */
.gauge-arc-wrap,
.timer-dial-wrap {
  width: 140px;
  height: 72px;
  margin-bottom: -10px;
}

.gauge-svg {
  width: 100%;
  height: 100%;
  overflow: visible;
}

.track-arc {
  stroke: var(--vp-c-border);
  opacity: 0.5;
}

.dark .track-arc {
  stroke: #334155;
  opacity: 0.8;
}

.active-arc {
  filter: drop-shadow(0 2px 6px rgba(99, 102, 241, 0.4));
}

/* High-Impact Giant Number */
.giant-stat {
  font-size: 54px;
  font-weight: 900;
  line-height: 1.02;
  letter-spacing: -0.04em;
  font-family: var(--vp-font-family-base);
  display: flex;
  align-items: baseline;
  justify-content: center;
  gap: 8px;
}

.giant-unit {
  font-size: 20px;
  font-weight: 700;
  letter-spacing: 0.02em;
  opacity: 0.85;
}

.text-brand {
  background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #10b981 100%);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
}

.text-emerald {
  background: linear-gradient(135deg, #10b981 0%, #059669 50%, #34d399 100%);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
}

.text-indigo {
  background: linear-gradient(135deg, #6366f1 0%, #4f46e5 50%, #818cf8 100%);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
}

/* Delta Badge */
.speed-delta-badge {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  margin-top: 6px;
  padding: 3px 10px;
  border-radius: 9999px;
  font-size: 12px;
  font-weight: 700;
  color: #047857;
  background: #d1fae5;
  border: 1px solid rgba(16, 185, 129, 0.3);
}

.dark .speed-delta-badge {
  color: #34d399;
  background: rgba(16, 185, 129, 0.15);
  border-color: rgba(52, 211, 153, 0.3);
}

.speed-delta-badge.delta-emerald {
  color: #047857;
  background: #d1fae5;
}
.dark .speed-delta-badge.delta-emerald {
  color: #34d399;
  background: rgba(16, 185, 129, 0.15);
}

.speed-delta-badge.delta-indigo {
  color: #4338ca;
  background: #e0e7ff;
  border-color: rgba(99, 102, 241, 0.3);
}
.dark .speed-delta-badge.delta-indigo {
  color: #818cf8;
  background: rgba(99, 102, 241, 0.15);
}

/* Barcode visual header */
.code-visual-header {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
  margin-bottom: 6px;
}

.code-bars-icon {
  display: inline-flex;
  gap: 2.5px;
  align-items: flex-end;
  height: 24px;
}

.code-bars-icon span {
  width: 2.5px;
  background: var(--vp-c-brand-1);
  border-radius: 1px;
}

.code-bars-icon span:nth-child(1) { height: 22px; width: 3.5px; }
.code-bars-icon span:nth-child(2) { height: 16px; }
.code-bars-icon span:nth-child(3) { height: 24px; width: 4.5px; }
.code-bars-icon span:nth-child(4) { height: 18px; }
.code-bars-icon span:nth-child(5) { height: 24px; width: 3px; }
.code-bars-icon span:nth-child(6) { height: 20px; width: 4px; }

.qr-cube-icon {
  display: grid;
  grid-template-columns: repeat(2, 8px);
  gap: 3px;
}

.qr-cube-dot {
  width: 8px;
  height: 8px;
  border-radius: 2px;
  background: var(--vp-c-border);
}

.qr-cube-dot.active {
  background: #10b981;
}

/* FinOps Duo Row */
.finops-duo-row {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
  margin-top: 8px;
}

.duo-item {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.duo-val {
  font-size: 16px;
  font-weight: 800;
  color: var(--vp-c-text-1);
}

.duo-lbl {
  font-size: 11px;
  color: var(--vp-c-text-2);
}

.duo-sep {
  width: 1px;
  height: 24px;
  background: var(--vp-c-border);
}

/* Comparison Pills Row */
.metrics-pill-row {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  flex-wrap: wrap;
  margin-bottom: 12px;
}

.mini-chip {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 4px 10px;
  border-radius: 8px;
  font-size: 12px;
  line-height: 1.3;
}

.highlight-chip {
  background: var(--vp-c-brand-soft);
  color: var(--vp-c-brand-1);
  border: 1px solid rgba(99, 102, 241, 0.25);
  font-weight: 600;
}

.muted-chip {
  background: var(--vp-c-bg-elv);
  color: var(--vp-c-text-2);
  border: 1px solid var(--vp-c-border);
}

.alert-chip {
  background: rgba(239, 68, 68, 0.08);
  color: #ef4444;
  border: 1px solid rgba(239, 68, 68, 0.2);
}

.chip-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #10b981;
}

/* Slide Caption */
.slide-caption {
  font-size: 12.5px;
  color: var(--vp-c-text-2);
  line-height: 1.4;
  max-width: 340px;
  margin: 0 auto;
}

.slide-caption strong {
  color: var(--vp-c-text-1);
}

/* Transitions */
.fade-scale-enter-active,
.fade-scale-leave-active {
  transition: all 0.35s cubic-bezier(0.16, 1, 0.3, 1);
}

.fade-scale-enter-from {
  opacity: 0;
  transform: scale(0.96);
}

.fade-scale-leave-to {
  opacity: 0;
  transform: scale(1.04);
}
</style>
