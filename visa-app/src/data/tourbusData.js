/**
 * 서울시티투어버스 (노랑풍선시티버스) 노선 데이터
 * 출처: seoulcitytourbus.co.kr + 위키피디아
 * 
 * isTicketStop: true = 매표소/결제 가능 정류장 (⭐ 하이라이트)
 */

export const TOURBUS_ROUTES = [
  {
    id: 'traditional-day',
    label: { ko: '전통문화코스 (주간)', zh: '传统文化线路（白天）', en: 'Traditional Culture (Day)' },
    color: '#DC2626', // 빨강
    icon: '🏛️',
    schedule: { ko: '09:30~17:00 / 30~40분 간격', zh: '09:30~17:00 / 30~40分钟间隔', en: '09:30-17:00 / every 30-40min' },
    duration: { ko: '약 1시간 30분', zh: '约1小时30分', en: '~1h 30min' },
    price: { adult: 25000, child: 18000 },
    stops: [
      { id: 't1', name: { ko: '광화문', zh: '光化门', en: 'Gwanghwamun' }, lat: 37.5760, lng: 126.9769, isTicketStop: true },
      { id: 't2', name: { ko: '덕수궁', zh: '德寿宫', en: 'Deoksugung' }, lat: 37.5658, lng: 126.9750, isTicketStop: false },
      { id: 't3', name: { ko: '남대문시장', zh: '南大门市场', en: 'Namdaemun Market' }, lat: 37.5593, lng: 126.9775, isTicketStop: false },
      { id: 't4', name: { ko: '서울역', zh: '首尔站', en: 'Seoul Station' }, lat: 37.5547, lng: 126.9707, isTicketStop: false },
      { id: 't5', name: { ko: '전쟁기념관', zh: '战争纪念馆', en: 'War Memorial' }, lat: 37.5350, lng: 126.9773, isTicketStop: false },
      { id: 't6', name: { ko: '용산역', zh: '龙山站', en: 'Yongsan Station' }, lat: 37.5299, lng: 126.9647, isTicketStop: false },
      { id: 't7', name: { ko: '국립중앙박물관', zh: '国立中央博物馆', en: 'National Museum' }, lat: 37.5239, lng: 126.9803, isTicketStop: false },
      { id: 't8', name: { ko: '이태원', zh: '梨泰院', en: 'Itaewon' }, lat: 37.5346, lng: 126.9946, isTicketStop: false },
      { id: 't9', name: { ko: '명동', zh: '明洞', en: 'Myeongdong' }, lat: 37.5636, lng: 126.9827, isTicketStop: false },
      { id: 't10', name: { ko: '남산골 한옥마을', zh: '南山韩屋村', en: 'Namsangol Hanok Village' }, lat: 37.5590, lng: 126.9941, isTicketStop: false },
      { id: 't11', name: { ko: '앰배서더호텔', zh: '大使酒店', en: 'Ambassador Hotel' }, lat: 37.5570, lng: 126.9960, isTicketStop: false },
      { id: 't12', name: { ko: '신라호텔·장충단공원', zh: '新罗酒店·奖忠坛公园', en: 'Shilla Hotel' }, lat: 37.5534, lng: 127.0010, isTicketStop: false },
      { id: 't13', name: { ko: 'N서울타워', zh: 'N首尔塔', en: 'N Seoul Tower' }, lat: 37.5512, lng: 126.9882, isTicketStop: false },
      { id: 't14', name: { ko: '하얏트호텔', zh: '凯悦酒店', en: 'Hyatt Hotel' }, lat: 37.5558, lng: 126.9788, isTicketStop: false },
      { id: 't15', name: { ko: '동대문DDP', zh: '东大门DDP', en: 'DDP Dongdaemun' }, lat: 37.5673, lng: 127.0095, isTicketStop: true },
      { id: 't16', name: { ko: '대학로', zh: '大学路', en: 'Daehangno' }, lat: 37.5811, lng: 127.0030, isTicketStop: false },
      { id: 't17', name: { ko: '창경궁', zh: '昌庆宫', en: 'Changgyeonggung' }, lat: 37.5789, lng: 126.9952, isTicketStop: false },
      { id: 't18', name: { ko: '창덕궁', zh: '昌德宫', en: 'Changdeokgung' }, lat: 37.5794, lng: 126.9910, isTicketStop: false },
      { id: 't19', name: { ko: '인사동', zh: '仁寺洞', en: 'Insadong' }, lat: 37.5743, lng: 126.9858, isTicketStop: false },
      { id: 't20', name: { ko: '청와대', zh: '青瓦台', en: 'Cheongwadae' }, lat: 37.5866, lng: 126.9749, isTicketStop: false },
      { id: 't21', name: { ko: '경복궁', zh: '景福宫', en: 'Gyeongbokgung' }, lat: 37.5796, lng: 126.9770, isTicketStop: false },
      { id: 't22', name: { ko: '세종문화회관', zh: '世宗文化会馆', en: 'Sejong Center' }, lat: 37.5726, lng: 126.9766, isTicketStop: false },
    ],
  },
  {
    id: 'traditional-night',
    label: { ko: '전통문화코스 (야간)', zh: '传统文化线路（夜间）', en: 'Traditional Culture (Night)' },
    color: '#7C3AED', // 보라
    icon: '🌃',
    schedule: { ko: '3월 19:00 출발 / 1회 운행', zh: '3月19:00出发 / 1班次', en: 'Mar 19:00 / 1 trip' },
    duration: { ko: '약 1시간', zh: '约1小时', en: '~1h' },
    price: { adult: 20000, child: 17000 },
    stops: [
      { id: 'n1', name: { ko: '광화문', zh: '光化门', en: 'Gwanghwamun' }, lat: 37.5760, lng: 126.9769, isTicketStop: true },
      { id: 'n2', name: { ko: '마포대교 (무정차)', zh: '麻浦大桥（不停）', en: 'Mapo Bridge (no stop)' }, lat: 37.5367, lng: 126.9427, isTicketStop: false, noStop: true },
      { id: 'n3', name: { ko: '여의도 (무정차)', zh: '汝矣岛（不停）', en: 'Yeouido (no stop)' }, lat: 37.5219, lng: 126.9245, isTicketStop: false, noStop: true },
      { id: 'n4', name: { ko: 'N서울타워', zh: 'N首尔塔', en: 'N Seoul Tower' }, lat: 37.5512, lng: 126.9882, isTicketStop: false },
      { id: 'n5', name: { ko: '남대문시장', zh: '南大门市场', en: 'Namdaemun Market' }, lat: 37.5593, lng: 126.9775, isTicketStop: false },
      { id: 'n6', name: { ko: '청계광장', zh: '清溪广场', en: 'Cheonggyecheon' }, lat: 37.5691, lng: 126.9784, isTicketStop: false },
    ],
  },
  {
    id: 'panorama',
    label: { ko: '서울파노라마코스', zh: '首尔全景线路', en: 'Seoul Panorama' },
    color: '#059669', // 녹색
    icon: '🚌',
    schedule: { ko: '09:30~17:00 / 35~45분 간격', zh: '09:30~17:00 / 35~45分钟间隔', en: '09:30-17:00 / every 35-45min' },
    duration: { ko: '약 1시간 50분', zh: '约1小时50分', en: '~1h 50min' },
    price: { adult: 25000, child: 18000 },
    stops: [
      { id: 'p1', name: { ko: '광화문', zh: '光化门', en: 'Gwanghwamun' }, lat: 37.5760, lng: 126.9769, isTicketStop: true },
      { id: 'p2', name: { ko: '명동', zh: '明洞', en: 'Myeongdong' }, lat: 37.5636, lng: 126.9827, isTicketStop: false },
      { id: 'p3', name: { ko: '서울애니메이션센터', zh: '首尔动漫中心', en: 'Seoul Animation Center' }, lat: 37.5553, lng: 126.9811, isTicketStop: false },
      { id: 'p4', name: { ko: '남산케이블카', zh: '南山缆车', en: 'Namsan Cable Car' }, lat: 37.5570, lng: 126.9813, isTicketStop: false },
      { id: 'p5', name: { ko: '힐튼호텔', zh: '希尔顿酒店', en: 'Hilton Hotel' }, lat: 37.5531, lng: 126.9718, isTicketStop: false },
      { id: 'p6', name: { ko: '남산도서관', zh: '南山图书馆', en: 'Namsan Library' }, lat: 37.5509, lng: 126.9862, isTicketStop: false },
      { id: 'p7', name: { ko: '하얏트호텔', zh: '凯悦酒店', en: 'Hyatt Hotel' }, lat: 37.5558, lng: 126.9788, isTicketStop: false },
      { id: 'p8', name: { ko: '강남역', zh: '江南站', en: 'Gangnam Station' }, lat: 37.4981, lng: 127.0276, isTicketStop: false },
      { id: 'p9', name: { ko: '세빛섬', zh: '盘浦彩虹喷泉', en: 'Sebitseom' }, lat: 37.5117, lng: 126.9957, isTicketStop: false },
      { id: 'p10', name: { ko: '노량진수산시장', zh: '鹭梁津水产市场', en: 'Noryangjin Fish Market' }, lat: 37.5133, lng: 126.9407, isTicketStop: false },
      { id: 'p11', name: { ko: '63빌딩', zh: '63大厦', en: '63 Building' }, lat: 37.5198, lng: 126.9401, isTicketStop: false },
      { id: 'p12', name: { ko: '여의나루역', zh: '汝矣渡口站', en: 'Yeouinaru Station' }, lat: 37.5272, lng: 126.9327, isTicketStop: false },
      { id: 'p13', name: { ko: '홍대앞', zh: '弘大前', en: 'Hongdae' }, lat: 37.5563, lng: 126.9237, isTicketStop: false },
      { id: 'p14', name: { ko: '홍대입구역', zh: '弘大入口站', en: 'Hongik Univ. Station' }, lat: 37.5572, lng: 126.9249, isTicketStop: false },
      { id: 'p15', name: { ko: '이대입구', zh: '梨大入口', en: 'Ewha Womans Univ.' }, lat: 37.5589, lng: 126.9462, isTicketStop: false },
      { id: 'p16', name: { ko: '농업박물관', zh: '农业博物馆', en: 'Agricultural Museum' }, lat: 37.5688, lng: 126.9666, isTicketStop: false },
      { id: 'p17', name: { ko: '역사박물관', zh: '历史博物馆', en: 'History Museum' }, lat: 37.5720, lng: 126.9693, isTicketStop: false },
      { id: 'p18', name: { ko: '세종문화회관', zh: '世宗文化会馆', en: 'Sejong Center' }, lat: 37.5726, lng: 126.9766, isTicketStop: false },
    ],
  },
]

// 매표소 위치 (별도 하이라이트용)
export const TICKET_OFFICES = [
  { id: 'ticket-gwanghwamun', name: { ko: '광화문 매표소', zh: '光化门售票处', en: 'Gwanghwamun Ticket Office' }, lat: 37.5760, lng: 126.9769, desc: { ko: '세종문화회관 앞', zh: '世宗文化会馆前', en: 'In front of Sejong Center' } },
  { id: 'ticket-ddp', name: { ko: '동대문DDP 매표소', zh: '东大门DDP售票处', en: 'DDP Ticket Office' }, lat: 37.5673, lng: 127.0095, desc: { ko: 'DDP 맞은편', zh: 'DDP对面', en: 'Across from DDP' } },
]

// 가격 포맷
export function formatPrice(price, lang) {
  if (lang === 'zh') return `成人 ¥${Math.round(price.adult / 180)} / 儿童 ¥${Math.round(price.child / 180)}`
  if (lang === 'en') return `Adult ₩${price.adult.toLocaleString()} / Child ₩${price.child.toLocaleString()}`
  return `성인 ${price.adult.toLocaleString()}원 / 소인 ${price.child.toLocaleString()}원`
}
