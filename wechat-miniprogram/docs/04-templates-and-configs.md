# 필수 파일 및 설정 템플릿

## 개요
HanPocket 위챗 미니프로그램 개발에 필요한 모든 파일과 설정의 템플릿을 제공합니다.

## 파일 구조
```
hanpocket-miniprogram/
├── app.js                 # 앱 메인 로직
├── app.json               # 앱 설정
├── app.wxss               # 전역 스타일
├── sitemap.json           # SEO 설정
├── pages/                 # 페이지들
│   ├── webview/          # WebView 메인 페이지
│   ├── loading/          # 로딩 페이지
│   ├── error/            # 에러 페이지
│   └── settings/         # 설정 페이지
├── components/           # 공통 컴포넌트
├── utils/               # 유틸리티 함수
├── images/             # 이미지 리소스
└── templates/          # 페이지 템플릿
```

## 핵심 설정 파일들

### 1. app.json - 앱 기본 설정
```json
{
  "pages": [
    "pages/webview/webview",
    "pages/loading/loading", 
    "pages/error/error",
    "pages/settings/settings"
  ],
  "window": {
    "backgroundTextStyle": "light",
    "navigationBarBackgroundColor": "#1a73e8",
    "navigationBarTitleText": "HanPocket",
    "navigationBarTextStyle": "white",
    "backgroundColor": "#f8f9fa"
  },
  "tabBar": {
    "color": "#666666",
    "selectedColor": "#1a73e8", 
    "backgroundColor": "#ffffff",
    "borderStyle": "black",
    "list": [
      {
        "pagePath": "pages/webview/webview",
        "text": "홈",
        "iconPath": "images/home.png",
        "selectedIconPath": "images/home-active.png"
      },
      {
        "pagePath": "pages/settings/settings", 
        "text": "설정",
        "iconPath": "images/settings.png",
        "selectedIconPath": "images/settings-active.png"
      }
    ]
  },
  "networkTimeout": {
    "request": 10000,
    "downloadFile": 10000
  },
  "debug": false,
  "navigateToMiniProgramAppIdList": [],
  "permission": {
    "scope.userLocation": {
      "desc": "위치 기반 서비스 제공을 위해 필요합니다"
    }
  },
  "requiredBackgroundModes": ["audio"],
  "workers": "workers",
  "style": "v2",
  "sitemapLocation": "sitemap.json",
  "lazyCodeLoading": "requiredComponents"
}
```

### 2. app.js - 앱 메인 로직
```javascript
// app.js
App({
  onLaunch() {
    console.log('HanPocket 미니프로그램 시작')
    this.initializeApp()
  },

  onShow() {
    console.log('앱이 전경으로 전환됨')
  },

  onHide() {
    console.log('앱이 배경으로 전환됨') 
  },

  onError(error) {
    console.error('앱 에러:', error)
    this.reportError(error)
  },

  // 앱 초기화
  initializeApp() {
    // 위챗 환경 체크
    this.checkWeChatVersion()
    
    // 사용자 정보 확인
    this.checkUserAuth()
    
    // 네트워크 상태 확인
    this.checkNetworkStatus()
  },

  // 위챗 버전 체크
  checkWeChatVersion() {
    const systemInfo = wx.getSystemInfoSync()
    console.log('시스템 정보:', systemInfo)
    
    if (systemInfo.version < '6.6.0') {
      wx.showModal({
        title: '버전 업데이트 필요',
        content: '위챗 6.6.0 이상에서 정상 동작합니다.',
        showCancel: false
      })
    }
  },

  // 사용자 인증 상태 확인
  checkUserAuth() {
    const token = wx.getStorageSync('user_token')
    if (token) {
      this.validateToken(token)
    }
  },

  // 토큰 유효성 검증
  async validateToken(token) {
    try {
      const result = await this.request({
        url: '/api/auth/validate',
        method: 'POST',
        data: { token }
      })
      
      if (!result.valid) {
        wx.removeStorageSync('user_token')
      }
    } catch (error) {
      console.error('토큰 검증 실패:', error)
    }
  },

  // 네트워크 상태 확인
  checkNetworkStatus() {
    wx.getNetworkType({
      success: (res) => {
        console.log('네트워크 타입:', res.networkType)
        if (res.networkType === 'none') {
          this.showNetworkError()
        }
      }
    })

    // 네트워크 변화 감지
    wx.onNetworkStatusChange((res) => {
      console.log('네트워크 상태 변화:', res)
      this.globalData.isConnected = res.isConnected
    })
  },

  // 네트워크 오류 표시
  showNetworkError() {
    wx.showToast({
      title: '네트워크 연결을 확인해주세요',
      icon: 'none',
      duration: 3000
    })
  },

  // API 요청 헬퍼
  request(options) {
    return new Promise((resolve, reject) => {
      wx.request({
        ...options,
        url: this.globalData.apiBaseUrl + options.url,
        header: {
          'Content-Type': 'application/json',
          'Authorization': wx.getStorageSync('user_token') || '',
          ...options.header
        },
        success: (res) => {
          if (res.statusCode === 200) {
            resolve(res.data)
          } else {
            reject(new Error(`API 오류: ${res.statusCode}`))
          }
        },
        fail: reject
      })
    })
  },

  // 에러 리포팅
  reportError(error) {
    console.error('에러 리포트:', error)
    
    wx.request({
      url: this.globalData.apiBaseUrl + '/api/errors',
      method: 'POST',
      data: {
        error: error.toString(),
        stack: error.stack,
        timestamp: new Date().toISOString(),
        userAgent: wx.getSystemInfoSync().platform
      }
    })
  },

  // 전역 데이터
  globalData: {
    userInfo: null,
    isConnected: true,
    apiBaseUrl: 'https://api.hanpocket.app',
    webAppUrl: 'https://hanpocket.app'
  }
})
```

