// 서울 지하철 역 데이터 + 경로 빌더
// Station 스키마: name_zh, name_ko, name_en, line, color

export const LINE_COLORS = {
  1: '#0052A4',
  2: '#009B3E',
  3: '#EF7C1C',
  4: '#00A5DE',
  5: '#996CAC',
  6: '#CD7C2F',
  7: '#747F00',
  8: '#E6186C',
  9: '#BDB092',
}

// 역 생성 헬퍼
const st = (name_zh, name_ko, name_en, line) => ({
  name_zh, name_ko, name_en, line, color: LINE_COLORS[line],
})

// 서울 기본 택시 요금 계산 (중형)
// 기본 ₩4,800 (1.6km) + ₩100/131m 초과
export function calcTaxiFare(distanceMeters) {
  const base = 4800
  const extraDist = Math.max(0, distanceMeters - 1600)
  const extraFare = Math.floor(extraDist / 131) * 100
  return Math.ceil((base + extraFare) / 500) * 500
}

// POI 좌표 기반 권역 판별 → 적합한 지하철 경로 반환
export function buildTransitRoute(poi) {
  const lat = poi.lat ?? 37.5446
  const lng = poi.lng ?? 127.056

  // 성수 / 왕십리 권역 (lng > 127.04)
  if (lng > 127.04) {
    return {
      transit_min: 19,
      steps: [
        { type: 'depart',  walk_min: 4 },
        { type: 'station', ...st('教大站',    '교대역',    'Gyodae',  2) },
        { type: 'ride',    line: 2, color: LINE_COLORS[2], stops: 6, min: 15 },
        { type: 'station', ...st('圣水站',    '성수역',    'Seongsu', 2) },
        { type: 'arrive',  walk_min: 3 },
      ],
    }
  }

  // 홍대 / 합정 권역 (lng < 126.93)
  if (lng < 126.93) {
    return {
      transit_min: 24,
      steps: [
        { type: 'depart',  walk_min: 4 },
        { type: 'station', ...st('教大站',      '교대역',      'Gyodae',       2) },
        { type: 'ride',    line: 2, color: LINE_COLORS[2], stops: 9, min: 20 },
        { type: 'station', ...st('弘大入口站',  '홍대입구역',  'Hongik Univ.', 2) },
        { type: 'arrive',  walk_min: 4 },
      ],
    }
  }

  // 이태원 / 한남 권역 (lat < 37.545)
  if (lat < 37.545) {
    return {
      transit_min: 28,
      steps: [
        { type: 'depart',  walk_min: 5 },
        { type: 'station', ...st('江南站',   '강남역',  'Gangnam',  2) },
        { type: 'ride',    line: 2, color: LINE_COLORS[2], stops: 3, min: 8 },
        { type: 'station', ...st('教大站',   '교대역',  'Gyodae',   2), transfer_to: 3 },
        { type: 'ride',    line: 3, color: LINE_COLORS[3], stops: 3, min: 8 },
        { type: 'station', ...st('药水站',   '약수역',  'Yaksu',    3), transfer_to: 6 },
        { type: 'ride',    line: 6, color: LINE_COLORS[6], stops: 2, min: 5 },
        { type: 'station', ...st('梨泰院站', '이태원역', 'Itaewon', 6) },
        { type: 'arrive',  walk_min: 5 },
      ],
    }
  }

  // 명동 / 중구 권역 (lat > 37.555, lng 126.93~126.995)
  if (lat > 37.555 && lng < 126.995) {
    return {
      transit_min: 32,
      steps: [
        { type: 'depart',  walk_min: 5 },
        { type: 'station', ...st('江南站',   '강남역',  'Gangnam',   2) },
        { type: 'ride',    line: 2, color: LINE_COLORS[2], stops: 3, min: 8 },
        { type: 'station', ...st('教大站',   '교대역',  'Gyodae',    2), transfer_to: 3 },
        { type: 'ride',    line: 3, color: LINE_COLORS[3], stops: 4, min: 10 },
        { type: 'station', ...st('忠武路站', '충무로역', 'Chungmuro', 3), transfer_to: 4 },
        { type: 'ride',    line: 4, color: LINE_COLORS[4], stops: 1, min: 3 },
        { type: 'station', ...st('明洞站',   '명동역',  'Myeongdong', 4) },
        { type: 'arrive',  walk_min: 3 },
      ],
    }
  }

  // 기본 경로 (강남 → 왕십리)
  return {
    transit_min: 22,
    steps: [
      { type: 'depart',  walk_min: 4 },
      { type: 'station', ...st('江南站',   '강남역',  'Gangnam',   2) },
      { type: 'ride',    line: 2, color: LINE_COLORS[2], stops: 5, min: 13 },
      { type: 'station', ...st('王十里站', '왕십리역', 'Wangsimni', 2) },
      { type: 'arrive',  walk_min: 5 },
    ],
  }
}
