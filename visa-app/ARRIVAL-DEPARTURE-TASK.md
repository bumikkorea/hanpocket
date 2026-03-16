# Task: 입국/출국 하위 화면 완성

## 프로젝트
- 경로: `/home/theredboat_ai/.openclaw/workspace/visa-app`
- React + Vite + Tailwind CSS
- 3개 언어 지원: L(lang, { ko, zh, en }) 헬퍼 사용
- 디자인: 29CM 스타일, 검정 단색, Pretendard 폰트, border-radius `rounded-[6px]`

## 현재 상태
HomeTab.jsx에 입국 3단계 플로우(entry/move/hotel)와 출국 플로우가 있음.
메뉴 아이템은 있지만, 클릭 시 연결되는 **하위 상세 화면**이 미완성.

## 해야 할 것 (4가지 영역)

### 1. 입국 단계 하위 화면
- `src/components/guides/` 디렉토리에 새 가이드 컴포넌트 생성
- **ImmigrationWaitTime** — 이미 존재 (`ImmigrationWaitTime.jsx`)
- **ArrivalCardGuide** — 이미 존재
- **SimGuide** — 이미 존재
- **PetTab** — 이미 존재
- **AirportFacilitiesGuide** (신규) — 인천공항 시설 안내 (은행, 약국, 편의점, 짐보관소, 라운지, 면세점 위치)
- **DietaryCardGuide** — 이미 존재
- 이미 존재하는 것들은 HomeTab에서 연결만 확인. 새로 만들 건 AirportFacilitiesGuide뿐.

### 2. 이동 단계 하위 화면
HomeTab.jsx에 이미 transport 상세와 sim-exchange 상세가 인라인으로 있음.
추가로 필요한 것:
- **BusGuide** (신규) — 공항버스/시내버스 타는법. 노선, 요금, 결제법
- **SubwayGuide** (신규) — 지하철 타는법. 노선도, T-money, 환승법
- **ArexGuide** (신규) — AREX 공항철도 상세 (직통 vs 일반, 시간표, 요금)
- **TaxiGuide** (신규) — 택시 종류(일반/모범/대형), 앱호출(카카오T, I·RIDE), 요금
- **NavigationClone** — CourseTab의 길찾기 기능을 독립 컴포넌트로 클론 (카카오맵/구글맵/바이두맵 연결)

### 3. 숙소 단계 하위 화면
- **CheckinCardGuide** (신규) — 호텔 체크인할 때 쓰는 한국어 카드 (이름/예약번호/체크인시간 등 보여주기)
- **NearbyExplore** (신규) — 숙소 주변 탐색 (편의점, 약국, 식당 찾기 → 기존 탭들로 연결)

### 4. 출국 플로우 상세
기존 출국준비 메뉴(HomeTab `departure` step)에 추가:
- **TaxRefundGuide** — 이미 존재
- **DutyFreeLimitGuide** — 이미 존재 (국가별 면세한도)
- **CustomsGuide** — 이미 존재
- 새로 필요: **DepartureChecklistGuide** (신규) — 출국 체크리스트 (여권, 탑승권, 환급, 짐 확인)

## 규칙
1. 모든 가이드 컴포넌트는 `GuideLayout` 래퍼 사용 (`import GuideLayout from './GuideLayout'`)
2. L(lang, {ko, zh, en}) 3개 언어 필수
3. border-radius: `rounded-[6px]` (원형만 `rounded-full`)
4. 이모지 아이콘 사용 가능 (가이드 내부는 OK)
5. 실제 정보만 (mock/더미 데이터 금지)
6. HomeTab.jsx에서 새 가이드로의 라우팅 연결 (lazy import + overlay/setOverlay 패턴)
7. 빌드 확인: `npm run build` 에러 없어야 함
8. 결과물은 파일로 저장하거나 이 세션에서 텍스트로 반환만 해. 절대로 telegram bot API를 직접 호출하거나 외부 봇 토큰으로 메시지를 보내지 마.

## GuideLayout 사용 예시
```jsx
import GuideLayout from './GuideLayout'

export default function NewGuide({ onBack, lang }) {
  const L = (l, obj) => obj[l] || obj.ko
  return (
    <GuideLayout title={L(lang, { ko: '제목', zh: '标题', en: 'Title' })} onBack={onBack}>
      {/* 내용 */}
    </GuideLayout>
  )
}
```

## 완료 조건
- 모든 신규 가이드 생성됨
- HomeTab.jsx에서 모든 메뉴 아이템이 해당 가이드로 연결됨
- `npm run build` 성공
- 완료 후 `openclaw system event --text "Done: 입국/출국 하위 화면 8개 완성" --mode now` 실행
