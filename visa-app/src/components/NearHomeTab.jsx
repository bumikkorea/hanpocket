/**
 * NearHomeTab — NEAR 앱 홈 탭 (首页)
 * 퀵 액션: 입국 / 출국 / 여행코스 / 통역번역
 * 카테고리: Beauty/Food/Popup/Cafe/Nail/Cosmetics/Hotel/Medical/Shopping/More
 */
import { useState, useEffect, useRef, useCallback } from 'react'
import { Search, X, ChevronRight, Heart, Scissors, Coffee,
  ShoppingBag, MoreHorizontal, PlaneLanding, PlaneTakeoff,
  ArrowLeft, Route, Languages, Palette, Droplets, Building2,
  Sparkles, UtensilsCrossed, ArrowRight, Plus, Pencil } from 'lucide-react'
import { useLanguage } from '../i18n/index.jsx'
import { searchKeyword } from '../api/tourApi'
import { EDITORIALS } from '../data/editorials.js'
import EditorialDetailPage from './EditorialDetailPage.jsx'
import MorePage from './MorePage.jsx'
import NearPageHeader from './NearPageHeader.jsx'
import CourseListPage from './CourseListPage.jsx'

function L(lang, d) { if (typeof d === 'string') return d; return d?.[lang] || d?.zh || d?.ko || d?.en || '' }

// ─── 퀵 액션 (4개: 입국/출국/여행코스/통역번역) ───
const QUICK_ACTIONS = [
  { id: 'arrival',   icon: PlaneLanding, bg: '#EDF5FF', color: '#007AFF', action: 'arrival-sheet'  },
  { id: 'departure', icon: PlaneTakeoff, bg: '#F0F9F0', color: '#34C759', action: 'departure-sheet' },
  { id: 'translate', icon: Languages,    bg: '#FFF9E6', color: '#F9A825', action: 'translate-sheet' },
  { id: 'course',    icon: Route,        bg: '#F3E8FF', color: '#9B51E0', action: 'course'          },
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
  { id: 'arrival-card',     emoji: '📋', label: { ko: '입국신고서 작성법', zh: '入境申报卡填写方법', en: 'Arrival Card Guide' },   sub: 'arrival-card' },
  { id: 'sim-guide',        emoji: '📱', label: { ko: 'SIM카드 & 환전',    zh: 'SIM卡 & 换钱',           en: 'SIM & Exchange' },       sub: 'sim-guide' },
  { id: 'airport-seoul',    emoji: '🚌', label: { ko: '인천공항 → 서울',   zh: '仁川机场→首尔',           en: 'Airport → Seoul' },      tab: 'travel' },
  { id: 'transit-card',     emoji: '🎫', label: { ko: '교통카드 안내',     zh: '交通卡指南',             en: 'Transit Card' },         sub: 'transit-card' },
  { id: 'currency',         emoji: '💱', label: { ko: '환율 계산기',       zh: '汇率计算器',             en: 'Currency Converter' },   sub: 'currency' },
  { id: 'etiquette',        emoji: '🎎', label: { ko: '한국 에티켓',       zh: '韩国礼仪',               en: 'Korean Etiquette' },     sub: 'etiquette' },
  { id: 'price-guide',      emoji: '💰', label: { ko: '한국 물가 가이드',  zh: '韩国物价指南',           en: 'Price Guide' },          sub: 'price-guide' },
  { id: 'voltage',          emoji: '🔌', label: { ko: '콘센트/전압',       zh: '插座/电压',              en: 'Plug & Voltage' },       sub: 'voltage' },
  { id: 'holiday',          emoji: '📅', label: { ko: '공휴일 캘린더',     zh: '公休日历',               en: 'Holidays' },             sub: 'holiday' },
  { id: 'wifi',             emoji: '📶', label: { ko: '무료 와이파이',     zh: '免费WiFi',               en: 'Free WiFi' },            sub: 'wifi' },
]

// ─── 출국 바텀시트 항목 ───
const DEPARTURE_ITEMS = [
  { id: 'flight-board', emoji: '✈️', label: { ko: '출발 전광판',   zh: '出发航班',   en: 'Departures Board' }, sub: 'flight-board' },
  { id: 'taxrefund',    emoji: '🧾', label: { ko: '세금환급 안내', zh: '退税指南',   en: 'Tax Refund Guide' }, sub: 'taxrefund'    },
  { id: 'tax-free',     emoji: '🔖', label: { ko: '면세점 가이드', zh: '免税店指南', en: 'Duty-Free Guide'  }, sub: 'tax-free'     },
]

// ─── 통역·번역 바텀시트 항목 ───
const TRANSLATE_ITEMS = [
  { id: 'translator',   emoji: '🗣️', label: { ko: '통역&번역',         zh: '口译&翻译',       en: 'Translate' },             tool: 'translator' },
  { id: 'artranslate',  emoji: '📸', label: { ko: '간판 사전',          zh: '招牌词典',         en: 'Sign Dictionary' },       tool: 'artranslate' },
  { id: 'basic-korean', emoji: '💬', label: { ko: '기본 한국어 20문장', zh: '基础韩语20句',     en: '20 Korean Phrases' },     sub: 'basic-korean' },
]

// ─── TourAPI contentTypeId → NEAR 카테고리 ───
const TOUR_CAT_MAP = { '82': 'food', '85': 'shopping', '76': 'beauty', '78': 'popup', '32': 'hotel', '38': 'hotel' }
const TOUR_GRADIENTS = {
  food: 'linear-gradient(160deg,#FFF3E0,#FFE0B2)',
  shopping: 'linear-gradient(160deg,#FCE4EC,#F8BBD9)',
  beauty: 'linear-gradient(160deg,#FFEEF0,#FFD6DC)',
  popup: 'linear-gradient(160deg,#F3E5F5,#E1BEE7)',
  hotel: 'linear-gradient(160deg,#E8F5E9,#C8E6C9)',
  more: 'linear-gradient(160deg,#E8F4FF,#BBDEFB)',
}
function normalizeTourItem(item) {
  const cat = TOUR_CAT_MAP[String(item.contentTypeId)] || 'more'
  return {
    id: `tour_${item.contentid}`,
    title: item.title,
    image: item.firstimage || item.firstimage2 || null,
    gradient: (!item.firstimage && !item.firstimage2) ? TOUR_GRADIENTS[cat] : undefined,
    url: (item.mapx && item.mapy)
      ? `https://map.kakao.com/link/map/${encodeURIComponent(item.title)},${item.mapy},${item.mapx}`
      : null,
    category: cat,
    tags: [],
    addr: item.addr1 || '',
    source: 'tour',
  }
}

