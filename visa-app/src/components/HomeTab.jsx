import { useState, useEffect, useRef } from 'react'
import { X, Plus } from 'lucide-react'
import { widgetCategories } from '../data/widgets'
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
import { L } from './home/utils/helpers'
import { SECTION_TODAY, SECTION_SHOPPING, SECTION_CULTURE, SECTION_TOOLS } from './home/utils/constants'

// 섹션별 위젯 가져오기 함수
function getEnabledWidgetsForSection(sectionIds, config) {
  const allWidgets = []
  widgetCategories.forEach(cat => {
    cat.widgets.forEach(w => {
      if (sectionIds.includes(w.id) && config.enabled[w.id]) {
        allWidgets.push(w)
      }
    })
  })
  return allWidgets
}

export default function HomeTab({ profile, lang, exchangeRate, setTab }) {
  const [cards, setCards] = useState(() => {
    try { return JSON.parse(localStorage.getItem('home_cards')) || [] } catch { return [] }
  })
  const [showAdd, setShowAdd] = useState(false)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [dragX, setDragX] = useState(0)
  const [showBookmark, setShowBookmark] = useState(false)
  const [containerW, setContainerW] = useState(0)
  const containerRef = useRef(null)
  const touchRef = useRef({ startX: 0, startY: 0, swiping: false, locked: false })

  const SWIPE_THRESHOLD = 80
  const FOLD_MAX = 50

  useEffect(() => { localStorage.setItem('home_cards', JSON.stringify(cards)) }, [cards])

  useEffect(() => {
    const measure = () => { if (containerRef.current) setContainerW(containerRef.current.offsetWidth) }
    measure()
    window.addEventListener('resize', measure)
    return () => window.removeEventListener('resize', measure)
  }, [])

  const totalSlides = cards.length + 1

  const goTo = (idx) => {
    const clamped = Math.max(0, Math.min(idx, totalSlides - 1))
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
      if (dragX < 0 && currentIndex < lastIndex) goTo(currentIndex + 1)
      else if (dragX > 0 && currentIndex > 0) goTo(currentIndex - 1)
      else { setDragX(0); setShowBookmark(false) }
    } else {
      setDragX(0)
      setShowBookmark(false)
    }
  }

  const addCard = (widgetId) => {
    if (!cards.includes(widgetId)) {
      const newCards = [...cards, widgetId]
      setCards(newCards)
      setShowAdd(false)
      setTimeout(() => setCurrentIndex(newCards.length - 1), 50)
    }
  }

  const removeCard = (widgetId) => {
    const idx = cards.indexOf(widgetId)
    const newCards = cards.filter(c => c !== widgetId)
    setCards(newCards)
    if (currentIndex >= newCards.length) setCurrentIndex(Math.max(0, newCards.length))
  }

  const getWidgetById = (id) => {
    for (const cat of widgetCategories) {
      const w = cat.widgets.find(w => w.id === id)
      if (w) return w
    }
    return null
  }

  const cw = containerW || 375
  const rawPx = -(currentIndex * cw) + dragX
  const slidePx = Math.max(-(totalSlides - 1) * cw, Math.min(0, rawPx))

  return (
    <div className="h-full flex flex-col bg-[#FAFAF8] overflow-hidden" style={{ fontFamily: 'Inter, sans-serif', touchAction: 'pan-y' }}>
      {/* Cards track */}
      <div
        ref={containerRef}
        className="flex-1 relative overflow-hidden"
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        <div
          className="flex h-full"
          style={{
            transform: `translateX(${slidePx}px)`,
            transition: dragX === 0 ? 'transform 0.35s cubic-bezier(0.25, 0.46, 0.45, 0.94)' : 'none',
            width: `${totalSlides * cw}px`,
          }}
        >
          {cards.map((cardId, index) => {
            const widget = getWidgetById(cardId)
            if (!widget) return null
            return (
              <div key={cardId} className="shrink-0 flex items-center justify-center" style={{ width: cw + 'px', height: 'calc(100vh - 120px)' }}>
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 relative overflow-hidden" style={{ width: (cw - 32) + 'px', height: 'calc(100vh - 152px)' }}>
                  {/* Page fold effect */}
                  {dragX !== 0 && index === currentIndex && (() => {
                    const progress = Math.min(Math.abs(dragX) / SWIPE_THRESHOLD, 1)
                    const foldSize = Math.round(progress * FOLD_MAX)
                    const passed = Math.abs(dragX) >= SWIPE_THRESHOLD
                    if (foldSize < 5) return null
                    return (
                      <div className="absolute top-0 right-0 z-20" style={{ width: foldSize + 'px', height: foldSize + 'px' }}>
                        <svg width={foldSize} height={foldSize} viewBox={`0 0 ${foldSize} ${foldSize}`}>
                          <path d={`M0,0 L${foldSize},0 L${foldSize},${foldSize} Z`} fill={passed ? '#111827' : '#E5E7EB'} />
                          <path d={`M0,0 L0,${foldSize} L${foldSize},${foldSize} Z`} fill={passed ? '#333' : '#F3F4F6'} />
                        </svg>
                      </div>
                    )
                  })()}
                  <button
                    onClick={() => removeCard(cardId)}
                    className="absolute top-4 right-4 z-10 w-8 h-8 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center transition-colors"
                  >
                    <X className="w-4 h-4 text-gray-600" />
                  </button>
                  <div className="flex items-center gap-3 mb-4">
                    <LucideIcon name={widget.icon} size={20} style={{ color: '#111827' }} />
                    <h2 className="text-lg font-semibold" style={{ color: '#111827' }}>{L(lang, widget.name)}</h2>
                  </div>
                  <div className="overflow-y-auto" style={{ height: 'calc(100% - 60px)', overflowX: 'hidden', touchAction: 'pan-y' }}>
                    <WidgetContent widgetId={cardId} lang={lang} setTab={setTab} />
                  </div>
                </div>
              </div>
            )
          })}

          {/* Add card */}
          <div className="shrink-0 flex items-center justify-center" style={{ width: cw + 'px', height: 'calc(100vh - 120px)' }}>
            <div
              className="bg-white rounded-2xl border-2 border-dashed border-gray-300 flex flex-col items-center justify-center cursor-pointer hover:border-gray-400 transition-colors"
              style={{ width: (cw - 32) + 'px', height: 'calc(100vh - 152px)' }}
              onClick={() => setShowAdd(true)}
            >
              <Plus className="w-12 h-12 text-gray-400 mb-4" />
              <p className="text-lg font-medium text-gray-600">
                {L(lang, { ko: '카드 추가', zh: '添加卡片', en: 'Add Card' })}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Dot indicators */}
      {totalSlides > 1 && (
        <div className="flex justify-center items-center py-3 gap-2">
          {Array.from({ length: totalSlides }).map((_, i) => (
            <div key={i} className={`w-2 h-2 rounded-full transition-all ${i === currentIndex ? 'bg-[#111827] w-4' : 'bg-gray-300'}`} />
          ))}
        </div>
      )}

      {/* Add Widget Modal */}
      {showAdd && (
        <div className="fixed inset-0 bg-black/50 flex items-end z-50" onClick={() => setShowAdd(false)}>
          <div className="bg-white rounded-t-2xl w-full max-h-[70vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-semibold" style={{ color: '#111827' }}>
                  {L(lang, { ko: '위젯 선택', zh: '选择小部件', en: 'Choose Widget' })}
                </h3>
                <button onClick={() => setShowAdd(false)} className="w-8 h-8 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center">
                  <X className="w-4 h-4 text-gray-600" />
                </button>
              </div>
              {widgetCategories.map((cat) => (
                <div key={cat.id} className="mb-6">
                  <h4 className="text-sm font-semibold uppercase tracking-wider text-gray-500 mb-3">{L(lang, cat.name)}</h4>
                  <div className="grid grid-cols-2 gap-2">
                    {cat.widgets.map((w) => (
                      <button
                        key={w.id}
                        onClick={() => addCard(w.id)}
                        disabled={cards.includes(w.id)}
                        className={`p-3 rounded-xl border text-left transition-colors ${
                          cards.includes(w.id) ? 'bg-gray-50 border-gray-200 opacity-40' : 'bg-white border-gray-200 hover:bg-gray-50'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <LucideIcon name={w.icon} size={16} style={{ color: '#111827' }} />
                          <span className="font-medium text-sm" style={{ color: '#111827' }}>{L(lang, w.name)}</span>
                        </div>
                        <p className="text-xs text-gray-400 mt-1 line-clamp-1">{L(lang, w.description)}</p>
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
export { TreeSection, LucideIcon, WidgetContent, getEnabledWidgetsForSection }