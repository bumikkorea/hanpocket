/**
 * 출국 체크리스트 + 공항 혼잡도
 * - 항공편 조회/카운트다운/타임라인 제거 (API 미구현)
 * - 체크리스트 localStorage 유지
 */
import { useState, useEffect } from 'react'
import { CheckCircle2, Circle, Users, RotateCcw } from 'lucide-react'

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
  title:       { ko: '출국 체크리스트',     zh: '出境清单',       en: 'Departure Checklist'   },
  reset:       { ko: '초기화',              zh: '重置',           en: 'Reset'                 },
  congestion:  { ko: '공항 혼잡도',         zh: '机场拥挤度',     en: 'Airport Congestion'    },
  comingSoon:  { ko: '준비 중',             zh: '准备中',         en: 'Coming soon'           },
  doneAll:     { ko: '모두 완료! 좋은 여행 되세요 ✈️', zh: '全部完成！祝您旅途愉快 ✈️', en: 'All done! Have a great trip ✈️' },
}

export default function DepartureCountdown({ lang }) {
  const [checklist, setChecklist] = useState(loadChecklist)

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(checklist))
  }, [checklist])

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

      {/* 공항 혼잡도 — 추후 API 연동 */}
      <div className="mx-4 mt-6">
        <div className="flex items-center gap-2 mb-3">
          <Users size={14} className="text-[#6B7280]" />
          <h3 className="text-[13px] font-bold text-[#111827]">{L(lang, TEXTS.congestion)}</h3>
        </div>
        <div className="p-4 rounded-xl border border-dashed border-[#E5E7EB] text-center">
          <p className="text-xs text-[#9CA3AF]">{L(lang, TEXTS.comingSoon)}</p>
        </div>
      </div>

    </div>
  )
}
