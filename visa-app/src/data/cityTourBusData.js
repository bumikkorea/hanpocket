/**
 * 서울시티투어버스 (Seoul City Tour Bus) 노선 및 정류소 데이터
 *
 * === 운영사 ===
 * 1) 서울시티투어버스(주) (Tiger Bus) — TOUR01, TOUR02, TOUR04, Gangnam
 *    공식: https://www.seoulcitybus.com / https://en.seoulcitybus.com
 *    전화: 02-777-6090
 *
 * 2) 노랑풍선시티버스 (Yellow Balloon) — 전통문화, 한강잠실, 야경
 *    공식: https://www.seoulcitytourbus.co.kr
 *
 * === 좌표 출처 ===
 * - TOUR01, TOUR04: en.seoulcitybus.com 공식 좌표
 * - 전통문화: seoulcitytourbus.co.kr + 카카오맵 보정
 * - 파노라마, 강남: 카카오맵/네이버맵 기반 추정 좌표
 *
 * === 마지막 업데이트 ===
 * 2026-03-16
 */

// ─────────────────────────────────────────────
// 노선(Route) 메타데이터
// ─────────────────────────────────────────────
export const CITY_TOUR_ROUTES = [
  {
    id: 'downtown',
    operator: 'tiger',
    tourCode: 'TOUR01',
    name: { ko: '도심고궁남산코스', zh: '市中心宫殿南山路线', en: 'Downtown Palace Namsan' },
    color: '#E53935',
    lineColor: '#E53935',
    emoji: '🔴',
    interval: { ko: '30분 간격', zh: '每30分钟', en: 'Every 30 min' },
    hours: { ko: '09:20~16:50', zh: '09:20~16:50', en: '09:20–16:50' },
    duration: { ko: '약 1시간 30분', zh: '约1小时30分', en: 'Approx. 1h 30min' },
    price: {
      adult: 25000,
      child: 17000,
      formatted: { ko: '성인 25,000원 / 소인 17,000원', zh: '成人25,000韩元 / 儿童17,000韩元', en: 'Adult ₩25,000 / Child ₩17,000' }
    },
    hopOnOff: true,
    closedDay: { ko: '매주 월요일 (공휴일 운행)', zh: '每周一休息（公休日运行）', en: 'Closed Mondays (operates on holidays)' },
    audioGuide: '12 languages',
    busType: { ko: '2층 오픈탑 / 하프탑', zh: '双层敞篷/半敞篷', en: 'Open-top / Half-top double-decker' },
    description: {
      ko: '광화문에서 출발, 명동·남산타워·고궁·인사동 등 서울 핵심 관광지를 순환하는 Hop-On Hop-Off 코스',
      zh: '从光化门出发，环游明洞·南山塔·古宫·仁寺洞等首尔核心景点的随上随下路线',
      en: 'Hop-on hop-off loop from Gwanghwamun through Myeongdong, N Seoul Tower, palaces, and Insadong'
    },
    website: 'https://en.seoulcitybus.com'
  },
  {
    id: 'night',
    operator: 'tiger',
    tourCode: 'TOUR04',
    name: { ko: '야경코스 (한강·남산)', zh: '夜景路线（汉江·南山）', en: 'Night View (Han River & Namsan)' },
    color: '#1E88E5',
    lineColor: '#1E88E5',
    emoji: '🔵',
    interval: { ko: '1일 1회 (화~일)', zh: '每天1班（周二至周日）', en: '1 trip/day (Tue–Sun)' },
    hours: { ko: '19:00 출발 (5~8월 19:30)', zh: '19:00出发（5-8月19:30）', en: 'Departs 19:00 (19:30 May–Aug)' },
    duration: { ko: '약 1시간 30분', zh: '约1小时30分', en: 'Approx. 1h 30min' },
    price: {
      adult: 23000,
      child: 14000,
      formatted: { ko: '성인 23,000원 / 소인 14,000원', zh: '成人23,000韩元 / 儿童14,000韩元', en: 'Adult ₩23,000 / Child ₩14,000' }
    },
    hopOnOff: false,
    closedDay: { ko: '매주 월요일', zh: '每周一休息', en: 'Closed Mondays' },
    minPassengers: 10,
    audioGuide: '12 languages',
    busType: { ko: '2층 오픈탑', zh: '双层敞篷', en: 'Open-top double-decker' },
    description: {
      ko: '한강 다리 위 야경과 남산타워 야경을 감상하는 무정차 코스 (남산타워 20~30분 정차)',
      zh: '欣赏汉江桥上夜景和南山塔夜景的不停车路线（南山塔停留20-30分钟）',
      en: 'Non-stop night course over Han River bridges with 20–30 min photo stop at N Seoul Tower'
    },
    website: 'https://en.seoulcitybus.com'
  },
  {
    id: 'traditional',
    operator: 'yellowballoon',
    tourCode: 'TOUR11',
    name: { ko: '전통문화코스', zh: '传统文化路线', en: 'Traditional Culture' },
    color: '#43A047',
    lineColor: '#43A047',
    emoji: '🟢',
    interval: { ko: '30~40분 간격', zh: '每30-40分钟', en: 'Every 30–40 min' },
    hours: { ko: '09:30~17:00', zh: '09:30~17:00', en: '09:30–17:00' },
    duration: { ko: '약 1시간 30분', zh: '约1小时30分', en: 'Approx. 1h 30min' },
    price: {
      adult: 25000,
      child: 18000,
      formatted: { ko: '성인 25,000원 / 소인 18,000원', zh: '成人25,000韩元 / 儿童18,000韩元', en: 'Adult ₩25,000 / Child ₩18,000' }
    },
    hopOnOff: true,
    closedDay: { ko: '매주 월요일', zh: '每周一休息', en: 'Closed Mondays' },
    audioGuide: '4 languages (ko/en/zh/ja)',
    busType: { ko: '2층버스', zh: '双层巴士', en: 'Double-decker' },
    description: {
      ko: 'DDP에서 출발, 전통시장·궁궐·인사동을 잇는 문화 순환 코스',
      zh: '从DDP出发，连接传统市场·宫殿·仁寺洞的文化循环路线',
      en: 'Cultural loop from DDP through traditional markets, palaces, and Insadong'
    },
    website: 'https://www.seoulcitytourbus.co.kr'
  },
  {
    id: 'panorama',
    operator: 'tiger',
    tourCode: 'TOUR02',
    name: { ko: '서울파노라마코스', zh: '首尔全景路线', en: 'Seoul Panorama' },
    color: '#FB8C00',
    lineColor: '#FB8C00',
    emoji: '🟠',
    interval: { ko: '45~70분 간격', zh: '每45-70分钟', en: 'Every 45–70 min' },
    hours: { ko: '09:00~17:10', zh: '09:00~17:10', en: '09:00–17:10' },
    duration: { ko: '약 2시간', zh: '约2小时', en: 'Approx. 2 hours' },
    price: {
      adult: 25000,
      child: 17000,
      formatted: { ko: '성인 25,000원 / 소인 17,000원', zh: '成人25,000韩元 / 儿童17,000韩元', en: 'Adult ₩25,000 / Child ₩17,000' }
    },
    hopOnOff: true,
    closedDay: { ko: '매주 월요일', zh: '每周一休息', en: 'Closed Mondays' },
    audioGuide: '12 languages',
    busType: { ko: '2층 오픈탑', zh: '双层敞篷', en: 'Open-top double-decker' },
    description: {
      ko: '광화문에서 출발, 남산·강남·여의도·홍대 등 서울 전역을 한눈에 보는 파노라마 코스',
      zh: '从光化门出发，一览南山·江南·汝矣岛·弘大等首尔全景路线',
      en: 'Panoramic loop from Gwanghwamun through Namsan, Gangnam, Yeouido, and Hongdae'
    },
    website: 'https://en.seoulcitybus.com'
  },
  {
    id: 'gangnam',
    operator: 'tiger',
    tourCode: 'TOUR03',
    name: { ko: '강남순환코스', zh: '江南循环路线', en: 'Around Gangnam' },
    color: '#8E24AA',
    lineColor: '#8E24AA',
    emoji: '🟣',
    interval: { ko: '약 60분 간격', zh: '约60分钟', en: 'Approx. every 60 min' },
    hours: { ko: '10:00~20:00', zh: '10:00~20:00', en: '10:00–20:00' },
    duration: { ko: '약 1시간 30분', zh: '约1小时30分', en: 'Approx. 1h 30min' },
    price: {
      adult: 20000,
      child: 15000,
      formatted: { ko: '성인 20,000원 / 소인 15,000원', zh: '成人20,000韩元 / 儿童15,000韩元', en: 'Adult ₩20,000 / Child ₩15,000' }
    },
    hopOnOff: true,
    closedDay: { ko: '매주 월요일', zh: '每周一休息', en: 'Closed Mondays' },
    audioGuide: '12 languages',
    busType: { ko: '2층버스', zh: '双层巴士', en: 'Double-decker' },
    description: {
      ko: '강남역에서 출발, 가로수길·코엑스·롯데타워·세빛섬·서래마을을 순환',
      zh: '从江南站出发，环游林荫路·COEX·乐天塔·三光岛·瑞来村',
      en: 'Loop from Gangnam Station through Garosu-gil, COEX, Lotte Tower, Sebitseom, and Seorae Village'
    },
    website: 'https://en.seoulcitybus.com'
  },
  {
    id: 'traditional_night',
    operator: 'yellowballoon',
    tourCode: 'TOUR11N',
    name: { ko: '전통문화 야경코스', zh: '传统文化夜景路线', en: 'Traditional Culture Night' },
    color: '#00897B',
    lineColor: '#00897B',
    emoji: '🌙',
    interval: { ko: '1일 1회', zh: '每天1班', en: '1 trip/day' },
    hours: { ko: '18:30 (3월) / 19:00 (9~10월) / 19:30 (4~8월)', zh: '18:30(3月)/19:00(9-10月)/19:30(4-8月)', en: '18:30 (Mar) / 19:00 (Sep–Oct) / 19:30 (Apr–Aug)' },
    duration: { ko: '약 1시간', zh: '约1小时', en: 'Approx. 1 hour' },
    price: {
      adult: 20000,
      child: 17000,
      formatted: { ko: '성인 20,000원 / 소인 17,000원', zh: '成人20,000韩元 / 儿童17,000韩元', en: 'Adult ₩20,000 / Child ₩17,000' }
    },
    hopOnOff: false,
    closedDay: { ko: '매주 월요일', zh: '每周一休息', en: 'Closed Mondays' },
    busType: { ko: '2층버스', zh: '双层巴士', en: 'Double-decker' },
    description: {
      ko: 'DDP에서 출발, 서울 도심 야경을 감상하는 무정차 코스',
      zh: '从DDP出发，欣赏首尔市中心夜景的不停车路线',
      en: 'Non-stop night loop from DDP through illuminated downtown Seoul'
    },
    website: 'https://www.seoulcitytourbus.co.kr'
  }
]

