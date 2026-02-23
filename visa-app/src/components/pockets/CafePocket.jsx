import { useState, useEffect } from 'react'
import { Bookmark, Volume2, Copy, Coffee, Wifi, Package, MapPin, Star, Book, Smartphone } from 'lucide-react'

// 다국어 헬퍼 함수
const L = (lang, text) => text[lang] || text['ko']

export default function CafePocket({ lang }) {
  const [activeTab, setActiveTab] = useState('order')
  const [toastMessage, setToastMessage] = useState('')
  const [bookmarkedCards, setBookmarkedCards] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('cafe_bookmarks')) || []
    } catch {
      return []
    }
  })

  // 북마크 저장
  useEffect(() => {
    localStorage.setItem('cafe_bookmarks', JSON.stringify(bookmarkedCards))
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
  const openKakaoMap = (query = '주변 카페') => {
    const deepLink = `kakaomap://search?q=${encodeURIComponent(query)}`
    const webFallback = `https://map.kakao.com/link/search/${encodeURIComponent(query)}`
    
    window.location.href = deepLink
    setTimeout(() => {
      window.open(webFallback, '_blank')
    }, 1500)
  }

  // 소주제 탭 데이터
  const tabs = [
    { id: 'order', name: { ko: '주문', zh: '点单', en: 'Order' }, icon: Coffee },
    { id: 'size', name: { ko: '사이즈', zh: '尺寸', en: 'Size' }, icon: Coffee },
    { id: 'options', name: { ko: '옵션', zh: '选项', en: 'Options' }, icon: Coffee },
    { id: 'packaging', name: { ko: '포장', zh: '打包', en: 'Packaging' }, icon: Package },
    { id: 'wifi', name: { ko: '와이파이', zh: 'WiFi', en: 'WiFi' }, icon: Wifi },
    { id: 'culture', name: { ko: '카페문화', zh: '咖啡文化', en: 'Cafe Culture' }, icon: Star },
    { id: 'study', name: { ko: '스터디카페', zh: '学习咖啡厅', en: 'Study Cafe' }, icon: Book },
    { id: 'chains', name: { ko: '유명체인', zh: '知名连锁', en: 'Famous Chains' }, icon: Smartphone }
  ]

  // 플래시카드 데이터
  const cardData = {
    order: [
      {
        id: 'americano',
        ko: '아메리카노 주세요',
        pronunciation: 'a-me-ri-ka-no ju-se-yo',
        zh: '请给我美式咖啡',
        example_ko: '아이스 아메리카노 하나 주세요',
        example_zh: '请给我一杯冰美式咖啡',
        example_pronunciation: 'aiseu amerikano hana juseyo',
        unsplash: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=400&h=200&fit=crop&q=80'
      },
      {
        id: 'latte',
        ko: '라떼 주세요',
        pronunciation: 'ra-tte ju-se-yo',
        zh: '请给我拿铁',
        example_ko: '카페라떼 그란데로 주세요',
        example_zh: '请给我一杯大杯咖啡拿铁',
        example_pronunciation: 'kaperatte geurandero juseyo',
        unsplash: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=400&h=200&fit=crop&q=80'
      },
      {
        id: 'recommend',
        ko: '추천 메뉴 뭐예요?',
        pronunciation: 'chu-cheon me-nyu mwo-ye-yo',
        zh: '推荐什么饮品？',
        example_ko: '시그니처 메뉴 추천해주세요',
        example_zh: '请推荐招牌饮品',
        example_pronunciation: 'sigeuniceo menyu chucheonhaejuseyo',
        unsplash: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=400&h=200&fit=crop&q=80'
      },
      {
        id: 'sweet_less',
        ko: '달지 않게 해주세요',
        pronunciation: 'dal-ji an-ge hae-ju-se-yo',
        zh: '请不要太甜',
        example_ko: '설탕 적게 넣어주세요',
        example_zh: '请少放糖',
        example_pronunciation: 'seoltang jeokge neoeoejuseyo',
        unsplash: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=400&h=200&fit=crop&q=80'
      }
    ],
    size: [
      {
        id: 'tall',
        ko: '톨 사이즈로 주세요',
        pronunciation: 'tol sa-i-jeu-ro ju-se-yo',
        zh: '请给我中杯',
        example_ko: '가장 작은 사이즈로 주세요',
        example_zh: '请给我最小杯',
        example_pronunciation: 'gajang jageun saijero juseyo',
        unsplash: 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=400&h=200&fit=crop&q=80'
      },
      {
        id: 'grande',
        ko: '그란데로 주세요',
        pronunciation: 'geu-ran-de-ro ju-se-yo',
        zh: '请给我大杯',
        example_ko: '중간 사이즈로 주세요',
        example_zh: '请给我中杯',
        example_pronunciation: 'junggan saijero juseyo',
        unsplash: 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=400&h=200&fit=crop&q=80'
      },
      {
        id: 'venti',
        ko: '벤티로 주세요',
        pronunciation: 'ben-ti-ro ju-se-yo',
        zh: '请给我超大杯',
        example_ko: '가장 큰 사이즈로 주세요',
        example_zh: '请给我最大杯',
        example_pronunciation: 'gajang keun saijero juseyo',
        unsplash: 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=400&h=200&fit=crop&q=80'
      }
    ],
    options: [
      {
        id: 'ice_less',
        ko: '얼음 적게 해주세요',
        pronunciation: 'eol-eum jeok-ge hae-ju-se-yo',
        zh: '请少放冰',
        example_ko: '얼음 반만 넣어주세요',
        example_zh: '请放一半冰',
        example_pronunciation: 'eoreum banman neoeoejuseyo',
        unsplash: 'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=400&h=200&fit=crop&q=80'
      },
      {
        id: 'extra_shot',
        ko: '샷 추가해주세요',
        pronunciation: 'syat chu-ga-hae-ju-se-yo',
        zh: '请加一份浓缩',
        example_ko: '에스프레소 샷 하나 더 추가요',
        example_zh: '请多加一份浓缩咖啡',
        example_pronunciation: 'eseupeureso syat hana deo chugayo',
        unsplash: 'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=400&h=200&fit=crop&q=80'
      },
      {
        id: 'decaf',
        ko: '디카페인으로 주세요',
        pronunciation: 'di-ka-pe-in-eu-ro ju-se-yo',
        zh: '请给我无咖啡因的',
        example_ko: '카페인 없는 걸로 주세요',
        example_zh: '请给我无咖啡因的',
        example_pronunciation: 'kapein eomneun geollo juseyo',
        unsplash: 'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=400&h=200&fit=crop&q=80'
      },
      {
        id: 'soy_milk',
        ko: '두유로 바꿔주세요',
        pronunciation: 'du-yu-ro ba-kwo-ju-se-yo',
        zh: '请换成豆浆',
        example_ko: '우유 대신 두유로 해주세요',
        example_zh: '请用豆浆代替牛奶',
        example_pronunciation: 'uyu daesin duyuro haejuseyo',
        unsplash: 'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=400&h=200&fit=crop&q=80'
      }
    ],
    packaging: [
      {
        id: 'takeout',
        ko: '포장해주세요',
        pronunciation: 'po-jang-hae-ju-se-yo',
        zh: '请打包',
        example_ko: '테이크아웃으로 할게요',
        example_zh: '我要带走',
        example_pronunciation: 'teikeusautes-euro halgeyo',
        unsplash: 'https://images.unsplash.com/photo-1521017432531-fbd92d768814?w=400&h=200&fit=crop&q=80'
      },
      {
        id: 'here',
        ko: '여기서 마실게요',
        pronunciation: 'yeo-gi-seo ma-sil-ge-yo',
        zh: '我在这里喝',
        example_ko: '매장에서 마시겠어요',
        example_zh: '我在店里喝',
        example_pronunciation: 'maejang-eseo masigesseyo',
        unsplash: 'https://images.unsplash.com/photo-1521017432531-fbd92d768814?w=400&h=200&fit=crop&q=80'
      },
      {
        id: 'carrier',
        ko: '캐리어 주세요',
        pronunciation: 'kae-ri-eo ju-se-yo',
        zh: '请给我托盘',
        example_ko: '음료 여러 개라서 캐리어 주세요',
        example_zh: '饮料比较多请给我托盘',
        example_pronunciation: 'eumryo yeoreo gaeraseo kaerieo juseyo',
        unsplash: 'https://images.unsplash.com/photo-1521017432531-fbd92d768814?w=400&h=200&fit=crop&q=80'
      }
    ],
    wifi: [
      {
        id: 'wifi_password',
        ko: '와이파이 비밀번호 뭐예요?',
        pronunciation: 'wa-i-pa-i bi-mil-beon-ho mwo-ye-yo',
        zh: 'WiFi密码是什么？',
        example_ko: 'WiFi 패스워드 알려주세요',
        example_zh: '请告诉我WiFi密码',
        example_pronunciation: 'WiFi paseuwodeu allyeojuseyo',
        unsplash: 'https://images.unsplash.com/photo-1432821596592-e2c18b78144f?w=400&h=200&fit=crop&q=80'
      },
      {
        id: 'wifi_slow',
        ko: '와이파이가 느려요',
        pronunciation: 'wa-i-pa-i-ga neu-ryeo-yo',
        zh: 'WiFi很慢',
        example_ko: '인터넷이 안 돼요',
        example_zh: '网络不行',
        example_pronunciation: 'inteonesi an dwaeyo',
        unsplash: 'https://images.unsplash.com/photo-1432821596592-e2c18b78144f?w=400&h=200&fit=crop&q=80'
      },
      {
        id: 'charging',
        ko: '충전할 수 있어요?',
        pronunciation: 'chung-jeon-hal su iss-eo-yo',
        zh: '可以充电吗？',
        example_ko: '콘센트 있는 자리 있어요?',
        example_zh: '有插座的位置吗？',
        example_pronunciation: 'konsenteu inneun jari isseoyo?',
        unsplash: 'https://images.unsplash.com/photo-1432821596592-e2c18b78144f?w=400&h=200&fit=crop&q=80'
      }
    ],
    culture: [
      {
        id: 'cafe_hopping',
        ko: '카페 투어하고 있어요',
        pronunciation: 'ka-pe tu-eo-ha-go iss-eo-yo',
        zh: '我在进行咖啡厅巡游',
        example_ko: '이 동네 카페들을 돌아보고 있어요',
        example_zh: '我在看这个地区的咖啡厅',
        example_pronunciation: 'i dongne kapedeuleul dorabogo isseoyo',
        unsplash: 'https://images.unsplash.com/photo-1493857671505-72967e2e2760?w=400&h=200&fit=crop&q=80'
      },
      {
        id: 'instagram_spot',
        ko: '사진 찍기 좋은 곳이에요',
        pronunciation: 'sa-jin jjik-gi jo-eun gos-i-e-yo',
        zh: '这里很适合拍照',
        example_ko: '인스타그램용 사진 찍으러 왔어요',
        example_zh: '我来拍Instagram照片',
        example_pronunciation: 'inseutageuramyong sajin jjigeureo wasseyo',
        unsplash: 'https://images.unsplash.com/photo-1493857671505-72967e2e2760?w=400&h=200&fit=crop&q=80'
      },
      {
        id: 'slow_life',
        ko: '여유롭게 시간을 보내고 싶어요',
        pronunciation: 'yeo-yu-rop-ge si-gan-eul bo-nae-go si-peo-yo',
        zh: '想悠闲地度过时间',
        example_ko: '조용히 책 읽으면서 쉬고 싶어요',
        example_zh: '想安静地看书休息',
        example_pronunciation: 'joyonghi chaek ilgeumyeonseo swigo sipeoyo',
        unsplash: 'https://images.unsplash.com/photo-1493857671505-72967e2e2760?w=400&h=200&fit=crop&q=80'
      }
    ],
    study: [
      {
        id: 'study_cafe',
        ko: '스터디카페 이용하고 싶어요',
        pronunciation: 'seu-teo-di-ka-pe i-yong-ha-go si-peo-yo',
        zh: '我想利用学习咖啡厅',
        example_ko: '공부할 수 있는 자리 있어요?',
        example_zh: '有可以学习的位置吗？',
        example_pronunciation: 'gongbuhal su inneun jari isseoyo?',
        unsplash: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=200&fit=crop&q=80'
      },
      {
        id: 'quiet_zone',
        ko: '조용한 자리로 주세요',
        pronunciation: 'jo-yong-han ja-ri-ro ju-se-yo',
        zh: '请给我安静的位置',
        example_ko: '독서실처럼 조용한 곳 있어요?',
        example_zh: '有像读书室一样安静的地方吗？',
        example_pronunciation: 'dokseosil-cheoreom joyonghan got isseoyo?',
        unsplash: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=200&fit=crop&q=80'
      },
      {
        id: 'time_limit',
        ko: '시간 제한이 있어요?',
        pronunciation: 'si-gan je-han-i iss-eo-yo',
        zh: '有时间限制吗？',
        example_ko: '몇 시간까지 앉아있을 수 있어요?',
        example_zh: '可以坐几个小时？',
        example_pronunciation: 'myeot sigandkkaji anjaiseul su isseoyo?',
        unsplash: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=200&fit=crop&q=80'
      }
    ],
    chains: [
      {
        id: 'starbucks',
        ko: '스타벅스가 어디에 있어요?',
        pronunciation: 'seu-ta-beok-seu-ga eo-di-e iss-eo-yo',
        zh: '星巴克在哪里？',
        example_ko: '가장 가까운 스타벅스는 어디예요?',
        example_zh: '最近的星巴克在哪里？',
        example_pronunciation: 'gajang gakkaun seuatabeokseun eodiyeyo?',
        unsplash: 'https://images.unsplash.com/photo-1521017432531-fbd92d768814?w=400&h=200&fit=crop&q=80'
      },
      {
        id: 'ediya',
        ko: '이디야는 저렴해요',
        pronunciation: 'i-di-ya-neun jeo-ryeo-mae-yo',
        zh: 'EDIYA很便宜',
        example_ko: '이디야 커피는 가성비가 좋아요',
        example_zh: 'EDIYA咖啡性价比很好',
        example_pronunciation: 'idiya keopineun gaseongbiga joayo',
        unsplash: 'https://images.unsplash.com/photo-1521017432531-fbd92d768814?w=400&h=200&fit=crop&q=80'
      },
      {
        id: 'twosome',
        ko: '투썸플레이스는 케이크가 맛있어요',
        pronunciation: 'tu-sseom-peul-le-i-seu-neun ke-i-keu-ga ma-siss-eo-yo',
        zh: 'A TWOSOME PLACE的蛋糕很好吃',
        example_ko: '투썸의 디저트를 추천해요',
        example_zh: '我推荐投썸的甜点',
        example_pronunciation: 'tuseome dijeogeul chucheonhaeyo',
        unsplash: 'https://images.unsplash.com/photo-1521017432531-fbd92d768814?w=400&h=200&fit=crop&q=80'
      },
      {
        id: 'mega_coffee',
        ko: '메가커피는 용량이 커요',
        pronunciation: 'me-ga-keo-pi-neun yong-ryang-i keo-yo',
        zh: 'MEGA COFFEE分量很大',
        example_ko: '메가커피는 양이 많고 저렴해요',
        example_zh: 'MEGA COFFEE分量多又便宜',
        example_pronunciation: 'megakeopineun yangi manko jeoryeomhaeyo',
        unsplash: 'https://images.unsplash.com/photo-1521017432531-fbd92d768814?w=400&h=200&fit=crop&q=80'
      }
    ]
  }

  // 그라데이션 클래스 매핑
  const getGradientClass = (tabId) => {
    const gradientMap = {
      order: 'bg-gradient-to-br from-amber-100 to-orange-200',
      size: 'bg-gradient-to-br from-blue-100 to-indigo-200',
      options: 'bg-gradient-to-br from-green-100 to-emerald-200',
      packaging: 'bg-gradient-to-br from-purple-100 to-violet-200',
      wifi: 'bg-gradient-to-br from-cyan-100 to-blue-200',
      culture: 'bg-gradient-to-br from-pink-100 to-rose-200',
      study: 'bg-gradient-to-br from-teal-100 to-cyan-200',
      chains: 'bg-gradient-to-br from-orange-100 to-red-200'
    }
    return gradientMap[tabId] || 'bg-gradient-to-br from-gray-100 to-gray-200'
  }

  // 아이콘 매핑
  const getIcon = (tabId) => {
    const iconMap = {
      order: Coffee,
      size: Coffee,
      options: Coffee,
      packaging: Package,
      wifi: Wifi,
      culture: Star,
      study: Book,
      chains: Smartphone
    }
    return iconMap[tabId] || Coffee
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
          {/* 카카오맵 - 주변 카페 찾기 */}
          <button
            onClick={() => openKakaoMap('주변 카페')}
            className="flex items-center justify-between p-3 bg-yellow-50 border border-yellow-200 rounded-lg hover:bg-yellow-100 transition-colors"
          >
            <div className="flex items-center gap-3">
              <MapPin size={20} className="text-yellow-600" />
              <div className="text-left">
                <p className="font-medium text-gray-800">
                  {L(lang, { ko: '주변 카페 찾기', zh: '寻找附近咖啡厅', en: 'Find nearby cafes' })}
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
      <div className="text-xs text-gray-500 bg-amber-50 p-3 rounded-lg mt-6">
        ☕ {L(lang, { 
          ko: '한국 카페에서는 주문 후 진동벨을 받고 기다립니다. 플래시카드를 탭하면 한국어가 복사됩니다.', 
          zh: '在韩国咖啡厅点单后会收到震动器等待。点击卡片复制韩语。', 
          en: 'In Korean cafes, you receive a buzzer after ordering and wait. Tap cards to copy Korean text.' 
        })}
      </div>
    </div>
  )
}