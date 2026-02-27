import { useState, useEffect, lazy, Suspense } from 'react'
import { MapPin, Loader2, PawPrint } from 'lucide-react'

function L(lang, data) {
  if (typeof data === 'string') return data
  return data?.[lang] || data?.en || data?.zh || data?.ko || ''
}

const steps = [
  {
    icon: '💉', num: 1,
    title: { ko: '마이크로칩 삽입', zh: '植入微芯片', en: 'Microchip Implant' },
    desc: { ko: 'ISO 11784/11785 규격, 15자리 번호. 동물병원에서 시술하며, 비용은 약 100~300위안입니다.', zh: 'ISO 11784/11785规格，15位编号。在动物医院植入，费用约100~300元人民币。', en: 'ISO 11784/11785 standard, 15-digit number. Done at a vet clinic, costs about 100-300 CNY.' },
  },
  {
    icon: '💊', num: 2,
    title: { ko: '광견병 예방접종', zh: '狂犬病疫苗接种', en: 'Rabies Vaccination' },
    desc: { ko: '마이크로칩 삽입 후 접종. 접종 후 30일~1년 이내 유효하며, 접종증명서를 반드시 보관하세요.', zh: '植入芯片后接种。接种后30天~1年内有效，务必保管接种证明。', en: 'Vaccinate after microchip. Valid 30 days to 1 year after vaccination. Keep the certificate.' },
  },
  {
    icon: '🔬', num: 3,
    title: { ko: '광견병 항체가 검사', zh: '狂犬病抗体检测', en: 'Rabies Antibody Test' },
    desc: { ko: '0.5 IU/ml 이상이어야 합니다. 지정 검사기관(칭다오, 베이징 등)에서 검사하며, 결과는 2~3주 소요됩니다. 검사일로부터 2년 유효.', zh: '需达到0.5 IU/ml以上。在指定检测机构（青岛、北京等）检测，结果需2~3周。自检测日起2年有效。', en: 'Must be ≥0.5 IU/ml. Test at designated labs (Qingdao, Beijing, etc.). Results take 2-3 weeks. Valid 2 years from test date.' },
  },
  {
    icon: '📋', num: 4,
    title: { ko: '건강증명서 발급', zh: '健康证明签发', en: 'Health Certificate' },
    desc: { ko: '출발 7일 이내에 발급받아야 합니다. 현지 동물병원 + 관할 동물위생감독소에서 발급.', zh: '需在出发前7天内签发。由当地动物医院 + 管辖动物卫生监督所签发。', en: 'Must be issued within 7 days of departure. Issued by local vet + animal health supervision office.' },
  },
  {
    icon: '🛂', num: 5,
    title: { ko: '수출검역증명서', zh: '出口检疫证明', en: 'Export Quarantine Certificate' },
    desc: { ko: '출발지 해관(海关)/출입경검역기관에서 발급받습니다.', zh: '由出发地海关/出入境检验检疫机构签发。', en: 'Issued by the customs/entry-exit inspection bureau at departure.' },
  },
  {
    icon: '✈️', num: 6,
    title: { ko: '항공사 예약', zh: '航空公司预订', en: 'Airline Booking' },
    desc: { ko: '기내반입(8kg 이하, 일부 항공사만) vs 화물칸. 항공사별 규정이 상이하니 사전 확인 필수.', zh: '客舱携带（8kg以下，部分航空公司）vs 货舱。各航空公司规定不同，请提前确认。', en: 'Cabin (under 8kg, some airlines only) vs cargo hold. Rules vary by airline—check in advance.' },
  },
  {
    icon: '🏥', num: 7,
    title: { ko: '한국 도착 검역', zh: '韩国到达检疫', en: 'Korea Arrival Quarantine' },
    desc: { ko: '농림축산검역본부 인천공항 검역장에서 검역합니다. 서류 완비 시 당일 통과 가능.', zh: '在农林畜产检疫本部仁川机场检疫场进行检疫。文件齐全可当日通过。', en: 'At APQA Incheon Airport quarantine. Same-day clearance possible with complete documents.' },
  },
  {
    icon: '📝', num: 8,
    title: { ko: '국내 동물등록', zh: '国内动物登记', en: 'Domestic Animal Registration' },
    desc: { ko: '도착 후 30일 이내에 가까운 동물병원/시군구청에서 등록. 등록비 약 1만원.', zh: '到达后30天内在附近动物医院/市区政府登记。登记费约1万韩元。', en: 'Register within 30 days at a nearby vet/district office. Registration fee about ₩10,000.' },
  },
]

