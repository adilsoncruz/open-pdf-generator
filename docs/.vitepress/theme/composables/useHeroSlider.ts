import { ref } from 'vue'

export interface HeroSlideData {
  id: string
  badge: string
  shortLabel: string
  title: string
  tagline: string
}

export const currentSlide = ref(0)
export const isPaused = ref(false)
export const totalSlides = 5

export const heroSlideTexts: HeroSlideData[] = [
  {
    id: 'overview',
    badge: '⭐ Open Source PDF Toolkit',
    shortLabel: 'Overview',
    title: 'Generate PDFs from JSON Templates',
    tagline: 'A powerful open-source toolkit for creating dynamic PDFs with Kotlin/Java.'
  },
  {
    id: 'throughput',
    badge: '⚡ 2.5x Faster Throughput',
    shortLabel: 'Throughput',
    title: '8,650 Docs/Sec Container Concurrency',
    tagline: 'Zero GC lockups and 100% lock-free parallel execution under 100,000 document stress.'
  },
  {
    id: 'barcodes',
    badge: '🏷️ 9.8x Faster Barcodes',
    shortLabel: 'Barcodes',
    title: 'Native Barcodes & QR in 1.2 Milliseconds',
    tagline: 'Vector Code 128 and 1-bit QR rasterization directly into PDF stream. 9.9x less memory.'
  },
  {
    id: 'coldstart',
    badge: '⏱️ 4.3x Faster Cold Start',
    shortLabel: 'Cold Start',
    title: '195ms Serverless Instant Cold Start',
    tagline: 'Instant JSON parsing with zero XML compilation for AWS Lambda and Google Cloud Run.'
  },
  {
    id: 'finops',
    badge: '💾 -60% Cloud Hosting Costs',
    shortLabel: 'FinOps',
    title: 'Slash Cloud Infrastructure Costs by 60%',
    tagline: 'Ultra-lightweight 4.0 MB runtime footprint (6.3x lighter) and 128 MB peak RAM. Runs in 512MB containers.'
  }
]

export function nextSlide() {
  currentSlide.value = (currentSlide.value + 1) % totalSlides
}

export function prevSlide() {
  currentSlide.value = (currentSlide.value - 1 + totalSlides) % totalSlides
}

export function setSlide(idx: number) {
  currentSlide.value = idx
}
