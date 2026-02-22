// Idol Data Auto Updater - Frontend Utility
// Updates idolData.js with latest information from Cloudflare Workers

import { idolDatabase } from '../data/idolData.js'

const WORKER_ENDPOINT = '/api/idol-data'
const UPDATE_INTERVAL = 24 * 60 * 60 * 1000 // 24 hours
const CACHE_KEY = 'hanpocket_idol_updates'

// 아이돌 데이터 업데이트 캐시
class IdolDataCache {
  static get(key) {
    try {
      const cached = localStorage.getItem(`${CACHE_KEY}_${key}`)
      if (!cached) return null
      
      const { data, timestamp } = JSON.parse(cached)
      const now = Date.now()
      
      // 24시간 이내 데이터만 유효
      if (now - timestamp < UPDATE_INTERVAL) {
        return data
      }
      
      // 만료된 캐시 삭제
      localStorage.removeItem(`${CACHE_KEY}_${key}`)
      return null
    } catch (error) {
      console.warn('아이돌 캐시 로드 실패:', error)
      return null
    }
  }

  static set(key, data) {
    try {
      const cacheData = {
        data,
        timestamp: Date.now()
      }
      localStorage.setItem(`${CACHE_KEY}_${key}`, JSON.stringify(cacheData))
    } catch (error) {
      console.warn('아이돌 캐시 저장 실패:', error)
    }
  }

  static clear() {
    try {
      const keys = Object.keys(localStorage).filter(key => key.startsWith(CACHE_KEY))
      keys.forEach(key => localStorage.removeItem(key))
    } catch (error) {
      console.warn('아이돌 캐시 정리 실패:', error)
    }
  }
}

// Workers에서 최신 아이돌 데이터 가져오기
export async function fetchLatestIdolUpdates(forceRefresh = false) {
  if (!forceRefresh) {
    const cached = IdolDataCache.get('updates')
    if (cached) {
      console.log('✅ 캐시된 아이돌 업데이트 사용')
      return cached
    }
  }

  try {
    console.log('🔄 Workers에서 아이돌 데이터 업데이트 가져오는 중...')
    
    const response = await fetch(WORKER_ENDPOINT, {
      headers: { 'Accept': 'application/json' },
      signal: AbortSignal.timeout(10000), // 10초 타임아웃
    })

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }

    const updates = await response.json()
    
    // 캐시에 저장
    IdolDataCache.set('updates', updates)
    
    console.log('✅ 아이돌 데이터 업데이트 완료:', {
      schedules: updates.schedules?.length || 0,
      social: updates.social?.length || 0,
      news: updates.news?.length || 0,
      charts: updates.charts?.length || 0,
    })

    return updates
    
  } catch (error) {
    console.error('❌ 아이돌 데이터 업데이트 실패:', error)
    
    // 캐시된 데이터 반환 (만료되었더라도)
    const cached = IdolDataCache.get('updates')
    if (cached) {
      console.log('⚠️ 네트워크 오류로 캐시된 데이터 사용')
      return { ...cached, _error: true }
    }
    
    throw error
  }
}

// 스케줄 데이터 병합
export function mergeScheduleUpdates(originalData, updates) {
  if (!updates?.schedules || !Array.isArray(updates.schedules)) {
    return originalData
  }

  const updatedData = [...originalData]
  
  updates.schedules.forEach(newSchedule => {
    // 아티스트 매칭
    const artistIndex = updatedData.findIndex(idol => 
      matchArtistName(idol.name, newSchedule.artist) ||
      matchArtistName(idol.id, newSchedule.artist?.toLowerCase())
    )
    
    if (artistIndex >= 0) {
      const existingSchedules = updatedData[artistIndex].schedules || []
      
      // 중복 스케줄 체크 (같은 날짜 + 유사한 제목)
      const isDuplicate = existingSchedules.some(schedule => 
        schedule.date === newSchedule.date &&
        (
          schedule.name.ko?.includes(newSchedule.name.ko) ||
          schedule.name.en?.includes(newSchedule.name.en) ||
          newSchedule.name.ko?.includes(schedule.name.ko)
        )
      )
      
      if (!isDuplicate) {
        updatedData[artistIndex].schedules = [
          ...existingSchedules,
          {
            date: newSchedule.date,
            type: newSchedule.type,
            name: newSchedule.name,
            venue: newSchedule.venue,
            tickets: newSchedule.tickets,
            _autoUpdated: true,
          }
        ].sort((a, b) => new Date(a.date) - new Date(b.date)) // 날짜순 정렬
        
        console.log(`📅 ${updatedData[artistIndex].name}에 새 스케줄 추가:`, newSchedule.name.ko)
      }
    } else {
      console.warn('⚠️ 스케줄 아티스트 매칭 실패:', newSchedule.artist)
    }
  })
  
  return updatedData
}

