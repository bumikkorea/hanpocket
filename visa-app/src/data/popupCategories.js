// 팝업 카테고리 12종 + 수집 소스 + 유통채널 + 지역 정의
// popup-store-v3-migration.sql과 동기화

// ── 카테고리 정의 ─────────────────────────────────────────────

export const POPUP_CATEGORIES = [
  {
    code: 'FASHION',
    label: { ko: '패션', cn: '时尚', en: 'Fashion' },
    emoji: '👗',
    color: '#1A1A1A',
    sources: '4대 백화점, 무신사/29cm/W컨셉/에이블리/지그재그/A-land 입점 브랜드',
  },
  {
    code: 'BEAUTY',
    label: { ko: '뷰티', cn: '美妆', en: 'Beauty' },
    emoji: '💄',
    color: '#E91E63',
    sources: '올리브영, 무신사뷰티 입점 브랜드',
  },
  {
    code: 'SPORTS',
    label: { ko: '운동', cn: '运动', en: 'Sports' },
    emoji: '⚽',
    color: '#2196F3',
    sources: '위 유통 채널 입점 브랜드',
  },
  {
    code: 'EXHIBITION',
    label: { ko: '전시/갤러리', cn: '展览/画廊', en: 'Exhibition' },
    emoji: '🎨',
    color: '#9C27B0',
    sources: '팝플리, 성수동고릴라, 데이포유',
  },
  {
    code: 'LIFESTYLE',
    label: { ko: '라이프스타일', cn: '生活方式', en: 'Lifestyle' },
    emoji: '🏠',
    color: '#607D8B',
    sources: '위 유통 채널 입점 브랜드',
  },
  {
    code: 'IDOL',
    label: { ko: '아이돌/연예인', cn: '爱豆/艺人', en: 'Idol' },
    emoji: '🎤',
    color: '#7C3AED',
    sources: '시총 TOP10 엔터 소속 아티스트 공식홈/공식인스타/개인인스타',
  },
  {
    code: 'ANIME',
    label: { ko: '애니/웹툰', cn: '动漫/网漫', en: 'Anime/Webtoon' },
    emoji: '🎌',
    color: '#FF5722',
    sources: '중국 인기작 한정. 공식홈/팬페이지/스트리밍/작가인스타',
  },
  {
    code: 'HANGANG',
    label: { ko: '한강', cn: '汉江', en: 'Hangang' },
    emoji: '🌊',
    color: '#00BCD4',
    sources: '서울관광재단/한국관광공사 홈페이지 및 인스타',
  },
  {
    code: 'SEOUL_CITY',
    label: { ko: '서울시 주최', cn: '首尔市主办', en: 'Seoul City' },
    emoji: '🏛️',
    color: '#3F51B5',
    sources: '서울관광재단/한국관광공사 홈페이지 및 인스타',
  },
  {
    code: 'FESTIVAL',
    label: { ko: '페스티벌/축제', cn: '节日/庆典', en: 'Festival' },
    emoji: '🎪',
    color: '#FF9800',
    sources: '인터파크티켓/YES24 (축제 태그), 지자체 문화관광, IG 해시태그',
  },
  {
    code: 'DDP',
    label: { ko: 'DDP', cn: 'DDP', en: 'DDP' },
    emoji: '🔷',
    color: '#212121',
    sources: 'DDP 공식 홈페이지 및 공식 인스타',
  },
  {
    code: 'FNB',
    label: { ko: 'F&B/카페', cn: '餐饮/咖啡', en: 'F&B/Cafe' },
    emoji: '☕',
    color: '#795548',
    sources: '브랜드 공식채널, Xiaohongshu 트렌드 (검토 필요)',
  },
]

export const CATEGORY_MAP = Object.fromEntries(
  POPUP_CATEGORIES.map(c => [c.code, c])
)

export const CATEGORY_CODES = POPUP_CATEGORIES.map(c => c.code)


// ── 지역(district) 정의 ──────────────────────────────────────

