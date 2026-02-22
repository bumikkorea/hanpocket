import { useState, useEffect, useCallback } from 'react'

// ─── Multi-Currency Exchange Rate Card ───

const CURRENCIES = [
  { code: 'CNY', flag: 'CN', name: '人民币', rate: 191.52 },
  { code: 'HKD', flag: 'HK', name: '港币', rate: 177.80 },
  { code: 'TWD', flag: 'TW', name: '新台币', rate: 42.50 },
  { code: 'MOP', flag: 'MO', name: '澳门元', rate: 171.20 },
  { code: 'USD', flag: 'US', name: '美元', rate: 1384.50 },
  { code: 'JPY', flag: 'JP', name: '日元', rate: 9.21 },
  { code: 'VND', flag: 'VN', name: '越남盾', rate: 0.055 },
  { code: 'PHP', flag: 'PH', name: '比索', rate: 24.10 },
  { code: 'THB', flag: 'TH', name: '泰铢', rate: 39.80 },
]

const CACHE_KEY = 'hanpocket_exchange_rates'
const CACHE_DURATION = 60 * 1000 // 1분 (60초)

// 캐시 데이터 로드
function loadCachedRates() {
  try {
    const cached = localStorage.getItem(CACHE_KEY)
    if (!cached) return null
    
    const { data, timestamp } = JSON.parse(cached)
    const now = Date.now()
    
    // 캐시가 유효한지 확인 (1분 이내)
    if (now - timestamp < CACHE_DURATION) {
      return data
    }
    
    // 만료된 캐시 삭제
    localStorage.removeItem(CACHE_KEY)
    return null
  } catch (error) {
    console.warn('캐시 로드 실패:', error)
    localStorage.removeItem(CACHE_KEY)
    return null
  }
}

// 캐시에 데이터 저장
function saveCachedRates(data) {
  try {
    const cacheData = {
      data,
      timestamp: Date.now()
    }
    localStorage.setItem(CACHE_KEY, JSON.stringify(cacheData))
  } catch (error) {
    console.warn('캐시 저장 실패:', error)
  }
}

// 환율 API 호출 (최적화된 버전)
async function fetchExchangeRates() {
  // 캐시된 데이터가 있는지 확인
  const cached = loadCachedRates()
  if (cached) {
    return cached
  }

  try {
    // 주요 통화만 병렬로 호출 (최적화: USD, CNY, JPY만 실제 API 사용)
    const responses = await Promise.allSettled([
      fetch('https://api.exchangerate-api.com/v4/latest/CNY', { 
        timeout: 5000,
        headers: { 'Accept': 'application/json' }
      }).then(r => r.ok ? r.json() : Promise.reject(`HTTP ${r.status}`)),
      fetch('https://api.exchangerate-api.com/v4/latest/USD', { 
        timeout: 5000,
        headers: { 'Accept': 'application/json' }
      }).then(r => r.ok ? r.json() : Promise.reject(`HTTP ${r.status}`)),
      fetch('https://api.exchangerate-api.com/v4/latest/JPY', { 
        timeout: 5000,
        headers: { 'Accept': 'application/json' }
      }).then(r => r.ok ? r.json() : Promise.reject(`HTTP ${r.status}`))
    ])

    const rates = {}
    let hasValidData = false
    let lastUpdated = null

    // CNY 처리
    if (responses[0].status === 'fulfilled' && responses[0].value?.rates?.KRW) {
      rates.CNY = Math.round(responses[0].value.rates.KRW * 100) / 100
      lastUpdated = responses[0].value.date || new Date().toISOString().split('T')[0]
      hasValidData = true
    }

    // USD 처리
    if (responses[1].status === 'fulfilled' && responses[1].value?.rates?.KRW) {
      rates.USD = Math.round(responses[1].value.rates.KRW * 100) / 100
      if (!lastUpdated) lastUpdated = responses[1].value.date || new Date().toISOString().split('T')[0]
      hasValidData = true
    }

    // JPY 처리
    if (responses[2].status === 'fulfilled' && responses[2].value?.rates?.KRW) {
      rates.JPY = Math.round(responses[2].value.rates.KRW * 100) / 100
      if (!lastUpdated) lastUpdated = responses[2].value.date || new Date().toISOString().split('T')[0]
      hasValidData = true
    }

    // 기타 통화는 USD 기반으로 계산 (fallback)
    if (rates.USD) {
      if (!rates.CNY) rates.CNY = Math.round(rates.USD / 7.2 * 100) / 100 // 대략적인 환율
      rates.HKD = Math.round(rates.USD / 7.8 * 100) / 100
      rates.TWD = Math.round(rates.USD / 31 * 100) / 100
      rates.MOP = Math.round(rates.USD / 8.1 * 100) / 100
      rates.VND = Math.round(rates.USD / 24000 * 100) / 100
      rates.PHP = Math.round(rates.USD / 56 * 100) / 100
      rates.THB = Math.round(rates.USD / 35 * 100) / 100
    }

    if (!hasValidData) {
      throw new Error('모든 API 호출 실패')
    }

    const result = {
      ...rates,
      _date: lastUpdated,
      _updated: new Date().toISOString()
    }

    // 캐시에 저장
    saveCachedRates(result)
    
    return result
  } catch (error) {
    console.error('환율 API 호출 실패:', error)
    
    // Fallback: 정적 데이터 반환
    const fallbackRates = {}
    CURRENCIES.forEach(curr => {
      fallbackRates[curr.code] = curr.rate
    })
    fallbackRates._date = new Date().toISOString().split('T')[0]
    fallbackRates._error = true
    
    return fallbackRates
  }
}

