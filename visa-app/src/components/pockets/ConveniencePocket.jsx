import { useState, useEffect } from 'react'
import { Bookmark, Volume2, Copy, ShoppingBag, CreditCard, Package, Printer, Zap, Gift, Smartphone, MapPin } from 'lucide-react'

// 다국어 헬퍼 함수
const L = (lang, text) => text[lang] || text['ko']

export default function ConveniencePocket({ lang }) {
  const [activeTab, setActiveTab] = useState('payment')
  const [toastMessage, setToastMessage] = useState('')
  const [bookmarkedCards, setBookmarkedCards] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('convenience_bookmarks')) || []
    } catch {
      return []
    }
  })

  // 북마크 저장
  useEffect(() => {
    localStorage.setItem('convenience_bookmarks', JSON.stringify(bookmarkedCards))
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

  // 카카오맵 연동 함수
  const openKakaoMap = (query = '주변 편의점') => {
    const deepLink = `kakaomap://search?q=${encodeURIComponent(query)}`
    const webFallback = `https://map.kakao.com/link/search/${encodeURIComponent(query)}`
    
    window.location.href = deepLink
    setTimeout(() => {
      window.open(webFallback, '_blank')
    }, 1500)
  }

  // 소주제 탭 데이터
  const tabs = [
    { id: 'payment', name: { ko: '결제', zh: '支付', en: 'Payment' }, icon: CreditCard },
    { id: 'search', name: { ko: '상품찾기', zh: '找商品', en: 'Finding Items' }, icon: ShoppingBag },
    { id: 'lunchbox', name: { ko: '도시락', zh: '便当', en: 'Lunch Box' }, icon: Package },
    { id: 'parcel', name: { ko: '택배', zh: '快递', en: 'Parcel' }, icon: Package },
    { id: 'atm', name: { ko: 'ATM', zh: 'ATM', en: 'ATM' }, icon: CreditCard },
    { id: 'charge', name: { ko: '충전', zh: '充值', en: 'Top-up' }, icon: Zap },
    { id: 'print', name: { ko: '프린트', zh: '打印', en: 'Print' }, icon: Printer },
    { id: 'promotion', name: { ko: '1+1행사', zh: '1+1活动', en: '1+1 Deals' }, icon: Gift },
    { id: 'brands', name: { ko: '브랜드별', zh: '按品牌', en: 'By Brand' }, icon: Smartphone }
  ]

  // 플래시카드 데이터 - 대폭 보강된 버전
  const cardData = {
    payment: [
      {
        id: 'pay_card',
        ko: '카드로 할게요',
        pronunciation: 'ka-deu-ro hal-ge-yo',
        zh: '我要刷卡',
        example_ko: '결제 카드로 할게요',
        example_zh: '支付用刷卡',
        example_pronunciation: 'gyeolje kadeuro halgeyo',
        unsplash: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=400&h=200&fit=crop&q=80'
      },
      {
        id: 'pay_cash',
        ko: '현금으로 할게요',
        pronunciation: 'hyeon-geum-eu-ro hal-ge-yo',
        zh: '我付现金',
        example_ko: '현금으로 결제할게요',
        example_zh: '用现金支付',
        example_pronunciation: 'hyeongeumeuro gyeoljehalgeyo',
        unsplash: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=400&h=200&fit=crop&q=80'
      },
      {
        id: 'samsung_pay',
        ko: '삼성페이로 결제할게요',
        pronunciation: 'sam-seong-pe-i-ro gyeol-je-hal-ge-yo',
        zh: '我用三星支付',
        example_ko: '삼성페이 되나요?',
        example_zh: '可以用三星支付吗？',
        example_pronunciation: 'samseongpei doenayo?',
        unsplash: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=400&h=200&fit=crop&q=80'
      },
      {
        id: 'kakao_pay',
        ko: '카카오페이로 해주세요',
        pronunciation: 'ka-ka-o-pe-i-ro hae-ju-se-yo',
        zh: '请用KaKao支付',
        example_ko: '카카오페이 QR코드 찍어주세요',
        example_zh: '请扫KaKao支付二维码',
        example_pronunciation: 'kakaopei QR kodeu jjigeojuseyo',
        unsplash: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=400&h=200&fit=crop&q=80'
      },
      {
        id: 'contactless_pay',
        ko: '터치 결제 돼요?',
        pronunciation: 'teo-chi gyeol-je dwae-yo',
        zh: '可以碰触支付吗？',
        example_ko: '카드 터치해서 결제할게요',
        example_zh: '我要碰触卡片支付',
        example_pronunciation: 'kadeu teochiaeseo gyeoljehalgeyo',
        unsplash: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=400&h=200&fit=crop&q=80'
      },
      {
        id: 'installment',
        ko: '할부로 해주세요',
        pronunciation: 'hal-bu-ro hae-ju-se-yo',
        zh: '请分期付款',
        example_ko: '3개월 할부 가능해요?',
        example_zh: '可以3个月分期吗？',
        example_pronunciation: 'sam-gaewol halbu ganeunghaeyo?',
        unsplash: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=400&h=200&fit=crop&q=80'
      },
      {
        id: 'points_card',
        ko: '포인트카드 있어요',
        pronunciation: 'po-in-teu-ka-deu iss-eo-yo',
        zh: '我有积分卡',
        example_ko: '포인트 적립해주세요',
        example_zh: '请给我积分',
        example_pronunciation: 'pointeu jeokripaejuseyo',
        unsplash: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=400&h=200&fit=crop&q=80'
      },
      {
        id: 'receipt_please',
        ko: '영수증 주세요',
        pronunciation: 'yeong-su-jeung ju-se-yo',
        zh: '请给我收据',
        example_ko: '영수증 꼭 주세요',
        example_zh: '请一定给我收据',
        example_pronunciation: 'yeongsujeung kkok juseyo',
        unsplash: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=400&h=200&fit=crop&q=80'
      },
      {
        id: 'bag_please',
        ko: '봉투 주세요',
        pronunciation: 'bong-tu ju-se-yo',
        zh: '请给我袋子',
        example_ko: '비닐봉투 하나 주세요',
        example_zh: '请给我一个塑料袋',
        example_pronunciation: 'binyeol bongtu hana juseyo',
        unsplash: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=400&h=200&fit=crop&q=80'
      },
      {
        id: 'change_money',
        ko: '잔돈 받을게요',
        pronunciation: 'jan-don bad-eul-ge-yo',
        zh: '我要找零',
        example_ko: '잔돈은 현금으로 주세요',
        example_zh: '找零请给现金',
        example_pronunciation: 'jandoneun hyeongeumeuro juseyo',
        unsplash: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=400&h=200&fit=crop&q=80'
      }
    ],
    search: [
      {
        id: 'where_is',
        ko: 'OO 어디에 있어요?',
        pronunciation: 'OO eo-di-e iss-eo-yo',
        zh: 'OO在哪里？',
        example_ko: '라면 어디에 있어요?',
        example_zh: '泡面在哪里？',
        example_pronunciation: 'ramyeon eodie isseoyo?',
        unsplash: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=400&h=200&fit=crop&q=80'
      },
      {
        id: 'do_you_have',
        ko: 'OO 있어요?',
        pronunciation: 'OO iss-eo-yo',
        zh: '有OO吗？',
        example_ko: '바나나우유 있어요?',
        example_zh: '有香蕉牛奶吗？',
        example_pronunciation: 'banana-uyu isseoyo?',
        unsplash: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=400&h=200&fit=crop&q=80'
      },
      {
        id: 'drinks_section',
        ko: '음료수는 어디 있어요?',
        pronunciation: 'eum-ryo-su-neun eo-di iss-eo-yo',
        zh: '饮料在哪里？',
        example_ko: '냉장고에서 음료수 찾고 있어요',
        example_zh: '我在冰箱里找饮料',
        example_pronunciation: 'naengjanggoeseo eumryosu chatgo isseoyo',
        unsplash: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=400&h=200&fit=crop&q=80'
      },
      {
        id: 'snacks_section',
        ko: '과자 코너는 어디예요?',
        pronunciation: 'gwa-ja ko-neo-neun eo-di-ye-yo',
        zh: '零食区在哪里？',
        example_ko: '과자랑 초콜릿 사려고 해요',
        example_zh: '我想买零食和巧克力',
        example_pronunciation: 'gwajarang chokollit saryeogo haeyo',
        unsplash: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=400&h=200&fit=crop&q=80'
      },
      {
        id: 'instant_food',
        ko: '인스턴트 음식은 어디 있어요?',
        pronunciation: 'in-seu-teon-teu eum-sik-eun eo-di iss-eo-yo',
        zh: '方便食品在哪里？',
        example_ko: '컵라면이랑 즉석밥 찾고 있어요',
        example_zh: '我在找杯面和速食米饭',
        example_pronunciation: 'keommyeonirang jeuktseokbap chatgo isseoyo',
        unsplash: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=400&h=200&fit=crop&q=80'
      },
      {
        id: 'dairy_products',
        ko: '유제품은 어디에 있어요?',
        pronunciation: 'yu-je-pum-eun eo-di-e iss-eo-yo',
        zh: '乳制品在哪里？',
        example_ko: '우유랑 요거트 사려고 해요',
        example_zh: '我想买牛奶和酸奶',
        example_pronunciation: 'uyurang yogeoteu saryeogo haeyo',
        unsplash: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=400&h=200&fit=crop&q=80'
      },
      {
        id: 'bathroom_items',
        ko: '화장실 용품 어디 있어요?',
        pronunciation: 'hwa-jang-sil yong-pum eo-di iss-eo-yo',
        zh: '卫生用品在哪里？',
        example_ko: '휴지랑 치약 사려고 해요',
        example_zh: '我想买纸巾和牙膏',
        example_pronunciation: 'hyujirang chiyak saryeogo haeyo',
        unsplash: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=400&h=200&fit=crop&q=80'
      },
      {
        id: 'ice_cream',
        ko: '아이스크림 어디 있어요?',
        pronunciation: 'a-i-seu-keu-rim eo-di iss-eo-yo',
        zh: '冰淇淋在哪里？',
        example_ko: '냉동고에 아이스크림 있나요?',
        example_zh: '冷冻柜里有冰淇淋吗？',
        example_pronunciation: 'naengdonggo-e aiseukeulim innayo?',
        unsplash: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=400&h=200&fit=crop&q=80'
      },
      {
        id: 'similar_item',
        ko: '비슷한 거 있어요?',
        pronunciation: 'bi-seu-tan geo iss-eo-yo',
        zh: '有类似的吗？',
        example_ko: '이거랑 비슷한 거 있어요?',
        example_zh: '有和这个类似的吗？',
        example_pronunciation: 'igeorang biseutan geo isseoyo?',
        unsplash: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=400&h=200&fit=crop&q=80'
      },
      {
        id: 'how_much',
        ko: '이거 얼마예요?',
        pronunciation: 'i-geo eol-ma-ye-yo',
        zh: '这个多少钱？',
        example_ko: '이 과자 얼마예요?',
        example_zh: '这个零食多少钱？',
        example_pronunciation: 'i gwaja eolmayeyo?',
        unsplash: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=400&h=200&fit=crop&q=80'
      },
      {
        id: 'cheaper_option',
        ko: '더 싼 거 있어요?',
        pronunciation: 'deo ssan geo iss-eo-yo',
        zh: '有更便宜的吗？',
        example_ko: '이거보다 싼 거 있나요?',
        example_zh: '有比这个便宜的吗？',
        example_pronunciation: 'igeoboda ssan geo innayo?',
        unsplash: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=400&h=200&fit=crop&q=80'
      }
    ],
    lunchbox: [
      {
        id: 'recommend_lunchbox',
        ko: '어떤 도시락이 맛있어요?',
        pronunciation: 'eo-tteon do-si-rak-i ma-siss-eo-yo',
        zh: '哪个便当好吃？',
        example_ko: '인기 있는 도시락 뭐예요?',
        example_zh: '受欢迎的便当是什么？',
        example_pronunciation: 'ingi-inneun dosirak mwoyeyo?',
        unsplash: 'https://images.unsplash.com/photo-1511690743698-d9d85f2fbf38?w=400&h=200&fit=crop&q=80'
      },
      {
        id: 'microwave_please',
        ko: '전자레인지 써도 돼요?',
        pronunciation: 'jeon-ja-re-in-ji sseo-do dwae-yo',
        zh: '可以用微波炉吗？',
        example_ko: '도시락 데우고 싶어요',
        example_zh: '我想加热便当',
        example_pronunciation: 'dosirak deugo sipeoyo',
        unsplash: 'https://images.unsplash.com/photo-1511690743698-d9d85f2fbf38?w=400&h=200&fit=crop&q=80'
      },
      {
        id: 'heat_time',
        ko: '몇 분 돌리면 돼요?',
        pronunciation: 'myeot bun dol-li-myeon dwae-yo',
        zh: '转几分钟就行？',
        example_ko: '이거 2분 정도 데우면 돼요?',
        example_zh: '这个加热2分钟就行吗？',
        example_pronunciation: 'igeo i-bun jeongdo daeumyeon dwaeyo?',
        unsplash: 'https://images.unsplash.com/photo-1511690743698-d9d85f2fbf38?w=400&h=200&fit=crop&q=80'
      },
      {
        id: 'fresh_lunchbox',
        ko: '방금 나온 도시락 있어요?',
        pronunciation: 'bang-geum na-on do-si-rak iss-eo-yo',
        zh: '有刚出的便当吗？',
        example_ko: '따뜻한 도시락 있어요?',
        example_zh: '有热便当吗？',
        example_pronunciation: 'ttatteutan dosirak isseoyo?',
        unsplash: 'https://images.unsplash.com/photo-1511690743698-d9d85f2fbf38?w=400&h=200&fit=crop&q=80'
      },
      {
        id: 'spicy_level',
        ko: '이거 매워요?',
        pronunciation: 'i-geo mae-wo-yo',
        zh: '这个辣吗？',
        example_ko: '안 매운 도시락 있어요?',
        example_zh: '有不辣的便当吗？',
        example_pronunciation: 'an maeun dosirak isseoyo?',
        unsplash: 'https://images.unsplash.com/photo-1511690743698-d9d85f2fbf38?w=400&h=200&fit=crop&q=80'
      },
      {
        id: 'korean_meal',
        ko: '한국식 도시락 있어요?',
        pronunciation: 'han-guk-sik do-si-rak iss-eo-yo',
        zh: '有韩式便当吗？',
        example_ko: '김치찜이나 불고기 도시락 있나요?',
        example_zh: '有泡菜炖肉或烤肉便当吗？',
        example_pronunciation: 'gimchijjimina bulgogi dosirak innayo?',
        unsplash: 'https://images.unsplash.com/photo-1511690743698-d9d85f2fbf38?w=400&h=200&fit=crop&q=80'
      },
      {
        id: 'cheap_meal',
        ko: '싸고 맛있는 도시락 있어요?',
        pronunciation: 'ssa-go ma-sinn-neun do-si-rak iss-eo-yo',
        zh: '有便宜又好吃的便当吗？',
        example_ko: '5000원 이하 도시락 있나요?',
        example_zh: '有5000韩元以下的便当吗？',
        example_pronunciation: 'ocheon-won iha dosirak innayo?',
        unsplash: 'https://images.unsplash.com/photo-1511690743698-d9d85f2fbf38?w=400&h=200&fit=crop&q=80'
      },
      {
        id: 'rice_bowl',
        ko: '즉석밥도 있어요?',
        pronunciation: 'jeuk-seok-bap-do iss-eo-yo',
        zh: '也有速食米饭吗？',
        example_ko: '밥만 따로 사고 싶어요',
        example_zh: '我只想买米饭',
        example_pronunciation: 'bapman ttaro sago sipeoyo',
        unsplash: 'https://images.unsplash.com/photo-1511690743698-d9d85f2fbf38?w=400&h=200&fit=crop&q=80'
      },
      {
        id: 'sandwich',
        ko: '샌드위치도 있어요?',
        pronunciation: 'saen-deu-wi-chi-do iss-eo-yo',
        zh: '也有三明治吗？',
        example_ko: '가벼운 샌드위치 사고 싶어요',
        example_zh: '我想买轻便的三明治',
        example_pronunciation: 'gabyeoun saendeuwichi sago sipeoyo',
        unsplash: 'https://images.unsplash.com/photo-1511690743698-d9d85f2fbf38?w=400&h=200&fit=crop&q=80'
      },
      {
        id: 'discount_lunchbox',
        ko: '할인하는 도시락 있어요?',
        pronunciation: 'hal-in-ha-neun do-si-rak iss-eo-yo',
        zh: '有打折的便当吗？',
        example_ko: '저녁 시간 할인 도시락 있어요?',
        example_zh: '有晚餐时间打折便当吗？',
        example_pronunciation: 'jeonyeok sigan halin dosirak isseoyo?',
        unsplash: 'https://images.unsplash.com/photo-1511690743698-d9d85f2fbf38?w=400&h=200&fit=crop&q=80'
      },
      {
        id: 'salad',
        ko: '샐러드도 있어요?',
        pronunciation: 'sael-leo-deu-do iss-eo-yo',
        zh: '也有沙拉吗？',
        example_ko: '건강한 샐러드 사고 싶어요',
        example_zh: '我想买健康的沙拉',
        example_pronunciation: 'geonganhan saelleodeu sago sipeoyo',
        unsplash: 'https://images.unsplash.com/photo-1511690743698-d9d85f2fbf38?w=400&h=200&fit=crop&q=80'
      }
    ],
    parcel: [
      {
        id: 'send_parcel',
        ko: '택배 보내고 싶어요',
        pronunciation: 'taek-bae bo-nae-go si-peo-yo',
        zh: '我想寄快递',
        example_ko: '국내 택배 보내려고 해요',
        example_zh: '我想寄国内快递',
        example_pronunciation: 'gungnae taekbae bonaeryeogo haeyo',
        unsplash: 'https://images.unsplash.com/photo-1566139427285-95a7923c9b4c?w=400&h=200&fit=crop&q=80'
      },
      {
        id: 'cu_postbox',
        ko: 'CU 택배 보낼 수 있어요?',
        pronunciation: 'si-yu taek-bae bo-nael su iss-eo-yo',
        zh: '可以在CU寄快递吗？',
        example_ko: 'CU POST 서비스 되나요?',
        example_zh: 'CU POST服务可以吗？',
        example_pronunciation: 'CU POST seobiseu doenayo?',
        unsplash: 'https://images.unsplash.com/photo-1566139427285-95a7923c9b4c?w=400&h=200&fit=crop&q=80'
      },
      {
        id: 'gs_postbox',
        ko: 'GS편의점택배 되나요?',
        pronunciation: 'GS-pyeon-ui-jeom-taek-bae doe-na-yo',
        zh: 'GS便利店快递可以吗？',
        example_ko: 'GS편의점에서 택배 접수해요?',
        example_zh: 'GS便利店可以收快递吗？',
        example_pronunciation: 'GS-pyeonyijeomeseo taekbae jeopsurhaeyo?',
        unsplash: 'https://images.unsplash.com/photo-1566139427285-95a7923c9b4c?w=400&h=200&fit=crop&q=80'
      },
      {
        id: 'parcel_fee',
        ko: '택배비 얼마예요?',
        pronunciation: 'taek-bae-bi eol-ma-ye-yo',
        zh: '快递费多少钱？',
        example_ko: '서울까지 보내는데 얼마예요?',
        example_zh: '寄到首尔要多少钱？',
        example_pronunciation: 'seoul-kkaji bonaeneunde eolmayeyo?',
        unsplash: 'https://images.unsplash.com/photo-1566139427285-95a7923c9b4c?w=400&h=200&fit=crop&q=80'
      },
      {
        id: 'parcel_size',
        ko: '이 크기 보낼 수 있어요?',
        pronunciation: 'i keu-gi bo-nael su iss-eo-yo',
        zh: '这个尺寸可以寄吗？',
        example_ko: '너무 큰가요?',
        example_zh: '会不会太大？',
        example_pronunciation: 'neomu keungayo?',
        unsplash: 'https://images.unsplash.com/photo-1566139427285-95a7923c9b4c?w=400&h=200&fit=crop&q=80'
      },
      {
        id: 'receive_parcel',
        ko: '택배 찾으러 왔어요',
        pronunciation: 'taek-bae chat-eu-reo wass-eo-yo',
        zh: '我来取快递',
        example_ko: '택배 도착 문자 받았어요',
        example_zh: '我收到快递到达短信',
        example_pronunciation: 'taekbae dochak munja badasseyo',
        unsplash: 'https://images.unsplash.com/photo-1566139427285-95a7923c9b4c?w=400&h=200&fit=crop&q=80'
      },
      {
        id: 'parcel_code',
        ko: '송장번호 알려드릴게요',
        pronunciation: 'song-jang-beon-ho al-lyeo-deu-ril-ge-yo',
        zh: '我告诉您运单号',
        example_ko: '택배 송장번호가 필요해요?',
        example_zh: '需要快递单号吗？',
        example_pronunciation: 'taekbae songjang-beonho-ga piryohaeyo?',
        unsplash: 'https://images.unsplash.com/photo-1566139427285-95a7923c9b4c?w=400&h=200&fit=crop&q=80'
      },
      {
        id: 'parcel_box',
        ko: '박스 필요해요',
        pronunciation: 'bak-seu pi-ryo-hae-yo',
        zh: '我需要箱子',
        example_ko: '택배 보낼 박스 있어요?',
        example_zh: '有寄快递的箱子吗？',
        example_pronunciation: 'taekbae bonael bakseu isseoyo?',
        unsplash: 'https://images.unsplash.com/photo-1566139427285-95a7923c9b4c?w=400&h=200&fit=crop&q=80'
      },
      {
        id: 'bubble_wrap',
        ko: '뽁뽁이 있어요?',
        pronunciation: 'ppok-ppok-i iss-eo-yo',
        zh: '有泡沫包装纸吗？',
        example_ko: '포장재료 사고 싶어요',
        example_zh: '我想买包装材料',
        example_pronunciation: 'pojang-jaeryo sago sipeoyo',
        unsplash: 'https://images.unsplash.com/photo-1566139427285-95a7923c9b4c?w=400&h=200&fit=crop&q=80'
      },
      {
        id: 'parcel_time',
        ko: '언제 도착해요?',
        pronunciation: 'eon-je do-chak-hae-yo',
        zh: '什么时候到？',
        example_ko: '내일까지 도착할 수 있어요?',
        example_zh: '明天能到吗？',
        example_pronunciation: 'naeil-kkaji dochakal su isseoyo?',
        unsplash: 'https://images.unsplash.com/photo-1566139427285-95a7923c9b4c?w=400&h=200&fit=crop&q=80'
      }
    ],
    atm: [
      {
        id: 'withdraw_money',
        ko: '돈 뽑고 싶어요',
        pronunciation: 'don ppop-go si-peo-yo',
        zh: '我想取钱',
        example_ko: 'ATM에서 돈 뽑고 싶어요',
        example_zh: '我想从ATM取钱',
        example_pronunciation: 'ATM-eseo don ppopgo sipeoyo',
        unsplash: 'https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=400&h=200&fit=crop&q=80'
      },
      {
        id: 'atm_fee',
        ko: '수수료 얼마예요?',
        pronunciation: 'su-su-ryo eol-ma-ye-yo',
        zh: '手续费多少？',
        example_ko: 'ATM 수수료가 비싸요?',
        example_zh: 'ATM手续费贵吗？',
        example_pronunciation: 'ATM susuryo-ga bissayo?',
        unsplash: 'https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=400&h=200&fit=crop&q=80'
      },
      {
        id: 'foreign_card',
        ko: '해외카드 돼요?',
        pronunciation: 'hae-oe-ka-deu dwae-yo',
        zh: '海外卡可以吗？',
        example_ko: '외국 카드로 인출 돼요?',
        example_zh: '用外国卡可以取钱吗？',
        example_pronunciation: 'oeguk kadeuro inchul dwaeyo?',
        unsplash: 'https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=400&h=200&fit=crop&q=80'
      },
      {
        id: 'visa_mastercard',
        ko: '비자 마스터카드 돼요?',
        pronunciation: 'bi-ja ma-seu-teo-ka-deu dwae-yo',
        zh: 'VISA万事达卡可以吗？',
        example_ko: '비자카드로 출금할 수 있어요?',
        example_zh: '可以用VISA卡取钱吗？',
        example_pronunciation: 'bijaka-deuro chulgeum-hal su isseoyo?',
        unsplash: 'https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=400&h=200&fit=crop&q=80'
      },
      {
        id: 'exchange_money',
        ko: '환전도 돼요?',
        pronunciation: 'hwan-jeon-do dwae-yo',
        zh: '也可以换钱吗？',
        example_ko: '달러를 원화로 바꿀 수 있어요?',
        example_zh: '可以把美元换成韩元吗？',
        example_pronunciation: 'dalleoreul wonhwa-ro bakkul su isseoyo?',
        unsplash: 'https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=400&h=200&fit=crop&q=80'
      },
      {
        id: 'daily_limit',
        ko: '하루에 얼마까지 뽑을 수 있어요?',
        pronunciation: 'ha-ru-e eol-ma-kka-ji ppop-eul su iss-eo-yo',
        zh: '一天可以取多少钱？',
        example_ko: '인출 한도가 있어요?',
        example_zh: '有取款限额吗？',
        example_pronunciation: 'inchul hando-ga isseoyo?',
        unsplash: 'https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=400&h=200&fit=crop&q=80'
      },
      {
        id: 'atm_not_working',
        ko: 'ATM이 안 돼요',
        pronunciation: 'ATM-i an dwae-yo',
        zh: 'ATM不工作',
        example_ko: '카드가 안 들어가요',
        example_zh: '卡插不进去',
        example_pronunciation: 'kadeuga an deureogayo',
        unsplash: 'https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=400&h=200&fit=crop&q=80'
      },
      {
        id: 'card_stuck',
        ko: '카드가 안 나와요',
        pronunciation: 'ka-deu-ga an na-wa-yo',
        zh: '卡出不来',
        example_ko: '카드가 ATM에 끼었어요',
        example_zh: '卡卡在ATM里了',
        example_pronunciation: 'kadeuga ATM-e kkieosseoyo',
        unsplash: 'https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=400&h=200&fit=crop&q=80'
      },
      {
        id: 'receipt_needed',
        ko: '영수증 뽑을 수 있어요?',
        pronunciation: 'yeong-su-jeung ppop-eul su iss-eo-yo',
        zh: '可以打印收据吗？',
        example_ko: 'ATM 영수증 필요해요',
        example_zh: '我需要ATM收据',
        example_pronunciation: 'ATM yeongsujeung piryohaeyo',
        unsplash: 'https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=400&h=200&fit=crop&q=80'
      },
      {
        id: 'balance_check',
        ko: '잔액 확인하고 싶어요',
        pronunciation: 'jan-aek hwak-in-ha-go si-peo-yo',
        zh: '我想查余额',
        example_ko: '통장 잔고 봐도 돼요?',
        example_zh: '可以看账户余额吗？',
        example_pronunciation: 'tongjang jango bwado dwaeyo?',
        unsplash: 'https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=400&h=200&fit=crop&q=80'
      }
    ],
    charge: [
      {
        id: 'charge_phone',
        ko: '휴대폰 충전하고 싶어요',
        pronunciation: 'hyu-dae-pon chung-jeon-ha-go si-peo-yo',
        zh: '我想给手机充电',
        example_ko: '핸드폰 충전기 있어요?',
        example_zh: '有手机充电器吗？',
        example_pronunciation: 'haendeupon chungjeongi isseoyo?',
        unsplash: 'https://images.unsplash.com/photo-1585088649888-3086c5c2b45c?w=400&h=200&fit=crop&q=80'
      },
      {
        id: 'phone_cable',
        ko: '충전 케이블 있어요?',
        pronunciation: 'chung-jeon ke-i-beul iss-eo-yo',
        zh: '有充电线吗？',
        example_ko: 'C타입 충전기 팔아요?',
        example_zh: '卖C型充电器吗？',
        example_pronunciation: 'C-taip chungjeongi parayo?',
        unsplash: 'https://images.unsplash.com/photo-1585088649888-3086c5c2b45c?w=400&h=200&fit=crop&q=80'
      },
      {
        id: 'portable_charger',
        ko: '보조배터리 있어요?',
        pronunciation: 'bo-jo-bae-teo-ri iss-eo-yo',
        zh: '有充电宝吗？',
        example_ko: '휴대용 충전기 사고 싶어요',
        example_zh: '我想买便携式充电器',
        example_pronunciation: 'hyudaeyong chungjeongi sago sipeoyo',
        unsplash: 'https://images.unsplash.com/photo-1585088649888-3086c5c2b45c?w=400&h=200&fit=crop&q=80'
      },
      {
        id: 'charge_transport',
        ko: '교통카드 충전하고 싶어요',
        pronunciation: 'gyo-tong-ka-deu chung-jeon-ha-go si-peo-yo',
        zh: '我想给交通卡充值',
        example_ko: 'T머니 충전 어떻게 해요?',
        example_zh: 'T-money怎么充值？',
        example_pronunciation: 'Timeoni chungjeon eotteoke haeyo?',
        unsplash: 'https://images.unsplash.com/photo-1585088649888-3086c5c2b45c?w=400&h=200&fit=crop&q=80'
      },
      {
        id: 'how_much_charge',
        ko: '얼마 충전할까요?',
        pronunciation: 'eol-ma chung-jeon-hal-kka-yo',
        zh: '충值多少钱？',
        example_ko: '1만원 충전해주세요',
        example_zh: '请充值1万韩元',
        example_pronunciation: 'il-manwon chungjeonhaejuseyo',
        unsplash: 'https://images.unsplash.com/photo-1585088649888-3086c5c2b45c?w=400&h=200&fit=crop&q=80'
      },
      {
        id: 'wibro_card',
        ko: '와이브로 카드 충전돼요?',
        pronunciation: 'wa-i-beu-ro ka-deu chung-jeon-dwae-yo',
        zh: '可以给WiBro卡충值吗？',
        example_ko: '인터넷 카드 충전하고 싶어요',
        example_zh: '我想给上网卡충值',
        example_pronunciation: 'inteoneu kadeu chungjeonhago sipeoyo',
        unsplash: 'https://images.unsplash.com/photo-1585088649888-3086c5c2b45c?w=400&h=200&fit=crop&q=80'
      },
      {
        id: 'game_card',
        ko: '게임 머니 충전돼요?',
        pronunciation: 'ge-im meo-ni chung-jeon-dwae-yo',
        zh: '可以충게임币吗？',
        example_ko: '넥슨 캐시 충전하고 싶어요',
        example_zh: '我想충Nexon现金',
        example_pronunciation: 'nekseon kaesi chungjeonhago sipeoyo',
        unsplash: 'https://images.unsplash.com/photo-1585088649888-3086c5c2b45c?w=400&h=200&fit=crop&q=80'
      },
      {
        id: 'prepaid_card',
        ko: '선불카드 충전해주세요',
        pronunciation: 'seon-bul-ka-deu chung-jeon-hae-ju-se-yo',
        zh: '请给预付卡충值',
        example_ko: '문화상품권 충전해주세요',
        example_zh: '请给文化商品券충값',
        example_pronunciation: 'munhwa-sangpumgwon chungjeonhaejuseyo',
        unsplash: 'https://images.unsplash.com/photo-1585088649888-3086c5c2b45c?w=400&h=200&fit=crop&q=80'
      },
      {
        id: 'gift_card',
        ko: '기프트카드 충전 되나요?',
        pronunciation: 'gi-peu-teu-ka-deu chung-jeon doe-na-yo',
        zh: '礼品卡可以충값吗？',
        example_ko: '구글플레이 기프트카드 있어요?',
        example_zh: '有谷歌Play礼品卡吗？',
        example_pronunciation: 'gugeul-peullei gipeuteukadeu isseoyo?',
        unsplash: 'https://images.unsplash.com/photo-1585088649888-3086c5c2b45c?w=400&h=200&fit=crop&q=80'
      },
      {
        id: 'recharge_machine',
        ko: '충전기 어떻게 써요?',
        pronunciation: 'chung-jeon-gi eo-tteo-ke sseo-yo',
        zh: '충전기怎么用？',
        example_ko: '교통카드 충전기 사용법 알려주세요',
        example_zh: '请告诉我交通卡충전기使用方法',
        example_pronunciation: 'gyotong-kadeu chungjeongi sayongbeop allyeojuseyo',
        unsplash: 'https://images.unsplash.com/photo-1585088649888-3086c5c2b45c?w=400&h=200&fit=crop&q=80'
      }
    ],
    print: [
      {
        id: 'want_print',
        ko: '프린트하고 싶어요',
        pronunciation: 'peu-rin-teu-ha-go si-peo-yo',
        zh: '我想打印',
        example_ko: '서류 프린트하려고 해요',
        example_zh: '我想打印文件',
        example_pronunciation: 'seoryu peurinteuharyeogo haeyo',
        unsplash: 'https://images.unsplash.com/photo-1586953208448-b95a79798f07?w=400&h=200&fit=crop&q=80'
      },
      {
        id: 'multi_printer',
        ko: '복합기 어떻게 써요?',
        pronunciation: 'bok-hap-gi eo-tteo-ke sseo-yo',
        zh: '多功能打印机怎么用？',
        example_ko: '멀티복합기 사용법 알려주세요',
        example_zh: '请告诉我多功能打印机用法',
        example_pronunciation: 'meolti-bokhapgi sayongbeop allyeojuseyo',
        unsplash: 'https://images.unsplash.com/photo-1586953208448-b95a79798f07?w=400&h=200&fit=crop&q=80'
      },
      {
        id: 'color_print',
        ko: '컬러로 프린트해주세요',
        pronunciation: 'keol-leo-ro peu-rin-teu-hae-ju-se-yo',
        zh: '请彩색打印',
        example_ko: '이 사진 컬러로 프린트해주세요',
        example_zh: '请彩色打印这张照片',
        example_pronunciation: 'i sajin keolerro peurinteuhae juseyo',
        unsplash: 'https://images.unsplash.com/photo-1586953208448-b95a79798f07?w=400&h=200&fit=crop&q=80'
      },
      {
        id: 'black_white_print',
        ko: '흑백으로 프린트할게요',
        pronunciation: 'heuk-baek-eu-ro peu-rin-teu-hal-ge-yo',
        zh: '我要黑白打印',
        example_ko: '흑백이면 더 싸죠?',
        example_zh: '黑白的更便宜吧？',
        example_pronunciation: 'heukbaegimyeon deo ssajyo?',
        unsplash: 'https://images.unsplash.com/photo-1586953208448-b95a79798f07?w=400&h=200&fit=crop&q=80'
      },
      {
        id: 'copy_id',
        ko: '신분증 복사하고 싶어요',
        pronunciation: 'sin-bun-jeung bok-sa-ha-go si-peo-yo',
        zh: '我想复印身份证',
        example_ko: '여권 복사 어떻게 해요?',
        example_zh: '怎么复印护照？',
        example_pronunciation: 'yeogwon boksa eotteoke haeyo?',
        unsplash: 'https://images.unsplash.com/photo-1586953208448-b95a79798f07?w=400&h=200&fit=crop&q=80'
      },
      {
        id: 'usb_print',
        ko: 'USB로 프린트할 수 있어요?',
        pronunciation: 'USB-ro peu-rin-teu-hal su iss-eo-yo',
        zh: '可以用USB打印吗？',
        example_ko: 'USB 꽂는 곳이 어디예요?',
        example_zh: 'USB插口在哪里？',
        example_pronunciation: 'USB kkotneun gosi eodiyeyo?',
        unsplash: 'https://images.unsplash.com/photo-1586953208448-b95a79798f07?w=400&h=200&fit=crop&q=80'
      },
      {
        id: 'scan_service',
        ko: '스캔도 할 수 있어요?',
        pronunciation: 'seu-kaen-do hal su iss-eo-yo',
        zh: '也可以扫描吗？',
        example_ko: '서류 스캔해서 이메일로 보낼 수 있어요?',
        example_zh: '可以扫描文件后发邮件吗？',
        example_pronunciation: 'seoryu seukaenaeseo imeilro bonael su isseoyo?',
        unsplash: 'https://images.unsplash.com/photo-1586953208448-b95a79798f07?w=400&h=200&fit=crop&q=80'
      },
      {
        id: 'print_price',
        ko: '프린트 요금이 얼마예요?',
        pronunciation: 'peu-rin-teu yo-geum-i eol-ma-ye-yo',
        zh: '打印费多少钱？',
        example_ko: '한 장에 얼마예요?',
        example_zh: '一张多少钱？',
        example_pronunciation: 'han jang-e eolmayeyo?',
        unsplash: 'https://images.unsplash.com/photo-1586953208448-b95a79798f07?w=400&h=200&fit=crop&q=80'
      },
      {
        id: 'paper_size',
        ko: 'A4 말고 다른 크기도 돼요?',
        pronunciation: 'A-sa mal-go da-reun keu-gi-do dwae-yo',
        zh: '除了A4还有其他尺寸吗？',
        example_ko: 'A3 크기로 프린트할 수 있어요?',
        example_zh: '可以打印A3尺寸吗？',
        example_pronunciation: 'A-sam keu-giro peurinteuhal su isseoyo?',
        unsplash: 'https://images.unsplash.com/photo-1586953208448-b95a79798f07?w=400&h=200&fit=crop&q=80'
      },
      {
        id: 'mobile_print',
        ko: '핸드폰에서 바로 프린트할 수 있어요?',
        pronunciation: 'haen-deu-pon-e-seo ba-ro peu-rin-teu-hal su iss-eo-yo',
        zh: '可以直接从手机打印吗？',
        example_ko: '앱으로 프린트 되나요?',
        example_zh: '可以用应用程序打印吗？',
        example_pronunciation: 'aepeuro peurinteu doenayo?',
        unsplash: 'https://images.unsplash.com/photo-1586953208448-b95a79798f07?w=400&h=200&fit=crop&q=80'
      }
    ],
    promotion: [
      {
        id: 'one_plus_one',
        ko: '1+1 행사하는 거 있어요?',
        pronunciation: 'won peul-leo-seu won haeng-sa-ha-neun geo iss-eo-yo',
        zh: '有1+1活动的吗？',
        example_ko: '과자 1+1 행사 뭐 있어요?',
        example_zh: '零食有什么1+1活动？',
        example_pronunciation: 'gwaja won peulleoseu won haengsa mwo isseoyo?',
        unsplash: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=400&h=200&fit=crop&q=80'
      },
      {
        id: 'two_plus_one',
        ko: '2+1 행사도 있어요?',
        pronunciation: 'i peul-leo-seu won haeng-sa-do iss-eo-yo',
        zh: '也有2+1活动吗？',
        example_ko: '음료수 2+1 행사 중이에요?',
        example_zh: '饮料有2+1活动吗？',
        example_pronunciation: 'eumryosu i peulleoseu won haengsa jung-ieyo?',
        unsplash: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=400&h=200&fit=crop&q=80'
      },
      {
        id: 'discount_time',
        ko: '언제 할인해요?',
        pronunciation: 'eon-je hal-in-hae-yo',
        zh: '什么时候打折？',
        example_ko: '저녁에 도시락 할인하나요?',
        example_zh: '晚上便当打折吗？',
        example_pronunciation: 'jeonyeoge dosirak halinhanayo?',
        unsplash: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=400&h=200&fit=crop&q=80'
      },
      {
        id: 'how_to_get_deal',
        ko: '이 행사 어떻게 받아요?',
        pronunciation: 'i haeng-sa eo-tteo-ke bad-a-yo',
        zh: '这个活动怎么参加？',
        example_ko: '1+1 행사는 자동으로 적용돼요?',
        example_zh: '1+1活动是自动适用的吗？',
        example_pronunciation: 'won peulleoseu won haengsaneun jadongeuro jeokyongdwaeyo?',
        unsplash: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=400&h=200&fit=crop&q=80'
      },
      {
        id: 'event_period',
        ko: '이 행사 언제까지예요?',
        pronunciation: 'i haeng-sa eon-je-kka-ji-ye-yo',
        zh: '这个活动到什么时候？',
        example_ko: '행사 기간이 얼마나 남았어요?',
        example_zh: '活动期间还剩多久？',
        example_pronunciation: 'haengsa gigani eolmana namasseoyo?',
        unsplash: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=400&h=200&fit=crop&q=80'
      },
      {
        id: 'which_items',
        ko: '어떤 상품이 행사 상품이에요?',
        pronunciation: 'eo-tteon sang-pum-i haeng-sa sang-pum-i-e-yo',
        zh: '哪些商品是活动商品？',
        example_ko: '행사 표시가 어디에 있어요?',
        example_zh: '活动标识在哪里？',
        example_pronunciation: 'haengsa pyosiga eodie isseoyo?',
        unsplash: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=400&h=200&fit=crop&q=80'
      },
      {
        id: 'discount_item',
        ko: '할인하는 상품 있어요?',
        pronunciation: 'hal-in-ha-neun sang-pum iss-eo-yo',
        zh: '有打折商品吗？',
        example_ko: '오늘 할인하는 거 뭐 있어요?',
        example_zh: '今天有什么打折的？',
        example_pronunciation: 'oneul halinneun geo mwo isseoyo?',
        unsplash: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=400&h=200&fit=crop&q=80'
      },
      {
        id: 'expired_soon',
        ko: '유통기한 임박 상품 있어요?',
        pronunciation: 'yu-tong-gi-han im-bak sang-pum iss-eo-yo',
        zh: '有临期商品吗？',
        example_ko: '유통기한 가까운 건 더 싸나요?',
        example_zh: '临近保质期的更便宜吗？',
        example_pronunciation: 'yutong-gihan gakkaun geon deo ssanayo?',
        unsplash: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=400&h=200&fit=crop&q=80'
      },
      {
        id: 'membership_discount',
        ko: '멤버십 할인 있어요?',
        pronunciation: 'mem-beo-sip hal-in iss-eo-yo',
        zh: '有会员折扣吗？',
        example_ko: '회원 가입하면 할인돼요?',
        example_zh: '注册会员有折扣吗？',
        example_pronunciation: 'hoewon gaiphamyeon halindwaeyo?',
        unsplash: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=400&h=200&fit=crop&q=80'
      },
      {
        id: 'combo_deal',
        ko: '세트로 사면 더 싸져요?',
        pronunciation: 'se-teu-ro sa-myeon deo ssa-jyeo-yo',
        zh: '套餐购买更便宜吗？',
        example_ko: '조합해서 사면 할인되는 거 있어요?',
        example_zh: '有组合购买折扣吗？',
        example_pronunciation: 'johapaeseo samyeon halindoeneun geo isseoyo?',
        unsplash: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=400&h=200&fit=crop&q=80'
      }
    ],
    brands: [
      {
        id: 'cu_special',
        ko: 'CU만의 특별한 상품이 있어요',
        pronunciation: 'si-yu-man-ui teuk-byeol-han sang-pum-i iss-eo-yo',
        zh: 'CU有特别的商品',
        example_ko: 'CU 도시락이 맛있다고 해요',
        example_zh: '听说CU便当很好吃',
        example_pronunciation: 'CU dosiragi masitdago haeyo',
        unsplash: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=400&h=200&fit=crop&q=80'
      },
      {
        id: 'gs25_fresh',
        ko: 'GS25는 신선한 음식이 많아요',
        pronunciation: 'GS i-sib-o-neun sin-seon-han eum-sik-i man-a-yo',
        zh: 'GS25新鲜食品很多',
        example_ko: 'GS25 갓프레시 음식 어때요?',
        example_zh: 'GS25 GOD FRESH食品怎么样？',
        example_pronunciation: 'GS25 gaspeureusi eumsik eottaeyo?',
        unsplash: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=400&h=200&fit=crop&q=80'
      },
      {
        id: 'seven_eleven',
        ko: '세븐일레븐은 일본풍 상품이 있어요',
        pronunciation: 'se-beun-il-le-beun-eun il-bon-pung sang-pum-i iss-eo-yo',
        zh: '7-ELEVEN有日式商品',
        example_ko: '세븐일레븐 디저트 추천해요',
        example_zh: '推荐7-ELEVEN甜点',
        example_pronunciation: 'sebeunil-lebeon dijeoteu chucheonhaeyo',
        unsplash: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=400&h=200&fit=crop&q=80'
      },
      {
        id: 'emart24',
        ko: '이마트24는 이마트 브랜드 상품이 있어요',
        pronunciation: 'i-ma-teu i-sib-sa-neun i-ma-teu beu-raen-deu sang-pum-i iss-eo-yo',
        zh: 'E-mart24有E-mart品牌商品',
        example_ko: '이마트 PB 상품 가격이 저렴해요',
        example_zh: 'E-mart自有品牌商品价格便宜',
        example_pronunciation: 'imateu PB sangpum gagyeogi jeoryeomhaeyo',
        unsplash: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=400&h=200&fit=crop&q=80'
      },
      {
        id: 'brand_difference',
        ko: '편의점마다 뭐가 다른가요?',
        pronunciation: 'pyeon-ui-jeom-ma-da mwo-ga da-reun-ga-yo',
        zh: '每个便利店有什么不同？',
        example_ko: '어떤 편의점이 더 좋아요?',
        example_zh: '哪个便利店更好？',
        example_pronunciation: 'eotteon pyeonyijeomi deo joayo?',
        unsplash: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=400&h=200&fit=crop&q=80'
      },
      {
        id: 'cu_only',
        ko: 'CU에서만 파는 거 있어요?',
        pronunciation: 'si-yu-e-seo-man pa-neun geo iss-eo-yo',
        zh: '有只在CU卖的吗？',
        example_ko: 'CU 전용 브랜드가 있나요?',
        example_zh: '有CU专属品牌吗？',
        example_pronunciation: 'CU jeonyong beuraendi innayo?',
        unsplash: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=400&h=200&fit=crop&q=80'
      },
      {
        id: 'gs_service',
        ko: 'GS25 서비스가 좋다고 들었어요',
        pronunciation: 'GS i-sib-o seo-bi-seu-ga jo-ta-go deul-eoss-eo-yo',
        zh: '听说GS25服务很好',
        example_ko: 'GS25 택배 서비스 편해요?',
        example_zh: 'GS25快递服务方便吗？',
        example_pronunciation: 'GS25 taekbae seobiseu pyeonhaeyo?',
        unsplash: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=400&h=200&fit=crop&q=80'
      },
      {
        id: 'seven_coffee',
        ko: '세븐일레븐 커피가 맛있다고 해요',
        pronunciation: 'se-beun-il-le-beun keo-pi-ga ma-siss-da-go hae-yo',
        zh: '听说7-ELEVEN咖啡很好喝',
        example_ko: '세븐카페 추천하시나요?',
        example_zh: '推荐Seven Cafe吗？',
        example_pronunciation: 'sebeun-kape chucheonhasinayo?',
        unsplash: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=400&h=200&fit=crop&q=80'
      },
      {
        id: 'emart_cheap',
        ko: '이마트24가 제일 싸다고 들었어요',
        pronunciation: 'i-ma-teu i-sib-sa-ga je-il ssa-da-go deul-eoss-eo-yo',
        zh: '听说E-mart24最便宜',
        example_ko: '이마트24 가격이 정말 저렴해요?',
        example_zh: 'E-mart24价格真的很便宜吗？',
        example_pronunciation: 'imateu24 gagyeogi jeongmal jeoryeomhaeyo?',
        unsplash: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=400&h=200&fit=crop&q=80'
      },
      {
        id: 'which_brand',
        ko: '어떤 편의점을 추천하세요?',
        pronunciation: 'eo-tteon pyeon-ui-jeom-eul chu-cheon-ha-se-yo',
        zh: '推荐哪个便利店？',
        example_ko: '처음 가는데 어디가 좋을까요?',
        example_zh: '第一次去，哪里比较好？',
        example_pronunciation: 'cheoeum ganeunde eodiga joeulkkayo?',
        unsplash: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=400&h=200&fit=crop&q=80'
      }
    ]
  }

  // 그라데이션 클래스 매핑
  const getGradientClass = (tabId) => {
    const gradientMap = {
      payment: 'bg-gradient-to-br from-blue-100 to-indigo-200',
      search: 'bg-gradient-to-br from-green-100 to-emerald-200',
      lunchbox: 'bg-gradient-to-br from-orange-100 to-red-200',
      parcel: 'bg-gradient-to-br from-purple-100 to-violet-200',
      atm: 'bg-gradient-to-br from-gray-100 to-slate-200',
      charge: 'bg-gradient-to-br from-yellow-100 to-orange-200',
      print: 'bg-gradient-to-br from-teal-100 to-cyan-200',
      promotion: 'bg-gradient-to-br from-pink-100 to-rose-200',
      brands: 'bg-gradient-to-br from-indigo-100 to-purple-200'
    }
    return gradientMap[tabId] || 'bg-gradient-to-br from-gray-100 to-gray-200'
  }

  // 아이콘 매핑
  const getIcon = (tabId) => {
    const iconMap = {
      payment: CreditCard,
      search: ShoppingBag,
      lunchbox: Package,
      parcel: Package,
      atm: CreditCard,
      charge: Zap,
      print: Printer,
      promotion: Gift,
      brands: Smartphone
    }
    return iconMap[tabId] || ShoppingBag
  }

  // 플래시카드 컴포넌트
  const FlashCard = ({ card, tabId }) => {
    const [imgError, setImgError] = useState(false)
    const Icon = getIcon(tabId)
    const gradientClass = getGradientClass(tabId)
    const isBookmarked = bookmarkedCards.includes(card.id)

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
            <div className={`w-full h-[160px] ${gradientClass} flex items-center justify-center`}>
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

      {/* 카카오맵 연동 버튼 */}
      <div className="space-y-3 mt-6">
        <h3 className="font-semibold text-gray-800 text-sm">
          {L(lang, { ko: '편리한 앱 연결', zh: '便利应用连接', en: 'Convenient App Links' })}
        </h3>
        
        <div className="grid grid-cols-1 gap-2">
          {/* 카카오맵 - 주변 편의점 찾기 */}
          <button
            onClick={() => openKakaoMap('주변 편의점')}
            className="flex items-center justify-between p-3 bg-yellow-50 border border-yellow-200 rounded-lg hover:bg-yellow-100 transition-colors"
          >
            <div className="flex items-center gap-3">
              <MapPin size={20} className="text-yellow-600" />
              <div className="text-left">
                <p className="font-medium text-gray-800">
                  {L(lang, { ko: '주변 편의점 찾기', zh: '寻找附近便利店', en: 'Find nearby convenience stores' })}
                </p>
                <p className="text-xs text-gray-500">
                  {L(lang, { ko: '카카오맵으로 연결', zh: '连接到KakaoMap', en: 'Connect to KakaoMap' })}
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