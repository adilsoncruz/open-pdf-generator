import DefaultTheme from 'vitepress/theme'
import './custom.css'
import BenchmarkHero from './components/BenchmarkHero.vue'

export default {
  extends: DefaultTheme,
  enhanceApp({ app }) {
    app.component('BenchmarkHero', BenchmarkHero)
  }
}


