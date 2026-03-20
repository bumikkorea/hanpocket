// NEAR 앱 코스 시드 데이터
// type ENUM: city_tour | kpop | walking | custom
// POI ID 기준: poiData.js v2 (2026-03-19 갱신)

export const COURSE_DATA = [
  // 코스 1: 성수동 팝업 핵심 루트 (약 3시간)
  // 프릳츠 카페 → 옴니피플 → 갤럭시마켓 → 러쉬씨어터 → ZUTOMAYO
  {
    id: 'course-seongsu',
    title_zh: '圣水洞快闪精华路线',
    title_ko: '성수동 팝업 핵심 코스',
    description_zh: '圣水洞5大人气快闪店一网打尽，约3小时',
    type: 'walking',
    poi_ids: ['poi-019', 'poi-009', 'poi-003', 'poi-013', 'poi-006'],
    estimated_hours: 3.0,
  },

  // 코스 2: 한남동 브랜드 투어 (약 2시간)
  // 젠틀몬스터 Circuit → andersson bell → HYBE Insight
  {
    id: 'course-hannam',
    title_zh: '汉南洞品牌探索路线',
    title_ko: '한남동 브랜드 투어',
    description_zh: '汉南洞设计师品牌与K-POP体验，约2小时',
    type: 'walking',
    poi_ids: ['poi-016', 'poi-020', 'poi-023'],
    estimated_hours: 2.0,
  },
]
