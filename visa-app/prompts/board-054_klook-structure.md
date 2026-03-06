# Board-054: 클룩 벤치마킹 — 계층적 여행 콘텐츠 구조

## 벤치마킹 대상: Klook (klook.com)

### 클룩 구조 (5단계 드릴다운)
1. **홈**: 프로모 배너 + 최근 본 액티비티 + 인기 도시
2. **도시 페이지** (예: 오사카): 히어로 배너 + 도시 소개 + 탭(둘러보기, 액티비티&체험, 교통, 숙소) + 인기 상품 카드
3. **지역 페이지** (예: 시티센터): 평점 + 리뷰수 + 탭(여행정보, 투어, 숙소, 음식점) + 여행코스 + 숙소
4. **상품 상세** (예: 입장권): 이미지 갤러리 + 평점/리뷰 + 위치 + 가격 + 옵션 선택 + 패키지

### 카드 UI 패턴 (클룩)
- 이미지 (16:9, 좌상단에 카테고리 태그)
- 우상단 ♡ 찜 버튼
- 카테고리 · 도시명
- **제목 (볼드)**
- "오늘부터 이용 가능" / "예약 즉시 확정"
- ★ 4.8 (83,852) · 5M+ 명의 선택
- **₩86,800 부터** (취소선 원가)
- 할인 배지 (초록색)

## HanPocket 적용 설계

### 여행 계층 구조 (한국 특화)
```
TravelTab
  ├─ 도시 선택 (서울, 부산, 제주, 인천, 경주, 강릉, 전주, 속초...)
  │
  ├─ CityPage (예: 서울)
  │   ├─ 히어로 배너 + 소개 텍스트
  │   ├─ 탭: 둘러보기 | 맛집 | 체험&입장 | 교통 | 숙소
  │   ├─ 인기 지역 (강남, 명동, 홍대, 이태원, 성수, 북촌, 여의도...)
  │   └─ 인기 스팟 카드 리스트
  │
  ├─ AreaPage (예: 명동)
  │   ├─ 히어로 + 소개
  │   ├─ 탭: 둘러보기 | 맛집 | 쇼핑 | 체험
  │   └─ 스팟 카드 리스트
  │
  └─ SpotDetail (예: 명동교자)
      ├─ 이미지 갤러리
      ├─ 이름 + 카테고리 태그
      ├─ ★ 평점 + 리뷰수
      ├─ 주소 + 카카오맵 길찾기
      ├─ 영업시간
      ├─ 가격대
      ├─ 대표 메뉴 / 설명
      └─ 상황별 한국어 회화 카드 (식당이면 식당 표현)
```

### 새로 만들어야 할 컴포넌트들
1. **CityPage.jsx** — 도시별 페이지 (서울/부산/제주/...)
2. **AreaPage.jsx** — 지역별 페이지 (강남/명동/홍대/...)  
3. **SpotDetail.jsx** — 스팟 상세 (맛집/관광지/체험)
4. **SpotCard.jsx** — 클룩 스타일 카드 컴포넌트 (재사용)

### 데이터 구조 (새 파일: src/data/travelData.js)
```js
export const CITIES = [
  {
    id: 'seoul',
    name: { ko: '서울', zh: '首尔', en: 'Seoul' },
    image: '...',
    description: { ko: '대한민국의 수도, K-문화의 중심...', zh: '...', en: '...' },
    areas: [
      {
        id: 'myeongdong',
        name: { ko: '명동', zh: '明洞', en: 'Myeongdong' },
        image: '...',
        description: { ko: '쇼핑과 길거리 음식의 메카', zh: '...', en: '...' },
        tags: ['shopping', 'food', 'kbeauty'],
      },
      // 강남, 홍대, 이태원, 성수, 북촌, 여의도, 잠실...
    ],
    spots: [
      {
        id: 'myeonggyoja',
        name: { ko: '명동교자', zh: '明洞饺子', en: 'Myeongdong Kyoja' },
        area: 'myeongdong',
        category: 'food',  // food | attraction | experience | shopping
        image: '...',
        images: ['...'],
        rating: 4.5,
        reviewCount: 2340,
        priceRange: 1,  // 1~3
        price: '₩10,000~',
        address: { ko: '서울 중구 명동10길 29', zh: '...', en: '...' },
        hours: '10:30 - 21:00',
        description: { ko: '1966년 개업, 칼국수와 만두가 유명', zh: '...', en: '...' },
        tags: ['미슐랭빕', '칼국수', '만두'],
        kakaoMapUrl: 'https://map.kakao.com/...',
        relatedPhrases: 'restaurant',  // 상황별 한국어 pocket 연결
      },
    ],
  },
  // 부산, 제주, 인천, 경주, 강릉, 전주, 속초...
]
```

