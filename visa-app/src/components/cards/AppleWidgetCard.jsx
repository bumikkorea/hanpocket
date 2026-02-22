import React from 'react'
import WidgetContent from '../home/common/WidgetContent'
import { L } from '../home/utils/helpers'

// ─── Widget Card (Apple style) ───

function AppleWidgetCard({ widget, lang, setTab, dark }) {
  return (
    <div className={`w-[300px] h-[360px] shrink-0 rounded-lg p-5 flex flex-col bg-white border border-[#E5E7EB]`} style={{ scrollSnapAlign: 'start', boxShadow: '0 1px 3px rgba(0,0,0,0.06), 0 4px 12px rgba(0,0,0,0.04), 0 12px 36px rgba(0,0,0,0.03), inset 0 1px 0 rgba(255,255,255,0.9), inset 0 0 20px rgba(255,255,255,0.3)' }}>
      <div className="mb-3 shrink-0">
        <span className={`text-[10px] font-semibold text-[#6B7280]`}>{L(lang, widget.name)}</span>
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

export default AppleWidgetCard