// Alipay OAuth 설정
const ALIPAY_APP_ID = 'YOUR_ALIPAY_APP_ID'; // 支付宝开放平台에서 발급받은 APP ID
const ALIPAY_PRIVATE_KEY = 'YOUR_ALIPAY_PRIVATE_KEY'; // RSA 개인 키
const ALIPAY_PUBLIC_KEY = 'YOUR_ALIPAY_PUBLIC_KEY'; // 지급보 공개 키
const ALIPAY_REDIRECT_URI = encodeURIComponent(window.location.origin + '/alipay-callback');

// Alipay 로그인 시작
export const loginWithAlipay = () => {
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  
  if (isMobile) {
    // 모바일에서는 Alipay 앱으로 직접 이동
    const alipayUrl = generateAlipayMobileUrl();
    window.location.href = alipayUrl;
    
    return new Promise((resolve, reject) => {
      // 모바일 앱이 설치되지 않은 경우 웹 버전으로 폴백
      setTimeout(() => {
        const popup = window.open(
          generateAlipayWebUrl(),
          'alipayLogin',
          'width=500,height=600,scrollbars=yes,resizable=yes'
        );
        
        handlePopupLogin(popup).then(resolve).catch(reject);
      }, 3000);
    });
  } else {
    // 데스크톱에서는 팝업으로 웹 로그인 페이지 표시
    const popup = window.open(
      generateAlipayWebUrl(),
      'alipayLogin',
      'width=500,height=600,scrollbars=yes,resizable=yes'
    );
    
    return handlePopupLogin(popup);
  }
};

// Alipay 웹 로그인 URL 생성
function generateAlipayWebUrl() {
  const state = generateRandomState();
  
  return `https://openauth.alipay.com/oauth2/publicAppAuthorize.htm?` +
    new URLSearchParams({
      app_id: ALIPAY_APP_ID,
      scope: 'auth_user', // 기본 사용자 정보 접근
      redirect_uri: ALIPAY_REDIRECT_URI,
      state: state
    });
}

// Alipay 모바일 앱 URL 생성
function generateAlipayMobileUrl() {
  const state = generateRandomState();
  
  // Alipay 앱 스킴 URL
  return `alipays://platformapi/startapp?appId=20000067&` +
    new URLSearchParams({
      app_id: ALIPAY_APP_ID,
      scope: 'auth_user',
      redirect_uri: ALIPAY_REDIRECT_URI,
      state: state
    });
}

