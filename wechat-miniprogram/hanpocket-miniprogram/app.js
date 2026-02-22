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