export const POPUP_DISTRICTS = [
  { id: 'all',        label: { ko: '전체',       cn: '全部',         en: 'All' } },
  { id: 'seongsu',    label: { ko: '성수',       cn: '圣水',         en: 'Seongsu' } },
  { id: 'hongdae',    label: { ko: '홍대/연남',   cn: '弘大/延南',    en: 'Hongdae' } },
  { id: 'gangnam',    label: { ko: '강남/압구정', cn: '江南/狎鸥亭',  en: 'Gangnam' } },
  { id: 'myeongdong', label: { ko: '명동/을지로', cn: '明洞/乙支路',  en: 'Myeongdong' } },
  { id: 'hannam',     label: { ko: '한남/이태원', cn: '汉南/梨泰院',  en: 'Hannam' } },
  { id: 'yeouido',    label: { ko: '여의도',      cn: '汝矣岛',       en: 'Yeouido' } },
  { id: 'jongno',     label: { ko: '종로/광화문', cn: '钟路/光化门',  en: 'Jongno' } },
  { id: 'coex',       label: { ko: '코엑스/삼성', cn: 'COEX/三成',   en: 'COEX' } },
  { id: 'ddp',        label: { ko: 'DDP/동대문',  cn: 'DDP/东大门',   en: 'DDP' } },
  { id: 'hangang',    label: { ko: '한강',        cn: '汉江',         en: 'Hangang' } },
  { id: 'other',      label: { ko: '기타 서울',   cn: '其他首尔',     en: 'Other Seoul' } },
  { id: 'outside',    label: { ko: '서울 외',     cn: '首尔以外',     en: 'Outside Seoul' } },
]

export const DISTRICT_MAP = Object.fromEntries(
  POPUP_DISTRICTS.map(d => [d.id, d])
)


// ── 유통 채널 (수집 자격 판별용) ──────────────────────────────

export const RETAIL_CHANNELS = [
  // 4대 백화점
  { code: 'shinsegae',  label: '신세계백화점',    url: 'https://www.shinsegae.com',    type: 'department_store' },
  { code: 'lotte',      label: '롯데백화점',      url: 'https://www.lotteshopping.com', type: 'department_store' },
  { code: 'hyundai',    label: '현대백화점',      url: 'https://www.ehyundai.com',      type: 'department_store' },
  { code: 'ipark',      label: '아이파크백화점',  url: 'https://www.iparkmall.co.kr',   type: 'department_store' },
  // 온라인 플랫폼
  { code: 'musinsa',    label: '무신사',          url: 'https://www.musinsa.com',       type: 'online' },
  { code: '29cm',       label: '29CM',            url: 'https://www.29cm.co.kr',        type: 'online' },
  { code: 'wconcept',   label: 'W컨셉',          url: 'https://www.wconceptkorea.com', type: 'online' },
  { code: 'ably',       label: '에이블리',        url: 'https://www.a-bly.com',         type: 'online' },
  { code: 'zigzag',     label: '지그재그',        url: 'https://zigzag.kr',             type: 'online' },
  { code: 'oliveyoung', label: '올리브영',        url: 'https://www.oliveyoung.co.kr',  type: 'online' },
  { code: 'aland',      label: 'A-Land',         url: 'https://www.a-land.co.kr',      type: 'online' },
]

export const RETAIL_CHANNEL_MAP = Object.fromEntries(
  RETAIL_CHANNELS.map(c => [c.code, c])
)


// ── 리뷰 태그 ────────────────────────────────────────────────

export const REVIEW_TAGS = [
  { code: 'alipay',      label: { ko: '알리페이 가능', cn: '支持支付宝',    en: 'Alipay OK' },      emoji: '💳' },
  { code: 'cn_staff',    label: { ko: '중국어 OK',    cn: '中文服务',       en: 'Chinese Staff' },   emoji: '🗣️' },
  { code: 'goods',       label: { ko: '굿즈 구매',    cn: '购买周边',       en: 'Merch Available' }, emoji: '🎁' },
  { code: 'photozone',   label: { ko: '포토존',       cn: '拍照区',         en: 'Photo Zone' },      emoji: '📸' },
  { code: 'long_wait',   label: { ko: '대기 길어요',  cn: '排队久',         en: 'Long Wait' },       emoji: '⏳' },
  { code: 'free',        label: { ko: '무료 체험',    cn: '免费体验',       en: 'Free Experience' }, emoji: '🆓' },
  { code: 'limited',     label: { ko: '한정 판매',    cn: '限量销售',       en: 'Limited Edition' }, emoji: '🔥' },
  { code: 'tax_refund',  label: { ko: '세금환급',     cn: '可退税',         en: 'Tax Refund' },      emoji: '💰' },
  { code: 'no_kr_phone', label: { ko: '한국번호 불필요', cn: '无需韩国号码', en: 'No KR Phone' },    emoji: '📱' },
]


// ── 페스티벌 하위 분류 ────────────────────────────────────────

