// NEAR 앱 코스 시드 데이터
// type ENUM: city_tour | kpop | walking | custom
// stops: poi_ids가 allPins에 없을 때 lat/lng 직접 사용 (폴백)

export const COURSE_DATA = [
  // ─── 1: 성수동 팝업 핵심 코스 ───
  {
    id: 'course-seongsu',
    title_zh: '圣水洞快闪精华路线',
    title_ko: '성수동 팝업 핵심 코스',
    title_en: 'Seongsu Popup Essentials',
    description_zh: '圣水洞5大人气快闪店一网打尽，约3小时',
    description_ko: '성수동 핫한 팝업 5곳을 한 번에, 약 3시간',
    description_en: 'Hit the top 5 Seongsu pop-ups in one go',
    type: 'walking',
    poi_ids: ['poi-019', 'poi-009', 'poi-003', 'poi-013', 'poi-006'],
    estimated_hours: 3.0,
    stop_count: 5,
    stops: [],
  },

  // ─── 2: 한남동 브랜드 투어 ───
  {
    id: 'course-hannam',
    title_zh: '汉南洞品牌探索路线',
    title_ko: '한남동 브랜드 투어',
    title_en: 'Hannam Brand Tour',
    description_zh: '汉南洞设计师品牌与K-POP体验，约2小时',
    description_ko: '한남동 디자이너 브랜드와 K-POP 체험, 약 2시간',
    description_en: 'Designer brands & K-POP experiences in Hannam',
    type: 'walking',
    poi_ids: ['poi-016', 'poi-020', 'poi-023'],
    estimated_hours: 2.0,
    stop_count: 3,
    stops: [],
  },

  // ─── 3: 홍대·연남 카페 코스 (신규) ───
  {
    id: 'course-hongdae',
    title_zh: '弘大·延南咖啡漫步',
    title_ko: '홍대·연남 카페 산책',
    title_en: 'Hongdae-Yeonnam Cafe Walk',
    description_zh: '从弘大到延南，用咖啡连接两个街区的不同节奏',
    description_ko: '홍대에서 연남까지, 카페로 연결되는 두 동네의 리듬',
    description_en: 'From Hongdae to Yeonnam, connected by cafes',
    type: 'walking',
    poi_ids: [],
    estimated_hours: 3.0,
    stop_count: 4,
    stops: [
      { name_zh: '弘大入口广场', name_ko: '홍대앞 광장', name_en: 'Hongdae Square', lat: 37.5568, lng: 126.9237, address_zh: '麻浦区弘大入口' },
      { name_zh: '延南洞咖啡街', name_ko: '연남동 카페거리', name_en: 'Yeonnam Cafe Street', lat: 37.5661, lng: 126.9256, address_zh: '麻浦区延南洞' },
      { name_zh: '京义线绿道', name_ko: '경의선 숲길', name_en: 'Gyeongui Line Forest Park', lat: 37.5630, lng: 126.9250, address_zh: '麻浦区东橄榄路' },
      { name_zh: '望远汉江公园', name_ko: '망원한강공원', name_en: 'Mangwon Hangang Park', lat: 37.5539, lng: 126.9024, address_zh: '麻浦区望远洞' },
    ],
  },

  // ─── 4: K-POP 성지순례 (신규) ───
  {
    id: 'course-kpop',
    title_zh: 'K-POP圣地巡礼',
    title_ko: 'K-POP 성지순례',
    title_en: 'K-POP Pilgrimage',
    description_zh: '走访偶像们的足迹，从练习室到出道舞台',
    description_ko: '아이돌의 발자취를 따라, 연습실부터 데뷔 무대까지',
    description_en: 'Follow idol footsteps, from practice rooms to debut stages',
    type: 'kpop',
    poi_ids: [],
    estimated_hours: 4.0,
    stop_count: 4,
    stops: [
      { name_zh: 'HYBE INSIGHT 展览馆', name_ko: 'HYBE INSIGHT', name_en: 'HYBE Insight', lat: 37.5263, lng: 127.0390, address_zh: '首尔龙山区梨泰院路' },
      { name_zh: 'SM娱乐 圣水总部', name_ko: 'SM엔터테인먼트', name_en: 'SM Entertainment', lat: 37.5445, lng: 127.0562, address_zh: '城东区圣水洞' },
      { name_zh: 'JYP娱乐', name_ko: 'JYP엔터테인먼트', name_en: 'JYP Entertainment', lat: 37.5240, lng: 127.0420, address_zh: '江南区清潭洞' },
      { name_zh: '清潭洞K-Star Road', name_ko: '청담동 K-스타 로드', name_en: 'Cheongdam K-Star Road', lat: 37.5199, lng: 127.0474, address_zh: '江南区清潭洞' },
    ],
  },

  // ─── 5: 궁궐 야경 코스 (신규) ───
  {
    id: 'course-palace',
    title_zh: '宫殿夜景漫步',
    title_ko: '궁궐 야경 산책',
    title_en: 'Palace Night Walk',
    description_zh: '在灯光下感受朝鲜王朝的夜晚',
    description_ko: '조명 아래 조선왕조의 밤을 걷다',
    description_en: 'Walk through Joseon history under the night lights',
    type: 'walking',
    poi_ids: [],
    estimated_hours: 2.0,
    stop_count: 3,
    stops: [
      { name_zh: '景福宫', name_ko: '경복궁', name_en: 'Gyeongbokgung Palace', lat: 37.5796, lng: 126.9770, address_zh: '钟路区景福宫路161号' },
      { name_zh: '昌德宫', name_ko: '창덕궁', name_en: 'Changdeokgung Palace', lat: 37.5794, lng: 126.9910, address_zh: '钟路区律谷路99号' },
      { name_zh: '德寿宫', name_ko: '덕수궁', name_en: 'Deoksugung Palace', lat: 37.5660, lng: 126.9757, address_zh: '中区世宗大路99号' },
    ],
  },
]
