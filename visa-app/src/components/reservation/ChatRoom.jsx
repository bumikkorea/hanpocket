// NEAR 고객↔매장 채팅
import { useState, useRef, useEffect, useMemo } from 'react'
import { reservationText as T } from '../../data/reservationI18n'
import { MOCK_SHOPS, MOCK_CHAT_MESSAGES, MOCK_CHAT_ROOMS } from '../../data/reservationData'
import { Send, ArrowLeft } from 'lucide-react'

const STORAGE_KEY = 'near_chat_messages'

function loadMessages(roomId) {
  try {
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}')
    const custom = stored[roomId] || []
    const mock = MOCK_CHAT_MESSAGES.filter(m => m.roomId === roomId)
    return [...mock, ...custom].sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
  } catch {
    return MOCK_CHAT_MESSAGES.filter(m => m.roomId === roomId)
  }
}

function saveMessage(roomId, msg) {
  try {
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}')
    if (!stored[roomId]) stored[roomId] = []
    stored[roomId].push(msg)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stored))
  } catch { /* ignore */ }
}

export default function ChatRoom({ lang, shopId, reservationId, onBack }) {
  const shop = MOCK_SHOPS.find(s => s.id === shopId)

  // 기존 채팅방 찾기 또는 새로 생성
  const roomId = useMemo(() => {
    const existing = MOCK_CHAT_ROOMS.find(r => r.shopId === shopId)
    return existing?.id || `chat-${shopId}-${Date.now().toString(36)}`
  }, [shopId])

  const [messages, setMessages] = useState(() => loadMessages(roomId))
  const [input, setInput] = useState('')
  const scrollRef = useRef(null)

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSend = () => {
    if (!input.trim()) return
    const msg = {
      id: 'msg-' + Date.now().toString(36),
      roomId,
      sender: 'customer',
      senderId: 'self',
      content: input.trim(),
      createdAt: new Date().toISOString(),
      readAt: null,
    }
    saveMessage(roomId, msg)
    setMessages(prev => [...prev, msg])
    setInput('')

    // 모의 자동 답변 (2초 후)
    setTimeout(() => {
      const autoReply = {
        id: 'msg-auto-' + Date.now().toString(36),
        roomId,
        sender: 'shop',
        senderId: shopId,
        content: lang === 'zh' ? '收到！稍后为您回复。' : lang === 'ko' ? '확인했습니다! 잠시만 기다려주세요.' : 'Got it! We\'ll reply shortly.',
        createdAt: new Date().toISOString(),
        readAt: null,
      }
      saveMessage(roomId, autoReply)
      setMessages(prev => [...prev, autoReply])
    }, 2000)
  }

  return (
    <div className="flex flex-col h-[calc(100vh-80px)]">
      {/* 헤더 */}
      <div className="flex items-center gap-3 px-4 py-3 bg-white border-b" style={{ borderColor: '#F3F4F6' }}>
        <button onClick={onBack} className="p-1">
          <ArrowLeft size={20} color="#666" />
        </button>
        <div>
          <p className="text-[14px] font-semibold" style={{ color: '#111' }}>{shop?.name[lang]}</p>
          <p className="text-[11px]" style={{ color: '#999' }}>{T.chat[lang]}</p>
        </div>
      </div>

      {/* 메시지 목록 */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3" style={{ backgroundColor: '#FFFFFF' }}>
        {messages.length === 0 && (
          <p className="text-center py-10 text-[13px]" style={{ color: '#999' }}>
            {T.noChatHistory[lang]}
          </p>
        )}

        {messages.map(msg => {
          const isMe = msg.sender === 'customer'
          const time = new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })

          return (
            <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[75%] ${isMe ? 'order-1' : ''}`}>
                <div
                  className="px-3.5 py-2.5 rounded-2xl text-[13px]"
                  style={{
                    backgroundColor: isMe ? '#111' : '#fff',
                    color: isMe ? '#fff' : '#111',
                    borderBottomRightRadius: isMe ? 4 : 16,
                    borderBottomLeftRadius: isMe ? 16 : 4,
                  }}
                >
                  {msg.content}
                </div>
                <p className={`text-[10px] mt-0.5 ${isMe ? 'text-right' : ''}`} style={{ color: '#999' }}>
                  {time}
                </p>
              </div>
            </div>
          )
        })}
        <div ref={scrollRef} />
      </div>

      {/* 입력 */}
      <div className="px-4 py-3 bg-white border-t" style={{ borderColor: '#F3F4F6' }}>
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder={T.typeMessage[lang]}
            className="flex-1 px-4 py-2.5 rounded-full text-[13px] border-none outline-none"
            style={{ backgroundColor: '#F3F4F6', color: '#111' }}
          />
          <button
            onClick={handleSend}
            disabled={!input.trim()}
            className="w-10 h-10 rounded-full flex items-center justify-center transition-all"
            style={{ backgroundColor: input.trim() ? '#111' : '#E5E7EB' }}
          >
            <Send size={16} color={input.trim() ? '#fff' : '#999'} />
          </button>
        </div>
      </div>
    </div>
  )
}
