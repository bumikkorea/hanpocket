// ⚠️ 카카오 개발자 콘솔 설정 필요:
// 1. 플랫폼 → Web → 사이트 도메인: https://hanpocket.pages.dev
// 2. 카카오 로그인 → 활성화 ON
// 3. 카카오 로그인 → Redirect URI: https://hanpocket.pages.dev

const KAKAO_APP_KEY = 'd93decd524c15c3455ff05983ca07fac';

// Kakao SDK 초기화
export const initKakao = () => {
  if (!window.Kakao) {
    console.error('Kakao SDK가 로드되지 않았습니다.');
    return false;
  }
  
  if (window.Kakao.isInitialized()) {
    return true;
  }
  
  try {
    window.Kakao.init(KAKAO_APP_KEY);
    return true;
  } catch (error) {
    console.error('Kakao SDK 초기화 실패:', error);
    return false;
  }
};

// 카카오 로그인 (Redirect 방식 — 모바일 Safari 호환)
export const loginWithKakao = () => {
  if (!initKakao()) {
    throw new Error('Kakao SDK 초기화 실패');
  }
  
  window.Kakao.Auth.authorize({
    redirectUri: window.location.origin + '/',
    scope: 'profile_nickname,profile_image'
  });
};

// OAuth 인가 코드로 토큰 받기 + 사용자 정보 저장
export const handleKakaoCallback = async () => {
  const urlParams = new URLSearchParams(window.location.search);
  const code = urlParams.get('code');
  
  if (!code) return null;
  
  if (!initKakao()) return null;
  
  // URL에서 code 파라미터 제거
  window.history.replaceState({}, '', window.location.pathname);
  
  try {
    // REST API로 토큰 발급은 백엔드 필요 → JS SDK 팝업 방식 사용
    // 대신 Kakao.Auth.setAccessToken 후 사용자 정보 조회
    // 현재는 간단한 팝업 로그인으로 대체
    return null;
  } catch (error) {
    console.error('카카오 콜백 처리 실패:', error);
    return null;
  }
};

// 카카오 로그인 (팝업 방식 — 백엔드 없이 작동)
export const loginWithKakaoPopup = () => {
  return new Promise((resolve, reject) => {
    if (!initKakao()) {
      reject(new Error('Kakao SDK 초기화 실패'));
      return;
    }

    window.Kakao.Auth.login({
      success: (authObj) => {
        // 사용자 정보 가져오기
        window.Kakao.API.request({
          url: '/v2/user/me',
          success: (res) => {
            const { id, kakao_account } = res;
            const userInfo = {
              id,
              nickname: kakao_account?.profile?.nickname || '',
              profile_image: kakao_account?.profile?.profile_image_url || '',
              email: kakao_account?.email || '',
              loginType: 'kakao',
              loginTime: new Date().toISOString()
            };
            
            localStorage.setItem('kakao_user', JSON.stringify(userInfo));
            resolve(userInfo);
          },
          fail: (error) => {
            console.error('사용자 정보 조회 실패:', error);
            reject(error);
          }
        });
      },
      fail: (error) => {
        console.error('카카오 로그인 실패:', error);
        reject(error);
      }
    });
  });
};

// 카카오 로그아웃
export const logoutFromKakao = () => {
  return new Promise((resolve) => {
    localStorage.removeItem('kakao_user');
    
    if (window.Kakao?.Auth) {
      try {
        window.Kakao.Auth.logout(() => resolve());
      } catch {
        resolve();
      }
    } else {
      resolve();
    }
  });
};

// 저장된 카카오 사용자 정보 가져오기
export const getKakaoUser = () => {
  try {
    const userStr = localStorage.getItem('kakao_user');
    return userStr ? JSON.parse(userStr) : null;
  } catch {
    return null;
  }
};

// 카카오 로그인 상태 확인
export const isKakaoLoggedIn = () => !!getKakaoUser();
