/**
 * NearHomeTab — NEAR 앱 홈 탭 (首页)
 * 퀵 액션: 입국 / 출국 / 여행코스 / 통역번역
 * 카테고리: Beauty/Food/Popup/Cafe/Nail/Cosmetics/Hotel/Medical/Shopping/More
 */
import { useState, useEffect, useRef, useCallback } from 'react'
import { Search, X, ChevronRight, Heart, Scissors, Coffee,
  ShoppingBag, MoreHorizontal, PlaneLanding, PlaneTakeoff,
  ArrowLeft, Route, Languages, Palette, Droplets, Building2,
  Sparkles, UtensilsCrossed, Star } from 'lucide-react'
import { useLanguage } from '../i18n/index.jsx'
import { supabase } from '../lib/supabase.js'

function L(lang, d) { if (typeof d === 'string') return d; return d?.[lang] || d?.zh || d?.ko || d?.en || '' }

// ─── 퀵 액션 (4개: 입국/출국/여행코스/통역번역) ───
const QUICK_ACTIONS = [
  { id: 'arrival',   icon: PlaneLanding, bg: '#EDF5FF', color: '#007AFF', action: 'arrival-sheet'  },
  { id: 'departure', icon: PlaneTakeoff, bg: '#F0F9F0', color: '#34C759', action: 'departure-sheet' },
  { id: 'course',    icon: Route,        bg: '#F3E8FF', color: '#9B51E0', action: 'course'          },
  { id: 'translate', icon: Languages,    bg: '#FFF9E6', color: '#F9A825', action: 'translate-sheet' },
]

const QUICK_ACTION_LABEL_KEYS = {
  arrival:   'home.quick.arrival',
  departure: 'home.quick.departure',
  course:    'home.quick.course',
  translate: 'home.quick.translate',
}

// ─── 입국 바텀시트 항목 ───
const ARRIVAL_ITEMS = [
  { id: 'immigration-wait', emoji: '⏱️', label: { ko: '입국심사 대기시간', zh: '入境审查等候时间', en: 'Immigration Wait Time' }, sub: 'immigration-wait' },
  { id: 'arrival-card',     emoji: '📋', label: { ko: '입국신고서 작성법', zh: '入境申报卡填写方法', en: 'Arrival Card Guide' },   sub: 'arrival-card' },
  { id: 'sim-guide',        emoji: '📱', label: { ko: 'SIM카드 & 환전',    zh: 'SIM卡 & 换钱',           en: 'SIM & Exchange' },       sub: 'sim-guide' },
  { id: 'passport-scan',    emoji: '🛂', label: { ko: '여권 스캔',          zh: '护照扫描',               en: 'Passport Scan' },        sub: 'passport-scan' },
]

// ─── 출국 바텀시트 항목 ───
const DEPARTURE_ITEMS = [
  { id: 'departure',          emoji: '⏳', label: { ko: '출국 카운트다운',   zh: '出境倒计时',     en: 'Departure Countdown' },      sub: 'departure' },
  { id: 'taxrefund',          emoji: '🧾', label: { ko: '세금환급 안내',     zh: '退税指南',       en: 'Tax Refund Guide' },         sub: 'taxrefund' },
  { id: 'departure-shopping', emoji: '🛍️', label: { ko: '출국 쇼핑 동선',   zh: '出境购物路线',   en: 'Departure Shopping Route' }, sub: 'departure-shopping' },
  { id: 'tax-free',           emoji: '🔖', label: { ko: '면세 한도 안내',    zh: '免税限额指南',   en: 'Duty-Free Limits' },         sub: 'tax-free' },
]

// ─── 통역·번역 바텀시트 항목 ───
const TRANSLATE_ITEMS = [
  { id: 'translator',   emoji: '🗣️', label: { ko: '통역&번역',         zh: '口译&翻译',       en: 'Translate' },             tool: 'translator' },
  { id: 'artranslate',  emoji: '📸', label: { ko: '간판 사전',          zh: '招牌词典',         en: 'Sign Dictionary' },       tool: 'artranslate' },
  { id: 'basic-korean', emoji: '💬', label: { ko: '기본 한국어 20문장', zh: '基础韩语20句',     en: '20 Korean Phrases' },     sub: 'basic-korean' },
]

// ─── 히어로 배너 슬라이드 ───
const BANNER_SLIDES = [
  { id: 'b1', gradient: 'linear-gradient(135deg, #C4725A, #E8956F)', titleKey: 'home.banner.title', descKey: 'home.banner.desc' },
  { id: 'b2', gradient: 'linear-gradient(135deg, #007AFF, #5AC8FA)', title: { ko: '환전 필요 없이 제로페이', zh: '无需换钱，Zero Pay', en: 'Pay with Zero Pay' }, desc: { ko: '알리페이·위챗페이 그대로 사용', zh: '支付宝·微信支付 直接使用', en: 'Alipay & WeChat Pay accepted' } },
  { id: 'b3', gradient: 'linear-gradient(135deg, #AF52DE, #FF2D55)', title: { ko: '서울 팝업스토어 탐방', zh: '首尔快闪店探索', en: 'Seoul Pop-up Stores' }, desc: { ko: '성수·홍대·강남 최신 팝업 정보', zh: '圣水·弘大·江南 最新快闪情报', en: 'Seongsu · Hongdae · Gangnam' } },
]

