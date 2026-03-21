// BookingView.jsx — 预约 탭 메인 화면
// 매장 리스트 → 서비스 선택 → 날짜/시간 → 결제 확인 → 완료
import { useState, useMemo, useEffect } from 'react'
import { ArrowLeft, CalendarBlank, Clock, Users, CheckCircle, CaretRight, X } from '@phosphor-icons/react'
import { supabase } from '../lib/supabase'

// ─── 브랜드 컬러 ───
const BRAND = '#C4725A'
const BRAND_LIGHT = '#FDF3F1'

// ─── 다국어 ───
const LABEL = {
  title:          { zh: '附近可预约', ko: '예약 가능 매장', en: 'Available Bookings' },
  book_btn:       { zh: '预约 →', ko: '예약하기 →', en: 'Book →' },
  step1_title:    { zh: '选择服务', ko: '서비스 선택', en: 'Select Service' },
  step2_title:    { zh: '选择时间', ko: '시간 선택', en: 'Select Time' },
  step3_title:    { zh: '确认预约', ko: '예약 확인', en: 'Confirm' },
  next:           { zh: '下一步', ko: '다음', en: 'Next' },
  back:           { zh: '返回', ko: '이전', en: 'Back' },
  guests:         { zh: '人数', ko: '인원', en: 'Guests' },
  deposit_label:  { zh: '预约保证金', ko: '예약 보증금', en: 'Deposit' },
  deposit_note:   { zh: '预约保证金为服务费的30%，到店后从总费用中扣除。未到店将不予退还。', ko: '예약 보증금은 서비스 요금의 30%이며, 방문 시 전체 금액에서 차감됩니다. 미방문 시 환불되지 않습니다.', en: 'Deposit is 30% of service fee, deducted on arrival. Non-refundable for no-shows.' },
  alipay:         { zh: '支付宝支付', ko: '알리페이 결제', en: 'Alipay' },
  wechat_pay:     { zh: '微信支付', ko: '위챗페이 결제', en: 'WeChat Pay' },
  cancel_policy:  { zh: '24小时前可免费取消。24小时内取消将扣除保证金。', ko: '24시간 전까지 무료 취소 가능합니다. 24시간 이내 취소 시 보증금이 차감됩니다.', en: 'Free cancellation up to 24h before. Deposit forfeited within 24h.' },
  confirm_ok:     { zh: '预约成功！', ko: '예약 완료!', en: 'Booking Confirmed!' },
  booking_no:     { zh: '预约号', ko: '예약번호', en: 'Booking No.' },
  go_my:          { zh: '查看我的预约', ko: '내 예약 확인', en: 'View My Bookings' },
  go_map:         { zh: '返回地图', ko: '지도로 돌아가기', en: 'Back to Map' },
  empty_shops:    { zh: '暂无可预约门店', ko: '예약 가능한 매장이 없습니다', en: 'No bookable shops' },
  empty_go:       { zh: '浏览地图', ko: '지도 둘러보기', en: 'Browse Map' },
  unavailable:    { zh: '不可预约', ko: '예약불가', en: 'N/A' },
  min:            { zh: '分钟', ko: '분', en: 'min' },
  krw:            { zh: '₩', ko: '₩', en: '₩' },
  cny:            { zh: '¥', ko: '¥', en: '¥' },
  people_unit:    { zh: '人', ko: '명', en: '' },
  pay_sim:        { zh: '支付系统开发中，已为您完成模拟预约。', ko: '결제 시스템 준비 중입니다. 시뮬레이션 예약이 완료되었습니다.', en: 'Payment integration coming soon. Simulated booking confirmed.' },
  deposit_abbr:   { zh: '保证金', ko: '보증금', en: 'Deposit' },
}
function L(lang, obj) { return obj[lang] || obj.zh }

// ─── 카테고리 → 표시 정보 ───
const CATEGORY_INFO = {
  beauty:  { color: '#E8A598', letter: 'H', zh: '美容', ko: '미용' },
  food:    { color: '#EF9F27', letter: 'F', zh: '美食', ko: '음식' },
  fashion: { color: '#7F77DD', letter: 'S', zh: '时尚', ko: '패션' },
  cafe:    { color: '#1D9E75', letter: 'C', zh: '咖啡', ko: '카페' },
  popup:   { color: '#E24B4A', letter: 'P', zh: '快闪店', ko: '팝업' },
  utility: { color: '#888780', letter: 'U', zh: '便利', ko: '편의' },
  kpop:    { color: '#C44FC4', letter: 'K', zh: 'K-POP', ko: 'K팝' },
}

// Supabase popup row → BookingView shop 형식
function normalizeShop(row) {
  const info = CATEGORY_INFO[row.category] || CATEGORY_INFO.beauty
  return {
    id: row.id,
    name_zh: row.name_zh,
    name_ko: row.name_ko || row.name_zh,
    category_zh: info.zh,
    category_ko: info.ko,
    location_zh: row.address_zh || '',
    location_ko: row.address_ko || '',
    color: info.color,
    letter: info.letter,
    open: (row.open_time || '10:00:00').slice(0, 5),
    close: (row.close_time || '20:00:00').slice(0, 5),
    unavailable_slots: [],
    services: [],
  }
}

