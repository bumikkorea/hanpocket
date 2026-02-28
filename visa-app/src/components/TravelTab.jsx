import { useState, useEffect, lazy, Suspense } from 'react'
import { Plane, Train, Bus, Car, MapPin, Clock, DollarSign, Calendar, ChevronRight, ExternalLink, CreditCard, Bike, Building2, Ticket, Navigation, Shield, Filter, Star, Heart, Users, BookOpen } from 'lucide-react'

const TravelDiary = lazy(() => import('./TravelDiary/TravelDiary'))

function L(lang, d) { if (typeof d === 'string') return d; return d?.[lang] || d?.en || d?.zh || d?.ko || '' }

const TourSpotSection = lazy(() => import('./TourSpotSection'))
const TourDetailModal = lazy(() => import('./TourDetailModal'))

const SECTIONS = [
  { id: 'discover', label: { ko: '발견', zh: '发现', en: 'Discover' } },
  { id: 'arrival', label: { ko: '입국 가이드', zh: '入境指南', en: 'Arrival' } },
  { id: 'cities', label: { ko: '도시 가이드', zh: '城市指南', en: 'Cities' } },
  { id: 'transport', label: { ko: '교통', zh: '交通', en: 'Transport' } },
  { id: 'stay', label: { ko: '숙소', zh: '住宿', en: 'Stay' } },
  { id: 'itinerary', label: { ko: '코스 추천', zh: '行程推荐', en: 'Itineraries' } },
  { id: 'curation', label: { ko: '큐레이션', zh: '精选推荐', en: 'Curation' } },
  { id: 'parks', label: { ko: '테마파크', zh: '主题公园', en: 'Theme Parks' } },
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
  { name: { ko: '택시', zh: '出租车', en: 'Taxi' }, icon: Car, info: [
    { ko: '기본요금: ₩5,200 (서울, 1.6km)', zh: '起步价：₩5,200（首尔，1.6km）', en: 'Base fare: ₩5,200 (Seoul, 1.6km)' },
    { ko: '심야할증: 20% (22:00~04:00)', zh: '夜间加价：20%（22:00~04:00）', en: 'Late-night surcharge: 20% (22:00~04:00)' },
    { ko: '카카오T 앱 추천 (한국어 필요 없이 목적지 입력)', zh: '推荐KakaoT APP（无需韩语即可输入目的地）', en: 'Recommend KakaoT app (no Korean needed)' },
    { ko: '국제택시: 영어/중국어 가능 (예약 필요)', zh: '国际出租车：可用英语/中文（需预约）', en: 'Intl taxi: English/Chinese available (reservation needed)' },
  ]},
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

      {/* Arrival */}
      {section === 'arrival' && (
        <div className="space-y-4">
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

          {/* SIM */}
          <div className={card}>
            <h3 className="text-sm font-bold text-[#111827] mb-2">{L(lang, { ko: 'SIM 카드 / 로밍', zh: 'SIM卡/漫游', en: 'SIM Card / Roaming' })}</h3>
            <div className="space-y-1.5 text-xs text-[#374151]">
              <p>{L(lang, { ko: '인천공항 1층 도착층에 SKT/KT/LG U+ 로밍센터', zh: '仁川机场1层到达层有SKT/KT/LG U+漫游中心', en: 'SKT/KT/LG U+ roaming centers at Incheon Airport arrivals (1F)' })}</p>
              <p>{L(lang, { ko: 'SIM 카드: ₩25,000~55,000 (5~30일)', zh: 'SIM卡：₩25,000~55,000（5~30天）', en: 'SIM cards: ₩25,000~55,000 (5~30 days)' })}</p>
              <p>{L(lang, { ko: 'eSIM도 가능 (아이폰 XS 이후 모델)', zh: '也支持eSIM（iPhone XS以后机型）', en: 'eSIM available (iPhone XS and later)' })}</p>
              <p>{L(lang, { ko: '중국 통신사 로밍보다 현지 SIM이 더 저렴', zh: '比中国运营商漫游更便宜', en: 'Cheaper than Chinese carrier roaming' })}</p>
            </div>
          </div>
        </div>
      )}

      {/* Cities */}
      {section === 'cities' && (
        <div className="space-y-3">
          {CITIES.map((city, i) => (
            <div key={i} className={card} onClick={() => setExpandedCity(expandedCity === i ? null : i)}>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-[#111827]">{L(lang, city.name)}</h3>
                  <p className="text-xs text-[#6B7280] mt-0.5">{L(lang, city.desc)}</p>
                </div>
                <ChevronRight size={16} className={`text-[#9CA3AF] transition-transform ${expandedCity === i ? 'rotate-90' : ''}`} />
              </div>
              {expandedCity === i && (
                <div className="mt-3 pt-3 border-t border-[#E5E7EB] space-y-2">
                  <div>
                    <p className="text-[10px] text-[#9CA3AF] font-semibold mb-1">{L(lang, { ko: '주요 명소', zh: '主要景点', en: 'Must See' })}</p>
                    <div className="flex flex-wrap gap-1.5">
                      {city.spots.map((s, j) => (
                        <span key={j} className="text-[11px] px-2 py-1 bg-[#F3F4F6] rounded-full text-[#374151]">{L(lang, s)}</span>
                      ))}
                    </div>
                  </div>
                  <div className="flex gap-4 text-xs text-[#6B7280]">
                    <span className="flex items-center gap-1"><Train size={12} /> {L(lang, city.access)}</span>
                    <span className="flex items-center gap-1"><Calendar size={12} /> {L(lang, city.season)}</span>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Transport */}
      {section === 'transport' && (
        <div className="space-y-3">
          {TRANSPORT.map((t, i) => {
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
    </div>
  )
}
