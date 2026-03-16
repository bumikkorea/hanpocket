import { useState, useEffect } from 'react'
import { Clock, Users, User, AlertCircle, RefreshCw } from 'lucide-react'
import { fetchImmigrationWaitTime, getWaitLevel } from '../api/immigrationApi'

function L(lang, d) {
  if (typeof d === 'string') return d
  return d?.[lang] || d?.en || d?.zh || d?.ko || ''
}

const TEXTS = {
  title: { ko: '입국심사 대기시간', zh: '入境审查等候时间', en: 'Immigration Wait Time', ja: '入国審査待ち時間' },
  foreigner: { ko: '외국인', zh: '外国人', en: 'Foreigner', ja: '外国人' },
  korean: { ko: '내국인', zh: '韩国人', en: 'Korean', ja: '韓国人' },
  minutes: { ko: '분', zh: '分钟', en: 'min', ja: '分' },
  lastUpdated: { ko: '최근 업데이트', zh: '最后更新', en: 'Last updated', ja: '最終更新' },
  historical: { ko: '시간대별 평균 기준', zh: '基于历史时段平均值', en: 'Based on historical average', ja: '時間帯別平均に基づく' },
  low: { ko: '원활', zh: '顺畅', en: 'Smooth', ja: 'スムーズ' },
  medium: { ko: '보통', zh: '一般', en: 'Moderate', ja: '普通' },
  high: { ko: '혼잡', zh: '拥挤', en: 'Congested', ja: '混雑' },
  arriving: { ko: '곧 도착 예정이시군요!', zh: '即将到达！', en: 'Arriving soon!', ja: 'まもなく到着！' },
  refresh: { ko: '새로고침', zh: '刷新', en: 'Refresh', ja: '更新' },
}

const LEVEL_COLORS = {
  low: { bg: 'bg-emerald-50', text: 'text-emerald-700', bar: 'bg-emerald-500', border: 'border-emerald-200' },
  medium: { bg: 'bg-amber-50', text: 'text-amber-700', bar: 'bg-amber-500', border: 'border-amber-200' },
  high: { bg: 'bg-red-50', text: 'text-red-700', bar: 'bg-red-500', border: 'border-red-200' },
}

function WaitCard({ lang, label, minutes, icon: Icon }) {
  const level = getWaitLevel(minutes)
  const colors = LEVEL_COLORS[level]
  const maxMin = 90

  return (
    <div className={`rounded-xl p-4 ${colors.bg} ${colors.border} border`}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Icon size={16} className={colors.text} />
          <span className={`text-sm font-medium ${colors.text}`}>{L(lang, label)}</span>
        </div>
        <span className={`text-xs px-2 py-0.5 rounded-full ${colors.bg} ${colors.text} font-medium`}>
          {L(lang, TEXTS[level])}
        </span>
      </div>
      <div className="flex items-baseline gap-1 mb-2">
        <span className={`text-3xl font-light ${colors.text}`}>{minutes}</span>
        <span className={`text-sm ${colors.text} opacity-70`}>{L(lang, TEXTS.minutes)}</span>
      </div>
      <div className="w-full h-1.5 bg-white/60 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full ${colors.bar} transition-all duration-500`}
          style={{ width: `${Math.min(100, (minutes / maxMin) * 100)}%` }}
        />
      </div>
    </div>
  )
}

export default function ImmigrationWaitTime({ lang, scheduledLanding }) {
  const [terminal, setTerminal] = useState('T1')
  const [data, setData] = useState({ T1: null, T2: null })
  const [loading, setLoading] = useState(true)

  const isArrivingSoon = scheduledLanding && (() => {
    const landing = new Date(scheduledLanding)
    const now = new Date()
    const diff = (landing - now) / (1000 * 60)
    return diff > 0 && diff <= 120
  })()

  async function loadData() {
    setLoading(true)
    try {
      const [t1, t2] = await Promise.all([
        fetchImmigrationWaitTime('T1'),
        fetchImmigrationWaitTime('T2'),
      ])
      setData({ T1: t1, T2: t2 })
    } catch (e) {
      console.error('Failed to load immigration data:', e)
    }
    setLoading(false)
  }

  useEffect(() => { loadData() }, [])

  const current = data[terminal]
  const updated = current?.lastUpdated
    ? new Date(current.lastUpdated).toLocaleTimeString(lang === 'ko' ? 'ko-KR' : lang === 'zh' ? 'zh-CN' : lang === 'ja' ? 'ja-JP' : 'en-US', { hour: '2-digit', minute: '2-digit' })
    : '--:--'

  return (
    <div className={`bg-white rounded-2xl border ${isArrivingSoon ? 'border-blue-300 ring-2 ring-blue-100' : 'border-[#E5E7EB]'} overflow-hidden`}>
      {/* Header */}
      <div className="px-5 pt-5 pb-3">
        {isArrivingSoon && (
          <div className="flex items-center gap-2 text-blue-600 text-xs font-medium mb-2">
            <AlertCircle size={14} />
            <span>{L(lang, TEXTS.arriving)}</span>
          </div>
        )}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock size={18} className="text-[#111827]" />
            <h3 className="text-base font-semibold text-[#111827]">{L(lang, TEXTS.title)}</h3>
          </div>
          <button onClick={loadData} className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors" title={L(lang, TEXTS.refresh)}>
            <RefreshCw size={14} className={`text-[#9CA3AF] ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Terminal tabs */}
      <div className="px-5 flex gap-2 mb-4">
        {['T1', 'T2'].map(t => (
          <button
            key={t}
            onClick={() => setTerminal(t)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
              terminal === t
                ? 'bg-[#111827] text-white'
                : 'bg-[#F3F4F6] text-[#6B7280] hover:bg-[#E5E7EB]'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Wait time cards */}
      <div className="px-5 pb-4 space-y-3">
        {loading || !current ? (
          <div className="py-8 text-center text-[#9CA3AF] text-sm">Loading...</div>
        ) : (
          <>
            <WaitCard lang={lang} label={TEXTS.foreigner} minutes={current.foreigner.waitMinutes} icon={Users} />
            <WaitCard lang={lang} label={TEXTS.korean} minutes={current.korean.waitMinutes} icon={User} />
          </>
        )}
      </div>

      {/* Footer */}
      {current && (
        <div className="px-5 pb-4 flex items-center justify-between text-[11px] text-[#9CA3AF]">
          <span>{L(lang, TEXTS.lastUpdated)}: {updated}</span>
          {!current.realtime && (
            <span className="italic">{L(lang, TEXTS.historical)}</span>
          )}
        </div>
      )}
    </div>
  )
}
