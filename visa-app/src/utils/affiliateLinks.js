// Affiliate Link Manager
// 어필리에이트 링크 통합 관리 시스템

export const AFFILIATE_IDS = {
  // 여행/체험 플랫폼
  KLOOK: 'aff_3219_hp', // Klook 어필리에이트 ID
  KKDAY: 'aff_4327_hp', // KKday 어필리에이트 ID
  TRIP_COM: 'aff_1892_hp', // Trip.com 어필리에이트 ID
  HANATOUR: 'aff_5671_hp', // 하나투어 어필리에이트 ID
  INTERPARK: 'aff_8234_hp', // 인터파크투어 어필리에이트 ID
  
  // 쇼핑몰
  COUPANG: 'aff_1234_hp', // 쿠팡 파트너스 ID
  G11ST: 'aff_5678_hp', // 11번가 어필리에이트 ID
  GMARKET: 'aff_9012_hp', // G마켓 어필리에이트 ID
  AUCTION: 'aff_3456_hp', // 옥션 어필리에이트 ID
  
  // 맛집 예약
  CATCHTABLE: 'aff_7890_hp', // 캐치테이블 어필리에이트 ID
  SIKSIN: 'aff_2345_hp', // 식신 어필리에이트 ID
  YOGIYO: 'aff_6789_hp', // 요기요 어필리에이트 ID
  BAEMIN: 'aff_0123_hp', // 배달의민족 어필리에이트 ID
  
  // 숙박
  YANOLJA: 'aff_4567_hp', // 야놀자 어필리에이트 ID
  GOODCHOICE: 'aff_8901_hp', // 여기어때 어필리에이트 ID
  BOOKING_COM: 'aid_1234567_hp', // Booking.com 어필리에이트 ID
  
  // 뷰티/쇼핑
  OLIVEYOUNG: 'aff_5555_hp', // 올리브영 어필리에이트 ID
  MUSINSA: 'aff_6666_hp', // 무신사 어필리에이트 ID
}

export const generateAffiliateLink = (platform, originalUrl, params = {}) => {
  const affId = AFFILIATE_IDS[platform.toUpperCase()]
  
  if (!affId) {
    console.warn(`No affiliate ID found for platform: ${platform}`)
    return originalUrl
  }
  
  const url = new URL(originalUrl)
  
  switch (platform.toLowerCase()) {
    case 'klook':
      url.searchParams.set('aid', affId)
      url.searchParams.set('utm_source', 'hanpocket')
      url.searchParams.set('utm_medium', 'app')
      break
      
    case 'kkday':
      url.searchParams.set('cid', affId)
      url.searchParams.set('utm_source', 'hanpocket')
      break
      
    case 'trip.com':
    case 'trip':
      url.searchParams.set('promo', affId)
      url.searchParams.set('locale', 'ko-KR')
      break
      
    case 'coupang':
      // 쿠팡 파트너스 링크는 특별한 형태
      return `https://link.coupang.com/a/${affId}?lptag=AF${affId}&pageKey=${encodeURIComponent(originalUrl)}`
      
    case 'catchtable':
      url.searchParams.set('ref', affId)
      break
      
    case 'booking.com':
    case 'booking':
      url.searchParams.set('aid', affId.replace('aid_', '').replace('_hp', ''))
      break
      
    default:
      // 일반적인 어필리에이트 파라미터
      url.searchParams.set('aff_id', affId)
      url.searchParams.set('ref', 'hanpocket')
  }
  
  // 추가 파라미터 적용
  Object.entries(params).forEach(([key, value]) => {
    url.searchParams.set(key, value)
  })
  
  return url.toString()
}

// 클릭 추적을 위한 랩퍼 함수
export const trackAffiliateClick = async (platform, originalUrl, additionalData = {}) => {
  const affiliateUrl = generateAffiliateLink(platform, originalUrl)
  
  // 클릭 로그 기록
  try {
    await logClick({
      platform,
      originalUrl,
      affiliateUrl,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      ...additionalData
    })
  } catch (error) {
    console.warn('Failed to log affiliate click:', error)
  }
  
  return affiliateUrl
}

// 간단한 클릭 로그 시스템 (localStorage 기반)
const logClick = async (clickData) => {
  const logs = JSON.parse(localStorage.getItem('affiliateClicks') || '[]')
  logs.push(clickData)
  
  // 최대 1000개 로그만 유지
  if (logs.length > 1000) {
    logs.splice(0, logs.length - 1000)
  }
  
  localStorage.setItem('affiliateClicks', JSON.stringify(logs))
  
  // 서버로 전송 (향후 구현)
  // await sendToAnalytics(clickData)
}

// 수익 추적 리포트 생성
export const generateRevenueReport = () => {
  const logs = JSON.parse(localStorage.getItem('affiliateClicks') || '[]')
  
  const report = {}
  logs.forEach(log => {
    if (!report[log.platform]) {
      report[log.platform] = {
        clicks: 0,
        lastClick: null,
        urls: new Set()
      }
    }
    
    report[log.platform].clicks++
    report[log.platform].lastClick = log.timestamp
    report[log.platform].urls.add(log.originalUrl)
  })
  
  // Set을 Array로 변환
  Object.keys(report).forEach(platform => {
    report[platform].urls = Array.from(report[platform].urls)
  })
  
  return report
}

// 어필리에이트 링크가 적용된 주요 플랫폼 목록
export const AFFILIATE_PLATFORMS = {
  travel: [
    { name: 'Klook', key: 'klook', description: 'Alipay/WeChat Pay 지원' },
    { name: 'KKday', key: 'kkday', description: 'Alipay 지원' },
    { name: 'Trip.com', key: 'trip', description: 'Alipay/WeChat/UnionPay 지원' },
    { name: '하나투어', key: 'hanatour', description: '국내 1위 여행사' },
    { name: '인터파크투어', key: 'interpark', description: '항공/호텔 예약' }
  ],
  
  shopping: [
    { name: '쿠팡', key: 'coupang', description: '국내 1위 이커머스' },
    { name: '11번가', key: 'g11st', description: 'SK그룹 쇼핑몰' },
    { name: 'G마켓', key: 'gmarket', description: '이베이코리아' },
    { name: '옥션', key: 'auction', description: '이베이코리아' }
  ],
  
  dining: [
    { name: '캐치테이블', key: 'catchtable', description: '맛집 예약 서비스' },
    { name: '식신', key: 'siksin', description: '맛집 정보 및 예약' }
  ],
  
  accommodation: [
    { name: '야놀자', key: 'yanolja', description: '국내 1위 숙박 예약' },
    { name: '여기어때', key: 'goodchoice', description: '국내 숙박 예약' },
    { name: 'Booking.com', key: 'booking', description: '글로벌 숙박 예약' }
  ]
}