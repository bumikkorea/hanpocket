# 위챗 미니프로그램 개발 환경 설정 및 프로젝트 구조

## 개발 환경 설정

### 1. 위챗 개발자 도구 설치

#### 다운로드 및 설치
1. 공식 사이트 접속: https://developers.weixin.qq.com/miniprogram/dev/devtools/download.html
2. 운영체제에 맞는 버전 다운로드:
   - Windows: 64비트/32비트
   - macOS: Intel/Apple Silicon
   - Linux: 64비트

#### 초기 설정
1. 개발자 도구 실행
2. 위챗으로 QR 코드 스캔하여 로그인
3. 개발자 계정 연동 확인

### 2. Node.js 환경 설정 (선택사항)

```bash
# Node.js LTS 버전 설치 (18.x 권장)
# https://nodejs.org/

# 프로젝트 의존성 관리용
npm install -g pnpm yarn

# 위챗 미니프로그램 CLI 도구 (선택사항)
npm install -g miniprogram-cli
```

### 3. 에디터 설정

#### VS Code 설정 (권장)
```json
// .vscode/settings.json
{
  "files.associations": {
    "*.wxml": "html",
    "*.wxs": "javascript",
    "*.wxss": "css"
  },
  "emmet.includeLanguages": {
    "wxml": "html"
  },
  "minapp-vscode.disableAutoConfig": true
}
```

#### VS Code 확장 프로그램
- minapp: 위챗 미니프로그램 개발 지원
- WXML - Language Service: WXML 문법 하이라이팅
- WeChat Mini Program Helper: 자동완성 및 코드 스니펫

## 프로젝트 구조 생성

### 기본 디렉토리 구조
```
hanpocket-miniprogram/
├── app.js                     # 앱 메인 로직
├── app.json                   # 앱 설정 파일
├── app.wxss                   # 전역 스타일
├── sitemap.json               # SEO 설정
├── project.config.json        # 프로젝트 설정
├── project.private.config.json # 개인 설정 (git ignore)
├── pages/                     # 페이지 폴더
│   ├── webview/              # WebView 메인 페이지
│   │   ├── webview.js
│   │   ├── webview.wxml
│   │   ├── webview.wxss
│   │   └── webview.json
│   ├── loading/              # 로딩 페이지
│   ├── error/                # 에러 페이지
│   └── settings/             # 설정 페이지
├── components/               # 자체 컴포넌트
│   ├── loading-indicator/    # 로딩 인디케이터
│   └── error-boundary/       # 에러 경계
├── utils/                    # 유틸리티 함수
│   ├── common.js
│   ├── api.js
│   ├── storage.js
│   └── bridge.js
├── images/                   # 이미지 리소스
│   ├── icons/               # 아이콘들
│   ├── backgrounds/         # 배경 이미지
│   └── logos/              # 로고 파일
├── styles/                  # 공통 스타일
│   ├── variables.wxss      # CSS 변수
│   └── common.wxss         # 공통 스타일
└── docs/                   # 프로젝트 문서
    ├── api.md
    ├── components.md
    └── deployment.md
```

## 실제 프로젝트 생성

### 1. 프로젝트 설정 파일들
이미 위에서 준비한 템플릿들을 사용하여 실제 파일들을 생성합니다.

### 2. 패키지 관리 설정
```json
// package.json
{
  "name": "hanpocket-miniprogram",
  "version": "1.0.0",
  "description": "HanPocket 위챗 미니프로그램",
  "main": "app.js",
  "scripts": {
    "dev": "npm run build:dev",
    "build": "npm run build:prod",
    "build:dev": "NODE_ENV=development webpack --config webpack.dev.js",
    "build:prod": "NODE_ENV=production webpack --config webpack.prod.js",
    "lint": "eslint --ext .js .",
    "lint:fix": "eslint --ext .js . --fix",
    "preview": "miniprogram-cli preview",
    "upload": "miniprogram-cli upload"
  },
  "keywords": ["wechat", "miniprogram", "hanpocket"],
  "author": "HanPocket Team",
  "license": "MIT",
  "devDependencies": {
    "eslint": "^8.0.0",
    "webpack": "^5.0.0",
    "webpack-cli": "^4.0.0"
  }
}
```

