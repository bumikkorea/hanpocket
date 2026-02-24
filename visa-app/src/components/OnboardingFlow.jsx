import { useState, useEffect } from 'react'
import { t } from '../data/i18n'
import { updateLog, dataSources } from '../data/updateLog'
import { initKakao, loginWithKakao } from '../utils/kakaoAuth'
import { loginWithNaver } from '../utils/naverAuth'
import { loginWithWeChat } from '../utils/wechatAuth'
import { loginWithAlipay } from '../utils/alipayAuth'
import { trackLogin } from '../utils/analytics'

const LANGS = ['ko','zh','en']
function nextLang(c) { return LANGS[(LANGS.indexOf(c)+1)%3] }
function langLabel(c) { return {ko:'한국어',zh:'中文',en:'EN'}[nextLang(c)] }

function L(lang, data) {
  if (typeof data === 'string') return data
  return data?.[lang] || data?.en || data?.zh || data?.ko || ''
}

function Logo({ size = 'md' }) {
  const scales = { sm: 0.7, md: 0.9, lg: 1.15 }
  const sc = scales[size] || scales.md
  return (
    <svg width={186 * sc} height={28 * sc} viewBox="0 0 186 28" fill="none" style={{ overflow: 'visible' }}>
      {/* HANPOCKET 텍스트 */}
      <text x="82" y="19" textAnchor="middle" fontFamily="'Inter', sans-serif" fontWeight="300" fontSize="18" letterSpacing="0.25em" fill="#111827">
        HANPOCKET
      </text>

      {/* 복주머니 — 마침표 위치 (T 오른쪽 바로 뒤) */}
      <g transform="translate(162, 8) scale(0.5)">
        <path d="M6,7 Q10,2 14,7" fill="none" stroke="#111827" strokeWidth="1.4" strokeLinecap="round"/>
        <circle cx="10" cy="7.5" r="1.3" fill="#111827"/>
        <line x1="8.5" y1="8.5" x2="7" y2="12" stroke="#111827" strokeWidth="0.8" strokeLinecap="round"/>
        <line x1="11.5" y1="8.5" x2="13" y2="12" stroke="#111827" strokeWidth="0.8" strokeLinecap="round"/>
        <path d="M3,9 Q1,14 3,19 Q5,23 10,24 Q15,23 17,19 Q19,14 17,9 Z" fill="#D42B40"/>
        <path d="M4,9 Q6,10.5 10,10.5 Q14,10.5 16,9" fill="none" stroke="#B02535" strokeWidth="0.5"/>
        <rect x="8" y="14" width="4" height="4" rx="0.5" fill="none" stroke="#111827" strokeWidth="0.6"/>
        <line x1="10" y1="14" x2="10" y2="18" stroke="#111827" strokeWidth="0.4"/>
        <line x1="8" y1="16" x2="12" y2="16" stroke="#111827" strokeWidth="0.4"/>
      </g>
    </svg>
  )
}

