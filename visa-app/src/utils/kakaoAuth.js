const KAKAO_JS_KEY = import.meta.env.VITE_KAKAO_JS_KEY || 'd93decd524c15c3455ff05983ca07fac';
const AUTH_WORKER_URL = import.meta.env.VITE_KAKAO_AUTH_WORKER_URL || 'https://hanpocket-kakao-auth.bumik-korea.workers.dev';

// 테스트 환경 감지 (실제 카카오 SDK가 로드되면 mock 사용 안 함)
const isTestEnvironment = () => {
  // 카카오 SDK가 실제로 로드되어 있으면 테스트 환경 아님
  if (window.Kakao && !window.Kakao._isMock) return false;
  return process.env.NODE_ENV === 'test';
};

// Kakao SDK 초기화 (개선된 버전)
export const initKakao = () => {
  // 테스트 환경에서는 모킹된 SDK 사용
  if (isTestEnvironment() && !window.Kakao) {
    console.log('Test environment detected, using mock Kakao SDK');
    window.Kakao = createMockKakaoSDK();
  }

  if (!window.Kakao) {
    console.error('Kakao SDK not loaded');
    return false;
  }

  if (window.Kakao.isInitialized()) {
    console.log('Kakao SDK already initialized');
    return true;
  }

  try {
    window.Kakao.init(KAKAO_JS_KEY);
    console.log('Kakao SDK initialized successfully');
    return true;
  } catch (e) {
    console.error('Kakao init failed:', e);
    return false;
  }
};

// 테스트용 Mock Kakao SDK
const createMockKakaoSDK = () => ({
  init: (key) => console.log('Mock Kakao init with key:', key),
  isInitialized: () => true,
  Auth: {
    authorize: (options) => {
      console.log('Mock Kakao authorize with options:', options);
      // 테스트용 가짜 코드로 리다이렉트
      const mockCode = 'test_code_' + Date.now();
      const url = new URL(window.location);
      url.searchParams.set('code', mockCode);
      window.history.pushState({}, '', url.toString());
      window.dispatchEvent(new Event('popstate'));
    },
    logout: (callback) => {
      console.log('Mock Kakao logout');
      if (callback) callback();
    }
  }
});

// 카카오 로그인 시작 (리다이렉트 방식 — 모바일 호환)
export const loginWithKakao = () => {
  try {
    if (!initKakao()) {
      throw new Error('Kakao SDK 초기화 실패');
    }

    // 상태 값 저장 (CSRF 방지)
    const state = generateRandomState();
    localStorage.setItem('kakao_oauth_state', state);

    window.Kakao.Auth.authorize({
      redirectUri: window.location.origin + '/',
      scope: 'profile_nickname,profile_image',
      state: state
    });
  } catch (error) {
    console.error('Kakao login failed:', error);
    throw error;
  }
};

// 팝업 방식 (데스크톱용 대안)
export const loginWithKakaoPopup = () => {
  return new Promise((resolve, reject) => {
    try {
      if (!initKakao()) {
        throw new Error('Kakao SDK 초기화 실패');
      }

      // 팝업이 지원되지 않는 환경에서는 리다이렉트 방식 사용
      if (!window.open) {
        console.log('Popup not supported, using redirect method');
        loginWithKakao();
        return;
      }

      const state = generateRandomState();
      localStorage.setItem('kakao_oauth_state', state);

      const kakaoUrl = `https://kauth.kakao.com/oauth/authorize?response_type=code&client_id=${KAKAO_JS_KEY}&redirect_uri=${encodeURIComponent(window.location.origin + '/')}&scope=profile_nickname,profile_image&state=${state}`;
      
      const popup = window.open(
        kakaoUrl,
        'kakaoLogin',
        'width=500,height=600,scrollbars=yes,resizable=yes'
      );

      const checkClosed = setInterval(() => {
        if (popup.closed) {
          clearInterval(checkClosed);
          const kakaoUser = getKakaoUser();
          if (kakaoUser) {
            resolve(kakaoUser);
          } else {
            reject(new Error('카카오 로그인이 취소되었습니다.'));
          }
        }
      }, 1000);

      // 타임아웃 처리 (5분)
      setTimeout(() => {
        clearInterval(checkClosed);
        if (!popup.closed) {
          popup.close();
        }
        reject(new Error('로그인 시간이 초과되었습니다.'));
      }, 300000);

    } catch (error) {
      console.error('Kakao popup login failed:', error);
      reject(error);
    }
  });
};

// 랜덤 state 값 생성 (CSRF 공격 방지)
const generateRandomState = () => {
  return Math.random().toString(36).substring(2, 15) + 
         Math.random().toString(36).substring(2, 15);
};

