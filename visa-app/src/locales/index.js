import zh from './zh.json'
import ko from './ko.json'
import en from './en.json'
import ja from './ja.json'

const locales = { zh, ko, en, ja }

/**
 * t(key, bilingual?)
 *   bilingual=false (기본) → zh 텍스트만 반환
 *   bilingual=true  → "zh텍스트 (ko텍스트)" 병기 반환 (개발 전용)
 *
 * 예: t('navigate')         → "导航"
 *     t('navigate', true)   → "导航 (길찾기)"
 */
export function t(key, bilingual = false) {
  const zh_text = zh[key] ?? key
  if (!bilingual) return zh_text
  const ko_text = ko[key]
  if (!ko_text || ko_text === zh_text) return zh_text
  return `${zh_text} (${ko_text})`
}

/**
 * 특정 언어로 번역 (lang prop 기반 다국어 앱에서 사용)
 * tLang(key, 'ko') → "길찾기"
 */
export function tLang(key, lang = 'zh') {
  return locales[lang]?.[key] ?? locales.zh[key] ?? key
}

export { zh, ko, en, ja }
