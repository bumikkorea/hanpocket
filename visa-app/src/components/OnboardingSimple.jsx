import { useState, useEffect } from 'react'

function L(lang, d) { if (typeof d === 'string') return d; return d?.[lang] || d?.en || d?.zh || d?.ko || '' }

const NATIONALITIES = [
  { id: 'china_mainland', label: { ko: '중국(본토)', zh: '中国大陆', en: 'Mainland China' } },
  { id: 'china_hk', label: { ko: '홍콩', zh: '香港', en: 'Hong Kong' } },
  { id: 'china_macau', label: { ko: '마카오', zh: '澳门', en: 'Macau' } },
  { id: 'china_taiwan', label: { ko: '대만', zh: '台湾', en: 'Taiwan' } },
  { id: 'other', label: { ko: '기타', zh: '其他', en: 'Other' } },
]

const VISA_TYPES = [
  { id: 'tourist', label: { ko: '관광', zh: '旅游', en: 'Tourism' } },
  { id: 'student', label: { ko: '유학', zh: '留学', en: 'Study' } },
  { id: 'work', label: { ko: '취업', zh: '就业', en: 'Work' } },
  { id: 'resident', label: { ko: '거주', zh: '居住', en: 'Resident' } },
  { id: 'other', label: { ko: '기타', zh: '其他', en: 'Other' } },
]

const LANGS = [
  { id: 'ko', label: '한국어' },
  { id: 'zh', label: '中文' },
  { id: 'en', label: 'EN' },
]

