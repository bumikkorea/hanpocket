/**
 * NEAR i18n — LanguageContext + LanguageProvider + useLanguage
 * 기존 src/locales/ 시스템과 연동
 */
import { createContext, useContext, useState, useCallback } from 'react'
import { tLang } from '../locales/index.js'

const LanguageContext = createContext(null)

export const SUPPORTED_LANGS = ['zh', 'ko', 'en']
const STORAGE_KEY = 'near_language'

export function LanguageProvider({ children }) {
  const [lang, setLangState] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved && SUPPORTED_LANGS.includes(saved)) return saved
    // legacy key 마이그레이션
    const legacy = localStorage.getItem('hp_lang')
    if (legacy && SUPPORTED_LANGS.includes(legacy)) return legacy
    const sys = (navigator.language || 'zh').toLowerCase()
    if (sys.startsWith('zh')) return 'zh'
    if (sys.startsWith('en')) return 'en'
    return 'zh'
  })

  const setLanguage = useCallback((newLang) => {
    if (!SUPPORTED_LANGS.includes(newLang)) return
    localStorage.setItem(STORAGE_KEY, newLang)
    localStorage.setItem('hp_lang', newLang) // legacy sync
    setLangState(newLang)
  }, [])

  const t = useCallback((key) => {
    return tLang(key, lang)
  }, [lang])

  return (
    <LanguageContext.Provider value={{ lang, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const ctx = useContext(LanguageContext)
  if (!ctx) {
    // fallback — Context 없을 때 zh 기본값
    return {
      lang: 'zh',
      setLanguage: () => {},
      t: (key) => tLang(key, 'zh'),
    }
  }
  return ctx
}
