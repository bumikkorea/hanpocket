import { useState } from 'react'
import { Copy, Heart, MessageCircle, Users, Baby, ExternalLink, Share } from 'lucide-react'
import GuideLayout from './GuideLayout'

function L(lang, d) { if (typeof d === 'string') return d; return d?.[lang] || d?.en || d?.zh || d?.ko || '' }

const card = 'bg-white rounded-2xl p-5 border border-[#E5E7EB]'

const MESSAGE_TEMPLATES = [
  {
    id: 'general',
    icon: Heart,
    category: { ko: '일반', zh: '普通', en: 'General' },
    text: '妈妈，我已经安全到达韩国了！酒店已经入住，一切顺利 ❤️',
    description: { ko: '부모님께 안심 메시지', zh: '给父母的安心消息', en: 'Safe arrival message for parents' }
  },
  {
    id: 'weather',
    icon: MessageCircle,
    category: { ko: '날씨 포함', zh: '包含天气', en: 'With weather' },
    text: '爸妈，我到首尔了！天气{WEATHER}度，已经吃了第一顿韩餐 😊',
    description: { ko: '날씨와 식사 정보 포함', zh: '包含天气和用餐信息', en: 'Includes weather and dining info' },
    placeholders: ['WEATHER']
  },
  {
    id: 'signal',
    icon: MessageCircle,
    category: { ko: '연락 가능', zh: '联系方式', en: 'Contact info' },
    text: '亲爱的，我平安到达了！信号很好，随时可以联系 📱',
    description: { ko: '신호 상태 안내', zh: '信号状态说明', en: 'Signal status update' }
  },
  {
    id: 'airport',
    icon: MessageCircle,
    category: { ko: '공항/교통', zh: '机场/交通', en: 'Airport/Transit' },
    text: '到啦到啦！韩国机场好大，正在坐地铁去酒店！',
    description: { ko: '공항 도착 후 이동 중', zh: '机场到达后移动中', en: 'Transit from airport' }
  },
  {
    id: 'friends',
    icon: Users,
    category: { ko: '친구들과', zh: '和朋友', en: 'With friends' },
    text: '家人们放心，我和朋友已经到酒店了，明天开始逛首尔！',
    description: { ko: '친구들과 여행 시', zh: '和朋友一起旅行', en: 'Traveling with friends' }
  },
  {
    id: 'couple',
    icon: Heart,
    category: { ko: '연인용', zh: '情侣', en: 'For couples' },
    text: '{PARTNER_NAME}，到韩国了！好想你，回去给你带礼物 🎁',
    description: { ko: '연인에게 보내는 메시지', zh: '发给恋人的消息', en: 'Message for partner' },
    placeholders: ['PARTNER_NAME']
  },
  {
    id: 'family_kids',
    icon: Baby,
    category: { ko: '가족+아이', zh: '家庭+孩子', en: 'Family with kids' },
    text: '爷爷奶奶，{CHILD_NAME}在韩国很开心！给你们看照片 📸',
    description: { ko: '아이와 함께 여행 시', zh: '带孩子旅行', en: 'Traveling with children' },
    placeholders: ['CHILD_NAME']
  },
  {
    id: 'hotel_detail',
    icon: MessageCircle,
    category: { ko: '호텔 정보', zh: '酒店信息', en: 'Hotel details' },
    text: '家人们，我已经到{HOTEL_NAME}酒店了，房间很干净，位置也很好！',
    description: { ko: '호텔 체크인 완료', zh: '酒店入住完成', en: 'Hotel check-in complete' },
    placeholders: ['HOTEL_NAME']
  }
]

const PLACEHOLDERS = {
  WEATHER: { ko: '온도', zh: '温度', en: 'Temperature' },
  PARTNER_NAME: { ko: '연인 이름 (老公/老婆)', zh: '恋人称呼 (老公/老婆)', en: 'Partner name (老公/老婆)' },
  CHILD_NAME: { ko: '아이 이름', zh: '孩子名字', en: "Child's name" },
  HOTEL_NAME: { ko: '호텔 이름', zh: '酒店名称', en: 'Hotel name' }
}

