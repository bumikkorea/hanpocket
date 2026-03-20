import { Utensils, Car, MapPin, Sparkles, Map, Phone } from 'lucide-react'

export default function HotelMenuGrid({ hotel, language, onSelectMenu, L }) {
  const menuItems = [
    {
      id: 'delivery',
      icon: Utensils,
      label: { ko: '배달 주문', zh: '点餐', en: 'Delivery' },
      color: 'bg-[#FF6B35]',
    },
    {
      id: 'taxi',
      icon: Car,
      label: { ko: '택시 호출', zh: '打车', en: 'Taxi' },
      color: 'bg-[#F9A825]',
    },
    {
      id: 'food',
      icon: Utensils,
      label: { ko: '주변 맛집', zh: '附近美食', en: 'Nearby Food' },
      color: 'bg-[#E91E63]',
    },
    {
      id: 'beauty',
      icon: Sparkles,
      label: { ko: '뷰티 예약', zh: '美容预约', en: 'Beauty Booking' },
      color: 'bg-[#9C27B0]',
    },
    {
      id: 'map',
      icon: Map,
      label: { ko: '주변 지도', zh: '周边地图', en: 'Nearby Map' },
      color: 'bg-[#00BCD4]',
    },
    {
      id: 'emergency',
      icon: Phone,
      label: { ko: '긴급 전화', zh: '紧急求助', en: 'Emergency' },
      color: 'bg-[#DC3545]',
    },
  ]

  return (
    <div className="px-4 py-6">
      <div className="grid grid-cols-2 gap-4 mb-8">
        {menuItems.map((item) => {
          const Icon = item.icon
          return (
            <button
              key={item.id}
              onClick={() => onSelectMenu(item.id)}
              className={`${item.color} rounded-2xl p-6 flex flex-col items-center justify-center gap-3 text-white shadow-sm hover:shadow-md transition-shadow active:scale-95`}
            >
              <Icon size={32} />
              <span className="text-sm font-semibold text-center">
                {L(language, item.label)}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
