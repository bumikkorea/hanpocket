// 다국어 매장명/주소 표시 유틸
export function getLocalizedName(item, lang) {
  if (lang === 'ko') return item.name_ko || item.name_zh || item.name_en || ''
  if (lang === 'en') return item.name_en || item.name_zh || item.name_ko || ''
  return item.name_zh || item.name_ko || item.name_en || ''
}

export function getLocalizedAddress(item, lang) {
  if (lang === 'ko') return item.address_ko || item.address_zh || ''
  if (lang === 'en') return item.address_ko || item.address_zh || ''  // 영어 주소 없으니 한국어 fallback
  return item.address_zh || item.address_ko || ''
}