// ─── 카테고리 그리드 (10개: Taxi/KTX/SIM 제거, Nail/Cosmetics/Hotel 추가) ───
const MEITU_CATEGORIES = [
  { id: 'beauty',    icon: Scissors,       bg: '#FFEEF0', color: '#E57373', zh: '美容',   ko: '미용',   en: 'Beauty',     searchTerm: { zh: '美妆', ko: '뷰티', en: 'beauty' },        archiveCat: '7'  },
  { id: 'food',      icon: UtensilsCrossed, bg: '#FFF3E0', color: '#FF9800', zh: '美食',   ko: '맛집',   en: 'Food',       searchTerm: { zh: '美食', ko: '맛집', en: 'food' },          archiveCat: '2'  },
  { id: 'popup',     icon: Sparkles,        bg: '#F3E5F5', color: '#9C27B0', zh: '快闪店', ko: '팝업',   en: 'Popup',      searchTerm: { zh: '快闪店', ko: '팝업', en: 'popup' },       archiveCat: null },
  { id: 'cafe',      icon: Coffee,          bg: '#EFEBE9', color: '#795548', zh: '咖啡',   ko: '카페',   en: 'Cafe',       searchTerm: { zh: '咖啡厅', ko: '카페', en: 'cafe' },        archiveCat: '14' },
  { id: 'nail',      icon: Palette,         bg: '#FFF0E6', color: '#E8825A', zh: '美甲',   ko: '네일',   en: 'Nail',       searchTerm: { zh: '美甲', ko: '네일아트', en: 'nail' },       archiveCat: null },
  { id: 'cosmetics', icon: Droplets,        bg: '#FFF0F5', color: '#E91E8C', zh: '化妆品', ko: '화장품', en: 'Cosmetics',  searchTerm: { zh: '化妆品', ko: '화장품', en: 'cosmetics' }, archiveCat: null },
  { id: 'hotel',     icon: Building2,       bg: '#E8F4FF', color: '#2196F3', zh: '酒店',   ko: '호텔',   en: 'Hotel',      searchTerm: { zh: '酒店', ko: '호텔', en: 'hotel' },         archiveCat: '4'  },
  { id: 'medical',   icon: Heart,           bg: '#E8F5E9', color: '#4CAF50', zh: '医疗',   ko: '의료',   en: 'Medical',    searchTerm: { zh: '医院', ko: '병원', en: 'hospital' },      archiveCat: '8'  },
  { id: 'shopping',  icon: ShoppingBag,     bg: '#FCE4EC', color: '#E91E63', zh: '购物',   ko: '쇼핑',   en: 'Shopping',   searchTerm: { zh: '购物', ko: '쇼핑', en: 'shopping' },     archiveCat: '1'  },
  { id: 'more',      icon: MoreHorizontal,  bg: '#F7F7F7', color: '#999999', zh: '更多',   ko: '더보기', en: 'More',       searchTerm: null, archiveCat: null                                              },
]

// 카테고리 필터용 레이블 (DiscoverPage chip에서도 사용)
const CAT_LABELS = {
  beauty: { zh: '美容', ko: '미용', en: 'Beauty' },
  food: { zh: '美食', ko: '맛집', en: 'Food' },
  popup: { zh: '快闪店', ko: '팝업', en: 'Popup' },
  cafe: { zh: '咖啡', ko: '카페', en: 'Cafe' },
  nail: { zh: '美甲', ko: '네일', en: 'Nail' },
  cosmetics: { zh: '化妆品', ko: '화장품', en: 'Cosmetics' },
  hotel: { zh: '酒店', ko: '호텔', en: 'Hotel' },
  medical: { zh: '医疗', ko: '의료', en: 'Medical' },
  shopping: { zh: '购物', ko: '쇼핑', en: 'Shopping' },
}

const AREA_LABELS = {
  hongdae: { zh: '弘大', ko: '홍대', en: 'Hongdae' },
  seongsu: { zh: '圣水', ko: '성수', en: 'Seongsu' },
  gangnam: { zh: '江南', ko: '강남', en: 'Gangnam' },
  myeongdong: { zh: '明洞', ko: '명동', en: 'Myeongdong' },
  itaewon: { zh: '梨泰院', ko: '이태원', en: 'Itaewon' },
  jamsil: { zh: '蚕室', ko: '잠실', en: 'Jamsil' },
}

