<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { withBase } from 'vitepress'

const currentSlide = ref(0)
const isHovered = ref(false)
let timer = null

const totalSlides = 4

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

      <!-- SLIDE 0: Radial Tachometer / Speedometer (Throughput) -->
      <div v-show="currentSlide === 0" class="slide-pane">
        <div class="slide-badge">⚡ Throughput Speedometer</div>

        <div class="gauge-wrapper">
          <svg viewBox="0 0 200 130" class="gauge-svg">
            <defs>
              <linearGradient id="gaugeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stop-color="#6366f1" />
                <stop offset="50%" stop-color="#a855f7" />
                <stop offset="100%" stop-color="#10b981" />
              </linearGradient>
              <linearGradient id="needleGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stop-color="#ffffff" />
                <stop offset="100%" stop-color="#6366f1" />
              </linearGradient>
            </defs>

            <!-- Background Track Arc -->
            <path
              d="M 25 115 A 75 75 0 0 1 175 115"
              fill="none"
              stroke="rgba(255, 255, 255, 0.08)"
              stroke-width="14"
              stroke-linecap="round"
            />

            <!-- Filled Active Arc (Open PDF at 92% capacity) -->
            <path
              d="M 25 115 A 75 75 0 0 1 175 115"
              fill="none"
              stroke="url(#gaugeGradient)"
              stroke-width="14"
              stroke-dasharray="235.6"
              stroke-dashoffset="24"
              stroke-linecap="round"
              class="active-arc"
            />

            <!-- Jasper Comparison Marker (at 38% capacity) -->
            <!-- x=64, y=56 approx for 38% angle -->
            <circle cx="64" cy="56" r="4.5" fill="#f59e0b" />
            <text x="32" y="44" fill="#94a3b8" font-size="8.5" font-family="monospace">Jasper: 3.5k</text>

            <!-- Center Reading -->
            <text x="100" y="92" text-anchor="middle" class="gauge-number">8,650</text>
            <text x="100" y="108" text-anchor="middle" class="gauge-unit">DOCS / SEC</text>
          </svg>
        </div>

        <div class="metrics-pill-row">
          <div class="mini-chip highlight-chip">
            <span class="chip-dot"></span>
            <span class="chip-label">Open PDF: <strong>8,650/s</strong></span>
          </div>
          <div class="mini-chip muted-chip">
            <span class="chip-label">Jasper 7: 3,539/s</span>
          </div>
        </div>

        <p class="slide-caption">
          <strong>+144% higher capacity</strong> in 2-core container stress tests.
        </p>
      </div>

      <!-- SLIDE 1: Latency Sparkline Curve (P99 Stability & Zero Locks) -->
      <div v-show="currentSlide === 1" class="slide-pane">
        <div class="slide-badge">⚡ Latency Timeline (p50 / p99)</div>

        <div class="sparkline-wrapper">
          <svg viewBox="0 0 240 120" class="sparkline-svg">
            <defs>
              <linearGradient id="areaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stop-color="#6366f1" stop-opacity="0.45" />
                <stop offset="100%" stop-color="#6366f1" stop-opacity="0.0" />
              </linearGradient>
            </defs>

            <!-- Grid Lines -->
            <line x1="20" y1="20" x2="230" y2="20" stroke="rgba(255,255,255,0.06)" stroke-dasharray="3,3" />
            <line x1="20" y1="60" x2="230" y2="60" stroke="rgba(255,255,255,0.06)" stroke-dasharray="3,3" />
            <line x1="20" y1="100" x2="230" y2="100" stroke="rgba(255,255,255,0.06)" />

            <!-- Jasper Reports Jagged Curve (Red/Orange dashed with GC spikes) -->
            <path
              d="M 20 65 Q 40 70, 60 55 T 100 85 T 130 30 T 160 75 T 190 25 T 230 60"
              fill="none"
              stroke="#f43f5e"
              stroke-width="2"
              stroke-dasharray="4,4"
              opacity="0.75"
            />
            <text x="180" y="20" fill="#f43f5e" font-size="8" font-family="monospace">Jasper GC spikes</text>

            <!-- Open PDF Smooth Low Area -->
            <path
              d="M 20 95 Q 60 92, 100 94 T 160 93 T 200 94 T 230 92 L 230 100 L 20 100 Z"
              fill="url(#areaGradient)"
            />

            <!-- Open PDF Curve Line (Vibrant Indigo) -->
            <path
              d="M 20 95 Q 60 92, 100 94 T 160 93 T 200 94 T 230 92"
              fill="none"
              stroke="#818cf8"
              stroke-width="3"
              stroke-linecap="round"
            />

            <!-- Marker Point -->
            <circle cx="200" cy="94" r="4" fill="#10b981" />
            <text x="165" y="85" fill="#10b981" font-size="9" font-weight="700" font-family="monospace">0.38 ms p50</text>
          </svg>
        </div>

        <div class="metrics-pill-row">
          <div class="mini-chip highlight-chip">
            <span class="chip-label">p50: <strong>0.38 ms</strong></span>
          </div>
          <div class="mini-chip highlight-chip">
            <span class="chip-label">p99: <strong>0.66 ms</strong></span>
          </div>
          <div class="mini-chip alert-chip">
            <span class="chip-label">Jasper p99: 7.2 ms</span>
          </div>
        </div>

        <p class="slide-caption">
          <strong>100% lock-free parallelism</strong> protects REST APIs from gateway timeouts.
        </p>
      </div>

      <!-- SLIDE 2: Concentric FinOps Donut Rings (Memory & Footprint) -->
      <div v-show="currentSlide === 2" class="slide-pane">
        <div class="slide-badge">💾 Cloud FinOps & Footprint</div>

        <div class="rings-wrapper">
          <svg viewBox="0 0 200 130" class="rings-svg">
            <!-- Outer Ring: JAR Package Size (Open PDF 4MB vs Jasper 25MB -> 16%) -->
            <circle cx="70" cy="65" r="48" fill="none" stroke="rgba(255,255,255,0.08)" stroke-width="8" />
            <circle
              cx="70" cy="65" r="48"
              fill="none"
              stroke="#6366f1"
              stroke-width="8"
              stroke-dasharray="301.6"
              stroke-dashoffset="253"
              stroke-linecap="round"
              transform="rotate(-90 70 65)"
            />

            <!-- Inner Ring: Peak Container RSS RAM (Open PDF 128MB vs Jasper 171MB -> 75%) -->
            <circle cx="70" cy="65" r="34" fill="none" stroke="rgba(255,255,255,0.08)" stroke-width="7" />
            <circle
              cx="70" cy="65" r="34"
              fill="none"
              stroke="#10b981"
              stroke-width="7"
              stroke-dasharray="213.6"
              stroke-dashoffset="53"
              stroke-linecap="round"
              transform="rotate(-90 70 65)"
            />

            <!-- Center Text -->
            <text x="70" y="62" text-anchor="middle" class="ring-center-val">-60%</text>
            <text x="70" y="74" text-anchor="middle" class="ring-center-lbl">CLOUD BILL</text>

            <!-- Right Side Legend -->
            <text x="135" y="44" fill="#818cf8" font-size="11" font-weight="700" font-family="monospace">4.0 MB</text>
            <text x="135" y="55" fill="#94a3b8" font-size="8.5">6.3x lighter JAR</text>

            <text x="135" y="80" fill="#10b981" font-size="11" font-weight="700" font-family="monospace">128 MB</text>
            <text x="135" y="91" fill="#94a3b8" font-size="8.5">25% lower RAM</text>
          </svg>
        </div>

        <div class="metrics-pill-row">
          <div class="mini-chip highlight-chip">
            <span class="chip-label">Zero Apache Commons</span>
          </div>
          <div class="mini-chip highlight-chip">
            <span class="chip-label">Zero ECJ Compiler</span>
          </div>
        </div>

        <p class="slide-caption">
          Instant cold start on <strong>AWS Lambda & Google Cloud Run</strong>.
        </p>
      </div>

      <!-- SLIDE 3: The Crisp Glowing Logo & Feature Badges -->
      <div v-show="currentSlide === 3" class="slide-pane logo-pane">
        <div class="logo-center-wrap">
          <img 
            :src="withBase('/icon.png')" 
            alt="Open PDF Generator"
            class="hero-logo-img"
          />

          <!-- Floating Badges -->
          <div class="floating-badge badge-tr">
            <span>⚡ 9.8x Faster Barcode</span>
          </div>
          <div class="floating-badge badge-bl">
            <span>🚀 195ms Cold Start</span>
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
.hero-slider-frame {
  position: relative;
  width: 100%;
  max-width: 360px;
  aspect-ratio: 1 / 1;
  border-radius: 28px;
  background: rgba(15, 23, 42, 0.7);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 20px 50px -10px rgba(0, 0, 0, 0.5),
              inset 0 1px 0 rgba(255, 255, 255, 0.15);
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  overflow: hidden;
  user-select: none;
  transition: transform 0.3s ease, border-color 0.3s ease;
  margin: 0 auto;
}

