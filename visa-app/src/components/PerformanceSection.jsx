/**
 * PerformanceSection — KOPIS 공연/전시 섹션
 * 한류탭 등에서 사용
 */
import { useState, useEffect, useCallback } from 'react'
import { Loader2, Calendar, MapPin, Clock, Users, Ticket, X, ChevronRight, Music, Theater } from 'lucide-react'
import { fetchPerformances, fetchPerformanceDetail, GENRE_CODES } from '../api/kopisApi'

function L(lang, d) { if (typeof d === 'string') return d; return d?.[lang] || d?.en || d?.zh || d?.ko || '' }

const FILTER_GENRES = [
  { code: null, label: { ko: '전체', zh: '全部', en: 'All' } },
  { code: 'BBBC', label: { ko: '뮤지컬', zh: '音乐剧', en: 'Musical' } },
  { code: 'AAAA', label: { ko: '연극', zh: '话剧', en: 'Theater' } },
  { code: 'CCCA', label: { ko: '클래식', zh: '古典音乐', en: 'Classical' } },
  { code: 'EEEA', label: { ko: '대중음악', zh: '流行音乐', en: 'Pop Music' } },
]

const TEXTS = {
  title: { ko: '공연·전시', zh: '演出·展览', en: 'Performances' },
  noData: { ko: '공연 정보가 없습니다', zh: '暂无演出信息', en: 'No performances found' },
  performing: { ko: '공연중', zh: '演出中', en: 'Now Playing' },
  upcoming: { ko: '공연예정', zh: '即将上演', en: 'Upcoming' },
  ended: { ko: '공연종료', zh: '已结束', en: 'Ended' },
  detail: { ko: '공연 상세', zh: '演出详情', en: 'Details' },
  synopsis: { ko: '줄거리', zh: '剧情简介', en: 'Synopsis' },
  cast: { ko: '출연진', zh: '演员阵容', en: 'Cast' },
  price: { ko: '가격', zh: '票价', en: 'Price' },
  runtime: { ko: '공연시간', zh: '演出时长', en: 'Runtime' },
  schedule: { ko: '공연일정', zh: '演出日程', en: 'Schedule' },
  age: { ko: '관람연령', zh: '观演年龄', en: 'Age' },
  buyTicket: { ko: '티켓 구매', zh: '购票', en: 'Buy Tickets' },
  interpark: { ko: '인터파크 티켓', zh: 'Interpark购票', en: 'Interpark Tickets' },
  yes24: { ko: 'YES24 티켓', zh: 'YES24购票', en: 'YES24 Tickets' },
  loading: { ko: '준비 중...', zh: '准备中...', en: '준비 중...' },
  openrun: { ko: '오픈런', zh: '长期公演', en: 'Open Run' },
  viewAll: { ko: '전체보기', zh: '查看全部', en: 'View All' },
}

function getStateStyle(state) {
  if (state === '공연중') return 'bg-green-100 text-green-700'
  if (state === '공연예정') return 'bg-blue-100 text-blue-700'
  return 'bg-gray-100 text-gray-500'
}

function getStateLabel(state, lang) {
  if (state === '공연중') return L(lang, TEXTS.performing)
  if (state === '공연예정') return L(lang, TEXTS.upcoming)
  return L(lang, TEXTS.ended)
}

function getGenreLabel(genrenm, lang) {
  const entry = Object.entries(GENRE_CODES).find(([, v]) => v.ko === genrenm)
  if (entry) return L(lang, entry[1])
  return genrenm
}

