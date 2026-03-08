import { useState, useEffect, useRef, useCallback } from 'react'
import { ChevronLeft, Plus, Trash2, ChevronUp, ChevronDown, Clock, ArrowRight, Navigation, Share2 } from 'lucide-react'
import { RECOMMENDED_COURSES, COURSE_CATEGORIES } from '../data/recommendedCourses'

function L(lang, d) {
  if (typeof d === 'string') return d
  return d?.[lang] || d?.en || d?.zh || d?.ko || ''
}

// ─── KakaoMap 로드 (MapTab 패턴 재사용) ───
function loadKakaoMapAPI() {
  return new Promise((resolve, reject) => {
    if (window.kakao && window.kakao.maps) {
      resolve(window.kakao)
      return
    }
    const apiKey = import.meta.env.VITE_KAKAO_MAP_API_KEY
    if (!apiKey) { reject(new Error('API 키 없음')); return }
    const script = document.createElement('script')
    script.src = `//dapi.kakao.com/v2/maps/sdk.js?appkey=${apiKey}&libraries=services&autoload=false`
    script.onload = () => { window.kakao.maps.load(() => resolve(window.kakao)) }
    script.onerror = () => reject(new Error('카카오맵 로드 실패'))
    document.head.appendChild(script)
  })
}

// 이동수단 이모지
const TRANSPORT_ICON = { walk: '🚶', subway: '🚇', bus: '🚌', taxi: '🚕', car: '🚗' }
// 장소 타입 이모지
const STOP_TYPE_ICON = { shopping: '🛍️', food: '🍜', tourism: '🏛️', nature: '🌿', cafe: '☕', exhibition: '🎨', park: '🌿', walk: '🚶' }
// 장소 타입 배경색
const STOP_TYPE_BG = { cafe: '#F9DEBB', exhibition: '#FFD4BC', park: '#D4EDDA', walk: '#E8E8E8', food: '#FFECD2', shopping: '#E8D5F5', tourism: '#D4E6F1', nature: '#D4EDDA' }
// 장소 타입 다국어 라벨
const STOP_TYPE_LABEL = {
  cafe: { ko: '카페', zh: '咖啡', en: 'Cafe' },
  exhibition: { ko: '전시/포토존', zh: '展览/拍照', en: 'Exhibition' },
  park: { ko: '공원/산책', zh: '公园/散步', en: 'Park' },
  food: { ko: '맛집', zh: '美食', en: 'Food' },
  shopping: { ko: '쇼핑', zh: '购物', en: 'Shopping' },
  tourism: { ko: '관광', zh: '观光', en: 'Tourism' },
  walk: { ko: '산책', zh: '散步', en: 'Walk' },
  nature: { ko: '자연', zh: '自然', en: 'Nature' },
}
// 편의태그 다국어
const FEATURE_LABEL = {
  card: { ko: '💳 카드결제', zh: '💳 刷卡', en: '💳 Card' },
  english_menu: { ko: '🌐 영어메뉴', zh: '🌐 英文菜单', en: '🌐 English menu' },
  free: { ko: '🆓 무료', zh: '🆓 免费', en: '🆓 Free' },
}
// 난이도 라벨
const DIFF_LABEL = { easy: { ko: '쉬움', zh: '轻松', en: 'Easy' }, medium: { ko: '보통', zh: '适中', en: 'Medium' }, hard: { ko: '힘듦', zh: '较累', en: 'Hard' } }

// 시간 문자열 파싱 ("2h", "1.5h", "45min", "30min" → 분)
function parseDuration(dur) {
  if (!dur) return 60
  const str = dur.toString().toLowerCase()
  if (str.includes('h')) {
    const h = parseFloat(str)
    return Math.round(h * 60)
  }
  const m = parseInt(str)
  return isNaN(m) ? 60 : m
}

// ═══════════════════════════════════════════════
// CourseMap — 코스 상세의 카카오맵
// ═══════════════════════════════════════════════
function CourseMap({ stops }) {
  const mapRef = useRef(null)
  const [mapReady, setMapReady] = useState(false)

  useEffect(() => {
    let cancelled = false
    const init = async () => {
      try {
        await loadKakaoMapAPI()
        if (cancelled || !mapRef.current) return

        const kakao = window.kakao
        const center = new kakao.maps.LatLng(stops[0].lat, stops[0].lng)
        const map = new kakao.maps.Map(mapRef.current, { center, level: 7 })

        // 마커 + bounds
        const bounds = new kakao.maps.LatLngBounds()
        const path = []

        stops.forEach((stop, i) => {
          const pos = new kakao.maps.LatLng(stop.lat, stop.lng)
          bounds.extend(pos)
          path.push(pos)

          // 순번 SVG 마커
          const svg = `<svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg" width="32" height="32">
            <circle cx="16" cy="16" r="14" fill="#111827" stroke="white" stroke-width="2"/>
            <text x="16" y="21" text-anchor="middle" fill="white" font-size="14" font-weight="bold" font-family="Inter,sans-serif">${i + 1}</text>
          </svg>`
          const img = new kakao.maps.MarkerImage(
            'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg),
            new kakao.maps.Size(32, 32)
          )
          new kakao.maps.Marker({ map, position: pos, image: img })
        })

        // 점선 폴리라인
        if (path.length > 1) {
          new kakao.maps.Polyline({
            map,
            path,
            strokeWeight: 3,
            strokeColor: '#111827',
            strokeOpacity: 0.5,
            strokeStyle: 'dash',
          })
        }

        map.setBounds(bounds, 50)
        setMapReady(true)
      } catch (e) {
        console.warn('CourseMap init failed:', e)
      }
    }
    init()
    return () => { cancelled = true }
  }, [stops])

  return (
    <div className="relative rounded-[6px] overflow-hidden border border-[#E5E7EB]" style={{ height: 200 }}>
      <div ref={mapRef} className="w-full h-full" />
      {!mapReady && (
        <div className="absolute inset-0 bg-[#F5F5F5] flex items-center justify-center">
          <span className="text-xs text-[#9CA3AF]">Loading map...</span>
        </div>
      )}
    </div>
  )
}

