import { useState } from 'react'
import { L } from '../utils/helpers'

export default function NewsWidget({ data, lang }) {
  const [expanded, setExpanded] = useState(false)
  const visibleItems = expanded ? data.items : data.items.slice(0, 3)

  return (
    <div>
      <div className="space-y-2">
        {visibleItems.map((item, i) => (
          <a 
            key={i} 
            href={item.url} 
            target="_blank" 
            rel="noopener noreferrer"
            className="block p-2.5 rounded-xl bg-[#F3F4F6] hover:bg-[#F3F4F6] transition-all"
          >
            <p className="text-xs font-semibold text-[#111827] leading-relaxed">{L(lang, item.title)}</p>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-[10px] text-[#6B7280]">{L(lang, item.source)}</span>
              <span className="text-[10px] text-[#9CA3AF]">{item.date}</span>
            </div>
          </a>
        ))}
      </div>
      {data.items.length > 3 && (
        <button 
          onClick={() => setExpanded(!expanded)}
          className="w-full mt-2 text-center text-xs font-bold text-[#111827] bg-[#F3F4F6] rounded-xl py-2 hover:bg-[#E5E7EB] transition-all"
        >
          {expanded
            ? (lang === 'ko' ? '접기' : lang === 'zh' ? '收起' : 'Show less')
            : (lang === 'ko' ? '더보기' : lang === 'zh' ? '查看更多' : 'Show more')
          }
        </button>
      )}
    </div>
  )
}