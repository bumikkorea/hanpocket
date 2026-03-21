import { useState } from 'react'
import { ArrowLeft, Plus, Minus, ShoppingBag } from 'lucide-react'
import Button from '../components/ButtonSystem'

const L = (obj) => {
  if (!obj) return ''
  if (typeof obj === 'string') return obj
  return obj.zh || obj.ko || obj.en || ''
}

// 메뉴 데이터
const menuCategories = [
  { id: 'all', name: { zh: '全部', ko: '전체', en: 'All' } },
  { id: 'fried', name: { zh: '炸鸡', ko: '치킨', en: 'Fried Chicken' } },
  { id: 'korean', name: { zh: '韩食', ko: '한식', en: 'Korean' } },
  { id: 'chinese', name: { zh: '中餐', ko: '중식', en: 'Chinese' } },
  { id: 'pizza', name: { zh: '披萨', ko: '피자', en: 'Pizza' } },
  { id: 'sharing', name: { zh: '分食', ko: '공유', en: 'Sharing' } }
]

const menus = {
  all: [
    { id: 1, name: '炸鸡腿', zh: '4块装', en: 'Fried Chicken', price: 8900, emoji: '🍗', deliveryTime: '30min' },
    { id: 2, name: '比萨饼', zh: '芝士披萨', en: 'Cheese Pizza', price: 12000, emoji: '🍕', deliveryTime: '35min' },
    { id: 3, name: '汉堡包', zh: '双芝士堡', en: 'Cheese Burger', price: 6500, emoji: '🍔', deliveryTime: '20min' },
  ]
}

