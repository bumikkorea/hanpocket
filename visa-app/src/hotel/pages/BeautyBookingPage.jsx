import { ArrowLeft, Check } from 'lucide-react'
import Button from '../components/ButtonSystem'

const L = (obj) => {
  if (!obj) return ''
  if (typeof obj === 'string') return obj
  return obj.zh || obj.ko || obj.en || ''
}

const services = [
  { id: 1, name: '修眉', emoji: '✨', time: '15分钟', price: 15000 },
  { id: 2, name: '美甲', emoji: '💅', time: '45分钟', price: 35000 },
  { id: 3, name: '按摩', emoji: '💆', time: '60分钟', price: 50000 },
  { id: 4, name: '护肤', emoji: '🧖', time: '50分钟', price: 40000 }
]

const timeSlots = [
  '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00'
]

export default function BeautyBookingPage({ hotel, onBack }) {
  return (
    <div className="flex flex-col h-screen bg-white">
      {/* 헤더 */}
      <div className="px-5 py-4 border-b border-[var(--border)]">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-sm font-medium text-[var(--primary)] mb-4"
        >
          <ArrowLeft size={20} />
          {L({ ko: '돌아가기', zh: '返回', en: 'Back' })}
        </button>
        <div>
          <h1 className="text-2xl font-bold">{L({ ko: '뷰티 예약', zh: '美容预约', en: 'Beauty Booking' })}</h1>
          <p className="text-xs text-[var(--text-muted)] mt-1">{L({ ko: '서비스 · 날짜 · 시간 선택', zh: '选择服务·日期·时间', en: 'Select service·date·time' })}</p>
        </div>
      </div>

      {/* 스텝 인디케이터 */}
      <div className="px-5 py-6 border-b border-[var(--border)] flex items-center justify-between">
        {[1, 2, 3].map((step, idx) => (
          <div key={step} className="flex items-center flex-1">
            {/* 원형 번호 */}
            <div
              className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold text-white"
              style={{ backgroundColor: idx <= 0 ? 'var(--primary)' : 'var(--surface)' }}
            >
              {idx <= 0 ? <Check size={16} /> : step}
            </div>

            {/* 연결선 */}
            {idx < 2 && (
              <div
                className="flex-1 h-0.5 mx-2"
                style={{ backgroundColor: idx < 0 ? 'var(--primary)' : 'var(--border)' }}
              />
            )}
          </div>
        ))}
      </div>

      {/* 서비스 카드 */}
      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-2">
        <p className="text-sm font-bold mb-3">{L({ ko: '서비스 선택', zh: '选择服务', en: 'Select Service' })}</p>
        
        {services.map(service => (
          <div
            key={service.id}
            className="flex items-center gap-4 p-4 border-1.5 border-[var(--border)] rounded-[var(--radius-card)] cursor-pointer hover:border-[var(--primary)] hover:bg-var(--primary-light) transition-colors"
          >
            {/* 좌측 이미지 */}
            <div className="w-14 h-14 rounded-[12px] flex items-center justify-center text-2xl bg-[#FFE5EC]">
              {service.emoji}
            </div>

            {/* 중앙 정보 */}
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-sm">{service.name}</h3>
              <p className="text-xs text-[var(--text-muted)]">{service.time}</p>
            </div>

            {/* 우측 가격 */}
            <div className="text-right">
              <p className="font-bold text-sm text-[var(--price)]">{service.price.toLocaleString()}원</p>
            </div>
          </div>
        ))}
      </div>

      {/* 시간 슬롯 */}
      <div className="px-5 py-4 border-t border-[var(--border)]">
        <p className="text-sm font-bold mb-3">{L({ ko: '시간 선택', zh: '选择时间', en: 'Select Time' })}</p>
        
        <div className="grid grid-cols-3 gap-2">
          {timeSlots.map(slot => (
            <button
              key={slot}
              className="h-11 border border-[var(--border)] rounded-[10px] text-sm font-medium bg-white hover:border-[var(--primary)] hover:text-[var(--primary)] transition-colors"
            >
              {slot}
            </button>
          ))}
        </div>
      </div>

      {/* CTA 버튼 */}
      <div className="px-5 py-4 space-y-2 border-t border-[var(--border)] bg-[var(--bg)]">
        <Button type="alipay" size="lg">
          {L({ ko: '알리페이', zh: '支付宝支付', en: 'Alipay' })}
        </Button>
        <Button type="wechat" size="lg">
          {L({ ko: '위챗페이', zh: '微信支付', en: 'WeChat Pay' })}
        </Button>
      </div>
    </div>
  )
}
