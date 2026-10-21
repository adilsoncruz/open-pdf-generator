<script setup lang="ts">
import { computed } from 'vue'
import { currentSlide, heroSlideTexts } from '../composables/useHeroSlider'

const activeSlide = computed(() => heroSlideTexts[currentSlide.value])
</script>

<template>
  <div class="hero-text-slider">
    <!-- Top Animated Pill -->
    <div class="hero-badge-wrap">
      <transition name="fade-fast" mode="out-in">
        <span :key="activeSlide.id" class="hero-pill-badge">
          {{ activeSlide.badge }}
        </span>
      </transition>
    </div>

    <!-- Main Heading -->
    <h1 class="heading">
      <span class="name clip">Open PDF Generator</span>
      <transition name="fade-slide" mode="out-in">
        <span :key="activeSlide.id" class="text dynamic-hero-text">
          {{ activeSlide.title }}
        </span>
      </transition>
    </h1>

    <!-- Subtitle / Tagline -->
    <transition name="fade-slide" mode="out-in">
      <p :key="activeSlide.id" class="tagline dynamic-tagline">
        {{ activeSlide.tagline }}
      </p>
    </transition>
  </div>
</template>

<style scoped>
.hero-text-slider {
  display: flex;
  flex-direction: column;
}

.hero-badge-wrap {
  margin-bottom: 12px;
  min-height: 26px;
}

.hero-pill-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 12px;
  font-size: 11.5px;
  font-weight: 700;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  color: var(--vp-c-brand-1);
  background: var(--vp-c-brand-soft);
  border: 1px solid rgba(99, 102, 241, 0.28);
  border-radius: 9999px;
  font-family: var(--vp-font-family-mono);
  box-shadow: 0 2px 8px rgba(99, 102, 241, 0.12);
}

.heading {
  display: flex;
  flex-direction: column;
  line-height: 1.15;
}

.name {
  letter-spacing: -0.4px;
  font-size: 32px;
  font-weight: 700;
  white-space: pre-wrap;
  color: var(--vp-c-brand-1);
  margin-bottom: 4px;
}

.clip {
  background: linear-gradient(135deg, #818cf8 0%, #6366f1 50%, #4f46e5 100%);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
}

.text {
  letter-spacing: -0.4px;
  font-size: 32px;
  font-weight: 800;
  color: var(--vp-c-text-1);
  line-height: 1.15;
  min-height: 76px;
}

@media (min-width: 640px) {
  .name {
    font-size: 44px;
  }
  .text {
    font-size: 44px;
    min-height: 104px;
  }
}

@media (min-width: 960px) {
  .name {
    font-size: 50px;
  }
  .text {
    font-size: 48px;
    min-height: 115px;
  }
}

.tagline {
  padding-top: 10px;
  max-width: 560px;
  line-height: 28px;
  font-size: 17px;
  font-weight: 400;
  color: var(--vp-c-text-2);
  min-height: 60px;
}

@media (min-width: 640px) {
  .tagline {
    font-size: 18.5px;
    line-height: 30px;
  }
}

/* Transitions */
.fade-fast-enter-active,
.fade-fast-leave-active {
  transition: opacity 0.2s ease;
}
.fade-fast-enter-from,
.fade-fast-leave-to {
  opacity: 0;
}

.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}
.fade-slide-enter-from {
  opacity: 0;
  transform: translateY(6px);
}
.fade-slide-leave-to {
  opacity: 0;
  transform: translateY(-6px);
}
</style>
