import React, { useState, useRef, useEffect } from 'react'
import { Mic, Volume2, Check, X, Plus, ChevronRight, ChevronDown } from 'lucide-react'
import { widgetMockData } from '../../data/widgets'
import { TIMEZONE_COUNTRIES, L, getDaysUntil } from '../HomeTab'

function getTimeInOffset(offset) {
  const now = new Date()
  const utc = now.getTime() + now.getTimezoneOffset() * 60000
  const city = new Date(utc + offset * 3600000)
  return city.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false })
}

// ─── Activity Tracker (global) ───
const ACTIVITY_KEY = 'hp_last_activity'
function getLastActivity() {
  try { return JSON.parse(localStorage.getItem(ACTIVITY_KEY)) } catch { return null }
}

// ─── Korean Holiday Calendar ───
const KOREAN_HOLIDAYS = [
  { m: 1, d: 1, ko: '신정', zh: '元旦', en: "New Year's Day" },
  { m: 3, d: 1, ko: '삼일절', zh: '三一节', en: 'Independence Movement Day' },
  { m: 5, d: 5, ko: '어린이날', zh: '儿童节', en: "Children's Day" },
  { m: 6, d: 6, ko: '현충일', zh: '显忠日', en: 'Memorial Day' },
  { m: 8, d: 15, ko: '광복절', zh: '光复节', en: 'Liberation Day' },
  { m: 10, d: 3, ko: '개천절', zh: '开天节', en: 'National Foundation Day' },
  { m: 10, d: 9, ko: '한글날', zh: '韩文日', en: 'Hangul Day' },
  { m: 12, d: 25, ko: '성탄절', zh: '圣诞节', en: 'Christmas' },
  { m: 2, d: 17, ko: '설날', zh: '春节', en: 'Lunar New Year' },
  { m: 2, d: 16, ko: '설날 연휴', zh: '春节假期', en: 'Lunar New Year Holiday' },
  { m: 2, d: 18, ko: '설날 연휴', zh: '春节假期', en: 'Lunar New Year Holiday' },
  { m: 5, d: 24, ko: '부처님오신날', zh: '佛诞节', en: "Buddha's Birthday" },
  { m: 9, d: 25, ko: '추석', zh: '中秋节', en: 'Chuseok' },
  { m: 9, d: 24, ko: '추석 연휴', zh: '中秋假期', en: 'Chuseok Holiday' },
  { m: 9, d: 26, ko: '추석 연휴', zh: '中秋假期', en: 'Chuseok Holiday' },
]

