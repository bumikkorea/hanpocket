// 다국어 필드 헬퍼 — POI/매장 데이터 표시용

/**
 * item.name_ko / name_zh / name_en 중 lang에 맞는 이름 반환
 */
export const getLocalizedName = (item, lang) => {
  if (!item) return ''
  if (lang === 'ko') return item.name_ko || item.name_zh || item.name_en || ''
  if (lang === 'en') return item.name_en || item.name_ko || item.name_zh || ''
  return item.name_zh || item.name_ko || item.name_en || ''
}

/**
 * item.address_ko / address_zh 중 lang에 맞는 주소 반환
 * 영어 주소는 별도 필드 없으므로 ko로 폴백
 */
export const getLocalizedAddress = (item, lang) => {
  if (!item) return ''
  if (lang === 'ko') return item.address_ko || item.address_zh || ''
  if (lang === 'en') return item.address_ko || item.address_zh || ''
  return item.address_zh || item.address_ko || ''
}

/**
 * "사전 예약" 태그 텍스트
 */
export const getReservationLabel = (lang) => {
  if (lang === 'ko') return '사전 예약'
  if (lang === 'en') return 'Reservation'
  return '需预约'
}
