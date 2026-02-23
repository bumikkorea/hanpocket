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

  // 플래시카드 데이터
  const cardData = {
    payment: [
      {
        id: 'heat_up',
        ko: '데워주세요',
        pronunciation: 'de-wo-ju-se-yo',
        zh: '请给我加热',
        example_ko: '도시락 데워주세요',
        example_zh: '请给便当加热',
        example_pronunciation: 'dosirak dewojuseyo',
        unsplash: 'https://images.unsplash.com/photo-1555961403-6e2a0b57ce27?w=400&h=200&fit=crop&q=80'
      },
      {
        id: 'pay_card',
        ko: '카드로 할게요',
        pronunciation: 'ka-deu-ro hal-ge-yo',
        zh: '我要刷卡',
        example_ko: '결제 카드로 할게요',
        example_zh: '支付用刷卡',
        example_pronunciation: 'gyeolje kadeuro halgeyo',
        unsplash: 'https://images.unsplash.com/photo-1555961403-6e2a0b57ce27?w=400&h=200&fit=crop&q=80'
      },
      {
        id: 'pay_cash',
        ko: '현금으로 할게요',
        pronunciation: 'hyeon-geum-eu-ro hal-ge-yo',
        zh: '我付现金',
        example_ko: '현금으로 결제할게요',
        example_zh: '用现金支付',
        example_pronunciation: 'hyeongeumeuro gyeolje-halgeyo',
        unsplash: 'https://images.unsplash.com/photo-1555961403-6e2a0b57ce27?w=400&h=200&fit=crop&q=80'
      },
      {
        id: 'bag_please',
        ko: '봉투 주세요',
        pronunciation: 'bong-tu ju-se-yo',
        zh: '请给我袋子',
        example_ko: '비닐봉투 하나 주세요',
        example_zh: '请给我一个塑料袋',
        example_pronunciation: 'binyeol bongtu hana juseyo',
        unsplash: 'https://images.unsplash.com/photo-1555961403-6e2a0b57ce27?w=400&h=200&fit=crop&q=80'
      },
      {
        id: 'receipt_please',
        ko: '영수증 주세요',
        pronunciation: 'yeong-su-jeung ju-se-yo',
        zh: '请给我收据',
        example_ko: '영수증 꼭 주세요',
        example_zh: '请一定给我收据',
        example_pronunciation: 'yeongsujeung kkok juseyo',
        unsplash: 'https://images.unsplash.com/photo-1555961403-6e2a0b57ce27?w=400&h=200&fit=crop&q=80'
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
        id: 'discount_lunchbox',
        ko: '할인하는 도시락 있어요?',
        pronunciation: 'hal-in-ha-neun do-si-rak iss-eo-yo',
        zh: '有打折的便当吗？',
        example_ko: '저녁 시간 할인 도시락 있어요?',
        example_zh: '有晚餐时间打折便当吗？',
        example_pronunciation: 'jeonyeok sigan halin dosirak isseoyo?',
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
        id: 'parcel_box',
        ko: '박스 필요해요',
        pronunciation: 'bak-seu pi-ryo-hae-yo',
        zh: '我需要箱子',
        example_ko: '택배 보낼 박스 있어요?',
        example_zh: '有寄快递的箱子吗？',
        example_pronunciation: 'taekbae bonael bakseu isseoyo?',
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
        id: 'foreign_card',
        ko: '해외카드 돼요?',
        pronunciation: 'hae-oe-ka-deu dwae-yo',
        zh: '海外卡可以吗？',
        example_ko: '외국 카드로 인출 돼요?',
        example_zh: '用外国卡可以取钱吗？',
        example_pronunciation: 'oeguk kadeuro inchul dwaeyo?',
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
        id: 'prepaid_card',
        ko: '선불카드 충전해주세요',
        pronunciation: 'seon-bul-ka-deu chung-jeon-hae-ju-se-yo',
        zh: '请给预付卡充值',
        example_ko: '문화상품권 충전해주세요',
        example_zh: '请给文化商品券充值',
        example_pronunciation: 'munhwa-sangpumgwon chungjeonhaejuseyo',
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
        id: 'color_print',
        ko: '컬러로 프린트해주세요',
        pronunciation: 'keol-leo-ro peu-rin-teu-hae-ju-se-yo',
        zh: '请彩色打印',
        example_ko: '이 사진 컬러로 프린트해주세요',
        example_zh: '请彩色打印这张照片',
        example_pronunciation: 'i sajin keolerro peurinteuhae juseyo',
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
        id: 'discount_item',
        ko: '할인하는 상품 있어요?',
        pronunciation: 'hal-in-ha-neun sang-pum iss-eo-yo',
        zh: '有打折商品吗？',
        example_ko: '오늘 할인하는 거 뭐 있어요?',
        example_zh: '今天有什么打折的？',
        example_pronunciation: 'oneul halinneun geo mwo isseoyo?',
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