// Supabase popup_services row → service 형식
function normalizeService(row) {
  return {
    id: row.id,
    name_zh: row.name_zh,
    name_ko: row.name_ko || row.name_zh,
    price_krw: row.price_krw,
    duration_min: row.duration_min,
  }
}

// 디바이스 ID (fingerprint)
function getDeviceId() {
  let id = localStorage.getItem('near_device_id')
  if (!id) {
    id = 'dev_' + crypto.randomUUID()
    localStorage.setItem('near_device_id', id)
  }
  return id
}

// Supabase: 예약 가능 매장 조회
async function fetchBookableShops() {
  const { data, error } = await supabase
    .from('popups')
    .select('*')
    .eq('has_reservation', true)
    .order('district')
  if (error) { console.error('fetchBookableShops:', error); return null }
  return data.map(normalizeShop)
}

// Supabase: 매장 서비스 조회
async function fetchServices(popupId) {
  const { data, error } = await supabase
    .from('popup_services')
    .select('*')
    .eq('popup_id', popupId)
    .eq('is_active', true)
    .order('sort_order')
  if (error) { console.error('fetchServices:', error); return null }
  return data.map(normalizeService)
}

// Supabase: 예약 생성 (localStorage 병행)
async function createBooking(booking) {
  saveToLocalStorage(booking)  // 항상 localStorage에도 저장
  const { data, error } = await supabase
    .from('bookings')
    .insert({
      booking_number: booking.id,
      popup_id: booking.shopId,
      service_id: booking.serviceId || null,
      device_id: getDeviceId(),
      booking_date: booking.date,
      booking_time: booking.time,
      guests: booking.guests,
      deposit_krw: booking.deposit,
      total_krw: booking.totalPrice || booking.deposit,
      payment_method: booking.payMethod,
      payment_status: 'pending',
      status: 'pending',
    })
    .select()
    .single()
  if (error) { console.error('createBooking:', error); return null }
  return data
}

// Supabase: 내 예약 조회
async function fetchMyBookings() {
  const deviceId = getDeviceId()
  const { data, error } = await supabase
    .from('bookings')
    .select('*, popups(name_zh, name_ko, address_zh, address_ko), popup_services(name_zh, name_ko)')
    .eq('device_id', deviceId)
    .order('booking_date', { ascending: false })
  if (error) { console.error('fetchMyBookings:', error); return null }
  return data.map(row => ({
    id: row.booking_number || row.id,
    dbId: row.id,
    shopName: row.popups?.name_ko || row.popups?.name_zh || '',
    service: row.popup_services?.name_ko || row.popup_services?.name_zh || '',
    date: row.booking_date,
    time: (row.booking_time || '').slice(0, 5),
    guests: row.guests || 1,
    deposit: row.deposit_krw || 0,
    depositCny: Math.round((row.deposit_krw || 0) / 195),
    payMethod: row.payment_method || '',
    status: row.status || 'confirmed',
    createdAt: row.created_at,
  }))
}

// Supabase: 예약 취소
async function cancelBookingDb(dbId) {
  const { error } = await supabase
    .from('bookings')
    .update({ status: 'cancelled', cancelled_at: new Date().toISOString() })
    .eq('id', dbId)
  if (error) { console.error('cancelBookingDb:', error); return false }
  return true
}

// ─── Mock 매장 데이터 (fallback) ───
const SHOPS_FALLBACK = [
  {
    id: 'shop-001',
    name_zh: '圣水洞 美容院',
    name_ko: '성수동 뷰티살롱',
    category_zh: '美容 · 发型',
    category_ko: '미용 · 헤어',
    location_zh: '首尔市城东区圣水洞2街',
    location_ko: '서울 성동구 성수동2가',
    color: '#E8A598',
    letter: 'H',
    services: [
      { id: 's1', name_zh: '基础剪发', name_ko: '기본 커트', price_krw: 30000, duration_min: 40 },
      { id: 's2', name_zh: '全头染发', name_ko: '전체 염색', price_krw: 80000, duration_min: 90 },
      { id: 's3', name_zh: '头皮护理', name_ko: '두피 클리닉', price_krw: 55000, duration_min: 60 },
    ],
    open: '10:00', close: '20:00',
    unavailable_slots: ['10:30', '12:00', '14:00', '15:30', '18:00'],
  },
  {
    id: 'shop-002',
    name_zh: '弘大 皮肤管理',
    name_ko: '홍대 피부관리',
    category_zh: '皮肤管理',
    category_ko: '피부 관리',
    location_zh: '首尔市麻浦区弘益洞',
    location_ko: '서울 마포구 홍익동',
    color: '#9B7EA8',
    letter: 'S',
    services: [
      { id: 's4', name_zh: '基础护理', name_ko: '기초 케어', price_krw: 50000, duration_min: 60 },
      { id: 's5', name_zh: '水润补水护理', name_ko: '수분 집중 케어', price_krw: 75000, duration_min: 75 },
      { id: 's6', name_zh: '提拉紧致护理', name_ko: '리프팅 케어', price_krw: 120000, duration_min: 90 },
    ],
    open: '10:00', close: '21:00',
    unavailable_slots: ['11:00', '13:30', '16:00', '19:00'],
  },
  {
    id: 'shop-003',
    name_zh: '江南 美甲店',
    name_ko: '강남 네일샵',
    category_zh: '美甲',
    category_ko: '네일',
    location_zh: '首尔市江南区论峴洞',
    location_ko: '서울 강남구 논현동',
    color: '#7BAED6',
    letter: 'N',
    services: [
      { id: 's7', name_zh: '基础美甲', name_ko: '기본 네일', price_krw: 25000, duration_min: 45 },
      { id: 's8', name_zh: '凝胶美甲', name_ko: '젤 네일', price_krw: 45000, duration_min: 60 },
      { id: 's9', name_zh: '艺术美甲', name_ko: '네일 아트', price_krw: 65000, duration_min: 80 },
    ],
    open: '10:00', close: '20:00',
    unavailable_slots: ['10:00', '12:30', '15:00', '17:00', '19:30'],
  },
]

