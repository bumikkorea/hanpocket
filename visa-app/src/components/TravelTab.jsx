import { useState, useEffect, lazy, Suspense } from 'react'
import { Plane, Train, Bus, Car, MapPin, Clock, DollarSign, Calendar, ChevronRight, ChevronDown, ExternalLink, CreditCard, Bike, Building2, Ticket, Navigation, Shield, Filter, Star, Heart, Users, BookOpen, Phone, Copy, Check, MessageSquare, FileText, PawPrint, AlertTriangle, Syringe, User, PenLine, Globe, Hash, Home, Target, CircleAlert, Info, Receipt, Store, BadgePercent, Smartphone, Wifi, QrCode, Signal, ThumbsUp, CircleCheck, CircleX } from 'lucide-react'
import { CITIES as TRAVEL_CITIES } from '../data/travelData'

const TravelDiary = lazy(() => import('./TravelDiary/TravelDiary'))
const CityPage = lazy(() => import('./travel/CityPage'))
const SpotDetail = lazy(() => import('./travel/SpotDetail'))

function L(lang, d) { if (typeof d === 'string') return d; return d?.[lang] || d?.en || d?.zh || d?.ko || '' }

const TourSpotSection = lazy(() => import('./TourSpotSection'))
const TourDetailModal = lazy(() => import('./TourDetailModal'))
const FlightSearchCard = lazy(() => import('./FlightSearchCard'))
const ArrivalCardGuide = lazy(() => import('./guides/ArrivalCardGuide'))
const SimGuide = lazy(() => import('./guides/SimGuide'))
const TaxRefundGuide = lazy(() => import('./guides/TaxRefundGuide'))
const DutyFreeGuide = lazy(() => import('./guides/DutyFreeGuide'))

const SECTIONS = [
  { id: 'discover', label: { ko: '발견', zh: '发现', en: 'Discover' } },

  { id: 'cities', label: { ko: '도시 가이드', zh: '城市指南', en: 'Cities' } },
  { id: 'transport', label: { ko: '교통', zh: '交通', en: 'Transport' } },
  { id: 'stay', label: { ko: '숙소', zh: '住宿', en: 'Stay' } },
  { id: 'itinerary', label: { ko: '코스 추천', zh: '行程推荐', en: 'Itineraries' } },
  { id: 'curation', label: { ko: '큐레이션', zh: '精选推荐', en: 'Curation' } },
  { id: 'parks', label: { ko: '테마파크', zh: '主题公园', en: 'Theme Parks' } },
  { id: 'taxrefund', label: { ko: '세금환급', zh: '退税/免税', en: 'Tax Refund' } },
]

const AIRPORTS = [
  { code: 'ICN', name: { ko: '인천국제공항', zh: '仁川国际机场', en: 'Incheon Intl Airport' }, terminals: 'T1, T2', toCity: [
    { method: { ko: 'AREX 직통열차', zh: 'AREX直达列车', en: 'AREX Express' }, time: '43min', price: '₩10,300', dest: { ko: '서울역', zh: '首尔站', en: 'Seoul Stn' } },
    { method: { ko: '공항 리무진버스', zh: '机场大巴', en: 'Airport Limousine' }, time: '60~90min', price: '₩17,000', dest: { ko: '서울 주요지역', zh: '首尔主要地区', en: 'Major Seoul areas' } },
    { method: { ko: '택시', zh: '出租车', en: 'Taxi' }, time: '60~80min', price: '₩65,000~80,000', dest: { ko: '서울 시내', zh: '首尔市内', en: 'Seoul city' } },
  ]},
  { code: 'GMP', name: { ko: '김포국제공항', zh: '金浦国际机场', en: 'Gimpo Intl Airport' }, terminals: 'Intl, Dom', toCity: [
    { method: { ko: '지하철 5/9호선/공항철도', zh: '地铁5/9号线/机场铁路', en: 'Subway Line 5/9/AREX' }, time: '20~40min', price: '₩1,400~', dest: { ko: '서울 시내', zh: '首尔市内', en: 'Seoul city' } },
    { method: { ko: '택시', zh: '出租车', en: 'Taxi' }, time: '30~50min', price: '₩20,000~35,000', dest: { ko: '서울 시내', zh: '首尔市内', en: 'Seoul city' } },
  ]},
  { code: 'PUS', name: { ko: '김해국제공항', zh: '金海国际机场', en: 'Gimhae Intl Airport' }, terminals: 'Intl, Dom', toCity: [
    { method: { ko: '경전철', zh: '轻轨', en: 'Light Rail' }, time: '30min', price: '₩1,400', dest: { ko: '부산 시내 (사상역 환승)', zh: '釜山市内（沙上站换乘）', en: 'Busan city (transfer at Sasang)' } },
    { method: { ko: '리무진버스', zh: '机场大巴', en: 'Limousine Bus' }, time: '50min', price: '₩7,000', dest: { ko: '해운대', zh: '海云台', en: 'Haeundae' } },
  ]},
]

const IMMIGRATION_STEPS = [
  { ko: '도착 후 입국심사 줄 서기 (외국인 전용)', zh: '到达后排队等候入境审查（外国人专用）', en: 'Queue for immigration (foreign passport line)' },
  { ko: '여권 + 입국카드 제출 (기내에서 작성)', zh: '提交护照+入境卡（飞机上填写）', en: 'Submit passport + arrival card (filled on plane)' },
  { ko: '지문 등록 + 얼굴 촬영', zh: '登记指纹+面部拍照', en: 'Fingerprint scan + photo' },
  { ko: '입국 심사관 질문 응답 (방문 목적, 체류 기간)', zh: '回答入境审查官提问（访问目的、停留时间）', en: 'Answer officer questions (purpose, duration)' },
  { ko: '수하물 수취', zh: '领取行李', en: 'Collect baggage' },
  { ko: '세관 신고 (해당 시) → 입국 완료', zh: '海关申报（如有）→入境完成', en: 'Customs declaration (if applicable) → Entry complete' },
]

const CUSTOMS = [
  { item: { ko: '주류', zh: '酒类', en: 'Alcohol' }, limit: { ko: '1병 (1L, $400 이하)', zh: '1瓶（1L，400美元以下）', en: '1 bottle (1L, under $400)' } },
  { item: { ko: '담배', zh: '香烟', en: 'Cigarettes' }, limit: { ko: '200개비 (1보루)', zh: '200支（1条）', en: '200 sticks (1 carton)' } },
  { item: { ko: '향수', zh: '香水', en: 'Perfume' }, limit: { ko: '60ml', zh: '60ml', en: '60ml' } },
  { item: { ko: '기타 물품', zh: '其他物品', en: 'Other goods' }, limit: { ko: '합계 $800 이하 면세', zh: '合计800美元以下免税', en: 'Total under $800 duty-free' } },
]

const SIM_OPTIONS = [
  {
    id: 'esim',
    icon: QrCode,
    recommended: true,
    name: { ko: 'eSIM (추천!)', zh: 'eSIM（推荐！）', en: 'eSIM (Recommended!)' },
    where: { ko: '출발 전 온라인 구매', zh: '出发前在线购买', en: 'Buy online before departure' },
    price: '₩15,000~25,000 / 7일',
    features: { ko: '가장 저렴, QR스캔만 하면 끝', zh: '最便宜，扫QR码即可', en: 'Cheapest, just scan QR code' },
    color: '#059669',
  },
  {
    id: 'airport',
    icon: Plane,
    name: { ko: '공항 로밍센터', zh: '机场漫游中心', en: 'Airport Roaming Center' },
    where: { ko: '인천공항 입국장 1F', zh: '仁川机场到达层1F', en: 'Incheon Airport Arrivals 1F' },
    price: '₩33,000~55,000 / 7일',
    features: { ko: '도착 즉시 구매, 직원이 설치', zh: '到达即可购买，工作人员帮忙安装', en: 'Buy on arrival, staff installs' },
    color: '#2563EB',
  },
  {
    id: 'cvs',
    icon: Store,
    name: { ko: '편의점 SIM', zh: '便利店SIM卡', en: 'Convenience Store SIM' },
    where: { ko: 'CU / GS25 / 7-Eleven', zh: 'CU / GS25 / 7-Eleven', en: 'CU / GS25 / 7-Eleven' },
    price: '₩20,000~35,000',
    features: { ko: '언제든 구매 가능, 여권 필요', zh: '随时可购买，需要护照', en: 'Buy anytime, passport required' },
    color: '#7C3AED',
  },
  {
    id: 'wifi',
    icon: Wifi,
    name: { ko: '포켓 와이파이', zh: '随身WiFi', en: 'Pocket WiFi' },
    where: { ko: '공항 수령 / 반납', zh: '机场领取/归还', en: 'Airport pickup / return' },
    price: '₩3,000~5,000 / 일',
    features: { ko: '여러 명 공유 가능 (5대)', zh: '可多人共享（5台设备）', en: 'Share with group (5 devices)' },
    color: '#D97706',
  },
]

const ESIM_SERVICES = [
  { name: 'Airalo', desc: { ko: '전세계 eSIM 1위, 한국 전용 플랜', zh: '全球eSIM第一，韩国专用套餐', en: '#1 global eSIM, Korea-specific plans' } },
  { name: 'Holafly', desc: { ko: '무제한 데이터, 핫스팟 가능', zh: '无限流量，可开热点', en: 'Unlimited data, hotspot OK' } },
  { name: 'KT eSIM', desc: { ko: 'KT 직접 운영, 가장 안정적', zh: 'KT直营，最稳定', en: 'Run by KT, most reliable' } },
]

const SIM_TIPS = [
  { type: 'warn', text: { ko: '중국 SIM으로는 카카오톡 인증 안됨 → 한국 SIM 필요!', zh: '中国SIM卡无法验证KakaoTalk → 需要韩国SIM卡！', en: 'Chinese SIM cannot verify KakaoTalk → Need Korean SIM!' } },
  { type: 'ok', text: { ko: '알리페이/위챗페이는 중국 SIM 없어도 사용 가능', zh: '支付宝/微信支付不需要中国SIM卡也能使用', en: 'Alipay/WeChat Pay work without Chinese SIM' } },
  { type: 'warn', text: { ko: '데이터 전용 vs 통화+데이터 구분 확인!', zh: '注意区分：纯流量 vs 通话+流量！', en: 'Check: data-only vs calls+data!' } },
  { type: 'ok', text: { ko: 'eSIM: 아이폰14+ OK, 화웨이 일부 불가', zh: 'eSIM：iPhone14+ OK，华为部分不支持', en: 'eSIM: iPhone14+ OK, some Huawei not supported' } },
]

// === 세금 환급 (退税指南) ===
const TAX_REFUND_CONDITIONS = [
  { ko: '외국인 여권 소지자 (한국 체류 6개월 미만)', zh: '持外国护照（在韩停留不满6个月）', en: 'Foreign passport holder (stayed less than 6 months)' },
  { ko: '1회 구매금액 ₩30,000 이상', zh: '单次购物金额₩30,000以上', en: 'Single purchase ₩30,000 or more' },
  { ko: 'Tax Free / Tax Refund 가맹 매장에서 구매', zh: '在Tax Free/Tax Refund加盟店购买', en: 'Purchased at Tax Free / Tax Refund stores' },
  { ko: '구매일로부터 3개월 이내 출국', zh: '购买之日起3个月内出境', en: 'Depart within 3 months of purchase date' },
]

const TAX_REFUND_METHODS = [
  {
    id: 'instant',
    title: { ko: '즉시환급', zh: '当场退税', en: 'Instant Refund' },
    subtitle: { ko: '매장에서 바로 세금 차감', zh: '在店内直接扣除税额', en: 'Tax deducted at the store' },
    icon: Store,
    color: 'emerald',
    steps: [
      { ko: '매장에서 "Tax Free 즉시환급" 요청', zh: '在店内申请"Tax Free即时退税"', en: 'Request "Tax Free instant refund" at store' },
      { ko: '여권 제시 → 바로 세금 제외 결제', zh: '出示护照→直接扣税结算', en: 'Show passport → pay with tax deducted' },
    ],
    limit: { ko: '1회 ₩50,000 / 연간 ₩250,000 한도', zh: '单次₩50,000 / 年度₩250,000限额', en: 'Per purchase ₩50,000 / annual ₩250,000 limit' },
    pros: { ko: '가장 간편, 현장에서 즉시 완료', zh: '最方便，现场即时完成', en: 'Easiest, done on the spot' },
    cons: { ko: '한도 낮음, 일부 매장만 가능', zh: '限额低，仅部分门店支持', en: 'Low limit, only some stores' },
  },
  {
    id: 'downtown',
    title: { ko: '시내환급', zh: '市内退税', en: 'Downtown Refund' },
    subtitle: { ko: '명동/동대문 환급 카운터', zh: '明洞/东大门退税柜台', en: 'Myeongdong/Dongdaemun counters' },
    icon: Building2,
    color: 'blue',
    steps: [
      { ko: '매장에서 Tax Refund 영수증 수령', zh: '在店内领取退税单', en: 'Get tax refund receipt at store' },
      { ko: '시내 환급 카운터 방문 (명동/동대문/강남)', zh: '前往市内退税柜台（明洞/东大门/江南）', en: 'Visit downtown refund counter' },
      { ko: '여권 + 영수증 → 현금 수령', zh: '护照+退税单→领取现金', en: 'Passport + receipt → receive cash' },
    ],
    limit: { ko: '금액 제한 없음 (75만원 초과 시 공항 세관 확인 필요)', zh: '无金额限制（超₩750,000需在机场海关确认）', en: 'No limit (over ₩750,000 requires airport customs check)' },
    pros: { ko: '현금 즉시 수령, 공항보다 한가함', zh: '现场领现金，比机场人少', en: 'Instant cash, less crowded than airport' },
    cons: { ko: '환급 카운터 찾아가야 함', zh: '需要找到退税柜台', en: 'Need to find the counter' },
  },
  {
    id: 'airport',
    title: { ko: '공항환급', zh: '机场退税', en: 'Airport Refund' },
    subtitle: { ko: '출국 시 공항에서 환급', zh: '出境时在机场退税', en: 'Refund at airport upon departure' },
    icon: Plane,
    color: 'violet',
    steps: [
      { ko: '매장에서 Tax Refund 영수증 수령', zh: '在店内领取退税单', en: 'Get tax refund receipt at store' },
      { ko: '공항 세관신고대에서 도장 (3층 출발층, 체크인 전)', zh: '在机场海关申报台盖章（3层出发层，值机前）', en: 'Get stamp at customs counter (3F departures, before check-in)' },
      { ko: '보안검색 후 환급 카운터에서 수령', zh: '安检后在退税柜台领取', en: 'Collect at refund counter after security' },
    ],
    limit: { ko: '금액 무제한', zh: '无金额限制', en: 'No amount limit' },
    pros: { ko: '한도 없음, 가장 확실한 방법', zh: '无限额，最稳妥的方式', en: 'No limit, most reliable method' },
    cons: { ko: '출국 당일 시간 여유 필요 (30분+)', zh: '出境当天需预留时间（30分钟以上）', en: 'Need extra time on departure day (30+ min)' },
  },
]

