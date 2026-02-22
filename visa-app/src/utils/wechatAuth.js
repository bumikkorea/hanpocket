// WeChat OAuth 설정
const WECHAT_APP_ID = 'YOUR_WECHAT_APP_ID'; // WeChat 개방 플랫폼에서 발급받은 AppID
const WECHAT_APP_SECRET = 'YOUR_WECHAT_APP_SECRET'; // WeChat AppSecret
const WECHAT_REDIRECT_URI = encodeURIComponent(window.location.origin + '/wechat-callback');

// WeChat 로그인 URL 생성 (QR 코드 또는 리다이렉트)
export const getWeChatLoginUrl = (isMobile = false) => {
  const state = generateRandomState();
  
  if (isMobile) {
    // 모바일에서는 WeChat 앱으로 직접 이동
    return `weixin://dl/business/?ticket=${generateTicket()}`;
  } else {
    // 데스크톱에서는 QR 코드 스캔 방식
    return `https://open.weixin.qq.com/connect/qrconnect?` +
      new URLSearchParams({
        appid: WECHAT_APP_ID,
        redirect_uri: WECHAT_REDIRECT_URI,
        response_type: 'code',
        scope: 'snsapi_login',
        state: state
      });
  }
};

// WeChat 로그인 시작
export const loginWithWeChat = () => {
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  
  if (isMobile) {
    // 모바일에서는 WeChat 앱 실행 시도
    const wechatUrl = getWeChatLoginUrl(true);
    window.location.href = wechatUrl;
    
    // WeChat 앱이 설치되지 않은 경우 대체 방법
    setTimeout(() => {
      // 웹 버전으로 폴백
      const popup = window.open(
        getWeChatLoginUrl(false),
        'wechatLogin',
        'width=500,height=600,scrollbars=yes,resizable=yes'
      );
      
      return handlePopupLogin(popup);
    }, 2000);
  } else {
    // 데스크톱에서는 팝업으로 QR 코드 페이지 표시
    const popup = window.open(
      getWeChatLoginUrl(false),
      'wechatLogin',
      'width=500,height=600,scrollbars=yes,resizable=yes'
    );
    
    return handlePopupLogin(popup);
  }
};

