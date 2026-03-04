import { useState, useEffect, useRef, useCallback, lazy, Suspense } from 'react'
import { X, Camera, Trash2, AlertTriangle, FileText } from 'lucide-react'

const CustomsGuide = lazy(() => import('./CustomsGuide'))

function L(lang, d) { if (typeof d === 'string') return d; return d?.[lang] || d?.en || d?.zh || d?.ko || '' }

const STORAGE_KEY = 'hanpocket_arrival_form'

const PURPOSE_OPTIONS = [
  { id: 'tour_individual', label: { ko: 'Tour: 개별여행', zh: 'Tour: 个人旅行', en: 'Tour: Individual Travel' } },
  { id: 'tour_group', label: { ko: 'Tour: 단체관광', zh: 'Tour: 团体旅游', en: 'Tour: Group Tour' } },
  { id: 'business', label: { ko: 'Business (사업)', zh: 'Business（商务）', en: 'Business' } },
  { id: 'diplomatic', label: { ko: 'Diplomatic/Official', zh: 'Diplomatic（外交/公务）', en: 'Diplomatic/Official' } },
  { id: 'medical', label: { ko: 'Medical Treatment', zh: 'Medical（医疗）', en: 'Medical Treatment' } },
  { id: 'visit', label: { ko: 'Visit (방문)', zh: 'Visit（探亲访友）', en: 'Visit family/relatives/friends' } },
  { id: 'conference', label: { ko: 'Conference/Event', zh: 'Conference（会议/活动）', en: 'Conference/Event' } },
  { id: 'employment', label: { ko: 'Employment (취업)', zh: 'Employment（就业）', en: 'Employment' } },
  { id: 'study', label: { ko: 'Study (유학)', zh: 'Study（留学）', en: 'Study' } },
  { id: 'sports', label: { ko: 'Sports Event', zh: 'Sports（体育赛事）', en: 'Sports Event' } },
  { id: 'others', label: { ko: 'Others (기타)', zh: 'Others（其他）', en: 'Others' } },
]

// Signature pad component
function SignaturePad({ sigRef, onClear }) {
  const canvasRef = useRef(null)
  const isDrawing = useRef(false)
  const lastPos = useRef({ x: 0, y: 0 })

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    const rect = canvas.getBoundingClientRect()
    canvas.width = rect.width * 2
    canvas.height = rect.height * 2
    ctx.scale(2, 2)
    ctx.strokeStyle = '#1a1a1a'
    ctx.lineWidth = 1.5
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'

    // Restore saved signature
    if (sigRef.current) {
      const img = new Image()
      img.onload = () => {
        ctx.drawImage(img, 0, 0, rect.width, rect.height)
      }
      img.src = sigRef.current
    }
  }, [])

  const getPos = (e) => {
    const canvas = canvasRef.current
    const rect = canvas.getBoundingClientRect()
    const touch = e.touches ? e.touches[0] : e
    return {
      x: touch.clientX - rect.left,
      y: touch.clientY - rect.top
    }
  }

  const startDraw = (e) => {
    e.preventDefault()
    isDrawing.current = true
    lastPos.current = getPos(e)
  }

  const draw = (e) => {
    if (!isDrawing.current) return
    e.preventDefault()
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    const pos = getPos(e)
    ctx.beginPath()
    ctx.moveTo(lastPos.current.x, lastPos.current.y)
    ctx.lineTo(pos.x, pos.y)
    ctx.stroke()
    lastPos.current = pos
  }

  const endDraw = () => {
    if (!isDrawing.current) return
    isDrawing.current = false
    const canvas = canvasRef.current
    sigRef.current = canvas.toDataURL('image/png')
  }

  const clearSig = () => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    const rect = canvas.getBoundingClientRect()
    ctx.clearRect(0, 0, rect.width, rect.height)
    sigRef.current = null
    if (onClear) onClear()
  }

  return (
    <div className="relative">
      <canvas
        ref={canvasRef}
        className="w-full h-16 border-b border-gray-300 bg-transparent cursor-crosshair touch-none"
        onMouseDown={startDraw}
        onMouseMove={draw}
        onMouseUp={endDraw}
        onMouseLeave={endDraw}
        onTouchStart={startDraw}
        onTouchMove={draw}
        onTouchEnd={endDraw}
      />
      <button
        type="button"
        onClick={clearSig}
        className="absolute top-0 right-0 p-1 text-gray-400 hover:text-gray-600"
      >
        <Trash2 size={12} />
      </button>
    </div>
  )
}

