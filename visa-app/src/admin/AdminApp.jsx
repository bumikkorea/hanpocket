import { useState, useEffect, useCallback, useMemo } from 'react'
import useReservationAdmin from '../hooks/useReservationAdmin'
import { supabase } from '../lib/supabase'

// ── 상수 ──────────────────────────────────────────────────────
const ADMIN_KEY = 'near_admin_auth'

/**
 * SHA-256으로 비밀번호 해싱
 * @param {string} password - 평문 비밀번호
 * @returns {Promise<string>} - 해시값 (hex)
 */
async function hashPassword(password) {
  const encoder = new TextEncoder()
  const data = encoder.encode(password)
  const hash = await crypto.subtle.digest('SHA-256', data)
  return Array.from(new Uint8Array(hash))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('')
}

// 폴백 매장 목록 (Supabase 로드 실패 시)
const FALLBACK_SHOPS = [
  { id: 'p0000001-0000-0000-0000-000000000101', name: '성수동 미용실', district: '성수', open_time: '10:00', close_time: '20:00' },
  { id: 'p0000001-0000-0000-0000-000000000102', name: '홍대 피부관리', district: '홍대', open_time: '10:00', close_time: '21:00' },
  { id: 'p0000001-0000-0000-0000-000000000103', name: '강남 네일샵', district: '강남', open_time: '10:00', close_time: '20:00' },
]

const NAV_ITEMS = [
  { id: 'dashboard',    icon: '📊', label: '대시보드' },
  { id: 'reservations', icon: '📅', label: '예약관리' },
  { id: 'customers',    icon: '👥', label: '고객관리' },
  { id: 'settings',     icon: '⚙️',  label: '설정' },
]

// ── 상태 뱃지 ─────────────────────────────────────────────────
const BADGE = {
  pending:   { bg: '#FFF8E1', color: '#F9A825', label: '대기' },
  confirmed: { bg: '#E8F5E9', color: '#43A047', label: '확정' },
  completed: { bg: '#F5F5F5', color: '#888888', label: '완료' },
  cancelled: { bg: '#FFEBEE', color: '#E53935', label: '취소' },
  noshow:    { bg: '#FCE4EC', color: '#C62828', label: '노쇼' },
}

function StatusBadge({ status }) {
  const b = BADGE[status] || BADGE.pending
  return (
    <span style={{ background: b.bg, color: b.color, fontSize: 11, fontWeight: 600,
      padding: '3px 10px', borderRadius: 100, whiteSpace: 'nowrap' }}>
      {b.label}
    </span>
  )
}

