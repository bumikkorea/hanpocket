import { useState } from 'react'

const LANGS = ['ko','zh','en']

function nextLang(c) { 
  return LANGS[(LANGS.indexOf(c)+1)%3] 
}

function langLabel(c) { 
  return {ko:'한국어',zh:'中文',en:'EN'}[nextLang(c)] 
}

export function useLanguage(initialLang = 'ko') {
  const [lang, setLang] = useState(initialLang)

  const toggleLanguage = () => {
    const newLang = nextLang(lang)
    setLang(newLang)
    return newLang
  }

  const getCurrentLangLabel = () => langLabel(lang)

  return {
    lang,
    setLang,
    toggleLanguage,
    getCurrentLangLabel,
    nextLang,
    langLabel
  }
}