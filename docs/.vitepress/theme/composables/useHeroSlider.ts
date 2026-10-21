import { ref } from 'vue'

export interface HeroSlideData {
  id: string
  badge: string
  title: string
  tagline: string
}

export const currentSlide = ref(0)
export const isPaused = ref(false)
export const totalSlides = 5

export const heroSlideTexts: HeroSlideData[] = [
  {
    id: 'throughput',
    badge: '⚡ 2.5x Faster Throughput',
    title: 'Generate PDFs from JSON Templates',
    tagline: '8,650 docs/sec in containers with 100% lock-free parallel execution. Zero GC lockups under 100,000 document stress.'
  },
  {
    id: 'barcodes',
    badge: '🏷️ 9.8x Faster Barcodes',
    title: 'Native Barcodes & QR Codes in 1.2ms',
    tagline: 'Direct PDF vector Code 128 and 1-bit QR Code operators in 1.22 ms vs 11.88 ms in JasperReports. Uses 9.9x less RAM per doc.'
  },
  {
    id: 'coldstart',
    badge: '⏱️ 4.3x Faster Serverless Boot',
    title: '195ms Instant Cold Start for Cloud Run',
    tagline: 'Instant JSON template parse with zero XML bytecode compilation. Essential for AWS Lambda and scale-to-zero microservices.'
  },
  {
    id: 'finops',
    badge: '💾 -60% Cloud Hosting Costs',
    title: 'Slash Cloud Infrastructure Bills by 60%',
    tagline: 'Ultra-lightweight 4.0 MB runtime footprint (6.3x lighter) and 128 MB peak RAM. No bloated Apache Commons or ECJ compilers.'
  },
  {
    id: 'ecosystem',
    badge: '⭐ 100% Free & Open Source',
    title: 'Complete Modern PDF Ecosystem',
    tagline: 'Studio Slate visual template editor, CLI automation, and high-performance Kotlin/Java core engine under LGPL-3.0.'
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
