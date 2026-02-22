const KAKAO_JS_KEY = 'd93decd524c15c3455ff05983ca07fac';
const AUTH_WORKER_URL = 'https://hanpocket-kakao-auth.bumik-korea.workers.dev';

// Kakao SDK 초기화
export const initKakao = () => {
  if (!window.Kakao) return false;
  if (window.Kakao.isInitialized()) return true;
  try {
    window.Kakao.init(KAKAO_JS_KEY);
    return true;
  } catch (e) {
    console.error('Kakao init failed:', e);
    return false;
  }
};

// 카카오 로그인 시작 (리다이렉트 방식 — 모바일 호환)
export const loginWithKakao = () => {
  if (!initKakao()) throw new Error('Kakao SDK 초기화 실패');
  
  window.Kakao.Auth.authorize({
    redirectUri: window.location.origin + '/',
    scope: 'profile_nickname,profile_image'
  });
};

// 팝업 방식 (호환용 — 데스크톱)
export const loginWithKakaoPopup = loginWithKakao;

// 리다이렉트 콜백 처리 — Worker에서 토큰 교환
export const handleKakaoCallback = async () => {
  const urlParams = new URLSearchParams(window.location.search);
  const code = urlParams.get('code');
  
  if (!code) return null;
  
  // URL 정리 (무한루프 방지)
  window.history.replaceState({}, '', window.location.pathname);
  
  try {
    const res = await fetch(AUTH_WORKER_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        code,
        redirectUri: window.location.origin + '/'
      })
    });
    
    const data = await res.json();
    
    if (data.ok && data.user) {
      localStorage.setItem('kakao_user', JSON.stringify(data.user));
      return data.user;
    }
    
    console.error('카카오 인증 실패:', data);
    return null;
  } catch (err) {
    console.error('카카오 콜백 처리 실패:', err);
    return null;
  }
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
