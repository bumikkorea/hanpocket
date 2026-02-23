import { useState, useRef } from 'react'
import { Clock, MapPin, Move, Plane, Train, Car, Bus, Bike, Navigation } from 'lucide-react'

function L(lang, d) { if (typeof d === 'string') return d; return d?.[lang] || d?.en || d?.zh || d?.ko || '' }

const CATEGORY_COLORS = {
  flight: '#3B82F6',      // Blue
  transport: '#10B981',   // Green  
  accommodation: '#8B5CF6', // Purple
  food: '#F59E0B',        // Orange
  tourism: '#EF4444',     // Red
  shopping: '#EC4899',    // Pink
  free: '#6B7280'         // Gray
}

const CATEGORY_LABELS = {
  flight: { ko: '비행기', zh: '飞机', en: 'Flight' },
  transport: { ko: '이동', zh: '交通', en: 'Transport' },
  accommodation: { ko: '숙소', zh: '住宿', en: 'Accommodation' },
  food: { ko: '식사', zh: '餐饮', en: 'Food' },
  tourism: { ko: '관광', zh: '观光', en: 'Tourism' },
  shopping: { ko: '쇼핑', zh: '购物', en: 'Shopping' },
  free: { ko: '자유시간', zh: '自由时间', en: 'Free Time' }
}

const TRANSPORT_ICONS = {
  walk: Navigation,
  subway: Train,
  bus: Bus,
  taxi: Car,
  flight: Plane,
  ktx: Train,
  arex: Train,
  bike: Bike,
  cable_car: Navigation
}

const TRANSPORT_LABELS = {
  walk: { ko: '도보', zh: '步行', en: 'Walk' },
  subway: { ko: '지하철', zh: '地铁', en: 'Subway' },
  bus: { ko: '버스', zh: '公交', en: 'Bus' },
  taxi: { ko: '택시', zh: '出租车', en: 'Taxi' },
  flight: { ko: '비행기', zh: '飞机', en: 'Flight' },
  ktx: { ko: 'KTX', zh: 'KTX', en: 'KTX' },
  arex: { ko: '공항철도', zh: '机场铁路', en: 'AREX' },
  bike: { ko: '자전거', zh: '自行车', en: 'Bike' },
  cable_car: { ko: '케이블카', zh: '缆车', en: 'Cable Car' }
}

