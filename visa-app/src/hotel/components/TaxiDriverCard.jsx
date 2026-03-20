import { Phone, Star, Car } from 'lucide-react'

export default function TaxiDriverCard({ driver, destination, language, L }) {
  return (
    <div className="bg-white rounded-xl p-4 space-y-4">
      {/* Driver Info */}
      <div className="flex items-center gap-3 pb-4 border-b border-gray-100">
        <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-[#F9A825] to-[#E89412] flex items-center justify-center text-white text-2xl font-bold">
          {driver.name.charAt(0)}
        </div>
        <div className="flex-1">
          <h3 className="font-bold text-gray-900">{driver.name}</h3>
          <div className="flex items-center gap-1 text-sm">
            <Star size={14} className="fill-yellow-400 text-yellow-400" />
            <span className="text-gray-700">{driver.rating}</span>
          </div>
        </div>
        <button className="p-2 bg-[#F9A825] text-white rounded-lg hover:bg-[#E89412]">
          <Phone size={20} />
        </button>
      </div>

      {/* Car Info */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-sm">
          <Car size={16} className="text-gray-500" />
          <span className="text-gray-600">현대 캐스퍼 (New)</span>
        </div>
        <div className="flex items-center gap-2 text-sm font-bold">
          <span className="text-gray-900 bg-gray-100 px-3 py-2 rounded-lg">{driver.plate}</span>
        </div>
      </div>

      {/* Route */}
      <div className="bg-gray-50 rounded-lg p-3 space-y-2 text-sm">
        <div className="flex gap-2">
          <span className="text-gray-500 flex-shrink-0">🏨</span>
          <div className="text-gray-700">호텔에서</div>
        </div>
        <div className="flex gap-2">
          <span className="text-gray-500 flex-shrink-0">📍</span>
          <div className="text-gray-700 font-semibold">{destination}</div>
        </div>
      </div>

      {/* Call Button */}
      <a
        href={`tel:${driver.phone}`}
        className="w-full bg-[#F9A825] text-white font-bold py-3 rounded-lg hover:bg-[#E89412] text-center block active:scale-95 transition-all"
      >
        {L(language, { ko: '기사님 전화', zh: '拨打司机', en: 'Call Driver' })}
      </a>
    </div>
  )
}