// ─── 히어로 배너 슬라이드 (2장: 팝업 배너 + 한남 에디토리얼) ───
const HANNAM_ED = EDITORIALS.find(e => e.id === 'hannam')
const BANNER_SLIDES = [
  { id: 'popup', type: 'promo', gradient: 'linear-gradient(135deg, #C4725A, #E8956F)', titleKey: 'home.banner.title', descKey: 'home.banner.desc', textDark: false },
  { id: 'hannam', type: 'editorial', editorialId: 'hannam', gradient: HANNAM_ED.gradient, number: HANNAM_ED.number, title: HANNAM_ED.title, oneLiner: HANNAM_ED.oneLiner, textDark: HANNAM_ED.textDark },
]

// ─── 서울관광재단 아카이브 이미지 ───
const ARCHIVE_IMAGES = [
  { src: 'https://archive.visitseoul.net/upload/encoding/image/2023/01//a4300f12b2154478b8f29965c4eb6e4d.jpg', caption: { ko: '경복궁', zh: '景福宫', en: 'Gyeongbokgung' } },
  { src: 'https://archive.visitseoul.net/upload/encoding/image/2025/08//79e4dcad147a42b2ab9729fdd8a9fdde.jpg', caption: { ko: '한강 야경', zh: '汉江夜景', en: 'Han River Night' } },
  { src: 'https://archive.visitseoul.net/upload/encoding/image/2021/05//47b4c8680fe6409e9fd5177f04e4c85f.jpg', caption: { ko: '남산타워', zh: '南山塔', en: 'Namsan Tower' } },
  { src: 'https://archive.visitseoul.net/upload/encoding/image/2022/07//ed577ddc95ef4cc5a1074742dc27f4fd.jpg', caption: { ko: '북촌 한옥마을', zh: '北村韩屋村', en: 'Bukchon Hanok' } },
  { src: 'https://archive.visitseoul.net/upload/encoding/image/2021/05//91d85bb96b3648b29132efce488d73a5.jpg', caption: { ko: '서울의 봄', zh: '首尔之春', en: 'Seoul Spring' } },
  { src: 'https://archive.visitseoul.net/upload/encoding/image/2023/12//2a04b135fe524988ae7e4153cc84aedc.jpg', caption: { ko: '잠실 롯데월드', zh: '蚕室乐天世界', en: 'Lotte World' } },
  { src: 'https://archive.visitseoul.net/upload/encoding/image/2023/11//b707289646a64551821a6026c914ebde.jpg', caption: { ko: '동대문 DDP', zh: '东大门DDP', en: 'Dongdaemun DDP' } },
  { src: 'https://archive.visitseoul.net/upload/encoding/image/2022/11//f7144dac2144442db51785b8c4d65785.jpg', caption: { ko: '덕수궁', zh: '德寿宫', en: 'Deoksugung' } },
  { src: 'https://archive.visitseoul.net/upload/encoding/image/2020/12//img_migration_0531.jpg', caption: { ko: '롯데타워', zh: '乐天塔', en: 'Lotte Tower' } },
  { src: 'https://archive.visitseoul.net/upload/encoding/image/2020/12//img_migration_2000.jpg', caption: { ko: '인사동', zh: '仁寺洞', en: 'Insadong' } },
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
      <div onClick={e => e.stopPropagation()} style={{
        background: '#FAFAFA',
        borderRadius: '24px 24px 0 0',
        padding: '0 0 40px', width: '100%',
        boxShadow: '-4px -4px 20px rgba(255,255,255,0.9), 0 -6px 20px rgba(200,200,200,0.2)',
      }}>
        <div style={{ width: 40, height: 4, borderRadius: 2, background: '#BBBBBB', margin: '12px auto 0' }} />
        <div style={{ display: 'flex', alignItems: 'center', padding: '16px 20px 12px' }}>
          <button onClick={onClose} style={{
            background: '#FAFAFA', border: 'none', cursor: 'pointer',
            padding: '8px', borderRadius: '50%', marginRight: 4,
            boxShadow: '4px 4px 10px rgba(200,200,200,0.5), -4px -4px 10px #FFFFFF',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            transition: 'box-shadow 0.15s ease',
          }}>
            <ArrowLeft size={18} color="#1A1A1A" />
          </button>
          <span style={{ fontSize: 17, fontWeight: 700, color: '#1A1A1A' }}>
            {typeof titleLabel === 'string' ? t(titleLabel) : L(lang, titleLabel)}
          </span>
        </div>
        <div style={{
          borderRadius: 20, margin: '0 20px', overflow: 'hidden',
          background: '#FAFAFA',
          boxShadow: '6px 6px 14px rgba(200,200,200,0.5), -6px -6px 14px #FFFFFF',
        }}>
          {items.map((item, i) => (
            <button
              key={item.id}
              onClick={() => {
                if (item.sub && setSubPage) setSubPage(item.sub)
                else if (item.tool && setSubPage) setSubPage(item.tool)
                else if (item.tab && setTab) setTab(item.tab)
                onClose()
              }}
              style={{
                width: '100%', display: 'flex', alignItems: 'center', gap: 14,
                padding: '16px 20px', textAlign: 'left', background: 'none', border: 'none',
                cursor: 'pointer',
                borderTop: i > 0 ? '1px solid rgba(200,200,200,0.3)' : 'none',
                transition: 'background 0.15s ease',
              }}
              onTouchStart={e => e.currentTarget.style.background = 'rgba(196,114,90,0.04)'}
              onTouchEnd={e => e.currentTarget.style.background = 'none'}
            >
              <span style={{ fontSize: 22 }}>{item.emoji}</span>
              <span style={{ flex: 1, fontSize: 15, fontWeight: 500, color: '#1A1A1A' }}>{L(lang, item.label)}</span>
              <ChevronRight size={16} color="#BBBBBB" />
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

// ─── 입국/출국 풀스크린 페이지 ───
function FullPage({ open, onClose, titleLabel, items, lang, t, setSubPage, setTab, accentColor }) {
  if (!open) return null
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 9500, background: '#FAFAFA', display: 'flex', flexDirection: 'column', fontFamily: '-apple-system, "Pretendard", "Noto Sans SC", sans-serif' }}>
      <NearPageHeader onBack={onClose} setTab={setTab} />
      <div style={{ flex: 1, overflowY: 'auto', padding: '24px 20px 48px' }}>
        <div style={{ fontSize: 22, fontWeight: 700, color: '#1A1A1A', letterSpacing: '-0.02em', marginBottom: 6 }}>
          {typeof titleLabel === 'string' ? t(titleLabel) : L(lang, titleLabel)}
        </div>
        <div style={{ fontSize: 13, color: '#888888', marginBottom: 28 }}>
          {L(lang, { zh: '选择需要的服务', ko: '필요한 서비스를 선택하세요', en: 'Select a service' })}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {items.map(item => (
            <button
              key={item.id}
              onClick={() => {
                if (item.sub && setSubPage) setSubPage(item.sub)
                else if (item.tool && setSubPage) setSubPage(item.tool)
                else if (item.tab && setTab) setTab(item.tab)
                onClose()
              }}
              style={{
                width: '100%', display: 'flex', alignItems: 'center', gap: 16,
                padding: '18px 20px', borderRadius: 20, textAlign: 'left',
                background: '#FAFAFA', border: 'none', cursor: 'pointer',
                boxShadow: '6px 6px 14px rgba(200,200,200,0.5), -6px -6px 14px #FFFFFF',
                transition: 'box-shadow 0.15s ease, transform 0.15s ease',
              }}
              onTouchStart={e => { e.currentTarget.style.boxShadow = 'inset 3px 3px 8px rgba(190,190,190,0.35), inset -3px -3px 8px rgba(255,255,255,0.7)'; e.currentTarget.style.transform = 'scale(0.98)' }}
              onTouchEnd={e => { e.currentTarget.style.boxShadow = '6px 6px 14px rgba(200,200,200,0.5), -6px -6px 14px #FFFFFF'; e.currentTarget.style.transform = 'scale(1)' }}
            >
              <span style={{ fontSize: 28, flexShrink: 0 }}>{item.emoji}</span>
              <span style={{ flex: 1, fontSize: 15, fontWeight: 600, color: '#1A1A1A' }}>{L(lang, item.label)}</span>
              <ChevronRight size={16} color="#BBBBBB" />
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

// ─── 더보기 페이지 (풀스크린) ───
function DiscoverPage({ lang, t, setSubPage, setTab, onClose, onEditorialClick }) {
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 9500, background: '#FAFAFA', display: 'flex', flexDirection: 'column' }}>
      <NearPageHeader onBack={onClose} setTab={setTab} />

      {/* 스크롤 영역 */}
      <div style={{ flex: 1, overflowY: 'auto' }}>

        {/* ─── A) 서울 에디토리얼 — 가로 스크롤 120px ─── */}
        <div style={{ padding: '20px 0 8px' }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, padding: '0 20px 12px' }}>
            <span style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)' }}>
              {L(lang, { ko: '서울 에디토리얼', zh: '首尔编辑部', en: 'Seoul Editorial' })}
            </span>
            <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
              {L(lang, { ko: '10개 지역', zh: '10个地区', en: '10 districts' })}
            </span>
          </div>
          <div style={{ overflowX: 'auto', display: 'flex', gap: 10, padding: '0 20px 20px', scrollbarWidth: 'none' }}>
            {EDITORIALS.map(ed => (
              <button
                key={ed.id}
                onClick={() => onEditorialClick && onEditorialClick(ed.id)}
                style={{
                  flexShrink: 0, width: 148, height: 120,
                  borderRadius: 14, overflow: 'hidden',
                  background: ed.gradient, border: 'none', cursor: 'pointer',
                  position: 'relative', textAlign: 'left',
                  padding: '12px 12px 14px',
                  display: 'flex', flexDirection: 'column', justifyContent: 'flex-end',
                }}
                onTouchStart={e => e.currentTarget.style.opacity = '0.85'}
                onTouchEnd={e => e.currentTarget.style.opacity = '1'}
              >
                <div style={{
                  position: 'absolute', right: 8, top: 6,
                  fontSize: 38, fontWeight: 900, lineHeight: 1,
                  color: ed.textDark ? 'rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.15)',
                  fontFamily: 'Inter, sans-serif', userSelect: 'none',
                }}>{ed.number}</div>
                <div style={{ fontSize: 10, fontWeight: 700, color: ed.textDark ? 'rgba(0,0,0,0.4)' : 'rgba(255,255,255,0.65)', letterSpacing: '0.08em', marginBottom: 4 }}>
                  SEOUL EDITORIAL
                </div>
                <div style={{ fontSize: 13, fontWeight: 700, color: ed.textDark ? '#111' : 'white', lineHeight: 1.3, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                  {L(lang, ed.title)}
                </div>
              </button>
            ))}
          </div>
          <div style={{ borderTop: '1px solid var(--border)', margin: '0 20px' }} />
        </div>

        {/* ─── B~F) MorePage 전체 섹션 ─── */}
        <MorePage lang={lang} setTab={setTab} setSubPage={setSubPage} />

      </div>
    </div>
  )
}

// ── 상단 정보바 유틸 ──
const TIMEZONE_OPTIONS = [
  { id: 'CST',     flag: '🇨🇳', name: { ko: '중국',       zh: '中国',   en: 'China'       }, offset: 8  },
  { id: 'JST',     flag: '🇯🇵', name: { ko: '일본',       zh: '日本',   en: 'Japan'       }, offset: 9  },
  { id: 'EST',     flag: '🇺🇸', name: { ko: '미국 동부',  zh: '美国东部', en: 'US East'   }, offset: -5 },
  { id: 'PST',     flag: '🇺🇸', name: { ko: '미국 서부',  zh: '美国西部', en: 'US West'   }, offset: -8 },
  { id: 'GMT',     flag: '🇬🇧', name: { ko: '영국',       zh: '英国',   en: 'UK'          }, offset: 0  },
  { id: 'SGT',     flag: '🇸🇬', name: { ko: '싱가포르',   zh: '新加坡', en: 'Singapore'   }, offset: 8  },
  { id: 'AEST',    flag: '🇦🇺', name: { ko: '호주(시드니)', zh: '悉尼', en: 'Sydney'      }, offset: 11 },
  { id: 'ICT_TH',  flag: '🇹🇭', name: { ko: '태국',       zh: '泰国',   en: 'Thailand'    }, offset: 7  },
  { id: 'ICT_VN',  flag: '🇻🇳', name: { ko: '베트남',     zh: '越南',   en: 'Vietnam'     }, offset: 7  },
  { id: 'PHT',     flag: '🇵🇭', name: { ko: '필리핀',     zh: '菲律宾', en: 'Philippines' }, offset: 8  },
]

function weatherEmoji_NH(code) {
  if (code === 0) return '☀️'
  if (code <= 3)  return '⛅'
  if (code <= 48) return '🌫️'
  if (code <= 55) return '🌦️'
  if (code <= 67) return '🌧️'
  if (code <= 77) return '❄️'
  if (code <= 86) return '❄️'
  if (code <= 99) return '⛈️'
  return '🌡️'
}

const _nhWeatherCache = { data: {}, key: '', ts: 0 }
function useNHWeather(tzIds) {
  const [data, setData] = useState(_nhWeatherCache.data)
  useEffect(() => {
    const cacheKey = ['KST', ...tzIds].sort().join(',')
    if (_nhWeatherCache.key === cacheKey && Date.now() - _nhWeatherCache.ts < 30 * 60 * 1000) {
      setData(_nhWeatherCache.data); return
    }
    fetch('https://api.open-meteo.com/v1/forecast?latitude=37.57&longitude=126.98&current=temperature_2m,weather_code&timezone=auto')
      .then(r => r.json())
      .then(j => {
        const map = { KST: { temp: Math.round(j.current?.temperature_2m ?? 0), emoji: weatherEmoji_NH(j.current?.weather_code ?? 0) } }
        _nhWeatherCache.data = map; _nhWeatherCache.key = cacheKey; _nhWeatherCache.ts = Date.now()
        setData(map)
      })
      .catch(() => {})
  }, [tzIds.join(',')]) // eslint-disable-line react-hooks/exhaustive-deps
  return data
}

function getNHDateForOffset(offset) {
  const now = new Date()
  const utc = now.getTime() + now.getTimezoneOffset() * 60000
  const d = new Date(utc + offset * 3600000)
  const days = ['日', '月', '火', '水', '木', '金', '土']
  return `${d.getMonth() + 1}/${d.getDate()}(${days[d.getDay()]})`
}

function getNHTimeForOffset(offset) {
  const now = new Date()
  const utc = now.getTime() + now.getTimezoneOffset() * 60000
  const d = new Date(utc + offset * 3600000)
  return d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false })
}

function useNHMultiTimezone() {
  const getState = () => {
    const saved = localStorage.getItem('hanpocket_extra_timezones')
    const extras = saved ? JSON.parse(saved) : []
    return {
      kst: getNHTimeForOffset(9),
      extras: extras.map(id => { const tz = TIMEZONE_OPTIONS.find(t => t.id === id); return tz ? { ...tz, time: getNHTimeForOffset(tz.offset) } : null }).filter(Boolean),
    }
  }
  const [times, setTimes] = useState(getState)
  useEffect(() => {
    const iv = setInterval(() => setTimes(getState()), 30000)
    return () => clearInterval(iv)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps
  return { ...times, refresh: () => setTimes(getState()) }
}

const _nhRateCache = { rate: null, ts: 0 }
function useNHCNYRate() {
  const [rate, setRate] = useState(() => _nhRateCache.rate || 191)
  useEffect(() => {
    if (_nhRateCache.rate && Date.now() - _nhRateCache.ts < 30 * 60 * 1000) { setRate(_nhRateCache.rate); return }
    fetch('https://open.er-api.com/v6/latest/CNY')
      .then(r => r.json())
      .then(d => { const krw = d.rates?.KRW; if (krw > 100) { _nhRateCache.rate = krw; _nhRateCache.ts = Date.now(); setRate(krw) } })
      .catch(() => {})
  }, [])
  return rate
}

export default function NearHomeTab({ setTab, setSubPage }) {
  const { lang, t } = useLanguage()

  // ─── 정보바 훅 ───
  const tzData = useNHMultiTimezone()
  const weatherData = useNHWeather(tzData.extras.map(e => e.id))
  const cnyRate = useNHCNYRate()
  const [showTzPicker, setShowTzPicker] = useState(false)
  const [showExchangePopover, setShowExchangePopover] = useState(false)
  const [tzSelection, setTzSelection] = useState(() => {
    try { return JSON.parse(localStorage.getItem('hanpocket_extra_timezones') || '["CST"]') } catch { return ['CST'] }
  })
  const exchangeRef = useRef(null)

  // ─── UI 상태 ───
  const [arrivalOpen, setArrivalOpen] = useState(false)
  const [departureOpen, setDepartureOpen] = useState(false)
  const [translateOpen, setTranslateOpen] = useState(false)
  const [showMore, setShowMore] = useState(false)
  const [editorialId, setEditorialId] = useState(null)  // 에디토리얼 상세 페이지
  const [showCourseList, setShowCourseList] = useState(false)

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

  // ─── 서울관광재단 아카이브 슬라이더 ───
  const [archiveIdx, setArchiveIdx] = useState(0)
  const archiveTouchRef = useRef(null)
  useEffect(() => {
    const iv = setInterval(() => setArchiveIdx(i => (i + 1) % ARCHIVE_IMAGES.length), 3000)
    return () => clearInterval(iv)
  }, [])

  // exchange popover 클릭 외부 닫기
  useEffect(() => {
    const handler = (e) => { if (exchangeRef.current && !exchangeRef.current.contains(e.target)) setShowExchangePopover(false) }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  // ─── 검색 상태 ───
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [showSearch, setShowSearch] = useState(false)
  const [showSearchOverlay, setShowSearchOverlay] = useState(false)
  const debounceRef = useRef(null)
  const feedRef = useRef(null)
  const overlayInputRef = useRef(null)

  // 최근 검색어
  const getRecentSearches = () => { try { return JSON.parse(localStorage.getItem('near_recent') || '[]') } catch { return [] } }
  const addRecentSearch = (term) => {
    if (!term.trim()) return
    const prev = getRecentSearches().filter(t => t !== term)
    localStorage.setItem('near_recent', JSON.stringify([term, ...prev].slice(0, 8)))
  }
  const removeRecentSearch = (term) => {
    localStorage.setItem('near_recent', JSON.stringify(getRecentSearches().filter(t => t !== term)))
    setRecentSearches(getRecentSearches())
  }
  const [recentSearches, setRecentSearches] = useState(() => getRecentSearches())

  const openSearchOverlay = () => {
    setShowSearchOverlay(true)
    setRecentSearches(getRecentSearches())
    setTimeout(() => overlayInputRef.current?.focus(), 80)
  }
  const closeSearchOverlay = () => {
    setShowSearchOverlay(false)
    setQuery(''); setResults([]); setShowSearch(false)
  }

  const loadContent = useCallback(async (term, catId, pg = 1) => {
    setLoading(true)
    try {
      const searchTerm = lang === 'zh' ? zhToKo(term) : term
      // TourAPI + 서울관광재단 아카이브 병렬 호출
      const [tourRes, archiveRes] = await Promise.allSettled([
        pg === 1 ? searchKeyword(term, { numOfRows: 12, areaCode: 1 }) : Promise.resolve({ items: [] }),
        searchArchive(searchTerm, catId, pg),
      ])
      const tourItems = tourRes.status === 'fulfilled' ? tourRes.value.items.map(normalizeTourItem) : []
      const archiveItems = archiveRes.status === 'fulfilled' ? (archiveRes.value.items || []) : []
      const archiveTotal = archiveRes.status === 'fulfilled' ? (archiveRes.value.total || 0) : 0
      const merged = pg === 1 ? [...tourItems, ...archiveItems] : archiveItems
      if (pg === 1) setResults(merged); else setResults(prev => [...prev, ...merged])
      setTotal(tourItems.length + archiveTotal); setPage(pg)
    } catch { setResults([]) }
    setLoading(false)
  }, [lang])

  const handleSearch = (term) => {
    setQuery(term)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    if (!term.trim()) { setShowSearch(false); setResults([]); return }
    setShowSearch(true)
    debounceRef.current = setTimeout(() => {
      addRecentSearch(term)
      setRecentSearches(getRecentSearches())
      loadContent(term, null)
    }, 500)
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
    if (action === 'course')          { setShowCourseList(true); return }
    if (action === 'translate-sheet') { setTranslateOpen(true); return }
  }

  const handleBannerClick = (slide) => {
    if (slide.type === 'editorial') {
      setShowMore(true)
      setEditorialId(slide.editorialId)
    }
  }

  // 피드 필터링
  const filteredFeed = selectedCategory
    ? FEED_DATA.filter(item => item.category === selectedCategory)
    : FEED_DATA

  const currentSlide = BANNER_SLIDES[bannerIdx]
  const currentEditorial = editorialId ? EDITORIALS.find(e => e.id === editorialId) : null

  return (
    <div style={{ background: '#FAFAFA', fontFamily: '-apple-system, "Pretendard", "Noto Sans SC", sans-serif', paddingBottom: 24 }}>

      {/* ─── 0. 정보바 (날짜/날씨/시간/환율/타임존) ─── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '8px 16px 4px', overflowX: 'auto', scrollbarWidth: 'none', fontSize: 10, color: 'var(--text-muted)', whiteSpace: 'nowrap', gap: 0 }}>
        <span style={{ flexShrink: 0 }}>
          {getNHDateForOffset(9)} · {weatherData.KST ? `${weatherData.KST.emoji}${weatherData.KST.temp}°` : '⛅'} · 서울 · {tzData.kst}
        </span>
        <span ref={exchangeRef} style={{ position: 'relative', flexShrink: 0 }}>
          <button
            onClick={() => setShowExchangePopover(v => !v)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', fontSize: 10, padding: '0 0 0 6px' }}
          >
            · ¥1 = ₩{Math.round(cnyRate)}
          </button>
          {showExchangePopover && (
            <div style={{ position: 'absolute', top: '100%', left: 0, zIndex: 9999, background: '#FAFAFA', border: 'none', borderRadius: 16, padding: '12px 16px', boxShadow: '8px 8px 18px rgba(200,200,200,0.5), -8px -8px 18px #FFFFFF', minWidth: 168, marginTop: 6 }}>
              <div style={{ fontSize: 11, color: '#888888', marginBottom: 6 }}>실시간 환율</div>
              <div style={{ fontSize: 15, fontWeight: 700, color: '#1A1A1A' }}>¥100 = ₩{Math.round(cnyRate * 100).toLocaleString()}</div>
              <div style={{ fontSize: 11, color: '#888888', marginTop: 4 }}>open.er-api.com</div>
            </div>
          )}
        </span>
        {tzData.extras.map(tz => {
          const diff = tz.offset - 9
          const diffStr = diff === 0 ? '' : (diff > 0 ? ` (+${diff}h)` : ` (${diff}h)`)
          return (
            <span key={tz.id} style={{ flexShrink: 0, paddingLeft: 6, color: '#007AFF' }}>
              · {L(lang, tz.name)} {tz.time}{diffStr}
            </span>
          )
        })}
        <button
          onClick={() => setShowTzPicker(true)}
          style={{ flexShrink: 0, marginLeft: 6, background: 'none', border: '1px solid var(--border)', borderRadius: 10, cursor: 'pointer', color: 'var(--text-hint)', fontSize: 10, padding: '1px 6px', lineHeight: 1.5 }}
        >
          +
        </button>
      </div>

      {/* ─── 1. 인사 + 검색바 ─── */}
      <div style={{ padding: '20px 20px 16px' }}>
        <p style={{ fontSize: 22, fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 4px', lineHeight: 1.3 }}>
          {t('home.greeting')} 👋
        </p>
        <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: '0 0 14px' }}>
          {t('home.subtitle')}
        </p>
        <button
          onClick={openSearchOverlay}
          style={{
            width: '100%', display: 'flex', alignItems: 'center', gap: 10,
            padding: '12px 16px', borderRadius: 50, border: 'none', cursor: 'pointer',
            background: '#FAFAFA', textAlign: 'left',
            boxShadow: 'inset 3px 3px 8px rgba(190,190,190,0.35), inset -3px -3px 8px rgba(255,255,255,0.7)',
          }}
        >
          <Search size={16} color="#BBBBBB" style={{ flexShrink: 0 }} />
          <span style={{
            fontSize: 14, color: '#BBBBBB', flex: 1,
            opacity: phVisible ? 1 : 0, transition: 'opacity 0.3s ease',
          }}>
            {t(PH_KEYS[phIdx])}
          </span>
        </button>
      </div>

      {/* ─── 2. 퀵 액션 (입국/출국/여행코스/통역번역) ─── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10, padding: '0 20px 20px' }}>
        {QUICK_ACTIONS.map(item => {
          const Icon = item.icon
          return (
            <button
              key={item.id}
              onClick={() => handleQuickAction(item.action)}
              style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
                padding: '14px 8px', borderRadius: 20,
                background: '#FAFAFA', border: 'none', cursor: 'pointer',
                boxShadow: '6px 6px 14px rgba(200,200,200,0.5), -6px -6px 14px #FFFFFF',
                transition: 'box-shadow 0.15s ease',
              }}
              onTouchStart={e => e.currentTarget.style.boxShadow = 'inset 3px 3px 8px rgba(190,190,190,0.35), inset -3px -3px 8px rgba(255,255,255,0.7)'}
              onTouchEnd={e => e.currentTarget.style.boxShadow = '6px 6px 14px rgba(200,200,200,0.5), -6px -6px 14px #FFFFFF'}
            >
              <div style={{
                width: 44, height: 44, borderRadius: 14,
                background: 'transparent',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <Icon size={22} color={item.color} />
              </div>
              <span style={{ fontSize: 11, fontWeight: 600, color: '#1A1A1A', textAlign: 'center', lineHeight: 1.3 }}>
                {t(QUICK_ACTION_LABEL_KEYS[item.id])}
              </span>
            </button>
          )
        })}
      </div>

      {/* ─── 3. 히어로 배너 캐러셀 (180px) ─── */}
      {!showSearch && (
        <div style={{ margin: '0 20px 20px', position: 'relative' }}>
          <div
            onClick={() => handleBannerClick(currentSlide)}
            style={{
              height: 180, borderRadius: 20, background: currentSlide.gradient,
              padding: '20px 24px', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end',
              overflow: 'hidden', position: 'relative',
              cursor: currentSlide.type === 'editorial' ? 'pointer' : 'default',
              boxShadow: '6px 6px 14px rgba(200,200,200,0.5), -6px -6px 14px #FFFFFF',
            }}
          >
            {currentSlide.type === 'promo' ? (
              <>
                <div style={{ position: 'absolute', right: -20, top: -20, width: 120, height: 120, borderRadius: '50%', background: 'rgba(255,255,255,0.1)' }} />
                <div style={{ position: 'absolute', right: 70, top: 10, width: 60, height: 60, borderRadius: '50%', background: 'rgba(255,255,255,0.06)' }} />
                <div style={{ fontSize: 21, fontWeight: 700, color: 'white', lineHeight: 1.3, position: 'relative' }}>
                  {t(currentSlide.titleKey)}
                </div>
                <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.85)', marginTop: 5, position: 'relative' }}>
                  {t(currentSlide.descKey)}
                </div>
              </>
            ) : (
              <>
                {/* 에디토리얼 카드 디자인 */}
                <div style={{
                  position: 'absolute', left: 20, top: '50%', transform: 'translateY(-60%)',
                  fontSize: 80, fontWeight: 900, lineHeight: 1,
                  color: currentSlide.textDark ? 'rgba(0,0,0,0.08)' : 'rgba(255,255,255,0.12)',
                  fontFamily: 'Inter, sans-serif', userSelect: 'none',
                }}>
                  {currentSlide.number}
                </div>
                <div style={{ position: 'relative' }}>
                  <div style={{ fontSize: 10, fontWeight: 700, color: currentSlide.textDark ? 'rgba(0,0,0,0.4)' : 'rgba(255,255,255,0.6)', letterSpacing: '0.12em', marginBottom: 6, textTransform: 'uppercase' }}>
                    SEOUL EDITORIAL
                  </div>
                  <div style={{ fontSize: 18, fontWeight: 700, color: currentSlide.textDark ? '#111' : 'white', lineHeight: 1.35, marginBottom: 6, letterSpacing: '-0.01em' }}>
                    {L(lang, currentSlide.title)}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ fontSize: 12, color: currentSlide.textDark ? 'rgba(0,0,0,0.5)' : 'rgba(255,255,255,0.75)', fontStyle: 'italic', flex: 1, paddingRight: 12 }}>
                      {L(lang, currentSlide.oneLiner)}
                    </div>
                    <div style={{ width: 32, height: 32, borderRadius: '50%', background: currentSlide.textDark ? 'rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <ArrowRight size={14} color={currentSlide.textDark ? '#333' : 'white'} />
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
          {/* 인디케이터 */}
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
              style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
                padding: '12px 4px', cursor: 'pointer', borderRadius: 16,
                background: '#FAFAFA', border: 'none',
                transition: 'all 0.15s ease',
              }}
              onTouchStart={e => e.currentTarget.style.transform = 'scale(0.95)'}
              onTouchEnd={e => e.currentTarget.style.transform = 'scale(1)'}
            >
              <div style={{
                width: 44, height: 44, borderRadius: 14,
                background: '#FAFAFA',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: isActive
                  ? 'inset 3px 3px 8px rgba(190,190,190,0.35), inset -3px -3px 8px rgba(255,255,255,0.7)'
                  : '4px 4px 10px rgba(200,200,200,0.5), -4px -4px 10px #FFFFFF',
                transition: 'box-shadow 0.15s ease',
              }}>
                <Icon size={20} color={isActive ? '#C4725A' : cat.color} />
              </div>
              <span style={{ fontSize: 11, color: isActive ? '#C4725A' : '#888888', fontWeight: isActive ? 700 : 500, textAlign: 'center', lineHeight: 1.2 }}>
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
                style={{
                  borderRadius: 20, overflow: 'hidden', background: '#FAFAFA',
                  boxShadow: '6px 6px 14px rgba(200,200,200,0.5), -6px -6px 14px #FFFFFF',
                  cursor: 'pointer', transition: 'transform 0.15s ease, box-shadow 0.15s ease',
                }}
                onTouchStart={e => { e.currentTarget.style.transform = 'scale(0.97)'; e.currentTarget.style.boxShadow = 'inset 3px 3px 8px rgba(190,190,190,0.35), inset -3px -3px 8px rgba(255,255,255,0.7)' }}
                onTouchEnd={e => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = '6px 6px 14px rgba(200,200,200,0.5), -6px -6px 14px #FFFFFF' }}
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
                    <span style={{ fontSize: 11, color: item.source === 'tour' ? '#C4725A' : 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 3 }}>
                      {item.source === 'tour'
                        ? (item.addr ? item.addr.replace('서울특별시 ', '').slice(0, 16) : 'TourAPI')
                        : isFeed
                          ? (item.locationKey ? t(item.locationKey) : (item.statusKey ? t(item.statusKey) : 'NEAR'))
                          : (item.tags?.[0] ? `#${item.tags[0]}` : 'NEAR')
                      }
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

      {/* ─── 서울관광재단 아카이브 슬라이더 ─── */}
      {!showSearch && !selectedCategory && (() => {
        const img = ARCHIVE_IMAGES[archiveIdx]
        return (
          <div style={{ padding: '8px 20px 24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
              <span style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)' }}>
                {L(lang, { ko: '서울 풍경', zh: '首尔风景', en: 'Seoul Scenes' })}
              </span>
              <span style={{ fontSize: 11, color: 'var(--text-hint)' }}>© Seoul Tourism Archive</span>
            </div>
            <div
              style={{ position: 'relative', borderRadius: 20, overflow: 'hidden', height: 200, cursor: 'pointer', boxShadow: '6px 6px 14px rgba(200,200,200,0.5), -6px -6px 14px #FFFFFF' }}
              onTouchStart={e => { archiveTouchRef.current = e.touches[0].clientX }}
              onTouchEnd={e => {
                if (archiveTouchRef.current === null) return
                const diff = archiveTouchRef.current - e.changedTouches[0].clientX
                if (Math.abs(diff) > 40) {
                  if (diff > 0) setArchiveIdx(i => (i + 1) % ARCHIVE_IMAGES.length)
                  else setArchiveIdx(i => (i - 1 + ARCHIVE_IMAGES.length) % ARCHIVE_IMAGES.length)
                }
                archiveTouchRef.current = null
              }}
              onClick={() => window.open('https://archive.visitseoul.net', '_blank')}
            >
              <img
                key={archiveIdx}
                src={img.src}
                alt={L(lang, img.caption)}
                style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                loading="lazy"
              />
              <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.55) 0%, transparent 50%)' }} />
              <div style={{ position: 'absolute', bottom: 12, left: 16, right: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                <span style={{ fontSize: 17, fontWeight: 700, color: 'white' }}>{L(lang, img.caption)}</span>
                <div style={{ display: 'flex', gap: 4 }}>
                  {ARCHIVE_IMAGES.map((_, i) => (
                    <div key={i} style={{ width: i === archiveIdx ? 12 : 4, height: 4, borderRadius: 4, background: i === archiveIdx ? 'white' : 'rgba(255,255,255,0.4)', transition: 'all 0.3s' }} />
                  ))}
                </div>
              </div>
            </div>
          </div>
        )
      })()}

      {/* ─── 입국 풀스크린 ─── */}
      <FullPage
        open={arrivalOpen} onClose={() => setArrivalOpen(false)}
        titleLabel="home.quick.arrival"
        items={ARRIVAL_ITEMS} lang={lang} t={t} setSubPage={setSubPage} setTab={setTab}
      />

      {/* ─── 출국 풀스크린 ─── */}
      <FullPage
        open={departureOpen} onClose={() => setDepartureOpen(false)}
        titleLabel="home.quick.departure"
        items={DEPARTURE_ITEMS} lang={lang} t={t} setSubPage={setSubPage} setTab={setTab}
      />

      {/* ─── 통역·번역 풀스크린 ─── */}
      <FullPage
        open={translateOpen} onClose={() => setTranslateOpen(false)}
        titleLabel="home.quick.translate"
        items={TRANSLATE_ITEMS} lang={lang} t={t} setSubPage={setSubPage} setTab={setTab}
      />

      {/* ─── 더보기 → 추천 페이지 ─── */}
      {/* ─── 더보기 → 추천 페이지 ─── */}
      {showMore && (
        <DiscoverPage
          lang={lang} t={t}
          setSubPage={(sub) => { setSubPage(sub); setShowMore(false) }}
          setTab={(tab) => { setTab(tab); setShowMore(false) }}
          onClose={() => { setShowMore(false); setEditorialId(null) }}
          onEditorialClick={(id) => setEditorialId(id)}
        />
      )}

      {/* ─── 여행코스 리스트 페이지 ─── */}
      {showCourseList && (
        <CourseListPage
          onClose={() => setShowCourseList(false)}
          setTab={setTab}
        />
      )}

      {/* ─── 검색 오버레이 ─── */}
      {showSearchOverlay && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 9200, background: '#FAFAFA', display: 'flex', flexDirection: 'column', fontFamily: '-apple-system, "Pretendard", sans-serif' }}>

          {/* 헤더 */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 16px 10px', background: '#FAFAFA', flexShrink: 0, boxShadow: '0 4px 12px rgba(200,200,200,0.25)' }}>
            <button onClick={closeSearchOverlay} style={{ width: 40, height: 40, borderRadius: '50%', background: '#FAFAFA', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: '4px 4px 10px rgba(200,200,200,0.5), -4px -4px 10px #FFFFFF' }}>
              <ArrowLeft size={18} color="#888" />
            </button>
            <div style={{ flex: 1, position: 'relative' }}>
              <Search size={15} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#BBBBBB', pointerEvents: 'none' }} />
              <input
                ref={overlayInputRef}
                type="text"
                value={query}
                onChange={e => handleSearch(e.target.value)}
                placeholder={t(PH_KEYS[phIdx])}
                style={{ width: '100%', padding: '11px 36px', borderRadius: 50, border: 'none', outline: 'none', fontSize: 16, color: '#1A1A1A', background: '#FAFAFA', boxSizing: 'border-box', boxShadow: 'inset 3px 3px 8px rgba(190,190,190,0.35), inset -3px -3px 8px rgba(255,255,255,0.7)' }}
              />
              {query && (
                <button onClick={() => handleSearch('')} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}>
                  <X size={14} color="#BBBBBB" />
                </button>
              )}
            </div>
          </div>

          {/* 바디 */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '20px 20px' }}>

            {/* 검색어 없으면 최근 검색어 */}
            {!query && (
              <div>
                {recentSearches.length > 0 && (
                  <>
                    <p style={{ fontSize: 12, fontWeight: 700, color: '#888', letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: 12 }}>
                      {L(lang, { ko: '최근 검색', zh: '最近搜索', en: 'Recent' })}
                    </p>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                      {recentSearches.map(term => (
                        <div key={term} style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#FAFAFA', borderRadius: 20, padding: '7px 12px', boxShadow: '4px 4px 10px rgba(200,200,200,0.5), -4px -4px 10px #FFFFFF' }}>
                          <button onClick={() => handleSearch(term)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, color: '#1A1A1A', padding: 0 }}>{term}</button>
                          <button onClick={() => removeRecentSearch(term)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center' }}>
                            <X size={11} color="#BBBBBB" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </>
                )}
                <p style={{ fontSize: 12, fontWeight: 700, color: '#888', letterSpacing: '0.05em', textTransform: 'uppercase', margin: recentSearches.length > 0 ? '24px 0 12px' : '0 0 12px' }}>
                  {L(lang, { ko: '추천 검색어', zh: '推荐搜索', en: 'Suggestions' })}
                </p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {[
                    { ko: '홍대 맛집', zh: '弘大美食', en: 'Hongdae food' },
                    { ko: '명동 쇼핑', zh: '明洞购物', en: 'Myeongdong shopping' },
                    { ko: '강남 카페', zh: '江南咖啡', en: 'Gangnam cafe' },
                    { ko: '한복 체험', zh: '韩服体验', en: 'Hanbok experience' },
                    { ko: '경복궁', zh: '景福宫', en: 'Gyeongbokgung' },
                    { ko: '성수동 팝업', zh: '圣水洞快闪', en: 'Seongsu popup' },
                  ].map(s => (
                    <button key={s.ko} onClick={() => handleSearch(L(lang, s))}
                      style={{ background: '#FAFAFA', border: 'none', borderRadius: 20, padding: '7px 14px', fontSize: 13, color: '#C4725A', fontWeight: 600, cursor: 'pointer', boxShadow: '4px 4px 10px rgba(200,200,200,0.5), -4px -4px 10px #FFFFFF' }}>
                      {L(lang, s)}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* 로딩 스켈레톤 */}
            {query && loading && results.length === 0 && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} style={{ borderRadius: 20, overflow: 'hidden', boxShadow: '6px 6px 14px rgba(200,200,200,0.5), -6px -6px 14px #FFFFFF' }}>
                    <div className="skeleton" style={{ width: '100%', aspectRatio: '3/4' }} />
                    <div style={{ padding: '10px 12px 14px' }}>
                      <div className="skeleton" style={{ height: 14, marginBottom: 6, borderRadius: 4 }} />
                      <div className="skeleton" style={{ height: 11, width: '60%', borderRadius: 4 }} />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* 결과 없음 */}
            {query && !loading && results.length === 0 && (
              <div style={{ textAlign: 'center', paddingTop: 60 }}>
                <p style={{ fontSize: 32, marginBottom: 12 }}>🔍</p>
                <p style={{ fontSize: 15, color: '#888' }}>{L(lang, { ko: '검색 결과가 없어요', zh: '没有找到结果', en: 'No results found' })}</p>
              </div>
            )}

            {/* 결과 그리드 */}
            {query && results.length > 0 && (
              <>
                <p style={{ fontSize: 13, color: '#888', marginBottom: 12 }}>
                  {L(lang, { ko: `${total}건`, zh: `共${total}条`, en: `${total} results` })}
                </p>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                  {results.map(item => {
                    const isFeed = 'gradient' in item && !item.source
                    return (
                      <div key={item.id}
                        onClick={() => item.url && window.open(item.url, '_blank')}
                        style={{ borderRadius: 20, overflow: 'hidden', background: '#FAFAFA', boxShadow: '6px 6px 14px rgba(200,200,200,0.5), -6px -6px 14px #FFFFFF', cursor: item.url ? 'pointer' : 'default' }}
                        onTouchStart={e => { e.currentTarget.style.transform = 'scale(0.97)'; e.currentTarget.style.boxShadow = 'inset 3px 3px 8px rgba(190,190,190,0.35), inset -3px -3px 8px rgba(255,255,255,0.7)' }}
                        onTouchEnd={e => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = '6px 6px 14px rgba(200,200,200,0.5), -6px -6px 14px #FFFFFF' }}
                      >
                        <div style={{ width: '100%', aspectRatio: '3/4', background: item.image ? 'none' : (item.gradient || '#F0F0F0'), position: 'relative', overflow: 'hidden' }}>
                          {item.image && <img src={item.image} alt={item.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} loading="lazy" onError={e => { e.target.style.display = 'none' }} />}
                          {item.source === 'tour' && (
                            <span style={{ position: 'absolute', top: 8, left: 8, background: '#C4725A', color: 'white', fontSize: 9, fontWeight: 700, borderRadius: 6, padding: '2px 6px' }}>TourAPI</span>
                          )}
                        </div>
                        <div style={{ padding: '10px 12px 14px' }}>
                          <div style={{ fontSize: 14, fontWeight: 600, lineHeight: 1.4, color: '#1A1A1A', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                            {isFeed ? t(item.titleKey) : item.title}
                          </div>
                          <div style={{ fontSize: 11, color: item.source === 'tour' ? '#C4725A' : '#888', marginTop: 6 }}>
                            {item.source === 'tour'
                              ? (item.addr?.replace('서울특별시 ', '').slice(0, 16) || 'TourAPI')
                              : isFeed
                                ? (item.locationKey ? t(item.locationKey) : 'NEAR')
                                : (item.tags?.[0] ? `#${item.tags[0]}` : 'NEAR')
                            }
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* ─── 에디토리얼 상세 페이지 ─── */}
      {currentEditorial && (
        <EditorialDetailPage
          editorial={currentEditorial}
          lang={lang}
          onBack={() => setEditorialId(null)}
          setTab={setTab}
        />
      )}

      {/* ─── 타임존 선택 모달 ─── */}
      {showTzPicker && (
        <div onClick={() => setShowTzPicker(false)} style={{ position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'flex-end' }}>
          <div onClick={e => e.stopPropagation()} style={{ background: '#FAFAFA', borderRadius: '24px 24px 0 0', padding: '0 0 40px', width: '100%', boxShadow: '-4px -4px 16px rgba(255,255,255,0.9), 0 -6px 18px rgba(200,200,200,0.2)' }}>
            <div style={{ width: 40, height: 4, borderRadius: 2, background: 'var(--border)', margin: '12px auto 16px' }} />
            <div style={{ padding: '0 20px 12px', fontSize: 16, fontWeight: 700, color: 'var(--text-primary)' }}>
              {L(lang, { ko: '타임존 추가', zh: '添加时区', en: 'Add Timezone' })}
            </div>
            <div style={{ maxHeight: '55vh', overflowY: 'auto' }}>
              {TIMEZONE_OPTIONS.map(tz => {
                const isOn = tzSelection.includes(tz.id)
                return (
                  <button
                    key={tz.id}
                    onClick={() => {
                      const next = isOn ? tzSelection.filter(id => id !== tz.id) : [...tzSelection, tz.id]
                      setTzSelection(next)
                      localStorage.setItem('hanpocket_extra_timezones', JSON.stringify(next))
                      tzData.refresh()
                    }}
                    style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 14, padding: '14px 20px', background: 'none', border: 'none', cursor: 'pointer', borderTop: '1px solid var(--border)' }}
                  >
                    <span style={{ fontSize: 22 }}>{tz.flag}</span>
                    <span style={{ flex: 1, fontSize: 15, fontWeight: 500, color: 'var(--text-primary)', textAlign: 'left' }}>{L(lang, tz.name)}</span>
                    <span style={{ fontSize: 13, color: 'var(--text-muted)', marginRight: 8 }}>{getNHTimeForOffset(tz.offset)}</span>
                    <span style={{ width: 22, height: 22, borderRadius: '50%', background: isOn ? '#007AFF' : 'var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      {isOn && <span style={{ color: 'white', fontSize: 14, lineHeight: 1 }}>✓</span>}
                    </span>
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