export default function ExchangeRateWidget({ exchangeRate: propExchangeRate, lang, compact }) {
  const [amount, setAmount] = useState('1000')
  const [selectedCurrency, setSelectedCurrency] = useState('CNY')
  const [exchangeRate, setExchangeRate] = useState(propExchangeRate || null)
  const [isLoading, setIsLoading] = useState(false)
  const [lastUpdated, setLastUpdated] = useState(null)
  const [hasError, setHasError] = useState(false)

  // 환율 데이터 업데이트 함수
  const updateExchangeRates = useCallback(async (force = false) => {
    // 이미 로딩 중이거나, 캐시된 데이터가 있고 강제 업데이트가 아닌 경우 스킵
    if (isLoading || (!force && exchangeRate && !exchangeRate._error)) {
      const cached = loadCachedRates()
      if (cached && !force) return
    }

    setIsLoading(true)
    setHasError(false)

    try {
      const rates = await fetchExchangeRates()
      setExchangeRate(rates)
      setLastUpdated(new Date())
      
      if (rates._error) {
        setHasError(true)
      }
    } catch (error) {
      console.error('환율 업데이트 실패:', error)
      setHasError(true)
      
      // 에러 시 정적 데이터 사용
      if (!exchangeRate) {
        const fallbackRates = {}
        CURRENCIES.forEach(curr => {
          fallbackRates[curr.code] = curr.rate
        })
        fallbackRates._date = new Date().toISOString().split('T')[0]
        fallbackRates._error = true
        setExchangeRate(fallbackRates)
      }
    } finally {
      setIsLoading(false)
    }
  }, [exchangeRate, isLoading])

  // 컴포넌트 마운트 시 환율 데이터 로드
  useEffect(() => {
    if (!propExchangeRate) {
      // prop으로 받은 데이터가 없으면 직접 로드
      updateExchangeRates()
    } else {
      // prop으로 받은 데이터 사용
      setExchangeRate(propExchangeRate)
    }
  }, [propExchangeRate, updateExchangeRates])

  // 현재 환율 계산
  const curr = CURRENCIES.find(c => c.code === selectedCurrency) || CURRENCIES[0]
  const rate = exchangeRate?.[selectedCurrency] || curr.rate
  const converted = (parseFloat(amount) || 0) * rate

  // 새로고침 핸들러
  const handleRefresh = () => {
    updateExchangeRates(true) // 강제 업데이트
  }

  return (
    <div className="glass rounded-lg p-4 relative">
      {/* 로딩 오버레이 */}
      {isLoading && (
        <div className="absolute inset-0 bg-white/80 backdrop-blur-sm rounded-lg flex items-center justify-center z-10">
          <div className="flex flex-col items-center gap-2">
            <div className="w-4 h-4 border-2 border-[#111827] border-t-transparent rounded-full animate-spin"></div>
            <span className="text-xs text-[#6B7280]">
              {lang === 'ko' ? '환율 업데이트 중...' : lang === 'zh' ? '汇率更新中...' : 'Updating rates...'}
            </span>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-semibold text-[#6B7280]">
          {lang === 'ko' ? '환전 계산기' : lang === 'zh' ? '汇率计算器' : 'Currency Converter'}
        </span>
        
        {/* 새로고침 버튼 */}
        <button
          onClick={handleRefresh}
          disabled={isLoading}
          className="text-xs text-[#6B7280] hover:text-[#111827] disabled:opacity-50 transition-colors"
          title={lang === 'ko' ? '환율 업데이트' : lang === 'zh' ? '更新汇率' : 'Update rates'}
        >
          <svg 
            className={`w-3 h-3 ${isLoading ? 'animate-spin' : ''}`}
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </button>
      </div>

      <div className="flex items-center gap-1.5 mb-2">
        <select
          value={selectedCurrency}
          onChange={e => setSelectedCurrency(e.target.value)}
          className="text-[11px] font-bold text-[#111827] bg-[#F3F4F6] rounded-lg px-1.5 py-1.5 outline-none border-none shrink-0"
        >
          {CURRENCIES.map(c => (
            <option key={c.code} value={c.code}>{c.flag} {c.code}</option>
          ))}
        </select>
        <input
          type="number"
          value={amount}
          onChange={e => setAmount(e.target.value)}
          className="w-0 flex-1 min-w-0 text-right text-sm font-bold text-[#111827] bg-[#F3F4F6] rounded-lg px-2 py-1.5 outline-none"
          placeholder="0"
        />
      </div>
      
      <div className="text-center text-[#9CA3AF] text-xs my-1">&darr;</div>
      
      <div className="flex items-center gap-1.5">
        <span className="text-[11px] font-bold text-[#111827] shrink-0 px-1.5">KRW</span>
        <div className="w-0 flex-1 min-w-0 text-right text-sm font-bold text-[#111827] bg-[#F3F4F6] rounded-lg px-2 py-1.5 truncate">
          {converted.toLocaleString('ko-KR', { maximumFractionDigits: 0 })}
        </div>
      </div>
      
      {/* 상태 표시 */}
      <div className="flex items-center justify-between mt-2">
        <p className="text-[8px] text-[#9CA3AF]">
          Last: {exchangeRate?._date || '-'}
        </p>
        
        {/* 에러/캐시 상태 표시 */}
        <div className="flex items-center gap-1">
          {hasError && (
            <span 
              className="text-[8px] text-orange-500" 
              title={lang === 'ko' ? '네트워크 오류로 저장된 데이터 사용 중' : lang === 'zh' ? '网络错误，使用缓存数据' : 'Network error, using cached data'}
            >
              ⚠️
            </span>
          )}
          {lastUpdated && (
            <span className="text-[8px] text-green-500" title={lang === 'ko' ? '실시간 데이터' : lang === 'zh' ? '实时数据' : 'Live data'}>
              ●
            </span>
          )}
        </div>
      </div>
    </div>
  )
}