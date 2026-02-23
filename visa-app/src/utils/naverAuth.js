const NAVER_CLIENT_ID = import.meta.env.VITE_NAVER_CLIENT_ID || 'PzqPsRDvonSey7gqsGBO';
const NAVER_CLIENT_SECRET = 'YOUR_NAVER_CLIENT_SECRET'; // 네이버 개발자센터에서 발급받은 Client Secret
const NAVER_REDIRECT_URI = window.location.origin + '/naver-callback';

// 네이버 로그인 시작 (팝업 방식)
export const loginWithNaver = () => {
  const naverLoginUrl = 'https://nid.naver.com/oauth2.0/authorize?' +
    new URLSearchParams({
      response_type: 'code',
      client_id: NAVER_CLIENT_ID,
      redirect_uri: NAVER_REDIRECT_URI,
      state: generateRandomState(), // CSRF 공격 방지를 위한 state 값
      scope: 'name,email,profile_image'
    });

  // 팝업 창으로 네이버 로그인 페이지 열기
  const popup = window.open(
    naverLoginUrl,
    'naverLogin',
    'width=500,height=600,scrollbars=yes,resizable=yes'
  );

  return new Promise((resolve, reject) => {
    const checkClosed = setInterval(() => {
      if (popup.closed) {
        clearInterval(checkClosed);
        const naverUser = getNaverUser();
        if (naverUser) {
          resolve(naverUser);
        } else {
          reject(new Error('네이버 로그인이 취소되었습니다.'));
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
  });
};

// 리다이렉트 콜백 처리
export const handleNaverCallback = async () => {
  const urlParams = new URLSearchParams(window.location.search);
  const code = urlParams.get('code');
  const state = urlParams.get('state');
  const error = urlParams.get('error');

  if (error) {
    console.error('네이버 로그인 오류:', error);
    return null;
  }

  if (!code || !state) {
    return null;
  }

  // state 검증
  const savedState = localStorage.getItem('naver_oauth_state');
  if (state !== savedState) {
    console.error('State 값이 일치하지 않습니다.');
    return null;
  }

  try {
    // Access Token 요청
    const tokenResponse = await fetch('https://nid.naver.com/oauth2.0/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        client_id: NAVER_CLIENT_ID,
        client_secret: NAVER_CLIENT_SECRET,
        redirect_uri: NAVER_REDIRECT_URI,
        code: code,
        state: state
      })
    });

    const tokenData = await tokenResponse.json();

    if (tokenData.error) {
      console.error('토큰 요청 실패:', tokenData.error_description);
      return null;
    }

    // 사용자 정보 요청
    const userResponse = await fetch('https://openapi.naver.com/v1/nid/me', {
      headers: {
        'Authorization': `Bearer ${tokenData.access_token}`
      }
    });

    const userData = await userResponse.json();

    if (userData.resultcode !== '00') {
      console.error('사용자 정보 요청 실패:', userData.message);
      return null;
    }

    const user = {
      id: userData.response.id,
      name: userData.response.name,
      nickname: userData.response.nickname,
      email: userData.response.email,
      profileImage: userData.response.profile_image,
      provider: 'naver',
      accessToken: tokenData.access_token,
      refreshToken: tokenData.refresh_token
    };

    // 로컬스토리지에 사용자 정보 저장
    localStorage.setItem('naver_user', JSON.stringify(user));
    localStorage.removeItem('naver_oauth_state');

    // URL에서 쿼리 파라미터 제거
    window.history.replaceState({}, '', window.location.pathname);

    return user;

  } catch (error) {
    console.error('네이버 콜백 처리 실패:', error);
    return null;
  }
};

// 네이버 로그아웃
export const logoutFromNaver = async () => {
  const user = getNaverUser();
  
  if (user && user.accessToken) {
    try {
      // 네이버 토큰 삭제 API 호출
      await fetch('https://nid.naver.com/oauth2.0/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          grant_type: 'delete',
          client_id: NAVER_CLIENT_ID,
          client_secret: NAVER_CLIENT_SECRET,
          access_token: user.accessToken
        })
      });
    } catch (error) {
      console.error('네이버 토큰 삭제 실패:', error);
    }
  }

  // 로컬스토리지에서 사용자 정보 제거
  localStorage.removeItem('naver_user');
};

// 저장된 네이버 사용자 정보 가져오기
export const getNaverUser = () => {
  try {
    const userString = localStorage.getItem('naver_user');
    return userString ? JSON.parse(userString) : null;
  } catch (error) {
    console.error('네이버 사용자 정보 파싱 실패:', error);
    return null;
  }
};

// 네이버 로그인 상태 확인
export const isNaverLoggedIn = () => {
  return !!getNaverUser();
};

// 랜덤 state 값 생성 (CSRF 공격 방지)
function generateRandomState() {
  const state = Math.random().toString(36).substring(2, 15) + 
                Math.random().toString(36).substring(2, 15);
  localStorage.setItem('naver_oauth_state', state);
  return state;
}

// 액세스 토큰 갱신
export const refreshNaverToken = async () => {
  const user = getNaverUser();
  
  if (!user || !user.refreshToken) {
    throw new Error('Refresh token이 없습니다.');
  }

  try {
    const response = await fetch('https://nid.naver.com/oauth2.0/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'refresh_token',
        client_id: NAVER_CLIENT_ID,
        client_secret: NAVER_CLIENT_SECRET,
        refresh_token: user.refreshToken
      })
    });

    const tokenData = await response.json();

    if (tokenData.error) {
      console.error('토큰 갱신 실패:', tokenData.error_description);
      throw new Error(tokenData.error_description);
    }

    // 새로운 토큰으로 사용자 정보 업데이트
    const updatedUser = {
      ...user,
      accessToken: tokenData.access_token,
      refreshToken: tokenData.refresh_token || user.refreshToken
    };

    localStorage.setItem('naver_user', JSON.stringify(updatedUser));
    return updatedUser;

  } catch (error) {
    console.error('네이버 토큰 갱신 실패:', error);
    throw error;
  }
};