// Apple 로그인 유틸리티
// Apple Sign in with Apple JS SDK 사용

let appleAuth = null
let currentUser = null

// Apple 로그인 초기화
export const initApple = () => {
  try {
    // Apple Sign in with Apple JS SDK 로드
    if (window.AppleID) {
      console.log('Apple ID SDK already loaded')
      return Promise.resolve()
    }

    return new Promise((resolve, reject) => {
      const script = document.createElement('script')
      script.src = 'https://appleid.cdn-apple.com/appleauth/static/jsapi/appleid/1/en_US/appleid.auth.js'
      script.onload = () => {
        if (window.AppleID) {
          window.AppleID.auth.init({
            clientId: import.meta.env.VITE_APPLE_CLIENT_ID || 'com.hanpocket.signin',
            scope: 'name email',
            redirectURI: window.location.origin + '/auth/apple/callback',
            state: 'origin:web',
            usePopup: true
          })
          console.log('Apple ID SDK initialized')
          resolve()
        } else {
          reject(new Error('Apple ID SDK failed to load'))
        }
      }
      script.onerror = () => {
        reject(new Error('Failed to load Apple ID SDK'))
      }
      document.head.appendChild(script)
    })
  } catch (error) {
    console.error('Apple 초기화 실패:', error)
    return Promise.reject(error)
  }
}

// Apple 로그인
export const loginWithApple = async () => {
  try {
    console.log('Apple 로그인 시도...')
    
    // Apple SDK 초기화
    await initApple()

    if (!window.AppleID) {
      throw new Error('Apple ID SDK not available')
    }

    // Apple 로그인 실행
    const data = await window.AppleID.auth.signIn()
    
    if (data && data.authorization) {
      const { authorization } = data
      
      // 사용자 정보 구성
      const userInfo = {
        id: authorization.user,
        email: data.user?.email,
        name: data.user?.name ? `${data.user.name.firstName} ${data.user.name.lastName}` : null,
        nickname: data.user?.name ? data.user.name.firstName : 'Apple 사용자',
        provider: 'apple',
        token: authorization.id_token,
        authorizationCode: authorization.code
      }

      // 로컬 스토리지에 저장
      currentUser = userInfo
      localStorage.setItem('apple_user', JSON.stringify(userInfo))
      
      console.log('Apple 로그인 성공:', userInfo.nickname)
      return userInfo
    } else {
      throw new Error('Apple 로그인 응답이 올바르지 않습니다.')
    }
  } catch (error) {
    console.error('Apple 로그인 실패:', error)
    
    // 사용자 취소인 경우
    if (error.error === 'popup_closed_by_user' || error.error === 'user_cancelled_authorize') {
      throw new Error('사용자가 로그인을 취소했습니다.')
    }
    
    // 기타 오류
    throw new Error('Apple 로그인 중 오류가 발생했습니다.')
  }
}

// Apple 로그아웃
export const logoutFromApple = () => {
  try {
    currentUser = null
    localStorage.removeItem('apple_user')
    console.log('Apple 로그아웃 완료')
    
    // Apple SDK는 별도의 로그아웃 메소드가 없음
    // 브라우저의 쿠키/세션은 Apple에서 관리
    
    return true
  } catch (error) {
    console.error('Apple 로그아웃 실패:', error)
    return false
  }
}

// Apple 사용자 정보 가져오기
export const getAppleUser = () => {
  try {
    if (currentUser) {
      return currentUser
    }

    const savedUser = localStorage.getItem('apple_user')
    if (savedUser) {
      currentUser = JSON.parse(savedUser)
      return currentUser
    }

    return null
  } catch (error) {
    console.error('Apple 사용자 정보 가져오기 실패:', error)
    return null
  }
}

// Apple 로그인 상태 확인
export const isAppleLoggedIn = () => {
  const user = getAppleUser()
  return user !== null
}

// Apple 콜백 처리 (필요시 사용)
export const handleAppleCallback = (authorizationResponse) => {
  try {
    // Apple 콜백 처리 로직
    console.log('Apple 콜백 처리:', authorizationResponse)
    return authorizationResponse
  } catch (error) {
    console.error('Apple 콜백 처리 실패:', error)
    throw error
  }
}

// Apple 사용자 토큰 갱신 (필요시 사용)
export const refreshAppleToken = async () => {
  try {
    const user = getAppleUser()
    if (!user || !user.authorizationCode) {
      throw new Error('Apple 사용자 정보가 없습니다.')
    }

    // 실제 서버에서 토큰 갱신 로직 구현 필요
    console.log('Apple 토큰 갱신 필요 - 서버 구현 필요')
    
    return user
  } catch (error) {
    console.error('Apple 토큰 갱신 실패:', error)
    throw error
  }
}

export default {
  initApple,
  loginWithApple,
  logoutFromApple,
  getAppleUser,
  isAppleLoggedIn,
  handleAppleCallback,
  refreshAppleToken
}