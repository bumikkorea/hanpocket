import { useState, useEffect, useRef } from 'react'
import { Clock, MapPin } from 'lucide-react'

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

export default function CircularSchedule({ lang, schedules, onScheduleClick }) {
  const svgRef = useRef(null)
  const [selectedSchedule, setSelectedSchedule] = useState(null)

  const radius = 140
  const centerX = 160
  const centerY = 160
  const innerRadius = 100

  // Convert time to angle (0° = 12 o'clock)
  const timeToAngle = (timeStr) => {
    const [hours, minutes] = timeStr.split(':').map(Number)
    const totalMinutes = hours * 60 + minutes
    return (totalMinutes / (24 * 60)) * 360 - 90 // -90 to start from top
  }

  // Convert angle to coordinates
  const angleToCoords = (angle, r) => {
    const radian = (angle * Math.PI) / 180
    return {
      x: centerX + r * Math.cos(radian),
      y: centerY + r * Math.sin(radian)
    }
  }

  // Create SVG arc path
  const createArcPath = (startAngle, endAngle, innerR, outerR) => {
    const startAngleRad = (startAngle * Math.PI) / 180
    const endAngleRad = (endAngle * Math.PI) / 180
    
    const largeArc = endAngle - startAngle > 180 ? 1 : 0
    
    const x1 = centerX + outerR * Math.cos(startAngleRad)
    const y1 = centerY + outerR * Math.sin(startAngleRad)
    const x2 = centerX + outerR * Math.cos(endAngleRad)
    const y2 = centerY + outerR * Math.sin(endAngleRad)
    
    const x3 = centerX + innerR * Math.cos(endAngleRad)
    const y3 = centerY + innerR * Math.sin(endAngleRad)
    const x4 = centerX + innerR * Math.cos(startAngleRad)
    const y4 = centerY + innerR * Math.sin(startAngleRad)

    return `M ${x1} ${y1} A ${outerR} ${outerR} 0 ${largeArc} 1 ${x2} ${y2} L ${x3} ${y3} A ${innerR} ${innerR} 0 ${largeArc} 0 ${x4} ${y4} Z`
  }

  // Generate hour markers
  const hourMarkers = Array.from({ length: 24 }, (_, i) => {
    const angle = (i / 24) * 360 - 90
    const outerPoint = angleToCoords(angle, radius - 5)
    const innerPoint = angleToCoords(angle, radius - 15)
    const labelPoint = angleToCoords(angle, radius + 15)
    
    return {
      line: `M ${outerPoint.x} ${outerPoint.y} L ${innerPoint.x} ${innerPoint.y}`,
      label: {
        x: labelPoint.x,
        y: labelPoint.y,
        text: i === 0 ? '24' : i.toString()
      }
    }
  })

  // Process schedules into arcs
  const scheduleArcs = schedules.map(schedule => {
    const startAngle = timeToAngle(schedule.startTime)
    const endAngle = timeToAngle(schedule.endTime)
    
    // Handle overnight schedules
    let actualEndAngle = endAngle
    if (endAngle <= startAngle) {
      actualEndAngle = endAngle + 360
    }
    
    const path = createArcPath(startAngle, actualEndAngle, innerRadius, radius - 20)
    const color = CATEGORY_COLORS[schedule.category] || CATEGORY_COLORS.free
    
    // Calculate text position
    const midAngle = (startAngle + actualEndAngle) / 2
    const textRadius = (innerRadius + radius - 20) / 2
    const textPoint = angleToCoords(midAngle, textRadius)
    
    return {
      ...schedule,
      path,
      color,
      textPoint,
      startAngle,
      endAngle: actualEndAngle
    }
  })

  const handleScheduleClick = (schedule) => {
    setSelectedSchedule(schedule.id)
    onScheduleClick(schedule)
  }

  return (
    <div className="p-4">
      <div className="flex flex-col items-center">
        {/* SVG Clock */}
        <div className="relative">
          <svg 
            ref={svgRef}
            width="320" 
            height="320" 
            viewBox="0 0 320 320"
            className="drop-shadow-sm"
          >
            {/* Background circle */}
            <circle 
              cx={centerX} 
              cy={centerY} 
              r={radius} 
              fill="none" 
              stroke="#E5E7EB" 
              strokeWidth="1"
            />
            <circle 
              cx={centerX} 
              cy={centerY} 
              r={innerRadius} 
              fill="none" 
              stroke="#E5E7EB" 
              strokeWidth="1"
            />

            {/* Hour markers */}
            {hourMarkers.map((marker, i) => (
              <g key={i}>
                <path 
                  d={marker.line} 
                  stroke="#9CA3AF" 
                  strokeWidth={i % 6 === 0 ? "2" : "1"} 
                />
                <text 
                  x={marker.label.x} 
                  y={marker.label.y} 
                  textAnchor="middle" 
                  dominantBaseline="central"
                  fontSize="11" 
                  fill="#6B7280"
                  fontWeight={i % 6 === 0 ? "600" : "400"}
                >
                  {marker.label.text}
                </text>
              </g>
            ))}

            {/* Schedule arcs */}
            {scheduleArcs.map((arc, i) => (
              <g key={arc.id}>
                <path 
                  d={arc.path}
                  fill={arc.color}
                  opacity={selectedSchedule === arc.id ? "0.9" : "0.7"}
                  stroke="white"
                  strokeWidth="1"
                  className="cursor-pointer hover:opacity-90 transition-opacity"
                  onClick={() => handleScheduleClick(arc)}
                />
                
                {/* Schedule text (for major schedules) */}
                {(arc.endAngle - arc.startAngle) > 30 && (
                  <text 
                    x={arc.textPoint.x} 
                    y={arc.textPoint.y} 
                    textAnchor="middle" 
                    dominantBaseline="central"
                    fontSize="9" 
                    fill="white"
                    fontWeight="600"
                    className="pointer-events-none"
                    style={{ textShadow: '0 1px 2px rgba(0,0,0,0.3)' }}
                  >
                    {L(lang, arc.title).length > 12 
                      ? L(lang, arc.title).substring(0, 12) + '...' 
                      : L(lang, arc.title)
                    }
                  </text>
                )}
              </g>
            ))}

            {/* Center decoration */}
            <circle cx={centerX} cy={centerY} r="3" fill="#111827" />
            <circle cx={centerX} cy={centerY} r="1" fill="white" />
          </svg>

          {/* Current time indicator */}
          <div className="absolute top-2 right-2 bg-white rounded-lg px-2 py-1 shadow-sm border border-[#E5E7EB]">
            <div className="flex items-center gap-1 text-xs text-[#6B7280]">
              <Clock size={12} />
              <span>{new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' })}</span>
            </div>
          </div>
        </div>

        {/* Legend */}
        <div className="mt-4 w-full max-w-sm">
          <h4 className="text-sm font-semibold text-[#111827] mb-2">
            {L(lang, { ko: '일정 유형', zh: '行程类型', en: 'Schedule Types' })}
          </h4>
          <div className="grid grid-cols-2 gap-2">
            {Object.entries(CATEGORY_COLORS).map(([category, color]) => (
              <div key={category} className="flex items-center gap-2 text-xs">
                <div 
                  className="w-3 h-3 rounded-full" 
                  style={{ backgroundColor: color }}
                />
                <span className="text-[#6B7280]">{L(lang, CATEGORY_LABELS[category])}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Schedule summary */}
        {schedules.length > 0 && (
          <div className="mt-4 w-full bg-[#F9FAFB] rounded-lg p-3 border border-[#E5E7EB]">
            <h4 className="text-sm font-semibold text-[#111827] mb-2">
              {L(lang, { ko: '오늘의 일정', zh: '今日行程', en: 'Today\'s Schedule' })} ({schedules.length})
            </h4>
            <div className="space-y-1">
              {schedules.slice(0, 3).map(schedule => (
                <div key={schedule.id} className="flex items-center gap-2 text-xs">
                  <div 
                    className="w-2 h-2 rounded-full" 
                    style={{ backgroundColor: CATEGORY_COLORS[schedule.category] }}
                  />
                  <span className="font-medium">{schedule.startTime}</span>
                  <span className="text-[#6B7280]">{L(lang, schedule.title)}</span>
                  {schedule.location && (
                    <div className="flex items-center gap-1 text-[#9CA3AF] ml-auto">
                      <MapPin size={10} />
                      <span>{L(lang, schedule.location)}</span>
                    </div>
                  )}
                </div>
              ))}
              {schedules.length > 3 && (
                <div className="text-xs text-[#9CA3AF] text-center pt-1">
                  +{schedules.length - 3} {L(lang, { ko: '개 더', zh: '个更多', en: ' more' })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Empty state */}
        {schedules.length === 0 && (
          <div className="mt-4 text-center py-8">
            <Clock size={32} className="mx-auto text-[#D1D5DB] mb-2" />
            <p className="text-sm text-[#9CA3AF]">
              {L(lang, { ko: '오늘의 일정이 없습니다', zh: '今天没有行程安排', en: 'No schedules for today' })}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}