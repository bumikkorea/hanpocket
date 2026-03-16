---
description: HanPocket UX 서비스 점검 — 실사용자 관점에서 UI/UX 이슈 탐지 및 리포트 생성
---

## HanPocket UX 감사 (실사용자 관점)

오늘 날짜: !`date +%Y-%m-%d`

### 1단계: 정적 코드 분석

**중복 라벨/버튼 탐지**
```
!grep -rn "setOverlay\|onClick\|한국어\|통역\|번역" src/components/HomeTab.jsx | head -60
```

**빈 onClick 핸들러 탐지**
```
!grep -rn "onClick={() => {}}\|onClick={()=>{}}\|onClick={() => undefined}\|onClick={null}" src/components/ | head -30
```

**TODO/미구현 플레이스홀더 탐지**
```
!grep -rn "TODO\|준비중\|coming soon\|Coming Soon\|개발중\|PLACEHOLDER\|더미\|임시" src/components/ src/data/ | grep -v node_modules | grep -v ".git" | head -50
```

**번역 누락 탐지 (ko만 있고 zh/en 없는 항목)**
```
!grep -rn "ko:" src/data/i18n.js | wc -l
!grep -rn "zh:" src/data/i18n.js | wc -l
!grep -rn "en:" src/data/i18n.js | wc -l
```

**팝업 데이터 상태 점검**
```
!node -e "const d = require('./src/data/popupData.js'); const p = d.POPUP_DATA || d.default || d; const arr = Array.isArray(p) ? p : Object.values(p); console.log('총 팝업 수:', arr.length); const noImg = arr.filter(x => !x.image || x.image.includes('placeholder')); const noUrl = arr.filter(x => !x.sourceUrl); const noDate = arr.filter(x => !x.period?.start); console.log('이미지 없음:', noImg.map(x=>x.title)); console.log('sourceUrl 없음:', noUrl.map(x=>x.title)); console.log('날짜 없음:', noDate.map(x=>x.title));" 2>/dev/null || echo "Node 실행 불가 — 수동 확인 필요"
```

**i18n 키 누락 탐지**
```
!grep -rn 'L(lang,' src/components/ | grep -v ".git" | wc -l
```

### 2단계: 컴포넌트별 서비스 로직 점검

HomeTab 주요 섹션 구조 확인:
```
!grep -n "setOverlay\|subPage\|카드\|섹션\|grid\|INTENT" src/components/HomeTab.jsx | head -80
```

NavBar 탭 목록 확인:
```
!grep -n "tab\|Tab\|activeTab\|bottomNav" src/App.jsx | head -40
```

라우팅 누락 확인 (overlay/subPage 참조되지만 핸들러 없는 것):
```
!grep -n "setOverlay(" src/components/HomeTab.jsx | sed "s/.*setOverlay('\([^']*\)').*/\1/" | sort | uniq
```

### 3단계: 접근성 & 모바일 UX 점검

터치 타겟 너무 작은 버튼 (p-1, p-0.5 등):
```
!grep -rn 'className=".*p-0\b\|p-0\.5\|p-1 \|p-1"' src/components/ | grep -v node_modules | head -20
```

텍스트 너무 작음 (text-xs 과다 사용):
```
!grep -rn "text-xs" src/components/ | wc -l
```

### 4단계: 데이터 신선도 점검

만료된 팝업 확인:
```
!node -e "
const today = '$(date +%Y-%m-%d)';
try {
  const {POPUP_DATA} = require('./src/data/popupData.js');
  const expired = POPUP_DATA.filter(p => p.period?.end && p.period.end < today);
  const active = POPUP_DATA.filter(p => !p.period?.end || p.period.end >= today);
  console.log('만료된 팝업:', expired.map(p => p.title + ' (~' + p.period.end + ')'));
  console.log('유효 팝업:', active.length + '개');
} catch(e) { console.log('확인 불가:', e.message); }
" 2>/dev/null || echo "수동 확인 필요"
```

### 5단계: 리포트 생성

위 분석 결과를 바탕으로 다음 형식의 UX 감사 리포트를 생성하여 `docs/ux-audit-$(date +%Y-%m-%d).md`에 저장하세요:

```markdown
# HanPocket UX 감사 리포트 — YYYY-MM-DD

## 요약
- 총 이슈: N개 (Critical: X, Warning: Y, Info: Z)

## Critical 이슈 (즉시 수정 필요)
- [ ] 이슈 설명 / 위치 / 재현 방법

## Warning (개선 권장)
- [ ] 이슈 설명

## Info (참고 사항)
- 기타 정보

## 팝업 데이터 현황
- 유효: N개 / 만료: N개
- 이미지 없음: ...
- sourceUrl 없음: ...

## 다음 액션
1. ...
```

리포트를 생성한 후, 발견된 Critical 이슈가 있으면 즉시 수정하고 사용자에게 요약 보고하세요.