export default function DailyScheduleList({ lang, schedules, onScheduleClick, onScheduleUpdate }) {
  const [draggedIndex, setDraggedIndex] = useState(null)
  const [dragOverIndex, setDragOverIndex] = useState(null)
  const draggedItem = useRef(null)

  // Sort schedules by start time
  const sortedSchedules = [...schedules].sort((a, b) => 
    a.startTime.localeCompare(b.startTime)
  )

  const handleDragStart = (e, index) => {
    setDraggedIndex(index)
    draggedItem.current = sortedSchedules[index]
    e.dataTransfer.effectAllowed = 'move'
  }

  const handleDragOver = (e, index) => {
    e.preventDefault()
    if (draggedIndex !== index) {
      setDragOverIndex(index)
    }
  }

  const handleDragEnd = () => {
    if (draggedIndex !== null && dragOverIndex !== null && draggedIndex !== dragOverIndex) {
      const newSchedules = [...sortedSchedules]
      const draggedSchedule = newSchedules[draggedIndex]
      
      // Remove dragged item
      newSchedules.splice(draggedIndex, 1)
      
      // Insert at new position
      newSchedules.splice(dragOverIndex, 0, draggedSchedule)
      
      // Update with new order
      onScheduleUpdate(newSchedules)
    }
    
    setDraggedIndex(null)
    setDragOverIndex(null)
    draggedItem.current = null
  }

  const formatDuration = (startTime, endTime) => {
    const start = new Date(`2000-01-01T${startTime}`)
    let end = new Date(`2000-01-01T${endTime}`)
    
    // Handle overnight schedules
    if (end <= start) {
      end.setDate(end.getDate() + 1)
    }
    
    const diffMs = end - start
    const hours = Math.floor(diffMs / (1000 * 60 * 60))
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60))
    
    if (hours === 0) {
      return `${minutes}분`
    } else if (minutes === 0) {
      return `${hours}시간`
    } else {
      return `${hours}시간 ${minutes}분`
    }
  }

  const TransportIcon = ({ transport }) => {
    const IconComponent = TRANSPORT_ICONS[transport] || Navigation
    return <IconComponent size={14} />
  }

  return (
    <div className="p-4">
      {sortedSchedules.length === 0 ? (
        <div className="text-center py-12">
          <Clock size={32} className="mx-auto text-[#D1D5DB] mb-2" />
          <p className="text-sm text-[#9CA3AF] mb-1">
            {L(lang, { ko: '오늘의 일정이 없습니다', zh: '今天没有行程安排', en: 'No schedules for today' })}
          </p>
          <p className="text-xs text-[#D1D5DB]">
            {L(lang, { ko: '+ 버튼을 눌러 일정을 추가해보세요', zh: '点击+按钮添加行程', en: 'Tap + button to add schedule' })}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {/* Timeline header */}
          <div className="flex items-center gap-3 pb-2 border-b border-[#E5E7EB]">
            <Clock size={16} className="text-[#6B7280]" />
            <span className="text-sm font-semibold text-[#111827]">
              {L(lang, { ko: '일정 타임라인', zh: '行程时间线', en: 'Schedule Timeline' })} ({sortedSchedules.length})
            </span>
          </div>

          {/* Schedule items */}
          <div className="space-y-2">
            {sortedSchedules.map((schedule, index) => (
              <div
                key={schedule.id}
                draggable
                onDragStart={(e) => handleDragStart(e, index)}
                onDragOver={(e) => handleDragOver(e, index)}
                onDragEnd={handleDragEnd}
                onClick={() => onScheduleClick(schedule)}
                className={`bg-white border border-[#E5E7EB] rounded-xl p-3 cursor-pointer hover:shadow-md transition-all ${
                  dragOverIndex === index ? 'border-[#111827] shadow-md' : ''
                } ${draggedIndex === index ? 'opacity-50' : ''}`}
              >
                <div className="flex items-start gap-3">
                  {/* Drag handle & category indicator */}
                  <div className="flex flex-col items-center gap-1 pt-0.5">
                    <Move size={14} className="text-[#9CA3AF] cursor-grab active:cursor-grabbing" />
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: CATEGORY_COLORS[schedule.category] || CATEGORY_COLORS.free }}
                    />
                  </div>

                  {/* Time */}
                  <div className="flex flex-col items-center min-w-[60px] pt-1">
                    <div className="text-sm font-bold text-[#111827]">{schedule.startTime}</div>
                    <div className="text-xs text-[#9CA3AF]">
                      {formatDuration(schedule.startTime, schedule.endTime)}
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-1">
                      <h3 className="font-semibold text-[#111827] text-sm leading-tight">
                        {L(lang, schedule.title)}
                      </h3>
                      <span className="text-xs px-2 py-0.5 rounded-full text-white font-medium ml-2 shrink-0" 
                            style={{ backgroundColor: CATEGORY_COLORS[schedule.category] || CATEGORY_COLORS.free }}>
                        {L(lang, CATEGORY_LABELS[schedule.category])}
                      </span>
                    </div>

                    {/* Location & Transport */}
                    <div className="flex items-center justify-between text-xs text-[#6B7280] mb-2">
                      {schedule.location && (
                        <div className="flex items-center gap-1">
                          <MapPin size={12} />
                          <span>{L(lang, schedule.location)}</span>
                        </div>
                      )}
                      
                      {schedule.transport && (
                        <div className="flex items-center gap-1 ml-auto">
                          <TransportIcon transport={schedule.transport} />
                          <span>{L(lang, TRANSPORT_LABELS[schedule.transport])}</span>
                        </div>
                      )}
                    </div>

                    {/* Notes preview */}
                    {schedule.notes && (
                      <p className="text-xs text-[#9CA3AF] line-clamp-1">
                        {L(lang, schedule.notes)}
                      </p>
                    )}
                  </div>
                </div>

                {/* Connection line to next schedule */}
                {index < sortedSchedules.length - 1 && (
                  <div className="flex items-center gap-2 mt-3 pt-2 border-t border-[#F3F4F6]">
                    <div className="w-3"></div> {/* Spacer for drag handle */}
                    <div className="flex items-center gap-2 text-xs text-[#9CA3AF]">
                      <div className="w-8 h-px bg-[#E5E7EB]"></div>
                      <span>
                        {(() => {
                          const currentEnd = schedule.endTime
                          const nextStart = sortedSchedules[index + 1].startTime
                          const gap = formatDuration(currentEnd, nextStart)
                          return `${gap} ${L(lang, { ko: '후', zh: '后', en: 'later' })}`
                        })()}
                      </span>
                      <div className="w-8 h-px bg-[#E5E7EB]"></div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Daily summary */}
          <div className="bg-[#F9FAFB] border border-[#E5E7EB] rounded-xl p-3 mt-4">
            <h4 className="text-sm font-semibold text-[#111827] mb-2">
              {L(lang, { ko: '하루 요약', zh: '一天总结', en: 'Daily Summary' })}
            </h4>
            
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <span className="text-[#6B7280]">{L(lang, { ko: '시작시간', zh: '开始时间', en: 'Start' })}: </span>
                <span className="font-semibold text-[#111827]">
                  {sortedSchedules.length > 0 ? sortedSchedules[0].startTime : '-'}
                </span>
              </div>
              <div>
                <span className="text-[#6B7280]">{L(lang, { ko: '종료시간', zh: '结束时间', en: 'End' })}: </span>
                <span className="font-semibold text-[#111827]">
                  {sortedSchedules.length > 0 ? sortedSchedules[sortedSchedules.length - 1].endTime : '-'}
                </span>
              </div>
            </div>

            <div className="flex flex-wrap gap-1.5 mt-2">
              {Object.entries(
                sortedSchedules.reduce((acc, schedule) => {
                  acc[schedule.category] = (acc[schedule.category] || 0) + 1
                  return acc
                }, {})
              ).map(([category, count]) => (
                <div key={category} className="flex items-center gap-1 text-xs">
                  <div 
                    className="w-2 h-2 rounded-full" 
                    style={{ backgroundColor: CATEGORY_COLORS[category] }}
                  />
                  <span className="text-[#6B7280]">
                    {L(lang, CATEGORY_LABELS[category])} {count}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}