### 3. sitemap.json - SEO 설정
```json
{
  "desc": "HanPocket 미니프로그램 sitemap 설정",
  "rules": [{
    "action": "allow",
    "page": "pages/webview/webview"
  }, {
    "action": "disallow",
    "page": "pages/settings/settings"
  }]
}
```

## 페이지 템플릿들

### WebView 메인 페이지
```javascript
// pages/webview/webview.js
const app = getApp()

Page({
  data: {
    webviewUrl: '',
    loading: true,
    error: false,
    retryCount: 0,
    maxRetries: 3
  },

  onLoad(options) {
    console.log('WebView 페이지 로드:', options)
    this.initializeWebView(options)
  },

  onShow() {
    // 페이지 표시 시 실행
    this.checkNetworkAndReload()
  },

  // WebView 초기화
  initializeWebView(options) {
    let url = app.globalData.webAppUrl
    
    // URL 파라미터 처리
    if (options.path) {
      url += options.path
    }
    
    // 사용자 토큰 추가
    const token = wx.getStorageSync('user_token')
    if (token) {
      url += (url.includes('?') ? '&' : '?') + `token=${token}`
    }

    this.setData({
      webviewUrl: url
    })
  },

  // 네트워크 상태 확인 후 재로드
  checkNetworkAndReload() {
    if (!app.globalData.isConnected) {
      this.setData({
        error: true,
        loading: false
      })
      return
    }
    
    if (this.data.error && this.data.retryCount < this.data.maxRetries) {
      this.retryLoad()
    }
  },

  // WebView 로드 완료
  onWebViewLoad() {
    console.log('WebView 로드 완료')
    this.setData({
      loading: false,
      error: false,
      retryCount: 0
    })
  },

  // WebView 로드 에러
  onWebViewError(e) {
    console.error('WebView 로드 실패:', e)
    this.setData({
      loading: false,
      error: true
    })
    
    this.showErrorToast()
  },

  // 에러 토스트 표시
  showErrorToast() {
    wx.showToast({
      title: '페이지 로드 실패',
      icon: 'none',
      duration: 2000
    })
  },

  // 재시도
  retryLoad() {
    if (this.data.retryCount >= this.data.maxRetries) {
      wx.showModal({
        title: '로드 실패',
        content: '페이지를 불러올 수 없습니다. 네트워크를 확인해주세요.',
        showCancel: false
      })
      return
    }

    this.setData({
      loading: true,
      error: false,
      retryCount: this.data.retryCount + 1
    })

    setTimeout(() => {
      this.initializeWebView({})
    }, 1000)
  },

  // 웹앱에서 메시지 수신
  onWebViewMessage(e) {
    console.log('웹앱 메시지 수신:', e.detail.data)
    
    e.detail.data.forEach(message => {
      this.handleWebMessage(message)
    })
  },

  // 웹앱 메시지 처리
  handleWebMessage(message) {
    switch (message.type) {
      case 'NAVIGATION':
        this.handleNavigation(message.data)
        break
      case 'SHARE':
        this.handleShare(message.data)
        break  
      case 'PAYMENT':
        this.handlePayment(message.data)
        break
      case 'AUTH':
        this.handleAuth(message.data)
        break
      default:
        console.log('알 수 없는 메시지 타입:', message.type)
    }
  },

  // 네비게이션 처리
  handleNavigation(data) {
    if (data.type === 'miniprogram') {
      wx.navigateTo({
        url: data.url
      })
    }
  },

  // 공유 처리
  handleShare(data) {
    this.shareData = data
    wx.showShareMenu({
      withShareTicket: true
    })
  },

  // 결제 처리
  async handlePayment(data) {
    try {
      const paymentResult = await wx.requestPayment({
        timeStamp: data.timeStamp,
        nonceStr: data.nonceStr,
        package: data.package,
        signType: data.signType,
        paySign: data.paySign
      })
      
      // 결제 결과를 웹앱으로 전송
      this.postMessageToWeb({
        type: 'PAYMENT_RESULT',
        data: { success: true, result: paymentResult }
      })
    } catch (error) {
      console.error('결제 실패:', error)
      this.postMessageToWeb({
        type: 'PAYMENT_RESULT', 
        data: { success: false, error: error.errMsg }
      })
    }
  },

  // 인증 처리
  handleAuth(data) {
    if (data.action === 'login') {
      this.doWeChatLogin()
    } else if (data.action === 'logout') {
      this.doLogout()
    }
  },

  // 위챗 로그인
  async doWeChatLogin() {
    try {
      const loginRes = await wx.login()
      const userRes = await wx.getUserProfile({
        desc: 'HanPocket 서비스 이용을 위한 정보 수집'
      })

      // 웹앱으로 인증 정보 전송
      this.postMessageToWeb({
        type: 'AUTH_RESULT',
        data: {
          code: loginRes.code,
          userInfo: userRes.userInfo
        }
      })
    } catch (error) {
      console.error('위챗 로그인 실패:', error)
      this.postMessageToWeb({
        type: 'AUTH_RESULT',
        data: { error: error.errMsg }
      })
    }
  },

  // 로그아웃
  doLogout() {
    wx.removeStorageSync('user_token')
    wx.reLaunch({
      url: '/pages/webview/webview'
    })
  },

  // 웹앱으로 메시지 전송
  postMessageToWeb(message) {
    const webview = this.selectComponent('#webview')
    if (webview) {
      webview.postMessage({
        data: message
      })
    }
  },

  // 공유 버튼 처리
  onShareAppMessage() {
    return {
      title: this.shareData ? this.shareData.title : 'HanPocket - 스마트 가계부',
      path: '/pages/webview/webview',
      imageUrl: this.shareData ? this.shareData.imageUrl : '/images/share-logo.png'
    }
  },

  onShareTimeline() {
    return {
      title: 'HanPocket과 함께 똑똑한 가계부 관리하기',
      imageUrl: '/images/share-logo.png'
    }
  }
})
```

