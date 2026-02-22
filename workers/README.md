# DeepSeek Translation Proxy

Cloudflare Workers를 사용한 DeepSeek API 번역 프록시 서비스입니다.

## 기능

- DeepSeek API를 통한 다국어 번역
- CORS 지원으로 웹 브라우저에서 직접 호출 가능
- 환경변수를 통한 안전한 API 키 관리
- 다양한 언어 지원 (한국어, 영어, 일본어, 중국어 등)

## 배포 방법

### 1. 의존성 설치

```bash
cd workers
npm install
```

### 2. API 키 설정

DeepSeek API 키를 Cloudflare Workers 시크릿으로 설정:

```bash
npx wrangler secret put DEEPSEEK_API_KEY
```

### 3. 배포

```bash
# 개발 환경 배포
npm run deploy:dev

# 프로덕션 환경 배포  
npm run deploy:prod

# 기본 배포
npm run deploy
```

### 4. 로컬 테스트

```bash
npm run dev
```

## API 사용법

### 번역 요청

**Endpoint:** `POST /api/translate`

**Request Body:**
```json
{
  "text": "번역할 텍스트",
  "sourceLang": "ko",
  "targetLang": "en"
}
```

**Response:**
```json
{
  "success": true,
  "originalText": "번역할 텍스트",
  "translatedText": "Text to translate",
  "sourceLang": "ko",
  "targetLang": "en",
  "usage": {
    "prompt_tokens": 45,
    "completion_tokens": 12,
    "total_tokens": 57
  }
}
```

### 지원 언어 코드

- `ko`: 한국어
- `en`: 영어
- `ja`: 일본어
- `zh`: 중국어
- `fr`: 프랑스어
- `de`: 독일어
- `es`: 스페인어
- `it`: 이탈리아어
- `pt`: 포르투갈어
- `ru`: 러시아어
- `ar`: 아랍어
- `hi`: 힌디어
- `th`: 태국어
- `vi`: 베트남어
- `id`: 인도네시아어
- `ms`: 말레이어
- `tl`: 필리핀어

## 사용 예제

### JavaScript/Fetch

```javascript
const response = await fetch('https://your-worker.workers.dev/api/translate', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    text: 'Hello, world!',
    sourceLang: 'en',
    targetLang: 'ko'
  })
});

const result = await response.json();
console.log(result.translatedText); // "안녕하세요, 세상!"
```

### curl

```bash
curl -X POST https://your-worker.workers.dev/api/translate \
  -H "Content-Type: application/json" \
  -d '{"text":"Hello World","sourceLang":"en","targetLang":"ko"}'
```

## 에러 처리

- `400 Bad Request`: 필수 필드 누락
- `502 Bad Gateway`: DeepSeek API 호출 실패
- `500 Internal Server Error`: 서버 내부 오류

## 모니터링

배포된 Worker의 로그를 실시간으로 확인:

```bash
npm run tail
```

## 보안 고려사항

1. API 키는 반드시 `wrangler secret` 명령어로 설정
2. CORS 헤더는 필요에 따라 특정 도메인으로 제한 가능
3. 요청 속도 제한이나 사용량 제한 구현 권장

## 성능 최적화

- 자주 번역되는 텍스트는 KV를 사용한 캐싱 고려
- D1 데이터베이스를 활용한 사용량 로그 및 분석
- 요청 크기 제한을 통한 리소스 보호