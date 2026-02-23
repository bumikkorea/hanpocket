import { useState, useEffect, useRef } from 'react'
import { X, Plus } from 'lucide-react'
import PocketContent from './pockets/PocketContent'
import { pocketCategories } from '../data/pockets'
import AppleWidgetCard from './cards/AppleWidgetCard'
import PersonalSection from './cards/PersonalSection'
import TodaySection from './cards/TodaySection'
import WeatherWidget from './widgets/WeatherWidget'
import ExchangeRateWidget from './widgets/ExchangeRateWidget'
import CalendarWidget from './widgets/CalendarWidget'
import MemoWidget from './widgets/MemoWidget'
import TimezoneWidget from './widgets/TimezoneWidget'
import ParcelWidget from './widgets/ParcelWidget'
import LucideIcon from './home/common/LucideIcon'
import TreeSection from './home/common/TreeSection'
import WidgetContent from './home/common/WidgetContent'
import { L, trackActivity } from './home/utils/helpers'
import { SECTION_TODAY, SECTION_SHOPPING, SECTION_CULTURE, SECTION_TOOLS } from './home/utils/constants'

// 섹션별 주머니 가져오기 함수
function getEnabledPocketsForSection(sectionIds, config) {
  const allPockets = []
  pocketCategories.forEach(cat => {
    cat.pockets.forEach(p => {
      if (sectionIds.includes(p.id) && config.enabled[p.id]) {
        allPockets.push(p)
      }
    })
  })
  return allPockets
}

const DEFAULT_POCKETS = ['restaurant', 'transport', 'convenience', 'emergency', 'cafe', 'shopping', 'accommodation']

