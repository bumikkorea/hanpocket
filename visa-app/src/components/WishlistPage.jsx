import { useState } from 'react'
import { ChevronLeft, MapPin, UtensilsCrossed, Sparkles, Plus, Trash2, Share2, Heart } from 'lucide-react'
import useWishlist from '../hooks/useWishlist'

const CATEGORIES = [
  { type: 'place', icon: MapPin, label: { ko: '장소', zh: '地点', en: 'Places' }, color: 'text-blue-500' },
  { type: 'food', icon: UtensilsCrossed, label: { ko: '음식', zh: '美食', en: 'Food' }, color: 'text-orange-500' },
  { type: 'experience', icon: Sparkles, label: { ko: '체험', zh: '体验', en: 'Experiences' }, color: 'text-purple-500' },
]

const ALL_FILTER = { type: 'all', label: { ko: '전체', zh: '全部', en: 'All' } }

const TEXT = {
  title: { ko: '나의 다음 한국 여행', zh: '我的下次韩国之旅', en: 'My Next Korea Trip' },
  addNew: { ko: '새 항목 추가', zh: '添加新项目', en: 'Add new item' },
  placeholder: { ko: '이름을 입력하세요', zh: '请输入名称', en: 'Enter name' },
  notePlaceholder: { ko: '메모 (선택)', zh: '备注（选填）', en: 'Note (optional)' },
  add: { ko: '추가', zh: '添加', en: 'Add' },
  cancel: { ko: '취소', zh: '取消', en: 'Cancel' },
  empty: { ko: '아직 위시리스트가 비어있어요.\n한국에서 하고 싶은 것들을 추가해보세요!', zh: '愿望清单还是空的。\n添加你在韩国想做的事吧！', en: "Your wishlist is empty.\nAdd things you'd love to do in Korea!" },
  share: { ko: '카드로 공유', zh: '分享卡片', en: 'Share as card' },
  items: { ko: '개 저장됨', zh: '个已保存', en: 'items saved' },
}

function L(lang, data) {
  if (typeof data === 'string') return data
  return data?.[lang] || data?.en || data?.zh || data?.ko || ''
}

function getCategoryInfo(type) {
  return CATEGORIES.find(c => c.type === type) || CATEGORIES[0]
}