### 3. 프로젝트 설정 파일
```json
// project.config.json
{
  "description": "HanPocket 위챗 미니프로그램",
  "packOptions": {
    "ignore": [
      {
        "type": "file",
        "value": ".eslintrc.js"
      },
      {
        "type": "file", 
        "value": "webpack.config.js"
      },
      {
        "type": "folder",
        "value": "node_modules"
      },
      {
        "type": "folder",
        "value": ".git"
      }
    ]
  },
  "setting": {
    "urlCheck": true,
    "es6": true,
    "enhance": true,
    "postcss": true,
    "preloadBackgroundData": false,
    "minified": true,
    "newFeature": false,
    "coverView": true,
    "nodeModules": false,
    "autoAudits": false,
    "showShadowRootInWxmlPanel": true,
    "scopeDataCheck": false,
    "uglifyFileName": false,
    "checkInvalidKey": true,
    "checkSiteMap": true,
    "uploadWithSourceMap": true,
    "compileHotReLoad": false,
    "useMultiFrameRuntime": true,
    "useApiHook": true,
    "useApiHostProcess": false,
    "babelSetting": {
      "ignore": [],
      "disablePlugins": [],
      "outputPath": ""
    },
    "enableEngineNative": false,
    "bundle": false,
    "useIsolateContext": true,
    "useCompilerModule": true,
    "userConfirmedUseCompilerModuleSwitch": false,
    "userConfirmedBundleSwitch": false,
    "packNpmManually": false,
    "packNpmRelationList": [],
    "minifyWXSS": true
  },
  "compileType": "miniprogram",
  "libVersion": "2.21.3",
  "appid": "你的AppID",
  "projectname": "hanpocket-miniprogram",
  "debugOptions": {
    "hidedInDevtools": []
  },
  "scripts": {},
  "isGameTourist": false,
  "condition": {
    "search": {
      "list": []
    },
    "conversation": {
      "list": []
    },
    "game": {
      "list": []
    },
    "plugin": {
      "list": []
    },
    "gamePlugin": {
      "list": []
    },
    "miniprogram": {
      "list": []
    }
  }
}
```

### 4. ESLint 설정
```javascript
// .eslintrc.js
module.exports = {
  env: {
    browser: true,
    es6: true,
    node: true
  },
  extends: [
    'eslint:recommended'
  ],
  globals: {
    wx: 'readonly',
    App: 'readonly',
    Page: 'readonly',
    Component: 'readonly',
    getApp: 'readonly',
    getCurrentPages: 'readonly'
  },
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: 'module'
  },
  rules: {
    'indent': ['error', 2],
    'linebreak-style': ['error', 'unix'],
    'quotes': ['error', 'single'],
    'semi': ['error', 'never'],
    'no-console': 'warn',
    'no-unused-vars': 'warn'
  }
}
```

## 개발 워크플로우

### 1. 개발 시작
```bash
# 1. 위챗 개발자 도구에서 프로젝트 열기
# 2. AppID 입력 (테스트용은 '测试号' 선택 가능)
# 3. 프로젝트 경로 선택
# 4. '새 프로젝트 생성' 선택
```

### 2. 실시간 개발
- 코드 수정 시 자동 컴파일
- 시뮬레이터에서 실시간 미리보기
- 콘솔에서 로그 확인
- 네트워크 패널에서 API 호출 모니터링

### 3. 디버깅 도구 활용
```javascript
// 조건부 로깅
if (__DEV__) {
  console.log('개발 모드 로그:', data)
}

// 성능 측정
console.time('API 호출')
await apiCall()
console.timeEnd('API 호출')

// 메모리 사용량 체크
wx.getSystemInfo({
  success: (res) => {
    console.log('메모리:', res.benchmarkLevel)
  }
})
```

