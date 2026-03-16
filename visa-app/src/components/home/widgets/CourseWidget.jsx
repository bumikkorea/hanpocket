import { useState, useCallback } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { trackEvent } from '../../../utils/analytics'

export default function CourseWidget({ 
  language, 
  L, 
  courses, 
  onCourseSelect,
  onCreateCustomCourse 
}) {
  const [currentIndex, setCurrentIndex] = useState(0)
  
  const handlePrevious = useCallback(() => {
    setCurrentIndex(prev => prev === 0 ? Math.max(0, courses.length - 3) : prev - 1)
  }, [courses.length])
  
  const handleNext = useCallback(() => {
    setCurrentIndex(prev => prev >= courses.length - 3 ? 0 : prev + 1)
  }, [courses.length])

  const handleCourseClick = (course) => {
    trackEvent('course_view', { courseId: course.id, category: course.category })
    onCourseSelect?.(course)
  }

  const handleCreateCourse = () => {
    trackEvent('custom_course_start')
    onCreateCustomCourse?.()
  }

  const visibleCourses = courses.slice(currentIndex, currentIndex + 3)

  if (courses.length === 0) {
    return (
      <div className="bg-white rounded-[6px] border border-[#E5E7EB] p-4">
        <p className="text-center text-[#6B7280] py-8">
          {L(language, { ko: '추천 코스를 불러오는 중...', zh: '加载推荐路线中...', en: 'Loading recommended courses...' })}
        </p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-[6px] border border-[#E5E7EB] p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base font-semibold text-[#111827]">
          {L(language, { ko: '추천 여행 코스', zh: '推荐旅游路线', en: 'Recommended Tours' })}
        </h3>
        
        {courses.length > 3 && (
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrevious}
              className="p-1.5 hover:bg-[#F3F4F6] rounded-[6px] transition-colors"
              disabled={currentIndex === 0}
            >
              <ChevronLeft className={`w-4 h-4 ${currentIndex === 0 ? 'text-[#D1D5DB]' : 'text-[#6B7280]'}`} />
            </button>
            <span className="text-xs text-[#9CA3AF] min-w-[40px] text-center">
              {currentIndex + 1}-{Math.min(currentIndex + 3, courses.length)}/{courses.length}
            </span>
            <button
              onClick={handleNext}
              className="p-1.5 hover:bg-[#F3F4F6] rounded-[6px] transition-colors"
              disabled={currentIndex >= courses.length - 3}
            >
              <ChevronRight className={`w-4 h-4 ${currentIndex >= courses.length - 3 ? 'text-[#D1D5DB]' : 'text-[#6B7280]'}`} />
            </button>
          </div>
        )}
      </div>

      {/* 코스 카드들 */}
      <div className="space-y-3">
        {visibleCourses.map((course, index) => (
          <button
            key={course.id}
            onClick={() => handleCourseClick(course)}
            className="w-full flex items-center gap-3 p-3 rounded-[6px] bg-[#F9FAFB] hover:bg-[#F3F4F6] active:bg-[#E5E7EB] transition-colors text-left"
          >
            <div className="text-2xl flex-shrink-0">
              {course.coverEmoji || '🗺️'}
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="font-medium text-[#111827] mb-1 leading-tight">
                {L(language, course.name)}
              </h4>
              <p className="text-sm text-[#6B7280] mb-1 leading-tight line-clamp-2">
                {L(language, course.description)}
              </p>
              <div className="flex items-center gap-2 text-xs text-[#9CA3AF]">
                <span>{course.duration || L(language, { ko: '반나절', zh: '半天', en: 'Half day' })}</span>
                <span>•</span>
                <span className="capitalize">{course.difficulty || 'easy'}</span>
                {course.estimatedCost && (
                  <>
                    <span>•</span>
                    <span>{L(language, course.estimatedCost)}</span>
                  </>
                )}
              </div>
            </div>
            <svg className="w-5 h-5 text-[#9CA3AF] flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M9 18l6-6-6-6"/>
            </svg>
          </button>
        ))}
      </div>

      {/* 나만의 코스 만들기 */}
      <div className="mt-4 pt-3 border-t border-[#E5E7EB]">
        <button
          onClick={handleCreateCourse}
          className="w-full flex items-center justify-center gap-2 p-3 rounded-[6px] border-2 border-dashed border-[#D1D5DB] hover:border-[#2D5A3D] text-[#6B7280] hover:text-[#2D5A3D] transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path d="M12 4v16m8-8H4"/>
          </svg>
          <span className="font-medium">
            {L(language, { ko: '나만의 코스 만들기', zh: '创建自定义路线', en: 'Create Custom Course' })}
          </span>
        </button>
      </div>

      {/* 인기 태그 */}
      <div className="mt-4">
        <p className="text-xs text-[#6B7280] mb-2">
          {L(language, { ko: '인기 테마', zh: '热门主题', en: 'Popular Themes' })}
        </p>
        <div className="flex flex-wrap gap-2">
          {['first', 'kpop', 'food', 'shopping'].map(theme => (
            <span 
              key={theme}
              className="px-2 py-1 text-xs bg-[#F3F4F6] text-[#6B7280] rounded-[4px]"
            >
              {L(language, {
                ko: theme === 'first' ? '첫방문' : theme === 'kpop' ? 'K-POP' : theme === 'food' ? '맛집' : '쇼핑',
                zh: theme === 'first' ? '初次' : theme === 'kpop' ? 'K-POP' : theme === 'food' ? '美食' : '购物',
                en: theme === 'first' ? 'First Visit' : theme === 'kpop' ? 'K-POP' : theme === 'food' ? 'Food' : 'Shopping'
              })}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}