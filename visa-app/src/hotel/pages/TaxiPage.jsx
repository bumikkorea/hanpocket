import { useState } from 'react'
import { ArrowLeft } from 'lucide-react'
import TaxiModeCard from '../components/TaxiModeCard'

const L = (obj) => {
  if (!obj) return ''
  if (typeof obj === 'string') return obj
  return obj.zh || obj.ko || obj.en || ''
}

export default function TaxiPage({ hotel, onBack }) {
  const [showTaxiMode, setShowTaxiMode] = useState(false)

  if (showTaxiMode) {
    return (
      <TaxiModeCard hotel={hotel} />
    )
  }

  return (
    <div className="flex flex-col h-screen">
      {/* 헤더 */}
      <div className="px-5 py-4 border-b border-[var(--border)]">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-sm font-medium text-[var(--primary)] mb-4"
        >
          <ArrowLeft size={20} />
          {L({ ko: '돌아가기', zh: '返回', en: 'Back' })}
        </button>
        <h1 className="text-2xl font-bold">{L({ ko: '택시 호출', zh: '出租车模式', en: 'Taxi' })}</h1>
      </div>

      {/* 메인 콘텐츠 */}
      <div className="flex-1 flex flex-col items-center justify-center px-[var(--spacing-xl)] space-y-[var(--spacing-2xl)]">
        {/* 설명 */}
        <div className="text-center space-y-[var(--spacing-md)]">
          <p className="text-lg font-semibold text-[var(--text-primary)]">
            {L({ ko: '택시 기사에게 주소 보여주기', zh: '向司机展示地址', en: 'Show address to taxi driver' })}
          </p>
          <p className="text-sm text-[var(--text-secondary)]">
            {L({ ko: '호텔 주소를 큰 글씨로 표시합니다', zh: '酒店地址将以大字体显示', en: 'Hotel address shown in large font' })}
          </p>
        </div>

        {/* 호텔 정보 미리보기 */}
        <div className="w-full max-w-xs space-y-[var(--spacing-lg)] bg-[var(--surface)] p-[var(--spacing-2xl)] rounded-[var(--radius-card)]">
          <p className="text-xs text-[var(--text-muted)] font-medium">목적지</p>
          <div>
            <h2 className="text-2xl font-bold text-[var(--text-primary)]">{L(hotel.name)}</h2>
            <p className="text-sm text-[var(--text-secondary)] mt-[var(--spacing-md)]">{L(hotel.address)}</p>
          </div>
          <div className="pt-[var(--spacing-lg)] border-t border-[var(--border)]">
            <p className="text-xs text-[var(--text-muted)]">예상 요금</p>
            <p className="text-lg font-bold text-[var(--price)]">4,800 ~ 8,000 KRW</p>
          </div>
        </div>

        {/* CTA 버튼 */}
        <button
          onClick={() => setShowTaxiMode(true)}
          className="w-full max-w-xs h-13 px-[var(--spacing-xl)] bg-gradient-to-b from-[#FFA61A] to-[var(--warning)] text-white font-semibold rounded-[var(--radius-btn)] shadow-[0_1px_1px_rgba(255,149,0,0.12),0_2px_3px_rgba(255,149,0,0.05)] hover:-translate-y-0.5 active:scale-98 transition-all"
        >
          {L({ ko: '택시 모드 시작', zh: '进入出租车模式', en: 'Start Taxi Mode' })}
        </button>

        {/* 팁 */}
        <p className="text-xs text-[var(--text-muted)] text-center max-w-xs mt-[var(--spacing-lg)]">
          {L({ ko: '택시 기사에게 주소를 보여주고 확인받으세요', zh: '向司机展示地址并确认', en: 'Show to driver and confirm' })}
        </p>
      </div>
    </div>
  )
}
