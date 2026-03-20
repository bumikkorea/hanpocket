# NEAR Y2K Design System — 아시아 여성 타겟 뷰티 예약 플랫폼

## 디자인 철학
"네이버 예약보다 100배 예쁜, 아시아 여성들이 스크린샷 찍고 싶어하는 앱"
Y2K 감성 + 글래시모피즘 + 파스텔 드림

## 컬러 팔레트

### Primary Colors
- `--y2k-pink`: #FF85B3 (핫핑크 — 메인 액센트)
- `--y2k-lavender`: #C4B5FD (라벤더 — 서브 액센트)
- `--y2k-sky`: #7DD3FC (스카이블루 — 정보/링크)
- `--y2k-mint`: #86EFAC (민트 — 성공/확인)

### Gradient Presets
- `--gradient-dream`: linear-gradient(135deg, #FF85B3 0%, #C4B5FD 50%, #7DD3FC 100%)
- `--gradient-sunset`: linear-gradient(135deg, #FCA5A5 0%, #FBBF24 100%)
- `--gradient-aurora`: linear-gradient(135deg, #C4B5FD 0%, #7DD3FC 50%, #86EFAC 100%)
- `--gradient-chrome`: linear-gradient(135deg, #E8E8E8 0%, #FFFFFF 40%, #D4D4D4 60%, #F5F5F5 100%)

### Neutral / Base
- `--y2k-white`: #FFFBFE (웜 화이트)
- `--y2k-bg`: #FFF5F9 (핑크틴트 배경)
- `--y2k-surface`: #FFFFFF
- `--y2k-text`: #2D2D3F (딥 퍼플 블랙)
- `--y2k-text-sub`: #8B8BA3 (머티드 라벤더)
- `--y2k-border`: rgba(196, 181, 253, 0.3) (라벤더 보더)

### Glass Effect
- `--glass-bg`: rgba(255, 255, 255, 0.6)
- `--glass-border`: rgba(255, 255, 255, 0.4)
- `--glass-shadow`: 0 8px 32px rgba(255, 133, 179, 0.15)
- backdrop-filter: blur(20px) saturate(180%)

## 타이포그래피
- 한국어/중국어: "Pretendard", -apple-system, sans-serif
- 영어/숫자: "Inter", sans-serif  
- 장식: "Caveat" (필기체, 감성 텍스트)
- 숫자: tabular-nums (정렬된 숫자)

### Scale
- Hero: 28px / weight 300 / letter-spacing -0.03em
- Title: 20px / weight 700 / -0.01em
- Subtitle: 15px / weight 600
- Body: 14px / weight 400 / line-height 1.7
- Caption: 12px / weight 500
- Badge: 10px / weight 700 / uppercase / letter-spacing 0.1em

## 컴포넌트 스타일

### Buttons
- Primary: gradient-dream 배경, 흰 텍스트, border-radius 9999px (pill)
- Secondary: glass 효과, 라벤더 보더
- Ghost: 투명, 핑크 텍스트
- 모든 버튼: active:scale-[0.95] transition, shadow on hover
- 아이콘 버튼: 원형, glass 배경

### Cards
- border-radius: 20px (큰 라운드)
- background: white or glass
- border: 1px solid var(--y2k-border)
- box-shadow: 0 4px 20px rgba(255, 133, 179, 0.08)
- hover: translateY(-2px) + shadow 강화 + 약간의 glow

### Input Fields
- border-radius: 16px
- border: 2px solid transparent → focus: border-color var(--y2k-lavender)
- background: rgba(255, 255, 255, 0.8)
- focus ring: ring-2 ring-[#C4B5FD]/30

### Bottom Navigation
- glass 배경 (blur 20px)
- 활성 탭: gradient-dream 아이콘 + 글로우 도트
- 비활성: --y2k-text-sub 색상
- 탭 전환 시 부드러운 spring 애니메이션

### Status Badges
- 글래스 pill 형태
- 색상별: 핑크(예약대기), 민트(확정), 라벤더(완료), 그레이(취소)
- 약간의 반짝이 효과 (shimmer animation)

## 애니메이션

### Micro-interactions
- 버튼 클릭: scale(0.95) → scale(1) (spring)
- 카드 등장: fadeUp + scale(0.98→1) (stagger 0.06s)
- 페이지 전환: slide + fade (200ms)
- 로딩: gradient shimmer sweep
- 성공: 체크마크 draw + confetti particles

### Shimmer Effect
```css
@keyframes shimmer {
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}
.shimmer {
  background: linear-gradient(90deg, transparent 0%, rgba(255,133,179,0.1) 50%, transparent 100%);
  background-size: 200% 100%;
  animation: shimmer 2s infinite;
}
```

### Glow Effect
```css
.glow-pink {
  box-shadow: 0 0 20px rgba(255, 133, 179, 0.3), 0 0 60px rgba(255, 133, 179, 0.1);
}
.glow-lavender {
  box-shadow: 0 0 20px rgba(196, 181, 253, 0.3), 0 0 60px rgba(196, 181, 253, 0.1);
}
```

## 예약 플로우 (뷰티/헤어/의료)

### Step 1: 카테고리 선택
- 큰 아이콘 카드 (💆 뷰티 / 💇 헤어 / 🏥 의료)
- glass 카드, gradient 보더 on hover
- 감성 카피: "오늘의 나를 위한 시간"

### Step 2: 매장/시술 선택
- 매장 카드: 사진 + 평점 + 가격 range
- 시술 선택: pill 태그 (탭하면 gradient 활성)
- 가격: 크롬 실버 배지

### Step 3: 날짜/시간
- 커스텀 캘린더 (라운드, 핑크 하이라이트)
- 시간 슬롯: pill 그리드
- 선택된 날짜/시간: gradient glow

### Step 4: 결제 확인
- 요약 카드 (glass)
- 알리페이/위챗페이 버튼 (브랜드 컬러)
- 확인 버튼: gradient-dream + pulse glow

### 완료 화면
- 큰 체크 애니메이션 + 파티클
- "예약이 확정되었어요 ✨" (Caveat 필기체)
- 캘린더 추가 / 공유 버튼

## 적용 범위
1. **theme.css** — CSS 변수 전면 교체
2. **index.css** — 글로벌 스타일 업데이트
3. **모든 Tab 컴포넌트** — 색상/라운드/그라데이션 적용
4. **예약 컴포넌트** — 전면 리디자인
5. **하단 네비게이션** — glass + gradient 활성 탭
6. **HomeTab** — 히어로 섹션 gradient 배경

## 레퍼런스
- Glossier 웹사이트 (glassmorphism + pink)
- 올리브영 앱 (카드 레이아웃)
- 젠틀몬스터 (감성 + 미니멀)
- 샤오홍슈 인기 뷰티 포스트 디자인
- Apple Store 구매 플로우 (step-by-step 우아함)