export default function ArrivalCardGuide({ lang, onClose }) {
  const [activeFormTab, setActiveFormTab] = useState('arrival')
  const [form, setForm] = useState({
    familyName: '',
    givenName: '',
    gender: '',
    nationality: 'CHINESE',
    birthYY: '',
    birthMM: '',
    birthDD: '',
    occupation: '',
    addressKorea: '',
    phone: '',
    purpose: '',
    departureDate: '',
    departureFlight: '',
  })

  const cardRef = useRef(null)
  const sigDataRef = useRef(null)

  // Load from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved) {
        const parsed = JSON.parse(saved)
        setForm(prev => ({ ...prev, ...parsed }))
      }
    } catch (e) { /* ignore */ }
  }, [])

  // Save to localStorage on form change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(form))
    } catch (e) { /* ignore */ }
  }, [form])

  const updateField = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  const handleCapture = useCallback(async () => {
    const el = cardRef.current
    if (!el) return

    try {
      // Dynamic import of html2canvas for screenshot
      const { default: html2canvas } = await import('https://cdn.jsdelivr.net/npm/html2canvas@1.4.1/+esm')
      const canvas = await html2canvas(el, {
        backgroundColor: '#FFFFF0',
        scale: 2,
        useCORS: true,
        logging: false
      })
      const link = document.createElement('a')
      link.download = 'arrival-card.png'
      link.href = canvas.toDataURL('image/png')
      link.click()
    } catch {
      // Fallback: SVG foreignObject approach
      try {
        const canvas = document.createElement('canvas')
        const rect = el.getBoundingClientRect()
        canvas.width = rect.width * 2
        canvas.height = rect.height * 2
        const ctx = canvas.getContext('2d')
        ctx.scale(2, 2)
        ctx.fillStyle = '#FFFFF0'
        ctx.fillRect(0, 0, rect.width, rect.height)

        const data = new XMLSerializer().serializeToString(el)
        const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${rect.width}" height="${rect.height}">
          <foreignObject width="100%" height="100%">
            <div xmlns="http://www.w3.org/1999/xhtml">${data}</div>
          </foreignObject>
        </svg>`
        const img = new Image()
        const blob = new Blob([svg], { type: 'image/svg+xml;charset=utf-8' })
        const url = URL.createObjectURL(blob)
        img.onload = () => {
          ctx.drawImage(img, 0, 0, rect.width, rect.height)
          const link = document.createElement('a')
          link.download = 'arrival-card.png'
          link.href = canvas.toDataURL('image/png')
          link.click()
          URL.revokeObjectURL(url)
        }
        img.src = url
      } catch {
        alert(L(lang, {
          ko: '스크린샷 기능을 사용할 수 없습니다. 기기의 스크린샷 기능을 사용해주세요.',
          zh: '截图功能不可用，请使用设备自带的截图功能。',
          en: 'Screenshot not available. Please use your device screenshot feature.'
        }))
      }
    }
  }, [lang])

  const inputClass = 'w-full border-b border-gray-300 bg-transparent text-xs py-1 px-0.5 outline-none focus:border-blue-600 uppercase placeholder:normal-case placeholder:text-gray-300'
  const labelClass = 'text-[8px] uppercase tracking-wider text-blue-900 font-semibold leading-none mb-0.5'

  return (
    <div className="fixed inset-0 z-[999] bg-white overflow-y-auto">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white border-b border-[#E5E7EB] px-5 py-4 flex items-center justify-between">
        <h1 className="text-lg font-bold text-[#111827]">
          {L(lang, { ko: '입국카드 / 세관신고서', zh: '入境卡 / 海关申报', en: 'Arrival Card / Customs' })}
        </h1>
        <button onClick={onClose} className="p-1 rounded-full hover:bg-[#F3F4F6] transition-colors">
          <X size={22} className="text-[#111827]" />
        </button>
      </div>

      {/* Tab buttons */}
      <div className="sticky top-[65px] z-10 bg-white border-b border-[#E5E7EB] px-5 py-0 flex">
        <button
          onClick={() => setActiveFormTab('arrival')}
          className={`flex-1 py-3 text-sm font-semibold text-center border-b-2 transition-colors ${
            activeFormTab === 'arrival'
              ? 'border-blue-800 text-blue-800'
              : 'border-transparent text-gray-400 hover:text-gray-600'
          }`}
        >
          {L(lang, { ko: '입국카드', zh: '入境卡', en: 'Arrival Card' })}
        </button>
        <button
          onClick={() => setActiveFormTab('customs')}
          className={`flex-1 py-3 text-sm font-semibold text-center border-b-2 transition-colors ${
            activeFormTab === 'customs'
              ? 'border-amber-800 text-amber-800'
              : 'border-transparent text-gray-400 hover:text-gray-600'
          }`}
        >
          {L(lang, { ko: '세관신고서', zh: '海关申报', en: 'Customs Declaration' })}
        </button>
      </div>

      <div className="px-5 py-4 space-y-4 pb-20">
        {/* Date reference */}
        <p className="text-xs text-gray-400 text-center">
          {L(lang, { ko: '정보 기준: 2026년 3월', zh: '信息基准: 2026年3月', en: 'As of March 2026' })}
        </p>

        {activeFormTab === 'customs' ? (
          <Suspense fallback={
            <div className="flex items-center justify-center py-10">
              <div className="w-6 h-6 border-2 border-amber-300 border-t-amber-700 rounded-full animate-spin" />
            </div>
          }>
            <CustomsGuide lang={lang} />
          </Suspense>
        ) : (
          <>
            {/* Capture button */}
            <div className="flex justify-end">
              <button
                onClick={handleCapture}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-50 border border-blue-200 text-blue-700 text-xs font-medium active:scale-95 transition-transform"
              >
                <Camera size={14} />
                {L(lang, { ko: '이미지 저장', zh: '保存图片', en: 'Save Image' })}
              </button>
            </div>

            {/* Arrival Card Form */}
            <div ref={cardRef} className="bg-[#FFFFF0] border-2 border-blue-800 rounded-lg p-3 space-y-0">
              {/* Card title */}
              <div className="text-center border-b-2 border-blue-800 pb-2 mb-3">
                <p className="text-sm font-bold text-blue-900 tracking-wide">ARRIVAL CARD</p>
                <p className="text-[10px] text-blue-800 font-medium">입국신고서(외국인용)</p>
                <p className="text-[7px] text-blue-700 mt-0.5">
                  Please fill out in Korean or English / 한글 또는 영어로 작성해 주시기 바랍니다
                </p>
              </div>

              {/* Row 1: Family Name | Given Name | Gender */}
              <div className="grid grid-cols-[1fr_1fr_0.6fr] gap-2 mb-2">
                <div>
                  <p className={labelClass}>Family Name / 성</p>
                  <input
                    type="text"
                    value={form.familyName}
                    onChange={e => updateField('familyName', e.target.value)}
                    placeholder={L(lang, { ko: '예: WANG', zh: '例: WANG', en: 'e.g. WANG' })}
                    className={inputClass}
                  />
                </div>
                <div>
                  <p className={labelClass}>Given Name / 명</p>
                  <input
                    type="text"
                    value={form.givenName}
                    onChange={e => updateField('givenName', e.target.value)}
                    placeholder={L(lang, { ko: '예: XIAOMING', zh: '例: XIAOMING', en: 'e.g. XIAOMING' })}
                    className={inputClass}
                  />
                </div>
                <div>
                  <p className={labelClass}>Gender / 성별</p>
                  <div className="flex items-center gap-2 pt-1">
                    <label className="flex items-center gap-0.5 cursor-pointer">
                      <input
                        type="radio"
                        name="gender"
                        checked={form.gender === 'M'}
                        onChange={() => updateField('gender', 'M')}
                        className="w-3 h-3 accent-blue-800"
                      />
                      <span className="text-[9px] text-gray-600">Male</span>
                    </label>
                    <label className="flex items-center gap-0.5 cursor-pointer">
                      <input
                        type="radio"
                        name="gender"
                        checked={form.gender === 'F'}
                        onChange={() => updateField('gender', 'F')}
                        className="w-3 h-3 accent-blue-800"
                      />
                      <span className="text-[9px] text-gray-600">Female</span>
                    </label>
                  </div>
                </div>
              </div>

              {/* Row 2: Nationality | Date of Birth | Occupation */}
              <div className="grid grid-cols-3 gap-2 mb-2">
                <div>
                  <p className={labelClass}>Nationality / 국적</p>
                  <input
                    type="text"
                    value={form.nationality}
                    onChange={e => updateField('nationality', e.target.value)}
                    placeholder="CHINESE"
                    className={inputClass}
                  />
                </div>
                <div>
                  <p className={labelClass}>Date of Birth / 생년월일</p>
                  <div className="flex gap-0.5 items-center">
                    <input
                      type="text"
                      value={form.birthYY}
                      onChange={e => updateField('birthYY', e.target.value.slice(0, 2))}
                      placeholder="YY"
                      maxLength={2}
                      className="w-8 border-b border-gray-300 bg-transparent text-[10px] py-1 text-center outline-none focus:border-blue-600"
                    />
                    <span className="text-[8px] text-gray-400">/</span>
                    <input
                      type="text"
                      value={form.birthMM}
                      onChange={e => updateField('birthMM', e.target.value.slice(0, 2))}
                      placeholder="MM"
                      maxLength={2}
                      className="w-8 border-b border-gray-300 bg-transparent text-[10px] py-1 text-center outline-none focus:border-blue-600"
                    />
                    <span className="text-[8px] text-gray-400">/</span>
                    <input
                      type="text"
                      value={form.birthDD}
                      onChange={e => updateField('birthDD', e.target.value.slice(0, 2))}
                      placeholder="DD"
                      maxLength={2}
                      className="w-8 border-b border-gray-300 bg-transparent text-[10px] py-1 text-center outline-none focus:border-blue-600"
                    />
                  </div>
                </div>
                <div>
                  <p className={labelClass}>Occupation / 직업</p>
                  <input
                    type="text"
                    value={form.occupation}
                    onChange={e => updateField('occupation', e.target.value)}
                    placeholder={L(lang, { ko: '예: STUDENT', zh: '例: STUDENT', en: 'e.g. STUDENT' })}
                    className={inputClass}
                  />
                </div>
              </div>

              {/* Row 3: Address in Korea + Phone (full width) */}
              <div className="mb-2">
                <p className={labelClass}>Address in Korea / 한국 내 주소 + Phone / 연락처</p>
                <div className="grid grid-cols-[1fr_0.4fr] gap-2">
                  <input
                    type="text"
                    value={form.addressKorea}
                    onChange={e => updateField('addressKorea', e.target.value)}
                    placeholder={L(lang, { ko: '호텔명 + 주소', zh: '酒店名+地址', en: 'Hotel name + address' })}
                    className={inputClass}
                  />
                  <input
                    type="tel"
                    value={form.phone}
                    onChange={e => updateField('phone', e.target.value)}
                    placeholder={L(lang, { ko: '전화번호', zh: '电话号码', en: 'Phone' })}
                    className={inputClass}
                  />
                </div>
              </div>

              {/* Row 4: Purpose of Visit (left) | Departure Info + Signature (right) */}
              <div className="grid grid-cols-[1fr_0.55fr] gap-3 border-t border-blue-800 pt-2">
                {/* Left: Purpose of Visit */}
                <div>
                  <p className={labelClass}>Purpose of Visit / 입국 목적</p>
                  <div className="grid grid-cols-2 gap-x-1 gap-y-0.5 mt-1">
                    {PURPOSE_OPTIONS.map(opt => (
                      <label key={opt.id} className="flex items-center gap-1 cursor-pointer py-0.5">
                        <input
                          type="checkbox"
                          checked={form.purpose === opt.id}
                          onChange={() => updateField('purpose', form.purpose === opt.id ? '' : opt.id)}
                          className="w-2.5 h-2.5 accent-blue-800 shrink-0"
                        />
                        <span className="text-[8px] text-gray-700 leading-tight">
                          {L(lang, opt.label)}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Right: Departure Date, Departure Flight, Signature */}
                <div className="space-y-2 border-l border-blue-300 pl-2">
                  <div>
                    <p className={labelClass}>Departure Date / 출항일자</p>
                    <input
                      type="date"
                      value={form.departureDate}
                      onChange={e => updateField('departureDate', e.target.value)}
                      className="w-full border-b border-gray-300 bg-transparent text-[10px] py-1 outline-none focus:border-blue-600"
                    />
                  </div>
                  <div>
                    <p className={labelClass}>Departure Flight / 출항 편명</p>
                    <input
                      type="text"
                      value={form.departureFlight}
                      onChange={e => updateField('departureFlight', e.target.value)}
                      placeholder={L(lang, { ko: '예: OZ312', zh: '例: OZ312', en: 'e.g. OZ312' })}
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <p className={labelClass}>Signature / 서명</p>
                    <SignaturePad sigRef={sigDataRef} />
                  </div>
                </div>
              </div>
            </div>

            {/* Tips */}
            <div className="bg-[#FFFBEB] border border-[#FDE68A] rounded-2xl p-4">
              <div className="flex items-start gap-2">
                <AlertTriangle size={16} className="text-[#F59E0B] shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-[#111827] mb-1">
                    {L(lang, { ko: '꿀팁!', zh: '小贴士！', en: 'Pro Tip!' })}
                  </p>
                  <ul className="text-xs text-[#374151] space-y-1">
                    <li>{L(lang, {
                      ko: '• 미리 호텔 영문주소를 캡처해두세요! 기내에서 WiFi 없이 작성해야 합니다.',
                      zh: '• 提前截图酒店英文地址！飞机上没有WiFi需要填写。',
                      en: '• Screenshot your hotel address in advance! You need to fill this out on the plane without WiFi.'
                    })}</li>
                    <li>{L(lang, {
                      ko: '• 이 앱에서 미리 작성하고 이미지 저장하면 기내에서 그대로 베끼면 됩니다!',
                      zh: '• 在APP上提前填好并保存图片，飞机上照着抄就行！',
                      en: '• Fill this out in the app and save the image — just copy it on the plane!'
                    })}</li>
                    <li>{L(lang, {
                      ko: '• 생년월일은 2자리 연도로 기재 (예: 95/03/15)',
                      zh: '• 出生日期用2位数年份填写（例：95/03/15）',
                      en: '• Date of birth uses 2-digit year (e.g., 95/03/15)'
                    })}</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Warnings */}
            <div className="bg-red-50 border border-red-200 rounded-2xl p-4">
              <div className="flex items-start gap-2">
                <FileText size={16} className="text-red-500 shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-red-700 mb-1">
                    {L(lang, { ko: '주의사항', zh: '注意事项', en: 'Important' })}
                  </p>
                  <ul className="text-xs text-red-600 space-y-1">
                    <li>{L(lang, { ko: '• 반드시 영문 대문자로 작성', zh: '• 必须用英文大写字母填写', en: '• Must be written in UPPERCASE English' })}</li>
                    <li>{L(lang, { ko: '• 볼펜(검정 또는 파랑)으로 작성', zh: '• 用圆珠笔（黑色或蓝色）填写', en: '• Use ballpoint pen (black or blue)' })}</li>
                    <li>{L(lang, { ko: '• 수정액 사용 불가, 틀리면 새 카드 요청', zh: '• 不可使用修正液，写错请要新卡', en: '• No correction fluid — ask for a new card if needed' })}</li>
                    <li>{L(lang, { ko: '• 여권에 기재된 영문이름과 동일하게 작성', zh: '• 必须与护照上的英文姓名一致', en: '• Name must match passport exactly' })}</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Q-CODE 전자입국신고서 */}
            <div className="bg-[#EFF6FF] border border-[#BFDBFE] rounded-2xl p-4">
              <div className="flex items-start gap-2">
                <span className="text-lg">✈️</span>
                <div className="flex-1">
                  <p className="text-sm font-bold text-[#111827] mb-1">
                    {L(lang, { ko: '전자입국신고서 (Q-CODE)', zh: '电子入境申报 (Q-CODE)', en: 'Electronic Entry Form (Q-CODE)' })}
                  </p>
                  <p className="text-xs text-[#374151] leading-relaxed mb-3">
                    {L(lang, {
                      ko: '한국 입국 전 온라인으로 미리 작성할 수 있습니다.\n건강상태, 세관신고를 한번에!\n실물 카드를 안 써도 됩니다.',
                      zh: '可在入境韩国前在线提前填写。\n健康状况、海关申报一次搞定！\n不用填纸质卡。',
                      en: 'Fill out online before entering Korea.\nHealth status & customs declaration in one!\nNo need for paper cards.'
                    }).split('\n').map((line, i) => <span key={i}>{line}<br/></span>)}
                  </p>
                  <div className="flex gap-2">
                    <a href="https://www.q-code.or.kr" target="_blank" rel="noopener noreferrer" className="flex-1 text-center py-2.5 rounded-xl bg-blue-600 text-white text-xs font-bold active:scale-95 transition-transform">
                      Q-CODE {L(lang, { ko: '바로가기', zh: '前往填写', en: 'Go to site' })}
                    </a>
                    <a href="https://www.k-eta.go.kr" target="_blank" rel="noopener noreferrer" className="flex-1 text-center py-2.5 rounded-xl bg-[#374151] text-white text-xs font-bold active:scale-95 transition-transform">
                      K-ETA ({L(lang, { ko: '비자면제국', zh: '免签国家', en: 'Visa-free' })})
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* Source + Footer */}
            <p className="text-[10px] text-gray-400 text-center">
              {L(lang, { ko: '출처: 법무부 출입국외국인정책본부', zh: '来源：法务部出入境外国人政策本部', en: 'Source: Ministry of Justice, Immigration' })}
            </p>
          </>
        )}

        <p className="text-xs text-gray-400 text-center mt-8">
          {L(lang, { ko: '정보 기준: 2026년 3월 | 문의: hanpocket@email.com', zh: '信息基准: 2026年3月 | 联系: hanpocket@email.com', en: 'As of March 2026 | Contact: hanpocket@email.com' })}
        </p>
      </div>
    </div>
  )
}
