# OAuth 로그인 연동 설정 가이드

HanPocket 앱에서 소셜 로그인을 사용하기 위한 설정 가이드입니다.

## 🚀 구현된 기능

- ✅ **카카오 로그인** (이미 구현됨)
- 🆕 **네이버 로그인** (신규 추가)
- 🆕 **WeChat 로그인** (신규 추가)
- 🆕 **Alipay 로그인** (신규 추가)

## 📋 개발자 센터 등록 및 설정

### 1. 네이버 개발자센터 설정

#### 1.1 네이버 개발자센터 등록
1. [네이버 개발자센터](https://developers.naver.com/) 접속
2. 네이버 아이디로 로그인
3. "Application 등록" 클릭
4. 애플리케이션 정보 입력:
   - **애플리케이션 이름**: HanPocket
   - **사용 API**: 네이버 로그인
   - **환경**: PC 웹, 모바일 웹
   - **서비스 URL**: `https://your-domain.com`
   - **Callback URL**: `https://your-domain.com/naver-callback`

#### 1.2 설정값 적용
```javascript
// src/utils/naverAuth.js 파일에서 수정
const NAVER_CLIENT_ID = 'YOUR_NAVER_CLIENT_ID'; // 여기에 발급받은 Client ID 입력
const NAVER_CLIENT_SECRET = 'YOUR_NAVER_CLIENT_SECRET'; // 여기에 발급받은 Client Secret 입력
```

#### 1.3 필요한 권한
- `name`: 사용자 이름
- `email`: 이메일 주소
- `profile_image`: 프로필 이미지

### 2. WeChat 개방 플랫폼 설정

#### 2.1 WeChat 개방 플랫폼 등록
1. [WeChat 개방 플랫폼](https://open.weixin.qq.com/) 접속
2. 계정 등록 (중국 휴대폰 번호 또는 기업 인증 필요)
3. "网站应用" (웹사이트 애플리케이션) 생성
4. 애플리케이션 정보 입력:
   - **애플리케이션 이름**: HanPocket
   - **애플리케이션 설명**: 한국 비자 관리 앱
   - **홈페이지**: `https://your-domain.com`
   - **授权回调域**: `your-domain.com`

#### 2.2 설정값 적용
```javascript
// src/utils/wechatAuth.js 파일에서 수정
const WECHAT_APP_ID = 'YOUR_WECHAT_APP_ID'; // 여기에 발급받은 AppID 입력
const WECHAT_APP_SECRET = 'YOUR_WECHAT_APP_SECRET'; // 여기에 발급받은 AppSecret 입력
```

#### 2.3 주의사항
- WeChat 로그인은 중국 법인 또는 ICP 라이선스가 필요할 수 있습니다
- 개발 환경에서는 localhost 테스트가 제한될 수 있습니다
- 모바일에서는 WeChat 앱이 설치되어 있어야 합니다

### 3. Alipay 개방 플랫폼 설정

#### 3.1 Alipay 개방 플랫폼 등록
1. [Alipay 개방 플랫폼](https://open.alipay.com/) 접속
2. 계정 등록 (중국 기업 인증 필요)
3. "网页&移动应用" (웹&모바일 애플리케이션) 생성
4. RSA 키 쌍 생성 및 등록

#### 3.2 RSA 키 쌍 생성
```bash
# 개인 키 생성
openssl genpkey -algorithm RSA -out alipay_private_key.pem -pkcs8 -pkeyopt rsa_keygen_bits:2048

# 공개 키 생성
openssl rsa -pubout -in alipay_private_key.pem -out alipay_public_key.pem
```

#### 3.3 설정값 적용
```javascript
// src/utils/alipayAuth.js 파일에서 수정
const ALIPAY_APP_ID = 'YOUR_ALIPAY_APP_ID'; // 여기에 발급받은 APP ID 입력
const ALIPAY_PRIVATE_KEY = 'YOUR_ALIPAY_PRIVATE_KEY'; // 여기에 RSA 개인 키 입력
const ALIPAY_PUBLIC_KEY = 'YOUR_ALIPAY_PUBLIC_KEY'; // 여기에 지급보 공개 키 입력
```

#### 3.4 보안 고려사항
**⚠️ 중요**: Alipay는 서버 사이드 구현이 필요합니다!

클라이언트에서 개인 키를 노출하면 안 되므로, 실제 구현에서는 다음과 같이 해야 합니다:

1. **서버 API 구현** (`/api/alipay/exchange-token`, `/api/alipay/user-info`)
2. **클라이언트에서는 서버 API만 호출**
3. **개인 키는 서버 환경변수로 관리**

## 🔧 환경 설정

### 환경변수 설정
`.env` 파일을 생성하고 다음 변수들을 설정하세요:

```bash
# 네이버 로그인
VITE_NAVER_CLIENT_ID=your_naver_client_id
VITE_NAVER_CLIENT_SECRET=your_naver_client_secret

# WeChat 로그인
VITE_WECHAT_APP_ID=your_wechat_app_id
VITE_WECHAT_APP_SECRET=your_wechat_app_secret

# Alipay 로그인
VITE_ALIPAY_APP_ID=your_alipay_app_id
```

### Callback URL 설정
각 플랫폼에서 설정해야 하는 Callback URL들:

- **네이버**: `https://your-domain.com/naver-callback`
- **WeChat**: `https://your-domain.com/wechat-callback`  
- **Alipay**: `https://your-domain.com/alipay-callback`

## 🛠️ 개발 환경에서 테스트

### 로컬 개발 서버 설정
1. HTTPS 설정 (OAuth는 HTTPS 필수):
```bash
npm install --save-dev @vitejs/plugin-basic-ssl
```

2. `vite.config.js` 수정:
```javascript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import basicSsl from '@vitejs/plugin-basic-ssl'

export default defineConfig({
  plugins: [react(), basicSsl()],
  server: {
    https: true,
    port: 3000
  }
})
```

3. 개발자 센터에서 테스트 도메인 추가:
   - `https://localhost:3000`
   - `https://127.0.0.1:3000`

## 📱 사용법

### ProfileTab에서 소셜 로그인 관리
1. 앱 실행 후 프로필 탭으로 이동
2. "소셜 로그인 관리" 섹션에서 각 플랫폼 연결/해제
3. 연결된 계정 정보 확인 가능

### 로그인 화면에서 소셜 로그인
1. 앱 첫 실행 시 로그인 화면에서 소셜 로그인 버튼 클릭
2. 해당 플랫폼의 OAuth 플로우 진행
3. 인증 완료 후 자동으로 앱으로 돌아옴

## 🔍 트러블슈팅

### 공통 문제
1. **CORS 오류**: 개발자 센터에서 도메인이 정확히 등록되었는지 확인
2. **HTTPS 필요**: 로컬 개발시에도 HTTPS 사용 필요
3. **팝업 차단**: 브라우저 팝업 차단 설정 확인

### 네이버 로그인 문제
- **state 값 불일치**: 브라우저 캐시 클리어 후 재시도
- **Client Secret 오류**: 개발자센터에서 정확한 값 확인

### WeChat 로그인 문제  
- **WeChat 앱 미설치**: 모바일에서 WeChat 앱 설치 필요
- **도메인 인증**: 중국 ICP 라이선스 또는 해외 서비스 승인 필요

### Alipay 로그인 문제
- **RSA 서명 오류**: 키 쌍이 정확히 생성되었는지 확인  
- **서버 구현 필요**: 클라이언트 전용으로는 완전한 구현 불가

## 📋 체크리스트

구현 완료 확인:

- [ ] 네이버 개발자센터 앱 등록
- [ ] 네이버 Client ID/Secret 설정
- [ ] WeChat 개방 플랫폼 앱 등록  
- [ ] WeChat AppID/AppSecret 설정
- [ ] Alipay 개방 플랫폼 앱 등록
- [ ] Alipay RSA 키 쌍 생성
- [ ] 환경변수 설정
- [ ] HTTPS 개발 서버 설정
- [ ] 각 플랫폼에서 테스트 완료

## 🚀 배포 시 주의사항

1. **환경변수**: 프로덕션 환경변수로 교체
2. **도메인**: 실제 도메인으로 Callback URL 변경
3. **보안**: API 키는 절대 클라이언트에 노출 금지
4. **Alipay**: 반드시 서버 사이드 구현 추가

---

## 💡 추가 개선 사항

향후 고려할 수 있는 기능들:

- [ ] Apple 로그인 추가
- [ ] Google 로그인 추가  
- [ ] 소셜 로그인 계정 통합 기능
- [ ] 자동 로그인 기능
- [ ] 계정 연결 해제 시 데이터 보관 정책

문제가 발생하면 각 플랫폼의 개발자 문서를 참고하세요:
- [네이버 로그인 API](https://developers.naver.com/docs/login/api/)
- [WeChat 로그인 개발 가이드](https://developers.weixin.qq.com/doc/oplatform/Website_App/WeChat_Login/Wechat_Login.html)
- [Alipay 로그인 개발 문서](https://opendocs.alipay.com/open/263/105809)