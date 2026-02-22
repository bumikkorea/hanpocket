// 아이콘 매핑
export const LUCIDE_ICON_MAP = { 
  Stamp: 'Stamp', FileText: 'FileText', BookOpen: 'BookOpen', ArrowLeftRight: 'ArrowLeftRight', 
  Home: 'Home', X: 'X', PawPrint: 'PawPrint', Newspaper: 'Newspaper', Music: 'Music', 
  TrendingUp: 'TrendingUp', Cloud: 'Cloud', MapPin: 'MapPin', Settings: 'Settings', 
  Calendar: 'Calendar', Clock: 'Clock', DollarSign: 'DollarSign', Package: 'Package', 
  Utensils: 'Utensils', ShoppingBag: 'ShoppingBag', Sparkles: 'Sparkles', Heart: 'Heart', 
  Plane: 'Plane', Star: 'Star', Play: 'Play', Volume2: 'Volume2', Flame: 'Flame', 
  Train: 'Train', Check: 'Check', Tag: 'Tag', Bike: 'Bike', Wrench: 'Wrench', 
  GraduationCap: 'GraduationCap', Users: 'Users', Clapperboard: 'Clapperboard', 
  Shirt: 'Shirt', Siren: 'Siren', Coins: 'Coins', MessageCircle: 'MessageCircle', 
  HelpCircle: 'HelpCircle', Globe: 'Globe', Tv: 'Tv', Mic: 'Mic', 
  Thermometer: 'Thermometer', Landmark: 'Landmark', Briefcase: 'Briefcase', 
  Building2: 'Building2', Dog: 'Dog' 
}

// 환율 통화 정보
export const CURRENCIES = [
  { code: 'CNY', flag: 'CN', name: '人民币', rate: 191.52 },
  { code: 'HKD', flag: 'HK', name: '港币', rate: 177.80 },
  { code: 'TWD', flag: 'TW', name: '新台币', rate: 42.50 },
  { code: 'MOP', flag: 'MO', name: '澳门元', rate: 171.20 },
  { code: 'USD', flag: 'US', name: '美元', rate: 1384.50 },
  { code: 'JPY', flag: 'JP', name: '日元', rate: 9.21 },
  { code: 'VND', flag: 'VN', name: '越南盾', rate: 0.055 },
  { code: 'PHP', flag: 'PH', name: '比索', rate: 24.10 },
  { code: 'THB', flag: 'TH', name: '泰铢', rate: 39.80 },
]

// 타임존 국가 정보
export const TIMEZONE_COUNTRIES = [
  { id: 'china', name: { ko: '중국', zh: '中国', en: 'China' }, offset: 8, flag: 'CN' },
  { id: 'japan', name: { ko: '일본', zh: '日本', en: 'Japan' }, offset: 9, flag: 'JP' },
  { id: 'vietnam', name: { ko: '베트남', zh: '越南', en: 'Vietnam' }, offset: 7, flag: 'VN' },
  { id: 'philippines', name: { ko: '필리핀', zh: '菲律宾', en: 'Philippines' }, offset: 8, flag: 'PH' },
  { id: 'thailand', name: { ko: '태국', zh: '泰国', en: 'Thailand' }, offset: 7, flag: 'TH' },
  { id: 'indonesia', name: { ko: '인도네시아', zh: '印度尼西亚', en: 'Indonesia' }, offset: 7, flag: 'ID' },
  { id: 'usa_east', name: { ko: '미국(동부)', zh: '美国(东部)', en: 'USA (East)' }, offset: -5, flag: 'US' },
  { id: 'usa_west', name: { ko: '미국(서부)', zh: '美国(西部)', en: 'USA (West)' }, offset: -8, flag: 'US' },
  { id: 'uk', name: { ko: '영국', zh: '英国', en: 'UK' }, offset: 0, flag: 'GB' },
  { id: 'australia', name: { ko: '호주', zh: '澳大利亚', en: 'Australia' }, offset: 11, flag: 'AU' },
]

// 한국 공휴일
export const KOREAN_HOLIDAYS = [
  { m: 1, d: 1, ko: '신정', zh: '元旦', en: "New Year's Day" },
  { m: 3, d: 1, ko: '삼일절', zh: '三一节', en: 'Independence Movement Day' },
  { m: 5, d: 5, ko: '어린이날', zh: '儿童节', en: "Children's Day" },
  { m: 6, d: 6, ko: '현충일', zh: '显忠日', en: 'Memorial Day' },
  { m: 8, d: 15, ko: '광복절', zh: '光复节', en: 'Liberation Day' },
  { m: 10, d: 3, ko: '개천절', zh: '开天节', en: 'National Foundation Day' },
  { m: 10, d: 9, ko: '한글날', zh: '韩文日', en: 'Hangul Day' },
  { m: 12, d: 25, ko: '성탄절', zh: '圣诞节', en: 'Christmas' },
  { m: 2, d: 17, ko: '설날', zh: '春节', en: 'Lunar New Year' },
  { m: 2, d: 16, ko: '설날 연휴', zh: '春节假期', en: 'Lunar New Year Holiday' },
  { m: 2, d: 18, ko: '설날 연휴', zh: '春节假期', en: 'Lunar New Year Holiday' },
  { m: 5, d: 24, ko: '부처님오신날', zh: '佛诞节', en: "Buddha's Birthday" },
  { m: 9, d: 25, ko: '추석', zh: '中秋节', en: 'Chuseok' },
  { m: 9, d: 24, ko: '추석 연휴', zh: '中秋假期', en: 'Chuseok Holiday' },
  { m: 9, d: 26, ko: '추석 연휴', zh: '中秋假期', en: 'Chuseok Holiday' },
]

// 섹션 그룹핑
export const SECTION_TODAY = ['editorpick', 'cvsnew', 'beautynew', 'kpop', 'fanevent', 'restaurant']
export const SECTION_SHOPPING = ['oliveyoung', 'themepark', 'beauty', 'fashiontrend']
export const SECTION_CULTURE = ['tradition', 'festival', 'trip']
export const SECTION_TOOLS = ['timezone', 'parcel', 'delivery', 'currency']