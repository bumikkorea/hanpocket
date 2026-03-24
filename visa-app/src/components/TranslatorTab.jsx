import { useState, useRef } from 'react'
import { Volume2, Copy, Check, ChevronLeft, Search, Languages, Heart, Mic, Camera } from 'lucide-react'
import { trackTranslation, trackEvent } from '../utils/analytics'
import LiveTranslatorPage from './LiveTranslatorPage.jsx'

function L(lang, d) { if (typeof d === 'string') return d; return d?.[lang] || d?.en || d?.zh || d?.ko || '' }


// Detect if text is primarily Chinese characters
function isChinese(text) {
  const zhChars = text.match(/[\u4e00-\u9fff]/g)
  return zhChars && zhChars.length > text.replace(/\s/g, '').length * 0.3
}

// Detect if text is primarily Korean characters
function isKorean(text) {
  const koChars = text.match(/[\uac00-\ud7af\u3130-\u318f]/g)
  return koChars && koChars.length > text.replace(/\s/g, '').length * 0.3
}

// Real translation via Google Translate API
async function translateText(text) {
  if (!text.trim()) return { result: '', from: '', to: '' }
  const trimmed = text.trim()

  // Auto-detect direction
  let sl, tl
  if (isChinese(trimmed)) {
    sl = 'zh-CN'; tl = 'ko'
  } else if (isKorean(trimmed)) {
    sl = 'ko'; tl = 'zh-CN'
  } else {
    // English or other → Korean
    sl = 'auto'; tl = 'ko'
  }

  try {
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${sl}&tl=${tl}&dt=t&q=${encodeURIComponent(trimmed)}`
    const resp = await fetch(url)
    const data = await resp.json()
    const result = data[0].map(s => s[0]).join('')
    return { result, from: sl, to: tl }
  } catch (err) {
    console.error('Translation error:', err)
    return {
      result: L('ko', {
        ko: '(번역 서비스에 연결할 수 없습니다. 인터넷 연결을 확인해주세요.)',
        zh: '(无法连接翻译服务。请检查网络连接。)',
        en: '(Cannot connect to translation service. Check your internet.)'
      }),
      from: sl, to: tl
    }
  }
}

function speak(text) {
  try {
    if (!('speechSynthesis' in window)) {
      console.warn('Web Speech API not available')
      return
    }
    window.speechSynthesis.cancel()
    const u = new SpeechSynthesisUtterance(text)
    u.lang = 'ko-KR'
    u.rate = 0.85
    window.speechSynthesis.speak(u)
  } catch (err) {
    console.warn('Web Speech API unavailable:', err)
    // Silent fail for better UX
  }
}

const FAVORITES_KEY = 'hp_translator_favorites'

export default function TranslatorTab({ lang }) {
  const [showLive, setShowLive] = useState(false)
  const [selected, setSelected] = useState(null)
  const [customText, setCustomText] = useState('')
  const [customResult, setCustomResult] = useState('')
  const [copiedIdx, setCopiedIdx] = useState(null)
  const [translating, setTranslating] = useState(false)
  const [translateDir, setTranslateDir] = useState('')
  const [searchQ, setSearchQ] = useState('')
  const [favorites, setFavorites] = useState(() => {
    try { return JSON.parse(localStorage.getItem(FAVORITES_KEY)) || [] }
    catch { return [] }
  })

  const copyText = (text, idx) => {
    navigator.clipboard.writeText(text).catch(() => {})
    setCopiedIdx(idx)
    setTimeout(() => setCopiedIdx(null), 1500)
    
    // 번역 텍스트 복사 이벤트 추적
    trackEvent('translation_text_copied', {
      event_category: 'translation',
      event_label: 'copy_text',
      text_length: text.length,
      feature: 'translator'
    })
  }

  const toggleFavorite = (phrase, situationId) => {
    const key = `${situationId}-${phrase.zh}`
    const isFav = favorites.some(f => f.key === key)
    let newFavorites
    if (isFav) {
      newFavorites = favorites.filter(f => f.key !== key)
    } else {
      newFavorites = [...favorites, { ...phrase, key, situationId }]
    }
    setFavorites(newFavorites)
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(newFavorites))
  }

  const isFavorite = (phrase, situationId) => {
    return favorites.some(f => f.key === `${situationId}-${phrase.zh}`)
  }

  const handleCustomTranslate = async () => {
    if (!customText.trim() || translating) return
    setTranslating(true)
    setCustomResult('')
    
    try {
      const { result, from, to } = await translateText(customText)
      setCustomResult(result)
      const dirLabel = from === 'zh-CN' ? '中→韩' : from === 'ko' ? '韩→中' : '→韩'
      setTranslateDir(dirLabel)
      
      trackTranslation('auto', lang, 'text', {
        source_text_length: customText.length,
        feature: 'realtime_translator',
        direction: `${from}→${to}`,
        has_result: !!result
      })
    } catch (err) {
      setCustomResult(L(lang, { ko: '번역 중 오류가 발생했습니다.', zh: '翻译出错。', en: 'Translation error.' }))
    } finally {
      setTranslating(false)
    }
  }

  if (selected) {
    if (selected === 'favorites') {
      const filtered = searchQ
        ? favorites.filter(p => p.zh.includes(searchQ) || p.ko.includes(searchQ) || p.en.toLowerCase().includes(searchQ.toLowerCase()))
        : favorites
      return (
        <div className="space-y-4 animate-fade-up">
          <button onClick={() => { setSelected(null); setSearchQ('') }} className="flex items-center gap-1 text-sm text-[#6B7280] hover:text-[#111827] transition-colors">
            <ChevronLeft size={16} />
            {L(lang, { ko: '뒤로', zh: '返回', en: 'Back' })}
          </button>
          <div className="flex items-center gap-3">
            <Heart size={20} className="text-red-500" fill="currentColor" />
            <div>
              <h2 className="text-lg font-bold text-[#111827]">{L(lang, { ko: '즐겨찾기', zh: '收藏夹', en: 'Favorites' })}</h2>
              <p className="text-xs text-[#6B7280]">{favorites.length} {L(lang, { ko: '개 표현', zh: '个表达', en: 'phrases' })}</p>
            </div>
          </div>

          {favorites.length > 0 && (
            <div className="relative">
              <Search size={16} className="absolute left-3 top-3 text-[#9CA3AF]" />
              <input type="text" value={searchQ} onChange={e => setSearchQ(e.target.value)}
                placeholder={L(lang, { ko: '즐겨찾기 검색...', zh: '搜索收藏...', en: 'Search favorites...' })}
                className="w-full bg-[#F3F4F6] rounded-xl pl-10 pr-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#111827]/10" />
            </div>
          )}

          <div className="space-y-3">
            {filtered.length === 0 && favorites.length === 0 && (
              <div className="text-center py-12 text-[#9CA3AF] text-sm">
                {L(lang, { ko: '즐겨찾기한 표현이 없습니다', zh: '没有收藏的表达', en: 'No favorite phrases yet' })}
              </div>
            )}
            {filtered.map((p, i) => (
              <div key={i} className="bg-white rounded-2xl p-5 border border-[#E5E7EB] card-glow">
                <p className="text-sm font-semibold text-[#111827]">{p.zh}</p>
                <p className="text-base font-bold text-[#111827] mt-2">{p.ko}</p>
                <p className="text-xs text-[#9CA3AF] mt-1 italic">[{p.pron}]</p>
                <p className="text-xs text-[#6B7280] mt-1">{p.en}</p>
                <div className="flex gap-2 mt-3">
                  <button onClick={() => speak(p.ko)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-[#F3F4F6] rounded-lg text-xs text-[#111827] hover:bg-[#E5E7EB] transition-colors">
                    <Volume2 size={14} /> {L(lang, { ko: '듣기', zh: '听', en: 'Listen' })}
                  </button>
                  <button onClick={() => copyText(p.ko, `fav-${i}`)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-[#F3F4F6] rounded-lg text-xs text-[#111827] hover:bg-[#E5E7EB] transition-colors">
                    {copiedIdx === `fav-${i}` ? <Check size={14} /> : <Copy size={14} />}
                    {copiedIdx === `fav-${i}` ? L(lang, { ko: '복사됨', zh: '已复制', en: 'Copied' }) : L(lang, { ko: '복사', zh: '复制', en: 'Copy' })}
                  </button>
                  <button onClick={() => toggleFavorite(p, p.situationId)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg text-xs transition-colors">
                    <Heart size={14} fill="currentColor" />
                    {L(lang, { ko: '제거', zh: '移除', en: 'Remove' })}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )
    }

    const sit = situations.find(s => s.id === selected)
    const filtered = searchQ
      ? sit.phrases.filter(p => p.zh.includes(searchQ) || p.ko.includes(searchQ) || p.en.toLowerCase().includes(searchQ.toLowerCase()))
      : sit.phrases
    return (
      <div className="space-y-4 animate-fade-up">
        <button onClick={() => { setSelected(null); setSearchQ('') }} className="flex items-center gap-1 text-sm text-[#6B7280] hover:text-[#111827] transition-colors">
          <ChevronLeft size={16} />
          {L(lang, { ko: '뒤로', zh: '返回', en: 'Back' })}
        </button>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[#F3F4F6] rounded-xl flex items-center justify-center">
            <sit.icon size={20} className="text-[#111827]" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-[#111827]">{L(lang, sit.label)}</h2>
            <p className="text-xs text-[#6B7280]">{sit.phrases.length} {L(lang, { ko: '개 표현', zh: '个表达', en: 'phrases' })}</p>
          </div>
        </div>

        <div className="relative">
          <Search size={16} className="absolute left-3 top-3 text-[#9CA3AF]" />
          <input type="text" value={searchQ} onChange={e => setSearchQ(e.target.value)}
            placeholder={L(lang, { ko: '표현 검색...', zh: '搜索表达...', en: 'Search phrases...' })}
            className="w-full bg-[#F3F4F6] rounded-xl pl-10 pr-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#111827]/10" />
        </div>

        <div className="space-y-3">
          {filtered.map((p, i) => (
            <div key={i} className="bg-white rounded-2xl p-5 border border-[#E5E7EB] card-glow">
              <p className="text-sm font-semibold text-[#111827]">{p.zh}</p>
              <p className="text-base font-bold text-[#111827] mt-2">{p.ko}</p>
              <p className="text-xs text-[#9CA3AF] mt-1 italic">[{p.pron}]</p>
              <p className="text-xs text-[#6B7280] mt-1">{p.en}</p>
              <div className="flex gap-2 mt-3">
                <button onClick={() => speak(p.ko)}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-[#F3F4F6] rounded-lg text-xs text-[#111827] hover:bg-[#E5E7EB] transition-colors">
                  <Volume2 size={14} /> {L(lang, { ko: '듣기', zh: '听', en: 'Listen' })}
                </button>
                <button onClick={() => copyText(p.ko, `${selected}-${i}`)}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-[#F3F4F6] rounded-lg text-xs text-[#111827] hover:bg-[#E5E7EB] transition-colors">
                  {copiedIdx === `${selected}-${i}` ? <Check size={14} /> : <Copy size={14} />}
                  {copiedIdx === `${selected}-${i}` ? L(lang, { ko: '복사됨', zh: '已复制', en: 'Copied' }) : L(lang, { ko: '복사', zh: '复制', en: 'Copy' })}
                </button>
                <button onClick={() => toggleFavorite(p, selected)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs transition-colors ${
                    isFavorite(p, selected) 
                      ? 'bg-red-50 text-red-600 hover:bg-red-100' 
                      : 'bg-[#F3F4F6] text-[#111827] hover:bg-[#E5E7EB]'
                  }`}>
                  <Heart size={14} fill={isFavorite(p, selected) ? 'currentColor' : 'none'} />
                  {L(lang, { ko: '즐겨찾기', zh: '收藏', en: 'Favorite' })}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (showLive) return <LiveTranslatorPage lang={lang} onBack={() => setShowLive(false)} />

  return (
    <div className="space-y-5 animate-fade-up">
      {/* ── 실시간 통역기 A·B·C·D ── */}
      <button
        onClick={() => setShowLive(true)}
        style={{
          width: '100%', borderRadius: 16, padding: '16px 18px',
          background: '#1A1A1A', border: 'none', cursor: 'pointer',
          display: 'flex', alignItems: 'center', gap: 14, textAlign: 'left',
        }}
      >
        <div style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(255,255,255,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <Mic size={22} color="white" />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ fontSize: 14, fontWeight: 700, color: 'white', margin: '0 0 3px' }}>
            실시간 통역기
          </p>
          <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.55)', margin: 0 }}>
            🎤음성 · 📝텍스트 · 📷카메라  ·  A Qwen / B DeepSeek / C Google / D Qwen-MT
          </p>
        </div>
        <Camera size={16} color="rgba(255,255,255,0.4)" style={{ flexShrink: 0 }} />
      </button>
      {/* Real-time translation */}
      <div className="bg-white rounded-2xl p-5 border border-[#E5E7EB] card-glow">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Languages size={18} className="text-[#111827]" />
            <h3 className="font-bold text-[#111827] text-sm">{L(lang, { ko: '실시간 통역', zh: '实时翻译', en: 'Real-time Translation' })}</h3>
          </div>
          <span className="text-[10px] text-[#9CA3AF] bg-[#F3F4F6] px-2 py-0.5 rounded-full">
            {L(lang, { ko: '자동 감지', zh: '自动检测', en: 'Auto-detect' })}
          </span>
        </div>
        <p className="text-[11px] text-[#9CA3AF] mb-2">
          {L(lang, { ko: '중국어 → 한국어 / 한국어 → 중국어 / 영어 → 한국어', zh: '中文→韩文 / 韩文→中文 / 英文→韩文', en: 'CN→KR / KR→CN / EN→KR' })}
        </p>
        <textarea value={customText} onChange={e => setCustomText(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleCustomTranslate() } }}
          placeholder={L(lang, { ko: '아무 언어나 입력하세요...', zh: '输入任何语言...', en: 'Type in any language...' })}
          className="w-full bg-[#F3F4F6] rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[#111827]/10 resize-none h-24 placeholder:text-[#9CA3AF]" />
        <button onClick={handleCustomTranslate} disabled={translating}
          className="w-full mt-2 bg-[#111827] text-white font-semibold py-2.5 rounded-xl text-sm hover:bg-[#1F2937] transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
          {translating
            ? L(lang, { ko: '통역 중...', zh: '翻译中...', en: 'Translating...' })
            : L(lang, { ko: '통역하기', zh: '翻译', en: 'Translate' })}
        </button>
        {customResult && (
          <div className="mt-3 bg-[#F8F9FA] rounded-xl p-4 border border-[#E5E7EB]">
            {translateDir && <p className="text-[10px] text-[#9CA3AF] mb-1">{translateDir}</p>}
            <p className="text-base font-bold text-[#111827]">{customResult}</p>
            <div className="flex gap-2 mt-3">
              <button onClick={() => speak(customResult)} className="flex items-center gap-1.5 px-3 py-1.5 bg-white rounded-lg text-xs text-[#111827] border border-[#E5E7EB] hover:bg-[#F3F4F6] transition-colors">
                <Volume2 size={14} /> {L(lang, { ko: '듣기', zh: '听', en: 'Listen' })}
              </button>
              <button onClick={() => copyText(customResult, 'custom')} className="flex items-center gap-1.5 px-3 py-1.5 bg-white rounded-lg text-xs text-[#111827] border border-[#E5E7EB] hover:bg-[#F3F4F6] transition-colors">
                {copiedIdx === 'custom' ? <Check size={14} /> : <Copy size={14} />}
                {copiedIdx === 'custom' ? L(lang, { ko: '복사됨', zh: '已复制', en: 'Copied' }) : L(lang, { ko: '복사', zh: '复制', en: 'Copy' })}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Situation templates — hidden */}
      {false && <h3 className="font-bold text-[#111827] text-sm">{L(lang, { ko: '상황별 통역', zh: '场景翻译', en: 'Situation Templates' })}</h3>}
      {false && <div className="grid grid-cols-2 gap-3">
        {/* Favorites section */}
        <button onClick={() => {
          setSelected('favorites')
          trackEvent('translation_section_selected', {
            section: 'favorites',
            event_category: 'translation',
            event_label: 'select_favorites'
          })
        }}
          className="bg-white rounded-2xl p-5 border border-[#E5E7EB] card-glow text-left hover:border-[#111827]/20 transition-all">
          <Heart size={22} className="text-red-500 mb-2" fill="currentColor" />
          <p className="font-bold text-[#111827] text-sm">{L(lang, { ko: '즐겨찾기', zh: '收藏夹', en: 'Favorites' })}</p>
          <p className="text-xs text-[#6B7280] mt-1">{favorites.length}</p>
        </button>
        
        {situations.map(sit => (
          <button key={sit.id} onClick={() => {}} className="hidden" />
        ))}
      </div>}
    </div>
  )
}
