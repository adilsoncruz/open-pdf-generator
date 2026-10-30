<script setup lang="ts">
import { currentSlide, useHeroSlides, withLocaleBase, prevSlide, nextSlide, setSlide, isPaused } from '../composables/useHeroSlider'

const { slides, ctas, lang } = useHeroSlides()
</script>

<template>
  <div 
    class="hero-bottom-container"
    @mouseenter="isPaused = true"
    @mouseleave="isPaused = false"
  >
    <!-- Slide Navigation Dots (Centered) -->
    <div class="hero-dots-bar">
      <!-- Previous Slide Button -->
      <button
        class="nav-arrow-btn"
        @click.stop="prevSlide"
        :aria-label="ctas.prevSlideTitle"
        :title="ctas.prevSlideTitle"
      >
        <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
          <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"/>
        </svg>
      </button>

      <!-- Dots Track -->
      <div class="dots-pill-track">
        <button
          v-for="(slide, idx) in slides"
          :key="slide.id"
          class="dot-btn"
          :class="{ active: currentSlide === idx }"
          @click.stop="setSlide(idx)"
          :title="slide.badge"
        >
          <span class="dot-circle"></span>
          <span v-if="currentSlide === idx" class="dot-label">{{ slide.shortLabel }}</span>
        </button>
      </div>

      <!-- Next Slide Button -->
      <button
        class="nav-arrow-btn"
        @click.stop="nextSlide"
        :aria-label="ctas.nextSlideTitle"
        :title="ctas.nextSlideTitle"
      >
        <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
          <path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"/>
        </svg>
      </button>
    </div>

    <!-- Action CTA Buttons (Centered Below Slides) -->
    <div class="hero-actions-row">
      <a :href="withLocaleBase(lang, '/lib/guide/getting-started')" class="hero-btn btn-brand">
        {{ ctas.getStarted }}
      </a>
      <a :href="withLocaleBase(lang, '/lib/benchmark')" class="hero-btn btn-alt">
        <span class="bolt-icon">⚡</span> {{ ctas.benchmark }}
      </a>
      <a 
        href="https://github.com/adilsoncruz/open-pdf-generator" 
        target="_blank" 
        rel="noopener" 
        class="hero-btn btn-alt"
      >
        GitHub
      </a>
    </div>
  </div>
</template>

<style scoped>
.hero-bottom-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 20px;
  width: 100%;
  margin: 12px auto 36px auto;
  padding: 0 16px;
  position: relative;
  z-index: 20;
}

/* Dots Bar */
.hero-dots-bar {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 5px 10px;
  background: var(--vp-c-bg-elv);
  border: 1px solid var(--vp-c-border);
  border-radius: 9999px;
  box-shadow: 0 4px 18px rgba(0, 0, 0, 0.05),
              0 1px 3px rgba(0, 0, 0, 0.04);
  backdrop-filter: blur(12px);
  transition: all 0.25s ease;
}

.dark .hero-dots-bar {
  background: rgba(15, 23, 42, 0.85);
  border-color: rgba(99, 102, 241, 0.2);
  box-shadow: 0 6px 24px rgba(0, 0, 0, 0.35);
}

.hero-dots-bar:hover {
  border-color: rgba(99, 102, 241, 0.4);
  box-shadow: 0 6px 22px rgba(99, 102, 241, 0.12);
}

.nav-arrow-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 26px;
  height: 26px;
  border-radius: 50%;
  border: none;
  background: transparent;
  color: var(--vp-c-text-2);
  cursor: pointer;
  transition: all 0.2s ease;
}

.nav-arrow-btn:hover {
  color: var(--vp-c-brand-1);
  background: var(--vp-c-brand-soft);
  transform: scale(1.1);
}

.dots-pill-track {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 0 4px;
}

.dot-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  height: 26px;
  padding: 0 7px;
  border-radius: 9999px;
  border: 1px solid transparent;
  background: transparent;
  cursor: pointer;
  transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
}

.dot-circle {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: var(--vp-c-text-3);
  transition: all 0.25s ease;
}

.dot-btn:hover .dot-circle {
  background: var(--vp-c-brand-1);
  transform: scale(1.25);
}

.dot-btn.active {
  background: var(--vp-c-brand-soft);
  border-color: rgba(99, 102, 241, 0.25);
  padding: 0 10px;
}

.dot-btn.active .dot-circle {
  background: var(--vp-c-brand-1);
  box-shadow: 0 0 8px var(--vp-c-brand-1);
}

.dot-label {
  font-size: 12px;
  font-weight: 600;
  color: var(--vp-c-brand-1);
  letter-spacing: -0.01em;
  white-space: nowrap;
  animation: fadeIn 0.2s ease;
}

/* Hero Action Buttons Row */
.hero-actions-row {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 14px;
  flex-wrap: wrap;
}

.hero-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  height: 44px;
  padding: 0 24px;
  border-radius: 9999px;
  font-size: 15px;
  font-weight: 600;
  text-decoration: none;
  line-height: 1;
  transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
  user-select: none;
}

/* Brand Button (Get Started) */
.hero-btn.btn-brand {
  background: #5b55f0;
  background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%);
  color: #ffffff;
  border: 1px solid rgba(255, 255, 255, 0.15);
  box-shadow: 0 4px 18px rgba(79, 70, 229, 0.38);
}

.hero-btn.btn-brand:hover {
  background: linear-gradient(135deg, #4f46e5 0%, #4338ca 100%);
  box-shadow: 0 6px 24px rgba(79, 70, 229, 0.52);
  transform: translateY(-1.5px);
}

/* Alt Buttons (Benchmark & GitHub) */
.hero-btn.btn-alt {
  background: #f1f5f9;
  color: #1e293b;
  border: 1px solid #e2e8f0;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.03);
}

.dark .hero-btn.btn-alt {
  background: #1e293b;
  color: #f1f5f9;
  border-color: #334155;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.25);
}

.hero-btn.btn-alt:hover {
  border-color: var(--vp-c-brand-1);
  color: var(--vp-c-brand-1);
  transform: translateY(-1.5px);
  background: #e2e8f0;
}

.dark .hero-btn.btn-alt:hover {
  background: #334155;
  color: #818cf8;
  border-color: #818cf8;
}

.bolt-icon {
  color: #f59e0b;
  font-size: 15px;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateX(-4px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

@media (max-width: 640px) {
  .hero-actions-row {
    flex-direction: column;
    width: 100%;
    max-width: 280px;
    gap: 10px;
  }
  .hero-btn {
    width: 100%;
  }
}
</style>
