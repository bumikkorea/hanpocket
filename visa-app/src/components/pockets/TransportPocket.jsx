import { useState, useEffect } from 'react'
import { Bookmark, Volume2, Copy, Car, Train, Bus, Plane, Navigation, MapPin, ArrowRight, CreditCard, Smartphone } from 'lucide-react'
import { openKakaoTaxi, openTada, openKakaoMap, openNaverMap, openSubwayApp, openBusApp, openKorail, openAirportLimousine } from '../../utils/appLinks'

// 다국어 헬퍼 함수
const L = (lang, text) => text[lang] || text['ko']

export default function TransportPocket({ lang }) {
  const [activeTab, setActiveTab] = useState('subway')
  const [address, setAddress] = useState('')
  const [toastMessage, setToastMessage] = useState('')
  const [bookmarkedCards, setBookmarkedCards] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('transport_bookmarks')) || []
    } catch {
      return []
    }
  })

  // 북마크 저장
  useEffect(() => {
    localStorage.setItem('transport_bookmarks', JSON.stringify(bookmarkedCards))
  }, [bookmarkedCards])

  // 토스트 메시지 표시 함수
  const showToast = (message) => {
    setToastMessage(message)
    setTimeout(() => setToastMessage(''), 2000)
  }

  // 클립보드 복사 함수
  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(() => {
      showToast(L(lang, { ko: '복사됨!', zh: '已复制!', en: 'Copied!' }))
    })
  }

  // TTS 함수
  const speak = (text) => {
    try {
      if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(text)
        utterance.lang = 'ko-KR'
        utterance.rate = 0.75
        speechSynthesis.speak(utterance)
      }
    } catch (e) {
      showToast('음성 재생을 지원하지 않습니다')
    }
  }

  // 북마크 토글
  const toggleBookmark = (cardId) => {
    setBookmarkedCards(prev => 
      prev.includes(cardId) 
        ? prev.filter(id => id !== cardId)
        : [...prev, cardId]
    )
  }

  // 소주제 탭 데이터
  const tabs = [
    { id: 'subway', name: { ko: '지하철', zh: '地铁', en: 'Subway' }, icon: Train },
    { id: 'bus', name: { ko: '버스', zh: '公交车', en: 'Bus' }, icon: Bus },
    { id: 'taxi', name: { ko: '택시', zh: '出租车', en: 'Taxi' }, icon: Car },
    { id: 'ktx', name: { ko: 'KTX', zh: '高铁', en: 'KTX' }, icon: Train },
    { id: 'airport', name: { ko: '공항리무진', zh: '机场巴士', en: 'Airport Bus' }, icon: Plane },
    { id: 'rental', name: { ko: '렌터카', zh: '租车', en: 'Rental Car' }, icon: Car },
    { id: 'transport_card', name: { ko: '교통카드충전', zh: '交通卡充值', en: 'Card Top-up' }, icon: CreditCard },
    { id: 'transfer', name: { ko: '환승', zh: '换乘', en: 'Transfer' }, icon: ArrowRight },
    { id: 'night', name: { ko: '심야교통', zh: '深夜交通', en: 'Night Transport' }, icon: Navigation }
  ]

  // 플래시카드 데이터
  const cardData = {
    subway: [
      {
        id: 'subway_entrance',
        ko: '지하철 입구가 어디예요?',
        pronunciation: 'ji-ha-cheol ip-gu-ga eo-di-ye-yo',
        zh: '地铁入口在哪里？',
        example_ko: '가장 가까운 지하철 입구가 어디예요?',
        example_zh: '最近的地铁入口在哪里？',
        example_pronunciation: 'gajang gakkaun jihacheol ipguga eodiyeyo?',
        unsplash: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=400&h=200&fit=crop&q=80'
      },
      {
        id: 'which_line',
        ko: '몇 호선이에요?',
        pronunciation: 'myeot ho-seon-i-e-yo',
        zh: '是几号线？',
        example_ko: '강남역은 몇 호선이에요?',
        example_zh: '江南站是几号线？',
        example_pronunciation: 'gangnamyeogeun myeot hoseonieyeo?',
        unsplash: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=400&h=200&fit=crop&q=80'
      },
      {
        id: 'transfer_station',
        ko: '환승역이 어디예요?',
        pronunciation: 'hwan-seung-yeok-i eo-di-ye-yo',
        zh: '换乘站在哪里？',
        example_ko: '2호선으로 갈아타는 환승역이 어디예요?',
        example_zh: '换乘2号线的站在哪里？',
        example_pronunciation: 'i-hoseoneu-ro garataneun hwanseung-yeogi eodiyeyo?',
        unsplash: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=400&h=200&fit=crop&q=80'
      },
      {
        id: 'last_train',
        ko: '막차가 몇 시예요?',
        pronunciation: 'mak-cha-ga myeot si-ye-yo',
        zh: '末班车是几点？',
        example_ko: '이 노선 막차가 몇 시예요?',
        example_zh: '这条线的末班车是几点？',
        example_pronunciation: 'i noseon makchaga myeot siyeyo?',
        unsplash: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=400&h=200&fit=crop&q=80'
      },
      {
        id: 'exit_number',
        ko: '몇 번 출구로 나가요?',
        pronunciation: 'myeot beon chul-gu-ro na-ga-yo',
        zh: '从几号出口出去？',
        example_ko: '명동역 3번 출구로 나가요',
        example_zh: '从明洞站3号出口出去',
        example_pronunciation: 'myeongdong-yeok sampeon chulguro nagayo',
        unsplash: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=400&h=200&fit=crop&q=80'
      },
      {
        id: 'direction',
        ko: '어느 방향으로 가야 해요?',
        pronunciation: 'eo-neu bang-hyang-eu-ro ga-ya hae-yo',
        zh: '应该往哪个方向走？',
        example_ko: '신촌 방향으로 가야 해요',
        example_zh: '要往新村方向走',
        example_pronunciation: 'sinchon banghyang-eulo gaya haeyo',
        unsplash: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=400&h=200&fit=crop&q=80'
      },
      {
        id: 'travel_time',
        ko: '얼마나 걸려요?',
        pronunciation: 'eol-ma-na geol-lyeo-yo',
        zh: '要多长时间？',
        example_ko: '홍대까지 얼마나 걸려요?',
        example_zh: '到弘大要多长时间？',
        example_pronunciation: 'hongdaekkaji eolmana geollyeoyo?',
        unsplash: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=400&h=200&fit=crop&q=80'
      },
      {
        id: 'platform_side',
        ko: '어느 쪽 승강장이에요?',
        pronunciation: 'eo-neu jjok seung-gang-jang-i-e-yo',
        zh: '是哪边的站台？',
        example_ko: '2번 승강장에서 타세요',
        example_zh: '在2号站台上车',
        example_pronunciation: 'i-beon seung-gang-jang-eseo taseyo',
        unsplash: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=400&h=200&fit=crop&q=80'
      },
      {
        id: 'express_train',
        ko: '급행 지하철 있어요?',
        pronunciation: 'geu-paeng ji-ha-cheol iss-eo-yo',
        zh: '有快速地铁吗？',
        example_ko: '공항철도 급행 지하철 있어요?',
        example_zh: '有机场铁路快车吗？',
        example_pronunciation: 'gonghang-cheoldo geup-haeng jihacheol isseoyo?',
        unsplash: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=400&h=200&fit=crop&q=80'
      },
      {
        id: 'crowded_time',
        ko: '러시아워가 언제예요?',
        pronunciation: 'reo-si-a-wo-ga eon-je-ye-yo',
        zh: '高峰期是什么时候？',
        example_ko: '아침 러시아워가 언제예요?',
        example_zh: '早高峰是什么时候？',
        example_pronunciation: 'achim reosiawoga eonjeyeyo?',
        unsplash: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=400&h=200&fit=crop&q=80'
      }
    ],
    bus: [
      {
        id: 'bus_stop',
        ko: '버스 정류장이 어디예요?',
        pronunciation: 'beo-seu jeong-ryu-jang-i eo-di-ye-yo',
        zh: '公交站在哪里？',
        example_ko: '가장 가까운 버스 정류장이 어디예요?',
        example_zh: '最近的公交站在哪里？',
        example_pronunciation: 'gajang gakkaun beoseu jeongyujangi eodiyeyo?',
        unsplash: 'https://images.unsplash.com/photo-1570125909232-eb263c188f7e?w=400&h=200&fit=crop&q=80'
      },
      {
        id: 'bus_number',
        ko: '몇 번 버스 타야 해요?',
        pronunciation: 'myeot beon beo-seu ta-ya hae-yo',
        zh: '要坐几路公交？',
        example_ko: '명동까지 몇 번 버스 타야 해요?',
        example_zh: '到明洞要坐几路公交？',
        example_pronunciation: 'myeongdong-kkaji myeot beon beoseu taya haeyo?',
        unsplash: 'https://images.unsplash.com/photo-1570125909232-eb263c188f7e?w=400&h=200&fit=crop&q=80'
      },
      {
        id: 'bus_fare',
        ko: '버스 요금이 얼마예요?',
        pronunciation: 'beo-seu yo-geum-i eol-ma-ye-yo',
        zh: '公交车票多少钱？',
        example_ko: '시내버스 요금이 얼마예요?',
        example_zh: '市内公交票价是多少？',
        example_pronunciation: 'sinaebeoseu yogeumi eolmayeyo?',
        unsplash: 'https://images.unsplash.com/photo-1570125909232-eb263c188f7e?w=400&h=200&fit=crop&q=80'
      },
      {
        id: 'get_off',
        ko: '내려 주세요',
        pronunciation: 'nae-ryeo ju-se-yo',
        zh: '请让我下车',
        example_ko: '다음 정류장에서 내려 주세요',
        example_zh: '请在下一站让我下车',
        example_pronunciation: 'da-eum jeongyujangeseo naeryeo juseyo',
        unsplash: 'https://images.unsplash.com/photo-1570125909232-eb263c188f7e?w=400&h=200&fit=crop&q=80'
      },
      {
        id: 'night_bus',
        ko: '심야버스 있어요?',
        pronunciation: 'sim-ya-beo-seu iss-eo-yo',
        zh: '有夜班公交吗？',
        example_ko: '12시 이후에 심야버스 있어요?',
        example_zh: '12点以后有夜班公交吗？',
        example_pronunciation: 'yeoldu-si ihu-e simyabeoseu isseoyo?',
        unsplash: 'https://images.unsplash.com/photo-1570125909232-eb263c188f7e?w=400&h=200&fit=crop&q=80'
      },
      {
        id: 'bus_app',
        ko: '버스 앱 추천해 주세요',
        pronunciation: 'beo-seu aep chu-cheon-hae ju-se-yo',
        zh: '请推荐公交App',
        example_ko: '실시간 버스 정보 앱 추천해 주세요',
        example_zh: '请推荐实时公交信息App',
        example_pronunciation: 'silsigan beoseu jeongbo aep chucheonhae juseyo',
        unsplash: 'https://images.unsplash.com/photo-1570125909232-eb263c188f7e?w=400&h=200&fit=crop&q=80'
      },
      {
        id: 'express_bus',
        ko: '고속버스 터미널',
        pronunciation: 'go-sok-beo-seu teo-mi-neol',
        zh: '高速巴士终点站',
        example_ko: '고속버스 터미널이 어디예요?',
        example_zh: '高速巴士终点站在哪里？',
        example_pronunciation: 'gosok-beoseu teomineori eodiyeyo?',
        unsplash: 'https://images.unsplash.com/photo-1570125909232-eb263c188f7e?w=400&h=200&fit=crop&q=80'
      },
      {
        id: 'intercity_bus',
        ko: '시외버스 예매',
        pronunciation: 'si-oe-beo-seu ye-mae',
        zh: '市际巴士预订',
        example_ko: '부산행 시외버스 예매하고 싶어요',
        example_zh: '我想预订去釜山的市际巴士',
        example_pronunciation: 'busanhaeng sige-beoseu yemaehago sipeoyo',
        unsplash: 'https://images.unsplash.com/photo-1570125909232-eb263c188f7e?w=400&h=200&fit=crop&q=80'
      },
      {
        id: 'bus_route',
        ko: '이 버스 어디까지 가요?',
        pronunciation: 'i beo-seu eo-di-kka-ji ga-yo',
        zh: '这路公交到哪里？',
        example_ko: '마지막 정류장이 어디예요?',
        example_zh: '终点站是哪里？',
        example_pronunciation: 'majimak jeongyujangi eodiyeyo?',
        unsplash: 'https://images.unsplash.com/photo-1570125909232-eb263c188f7e?w=400&h=200&fit=crop&q=80'
      },
      {
        id: 'bus_schedule',
        ko: '버스 시간표 있어요?',
        pronunciation: 'beo-seu si-gan-pyo iss-eo-yo',
        zh: '有公交时刻表吗？',
        example_ko: '첫차 막차 시간을 알고 싶어요',
        example_zh: '想知道首班车末班车时间',
        example_pronunciation: 'cheot-cha mak-cha siganeul algo sipeoyo',
        unsplash: 'https://images.unsplash.com/photo-1570125909232-eb263c188f7e?w=400&h=200&fit=crop&q=80'
      }
    ],
    taxi: [
      {
        id: 'go_here',
        ko: '여기로 가 주세요',
        pronunciation: 'yeo-gi-ro ga ju-se-yo',
        zh: '请到这里',
        example_ko: '이 주소로 가 주세요',
        example_zh: '请到这个地址',
        example_pronunciation: 'i jusoro ga juseyo',
        unsplash: 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=400&h=200&fit=crop&q=80'
      },
      {
        id: 'stop_here',
        ko: '여기서 세워 주세요',
        pronunciation: 'yeo-gi-seo se-wo ju-se-yo',
        zh: '请在这里停车',
        example_ko: '길 건너편에서 세워 주세요',
        example_zh: '请在马路对面停车',
        example_pronunciation: 'gil geonneopyeonneseo sewo juseyo',
        unsplash: 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=400&h=200&fit=crop&q=80'
      },
      {
        id: 'how_much',
        ko: '요금이 얼마예요?',
        pronunciation: 'yo-geum-i eol-ma-ye-yo',
        zh: '车费多少钱？',
        example_ko: '미터기 요금이 얼마예요?',
        example_zh: '计价器显示多少钱？',
        example_pronunciation: 'miteogi yogeumi eolmayeyo?',
        unsplash: 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=400&h=200&fit=crop&q=80'
      },
      {
        id: 'receipt',
        ko: '영수증 주세요',
        pronunciation: 'yeong-su-jeung ju-se-yo',
        zh: '请给我收据',
        example_ko: '카드 결제 영수증 주세요',
        example_zh: '请给我刷卡收据',
        example_pronunciation: 'kadeu gyeolje yeongsujeung juseyo',
        unsplash: 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=400&h=200&fit=crop&q=80'
      },
      {
        id: 'trunk',
        ko: '트렁크 열어 주세요',
        pronunciation: 'teu-rung-keu yeo-reo ju-se-yo',
        zh: '请打开后备箱',
        example_ko: '짐이 많아서 트렁크 열어 주세요',
        example_zh: '行李很多，请打开后备箱',
        example_pronunciation: 'jimi manaseo teurungkeu yeoleo juseyo',
        unsplash: 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=400&h=200&fit=crop&q=80'
      },
      {
        id: 'air_condition',
        ko: '에어컨 켜 주세요',
        pronunciation: 'e-eo-keon kyeo ju-se-yo',
        zh: '请开空调',
        example_ko: '더우니까 에어컨 켜 주세요',
        example_zh: '很热，请开空调',
        example_pronunciation: 'deo-unikka eeokeon kyeo juseyo',
        unsplash: 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=400&h=200&fit=crop&q=80'
      },
      {
        id: 'call_taxi',
        ko: '택시 좀 불러 주세요',
        pronunciation: 'taek-si jom bul-leo ju-se-yo',
        zh: '请帮我叫辆出租车',
        example_ko: '카카오택시 앱으로 불러 주세요',
        example_zh: '请用KakaoTaxi App叫车',
        example_pronunciation: 'kakao-taeksi aepeuro bulleo juseyo',
        unsplash: 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=400&h=200&fit=crop&q=80'
      },
      {
        id: 'payment_method',
        ko: '카드로 계산할게요',
        pronunciation: 'ka-deu-ro gye-san-hal-ge-yo',
        zh: '我用卡付款',
        example_ko: '현금 말고 카드로 계산할게요',
        example_zh: '不用现金，用卡付款',
        example_pronunciation: 'hyeongeum malgo kadeu-ro gyesan-halgeyo',
        unsplash: 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=400&h=200&fit=crop&q=80'
      },
      {
        id: 'wait_here',
        ko: '여기서 잠시만 기다려 주세요',
        pronunciation: 'yeo-gi-seo jam-si-man gi-da-ryeo ju-se-yo',
        zh: '请在这里等一会儿',
        example_ko: '5분만 여기서 기다려 주세요',
        example_zh: '请在这里等5分钟',
        example_pronunciation: 'o-bunman yeogiseo gidaryeo juseyo',
        unsplash: 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=400&h=200&fit=crop&q=80'
      },
      {
        id: 'faster_route',
        ko: '빠른 길로 가 주세요',
        pronunciation: 'ppa-reun gil-lo ga ju-se-yo',
        zh: '请走快捷路线',
        example_ko: '교통체증 피해서 빠른 길로 가 주세요',
        example_zh: '请避开拥堵走快捷路线',
        example_pronunciation: 'gyotong-che-jeung pihaeseo ppareun gillo ga juseyo',
        unsplash: 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=400&h=200&fit=crop&q=80'
      }
    ],
    ktx: [
      {
        id: 'ktx_station',
        ko: 'KTX역이 어디예요?',
        pronunciation: 'kei-ti-ek-seu-yeok-i eo-di-ye-yo',
        zh: 'KTX站在哪里？',
        example_ko: '서울역 KTX 승강장이 어디예요?',
        example_zh: '首尔站KTX站台在哪里？',
        example_pronunciation: 'seoul-yeok KTX seunggangjang-i eodiyeyo?',
        unsplash: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=400&h=200&fit=crop&q=80'
      },
      {
        id: 'book_ticket',
        ko: '표 예매하고 싶어요',
        pronunciation: 'pyo ye-mae-ha-go si-peo-yo',
        zh: '我想订票',
        example_ko: '부산행 KTX 표 예매하고 싶어요',
        example_zh: '我想订去釜山的KTX票',
        example_pronunciation: 'busan-haeng KTX pyo yemae-hago sipeoyo',
        unsplash: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=400&h=200&fit=crop&q=80'
      },
      {
        id: 'departure_time',
        ko: '출발 시간이 언제예요?',
        pronunciation: 'chul-bal si-gan-i eon-je-ye-yo',
        zh: '出发时间是什么时候？',
        example_ko: '다음 KTX 출발 시간이 언제예요?',
        example_zh: '下一班KTX的出发时间是什么时候？',
        example_pronunciation: 'da-eum KTX chulbal sigani eonjeyeyo?',
        unsplash: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=400&h=200&fit=crop&q=80'
      },
      {
        id: 'seat_number',
        ko: '좌석 번호가 뭐예요?',
        pronunciation: 'jwa-seok beon-ho-ga mwo-ye-yo',
        zh: '座位号是什么？',
        example_ko: '제 좌석이 몇 호차 몇 번이에요?',
        example_zh: '我的座位是几号车厢几号？',
        example_pronunciation: 'je jwaiseogi myeot hocha myeot beonieyo?',
        unsplash: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=400&h=200&fit=crop&q=80'
      },
      {
        id: 'travel_duration',
        ko: '몇 시간 걸려요?',
        pronunciation: 'myeot si-gan geol-lyeo-yo',
        zh: '要几个小时？',
        example_ko: '서울에서 부산까지 몇 시간 걸려요?',
        example_zh: '从首尔到釜山要几个小时？',
        example_pronunciation: 'seoul-eseo busan-kkaji myeot sigan geollyeoyo?',
        unsplash: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=400&h=200&fit=crop&q=80'
      },
      {
        id: 'refund_ticket',
        ko: '표 환불하고 싶어요',
        pronunciation: 'pyo hwan-bul-ha-go si-peo-yo',
        zh: '我想退票',
        example_ko: '예약한 KTX표 환불하고 싶어요',
        example_zh: '我想退掉预订的KTX票',
        example_pronunciation: 'yeyakhan KTX-pyo hwanbul-hago sipeoyo',
        unsplash: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=400&h=200&fit=crop&q=80'
      },
      {
        id: 'change_seat',
        ko: '좌석 변경할 수 있어요?',
        pronunciation: 'jwa-seok byeon-gyeong-hal su iss-eo-yo',
        zh: '可以换座位吗？',
        example_ko: '창가 좌석으로 변경할 수 있어요?',
        example_zh: '可以换成靠窗的座位吗？',
        example_pronunciation: 'chang-ga jwaiseog-euro byeon-gyeong-hal su isseoyo?',
        unsplash: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=400&h=200&fit=crop&q=80'
      },
      {
        id: 'dining_car',
        ko: '식당차 있어요?',
        pronunciation: 'sik-dang-cha iss-eo-yo',
        zh: '有餐车吗？',
        example_ko: 'KTX에서 음식 살 수 있는 식당차 있어요?',
        example_zh: 'KTX里有可以买食物的餐车吗？',
        example_pronunciation: 'KTX-eseo eumsik sal su inneun sikdangcha isseoyo?',
        unsplash: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=400&h=200&fit=crop&q=80'
      },
      {
        id: 'wifi_service',
        ko: '와이파이 돼요?',
        pronunciation: 'wa-i-pa-i dwae-yo',
        zh: '有WiFi吗？',
        example_ko: 'KTX에서 무료 와이파이 사용할 수 있어요?',
        example_zh: '在KTX上可以用免费WiFi吗？',
        example_pronunciation: 'KTX-eseo muryo waipai sayong-hal su isseoyo?',
        unsplash: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=400&h=200&fit=crop&q=80'
      },
      {
        id: 'next_station',
        ko: '다음 역이 어디예요?',
        pronunciation: 'da-eum yeok-i eo-di-ye-yo',
        zh: '下一站是哪里？',
        example_ko: '잠시 후 정차하는 역이 어디예요?',
        example_zh: '稍后停车的站是哪里？',
        example_pronunciation: 'jamsi hu jeong-cha-haneun yeogi eodiyeyo?',
        unsplash: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=400&h=200&fit=crop&q=80'
      }
    ],
    airport: [
      {
        id: 'airport_bus',
        ko: '공항리무진 어디서 타요?',
        pronunciation: 'gong-hang-ri-mu-jin eo-di-seo ta-yo',
        zh: '机场巴士在哪里坐？',
        example_ko: '인천공항 가는 리무진 어디서 타요?',
        example_zh: '去仁川机场的巴士在哪里坐？',
        example_pronunciation: 'incheon-gonghang ganeun rimujin eodiseo tayo?',
        unsplash: 'https://images.unsplash.com/photo-1556388158-158dc2ec8b0d?w=400&h=200&fit=crop&q=80'
      },
      {
        id: 'bus_schedule',
        ko: '공항버스 시간표 있어요?',
        pronunciation: 'gong-hang-beo-seu si-gan-pyo iss-eo-yo',
        zh: '有机场巴士时刻表吗？',
        example_ko: '새벽 시간 공항버스 시간표 있어요?',
        example_zh: '有凌晨时间的机场巴士时刻表吗？',
        example_pronunciation: 'saebyeok sigan gonghang-beoseu sigam-pyo isseoyo?',
        unsplash: 'https://images.unsplash.com/photo-1556388158-158dc2ec8b0d?w=400&h=200&fit=crop&q=80'
      },
      {
        id: 'airport_express',
        ko: '공항철도 역이 어디예요?',
        pronunciation: 'gong-hang-cheol-do yeok-i eo-di-ye-yo',
        zh: '机场铁路站在哪里？',
        example_ko: 'AREX 공항철도 역이 어디예요?',
        example_zh: 'AREX机场铁路站在哪里？',
        example_pronunciation: 'AREX gonghang-cheoldo yeogi eodiyeyo?',
        unsplash: 'https://images.unsplash.com/photo-1556388158-158dc2ec8b0d?w=400&h=200&fit=crop&q=80'
      },
      {
        id: 'luggage_service',
        ko: '짐 배송 서비스 있어요?',
        pronunciation: 'jim bae-song seo-bi-seu iss-eo-yo',
        zh: '有行李配送服务吗？',
        example_ko: '공항에서 호텔로 짐 배송 서비스 있어요?',
        example_zh: '有从机场到酒店的行李配送服务吗？',
        example_pronunciation: 'gonghang-eseo hoteulo jim baesong seobiseu isseoyo?',
        unsplash: 'https://images.unsplash.com/photo-1556388158-158dc2ec8b0d?w=400&h=200&fit=crop&q=80'
      },
      {
        id: 'checkin_time',
        ko: '체크인 몇 시간 전에 와야 해요?',
        pronunciation: 'che-keu-in myeot si-gan jeon-e wa-ya hae-yo',
        zh: '要提前几小时到机场？',
        example_ko: '국제선 체크인 몇 시간 전에 와야 해요?',
        example_zh: '国际航班要提前几小时办理值机？',
        example_pronunciation: 'gukjeseon che-keu-in myeot sigan jeone waya haeyo?',
        unsplash: 'https://images.unsplash.com/photo-1556388158-158dc2ec8b0d?w=400&h=200&fit=crop&q=80'
      },
      {
        id: 'terminal_shuttle',
        ko: '터미널 셔틀 있어요?',
        pronunciation: 'teo-mi-neol syeo-teul iss-eo-yo',
        zh: '有航站楼摆渡车吗？',
        example_ko: '제1터미널과 제2터미널 셔틀 있어요?',
        example_zh: '有第1航站楼和第2航站楼的摆渡车吗？',
        example_pronunciation: 'jeil-teomineol-gwa jeii-teomineol syeoteul isseoyo?',
        unsplash: 'https://images.unsplash.com/photo-1556388158-158dc2ec8b0d?w=400&h=200&fit=crop&q=80'
      },
      {
        id: 'bus_fare_airport',
        ko: '공항버스 요금이 얼마예요?',
        pronunciation: 'gong-hang-beo-seu yo-geum-i eol-ma-ye-yo',
        zh: '机场巴士票价是多少？',
        example_ko: '강남까지 공항버스 요금이 얼마예요?',
        example_zh: '到江南的机场巴士票价是多少？',
        example_pronunciation: 'gangnam-kkaji gonghang-beoseu yogeumi eolmayeyo?',
        unsplash: 'https://images.unsplash.com/photo-1556388158-158dc2ec8b0d?w=400&h=200&fit=crop&q=80'
      },
      {
        id: 'direct_bus',
        ko: '직행버스 있어요?',
        pronunciation: 'jik-haeng-beo-seu iss-eo-yo',
        zh: '有直达巴士吗？',
        example_ko: '명동 직행버스 있어요?',
        example_zh: '有到明洞的直达巴士吗？',
        example_pronunciation: 'myeongdong jikhaeng-beoseu isseoyo?',
        unsplash: 'https://images.unsplash.com/photo-1556388158-158dc2ec8b0d?w=400&h=200&fit=crop&q=80'
      },
      {
        id: 'night_transport',
        ko: '밤에도 공항버스 있어요?',
        pronunciation: 'bam-e-do gong-hang-beo-seu iss-eo-yo',
        zh: '晚上也有机场巴士吗？',
        example_ko: '새벽 2시에도 공항버스 운행해요?',
        example_zh: '凌晨2点也有机场巴士运行吗？',
        example_pronunciation: 'saebyeok du-si-edo gonghang-beoseu unhaeng-haeyo?',
        unsplash: 'https://images.unsplash.com/photo-1556388158-158dc2ec8b0d?w=400&h=200&fit=crop&q=80'
      },
      {
        id: 'lost_luggage',
        ko: '짐을 잃어버렸어요',
        pronunciation: 'jim-eul il-eo-beo-ryeoss-eo-yo',
        zh: '我的行李丢了',
        example_ko: '공항에서 가방을 잃어버렸어요',
        example_zh: '我在机场丢了包',
        example_pronunciation: 'gonghang-eseo gabangeul ileobeolyeosseoyo',
        unsplash: 'https://images.unsplash.com/photo-1556388158-158dc2ec8b0d?w=400&h=200&fit=crop&q=80'
      }
    ],
    rental: [
      {
        id: 'rent_car',
        ko: '차 렌트하고 싶어요',
        pronunciation: 'cha ren-teu-ha-go si-peo-yo',
        zh: '我想租车',
        example_ko: '소형차 하루 렌트하고 싶어요',
        example_zh: '我想租一天小型车',
        example_pronunciation: 'sohyeong-cha haru renteuhago sipeoyo',
        unsplash: 'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=400&h=200&fit=crop&q=80'
      },
      {
        id: 'international_license',
        ko: '국제면허증 있어요',
        pronunciation: 'guk-je-myeon-heo-jeung iss-eo-yo',
        zh: '我有国际驾照',
        example_ko: '국제면허증으로 렌트카 빌릴 수 있어요?',
        example_zh: '用国际驾照可以租车吗？',
        example_pronunciation: 'gukje-myeonheo-jeung-euro rentka billil su isseoyo?',
        unsplash: 'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=400&h=200&fit=crop&q=80'
      },
      {
        id: 'rental_price',
        ko: '렌트 비용이 얼마예요?',
        pronunciation: 'ren-teu bi-yong-i eol-ma-ye-yo',
        zh: '租车费用是多少？',
        example_ko: '하루 렌트 비용이 얼마예요?',
        example_zh: '租一天的费用是多少？',
        example_pronunciation: 'haru renteu biyongi eolmayeyo?',
        unsplash: 'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=400&h=200&fit=crop&q=80'
      },
      {
        id: 'insurance',
        ko: '보험 포함이에요?',
        pronunciation: 'bo-heom po-ham-i-e-yo',
        zh: '包括保险吗？',
        example_ko: '렌트카 보험이 포함되어 있어요?',
        example_zh: '租车费用包括保险吗？',
        example_pronunciation: 'rentka boheomi pohamdoeeo isseoyo?',
        unsplash: 'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=400&h=200&fit=crop&q=80'
      },
      {
        id: 'fuel_policy',
        ko: '기름은 어떻게 해요?',
        pronunciation: 'gi-reum-eun eo-tteo-ke hae-yo',
        zh: '油费怎么算？',
        example_ko: '기름 가득 채워서 반납해야 해요?',
        example_zh: '需要加满油后归还吗？',
        example_pronunciation: 'gireum gadeuk chae-weoseo bannap-haeya haeyo?',
        unsplash: 'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=400&h=200&fit=crop&q=80'
      },
      {
        id: 'return_location',
        ko: '다른 곳에서 반납할 수 있어요?',
        pronunciation: 'da-reun got-e-seo ban-nap-hal su iss-eo-yo',
        zh: '可以在其他地方还车吗？',
        example_ko: '공항에서 빌리고 시내에서 반납할 수 있어요?',
        example_zh: '可以在机场租车，在市内还车吗？',
        example_pronunciation: 'gonghang-eseo billigo sinae-eseo bannap-hal su isseoyo?',
        unsplash: 'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=400&h=200&fit=crop&q=80'
      },
      {
        id: 'navigation',
        ko: '네비게이션 있어요?',
        pronunciation: 'ne-bi-ge-i-syeon iss-eo-yo',
        zh: '有导航吗？',
        example_ko: '한국어 네비게이션 설치되어 있어요?',
        example_zh: '安装了韩语导航吗？',
        example_pronunciation: 'hangugeo nebigeis-yeon seolchidoeeo isseoyo?',
        unsplash: 'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=400&h=200&fit=crop&q=80'
      },
      {
        id: 'car_size',
        ko: '더 큰 차 있어요?',
        pronunciation: 'deo keun cha iss-eo-yo',
        zh: '有更大的车吗？',
        example_ko: 'SUV나 승합차 같은 큰 차 있어요?',
        example_zh: '有SUV或面包车这样的大车吗？',
        example_pronunciation: 'SUV-na seunghap-cha gateun keun cha isseoyo?',
        unsplash: 'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=400&h=200&fit=crop&q=80'
      },
      {
        id: 'age_limit',
        ko: '나이 제한 있어요?',
        pronunciation: 'na-i je-han iss-eo-yo',
        zh: '有年龄限制吗？',
        example_ko: '렌트카 빌리는데 나이 제한 있어요?',
        example_zh: '租车有年龄限制吗？',
        example_pronunciation: 'rentka billiseunde nai jehan isseoyo?',
        unsplash: 'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=400&h=200&fit=crop&q=80'
      },
      {
        id: 'deposit',
        ko: '보증금이 얼마예요?',
        pronunciation: 'bo-jeung-geum-i eol-ma-ye-yo',
        zh: '押金是多少？',
        example_ko: '렌트할 때 보증금이 얼마예요?',
        example_zh: '租车时押金是多少？',
        example_pronunciation: 'renteul ttae bojeunggeumi eolmayeyo?',
        unsplash: 'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=400&h=200&fit=crop&q=80'
      }
    ],
    transport_card: [
      {
        id: 'buy_card',
        ko: '교통카드 어디서 사요?',
        pronunciation: 'gyo-tong-ka-deu eo-di-seo sa-yo',
        zh: '交通卡在哪里买？',
        example_ko: 'T머니카드 어디서 살 수 있어요?',
        example_zh: 'T-money卡在哪里可以买？',
        example_pronunciation: 'T-meoni-kadeu eodiseo sal su isseoyo?',
        unsplash: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=400&h=200&fit=crop&q=80'
      },
      {
        id: 'charge_card',
        ko: '카드 충전하고 싶어요',
        pronunciation: 'ka-deu chung-jeon-ha-go si-peo-yo',
        zh: '我想给卡充值',
        example_ko: '1만 원 충전하고 싶어요',
        example_zh: '我想充值1万韩元',
        example_pronunciation: 'ilman-won chungjeon-hago sipeoyo',
        unsplash: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=400&h=200&fit=crop&q=80'
      },
      {
        id: 'card_balance',
        ko: '잔액이 얼마 남았어요?',
        pronunciation: 'jan-aek-i eol-ma na-mass-eo-yo',
        zh: '余额还剩多少？',
        example_ko: '교통카드 잔액 확인하고 싶어요',
        example_zh: '我想查看交通卡余额',
        example_pronunciation: 'gyotong-kadeu janaek hwaginhago sipeoyo',
        unsplash: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=400&h=200&fit=crop&q=80'
      },
      {
        id: 'card_machine',
        ko: '충전기가 어디 있어요?',
        pronunciation: 'chung-jeon-gi-ga eo-di iss-eo-yo',
        zh: '充值机在哪里？',
        example_ko: '교통카드 충전기가 어디 있어요?',
        example_zh: '交通卡充值机在哪里？',
        example_pronunciation: 'gyotong-kadeu chungjeongi-ga eodi isseoyo?',
        unsplash: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=400&h=200&fit=crop&q=80'
      },
      {
        id: 'card_types',
        ko: '어떤 교통카드가 좋아요?',
        pronunciation: 'eo-tteon gyo-tong-ka-deu-ga jo-a-yo',
        zh: '什么交通卡比较好？',
        example_ko: 'T머니와 한페이 중에 어떤 게 좋아요?',
        example_zh: 'T-money和Hanpay中哪个比较好？',
        example_pronunciation: 'T-meoni-wa hanpei junge eotteon ge joayo?',
        unsplash: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=400&h=200&fit=crop&q=80'
      },
      {
        id: 'refund_card',
        ko: '카드 환불하고 싶어요',
        pronunciation: 'ka-deu hwan-bul-ha-go si-peo-yo',
        zh: '我想退卡',
        example_ko: '안 쓰는 교통카드 환불하고 싶어요',
        example_zh: '我想退掉不用的交通卡',
        example_pronunciation: 'an sseuneun gyotong-kadeu hwanbul-hago sipeoyo',
        unsplash: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=400&h=200&fit=crop&q=80'
      },
      {
        id: 'mobile_payment',
        ko: '휴대폰으로 결제할 수 있어요?',
        pronunciation: 'hyu-dae-pon-eu-ro gyeol-je-hal su iss-eo-yo',
        zh: '可以用手机支付吗？',
        example_ko: '삼성페이로 교통비 결제할 수 있어요?',
        example_zh: '可以用Samsung Pay支付交通费吗？',
        example_pronunciation: 'samseong-peilo gyotongbi gyeolje-hal su isseoyo?',
        unsplash: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=400&h=200&fit=crop&q=80'
      },
      {
        id: 'discount_card',
        ko: '학생 할인 카드 있어요?',
        pronunciation: 'hak-saeng hal-in ka-deu iss-eo-yo',
        zh: '有学生折扣卡吗？',
        example_ko: '청소년이나 학생 교통카드 할인 있어요?',
        example_zh: '青少年或学生交通卡有折扣吗？',
        example_pronunciation: 'cheongsoneon-ina haksaeng gyotong-kadeu harin isseoyo?',
        unsplash: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=400&h=200&fit=crop&q=80'
      },
      {
        id: 'card_not_working',
        ko: '카드가 안 돼요',
        pronunciation: 'ka-deu-ga an dwae-yo',
        zh: '卡不能用',
        example_ko: '교통카드가 인식이 안 돼요',
        example_zh: '交通卡读不出来',
        example_pronunciation: 'gyotong-kadeuga insigi an dwaeyo',
        unsplash: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=400&h=200&fit=crop&q=80'
      },
      {
        id: 'lost_card',
        ko: '카드를 잃어버렸어요',
        pronunciation: 'ka-deu-reul il-eo-beo-ryeoss-eo-yo',
        zh: '我丢了卡',
        example_ko: '교통카드를 잃어버렸는데 어떻게 해야 해요?',
        example_zh: '交通卡丢了怎么办？',
        example_pronunciation: 'gyotong-kadeureul ileobeolyeossneunde eotteoke haeya haeyo?',
        unsplash: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=400&h=200&fit=crop&q=80'
      }
    ],
    transfer: [
      {
        id: 'transfer_here',
        ko: '여기서 갈아타요?',
        pronunciation: 'yeo-gi-seo ga-ra-ta-yo',
        zh: '在这里换乘吗？',
        example_ko: '2호선으로 갈아타려면 여기서 갈아타요?',
        example_zh: '换2号线在这里换乘吗？',
        example_pronunciation: 'i-hoseon-euro galata-ryeomyeon yeogiseo galatayo?',
        unsplash: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=400&h=200&fit=crop&q=80'
      },
      {
        id: 'transfer_station',
        ko: '환승역이 어디예요?',
        pronunciation: 'hwan-seung-yeok-i eo-di-ye-yo',
        zh: '换乘站在哪里？',
        example_ko: '가장 가까운 환승역이 어디예요?',
        example_zh: '最近的换乘站在哪里？',
        example_pronunciation: 'gajang gakkaun hwanseung-yeogi eodiyeyo?',
        unsplash: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=400&h=200&fit=crop&q=80'
      },
      {
        id: 'transfer_time',
        ko: '환승 시간이 얼마나 걸려요?',
        pronunciation: 'hwan-seung si-gan-i eol-ma-na geol-lyeo-yo',
        zh: '换乘需要多长时间？',
        example_ko: '이 역에서 환승하는데 시간이 얼마나 걸려요?',
        example_zh: '在这站换乘需要多长时间？',
        example_pronunciation: 'i yeogeseo hwanseung-haneunde sigani eolmana geollyeoyo?',
        unsplash: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=400&h=200&fit=crop&q=80'
      },
      {
        id: 'direct_line',
        ko: '직통으로 갈 수 있어요?',
        pronunciation: 'jik-tong-eu-ro gal su iss-eo-yo',
        zh: '可以直达吗？',
        example_ko: '환승 없이 직통으로 갈 수 있어요?',
        example_zh: '不换乘可以直达吗？',
        example_pronunciation: 'hwanseung eopsi jiktong-euro gal su isseoyo?',
        unsplash: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=400&h=200&fit=crop&q=80'
      },
      {
        id: 'same_ticket',
        ko: '같은 표로 갈아탈 수 있어요?',
        pronunciation: 'ga-teun pyo-ro ga-ra-tal su iss-eo-yo',
        zh: '可以用同一张票换乘吗？',
        example_ko: '교통카드 하나로 환승할 수 있어요?',
        example_zh: '用一张交通卡可以换乘吗？',
        example_pronunciation: 'gyotong-kadeu hanaro hwanseung-hal su isseoyo?',
        unsplash: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=400&h=200&fit=crop&q=80'
      },
      {
        id: 'free_transfer',
        ko: '무료 환승이에요?',
        pronunciation: 'mu-ryo hwan-seung-i-e-yo',
        zh: '是免费换乘吗？',
        example_ko: '지하철에서 버스로 환승이 무료예요?',
        example_zh: '地铁换公交是免费的吗？',
        example_pronunciation: 'jihacheol-eseo beoseu-ro hwanseungi muryoyeyo?',
        unsplash: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=400&h=200&fit=crop&q=80'
      },
      {
        id: 'transfer_discount',
        ko: '환승 할인 돼요?',
        pronunciation: 'hwan-seung hal-in dwae-yo',
        zh: '换乘有折扣吗？',
        example_ko: '30분 안에 환승하면 할인 돼요?',
        example_zh: '30分钟内换乘有折扣吗？',
        example_pronunciation: 'samsip-bun ane hwanseung-hamyeon harin dwaeyo?',
        unsplash: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=400&h=200&fit=crop&q=80'
      },
      {
        id: 'transfer_direction',
        ko: '환승하려면 어느 쪽으로 가야 해요?',
        pronunciation: 'hwan-seung-ha-ryeo-myeon eo-neu jjok-eu-ro ga-ya hae-yo',
        zh: '换乘要往哪边走？',
        example_ko: '4호선으로 환승하려면 어느 쪽으로 가야 해요?',
        example_zh: '换4号线要往哪边走？',
        example_pronunciation: 'sa-hoseon-euro hwanseung-haryeomyeon eoneu jjog-euro gaya haeyo?',
        unsplash: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=400&h=200&fit=crop&q=80'
      },
      {
        id: 'missed_transfer',
        ko: '환승을 놓쳤어요',
        pronunciation: 'hwan-seung-eul not-chyeoss-eo-yo',
        zh: '错过了换乘',
        example_ko: '지하철 환승을 놓쳤는데 어떻게 해야 해요?',
        example_zh: '错过了地铁换乘怎么办？',
        example_pronunciation: 'jihacheol hwanseu-ngeul nochyeossneunde eotteoke haeya haeyo?',
        unsplash: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=400&h=200&fit=crop&q=80'
      },
      {
        id: 'complex_transfer',
        ko: '환승이 복잡해요',
        pronunciation: 'hwan-seung-i bok-jap-hae-yo',
        zh: '换乘很复杂',
        example_ko: '이 역 환승이 너무 복잡해요',
        example_zh: '这站的换乘太复杂了',
        example_pronunciation: 'i yeok hwanseungi neomu bokjaphaeyo',
        unsplash: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=400&h=200&fit=crop&q=80'
      }
    ],
    night: [
      {
        id: 'night_bus',
        ko: '심야버스 있어요?',
        pronunciation: 'sim-ya-beo-seu iss-eo-yo',
        zh: '有夜班公交吗？',
        example_ko: '12시 이후 심야버스 운행해요?',
        example_zh: '12点以后有夜班公交运行吗？',
        example_pronunciation: 'yeoldu-si ihu simya-beoseu unhaeng-haeyo?',
        unsplash: 'https://images.unsplash.com/photo-1519003722824-194d4455a60c?w=400&h=200&fit=crop&q=80'
      },
      {
        id: 'last_train',
        ko: '막차가 몇 시예요?',
        pronunciation: 'mak-cha-ga myeot si-ye-yo',
        zh: '末班车是几点？',
        example_ko: '지하철 막차가 몇 시에 끝나요?',
        example_zh: '地铁末班车几点结束？',
        example_pronunciation: 'jihacheol makchaga myeot si-e kkeutnayo?',
        unsplash: 'https://images.unsplash.com/photo-1519003722824-194d4455a60c?w=400&h=200&fit=crop&q=80'
      },
      {
        id: 'night_taxi',
        ko: '밤늦게 택시 잡을 수 있어요?',
        pronunciation: 'bam-neut-ge taek-si jab-eul su iss-eo-yo',
        zh: '深夜可以打到出租车吗？',
        example_ko: '새벽 2시에도 택시 잡을 수 있어요?',
        example_zh: '凌晨2点也能打到出租车吗？',
        example_pronunciation: 'saebyeok du-si-edo taeksi jabeul su isseoyo?',
        unsplash: 'https://images.unsplash.com/photo-1519003722824-194d4455a60c?w=400&h=200&fit=crop&q=80'
      },
      {
        id: 'night_fare',
        ko: '심야 요금이 더 비싸요?',
        pronunciation: 'sim-ya yo-geum-i deo bi-ssa-yo',
        zh: '深夜票价更贵吗？',
        example_ko: '밤 12시 이후에 택시 요금이 더 비싸요?',
        example_zh: '晚上12点以后出租车费更贵吗？',
        example_pronunciation: 'bam yeoldu-si ihu-e taeksi yogeumi deo bissayo?',
        unsplash: 'https://images.unsplash.com/photo-1519003722824-194d4455a60c?w=400&h=200&fit=crop&q=80'
      },
      {
        id: 'overnight_subway',
        ko: '지하철 심야 운행해요?',
        pronunciation: 'ji-ha-cheol sim-ya un-haeng-hae-yo',
        zh: '地铁有深夜运行吗？',
        example_ko: '주말에 지하철 심야 연장 운행해요?',
        example_zh: '周末地铁有深夜延长运行吗？',
        example_pronunciation: 'jumare jihacheol simya yeomjang unhaeng-haeyo?',
        unsplash: 'https://images.unsplash.com/photo-1519003722824-194d4455a60c?w=400&h=200&fit=crop&q=80'
      },
      {
        id: 'safe_transport',
        ko: '밤에 안전한 교통수단이 뭐예요?',
        pronunciation: 'bam-e an-jeon-han gyo-tong-su-dan-i mwo-ye-yo',
        zh: '晚上什么交通工具比较安全？',
        example_ko: '여자 혼자 밤늦게 이동할 때 뭐가 안전해요?',
        example_zh: '女性一个人深夜出行什么比较安全？',
        example_pronunciation: 'yeoja honja bamneul-ge idong-hal ttae mwoga anjeonhaeyo?',
        unsplash: 'https://images.unsplash.com/photo-1519003722824-194d4455a60c?w=400&h=200&fit=crop&q=80'
      },
      {
        id: 'night_bus_stop',
        ko: '심야버스 정류장이 어디예요?',
        pronunciation: 'sim-ya-beo-seu jeong-ryu-jang-i eo-di-ye-yo',
        zh: '夜班公交站在哪里？',
        example_ko: '명동 심야버스 정류장이 어디예요?',
        example_zh: '明洞夜班公交站在哪里？',
        example_pronunciation: 'myeongdong simya-beoseu jeongyujangi eodiyeyo?',
        unsplash: 'https://images.unsplash.com/photo-1519003722824-194d4455a60c?w=400&h=200&fit=crop&q=80'
      },
      {
        id: 'call_taxi_app',
        ko: '택시 앱으로 부를 수 있어요?',
        pronunciation: 'taek-si aep-eu-ro bu-reul su iss-eo-yo',
        zh: '可以用打车App叫车吗？',
        example_ko: '카카오택시로 밤늦게도 부를 수 있어요?',
        example_zh: '用KakaoTaxi深夜也能叫车吗？',
        example_pronunciation: 'kakao-taeksiro bamneul-gedo bureul su isseoyo?',
        unsplash: 'https://images.unsplash.com/photo-1519003722824-194d4455a60c?w=400&h=200&fit=crop&q=80'
      },
      {
        id: 'night_schedule',
        ko: '심야 시간표 있어요?',
        pronunciation: 'sim-ya si-gan-pyo iss-eo-yo',
        zh: '有深夜时刻表吗？',
        example_ko: '심야버스 운행 시간표 어디서 볼 수 있어요?',
        example_zh: '深夜公交运行时刻表哪里可以看？',
        example_pronunciation: 'simya-beoseu unhaeng sigam-pyo eodiseo bol su isseoyo?',
        unsplash: 'https://images.unsplash.com/photo-1519003722824-194d4455a60c?w=400&h=200&fit=crop&q=80'
      },
      {
        id: 'walking_safe',
        ko: '밤에 걸어가도 안전해요?',
        pronunciation: 'bam-e geol-eo-ga-do an-jeon-hae-yo',
        zh: '晚上走路安全吗？',
        example_ko: '이 동네 밤에 걸어가도 안전해요?',
        example_zh: '这个社区晚上走路安全吗？',
        example_pronunciation: 'i dongne bame geoleogado anjeonhaeyo?',
        unsplash: 'https://images.unsplash.com/photo-1519003722824-194d4455a60c?w=400&h=200&fit=crop&q=80'
      }
    ]
  }

  // 플래시카드 컴포넌트
  const FlashCard = ({ card, tabId }) => {
    const [imgError, setImgError] = useState(false)
    const isBookmarked = bookmarkedCards.includes(card.id)

    // 탭별 그라데이션 색상
    const getGradientClass = (tabId) => {
      const gradients = {
        subway: 'bg-gradient-to-br from-blue-100 to-indigo-200',
        bus: 'bg-gradient-to-br from-green-100 to-emerald-200',
        taxi: 'bg-gradient-to-br from-yellow-100 to-amber-200',
        ktx: 'bg-gradient-to-br from-purple-100 to-violet-200',
        airport: 'bg-gradient-to-br from-cyan-100 to-blue-200',
        rental: 'bg-gradient-to-br from-red-100 to-pink-200',
        transport_card: 'bg-gradient-to-br from-orange-100 to-red-200',
        transfer: 'bg-gradient-to-br from-teal-100 to-cyan-200',
        night: 'bg-gradient-to-br from-gray-100 to-slate-200'
      }
      return gradients[tabId] || 'bg-gradient-to-br from-gray-100 to-gray-200'
    }

    // 탭별 아이콘
    const getTabIcon = (tabId) => {
      const icons = {
        subway: Train,
        bus: Bus, 
        taxi: Car,
        ktx: Train,
        airport: Plane,
        rental: Car,
        transport_card: CreditCard,
        transfer: ArrowRight,
        night: Navigation
      }
      const Icon = icons[tabId] || Train
      return <Icon size={48} className="text-white/60" />
    }

    return (
      <div className="bg-white rounded-lg border border-gray-100 overflow-hidden mb-3">
        {/* 이미지/그라데이션 영역 */}
        <div className="relative w-full h-[160px]">
          {!imgError && card.unsplash ? (
            <img 
              src={card.unsplash} 
              onError={() => setImgError(true)} 
              className="w-full h-[160px] object-cover" 
              alt=""
            />
          ) : (
            <div className={`w-full h-[160px] ${getGradientClass(tabId)} flex items-center justify-center`}>
              {getTabIcon(tabId)}
            </div>
          )}
          {/* 북마크 버튼 */}
          <button
            onClick={() => toggleBookmark(card.id)}
            className={`absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
              isBookmarked 
                ? 'bg-yellow-500 text-white' 
                : 'bg-white/80 text-gray-600 hover:bg-yellow-500 hover:text-white'
            }`}
          >
            <Bookmark size={16} className={isBookmarked ? 'fill-current' : ''} />
          </button>
        </div>

        {/* 콘텐츠 영역 */}
        <div className="px-2 py-2">
          {/* 메인 문장 + 음성 */}
          <div className="flex items-center justify-between mb-1">
            <button onClick={() => copyToClipboard(card.ko)} className="flex-1 text-left">
              <span className="text-xl font-bold text-gray-900 tracking-tight">{card.ko}</span>
            </button>
            <button onClick={() => speak(card.ko)} className="ml-2 w-8 h-8 bg-gray-50 rounded-full flex items-center justify-center">
              <Volume2 size={14} className="text-gray-400" />
            </button>
          </div>

          {/* 발음 + 중국어 한줄 */}
          <div className="flex items-baseline gap-2 mb-2">
            <span className="text-xs text-gray-400 font-light">[{card.pronunciation}]</span>
            <span className="text-sm text-gray-600">{card.zh}</span>
          </div>

          {/* 예문 */}
          <div className="bg-gray-50 rounded-md px-2 py-1.5 mb-2 space-y-0.5">
            <p className="text-sm text-gray-800 font-medium">"{card.example_ko}"</p>
            <p className="text-xs text-gray-500">"{card.example_zh}"</p>
            <p className="text-[10px] text-gray-400 font-light italic">{card.example_pronunciation}</p>
          </div>

          {/* 하단 액션 버튼 */}
          <div className="flex gap-1.5">
            <button
              onClick={() => copyToClipboard(card.ko)}
              className="flex-1 bg-gray-100 text-gray-600 py-1.5 px-3 rounded-md text-xs flex items-center justify-center gap-1"
            >
              <Copy size={16} />
              <span className="text-sm font-medium">
                {L(lang, { ko: '탭하면 복사', zh: '点击复制', en: 'Tap to copy' })}
              </span>
            </button>
            <button
              onClick={() => speak(`${card.ko}. ${card.example_ko}`)}
              className="bg-blue-50 text-blue-600 py-1.5 px-3 rounded-md text-xs flex items-center justify-center gap-1"
            >
              <Volume2 size={16} />
              <span className="text-sm font-medium">
                {L(lang, { ko: '음성 재생', zh: '语音播放', en: 'Voice play' })}
              </span>
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4" style={{ fontFamily: 'Inter, sans-serif' }}>
      {/* 토스트 메시지 */}
      {toastMessage && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white px-4 py-2 rounded-lg text-sm z-50">
          {toastMessage}
        </div>
      )}

      {/* 소주제 탭 */}
      <div className="flex flex-wrap gap-1.5 pb-2">
        {tabs.map((tab) => {
          const Icon = tab.icon
          const isActive = activeTab === tab.id
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs transition-all ${
                isActive
                  ? 'bg-gray-900 text-white'
                  : 'bg-gray-100 text-gray-500'
              }`}
            >
              <Icon size={12} />
              <span className="font-medium">{L(lang, tab.name)}</span>
            </button>
          )
        })}
      </div>

      {/* 활성 탭 밑줄 표시 */}
      <div className="h-1 bg-gray-200 rounded-full relative mb-2">
        <div 
          className="absolute top-0 h-full bg-gray-900 rounded-full transition-all duration-300"
          style={{
            left: `${tabs.findIndex(t => t.id === activeTab) * (100 / tabs.length)}%`,
            width: `${100 / tabs.length}%`
          }}
        />
      </div>

      {/* 플래시카드 영역 */}
      <div className="space-y-4">
        {cardData[activeTab]?.map(card => (
          <FlashCard key={card.id} card={card} tabId={activeTab} />
        ))}
      </div>

      {/* 앱 연동 버튼들 */}
      <div className="space-y-3 mt-6">
        <h3 className="font-semibold text-gray-800 text-sm">
          {L(lang, { ko: '편리한 앱 연결', zh: '便利应用连接', en: 'Convenient App Links' })}
        </h3>
        
        <div className="grid grid-cols-1 gap-2">
          {/* 카카오택시 */}
          <button
            onClick={() => {
              try {
                openKakaoTaxi()
              } catch (e) {
                window.open('https://play.google.com/store/apps/details?id=com.kakao.taxi', '_blank')
              }
            }}
            className="flex items-center justify-between p-3 bg-yellow-50 border border-yellow-200 rounded-lg hover:bg-yellow-100 transition-colors"
          >
            <div className="flex items-center gap-3">
              <Car size={20} className="text-yellow-600" />
              <div className="text-left">
                <p className="font-medium text-gray-800">
                  {L(lang, { ko: '카카오택시', zh: 'KakaoTaxi', en: 'KakaoTaxi' })}
                </p>
                <p className="text-xs text-gray-500">
                  {L(lang, { ko: '택시 호출하기', zh: '叫出租车', en: 'Call taxi' })}
                </p>
              </div>
            </div>
            <div className="text-yellow-600">→</div>
          </button>

          {/* 타다 */}
          <button
            onClick={() => {
              try {
                openTada()
              } catch (e) {
                window.open('https://play.google.com/store/apps/details?id=com.vcnc.tada', '_blank')
              }
            }}
            className="flex items-center justify-between p-3 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors"
          >
            <div className="flex items-center gap-3">
              <Car size={20} className="text-blue-600" />
              <div className="text-left">
                <p className="font-medium text-gray-800">
                  {L(lang, { ko: '타다', zh: 'TADA', en: 'TADA' })}
                </p>
                <p className="text-xs text-gray-500">
                  {L(lang, { ko: '프리미엄 택시', zh: '高级出租车', en: 'Premium taxi' })}
                </p>
              </div>
            </div>
            <div className="text-blue-600">→</div>
          </button>

          {/* 네이버지도 */}
          <button
            onClick={() => {
              try {
                openNaverMap('길찾기')
              } catch (e) {
                window.open('https://map.naver.com/', '_blank')
              }
            }}
            className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100 transition-colors"
          >
            <div className="flex items-center gap-3">
              <MapPin size={20} className="text-green-600" />
              <div className="text-left">
                <p className="font-medium text-gray-800">
                  {L(lang, { ko: '네이버지도', zh: 'Naver地图', en: 'Naver Map' })}
                </p>
                <p className="text-xs text-gray-500">
                  {L(lang, { ko: '길찾기', zh: '导航', en: 'Navigation' })}
                </p>
              </div>
            </div>
            <div className="text-green-600">→</div>
          </button>

          {/* 카카오맵 */}
          <button
            onClick={() => {
              try {
                openKakaoMap('길찾기')
              } catch (e) {
                window.open('https://map.kakao.com/', '_blank')
              }
            }}
            className="flex items-center justify-between p-3 bg-yellow-50 border border-yellow-200 rounded-lg hover:bg-yellow-100 transition-colors"
          >
            <div className="flex items-center gap-3">
              <MapPin size={20} className="text-yellow-600" />
              <div className="text-left">
                <p className="font-medium text-gray-800">
                  {L(lang, { ko: '카카오맵', zh: 'KakaoMap', en: 'KakaoMap' })}
                </p>
                <p className="text-xs text-gray-500">
                  {L(lang, { ko: '길찾기', zh: '导航', en: 'Navigation' })}
                </p>
              </div>
            </div>
            <div className="text-yellow-600">→</div>
          </button>
        </div>
      </div>

      {/* 사용법 안내 */}
      <div className="text-xs text-gray-500 bg-blue-50 p-3 rounded-lg mt-6">
        💡 {L(lang, { 
          ko: '플래시카드를 탭하면 한국어가 복사됩니다. 🔊 버튼으로 음성을 들어보세요. 🔖 버튼으로 자주 쓰는 표현을 북마크하세요.', 
          zh: '点击卡片复制韩语。🔊按钮播放语音。🔖按钮收藏常用表达。', 
          en: 'Tap cards to copy Korean text. Use 🔊 for voice playback. Use 🔖 to bookmark frequently used expressions.' 
        })}
      </div>
    </div>
  )
}