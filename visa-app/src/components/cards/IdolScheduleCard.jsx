import { useState, useEffect } from 'react'
import { updateIdolDatabase } from '../../utils/idolDataUpdater.js'

// ─── K-Pop Idol Schedule Card ───

export default function IdolScheduleCard({ lang = 'ko' }) {
  const [schedules, setSchedules] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedFilter, setSelectedFilter] = useState('all')
  const [lastUpdated, setLastUpdated] = useState(null)

  // 스케줄 데이터 로드
  useEffect(() => {
    loadSchedules()
  }, [])

  const loadSchedules = async () => {
    try {
      setIsLoading(true)
      setError(null)

      // idolDataUpdater를 통해 최신 데이터 가져오기
      const result = await updateIdolDatabase()
      
      if (result.success) {
        // 모든 아이돌의 스케줄을 합쳐서 날짜순 정렬
        const allSchedules = []
        
        result.database.forEach(idol => {
          if (idol.schedules && idol.schedules.length > 0) {
            idol.schedules.forEach(schedule => {
              allSchedules.push({
                ...schedule,
                artistId: idol.id,
                artistName: idol.name,
                artistCompany: idol.company,
                artistGeneration: idol.gen,
              })
            })
          }
        })

        // 날짜순 정렬 및 필터링 (향후 30일 이내)
        const now = new Date()
        const futureSchedules = allSchedules
          .filter(schedule => {
            const scheduleDate = new Date(schedule.date)
            const daysDiff = (scheduleDate - now) / (1000 * 60 * 60 * 24)
            return daysDiff >= 0 && daysDiff <= 30 // 30일 이내
          })
          .sort((a, b) => new Date(a.date) - new Date(b.date))
          .slice(0, 10) // 최대 10개만

        setSchedules(futureSchedules)
        setLastUpdated(result.metadata.lastUpdated)
      } else {
        throw new Error(result.error || '데이터 로드 실패')
      }
    } catch (err) {
      console.error('스케줄 로드 실패:', err)
      setError(err.message)
      
      // Fallback 데이터
      setSchedules([
        {
          date: '2026-03-15',
          type: 'fanmeeting',
          name: { ko: '팬미팅 서울', zh: '粉丝见面会 首尔', en: 'Fan Meeting Seoul' },
          artistName: 'BTS',
          artistCompany: 'HYBE',
          artistGeneration: '3rd',
        },
        {
          date: '2026-03-20',
          type: 'concert',
          name: { ko: '잠실 콘서트', zh: '蚕室演唱会', en: 'Jamsil Concert' },
          artistName: 'SEVENTEEN',
          artistCompany: 'PLEDIS/HYBE',
          artistGeneration: '3rd',
        },
        {
          date: '2026-03-25',
          type: 'fansign',
          name: { ko: '팬사인회', zh: '粉丝签名会', en: 'Fan Sign Event' },
          artistName: 'IVE',
          artistCompany: 'STARSHIP',
          artistGeneration: '4th',
        },
      ])
    } finally {
      setIsLoading(false)
    }
  }

  // 필터링된 스케줄
  const filteredSchedules = schedules.filter(schedule => {
    if (selectedFilter === 'all') return true
    return schedule.type === selectedFilter
  })

  // 새로고침 핸들러
  const handleRefresh = () => {
    loadSchedules()
  }

  // 이벤트 타입 아이콘
  const getEventIcon = (type) => {
    const icons = {
      concert: '🎤',
      fanmeeting: '💜',
      fansign: '✍️',
      album: '💿',
      comeback: '🎵',
      tour: '🌍',
    }
    return icons[type] || '📅'
  }

  // 이벤트 타입 컬러
  const getEventColor = (type) => {
    const colors = {
      concert: 'bg-purple-100 text-purple-800',
      fanmeeting: 'bg-pink-100 text-pink-800',
      fansign: 'bg-blue-100 text-blue-800',
      album: 'bg-green-100 text-green-800',
      comeback: 'bg-yellow-100 text-yellow-800',
      tour: 'bg-indigo-100 text-indigo-800',
    }
    return colors[type] || 'bg-gray-100 text-gray-800'
  }

  // D-Day 계산
  const getDday = (dateString) => {
    const scheduleDate = new Date(dateString)
    const now = new Date()
    const timeDiff = scheduleDate.getTime() - now.getTime()
    const dayDiff = Math.ceil(timeDiff / (1000 * 3600 * 24))
    
    if (dayDiff === 0) return 'D-Day'
    if (dayDiff === 1) return 'D-1'
    if (dayDiff < 0) return `D+${Math.abs(dayDiff)}`
    return `D-${dayDiff}`
  }

  return (
    <div className="glass rounded-lg p-4">
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-[#6B7280]">
            {lang === 'ko' ? '아이돌 일정' : 
             lang === 'zh' ? '偶像日程' : 'Idol Schedule'}
          </span>
          
          {error && (
            <span className="text-[8px] text-red-500" title="오프라인 모드">
              ⚠️
            </span>
          )}
        </div>
        
        <button
          onClick={handleRefresh}
          disabled={isLoading}
          className="text-xs text-[#6B7280] hover:text-[#111827] disabled:opacity-50 transition-colors"
          title={lang === 'ko' ? '일정 새로고침' : 
                 lang === 'zh' ? '刷新日程' : 'Refresh schedule'}
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

      {/* 필터 버튼들 */}
      <div className="flex gap-1 mb-3 overflow-x-auto">
        {['all', 'concert', 'fanmeeting', 'fansign', 'album'].map(filter => (
          <button
            key={filter}
            onClick={() => setSelectedFilter(filter)}
            className={`px-2 py-1 text-[10px] font-medium rounded whitespace-nowrap ${
              selectedFilter === filter 
                ? 'bg-[#111827] text-white' 
                : 'bg-[#F3F4F6] text-[#6B7280] hover:bg-[#E5E7EB]'
            } transition-colors`}
          >
            {getEventIcon(filter === 'all' ? 'calendar' : filter)}{' '}
            {filter === 'all' ? 
              (lang === 'ko' ? '전체' : lang === 'zh' ? '全部' : 'All') : 
              filter.charAt(0).toUpperCase() + filter.slice(1)
            }
          </button>
        ))}
      </div>

      {/* 로딩 상태 */}
      {isLoading && (
        <div className="flex items-center justify-center py-8">
          <div className="flex flex-col items-center gap-2">
            <div className="w-4 h-4 border-2 border-[#111827] border-t-transparent rounded-full animate-spin"></div>
            <span className="text-xs text-[#6B7280]">
              {lang === 'ko' ? '일정 불러오는 중...' : 
               lang === 'zh' ? '加载日程中...' : 'Loading schedule...'}
            </span>
          </div>
        </div>
      )}

      {/* 스케줄 리스트 */}
      {!isLoading && filteredSchedules.length > 0 && (
        <div className="space-y-2">
          {filteredSchedules.map((schedule, index) => (
            <div 
              key={`${schedule.artistName}-${schedule.date}-${index}`}
              className="p-3 bg-[#F9FAFB] rounded-lg hover:bg-[#F3F4F6] transition-colors"
            >
              <div className="flex items-start gap-3">
                {/* D-Day */}
                <div className="flex flex-col items-center min-w-0 shrink-0">
                  <span className="text-[10px] font-bold text-[#EF4444]">
                    {getDday(schedule.date)}
                  </span>
                  <span className="text-[8px] text-[#9CA3AF]">
                    {new Date(schedule.date).toLocaleDateString('ko-KR', { 
                      month: 'short', 
                      day: 'numeric' 
                    })}
                  </span>
                </div>

                {/* 이벤트 정보 */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`px-1.5 py-0.5 text-[8px] font-medium rounded ${getEventColor(schedule.type)}`}>
                      {getEventIcon(schedule.type)} {schedule.type.toUpperCase()}
                    </span>
                    <span className="text-[8px] text-[#9CA3AF] font-medium">
                      {schedule.artistName}
                    </span>
                  </div>
                  
                  <p className="text-xs font-medium text-[#111827] mb-1 leading-tight">
                    {schedule.name?.[lang] || schedule.name?.ko || schedule.name?.en || 'No title'}
                  </p>
                  
                  {schedule.venue && (
                    <p className="text-[10px] text-[#6B7280]">
                      📍 {schedule.venue}
                    </p>
                  )}
                </div>

                {/* 세대 표시 */}
                <div className="shrink-0">
                  <span className="text-[8px] px-1.5 py-0.5 bg-[#E5E7EB] text-[#6B7280] rounded font-medium">
                    {schedule.artistGeneration}
                  </span>
                </div>
              </div>

              {/* 티켓 링크 */}
              {schedule.tickets && (
                <div className="mt-2 pt-2 border-t border-[#E5E7EB]">
                  <a 
                    href={schedule.tickets}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-[10px] text-[#3B82F6] hover:text-[#1D4ED8] font-medium"
                  >
                    🎫 {lang === 'ko' ? '티켓 예매' : 
                         lang === 'zh' ? '票务预订' : 'Book Tickets'}
                    <svg className="w-2 h-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </a>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* 빈 상태 */}
      {!isLoading && filteredSchedules.length === 0 && (
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <span className="text-2xl mb-2">📅</span>
          <p className="text-xs text-[#6B7280] mb-1">
            {lang === 'ko' ? '예정된 일정이 없습니다' : 
             lang === 'zh' ? '暂无预定日程' : 'No scheduled events'}
          </p>
          {selectedFilter !== 'all' && (
            <button
              onClick={() => setSelectedFilter('all')}
              className="text-[10px] text-[#3B82F6] hover:text-[#1D4ED8] mt-1"
            >
              {lang === 'ko' ? '전체 보기' : 
               lang === 'zh' ? '查看全部' : 'View all'}
            </button>
          )}
        </div>
      )}

      {/* 푸터 */}
      {lastUpdated && (
        <div className="flex justify-between items-center mt-3 pt-2 border-t border-[#E5E7EB]">
          <span className="text-[8px] text-[#9CA3AF]">
            {lang === 'ko' ? '마지막 업데이트' : 
             lang === 'zh' ? '最后更新' : 'Last updated'}: {' '}
            {new Date(lastUpdated).toLocaleDateString('ko-KR', {
              month: 'short',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })}
          </span>
          
          {error && (
            <span className="text-[8px] text-orange-500">
              {lang === 'ko' ? '오프라인 모드' : 
               lang === 'zh' ? '离线模式' : 'Offline mode'}
            </span>
          )}
        </div>
      )}
    </div>
  )
}