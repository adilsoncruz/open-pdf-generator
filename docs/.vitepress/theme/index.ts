import { h } from 'vue'
import DefaultTheme from 'vitepress/theme'
import './custom.css'
import BenchmarkHero from './components/BenchmarkHero.vue'
import BenchmarkInteractiveChart from './components/BenchmarkInteractiveChart.vue'
import HeroGraphicSlider from './components/HeroGraphicSlider.vue'
import HeroTextSlider from './components/HeroTextSlider.vue'

export default {
  extends: DefaultTheme,
  Layout() {
    return h(DefaultTheme.Layout, null, {
      'home-hero-info': () => h(HeroTextSlider),
      'home-hero-image': () => h(HeroGraphicSlider)
    })
  },
  enhanceApp({ app }) {
    app.component('BenchmarkHero', BenchmarkHero)
    app.component('BenchmarkInteractiveChart', BenchmarkInteractiveChart)
    app.component('HeroGraphicSlider', HeroGraphicSlider)
    app.component('HeroTextSlider', HeroTextSlider)
  }
}