// 소셜 미디어 업데이트 병합
export function mergeSocialUpdates(originalData, updates) {
  if (!updates?.social || !Array.isArray(updates.social)) {
    return originalData
  }

  const updatedData = [...originalData]
  
  updates.social.forEach(socialUpdate => {
    const artistIndex = updatedData.findIndex(idol => 
      matchArtistName(idol.name, socialUpdate.artist)
    )
    
    if (artistIndex >= 0) {
      // 소셜 미디어 활동도 추가 (기존 socials 객체를 확장)
      if (!updatedData[artistIndex].recentActivity) {
        updatedData[artistIndex].recentActivity = []
      }
      
      updatedData[artistIndex].recentActivity.push({
        platform: socialUpdate.platform,
        content: socialUpdate.content?.substring(0, 100) + '...', // 100자 제한
        timestamp: socialUpdate.timestamp,
        engagement: socialUpdate.engagement,
        _autoUpdated: true,
      })
      
      // 최근 5개만 유지
      updatedData[artistIndex].recentActivity = updatedData[artistIndex].recentActivity
        .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
        .slice(0, 5)
    }
  })
  
  return updatedData
}

// 차트 데이터 병합 (인기도 점수 업데이트)
export function mergeChartUpdates(originalData, updates) {
  if (!updates?.charts || !Array.isArray(updates.charts)) {
    return originalData
  }

  const updatedData = [...originalData]
  
  // 차트 데이터로 인기도 점수 계산
  const popularityScores = {}
  
  updates.charts.forEach(chartEntry => {
    if (!chartEntry.isKpop) return
    
    const artistName = chartEntry.artist
    const score = calculatePopularityScore(chartEntry.rank, chartEntry.source)
    
    if (popularityScores[artistName]) {
      popularityScores[artistName] += score
    } else {
      popularityScores[artistName] = score
    }
  })
  
  // 아이돌 데이터에 인기도 점수 반영
  updatedData.forEach((idol, index) => {
    const artistPopularity = Object.keys(popularityScores).find(artist =>
      matchArtistName(idol.name, artist)
    )
    
    if (artistPopularity) {
      updatedData[index].popularityScore = popularityScores[artistPopularity]
      updatedData[index].chartPosition = getChartPosition(updates.charts, idol.name)
      updatedData[index]._lastChartUpdate = Date.now()
    }
  })
  
  return updatedData
}

// 뉴스 업데이트 병합
export function mergeNewsUpdates(originalData, updates) {
  if (!updates?.news || !Array.isArray(updates.news)) {
    return originalData
  }

  const updatedData = [...originalData]
  
  updates.news.forEach(newsItem => {
    const artistIndex = updatedData.findIndex(idol => 
      matchArtistName(idol.name, newsItem.artist)
    )
    
    if (artistIndex >= 0) {
      if (!updatedData[artistIndex].recentNews) {
        updatedData[artistIndex].recentNews = []
      }
      
      updatedData[artistIndex].recentNews.push({
        title: newsItem.title,
        summary: newsItem.summary?.substring(0, 200) + '...', // 200자 제한
        url: newsItem.url,
        published: newsItem.published,
        type: newsItem.type,
        _autoUpdated: true,
      })
      
      // 최근 3개만 유지
      updatedData[artistIndex].recentNews = updatedData[artistIndex].recentNews
        .sort((a, b) => new Date(b.published) - new Date(a.published))
        .slice(0, 3)
    }
  })
  
  return updatedData
}

