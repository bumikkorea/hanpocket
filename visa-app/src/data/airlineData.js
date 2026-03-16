// 항공사 데이터 — 인천공항 기준 라운지/프로모션/기종 정보
// 항공사 코드(IATA 2자리) → 정보

export const AIRLINES = {
  KE: {
    name: { ko: '대한항공', zh: '大韩航空', en: 'Korean Air' },
    alliance: 'SkyTeam',
    color: '#00256C',
    logo: 'https://www.koreanair.com/favicon.ico',
    lounges: [
      { terminal: 'T2', name: 'KAL Prestige Lounge', floor: '4F', area: 'Gate 249', hours: '06:00-22:00', access: { ko: '프레스티지석 이상, 모닝캄 프리미엄 이상', zh: 'Prestige以上舱位、Morning Calm Premium以上', en: 'Prestige+ class, Morning Calm Premium+' } },
      { terminal: 'T2', name: 'KAL Lounge', floor: '3F', area: 'Gate 253', hours: '06:00-22:00', access: { ko: '모닝캄 회원, 스카이팀 엘리트+', zh: 'Morning Calm会员、天合联盟Elite+', en: 'Morning Calm member, SkyTeam Elite+' } },
    ],
    promos: [
      { title: { ko: '마일리지 2배 적립', zh: '里程双倍积累', en: 'Double Miles' }, detail: { ko: '2026년 3월 프레스티지석 한중노선', zh: '2026年3月 Prestige舱 中韩航线', en: 'Mar 2026 Prestige class KR-CN routes' }, badge: 'HOT' },
      { title: { ko: '기내면세 10% 할인', zh: '机内免税 10%折扣', en: '10% Off In-flight Duty Free' }, detail: { ko: 'SKYPASS 회원 한정', zh: 'SKYPASS会员限定', en: 'SKYPASS members only' } },
    ],
  },
  OZ: {
    name: { ko: '아시아나항공', zh: '韩亚航空', en: 'Asiana Airlines' },
    alliance: 'Star Alliance',
    color: '#C8102E',
    logo: 'https://www.flyasiana.com/favicon.ico',
    lounges: [
      { terminal: 'T1', name: 'Asiana Lounge', floor: '4F', area: 'Gate 28', hours: '06:30-21:30', access: { ko: '비즈니스석 이상, 스타얼라이언스 골드', zh: '商务舱以上、星空联盟金卡', en: 'Business+ class, Star Alliance Gold' } },
      { terminal: 'T1', name: 'Asiana First Lounge', floor: '4F', area: 'Gate 11', hours: '07:00-21:00', access: { ko: '퍼스트클래스, 다이아몬드 회원', zh: '头等舱、钻石会员', en: 'First class, Diamond members' } },
    ],
    promos: [
      { title: { ko: '조기 예매 할인', zh: '提前预订折扣', en: 'Early Bird Discount' }, detail: { ko: '출발 60일 전 예매 시 최대 15% 할인', zh: '出发前60天预订最高15%折扣', en: 'Up to 15% off when booked 60+ days ahead' } },
    ],
  },
  CA: {
    name: { ko: '중국국제항공', zh: '中国国际航空', en: 'Air China' },
    alliance: 'Star Alliance',
    color: '#CC0000',
    logo: 'https://www.airchina.com.cn/favicon.ico',
    lounges: [
      { terminal: 'T1', name: 'Star Alliance Lounge (공용)', floor: '4F', area: 'Gate 11', hours: '06:30-21:30', access: { ko: '비즈니스석 이상, 스타얼라이언스 골드', zh: '商务舱以上、星空联盟金卡', en: 'Business+ class, Star Alliance Gold' } },
    ],
    promos: [
      { title: { ko: '한중노선 특가', zh: '中韩航线特价', en: 'KR-CN Route Special' }, detail: { ko: '베이징/상하이 왕복 특가 운영 중', zh: '北京/上海往返特价中', en: 'Beijing/Shanghai round-trip specials' } },
    ],
  },
  MU: {
    name: { ko: '중국동방항공', zh: '中国东方航空', en: 'China Eastern' },
    alliance: 'SkyTeam',
    color: '#003087',
    logo: 'https://www.ceair.com/favicon.ico',
    lounges: [
      { terminal: 'T2', name: 'SkyTeam Lounge', floor: '4F', area: 'Gate 248', hours: '06:00-22:00', access: { ko: '비즈니스석 이상, 스카이팀 엘리트+', zh: '商务舱以上、天合联盟Elite+', en: 'Business+ class, SkyTeam Elite+' } },
    ],
    promos: [
      { title: { ko: '위안화 결제 추가 할인', zh: '人民币支付额外优惠', en: 'CNY Payment Discount' }, detail: { ko: 'WeChat Pay 결제 시 5% 추가 할인', zh: '微信支付额外5%折扣', en: '5% extra off with WeChat Pay' } },
    ],
  },
  CZ: {
    name: { ko: '중국남방항공', zh: '中国南方航空', en: 'China Southern' },
    alliance: 'SkyTeam',
    color: '#003DA5',
    logo: 'https://www.csair.com/favicon.ico',
    lounges: [
      { terminal: 'T2', name: 'SkyTeam Lounge', floor: '4F', area: 'Gate 248', hours: '06:00-22:00', access: { ko: '비즈니스석 이상, 스카이팀 엘리트+', zh: '商务舱以上、天合联盟Elite+', en: 'Business+ class, SkyTeam Elite+' } },
    ],
    promos: [],
  },
  ZH: {
    name: { ko: '선전항공', zh: '深圳航空', en: 'Shenzhen Airlines' },
    alliance: 'Star Alliance',
    color: '#E60012',
    lounges: [
      { terminal: 'T1', name: 'Star Alliance Lounge (공용)', floor: '4F', area: 'Gate 11', hours: '06:30-21:30', access: { ko: '비즈니스석 이상', zh: '商务舱以上', en: 'Business+ class' } },
    ],
    promos: [],
  },
  SC: {
    name: { ko: '산동항공', zh: '山东航空', en: 'Shandong Airlines' },
    alliance: null,
    color: '#FF6600',
    lounges: [],
    promos: [],
  },
  TW: {
    name: { ko: '티웨이항공', zh: '德威航空', en: "T'way Air" },
    alliance: null,
    color: '#FF0000',
    lounges: [],
    promos: [
      { title: { ko: '위탁수하물 추가 할인', zh: '托运行李优惠', en: 'Checked Bag Discount' }, detail: { ko: '사전 구매 시 40% 할인', zh: '提前购买40%折扣', en: '40% off when pre-purchased' } },
    ],
  },
  '7C': {
    name: { ko: '제주항공', zh: '济州航空', en: 'Jeju Air' },
    alliance: null,
    color: '#FF6F00',
    lounges: [],
    promos: [
      { title: { ko: 'FLY BAG 프로모션', zh: 'FLY BAG促销', en: 'FLY BAG Promo' }, detail: { ko: '수하물+좌석+기내식 패키지 할인', zh: '行李+选座+机餐套餐折扣', en: 'Luggage+seat+meal package deal' } },
    ],
  },
  LJ: {
    name: { ko: '진에어', zh: '真航空', en: 'Jin Air' },
    alliance: null,
    color: '#0071CE',
    lounges: [],
    promos: [
      { title: { ko: '한중 특가 세일', zh: '中韩特价促销', en: 'KR-CN Flash Sale' }, detail: { ko: '편도 10만원대 한정석', zh: '单程10万韩元起 限量', en: 'One-way from KRW 100K, limited' } },
    ],
  },
  BX: {
    name: { ko: '에어부산', zh: '釜山航空', en: 'Air Busan' },
    alliance: null,
    color: '#F15A24',
    lounges: [],
    promos: [],
  },
  RS: {
    name: { ko: '에어서울', zh: '首尔航空', en: 'Air Seoul' },
    alliance: null,
    color: '#F26522',
    lounges: [],
    promos: [],
  },
  // 일본 항공사
  NH: {
    name: { ko: 'ANA (전일본공수)', zh: '全日空', en: 'ANA' },
    alliance: 'Star Alliance',
    color: '#00337C',
    lounges: [
      { terminal: 'T1', name: 'Star Alliance Lounge', floor: '4F', area: 'Gate 11', hours: '06:30-21:30', access: { ko: '비즈니스석 이상, 스타얼라이언스 골드', zh: '商务舱以上、星空联盟金卡', en: 'Business+ class, Star Alliance Gold' } },
    ],
    promos: [],
  },
  JL: {
    name: { ko: '일본항공', zh: '日本航空', en: 'Japan Airlines' },
    alliance: 'oneworld',
    color: '#CC0000',
    lounges: [
      { terminal: 'T1', name: 'oneworld Lounge', floor: '4F', area: 'Gate 29', hours: '07:00-21:00', access: { ko: '비즈니스석 이상, 원월드 사파이어+', zh: '商务舱以上、寰宇一家蓝宝石+', en: 'Business+ class, oneworld Sapphire+' } },
    ],
    promos: [],
  },
  // 동남아
  SQ: {
    name: { ko: '싱가포르항공', zh: '新加坡航空', en: 'Singapore Airlines' },
    alliance: 'Star Alliance',
    color: '#0C2340',
    lounges: [
      { terminal: 'T1', name: 'SilverKris Lounge', floor: '4F', area: 'Gate 12', hours: '07:00-21:00', access: { ko: '비즈니스석 이상, 스타얼라이언스 골드', zh: '商务舱以上、星空联盟金卡', en: 'Business+ class, Star Alliance Gold' } },
    ],
    promos: [],
  },
}

