import { useState } from 'react'
import { Plus, Minus, ShoppingCart } from 'lucide-react'
import MenuCategoryTabs from '../components/MenuCategoryTabs'
import MenuCard from '../components/MenuCard'
import CartSummary from '../components/CartSummary'
import PaymentModal from '../components/PaymentModal'
import { hotelMenus } from '../../data/hotelMenus'

export default function DeliveryPage({ hotel, language, L }) {
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [cart, setCart] = useState([])
  const [showPayment, setShowPayment] = useState(false)

  const categories = [
    { id: 'all', label: { ko: '전체', zh: '全部', en: 'All' } },
    { id: 'chicken', label: { ko: '치킨', zh: '炸鸡', en: 'Fried Chicken' } },
    { id: 'korean', label: { ko: '한식', zh: '韩食', en: 'Korean' } },
    { id: 'chinese', label: { ko: '중식', zh: '中餐', en: 'Chinese' } },
    { id: 'pizza', label: { ko: '피자', zh: '披萨', en: 'Pizza' } },
    { id: 'sides', label: { ko: '사이드', zh: '分食', en: 'Sides' } },
  ]

  const menus = selectedCategory === 'all'
    ? hotelMenus
    : hotelMenus.filter(m => m.category === selectedCategory)

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

  const total = cart.reduce((sum, item) => sum + item.price * item.qty, 0)

  return (
    <div className="h-full flex flex-col bg-gray-50">
      {/* Address Header */}
      <div className="bg-white px-4 py-4 border-b border-gray-100">
        <div className="text-xs text-gray-500 mb-1">배송지</div>
        <div className="font-semibold text-sm text-gray-900">{L(language, hotel.name)}</div>
      </div>

      {/* Category Tabs */}
      <MenuCategoryTabs
        categories={categories}
        selectedCategory={selectedCategory}
        onSelectCategory={setSelectedCategory}
        L={L}
        language={language}
      />

      {/* Menu List */}
      <div className="flex-1 overflow-y-auto px-4 py-4">
        <div className="space-y-3">
          {menus.map(menu => (
            <MenuCard
              key={menu.id}
              menu={menu}
              onAdd={() => addToCart(menu)}
              language={language}
              L={L}
            />
          ))}
        </div>
      </div>

      {/* Cart Summary + Checkout */}
      {cart.length > 0 && (
        <CartSummary
          cart={cart}
          total={total}
          language={language}
          L={L}
          onUpdateQty={updateQty}
          onRemove={removeFromCart}
          onCheckout={() => setShowPayment(true)}
        />
      )}

      {/* Payment Modal */}
      {showPayment && (
        <PaymentModal
          total={total}
          language={language}
          L={L}
          onClose={() => setShowPayment(false)}
          onConfirm={() => {
            setShowPayment(false)
            alert(`Order confirmed! Total: ₩${total.toLocaleString()}`)
            setCart([])
          }}
        />
      )}
    </div>
  )
}
