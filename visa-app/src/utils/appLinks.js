// App Links Utility - 앱 딥링크 및 웹 폴백 관리
// HanPocket 프로젝트용 앱 연동 유틸리티

/**
 * 앱 딥링크를 시도하고, 실패할 경우 웹 폴백으로 이동하는 함수
 * @param {string} deepLink - 앱 딥링크 URL
 * @param {string} fallbackUrl - 웹 폴백 URL
 * @param {number} timeout - 딥링크 시도 후 폴백까지 대기 시간 (ms)
 */
const openAppWithFallback = (deepLink, fallbackUrl, timeout = 1500) => {
  // 안드로이드에서는 intent:// 스킴 사용
  const isAndroid = /Android/i.test(navigator.userAgent)
  
  if (isAndroid && deepLink.includes('://') && !deepLink.startsWith('intent:')) {
    // Android intent 형식으로 변환
    const packageMap = {
      'kakaomap:': 'net.daum.android.map',
      'kakaot:': 'com.kakao.taxi',
      'nmap:': 'com.nhn.android.nmap',
      'baemin:': 'com.sampleapp',
      'yogiyo:': 'kr.co.ygy',
      'coupang:': 'com.coupang.mobile',
      'musinsa:': 'com.musinsa.store',
      'yanolja:': 'com.yanolja.android',
      'yeogi:': 'com.goodchoice.android.hotel'
    }
    
    const scheme = Object.keys(packageMap).find(s => deepLink.startsWith(s))
    if (scheme) {
      const packageName = packageMap[scheme]
      const intentUrl = `intent:${deepLink.slice(scheme.length)}#Intent;scheme=${scheme.slice(0, -1)};package=${packageName};S.browser_fallback_url=${encodeURIComponent(fallbackUrl)};end`
      window.location.href = intentUrl
      return
    }
  }
  
  // iOS 및 기본 딥링크 처리
  const startTime = Date.now()
  let didFallback = false
  
  // 페이지가 숨겨지거나 블러되면 앱이 열린 것으로 간주
  const onVisibilityChange = () => {
    if (document.hidden || document.webkitHidden) {
      didFallback = true
    }
  }
  
  const onBlur = () => {
    didFallback = true
  }
  
  document.addEventListener('visibilitychange', onVisibilityChange)
  document.addEventListener('webkitvisibilitychange', onVisibilityChange)
  window.addEventListener('blur', onBlur)
  
  // 딥링크 시도
  try {
    window.location.href = deepLink
  } catch (e) {
    console.warn('Deep link failed:', e)
  }
  
  // 타임아웃 후 폴백 실행
  setTimeout(() => {
    const elapsed = Date.now() - startTime
    
    // 정리
    document.removeEventListener('visibilitychange', onVisibilityChange)
    document.removeEventListener('webkitvisibilitychange', onVisibilityChange) 
    window.removeEventListener('blur', onBlur)
    
    // 앱이 열리지 않았고 충분한 시간이 지났다면 폴백
    if (!didFallback && elapsed >= timeout - 100) {
      window.open(fallbackUrl, '_blank')
    }
  }, timeout)
}

// 카카오맵 연동
export const openKakaoMap = (query = '주변 상점', lat = null, lng = null) => {
  const encodedQuery = encodeURIComponent(query)
  let deepLink = `kakaomap://search?q=${encodedQuery}`
  
  if (lat && lng) {
    deepLink = `kakaomap://look?p=${lat},${lng}`
  }
  
  const fallbackUrl = `https://map.kakao.com/link/search/${encodedQuery}`
  
  openAppWithFallback(deepLink, fallbackUrl)
}

// 네이버지도 연동
export const openNaverMap = (query = '주변 상점', lat = null, lng = null) => {
  const encodedQuery = encodeURIComponent(query)
  let deepLink = `nmap://search?query=${encodedQuery}`
  
  if (lat && lng) {
    deepLink = `nmap://place?lat=${lat}&lng=${lng}&name=${encodedQuery}`
  }
  
  const fallbackUrl = `https://map.naver.com/v5/search/${encodedQuery}`
  
  openAppWithFallback(deepLink, fallbackUrl)
}

// 카카오택시 연동
export const openKakaoTaxi = () => {
  const deepLink = 'kakaot://launch'
  const fallbackUrl = 'https://play.google.com/store/apps/details?id=com.kakao.taxi'
  
  openAppWithFallback(deepLink, fallbackUrl)
}

// 타다 연동
export const openTada = () => {
  const deepLink = 'tada://launch'
  const fallbackUrl = 'https://play.google.com/store/apps/details?id=com.vcnc.tada'
  
  openAppWithFallback(deepLink, fallbackUrl)
}

// 지하철 앱 연동 (서울지하철, Citymapper)
export const openSubwayApp = (appType = 'seoul') => {
  const links = {
    seoul: {
      deepLink: 'seoulsubway://launch',
      fallback: 'https://play.google.com/store/apps/details?id=kr.go.seoul.subway'
    },
    citymapper: {
      deepLink: 'citymapper://directions',
      fallback: 'https://citymapper.com/seoul'
    }
  }
  
  const link = links[appType] || links.seoul
  openAppWithFallback(link.deepLink, link.fallback)
}

