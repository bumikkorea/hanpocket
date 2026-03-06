# Board-052: HomeTab 거미줄 경로 대수술

## 문제
HomeTab.jsx에 오버레이 3종(activeGuide, arrivalFlow, selectedPocket) + setTab 라우팅이 혼재.
같은 기능으로 가는 경로가 2~3개씩 있어서 거미줄처럼 꼬여 있음.

## 수술 원칙
1. **각 기능의 진입점은 딱 1개** — 중복 경로 전부 제거
2. **홈탭은 안내판** — 콘텐츠 자체가 아님, 클릭하면 이동하는 허브
3. **오버레이 패턴 통합** — activeGuide + selectedPocket을 하나의 `overlay` state로 통합

## 구체적 변경사항

### 1. 오버레이 state 통합
현재:
- `activeGuide` (null | 'map-guide' | 'transit' | 'arrival-card' | 'sim' | 'tax-refund' | 'duty-free')
- `selectedPocket` (null | 'restaurant' | 'cafe' | ...)
- `showArrivalFlow` + `arrivalStep` ('splash' | 'menu' | 'immigration' | 'transport' | 'sim-exchange')

변경:
- `activeGuide`, `selectedPocket` → 하나의 `overlay` state로 통합
  - `overlay` = null | { type: 'guide', id: 'map-guide'|'transit'|... } | { type: 'pocket', id: 'restaurant'|... }
  - 또는 더 간단하게: `overlay` = null | string (guide/pocket ID를 구분 없이 관리)
- `showArrivalFlow` + `arrivalStep`은 유지 (자체 스텝 관리가 필요하므로)
- 단, 방금도착에서 가이드 열 때: `setShowArrivalFlow(false)` 후 `setOverlay(...)` 호출 패턴 유지

실제로 가장 간단한 방법: `activeGuide`와 `selectedPocket`을 합치기
```js
const [overlay, setOverlay] = useState(null)  // null | string
// overlay가 pocket ID면 PocketContent, guide ID면 해당 가이드 렌더링
```

### 2. 프로모 배너 정리
- "한국 입국 가이드" 배너의 onClick: `setActiveGuide('arrival-card')` → `{ setArrivalStep('menu'); setShowArrivalFlow(true) }` 로 변경 (방금도착 메뉴로 보내기)
- 또는 이 배너 자체를 삭제하고 다른 유용한 배너로 대체

### 3. 죽은 코드 정리
- `else if (item.action === 'taxi')` 코드블록 삭제 (택시잡기 카드 이미 삭제됨)
- `else if (item.action === 'map')` 코드블록 삭제 (한국지도 카드 이미 삭제됨)  
- `else if (item.action === 'sos')` 코드블록 삭제 (사용처 없음)
- 이 핸들러들이 있던 여행필수 그리드의 onClick 전체를 정리

### 4. App.jsx 미사용 import 정리
- UNUSED 주석 달린 import들 제거: Shield, Wrench, Calendar, Save, Trash2, HelpCircle, MapPin, Moon, Sun, Footprints, Map, Layers
- `import Onigiri` (UNUSED 주석)
- `const CultureTab` (UNUSED 주석)
- `autoUpdateInfo`, `trackActivity`, `featureScores` (UNUSED)

## 파일
- `src/components/HomeTab.jsx` (주 대상)
- `src/App.jsx` (미사용 import 정리)

## 주의
- 빌드 에러 절대 불가
- 기존 기능이 깨지면 안 됨 (모든 가이드/포켓이 정상 작동해야 함)
- 방금도착했어요 플로우는 그대로 유지
- 상황별 한국어 포켓 오버레이는 그대로 유지 (overlay로 통합만)

## 완료 후
```
npx vite build
openclaw system event --text "Done: Board-052 HomeTab 거미줄 경로 대수술 완료 — 오버레이 통합, 중복 경로 제거, 죽은 코드 정리" --mode now
```
