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
      imageUrl: this.shareData ? this.shareData.imageUrl : '/images/logos/share-logo.png'
    }
  },

  onShareTimeline() {
    return {
      title: 'HanPocket과 함께 똑똑한 가계부 관리하기',
      imageUrl: '/images/logos/share-logo.png'
    }
  }
})