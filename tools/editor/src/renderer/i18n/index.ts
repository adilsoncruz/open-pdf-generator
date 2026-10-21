/**
 * Internationalization (i18n) module for PDF Template Editor
 * 
 * Default language: English (en)
 * 
 * To add a new language:
 * 1. Create a new file in locales/ folder (e.g., pt.ts, es.ts, fr.ts)
 * 2. Copy the structure from en.ts and translate all strings
 * 3. Import and add it to the LOCALES object below
 * 4. Add the language code to AVAILABLE_LANGUAGES
 * 
 * Usage in components:
 * ```tsx
 * import { useTranslation } from '../i18n'
 * 
 * function MyComponent() {
 *   const { t } = useTranslation()
 *   return <button>{t.common.save}</button>
 * }
 * ```
 */

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Translations } from './types'
import en from './locales/en'
import pt from './locales/pt'
import es from './locales/es'

// Available languages
export const AVAILABLE_LANGUAGES = {
  en: 'English',
  pt: 'Português',
  es: 'Español',
} as const

export type LanguageCode = keyof typeof AVAILABLE_LANGUAGES

// All available locales
export const LOCALES: Record<LanguageCode, Translations> = {
  en,
  pt,
  es,
}

// Detect language from system / navigator
export function detectSystemLanguage(): LanguageCode {
  try {
    const rawLang = (typeof navigator !== 'undefined' ? (navigator.languages?.[0] || navigator.language) : '').toLowerCase()
    if (rawLang.startsWith('pt')) return 'pt'
    if (rawLang.startsWith('es')) return 'es'
  } catch {
    // ignore
  }
  return 'en'
}

// Default language
const DEFAULT_LANGUAGE: LanguageCode = detectSystemLanguage()

// i18n store interface
interface I18nState {
  language: LanguageCode
  setLanguage: (lang: LanguageCode) => void
}

// Zustand store for language preference (persisted to localStorage)
export const useI18nStore = create<I18nState>()(
  persist(
    (set) => ({
      language: DEFAULT_LANGUAGE,
      setLanguage: (lang: LanguageCode) => {
        set({ language: lang })
        if (window.electronAPI?.setLanguage) {
          window.electronAPI.setLanguage(lang)
        }
      },
    }),
    {
      name: 'pdf-editor-language',
    }
  )
)

/**
 * Hook to access translations
 * 
 * @returns Object with:
 * - t: Translations object for current language
 * - language: Current language code
 * - setLanguage: Function to change language
 * - availableLanguages: List of available languages
 * 
 * @example
 * ```tsx
 * const { t, language, setLanguage } = useTranslation()
 * 
 * return (
 *   <div>
 *     <button>{t.common.save}</button>
 *     <select 
 *       value={language} 
 *       onChange={(e) => setLanguage(e.target.value as LanguageCode)}
 *     >
 *       {Object.entries(availableLanguages).map(([code, name]) => (
 *         <option key={code} value={code}>{name}</option>
 *       ))}
 *     </select>
 *   </div>
 * )
 * ```
 */
export function useTranslation() {
  const { language, setLanguage } = useI18nStore()
  
  // Get translations for current language, fallback to English
  const t = LOCALES[language] || LOCALES[DEFAULT_LANGUAGE]
  
  return {
    t,
    language,
    setLanguage,
    availableLanguages: AVAILABLE_LANGUAGES,
  }
}

/**
 * Get translations without using React hooks
 * Useful for non-component code (e.g., utilities, constants)
 * 
 * @returns Translations object for current language
 */
export function getTranslations(): Translations {
  const language = useI18nStore.getState().language
  return LOCALES[language] || LOCALES[DEFAULT_LANGUAGE]
}

// Re-export types
export type { Translations } from './types'


