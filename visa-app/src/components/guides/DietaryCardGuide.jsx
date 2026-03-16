import { useState, useRef, useCallback } from 'react'
import { Camera, Download, Check, AlertTriangle } from 'lucide-react'
import GuideLayout from './GuideLayout'

function L(lang, d) { 
  if (typeof d === 'string') return d
  return d?.[lang] || d?.en || d?.zh || d?.ko || '' 
}

const DIETARY_RESTRICTIONS = [
  {
    id: 'muslim',
    icon: '🕌',
    label: { ko: '무슬림', zh: '穆斯林', en: 'Muslim' },
    korean: '저는 무슬림입니다. 돼지고기와 술은 안 됩니다.',
    english: 'I am Muslim. No pork and no alcohol.',
    chinese: '我是穆斯林。不能吃猪肉和酒类。'
  },
  {
    id: 'nuts',
    icon: '🥜',
    label: { ko: '견과류 알레르기', zh: '坚果过敏', en: 'Nut Allergy' },
    korean: '저는 견과류 알레르기가 있습니다. 땅콩, 아몬드, 호두 안 됩니다.',
    english: 'I have nut allergies. No peanuts, almonds, or walnuts.',
    chinese: '我对坚果过敏。不能吃花生、杏仁、核桃。'
  },
  {
    id: 'seafood',
    icon: '🦐',
    label: { ko: '해산물 알레르기', zh: '海鲜过敏', en: 'Seafood Allergy' },
    korean: '저는 해산물 알레르기가 있습니다. 새우, 게, 생선 안 됩니다.',
    english: 'I have seafood allergies. No shrimp, crab, or fish.',
    chinese: '我对海鲜过敏。不能吃虾、蟹、鱼类。'
  },
  {
    id: 'dairy',
    icon: '🥛',
    label: { ko: '유제품 알레르기', zh: '乳制品过敏', en: 'Dairy Allergy' },
    korean: '저는 유제품 알레르기가 있습니다. 우유, 치즈, 버터 안 됩니다.',
    english: 'I have dairy allergies. No milk, cheese, or butter.',
    chinese: '我对乳制品过敏。不能吃牛奶、奶酪、黄油。'
  },
  {
    id: 'gluten',
    icon: '🌾',
    label: { ko: '글루텐 알레르기', zh: '面筋过敏', en: 'Gluten Allergy' },
    korean: '저는 글루텐 알레르기가 있습니다. 밀가루 음식 안 됩니다.',
    english: 'I have gluten allergies. No wheat-based foods.',
    chinese: '我对面筋过敏。不能吃小麦制品。'
  },
  {
    id: 'eggs',
    icon: '🥚',
    label: { ko: '달걀 알레르기', zh: '鸡蛋过敏', en: 'Egg Allergy' },
    korean: '저는 달걀 알레르기가 있습니다. 계란 들어간 음식 안 됩니다.',
    english: 'I have egg allergies. No foods containing eggs.',
    chinese: '我对鸡蛋过敏。不能吃含鸡蛋的食物。'
  },
  {
    id: 'vegetarian',
    icon: '🥬',
    label: { ko: '채식주의자', zh: '素食主义者', en: 'Vegetarian' },
    korean: '저는 채식주의자입니다. 고기와 생선은 안 됩니다.',
    english: 'I am vegetarian. No meat or fish.',
    chinese: '我是素食主义者。不吃肉类和鱼类。'
  },
  {
    id: 'vegan',
    icon: '🌱',
    label: { ko: '비건', zh: '纯素食者', en: 'Vegan' },
    korean: '저는 비건입니다. 모든 동물성 식품 안 됩니다.',
    english: 'I am vegan. No animal products at all.',
    chinese: '我是纯素食者。不吃任何动物制品。'
  }
]

const CARD_STYLES = [
  { id: 'simple', name: { ko: '심플', zh: '简约', en: 'Simple' }, bg: '#ffffff', text: '#000000', border: '#e5e7eb' },
  { id: 'urgent', name: { ko: '긴급', zh: '紧急', en: 'Urgent' }, bg: '#fef2f2', text: '#dc2626', border: '#fca5a5' },
  { id: 'green', name: { ko: '친화적', zh: '友好', en: 'Friendly' }, bg: '#f0fdf4', text: '#16a34a', border: '#86efac' },
  { id: 'blue', name: { ko: '전문적', zh: '专业', en: 'Professional' }, bg: '#eff6ff', text: '#2563eb', border: '#93c5fd' }
]

