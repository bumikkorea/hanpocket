import { useState, useEffect, useCallback } from 'react'

// ─── K-Pop Chart Widget with GFW Fallback Support ───

const CHART_SOURCES = {
  melon: { name: '멜론', flag: '🎵', color: '#00D664' },
  spotify: { name: 'Spotify', flag: '🎧', color: '#1DB954' },
  youtube: { name: 'YouTube', flag: '📺', color: '#FF0000' },
  applemusic: { name: 'Apple Music', flag: '🍎', color: '#FA233B' },
  netease: { name: 'NetEase', flag: '☁️', color: '#C20C0C' }, // GFW fallback
  qq: { name: 'QQ Music', flag: '🐧', color: '#FE9901' }, // GFW fallback
}

const CACHE_KEY = 'hanpocket_kpop_charts'
const CACHE_DURATION = 3600 * 1000 // 1시간

// 캐시 데이터 로드
function loadCachedCharts() {
  try {
    const cached = localStorage.getItem(CACHE_KEY)
    if (!cached) return null
    
    const { data, timestamp } = JSON.parse(cached)
    const now = Date.now()
    
    // 캐시가 유효한지 확인 (1시간 이내)
    if (now - timestamp < CACHE_DURATION) {
      return data
    }
    
    // 만료된 캐시 삭제
    localStorage.removeItem(CACHE_KEY)
    return null
  } catch (error) {
    console.warn('차트 캐시 로드 실패:', error)
    localStorage.removeItem(CACHE_KEY)
    return null
  }
}

// 캐시에 데이터 저장
function saveCachedCharts(data) {
  try {
    const cacheData = {
      data,
      timestamp: Date.now()
    }
    localStorage.setItem(CACHE_KEY, JSON.stringify(cacheData))
  } catch (error) {
    console.warn('차트 캐시 저장 실패:', error)
  }
}

// GFW 환경 감지
async function detectGFWEnvironment() {
  try {
    const controller = new AbortController()
    setTimeout(() => controller.abort(), 3000) // 3초 타임아웃
    
    const response = await fetch('https://music.apple.com/favicon.ico', {
      method: 'HEAD',
      signal: controller.signal,
    })
    return !response.ok
  } catch (error) {
    // Apple Music에 접근할 수 없으면 GFW 환경으로 간주
    return true
  }
}

// Fallback 차트 데이터 (오프라인 모드용)
const FALLBACK_CHART = [
  { rank: 1, title: 'Super Shy', artist: 'NewJeans', source: 'cached', trend: '↗' },
  { rank: 2, title: 'Get Up', artist: 'NewJeans', source: 'cached', trend: '↗' },
  { rank: 3, title: 'UNFORGIVEN', artist: 'LE SSERAFIM', source: 'cached', trend: '↘' },
  { rank: 4, title: 'Queencard', artist: '(G)I-DLE', source: 'cached', trend: '→' },
  { rank: 5, title: 'Spicy', artist: 'aespa', source: 'cached', trend: '↗' },
  { rank: 6, title: 'Eve, Psyche & The Bluebeard\'s wife', artist: 'LE SSERAFIM', source: 'cached', trend: '↘' },
  { rank: 7, title: 'God of Music', artist: 'SEVENTEEN', source: 'cached', trend: '↗' },
  { rank: 8, title: 'I AM', artist: 'IVE', source: 'cached', trend: '→' },
  { rank: 9, title: 'S-Class', artist: 'Stray Kids', source: 'cached', trend: '↘' },
  { rank: 10, title: 'LALALA', artist: 'Stray Kids', source: 'cached', trend: '↗' },
]

