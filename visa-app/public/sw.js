const CACHE_NAME = 'hanpocket-v2'
const STATIC_ASSETS = ['/', '/index.html']

// Install
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE_NAME).then(c => c.addAll(STATIC_ASSETS))
  )
  self.skipWaiting()
})

// Activate
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  )
  self.clients.claim()
})

// Fetch — cache-first for static, network-first for API
self.addEventListener('fetch', e => {
  const url = new URL(e.request.url)
  if (url.pathname.startsWith('/api') || url.hostname !== location.hostname) {
    e.respondWith(
      fetch(e.request).catch(() => caches.match(e.request))
    )
  } else {
    e.respondWith(
      caches.match(e.request).then(r => r || fetch(e.request))
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

// ─── Background Sync (for offline actions) ───
self.addEventListener('sync', e => {
  if (e.tag === 'check-visa-dday') {
    e.waitUntil(checkVisaDday())
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
