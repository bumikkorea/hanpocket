import { useState, useEffect } from 'react'
import { Copy, Phone } from 'lucide-react'
import Button from './ButtonSystem'

const L = (obj) => {
  if (!obj) return ''
  if (typeof obj === 'string') return obj
  return obj.zh || obj.ko || obj.en || ''
}

export default function TaxiModeCard({ hotel }) {
  const [copied, setCopied] = useState(false)

  const copyAddress = () => {
    navigator.clipboard.writeText(L(hotel.address))
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  useEffect(() => {
    // 택시 모드에서 화면 항상 켜져있음
    if ('wakeLock' in navigator) {
      navigator.wakeLock.request('screen').catch(() => {})
    }
  }, [])

  return (
    <div className="fixed inset-0 bg-[#1A1A1A] flex flex-col items-center justify-between p-4">
      {/* 상단 닫기 + 뱃지 */}
      <div className="w-full flex items-center justify-between">
        <button className="p-2 hover:bg-white/10 rounded-lg">
          <span className="text-white text-2xl">×</span>
        </button>
        <div className="px-4 py-2 bg-[var(--primary)] text-white text-sm font-semibold rounded-full">
          出租车模式
        </div>
      </div>

      {/* 중앙: 주소 카드 */}
      <div className="w-full max-w-sm">
        <div className="bg-white rounded-[20px] p-8 space-y-6 shadow-2xl">
          {/* 상단 accent bar */}
          <div
            className="h-1 w-12 rounded-full"
            style={{ backgroundColor: 'var(--primary)' }}
          />

          {/* 라벨 */}
          <div className="space-y-4">
            <p className="text-xs text-[var(--text-muted)] tracking-widest font-medium">
              目的地
            </p>

            {/* 한국어 주소 */}
            <h1 className="text-2xl font-bold text-[var(--text-primary)] leading-tight">
              {hotel.address.ko}
            </h1>

            {/* 중국어 매장명 */}
            <p className="text-sm text-[var(--text-secondary)]">
              {hotel.name.zh}
            </p>
          </div>

          {/* 구분선 */}
          <div className="h-0.5 w-10 bg-[var(--border)]" />

          {/* 예상 요금 */}
          <div className="space-y-1">
            <p className="text-xs text-[var(--text-muted)]">예상 요금</p>
            <p className="text-lg font-bold text-[var(--price)]">
              4,800 ~ 8,000 KRW
            </p>
          </div>
        </div>
      </div>

      {/* 하단 버튼 */}
      <div className="w-full space-y-2">
        <div className="flex gap-2">
          <Button
            type="glass"
            size="lg"
            icon={Copy}
            onClick={copyAddress}
          >
            {copied ? '✓ 복사됨' : '复制地址'}
          </Button>
        </div>
        <Button
          type="primary"
          size="lg"
          icon={Phone}
          onClick={() => window.location.href = `tel:${hotel.phone}`}
        >
          拨打电话
        </Button>

        {/* 화면 항상 켜짐 표시 */}
        <div className="flex items-center justify-center gap-2 pt-2">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          <p className="text-xs text-white/60">屏幕常亮中</p>
        </div>
      </div>
    </div>
  )
}
