/**
 * TravelPlannerTab — 여행코스 타임테이블 (v2)
 * 풀스크린 오버레이: 우측에서 슬라이드 인
 * props: open, onClose, setSubPage, setTab
 */
import { useState, useEffect, useCallback, useRef } from 'react'
import { useLanguage } from '../i18n/index.jsx'
import { searchKeyword } from '../api/tourApi'

const STORAGE_KEY = 'near-travel-plan'

function L(lang, d) {
  if (typeof d === 'string') return d
  return d?.[lang] || d?.zh || d?.ko || d?.en || ''
}

// ─── 카테고리 ───
const CATEGORIES = [
  { id: 'cafe',        label: { ko: '카페',   zh: '咖啡',   en: 'Cafe'         } },
  { id: 'food',        label: { ko: '맛집',   zh: '美食',   en: 'Food'         } },
  { id: 'shopping',    label: { ko: '쇼핑',   zh: '购物',   en: 'Shopping'     } },
  { id: 'sightseeing', label: { ko: '관광',   zh: '景点',   en: 'Sightseeing'  } },
  { id: 'beauty',      label: { ko: '뷰티',   zh: '美容',   en: 'Beauty'       } },
]

// ─── 입국/출국 서비스 목록 ───
const ARRIVAL_ITEMS = [
  { id: 'arrival-card',  label: { ko: '입국신고서 작성법', zh: '入境申报卡填写', en: 'Arrival Card Guide'    }, sub: 'arrival-card'  },
  { id: 'sim-guide',     label: { ko: 'SIM카드 & 환전',   zh: 'SIM卡 & 换钱',   en: 'SIM & Exchange'       }, sub: 'sim-guide'     },
  { id: 'airport-seoul', label: { ko: '인천공항 → 서울',  zh: '仁川机场→首尔',   en: 'Airport → Seoul'      }, tab: 'travel'        },
  { id: 'transit-card',  label: { ko: '교통카드 안내',    zh: '交通卡指南',      en: 'Transit Card'         }, sub: 'transit-card'  },
  { id: 'currency',      label: { ko: '환율 계산기',      zh: '汇率计算器',      en: 'Currency Converter'   }, sub: 'currency'      },
  { id: 'etiquette',     label: { ko: '한국 에티켓',      zh: '韩国礼仪',        en: 'Korean Etiquette'     }, sub: 'etiquette'     },
  { id: 'price-guide',   label: { ko: '한국 물가 가이드', zh: '韩国物价指南',    en: 'Price Guide'          }, sub: 'price-guide'   },
]

const DEPARTURE_ITEMS = [
  { id: 'flight-board',  label: { ko: '출발 전광판',   zh: '出发航班',   en: 'Departures Board'  }, sub: 'flight-board' },
  { id: 'taxrefund',     label: { ko: '세금환급 안내', zh: '退税指南',   en: 'Tax Refund Guide'  }, sub: 'taxrefund'    },
  { id: 'tax-free',      label: { ko: '면세점 가이드', zh: '免税店指南', en: 'Duty-Free Guide'   }, sub: 'tax-free'     },
]

// ─── 날짜 유틸 ───
const DAY_NAMES_KO = ['일', '월', '화', '수', '목', '금', '토']
const DAY_NAMES_ZH = ['日', '一', '二', '三', '四', '五', '六']
const DAY_NAMES_EN = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

function dateToStr(d) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}
function strToDate(s) {
  const [y, m, d] = s.split('-').map(Number)
  return new Date(y, m - 1, d)
}
function formatDateLabel(s, lang) {
  const d = strToDate(s)
  const mo = d.getMonth() + 1
  const da = d.getDate()
  const w = d.getDay()
  if (lang === 'zh') return `${mo}月${da}日(${DAY_NAMES_ZH[w]})`
  if (lang === 'en') return `${mo}/${da}(${DAY_NAMES_EN[w]})`
  return `${mo}.${da}(${DAY_NAMES_KO[w]})`
}
function formatShortDate(s) {
  const [, m, d] = s.split('-').map(Number)
  return `${m}/${d}`
}
function getDayLabel(idx, total, lang) {
  if (idx === 0) return 'D-Day'
  if (idx === total - 1) return L(lang, { ko: '출국', zh: '出境', en: 'Depart' })
  return `Day${idx}`
}
function buildDaysList(arrival, departure) {
  const days = []
  const cur = strToDate(arrival)
  const end = strToDate(departure)
  while (cur <= end) {
    days.push(dateToStr(new Date(cur)))
    cur.setDate(cur.getDate() + 1)
  }
  return days
}
function getNightsLabel(arrival, departure, lang) {
  const a = strToDate(arrival)
  const d = strToDate(departure)
  const nights = Math.round((d - a) / 86400000)
  const days = nights + 1
  if (lang === 'zh') return `${nights}晚${days}天`
  if (lang === 'en') return `${nights}N ${days}D`
  return `${nights}박 ${days}일`
}

