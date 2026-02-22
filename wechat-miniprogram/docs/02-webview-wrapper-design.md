# HanPocket 웹앱 → 위챗 미니프로그램 래핑 설계

## 개요
기존 HanPocket 웹앱을 위챗 미니프로그램으로 변환하는 WebView 기반 래핑 방식을 설계합니다.

## 아키텍처 설계

### 전체 구조
```
위챗 미니프로그램
├── WebView 컴포넌트 (메인)
├── 네이티브 브리지 레이어
├── 위챗 API 통합 레이어
└── 설정/관리 페이지 (네이티브)
```

### 기술 스택
- **프론트엔드**: 위챗 미니프로그램 프레임워크 (WXML, WXSS, JavaScript)
- **WebView**: HanPocket 기존 웹앱 임베드
- **브리지**: 위챗 미니프로그램 ↔ 웹앱 통신
- **백엔드**: 기존 HanPocket API 활용

## WebView 통합 방식

### 1. 기본 WebView 구현
```javascript
// pages/webview/webview.js
Page({
  data: {
    webviewUrl: 'https://hanpocket.app',
    loading: true
  },

  onLoad(options) {
    // URL 파라미터 처리
    if (options.path) {
      this.setData({
        webviewUrl: `https://hanpocket.app${options.path}`
      })
    }
  },

  onWebViewLoad() {
    this.setData({ loading: false })
  },

  onWebViewError(e) {
    console.error('WebView 로드 실패:', e)
    wx.showToast({
      title: '페이지 로드 실패',
      icon: 'none'
    })
  }
})
```

### 2. 웹앱과 미니프로그램 간 통신
```javascript
// 미니프로그램 → 웹앱 메시지 전송
sendMessageToWeb(data) {
  this.selectComponent('#webview').postMessage({
    data: data
  })
},

// 웹앱 → 미니프로그램 메시지 수신
onWebViewMessage(e) {
  const messages = e.detail.data
  messages.forEach(message => {
    this.handleWebMessage(message)
  })
},

handleWebMessage(message) {
  switch (message.type) {
    case 'NAVIGATION':
      // 네비게이션 요청 처리
      this.handleNavigation(message.data)
      break
    case 'SHARE':
      // 공유 기능 처리
      this.handleShare(message.data)
      break
    case 'PAYMENT':
      // 결제 기능 처리
      this.handlePayment(message.data)
      break
  }
}
```

### 3. 웹앱 측 브리지 코드
```javascript
// HanPocket 웹앱에 추가할 브리지 코드
class WeChatBridge {
  constructor() {
    this.isWeChatMiniProgram = this.detectEnvironment()
    this.setupMessageListener()
  }

  detectEnvironment() {
    return typeof wx !== 'undefined' && wx.miniProgram
  }

  // 위챗 미니프로그램으로 메시지 전송
  postMessage(type, data) {
    if (this.isWeChatMiniProgram) {
      wx.miniProgram.postMessage({
        data: { type, data }
      })
    }
  }

  // 네비게이션 요청
  navigateTo(path) {
    this.postMessage('NAVIGATION', { path })
  }

  // 공유 기능
  share(content) {
    this.postMessage('SHARE', content)
  }

  // 결제 기능
  requestPayment(paymentData) {
    this.postMessage('PAYMENT', paymentData)
  }
}

// 전역 브리지 인스턴스
window.wechatBridge = new WeChatBridge()
```

## 핵심 기능 통합

### 1. 사용자 인증
```javascript
// 위챗 로그인 통합
async loginWithWeChat() {
  try {
    // 위챗 로그인 코드 획득
    const loginRes = await wx.login()
    const code = loginRes.code

    // 사용자 정보 획득
    const userRes = await wx.getUserProfile({
      desc: 'HanPocket 서비스 이용을 위한 정보 수집'
    })

    // HanPocket 백엔드로 인증 정보 전송
    const authResult = await this.authenticateWithHanPocket({
      code,
      userInfo: userRes.userInfo
    })

    return authResult
  } catch (error) {
    console.error('위챗 로그인 실패:', error)
    throw error
  }
}
```

### 2. 결제 시스템 통합
```javascript
// 위챗 페이 통합
async processWeChatPayment(orderInfo) {
  try {
    // HanPocket 서버에서 위챗페이 주문 생성
    const paymentOrder = await this.createWeChatPayOrder(orderInfo)
    
    // 위챗페이 호출
    const payResult = await wx.requestPayment({
      timeStamp: paymentOrder.timeStamp,
      nonceStr: paymentOrder.nonceStr,
      package: paymentOrder.package,
      signType: paymentOrder.signType,
      paySign: paymentOrder.paySign
    })

    return this.handlePaymentResult(payResult)
  } catch (error) {
    console.error('결제 실패:', error)
    throw error
  }
}
```

### 3. 공유 기능
```javascript
// 미니프로그램 공유
onShareAppMessage(res) {
  return {
    title: 'HanPocket - 스마트 가계부',
    path: '/pages/webview/webview',
    imageUrl: '/images/share-logo.png'
  }
},