// ═══════════════════════════════════════════════
// CourseCard — 추천 코스 카드 (리스트용)
// ═══════════════════════════════════════════════
function CourseCard({ course, lang, onPress }) {
  return (
    <button
      onClick={onPress}
      className="w-full bg-white rounded-[6px] border border-[#E5E7EB] p-4 text-left active:scale-[0.98] transition-transform"
    >
      <div className="flex items-start gap-3">
        <span className="text-3xl">{course.coverEmoji}</span>
        <div className="flex-1 min-w-0">
          <p className="font-bold text-sm text-[#111827] leading-tight">{L(lang, course.name)}</p>
          <p className="text-xs text-[#6B7280] mt-1 line-clamp-1">{L(lang, course.description)}</p>
          {/* 경유지 도트 연결 */}
          <div className="flex items-center gap-1 mt-2 flex-wrap">
            {course.stops.map((s, i) => (
              <span key={i} className="flex items-center gap-1">
                <span className="text-[10px]">{STOP_TYPE_ICON[s.type] || '📍'}</span>
                <span className="text-[10px] text-[#374151] font-medium">{L(lang, s.name)}</span>
                {i < course.stops.length - 1 && <ArrowRight size={10} className="text-[#9CA3AF] mx-0.5" />}
              </span>
            ))}
          </div>
          {/* 메타 */}
          <div className="flex items-center gap-3 mt-2">
            <span className="flex items-center gap-1 text-[10px] text-[#9CA3AF]">
              <Clock size={10} /> {course.duration}
            </span>
            <span className="text-[10px] text-[#9CA3AF]">{L(lang, DIFF_LABEL[course.difficulty] || {})}</span>
            <span className="text-[10px] text-[#9CA3AF]">{L(lang, course.estimatedCost)}</span>
          </div>
        </div>
      </div>
    </button>
  )
}

// ═══════════════════════════════════════════════
// MyCourseCard — 내 코스 카드
// ═══════════════════════════════════════════════
function MyCourseCard({ course, lang, onPress, onDelete }) {
  return (
    <div className="bg-white rounded-[6px] border border-[#E5E7EB] p-4 flex items-center gap-3">
      <button onClick={onPress} className="flex-1 text-left min-w-0 active:scale-[0.98] transition-transform">
        <p className="font-bold text-sm text-[#111827] truncate">{course.name}</p>
        <p className="text-[10px] text-[#9CA3AF] mt-1">
          {course.stops?.length || 0} {L(lang, { ko: '경유지', zh: '个经停点', en: 'stops' })}
          {course.duration ? ` · ${course.duration}` : ''}
        </p>
      </button>
      <button onClick={onDelete} className="p-2 text-[#9CA3AF] hover:text-red-500 transition-colors">
        <Trash2 size={16} />
      </button>
    </div>
  )
}