### 4. 테스트
```javascript
// utils/test-helper.js
class TestHelper {
  // Mock 데이터 생성
  static createMockUser() {
    return {
      id: '12345',
      name: '테스트 사용자',
      avatar: '/images/default-avatar.png'
    }
  }

  // API Mock
  static mockApiResponse(data) {
    return new Promise(resolve => {
      setTimeout(() => resolve(data), 1000)
    })
  }

  // 단위 테스트 헬퍼
  static assertEqual(actual, expected, message = '') {
    if (actual !== expected) {
      console.error(`테스트 실패: ${message}`, { actual, expected })
    } else {
      console.log(`테스트 통과: ${message}`)
    }
  }
}

module.exports = TestHelper
```

## Git 설정

### .gitignore
```
# 위챗 미니프로그램
project.private.config.json

# Node.js
node_modules/
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# 환경 설정
.env
.env.local
.env.development
.env.production

# 빌드 결과물
dist/
build/

# 에디터
.vscode/
.idea/
*.swp
*.swo

# 운영체제
.DS_Store
Thumbs.db

# 로그 파일
*.log

# 임시 파일
*.tmp
*.temp
```

### Git Hooks (선택사항)
```bash
#!/bin/sh
# .git/hooks/pre-commit

# 코드 스타일 검사
npm run lint

if [ $? -ne 0 ]; then
  echo "ESLint 검사 실패. 커밋을 중단합니다."
  exit 1
fi

# 빌드 테스트
npm run build:prod

if [ $? -ne 0 ]; then
  echo "빌드 실패. 커밋을 중단합니다."
  exit 1
fi

echo "사전 검사 통과. 커밋을 진행합니다."
```

## 성능 최적화 설정

### 1. 이미지 최적화
```javascript
// utils/image-optimizer.js
class ImageOptimizer {
  // 이미지 압축
  static compressImage(filePath, quality = 0.8) {
    return new Promise((resolve, reject) => {
      wx.compressImage({
        src: filePath,
        quality: quality * 100,
        success: resolve,
        fail: reject
      })
    })
  }

  // WebP 지원 확인
  static checkWebPSupport() {
    const systemInfo = wx.getSystemInfoSync()
    return systemInfo.platform === 'android' || 
           (systemInfo.platform === 'ios' && systemInfo.system >= 'iOS 14')
  }
}
```

### 2. 코드 분할
```javascript
// utils/lazy-loader.js
class LazyLoader {
  // 지연 로딩
  static lazyLoad(componentPath) {
    return () => import(componentPath)
  }

  // 조건부 로딩
  static conditionalLoad(condition, componentPath) {
    if (condition) {
      return import(componentPath)
    }
    return Promise.resolve(null)
  }
}
```

## 배포 준비 체크리스트

### 개발 완료 후 확인사항
- [ ] 모든 페이지 정상 작동 확인
- [ ] WebView 로딩 및 통신 테스트
- [ ] 다양한 기기 크기에서 반응형 확인
- [ ] 네트워크 오류 상황 대응 확인
- [ ] 권한 요청 및 처리 확인
- [ ] 공유 기능 테스트
- [ ] 결제 기능 테스트 (해당시)
- [ ] 성능 최적화 확인
- [ ] 보안 설정 검토
- [ ] 개인정보 처리방침 준비

### 코드 품질 확인
- [ ] ESLint 에러 0개
- [ ] 불필요한 console.log 제거
- [ ] 하드코딩된 값들 상수화
- [ ] 에러 처리 코드 추가
- [ ] 주석 및 문서화 완료

## 다음 단계

프로젝트 구조가 준비되면 다음과 같은 순서로 개발을 진행합니다:

1. **기본 WebView 구현** - HanPocket 웹앱 로딩
2. **브리지 통신 구현** - 웹앱 ↔ 미니프로그램 통신
3. **위챗 네이티브 기능 통합** - 로그인, 결제, 공유 등
4. **에러 처리 및 사용자 경험 개선**
5. **성능 최적화 및 테스트**
6. **배포 준비 및 심사 제출**

이 가이드를 바탕으로 체계적인 위챗 미니프로그램 개발을 시작할 수 있습니다.