export default function DeliveryPage({ hotel, onBack }) {
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [cart, setCart] = useState([])
  const [roomNumber, setRoomNumber] = useState('')
  const [showPayment, setShowPayment] = useState(false)

  const addToCart = (menu) => {
    const existing = cart.find(item => item.id === menu.id)
    if (existing) {
      setCart(cart.map(item =>
        item.id === menu.id ? { ...item, qty: item.qty + 1 } : item
      ))
    } else {
      setCart([...cart, { ...menu, qty: 1 }])
    }
  }

  const removeFromCart = (menuId) => {
    setCart(cart.filter(item => item.id !== menuId))
  }

  const updateQty = (menuId, qty) => {
    if (qty <= 0) {
      removeFromCart(menuId)
    } else {
      setCart(cart.map(item =>
        item.id === menuId ? { ...item, qty } : item
      ))
    }
  }

  const totalPrice = cart.reduce((sum, item) => sum + item.price * item.qty, 0)
  const deliveryFee = 3000

  return (
    <div className="flex flex-col h-screen bg-white">
      {/* 헤더 */}
      <div className="px-[var(--spacing-xl)] py-[var(--spacing-lg)] border-b border-[var(--border)]">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-sm font-medium text-[var(--primary)] mb-[var(--spacing-lg)]"
        >
          <ArrowLeft size={20} />
          {L({ ko: '돌아가기', zh: '返回', en: 'Back' })}
        </button>
        <h1 className="text-2xl font-bold">{L({ ko: '배달 주문', zh: '外卖订餐', en: 'Delivery' })}</h1>
      </div>

      {/* 배송지 정보 */}
      <div className="px-[var(--spacing-xl)] py-[var(--spacing-lg)] bg-[var(--bg)] space-y-[var(--spacing-md)]">
        <p className="text-xs text-[var(--text-muted)]">배송지</p>
        <p className="font-semibold">{L(hotel.name)} · 방번호</p>
        <input
          type="text"
          placeholder={L({ zh: '请输入房间号码', ko: '방번호 입력', en: 'Room number' })}
          value={roomNumber}
          onChange={(e) => setRoomNumber(e.target.value)}
          className="w-full px-3 py-2 text-sm border border-[var(--border)] rounded-[var(--radius-btn)] outline-none focus:ring-1 focus:ring-[var(--primary)]/30"
        />
      </div>

      {/* 카테고리 탭 */}
      <div className="flex gap-[var(--spacing-md)] overflow-x-auto px-[var(--spacing-xl)] py-[var(--spacing-md)] border-b border-[var(--border)] scrollbar-hide">
        {menuCategories.map(cat => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={`px-3.5 h-8 flex-shrink-0 rounded-[var(--radius-chip)] border text-[13px] font-medium transition-colors ${
              selectedCategory === cat.id
                ? 'bg-[var(--text-primary)] text-white border-[var(--text-primary)]'
                : 'bg-white text-[var(--text-secondary)] border-[var(--border)]'
            }`}
          >
            {L(cat.name)}
          </button>
        ))}
      </div>

      {/* 메뉴 리스트 */}
      <div className="flex-1 overflow-y-auto px-[var(--spacing-xl)] py-[var(--spacing-lg)] space-y-[var(--spacing-md)]">
        {menus.all?.map(menu => (
          <div key={menu.id} className="flex items-center justify-between p-[var(--spacing-lg)] border border-[var(--border)] rounded-[var(--radius-card)]">
            <div className="flex items-center gap-3">
              <div className="text-3xl">{menu.emoji}</div>
              <div>
                <p className="font-semibold text-sm">{L(menu)}</p>
                <p className="text-xs text-[var(--text-muted)]">{menu.deliveryTime}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="text-right">
                <p className="font-bold text-sm text-[var(--price)]">{menu.price}원</p>
              </div>

              {cart.find(item => item.id === menu.id) ? (
                <div className="flex items-center gap-1 bg-[var(--bg)] rounded-[var(--radius-btn)]">
                  <button
                    onClick={() => updateQty(menu.id, (cart.find(item => item.id === menu.id)?.qty || 1) - 1)}
                    className="p-1 hover:bg-white"
                  >
                    <Minus size={16} className="text-[var(--text-secondary)]" />
                  </button>
                  <span className="w-6 text-center text-xs font-semibold">
                    {cart.find(item => item.id === menu.id)?.qty}
                  </span>
                  <button
                    onClick={() => updateQty(menu.id, (cart.find(item => item.id === menu.id)?.qty || 0) + 1)}
                    className="p-1 hover:bg-white"
                  >
                    <Plus size={16} className="text-[var(--primary)]" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => addToCart(menu)}
                  className="px-3 py-1.5 text-sm font-semibold text-white bg-[var(--primary)] rounded-[var(--radius-btn)] hover:-translate-y-0.5 transition-transform"
                >
                  {L({ zh: '加入', ko: '추가', en: 'Add' })}
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* 장바구니 바 */}
      {cart.length > 0 && (
        <div className="border-t border-[var(--border)] px-5 py-4 space-y-3 bg-[var(--bg)]">
          <div className="flex justify-between">
            <span className="text-sm text-[var(--text-secondary)]">{L({ zh: '小计', ko: '소계', en: 'Subtotal' })}</span>
            <span className="font-bold">{totalPrice}원</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-[var(--text-secondary)]">{L({ zh: '配送费', ko: '배달료', en: 'Delivery' })}</span>
            <span className="font-bold">{deliveryFee}원</span>
          </div>
          <div className="flex justify-between pt-2 border-t border-[var(--border)]">
            <span className="font-bold">{L({ zh: '总计', ko: '합계', en: 'Total' })}</span>
            <span className="text-lg font-bold text-[var(--primary)]">{totalPrice + deliveryFee}원</span>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-2">
            <Button type="outline" onClick={() => setCart([])}>
              {L({ zh: '清空', ko: '비우기', en: 'Clear' })}
            </Button>
            <Button type="primary" onClick={() => setShowPayment(true)} icon={ShoppingBag}>
              {L({ zh: '结账', ko: '결제', en: 'Pay' })}
            </Button>
          </div>
        </div>
      )}

      {/* 결제 모달 */}
      {showPayment && (
        <div className="fixed inset-0 z-50 bg-black/30 flex items-end">
          <div className="w-full bg-white rounded-t-[24px] p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="text-center">
              <h2 className="text-lg font-bold mb-2">{L({ zh: '选择支付方式', ko: '결제 방법 선택', en: 'Payment Method' })}</h2>
              <p className="text-sm text-[var(--text-secondary)]">{L({ zh: '订单总额', ko: '주문 총액', en: 'Total' })}: {totalPrice + deliveryFee}원</p>
            </div>

            <div className="space-y-2">
              <Button type="alipay" size="lg">
                {L({ zh: '支付宝', ko: '알리페이', en: 'Alipay' })}
              </Button>
              <Button type="wechat" size="lg">
                {L({ zh: '微信支付', ko: '위챗페이', en: 'WeChat Pay' })}
              </Button>
            </div>

            <Button type="outline" size="lg" onClick={() => setShowPayment(false)}>
              {L({ zh: '取消', ko: '취소', en: 'Cancel' })}
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
