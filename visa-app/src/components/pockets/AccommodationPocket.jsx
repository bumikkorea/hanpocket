import { useState } from 'react'
import { DoorOpen, MessageCircle, AlertTriangle, Clock, Home, Luggage, Bookmark } from 'lucide-react'
import KoreanPhraseCard, { useKoreanPocket } from './KoreanPhraseCard'

const L = (lang, text) => text[lang] || text['ko']

export default function AccommodationPocket({ lang = 'ko' }) {
  const [activeTab, setActiveTab] = useState('checkin')
  const { bookmarkedCards, toastMessage, copyToClipboard, speak, toggleBookmark } = useKoreanPocket('accommodation_bookmarks')

  const tabs = [
    { id: 'checkin', name: { ko: '체크인/아웃', zh: '入住/退房', en: 'Check-in/out' }, icon: DoorOpen },
    { id: 'requests', name: { ko: '요청사항', zh: '要求事项', en: 'Requests' }, icon: MessageCircle },
    { id: 'problems', name: { ko: '문제신고', zh: '问题报告', en: 'Problems' }, icon: AlertTriangle },
    { id: 'extension', name: { ko: '연장', zh: '延长', en: 'Extension' }, icon: Clock },
    { id: 'airbnb', name: { ko: '에어비앤비', zh: '爱彼迎', en: 'Airbnb' }, icon: Home },
    { id: 'luggage', name: { ko: '짐 보관', zh: '行李寄存', en: 'Luggage' }, icon: Luggage },
    { id: 'saved', name: { ko: '저장한 표현', zh: '收藏表达', en: 'Saved' }, icon: Bookmark }
  ]

  const cardData = {
    checkin: [
      {
        id: 'acc_checkin_1',
        korean: '체크인 하려고 왔어요',
        romanization: 'chekeu-in haryeogo wasseoyo',
        chinese: '我来办理入住',
        exampleKo: '예약 확인서 여기 있어요',
        exampleZh: '预订确认书在这里'
      },
      {
        id: 'acc_checkin_2',
        korean: '체크아웃 하려고 해요',
        romanization: 'chekeu-auseu haryeogo haeyo',
        chinese: '我要办理退房',
        exampleKo: '짐 맡길 수 있어요?',
        exampleZh: '可以寄存行李吗？'
      },
      {
        id: 'acc_checkin_3',
        korean: '방 열쇠 주세요',
        romanization: 'bang yeolsoe juseyo',
        chinese: '请给我房间钥匙',
        exampleKo: '카드키가 안 돼요',
        exampleZh: '房卡不能用'
      },
      {
        id: 'acc_checkin_4',
        korean: '늦은 체크인 가능해요?',
        romanization: 'neujeun chekeu-in ganeunghaeyo?',
        chinese: '可以晚点入住吗？',
        exampleKo: '몇 시까지 가능해요?',
        exampleZh: '最晚几点可以？'
      }
    ],
    requests: [
      {
        id: 'acc_req_1',
        korean: '수건 더 주실 수 있어요?',
        romanization: 'sugeon deo jusil su isseoyo?',
        chinese: '可以多给些毛巾吗？',
        exampleKo: '베개 하나 더 주세요',
        exampleZh: '请多给一个枕头'
      },
      {
        id: 'acc_req_2',
        korean: '방 청소 부탁해요',
        romanization: 'bang cheongso butakhaeyo',
        chinese: '请帮忙打扫房间',
        exampleKo: '언제 청소해주시나요?',
        exampleZh: '什么时候打扫？'
      },
      {
        id: 'acc_req_3',
        korean: '조식 포함인가요?',
        romanization: 'josik poham-ingayo?',
        chinese: '包含早餐吗？',
        exampleKo: '몇 시부터 몇 시까지요?',
        exampleZh: '几点到几点？'
      },
      {
        id: 'acc_req_4',
        korean: 'WiFi 비밀번호 알려주세요',
        romanization: 'WiFi bimilbeonho allyeojuseyo',
        chinese: '请告诉我WiFi密码',
        exampleKo: 'WiFi가 안 돼요',
        exampleZh: 'WiFi连不上'
      }
    ],
    problems: [
      {
        id: 'acc_prob_1',
        korean: '에어컨이 안 돼요',
        romanization: 'eeokeoni an dwaeyo',
        chinese: '空调坏了',
        exampleKo: '너무 더워요',
        exampleZh: '太热了'
      },
      {
        id: 'acc_prob_2',
        korean: '온수가 안 나와요',
        romanization: 'onsu-ga an nawayo',
        chinese: '没有热水',
        exampleKo: '샤워할 수 없어요',
        exampleZh: '不能洗澡'
      },
      {
        id: 'acc_prob_3',
        korean: '방이 너무 시끄러워요',
        romanization: 'bang-i neomu sikkeureowo-yo',
        chinese: '房间太吵了',
        exampleKo: '옆 방이 시끄러워요',
        exampleZh: '隔壁房间很吵'
      },
      {
        id: 'acc_prob_4',
        korean: '전등이 안 켜져요',
        romanization: 'jeondeung-i an kyeojyeoyo',
        chinese: '灯不亮',
        exampleKo: '전구를 바꿔주세요',
        exampleZh: '请换个灯泡'
      }
    ],
    extension: [
      {
        id: 'acc_ext_1',
        korean: '하루 더 머무를 수 있어요?',
        romanization: 'haru deo meomureul su isseoyo?',
        chinese: '可以多住一天吗？',
        exampleKo: '같은 방에서 머물고 싶어요',
        exampleZh: '想住同一个房间'
      },
      {
        id: 'acc_ext_2',
        korean: '체크아웃 시간 연장 가능해요?',
        romanization: 'chekeu-auseu sigan yeonjang ganeunghaeyo?',
        chinese: '可以延迟退房吗？',
        exampleKo: '한 시간만 더요',
        exampleZh: '只要多一个小时'
      },
      {
        id: 'acc_ext_3',
        korean: '일주일 더 머물고 싶어요',
        romanization: 'iljuil deo meomulgo sipeoyo',
        chinese: '想多住一周',
        exampleKo: '장기 할인 있어요?',
        exampleZh: '有长期折扣吗？'
      }
    ],
    airbnb: [
      {
        id: 'acc_airbnb_1',
        korean: '호스트에게 연락하고 싶어요',
        romanization: 'hoseuteu-ege yeonrak-hago sipeoyo',
        chinese: '我想联系房东',
        exampleKo: '문제가 있어요',
        exampleZh: '有问题'
      },
      {
        id: 'acc_airbnb_2',
        korean: '셀프 체크인이에요?',
        romanization: 'selpeu chekeu-in-ieyo?',
        chinese: '是自助入住吗？',
        exampleKo: '키박스 비밀번호 알려주세요',
        exampleZh: '请告诉我密码箱密码'
      },
      {
        id: 'acc_airbnb_3',
        korean: '주방 사용해도 돼요?',
        romanization: 'jubang sayong-haedo dwaeyo?',
        chinese: '可以使用厨房吗？',
        exampleKo: '요리해도 돼요?',
        exampleZh: '可以做菜吗？'
      }
    ],
    luggage: [
      {
        id: 'acc_lug_1',
        korean: '짐 맡길 수 있어요?',
        romanization: 'jjim matgil su isseoyo?',
        chinese: '可以寄存行李吗？',
        exampleKo: '몇 시까지요?',
        exampleZh: '到几点？'
      },
      {
        id: 'acc_lug_2',
        korean: '체크아웃 후에도 맡길 수 있어요?',
        romanization: 'chekeu-auseu hue-do matgil su isseoyo?',
        chinese: '退房后还能寄存吗？',
        exampleKo: '저녁에 가져갈게요',
        exampleZh: '晚上来拿'
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
            korean={card.korean}
            romanization={card.romanization}
            chinese={card.chinese}
            exampleKo={card.exampleKo}
            exampleZh={card.exampleZh}
            exampleRoman={card.exampleRoman}
            illustration="accommodation"
            onCopy={() => copyToClipboard(card.korean + '\n' + (card.exampleKo || ''), lang)}
            onSpeak={() => speak(card.korean)}
            onBookmark={() => toggleBookmark(card.id)}
            bookmarked={bookmarkedCards.includes(card.id)}
            lang={lang}
          />
        ))}
      </div>
    </div>
  )
}