.hero-slider-frame:hover {
  border-color: rgba(99, 102, 241, 0.45);
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
}

.glow-slide-0 {
  background: radial-gradient(circle at 50% 50%, rgba(99, 102, 241, 0.22) 0%, transparent 60%);
}

.glow-slide-1 {
  background: radial-gradient(circle at 50% 50%, rgba(16, 185, 129, 0.18) 0%, transparent 60%);
}

.glow-slide-2 {
  background: radial-gradient(circle at 50% 50%, rgba(168, 85, 247, 0.2) 0%, transparent 60%);
}

.glow-slide-3 {
  background: radial-gradient(circle at 50% 50%, rgba(99, 102, 241, 0.28) 0%, transparent 60%);
}

/* Slide Viewport */
.slides-viewport {
  position: relative;
  z-index: 1;
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 22px 22px 10px 22px;
}

.slide-pane {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-between;
  text-align: center;
  animation: fadeIn 0.4s ease-out;
}

@keyframes fadeIn {
  from { opacity: 0; transform: scale(0.97); }
  to { opacity: 1; transform: scale(1); }
}

.slide-badge {
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: #818cf8;
  background: rgba(99, 102, 241, 0.14);
  border: 1px solid rgba(99, 102, 241, 0.3);
  padding: 3px 10px;
  border-radius: 9999px;
  font-family: var(--vp-font-family-mono);
}

