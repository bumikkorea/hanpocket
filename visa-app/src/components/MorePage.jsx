/**
 * 3.4 더보기 페이지 — 긴급정보, 실용도구, 한국가이드, 커뮤니티, 설정
 * C 섹션(#51~#70) 가이드 페이지 연결 포함
 */
import { ChevronRight } from 'lucide-react'

function L(lang, d) { if (typeof d === 'string') return d; return d?.[lang] || d?.en || d?.zh || d?.ko || '' }

const SECTIONS = [
  {
    title: { ko: '공항 & 이동', zh: '机场 & 交通', en: 'Airport & Transit' },
    emoji: '✈️',
    items: [
      { id: 'country-duty-free', emoji: '🌍', label: { ko: '국가별 면세한도', zh: '各国免税限额', en: 'Duty-Free Limits by Country' }, sub: 'country-duty-free' },
      { id: 'parcel-send',       emoji: '📦', label: { ko: '택배 보내기',     zh: '寄快递',       en: 'Ship Packages' },                 url: 'https://m.epost.go.kr' },
      { id: 'airport-to-seoul',  emoji: '🚆', label: { ko: '공항 → 서울',    zh: '机场→首尔',    en: 'Airport → Seoul' },               tab: 'travel' },
      { id: 'airport-from-seoul',emoji: '🚕', label: { ko: '공항 이동',      zh: '前往机场',     en: 'To Airport' },                   tab: 'travel' },
      { id: 'pet-entry',         emoji: '🐾', label: { ko: '펫 입국 가이드', zh: '宠物入境指南',  en: 'Pet Entry Guide' },               sub: 'pet-entry' },
      { id: 'airport-facilities',emoji: '🏢', label: { ko: '공항 시설 정보', zh: '机场设施信息',  en: 'Airport Facilities' },            url: 'https://www.airport.kr/ap/ko/svc/selectServiceFacilities.do' },
    ]
  },
  {
    title: { ko: '실용 도구', zh: '实用工具', en: 'Tools' },
    emoji: '🛠',
    items: [
      { id: 'tool-learn',    emoji: '📚', label: { ko: '한국어 학습', zh: '韩语学习', en: 'Korean Study' }, tool: 'learn' },
    ]
  },
  {
    title: { ko: '한국 가이드', zh: '韩国指南', en: 'Korea Guide' },
    emoji: '📖',
    items: [
      { id: 'guide-taxfree',   emoji: '🧾', label: { ko: '쇼핑 면세 가이드', zh: '退税购物指南', en: 'Tax-Free Shopping' }, sub: 'tax-free' },
      { id: 'guide-sim',       emoji: '📱', label: { ko: 'SIM/eSIM 구매', zh: '购买SIM/eSIM', en: 'Buy SIM/eSIM' }, sub: 'sim-guide' },
      { id: 'guide-weather',   emoji: '🌤️', label: { ko: '날씨별 추천 관광지', zh: '天气推荐景点', en: 'Weather Spots' }, sub: 'weather-recommend' },
      { id: 'guide-discover',  emoji: '🎟️', label: { ko: '디스커버서울패스', zh: '首尔探索通票', en: 'Discover Seoul Pass' }, sub: 'discover-pass' },
      { id: 'guide-hallyu',    emoji: '💜', label: { ko: '한류 체험 프로그램', zh: '韩流体验项目', en: 'Hallyu Experiences' }, sub: 'hallyu-exp' },
      { id: 'guide-hiking',    emoji: '🥾', label: { ko: '서울 등산 코스', zh: '首尔登山路线', en: 'Hiking Courses' }, sub: 'hiking' },
      { id: 'guide-events',    emoji: '📅', label: { ko: '오늘의 서울 행사', zh: '今日首尔活动', en: "Today's Seoul Events" }, sub: 'today-events' },
      { id: 'guide-hcourse',   emoji: '🗺️', label: { ko: '한류 테마 코스', zh: '韩流主题路线', en: 'Hallyu Course Map' }, sub: 'hallyu-course' },
      { id: 'guide-taste',     emoji: '🍽️', label: { ko: '서울의 맛 가이드', zh: '首尔美食指南', en: 'Taste of Seoul' }, sub: 'taste-seoul' },
      { id: 'guide-medical',   emoji: '🏥', label: { ko: '의료관광 가이드', zh: '医疗旅游指南', en: 'Medical Tourism' }, sub: 'medical-tourism' },
      { id: 'guide-stay',      emoji: '🏠', label: { ko: '서울 스테이', zh: '首尔住宿', en: 'Seoul Stay' }, sub: 'seoul-stay' },
      { id: 'guide-culture',   emoji: '🎨', label: { ko: '문화 라운지', zh: '文化空间', en: 'Culture Lounge' }, sub: 'culture-lounge' },
      { id: 'guide-fitness',   emoji: '🏋️', label: { ko: '운동 가이드', zh: '健身指南', en: 'Fitness Guide' }, tool: 'fitness' },
    ]
  },
  {
    title: { ko: '커뮤니티', zh: '社区', en: 'Community' },
    emoji: '💬',
    items: [
      { id: 'comm-wechat', emoji: '💚', label: { ko: '위챗방 참여', zh: '加入微信群', en: 'Join WeChat Group' }, external: true },
      { id: 'comm-xhs',    emoji: '📕', label: { ko: 'NEAR 小红书', zh: 'NEAR小红书', en: 'NEAR Xiaohongshu' }, external: true },
      { id: 'comm-feedback',emoji: '✉️', label: { ko: '의견 보내기', zh: '发送反馈', en: 'Send Feedback' } },
    ]
  },
  {
    title: { ko: '긴급 정보', zh: '紧急信息', en: 'Emergency' },
    emoji: '🆘',
    items: [
      { id: 'sos-langcard', emoji: '🗣️', label: { ko: '긴급 한국어 카드', zh: '紧急韩语卡', en: 'Emergency Korean Card' }, sub: 'sos-language' },
      { id: 'sos-phone',    emoji: '📞', label: { ko: '긴급 전화번호', zh: '紧急电话', en: 'Emergency Numbers' }, sub: 'emergency-numbers' },
      { id: 'sos-hospital', emoji: '🏥', label: { ko: '가까운 병원', zh: '附近医院', en: 'Nearby Hospital' }, action: 'search', query: '외국인진료 병원' },
      { id: 'sos-lost',     emoji: '📦', label: { ko: '분실물 신고', zh: '失物报告', en: 'Lost & Found' }, sub: 'lost-item' },
      { id: 'sos-allergy',  emoji: '⚠️', label: { ko: '알레르기 카드', zh: '过敏卡', en: 'Allergy Card' }, sub: 'allergy-card' },
    ]
  },
]

