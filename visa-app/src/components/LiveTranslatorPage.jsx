/**
 * LiveTranslatorPage — 실시간 통역기 A·B·C·D 비교
 * Mode: 음성→음성 / 음성→텍스트 / 텍스트→음성 / 카메라
 * A: Qwen 3.5+  B: DeepSeek V3.2  C: Google  D: Qwen MT
 */
import { useState, useRef, useCallback } from 'react'
import { Mic, MicOff, Volume2, VolumeX, RotateCcw, ChevronLeft, Camera, ArrowRightLeft, Square } from 'lucide-react'

const PROXY = import.meta.env.VITE_TRANSLATE_AB_PROXY || 'https://hanpocket-translate-ab.bumik-korea.workers.dev'

const DIRECTIONS = [
  { from: 'zh', to: 'ko', fromLang: 'zh-CN', toLang: 'ko-KR', label: '中文 → 한국어' },
  { from: 'ko', to: 'zh', fromLang: 'ko-KR', toLang: 'zh-CN', label: '한국어 → 中文' },
]

const MODES = [
  { id: 'v2v',    icon: '🎤', sub: '🔊', label: '음성→음성' },
  { id: 'v2t',    icon: '🎤', sub: '📝', label: '음성→텍스트' },
  { id: 't2v',    icon: '📝', sub: '🔊', label: '텍스트→음성' },
  { id: 'camera', icon: '📷', sub: '',   label: '카메라' },
]

const MODELS = [
  { id: 'a', name: 'Qwen 3.5+',   color: '#7C3AED', bg: '#FAF5FF' },
  { id: 'b', name: 'DeepSeek V3', color: '#2563EB', bg: '#EFF6FF' },
  { id: 'd', name: 'Qwen MT',     color: '#DC2626', bg: '#FFF5F5' },
  { id: 'c', name: 'Google',      color: '#059669', bg: '#F0FDF4' },
]

async function googleTranslate(text, from, to) {
  const sl = from === 'zh' ? 'zh-CN' : 'ko'
  const tl = to  === 'zh' ? 'zh-CN' : 'ko'
  const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${sl}&tl=${tl}&dt=t&q=${encodeURIComponent(text)}`
  const r = await fetch(url)
  const d = await r.json()
  return d[0].map(s => s[0]).join('')
}

async function workerTranslate(endpoint, text, from, to) {
  const r = await fetch(`${PROXY}${endpoint}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text, from, to }),
  })
  const d = await r.json()
  if (d.error) throw new Error(d.error)
  return d.result
}

function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const r = new FileReader()
    r.onload = () => resolve(r.result.split(',')[1])
    r.onerror = reject
    r.readAsDataURL(file)
  })
}

// ─── Result Card ─────────────────────────────────────────────
function ResultCard({ model, result, loading, latency, showPlay, isSpeaking, onToggleSpeak }) {
  return (
    <div style={{
      borderRadius: 14, overflow: 'hidden',
      border: `2px solid ${isSpeaking ? model.color : model.color + '22'}`,
      background: 'white', minWidth: 0,
      transition: 'border-color 0.2s',
    }}>
      {/* 헤더: 모델명 + 속도 */}
      <div style={{
        padding: '7px 11px 6px',
        borderBottom: `1px solid ${model.color}18`,
        background: isSpeaking ? model.color : model.bg,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        transition: 'background 0.2s',
      }}>
        <span style={{ fontSize: 10, fontWeight: 800, color: isSpeaking ? 'white' : model.color, letterSpacing: '0.07em' }}>
          {model.id.toUpperCase()} · {model.name}
        </span>
        {/* 속도 배지 */}
        {latency != null ? (
          <span style={{
            fontSize: 10, fontWeight: 700,
            color: isSpeaking ? 'rgba(255,255,255,0.85)' : model.color,
            background: isSpeaking ? 'rgba(255,255,255,0.2)' : model.color + '18',
            padding: '2px 7px', borderRadius: 20,
          }}>
            {latency < 1000 ? `${latency}ms` : `${(latency / 1000).toFixed(1)}s`}
          </span>
        ) : loading ? (
          <span style={{ fontSize: 10, color: isSpeaking ? 'rgba(255,255,255,0.6)' : '#ccc' }}>…</span>
        ) : null}
      </div>

      {/* 번역 결과 */}
      <div style={{ padding: '10px 11px', minHeight: 52, display: 'flex', alignItems: 'center' }}>
        {loading ? (
          <span style={{ fontSize: 12, color: '#ccc' }}>번역 중…</span>
        ) : result ? (
          <p style={{ fontSize: 13, color: '#1A1A1A', margin: 0, lineHeight: 1.65, wordBreak: 'keep-all' }}>{result}</p>
        ) : (
          <span style={{ fontSize: 12, color: '#e0e0e0' }}>—</span>
        )}
      </div>

      {/* 재생 토글 버튼 (음성 모드에서만) */}
      {showPlay && result && !loading && (
        <button
          onClick={onToggleSpeak}
          style={{
            width: '100%', height: 36, border: 'none', cursor: 'pointer',
            borderTop: `1px solid ${model.color}18`,
            background: isSpeaking ? model.color : model.bg,
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
            fontSize: 11, fontWeight: 700,
            color: isSpeaking ? 'white' : model.color,
            transition: 'all 0.15s ease',
          }}
        >
          {isSpeaking
            ? <><Square size={11} fill="white" />&nbsp;중지</>
            : <><Volume2 size={11} />&nbsp;재생</>
          }
        </button>
      )}
    </div>
  )
}

