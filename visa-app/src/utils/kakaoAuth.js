// ⚠️ 카카오 개발자 콘솔에서 Redirect URI 설정이 필요합니다!
// 카카오 개발자 콘솔 (https://developers.kakao.com) → 내 애플리케이션 → 앱 설정 → 플랫폼 → Web → 
// 사이트 도메인과 Redirect URI를 현재 도메인으로 설정해주세요.
// 예: https://yourapp.com, https://yourapp.com/oauth

const KAKAO_APP_KEY = '5e0e466ca30c0807b0c563f1d35f43a8';

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
    console.log('Kakao SDK 초기화 완료');
    return true;
  } catch (error) {
    console.error('Kakao SDK 초기화 실패:', error);
    return false;
  }
};

// 카카오 로그인
export const loginWithKakao = () => {
  return new Promise((resolve, reject) => {
    if (!initKakao()) {
      reject(new Error('Kakao SDK 초기화 실패'));
      return;
    }

    window.Kakao.Auth.login({
      success: (authObj) => {
        console.log('카카오 로그인 성공:', authObj);
        
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
            
            // localStorage에 사용자 정보 저장
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
  return new Promise((resolve, reject) => {
    if (!window.Kakao || !window.Kakao.Auth) {
      // SDK가 없어도 로컬 데이터는 정리
      localStorage.removeItem('kakao_user');
      resolve();
      return;
    }

    window.Kakao.Auth.logout({
      success: () => {
        localStorage.removeItem('kakao_user');
        console.log('카카오 로그아웃 완료');
        resolve();
      },
      fail: (error) => {
        console.error('카카오 로그아웃 실패:', error);
        // 실패해도 로컬 데이터는 정리
        localStorage.removeItem('kakao_user');
        reject(error);
      }
    });
  });
};

// 저장된 카카오 사용자 정보 가져오기
export const getKakaoUser = () => {
  try {
    const userStr = localStorage.getItem('kakao_user');
    return userStr ? JSON.parse(userStr) : null;
  } catch (error) {
    console.error('저장된 사용자 정보 조회 실패:', error);
    return null;
  }
};

// 카카오 로그인 상태 확인
export const isKakaoLoggedIn = () => {
  const user = getKakaoUser();
  return !!user;
};