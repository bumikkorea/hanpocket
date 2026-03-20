import { useState } from 'react'
import { MapPin, Clock, DollarSign } from 'lucide-react'
import TaxiAddressInput from '../components/TaxiAddressInput'
import TaxiDriverCard from '../components/TaxiDriverCard'

export default function TaxiPage({ hotel, language, L }) {
  const [destination, setDestination] = useState('')
  const [showDriverCard, setShowDriverCard] = useState(false)

  // Simple distance calculation (mock)
  const calculateFare = (dest) => {
    const distance = Math.random() * 10 + 2 // 2-12km
    const baseFare = 4800
    const perKmFare = 2000
    const fare = baseFare + Math.floor(distance * perKmFare)
    return { distance: Math.round(distance * 10) / 10, fare, eta: Math.round(distance * 2 + 3) }
  }

  const handleRequest = () => {
    if (destination.trim()) {
      setShowDriverCard(true)
    }
  }

  const fareInfo = destination ? calculateFare(destination) : null

  return (
    <div className="h-full flex flex-col bg-gray-50">
      {/* Departure Address (Fixed) */}
      <div className="bg-white px-4 py-4 border-b border-gray-100">
        <div className="text-xs text-gray-500 mb-1">출발지</div>
        <div className="flex items-center gap-2">
          <MapPin size={16} className="text-[#F9A825]" />
          <div className="font-semibold text-sm text-gray-900">{L(language, hotel.name)}</div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 px-4 py-6 overflow-y-auto">
        <div className="space-y-4">
          {/* Destination Input */}
          <div>
            <label className="text-xs text-gray-500 mb-2 block">목적지</label>
            <TaxiAddressInput
              value={destination}
              onChange={setDestination}
              placeholder={L(language, {
                ko: '목적지를 입력하세요',
                zh: '输入目的地',
                en: 'Enter destination',
              })}
              language={language}
              L={L}
            />
          </div>

          {/* Fare Estimate */}
          {fareInfo && (
            <div className="bg-white rounded-xl p-4 space-y-3">
              <h3 className="font-semibold text-gray-900">
                {L(language, { ko: '요금 예상', zh: '费用估计', en: 'Fare Estimate' })}
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">거리</span>
                  <span className="font-semibold">{fareInfo.distance} km</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">예상 시간</span>
                  <span className="font-semibold">{fareInfo.eta}분</span>
                </div>
                <div className="border-t border-gray-200 pt-2 flex justify-between">
                  <span className="font-semibold">예상 요금</span>
                  <span className="font-bold text-[#F9A825] text-lg">₩{fareInfo.fare.toLocaleString()}</span>
                </div>
              </div>
            </div>
          )}

          {/* Driver Card Preview */}
          {showDriverCard && fareInfo && (
            <div className="space-y-3">
              <h3 className="font-semibold text-gray-900">
                {L(language, { ko: '배정된 기사', zh: '司机信息', en: 'Driver Info' })}
              </h3>
              <TaxiDriverCard
                driver={{
                  name: 'Kim Min Ho',
                  rating: 4.8,
                  plate: '56가7890',
                  phone: '010-1234-5678',
                }}
                destination={destination}
                language={language}
                L={L}
              />
            </div>
          )}

          {/* Info */}
          <div className="bg-blue-50 rounded-lg p-4 text-xs text-blue-900">
            <p className="font-semibold mb-2">팁:</p>
            <p>• {L(language, { ko: '호텔에서 기사님이 5분 이내에 도착합니다', zh: '司机将在5分钟内到达酒店', en: 'Driver arrives in 5 min' })}</p>
            <p>• {L(language, { ko: '카드 또는 현금 결제 가능', zh: '支持刷卡或现金支付', en: 'Card or cash accepted' })}</p>
          </div>
        </div>
      </div>

      {/* Call Button */}
      <div className="bg-white border-t border-gray-100 px-4 py-4">
        <button
          onClick={handleRequest}
          disabled={!destination.trim()}
          className="w-full bg-[#F9A825] text-white font-bold py-3 rounded-xl hover:bg-[#E89412] disabled:bg-gray-300 active:scale-95 transition-all"
        >
          {showDriverCard
            ? L(language, { ko: '호출 중...', zh: '呼叫中...', en: 'Calling...' })
            : L(language, { ko: '택시 호출', zh: '呼叫出租车', en: 'Call Taxi' })}
        </button>
      </div>
    </div>
  )
}
