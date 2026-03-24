/**
 * LiveTranslatorPage — 실시간 통역기 A·B·C·D 비교
 * Mode: 음성→음성 / 음성→텍스트 / 텍스트→음성 / 카메라
 * A: Qwen Plus  B: DeepSeek V3  C: Google  D: Qwen MT
 */
import { useState, useRef, useCallback } from 'react'
import { Mic, MicOff, Volume2, RotateCcw, ChevronLeft, Camera, Type, ArrowRightLeft } from 'lucide-react'

const PROXY = import.meta.env.VITE_TRANSLATE_AB_PROXY || 'https://hanpocket-translate-ab.bumik-korea.workers.dev'

const DIRECTIONS = [
  { from: 'zh', to: 'ko', fromLang: 'zh-CN', toLang: 'ko-KR', label: '中文 → 한국어' },
  { from: 'ko', to: 'zh', fromLang: 'ko-KR', toLang: 'zh-CN', label: '한국어 → 中文' },
]

const MODES = [
  { id: 'v2v',    icon: '🎤', label: '음성→음성' },
  { id: 'v2t',    icon: '🎤', label: '음성→텍스트', sub: '📝' },
  { id: 't2v',    icon: '📝', label: '텍스트→음성', sub: '🔊' },
  { id: 'camera', icon: '📷', label: '카메라' },
]

const MODELS = [
  { id: 'a', name: 'Qwen Plus',   color: '#7C3AED', bg: '#FAF5FF' },
  { id: 'b', name: 'DeepSeek V3', color: '#2563EB', bg: '#EFF6FF' },
  { id: 'd', name: 'Qwen MT',     color: '#DC2626', bg: '#FFF5F5' },
  { id: 'c', name: 'Google',      color: '#059669', bg: '#F0FDF4' },
]

