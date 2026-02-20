import { useState } from 'react'
import { WidgetContent, LucideIcon, SECTION_CULTURE } from './HomeTab'
import { widgetCategories } from '../data/widgets'
import { ChevronRight, ChevronDown } from 'lucide-react'

function L(lang, data) {
  if (typeof data === 'string') return data
  return data?.[lang] || data?.en || data?.zh || data?.ko || ''
}

export default function CultureTab({ lang, setTab }) {
  const [activeWidget, setActiveWidget] = useState(null)

  const allWidgets = []
  widgetCategories.forEach(cat => {
    cat.widgets.forEach(w => {
      if (SECTION_CULTURE.includes(w.id)) allWidgets.push(w)
    })
  })

  return (
    <div className="space-y-4 animate-fade-up pb-4">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-[#111827] tracking-tight">
          {L(lang, { ko: '체험 & 문화.', zh: '体验与文化。', en: 'Experience & Culture.' })}
        </h1>
        <p className="text-sm text-[#6B7280] mt-1">
          {L(lang, { ko: '한국의 전통과 문화를 체험하세요.', zh: '体验韩国传统与文化。', en: 'Experience Korean tradition & culture.' })}
        </p>
      </div>

      <div className="border border-[#E5E7EB] rounded-lg overflow-hidden">
        {allWidgets.map(w => (
          <div key={w.id}>
            <button
              onClick={() => { setActiveWidget(activeWidget === w.id ? null : w.id) }}
              className={`w-full flex items-center justify-between px-4 py-3.5 text-left transition-all border-b border-[#F3F4F6] last:border-b-0 ${
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
              <div className="px-4 py-4 bg-[#FAFAFA] border-b border-[#E5E7EB] max-h-[400px] overflow-y-auto no-scrollbar">
                <WidgetContent widgetId={w.id} lang={lang} setTab={setTab} />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
