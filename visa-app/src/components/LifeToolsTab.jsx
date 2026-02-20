import { WidgetContent, LucideIcon, SECTION_TOOLS } from './HomeTab'
import { widgetCategories } from '../data/widgets'
import { ChevronDown } from 'lucide-react'

function L(lang, data) {
  if (typeof data === 'string') return data
  return data?.[lang] || data?.en || data?.zh || data?.ko || ''
}

export default function LifeToolsTab({ lang, setTab }) {
  const allWidgets = []
  widgetCategories.forEach(cat => {
    cat.widgets.forEach(w => {
      if (SECTION_TOOLS.includes(w.id)) allWidgets.push(w)
    })
  })

  return (
    <div className="space-y-4 animate-fade-up pb-4">
      <div className="mb-6">
        <p className="text-sm text-[#6B7280] mt-1">
          {L(lang, { ko: '한국 생활에 유용한 도구 모음.', zh: '韩国生活实用工具集。', en: 'Useful tools for life in Korea.' })}
        </p>
      </div>

      <div className="space-y-3">
        {allWidgets.map(w => (
          <div key={w.id} className="border border-[#E5E7EB] rounded-lg overflow-hidden">
            <div className="flex items-center gap-2.5 px-4 py-3 bg-white">
              <LucideIcon name={w.icon} size={16} className="text-[#B8956A]" />
              <span className="text-sm font-medium text-[#111827]">{L(lang, w.name)}</span>
              <ChevronDown size={14} className="text-[#B8956A] ml-auto" />
            </div>
            <div className="px-4 py-4 bg-[#FAFAFA] border-t border-[#E5E7EB] max-h-[400px] overflow-y-auto no-scrollbar">
              <WidgetContent widgetId={w.id} lang={lang} setTab={setTab} />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
