/**
 * 항공기 기종 데이터 + 항공사별 노선 기종 힌트
 * Aircraft type specs + airline route-to-aircraft heuristics
 */

export const AIRCRAFT_TYPES = {
  'B737': {
    name: 'Boeing 737',
    zh: '波音737', ko: '보잉 737',
    seats: '150–189', range: '5,765 km',
    type: { ko: '단거리', zh: '短途', en: 'Short-haul' },
  },
  'B747': {
    name: 'Boeing 747',
    zh: '波音747', ko: '보잉 747',
    seats: '410–524', range: '13,450 km',
    type: { ko: '장거리', zh: '远程', en: 'Long-haul' },
  },
  'B777': {
    name: 'Boeing 777',
    zh: '波音777', ko: '보잉 777',
    seats: '314–396', range: '15,843 km',
    type: { ko: '장거리', zh: '远程', en: 'Long-haul' },
  },
  'B787': {
    name: 'Boeing 787 Dreamliner',
    zh: '波音787梦想客机', ko: '보잉 787 드림라이너',
    seats: '242–330', range: '14,140 km',
    type: { ko: '장거리', zh: '远程', en: 'Long-haul' },
  },
  'A320': {
    name: 'Airbus A320',
    zh: '空客A320', ko: '에어버스 A320',
    seats: '150–186', range: '6,300 km',
    type: { ko: '단거리', zh: '短途', en: 'Short-haul' },
  },
  'A330': {
    name: 'Airbus A330',
    zh: '空客A330', ko: '에어버스 A330',
    seats: '250–440', range: '11,750 km',
    type: { ko: '중거리', zh: '中程', en: 'Medium-haul' },
  },
  'A350': {
    name: 'Airbus A350',
    zh: '空客A350', ko: '에어버스 A350',
    seats: '300–440', range: '15,000 km',
    type: { ko: '장거리', zh: '远程', en: 'Long-haul' },
  },
  'A380': {
    name: 'Airbus A380',
    zh: '空客A380', ko: '에어버스 A380',
    seats: '555–853', range: '15,200 km',
    type: { ko: '장거리(2층)', zh: '远程(双层)', en: 'Long-haul (double-deck)' },
  },
}

// 항공사 코드별 노선 기종 힌트 (short < 3h, medium 3-6h, long > 6h)
export const ROUTE_AIRCRAFT_HINTS = {
  'KE': { long: 'A380 / B777', medium: 'A330 / B787', short: 'B737 / A321' },
  'OZ': { long: 'A380 / A350', medium: 'A330 / B767', short: 'A321 / A320' },
  'LJ': { short: 'B737' },          // 진에어
  'TW': { short: 'B737 / A320' },   // 티웨이항공
  'ZE': { short: 'B737' },          // 이스타항공
  '7C': { short: 'B737' },          // 제주항공
  'BX': { short: 'B737' },          // 에어부산
  'RS': { short: 'A321' },          // 에어서울
  'CA': { long: 'B777 / A330', medium: 'A330', short: 'B737 / A320' },
  'MU': { long: 'B777 / A330', medium: 'A330', short: 'B737 / A320' },
  'CZ': { long: 'B787 / A330', medium: 'A330', short: 'B737' },
  'HU': { long: 'B787', medium: 'A330', short: 'B737' },
  'SC': { medium: 'A330', short: 'B737' },
  'ZH': { medium: 'A330', short: 'B737' },
  '3U': { medium: 'A330', short: 'A320' },
  'FM': { medium: 'B787', short: 'B737' },
  'NH': { long: 'B787 / B777', medium: 'B787', short: 'B737' },
  'JL': { long: 'B787 / B777', medium: 'B787', short: 'B737' },
  'SQ': { long: 'A380 / A350 / B777' },
  'TG': { long: 'A350 / B777' },
  'VN': { medium: 'A350 / A321', short: 'A321' },
}

/**
 * 소요시간 기반 예상 기종 추정
 * @param {string} airlineCode - 항공사 IATA 코드 (예: 'KE')
 * @param {string} elapsetime - 소요시간 문자열 (예: '0230' = 2시간30분)
 * @returns {object|null} { hint: 'A330 / B787', aircraft: AIRCRAFT_TYPES entry, rangeType }
 */
export function guessAircraftType(airlineCode, elapsetime) {
  if (!airlineCode || !elapsetime) return null
  const code = airlineCode.substring(0, 2).toUpperCase()
  const hints = ROUTE_AIRCRAFT_HINTS[code]
  if (!hints) return null

  const hours = parseInt(elapsetime.substring(0, 2)) || 0
  const mins = parseInt(elapsetime.substring(2, 4)) || 0
  const totalHours = hours + mins / 60

  let rangeType, hint
  if (totalHours >= 6) {
    rangeType = 'long'
    hint = hints.long || hints.medium || null
  } else if (totalHours >= 3) {
    rangeType = 'medium'
    hint = hints.medium || hints.long || hints.short || null
  } else {
    rangeType = 'short'
    hint = hints.short || hints.medium || null
  }

  if (!hint) return null

  // 첫 번째 기종 코드에서 AIRCRAFT_TYPES 매칭
  const firstCode = hint.split('/')[0].trim().replace('-', '')
  const aircraft = AIRCRAFT_TYPES[firstCode] || null

  return { hint, aircraft, rangeType }
}
