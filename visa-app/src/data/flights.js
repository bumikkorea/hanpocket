/**
 * 주요 중국→한국 항공편 스케줄 데이터베이스
 * 항공편 번호로 조회 → 출발/도착 공항, 시간, 비행시간 자동 반환
 * // 주기적으로 항공사 스케줄 확인 필요
 */

export const FLIGHT_DB = {
  // ─── OZ 아시아나 ───
  'OZ301': { from: 'PVG', to: 'ICN', dep: '09:00', arr: '11:50', min: 130 },
  'OZ302': { from: 'ICN', to: 'PVG', dep: '13:00', arr: '14:30', min: 130 },
  'OZ303': { from: 'PVG', to: 'ICN', dep: '15:10', arr: '18:00', min: 130 },
  'OZ304': { from: 'ICN', to: 'PVG', dep: '19:00', arr: '20:30', min: 130 },
  'OZ311': { from: 'PEK', to: 'ICN', dep: '09:30', arr: '12:30', min: 130 },
  'OZ312': { from: 'ICN', to: 'PEK', dep: '14:00', arr: '15:30', min: 130 },
  'OZ321': { from: 'CAN', to: 'ICN', dep: '08:30', arr: '13:00', min: 210 },
  'OZ322': { from: 'ICN', to: 'CAN', dep: '14:30', arr: '17:30', min: 210 },
  'OZ331': { from: 'CTU', to: 'ICN', dep: '10:00', arr: '14:30', min: 240 },
  'OZ339': { from: 'SZX', to: 'ICN', dep: '09:00', arr: '13:30', min: 210 },
  'OZ341': { from: 'HGH', to: 'ICN', dep: '11:00', arr: '13:40', min: 130 },
  'OZ351': { from: 'NKG', to: 'ICN', dep: '13:00', arr: '15:30', min: 130 },
  'OZ361': { from: 'DLC', to: 'ICN', dep: '10:00', arr: '11:50', min: 90 },
  'OZ371': { from: 'TAO', to: 'ICN', dep: '09:30', arr: '11:30', min: 100 },

  // ─── KE 대한항공 ───
  'KE892': { from: 'PVG', to: 'ICN', dep: '10:30', arr: '13:20', min: 130 },
  'KE893': { from: 'ICN', to: 'PVG', dep: '14:30', arr: '16:00', min: 130 },
  'KE856': { from: 'PEK', to: 'ICN', dep: '10:00', arr: '13:00', min: 130 },
  'KE857': { from: 'ICN', to: 'PEK', dep: '14:00', arr: '15:30', min: 130 },
  'KE882': { from: 'CAN', to: 'ICN', dep: '09:00', arr: '13:30', min: 210 },
  'KE876': { from: 'CTU', to: 'ICN', dep: '09:30', arr: '14:00', min: 240 },
  'KE868': { from: 'SZX', to: 'ICN', dep: '10:00', arr: '14:30', min: 210 },
  'KE896': { from: 'HGH', to: 'ICN', dep: '12:30', arr: '15:10', min: 130 },
  'KE806': { from: 'DLC', to: 'ICN', dep: '11:30', arr: '13:20', min: 90 },
  'KE852': { from: 'TAO', to: 'ICN', dep: '10:00', arr: '12:00', min: 100 },
  'KE842': { from: 'SHE', to: 'ICN', dep: '09:00', arr: '11:30', min: 130 },

  // ─── CA 에어차이나 ───
  'CA131': { from: 'PEK', to: 'ICN', dep: '08:30', arr: '11:30', min: 130 },
  'CA132': { from: 'ICN', to: 'PEK', dep: '12:30', arr: '14:00', min: 130 },
  'CA157': { from: 'PVG', to: 'ICN', dep: '14:00', arr: '16:50', min: 130 },
  'CA171': { from: 'CTU', to: 'ICN', dep: '07:30', arr: '12:00', min: 240 },

  // ─── MU 동방항공 ───
  'MU5051': { from: 'PVG', to: 'ICN', dep: '08:00', arr: '10:50', min: 130 },
  'MU5052': { from: 'ICN', to: 'PVG', dep: '12:00', arr: '13:30', min: 130 },
  'MU5053': { from: 'PVG', to: 'ICN', dep: '13:00', arr: '15:50', min: 130 },
  'MU519': { from: 'PEK', to: 'ICN', dep: '09:00', arr: '12:00', min: 130 },
  'MU5041': { from: 'SHA', to: 'ICN', dep: '10:00', arr: '12:40', min: 120 },
  'MU5039': { from: 'NKG', to: 'ICN', dep: '11:00', arr: '13:30', min: 130 },
  'MU2083': { from: 'CKG', to: 'ICN', dep: '08:30', arr: '13:00', min: 230 },

  // ─── CZ 남방항공 ───
  'CZ681': { from: 'CAN', to: 'ICN', dep: '08:00', arr: '12:30', min: 210 },
  'CZ682': { from: 'ICN', to: 'CAN', dep: '13:30', arr: '16:30', min: 210 },
  'CZ337': { from: 'SZX', to: 'ICN', dep: '09:30', arr: '14:00', min: 210 },
  'CZ679': { from: 'WUH', to: 'ICN', dep: '10:00', arr: '13:30', min: 170 },

  // ─── ZH 심천항공 ───
  'ZH9091': { from: 'SZX', to: 'ICN', dep: '08:00', arr: '12:30', min: 210 },
  'ZH9051': { from: 'PVG', to: 'ICN', dep: '11:00', arr: '13:50', min: 130 },

  // ─── HO 길상항공 ───
  'HO1609': { from: 'PVG', to: 'ICN', dep: '09:30', arr: '12:20', min: 130 },
  'HO1611': { from: 'PVG', to: 'ICN', dep: '15:00', arr: '17:50', min: 130 },

  // ─── 9C 춘추항공 ───
  '9C8559': { from: 'PVG', to: 'ICN', dep: '10:00', arr: '12:50', min: 130 },
  '9C8579': { from: 'SHA', to: 'ICN', dep: '08:00', arr: '10:40', min: 120 },

  // ─── 7C 제주항공 ───
  '7C8501': { from: 'PVG', to: 'ICN', dep: '12:00', arr: '14:50', min: 130 },
  '7C8601': { from: 'PEK', to: 'ICN', dep: '13:00', arr: '16:00', min: 130 },
  '7C8401': { from: 'DLC', to: 'ICN', dep: '14:00', arr: '15:50', min: 90 },

  // ─── TW 티웨이 ───
  'TW671': { from: 'PVG', to: 'ICN', dep: '11:00', arr: '13:50', min: 130 },
  'TW681': { from: 'TAO', to: 'ICN', dep: '12:00', arr: '14:00', min: 100 },

  // ─── LJ 진에어 ───
  'LJ201': { from: 'PVG', to: 'ICN', dep: '13:30', arr: '16:20', min: 130 },
  'LJ151': { from: 'PEK', to: 'ICN', dep: '10:00', arr: '13:00', min: 130 },

  // ─── BX 에어부산 ───
  'BX361': { from: 'PVG', to: 'ICN', dep: '14:00', arr: '16:50', min: 130 },
}