/* Gauge SVG */
.gauge-wrapper {
  width: 100%;
  max-width: 210px;
  margin: 2px auto 0 auto;
}

.gauge-svg {
  width: 100%;
  height: auto;
  overflow: visible;
}

.gauge-number {
  font-size: 26px;
  font-weight: 800;
  fill: #f8fafc;
  font-family: var(--vp-font-family-mono);
}

.gauge-unit {
  font-size: 9px;
  font-weight: 700;
  fill: #818cf8;
  letter-spacing: 0.12em;
}

.active-arc {
  animation: arcDash 1s ease-out;
}

@keyframes arcDash {
  from { stroke-dashoffset: 235.6; }
  to { stroke-dashoffset: 24; }
}

/* Sparkline SVG */
.sparkline-wrapper {
  width: 100%;
  max-width: 240px;
  margin: 6px auto 0 auto;
}

.sparkline-svg {
  width: 100%;
  height: auto;
}

/* Rings SVG */
.rings-wrapper {
  width: 100%;
  max-width: 220px;
  margin: 4px auto 0 auto;
}

.rings-svg {
  width: 100%;
  height: auto;
}

.ring-center-val {
  font-size: 14px;
  font-weight: 800;
  fill: #f8fafc;
  font-family: var(--vp-font-family-mono);
}

.ring-center-lbl {
  font-size: 6.5px;
  font-weight: 700;
  fill: #10b981;
  letter-spacing: 0.08em;
}

/* Chips Row */
.metrics-pill-row {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  flex-wrap: wrap;
  margin-top: 6px;
}

.mini-chip {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 3px 8px;
  border-radius: 6px;
  font-size: 11px;
  font-family: var(--vp-font-family-mono);
}

.highlight-chip {
  background: rgba(99, 102, 241, 0.18);
  border: 1px solid rgba(99, 102, 241, 0.35);
  color: #c7d2fe;
}

.highlight-chip strong {
  color: #ffffff;
}

.chip-dot {
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: #10b981;
}

.muted-chip {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: #94a3b8;
}

.alert-chip {
  background: rgba(244, 63, 94, 0.12);
  border: 1px solid rgba(244, 63, 94, 0.25);
  color: #fca5a5;
}

.slide-caption {
  margin: 6px 0 0 0 !important;
  font-size: 11.5px !important;
  color: #94a3b8 !important;
  line-height: 1.4 !important;
}

.slide-caption strong {
  color: #f8fafc;
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
  filter: drop-shadow(0 10px 25px rgba(99, 102, 241, 0.45));
}

.floating-badge {
  position: absolute;
  padding: 4px 9px;
  border-radius: 9999px;
  font-size: 10px;
  font-weight: 700;
  backdrop-filter: blur(10px);
  white-space: nowrap;
  box-shadow: 0 4px 12px rgba(0,0,0,0.3);
}

.badge-tr {
  top: 10px;
  right: -15px;
  background: rgba(99, 102, 241, 0.25);
  border: 1px solid rgba(99, 102, 241, 0.4);
  color: #c7d2fe;
}

.badge-bl {
  bottom: 12px;
  left: -20px;
  background: rgba(16, 185, 129, 0.2);
  border: 1px solid rgba(16, 185, 129, 0.35);
  color: #a7f3d0;
}

.badge-br {
  bottom: -4px;
  right: -5px;
  background: rgba(245, 158, 11, 0.2);
  border: 1px solid rgba(245, 158, 11, 0.35);
  color: #fde68a;
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
  background: rgba(15, 23, 42, 0.4);
  border-top: 1px solid rgba(255, 255, 255, 0.06);
}

.arrow-btn {
  width: 22px;
  height: 22px;
  border-radius: 5px;
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: #cbd5e1;
  font-size: 15px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  line-height: 1;
  transition: all 0.2s ease;
}

.arrow-btn:hover {
  background: #6366f1;
  color: #ffffff;
  border-color: #6366f1;
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
  background: rgba(255, 255, 255, 0.2);
  border: none;
  cursor: pointer;
  padding: 0;
  transition: all 0.25s ease;
}

.dot-pill.active {
  width: 18px;
  background: #6366f1;
  box-shadow: 0 0 8px rgba(99, 102, 241, 0.6);
}
</style>
