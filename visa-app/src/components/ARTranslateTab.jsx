import { useState, useRef, useEffect } from 'react'
import { Camera, CameraOff, Search, Copy, Check, ChevronLeft, Grid3x3, Type } from 'lucide-react'

function L(lang, d) { if (typeof d === 'string') return d; return d?.[lang] || d?.en || d?.zh || d?.ko || '' }

const signDict = [
  { ko: '출입금지', zh: '禁止出入', en: 'No Entry' },
  { ko: '영업중', zh: '营业中', en: 'Open' },
  { ko: '준비중', zh: '准备中', en: 'Preparing' },
  { ko: '화장실', zh: '洗手间', en: 'Restroom' },
  { ko: '비상구', zh: '紧急出口', en: 'Emergency Exit' },
  { ko: '금연', zh: '禁止吸烟', en: 'No Smoking' },
  { ko: '주차금지', zh: '禁止停车', en: 'No Parking' },
  { ko: '당기세요', zh: '拉', en: 'Pull' },
  { ko: '미세요', zh: '推', en: 'Push' },
  { ko: '주문하기', zh: '点餐', en: 'Order' },
  { ko: '계산대', zh: '收银台', en: 'Checkout' },
  { ko: '할인', zh: '折扣', en: 'Discount' },
  { ko: '세일', zh: '打折', en: 'Sale' },
  { ko: '신상품', zh: '新品', en: 'New Arrival' },
  { ko: '품절', zh: '售罄', en: 'Sold Out' },
  { ko: '무료', zh: '免费', en: 'Free' },
  { ko: '유료', zh: '收费', en: 'Paid' },
  { ko: '입구', zh: '入口', en: 'Entrance' },
  { ko: '출구', zh: '出口', en: 'Exit' },
  { ko: '엘리베이터', zh: '电梯', en: 'Elevator' },
  { ko: '에스컬레이터', zh: '扶梯', en: 'Escalator' },
  { ko: '계단', zh: '楼梯', en: 'Stairs' },
  { ko: '주차장', zh: '停车场', en: 'Parking Lot' },
  { ko: '지하철', zh: '地铁', en: 'Subway' },
  { ko: '버스정류장', zh: '公交车站', en: 'Bus Stop' },
  { ko: '택시승강장', zh: '出租车站', en: 'Taxi Stand' },
  { ko: '매표소', zh: '售票处', en: 'Ticket Office' },
  { ko: '안내소', zh: '咨询处', en: 'Information' },
  { ko: '분실물센터', zh: '失物招领处', en: 'Lost & Found' },
  { ko: '흡연구역', zh: '吸烟区', en: 'Smoking Area' },
  { ko: '와이파이', zh: 'WiFi', en: 'WiFi' },
  { ko: '충전', zh: '充电', en: 'Charging' },
  { ko: '영수증', zh: '收据', en: 'Receipt' },
  { ko: '포장', zh: '打包', en: 'Takeout' },
  { ko: '매진', zh: '售罄', en: 'Sold Out' },
  { ko: '예약', zh: '预约', en: 'Reservation' },
  { ko: '대기', zh: '等候', en: 'Waiting' },
  { ko: '접수', zh: '接待', en: 'Reception' },
  { ko: '진료실', zh: '诊室', en: 'Treatment Room' },
  { ko: '약국', zh: '药店', en: 'Pharmacy' },
  { ko: '편의점', zh: '便利店', en: 'Convenience Store' },
  { ko: '세탁소', zh: '洗衣店', en: 'Laundry' },
  { ko: '미용실', zh: '美发店', en: 'Hair Salon' },
  { ko: '카페', zh: '咖啡厅', en: 'Cafe' },
  { ko: '식당', zh: '餐厅', en: 'Restaurant' },
  { ko: '냉면', zh: '冷面', en: 'Cold Noodles' },
  { ko: '김치찌개', zh: '泡菜汤', en: 'Kimchi Stew' },
  { ko: '비빔밥', zh: '拌饭', en: 'Bibimbap' },
  { ko: '삼겹살', zh: '五花肉', en: 'Pork Belly' },
  { ko: '치킨', zh: '炸鸡', en: 'Fried Chicken' },
  { ko: '떡볶이', zh: '炒年糕', en: 'Tteokbokki' },
  { ko: '불고기', zh: '烤肉', en: 'Bulgogi' },
  { ko: '된장찌개', zh: '大酱汤', en: 'Doenjang Jjigae' },
  { ko: '갈비탕', zh: '排骨汤', en: 'Galbitang' },
  { ko: '순두부찌개', zh: '嫩豆腐汤', en: 'Sundubu Jjigae' },
  { ko: '잔돈', zh: '零钱', en: 'Change' },
  { ko: '카드결제', zh: '刷卡', en: 'Card Payment' },
  { ko: '현금결제', zh: '现金支付', en: 'Cash Payment' },
  { ko: '택스리펀', zh: '退税', en: 'Tax Refund' },
  { ko: '면세', zh: '免税', en: 'Duty Free' },
]

