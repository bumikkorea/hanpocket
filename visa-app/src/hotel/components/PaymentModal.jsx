import { X } from 'lucide-react'

export default function PaymentModal({ total, language, L, onClose, onConfirm }) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end z-50">
      <div className="bg-white w-full rounded-t-2xl p-6 animate-slide-up">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-gray-900">
            {L(language, { ko: '결제 방법', zh: '支付方式', en: 'Payment Method' })}
          </h3>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-lg">
            <X size={24} />
          </button>
        </div>

        {/* Amount */}
        <div className="bg-gradient-to-r from-[#FF6B35] to-[#E55A25] text-white rounded-xl p-4 mb-6">
          <div className="text-sm opacity-90 mb-1">
            {L(language, { ko: '결제 금액', zh: '支付金额', en: 'Payment Amount' })}
          </div>
          <div className="text-3xl font-bold">₩{total.toLocaleString()}</div>
        </div>

        {/* Payment Options */}
        <div className="space-y-3 mb-6">
          <button
            onClick={onConfirm}
            className="w-full bg-[#1F87EB] text-white font-semibold py-4 rounded-xl hover:bg-[#1A6FCF] active:scale-95 transition-all"
          >
            {L(language, { ko: 'WeChat 결제', zh: '微信支付', en: 'WeChat Pay' })}
          </button>
          <button
            onClick={onConfirm}
            className="w-full bg-[#00A4E4] text-white font-semibold py-4 rounded-xl hover:bg-[#0089C4] active:scale-95 transition-all"
          >
            {L(language, { ko: 'Alipay 결제', zh: '支付宝', en: 'Alipay' })}
          </button>
          <button
            onClick={onConfirm}
            className="w-full bg-[#A2AAAD] text-white font-semibold py-4 rounded-xl hover:bg-[#8B9299] active:scale-95 transition-all"
          >
            {L(language, { ko: '카드 결제', zh: '信用卡', en: 'Card Payment' })}
          </button>
        </div>

        {/* Cancel Button */}
        <button
          onClick={onClose}
          className="w-full bg-gray-100 text-gray-700 font-semibold py-3 rounded-xl hover:bg-gray-200"
        >
          {L(language, { ko: '취소', zh: '取消', en: 'Cancel' })}
        </button>
      </div>
    </div>
  )
}