// ── 로그인 화면 ───────────────────────────────────────────────
function LoginScreen({ onLogin }) {
  const [shops, setShops] = useState(FALLBACK_SHOPS)
  const [shopId, setShopId] = useState(FALLBACK_SHOPS[0].id)
  const [pw, setPw] = useState('')
  const [error, setError] = useState('')

  // Supabase에서 예약 가능 매장 목록 로드
  useEffect(() => {
    supabase
      .from('popups')
      .select('id, name_ko, name_zh, district, open_time, close_time')
      .eq('has_reservation', true)
      .then(({ data }) => {
        if (data && data.length > 0) {
          const list = data.map(p => ({
            id: p.id,
            name: p.name_ko || p.name_zh,
            district: p.district,
            open_time: p.open_time,
            close_time: p.close_time,
          }))
          setShops(list)
          setShopId(list[0].id)
        }
      })
  }, [])

  const submit = async (e) => {
    e.preventDefault()
    try {
      const inputHash = await hashPassword(pw)
      const expectedHash = import.meta.env.VITE_ADMIN_PASSWORD_HASH

      if (inputHash === expectedHash) {
        const shop = shops.find(s => s.id === shopId)
        onLogin(shop)
      } else {
        setError('비밀번호가 올바르지 않습니다.')
        setPw('')
      }
    } catch (err) {
      setError('인증 처리 중 오류가 발생했습니다.')
      console.error('Password hash error:', err)
    }
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center',
      justifyContent: 'center', background: '#F8F8F8', padding: 24 }}>
      <div style={{ width: '100%', maxWidth: 380, background: '#fff',
        borderRadius: 16, padding: '40px 32px', boxShadow: '0 4px 24px rgba(0,0,0,0.08)' }}>

        {/* 로고 */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ fontSize: 28, fontWeight: 800, color: '#C4725A',
            letterSpacing: -1, marginBottom: 6 }}>NEAR</div>
          <div style={{ fontSize: 14, color: '#888', fontWeight: 500 }}>가맹점 관리자</div>
        </div>

        <form onSubmit={submit}>
          {/* 매장 선택 */}
          <div style={{ marginBottom: 16 }}>
            <label style={{ fontSize: 12, fontWeight: 600, color: '#444',
              display: 'block', marginBottom: 6 }}>매장 선택</label>
            <select value={shopId} onChange={e => setShopId(e.target.value)}
              style={{ width: '100%', padding: '12px 14px', borderRadius: 10,
                border: '1.5px solid #E8E8E8', fontSize: 14, background: '#fff',
                outline: 'none', cursor: 'pointer', appearance: 'none',
                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%23888' stroke-width='1.5' fill='none' stroke-linecap='round'/%3E%3C/svg%3E")`,
                backgroundRepeat: 'no-repeat', backgroundPosition: 'right 14px center' }}>
              {shops.map(s => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>

          {/* 비밀번호 */}
          <div style={{ marginBottom: 8 }}>
            <label style={{ fontSize: 12, fontWeight: 600, color: '#444',
              display: 'block', marginBottom: 6 }}>비밀번호</label>
            <input
              type="password" value={pw} onChange={e => setPw(e.target.value)}
              placeholder="비밀번호 입력"
              style={{ width: '100%', padding: '12px 14px', borderRadius: 10,
                border: `1.5px solid ${error ? '#E53935' : '#E8E8E8'}`,
                fontSize: 14, outline: 'none' }}
            />
          </div>

          {error && (
            <p style={{ fontSize: 12, color: '#E53935', marginBottom: 16 }}>{error}</p>
          )}

          <button type="submit"
            style={{ width: '100%', padding: '14px', marginTop: 16,
              background: '#C4725A', color: '#fff', border: 'none', borderRadius: 10,
              fontSize: 15, fontWeight: 700, cursor: 'pointer', letterSpacing: -0.3 }}>
            로그인
          </button>
        </form>
      </div>
    </div>
  )
}