// ─── localStorage ───
function loadPlan() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null') } catch { return null }
}
function savePlan(plan) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(plan))
}

// 시스템 카드(입국/출국) 보장
function ensureSystemItems(plan) {
  const { arrivalDate, departureDate } = plan
  const next = { ...plan, days: { ...plan.days } }

  if (!next.days[arrivalDate]) next.days[arrivalDate] = { items: [] }
  const arrItems = next.days[arrivalDate].items
  if (!arrItems.find(i => i.id === 'auto-arrival')) {
    next.days[arrivalDate] = {
      ...next.days[arrivalDate],
      items: [
        { id: 'auto-arrival', type: 'system', subtype: 'arrival', title: { ko: '입국하기', zh: '入境', en: 'Arrival' }, time: null },
        ...arrItems.filter(i => i.id !== 'auto-arrival'),
      ],
    }
  }

  if (!next.days[departureDate]) next.days[departureDate] = { items: [] }
  const depItems = next.days[departureDate].items
  if (!depItems.find(i => i.id === 'auto-departure')) {
    next.days[departureDate] = {
      ...next.days[departureDate],
      items: [
        { id: 'auto-departure', type: 'system', subtype: 'departure', title: { ko: '출국하기', zh: '出境', en: 'Departure' }, time: null },
        ...depItems.filter(i => i.id !== 'auto-departure'),
      ],
    }
  }

  return next
}

// ─── Export: 여행 카드 미리보기용 데이터 훅 ───
export function useTravelPlan() {
  const [plan, setPlan] = useState(() => loadPlan())
  useEffect(() => {
    const handler = () => setPlan(loadPlan())
    window.addEventListener('storage', handler)
    return () => window.removeEventListener('storage', handler)
  }, [])
  return plan
}