// ─── 유틸 ───
function krwToCny(krw) { return Math.round(krw / 195) }

function generateTimeSlots(openTime, closeTime) {
  const slots = []
  const [oh, om] = openTime.split(':').map(Number)
  const [ch, cm] = closeTime.split(':').map(Number)
  let cur = oh * 60 + om
  const end = ch * 60 + cm
  while (cur < end) {
    const h = String(Math.floor(cur / 60)).padStart(2, '0')
    const m = String(cur % 60).padStart(2, '0')
    slots.push(`${h}:${m}`)
    cur += 30
  }
  return slots
}

function getNext7Days() {
  const days = []
  const DAY_NAMES = { zh: ['日','一','二','三','四','五','六'], ko: ['일','월','화','수','목','금','토'], en: ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'] }
  for (let i = 0; i < 7; i++) {
    const d = new Date()
    d.setDate(d.getDate() + i)
    days.push({
      date: d.toISOString().slice(0, 10),
      day: d.getDate(),
      weekday: DAY_NAMES,
      dow: d.getDay(),
    })
  }
  return days
}

function genBookingId() {
  const now = new Date()
  const yy = String(now.getFullYear()).slice(2)
  const mm = String(now.getMonth() + 1).padStart(2, '0')
  const dd = String(now.getDate()).padStart(2, '0')
  const seq = String(Math.floor(Math.random() * 900) + 100)
  return `NEAR-${yy}${mm}${dd}-${seq}`
}

function saveToLocalStorage(booking) {
  const raw = localStorage.getItem('near_bookings_v2')
  const list = raw ? JSON.parse(raw) : []
  list.unshift(booking)
  localStorage.setItem('near_bookings_v2', JSON.stringify(list))
}

// ─── 서브 컴포넌트: 매장 카드 ───
function ShopCard({ shop, lang, onBook }) {
  const nameKey = lang === 'ko' ? 'name_ko' : 'name_zh'
  const catKey = lang === 'ko' ? 'category_ko' : 'category_zh'
  const locKey = lang === 'ko' ? 'location_ko' : 'location_zh'
  return (
    <div style={{ background: 'white', borderRadius: 'var(--radius-card)', boxShadow: 'var(--shadow-card)', padding: '20px', display: 'flex', gap: 14, alignItems: 'flex-start', border: '1px solid var(--border)' }}>
      {/* 이미지/아이콘 */}
      <div style={{ width: 56, height: 56, borderRadius: 12, background: shop.color, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <span style={{ fontSize: 20, fontWeight: 800, color: 'white' }}>{shop.letter}</span>
      </div>
      {/* 정보 */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 3 }}>{shop[nameKey]}</div>
        <div style={{ fontSize: 13, color: BRAND, fontWeight: 600, marginBottom: 4 }}>{shop[catKey]}</div>
        <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>{shop[locKey]}</div>
      </div>
      {/* 예약 버튼 */}
      <button onClick={() => onBook(shop)} style={{ flexShrink: 0, background: BRAND_LIGHT, border: 'none', borderRadius: 'var(--radius-btn)', padding: '8px 14px', fontSize: 13, fontWeight: 700, color: BRAND, cursor: 'pointer', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: 2 }}>
        {L(lang, LABEL.book_btn)}
      </button>
    </div>
  )
}

// ─── Step 1: 서비스 선택 ───
function StepService({ shop, services, servicesLoading, lang, onSelect, onBack }) {
  const [selected, setSelected] = useState(null)
  const nameKey = lang === 'ko' ? 'name_ko' : 'name_zh'
  const shopNameKey = lang === 'ko' ? 'name_ko' : 'name_zh'
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <StepHeader title={L(lang, LABEL.step1_title)} subtitle={shop[shopNameKey]} onBack={onBack} />
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px 20px' }}>
        {servicesLoading ? (
          <div style={{ textAlign: 'center', paddingTop: 60, color: 'var(--text-muted)', fontSize: 15 }}>加载中...</div>
        ) : services.map(svc => (
          <button key={svc.id} onClick={() => setSelected(svc)}
            style={{ width: '100%', display: 'flex', alignItems: 'center', padding: '16px 16px', marginBottom: 12, background: selected?.id === svc.id ? BRAND_LIGHT : 'white', border: selected?.id === svc.id ? `1.5px solid ${BRAND}` : '1px solid var(--border)', borderRadius: 'var(--radius-card)', cursor: 'pointer', gap: 12, textAlign: 'left', transition: 'all 0.15s' }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>{svc[nameKey]}</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 13, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 3 }}>
                  <Clock size={12} /> {svc.duration_min}{L(lang, LABEL.min)}
                </span>
              </div>
            </div>
            <div style={{ textAlign: 'right', flexShrink: 0 }}>
              <div style={{ fontSize: 15, fontWeight: 800, color: 'var(--text-primary)' }}>{L(lang, LABEL.krw)}{svc.price_krw.toLocaleString()}</div>
              <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 2 }}>≈ {L(lang, LABEL.cny)}{krwToCny(svc.price_krw)}</div>
            </div>
            {selected?.id === svc.id && <CheckCircle size={20} weight="fill" style={{ color: BRAND, flexShrink: 0 }} />}
          </button>
        ))}
      </div>
      <div style={{ padding: '12px 20px', background: 'white', borderTop: '1px solid var(--border)' }}>
        <button disabled={!selected} onClick={() => onSelect(selected)}
          style={{ width: '100%', height: 50, borderRadius: 14, background: selected ? BRAND : '#E5E7EB', color: 'white', fontSize: 16, fontWeight: 700, border: 'none', cursor: selected ? 'pointer' : 'not-allowed', transition: 'background 0.2s' }}>
          {L(lang, LABEL.next)}
        </button>
      </div>
    </div>
  )
}