export const AIRPORTS = {
  ICN: { city: { ko: '인천', zh: '仁川', en: 'Incheon' }, country: 'KR' },
  GMP: { city: { ko: '김포', zh: '金浦', en: 'Gimpo' }, country: 'KR' },
  PVG: { city: { ko: '상하이 푸동', zh: '上海浦东', en: 'Shanghai PVG' }, country: 'CN' },
  SHA: { city: { ko: '상하이 홍차오', zh: '上海虹桥', en: 'Shanghai SHA' }, country: 'CN' },
  PEK: { city: { ko: '베이징', zh: '北京首都', en: 'Beijing PEK' }, country: 'CN' },
  PKX: { city: { ko: '베이징 다싱', zh: '北京大兴', en: 'Beijing PKX' }, country: 'CN' },
  CAN: { city: { ko: '광저우', zh: '广州', en: 'Guangzhou' }, country: 'CN' },
  CTU: { city: { ko: '청두', zh: '成都', en: 'Chengdu' }, country: 'CN' },
  SZX: { city: { ko: '선전', zh: '深圳', en: 'Shenzhen' }, country: 'CN' },
  HGH: { city: { ko: '항저우', zh: '杭州', en: 'Hangzhou' }, country: 'CN' },
  NKG: { city: { ko: '난징', zh: '南京', en: 'Nanjing' }, country: 'CN' },
  CKG: { city: { ko: '충칭', zh: '重庆', en: 'Chongqing' }, country: 'CN' },
  WUH: { city: { ko: '우한', zh: '武汉', en: 'Wuhan' }, country: 'CN' },
  XIY: { city: { ko: '시안', zh: '西安', en: "Xi'an" }, country: 'CN' },
  TSN: { city: { ko: '톈진', zh: '天津', en: 'Tianjin' }, country: 'CN' },
  DLC: { city: { ko: '다롄', zh: '大连', en: 'Dalian' }, country: 'CN' },
  TAO: { city: { ko: '칭다오', zh: '青岛', en: 'Qingdao' }, country: 'CN' },
  SHE: { city: { ko: '선양', zh: '沈阳', en: 'Shenyang' }, country: 'CN' },
  HRB: { city: { ko: '하얼빈', zh: '哈尔滨', en: 'Harbin' }, country: 'CN' },
}

export const AIRLINES = {
  OZ: { name: 'Asiana', cn: '韩亚航空' },
  KE: { name: 'Korean Air', cn: '大韩航空' },
  CA: { name: 'Air China', cn: '国航' },
  MU: { name: 'China Eastern', cn: '东航' },
  CZ: { name: 'China Southern', cn: '南航' },
  ZH: { name: 'Shenzhen Air', cn: '深航' },
  HO: { name: 'Juneyao', cn: '吉祥' },
  '9C': { name: 'Spring', cn: '春秋' },
  '7C': { name: 'Jeju Air', cn: '济州' },
  TW: { name: "T'way", cn: '德威' },
  LJ: { name: 'Jin Air', cn: '真航' },
  BX: { name: 'Air Busan', cn: '釜山' },
}

/**
 * 항공편 번호로 스케줄 조회
 * @returns { from, to, dep, arr, min, airline } | null
 */
export function lookupFlight(flightNum) {
  if (!flightNum) return null
  const key = flightNum.toUpperCase().replace(/\s/g, '')
  const data = FLIGHT_DB[key]
  if (!data) return null
  const code = key.match(/^([A-Z0-9]{2})/)?.[1]
  return { ...data, airline: code, airlineName: AIRLINES[code] || null }
}