// ─── Main Component ───────────────────────────────────────────
export default function LiveTranslatorPage({ lang, onBack }) {
  const [dirIdx, setDirIdx]       = useState(0)
  const [mode, setMode]           = useState('v2v')
  const [inputText, setInputText] = useState('')
  const [interimText, setInterimText] = useState('')
  const [results, setResults]     = useState({ a: '', b: '', c: '', d: '' })
  const [loading, setLoading]     = useState({ a: false, b: false, c: false, d: false })
  const [latency, setLatency]     = useState({ a: null, b: null, c: null, d: null })
  const [isListening, setIsListening] = useState(false)
  const [speakingId, setSpeakingId]   = useState(null)   // 현재 재생 중인 모델 ID
  const [cameraImg, setCameraImg] = useState(null)
  const [ocrText, setOcrText]     = useState('')
  const [cameraLoading, setCameraLoading] = useState(false)

  const recognitionRef = useRef(null)
  const debounceRef    = useRef(null)
  const fileInputRef   = useRef(null)
  const dir = DIRECTIONS[dirIdx]

  // 음성 출력 토글
  const toggleSpeak = useCallback((modelId) => {
    if (speakingId === modelId) {
      window.speechSynthesis?.cancel()
      setSpeakingId(null)
      return
    }
    const text = results[modelId]
    if (!text || !window.speechSynthesis) return
    window.speechSynthesis.cancel()
    const u = new SpeechSynthesisUtterance(text)
    u.lang = dir.toLang
    u.rate = 0.88
    u.onend = () => setSpeakingId(null)
    u.onerror = () => setSpeakingId(null)
    setSpeakingId(modelId)
    window.speechSynthesis.speak(u)
  }, [speakingId, results, dir.toLang])

  // 전체 모델 병렬 번역
  const translateAll = useCallback(async (text) => {
    if (!text?.trim()) return
    const { from, to } = dir
    window.speechSynthesis?.cancel()
    setSpeakingId(null)
    setLoading({ a: true, b: true, c: true, d: true })
    setLatency({ a: null, b: null, c: null, d: null })
    setResults({ a: '', b: '', c: '', d: '' })

    const timed = async (key, fn) => {
      const t0 = Date.now()
      try {
        const result = await fn()
        setResults(p => ({ ...p, [key]: result }))
        setLatency(p => ({ ...p, [key]: Date.now() - t0 }))
      } catch (err) {
        setResults(p => ({ ...p, [key]: `(오류: ${err.message.slice(0, 50)})` }))
      } finally {
        setLoading(p => ({ ...p, [key]: false }))
      }
    }

    await Promise.all([
      timed('a', () => workerTranslate('/translate/a', text, from, to)),
      timed('b', () => workerTranslate('/translate/b', text, from, to)),
      timed('d', () => workerTranslate('/translate/d', text, from, to)),
      timed('c', () => googleTranslate(text, from, to)),
    ])
  }, [dir])

  const handleTextInput = useCallback((text) => {
    setInputText(text)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => translateAll(text), 650)
  }, [translateAll])

  // 음성 인식
  const startListening = () => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SR) { alert('이 브라우저는 음성인식 미지원'); return }
    if (recognitionRef.current) recognitionRef.current.stop()
    const rec = new SR()
    rec.lang = dir.fromLang
    rec.continuous = true
    rec.interimResults = true
    rec.onresult = (e) => {
      let interim = '', final = ''
      for (const r of e.results) {
        if (r.isFinal) final += r[0].transcript
        else interim += r[0].transcript
      }
      setInterimText(interim)
      if (final) { setInputText(final); setInterimText(''); translateAll(final) }
    }
    rec.onerror = () => setIsListening(false)
    rec.onend   = () => setIsListening(false)
    recognitionRef.current = rec
    rec.start()
    setIsListening(true)
  }

  const stopListening = () => {
    recognitionRef.current?.stop()
    setIsListening(false)
    setInterimText('')
  }

  // 카메라
  const handleFileChange = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setCameraImg(URL.createObjectURL(file))
    setCameraLoading(true)
    setOcrText('')
    try {
      const base64 = await fileToBase64(file)
      const r = await fetch(`${PROXY}/translate/camera`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: base64, mimeType: file.type, from: dir.from, to: dir.to }),
      })
      const d = await r.json()
      const ocr = d.ocr || '(인식 실패)'
      setOcrText(ocr)
      setInputText(ocr)
      await translateAll(ocr)
    } catch (err) {
      setOcrText(`(오류: ${err.message})`)
    } finally {
      setCameraLoading(false)
    }
  }

  const reset = () => {
    stopListening()
    window.speechSynthesis?.cancel()
    setSpeakingId(null)
    setInputText(''); setInterimText(''); setOcrText('')
    setResults({ a: '', b: '', c: '', d: '' })
    setLoading({ a: false, b: false, c: false, d: false })
    setLatency({ a: null, b: null, c: null, d: null })
    setCameraImg(null)
  }

  const showPlay = mode !== 'v2t'   // 음성→텍스트만 재생 버튼 숨김

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9800,
      background: '#F5F5F5', display: 'flex', flexDirection: 'column',
      fontFamily: 'Inter, "Noto Sans SC", Pretendard, sans-serif',
    }}>

      {/* ── 헤더 ── */}
      <div style={{ display: 'flex', alignItems: 'center', padding: '14px 16px 10px', background: 'white', borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
        <button onClick={onBack} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px 8px 4px 0' }}>
          <ChevronLeft size={22} color="#1A1A1A" />
        </button>
        <span style={{ fontSize: 15, fontWeight: 700 }}>실시간 통역기</span>
        <span style={{ fontSize: 11, color: '#bbb', marginLeft: 6 }}>A · B · C · D</span>
        <button onClick={reset} style={{ marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}>
          <RotateCcw size={17} color="#888" />
        </button>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '12px 14px 24px' }}>

        {/* ── 방향 토글 ── */}
        <button onClick={() => { setDirIdx(v => 1 - v); reset() }} style={{
          width: '100%', height: 42, borderRadius: 12, background: '#1A1A1A', color: 'white',
          border: 'none', cursor: 'pointer', fontSize: 14, fontWeight: 700, marginBottom: 10,
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
        }}>
          {dir.label} <ArrowRightLeft size={14} />
        </button>

        {/* ── 모드 탭 ── */}
        <div style={{ display: 'flex', gap: 6, marginBottom: 12 }}>
          {MODES.map(m => (
            <button key={m.id} onClick={() => { setMode(m.id); reset() }} style={{
              flex: 1, height: 40, borderRadius: 10,
              background: mode === m.id ? '#1A1A1A' : 'white',
              color: mode === m.id ? 'white' : '#666',
              border: mode === m.id ? 'none' : '1px solid rgba(0,0,0,0.10)',
              fontSize: 10, fontWeight: 600, cursor: 'pointer',
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 1,
            }}>
              <span style={{ fontSize: 13 }}>{m.icon}{m.sub}</span>
              <span style={{ fontSize: 9, opacity: 0.75, whiteSpace: 'nowrap' }}>{m.label}</span>
            </button>
          ))}
        </div>

        {/* ── 카메라 ── */}
        {mode === 'camera' && (
          <div style={{ marginBottom: 12 }}>
            <input ref={fileInputRef} type="file" accept="image/*" capture="environment" style={{ display: 'none' }} onChange={handleFileChange} />
            {cameraImg && (
              <div style={{ borderRadius: 12, overflow: 'hidden', marginBottom: 8, position: 'relative' }}>
                <img src={cameraImg} alt="capture" style={{ width: '100%', maxHeight: 180, objectFit: 'cover', display: 'block' }} />
                {cameraLoading && (
                  <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <span style={{ color: 'white', fontSize: 13, fontWeight: 600 }}>OCR 인식 중…</span>
                  </div>
                )}
              </div>
            )}
            {ocrText && (
              <div style={{ borderRadius: 10, background: 'white', border: '1px solid rgba(0,0,0,0.08)', padding: '9px 12px', marginBottom: 8 }}>
                <p style={{ fontSize: 10, color: '#aaa', margin: '0 0 3px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>인식된 텍스트</p>
                <p style={{ fontSize: 13, color: '#333', margin: 0, lineHeight: 1.6 }}>{ocrText}</p>
              </div>
            )}
            <button onClick={() => fileInputRef.current?.click()} style={{
              width: '100%', height: 46, borderRadius: 12, cursor: 'pointer',
              background: cameraImg ? 'white' : '#1A1A1A',
              color: cameraImg ? '#555' : 'white',
              border: cameraImg ? '1.5px solid rgba(0,0,0,0.12)' : 'none',
              fontSize: 14, fontWeight: 700,
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            }}>
              <Camera size={18} /> {cameraImg ? '다시 촬영' : '📷 촬영하기'}
            </button>
          </div>
        )}

        {/* ── 음성 입력 ── */}
        {(mode === 'v2v' || mode === 'v2t') && (
          <div style={{ marginBottom: 12 }}>
            <div style={{
              minHeight: 74, borderRadius: 12, background: 'white', marginBottom: 8,
              border: `1.5px solid ${isListening ? '#EF4444' : 'rgba(0,0,0,0.08)'}`,
              padding: '12px 14px', transition: 'border-color 0.2s',
              display: 'flex', alignItems: inputText ? 'flex-start' : 'center',
              justifyContent: !inputText && !interimText ? 'center' : 'flex-start',
            }}>
              {!inputText && !interimText
                ? <span style={{ color: '#ccc', fontSize: 13 }}>{isListening ? '듣고 있어요…' : '마이크를 눌러 말하세요'}</span>
                : <div>
                    <p style={{ fontSize: 15, color: '#1A1A1A', margin: 0, lineHeight: 1.6 }}>{inputText}</p>
                    {interimText && <p style={{ fontSize: 13, color: '#bbb', margin: '4px 0 0', fontStyle: 'italic' }}>{interimText}</p>}
                  </div>
              }
            </div>
            <button onClick={isListening ? stopListening : startListening} style={{
              width: '100%', height: 50, borderRadius: 12, border: 'none', cursor: 'pointer',
              background: isListening ? '#EF4444' : '#1A1A1A', color: 'white',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              fontSize: 15, fontWeight: 700, transition: 'background 0.2s',
            }}>
              {isListening ? <><MicOff size={20} /> 중지</> : <><Mic size={20} /> 말하기</>}
            </button>
          </div>
        )}

        {/* ── 텍스트 입력 ── */}
        {mode === 't2v' && (
          <textarea
            placeholder={dir.from === 'zh' ? '중국어를 입력하세요…' : '한국어를 입력하세요…'}
            value={inputText}
            onChange={e => handleTextInput(e.target.value)}
            style={{
              width: '100%', minHeight: 84, borderRadius: 12, marginBottom: 12,
              border: '1.5px solid rgba(0,0,0,0.10)', padding: '12px 14px',
              fontSize: 16, lineHeight: 1.6, background: 'white',
              resize: 'none', boxSizing: 'border-box', outline: 'none', display: 'block',
            }}
          />
        )}

        {/* ── 결과 카드 2×2 ── */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
          {MODELS.map(model => (
            <ResultCard
              key={model.id}
              model={model}
              result={results[model.id]}
              loading={loading[model.id]}
              latency={latency[model.id]}
              showPlay={showPlay}
              isSpeaking={speakingId === model.id}
              onToggleSpeak={() => toggleSpeak(model.id)}
            />
          ))}
        </div>

      </div>
    </div>
  )
}