onShareTimeline(res) {
  return {
    title: 'HanPocket과 함께 가계부를 관리하세요',
    imageUrl: '/images/share-logo.png'
  }
}
```

## 성능 최적화

### 1. 로딩 최적화
```javascript
// 프리로딩 및 캐싱
const preloadConfig = {
  // 자주 사용되는 페이지 프리로드
  preloadUrls: [
    'https://hanpocket.app/dashboard',
    'https://hanpocket.app/transactions',
    'https://hanpocket.app/analytics'
  ],
  
  // 캐시 전략
  cacheStrategy: 'networkFirst',
  maxCacheSize: '50MB'
}
```

### 2. 네트워크 최적화
```javascript
// API 요청 최적화
class NetworkOptimizer {
  constructor() {
    this.requestQueue = []
    this.batchSize = 5
    this.batchDelay = 100 // ms
  }

  // 배치 요청 처리
  batchRequests(requests) {
    return Promise.all(
      requests.map(request => this.makeRequest(request))
    )
  }

  // 요청 압축
  compressRequest(data) {
    // gzip 또는 brotli 압축
    return this.compress(data)
  }
}
```

## 보안 고려사항

### 1. 도메인 화이트리스트
```json
{
  "networkTimeout": {
    "request": 10000,
    "downloadFile": 10000
  },
  "debug": false,
  "navigateToMiniProgramAppIdList": [],
  "window": {
    "backgroundTextStyle": "light",
    "navigationBarBackgroundColor": "#fff",
    "navigationBarTitleText": "HanPocket",
    "navigationBarTextStyle": "black"
  },
  "permission": {
    "scope.userLocation": {
      "desc": "위치 기반 서비스 제공을 위해 필요합니다"
    }
  },
  "requiredBackgroundModes": ["audio"],
  "workers": "workers",
  "navigateToMiniProgramAppIdList": [
    "wxd90cdb56c86892c6"
  ]
}
```

### 2. 데이터 보안
```javascript
// 민감한 데이터 암호화
class SecurityManager {
  // 데이터 암호화
  encryptSensitiveData(data) {
    return wx.encrypt({
      data: JSON.stringify(data),
      algorithm: 'aes-256-gcm'
    })
  }

  // 안전한 저장
  secureStore(key, data) {
    const encrypted = this.encryptSensitiveData(data)
    wx.setStorageSync(key, encrypted)
  }

  // HTTPS 강제
  enforceHTTPS(url) {
    return url.replace(/^http:/, 'https:')
  }
}
```

## 사용자 경험 개선

### 1. 오프라인 지원
```javascript
// 오프라인 상태 감지 및 처리
class OfflineManager {
  constructor() {
    this.isOnline = true
    this.offlineQueue = []
    this.setupNetworkListener()
  }

  setupNetworkListener() {
    wx.onNetworkStatusChange((res) => {
      this.isOnline = res.isConnected
      if (res.isConnected) {
        this.processOfflineQueue()
      }
    })
  }

  processOfflineQueue() {
    while (this.offlineQueue.length > 0) {
      const request = this.offlineQueue.shift()
      this.executeRequest(request)
    }
  }
}
```

### 2. 에러 처리
```javascript
// 글로벌 에러 핸들러
App({
  onError(error) {
    console.error('앱 에러:', error)
    
    // 에러 리포팅
    this.reportError(error)
    
    // 사용자에게 친화적인 메시지 표시
    wx.showModal({
      title: '오류 발생',
      content: '잠시 후 다시 시도해주세요.',
      showCancel: false
    })
  },

  reportError(error) {
    // 에러 로깅 서비스로 전송
    wx.request({
      url: 'https://hanpocket.app/api/errors',
      method: 'POST',
      data: {
        error: error.toString(),
        stack: error.stack,
        timestamp: new Date().toISOString(),
        appVersion: this.globalData.version
      }
    })
  }
})
```

## 다음 단계
이 설계를 바탕으로 [미니프로그램 배포 프로세스](03-deployment-process.md)를 진행할 수 있습니다.