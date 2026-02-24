import { useState } from 'react'
import { isPushSupported, subscribePush, cacheVisaProfile, scheduleDdayCheck, registerPeriodicSync } from '../utils/pushNotification'

export function useNotification() {
  const [pushEnabled, setPushEnabled] = useState(() => {
    return typeof Notification !== 'undefined' && Notification.permission === 'granted'
  })
  
  const [pushDismissed, setPushDismissed] = useState(() => {
    return localStorage.getItem('hp_push_dismissed') === 'true'
  })

  const handleEnablePush = async (lang, profile) => {
    if (!isPushSupported()) {
      const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent)
      if (isIOS) {
        alert(lang === 'ko' ? 'Safari에서 하단 공유 버튼 → "홈 화면에 추가"를 먼저 해주세요. 앱으로 설치해야 알림을 받을 수 있습니다.' : lang === 'zh' ? '请先在Safari中点击底部分享按钮→"添加到主屏幕"。安装为App后才能接收通知。' : 'Please tap Share → "Add to Home Screen" in Safari first. Notifications require the app to be installed.')
      } else {
        alert(lang === 'ko' ? '이 브라우저에서는 알림을 지원하지 않습니다.' : lang === 'zh' ? '此浏览器不支持通知。' : 'Notifications are not supported in this browser.')
      }
      return
    }
    
    const sub = await subscribePush()
    if (sub) {
      setPushEnabled(true)
      if (profile?.visaExpiry) {
        await cacheVisaProfile(profile)
        scheduleDdayCheck(profile.visaExpiry)
      }
      await registerPeriodicSync()
    }
  }

  const dismissPushPrompt = () => {
    localStorage.setItem('hp_push_dismissed', 'true')
    setPushDismissed(true)
  }

  return {
    pushEnabled,
    pushDismissed,
    setPushEnabled,
    handleEnablePush,
    dismissPushPrompt
  }
}