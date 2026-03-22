/**
 * 출국 체크리스트 + 공항 혼잡도
 * - 항공편 조회/카운트다운/타임라인 제거 (API 미구현)
 * - 체크리스트 localStorage 유지
 */
import { useState, useEffect } from 'react'
import { CheckCircle2, Circle, Users, RotateCcw, RefreshCw } from 'lucide-react'
import { fetchDepartureCongestion } from '../api/flightApi'

function L(lang, d) {
  if (typeof d === 'string') return d
  return d?.[lang] || d?.en || d?.zh || d?.ko || ''
}

const CHECKLIST_ITEMS = [
  { id: 'passport',  label: { ko: '여권 확인',                  zh: '确认护照',          en: 'Check passport'            } },
  { id: 'baggage',   label: { ko: '수하물 무게 확인',            zh: '确认行李重量',      en: 'Check baggage weight'      } },
  { id: 'charger',   label: { ko: '충전기 / 보조배터리',         zh: '充电器/充电宝',     en: 'Charger / power bank'      } },
  { id: 'boarding',  label: { ko: '탑승권 확인 (모바일/출력)',   zh: '确认登机牌',        en: 'Boarding pass'             } },
  { id: 'taxrefund', label: { ko: '세금환급 서류 준비',          zh: '准备退税材料',      en: 'Tax refund docs'           } },
  { id: 'krw',       label: { ko: '남은 원화 사용 계획',         zh: '剩余韩元使用计划',  en: 'Plan for remaining KRW'   } },
  { id: 'address',   label: { ko: '한국 숙소 주소 메모',         zh: '记录韩国住址',      en: 'Note Korea address'        } },
]

const STORAGE_KEY = 'hp_departure_checklist'

function loadChecklist() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY))
    if (Array.isArray(saved)) return saved
  } catch {}
  return CHECKLIST_ITEMS.map(i => ({ ...i, checked: false }))
}

const TEXTS = {
  title:      { ko: '출국 체크리스트',  zh: '出境清单',    en: 'Departure Checklist' },
  reset:      { ko: '초기화',           zh: '重置',        en: 'Reset'               },
  congestion: { ko: '출국장 혼잡도',    zh: '出境大厅拥挤度', en: 'Departure Congestion' },
  waiting:    { ko: '명 대기',          zh: '人等待',      en: ' waiting'            },
  waitTime:   { ko: '분',              zh: '分钟',        en: 'min'                 },
  loading:    { ko: '조회 중...',       zh: '查询中...',   en: 'Loading...'          },
  noData:     { ko: '데이터 없음',      zh: '暂无数据',    en: 'No data'             },
  doneAll:    { ko: '모두 완료! 좋은 여행 되세요 ✈️', zh: '全部完成！祝您旅途愉快 ✈️', en: 'All done! Have a great trip ✈️' },
}

// 대기시간(분) → 혼잡도 색상
function congestionColor(minutes) {
  if (minutes <= 5)  return { bar: '#10B981', text: '#065F46' } // 초록: 5분 이하
  if (minutes <= 15) return { bar: '#F59E0B', text: '#92400E' } // 노랑: 15분 이하
  if (minutes <= 30) return { bar: '#F97316', text: '#9A3412' } // 주황: 30분 이하
  return                    { bar: '#EF4444', text: '#991B1B' } // 빨강: 30분 초과
}