// ─── Step 2: 날짜/시간/인원 ───
function StepDateTime({ shop, service, lang, onConfirm, onBack }) {
  const days = useMemo(() => getNext7Days(), [])
  const [selDate, setSelDate] = useState(days[0].date)
  const [selTime, setSelTime] = useState(null)
  const [guests, setGuests] = useState(1)
  const slots = useMemo(() => generateTimeSlots(shop.open, shop.close), [shop])
  const DAY_KO = ['일','월','화','수','목','금','토']
  const DAY_ZH = ['日','一','二','三','四','五','六']
  const DAY_EN = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat']
  function getDayLabel(dow) {
    if (lang === 'ko') return DAY_KO[dow]
    if (lang === 'en') return DAY_EN[dow]
    return DAY_ZH[dow]
  }
  const shopNameKey = lang === 'ko' ? 'name_ko' : 'name_zh'
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <StepHeader title={L(lang, LABEL.step2_title)} subtitle={shop[shopNameKey]} onBack={onBack} />
      <div style={{ flex: 1, overflowY: 'auto', padding: '20px 20px 20px' }}>
        {/* 날짜 선택 */}
        <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 10 }}>{lang === 'ko' ? '날짜' : lang === 'zh' ? '选择日期' : 'Date'}</div>
        <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 8, marginBottom: 20 }}>
          {days.map(d => (
            <button key={d.date} onClick={() => { setSelDate(d.date); setSelTime(null) }}
              style={{ flexShrink: 0, minWidth: 48, padding: '8px 4px', borderRadius: 12, border: selDate === d.date ? `1.5px solid ${BRAND}` : '1px solid var(--border)', background: selDate === d.date ? BRAND : 'white', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, transition: 'all 0.15s' }}>
              <span style={{ fontSize: 10, fontWeight: 600, color: selDate === d.date ? 'rgba(255,255,255,0.8)' : 'var(--text-muted)' }}>{getDayLabel(d.dow)}</span>
              <span style={{ fontSize: 16, fontWeight: 800, color: selDate === d.date ? 'white' : 'var(--text-primary)' }}>{d.day}</span>
            </button>
          ))}
        </div>
        {/* 시간 슬롯 */}
        <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 10 }}>{lang === 'ko' ? '시간' : lang === 'zh' ? '选择时间' : 'Time'}</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8, marginBottom: 24 }}>
          {slots.map(slot => {
            const unavail = shop.unavailable_slots.includes(slot)
            const active = selTime === slot
            return (
              <button key={slot} disabled={unavail} onClick={() => setSelTime(slot)}
                style={{ padding: '10px 4px', borderRadius: 10, fontSize: 13, fontWeight: 600, border: active ? `1.5px solid ${BRAND}` : '1px solid var(--border)', background: unavail ? 'var(--surface)' : active ? BRAND : 'white', color: unavail ? 'var(--text-hint)' : active ? 'white' : 'var(--text-primary)', cursor: unavail ? 'not-allowed' : 'pointer', textDecoration: unavail ? 'line-through' : 'none', transition: 'all 0.15s' }}>
                {slot}
              </button>
            )
          })}
        </div>
        {/* 인원 */}
        <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 12 }}>{L(lang, LABEL.guests)}</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 4 }}>
          <button onClick={() => setGuests(g => Math.max(1, g - 1))}
            style={{ width: 36, height: 36, borderRadius: '50%', border: '1.5px solid var(--border)', background: 'white', fontSize: 20, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, color: 'var(--text-primary)' }}>−</button>
          <span style={{ fontSize: 20, fontWeight: 800, minWidth: 24, textAlign: 'center' }}>{guests}</span>
          <button onClick={() => setGuests(g => Math.min(10, g + 1))}
            style={{ width: 36, height: 36, borderRadius: '50%', border: '1.5px solid var(--border)', background: 'white', fontSize: 20, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, color: 'var(--text-primary)' }}>+</button>
          <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>{guests}{L(lang, LABEL.people_unit)}</span>
        </div>
      </div>
      <div style={{ padding: '12px 20px', background: 'white', borderTop: '1px solid var(--border)' }}>
        <button disabled={!selTime} onClick={() => onConfirm({ date: selDate, time: selTime, guests })}
          style={{ width: '100%', height: 50, borderRadius: 14, background: selTime ? BRAND : '#E5E7EB', color: 'white', fontSize: 16, fontWeight: 700, border: 'none', cursor: selTime ? 'pointer' : 'not-allowed', transition: 'background 0.2s' }}>
          {L(lang, LABEL.next)}
        </button>
      </div>
    </div>
  )
}

