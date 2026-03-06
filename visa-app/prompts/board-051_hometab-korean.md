# Board-051: 홈탭 상황별 한국어 콘텐츠 이전 + 가이드탭에서 제거

## 작업 요약
1. **홈탭(HomeTab.jsx)의 "상황별 한국어" 섹션**: 현재 아이콘 클릭 시 `setTab(item.pocket)`으로 다른 탭으로 이동함. 이걸 변경해서 **클릭 시 해당 Pocket 컴포넌트를 홈탭 안에서 오버레이/모달로 표시**하도록 변경.
   - 식당 → RestaurantPocket
   - 카페 → CafePocket  
   - 교통 → TransportPocket
   - 편의점 → ConveniencePocket
   - 숙소 → AccommodationPocket
   - 긴급 → EmergencyPocket

2. **가이드탭(탐색탭)에서 상황별 한국어 카테고리 제거**: `src/data/pockets.js`에서 `id: 'situational-korean'` 카테고리를 제거하거나 숨기기.

3. **모든 화면에 뒤로가기 버튼 적용**: 특히 입국카드(ArrivalCardGuide) 등 가이드 화면에 뒤로가기(← 또는 X) 버튼이 없는 곳에 추가.

## 구현 방법

### HomeTab.jsx 변경
- `selectedPocket` state 추가 (null | 'restaurant' | 'cafe' | 'transport' | 'convenience' | 'accommodation' | 'emergency')
- 상황별 한국어 아이콘 클릭 시: `setTab(item.pocket)` → `setSelectedPocket(item.pocket)`로 변경
- selectedPocket이 있으면 풀스크린 오버레이로 해당 Pocket 컴포넌트 렌더링 (기존 activeGuide 패턴 참고)
- 오버레이 상단에 뒤로가기 버튼 + 타이틀 헤더 추가
- Pocket 컴포넌트들을 lazy import

### pockets.js 변경
- `situational-korean` 카테고리를 pocketCategories 배열에서 제거

### 뒤로가기 버튼
- GuideLayout.jsx를 확인하고, onClose prop이 있는지 확인
- 입국카드(ArrivalCardGuide) 등 가이드 컴포넌트에서 GuideLayout을 사용하고 있다면 이미 닫기 버튼이 있을 수 있음
- 없는 곳에 추가

## 파일 위치
- `src/components/HomeTab.jsx` (1291줄)
- `src/data/pockets.js`
- `src/components/pockets/RestaurantPocket.jsx`
- `src/components/pockets/CafePocket.jsx`
- `src/components/pockets/TransportPocket.jsx`
- `src/components/pockets/ConveniencePocket.jsx`
- `src/components/pockets/AccommodationPocket.jsx`
- `src/components/pockets/EmergencyPocket.jsx`
- `src/components/guides/GuideLayout.jsx`
- `src/components/guides/ArrivalCardGuide.jsx`

## 주의사항
- 쇼핑 Pocket은 이동하지 않음 (홈탭 상황별 한국어에 쇼핑이 있지만 가이드탭→홈탭 이전 목록에 없음. SCENE_PHRASES에 shopping이 있으나 사용자가 언급 안 함. 그대로 두되 같은 패턴으로 오버레이 표시하면 됨)
- 기존 디자인 스타일 유지 (검정 단색, Inter 폰트, 29CM 스타일)
- 빌드 에러 없어야 함

## 완료 후
```
openclaw system event --text "Done: Board-051 홈탭 상황별 한국어 콘텐츠 인라인 표시 + 가이드탭에서 제거 완료" --mode now
```
