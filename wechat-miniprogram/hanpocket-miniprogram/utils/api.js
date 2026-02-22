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