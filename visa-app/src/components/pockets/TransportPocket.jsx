import { useState, useEffect } from 'react'
import { Bookmark, Volume2, Copy, Car, Train, Bus, Plane, Navigation, MapPin, ArrowRight } from 'lucide-react'

// 다국어 헬퍼 함수
const L = (lang, text) => text[lang] || text['ko']

export default function TransportPocket({ lang }) {
  const [activeTab, setActiveTab] = useState('taxi')
  const [address, setAddress] = useState('')
  const [showDisplayMode, setShowDisplayMode] = useState(false)
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

  // 앱 딥링크 함수
  const openApp = (appType) => {
    const links = {
      kakaoT: 'kakaot://launch',
      naverMap: 'nmap://search?query=' + encodeURIComponent(address),
      subway: 'citymapper://directions'
    }
    
    const fallbackUrls = {
      kakaoT: 'https://play.google.com/store/apps/details?id=com.kakao.taxi',
      naverMap: 'https://map.naver.com/',
      subway: 'https://www.citymapper.com/'
    }

    // 딥링크 시도 후 실패하면 웹사이트로 이동
    const link = document.createElement('a')
    link.href = links[appType]
    link.click()
    
    // 1초 후 앱이 실행되지 않았다면 웹사이트로 이동
    setTimeout(() => {
      window.open(fallbackUrls[appType], '_blank')
    }, 1000)
  }

  // 소주제 탭 데이터
  const tabs = [
    { id: 'taxi', name: { ko: '택시', zh: '出租车', en: 'Taxi' }, icon: Car },
    { id: 'subway', name: { ko: '지하철', zh: '地铁', en: 'Subway' }, icon: Train },
    { id: 'bus', name: { ko: '버스', zh: '公交车', en: 'Bus' }, icon: Bus },
    { id: 'ktx', name: { ko: 'KTX', zh: '高铁', en: 'KTX' }, icon: Train },
    { id: 'airport', name: { ko: '공항', zh: '机场', en: 'Airport' }, icon: Plane },
    { id: 'rental', name: { ko: '렌터카', zh: '租车', en: 'Rental Car' }, icon: Car },
    { id: 'transport_card', name: { ko: '교통카드', zh: '交通卡', en: 'Transport Card' }, icon: Copy },
    { id: 'transfer', name: { ko: '환승', zh: '换乘', en: 'Transfer' }, icon: ArrowRight },
    { id: 'night', name: { ko: '심야교통', zh: '深夜交通', en: 'Night Transport' }, icon: Navigation }
  ]

  // 플래시카드 데이터
  const cardData = {
    taxi: [
      {
        id: 'go_here',
        ko: '여기로 가주세요',
        pronunciation: 'yeo-gi-ro ga-ju-se-yo',
        zh: '请到这里',
        example_ko: '이 주소로 가주세요',
        example_zh: '请到这个地址',
        example_pronunciation: 'i juso-ro gajuseyo',
        unsplash: 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=400&h=200&fit=crop&q=80'
      },
      {
        id: 'stop_here',
        ko: '세워주세요',
        pronunciation: 'se-wo-ju-se-yo',
        zh: '请停车',
        example_ko: '여기서 세워주세요',
        example_zh: '请在这里停车',
        example_pronunciation: 'yeogiseo sewojuseyo',
        unsplash: 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=400&h=200&fit=crop&q=80'
      },
      {
        id: 'trunk',
        ko: '트렁크 열어주세요',
        pronunciation: 'teu-rung-keu yeo-reo-ju-se-yo',
        zh: '请打开后备箱',
        example_ko: '짐이 많아서 트렁크 열어주세요',
        example_zh: '行李很多，请打开后备箱',
        example_pronunciation: 'jimi manaseo teurungkeu yeoreojuseyo',
        unsplash: 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=400&h=200&fit=crop&q=80'
      },
      {
        id: 'how_much',
        ko: '얼마예요?',
        pronunciation: 'eol-ma-ye-yo',
        zh: '多少钱？',
        example_ko: '요금이 얼마예요?',
        example_zh: '车费多少钱？',
        example_pronunciation: 'yogeumi eolmayeyo?',
        unsplash: 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=400&h=200&fit=crop&q=80'
      },
      {
        id: 'receipt_please',
        ko: '영수증 주세요',
        pronunciation: 'yeong-su-jeung ju-se-yo',
        zh: '请给我收据',
        example_ko: '택시 영수증 주세요',
        example_zh: '请给我出租车收据',
        example_pronunciation: 'taeksi yeongsujeung juseyo',
        unsplash: 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=400&h=200&fit=crop&q=80'
      },
      {
        id: 'wait_please',
        ko: '잠깐 기다려주세요',
        pronunciation: 'jam-kkan gi-da-ryeo-ju-se-yo',
        zh: '请稍等一下',
        example_ko: '5분만 기다려주세요',
        example_zh: '请等5分钟',
        example_pronunciation: '5bunman gidaryeojuseyo',
        unsplash: 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=400&h=200&fit=crop&q=80'
      },
      {
        id: 'turn_left',
        ko: '왼쪽으로 가주세요',
        pronunciation: 'oen-jjok-eu-ro ga-ju-se-yo',
        zh: '请往左走',
        example_ko: '다음 신호등에서 왼쪽으로 가주세요',
        example_zh: '请在下个红绿灯往左走',
        example_pronunciation: 'daeum sinhodeung-eseo oenjjogeuro gajuseyo',
        unsplash: 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=400&h=200&fit=crop&q=80'
      },
      {
        id: 'turn_right',
        ko: '오른쪽으로 가주세요',
        pronunciation: 'o-reun-jjok-eu-ro ga-ju-se-yo',
        zh: '请往右走',
        example_ko: '저기서 오른쪽으로 돌아주세요',
        example_zh: '请在那里往右转',
        example_pronunciation: 'jeogiseo oreunjjogeuro dorajuseyo',
        unsplash: 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=400&h=200&fit=crop&q=80'
      },
      {
        id: 'straight',
        ko: '직진해주세요',
        pronunciation: 'jik-jin-hae-ju-se-yo',
        zh: '请直走',
        example_ko: '계속 직진해주세요',
        example_zh: '请继续直走',
        example_pronunciation: 'gyesok jikjin-haejuseyo',
        unsplash: 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=400&h=200&fit=crop&q=80'
      },
      {
        id: 'fast_please',
        ko: '빨리 가주세요',
        pronunciation: 'ppal-li ga-ju-se-yo',
        zh: '请快一点',
        example_ko: '급해서 빨리 가주세요',
        example_zh: '很着急，请快一点',
        example_pronunciation: 'geupaeseo ppalli gajuseyo',
        unsplash: 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=400&h=200&fit=crop&q=80'
      },
      {
        id: 'slowly_please',
        ko: '천천히 가주세요',
        pronunciation: 'cheon-cheon-hi ga-ju-se-yo',
        zh: '请慢一点',
        example_ko: '멀미가 나서 천천히 가주세요',
        example_zh: '晕车了，请慢一点',
        example_pronunciation: 'meolmiga naseo cheoncheonhi gajuseyo',
        unsplash: 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=400&h=200&fit=crop&q=80'
      },
      {
        id: 'card_payment',
        ko: '카드로 계산할게요',
        pronunciation: 'ka-deu-ro gye-san-hal-ge-yo',
        zh: '我要用卡支付',
        example_ko: '현금 없어서 카드로 계산할게요',
        example_zh: '没有现金，用卡支付',
        example_pronunciation: 'hyeongeum eopseo-seo kadeuro gyesanhalgeyo',
        unsplash: 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=400&h=200&fit=crop&q=80'
      }
    ],
    subway: [
      {
        id: 'how_to_go',
        ko: 'OO역 어떻게 가요?',
        pronunciation: 'OO-yeok eo-tteo-ke ga-yo',
        zh: '怎么去OO站？',
        example_ko: '강남역 어떻게 가요?',
        example_zh: '怎么去江南站？',
        example_pronunciation: 'gangnamyeok eotteoke gayo?',
        unsplash: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=400&h=200&fit=crop&q=80'
      },
      {
        id: 'charge_card',
        ko: '만원 충전해주세요',
        pronunciation: 'man-won chung-jeon-hae-ju-se-yo',
        zh: '请充值一万韩元',
        example_ko: 'T머니 만원 충전해주세요',
        example_zh: '请给T-money充值一万韩元',
        example_pronunciation: 'teumeoni manwon chungjeonhaejuseyo',
        unsplash: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=400&h=200&fit=crop&q=80'
      },
      {
        id: 'which_exit',
        ko: '몇 번 출구예요?',
        pronunciation: 'myeot beon chul-gu-ye-yo',
        zh: '几号出口？',
        example_ko: '롯데타워 몇 번 출구예요?',
        example_zh: '乐天塔几号出口？',
        example_pronunciation: 'rotdetawo myeot beon chulgu-yeyo?',
        unsplash: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=400&h=200&fit=crop&q=80'
      },
      {
        id: 'need_transfer',
        ko: '갈아타야 해요?',
        pronunciation: 'ga-ra-ta-ya hae-yo',
        zh: '需要换乘吗？',
        example_ko: '여기서 갈아타야 해요?',
        example_zh: '在这里需要换乘吗？',
        example_pronunciation: 'yeogiseo garataya haeyo?',
        unsplash: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=400&h=200&fit=crop&q=80'
      },
      {
        id: 'last_train',
        ko: '막차 몇 시예요?',
        pronunciation: 'mak-cha myeot si-ye-yo',
        zh: '末班车几点？',
        example_ko: '이 노선 막차 몇 시예요?',
        example_zh: '这条线路末班车几点？',
        example_pronunciation: 'i noseun makcha myeot siyeyo?',
        unsplash: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=400&h=200&fit=crop&q=80'
      },
      {
        id: 'which_direction',
        ko: '어느 방향으로 가야 해요?',
        pronunciation: 'eo-neu bang-hyang-eu-ro ga-ya hae-yo',
        zh: '应该往哪个方向？',
        example_ko: '홍대입구역 어느 방향으로 가야 해요?',
        example_zh: '去弘大入口站应该往哪个方向？',
        example_pronunciation: 'hongdaeipguyeok eoneu banghyangeu-ro gaya haeyo?',
        unsplash: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=400&h=200&fit=crop&q=80'
      },
      {
        id: 'how_many_stops',
        ko: '몇 정거장이에요?',
        pronunciation: 'myeot jeong-geo-jang-i-e-yo',
        zh: '几站？',
        example_ko: '여기서 몇 정거장이에요?',
        example_zh: '从这里几站？',
        example_pronunciation: 'yeogiseo myeot jeonggeojang-ieyo?',
        unsplash: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=400&h=200&fit=crop&q=80'
      },
      {
        id: 'subway_map',
        ko: '지하철 노선도 보여주세요',
        pronunciation: 'ji-ha-cheol no-seon-do bo-yeo-ju-se-yo',
        zh: '请给我看地铁线路图',
        example_ko: '지하철 노선도 어디에 있어요?',
        example_zh: '地铁线路图在哪里？',
        example_pronunciation: 'jihacheol noseondo eodie isseoyo?',
        unsplash: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=400&h=200&fit=crop&q=80'
      },
      {
        id: 'elevator',
        ko: '엘리베이터 어디에 있어요?',
        pronunciation: 'el-li-bei-teo eo-di-e iss-eo-yo',
        zh: '电梯在哪里？',
        example_ko: '짐이 많은데 엘리베이터 어디에 있어요?',
        example_zh: '行李很多，电梯在哪里？',
        example_pronunciation: 'jimi maneunde ellibeiteo eodie isseoyo?',
        unsplash: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=400&h=200&fit=crop&q=80'
      },
      {
        id: 'wheelchair',
        ko: '휠체어 접근 가능해요?',
        pronunciation: 'hwil-che-eo jeop-geun ga-neung-hae-yo',
        zh: '轮椅可以进入吗？',
        example_ko: '이 역은 휠체어 접근 가능해요?',
        example_zh: '这个站轮椅可以进入吗？',
        example_pronunciation: 'i yeog-eun hwilcheeo jeopgeun ganeung-haeyo?',
        unsplash: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=400&h=200&fit=crop&q=80'
      },
      {
        id: 'lost_and_found',
        ko: '분실물 센터 어디예요?',
        pronunciation: 'bun-sil-mul sen-teo eo-di-ye-yo',
        zh: '失物招领处在哪里？',
        example_ko: '지갑을 잃어버렸는데 분실물 센터 어디예요?',
        example_zh: '丢了钱包，失物招领处在哪里？',
        example_pronunciation: 'jigabeul ireobeorin-neunde bunsilmul senteo eodiyeyo?',
        unsplash: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=400&h=200&fit=crop&q=80'
      },
      {
        id: 'express_train',
        ko: '급행 전철이에요?',
        pronunciation: 'geu-paeng jeon-cheol-i-e-yo',
        zh: '是快车吗？',
        example_ko: '이 전철은 급행이에요? 완행이에요?',
        example_zh: '这列车是快车还是慢车？',
        example_pronunciation: 'i jeoncheer-eun geupaeng-ieyo? wanhaeng-ieyo?',
        unsplash: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=400&h=200&fit=crop&q=80'
      }
    ],
    bus: [
      {
        id: 'goes_to',
        ko: '이 버스 OO 가요?',
        pronunciation: 'i beo-seu OO ga-yo',
        zh: '这班车去OO吗？',
        example_ko: '이 버스 강남 가요?',
        example_zh: '这班车去江南吗？',
        example_pronunciation: 'i beoseu gangnam gayo?',
        unsplash: 'https://images.unsplash.com/photo-1570125909517-53cb21c89ff2?w=400&h=200&fit=crop&q=80'
      },
      {
        id: 'next_stop',
        ko: '다음 정류장에서 내려주세요',
        pronunciation: 'da-eum jeong-ryu-jang-e-seo nae-ryeo-ju-se-yo',
        zh: '请在下一站让我下车',
        example_ko: '다음 정류장에서 내릴게요',
        example_zh: '我在下一站下车',
        example_pronunciation: 'daeum jeongryujang-eseo naerilgeyo',
        unsplash: 'https://images.unsplash.com/photo-1570125909517-53cb21c89ff2?w=400&h=200&fit=crop&q=80'
      },
      {
        id: 'how_long',
        ko: 'OO까지 얼마나 걸려요?',
        pronunciation: 'OO-kka-ji eol-ma-na geol-lyeo-yo',
        zh: '到OO要多长时间？',
        example_ko: '명동까지 얼마나 걸려요?',
        example_zh: '到明洞要多长时间？',
        example_pronunciation: 'myeongdong-kkaji eolmana geollyeoyo?',
        unsplash: 'https://images.unsplash.com/photo-1570125909517-53cb21c89ff2?w=400&h=200&fit=crop&q=80'
      },
      {
        id: 'bus_number',
        ko: '몇 번 버스 타야 해요?',
        pronunciation: 'myeot beon beo-seu ta-ya hae-yo',
        zh: '要坐几号公交车？',
        example_ko: '시청 가려면 몇 번 버스 타야 해요?',
        example_zh: '去市政厅要坐几号公交车？',
        example_pronunciation: 'sicheong garyeomyeon myeot beon beoseu taya haeyo?',
        unsplash: 'https://images.unsplash.com/photo-1570125909517-53cb21c89ff2?w=400&h=200&fit=crop&q=80'
      },
      {
        id: 'bus_stop_location',
        ko: '버스 정류장이 어디예요?',
        pronunciation: 'beo-seu jeong-ryu-jang-i eo-di-ye-yo',
        zh: '公交站在哪里？',
        example_ko: '146번 버스 정류장이 어디예요?',
        example_zh: '146号公交站在哪里？',
        example_pronunciation: '146beon beoseu jeongryujangi eodiyeyo?',
        unsplash: 'https://images.unsplash.com/photo-1570125909517-53cb21c89ff2?w=400&h=200&fit=crop&q=80'
      },
      {
        id: 'bus_schedule',
        ko: '버스 시간표 있어요?',
        pronunciation: 'beo-seu si-gan-pyo iss-eo-yo',
        zh: '有公交时刻表吗？',
        example_ko: '이 버스 시간표나 배차간격 어떻게 돼요?',
        example_zh: '这班车的时刻表或发车间隔怎么样？',
        example_pronunciation: 'i beoseu sigangangyona baechagan-gyeok eotteoke dwaeyo?',
        unsplash: 'https://images.unsplash.com/photo-1570125909517-53cb21c89ff2?w=400&h=200&fit=crop&q=80'
      },
      {
        id: 'express_bus',
        ko: '급행버스예요?',
        pronunciation: 'geu-paeng-beo-seu-ye-yo',
        zh: '是快速公交吗？',
        example_ko: '이 버스는 급행버스예요? 일반버스예요?',
        example_zh: '这是快速公交还是普通公交？',
        example_pronunciation: 'i beoseu-neun geupaengbeoseuyeyo? ilbanbeoseuyeyo?',
        unsplash: 'https://images.unsplash.com/photo-1570125909517-53cb21c89ff2?w=400&h=200&fit=crop&q=80'
      },
      {
        id: 'fare_amount',
        ko: '요금이 얼마예요?',
        pronunciation: 'yo-geum-i eol-ma-ye-yo',
        zh: '车费多少钱？',
        example_ko: '버스 요금이 얼마예요?',
        example_zh: '公交车费多少钱？',
        example_pronunciation: 'beoseu yogeumi eolmayeyo?',
        unsplash: 'https://images.unsplash.com/photo-1570125909517-53cb21c89ff2?w=400&h=200&fit=crop&q=80'
      },
      {
        id: 'back_door',
        ko: '뒷문으로 내릴게요',
        pronunciation: 'dwit-mun-eu-ro nae-ril-ge-yo',
        zh: '从后门下车',
        example_ko: '뒷문으로 내리면 돼요?',
        example_zh: '从后门下车可以吗？',
        example_pronunciation: 'dwitmuneu-ro naerimyeon dwaeyo?',
        unsplash: 'https://images.unsplash.com/photo-1570125909517-53cb21c89ff2?w=400&h=200&fit=crop&q=80'
      },
      {
        id: 'seat_available',
        ko: '자리 있어요?',
        pronunciation: 'ja-ri iss-eo-yo',
        zh: '有座位吗？',
        example_ko: '앉을 자리 있어요?',
        example_zh: '有可以坐的位置吗？',
        example_pronunciation: 'anjeul jari isseoyo?',
        unsplash: 'https://images.unsplash.com/photo-1570125909517-53cb21c89ff2?w=400&h=200&fit=crop&q=80'
      },
      {
        id: 'priority_seat',
        ko: '노약자석이에요',
        pronunciation: 'no-yak-ja-seok-i-e-yo',
        zh: '这是优先座位',
        example_ko: '저기는 노약자석이니까 조심하세요',
        example_zh: '那里是优先座位，请注意',
        example_pronunciation: 'jeogineun noyakja-seogi-nikka josimhaseyo',
        unsplash: 'https://images.unsplash.com/photo-1570125909517-53cb21c89ff2?w=400&h=200&fit=crop&q=80'
      },
      {
        id: 'bus_arrival',
        ko: '버스 언제 와요?',
        pronunciation: 'beo-seu eon-je wa-yo',
        zh: '公交车什么时候来？',
        example_ko: '다음 버스 언제 와요?',
        example_zh: '下一班车什么时候来？',
        example_pronunciation: 'daeum beoseu eonje wayo?',
        unsplash: 'https://images.unsplash.com/photo-1570125909517-53cb21c89ff2?w=400&h=200&fit=crop&q=80'
      }
    ],
    ktx: [
      {
        id: 'ticket_busan',
        ko: '부산행 표 주세요',
        pronunciation: 'bu-san-haeng pyo ju-se-yo',
        zh: '请给我去釜山的票',
        example_ko: '부산행 KTX 표 한 장 주세요',
        example_zh: '请给我一张去釜山的KTX票',
        example_pronunciation: 'busan-haeng KTX pyo han jang juseyo',
        unsplash: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=400&h=200&fit=crop&q=80'
      },
      {
        id: 'reserved_seat',
        ko: '지정석으로 주세요',
        pronunciation: 'ji-jeong-seok-eu-ro ju-se-yo',
        zh: '请给我指定座位',
        example_ko: '창가 지정석으로 주세요',
        example_zh: '请给我靠窗的指定座位',
        example_pronunciation: 'changga jijeongseokeuro juseyo',
        unsplash: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=400&h=200&fit=crop&q=80'
      },
      {
        id: 'departure_time',
        ko: '몇 시 출발이에요?',
        pronunciation: 'myeot si chul-bal-i-e-yo',
        zh: '几点出发？',
        example_ko: '다음 차 몇 시 출발이에요?',
        example_zh: '下一班几点出发？',
        example_pronunciation: 'daeum cha myeot si chulbal-ieyo?',
        unsplash: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=400&h=200&fit=crop&q=80'
      },
      {
        id: 'platform',
        ko: '몇 번 승강장이에요?',
        pronunciation: 'myeot beon seung-gang-jang-i-e-yo',
        zh: '几号站台？',
        example_ko: '부산행은 몇 번 승강장이에요?',
        example_zh: '去釜山的是几号站台？',
        example_pronunciation: 'busan-haengeun myeot beon seunggangjang-ieyo?',
        unsplash: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=400&h=200&fit=crop&q=80'
      },
      {
        id: 'arrival_time',
        ko: '몇 시에 도착해요?',
        pronunciation: 'myeot si-e do-chak-hae-yo',
        zh: '几点到达？',
        example_ko: '부산에 몇 시에 도착해요?',
        example_zh: '几点到达釜山？',
        example_pronunciation: 'busane myeot si-e dochakhaeyo?',
        unsplash: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=400&h=200&fit=crop&q=80'
      },
      {
        id: 'round_trip',
        ko: '왕복표 주세요',
        pronunciation: 'wang-bok-pyo ju-se-yo',
        zh: '请给我往返票',
        example_ko: '부산 왕복표로 주세요',
        example_zh: '请给我去釜山的往返票',
        example_pronunciation: 'busan wangbok-pyoro juseyo',
        unsplash: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=400&h=200&fit=crop&q=80'
      },
      {
        id: 'discount_ticket',
        ko: '할인 티켓 있어요?',
        pronunciation: 'hal-in ti-ket iss-eo-yo',
        zh: '有优惠票吗？',
        example_ko: '청소년 할인이나 외국인 할인 있어요?',
        example_zh: '有青少年折扣或外国人折扣吗？',
        example_pronunciation: 'cheongsonyeon harini-na oegugin harin isseoyo?',
        unsplash: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=400&h=200&fit=crop&q=80'
      },
      {
        id: 'change_ticket',
        ko: '표 변경하고 싶어요',
        pronunciation: 'pyo byeon-gyeong-ha-go si-peo-yo',
        zh: '我想改票',
        example_ko: '다른 시간으로 표 변경하고 싶어요',
        example_zh: '我想改到其他时间',
        example_pronunciation: 'dareun siganeuro pyo byeongyeonghago sipeoyo',
        unsplash: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=400&h=200&fit=crop&q=80'
      },
      {
        id: 'refund_ticket',
        ko: '환불하고 싶어요',
        pronunciation: 'hwan-bul-ha-go si-peo-yo',
        zh: '我想退票',
        example_ko: '급한 일이 생겨서 환불하고 싶어요',
        example_zh: '有急事想退票',
        example_pronunciation: 'geupan iri saenggyeoseo hwanbul-hago sipeoyo',
        unsplash: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=400&h=200&fit=crop&q=80'
      },
      {
        id: 'dining_car',
        ko: '식당칸 있어요?',
        pronunciation: 'sik-dang-kan iss-eo-yo',
        zh: '有餐车吗？',
        example_ko: 'KTX에 식당칸이나 매점 있어요?',
        example_zh: 'KTX有餐车或小卖部吗？',
        example_pronunciation: 'KTX-e sikdangkani-na maejeom isseoyo?',
        unsplash: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=400&h=200&fit=crop&q=80'
      },
      {
        id: 'wifi_available',
        ko: '와이파이 돼요?',
        pronunciation: 'wa-i-pa-i dwae-yo',
        zh: '有wifi吗？',
        example_ko: 'KTX에서 와이파이 사용할 수 있어요?',
        example_zh: 'KTX里可以使用wifi吗？',
        example_pronunciation: 'KTX-eseo waipayi sayonghal su isseoyo?',
        unsplash: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=400&h=200&fit=crop&q=80'
      }
    ],
    airport: [
      {
        id: 'checkin_counter',
        ko: '체크인 카운터 어디예요?',
        pronunciation: 'che-keu-in ka-un-teo eo-di-ye-yo',
        zh: '值机柜台在哪里？',
        example_ko: '대한항공 체크인 카운터 어디예요?',
        example_zh: '大韩航空值机柜台在哪里？',
        example_pronunciation: 'daehanhang-gong chekeu-in kaunteo eodiyeyo?',
        unsplash: 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=400&h=200&fit=crop&q=80'
      },
      {
        id: 'departure_gate',
        ko: '출발 게이트 어디예요?',
        pronunciation: 'chul-bal ge-i-teu eo-di-ye-yo',
        zh: '登机口在哪里？',
        example_ko: 'A12 게이트 어디예요?',
        example_zh: 'A12登机口在哪里？',
        example_pronunciation: 'A12 geiteu eodiyeyo?',
        unsplash: 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=400&h=200&fit=crop&q=80'
      },
      {
        id: 'boarding_time',
        ko: '탑승 시간 언제예요?',
        pronunciation: 'tap-seung si-gan eon-je-ye-yo',
        zh: '登机时间是什么时候？',
        example_ko: '몇 시에 탑승 시작해요?',
        example_zh: '几点开始登机？',
        example_pronunciation: 'myeot si-e tapseung sijakhaeyo?',
        unsplash: 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=400&h=200&fit=crop&q=80'
      },
      {
        id: 'baggage_claim',
        ko: '수하물 찾는 곳 어디예요?',
        pronunciation: 'su-ha-mul chat-neun got eo-di-ye-yo',
        zh: '行李领取处在哪里？',
        example_ko: '국제선 수하물 찾는 곳 어디예요?',
        example_zh: '国际航班行李领取处在哪里？',
        example_pronunciation: 'gukjeseon suhamul chatneun got eodiyeyo?',
        unsplash: 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=400&h=200&fit=crop&q=80'
      },
      {
        id: 'duty_free',
        ko: '면세점 어디예요?',
        pronunciation: 'myeon-se-jeom eo-di-ye-yo',
        zh: '免税店在哪里？',
        example_ko: '출국장 면세점 어디예요?',
        example_zh: '出境大厅免税店在哪里？',
        example_pronunciation: 'chulgugjang myeonsejeom eodiyeyo?',
        unsplash: 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=400&h=200&fit=crop&q=80'
      },
      {
        id: 'security_check',
        ko: '보안검색대 어디예요?',
        pronunciation: 'bo-an-geom-saek-dae eo-di-ye-yo',
        zh: '安检处在哪里？',
        example_ko: '보안검색대 통과하는 곳 어디예요?',
        example_zh: '通过安检的地方在哪里？',
        example_pronunciation: 'boangeomsaek-dae tongga-haneun got eodiyeyo?',
        unsplash: 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=400&h=200&fit=crop&q=80'
      },
      {
        id: 'immigration',
        ko: '출입국 사무소 어디예요?',
        pronunciation: 'chul-ip-guk sa-mu-so eo-di-ye-yo',
        zh: '出入境处在哪里？',
        example_ko: '출국 심사대 어디예요?',
        example_zh: '出境审查台在哪里？',
        example_pronunciation: 'chulguk simsadae eodiyeyo?',
        unsplash: 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=400&h=200&fit=crop&q=80'
      },
      {
        id: 'currency_exchange',
        ko: '환전소 어디예요?',
        pronunciation: 'hwan-jeon-so eo-di-ye-yo',
        zh: '兑换处在哪里？',
        example_ko: '달러 환전할 수 있는 곳 어디예요?',
        example_zh: '可以兑换美元的地方在哪里？',
        example_pronunciation: 'dalleo hwanjeonhal su inneun got eodiyeyo?',
        unsplash: 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=400&h=200&fit=crop&q=80'
      },
      {
        id: 'taxi_bus_stop',
        ko: '공항버스 정류장 어디예요?',
        pronunciation: 'gong-hang-beo-seu jeong-ryu-jang eo-di-ye-yo',
        zh: '机场巴士站在哪里？',
        example_ko: '시내 가는 공항버스 어디서 타요?',
        example_zh: '去市内的机场巴士在哪里坐？',
        example_pronunciation: 'sinae ganeun gonghangbeoseu eodiseo tayo?',
        unsplash: 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=400&h=200&fit=crop&q=80'
      },
      {
        id: 'flight_delay',
        ko: '항공편이 지연됐어요?',
        pronunciation: 'hang-gong-pyeon-i ji-yeon-dwae-sseo-yo',
        zh: '航班延误了吗？',
        example_ko: '제 항공편이 지연되었나요?',
        example_zh: '我的航班延误了吗？',
        example_pronunciation: 'je hanggongpyeoni jiyeondoe-eonnayo?',
        unsplash: 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=400&h=200&fit=crop&q=80'
      },
      {
        id: 'airport_wifi',
        ko: '공항 와이파이 비밀번호 뭐예요?',
        pronunciation: 'gong-hang wa-i-pa-i bi-mil-beon-ho mwo-ye-yo',
        zh: '机场wifi密码是什么？',
        example_ko: '무료 와이파이 어떻게 연결해요?',
        example_zh: '免费wifi怎么连接？',
        example_pronunciation: 'muryo waipai eotteoke yeongyeolhaeyo?',
        unsplash: 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=400&h=200&fit=crop&q=80'
      },
      {
        id: 'lost_luggage',
        ko: '짐을 잃어버렸어요',
        pronunciation: 'jim-eul ir-eo-beo-ryeo-sseo-yo',
        zh: '我的行李丢了',
        example_ko: '수하물을 찾을 수 없어요',
        example_zh: '找不到行李',
        example_pronunciation: 'suhamureul chajeul su eopseoyo',
        unsplash: 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=400&h=200&fit=crop&q=80'
      }
    ],
    rental: [
      {
        id: 'rent_car',
        ko: '차 빌리고 싶어요',
        pronunciation: 'cha bil-ri-go si-peo-yo',
        zh: '我想租车',
        example_ko: '하루 동안 차 빌리고 싶어요',
        example_zh: '我想租一天车',
        example_pronunciation: 'haru dong-an cha billigo sipeoyo',
        unsplash: 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=400&h=200&fit=crop&q=80'
      },
      {
        id: 'license_ok',
        ko: '국제 운전면허증 있어요',
        pronunciation: 'guk-je un-jeon-myeon-heo-jeung iss-eo-yo',
        zh: '我有国际驾照',
        example_ko: '국제 운전면허증으로 운전할 수 있어요',
        example_zh: '可以用国际驾照开车',
        example_pronunciation: 'gukje unjeonmyeonheojeugeuro unjeonhal su isseoyo',
        unsplash: 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=400&h=200&fit=crop&q=80'
      },
      {
        id: 'return_car',
        ko: '차 반납하려고 해요',
        pronunciation: 'cha ban-nap-ha-ryeo-go hae-yo',
        zh: '我要还车',
        example_ko: '공항에서 차 반납하려고 해요',
        example_zh: '我要在机场还车',
        example_pronunciation: 'gonghang-eseo cha bannapharyeogo haeyo',
        unsplash: 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=400&h=200&fit=crop&q=80'
      },
      {
        id: 'car_type',
        ko: '어떤 종류 차가 있어요?',
        pronunciation: 'eo-tteon jong-ryu cha-ga iss-eo-yo',
        zh: '有什么类型的车？',
        example_ko: '소형차부터 SUV까지 어떤 차가 있어요?',
        example_zh: '从小型车到SUV有什么车？',
        example_pronunciation: 'sohyeongcha-buteo SUV-kkaji eotteon chaga isseoyo?',
        unsplash: 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=400&h=200&fit=crop&q=80'
      },
      {
        id: 'daily_rate',
        ko: '하루 요금이 얼마예요?',
        pronunciation: 'ha-ru yo-geum-i eol-ma-ye-yo',
        zh: '一天租金多少？',
        example_ko: '이 차 하루 렌탈료가 얼마예요?',
        example_zh: '这辆车一天租金多少？',
        example_pronunciation: 'i cha haru rentalryoga eolmayeyo?',
        unsplash: 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=400&h=200&fit=crop&q=80'
      },
      {
        id: 'insurance',
        ko: '보험이 포함되어 있어요?',
        pronunciation: 'bo-heom-i po-ham-doe-eo iss-eo-yo',
        zh: '包含保险吗？',
        example_ko: '종합보험이 포함된 가격이에요?',
        example_zh: '是包含综合保险的价格吗？',
        example_pronunciation: 'jonghap-boeomi pohamdoen gagyeogi-eyo?',
        unsplash: 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=400&h=200&fit=crop&q=80'
      },
      {
        id: 'fuel_policy',
        ko: '기름은 어떻게 해요?',
        pronunciation: 'gi-reum-eun eo-tteo-ke hae-yo',
        zh: '油费怎么算？',
        example_ko: '기름을 가득 채워서 반납해야 해요?',
        example_zh: '需要加满油还车吗？',
        example_pronunciation: 'gireumeul gadeuk chaewoseo bannap-haeya haeyo?',
        unsplash: 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=400&h=200&fit=crop&q=80'
      },
      {
        id: 'deposit',
        ko: '보증금이 얼마예요?',
        pronunciation: 'bo-jeung-geum-i eol-ma-ye-yo',
        zh: '押金多少？',
        example_ko: '신용카드로 보증금을 걸어야 해요?',
        example_zh: '需要用信用卡交押金吗？',
        example_pronunciation: 'sinyong-kadeu-ro boj-eung-geumeul georeoya haeyo?',
        unsplash: 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=400&h=200&fit=crop&q=80'
      },
      {
        id: 'gps_navigation',
        ko: 'GPS 네비게이션 있어요?',
        pronunciation: 'GPS ne-bi-ge-i-syeon iss-eo-yo',
        zh: '有GPS导航吗？',
        example_ko: '한국어 GPS 네비게이션 사용할 수 있어요?',
        example_zh: '可以使用韩语GPS导航吗？',
        example_pronunciation: 'hangugeo GPS nebigeisyeon sayonghal su isseoyo?',
        unsplash: 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=400&h=200&fit=crop&q=80'
      },
      {
        id: 'emergency_contact',
        ko: '응급상황 연락처 알려주세요',
        pronunciation: 'eung-geup-sang-hwang yeon-rak-cheo al-lyeo-ju-se-yo',
        zh: '请告诉我紧急联系方式',
        example_ko: '사고가 나면 어디로 연락해야 해요?',
        example_zh: '发生事故应该联系哪里？',
        example_pronunciation: 'sagoga namyeon eodiro yeonrak-haeya haeyo?',
        unsplash: 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=400&h=200&fit=crop&q=80'
      }
    ],
    transport_card: [
      {
        id: 'buy_tmoney',
        ko: 'T머니카드 사고 싶어요',
        pronunciation: 'ti-meo-ni-ka-deu sa-go si-peo-yo',
        zh: '我想买T-money卡',
        example_ko: 'T머니카드 어디서 사요?',
        example_zh: 'T-money卡在哪里买？',
        example_pronunciation: 'timeoni kadeu eodiseo sayo?',
        unsplash: 'https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=400&h=200&fit=crop&q=80'
      },
      {
        id: 'recharge_card',
        ko: '교통카드 충전해주세요',
        pronunciation: 'gyo-tong-ka-deu chung-jeon-hae-ju-se-yo',
        zh: '请给交通卡充值',
        example_ko: '2만원 충전해주세요',
        example_zh: '请充值2万韩元',
        example_pronunciation: 'i-manwon chungjeonhaejuseyo',
        unsplash: 'https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=400&h=200&fit=crop&q=80'
      },
      {
        id: 'check_balance',
        ko: '잔액 확인하고 싶어요',
        pronunciation: 'jan-aek hwag-in-ha-go si-peo-yo',
        zh: '我想查看余额',
        example_ko: '카드 잔액 얼마나 남았어요?',
        example_zh: '卡里余额还有多少？',
        example_pronunciation: 'kadeu janaek eolmana namasseyo?',
        unsplash: 'https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=400&h=200&fit=crop&q=80'
      }
    ],
    transfer: [
      {
        id: 'need_transfer',
        ko: '갈아타야 해요?',
        pronunciation: 'ga-ra-ta-ya hae-yo',
        zh: '需要换乘吗？',
        example_ko: '명동 가려면 갈아타야 해요?',
        example_zh: '去明洞需要换乘吗？',
        example_pronunciation: 'myeongdong garyeomyeon garataya haeyo?',
        unsplash: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=400&h=200&fit=crop&q=80'
      },
      {
        id: 'transfer_station',
        ko: '환승역이 어디예요?',
        pronunciation: 'hwan-seung-yeok-i eo-di-ye-yo',
        zh: '换乘站在哪里？',
        example_ko: '2호선 환승역이 어디예요?',
        example_zh: '2号线换乘站在哪里？',
        example_pronunciation: '2ho-seon hwanseung-yeogi eodiyeyo?',
        unsplash: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=400&h=200&fit=crop&q=80'
      },
      {
        id: 'free_transfer',
        ko: '무료 환승 돼요?',
        pronunciation: 'mu-ryo hwan-seung dwae-yo',
        zh: '可以免费换乘吗？',
        example_ko: '버스에서 지하철로 무료 환승 돼요?',
        example_zh: '从公交车换地铁可以免费换乘吗？',
        example_pronunciation: 'beoseueseo jihacheollo muryo hwanseung dwaeyo?',
        unsplash: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=400&h=200&fit=crop&q=80'
      }
    ],
    night: [
      {
        id: 'night_bus',
        ko: '심야버스 있어요?',
        pronunciation: 'sim-ya-beo-seu iss-eo-yo',
        zh: '有深夜公交车吗？',
        example_ko: '새벽까지 운행하는 버스 있어요?',
        example_zh: '有运行到凌晨的公交车吗？',
        example_pronunciation: 'saebyeok-kkaji unhaenghaneun beoseu isseoyo?',
        unsplash: 'https://images.unsplash.com/photo-1570125909517-53cb21c89ff2?w=400&h=200&fit=crop&q=80'
      },
      {
        id: 'last_subway',
        ko: '막차 몇 시예요?',
        pronunciation: 'mak-cha myeot si-ye-yo',
        zh: '末班车几点？',
        example_ko: '지하철 막차 시간 알려주세요',
        example_zh: '请告诉我地铁末班车时间',
        example_pronunciation: 'jihacheol makcha sigan allyeojuseyo',
        unsplash: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=400&h=200&fit=crop&q=80'
      },
      {
        id: 'night_taxi',
        ko: '심야 할증이 있어요?',
        pronunciation: 'sim-ya hal-jeung-i iss-eo-yo',
        zh: '有深夜加价吗？',
        example_ko: '밤 12시 이후에 택시 할증 있어요?',
        example_zh: '晚上12点以后出租车有加价吗？',
        example_pronunciation: 'bam 12si ihu-e taeksi haljeung isseoyo?',
        unsplash: 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=400&h=200&fit=crop&q=80'
      }
    ]
  }

  // 그라데이션 클래스 매핑
  const getGradientClass = (tabId) => {
    const gradientMap = {
      taxi: 'bg-gradient-to-br from-yellow-100 to-orange-200',
      subway: 'bg-gradient-to-br from-blue-100 to-indigo-200', 
      bus: 'bg-gradient-to-br from-green-100 to-emerald-200',
      ktx: 'bg-gradient-to-br from-purple-100 to-violet-200',
      airport: 'bg-gradient-to-br from-sky-100 to-cyan-200',
      rental: 'bg-gradient-to-br from-orange-100 to-red-200',
      transport_card: 'bg-gradient-to-br from-teal-100 to-blue-200',
      transfer: 'bg-gradient-to-br from-indigo-100 to-purple-200',
      night: 'bg-gradient-to-br from-gray-100 to-slate-200'
    }
    return gradientMap[tabId] || 'bg-gradient-to-br from-gray-100 to-gray-200'
  }

  // 아이콘 매핑
  const getIcon = (tabId) => {
    const iconMap = {
      taxi: Car,
      subway: Train,
      bus: Bus,
      ktx: Train,
      airport: Plane,
      rental: Car,
      transport_card: Copy,
      transfer: ArrowRight,
      night: Navigation
    }
    return iconMap[tabId] || Navigation
  }

  // 플래시카드 컴포넌트
  const FlashCard = ({ card, tabId }) => {
    const [imgError, setImgError] = useState(false)
    const Icon = getIcon(tabId)
    const gradientClass = getGradientClass(tabId)
    const isBookmarked = bookmarkedCards.includes(card.id)

    return (
      <div className="bg-white rounded-lg border border-gray-100 overflow-hidden mb-4 shadow-sm">
        {/* 이미지/그라데이션 영역 */}
        <div className="relative w-full h-[200px]">
          {!imgError && card.unsplash ? (
            <img 
              src={card.unsplash} 
              onError={() => setImgError(true)} 
              className="w-full h-[200px] object-cover" 
              alt=""
            />
          ) : (
            <div className={`w-full h-[200px] ${gradientClass} flex items-center justify-center`}>
              <Icon size={48} className="text-white/60" />
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
        <div className="p-4">
          {/* 메인 문장 + 음성 버튼 */}
          <div className="flex items-start justify-between mb-2">
            <button
              onClick={() => copyToClipboard(card.ko)}
              className="flex-1 text-left"
            >
              <div className="text-2xl font-bold text-gray-900 mb-1">
                {card.ko}
              </div>
            </button>
            <button
              onClick={() => speak(card.ko)}
              className="ml-3 w-10 h-10 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center transition-colors"
            >
              <Volume2 size={16} className="text-gray-600" />
            </button>
          </div>

          {/* 발음 */}
          <div className="text-sm text-gray-500 mb-2">
            [{card.pronunciation}]
          </div>

          {/* 중국어 번역 */}
          <div className="text-lg text-gray-700 mb-4">
            {card.zh}
          </div>

          {/* 예문 */}
          <div className="space-y-2 mb-4">
            <div className="text-gray-800">
              "{card.example_ko}"
            </div>
            <div className="text-gray-600">
              "{card.example_zh}"
            </div>
            <div className="text-sm text-gray-500">
              {card.example_pronunciation}
            </div>
          </div>

          {/* 하단 액션 버튼 */}
          <div className="flex gap-2">
            <button
              onClick={() => copyToClipboard(card.ko)}
              className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              <Copy size={16} />
              <span className="text-sm font-medium">
                {L(lang, { ko: '탭하면 복사', zh: '点击复制', en: 'Tap to copy' })}
              </span>
            </button>
            <button
              onClick={() => speak(card.ko)}
              className="bg-blue-100 hover:bg-blue-200 text-blue-700 py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
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

      {/* 택시 보여주기 모드 */}
      {!showDisplayMode ? (
        <>
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
                      ? 'bg-gray-900 text-white shadow-md'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  <Icon size={16} />
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

          {/* 택시 보여주기 모드 입력 (택시 탭일 때만) */}
          {activeTab === 'taxi' && (
            <div className="bg-gray-50 p-4 rounded-lg mb-4">
              <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                <Car className="w-5 h-5" />
                {L(lang, { ko: '택시 보여주기 모드', zh: '出租车显示模式', en: 'Taxi Display Mode' })}
              </h3>
              <div className="space-y-3">
                <input
                  type="text"
                  placeholder={L(lang, { ko: '목적지 주소를 입력하세요', zh: '请输入目的地地址', en: 'Enter destination address' })}
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  onClick={() => setShowDisplayMode(true)}
                  disabled={!address.trim()}
                  className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium disabled:bg-gray-300 disabled:cursor-not-allowed hover:bg-blue-700 transition-colors"
                >
                  {L(lang, { ko: '큰 글씨로 보여주기', zh: '大字显示', en: 'Show in large text' })}
                </button>
              </div>
            </div>
          )}

          {/* 플래시카드 영역 */}
          <div className="space-y-4">
            {cardData[activeTab]?.map(card => (
              <FlashCard key={card.id} card={card} tabId={activeTab} />
            ))}
          </div>

          {/* 앱 딥링크 (택시 탭일 때만) */}
          {activeTab === 'taxi' && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold text-gray-800 mb-3">
                {L(lang, { ko: '교통 앱', zh: '交通应用', en: 'Transport Apps' })}
              </h3>
              <div className="space-y-2">
                <button
                  onClick={() => openApp('kakaoT')}
                  className="w-full p-3 bg-yellow-100 border border-yellow-300 rounded-lg text-left hover:bg-yellow-200 transition-colors flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <Car className="w-5 h-5 text-yellow-700" />
                    <div>
                      <div className="font-medium text-yellow-800">
                        {L(lang, { ko: '카카오T', zh: 'Kakao T', en: 'Kakao T' })}
                      </div>
                      <div className="text-sm text-yellow-600">
                        {L(lang, { ko: '택시 호출', zh: '叫车', en: 'Call taxi' })}
                      </div>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-yellow-600" />
                </button>

                <button
                  onClick={() => openApp('naverMap')}
                  className="w-full p-3 bg-green-100 border border-green-300 rounded-lg text-left hover:bg-green-200 transition-colors flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <MapPin className="w-5 h-5 text-green-700" />
                    <div>
                      <div className="font-medium text-green-800">
                        {L(lang, { ko: '네이버지도', zh: 'Naver地图', en: 'Naver Map' })}
                      </div>
                      <div className="text-sm text-green-600">
                        {L(lang, { ko: '길찾기', zh: '导航', en: 'Navigation' })}
                      </div>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-green-600" />
                </button>
              </div>
            </div>
          )}
        </>
      ) : (
        /* 전체화면 주소 표시 모드 */
        <div className="fixed inset-0 bg-white z-50 flex flex-col">
          <div className="p-4 border-b border-gray-200">
            <button
              onClick={() => setShowDisplayMode(false)}
              className="text-blue-600 font-medium"
            >
              ← {L(lang, { ko: '돌아가기', zh: '返回', en: 'Back' })}
            </button>
          </div>
          <div className="flex-1 flex items-center justify-center p-6">
            <div className="text-center">
              <div className="text-4xl font-bold text-gray-800 mb-4 leading-tight">
                {address}
              </div>
              <div className="text-lg text-gray-600">
                {L(lang, { 
                  ko: '기사님에게 보여주세요', 
                  zh: '给司机看', 
                  en: 'Show to driver' 
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 사용법 안내 */}
      {!showDisplayMode && (
        <div className="text-xs text-gray-500 bg-blue-50 p-3 rounded-lg mt-6">
          💡 {L(lang, { 
            ko: '플래시카드를 탭하면 한국어가 복사됩니다. 🔊 버튼으로 음성을 들어보세요. 🔖 버튼으로 자주 쓰는 표현을 북마크하세요. 택시 모드에서는 큰 글씨로 기사님에게 보여주세요.', 
            zh: '点击卡片复制韩语。🔊按钮播放语音。🔖按钮收藏常用表达。出租车模式可大字显示给司机。', 
            en: 'Tap cards to copy Korean text. Use 🔊 for voice playback. Use 🔖 to bookmark frequently used expressions. Use taxi mode to show address to driver in large text.' 
          })}
        </div>
      )}
    </div>
  )
}