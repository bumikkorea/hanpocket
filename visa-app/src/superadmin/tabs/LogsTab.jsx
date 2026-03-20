import { AlertCircle, CheckCircle, Info, Download } from 'lucide-react'
import { useState } from 'react'

export default function LogsTab() {
  const [filterLevel, setFilterLevel] = useState('all')

  const logs = [
    { id: 1, level: 'error', message: 'Payment processing failed', timestamp: '2026-03-20 14:32', user: 'System' },
    { id: 2, level: 'warning', message: 'High API usage detected', timestamp: '2026-03-20 14:28', user: 'System' },
    { id: 3, level: 'info', message: 'User kim@example.com logged in', timestamp: '2026-03-20 14:20', user: 'kim@example.com' },
    { id: 4, level: 'error', message: 'Database connection timeout', timestamp: '2026-03-20 14:15', user: 'System' },
    { id: 5, level: 'info', message: 'Hotel registration approved', timestamp: '2026-03-20 14:10', user: 'admin1@example.com' },
    { id: 6, level: 'warning', message: 'Suspicious login attempt blocked', timestamp: '2026-03-20 13:55', user: 'System' },
    { id: 7, level: 'info', message: 'Backup completed successfully', timestamp: '2026-03-20 13:30', user: 'System' },
  ]

  const filteredLogs = logs.filter(log => filterLevel === 'all' || log.level === filterLevel)

  const getLevelIcon = (level) => {
    switch (level) {
      case 'error':
        return <AlertCircle size={18} className="text-red-500" />
      case 'warning':
        return <AlertCircle size={18} className="text-yellow-500" />
      case 'info':
        return <Info size={18} className="text-blue-500" />
      default:
        return <CheckCircle size={18} className="text-green-500" />
    }
  }

  const getLevelBg = (level) => {
    switch (level) {
      case 'error':
        return 'bg-red-50'
      case 'warning':
        return 'bg-yellow-50'
      case 'info':
        return 'bg-blue-50'
      default:
        return 'bg-green-50'
    }
  }

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="flex gap-2">
          <button
            onClick={() => setFilterLevel('all')}
            className={`px-4 py-2 rounded-lg transition-colors text-sm font-medium ${
              filterLevel === 'all'
                ? 'bg-blue-600 text-white'
                : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
            }`}
          >
            모든 로그
          </button>
          <button
            onClick={() => setFilterLevel('error')}
            className={`px-4 py-2 rounded-lg transition-colors text-sm font-medium ${
              filterLevel === 'error'
                ? 'bg-red-600 text-white'
                : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
            }`}
          >
            에러
          </button>
          <button
            onClick={() => setFilterLevel('warning')}
            className={`px-4 py-2 rounded-lg transition-colors text-sm font-medium ${
              filterLevel === 'warning'
                ? 'bg-yellow-600 text-white'
                : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
            }`}
          >
            경고
          </button>
        </div>
        <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium text-sm flex items-center gap-2">
          <Download size={18} />
          내보내기
        </button>
      </div>

      {/* Logs List */}
      <div className="space-y-2">
        {filteredLogs.map((log) => (
          <div key={log.id} className={`${getLevelBg(log.level)} rounded-lg border border-gray-200 p-4`}>
            <div className="flex items-start gap-3">
              {getLevelIcon(log.level)}
              <div className="flex-1">
                <p className="font-medium text-gray-900">{log.message}</p>
                <div className="flex flex-wrap gap-4 mt-2 text-xs text-gray-600">
                  <span>시간: {log.timestamp}</span>
                  <span>사용자: {log.user}</span>
                </div>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                log.level === 'error' ? 'bg-red-100 text-red-800' :
                log.level === 'warning' ? 'bg-yellow-100 text-yellow-800' :
                'bg-blue-100 text-blue-800'
              }`}>
                {log.level.toUpperCase()}
              </span>
            </div>
          </div>
        ))}
      </div>

      {filteredLogs.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">로그가 없습니다.</p>
        </div>
      )}
    </div>
  )
}