export default function MorePage({ lang, setTab, setSubPage }) {
  const handleItemClick = (item) => {
    if (item.url) {
      window.open(item.url, '_blank')
      return
    }
    if (item.tool) {
      // subPage로 직접 열기
      if (setSubPage) setSubPage(item.tool)
      return
    }
    if (item.sub) {
      // C 섹션 가이드 페이지로 이동
      if (setSubPage) setSubPage(item.sub)
      else if (setTab) setTab(item.sub)
    } else if (item.tab) {
      setTab(item.tab)
    } else if (item.action === 'search' && item.query) {
      window.open(`https://map.kakao.com/link/search/${encodeURIComponent(item.query)}`, '_blank')
    } else if (item.detail && item.id?.startsWith('sos-')) {
      const phone = item.detail.split('/')[0].trim()
      window.open(`tel:${phone}`)
    } else if (item.id === 'set-cache') {
      if (confirm(L(lang, { ko: '캐시를 삭제하시겠습니까?', zh: '确定清除缓存吗？', en: 'Clear cache?' }))) {
        localStorage.clear()
        window.location.reload()
      }
    }
  }

  return (
    <div className="px-5 pt-4 pb-0 animate-fade-up">
      {SECTIONS.map(section => (
        <div key={section.emoji} className="mb-8">
          <p className="text-[17px] font-semibold text-[var(--text-primary)] mb-3">
            {L(lang, section.title)}
          </p>
          <div className="bg-white rounded-[16px] overflow-hidden" style={{ boxShadow: 'var(--shadow-card)' }}>
            {section.items.map((item, i) => (
              <button key={item.id}
                onClick={() => handleItemClick(item)}
                className="w-full flex items-center gap-3 px-5 py-4 text-left active:bg-[var(--surface)] transition-colors"
                style={i > 0 ? { borderTop: '1px solid var(--border)' } : {}}>
                <span className="text-[18px]">{item.emoji}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-[15px] font-medium text-[var(--text-primary)]">{L(lang, item.label)}</p>
                  {item.detail && <p className="text-[13px] text-[var(--text-muted)] mt-0.5">{typeof item.detail === 'string' ? item.detail : L(lang, item.detail)}</p>}
                </div>
                <ChevronRight size={16} className="text-[var(--text-hint)] shrink-0" />
              </button>
            ))}
          </div>
        </div>
      ))}

      {/* NEAR 버전 정보 */}
      <div className="text-center mt-8 mb-0">
        <p className="text-[11px] text-[var(--text-hint)]">NEAR v1.0.0</p>
        <p className="text-[11px] text-[var(--text-hint)] mt-1">到韩国，只需NEAR</p>
      </div>
    </div>
  )
}