// ─────────────────────────────────────────────
// 정류소(Stop) 데이터
// ─────────────────────────────────────────────

export const CITY_TOUR_STOPS = [

  // ═══════════════════════════════════════════
  // TOUR01 — 도심고궁남산코스 (Downtown Palace Namsan)
  // 출처: en.seoulcitybus.com 공식 좌표
  // ═══════════════════════════════════════════
  { route: 'downtown', order: 1,  name: { ko: '광화문역', zh: '光化门站', en: 'Gwanghwamun Station' },
    lat: 37.568626, lng: 126.976952, isStart: true,
    address: '서울 중구 태평로1가 63-1',
    landmark: { ko: '시티투어 매표소', zh: '城市观光巴士售票处', en: 'City Tour Ticket Office' } },
  { route: 'downtown', order: 2,  name: { ko: '명동', zh: '明洞', en: 'Myeongdong' },
    lat: 37.56075, lng: 126.98561,
    address: '서울 중구 퇴계로 124-1',
    landmark: { ko: '명동 쇼핑거리', zh: '明洞购物街', en: 'Myeongdong Shopping Street' } },
  { route: 'downtown', order: 3,  name: { ko: '남산골 한옥마을', zh: '南山谷韩屋村', en: 'Namsangol Hanok Village' },
    lat: 37.56093, lng: 126.99254,
    address: '서울 중구 필동1가 22-1',
    landmark: { ko: '남산골 한옥마을', zh: '南山谷韩屋村', en: 'Namsangol Hanok Village' } },
  { route: 'downtown', order: 4,  name: { ko: '앰배서더 서울 풀만 호텔', zh: '首尔铂尔曼大使酒店', en: 'Ambassador Seoul Pullman Hotel' },
    lat: 37.56048, lng: 127.00259,
    address: '서울 중구 장충동2가 186-169',
    landmark: { ko: '앰배서더 호텔 앞', zh: '大使酒店前', en: 'In front of Ambassador Hotel' } },
  { route: 'downtown', order: 5,  name: { ko: '신라호텔·장충단공원', zh: '新罗酒店·奖忠坛公园', en: 'Shilla Hotel, Jangchungdan Park' },
    lat: 37.55833, lng: 127.00536,
    address: '서울 중구 장충동2가 산4-91',
    landmark: { ko: '신라호텔 앞', zh: '新罗酒店前', en: 'In front of Shilla Hotel' } },
  { route: 'downtown', order: 6,  name: { ko: 'N서울타워', zh: 'N首尔塔', en: 'N Seoul Tower' },
    lat: 37.55099, lng: 126.99111,
    address: '서울 중구 예장동 산5-6',
    landmark: { ko: '남산타워', zh: '南山塔', en: 'Namsan Tower' } },
  { route: 'downtown', order: 7,  name: { ko: '하얏트호텔', zh: '凯悦酒店', en: 'Hyatt Hotel' },
    lat: 37.54089, lng: 126.99718,
    address: '서울 용산구 이태원동 258-466',
    landmark: { ko: '그랜드 하얏트 서울', zh: '首尔君悦酒店', en: 'Grand Hyatt Seoul' } },
  { route: 'downtown', order: 8,  name: { ko: '동대문디자인플라자(DDP)·동대문시장', zh: '东大门设计广场·东大门市场', en: 'DDP, Dongdaemun Market' },
    lat: 37.566874, lng: 127.008622,
    address: '서울 중구 을지로7가 2-34',
    landmark: { ko: 'DDP 앞', zh: 'DDP前', en: 'In front of DDP' } },
  { route: 'downtown', order: 9,  name: { ko: '대학로', zh: '大学路', en: 'Daehak-ro' },
    lat: 37.579918, lng: 127.002214,
    address: '서울 종로구 동숭동 1-177',
    landmark: { ko: '마로니에공원', zh: '栗树公园', en: 'Marronnier Park' } },
  { route: 'downtown', order: 10, name: { ko: '창경궁', zh: '昌庆宫', en: 'Changgyeonggung Palace' },
    lat: 37.57919, lng: 126.99646,
    address: '서울 종로구 와룡동 2-87',
    landmark: { ko: '창경궁 정문', zh: '昌庆宫正门', en: 'Changgyeonggung Main Gate' } },
  { route: 'downtown', order: 11, name: { ko: '창덕궁', zh: '昌德宫', en: 'Changdeokgung Palace' },
    lat: 37.57756, lng: 126.99017,
    address: '서울 종로구 와룡동 8',
    landmark: { ko: '창덕궁 정문(돈화문)', zh: '昌德宫正门(敦化门)', en: 'Donhwamun Gate' } },
  { route: 'downtown', order: 12, name: { ko: '인사동·북촌', zh: '仁寺洞·北村', en: 'Insadong, Bukchon' },
    lat: 37.57591, lng: 126.98375,
    address: '서울 종로구 안국동 175-92',
    landmark: { ko: '인사동 입구', zh: '仁寺洞入口', en: 'Insadong Entrance' } },
  { route: 'downtown', order: 13, name: { ko: '청와대 앞', zh: '青瓦台前', en: 'Cheongwadae (Blue House)' },
    lat: 37.58269, lng: 126.97378,
    address: '서울 종로구 세종로 1-39',
    landmark: { ko: '청와대 앞', zh: '青瓦台前', en: 'In front of Blue House' } },
  { route: 'downtown', order: 14, name: { ko: '경복궁·민속박물관·현대미술관', zh: '景福宫·民俗博物馆·现代美术馆', en: 'Gyeongbokgung, Folk Museum, Modern Art' },
    lat: 37.58019, lng: 126.97986,
    address: '서울 종로구 세종로 1-61',
    landmark: { ko: '경복궁 정문(광화문)', zh: '景福宫正门(光化门)', en: 'Gwanghwamun Gate' } },
  { route: 'downtown', order: 15, name: { ko: '세종문화회관·광화문광장', zh: '世宗文化会馆·光化门广场', en: 'Sejong Center, Gwanghwamun Square' },
    lat: 37.572133, lng: 126.976399,
    address: '서울 종로구 세종로 1-68',
    landmark: { ko: '세종대왕 동상', zh: '世宗大王铜像', en: 'King Sejong Statue' } },

  // ═══════════════════════════════════════════
  // TOUR04 — 야경코스 (Night View: Han River & Namsan)
  // 출처: en.seoulcitybus.com 공식 좌표
  // non-stop = 무정차 통과 (차창 감상)
  // ═══════════════════════════════════════════
  { route: 'night', order: 1,  name: { ko: '광화문역', zh: '光化门站', en: 'Gwanghwamun Station' },
    lat: 37.568626, lng: 126.976952, isStart: true,
    address: '서울 중구 태평로1가 63-1',
    landmark: { ko: '시티투어 매표소 (출발)', zh: '城市观光巴士售票处（出发）', en: 'Ticket Office (departure)' } },
  { route: 'night', order: 2,  name: { ko: '강변북로', zh: '江边北路', en: 'Gangbyeon-bukro' },
    lat: 37.523478, lng: 126.955790, nonStop: true,
    address: '서울 용산구 이촌동 379',
    landmark: { ko: '한강변 야경 (무정차)', zh: '汉江边夜景（不停车）', en: 'Han River view (non-stop)' } },
  { route: 'night', order: 3,  name: { ko: '반포대교', zh: '盘浦大桥', en: 'Banpo Bridge' },
    lat: 37.519101, lng: 126.994303, nonStop: true,
    address: '서울 용산구 서빙고동 287-3',
    landmark: { ko: '달빛무지개분수', zh: '月光彩虹喷泉', en: 'Moonlight Rainbow Fountain' } },
  { route: 'night', order: 4,  name: { ko: '성수대교', zh: '圣水大桥', en: 'Seongsu Bridge' },
    lat: 37.537385, lng: 127.034912, nonStop: true,
    address: '서울 성동구 옥수동 484',
    landmark: { ko: '한강 야경 (무정차)', zh: '汉江夜景（不停车）', en: 'Han River night view (non-stop)' } },
  { route: 'night', order: 5,  name: { ko: '한남대교', zh: '汉南大桥', en: 'Hannam Bridge' },
    lat: 37.526939, lng: 127.013269, nonStop: true,
    address: '서울 강남구 신사동 490',
    landmark: { ko: '한강 야경 (무정차)', zh: '汉江夜景（不停车）', en: 'Han River night view (non-stop)' } },
  { route: 'night', order: 6,  name: { ko: 'N서울타워', zh: 'N首尔塔', en: 'N Seoul Tower' },
    lat: 37.55099, lng: 126.99111, photoStop: true, photoStopMinutes: 25,
    address: '서울 중구 예장동 산5-6',
    landmark: { ko: '남산타워 야경 (20~30분 정차)', zh: '南山塔夜景（停留20-30分钟）', en: 'Namsan Tower night view (20–30 min stop)' } },
  { route: 'night', order: 7,  name: { ko: '남대문시장', zh: '南大门市场', en: 'Namdaemun Market' },
    lat: 37.559875, lng: 126.975772, nonStop: true,
    address: '서울 중구 남대문로4가 24',
    landmark: { ko: '남대문 야경 (무정차)', zh: '南大门夜景（不停车）', en: 'Namdaemun night view (non-stop)' } },
  { route: 'night', order: 8,  name: { ko: '청계광장', zh: '清溪广场', en: 'Cheonggyecheon Plaza' },
    lat: 37.568545, lng: 126.977261, isEnd: true,
    address: '서울 중구 태평로1가 63-17',
    landmark: { ko: '청계천 야경 (종점)', zh: '清溪川夜景（终点）', en: 'Cheonggyecheon night view (final stop)' } },

  // ═══════════════════════════════════════════
  // 전통문화코스 (Traditional Culture) — Yellow Balloon
  // 출처: seoulcitytourbus.co.kr 공식 정류장명 + 카카오맵 좌표
  // 출발: DDP (동대문디자인플라자)
  // ═══════════════════════════════════════════
  { route: 'traditional', order: 1,  name: { ko: '동대문디자인플라자(DDP)', zh: '东大门设计广场(DDP)', en: 'Dongdaemun Design Plaza (DDP)' },
    lat: 37.5671, lng: 127.0095, isStart: true,
    landmark: { ko: 'DDP 앞 매표소', zh: 'DDP前售票处', en: 'DDP Ticket Office' } },
  { route: 'traditional', order: 2,  name: { ko: '방산·중부시장', zh: '芳山·中部市场', en: 'Bangsan & Jungbu Market' },
    lat: 37.5672, lng: 127.0010,
    landmark: { ko: '방산종합시장', zh: '芳山综合市场', en: 'Bangsan Market' } },
  { route: 'traditional', order: 3,  name: { ko: '을지로3가', zh: '乙支路3街', en: 'Euljiro 3-ga' },
    lat: 37.5666, lng: 126.9924,
    landmark: { ko: '을지로3가역', zh: '乙支路3街站', en: 'Euljiro 3-ga Station' } },
  { route: 'traditional', order: 4,  name: { ko: '을지로입구', zh: '乙支路入口', en: 'Euljiro Entrance' },
    lat: 37.5660, lng: 126.9827,
    landmark: { ko: '을지로입구역', zh: '乙支路入口站', en: 'Euljiro Entrance Station' } },
  { route: 'traditional', order: 5,  name: { ko: '청와대', zh: '青瓦台', en: 'Cheongwadae (Blue House)' },
    lat: 37.5868, lng: 126.9748,
    landmark: { ko: '청와대 관람', zh: '青瓦台参观', en: 'Blue House Tour' } },
  { route: 'traditional', order: 6,  name: { ko: '통인시장', zh: '通仁市场', en: 'Tongin Market' },
    lat: 37.5790, lng: 126.9688,
    landmark: { ko: '통인시장 도시락카페', zh: '通仁市场便当咖啡厅', en: 'Tongin Market Dosirak Cafe' } },
  { route: 'traditional', order: 7,  name: { ko: '광화문광장', zh: '光化门广场', en: 'Gwanghwamun Plaza' },
    lat: 37.5724, lng: 126.9769,
    landmark: { ko: '세종대왕 동상', zh: '世宗大王铜像', en: 'King Sejong Statue' } },
  { route: 'traditional', order: 8,  name: { ko: '서울역', zh: '首尔站', en: 'Seoul Station' },
    lat: 37.5547, lng: 126.9707,
    landmark: { ko: '서울역 버스환승센터', zh: '首尔站换乘中心', en: 'Seoul Station Bus Transfer Center' } },
  { route: 'traditional', order: 9,  name: { ko: '남대문시장', zh: '南大门市场', en: 'Namdaemun Market' },
    lat: 37.5592, lng: 126.9773,
    landmark: { ko: '남대문시장 입구', zh: '南大门市场入口', en: 'Namdaemun Market Entrance' } },
  { route: 'traditional', order: 10, name: { ko: '남산오르미', zh: '南山电梯', en: 'Namsan Orumi (Elevator)' },
    lat: 37.5569, lng: 126.9818,
    landmark: { ko: '남산오르미 승강장', zh: '南山电梯站', en: 'Namsan Elevator Station' } },
  { route: 'traditional', order: 11, name: { ko: '명동', zh: '明洞', en: 'Myeongdong' },
    lat: 37.5636, lng: 126.9827,
    landmark: { ko: '명동 입구', zh: '明洞入口', en: 'Myeongdong Entrance' } },
  { route: 'traditional', order: 12, name: { ko: '종각', zh: '钟阁', en: 'Jonggak' },
    lat: 37.5700, lng: 126.9831,
    landmark: { ko: '종각역', zh: '钟阁站', en: 'Jonggak Station' } },
  { route: 'traditional', order: 13, name: { ko: '인사동·탑골공원', zh: '仁寺洞·塔谷公园', en: 'Insadong, Tapgol Park' },
    lat: 37.5737, lng: 126.9857,
    landmark: { ko: '인사동 쌈지길', zh: '仁寺洞Ssamziegil', en: 'Insadong Ssamziegil' } },
  { route: 'traditional', order: 14, name: { ko: '종묘·세운상가', zh: '宗庙·世运商街', en: 'Jongmyo Shrine, Sewoon Sangga' },
    lat: 37.5743, lng: 126.9941,
    landmark: { ko: '종묘 유네스코 세계유산', zh: '宗庙UNESCO世界遗产', en: 'Jongmyo UNESCO Heritage' } },
  { route: 'traditional', order: 15, name: { ko: '광장시장', zh: '广藏市场', en: 'Gwangjang Market' },
    lat: 37.5700, lng: 126.9994,
    landmark: { ko: '광장시장 먹자골목', zh: '广藏市场美食街', en: 'Gwangjang Market Food Alley' } },

  // ═══════════════════════════════════════════
  // TOUR02 — 서울파노라마코스 (Seoul Panorama)
  // 출처: 검색 데이터 종합 + 카카오맵/네이버맵 좌표
  // 출발: 광화문
  // ═══════════════════════════════════════════
  { route: 'panorama', order: 1,  name: { ko: '광화문역', zh: '光化门站', en: 'Gwanghwamun Station' },
    lat: 37.568626, lng: 126.976952, isStart: true,
    landmark: { ko: '시티투어 매표소 (출발)', zh: '城市观光巴士售票处（出发）', en: 'Ticket Office (departure)' } },
  { route: 'panorama', order: 2,  name: { ko: '명동', zh: '明洞', en: 'Myeongdong' },
    lat: 37.5608, lng: 126.9856,
    landmark: { ko: '명동 쇼핑거리', zh: '明洞购物街', en: 'Myeongdong Shopping' } },
  { route: 'panorama', order: 3,  name: { ko: '남산케이블카 앞', zh: '南山缆车前', en: 'Namsan Cable Car' },
    lat: 37.5560, lng: 126.9812,
    landmark: { ko: '남산 케이블카 승강장', zh: '南山缆车站', en: 'Namsan Cable Car Station' } },
  { route: 'panorama', order: 4,  name: { ko: '밀레니엄 힐튼호텔', zh: '千禧希尔顿酒店', en: 'Millennium Hilton Hotel' },
    lat: 37.5530, lng: 126.9724,
    landmark: { ko: '힐튼호텔 앞', zh: '希尔顿酒店前', en: 'In front of Hilton Hotel' } },
  { route: 'panorama', order: 5,  name: { ko: '남산도서관', zh: '南山图书馆', en: 'Namsan Library' },
    lat: 37.5509, lng: 126.9880,
    landmark: { ko: '남산도서관', zh: '南山图书馆', en: 'Namsan Library' } },
  { route: 'panorama', order: 6,  name: { ko: '하얏트호텔', zh: '凯悦酒店', en: 'Hyatt Hotel' },
    lat: 37.5409, lng: 126.9972,
    landmark: { ko: '그랜드 하얏트 서울', zh: '首尔君悦酒店', en: 'Grand Hyatt Seoul' } },
  { route: 'panorama', order: 7,  name: { ko: '강남역', zh: '江南站', en: 'Gangnam Station' },
    lat: 37.4979, lng: 127.0276,
    landmark: { ko: '강남역 (강남순환 환승)', zh: '江南站（江南循环换乘）', en: 'Gangnam Stn. (transfer to Gangnam loop)' } },
  { route: 'panorama', order: 8,  name: { ko: '세빛섬', zh: '三光岛', en: 'Sebitseom (Some Sevit)' },
    lat: 37.5119, lng: 126.9963,
    landmark: { ko: '세빛섬 (강남순환 환승)', zh: '三光岛（江南循环换乘）', en: 'Sebitseom (transfer to Gangnam loop)' } },
  { route: 'panorama', order: 9,  name: { ko: '63스퀘어', zh: '63广场', en: '63 Square' },
    lat: 37.5198, lng: 126.9400,
    landmark: { ko: '63빌딩', zh: '63大厦', en: '63 Building' } },
  { route: 'panorama', order: 10, name: { ko: '여의도역', zh: '汝矣岛站', en: 'Yeouido Station' },
    lat: 37.5219, lng: 126.9245,
    landmark: { ko: '여의도 한강공원', zh: '汝矣岛汉江公园', en: 'Yeouido Hangang Park' } },
  { route: 'panorama', order: 11, name: { ko: '홍대입구', zh: '弘大入口', en: 'Hongik Univ. (Hongdae)' },
    lat: 37.5572, lng: 126.9236,
    landmark: { ko: '홍대 거리', zh: '弘大街', en: 'Hongdae Street' } },
  { route: 'panorama', order: 12, name: { ko: '공항철도', zh: '机场铁路', en: 'Airport Railroad' },
    lat: 37.5528, lng: 126.9219,
    landmark: { ko: '공항철도 홍대입구역', zh: '机场铁路弘大入口站', en: 'AREX Hongdae Station' } },
  { route: 'panorama', order: 13, name: { ko: '이대입구', zh: '梨大入口', en: 'Ewha Womans Univ.' },
    lat: 37.5569, lng: 126.9464,
    landmark: { ko: '이화여대 앞', zh: '梨花女子大学前', en: 'In front of Ewha Womans Univ.' } },
  { route: 'panorama', order: 14, name: { ko: '농업박물관', zh: '农业博物馆', en: 'Museum of Agriculture' },
    lat: 37.5658, lng: 126.9660,
    landmark: { ko: '농업박물관', zh: '农业博物馆', en: 'National Museum of Agriculture' } },
  { route: 'panorama', order: 15, name: { ko: '서울역사박물관', zh: '首尔历史博物馆', en: 'Seoul Museum of History' },
    lat: 37.5721, lng: 126.9694,
    landmark: { ko: '경희궁 옆', zh: '庆熙宫旁', en: 'Next to Gyeonghuigung Palace' } },

  // ═══════════════════════════════════════════
  // TOUR03 — 강남순환코스 (Around Gangnam)
  // 출처: opengov.seoul.go.kr + 카카오맵 좌표
  // 출발: 강남역
  // ═══════════════════════════════════════════
  { route: 'gangnam', order: 1,  name: { ko: '강남역', zh: '江南站', en: 'Gangnam Station' },
    lat: 37.4979, lng: 127.0276, isStart: true,
    landmark: { ko: '강남역 (파노라마 환승)', zh: '江南站（全景路线换乘）', en: 'Gangnam Stn. (transfer to Panorama)' } },
  { route: 'gangnam', order: 2,  name: { ko: '영동시장', zh: '永东市场', en: 'Yeongdong Market' },
    lat: 37.5009, lng: 127.0343,
    landmark: { ko: '영동전통시장', zh: '永东传统市场', en: 'Yeongdong Traditional Market' } },
  { route: 'gangnam', order: 3,  name: { ko: '신사역', zh: '新沙站', en: 'Sinsa Station' },
    lat: 37.5167, lng: 127.0199,
    landmark: { ko: '신사역', zh: '新沙站', en: 'Sinsa Station' } },
  { route: 'gangnam', order: 4,  name: { ko: '가로수길 (남)', zh: '林荫路（南）', en: 'Garosu-gil (South)' },
    lat: 37.5181, lng: 127.0232,
    landmark: { ko: '가로수길 남쪽', zh: '林荫路南端', en: 'Southern Garosu-gil' } },
  { route: 'gangnam', order: 5,  name: { ko: '가로수길입구 (북)', zh: '林荫路入口（北）', en: 'Garosu-gil Entrance (North)' },
    lat: 37.5210, lng: 127.0230,
    landmark: { ko: '가로수길 북쪽 입구', zh: '林荫路北端入口', en: 'Northern Garosu-gil Entrance' } },
  { route: 'gangnam', order: 6,  name: { ko: '강남관광정보센터', zh: '江南旅游信息中心', en: 'Gangnam Tourist Info Center' },
    lat: 37.5205, lng: 127.0265,
    landmark: { ko: '강남관광정보센터', zh: '江南旅游信息中心', en: 'Gangnam Tourist Information Center' } },
  { route: 'gangnam', order: 7,  name: { ko: '로데오거리', zh: '罗德奥街', en: 'Rodeo Street' },
    lat: 37.5268, lng: 127.0398,
    landmark: { ko: '압구정 로데오거리', zh: '狎鸥亭罗德奥街', en: 'Apgujeong Rodeo Street' } },
  { route: 'gangnam', order: 8,  name: { ko: '패션거리(청담동)', zh: '时尚街（清潭洞）', en: 'Fashion Street (Cheongdam)' },
    lat: 37.5245, lng: 127.0475,
    landmark: { ko: '청담동 명품거리', zh: '清潭洞名品街', en: 'Cheongdam Luxury Street' } },
  { route: 'gangnam', order: 9,  name: { ko: '봉은사', zh: '奉恩寺', en: 'Bongeunsa Temple' },
    lat: 37.5147, lng: 127.0567,
    landmark: { ko: '봉은사', zh: '奉恩寺', en: 'Bongeunsa Temple' } },
  { route: 'gangnam', order: 10, name: { ko: '코엑스', zh: 'COEX', en: 'COEX' },
    lat: 37.5116, lng: 127.0590,
    landmark: { ko: '코엑스몰·별마당도서관', zh: 'COEX Mall·星空图书馆', en: 'COEX Mall & Starfield Library' } },
  { route: 'gangnam', order: 11, name: { ko: '삼성역', zh: '三成站', en: 'Samsung Station' },
    lat: 37.5089, lng: 127.0632,
    landmark: { ko: '삼성역', zh: '三成站', en: 'Samsung Station' } },
  { route: 'gangnam', order: 12, name: { ko: '세븐럭카지노', zh: 'Seven Luck赌场', en: 'Seven Luck Casino' },
    lat: 37.5130, lng: 127.0586,
    landmark: { ko: '세븐럭카지노 강남점', zh: 'Seven Luck赌场江南店', en: 'Seven Luck Casino Gangnam' } },
  { route: 'gangnam', order: 13, name: { ko: '한류스타거리', zh: '韩流明星街', en: 'Hallyu K-Star Road' },
    lat: 37.5198, lng: 127.0432,
    landmark: { ko: 'K-스타 로드', zh: 'K-Star路', en: 'K-Star Road' } },
  { route: 'gangnam', order: 14, name: { ko: '세빛섬', zh: '三光岛', en: 'Sebitseom (Some Sevit)' },
    lat: 37.5119, lng: 126.9963,
    landmark: { ko: '세빛섬 (파노라마 환승)', zh: '三光岛（全景路线换乘）', en: 'Sebitseom (transfer to Panorama)' } },
  { route: 'gangnam', order: 15, name: { ko: '고속버스터미널', zh: '高速巴士客运站', en: 'Express Bus Terminal' },
    lat: 37.5049, lng: 127.0048,
    landmark: { ko: '고속터미널·신세계백화점', zh: '高速客运站·新世界百货', en: 'Express Terminal & Shinsegae' } },
  { route: 'gangnam', order: 16, name: { ko: '서래마을', zh: '瑞来村', en: 'Seorae Village' },
    lat: 37.4950, lng: 127.0010,
    landmark: { ko: '서래마을 프랑스거리', zh: '瑞来村法国街', en: 'Seorae French Village' } },
  { route: 'gangnam', order: 17, name: { ko: '법원·교대역', zh: '法院·教大站', en: 'Court & Gyodae Station' },
    lat: 37.4934, lng: 127.0145,
    landmark: { ko: '서울중앙지법·교대역', zh: '首尔中央地方法院·教大站', en: 'Seoul Court & Gyodae Stn.' } },
  { route: 'gangnam', order: 18, name: { ko: '삼성타운', zh: '三星城', en: 'Samsung Town' },
    lat: 37.4968, lng: 127.0288,
    landmark: { ko: '삼성타운', zh: '三星城', en: 'Samsung Town' } },

  // ═══════════════════════════════════════════
  // 전통문화 야경코스 (Traditional Culture Night) — Yellow Balloon
  // 출처: 나무위키 + 카카오맵 좌표
  // 출발: DDP → 도심 순환 (무정차)
  // ═══════════════════════════════════════════
  { route: 'traditional_night', order: 1,  name: { ko: '동대문디자인플라자(DDP)', zh: '东大门设计广场(DDP)', en: 'DDP' },
    lat: 37.5671, lng: 127.0095, isStart: true,
    landmark: { ko: 'DDP 앞 (출발)', zh: 'DDP前（出发）', en: 'DDP (departure)' } },
  { route: 'traditional_night', order: 2,  name: { ko: '방산·중부시장', zh: '芳山·中部市场', en: 'Bangsan & Jungbu Market' },
    lat: 37.5672, lng: 127.0010, nonStop: true,
    landmark: { ko: '야경 (무정차)', zh: '夜景（不停车）', en: 'Night view (non-stop)' } },
  { route: 'traditional_night', order: 3,  name: { ko: '을지로3가', zh: '乙支路3街', en: 'Euljiro 3-ga' },
    lat: 37.5666, lng: 126.9924, nonStop: true,
    landmark: { ko: '야경 (무정차)', zh: '夜景（不停车）', en: 'Night view (non-stop)' } },
  { route: 'traditional_night', order: 4,  name: { ko: '을지로입구', zh: '乙支路入口', en: 'Euljiro Entrance' },
    lat: 37.5660, lng: 126.9827, nonStop: true,
    landmark: { ko: '야경 (무정차)', zh: '夜景（不停车）', en: 'Night view (non-stop)' } },
  { route: 'traditional_night', order: 5,  name: { ko: '청와대', zh: '青瓦台', en: 'Cheongwadae' },
    lat: 37.5868, lng: 126.9748, nonStop: true,
    landmark: { ko: '청와대 야경 (무정차)', zh: '青瓦台夜景（不停车）', en: 'Blue House night view (non-stop)' } },
  { route: 'traditional_night', order: 6,  name: { ko: '통인시장', zh: '通仁市场', en: 'Tongin Market' },
    lat: 37.5790, lng: 126.9688, nonStop: true,
    landmark: { ko: '야경 (무정차)', zh: '夜景（不停车）', en: 'Night view (non-stop)' } },
  { route: 'traditional_night', order: 7,  name: { ko: '세종문화회관', zh: '世宗文化会馆', en: 'Sejong Center' },
    lat: 37.5724, lng: 126.9769, nonStop: true,
    landmark: { ko: '광화문광장 야경 (무정차)', zh: '光化门广场夜景（不停车）', en: 'Gwanghwamun night view (non-stop)' } },
  { route: 'traditional_night', order: 8,  name: { ko: '서울역버스환승센터', zh: '首尔站换乘中心', en: 'Seoul Station Transfer' },
    lat: 37.5547, lng: 126.9707, nonStop: true,
    landmark: { ko: '서울역 야경 (무정차)', zh: '首尔站夜景（不停车）', en: 'Seoul Station night view (non-stop)' } },
  { route: 'traditional_night', order: 9,  name: { ko: '남대문시장', zh: '南大门市场', en: 'Namdaemun Market' },
    lat: 37.5592, lng: 126.9773, nonStop: true,
    landmark: { ko: '남대문 야경 (무정차)', zh: '南大门夜景（不停车）', en: 'Namdaemun night view (non-stop)' } },
  { route: 'traditional_night', order: 10, name: { ko: '남산오르미', zh: '南山电梯', en: 'Namsan Orumi' },
    lat: 37.5569, lng: 126.9818, nonStop: true,
    landmark: { ko: '남산 야경 (무정차)', zh: '南山夜景（不停车）', en: 'Namsan night view (non-stop)' } },
  { route: 'traditional_night', order: 11, name: { ko: '명동입구', zh: '明洞入口', en: 'Myeongdong Entrance' },
    lat: 37.5636, lng: 126.9827, nonStop: true,
    landmark: { ko: '명동 야경 (무정차)', zh: '明洞夜景（不停车）', en: 'Myeongdong night view (non-stop)' } },
  { route: 'traditional_night', order: 12, name: { ko: '종각역', zh: '钟阁站', en: 'Jonggak Station' },
    lat: 37.5700, lng: 126.9831, nonStop: true,
    landmark: { ko: '종각 야경 (무정차)', zh: '钟阁夜景（不停车）', en: 'Jonggak night view (non-stop)' } },
  { route: 'traditional_night', order: 13, name: { ko: '인사동·탑골공원', zh: '仁寺洞·塔谷公园', en: 'Insadong, Tapgol Park' },
    lat: 37.5737, lng: 126.9857, nonStop: true,
    landmark: { ko: '인사동 야경 (무정차)', zh: '仁寺洞夜景（不停车）', en: 'Insadong night view (non-stop)' } },
  { route: 'traditional_night', order: 14, name: { ko: '종묘·세운상가', zh: '宗庙·世运商街', en: 'Jongmyo, Sewoon Sangga' },
    lat: 37.5743, lng: 126.9941, nonStop: true,
    landmark: { ko: '종묘 야경 (무정차)', zh: '宗庙夜景（不停车）', en: 'Jongmyo night view (non-stop)' } },
  { route: 'traditional_night', order: 15, name: { ko: '광장시장', zh: '广藏市场', en: 'Gwangjang Market' },
    lat: 37.5700, lng: 126.9994, nonStop: true,
    landmark: { ko: '광장시장 야경 (무정차)', zh: '广藏市场夜景（不停车）', en: 'Gwangjang Market night view (non-stop)' } },
  { route: 'traditional_night', order: 16, name: { ko: '동대문디자인플라자(DDP)', zh: '东大门设计广场(DDP)', en: 'DDP' },
    lat: 37.5671, lng: 127.0095, isEnd: true,
    landmark: { ko: 'DDP 도착 (종점)', zh: 'DDP到达（终点）', en: 'DDP (final stop)' } },
]

