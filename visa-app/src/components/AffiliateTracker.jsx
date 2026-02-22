import React, { useState, useEffect } from 'react'
import { generateRevenueReport } from '../utils/affiliateLinks'

const AffiliateTracker = () => {
  const [report, setReport] = useState({})
  const [totalClicks, setTotalClicks] = useState(0)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    // 개발 모드에서만 보이도록 설정
    if (import.meta.env.DEV || window.location.hostname === 'localhost') {
      setIsVisible(true)
    }
    
    loadReport()
    
    // 30초마다 리포트 업데이트
    const interval = setInterval(loadReport, 30000)
    return () => clearInterval(interval)
  }, [])

  const loadReport = () => {
    const newReport = generateRevenueReport()
    setReport(newReport)
    
    const total = Object.values(newReport).reduce((sum, platform) => sum + platform.clicks, 0)
    setTotalClicks(total)
  }

  const exportLogs = () => {
    const logs = JSON.parse(localStorage.getItem('affiliateClicks') || '[]')
    const blob = new Blob([JSON.stringify(logs, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    
    const a = document.createElement('a')
    a.href = url
    a.download = `affiliate-clicks-${new Date().toISOString().split('T')[0]}.json`
    a.click()
    
    URL.revokeObjectURL(url)
  }

  const clearLogs = () => {
    if (window.confirm('모든 클릭 로그를 삭제하시겠습니까?')) {
      localStorage.removeItem('affiliateClicks')
      loadReport()
    }
  }

  if (!isVisible) return null

  return (
    <div 
      className="fixed bottom-4 right-4 bg-white shadow-lg rounded-lg p-4 border border-gray-200 max-w-sm z-50"
      style={{ fontSize: '12px' }}
    >
      <div className="flex justify-between items-center mb-2">
        <h3 className="font-bold text-sm">어필리에이트 추적</h3>
        <button
          onClick={() => setIsVisible(false)}
          className="text-gray-400 hover:text-gray-600"
        >
          ✕
        </button>
      </div>
      
      <div className="mb-3">
        <div className="text-lg font-semibold text-blue-600">
          총 클릭: {totalClicks.toLocaleString()}회
        </div>
      </div>
      
      <div className="space-y-2 mb-3 max-h-48 overflow-y-auto">
        {Object.entries(report).map(([platform, data]) => (
          <div key={platform} className="bg-gray-50 p-2 rounded">
            <div className="flex justify-between items-center">
              <span className="font-medium capitalize">{platform}</span>
              <span className="text-blue-600 font-semibold">{data.clicks}</span>
            </div>
            <div className="text-xs text-gray-500">
              마지막: {data.lastClick ? new Date(data.lastClick).toLocaleString() : '-'}
            </div>
            <div className="text-xs text-gray-400">
              URL: {data.urls.length}개
            </div>
          </div>
        ))}
      </div>
      
      <div className="flex gap-2">
        <button
          onClick={exportLogs}
          className="px-2 py-1 bg-green-500 text-white rounded text-xs hover:bg-green-600"
        >
          내보내기
        </button>
        <button
          onClick={clearLogs}
          className="px-2 py-1 bg-red-500 text-white rounded text-xs hover:bg-red-600"
        >
          삭제
        </button>
        <button
          onClick={loadReport}
          className="px-2 py-1 bg-blue-500 text-white rounded text-xs hover:bg-blue-600"
        >
          새로고침
        </button>
      </div>
    </div>
  )
}

// 콘솔에서도 리포트 확인할 수 있는 전역 함수
if (typeof window !== 'undefined') {
  window.getAffiliateReport = () => {
    const report = generateRevenueReport()
    console.table(report)
    return report
  }
}

export default AffiliateTracker