import React, { useState, useRef, useEffect } from 'react'
import { widgetCategories } from '../../data/widgets'
import WidgetContent from '../home/common/WidgetContent'
import LucideIcon from '../home/common/LucideIcon'
import { L } from '../home/utils/helpers'

// ─── Widget Section Groupings ───
const SECTION_TODAY = ['editorpick', 'cvsnew', 'beautynew', 'kpop', 'fanevent', 'restaurant']

function getEnabledWidgetsForSection(sectionIds, config = { enabled: {} }) {
  const allWidgets = []
  widgetCategories.forEach(cat => {
    cat.widgets.forEach(w => {
      if (sectionIds.includes(w.id) && (config.enabled[w.id] !== false)) {
        allWidgets.push(w)
      }
    })
  })
  return allWidgets
}

// ─── Apple Store Horizontal Card Scroll ───
// (Using simplified version for TodaySection)

function HScrollSection({ children }) {
  return (
    <div className="flex gap-4 overflow-x-auto no-scrollbar pb-2 -mx-1 px-1"
      style={{ scrollSnapType: 'x mandatory', touchAction: 'pan-x' }}>
      {children}
    </div>
  )
}

// ─── Today Widget Card ───

function TodayWidgetCard({ widget, lang, setTab }) {
  return (
    <div className={`w-[280px] h-[320px] shrink-0 bg-white border border-[#E5E7EB] rounded-lg p-4 flex flex-col shadow-sm`} style={{ scrollSnapAlign: 'start' }}>
      <div className="mb-3 shrink-0">
        <div className="flex items-center gap-2">
          <LucideIcon name={widget.icon} size={16} className="text-[#111827]" />
          <span className="text-xs font-semibold text-[#111827]">{L(lang, widget.name)}</span>
        </div>
      </div>
      <div
        className="flex-1 overflow-y-auto no-scrollbar min-h-0"
        style={{ WebkitOverflowScrolling: 'touch', overscrollBehaviorY: 'contain', touchAction: 'pan-y' }}
        onTouchStart={(e) => e.stopPropagation()}
        onTouchMove={(e) => {
          const el = e.currentTarget
          if (el.scrollHeight > el.clientHeight) e.stopPropagation()
        }}
      >
        <WidgetContent widgetId={widget.id} lang={lang} setTab={setTab} />
      </div>
    </div>
  )
}

// ─── Today Section Component ───

function TodaySection({ lang, setTab, config }) {
  const todayWidgets = getEnabledWidgetsForSection(SECTION_TODAY, config)

  if (todayWidgets.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-sm text-[#9CA3AF]">
          {lang === 'ko' ? '오늘의 위젯이 없습니다' : lang === 'zh' ? '今日没有小部件' : 'No widgets for today'}
        </p>
      </div>
    )
  }

  return (
    <HScrollSection>
      {todayWidgets.map(widget => (
        <TodayWidgetCard
          key={widget.id}
          widget={widget}
          lang={lang}
          setTab={setTab}
        />
      ))}
    </HScrollSection>
  )
}

export default TodaySection
export { SECTION_TODAY, getEnabledWidgetsForSection }