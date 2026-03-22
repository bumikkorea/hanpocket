/**
 * MySeoulPage — 내 서울 통합 페이지
 * 하트 저장 매장 + 코스 만들기 통합
 */
import { useState, useEffect, useRef, useCallback } from 'react'
import { ChevronUp, ChevronDown, X, Map, List } from 'lucide-react'
import { useLanguage } from '../i18n/index.jsx'
import { tLang } from '../locales/index.js'
import { getMySeoul, removePin, saveMyCourse, deleteMyCourse } from '../utils/mySeoul.js'
import { CATEGORY_CONFIG } from '../data/poiData'
import { useToast } from './Toast.jsx'
import NearPageHeader from './NearPageHeader.jsx'

function L(lang, d) {
  if (typeof d === 'string') return d
  return d?.[lang] || d?.zh || d?.ko || d?.en || ''
}

function PinCard({ pin, lang, onRemove, onMoveUp, onMoveDown, isFirst, isLast, courseMode }) {
  const cfg = CATEGORY_CONFIG[pin.category] || CATEGORY_CONFIG.popup
  const name = pin[`name_${lang}`] || pin.name_ko || pin.name_zh || pin.name_en || ''
  const date = pin.addedAt
    ? new Date(pin.addedAt).toLocaleDateString(
        lang === 'ko' ? 'ko-KR' : lang === 'zh' ? 'zh-CN' : 'en-US',
        { month: 'short', day: 'numeric' }
      )
    : ''
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 0', borderBottom: '0.5px solid var(--border)' }}>
      <div style={{ width: 36, height: 36, borderRadius: 10, background: cfg.color, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <span style={{ color: 'white', fontSize: 16, fontWeight: 700 }}>{cfg.letter}</span>
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{name}</div>
        <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>{date}</div>
      </div>
      {courseMode && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <button onClick={onMoveUp} disabled={isFirst} style={{ background: 'none', border: 'none', cursor: isFirst ? 'default' : 'pointer', opacity: isFirst ? 0.3 : 1, padding: 2 }}>
            <ChevronUp size={16} color="#555" />
          </button>
          <button onClick={onMoveDown} disabled={isLast} style={{ background: 'none', border: 'none', cursor: isLast ? 'default' : 'pointer', opacity: isLast ? 0.3 : 1, padding: 2 }}>
            <ChevronDown size={16} color="#555" />
          </button>
        </div>
      )}
      <button
        onClick={onRemove}
        style={{ width: 28, height: 28, borderRadius: '50%', background: 'rgba(0,0,0,0.06)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}
      >
        <X size={13} color="#555" />
      </button>
    </div>
  )
}

export default function MySeoulPage({ onBack, setTab }) {
  const { lang } = useLanguage()
  const { showToast } = useToast()
  const [viewMode, setViewMode] = useState('map')
  const [data, setData] = useState(() => getMySeoul())
  const [orderedPins, setOrderedPins] = useState(() => getMySeoul().pins)
  const [courseMode, setCourseMode] = useState(false)
  const [courseTitle, setCourseTitle] = useState('')
  const [selectedPin, setSelectedPin] = useState(null)

  const mapRef = useRef(null)
  const mapInstance = useRef(null)

  const reload = useCallback(() => {
    const d = getMySeoul()
    setData(d)
    setOrderedPins(d.pins)
  }, [])

  // 지도 초기화
  useEffect(() => {
    if (viewMode !== 'map') return

    const init = () => {
      if (!mapRef.current || mapInstance.current) return
      const pins = getMySeoul().pins
      const center = pins.length > 0
        ? { lat: pins[0].lat, lng: pins[0].lng }
        : { lat: 37.5665, lng: 126.9780 }

      const map = new window.kakao.maps.Map(mapRef.current, {
        center: new window.kakao.maps.LatLng(center.lat, center.lng),
        level: 5,
      })
      mapInstance.current = map

      pins.forEach(pin => {
        const cfg = CATEGORY_CONFIG[pin.category] || CATEGORY_CONFIG.popup
        const el = document.createElement('div')
        el.innerHTML = `
          <div style="position:relative;display:flex;flex-direction:column;align-items:center;cursor:pointer;">
            <div style="width:36px;height:36px;background:${cfg.color};border-radius:50%;border:2.5px solid white;box-shadow:0 1px 3px rgba(0,0,0,0.2);display:flex;align-items:center;justify-content:center;color:white;font-size:14px;font-weight:700;">${cfg.letter}</div>
            <div style="width:0;height:0;border-left:4px solid transparent;border-right:4px solid transparent;border-top:6px solid ${cfg.color};margin-top:-1px;"></div>
          </div>
        `
        el.addEventListener('click', () => setSelectedPin(pin))
        new window.kakao.maps.CustomOverlay({
          map,
          position: new window.kakao.maps.LatLng(pin.lat, pin.lng),
          content: el,
          zIndex: 5,
        })
      })
    }

    if (window.kakao?.maps) {
      init()
    } else {
      const apiKey = import.meta.env.VITE_KAKAO_MAP_API_KEY
      if (!apiKey) return
      const script = document.createElement('script')
      script.src = `//dapi.kakao.com/v2/maps/sdk.js?appkey=${apiKey}&libraries=services&autoload=false&hl=en`
      script.onload = () => window.kakao.maps.load(init)
      script.onerror = () => {}
      document.head.appendChild(script)
    }
  }, [viewMode])

  // 뷰모드 전환 시 맵 인스턴스 초기화 (재진입 시 재생성)
  useEffect(() => {
    if (viewMode !== 'map') {
      mapInstance.current = null
    }
  }, [viewMode])

  const handleRemovePin = (pinId) => {
    removePin(pinId)
    if (selectedPin?.id === pinId) setSelectedPin(null)
    mapInstance.current = null
    reload()
  }

  const handleMoveUp = (idx) => {
    if (idx === 0) return
    setOrderedPins(prev => {
      const next = [...prev];
      [next[idx - 1], next[idx]] = [next[idx], next[idx - 1]]
      return next
    })
  }

  const handleMoveDown = (idx) => {
    setOrderedPins(prev => {
      if (idx >= prev.length - 1) return prev
      const next = [...prev];
      [next[idx], next[idx + 1]] = [next[idx + 1], next[idx]]
      return next
    })
  }

  const handleSaveCourse = () => {
    const title = courseTitle.trim()
    if (!title || orderedPins.length < 2) return
    saveMyCourse(title, orderedPins.map(p => p.id))
    showToast({ type: 'success', message: tLang('mySeoul.courseSaved', lang) })
    setCourseMode(false)
    setCourseTitle('')
    reload()
  }

  const handleCourseCardClick = (course) => {
    sessionStorage.setItem('near_pending_course', course.id)
    onBack()
    setTab('near-map')
  }

  const handleDeleteCourse = (courseId) => {
    deleteMyCourse(courseId)
    reload()
  }

  const { pins, courses } = data

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 9500, background: 'var(--bg)', display: 'flex', flexDirection: 'column', fontFamily: '"Noto Sans SC", Pretendard, Inter, sans-serif' }}>

      <NearPageHeader onBack={onBack} setTab={setTab} />

      {/* 타이틀 + 토글 */}
      <div style={{ padding: '14px 20px 0', flexShrink: 0 }}>
        <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 10 }}>
          {tLang('mySeoul.title', lang)}
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          {[
            { id: 'map', Icon: Map, label: tLang('mySeoul.map', lang) },
            { id: 'list', Icon: List, label: tLang('mySeoul.list', lang) },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setViewMode(tab.id)}
              style={{
                flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                padding: '8px 0', borderRadius: 20, border: 'none', cursor: 'pointer',
                fontSize: 13, fontWeight: 700,
                background: viewMode === tab.id ? 'var(--primary, #C4725A)' : 'var(--surface)',
                color: viewMode === tab.id ? 'white' : 'var(--text-secondary)',
              }}
            >
              <tab.Icon size={14} />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* ─── 지도 모드 ─── */}
      {viewMode === 'map' && (
        <div style={{ flex: 1, position: 'relative', marginTop: 10 }}>
          <div ref={mapRef} style={{ width: '100%', height: '100%' }} />

          {pins.length === 0 && (
            <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none' }}>
              <div style={{ textAlign: 'center', background: 'rgba(255,255,255,0.92)', borderRadius: 16, padding: '20px 28px', boxShadow: '0 2px 12px rgba(0,0,0,0.08)' }}>
                <div style={{ fontSize: 36, marginBottom: 8 }}>♡</div>
                <div style={{ fontSize: 14, color: 'var(--text-muted)' }}>
                  {tLang('mySeoul.empty', lang)}
                </div>
              </div>
            </div>
          )}

          {/* 핀 탭 → 바텀 카드 */}
          {selectedPin && (
            <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'white', borderRadius: '16px 16px 0 0', padding: '16px 20px 28px', boxShadow: '0 -4px 20px rgba(0,0,0,0.1)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 40, height: 40, borderRadius: 10, background: (CATEGORY_CONFIG[selectedPin.category] || CATEGORY_CONFIG.popup).color, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <span style={{ color: 'white', fontSize: 18, fontWeight: 700 }}>
                    {(CATEGORY_CONFIG[selectedPin.category] || CATEGORY_CONFIG.popup).letter}
                  </span>
                </div>
                <div style={{ flex: 1, fontSize: 15, fontWeight: 700, color: '#1A1A1A', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {selectedPin[`name_${lang}`] || selectedPin.name_ko || selectedPin.name_zh || ''}
                </div>
                <button
                  onClick={() => handleRemovePin(selectedPin.id)}
                  style={{ padding: '6px 12px', borderRadius: 20, border: '1px solid #FF3B30', background: 'none', cursor: 'pointer', fontSize: 12, color: '#FF3B30', fontWeight: 600 }}
                >
                  {L(lang, { zh: '移除', ko: '제거', en: 'Remove' })}
                </button>
                <button
                  onClick={() => setSelectedPin(null)}
                  style={{ width: 28, height: 28, borderRadius: '50%', background: '#F5F5F5', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                >
                  <X size={14} color="#555" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ─── 리스트 모드 ─── */}
      {viewMode === 'list' && (
        <div style={{ flex: 1, overflowY: 'auto', position: 'relative', marginTop: 10 }}>
          <div style={{ padding: '0 20px 140px' }}>

            {/* 코스 만들기 모드 — 이름 입력 */}
            {courseMode && (
              <div style={{ marginBottom: 16, padding: '12px 14px', borderRadius: 12, background: 'var(--surface)', border: '1.5px solid var(--primary, #C4725A)' }}>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 6 }}>
                  <input
                    value={courseTitle}
                    onChange={e => setCourseTitle(e.target.value)}
                    placeholder={L(lang, { zh: '请输入路线名称...', ko: '코스 이름 입력...', en: 'Course name...' })}
                    autoFocus
                    style={{ flex: 1, padding: '8px 12px', borderRadius: 8, border: '1px solid var(--border)', fontSize: 14, outline: 'none', fontFamily: 'inherit', background: 'white' }}
                  />
                  <button
                    onClick={handleSaveCourse}
                    disabled={!courseTitle.trim() || orderedPins.length < 2}
                    style={{
                      padding: '8px 14px', borderRadius: 8,
                      background: courseTitle.trim() && orderedPins.length >= 2 ? 'var(--primary, #C4725A)' : '#E5E7EB',
                      color: courseTitle.trim() && orderedPins.length >= 2 ? 'white' : '#9CA3AF',
                      border: 'none', cursor: courseTitle.trim() && orderedPins.length >= 2 ? 'pointer' : 'default',
                      fontSize: 13, fontWeight: 700, flexShrink: 0,
                    }}
                  >
                    {L(lang, { zh: '保存', ko: '저장', en: 'Save' })}
                  </button>
                  <button
                    onClick={() => { setCourseMode(false); setCourseTitle('') }}
                    style={{ width: 32, height: 32, borderRadius: '50%', background: 'rgba(0,0,0,0.06)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}
                  >
                    <X size={14} color="#555" />
                  </button>
                </div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                  {L(lang, { zh: '用上下箭头调整顺序', ko: '화살표로 순서를 조정하세요', en: 'Use arrows to reorder stops' })}
                </div>
              </div>
            )}

            {/* 저장된 매장 리스트 */}
            {orderedPins.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '60px 0' }}>
                <div style={{ fontSize: 44, marginBottom: 12 }}>♡</div>
                <div style={{ fontSize: 14, color: 'var(--text-muted)', marginBottom: 20 }}>
                  {tLang('mySeoul.empty', lang)}
                </div>
                <button
                  onClick={() => { onBack(); setTab('near-map') }}
                  style={{ padding: '10px 20px', borderRadius: 20, background: 'var(--primary, #C4725A)', color: 'white', border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 600 }}
                >
                  {tLang('mySeoul.goExplore', lang)}
                </button>
              </div>
            ) : (
              <div>
                {orderedPins.map((pin, idx) => (
                  <PinCard
                    key={pin.id}
                    pin={pin}
                    lang={lang}
                    courseMode={courseMode}
                    isFirst={idx === 0}
                    isLast={idx === orderedPins.length - 1}
                    onRemove={() => handleRemovePin(pin.id)}
                    onMoveUp={() => handleMoveUp(idx)}
                    onMoveDown={() => handleMoveDown(idx)}
                  />
                ))}
              </div>
            )}

            {/* ─── 내 코스 섹션 ─── */}
            {courses.length > 0 && (
              <div style={{ marginTop: 28 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 12, letterSpacing: '0.02em' }}>
                  {tLang('mySeoul.myCourses', lang)}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {courses.map(course => (
                    <div key={course.id} style={{ position: 'relative' }}>
                      <button
                        onClick={() => handleCourseCardClick(course)}
                        style={{ width: '100%', padding: '14px 44px 14px 16px', borderRadius: 12, background: 'var(--surface)', border: '1px solid var(--border)', cursor: 'pointer', textAlign: 'left' }}
                      >
                        <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>{course.title}</div>
                        <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                          {course.pinIds?.length || 0}
                          {L(lang, { zh: '个景点', ko: '개 경유지', en: ' stops' })}
                        </div>
                      </button>
                      <button
                        onClick={() => handleDeleteCourse(course.id)}
                        style={{ position: 'absolute', top: '50%', right: 12, transform: 'translateY(-50%)', width: 26, height: 26, borderRadius: '50%', background: 'rgba(0,0,0,0.08)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                      >
                        <X size={12} color="#555" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* ─── 코스로 정리하기 CTA ─── */}
          {orderedPins.length >= 2 && !courseMode && (
            <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, padding: '16px 20px 28px', background: 'linear-gradient(transparent, var(--bg) 35%)' }}>
              <button
                onClick={() => setCourseMode(true)}
                style={{ width: '100%', padding: '14px', borderRadius: 14, background: 'var(--primary, #C4725A)', color: 'white', border: 'none', cursor: 'pointer', fontSize: 15, fontWeight: 700, boxShadow: '0 4px 16px rgba(196,114,90,0.35)' }}
              >
                {tLang('mySeoul.makeCourse', lang)}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
