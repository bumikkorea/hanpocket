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