import { Star, MapPin, Phone } from 'lucide-react'
import { nearbyFoods } from '../../data/nearbyLocations'

export default function NearbyFoodPage({ hotel, language, L }) {
  return (
    <div className="h-full flex flex-col bg-gray-50">
      {/* Header Info */}
      <div className="bg-white px-4 py-4 border-b border-gray-100">
        <div className="text-xs text-gray-500 mb-2">호텔 반경 1km 내 추천 맛집</div>
        <div className="font-semibold text-sm text-gray-900">{nearbyFoods.length}개 식당</div>
      </div>

      {/* Food List */}
      <div className="flex-1 overflow-y-auto px-4 py-4">
        <div className="space-y-3">
          {nearbyFoods.map(food => (
            <div key={food.id} className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
              {/* Header */}
              <div className="p-4 border-b border-gray-100">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-bold text-gray-900">{L(language, food.name)}</h3>
                  <span className="text-2xl">{food.emoji}</span>
                </div>
                <p className="text-xs text-gray-500 mb-3">{food.category}</p>

                {/* Rating & Distance */}
                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-1">
                    <Star size={14} className="fill-yellow-400 text-yellow-400" />
                    <span className="font-semibold">{food.rating}</span>
                  </div>
                  <div className="flex items-center gap-1 text-gray-600">
                    <MapPin size={14} />
                    <span>{food.distance}m</span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2 p-3">
                <button className="flex-1 bg-blue-50 text-blue-600 font-semibold py-2 rounded-lg hover:bg-blue-100 text-sm">
                  {L(language, { ko: '지도 보기', zh: '查看地图', en: 'Map' })}
                </button>
                <a
                  href={`tel:${food.phone}`}
                  className="flex-1 bg-[#E91E63] text-white font-semibold py-2 rounded-lg hover:bg-[#C2185B] text-sm text-center"
                >
                  {L(language, { ko: '전화', zh: '电话', en: 'Call' })}
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
