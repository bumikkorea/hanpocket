const KAKAO_APP_KEY = 'd93decd524c15c3455ff05983ca07fac';

// Kakao SDK 초기화
export const initKakao = () => {
  if (!window.Kakao) return false;
  if (window.Kakao.isInitialized()) return true;
  try {
    window.Kakao.init(KAKAO_APP_KEY);
    return true;
  } catch (e) {
    console.error('Kakao init failed:', e);
    return false;
  }
};

// 카카오 로그인 (팝업 방식 — 백엔드 불필요)
export const loginWithKakao = () => {
  return new Promise((resolve, reject) => {
    if (!initKakao()) {
      reject(new Error('Kakao SDK 초기화 실패'));
      return;
    }

    window.Kakao.Auth.login({
      success: (authObj) => {
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
          fail: (err) => reject(err)
        });
      },
      fail: (err) => reject(err)
    });
  });
};

// 팝업 방식과 동일 (호환용)
export const loginWithKakaoPopup = loginWithKakao;

// 콜백 처리 (리다이렉트 방식 제거 — code 파라미터만 정리)
export const handleKakaoCallback = async () => {
  const code = new URLSearchParams(window.location.search).get('code');
  if (code) {
    window.history.replaceState({}, '', window.location.pathname);
  }
  return null;
};

// 카카오 로그아웃
export const logoutFromKakao = () => {
  return new Promise((resolve) => {
    localStorage.removeItem('kakao_user');
    if (window.Kakao?.Auth) {
      try { window.Kakao.Auth.logout(() => resolve()); } catch { resolve(); }
    } else {
      resolve();
    }
  });
};

// 저장된 사용자 정보
export const getKakaoUser = () => {
  try {
    const s = localStorage.getItem('kakao_user');
    return s ? JSON.parse(s) : null;
  } catch { return null; }
};

export const isKakaoLoggedIn = () => !!getKakaoUser();