export default function WishlistPage({ lang = 'zh', onBack }) {
  const { items, addItem, removeItem } = useWishlist()
  const [showAdd, setShowAdd] = useState(false)
  const [filter, setFilter] = useState('all')
  const [newName, setNewName] = useState('')
  const [newNote, setNewNote] = useState('')
  const [newType, setNewType] = useState('place')

  const filtered = filter === 'all' ? items : items.filter(i => i.type === filter)

  const grouped = CATEGORIES.reduce((acc, cat) => {
    acc[cat.type] = filtered.filter(i => i.type === cat.type)
    return acc
  }, {})

  const handleAdd = () => {
    const name = newName.trim()
    if (!name) return
    addItem({ type: newType, name, note: newNote.trim() })
    setNewName('')
    setNewNote('')
    setShowAdd(false)
  }

  const handleShare = () => {
    // TODO: Implement share as image card using html2canvas
    // 1. Render a styled card element with wishlist items
    // 2. Use html2canvas to capture it
    // 3. Trigger download or native share API
    if (navigator.share) {
      const text = items.map(i => `- ${i.name}`).join('\n')
      navigator.share({
        title: L(lang, TEXT.title),
        text: `${L(lang, TEXT.title)}\n\n${text}`
      }).catch(() => {})
    }
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="sticky top-0 bg-white/95 backdrop-blur-sm z-10 border-b border-gray-100">
        <div className="flex items-center justify-between px-4 py-3">
          <button onClick={onBack} className="p-1.5 -ml-1.5 rounded-full hover:bg-gray-100 transition">
            <ChevronLeft size={22} className="text-gray-700" />
          </button>
          <h1 className="text-base font-semibold text-gray-900">{L(lang, TEXT.title)}</h1>
          <button
            onClick={handleShare}
            disabled={items.length === 0}
            className="p-1.5 -mr-1.5 rounded-full hover:bg-gray-100 transition disabled:opacity-30"
          >
            <Share2 size={18} className="text-gray-500" />
          </button>
        </div>

        {/* Filter tabs */}
        <div className="flex gap-1.5 px-4 pb-3 overflow-x-auto">
          {[ALL_FILTER, ...CATEGORIES].map(cat => {
            const active = filter === cat.type
            return (
              <button
                key={cat.type}
                onClick={() => setFilter(cat.type)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition ${
                  active ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                }`}
              >
                {L(lang, cat.label)}
                {cat.type !== 'all' && (
                  <span className="ml-1 opacity-60">
                    {items.filter(i => i.type === cat.type).length}
                  </span>
                )}
              </button>
            )
          })}
        </div>
      </div>

      {/* Content */}
      <div className="px-4 py-4">
        {items.length === 0 ? (
          /* Empty state */
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <Heart size={48} className="text-gray-200 mb-4" />
            <p className="text-sm text-gray-400 whitespace-pre-line leading-relaxed">
              {L(lang, TEXT.empty)}
            </p>
            <button
              onClick={() => setShowAdd(true)}
              className="mt-6 px-5 py-2.5 bg-gray-900 text-white rounded-xl text-sm font-medium hover:bg-gray-800 transition"
            >
              <Plus size={16} className="inline mr-1 -mt-0.5" />
              {L(lang, TEXT.addNew)}
            </button>
          </div>
        ) : (
          <>
            {/* Item count */}
            <p className="text-xs text-gray-400 mb-4">
              {filtered.length} {L(lang, TEXT.items)}
            </p>

            {/* Grouped items */}
            {filter === 'all' ? (
              CATEGORIES.map(cat => {
                const catItems = grouped[cat.type]
                if (!catItems || catItems.length === 0) return null
                const Icon = cat.icon
                return (
                  <div key={cat.type} className="mb-6">
                    <div className="flex items-center gap-2 mb-2">
                      <Icon size={14} className={cat.color} />
                      <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                        {L(lang, cat.label)}
                      </span>
                    </div>
                    <div className="space-y-1.5">
                      {catItems.map(item => (
                        <WishlistItem key={item.id} item={item} onRemove={removeItem} />
                      ))}
                    </div>
                  </div>
                )
              })
            ) : (
              <div className="space-y-1.5">
                {filtered.map(item => (
                  <WishlistItem key={item.id} item={item} onRemove={removeItem} />
                ))}
              </div>
            )}

            {/* Add button */}
            <button
              onClick={() => setShowAdd(true)}
              className="w-full mt-4 py-3 border border-dashed border-gray-200 rounded-xl text-sm text-gray-400 hover:border-gray-300 hover:text-gray-500 transition flex items-center justify-center gap-1.5"
            >
              <Plus size={16} />
              {L(lang, TEXT.addNew)}
            </button>
          </>
        )}
      </div>

      {/* Add modal */}
      {showAdd && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white w-full max-w-md rounded-t-2xl sm:rounded-2xl p-6">
            <h3 className="text-base font-semibold text-gray-900 mb-4">{L(lang, TEXT.addNew)}</h3>

            {/* Type selector */}
            <div className="flex gap-2 mb-4">
              {CATEGORIES.map(cat => {
                const Icon = cat.icon
                const active = newType === cat.type
                return (
                  <button
                    key={cat.type}
                    onClick={() => setNewType(cat.type)}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-full text-xs font-medium transition ${
                      active ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    <Icon size={14} />
                    {L(lang, cat.label)}
                  </button>
                )
              })}
            </div>

            <input
              type="text"
              value={newName}
              onChange={e => setNewName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleAdd()}
              placeholder={L(lang, TEXT.placeholder)}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm mb-3 focus:outline-none focus:border-gray-400 transition"
              autoFocus
            />
            <input
              type="text"
              value={newNote}
              onChange={e => setNewNote(e.target.value)}
              placeholder={L(lang, TEXT.notePlaceholder)}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm mb-4 focus:outline-none focus:border-gray-400 transition"
            />

            <div className="flex gap-2">
              <button
                onClick={() => { setShowAdd(false); setNewName(''); setNewNote('') }}
                className="flex-1 py-2.5 text-sm text-gray-500 hover:text-gray-700 transition"
              >
                {L(lang, TEXT.cancel)}
              </button>
              <button
                onClick={handleAdd}
                disabled={!newName.trim()}
                className="flex-1 py-2.5 bg-gray-900 text-white rounded-xl text-sm font-medium disabled:opacity-30 hover:bg-gray-800 transition"
              >
                {L(lang, TEXT.add)}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function WishlistItem({ item, onRemove }) {
  const cat = getCategoryInfo(item.type)
  const Icon = cat.icon

  return (
    <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-gray-50 group transition">
      <Icon size={16} className={`${cat.color} shrink-0`} />
      <div className="flex-1 min-w-0">
        <p className="text-sm text-gray-800 truncate">{item.name}</p>
        {item.note && <p className="text-xs text-gray-400 truncate">{item.note}</p>}
      </div>
      <button
        onClick={() => onRemove(item.id)}
        className="p-1.5 rounded-full opacity-0 group-hover:opacity-100 hover:bg-red-50 transition"
      >
        <Trash2 size={14} className="text-red-400" />
      </button>
    </div>
  )
}
