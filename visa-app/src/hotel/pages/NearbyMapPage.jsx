import { MapPin, Coffee, Pill, Smartphone } from 'lucide-react'

export default function NearbyMapPage({ hotel, language, L }) {
  const nearbyPlaces = [
    {
      emoji: '☕',
      label: { ko: '카페', zh: '咖啡店', en: 'Cafe' },
      count: 8,
    },
    {
      emoji: '💊',
      label: { ko: '약국', zh: '药店', en: 'Pharmacy' },
      count: 3,
    },
    {
      emoji: '🏪',
      label: { ko: '편의점', zh: '便利店', en: 'Convenience' },
      count: 5,
    },
    {
      emoji: '🔌',
      label: { ko: '충전소', zh: '充电宝', en: 'Charger' },
      count: 2,
    },
  ]

  return (
    <div className="h-full flex flex-col bg-gray-50">
      {/* Map Placeholder */}
      <div className="h-64 bg-gray-200 flex items-center justify-center">
        <div className="text-center">
          <MapPin size={48} className="text-gray-400 mx-auto mb-2" />
          <p className="text-gray-500 text-sm">{L(language, { ko: '카카오맵 연동 예정', zh: '地图加载中', en: 'Map loading' })}</p>
        </div>
      </div>

      {/* Nearby Categories */}
      <div className="flex-1 overflow-y-auto px-4 py-6">
        <h3 className="font-semibold text-gray-900 mb-4">
          {L(language, { ko: '주변 시설', zh: '周边设施', en: 'Nearby Places' })}
        </h3>
        <div className="grid grid-cols-2 gap-3">
          {nearbyPlaces.map((place, idx) => (
            <div
              key={idx}
              className="bg-white rounded-xl p-4 text-center hover:shadow-md transition-shadow cursor-pointer"
            >
              <div className="text-3xl mb-2">{place.emoji}</div>
              <h4 className="font-semibold text-gray-900 text-sm mb-1">
                {L(language, place.label)}
              </h4>
              <p className="text-xs text-gray-500">{place.count}개</p>
            </div>
          ))}
        </div>

        {/* Info */}
        <div className="bg-blue-50 rounded-lg p-4 mt-6 text-xs text-blue-900">
          <p className="font-semibold mb-2">💡 팁:</p>
          <p>• {L(language, { ko: '핸드폰 배터리 부족 시 충전소를 찾아보세요', zh: '手机电量不足可找充电宝', en: 'Out of battery? Find a charger' })}</p>
          <p>• {L(language, { ko: '감기약은 가까운 약국에서 구입 가능합니다', zh: '感冒药可在药店购买', en: 'Cold meds available at pharmacies' })}</p>
        </div>
      </div>
    </div>
  )
}
