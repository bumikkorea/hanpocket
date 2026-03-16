/**
 * Visit Seoul API 연동 (api.visitseoul.net)
 * 서울관광재단 공식 관광 표준 콘텐츠
 * - 문화관광 3,725건 / 음식 6,076건 / 쇼핑 1,382건
 * - 체험관광 568건 / 역사관광 563건 / 축제·공연·행사 5,617건
 * - 7개 언어 (한/영/중간체/중번체/일/러/말레이)
 */

const BASE_URL = 'https://api.visitseoul.net/openapi'

// 캐시
const cache = new Map()
const CACHE_TTL = 10 * 60 * 1000 // 10분

function getCached(key) {
  const entry = cache.get(key)
  if (entry && Date.now() - entry.ts < CACHE_TTL) return entry.data
  return null
}
function setCache(key, data) {
  cache.set(key, { data, ts: Date.now() })
}

/**
 * 언어 코드 매핑 (NEAR → Visit Seoul)
 * Visit Seoul: ko, en, zh-CN, zh-TW, ja, ru, ms
 */
function getLangCode(lang) {
  if (lang === 'zh') return 'zh-CN'
  if (lang === 'ko') return 'ko'
  return 'en'
}

/**
 * Visit Seoul API 공통 호출
 */
async function fetchVisitSeoul(endpoint, params = {}) {
  const key = `${endpoint}:${JSON.stringify(params)}`
  const cached = getCached(key)
  if (cached) return cached

  try {
    const url = new URL(`${BASE_URL}/${endpoint}`)
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null) url.searchParams.set(k, v)
    })

    const res = await fetch(url.toString())
    if (!res.ok) throw new Error(`Visit Seoul API error: ${res.status}`)
    const data = await res.json()

    setCache(key, data)
    return data
  } catch (e) {
    console.warn('Visit Seoul API error:', e.message)
    return null
  }
}

// ─── 축제·공연·행사 (오늘의 서울) ────────────────────────
export async function fetchTodayEvents(lang = 'zh', limit = 20) {
  const today = new Date().toISOString().slice(0, 10)
  const data = await fetchVisitSeoul('event', {
    lang: getLangCode(lang),
    start_date: today,
    end_date: today,
    limit,
  })
  return data?.data || data?.items || []
}

// ─── 음식 (6,076건) ────────────────────────
export async function fetchFoodSpots(lang = 'zh', options = {}) {
  const data = await fetchVisitSeoul('food', {
    lang: getLangCode(lang),
    limit: options.limit || 30,
    page: options.page || 1,
    ...(options.area && { area: options.area }),
  })
  return data?.data || data?.items || []
}

// ─── 쇼핑 (1,382건) ────────────────────────
export async function fetchShoppingSpots(lang = 'zh', options = {}) {
  const data = await fetchVisitSeoul('shopping', {
    lang: getLangCode(lang),
    limit: options.limit || 30,
    page: options.page || 1,
  })
  return data?.data || data?.items || []
}

// ─── 문화관광 (3,725건) ────────────────────────
export async function fetchCultureSpots(lang = 'zh', options = {}) {
  const data = await fetchVisitSeoul('culture', {
    lang: getLangCode(lang),
    limit: options.limit || 30,
    page: options.page || 1,
  })
  return data?.data || data?.items || []
}

// ─── 체험관광 (568건) ────────────────────────
export async function fetchExperiences(lang = 'zh', options = {}) {
  const data = await fetchVisitSeoul('experience', {
    lang: getLangCode(lang),
    limit: options.limit || 30,
    page: options.page || 1,
  })
  return data?.data || data?.items || []
}

