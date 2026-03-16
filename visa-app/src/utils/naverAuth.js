// 네이버 OAuth 인증 모듈

const NAVER_CLIENT_ID = import.meta.env.VITE_NAVER_CLIENT_ID
const NAVER_CLIENT_SECRET = import.meta.env.VITE_NAVER_CLIENT_SECRET
const NAVER_REDIRECT_URI = window.location.origin + '/'

/**
 * 네이버 로그인 페이지로 리다이렉트
 */
export function loginWithNaver() {
  const state = Math.random().toString(36).substring(2, 15)
  localStorage.setItem('naver_oauth_state', state)
  
  const naverLoginUrl = `https://nid.naver.com/oauth2.0/authorize?` +
    `response_type=code&` +
    `client_id=${NAVER_CLIENT_ID}&` +
    `redirect_uri=${encodeURIComponent(NAVER_REDIRECT_URI)}&` +
    `state=${state}`
  
  window.location.href = naverLoginUrl
}

/**
 * 네이버 OAuth 콜백 처리
 * @param {string} code - 네이버에서 받은 authorization code
 * @param {string} state - 네이버에서 받은 state 값
 * @returns {Promise<Object|null>} 사용자 정보 또는 null
 */
export async function handleNaverCallback() {
  try {
    const urlParams = new URLSearchParams(window.location.search)
    const code = urlParams.get('code')
    const state = urlParams.get('state')
    const storedState = localStorage.getItem('naver_oauth_state')
    
    if (!code || !state || state !== storedState) {
      console.error('네이버 OAuth: Invalid parameters or state mismatch')
      return null
    }
    
    // 실제 프로덕션에서는 백엔드에서 토큰 교환을 처리해야 함
    // 현재는 클라이언트에서 직접 처리하나 보안상 권장되지 않음
    const tokenResponse = await fetch('https://nid.naver.com/oauth2.0/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        client_id: NAVER_CLIENT_ID,
        client_secret: NAVER_CLIENT_SECRET,
        code: code,
        state: state,
      }),
    })
    
    if (!tokenResponse.ok) {
      throw new Error('Failed to exchange code for token')
    }
    
    const tokenData = await tokenResponse.json()
    
    if (tokenData.error) {
      throw new Error(tokenData.error_description || tokenData.error)
    }
    
    // 사용자 정보 가져오기
    const userResponse = await fetch('https://openapi.naver.com/v1/nid/me', {
      headers: {
        'Authorization': `Bearer ${tokenData.access_token}`,
      },
    })
    
    if (!userResponse.ok) {
      throw new Error('Failed to fetch user info')
    }
    
    const userData = await userResponse.json()
    
    if (userData.resultcode !== '00') {
      throw new Error(userData.message || 'Failed to get user info')
    }
    
    // localStorage에서 state 정리
    localStorage.removeItem('naver_oauth_state')
    
    // 사용자 정보 반환 (kakaoAuth와 동일한 형식)
    return {
      id: userData.response.id,
      nickname: userData.response.nickname || userData.response.name,
      name: userData.response.name,
      email: userData.response.email,
      profileImage: userData.response.profile_image,
      provider: 'naver',
    }
    
  } catch (error) {
    console.error('네이버 OAuth 에러:', error)
    localStorage.removeItem('naver_oauth_state')
    return null
  }
}

/**
 * 네이버 로그아웃
 */
export function logoutFromNaver() {
  localStorage.removeItem('naver_oauth_state')
  // 네이버는 별도의 로그아웃 API가 없으므로 로컬에서만 처리
}

/**
 * 현재 네이버 로그인 상태인지 확인
 */
export function isNaverLoggedIn() {
  // 실제 구현에서는 토큰 유효성 검증 등이 필요
  return false
}