export default function DepartureCountdown({ lang }) {
  const [checklist, setChecklist] = useState(loadChecklist)
  const [congestion, setCongestion] = useState(null)
  const [congLoading, setCongLoading] = useState(false)
  const [termTab, setTermTab] = useState('T1')

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(checklist))
  }, [checklist])

  async function loadCongestion() {
    setCongLoading(true)
    const data = await fetchDepartureCongestion()
    setCongestion(data)
    setCongLoading(false)
  }

  useEffect(() => { loadCongestion() }, [])

  function toggle(id) {
    setChecklist(prev => prev.map(item => item.id === id ? { ...item, checked: !item.checked } : item))
  }

  function reset() {
    const fresh = CHECKLIST_ITEMS.map(i => ({ ...i, checked: false }))
    setChecklist(fresh)
  }

  const doneCount = checklist.filter(i => i.checked).length
  const allDone = doneCount === checklist.length

  return (
    <div className="pb-6">

      {/* 체크리스트 */}
      <div className="mx-4 mt-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-[15px] font-bold text-[#111827]">{L(lang, TEXTS.title)}</h2>
          <div className="flex items-center gap-3">
            <span className="text-xs text-[#9CA3AF]">{doneCount}/{checklist.length}</span>
            <button onClick={reset} className="text-xs text-[#9CA3AF] flex items-center gap-1">
              <RotateCcw size={11} />
              {L(lang, TEXTS.reset)}
            </button>
          </div>
        </div>

        {/* 진행 바 */}
        <div className="w-full h-1.5 bg-[#F3F4F6] rounded-full mb-4 overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-300"
            style={{ width: `${(doneCount / checklist.length) * 100}%`, background: allDone ? '#10B981' : '#111827' }}
          />
        </div>

        <div className="space-y-2">
          {checklist.map(item => (
            <button
              key={item.id}
              onClick={() => toggle(item.id)}
              className="w-full flex items-center gap-3 p-3 rounded-xl border text-left transition-colors"
              style={{ borderColor: item.checked ? '#D1FAE5' : '#E5E7EB', background: item.checked ? '#F0FDF4' : 'white' }}
            >
              {item.checked
                ? <CheckCircle2 size={20} className="text-emerald-500 shrink-0" />
                : <Circle size={20} className="text-[#D1D5DB] shrink-0" />
              }
              <span className={`text-sm ${item.checked ? 'line-through text-[#9CA3AF]' : 'text-[#111827]'}`}>
                {L(lang, item.label)}
              </span>
            </button>
          ))}
        </div>

        {allDone && (
          <div className="mt-4 p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-center">
            <p className="text-sm font-medium text-emerald-700">{L(lang, TEXTS.doneAll)}</p>
          </div>
        )}
      </div>

      {/* 출국장 혼잡도 */}
      <div className="mx-4 mt-6">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Users size={14} className="text-[#6B7280]" />
            <h3 className="text-[13px] font-bold text-[#111827]">{L(lang, TEXTS.congestion)}</h3>
            {congestion?.updatedAt && (
              <span className="text-[10px] text-[#9CA3AF]">{congestion.updatedAt.slice(8,10)}:{congestion.updatedAt.slice(10,12)}</span>
            )}
          </div>
          <button onClick={loadCongestion} className="p-1">
            <RefreshCw size={13} className={`text-[#9CA3AF] ${congLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {congLoading ? (
          <p className="text-xs text-[#9CA3AF] text-center py-4">{L(lang, TEXTS.loading)}</p>
        ) : !congestion ? (
          <p className="text-xs text-[#9CA3AF] text-center py-4">{L(lang, TEXTS.noData)}</p>
        ) : (
          <>
            {/* T1 / T2 탭 */}
            <div className="flex gap-2 mb-3">
              {['T1', 'T2'].map(t => (
                <button key={t} onClick={() => setTermTab(t)}
                  className="px-4 py-1.5 rounded-full text-xs font-semibold transition-colors"
                  style={{ background: termTab === t ? '#111827' : '#F3F4F6', color: termTab === t ? 'white' : '#6B7280' }}>
                  {t}
                </button>
              ))}
            </div>

            {/* 구역별 막대 */}
            <div className="space-y-2">
              {(congestion[termTab] || []).length === 0 ? (
                <p className="text-xs text-[#9CA3AF] text-center py-3">{L(lang, TEXTS.noData)}</p>
              ) : (
                (congestion[termTab] || [])
                  .sort((a, b) => {
                    const n = parseInt(a.zone) - parseInt(b.zone)
                    return n !== 0 ? n : (a.area || '').localeCompare(b.area || '')
                  })
                  .map((z, i) => {
                    const c = congestionColor(z.waitTime) // 대기시간(분) 기준으로 색상
                    const maxTime = Math.max(...(congestion[termTab].map(x => x.waitTime)), 1)
                    return (
                      <div key={i} className="flex items-center gap-2">
                        <span className="text-[11px] text-[#6B7280] w-12 shrink-0 font-medium">
                          {z.zone}번 {z.area}
                        </span>
                        <div className="flex-1 h-4 bg-[#F3F4F6] rounded-full overflow-hidden">
                          <div className="h-full rounded-full transition-all duration-500"
                            style={{ width: `${Math.max((z.waitTime / maxTime) * 100, 3)}%`, background: c.bar }} />
                        </div>
                        <span className="text-[11px] font-semibold w-14 text-right shrink-0" style={{ color: c.text }}>
                          {z.waitTime}{L(lang, TEXTS.waitTime)} / {z.waiting}{L(lang, TEXTS.waiting)}
                        </span>
                      </div>
                    )
                  })
              )}
            </div>
          </>
        )}
      </div>

    </div>
  )
}