// ─── 날짜 설정 화면 ───
function DateSetupScreen({ lang, onSave, onCancel }) {
  const [arrival, setArrival] = useState('')
  const [departure, setDeparture] = useState('')
  const canSave = arrival && departure && departure >= arrival

  const handleSave = () => {
    if (!canSave) return
    const daysList = buildDaysList(arrival, departure)
    let plan = { arrivalDate: arrival, departureDate: departure, days: {} }
    daysList.forEach(() => {})
    daysList.forEach((d) => { plan.days[d] = { items: [] } })
    plan = ensureSystemItems(plan)
    savePlan(plan)
    onSave(plan, arrival)
  }

  return (
    <div style={{ padding: '24px 20px', display: 'flex', flexDirection: 'column', gap: 20 }}>
      {onCancel && (
        <button onClick={onCancel} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, color: '#A8A8A8', padding: 0, alignSelf: 'flex-start' }}>
          ← {L(lang, { ko: '취소', zh: '取消', en: 'Cancel' })}
        </button>
      )}

      <div>
        <div style={{ fontSize: 20, fontWeight: 700, color: '#1A1A1A', marginBottom: 6 }}>
          {L(lang, { ko: '여행 날짜를 설정해주세요', zh: '请设置旅行日期', en: 'Set your travel dates' })}
        </div>
        <div style={{ fontSize: 13, color: '#A8A8A8', lineHeight: 1.6, whiteSpace: 'pre-line' }}>
          {L(lang, { ko: '입국일과 출국일을 입력하면\n일정표가 자동으로 생성됩니다', zh: '输入入境和出境日期\n将自动生成行程表', en: 'Enter arrival and departure dates\nto auto-generate your itinerary' })}
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div style={{ borderRadius: 12, border: '1px solid #F0EDED', background: '#FFFFFF', padding: '16px 20px' }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: '#C4725A', letterSpacing: '0.06em', marginBottom: 8, textTransform: 'uppercase' }}>
            {L(lang, { ko: '입국일 (D-Day)', zh: '入境日 (D-Day)', en: 'Arrival (D-Day)' })}
          </div>
          <input
            type="date" value={arrival} onChange={e => setArrival(e.target.value)}
            style={{ width: '100%', border: 'none', outline: 'none', background: 'transparent', fontSize: 18, fontWeight: 700, color: arrival ? '#1A1A1A' : '#CDCDCD', fontFamily: 'inherit', boxSizing: 'border-box' }}
          />
        </div>
        <div style={{ borderRadius: 12, border: '1px solid #F0EDED', background: '#FFFFFF', padding: '16px 20px' }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: '#6B6B6B', letterSpacing: '0.06em', marginBottom: 8, textTransform: 'uppercase' }}>
            {L(lang, { ko: '출국일', zh: '出境日', en: 'Departure' })}
          </div>
          <input
            type="date" value={departure} min={arrival || undefined} onChange={e => setDeparture(e.target.value)}
            style={{ width: '100%', border: 'none', outline: 'none', background: 'transparent', fontSize: 18, fontWeight: 700, color: departure ? '#1A1A1A' : '#CDCDCD', fontFamily: 'inherit', boxSizing: 'border-box' }}
          />
        </div>
      </div>

      {arrival && departure && departure < arrival && (
        <div style={{ fontSize: 13, color: '#D94F4F', textAlign: 'center' }}>
          {L(lang, { ko: '출국일이 입국일보다 빨라요', zh: '出境日不能早于入境日', en: 'Departure must be after arrival' })}
        </div>
      )}

      {arrival && departure && departure >= arrival && (
        <div style={{ textAlign: 'center', fontSize: 13, color: '#C4725A', fontWeight: 600 }}>
          {getNightsLabel(arrival, departure, lang)} · {buildDaysList(arrival, departure).length}{L(lang, { ko: '일 일정', zh: '天行程', en: ' days' })}
        </div>
      )}

      <button
        onClick={handleSave} disabled={!canSave}
        style={{
          padding: '16px', borderRadius: 12, border: 'none', cursor: canSave ? 'pointer' : 'not-allowed',
          background: canSave ? '#C4725A' : '#E0E0E0', color: 'white', fontSize: 16, fontWeight: 700,
        }}
      >
        {L(lang, { ko: '일정표 만들기', zh: '创建行程表', en: 'Create Itinerary' })}
      </button>
    </div>
  )
}

