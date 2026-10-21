<script setup lang="ts">
import { currentSlide, heroSlideTexts, setSlide, prevSlide, nextSlide, isPaused } from '../composables/useHeroSlider'
</script>

<template>
  <div 
    class="hero-dots-container"
    @mouseenter="isPaused = true"
    @mouseleave="isPaused = false"
  >
    <div class="hero-dots-bar">
      <!-- Previous Slide Button -->
      <button 
        class="nav-arrow-btn" 
        @click.stop="prevSlide" 
        aria-label="Previous benchmark slide"
        title="Previous slide"
      >
        <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
          <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"/>
        </svg>
      </button>

      <!-- Dots Track -->
      <div class="dots-pill-track">
        <button
          v-for="(slide, idx) in heroSlideTexts"
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
        aria-label="Next benchmark slide"
        title="Next slide"
      >
        <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
          <path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"/>
        </svg>
      </button>
    </div>
  </div>
</template>

<style scoped>
.hero-dots-container {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  margin: 10px auto 30px auto;
  padding: 0 16px;
  position: relative;
  z-index: 20;
}

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
</style>