const AIRPORT_REFUND_STEPS = [
  { num: 1, icon: Receipt, label: { ko: '물품 + 영수증 준비', zh: '准备商品+退税单', en: 'Prepare goods + receipts' }, desc: { ko: 'Tax Free 영수증과 구매 물품을 함께 준비', zh: '准备好退税单和购买的商品', en: 'Prepare tax-free receipts and purchased items' } },
  { num: 2, icon: FileText, label: { ko: '세관 도장 (3층)', zh: '海关盖章（3层）', en: 'Customs stamp (3F)' }, desc: { ko: '출발층 세관신고대에서 도장 — 위탁수하물 부치기 전!', zh: '在出发层海关申报台盖章——托运行李前！', en: 'Get stamp at customs counter — before checking bags!' } },
  { num: 3, icon: Shield, label: { ko: '보안검색 통과', zh: '通过安检', en: 'Pass security' }, desc: { ko: '출국심사 + 보안검색 진행', zh: '出境审查+安检', en: 'Immigration + security check' } },
  { num: 4, icon: DollarSign, label: { ko: '환급 카운터', zh: '退税柜台', en: 'Refund counter' }, desc: { ko: '면세구역 내 환급 카운터에서 현금/카드로 수령', zh: '在免税区退税柜台领取现金/刷卡', en: 'Collect cash/card refund at counter in duty-free area' } },
]

// === 면세 한도 (免税限额) ===
const DUTY_FREE_KOREA = [
  { emoji: '💰', item: { ko: '총 면세 한도', zh: '总免税限额', en: 'Total duty-free' }, limit: { ko: 'US$800 이하', zh: 'US$800以下', en: 'Under US$800' }, note: { ko: '초과분에 대해 관세 부과', zh: '超出部分征收关税', en: 'Duty charged on excess' } },
  { emoji: '🚬', item: { ko: '담배', zh: '香烟', en: 'Cigarettes' }, limit: { ko: '200개비', zh: '200支', en: '200 sticks' }, note: { ko: '1보루', zh: '1条', en: '1 carton' } },
  { emoji: '🍷', item: { ko: '주류', zh: '酒类', en: 'Alcohol' }, limit: { ko: '2병 (2L, $400 이하)', zh: '2瓶（2L，400美元以下）', en: '2 bottles (2L, under $400)' }, note: { ko: '19세 미만 불가', zh: '未满19岁不可', en: 'Must be 19+' } },
  { emoji: '💐', item: { ko: '향수', zh: '香水', en: 'Perfume' }, limit: { ko: '100ml', zh: '100ml', en: '100ml' }, note: null },
  { emoji: '🎁', item: { ko: '기타 합산', zh: '其他合计', en: 'Other goods' }, limit: { ko: 'US$800 이내', zh: 'US$800以内', en: 'Within US$800' }, note: { ko: '한약재: 3kg / $300 이하', zh: '中药材：3kg/$300以下', en: 'Herbal medicine: 3kg / under $300' } },
]

const DUTY_FREE_CHINA_RETURN = [
  { emoji: '💰', item: { ko: '총 면세 한도', zh: '总免税限额', en: 'Total duty-free' }, limit: '¥5,000', note: { ko: '초과분 세금 부과', zh: '超出部分需缴税', en: 'Tax on excess' } },
  { emoji: '🍷', item: { ko: '주류', zh: '酒类', en: 'Alcohol' }, limit: '1.5L', note: { ko: '12도 이상', zh: '12度以上', en: 'Above 12%' } },
  { emoji: '🚬', item: { ko: '담배', zh: '香烟', en: 'Cigarettes' }, limit: { ko: '400개비', zh: '400支', en: '400 sticks' }, note: { ko: '2보루', zh: '2条', en: '2 cartons' } },
]

const CITIES = [
  { name: { ko: '서울', zh: '首尔', en: 'Seoul' }, desc: { ko: '대한민국의 수도. K-POP, 쇼핑, 역사, 미식의 중심지.', zh: '韩国首都。K-POP、购物、历史、美食的中心。', en: 'Capital of Korea. Center of K-POP, shopping, history, and food.' }, spots: [
    { ko: '경복궁', zh: '景福宫', en: 'Gyeongbokgung' }, { ko: '명동', zh: '明洞', en: 'Myeongdong' }, { ko: '홍대', zh: '弘大', en: 'Hongdae' }, { ko: 'N서울타워', zh: 'N首尔塔', en: 'N Seoul Tower' }, { ko: '북촌한옥마을', zh: '北村韩屋村', en: 'Bukchon Hanok Village' }
  ], access: { ko: 'KTX 기점', zh: 'KTX起点', en: 'KTX hub' }, season: { ko: '연중', zh: '全年', en: 'Year-round' } },
  { name: { ko: '부산', zh: '釜山', en: 'Busan' }, desc: { ko: '한국 제2의 도시. 해변, 해산물, 영화제로 유명.', zh: '韩国第二大城市。以海滩、海鲜、电影节闻名。', en: 'Korea\'s 2nd city. Famous for beaches, seafood, film festival.' }, spots: [
    { ko: '해운대', zh: '海云台', en: 'Haeundae' }, { ko: '감천문화마을', zh: '甘川文化村', en: 'Gamcheon Village' }, { ko: '자갈치시장', zh: '扎嘎其市场', en: 'Jagalchi Market' }, { ko: '해동용궁사', zh: '海东龙宫寺', en: 'Haedong Yonggungsa' }, { ko: '광안리', zh: '广安里', en: 'Gwangalli' }
  ], access: { ko: 'KTX 2시간 30분', zh: 'KTX 2小时30分', en: 'KTX 2.5h' }, season: { ko: '여름', zh: '夏天', en: 'Summer' } },
  { name: { ko: '제주', zh: '济州', en: 'Jeju' }, desc: { ko: '화산섬. 자연경관, 해녀, 감귤로 유명. 비자 없이 30일 체류 가능(중국인).', zh: '火山岛。以自然景观、海女、柑橘闻名。中国人可免签停留30天。', en: 'Volcanic island. Known for nature, haenyeo divers, tangerines. 30-day visa-free for Chinese.' }, spots: [
    { ko: '한라산', zh: '汉拿山', en: 'Hallasan' }, { ko: '성산일출봉', zh: '城山日出峰', en: 'Seongsan Ilchulbong' }, { ko: '만장굴', zh: '万丈窟', en: 'Manjanggul' }, { ko: '협재해변', zh: '挟才海滩', en: 'Hyeopjae Beach' }, { ko: '우도', zh: '牛岛', en: 'Udo' }
  ], access: { ko: '비행기 1시간', zh: '飞机1小时', en: 'Flight 1h' }, season: { ko: '봄/가을', zh: '春/秋', en: 'Spring/Fall' } },
  { name: { ko: '인천', zh: '仁川', en: 'Incheon' }, desc: { ko: '국제공항 소재지. 차이나타운, 송도, 월미도.', zh: '国际机场所在地。唐人街、松岛、月尾岛。', en: 'Home of the international airport. Chinatown, Songdo, Wolmido.' }, spots: [
    { ko: '차이나타운', zh: '唐人街', en: 'Chinatown' }, { ko: '월미도', zh: '月尾岛', en: 'Wolmido' }, { ko: '송도', zh: '松岛', en: 'Songdo' }, { ko: '소래포구', zh: '苏莱浦口', en: 'Sorae Pogu' }
  ], access: { ko: '지하철 1시간', zh: '地铁1小时', en: 'Subway 1h' }, season: { ko: '연중', zh: '全年', en: 'Year-round' } },
  { name: { ko: '경주', zh: '庆州', en: 'Gyeongju' }, desc: { ko: '신라 천년 고도. 유네스코 세계유산 도시.', zh: '新罗千年古都。联合国教科文组织世界遗产城市。', en: 'Ancient Silla capital. UNESCO World Heritage city.' }, spots: [
    { ko: '불국사', zh: '佛国寺', en: 'Bulguksa' }, { ko: '석굴암', zh: '石窟庵', en: 'Seokguram' }, { ko: '첨성대', zh: '瞻星台', en: 'Cheomseongdae' }, { ko: '안압지', zh: '雁鸭池', en: 'Anapji' }, { ko: '보문단지', zh: '普门园区', en: 'Bomun Complex' }
  ], access: { ko: 'KTX+버스 3시간', zh: 'KTX+巴士3小时', en: 'KTX+bus 3h' }, season: { ko: '봄/가을', zh: '春/秋', en: 'Spring/Fall' } },
]

const TRANSPORT = [
  { name: 'T-money', icon: CreditCard, info: [
    { ko: '편의점(CU/GS25/세븐일레븐)에서 구매 가능', zh: '可在便利店（CU/GS25/7-Eleven）购买', en: 'Buy at convenience stores (CU/GS25/7-Eleven)' },
    { ko: '카드 가격: ₩2,500 (충전 별도)', zh: '卡价：₩2,500（充值另付）', en: 'Card: ₩2,500 (top-up separate)' },
    { ko: '지하철, 버스, 택시, 편의점 결제 가능', zh: '可用于地铁、公交、出租车、便利店支付', en: 'Works on subway, bus, taxi, convenience stores' },
    { ko: '환불: 편의점에서 잔액 환불 (수수료 ₩500)', zh: '退款：可在便利店退还余额（手续费₩500）', en: 'Refund: at convenience stores (₩500 fee)' },
  ]},
  { name: { ko: '지하철', zh: '地铁', en: 'Subway' }, icon: Train, info: [
    { ko: '서울: 1~9호선 + 신분당선 + 경의중앙 등', zh: '首尔：1~9号线+新盆唐线+京义中央线等', en: 'Seoul: Lines 1-9 + Sinbundang + more' },
    { ko: '부산: 1~4호선', zh: '釜山：1~4号线', en: 'Busan: Lines 1-4' },
    { ko: '기본요금: ₩1,500 (T-money) / ₩1,600 (1회권)', zh: '基本票价：₩1,500（T-money）/ ₩1,600（单程票）', en: 'Base fare: ₩1,500 (T-money) / ₩1,600 (single ticket)' },
    { ko: '운행시간: 05:30~24:00', zh: '运营时间：05:30~24:00', en: 'Hours: 05:30~24:00' },
  ]},
  { name: 'KTX', icon: Train, info: [
    { ko: '서울→부산: 2시간 30분, ₩63,500', zh: '首尔→釜山：2小时30分，₩63,500', en: 'Seoul→Busan: 2.5h, ₩63,500' },
    { ko: '서울→대전: 1시간, ₩23,700', zh: '首尔→大田：1小时，₩23,700', en: 'Seoul→Daejeon: 1h, ₩23,700' },
    { ko: '서울→광주: 1시간 30분, ₩42,600', zh: '首尔→光州：1小时30分，₩42,600', en: 'Seoul→Gwangju: 1.5h, ₩42,600' },
    { ko: '예매: 코레일앱 / SRT앱 / 역 창구', zh: '预订：Korail APP / SRT APP / 车站窗口', en: 'Book: Korail app / SRT app / station counter' },
  ]},
  { name: { ko: '택시', zh: '出租车', en: 'Taxi' }, icon: Car, isTaxiGuide: true },
  { name: { ko: '따릉이 (서울)', zh: '叮铃铃（首尔）', en: 'Ttareungyi (Seoul)' }, icon: Bike, info: [
    { ko: '서울시 공공자전거, 1시간 ₩1,000', zh: '首尔市公共自行车，1小时₩1,000', en: 'Seoul public bike, 1h ₩1,000' },
    { ko: '앱 다운로드 → 가입 → 대여/반납', zh: '下载APP→注册→租借/归还', en: 'Download app → register → rent/return' },
    { ko: '외국인 등록 가능 (여권 번호)', zh: '外国人可注册（护照号码）', en: 'Foreigners can register (passport number)' },
  ]},
]

const ACCOMMODATIONS = [
  { type: { ko: '호텔', zh: '酒店', en: 'Hotel' }, price: '₩100,000~500,000+', platforms: 'Booking.com, Hotels.com, Agoda', tips: { ko: '시설 최상급. 체크인 시 여권 필수.', zh: '设施最高级。入住时需要护照。', en: 'Top facilities. Passport required at check-in.' } },
  { type: { ko: '모텔', zh: '汽车旅馆', en: 'Motel' }, price: '₩40,000~80,000', platforms: { ko: '야놀자, 여기어때', zh: 'Yanolja, 여기어때', en: 'Yanolja, Yeogi Eottae' }, tips: { ko: '깨끗하고 저렴. 커플 위주이지만 1인도 가능.', zh: '干净便宜。以情侣为主但也可一人入住。', en: 'Clean and cheap. Couple-oriented but singles OK.' } },
  { type: { ko: '게스트하우스', zh: '民宿', en: 'Guesthouse' }, price: '₩20,000~40,000', platforms: 'Hostelworld, Booking.com', tips: { ko: '배낭여행자에게 추천. 공용시설. 다국적 교류.', zh: '推荐背包客。公共设施。多国交流。', en: 'Great for backpackers. Shared facilities. International mix.' } },
  { type: { ko: '에어비앤비', zh: 'Airbnb', en: 'Airbnb' }, price: '₩50,000~150,000', platforms: 'Airbnb', tips: { ko: '현지 생활 체험. 장기 숙박 할인.', zh: '体验当地生活。长期住宿有折扣。', en: 'Local living experience. Long-stay discounts.' } },
  { type: { ko: '한옥스테이', zh: '韩屋住宿', en: 'Hanok Stay' }, price: '₩80,000~200,000', platforms: { ko: '한국관광공사, 에어비앤비', zh: '韩国旅游发展局, Airbnb', en: 'Korea Tourism Org, Airbnb' }, tips: { ko: '전통 한옥 체험. 온돌 난방. 북촌/전주 추천.', zh: '传统韩屋体验。暖炕取暖。推荐北村/全州。', en: 'Traditional hanok experience. Ondol heating. Bukchon/Jeonju recommended.' } },
]

