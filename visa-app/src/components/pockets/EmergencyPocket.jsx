import { useState, useEffect } from 'react'
import { Bookmark, Volume2, Copy, Shield, Truck, AlertTriangle, User, Phone, MapPin, Heart, Building, Smartphone, CreditCard } from 'lucide-react'

// 다국어 헬퍼 함수
const L = (lang, text) => text[lang] || text['ko']

export default function EmergencyPocket({ lang }) {
  const [activeTab, setActiveTab] = useState('hospital')
  const [toastMessage, setToastMessage] = useState('')
  const [bookmarkedCards, setBookmarkedCards] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('emergency_bookmarks')) || []
    } catch {
      return []
    }
  })

  // 북마크 저장
  useEffect(() => {
    localStorage.setItem('emergency_bookmarks', JSON.stringify(bookmarkedCards))
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

  // 전화걸기 함수
  const makeCall = (number) => {
    window.open(`tel:${number}`)
  }

  // 카카오맵 연동 함수
  const openKakaoMap = (query) => {
    const deepLink = `kakaomap://search?q=${encodeURIComponent(query)}`
    const webFallback = `https://map.kakao.com/link/search/${encodeURIComponent(query)}`
    
    window.location.href = deepLink
    setTimeout(() => {
      window.open(webFallback, '_blank')
    }, 1500)
  }

  // 카카오톡 연동
  const openKakaoTalk = () => {
    const deepLink = 'kakaotalk://open'
    const fallback = 'https://play.google.com/store/apps/details?id=com.kakao.talk'
    
    window.location.href = deepLink
    setTimeout(() => {
      window.open(fallback, '_blank')
    }, 1500)
  }

  // 소주제 탭 데이터
  const tabs = [
    { id: 'hospital', name: { ko: '병원', zh: '医院', en: 'Hospital' }, icon: Heart },
    { id: 'police', name: { ko: '경찰', zh: '警察', en: 'Police' }, icon: Shield },
    { id: 'lost', name: { ko: '분실', zh: '丢失', en: 'Lost Items' }, icon: AlertTriangle },
    { id: 'fire', name: { ko: '화재', zh: '火灾', en: 'Fire' }, icon: Truck },
    { id: 'disaster', name: { ko: '자연재해', zh: '自然灾害', en: 'Natural Disaster' }, icon: AlertTriangle },
    { id: 'embassy', name: { ko: '대사관', zh: '大使馆', en: 'Embassy' }, icon: Building },
    { id: 'pharmacy', name: { ko: '약국', zh: '药局', en: 'Pharmacy' }, icon: Heart },
    { id: 'insurance', name: { ko: '보험', zh: '保险', en: 'Insurance' }, icon: CreditCard },
    { id: 'numbers', name: { ko: '긴급번호', zh: '紧急号码', en: 'Emergency Numbers' }, icon: Phone }
  ]

  // 플래시카드 데이터
  const cardData = {
    hospital: [
      {
        id: 'emergency',
        ko: '응급실 어디예요?',
        pronunciation: 'eung-geup-sil eo-di-ye-yo',
        zh: '急诊室在哪里？',
        example_ko: '빨리 응급실로 가야 해요',
        example_zh: '需要快速去急诊室',
        example_pronunciation: 'ppalli eunggeupsiullo gaya haeyo',
        unsplash: 'https://images.unsplash.com/photo-1631815588090-d4bfec5b1ccb?w=400&h=200&fit=crop&q=80'
      },
      {
        id: 'hurt',
        ko: '아파요',
        pronunciation: 'a-pa-yo',
        zh: '疼',
        example_ko: '배가 너무 아파요',
        example_zh: '肚子很疼',
        example_pronunciation: 'baega neomu apayo',
        unsplash: 'https://images.unsplash.com/photo-1631815588090-d4bfec5b1ccb?w=400&h=200&fit=crop&q=80'
      },
      {
        id: 'medicine',
        ko: '약이 필요해요',
        pronunciation: 'yag-i pi-ryo-hae-yo',
        zh: '需要药',
        example_ko: '열을 내리는 약이 필요해요',
        example_zh: '需要退烧药',
        example_pronunciation: 'yeoreul naerineun yagi piryohaeyo',
        unsplash: 'https://images.unsplash.com/photo-1631815588090-d4bfec5b1ccb?w=400&h=200&fit=crop&q=80'
      },
      {
        id: 'insurance_card',
        ko: '보험증 있어요',
        pronunciation: 'bo-heom-jeung iss-eo-yo',
        zh: '我有保险证',
        example_ko: '건강보험증 가져왔어요',
        example_zh: '我带了健康保险证',
        example_pronunciation: 'geongangbohoemjeung gajyeowasseyo',
        unsplash: 'https://images.unsplash.com/photo-1631815588090-d4bfec5b1ccb?w=400&h=200&fit=crop&q=80'
      },
      {
        id: 'foreigner_hospital',
        ko: '외국인 진료 가능한 병원이에요?',
        pronunciation: 'oe-gug-in jin-ryo ga-neung-han byeong-won-i-e-yo',
        zh: '这家医院可以给外国人看病吗？',
        example_ko: '영어로 진료받을 수 있어요?',
        example_zh: '可以用英语看病吗？',
        example_pronunciation: 'yeongeoro jinyeobadeul su isseoyo?',
        unsplash: 'https://images.unsplash.com/photo-1631815588090-d4bfec5b1ccb?w=400&h=200&fit=crop&q=80'
      }
    ],
    police: [
      {
        id: 'help_me',
        ko: '도와주세요',
        pronunciation: 'do-wa-ju-se-yo',
        zh: '请帮助我',
        example_ko: '누가 좀 도와주세요',
        example_zh: '请有人帮帮我',
        example_pronunciation: 'nuga jom dowajuseyo',
        unsplash: 'https://images.unsplash.com/photo-1582719366276-0ad7db08a6ac?w=400&h=200&fit=crop&q=80'
      },
      {
        id: 'police_station',
        ko: '경찰서 어디예요?',
        pronunciation: 'gyeong-chal-seo eo-di-ye-yo',
        zh: '警察局在哪里？',
        example_ko: '가장 가까운 경찰서 어디예요?',
        example_zh: '最近的警察局在哪里？',
        example_pronunciation: 'gajang gakkaun gyeongchalseo eodiyeyo?',
        unsplash: 'https://images.unsplash.com/photo-1582719366276-0ad7db08a6ac?w=400&h=200&fit=crop&q=80'
      },
      {
        id: 'report',
        ko: '신고하고 싶어요',
        pronunciation: 'sin-go-ha-go si-peo-yo',
        zh: '我想报案',
        example_ko: '사기를 당해서 신고하고 싶어요',
        example_zh: '我被骗了想报案',
        example_pronunciation: 'sagireul danghaeseo singohago sipeoyo',
        unsplash: 'https://images.unsplash.com/photo-1582719366276-0ad7db08a6ac?w=400&h=200&fit=crop&q=80'
      },
      {
        id: 'passport_problem',
        ko: '여권에 문제가 있어요',
        pronunciation: 'yeo-gwon-e mun-je-ga iss-eo-yo',
        zh: '护照有问题',
        example_ko: '여권을 분실했어요',
        example_zh: '我丢了护照',
        example_pronunciation: 'yeogwoneul bunsilhaesseyo',
        unsplash: 'https://images.unsplash.com/photo-1582719366276-0ad7db08a6ac?w=400&h=200&fit=crop&q=80'
      }
    ],
    lost: [
      {
        id: 'lost_something',
        ko: 'OO을 잃어버렸어요',
        pronunciation: 'OO-eul il-eo-beo-ryeoss-eo-yo',
        zh: '我丢了OO',
        example_ko: '핸드폰을 잃어버렸어요',
        example_zh: '我丢了手机',
        example_pronunciation: 'haendeu-poneul ireobeolyeosseyo',
        unsplash: 'https://images.unsplash.com/photo-1521587760476-6c12a4b040da?w=400&h=200&fit=crop&q=80'
      },
      {
        id: 'where_lost_found',
        ko: '분실물센터 어디예요?',
        pronunciation: 'bun-sil-mul-sen-teo eo-di-ye-yo',
        zh: '失物招领处在哪里？',
        example_ko: '지하철 분실물센터 어디예요?',
        example_zh: '地铁失物招领处在哪里？',
        example_pronunciation: 'jihacheol bunsilmul-senteo eodiyeyo?',
        unsplash: 'https://images.unsplash.com/photo-1521587760476-6c12a4b040da?w=400&h=200&fit=crop&q=80'
      },
      {
        id: 'when_lost',
        ko: '언제 잃어버렸는지 몰라요',
        pronunciation: 'eon-je il-eo-beo-ryeoss-neun-ji mol-ra-yo',
        zh: '不知道什么时候丢的',
        example_ko: '어디서 잃어버렸는지도 몰라요',
        example_zh: '也不知道在哪里丢的',
        example_pronunciation: 'eodiseo ireobeolyeossneunjido mollayo',
        unsplash: 'https://images.unsplash.com/photo-1521587760476-6c12a4b040da?w=400&h=200&fit=crop&q=80'
      }
    ],
    fire: [
      {
        id: 'fire',
        ko: '불이야!',
        pronunciation: 'bur-i-ya',
        zh: '着火了！',
        example_ko: '여기 불이 났어요!',
        example_zh: '这里着火了！',
        example_pronunciation: 'yeogi buri nasseyo!',
        unsplash: 'https://images.unsplash.com/photo-1525904097878-94fb15835963?w=400&h=200&fit=crop&q=80'
      },
      {
        id: 'fire_extinguisher',
        ko: '소화기 어디 있어요?',
        pronunciation: 'so-hwa-gi eo-di iss-eo-yo',
        zh: '灭火器在哪里？',
        example_ko: '빨리 소화기 가져와요',
        example_zh: '快拿灭火器来',
        example_pronunciation: 'ppalli sohwagi gajyeowayo',
        unsplash: 'https://images.unsplash.com/photo-1525904097878-94fb15835963?w=400&h=200&fit=crop&q=80'
      },
      {
        id: 'evacuate',
        ko: '대피해야 해요',
        pronunciation: 'dae-pi-hae-ya hae-yo',
        zh: '需要避难',
        example_ko: '모두 건물 밖으로 대피해요',
        example_zh: '所有人都要避难到建筑外',
        example_pronunciation: 'modu geonmul bakkeuro daepihaeyo',
        unsplash: 'https://images.unsplash.com/photo-1525904097878-94fb15835963?w=400&h=200&fit=crop&q=80'
      }
    ],
    disaster: [
      {
        id: 'earthquake',
        ko: '지진이에요',
        pronunciation: 'ji-jin-i-e-yo',
        zh: '地震了',
        example_ko: '지금 지진이 일어나고 있어요',
        example_zh: '现在正在发生地震',
        example_pronunciation: 'jigeum jijini ireonago isseoyo',
        unsplash: 'https://images.unsplash.com/photo-1551808278-3a1f6f06f29e?w=400&h=200&fit=crop&q=80'
      },
      {
        id: 'flood',
        ko: '홍수예요',
        pronunciation: 'hong-su-ye-yo',
        zh: '洪水',
        example_ko: '물이 많이 불어났어요',
        example_zh: '水涨得很高',
        example_pronunciation: 'muri mani bureonnasseyo',
        unsplash: 'https://images.unsplash.com/photo-1551808278-3a1f6f06f29e?w=400&h=200&fit=crop&q=80'
      },
      {
        id: 'safe_place',
        ko: '안전한 곳 어디예요?',
        pronunciation: 'an-jeon-han got eo-di-ye-yo',
        zh: '安全的地方在哪里？',
        example_ko: '대피소 어디예요?',
        example_zh: '避难所在哪里？',
        example_pronunciation: 'daepiso eodiyeyo?',
        unsplash: 'https://images.unsplash.com/photo-1551808278-3a1f6f06f29e?w=400&h=200&fit=crop&q=80'
      }
    ],
    embassy: [
      {
        id: 'chinese_embassy',
        ko: '중국 대사관 어디예요?',
        pronunciation: 'jung-guk dae-sa-gwan eo-di-ye-yo',
        zh: '中国大使馆在哪里？',
        example_ko: '중국 대사관에 가야 해요',
        example_zh: '我需要去中国大使馆',
        example_pronunciation: 'jungguk daesagwane gaya haeyo',
        unsplash: 'https://images.unsplash.com/photo-1587829447253-b0b02c8fa7d1?w=400&h=200&fit=crop&q=80'
      },
      {
        id: 'passport_reissue',
        ko: '여권 재발급 받고 싶어요',
        pronunciation: 'yeo-gwon jae-bal-geup bad-go si-peo-yo',
        zh: '我想重新办理护照',
        example_ko: '여권을 잃어버려서 재발급 받아야 해요',
        example_zh: '我丢了护照需要重新办理',
        example_pronunciation: 'yeogwoneul ireobeolyeoseo jaebalgeup badaya haeyo',
        unsplash: 'https://images.unsplash.com/photo-1587829447253-b0b02c8fa7d1?w=400&h=200&fit=crop&q=80'
      },
      {
        id: 'consulate_help',
        ko: '영사 업무 도움이 필요해요',
        pronunciation: 'yeong-sa eop-mu do-um-i pi-ryo-hae-yo',
        zh: '我需要领事业务帮助',
        example_ko: '법적 문제로 도움이 필요해요',
        example_zh: '我需要法律问题的帮助',
        example_pronunciation: 'beopjeok munjero doumi piryohaeyo',
        unsplash: 'https://images.unsplash.com/photo-1587829447253-b0b02c8fa7d1?w=400&h=200&fit=crop&q=80'
      }
    ],
    pharmacy: [
      {
        id: 'pharmacy_location',
        ko: '약국 어디 있어요?',
        pronunciation: 'yag-guk eo-di iss-eo-yo',
        zh: '药店在哪里？',
        example_ko: '24시간 약국 있어요?',
        example_zh: '有24小时药店吗？',
        example_pronunciation: '24sigan yakguk isseoyo?',
        unsplash: 'https://images.unsplash.com/photo-1523540451401-62c5d7d78d55?w=400&h=200&fit=crop&q=80'
      },
      {
        id: 'fever_medicine',
        ko: '해열제 주세요',
        pronunciation: 'hae-yeol-je ju-se-yo',
        zh: '请给我退烧药',
        example_ko: '열이 나서 해열제가 필요해요',
        example_zh: '我发烧了需要退烧药',
        example_pronunciation: 'yeori naseo haeyeolje-ga piryohaeyo',
        unsplash: 'https://images.unsplash.com/photo-1523540451401-62c5d7d78d55?w=400&h=200&fit=crop&q=80'
      },
      {
        id: 'stomach_medicine',
        ko: '배가 아파요. 소화제 있어요?',
        pronunciation: 'bae-ga a-pa-yo. so-hwa-je iss-eo-yo',
        zh: '肚子疼。有消化药吗？',
        example_ko: '체했을 때 먹는 약 있어요?',
        example_zh: '有消化不良时吃的药吗？',
        example_pronunciation: 'chehaesseul ttae meogneun yak isseoyo?',
        unsplash: 'https://images.unsplash.com/photo-1523540451401-62c5d7d78d55?w=400&h=200&fit=crop&q=80'
      },
      {
        id: 'painkiller',
        ko: '진통제 주세요',
        pronunciation: 'jin-tong-je ju-se-yo',
        zh: '请给我止痛药',
        example_ko: '두통이 심해서 진통제가 필요해요',
        example_zh: '头痛很严重需要止痛药',
        example_pronunciation: 'dutong-i simhaeseo jintongjega piryohaeyo',
        unsplash: 'https://images.unsplash.com/photo-1523540451401-62c5d7d78d55?w=400&h=200&fit=crop&q=80'
      }
    ],
    insurance: [
      {
        id: 'have_insurance',
        ko: '보험 들어있어요',
        pronunciation: 'bo-heom deul-eo-iss-eo-yo',
        zh: '我有保险',
        example_ko: '여행자 보험 들어있어요',
        example_zh: '我有旅行保险',
        example_pronunciation: 'yeohaengja boheom deureoisseoyo',
        unsplash: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=400&h=200&fit=crop&q=80'
      },
      {
        id: 'insurance_claim',
        ko: '보험 청구하고 싶어요',
        pronunciation: 'bo-heom cheong-gu-ha-go si-peo-yo',
        zh: '我想申请保险理赔',
        example_ko: '의료비 보험 청구 어떻게 해요?',
        example_zh: '医疗费用保险理赔怎么办？',
        example_pronunciation: 'uiryobi boheom cheonggu eotteoke haeyo?',
        unsplash: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=400&h=200&fit=crop&q=80'
      },
      {
        id: 'receipt_need',
        ko: '영수증이 필요해요',
        pronunciation: 'yeong-su-jeung-i pi-ryo-hae-yo',
        zh: '我需要收据',
        example_ko: '보험 청구용 영수증 주세요',
        example_zh: '请给我用于保险理赔的收据',
        example_pronunciation: 'boheom cheongguyong yeongsujeung juseyo',
        unsplash: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=400&h=200&fit=crop&q=80'
      }
    ],
    numbers: [
      {
        id: 'police_112',
        ko: '112 (경찰)',
        pronunciation: 'baek-sib-i gyeong-chal',
        zh: '112 (警察)',
        example_ko: '위험할 때 112로 전화하세요',
        example_zh: '危险时请拨打112',
        example_pronunciation: 'wiheomhal ttae 112ro jeonhwahaseyo',
        phoneNumber: '112',
        unsplash: 'https://images.unsplash.com/photo-1580910051074-3eb694886505?w=400&h=200&fit=crop&q=80'
      },
      {
        id: 'fire_119',
        ko: '119 (소방/응급)',
        pronunciation: 'baek-sib-gu so-bang-eung-geup',
        zh: '119 (消防/急救)',
        example_ko: '화재나 응급상황에 119로 전화하세요',
        example_zh: '火灾或紧急情况请拨打119',
        example_pronunciation: 'hwae-na eunggeup-sanghwang-e 119ro jeonhwahaseyo',
        phoneNumber: '119',
        unsplash: 'https://images.unsplash.com/photo-1580910051074-3eb694886505?w=400&h=200&fit=crop&q=80'
      },
      {
        id: 'foreigner_1345',
        ko: '1345 (외국인 종합안내)',
        pronunciation: 'cheon-sam-baek-sa-sib-o oe-gug-in jong-hap-an-nae',
        zh: '1345 (外国人综合咨询)',
        example_ko: '외국인 도움이 필요하면 1345로 전화하세요',
        example_zh: '外国人需要帮助请拨打1345',
        example_pronunciation: 'oegugin doumi piryohamyeon 1345ro jeonhwahaseyo',
        phoneNumber: '1345',
        unsplash: 'https://images.unsplash.com/photo-1580910051074-3eb694886505?w=400&h=200&fit=crop&q=80'
      },
      {
        id: 'chinese_embassy',
        ko: '02-738-1038 (중국대사관)',
        pronunciation: 'gong-i-chil-sam-pal-il-gong-sam-pal jung-guk-dae-sa-gwan',
        zh: '02-738-1038 (中国大使馆)',
        example_ko: '중국 대사관 영사업무는 02-738-1038로 연락하세요',
        example_zh: '中国大使馆领事业务请联系02-738-1038',
        example_pronunciation: 'jungguk daesagwan yeongsa-eopmueun 02-738-1038ro yeollak-haseyo',
        phoneNumber: '02-738-1038',
        unsplash: 'https://images.unsplash.com/photo-1580910051074-3eb694886505?w=400&h=200&fit=crop&q=80'
      }
    ]
  }

  // 그라데이션 클래스 매핑
  const getGradientClass = (tabId) => {
    const gradientMap = {
      hospital: 'bg-gradient-to-br from-red-100 to-pink-200',
      police: 'bg-gradient-to-br from-blue-100 to-indigo-200',
      lost: 'bg-gradient-to-br from-yellow-100 to-orange-200',
      fire: 'bg-gradient-to-br from-orange-100 to-red-200',
      disaster: 'bg-gradient-to-br from-purple-100 to-violet-200',
      embassy: 'bg-gradient-to-br from-green-100 to-emerald-200',
      pharmacy: 'bg-gradient-to-br from-teal-100 to-cyan-200',
      insurance: 'bg-gradient-to-br from-gray-100 to-slate-200',
      numbers: 'bg-gradient-to-br from-red-100 to-rose-200'
    }
    return gradientMap[tabId] || 'bg-gradient-to-br from-gray-100 to-gray-200'
  }

  // 아이콘 매핑
  const getIcon = (tabId) => {
    const iconMap = {
      hospital: Heart,
      police: Shield,
      lost: AlertTriangle,
      fire: Truck,
      disaster: AlertTriangle,
      embassy: Building,
      pharmacy: Heart,
      insurance: CreditCard,
      numbers: Phone
    }
    return iconMap[tabId] || AlertTriangle
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
            <div className="flex gap-1">
              <button onClick={() => speak(card.ko)} className="w-8 h-8 bg-gray-50 rounded-full flex items-center justify-center">
                <Volume2 size={14} className="text-gray-400" />
              </button>
              {/* 긴급번호 탭의 경우 전화 버튼 추가 */}
              {tabId === 'numbers' && card.phoneNumber && (
                <button 
                  onClick={() => makeCall(card.phoneNumber)} 
                  className="w-8 h-8 bg-red-50 rounded-full flex items-center justify-center"
                >
                  <Phone size={14} className="text-red-500" />
                </button>
              )}
            </div>
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

      {/* 카카오맵 & 카카오톡 연동 버튼 */}
      <div className="space-y-3 mt-6">
        <h3 className="font-semibold text-gray-800 text-sm">
          {L(lang, { ko: '편리한 앱 연결', zh: '便利应用连接', en: 'Convenient App Links' })}
        </h3>
        
        <div className="grid grid-cols-1 gap-2">
          {/* 카카오맵 - 주변 병원/약국 찾기 */}
          <button
            onClick={() => openKakaoMap(activeTab === 'hospital' ? '주변 병원' : activeTab === 'pharmacy' ? '주변 약국' : '주변 ' + L(lang, tabs.find(t => t.id === activeTab)?.name || {}))}
            className="flex items-center justify-between p-3 bg-yellow-50 border border-yellow-200 rounded-lg hover:bg-yellow-100 transition-colors"
          >
            <div className="flex items-center gap-3">
              <MapPin size={20} className="text-yellow-600" />
              <div className="text-left">
                <p className="font-medium text-gray-800">
                  {L(lang, { 
                    ko: `주변 ${L(lang, tabs.find(t => t.id === activeTab)?.name || {})} 찾기`, 
                    zh: `寻找附近${L('zh', tabs.find(t => t.id === activeTab)?.name || {})}`, 
                    en: `Find nearby ${L('en', tabs.find(t => t.id === activeTab)?.name || {})}` 
                  })}
                </p>
                <p className="text-xs text-gray-500">
                  {L(lang, { ko: '카카오맵으로 연결', zh: '连接到KakaoMap', en: 'Connect to KakaoMap' })}
                </p>
              </div>
            </div>
            <div className="text-yellow-600">→</div>
          </button>

          {/* 카카오톡 - 긴급 연락 */}
          <button
            onClick={openKakaoTalk}
            className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100 transition-colors"
          >
            <div className="flex items-center gap-3">
              <Smartphone size={20} className="text-green-600" />
              <div className="text-left">
                <p className="font-medium text-gray-800">
                  {L(lang, { ko: '카카오톡으로 긴급 연락', zh: 'KakaoTalk紧急联系', en: 'Emergency contact via KakaoTalk' })}
                </p>
                <p className="text-xs text-gray-500">
                  {L(lang, { ko: '가족/친구에게 알림', zh: '通知家人/朋友', en: 'Notify family/friends' })}
                </p>
              </div>
            </div>
            <div className="text-green-600">→</div>
          </button>
        </div>
      </div>

      {/* 사용법 안내 */}
      <div className="text-xs text-gray-500 bg-red-50 p-3 rounded-lg mt-6">
        🚨 {L(lang, { 
          ko: '긴급상황 시 112(경찰), 119(소방/응급), 1345(외국인도움)로 전화하세요. 플래시카드를 탭하면 한국어가 복사됩니다.', 
          zh: '紧急情况时请拨打112(警察)、119(消防/急救)、1345(外国人帮助)。点击卡片复制韩语。', 
          en: 'In emergencies call 112(Police), 119(Fire/Emergency), 1345(Foreigner Help). Tap cards to copy Korean text.' 
        })}
      </div>
    </div>
  )
}