### TravelTab.jsx 리빌드
현재 TravelTab은 단순 리스트. 클룩처럼 계층적으로 변경:

```jsx
// TravelTab state
const [selectedCity, setSelectedCity] = useState(null)
const [selectedArea, setSelectedArea] = useState(null)
const [selectedSpot, setSelectedSpot] = useState(null)

// 렌더링
if (selectedSpot) return <SpotDetail spot={selectedSpot} onBack={...} />
if (selectedArea) return <AreaPage area={selectedArea} city={selectedCity} onSpotClick={setSelectedSpot} onBack={...} />
if (selectedCity) return <CityPage city={selectedCity} onAreaClick={setSelectedArea} onSpotClick={setSelectedSpot} onBack={...} />
return <CityList cities={CITIES} onCityClick={setSelectedCity} />
```

### 단계별 실행
**Phase 1 (지금)**: 데이터 + CityList + CityPage + SpotCard + SpotDetail (서울만 먼저)
**Phase 2**: AreaPage 추가 + 부산/제주 데이터
**Phase 3**: 나머지 도시 + 검색

## Phase 1 구현 상세

### travelData.js — 서울 데이터 (최소 실행 가능)
- 서울 도시: 소개, 이미지
- 서울 지역 6개: 명동, 강남, 홍대, 이태원, 성수, 북촌
- 서울 스팟 최소 12개 (지역당 2개): 맛집 + 관광지 혼합
  - 명동: 명동교자, N서울타워
  - 강남: 가로수길, 코엑스
  - 홍대: 연남동카페거리, 홍대자유시장
  - 이태원: 경리단길, 이태원앤틱거리
  - 성수: 성수연방, 대림창고갤러리
  - 북촌: 북촌한옥마을, 창덕궁

### SpotCard.jsx (클룩 스타일)
```jsx
// 카드 컴포넌트 — 재사용 가능
<div className="rounded-2xl border overflow-hidden">
  <div className="relative h-[160px]">
    <img src={spot.image} className="w-full h-full object-cover" />
    <span className="absolute top-2 left-2 bg-white/90 text-xs px-2 py-0.5 rounded-full font-medium">
      {categoryLabel}
    </span>
    <button className="absolute top-2 right-2">♡</button>
  </div>
  <div className="p-3">
    <p className="text-[11px] text-[#999]">{category} · {area}</p>
    <p className="text-sm font-bold text-[#1A1A1A] mt-0.5">{name}</p>
    <p className="text-xs text-[#666] mt-1">★ {rating} ({reviewCount}) · {tags}</p>
    <p className="text-sm font-bold text-[#1A1A1A] mt-1.5">{price}</p>
  </div>
</div>
```

### SpotDetail.jsx
```jsx
// 풀스크린 상세 페이지
<div className="fixed inset-0 z-50 bg-white overflow-y-auto">
  {/* 헤더 — ← 뒤로가기 */}
  {/* 이미지 갤러리 (스와이프) */}
  {/* 이름 + 카테고리 태그 */}
  {/* ★ 평점 + 리뷰수 */}
  {/* 주소 + 카카오맵 길찾기 버튼 */}
  {/* 영업시간 */}
  {/* 가격대 */}
  {/* 설명 */}
  {/* 관련 한국어 회화 (상황별 한국어 pocket 연결) */}
</div>
```

## 파일
- `src/data/travelData.js` (신규)
- `src/components/travel/SpotCard.jsx` (신규)
- `src/components/travel/SpotDetail.jsx` (신규)
- `src/components/travel/CityPage.jsx` (신규)
- `src/components/TravelTab.jsx` (리빌드)

## 주의
- 기존 TravelTab 기능은 유지하되 구조만 변경
- 빌드 에러 불가
- 29CM 스타일 유지 (Inter 폰트, 검정 단색, 흰 배경)
- 이미지는 Unsplash URL 사용

## 완료 후
```
npx vite build
openclaw system event --text "Done: Board-054 클룩 벤치마킹 Phase 1 — 계층적 여행 구조(서울) 완료" --mode now
```