// 팝업 로그인 처리
function handlePopupLogin(popup) {
  return new Promise((resolve, reject) => {
    const checkClosed = setInterval(() => {
      if (popup.closed) {
        clearInterval(checkClosed);
        const wechatUser = getWeChatUser();
        if (wechatUser) {
          resolve(wechatUser);
        } else {
          reject(new Error('WeChat 로그인이 취소되었습니다.'));
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
}

// WeChat 콜백 처리
export const handleWeChatCallback = async () => {
  const urlParams = new URLSearchParams(window.location.search);
  const code = urlParams.get('code');
  const state = urlParams.get('state');

  if (!code || !state) {
    return null;
  }

  // state 검증
  const savedState = localStorage.getItem('wechat_oauth_state');
  if (state !== savedState) {
    console.error('State 값이 일치하지 않습니다.');
    return null;
  }

  try {
    // Access Token 요청
    const tokenResponse = await fetch(`https://api.weixin.qq.com/sns/oauth2/access_token?` +
      new URLSearchParams({
        appid: WECHAT_APP_ID,
        secret: WECHAT_APP_SECRET,
        code: code,
        grant_type: 'authorization_code'
      }), {
        method: 'GET'
      });

    const tokenData = await tokenResponse.json();

    if (tokenData.errcode) {
      console.error('WeChat 토큰 요청 실패:', tokenData.errmsg);
      return null;
    }

    // 사용자 정보 요청
    const userResponse = await fetch(`https://api.weixin.qq.com/sns/userinfo?` +
      new URLSearchParams({
        access_token: tokenData.access_token,
        openid: tokenData.openid,
        lang: 'zh_CN'
      }), {
        method: 'GET'
      });

    const userData = await userResponse.json();

    if (userData.errcode) {
      console.error('WeChat 사용자 정보 요청 실패:', userData.errmsg);
      return null;
    }

    const user = {
      openid: userData.openid,
      unionid: userData.unionid,
      nickname: userData.nickname,
      headimgurl: userData.headimgurl,
      sex: userData.sex, // 1: 남성, 2: 여성, 0: 미지정
      province: userData.province,
      city: userData.city,
      country: userData.country,
      provider: 'wechat',
      accessToken: tokenData.access_token,
      refreshToken: tokenData.refresh_token,
      expiresIn: tokenData.expires_in
    };

    // 로컬스토리지에 사용자 정보 저장
    localStorage.setItem('wechat_user', JSON.stringify(user));
    localStorage.removeItem('wechat_oauth_state');

    // URL에서 쿼리 파라미터 제거
    window.history.replaceState({}, '', window.location.pathname);

    return user;

  } catch (error) {
    console.error('WeChat 콜백 처리 실패:', error);
    return null;
  }
};

// WeChat 로그아웃
export const logoutFromWeChat = async () => {
  // WeChat은 별도의 로그아웃 API가 없으므로 로컬 데이터만 제거
  localStorage.removeItem('wechat_user');
};

// 저장된 WeChat 사용자 정보 가져오기
export const getWeChatUser = () => {
  try {
    const userString = localStorage.getItem('wechat_user');
    return userString ? JSON.parse(userString) : null;
  } catch (error) {
    console.error('WeChat 사용자 정보 파싱 실패:', error);
    return null;
  }
};

// WeChat 로그인 상태 확인
export const isWeChatLoggedIn = () => {
  return !!getWeChatUser();
};

// 랜덤 state 값 생성
function generateRandomState() {
  const state = Math.random().toString(36).substring(2, 15) + 
                Math.random().toString(36).substring(2, 15);
  localStorage.setItem('wechat_oauth_state', state);
  return state;
}

// 임시 티켓 생성 (모바일 앱 연동용)
function generateTicket() {
  return Math.random().toString(36).substring(2, 15);
}

// 액세스 토큰 갱신
export const refreshWeChatToken = async () => {
  const user = getWeChatUser();
  
  if (!user || !user.refreshToken) {
    throw new Error('Refresh token이 없습니다.');
  }

  try {
    const response = await fetch(`https://api.weixin.qq.com/sns/oauth2/refresh_token?` +
      new URLSearchParams({
        appid: WECHAT_APP_ID,
        grant_type: 'refresh_token',
        refresh_token: user.refreshToken
      }), {
        method: 'GET'
      });

    const tokenData = await response.json();

    if (tokenData.errcode) {
      console.error('WeChat 토큰 갱신 실패:', tokenData.errmsg);
      throw new Error(tokenData.errmsg);
    }

    // 새로운 토큰으로 사용자 정보 업데이트
    const updatedUser = {
      ...user,
      accessToken: tokenData.access_token,
      refreshToken: tokenData.refresh_token,
      expiresIn: tokenData.expires_in
    };

    localStorage.setItem('wechat_user', JSON.stringify(updatedUser));
    return updatedUser;

  } catch (error) {
    console.error('WeChat 토큰 갱신 실패:', error);
    throw error;
  }
};

// WeChat Mini Program 지원 (향후 확장용)
export const initWeChatMiniProgram = () => {
  // WeChat Mini Program 환경 감지
  if (typeof wx !== 'undefined' && wx.miniProgram) {
    return {
      isInMiniProgram: true,
      // Mini Program 전용 로그인 로직 추가 가능
      login: () => {
        wx.miniProgram.getEnv((res) => {
          if (res.miniprogram) {
            // Mini Program 내부에서 실행 중
            console.log('WeChat Mini Program 환경에서 실행 중');
          }
        });
      }
    };
  }
  
  return {
    isInMiniProgram: false,
    login: loginWithWeChat
  };
};