// 팝업 로그인 처리
function handlePopupLogin(popup) {
  return new Promise((resolve, reject) => {
    const checkClosed = setInterval(() => {
      if (popup.closed) {
        clearInterval(checkClosed);
        const alipayUser = getAlipayUser();
        if (alipayUser) {
          resolve(alipayUser);
        } else {
          reject(new Error('Alipay 로그인이 취소되었습니다.'));
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

// Alipay 콜백 처리
export const handleAlipayCallback = async () => {
  const urlParams = new URLSearchParams(window.location.search);
  const authCode = urlParams.get('auth_code');
  const state = urlParams.get('state');
  const scope = urlParams.get('scope');

  if (!authCode || !state) {
    return null;
  }

  // state 검증
  const savedState = localStorage.getItem('alipay_oauth_state');
  if (state !== savedState) {
    console.error('State 값이 일치하지 않습니다.');
    return null;
  }

  try {
    // Access Token 요청을 위한 서명 생성 및 API 호출
    // 실제 구현에서는 서버 사이드에서 처리해야 함 (보안상의 이유)
    const accessToken = await exchangeAuthCodeForToken(authCode);
    
    if (!accessToken) {
      console.error('Alipay 토큰 교환 실패');
      return null;
    }

    // 사용자 정보 요청
    const userInfo = await getUserInfo(accessToken);
    
    if (!userInfo) {
      console.error('Alipay 사용자 정보 요청 실패');
      return null;
    }

    const user = {
      userId: userInfo.user_id,
      avatar: userInfo.avatar,
      nickName: userInfo.nick_name,
      realName: userInfo.real_name,
      gender: userInfo.gender,
      province: userInfo.province,
      city: userInfo.city,
      provider: 'alipay',
      accessToken: accessToken,
      scope: scope
    };

    // 로컬스토리지에 사용자 정보 저장
    localStorage.setItem('alipay_user', JSON.stringify(user));
    localStorage.removeItem('alipay_oauth_state');

    // URL에서 쿼리 파라미터 제거
    window.history.replaceState({}, '', window.location.pathname);

    return user;

  } catch (error) {
    console.error('Alipay 콜백 처리 실패:', error);
    return null;
  }
};

// 인증 코드를 액세스 토큰으로 교환 (실제로는 서버에서 처리해야 함)
async function exchangeAuthCodeForToken(authCode) {
  try {
    // 실제 구현에서는 서버 API를 호출해야 함
    // 여기서는 데모 목적으로 클라이언트 사이드 구현을 보여줌
    
    const bizContent = {
      grant_type: 'authorization_code',
      code: authCode
    };

    const params = {
      app_id: ALIPAY_APP_ID,
      method: 'alipay.system.oauth.token',
      charset: 'utf-8',
      sign_type: 'RSA2',
      timestamp: new Date().toISOString().replace(/T/, ' ').replace(/\..+/, ''),
      version: '1.0',
      biz_content: JSON.stringify(bizContent)
    };

    // 실제 구현에서는 서버에서 서명 생성
    // const sign = generateSign(params, ALIPAY_PRIVATE_KEY);
    // params.sign = sign;

    // 서버 API 호출 (실제 구현)
    const response = await fetch('/api/alipay/exchange-token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        authCode: authCode,
        // 기타 필요한 매개변수
      })
    });

    const data = await response.json();
    return data.access_token;

  } catch (error) {
    console.error('토큰 교환 실패:', error);
    return null;
  }
}

// 사용자 정보 가져오기 (실제로는 서버에서 처리해야 함)
async function getUserInfo(accessToken) {
  try {
    // 실제 구현에서는 서버 API를 호출해야 함
    const response = await fetch('/api/alipay/user-info', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`
      }
    });

    const data = await response.json();
    return data.alipay_user_info_share_response;

  } catch (error) {
    console.error('사용자 정보 요청 실패:', error);
    return null;
  }
}

// Alipay 로그아웃
export const logoutFromAlipay = async () => {
  // Alipay는 별도의 로그아웃 API가 없으므로 로컬 데이터만 제거
  localStorage.removeItem('alipay_user');
};

// 저장된 Alipay 사용자 정보 가져오기
export const getAlipayUser = () => {
  try {
    const userString = localStorage.getItem('alipay_user');
    return userString ? JSON.parse(userString) : null;
  } catch (error) {
    console.error('Alipay 사용자 정보 파싱 실패:', error);
    return null;
  }
};

// Alipay 로그인 상태 확인
export const isAlipayLoggedIn = () => {
  return !!getAlipayUser();
};

// 랜덤 state 값 생성
function generateRandomState() {
  const state = Math.random().toString(36).substring(2, 15) + 
                Math.random().toString(36).substring(2, 15);
  localStorage.setItem('alipay_oauth_state', state);
  return state;
}

// 지급보 Mini Program 지원 (향후 확장용)
export const initAlipayMiniProgram = () => {
  // Alipay Mini Program 환경 감지
  if (typeof my !== 'undefined' && my.getSystemInfo) {
    return {
      isInMiniProgram: true,
      // Mini Program 전용 로그인 로직
      login: () => {
        my.getAuthCode({
          scopes: ['auth_user'],
          success: (res) => {
            // auth_code를 서버로 전송하여 토큰 교환
            exchangeAuthCodeForToken(res.authCode)
              .then(token => {
                console.log('Alipay Mini Program 로그인 성공');
              })
              .catch(error => {
                console.error('Alipay Mini Program 로그인 실패:', error);
              });
          },
          fail: (error) => {
            console.error('Alipay Mini Program 인증 실패:', error);
          }
        });
      }
    };
  }
  
  return {
    isInMiniProgram: false,
    login: loginWithAlipay
  };
};

// RSA 서명 생성 (실제로는 서버에서 처리해야 함)
function generateSign(params, privateKey) {
  // 실제 구현에서는 서버에서 RSA 서명을 생성해야 함
  // 클라이언트에서 개인 키를 노출하면 안 됨
  console.warn('실제 구현에서는 서버에서 서명을 생성해야 합니다.');
  return 'DEMO_SIGNATURE';
}

// Alipay 결제 기능 (향후 확장용)
export const initAlipayPayment = (orderInfo) => {
  return new Promise((resolve, reject) => {
    // Alipay 결제 SDK 초기화
    if (typeof AlipayJSBridge !== 'undefined') {
      AlipayJSBridge.call('tradePay', orderInfo, (result) => {
        if (result.resultCode === '9000') {
          resolve(result);
        } else {
          reject(new Error('결제 실패: ' + result.memo));
        }
      });
    } else {
      reject(new Error('Alipay SDK가 로드되지 않았습니다.'));
    }
  });
};