/**
 * 인천공항 취항 항공사 다국어 매핑 테이블
 * IATA 코드 기준 → { ko, zh, en }
 */

export const AIRLINE_MAP = {
  // ─── 한국 국적사 (FSC) ───
  KE: { ko: '대한항공', zh: '大韩航空', en: 'Korean Air' },
  OZ: { ko: '아시아나항공', zh: '韩亚航空', en: 'Asiana Airlines' },
  YP: { ko: '에어프레미아', zh: '空中首尔航空', en: 'Air Premia' },
  // ─── 한국 국적사 (LCC) ───
  '7C': { ko: '제주항공', zh: '济州航空', en: 'Jeju Air' },
  TW: { ko: '티웨이항공', zh: '德威航空', en: "T'way Air" },
  LJ: { ko: '진에어', zh: '真航空', en: 'Jin Air' },
  BX: { ko: '에어부산', zh: '釜山航空', en: 'Air Busan' },
  RS: { ko: '에어서울', zh: '首尔航空', en: 'Air Seoul' },
  ZE: { ko: '이스타항공', zh: '易斯达航空', en: 'Eastar Jet' },
  RF: { ko: '에어로케이', zh: '爱尔航空', en: 'Aero K' },
  '4V': { ko: '플라이강원', zh: '江原航空', en: 'Fly Gangwon' },
  VZ: { ko: '에어제타', zh: '泽塔航空', en: 'Air Z' },
  // ─── 중국 항공사 ───
  CA: { ko: '중국국제항공', zh: '中国国际航空', en: 'Air China' },
  CZ: { ko: '중국남방항공', zh: '中国南方航空', en: 'China Southern' },
  MU: { ko: '중국동방항공', zh: '中国东方航空', en: 'China Eastern' },
  HU: { ko: '하이난항공', zh: '海南航空', en: 'Hainan Airlines' },
  SC: { ko: '산동항공', zh: '山东航空', en: 'Shandong Airlines' },
  ZH: { ko: '선전항공', zh: '深圳航空', en: 'Shenzhen Airlines' },
  '3U': { ko: '쓰촨항공', zh: '四川航空', en: 'Sichuan Airlines' },
  MF: { ko: '샤먼항공', zh: '厦门航空', en: 'Xiamen Airlines' },
  '9C': { ko: '춘추항공', zh: '春秋航空', en: 'Spring Airlines' },
  HO: { ko: '길상항공', zh: '吉祥航空', en: 'Juneyao Airlines' },
  FM: { ko: '상하이항공', zh: '上海航空', en: 'Shanghai Airlines' },
  GS: { ko: '톈진항공', zh: '天津航空', en: 'Tianjin Airlines' },
  EU: { ko: '청두항공', zh: '成都航空', en: 'Chengdu Airlines' },
  QW: { ko: '칭다오항공', zh: '青岛航空', en: 'Qingdao Airlines' },
  KN: { ko: '중국연합항공', zh: '中国联合航空', en: 'China United Airlines' },
  PN: { ko: '웨스트에어', zh: '西部航空', en: 'West Air' },
  DZ: { ko: '둥하이항공', zh: '东海航空', en: 'Donghai Airlines' },
  '8L': { ko: '럭키에어', zh: '祥鹏航空', en: 'Lucky Air' },
  TV: { ko: '티벳항공', zh: '西藏航空', en: 'Tibet Airlines' },
  NS: { ko: '허베이항공', zh: '河北航空', en: 'Hebei Airlines' },
  JD: { ko: '수도항공', zh: '首都航空', en: 'Capital Airlines' },
  // ─── 홍콩 / 마카오 / 대만 ───
  CX: { ko: '캐세이퍼시픽', zh: '国泰航空', en: 'Cathay Pacific' },
  HX: { ko: '홍콩항공', zh: '香港航空', en: 'Hong Kong Airlines' },
  UO: { ko: '홍콩익스프레스', zh: '香港快运航空', en: 'HK Express' },
  NX: { ko: '에어마카오', zh: '澳门航空', en: 'Air Macau' },
  CI: { ko: '중화항공', zh: '中华航空', en: 'China Airlines' },
  BR: { ko: '에바항공', zh: '长荣航空', en: 'EVA Air' },
  IT: { ko: '타이거에어 타이완', zh: '台湾虎航', en: 'Tigerair Taiwan' },
  BV: { ko: '스타럭스항공', zh: '星宇航空', en: 'Starlux Airlines' },
  // ─── 일본 항공사 ───
  NH: { ko: '전일본공수', zh: '全日空', en: 'ANA' },
  JL: { ko: '일본항공', zh: '日本航空', en: 'Japan Airlines' },
  MM: { ko: '피치항공', zh: '乐桃航空', en: 'Peach Aviation' },
  GK: { ko: '젯스타재팬', zh: '捷星日本', en: 'Jetstar Japan' },
  BC: { ko: '스카이마크', zh: '天马航空', en: 'Skymark Airlines' },
  TZ: { ko: '집에어', zh: 'ZIPAIR', en: 'ZIPAIR' },
  NQ: { ko: '에어재팬', zh: '日本新航空', en: 'AirJapan' },
  IJ: { ko: '스프링재팬', zh: '春秋航空日本', en: 'Spring Japan' },
  // ─── 동남아 항공사 ───
  SQ: { ko: '싱가포르항공', zh: '新加坡航空', en: 'Singapore Airlines' },
  TR: { ko: '스쿳', zh: '酷航', en: 'Scoot' },
  TG: { ko: '타이항공', zh: '泰国航空', en: 'Thai Airways' },
  FD: { ko: '타이에어아시아', zh: '泰国亚航', en: 'Thai AirAsia' },
  XJ: { ko: '타이에어아시아X', zh: '泰国亚航X', en: 'Thai AirAsia X' },
  VN: { ko: '베트남항공', zh: '越南航空', en: 'Vietnam Airlines' },
  VJ: { ko: '비엣젯', zh: '越捷航空', en: 'VietJet Air' },
  BL: { ko: '퍼시픽항공', zh: '太平洋航空', en: 'Pacific Airlines' },
  PR: { ko: '필리핀항공', zh: '菲律宾航空', en: 'Philippine Airlines' },
  Z2: { ko: '세부퍼시픽', zh: '宿务太平洋航空', en: 'Cebu Pacific' },
  GA: { ko: '가루다인도네시아', zh: '印尼鹰航', en: 'Garuda Indonesia' },
  QZ: { ko: '에어아시아인도네시아', zh: '印尼亚航', en: 'AirAsia Indonesia' },
  AK: { ko: '에어아시아', zh: '亚洲航空', en: 'AirAsia' },
  MH: { ko: '말레이시아항공', zh: '马来西亚航空', en: 'Malaysia Airlines' },
  BI: { ko: '로얄브루나이', zh: '文莱皇家航空', en: 'Royal Brunei' },
  UL: { ko: '스리랑카항공', zh: '斯里兰卡航空', en: 'SriLankan Airlines' },
  PG: { ko: '방콕에어웨이즈', zh: '曼谷航空', en: 'Bangkok Airways' },
  // ─── 중앙아시아 / 중동 / 인도 ───
  EK: { ko: '에미레이트항공', zh: '阿联酋航空', en: 'Emirates' },
  QR: { ko: '카타르항공', zh: '卡塔尔航空', en: 'Qatar Airways' },
  EY: { ko: '에티하드항공', zh: '阿提哈德航空', en: 'Etihad Airways' },
  TK: { ko: '터키항공', zh: '土耳其航空', en: 'Turkish Airlines' },
  SV: { ko: '사우디아항공', zh: '沙特航空', en: 'Saudia' },
  AI: { ko: '에어인디아', zh: '印度航空', en: 'Air India' },
  HY: { ko: '우즈베키스탄항공', zh: '乌兹别克斯坦航空', en: 'Uzbekistan Airways' },
  KC: { ko: '에어아스타나', zh: '阿斯塔纳航空', en: 'Air Astana' },
  OM: { ko: '몽골항공', zh: '蒙古航空', en: 'MIAT Mongolian' },
  // ─── 미주 ───
  DL: { ko: '델타항공', zh: '达美航空', en: 'Delta' },
  UA: { ko: '유나이티드항공', zh: '美联航', en: 'United Airlines' },
  AA: { ko: '아메리칸항공', zh: '美国航空', en: 'American Airlines' },
  HA: { ko: '하와이안항공', zh: '夏威夷航空', en: 'Hawaiian Airlines' },
  AC: { ko: '에어캐나다', zh: '加拿大航空', en: 'Air Canada' },
  AM: { ko: '아에로멕시코', zh: '墨西哥航空', en: 'Aeromexico' },
  // ─── 유럽 ───
  LH: { ko: '루프트한자', zh: '汉莎航空', en: 'Lufthansa' },
  AF: { ko: '에어프랑스', zh: '法国航空', en: 'Air France' },
  KL: { ko: 'KLM', zh: '荷兰皇家航空', en: 'KLM' },
  BA: { ko: '영국항공', zh: '英国航空', en: 'British Airways' },
  AY: { ko: '핀에어', zh: '芬兰航空', en: 'Finnair' },
  LO: { ko: '폴란드항공', zh: '波兰航空', en: 'LOT Polish' },
  OS: { ko: '오스트리아항공', zh: '奥地利航空', en: 'Austrian Airlines' },
  LX: { ko: '스위스국제항공', zh: '瑞士航空', en: 'Swiss Intl Air' },
  SU: { ko: '아에로플로트', zh: '俄罗斯航空', en: 'Aeroflot' },
  // ─── 오세아니아 ───
  QF: { ko: '콴타스', zh: '澳洲航空', en: 'Qantas' },
  NZ: { ko: '에어뉴질랜드', zh: '新西兰航空', en: 'Air New Zealand' },
  // ─── 아프리카 ───
  ET: { ko: '에티오피아항공', zh: '埃塞俄比亚航空', en: 'Ethiopian Airlines' },
  MS: { ko: '이집트항공', zh: '埃及航空', en: 'EgyptAir' },
}

// 한국어 항공사명 → IATA 역매핑
export const AIRLINE_KO_TO_IATA = Object.fromEntries(
  Object.entries(AIRLINE_MAP).map(([code, v]) => [v.ko, code])
)

/**
 * @param {string} iataCode
 * @param {string} lang - 'ko' | 'zh' | 'en'
 * @returns {string|null} null이면 매핑 없음 → 번역 fallback 필요
 */
export function getAirlineName(iataCode, lang = 'ko') {
  const a = AIRLINE_MAP[iataCode]
  if (a) return a[lang] || a.en || a.ko
  return null
}
