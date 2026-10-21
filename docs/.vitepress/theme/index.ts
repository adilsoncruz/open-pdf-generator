import DefaultTheme from 'vitepress/theme'
import './custom.css'
import BenchmarkHero from './components/BenchmarkHero.vue'
import BenchmarkInteractiveChart from './components/BenchmarkInteractiveChart.vue'

export default {
  extends: DefaultTheme,
  enhanceApp({ app }) {
    app.component('BenchmarkHero', BenchmarkHero)
    app.component('BenchmarkInteractiveChart', BenchmarkInteractiveChart)
  }
}



