import { useState } from 'react'
import { X, MapPin, UtensilsCrossed, Sparkles, Plus, Heart } from 'lucide-react'
import useWishlist from '../hooks/useWishlist'

const CATEGORIES = [
  { type: 'place', icon: MapPin, label: { ko: '가보고 싶은 곳', zh: '想去的地方', en: 'Places to visit' } },
  { type: 'food', icon: UtensilsCrossed, label: { ko: '먹고 싶은 음식', zh: '想吃的美食', en: 'Foods to try' } },
  { type: 'experience', icon: Sparkles, label: { ko: '하고 싶은 경험', zh: '想体验的事', en: 'Experiences' } },
]

const TEXT = {
  title: { ko: '이번에 못 한 것들,\n다음에 꼭 해요', zh: '这次没来得及的，\n下次一定要做到', en: "Things you didn't get to,\nnext time for sure" },
  subtitle: { ko: '다음 한국 여행을 위해 저장해두세요', zh: '为下次韩国之旅保存吧', en: 'Save them for your next Korea trip' },
  placeholder: { ko: '예: 경복궁, 떡볶이, 한복 체험...', zh: '例：景福宫、炒年糕、穿韩服…', en: 'e.g. Gyeongbokgung, tteokbokki, hanbok...' },
  save: { ko: '다음을 위해 저장', zh: '保存到下次', en: 'Save for next time' },
  saved: { ko: '저장했어요!', zh: '已保存！', en: 'Saved!' },
  skip: { ko: '괜찮아요', zh: '不用了', en: 'No thanks' },
}

function L(lang, data) {
  if (typeof data === 'string') return data
  return data?.[lang] || data?.en || data?.zh || data?.ko || ''
}

export default function WishlistPrompt({ lang = 'zh', onClose }) {
  const { addItem } = useWishlist()
  const [selectedType, setSelectedType] = useState('place')
  const [inputValue, setInputValue] = useState('')
  const [addedItems, setAddedItems] = useState([])
  const [saved, setSaved] = useState(false)

  const handleAdd = () => {
    const name = inputValue.trim()
    if (!name) return
    const item = addItem({ type: selectedType, name })
    setAddedItems(prev => [...prev, item])
    setInputValue('')
  }

  const handleSave = () => {
    setSaved(true)
    setTimeout(() => onClose?.(), 1200)
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleAdd()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white w-full max-w-md rounded-t-2xl sm:rounded-2xl max-h-[85vh] overflow-hidden animate-slide-up">
        {/* Header */}
        <div className="flex items-center justify-between p-5 pb-0">
          <div />
          <button onClick={onClose} className="p-1.5 rounded-full hover:bg-gray-100 transition">
            <X size={20} className="text-gray-400" />
          </button>
        </div>

        {/* Content */}
        <div className="px-6 pb-6 pt-2">
          {saved ? (
            <div className="text-center py-12">
              <Heart size={48} className="mx-auto text-rose-400 mb-4" fill="currentColor" />
              <p className="text-lg font-medium text-gray-900">{L(lang, TEXT.saved)}</p>
            </div>
          ) : (
            <>
              <h2 className="text-xl font-semibold text-gray-900 whitespace-pre-line leading-snug">
                {L(lang, TEXT.title)}
              </h2>
              <p className="text-sm text-gray-500 mt-2 mb-5">{L(lang, TEXT.subtitle)}</p>

              {/* Category selector */}
              <div className="flex gap-2 mb-4">
                {CATEGORIES.map(cat => {
                  const Icon = cat.icon
                  const active = selectedType === cat.type
                  return (
                    <button
                      key={cat.type}
                      onClick={() => setSelectedType(cat.type)}
                      className={`flex items-center gap-1.5 px-3 py-2 rounded-full text-xs font-medium transition ${
                        active
                          ? 'bg-gray-900 text-white'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      <Icon size={14} />
                      {L(lang, cat.label)}
                    </button>
                  )
                })}
              </div>

              {/* Input */}
              <div className="flex gap-2 mb-4">
                <input
                  type="text"
                  value={inputValue}
                  onChange={e => setInputValue(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={L(lang, TEXT.placeholder)}
                  className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-gray-400 transition"
                  autoFocus
                />
                <button
                  onClick={handleAdd}
                  disabled={!inputValue.trim()}
                  className="px-3 py-2.5 bg-gray-900 text-white rounded-xl disabled:opacity-30 transition hover:bg-gray-800"
                >
                  <Plus size={18} />
                </button>
              </div>

              {/* Added items */}
              {addedItems.length > 0 && (
                <div className="space-y-2 mb-5 max-h-32 overflow-y-auto">
                  {addedItems.map(item => {
                    const cat = CATEGORIES.find(c => c.type === item.type)
                    const Icon = cat?.icon || MapPin
                    return (
                      <div key={item.id} className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-lg text-sm">
                        <Icon size={14} className="text-gray-400 shrink-0" />
                        <span className="text-gray-700">{item.name}</span>
                      </div>
                    )
                  })}
                </div>
              )}

              {/* Actions */}
              <div className="flex flex-col gap-2">
                {addedItems.length > 0 && (
                  <button
                    onClick={handleSave}
                    className="w-full py-3 bg-gray-900 text-white rounded-xl text-sm font-medium hover:bg-gray-800 transition"
                  >
                    {L(lang, TEXT.save)}
                  </button>
                )}
                <button
                  onClick={onClose}
                  className="w-full py-3 text-gray-400 text-sm hover:text-gray-600 transition"
                >
                  {L(lang, TEXT.skip)}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
