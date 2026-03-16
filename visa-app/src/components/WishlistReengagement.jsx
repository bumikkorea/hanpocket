import { MapPin, UtensilsCrossed, Sparkles, ChevronRight } from 'lucide-react'
import useWishlist from '../hooks/useWishlist'

const ICON_MAP = {
  place: MapPin,
  food: UtensilsCrossed,
  experience: Sparkles,
}

const TEXT = {
  title: { ko: '다음 한국 여행, 준비됐나요?', zh: '准备好下一次韩国之旅了吗？', en: 'Ready for your next Korea trip?' },
  cta: { ko: '다음 여행 계획하기', zh: '计划下一次旅行', en: 'Plan your next trip' },
  items: { ko: '개의 위시리스트', zh: '个愿望清单', en: 'wishlist items' },
  more: { ko: '외', zh: '等', en: 'more' },
}

function L(lang, data) {
  if (typeof data === 'string') return data
  return data?.[lang] || data?.en || data?.zh || data?.ko || ''
}

export default function WishlistReengagement({ lang = 'zh', onOpen }) {
  const { items, shouldShowReengagement } = useWishlist()

  if (!shouldShowReengagement()) return null

  const preview = items.slice(0, 3)
  const remaining = items.length - preview.length

  return (
    <div
      onClick={onOpen}
      className="mx-4 my-3 p-4 bg-gradient-to-br from-gray-50 to-white border border-gray-100 rounded-2xl cursor-pointer hover: transition group"
    >
      <p className="text-sm font-semibold text-gray-900 mb-1">{L(lang, TEXT.title)}</p>
      <p className="text-xs text-gray-400 mb-3">
        {items.length} {L(lang, TEXT.items)}
      </p>

      {/* Preview items */}
      <div className="space-y-1.5 mb-3">
        {preview.map(item => {
          const Icon = ICON_MAP[item.type] || MapPin
          return (
            <div key={item.id} className="flex items-center gap-2 text-sm text-gray-600">
              <Icon size={13} className="text-gray-300 shrink-0" />
              <span className="truncate">{item.name}</span>
            </div>
          )
        })}
        {remaining > 0 && (
          <p className="text-xs text-gray-300 pl-5">
            +{remaining} {L(lang, TEXT.more)}
          </p>
        )}
      </div>

      {/* CTA */}
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-gray-900 group-hover:underline">
          {L(lang, TEXT.cta)}
        </span>
        <ChevronRight size={16} className="text-gray-300 group-hover:text-gray-500 transition" />
      </div>
    </div>
  )
}
