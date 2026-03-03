import { useState, useEffect, useRef, useCallback } from 'react'
import { Camera, Trash2, AlertTriangle } from 'lucide-react'

function L(lang, d) { if (typeof d === 'string') return d; return d?.[lang] || d?.en || d?.zh || d?.ko || '' }

const STORAGE_KEY = 'hanpocket_customs_form'

const QUESTIONS = [
  {
    id: 1,
    label: {
      ko: '면세 범위를 초과하는 물품(주류, 담배, 향수, 기타 물품)을 소지하고 계십니까?',
      zh: '您是否携带超过免税范围的物品（酒类、烟草、香水、其他物品）？',
      en: 'Are you carrying goods exceeding duty-free limits (alcohol, tobacco, perfume, others)?'
    }
  },
  {
    id: 2,
    label: {
      ko: 'FTA 협정에 의한 원산지 물품을 반입하십니까?',
      zh: '您是否携带FTA协定原产地物品入境？',
      en: 'Are you bringing goods under FTA origin rules?'
    }
  },
  {
    id: 3,
    label: {
      ko: '미화 1만 달러를 초과하는 통화 또는 유가증권을 소지하고 계십니까?',
      zh: '您是否携带超过1万美元的货币或有价证券？',
      en: 'Are you carrying currency or securities exceeding USD 10,000?'
    },
    hasAmount: true
  },
  {
    id: 4,
    label: {
      ko: '총기, 위조화폐, 마약 등 반입 금지·제한 물품을 소지하고 계십니까?',
      zh: '您是否携带枪支、伪造货币、毒品等禁止/限制入境物品？',
      en: 'Are you carrying prohibited/restricted items (firearms, counterfeit currency, drugs, etc.)?'
    }
  },
  {
    id: 5,
    label: {
      ko: '검역 대상 동·식물 또는 축산물을 소지하고 계십니까?',
      zh: '您是否携带需要检疫的动植物或畜产品？',
      en: 'Are you carrying animals, plants, or livestock products subject to quarantine?'
    }
  },
  {
    id: 6,
    label: {
      ko: '세관 확인이 필요한 물품을 소지하고 계십니까?',
      zh: '您是否携带需要海关确认的物品？',
      en: 'Are you carrying items that require customs inspection?'
    }
  }
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

export default function CustomsGuide({ lang }) {
  const [form, setForm] = useState({
    name: '',
    birthYear: '',
    birthMonth: '',
    birthDay: '',
    passportNo: '',
    stayDays: '',
    familyCount: '',
    embarkCountry: '',
    phone: '',
    flightNo: '',
    addressKorea: '',
    answers: { 1: '', 2: '', 3: '', 4: '', 5: '', 6: '' },
    q3Amount: ''
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

  // Save to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(form))
    } catch (e) { /* ignore */ }
  }, [form])

  const updateField = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  const updateAnswer = (qId, value) => {
    setForm(prev => ({
      ...prev,
      answers: { ...prev.answers, [qId]: value }
    }))
  }

  const handleCapture = useCallback(async () => {
    const el = cardRef.current
    if (!el) return

    try {
      // Dynamic import of html2canvas for screenshot
      const { default: html2canvas } = await import('https://cdn.jsdelivr.net/npm/html2canvas@1.4.1/+esm')
      const canvas = await html2canvas(el, {
        backgroundColor: '#FFF8F0',
        scale: 2,
        useCORS: true,
        logging: false
      })
      const link = document.createElement('a')
      link.download = 'customs-declaration.png'
      link.href = canvas.toDataURL('image/png')
      link.click()
    } catch {
      // Fallback: native canvas capture
      try {
        const canvas = document.createElement('canvas')
        const rect = el.getBoundingClientRect()
        canvas.width = rect.width * 2
        canvas.height = rect.height * 2
        const ctx = canvas.getContext('2d')
        ctx.scale(2, 2)
        ctx.fillStyle = '#FFF8F0'
        ctx.fillRect(0, 0, rect.width, rect.height)

        // Use SVG foreignObject approach
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
          link.download = 'customs-declaration.png'
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

  const inputClass = 'w-full border-b border-gray-300 bg-transparent text-xs py-1 px-0.5 outline-none focus:border-amber-600 uppercase placeholder:normal-case placeholder:text-gray-300'
  const labelClass = 'text-[8px] uppercase tracking-wider text-amber-900 font-semibold leading-none mb-0.5'

  return (
    <div className="space-y-4">
      {/* Capture button */}
      <div className="flex justify-end">
        <button
          onClick={handleCapture}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-50 border border-amber-200 text-amber-700 text-xs font-medium active:scale-95 transition-transform"
        >
          <Camera size={14} />
          {L(lang, { ko: '이미지 저장', zh: '保存图片', en: 'Save Image' })}
        </button>
      </div>

      {/* Card form */}
      <div ref={cardRef} className="bg-[#FFF8F0] border-2 border-amber-800 rounded-lg p-3 space-y-0">
        {/* Title */}
        <div className="text-center border-b border-amber-800 pb-2 mb-2">
          <p className="text-sm font-bold text-amber-900 tracking-wide">CUSTOMS DECLARATION</p>
          <p className="text-[10px] text-amber-800 font-medium">세관신고서</p>
          <p className="text-[7px] text-amber-700 mt-0.5">
            {L(lang, {
              ko: '한글 또는 영어로 작성하여 주시기 바랍니다',
              zh: '请用韩文或英文填写',
              en: 'Please fill out in Korean or English'
            })}
          </p>
        </div>

        {/* Row 1: Name */}
        <div className="mb-2">
          <p className={labelClass}>
            {L(lang, { ko: '① 성명 / NAME', zh: '① 姓名 / NAME', en: '① NAME' })}
          </p>
          <input
            type="text"
            value={form.name}
            onChange={e => updateField('name', e.target.value)}
            placeholder={L(lang, { ko: '여권상 영문이름', zh: '护照上的英文姓名', en: 'Full name as on passport' })}
            className={inputClass}
          />
        </div>

        {/* Row 2: Birth date + Passport No */}
        <div className="grid grid-cols-2 gap-3 mb-2">
          <div>
            <p className={labelClass}>
              {L(lang, { ko: '② 생년월일 / DATE OF BIRTH', zh: '② 出生日期', en: '② DATE OF BIRTH' })}
            </p>
            <div className="flex gap-1 items-center">
              <input
                type="text"
                value={form.birthYear}
                onChange={e => updateField('birthYear', e.target.value.slice(0, 4))}
                placeholder="YYYY"
                maxLength={4}
                className="w-12 border-b border-gray-300 bg-transparent text-xs py-1 text-center outline-none focus:border-amber-600"
              />
              <span className="text-[8px] text-gray-400">/</span>
              <input
                type="text"
                value={form.birthMonth}
                onChange={e => updateField('birthMonth', e.target.value.slice(0, 2))}
                placeholder="MM"
                maxLength={2}
                className="w-8 border-b border-gray-300 bg-transparent text-xs py-1 text-center outline-none focus:border-amber-600"
              />
              <span className="text-[8px] text-gray-400">/</span>
              <input
                type="text"
                value={form.birthDay}
                onChange={e => updateField('birthDay', e.target.value.slice(0, 2))}
                placeholder="DD"
                maxLength={2}
                className="w-8 border-b border-gray-300 bg-transparent text-xs py-1 text-center outline-none focus:border-amber-600"
              />
            </div>
          </div>
          <div>
            <p className={labelClass}>
              {L(lang, { ko: '③ 여권번호 / PASSPORT NO', zh: '③ 护照号码', en: '③ PASSPORT NO.' })}
            </p>
            <input
              type="text"
              value={form.passportNo}
              onChange={e => updateField('passportNo', e.target.value)}
              placeholder="E12345678"
              className={inputClass}
            />
          </div>
        </div>

        {/* Row 3: Stay days + Family members */}
        <div className="grid grid-cols-2 gap-3 mb-2">
          <div>
            <p className={labelClass}>
              {L(lang, { ko: '④ 체류기간(일) / LENGTH OF STAY', zh: '④ 停留天数', en: '④ LENGTH OF STAY (DAYS)' })}
            </p>
            <input
              type="number"
              value={form.stayDays}
              onChange={e => updateField('stayDays', e.target.value)}
              placeholder={L(lang, { ko: '일수', zh: '天数', en: 'Days' })}
              className={inputClass}
            />
          </div>
          <div>
            <p className={labelClass}>
              {L(lang, { ko: '⑤ 동반가족 수 / FAMILY MEMBERS', zh: '⑤ 同行家属人数', en: '⑤ ACCOMPANYING FAMILY' })}
            </p>
            <input
              type="number"
              value={form.familyCount}
              onChange={e => updateField('familyCount', e.target.value)}
              placeholder={L(lang, { ko: '명', zh: '人', en: 'Count' })}
              className={inputClass}
            />
          </div>
        </div>

        {/* Row 4: Embarkation country */}
        <div className="mb-2">
          <p className={labelClass}>
            {L(lang, { ko: '⑥ 출발국가 / COUNTRY OF EMBARKATION', zh: '⑥ 出发国家', en: '⑥ COUNTRY OF EMBARKATION' })}
          </p>
          <input
            type="text"
            value={form.embarkCountry}
            onChange={e => updateField('embarkCountry', e.target.value)}
            placeholder={L(lang, { ko: '예: CHINA', zh: '例: CHINA', en: 'e.g. CHINA' })}
            className={inputClass}
          />
        </div>

        {/* Row 5: Phone */}
        <div className="mb-2">
          <p className={labelClass}>
            {L(lang, { ko: '⑦ 연락처 / PHONE NO.', zh: '⑦ 联系电话', en: '⑦ PHONE NO.' })}
          </p>
          <input
            type="tel"
            value={form.phone}
            onChange={e => updateField('phone', e.target.value)}
            placeholder={L(lang, { ko: '전화번호', zh: '电话号码', en: 'Phone number' })}
            className={inputClass}
          />
        </div>

        {/* Row 6: Flight No */}
        <div className="mb-2">
          <p className={labelClass}>
            {L(lang, { ko: '⑧ 항공편명 / AIRLINE/FLIGHT NO.', zh: '⑧ 航班号', en: '⑧ AIRLINE/FLIGHT NO.' })}
          </p>
          <input
            type="text"
            value={form.flightNo}
            onChange={e => updateField('flightNo', e.target.value)}
            placeholder={L(lang, { ko: '예: OZ312', zh: '例: OZ312', en: 'e.g. OZ312' })}
            className={inputClass}
          />
        </div>

        {/* Row 7: Address in Korea */}
        <div className="mb-3">
          <p className={labelClass}>
            {L(lang, { ko: '⑨ 국내주소 / ADDRESS IN KOREA', zh: '⑨ 韩国地址', en: '⑨ ADDRESS IN KOREA' })}
          </p>
          <input
            type="text"
            value={form.addressKorea}
            onChange={e => updateField('addressKorea', e.target.value)}
            placeholder={L(lang, { ko: '호텔명 또는 주소', zh: '酒店名或地址', en: 'Hotel name or address' })}
            className={inputClass}
          />
        </div>

        {/* Divider */}
        <div className="border-t-2 border-amber-800 pt-2 mb-2">
          <p className="text-[9px] font-bold text-amber-900 text-center mb-2">
            {L(lang, {
              ko: '⑩ 세관 신고 사항 (해당란에 체크하시오)',
              zh: '⑩ 海关申报事项（请在相应栏内打勾）',
              en: '⑩ CUSTOMS DECLARATION ITEMS (Check applicable)'
            })}
          </p>
        </div>

        {/* Questions */}
        <div className="space-y-2">
          {QUESTIONS.map(q => (
            <div key={q.id} className="border-b border-gray-200 pb-2">
              <p className="text-[9px] text-gray-700 leading-tight mb-1">
                {q.id}. {L(lang, q.label)}
              </p>
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-1 cursor-pointer">
                  <input
                    type="radio"
                    name={`customs_q_${q.id}`}
                    checked={form.answers[q.id] === 'yes'}
                    onChange={() => updateAnswer(q.id, 'yes')}
                    className="w-3 h-3 accent-amber-700"
                  />
                  <span className="text-[9px] text-gray-600">
                    {L(lang, { ko: '예 Yes', zh: '是 Yes', en: 'Yes' })}
                  </span>
                </label>
                <label className="flex items-center gap-1 cursor-pointer">
                  <input
                    type="radio"
                    name={`customs_q_${q.id}`}
                    checked={form.answers[q.id] === 'no'}
                    onChange={() => updateAnswer(q.id, 'no')}
                    className="w-3 h-3 accent-amber-700"
                  />
                  <span className="text-[9px] text-gray-600">
                    {L(lang, { ko: '아니오 No', zh: '否 No', en: 'No' })}
                  </span>
                </label>
                {q.hasAmount && form.answers[q.id] === 'yes' && (
                  <div className="flex items-center gap-1 ml-2">
                    <span className="text-[8px] text-gray-500">
                      {L(lang, { ko: '총액:', zh: '总额:', en: 'Total:' })}
                    </span>
                    <span className="text-[8px] text-gray-500">$</span>
                    <input
                      type="text"
                      value={form.q3Amount}
                      onChange={e => updateField('q3Amount', e.target.value)}
                      placeholder="0"
                      className="w-16 border-b border-gray-300 bg-transparent text-[9px] py-0 px-0.5 outline-none focus:border-amber-600"
                    />
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Agreement text */}
        <div className="mt-3 pt-2 border-t border-amber-800">
          <p className="text-[7px] text-gray-500 leading-relaxed mb-2">
            {L(lang, {
              ko: '위 기재 사항은 사실과 다름이 없으며, 관세법에 따라 허위 신고 시 처벌을 받을 수 있음을 확인합니다.',
              zh: '以上填写内容均属实，如有虚假申报，将依据关税法受到处罚。',
              en: 'I confirm the above is true and accurate. False declarations may be subject to penalties under customs law.'
            })}
          </p>
        </div>

        {/* Date + Signature */}
        <div className="grid grid-cols-2 gap-3 mt-1">
          <div>
            <p className={labelClass}>
              {L(lang, { ko: '날짜 / DATE', zh: '日期 / DATE', en: 'DATE' })}
            </p>
            <p className="text-xs text-gray-600 border-b border-gray-300 py-1">
              {new Date().toISOString().split('T')[0]}
            </p>
          </div>
          <div>
            <p className={labelClass}>
              {L(lang, { ko: '서명 / SIGNATURE', zh: '签名 / SIGNATURE', en: 'SIGNATURE' })}
            </p>
            <SignaturePad sigRef={sigDataRef} />
          </div>
        </div>
      </div>

      {/* Tips */}
      <div className="bg-[#FFFBEB] border border-[#FDE68A] rounded-2xl p-4">
        <div className="flex items-start gap-2">
          <AlertTriangle size={16} className="text-[#F59E0B] shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-[#111827] mb-1">
              {L(lang, { ko: '세관신고 꿀팁', zh: '海关申报小贴士', en: 'Customs Tips' })}
            </p>
            <ul className="text-xs text-[#374151] space-y-1">
              <li>{L(lang, {
                ko: '• 면세범위: 주류 2병(2L이하, $400이하), 담배 200개비, 향수 60ml',
                zh: '• 免税范围：酒类2瓶（2L以下，$400以下），香烟200支，香水60ml',
                en: '• Duty-free: 2 bottles alcohol (≤2L, ≤$400), 200 cigarettes, 60ml perfume'
              })}</li>
              <li>{L(lang, {
                ko: '• 해외 구매 총액 $800 초과 시 신고 필요',
                zh: '• 海外购物总额超过$800需申报',
                en: '• Must declare if total overseas purchases exceed $800'
              })}</li>
              <li>{L(lang, {
                ko: '• 동반가족은 한 장으로 함께 신고 가능',
                zh: '• 同行家属可以用一张表一起申报',
                en: '• Accompanying family can declare together on one form'
              })}</li>
              <li>{L(lang, {
                ko: '• 불확실하면 "예"에 체크 (미신고 적발 시 벌금!)',
                zh: '• 不确定就勾"是"（未申报被查到会罚款！）',
                en: '• When in doubt, check "Yes" (penalties for undeclared items!)'
              })}</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Source */}
      <p className="text-[10px] text-gray-400 text-center">
        {L(lang, { ko: '출처: 관세청', zh: '来源：关税厅', en: 'Source: Korea Customs Service' })}
      </p>
    </div>
  )
}