// K-Pop 차트 데이터 가져오기
async function fetchKPopCharts() {
  // 캐시된 데이터 확인
  const cached = loadCachedCharts()
  if (cached && !cached._error) {
    return cached
  }

  try {
    // GFW 환경 감지
    const isGFW = await detectGFWEnvironment()
    console.log('GFW 환경:', isGFW)

    // Cloudflare Workers에서 업데이트된 데이터 가져오기
    const workerUrl = isGFW 
      ? '/api/charts?source=gfw_fallback' 
      : '/api/charts?source=standard'
    
    const response = await fetch(workerUrl, {
      headers: { 'Accept': 'application/json' },
      signal: AbortSignal.timeout(8000), // 8초 타임아웃
    })

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`)
    }

    const data = await response.json()
    
    if (data.charts && data.charts.length > 0) {
      const result = {
        charts: data.charts.slice(0, 10), // Top 10만
        lastUpdated: data.timestamp,
        sourceType: isGFW ? 'gfw_fallback' : 'standard',
        isGFW,
        _updated: Date.now()
      }

      // 캐시에 저장
      saveCachedCharts(result)
      return result
    }

    throw new Error('차트 데이터 없음')

  } catch (error) {
    console.error('K-Pop 차트 API 호출 실패:', error)

    // Fallback: 캐시된 데이터 또는 정적 데이터 사용
    if (cached) {
      console.log('캐시된 데이터 사용')
      return { ...cached, _error: true }
    }

    console.log('정적 Fallback 데이터 사용')
    return {
      charts: FALLBACK_CHART,
      lastUpdated: Date.now(),
      sourceType: 'offline',
      isGFW: false,
      _error: true,
      _fallback: true,
    }
  }
}

export default function KPopChartWidget({ chartData: propChartData, lang, compact = false }) {
  const [selectedSource, setSelectedSource] = useState('melon')
  const [chartData, setChartData] = useState(propChartData || null)
  const [isLoading, setIsLoading] = useState(false)
  const [lastUpdated, setLastUpdated] = useState(null)
  const [hasError, setHasError] = useState(false)
  const [isOffline, setIsOffline] = useState(false)

  // 차트 데이터 업데이트
  const updateChartData = useCallback(async (force = false) => {
    if (isLoading || (!force && chartData && !chartData._error)) {
      const cached = loadCachedCharts()
      if (cached && !force) return
    }

    setIsLoading(true)
    setHasError(false)

    try {
      const data = await fetchKPopCharts()
      setChartData(data)
      setLastUpdated(new Date())
      setIsOffline(!navigator.onLine)
      
      if (data._error || data._fallback) {
        setHasError(true)
      }
    } catch (error) {
      console.error('차트 업데이트 실패:', error)
      setHasError(true)
      setIsOffline(true)
      
      // 에러 시 Fallback 데이터 사용
      if (!chartData) {
        setChartData({
          charts: FALLBACK_CHART,
          lastUpdated: Date.now(),
          sourceType: 'offline',
          _error: true,
          _fallback: true,
        })
      }
    } finally {
      setIsLoading(false)
    }
  }, [chartData, isLoading])

  // 온라인/오프라인 상태 감지
  useEffect(() => {
    const handleOnline = () => {
      setIsOffline(false)
      if (hasError) {
        updateChartData(true) // 온라인 복구 시 새로고침
      }
    }
    const handleOffline = () => setIsOffline(true)

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [hasError, updateChartData])

  // 컴포넌트 마운트 시 차트 데이터 로드
  useEffect(() => {
    if (!propChartData) {
      updateChartData()
    } else {
      setChartData(propChartData)
    }
  }, [propChartData, updateChartData])

  // 새로고침 핸들러
  const handleRefresh = () => {
    updateChartData(true)
  }

  // 현재 선택된 소스의 차트 필터링
  const filteredCharts = chartData?.charts?.filter(
    item => item.source === selectedSource || (selectedSource === 'all')
  ) || FALLBACK_CHART.slice(0, 5)

  // 표시할 차트 (compact 모드에서는 5개만)
  const displayCharts = compact ? filteredCharts.slice(0, 5) : filteredCharts.slice(0, 10)

  return (
    <div className="glass rounded-lg p-4 relative">
      {/* 로딩 오버레이 */}
      {isLoading && (
        <div className="absolute inset-0 bg-white/80 backdrop-blur-sm rounded-lg flex items-center justify-center z-10">
          <div className="flex flex-col items-center gap-2">
            <div className="w-4 h-4 border-2 border-[#111827] border-t-transparent rounded-full animate-spin"></div>
            <span className="text-xs text-[#6B7280]">
              {lang === 'ko' ? '차트 업데이트 중...' : 
               lang === 'zh' ? '更新排行榜中...' : 'Updating charts...'}
            </span>
          </div>
        </div>
      )}

      {/* 헤더 */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-[#6B7280]">
            {lang === 'ko' ? 'K-POP 차트' : 
             lang === 'zh' ? 'K-POP排行榜' : 'K-POP Charts'}
          </span>
          
          {/* 상태 표시 */}
          <div className="flex items-center gap-1">
            {isOffline && (
              <span className="text-[8px] text-orange-500" title="오프라인 모드">📱</span>
            )}
            {chartData?.isGFW && (
              <span className="text-[8px] text-blue-500" title="GFW 대체 소스">🌏</span>
            )}
            {hasError && (
              <span className="text-[8px] text-red-500" title="네트워크 오류">⚠️</span>
            )}
          </div>
        </div>
        
        {/* 새로고침 버튼 */}
        <button
          onClick={handleRefresh}
          disabled={isLoading}
          className="text-xs text-[#6B7280] hover:text-[#111827] disabled:opacity-50 transition-colors"
          title={lang === 'ko' ? '차트 업데이트' : 
                 lang === 'zh' ? '更新排行榜' : 'Update charts'}
        >
          <svg 
            className={`w-3 h-3 ${isLoading ? 'animate-spin' : ''}`}
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </button>
      </div>

      {/* 소스 선택 */}
      {!compact && (
        <div className="flex gap-1 mb-3 overflow-x-auto">
          <button
            onClick={() => setSelectedSource('all')}
            className={`px-2 py-1 text-[10px] font-medium rounded ${
              selectedSource === 'all' 
                ? 'bg-[#111827] text-white' 
                : 'bg-[#F3F4F6] text-[#6B7280] hover:bg-[#E5E7EB]'
            } transition-colors whitespace-nowrap`}
          >
            전체
          </button>
          {Object.entries(CHART_SOURCES).map(([key, source]) => (
            <button
              key={key}
              onClick={() => setSelectedSource(key)}
              className={`px-2 py-1 text-[10px] font-medium rounded flex items-center gap-1 ${
                selectedSource === key 
                  ? 'bg-[#111827] text-white' 
                  : 'bg-[#F3F4F6] text-[#6B7280] hover:bg-[#E5E7EB]'
              } transition-colors whitespace-nowrap`}
              style={{ 
                backgroundColor: selectedSource === key ? source.color : undefined 
              }}
            >
              <span className="text-[8px]">{source.flag}</span>
              {source.name}
            </button>
          ))}
        </div>
      )}

      {/* 차트 목록 */}
      <div className="space-y-2">
        {displayCharts.map((track, index) => (
          <div 
            key={`${track.rank}-${track.title}`}
            className="flex items-center gap-2 p-2 bg-[#F9FAFB] rounded-lg hover:bg-[#F3F4F6] transition-colors group"
          >
            {/* 순위 */}
            <div className="flex items-center gap-1 min-w-0 shrink-0">
              <span className={`text-xs font-bold ${
                track.rank <= 3 ? 'text-[#EF4444]' : 'text-[#6B7280]'
              }`}>
                {track.rank}
              </span>
              {track.trend && (
                <span className={`text-[8px] ${
                  track.trend === '↗' ? 'text-green-500' :
                  track.trend === '↘' ? 'text-red-500' : 'text-gray-400'
                }`}>
                  {track.trend}
                </span>
              )}
            </div>

            {/* 곡 정보 */}
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-[#111827] truncate">
                {track.title}
              </p>
              <p className="text-[10px] text-[#6B7280] truncate">
                {track.artist}
              </p>
            </div>

            {/* 소스 표시 */}
            <div className="shrink-0">
              {CHART_SOURCES[track.source] && (
                <span 
                  className="text-[8px] px-1.5 py-0.5 rounded text-white font-medium"
                  style={{ backgroundColor: CHART_SOURCES[track.source].color }}
                >
                  {CHART_SOURCES[track.source].flag}
                </span>
              )}
              {track.source === 'cached' && (
                <span className="text-[8px] px-1.5 py-0.5 rounded bg-gray-400 text-white font-medium">
                  💾
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* 푸터 정보 */}
      <div className="flex items-center justify-between mt-3 pt-2 border-t border-[#E5E7EB]">
        <p className="text-[8px] text-[#9CA3AF]">
          {chartData?.lastUpdated 
            ? new Date(chartData.lastUpdated).toLocaleDateString('ko-KR', {
                month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
              })
            : 'No data'
          }
        </p>
        
        <div className="flex items-center gap-1">
          {chartData?._fallback && (
            <span className="text-[8px] text-orange-500" title="오프라인 데이터">
              📱
            </span>
          )}
          {chartData?.sourceType && (
            <span className="text-[8px] text-[#9CA3AF]">
              {chartData.sourceType === 'gfw_fallback' ? 'GFW' : 
               chartData.sourceType === 'offline' ? 'Offline' : 'Live'}
            </span>
          )}
        </div>
      </div>
    </div>
  )
}