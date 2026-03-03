import { useState } from 'react'
import { Train, Bus, Car, Plane, CreditCard, ArrowRight, Navigation, Bookmark } from 'lucide-react'
import KoreanPhraseCard, { useKoreanPocket } from './KoreanPhraseCard'

const L = (lang, text) => text[lang] || text['ko']

export default function TransportPocket({ lang }) {
  const [activeTab, setActiveTab] = useState('subway')
  const { bookmarkedCards, toastMessage, copyToClipboard, speak, toggleBookmark } = useKoreanPocket('transport_bookmarks')

  const tabs = [
    { id: 'subway', name: { ko: '지하철', zh: '地铁', en: 'Subway' }, icon: Train },
    { id: 'bus', name: { ko: '버스', zh: '公交车', en: 'Bus' }, icon: Bus },
    { id: 'taxi', name: { ko: '택시', zh: '出租车', en: 'Taxi' }, icon: Car },
    { id: 'ktx', name: { ko: 'KTX', zh: '高铁', en: 'KTX' }, icon: Train },
    { id: 'airport', name: { ko: '공항리무진', zh: '机场巴士', en: 'Airport Bus' }, icon: Plane },
    { id: 'rental', name: { ko: '렌터카', zh: '租车', en: 'Rental Car' }, icon: Car },
    { id: 'transport_card', name: { ko: '교통카드충전', zh: '交通卡充值', en: 'Card Top-up' }, icon: CreditCard },
    { id: 'transfer', name: { ko: '환승', zh: '换乘', en: 'Transfer' }, icon: ArrowRight },
    { id: 'night', name: { ko: '심야교통', zh: '深夜交通', en: 'Night Transport' }, icon: Navigation },
    { id: 'saved', name: { ko: '저장한 표현', zh: '收藏表达', en: 'Saved' }, icon: Bookmark }
  ]

  const cardData = {
    subway: [
      {
        id: 'subway_entrance',
        ko: '지하철 입구가 어디예요?',
        pronunciation: 'ji-ha-cheol ip-gu-ga eo-di-ye-yo',
        zh: '地铁入口在哪里？',
        example_ko: '가장 가까운 지하철 입구가 어디예요?',
        example_zh: '最近的地铁入口在哪里？',
        example_pronunciation: 'gajang gakkaun jihacheol ipguga eodiyeyo?'
      },
      {
        id: 'which_line',
        ko: '몇 호선이에요?',
        pronunciation: 'myeot ho-seon-i-e-yo',
        zh: '是几号线？',
        example_ko: '강남역은 몇 호선이에요?',
        example_zh: '江南站是几号线？',
        example_pronunciation: 'gangnamyeogeun myeot hoseonieyeo?'
      },
      {
        id: 'transfer_station',
        ko: '환승역이 어디예요?',
        pronunciation: 'hwan-seung-yeok-i eo-di-ye-yo',
        zh: '换乘站在哪里？',
        example_ko: '2호선으로 갈아타는 환승역이 어디예요?',
        example_zh: '换乘2号线的站在哪里？',
        example_pronunciation: 'i-hoseoneu-ro garataneun hwanseung-yeogi eodiyeyo?'
      },
      {
        id: 'last_train',
        ko: '막차가 몇 시예요?',
        pronunciation: 'mak-cha-ga myeot si-ye-yo',
        zh: '末班车是几点？',
        example_ko: '이 노선 막차가 몇 시예요?',
        example_zh: '这条线的末班车是几点？',
        example_pronunciation: 'i noseon makchaga myeot siyeyo?'
      },
      {
        id: 'exit_number',
        ko: '몇 번 출구로 나가요?',
        pronunciation: 'myeot beon chul-gu-ro na-ga-yo',
        zh: '从几号出口出去？',
        example_ko: '명동역 3번 출구로 나가요',
        example_zh: '从明洞站3号出口出去',
        example_pronunciation: 'myeongdong-yeok sampeon chulguro nagayo'
      },
      {
        id: 'direction',
        ko: '어느 방향으로 가야 해요?',
        pronunciation: 'eo-neu bang-hyang-eu-ro ga-ya hae-yo',
        zh: '应该往哪个方向走？',
        example_ko: '신촌 방향으로 가야 해요',
        example_zh: '要往新村方向走',
        example_pronunciation: 'sinchon banghyang-eulo gaya haeyo'
      },
      {
        id: 'travel_time',
        ko: '얼마나 걸려요?',
        pronunciation: 'eol-ma-na geol-lyeo-yo',
        zh: '要多长时间？',
        example_ko: '홍대까지 얼마나 걸려요?',
        example_zh: '到弘大要多长时间？',
        example_pronunciation: 'hongdaekkaji eolmana geollyeoyo?'
      },
      {
        id: 'platform_side',
        ko: '어느 쪽 승강장이에요?',
        pronunciation: 'eo-neu jjok seung-gang-jang-i-e-yo',
        zh: '是哪边的站台？',
        example_ko: '2번 승강장에서 타세요',
        example_zh: '在2号站台上车',
        example_pronunciation: 'i-beon seung-gang-jang-eseo taseyo'
      },
      {
        id: 'express_train',
        ko: '급행 지하철 있어요?',
        pronunciation: 'geu-paeng ji-ha-cheol iss-eo-yo',
        zh: '有快速地铁吗？',
        example_ko: '공항철도 급행 지하철 있어요?',
        example_zh: '有机场铁路快车吗？',
        example_pronunciation: 'gonghang-cheoldo geup-haeng jihacheol isseoyo?'
      },
      {
        id: 'crowded_time',
        ko: '러시아워가 언제예요?',
        pronunciation: 'reo-si-a-wo-ga eon-je-ye-yo',
        zh: '高峰期是什么时候？',
        example_ko: '아침 러시아워가 언제예요?',
        example_zh: '早高峰是什么时候？',
        example_pronunciation: 'achim reosiawoga eonjeyeyo?'
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
        example_pronunciation: 'gajang gakkaun beoseu jeongyujangi eodiyeyo?'
      },
      {
        id: 'bus_number',
        ko: '몇 번 버스 타야 해요?',
        pronunciation: 'myeot beon beo-seu ta-ya hae-yo',
        zh: '要坐几路公交？',
        example_ko: '명동까지 몇 번 버스 타야 해요?',
        example_zh: '到明洞要坐几路公交？',
        example_pronunciation: 'myeongdong-kkaji myeot beon beoseu taya haeyo?'
      },
      {
        id: 'bus_fare',
        ko: '버스 요금이 얼마예요?',
        pronunciation: 'beo-seu yo-geum-i eol-ma-ye-yo',
        zh: '公交车票多少钱？',
        example_ko: '시내버스 요금이 얼마예요?',
        example_zh: '市内公交票价是多少？',
        example_pronunciation: 'sinaebeoseu yogeumi eolmayeyo?'
      },
      {
        id: 'get_off',
        ko: '내려 주세요',
        pronunciation: 'nae-ryeo ju-se-yo',
        zh: '请让我下车',
        example_ko: '다음 정류장에서 내려 주세요',
        example_zh: '请在下一站让我下车',
        example_pronunciation: 'da-eum jeongyujangeseo naeryeo juseyo'
      },
      {
        id: 'night_bus',
        ko: '심야버스 있어요?',
        pronunciation: 'sim-ya-beo-seu iss-eo-yo',
        zh: '有夜班公交吗？',
        example_ko: '12시 이후에 심야버스 있어요?',
        example_zh: '12点以后有夜班公交吗？',
        example_pronunciation: 'yeoldu-si ihu-e simyabeoseu isseoyo?'
      },
      {
        id: 'bus_app',
        ko: '버스 앱 추천해 주세요',
        pronunciation: 'beo-seu aep chu-cheon-hae ju-se-yo',
        zh: '请推荐公交App',
        example_ko: '실시간 버스 정보 앱 추천해 주세요',
        example_zh: '请推荐实时公交信息App',
        example_pronunciation: 'silsigan beoseu jeongbo aep chucheonhae juseyo'
      },
      {
        id: 'express_bus',
        ko: '고속버스 터미널',
        pronunciation: 'go-sok-beo-seu teo-mi-neol',
        zh: '高速巴士终点站',
        example_ko: '고속버스 터미널이 어디예요?',
        example_zh: '高速巴士终点站在哪里？',
        example_pronunciation: 'gosok-beoseu teomineori eodiyeyo?'
      },
      {
        id: 'intercity_bus',
        ko: '시외버스 예매',
        pronunciation: 'si-oe-beo-seu ye-mae',
        zh: '市际巴士预订',
        example_ko: '부산행 시외버스 예매하고 싶어요',
        example_zh: '我想预订去釜山的市际巴士',
        example_pronunciation: 'busanhaeng sige-beoseu yemaehago sipeoyo'
      },
      {
        id: 'bus_route',
        ko: '이 버스 어디까지 가요?',
        pronunciation: 'i beo-seu eo-di-kka-ji ga-yo',
        zh: '这路公交到哪里？',
        example_ko: '마지막 정류장이 어디예요?',
        example_zh: '终点站是哪里？',
        example_pronunciation: 'majimak jeongyujangi eodiyeyo?'
      },
      {
        id: 'bus_schedule',
        ko: '버스 시간표 있어요?',
        pronunciation: 'beo-seu si-gan-pyo iss-eo-yo',
        zh: '有公交时刻表吗？',
        example_ko: '첫차 막차 시간을 알고 싶어요',
        example_zh: '想知道首班车末班车时间',
        example_pronunciation: 'cheot-cha mak-cha siganeul algo sipeoyo'
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
        example_pronunciation: 'i jusoro ga juseyo'
      },
      {
        id: 'stop_here',
        ko: '여기서 세워 주세요',
        pronunciation: 'yeo-gi-seo se-wo ju-se-yo',
        zh: '请在这里停车',
        example_ko: '길 건너편에서 세워 주세요',
        example_zh: '请在马路对面停车',
        example_pronunciation: 'gil geonneopyeonneseo sewo juseyo'
      },
      {
        id: 'how_much',
        ko: '요금이 얼마예요?',
        pronunciation: 'yo-geum-i eol-ma-ye-yo',
        zh: '车费多少钱？',
        example_ko: '미터기 요금이 얼마예요?',
        example_zh: '计价器显示多少钱？',
        example_pronunciation: 'miteogi yogeumi eolmayeyo?'
      },
      {
        id: 'receipt',
        ko: '영수증 주세요',
        pronunciation: 'yeong-su-jeung ju-se-yo',
        zh: '请给我收据',
        example_ko: '카드 결제 영수증 주세요',
        example_zh: '请给我刷卡收据',
        example_pronunciation: 'kadeu gyeolje yeongsujeung juseyo'
      },
      {
        id: 'trunk',
        ko: '트렁크 열어 주세요',
        pronunciation: 'teu-rung-keu yeo-reo ju-se-yo',
        zh: '请打开后备箱',
        example_ko: '짐이 많아서 트렁크 열어 주세요',
        example_zh: '行李很多，请打开后备箱',
        example_pronunciation: 'jimi manaseo teurungkeu yeoleo juseyo'
      },
      {
        id: 'air_condition',
        ko: '에어컨 켜 주세요',
        pronunciation: 'e-eo-keon kyeo ju-se-yo',
        zh: '请开空调',
        example_ko: '더우니까 에어컨 켜 주세요',
        example_zh: '很热，请开空调',
        example_pronunciation: 'deo-unikka eeokeon kyeo juseyo'
      },
      {
        id: 'call_taxi',
        ko: '택시 좀 불러 주세요',
        pronunciation: 'taek-si jom bul-leo ju-se-yo',
        zh: '请帮我叫辆出租车',
        example_ko: '카카오택시 앱으로 불러 주세요',
        example_zh: '请用KakaoTaxi App叫车',
        example_pronunciation: 'kakao-taeksi aepeuro bulleo juseyo'
      },
      {
        id: 'payment_method',
        ko: '카드로 계산할게요',
        pronunciation: 'ka-deu-ro gye-san-hal-ge-yo',
        zh: '我用卡付款',
        example_ko: '현금 말고 카드로 계산할게요',
        example_zh: '不用现金，用卡付款',
        example_pronunciation: 'hyeongeum malgo kadeu-ro gyesan-halgeyo'
      },
      {
        id: 'wait_here',
        ko: '여기서 잠시만 기다려 주세요',
        pronunciation: 'yeo-gi-seo jam-si-man gi-da-ryeo ju-se-yo',
        zh: '请在这里等一会儿',
        example_ko: '5분만 여기서 기다려 주세요',
        example_zh: '请在这里等5分钟',
        example_pronunciation: 'o-bunman yeogiseo gidaryeo juseyo'
      },
      {
        id: 'faster_route',
        ko: '빠른 길로 가 주세요',
        pronunciation: 'ppa-reun gil-lo ga ju-se-yo',
        zh: '请走快捷路线',
        example_ko: '교통체증 피해서 빠른 길로 가 주세요',
        example_zh: '请避开拥堵走快捷路线',
        example_pronunciation: 'gyotong-che-jeung pihaeseo ppareun gillo ga juseyo'
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
        example_pronunciation: 'seoul-yeok KTX seunggangjang-i eodiyeyo?'
      },
      {
        id: 'book_ticket',
        ko: '표 예매하고 싶어요',
        pronunciation: 'pyo ye-mae-ha-go si-peo-yo',
        zh: '我想订票',
        example_ko: '부산행 KTX 표 예매하고 싶어요',
        example_zh: '我想订去釜山的KTX票',
        example_pronunciation: 'busan-haeng KTX pyo yemae-hago sipeoyo'
      },
      {
        id: 'departure_time',
        ko: '출발 시간이 언제예요?',
        pronunciation: 'chul-bal si-gan-i eon-je-ye-yo',
        zh: '出发时间是什么时候？',
        example_ko: '다음 KTX 출발 시간이 언제예요?',
        example_zh: '下一班KTX的出发时间是什么时候？',
        example_pronunciation: 'da-eum KTX chulbal sigani eonjeyeyo?'
      },
      {
        id: 'seat_number',
        ko: '좌석 번호가 뭐예요?',
        pronunciation: 'jwa-seok beon-ho-ga mwo-ye-yo',
        zh: '座位号是什么？',
        example_ko: '제 좌석이 몇 호차 몇 번이에요?',
        example_zh: '我的座位是几号车厢几号？',
        example_pronunciation: 'je jwaiseogi myeot hocha myeot beonieyo?'
      },
      {
        id: 'travel_duration',
        ko: '몇 시간 걸려요?',
        pronunciation: 'myeot si-gan geol-lyeo-yo',
        zh: '要几个小时？',
        example_ko: '서울에서 부산까지 몇 시간 걸려요?',
        example_zh: '从首尔到釜山要几个小时？',
        example_pronunciation: 'seoul-eseo busan-kkaji myeot sigan geollyeoyo?'
      },
      {
        id: 'refund_ticket',
        ko: '표 환불하고 싶어요',
        pronunciation: 'pyo hwan-bul-ha-go si-peo-yo',
        zh: '我想退票',
        example_ko: '예약한 KTX표 환불하고 싶어요',
        example_zh: '我想退掉预订的KTX票',
        example_pronunciation: 'yeyakhan KTX-pyo hwanbul-hago sipeoyo'
      },
      {
        id: 'change_seat',
        ko: '좌석 변경할 수 있어요?',
        pronunciation: 'jwa-seok byeon-gyeong-hal su iss-eo-yo',
        zh: '可以换座位吗？',
        example_ko: '창가 좌석으로 변경할 수 있어요?',
        example_zh: '可以换成靠窗的座位吗？',
        example_pronunciation: 'chang-ga jwaiseog-euro byeon-gyeong-hal su isseoyo?'
      },
      {
        id: 'dining_car',
        ko: '식당차 있어요?',
        pronunciation: 'sik-dang-cha iss-eo-yo',
        zh: '有餐车吗？',
        example_ko: 'KTX에서 음식 살 수 있는 식당차 있어요?',
        example_zh: 'KTX里有可以买食物的餐车吗？',
        example_pronunciation: 'KTX-eseo eumsik sal su inneun sikdangcha isseoyo?'
      },
      {
        id: 'wifi_service',
        ko: '와이파이 돼요?',
        pronunciation: 'wa-i-pa-i dwae-yo',
        zh: '有WiFi吗？',
        example_ko: 'KTX에서 무료 와이파이 사용할 수 있어요?',
        example_zh: '在KTX上可以用免费WiFi吗？',
        example_pronunciation: 'KTX-eseo muryo waipai sayong-hal su isseoyo?'
      },
      {
        id: 'next_station',
        ko: '다음 역이 어디예요?',
        pronunciation: 'da-eum yeok-i eo-di-ye-yo',
        zh: '下一站是哪里？',
        example_ko: '잠시 후 정차하는 역이 어디예요?',
        example_zh: '稍后停车的站是哪里？',
        example_pronunciation: 'jamsi hu jeong-cha-haneun yeogi eodiyeyo?'
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
        example_pronunciation: 'incheon-gonghang ganeun rimujin eodiseo tayo?'
      },
      {
        id: 'bus_schedule',
        ko: '공항버스 시간표 있어요?',
        pronunciation: 'gong-hang-beo-seu si-gan-pyo iss-eo-yo',
        zh: '有机场巴士时刻表吗？',
        example_ko: '새벽 시간 공항버스 시간표 있어요?',
        example_zh: '有凌晨时间的机场巴士时刻表吗？',
        example_pronunciation: 'saebyeok sigan gonghang-beoseu sigam-pyo isseoyo?'
      },
      {
        id: 'airport_express',
        ko: '공항철도 역이 어디예요?',
        pronunciation: 'gong-hang-cheol-do yeok-i eo-di-ye-yo',
        zh: '机场铁路站在哪里？',
        example_ko: 'AREX 공항철도 역이 어디예요?',
        example_zh: 'AREX机场铁路站在哪里？',
        example_pronunciation: 'AREX gonghang-cheoldo yeogi eodiyeyo?'
      },
      {
        id: 'luggage_service',
        ko: '짐 배송 서비스 있어요?',
        pronunciation: 'jim bae-song seo-bi-seu iss-eo-yo',
        zh: '有行李配送服务吗？',
        example_ko: '공항에서 호텔로 짐 배송 서비스 있어요?',
        example_zh: '有从机场到酒店的行李配送服务吗？',
        example_pronunciation: 'gonghang-eseo hoteulo jim baesong seobiseu isseoyo?'
      },
      {
        id: 'checkin_time',
        ko: '체크인 몇 시간 전에 와야 해요?',
        pronunciation: 'che-keu-in myeot si-gan jeon-e wa-ya hae-yo',
        zh: '要提前几小时到机场？',
        example_ko: '국제선 체크인 몇 시간 전에 와야 해요?',
        example_zh: '国际航班要提前几小时办理值机？',
        example_pronunciation: 'gukjeseon che-keu-in myeot sigan jeone waya haeyo?'
      },
      {
        id: 'terminal_shuttle',
        ko: '터미널 셔틀 있어요?',
        pronunciation: 'teo-mi-neol syeo-teul iss-eo-yo',
        zh: '有航站楼摆渡车吗？',
        example_ko: '제1터미널과 제2터미널 셔틀 있어요?',
        example_zh: '有第1航站楼和第2航站楼的摆渡车吗？',
        example_pronunciation: 'jeil-teomineol-gwa jeii-teomineol syeoteul isseoyo?'
      },
      {
        id: 'bus_fare_airport',
        ko: '공항버스 요금이 얼마예요?',
        pronunciation: 'gong-hang-beo-seu yo-geum-i eol-ma-ye-yo',
        zh: '机场巴士票价是多少？',
        example_ko: '강남까지 공항버스 요금이 얼마예요?',
        example_zh: '到江南的机场巴士票价是多少？',
        example_pronunciation: 'gangnam-kkaji gonghang-beoseu yogeumi eolmayeyo?'
      },
      {
        id: 'direct_bus',
        ko: '직행버스 있어요?',
        pronunciation: 'jik-haeng-beo-seu iss-eo-yo',
        zh: '有直达巴士吗？',
        example_ko: '명동 직행버스 있어요?',
        example_zh: '有到明洞的直达巴士吗？',
        example_pronunciation: 'myeongdong jikhaeng-beoseu isseoyo?'
      },
      {
        id: 'night_transport',
        ko: '밤에도 공항버스 있어요?',
        pronunciation: 'bam-e-do gong-hang-beo-seu iss-eo-yo',
        zh: '晚上也有机场巴士吗？',
        example_ko: '새벽 2시에도 공항버스 운행해요?',
        example_zh: '凌晨2点也有机场巴士运行吗？',
        example_pronunciation: 'saebyeok du-si-edo gonghang-beoseu unhaeng-haeyo?'
      },
      {
        id: 'lost_luggage',
        ko: '짐을 잃어버렸어요',
        pronunciation: 'jim-eul il-eo-beo-ryeoss-eo-yo',
        zh: '我的行李丢了',
        example_ko: '공항에서 가방을 잃어버렸어요',
        example_zh: '我在机场丢了包',
        example_pronunciation: 'gonghang-eseo gabangeul ileobeolyeosseoyo'
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
        example_pronunciation: 'sohyeong-cha haru renteuhago sipeoyo'
      },
      {
        id: 'international_license',
        ko: '국제면허증 있어요',
        pronunciation: 'guk-je-myeon-heo-jeung iss-eo-yo',
        zh: '我有国际驾照',
        example_ko: '국제면허증으로 렌트카 빌릴 수 있어요?',
        example_zh: '用国际驾照可以租车吗？',
        example_pronunciation: 'gukje-myeonheo-jeung-euro rentka billil su isseoyo?'
      },
      {
        id: 'rental_price',
        ko: '렌트 비용이 얼마예요?',
        pronunciation: 'ren-teu bi-yong-i eol-ma-ye-yo',
        zh: '租车费用是多少？',
        example_ko: '하루 렌트 비용이 얼마예요?',
        example_zh: '租一天的费用是多少？',
        example_pronunciation: 'haru renteu biyongi eolmayeyo?'
      },
      {
        id: 'insurance',
        ko: '보험 포함이에요?',
        pronunciation: 'bo-heom po-ham-i-e-yo',
        zh: '包括保险吗？',
        example_ko: '렌트카 보험이 포함되어 있어요?',
        example_zh: '租车费用包括保险吗？',
        example_pronunciation: 'rentka boheomi pohamdoeeo isseoyo?'
      },
      {
        id: 'fuel_policy',
        ko: '기름은 어떻게 해요?',
        pronunciation: 'gi-reum-eun eo-tteo-ke hae-yo',
        zh: '油费怎么算？',
        example_ko: '기름 가득 채워서 반납해야 해요?',
        example_zh: '需要加满油后归还吗？',
        example_pronunciation: 'gireum gadeuk chae-weoseo bannap-haeya haeyo?'
      },
      {
        id: 'return_location',
        ko: '다른 곳에서 반납할 수 있어요?',
        pronunciation: 'da-reun got-e-seo ban-nap-hal su iss-eo-yo',
        zh: '可以在其他地方还车吗？',
        example_ko: '공항에서 빌리고 시내에서 반납할 수 있어요?',
        example_zh: '可以在机场租车，在市内还车吗？',
        example_pronunciation: 'gonghang-eseo billigo sinae-eseo bannap-hal su isseoyo?'
      },
      {
        id: 'navigation',
        ko: '네비게이션 있어요?',
        pronunciation: 'ne-bi-ge-i-syeon iss-eo-yo',
        zh: '有导航吗？',
        example_ko: '한국어 네비게이션 설치되어 있어요?',
        example_zh: '安装了韩语导航吗？',
        example_pronunciation: 'hangugeo nebigeis-yeon seolchidoeeo isseoyo?'
      },
      {
        id: 'car_size',
        ko: '더 큰 차 있어요?',
        pronunciation: 'deo keun cha iss-eo-yo',
        zh: '有更大的车吗？',
        example_ko: 'SUV나 승합차 같은 큰 차 있어요?',
        example_zh: '有SUV或面包车这样的大车吗？',
        example_pronunciation: 'SUV-na seunghap-cha gateun keun cha isseoyo?'
      },
      {
        id: 'age_limit',
        ko: '나이 제한 있어요?',
        pronunciation: 'na-i je-han iss-eo-yo',
        zh: '有年龄限制吗？',
        example_ko: '렌트카 빌리는데 나이 제한 있어요?',
        example_zh: '租车有年龄限制吗？',
        example_pronunciation: 'rentka billiseunde nai jehan isseoyo?'
      },
      {
        id: 'deposit',
        ko: '보증금이 얼마예요?',
        pronunciation: 'bo-jeung-geum-i eol-ma-ye-yo',
        zh: '押金是多少？',
        example_ko: '렌트할 때 보증금이 얼마예요?',
        example_zh: '租车时押金是多少？',
        example_pronunciation: 'renteul ttae bojeunggeumi eolmayeyo?'
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
        example_pronunciation: 'T-meoni-kadeu eodiseo sal su isseoyo?'
      },
      {
        id: 'charge_card',
        ko: '카드 충전하고 싶어요',
        pronunciation: 'ka-deu chung-jeon-ha-go si-peo-yo',
        zh: '我想给卡充值',
        example_ko: '1만 원 충전하고 싶어요',
        example_zh: '我想充值1万韩元',
        example_pronunciation: 'ilman-won chungjeon-hago sipeoyo'
      },
      {
        id: 'card_balance',
        ko: '잔액이 얼마 남았어요?',
        pronunciation: 'jan-aek-i eol-ma na-mass-eo-yo',
        zh: '余额还剩多少？',
        example_ko: '교통카드 잔액 확인하고 싶어요',
        example_zh: '我想查看交通卡余额',
        example_pronunciation: 'gyotong-kadeu janaek hwaginhago sipeoyo'
      },
      {
        id: 'card_machine',
        ko: '충전기가 어디 있어요?',
        pronunciation: 'chung-jeon-gi-ga eo-di iss-eo-yo',
        zh: '充值机在哪里？',
        example_ko: '교통카드 충전기가 어디 있어요?',
        example_zh: '交通卡充值机在哪里？',
        example_pronunciation: 'gyotong-kadeu chungjeongi-ga eodi isseoyo?'
      },
      {
        id: 'card_types',
        ko: '어떤 교통카드가 좋아요?',
        pronunciation: 'eo-tteon gyo-tong-ka-deu-ga jo-a-yo',
        zh: '什么交通卡比较好？',
        example_ko: 'T머니와 한페이 중에 어떤 게 좋아요?',
        example_zh: 'T-money和Hanpay中哪个比较好？',
        example_pronunciation: 'T-meoni-wa hanpei junge eotteon ge joayo?'
      },
      {
        id: 'refund_card',
        ko: '카드 환불하고 싶어요',
        pronunciation: 'ka-deu hwan-bul-ha-go si-peo-yo',
        zh: '我想退卡',
        example_ko: '안 쓰는 교통카드 환불하고 싶어요',
        example_zh: '我想退掉不用的交通卡',
        example_pronunciation: 'an sseuneun gyotong-kadeu hwanbul-hago sipeoyo'
      },
      {
        id: 'mobile_payment',
        ko: '휴대폰으로 결제할 수 있어요?',
        pronunciation: 'hyu-dae-pon-eu-ro gyeol-je-hal su iss-eo-yo',
        zh: '可以用手机支付吗？',
        example_ko: '삼성페이로 교통비 결제할 수 있어요?',
        example_zh: '可以用Samsung Pay支付交通费吗？',
        example_pronunciation: 'samseong-peilo gyotongbi gyeolje-hal su isseoyo?'
      },
      {
        id: 'discount_card',
        ko: '학생 할인 카드 있어요?',
        pronunciation: 'hak-saeng hal-in ka-deu iss-eo-yo',
        zh: '有学生折扣卡吗？',
        example_ko: '청소년이나 학생 교통카드 할인 있어요?',
        example_zh: '青少年或学生交通卡有折扣吗？',
        example_pronunciation: 'cheongsoneon-ina haksaeng gyotong-kadeu harin isseoyo?'
      },
      {
        id: 'card_not_working',
        ko: '카드가 안 돼요',
        pronunciation: 'ka-deu-ga an dwae-yo',
        zh: '卡不能用',
        example_ko: '교통카드가 인식이 안 돼요',
        example_zh: '交通卡读不出来',
        example_pronunciation: 'gyotong-kadeuga insigi an dwaeyo'
      },
      {
        id: 'lost_card',
        ko: '카드를 잃어버렸어요',
        pronunciation: 'ka-deu-reul il-eo-beo-ryeoss-eo-yo',
        zh: '我丢了卡',
        example_ko: '교통카드를 잃어버렸는데 어떻게 해야 해요?',
        example_zh: '交通卡丢了怎么办？',
        example_pronunciation: 'gyotong-kadeureul ileobeolyeossneunde eotteoke haeya haeyo?'
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
        example_pronunciation: 'i-hoseon-euro galata-ryeomyeon yeogiseo galatayo?'
      },
      {
        id: 'transfer_station',
        ko: '환승역이 어디예요?',
        pronunciation: 'hwan-seung-yeok-i eo-di-ye-yo',
        zh: '换乘站在哪里？',
        example_ko: '가장 가까운 환승역이 어디예요?',
        example_zh: '最近的换乘站在哪里？',
        example_pronunciation: 'gajang gakkaun hwanseung-yeogi eodiyeyo?'
      },
      {
        id: 'transfer_time',
        ko: '환승 시간이 얼마나 걸려요?',
        pronunciation: 'hwan-seung si-gan-i eol-ma-na geol-lyeo-yo',
        zh: '换乘需要多长时间？',
        example_ko: '이 역에서 환승하는데 시간이 얼마나 걸려요?',
        example_zh: '在这站换乘需要多长时间？',
        example_pronunciation: 'i yeogeseo hwanseung-haneunde sigani eolmana geollyeoyo?'
      },
      {
        id: 'direct_line',
        ko: '직통으로 갈 수 있어요?',
        pronunciation: 'jik-tong-eu-ro gal su iss-eo-yo',
        zh: '可以直达吗？',
        example_ko: '환승 없이 직통으로 갈 수 있어요?',
        example_zh: '不换乘可以直达吗？',
        example_pronunciation: 'hwanseung eopsi jiktong-euro gal su isseoyo?'
      },
      {
        id: 'same_ticket',
        ko: '같은 표로 갈아탈 수 있어요?',
        pronunciation: 'ga-teun pyo-ro ga-ra-tal su iss-eo-yo',
        zh: '可以用同一张票换乘吗？',
        example_ko: '교통카드 하나로 환승할 수 있어요?',
        example_zh: '用一张交通卡可以换乘吗？',
        example_pronunciation: 'gyotong-kadeu hanaro hwanseung-hal su isseoyo?'
      },
      {
        id: 'free_transfer',
        ko: '무료 환승이에요?',
        pronunciation: 'mu-ryo hwan-seung-i-e-yo',
        zh: '是免费换乘吗？',
        example_ko: '지하철에서 버스로 환승이 무료예요?',
        example_zh: '地铁换公交是免费的吗？',
        example_pronunciation: 'jihacheol-eseo beoseu-ro hwanseungi muryoyeyo?'
      },
      {
        id: 'transfer_discount',
        ko: '환승 할인 돼요?',
        pronunciation: 'hwan-seung hal-in dwae-yo',
        zh: '换乘有折扣吗？',
        example_ko: '30분 안에 환승하면 할인 돼요?',
        example_zh: '30分钟内换乘有折扣吗？',
        example_pronunciation: 'samsip-bun ane hwanseung-hamyeon harin dwaeyo?'
      },
      {
        id: 'transfer_direction',
        ko: '환승하려면 어느 쪽으로 가야 해요?',
        pronunciation: 'hwan-seung-ha-ryeo-myeon eo-neu jjok-eu-ro ga-ya hae-yo',
        zh: '换乘要往哪边走？',
        example_ko: '4호선으로 환승하려면 어느 쪽으로 가야 해요?',
        example_zh: '换4号线要往哪边走？',
        example_pronunciation: 'sa-hoseon-euro hwanseung-haryeomyeon eoneu jjog-euro gaya haeyo?'
      },
      {
        id: 'missed_transfer',
        ko: '환승을 놓쳤어요',
        pronunciation: 'hwan-seung-eul not-chyeoss-eo-yo',
        zh: '错过了换乘',
        example_ko: '지하철 환승을 놓쳤는데 어떻게 해야 해요?',
        example_zh: '错过了地铁换乘怎么办？',
        example_pronunciation: 'jihacheol hwanseu-ngeul nochyeossneunde eotteoke haeya haeyo?'
      },
      {
        id: 'complex_transfer',
        ko: '환승이 복잡해요',
        pronunciation: 'hwan-seung-i bok-jap-hae-yo',
        zh: '换乘很复杂',
        example_ko: '이 역 환승이 너무 복잡해요',
        example_zh: '这站的换乘太复杂了',
        example_pronunciation: 'i yeok hwanseungi neomu bokjaphaeyo'
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
        example_pronunciation: 'yeoldu-si ihu simya-beoseu unhaeng-haeyo?'
      },
      {
        id: 'last_train',
        ko: '막차가 몇 시예요?',
        pronunciation: 'mak-cha-ga myeot si-ye-yo',
        zh: '末班车是几点？',
        example_ko: '지하철 막차가 몇 시에 끝나요?',
        example_zh: '地铁末班车几点结束？',
        example_pronunciation: 'jihacheol makchaga myeot si-e kkeutnayo?'
      },
      {
        id: 'night_taxi',
        ko: '밤늦게 택시 잡을 수 있어요?',
        pronunciation: 'bam-neut-ge taek-si jab-eul su iss-eo-yo',
        zh: '深夜可以打到出租车吗？',
        example_ko: '새벽 2시에도 택시 잡을 수 있어요?',
        example_zh: '凌晨2点也能打到出租车吗？',
        example_pronunciation: 'saebyeok du-si-edo taeksi jabeul su isseoyo?'
      },
      {
        id: 'night_fare',
        ko: '심야 요금이 더 비싸요?',
        pronunciation: 'sim-ya yo-geum-i deo bi-ssa-yo',
        zh: '深夜票价更贵吗？',
        example_ko: '밤 12시 이후에 택시 요금이 더 비싸요?',
        example_zh: '晚上12点以后出租车费更贵吗？',
        example_pronunciation: 'bam yeoldu-si ihu-e taeksi yogeumi deo bissayo?'
      },
      {
        id: 'overnight_subway',
        ko: '지하철 심야 운행해요?',
        pronunciation: 'ji-ha-cheol sim-ya un-haeng-hae-yo',
        zh: '地铁有深夜运行吗？',
        example_ko: '주말에 지하철 심야 연장 운행해요?',
        example_zh: '周末地铁有深夜延长运行吗？',
        example_pronunciation: 'jumare jihacheol simya yeomjang unhaeng-haeyo?'
      },
      {
        id: 'safe_transport',
        ko: '밤에 안전한 교통수단이 뭐예요?',
        pronunciation: 'bam-e an-jeon-han gyo-tong-su-dan-i mwo-ye-yo',
        zh: '晚上什么交通工具比较安全？',
        example_ko: '여자 혼자 밤늦게 이동할 때 뭐가 안전해요?',
        example_zh: '女性一个人深夜出行什么比较安全？',
        example_pronunciation: 'yeoja honja bamneul-ge idong-hal ttae mwoga anjeonhaeyo?'
      },
      {
        id: 'night_bus_stop',
        ko: '심야버스 정류장이 어디예요?',
        pronunciation: 'sim-ya-beo-seu jeong-ryu-jang-i eo-di-ye-yo',
        zh: '夜班公交站在哪里？',
        example_ko: '명동 심야버스 정류장이 어디예요?',
        example_zh: '明洞夜班公交站在哪里？',
        example_pronunciation: 'myeongdong simya-beoseu jeongyujangi eodiyeyo?'
      },
      {
        id: 'call_taxi_app',
        ko: '택시 앱으로 부를 수 있어요?',
        pronunciation: 'taek-si aep-eu-ro bu-reul su iss-eo-yo',
        zh: '可以用打车App叫车吗？',
        example_ko: '카카오택시로 밤늦게도 부를 수 있어요?',
        example_zh: '用KakaoTaxi深夜也能叫车吗？',
        example_pronunciation: 'kakao-taeksiro bamneul-gedo bureul su isseoyo?'
      },
      {
        id: 'night_schedule',
        ko: '심야 시간표 있어요?',
        pronunciation: 'sim-ya si-gan-pyo iss-eo-yo',
        zh: '有深夜时刻表吗？',
        example_ko: '심야버스 운행 시간표 어디서 볼 수 있어요?',
        example_zh: '深夜公交运行时刻表哪里可以看？',
        example_pronunciation: 'simya-beoseu unhaeng sigam-pyo eodiseo bol su isseoyo?'
      },
      {
        id: 'walking_safe',
        ko: '밤에 걸어가도 안전해요?',
        pronunciation: 'bam-e geol-eo-ga-do an-jeon-hae-yo',
        zh: '晚上走路安全吗？',
        example_ko: '이 동네 밤에 걸어가도 안전해요?',
        example_zh: '这个社区晚上走路安全吗？',
        example_pronunciation: 'i dongne bame geoleogado anjeonhaeyo?'
      }
    ]
  }

  const currentCards = activeTab === 'saved'
    ? Object.values(cardData).flat().filter(c => bookmarkedCards.includes(c.id))
    : cardData[activeTab] || []

  return (
    <div className="space-y-4">
      {toastMessage && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-black text-white px-4 py-2 rounded-full text-sm">
          {toastMessage}
        </div>
      )}

      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-full text-xs font-medium shrink-0 transition ${
              activeTab === tab.id ? 'bg-[#111827] text-white' : 'bg-gray-100 text-gray-600'
            }`}
          >
            <tab.icon size={14} />
            {L(lang, tab.name)}
            {tab.id === 'saved' && bookmarkedCards.length > 0 && (
              <span className="ml-0.5 text-[10px]">({bookmarkedCards.length})</span>
            )}
          </button>
        ))}
      </div>

      {currentCards.length === 0 && activeTab === 'saved' && (
        <div className="text-center py-12 text-sm text-gray-400">
          {L(lang, { ko: '저장한 표현이 없습니다', zh: '暂无收藏', en: 'No saved phrases' })}
        </div>
      )}

      <div className="space-y-3">
        {currentCards.map(card => (
          <KoreanPhraseCard
            key={card.id}
            korean={card.ko}
            romanization={card.pronunciation}
            chinese={card.zh}
            exampleKo={card.example_ko}
            exampleZh={card.example_zh}
            exampleRoman={card.example_pronunciation}
            illustration="transport"
            onCopy={() => copyToClipboard(card.ko + '\n' + (card.example_ko || ''), lang)}
            onSpeak={() => speak(card.ko)}
            onBookmark={() => toggleBookmark(card.id)}
            bookmarked={bookmarkedCards.includes(card.id)}
            lang={lang}
          />
        ))}
      </div>
    </div>
  )
}
