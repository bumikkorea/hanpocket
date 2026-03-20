import { Minus, Plus, X } from 'lucide-react'

export default function CartSummary({ cart, total, language, L, onUpdateQty, onRemove, onCheckout }) {
  return (
    <div className="bg-white border-t border-gray-200 px-4 py-4">
      {/* Cart Items Preview */}
      <div className="max-h-32 overflow-y-auto mb-4 space-y-2">
        {cart.map(item => (
          <div key={item.id} className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2 flex-1">
              <span className="text-lg">{item.emoji}</span>
              <span className="text-gray-700 flex-1">{L(language, item.name)}</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => onUpdateQty(item.id, item.qty - 1)}
                className="p-1 hover:bg-gray-100 rounded"
              >
                <Minus size={16} className="text-gray-500" />
              </button>
              <span className="w-6 text-center font-semibold">{item.qty}</span>
              <button
                onClick={() => onUpdateQty(item.id, item.qty + 1)}
                className="p-1 hover:bg-gray-100 rounded"
              >
                <Plus size={16} className="text-gray-500" />
              </button>
              <span className="w-12 text-right font-semibold">₩{(item.price * item.qty).toLocaleString()}</span>
              <button
                onClick={() => onRemove(item.id)}
                className="p-1 hover:bg-gray-100 rounded text-gray-400"
              >
                <X size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Total */}
      <div className="border-t border-gray-200 pt-3 mb-4">
        <div className="flex justify-between font-bold text-lg">
          <span>{L(language, { ko: '합계', zh: '合计', en: 'Total' })}</span>
          <span className="text-[#FF6B35]">₩{total.toLocaleString()}</span>
        </div>
      </div>

      {/* Checkout Button */}
      <button
        onClick={onCheckout}
        className="w-full bg-[#FF6B35] text-white font-bold py-3 rounded-xl hover:bg-[#E55A25] active:scale-95 transition-all"
      >
        {L(language, { ko: '결제하기', zh: '结账', en: 'Checkout' })}
      </button>
    </div>
  )
}
