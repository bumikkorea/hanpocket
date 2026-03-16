import { useState, Suspense, lazy } from 'react'
import { trackEvent } from '../../../utils/analytics'

// Lazy loaded guide components
const ArrivalCardGuide = lazy(() => import('../../guides/ArrivalCardGuide'))
const SimGuide = lazy(() => import('../../guides/SimGuide'))
const TaxRefundGuide = lazy(() => import('../../guides/TaxRefundGuide'))
const DutyFreeGuide = lazy(() => import('../../guides/DutyFreeGuide'))

const GUIDE_ITEMS = [
  {
    id: 'arrival',
    name: { ko: '입국카드 작성', zh: '入境卡填写', en: 'Arrival Card' },
    icon: '📄',
    component: ArrivalCardGuide,
    description: { ko: '한국 입국 시 필요한 카드 작성법', zh: '韩国入境必需的卡片填写方法', en: 'How to fill Korean arrival card' }
  },
  {
    id: 'sim',
    name: { ko: 'SIM카드/eSIM', zh: 'SIM卡/eSIM', en: 'SIM/eSIM' },
    icon: '📱',
    component: SimGuide,
    description: { ko: '한국에서 인터넷 사용하기', zh: '在韩国使用网络', en: 'Internet access in Korea' }
  },
  {
    id: 'tax',
    name: { ko: '세금환급', zh: '退税', en: 'Tax Refund' },
    icon: '💰',
    component: TaxRefundGuide,
    description: { ko: '관광객 세금환급 받는 방법', zh: '游客退税方法', en: 'Tourist tax refund guide' }
  },
  {
    id: 'duty',
    name: { ko: '면세점 이용', zh: '免税店购物', en: 'Duty Free' },
    icon: '🛍️',
    component: DutyFreeGuide,
    description: { ko: '면세점 쇼핑 가이드', zh: '免税店购物指南', en: 'Duty free shopping guide' }
  }
]

export default function GuideWidget({ language, L }) {
  const [activeGuide, setActiveGuide] = useState(null)

  const handleGuideClick = (guideId) => {
    trackEvent('guide_open', { guide: guideId })
    setActiveGuide(guideId)
  }

  const handleCloseGuide = () => {
    setActiveGuide(null)
  }

  const activeGuideData = GUIDE_ITEMS.find(g => g.id === activeGuide)

  return (
    <div className="space-y-4">
      {/* 가이드 섹션 */}
      <div className="bg-white rounded-[6px] border border-[#E5E7EB] p-4">
        <h3 className="text-base font-semibold text-[#111827] mb-3">
          {L(language, { ko: '입국 준비 가이드', zh: '入境准备指南', en: 'Entry Preparation Guide' })}
        </h3>
        
        <div className="grid grid-cols-2 gap-3">
          {GUIDE_ITEMS.map(guide => (
            <button
              key={guide.id}
              onClick={() => handleGuideClick(guide.id)}
              className="flex flex-col items-center gap-2 p-3 rounded-[6px] bg-[#F9FAFB] hover:bg-[#F3F4F6] active:bg-[#E5E7EB] transition-colors"
            >
              <span className="text-2xl">{guide.icon}</span>
              <span className="text-sm font-medium text-[#111827] text-center leading-tight">
                {L(language, guide.name)}
              </span>
              <span className="text-xs text-[#6B7280] text-center leading-tight">
                {L(language, guide.description)}
              </span>
            </button>
          ))}
        </div>

        <div className="mt-4 p-3 bg-[#F0F9FF] rounded-[6px] border border-[#BAE6FD]">
          <p className="text-sm text-[#0284C7] font-medium mb-1">
            {L(language, { ko: '💡 입국 팁', zh: '💡 入境小贴士', en: '💡 Entry Tip' })}
          </p>
          <p className="text-xs text-[#0369A1]">
            {L(language, { 
              ko: '입국카드는 비행기에서 미리 작성하면 시간을 절약할 수 있어요', 
              zh: '在飞机上提前填写入境卡可以节省时间', 
              en: 'Fill out the arrival card on the plane to save time at immigration' 
            })}
          </p>
        </div>
      </div>

      {/* 가이드 모달/오버레이 */}
      {activeGuide && activeGuideData && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-start justify-center pt-8">
          <div className="bg-white rounded-[8px] w-full max-w-[480px] mx-4 max-h-[80vh] overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-[#E5E7EB]">
              <h2 className="text-lg font-semibold text-[#111827]">
                {L(language, activeGuideData.name)}
              </h2>
              <button
                onClick={handleCloseGuide}
                className="p-2 hover:bg-[#F3F4F6] rounded-[6px] transition-colors"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 6L6 18M6 6l12 12"/>
                </svg>
              </button>
            </div>
            <div className="p-4 overflow-y-auto max-h-[calc(80vh-80px)]">
              <Suspense fallback={
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin w-6 h-6 border-2 border-[#2D5A3D] border-t-transparent rounded-full"></div>
                </div>
              }>
                <activeGuideData.component />
              </Suspense>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}