// ─── Step 3: 확인 + 결제 ───
function StepConfirm({ shop, service, dateTime, lang, onPay, onBack }) {
  const [showNote, setShowNote] = useState(false)
  const deposit = Math.round(service.price_krw * 0.3)
  const depositCny = krwToCny(deposit)
  const shopNameKey = lang === 'ko' ? 'name_ko' : 'name_zh'
  const svcNameKey = lang === 'ko' ? 'name_ko' : 'name_zh'
  function handlePay(method) {
    const id = genBookingId()
    const booking = {
      id,
      shopId: shop.id,
      shopName: shop[shopNameKey],
      serviceId: service.id,
      service: service[svcNameKey],
      date: dateTime.date,
      time: dateTime.time,
      guests: dateTime.guests,
      deposit,
      depositCny,
      totalPrice: service.price_krw,
      payMethod: method,
      status: 'confirmed',
      createdAt: new Date().toISOString(),
    }
    createBooking(booking)  // Supabase + localStorage 동시 저장
    onPay(booking)
  }
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <StepHeader title={L(lang, LABEL.step3_title)} subtitle={shop[shopNameKey]} onBack={onBack} />
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px 16px' }}>
        {/* 예약 요약 */}
        <div style={{ background: 'var(--surface)', borderRadius: 'var(--radius-card)', padding: '20px', marginBottom: 16, border: '1px solid var(--border)' }}>
          <Row label={lang === 'ko' ? '매장' : lang === 'zh' ? '门店' : 'Shop'} value={shop[shopNameKey]} />
          <Row label={lang === 'ko' ? '서비스' : lang === 'zh' ? '服务' : 'Service'} value={service[svcNameKey]} />
          <Row label={lang === 'ko' ? '날짜' : lang === 'zh' ? '日期' : 'Date'} value={dateTime.date} />
          <Row label={lang === 'ko' ? '시간' : lang === 'zh' ? '时间' : 'Time'} value={dateTime.time} />
          <Row label={L(lang, LABEL.guests)} value={`${dateTime.guests}${L(lang, LABEL.people_unit)}`} />
          <div style={{ borderTop: '1px solid var(--border)', margin: '12px 0 8px' }} />
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>{L(lang, LABEL.deposit_abbr)}</span>
            <div style={{ textAlign: 'right' }}>
              <span style={{ fontSize: 16, fontWeight: 800, color: BRAND }}>₩{deposit.toLocaleString()}</span>
              <span style={{ fontSize: 13, color: 'var(--text-muted)', marginLeft: 6 }}>≈ ¥{depositCny}</span>
            </div>
          </div>
        </div>
        {/* 보증금 안내 토글 */}
        <button onClick={() => setShowNote(v => !v)}
          style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', background: '#FEF3C7', borderRadius: 10, border: 'none', cursor: 'pointer', marginBottom: showNote ? 0 : 16 }}>
          <span style={{ fontSize: 12, fontWeight: 700, color: '#92400E' }}>{L(lang, LABEL.deposit_label)}</span>
          <CaretRight size={14} style={{ color: '#92400E', transform: showNote ? 'rotate(90deg)' : 'none', transition: 'transform 0.2s' }} />
        </button>
        {showNote && (
          <div style={{ background: '#FFFBEB', padding: '10px 14px', borderRadius: '0 0 10px 10px', marginBottom: 16, border: '1px solid #FDE68A', borderTop: 'none' }}>
            <p style={{ fontSize: 11, color: '#78350F', lineHeight: 1.6, margin: 0 }}>{L(lang, LABEL.deposit_note)}</p>
          </div>
        )}
        {/* 결제 버튼 */}
        <button onClick={() => handlePay('alipay')}
          style={{ width: '100%', height: 50, borderRadius: 14, background: '#1677FF', color: 'white', fontSize: 15, fontWeight: 700, border: 'none', cursor: 'pointer', marginBottom: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
          <span style={{ fontSize: 16 }}>💙</span> {L(lang, LABEL.alipay)}
        </button>
        <button onClick={() => handlePay('wechat')}
          style={{ width: '100%', height: 50, borderRadius: 14, background: '#07C160', color: 'white', fontSize: 15, fontWeight: 700, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
          <span style={{ fontSize: 16 }}>💚</span> {L(lang, LABEL.wechat_pay)}
        </button>
      </div>
      <div style={{ padding: '8px 16px 12px', textAlign: 'center' }}>
        <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: 0, lineHeight: 1.5 }}>{L(lang, LABEL.cancel_policy)}</p>
      </div>
    </div>
  )
}

// ─── 완료 화면 ───
function ConfirmDone({ booking, lang, onGoMy, onGoMap }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '48px 24px', textAlign: 'center', flex: 1 }}>
      <div style={{ width: 72, height: 72, borderRadius: '50%', background: '#DCFCE7', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>
        <CheckCircle size={44} weight="fill" style={{ color: '#16A34A' }} />
      </div>
      <h2 style={{ fontSize: 22, fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 8px' }}>{L(lang, LABEL.confirm_ok)}</h2>
      <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 4 }}>{L(lang, LABEL.booking_no)}</p>
      <p style={{ fontSize: 16, fontWeight: 700, color: BRAND, marginBottom: 24, letterSpacing: '0.5px' }}>{booking.id}</p>
      <div style={{ background: 'var(--surface)', borderRadius: 'var(--radius-card)', padding: '20px', width: '100%', marginBottom: 24, border: '1px solid var(--border)', textAlign: 'left' }}>
        <Row label={lang === 'ko' ? '매장' : lang === 'zh' ? '门店' : 'Shop'} value={booking.shopName} />
        <Row label={lang === 'ko' ? '서비스' : lang === 'zh' ? '服务' : 'Service'} value={booking.service} />
        <Row label={lang === 'ko' ? '일시' : lang === 'zh' ? '日期时间' : 'DateTime'} value={`${booking.date} ${booking.time}`} />
        <Row label={L(lang, LABEL.deposit_abbr)} value={`₩${booking.deposit.toLocaleString()} (≈¥${booking.depositCny})`} />
      </div>
      <button onClick={onGoMy}
        style={{ width: '100%', height: 50, borderRadius: 14, background: BRAND, color: 'white', fontSize: 15, fontWeight: 700, border: 'none', cursor: 'pointer', marginBottom: 10 }}>
        {L(lang, LABEL.go_my)}
      </button>
      <button onClick={onGoMap}
        style={{ width: '100%', height: 50, borderRadius: 'var(--radius-btn)', background: 'white', color: 'var(--text-primary)', fontSize: 15, fontWeight: 600, border: '1.5px solid var(--border)', cursor: 'pointer' }}>
        {L(lang, LABEL.go_map)}
      </button>
    </div>
  )
}

