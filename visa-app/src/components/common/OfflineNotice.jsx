import { useState, useEffect } from 'react'
import { WifiOff } from 'lucide-react'

function L(lang, d) { if (typeof d === 'string') return d; return d?.[lang] || d?.en || d?.zh || d?.ko || '' }

export default function OfflineNotice({ lang }) {
  const [isOffline, setIsOffline] = useState(!navigator.onLine)

  useEffect(() => {
    const goOffline = () => setIsOffline(true)
    const goOnline = () => setIsOffline(false)
    window.addEventListener('offline', goOffline)
    window.addEventListener('online', goOnline)
    return () => {
      window.removeEventListener('offline', goOffline)
      window.removeEventListener('online', goOnline)
    }
  }, [])

  if (!isOffline) return null

  return (
    <div className="bg-amber-50 border-b border-amber-200 px-4 py-2.5 flex items-center gap-2 animate-slideDown">
      <WifiOff size={16} className="text-amber-600 shrink-0" />
      <p className="text-xs text-amber-800">
        {L(lang, {
          ko: '인터넷 연결이 없습니다. 일부 기능이 제한됩니다.',
          zh: '网络未连接，部分功能受限。',
          en: 'No internet connection. Some features may be limited.'
        })}
      </p>
    </div>
  )
}
