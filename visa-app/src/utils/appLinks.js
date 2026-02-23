// 앱 딥링크 및 웹 폴백 유틸리티
// 앱이 설치되어 있으면 앱을 열고, 없으면 웹으로 연결

/**
 * 앱 설치 여부를 체크하고 적절한 링크로 이동
 * @param {string} appUrl - 앱 딥링크 URL
 * @param {string} webUrl - 웹 폴백 URL
 * @param {number} timeout - 앱 열기 시도 타임아웃 (ms)
 */
const openAppOrWeb = (appUrl, webUrl, timeout = 2000) => {
  // 모바일 환경인지 체크
  const isMobile = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  
  if (!isMobile) {
    // 데스크톱에서는 웹 URL로 바로 이동
    window.open(webUrl, '_blank');
    return;
  }

  // 앱 링크 시도
  const startTime = Date.now();
  
  // visibility change 이벤트로 앱이 열렸는지 감지
  const handleVisibilityChange = () => {
    if (document.hidden && Date.now() - startTime < timeout) {
      // 앱이 열렸음을 감지
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      return;
    }
  };
  
  document.addEventListener('visibilitychange', handleVisibilityChange);
  
  // 앱 링크 시도
  window.location.href = appUrl;
  
  // 타임아웃 후 앱이 열리지 않았으면 웹으로 이동
  setTimeout(() => {
    document.removeEventListener('visibilitychange', handleVisibilityChange);
    if (!document.hidden) {
      window.open(webUrl, '_blank');
    }
  }, timeout);
};

// 카카오맵 딥링크 헬퍼
export const kakaoMap = {
  // 장소 검색
  search: (query) => {
    const appUrl = `kakaomap://search?q=${encodeURIComponent(query)}`;
    const webUrl = `https://map.kakao.com/?q=${encodeURIComponent(query)}`;
    openAppOrWeb(appUrl, webUrl);
  },
  
  // 길찾기
  navigation: (destination, origin = '') => {
    const appUrl = origin 
      ? `kakaomap://route?sp=${encodeURIComponent(origin)}&ep=${encodeURIComponent(destination)}`
      : `kakaomap://route?ep=${encodeURIComponent(destination)}`;
    const webUrl = origin
      ? `https://map.kakao.com/link/to/${encodeURIComponent(destination)}`
      : `https://map.kakao.com/link/to/${encodeURIComponent(destination)}`;
    openAppOrWeb(appUrl, webUrl);
  },
  
  // 주변 검색 (카테고리별)
  nearby: (category, lat, lng) => {
    const appUrl = `kakaomap://search?q=${encodeURIComponent(category)}&p=${lat},${lng}`;
    const webUrl = `https://map.kakao.com/?q=${encodeURIComponent(category)}`;
    openAppOrWeb(appUrl, webUrl);
  }
};

// 네이버지도 딥링크
export const naverMap = {
  search: (query) => {
    const appUrl = `nmap://search?query=${encodeURIComponent(query)}`;
    const webUrl = `https://map.naver.com/v5/search/${encodeURIComponent(query)}`;
    openAppOrWeb(appUrl, webUrl);
  },
  
  navigation: (destination) => {
    const appUrl = `nmap://route/walk?dlat=0&dlng=0&dname=${encodeURIComponent(destination)}`;
    const webUrl = `https://map.naver.com/v5/directions/-/-/${encodeURIComponent(destination)}`;
    openAppOrWeb(appUrl, webUrl);
  }
};

// 배달 앱들
export const delivery = {
  baemin: (query = '') => {
    const appUrl = query 
      ? `baemin://search?q=${encodeURIComponent(query)}`
      : 'baemin://home';
    const webUrl = 'https://www.baemin.com';
    openAppOrWeb(appUrl, webUrl);
  },
  
  yogiyo: (query = '') => {
    const appUrl = query 
      ? `yogiyo://search?q=${encodeURIComponent(query)}`
      : 'yogiyo://home';
    const webUrl = 'https://www.yogiyo.co.kr';
    openAppOrWeb(appUrl, webUrl);
  }
};

// 택시 앱들
export const taxi = {
  kakao: (destination = '') => {
    const appUrl = destination 
      ? `kakaotaxi://taxi?destination=${encodeURIComponent(destination)}`
      : 'kakaotaxi://home';
    const webUrl = 'https://taxi.kakao.com';
    openAppOrWeb(appUrl, webUrl);
  },
  
  tada: (destination = '') => {
    const appUrl = destination 
      ? `tada://call?destination=${encodeURIComponent(destination)}`
      : 'tada://home';
    const webUrl = 'https://tadatada.com';
    openAppOrWeb(appUrl, webUrl);
  }
};

