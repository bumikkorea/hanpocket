import { useState } from 'react'
import { Coffee, Package, Wifi, Star, Book, Smartphone, Bookmark } from 'lucide-react'
import KoreanPhraseCard, { useKoreanPocket } from './KoreanPhraseCard'

const L = (lang, text) => text[lang] || text['ko']

export default function CafePocket({ lang }) {
  const [activeTab, setActiveTab] = useState('order')
  const { bookmarkedCards, toastMessage, copyToClipboard, speak, toggleBookmark } = useKoreanPocket('cafe_bookmarks')

  const tabs = [
    { id: 'order', name: { ko: '주문', zh: '点单', en: 'Order' }, icon: Coffee },
    { id: 'size', name: { ko: '사이즈', zh: '尺寸', en: 'Size' }, icon: Coffee },
    { id: 'options', name: { ko: '옵션', zh: '选项', en: 'Options' }, icon: Coffee },
    { id: 'packaging', name: { ko: '포장', zh: '打包', en: 'Packaging' }, icon: Package },
    { id: 'wifi', name: { ko: '와이파이', zh: 'WiFi', en: 'WiFi' }, icon: Wifi },
    { id: 'culture', name: { ko: '카페문화', zh: '咖啡文化', en: 'Cafe Culture' }, icon: Star },
    { id: 'study', name: { ko: '스터디카페', zh: '学习咖啡厅', en: 'Study Cafe' }, icon: Book },
    { id: 'chains', name: { ko: '유명체인', zh: '知名连锁', en: 'Famous Chains' }, icon: Smartphone },
    { id: 'saved', name: { ko: '저장한 표현', zh: '收藏表达', en: 'Saved' }, icon: Bookmark }
  ]

  const cardData = {
    order: [
      {
        id: 'americano',
        ko: '아메리카노 주세요',
        pronunciation: 'a-me-ri-ka-no ju-se-yo',
        zh: '请给我美式咖啡',
        example_ko: '아이스 아메리카노 하나 주세요',
        example_zh: '请给我一杯冰美式咖啡',
        example_pronunciation: 'aiseu amerikano hana juseyo'
      },
      {
        id: 'latte',
        ko: '라떼 주세요',
        pronunciation: 'ra-tte ju-se-yo',
        zh: '请给我拿铁',
        example_ko: '카페라떼 그란데로 주세요',
        example_zh: '请给我一杯大杯咖啡拿铁',
        example_pronunciation: 'kaperatte geurandero juseyo'
      },
      {
        id: 'recommend',
        ko: '추천 메뉴 뭐예요?',
        pronunciation: 'chu-cheon me-nyu mwo-ye-yo',
        zh: '推荐什么饮品？',
        example_ko: '시그니처 메뉴 추천해주세요',
        example_zh: '请推荐招牌饮品',
        example_pronunciation: 'sigeuniceo menyu chucheonhaejuseyo'
      },
      {
        id: 'sweet_less',
        ko: '달지 않게 해주세요',
        pronunciation: 'dal-ji an-ge hae-ju-se-yo',
        zh: '请不要太甜',
        example_ko: '설탕 적게 넣어주세요',
        example_zh: '请少放糖',
        example_pronunciation: 'seoltang jeokge neoeoejuseyo'
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
        example_pronunciation: 'gajang jageun saijero juseyo'
      },
      {
        id: 'grande',
        ko: '그란데로 주세요',
        pronunciation: 'geu-ran-de-ro ju-se-yo',
        zh: '请给我大杯',
        example_ko: '중간 사이즈로 주세요',
        example_zh: '请给我中杯',
        example_pronunciation: 'junggan saijero juseyo'
      },
      {
        id: 'venti',
        ko: '벤티로 주세요',
        pronunciation: 'ben-ti-ro ju-se-yo',
        zh: '请给我超大杯',
        example_ko: '가장 큰 사이즈로 주세요',
        example_zh: '请给我最大杯',
        example_pronunciation: 'gajang keun saijero juseyo'
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
        example_pronunciation: 'eoreum banman neoeoejuseyo'
      },
      {
        id: 'extra_shot',
        ko: '샷 추가해주세요',
        pronunciation: 'syat chu-ga-hae-ju-se-yo',
        zh: '请加一份浓缩',
        example_ko: '에스프레소 샷 하나 더 추가요',
        example_zh: '请多加一份浓缩咖啡',
        example_pronunciation: 'eseupeureso syat hana deo chugayo'
      },
      {
        id: 'decaf',
        ko: '디카페인으로 주세요',
        pronunciation: 'di-ka-pe-in-eu-ro ju-se-yo',
        zh: '请给我无咖啡因的',
        example_ko: '카페인 없는 걸로 주세요',
        example_zh: '请给我无咖啡因的',
        example_pronunciation: 'kapein eomneun geollo juseyo'
      },
      {
        id: 'soy_milk',
        ko: '두유로 바꿔주세요',
        pronunciation: 'du-yu-ro ba-kwo-ju-se-yo',
        zh: '请换成豆浆',
        example_ko: '우유 대신 두유로 해주세요',
        example_zh: '请用豆浆代替牛奶',
        example_pronunciation: 'uyu daesin duyuro haejuseyo'
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
        example_pronunciation: 'teikeusautes-euro halgeyo'
      },
      {
        id: 'here',
        ko: '여기서 마실게요',
        pronunciation: 'yeo-gi-seo ma-sil-ge-yo',
        zh: '我在这里喝',
        example_ko: '매장에서 마시겠어요',
        example_zh: '我在店里喝',
        example_pronunciation: 'maejang-eseo masigesseyo'
      },
      {
        id: 'carrier',
        ko: '캐리어 주세요',
        pronunciation: 'kae-ri-eo ju-se-yo',
        zh: '请给我托盘',
        example_ko: '음료 여러 개라서 캐리어 주세요',
        example_zh: '饮料比较多请给我托盘',
        example_pronunciation: 'eumryo yeoreo gaeraseo kaerieo juseyo'
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
        example_pronunciation: 'WiFi paseuwodeu allyeojuseyo'
      },
      {
        id: 'wifi_slow',
        ko: '와이파이가 느려요',
        pronunciation: 'wa-i-pa-i-ga neu-ryeo-yo',
        zh: 'WiFi很慢',
        example_ko: '인터넷이 안 돼요',
        example_zh: '网络不行',
        example_pronunciation: 'inteonesi an dwaeyo'
      },
      {
        id: 'charging',
        ko: '충전할 수 있어요?',
        pronunciation: 'chung-jeon-hal su iss-eo-yo',
        zh: '可以充电吗？',
        example_ko: '콘센트 있는 자리 있어요?',
        example_zh: '有插座的位置吗？',
        example_pronunciation: 'konsenteu inneun jari isseoyo?'
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
        example_pronunciation: 'i dongne kapedeuleul dorabogo isseoyo'
      },
      {
        id: 'instagram_spot',
        ko: '사진 찍기 좋은 곳이에요',
        pronunciation: 'sa-jin jjik-gi jo-eun gos-i-e-yo',
        zh: '这里很适合拍照',
        example_ko: '인스타그램용 사진 찍으러 왔어요',
        example_zh: '我来拍Instagram照片',
        example_pronunciation: 'inseutageuramyong sajin jjigeureo wasseyo'
      },
      {
        id: 'slow_life',
        ko: '여유롭게 시간을 보내고 싶어요',
        pronunciation: 'yeo-yu-rop-ge si-gan-eul bo-nae-go si-peo-yo',
        zh: '想悠闲地度过时间',
        example_ko: '조용히 책 읽으면서 쉬고 싶어요',
        example_zh: '想安静地看书休息',
        example_pronunciation: 'joyonghi chaek ilgeumyeonseo swigo sipeoyo'
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
        example_pronunciation: 'gongbuhal su inneun jari isseoyo?'
      },
      {
        id: 'quiet_zone',
        ko: '조용한 자리로 주세요',
        pronunciation: 'jo-yong-han ja-ri-ro ju-se-yo',
        zh: '请给我安静的位置',
        example_ko: '독서실처럼 조용한 곳 있어요?',
        example_zh: '有像读书室一样安静的地方吗？',
        example_pronunciation: 'dokseosil-cheoreom joyonghan got isseoyo?'
      },
      {
        id: 'time_limit',
        ko: '시간 제한이 있어요?',
        pronunciation: 'si-gan je-han-i iss-eo-yo',
        zh: '有时间限制吗？',
        example_ko: '몇 시간까지 앉아있을 수 있어요?',
        example_zh: '可以坐几个小时？',
        example_pronunciation: 'myeot sigandkkaji anjaiseul su isseoyo?'
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
        example_pronunciation: 'gajang gakkaun seuatabeokseun eodiyeyo?'
      },
      {
        id: 'ediya',
        ko: '이디야는 저렴해요',
        pronunciation: 'i-di-ya-neun jeo-ryeo-mae-yo',
        zh: 'EDIYA很便宜',
        example_ko: '이디야 커피는 가성비가 좋아요',
        example_zh: 'EDIYA咖啡性价比很好',
        example_pronunciation: 'idiya keopineun gaseongbiga joayo'
      },
      {
        id: 'twosome',
        ko: '투썸플레이스는 케이크가 맛있어요',
        pronunciation: 'tu-sseom-peul-le-i-seu-neun ke-i-keu-ga ma-siss-eo-yo',
        zh: 'A TWOSOME PLACE的蛋糕很好吃',
        example_ko: '투썸의 디저트를 추천해요',
        example_zh: '我推荐投썸的甜点',
        example_pronunciation: 'tuseome dijeogeul chucheonhaeyo'
      },
      {
        id: 'mega_coffee',
        ko: '메가커피는 용량이 커요',
        pronunciation: 'me-ga-keo-pi-neun yong-ryang-i keo-yo',
        zh: 'MEGA COFFEE分量很大',
        example_ko: '메가커피는 양이 많고 저렴해요',
        example_zh: 'MEGA COFFEE分量多又便宜',
        example_pronunciation: 'megakeopineun yangi manko jeoryeomhaeyo'
      }
    ]
  }

  const currentCards = activeTab === 'saved'
    ? Object.values(cardData).flat().filter(c => bookmarkedCards.includes(c.id))
    : cardData[activeTab] || []

  return (
    <div className="space-y-4">
      {/* 토스트 메시지 */}
      {toastMessage && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-black text-white px-4 py-2 rounded-full text-sm">
          {toastMessage}
        </div>
      )}

      {/* 소주제 탭 - 가로 스크롤 */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-full text-xs font-medium shrink-0 transition ${
              activeTab === tab.id
                ? 'bg-[#111827] text-white'
                : 'bg-gray-100 text-gray-600'
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

      {/* 저장한 표현 없을 때 */}
      {currentCards.length === 0 && activeTab === 'saved' && (
        <div className="text-center py-12 text-sm text-gray-400">
          {L(lang, { ko: '저장한 표현이 없습니다', zh: '暂无收藏', en: 'No saved phrases' })}
        </div>
      )}

      {/* 카드 렌더링 */}
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
            illustration="cafe"
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
