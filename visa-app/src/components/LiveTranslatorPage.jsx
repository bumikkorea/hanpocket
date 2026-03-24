/**
 * LiveTranslatorPage — 실시간 통역기
 * 대화 모드: 중문↔한국어 채팅형 (나/상대방 버튼)
 * 텍스트 모드: 음성→텍스트 / 텍스트→음성
 * 카메라 모드: 사진 번역 오버레이
 */
import { useState, useRef, useCallback, useEffect } from 'react'
import { Mic, MicOff, Volume2, RotateCcw, ChevronLeft, Square, ArrowLeftRight, Camera } from 'lucide-react'

const PROXY = import.meta.env.VITE_TRANSLATE_AB_PROXY || 'https://hanpocket-translate-ab.bumik-korea.workers.dev'

const LANG = {
  zh: { label: '中文', code: 'zh-CN', placeholder: '중국어를 입력하거나 말하세요…' },
  ko: { label: '한국어', code: 'ko-KR', placeholder: '한국어를 입력하거나 말하세요…' },
}

async function googleTranslate(text, from, to) {
  const sl = from === 'zh' ? 'zh-CN' : 'ko'
  const tl = to  === 'zh' ? 'zh-CN' : 'ko'
  const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${sl}&tl=${tl}&dt=t&q=${encodeURIComponent(text)}`
  const r = await fetch(url)
  const d = await r.json()
  return d[0].map(s => s[0]).join('')
}

// 이미지 리사이즈 + 압축
function fileToBase64(file, maxPx = 1024, quality = 0.82) {
  return new Promise((resolve, reject) => {
    const img = new Image()
    const url = URL.createObjectURL(file)
    img.onload = () => {
      URL.revokeObjectURL(url)
      const scale = Math.min(1, maxPx / Math.max(img.width, img.height))
      const w = Math.round(img.width * scale)
      const h = Math.round(img.height * scale)
      const canvas = document.createElement('canvas')
      canvas.width = w; canvas.height = h
      canvas.getContext('2d').drawImage(img, 0, 0, w, h)
      resolve(canvas.toDataURL('image/jpeg', quality).split(',')[1])
    }
    img.onerror = reject
    img.src = url
  })
}

// ─── 채팅 말풍선 ──────────────────────────────────────────────
function ChatBubble({ entry, onSpeak }) {
  const isA = entry.side === 'A'
  return (
    <div style={{ marginBottom: 18, display: 'flex', flexDirection: 'column', alignItems: isA ? 'flex-end' : 'flex-start' }}>
      <span style={{ fontSize: 10, color: '#bbb', marginBottom: 5, fontWeight: 600 }}>
        {isA ? `나  ·  ${LANG.zh.label}` : `상대방  ·  ${LANG.ko.label}`}
      </span>
      {/* 원문 */}
      <div style={{
        maxWidth: '82%', padding: '11px 15px',
        borderRadius: isA ? '18px 18px 5px 18px' : '18px 18px 18px 5px',
        background: isA ? '#1A1A1A' : 'white',
        color: isA ? 'white' : '#1A1A1A',
        fontSize: 16, lineHeight: 1.55, fontWeight: 500,
        boxShadow: '0 1px 6px rgba(0,0,0,0.08)',
        border: isA ? 'none' : '1px solid rgba(0,0,0,0.08)',
        marginBottom: 5,
        wordBreak: 'keep-all',
      }}>
        {entry.original}
      </div>
      {/* 번역 */}
      <div style={{
        maxWidth: '82%', padding: '9px 15px',
        borderRadius: isA ? '12px 12px 4px 12px' : '12px 12px 12px 4px',
        background: isA ? '#ECFDF5' : '#EFF6FF',
        color: isA ? '#059669' : '#2563EB',
        fontSize: 14, lineHeight: 1.55, fontStyle: 'italic',
        display: 'flex', alignItems: 'center', gap: 10,
      }}>
        <span style={{ flex: 1, wordBreak: 'keep-all' }}>{entry.translation}</span>
        <button onClick={() => onSpeak(entry.translation, LANG[entry.toLang].code)} style={{
          background: 'none', border: 'none', cursor: 'pointer', padding: 2, flexShrink: 0,
          color: isA ? '#059669' : '#2563EB', opacity: 0.7,
        }}>
          <Volume2 size={15} />
        </button>
      </div>
    </div>
  )
}

// ─── Main ─────────────────────────────────────────────────────
export default function LiveTranslatorPage({ lang, onBack }) {
  const [mode, setMode]           = useState('chat')  // 'chat' | 'text' | 'camera'

  // ── 대화 모드 state ──
  const [chatLog, setChatLog]         = useState([])
  const [activeRec, setActiveRec]     = useState(null)  // 'A' | 'B' | null
  const [chatInterim, setChatInterim] = useState({ side: null, text: '' })

  // ── 텍스트 모드 state ──
  const [dirIdx, setDirIdx]           = useState(0)  // 0: zh→ko, 1: ko→zh
  const [inputText, setInputText]     = useState('')
  const [interimText, setInterimText] = useState('')
  const [translated, setTranslated]   = useState('')
  const [isListening, setIsListening] = useState(false)
  const [isTranslating, setIsTranslating] = useState(false)
  const [isSpeaking, setIsSpeaking]   = useState(false)

  // ── 카메라 state ──
  const [cameraImg, setCameraImg]         = useState(null)
  const [cameraLoading, setCameraLoading] = useState(false)
  const [overlayBlocks, setOverlayBlocks] = useState([])
  const [showOverlay, setShowOverlay]     = useState(true)
  const [ocrText, setOcrText]             = useState('')

  const recRef      = useRef(null)
  const debounceRef = useRef(null)
  const logRef      = useRef(null)
  const fileRef     = useRef(null)

  const textDir = dirIdx === 0 ? { from: 'zh', to: 'ko' } : { from: 'ko', to: 'zh' }

  // 채팅 로그 자동 스크롤
  useEffect(() => {
    if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight
  }, [chatLog, chatInterim])

  // ── TTS ──
  const speak = useCallback((text, code) => {
    if (!window.speechSynthesis) return
    window.speechSynthesis.cancel()
    const u = new SpeechSynthesisUtterance(text)
    u.lang = code; u.rate = 0.9
    u.onend = () => setIsSpeaking(false)
    u.onerror = () => setIsSpeaking(false)
    setIsSpeaking(true)
    window.speechSynthesis.speak(u)
  }, [])

  const stopSpeak = () => { window.speechSynthesis?.cancel(); setIsSpeaking(false) }

  // ── 텍스트 모드 번역 ──
  const doTranslate = useCallback(async (text) => {
    if (!text?.trim()) { setTranslated(''); return }
    setIsTranslating(true)
    try {
      const r = await googleTranslate(text, textDir.from, textDir.to)
      setTranslated(r)
    } catch { setTranslated('(번역 오류)') }
    finally { setIsTranslating(false) }
  }, [textDir])

  const handleTextChange = (val) => {
    setInputText(val)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => doTranslate(val), 600)
  }

  // ── 텍스트 모드 STT ──
  const startListening = () => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SR) { alert('이 브라우저는 음성인식 미지원'); return }
    if (recRef.current) recRef.current.stop()
    const rec = new SR()
    rec.lang = LANG[textDir.from].code
    rec.continuous = true; rec.interimResults = true
    rec.onresult = (e) => {
      let interim = '', final = ''
      for (const r of e.results) {
        if (r.isFinal) final += r[0].transcript
        else interim += r[0].transcript
      }
      setInterimText(interim)
      if (final) { setInputText(final); setInterimText(''); doTranslate(final) }
    }
    rec.onerror = () => setIsListening(false)
    rec.onend   = () => setIsListening(false)
    recRef.current = rec; rec.start(); setIsListening(true)
  }

  const stopListening = () => { recRef.current?.stop(); setIsListening(false); setInterimText('') }

  // ── 대화 모드 STT ──
  const startChatListen = (side) => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SR) { alert('음성인식 미지원'); return }
    if (recRef.current) recRef.current.stop()
    const fromLang = side === 'A' ? 'zh' : 'ko'
    const toLang   = side === 'A' ? 'ko' : 'zh'
    const rec = new SR()
    rec.lang = LANG[fromLang].code
    rec.continuous = false; rec.interimResults = true
    rec.onresult = (e) => {
      let interim = '', final = ''
      for (const r of e.results) {
        if (r.isFinal) final += r[0].transcript
        else interim += r[0].transcript
      }
      setChatInterim({ side, text: interim || final })
      if (final) {
        setChatInterim({ side: null, text: '' })
        googleTranslate(final, fromLang, toLang)
          .then(translation => {
            setChatLog(p => [...p, { id: Date.now(), side, original: final, translation, fromLang, toLang }])
          })
          .catch(() => {
            setChatLog(p => [...p, { id: Date.now(), side, original: final, translation: '(번역 오류)', fromLang, toLang }])
          })
      }
    }
    rec.onerror = () => { setActiveRec(null); setChatInterim({ side: null, text: '' }) }
    rec.onend   = () => { setActiveRec(null); setChatInterim({ side: null, text: '' }) }
    recRef.current = rec; rec.start(); setActiveRec(side)
  }

  const stopChatListen = () => {
    recRef.current?.stop()
    setActiveRec(null); setChatInterim({ side: null, text: '' })
  }

  // ── 카메라 ──
  const handleFileChange = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setCameraImg(URL.createObjectURL(file))
    setCameraLoading(true); setOverlayBlocks([]); setOcrText(''); setShowOverlay(true)
    try {
      const base64 = await fileToBase64(file)
      const r = await fetch(`${PROXY}/translate/camera`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: base64, mimeType: 'image/jpeg', from: 'ko', to: 'zh' }),
      })
      const d = await r.json()
      if (d.blocks?.length > 0) setOverlayBlocks(d.blocks)
      setOcrText(d.ocr || '')
    } catch (err) { setOcrText(`오류: ${err.message}`) }
    finally { setCameraLoading(false) }
  }

  // ── 리셋 ──
  const reset = () => {
    recRef.current?.stop()
    window.speechSynthesis?.cancel()
    setActiveRec(null); setChatInterim({ side: null, text: '' }); setChatLog([])
    setInputText(''); setInterimText(''); setTranslated('')
    setIsListening(false); setIsTranslating(false); setIsSpeaking(false)
    setCameraImg(null); setOverlayBlocks([]); setOcrText(''); setCameraLoading(false)
  }

  const handleModeChange = (m) => { setMode(m); reset() }

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9800,
      background: '#F2F2F2', display: 'flex', flexDirection: 'column',
      fontFamily: 'Inter, "Noto Sans SC", Pretendard, sans-serif',
    }}>

      {/* ── 헤더 ── */}
      <div style={{
        display: 'flex', alignItems: 'center', height: 54, padding: '0 16px',
        background: 'white', borderBottom: '1px solid rgba(0,0,0,0.07)', flexShrink: 0,
      }}>
        <button onClick={onBack} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0 12px 0 0', display: 'flex' }}>
          <ChevronLeft size={23} color="#1A1A1A" />
        </button>
        <span style={{ fontSize: 17, fontWeight: 800, flex: 1, letterSpacing: '-0.3px' }}>실시간 통역기</span>
        <button onClick={reset} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 6, display: 'flex' }}>
          <RotateCcw size={18} color="#bbb" />
        </button>
      </div>

      {/* ── 모드 탭 ── */}
      <div style={{ display: 'flex', padding: '10px 16px', background: 'white', gap: 8, flexShrink: 0, borderBottom: '1px solid rgba(0,0,0,0.05)' }}>
        {[
          { id: 'chat',   label: '대화 모드',  icon: '💬' },
          { id: 'text',   label: '텍스트',     icon: '📝' },
          { id: 'camera', label: '카메라',     icon: '📷' },
        ].map(m => (
          <button key={m.id} onClick={() => handleModeChange(m.id)} style={{
            flex: 1, height: 42, borderRadius: 12,
            background: mode === m.id ? '#1A1A1A' : '#F2F2F2',
            color: mode === m.id ? 'white' : '#777',
            border: 'none', fontSize: 12, fontWeight: 700, cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5,
            transition: 'all 0.15s',
          }}>
            <span>{m.icon}</span>
            <span>{m.label}</span>
          </button>
        ))}
      </div>

      {/* ════════════════ 대화 모드 ════════════════ */}
      {mode === 'chat' && (
        <>
          {/* 언어 안내 배너 */}
          <div style={{
            padding: '8px 16px', background: 'white',
            borderBottom: '1px solid rgba(0,0,0,0.05)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12,
            flexShrink: 0,
          }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: '#1A1A1A' }}>中文</span>
            <span style={{ fontSize: 11, color: '#bbb' }}>↔</span>
            <span style={{ fontSize: 13, fontWeight: 700, color: '#1A1A1A' }}>한국어</span>
            <span style={{ fontSize: 11, color: '#bbb', marginLeft: 4 }}>· 자동 번역</span>
          </div>

          {/* 채팅 로그 */}
          <div ref={logRef} style={{ flex: 1, overflowY: 'auto', padding: '20px 16px 12px' }}>
            {chatLog.length === 0 && !chatInterim.text ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: 10, paddingBottom: 60 }}>
                <span style={{ fontSize: 48 }}>💬</span>
                <p style={{ fontSize: 15, color: '#bbb', textAlign: 'center', margin: 0, lineHeight: 1.6 }}>
                  아래 버튼을 눌러 대화를 시작하세요
                </p>
                <p style={{ fontSize: 12, color: '#ddd', textAlign: 'center', margin: 0 }}>
                  버튼을 누르는 동안 녹음됩니다
                </p>
              </div>
            ) : (
              <>
                {chatLog.map(entry => (
                  <ChatBubble key={entry.id} entry={entry} onSpeak={speak} />
                ))}
                {chatInterim.text && (
                  <div style={{ display: 'flex', justifyContent: chatInterim.side === 'A' ? 'flex-end' : 'flex-start', marginBottom: 8 }}>
                    <div style={{
                      maxWidth: '80%', padding: '11px 15px', borderRadius: 18,
                      background: chatInterim.side === 'A' ? '#333' : '#E8E8E8',
                      color: chatInterim.side === 'A' ? 'rgba(255,255,255,0.7)' : '#aaa',
                      fontSize: 15, fontStyle: 'italic',
                    }}>
                      {chatInterim.text}
                      <span style={{ animation: 'blink 1s infinite', marginLeft: 2 }}>…</span>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

          {/* 대화 버튼 2개 */}
          <div style={{
            flexShrink: 0, padding: '14px 16px 32px',
            background: 'white', borderTop: '1px solid rgba(0,0,0,0.07)',
            display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10,
          }}>
            {/* 나 (중국어) */}
            <button
              onPointerDown={() => startChatListen('A')}
              onPointerUp={stopChatListen}
              onPointerCancel={stopChatListen}
              style={{
                height: 80, borderRadius: 18, border: 'none', cursor: 'pointer',
                background: activeRec === 'A' ? '#EF4444' : '#1A1A1A',
                color: 'white', display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center', gap: 5,
                transition: 'background 0.15s', userSelect: 'none', WebkitUserSelect: 'none',
                boxShadow: activeRec === 'A' ? '0 0 0 4px rgba(239,68,68,0.25)' : '0 2px 10px rgba(0,0,0,0.15)',
              }}
            >
              {activeRec === 'A'
                ? <><MicOff size={24} /><span style={{ fontSize: 12, fontWeight: 700 }}>듣는 중…</span></>
                : <>
                    <Mic size={24} />
                    <span style={{ fontSize: 13, fontWeight: 800 }}>내가 말하기</span>
                    <span style={{ fontSize: 11, opacity: 0.55 }}>中文으로</span>
                  </>
              }
            </button>

            {/* 상대방 (한국어) */}
            <button
              onPointerDown={() => startChatListen('B')}
              onPointerUp={stopChatListen}
              onPointerCancel={stopChatListen}
              style={{
                height: 80, borderRadius: 18, cursor: 'pointer',
                background: activeRec === 'B' ? '#EF4444' : 'white',
                color: activeRec === 'B' ? 'white' : '#1A1A1A',
                border: activeRec === 'B' ? 'none' : '2px solid #1A1A1A',
                display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center', gap: 5,
                transition: 'all 0.15s', userSelect: 'none', WebkitUserSelect: 'none',
                boxShadow: activeRec === 'B' ? '0 0 0 4px rgba(239,68,68,0.25)' : 'none',
              }}
            >
              {activeRec === 'B'
                ? <><MicOff size={24} /><span style={{ fontSize: 12, fontWeight: 700 }}>듣는 중…</span></>
                : <>
                    <Mic size={24} />
                    <span style={{ fontSize: 13, fontWeight: 800 }}>상대방 말하기</span>
                    <span style={{ fontSize: 11, opacity: 0.45 }}>한국어로</span>
                  </>
              }
            </button>
          </div>
        </>
      )}

      {/* ════════════════ 텍스트 모드 ════════════════ */}
      {mode === 'text' && (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          {/* 방향 토글 */}
          <div style={{
            padding: '10px 16px', background: 'white',
            borderBottom: '1px solid rgba(0,0,0,0.05)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0,
          }}>
            <button
              onClick={() => { setDirIdx(v => 1 - v); setInputText(''); setTranslated(''); setInterimText('') }}
              style={{
                display: 'flex', alignItems: 'center', gap: 10, padding: '8px 20px',
                borderRadius: 24, background: '#F2F2F2', border: 'none', cursor: 'pointer',
              }}
            >
              <span style={{ fontSize: 14, fontWeight: 800, color: '#1A1A1A' }}>{LANG[textDir.from].label}</span>
              <ArrowLeftRight size={15} color="#999" />
              <span style={{ fontSize: 14, fontWeight: 800, color: '#1A1A1A' }}>{LANG[textDir.to].label}</span>
            </button>
          </div>

          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '12px 14px', gap: 10, overflow: 'hidden' }}>

            {/* 입력창 */}
            <div style={{
              flex: 1, borderRadius: 18, background: 'white',
              border: `2px solid ${isListening ? '#EF4444' : 'rgba(0,0,0,0.08)'}`,
              display: 'flex', flexDirection: 'column', padding: '14px 16px 54px',
              position: 'relative', overflow: 'hidden', transition: 'border-color 0.2s',
            }}>
              <span style={{ fontSize: 11, fontWeight: 800, color: '#bbb', letterSpacing: '0.07em', textTransform: 'uppercase', marginBottom: 10 }}>
                {LANG[textDir.from].label}
              </span>
              <textarea
                value={inputText}
                onChange={e => handleTextChange(e.target.value)}
                placeholder={LANG[textDir.from].placeholder}
                style={{
                  flex: 1, border: 'none', outline: 'none', resize: 'none',
                  fontSize: 20, lineHeight: 1.6, color: '#1A1A1A',
                  background: 'transparent', fontFamily: 'inherit',
                }}
              />
              {interimText && (
                <p style={{ fontSize: 16, color: '#bbb', margin: '4px 0 0', fontStyle: 'italic' }}>{interimText}…</p>
              )}
              {/* 마이크 버튼 */}
              <button
                onClick={isListening ? stopListening : startListening}
                style={{
                  position: 'absolute', bottom: 14, right: 14,
                  width: 46, height: 46, borderRadius: '50%', border: 'none', cursor: 'pointer',
                  background: isListening ? '#EF4444' : '#1A1A1A',
                  color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  transition: 'background 0.15s',
                  boxShadow: isListening ? '0 0 0 4px rgba(239,68,68,0.2)' : '0 2px 8px rgba(0,0,0,0.18)',
                }}
              >
                {isListening ? <MicOff size={20} /> : <Mic size={20} />}
              </button>
            </div>

            {/* 번역 결과창 */}
            <div style={{
              flex: 1, borderRadius: 18, background: 'white',
              border: '2px solid rgba(0,0,0,0.06)',
              display: 'flex', flexDirection: 'column', padding: '14px 16px 54px',
              position: 'relative', overflow: 'hidden',
            }}>
              <span style={{ fontSize: 11, fontWeight: 800, color: '#bbb', letterSpacing: '0.07em', textTransform: 'uppercase', marginBottom: 10 }}>
                {LANG[textDir.to].label}
              </span>
              <div style={{ flex: 1, overflowY: 'auto' }}>
                {isTranslating ? (
                  <span style={{ fontSize: 17, color: '#ccc' }}>번역 중…</span>
                ) : translated ? (
                  <p style={{ fontSize: 20, lineHeight: 1.6, color: '#1A1A1A', margin: 0 }}>{translated}</p>
                ) : (
                  <span style={{ fontSize: 15, color: '#e0e0e0' }}>번역 결과</span>
                )}
              </div>
              {/* 재생 버튼 */}
              {translated && !isTranslating && (
                <button
                  onClick={isSpeaking ? stopSpeak : () => speak(translated, LANG[textDir.to].code)}
                  style={{
                    position: 'absolute', bottom: 14, right: 14,
                    width: 46, height: 46, borderRadius: '50%', border: 'none', cursor: 'pointer',
                    background: isSpeaking ? '#EF4444' : '#059669',
                    color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    transition: 'background 0.15s',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                  }}
                >
                  {isSpeaking ? <Square size={18} fill="white" /> : <Volume2 size={20} />}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ════════════════ 카메라 모드 ════════════════ */}
      {mode === 'camera' && (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <input ref={fileRef} type="file" accept="image/*" capture="environment" style={{ display: 'none' }} onChange={handleFileChange} />

          {cameraImg ? (
            <>
              {/* 이미지 + 오버레이 — 스크롤 가능 영역 */}
              <div style={{ flex: 1, overflowY: 'auto', background: '#111' }}>
                {/* 이미지 래퍼: position:relative + width:100% + height:auto
                    → overlay % 좌표가 이미지 픽셀과 1:1 매핑됨 */}
                <div style={{ position: 'relative', width: '100%', lineHeight: 0 }}>
                  <img
                    src={cameraImg} alt="capture"
                    style={{
                      width: '100%', height: 'auto', display: 'block',
                      opacity: cameraLoading ? 0.35 : 1, transition: 'opacity 0.25s',
                    }}
                  />

                  {/* 번역 오버레이 — 이미지 위에 정확히 위치 */}
                  {!cameraLoading && showOverlay && overlayBlocks.map((b, i) => (
                    <div key={i} style={{
                      position: 'absolute',
                      left:   `${b.x1}%`,
                      top:    `${b.y1}%`,
                      width:  `${Math.max(b.x2 - b.x1, 4)}%`,
                      height: `${Math.max(b.y2 - b.y1, 3)}%`,
                      background: 'rgba(255,255,255,0.94)',
                      borderRadius: 3, boxSizing: 'border-box',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      padding: '1px 3px', overflow: 'hidden',
                    }}>
                      <span style={{
                        fontSize: `clamp(8px, ${(b.y2 - b.y1) * 0.3}vw, 15px)`,
                        fontWeight: 700, color: '#111',
                        lineHeight: 1.15, textAlign: 'center', wordBreak: 'keep-all',
                      }}>{b.trans}</span>
                    </div>
                  ))}

                  {/* 로딩 오버레이 */}
                  {cameraLoading && (
                    <div style={{
                      position: 'absolute', inset: 0,
                      display: 'flex', flexDirection: 'column',
                      alignItems: 'center', justifyContent: 'center', gap: 10,
                    }}>
                      <span style={{ color: 'white', fontSize: 15, fontWeight: 700, textShadow: '0 1px 4px rgba(0,0,0,0.6)' }}>분석 중…</span>
                      <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: 12 }}>텍스트 인식 + 번역</span>
                    </div>
                  )}

                  {/* 원문/번역 토글 */}
                  {!cameraLoading && overlayBlocks.length > 0 && (
                    <button onClick={() => setShowOverlay(v => !v)} style={{
                      position: 'absolute', top: 10, right: 10,
                      background: 'rgba(0,0,0,0.65)', border: 'none', borderRadius: 20,
                      color: 'white', fontSize: 12, fontWeight: 700, cursor: 'pointer',
                      padding: '5px 13px', backdropFilter: 'blur(4px)',
                    }}>
                      {showOverlay ? '원문 보기' : '번역 보기'}
                    </button>
                  )}
                </div>
              </div>

              {/* 폴백 텍스트 */}
              {!cameraLoading && ocrText && overlayBlocks.length === 0 && (
                <div style={{ background: 'white', padding: '12px 16px', borderTop: '1px solid rgba(0,0,0,0.07)' }}>
                  <p style={{ fontSize: 11, color: '#aaa', margin: '0 0 4px', fontWeight: 700, textTransform: 'uppercase' }}>인식 결과</p>
                  <p style={{ fontSize: 14, color: '#333', margin: 0 }}>{ocrText}</p>
                </div>
              )}

              <div style={{ padding: '12px 16px 28px', background: 'white', borderTop: '1px solid rgba(0,0,0,0.07)', flexShrink: 0 }}>
                <button onClick={() => fileRef.current?.click()} style={{
                  width: '100%', height: 50, borderRadius: 14, cursor: 'pointer',
                  background: 'white', color: '#1A1A1A', border: '2px solid #1A1A1A',
                  fontSize: 14, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                }}>
                  <Camera size={18} /> 다시 촬영
                </button>
              </div>
            </>
          ) : (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 32, gap: 20 }}>
              <span style={{ fontSize: 64 }}>📷</span>
              <div style={{ textAlign: 'center' }}>
                <p style={{ fontSize: 16, fontWeight: 700, color: '#1A1A1A', margin: '0 0 8px' }}>한국어 간판 · 메뉴판 번역</p>
                <p style={{ fontSize: 13, color: '#aaa', margin: 0, lineHeight: 1.6 }}>사진을 찍으면 텍스트 위치에<br/>중국어 번역을 표시합니다</p>
              </div>
              <button onClick={() => fileRef.current?.click()} style={{
                width: '100%', maxWidth: 280, height: 56, borderRadius: 16, cursor: 'pointer',
                background: '#1A1A1A', color: 'white', border: 'none',
                fontSize: 16, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
              }}>
                <Camera size={22} /> 촬영하기
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