// ═══════════════════════════════════════════════
// ShareCard — 공유 카드 오버레이
// ═══════════════════════════════════════════════
function ShareCard({ course, lang, onClose }) {
  const isRecommended = !!course.coverEmoji

  const totalDuration = (course.stops || []).reduce((sum, s) => sum + parseDuration(s.duration), 0)
  const totalCost = (course.stops || []).reduce((sum, s) => sum + (s.cost || 0), 0)

  const stopLabel = (s) => {
    if (typeof s.name === 'string') return s.name
    return s.name?.[lang] || s.name?.en || s.name?.ko || ''
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-6" onClick={onClose}>
      <div onClick={e => e.stopPropagation()} className="w-full max-w-sm">
        <div className="bg-white rounded-[6px] p-6 border border-[#E5E7EB]">
          <p className="text-xs font-bold tracking-widest text-gray-400 mb-4">HANPOCKET</p>
          <h2 className="text-xl font-bold text-[#111827] mb-4">
            {isRecommended ? L(lang, course.name) : course.name}
          </h2>
          <div className="space-y-2 mb-4">
            {(course.stops || []).map((stop, i) => (
              <div key={i} className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-[#111827] text-white text-[10px] flex items-center justify-center font-bold shrink-0">{i + 1}</span>
                <span className="text-sm text-[#374151]">{stopLabel(stop)}</span>
                {i < course.stops.length - 1 && <span className="text-gray-300">→</span>}
              </div>
            ))}
          </div>
          <div className="flex gap-4 text-xs text-gray-500 mb-4">
            <span>⏱ {Math.floor(totalDuration / 60)}h {totalDuration % 60}min</span>
            {totalCost > 0 && <span>💰 ₩{totalCost.toLocaleString()}</span>}
          </div>
          <div className="border-t border-gray-200 pt-3">
            <p className="text-xs text-gray-400">{L(lang, { ko: '한국 여행은 HanPocket', zh: '韩国旅行就用HanPocket', en: 'Travel Korea with HanPocket' })}</p>
            <p className="text-[10px] text-gray-300">hanpocket.pages.dev</p>
          </div>
        </div>
        <p className="text-center text-xs text-white/80 mt-3">
          {L(lang, { ko: '스크린샷을 찍어 공유하세요!', zh: '截图分享吧！', en: 'Take a screenshot to share!' })}
        </p>
        <button onClick={onClose} className="w-full mt-2 bg-white rounded-[6px] py-3 text-sm font-medium text-[#111827]">
          {L(lang, { ko: '닫기', zh: '关闭', en: 'Close' })}
        </button>
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════
// CourseDetail — 코스 상세 화면
// ═══════════════════════════════════════════════
function CourseDetail({ course, lang, onBack, onSave, isSaved }) {
  const isRecommended = !!course.coverEmoji // 추천 코스인지 여부
  const [startHour, setStartHour] = useState(9)
  const [startMin, setStartMin] = useState(0)
  const [showShareCard, setShowShareCard] = useState(false)

  const stopName = (s, preferLang) => {
    if (typeof s.name === 'string') return s.name
    return s.name?.[preferLang] || s.name?.en || s.name?.ko || ''
  }

  const openGoogleMaps = () => {
    const stops = course.stops
    if (!stops?.length) return
    const origin = stopName(stops[0], 'ko')
    const dest = stopName(stops[stops.length - 1], 'ko')
    const middle = stops.slice(1, -1).slice(0, 9)
    const waypoints = middle.length > 0
      ? middle.map(s => stopName(s, 'ko')).join('|')
      : ''
    let url = `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${dest}&travelmode=driving`
    if (waypoints) url += `&waypoints=${waypoints}`
    window.open(url, '_blank')
  }

  const openBaidu = () => {
    const lastStop = course.stops?.slice(-1)[0]
    if (!lastStop) return
    const name = encodeURIComponent(stopName(lastStop, 'zh'))
    window.open(`baidumap://map/direction?destination=${name}&coord_type=wgs84&mode=transit`, '_blank')
  }

  const openNaverMaps = () => {
    const stops = course.stops
    if (!stops?.length) return
    const parts = stops.map(s => `${s.lng},${s.lat},${stopName(s, 'ko')}`)
    const url = `https://map.naver.com/v5/directions/${parts.join('/')}/transit`
    window.open(url, '_blank')
  }

  const openKakaoMap = () => {
    const stops = course.stops
    if (!stops?.length) return
    const sName = stopName(stops[0], 'ko')
    const eName = stopName(stops[stops.length - 1], 'ko')
    const url = `https://map.kakao.com/?sName=${sName}&eName=${eName}`
    window.open(url, '_blank')
  }

  return (
    <div className="h-full flex flex-col">
      {/* ── 헤더: 코스명 (ko + en) + 실시간 버튼 ── */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-[#E5E7EB]">
        <button onClick={onBack} className="p-1"><ChevronLeft size={20} className="text-[#111827]" /></button>
        <div className="flex-1 min-w-0">
          <p className="font-bold text-sm text-[#111827] truncate">
            {isRecommended ? L(lang, course.name) : course.name}
          </p>
          {isRecommended && course.name?.en && lang !== 'en' && (
            <p className="text-[11px] text-[#9CA3AF] truncate">{course.name.en}</p>
          )}
        </div>
        <button className="text-[11px] text-[#2D5A3D] font-semibold border border-[#2D5A3D] rounded-full px-3 py-1 shrink-0">
          {L(lang, { ko: '실시간', zh: '实时', en: 'Live' })}
        </button>
      </div>

      <div className="flex-1 overflow-y-auto">
        {/* ── 요약 바: 총 소요시간 | 교통비 | 장소 수 ── */}
        {isRecommended && (
          <div className="flex rounded-[6px] border border-[#E5E7EB] divide-x divide-[#E5E7EB] text-center mx-4 mt-4">
            <div className="flex-1 py-3">
              <p className="text-[10px] text-[#9CA3AF] mb-0.5">{L(lang, { ko: '총 소요시간', zh: '总耗时', en: 'Duration' })}</p>
              <p className="text-sm font-bold text-[#111827]">{course.duration}</p>
            </div>
            <div className="flex-1 py-3">
              <p className="text-[10px] text-[#9CA3AF] mb-0.5">{L(lang, { ko: '교통비', zh: '交通费', en: 'Transport' })}</p>
              <p className="text-sm font-bold text-[#111827]">{course.transportCost || L(lang, { ko: '무료', zh: '免费', en: 'Free' })}</p>
            </div>
            <div className="flex-1 py-3">
              <p className="text-[10px] text-[#9CA3AF] mb-0.5">{L(lang, { ko: '장소', zh: '地点', en: 'Stops' })}</p>
              <p className="text-sm font-bold text-[#111827]">{course.stops?.length || 0}{L(lang, { ko: '곳', zh: '处', en: '' })}</p>
            </div>
          </div>
        )}

        {/* ── 시작시간 선택 ── */}
        <div className="flex items-center gap-2 px-4 mt-4 mb-3">
          <Clock size={14} className="text-[#9CA3AF]" />
          <span className="text-xs text-[#6B7280]">{L(lang, { ko: '시작시간', zh: '开始时间', en: 'Start time' })}</span>
          <select
            value={startHour}
            onChange={e => setStartHour(Number(e.target.value))}
            className="text-sm font-bold text-[#111827] bg-[#F5F5F5] rounded-[6px] px-2 py-1 outline-none"
          >
            {Array.from({ length: 17 }, (_, i) => i + 6).map(h => (
              <option key={h} value={h}>{String(h).padStart(2, '0')}:00</option>
            ))}
          </select>
        </div>

        {/* ── 타임라인 블록 ── */}
        <div className="px-4 pb-4">
          {course.stops?.map((stop, i) => {
            // 시간 계산
            let cumMinutes = startHour * 60 + startMin
            for (let j = 0; j < i; j++) {
              cumMinutes += parseDuration(course.stops[j].duration)
              if (course.transport?.[j]) {
                cumMinutes += parseDuration(course.transport[j].duration)
              }
            }
            const hh = String(Math.floor(cumMinutes / 60) % 24).padStart(2, '0')
            const mm = String(cumMinutes % 60).padStart(2, '0')

            return (
              <div key={i}>
                {/* 경유지 블록 */}
                <div className="flex gap-3">
                  {/* 왼쪽: 아이콘 원형 + 수직선 */}
                  <div className="flex flex-col items-center">
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center text-lg shrink-0"
                      style={{ backgroundColor: STOP_TYPE_BG[stop.type] || '#F3F4F6' }}
                    >
                      {STOP_TYPE_ICON[stop.type] || '📍'}
                    </div>
                    {i < course.stops.length - 1 && <div className="flex-1 w-px bg-[#E5E7EB] my-1" />}
                  </div>

                  {/* 오른쪽: 콘텐츠 */}
                  <div className="flex-1 pb-4 min-w-0">
                    {/* 시간 + 카테고리 태그 */}
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-bold text-[#2D5A3D]">{stop.startTime || `${hh}:${mm}`}</span>
                      {STOP_TYPE_LABEL[stop.type] && (
                        <span className="text-[10px] bg-[#F3F4F6] text-[#6B7280] px-2 py-0.5 rounded-full">
                          {L(lang, STOP_TYPE_LABEL[stop.type])}
                        </span>
                      )}
                    </div>

                    {/* 장소명 (ko) */}
                    <p className="font-bold text-base text-[#111827]">{isRecommended ? L(lang, stop.name) : stop.name}</p>

                    {/* 영문 이름 */}
                    {isRecommended && stop.name?.en && lang !== 'en' && (
                      <p className="text-xs text-[#9CA3AF] mt-0.5">{stop.name.en}</p>
                    )}

                    {/* 평점 + 소요시간 */}
                    <div className="flex items-center gap-3 mt-1.5 text-xs">
                      {stop.naverRating && (
                        <span className="flex items-center gap-0.5">
                          <span className="text-[#F59E0B]">★</span>
                          <span className="font-semibold text-[#111827]">{stop.naverRating}</span>
                          <span className="text-[#9CA3AF]">{L(lang, { ko: '네이버', zh: 'Naver', en: 'Naver' })}</span>
                        </span>
                      )}
                      {stop.hpRating && (
                        <span className="flex items-center gap-0.5">
                          <span className="text-red-400">♥</span>
                          <span className="font-semibold text-[#111827]">{stop.hpRating}</span>
                          <span className="text-[#9CA3AF]">{L(lang, { ko: '한포켓', zh: 'HanPocket', en: 'HanPocket' })}</span>
                        </span>
                      )}
                      <span className="flex items-center gap-0.5 text-[#9CA3AF]">
                        <Clock size={10} /> {stop.duration}
                      </span>
                    </div>

                    {/* 편의 태그 */}
                    {stop.features?.length > 0 && (
                      <div className="flex gap-1.5 mt-2 flex-wrap">
                        {stop.features.map((f, fi) => (
                          <span key={fi} className="text-[10px] px-2 py-0.5 rounded-full bg-[#EBF5FF] text-[#2563EB] font-medium">
                            {FEATURE_LABEL[f] ? L(lang, FEATURE_LABEL[f]) : f}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* 길찾기 + 회화카드 버튼 */}
                    <div className="flex gap-2 mt-3">
                      <button
                        onClick={() => {
                          if (stop.lat && stop.lng) {
                            const name = encodeURIComponent(isRecommended ? (stop.name?.ko || L('ko', stop.name)) : stop.name)
                            window.open(`https://map.kakao.com/link/to/${name},${stop.lat},${stop.lng}`, '_blank')
                          }
                        }}
                        className="flex items-center gap-1 bg-[#DC2626] text-white text-xs font-semibold px-3.5 py-2 rounded-[6px] active:scale-95 transition-transform"
                      >
                        <Navigation size={12} />
                        {L(lang, { ko: '길찾기', zh: '导航', en: 'Navigate' })}
                      </button>
                      <button className="flex items-center gap-1 bg-white border border-[#E5E7EB] text-[#111827] text-xs font-semibold px-3.5 py-2 rounded-[6px] active:scale-95 transition-transform">
                        💬 {L(lang, { ko: '회화카드', zh: '会话卡', en: 'Phrase Card' })}
                      </button>
                    </div>

                    {/* 팁 */}
                    {stop.tip && (
                      <p className="text-[11px] text-[#6B7280] mt-2 leading-relaxed">
                        💡 {isRecommended ? L(lang, stop.tip) : stop.tip}
                      </p>
                    )}
                  </div>
                </div>

                {/* 이동 구간 */}
                {i < course.stops.length - 1 && (
                  <div className="flex gap-3 ml-1">
                    <div className="w-10 flex justify-center">
                      <div className="w-8 h-8 rounded-full bg-[#F3F4F6] flex items-center justify-center text-sm">
                        {course.transport?.[i] ? (TRANSPORT_ICON[course.transport[i].method] || '🚶') : '🚶'}
                      </div>
                    </div>
                    <div className="flex-1 flex items-center py-2">
                      <span className="text-xs text-[#9CA3AF]">
                        {course.transport?.[i] ? (TRANSPORT_ICON[course.transport[i].method] || '🚶') : '🚶'}{' '}
                        {L(lang, { ko: course.transport?.[i]?.method === 'walk' ? '도보' : course.transport?.[i]?.method === 'subway' ? '지하철' : course.transport?.[i]?.method === 'bus' ? '버스' : course.transport?.[i]?.method === 'taxi' ? '택시' : '도보', zh: course.transport?.[i]?.method === 'walk' ? '步行' : course.transport?.[i]?.method === 'subway' ? '地铁' : course.transport?.[i]?.method === 'bus' ? '公交' : course.transport?.[i]?.method === 'taxi' ? '出租车' : '步行', en: course.transport?.[i]?.method === 'walk' ? 'Walk' : course.transport?.[i]?.method === 'subway' ? 'Subway' : course.transport?.[i]?.method === 'bus' ? 'Bus' : course.transport?.[i]?.method === 'taxi' ? 'Taxi' : 'Walk' })}{' '}
                        {course.transport?.[i]?.duration || '—'} · {course.transport?.[i]?.cost || '₩0'}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* ── 카카오맵 (타임라인 아래) ── */}
        {course.stops?.length > 0 && course.stops[0].lat && (
          <div className="px-4 pb-4">
            <CourseMap stops={course.stops} />
          </div>
        )}

        {/* 태그 */}
        {course.tags && (
          <div className="flex flex-wrap gap-1.5 px-4 pb-4">
            {course.tags.map((tag, i) => (
              <span key={i} className="text-[10px] text-[#6B7280] bg-[#F5F5F5] px-2 py-0.5 rounded-full">#{tag}</span>
            ))}
          </div>
        )}
      </div>

      {/* 하단 버튼 */}
      <div className="px-4 py-3 border-t border-[#E5E7EB] space-y-2">
        {isRecommended && (
          <button
            onClick={onSave}
            disabled={isSaved}
            className={`w-full py-2.5 rounded-[6px] text-sm font-semibold transition-colors ${
              isSaved
                ? 'bg-[#F5F5F5] text-[#9CA3AF]'
                : 'bg-[#111827] text-white active:bg-gray-800'
            }`}
          >
            {isSaved
              ? L(lang, { ko: '추가됨', zh: '已添加', en: 'Added' })
              : L(lang, { ko: '내 코스에 추가', zh: '添加到我的路线', en: 'Add to My Courses' })}
          </button>
        )}
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={openBaidu}
            className="bg-white rounded-[6px] border border-[#E5E7EB] p-3 text-center active:scale-95 transition-transform"
          >
            <Navigation size={14} className="mx-auto mb-1 text-[#111827]" />
            <span className="text-xs font-semibold text-[#111827]">百度地图</span>
          </button>
          <button
            onClick={openNaverMaps}
            className="bg-white rounded-[6px] border border-[#E5E7EB] p-3 text-center active:scale-95 transition-transform"
          >
            <Navigation size={14} className="mx-auto mb-1 text-[#111827]" />
            <span className="text-xs font-semibold text-[#111827]">Naver地图</span>
          </button>
          <button
            onClick={openGoogleMaps}
            className="bg-white rounded-[6px] border border-[#E5E7EB] p-3 text-center active:scale-95 transition-transform"
          >
            <Navigation size={14} className="mx-auto mb-1 text-[#111827]" />
            <span className="text-xs font-semibold text-[#111827]">谷歌地图</span>
          </button>
          <button
            onClick={openKakaoMap}
            className="bg-white rounded-[6px] border border-[#E5E7EB] p-3 text-center active:scale-95 transition-transform"
          >
            <Navigation size={14} className="mx-auto mb-1 text-[#111827]" />
            <span className="text-xs font-semibold text-[#111827]">Kakao地图</span>
          </button>
        </div>
        <button
          onClick={() => setShowShareCard(true)}
          className="w-full py-2.5 rounded-[6px] text-sm font-semibold bg-white border border-[#E5E7EB] text-[#111827] flex items-center justify-center gap-2 active:bg-[#F5F5F5] transition-colors"
        >
          <Share2 size={14} />
          {L(lang, { ko: '공유 카드 만들기', zh: '生成分享卡片', en: 'Create Share Card' })}
        </button>
      </div>

      {/* 공유 카드 모달 */}
      {showShareCard && (
        <ShareCard course={course} lang={lang} onClose={() => setShowShareCard(false)} />
      )}
    </div>
  )
}

// ═══════════════════════════════════════════════
// CreateCourse — 새 코스 만들기
// ═══════════════════════════════════════════════
function CreateCourse({ lang, onBack, onSave }) {
  const [name, setName] = useState('')
  const [stops, setStops] = useState([{ name: '', duration: '1h', tip: '' }])

  const addStop = () => {
    if (stops.length >= 10) return
    setStops([...stops, { name: '', duration: '1h', tip: '' }])
  }

  const removeStop = (i) => {
    if (stops.length <= 1) return
    setStops(stops.filter((_, idx) => idx !== i))
  }

  const updateStop = (i, field, value) => {
    const next = [...stops]
    next[i] = { ...next[i], [field]: value }
    setStops(next)
  }

  const moveStop = (i, dir) => {
    const j = i + dir
    if (j < 0 || j >= stops.length) return
    const next = [...stops]
    ;[next[i], next[j]] = [next[j], next[i]]
    setStops(next)
  }

  const handleSave = () => {
    const trimmed = name.trim()
    if (!trimmed) return
    const validStops = stops.filter(s => s.name.trim())
    if (validStops.length === 0) return
    onSave({
      id: `custom-${Date.now()}`,
      name: trimmed,
      stops: validStops,
      transport: [],
      tags: [],
      createdAt: new Date().toISOString(),
    })
  }

  return (
    <div className="h-full flex flex-col">
      {/* 헤더 */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-[#E5E7EB]">
        <button onClick={onBack} className="p-1"><ChevronLeft size={20} className="text-[#111827]" /></button>
        <p className="font-bold text-sm text-[#111827]">
          {L(lang, { ko: '새 코스 만들기', zh: '创建新路线', en: 'Create New Course' })}
        </p>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {/* 코스명 */}
        <div>
          <label className="text-[10px] font-semibold text-[#6B7280] mb-1 block">
            {L(lang, { ko: '코스 이름', zh: '路线名称', en: 'Course Name' })}
          </label>
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder={L(lang, { ko: '예: 강남 맛집 투어', zh: '例：江南美食之旅', en: 'e.g. Gangnam Food Tour' })}
            className="w-full bg-[#F5F5F5] rounded-[6px] px-3 py-2.5 text-sm text-[#111827] outline-none placeholder:text-[#9CA3AF]"
            maxLength={50}
          />
        </div>

        {/* 경유지 */}
        <div>
          <label className="text-[10px] font-semibold text-[#6B7280] mb-2 block">
            {L(lang, { ko: '경유지', zh: '经停点', en: 'Stops' })}
          </label>
          <div className="space-y-2">
            {stops.map((stop, i) => (
              <div key={i} className="bg-white rounded-[6px] p-3 border border-[#E5E7EB]">
                <div className="flex items-center gap-2 mb-2">
                  <span className="w-5 h-5 rounded-full bg-[#111827] text-white text-[10px] font-bold flex items-center justify-center shrink-0">{i + 1}</span>
                  <input
                    type="text"
                    value={stop.name}
                    onChange={e => updateStop(i, 'name', e.target.value)}
                    placeholder={L(lang, { ko: '장소 이름', zh: '地点名称', en: 'Place name' })}
                    className="flex-1 bg-white rounded-[6px] px-2 py-1.5 text-sm text-[#111827] outline-none border border-[#E5E7EB] placeholder:text-[#9CA3AF]"
                    maxLength={30}
                  />
                  <div className="flex flex-col gap-0.5">
                    <button onClick={() => moveStop(i, -1)} disabled={i === 0} className="text-[#9CA3AF] disabled:opacity-30"><ChevronUp size={14} /></button>
                    <button onClick={() => moveStop(i, 1)} disabled={i === stops.length - 1} className="text-[#9CA3AF] disabled:opacity-30"><ChevronDown size={14} /></button>
                  </div>
                  <button onClick={() => removeStop(i)} disabled={stops.length <= 1} className="text-[#9CA3AF] hover:text-red-500 disabled:opacity-30"><Trash2 size={14} /></button>
                </div>
                <div className="flex gap-2 pl-7">
                  <input
                    type="text"
                    value={stop.duration}
                    onChange={e => updateStop(i, 'duration', e.target.value)}
                    placeholder="1h"
                    className="w-16 bg-white rounded-[6px] px-2 py-1 text-xs text-[#111827] outline-none border border-[#E5E7EB] placeholder:text-[#9CA3AF]"
                    maxLength={10}
                  />
                  <input
                    type="text"
                    value={stop.tip}
                    onChange={e => updateStop(i, 'tip', e.target.value)}
                    placeholder={L(lang, { ko: '팁 (선택)', zh: '提示（选填）', en: 'Tip (optional)' })}
                    className="flex-1 bg-white rounded-[6px] px-2 py-1 text-xs text-[#111827] outline-none border border-[#E5E7EB] placeholder:text-[#9CA3AF]"
                    maxLength={50}
                  />
                </div>
              </div>
            ))}
          </div>
          {stops.length < 10 && (
            <button onClick={addStop} className="mt-2 w-full py-2 rounded-[6px] border border-dashed border-[#D1D5DB] text-xs text-[#6B7280] font-medium flex items-center justify-center gap-1 active:bg-[#F5F5F5]">
              <Plus size={14} /> {L(lang, { ko: '경유지 추가', zh: '添加经停点', en: 'Add Stop' })}
            </button>
          )}
        </div>
      </div>

      {/* 저장 버튼 */}
      <div className="px-4 py-3 border-t border-[#E5E7EB]">
        <button
          onClick={handleSave}
          disabled={!name.trim() || !stops.some(s => s.name.trim())}
          className="w-full py-2.5 rounded-[6px] text-sm font-semibold bg-[#111827] text-white disabled:bg-[#D1D5DB] disabled:text-[#9CA3AF] active:bg-gray-800 transition-colors"
        >
          {L(lang, { ko: '저장', zh: '保存', en: 'Save' })}
        </button>
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════
// CourseTab — 메인 컴포넌트
// ═══════════════════════════════════════════════
export default function CourseTab({ lang, deepLink, onDeepLinkConsumed, adminView = false }) {
  const [view, setView] = useState('list') // 'list' | 'detail' | 'create'
  const [selectedCourse, setSelectedCourse] = useState(null)
  const [filter, setFilter] = useState('all')
  const [myCourses, setMyCourses] = useState(() => {
    try { return JSON.parse(localStorage.getItem('my_courses')) || [] } catch { return [] }
  })

  // 딥링크 처리 — 홈탭에서 코스 클릭 시 상세로 직행
  useEffect(() => {
    if (!deepLink) return
    const course = deepLink.itemData
      || RECOMMENDED_COURSES.find(c => c.id === deepLink.itemId)
      || myCourses.find(c => c.id === deepLink.itemId)
    if (course) {
      setSelectedCourse(course)
      setView('detail')
    }
    onDeepLinkConsumed?.()
  }, [deepLink])

  const saveMyCourses = useCallback((courses) => {
    setMyCourses(courses)
    localStorage.setItem('my_courses', JSON.stringify(courses))
  }, [])

  const addToMyCourses = (course) => {
    if (myCourses.some(c => c.id === course.id)) return
    const saved = {
      id: course.id,
      name: typeof course.name === 'object' ? L(lang, course.name) : course.name,
      stops: course.stops?.map(s => ({
        name: typeof s.name === 'object' ? L(lang, s.name) : s.name,
        duration: s.duration,
        tip: typeof s.tip === 'object' ? L(lang, s.tip) : s.tip,
        type: s.type,
        lat: s.lat,
        lng: s.lng,
      })) || [],
      transport: course.transport?.map(t => ({
        ...t,
        detail: typeof t.detail === 'object' ? L(lang, t.detail) : t.detail,
      })) || [],
      tags: course.tags || [],
      duration: course.duration,
      createdAt: new Date().toISOString(),
    }
    saveMyCourses([saved, ...myCourses])
  }

  const deleteMyCourse = (id) => {
    saveMyCourses(myCourses.filter(c => c.id !== id))
  }

  const saveCustomCourse = (course) => {
    saveMyCourses([course, ...myCourses])
    setView('list')
  }

  const filtered = filter === 'all'
    ? RECOMMENDED_COURSES
    : RECOMMENDED_COURSES.filter(c => c.category === filter)

  // ─── Detail View ───
  if (view === 'detail' && selectedCourse) {
    return (
      <div className="bg-white h-full" style={{ height: 'calc(100vh - 140px)' }}>
        <CourseDetail
          course={selectedCourse}
          lang={lang}
          onBack={() => { setView('list'); setSelectedCourse(null) }}
          onSave={() => addToMyCourses(selectedCourse)}
          isSaved={myCourses.some(c => c.id === selectedCourse.id)}
        />
      </div>
    )
  }

  // ─── Create View ───
  if (view === 'create') {
    return (
      <div className="bg-white h-full" style={{ height: 'calc(100vh - 140px)' }}>
        <CreateCourse
          lang={lang}
          onBack={() => setView('list')}
          onSave={saveCustomCourse}
        />
      </div>
    )
  }

  // ─── List View ───
  return (
    <div
      className="bg-white overflow-y-auto px-4 py-4"
      style={{ height: 'calc(100vh - 140px)' }}
    >
      {/* A) 내 코스 섹션 */}
      <section className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-bold text-[#111827]">
            {L(lang, { ko: '내 코스', zh: '我的路线', en: 'My Courses' })}
          </h2>
          <button
            onClick={() => setView('create')}
            className="flex items-center gap-1 text-xs font-semibold text-[#111827] bg-[#F5F5F5] px-3 py-1.5 rounded-full active:bg-[#E5E7EB] transition-colors"
          >
            <Plus size={14} />
            {L(lang, { ko: '만들기', zh: '创建', en: 'Create' })}
          </button>
        </div>

        {myCourses.length === 0 ? (
          <div className="bg-white rounded-[6px] border border-[#E5E7EB] p-6 text-center">
            <p className="text-2xl mb-2">🗺️</p>
            <p className="text-xs text-[#9CA3AF]">
              {L(lang, { ko: '아직 코스가 없어요. 추천 코스로 시작해보세요!', zh: '还没有路线。从推荐路线开始吧！', en: 'No courses yet. Start with a recommended one!' })}
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {myCourses.map(course => (
              <MyCourseCard
                key={course.id}
                course={course}
                lang={lang}
                onPress={() => { setSelectedCourse(course); setView('detail') }}
                onDelete={() => deleteMyCourse(course.id)}
              />
            ))}
          </div>
        )}
      </section>

      {/* B) 추천 코스 섹션 */}
      <section>
        <h2 className="text-base font-bold text-[#111827] mb-3">
          {L(lang, { ko: '추천 코스', zh: '推荐路线', en: 'Recommended' })}
        </h2>

        {/* 카테고리 필터 칩 */}
        <div className="flex gap-2 overflow-x-auto pb-3 -mx-1 px-1" style={{ scrollbarWidth: 'none' }}>
          {COURSE_CATEGORIES.map(cat => (
            <button
              key={cat.id}
              onClick={() => setFilter(cat.id)}
              className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${
                filter === cat.id
                  ? 'bg-[#111827] text-white'
                  : 'bg-[#F5F5F5] text-[#6B7280] active:bg-[#E5E7EB]'
              }`}
            >
              {L(lang, cat.name)}
            </button>
          ))}
        </div>

        {/* 추천 코스 카드 */}
        <div className="space-y-3">
          {filtered.map(course => (
            <CourseCard
              key={course.id}
              course={course}
              lang={lang}
              onPress={() => { setSelectedCourse(course); setView('detail') }}
            />
          ))}
        </div>
      </section>

      {/* C) 일정 추천 섹션 */}
      <section className="mt-6">
        <h2 className="text-base font-bold text-[#111827] mb-3">
          {L(lang, { ko: '추천 일정', zh: '推荐行程', en: 'Suggested Itineraries' })}
        </h2>
        <div className="space-y-3">
          {[
            { name: { ko: '3일 서울 집중', zh: '3天首尔深度游', en: '3-Day Seoul Focus' }, days: [
              { day: 1, plan: { ko: '경복궁 → 북촌한옥마을 → 인사동 → 광장시장 (저녁)', zh: '景福宫→北村韩屋村→仁寺洞→广藏市场（晚餐）', en: 'Gyeongbokgung → Bukchon → Insadong → Gwangjang Market (dinner)' } },
              { day: 2, plan: { ko: '명동 쇼핑 → N서울타워 → 이태원 → 한강공원 (야경)', zh: '明洞购物→N首尔塔→梨泰院→汉江公园（夜景）', en: 'Myeongdong shopping → N Seoul Tower → Itaewon → Hangang Park (night)' } },
              { day: 3, plan: { ko: '홍대 거리 → 연남동 카페 → 여의도 → DDP (동대문디자인플라자)', zh: '弘大街区→延南洞咖啡→汝矣岛→DDP（东大门设计广场）', en: 'Hongdae → Yeonnam-dong cafes → Yeouido → DDP' } },
            ]},
            { name: { ko: '5일 서울+부산', zh: '5天首尔+釜山', en: '5-Day Seoul+Busan' }, days: [
              { day: 1, plan: { ko: '서울: 경복궁 → 북촌 → 명동', zh: '首尔：景福宫→北村→明洞', en: 'Seoul: Gyeongbokgung → Bukchon → Myeongdong' } },
              { day: 2, plan: { ko: '서울: 홍대 → N서울타워 → 한강', zh: '首尔：弘大→N首尔塔→汉江', en: 'Seoul: Hongdae → N Seoul Tower → Hangang' } },
              { day: 3, plan: { ko: '서울: 이태원 → 성수동 카페 → DDP', zh: '首尔：梨泰院→圣水洞咖啡→DDP', en: 'Seoul: Itaewon → Seongsu cafes → DDP' } },
              { day: 4, plan: { ko: 'KTX→부산 (2.5h) → 해운대 → 광안리 야경', zh: 'KTX→釜山（2.5h）→海云台→广安里夜景', en: 'KTX→Busan (2.5h) → Haeundae → Gwangalli night' } },
              { day: 5, plan: { ko: '감천문화마을 → 자갈치시장 → 해동용궁사 → 귀국', zh: '甘川文化村→扎嘎其市场→海东龙宫寺→回国', en: 'Gamcheon Village → Jagalchi → Haedong Yonggungsa → depart' } },
            ]},
            { name: { ko: '7일 전국일주', zh: '7天全国环游', en: '7-Day Korea Tour' }, days: [
              { day: 1, plan: { ko: '서울 도착 → 명동/광장시장', zh: '到达首尔→明洞/广藏市场', en: 'Arrive Seoul → Myeongdong/Gwangjang Market' } },
              { day: 2, plan: { ko: '서울: 경복궁 → 북촌 → N서울타워', zh: '首尔：景福宫→北村→N首尔塔', en: 'Seoul: Gyeongbokgung → Bukchon → N Seoul Tower' } },
              { day: 3, plan: { ko: 'KTX→대전 (1h) → 유성온천 → 성심당 빵', zh: 'KTX→大田（1h）→儒城温泉→圣心堂面包', en: 'KTX→Daejeon (1h) → Yuseong hot springs → Sungsimdang bakery' } },
              { day: 4, plan: { ko: '버스→경주 → 불국사 → 석굴암 → 안압지 야경', zh: '巴士→庆州→佛国寺→石窟庵→雁鸭池夜景', en: 'Bus→Gyeongju → Bulguksa → Seokguram → Anapji night' } },
              { day: 5, plan: { ko: '버스→부산 → 해운대 → 감천문화마을', zh: '巴士→釜山→海云台→甘川文化村', en: 'Bus→Busan → Haeundae → Gamcheon Village' } },
              { day: 6, plan: { ko: '부산: 자갈치 → 광안리 → 해동용궁사', zh: '釜山：扎嘎其→广安里→海东龙宫寺', en: 'Busan: Jagalchi → Gwangalli → Haedong Yonggungsa' } },
              { day: 7, plan: { ko: '비행기→제주 (1h) → 성산일출봉 → 협재해변', zh: '飞机→济州（1h）→城山日出峰→挟才海滩', en: 'Flight→Jeju (1h) → Seongsan Ilchulbong → Hyeopjae Beach' } },
            ]},
          ].map((it, i) => (
            <div key={i} className="bg-white rounded-[6px] border border-[#E5E7EB] p-4">
              <h3 className="text-sm font-bold text-[#111827] mb-3">{L(lang, it.name)}</h3>
              <div className="space-y-2">
                {it.days.map(d => (
                  <div key={d.day} className="flex items-start gap-2">
                    <span className="text-[10px] font-bold text-white bg-[#111827] w-7 h-5 rounded-full flex items-center justify-center shrink-0">D{d.day}</span>
                    <p className="text-xs text-[#374151]">{L(lang, d.plan)}</p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