// ─── 장소 추가 바텀시트 ───
function AddPlaceSheet({ open, onClose, lang, onAdd }) {
  const [query, setQuery] = useState('')
  const [time, setTime] = useState('10:00')
  const [category, setCategory] = useState('sightseeing')
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [step, setStep] = useState('search')
  const [selected, setSelected] = useState(null)
  const [nameKr, setNameKr] = useState('')
  const [nameCn, setNameCn] = useState('')
  const debounceRef = useRef(null)
  const inputRef = useRef(null)

  useEffect(() => {
    if (open) {
      setQuery(''); setResults([]); setStep('search'); setSelected(null)
      setTime('10:00'); setCategory('sightseeing'); setNameKr(''); setNameCn('')
      setTimeout(() => inputRef.current?.focus(), 120)
    }
  }, [open])

  const doSearch = useCallback(async (q) => {
    if (!q.trim()) { setResults([]); return }
    setLoading(true)
    try {
      const res = await searchKeyword(q, { numOfRows: 8, areaCode: 1 })
      setResults(res.items || [])
    } catch { setResults([]) }
    setLoading(false)
  }, [])

  const handleQuery = (v) => {
    setQuery(v)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => doSearch(v), 400)
  }

  const handleSelectResult = (item) => {
    setSelected(item)
    setNameKr(item.title || '')
    setNameCn('')
    setStep('detail')
  }

  const handleAdd = () => {
    const item = {
      id: `place-${Date.now()}`,
      type: 'place',
      name_kr: nameKr,
      name_cn: nameCn,
      category,
      time,
      hours: null,
      closedDay: null,
      addr: selected?.addr1 || '',
      mapUrl: selected?.mapx && selected?.mapy
        ? `https://map.kakao.com/link/map/${encodeURIComponent(selected.title)},${selected.mapy},${selected.mapx}`
        : null,
    }
    onAdd(item)
    onClose()
  }

  const canAdd = !!(nameKr || nameCn)

  if (!open) return null

  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, zIndex: 9800, background: 'rgba(0,0,0,0.35)', display: 'flex', alignItems: 'flex-end' }}>
      <div onClick={e => e.stopPropagation()} style={{ background: '#FFFFFF', borderRadius: '16px 16px 0 0', width: '100%', maxHeight: '88vh', display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '12px 20px 0', flexShrink: 0 }}>
          <div style={{ width: 40, height: 4, borderRadius: 2, background: '#CDCDCD', margin: '0 auto 16px' }} />
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <span style={{ fontSize: 17, fontWeight: 700, color: '#1A1A1A' }}>
              {L(lang, { ko: '장소 추가', zh: '添加地点', en: 'Add Place' })}
            </span>
            <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, fontSize: 14, color: '#A8A8A8' }}>
              ✕
            </button>
          </div>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: '0 20px 44px' }}>
          {step === 'search' && (
            <>
              <div style={{ position: 'relative', marginBottom: 14 }}>
                <input
                  ref={inputRef} type="text" value={query} onChange={e => handleQuery(e.target.value)}
                  placeholder={L(lang, { ko: '장소 검색...', zh: '搜索地点...', en: 'Search places...' })}
                  style={{ width: '100%', padding: '12px 14px', borderRadius: 12, border: '1px solid #F0EDED', outline: 'none', fontSize: 15, color: '#1A1A1A', background: '#FAFAFA', boxSizing: 'border-box' }}
                />
              </div>

              {loading && (
                <div style={{ textAlign: 'center', padding: '20px 0', color: '#A8A8A8', fontSize: 13 }}>
                  {L(lang, { ko: '검색 중...', zh: '搜索中...', en: 'Searching...' })}
                </div>
              )}

              {!loading && results.map(item => (
                <button
                  key={item.contentid} onClick={() => handleSelectResult(item)}
                  style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 12, padding: '12px 0', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', borderBottom: '1px solid #F0EDED' }}
                >
                  <div style={{ width: 40, height: 40, borderRadius: 10, background: '#F0EDED', flexShrink: 0, overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {item.firstimage
                      ? <img src={item.firstimage} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} loading="lazy" />
                      : <span style={{ fontSize: 12, fontWeight: 600, color: '#A8A8A8' }}>{(item.title || '').slice(0, 2)}</span>
                    }
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 14, fontWeight: 600, color: '#1A1A1A', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.title}</div>
                    {item.addr1 && (
                      <div style={{ fontSize: 12, color: '#A8A8A8', marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {item.addr1.replace('서울특별시 ', '')}
                      </div>
                    )}
                  </div>
                </button>
              ))}

              <button
                onClick={() => { setSelected(null); setStep('detail') }}
                style={{ width: '100%', padding: '14px', borderRadius: 10, border: '1px dashed #F0EDED', background: 'transparent', cursor: 'pointer', fontSize: 14, color: '#A8A8A8', textAlign: 'center', marginTop: 8 }}
              >
                {L(lang, { ko: '+ 직접 입력', zh: '+ 手动输入', en: '+ Enter manually' })}
              </button>
            </>
          )}

          {step === 'detail' && (
            <>
              {selected && (
                <div style={{ borderRadius: 12, background: '#FBF7F5', padding: '12px 16px', marginBottom: 16, borderLeft: '3px solid #C4725A' }}>
                  <div style={{ fontSize: 14, fontWeight: 600, color: '#1A1A1A' }}>{selected.title}</div>
                  {selected.addr1 && (
                    <div style={{ fontSize: 12, color: '#A8A8A8', marginTop: 2 }}>{selected.addr1.replace('서울특별시 ', '')}</div>
                  )}
                </div>
              )}

              <div style={{ marginBottom: 12 }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: '#6B6B6B', marginBottom: 6 }}>
                  {L(lang, { ko: '중국어 이름 (선택)', zh: '中文名称（可选）', en: 'Chinese Name (optional)' })}
                </div>
                <input type="text" value={nameCn} onChange={e => setNameCn(e.target.value)}
                  placeholder={L(lang, { ko: '예: 蓝瓶咖啡', zh: '例：蓝瓶咖啡', en: 'e.g. 蓝瓶咖啡' })}
                  style={{ width: '100%', padding: '12px 16px', borderRadius: 12, border: '1px solid #F0EDED', outline: 'none', fontSize: 15, color: '#1A1A1A', background: '#FAFAFA', boxSizing: 'border-box' }}
                />
              </div>

              <div style={{ marginBottom: 12 }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: '#6B6B6B', marginBottom: 6 }}>
                  {L(lang, { ko: '한국어 이름', zh: '韩文名称', en: 'Korean Name' })} *
                </div>
                <input type="text" value={nameKr} onChange={e => setNameKr(e.target.value)}
                  placeholder={L(lang, { ko: '예: 블루보틀', zh: '例：蓝瓶咖啡', en: 'e.g. Blue Bottle' })}
                  style={{ width: '100%', padding: '12px 16px', borderRadius: 12, border: '1px solid #F0EDED', outline: 'none', fontSize: 15, color: '#1A1A1A', background: '#FAFAFA', boxSizing: 'border-box' }}
                />
              </div>

              <div style={{ marginBottom: 12 }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: '#6B6B6B', marginBottom: 6 }}>
                  {L(lang, { ko: '방문 시간', zh: '到访时间', en: 'Visit Time' })}
                </div>
                <input type="time" value={time} onChange={e => setTime(e.target.value)}
                  style={{ width: '100%', padding: '12px 16px', borderRadius: 12, border: '1px solid #F0EDED', outline: 'none', fontSize: 15, color: '#1A1A1A', background: '#FAFAFA', boxSizing: 'border-box', fontFamily: 'inherit' }}
                />
              </div>

              <div style={{ marginBottom: 20 }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: '#6B6B6B', marginBottom: 8 }}>
                  {L(lang, { ko: '카테고리', zh: '类别', en: 'Category' })}
                </div>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {CATEGORIES.map(cat => (
                    <button key={cat.id} onClick={() => setCategory(cat.id)}
                      style={{
                        padding: '8px 14px', borderRadius: 20, cursor: 'pointer',
                        background: category === cat.id ? '#C4725A' : 'transparent',
                        color: category === cat.id ? '#FFFFFF' : '#6B6B6B',
                        border: category === cat.id ? '1px solid #C4725A' : '1px solid #F0EDED',
                        fontSize: 13, fontWeight: category === cat.id ? 700 : 500,
                      }}
                    >
                      {L(lang, cat.label)}
                    </button>
                  ))}
                </div>
              </div>

              <div style={{ display: 'flex', gap: 10 }}>
                <button onClick={() => setStep('search')}
                  style={{ flex: 1, padding: '14px', borderRadius: 12, border: '1px solid #F0EDED', cursor: 'pointer', background: '#FFFFFF', color: '#6B6B6B', fontSize: 15, fontWeight: 600 }}
                >
                  {L(lang, { ko: '뒤로', zh: '返回', en: 'Back' })}
                </button>
                <button onClick={handleAdd} disabled={!canAdd}
                  style={{
                    flex: 2, padding: '14px', borderRadius: 12, border: 'none',
                    cursor: canAdd ? 'pointer' : 'not-allowed',
                    background: canAdd ? '#C4725A' : '#E0E0E0', color: 'white',
                    fontSize: 15, fontWeight: 700,
                  }}
                >
                  {L(lang, { ko: '일정에 추가', zh: '添加到行程', en: 'Add to Plan' })}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── 메인 컴포넌트 (풀스크린 오버레이) ───