export default function DietaryCardGuide({ lang, onClose }) {
  const [selectedRestrictions, setSelectedRestrictions] = useState([])
  const [customText, setCustomText] = useState('')
  const [selectedStyle, setSelectedStyle] = useState('simple')
  const [showPreview, setShowPreview] = useState(false)
  const cardRef = useRef(null)

  const toggleRestriction = (id) => {
    setSelectedRestrictions(prev => 
      prev.includes(id) 
        ? prev.filter(item => item !== id)
        : [...prev, id]
    )
  }

  const handleCapture = useCallback(async () => {
    const el = cardRef.current
    if (!el) return

    try {
      const { default: html2canvas } = await import('https://cdn.jsdelivr.net/npm/html2canvas@1.4.1/+esm')
      const canvas = await html2canvas(el, {
        backgroundColor: '#ffffff',
        scale: 3,
        useCORS: true,
        logging: false
      })
      const link = document.createElement('a')
      link.download = 'dietary-card.png'
      link.href = canvas.toDataURL('image/png')
      link.click()
    } catch {
      alert(L(lang, {
        ko: '스크린샷 기능을 사용할 수 없습니다. 기기의 스크린샷 기능을 사용해주세요.',
        zh: '截图功能不可用，请使用设备自带的截图功能。',
        en: 'Screenshot not available. Please use your device screenshot feature.'
      }))
    }
  }, [lang])

  const generateCard = () => {
    setShowPreview(true)
  }

  const getSelectedStyle = () => {
    return CARD_STYLES.find(style => style.id === selectedStyle) || CARD_STYLES[0]
  }

  const title = { 
    ko: '알레르기 & 식이제한 카드', 
    zh: '过敏 & 饮食限制卡片', 
    en: 'Allergy & Dietary Restriction Card' 
  }

  const tip = {
    ko: '레스토랑에서 이 카드를 보여주면 언어 소통 없이도 식이 제한을 전달할 수 있습니다. 미리 만들어서 저장해두세요.',
    zh: '在餐厅出示此卡片，无需语言交流就能传达饮食限制。请提前制作并保存。',
    en: 'Show this card at restaurants to communicate dietary restrictions without language barriers. Create and save it in advance.'
  }

  return (
    <GuideLayout title={title} lang={lang} onClose={onClose} tip={tip}>
      <div className="space-y-6">
        {/* Step 1: Select Dietary Restrictions */}
        <div>
          <h2 className="text-lg font-bold text-[#1A1A1A] mb-4">
            {L(lang, { ko: '1. 식이 제한 선택', zh: '1. 选择饮食限制', en: '1. Select Dietary Restrictions' })}
          </h2>
          <div className="grid grid-cols-2 gap-3">
            {DIETARY_RESTRICTIONS.map((restriction) => (
              <button
                key={restriction.id}
                onClick={() => toggleRestriction(restriction.id)}
                className={`p-3 rounded-xl border-2 transition-all text-left ${
                  selectedRestrictions.includes(restriction.id)
                    ? 'border-green-500 bg-green-50'
                    : 'border-gray-200 bg-white hover:border-gray-300'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-2xl">{restriction.icon}</span>
                  {selectedRestrictions.includes(restriction.id) && (
                    <Check size={16} className="text-green-600" />
                  )}
                </div>
                <div className="text-sm font-medium text-gray-800">
                  {L(lang, restriction.label)}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Step 2: Custom Text */}
        <div>
          <h2 className="text-lg font-bold text-[#1A1A1A] mb-4">
            {L(lang, { ko: '2. 추가 메시지 (선택)', zh: '2. 附加信息 (可选)', en: '2. Additional Message (Optional)' })}
          </h2>
          <textarea
            value={customText}
            onChange={(e) => setCustomText(e.target.value)}
            placeholder={L(lang, { 
              ko: '추가로 전달하고 싶은 메시지를 한국어로 입력하세요...',
              zh: '请用韩语输入想要传达的附加信息...',
              en: 'Enter additional message in Korean...'
            })}
            className="w-full p-3 border border-gray-200 rounded-xl resize-none h-20 text-sm"
          />
          <p className="text-xs text-gray-500 mt-1">
            {L(lang, { 
              ko: '예: 매운 음식 안 됩니다 / 조금만 주세요',
              zh: '例：不能吃辣的 / 请给少一点',
              en: 'e.g.: 매운 음식 안 됩니다 / 조금만 주세요'
            })}
          </p>
        </div>

        {/* Step 3: Card Style */}
        <div>
          <h2 className="text-lg font-bold text-[#1A1A1A] mb-4">
            {L(lang, { ko: '3. 카드 스타일 선택', zh: '3. 选择卡片样式', en: '3. Select Card Style' })}
          </h2>
          <div className="grid grid-cols-2 gap-3">
            {CARD_STYLES.map((style) => (
              <button
                key={style.id}
                onClick={() => setSelectedStyle(style.id)}
                className={`p-3 rounded-xl border-2 transition-all ${
                  selectedStyle === style.id
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 bg-white hover:border-gray-300'
                }`}
              >
                <div 
                  className="w-full h-12 rounded mb-2 border"
                  style={{ 
                    backgroundColor: style.bg, 
                    borderColor: style.border,
                    color: style.text 
                  }}
                >
                  <div className="p-2 text-xs font-medium text-center">
                    {L(lang, { ko: '샘플', zh: '示例', en: 'Sample' })}
                  </div>
                </div>
                <div className="text-sm font-medium text-center">
                  {L(lang, style.name)}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Generate Button */}
        <button
          onClick={generateCard}
          disabled={selectedRestrictions.length === 0}
          className={`w-full py-3 rounded-xl font-medium transition-all ${
            selectedRestrictions.length === 0
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
              : 'bg-blue-600 text-white hover:bg-blue-700 active:scale-95'
          }`}
        >
          {L(lang, { ko: '카드 생성하기', zh: '生成卡片', en: 'Generate Card' })}
        </button>

        {/* Card Preview */}
        {showPreview && selectedRestrictions.length > 0 && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-bold text-[#1A1A1A]">
                {L(lang, { ko: '생성된 카드', zh: '生成的卡片', en: 'Generated Card' })}
              </h3>
              <button
                onClick={handleCapture}
                className="flex items-center gap-2 px-3 py-1.5 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 active:scale-95"
              >
                <Download size={14} />
                {L(lang, { ko: '이미지 저장', zh: '保存图片', en: 'Save Image' })}
              </button>
            </div>

            <div className="flex justify-center">
              <div 
                ref={cardRef}
                className="w-80 p-6 rounded-2xl "
                style={{
                  backgroundColor: getSelectedStyle().bg,
                  borderColor: getSelectedStyle().border,
                  color: getSelectedStyle().text,
                  border: `2px solid ${getSelectedStyle().border}`
                }}
              >
                <div className="text-center space-y-4">
                  {/* Icons */}
                  <div className="flex justify-center gap-2 text-3xl">
                    {selectedRestrictions.map(id => {
                      const restriction = DIETARY_RESTRICTIONS.find(r => r.id === id)
                      return <span key={id}>{restriction?.icon}</span>
                    })}
                  </div>

                  {/* Korean Text */}
                  <div className="space-y-2">
                    {selectedRestrictions.map(id => {
                      const restriction = DIETARY_RESTRICTIONS.find(r => r.id === id)
                      return (
                        <p key={id} className="text-lg font-bold leading-tight">
                          {restriction?.korean}
                        </p>
                      )
                    })}
                    {customText && (
                      <p className="text-lg font-bold leading-tight">
                        {customText}
                      </p>
                    )}
                  </div>

                  {/* Divider */}
                  <div 
                    className="w-full h-px mx-auto"
                    style={{ backgroundColor: getSelectedStyle().border }}
                  />

                  {/* English Text */}
                  <div className="space-y-1">
                    {selectedRestrictions.map(id => {
                      const restriction = DIETARY_RESTRICTIONS.find(r => r.id === id)
                      return (
                        <p key={id} className="text-sm opacity-75">
                          {restriction?.english}
                        </p>
                      )
                    })}
                  </div>

                  {/* Chinese Text */}
                  <div className="space-y-1">
                    {selectedRestrictions.map(id => {
                      const restriction = DIETARY_RESTRICTIONS.find(r => r.id === id)
                      return (
                        <p key={id} className="text-sm opacity-75">
                          {restriction?.chinese}
                        </p>
                      )
                    })}
                  </div>

                  {/* Emergency Icon */}
                  {selectedRestrictions.some(id => ['nuts', 'seafood', 'dairy', 'gluten', 'eggs'].includes(id)) && (
                    <div className="flex justify-center">
                      <AlertTriangle size={20} className="text-red-500" />
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Usage Instructions */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
              <h4 className="font-bold text-[#1A1A1A] mb-2">
                {L(lang, { ko: '사용법', zh: '使用方法', en: 'How to Use' })}
              </h4>
              <ul className="text-sm text-gray-700 space-y-1">
                <li>1. {L(lang, { ko: '이미지를 휴대폰에 저장하세요', zh: '将图片保存到手机', en: 'Save the image to your phone' })}</li>
                <li>2. {L(lang, { ko: '레스토랑에서 직원에게 보여주세요', zh: '在餐厅向服务员出示', en: 'Show it to restaurant staff' })}</li>
                <li>3. {L(lang, { ko: '주문 전에 미리 보여주는 것이 좋습니다', zh: '最好在点餐前提前出示', en: 'Best to show before ordering' })}</li>
                <li>4. {L(lang, { ko: '화면을 크게 해서 보여주세요', zh: '放大屏幕显示', en: 'Enlarge the screen when showing' })}</li>
              </ul>
            </div>

            {/* Emergency Note */}
            {selectedRestrictions.some(id => ['nuts', 'seafood', 'dairy', 'gluten', 'eggs'].includes(id)) && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                <div className="flex items-start gap-2">
                  <AlertTriangle size={16} className="text-red-600 mt-1 shrink-0" />
                  <div>
                    <h4 className="font-bold text-red-700 mb-1">
                      {L(lang, { ko: '응급상황 대비', zh: '紧急情况准备', en: 'Emergency Preparation' })}
                    </h4>
                    <p className="text-sm text-red-600">
                      {L(lang, {
                        ko: '심한 알레르기가 있으시면 에피펜을 소지하시고, 응급실 위치를 미리 확인해두세요. 119는 한국의 응급전화번호입니다.',
                        zh: '如有严重过敏，请携带肾上腺素注射器，并提前确认急诊室位置。119是韩国急救电话。',
                        en: 'For severe allergies, carry an EpiPen and know the nearest emergency room location. 119 is Korea\'s emergency number.'
                      })}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </GuideLayout>
  )
}