export default function ARTranslateTab({ lang }) {
  const [mode, setMode] = useState('camera') // camera | manual | dict
  const [cameraOn, setCameraOn] = useState(false)
  const [captured, setCaptured] = useState(null)
  const [manualText, setManualText] = useState('')
  const [translated, setTranslated] = useState([])
  const [copiedIdx, setCopiedIdx] = useState(null)
  const [dictSearch, setDictSearch] = useState('')
  const videoRef = useRef(null)
  const canvasRef = useRef(null)
  const streamRef = useRef(null)

  const startCamera = async () => {
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Camera API not supported')
      }
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } })
      streamRef.current = stream
      if (videoRef.current) { videoRef.current.srcObject = stream }
      setCameraOn(true)
    } catch (err) {
      console.warn('Camera access unavailable:', err)
      setCameraOn(false)
      alert(lang === 'ko' ? '카메라 기능은 이 환경에서 사용할 수 없습니다' : lang === 'zh' ? '摄像头功能在此环境中不可用' : 'Camera feature unavailable in this environment')
    }
  }

  const stopCamera = () => {
    streamRef.current?.getTracks().forEach(t => t.stop())
    setCameraOn(false)
  }

  useEffect(() => { return () => { streamRef.current?.getTracks().forEach(t => t.stop()) } }, [])

  const capture = () => {
    if (!videoRef.current || !canvasRef.current) return
    const v = videoRef.current, c = canvasRef.current
    c.width = v.videoWidth; c.height = v.videoHeight
    c.getContext('2d').drawImage(v, 0, 0)
    setCaptured(c.toDataURL('image/jpeg'))
    stopCamera()
  }

  const translateManual = () => {
    if (!manualText.trim()) return
    const lines = manualText.split(/[\n,，、]/).map(s => s.trim()).filter(Boolean)
    const results = lines.map(line => {
      const found = signDict.find(d => d.ko === line || d.ko.includes(line) || line.includes(d.ko))
      if (found) return found
      // partial search
      const partial = signDict.find(d => d.ko.includes(line) || line.includes(d.ko))
      if (partial) return partial
      return { ko: line, zh: '(未找到翻译)', en: '(Translation not found)' }
    })
    setTranslated(results)
  }

  const copyText = (text, idx) => {
    navigator.clipboard.writeText(text).catch(() => {})
    setCopiedIdx(idx)
    setTimeout(() => setCopiedIdx(null), 1500)
  }

  const filteredDict = dictSearch
    ? signDict.filter(d => d.ko.includes(dictSearch) || d.zh.includes(dictSearch) || d.en.toLowerCase().includes(dictSearch.toLowerCase()))
    : signDict

  return (
    <div className="space-y-4 animate-fade-up">
      {/* Mode switcher */}
      <div className="flex gap-2">
        {[
          { id: 'camera', icon: Camera, label: { ko: '카메라', zh: '相机', en: 'Camera' } },
          { id: 'manual', icon: Type, label: { ko: '수동 입력', zh: '手动输入', en: 'Manual' } },
          { id: 'dict', icon: Search, label: { ko: '사전', zh: '词典', en: 'Dictionary' } },
        ].map(m => (
          <button key={m.id} onClick={() => setMode(m.id)}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-semibold rounded-xl transition-all ${
              mode === m.id ? 'bg-[#111827] text-white' : 'bg-[#F3F4F6] text-[#6B7280]'
            }`}>
            <m.icon size={14} /> {L(lang, m.label)}
          </button>
        ))}
      </div>

      {/* Camera mode */}
      {mode === 'camera' && (
        <div className="space-y-3">
          <div className="relative bg-black rounded-2xl overflow-hidden aspect-[4/3]">
            {!captured ? (
              <>
                <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
                {/* Grid overlay */}
                {cameraOn && (
                  <div className="absolute inset-0 pointer-events-none">
                    <div className="w-full h-full grid grid-cols-3 grid-rows-3">
                      {Array.from({ length: 9 }).map((_, i) => (
                        <div key={i} className="border border-white/20" />
                      ))}
                    </div>
                    <div className="absolute bottom-3 left-0 right-0 text-center text-white/70 text-xs">
                      {L(lang, { ko: '카메라로 간판을 보면서 아래 사전에서 검색하세요', zh: '对照相机中的招牌，在下方词典中搜索', en: 'View the sign with camera, then search in the dictionary below' })}
                    </div>
                  </div>
                )}
                {!cameraOn && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-white/60">
                    <CameraOff size={32} />
                    <p className="text-xs mt-2">{L(lang, { ko: '카메라를 시작해주세요', zh: '请启动相机', en: 'Start camera' })}</p>
                  </div>
                )}
              </>
            ) : (
              <img src={captured} alt="Captured" className="w-full h-full object-cover" />
            )}
            <canvas ref={canvasRef} className="hidden" />
          </div>
          <div className="flex gap-2">
            {!captured ? (
              <>
                {!cameraOn ? (
                  <button onClick={startCamera} className="flex-1 bg-[#111827] text-white font-semibold py-3 rounded-xl text-sm flex items-center justify-center gap-2">
                    <Camera size={16} /> {L(lang, { ko: '카메라 시작', zh: '启动相机', en: 'Start Camera' })}
                  </button>
                ) : (
                  <button onClick={capture} className="flex-1 bg-[#111827] text-white font-semibold py-3 rounded-xl text-sm flex items-center justify-center gap-2">
                    <Camera size={16} /> {L(lang, { ko: '촬영', zh: '拍照', en: 'Capture' })}
                  </button>
                )}
              </>
            ) : (
              <button onClick={() => { setCaptured(null); startCamera() }} className="flex-1 bg-[#F3F4F6] text-[#111827] font-semibold py-3 rounded-xl text-sm">
                {L(lang, { ko: '다시 촬영', zh: '重新拍照', en: 'Retake' })}
              </button>
            )}
          </div>
          {captured && (
            <div className="bg-white rounded-2xl p-5 border border-[#E5E7EB] card-glow">
              <p className="text-sm text-[#6B7280] mb-3">{L(lang, { ko: '사진에서 보이는 한국어를 아래에 입력해주세요:', zh: '请在下方输入照片中看到的韩文：', en: 'Type the Korean text you see in the photo:' })}</p>
              <textarea value={manualText} onChange={e => setManualText(e.target.value)}
                placeholder={L(lang, { ko: '예: 출입금지, 영업중', zh: '例：출입금지, 영업중', en: 'e.g. 출입금지, 영업중' })}
                className="w-full bg-[#F3F4F6] rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[#111827]/10 resize-none h-20" />
              <button onClick={translateManual} className="w-full mt-2 bg-[#111827] text-white font-semibold py-2.5 rounded-xl text-sm">
                {L(lang, { ko: '번역하기', zh: '翻译', en: 'Translate' })}
              </button>
            </div>
          )}
        </div>
      )}

      {/* Manual mode */}
      {mode === 'manual' && (
        <div className="bg-white rounded-2xl p-5 border border-[#E5E7EB] card-glow space-y-3">
          <p className="text-sm font-semibold text-[#111827]">{L(lang, { ko: '한국어 텍스트를 입력하세요', zh: '请输入韩文文字', en: 'Enter Korean text' })}</p>
          <textarea value={manualText} onChange={e => setManualText(e.target.value)}
            placeholder={L(lang, { ko: '간판이나 메뉴에서 본 한국어를 입력하세요\n여러 단어는 쉼표로 구분', zh: '输入在招牌或菜单上看到的韩文\n多个词用逗号分隔', en: 'Type Korean text from signs/menus\nSeparate with commas' })}
            className="w-full bg-[#F3F4F6] rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[#111827]/10 resize-none h-24" />
          <button onClick={translateManual} className="w-full bg-[#111827] text-white font-semibold py-2.5 rounded-xl text-sm">
            {L(lang, { ko: '번역하기', zh: '翻译', en: 'Translate' })}
          </button>
        </div>
      )}

      {/* Dict mode */}
      {mode === 'dict' && (
        <div className="space-y-3">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-3 text-[#9CA3AF]" />
            <input type="text" value={dictSearch} onChange={e => setDictSearch(e.target.value)}
              placeholder={L(lang, { ko: '검색...', zh: '搜索...', en: 'Search...' })}
              className="w-full bg-[#F3F4F6] rounded-xl pl-10 pr-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#111827]/10" />
          </div>
          <div className="space-y-2">
            {filteredDict.map((d, i) => (
              <div key={i} className="bg-white rounded-xl p-3 border border-[#E5E7EB] flex items-center justify-between">
                <div>
                  <p className="font-bold text-[#111827] text-sm">{d.ko}</p>
                  <p className="text-xs text-[#6B7280]">{d.zh} / {d.en}</p>
                </div>
                <button onClick={() => copyText(`${d.ko} - ${d.zh} - ${d.en}`, `dict-${i}`)}
                  className="p-2 rounded-lg hover:bg-[#F3F4F6] transition-colors">
                  {copiedIdx === `dict-${i}` ? <Check size={14} className="text-green-600" /> : <Copy size={14} className="text-[#9CA3AF]" />}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Translation results */}
      {translated.length > 0 && mode !== 'dict' && (
        <div className="space-y-2">
          <h3 className="font-bold text-[#111827] text-sm">{L(lang, { ko: '번역 결과', zh: '翻译结果', en: 'Results' })}</h3>
          {translated.map((t, i) => (
            <div key={i} className="bg-white rounded-2xl p-4 border border-[#E5E7EB] card-glow">
              <p className="font-bold text-[#111827]">{t.ko}</p>
              <p className="text-sm text-[#6B7280] mt-1">{t.zh} / {t.en}</p>
              <button onClick={() => copyText(`${t.ko} = ${t.zh} = ${t.en}`, `res-${i}`)}
                className="mt-2 flex items-center gap-1 text-xs text-[#6B7280] hover:text-[#111827]">
                {copiedIdx === `res-${i}` ? <Check size={12} /> : <Copy size={12} />}
                {L(lang, { ko: '복사', zh: '复制', en: 'Copy' })}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