### WebView 페이지 WXML
```xml
<!-- pages/webview/webview.wxml -->
<view class="container">
  <!-- 로딩 인디케이터 -->
  <view wx:if="{{loading}}" class="loading-container">
    <view class="loading-spinner"></view>
    <text class="loading-text">HanPocket 로딩 중...</text>
  </view>

  <!-- 에러 화면 -->
  <view wx:elif="{{error}}" class="error-container">
    <image src="/images/error-icon.png" class="error-icon"></image>
    <text class="error-title">페이지를 불러올 수 없습니다</text>
    <text class="error-desc">네트워크 연결을 확인하고 다시 시도해주세요</text>
    <button class="retry-btn" bindtap="retryLoad">다시 시도</button>
  </view>

  <!-- WebView -->
  <web-view 
    wx:else
    id="webview"
    src="{{webviewUrl}}"
    bindload="onWebViewLoad"
    binderror="onWebViewError"
    bindmessage="onWebViewMessage">
  </web-view>
</view>
```

### WebView 페이지 스타일
```css
/* pages/webview/webview.wxss */
.container {
  height: 100vh;
  background-color: #f8f9fa;
}

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 3px solid #e3e3e3;
  border-top: 3px solid #1a73e8;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.loading-text {
  margin-top: 20px;
  color: #666;
  font-size: 16px;
}

.error-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
  padding: 40px;
}

.error-icon {
  width: 80px;
  height: 80px;
  margin-bottom: 20px;
}

.error-title {
  font-size: 18px;
  color: #333;
  margin-bottom: 10px;
  text-align: center;
}

.error-desc {
  font-size: 14px;
  color: #666;
  text-align: center;
  margin-bottom: 30px;
  line-height: 1.5;
}

.retry-btn {
  background-color: #1a73e8;
  color: white;
  border-radius: 6px;
  padding: 12px 30px;
  font-size: 16px;
}
```