const ITINERARIES = [
  { name: { ko: '3일 서울 집중', zh: '3天首尔深度游', en: '3-Day Seoul Focus' }, days: [
    { day: 1, plan: { ko: '경복궁 → 북촌한옥마을 → 인사동 → 광장시장 (저녁)', zh: '景福宫→北村韩屋村→仁寺洞→广藏市场（晚餐）', en: 'Gyeongbokgung → Bukchon → Insadong → Gwangjang Market (dinner)' } },
    { day: 2, plan: { ko: '명동 쇼핑 → N서울타워 → 이태원 → 한강공원 (야경)', zh: '明洞购物→N首尔塔→梨泰院→汉江公园（夜景）', en: 'Myeongdong shopping → N Seoul Tower → Itaewon → Hangang Park (night)' } },
    { day: 3, plan: { ko: '홍대 거리 → 연남동 카페 → 여의도 → DDP (동대문디자인플라자)', zh: '弘大街区→延南洞咖啡→汝矣岛→DDP（东大门设计广场）', en: 'Hongdae → Yeonnam-dong cafes → Yeouido → DDP' } },
  ]},
  { name: { ko: '5일 서울+부산', zh: '5天首尔+釜山', en: '5-Day Seoul+Busan' }, days: [
    { day: 1, plan: { ko: '서울: 경복궁 → 북촌 → 명동', zh: '首尔：景福宫→北村→明洞', en: 'Seoul: Gyeongbokgung → Bukchon → Myeongdong' } },
    { day: 2, plan: { ko: '서울: 홍대 → N서울타워 → 한강', zh: '首尔：弘大→N首尔塔→汉江', en: 'Seoul: Hongdae → N Seoul Tower → Hangang' } },
    { day: 3, plan: { ko: '서울: 이태원 → 성수동 카페 → DDP', zh: '首尔：梨泰院→圣水洞咖啡→DDP', en: 'Seoul: Itaewon → Seongsu cafes → DDP' } },
    { day: 4, plan: { ko: 'KTX→부산 (2.5h) → 해운대 → 광안리 야경', zh: 'KTX→釜山（2.5h）→海云台→广安里夜景', en: 'KTX→Busan (2.5h) → Haeundae → Gwangalli night' } },
    { day: 5, plan: { ko: '감천문화마을 → 자갈치시장 → 해동용궁사 → 귀국', zh: '甘川文化村→扎嘎其市场→海东龙宫寺→回国', en: 'Gamcheon Village → Jagalchi → Haedong Yonggungsa → depart' } },
  ]},
  { name: { ko: '7일 전국일주', zh: '7天全国环游', en: '7-Day Korea Tour' }, days: [
    { day: 1, plan: { ko: '서울 도착 → 명동/광장시장', zh: '到达首尔→明洞/广藏市场', en: 'Arrive Seoul → Myeongdong/Gwangjang Market' } },
    { day: 2, plan: { ko: '서울: 경복궁 → 북촌 → N서울타워', zh: '首尔：景福宫→北村→N首尔塔', en: 'Seoul: Gyeongbokgung → Bukchon → N Seoul Tower' } },
    { day: 3, plan: { ko: 'KTX→대전 (1h) → 유성온천 → 성심당 빵', zh: 'KTX→大田（1h）→儒城温泉→圣心堂面包', en: 'KTX→Daejeon (1h) → Yuseong hot springs → Sungsimdang bakery' } },
    { day: 4, plan: { ko: '버스→경주 → 불국사 → 석굴암 → 안압지 야경', zh: '巴士→庆州→佛国寺→石窟庵→雁鸭池夜景', en: 'Bus→Gyeongju → Bulguksa → Seokguram → Anapji night' } },
    { day: 5, plan: { ko: '버스→부산 → 해운대 → 감천문화마을', zh: '巴士→釜山→海云台→甘川文化村', en: 'Bus→Busan → Haeundae → Gamcheon Village' } },
    { day: 6, plan: { ko: '부산: 자갈치 → 광안리 → 해동용궁사', zh: '釜山：扎嘎其→广安里→海东龙宫寺', en: 'Busan: Jagalchi → Gwangalli → Haedong Yonggungsa' } },
    { day: 7, plan: { ko: '비행기→제주 (1h) → 성산일출봉 → 협재해변', zh: '飞机→济州（1h）→城山日出峰→挟才海滩', en: 'Flight→Jeju (1h) → Seongsan Ilchulbong → Hyeopjae Beach' } },
  ]},
]

const PARKS = [
  { name: { ko: '에버랜드', zh: '爱宝乐园', en: 'Everland' }, location: { ko: '경기도 용인시', zh: '京畿道龙仁市', en: 'Yongin, Gyeonggi' }, hours: '10:00~21:00', price: { adult: '₩62,000', child: '₩49,000' }, access: { ko: '강남역에서 셔틀버스 40분', zh: '从江南站乘班车40分钟', en: 'Shuttle bus 40min from Gangnam' }, tips: { ko: '한국 최대 테마파크. 사파리, 우든코스터 유명. 평일 추천.', zh: '韩国最大主题公园。以野生动物园、木质过山车闻名。建议平日去。', en: 'Korea\'s largest theme park. Famous for safari, wooden coaster. Weekdays recommended.' } },
  { name: { ko: '롯데월드', zh: '乐天世界', en: 'Lotte World' }, location: { ko: '서울 송파구 잠실', zh: '首尔松坡区蚕室', en: 'Jamsil, Songpa-gu, Seoul' }, hours: '10:00~21:00', price: { adult: '₩62,000', child: '₩49,000' }, access: { ko: '지하철 2/8호선 잠실역 직결', zh: '地铁2/8号线蚕室站直达', en: 'Subway Line 2/8 Jamsil Stn direct' }, tips: { ko: '세계 최대 실내 테마파크. 비 와도 OK. 석촌호수 벚꽃도 함께.', zh: '世界最大室内主题公园。下雨也可以玩。石村湖樱花也可一起看。', en: 'World\'s largest indoor theme park. Rain-proof. Seokchon Lake cherry blossoms nearby.' } },
  { name: { ko: '서울랜드', zh: '首尔乐园', en: 'Seoul Land' }, location: { ko: '경기도 과천시', zh: '京畿道果川市', en: 'Gwacheon, Gyeonggi' }, hours: '10:00~18:00', price: { adult: '₩46,000', child: '₩36,000' }, access: { ko: '지하철 4호선 대공원역 도보 10분', zh: '地铁4号线大公园站步行10分钟', en: 'Subway Line 4 Grand Park Stn, 10min walk' }, tips: { ko: '서울대공원 동물원과 함께 방문 추천. 가족 단위 인기.', zh: '建议与首尔大公园动物园一起参观。家庭游客受欢迎。', en: 'Visit with Seoul Grand Park Zoo. Popular for families.' } },
  { name: { ko: '레고랜드', zh: '乐高乐园', en: 'Legoland Korea' }, location: { ko: '강원도 춘천시', zh: '江原道春川市', en: 'Chuncheon, Gangwon' }, hours: '10:00~18:00', price: { adult: '₩50,000', child: '₩40,000' }, access: { ko: 'ITX-청춘 춘천역 → 셔틀버스', zh: 'ITX-青春春川站→班车', en: 'ITX-Cheongchun to Chuncheon → shuttle' }, tips: { ko: '2022년 개장. 레고 테마. 어린이에게 최적. 닭갈비 거리도 함께.', zh: '2022年开业。乐高主题。最适合儿童。还可以去春川鸡排一条街。', en: 'Opened 2022. Lego theme. Best for kids. Visit Chuncheon dakgalbi street too.' } },
  { name: { ko: '경주월드', zh: '庆州世界', en: 'Gyeongju World' }, location: { ko: '경북 경주시 보문단지', zh: '庆北庆州市普门园区', en: 'Bomun Complex, Gyeongju' }, hours: '10:00~18:00', price: { adult: '₩42,000', child: '₩33,000' }, access: { ko: 'KTX 신경주역 → 버스 30분', zh: 'KTX新庆州站→巴士30分钟', en: 'KTX Singyeongju → bus 30min' }, tips: { ko: '경주 관광과 연계 추천. 불국사, 석굴암 후 방문.', zh: '建议与庆州观光结合。参观佛国寺、石窟庵后前往。', en: 'Combine with Gyeongju sightseeing. Visit after Bulguksa, Seokguram.' } },
]

const CURATION_CATEGORIES = [
  { id: 'all', name: { ko: '전체', zh: '全部', en: 'All' } },
  { id: 'cafe', name: { ko: '카페 덕후', zh: '咖啡爱好者', en: 'Cafe Lover' } },
  { id: 'kdrama', name: { ko: 'K-드라마 성지순례', zh: 'K-剧圣地巡礼', en: 'K-Drama Spots' } },
  { id: 'subculture', name: { ko: '서브컬처', zh: '亚文化', en: 'Subculture' } },
  { id: 'mainstream', name: { ko: '메인스트림', zh: '主流文化', en: 'Mainstream' } },
]

const CURATION_SPOTS = [
  // 카페 덕후
  { id: 'onion-cafe', name: { ko: '어니언', zh: 'Onion', en: 'Onion' }, category: 'cafe', location: { ko: '성동구 성수동', zh: '城东区圣水洞', en: 'Seongdong-gu Seongsu-dong' }, desc: { ko: '공장을 개조한 독특한 인테리어의 로스터리 카페', zh: '改造工厂的独特室内设计烘焙咖啡店', en: 'Unique roastery cafe in converted factory space' }, price: '₩8,000-12,000', tags: ['카페', '로스터리', '인테리어'], image: '/images/onion-cafe.jpg' },
  { id: 'takeoutdrawing', name: { ko: '테이크아웃드로잉', zh: 'Takeout Drawing', en: 'Takeout Drawing' }, category: 'cafe', location: { ko: '마포구 연남동', zh: '麻浦区延南洞', en: 'Mapo-gu Yeonnam-dong' }, desc: { ko: '만화책 읽으며 차 마시는 독립 서점 카페', zh: '可以边看漫画边喝茶的独立书店咖啡馆', en: 'Independent bookstore cafe where you can read manga while drinking tea' }, price: '₩7,000-10,000', tags: ['서점', '카페', '만화'], image: '/images/takeoutdrawing.jpg' },
  { id: 'kong-cafe', name: { ko: '콩', zh: '콩', en: 'Kong' }, category: 'cafe', location: { ko: '종로구 익선동', zh: '钟路区益善洞', en: 'Jongno-gu Ikseon-dong' }, desc: { ko: '한옥을 개조한 감성 카페', zh: '改造韩屋的感性咖啡馆', en: 'Emotional cafe in renovated hanok' }, price: '₩6,000-9,000', tags: ['한옥', '전통', '감성'], image: '/images/kong-cafe.jpg' },
  
  // K-드라마 성지순례
  { id: 'namsan-tower', name: { ko: 'N서울타워 (별에서 온 그대)', zh: 'N首尔塔（来自星星的你）', en: 'N Seoul Tower (My Love from the Star)' }, category: 'kdrama', location: { ko: '중구 남산동', zh: '中区南山洞', en: 'Jung-gu Namsan-dong' }, desc: { ko: '수많은 드라마의 데이트 신 촬영지', zh: '众多电视剧约会场面的拍摄地', en: 'Filming location for countless drama date scenes' }, price: '₩16,000', tags: ['전망대', '야경', '데이트'], image: '/images/namsan-tower.jpg' },
  { id: 'banpo-hangang', name: { ko: '반포 한강공원 (도깨비)', zh: '盤浦汉江公园（孤单又灿烂的神-鬼怪）', en: 'Banpo Hangang Park (Goblin)' }, category: 'kdrama', location: { ko: '서초구 반포동', zh: '瑞草区盘浦洞', en: 'Seocho-gu Banpo-dong' }, desc: { ko: '도깨비 등 인기 드라마 촬영지', zh: '《鬼怪》等热门电视剧拍摄地', en: 'Filming location for popular dramas like Goblin' }, price: '무료', tags: ['한강', '공원', '야경'], image: '/images/banpo-hangang.jpg' },
  { id: 'gyeongbokgung-drama', name: { ko: '경복궁 (대장금, 사극)', zh: '景福宫（大长今、史剧）', en: 'Gyeongbokgung (Dae Jang Geum, Historical)' }, category: 'kdrama', location: { ko: '종로구 세종로', zh: '钟路区世宗路', en: 'Jongno-gu Sejong-ro' }, desc: { ko: '사극 드라마의 단골 촬영지', zh: '古装剧的常用拍摄地', en: 'Regular filming location for historical dramas' }, price: '₩3,000', tags: ['궁궐', '사극', '한복'], image: '/images/gyeongbokgung.jpg' },

  // 서브컬처
  { id: 'amado-artspace', name: { ko: '아마도 예술공간', zh: 'Amado艺术空间', en: 'Amado Art Space' }, category: 'subculture', location: { ko: '용산구 한남동', zh: '龙山区汉南洞', en: 'Yongsan-gu Hannam-dong' }, desc: { ko: '실험적 현대미술을 선보이는 대안공간', zh: '展示实验性当代艺术的替代空间', en: 'Alternative space showcasing experimental contemporary art' }, price: '무료-₩5,000', tags: ['갤러리', '현대미술', '실험'], image: '/images/amado-artspace.jpg' },
  { id: 'dongmyo-vintage', name: { ko: '동묘 빈티지 마켓', zh: '东庙古着市场', en: 'Dongmyo Vintage Market' }, category: 'subculture', location: { ko: '종로구 숭인동', zh: '钟路区崇仁洞', en: 'Jongno-gu Sungin-dong' }, desc: { ko: '매주 토요일 열리는 빈티지 플리마켓', zh: '每周六举办的古着跳蚤市场', en: 'Vintage flea market held every Saturday' }, price: '₩5,000-50,000', tags: ['빈티지', '플리마켓', '토요일'], image: '/images/dongmyo-vintage.jpg' },
  { id: 'club-mood', name: { ko: '클럽 무드', zh: 'Club Mood', en: 'Club Mood' }, category: 'subculture', location: { ko: '강남구 논현동', zh: '江南区论岘洞', en: 'Gangnam-gu Nonhyeon-dong' }, desc: { ko: '언더그라운드 테크노 클럽', zh: '地下电子音乐俱乐部', en: 'Underground techno club' }, price: '₩20,000-30,000', tags: ['클럽', '테크노', '언더그라운드'], image: '/images/club-mood.jpg' },

  // 메인스트림
  { id: 'hybe-insight', name: { ko: '하이브 인사이트', zh: 'HYBE Insight', en: 'HYBE Insight' }, category: 'mainstream', location: { ko: '용산구 한남동', zh: '龙山区汉南洞', en: 'Yongsan-gu Hannam-dong' }, desc: { ko: 'BTS 소속사 하이브의 공식 박물관', zh: 'BTS所属公司HYBE的官方博物馆', en: 'Official museum of BTS agency HYBE' }, price: '₩25,000', tags: ['BTS', 'K-POP', '박물관'], image: '/images/hybe-insight.jpg' },
  { id: 'myeongdong-street', name: { ko: '명동 거리', zh: '明洞街', en: 'Myeongdong Street' }, category: 'mainstream', location: { ko: '중구 명동', zh: '中区明洞', en: 'Jung-gu Myeongdong' }, desc: { ko: '쇼핑과 먹거리의 중심지', zh: '购物和美食的中心地', en: 'Center of shopping and food' }, price: '₩50,000-200,000', tags: ['쇼핑', 'K-뷰티', '관광'], image: '/images/myeongdong.jpg' },
  { id: 'samgyeopsal', name: { ko: '한국식 바비큐 (삼겹살)', zh: '韩式烤肉（五花肉）', en: 'Korean BBQ (Samgyeopsal)' }, category: 'mainstream', location: { ko: '서울 전역', zh: '首尔全境', en: 'Seoul wide' }, desc: { ko: '한국 대표 음식, 고기를 구워 먹는 문화', zh: '韩国代表性食物，烤肉饮食文化', en: 'Representative Korean food, grilling meat culture' }, price: '₩25,000-50,000', tags: ['음식', '고기', '회식문화'], image: '/images/samgyeopsal.jpg' },
]