export default function OnboardingSimple({ onComplete, lang, setLang }) {
  const [step, setStep] = useState('splash')
  const [nationality, setNationality] = useState('china_mainland')
  const [visaType, setVisaType] = useState('tourist')
  const [selectedLang, setSelectedLang] = useState(lang || 'zh')
  const [openSheet, setOpenSheet] = useState(null) // 'nationality' | 'visa' | null

  // 스플래시 1.5초 후 자동 전환
  useEffect(() => {
    if (step === 'splash') {
      const timer = setTimeout(() => setStep('setup'), 1500)
      return () => clearTimeout(timer)
    }
  }, [step])

  const handleStart = () => {
    setLang(selectedLang)
    onComplete({
      nationality,
      visaType,
      lang: selectedLang,
      nickname: selectedLang === 'ko' ? '사용자' : selectedLang === 'zh' ? '用户' : 'User',
    })
  }

  const handleSkip = () => {
    setLang('zh')
    onComplete({
      nationality: 'china_mainland',
      visaType: 'tourist',
      lang: 'zh',
      nickname: '用户',
    })
  }

  return (
    <div className="min-h-screen flex flex-col bg-white font-['Inter']">
      {/* Splash */}
      {step === 'splash' && (
        <div
          onClick={() => setStep('setup')}
          className="flex-1 flex flex-col items-center justify-center cursor-pointer"
          style={{ animation: 'fadeIn 0.8s ease forwards' }}
        >
          <p className="text-6xl mb-6">🧧</p>
          <h1 className="text-3xl font-black text-[#111827] tracking-tight mb-3">HANPOCKET</h1>
          <p className="text-sm text-[#6B7280]">
            {L(lang, { ko: '한국 여행의 모든 것', zh: '韩国旅行的一切', en: 'Everything for Korea Travel' })}
          </p>
        </div>
      )}

      {/* Setup */}
      {step === 'setup' && (
        <div className="flex-1 flex flex-col px-6 pt-16 pb-10" style={{ animation: 'fadeSlideUp 0.5s ease forwards' }}>
          <h2 className="text-2xl font-black text-[#111827] mb-2">
            {L(selectedLang, { ko: '시작하기', zh: '开始使用', en: 'Get Started' })}
          </h2>
          <p className="text-sm text-[#6B7280] mb-8">
            {L(selectedLang, { ko: '간단한 설정으로 맞춤 서비스를 받으세요', zh: '简单设置，获取个性化服务', en: 'Quick setup for personalized service' })}
          </p>

          <div className="space-y-4 flex-1">
            {/* 국적 선택 */}
            <div>
              <label className="text-xs font-semibold text-[#6B7280] uppercase tracking-wider mb-2 block">
                {L(selectedLang, { ko: '국적', zh: '国籍', en: 'Nationality' })}
              </label>
              <button
                onClick={() => setOpenSheet('nationality')}
                className="w-full bg-[#F3F4F6] rounded-2xl px-5 py-4 text-left text-[15px] font-medium text-[#111827] flex items-center justify-between active:scale-[0.98] transition-all"
              >
                <span>{L(selectedLang, NATIONALITIES.find(n => n.id === nationality)?.label)}</span>
                <span className="text-[#9CA3AF]">▾</span>
              </button>
            </div>

            {/* 비자 선택 */}
            <div>
              <label className="text-xs font-semibold text-[#6B7280] uppercase tracking-wider mb-2 block">
                {L(selectedLang, { ko: '비자 유형', zh: '签证类型', en: 'Visa Type' })}
              </label>
              <button
                onClick={() => setOpenSheet('visa')}
                className="w-full bg-[#F3F4F6] rounded-2xl px-5 py-4 text-left text-[15px] font-medium text-[#111827] flex items-center justify-between active:scale-[0.98] transition-all"
              >
                <span>{L(selectedLang, VISA_TYPES.find(v => v.id === visaType)?.label)}</span>
                <span className="text-[#9CA3AF]">▾</span>
              </button>
            </div>

            {/* 언어 선택 */}
            <div>
              <label className="text-xs font-semibold text-[#6B7280] uppercase tracking-wider mb-2 block">
                {L(selectedLang, { ko: '언어', zh: '语言', en: 'Language' })}
              </label>
              <div className="flex gap-2">
                {LANGS.map(l => (
                  <button
                    key={l.id}
                    onClick={() => setSelectedLang(l.id)}
                    className={`flex-1 py-3 rounded-2xl text-sm font-semibold transition-all active:scale-[0.98] ${
                      selectedLang === l.id
                        ? 'bg-[#111827] text-white'
                        : 'bg-[#F3F4F6] text-[#6B7280]'
                    }`}
                  >
                    {l.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* 하단 버튼 */}
          <div className="mt-8 space-y-3">
            <button
              onClick={handleStart}
              className="w-full bg-[#111827] text-white text-base font-bold py-4 rounded-2xl active:scale-[0.98] transition-all"
            >
              {L(selectedLang, { ko: '시작', zh: '开始', en: 'Start' })}
            </button>
            <button
              onClick={handleSkip}
              className="w-full text-[#9CA3AF] text-sm py-2 transition-colors hover:text-[#6B7280]"
            >
              {L(selectedLang, { ko: '건너뛰기', zh: '跳过', en: 'Skip' })}
            </button>
          </div>
        </div>
      )}

      {/* Bottom Sheet — 국적/비자 선택 */}
      {openSheet && (
        <div className="fixed inset-0 z-[999]">
          <div className="absolute inset-0 bg-black/30" onClick={() => setOpenSheet(null)} />
          <div
            className="absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl px-6 pt-6 pb-10 safe-bottom"
            style={{ animation: 'slideUp 0.3s ease forwards' }}
          >
            <div className="w-10 h-1 bg-[#D1D5DB] rounded-full mx-auto mb-6" />
            <h3 className="text-lg font-bold text-[#111827] mb-4">
              {openSheet === 'nationality'
                ? L(selectedLang, { ko: '국적 선택', zh: '选择国籍', en: 'Select Nationality' })
                : L(selectedLang, { ko: '비자 유형 선택', zh: '选择签证类型', en: 'Select Visa Type' })}
            </h3>
            <div className="space-y-1">
              {(openSheet === 'nationality' ? NATIONALITIES : VISA_TYPES).map(item => {
                const isSelected = openSheet === 'nationality' ? nationality === item.id : visaType === item.id
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      if (openSheet === 'nationality') setNationality(item.id)
                      else setVisaType(item.id)
                      setOpenSheet(null)
                    }}
                    className={`w-full text-left px-5 py-4 rounded-2xl transition-all active:scale-[0.98] ${
                      isSelected ? 'bg-[#111827] text-white' : 'bg-[#F9FAFB] text-[#111827] hover:bg-[#F3F4F6]'
                    }`}
                  >
                    <span className="text-[15px] font-medium">{L(selectedLang, item.label)}</span>
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes fadeIn { from { opacity: 0 } to { opacity: 1 } }
        @keyframes fadeSlideUp { from { opacity: 0; transform: translateY(20px) } to { opacity: 1; transform: translateY(0) } }
        @keyframes slideUp { from { transform: translateY(100%) } to { transform: translateY(0) } }
      `}</style>
    </div>
  )
}
