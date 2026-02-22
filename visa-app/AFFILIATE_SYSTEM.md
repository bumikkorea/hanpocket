# HanPocket 어필리에이트 링크 시스템

## 개요
HanPocket 앱에 통합된 어필리에이트 링크 시스템으로 사용자의 구매/예약을 통해 수익을 창출합니다.

## 적용된 플랫폼

### 여행/체험 (Travel & Experience)
- **Klook** - ID: `aff_3219_hp`
  - URL 파라미터: `aid`, `utm_source`, `utm_medium`
  - 지원 결제: Alipay, WeChat Pay
  
- **KKday** - ID: `aff_4327_hp`
  - URL 파라미터: `cid`, `utm_source`
  - 지원 결제: Alipay

- **Trip.com** - ID: `aff_1892_hp`
  - URL 파라미터: `promo`, `locale`
  - 지원 결제: Alipay, WeChat, UnionPay

- **하나투어** - ID: `aff_5671_hp`
- **인터파크투어** - ID: `aff_8234_hp`

### 쇼핑몰 (E-commerce)
- **쿠팡 파트너스** - ID: `aff_1234_hp`
  - 특별 링크 형태: `https://link.coupang.com/a/{id}`
  
- **11번가** - ID: `aff_5678_hp`
- **G마켓** - ID: `aff_9012_hp`
- **옥션** - ID: `aff_3456_hp`

### 맛집 예약 (Restaurant Booking)
- **캐치테이블** - ID: `aff_7890_hp`
- **식신** - ID: `aff_2345_hp`
- **요기요** - ID: `aff_6789_hp`
- **배달의민족** - ID: `aff_0123_hp`

### 숙박 (Accommodation)
- **야놀자** - ID: `aff_4567_hp`
- **여기어때** - ID: `aff_8901_hp`
- **Booking.com** - ID: `1234567`

### 뷰티/쇼핑 (Beauty & Fashion)
- **올리브영** - ID: `aff_5555_hp`
- **무신사** - ID: `aff_6666_hp`

## 기술적 구현

### 1. 어필리에이트 링크 관리
파일: `src/utils/affiliateLinks.js`

```javascript
// 어필리에이트 링크 생성
const affiliateUrl = generateAffiliateLink('klook', originalUrl, {
  utm_campaign: 'hanpocket_promo'
})

// 클릭 추적
await trackAffiliateClick('klook', originalUrl, {
  widgetType: 'trip',
  category: 'seoul-tour'
})
```

### 2. React 컴포넌트
파일: `src/components/AffiliateLink.jsx`

```jsx
<AffiliateLink 
  platform="klook" 
  originalUrl="https://www.klook.com/ko/activity/123-seoul-tour/"
  additionalData={{ widgetType: 'trip' }}
  className="btn btn-primary"
>
  예약하기
</AffiliateLink>
```

### 3. 클릭 로그 시스템
- **저장소**: localStorage
- **최대 저장량**: 1,000개 항목
- **추적 데이터**: 플랫폼, URL, 타임스탬프, UserAgent, Referrer 등

### 4. 수익 추적 대시보드
파일: `src/components/AffiliateTracker.jsx`
- 개발 모드에서만 표시
- 실시간 클릭 통계
- 플랫폼별 성과 분석
- 로그 내보내기/삭제 기능

## 적용 위치

### widgets.js
- 여행 플랫폼 링크 (Klook, KKday, Trip.com)
- 축제 티켓 링크 (6개 축제)
- 전통 체험 예약 링크 (10개 체험)
- 숙박 플랫폼 데이터

### restaurantData.js
- 미쉐린 레스토랑에 캐치테이블/식신 링크 추가

## 수익 모델

### 수수료율 (예상)
- **Klook**: 3-8%
- **KKday**: 3-8% 
- **Trip.com**: 2-6%
- **쿠팡**: 1-5%
- **숙박 플랫폼**: 3-10%
- **맛집 예약**: 2-5%

### 월 예상 수익 (가정)
- 일 활성 사용자: 1,000명
- 클릭률: 5%
- 전환율: 3%
- 평균 주문금액: ₩50,000
- 평균 수수료: 5%

**월 예상 수익**: ₩112,500

## 모니터링

### 실시간 추적
```javascript
// 브라우저 콘솔에서
window.getAffiliateReport()
```

### 로그 분석
- 가장 클릭이 많은 플랫폼
- 시간대별 활동 패턴
- 위젯별 전환율
- 사용자 행동 분석

## 향후 개선사항

1. **서버 기반 추적**: 현재 localStorage → 서버 DB
2. **A/B 테스팅**: 링크 위치 및 문구 최적화
3. **개인화**: 사용자 행동 기반 추천
4. **앱 내 결제**: iframe 결제 시스템 도입
5. **쿠폰 시스템**: 독점 할인 코드 제공

## 주의사항

1. **개인정보보호**: 최소한의 데이터만 수집
2. **투명성**: 어필리에이트 링크임을 명시
3. **사용자 경험**: 광고성보다 실용성 우선
4. **법적 준수**: 각국 전자상거래법 준수