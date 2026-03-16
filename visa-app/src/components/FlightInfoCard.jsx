import { useState, useRef } from 'react'
import { ChevronLeft, Share2, Copy, Check, Plane, Clock, MapPin, Armchair, Tag, Info } from 'lucide-react'
import { AIRLINES, parseFlightNumber, getTerminal, COMMON_LOUNGES } from '../data/airlineData'

function L(lang, d) { return d?.[lang] || d?.ko || d?.en || '' }

export default function FlightInfoCard({ lang, onBack }) {
  const [input, setInput] = useState('')
  const [result, setResult] = useState(null)
  const [copied, setCopied] = useState(false)
  const [activeTab, setActiveTab] = useState('info')
  const cardRef = useRef(null)

  const search = () => {
    const parsed = parseFlightNumber(input)
    if (!parsed) return
    const airline = AIRLINES[parsed.airline]
    const terminal = getTerminal(parsed.airline)
    setResult({ parsed, airline, terminal })
    setActiveTab('info')
  }

  const generateShareText = () => {
    if (!result) return ''
    const { parsed, airline, terminal } = result
    const name = L(lang, airline?.name) || parsed.airline
    const lines = [
      `✈️ ${parsed.full} — ${name}`,
      `📍 ${L(lang, { ko: '인천공항', zh: '仁川机场', en: 'Incheon Airport' })} ${terminal}`,
    ]
    if (airline?.alliance) lines.push(`🤝 ${airline.alliance}`)
    if (airline?.lounges?.length) {
      lines.push('')
      lines.push(`🛋 ${L(lang, { ko: '라운지', zh: '贵宾室', en: 'Lounge' })}`)
      airline.lounges.filter(l => l.terminal === terminal).forEach(l => {
        lines.push(`  ${l.name} (${l.floor} ${l.area}) ${l.hours}`)
      })
    }
    if (airline?.promos?.length) {
      lines.push('')
      lines.push(`🎁 ${L(lang, { ko: '프로모션', zh: '促销', en: 'Promos' })}`)
      airline.promos.forEach(p => {
        lines.push(`  ${L(lang, p.title)}`)
      })
    }
    lines.push('')
    lines.push('— NEAR')
    return lines.join('\n')
  }

  const handleShare = async () => {
    const text = generateShareText()
    if (navigator.share) {
      try {
        await navigator.share({ title: `${result.parsed.full} Flight Info`, text })
      } catch (_) {}
    } else {
      await navigator.clipboard?.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const handleCopy = async () => {
    const text = generateShareText()
    await navigator.clipboard?.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const lounges = result?.airline?.lounges?.filter(l => l.terminal === result.terminal) || []
  const commonLounges = result ? (COMMON_LOUNGES[result.terminal] || []) : []
  const allLounges = [...lounges, ...commonLounges]

  return (
    <div className="bg-white min-h-screen">
      {/* Header */}
      <div className="sticky top-0 bg-white z-10 flex items-center px-5 py-3 border-b border-[#F0F0F0]">
        <button onClick={onBack} className="p-1"><ChevronLeft size={22} style={{ color: '#1A1A1A' }} /></button>
        <h2 className="flex-1 text-center typo-title pr-7" style={{ fontSize: 16 }}>
          {L(lang, { ko: '항공편 조회', zh: '航班查询', en: 'Flight Lookup' })}
        </h2>
      </div>

      {/* Search */}
      <div className="px-5 pt-5 pb-3">
        <p className="typo-whisper mb-2">FLIGHT NUMBER</p>
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value.toUpperCase())}
            onKeyDown={e => e.key === 'Enter' && search()}
            placeholder="KE831, OZ321, 7C123..."
            className="flex-1 text-[15px] font-medium border border-[#E5E7EB] rounded-[12px] px-4 py-3 outline-none focus:border-[#1A1A1A] transition-colors"
            style={{ color: '#1A1A1A', letterSpacing: '0.05em' }}
          />
          <button
            onClick={search}
            disabled={!input.trim()}
            className="px-5 py-3 rounded-[12px] text-sm font-semibold text-white disabled:opacity-40 active:scale-[0.97] transition-all"
            style={{ backgroundColor: '#1A1A1A' }}
          >
            {L(lang, { ko: '조회', zh: '查询', en: 'Search' })}
          </button>
        </div>
      </div>

      {/* Result */}
      {result && (
        <div className="px-5 pb-24" ref={cardRef}>
          {/* Airline Header Card */}
          <div
            className="rounded-[16px] p-5 mb-5"
            style={{ backgroundColor: result.airline?.color || '#1A1A1A' }}
          >
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-white/70 text-[10px] font-medium tracking-[0.15em] uppercase">
                  {result.airline?.alliance || L(lang, { ko: '독립 항공사', zh: '独立航空', en: 'Independent' })}
                </p>
                <p className="text-white text-[22px] font-light tracking-tight mt-0.5">
                  {result.parsed.full}
                </p>
              </div>
              <div className="flex gap-2">
                <button onClick={handleCopy} className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center active:scale-95 transition-transform">
                  {copied ? <Check size={16} color="white" /> : <Copy size={16} color="white" />}
                </button>
                <button onClick={handleShare} className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center active:scale-95 transition-transform">
                  <Share2 size={16} color="white" />
                </button>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <Plane size={16} color="white" style={{ opacity: 0.8 }} />
                <span className="text-white text-[14px] font-medium">{L(lang, result.airline?.name) || result.parsed.airline}</span>
              </div>
              <span className="text-white/50">|</span>
              <div className="flex items-center gap-2">
                <MapPin size={14} color="white" style={{ opacity: 0.8 }} />
                <span className="text-white text-[14px] font-medium">
                  {L(lang, { ko: '인천공항', zh: '仁川机场', en: 'Incheon' })} {result.terminal}
                </span>
              </div>
            </div>
          </div>

          {/* Tab Switcher */}
          <div className="flex gap-2 mb-5">
            {[
              { id: 'info', label: { ko: '항공사 정보', zh: '航空公司信息', en: 'Airline Info' }, icon: Info },
              { id: 'lounge', label: { ko: '라운지', zh: '贵宾室', en: 'Lounge' }, icon: Armchair, count: allLounges.length },
              { id: 'promo', label: { ko: '프로모션', zh: '促销', en: 'Promos' }, icon: Tag, count: result.airline?.promos?.length || 0 },
            ].map(t => (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id)}
                className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-[10px] text-[12px] font-semibold transition-all"
                style={{
                  backgroundColor: activeTab === t.id ? '#1A1A1A' : '#F3F4F6',
                  color: activeTab === t.id ? '#fff' : '#666',
                }}
              >
                <t.icon size={14} />
                {L(lang, t.label)}
                {t.count > 0 && <span className="text-[10px] opacity-70">({t.count})</span>}
              </button>
            ))}
          </div>

          {/* Info Tab */}
          {activeTab === 'info' && (
            <div className="space-y-4">
              {/* Terminal Info */}
              <div className="rounded-[14px] p-4" style={{ backgroundColor: '#F7F3EF' }}>
                <p className="typo-whisper mb-2">{L(lang, { ko: '터미널 안내', zh: '航站楼信息', en: 'TERMINAL INFO' })}</p>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="typo-body">{L(lang, { ko: '탑승 터미널', zh: '登机航站楼', en: 'Terminal' })}</span>
                    <span className="text-[15px] font-semibold" style={{ color: '#1A1A1A' }}>{result.terminal}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="typo-body">{L(lang, { ko: '제휴 얼라이언스', zh: '所属联盟', en: 'Alliance' })}</span>
                    <span className="text-[14px] font-medium" style={{ color: '#1A1A1A' }}>
                      {result.airline?.alliance || L(lang, { ko: '없음 (LCC)', zh: '无 (廉航)', en: 'None (LCC)' })}
                    </span>
                  </div>
                </div>
              </div>

              {/* Useful Tips */}
              <div className="rounded-[14px] border border-[#E5E7EB] p-4">
                <p className="typo-whisper mb-3">TIPS</p>
                <div className="space-y-2.5">
                  {[
                    { icon: '🛂', text: { ko: `${result.terminal} 입국심사 예상 대기: 20~40분`, zh: `${result.terminal} 入境审查预计等待: 20~40分钟`, en: `${result.terminal} immigration est. wait: 20-40 min` } },
                    { icon: '📱', text: { ko: `${result.terminal} SIM 매장: 도착층 1F`, zh: `${result.terminal} SIM卡柜台: 到达层1F`, en: `${result.terminal} SIM counter: Arrivals 1F` } },
                    { icon: '💱', text: { ko: `${result.terminal} 환전: 하나은행, 우리은행 (도착층)`, zh: `${result.terminal} 换钱: 韩亚银行、友利银行 (到达层)`, en: `${result.terminal} exchange: Hana Bank, Woori Bank (Arrivals)` } },
                    { icon: '🚄', text: { ko: `AREX 공항철도: ${result.terminal} B1 → 서울역 43분`, zh: `AREX机场铁路: ${result.terminal} B1 → 首尔站 43分钟`, en: `AREX: ${result.terminal} B1 → Seoul Station 43 min` } },
                  ].map((tip, i) => (
                    <div key={i} className="flex items-start gap-2.5">
                      <span className="text-[14px] mt-0.5">{tip.icon}</span>
                      <span className="typo-body leading-tight">{L(lang, tip.text)}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Lounge Tab */}
          {activeTab === 'lounge' && (
            <div className="space-y-3">
              {lounges.length > 0 && (
                <>
                  <p className="typo-whisper">{L(lang, { ko: '전용 라운지', zh: '专属贵宾室', en: 'EXCLUSIVE LOUNGE' })}</p>
                  {lounges.map((l, i) => (
                    <div key={i} className="rounded-[14px] p-4" style={{ backgroundColor: '#F7F3EF' }}>
                      <p className="text-[14px] font-semibold mb-1" style={{ color: '#1A1A1A' }}>{l.name}</p>
                      <div className="flex items-center gap-2 text-[12px] mb-2" style={{ color: '#888' }}>
                        <span>{l.terminal} · {l.floor} · {l.area}</span>
                      </div>
                      <div className="flex items-center gap-1.5 mb-1">
                        <Clock size={12} style={{ color: '#ABABAB' }} />
                        <span className="typo-caption">{l.hours}</span>
                      </div>
                      <p className="typo-body text-[12px] mt-2" style={{ color: '#888' }}>
                        {L(lang, l.access)}
                      </p>
                    </div>
                  ))}
                </>
              )}

              {commonLounges.length > 0 && (
                <>
                  <p className="typo-whisper mt-4">{L(lang, { ko: '공용 라운지', zh: '公共贵宾室', en: 'PUBLIC LOUNGE' })}</p>
                  {commonLounges.map((l, i) => (
                    <div key={i} className="rounded-[14px] border border-[#E5E7EB] p-4">
                      <p className="text-[14px] font-semibold mb-1" style={{ color: '#1A1A1A' }}>{l.name}</p>
                      <div className="flex items-center gap-2 text-[12px] mb-2" style={{ color: '#888' }}>
                        <span>{l.floor} · {l.area}</span>
                      </div>
                      <div className="flex items-center gap-1.5 mb-1">
                        <Clock size={12} style={{ color: '#ABABAB' }} />
                        <span className="typo-caption">{l.hours}</span>
                      </div>
                      <p className="typo-body text-[12px] mt-2" style={{ color: '#888' }}>
                        {L(lang, l.access)}
                      </p>
                    </div>
                  ))}
                </>
              )}

              {allLounges.length === 0 && (
                <div className="text-center py-10">
                  <Armchair size={32} style={{ color: '#D4D4D4' }} className="mx-auto mb-2" />
                  <p className="typo-body">{L(lang, { ko: '해당 터미널에 등록된 라운지 정보가 없습니다', zh: '该航站楼暂无贵宾室信息', en: 'No lounge info for this terminal' })}</p>
                </div>
              )}
            </div>
          )}

          {/* Promo Tab */}
          {activeTab === 'promo' && (
            <div className="space-y-3">
              {(result.airline?.promos || []).length > 0 ? (
                result.airline.promos.map((p, i) => (
                  <div key={i} className="rounded-[14px] p-4" style={{ backgroundColor: '#F7F3EF' }}>
                    <div className="flex items-center gap-2 mb-1">
                      <Tag size={14} style={{ color: 'var(--near-accent)' }} />
                      <p className="text-[14px] font-semibold" style={{ color: '#1A1A1A' }}>{L(lang, p.title)}</p>
                      {p.badge && <span className="text-[9px] font-bold text-white bg-[#DC2626] px-1.5 py-0.5 rounded-full">{p.badge}</span>}
                    </div>
                    <p className="typo-body text-[12px] mt-1" style={{ color: '#888' }}>{L(lang, p.detail)}</p>
                  </div>
                ))
              ) : (
                <div className="text-center py-10">
                  <Tag size={32} style={{ color: '#D4D4D4' }} className="mx-auto mb-2" />
                  <p className="typo-body">{L(lang, { ko: '현재 진행 중인 프로모션이 없습니다', zh: '目前没有进行中的促销', en: 'No active promotions' })}</p>
                </div>
              )}
            </div>
          )}

          {/* Share Button — Fixed Bottom */}
          <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-[#F0F0F0] z-10">
            <button
              onClick={handleShare}
              className="w-full py-3.5 rounded-[12px] text-[14px] font-semibold text-white flex items-center justify-center gap-2 active:scale-[0.98] transition-transform"
              style={{ backgroundColor: '#1A1A1A' }}
            >
              <Share2 size={16} />
              {copied
                ? L(lang, { ko: '복사됨!', zh: '已复制！', en: 'Copied!' })
                : L(lang, { ko: '일정으로 공유하기', zh: '分享到日程', en: 'Share as Itinerary' })
              }
            </button>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!result && (
        <div className="flex flex-col items-center justify-center pt-20 px-5">
          <Plane size={48} style={{ color: '#D4D4D4' }} className="mb-4" />
          <p className="typo-title text-center mb-2">
            {L(lang, { ko: '항공편 번호를 입력하세요', zh: '请输入航班号', en: 'Enter a flight number' })}
          </p>
          <p className="typo-body text-center leading-relaxed">
            {L(lang, {
              ko: '항공사 정보, 인천공항 라운지,\n프로모션을 한눈에 확인할 수 있어요',
              zh: '一站式查看航空公司信息、\n仁川机场贵宾室、促销活动',
              en: 'View airline info, ICN lounges,\nand promotions at a glance',
            })}
          </p>
          <div className="flex flex-wrap justify-center gap-2 mt-6">
            {['KE831', 'OZ321', '7C123', 'MU5012', 'CA162'].map(ex => (
              <button
                key={ex}
                onClick={() => { setInput(ex); }}
                className="px-3 py-1.5 rounded-full text-[12px] font-medium bg-[#F3F4F6] active:bg-[#E5E7EB] transition-colors"
                style={{ color: '#666' }}
              >
                {ex}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
