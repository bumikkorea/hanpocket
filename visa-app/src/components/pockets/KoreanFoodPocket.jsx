import { useState, useMemo } from 'react'
import { Search, X, ChevronDown, ChevronUp } from 'lucide-react'
import { koreanFoodDB, foodCategories } from '../../data/koreanFoodDB'

const L = (lang, text) => text?.[lang] || text?.['ko'] || ''

const CATEGORY_COLORS = {
  bap: 'bg-amber-50',
  guk: 'bg-orange-50',
  jjigae: 'bg-red-50',
  gui: 'bg-stone-50',
  myeon: 'bg-yellow-50',
  bunsik: 'bg-pink-50',
  banchan: 'bg-emerald-50',
  jeon: 'bg-amber-50',
  street: 'bg-rose-50',
  dessert: 'bg-purple-50',
  alcohol: 'bg-slate-50',
  cafe: 'bg-sky-50',
  western: 'bg-indigo-50',
  chinese: 'bg-red-50',
  japanese: 'bg-blue-50',
}

function SpicyLevel({ level }) {
  if (!level) return null
  return (
    <span className="text-xs">
      {'🌶️'.repeat(level)}
    </span>
  )
}

function PriceDisplay({ price }) {
  if (!price) return null
  const [min, max] = price.split('-')
  const formatPrice = (p) => {
    const n = parseInt(p)
    return n >= 10000 ? `${(n / 10000).toFixed(n % 10000 === 0 ? 0 : 1)}만` : `${(n / 1000).toFixed(0)}천`
  }
  return (
    <span className="text-xs text-gray-400">
      ₩{formatPrice(min)}~{formatPrice(max)}
    </span>
  )
}

function FoodCard({ item, lang, onClick }) {
  const category = foodCategories.find(c => c.id === item.category)
  const bgColor = CATEGORY_COLORS[item.category] || 'bg-gray-50'

  return (
    <button
      onClick={onClick}
      className={`${bgColor} rounded-2xl p-4 text-left w-full transition-transform active:scale-[0.98]`}
    >
      <div className="flex items-start justify-between mb-2">
        <span className="text-[11px] text-gray-400 font-medium">
          {category ? L(lang, category) : ''}
        </span>
        {item.spicy > 0 && <SpicyLevel level={item.spicy} />}
      </div>
      <p className="text-[15px] font-semibold text-gray-900 leading-tight">{item.ko}</p>
      <p className="text-[13px] text-gray-500 mt-0.5">{lang === 'en' ? item.en : item.zh}</p>
      <div className="mt-3">
        <PriceDisplay price={item.price} />
      </div>
    </button>
  )
}