// 편명에서 항공사 코드 추출 (예: "KE831" → "KE", "7C123" → "7C")
export function parseFlightNumber(input) {
  const s = input.trim().toUpperCase().replace(/\s+/g, '')
  // 2자리 숫자+영문 코드 (7C, 9C 등)
  const m2 = s.match(/^(\d[A-Z])\s*(\d+)$/)
  if (m2) return { airline: m2[1], number: m2[2], full: `${m2[1]}${m2[2]}` }
  // 2자리 영문 코드 (KE, OZ 등)
  const m1 = s.match(/^([A-Z]{2})\s*(\d+)$/)
  if (m1) return { airline: m1[1], number: m1[2], full: `${m1[1]}${m1[2]}` }
  return null
}

// 인천공항 터미널 판별 (주요 항공사)
export function getTerminal(airlineCode) {
  const T2 = ['KE', 'KL', 'AF', 'DL', 'MU', 'CZ', 'XN', 'GA', 'AM', 'SV', 'ME']
  return T2.includes(airlineCode) ? 'T2' : 'T1'
}

// 공용 라운지 (항공사 전용 라운지가 없을 때)
export const COMMON_LOUNGES = {
  T1: [
    { name: 'SkyHub Lounge', floor: '4F', area: 'Gate 11', hours: '06:30-21:30', access: { ko: '유료 (약 4만원) / PP카드', zh: '付费 (约4万韩元) / PP卡', en: 'Paid (~40K KRW) / Priority Pass' } },
    { name: 'Matina Lounge', floor: '4F', area: 'Gate 42', hours: '06:00-22:00', access: { ko: '유료 (약 3.5만원) / PP카드 / 제휴 카드', zh: '付费 (约3.5万韩元) / PP卡 / 合作信用卡', en: 'Paid (~35K KRW) / PP / Partner cards' } },
  ],
  T2: [
    { name: 'SkyTeam Lounge', floor: '4F', area: 'Gate 248', hours: '06:00-22:00', access: { ko: '유료 / 스카이팀 엘리트+', zh: '付费 / 天合联盟Elite+', en: 'Paid / SkyTeam Elite+' } },
    { name: 'Matina Lounge', floor: '3F', area: 'Gate 252', hours: '06:00-22:00', access: { ko: '유료 (약 3.5만원) / PP카드', zh: '付费 (约3.5万韩元) / PP卡', en: 'Paid (~35K KRW) / Priority Pass' } },
  ],
}
