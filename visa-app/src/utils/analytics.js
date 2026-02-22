// Google Analytics 4 (GA4) 유틸리티 함수

// GA4 측정 ID (환경 변수에서 가져오거나 기본값 사용)
const GA_MEASUREMENT_ID = import.meta.env.VITE_GA_MEASUREMENT_ID || 'G-XXXXXXXXXX'

/**
 * GA4 초기화
 * 개인정보보호 설정 포함 (IP 익명화, 쿠키 동의 등)
 */
export const initGA = () => {
  // gtag 라이브러리가 로드되었는지 확인
  if (typeof gtag === 'undefined') {
    console.warn('gtag is not loaded yet')
    return
  }

  // GA4 기본 설정
  gtag('config', GA_MEASUREMENT_ID, {
    // 개인정보보호 설정
    anonymize_ip: true, // IP 익명화
    allow_google_signals: false, // Google 신호 비활성화
    allow_ad_personalization_signals: false, // 광고 개인화 비활성화
    
    // 성능 최적화
    transport_type: 'beacon',
    
    // 디버깅 (개발 환경에서만)
    debug_mode: import.meta.env.DEV,
    
    // 사용자 동의 설정 (GDPR/개인정보보호법 준수)
    consent: 'granted',
    
    // 페이지뷰 자동 전송 비활성화 (수동으로 제어)
    send_page_view: false
  })

  console.log('GA4 initialized with ID:', GA_MEASUREMENT_ID)
}

/**
 * 쿠키 동의 상태 설정
 * @param {boolean} analyticsConsent - 분석 쿠키 동의 여부
 * @param {boolean} adConsent - 광고 쿠키 동의 여부
 */
export const setConsentMode = (analyticsConsent = true, adConsent = false) => {
  if (typeof gtag === 'undefined') return

  gtag('consent', 'update', {
    'analytics_storage': analyticsConsent ? 'granted' : 'denied',
    'ad_storage': adConsent ? 'granted' : 'denied',
    'ad_user_data': adConsent ? 'granted' : 'denied',
    'ad_personalization': adConsent ? 'granted' : 'denied'
  })
}

/**
 * 페이지뷰 추적
 * @param {string} page_title - 페이지 제목
 * @param {string} page_location - 페이지 URL (선택)
 * @param {string} content_group - 컨텐츠 그룹 (탭 이름 등)
 */
export const trackPageView = (page_title, page_location = null, content_group = null) => {
  if (typeof gtag === 'undefined') return

  const params = {
    page_title,
    page_location: page_location || window.location.href,
    send_to: GA_MEASUREMENT_ID
  }

  if (content_group) {
    params.content_group1 = content_group
  }

  gtag('event', 'page_view', params)
  
  console.log('Page view tracked:', page_title, content_group)
}

/**
 * 사용자 정의 이벤트 추적
 * @param {string} event_name - 이벤트 이름
 * @param {object} parameters - 이벤트 파라미터
 */
export const trackEvent = (event_name, parameters = {}) => {
  if (typeof gtag === 'undefined') return

  const eventParams = {
    ...parameters,
    send_to: GA_MEASUREMENT_ID
  }

  gtag('event', event_name, eventParams)
  
  console.log('Event tracked:', event_name, parameters)
}

/**
 * 로그인 이벤트 추적
 * @param {string} method - 로그인 방법 ('kakao', 'google', 'apple', 'guest' 등)
 * @param {string} user_type - 사용자 유형 ('tourist', 'resident')
 */
export const trackLogin = (method, user_type = null) => {
  trackEvent('login', {
    method,
    user_type,
    event_category: 'authentication',
    event_label: `${method}_login`
  })
}

/**
 * 탭 전환 이벤트 추적
 * @param {string} tab_name - 탭 이름
 * @param {string} from_tab - 이전 탭 (선택)
 */
export const trackTabSwitch = (tab_name, from_tab = null) => {
  trackEvent('tab_switch', {
    tab_name,
    from_tab,
    event_category: 'navigation',
    event_label: `switch_to_${tab_name}`
  })
}