// 입국카드 항목 데이터 (상세)
const ARRIVAL_CARD_FIELDS = [
  {
    icon: User, color: '#2563EB',
    label: { zh: '姓 Family Name', ko: '성(영문)', en: 'Family Name' },
    example: 'ZHANG',
    hint: { zh: '护照上的英文姓氏，大写', ko: '여권상 영문 성, 대문자', en: 'Surname as on passport, uppercase' },
    width: 'half', num: '\u2460'
  },
  {
    icon: User, color: '#2563EB',
    label: { zh: '名 Given Name', ko: '이름(영문)', en: 'Given Name' },
    example: 'XIAOMING',
    hint: { zh: '护照上的英文名字，大写', ko: '여권상 영문 이름, 대문자', en: 'First name as on passport, uppercase' },
    width: 'half', num: '\u2461'
  },
  {
    icon: Globe, color: '#7C3AED',
    label: { zh: '国籍 Nationality', ko: '국적', en: 'Nationality' },
    example: 'CHINA',
    hint: { zh: '写 CHINA 或 CHINESE', ko: 'CHINA 또는 CHINESE', en: 'Write CHINA or CHINESE' },
    width: 'half', num: '\u2462'
  },
  {
    icon: Calendar, color: '#D97706',
    label: { zh: '出生日期 Date of Birth', ko: '생년월일', en: 'Date of Birth' },
    example: '1995-03-15',
    hint: { zh: '格式：年-月-日（YYYY-MM-DD）', ko: '형식: 년-월-일 (YYYY-MM-DD)', en: 'Format: YYYY-MM-DD' },
    width: 'half', num: '\u2463'
  },
  {
    icon: Users, color: '#EC4899',
    label: { zh: '性别 Gender', ko: '성별', en: 'Gender' },
    example: 'M / F',
    hint: { zh: '男 = M (Male)  女 = F (Female)', ko: '남 = M / 여 = F', en: 'M = Male / F = Female' },
    width: 'half', num: '\u2464'
  },
  {
    icon: FileText, color: '#059669',
    label: { zh: '护照号码 Passport No.', ko: '여권번호', en: 'Passport No.' },
    example: 'E12345678',
    hint: { zh: '护照首页上方的号码（E开头+8位数字）', ko: '여권 첫페이지 상단 번호', en: 'Number on passport data page' },
    width: 'half', num: '\u2465'
  },
  {
    icon: Plane, color: '#0EA5E9',
    label: { zh: '航班号 Flight No.', ko: '항공편명', en: 'Flight No.' },
    example: 'CA135 / OZ312',
    hint: { zh: '登机牌上的航班号，如 CA135', ko: '탑승권의 편명, 예: CA135', en: 'Flight number on boarding pass' },
    width: 'half', num: '\u2466'
  },
  {
    icon: Home, color: '#8B5CF6',
    label: { zh: '在韩住所 Address in Korea', ko: '한국 내 체류지', en: 'Address in Korea' },
    example: 'Lotte Hotel Seoul',
    hint: { zh: '写酒店名就行！不需要详细地址', ko: '호텔명만 쓰면 됩니다!', en: 'Hotel name is enough!' },
    width: 'full', num: '\u2467', important: true
  },
  {
    icon: Target, color: '#DC2626',
    label: { zh: '入境目的 Purpose of Visit', ko: '입국목적', en: 'Purpose of Visit' },
    example: 'TOURISM',
    hint: { zh: '旅游=TOURISM / 商务=BUSINESS / 留学=STUDY / 工作=EMPLOYMENT', ko: '관광=TOURISM / 상용=BUSINESS / 유학=STUDY', en: 'TOURISM / BUSINESS / STUDY / EMPLOYMENT' },
    width: 'full', num: '\u2468'
  },
  {
    icon: PenLine, color: '#374151',
    label: { zh: '签名 Signature', ko: '서명', en: 'Signature' },
    example: { zh: '张小明', ko: 'ZHANG XIAOMING', en: 'ZHANG XIAOMING' },
    hint: { zh: '与护照签名保持一致！可以签中文名', ko: '여권 서명과 동일하게!', en: 'Same as passport signature' },
    width: 'full', num: '\u2469', important: true
  },
]

// 입국카드 자주 하는 실수
const ARRIVAL_CARD_MISTAKES = [
  { zh: '用小写字母填写 → 必须全部大写 (ZHANG, 不是 Zhang)', ko: '소문자 사용 → 반드시 대문자 (ZHANG)', en: 'Using lowercase → Must be all CAPS' },
  { zh: '住址写"不知道" → 写酒店名或Airbnb名即可', ko: '주소에 "모름" → 호텔명이나 Airbnb명', en: 'Unknown address → Write hotel name' },
  { zh: '签名和护照不一样 → 可能被退回重填', ko: '서명이 여권과 다름 → 반려될 수 있음', en: 'Signature mismatch → May be rejected' },
  { zh: '航班号漏写 → 看登机牌或机票确认邮件', ko: '편명 미기재 → 탑승권 또는 예약확인 메일 확인', en: 'Missing flight no. → Check boarding pass' },
  { zh: '日期格式错误 → 统一用 YYYY-MM-DD', ko: '날짜 형식 오류 → YYYY-MM-DD 사용', en: 'Wrong date format → Use YYYY-MM-DD' },
]

// 반려동물 반입 가이드 — 3단계 타임라인 (상세)
const PET_GUIDE_STEPS = [
  {
    id: 0,
    phase: { zh: '第1步：出发前准备', ko: '1단계: 출발 전 준비' },
    sub: { zh: '（至少提前3~4个月）', ko: '(최소 3~4개월 전)' },
    color: '#7C3AED',
    items: [
      { zh: '植入微芯片（ISO 11784/85标准，15位数字）', ko: '마이크로칩 이식 (ISO 11784/85, 15자리)' },
      { zh: '接种狂犬疫苗 → 接种后至少经过21天', ko: '광견병 백신 접종 → 접종 후 최소 21일 경과' },
      { zh: 'FAVN抗体检测（≥0.5 IU/mL，有效期1年）', ko: 'FAVN 항체검사 (0.5 IU/mL 이상, 유효 1년)' },
      { zh: '预订航班 + 确认航空公司宠物同行政策', ko: '항공사 예약 + 반려동물 동반 확인' },
      { zh: '出发前7天内：在中国海关办理《动物卫生证明书》', ko: '출발 7일 이내: 중국 해관에서 《动物卫生证明书》 발급' },
      { zh: '航空公司规定：大韩航空（客舱7kg,舱内1只+托运2只）、韩亚航空（客舱7kg,舱内1只+托运2只）、中国东方航空（不可客舱,仅托运1只）', ko: '항공사별 규정: 대한항공(기내7kg,기내1+위탁2), 아시아나항공(기내7kg,기내1+위탁2), 중국동방항공(기내불가,위탁1)' },
      { zh: '⚠️ 短头犬（斗牛犬、巴哥等）大多数航空公司限制搭乘', ko: '⚠️ 단두종(불독·퍼그 등) 대부분 항공사 탑승 제한' },
    ],
  },
  {
    id: 1,
    phase: { zh: '第2步：出国当天', ko: '2단계: 출국 당일' },
    sub: null,
    color: '#2563EB',
    items: [
      { zh: '提前2~3小时到达机场', ko: '출발 2~3시간 전 공항 도착' },
      { zh: '航空箱准备：底部铺尿垫+毯子，安装饮水器', ko: '이동장: 바닥 기저귀+담요, 물통 설치' },
      { zh: '在航空公司柜台确认宠物同行手续', ko: '항공사 카운터에서 동반탑승 확인' },
    ],
  },
  {
    id: 2,
    phase: { zh: '第3步：韩国入境（仁川机场）', ko: '3단계: 한국 도착 (인천공항)' },
    sub: null,
    color: '#059669',
    items: [
      { zh: '出入境大厅前往"动物检疫官室"', ko: '입국장 나오기 전 "动物检疫官室" 방문' },
      { zh: '提交文件：芯片信息 + 抗体检测报告 + 动物卫生证明书', ko: '서류 제출: 칩정보 + 항체검사 + 动物卫生证明书' },
      { zh: '审查通过 → 入境 / 文件不全 → 隔离（最长10天）', ko: '심사 통과 → 입국 / 미비 시 격리(최대 10일)' },
    ],
  },
]

const PET_AIRLINE_TABLE = [
  { airline: { zh: '大韩航空', ko: '대한항공' }, cabin: true, weight: '7kg', note: { zh: '机舱1只+托运2只', ko: '기내1+위탁2' } },
  { airline: { zh: '韩亚航空', ko: '아시아나항공' }, cabin: true, weight: '7kg', note: { zh: '机舱1只+托运2只', ko: '기내1+위탁2' } },
  { airline: { zh: '中国东方航空', ko: '중국동방항공' }, cabin: false, weight: '-', note: { zh: '仅限托运1只', ko: '위탁1만 가능' } },
]

const PET_KOREA_TIPS = [
  { zh: 'KTX/地铁：航空箱+动物合计10kg以下可乘坐', ko: 'KTX/지하철: 이동장+동물 10kg 이하만 가능' },
  { zh: '公交车：各公司规定不同，请提前确认', ko: '버스: 회사마다 다름, 사전 확인' },
  { zh: '出租车：可使用Kakao T宠物出租车', ko: '택시: 카카오T 펫택시 이용 가능' },
  { zh: '宠物同行咖啡厅/餐厅/住宿正在增加', ko: '반려동물 동반 카페/식당/숙소 증가 중' },
  { zh: '礼仪：必须使用牵引绳+胸背带，随身携带拾便袋', ko: '에티켓: 목줄+하네스, 배변봉투 필수' },
]

const PET_COSTS = [
  { item: { zh: '疫苗+抗体检测', ko: '백신+항체검사' }, cny: '¥800~2,000', krw: '약 15~30만원' },
  { item: { zh: '动物卫生证明书', ko: '动物卫生证明书' }, cny: '¥200~500', krw: '약 3~8만원' },
  { item: { zh: '航空运输费', ko: '항공 운송료' }, cny: '¥700~1,700', krw: '약 10~25만원' },
  { item: { zh: '委托专业公司（全程代办）', ko: '전문업체 이용 시 (전체 대행)' }, cny: '¥13,000~27,000', krw: '약 200~400만원' },
]

const PET_HOTLINES = [
  { name: { zh: '农林畜产检疫本部', ko: '농림축산검역본부' }, tel: '054-912-0631', desc: { zh: '宠物检疫政策咨询', ko: '반려동물 검역 정책 문의' } },
  { name: { zh: '仁川机场动物检疫', ko: '인천공항 동물검역' }, tel: '032-740-2660', desc: { zh: '入境检疫现场咨询', ko: '입국 검역 현장 문의' } },
]

const card = "bg-white rounded-2xl p-5 border border-[#E5E7EB] card-glow"

// 개인화 추천을 위한 사용자 관심사 추적
function getUserInterests() {
  try { return JSON.parse(localStorage.getItem('travel_interests') || '{}') } catch { return {} }
}

function saveUserInterest(category) {
  const interests = getUserInterests()
  interests[category] = (interests[category] || 0) + 1
  localStorage.setItem('travel_interests', JSON.stringify(interests))
}

// === Taxi Guide Component ===
const TAXI_TYPES = [
  { type: { ko: '일반택시 (주황/은색)', zh: '普通出租车（橙色/银色）', en: 'Regular Taxi (Orange/Silver)' }, base: '₩5,200', note: { ko: '가장 흔함. 길에서 잡거나 택시 승강장', zh: '最常见。路边招手或出租车站', en: 'Most common. Hail on street or taxi stand' } },
  { type: { ko: '모범택시 (검정)', zh: '模范出租车（黑色）', en: 'Deluxe Taxi (Black)' }, base: '₩7,000', note: { ko: '넓고 편안. 기사 경력 10년+', zh: '宽敞舒适。司机10年以上经验', en: 'Spacious. Drivers with 10+ years experience' } },
  { type: { ko: '대형택시 (검정·밴)', zh: '大型出租车（黑色·面包车）', en: 'Jumbo Taxi (Black Van)' }, base: '₩7,000', note: { ko: '6~9인승. 짐 많을 때 추천', zh: '6~9人座。行李多时推荐', en: '6-9 seats. Good for lots of luggage' } },
  { type: { ko: '국제택시', zh: '国际出租车', en: 'International Taxi' }, base: { ko: '요금 다양', zh: '费用不等', en: 'Varies' }, note: { ko: '중국어/영어 기사. 예약 필수', zh: '中文/英语司机。需预约', en: 'Chinese/English drivers. Reservation required' } },
]

const TAXI_HOTLINES = [
  { name: { ko: '국제택시 예약', zh: '国际出租车预约', en: 'Intl Taxi Reservation' }, tel: '1644-2255', desc: { ko: '중국어·영어 가능, 사전 예약', zh: '可用中文·英语，需提前预约', en: 'Chinese/English available, advance booking' } },
  { name: { ko: '서울 외국인 콜택시', zh: '首尔外国人叫车', en: 'Seoul Foreigner Call Taxi' }, tel: '02-1688-0120', desc: { ko: '외국어 상담 후 택시 배차', zh: '外语咨询后派车', en: 'Foreign language support, dispatch' } },
  { name: { ko: '관광불편신고 (24시간)', zh: '旅游投诉（24小时）', en: 'Tourist Complaint (24h)' }, tel: '1330', desc: { ko: '택시 바가지, 승차거부 등 신고', zh: '出租车宰客、拒载等投诉', en: 'Overcharging, refusal to ride, etc.' } },
]

const SHOW_DRIVER_PHRASES = [
  { situation: { ko: '목적지 알려주기', zh: '告诉目的地', en: 'Tell destination' }, korean: '여기로 가주세요', pinyin: 'yeo-gi-ro ga-ju-se-yo' },
  { situation: { ko: '미터기 켜주세요', zh: '请打表', en: 'Turn on meter' }, korean: '미터기 켜주세요', pinyin: 'mi-teo-gi kyeo-ju-se-yo' },
  { situation: { ko: '여기서 세워주세요', zh: '请在这里停车', en: 'Stop here' }, korean: '여기서 세워주세요', pinyin: 'yeo-gi-seo se-weo-ju-se-yo' },
  { situation: { ko: '영수증 주세요', zh: '请给我收据', en: 'Give me receipt' }, korean: '영수증 주세요', pinyin: 'yeong-su-jeung ju-se-yo' },
  { situation: { ko: '카드로 결제할게요', zh: '我用卡支付', en: 'Pay by card' }, korean: '카드로 결제할게요', pinyin: 'ka-deu-ro gyeol-je-hal-ge-yo' },
  { situation: { ko: '트렁크 열어주세요', zh: '请打开后备箱', en: 'Open trunk' }, korean: '트렁크 열어주세요', pinyin: 'teu-reong-keu yeo-reo-ju-se-yo' },
]