// 쇼핑 앱들
export const shopping = {
  coupang: (query = '') => {
    const appUrl = query 
      ? `coupang://search?q=${encodeURIComponent(query)}`
      : 'coupang://home';
    const webUrl = query 
      ? `https://www.coupang.com/np/search?q=${encodeURIComponent(query)}`
      : 'https://www.coupang.com';
    openAppOrWeb(appUrl, webUrl);
  },
  
  musinsa: (query = '') => {
    const appUrl = query 
      ? `musinsa://search?keyword=${encodeURIComponent(query)}`
      : 'musinsa://home';
    const webUrl = query 
      ? `https://www.musinsa.com/app/goods/lists?keyword=${encodeURIComponent(query)}`
      : 'https://www.musinsa.com';
    openAppOrWeb(appUrl, webUrl);
  },

  // 면세점 앱들
  lotteDutyFree: () => {
    const appUrl = 'lottedutyfree://home';
    const webUrl = 'https://www.lottedfs.com';
    openAppOrWeb(appUrl, webUrl);
  },

  shillaDutyFree: () => {
    const appUrl = 'shilladfs://home';
    const webUrl = 'https://www.shilladfs.com';
    openAppOrWeb(appUrl, webUrl);
  },

  shinsegaeDutyFree: () => {
    const appUrl = 'ssgdfs://home';
    const webUrl = 'https://www.ssgdfs.com';
    openAppOrWeb(appUrl, webUrl);
  }
};

// 숙박 앱들
export const accommodation = {
  yanolja: (query = '') => {
    const appUrl = query 
      ? `yanolja://search?keyword=${encodeURIComponent(query)}`
      : 'yanolja://home';
    const webUrl = query 
      ? `https://www.yanolja.com/search/domestic?keyword=${encodeURIComponent(query)}`
      : 'https://www.yanolja.com';
    openAppOrWeb(appUrl, webUrl);
  },
  
  goodchoice: (query = '') => {
    const appUrl = query 
      ? `goodchoice://search?q=${encodeURIComponent(query)}`
      : 'goodchoice://home';
    const webUrl = query 
      ? `https://www.goodchoice.kr/product/search?keyword=${encodeURIComponent(query)}`
      : 'https://www.goodchoice.kr';
    openAppOrWeb(appUrl, webUrl);
  },

  airbnb: (location = '') => {
    const appUrl = location 
      ? `airbnb://d/search?location=${encodeURIComponent(location)}`
      : 'airbnb://d/home';
    const webUrl = location 
      ? `https://www.airbnb.co.kr/s/${encodeURIComponent(location)}`
      : 'https://www.airbnb.co.kr';
    openAppOrWeb(appUrl, webUrl);
  }
};

// 카카오톡 딥링크
export const kakaoTalk = {
  // 메시지 보내기 (URL 스킴)
  sendMessage: (text = '') => {
    const appUrl = `kakaotalk://send?text=${encodeURIComponent(text)}`;
    const webUrl = 'https://talk.kakao.com';
    openAppOrWeb(appUrl, webUrl);
  },
  
  // 채널 추가
  addChannel: (channelId) => {
    const appUrl = `kakaotalk://plusfriend/friend/${channelId}`;
    const webUrl = `https://pf.kakao.com/${channelId}`;
    openAppOrWeb(appUrl, webUrl);
  }
};

// 유틸리티 함수들
export const utils = {
  // 현재 위치 기반 카카오맵 검색
  searchNearby: async (category) => {
    try {
      const position = await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject);
      });
      
      const { latitude, longitude } = position.coords;
      kakaoMap.nearby(category, latitude, longitude);
    } catch (error) {
      // 위치 권한이 없으면 일반 검색으로 폴백
      kakaoMap.search(category);
    }
  },
  
  // 전화걸기
  makeCall: (phoneNumber) => {
    window.location.href = `tel:${phoneNumber}`;
  },
  
  // SMS 보내기
  sendSMS: (phoneNumber, message = '') => {
    const url = `sms:${phoneNumber}${message ? `?body=${encodeURIComponent(message)}` : ''}`;
    window.location.href = url;
  }
};

// 기본 내보내기
export default {
  kakaoMap,
  naverMap,
  delivery,
  taxi,
  shopping,
  accommodation,
  kakaoTalk,
  utils
};