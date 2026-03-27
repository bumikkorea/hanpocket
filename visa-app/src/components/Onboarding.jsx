/**
 * Onboarding — Step -1: 언어 선택 → Steps 0-2: 앱 소개 → Step 3: 여행 목적
 * localStorage 'near_onboarding_done' 로 완료 여부 관리
 */
import { useState } from 'react'
import { Search, Calendar, MapPin, ArrowRight, Check,
  Camera, UtensilsCrossed, Music, ShoppingBag, Heart, Briefcase } from 'lucide-react'
import { useLanguage } from '../i18n/index.jsx'

const LANG_OPTIONS = [
  { code: 'zh', label: '中文（简体）', native: '中文' },
  { code: 'ko', label: '한국어',       native: '한국어' },
  { code: 'en', label: 'English',      native: 'English' },
]

const SLIDE_ICONS = [Search, Calendar, MapPin]
const SLIDE_BG = [
  'linear-gradient(160deg, #FDF8F6, #F5E6DE, #EDCFBF)',
  'linear-gradient(160deg, #F0F7FF, #D6EAFF, #B8DAFF)',
  'linear-gradient(160deg, #F0FFF4, #C6F6D5, #9AE6B4)',
]
const SLIDE_ICON_COLOR = ['#3182F6', '#007AFF', '#34C759']
const SLIDE_ICON_BG    = ['#FDF3F1', '#EBF3FF', '#ECFDF5']
const SLIDE_DECOR1     = ['rgba(49,130,246,0.12)', 'rgba(0,122,255,0.10)', 'rgba(52,199,89,0.10)']
const SLIDE_DECOR2     = ['rgba(49,130,246,0.08)', 'rgba(0,122,255,0.06)', 'rgba(52,199,89,0.06)']
const TITLE_KEYS = ['onboarding.title1', 'onboarding.title2', 'onboarding.title3']
const DESC_KEYS  = ['onboarding.desc1',  'onboarding.desc2',  'onboarding.desc3']

const PURPOSE_OPTIONS = [
  { id: 'sightseeing', Icon: Camera,          zh: '观光',     ko: '관광',     en: 'Sightseeing' },
  { id: 'food',        Icon: UtensilsCrossed, zh: '美食',     ko: '미식',     en: 'Food'        },
  { id: 'kpop',        Icon: Music,           zh: 'K-POP',    ko: 'K-POP',    en: 'K-POP'       },
  { id: 'shopping',    Icon: ShoppingBag,     zh: '购物',     ko: '쇼핑',     en: 'Shopping'    },
  { id: 'medical',     Icon: Heart,           zh: '医疗美容', ko: '의료뷰티', en: 'Medical'     },
  { id: 'business',    Icon: Briefcase,       zh: '出差',     ko: '비즈니스', en: 'Business'    },
]

function L(lang, d) { return d?.[lang] || d?.zh || d?.ko || d?.en || '' }

