// ─── Push Notification Manager ───

const VAPID_PUBLIC_KEY = import.meta.env.VITE_VAPID_PUBLIC_KEY

// Convert VAPID key to Uint8Array
function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  const rawData = window.atob(base64)
  const outputArray = new Uint8Array(rawData.length)
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i)
  }
  return outputArray
}

// Check if push is supported
export function isPushSupported() {
  return 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window
}

// Get current permission state
export function getPermissionState() {
  if (!('Notification' in window)) return 'unsupported'
  return Notification.permission // 'default' | 'granted' | 'denied'
}

// Request notification permission
export async function requestPermission() {
  if (!('Notification' in window)) return 'unsupported'
  const result = await Notification.requestPermission()
  return result
}

// Subscribe to push notifications
export async function subscribePush() {
  try {
    if (!isPushSupported()) {
      console.warn('Push not supported')
      return null
    }

    const permission = await requestPermission()
    if (permission !== 'granted') {
      console.warn('Notification permission denied')
      return null
    }

    const registration = await navigator.serviceWorker.ready
    
    // Check existing subscription
    let subscription = await registration.pushManager.getSubscription()
    
    if (!subscription) {
      subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY)
      })
    }

    // Save subscription to localStorage (and later sync to server)
    const subJson = subscription.toJSON()
    localStorage.setItem('hp_push_subscription', JSON.stringify(subJson))
    
    // Send subscription to push server
    try {
      await fetch('https://hanpocket-push.bumik-korea.workers.dev/api/push/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subscription: subJson, userId: localStorage.getItem('hp_user_id') || subJson.endpoint })
      })
    } catch (e) { console.warn('Push subscribe sync failed:', e) }

    return subscription
  } catch (err) {
    console.error('Push subscription failed:', err)
    return null
  }
}

// Unsubscribe
export async function unsubscribePush() {
  try {
    const registration = await navigator.serviceWorker.ready
    const subscription = await registration.pushManager.getSubscription()
    if (subscription) {
      await subscription.unsubscribe()
      localStorage.removeItem('hp_push_subscription')
      return true
    }
    return false
  } catch (err) {
    console.error('Unsubscribe failed:', err)
    return false
  }
}

// Send local notification (for immediate alerts when app is open)
export function showLocalNotification(title, body, options = {}) {
  if (Notification.permission !== 'granted') return
  
  navigator.serviceWorker.ready.then(reg => {
    reg.showNotification(title, {
      body,
      icon: '/icon.svg',
      badge: '/icon.svg',
      vibrate: [200, 100, 200],
      tag: options.tag || 'hanpocket-local',
      renotify: true,
      data: { url: options.url || '/', type: options.type || 'general' },
      ...options
    })
  })
}

// Register periodic background sync for visa D-day
export async function registerPeriodicSync() {
  try {
    const registration = await navigator.serviceWorker.ready
    if ('periodicSync' in registration) {
      const status = await navigator.permissions.query({ name: 'periodic-background-sync' })
      if (status.state === 'granted') {
        await registration.periodicSync.register('visa-dday-check', {
          minInterval: 12 * 60 * 60 * 1000 // 12 hours
        })
        return true
      }
    }
    return false
  } catch {
    return false
  }
}

// Save visa profile to cache (for SW to read during periodic sync)
export async function cacheVisaProfile(profile) {
  try {
    const cache = await caches.open('hanpocket-data')
    await cache.put('/data/visa-profile', new Response(JSON.stringify(profile)))
    return true
  } catch {
    return false
  }
}

// Schedule D-day check alarm (fallback for browsers without periodic sync)
export function scheduleDdayCheck(visaExpiry) {
  if (!visaExpiry) return

  const checkIntervals = [90, 60, 30, 14, 7, 3, 1] // days before expiry
  const now = new Date()
  const expiry = new Date(visaExpiry)

  checkIntervals.forEach(days => {
    const alertDate = new Date(expiry.getTime() - days * 86400000)
    const delay = alertDate.getTime() - now.getTime()
    
    if (delay > 0 && delay < 30 * 86400000) { // Only schedule within next 30 days
      setTimeout(() => {
        showLocalNotification(
          'HanPocket 비자 알림',
          `비자 만료 D-${days}일! ${days <= 7 ? '긴급 연장 준비하세요!' : '연장 서류를 준비하세요.'}`,
          { tag: `visa-dday-${days}`, url: '/?tab=visaalert', type: 'visa' }
        )
      }, delay)
    }
  })
}