function DetailModal({ item, lang, onClose }) {
  const [recipeOpen, setRecipeOpen] = useState(false)
  if (!item) return null

  const category = foodCategories.find(c => c.id === item.category)
  const bgColor = CATEGORY_COLORS[item.category] || 'bg-gray-50'
  const desc = lang === 'en' ? item.desc_en : item.desc_zh
  const origin = lang === 'en' ? item.origin_en : item.origin_zh
  const recipe = item.recipe
  const steps = lang === 'en' ? recipe?.steps_en : recipe?.steps_zh
  const tips = lang === 'en' ? recipe?.tips_en : recipe?.tips_zh

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative w-full max-w-lg bg-white rounded-t-3xl max-h-[85vh] overflow-y-auto animate-slide-up">
        {/* Header */}
        <div className="sticky top-0 bg-white z-10 px-6 pt-4 pb-2 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <div className="w-10 h-1 bg-gray-200 rounded-full mx-auto absolute left-1/2 -translate-x-1/2 top-2" />
            <div />
            <button onClick={onClose} className="p-2 -mr-2 rounded-full hover:bg-gray-100">
              <X size={20} className="text-gray-400" />
            </button>
          </div>
        </div>

        <div className="px-6 pb-8">
          {/* Title area */}
          <div className={`${bgColor} rounded-2xl p-5 mt-4`}>
            <span className="text-[11px] text-gray-400 font-medium">
              {category ? L(lang, category) : ''}
            </span>
            <h2 className="text-2xl font-bold text-gray-900 mt-1">{item.ko}</h2>
            <p className="text-base text-gray-600 mt-0.5">{item.zh} · {item.en}</p>
            <div className="flex items-center gap-3 mt-3">
              {item.spicy > 0 && <SpicyLevel level={item.spicy} />}
              <PriceDisplay price={item.price} />
            </div>
          </div>

          {/* Description */}
          {desc && (
            <div className="mt-6">
              <p className="text-[14px] text-gray-700 leading-relaxed">{desc}</p>
            </div>
          )}

          {/* Origin / Fun Fact */}
          {origin && (
            <div className="mt-5 bg-gray-50 rounded-xl p-4">
              <p className="text-[11px] font-semibold text-gray-400 mb-1.5 uppercase tracking-wider">
                {lang === 'ko' ? '알고 먹으면 더 맛있는' : lang === 'en' ? 'Fun Fact' : '冷知识'}
              </p>
              <p className="text-[13px] text-gray-600 leading-relaxed">{origin}</p>
            </div>
          )}

          {/* Tips */}
          {tips && (
            <div className="mt-4 border border-gray-100 rounded-xl p-4">
              <p className="text-[11px] font-semibold text-gray-400 mb-1.5 uppercase tracking-wider">
                {lang === 'ko' ? '주문 꿀팁' : lang === 'en' ? 'Order Tip' : '点餐小贴士'}
              </p>
              <p className="text-[13px] text-gray-600 leading-relaxed">{tips}</p>
            </div>
          )}

          {/* Recipe */}
          {recipe && steps && steps.length > 0 && (
            <div className="mt-4">
              <button
                onClick={() => setRecipeOpen(!recipeOpen)}
                className="flex items-center justify-between w-full py-3 text-left"
              >
                <span className="text-[14px] font-semibold text-gray-900">
                  {lang === 'ko' ? '레시피' : lang === 'en' ? 'Recipe' : '食谱'}
                  {recipe.time && (
                    <span className="text-[12px] font-normal text-gray-400 ml-2">{recipe.time}</span>
                  )}
                </span>
                {recipeOpen ? <ChevronUp size={18} className="text-gray-400" /> : <ChevronDown size={18} className="text-gray-400" />}
              </button>
              {recipeOpen && (
                <div className="pb-2">
                  {/* Ingredients */}
                  {recipe.ingredients && recipe.ingredients.length > 0 && (
                    <div className="mb-4">
                      <p className="text-[12px] font-semibold text-gray-400 mb-2">
                        {lang === 'ko' ? '재료' : lang === 'en' ? 'Ingredients' : '材料'}
                      </p>
                      <div className="space-y-1.5">
                        {recipe.ingredients.map((ing, i) => (
                          <p key={i} className="text-[13px] text-gray-600">
                            · {lang === 'en' ? (ing.en || ing.ko) : (ing.zh || ing.ko)}
                          </p>
                        ))}
                      </div>
                    </div>
                  )}
                  {/* Steps */}
                  <div className="space-y-2">
                    {steps.map((step, i) => (
                      <div key={i} className="flex gap-3">
                        <span className="text-[12px] font-bold text-gray-300 mt-0.5 shrink-0 w-5 text-right">{i + 1}</span>
                        <p className="text-[13px] text-gray-600 leading-relaxed">{step}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes slide-up {
          from { transform: translateY(100%); }
          to { transform: translateY(0); }
        }
        .animate-slide-up {
          animation: slide-up 0.3s ease-out;
        }
      `}</style>
    </div>
  )
}

export default function KoreanFoodPocket({ lang }) {
  const [search, setSearch] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selectedItem, setSelectedItem] = useState(null)

  const filtered = useMemo(() => {
    let items = koreanFoodDB
    if (selectedCategory !== 'all') {
      items = items.filter(item => item.category === selectedCategory)
    }
    if (search.trim()) {
      const q = search.trim().toLowerCase()
      items = items.filter(item =>
        item.ko.toLowerCase().includes(q) ||
        item.zh.toLowerCase().includes(q) ||
        item.en.toLowerCase().includes(q)
      )
    }
    return items
  }, [search, selectedCategory])

  return (
    <div className="pb-6">
      {/* Search */}
      <div className="px-5 pt-4 pb-2">
        <div className="relative">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-300" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder={lang === 'ko' ? '메뉴 검색' : lang === 'en' ? 'Search menu' : '搜索菜单'}
            className="w-full pl-10 pr-4 py-2.5 bg-gray-50 rounded-xl text-[14px] text-gray-900 placeholder-gray-300 outline-none focus:ring-1 focus:ring-gray-200"
          />
          {search && (
            <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2">
              <X size={14} className="text-gray-300" />
            </button>
          )}
        </div>
      </div>

      {/* Category chips */}
      <div className="px-5 py-2 overflow-x-auto scrollbar-hide">
        <div className="flex gap-2 whitespace-nowrap">
          {foodCategories.map(cat => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3.5 py-1.5 rounded-full text-[13px] font-medium transition-colors shrink-0 ${
                selectedCategory === cat.id
                  ? 'bg-gray-900 text-white'
                  : 'bg-white text-gray-500 border border-gray-200'
              }`}
            >
              {L(lang, cat)}
            </button>
          ))}
        </div>
      </div>

      {/* Result count */}
      <div className="px-5 py-2">
        <p className="text-[12px] text-gray-400">
          {filtered.length}{lang === 'ko' ? '개 메뉴' : lang === 'en' ? ' menus' : '个菜单'}
        </p>
      </div>

      {/* Food grid */}
      <div className="px-5 grid grid-cols-2 gap-3">
        {filtered.map(item => (
          <FoodCard
            key={item.id}
            item={item}
            lang={lang}
            onClick={() => setSelectedItem(item)}
          />
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-400 text-[14px]">
            {lang === 'ko' ? '검색 결과가 없습니다' : lang === 'en' ? 'No results found' : '没有搜索结果'}
          </p>
        </div>
      )}

      {/* Detail modal */}
      {selectedItem && (
        <DetailModal
          item={selectedItem}
          lang={lang}
          onClose={() => setSelectedItem(null)}
        />
      )}
    </div>
  )
}