## 유틸리티 함수들

### 공통 유틸리티
```javascript
// utils/common.js
class CommonUtils {
  // 시간 포맷팅
  static formatTime(date) {
    const year = date.getFullYear()
    const month = date.getMonth() + 1
    const day = date.getDate()
    const hour = date.getHours()
    const minute = date.getMinutes()
    const second = date.getSeconds()

    return `${[year, month, day].map(this.formatNumber).join('-')} ${[hour, minute, second].map(this.formatNumber).join(':')}`
  }

  // 숫자 포맷팅 (2자리)
  static formatNumber(n) {
    n = n.toString()
    return n[1] ? n : `0${n}`
  }

  // 디바운스
  static debounce(func, wait) {
    let timeout
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout)
        func(...args)
      }
      clearTimeout(timeout)
      timeout = setTimeout(later, wait)
    }
  }

  // 쓰로틀
  static throttle(func, limit) {
    let inThrottle
    return function() {
      const args = arguments
      const context = this
      if (!inThrottle) {
        func.apply(context, args)
        inThrottle = true
        setTimeout(() => inThrottle = false, limit)
      }
    }
  }

  // 안전한 JSON 파싱
  static safeJSONParse(str, defaultValue = null) {
    try {
      return JSON.parse(str)
    } catch (e) {
      console.error('JSON 파싱 오류:', e)
      return defaultValue
    }
  }

  // 로컬 스토리지 헬퍼
  static setStorage(key, value) {
    try {
      wx.setStorageSync(key, value)
      return true
    } catch (e) {
      console.error('스토리지 저장 실패:', e)
      return false
    }
  }

  static getStorage(key, defaultValue = null) {
    try {
      const value = wx.getStorageSync(key)
      return value || defaultValue
    } catch (e) {
      console.error('스토리지 읽기 실패:', e)
      return defaultValue
    }
  }
}

module.exports = CommonUtils
```

### API 헬퍼
```javascript
// utils/api.js
const app = getApp()

class ApiHelper {
  static baseUrl = 'https://api.hanpocket.app'

  // GET 요청
  static get(url, params = {}) {
    return this.request('GET', url, params)
  }

  // POST 요청  
  static post(url, data = {}) {
    return this.request('POST', url, data)
  }

  // PUT 요청
  static put(url, data = {}) {
    return this.request('PUT', url, data)
  }

  // DELETE 요청
  static delete(url) {
    return this.request('DELETE', url)
  }

  // 공통 요청 메소드
  static request(method, url, data = {}) {
    return new Promise((resolve, reject) => {
      const token = wx.getStorageSync('user_token')
      
      wx.request({
        url: this.baseUrl + url,
        method: method,
        data: data,
        header: {
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : ''
        },
        success: (res) => {
          if (res.statusCode === 200) {
            resolve(res.data)
          } else if (res.statusCode === 401) {
            // 인증 만료
            wx.removeStorageSync('user_token')
            wx.showToast({
              title: '로그인이 필요합니다',
              icon: 'none'
            })
            reject(new Error('인증 만료'))
          } else {
            reject(new Error(`API 오류: ${res.statusCode}`))
          }
        },
        fail: (error) => {
          console.error('네트워크 오류:', error)
          reject(error)
        }
      })
    })
  }

  // 파일 업로드
  static uploadFile(filePath, name = 'file') {
    return new Promise((resolve, reject) => {
      const token = wx.getStorageSync('user_token')
      
      wx.uploadFile({
        url: this.baseUrl + '/api/upload',
        filePath: filePath,
        name: name,
        header: {
          'Authorization': token ? `Bearer ${token}` : ''
        },
        success: (res) => {
          if (res.statusCode === 200) {
            resolve(JSON.parse(res.data))
          } else {
            reject(new Error(`업로드 실패: ${res.statusCode}`))
          }
        },
        fail: reject
      })
    })
  }
}

module.exports = ApiHelper
```

## 다음 단계
이제 [개발 환경 설정 및 기본 프로젝트 구조 생성](05-project-setup.md)을 진행할 수 있습니다.