import { ref, computed } from 'vue'
import { useData, withBase } from 'vitepress'

export interface HeroSlideData {
  id: string
  badge: string
  shortLabel: string
  title: string
  tagline: string
}

export interface HeroCTAData {
  getStarted: string
  benchmark: string
  prevSlideTitle: string
  nextSlideTitle: string
}

export const currentSlide = ref(0)
export const isPaused = ref(false)
export const totalSlides = 5

const slidesByLang: Record<string, HeroSlideData[]> = {
  en: [
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
  ],
  'pt-BR': [
    {
      id: 'overview',
      badge: '⭐ Toolkit PDF Open Source',
      shortLabel: 'Visão Geral',
      title: 'Gere PDFs a partir de Templates JSON',
      tagline: 'Um toolkit open-source poderoso para criar PDFs dinâmicos com Kotlin/Java.'
    },
    {
      id: 'throughput',
      badge: '⚡ 2.5x Mais Throughput',
      shortLabel: 'Throughput',
      title: '8.650 Docs/Seg de Concorrência em Containers',
      tagline: 'Zero travamentos no GC e execução paralela 100% lock-free sob estresse de 100.000 documentos.'
    },
    {
      id: 'barcodes',
      badge: '🏷️ 9.8x Barcodes Mais Rápidos',
      shortLabel: 'Barcodes',
      title: 'Barcodes & QR Nativos em 1,2 Milissegundos',
      tagline: 'Rasterização vetorial de Code 128 e QR 1-bit direto no stream do PDF. 9,9x menos memória.'
    },
    {
      id: 'coldstart',
      badge: '⏱️ 4.3x Cold Start Mais Rápido',
      shortLabel: 'Cold Start',
      title: '195ms de Cold Start Instantâneo em Serverless',
      tagline: 'Parsing JSON instantâneo com zero compilação XML para AWS Lambda e Google Cloud Run.'
    },
    {
      id: 'finops',
      badge: '💾 -60% Custos de Hosting',
      shortLabel: 'FinOps',
      title: 'Corte Custos de Infraestrutura em Nuvem em 60%',
      tagline: 'Footprint de runtime ultraleve de 4,0 MB (6,3x mais leve) e pico de RAM de 128 MB. Roda em containers de 512MB.'
    }
  ],
  es: [
    {
      id: 'overview',
      badge: '⭐ Toolkit PDF Open Source',
      shortLabel: 'Visión General',
      title: 'Genera PDFs desde Plantillas JSON',
      tagline: 'Un toolkit open-source poderoso para crear PDFs dinámicos con Kotlin/Java.'
    },
    {
      id: 'throughput',
      badge: '⚡ 2.5x Más Throughput',
      shortLabel: 'Throughput',
      title: '8,650 Docs/Seg de Concurrencia en Contenedores',
      tagline: 'Cero bloqueos de GC y ejecución paralela 100% lock-free bajo estrés de 100,000 documentos.'
    },
    {
      id: 'barcodes',
      badge: '🏷️ 9.8x Barcodes Más Rápidos',
      shortLabel: 'Barcodes',
      title: 'Barcodes & QR Nativos en 1.2 Milisegundos',
      tagline: 'Rasterizado vectorial de Code 128 y QR de 1 bit directo en el stream del PDF. 9.9x menos memoria.'
    },
    {
      id: 'coldstart',
      badge: '⏱️ 4.3x Cold Start Más Rápido',
      shortLabel: 'Cold Start',
      title: '195ms de Cold Start Instantáneo en Serverless',
      tagline: 'Parsing JSON instantáneo con cero compilación XML para AWS Lambda y Google Cloud Run.'
    },
    {
      id: 'finops',
      badge: '💾 -60% Costos de Hosting en la Nube',
      shortLabel: 'FinOps',
      title: 'Reduce Costos de Infraestructura en la Nube un 60%',
      tagline: 'Footprint de runtime ultraligero de 4.0 MB (6.3x más ligero) y pico de RAM de 128 MB. Corre en contenedores de 512MB.'
    }
  ]
}

const ctasByLang: Record<string, HeroCTAData> = {
  en: {
    getStarted: 'Get Started',
    benchmark: '2.5x vs Jasper Benchmark',
    prevSlideTitle: 'Previous slide',
    nextSlideTitle: 'Next slide'
  },
  'pt-BR': {
    getStarted: 'Comece Agora',
    benchmark: 'Benchmark 2.5x vs Jasper',
    prevSlideTitle: 'Slide anterior',
    nextSlideTitle: 'Próximo slide'
  },
  es: {
    getStarted: 'Comienza Ahora',
    benchmark: 'Benchmark 2.5x vs Jasper',
    prevSlideTitle: 'Diapositiva anterior',
    nextSlideTitle: 'Siguiente diapositiva'
  }
}

// Locale directory prefix for building locale-aware internal links.
const langPrefixByLang: Record<string, string> = {
  en: '',
  'pt-BR': '/pt',
  es: '/es'
}

export function getLangPrefix(lang: string): string {
  return langPrefixByLang[lang] ?? ''
}

export function withLocaleBase(lang: string, path: string): string {
  return withBase(`${getLangPrefix(lang)}${path}`)
}

/**
 * Locale-aware hero slide texts for the home page slider.
 * Falls back to English when the current locale has no translations.
 */
export function useHeroSlides(): { slides: ReturnType<typeof computed<HeroSlideData[]>>, ctas: ReturnType<typeof computed<HeroCTAData>>, lang: ReturnType<typeof useData>['lang'] } {
  const { lang } = useData()
  const slides = computed(() => slidesByLang[lang.value] ?? slidesByLang.en)
  const ctas = computed(() => ctasByLang[lang.value] ?? ctasByLang.en)
  return { slides, ctas, lang }
}

export function nextSlide() {
  currentSlide.value = (currentSlide.value + 1) % totalSlides
}

export function prevSlide() {
  currentSlide.value = (currentSlide.value - 1 + totalSlides) % totalSlides
}

export function setSlide(idx: number) {
  currentSlide.value = idx
}