/**
 * 번역 사용 이벤트 추적
 * @param {string} from_lang - 원본 언어
 * @param {string} to_lang - 번역 대상 언어
 * @param {string} translation_type - 번역 유형 ('text', 'ar', 'voice' 등)
 */
export const trackTranslation = (from_lang, to_lang, translation_type = 'text') => {
  trackEvent('translation_used', {
    from_language: from_lang,
    to_language: to_lang,
    translation_type,
    event_category: 'feature_usage',
    event_label: `translate_${from_lang}_to_${to_lang}`
  })
}

/**
 * 맛집/장소 검색 이벤트 추적
 * @param {string} search_term - 검색어
 * @param {string} search_type - 검색 유형 ('restaurant', 'hospital', 'travel' 등)
 * @param {number} results_count - 검색 결과 수
 */
export const trackSearch = (search_term, search_type, results_count = 0) => {
  trackEvent('search', {
    search_term,
    search_type,
    results_count,
    event_category: 'search',
    event_label: `${search_type}_search`
  })
}

/**
 * 비자 관련 이벤트 추적
 * @param {string} action - 액션 ('view_visa_detail', 'visa_transition_check', 'document_guide_view' 등)
 * @param {string} visa_type - 비자 유형
 * @param {object} additional_params - 추가 파라미터
 */
export const trackVisaEvent = (action, visa_type = null, additional_params = {}) => {
  trackEvent(action, {
    visa_type,
    event_category: 'visa_services',
    ...additional_params
  })
}

/**
 * 카카오 관련 이벤트 추적
 * @param {string} action - 액션 ('kakao_login_attempt', 'kakao_login_success', 'kakao_logout' 등)
 * @param {object} additional_params - 추가 파라미터
 */
export const trackKakaoEvent = (action, additional_params = {}) => {
  trackEvent(action, {
    event_category: 'kakao_integration',
    event_label: action,
    ...additional_params
  })
}

/**
 * 푸시 알림 이벤트 추적
 * @param {string} action - 액션 ('notification_granted', 'notification_denied', 'notification_sent' 등)
 * @param {string} notification_type - 알림 유형 ('visa_expiry', 'general' 등)
 */
export const trackNotificationEvent = (action, notification_type = null) => {
  trackEvent(action, {
    notification_type,
    event_category: 'notifications',
    event_label: `notification_${action}`
  })
}

/**
 * 언어 변경 이벤트 추적
 * @param {string} from_lang - 이전 언어
 * @param {string} to_lang - 변경된 언어
 */
export const trackLanguageChange = (from_lang, to_lang) => {
  trackEvent('language_change', {
    from_language: from_lang,
    to_language: to_lang,
    event_category: 'user_preference',
    event_label: `lang_${from_lang}_to_${to_lang}`
  })
}

/**
 * 에러 이벤트 추적
 * @param {string} error_message - 에러 메시지
 * @param {string} error_location - 에러 발생 위치
 * @param {boolean} fatal - 치명적 에러 여부
 */
export const trackError = (error_message, error_location, fatal = false) => {
  trackEvent('exception', {
    description: error_message,
    error_location,
    fatal,
    event_category: 'error',
    event_label: error_location
  })
}

/**
 * 앱 설치/PWA 관련 이벤트 추적
 * @param {string} action - 액션 ('app_install_prompt', 'app_installed', 'pwa_add_to_home' 등)
 */
export const trackAppInstall = (action) => {
  trackEvent(action, {
    event_category: 'app_install',
    event_label: action
  })
}

export default {
  initGA,
  setConsentMode,
  trackPageView,
  trackEvent,
  trackLogin,
  trackTabSwitch,
  trackTranslation,
  trackSearch,
  trackVisaEvent,
  trackKakaoEvent,
  trackNotificationEvent,
  trackLanguageChange,
  trackError,
  trackAppInstall
}