export default function Onboarding({ onComplete }) {
  const { lang, setLanguage, t } = useLanguage()
  const [step, setStep] = useState(-1) // -1 = 언어 선택, 0-2 = 슬라이드, 3 = 목적
  const [selectedPurposes, setSelectedPurposes] = useState([])

  const togglePurpose = (id) => {
    setSelectedPurposes(prev =>
      prev.includes(id) ? prev.filter(x => x !== id)
        : prev.length < 3 ? [...prev, id] : prev
    )
  }

  const goNext = () => {
    if (step < 2) { setStep(s => s + 1); return }
    if (step === 2) { setStep(3); return }
    // step 3: 목적 저장 후 완료
    if (selectedPurposes.length > 0) {
      localStorage.setItem('near_travel_purpose', JSON.stringify(selectedPurposes))
    }
    onComplete()
  }

  // ─── Step -1: 언어 선택 화면 ───
  if (step === -1) {
    return (
      <div style={{
        position: 'fixed', inset: 0, zIndex: 9000,
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        background: 'white', height: '100dvh',
        fontFamily: '"Noto Sans SC", Pretendard, Inter, sans-serif',
        padding: '0 40px',
      }}>
        <div style={{ marginBottom: 48, textAlign: 'center' }}>
          <div style={{ fontSize: 40, fontWeight: 900, letterSpacing: '-2px', color: 'var(--text-primary)', lineHeight: 1 }}>
            NEAR
          </div>
          <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 6, letterSpacing: '0.5px' }}>
            Seoul for Everyone
          </div>
        </div>

        <p style={{ fontSize: 15, color: 'var(--text-secondary)', marginBottom: 24, textAlign: 'center' }}>
          选择语言 · 언어 선택 · Select Language
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, width: '100%' }}>
          {LANG_OPTIONS.map((opt, i) => (
            <button
              key={opt.code}
              onClick={() => { setLanguage(opt.code); setStep(0) }}
              className={i === 0 ? 'btn btn-primary' : 'btn btn-outline'}
              style={{ width: '100%', height: 50, fontSize: 16, fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 20px', whiteSpace: 'nowrap', overflow: 'hidden' }}
            >
              <span style={{ whiteSpace: 'nowrap' }}>{opt.native}</span>
              {lang === opt.code && <Check size={18} style={{ flexShrink: 0 }} />}
            </button>
          ))}
        </div>
      </div>
    )
  }

  // ─── Step 3: 여행 목적 선택 ───
  if (step === 3) {
    return (
      <div style={{
        position: 'fixed', inset: 0, zIndex: 9000,
        display: 'flex', flexDirection: 'column',
        height: '100dvh', background: 'white',
        fontFamily: '"Noto Sans SC", Pretendard, Inter, sans-serif',
        padding: '0 28px 40px',
        alignItems: 'center', justifyContent: 'center',
      }}>
        <div style={{ width: '100%', maxWidth: 360 }}>
          <div style={{ textAlign: 'center', marginBottom: 32 }}>
            <div style={{ fontSize: 28, fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.3 }}>
              {L(lang, { ko: '이번 여행 목적은?', zh: '这次旅行的目的？', en: 'Purpose of this trip?' })}
            </div>
            <div style={{ fontSize: 14, color: 'var(--text-muted)', marginTop: 8 }}>
              {L(lang, { ko: '최대 3개 선택', zh: '最多选择3个', en: 'Choose up to 3' })}
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 32 }}>
            {PURPOSE_OPTIONS.map(({ id, Icon, zh, ko, en }) => {
              const selected = selectedPurposes.includes(id)
              return (
                <button
                  key={id}
                  onClick={() => togglePurpose(id)}
                  style={{
                    display: 'flex', flexDirection: 'column', alignItems: 'center',
                    gap: 8, padding: '16px 8px', borderRadius: 18, border: 'none',
                    cursor: 'pointer', transition: 'all 0.2s ease',
                    background: selected ? 'var(--primary)' : '#F7F7F7',
                    boxShadow: selected
                      ? 'none'
                      : '4px 4px 10px rgba(200,200,200,0.5), -4px -4px 10px #FFFFFF',
                  }}
                >
                  <Icon size={24} color={selected ? 'white' : 'var(--text-secondary)'} />
                  <span style={{ fontSize: 12, fontWeight: 600, color: selected ? 'white' : 'var(--text-primary)', textAlign: 'center', lineHeight: 1.3 }}>
                    {L(lang, { zh, ko, en })}
                  </span>
                </button>
              )
            })}
          </div>

          <button
            onClick={goNext}
            className="btn btn-primary"
            style={{ width: '100%', gap: 8 }}
          >
            {L(lang, { ko: '시작하기', zh: '开始', en: 'Get Started' })}
            <ArrowRight size={18} />
          </button>
          <button
            onClick={onComplete}
            style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 14, color: 'var(--text-muted)', marginTop: 14, padding: '4px 0', width: '100%', textAlign: 'center' }}
          >
            {t('onboarding.skip')}
          </button>
        </div>
      </div>
    )
  }

  // ─── Steps 0-2: 앱 소개 슬라이드 ───
  const Icon = SLIDE_ICONS[step]

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9000,
      display: 'flex', flexDirection: 'column',
      height: '100dvh',
      fontFamily: '"Noto Sans SC", Pretendard, Inter, sans-serif',
    }}>
      <div style={{
        flex: '0 0 60%',
        background: SLIDE_BG[step],
        position: 'relative', overflow: 'hidden',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        transition: 'background 0.4s ease',
      }}>
        <div style={{ position: 'absolute', top: 32, right: 28, width: 60, height: 60, borderRadius: 16, background: SLIDE_DECOR1[step], transform: 'rotate(15deg)' }} />
        <div style={{ position: 'absolute', bottom: 40, left: 24, width: 40, height: 40, borderRadius: '50%', background: SLIDE_DECOR2[step] }} />
        <div style={{ width: 180, height: 180, borderRadius: '50%', background: 'rgba(255,255,255,0.6)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', boxShadow: '0 8px 32px rgba(0,0,0,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ width: 100, height: 100, borderRadius: 28, background: SLIDE_ICON_BG[step], display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Icon size={56} color={SLIDE_ICON_COLOR[step]} strokeWidth={1.5} />
          </div>
        </div>
      </div>

      <div style={{ flex: '0 0 40%', background: 'white', borderRadius: '28px 28px 0 0', padding: '32px 32px 40px', display: 'flex', flexDirection: 'column', marginTop: -28 }}>
        <div style={{ fontSize: 24, fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.3 }}>
          {t(TITLE_KEYS[step])}
        </div>
        <div style={{ fontSize: 15, color: 'var(--text-secondary)', lineHeight: 1.6, marginTop: 10, whiteSpace: 'pre-line', flex: 1 }}>
          {t(DESC_KEYS[step])}
        </div>

        <div style={{ display: 'flex', gap: 8, alignItems: 'center', margin: '28px 0 24px' }}>
          {[0, 1, 2, 3].map(i => (
            <div key={i} onClick={() => i <= step && setStep(i)} style={{ width: i === step ? 28 : 8, height: 8, borderRadius: 4, background: i === step ? 'var(--primary)' : i < step ? 'var(--primary)' : 'var(--text-hint)', opacity: i < step ? 0.4 : 1, transition: 'all 0.3s ease', cursor: i <= step ? 'pointer' : 'default' }} />
          ))}
        </div>

        <button onClick={goNext} className="btn btn-primary" style={{ width: '100%', gap: 8 }}>
          {t('onboarding.next')}
          <ArrowRight size={18} />
        </button>
        <button onClick={onComplete} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 14, color: 'var(--text-muted)', marginTop: 14, padding: '4px 0' }}>
          {t('onboarding.skip')}
        </button>
      </div>
    </div>
  )
}
