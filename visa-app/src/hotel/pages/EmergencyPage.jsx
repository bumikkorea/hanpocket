import { ArrowLeft, Phone } from 'lucide-react'

const L = (obj) => {
  if (!obj) return ''
  if (typeof obj === 'string') return obj
  return obj.zh || obj.ko || obj.en || ''
}

const emergencyNumbers = [
  { name: '警察', zh: '警察', ko: '경찰', number: '112', emoji: '🚨' },
  { name: '救护车', zh: '救护车', ko: '119', number: '119', emoji: '🚑' },
  { name: '观光咨询热线', zh: '旅游热线', ko: '관광안내', number: '1330', emoji: '📞' },
  { name: '中国大使馆', zh: '大使馆', ko: '대사관', number: '+82-2-3455-0100', emoji: '🏛️' },
  { name: '领事保护', zh: '领保热线', ko: '영사보호', number: '+86-10-6532-1821', emoji: '🆘' }
]

export default function EmergencyPage({ onBack }) {
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
        <h1 className="text-2xl font-bold">{L({ ko: '긴급 번호', zh: '紧急电话', en: 'Emergency' })}</h1>
      </div>

      {/* 히어로 배너 */}
      <div className="h-32 bg-gradient-to-br from-[var(--price)] to-[color-mix(in_srgb,var(--price)_80%,#000)] flex items-center justify-center">
        <div className="text-center text-white">
          <div className="text-5xl mb-2">🆘</div>
          <p className="text-sm font-semibold">{L({ ko: '긴급 상황시 전화하기', zh: '紧急情况请拨打', en: 'Emergency numbers' })}</p>
        </div>
      </div>

      {/* 번호 리스트 */}
      <div className="flex-1 overflow-y-auto px-[var(--spacing-xl)] py-[var(--spacing-lg)] space-y-[var(--spacing-md)]">
        {emergencyNumbers.map((item, idx) => (
          <a
            key={idx}
            href={`tel:${item.number}`}
            className="flex items-center justify-between p-[var(--spacing-lg)] bg-[var(--surface)] rounded-[var(--radius-card)] hover:bg-red-50 active:scale-95 transition-all"
          >
            <div className="flex items-center gap-3 flex-1">
              <div className="text-3xl">{item.emoji}</div>
              <div className="min-w-0">
                <p className="font-semibold text-sm">{item.name}</p>
                <p className="text-xs text-[var(--text-muted)]">{item.zh}</p>
              </div>
            </div>

            <div className="flex items-center gap-2 ml-3">
              <div className="text-right">
                <p className="font-bold text-base text-[var(--price)]">{item.number}</p>
              </div>
              <Phone size={20} className="text-[var(--price)]" />
            </div>
          </a>
        ))}
      </div>

      {/* 주의사항 */}
      <div className="px-[var(--spacing-xl)] py-[var(--spacing-lg)] bg-yellow-50 border-t border-yellow-200">
        <p className="text-xs text-yellow-700 leading-relaxed">
          {L({ ko: '긴급 상황이 아닌 경우 먼저 호텔 프론트에 연락하세요', zh: '非紧急情况请先联系酒店前台', en: 'Contact hotel reception for non-emergencies' })}
        </p>
      </div>
    </div>
  )
}