// ─────────────────────────────────────────────
// 유틸리티 함수
// ─────────────────────────────────────────────

/**
 * 노선별 정류소 가져오기
 */
export const getStopsByRoute = (routeId) => {
  return CITY_TOUR_STOPS
    .filter(s => s.route === routeId)
    .sort((a, b) => a.order - b.order)
}

/**
 * 전체 노선 정보 + 정류소 조합
 */
export const getRouteWithStops = (routeId) => {
  const route = CITY_TOUR_ROUTES.find(r => r.id === routeId)
  if (!route) return null
  return { ...route, stops: getStopsByRoute(routeId) }
}

/**
 * 모든 노선 + 정류소 한번에 가져오기
 */
export const getAllRoutesWithStops = () => {
  return CITY_TOUR_ROUTES.map(route => ({
    ...route,
    stops: getStopsByRoute(route.id)
  }))
}

/**
 * 노선 색상 맵 (마커 렌더링용)
 */
export const ROUTE_COLORS = {
  downtown: '#E53935',
  night: '#1E88E5',
  traditional: '#43A047',
  panorama: '#FB8C00',
  gangnam: '#8E24AA',
  traditional_night: '#00897B'
}

/**
 * 티켓 구매처 정보
 */
export const TICKET_OFFICES = {
  tiger: {
    name: { ko: '서울시티투어버스(주) 광화문 매표소', zh: '首尔城市观光巴士光化门售票处', en: 'Seoul City Tour Bus Gwanghwamun Ticket Office' },
    address: { ko: '서울 중구 세종대로 135-7', zh: '首尔中区世宗大路135-7', en: '135-7 Sejong-daero, Jung-gu, Seoul' },
    lat: 37.568626,
    lng: 126.976952,
    phone: '02-777-6090',
    website: 'https://www.seoulcitybus.com',
    websiteEn: 'https://en.seoulcitybus.com',
    subway: { ko: '5호선 광화문역 6번출구 도보 100m / 1·2호선 시청역 3번출구 도보 300m', zh: '5号线光化门站6号出口步行100m / 1·2号线市厅站3号出口步行300m', en: 'Line 5 Gwanghwamun Exit 6 (100m) / Lines 1,2 City Hall Exit 3 (300m)' }
  },
  yellowBalloon: {
    name: { ko: '노랑풍선시티버스 DDP 매표소', zh: '黄气球城市巴士DDP售票处', en: 'Yellow Balloon City Bus DDP Ticket Office' },
    address: { ko: '서울 중구 을지로 281 DDP 앞', zh: '首尔中区乙支路281 DDP前', en: '281 Euljiro, Jung-gu, Seoul (in front of DDP)' },
    lat: 37.5671,
    lng: 127.0095,
    phone: '02-6337-1300',
    website: 'https://www.seoulcitytourbus.co.kr',
    subway: { ko: '2·4·5호선 동대문역사문화공원역 1번출구', zh: '2·4·5号线东大门历史文化公园站1号出口', en: 'Lines 2,4,5 Dongdaemun History & Culture Park Exit 1' }
  }
}
