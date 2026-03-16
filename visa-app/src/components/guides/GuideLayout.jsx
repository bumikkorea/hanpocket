import { ChevronLeft } from 'lucide-react'

function L(lang, data) {
  if (typeof data === 'string') return data
  return data?.[lang] || data?.en || data?.zh || data?.ko || ''
}

export default function GuideLayout({ title, lang, onClose, children, tip }) {
  return (
    <div className="fixed top-[52px] inset-x-0 bottom-0 z-50 bg-white overflow-y-auto">
      <div className="px-4 pt-4 pb-20">
        {/* 헤더 */}
        <div className="flex items-center gap-3 mb-6">
          <button onClick={onClose} className="p-1">
            <ChevronLeft size={24} />
          </button>
          <h1 className="text-lg font-bold text-[#1A1A1A]">
            {typeof title === 'string' ? title : L(lang, title)}
          </h1>
        </div>

        {/* 본문 */}
        <div className="space-y-4">
          {children}
        </div>

        {/* 하단 팁 (선택적) */}
        {tip && (
          <div className="mt-8 p-4 rounded-2xl border border-[#E5E7EB] bg-[#F5F1EB]">
            <p className="text-xs text-[#666666] leading-relaxed">
              {typeof tip === 'string' ? tip : L(lang, tip)}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
