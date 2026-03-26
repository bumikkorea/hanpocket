/**
 * 주요 한국행 항공 노선 데이터
 * 항공편 번호 앞 2자리(항공사 코드)로 매칭
 */

export const AIRLINES = {
  OZ: { name: 'Asiana Airlines', cn: '韩亚航空' },
  KE: { name: 'Korean Air', cn: '大韩航空' },
  CA: { name: 'Air China', cn: '中国国际航空' },
  MU: { name: 'China Eastern', cn: '东方航空' },
  CZ: { name: 'China Southern', cn: '南方航空' },
  ZH: { name: 'Shenzhen Airlines', cn: '深圳航空' },
  SC: { name: 'Shandong Airlines', cn: '山东航空' },
  HO: { name: 'Juneyao Airlines', cn: '吉祥航空' },
  '9C': { name: 'Spring Airlines', cn: '春秋航空' },
  '7C': { name: 'Jeju Air', cn: '济州航空' },
  TW: { name: "T'way Air", cn: '德威航空' },
  LJ: { name: 'Jin Air', cn: '真航空' },
  BX: { name: 'Air Busan', cn: '釜山航空' },
  RS: { name: 'Air Seoul', cn: '首尔航空' },
  ZE: { name: 'Eastar Jet', cn: '易斯达航空' },
}

export const AIRPORTS = {
  ICN: { city: { ko: '인천', zh: '仁川', en: 'Incheon' }, country: 'KR' },
  GMP: { city: { ko: '김포', zh: '金浦', en: 'Gimpo' }, country: 'KR' },
  PVG: { city: { ko: '상하이 푸동', zh: '上海浦东', en: 'Shanghai Pudong' }, country: 'CN' },
  SHA: { city: { ko: '상하이 홍차오', zh: '上海虹桥', en: 'Shanghai Hongqiao' }, country: 'CN' },
  PEK: { city: { ko: '베이징 수도', zh: '北京首都', en: 'Beijing Capital' }, country: 'CN' },
  PKX: { city: { ko: '베이징 다싱', zh: '北京大兴', en: 'Beijing Daxing' }, country: 'CN' },
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
  NRT: { city: { ko: '나리타', zh: '成田', en: 'Narita' }, country: 'JP' },
  KIX: { city: { ko: '간사이', zh: '关西', en: 'Kansai' }, country: 'JP' },
}

// 주요 노선 비행시간 (분)
export const FLIGHT_TIMES = {
  'PVG-ICN': 120, 'SHA-ICN': 120, 'PEK-ICN': 130, 'PKX-ICN': 130,
  'CAN-ICN': 210, 'CTU-ICN': 240, 'SZX-ICN': 210, 'HGH-ICN': 130,
  'NKG-ICN': 130, 'CKG-ICN': 230, 'WUH-ICN': 170, 'XIY-ICN': 200,
  'TSN-ICN': 120, 'DLC-ICN': 90, 'TAO-ICN': 100, 'SHE-ICN': 130,
  'HRB-ICN': 170, 'NRT-ICN': 150, 'KIX-ICN': 120,
}

/**
 * 항공편 번호에서 항공사 코드 추출
 */
export function getAirlineCode(flightNum) {
  if (!flightNum) return null
  const match = flightNum.match(/^([A-Z0-9]{2})/i)
  return match ? match[1].toUpperCase() : null
}

export function getAirlineName(code, lang) {
  const airline = AIRLINES[code]
  if (!airline) return code
  if (lang === 'zh') return airline.cn
  return airline.name
}
