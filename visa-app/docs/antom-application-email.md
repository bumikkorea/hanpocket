# Antom (Alipay Global) 가맹점 신청 이메일 템플릿

## 수신: global.service@alipay.com

---

**Subject: Merchant Application — NEAR (Beauty Reservation Platform for Foreign Tourists in South Korea)**

Dear Antom Business Development Team,

We would like to apply for Antom merchant registration for our service **NEAR**.

### About NEAR

NEAR is a beauty & lifestyle reservation platform specifically designed for foreign tourists visiting South Korea. Our primary users are Chinese tourists who need to book services at Korean beauty salons, nail studios, and medical clinics — but cannot use Korean payment methods (Kakao Pay, Naver Pay, etc.).

### Why Antom/Alipay

- **Primary users:** Chinese tourists in South Korea (90%+ of user base)
- **Payment need:** Online deposit payment (30% of service fee) to confirm reservations
- **Preferred payment:** Alipay is the #1 payment method our users request
- **Volume estimate:** [초기 예상 거래량 기입]

### Business Details

- **Company Name:** [사업자명]
- **Business Registration Number:** [사업자등록번호]
- **Country:** South Korea
- **Website:** https://hanpocket.com (or https://near.hanpocket.com)
- **App:** NEAR (PWA, available via mobile browser)
- **Industry:** Online Travel / Beauty Services Marketplace
- **Settlement Currency:** KRW (Korean Won)

### Integration Requirements

- **Product:** Cashier Payment (Web/Mobile redirect)
- **Payment Methods:** Alipay (China mainland), Alipay HK
- **Use Case:** Cross-border deposit payment for beauty service reservations
- **Technical:** Cloudflare Workers backend, React frontend
- **Sandbox:** We would like sandbox access first for integration testing

### Contact

- **Name:** [담당자 이름]
- **Email:** [이메일]
- **Phone:** [전화번호]

We look forward to hearing from you.

Best regards,
[이름]

---

## 첨부 서류 체크리스트

- [ ] 사업자등록증 (Certificate of Business Registration)
- [ ] 법인 통장 사본 (Bank account details for settlement)
- [ ] 서비스 URL 스크린샷 (Website/app screenshots)
- [ ] 사업 내용 설명서 (Business description, can use this email)

## 신청 후 예상 일정

1. 이메일 발송 → 1-2 영업일 내 초대 이메일 수신
2. Antom 포털에서 서류 업로드 + 정보 입력
3. 심사 (1 영업일)
4. Client ID + API Key 발급
5. 샌드박스 테스트
6. 프로덕션 전환

## Antom 포털 URL

- 가맹점 온보딩: https://global.alipay.com/docs/ac/merchant_service/merchant_onboard
- API 문서: https://global.alipay.com/docs/ac/ams/api
- 샌드박스: https://docs.antom.com