// Google Translate — unofficial, no key needed
async function googleTranslate(text, from, to) {
  const sl = from === 'zh' ? 'zh-CN' : 'ko'
  const tl = to  === 'zh' ? 'zh-CN' : 'ko'
  const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${sl}&tl=${tl}&dt=t&q=${encodeURIComponent(text)}`
  const r = await fetch(url)
  const d = await r.json()
  return d[0].map(s => s[0]).join('')
}

// Worker proxy call
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

// TTS — sets correct lang
function speak(text, langCode) {
  if (!window.speechSynthesis) return
  window.speechSynthesis.cancel()
  const u = new SpeechSynthesisUtterance(text)
  u.lang = langCode
  u.rate = 0.88
  window.speechSynthesis.speak(u)
}

// File → base64
function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const r = new FileReader()
    r.onload = () => resolve(r.result.split(',')[1])
    r.onerror = reject
    r.readAsDataURL(file)
  })
}

function ResultCard({ model, result, loading, latency, onSpeak }) {
  return (
    <div style={{
      flex: 1, borderRadius: 14, overflow: 'hidden',
      border: `1.5px solid ${model.color}22`,
      background: 'white', minWidth: 0,
    }}>
      <div style={{
        padding: '7px 11px 6px',
        borderBottom: `1px solid ${model.color}18`,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        background: model.bg,
      }}>
        <span style={{ fontSize: 10, fontWeight: 800, color: model.color, letterSpacing: '0.07em' }}>
          {model.id.toUpperCase()} · {model.name}
        </span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          {latency != null && (
            <span style={{ fontSize: 10, color: '#aaa' }}>{latency}ms</span>
          )}
          {result && !loading && (
            <button onClick={onSpeak} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, lineHeight: 1 }}>
              <Volume2 size={13} color={model.color} />
            </button>
          )}
        </div>
      </div>
      <div style={{ padding: '10px 11px', minHeight: 56, display: 'flex', alignItems: 'center' }}>
        {loading ? (
          <span style={{ fontSize: 12, color: '#ccc' }}>번역 중…</span>
        ) : result ? (
          <p style={{ fontSize: 13, color: '#1A1A1A', margin: 0, lineHeight: 1.65, wordBreak: 'keep-all' }}>{result}</p>
        ) : (
          <span style={{ fontSize: 12, color: '#ddd' }}>—</span>
        )}
      </div>
    </div>
  )
}

export default function LiveTranslatorPage({ lang, onBack }) {
  const [dirIdx, setDirIdx]     = useState(0)
  const [mode, setMode]         = useState('v2v')
  const [inputText, setInputText]   = useState('')
  const [interimText, setInterimText] = useState('')
  const [results, setResults]   = useState({ a: '', b: '', c: '', d: '' })
  const [loading, setLoading]   = useState({ a: false, b: false, c: false, d: false })
  const [latency, setLatency]   = useState({ a: null, b: null, c: null, d: null })
  const [isListening, setIsListening] = useState(false)
  const [cameraImg, setCameraImg]   = useState(null)   // preview URL
  const [ocrText, setOcrText]   = useState('')
  const [cameraLoading, setCameraLoading] = useState(false)

  const recognitionRef = useRef(null)
  const debounceRef    = useRef(null)
  const fileInputRef   = useRef(null)
  const dir = DIRECTIONS[dirIdx]

  // ─── Translate all 4 models in parallel ──────────────────────
  const translateAll = useCallback(async (text, autoSpeak = false) => {
    if (!text?.trim()) return
    const { from, to, toLang } = dir
    setLoading({ a: true, b: true, c: true, d: true })
    setLatency({ a: null, b: null, c: null, d: null })

    const timed = async (key, fn) => {
      const t0 = Date.now()
      try {
        const result = await fn()
        const ms = Date.now() - t0
        setResults(p => ({ ...p, [key]: result }))
        setLatency(p => ({ ...p, [key]: ms }))
        setLoading(p => ({ ...p, [key]: false }))
        return { key, result, ms }
      } catch (err) {
        setResults(p => ({ ...p, [key]: `(오류: ${err.message.slice(0, 60)})` }))
        setLoading(p => ({ ...p, [key]: false }))
        return null
      }
    }

    const [first] = await Promise.all([
      timed('a', () => workerTranslate('/translate/a', text, from, to)),
      timed('b', () => workerTranslate('/translate/b', text, from, to)),
      timed('d', () => workerTranslate('/translate/d', text, from, to)),
      timed('c', () => googleTranslate(text, from, to)),
    ])

    // Auto-play fastest result in voice→voice mode
    if (autoSpeak && first?.result) speak(first.result, toLang)
  }, [dir])

  const handleTextInput = useCallback((text) => {
    setInputText(text)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => translateAll(text), 650)
  }, [translateAll])

  // ─── Speech Recognition ────────────────────────────────────
  const startListening = () => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SR) { alert('이 브라우저는 음성인식 미지원입니다.'); return }
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
      if (final) {
        setInputText(final)
        setInterimText('')
        translateAll(final, mode === 'v2v')
      }
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

  // ─── Camera ───────────────────────────────────────────────
  const handleFileChange = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setCameraImg(URL.createObjectURL(file))
    setCameraLoading(true)
    setOcrText('')
    setResults({ a: '', b: '', c: '', d: '' })
    try {
      const base64 = await fileToBase64(file)
      const r = await fetch(`${PROXY}/translate/camera`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: base64, mimeType: file.type, from: dir.from, to: dir.to }),
      })
      const d = await r.json()
      if (d.ocr) {
        setOcrText(d.ocr)
        setInputText(d.ocr)
        await translateAll(d.ocr)
      } else {
        setOcrText('(텍스트 인식 실패)')
      }
    } catch (err) {
      setOcrText(`(오류: ${err.message})`)
    } finally {
      setCameraLoading(false)
    }
  }

  const reset = () => {
    stopListening()
    setInputText(''); setInterimText(''); setOcrText('')
    setResults({ a: '', b: '', c: '', d: '' })
    setLoading({ a: false, b: false, c: false, d: false })
    setLatency({ a: null, b: null, c: null, d: null })
    setCameraImg(null)
  }

  const toggleDir = () => { setDirIdx(v => 1 - v); reset() }

  const isCameraMode = mode === 'camera'
  const isVoiceMode  = mode === 'v2v' || mode === 'v2t'
  const isTextMode   = mode === 't2v'

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9800,
      background: '#FAFAFA', display: 'flex', flexDirection: 'column',
      fontFamily: 'Inter, "Noto Sans SC", Pretendard, sans-serif',
    }}>

      {/* ── 헤더 ──────────────────────────────────────── */}
      <div style={{ display: 'flex', alignItems: 'center', padding: '14px 16px 10px', borderBottom: '1px solid rgba(0,0,0,0.06)', background: 'white' }}>
        <button onClick={onBack} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px 8px 4px 0' }}>
          <ChevronLeft size={22} color="#1A1A1A" />
        </button>
        <span style={{ fontSize: 15, fontWeight: 700, color: '#1A1A1A' }}>실시간 통역기</span>
        <span style={{ fontSize: 11, color: '#aaa', marginLeft: 8, fontWeight: 500 }}>A·B·C·D</span>
        <button onClick={reset} style={{ marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}>
          <RotateCcw size={17} color="#888" />
        </button>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '14px 14px 24px' }}>

        {/* ── 방향 토글 ──────────────────────────────── */}
        <button
          onClick={toggleDir}
          style={{
            width: '100%', height: 42, borderRadius: 12,
            background: '#1A1A1A', color: 'white',
            border: 'none', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            fontSize: 14, fontWeight: 700, marginBottom: 12,
          }}
        >
          {dir.label}
          <ArrowRightLeft size={15} />
        </button>

        {/* ── 모드 탭 ────────────────────────────────── */}
        <div style={{ display: 'flex', gap: 6, marginBottom: 14 }}>
          {MODES.map(m => (
            <button
              key={m.id}
              onClick={() => { setMode(m.id); reset() }}
              style={{
                flex: 1, height: 38, borderRadius: 10,
                background: mode === m.id ? '#1A1A1A' : 'white',
                color: mode === m.id ? 'white' : '#666',
                border: mode === m.id ? 'none' : '1px solid rgba(0,0,0,0.10)',
                fontSize: 11, fontWeight: 600, cursor: 'pointer',
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 1,
              }}
            >
              <span style={{ fontSize: 14 }}>{m.icon}{m.sub || ''}</span>
              <span style={{ fontSize: 9, opacity: 0.75 }}>{m.label}</span>
            </button>
          ))}
        </div>

        {/* ── 입력 영역 ──────────────────────────────── */}

        {/* 카메라 모드 */}
        {isCameraMode && (
          <div style={{ marginBottom: 12 }}>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              style={{ display: 'none' }}
              onChange={handleFileChange}
            />
            {cameraImg ? (
              <div style={{ borderRadius: 12, overflow: 'hidden', marginBottom: 8, position: 'relative' }}>
                <img src={cameraImg} alt="capture" style={{ width: '100%', maxHeight: 200, objectFit: 'cover', display: 'block' }} />
                {cameraLoading && (
                  <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <span style={{ color: 'white', fontSize: 13 }}>OCR 인식 중…</span>
                  </div>
                )}
              </div>
            ) : null}
            {ocrText && (
              <div style={{ borderRadius: 10, background: 'white', border: '1px solid rgba(0,0,0,0.08)', padding: '10px 12px', marginBottom: 8 }}>
                <p style={{ fontSize: 10, color: '#aaa', margin: '0 0 4px', fontWeight: 700, textTransform: 'uppercase' }}>인식된 텍스트</p>
                <p style={{ fontSize: 13, color: '#333', margin: 0, lineHeight: 1.6 }}>{ocrText}</p>
              </div>
            )}
            <button
              onClick={() => fileInputRef.current?.click()}
              style={{
                width: '100%', height: 48, borderRadius: 12,
                background: cameraImg ? 'white' : '#1A1A1A',
                color: cameraImg ? '#555' : 'white',
                border: cameraImg ? '1.5px solid rgba(0,0,0,0.12)' : 'none',
                cursor: 'pointer', fontSize: 14, fontWeight: 700,
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              }}
            >
              <Camera size={18} />
              {cameraImg ? '다시 촬영' : '📷 카메라 번역'}
            </button>
          </div>
        )}

        {/* 음성 모드 */}
        {isVoiceMode && (
          <div style={{ marginBottom: 12 }}>
            <div style={{
              minHeight: 80, borderRadius: 12, background: 'white',
              border: `1.5px solid ${isListening ? '#EF4444' : 'rgba(0,0,0,0.08)'}`,
              padding: '12px 14px', marginBottom: 10,
              transition: 'border-color 0.2s',
              display: 'flex', alignItems: inputText ? 'flex-start' : 'center',
              justifyContent: !inputText && !interimText ? 'center' : 'flex-start',
            }}>
              {!inputText && !interimText ? (
                <span style={{ color: '#ccc', fontSize: 13 }}>
                  {isListening ? '듣고 있어요…' : '🎤 마이크를 눌러 말하세요'}
                </span>
              ) : (
                <div>
                  <p style={{ fontSize: 15, color: '#1A1A1A', margin: 0, lineHeight: 1.6 }}>{inputText}</p>
                  {interimText && <p style={{ fontSize: 13, color: '#bbb', margin: '4px 0 0', fontStyle: 'italic' }}>{interimText}</p>}
                </div>
              )}
            </div>
            <button
              onClick={isListening ? stopListening : startListening}
              style={{
                width: '100%', height: 52, borderRadius: 12,
                background: isListening ? '#EF4444' : '#1A1A1A',
                color: 'white', border: 'none', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                fontSize: 15, fontWeight: 700, transition: 'background 0.2s',
              }}
            >
              {isListening ? <MicOff size={20} /> : <Mic size={20} />}
              {isListening ? '중지' : '말하기'}
            </button>
          </div>
        )}

        {/* 텍스트 입력 모드 */}
        {isTextMode && (
          <div style={{ marginBottom: 12 }}>
            <textarea
              placeholder={dir.from === 'zh' ? '중국어를 입력하세요…' : '한국어를 입력하세요…'}
              value={inputText}
              onChange={e => handleTextInput(e.target.value)}
              style={{
                width: '100%', minHeight: 88, borderRadius: 12,
                border: '1.5px solid rgba(0,0,0,0.10)',
                padding: '12px 14px', fontSize: 16, lineHeight: 1.6,
                background: 'white', resize: 'none', boxSizing: 'border-box',
                outline: 'none', display: 'block',
              }}
            />
          </div>
        )}

        {/* ── 결과 카드 2×2 ─────────────────────────── */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
          {MODELS.map(model => (
            <ResultCard
              key={model.id}
              model={model}
              result={results[model.id]}
              loading={loading[model.id]}
              latency={latency[model.id]}
              onSpeak={() => speak(results[model.id], dir.toLang)}
            />
          ))}
        </div>

        {/* ── API 키 안내 ───────────────────────────── */}
        {!import.meta.env.VITE_TRANSLATE_AB_PROXY && (
          <div style={{ borderRadius: 10, background: '#FFFBEB', border: '1px solid #FDE68A', padding: '10px 12px', marginTop: 14 }}>
            <p style={{ fontSize: 11, color: '#92400E', margin: 0, lineHeight: 1.7 }}>
              ⚠️ Worker 미배포 상태. 아래 명령어로 배포 후 .env에 추가:<br />
              <code style={{ fontSize: 10 }}>cd workers && npx wrangler deploy -c wrangler-translate-ab.toml</code><br />
              <code style={{ fontSize: 10 }}>npx wrangler secret put QWEN_API_KEY -c wrangler-translate-ab.toml</code><br />
              <code style={{ fontSize: 10 }}>npx wrangler secret put DEEPSEEK_API_KEY -c wrangler-translate-ab.toml</code><br />
              <code style={{ fontSize: 10 }}>VITE_TRANSLATE_AB_PROXY=https://hanpocket-translate-ab.[계정].workers.dev</code>
            </p>
          </div>
        )}

      </div>
    </div>
  )
}
