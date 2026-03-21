/**
 * Onboarding — 앱 첫 진입 3-슬라이드 온보딩
 * localStorage 'near_onboarding_done' 로 완료 여부 관리
 */
import { useState } from 'react'
import { Search, Calendar, MapPin, ArrowRight } from 'lucide-react'

const SLIDES = [
  {
    bg: 'linear-gradient(160deg, #FDF8F6, #F5E6DE, #EDCFBF)',
    icon: Search,
    iconColor: '#C4725A',
    iconBg: '#FDF3F1',
    decorColor1: 'rgba(196,114,90,0.12)',
    decorColor2: 'rgba(196,114,90,0.08)',
    title: '发现身边的好店',
    desc: '搜索附近的美容院、餐厅、快闪店\n用中文轻松找到想去的地方',
    cta: '下一步',
  },
  {
    bg: 'linear-gradient(160deg, #F0F7FF, #D6EAFF, #B8DAFF)',
    icon: Calendar,
    iconColor: '#007AFF',
    iconBg: '#EBF3FF',
    decorColor1: 'rgba(0,122,255,0.10)',
    decorColor2: 'rgba(0,122,255,0.06)',
    title: '3步完成预约',
    desc: '选择服务 → 选时间 → 微信/支付宝付款\n不用打电话，不用韩国手机号',
    cta: '下一步',
  },
  {
    bg: 'linear-gradient(160deg, #F0FFF4, #C6F6D5, #9AE6B4)',
    icon: MapPin,
    iconColor: '#34C759',
    iconBg: '#ECFDF5',
    decorColor1: 'rgba(52,199,89,0.10)',
    decorColor2: 'rgba(52,199,89,0.06)',
    title: '出租车模式直达',
    desc: '给司机看韩文地址，一键导航\n再也不用担心找不到路',
    cta: '开始探索首尔',
  },
]

export default function Onboarding({ onComplete }) {
  const [step, setStep] = useState(0)
  const [sliding, setSliding] = useState(false)

  const slide = SLIDES[step]
  const Icon = slide.icon

  const goNext = () => {
    if (step < SLIDES.length - 1) {
      setStep(s => s + 1)
    } else {
      onComplete()
    }
  }

  const skip = () => onComplete()

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9000,
      display: 'flex', flexDirection: 'column',
      height: '100dvh',
      fontFamily: '"Noto Sans SC", Pretendard, Inter, sans-serif',
    }}>
      {/* ─── 상단 60% 비주얼 영역 ─── */}
      <div style={{
        flex: '0 0 60%',
        background: slide.bg,
        position: 'relative', overflow: 'hidden',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        transition: 'background 0.4s ease',
      }}>
        {/* 우상단 장식 사각형 */}
        <div style={{
          position: 'absolute', top: 32, right: 28,
          width: 60, height: 60, borderRadius: 16,
          background: slide.decorColor1,
          transform: 'rotate(15deg)',
        }} />
        {/* 좌하단 장식 원 */}
        <div style={{
          position: 'absolute', bottom: 40, left: 24,
          width: 40, height: 40, borderRadius: '50%',
          background: slide.decorColor2,
        }} />

        {/* 중앙 아이콘 */}
        <div style={{
          width: 180, height: 180, borderRadius: '50%',
          background: 'rgba(255,255,255,0.6)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          boxShadow: '0 8px 32px rgba(0,0,0,0.06)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <div style={{
            width: 100, height: 100, borderRadius: 28,
            background: slide.iconBg,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Icon size={56} color={slide.iconColor} strokeWidth={1.5} />
          </div>
        </div>
      </div>

      {/* ─── 하단 40% 흰색 영역 ─── */}
      <div style={{
        flex: '0 0 40%',
        background: 'white',
        borderRadius: '28px 28px 0 0',
        padding: '32px 32px 40px',
        display: 'flex', flexDirection: 'column',
        marginTop: -28,
      }}>
        <div style={{ fontSize: 24, fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.3, transition: 'all 0.3s' }}>
          {slide.title}
        </div>
        <div style={{ fontSize: 15, color: 'var(--text-secondary)', lineHeight: 1.6, marginTop: 10, whiteSpace: 'pre-line', flex: 1, transition: 'all 0.3s' }}>
          {slide.desc}
        </div>

        {/* 도트 인디케이터 */}
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', margin: '28px 0 24px' }}>
          {SLIDES.map((_, i) => (
            <div key={i} onClick={() => setStep(i)} style={{
              width: i === step ? 28 : 8,
              height: 8, borderRadius: 4,
              background: i === step ? 'var(--primary)' : 'var(--text-hint)',
              transition: 'all 0.3s ease',
              cursor: 'pointer',
            }} />
          ))}
        </div>

        {/* CTA */}
        <button onClick={goNext} className="btn btn-primary" style={{ width: '100%', gap: 8 }}>
          {slide.cta}
          <ArrowRight size={18} />
        </button>

        {/* Skip */}
        <button onClick={skip} style={{
          background: 'none', border: 'none', cursor: 'pointer',
          fontSize: 14, color: 'var(--text-muted)', marginTop: 14,
          padding: '4px 0',
        }}>
          跳过
        </button>
      </div>
    </div>
  )
}
