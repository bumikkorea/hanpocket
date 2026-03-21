import { Utensils, Car, MapPin, Sparkles, Phone, ShoppingBag } from 'lucide-react'

const L = (obj) => {
  if (!obj) return ''
  if (typeof obj === 'string') return obj
  return obj.zh || obj.ko || obj.en || ''
}

const menuItems = [
  {
    id: 'delivery',
    icon: ShoppingBag,
    name: { ko: '배달주문', zh: '外卖订餐', en: 'Delivery' },
    color: '#FF6B35',
    emoji: '🍜'
  },
  {
    id: 'taxi',
    icon: Car,
    name: { ko: '택시호출', zh: '出租车', en: 'Taxi' },
    color: '#F9A825',
    emoji: '🚖'
  },
  {
    id: 'food',
    icon: Utensils,
    name: { ko: '맛집탐색', zh: '美食探店', en: 'Restaurants' },
    color: '#FF9500',
    emoji: '🍽️'
  },
  {
    id: 'beauty',
    icon: Sparkles,
    name: { ko: '뷰티예약', zh: '美容预约', en: 'Beauty' },
    color: '#E91E63',
    emoji: '💅'
  },
  {
    id: 'map',
    icon: MapPin,
    name: { ko: '주변지도', zh: '周边地图', en: 'Map' },
    color: '#2196F3',
    emoji: '🗺️'
  },
  {
    id: 'emergency',
    icon: Phone,
    name: { ko: '긴급전화', zh: '紧急电话', en: 'Emergency' },
    color: '#F44336',
    emoji: '📞'
  }
]

export default function HotelMenuGrid({ onSelectMenu }) {
  return (
    <div className="px-[var(--spacing-xl)] py-[var(--spacing-2xl)] space-y-[var(--spacing-2xl)]">
      {/* 히어로 배너 */}
      <div
        className="h-40 rounded-[var(--radius-card)] flex flex-col items-center justify-center text-white p-6"
        style={{
          background: 'linear-gradient(135deg, var(--primary), var(--primary-light))',
          color: 'white'
        }}
      >
        <h1 className="text-2xl font-bold text-center">发现首尔</h1>
        <p className="text-sm text-white/80 mt-var(--spacing-md)">选择一项服务开始探索</p>
      </div>

      {/* 6개 메뉴 그리드 */}
      <div className="grid grid-cols-3 gap-4">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onSelectMenu(item.id)}
            className="flex flex-col items-center gap-3 p-4 rounded-[var(--radius-card)] transition-all hover:bg-[var(--bg)] active:scale-95"
          >
            {/* 아이콘 배경 */}
            <div
              className="w-16 h-16 rounded-[var(--radius-btn)] flex items-center justify-center text-2xl"
              style={{ backgroundColor: item.color + '20' }}
            >
              {item.emoji}
            </div>

            {/* 라벨 */}
            <p className="text-xs font-medium text-[var(--text-secondary)] text-center leading-tight">
              {L(item.name)}
            </p>
          </button>
        ))}
      </div>

      {/* 하단 정보 */}
      <div className="mt-8 pt-6 border-t border-[var(--border)] space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-sm text-[var(--text-secondary)]">🌡️ 온도</span>
          <span className="text-base font-semibold">18°C</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-[var(--text-secondary)]">💵 환율</span>
          <span className="text-base font-semibold">1 CNY = 180 KRW</span>
        </div>
      </div>
    </div>
  )
}