const regionDiffs = [
  { region: { ko: '🇨🇳 중국 본토', zh: '🇨🇳 中国大陆', en: '🇨🇳 Mainland China' }, note: { ko: '광견병 비청정국 → 항체가검사 필수', zh: '非狂犬病清净国 → 抗体检测必须', en: 'Non-rabies-free → antibody test required' }, color: 'bg-red-50 text-red-700' },
  { region: { ko: '🇭🇰 홍콩', zh: '🇭🇰 香港', en: '🇭🇰 Hong Kong' }, note: { ko: '광견병 청정지역 → 항체가검사 면제 가능', zh: '狂犬病清净地区 → 可免抗体检测', en: 'Rabies-free → antibody test may be waived' }, color: 'bg-green-50 text-green-700' },
  { region: { ko: '🇹🇼 대만', zh: '🇹🇼 台湾', en: '🇹🇼 Taiwan' }, note: { ko: '광견병 비청정국 → 항체가검사 필수', zh: '非狂犬病清净国 → 抗体检测必须', en: 'Non-rabies-free → antibody test required' }, color: 'bg-red-50 text-red-700' },
  { region: { ko: '🇲🇴 마카오', zh: '🇲🇴 澳门', en: '🇲🇴 Macau' }, note: { ko: '별도 확인 필요', zh: '需另行确认', en: 'Requires separate confirmation' }, color: 'bg-amber-50 text-amber-700' },
]

const warnings = [
  { ko: '단두종(불독, 퍼그 등) 항공 운송 제한', zh: '短头犬种（斗牛犬、巴哥等）航空运输限制', en: 'Brachycephalic breeds (Bulldog, Pug, etc.) may be restricted from air transport' },
  { ko: '한국 반입금지 맹견 5종: 도사견, 핏불테리어, 로트와일러, 아메리칸스태퍼드셔테리어 등', zh: '韩国禁止进口的5种猛犬：土佐犬、比特犬、罗威纳、美国斯塔福德梗等', en: 'Korea bans 5 dangerous breeds: Tosa, Pit Bull Terrier, Rottweiler, American Staffordshire Terrier, etc.' },
  { ko: '검역 불합격 시 격리(최대 180일) 또는 반송', zh: '检疫不合格将被隔离（最长180天）或遣返', en: 'Failed quarantine: isolation (up to 180 days) or return shipment' },
  { ko: '1인당 반입 마리수 제한 — 5마리 이상은 상업용으로 간주', zh: '每人限制携带数量 — 5只以上视为商业用途', en: 'Import limit per person — 5+ animals considered commercial' },
]

const costs = [
  { item: { ko: '마이크로칩', zh: '微芯片', en: 'Microchip' }, price: '100~300元' },
  { item: { ko: '광견병접종', zh: '狂犬疫苗', en: 'Rabies vaccine' }, price: '50~200元' },
  { item: { ko: '항체가검사', zh: '抗体检测', en: 'Antibody test' }, price: '500~1,000元' },
  { item: { ko: '건강증명서', zh: '健康证明', en: 'Health cert' }, price: '200~500元' },
  { item: { ko: '항공운송비', zh: '航空运费', en: 'Air transport' }, price: '2,000~8,000元' },
  { item: { ko: '한국 동물등록', zh: '韩国动物登记', en: 'KR registration' }, price: '~₩10,000' },
]

const links = [
  { name: { ko: '농림축산검역본부', zh: '农林畜产检疫本部', en: 'APQA (Animal & Plant Quarantine Agency)' }, url: 'https://www.qia.go.kr' },
  { name: { ko: '대한항공 반려동물 규정', zh: '大韩航空宠物规定', en: 'Korean Air Pet Policy' }, url: 'https://www.koreanair.com/kr/ko/airport/pet' },
  { name: { ko: '아시아나 반려동물 규정', zh: '韩亚航空宠物规定', en: 'Asiana Pet Policy' }, url: 'https://flyasiana.com/I/KR/KO/contents/pet' },
  { name: { ko: '중국국제항공 반려동물', zh: '中国国际航空宠物', en: 'Air China Pet Policy' }, url: 'https://www.airchina.com.cn' },
]