// ── 대시보드 ─────────────────────────────────────────────────
function Dashboard({ shop, admin }) {
  const stats = admin.getTodayStats()
  const todayList = admin.getTodayReservations()
  const monthRevenue = stats.monthRevenue || 0

  // 30분 단위 타임라인 슬롯 생성 (10:00 ~ 21:00)
  const slots = []
  for (let h = 10; h <= 20; h++) {
    for (let m = 0; m < 60; m += 30) {
      slots.push(`${String(h).padStart(2,'0')}:${m === 0 ? '00' : '30'}`)
    }
  }

  const reservedTimes = new Set(todayList.map(r => r.time))

  const [rejectId, setRejectId] = useState(null)

  return (
    <div>
      <h2 style={{ fontSize: 20, fontWeight: 700, color: '#1a1a1a',
        marginBottom: 24, letterSpacing: -0.5 }}>오늘의 대시보드</h2>

      {/* 요약 카드 4개 */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)',
        gap: 14, marginBottom: 32 }}>
        {[
          { label: '오늘 예약', value: stats.total, sub: '총 건수', color: '#C4725A' },
          { label: '대기 중',   value: stats.pending, sub: '확인 필요', color: '#F9A825' },
          { label: '완료',      value: stats.completed, sub: '건', color: '#43A047' },
          { label: '이번달 매출', value: `₩${(monthRevenue/10000).toFixed(0)}만`, sub: '누적', color: '#1976D2' },
        ].map((c, i) => (
          <div key={i} style={{ background: '#fff', borderRadius: 12,
            padding: '20px 18px', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
            <div style={{ fontSize: 12, color: '#888', marginBottom: 8 }}>{c.label}</div>
            <div style={{ fontSize: 30, fontWeight: 800, color: c.color,
              letterSpacing: -1, lineHeight: 1 }}>{c.value}</div>
            <div style={{ fontSize: 11, color: '#bbb', marginTop: 6 }}>{c.sub}</div>
          </div>
        ))}
      </div>

      {/* 타임라인 */}
      <div style={{ background: '#fff', borderRadius: 12, padding: 20,
        boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
        <h3 style={{ fontSize: 14, fontWeight: 700, color: '#333', marginBottom: 16 }}>
          오늘의 예약 타임라인
        </h3>
        <div>
          {slots.map(time => {
            const res = todayList.find(r => r.time === time)
            if (!res) {
              return (
                <div key={time} style={{ display: 'flex', alignItems: 'center',
                  gap: 16, padding: '8px 0', borderBottom: '1px dashed #F0F0F0' }}>
                  <span style={{ fontSize: 13, color: '#CCC', width: 48, flexShrink: 0, fontVariantNumeric: 'tabular-nums' }}>{time}</span>
                  <span style={{ fontSize: 12, color: '#DDD' }}>── 빈 슬롯 ──</span>
                </div>
              )
            }
            const cust = admin.getCustomer(res.customerId)
            const nameDisplay = cust?.name || res.customerName || (res.deviceId ? res.deviceId.slice(0,6) : '고객')
            return (
              <div key={time} style={{ display: 'flex', alignItems: 'center',
                gap: 12, padding: '10px 0', borderBottom: '1px solid #F5F5F5',
                flexWrap: 'wrap' }}>
                <span style={{ fontSize: 13, fontWeight: 600, color: '#333',
                  width: 48, flexShrink: 0, fontVariantNumeric: 'tabular-nums' }}>{time}</span>
                <span style={{ fontSize: 14, fontWeight: 600, color: '#1a1a1a', minWidth: 70 }}>{nameDisplay}</span>
                <span style={{ fontSize: 13, color: '#666', flex: 1 }}>
                  {res.services?.[0]?.name?.ko || '서비스'}
                  {res.partySize > 1 ? ` · ${res.partySize}명` : ''}
                </span>
                <StatusBadge status={res.status} />
                {res.status === 'pending' && (
                  <div style={{ display: 'flex', gap: 6 }}>
                    <ActionBtn color="#43A047" onClick={() => admin.confirmReservation(res.id)}>확인</ActionBtn>
                    <ActionBtn color="#E53935" onClick={() => setRejectId(res.id)}>거절</ActionBtn>
                  </div>
                )}
                {res.status === 'confirmed' && (
                  <div style={{ display: 'flex', gap: 6 }}>
                    <ActionBtn color="#888" onClick={() => admin.completeReservation(res.id)}>완료</ActionBtn>
                    <ActionBtn color="#C62828" onClick={() => admin.markNoshow(res.id)}>노쇼</ActionBtn>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* 거절 확인 모달 */}
      {rejectId && (
        <ConfirmModal
          message="이 예약을 거절하시겠습니까?"
          onConfirm={() => { admin.rejectReservation(rejectId); setRejectId(null) }}
          onCancel={() => setRejectId(null)}
        />
      )}
    </div>
  )
}

// ── 예약관리 ─────────────────────────────────────────────────
function ReservationsPage({ admin }) {
  const today = new Date()
  const [year, setYear]       = useState(today.getFullYear())
  const [month, setMonth]     = useState(today.getMonth())
  const [selected, setSelected] = useState(today.toISOString().split('T')[0])
  const [filter, setFilter]   = useState('all')

  const firstDay = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()

  const dayReservations = useMemo(() =>
    admin.getReservationsByDate(selected), [selected, admin])

  const filtered = filter === 'all' ? dayReservations
    : dayReservations.filter(r => r.status === filter)

  const prevMonth = () => {
    if (month === 0) { setYear(y => y - 1); setMonth(11) }
    else setMonth(m => m - 1)
  }
  const nextMonth = () => {
    if (month === 11) { setYear(y => y + 1); setMonth(0) }
    else setMonth(m => m + 1)
  }

  const getCountForDay = (day) => {
    const d = `${year}-${String(month+1).padStart(2,'0')}-${String(day).padStart(2,'0')}`
    return admin.reservations.filter(r => r.date === d).length
  }

  const todayStr = today.toISOString().split('T')[0]

  return (
    <div>
      <h2 style={{ fontSize: 20, fontWeight: 700, color: '#1a1a1a',
        marginBottom: 24, letterSpacing: -0.5 }}>예약관리</h2>

      {/* 캘린더 */}
      <div style={{ background: '#fff', borderRadius: 12, padding: 20,
        boxShadow: '0 1px 3px rgba(0,0,0,0.08)', marginBottom: 20 }}>

        {/* 캘린더 헤더 */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <button onClick={prevMonth} style={calNavBtn}>‹</button>
          <span style={{ fontSize: 15, fontWeight: 700, color: '#1a1a1a' }}>
            {year}년 {month + 1}월
          </span>
          <button onClick={nextMonth} style={calNavBtn}>›</button>
        </div>

        {/* 요일 헤더 */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: 2, marginBottom: 4 }}>
          {['일','월','화','수','목','금','토'].map(d => (
            <div key={d} style={{ textAlign: 'center', fontSize: 11, color: '#aaa',
              fontWeight: 600, padding: '4px 0' }}>{d}</div>
          ))}
        </div>

        {/* 날짜 셀 */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: 2 }}>
          {Array.from({ length: firstDay }).map((_, i) => <div key={`e-${i}`} />)}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const day = i + 1
            const dateStr = `${year}-${String(month+1).padStart(2,'0')}-${String(day).padStart(2,'0')}`
            const count = getCountForDay(day)
            const isToday = dateStr === todayStr
            const isSel = dateStr === selected
            return (
              <div key={day} onClick={() => setSelected(dateStr)}
                style={{ textAlign: 'center', padding: '8px 4px', borderRadius: 8,
                  cursor: 'pointer', border: isToday ? '2px solid #C4725A' : '2px solid transparent',
                  background: isSel ? '#FFF0EB' : 'transparent',
                  transition: 'background 0.15s' }}>
                <div style={{ fontSize: 13, fontWeight: isToday ? 700 : 400,
                  color: isSel ? '#C4725A' : '#333' }}>{day}</div>
                {count > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'center', marginTop: 2 }}>
                    <span style={{ width: 6, height: 6, borderRadius: '50%',
                      background: '#C4725A', display: 'block' }} />
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* 필터 */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
        {['all','pending','confirmed','completed','cancelled','noshow'].map(s => (
          <button key={s} onClick={() => setFilter(s)}
            style={{ padding: '6px 14px', borderRadius: 100, fontSize: 12, fontWeight: 600,
              cursor: 'pointer', border: 'none',
              background: filter === s ? '#C4725A' : '#F0F0F0',
              color: filter === s ? '#fff' : '#666' }}>
            {s === 'all' ? '전체' : BADGE[s]?.label}
          </button>
        ))}
      </div>

      {/* 선택일 예약 리스트 */}
      <div style={{ background: '#fff', borderRadius: 12, padding: 20,
        boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: '#888', marginBottom: 12 }}>
          {selected} · {filtered.length}건
        </div>
        {filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '32px 0', color: '#CCC', fontSize: 13 }}>
            예약이 없습니다
          </div>
        ) : filtered.map(res => {
          const cust = admin.getCustomer(res.customerId)
          return (
            <div key={res.id} style={{ display: 'flex', alignItems: 'center', gap: 12,
              padding: '12px 0', borderBottom: '1px solid #F5F5F5', flexWrap: 'wrap' }}>
              <span style={{ fontSize: 13, fontWeight: 700, color: '#333',
                width: 44, flexShrink: 0 }}>{res.time}</span>
              <span style={{ fontSize: 14, fontWeight: 600, color: '#1a1a1a', minWidth: 70 }}>
                {cust?.name || res.customerName || '고객'}
              </span>
              <span style={{ fontSize: 13, color: '#666', flex: 1 }}>
                {res.services?.[0]?.name?.ko || '서비스'}
              </span>
              <span style={{ fontSize: 13, color: '#888' }}>
                ₩{(res.totalPriceKrw || 0).toLocaleString()}
              </span>
              <StatusBadge status={res.status} />
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ── 고객관리 ─────────────────────────────────────────────────
function CustomersPage({ admin }) {
  const [query, setQuery]   = useState('')
  const [detail, setDetail] = useState(null)
  const [memo, setMemo]     = useState('')

  const list = admin.searchCustomers(query)

  const openDetail = (c) => {
    setDetail(c)
    setMemo(c.memo || '')
  }

  const saveMemo = () => {
    admin.updateCustomerMemo(detail.id, memo)
    setDetail(d => ({ ...d, memo }))
  }

  if (detail) {
    const history = admin.getCustomerReservations(detail.id)
    return (
      <div>
        <button onClick={() => setDetail(null)}
          style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13,
            color: '#C4725A', background: 'none', border: 'none',
            cursor: 'pointer', marginBottom: 20, padding: 0, fontWeight: 600 }}>
          ← 목록으로
        </button>
        <div style={{ background: '#fff', borderRadius: 12, padding: 20,
          boxShadow: '0 1px 3px rgba(0,0,0,0.08)', marginBottom: 16 }}>
          <div style={{ fontSize: 20, fontWeight: 700, color: '#1a1a1a',
            marginBottom: 4 }}>{detail.name}</div>
          <div style={{ fontSize: 13, color: '#888', marginBottom: 16 }}>{detail.phone}</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12 }}>
            {[
              { label: '방문', value: `${detail.totalVisits || 0}회` },
              { label: '총 결제', value: `₩${((detail.totalSpentKrw||0)/10000).toFixed(0)}만` },
              { label: '노쇼', value: `${detail.noshowCount || 0}회` },
            ].map((s, i) => (
              <div key={i} style={{ textAlign: 'center', background: '#F8F8F8',
                borderRadius: 8, padding: '12px 8px' }}>
                <div style={{ fontSize: 18, fontWeight: 800, color: '#1a1a1a' }}>{s.value}</div>
                <div style={{ fontSize: 11, color: '#aaa', marginTop: 2 }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* 메모 */}
        <div style={{ background: '#fff', borderRadius: 12, padding: 20,
          boxShadow: '0 1px 3px rgba(0,0,0,0.08)', marginBottom: 16 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#333', marginBottom: 10 }}>사장님 메모</div>
          <textarea value={memo} onChange={e => setMemo(e.target.value)}
            placeholder="고객에 대한 메모를 남기세요..."
            style={{ width: '100%', padding: '10px 12px', borderRadius: 8,
              border: '1.5px solid #E8E8E8', fontSize: 13, resize: 'vertical',
              minHeight: 80, fontFamily: 'inherit', outline: 'none' }} />
          <button onClick={saveMemo}
            style={{ marginTop: 8, padding: '8px 20px', background: '#C4725A',
              color: '#fff', border: 'none', borderRadius: 8, fontSize: 13,
              fontWeight: 600, cursor: 'pointer' }}>저장</button>
        </div>

        {/* 방문 이력 */}
        <div style={{ background: '#fff', borderRadius: 12, padding: 20,
          boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#333', marginBottom: 12 }}>방문 이력</div>
          {history.length === 0 ? (
            <div style={{ color: '#CCC', fontSize: 13, textAlign: 'center', padding: '20px 0' }}>이력 없음</div>
          ) : history.map(r => (
            <div key={r.id} style={{ display: 'flex', gap: 12, alignItems: 'center',
              padding: '10px 0', borderBottom: '1px solid #F5F5F5', flexWrap: 'wrap' }}>
              <span style={{ fontSize: 12, color: '#aaa', width: 80 }}>{r.date}</span>
              <span style={{ fontSize: 13, color: '#444', flex: 1 }}>
                {r.services?.[0]?.name?.ko || '서비스'}
              </span>
              <span style={{ fontSize: 13, color: '#888' }}>₩{(r.totalPriceKrw||0).toLocaleString()}</span>
              <StatusBadge status={r.status} />
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div>
      <h2 style={{ fontSize: 20, fontWeight: 700, color: '#1a1a1a',
        marginBottom: 24, letterSpacing: -0.5 }}>고객관리</h2>

      {/* 검색 */}
      <div style={{ position: 'relative', marginBottom: 16 }}>
        <input value={query} onChange={e => setQuery(e.target.value)}
          placeholder="🔍  고객 이름 또는 전화번호 검색"
          style={{ width: '100%', padding: '12px 16px', borderRadius: 10,
            border: '1.5px solid #E8E8E8', fontSize: 14, outline: 'none',
            background: '#fff' }} />
      </div>

      <div style={{ background: '#fff', borderRadius: 12, overflow: 'hidden',
        boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
        {list.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 0', color: '#CCC', fontSize: 13 }}>
            고객이 없습니다
          </div>
        ) : list.map((c, i) => (
          <div key={c.id} onClick={() => openDetail(c)}
            style={{ display: 'flex', alignItems: 'center', gap: 16,
              padding: '14px 20px', cursor: 'pointer',
              borderBottom: i < list.length - 1 ? '1px solid #F5F5F5' : 'none',
              transition: 'background 0.1s' }}
            onMouseEnter={e => e.currentTarget.style.background = '#FAFAFA'}
            onMouseLeave={e => e.currentTarget.style.background = '#fff'}>
            <div style={{ width: 36, height: 36, borderRadius: '50%',
              background: '#F0F0F0', display: 'flex', alignItems: 'center',
              justifyContent: 'center', fontSize: 14, fontWeight: 700, color: '#888',
              flexShrink: 0 }}>
              {c.name?.[0] || '?'}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14, fontWeight: 600, color: '#1a1a1a' }}>{c.name}</div>
              <div style={{ fontSize: 12, color: '#aaa', marginTop: 2 }}>
                방문 {c.totalVisits || 0}회 · 최근 {c.lastVisitAt?.split('T')[0] || '-'}
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: '#333' }}>
                ₩{((c.totalSpentKrw||0)/10000).toFixed(0)}만
              </div>
              {c.noshowCount > 0 && (
                <div style={{ fontSize: 11, color: '#E53935', marginTop: 2 }}>
                  노쇼 {c.noshowCount}회
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── 설정 ─────────────────────────────────────────────────────
function SettingsPage({ shop }) {
  const [notifNew, setNotifNew] = useState(true)

  return (
    <div>
      <h2 style={{ fontSize: 20, fontWeight: 700, color: '#1a1a1a',
        marginBottom: 24, letterSpacing: -0.5 }}>설정</h2>

      <Section title="매장 정보">
        <InfoRow label="매장명" value={shop.name} />
        <InfoRow label="지역" value={shop.district} />
        <InfoRow label="영업시간" value="10:00 – 21:00" />
        <InfoRow label="중국어 친화도 점수" value="8.5 / 10" />
        <InfoRow label="알리페이" value="✓ 가능" />
        <InfoRow label="중국어 가능 직원" value="✓ 있음" />
        <InfoRow label="세금환급" value="✓ 택스프리" />
      </Section>

      <Section title="예약 설정">
        <InfoRow label="예약 가능 시간" value="10:00 – 20:00" />
        <InfoRow label="예약 간격" value="30분" />
        <InfoRow label="동시 예약 최대" value="3건" />
        <div style={{ fontSize: 11, color: '#bbb', marginTop: 8, padding: '0 4px' }}>
          * 예약 설정 수정 기능은 v2에서 지원 예정입니다.
        </div>
      </Section>

      <Section title="알림 설정">
        <div style={{ display: 'flex', alignItems: 'center',
          justifyContent: 'space-between', padding: '8px 0' }}>
          <span style={{ fontSize: 14, color: '#444' }}>새 예약 알림</span>
          <Toggle value={notifNew} onChange={setNotifNew} />
        </div>
        <div style={{ display: 'flex', alignItems: 'center',
          justifyContent: 'space-between', padding: '8px 0', opacity: 0.4 }}>
          <span style={{ fontSize: 14, color: '#444' }}>카카오톡 알림 (준비 중)</span>
          <Toggle value={false} onChange={() => {}} />
        </div>
        <div style={{ display: 'flex', alignItems: 'center',
          justifyContent: 'space-between', padding: '8px 0', opacity: 0.4 }}>
          <span style={{ fontSize: 14, color: '#444' }}>SMS 알림 (준비 중)</span>
          <Toggle value={false} onChange={() => {}} />
        </div>
      </Section>
    </div>
  )
}

// ── 공용 작은 컴포넌트들 ──────────────────────────────────────
function ActionBtn({ children, color, onClick }) {
  return (
    <button onClick={onClick}
      style={{ padding: '4px 12px', background: color, color: '#fff',
        border: 'none', borderRadius: 6, fontSize: 12, fontWeight: 600,
        cursor: 'pointer' }}>
      {children}
    </button>
  )
}

function ConfirmModal({ message, onConfirm, onCancel }) {
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
      <div style={{ background: '#fff', borderRadius: 14, padding: '28px 24px',
        width: 320, textAlign: 'center' }}>
        <p style={{ fontSize: 15, color: '#1a1a1a', marginBottom: 20 }}>{message}</p>
        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={onCancel}
            style={{ flex: 1, padding: '12px', background: '#F0F0F0', border: 'none',
              borderRadius: 10, fontSize: 14, fontWeight: 600, cursor: 'pointer', color: '#666' }}>
            취소
          </button>
          <button onClick={onConfirm}
            style={{ flex: 1, padding: '12px', background: '#E53935', border: 'none',
              borderRadius: 10, fontSize: 14, fontWeight: 600, cursor: 'pointer', color: '#fff' }}>
            확인
          </button>
        </div>
      </div>
    </div>
  )
}

function Section({ title, children }) {
  return (
    <div style={{ background: '#fff', borderRadius: 12, padding: 20,
      boxShadow: '0 1px 3px rgba(0,0,0,0.08)', marginBottom: 16 }}>
      <div style={{ fontSize: 12, fontWeight: 700, color: '#aaa',
        letterSpacing: 0.5, textTransform: 'uppercase', marginBottom: 14 }}>{title}</div>
      {children}
    </div>
  )
}

function InfoRow({ label, value }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between',
      padding: '9px 0', borderBottom: '1px solid #F5F5F5' }}>
      <span style={{ fontSize: 14, color: '#888' }}>{label}</span>
      <span style={{ fontSize: 14, color: '#1a1a1a', fontWeight: 500 }}>{value}</span>
    </div>
  )
}

function Toggle({ value, onChange }) {
  return (
    <div onClick={() => onChange(!value)}
      style={{ width: 44, height: 26, borderRadius: 13, cursor: 'pointer',
        background: value ? '#C4725A' : '#DDD', position: 'relative',
        transition: 'background 0.2s' }}>
      <div style={{ position: 'absolute', top: 3, left: value ? 21 : 3,
        width: 20, height: 20, borderRadius: '50%', background: '#fff',
        boxShadow: '0 1px 3px rgba(0,0,0,0.2)', transition: 'left 0.2s' }} />
    </div>
  )
}

const calNavBtn = {
  background: 'none', border: '1.5px solid #E8E8E8', borderRadius: 8,
  width: 32, height: 32, cursor: 'pointer', fontSize: 16, color: '#888',
  display: 'flex', alignItems: 'center', justifyContent: 'center'
}

// ── 메인 앱 ──────────────────────────────────────────────────
export default function AdminApp() {
  const [shop, setShop]   = useState(null)
  const [page, setPage]   = useState('dashboard')
  const [mobile, setMobile] = useState(window.innerWidth < 768)
  const admin = useReservationAdmin(shop?.id || null)

  useEffect(() => {
    const stored = sessionStorage.getItem(ADMIN_KEY)
    if (stored) {
      try { setShop(JSON.parse(stored)) } catch {}
    }
    const onResize = () => setMobile(window.innerWidth < 768)
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  const handleLogin = useCallback((selectedShop) => {
    sessionStorage.setItem(ADMIN_KEY, JSON.stringify(selectedShop))
    setShop(selectedShop)
  }, [])

  const handleLogout = useCallback(() => {
    sessionStorage.removeItem(ADMIN_KEY)
    setShop(null)
  }, [])

  if (!shop) return <LoginScreen onLogin={handleLogin} />

  const renderPage = () => {
    if (page === 'dashboard')    return <Dashboard shop={shop} admin={admin} />
    if (page === 'reservations') return <ReservationsPage admin={admin} />
    if (page === 'customers')    return <CustomersPage admin={admin} />
    if (page === 'settings')     return <SettingsPage shop={shop} />
  }

  return (
    <div style={{ minHeight: '100vh', background: '#F8F8F8',
      fontFamily: "'Pretendard Variable', -apple-system, sans-serif" }}>

      {/* ── 데스크탑 레이아웃 ── */}
      {!mobile && (
        <div style={{ display: 'flex', minHeight: '100vh' }}>

          {/* 사이드바 */}
          <aside style={{ width: 200, background: '#F8F8F8', borderRight: '1px solid #EBEBEB',
            display: 'flex', flexDirection: 'column', position: 'sticky', top: 0,
            height: '100vh', flexShrink: 0 }}>

            <div style={{ padding: '24px 20px 16px' }}>
              <div style={{ fontSize: 20, fontWeight: 800, color: '#C4725A',
                letterSpacing: -0.5 }}>NEAR</div>
              <div style={{ fontSize: 11, color: '#aaa', marginTop: 2 }}>관리자</div>
            </div>

            <nav style={{ flex: 1, padding: '8px 12px' }}>
              {NAV_ITEMS.map(item => (
                <div key={item.id} onClick={() => setPage(item.id)}
                  style={{ display: 'flex', alignItems: 'center', gap: 10,
                    padding: '11px 12px', borderRadius: 8, cursor: 'pointer', marginBottom: 2,
                    borderLeft: page === item.id ? '3px solid #C4725A' : '3px solid transparent',
                    background: page === item.id ? '#FFF0EB' : 'transparent',
                    color: page === item.id ? '#C4725A' : '#666',
                    fontSize: 14, fontWeight: page === item.id ? 700 : 400,
                    transition: 'all 0.15s' }}>
                  <span style={{ fontSize: 16 }}>{item.icon}</span>
                  {item.label}
                </div>
              ))}
            </nav>
          </aside>

          {/* 메인 영역 */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>

            {/* 상단바 */}
            <header style={{ height: 56, background: '#fff', borderBottom: '1px solid #EBEBEB',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '0 28px', position: 'sticky', top: 0, zIndex: 10 }}>
              <span style={{ fontSize: 14, fontWeight: 600, color: '#1a1a1a' }}>
                {shop.name}
              </span>
              <button onClick={handleLogout}
                style={{ fontSize: 13, color: '#888', background: 'none', border: 'none',
                  cursor: 'pointer', padding: '6px 12px', borderRadius: 8,
                  transition: 'background 0.15s' }}
                onMouseEnter={e => e.currentTarget.style.background = '#F0F0F0'}
                onMouseLeave={e => e.currentTarget.style.background = 'none'}>
                로그아웃
              </button>
            </header>

            {/* 콘텐츠 */}
            <main style={{ flex: 1, padding: 28, maxWidth: 1000 }}>
              {renderPage()}
            </main>
          </div>
        </div>
      )}

      {/* ── 모바일 레이아웃 ── */}
      {mobile && (
        <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>

          {/* 모바일 상단바 */}
          <header style={{ height: 52, background: '#fff', borderBottom: '1px solid #EBEBEB',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '0 16px', position: 'sticky', top: 0, zIndex: 10 }}>
            <span style={{ fontSize: 15, fontWeight: 700, color: '#C4725A' }}>NEAR 관리자</span>
            <span style={{ fontSize: 13, color: '#888' }}>{shop.name}</span>
          </header>

          {/* 모바일 콘텐츠 */}
          <main style={{ flex: 1, padding: '20px 16px 80px' }}>
            {renderPage()}
          </main>

          {/* 모바일 하단탭 */}
          <nav style={{ position: 'fixed', bottom: 0, left: 0, right: 0, height: 64,
            background: '#fff', borderTop: '1px solid #EBEBEB',
            display: 'flex', alignItems: 'center' }}>
            {NAV_ITEMS.map(item => (
              <div key={item.id} onClick={() => setPage(item.id)}
                style={{ flex: 1, display: 'flex', flexDirection: 'column',
                  alignItems: 'center', gap: 3, cursor: 'pointer', padding: '8px 0',
                  color: page === item.id ? '#C4725A' : '#aaa' }}>
                <span style={{ fontSize: 20 }}>{item.icon}</span>
                <span style={{ fontSize: 9, fontWeight: page === item.id ? 700 : 400 }}>
                  {item.label}
                </span>
              </div>
            ))}
          </nav>
        </div>
      )}
    </div>
  )
}
