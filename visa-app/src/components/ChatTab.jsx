import React, { useState, useRef, useEffect } from 'react'
import { t } from '../data/i18n'
import { generateChatResponse } from '../data/chatResponses'

export default function ChatTab({ profile, lang }) {
  const s = t[lang]
  const [msgs, setMsgs] = useState([{ role: 'bot', text: s.chatWelcome }])
  const [input, setInput] = useState('')
  const ref = useRef(null)
  
  useEffect(() => { 
    ref.current?.scrollIntoView({ behavior: 'smooth' }) 
  }, [msgs])
  
  const send = () => {
    if (!input.trim()) return
    const u = input.trim()
    setInput('')
    const r = generateChatResponse(u, { 
      nationality: profile?.nationality, 
      currentVisa: profile?.currentVisa, 
      lang 
    })
    setMsgs(prev => [...prev, { role: 'user', text: u }, { role: 'bot', text: r }])
  }
  
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      send()
    }
  }
  
  const qqs = lang==='ko' ? ['변경 가능한 비자는?','영주권 조건은?','연장하려면?','서류는?','수수료는?']
    : lang==='zh' ? ['可以变更什么签证？','永住权条件？','怎么延期？','材料？','费用？']
    : ['Visa changes?','PR conditions?','Extend?','Documents?','Fees?']

  return (
    <div className="flex flex-col h-[calc(100vh-180px)]">
      <div className="bg-[#F3F4F6] rounded-lg p-3 mb-3">
        <p className="text-xs text-[#6B7280]">
          {lang === 'ko' ? '💡 비자 관련 질문을 해보세요. AI가 도와드릴게요!' : 
           lang === 'zh' ? '💡 请询问签证相关问题，AI会帮助您！' : '💡 Ask visa-related questions. AI will help you!'}
        </p>
        <div className="flex flex-wrap gap-1 mt-2">
          {qqs.map(q => (
            <button key={q} onClick={() => setInput(q)}
              className="text-xs bg-white text-[#6B7280] px-2 py-1 rounded border hover:bg-[#F9FAFB] transition-colors">
              {q}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto space-y-3 mb-4">
        {msgs.map((m, i) => (
          <div key={i} className={`p-3 rounded-lg max-w-[85%] ${
            m.role === 'user' 
              ? 'bg-[#111827] text-white ml-auto' 
              : 'bg-white border border-[#E5E7EB] text-[#111827]'
          }`}>
            <div className="text-sm whitespace-pre-wrap">{m.text}</div>
          </div>
        ))}
        <div ref={ref} />
      </div>

      <div className="flex gap-2">
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKeyPress}
          className="flex-1 border border-[#E5E7EB] rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-[#111827]/20 focus:border-[#111827] outline-none transition-all"
          placeholder={lang === 'ko' ? '메시지를 입력하세요...' : 
                      lang === 'zh' ? '输入消息...' : 'Type a message...'}
          maxLength={500}
        />
        <button 
          onClick={send}
          disabled={!input.trim()}
          className="bg-[#111827] text-white px-6 py-3 rounded-lg text-sm font-medium hover:bg-[#1F2937] disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          {lang === 'ko' ? '전송' : lang === 'zh' ? '发送' : 'Send'}
        </button>
      </div>
    </div>
  )
}