// ─── 피드 데이터 (카테고리 속성 추가) ───
const FEED_DATA = [
  { id: 'fd1', category: 'beauty',   titleKey: 'feed.1.title', locationKey: 'feed.1.location', statusKey: null,            likes: '328',  gradient: 'linear-gradient(160deg,#FFEEF0,#FFD6DC)' },
  { id: 'fd2', category: 'food',     titleKey: 'feed.2.title', locationKey: null,              statusKey: 'feed.2.status', likes: '892',  gradient: 'linear-gradient(160deg,#F3E5F5,#E1BEE7)' },
  { id: 'fd3', category: 'popup',    titleKey: 'feed.3.title', locationKey: 'feed.3.location', statusKey: null,            likes: '1.2k', gradient: 'linear-gradient(160deg,#FFF3E0,#FFE0B2)' },
  { id: 'fd4', category: 'cafe',     titleKey: 'feed.4.title', locationKey: null,              statusKey: 'feed.4.status', likes: '567',  gradient: 'linear-gradient(160deg,#E8F5E9,#C8E6C9)' },
  { id: 'fd5', category: 'shopping', titleKey: 'feed.5.title', locationKey: 'feed.5.location', statusKey: null,            likes: '2.1k', gradient: 'linear-gradient(160deg,#FCE4EC,#F8BBD9)' },
  { id: 'fd6', category: 'nail',     titleKey: 'feed.6.title', locationKey: 'feed.6.location', statusKey: null,            likes: '445',  gradient: 'linear-gradient(160deg,#EFEBE9,#D7CCC8)' },
]

// ─── 중국어→한국어 매핑 ───
const ZH_TO_KO = {
  '美食': '맛집', '咖啡': '카페', '购物': '쇼핑', '明洞': '명동', '弘大': '홍대',
  '江南': '강남', '圣水': '성수', '景福宫': '경복궁', '东大门': '동대문', '梨泰院': '이태원',
  '南山': '남산', '北村': '북촌', '美妆': '뷰티', '快闪店': '팝업', '打卡': '핫플',
  '热门': '인기', '推荐': '추천', '医院': '병원', '便利店': '편의점', 'K-POP': 'K-POP',
}

const ARCHIVE_BASE = 'https://archive.visitseoul.net'

function zhToKo(q) {
  if (!q) return q
  let r = q
  Object.entries(ZH_TO_KO).sort((a,b) => b[0].length - a[0].length).forEach(([zh, ko]) => {
    r = r.replace(new RegExp(zh, 'g'), ko)
  })
  return r
}