export default function HomeTab({ profile, lang, exchangeRate, setTab }) {
  const [pockets, setPockets] = useState(() => {
    try { 
      const saved = JSON.parse(localStorage.getItem('home_pockets'))
      return saved && saved.length > 0 ? saved : DEFAULT_POCKETS
    } catch { 
      return DEFAULT_POCKETS 
    }
  })
  const [showAdd, setShowAdd] = useState(false)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [dragX, setDragX] = useState(0)
  const [showBookmark, setShowBookmark] = useState(false)
  const [containerW, setContainerW] = useState(0)
  const containerRef = useRef(null)
  const touchRef = useRef({ startX: 0, startY: 0, swiping: false, locked: false })

  const SWIPE_THRESHOLD = 25
  const FOLD_MAX = 0

  // 스와이프 효과음 함수
  const playSwipeSound = () => {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)()
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.frequency.setValueAtTime(800, ctx.currentTime)
      osc.frequency.exponentialRampToValueAtTime(400, ctx.currentTime + 0.1)
      gain.gain.setValueAtTime(0.15, ctx.currentTime)
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1)
      osc.start(ctx.currentTime)
      osc.stop(ctx.currentTime + 0.1)
    } catch (e) {
      // AudioContext not available, fail silently
    }
  }

  // 각 카드의 스타일 계산
  const getCardStyle = (cardIndex) => {
    const diff = cardIndex - currentIndex
    const T = 'transform 0.4s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.4s cubic-bezier(0.4, 0, 0.2, 1)'
    
    if (diff < 0) {
      return { opacity: 0, transform: 'translateX(-100%) scale(0.95)', zIndex: 1, pointerEvents: 'none', transition: T }
    }
    
    if (diff === 0) {
      return {
        transform: `translateX(${dragX}px)`,
        transition: dragX === 0 ? T : 'none',
        zIndex: 10, opacity: 1, pointerEvents: 'auto'
      }
    }
    
    if (diff === 1) {
      const progress = Math.min(Math.abs(dragX) / SWIPE_THRESHOLD, 1)
      return {
        transform: `scale(${0.95 + 0.05 * progress})`,
        transition: dragX === 0 ? T : 'none',
        zIndex: 5, opacity: 0.6 + 0.4 * progress, pointerEvents: 'none'
      }
    }
    
    return { opacity: 0, zIndex: 1, pointerEvents: 'none', transform: 'scale(0.9)' }
  }

  useEffect(() => { localStorage.setItem('home_pockets', JSON.stringify(pockets)) }, [pockets])

  useEffect(() => {
    const measure = () => { if (containerRef.current) setContainerW(containerRef.current.offsetWidth) }
    measure()
    window.addEventListener('resize', measure)
    return () => window.removeEventListener('resize', measure)
  }, [])

  const totalSlides = pockets.length + 1

  const goTo = (idx, playSound = false) => {
    const clamped = Math.max(0, Math.min(idx, totalSlides - 1))
    if (clamped !== currentIndex && playSound) {
      playSwipeSound()
    }
    setCurrentIndex(clamped)
    setDragX(0)
    setShowBookmark(false)
  }

  const onTouchStart = (e) => {
    const t = e.touches[0]
    touchRef.current = { startX: t.clientX, startY: t.clientY, swiping: false, locked: false }
    setShowBookmark(false)
  }

  const onTouchMove = (e) => {
    const t = e.touches[0]
    const dx = t.clientX - touchRef.current.startX
    const dy = t.clientY - touchRef.current.startY

    const lastIndex = totalSlides - 1
    // 첫 카드에서 오른쪽(뒤로) 스와이프 막기
    if (currentIndex === 0 && dx > 0) { setDragX(0); return }
    // 마지막 카드("+")에서 왼쪽(앞으로) 스와이프 막기
    if (currentIndex >= lastIndex && dx < 0) { setDragX(0); return }

    if (!touchRef.current.locked) {
      if (Math.abs(dy) > Math.abs(dx) && Math.abs(dy) > 10) {
        touchRef.current.locked = true
        touchRef.current.swiping = false
        return
      }
      if (Math.abs(dx) > 10) {
        touchRef.current.locked = true
        touchRef.current.swiping = true
      }
    }

    if (!touchRef.current.swiping) return

    e.preventDefault()
    setDragX(dx)
    setShowBookmark(Math.abs(dx) >= SWIPE_THRESHOLD)
  }

  const onTouchEnd = () => {
    if (!touchRef.current.swiping) {
      setDragX(0)
      setShowBookmark(false)
      return
    }
    const lastIndex = totalSlides - 1
    if (Math.abs(dragX) >= SWIPE_THRESHOLD) {
      if (dragX < 0 && currentIndex < lastIndex) goTo(currentIndex + 1, true)
      else if (dragX > 0 && currentIndex > 0) goTo(currentIndex - 1, true)
      else { setDragX(0); setShowBookmark(false) }
    } else {
      setDragX(0)
      setShowBookmark(false)
    }
  }

  const addPocket = (pocketId) => {
    if (!pockets.includes(pocketId)) {
      const newPockets = [...pockets, pocketId]
      setPockets(newPockets)
      setShowAdd(false)
      // 새로 추가된 주머니로 이동 (효과음 포함)
      setTimeout(() => goTo(newPockets.length - 1, true), 100)
    }
  }

  const removePocket = (pocketId) => {
    const idx = pockets.indexOf(pocketId)
    const newPockets = pockets.filter(p => p !== pocketId)
    setPockets(newPockets)
    
    // 삭제된 주머니가 현재 주머니라면 자연스럽게 다음/이전 주머니로 이동
    if (idx === currentIndex) {
      if (newPockets.length === 0) {
        // 모든 주머니가 삭제되면 Add 주머니로
        setCurrentIndex(0)
      } else if (currentIndex >= newPockets.length) {
        // 마지막 주머니였다면 이전 주머니로
        goTo(newPockets.length - 1)
      } else {
        // 같은 위치에 있는 다음 주머니로 (인덱스는 유지)
        setCurrentIndex(currentIndex)
      }
    } else if (idx < currentIndex) {
      // 이전 주머니가 삭제되면 현재 인덱스 조정
      setCurrentIndex(currentIndex - 1)
    }
  }

  const getPocketById = (id) => {
    for (const cat of pocketCategories) {
      const p = cat.pockets.find(p => p.id === id)
      if (p) return p
    }
    return null
  }

  return (
    <div className="bg-[#FCFCFA] overflow-hidden" style={{ fontFamily: 'Inter, sans-serif', touchAction: 'pan-y', height: 'calc(100vh - 140px)' }}>
      {/* Pockets stack */}
      <div
        ref={containerRef}
        className="relative overflow-hidden mx-0.5"
        style={{ height: 'calc(100vh - 140px)', marginTop: '4px' }}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        {/* All pockets stacked */}
        {pockets.map((pocketId, index) => {
          const pocket = getPocketById(pocketId)
          if (!pocket) return null
          const pocketStyle = getCardStyle(index)
          
          return (
            <div 
              key={pocketId}
              className="absolute inset-0"
              style={{
                ...pocketStyle,
                willChange: 'transform, opacity'
              }}
            >
              {/* 주머니 모양 디자인 */}
              <div className="relative w-full h-full">
                {/* 주머니 상단 탭 (주머니 입구) */}
                <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-16 h-2 bg-gray-300 rounded-b-full"></div>
                
                {/* 주머니 본체 */}
                <div className="bg-white rounded-t-2xl rounded-b-lg border border-gray-200 px-3 py-2 relative overflow-hidden w-full h-full pt-4 shadow-sm">
                  <button
                    onClick={() => removePocket(pocketId)}
                    className="absolute top-4 right-4 z-10 w-8 h-8 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center transition-colors"
                  >
                    <X className="w-4 h-4 text-gray-600" />
                  </button>
                  <div className="flex items-center gap-3 mb-4">
                    <LucideIcon name={pocket.icon} size={20} style={{ color: '#111827' }} />
                    <h2 className="text-lg font-semibold" style={{ color: '#111827' }}>{L(lang, pocket.name)}</h2>
                  </div>
                  <div className="overflow-y-auto scroll-smooth" style={{ height: 'calc(100% - 40px)', overflowX: 'hidden', touchAction: 'pan-y' }}>
                    <PocketContent pocketId={pocketId} lang={lang} setTab={setTab} />
                  </div>
                </div>
              </div>
            </div>
          )
        })}

        {/* Add pocket - also in the stack */}
        <div 
          className="absolute inset-0"
          style={{
            ...getCardStyle(pockets.length),
            willChange: 'transform, opacity'
          }}
        >
          {/* 주머니 모양 디자인 */}
          <div className="relative w-full h-full">
            {/* 주머니 상단 탭 (주머니 입구) */}
            <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-16 h-2 bg-gray-300 rounded-b-full"></div>
            
            {/* 주머니 본체 */}
            <div
              className="bg-white rounded-t-2xl rounded-b-lg border-2 border-dashed border-gray-300 flex flex-col items-center justify-center cursor-pointer hover:border-gray-400 transition-colors w-full h-full pt-8 shadow-sm"
              onClick={() => setShowAdd(true)}
            >
              <Plus className="w-12 h-12 text-gray-400 mb-4" />
              <p className="text-lg font-medium text-gray-600">
                {L(lang, { ko: '주머니 추가', zh: '添加口袋', en: 'Add Pocket' })}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Pocket indicators with icons and names */}
      {(pockets.length > 0 || totalSlides > 1) && (
        <div className="flex justify-center items-center py-3 gap-1 px-4 overflow-x-auto">
          {pockets.map((pocketId, index) => {
            const pocket = getPocketById(pocketId)
            if (!pocket) return null
            const isActive = index === currentIndex
            return (
              <button
                key={pocketId}
                onClick={() => goTo(index)}
                className={`flex flex-col items-center p-2 rounded-lg transition-all min-w-0 ${
                  isActive ? 'bg-gray-100 scale-105' : 'hover:bg-gray-50'
                }`}
                style={{ minWidth: '60px' }}
              >
                <LucideIcon 
                  name={pocket.icon} 
                  size={isActive ? 20 : 16} 
                  style={{ color: isActive ? '#111827' : '#6B7280' }} 
                />
                <span 
                  className={`text-xs mt-1 truncate max-w-full ${
                    isActive ? 'font-semibold text-gray-900' : 'text-gray-500'
                  }`}
                >
                  {L(lang, pocket.name)}
                </span>
              </button>
            )
          })}
          {/* Add pocket indicator - 항상 표시 */}
          <button
            onClick={() => goTo(pockets.length)}
            className={`flex flex-col items-center p-2 rounded-lg transition-all min-w-0 ${
              currentIndex === pockets.length ? 'bg-gray-100 scale-105' : 'hover:bg-gray-50'
            }`}
            style={{ minWidth: '60px' }}
          >
            <Plus 
              size={currentIndex === pockets.length ? 20 : 16} 
              style={{ color: currentIndex === pockets.length ? '#111827' : '#6B7280' }} 
            />
            <span 
              className={`text-xs mt-1 truncate max-w-full ${
                currentIndex === pockets.length ? 'font-semibold text-gray-900' : 'text-gray-500'
              }`}
            >
              {L(lang, { ko: '추가', zh: '添加', en: 'Add' })}
            </span>
          </button>
        </div>
      )}

      {/* Add Pocket Modal */}
      {showAdd && (
        <div className="fixed inset-0 bg-black/50 flex items-end z-50" onClick={() => setShowAdd(false)}>
          <div className="bg-white rounded-t-2xl w-full max-h-[70vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-semibold" style={{ color: '#111827' }}>
                  {L(lang, { ko: '주머니 선택', zh: '选择口袋', en: 'Choose Pocket' })}
                </h3>
                <button onClick={() => setShowAdd(false)} className="w-8 h-8 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center">
                  <X className="w-4 h-4 text-gray-600" />
                </button>
              </div>
              {pocketCategories.map((cat) => (
                <div key={cat.id} className="mb-6">
                  <h4 className="text-sm font-semibold uppercase tracking-wider text-gray-500 mb-3">{L(lang, cat.name)}</h4>
                  <div className="grid grid-cols-2 gap-2">
                    {cat.pockets.map((p) => (
                      <button
                        key={p.id}
                        onClick={() => addPocket(p.id)}
                        disabled={pockets.includes(p.id)}
                        className={`p-3 rounded-xl border text-left transition-colors ${
                          pockets.includes(p.id) ? 'bg-gray-50 border-gray-200 opacity-40' : 'bg-white border-gray-200 hover:bg-gray-50'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <LucideIcon name={p.icon} size={16} style={{ color: '#111827' }} />
                          <span className="font-medium text-sm" style={{ color: '#111827' }}>{L(lang, p.name)}</span>
                        </div>
                        <p className="text-xs text-gray-400 mt-1 line-clamp-1">{L(lang, p.description)}</p>
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// Export additional components and utilities for backward compatibility
export { TreeSection, LucideIcon, WidgetContent, getEnabledPocketsForSection, trackActivity }