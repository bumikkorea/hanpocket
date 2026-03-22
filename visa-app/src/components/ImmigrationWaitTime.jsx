import { useState, useEffect } from 'react'
import { Clock, Users, User, RefreshCw } from 'lucide-react'
import { fetchArrivalCongestion, getCongestionLevel } from '../api/immigrationApi'

function L(lang, d) {
  if (typeof d === 'string') return d
  return d?.[lang] || d?.en || d?.zh || d?.ko || ''
}

const TEXTS = {
  title:    { ko: '입국장 혼잡도',      zh: '入境大厅拥挤度',     en: '입국장 혼잡도' },
  foreigner:{ ko: '외국인',            zh: '外国人',            en: '외국인' },
  korean:   { ko: '내국인',            zh: '韩国人',            en: '내국인' },
  people:   { ko: '명',               zh: '人',               en: '명' },
  updated:  { ko: '업데이트',           zh: '更新时间',           en: '업데이트' },
  low:      { ko: '원활',             zh: '顺畅',              en: '원활' },
  medium:   { ko: '보통',             zh: '一般',              en: '보통' },
  high:     { ko: '혼잡',             zh: '拥挤',              en: '혼잡' },
  noData:   { ko: '실시간 데이터 준비 중', zh: '实时数据准备中',    en: '실시간 데이터 준비 중' },
  noDataSub:{ ko: '인천공항 API 연동 후 표시됩니다', zh: '接入仁川机场API后显示', en: '인천공항 API 연동 후 표시됩니다' },
}

const LEVEL_COLORS = {
  low:    { bg: '#F0FDF4', text: '#16A34A', bar: '#22C55E', border: '#BBF7D0' },
  medium: { bg: '#FFFBEB', text: '#D97706', bar: '#F59E0B', border: '#FDE68A' },
  high:   { bg: '#FEF2F2', text: '#DC2626', bar: '#EF4444', border: '#FECACA' },
}

function CongestionCard({ lang, label, count, Icon }) {
  const level = getCongestionLevel(count)
  const c = LEVEL_COLORS[level]
  const maxCount = 500
  return (
    <div style={{ borderRadius: 12, padding: '14px 16px', background: c.bg, border: `1px solid ${c.border}` }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <Icon size={15} color={c.text} />
          <span style={{ fontSize: 13, fontWeight: 500, color: c.text }}>{L(lang, label)}</span>
        </div>
        <span style={{ fontSize: 11, fontWeight: 600, color: c.text, background: 'rgba(255,255,255,0.6)', borderRadius: 20, padding: '2px 8px' }}>
          {L(lang, TEXTS[level])}
        </span>
      </div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginBottom: 8 }}>
        <span style={{ fontSize: 30, fontWeight: 300, color: c.text }}>{count.toLocaleString()}</span>
        <span style={{ fontSize: 12, color: c.text, opacity: 0.7 }}>{L(lang, TEXTS.people)}</span>
      </div>
      <div style={{ height: 4, background: 'rgba(255,255,255,0.6)', borderRadius: 4, overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${Math.min(100, (count / maxCount) * 100)}%`, background: c.bar, borderRadius: 4, transition: 'width 0.5s' }} />
      </div>
    </div>
  )
}

export default function ImmigrationWaitTime({ lang }) {
  const [terminal, setTerminal] = useState('T1')
  const [data, setData] = useState({ T1: null, T2: null })
  const [loading, setLoading] = useState(true)
  const hasApiKey = !!import.meta.env.VITE_AIRPORT_API_KEY

  async function load() {
    setLoading(true)
    const [t1, t2] = await Promise.all([
      fetchArrivalCongestion('T1'),
      fetchArrivalCongestion('T2'),
    ])
    setData({ T1: t1, T2: t2 })
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const current = data[terminal]
  const updated = current?.lastUpdated
    ? new Date(current.lastUpdated).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : null

  return (
    <div style={{ background: 'white', borderRadius: 16, border: '1px solid #E5E7EB', overflow: 'hidden' }}>
      <div style={{ padding: '16px 20px 12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Clock size={17} color="#111827" />
          <span style={{ fontSize: 15, fontWeight: 600, color: '#111827' }}>{L(lang, TEXTS.title)}</span>
        </div>
        {hasApiKey && (
          <button onClick={load} style={{ padding: 6, borderRadius: 8, background: 'none', border: 'none', cursor: 'pointer' }}>
            <RefreshCw size={13} color="#9CA3AF" />
          </button>
        )}
      </div>

      {!hasApiKey ? (
        <div style={{ padding: '20px 20px 24px', textAlign: 'center' }}>
          <div style={{ fontSize: 32, marginBottom: 8 }}>🚧</div>
          <div style={{ fontSize: 14, fontWeight: 600, color: '#374151', marginBottom: 4 }}>{L(lang, TEXTS.noData)}</div>
          <div style={{ fontSize: 12, color: '#9CA3AF' }}>{L(lang, TEXTS.noDataSub)}</div>
        </div>
      ) : (
        <>
          <div style={{ padding: '0 20px 12px', display: 'flex', gap: 8 }}>
            {['T1', 'T2'].map(t => (
              <button key={t} onClick={() => setTerminal(t)}
                style={{ padding: '6px 16px', borderRadius: 20, fontSize: 13, fontWeight: 500, border: 'none', cursor: 'pointer', background: terminal === t ? '#111827' : '#F3F4F6', color: terminal === t ? 'white' : '#6B7280' }}>
                {t}
              </button>
            ))}
          </div>

          <div style={{ padding: '0 20px 16px', display: 'flex', flexDirection: 'column', gap: 8 }}>
            {loading || !current ? (
              <div style={{ padding: '24px 0', textAlign: 'center', color: '#9CA3AF', fontSize: 13 }}>준비 중...</div>
            ) : (
              <>
                <CongestionCard lang={lang} label={TEXTS.foreigner} count={current.foreigner} Icon={Users} />
                <CongestionCard lang={lang} label={TEXTS.korean} count={current.korean} Icon={User} />
              </>
            )}
          </div>

          {updated && (
            <div style={{ padding: '0 20px 12px', fontSize: 11, color: '#9CA3AF' }}>
              {L(lang, TEXTS.updated)}: {updated}
            </div>
          )}
        </>
      )}
    </div>
  )
}
