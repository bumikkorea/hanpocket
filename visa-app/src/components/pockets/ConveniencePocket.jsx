import { useState } from 'react'
import { Copy, ShoppingBag, Star } from 'lucide-react'

// 다국어 헬퍼 함수
const L = (lang, text) => text[lang] || text['ko']

export default function ConveniencePocket({ lang }) {
  const [toastMessage, setToastMessage] = useState('')

  // 토스트 메시지 표시 함수
  const showToast = (message) => {
    setToastMessage(message)
    setTimeout(() => setToastMessage(''), 2000)
  }

  // 클립보드 복사 함수
  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(() => {
      showToast(L(lang, { ko: '복사됨!', zh: '已复制!', en: 'Copied!' }))
    })
  }

  // 편의점 표현
  const expressions = [
    {
      ko: '데워주세요',
      zh: '请给我加热',
      en: 'Please heat it up',
      pronunciation: 'de-wo-ju-se-yo'
    },
    {
      ko: '봉투 주세요',
      zh: '请给我袋子',
      en: 'Please give me a bag',
      pronunciation: 'bong-tu ju-se-yo'
    },
    {
      ko: '카드로 할게요',
      zh: '我要刷卡',
      en: "I'll pay by card",
      pronunciation: 'ka-deu-ro hal-ge-yo'
    },
    {
      ko: '현금으로 할게요',
      zh: '我付现金',
      en: "I'll pay in cash",
      pronunciation: 'hyeon-geum-eu-ro hal-ge-yo'
    },
    {
      ko: '포인트 적립 안 해요',
      zh: '不积分',
      en: 'No points please',
      pronunciation: 'po-in-teu jeok-rip an hae-yo'
    },
    {
      ko: '영수증 주세요',
      zh: '请给我收据',
      en: 'Receipt please',
      pronunciation: 'yeong-su-jeung ju-se-yo'
    }
  ]

  // 편의점 꿀조합
  const recommendations = [
    {
      name: { ko: '삼각김밥 + 컵라면', zh: '三角饭团 + 杯面', en: 'Rice ball + Cup ramen' },
      price: '₩3,500~4,000',
      description: { ko: '든든한 한끼', zh: '饱腹一餐', en: 'Filling meal' }
    },
    {
      name: { ko: '도시락 + 단무지', zh: '便当 + 腌萝卜', en: 'Lunch box + Pickled radish' },
      price: '₩4,500~6,000',
      description: { ko: '균형 잡힌 식사', zh: '营养均衡', en: 'Balanced meal' }
    },
    {
      name: { ko: '바나나우유 + 초코파이', zh: '香蕉牛奶 + 巧克力派', en: 'Banana milk + Choco pie' },
      price: '₩2,500~3,000',
      description: { ko: '달콤한 간식', zh: '甜蜜零食', en: 'Sweet snack' }
    },
    {
      name: { ko: '떡볶이 + 오뎅', zh: '炒年糕 + 鱼糕', en: 'Tteokbokki + Fish cake' },
      price: '₩3,000~4,000',
      description: { ko: '매콤 분식', zh: '韩式辣味小食', en: 'Korean spicy snack' }
    },
    {
      name: { ko: '아이스크림 + 탄산음료', zh: '冰淇淋 + 碳酸饮料', en: 'Ice cream + Soda' },
      price: '₩2,000~3,500',
      description: { ko: '시원한 디저트', zh: '清凉甜品', en: 'Cool dessert' }
    }
  ]

  // 인기 간식
  const popularSnacks = [
    { name: { ko: '허니버터칩', zh: '蜂蜜黄油薯片', en: 'Honey Butter Chip' }, price: '₩1,800' },
    { name: { ko: '초코파이', zh: '巧克力派', en: 'Choco Pie' }, price: '₩1,200' },
    { name: { ko: '새우깡', zh: '虾条', en: 'Shrimp Cracker' }, price: '₩1,500' },
    { name: { ko: '포테토칩', zh: '薯片', en: 'Potato Chip' }, price: '₩1,600' },
    { name: { ko: '오감자', zh: '五味薯片', en: 'Oh Gamja' }, price: '₩1,700' },
    { name: { ko: '바나나킥', zh: '香蕉脆片', en: 'Banana Kick' }, price: '₩1,400' }
  ]

  // 편의점 브랜드별 특징
  const brands = [
    {
      name: 'CU',
      features: [
        { ko: 'CU 도시락 (가성비 좋음)', zh: 'CU便当 (性价比高)', en: 'CU lunch box (good value)' },
        { ko: '헤이즐넛 라떼 추천', zh: '推荐榛果拿铁', en: 'Hazelnut latte recommended' }
      ],
      color: 'bg-purple-100 border-purple-300 text-purple-700'
    },
    {
      name: 'GS25',
      features: [
        { ko: '따뜻한 음식 종류가 많음', zh: '热食种类丰富', en: 'Many hot food options' },
        { ko: '갓 프레시 (신선식품)', zh: 'GOD FRESH (新鲜食品)', en: 'GOD FRESH (fresh foods)' }
      ],
      color: 'bg-blue-100 border-blue-300 text-blue-700'
    },
    {
      name: '세븐일레븐',
      features: [
        { ko: '일본풍 도시락과 디저트', zh: '日式便当和甜点', en: 'Japanese-style lunch & desserts' },
        { ko: '세븐 카페 (좋은 원두)', zh: '7 Cafe (优质咖啡豆)', en: '7 Cafe (quality beans)' }
      ],
      color: 'bg-green-100 border-green-300 text-green-700'
    }
  ]

  return (
    <div className="space-y-4" style={{ fontFamily: 'Inter, sans-serif' }}>
      {/* 토스트 메시지 */}
      {toastMessage && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white px-4 py-2 rounded-lg text-sm z-50">
          {toastMessage}
        </div>
      )}

      {/* 편의점 표현 */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
          <ShoppingBag className="w-5 h-5" />
          {L(lang, { ko: '편의점 표현', zh: '便利店用语', en: 'Convenience Store Phrases' })}
        </h3>
        <div className="space-y-2">
          {expressions.map((item, index) => (
            <button
              key={index}
              onClick={() => copyToClipboard(item[lang])}
              className="w-full p-3 bg-white border border-gray-200 rounded-lg text-left hover:bg-gray-100 transition-colors group"
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="font-medium text-gray-800 mb-1">
                    {item[lang]}
                  </div>
                  <div className="text-sm text-gray-500">
                    {item.pronunciation}
                  </div>
                </div>
                <Copy className="w-4 h-4 text-gray-400 group-hover:text-gray-600" />
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* 편의점 꿀조합 TOP 5 */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
          <Star className="w-5 h-5 text-yellow-500" />
          {L(lang, { ko: '꿀조합 TOP 5', zh: '经典组合 TOP 5', en: 'Best Combo TOP 5' })}
        </h3>
        <div className="space-y-3">
          {recommendations.map((combo, index) => (
            <div
              key={index}
              className="bg-white border border-gray-200 rounded-lg p-3"
            >
              <div className="flex justify-between items-start mb-1">
                <div className="font-medium text-gray-800">
                  #{index + 1} {L(lang, combo.name)}
                </div>
                <div className="text-sm font-semibold text-green-600">
                  {combo.price}
                </div>
              </div>
              <div className="text-sm text-gray-600">
                {L(lang, combo.description)}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 인기 간식 */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <h3 className="font-semibold text-gray-800 mb-3">
          {L(lang, { ko: '인기 간식', zh: '人气零食', en: 'Popular Snacks' })}
        </h3>
        <div className="grid grid-cols-2 gap-2">
          {popularSnacks.map((snack, index) => (
            <div
              key={index}
              className="bg-white border border-gray-200 rounded-lg p-3"
            >
              <div className="font-medium text-gray-800 text-sm mb-1">
                {L(lang, snack.name)}
              </div>
              <div className="text-xs text-green-600 font-semibold">
                {snack.price}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 브랜드별 특징 */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <h3 className="font-semibold text-gray-800 mb-3">
          {L(lang, { ko: '브랜드별 특징', zh: '品牌特色', en: 'Brand Features' })}
        </h3>
        <div className="space-y-3">
          {brands.map((brand, index) => (
            <div
              key={index}
              className={`border rounded-lg p-3 ${brand.color}`}
            >
              <div className="font-semibold mb-2">{brand.name}</div>
              <div className="space-y-1">
                {brand.features.map((feature, featureIndex) => (
                  <div key={featureIndex} className="text-sm">
                    • {L(lang, feature)}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 사용법 안내 */}
      <div className="text-xs text-gray-500 bg-blue-50 p-3 rounded-lg">
        💡 {L(lang, { 
          ko: '표현을 탭하면 클립보드에 복사됩니다. 편의점에서 필요한 말을 미리 준비해보세요!', 
          zh: '点击表达即可复制到剪贴板。提前准备在便利店需要的话语！', 
          en: 'Tap expressions to copy to clipboard. Prepare phrases you need at convenience stores!' 
        })}
      </div>
    </div>
  )
}