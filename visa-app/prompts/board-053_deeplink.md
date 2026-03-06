# Board-053: 딥링킹 — 홈탭 클릭 → 상세 페이지 직행

## 문제
홈탭에서 특정 맛집/코스/쇼핑 아이템을 클릭하면 해당 탭 첫 화면으로만 이동. 상세 페이지로 안 감.
이러면 홈탭 피드 전체가 무의미.

## 해결: 딥링킹 시스템

### 1단계: App.jsx에 deepLink state 추가

```jsx
const [deepLink, setDeepLink] = useState(null)  // { tab, itemId, itemData }

// HomeTab에 전달하는 setTab을 확장
const handleHomeSetTab = (t, params) => {
  if (params) setDeepLink({ tab: t, ...params })
  if ([...serviceList].includes(t)) { setTab('service'); setSubPage(t) }
  else { setTab(t) }
}

// 각 탭에 deepLink 전달
<FoodTab lang={lang} deepLink={deepLink?.tab === 'food' ? deepLink : null} onDeepLinkConsumed={() => setDeepLink(null)} />
<CourseTab lang={lang} deepLink={deepLink?.tab === 'course' ? deepLink : null} onDeepLinkConsumed={() => setDeepLink(null)} />
<ShoppingTab lang={lang} deepLink={deepLink?.tab === 'shopping' ? deepLink : null} onDeepLinkConsumed={() => setDeepLink(null)} />
```

### 2단계: HomeTab에서 딥링킹 호출

```jsx
// 현재
onClick: () => setTab('food')

// 변경
onClick: () => setTab('food', { itemId: restaurant.id, itemData: restaurant })
```

### 3단계: FoodTab에 맛집 상세 모달 추가

FoodTab에는 현재 상세 모달이 없음. 새로 만들어야 함.

**맛집 상세 모달 (RestaurantDetailModal) 포함 내용:**
- 식당 이름 (ko/zh/en)
- 미슐랭/블루리본 배지
- 주소 + 카카오맵 길찾기 버튼
- 가격대
- 대표 메뉴
- 영업시간 (데이터 있으면)
- 사진
- 뒤로가기 버튼

데이터 소스: MICHELIN_RESTAURANTS (restaurantData.js)

### 4단계: CourseTab 딥링킹 연결

CourseTab은 이미 `selectedCourse` + `CourseDetail` 컴포넌트가 있음.
deepLink prop을 받으면 바로 해당 코스를 selectedCourse로 세팅하고 view='detail'로 전환.

### 5단계: ShoppingTab 딥링킹 연결

ShoppingTab은 이미 `TourDetailModal`이 있음.
deepLink prop을 받으면 해당 아이템을 detailItem으로 세팅.

## 파일
- `src/App.jsx` — deepLink state, 각 탭에 전달
- `src/components/HomeTab.jsx` — setTab 호출에 params 추가
- `src/components/FoodTab.jsx` — RestaurantDetailModal 추가 + deepLink 처리
- `src/components/CourseTab.jsx` — deepLink 처리
- `src/components/ShoppingTab.jsx` — deepLink 처리

## 우선순위
CourseTab(바로 가능) → FoodTab(모달 신규) → ShoppingTab(바로 가능) → HomeTab 연결

## 주의
- 빌드 에러 절대 불가
- deepLink 소비 후 반드시 null로 리셋 (무한 루프 방지)
- 기존 탭 동작은 그대로 유지 (params 없으면 기존처럼 첫 화면)

## 완료 후
```
npx vite build
openclaw system event --text "Done: Board-053 딥링킹 시스템 — 홈탭→상세 직행 완료" --mode now
```