// ─── 한류체험 프로그램 ────────────────────────
export const HALLYU_EXPERIENCES = [
  {
    id: 'kbeauty-espoir',
    title: { ko: 'espoir K-Beauty 메이크업 클래스', zh: 'espoir K-Beauty化妆课', en: 'espoir K-Beauty Makeup Class' },
    emoji: '💄',
    brand: 'espoir',
    category: 'beauty',
    price: '₩35,000~',
    duration: '90min',
    desc: { ko: '프로 메이크업 아티스트에게 배우는 K-뷰티', zh: '跟专业化妆师学K-Beauty', en: 'Learn K-Beauty from pro makeup artists' },
    bookingUrl: 'https://www.visitseoul.net/hallyu',
  },
  {
    id: 'kbeauty-amore',
    title: { ko: 'AMOREPACIFIC K-Beauty 클래스', zh: 'AMOREPACIFIC K-Beauty课', en: 'AMOREPACIFIC K-Beauty Class' },
    emoji: '✨',
    brand: 'AMOREPACIFIC',
    category: 'beauty',
    price: '₩40,000~',
    duration: '120min',
    desc: { ko: '아모레퍼시픽 본사에서 프리미엄 클래스', zh: '爱茉莉太平洋总部高级课程', en: 'Premium class at AMOREPACIFIC HQ' },
    bookingUrl: 'https://www.visitseoul.net/hallyu',
  },
  {
    id: 'kpop-dance',
    title: { ko: 'SM UNIVERSE K-POP 댄스 클래스', zh: 'SM UNIVERSE K-POP舞蹈课', en: 'SM UNIVERSE K-POP Dance Class' },
    emoji: '💃',
    brand: 'SM Entertainment',
    category: 'kpop',
    price: '₩30,000~',
    duration: '60min',
    desc: { ko: 'SM 아이돌 안무 직접 배우기', zh: '学习SM偶像原创编舞', en: 'Learn choreography from SM idols' },
    bookingUrl: 'https://www.visitseoul.net/hallyu',
  },
  {
    id: 'kfood-cooking',
    title: { ko: 'OKITCHEN K-Food 쿠킹 클래스', zh: 'OKITCHEN K-Food烹饪课', en: 'OKITCHEN K-Food Cooking Class' },
    emoji: '🍳',
    brand: 'OKITCHEN STUDIO',
    category: 'food',
    price: '₩45,000~',
    duration: '120min',
    desc: { ko: '김치, 비빔밥, 불고기 직접 만들기', zh: '亲手制作泡菜、拌饭、烤肉', en: 'Make kimchi, bibimbap, bulgogi' },
    bookingUrl: 'https://www.visitseoul.net/hallyu',
  },
  {
    id: 'kliquor',
    title: { ko: '전통주 갤러리 K-Liquor 클래스', zh: '传统酒画廊 K-Liquor课', en: 'K-Liquor Making Class' },
    emoji: '🍶',
    brand: '전통주갤러리',
    category: 'culture',
    price: '₩30,000~',
    duration: '90min',
    desc: { ko: '한국 전통술 만들기 + 시음', zh: '制作韩国传统酒+品尝', en: 'Make Korean traditional liquor + tasting' },
    bookingUrl: 'https://www.visitseoul.net/hallyu',
  },
  {
    id: 'kimchi-museum',
    title: { ko: '뮤지엄 김치간 K-Kimchi 투어', zh: '泡菜博物馆K-Kimchi之旅', en: 'K-Kimchi Museum Tour' },
    emoji: '🥬',
    brand: 'Museum Kimchikan',
    category: 'food',
    price: '₩5,000~',
    duration: '60min',
    desc: { ko: '김치 역사 + 직접 담그기 체험', zh: '泡菜历史+亲手制作体验', en: 'Kimchi history + hands-on making' },
    bookingUrl: 'https://www.visitseoul.net/hallyu',
  },
  {
    id: 'kcraft',
    title: { ko: '북촌 K-Craft 전통공예 클래스', zh: '北村K-Craft传统工艺课', en: 'Bukchon K-Craft Class' },
    emoji: '🏺',
    brand: '북촌전통공예체험관',
    category: 'culture',
    price: '₩20,000~',
    duration: '90min',
    desc: { ko: '한지공예, 도자기, 매듭 등', zh: '韩纸工艺、陶瓷、结等', en: 'Hanji, pottery, knot crafts' },
    bookingUrl: 'https://www.visitseoul.net/hallyu',
  },
  {
    id: 'kmodel',
    title: { ko: 'K-Esteem K-Model 런웨이 클래스', zh: 'K-Esteem K-Model走秀课', en: 'K-Model Runway Class' },
    emoji: '👠',
    brand: 'K-Esteem',
    category: 'fashion',
    price: '₩50,000~',
    duration: '90min',
    desc: { ko: '프로 모델에게 배우는 워킹 + 포즈', zh: '跟专业模特学走路+摆姿', en: 'Learn walking + posing from pro models' },
    bookingUrl: 'https://www.visitseoul.net/hallyu',
  },
]