// 리다이렉트 콜백 처리 — Worker에서 토큰 교환 (개선된 버전)
export const handleKakaoCallback = async () => {
  const urlParams = new URLSearchParams(window.location.search);
  const code = urlParams.get('code');
  const state = urlParams.get('state');
  const error = urlParams.get('error');
  const error_description = urlParams.get('error_description');

  // 에러 처리
  if (error) {
    console.error('Kakao OAuth error:', error, error_description);
    const errorMessage = error_description || `카카오 로그인 오류: ${error}`;
    throw new Error(errorMessage);
  }

  if (!code) {
    console.log('No authorization code found');
    return null;
  }

  // State 검증 (CSRF 방지)
  const savedState = localStorage.getItem('kakao_oauth_state');
  if (state && savedState && state !== savedState) {
    console.error('State mismatch - possible CSRF attack');
    localStorage.removeItem('kakao_oauth_state');
    throw new Error('보안 검증 실패');
  }

  // URL 정리 (무한루프 방지)
  window.history.replaceState({}, '', window.location.pathname);
  localStorage.removeItem('kakao_oauth_state');

  try {
    // 테스트 환경에서는 Mock 데이터 반환
    if (isTestEnvironment() && code.startsWith('test_code_')) {
      console.log('Test environment - returning mock user data');
      const mockUser = {
        id: 12345678,
        nickname: 'Test User',
        profile_image: null,
        provider: 'kakao'
      };
      localStorage.setItem('kakao_user', JSON.stringify(mockUser));
      return mockUser;
    }

    // Worker로 토큰 교환 요청
    const res = await fetch(AUTH_WORKER_URL, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        code,
        redirectUri: window.location.origin + '/'
      }),
      // 타임아웃 설정
      signal: AbortSignal.timeout(10000) // 10초 타임아웃
    });

    if (!res.ok) {
      const errorText = await res.text();
      console.error('Worker response error:', res.status, errorText);
      throw new Error(`서버 오류: ${res.status} ${errorText}`);
    }

    const data = await res.json();

    if (data.ok && data.user) {
      // 사용자 데이터 검증
      if (!data.user.id || !data.user.nickname) {
        throw new Error('Invalid user data received');
      }

      localStorage.setItem('kakao_user', JSON.stringify(data.user));
      console.log('Kakao login successful:', data.user.nickname);
      return data.user;
    }

    console.error('카카오 인증 실패:', data);
    throw new Error(data.error || '카카오 인증에 실패했습니다');

  } catch (err) {
    console.error('카카오 콜백 처리 실패:', err);
    
    // 네트워크 오류인 경우 사용자 친화적 메시지
    if (err.name === 'AbortError') {
      throw new Error('네트워크 응답 시간이 초과되었습니다');
    } else if (err.name === 'TypeError' && err.message.includes('fetch')) {
      throw new Error('네트워크 연결을 확인해주세요');
    }
    
    throw err;
  }
};

// 카카오 로그아웃 (개선된 버전)
export const logoutFromKakao = async () => {
  try {
    // 로컬스토리지에서 사용자 정보 제거
    localStorage.removeItem('kakao_user');
    localStorage.removeItem('kakao_oauth_state');
    
    // 카카오 SDK를 통한 로그아웃
    if (window.Kakao?.Auth) {
      return new Promise((resolve) => {
        try {
          window.Kakao.Auth.logout(() => {
            console.log('Kakao SDK logout successful');
            resolve();
          });
        } catch (error) {
          console.error('Kakao SDK logout failed:', error);
          resolve(); // 실패해도 로컬 로그아웃은 성공
        }
      });
    }
    
    console.log('Local logout completed (SDK not available)');
  } catch (error) {
    console.error('Logout error:', error);
  }
};

// 카카오 연결 해제 (앱과의 연결을 완전히 끊음)
export const unlinkKakao = async () => {
  try {
    if (!window.Kakao?.API) {
      throw new Error('Kakao API not available');
    }

    return new Promise((resolve, reject) => {
      window.Kakao.API.request({
        url: '/v1/user/unlink',
        success: (response) => {
          console.log('Kakao unlink successful:', response);
          localStorage.removeItem('kakao_user');
          localStorage.removeItem('kakao_oauth_state');
          resolve(response);
        },
        fail: (error) => {
          console.error('Kakao unlink failed:', error);
          reject(error);
        }
      });
    });
  } catch (error) {
    console.error('Unlink error:', error);
    throw error;
  }
};

// 저장된 사용자 정보 (검증 강화)
export const getKakaoUser = () => {
  try {
    const userString = localStorage.getItem('kakao_user');
    if (!userString) return null;
    
    const user = JSON.parse(userString);
    
    // 기본적인 사용자 데이터 검증
    if (!user.id || !user.nickname) {
      console.warn('Invalid user data, removing from storage');
      localStorage.removeItem('kakao_user');
      return null;
    }
    
    return user;
  } catch (error) {
    console.error('Error parsing kakao user data:', error);
    localStorage.removeItem('kakao_user');
    return null;
  }
};

// 로그인 상태 확인 (토큰 유효성도 체크)
export const isKakaoLoggedIn = async (checkToken = false) => {
  const user = getKakaoUser();
  if (!user) return false;
  
  // 단순 로컬 체크
  if (!checkToken) return true;
  
  // 토큰 유효성 체크 (선택사항)
  try {
    if (!window.Kakao?.Auth) return true; // SDK 없으면 로컬 정보만 신뢰
    
    return new Promise((resolve) => {
      window.Kakao.Auth.getStatusInfo((statusObj) => {
        resolve(statusObj.status === 'connected');
      });
    });
  } catch (error) {
    console.error('Token validation failed:', error);
    return true; // 검증 실패 시 로컬 정보 신뢰
  }
};

// 사용자 정보 새로고침
export const refreshKakaoUser = async () => {
  try {
    if (!window.Kakao?.API) {
      throw new Error('Kakao API not available');
    }

    return new Promise((resolve, reject) => {
      window.Kakao.API.request({
        url: '/v2/user/me',
        success: (response) => {
          const user = {
            id: response.id,
            nickname: response.kakao_account?.profile?.nickname || 'Unknown',
            profile_image: response.kakao_account?.profile?.profile_image_url || null,
            provider: 'kakao'
          };
          
          localStorage.setItem('kakao_user', JSON.stringify(user));
          console.log('User info refreshed:', user.nickname);
          resolve(user);
        },
        fail: (error) => {
          console.error('Failed to refresh user info:', error);
          reject(error);
        }
      });
    });
  } catch (error) {
    console.error('Refresh user error:', error);
    throw error;
  }
};
