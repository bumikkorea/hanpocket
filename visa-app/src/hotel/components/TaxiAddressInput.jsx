import { MapPin, X } from 'lucide-react'

export default function TaxiAddressInput({ value, onChange, placeholder, language, L }) {
  return (
    <div className="relative">
      <div className="flex items-center gap-2 bg-white border border-gray-300 rounded-lg px-3 py-3 focus-within:border-[#F9A825] transition-colors">
        <MapPin size={18} className="text-gray-400 flex-shrink-0" />
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="flex-1 outline-none text-sm"
        />
        {value && (
          <button
            onClick={() => onChange('')}
            className="text-gray-400 hover:text-gray-600"
          >
            <X size={18} />
          </button>
        )}
      </div>
    </div>
  )
}
