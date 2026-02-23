import { useState, useRef, useEffect } from 'react'
import { ArrowLeft, Download, Share2, Copy, Link2, Calendar, Clock, MapPin, CheckCircle } from 'lucide-react'

function L(lang, d) { if (typeof d === 'string') return d; return d?.[lang] || d?.en || d?.zh || d?.ko || '' }

const CATEGORY_COLORS = {
  flight: '#3B82F6',
  transport: '#10B981',  
  accommodation: '#8B5CF6',
  food: '#F59E0B',
  tourism: '#EF4444',
  shopping: '#EC4899',
  free: '#6B7280'
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

export default function TravelShareCard({ lang, trip, onBack }) {
  const cardRef = useRef(null)
  const [shareMode, setShareMode] = useState('image') // 'image' or 'link'
  const [isGenerating, setIsGenerating] = useState(false)
  const [shareUrl, setShareUrl] = useState('')
  const [copySuccess, setCopySuccess] = useState(false)

  // Calculate trip statistics
  const tripStats = {
    totalDays: trip.days,
    totalSchedules: Object.values(trip.schedules || {}).flat().length,
    categoryCounts: Object.values(trip.schedules || {})
      .flat()
      .reduce((acc, schedule) => {
        acc[schedule.category] = (acc[schedule.category] || 0) + 1
        return acc
      }, {}),
    destinations: [...new Set(
      Object.values(trip.schedules || {})
        .flat()
        .map(s => L(lang, s.location))
        .filter(Boolean)
    )].slice(0, 5) // Top 5 destinations
  }

  const formatDateRange = (startDate, endDate) => {
    const start = new Date(startDate)
    const end = new Date(endDate)
    
    const formatDate = (date) => {
      return `${date.getMonth() + 1}/${date.getDate()}`
    }

    return `${formatDate(start)} - ${formatDate(end)}`
  }

  const generateShareImage = async () => {
    setIsGenerating(true)
    
    try {
      // We'll use a simple approach - generate a data URL of the card content
      // In a real implementation, you would use html2canvas or similar library
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      
      canvas.width = 600
      canvas.height = 800
      
      // Background gradient
      const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height)
      gradient.addColorStop(0, '#111827')
      gradient.addColorStop(1, '#374151')
      ctx.fillStyle = gradient
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      
      // Add content programmatically
      ctx.fillStyle = '#FFFFFF'
      ctx.font = 'bold 32px system-ui'
      ctx.textAlign = 'center'
      ctx.fillText(L(lang, trip.name), canvas.width / 2, 80)
      
      ctx.font = '18px system-ui'
      ctx.fillText(formatDateRange(trip.startDate, trip.endDate), canvas.width / 2, 120)
      ctx.fillText(`${trip.days} ${L(lang, { ko: '일간', zh: '天', en: 'days' })}`, canvas.width / 2, 150)
      
      // Stats
      let y = 220
      Object.entries(tripStats.categoryCounts).forEach(([category, count]) => {
        ctx.fillStyle = CATEGORY_COLORS[category] || '#6B7280'
        ctx.fillRect(50, y - 15, 20, 20)
        
        ctx.fillStyle = '#FFFFFF'
        ctx.font = '16px system-ui'
        ctx.textAlign = 'left'
        ctx.fillText(`${L(lang, CATEGORY_LABELS[category])}: ${count}개`, 80, y)
        y += 40
      })
      
      // Watermark
      ctx.fillStyle = 'rgba(255, 255, 255, 0.5)'
      ctx.font = '14px system-ui'
      ctx.textAlign = 'center'
      ctx.fillText('HanPocket - 한국여행도우미', canvas.width / 2, canvas.height - 30)
      
      const dataUrl = canvas.toDataURL('image/png')
      
      // Trigger download
      const link = document.createElement('a')
      link.download = `${L(lang, trip.name)}_schedule.png`
      link.href = dataUrl
      link.click()
      
    } catch (error) {
      console.error('Failed to generate image:', error)
      alert(L(lang, { ko: '이미지 생성에 실패했습니다', zh: '图片生成失败', en: 'Failed to generate image' }))
    } finally {
      setIsGenerating(false)
    }
  }

  const generateShareLink = () => {
    // Generate a shareable link (in real app, this would create a public URL)
    const tripData = encodeURIComponent(JSON.stringify({
      name: trip.name,
      startDate: trip.startDate,
      endDate: trip.endDate,
      days: trip.days,
      schedules: trip.schedules
    }))
    
    const baseUrl = window.location.origin
    const shareUrl = `${baseUrl}/travel/shared?data=${tripData}`
    
    setShareUrl(shareUrl)
  }

  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopySuccess(true)
      setTimeout(() => setCopySuccess(false), 2000)
    } catch (error) {
      // Fallback for older browsers
      const textArea = document.createElement('textarea')
      textArea.value = text
      document.body.appendChild(textArea)
      textArea.select()
      document.execCommand('copy')
      document.body.removeChild(textArea)
      setCopySuccess(true)
      setTimeout(() => setCopySuccess(false), 2000)
    }
  }

  useEffect(() => {
    if (shareMode === 'link') {
      generateShareLink()
    }
  }, [shareMode])

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button onClick={onBack} className="p-1 hover:bg-[#F3F4F6] rounded-lg transition-colors">
          <ArrowLeft size={20} className="text-[#6B7280]" />
        </button>
        <h2 className="text-lg font-bold text-[#111827]">
          {L(lang, { ko: '여행 일정 공유', zh: '分享旅行行程', en: 'Share Travel Schedule' })}
        </h2>
      </div>

      {/* Share mode selector */}
      <div className="flex items-center gap-2 bg-white rounded-lg p-1 border border-[#E5E7EB]">
        <button 
          onClick={() => setShareMode('image')}
          className={`flex-1 flex items-center gap-2 px-3 py-2 rounded-md text-sm font-semibold transition-all ${
            shareMode === 'image' 
              ? 'bg-[#111827] text-white' 
              : 'text-[#6B7280] hover:bg-[#F3F4F6]'
          }`}
        >
          <Download size={16} />
          {L(lang, { ko: '이미지로 저장', zh: '保存为图片', en: 'Save as Image' })}
        </button>
        <button 
          onClick={() => setShareMode('link')}
          className={`flex-1 flex items-center gap-2 px-3 py-2 rounded-md text-sm font-semibold transition-all ${
            shareMode === 'link' 
              ? 'bg-[#111827] text-white' 
              : 'text-[#6B7280] hover:bg-[#F3F4F6]'
          }`}
        >
          <Link2 size={16} />
          {L(lang, { ko: '링크 공유', zh: '链接分享', en: 'Share Link' })}
        </button>
      </div>

      {/* Preview Card */}
      <div ref={cardRef} className="bg-gradient-to-br from-[#111827] to-[#374151] rounded-2xl p-6 text-white shadow-xl">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="bg-white bg-opacity-20 backdrop-blur-sm rounded-full px-4 py-1 mb-4 inline-block">
            <span className="text-sm font-medium">HanPocket</span>
          </div>
          <h2 className="text-2xl font-bold mb-2">{L(lang, trip.name)}</h2>
          <div className="flex items-center justify-center gap-4 text-sm opacity-90">
            <div className="flex items-center gap-1">
              <Calendar size={14} />
              <span>{formatDateRange(trip.startDate, trip.endDate)}</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock size={14} />
              <span>{trip.days} {L(lang, { ko: '일', zh: '天', en: 'days' })}</span>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-xl p-4">
            <div className="text-2xl font-bold">{tripStats.totalSchedules}</div>
            <div className="text-sm opacity-75">{L(lang, { ko: '총 일정', zh: '总行程', en: 'Total Schedules' })}</div>
          </div>
          <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-xl p-4">
            <div className="text-2xl font-bold">{tripStats.destinations.length}</div>
            <div className="text-sm opacity-75">{L(lang, { ko: '방문지', zh: '访问地', en: 'Destinations' })}</div>
          </div>
        </div>

        {/* Category breakdown */}
        <div className="mb-6">
          <h3 className="font-semibold mb-3">{L(lang, { ko: '일정 분포', zh: '行程分布', en: 'Schedule Distribution' })}</h3>
          <div className="space-y-2">
            {Object.entries(tripStats.categoryCounts).map(([category, count]) => (
              <div key={category} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: CATEGORY_COLORS[category] }}
                  />
                  <span className="text-sm">{L(lang, CATEGORY_LABELS[category])}</span>
                </div>
                <span className="text-sm font-semibold">{count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Top destinations */}
        {tripStats.destinations.length > 0 && (
          <div className="mb-4">
            <h3 className="font-semibold mb-3">{L(lang, { ko: '주요 방문지', zh: '主要访问地', en: 'Main Destinations' })}</h3>
            <div className="flex flex-wrap gap-2">
              {tripStats.destinations.map((destination, index) => (
                <div key={index} className="flex items-center gap-1 bg-white bg-opacity-10 backdrop-blur-sm rounded-full px-3 py-1">
                  <MapPin size={12} />
                  <span className="text-sm">{destination}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="text-center pt-4 border-t border-white border-opacity-20">
          <div className="text-xs opacity-75">
            {L(lang, { ko: '한국 여행의 모든 것', zh: '韩国旅行的一切', en: 'Everything for Korea Travel' })}
          </div>
        </div>
      </div>

      {/* Action buttons */}
      {shareMode === 'image' && (
        <div className="space-y-3">
          <button
            onClick={generateShareImage}
            disabled={isGenerating}
            className={`w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-semibold transition-colors ${
              isGenerating 
                ? 'bg-[#9CA3AF] text-white cursor-not-allowed' 
                : 'bg-[#111827] text-white hover:bg-[#1F2937]'
            }`}
          >
            <Download size={16} />
            {isGenerating ? 
              L(lang, { ko: '생성 중...', zh: '生成中...', en: 'Generating...' }) :
              L(lang, { ko: '이미지 다운로드', zh: '下载图片', en: 'Download Image' })
            }
          </button>
          
          <p className="text-xs text-[#6B7280] text-center">
            {L(lang, { 
              ko: '고해상도 이미지로 저장하여 SNS에 공유하세요', 
              zh: '保存为高分辨率图片并在社交媒体上分享', 
              en: 'Save as high-resolution image and share on social media' 
            })}
          </p>
        </div>
      )}

      {shareMode === 'link' && (
        <div className="space-y-3">
          <div className="bg-white rounded-lg border border-[#E5E7EB] p-3">
            <div className="flex items-center gap-2 text-xs text-[#6B7280] mb-2">
              <Link2 size={12} />
              {L(lang, { ko: '공유 링크', zh: '分享链接', en: 'Share Link' })}
            </div>
            <div className="flex items-center gap-2">
              <input 
                type="text" 
                value={shareUrl}
                readOnly 
                className="flex-1 text-sm bg-[#F3F4F6] border-none outline-none px-3 py-2 rounded"
              />
              <button
                onClick={() => copyToClipboard(shareUrl)}
                className={`flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-semibold transition-colors ${
                  copySuccess 
                    ? 'bg-green-100 text-green-700' 
                    : 'bg-[#111827] text-white hover:bg-[#1F2937]'
                }`}
              >
                {copySuccess ? <CheckCircle size={14} /> : <Copy size={14} />}
                {copySuccess ? 
                  L(lang, { ko: '복사됨', zh: '已复制', en: 'Copied' }) :
                  L(lang, { ko: '복사', zh: '复制', en: 'Copy' })
                }
              </button>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => copyToClipboard(shareUrl)}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              <Share2 size={16} />
              {L(lang, { ko: '링크 공유', zh: '分享链接', en: 'Share Link' })}
            </button>
          </div>
          
          <p className="text-xs text-[#6B7280] text-center">
            {L(lang, { 
              ko: '이 링크를 통해 다른 사람들이 당신의 여행 일정을 볼 수 있습니다', 
              zh: '通过此链接，其他人可以查看您的旅行行程', 
              en: 'Others can view your travel schedule through this link' 
            })}
          </p>
        </div>
      )}
    </div>
  )
}