import { useState } from 'react'
import { Plus, Minus, Copy } from 'lucide-react'

// 다국어 헬퍼 함수
const L = (lang, text) => text[lang] || text['ko']

export default function RestaurantPocket({ lang }) {
  const [peopleCount, setPeopleCount] = useState(2)
  const [selectedAllergies, setSelectedAllergies] = useState([])
  const [toastMessage, setToastMessage] = useState('')

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

  // 알레르기 선택 토글
  const toggleAllergy = (allergy) => {
    setSelectedAllergies(prev => 
      prev.includes(allergy) 
        ? prev.filter(a => a !== allergy)
        : [...prev, allergy]
    )
  }

  // 알레르기 문장 생성
  const generateAllergyText = () => {
    if (selectedAllergies.length === 0) return ''
    const allergyTexts = {
      ko: selectedAllergies.map(a => {
        const map = {
          peanut: '땅콩', seafood: '해산물', dairy: '유제품', 
          wheat: '밀가루', egg: '계란'
        }
        return map[a] || a
      }),
      zh: selectedAllergies.map(a => {
        const map = {
          peanut: '花生', seafood: '海鲜', dairy: '乳制品', 
          wheat: '面粉', egg: '鸡蛋'
        }
        return map[a] || a
      }),
      en: selectedAllergies.map(a => {
        const map = {
          peanut: 'peanuts', seafood: 'seafood', dairy: 'dairy', 
          wheat: 'wheat', egg: 'eggs'
        }
        return map[a] || a
      })
    }
    
    const allergyList = allergyTexts[lang].join(', ')
    return {
      ko: `${allergyList} 못 먹어요`,
      zh: `不能吃${allergyList}`,
      en: `I can't eat ${allergyList}`
    }[lang]
  }

  // 식당 표현 데이터
  const expressions = {
    entrance: {
      title: { ko: '입장', zh: '入店', en: 'Entrance' },
      items: [
        {
          ko: `${peopleCount}명이요`,
          zh: `${peopleCount}个人`,
          en: `${peopleCount} people`,
          pronunciation: `${peopleCount}-myeong-i-yo`
        }
      ]
    },
    ordering: {
      title: { ko: '주문', zh: '点餐', en: 'Ordering' },
      items: [
        {
          ko: '이거 주세요',
          zh: '要这个',
          en: 'I want this',
          pronunciation: 'i-geo ju-se-yo'
        },
        {
          ko: '추천 메뉴 뭐예요?',
          zh: '推荐菜是什么？',
          en: 'What do you recommend?',
          pronunciation: 'chu-cheon me-nyu mwo-ye-yo'
        },
        {
          ko: '매운 거 빼주세요',
          zh: '不要放辣的',
          en: 'No spicy please',
          pronunciation: 'mae-un geo ppae-ju-se-yo'
        },
        {
          ko: '덜 맵게 해주세요',
          zh: '少放点辣',
          en: 'Make it less spicy',
          pronunciation: 'deol maep-ge hae-ju-se-yo'
        }
      ]
    },
    payment: {
      title: { ko: '계산', zh: '结账', en: 'Payment' },
      items: [
        {
          ko: '계산이요',
          zh: '买单',
          en: 'Check please',
          pronunciation: 'gye-san-i-yo'
        },
        {
          ko: '카드 돼요?',
          zh: '可以刷卡吗？',
          en: 'Can I pay by card?',
          pronunciation: 'ka-deu dwae-yo'
        },
        {
          ko: '영수증 주세요',
          zh: '请给我收据',
          en: 'Receipt please',
          pronunciation: 'yeong-su-jeung ju-se-yo'
        },
        {
          ko: '따로따로 계산해주세요',
          zh: '分开结账',
          en: 'Separate bills please',
          pronunciation: 'tta-ro-tta-ro gye-san-hae-ju-se-yo'
        }
      ]
    }
  }

  // 알레르기 항목
  const allergies = [
    { id: 'peanut', name: { ko: '땅콩', zh: '花生', en: 'Peanut' } },
    { id: 'seafood', name: { ko: '해산물', zh: '海鲜', en: 'Seafood' } },
    { id: 'dairy', name: { ko: '유제품', zh: '乳制品', en: 'Dairy' } },
    { id: 'wheat', name: { ko: '밀가루', zh: '面粉', en: 'Wheat' } },
    { id: 'egg', name: { ko: '계란', zh: '鸡蛋', en: 'Egg' } }
  ]

  return (
    <div className="space-y-4" style={{ fontFamily: 'Inter, sans-serif' }}>
      {/* 토스트 메시지 */}
      {toastMessage && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white px-4 py-2 rounded-lg text-sm z-50">
          {toastMessage}
        </div>
      )}

      {/* 인원 수 선택 */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <h3 className="font-semibold text-gray-800 mb-3">
          {L(lang, { ko: '인원 수', zh: '人数', en: 'Number of people' })}
        </h3>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setPeopleCount(Math.max(1, peopleCount - 1))}
            className="w-8 h-8 bg-white border border-gray-300 rounded-full flex items-center justify-center hover:bg-gray-100"
          >
            <Minus className="w-4 h-4 text-gray-600" />
          </button>
          <span className="text-lg font-semibold text-gray-800 min-w-[3rem] text-center">
            {peopleCount}
          </span>
          <button
            onClick={() => setPeopleCount(Math.min(10, peopleCount + 1))}
            className="w-8 h-8 bg-white border border-gray-300 rounded-full flex items-center justify-center hover:bg-gray-100"
          >
            <Plus className="w-4 h-4 text-gray-600" />
          </button>
        </div>
      </div>

      {/* 상황별 표현 */}
      {Object.entries(expressions).map(([key, section]) => (
        <div key={key} className="bg-gray-50 p-4 rounded-lg">
          <h3 className="font-semibold text-gray-800 mb-3">
            {L(lang, section.title)}
          </h3>
          <div className="space-y-2">
            {section.items.map((item, index) => (
              <button
                key={index}
                onClick={() => copyToClipboard(item[lang])}
                className="w-full p-3 bg-white border border-gray-200 rounded-lg text-left hover:bg-gray-100 transition-colors group"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="font-medium text-gray-800 mb-1">
                      {item[lang]}
                    </div>
                    <div className="text-sm text-gray-500">
                      {item.pronunciation}
                    </div>
                  </div>
                  <Copy className="w-4 h-4 text-gray-400 group-hover:text-gray-600" />
                </div>
              </button>
            ))}
          </div>
        </div>
      ))}

      {/* 알레르기 */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <h3 className="font-semibold text-gray-800 mb-3">
          {L(lang, { ko: '알레르기', zh: '过敏', en: 'Allergies' })}
        </h3>
        <div className="grid grid-cols-2 gap-2 mb-3">
          {allergies.map((allergy) => (
            <button
              key={allergy.id}
              onClick={() => toggleAllergy(allergy.id)}
              className={`p-2 rounded-lg border transition-colors ${
                selectedAllergies.includes(allergy.id)
                  ? 'bg-red-100 border-red-300 text-red-700'
                  : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-100'
              }`}
            >
              <div className="text-sm font-medium">
                {L(lang, allergy.name)}
              </div>
            </button>
          ))}
        </div>
        
        {/* 알레르기 문장 */}
        {selectedAllergies.length > 0 && (
          <button
            onClick={() => copyToClipboard(generateAllergyText())}
            className="w-full p-3 bg-white border border-gray-200 rounded-lg text-left hover:bg-gray-100 transition-colors group"
          >
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="font-medium text-gray-800">
                  {generateAllergyText()}
                </div>
              </div>
              <Copy className="w-4 h-4 text-gray-400 group-hover:text-gray-600" />
            </div>
          </button>
        )}
      </div>

      {/* 사용법 안내 */}
      <div className="text-xs text-gray-500 bg-blue-50 p-3 rounded-lg">
        💡 {L(lang, { 
          ko: '표현을 탭하면 클립보드에 복사됩니다', 
          zh: '点击表达即可复制到剪贴板', 
          en: 'Tap expressions to copy to clipboard' 
        })}
      </div>
    </div>
  )
}