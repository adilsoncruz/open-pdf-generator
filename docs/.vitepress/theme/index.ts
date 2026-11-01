import { h } from 'vue'
import DefaultTheme from 'vitepress/theme'
import './custom.css'
import BenchmarkHero from './components/BenchmarkHero.vue'
import BenchmarkInteractiveChart from './components/BenchmarkInteractiveChart.vue'
import UnifiedBenchmarkChart from './components/UnifiedBenchmarkChart.vue'
import HeroGraphicSlider from './components/HeroGraphicSlider.vue'
import HeroTextSlider from './components/HeroTextSlider.vue'
import HeroDots from './components/HeroDots.vue'

export default {
  extends: DefaultTheme,
  Layout() {
    return h(DefaultTheme.Layout, null, {
      'home-hero-info': () => h(HeroTextSlider),
      'home-hero-image': () => h(HeroGraphicSlider),
      'home-hero-after': () => h(HeroDots)
    })
  },
  enhanceApp({ app }) {
    app.component('BenchmarkHero', BenchmarkHero)
    app.component('BenchmarkInteractiveChart', BenchmarkInteractiveChart)
    app.component('UnifiedBenchmarkChart', UnifiedBenchmarkChart)
    app.component('HeroGraphicSlider', HeroGraphicSlider)
    app.component('HeroTextSlider', HeroTextSlider)
    app.component('HeroDots', HeroDots)
  }
}
