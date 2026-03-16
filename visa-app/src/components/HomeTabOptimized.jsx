import { useState, useEffect } from 'react'
import { RECOMMENDED_COURSES } from '../data/recommendedCourses'
import { trackEvent } from '../utils/analytics'

// Import new widget components
import WeatherWidget from './home/widgets/WeatherWidget'
import GuideWidget from './home/widgets/GuideWidget'
import CourseWidget from './home/widgets/CourseWidget'

// Import existing helpers
import { L } from './home/utils/helpers'

export default function HomeTab({ language = 'ko', onTabChange, nickname = '' }) {
  // State management
  const [selectedTimezones, setSelectedTimezones] = useState(['CST']) // Default: China
  const [activeOverlay, setActiveOverlay] = useState(null)
  const [tab, setTab] = useState('home')

  // Filter courses based on language/preferences
  const filteredCourses = RECOMMENDED_COURSES.filter(course => 
    course.category === 'first' || course.category === 'food' || course.category === 'kpop'
  ).slice(0, 6)

  // Event handlers
  const handleTimezoneToggle = (tzId) => {
    setSelectedTimezones(prev => 
      prev.includes(tzId) 
        ? prev.filter(id => id !== tzId)
        : [...prev, tzId]
    )
    trackEvent('timezone_toggle', { timezone: tzId })
  }

  const handleWeatherRefresh = () => {
    // Weather widget handles its own refresh
    trackEvent('weather_refresh')
  }

  const handleCourseSelect = (course) => {
    trackEvent('course_select', { courseId: course.id })
    onTabChange?.('course')
  }

  const handleCreateCustomCourse = () => {
    trackEvent('custom_course_create')
    onTabChange?.('course')
  }

  return (
    <div className="min-h-screen bg-[#F9FAFB]">
      <div className="max-w-[480px] mx-auto bg-white">
        
        {/* Header Section */}
        <div className="bg-gradient-to-r from-[#2D5A3D] to-[#1F4B33] text-white p-6 rounded-b-[16px]">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-xl font-bold">
                {L(language, { ko: '안녕하세요!', zh: '您好！', en: 'Hello!' })}
              </h1>
              <p className="text-[#E5F3E9] text-sm">
                {nickname ? 
                  L(language, { 
                    ko: `${nickname}님, 한국 여행을 도와드릴게요`, 
                    zh: `${nickname}，我来帮您韩国旅行`, 
                    en: `${nickname}, let me help with your Korea trip` 
                  }) :
                  L(language, { 
                    ko: '한국 여행을 도와드릴게요', 
                    zh: '我来帮您韩国旅行', 
                    en: 'Let me help with your Korea trip' 
                  })
                }
              </p>
            </div>
            <div className="text-4xl">🇰🇷</div>
          </div>
          
          {/* Quick Access Buttons */}
          <div className="grid grid-cols-4 gap-3">
            {[
              { id: 'emergency', icon: '🚨', name: { ko: 'SOS', zh: '紧急', en: 'SOS' } },
              { id: 'translate', icon: '🔤', name: { ko: '번역', zh: '翻译', en: 'Translate' } },
              { id: 'currency', icon: '💱', name: { ko: '환율', zh: '汇率', en: 'Exchange' } },
              { id: 'subway', icon: '🚇', name: { ko: '지하철', zh: '地铁', en: 'Subway' } }
            ].map(item => (
              <button
                key={item.id}
                onClick={() => setActiveOverlay(item.id)}
                className="bg-white/20 backdrop-blur-sm rounded-[8px] p-3 text-center hover:bg-white/30 transition-colors"
              >
                <div className="text-xl mb-1">{item.icon}</div>
                <div className="text-xs">{L(language, item.name)}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Main Content */}
        <div className="p-4 space-y-6">
          
          {/* Weather Widget */}
          <WeatherWidget
            language={language}
            L={L}
            selectedTimezones={selectedTimezones}
            onTimezoneToggle={handleTimezoneToggle}
            onWeatherClick={handleWeatherRefresh}
          />

          {/* Guide Widget */}
          <GuideWidget
            language={language}
            L={L}
          />

          {/* Course Widget */}
          <CourseWidget
            language={language}
            L={L}
            courses={filteredCourses}
            onCourseSelect={handleCourseSelect}
            onCreateCustomCourse={handleCreateCustomCourse}
          />

          {/* Additional Quick Links */}
          <div className="bg-white rounded-[6px] border border-[#E5E7EB] p-4">
            <h3 className="text-base font-semibold text-[#111827] mb-3">
              {L(language, { ko: '빠른 이동', zh: '快速导航', en: 'Quick Links' })}
            </h3>
            
            <div className="grid grid-cols-2 gap-3">
              {[
                { 
                  tab: 'service', 
                  icon: '📋', 
                  name: { ko: '전체 서비스', zh: '全部服务', en: 'All Services' },
                  desc: { ko: '25개 가이드', zh: '25个指南', en: '25 Guides' }
                },
                { 
                  tab: 'course', 
                  icon: '🗺️', 
                  name: { ko: '추천 코스', zh: '推荐路线', en: 'Tour Courses' },
                  desc: { ko: '56개 코스', zh: '56条路线', en: '56 Courses' }
                },
                { 
                  tab: 'korean', 
                  icon: '🇰🇷', 
                  name: { ko: '한국어 학습', zh: '韩语学习', en: 'Learn Korean' },
                  desc: { ko: '게임형 학습', zh: '游戏化学习', en: 'Game-based' }
                },
                { 
                  tab: 'service', 
                  icon: '🛍️', 
                  name: { ko: '쇼핑 가이드', zh: '购物指南', en: 'Shopping Guide' },
                  desc: { ko: '면세점 정보', zh: '免税店信息', en: 'Duty-free Info' }
                }
              ].map(item => (
                <button
                  key={item.tab}
                  onClick={() => onTabChange?.(item.tab)}
                  className="flex flex-col items-center gap-2 p-3 rounded-[6px] bg-[#F9FAFB] hover:bg-[#F3F4F6] transition-colors"
                >
                  <span className="text-2xl">{item.icon}</span>
                  <div className="text-center">
                    <div className="text-sm font-medium text-[#111827]">
                      {L(language, item.name)}
                    </div>
                    <div className="text-xs text-[#6B7280]">
                      {L(language, item.desc)}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Travel Tips */}
          <div className="bg-gradient-to-r from-[#F0F9FF] to-[#EFF6FF] border border-[#BAE6FD] rounded-[6px] p-4">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xl">💡</span>
              <h3 className="font-semibold text-[#0284C7]">
                {L(language, { ko: '오늘의 여행 팁', zh: '今日旅游贴士', en: "Today's Travel Tip" })}
              </h3>
            </div>
            <p className="text-sm text-[#0369A1] leading-relaxed">
              {L(language, { 
                ko: '한국에서는 대부분의 곳에서 카드 결제가 가능해요. 하지만 전통시장이나 작은 상점에서는 현금이 필요할 수 있으니 소액의 현금을 준비하세요.',
                zh: '在韩国大部分地方都可以刷卡。但在传统市场或小商店可能需要现金，请准备少量现金。',
                en: 'Card payments are accepted almost everywhere in Korea. However, cash may be needed at traditional markets or small shops, so keep some cash handy.'
              })}
            </p>
          </div>

          {/* Bottom Spacing */}
          <div className="h-20"></div>
        </div>

        {/* SOS Floating Button */}
        <button
          onClick={() => setActiveOverlay('emergency')}
          className="fixed bottom-20 right-4 z-40 w-12 h-12 rounded-full bg-[#DC2626] text-white flex items-center justify-center  active:scale-95 transition-transform"
        >
          <span className="text-lg font-bold">SOS</span>
        </button>
      </div>
    </div>
  )
}