export default function PetTab({ lang, setTab }) {
  const [openStep, setOpenStep] = useState(null)
  const [checkedSteps, setCheckedSteps] = useState(() => {
    try { return JSON.parse(localStorage.getItem('pet_steps_checked')) || {} } catch { return {} }
  })

  const toggleStep = (num) => {
    const updated = { ...checkedSteps, [num]: !checkedSteps[num] }
    setCheckedSteps(updated)
    localStorage.setItem('pet_steps_checked', JSON.stringify(updated))
  }

  const doneCount = steps.filter(s => checkedSteps[s.num]).length
  const pct = Math.round((doneCount / steps.length) * 100)

  return (
    <div className="space-y-4 animate-fade-up">
      {/* Header */}
      <div className="bg-dark-gradient rounded-lg p-6 text-white">
        <div className="flex items-center gap-3 mb-2">
          <span className="text-3xl">🐾</span>
          <div>
            <h2 className="text-lg font-bold">
              {lang === 'ko' ? '반려동물 한국 입국 가이드' : lang === 'zh' ? '宠物入境韩国指南' : 'Pet Import to Korea Guide'}
            </h2>
            <p className="text-sm text-[#8E8E93]">
              {lang === 'ko' ? '중국 → 한국 기준 · 단계별 완벽 가이드' : lang === 'zh' ? '中国 → 韩国 · 分步完整指南' : 'China → Korea · Complete step-by-step guide'}
            </p>
          </div>
        </div>
        {/* Progress */}
        <div className="mt-3">
          <div className="flex items-center justify-between text-xs mb-1">
            <span className="text-[#8E8E93]">{lang === 'ko' ? '진행률' : lang === 'zh' ? '进度' : 'Progress'}</span>
            <span className="text-[#111827] font-bold">{doneCount}/{steps.length} ({pct}%)</span>
          </div>
          <div className="w-full bg-white/10 rounded-full h-2">
            <div className={`h-2 rounded-full transition-all ${pct === 100 ? 'bg-green-400' : 'bg-[#111827]'}`} style={{ width: `${pct}%` }} />
          </div>
        </div>
      </div>

      {/* Steps */}
      <div className="space-y-2">
        <h3 className="text-sm font-bold text-[#1C1C1E] flex items-center gap-1.5">
          📋 {lang === 'ko' ? '절차 스텝' : lang === 'zh' ? '流程步骤' : 'Procedure Steps'}
        </h3>
        {steps.map(step => (
          <div key={step.num} className="glass rounded-lg overflow-hidden">
            <button
              onClick={() => setOpenStep(openStep === step.num ? null : step.num)}
              className="w-full flex items-center gap-3 p-4 text-left btn-press"
            >
              <button onClick={(e) => { e.stopPropagation(); toggleStep(step.num) }}
                className={`w-7 h-7 rounded-full border-2 flex items-center justify-center text-xs font-bold transition-all shrink-0 ${
                  checkedSteps[step.num] ? 'bg-[#111827] border-[#111827] text-white' : 'border-[#D1D1D6] text-[#8E8E93]'
                }`}>
                {checkedSteps[step.num] ? '✓' : step.num}
              </button>
              <span className="text-lg shrink-0">{step.icon}</span>
              <span className={`text-sm font-semibold flex-1 ${checkedSteps[step.num] ? 'text-[#8E8E93] line-through' : 'text-[#2C2C2E]'}`}>
                {L(lang, step.title)}
              </span>
              <span className="text-[#8E8E93] text-sm shrink-0">{openStep === step.num ? '▲' : '▼'}</span>
            </button>
            {openStep === step.num && (
              <div className="px-4 pb-4 pt-0 border-t border-[#EDE9E3] animate-fade-up">
                <p className="text-xs text-[#6B2035] leading-relaxed mt-3">{L(lang, step.desc)}</p>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Regional Differences */}
      <div className="glass rounded-lg p-4">
        <h3 className="font-bold text-[#1C1C1E] text-sm mb-3">
          🌏 {lang === 'ko' ? '국적별 차이' : lang === 'zh' ? '各国差异' : 'Regional Differences'}
        </h3>
        <div className="space-y-2">
          {regionDiffs.map((r, i) => (
            <div key={i} className={`flex items-center justify-between px-3 py-2.5 rounded-xl ${r.color}`}>
              <span className="text-xs font-bold">{L(lang, r.region)}</span>
              <span className="text-[10px]">{L(lang, r.note)}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Warnings */}
      <div className="bg-red-50 rounded-lg p-4 border border-red-200">
        <h3 className="font-bold text-red-700 text-sm mb-2">
          ⚠️ {lang === 'ko' ? '주의사항' : lang === 'zh' ? '注意事项' : 'Warnings'}
        </h3>
        <ul className="space-y-1.5">
          {warnings.map((w, i) => (
            <li key={i} className="text-xs text-red-600 flex gap-2">
              <span className="shrink-0">•</span>
              <span>{L(lang, w)}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Cost Estimate */}
      <div className="bg-[#1C1C1E] rounded-lg p-4">
        <h3 className="font-bold text-[#111827] text-sm mb-3">
          💰 {lang === 'ko' ? '예상 비용' : lang === 'zh' ? '预估费用' : 'Estimated Costs'}
        </h3>
        <div className="space-y-1.5">
          {costs.map((c, i) => (
            <div key={i} className="flex items-center justify-between">
              <span className="text-xs text-[#8E8E93]">{L(lang, c.item)}</span>
              <span className="text-xs font-bold text-[#111827]">{c.price}</span>
            </div>
          ))}
          <div className="border-t border-white/10 mt-2 pt-2 flex items-center justify-between">
            <span className="text-xs font-bold text-white">{lang === 'ko' ? '합계 예상' : lang === 'zh' ? '预估合计' : 'Estimated Total'}</span>
            <span className="text-sm font-black text-[#111827]">3,000~10,000元</span>
          </div>
        </div>
      </div>

      {/* Useful Links */}
      <div className="glass rounded-lg p-4">
        <h3 className="font-bold text-[#1C1C1E] text-sm mb-3">
          🔗 {lang === 'ko' ? '유용한 링크' : lang === 'zh' ? '有用链接' : 'Useful Links'}
        </h3>
        <div className="space-y-1.5">
          {links.map((link, i) => (
            <a key={i} href={link.url} target="_blank" rel="noopener noreferrer"
              className="flex items-center justify-between px-3 py-2 rounded-xl bg-[#F7F3ED] hover:bg-[#EDE9E3] transition-all">
              <span className="text-xs text-[#6B2035]">{L(lang, link.name)}</span>
              <span className="text-[10px] text-[#111827]">→</span>
            </a>
          ))}
        </div>
      </div>

      {/* CTA Button */}
      <button onClick={() => setTab && setTab('agency')}
        className="w-full bg-gradient-to-r from-[#1C1C1E] to-[#2C2C2E] text-center rounded-lg p-4 card-hover btn-press border border-[#111827]/30 shadow-lg">
        <span className="text-[#111827] font-bold text-base">
          📋 {lang === 'ko' ? '반려동물 서류 대행 신청' : lang === 'zh' ? '申请宠物文件代办' : 'Request Pet Document Service'}
        </span>
        <p className="text-[#8E8E93] text-xs mt-1">
          {lang === 'ko' ? '검역 서류 준비부터 동물등록까지' : lang === 'zh' ? '从检疫文件准备到动物登记' : 'From quarantine docs to animal registration'}
        </p>
      </button>
      {/* TourAPI 반려동물 동반 여행지 */}
      <TourApiPetSection lang={lang} />
    </div>
  )
}

const TourDetailModal = lazy(() => import('./TourDetailModal'))

function TourApiPetSection({ lang }) {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [detailItem, setDetailItem] = useState(null)

  useEffect(() => {
    import('../api/tourApi').then(({ getAreaBasedList }) => {
      // 관광지 중 반려동물 동반 가능한 곳
      getAreaBasedList({ contentTypeId: 76, numOfRows: 12, arrange: 'R' })
        .then(r => setItems(r.items || []))
        .finally(() => setLoading(false))
    })
  }, [])

  if (!loading && items.length === 0) return null

  return (
    <div className="mt-6 space-y-3">
      <h3 className="text-sm font-bold text-[#111827] flex items-center gap-1.5">
        🐾 {L(lang, { ko: '반려동물 동반 여행지', zh: '宠物友好旅游地', en: 'Pet-Friendly Spots' })}
      </h3>

      {loading && <div className="flex justify-center py-4"><Loader2 size={20} className="animate-spin text-blue-500" /></div>}

      <div className="grid grid-cols-2 gap-3">
        {items.map((item, i) => (
          <div key={item.contentid || i} onClick={() => setDetailItem(item)}
            className="rounded-xl overflow-hidden bg-white border border-gray-100 shadow-sm cursor-pointer">
            {item.firstimage ? (
              <img src={item.firstimage} alt={item.title} className="w-full h-28 object-cover" loading="lazy" />
            ) : (
              <div className="w-full h-28 bg-gray-100 flex items-center justify-center"><MapPin size={20} className="text-gray-400" /></div>
            )}
            <div className="p-2.5">
              <h4 className="text-xs font-semibold line-clamp-1">{item.title}</h4>
              {item.addr1 && <p className="text-[10px] text-[#9CA3AF] mt-0.5 line-clamp-1">{item.addr1}</p>}
            </div>
          </div>
        ))}
      </div>

      {detailItem && (
        <Suspense fallback={null}>
          <TourDetailModal item={detailItem} lang={lang} darkMode={false} onClose={() => setDetailItem(null)} />
        </Suspense>
      )}
    </div>
  )
}
