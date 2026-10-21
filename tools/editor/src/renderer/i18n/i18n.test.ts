import { describe, it, expect, beforeEach } from 'vitest'
import { useI18nStore, AVAILABLE_LANGUAGES, LOCALES, detectSystemLanguage } from './index'
import type { LanguageCode } from './index'

describe('Internationalization (i18n)', () => {
  beforeEach(() => {
    useI18nStore.setState({ language: 'en' })
    localStorage.clear()
  })

  it('supports English, Portuguese and Spanish in AVAILABLE_LANGUAGES', () => {
    expect(AVAILABLE_LANGUAGES).toHaveProperty('en', 'English')
    expect(AVAILABLE_LANGUAGES).toHaveProperty('pt', 'Português')
    expect(AVAILABLE_LANGUAGES).toHaveProperty('es', 'Español')
  })

  it('has translation dictionaries defined for all supported languages', () => {
    expect(LOCALES.en).toBeDefined()
    expect(LOCALES.pt).toBeDefined()
    expect(LOCALES.es).toBeDefined()
  })

  it('has consistent top-level keys across all locales', () => {
    const enKeys = Object.keys(LOCALES.en).sort()
    const ptKeys = Object.keys(LOCALES.pt).sort()
    const esKeys = Object.keys(LOCALES.es).sort()

    expect(ptKeys).toEqual(enKeys)
    expect(esKeys).toEqual(enKeys)
  })

  it('updates store language correctly', () => {
    const { setLanguage } = useI18nStore.getState()

    setLanguage('pt')
    expect(useI18nStore.getState().language).toBe('pt')

    setLanguage('es')
    expect(useI18nStore.getState().language).toBe('es')

    setLanguage('en')
    expect(useI18nStore.getState().language).toBe('en')
  })

  it('detectSystemLanguage returns pt, es or falls back to en', () => {
    const detected = detectSystemLanguage()
    expect(['en', 'pt', 'es']).toContain(detected)
  })
})