export default function TravelPlannerTab({ open, onClose, setSubPage, setTab }) {
  const { lang } = useLanguage()
  const [plan, setPlan] = useState(() => loadPlan())
  const [selectedDay, setSelectedDay] = useState(null)
  const [editDates, setEditDates] = useState(false)
  const [showAddPlace, setShowAddPlace] = useState(false)
  const [systemSheet, setSystemSheet] = useState(null)
  const [expandedSystem, setExpandedSystem] = useState({})
  const [hoveredItem, setHoveredItem] = useState(null)
  const [slideIn, setSlideIn] = useState(false)

  const daysList = plan ? buildDaysList(plan.arrivalDate, plan.departureDate) : []

  // 슬라이드 인 애니메이션
  useEffect(() => {
    if (open) {
      requestAnimationFrame(() => requestAnimationFrame(() => setSlideIn(true)))
    } else {
      setSlideIn(false)
    }
  }, [open])

  // 최초 진입 시 첫 날 자동 선택
  useEffect(() => {
    if (plan && daysList.length > 0 && !selectedDay) {
      setSelectedDay(daysList[0])
    }
  }, [plan]) // eslint-disable-line react-hooks/exhaustive-deps

  // plan 변경 감지 (다른 곳에서 저장될 때)
  useEffect(() => {
    if (open) setPlan(loadPlan())
  }, [open])

  const updatePlan = (next) => {
    const updated = ensureSystemItems(next)
    savePlan(updated)
    setPlan(updated)
  }

  const handleAddPlace = (item) => {
    if (!selectedDay || !plan) return
    const dayData = plan.days[selectedDay] || { items: [] }
    const placeItems = [...dayData.items.filter(i => i.type === 'place'), item]
      .sort((a, b) => {
        if (!a.time) return 1
        if (!b.time) return -1
        return a.time.localeCompare(b.time)
      })
    const systemItems = dayData.items.filter(i => i.type === 'system')
    const next = {
      ...plan,
      days: { ...plan.days, [selectedDay]: { ...dayData, items: [...systemItems, ...placeItems] } },
    }
    updatePlan(next)
  }

  const handleDeleteItem = (itemId) => {
    if (!selectedDay || !plan) return
    const dayData = plan.days[selectedDay]
    if (!dayData) return
    const next = {
      ...plan,
      days: { ...plan.days, [selectedDay]: { ...dayData, items: dayData.items.filter(i => i.id !== itemId) } },
    }
    updatePlan(next)
  }

  const handleDateSave = (newPlan, arrivalDate) => {
    setPlan(newPlan)
    setSelectedDay(arrivalDate)
    setEditDates(false)
  }

  const toggleSystemExpand = (id) => {
    setExpandedSystem(prev => ({ ...prev, [id]: !prev[id] }))
  }

  const handleClose = () => {
    setSlideIn(false)
    setTimeout(() => onClose?.(), 280)
  }

  if (!open) return null

  // ─── 날짜 미설정 or 수정 화면 ───
  if (!plan || editDates) {
    return (
      <div style={{
        position: 'fixed', inset: 0, zIndex: 9600,
        background: '#FAFAFA',
        transform: slideIn ? 'translateX(0)' : 'translateX(100%)',
        transition: 'transform 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
        fontFamily: '-apple-system, "Pretendard", "Noto Sans SC", sans-serif',
        display: 'flex', flexDirection: 'column',
      }}>
        {/* 헤더 */}
        <div style={{ display: 'flex', alignItems: 'center', padding: '12px 16px', borderBottom: '1px solid #F0EDED' }}>
          <button onClick={handleClose} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 14, color: '#A8A8A8', padding: '4px 8px', fontWeight: 500 }}>
            ← {L(lang, { ko: '홈', zh: '首页', en: 'Home' })}
          </button>
        </div>
        <div style={{ flex: 1, overflowY: 'auto' }}>
          <DateSetupScreen
            lang={lang}
            onSave={handleDateSave}
            onCancel={editDates ? () => setEditDates(false) : null}
          />
        </div>
      </div>
    )
  }

  const selectedDayData = plan.days[selectedDay] || { items: [] }
  const isArrivalDay = selectedDay === plan.arrivalDate
  const isDepartureDay = selectedDay === plan.departureDate
  const hasPlaces = selectedDayData.items.some(i => i.type === 'place')
  const todayStr = dateToStr(new Date())

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9600,
      background: '#FAFAFA',
      transform: slideIn ? 'translateX(0)' : 'translateX(100%)',
      transition: 'transform 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
      fontFamily: '-apple-system, "Pretendard", "Noto Sans SC", sans-serif',
      display: 'flex', flexDirection: 'column',
    }}>

      {/* ─── 상단 헤더 ─── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', borderBottom: '1px solid #F0EDED', flexShrink: 0 }}>
        <button onClick={handleClose} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 14, color: '#A8A8A8', padding: '4px 0', fontWeight: 500 }}>
          ← {L(lang, { ko: '홈', zh: '首页', en: 'Home' })}
        </button>
        <span style={{ fontSize: 15, fontWeight: 700, color: '#1A1A1A' }}>
          {L(lang, { ko: '내 일정', zh: '我的行程', en: 'My Itinerary' })}
        </span>
        <button onClick={() => setEditDates(true)} style={{ background: '#F0EDED', border: 'none', cursor: 'pointer', fontSize: 11, color: '#A8A8A8', fontWeight: 500, padding: '4px 10px', borderRadius: 20 }}>
          {L(lang, { ko: '수정', zh: '修改', en: 'Edit' })}
        </button>
      </div>

      {/* ─── Trip Summary ─── */}
      <div style={{ padding: '12px 20px 10px', borderBottom: '1px solid #F0EDED', flexShrink: 0 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: '#1A1A1A', letterSpacing: '-0.3px' }}>
          {formatDateLabel(plan.arrivalDate, lang)} — {formatDateLabel(plan.departureDate, lang)}
        </div>
        <div style={{ fontSize: 11, color: '#C4725A', marginTop: 2, fontWeight: 600 }}>
          {getNightsLabel(plan.arrivalDate, plan.departureDate, lang)}
        </div>
      </div>

      {/* ─── 메인 레이아웃 (사이드바 + 타임테이블) ─── */}
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>

        {/* 좌측 날짜 사이드바 (52px) */}
        <div style={{ width: 52, flexShrink: 0, display: 'flex', flexDirection: 'column', borderRight: '1px solid #F0EDED', overflowY: 'auto', paddingTop: 4 }}>
          {daysList.map((day, idx) => {
            const isSelected = selectedDay === day
            const isToday = day === todayStr
            const label = getDayLabel(idx, daysList.length, lang)
            return (
              <button
                key={day} onClick={() => setSelectedDay(day)}
                style={{
                  width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center',
                  padding: '10px 0', border: 'none', cursor: 'pointer',
                  background: 'transparent',
                  borderLeft: isSelected ? '3px solid #C4725A' : '3px solid transparent',
                }}
              >
                <span style={{ fontSize: 11, fontWeight: 700, color: isSelected ? '#C4725A' : '#A8A8A8', lineHeight: 1.2 }}>
                  {label}
                </span>
                <span style={{ fontSize: 9, color: isSelected ? '#C4725A' : '#A8A8A8', marginTop: 2, opacity: isSelected ? 0.8 : 0.6 }}>
                  {formatShortDate(day)}
                </span>
                {isToday && (
                  <div style={{ width: 4, height: 4, borderRadius: '50%', background: '#C4725A', marginTop: 3 }} />
                )}
              </button>
            )
          })}
        </div>

        {/* 우측 타임테이블 */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '8px 16px 80px 12px', minWidth: 0 }}>

          {selectedDayData.items.map(item => {
            /* ── 시스템 카드 ── */
            if (item.type === 'system') {
              const isExpanded = expandedSystem[item.id]
              const subItems = item.subtype === 'arrival' ? ARRIVAL_ITEMS : DEPARTURE_ITEMS

              return (
                <div key={item.id} style={{ background: '#FBF7F5', borderRadius: 12, padding: '12px 14px', marginBottom: 6 }}>
                  <div
                    onClick={() => toggleSystemExpand(item.id)}
                    style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
                  >
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 700, color: '#C4725A' }}>
                        {L(lang, item.title)}
                      </div>
                      <div style={{ fontSize: 10, color: '#C4725A', opacity: 0.6, marginTop: 2 }}>
                        {L(lang, { ko: '탭하여 보기', zh: '点击查看', en: 'Tap to view' })}
                      </div>
                    </div>
                    <span style={{ fontSize: 10, color: '#C4725A', opacity: 0.4, transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s', display: 'inline-block' }}>
                      ▼
                    </span>
                  </div>

                  {isExpanded && (
                    <div style={{ marginTop: 8 }}>
                      {subItems.map((si) => (
                        <div
                          key={si.id}
                          onClick={() => {
                            if (si.sub && setSubPage) setSubPage(si.sub)
                            else if (si.tab && setTab) setTab(si.tab)
                          }}
                          style={{
                            padding: '8px 0', borderTop: '1px solid rgba(196,114,90,0.1)',
                            fontSize: 12, color: '#6B6B6B', cursor: 'pointer',
                          }}
                          onMouseEnter={e => e.currentTarget.style.color = '#C4725A'}
                          onMouseLeave={e => e.currentTarget.style.color = '#6B6B6B'}
                        >
                          {L(lang, si.label)}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )
            }

            /* ── 장소 카드 ── */
            if (item.type === 'place') {
              const dayOfWeek = strToDate(selectedDay).getDay()
              const isClosed = item.closedDay && item.closedDay.includes(DAY_NAMES_KO[dayOfWeek])
              const displayName = item.name_cn || item.name_kr || ''
              const initials = displayName.slice(0, 2)
              const isHovered = hoveredItem === item.id

              const metaParts = []
              const catObj = CATEGORIES.find(c => c.id === item.category)
              if (catObj) metaParts.push(L(lang, catObj.label))
              if (item.hours) metaParts.push(item.hours)
              if (item.closedDay) metaParts.push(`${item.closedDay} ${L(lang, { ko: '휴무', zh: '休息', en: 'closed' })}`)
              const metaLine = metaParts.join(' · ')

              return (
                <div
                  key={item.id}
                  style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '10px 0', borderBottom: '1px solid #F0EDED' }}
                  onMouseEnter={() => setHoveredItem(item.id)}
                  onMouseLeave={() => setHoveredItem(null)}
                >
                  <div style={{ width: 3, height: 32, borderRadius: 2, background: isClosed ? '#D94F4F' : '#C4725A', opacity: 0.7, flexShrink: 0, marginTop: 4 }} />
                  <div style={{ width: 36, height: 36, borderRadius: 8, background: '#F0EDED', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <span style={{ fontSize: 11, fontWeight: 600, color: '#A8A8A8' }}>{initials}</span>
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    {item.time && (
                      <div style={{ fontSize: 10, fontWeight: 600, color: '#C4725A', marginBottom: 2 }}>{item.time}</div>
                    )}
                    <div style={{ fontSize: 13, fontWeight: 600, color: '#1A1A1A', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {item.name_cn || item.name_kr}
                    </div>
                    {item.name_cn && item.name_kr && (
                      <div style={{ fontSize: 11, color: '#A8A8A8', marginTop: 1 }}>{item.name_kr}</div>
                    )}
                    {metaLine && <div style={{ fontSize: 10, color: '#A8A8A8', marginTop: 2 }}>{metaLine}</div>}
                    {isClosed && (
                      <div style={{ marginTop: 2, fontSize: 10, color: '#D94F4F', fontWeight: 600 }}>
                        {L(lang, { ko: '이 날은 휴무일입니다', zh: '今天休息', en: 'Closed today' })}
                      </div>
                    )}
                  </div>
                  <button
                    onClick={() => handleDeleteItem(item.id)}
                    style={{
                      background: 'none', border: 'none', cursor: 'pointer', flexShrink: 0,
                      fontSize: 10, color: '#A8A8A8', padding: '4px',
                      opacity: isHovered ? 1 : 0, transition: 'opacity 0.15s',
                    }}
                  >
                    ✕
                  </button>
                </div>
              )
            }

            return null
          })}

          {/* 빈 상태 */}
          {!isArrivalDay && !isDepartureDay && !hasPlaces && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '40px 20px' }}>
              <div style={{ fontSize: 13, color: '#A8A8A8', lineHeight: 1.5, textAlign: 'center', whiteSpace: 'pre-line' }}>
                {L(lang, { ko: '어디로 떠나볼까요?\n장소를 추가해서 하루를 채워보세요', zh: '今天去哪里？\n添加地点，制定行程', en: "Where to today?\nAdd places to build your itinerary" })}
              </div>
            </div>
          )}

          {/* 장소 추가 버튼 */}
          <button
            onClick={() => setShowAddPlace(true)}
            style={{
              width: '100%', marginTop: 6, padding: 14, borderRadius: 10,
              border: '1px dashed #F0EDED', background: 'transparent', cursor: 'pointer',
              fontSize: 12, color: '#A8A8A8',
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = '#C4725A'; e.currentTarget.style.color = '#C4725A'; e.currentTarget.style.background = '#FBF7F5' }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = '#F0EDED'; e.currentTarget.style.color = '#A8A8A8'; e.currentTarget.style.background = 'transparent' }}
          >
            + {L(lang, { ko: '장소 추가', zh: '添加地点', en: 'Add Place' })}
          </button>

          {/* 미배정 섹션 */}
          <div style={{ marginTop: 12, paddingTop: 10, borderTop: '1px dashed #F0EDED' }}>
            <div style={{ fontSize: 10, color: '#A8A8A8', fontWeight: 600 }}>
              {L(lang, { ko: '미배정 장소', zh: '未分配地点', en: 'Unassigned' })}
            </div>
            <div style={{ fontSize: 10, color: '#CDCDCD', marginTop: 4 }}>
              {L(lang, { ko: '미배정 장소가 없습니다', zh: '没有未分配的地点', en: 'No unassigned places' })}
            </div>
          </div>
        </div>
      </div>

      {/* 모달들 */}
      <AddPlaceSheet open={showAddPlace} onClose={() => setShowAddPlace(false)} lang={lang} onAdd={handleAddPlace} />
    </div>
  )
}