function parseArchiveResults(html) {
  const items = []
  const cards = html.match(/<li[^>]*class="[^"]*item[^"]*"[^>]*>[\s\S]*?<\/li>/gi) || []
  for (const card of cards) {
    const imgMatch = card.match(/src="([^"]*(?:upload|image)[^"]*\.(?:jpg|jpeg|png|webp)[^"]*)"/i)
    const titleMatch = card.match(/<(?:strong|h[2-4]|p|span)[^>]*class="[^"]*(?:tit|title|name)[^"]*"[^>]*>(.*?)<\//i)
      || card.match(/<(?:strong|h[2-4]|p)[^>]*>(.*?)<\//i)
    const tags = []; const tagRegex = /#([\w가-힣\u4e00-\u9fff]+)/g; let tm
    while ((tm = tagRegex.exec(card)) !== null) tags.push(tm[1])
    const catMatch = card.match(/class="[^"]*(?:cate|badge|tag)[^"]*"[^>]*>([^<]+)/i)
    const linkMatch = card.match(/href="([^"]*\/(?:ko|zh|en)\/[^"]+)"/i)
    if (titleMatch || imgMatch) {
      items.push({
        id: `arch-${items.length}`,
        title: (titleMatch?.[1] || '').replace(/<[^>]*>/g, '').trim(),
        image: imgMatch?.[1] ? (imgMatch[1].startsWith('http') ? imgMatch[1] : `${ARCHIVE_BASE}${imgMatch[1]}`) : '',
        tags, category: catMatch?.[1]?.trim() || '',
        url: linkMatch?.[1] ? (linkMatch[1].startsWith('http') ? linkMatch[1] : `${ARCHIVE_BASE}${linkMatch[1]}`) : '',
      })
    }
  }
  const totalMatch = html.match(/총\s*([\d,]+)\s*건/i)
  return { items: items.length > 0 ? items : null, total: totalMatch ? parseInt(totalMatch[1].replace(/,/g, '')) : items.length }
}

async function searchArchive(term, category, page = 1) {
  try {
    const params = new URLSearchParams({ currentPageNo: page, ctgryStr: category || '', orientationStr: '', pubnuriStr: '', sortOrd: term ? 'accuracy' : 'regDttm', befSearchTerm: '', searchTerm: term || '' })
    const res = await fetch(`${ARCHIVE_BASE}/ko/search?${params}`)
    if (!res.ok) throw new Error('err')
    const r = parseArchiveResults(await res.text())
    return { items: r.items || [], total: r.total }
  } catch {
    return { items: [], total: 0 }
  }
}

const PH_KEYS = ['search.placeholder.0','search.placeholder.1','search.placeholder.2','search.placeholder.3','search.placeholder.4']

// ─── 재사용 바텀시트 컴포넌트 ───
function BottomSheet({ open, onClose, titleLabel, items, lang, t, setSubPage, setTab }) {
  if (!open) return null
  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, zIndex: 9000, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'flex-end' }}>
      <div onClick={e => e.stopPropagation()} style={{ background: 'white', borderRadius: '24px 24px 0 0', padding: '0 0 40px', width: '100%' }}>
        <div style={{ width: 40, height: 4, borderRadius: 2, background: 'var(--border)', margin: '12px auto 0' }} />
        <div style={{ display: 'flex', alignItems: 'center', padding: '16px 20px 12px' }}>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px 8px 4px 0' }}>
            <ArrowLeft size={20} color="var(--text-primary)" />
          </button>
          <span style={{ fontSize: 17, fontWeight: 700, color: 'var(--text-primary)' }}>
            {typeof titleLabel === 'string' ? t(titleLabel) : L(lang, titleLabel)}
          </span>
        </div>
        <div style={{ background: 'white', borderRadius: 16, margin: '0 20px', overflow: 'hidden', boxShadow: 'var(--shadow-card)' }}>
          {items.map((item, i) => (
            <button
              key={item.id}
              onClick={() => {
                if (item.sub && setSubPage) setSubPage(item.sub)
                else if (item.tool && setSubPage) setSubPage(item.tool)
                else if (item.tab && setTab) setTab(item.tab)
                onClose()
              }}
              style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 14, padding: '16px 20px', textAlign: 'left', background: 'none', border: 'none', cursor: 'pointer', borderTop: i > 0 ? '1px solid var(--border)' : 'none' }}
              onTouchStart={e => e.currentTarget.style.background = 'var(--surface)'}
              onTouchEnd={e => e.currentTarget.style.background = 'none'}
            >
              <span style={{ fontSize: 22 }}>{item.emoji}</span>
              <span style={{ flex: 1, fontSize: 15, fontWeight: 500, color: 'var(--text-primary)' }}>{L(lang, item.label)}</span>
              <ChevronRight size={16} color="var(--text-hint)" />
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

// ─── 추천 페이지 (더보기 풀스크린) ───
function DiscoverPage({ lang, t, setSubPage, setTab, onClose }) {
  const [filterCat, setFilterCat] = useState(null)
  const [filterArea, setFilterArea] = useState(null)
  const [shops, setShops] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchShops = useCallback(async () => {
    setLoading(true)
    try {
      let q = supabase
        .from('popups')
        .select('id, name, name_zh, name_en, category, district, image_url, address, cn_score, description_zh')
        .order('cn_score', { ascending: false })
        .limit(60)
      if (filterCat) q = q.eq('category', filterCat)
      if (filterArea) q = q.eq('district', filterArea)
      const { data } = await q
      setShops(data || [])
    } catch {
      setShops([])
    }
    setLoading(false)
  }, [filterCat, filterArea])

  useEffect(() => { fetchShops() }, [fetchShops])

  const catIds = Object.keys(CAT_LABELS)
  const areaIds = Object.keys(AREA_LABELS)

  const catIcons = { beauty: Scissors, food: UtensilsCrossed, popup: Sparkles, cafe: Coffee, nail: Palette, cosmetics: Droplets, hotel: Building2, medical: Heart, shopping: ShoppingBag }
  const catColors = { beauty: '#E57373', food: '#FF9800', popup: '#9C27B0', cafe: '#795548', nail: '#E8825A', cosmetics: '#E91E8C', hotel: '#2196F3', medical: '#4CAF50', shopping: '#E91E63' }

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 9500, background: 'var(--bg)', display: 'flex', flexDirection: 'column' }}>
      {/* 헤더 */}
      <div style={{ display: 'flex', alignItems: 'center', padding: '16px 20px 12px', background: 'var(--bg)', borderBottom: '1px solid var(--border)', flexShrink: 0 }}>
        <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px 8px 4px 0' }}>
          <ArrowLeft size={22} color="var(--text-primary)" />
        </button>
        <span style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-primary)' }}>
          {L(lang, { ko: '매장 탐색', zh: '发现更多', en: 'Discover' })}
        </span>
        {(filterCat || filterArea) && (
          <button onClick={() => { setFilterCat(null); setFilterArea(null) }}
            style={{ marginLeft: 'auto', fontSize: 12, color: 'var(--text-muted)', background: 'var(--surface)', border: 'none', borderRadius: 20, padding: '4px 10px', cursor: 'pointer' }}>
            {L(lang, { ko: '초기화', zh: '重置', en: 'Reset' })}
          </button>
        )}
      </div>

      {/* 필터 영역 (sticky) */}
      <div style={{ flexShrink: 0, background: 'var(--bg)', borderBottom: '1px solid var(--border)', paddingBottom: 8 }}>
        {/* 카테고리 필터 */}
        <div style={{ overflowX: 'auto', display: 'flex', gap: 8, padding: '10px 20px 0', scrollbarWidth: 'none' }}>
          {catIds.map(id => {
            const active = filterCat === id
            const Icon = catIcons[id]
            return (
              <button key={id} onClick={() => setFilterCat(prev => prev === id ? null : id)}
                style={{
                  flexShrink: 0, display: 'flex', alignItems: 'center', gap: 5,
                  padding: '6px 12px', borderRadius: 20, border: active ? 'none' : '1px solid var(--border)',
                  background: active ? '#111' : 'white', cursor: 'pointer',
                  fontSize: 12, fontWeight: active ? 600 : 400,
                  color: active ? 'white' : 'var(--text-secondary)',
                }}>
                {Icon && <Icon size={12} color={active ? 'white' : catColors[id]} />}
                {L(lang, CAT_LABELS[id])}
              </button>
            )
          })}
        </div>
        {/* 지역 필터 */}
        <div style={{ overflowX: 'auto', display: 'flex', gap: 8, padding: '8px 20px 0', scrollbarWidth: 'none' }}>
          {areaIds.map(id => {
            const active = filterArea === id
            return (
              <button key={id} onClick={() => setFilterArea(prev => prev === id ? null : id)}
                style={{
                  flexShrink: 0, padding: '5px 12px', borderRadius: 20,
                  border: active ? 'none' : '1px solid var(--border)',
                  background: active ? '#111' : 'white', cursor: 'pointer',
                  fontSize: 12, fontWeight: active ? 600 : 400,
                  color: active ? 'white' : 'var(--text-secondary)',
                }}>
                {L(lang, AREA_LABELS[id])}
              </button>
            )
          })}
        </div>
      </div>

      {/* 매장 리스트 */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '12px 16px 24px' }}>
        {loading ? (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} style={{ borderRadius: 12, overflow: 'hidden' }}>
                <div className="skeleton" style={{ width: '100%', aspectRatio: '3/4' }} />
                <div style={{ padding: '8px 10px' }}>
                  <div className="skeleton" style={{ height: 12, marginBottom: 6, borderRadius: 4 }} />
                  <div className="skeleton" style={{ height: 10, width: '60%', borderRadius: 4 }} />
                </div>
              </div>
            ))}
          </div>
        ) : shops.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 20px' }}>
            <div style={{ fontSize: 40, marginBottom: 16 }}>🔍</div>
            <p style={{ fontSize: 15, color: 'var(--text-secondary)', marginBottom: 12 }}>
              {L(lang, { ko: '해당 조건의 매장이 없습니다', zh: '暂无符合条件的门店', en: 'No shops found' })}
            </p>
            {(filterCat || filterArea) && (
              <button onClick={() => { setFilterCat(null); setFilterArea(null) }}
                style={{ padding: '10px 20px', borderRadius: 20, background: '#111', color: 'white', border: 'none', fontSize: 13, cursor: 'pointer' }}>
                {L(lang, { ko: '필터 초기화', zh: '重置筛选', en: 'Clear Filters' })}
              </button>
            )}
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            {shops.map((shop, idx) => {
              const name = lang === 'zh' ? (shop.name_zh || shop.name) : lang === 'en' ? (shop.name_en || shop.name) : shop.name
              const CatIcon = catIcons[shop.category]
              const catColor = catColors[shop.category] || '#999'
              return (
                <div
                  key={shop.id || idx}
                  onClick={() => {/* 매장 상세 — 추후 구현 */}}
                  style={{ borderRadius: 12, overflow: 'hidden', background: 'var(--card)', boxShadow: 'var(--shadow-card)', cursor: 'pointer' }}
                  onTouchStart={e => e.currentTarget.style.transform = 'scale(0.97)'}
                  onTouchEnd={e => e.currentTarget.style.transform = 'scale(1)'}
                >
                  {/* 이미지 */}
                  <div style={{ width: '100%', aspectRatio: '3/4', background: shop.image_url ? 'none' : 'var(--surface)', position: 'relative', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {shop.image_url ? (
                      <img src={shop.image_url} alt={name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={e => { e.target.style.display = 'none' }} loading="lazy" />
                    ) : (
                      CatIcon && <CatIcon size={36} color={catColor} style={{ opacity: 0.3 }} />
                    )}
                    {shop.cn_score > 0 && (
                      <span style={{ position: 'absolute', top: 8, left: 8, display: 'flex', alignItems: 'center', gap: 3, padding: '3px 7px', borderRadius: 8, background: 'rgba(0,0,0,0.55)', color: 'white', fontSize: 11, backdropFilter: 'blur(4px)' }}>
                        <Star size={10} fill="white" /> {shop.cn_score}
                      </span>
                    )}
                    {shop.district && (
                      <span style={{ position: 'absolute', bottom: 8, left: 8, padding: '3px 8px', borderRadius: 8, background: 'rgba(0,0,0,0.5)', color: 'white', fontSize: 11, backdropFilter: 'blur(4px)' }}>
                        {L(lang, AREA_LABELS[shop.district]) || shop.district}
                      </span>
                    )}
                  </div>
                  {/* 텍스트 */}
                  <div style={{ padding: '10px 12px 12px' }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', lineHeight: 1.4, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{name}</div>
                    {shop.category && (
                      <span style={{ display: 'inline-block', marginTop: 6, fontSize: 10, color: catColor, background: catColor + '18', borderRadius: 6, padding: '2px 6px', fontWeight: 600 }}>
                        {L(lang, CAT_LABELS[shop.category]) || shop.category}
                      </span>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

export default function NearHomeTab({ setTab, setSubPage }) {
  const { lang, t } = useLanguage()

  // ─── UI 상태 ───
  const [arrivalOpen, setArrivalOpen] = useState(false)
  const [departureOpen, setDepartureOpen] = useState(false)
  const [translateOpen, setTranslateOpen] = useState(false)
  const [showMore, setShowMore] = useState(false)

  // ─── 카테고리 필터 (피드) ───
  const [selectedCategory, setSelectedCategory] = useState(null)

  // ─── 검색 플레이스홀더 ───
  const [phIdx, setPhIdx] = useState(0)
  const [phVisible, setPhVisible] = useState(true)
  useEffect(() => {
    const iv = setInterval(() => {
      setPhVisible(false)
      setTimeout(() => { setPhIdx(i => (i + 1) % PH_KEYS.length); setPhVisible(true) }, 300)
    }, 3000)
    return () => clearInterval(iv)
  }, [])

  // ─── 배너 캐러셀 ───
  const [bannerIdx, setBannerIdx] = useState(0)
  useEffect(() => {
    const iv = setInterval(() => setBannerIdx(i => (i + 1) % BANNER_SLIDES.length), 3500)
    return () => clearInterval(iv)
  }, [])

  // ─── 검색 상태 ───
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [showSearch, setShowSearch] = useState(false)  // true = 검색결과 표시
  const debounceRef = useRef(null)
  const feedRef = useRef(null)

  const loadContent = useCallback(async (term, catId, pg = 1) => {
    setLoading(true)
    try {
      const searchTerm = lang === 'zh' ? zhToKo(term) : term
      const { items, total: tot } = await searchArchive(searchTerm, catId, pg)
      if (pg === 1) setResults(items); else setResults(prev => [...prev, ...items])
      setTotal(tot); setPage(pg)
    } catch { setResults([]) }
    setLoading(false)
  }, [lang])

  const handleSearch = (term) => {
    setQuery(term)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    if (!term.trim()) { setShowSearch(false); setResults([]); return }
    setShowSearch(true)
    debounceRef.current = setTimeout(() => loadContent(term, null), 500)
  }

  const handleCategoryClick = (cat) => {
    if (cat.id === 'more') { setShowMore(true); return }
    // 토글: 이미 선택된 카테고리 클릭 시 해제
    setSelectedCategory(prev => prev === cat.id ? null : cat.id)
    setQuery(''); setShowSearch(false)
    feedRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const handleQuickAction = (action) => {
    if (action === 'arrival-sheet')   { setArrivalOpen(true);   return }
    if (action === 'departure-sheet') { setDepartureOpen(true); return }
    if (action === 'course')          { setTab('near-map');      return }
    if (action === 'translate-sheet') { setTranslateOpen(true); return }
  }

  // 피드 필터링
  const filteredFeed = selectedCategory
    ? FEED_DATA.filter(item => item.category === selectedCategory)
    : FEED_DATA

  const currentSlide = BANNER_SLIDES[bannerIdx]

  return (
    <div style={{ background: 'white', fontFamily: '"Noto Sans SC", Pretendard, Inter, sans-serif', paddingBottom: 24 }}>

      {/* ─── 1. 인사 + 검색바 ─── */}
      <div style={{ padding: '20px 20px 16px' }}>
        <p style={{ fontSize: 22, fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 4px', lineHeight: 1.3 }}>
          {t('home.greeting')} 👋
        </p>
        <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: '0 0 14px' }}>
          {t('home.subtitle')}
        </p>
        <div style={{ position: 'relative' }}>
          <Search size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-hint)' }} />
          <input
            type="text"
            value={query}
            onChange={e => handleSearch(e.target.value)}
            placeholder={t(PH_KEYS[phIdx])}
            style={{
              width: '100%', padding: '12px 36px', borderRadius: 50,
              background: 'var(--surface)', border: '1px solid var(--border)',
              outline: 'none', fontSize: 14, color: 'var(--text-primary)', boxSizing: 'border-box',
              opacity: phVisible ? 1 : 0, transition: 'opacity 0.3s ease',
            }}
          />
          {query && (
            <button onClick={() => handleSearch('')} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}>
              <X size={14} color="var(--text-muted)" />
            </button>
          )}
        </div>
      </div>

      {/* ─── 2. 퀵 액션 (입국/출국/여행코스/통역번역) ─── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8, padding: '0 20px 20px' }}>
        {QUICK_ACTIONS.map(item => {
          const Icon = item.icon
          return (
            <button
              key={item.id}
              onClick={() => handleQuickAction(item.action)}
              style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, padding: '14px 8px', borderRadius: 'var(--radius-card)', background: item.bg, border: 'none', cursor: 'pointer' }}
              onTouchStart={e => e.currentTarget.style.opacity = '0.7'}
              onTouchEnd={e => e.currentTarget.style.opacity = '1'}
            >
              <div style={{ width: 40, height: 40, borderRadius: 12, background: 'rgba(255,255,255,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Icon size={20} color={item.color} />
              </div>
              <span style={{ fontSize: 11, fontWeight: 600, color: item.color, textAlign: 'center', lineHeight: 1.3 }}>
                {t(QUICK_ACTION_LABEL_KEYS[item.id])}
              </span>
            </button>
          )
        })}
      </div>

      {/* ─── 3. 히어로 배너 캐러셀 ─── */}
      {!showSearch && (
        <div style={{ margin: '0 20px 20px', position: 'relative' }}>
          <div style={{
            height: 140, borderRadius: 'var(--radius-card)', background: currentSlide.gradient,
            padding: '20px 24px', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end',
            overflow: 'hidden', position: 'relative', transition: 'background 0.6s ease',
          }}>
            <div style={{ position: 'absolute', right: -20, top: -20, width: 100, height: 100, borderRadius: '50%', background: 'rgba(255,255,255,0.1)' }} />
            <div style={{ position: 'absolute', right: 60, top: 10, width: 50, height: 50, borderRadius: '50%', background: 'rgba(255,255,255,0.06)' }} />
            <div style={{ fontSize: 20, fontWeight: 700, color: 'white', lineHeight: 1.3, position: 'relative' }}>
              {currentSlide.titleKey ? t(currentSlide.titleKey) : L(lang, currentSlide.title)}
            </div>
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.85)', marginTop: 4, position: 'relative' }}>
              {currentSlide.descKey ? t(currentSlide.descKey) : L(lang, currentSlide.desc)}
            </div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 6, marginTop: 8 }}>
            {BANNER_SLIDES.map((_, i) => (
              <button key={i} onClick={() => setBannerIdx(i)}
                style={{ width: i === bannerIdx ? 16 : 6, height: 6, borderRadius: 3, background: i === bannerIdx ? 'var(--text-primary)' : 'var(--border)', border: 'none', cursor: 'pointer', padding: 0, transition: 'all 0.3s ease' }} />
            ))}
          </div>
        </div>
      )}

      {/* ─── 4. 카테고리 그리드 (2행×5열) ─── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 4, padding: '0 20px', marginBottom: 20 }}>
        {MEITU_CATEGORIES.map(cat => {
          const isActive = selectedCategory === cat.id
          const Icon = cat.icon
          return (
            <button key={cat.id} onClick={() => handleCategoryClick(cat)}
              style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, padding: '12px 4px', cursor: 'pointer', borderRadius: 12, background: 'transparent', border: 'none', transition: 'all 0.15s' }}
              onTouchStart={e => e.currentTarget.style.transform = 'scale(0.95)'}
              onTouchEnd={e => e.currentTarget.style.transform = 'scale(1)'}
            >
              <div style={{
                width: 44, height: 44, borderRadius: 14, background: cat.bg,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: isActive ? `0 0 0 2px ${cat.color}` : 'none',
                transition: 'box-shadow 0.15s',
              }}>
                <Icon size={20} color={cat.color} />
              </div>
              <span style={{ fontSize: 11, color: isActive ? cat.color : 'var(--text-secondary)', fontWeight: isActive ? 700 : 500, textAlign: 'center', lineHeight: 1.2 }}>
                {L(lang, { zh: cat.zh, ko: cat.ko, en: cat.en })}
              </span>
            </button>
          )
        })}
      </div>

      {/* ─── 5. 인기 추천 피드 ─── */}
      <div ref={feedRef}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 20px', marginBottom: 12 }}>
          <div>
            <span style={{ fontSize: 17, fontWeight: 600, color: 'var(--text-primary)' }}>
              {showSearch
                ? (total > 0 ? L(lang, { ko: `${total}건`, zh: `共${total}条`, en: `${total} results` }) : L(lang, { ko: '검색 결과', zh: '搜索结果', en: 'Results' }))
                : selectedCategory
                  ? L(lang, CAT_LABELS[selectedCategory] || { ko: '인기 추천', zh: '热门推荐', en: 'Trending' })
                  : t('home.trending')
              }
            </span>
            {!showSearch && !selectedCategory && (() => {
              const now = new Date()
              const d = `${now.getFullYear()}.${String(now.getMonth()+1).padStart(2,'0')}.${String(now.getDate()).padStart(2,'0')} ${String(now.getHours()).padStart(2,'0')}${lang==='ko'?'시':':00'}`
              return <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>{t('home.updated').replace('{date}', d)}</div>
            })()}
          </div>
          {selectedCategory ? (
            <button onClick={() => setSelectedCategory(null)}
              style={{ fontSize: 12, color: 'var(--text-muted)', background: 'var(--surface)', border: 'none', borderRadius: 20, padding: '4px 10px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 3 }}>
              <X size={11} /> {L(lang, { ko: '전체', zh: '全部', en: 'All' })}
            </button>
          ) : (
            <a href="https://archive.visitseoul.net" target="_blank" rel="noreferrer"
              style={{ fontSize: 13, color: 'var(--text-muted)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 2 }}>
              {t('home.more')} <ChevronRight size={14} />
            </a>
          )}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, padding: '0 20px' }}>
          {loading && showSearch && results.length === 0 ? (
            Array.from({ length: 4 }).map((_, i) => (
              <div key={i} style={{ borderRadius: 'var(--radius-card)', overflow: 'hidden' }}>
                <div className="skeleton" style={{ width: '100%', aspectRatio: '3/4' }} />
                <div style={{ padding: '10px 12px' }}>
                  <div className="skeleton" style={{ height: 12, marginBottom: 6, borderRadius: 4 }} />
                  <div className="skeleton" style={{ height: 10, width: '60%', borderRadius: 4 }} />
                </div>
              </div>
            ))
          ) : (showSearch ? results : filteredFeed).map((item, idx) => {
            const isFeed = 'gradient' in item
            return (
              <div
                key={item.id}
                onClick={() => !isFeed && item.url && window.open(item.url, '_blank')}
                style={{ borderRadius: 'var(--radius-card)', overflow: 'hidden', background: 'var(--card)', boxShadow: 'var(--shadow-card)', cursor: 'pointer', transition: 'transform 0.2s' }}
                onTouchStart={e => e.currentTarget.style.transform = 'scale(0.97)'}
                onTouchEnd={e => e.currentTarget.style.transform = 'scale(1)'}
              >
                <div style={{ width: '100%', aspectRatio: '3/4', background: isFeed ? item.gradient : (item.image ? 'none' : 'var(--surface)'), position: 'relative', overflow: 'hidden' }}>
                  {!isFeed && item.image && (
                    <img src={item.image} alt={item.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={e => { e.target.style.display = 'none' }} loading="lazy" />
                  )}
                  <button onClick={e => e.stopPropagation()} style={{ position: 'absolute', top: 8, right: 8, width: 28, height: 28, borderRadius: '50%', background: 'rgba(0,0,0,0.3)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Heart size={14} color="white" />
                  </button>
                  {(isFeed ? (item.locationKey || item.statusKey) : item.category) && (
                    <span style={{ position: 'absolute', bottom: 8, left: 8, padding: '3px 8px', borderRadius: 8, background: 'rgba(0,0,0,0.5)', color: 'white', fontSize: 11, backdropFilter: 'blur(4px)' }}>
                      {isFeed ? (item.statusKey ? t(item.statusKey) : (item.locationKey ? t(item.locationKey) : null)) : item.category}
                    </span>
                  )}
                </div>
                <div style={{ padding: '10px 12px 14px' }}>
                  <div style={{ fontSize: 14, fontWeight: 600, lineHeight: 1.4, color: 'var(--text-primary)', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {isFeed ? t(item.titleKey) : item.title}
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 }}>
                    <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                      {isFeed ? (item.locationKey ? t(item.locationKey) : (item.statusKey ? t(item.statusKey) : 'NEAR')) : (item.tags?.[0] ? `#${item.tags[0]}` : 'NEAR')}
                    </span>
                    <span style={{ fontSize: 11, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 3 }}>
                      <Heart size={12} /> {isFeed ? item.likes : ''}
                    </span>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* 검색 더보기 */}
        {showSearch && results.length < total && results.length > 0 && (
          <div style={{ padding: '12px 20px 0' }}>
            <button
              onClick={() => {
                const term = lang === 'zh' ? zhToKo(query) : query
                loadContent(term, null, page + 1)
              }}
              disabled={loading}
              className="btn btn-outline"
              style={{ width: '100%' }}
            >
              {loading ? '...' : t('common.loadMore')}
            </button>
          </div>
        )}

        {/* 카테고리 필터 결과 없음 */}
        {!showSearch && selectedCategory && filteredFeed.length === 0 && (
          <div style={{ textAlign: 'center', padding: '40px 20px' }}>
            <p style={{ fontSize: 14, color: 'var(--text-muted)' }}>
              {L(lang, { ko: '아직 준비 중이에요', zh: '即将推出', en: 'Coming soon' })}
            </p>
          </div>
        )}
      </div>

      {/* ─── 입국 바텀시트 ─── */}
      <BottomSheet
        open={arrivalOpen} onClose={() => setArrivalOpen(false)}
        titleLabel="home.quick.arrival"
        items={ARRIVAL_ITEMS} lang={lang} t={t} setSubPage={setSubPage} setTab={setTab}
      />

      {/* ─── 출국 바텀시트 ─── */}
      <BottomSheet
        open={departureOpen} onClose={() => setDepartureOpen(false)}
        titleLabel="home.quick.departure"
        items={DEPARTURE_ITEMS} lang={lang} t={t} setSubPage={setSubPage} setTab={setTab}
      />

      {/* ─── 통역·번역 바텀시트 ─── */}
      <BottomSheet
        open={translateOpen} onClose={() => setTranslateOpen(false)}
        titleLabel="home.quick.translate"
        items={TRANSLATE_ITEMS} lang={lang} t={t} setSubPage={setSubPage} setTab={setTab}
      />

      {/* ─── 더보기 → 추천 페이지 ─── */}
      {showMore && (
        <DiscoverPage
          lang={lang} t={t}
          setSubPage={(sub) => { setSubPage(sub); setShowMore(false) }}
          setTab={(tab) => { setTab(tab); setShowMore(false) }}
          onClose={() => setShowMore(false)}
        />
      )}
    </div>
  )
}