/** 공연 카드 */
function PerformanceCard({ item, lang, onClick }) {
  return (
    <div
      onClick={() => onClick?.(item)}
      className="border border-[#E5E7EB] rounded-[8px] overflow-hidden cursor-pointer transition-transform active:scale-[0.98] bg-white"
    >
      {item.poster ? (
        <img
          src={item.poster}
          alt={item.prfnm}
          className="w-full h-48 object-cover"
          loading="lazy"
          onError={(e) => {
            e.target.style.display = 'none'
            e.target.nextSibling && (e.target.nextSibling.style.display = 'flex')
          }}
        />
      ) : null}
      <div className={`w-full h-48 items-center justify-center bg-gray-50 ${item.poster ? 'hidden' : 'flex'}`}>
        <Music size={28} className="text-gray-300" />
      </div>
      <div className="p-3">
        <h3 className="font-semibold text-[14px] leading-tight line-clamp-2 text-black">{item.prfnm}</h3>
        <p className="text-[12px] text-gray-500 mt-1.5 flex items-center gap-1">
          <Calendar size={11} />
          {item.prfpdfrom} ~ {item.prfpdto}
        </p>
        <p className="text-[12px] text-gray-500 mt-0.5 flex items-center gap-1 line-clamp-1">
          <MapPin size={11} />
          {item.fcltynm}
        </p>
        <div className="flex items-center gap-1.5 mt-2">
          <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${getStateStyle(item.prfstate)}`}>
            {getStateLabel(item.prfstate, lang)}
          </span>
          <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-gray-100 text-gray-600 font-medium">
            {getGenreLabel(item.genrenm, lang)}
          </span>
          {item.openrun === 'Y' && (
            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-purple-100 text-purple-600 font-medium">
              {L(lang, TEXTS.openrun)}
            </span>
          )}
        </div>
      </div>
    </div>
  )
}

/** 상세 모달 */
function DetailModal({ item, lang, onClose }) {
  const [detail, setDetail] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!item) return
    setLoading(true)
    fetchPerformanceDetail(item.mt20id).then(d => {
      setDetail(d)
      setLoading(false)
    })
  }, [item?.mt20id])

  if (!item) return null

  const d = detail || item
  const interparkUrl = `https://tickets.interpark.com/search?keyword=${encodeURIComponent(d.prfnm)}`
  const yes24Url = `https://ticket.yes24.com/Search?query=${encodeURIComponent(d.prfnm)}`

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center" onClick={onClose}>
      <div className="absolute inset-0 bg-black/40" />
      <div
        className="relative bg-white w-full max-w-lg max-h-[85vh] rounded-t-2xl sm:rounded-2xl overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        {/* 헤더 */}
        <div className="sticky top-0 bg-white z-10 flex items-center justify-between px-4 py-3 border-b border-gray-100">
          <h2 className="font-semibold text-[16px] text-black">{L(lang, TEXTS.detail)}</h2>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-100">
            <X size={20} />
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 size={24} className="animate-spin text-gray-400" />
          </div>
        ) : (
          <div className="p-4">
            {/* 포스터 + 기본정보 */}
            <div className="flex gap-4">
              {d.poster ? (
                <img
                  src={d.poster}
                  alt={d.prfnm}
                  className="w-28 h-40 object-cover rounded-lg flex-shrink-0"
                  onError={(e) => { e.target.style.display = 'none' }}
                />
              ) : (
                <div className="w-28 h-40 bg-gray-50 rounded-lg flex-shrink-0 flex items-center justify-center">
                  <Music size={24} className="text-gray-300" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-[16px] leading-tight text-black">{d.prfnm}</h3>
                <div className="flex items-center gap-1.5 mt-2">
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${getStateStyle(d.prfstate)}`}>
                    {getStateLabel(d.prfstate, lang)}
                  </span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-gray-100 text-gray-600 font-medium">
                    {getGenreLabel(d.genrenm, lang)}
                  </span>
                </div>
                <div className="mt-3 space-y-1.5 text-[12px] text-gray-600">
                  <p className="flex items-center gap-1.5"><Calendar size={12} /> {d.prfpdfrom} ~ {d.prfpdto}</p>
                  <p className="flex items-center gap-1.5"><MapPin size={12} /> {d.fcltynm}</p>
                  {d.prfruntime && <p className="flex items-center gap-1.5"><Clock size={12} /> {d.prfruntime}</p>}
                  {d.prfage && <p className="flex items-center gap-1.5"><Users size={12} /> {d.prfage}</p>}
                </div>
              </div>
            </div>

            {/* 가격 */}
            {d.pcseguidance && (
              <div className="mt-5">
                <h4 className="font-semibold text-[13px] text-black mb-1.5">{L(lang, TEXTS.price)}</h4>
                <p className="text-[12px] text-gray-600 whitespace-pre-line">{d.pcseguidance}</p>
              </div>
            )}

            {/* 공연일정 */}
            {d.dtguidance && (
              <div className="mt-4">
                <h4 className="font-semibold text-[13px] text-black mb-1.5">{L(lang, TEXTS.schedule)}</h4>
                <p className="text-[12px] text-gray-600 whitespace-pre-line">{d.dtguidance}</p>
              </div>
            )}

            {/* 출연진 */}
            {d.prfcast && (
              <div className="mt-4">
                <h4 className="font-semibold text-[13px] text-black mb-1.5">{L(lang, TEXTS.cast)}</h4>
                <p className="text-[12px] text-gray-600">{d.prfcast}</p>
              </div>
            )}

            {/* 줄거리 */}
            {d.sty && (
              <div className="mt-4">
                <h4 className="font-semibold text-[13px] text-black mb-1.5">{L(lang, TEXTS.synopsis)}</h4>
                <p className="text-[12px] text-gray-600 whitespace-pre-line leading-relaxed">{d.sty}</p>
              </div>
            )}

            {/* 소개 이미지 */}
            {d.styurls?.length > 0 && (
              <div className="mt-4 space-y-2">
                {d.styurls.map((url, i) => (
                  <img
                    key={i}
                    src={url}
                    alt={`${d.prfnm} ${i + 1}`}
                    className="w-full rounded-lg"
                    loading="lazy"
                    onError={(e) => { e.target.style.display = 'none' }}
                  />
                ))}
              </div>
            )}

            {/* 티켓 구매 버튼 */}
            <div className="mt-6 space-y-2 pb-4">
              <h4 className="font-semibold text-[13px] text-black mb-2">{L(lang, TEXTS.buyTicket)}</h4>
              <a
                href={interparkUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full py-3 bg-black text-white rounded-[8px] text-[13px] font-medium active:opacity-80 transition"
              >
                <Ticket size={14} />
                {L(lang, TEXTS.interpark)}
              </a>
              <a
                href={yes24Url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full py-3 border border-[#E5E7EB] text-black rounded-[8px] text-[13px] font-medium active:opacity-80 transition"
              >
                <Ticket size={14} />
                {L(lang, TEXTS.yes24)}
              </a>

              {/* KOPIS 관련 사이트 링크 */}
              {d.relates?.length > 0 && d.relates.map((rel, i) => (
                <a
                  key={i}
                  href={rel.relateurl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 w-full py-3 border border-[#E5E7EB] text-gray-600 rounded-[8px] text-[13px] font-medium active:opacity-80 transition"
                >
                  <ChevronRight size={14} />
                  {rel.relatenm}
                </a>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default function PerformanceSection({ lang = 'ko' }) {
  const [performances, setPerformances] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedGenre, setSelectedGenre] = useState(null)
  const [selectedItem, setSelectedItem] = useState(null)

  const loadData = useCallback(async (genre) => {
    setLoading(true)
    const params = genre ? { shcate: genre } : {}
    const data = await fetchPerformances(params)
    setPerformances(data)
    setLoading(false)
  }, [])

  useEffect(() => {
    loadData(selectedGenre)
  }, [selectedGenre, loadData])

  const handleGenreChange = (code) => {
    setSelectedGenre(code)
  }

  return (
    <div className="mt-6">
      {/* 섹션 헤더 */}
      <div className="flex items-center justify-between mb-3">
        <h2 className="font-bold text-[18px] text-black">{L(lang, TEXTS.title)}</h2>
      </div>

      {/* 장르 필터 칩 */}
      <div className="flex gap-2 overflow-x-auto pb-3 scrollbar-hide">
        {FILTER_GENRES.map(g => (
          <button
            key={g.code || 'all'}
            onClick={() => handleGenreChange(g.code)}
            className={`px-3 py-1.5 rounded-full text-[12px] font-medium shrink-0 transition ${
              selectedGenre === g.code
                ? 'bg-black text-white'
                : 'bg-gray-100 text-gray-600'
            }`}
          >
            {L(lang, g.label)}
          </button>
        ))}
      </div>

      {/* 공연 카드 그리드 */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 size={24} className="animate-spin text-gray-400" />
          <span className="ml-2 text-[13px] text-gray-400">{L(lang, TEXTS.loading)}</span>
        </div>
      ) : performances.length === 0 ? (
        <div className="text-center py-16">
          <Theater size={32} className="mx-auto text-gray-300 mb-2" />
          <p className="text-[13px] text-gray-400">{L(lang, TEXTS.noData)}</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          {performances.map((item, i) => (
            <PerformanceCard
              key={item.mt20id || i}
              item={item}
              lang={lang}
              onClick={setSelectedItem}
            />
          ))}
        </div>
      )}

      {/* 상세 모달 */}
      {selectedItem && (
        <DetailModal
          item={selectedItem}
          lang={lang}
          onClose={() => setSelectedItem(null)}
        />
      )}
    </div>
  )
}
