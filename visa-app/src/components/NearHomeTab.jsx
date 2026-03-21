/**
 * NearHomeTab — NEAR 앱 홈 탭 (首页)
 * 인사 + 검색바 + 퀵 액션 + 최근 예약 + 추천 매장
 */
import { useState } from 'react'
import { Search, MapPin, Calendar, Car, Phone, ChevronRight, Clock, Star } from 'lucide-react'

function L(lang, d) { return d?.[lang] || d?.zh || d?.ko || d?.en || '' }

const QUICK_ACTIONS = [
  {
    id: 'beauty',
    icon: Calendar,
    bg: '#FDF3F1',
    color: '#C4725A',
    label: { zh: '美容预约', ko: '뷰티 예약', en: 'Beauty Book' },
    action: 'booking',
  },
  {
    id: 'taxi',
    icon: Car,
    bg: '#FFF9E6',
    color: '#F9A825',
    label: { zh: '叫出租车', ko: '택시', en: 'Taxi' },
    action: 'taxi',
  },
  {
    id: 'explore',
    icon: MapPin,
    bg: '#EDF5FF',
    color: '#007AFF',
    label: { zh: '周边探索', ko: '주변 탐색', en: 'Explore' },
    action: 'discover',
  },
  {
    id: 'sos',
    icon: Phone,
    bg: '#FFF0F0',
    color: '#FF3B30',
    label: { zh: '紧急电话', ko: '긴급 전화', en: 'Emergency' },
    action: 'sos',
  },
]

const RECOMMENDED = [
  { id: 1, name: { zh: 'HERA Beauty Lounge', ko: 'HERA 뷰티 라운지', en: 'HERA Beauty Lounge' }, category: { zh: '美容院', ko: '미용실', en: 'Beauty' }, rating: 4.9, tag: { zh: '微信支付', ko: '위챗페이', en: 'WeChat Pay' }, tagColor: '#34C759' },
  { id: 2, name: { zh: '明洞美发', ko: '명동 헤어', en: 'Myeongdong Hair' }, category: { zh: '美发', ko: '헤어샵', en: 'Hair' }, rating: 4.7, tag: { zh: '支付宝', ko: '알리페이', en: 'Alipay' }, tagColor: '#007AFF' },
  { id: 3, name: { zh: '江南皮肤科', ko: '강남 피부과', en: 'Gangnam Skin' }, category: { zh: '皮肤科', ko: '피부과', en: 'Skincare' }, rating: 4.8, tag: { zh: '中文服务', ko: '중국어 가능', en: 'Chinese OK' }, tagColor: '#C4725A' },
]

const SOS_NUMBERS = [
  { label: { zh: '报警', ko: '경찰', en: 'Police' }, num: '112' },
  { label: { zh: '急救', ko: '구급', en: 'Ambulance' }, num: '119' },
  { label: { zh: '旅游急救', ko: '여행 SOS', en: 'Travel SOS' }, num: '1330' },
  { label: { zh: '中国大使馆', ko: '중국 대사관', en: 'CN Embassy' }, num: '02-738-1038' },
]

