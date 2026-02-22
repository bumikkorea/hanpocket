// utils/bridge.js
// 웹앱과 미니프로그램 간의 브리지 통신을 담당하는 유틸리티

class WeChatBridge {
  constructor() {
    this.messageHandlers = new Map()
    this.webviewComponent = null
  }

  // WebView 컴포넌트 등록
  setWebViewComponent(component) {
    this.webviewComponent = component
  }

  // 메시지 핸들러 등록
  registerHandler(type, handler) {
    this.messageHandlers.set(type, handler)
  }

  // 메시지 핸들러 제거
  unregisterHandler(type) {
    this.messageHandlers.delete(type)
  }

  // 웹앱으로 메시지 전송
  postMessage(type, data) {
    if (this.webviewComponent) {
      this.webviewComponent.postMessage({
        data: { type, data }
      })
    } else {
      console.warn('WebView 컴포넌트가 등록되지 않았습니다')
    }
  }

  // 웹앱에서 수신한 메시지 처리
  handleMessage(message) {
    const { type, data } = message
    const handler = this.messageHandlers.get(type)
    
    if (handler) {
      try {
        handler(data)
      } catch (error) {
        console.error(`메시지 처리 오류 (${type}):`, error)
      }
    } else {
      console.warn(`등록되지 않은 메시지 타입: ${type}`)
    }
  }

  // 기본 핸들러들 등록
  setupDefaultHandlers() {
    // 위챗 로그인 핸들러
    this.registerHandler('REQUEST_LOGIN', async () => {
      try {
        const loginRes = await wx.login()
        const userRes = await wx.getUserProfile({
          desc: 'HanPocket 서비스 이용을 위한 정보 수집'
        })

        this.postMessage('LOGIN_RESULT', {
          success: true,
          code: loginRes.code,
          userInfo: userRes.userInfo
        })
      } catch (error) {
        this.postMessage('LOGIN_RESULT', {
          success: false,
          error: error.errMsg
        })
      }
    })

    // 결제 핸들러
    this.registerHandler('REQUEST_PAYMENT', async (paymentData) => {
      try {
        const result = await wx.requestPayment({
          timeStamp: paymentData.timeStamp,
          nonceStr: paymentData.nonceStr,
          package: paymentData.package,
          signType: paymentData.signType,
          paySign: paymentData.paySign
        })

        this.postMessage('PAYMENT_RESULT', {
          success: true,
          result: result
        })
      } catch (error) {
        this.postMessage('PAYMENT_RESULT', {
          success: false,
          error: error.errMsg
        })
      }
    })

    // 공유 핸들러
    this.registerHandler('REQUEST_SHARE', (shareData) => {
      // 공유 데이터를 현재 페이지에 저장
      const pages = getCurrentPages()
      const currentPage = pages[pages.length - 1]
      
      if (currentPage) {
        currentPage.shareData = shareData
        wx.showShareMenu({
          withShareTicket: true
        })
      }
    })

    // 네비게이션 핸들러
    this.registerHandler('REQUEST_NAVIGATION', (navData) => {
      switch (navData.type) {
        case 'navigate':
          wx.navigateTo({ url: navData.url })
          break
        case 'redirect':
          wx.redirectTo({ url: navData.url })
          break
        case 'reLaunch':
          wx.reLaunch({ url: navData.url })
          break
        case 'switchTab':
          wx.switchTab({ url: navData.url })
          break
        default:
          console.warn('알 수 없는 네비게이션 타입:', navData.type)
      }
    })

    // 저장소 핸들러
    this.registerHandler('REQUEST_STORAGE', (storageData) => {
      switch (storageData.action) {
        case 'get':
          const value = wx.getStorageSync(storageData.key)
          this.postMessage('STORAGE_RESULT', {
            action: 'get',
            key: storageData.key,
            value: value
          })
          break
        case 'set':
          wx.setStorageSync(storageData.key, storageData.value)
          this.postMessage('STORAGE_RESULT', {
            action: 'set',
            key: storageData.key,
            success: true
          })
          break
        case 'remove':
          wx.removeStorageSync(storageData.key)
          this.postMessage('STORAGE_RESULT', {
            action: 'remove',
            key: storageData.key,
            success: true
          })
          break
      }
    })

    // 시스템 정보 핸들러
    this.registerHandler('REQUEST_SYSTEM_INFO', () => {
      const systemInfo = wx.getSystemInfoSync()
      this.postMessage('SYSTEM_INFO_RESULT', systemInfo)
    })

    // 네트워크 상태 핸들러
    this.registerHandler('REQUEST_NETWORK_STATUS', () => {
      wx.getNetworkType({
        success: (res) => {
          this.postMessage('NETWORK_STATUS_RESULT', {
            networkType: res.networkType,
            isConnected: res.networkType !== 'none'
          })
        },
        fail: (error) => {
          this.postMessage('NETWORK_STATUS_RESULT', {
            error: error.errMsg
          })
        }
      })
    })
  }

  // 정리
  destroy() {
    this.messageHandlers.clear()
    this.webviewComponent = null
  }
}

// 싱글톤 인스턴스 생성
const bridgeInstance = new WeChatBridge()
bridgeInstance.setupDefaultHandlers()

module.exports = bridgeInstance