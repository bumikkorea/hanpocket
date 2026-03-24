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
  { id: 'omni',   icon: '⚡', sub: '',   label: 'Turbo' },
  { id: 'v2v',    icon: '🎤', sub: '🔊', label: '음성→음성' },
  { id: 'v2t',    icon: '🎤', sub: '📝', label: '음성→텍스트' },
  { id: 't2v',    icon: '📝', sub: '🔊', label: '텍스트→음성' },
  { id: 'camera', icon: '📷', sub: '',   label: '카메라' },
]

const GOOGLE_MODEL = { id: 'c', name: 'Google', color: '#059669', bg: '#F0FDF4' }

async function googleTranslate(text, from, to) {
  const sl = from === 'zh' ? 'zh-CN' : 'ko'
  const tl = to  === 'zh' ? 'zh-CN' : 'ko'
  const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${sl}&tl=${tl}&dt=t&q=${encodeURIComponent(text)}`
  const r = await fetch(url)
  const d = await r.json()
  return d[0].map(s => s[0]).join('')
}

// 이미지 리사이즈 + 압축 후 base64 반환 (OCR 속도 최적화)
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
  const [googleResult, setGoogleResult] = useState('')
  const [googleLoading, setGoogleLoading] = useState(false)
  const [googleLatency, setGoogleLatency] = useState(null)
  const [speakingGoogle, setSpeakingGoogle] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const [speakingId, setSpeakingId]   = useState(null)   // 현재 재생 중인 모델 ID
  const [cameraImg, setCameraImg]         = useState(null)
  const [ocrText, setOcrText]             = useState('')
  const [cameraLoading, setCameraLoading] = useState(false)
  const [overlayBlocks, setOverlayBlocks] = useState([])  // [{orig,trans,x1,y1,x2,y2}]
  const [showOverlay, setShowOverlay]     = useState(true)

  const [omniResult, setOmniResult]   = useState({ text: '', audio: '' })
  const [omniLoading, setOmniLoading] = useState(false)
  const [omniLatency, setOmniLatency] = useState(null)
  const [omniPlaying, setOmniPlaying] = useState(false)
  const [isRecording, setIsRecording] = useState(false)

  const recognitionRef = useRef(null)
  const debounceRef    = useRef(null)
  const fileInputRef   = useRef(null)
  const mediaRecRef    = useRef(null)
  const omniAudioRef   = useRef(null)
  const dir = DIRECTIONS[dirIdx]

  // Omni: base64 WAV 재생
  const playOmniAudio = useCallback((base64) => {
    if (!base64) return
    try {
      const raw = atob(base64)
      const bytes = new Uint8Array(raw.length)
      for (let i = 0; i < raw.length; i++) bytes[i] = raw.charCodeAt(i)
      const blob = new Blob([bytes], { type: 'audio/wav' })
      const url = URL.createObjectURL(blob)
      if (omniAudioRef.current) {
        omniAudioRef.current.pause()
        URL.revokeObjectURL(omniAudioRef.current.src)
      }
      const audio = new Audio(url)
      omniAudioRef.current = audio
      setOmniPlaying(true)
      audio.play()
      audio.onended = () => { setOmniPlaying(false); URL.revokeObjectURL(url) }
      audio.onerror = () => { setOmniPlaying(false); URL.revokeObjectURL(url) }
    } catch (e) { console.error('omni audio error', e) }
  }, [])

  // Omni: 녹음 시작
  const startOmniRecord = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: { echoCancellation: true, noiseSuppression: true, sampleRate: 16000 },
      })
      const chunks = []
      const mr = new MediaRecorder(stream, { mimeType: 'audio/webm' })
      mr.ondataavailable = e => { if (e.data.size > 0) chunks.push(e.data) }
      mr.onstop = async () => {
        stream.getTracks().forEach(t => t.stop())
        setIsRecording(false)
        const blob = new Blob(chunks, { type: 'audio/webm' })
        const base64 = await new Promise((res, rej) => {
          const reader = new FileReader()
          reader.onload = () => res(reader.result.split(',')[1])
          reader.onerror = rej
          reader.readAsDataURL(blob)
        })
        setOmniLoading(true)
        setOmniResult({ text: '', audio: '' })
        setOmniLatency(null)
        const t0 = Date.now()
        try {
          const r = await fetch(`${PROXY}/translate/omni`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ audio: base64, audioFormat: 'webm', from: dir.from, to: dir.to }),
          })
          const d = await r.json()
          if (d.error) throw new Error(d.error)
          setOmniLatency(Date.now() - t0)
          setOmniResult({ text: d.text || '', audio: d.audio || '' })
          if (d.audio) playOmniAudio(d.audio)
        } catch (err) {
          setOmniResult({ text: `(오류: ${err.message.slice(0, 60)})`, audio: '' })
        } finally {
          setOmniLoading(false)
        }
      }
      mediaRecRef.current = mr
      mr.start()
      setIsRecording(true)
    } catch (err) {
      alert('마이크 접근 실패: ' + err.message)
    }
  }, [dir, playOmniAudio])

  const stopOmniRecord = useCallback(() => {
    mediaRecRef.current?.stop()
  }, [])

  // Google 음성 출력 토글
  const toggleGoogleSpeak = useCallback(() => {
    if (speakingGoogle) {
      window.speechSynthesis?.cancel()
      setSpeakingGoogle(false)
      return
    }
    if (!googleResult || !window.speechSynthesis) return
    window.speechSynthesis.cancel()
    const u = new SpeechSynthesisUtterance(googleResult)
    u.lang = dir.toLang
    u.rate = 0.88
    u.onend = () => setSpeakingGoogle(false)
    u.onerror = () => setSpeakingGoogle(false)
    setSpeakingGoogle(true)
    window.speechSynthesis.speak(u)
  }, [speakingGoogle, googleResult, dir.toLang])

  // Google 번역
  const translateAll = useCallback(async (text) => {
    if (!text?.trim()) return
    const { from, to } = dir
    window.speechSynthesis?.cancel()
    setSpeakingGoogle(false)
    setGoogleLoading(true)
    setGoogleLatency(null)
    setGoogleResult('')
    const t0 = Date.now()
    try {
      const result = await googleTranslate(text, from, to)
      setGoogleResult(result)
      setGoogleLatency(Date.now() - t0)
    } catch (err) {
      setGoogleResult(`(오류: ${err.message.slice(0, 50)})`)
    } finally {
      setGoogleLoading(false)
    }
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
    setOverlayBlocks([])
    setShowOverlay(true)
    try {
      const base64 = await fileToBase64(file)
      const r = await fetch(`${PROXY}/translate/camera`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: base64, mimeType: 'image/jpeg', from: dir.from, to: dir.to }),
      })
      const d = await r.json()
      if (d.blocks?.length > 0) {
        setOverlayBlocks(d.blocks)
      }
      setOcrText(d.ocr || '(인식 실패)')
    } catch (err) {
      setOcrText(`(오류: ${err.message})`)
    } finally {
      setCameraLoading(false)
    }
  }

  const reset = () => {
    stopListening()
    mediaRecRef.current?.stop()
    if (omniAudioRef.current) { omniAudioRef.current.pause(); omniAudioRef.current = null }
    window.speechSynthesis?.cancel()
    setSpeakingGoogle(false)
    setInputText(''); setInterimText(''); setOcrText('')
    setGoogleResult(''); setGoogleLoading(false); setGoogleLatency(null)
    setCameraImg(null)
    setOverlayBlocks([])
    setOmniResult({ text: '', audio: '' })
    setOmniLoading(false)
    setOmniLatency(null)
    setOmniPlaying(false)
    setIsRecording(false)
  }

  const showPlay = mode !== 'v2t'

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
        <span style={{ fontSize: 11, color: '#bbb', marginLeft: 6 }}>Turbo · Google</span>
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
        <div style={{ display: 'flex', gap: 5, marginBottom: 12, flexWrap: 'wrap' }}>
          {MODES.map(m => (
            <button key={m.id} onClick={() => { setMode(m.id); reset() }} style={{
              flex: '1 1 calc(20% - 4px)', minWidth: 56, height: 44, borderRadius: 10,
              background: mode === m.id ? (m.id === 'omni' ? 'linear-gradient(135deg,#7C3AED,#2563EB)' : '#1A1A1A') : 'white',
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

        {/* ── Omni 모드 ── */}
        {mode === 'omni' && (
          <div style={{ marginBottom: 12 }}>
            {/* 설명 배너 */}
            <div style={{
              borderRadius: 12, background: 'linear-gradient(135deg,#7C3AED,#2563EB)',
              padding: '12px 16px', marginBottom: 10, color: 'white',
            }}>
              <p style={{ margin: 0, fontSize: 12, fontWeight: 700, opacity: 0.9 }}>⚡ Qwen3-Omni Turbo</p>
              <p style={{ margin: '3px 0 0', fontSize: 11, opacity: 0.75 }}>음성 → 음성 네이티브 파이프라인 · STT/번역/TTS 한 번에 · 카메라 ❌</p>
            </div>

            {/* 녹음 버튼 */}
            <button
              onPointerDown={startOmniRecord}
              onPointerUp={stopOmniRecord}
              disabled={omniLoading}
              style={{
                width: '100%', height: 72, borderRadius: 16, border: 'none', cursor: omniLoading ? 'not-allowed' : 'pointer',
                background: isRecording ? '#EF4444' : omniLoading ? '#888' : '#1A1A1A',
                color: 'white', display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center', gap: 4,
                fontSize: 13, fontWeight: 700, transition: 'background 0.2s',
                userSelect: 'none', WebkitUserSelect: 'none',
              }}
            >
              {omniLoading ? (
                <><span style={{ fontSize: 20 }}>⏳</span><span>처리 중…</span></>
              ) : isRecording ? (
                <><span style={{ fontSize: 20 }}>🔴</span><span>놓으면 번역 시작</span></>
              ) : (
                <><Mic size={24} /><span>누르고 말하기</span></>
              )}
            </button>
            <p style={{ fontSize: 10, color: '#bbb', textAlign: 'center', margin: '6px 0 10px' }}>
              손가락을 누르는 동안 녹음 · 떼면 자동 번역
            </p>

            {/* 결과 카드 */}
            {(omniResult.text || omniLoading) && (
              <div style={{
                borderRadius: 14, background: 'white', overflow: 'hidden',
                border: '2px solid #7C3AED22',
              }}>
                {/* 헤더 */}
                <div style={{
                  padding: '8px 12px', background: '#FAF5FF',
                  borderBottom: '1px solid #7C3AED18',
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                }}>
                  <span style={{ fontSize: 11, fontWeight: 800, color: '#7C3AED', letterSpacing: '0.06em' }}>
                    ⚡ QWEN-OMNI
                  </span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    {omniLatency != null && (
                      <span style={{ fontSize: 10, fontWeight: 700, color: '#7C3AED', background: '#7C3AED18', padding: '2px 7px', borderRadius: 20 }}>
                        {omniLatency < 1000 ? `${omniLatency}ms` : `${(omniLatency / 1000).toFixed(1)}s`}
                      </span>
                    )}
                    {omniResult.audio && !omniLoading && (
                      <button
                        onClick={() => omniPlaying
                          ? (omniAudioRef.current?.pause(), setOmniPlaying(false))
                          : playOmniAudio(omniResult.audio)
                        }
                        style={{
                          background: omniPlaying ? '#7C3AED' : '#7C3AED18',
                          border: 'none', borderRadius: 20, padding: '3px 10px',
                          color: omniPlaying ? 'white' : '#7C3AED',
                          fontSize: 11, fontWeight: 700, cursor: 'pointer',
                          display: 'flex', alignItems: 'center', gap: 4,
                        }}
                      >
                        {omniPlaying ? <><Square size={9} fill="currentColor" />&nbsp;중지</> : <><Volume2 size={9} />&nbsp;재생</>}
                      </button>
                    )}
                  </div>
                </div>
                {/* 번역 텍스트 */}
                <div style={{ padding: '12px 14px', minHeight: 52 }}>
                  {omniLoading ? (
                    <span style={{ fontSize: 12, color: '#ccc' }}>번역 중…</span>
                  ) : omniResult.text ? (
                    <p style={{ fontSize: 14, color: '#1A1A1A', margin: 0, lineHeight: 1.7 }}>{omniResult.text}</p>
                  ) : (
                    <span style={{ fontSize: 12, color: '#e0e0e0' }}>—</span>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── 카메라 ── */}
        {mode === 'camera' && (
          <div style={{ marginBottom: 12 }}>
            <input ref={fileInputRef} type="file" accept="image/*" capture="environment" style={{ display: 'none' }} onChange={handleFileChange} />

            {/* 이미지 + 오버레이 */}
            {cameraImg && (
              <div style={{ borderRadius: 12, overflow: 'hidden', marginBottom: 8, position: 'relative', background: '#000' }}>
                <img
                  src={cameraImg} alt="capture"
                  style={{ width: '100%', display: 'block', opacity: cameraLoading ? 0.5 : 1, transition: 'opacity 0.2s' }}
                />

                {/* 번역 오버레이 블록 */}
                {!cameraLoading && showOverlay && overlayBlocks.map((b, i) => (
                  <div key={i} style={{
                    position: 'absolute',
                    left: `${b.x1}%`, top: `${b.y1}%`,
                    width: `${Math.max(b.x2 - b.x1, 5)}%`,
                    minHeight: `${Math.max(b.y2 - b.y1, 3)}%`,
                    background: 'rgba(255,255,255,0.93)',
                    borderRadius: 3,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    padding: '1px 3px',
                    boxSizing: 'border-box',
                  }}>
                    <span style={{
                      fontSize: `clamp(8px, ${Math.max(b.y2 - b.y1, 4) * 0.28}vw, 15px)`,
                      fontWeight: 700, color: '#1A1A1A',
                      lineHeight: 1.2, textAlign: 'center', wordBreak: 'keep-all',
                    }}>{b.trans}</span>
                  </div>
                ))}

                {/* 로딩 오버레이 */}
                {cameraLoading && (
                  <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                    <span style={{ color: 'white', fontSize: 13, fontWeight: 700 }}>번역 중…</span>
                    <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: 11 }}>텍스트 인식 + 위치 분석</span>
                  </div>
                )}

                {/* 오버레이 토글 버튼 */}
                {!cameraLoading && overlayBlocks.length > 0 && (
                  <button
                    onClick={() => setShowOverlay(v => !v)}
                    style={{
                      position: 'absolute', bottom: 8, right: 8,
                      background: 'rgba(0,0,0,0.6)', border: 'none', borderRadius: 20,
                      color: 'white', fontSize: 11, fontWeight: 700, cursor: 'pointer',
                      padding: '4px 10px',
                    }}
                  >
                    {showOverlay ? '원문 보기' : '번역 보기'}
                  </button>
                )}
              </div>
            )}

            {/* 텍스트 요약 (오버레이 보완) */}
            {!cameraLoading && ocrText && overlayBlocks.length === 0 && (
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

        {/* ── Google 결과 카드 (비-Omni 모드) ── */}
        {mode !== 'omni' && (
          <ResultCard
            model={GOOGLE_MODEL}
            result={googleResult}
            loading={googleLoading}
            latency={googleLatency}
            showPlay={showPlay}
            isSpeaking={speakingGoogle}
            onToggleSpeak={toggleGoogleSpeak}
          />
        )}

      </div>
    </div>
  )
}
