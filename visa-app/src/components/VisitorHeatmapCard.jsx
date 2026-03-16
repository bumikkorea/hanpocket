import { useState, useEffect } from 'react'
import { Users, TrendingUp, TrendingDown, Minus, ChevronRight } from 'lucide-react'
import { getTopSpots, getAllNationalities } from '../api/visitorStatsApi'

function L(lang, d) {
  if (typeof d === 'string') return d
  return d?.[lang] || d?.en || d?.zh || d?.ko || ''
}

const TEXTS = {
  title: { ko: '지금 한국에 있는 여행자', zh: '现在在韩国的旅行者', en: 'Travelers in Korea Now', ja: '今韓国にいる旅行者' },
  topSpots: { ko: '인기 장소 TOP 5', zh: '热门地点 TOP 5', en: 'Top 5 Spots', ja: '人気スポット TOP 5' },
  monthlyVisitors: { ko: '월간 방문자', zh: '月访客数', en: 'Monthly visitors', ja: '月間訪問者' },
  basedOnData: { ko: '한국관광공사 최근 통계 기준', zh: '基于韩国旅游发展局近期统计', en: 'Based on recent KTO statistics', ja: '韓国観光公社の最新統計に基づく' },
  seeAll: { ko: '전체 보기', zh: '查看全部', en: 'See all', ja: 'すべて見る' },
  visitors: { ko: '명', zh: '人', en: '', ja: '人' },
}

const TREND_ICONS = {
  up: { icon: TrendingUp, color: 'text-emerald-500' },
  down: { icon: TrendingDown, color: 'text-red-400' },
  stable: { icon: Minus, color: 'text-gray-400' },
}

export default function VisitorHeatmapCard({ lang, onExpand }) {
  const [nationality, setNationality] = useState('CN')
  const [data, setData] = useState(null)
  const [nationalities, setNationalities] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setNationalities(getAllNationalities())
  }, [])

  useEffect(() => {
    setLoading(true)
    getTopSpots(nationality, 5).then(d => {
      setData(d)
      setLoading(false)
    })
  }, [nationality])

  const maxCount = data?.spots?.[0]?.count || 1

  return (
    <div className="bg-white rounded-2xl border border-[#E5E7EB] overflow-hidden">
      {/* Header */}
      <div className="px-5 pt-5 pb-3">
        <div className="flex items-center gap-2 mb-1">
          <Users size={16} className="text-[#111827]" />
          <h3 className="text-sm font-bold text-[#111827]">{L(lang, TEXTS.title)}</h3>
        </div>
        <p className="text-[11px] text-[#9CA3AF]">{L(lang, TEXTS.basedOnData)}</p>
      </div>

      {/* Nationality filter */}
      <div className="px-5 pb-3 flex gap-1.5 overflow-x-auto no-scrollbar">
        {nationalities.map(n => (
          <button
            key={n.code}
            onClick={() => setNationality(n.code)}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
              nationality === n.code
                ? 'bg-[#111827] text-white'
                : 'bg-[#F3F4F6] text-[#6B7280]'
            }`}
          >
            {n.flag} {L(lang, n.name)}
          </button>
        ))}
      </div>

      {/* Stats */}
      {loading ? (
        <div className="px-5 py-8 text-center text-[#9CA3AF] text-sm">Loading...</div>
      ) : data && (
        <>
          {/* Monthly total */}
          <div className="px-5 pb-3">
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-light text-[#111827]">{(data.totalMonthly / 10000).toFixed(1)}</span>
              <span className="text-xs text-[#6B7280]">万{L(lang, TEXTS.visitors)} / {L(lang, TEXTS.monthlyVisitors)}</span>
            </div>
          </div>

          {/* Top 5 bar chart */}
          <div className="px-5 pb-4">
            <p className="text-xs font-medium text-[#374151] mb-3">{L(lang, TEXTS.topSpots)}</p>
            <div className="space-y-2.5">
              {data.spots.map((spot, i) => {
                const TrendIcon = TREND_ICONS[spot.trend]?.icon || Minus
                const trendColor = TREND_ICONS[spot.trend]?.color || 'text-gray-400'
                const barWidth = Math.max(8, (spot.count / maxCount) * 100)

                return (
                  <div key={spot.region} className="flex items-center gap-3">
                    <span className="text-xs font-bold text-[#9CA3AF] w-4 text-right">{i + 1}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-medium text-[#111827] truncate">{L(lang, spot.name)}</span>
                        <div className="flex items-center gap-1 shrink-0">
                          <TrendIcon size={12} className={trendColor} />
                          <span className="text-[11px] text-[#6B7280]">{(spot.count / 1000).toFixed(1)}K</span>
                        </div>
                      </div>
                      <div className="w-full h-1.5 bg-[#F3F4F6] rounded-full overflow-hidden">
                        <div
                          className="h-full bg-[#111827] rounded-full transition-all duration-500"
                          style={{ width: `${barWidth}%` }}
                        />
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Expand button */}
          {onExpand && (
            <button
              onClick={onExpand}
              className="w-full flex items-center justify-center gap-1 py-3 border-t border-[#E5E7EB] text-xs text-[#6B7280] hover:bg-[#F9FAFB] transition-colors"
            >
              {L(lang, TEXTS.seeAll)}
              <ChevronRight size={14} />
            </button>
          )}
        </>
      )}
    </div>
  )
}
