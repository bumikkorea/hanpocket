import { useState } from 'react'
import { Calendar, Clock, User } from 'lucide-react'

export default function BeautyBookingPage({ hotel, language, L }) {
  const [selectedService, setSelectedService] = useState(null)
  const [selectedDate, setSelectedDate] = useState('')
  const [selectedTime, setSelectedTime] = useState('')

  const services = [
    { id: 'haircut', label: { ko: '헤어컷', zh: '剪发', en: 'Haircut' }, price: 35000 },
    { id: 'facial', label: { ko: '페이셜', zh: '面部护理', en: 'Facial' }, price: 50000 },
    { id: 'massage', label: { ko: '마사지', zh: '按摩', en: 'Massage' }, price: 60000 },
    { id: 'nails', label: { ko: '네일', zh: '美甲', en: 'Nails' }, price: 40000 },
  ]

  const times = [
    '10:00', '10:30', '11:00', '11:30', '12:00',
    '14:00', '14:30', '15:00', '15:30', '16:00',
    '17:00', '17:30', '18:00'
  ]

  const handleBook = () => {
    if (selectedService && selectedDate && selectedTime) {
      const service = services.find(s => s.id === selectedService)
      alert(
        `예약 완료!\n\n` +
        `서비스: ${L(language, service.label)}\n` +
        `날짜: ${selectedDate}\n` +
        `시간: ${selectedTime}\n` +
        `가격: ₩${service.price.toLocaleString()}`
      )
    }
  }

  return (
    <div className="h-full flex flex-col bg-gray-50">
      <div className="flex-1 overflow-y-auto px-4 py-6">
        <div className="space-y-6">
          {/* Service Selection */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-3">
              {L(language, { ko: '서비스 선택', zh: '选择服务', en: 'Service' })}
            </h3>
            <div className="grid grid-cols-2 gap-3">
              {services.map(service => (
                <button
                  key={service.id}
                  onClick={() => setSelectedService(service.id)}
                  className={`p-4 rounded-lg font-semibold transition-all ${
                    selectedService === service.id
                      ? 'bg-[#9C27B0] text-white'
                      : 'bg-white text-gray-900 border border-gray-200 hover:border-[#9C27B0]'
                  }`}
                >
                  {L(language, service.label)}
                  <div className={`text-xs mt-1 ${selectedService === service.id ? 'opacity-90' : 'text-gray-500'}`}>
                    ₩{service.price.toLocaleString()}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Date Selection */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <Calendar size={18} />
              {L(language, { ko: '날짜 선택', zh: '选择日期', en: 'Date' })}
            </h3>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:border-[#9C27B0] outline-none"
            />
          </div>

          {/* Time Selection */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <Clock size={18} />
              {L(language, { ko: '시간 선택', zh: '选择时间', en: 'Time' })}
            </h3>
            <div className="grid grid-cols-3 gap-2">
              {times.map(time => (
                <button
                  key={time}
                  onClick={() => setSelectedTime(time)}
                  className={`py-2 rounded-lg font-medium text-sm transition-all ${
                    selectedTime === time
                      ? 'bg-[#9C27B0] text-white'
                      : 'bg-white text-gray-900 border border-gray-200 hover:border-[#9C27B0]'
                  }`}
                >
                  {time}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Book Button */}
      <div className="bg-white border-t border-gray-100 px-4 py-4">
        <button
          onClick={handleBook}
          disabled={!selectedService || !selectedDate || !selectedTime}
          className="w-full bg-[#9C27B0] text-white font-bold py-3 rounded-xl hover:bg-[#7B1FA2] disabled:bg-gray-300 active:scale-95 transition-all"
        >
          {L(language, { ko: '예약하기', zh: '预约', en: 'Book Now' })}
        </button>
      </div>
    </div>
  )
}