// 전체 아이돌 데이터 업데이트
export async function updateIdolDatabase(forceRefresh = false) {
  try {
    const updates = await fetchLatestIdolUpdates(forceRefresh)
    let updatedDatabase = [...idolDatabase]
    
    // 각 업데이트 타입별로 병합
    updatedDatabase = mergeScheduleUpdates(updatedDatabase, updates)
    updatedDatabase = mergeSocialUpdates(updatedDatabase, updates)
    updatedDatabase = mergeChartUpdates(updatedDatabase, updates)
    updatedDatabase = mergeNewsUpdates(updatedDatabase, updates)
    
    // 업데이트 메타데이터 추가
    const updateMetadata = {
      lastUpdated: Date.now(),
      source: updates.source_type || 'standard',
      version: '1.0.0',
      updateCount: countUpdates(updatedDatabase),
    }
    
    // 로컬 스토리지에 업데이트된 데이터 저장 (옵션)
    IdolDataCache.set('merged_database', {
      database: updatedDatabase,
      metadata: updateMetadata,
    })
    
    console.log('🎉 아이돌 데이터베이스 업데이트 완료:', updateMetadata)
    
    return {
      database: updatedDatabase,
      metadata: updateMetadata,
      success: true,
    }
    
  } catch (error) {
    console.error('❌ 아이돌 데이터베이스 업데이트 실패:', error)
    
    // 캐시된 데이터 반환
    const cached = IdolDataCache.get('merged_database')
    if (cached) {
      console.log('📱 오프라인 모드: 캐시된 데이터 사용')
      return {
        database: cached.database,
        metadata: { ...cached.metadata, _error: true },
        success: false,
        error: error.message,
      }
    }
    
    // 원본 데이터 반환
    return {
      database: idolDatabase,
      metadata: { error: error.message, lastUpdated: null },
      success: false,
      error: error.message,
    }
  }
}

// Helper 함수들
function matchArtistName(name1, name2) {
  if (!name1 || !name2) return false
  
  const normalize = (name) => name.toLowerCase()
    .replace(/[^\w\s가-힣]/g, '') // 특수문자 제거
    .replace(/\s+/g, '') // 공백 제거
  
  const normalized1 = normalize(name1)
  const normalized2 = normalize(name2)
  
  return normalized1.includes(normalized2) || 
         normalized2.includes(normalized1) ||
         normalized1 === normalized2
}

function calculatePopularityScore(rank, source) {
  const baseScore = Math.max(0, 101 - rank) // 순위가 높을수록 높은 점수
  
  // 소스별 가중치
  const sourceWeights = {
    melon: 1.0,     // 멜론이 기준
    spotify: 0.8,   // 스포티파이는 국제적
    youtube: 0.6,   // 유튜브 뮤직
    applemusic: 0.7,// 애플 뮤직
    netease: 0.5,   // 중국 소스들은 낮은 가중치
    qq: 0.5,
  }
  
  return baseScore * (sourceWeights[source] || 0.5)
}

function getChartPosition(charts, artistName) {
  const artistCharts = charts.filter(chart => 
    matchArtistName(artistName, chart.artist)
  )
  
  if (artistCharts.length === 0) return null
  
  // 가장 높은 순위 반환
  const bestRank = Math.min(...artistCharts.map(chart => chart.rank))
  const bestChart = artistCharts.find(chart => chart.rank === bestRank)
  
  return {
    rank: bestRank,
    source: bestChart.source,
    title: bestChart.title,
  }
}

function countUpdates(database) {
  let count = 0
  database.forEach(idol => {
    if (idol.schedules?.some(s => s._autoUpdated)) count++
    if (idol.recentActivity?.length > 0) count++
    if (idol.recentNews?.length > 0) count++
    if (idol.popularityScore) count++
  })
  return count
}

// React Hook으로 사용하기 위한 유틸리티
export function useIdolData() {
  const [data, setData] = useState({
    database: idolDatabase,
    isLoading: false,
    error: null,
    lastUpdated: null,
  })
  
  const updateData = useCallback(async (forceRefresh = false) => {
    setData(prev => ({ ...prev, isLoading: true, error: null }))
    
    try {
      const result = await updateIdolDatabase(forceRefresh)
      setData({
        database: result.database,
        isLoading: false,
        error: result.success ? null : result.error,
        lastUpdated: result.metadata.lastUpdated,
        metadata: result.metadata,
      })
    } catch (error) {
      setData(prev => ({
        ...prev,
        isLoading: false,
        error: error.message,
      }))
    }
  }, [])
  
  useEffect(() => {
    updateData() // 컴포넌트 마운트 시 자동 업데이트
  }, [updateData])
  
  return {
    ...data,
    refresh: updateData,
  }
}