// ─── 공통 헤더 ───
function StepHeader({ title, subtitle, onBack }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '14px 20px 12px', borderBottom: '1px solid var(--border)', background: 'white', flexShrink: 0 }}>
      <button onClick={onBack} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, color: 'var(--text-primary)', display: 'flex', borderRadius: 8 }}>
        <ArrowLeft size={22} weight="bold" />
      </button>
      <div>
        <div style={{ fontSize: 17, fontWeight: 700, color: 'var(--text-primary)' }}>{title}</div>
        {subtitle && <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 2 }}>{subtitle}</div>}
      </div>
    </div>
  )
}

// ─── 공통 Row ───
function Row({ label, value }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', padding: '5px 0' }}>
      <span style={{ fontSize: 13, color: 'var(--text-muted)', flexShrink: 0, marginRight: 8 }}>{label}</span>
      <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', textAlign: 'right' }}>{value}</span>
    </div>
  )
}

// ─── 내 예약 화면 (3탭: 即将/完成/取消) ───
function MyBookings({ lang, onBack, onGoToMapTab }) {
  const [filter, setFilter] = useState('upcoming')
  const [bookings, setBookings] = useState(() => {
    try { return JSON.parse(localStorage.getItem('near_bookings_v2') || '[]') } catch { return [] }
  })
  const [dbLoading, setDbLoading] = useState(true)

  // Supabase에서 내 예약 로드 (localStorage와 병합)
  useEffect(() => {
    fetchMyBookings().then(dbRows => {
      if (dbRows && dbRows.length > 0) {
        setBookings(dbRows)
      }
      setDbLoading(false)
    }).catch(() => setDbLoading(false))
  }, [])

  const FILTERS = [
    { id: 'upcoming',  label: { zh: '即将到来', ko: '예정', en: 'Upcoming' } },
    { id: 'done',      label: { zh: '已完成',   ko: '완료', en: 'Done' } },
    { id: 'cancelled', label: { zh: '已取消',   ko: '취소', en: 'Cancelled' } },
  ]

  const isCancellable = (b) => {
    const dt = new Date(`${b.date}T${b.time}`)
    return dt - new Date() > 24 * 60 * 60 * 1000
  }

  const cancelBooking = async (b) => {
    // Supabase 취소 (dbId 있으면)
    if (b.dbId) await cancelBookingDb(b.dbId)
    // localStorage 취소
    const stored = JSON.parse(localStorage.getItem('near_bookings_v2') || '[]')
    const updatedStored = stored.map(s => s.id === b.id ? { ...s, status: 'cancelled' } : s)
    localStorage.setItem('near_bookings_v2', JSON.stringify(updatedStored))
    // UI 업데이트
    setBookings(prev => prev.map(p => p.id === b.id ? { ...p, status: 'cancelled' } : p))
  }

  const filtered = bookings.filter(b => {
    if (filter === 'upcoming') return b.status === 'confirmed' || b.status === 'upcoming'
    if (filter === 'done') return b.status === 'done' || b.status === 'completed'
    return b.status === 'cancelled'
  })

  const StatusBadge = ({ status }) => {
    const MAP = {
      confirmed: ['#DCFCE7', '#16A34A', { zh: '待使用', ko: '예정', en: 'Upcoming' }],
      upcoming:  ['#DCFCE7', '#16A34A', { zh: '待使用', ko: '예정', en: 'Upcoming' }],
      done:      ['#F3F4F6', '#9CA3AF', { zh: '已完成', ko: '완료', en: 'Done' }],
      cancelled: ['#FEE2E2', '#DC2626', { zh: '已取消', ko: '취소', en: 'Cancelled' }],
    }
    const [bg, color, label] = MAP[status] || MAP.done
    return <span style={{ fontSize: 10, fontWeight: 700, borderRadius: 6, padding: '3px 8px', background: bg, color }}>{L(lang, label)}</span>
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: 'var(--surface)' }}>
      <StepHeader
        title={lang === 'zh' ? '我的预约' : lang === 'ko' ? '내 예약' : 'My Bookings'}
        onBack={onBack}
      />
      {/* 필터 탭 */}
      <div style={{ display: 'flex', gap: 6, padding: '12px 20px 10px', background: 'white', borderBottom: '1px solid var(--border)' }}>
        {FILTERS.map(f => (
          <button key={f.id} onClick={() => setFilter(f.id)}
            style={{ padding: '6px 16px', borderRadius: 20, fontSize: 13, fontWeight: 600, background: filter === f.id ? 'var(--text-primary)' : 'var(--surface)', color: filter === f.id ? 'white' : 'var(--text-secondary)', border: 'none', cursor: 'pointer', transition: 'all 0.15s' }}>
            {L(lang, f.label)}
          </button>
        ))}
      </div>
      {/* 예약 리스트 */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px' }}>
        {filtered.length === 0 ? (
          <div style={{ textAlign: 'center', paddingTop: 60 }}>
            <CalendarBlank size={40} style={{ color: 'var(--text-hint)', marginBottom: 12 }} />
            <p style={{ fontSize: 15, color: 'var(--text-muted)', marginBottom: 16 }}>
              {lang === 'zh' ? '还没有预约记录' : lang === 'ko' ? '예약 내역이 없습니다' : 'No bookings yet'}
            </p>
            <button onClick={onBack}
              style={{ padding: '10px 24px', borderRadius: 'var(--radius-btn)', background: BRAND, color: 'white', border: 'none', fontSize: 14, fontWeight: 700, cursor: 'pointer' }}>
              {lang === 'zh' ? '去预约 →' : lang === 'ko' ? '예약하러 가기 →' : 'Book now →'}
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {filtered.map(b => (
              <div key={b.id} style={{ background: 'white', borderRadius: 'var(--radius-card)', padding: '20px', border: '1px solid var(--border)', boxShadow: 'var(--shadow-card)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                  <div>
                    <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 3 }}>{b.shopName}</div>
                    <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{b.service}</div>
                  </div>
                  <StatusBadge status={b.status} />
                </div>
                <div style={{ display: 'flex', gap: 16, fontSize: 13, color: 'var(--text-muted)', marginBottom: 10 }}>
                  <span>📅 {b.date}</span>
                  <span>⏰ {b.time}</span>
                  <span>👥 {b.guests}{lang === 'zh' ? '人' : lang === 'ko' ? '명' : ''}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 10, borderTop: '1px solid var(--border)' }}>
                  <div>
                    <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>{lang === 'zh' ? '保证金' : lang === 'ko' ? '보증금' : 'Deposit'}: </span>
                    <span style={{ fontSize: 14, fontWeight: 700, color: BRAND }}>₩{b.deposit?.toLocaleString()}</span>
                    <span style={{ fontSize: 13, color: 'var(--text-muted)', marginLeft: 4 }}>≈¥{b.depositCny}</span>
                  </div>
                  {(b.status === 'confirmed' || b.status === 'upcoming') && isCancellable(b) && (
                    <button onClick={() => cancelBooking(b)}
                      style={{ fontSize: 13, color: '#EF4444', background: '#FEF2F2', border: 'none', borderRadius: 8, padding: '5px 12px', cursor: 'pointer', fontWeight: 600 }}>
                      {lang === 'zh' ? '取消预约' : lang === 'ko' ? '취소' : 'Cancel'}
                    </button>
                  )}
                  {(b.status === 'confirmed' || b.status === 'upcoming') && !isCancellable(b) && (
                    <span style={{ fontSize: 11, color: 'var(--text-hint)' }}>{lang === 'zh' ? '不可取消' : lang === 'ko' ? '취소불가' : 'N/A'}</span>
                  )}
                </div>
                <div style={{ fontSize: 11, color: 'var(--text-hint)', marginTop: 8, letterSpacing: '0.3px' }}>{b.id}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

// ─── 메인 BookingView ───
export default function BookingView({ lang, onGoToMyTab, onGoToMapTab }) {
  const [screen, setScreen] = useState('list')
  const [selectedShop, setSelectedShop] = useState(null)
  const [selectedService, setSelectedService] = useState(null)
  const [selectedDateTime, setSelectedDateTime] = useState(null)
  const [doneBooking, setDoneBooking] = useState(null)
  const [shops, setShops] = useState(SHOPS_FALLBACK)
  const [shopsLoading, setShopsLoading] = useState(true)
  const [currentServices, setCurrentServices] = useState([])
  const [servicesLoading, setServicesLoading] = useState(false)

  // 매장 목록 DB 로드
  useEffect(() => {
    fetchBookableShops().then(data => {
      if (data && data.length > 0) setShops(data)
      setShopsLoading(false)
    }).catch(() => setShopsLoading(false))
  }, [])

  async function handleBook(shop) {
    setSelectedShop(shop)
    setScreen('step1')
    setServicesLoading(true)
    const svcs = await fetchServices(shop.id).catch(() => null)
    setCurrentServices(svcs && svcs.length > 0 ? svcs : (shop.services || []))
    setServicesLoading(false)
  }

  function handleServiceSelect(svc) {
    setSelectedService(svc)
    setScreen('step2')
  }

  function handleDateTimeConfirm(dt) {
    setSelectedDateTime(dt)
    setScreen('step3')
  }

  function handlePay(booking) {
    setDoneBooking(booking)
    setScreen('done')
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: 'var(--surface)', fontFamily: '"Noto Sans SC", Pretendard, Inter, sans-serif' }}>
      {screen === 'list' && (
        <>
          {/* 헤더 */}
          <div style={{ padding: '20px 20px 16px', background: 'white', borderBottom: '1px solid var(--border)', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <h1 style={{ fontSize: 22, fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>{L(lang, LABEL.title)}</h1>
            <button onClick={() => setScreen('my-bookings')}
              style={{ fontSize: 13, fontWeight: 600, color: BRAND, background: BRAND_LIGHT, border: 'none', borderRadius: 'var(--radius-btn)', padding: '7px 14px', cursor: 'pointer' }}>
              {lang === 'zh' ? '我的预约' : lang === 'ko' ? '내 예약' : 'My Bookings'}
            </button>
          </div>
          {/* 매장 리스트 */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '20px 20px' }}>
            {shopsLoading ? (
              <div style={{ textAlign: 'center', paddingTop: 80, color: 'var(--text-muted)', fontSize: 15 }}>加载中...</div>
            ) : shops.length === 0 ? (
              <div style={{ textAlign: 'center', paddingTop: 80 }}>
                <CalendarBlank size={40} style={{ color: 'var(--text-hint)', marginBottom: 12 }} />
                <p style={{ fontSize: 15, color: 'var(--text-muted)', marginBottom: 16 }}>{L(lang, LABEL.empty_shops)}</p>
                <button onClick={onGoToMapTab} style={{ padding: '10px 24px', borderRadius: 'var(--radius-btn)', background: BRAND, color: 'white', border: 'none', fontSize: 14, fontWeight: 700, cursor: 'pointer' }}>
                  {L(lang, LABEL.empty_go)}
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {shops.map(shop => (
                  <ShopCard key={shop.id} shop={shop} lang={lang} onBook={handleBook} />
                ))}
              </div>
            )}
          </div>
        </>
      )}

      {screen === 'my-bookings' && (
        <MyBookings lang={lang} onBack={() => setScreen('list')} onGoToMapTab={onGoToMapTab} />
      )}

      {screen === 'step1' && selectedShop && (
        <StepService shop={selectedShop} services={currentServices} servicesLoading={servicesLoading} lang={lang} onSelect={handleServiceSelect} onBack={() => setScreen('list')} />
      )}

      {screen === 'step2' && selectedShop && selectedService && (
        <StepDateTime shop={selectedShop} service={selectedService} lang={lang} onConfirm={handleDateTimeConfirm} onBack={() => setScreen('step1')} />
      )}

      {screen === 'step3' && selectedShop && selectedService && selectedDateTime && (
        <StepConfirm shop={selectedShop} service={selectedService} dateTime={selectedDateTime} lang={lang} onPay={handlePay} onBack={() => setScreen('step2')} />
      )}

      {screen === 'done' && doneBooking && (
        <div style={{ display: 'flex', flexDirection: 'column', flex: 1, overflowY: 'auto' }}>
          <ConfirmDone booking={doneBooking} lang={lang} onGoMy={() => setScreen('my-bookings')} onGoMap={onGoToMapTab} />
        </div>
      )}
    </div>
  )
}
