// Service Worker 업데이트 관리
let swRegistration = null
let updateAvailable = false

// Service Worker 등록 및 업데이트 감지
export async function initServiceWorker() {
  if (!('serviceWorker' in navigator)) {
    console.log('Service Worker not supported')
    return
  }

  try {
    swRegistration = await navigator.serviceWorker.register('/sw.js')
    console.log('SW registered:', swRegistration.scope)

    // 업데이트 감지
    swRegistration.addEventListener('updatefound', () => {
      const newWorker = swRegistration.installing
      console.log('SW update found')

      newWorker.addEventListener('statechange', () => {
        if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
          // 새 버전이 설치되었고 기존 버전이 실행 중
          updateAvailable = true
          console.log('SW update ready')
          showUpdateNotification()
        }
      })
    })

    // SW로부터 메시지 수신
    navigator.serviceWorker.addEventListener('message', (event) => {
      if (event.data.type === 'SW_UPDATED' && event.data.action === 'reload') {
        console.log('SW requests page reload')
        // 페이지 새로고침 알림 표시
        showReloadNotification()
      }
    })

    // 이미 대기 중인 SW가 있는 경우
    if (swRegistration.waiting) {
      updateAvailable = true
      showUpdateNotification()
    }

  } catch (error) {
    console.error('SW registration failed:', error)
  }
}

// 업데이트 알림 표시
function showUpdateNotification() {
  const notification = document.createElement('div')
  notification.id = 'sw-update-notification'
  notification.innerHTML = `
    <div style="
      position: fixed;
      top: 20px;
      right: 20px;
      background: #3B82F6;
      color: white;
      padding: 16px 20px;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.3);
      z-index: 10000;
      max-width: 300px;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    ">
      <div style="font-weight: 600; margin-bottom: 8px;">
        🔄 새 버전 사용 가능
      </div>
      <div style="font-size: 14px; margin-bottom: 12px;">
        내정보 탭의 캐시 문제가 해결되었습니다. 업데이트하시겠습니까?
      </div>
      <div style="display: flex; gap: 8px;">
        <button onclick="updateServiceWorker()" style="
          background: white;
          color: #3B82F6;
          border: none;
          padding: 8px 16px;
          border-radius: 4px;
          cursor: pointer;
          font-weight: 500;
          font-size: 13px;
        ">업데이트</button>
        <button onclick="dismissUpdate()" style="
          background: transparent;
          color: white;
          border: 1px solid rgba(255,255,255,0.5);
          padding: 8px 16px;
          border-radius: 4px;
          cursor: pointer;
          font-size: 13px;
        ">나중에</button>
      </div>
    </div>
  `
  
  // 기존 알림 제거
  const existing = document.getElementById('sw-update-notification')
  if (existing) existing.remove()
  
  document.body.appendChild(notification)
}

// 새로고침 알림 표시
function showReloadNotification() {
  const notification = document.createElement('div')
  notification.innerHTML = `
    <div style="
      position: fixed;
      top: 20px;
      right: 20px;
      background: #10B981;
      color: white;
      padding: 16px 20px;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.3);
      z-index: 10000;
      max-width: 300px;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    ">
      <div style="font-weight: 600; margin-bottom: 8px;">
        ✅ 업데이트 완료
      </div>
      <div style="font-size: 14px;">
        페이지를 새로고침하여 최신 버전을 사용하세요.
      </div>
    </div>
  `
  
  document.body.appendChild(notification)
  
  // 2초 후 자동 새로고침
  setTimeout(() => {
    window.location.reload()
  }, 2000)
}

// Service Worker 업데이트 실행
window.updateServiceWorker = function() {
  if (swRegistration && swRegistration.waiting) {
    // 대기 중인 SW에게 skipWaiting 신호
    swRegistration.waiting.postMessage({ type: 'FORCE_UPDATE_CHECK' })
    
    // 사용자 캐시 강제 삭제
    clearUserCache()
    
    // 알림 제거
    const notification = document.getElementById('sw-update-notification')
    if (notification) notification.remove()
  }
}

// 업데이트 알림 닫기
window.dismissUpdate = function() {
  const notification = document.getElementById('sw-update-notification')
  if (notification) notification.remove()
}

// 사용자 데이터 캐시 강제 삭제
export async function clearUserCache() {
  if (swRegistration && swRegistration.active) {
    const channel = new MessageChannel()
    
    return new Promise((resolve) => {
      channel.port1.onmessage = (event) => {
        resolve(event.data.success)
      }
      
      swRegistration.active.postMessage(
        { type: 'CLEAR_USER_CACHE' },
        [channel.port2]
      )
    })
  }
}

// 내정보 탭 진입 시 캐시 갱신 강제
export function forceProfileDataRefresh() {
  if (swRegistration && swRegistration.active) {
    swRegistration.active.postMessage({ type: 'CLEAR_USER_CACHE' })
    console.log('Forced profile data cache refresh')
  }
}

// SW 상태 확인
export function getServiceWorkerStatus() {
  return {
    supported: 'serviceWorker' in navigator,
    registered: !!swRegistration,
    updateAvailable,
    controller: !!navigator.serviceWorker.controller
  }
}