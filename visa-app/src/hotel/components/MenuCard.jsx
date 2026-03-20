import { Plus } from 'lucide-react'

export default function MenuCard({ menu, onAdd, language, L }) {
  return (
    <div className="bg-white rounded-xl p-4 flex gap-3 shadow-sm hover:shadow-md transition-shadow">
      {/* Image */}
      <div className="flex-shrink-0 w-20 h-20 rounded-lg bg-gray-100 flex items-center justify-center text-3xl">
        {menu.emoji}
      </div>

      {/* Info */}
      <div className="flex-1">
        <h3 className="font-semibold text-gray-900 mb-1">{L(language, menu.name)}</h3>
        <p className="text-xs text-gray-500 mb-2">{L(language, menu.desc)}</p>
        <div className="flex items-center justify-between">
          <span className="font-bold text-[#FF6B35]">₩{menu.price.toLocaleString()}</span>
          <span className="text-xs text-gray-400">~{menu.eta}분</span>
        </div>
      </div>

      {/* Add Button */}
      <div className="flex-shrink-0 flex items-end">
        <button
          onClick={onAdd}
          className="p-2 bg-[#FF6B35] text-white rounded-lg hover:bg-[#E55A25] active:scale-95 transition-all"
        >
          <Plus size={20} />
        </button>
      </div>
    </div>
  )
}
