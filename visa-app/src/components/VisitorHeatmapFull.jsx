import { useState, useEffect } from 'react'
import { Users, TrendingUp, TrendingDown, Minus, MapPin, Filter } from 'lucide-react'
import { getTopSpots, getNationalityBreakdown, getAllNationalities, VISITOR_DATA } from '../api/visitorStatsApi'

function L(lang, d) {
  if (typeof d === 'string') return d
  return d?.[lang] || d?.en || d?.zh || d?.ko || ''
}

const TEXTS = {
  title: { ko: '외국인 여행자 현황', zh: '外国旅客情况', en: 'Foreign Visitor Statistics', ja: '外国人旅行者の状況' },
  byNationality: { ko: '국적별', zh: '按国籍', en: 'By Nationality', ja: '国籍別' },
  byRegion: { ko: '지역별', zh: '按地区', en: 'By Region', ja: '地域別' },
  monthlyTotal: { ko: '월간 방문자', zh: '月访客', en: 'Monthly', ja: '月間' },
  topSpots: { ko: '인기 장소', zh: '热门地点', en: 'Top Spots', ja: '人気スポット' },
  dataNote: { ko: '한국관광공사 최근 통계 기준', zh: '基于韩国旅游发展局近期统计', en: 'Based on recent KTO tourism data', ja: '韓国観光公社の最新統計に基づく' },
  regionView: { ko: '이 지역에 방문하는 국적', zh: '访问该地区的国籍', en: 'Nationalities visiting this area', ja: 'この地域を訪れる国籍' },
}

const REGIONS = [
  { id: 'myeongdong', name: { ko: '명동', zh: '明洞', en: 'Myeongdong', ja: '明洞' } },
  { id: 'hongdae', name: { ko: '홍대', zh: '弘大', en: 'Hongdae', ja: 'ホンデ' } },
  { id: 'gangnam', name: { ko: '강남', zh: '江南', en: 'Gangnam', ja: 'カンナム' } },
  { id: 'itaewon', name: { ko: '이태원', zh: '梨泰院', en: 'Itaewon', ja: 'イテウォン' } },
  { id: 'dongdaemun', name: { ko: '동대문', zh: '东大门', en: 'Dongdaemun', ja: '東大門' } },
  { id: 'insadong', name: { ko: '인사동', zh: '仁寺洞', en: 'Insadong', ja: '仁寺洞' } },
  { id: 'jeju', name: { ko: '제주', zh: '济州', en: 'Jeju', ja: '済州' } },
  { id: 'busan', name: { ko: '부산', zh: '釜山', en: 'Busan', ja: '釜山' } },
]

const TREND_ICONS = {
  up: { icon: TrendingUp, color: 'text-emerald-500' },
  down: { icon: TrendingDown, color: 'text-red-400' },
  stable: { icon: Minus, color: 'text-gray-400' },
}

export default function VisitorHeatmapFull({ lang }) {
  const [tab, setTab] = useState('nationality')
  const [selectedNation, setSelectedNation] = useState('CN')
  const [selectedRegion, setSelectedRegion] = useState('myeongdong')
  const [nationData, setNationData] = useState(null)
  const [regionData, setRegionData] = useState([])
  const nationalities = getAllNationalities()

  useEffect(() => {
    getTopSpots(selectedNation, 8).then(setNationData)
  }, [selectedNation])

  useEffect(() => {
    getNationalityBreakdown(selectedRegion).then(setRegionData)
  }, [selectedRegion])

  return (
    <div className="space-y-4 pb-6">
      {/* Header */}
      <div className="text-center pt-2 pb-2">
        <h2 className="text-lg font-bold text-[#111827]">{L(lang, TEXTS.title)}</h2>
        <p className="text-[11px] text-[#9CA3AF] mt-1">{L(lang, TEXTS.dataNote)}</p>
      </div>

      {/* Tab toggle */}
      <div className="mx-4 flex bg-[#F3F4F6] rounded-lg p-1">
        {['nationality', 'region'].map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex-1 py-2 rounded-md text-xs font-medium transition-all ${
              tab === t ? 'bg-white text-[#111827] ' : 'text-[#6B7280]'
            }`}
          >
            {L(lang, t === 'nationality' ? TEXTS.byNationality : TEXTS.byRegion)}
          </button>
        ))}
      </div>

      {/* By Nationality view */}
      {tab === 'nationality' && (
        <>
          <div className="px-4 flex gap-1.5 overflow-x-auto no-scrollbar">
            {nationalities.map(n => (
              <button
                key={n.code}
                onClick={() => setSelectedNation(n.code)}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
                  selectedNation === n.code ? 'bg-[#111827] text-white' : 'bg-[#F3F4F6] text-[#6B7280]'
                }`}
              >
                {n.flag} {L(lang, n.name)}
              </button>
            ))}
          </div>

          {nationData && (
            <div className="mx-4 space-y-3">
              <div className="p-4 rounded-xl bg-[#F9FAFB] border border-[#E5E7EB]">
                <p className="text-xs text-[#6B7280] mb-1">{L(lang, TEXTS.monthlyTotal)}</p>
                <p className="text-2xl font-light text-[#111827]">{nationData.totalMonthly.toLocaleString()}</p>
              </div>

              <p className="text-xs font-semibold text-[#374151]">{L(lang, TEXTS.topSpots)}</p>
              {nationData.spots.map((spot, i) => {
                const TrendIcon = TREND_ICONS[spot.trend]?.icon || Minus
                const trendColor = TREND_ICONS[spot.trend]?.color || 'text-gray-400'
                return (
                  <div key={spot.region} className="flex items-center gap-3 p-3 rounded-lg bg-white border border-[#E5E7EB]">
                    <span className="text-sm font-bold text-[#9CA3AF] w-5 text-center">{i + 1}</span>
                    <MapPin size={14} className="text-[#6B7280]" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-[#111827]">{L(lang, spot.name)}</p>
                    </div>
                    <div className="flex items-center gap-1">
                      <TrendIcon size={12} className={trendColor} />
                      <span className="text-xs text-[#6B7280]">{spot.count.toLocaleString()}</span>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </>
      )}

      {/* By Region view */}
      {tab === 'region' && (
        <>
          <div className="px-4 flex gap-1.5 overflow-x-auto no-scrollbar">
            {REGIONS.map(r => (
              <button
                key={r.id}
                onClick={() => setSelectedRegion(r.id)}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
                  selectedRegion === r.id ? 'bg-[#111827] text-white' : 'bg-[#F3F4F6] text-[#6B7280]'
                }`}
              >
                {L(lang, r.name)}
              </button>
            ))}
          </div>

          <div className="mx-4 space-y-3">
            <p className="text-xs font-semibold text-[#374151]">{L(lang, TEXTS.regionView)}</p>
            {regionData.length === 0 ? (
              <p className="text-center text-xs text-[#9CA3AF] py-6">No data</p>
            ) : (
              regionData.map((item, i) => {
                const maxCount = regionData[0]?.count || 1
                const barWidth = Math.max(8, (item.count / maxCount) * 100)
                return (
                  <div key={item.nationality} className="p-3 rounded-lg bg-white border border-[#E5E7EB]">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">
                        {item.flag} {L(lang, item.name)}
                      </span>
                      <span className="text-xs text-[#6B7280]">{item.count.toLocaleString()}</span>
                    </div>
                    <div className="w-full h-1.5 bg-[#F3F4F6] rounded-full overflow-hidden">
                      <div className="h-full bg-[#111827] rounded-full" style={{ width: `${barWidth}%` }} />
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </>
      )}
    </div>
  )
}