function TaxiGuide({ lang, card }) {
  const [copiedIdx, setCopiedIdx] = useState(null)
  const [showDriverCard, setShowDriverCard] = useState(false)
  const [driverCardDest, setDriverCardDest] = useState('')

  const copyText = (text, idx) => {
    navigator.clipboard.writeText(text).catch(() => {})
    setCopiedIdx(idx)
    setTimeout(() => setCopiedIdx(null), 1500)
  }

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className={card}>
        <h3 className="text-sm font-bold text-[#111827] flex items-center gap-2 mb-2">
          <Car size={16} />
          {L(lang, { ko: '🚕 택시 완전 가이드', zh: '🚕 出租车完全指南', en: '🚕 Complete Taxi Guide' })}
        </h3>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-2.5 mb-3">
          <p className="text-xs text-blue-700 font-medium">
            {L(lang, {
              ko: '💡 한국번호 없어도 택시 이용 가능! 길에서 잡거나, 국제택시 전화 예약하세요.',
              zh: '💡 没有韩国手机号也能坐出租车！路边招手或预约国际出租车。',
              en: '💡 No Korean phone needed! Hail on street or book an international taxi.'
            })}
          </p>
        </div>

        {/* Taxi Types */}
        <div className="space-y-2">
          {TAXI_TYPES.map((t, i) => (
            <div key={i} className="flex items-start gap-2 text-xs">
              <span className="bg-gray-100 text-[#111827] font-bold px-1.5 py-0.5 rounded shrink-0">
                {typeof t.base === 'string' ? t.base : L(lang, t.base)}
              </span>
              <div>
                <span className="font-semibold text-[#111827]">{L(lang, t.type)}</span>
                <p className="text-[#6B7280]">{L(lang, t.note)}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Fare Info */}
      <div className={card}>
        <h4 className="text-xs font-bold text-[#111827] mb-2">
          {L(lang, { ko: '💰 요금 안내', zh: '💰 费用说明', en: '💰 Fare Info' })}
        </h4>
        <div className="space-y-1 text-xs text-[#374151]">
          <p>- {L(lang, { ko: '기본요금: ₩5,200 (서울, 1.6km)', zh: '起步价：₩5,200（首尔，1.6km）', en: 'Base: ₩5,200 (Seoul, 1.6km)' })}</p>
          <p>- {L(lang, { ko: '심야할증: 20% (22:00~04:00)', zh: '夜间加价：20%（22:00~04:00）', en: 'Late night: +20% (22:00~04:00)' })}</p>
          <p>- {L(lang, { ko: '결제: 현금, 신용카드(비자/마스터), T-money', zh: '支付：现金、信用卡（Visa/Master）、T-money', en: 'Payment: Cash, Card (Visa/Master), T-money' })}</p>
          <p>- {L(lang, { ko: '팁 문화 없음 (거스름돈 받으세요!)', zh: '无需小费（请拿好找零！）', en: 'No tipping (take your change!)' })}</p>
        </div>
      </div>

      {/* How to catch */}
      <div className={card}>
        <h4 className="text-xs font-bold text-[#111827] mb-2">
          {L(lang, { ko: '🙋 택시 잡는 법', zh: '🙋 怎么打车', en: '🙋 How to Catch a Taxi' })}
        </h4>
        <div className="space-y-1 text-xs text-[#374151]">
          <p>1. {L(lang, { ko: '도로변에서 빈차(🟢 초록불) 표시 택시에 손 흔들기', zh: '路边向空车（🟢绿灯）招手', en: 'Wave at taxis with 🟢 green light (vacant)' })}</p>
          <p>2. {L(lang, { ko: '지하철역/백화점/호텔 앞 택시 승강장 이용', zh: '在地铁站/百货商店/酒店前的出租车站乘车', en: 'Use taxi stands at subway/dept stores/hotels' })}</p>
          <p>3. {L(lang, { ko: '🔴 빨간불 = 예약됨/탑승 중 (안 서요!)', zh: '🔴红灯=已预约/载客中（不会停！）', en: '🔴 Red light = reserved/occupied (won\'t stop!)' })}</p>
        </div>
      </div>

      {/* Hotlines */}
      <div className={card}>
        <h4 className="text-xs font-bold text-[#111827] mb-2">
          {L(lang, { ko: '📞 전화번호 (바로 전화 가능)', zh: '📞 电话号码（可直接拨打）', en: '📞 Hotlines (tap to call)' })}
        </h4>
        <div className="space-y-2">
          {TAXI_HOTLINES.map((h, i) => (
            <a key={i} href={`tel:${h.tel}`} className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg active:bg-gray-100">
              <Phone size={14} className="text-green-600 shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-[#111827]">{L(lang, h.name)}</p>
                <p className="text-[10px] text-[#6B7280]">{L(lang, h.desc)}</p>
              </div>
              <span className="text-xs font-bold text-green-600 shrink-0">{h.tel}</span>
            </a>
          ))}
        </div>
      </div>

      {/* Show Driver Card - Phrases */}
      <div className={card}>
        <h4 className="text-xs font-bold text-[#111827] mb-2 flex items-center gap-1.5">
          <MessageSquare size={14} />
          {L(lang, { ko: '🗣️ 기사에게 보여주세요', zh: '🗣️ 给司机看', en: '🗣️ Show the Driver' })}
        </h4>
        <div className="space-y-1.5">
          {SHOW_DRIVER_PHRASES.map((p, i) => (
            <button key={i} onClick={() => copyText(p.korean, i)}
              className="w-full flex items-center gap-2 p-2 bg-gray-50 rounded-lg text-left active:bg-gray-100">
              <div className="flex-1 min-w-0">
                <p className="text-[10px] text-[#9CA3AF]">{L(lang, p.situation)}</p>
                <p className="text-base font-bold text-[#111827]">{p.korean}</p>
              </div>
              {copiedIdx === i
                ? <Check size={14} className="text-green-500 shrink-0" />
                : <Copy size={14} className="text-[#9CA3AF] shrink-0" />}
            </button>
          ))}
        </div>
      </div>

      {/* Destination Card Generator */}
      <div className={card}>
        <h4 className="text-xs font-bold text-[#111827] mb-2">
          {L(lang, { ko: '📍 목적지 카드 만들기', zh: '📍 生成目的地卡片', en: '📍 Make Destination Card' })}
        </h4>
        <p className="text-[10px] text-[#6B7280] mb-2">
          {L(lang, {
            ko: '목적지를 입력하면 큰 글씨 카드를 만들어 기사에게 보여줄 수 있어요',
            zh: '输入目的地，生成大字卡片给司机看',
            en: 'Enter destination to generate a large-text card for the driver'
          })}
        </p>
        <div className="flex gap-2 mb-2">
          <input
            type="text"
            value={driverCardDest}
            onChange={e => setDriverCardDest(e.target.value)}
            placeholder={L(lang, { ko: '목적지 입력 (한국어/중국어/영어)', zh: '输入目的地（韩语/中文/英语）', en: 'Enter destination' })}
            className="flex-1 text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:border-[#111827]"
          />
          <button
            onClick={() => setShowDriverCard(true)}
            disabled={!driverCardDest.trim()}
            className="px-3 py-2 bg-[#111827] text-white text-xs font-bold rounded-lg disabled:opacity-30"
          >
            {L(lang, { ko: '생성', zh: '生成', en: 'Create' })}
          </button>
        </div>

        {/* Driver Card Display */}
        {showDriverCard && driverCardDest.trim() && (
          <div className="bg-yellow-50 border-2 border-yellow-400 rounded-xl p-6 text-center">
            <p className="text-[10px] text-yellow-600 mb-2">
              {L(lang, { ko: '👇 이 화면을 기사에게 보여주세요', zh: '👇 请把这个画面给司机看', en: '👇 Show this screen to the driver' })}
            </p>
            <p className="text-2xl font-black text-[#111827] mb-2">{driverCardDest}</p>
            <p className="text-lg font-bold text-[#111827]">여기로 가주세요</p>
            <p className="text-sm text-[#6B7280]">请去这里 / Please go here</p>
          </div>
        )}
      </div>

      {/* Safety Tips */}
      <div className="bg-red-50 border border-red-200 rounded-xl p-3">
        <h4 className="text-xs font-bold text-red-700 mb-1.5">
          {L(lang, { ko: '⚠️ 안전 수칙', zh: '⚠️ 安全须知', en: '⚠️ Safety Tips' })}
        </h4>
        <div className="space-y-1 text-[10px] text-red-600">
          <p>- {L(lang, { ko: '반드시 미터기 작동 확인! 안 켜면 "미터기 켜주세요" 요청', zh: '一定确认打表！没打表请要求"请打表"', en: 'Always check meter is on! Ask if not' })}</p>
          <p>- {L(lang, { ko: '택시 번호판 사진 찍어두기 (분쟁 대비)', zh: '拍下车牌号照片（以防纠纷）', en: 'Photo the license plate (for disputes)' })}</p>
          <p>- {L(lang, { ko: '문제 발생 시 1330 전화 (24시간, 중국어 가능)', zh: '遇到问题请打1330（24小时，可用中文）', en: 'Problems? Call 1330 (24h, Chinese available)' })}</p>
        </div>
      </div>
    </div>
  )
}

export default function TravelTab({ lang, setTab, profile }) {
  const [section, setSection] = useState('discover')
  const [expandedCity, setExpandedCity] = useState(null)
  const [tourDetailItem, setTourDetailItem] = useState(null)
  const [userInterests, setUserInterests] = useState(getUserInterests)
  const [favorites, setFavorites] = useState(() => {
    try { return JSON.parse(localStorage.getItem('travel_favorites') || '[]') } catch { return [] }
  })
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [showDiary, setShowDiary] = useState(false)
  const [expandedPetStep, setExpandedPetStep] = useState(0)
  const [taxRefundOpen, setTaxRefundOpen] = useState(null)
  const [activeGuide, setActiveGuide] = useState(null)
  const [selectedCity, setSelectedCity] = useState(null)
  const [selectedSpot, setSelectedSpot] = useState(null)

  const toggleFavorite = (id) => {
    const updated = favorites.includes(id) 
      ? favorites.filter(f => f !== id)
      : [...favorites, id]
    setFavorites(updated)
    localStorage.setItem('travel_favorites', JSON.stringify(updated))
  }

  const trackInterest = (category) => {
    saveUserInterest(category)
    setUserInterests(getUserInterests())
  }

  const filteredSpots = selectedCategory === 'all' 
    ? CURATION_SPOTS 
    : CURATION_SPOTS.filter(spot => spot.category === selectedCategory)

  // Show TravelDiary if diary mode is active
  if (showDiary) {
    return (
      <Suspense fallback={
        <div className="flex items-center justify-center p-8">
          <div className="w-8 h-8 border-4 border-gray-200 rounded-full border-t-blue-500 animate-spin"></div>
        </div>
      }>
        <TravelDiary lang={lang} onBack={() => setShowDiary(false)} />
      </Suspense>
    )
  }

  // SpotDetail 풀스크린
  if (selectedSpot) {
    return (
      <Suspense fallback={null}>
        <SpotDetail
          spot={selectedSpot}
          lang={lang}
          city={selectedCity}
          onBack={() => setSelectedSpot(null)}
          isFavorite={favorites.includes(selectedSpot.id)}
          onToggleFavorite={toggleFavorite}
        />
      </Suspense>
    )
  }

  // CityPage 드릴다운
  if (selectedCity) {
    return (
      <Suspense fallback={
        <div className="flex items-center justify-center p-8">
          <div className="w-8 h-8 border-4 border-gray-200 rounded-full border-t-blue-500 animate-spin"></div>
        </div>
      }>
        <CityPage
          city={selectedCity}
          lang={lang}
          onBack={() => setSelectedCity(null)}
          onSpotClick={setSelectedSpot}
          favorites={favorites}
          onToggleFavorite={toggleFavorite}
        />
      </Suspense>
    )
  }

  return (
    <div className="space-y-4">
      {/* Travel Diary button */}
      <div className="bg-gradient-to-r from-[#111827] to-[#374151] rounded-2xl p-4 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold text-lg mb-1">
              {L(lang, { ko: '내 여행 다이어리', zh: '我的旅行日记', en: 'My Travel Diary' })}
            </h3>
            <p className="text-sm opacity-90">
              {L(lang, { 
                ko: '출국부터 귀국까지 체계적인 일정 관리', 
                zh: '从出境到回国的系统行程管理', 
                en: 'Systematic schedule management from departure to return' 
              })}
            </p>
          </div>
          <button 
            onClick={() => setShowDiary(true)}
            className="flex items-center gap-2 px-4 py-2 bg-white bg-opacity-20 backdrop-blur-sm rounded-lg font-semibold hover:bg-opacity-30 transition-all"
          >
            <BookOpen size={16} />
            {L(lang, { ko: '열기', zh: '打开', en: 'Open' })}
          </button>
        </div>
      </div>

      {/* Section nav */}
      <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1 scrollbar-hide">
        {SECTIONS.map(s => (
          <button key={s.id} onClick={() => setSection(s.id)}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all shrink-0 ${
              section === s.id ? 'bg-[#111827] text-white' : 'bg-[#F3F4F6] text-[#6B7280] hover:bg-[#E5E7EB]'
            }`}>
            {L(lang, s.label)}
          </button>
        ))}
      </div>

      {/* Discover - TourAPI */}
      {section === 'discover' && (
        <Suspense fallback={<div className="flex justify-center py-8"><div className="w-8 h-8 border-4 border-gray-200 rounded-full border-t-blue-500 animate-spin" /></div>}>
          <TourSpotSection
            lang={lang}
            darkMode={false}
            onItemClick={setTourDetailItem}
            title={L(lang, { ko: '한국 여행지 발견', zh: '发现韩国旅游地', en: 'Discover Korea' })}
          />
        </Suspense>
      )}

      {/* Tour Detail Modal */}
      {tourDetailItem && (
        <Suspense fallback={null}>
          <TourDetailModal
            item={tourDetailItem}
            lang={lang}
            darkMode={false}
            onClose={() => setTourDetailItem(null)}
          />
        </Suspense>
      )}

      {/* Guide overlays */}
      {activeGuide && (
        <Suspense fallback={null}>
          {activeGuide === 'arrival-card' && <ArrivalCardGuide lang={lang} onClose={() => setActiveGuide(null)} />}
          {activeGuide === 'sim' && <SimGuide lang={lang} onClose={() => setActiveGuide(null)} />}
          {activeGuide === 'tax-refund' && <TaxRefundGuide lang={lang} onClose={() => setActiveGuide(null)} />}
          {activeGuide === 'duty-free' && <DutyFreeGuide lang={lang} onClose={() => setActiveGuide(null)} />}
        </Suspense>
      )}

      {/* Arrival */}
      {section === 'arrival' && (
        <div className="space-y-4">
          {/* 출입국 가이드 4종 */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-3">
              {L(lang, { ko: '출입국 필수 가이드', zh: '出入境必读指南', en: 'Essential Guides' })}
            </h3>
            <div className="grid grid-cols-2 gap-2">
              {[
                { id: 'arrival-card', emoji: '✈️', name: { ko: '입국카드 작성법', zh: '入境卡填写', en: 'Arrival Card' }, desc: { ko: '기내에서 미리 준비', zh: '飞机上提前准备', en: 'Prepare on the plane' } },
                { id: 'sim', emoji: '📱', name: { ko: 'SIM/eSIM 가이드', zh: 'SIM/eSIM指南', en: 'SIM/eSIM Guide' }, desc: { ko: '도착 즉시 개통', zh: '到达即刻开通', en: 'Get connected on arrival' } },
                { id: 'tax-refund', emoji: '💰', name: { ko: '세금 환급', zh: '退税指南', en: 'Tax Refund' }, desc: { ko: '쇼핑 후 환급받기', zh: '购物后退税', en: 'Get your refund' } },
                { id: 'duty-free', emoji: '🧳', name: { ko: '면세 & 액체류', zh: '免税 & 液体', en: 'Duty-Free & Liquids' }, desc: { ko: '압수 방지 체크리스트', zh: '防没收清单', en: 'Avoid confiscation' } },
              ].map(g => (
                <button key={g.id} onClick={() => setActiveGuide(g.id)}
                  className="bg-white rounded-2xl p-4 border border-[#E5E7EB] text-left transition-all duration-200 active:scale-[0.98] hover:border-[#D1D5DB]">
                  <span className="text-2xl mb-2 block">{g.emoji}</span>
                  <p className="text-sm font-bold text-[#111827] mb-0.5">{L(lang, g.name)}</p>
                  <p className="text-[11px] text-[#6B7280]">{L(lang, g.desc)}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Airports */}
          {AIRPORTS.map(ap => (
            <div key={ap.code} className={card}>
              <h3 className="text-sm font-bold text-[#111827] mb-1">{L(lang, ap.name)} ({ap.code})</h3>
              <p className="text-xs text-[#9CA3AF] mb-3">{lang === 'ko' ? '터미널' : lang === 'zh' ? '航站楼' : 'Terminals'}: {ap.terminals}</p>
              <div className="space-y-2">
                {ap.toCity.map((t, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs">
                    <Navigation size={12} className="text-[#9CA3AF] shrink-0" />
                    <span className="font-semibold text-[#111827]">{L(lang, t.method)}</span>
                    <span className="text-[#6B7280]">{t.time}</span>
                    <span className="font-bold text-[#111827] ml-auto">{t.price}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}

          {/* ✈️ 실시간 항공편 조회 */}
          <Suspense fallback={<div className="flex justify-center py-4"><div className="w-6 h-6 border-2 border-gray-200 rounded-full border-t-[#111827] animate-spin" /></div>}>
            <FlightSearchCard lang={lang} />
          </Suspense>

          {/* Immigration steps */}
          <div className={card}>
            <h3 className="text-sm font-bold text-[#111827] mb-3">{L(lang, { ko: '입국 심사 절차', zh: '入境审查流程', en: 'Immigration Process' })}</h3>
            <div className="space-y-2">
              {IMMIGRATION_STEPS.map((step, i) => (
                <div key={i} className="flex items-start gap-2">
                  <span className="text-xs font-bold text-white bg-[#111827] w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5">{i + 1}</span>
                  <p className="text-xs text-[#374151]">{L(lang, step)}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Customs */}
          <div className={card}>
            <h3 className="text-sm font-bold text-[#111827] mb-3 flex items-center gap-2">
              <Shield size={14} />
              {L(lang, { ko: '면세 한도', zh: '免税限额', en: 'Duty-Free Limits' })}
            </h3>
            <div className="space-y-2">
              {CUSTOMS.map((c, i) => (
                <div key={i} className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-[#111827]">{L(lang, c.item)}</span>
                  <span className="text-[#6B7280]">{L(lang, c.limit)}</span>
                </div>
              ))}
            </div>
          </div>

          {/* 📱 SIM카드/eSIM 구매 가이드 */}
          <div className={card}>
            {/* 섹션 헤더 */}
            <div className="flex items-center gap-2 mb-1">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
                <Smartphone size={16} className="text-white" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-[#111827]">
                  {L(lang, { ko: 'SIM카드 / eSIM 구매 가이드', zh: '手机卡/eSIM购买指南', en: 'SIM Card / eSIM Guide' })}
                </h3>
                <p className="text-[10px] text-[#9CA3AF]">
                  {L(lang, { ko: '한국 도착 후 가장 먼저 필요한 것 = 인터넷!', zh: '到韩国后最先需要的 = 上网！', en: 'First thing you need in Korea = Internet!' })}
                </p>
              </div>
            </div>

            {/* 구매 방법 비교 카드 */}
            <div className="space-y-2.5">
              {SIM_OPTIONS.map(opt => {
                const Icon = opt.icon
                return (
                  <div key={opt.id} className={`relative rounded-xl border p-3 ${opt.recommended ? 'border-emerald-300 bg-emerald-50/50' : 'border-[#E5E7EB] bg-[#FAFAFA]'}`}>
                    {opt.recommended && (
                      <div className="absolute -top-2.5 right-3 px-2 py-0.5 bg-emerald-500 text-white text-[9px] font-bold rounded-full flex items-center gap-0.5">
                        <ThumbsUp size={9} />
                        {L(lang, { ko: '추천', zh: '推荐', en: 'Best' })}
                      </div>
                    )}
                    <div className="flex items-start gap-2.5">
                      <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: opt.color + '15' }}>
                        <Icon size={18} style={{ color: opt.color }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-0.5">
                          <h4 className="text-xs font-bold text-[#111827]">{L(lang, opt.name)}</h4>
                          <span className="text-xs font-bold" style={{ color: opt.color }}>{opt.price}</span>
                        </div>
                        <p className="text-[10px] text-[#6B7280] mb-1">
                          <MapPin size={10} className="inline mr-0.5 -mt-0.5" />
                          {L(lang, opt.where)}
                        </p>
                        <p className="text-[10px] text-[#374151]">{L(lang, opt.features)}</p>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* 추천 eSIM 서비스 */}
            <div className="mt-4">
              <h4 className="text-xs font-bold text-[#111827] mb-2 flex items-center gap-1.5">
                <Signal size={13} className="text-emerald-500" />
                {L(lang, { ko: '추천 eSIM 서비스', zh: '推荐eSIM服务', en: 'Recommended eSIM Services' })}
              </h4>
              <div className="grid grid-cols-3 gap-2">
                {ESIM_SERVICES.map(svc => (
                  <div key={svc.name} className="bg-[#F3F4F6] rounded-lg p-2.5 text-center">
                    <p className="text-xs font-bold text-[#111827] mb-0.5">{svc.name}</p>
                    <p className="text-[9px] text-[#6B7280] leading-tight">{L(lang, svc.desc)}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* 주의사항 */}
            <div className="mt-4 space-y-1.5">
              <h4 className="text-xs font-bold text-[#111827] mb-1 flex items-center gap-1.5">
                <AlertTriangle size={13} className="text-amber-500" />
                {L(lang, { ko: '꼭 알아두세요', zh: '必须知道', en: 'Important Notes' })}
              </h4>
              {SIM_TIPS.map((tip, i) => (
                <div key={i} className={`flex items-start gap-2 rounded-lg px-3 py-2 ${tip.type === 'warn' ? 'bg-amber-50 border border-amber-200' : 'bg-blue-50 border border-blue-200'}`}>
                  {tip.type === 'warn'
                    ? <CircleAlert size={13} className="text-amber-500 shrink-0 mt-0.5" />
                    : <CircleCheck size={13} className="text-blue-500 shrink-0 mt-0.5" />
                  }
                  <p className={`text-[10px] font-medium leading-snug ${tip.type === 'warn' ? 'text-amber-700' : 'text-blue-700'}`}>
                    {L(lang, tip.text)}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* ✈️ 입국카드 작성법 (入境卡填写指南) */}
          <div className={card}>
            {/* 섹션 헤더 */}
            <div className="flex items-center gap-2 mb-1">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                <FileText size={16} className="text-white" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-[#111827]">
                  {L(lang, { ko: '입국카드 작성법', zh: '入境卡填写指南', en: 'Arrival Card Guide' })}
                </h3>
                <p className="text-[10px] text-[#9CA3AF]">
                  {L(lang, { ko: '기내에서 나눠주는 입국카드를 미리 작성하세요', zh: '请在飞机上提前填写入境卡', en: 'Fill out the arrival card on the plane' })}
                </p>
              </div>
            </div>

            {/* 핵심 규칙 배너 */}
            <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 mb-4">
              <PenLine size={14} className="text-amber-600 shrink-0" />
              <p className="text-[11px] text-amber-700 font-medium">
                {L(lang, {
                  ko: '반드시 영문 대문자 + 볼펜(검정/파랑)으로 작성',
                  zh: '必须用英文大写字母 + 圆珠笔（黑/蓝色）填写',
                  en: 'Must use CAPITAL LETTERS + ballpoint pen (black/blue)'
                })}
              </p>
            </div>

            {/* ─── 입국카드 시각 재현 ─── */}
            <div className="bg-gradient-to-b from-[#F0F4FF] to-[#F8FAFC] border-2 border-[#B8C9E8] rounded-xl overflow-hidden shadow-sm">
              {/* 카드 상단 헤더 — 공식 카드 스타일 */}
              <div className="bg-gradient-to-r from-[#1E3A5F] to-[#2563EB] px-4 py-3 text-center">
                <p className="text-[9px] font-bold text-blue-200 tracking-[0.2em]">REPUBLIC OF KOREA</p>
                <p className="text-sm font-black text-white tracking-[0.15em]">
                  {L(lang, { ko: '입 국 신 고 서', zh: '入 境 申 报 书', en: 'ARRIVAL CARD' })}
                </p>
                <p className="text-[9px] text-blue-200 tracking-wider">{'\uB300\uD55C\uBBFC\uAD6D'} DISEMBARKATION CARD</p>
              </div>

              {/* 필드 그리드 */}
              <div className="p-3.5">
                <div className="grid grid-cols-2 gap-x-3 gap-y-2.5">
                  {ARRIVAL_CARD_FIELDS.map((field, i) => {
                    const Icon = field.icon
                    return (
                      <div key={i} className={`${field.width === 'full' ? 'col-span-2' : ''} ${field.important ? 'relative' : ''}`}>
                        {/* 필드 레이블 + 아이콘 */}
                        <div className="flex items-center gap-1 mb-0.5">
                          <span className="text-[10px] font-bold" style={{ color: field.color }}>{field.num}</span>
                          <Icon size={11} style={{ color: field.color }} className="shrink-0" />
                          <span className="text-[10px] font-semibold text-[#475569] leading-tight">
                            {L(lang, field.label)}
                          </span>
                        </div>
                        {/* 입력 필드 (시뮬레이션) */}
                        <div className={`bg-white border rounded px-2.5 py-1.5 min-h-[32px] flex items-center ${field.important ? 'border-amber-300 bg-amber-50/30' : 'border-[#D1D5DB]'}`}>
                          <span className="text-[11px] text-blue-600 font-mono font-semibold tracking-wide">
                            {typeof field.example === 'string' ? field.example : L(lang, field.example)}
                          </span>
                        </div>
                        {/* 힌트 */}
                        <p className="text-[9px] text-[#9CA3AF] mt-0.5 leading-tight pl-0.5">
                          {L(lang, field.hint)}
                        </p>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>

            {/* ─── 자주 하는 실수 TOP 5 ─── */}
            <div className="mt-4 bg-red-50 border border-red-200 rounded-xl p-3">
              <h4 className="text-[11px] font-bold text-red-700 mb-2 flex items-center gap-1.5">
                <CircleAlert size={13} className="text-red-500" />
                {L(lang, { ko: '자주 하는 실수 TOP 5', zh: '常见错误 TOP 5', en: 'Top 5 Common Mistakes' })}
              </h4>
              <div className="space-y-1.5">
                {ARRIVAL_CARD_MISTAKES.map((m, i) => (
                  <div key={i} className="flex items-start gap-1.5">
                    <span className="text-[10px] font-bold text-red-400 shrink-0 mt-px">{i + 1}.</span>
                    <p className="text-[10px] text-red-600 leading-snug">{L(lang, m)}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* ─── 작성 팁 ─── */}
            <div className="mt-3 bg-blue-50 border border-blue-200 rounded-xl p-3">
              <h4 className="text-[11px] font-bold text-blue-700 mb-2 flex items-center gap-1.5">
                <Info size={13} className="text-blue-500" />
                {L(lang, { ko: '작성 팁', zh: '填写提示', en: 'Tips' })}
              </h4>
              <div className="space-y-1 text-[10px] text-blue-600">
                <p>• {L(lang, { ko: '한국 내 주소는 호텔 영문명만 써도 OK', zh: '韩国地址写酒店英文名即可', en: 'Hotel name in English is OK for address' })}</p>
                <p>• {L(lang, { ko: '기내에서 안 받았으면 입국심사 전 비치대에서 수령', zh: '如果飞机上没拿到，入境审查前有填写台可领取', en: 'If not given on plane, available at stands before immigration' })}</p>
                <p>• {L(lang, { ko: '틀렸으면 줄을 긋고 옆에 다시 쓰기 (수정 OK)', zh: '写错了划线旁边重写即可（可以修改）', en: 'If wrong, cross out and rewrite next to it (corrections OK)' })}</p>
                <p>• {L(lang, { ko: '서명은 중국어(한자)로 해도 됩니다 — 여권과 동일하게!', zh: '签名可以签中文——跟护照一致就行！', en: 'Signature can be in Chinese — just match your passport!' })}</p>
              </div>
            </div>
          </div>

          {/* 🐾 반려동물 한국 반입 가이드 */}
          <div className={card}>
            <h3 className="text-sm font-bold text-[#111827] mb-1 flex items-center gap-2">
              <PawPrint size={16} />
              {L(lang, { ko: '반려동물 한국 반입 가이드', zh: '携带宠物入境韩国完全指南', en: 'Pet Import Complete Guide' })}
            </h3>
            <p className="text-[10px] text-[#9CA3AF] mb-4">
              {L(lang, { ko: '강아지·고양이를 데리고 한국에 입국하는 전체 절차', zh: '带狗狗·猫咪入境韩国的完整流程', en: 'Full process for bringing dogs/cats to Korea' })}
            </p>

            {/* 3단계 아코디언 타임라인 */}
            <div className="space-y-0 relative">
              {PET_GUIDE_STEPS.map((step, si) => (
                <div key={step.id} className="relative pl-7 pb-3 last:pb-0">
                  {/* 세로 연결선 */}
                  {si < PET_GUIDE_STEPS.length - 1 && (
                    <div className="absolute left-[11px] top-6 bottom-0 w-0.5" style={{ backgroundColor: step.color + '30' }} />
                  )}
                  {/* 원형 번호 */}
                  <div className="absolute left-0 top-0.5 w-[22px] h-[22px] rounded-full flex items-center justify-center text-white text-[10px] font-bold" style={{ backgroundColor: step.color }}>
                    {si + 1}
                  </div>
                  {/* 헤더 (클릭 시 토글) */}
                  <button
                    className="w-full text-left flex items-center justify-between py-1"
                    onClick={() => setExpandedPetStep(expandedPetStep === si ? null : si)}
                  >
                    <div>
                      <span className="text-xs font-bold" style={{ color: step.color }}>{L(lang, step.phase)}</span>
                      {step.sub && <span className="text-[10px] text-[#9CA3AF] ml-1">{L(lang, step.sub)}</span>}
                    </div>
                    <ChevronDown size={14} className="text-[#9CA3AF] shrink-0 transition-transform" style={{ transform: expandedPetStep === si ? 'rotate(180deg)' : 'rotate(0deg)' }} />
                  </button>
                  {/* 펼쳐진 항목 */}
                  {expandedPetStep === si && (
                    <div className="mt-1.5 space-y-1.5 pb-1">
                      {step.items.map((item, ii) => (
                        <div key={ii} className="flex items-start gap-1.5 text-xs text-[#374151]">
                          <span className="mt-0.5 shrink-0" style={{ color: step.color }}>●</span>
                          <span>{L(lang, item)}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* ✈️ 항공사 기내 반입 정책 */}
            <div className="mt-4 pt-3 border-t border-[#E5E7EB]">
              <h4 className="text-xs font-bold text-[#111827] mb-2 flex items-center gap-1.5">
                <Plane size={13} />
                {L(lang, { ko: '항공사 기내 반입 정책', zh: '航空公司客舱携带政策', en: 'Airline Cabin Pet Policy' })}
              </h4>
              <div className="overflow-hidden rounded-lg border border-[#E5E7EB]">
                <table className="w-full text-[10px]">
                  <thead>
                    <tr className="bg-[#F9FAFB] text-[#6B7280]">
                      <th className="text-left py-1.5 px-2 font-medium">{L(lang, { ko: '항공사', zh: '航空公司', en: 'Airline' })}</th>
                      <th className="text-center py-1.5 px-1 font-medium">{L(lang, { ko: '기내', zh: '客舱', en: 'Cabin' })}</th>
                      <th className="text-center py-1.5 px-1 font-medium">{L(lang, { ko: '무게', zh: '重量', en: 'Weight' })}</th>
                      <th className="text-left py-1.5 px-2 font-medium">{L(lang, { ko: '비고', zh: '备注', en: 'Note' })}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {PET_AIRLINE_TABLE.map((row, i) => (
                      <tr key={i} className="border-t border-[#E5E7EB]">
                        <td className="py-1.5 px-2 font-semibold text-[#111827]">{L(lang, row.airline)}</td>
                        <td className="py-1.5 px-1 text-center">{row.cabin ? '✅' : '❌'}</td>
                        <td className="py-1.5 px-1 text-center text-[#6B7280]">{row.weight}</td>
                        <td className="py-1.5 px-2 text-[#6B7280]">{L(lang, row.note)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="mt-1.5 text-[10px] text-amber-600 flex items-start gap-1">
                <AlertTriangle size={10} className="shrink-0 mt-0.5" />
                {L(lang, { ko: '단두종(불독·퍼그 등)은 대부분 항공사에서 운송 거부', zh: '短头犬（斗牛犬、巴哥等）大多数航空公司拒绝运输', en: 'Brachycephalic breeds (Bulldog, Pug, etc.) are refused by most airlines' })}
              </p>
            </div>

            {/* 🚆 한국 내 이동 팁 */}
            <div className="mt-4 pt-3 border-t border-[#E5E7EB]">
              <h4 className="text-xs font-bold text-[#111827] mb-2 flex items-center gap-1.5">
                <Train size={13} />
                {L(lang, { ko: '한국 내 이동 팁', zh: '韩国境内出行Tips', en: 'Korea Travel Tips' })}
              </h4>
              <div className="space-y-1.5">
                {PET_KOREA_TIPS.map((tip, i) => (
                  <div key={i} className="flex items-start gap-1.5 text-xs text-[#374151]">
                    <span className="text-[#9CA3AF] mt-0.5 shrink-0">•</span>
                    <span>{L(lang, tip)}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* 💰 비용 예상 */}
            <div className="mt-4 pt-3 border-t border-[#E5E7EB]">
              <h4 className="text-xs font-bold text-[#111827] mb-2 flex items-center gap-1.5">
                <DollarSign size={13} />
                {L(lang, { ko: '비용 예상', zh: '费用估算', en: 'Cost Estimates' })}
              </h4>
              <div className="overflow-hidden rounded-lg border border-[#E5E7EB]">
                <table className="w-full text-[10px]">
                  <thead>
                    <tr className="bg-[#F9FAFB] text-[#6B7280]">
                      <th className="text-left py-1.5 px-2 font-medium">{L(lang, { ko: '항목', zh: '项目', en: 'Item' })}</th>
                      <th className="text-right py-1.5 px-2 font-medium">CNY</th>
                      <th className="text-right py-1.5 px-2 font-medium">KRW</th>
                    </tr>
                  </thead>
                  <tbody>
                    {PET_COSTS.map((row, i) => (
                      <tr key={i} className="border-t border-[#E5E7EB]">
                        <td className="py-1.5 px-2 text-[#111827] font-medium">{L(lang, row.item)}</td>
                        <td className="py-1.5 px-2 text-right text-[#6B7280]">{row.cny}</td>
                        <td className="py-1.5 px-2 text-right text-[#6B7280]">{row.krw}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* 📞 핫라인 */}
            <div className="mt-4 pt-3 border-t border-[#E5E7EB] space-y-2">
              {PET_HOTLINES.map((h, i) => (
                <a key={i} href={`tel:${h.tel}`} className="flex items-center gap-2 p-2.5 bg-[#F9FAFB] rounded-lg active:bg-gray-100">
                  <Phone size={14} className="text-green-600 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-[#111827]">{L(lang, h.name)}</p>
                    <p className="text-[10px] text-[#6B7280]">{L(lang, h.desc)}</p>
                  </div>
                  <span className="text-xs font-bold text-green-600 shrink-0">{h.tel}</span>
                </a>
              ))}
            </div>

            {/* ⚠️ 면책 + 출처 */}
            <div className="mt-4 pt-3 border-t border-[#E5E7EB]">
              <p className="text-[10px] text-[#9CA3AF] flex items-start gap-1">
                <AlertTriangle size={10} className="shrink-0 mt-0.5" />
                {L(lang, { ko: '규정은 변경될 수 있습니다. 반드시 공식 사이트에서 최신 정보를 확인하세요.', zh: '规定可能会变更，请务必确认官方最新信息。', en: 'Regulations may change. Please check official sites for the latest info.' })}
              </p>
              <div className="mt-1.5 flex flex-wrap gap-2">
                <a href="https://www.qia.go.kr" target="_blank" rel="noopener noreferrer" className="text-[10px] text-blue-500 underline flex items-center gap-0.5">
                  <ExternalLink size={9} /> qia.go.kr
                </a>
                <a href="http://www.customs.gov.cn" target="_blank" rel="noopener noreferrer" className="text-[10px] text-blue-500 underline flex items-center gap-0.5">
                  <ExternalLink size={9} /> customs.gov.cn
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Cities — 클룩 스타일 도시 카드 */}
      {section === 'cities' && (
        <div className="space-y-3">
          {TRAVEL_CITIES.map(city => (
            <div
              key={city.id}
              onClick={() => setSelectedCity(city)}
              className="rounded-2xl overflow-hidden border border-[#E5E7EB] bg-white cursor-pointer transition-transform active:scale-[0.98]"
            >
              <div className="relative h-[140px]">
                <img
                  src={city.image}
                  alt={L(lang, city.name)}
                  className="w-full h-full object-cover"
                  loading="lazy"
                  onError={(e) => { e.target.style.display = 'none' }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
                {city.comingSoon && (
                  <span className="absolute top-2.5 right-2.5 text-[10px] px-2 py-0.5 bg-white/90 rounded-full font-semibold text-[#6B7280]">
                    Coming Soon
                  </span>
                )}
                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <h3 className="text-lg font-bold text-white">{L(lang, city.name)}</h3>
                  <p className="text-xs text-white/80 mt-0.5 line-clamp-1">{L(lang, city.description)}</p>
                  <div className="flex items-center gap-3 mt-1.5 text-[11px] text-white/70">
                    {city.population && <span className="flex items-center gap-1"><Users size={11} /> {city.population}</span>}
                    {city.bestSeason && <span className="flex items-center gap-1"><Calendar size={11} /> {L(lang, city.bestSeason)}</span>}
                    {city.spots.length > 0 && (
                      <span className="flex items-center gap-1">
                        <MapPin size={11} /> {city.spots.length} {L(lang, { ko: '스팟', zh: '地点', en: 'spots' })}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Transport */}
      {section === 'transport' && (
        <div className="space-y-3">
          {TRANSPORT.map((t, i) => {
            if (t.isTaxiGuide) return <TaxiGuide key={i} lang={lang} card={card} />
            const Icon = t.icon
            return (
              <div key={i} className={card}>
                <h3 className="text-sm font-bold text-[#111827] mb-2 flex items-center gap-2">
                  <Icon size={16} />
                  {typeof t.name === 'string' ? t.name : L(lang, t.name)}
                </h3>
                <div className="space-y-1.5">
                  {t.info.map((info, j) => (
                    <p key={j} className="text-xs text-[#374151] flex items-start gap-1.5">
                      <span className="text-[#9CA3AF] mt-0.5 shrink-0">-</span>
                      {L(lang, info)}
                    </p>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Accommodation */}
      {section === 'stay' && (
        <div className="space-y-3">
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-3">
            <p className="text-xs text-amber-700">{L(lang, { ko: '체크인 15:00 / 체크아웃 11:00 이 일반적. 신분증(여권) 항시 지참.', zh: '入住15:00/退房11:00为一般规定。请随身携带身份证件（护照）。', en: 'Check-in 15:00 / Check-out 11:00 is standard. Always carry ID (passport).' })}</p>
          </div>
          {ACCOMMODATIONS.map((a, i) => (
            <div key={i} className={card}>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-bold text-[#111827]">{L(lang, a.type)}</h3>
                <span className="text-xs font-bold text-[#111827]">{a.price}</span>
              </div>
              <p className="text-xs text-[#6B7280] mb-1">{L(lang, { ko: '예약', zh: '预订', en: 'Book' })}: {typeof a.platforms === 'string' ? a.platforms : L(lang, a.platforms)}</p>
              <p className="text-xs text-[#9CA3AF]">{L(lang, a.tips)}</p>
            </div>
          ))}
        </div>
      )}

      {/* Itineraries */}
      {section === 'itinerary' && (
        <div className="space-y-4">
          {ITINERARIES.map((it, i) => (
            <div key={i} className={card}>
              <h3 className="text-sm font-bold text-[#111827] mb-3">{L(lang, it.name)}</h3>
              <div className="space-y-2">
                {it.days.map(d => (
                  <div key={d.day} className="flex items-start gap-2">
                    <span className="text-[10px] font-bold text-white bg-[#111827] w-7 h-5 rounded-full flex items-center justify-center shrink-0">D{d.day}</span>
                    <p className="text-xs text-[#374151]">{L(lang, d.plan)}</p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Curation */}
      {section === 'curation' && (
        <div className="space-y-4">
          {/* Category filters */}
          <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1 scrollbar-hide">
            {CURATION_CATEGORIES.map(cat => (
              <button 
                key={cat.id} 
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all shrink-0 ${
                  selectedCategory === cat.id 
                    ? 'bg-[#111827] text-white shadow-md' 
                    : 'bg-[#FAFAF8] text-[#6B7280] hover:bg-[#F3F4F6] border border-[#E5E7EB]'
                }`}>
                {L(lang, cat.name)}
              </button>
            ))}
          </div>

          {/* Spot cards */}
          <div className="grid gap-4">
            {filteredSpots.map(spot => (
              <div key={spot.id} className={`${card} hover:shadow-lg transition-all duration-200`}>
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <h3 className="text-sm font-bold text-[#111827] mb-1 leading-tight">{L(lang, spot.name)}</h3>
                    <div className="flex items-center gap-1 text-xs text-[#6B7280] mb-2">
                      <MapPin size={12} className="shrink-0" />
                      <span>{L(lang, spot.location)}</span>
                    </div>
                  </div>
                  <button 
                    onClick={() => toggleFavorite(spot.id)}
                    className={`p-1.5 rounded-full transition-all ${
                      favorites.includes(spot.id)
                        ? 'text-red-500 bg-red-50 hover:bg-red-100'
                        : 'text-[#9CA3AF] hover:text-red-500 hover:bg-red-50'
                    }`}>
                    <Heart size={16} className={favorites.includes(spot.id) ? 'fill-current' : ''} />
                  </button>
                </div>
                
                <p className="text-xs text-[#374151] mb-3 leading-relaxed">{L(lang, spot.desc)}</p>
                
                <div className="flex items-center justify-between">
                  <div className="flex flex-wrap gap-1.5">
                    {spot.tags.map((tag, i) => (
                      <span key={i} className="text-[10px] px-2 py-0.5 bg-[#F3F4F6] rounded-full text-[#6B7280] font-medium">
                        #{tag}
                      </span>
                    ))}
                  </div>
                  <span className="text-xs font-bold text-[#111827]">{spot.price}</span>
                </div>
                
                {/* Rating/interest indicator */}
                <div className="flex items-center gap-1 mt-3 pt-3 border-t border-[#F3F4F6]">
                  <Star size={12} className="text-amber-400 fill-current" />
                  <span className="text-xs text-[#6B7280]">
                    {L(lang, { 
                      ko: '추천도 높음', 
                      zh: '推荐度高', 
                      en: 'Highly recommended' 
                    })}
                  </span>
                  <div className="ml-auto flex items-center gap-1 text-xs text-[#9CA3AF]">
                    <Users size={12} />
                    <span>{Math.floor(Math.random() * 50) + 20}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filteredSpots.length === 0 && (
            <div className="text-center py-8 text-[#9CA3AF]">
              <Filter size={24} className="mx-auto mb-2 opacity-50" />
              <p className="text-sm">
                {L(lang, { 
                  ko: '해당 카테고리의 장소가 없습니다', 
                  zh: '该类别下暂无地点', 
                  en: 'No places in this category' 
                })}
              </p>
            </div>
          )}

          {/* Category info */}
          {selectedCategory !== 'all' && (
            <div className="bg-[#FAFAF8] border border-[#E5E7EB] rounded-xl p-4">
              <p className="text-xs text-[#6B7280] leading-relaxed">
                {selectedCategory === 'cafe' && L(lang, { 
                  ko: '서울의 독특한 카페 문화를 체험해보세요. 로스터리부터 독립서점 카페까지 다양한 공간이 기다립니다.', 
                  zh: '体验首尔独特的咖啡文化。从烘焙咖啡厅到独立书店咖啡厅，各种空间等待着您。', 
                  en: 'Experience Seoul\'s unique cafe culture. From roasteries to independent bookstore cafes, various spaces await you.' 
                })}
                {selectedCategory === 'kdrama' && L(lang, { 
                  ko: 'K-드라마 속 그 장소를 직접 방문해보세요. 주인공이 된 기분으로 특별한 추억을 만들어보세요.', 
                  zh: '亲自访问K-剧中的那些地点。以主人公的心情创造特别的回忆。', 
                  en: 'Visit those places from K-dramas in person. Create special memories feeling like the main character.' 
                })}
                {selectedCategory === 'subculture' && L(lang, { 
                  ko: '서울의 숨겨진 문화를 발견하세요. 갤러리, 빈티지샵, 클럽 등 로컬만 아는 특별한 공간들입니다.', 
                  zh: '发现首尔隐藏的文化。画廊、古着店、俱乐部等只有当地人知道的特别空间。', 
                  en: 'Discover Seoul\'s hidden culture. Galleries, vintage shops, clubs - special spaces only locals know.' 
                })}
                {selectedCategory === 'mainstream' && L(lang, { 
                  ko: '한국 여행의 필수 코스들입니다. K-POP부터 전통 음식까지 대표적인 한국 문화를 경험하세요.', 
                  zh: '韩国旅行的必游景点。从K-POP到传统美食，体验代表性的韩国文化。', 
                  en: 'Essential courses for Korea travel. Experience representative Korean culture from K-POP to traditional food.' 
                })}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Theme Parks */}
      {section === 'parks' && (
        <div className="space-y-3">
          {PARKS.map((p, i) => (
            <div key={i} className={card}>
              <h3 className="text-sm font-bold text-[#111827] mb-1">{L(lang, p.name)}</h3>
              <div className="flex items-center gap-1 text-xs text-[#6B7280] mb-2">
                <MapPin size={12} />
                <span>{L(lang, p.location)}</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs mb-2">
                <div className="flex items-center gap-1 text-[#374151]"><Clock size={12} className="text-[#9CA3AF]" /> {p.hours}</div>
                <div className="flex items-center gap-1 text-[#374151]"><DollarSign size={12} className="text-[#9CA3AF]" /> {p.price.adult}</div>
              </div>
              <p className="text-xs text-[#6B7280] mb-1.5 flex items-center gap-1"><Train size={12} /> {L(lang, p.access)}</p>
              <p className="text-xs text-[#9CA3AF]">{L(lang, p.tips)}</p>
            </div>
          ))}
        </div>
      )}

      {/* Tax Refund & Duty-Free */}
      {section === 'taxrefund' && (
        <div className="space-y-3">
          {/* 退税指南 Tax Refund */}
          <div className={card}>
            <h3 className="text-sm font-bold text-[#111827] mb-1 flex items-center gap-2">
              <Receipt size={16} className="text-[#059669]" />
              {L(lang, { ko: '세금환급 가이드', zh: '退税指南', en: 'Tax Refund Guide' })}
            </h3>
            <p className="text-[10px] text-[#9CA3AF] mb-3">
              {L(lang, { ko: '외국인 관광객 부가세 환급 방법', zh: '外国游客增值税退税方法', en: 'VAT refund for foreign tourists' })}
            </p>

            {/* 退税条件 */}
            <div className="bg-[#F0FDF4] rounded-xl p-3 mb-3">
              <h4 className="text-xs font-bold text-[#059669] mb-2 flex items-center gap-1">
                <CircleCheck size={13} />
                {L(lang, { ko: '환급 조건', zh: '退税条件', en: 'Eligibility' })}
              </h4>
              <div className="space-y-1.5 text-xs text-[#374151]">
                <p>✅ {L(lang, { ko: '외국 여권 소지자 (한국 체류 6개월 미만)', zh: '持外国护照（在韩停留不满6个月）', en: 'Foreign passport holder (stayed less than 6 months)' })}</p>
                <p>✅ {L(lang, { ko: '1회 구매 ₩30,000 이상', zh: '单次购物满₩30,000（约¥160）', en: 'Single purchase ₩30,000+' })}</p>
                <p>✅ {L(lang, { ko: 'Tax Free 가맹점에서 구매', zh: '在Tax Free标志商店购买', en: 'Purchase at Tax Free stores' })}</p>
                <p>✅ {L(lang, { ko: '구매 후 3개월 이내 출국', zh: '购买后3个月内出境', en: 'Depart within 3 months of purchase' })}</p>
              </div>
            </div>

            {/* 3가지 退税方式 — 아코디언 */}
            <div className="space-y-2 mb-3">
              {/* 即时退税 */}
              <div className="border border-[#E5E7EB] rounded-xl overflow-hidden">
                <button className="w-full text-left flex items-center justify-between p-3" onClick={() => setTaxRefundOpen(taxRefundOpen === 'instant' ? null : 'instant')}>
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-[#059669] flex items-center justify-center text-white text-[10px] font-bold">1</div>
                    <div>
                      <span className="text-xs font-bold text-[#111827]">{L(lang, { ko: '즉시환급', zh: '即时退税', en: 'Instant Refund' })}</span>
                      <span className="text-[10px] text-[#059669] ml-1.5 font-semibold">{L(lang, { ko: '가장 편리!', zh: '最方便！', en: 'Easiest!' })}</span>
                    </div>
                  </div>
                  <ChevronDown size={14} className="text-[#9CA3AF] transition-transform" style={{ transform: taxRefundOpen === 'instant' ? 'rotate(180deg)' : 'rotate(0deg)' }} />
                </button>
                {taxRefundOpen === 'instant' && (
                  <div className="px-3 pb-3 space-y-1.5 text-xs text-[#374151]">
                    <p>📍 {L(lang, { ko: '매장 결제 시 바로 세금 차감', zh: '结账时直接扣除税款', en: 'Tax deducted at checkout' })}</p>
                    <p>💳 {L(lang, { ko: '여권 제시 → 세금 제외 금액만 결제', zh: '出示护照→只付扣税后的金额', en: 'Show passport → pay tax-excluded price' })}</p>
                    <div className="bg-[#FEF3C7] rounded-lg p-2 mt-1">
                      <p className="text-[10px] text-[#92400E]">⚠️ {L(lang, { ko: '한도: 1회 ₩500,000 / 연간 ₩2,500,000', zh: '限额：单次₩500,000 / 年度₩2,500,000', en: 'Limit: ₩500,000/time, ₩2,500,000/year' })}</p>
                    </div>
                    <p className="text-[10px] text-[#6B7280]">💡 {L(lang, { ko: '올리브영, 다이소, 롯데마트 등 대부분 대형매장 가능', zh: 'Olive Young、大创、乐天超市等大部分大型商店可用', en: 'Available at Olive Young, Daiso, Lotte Mart, etc.' })}</p>
                  </div>
                )}
              </div>

              {/* 市内退税 */}
              <div className="border border-[#E5E7EB] rounded-xl overflow-hidden">
                <button className="w-full text-left flex items-center justify-between p-3" onClick={() => setTaxRefundOpen(taxRefundOpen === 'downtown' ? null : 'downtown')}>
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-[#2563EB] flex items-center justify-center text-white text-[10px] font-bold">2</div>
                    <div>
                      <span className="text-xs font-bold text-[#111827]">{L(lang, { ko: '시내 환급', zh: '市内退税', en: 'Downtown Refund' })}</span>
                    </div>
                  </div>
                  <ChevronDown size={14} className="text-[#9CA3AF] transition-transform" style={{ transform: taxRefundOpen === 'downtown' ? 'rotate(180deg)' : 'rotate(0deg)' }} />
                </button>
                {taxRefundOpen === 'downtown' && (
                  <div className="px-3 pb-3 space-y-1.5 text-xs text-[#374151]">
                    <p>📍 {L(lang, { ko: '명동 등 시내 환급 카운터 방문', zh: '前往明洞等市内退税柜台', en: 'Visit downtown refund counters (e.g. Myeongdong)' })}</p>
                    <p>📄 {L(lang, { ko: '영수증 + 여권 제시 → 현금 즉시 환급', zh: '出示小票+护照→现金即时退还', en: 'Show receipt + passport → cash refund on the spot' })}</p>
                    <p className="text-[10px] text-[#6B7280]">💡 {L(lang, { ko: '출국 시 세관 도장 확인 필요 (미확인 시 카드 청구)', zh: '出境时需海关盖章确认（未确认则信用卡扣款）', en: 'Must get customs stamp at departure (or card will be charged)' })}</p>
                  </div>
                )}
              </div>

              {/* 机场退税 */}
              <div className="border border-[#E5E7EB] rounded-xl overflow-hidden">
                <button className="w-full text-left flex items-center justify-between p-3" onClick={() => setTaxRefundOpen(taxRefundOpen === 'airport' ? null : 'airport')}>
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-[#7C3AED] flex items-center justify-center text-white text-[10px] font-bold">3</div>
                    <div>
                      <span className="text-xs font-bold text-[#111827]">{L(lang, { ko: '공항 환급', zh: '机场退税', en: 'Airport Refund' })}</span>
                      <span className="text-[10px] text-[#7C3AED] ml-1.5 font-semibold">{L(lang, { ko: '금액 무제한', zh: '金额无上限', en: 'No limit' })}</span>
                    </div>
                  </div>
                  <ChevronDown size={14} className="text-[#9CA3AF] transition-transform" style={{ transform: taxRefundOpen === 'airport' ? 'rotate(180deg)' : 'rotate(0deg)' }} />
                </button>
                {taxRefundOpen === 'airport' && (
                  <div className="px-3 pb-3 space-y-1.5 text-xs text-[#374151]">
                    <p className="font-semibold">{L(lang, { ko: '📋 인천공항 환급 절차:', zh: '📋 仁川机场退税流程：', en: '📋 Incheon Airport refund process:' })}</p>
                    <div className="bg-[#F3F4F6] rounded-lg p-2.5 space-y-1">
                      <p>① {L(lang, { ko: '물품 + 영수증 준비', zh: '准备商品+小票', en: 'Prepare items + receipts' })}</p>
                      <p>② {L(lang, { ko: '3층 출국장 세관 신고대 → 도장 받기', zh: '3楼出境大厅海关申报台→盖章', en: '3F departure hall customs desk → get stamp' })}</p>
                      <p>③ {L(lang, { ko: '보안 검색 통과', zh: '过安检', en: 'Pass security check' })}</p>
                      <p>④ {L(lang, { ko: '면세구역 내 환급 카운터에서 수령', zh: '在免税区退税柜台领取', en: 'Collect at refund counter in duty-free zone' })}</p>
                    </div>
                    <div className="bg-[#FEF2F2] rounded-lg p-2 mt-1">
                      <p className="text-[10px] text-[#991B1B] font-semibold">🚨 {L(lang, { ko: '₩750,000 초과 시 세관 도장 필수!', zh: '超过₩750,000必须海关盖章！', en: 'Customs stamp required if over ₩750,000!' })}</p>
                      <p className="text-[10px] text-[#991B1B]">⚠️ {L(lang, { ko: '위탁 수하물 보내기 전에 도장 먼저!', zh: '托运行李前先盖章！', en: 'Get stamp BEFORE checking luggage!' })}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* 免税限额 Duty-Free Allowance */}
          <div className={card}>
            <h3 className="text-sm font-bold text-[#111827] mb-1 flex items-center gap-2">
              <BadgePercent size={16} className="text-[#2563EB]" />
              {L(lang, { ko: '면세 한도', zh: '免税限额', en: 'Duty-Free Allowance' })}
            </h3>
            <p className="text-[10px] text-[#9CA3AF] mb-3">
              {L(lang, { ko: '입국 시 면세 반입 허용량', zh: '入境时免税携带限额', en: 'Duty-free limits when entering' })}
            </p>

            {/* 韩国入境 */}
            <div className="mb-3">
              <h4 className="text-xs font-bold text-[#111827] mb-2 flex items-center gap-1.5">
                🇰🇷 {L(lang, { ko: '한국 입국 면세 한도', zh: '韩国入境免税限额', en: 'Korea Entry Duty-Free Limits' })}
              </h4>
              <div className="bg-[#F3F4F6] rounded-xl p-3 space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-[#6B7280]">{L(lang, { ko: '기본 면세', zh: '基本免税额', en: 'Basic Allowance' })}</span>
                  <span className="font-bold text-[#111827]">US$800</span>
                </div>
                <div className="border-t border-[#E5E7EB] pt-2 space-y-1.5 text-xs text-[#374151]">
                  <p>🚬 {L(lang, { ko: '담배 200개비 (1보루)', zh: '香烟200支（1条）', en: 'Cigarettes: 200 sticks (1 carton)' })}</p>
                  <p>🍷 {L(lang, { ko: '주류 2병 (2L, US$400 이하)', zh: '酒类2瓶（2L，400美元以下）', en: 'Alcohol: 2 bottles (2L, under $400)' })}</p>
                  <p>💐 {L(lang, { ko: '향수 100ml', zh: '香水100ml', en: 'Perfume: 100ml' })}</p>
                </div>
                <div className="border-t border-[#E5E7EB] pt-2 space-y-1 text-[10px]">
                  <p className="text-[#059669]">✅ {L(lang, { ko: '자진 신고 시 30% 세액 감면', zh: '主动申报可减免30%税款', en: '30% tax reduction for voluntary declaration' })}</p>
                  <p className="text-[#DC2626]">❌ {L(lang, { ko: '미신고 적발 시 40% 가산세 부과', zh: '未申报被查处加征40%税款', en: '40% penalty for undeclared items' })}</p>
                </div>
              </div>
            </div>

            {/* 中国回国 */}
            <div className="mb-3">
              <h4 className="text-xs font-bold text-[#111827] mb-2 flex items-center gap-1.5">
                🇨🇳 {L(lang, { ko: '중국 귀국 면세 한도', zh: '中国回国免税限额', en: 'China Return Duty-Free Limits' })}
              </h4>
              <div className="bg-[#F3F4F6] rounded-xl p-3 space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-[#6B7280]">{L(lang, { ko: '기본 면세', zh: '基本免税额', en: 'Basic Allowance' })}</span>
                  <span className="font-bold text-[#111827]">¥5,000</span>
                </div>
                <div className="border-t border-[#E5E7EB] pt-2 space-y-1.5 text-xs text-[#374151]">
                  <p>🍷 {L(lang, { ko: '주류 1.5L (알코올 12도 이상)', zh: '酒类1.5L（12度以上）', en: 'Alcohol: 1.5L (12%+ ABV)' })}</p>
                  <p>🚬 {L(lang, { ko: '담배 400개비 (2보루)', zh: '香烟400支（2条）', en: 'Cigarettes: 400 sticks (2 cartons)' })}</p>
                </div>
              </div>
            </div>

            {/* 免责声明 */}
            <div className="bg-[#FEF3C7] rounded-xl p-2.5 flex items-start gap-2">
              <AlertTriangle size={14} className="text-[#D97706] shrink-0 mt-0.5" />
              <p className="text-[10px] text-[#92400E]">
                {L(lang, {
                  ko: '면세 규정은 변경될 수 있습니다. 최신 세관 공고를 확인하세요.',
                  zh: '规定可能变更，请以海关最新公告为准。',
                  en: 'Regulations may change. Please check the latest customs announcements.'
                })}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
