/**
 * CourseListPage — 여행코스 리스트 풀스크린 페이지
 * 홈탭 "여행코스" 퀵액션 → 이 페이지 → 코스 탭 클릭 → NearMap 코스 모드 자동 활성화
 */
import { Clock, MapPin, ChevronRight } from 'lucide-react'
import { useLanguage } from '../i18n/index.jsx'
import { COURSE_DATA } from '../data/courseData.js'
import NearPageHeader from './NearPageHeader.jsx'

function L(lang, d) { if (typeof d === 'string') return d; return d?.[lang] || d?.zh || d?.ko || d?.en || '' }

const TYPE_GRADIENT = {
  walking: 'linear-gradient(135deg, #E8F5E9, #C8E6C9)',
  kpop:    'linear-gradient(135deg, #F3E5F5, #E1BEE7)',
  food:    'linear-gradient(135deg, #FFF3E0, #FFE0B2)',
  custom:  'linear-gradient(135deg, #E3F2FD, #BBDEFB)',
}

const TYPE_COLOR = {
  walking: '#4CAF50',
  kpop:    '#9C27B0',
  food:    '#FF9800',
  custom:  '#2196F3',
}

const TYPE_LABEL = {
  walking: { zh: '步行路线', ko: '도보 코스', en: 'Walking' },
  kpop:    { zh: 'K-POP', ko: 'K-POP', en: 'K-POP' },
  food:    { zh: '美食路线', ko: '맛집 코스', en: 'Food' },
  custom:  { zh: '自定义', ko: '커스텀', en: 'Custom' },
}

export default function CourseListPage({ onClose, setTab }) {
  const { lang } = useLanguage()

  const handleCourseClick = (course) => {
    // NearMap에 pending course 신호 전달 (sessionStorage)
    sessionStorage.setItem('near_pending_course', course.id)
    onClose()
    setTab('near-map')
  }

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 9500, background: 'var(--bg)', display: 'flex', flexDirection: 'column', fontFamily: '"Noto Sans SC", Pretendard, Inter, sans-serif' }}>

      <NearPageHeader onBack={onClose} setTab={setTab} />

      <div style={{ flex: 1, overflowY: 'auto', padding: '20px 20px 48px' }}>

        {/* 타이틀 */}
        <div style={{ marginBottom: 24 }}>
          <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
            {L(lang, { zh: '旅行路线', ko: '여행코스', en: 'Travel Courses' })}
          </div>
          <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4 }}>
            {L(lang, { zh: '精选首尔漫步路线，点击即可在地图中导航', ko: '서울 큐레이션 코스 — 클릭하면 지도에서 바로 탐색', en: 'Curated Seoul routes — tap to explore on map' })}
          </div>
        </div>

        {/* 코스 카드 리스트 */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {COURSE_DATA.map((course, idx) => {
            const gradient = TYPE_GRADIENT[course.type] || TYPE_GRADIENT.custom
            const accentColor = TYPE_COLOR[course.type] || TYPE_COLOR.custom
            const typeLabel = TYPE_LABEL[course.type] || TYPE_LABEL.custom
            const stopCount = course.stop_count || course.poi_ids?.length || course.stops?.length || 0

            return (
              <button
                key={course.id}
                onClick={() => handleCourseClick(course)}
                style={{
                  height: 120, borderRadius: 16,
                  background: gradient,
                  border: 'none', cursor: 'pointer',
                  position: 'relative', textAlign: 'left',
                  padding: '0 52px 0 20px',
                  display: 'flex', alignItems: 'center',
                  overflow: 'hidden',
                  transition: 'transform 0.15s',
                  boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
                }}
                onTouchStart={e => e.currentTarget.style.transform = 'scale(0.98)'}
                onTouchEnd={e => e.currentTarget.style.transform = 'scale(1)'}
              >
                {/* 배경 번호 */}
                <div style={{
                  position: 'absolute', right: -6, top: '50%', transform: 'translateY(-50%)',
                  fontSize: 80, fontWeight: 900, lineHeight: 1,
                  color: 'rgba(0,0,0,0.07)', fontFamily: 'Inter, sans-serif',
                  userSelect: 'none', pointerEvents: 'none',
                }}>
                  {String(idx + 1).padStart(2, '0')}
                </div>

                {/* 콘텐츠 */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  {/* 타입 뱃지 */}
                  <span style={{
                    display: 'inline-block', fontSize: 10, fontWeight: 700,
                    color: accentColor, background: accentColor + '22',
                    borderRadius: 8, padding: '2px 8px', marginBottom: 7,
                    letterSpacing: '0.04em',
                  }}>
                    {L(lang, typeLabel)}
                  </span>

                  {/* 제목 */}
                  <div style={{
                    fontSize: 16, fontWeight: 700, color: '#1A1A1A',
                    lineHeight: 1.3, marginBottom: 4,
                    whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                  }}>
                    {L(lang, { zh: course.title_zh, ko: course.title_ko, en: course.title_en })}
                  </div>

                  {/* 설명 */}
                  <div style={{
                    fontSize: 12, color: '#555',
                    display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical',
                    overflow: 'hidden', marginBottom: 8,
                  }}>
                    {L(lang, { zh: course.description_zh, ko: course.description_ko, en: course.description_en })}
                  </div>

                  {/* 소요시간 + 경유지 수 */}
                  <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: '#777' }}>
                      <Clock size={11} color="#999" />
                      {course.estimated_hours}
                      {L(lang, { zh: '小时', ko: '시간', en: 'h' })}
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: '#777' }}>
                      <MapPin size={11} color="#999" />
                      {stopCount}
                      {L(lang, { zh: '个景点', ko: '개 경유지', en: ' stops' })}
                    </span>
                  </div>
                </div>

                {/* 화살표 */}
                <div style={{
                  position: 'absolute', right: 16, top: '50%', transform: 'translateY(-50%)',
                  width: 28, height: 28, borderRadius: '50%',
                  background: 'rgba(0,0,0,0.09)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <ChevronRight size={14} color="#333" />
                </div>
              </button>
            )
          })}
        </div>

        {/* 하단 힌트 */}
        <div style={{ marginTop: 24, padding: '14px 16px', borderRadius: 12, background: 'var(--surface)' }}>
          <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: 0, lineHeight: 1.6, textAlign: 'center' }}>
            {L(lang, { zh: '点击路线，在地图上查看详细停靠点和导航路径', ko: '코스를 클릭하면 지도에서 경유지와 이동 경로를 확인할 수 있어요', en: 'Tap a course to see stops and route on the map' })}
          </p>
        </div>

      </div>
    </div>
  )
}