export const FESTIVAL_SUBTYPES = [
  { code: 'music',      label: { ko: '음악축제',     cn: '音乐节',       en: 'Music Festival' } },
  { code: 'food',       label: { ko: '푸드페스티벌', cn: '美食节',       en: 'Food Festival' } },
  { code: 'fireworks',  label: { ko: '불꽃축제',     cn: '烟花节',       en: 'Fireworks' } },
  { code: 'cherry',     label: { ko: '벚꽃축제',     cn: '樱花节',       en: 'Cherry Blossom' } },
  { code: 'autumn',     label: { ko: '단풍축제',     cn: '红叶节',       en: 'Autumn Foliage' } },
  { code: 'traditional',label: { ko: '전통축제',     cn: '传统庆典',     en: 'Traditional' } },
  { code: 'cultural',   label: { ko: '문화축제',     cn: '文化节',       en: 'Cultural' } },
]


// ── 왕좋아요/좋아요 반응 텍스트 ──────────────────────────────

export const REACTION_TEXT = {
  super_like: {
    prompt: { ko: '와! 저희의 취향 매칭이 통했네요! 🎉', cn: '哇！我们的品味匹配成功了！🎉', en: 'Wow! Our taste matching worked! 🎉' },
    cta:    { ko: '리뷰 남기고 🎁 랜덤박스 받기', cn: '写评价领🎁随机盒子', en: 'Leave a review & get 🎁' },
  },
  like: {
    prompt: { ko: '저희의 취향 매칭 알고리즘이 괜찮았군요 ㅠㅠ', cn: '看来我们的品味匹配还不错 😊', en: 'Our taste matching was decent 😊' },
    cta:    { ko: '리뷰 남기면 다음엔 더 잘 맞춰드릴게요!', cn: '写评价的话下次会更精准！', en: 'Leave a review for better matches!' },
  },
}


// ── 보상 체계 ─────────────────────────────────────────────────

export const REWARD_TIERS = {
  mini:    { label: { ko: '미니 박스',    cn: '迷你盒', en: 'Mini Box' },    points: [50, 100],   desc: '별점만' },
  normal:  { label: { ko: '일반 박스',    cn: '普通盒', en: 'Normal Box' },   points: [100, 300],  desc: '텍스트 리뷰' },
  premium: { label: { ko: '프리미엄 박스', cn: '高级盒', en: 'Premium Box' }, points: [300, 500],  desc: '사진+텍스트 리뷰' },
}

// 탐험가 레벨
export const EXPLORER_LEVELS = [
  { level: 1,  name: { ko: '초보 탐험가',     cn: '初级探险家',   en: 'Beginner Explorer' },   minVisits: 0 },
  { level: 2,  name: { ko: '팝업 여행자',     cn: '快闪旅行者',   en: 'Popup Traveler' },      minVisits: 3 },
  { level: 3,  name: { ko: '트렌드 사냥꾼',   cn: '潮流猎手',     en: 'Trend Hunter' },        minVisits: 7 },
  { level: 4,  name: { ko: '팝업 마니아',     cn: '快闪达人',     en: 'Popup Mania' },         minVisits: 15 },
  { level: 5,  name: { ko: '서울 마스터',     cn: '首尔大师',     en: 'Seoul Master' },        minVisits: 30 },
  { level: 6,  name: { ko: '팝업 전설',       cn: '快闪传说',     en: 'Popup Legend' },        minVisits: 50 },
  { level: 7,  name: { ko: '한국통',          cn: '韩国通',       en: 'Korea Expert' },        minVisits: 80 },
  { level: 8,  name: { ko: '팝업 영웅',       cn: '快闪英雄',     en: 'Popup Hero' },          minVisits: 120 },
  { level: 9,  name: { ko: '얼리어답터',      cn: '先锋探索者',   en: 'Early Adopter' },       minVisits: 180 },
  { level: 10, name: { ko: '팝업 신',         cn: '快闪之神',     en: 'Popup God' },           minVisits: 300 },
]


// ── cn_score 계산 (프론트엔드 동기화) ─────────────────────────

export function calcCnScore(popup) {
  return Math.min(10, (
    (popup.cn_alipay       ? 2.0 : 0) +
    (popup.cn_wechatpay    ? 2.0 : 0) +
    (popup.cn_staff        ? 2.0 : 0) +
    (popup.cn_brochure     ? 1.0 : 0) +
    (popup.cn_no_kr_phone_ok ? 1.5 : 0) +
    (popup.has_freebies    ? 0.5 : 0) +
    (popup.has_photozone   ? 0.5 : 0) +
    (popup.tax_free        ? 0.5 : 0)
  ))
}