export default function FamilyMessageGuide({ lang, onClose }) {
  const [customValues, setCustomValues] = useState({})
  const [copiedId, setCopiedId] = useState(null)

  const replacePlaceholders = (text, placeholders) => {
    let result = text
    if (placeholders) {
      placeholders.forEach(placeholder => {
        const value = customValues[placeholder] || `{${placeholder}}`
        result = result.replace(`{${placeholder}}`, value)
      })
    }
    return result
  }

  const copyToClipboard = async (text, id) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedId(id)
      setTimeout(() => setCopiedId(null), 2000)
    } catch (err) {
      // Fallback for older browsers or HTTPS issues
      const textArea = document.createElement('textarea')
      textArea.value = text
      document.body.appendChild(textArea)
      textArea.focus()
      textArea.select()
      document.execCommand('copy')
      document.body.removeChild(textArea)
      setCopiedId(id)
      setTimeout(() => setCopiedId(null), 2000)
    }
  }

  const shareToWeChat = (text) => {
    // Try WeChat deep link (may not work in all browsers)
    const wechatUrl = `weixin://dl/chat?text=${encodeURIComponent(text)}`
    window.open(wechatUrl, '_blank')
    
    // Fallback: copy to clipboard
    setTimeout(() => {
      copyToClipboard(text, 'wechat-share')
    }, 500)
  }

  // Group templates by category for better organization
  const groupedTemplates = MESSAGE_TEMPLATES.reduce((acc, template) => {
    const category = L(lang, template.category)
    if (!acc[category]) acc[category] = []
    acc[category].push(template)
    return acc
  }, {})

  return (
    <GuideLayout
      title={{ ko: '가족 안심 메시지 템플릿', zh: '家人安心消息模板', en: 'Family Safety Message Templates' }}
      lang={lang}
      onClose={onClose}
      tip={{
        ko: '💡 팁: 메시지를 복사한 후 위챗에 붙여넣기 하세요. 개인 정보는 입력하지 않아도 메시지를 사용할 수 있어요.',
        zh: '💡 提示：复制消息后粘贴到微信。即使不填写个人信息也可以使用消息模板。',
        en: '💡 Tip: Copy the message and paste it in WeChat. You can use templates without filling in personal info.'
      }}
    >
      {/* 안내 카드 */}
      <div className="bg-green-50 border border-green-200 rounded-2xl p-5">
        <div className="flex items-start gap-3">
          <MessageCircle size={20} className="text-green-500 shrink-0 mt-0.5" />
          <div>
            <p className="text-base font-bold text-green-700">
              {L(lang, { ko: '가족에게 안심 메시지를 보내세요', zh: '给家人发送安心消息', en: 'Send reassuring messages to family' })}
            </p>
            <p className="text-xs text-green-600 mt-1">
              {L(lang, { ko: '한국 도착 후 위챗으로 빠르게 근황을 전해보세요', zh: '到达韩国后通过微信快速告知近况', en: 'Quickly update your status via WeChat after arriving in Korea' })}
            </p>
          </div>
        </div>
      </div>

      {/* 개인 정보 입력 (선택사항) */}
      <div className={card}>
        <h3 className="text-sm font-bold text-[#111827] mb-3 flex items-center gap-2">
          <Heart size={16} />
          {L(lang, { ko: '개인 정보 (선택사항)', zh: '个人信息（可选）', en: 'Personal Info (Optional)' })}
        </h3>
        <div className="space-y-3">
          {Object.entries(PLACEHOLDERS).map(([key, label]) => (
            <div key={key}>
              <label className="block text-xs text-[#6B7280] mb-1">
                {L(lang, label)}
              </label>
              <input
                type="text"
                value={customValues[key] || ''}
                onChange={(e) => setCustomValues(prev => ({ ...prev, [key]: e.target.value }))}
                placeholder={key === 'WEATHER' ? '15' : key === 'PARTNER_NAME' ? '老公/老婆' : key === 'CHILD_NAME' ? '宝宝' : '롯데호텔'}
                className="w-full px-3 py-2 border border-[#E5E7EB] rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-[#111827]"
              />
            </div>
          ))}
        </div>
        <p className="text-[10px] text-gray-400 mt-2">
          {L(lang, { ko: '입력하지 않으면 기본 템플릿이 사용됩니다', zh: '不填写则使用默认模板', en: 'Default template will be used if left empty' })}
        </p>
      </div>

      {/* 메시지 템플릿들 */}
      <div className="space-y-4">
        {MESSAGE_TEMPLATES.map(template => {
          const finalText = replacePlaceholders(template.text, template.placeholders)
          const Icon = template.icon
          
          return (
            <div key={template.id} className={`${card} transition-all duration-200`}>
              <div className="flex items-start gap-3 mb-3">
                <div className="p-2 rounded-xl bg-[#F3F4F6]">
                  <Icon size={16} className="text-[#6B7280]" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs bg-[#111827] text-white px-2 py-0.5 rounded-full">
                      {L(lang, template.category)}
                    </span>
                  </div>
                  <p className="text-xs text-[#6B7280]">
                    {L(lang, template.description)}
                  </p>
                </div>
              </div>
              
              {/* 메시지 내용 */}
              <div className="bg-[#F8F9FA] rounded-xl p-4 mb-3">
                <p className="text-sm text-[#111827] leading-relaxed">
                  {finalText}
                </p>
              </div>
              
              {/* 액션 버튼들 */}
              <div className="flex gap-2">
                <button
                  onClick={() => copyToClipboard(finalText, template.id)}
                  className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-sm font-semibold transition-all duration-200 ${
                    copiedId === template.id 
                      ? 'bg-green-100 text-green-700' 
                      : 'bg-[#111827] text-white hover:bg-[#374151] active:scale-[0.98]'
                  }`}
                >
                  <Copy size={14} />
                  {copiedId === template.id 
                    ? L(lang, { ko: '복사됨!', zh: '已复制！', en: 'Copied!' })
                    : L(lang, { ko: '복사', zh: '复制', en: 'Copy' })
                  }
                </button>
                
                <button
                  onClick={() => shareToWeChat(finalText)}
                  className="px-4 py-2.5 border border-[#E5E7EB] rounded-xl text-sm font-semibold text-[#6B7280] hover:bg-[#F3F4F6] transition-all duration-200 active:scale-[0.98] flex items-center gap-2"
                >
                  <Share size={14} />
                  {L(lang, { ko: '위챗', zh: '微信', en: 'WeChat' })}
                </button>
              </div>
            </div>
          )
        })}
      </div>

      {/* 사용법 안내 */}
      <div className={card}>
        <h3 className="text-sm font-bold text-[#111827] mb-3 flex items-center gap-2">
          <MessageCircle size={16} />
          {L(lang, { ko: '사용법', zh: '使用方法', en: 'How to use' })}
        </h3>
        <div className="space-y-2 text-sm text-[#374151]">
          <div className="flex items-start gap-2">
            <span className="text-xs font-bold text-white bg-[#111827] w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5">1</span>
            <p>{L(lang, { ko: '상황에 맞는 메시지 템플릿 선택', zh: '选择适合情况的消息模板', en: 'Choose a message template for your situation' })}</p>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-xs font-bold text-white bg-[#111827] w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5">2</span>
            <p>{L(lang, { ko: '필요시 개인 정보 입력 (선택사항)', zh: '如需要可填写个人信息（可选）', en: 'Fill in personal info if needed (optional)' })}</p>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-xs font-bold text-white bg-[#111827] w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5">3</span>
            <p>{L(lang, { ko: '"복사" 버튼 클릭 후 위챗에 붙여넣기', zh: '点击"复制"按钮后粘贴到微信', en: 'Click "Copy" and paste into WeChat' })}</p>
          </div>
        </div>
      </div>

      {/* WeChat 딥링크 안내 */}
      <div className="bg-[#FFFBEB] border border-[#FDE68A] rounded-2xl p-4">
        <div className="flex items-start gap-2">
          <ExternalLink size={16} className="text-[#F59E0B] shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-[#111827] mb-1">
              {L(lang, { ko: '위챗 바로가기에 대해', zh: '关于微信快捷方式', en: 'About WeChat shortcut' })}
            </p>
            <p className="text-xs text-[#374151]">
              {L(lang, { ko: '"위챗" 버튼은 일부 브라우저에서만 작동합니다. 작동하지 않을 경우 "복사" 버튼을 사용해 주세요.', zh: '"微信"按钮仅在部分浏览器中有效。如无效请使用"复制"按钮。', en: 'The "WeChat" button only works in some browsers. Please use "Copy" if it doesn\'t work.' })}
            </p>
          </div>
        </div>
      </div>

      {/* 푸터 */}
      <p className="text-xs text-gray-400 text-center mt-8">
        {L(lang, { ko: '가족의 안심을 위한 HanPocket | 문의: hanpocket@email.com', zh: '为了家人的安心 HanPocket | 联系: hanpocket@email.com', en: 'For your family\'s peace of mind - HanPocket | Contact: hanpocket@email.com' })}
      </p>
    </GuideLayout>
  )
}