// ─── 디스커버서울패스 ────────────────────────
export const DISCOVER_SEOUL_PASS = {
  options: [
    { id: 'pick3-basic', name: { ko: 'Pick 3 베이직', zh: 'Pick 3 基础版', en: 'Pick 3 Basic' }, price: 49000, spots: 3, coupons: 120, duration: '24h' },
    { id: 'pick3-theme', name: { ko: 'Pick 3 테마파크', zh: 'Pick 3 主题乐园版', en: 'Pick 3 Theme Park' }, price: 70000, spots: 3, coupons: 120, duration: '24h', includes: { ko: '롯데월드/에버랜드 포함', zh: '含乐天世界/爱宝乐园', en: 'Includes Lotte World/Everland' } },
    { id: 'all-72', name: { ko: 'All-Inclusive 72시간', zh: 'All-Inclusive 72小时', en: 'All-Inclusive 72h' }, price: 90000, spots: 70, coupons: 0, duration: '72h' },
    { id: 'all-120', name: { ko: 'All-Inclusive 120시간', zh: 'All-Inclusive 120小时', en: 'All-Inclusive 120h' }, price: 130000, spots: 70, coupons: 0, duration: '120h' },
  ],
  includes: [
    { ko: 'AREX 공항철도 (직통)', zh: 'AREX机场快线 (直达)', en: 'AREX Airport Express' },
    { ko: '공항 리무진 버스', zh: '机场大巴', en: 'Airport Limousine Bus' },
    { ko: '시티투어 버스', zh: '观光巴士', en: 'City Tour Bus' },
    { ko: '따릉이 (공공자전거)', zh: '公共自行车', en: 'Public Bike (Ttareungyi)' },
    { ko: '경복궁, 창덕궁 등 고궁', zh: '景福宫、昌德宫等古宫', en: 'Royal Palaces' },
    { ko: 'N서울타워 전망대', zh: 'N首尔塔观景台', en: 'N Seoul Tower Observatory' },
  ],
  purchaseUrl: 'https://www.discoverseoulpass.com',
}

