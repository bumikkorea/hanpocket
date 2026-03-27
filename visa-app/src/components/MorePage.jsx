/**
 * 3.4 더보기 페이지 — 긴급정보, 실용도구, 한국가이드, 커뮤니티, 설정
 * C 섹션(#51~#70) 가이드 페이지 연결 포함
 */

function L(lang, d) { if (typeof d === 'string') return d; return d?.[lang] || d?.en || d?.zh || d?.ko || '' }

const NEU = {
  bg: '#FFFFFF',
  shadowOut: '6px 6px 14px rgba(200,200,200,0.5), -6px -6px 14px #FFFFFF',
  terra: '#3182F6',
  textPrimary: '#191F28',
  textSecondary: '#8B95A1',
}

const SECTIONS = [
  {
    title: { ko: '공항 & 이동', zh: '机场 & 交通', en: 'Airport & Transit' },
    emoji: '✈️',
    items: [
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
      if (setSubPage) setSubPage(item.tool)
      return
    }
    if (item.sub) {
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
    <div style={{ padding: '16px 20px 0', background: NEU.bg, fontFamily: '-apple-system, "Pretendard", sans-serif' }}>
      {SECTIONS.map(section => (
        <div key={section.emoji} style={{ marginBottom: 28 }}>
          <p style={{ fontSize: 12, fontWeight: 700, color: NEU.textSecondary, letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 10, paddingLeft: 4 }}>
            {section.emoji}&nbsp; {L(lang, section.title)}
          </p>
          <div style={{ background: NEU.bg, borderRadius: 20, overflow: 'hidden', boxShadow: NEU.shadowOut }}>
            {section.items.map((item, i) => (
              <button
                key={item.id}
                onClick={() => handleItemClick(item)}
                style={{
                  width: '100%', display: 'flex', alignItems: 'center', gap: 12,
                  padding: '14px 18px', textAlign: 'left',
                  background: 'transparent', border: 'none', cursor: 'pointer',
                  borderTop: i > 0 ? '1px solid rgba(0,0,0,0.04)' : 'none',
                  transition: 'background 0.15s ease',
                }}
                onTouchStart={e => e.currentTarget.style.background = 'rgba(49,130,246,0.05)'}
                onTouchEnd={e => e.currentTarget.style.background = 'transparent'}
                onMouseDown={e => e.currentTarget.style.background = 'rgba(49,130,246,0.05)'}
                onMouseUp={e => e.currentTarget.style.background = 'transparent'}
              >
                <span style={{ fontSize: 20, flexShrink: 0 }}>{item.emoji}</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: 15, fontWeight: 500, color: NEU.textPrimary, margin: 0 }}>
                    {L(lang, item.label)}
                  </p>
                  {item.detail && (
                    <p style={{ fontSize: 12, color: NEU.textSecondary, margin: '2px 0 0' }}>
                      {typeof item.detail === 'string' ? item.detail : L(lang, item.detail)}
                    </p>
                  )}
                </div>
                <span style={{ color: '#8B95A1', flexShrink: 0, fontSize: 16 }}>›</span>
              </button>
            ))}
          </div>
        </div>
      ))}

      {/* NEAR 버전 정보 */}
      <div style={{ textAlign: 'center', marginTop: 28, paddingBottom: 0 }}>
        <p style={{ fontSize: 11, color: '#8B95A1', margin: 0 }}>NEAR v1.0.0</p>
        <p style={{ fontSize: 11, color: '#8B95A1', marginTop: 4 }}>到韩国，只需NEAR</p>
      </div>
    </div>
  )
}
