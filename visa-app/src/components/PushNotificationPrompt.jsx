import React from 'react'

export default function PushNotificationPrompt({ 
  pushEnabled, 
  pushDismissed, 
  lang, 
  onEnablePush, 
  onDismiss 
}) {
  if (pushEnabled || pushDismissed) return null

  return (
    <div className="fixed bottom-24 left-4 right-4 bg-[#111827] text-white p-4 rounded-lg shadow-lg z-30">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium">
            {lang === 'ko' ? '비자 만료 알림을 받으시겠습니까?' : 
             lang === 'zh' ? '是否接收签证过期提醒？' : 'Get visa expiry notifications?'}
          </p>
        </div>
        <div className="flex gap-2 ml-3">
          <button 
            onClick={onEnablePush}
            className="bg-white text-[#111827] text-xs px-3 py-1.5 rounded font-medium"
          >
            {lang === 'ko' ? '허용' : lang === 'zh' ? '允许' : 'Allow'}
          </button>
          <button 
            onClick={onDismiss}
            className="text-white text-xs px-3 py-1.5 rounded border border-white/20"
          >
            {lang === 'ko' ? '나중에' : lang === 'zh' ? '稍后' : 'Later'}
          </button>
        </div>
      </div>
    </div>
  )
}