// 버스 앱 연동
export const openBusApp = () => {
  const deepLink = 'busanduljjuk://launch' // 또는 지역별 버스앱
  const fallbackUrl = 'https://m.bus.go.kr/'
  
  openAppWithFallback(deepLink, fallbackUrl)
}

// 배달의민족 연동
export const openBaemin = () => {
  const deepLink = 'baemin://home'
  const fallbackUrl = 'https://play.google.com/store/apps/details?id=com.sampleapp'
  
  openAppWithFallback(deepLink, fallbackUrl)
}

// 요기요 연동
export const openYogiyo = () => {
  const deepLink = 'yogiyo://home'
  const fallbackUrl = 'https://play.google.com/store/apps/details?id=kr.co.ygy'
  
  openAppWithFallback(deepLink, fallbackUrl)
}

// 쿠팡 연동
export const openCoupang = (query = '') => {
  const deepLink = query 
    ? `coupang://search?q=${encodeURIComponent(query)}`
    : 'coupang://home'
  const fallbackUrl = query
    ? `https://www.coupang.com/np/search?q=${encodeURIComponent(query)}`
    : 'https://www.coupang.com/'
  
  openAppWithFallback(deepLink, fallbackUrl)
}

// 무신사 연동
export const openMusinsa = (category = '') => {
  const deepLink = category 
    ? `musinsa://category/${category}`
    : 'musinsa://home'
  const fallbackUrl = 'https://www.musinsa.com/'
  
  openAppWithFallback(deepLink, fallbackUrl)
}

// 야놀자 연동
export const openYanolja = () => {
  const deepLink = 'yanolja://launch'
  const fallbackUrl = 'https://www.yanolja.com/'
  
  openAppWithFallback(deepLink, fallbackUrl)
}

// 여기어때 연동
export const openYeogieoddae = () => {
  const deepLink = 'yeogi://launch'
  const fallbackUrl = 'https://www.goodchoice.kr/'
  
  openAppWithFallback(deepLink, fallbackUrl)
}

// 에어비앤비 연동
export const openAirbnb = (city = 'Seoul') => {
  const deepLink = `airbnb://d/search?location=${encodeURIComponent(city)}`
  const fallbackUrl = `https://www.airbnb.co.kr/s/${encodeURIComponent(city)}`
  
  openAppWithFallback(deepLink, fallbackUrl)
}

// KTX 예매 (코레일톡)
export const openKorail = () => {
  const deepLink = 'korail://launch'
  const fallbackUrl = 'https://www.letskorail.com/'
  
  openAppWithFallback(deepLink, fallbackUrl)
}

// 공항 리무진 버스
export const openAirportLimousine = () => {
  const deepLink = 'limousine://launch'
  const fallbackUrl = 'https://www.airport.kr/ap/ko/svc/getFacilityMainInfo.do'
  
  openAppWithFallback(deepLink, fallbackUrl)
}

// 편의점별 앱 연동
export const openConvenienceStore = (storeType) => {
  const stores = {
    cu: {
      deepLink: 'cu://launch',
      fallback: 'https://cu.bgfretail.com/'
    },
    gs25: {
      deepLink: 'gs25://launch', 
      fallback: 'http://gs25.gsretail.com/'
    },
    seven11: {
      deepLink: 'seven11://launch',
      fallback: 'https://www.7-eleven.co.kr/'
    },
    emart24: {
      deepLink: 'emart24://launch',
      fallback: 'http://emart24.co.kr/'
    }
  }
  
  const store = stores[storeType]
  if (store) {
    openAppWithFallback(store.deepLink, store.fallback)
  }
}

// 유틸리티 함수들
export const isAppInstalled = async (scheme) => {
  // 실제 앱 설치 여부 확인은 브라우저 제한으로 완벽하지 않음
  // 대신 사용자 에이전트나 플랫폼 정보를 활용
  return new Promise((resolve) => {
    const timeout = setTimeout(() => resolve(false), 100)
    
    try {
      const iframe = document.createElement('iframe')
      iframe.style.display = 'none'
      iframe.src = scheme
      document.body.appendChild(iframe)
      
      setTimeout(() => {
        document.body.removeChild(iframe)
        clearTimeout(timeout)
        resolve(true)
      }, 50)
    } catch (e) {
      clearTimeout(timeout)
      resolve(false)
    }
  })
}

// 위치 기반 추천
export const getLocationAndOpenApp = (appOpener) => {
  if ('geolocation' in navigator) {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords
        appOpener(latitude, longitude)
      },
      () => {
        // 위치 권한이 거부되면 일반 실행
        appOpener()
      },
      { timeout: 5000 }
    )
  } else {
    appOpener()
  }
}

// 앱 설치 권장 알림
export const showAppRecommendation = (appName, storeUrl) => {
  if (confirm(`${appName} 앱을 설치하시겠습니까? 더 편리한 이용이 가능합니다.`)) {
    window.open(storeUrl, '_blank')
  }
}

export default {
  openKakaoMap,
  openNaverMap,
  openKakaoTaxi,
  openTada,
  openSubwayApp,
  openBusApp,
  openBaemin,
  openYogiyo,
  openCoupang,
  openMusinsa,
  openYanolja,
  openYeogieoddae,
  openAirbnb,
  openKorail,
  openAirportLimousine,
  openConvenienceStore,
  isAppInstalled,
  getLocationAndOpenApp,
  showAppRecommendation
}