export default function NearHomeTab({ lang, setTab, setSubPage }) {
  const [sosOpen, setSosOpen] = useState(false)

  // 최근 예약 로드
  const recentBookings = (() => {
    try {
      return JSON.parse(localStorage.getItem('near_bookings_v2') || '[]').slice(0, 2)
    } catch { return [] }
  })()

  const handleAction = (action) => {
    if (action === 'sos') { setSosOpen(true); return }
    if (action === 'taxi') { setTab('near-map'); return }
    setTab(action)
  }

  const greeting = lang === 'ko' ? '안녕하세요, 여행자님 👋' : lang === 'en' ? 'Hello, Traveler 👋' : '你好，旅行者 👋'

  return (
    <div style={{ minHeight: '100%', background: 'white', fontFamily: '"Noto Sans SC", Pretendard, Inter, sans-serif', paddingBottom: 24 }}>

      {/* ─── 상단 인사 + 검색바 ─── */}
      <div style={{ padding: '20px 20px 0' }}>
        <p style={{ fontSize: 22, fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 4px', lineHeight: 1.3 }}>{greeting}</p>
        <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: '0 0 16px' }}>
          {lang === 'ko' ? '서울에서 무엇이 필요하세요?' : lang === 'en' ? 'What do you need in Seoul?' : '在首尔，需要什么帮助？'}
        </p>
        {/* 검색바 */}
        <button
          onClick={() => setSubPage && setSubPage('search')}
          style={{
            width: '100%', display: 'flex', alignItems: 'center', gap: 10,
            padding: '12px 16px', borderRadius: 50,
            background: 'var(--surface)', border: '1px solid var(--border)',
            cursor: 'pointer', textAlign: 'left',
          }}
        >
          <Search size={16} color="var(--text-hint)" />
          <span style={{ fontSize: 14, color: 'var(--text-hint)', flex: 1 }}>
            {lang === 'ko' ? '미용실, 맛집, 택시...' : lang === 'en' ? 'Beauty, food, taxi...' : '搜索美容院、餐厅、出租车...'}
          </span>
        </button>
      </div>

      {/* ─── 퀵 액션 2x2 ─── */}
      <div style={{ padding: '24px 20px 0' }}>
        <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', margin: '0 0 12px', letterSpacing: '-0.2px' }}>
          {lang === 'ko' ? '빠른 메뉴' : lang === 'en' ? 'Quick Actions' : '快速入口'}
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          {QUICK_ACTIONS.map(item => {
            const Icon = item.icon
            return (
              <button
                key={item.id}
                onClick={() => handleAction(item.action)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  padding: '16px 14px', borderRadius: 'var(--radius-card)',
                  background: item.bg, border: 'none', cursor: 'pointer',
                  textAlign: 'left',
                }}
                onTouchStart={e => e.currentTarget.style.opacity = '0.7'}
                onTouchEnd={e => e.currentTarget.style.opacity = '1'}
              >
                <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(255,255,255,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Icon size={18} color={item.color} />
                </div>
                <span style={{ fontSize: 13, fontWeight: 600, color: item.color, lineHeight: 1.3 }}>
                  {L(lang, item.label)}
                </span>
              </button>
            )
          })}
        </div>
      </div>

      {/* ─── 최근 예약 ─── */}
      {recentBookings.length > 0 && (
        <div style={{ padding: '24px 20px 0' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', margin: 0 }}>
              {lang === 'ko' ? '최근 예약' : lang === 'en' ? 'Recent Bookings' : '最近预约'}
            </p>
            <button onClick={() => setTab('booking')} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, color: 'var(--primary)', fontSize: 12, fontWeight: 600 }}>
              {lang === 'ko' ? '전체 보기' : lang === 'en' ? 'See all' : '查看全部'}
              <ChevronRight size={12} />
            </button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {recentBookings.map(b => (
              <div key={b.id} style={{ background: 'var(--surface)', borderRadius: 'var(--radius-card)', padding: '14px 16px', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: '#FDF3F1', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Calendar size={16} color="#C4725A" />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{b.shopName}</p>
                  <p style={{ margin: '2px 0 0', fontSize: 11, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4 }}>
                    <Clock size={10} />
                    {b.date} {b.time}
                  </p>
                </div>
                <span style={{ fontSize: 10, fontWeight: 600, padding: '3px 8px', borderRadius: 20, background: '#DCFCE7', color: '#16A34A', flexShrink: 0 }}>
                  {lang === 'ko' ? '확정' : lang === 'en' ? 'Confirmed' : '已确认'}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ─── 추천 매장 ─── */}
      <div style={{ padding: '24px 20px 0' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
          <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', margin: 0 }}>
            {lang === 'ko' ? '추천 매장' : lang === 'en' ? 'Recommended' : '推荐门店'}
          </p>
          <button onClick={() => setTab('discover')} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, color: 'var(--primary)', fontSize: 12, fontWeight: 600 }}>
            {lang === 'ko' ? '더 보기' : lang === 'en' ? 'More' : '更多'}
            <ChevronRight size={12} />
          </button>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {RECOMMENDED.map(shop => (
            <button
              key={shop.id}
              onClick={() => setTab('booking')}
              style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px', borderRadius: 'var(--radius-card)', background: 'var(--surface)', border: '1px solid var(--border)', cursor: 'pointer', textAlign: 'left', width: '100%' }}
              onTouchStart={e => e.currentTarget.style.opacity = '0.7'}
              onTouchEnd={e => e.currentTarget.style.opacity = '1'}
            >
              {/* 아바타 */}
              <div style={{ width: 44, height: 44, borderRadius: 12, background: 'linear-gradient(135deg, #C4725A, #E8956F)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, color: 'white', fontSize: 16, fontWeight: 700 }}>
                {L(lang, shop.name).charAt(0)}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ margin: 0, fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{L(lang, shop.name)}</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 3 }}>
                  <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{L(lang, shop.category)}</span>
                  <span style={{ fontSize: 11, color: '#F9A825', display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Star size={10} fill="#F9A825" />
                    {shop.rating}
                  </span>
                </div>
              </div>
              <span style={{ fontSize: 10, fontWeight: 600, padding: '3px 8px', borderRadius: 20, background: `${shop.tagColor}18`, color: shop.tagColor, flexShrink: 0 }}>
                {L(lang, shop.tag)}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* ─── SOS 모달 ─── */}
      {sosOpen && (
        <div
          onClick={() => setSosOpen(false)}
          style={{ position: 'fixed', inset: 0, zIndex: 9000, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'flex-end' }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{ background: 'white', borderRadius: '24px 24px 0 0', padding: '24px 20px 40px', width: '100%' }}
          >
            <div style={{ width: 40, height: 4, borderRadius: 2, background: 'var(--border)', margin: '0 auto 20px' }} />
            <h3 style={{ fontSize: 18, fontWeight: 700, color: '#FF3B30', margin: '0 0 16px', display: 'flex', alignItems: 'center', gap: 8 }}>
              <Phone size={18} color="#FF3B30" />
              {lang === 'ko' ? '긴급 연락처' : lang === 'en' ? 'Emergency Contacts' : '紧急联系电话'}
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {SOS_NUMBERS.map(s => (
                <a
                  key={s.num}
                  href={`tel:${s.num}`}
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px', borderRadius: 'var(--radius-card)', background: '#FFF0F0', border: 'none', textDecoration: 'none' }}
                >
                  <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>{L(lang, s.label)}</span>
                  <span style={{ fontSize: 18, fontWeight: 700, color: '#FF3B30', fontFamily: 'Inter, sans-serif' }}>{s.num}</span>
                </a>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
