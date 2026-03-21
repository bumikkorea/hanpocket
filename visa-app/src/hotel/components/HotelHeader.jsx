import { X } from 'lucide-react'

const L = (obj) => {
  if (!obj) return ''
  if (typeof obj === 'string') return obj
  return obj.zh || obj.ko || obj.en || ''
}

export default function HotelHeader({ hotel, onClose }) {
  return (
    <div className="bg-white border-b border-[var(--border)] px-5 py-4 flex items-center justify-between">
      <button
        onClick={onClose}
        className="p-1.5 hover:bg-[var(--bg)] rounded-lg transition-colors"
      >
        <X size={24} className="text-[var(--text-primary)]" />
      </button>

      <div className="flex-1 ml-4 text-center">
        <h1 className="text-base font-semibold text-[var(--text-primary)]">{L(hotel.name)}</h1>
        <p className="text-xs text-[var(--text-muted)] mt-1">{L(hotel.address)}</p>
      </div>

      <div className="inline-flex items-center px-3 py-1.5 bg-[var(--primary)] text-white rounded-full text-xs font-medium">
        出租车模式
      </div>
    </div>
  )
}