// ─── 한류테마 여행코스 ────────────────────────
export const HALLYU_COURSES = [
  {
    id: 'kbeauty-course',
    title: { ko: 'K-Beauty 코스', zh: 'K-Beauty路线', en: 'K-Beauty Course' },
    emoji: '💄',
    spots: [
      { name: { ko: '올리브영 명동 플래그십', zh: 'Olive Young明洞旗舰店', en: 'Olive Young Myeongdong' }, lat: 37.5636, lng: 126.9862 },
      { name: { ko: '이니스프리 성수 플래그십', zh: 'innisfree圣水旗舰店', en: 'innisfree Seongsu' }, lat: 37.5446, lng: 127.0559 },
      { name: { ko: 'AMOREPACIFIC 본사 체험', zh: 'AMOREPACIFIC总部体验', en: 'AMOREPACIFIC HQ Experience' }, lat: 37.5337, lng: 126.9768 },
    ],
  },
  {
    id: 'kpop-course',
    title: { ko: 'K-POP 성지 코스', zh: 'K-POP圣地路线', en: 'K-POP Holy Land Course' },
    emoji: '🎤',
    spots: [
      { name: { ko: 'SM TOWN 코엑스아티움', zh: 'SM TOWN COEX Artium', en: 'SM TOWN COEX Artium' }, lat: 37.5116, lng: 127.0592 },
      { name: { ko: 'HYBE INSIGHT', zh: 'HYBE INSIGHT', en: 'HYBE INSIGHT' }, lat: 37.5244, lng: 126.9253 },
      { name: { ko: 'JYP Entertainment', zh: 'JYP Entertainment', en: 'JYP Entertainment' }, lat: 37.5218, lng: 127.0405 },
      { name: { ko: '청담동 K-Star Road', zh: '清潭洞K-Star Road', en: 'Cheongdam K-Star Road' }, lat: 37.5199, lng: 127.0476 },
    ],
  },
  {
    id: 'kdrama-course',
    title: { ko: 'K-Drama 촬영지 코스', zh: 'K-Drama拍摄地路线', en: 'K-Drama Filming Locations' },
    emoji: '🎬',
    spots: [
      { name: { ko: '북촌한옥마을 (도깨비)', zh: '北村韩屋村 (鬼怪)', en: 'Bukchon (Goblin)' }, lat: 37.5826, lng: 126.9831 },
      { name: { ko: '경복궁 (뱀파이어 나귀)', zh: '景福宫 (吸血鬼)', en: 'Gyeongbokgung' }, lat: 37.5796, lng: 126.9770 },
      { name: { ko: '남산타워 (별에서 온 그대)', zh: '南山塔 (来自星星的你)', en: 'Namsan Tower (My Love from Star)' }, lat: 37.5512, lng: 126.9882 },
    ],
  },
  {
    id: 'bukchon-course',
    title: { ko: '북촌 로컬 체험 코스', zh: '北村本地体验路线', en: 'Bukchon Local Experience' },
    emoji: '🏘️',
    spots: [
      { name: { ko: '한복 대여 + 스냅사진', zh: '韩服租赁+拍照', en: 'Hanbok Rental + Photos' }, lat: 37.5823, lng: 126.9850 },
      { name: { ko: '전통공예 체험', zh: '传统工艺体验', en: 'Traditional Craft' }, lat: 37.5830, lng: 126.9835 },
      { name: { ko: '북촌 미식 나들이', zh: '北村美食之旅', en: 'Bukchon Food Tour' }, lat: 37.5818, lng: 126.9848 },
    ],
  },
]

// ─── 도심 등산 코스 ────────────────────────
export const HIKING_COURSES = [
  {
    id: 'inwangsan',
    title: { ko: '인왕산 성곽길', zh: '仁王山城墙路', en: 'Inwangsan Fortress Trail' },
    emoji: '🏔️',
    difficulty: { ko: '초급', zh: '初级', en: 'Easy' },
    duration: '2h',
    length: '3.4km',
    desc: { ko: '서울 전경이 한눈에! 도심 속 최고의 성곽길', zh: '首尔全景一览无余！城中最美城墙路', en: 'Best fortress trail with Seoul panorama' },
    start: { lat: 37.5805, lng: 126.9590 },
  },
  {
    id: 'namsan',
    title: { ko: '남산 순환 산책로', zh: '南山环线步道', en: 'Namsan Loop Trail' },
    emoji: '🗼',
    difficulty: { ko: '초급', zh: '初级', en: 'Easy' },
    duration: '1.5h',
    length: '2.8km',
    desc: { ko: '남산타워까지 걸어서! 야경도 최고', zh: '步行到南山塔！夜景也超美', en: 'Walk to N Seoul Tower! Great night view' },
    start: { lat: 37.5512, lng: 126.9882 },
  },
  {
    id: 'bukhansan',
    title: { ko: '북한산 백운대', zh: '北汉山白云台', en: 'Bukhansan Baegundae' },
    emoji: '⛰️',
    difficulty: { ko: '중급', zh: '中级', en: 'Medium' },
    duration: '4h',
    length: '8.5km',
    desc: { ko: '서울 최고봉 836m! 본격 등산', zh: '首尔最高峰836m！正式登山', en: 'Seoul\'s highest peak 836m!' },
    start: { lat: 37.6600, lng: 126.9950 },
  },
  {
    id: 'achasan',
    title: { ko: '아차산 (광나루~용마산)', zh: '峨嵯山 (轻徒步)', en: 'Achasan Light Hike' },
    emoji: '🌿',
    difficulty: { ko: '초급', zh: '初级', en: 'Easy' },
    duration: '1.5h',
    length: '3km',
    desc: { ko: '轻徒步 트렌드! 한강 뷰 + 도심 숲', zh: '轻徒步趋势！汉江景+城市森林', en: 'Light hiking trend! Han River view' },
    start: { lat: 37.5716, lng: 127.1032 },
  },
]