function HolidayCalendarWidget({ lang }) {
  const now = new Date()
  const [viewMonth, setViewMonth] = useState(now.getMonth())
  const [viewYear, setViewYear] = useState(now.getFullYear())

  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate()
  const firstDayOfWeek = new Date(viewYear, viewMonth, 1).getDay()
  const today = now.getDate()
  const isCurrentMonth = viewMonth === now.getMonth() && viewYear === now.getFullYear()

  const monthHolidays = KOREAN_HOLIDAYS.filter(h => h.m === viewMonth + 1)
  const holidayMap = {}
  monthHolidays.forEach(h => { holidayMap[h.d] = h })

  const dayLabels = ['일', '월', '화', '수', '목', '금', '토']
  const monthNames = {
    ko: `${viewYear}년 ${viewMonth + 1}월`,
    zh: `${viewYear}年${viewMonth + 1}月`,
    en: new Date(viewYear, viewMonth).toLocaleDateString('en-US', { year: 'numeric', month: 'long' }),
  }

  const prevMonth = () => {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(viewYear - 1) }
    else setViewMonth(viewMonth - 1)
  }
  const nextMonth = () => {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(viewYear + 1) }
    else setViewMonth(viewMonth + 1)
  }

  const cells = []
  for (let i = 0; i < firstDayOfWeek; i++) cells.push(null)
  for (let d = 1; d <= daysInMonth; d++) cells.push(d)

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <button onClick={prevMonth} className="text-xs text-[#6B7280] px-2 py-1 rounded hover:bg-[#F3F4F6]">&lsaquo;</button>
        <span className="text-sm font-bold text-[#111827]">{monthNames[lang] || monthNames.en}</span>
        <button onClick={nextMonth} className="text-xs text-[#6B7280] px-2 py-1 rounded hover:bg-[#F3F4F6]">&rsaquo;</button>
      </div>
      <div className="grid grid-cols-7 gap-0">
        {dayLabels.map((d, i) => (
          <div key={d} className={`text-center text-[8px] font-bold py-0.5 ${i === 0 ? 'text-red-400' : i === 6 ? 'text-blue-400' : 'text-[#6B7280]'}`}>{d}</div>
        ))}
        {cells.map((day, i) => {
          if (day === null) return <div key={`e${i}`} className="h-5" />
          const hol = holidayMap[day]
          const isSun = (i % 7) === 0
          const isSat = (i % 7) === 6
          const isToday = isCurrentMonth && day === today
          return (
            <div key={day} className={`relative h-5 flex flex-col items-center justify-center rounded text-[10px]
              ${isToday ? 'bg-[#111827] text-white font-black' : hol || isSun ? 'text-red-500 font-bold' : isSat ? 'text-blue-500' : 'text-[#6B7280]'}
            `} title={hol ? L(lang, hol) : ''}>
              {day}
              {hol && !isToday && <span className="absolute -bottom-0 w-1 h-1 rounded-full bg-red-400" />}
            </div>
          )
        })}
      </div>
      {monthHolidays.length > 0 && (
        <div className="mt-2 pt-2 border-t border-[#E5E7EB] space-y-0.5">
          {monthHolidays.filter((h, i, a) => a.findIndex(x => x.d === h.d && x.ko === h.ko) === i).map((h, i) => (
            <div key={i} className="flex items-center justify-between">
              <span className="text-[10px] text-red-500 font-semibold">{viewMonth + 1}/{h.d} {L(lang, h)}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ─── Exchange Rate Card ───
const CURRENCIES = [
  { code: 'CNY', flag: 'CN', name: '人民币', rate: 191.52 },
  { code: 'HKD', flag: 'HK', name: '港币', rate: 177.80 },
  { code: 'TWD', flag: 'TW', name: '新台币', rate: 42.50 },
  { code: 'MOP', flag: 'MO', name: '澳门元', rate: 171.20 },
  { code: 'USD', flag: 'US', name: '美元', rate: 1384.50 },
  { code: 'JPY', flag: 'JP', name: '日元', rate: 9.21 },
  { code: 'VND', flag: 'VN', name: '越南盾', rate: 0.055 },
  { code: 'PHP', flag: 'PH', name: '比索', rate: 24.10 },
  { code: 'THB', flag: 'TH', name: '泰铢', rate: 39.80 },
]

function ExchangeRateCard({ exchangeRate, lang, compact }) {
  const [amount, setAmount] = useState('1000')
  const [selectedCurrency, setSelectedCurrency] = useState('CNY')
  const curr = CURRENCIES.find(c => c.code === selectedCurrency) || CURRENCIES[0]
  const rate = exchangeRate?.[selectedCurrency] || curr.rate
  const converted = (parseFloat(amount) || 0) * rate

  return (
    <div className="glass rounded-lg p-4">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-semibold text-[#6B7280]">{lang === 'ko' ? '환전 계산기' : lang === 'zh' ? '汇率计算器' : 'Currency Converter'}</span>
      </div>
      <div className="flex items-center gap-1.5 mb-2">
        <select
          value={selectedCurrency}
          onChange={e => setSelectedCurrency(e.target.value)}
          className="text-[11px] font-bold text-[#111827] bg-[#F3F4F6] rounded-lg px-1.5 py-1.5 outline-none border-none shrink-0"
        >
          {CURRENCIES.map(c => (
            <option key={c.code} value={c.code}>{c.flag} {c.code}</option>
          ))}
        </select>
        <input
          type="number"
          value={amount}
          onChange={e => setAmount(e.target.value)}
          className="w-0 flex-1 min-w-0 text-right text-sm font-bold text-[#111827] bg-[#F3F4F6] rounded-lg px-2 py-1.5 outline-none"
        />
      </div>
      <div className="text-center text-[#9CA3AF] text-xs my-1">&darr;</div>
      <div className="flex items-center gap-1.5">
        <span className="text-[11px] font-bold text-[#111827] shrink-0 px-1.5">KRW</span>
        <div className="w-0 flex-1 min-w-0 text-right text-sm font-bold text-[#111827] bg-[#F3F4F6] rounded-lg px-2 py-1.5 truncate">
          {converted.toLocaleString('ko-KR', { maximumFractionDigits: 0 })}
        </div>
      </div>
      <p className="text-[8px] text-[#9CA3AF] text-center mt-1">Last: {exchangeRate?._date || '-'}</p>
    </div>
  )
}

// ─── Apple Store Horizontal Card Scroll ───

function HScrollSection({ children }) {
  const ref = useRef(null)
  const [canLeft, setCanLeft] = useState(false)
  const [canRight, setCanRight] = useState(true)
  const dragState = useRef({ isDragging: false, startX: 0, scrollLeft: 0 })

  const checkScroll = () => {
    const el = ref.current
    if (!el) return
    setCanLeft(el.scrollLeft > 10)
    setCanRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 10)
  }

  useEffect(() => { checkScroll() }, [children])

  const scroll = (dir) => {
    const el = ref.current
    if (!el) return
    const card = el.querySelector(':scope > *')
    const w = card ? card.offsetWidth + 16 : 300
    el.scrollBy({ left: dir * w, behavior: 'smooth' })
  }

  const onMouseDown = (e) => {
    const el = ref.current
    if (!el) return
    dragState.current = { isDragging: true, startX: e.pageX - el.offsetLeft, scrollLeft: el.scrollLeft }
    el.style.cursor = 'grabbing'
    el.style.scrollSnapType = 'none'
  }
  const onMouseMove = (e) => {
    if (!dragState.current.isDragging) return
    e.preventDefault()
    const el = ref.current
    const x = e.pageX - el.offsetLeft
    el.scrollLeft = dragState.current.scrollLeft - (x - dragState.current.startX)
  }
  const onMouseUp = () => {
    dragState.current.isDragging = false
    const el = ref.current
    if (el) { el.style.cursor = 'grab'; el.style.scrollSnapType = 'x mandatory' }
  }

  return (
    <div className="relative group">
      {canLeft && (
        <button onClick={() => scroll(-1)}
          className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full bg-white shadow-md flex items-center justify-center text-[#111827] hover:bg-[#F3F4F6] transition-all opacity-0 group-hover:opacity-100">
          ‹
        </button>
      )}
      <div ref={ref} onScroll={checkScroll}
        onMouseDown={onMouseDown} onMouseMove={onMouseMove} onMouseUp={onMouseUp} onMouseLeave={onMouseUp}
        className="flex gap-4 overflow-x-auto no-scrollbar pb-2 -mx-1 px-1 cursor-grab select-none"
        style={{ scrollSnapType: 'x mandatory', touchAction: 'pan-x' }}>
        {children}
      </div>
      {canRight && (
        <button onClick={() => scroll(1)}
          className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full bg-white shadow-md flex items-center justify-center text-[#111827] hover:bg-[#F3F4F6] transition-all opacity-0 group-hover:opacity-100">
          ›
        </button>
      )}
    </div>
  )
}

// ─── Voice Translator Card (실시간 음성 통역) ───
function VoiceTranslatorCard({ lang }) {
  const [conversations, setConversations] = useState([])
  const [isListening, setIsListening] = useState(null) // 'zh' | 'ko' | null
  const [interim, setInterim] = useState('')
  const recognitionRef = useRef(null)

  const startListening = (sourceLang) => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert(lang === 'ko' ? '이 브라우저는 음성 인식을 지원하지 않습니다.' : lang === 'zh' ? '此浏览器不支持语音识别' : 'Speech recognition not supported')
      return
    }
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    const recognition = new SpeechRecognition()
    recognition.lang = sourceLang === 'zh' ? 'zh-CN' : 'ko-KR'
    recognition.interimResults = true
    recognition.continuous = false
    recognition.onresult = (event) => {
      let final = '', inter = ''
      for (let i = 0; i < event.results.length; i++) {
        if (event.results[i].isFinal) final += event.results[i][0].transcript
        else inter += event.results[i][0].transcript
      }
      if (final) {
        setInterim('')
        const translated = simpleTranslate(final, sourceLang)
        setConversations(prev => [...prev, { source: sourceLang, original: final, translated }])
        // Speak the translation
        try {
          if ('speechSynthesis' in window) {
            const u = new SpeechSynthesisUtterance(translated)
            u.lang = sourceLang === 'zh' ? 'ko-KR' : 'zh-CN'
            u.rate = 0.85
            speechSynthesis.speak(u)
          }
        } catch (err) {
          console.warn('Web Speech API unavailable:', err)
        }
      } else if (inter) {
        setInterim(inter)
      }
    }
    recognition.onend = () => { setIsListening(null); setInterim('') }
    recognition.onerror = () => {
      setIsListening(null); setInterim('')
      setConversations(prev => [...prev, { source: sourceLang, original: lang === 'ko' ? '음성 인식을 사용할 수 없습니다. 텍스트로 입력해주세요.' : lang === 'zh' ? '无法使用语音识别。请使用文字输入。' : 'Speech recognition unavailable. Please use text input.', translated: '' }])
    }
    recognitionRef.current = recognition
    try {
      recognition.start()
      setIsListening(sourceLang)
    } catch (e) {
      setIsListening(null)
      setConversations(prev => [...prev, { source: sourceLang, original: lang === 'ko' ? '음성 인식을 사용할 수 없습니다. 텍스트로 입력해주세요.' : lang === 'zh' ? '无法使用语音识别。请使用文字输入。' : 'Speech recognition unavailable. Please use text input.', translated: '' }])
    }
  }

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop()
    }
  }

  // Simple phrase-based translation dictionary
  const simpleTranslate = (text, from) => {
    const zhToKo = {
      '你好': '안녕하세요', '谢谢': '감사합니다', '对不起': '죄송합니다', '请问': '실례합니다',
      '多少钱': '얼마예요?', '在哪里': '어디예요?', '我要这个': '이거 주세요',
      '帮帮我': '도와주세요', '不好意思': '실례합니다', '请等一下': '잠시만요',
      '我听不懂': '못 알아듣겠어요', '可以吗': '괜찮아요?', '我是中国人': '저는 중국 사람이에요',
      '洗手间在哪里': '화장실이 어디예요?', '请给我菜单': '메뉴판 주세요',
      '我想要': '주세요', '太贵了': '너무 비싸요', '便宜一点': '좀 깎아주세요',
      '这是什么': '이게 뭐예요?', '好吃': '맛있어요', '结账': '계산이요',
      '一个': '하나', '两个': '둘', '三个': '셋', '我要点餐': '주문할게요',
      '打包': '포장해 주세요', '堂食': '여기서 먹을게요', '不要辣': '안 맵게 해주세요',
      '我肚子疼': '배가 아파요', '我头疼': '머리가 아파요', '我发烧了': '열이 나요',
      '请叫救护车': '구급차 불러주세요', '请叫警察': '경찰 불러주세요',
      '我迷路了': '길을 잃었어요', '请带我去这个地址': '이 주소로 데려다주세요',
      '地铁站在哪': '지하철역이 어디예요?', '公交车站': '버스 정류장',
      '我要去': '가고 싶어요', '请停车': '세워주세요',
    }
    const koToZh = {}
    Object.entries(zhToKo).forEach(([zh, ko]) => { koToZh[ko] = zh; koToZh[ko.replace('?','')] = zh })

    const dict = from === 'zh' ? zhToKo : koToZh
    // Exact match first
    if (dict[text]) return dict[text]
    // Partial match - find longest matching phrase
    let result = text
    let matched = false
    for (const [key, val] of Object.entries(dict).sort((a, b) => b[0].length - a[0].length)) {
      if (text.includes(key)) {
        result = result.replace(key, val)
        matched = true
      }
    }
    if (!matched) {
      // Return with a note
      return from === 'zh'
        ? `[${text}] — (사전에 없는 표현입니다)`
        : `[${text}] — (词典中没有此表达)`
    }
    return result
  }

  const card = "w-[280px] min-h-[220px] shrink-0 bg-white border border-[#E5E7EB] rounded-lg p-4 flex flex-col card-glow"

  return (
    <div className={card} style={{ scrollSnapAlign: 'start' }}>
      <p className="text-[10px] text-[#6B7280] font-medium mb-2">
        {lang === 'ko' ? '실시간 통역' : lang === 'zh' ? '实时翻译' : 'Live Translator'}
      </p>

      {/* Conversation area */}
      <div className="flex-1 overflow-y-auto no-scrollbar space-y-1.5 mb-2 min-h-[100px] max-h-[130px]">
        {conversations.length === 0 && (
          <p className="text-[10px] text-[#9CA3AF] text-center mt-6">
            {lang === 'ko' ? '버튼을 꾹 누르고 말하세요' : lang === 'zh' ? '按住按钮说话' : 'Hold button and speak'}
          </p>
        )}
        {conversations.map((c, i) => (
          <div key={i} className="space-y-0.5">
            <p className={`text-[11px] font-semibold ${c.source === 'zh' ? 'text-red-500' : 'text-blue-500'}`}>
              {c.source === 'zh' ? '中' : '韩'}: {c.original}
            </p>
            <p className={`text-[11px] font-semibold ${c.source === 'zh' ? 'text-blue-500' : 'text-red-500'} ml-3`}>
              → {c.translated}
            </p>
          </div>
        ))}
        {interim && (
          <p className={`text-[11px] italic ${isListening === 'zh' ? 'text-red-300' : 'text-blue-300'}`}>
            {interim}...
          </p>
        )}
      </div>

      {/* Mic buttons */}
      <div className="flex gap-2">
        <button
          onMouseDown={() => startListening('zh')}
          onMouseUp={stopListening}
          onTouchStart={(e) => { e.preventDefault(); startListening('zh') }}
          onTouchEnd={(e) => { e.preventDefault(); stopListening() }}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl font-bold text-sm transition-all select-none ${
            isListening === 'zh'
              ? 'bg-red-500 text-white scale-95 shadow-lg shadow-red-500/30'
              : 'bg-red-50 text-red-500 hover:bg-red-100 active:bg-red-500 active:text-white'
          }`}
        >
          <Mic size={16} />
          <span>中</span>
        </button>
        <button
          onMouseDown={() => startListening('ko')}
          onMouseUp={stopListening}
          onTouchStart={(e) => { e.preventDefault(); startListening('ko') }}
          onTouchEnd={(e) => { e.preventDefault(); stopListening() }}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl font-bold text-sm transition-all select-none ${
            isListening === 'ko'
              ? 'bg-blue-500 text-white scale-95 shadow-lg shadow-blue-500/30'
              : 'bg-blue-50 text-blue-500 hover:bg-blue-100 active:bg-blue-500 active:text-white'
          }`}
        >
          <Mic size={16} />
          <span>韩</span>
        </button>
      </div>

      {/* Clear button */}
      {conversations.length > 0 && (
        <button onClick={() => setConversations([])}
          className="mt-1.5 text-[9px] text-[#9CA3AF] hover:text-[#6B7280] text-center">
          {lang === 'ko' ? '대화 지우기' : lang === 'zh' ? '清除对话' : 'Clear'}
        </button>
      )}
    </div>
  )
}

// ─── Memo Card ───

function MemoCard({ lang }) {
  const MAX_MEMOS = 5
  const MAX_CHARS = 30
  const [memos, setMemos] = useState(() => {
    try { return JSON.parse(localStorage.getItem('hp_memos')) || [] } catch { return [] }
  })
  const [editing, setEditing] = useState(null) // index being edited
  const [draft, setDraft] = useState('')

  const save = (updated) => {
    setMemos(updated)
    localStorage.setItem('hp_memos', JSON.stringify(updated))
  }

  const addMemo = () => {
    if (memos.length >= MAX_MEMOS) return
    setEditing(memos.length)
    setDraft('')
  }

  const confirmMemo = () => {
    if (!draft.trim()) { setEditing(null); return }
    const updated = [...memos]
    if (editing === memos.length) updated.push(draft.trim().slice(0, MAX_CHARS))
    else updated[editing] = draft.trim().slice(0, MAX_CHARS)
    save(updated)

    setEditing(null)
    setDraft('')
  }

  const deleteMemo = (idx) => {
    save(memos.filter((_, i) => i !== idx))
  }

  const card = "w-[220px] min-h-[220px] shrink-0 bg-white border border-[#E5E7EB] rounded-lg p-4 flex flex-col card-glow"

  return (
    <div className={card} style={{ scrollSnapAlign: 'start' }}>
      <div className="flex items-center justify-between mb-2">
        <p className="text-[10px] text-[#6B7280] font-medium">{lang === 'ko' ? '오늘의 계획' : lang === 'zh' ? '今日计划' : "Today's Plan"}</p>
        <div className="flex items-center gap-1.5">
          <span className="text-[8px] text-[#9CA3AF]">({memos.length}/{MAX_MEMOS})</span>
          {memos.length < MAX_MEMOS && (
            <button onClick={addMemo}
              className="w-5 h-5 rounded-md bg-[#111827]/10 text-[#111827] flex items-center justify-center hover:bg-[#111827]/20 transition-all">
              <Plus size={12} />
            </button>
          )}
        </div>
      </div>
      <div className="flex-1 space-y-1.5">
        {memos.length === 0 && editing === null && (
          <p className="text-[10px] text-[#9CA3AF] text-center mt-4">{lang === 'ko' ? '+ 버튼으로 메모 추가' : lang === 'zh' ? '点击+添加备忘' : 'Tap + to add memo'}</p>
        )}
        {memos.map((memo, i) => (
          <div key={i} className="flex items-center gap-1.5 group">
            {editing === i ? (
              <div className="flex items-center gap-1 flex-1">
                <input type="text" value={draft} onChange={e => setDraft(e.target.value.slice(0, MAX_CHARS))}
                  onKeyDown={e => e.key === 'Enter' && confirmMemo()}
                  autoFocus
                  className="flex-1 text-[10px] text-[#111827] bg-[#F3F4F6] rounded px-2 py-1 outline-none focus:ring-1 focus:ring-[#111827]/50"
                  placeholder={`${MAX_CHARS}${lang === 'ko' ? '자 이내' : lang === 'zh' ? '字以内' : ' chars'}`}
                />
                <button onClick={confirmMemo} className="text-[#111827]"><Check size={12} /></button>
              </div>
            ) : (
              <>
                <span className="text-[10px] text-[#111827] font-mono w-3 shrink-0">{i + 1}</span>
                <span className="text-[10px] text-[#111827] flex-1 truncate cursor-pointer"
                  onClick={() => { setEditing(i); setDraft(memo) }}>{memo}</span>
                <button onClick={() => deleteMemo(i)}
                  className="opacity-0 group-hover:opacity-100 text-[#9CA3AF] hover:text-red-400 transition-all">
                  <X size={10} />
                </button>
              </>
            )}
          </div>
        ))}
        {editing === memos.length && (
          <div className="flex items-center gap-1">
            <input type="text" value={draft} onChange={e => setDraft(e.target.value.slice(0, MAX_CHARS))}
              onKeyDown={e => e.key === 'Enter' && confirmMemo()}
              autoFocus
              className="flex-1 text-[10px] text-[#111827] bg-[#F3F4F6] rounded px-2 py-1 outline-none focus:ring-1 focus:ring-[#111827]/50"
              placeholder={`${MAX_CHARS}${lang === 'ko' ? '자 이내' : lang === 'zh' ? '字以内' : ' chars'}`}
            />
            <button onClick={confirmMemo} className="text-[#111827]"><Check size={12} /></button>
          </div>
        )}
      </div>
      <p className="text-[7px] text-[#9CA3AF] text-right mt-1">
        {memos.length === MAX_MEMOS
          ? (lang === 'ko' ? '메모 가득 참' : lang === 'zh' ? '备忘已满' : 'Memos full')
          : `${MAX_MEMOS - memos.length}${lang === 'ko' ? '개 추가 가능' : lang === 'zh' ? '个可添加' : ' slots left'}`
        }
      </p>
    </div>
  )
}

// ─── My Status Card ───

function MyStatusCard({ profile, lang, setTab }) {
  const days = getDaysUntil(profile?.expiryDate)
  const card = "w-[220px] min-h-[220px] shrink-0 bg-white border border-[#E5E7EB] rounded-lg p-4 flex flex-col card-glow"

  const nationality = profile?.nationality || ''
  const visa = profile?.currentVisa || ''
  const subscription = profile?.subscription || 'free'
  const lastActivity = getLastActivity()

  const subLabel = {
    free: { color: 'bg-[#F3F4F6] text-[#6B7280]', text: 'Free' },
    premium: { color: 'bg-[#111827]/20 text-[#111827]', text: 'Premium' },
  }
  const sub = subLabel[subscription] || subLabel.free

  const visaDisplay = visa ? (days !== null && days > 0 ? `${visa} · D-${days}` : visa) : ''
  const dDayColor = days <= 30 ? 'text-red-500' : days <= 90 ? 'text-amber-500' : 'text-[#111827]'

  return (
    <div className={card} style={{ scrollSnapAlign: 'start' }}>
      <p className="text-[10px] text-[#6B7280] font-medium mb-2">{lang === 'ko' ? '내 정보' : lang === 'zh' ? '我的信息' : 'My Info'}</p>
      <div className="space-y-1.5 flex-1">
        {/* Subscription */}
        <div className="flex items-center justify-between">
          <span className="text-[9px] text-[#6B7280]">{lang === 'ko' ? '구독' : lang === 'zh' ? '订阅' : 'Plan'}</span>
          <span className={`text-[8px] font-bold px-2 py-0.5 rounded-full ${sub.color}`}>{sub.text}</span>
        </div>
        {/* Nationality */}
        {nationality && (
          <div className="flex items-center justify-between">
            <span className="text-[9px] text-[#6B7280]">{lang === 'ko' ? '국적' : lang === 'zh' ? '国籍' : 'Nationality'}</span>
            <span className="text-[9px] font-semibold text-[#111827]">{nationality}</span>
          </div>
        )}
        {/* Visa + D-Day */}
        {visaDisplay && (
          <div className="flex items-center justify-between">
            <span className="text-[9px] text-[#6B7280]">{lang === 'ko' ? '비자' : lang === 'zh' ? '签证' : 'Visa'}</span>
            <span className={`text-[9px] font-bold ${dDayColor}`}>{visaDisplay}</span>
          </div>
        )}
        {/* Korean progress */}
        <div className="flex items-center justify-between">
          <span className="text-[9px] text-[#6B7280]">{lang === 'ko' ? '한국어' : lang === 'zh' ? '韩语' : 'Korean'}</span>
          <span className="text-[9px] font-bold text-[#111827]">Day {widgetMockData.korean?.day || 1}</span>
        </div>
        {/* Login method */}
        <div className="flex items-center justify-between">
          <span className="text-[9px] text-[#6B7280]">{lang === 'ko' ? '로그인' : lang === 'zh' ? '登录方式' : 'Login'}</span>
          <span className="text-[9px] font-semibold text-[#111827]">{profile?.loginMethod || (lang === 'ko' ? '게스트' : lang === 'zh' ? '游客' : 'Guest')}</span>
        </div>

        {/* Divider */}
        <div className="border-t border-[#E5E7EB] my-1" />

        {/* Recent Activity */}
        <div>
          <p className="text-[8px] text-[#9CA3AF] mb-1">{lang === 'ko' ? '최근 결제' : lang === 'zh' ? '最近消费' : 'Recent Payment'}</p>
          {lastActivity ? (
            <div className="bg-[#F8F9FA] rounded-lg px-2 py-1.5">
              <p className="text-[9px] text-[#111827] truncate">{lastActivity.label}</p>
              <p className="text-[7px] text-[#9CA3AF] text-right">{lastActivity.ts}</p>
            </div>
          ) : (
            <p className="text-[8px] text-[#9CA3AF] italic">{lang === 'ko' ? '결제 내역이 없습니다' : lang === 'zh' ? '暂无消费记录' : 'No payments yet'}</p>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── Tax Refund Mini Card ───

function TaxRefundMiniCard({ lang }) {
  const [amount, setAmount] = useState('')
  function calcRefund(val) {
    if (!val || val < 30000) return 0
    if (val < 50000) return Math.round(val * 0.05)
    if (val < 200000) return Math.round(val * 0.06)
    return Math.round(val * 0.075)
  }
  const refund = calcRefund(parseFloat(amount) || 0)
  const card = "w-[220px] min-h-[220px] shrink-0 bg-white border border-[#E5E7EB] rounded-lg p-4 flex flex-col card-glow"

  return (
    <div className={card} style={{ scrollSnapAlign: 'start' }}>
      <p className="text-[10px] text-[#6B7280] font-medium mb-1">{lang === 'ko' ? '택스리펀 계산기' : lang === 'zh' ? '退税计算器' : 'Tax Refund Calc'}</p>
      <div className="flex items-center gap-1 mb-1.5">
        <span className="text-[10px] text-[#6B7280]">₩</span>
        <input type="text" inputMode="numeric" pattern="[0-9]*" value={amount} onChange={e => { const v = e.target.value.replace(/[^0-9]/g, ''); setAmount(v) }}
          placeholder={lang === 'ko' ? '금액 입력' : lang === 'zh' ? '输入金额' : 'Amount'}
          className="w-full text-right text-sm font-bold text-[#111827] bg-[#F3F4F6] border border-[#E5E7EB] rounded-lg px-2 py-1.5 outline-none focus:ring-1 focus:ring-[#111827]/20 placeholder:text-[#9CA3AF] placeholder:text-[10px]"
        />
      </div>
      <div className="text-center py-1.5 bg-[#F3F4F6] border border-[#E5E7EB] rounded-lg flex-1 flex flex-col justify-center">
        <p className="text-[9px] text-[#6B7280]">{lang === 'ko' ? '예상 환급액' : lang === 'zh' ? '预估退税' : 'Est. Refund'}</p>
        <p className="text-xl font-black text-[#111827]">₩{refund.toLocaleString('ko-KR')}</p>
      </div>
      <p className="text-[8px] text-[#9CA3AF] text-center mt-1">{lang === 'ko' ? '최소 3만원 이상 구매' : lang === 'zh' ? '最低消费3万韩元' : 'Min ₩30,000'}</p>
    </div>
  )
}

// ─── Personal Cards Section ───

function PersonalSection({ profile, lang, setTab, exchangeRate }) {
  const koreanData = widgetMockData.korean
  const card = "w-[220px] min-h-[220px] shrink-0 bg-white border border-[#E5E7EB] rounded-lg p-4 flex flex-col card-glow"
  const snapStyle = { scrollSnapAlign: 'start' }

  return (
    <HScrollSection>
      {/* 0. My Status */}
      <MyStatusCard profile={profile} lang={lang} setTab={setTab} />

      {/* 1. Voice Translator */}
      <VoiceTranslatorCard lang={lang} />

      {/* 2. Memo / Today's Plan */}
      <MemoCard lang={lang} />

      {/* 3. Korean Calendar */}
      <div className={card + " overflow-hidden"} style={snapStyle}>
        <p className="text-[10px] text-[#6B7280] font-medium mb-1">{lang === 'ko' ? '한국 달력' : lang === 'zh' ? '韩国日历' : 'Korean Calendar'}</p>
        <div className="overflow-y-auto no-scrollbar flex-1">
          <HolidayCalendarWidget lang={lang} />
        </div>
      </div>

      {/* 4. Today's Korean Expression */}
      {koreanData && (
        <div className={card} style={snapStyle}>
          <div className="flex items-center justify-between mb-1">
            <p className="text-[10px] text-[#6B7280] font-medium">{lang === 'ko' ? '오늘의 한국어 표현' : lang === 'zh' ? '今日韩语表达' : "Today's Korean Expression"}</p>
            {koreanData.day && <span className="text-[8px] font-bold text-[#111827]">Day {koreanData.day}</span>}
          </div>
          <div className="flex flex-col flex-1">
            {/* Word section — top half */}
            <div className="flex-1 flex flex-col justify-center">
              <p className="text-lg font-black text-[#111827] leading-tight">{koreanData.word ? L('ko', koreanData.word) : ''}</p>
              {koreanData.word && <p className="text-[10px] text-[#6B7280] mt-0.5">{L(lang === 'ko' ? 'zh' : lang, koreanData.word)}</p>}
              {koreanData.pronunciation && <p className="text-[9px] text-[#9CA3AF] font-mono mt-0.5">[{koreanData.pronunciation}]</p>}
            </div>
            {koreanData.example?.sentence && (
              <>
                {/* Centered divider */}
                <div className="border-t border-[#E5E7EB] my-2" />
                {/* Example section — bottom half */}
                <div className="flex-1 flex flex-col justify-center">
                <p className="text-xs font-bold text-[#111827] leading-snug">"{L('ko', koreanData.example.sentence)}"</p>
                <p className="text-[10px] text-[#6B7280] mt-0.5">"{L(lang === 'ko' ? 'zh' : lang, koreanData.example.sentence)}"</p>
                {koreanData.example.pronunciation && (
                  <p className="text-[9px] text-[#9CA3AF] font-mono mt-0.5">[{koreanData.example.pronunciation}]</p>
                )}
                <button onClick={() => {
                  try {
                    if (!('speechSynthesis' in window)) {
                      throw new Error('speechSynthesis not supported')
                    }
                    const text = L('ko', koreanData.example.sentence)
                    const u = new SpeechSynthesisUtterance(text)
                    u.lang = 'ko-KR'; u.rate = 0.75
                    if (text.endsWith('?') || text.endsWith('요?')) u.pitch = 1.2
                    speechSynthesis.speak(u)
                  } catch (err) {
                    console.warn('Web Speech API unavailable:', err)
                    alert(lang === 'ko' ? '음성 기능은 이 환경에서 사용할 수 없습니다' : lang === 'zh' ? '语音功能在此환경中不可用' : 'Voice feature unavailable in this environment')
                  }
                }} className="mt-1.5 flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#111827]/10 text-[#111827] hover:bg-[#111827]/20 transition-all">
                  <Volume2 size={12} />
                  <span className="text-[10px] font-semibold">{lang === 'ko' ? '발음 듣기' : lang === 'zh' ? '听发음' : 'Listen'}</span>
                </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* 5. Tax Refund Calculator */}
      <TaxRefundMiniCard lang={lang} />

      {/* 6. Exchange Rate Calculator */}
      <div className={card} style={snapStyle}>
        <p className="text-[10px] text-[#6B7280] font-medium mb-2">{lang === 'ko' ? '환율 계산기' : lang === 'zh' ? '汇率计算器' : 'Currency Converter'}</p>
        <ExchangeRateCard exchangeRate={exchangeRate} lang={lang} compact />
      </div>
    </HScrollSection>
  )
}

export default PersonalSection