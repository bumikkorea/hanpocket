const CACHE_NAME = 'hanpocket-v4'
const STATIC_ASSETS = ['/', '/index.html']
const USER_PROFILE_CACHE = 'hanpocket-userdata-v4'

// Install — skip waiting immediately
self.addEventListener('install', e => {
  self.skipWaiting()
})

// Activate
self.addEventListener('activate', e => {
  e.waitUntil(
    (async () => {
      // Clear old caches
      const keys = await caches.keys()
      await Promise.all(
        keys.filter(k => k !== CACHE_NAME && k !== USER_PROFILE_CACHE)
          .map(k => caches.delete(k))
      )
      
      // Force reload all tabs to get new version
      const windowClients = await self.clients.matchAll({ type: 'window' })
      for (const client of windowClients) {
        client.postMessage({ type: 'SW_UPDATED', action: 'reload' })
      }
      
      // Take immediate control
      await self.clients.claim()
    })()
  )
})

// Fetch — cache-first for static, network-first for API and user data
self.addEventListener('fetch', e => {
  const url = new URL(e.request.url)
  
  // Check if this is a user profile/info request (내정보 탭 관련)
  const isUserDataRequest = url.pathname.includes('/profile') || 
                           url.pathname.includes('/user') || 
                           url.pathname.includes('/myinfo') ||
                           url.searchParams.has('tab') && url.searchParams.get('tab') === 'profile'
  
  if (url.pathname.startsWith('/api') || url.hostname !== location.hostname || isUserDataRequest) {
    // Network-first for API calls and user data
    e.respondWith(
      (async () => {
        try {
          const response = await fetch(e.request)
          
          // Cache user profile data in separate cache with shorter TTL
          if (isUserDataRequest && response.ok) {
            const cache = await caches.open(USER_PROFILE_CACHE)
            const responseClone = response.clone()
            await cache.put(e.request, responseClone)
          }
          
          return response
        } catch {
          // Fallback to cache
          return await caches.match(e.request) || new Response('Offline', { status: 503 })
        }
      })()
    )
  } else {
    // Network-first for ALL requests — always show latest version
    e.respondWith(
      (async () => {
        try {
          const response = await fetch(e.request)
          if (response.ok) {
            const cache = await caches.open(CACHE_NAME)
            cache.put(e.request, response.clone())
          }
          return response
        } catch {
          return await caches.match(e.request) || new Response('Offline', { status: 503 })
        }
      })()
    )
  }
})

// ─── Push Notification ───
self.addEventListener('push', e => {
  let data = { title: 'HanPocket', body: '새로운 알림이 있습니다.', icon: '/icon.svg', badge: '/icon.svg' }
  
  if (e.data) {
    try {
      const payload = e.data.json()
      data = { ...data, ...payload }
    } catch {
      data.body = e.data.text()
    }
  }

  const options = {
    body: data.body,
    icon: data.icon || '/icon.svg',
    badge: data.badge || '/icon.svg',
    vibrate: [200, 100, 200],
    tag: data.tag || 'hanpocket-notification',
    renotify: true,
    data: {
      url: data.url || '/',
      type: data.type || 'general'
    },
    actions: data.actions || []
  }

  e.waitUntil(
    self.registration.showNotification(data.title, options)
  )
})

// ─── Notification Click ───
self.addEventListener('notificationclick', e => {
  e.notification.close()
  
  const url = e.notification.data?.url || '/'
  
  e.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(windowClients => {
      for (const client of windowClients) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          client.postMessage({ type: 'NOTIFICATION_CLICK', url, data: e.notification.data })
          return client.focus()
        }
      }
      return clients.openWindow(url)
    })
  )
})

// ─── Message Handler (for client communication) ───
self.addEventListener('message', e => {
  if (e.data && e.data.type === 'CLEAR_USER_CACHE') {
    e.waitUntil(
      caches.delete(USER_PROFILE_CACHE).then(() => {
        e.ports[0].postMessage({ success: true })
      })
    )
  }
  
  if (e.data && e.data.type === 'FORCE_UPDATE_CHECK') {
    // Trigger skipWaiting for immediate activation
    self.skipWaiting()
  }
})

// ─── Background Sync (for offline actions) ───
self.addEventListener('sync', e => {
  if (e.tag === 'check-visa-dday') {
    e.waitUntil(checkVisaDday())
  }
  
  if (e.tag === 'clear-user-cache') {
    e.waitUntil(caches.delete(USER_PROFILE_CACHE))
  }
})

async function checkVisaDday() {
  // This runs when connectivity is restored
  // Can check localStorage via postMessage to client
  const windowClients = await clients.matchAll({ type: 'window' })
  for (const client of windowClients) {
    client.postMessage({ type: 'CHECK_VISA_DDAY' })
  }
}

// ─── Periodic Background Sync (if supported) ───
self.addEventListener('periodicsync', e => {
  if (e.tag === 'visa-dday-check') {
    e.waitUntil(notifyVisaDday())
  }
})

async function notifyVisaDday() {
  // Read from cache or IndexedDB for D-day data
  try {
    const cache = await caches.open('hanpocket-data')
    const response = await cache.match('/data/visa-profile')
    if (response) {
      const profile = await response.json()
      if (profile.visaExpiry) {
        const dday = Math.ceil((new Date(profile.visaExpiry) - new Date()) / 86400000)
        if (dday <= 30 && dday > 0) {
          await self.registration.showNotification('HanPocket 비자 알림', {
            body: `비자 만료 D-${dday}일 남았습니다. 연장 준비하세요!`,
            icon: '/icon.svg',
            badge: '/icon.svg',
            vibrate: [200, 100, 200],
            tag: 'visa-dday',
            data: { url: '/?tab=visaalert', type: 'visa' }
          })
        }
      }
    }
  } catch (err) {
    // Silently fail
  }
}
