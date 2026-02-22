import { useState } from 'react'
import { ChevronRight, ChevronDown } from 'lucide-react'
import LucideIcon from './LucideIcon'
import WidgetContent from './WidgetContent'
import { L } from '../utils/helpers'

export default function TreeSection({ title, widgets, lang, setTab, defaultOpen = false }) {
  const [open, setOpen] = useState(defaultOpen)
  const [activeWidget, setActiveWidget] = useState(null)

  return (
    <div className="border border-[#E5E7EB] rounded-lg overflow-hidden">
      <button
        onClick={() => { setOpen(!open); setActiveWidget(null) }}
        className="w-full flex items-center justify-between px-4 py-3.5 bg-white hover:bg-[#F9FAFB] transition-all"
      >
        <span className="text-sm font-semibold text-[#111827]">{title}</span>
        {open ? <ChevronDown size={18} className="text-[#111827]" /> : <ChevronRight size={18} className="text-[#9CA3AF]" />}
      </button>
      {open && (
        <div className="border-t border-[#E5E7EB]">
          {widgets.map(w => (
            <div key={w.id}>
              <button
                onClick={() => { const next = activeWidget === w.id ? null : w.id; setActiveWidget(next) }}
                className={`w-full flex items-center justify-between px-4 py-3 pl-8 text-left transition-all border-b border-[#F3F4F6] last:border-b-0 ${
                  activeWidget === w.id ? 'bg-[#FFFBF5]' : 'hover:bg-[#F9FAFB]'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <LucideIcon name={w.icon} size={16} className={activeWidget === w.id ? 'text-[#111827]' : 'text-[#9CA3AF]'} />
                  <span className={`text-sm ${activeWidget === w.id ? 'text-[#111827] font-medium' : 'text-[#374151]'}`}>{L(lang, w.name)}</span>
                </div>
                {activeWidget === w.id ? <ChevronDown size={14} className="text-[#111827]" /> : <ChevronRight size={14} className="text-[#D1D5DB]" />}
              </button>
              {activeWidget === w.id && (
                <div className="px-4 py-4 pl-8 bg-[#FAFAFA] border-b border-[#E5E7EB] max-h-[400px] overflow-y-auto no-scrollbar">
                  <WidgetContent widgetId={w.id} lang={lang} setTab={setTab} />
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}