function NoticePopup({ lang, onClose }) {
  const s = t[lang]
  const handleDismiss = (type) => {
    if (type === 'forever') {
      localStorage.setItem('hp_notice_dismiss', 'forever')
    } else if (type === 'today') {
      localStorage.setItem('hp_notice_dismiss', new Date().toDateString())
    }
    onClose()
  }
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-lg w-full max-w-md max-h-[80vh] overflow-hidden shadow-2xl animate-fade-up">
        <div className="bg-white border-b border-[#E5E7EB] p-6">
          <h2 className="text-lg font-bold text-[#111827]">{lang === 'ko' ? '공지사항' : lang === 'zh' ? '公告' : 'Notice'}</h2>
          <p className="text-[#6B7280] text-xs mt-1">{lang === 'ko' ? '출입국관리법 기반 · 법무부 공개데이터' : lang === 'zh' ? '基于出入境管理法 · 法务部公开数据' : 'Based on Immigration Act · MOJ Open Data'}</p>
        </div>
        <div className="p-5 overflow-y-auto max-h-[50vh] space-y-5">
          {updateLog.map((entry, idx) => (
            <div key={idx}>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs font-bold bg-[#F3F4F6] text-[#111827] px-2 py-0.5 rounded-full">v{entry.version}</span>
                <span className="text-xs text-[#6B7280]">{entry.date}</span>
                {idx === 0 && <span className="text-xs bg-[#111827]/10 text-[#111827] px-2 py-0.5 rounded-full">NEW</span>}
              </div>
              <ul className="space-y-1">
                {entry.items[lang]?.map((item, i) => <li key={i} className="text-sm text-[#6B7280]">{item}</li>)}
              </ul>
            </div>
          ))}
          <div className="border-t border-[#E5E7EB] pt-3">
            <p className="text-xs text-[#9CA3AF] font-semibold mb-1">{lang === 'ko' ? '데이터 출처' : lang === 'zh' ? '数据来源' : 'Data Sources'}</p>
            {dataSources[lang]?.map((src, i) => <p key={i} className="text-xs text-[#9CA3AF]">{src}</p>)}
          </div>
        </div>
        <div className="p-4 border-t border-[#E5E7EB] space-y-2">
          <button onClick={() => handleDismiss('close')} className="w-full bg-[#111827] text-white font-semibold py-3 rounded-xl hover:bg-[#1F2937] transition-all btn-press">
            {s.noticeClose}
          </button>
          <div className="flex justify-center gap-4">
            <button onClick={() => handleDismiss('today')} className="text-xs text-[#6B7280] hover:text-[#111827]">
              {s.noticeTomorrow}
            </button>
            <button onClick={() => handleDismiss('forever')} className="text-xs text-[#6B7280] hover:text-[#111827]">
              {s.noticeForever}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function OnboardingFlow({ onComplete, lang, setLang }) {
  const [step, setStep] = useState('splash')
  const [nationality, setNationality] = useState(null)
  const [currentVisa, setCurrentVisa] = useState(null)
  const [exchangeRates, setExchangeRates] = useState(null)
  const s = t[lang]

  // 환율 로드 (CNY, HKD, TWD, MOP)
  useEffect(() => {
    Promise.all([
      fetch('https://api.exchangerate-api.com/v4/latest/CNY').then(r => r.json()),
      fetch('https://api.exchangerate-api.com/v4/latest/HKD').then(r => r.json()),
      fetch('https://api.exchangerate-api.com/v4/latest/TWD').then(r => r.json()),
      fetch('https://api.exchangerate-api.com/v4/latest/MOP').then(r => r.json()),
    ]).then(([cny, hkd, twd, mop]) => {
      setExchangeRates({
        CNY: cny.rates?.KRW ? Math.round(cny.rates.KRW * 100) / 100 : null,
        HKD: hkd.rates?.KRW ? Math.round(hkd.rates.KRW * 100) / 100 : null,
        TWD: twd.rates?.KRW ? Math.round(twd.rates.KRW * 100) / 100 : null,
        MOP: mop.rates?.KRW ? Math.round(mop.rates.KRW * 100) / 100 : null,
        _date: cny.date || null,
      })
    }).catch(() => {})
  }, [])

  // 스플래시 → 로그인 화면으로 전환
  useEffect(() => {
    if (step === 'splash') {
      const timer = setTimeout(() => setStep('login'), 1800)
      return () => clearTimeout(timer)
    }
  }, [step])

  return (
    <div className="min-h-screen bg-[#FCFCFA] flex flex-col">
      <div className="flex-1 flex flex-col items-center justify-center p-6 relative">
        {/* 언어 토글 */}
        <button onClick={() => setLang(nextLang(lang))}
          className="absolute top-6 right-6 text-[#6B7280] text-sm px-3 py-1.5 rounded-full border border-[#E5E7EB] hover:border-[#111827] transition-all z-10">
          {langLabel(lang)}
        </button>

        {/*  스플래시 (첫 화면) — iPhone Hello 스타일  */}
        {step === 'splash' && (
          <div className="flex flex-col items-center justify-center" style={{ minHeight: '60vh' }}>
            <span style={{
              fontFamily: 'Inter, sans-serif',
              fontSize: '72px',
              fontWeight: 200,
              color: '#111827',
              letterSpacing: '0.02em',
              opacity: 0,
              animation: 'fadeIn 1s ease forwards',
            }}>
              你好!
            </span>
          </div>
        )}

        {/*  통합 로그인 화면 — 5개 로그인 + 둘러보기  */}
        {step === 'login' && (
          <div className="w-full max-w-sm animate-fade-up">
            <div className="text-center mb-8">
              <Logo />
            </div>
            <p className="text-[#6B7280] text-sm mb-6 text-center">
              {L(lang, { ko: '간편 로그인으로 시작하세요', zh: '快速登录开始使用', en: 'Get started with quick login' })}
            </p>
            <div className="space-y-3">
              <button
                onClick={() => { initKakao(); loginWithKakao(); }}
                className="w-full flex items-center justify-center gap-3 bg-[#FEE500] text-[#3C1E1E] rounded-xl p-4 font-medium hover:bg-[#FDD835] transition-all btn-press shadow-sm">
                <svg width="20" height="20" viewBox="0 0 24 24"><path fill="#3C1E1E" d="M12 3C6.48 3 2 6.36 2 10.44c0 2.62 1.75 4.93 4.38 6.24l-1.12 4.16c-.1.36.32.64.62.42l4.97-3.26c.37.04.75.06 1.15.06 5.52 0 10-3.36 10-7.62S17.52 3 12 3z"/></svg>
                {L(lang, { ko: '카카오로 로그인', zh: 'Kakao登录', en: 'Login with Kakao' })}
              </button>

              <button
                onClick={async () => { 
                  try {
                    const userInfo = await loginWithNaver()
                    if (userInfo) {
                      trackLogin('naver', 'visitor')
                      onComplete({ lang, socialLogin: { provider: 'naver', user: userInfo } })
                    }
                  } catch (error) {
                    console.error('네이버 로그인 실패:', error)
                    alert(lang === 'ko' ? '네이버 로그인에 실패했습니다. 나중에 다시 시도해주세요.' : 
                          lang === 'zh' ? 'Naver登录失败，请稍后重试' : 'Naver login failed. Please try again later.')
                    onComplete({ lang })
                  }
                }}
                className="w-full flex items-center justify-center gap-3 bg-[#03C75A] text-white rounded-xl p-4 font-medium hover:opacity-90 transition-all btn-press shadow-sm">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
                  <path d="M13.6 11.4L9.5 5.5h-3v13h4.3v-6.6l4.1 6.6H18v-13h-4.4v5.9z"/>
                </svg>
                {L(lang, { ko: '네이버로 로그인', zh: 'Naver登录', en: 'Login with Naver' })}
              </button>

              <button
                onClick={async () => { 
                  try {
                    const userInfo = await loginWithWeChat()
                    if (userInfo) {
                      trackLogin('wechat', 'visitor')
                      onComplete({ lang, socialLogin: { provider: 'wechat', user: userInfo } })
                    }
                  } catch (error) {
                    console.error('WeChat 로그인 실패:', error)
                    alert(lang === 'ko' ? 'WeChat 로그인에 실패했습니다. 나중에 다시 시도해주세요.' : 
                          lang === 'zh' ? '微信登录失败，请稍后重试' : 'WeChat login failed. Please try again later.')
                    onComplete({ lang })
                  }
                }}
                className="w-full flex items-center justify-center gap-3 bg-[#07C160] text-white rounded-xl p-4 font-medium hover:opacity-90 transition-all btn-press shadow-sm">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="white"><path d="M8.691 2.188C3.891 2.188 0 5.476 0 9.534c0 2.22 1.174 4.142 3.016 5.49a.75.75 0 01.27.87l-.458 1.597a.375.375 0 00.506.44l1.932-.901a.75.75 0 01.572-.036c1.014.305 2.1.472 3.228.472.169 0 .336-.005.502-.014a5.868 5.868 0 01-.254-1.718c0-3.56 3.262-6.45 7.282-6.45.215 0 .428.01.638.028C16.283 5.114 12.85 2.188 8.691 2.188zM5.785 7.095a1.125 1.125 0 110-2.25 1.125 1.125 0 010 2.25zm5.813 0a1.125 1.125 0 110-2.25 1.125 1.125 0 010 2.25z"/><path d="M23.997 15.268c0-3.29-3.262-5.96-7.285-5.96-4.023 0-7.285 2.67-7.285 5.96 0 3.292 3.262 5.96 7.285 5.96.89 0 1.746-.132 2.534-.375a.75.75 0 01.573.036l1.478.689a.375.375 0 00.506-.44l-.35-1.22a.75.75 0 01.27-.87c1.49-1.09 2.274-2.644 2.274-4.38zm-9.792-.75a.938.938 0 110-1.875.938.938 0 010 1.875zm5.015 0a.938.938 0 110-1.875.938.938 0 010 1.875z"/></svg>
                {L(lang, { ko: 'WeChat으로 로그인', zh: '微信登录', en: 'Login with WeChat' })}
              </button>

              <button
                onClick={async () => { 
                  try {
                    const userInfo = await loginWithAlipay()
                    if (userInfo) {
                      trackLogin('alipay', 'visitor')
                      onComplete({ lang, socialLogin: { provider: 'alipay', user: userInfo } })
                    }
                  } catch (error) {
                    console.error('Alipay 로그인 실패:', error)
                    alert(lang === 'ko' ? 'Alipay 로그인에 실패했습니다. 나중에 다시 시도해주세요.' : 
                          lang === 'zh' ? '支付宝登录失败，请稍后重试' : 'Alipay login failed. Please try again later.')
                    onComplete({ lang })
                  }
                }}
                className="w-full flex items-center justify-center gap-3 bg-[#1677FF] text-white rounded-xl p-4 font-medium hover:opacity-90 transition-all btn-press shadow-sm">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="white"><path d="M21.422 13.482C19.558 12.614 17.46 11.6 15.998 10.952c.72-1.748 1.164-3.678 1.164-5.202 0-1.554-.87-3.75-3.828-3.75-2.478 0-4.038 1.86-4.038 4.11 0 2.598 1.806 4.764 4.362 5.424-.498.804-1.104 1.518-1.788 2.118-1.62 1.416-3.456 2.13-5.454 2.13C4.146 15.782 2 14.258 2 11.988 2 6.468 7.098 2 13.332 2 19.566 2 22 6.468 22 11.988c0 .516-.03 1.02-.084 1.494h-.494z"/></svg>
                {L(lang, { ko: 'Alipay로 로그인', zh: '支付宝登录', en: 'Login with Alipay' })}
              </button>

              <div className="relative my-3">
                <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-200"></div></div>
                <div className="relative flex justify-center"><span className="bg-white px-3 text-xs text-gray-400">or</span></div>
              </div>

              <button
                onClick={() => {
                  onComplete({ lang, socialLogin: { provider: 'guest', user: { nickname: lang === 'ko' ? '게스트' : lang === 'zh' ? '访客' : 'Guest' } } })
                }}
                className="w-full text-center text-[#6B7280] text-sm py-3 rounded-xl border border-gray-200 hover:bg-gray-50 transition-all font-medium">
                {L(lang, { ko: '게스트로 둘러보기', zh: '以访客身份浏览', en: 'Continue as Guest' })}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}