/*
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 *  NEAR Design Tokens v2.0
 *  Brand: #C4725A (Terracotta)
 *  "신뢰감이 묻어나는 간결함. 하지만 분명함."
 *
 *  모든 NEAR UI의 Single Source of Truth.
 *  예약, 관리자, 지도, 마이페이지 — 전부 이 토큰만 사용.
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 */
export const tokens = {
  // ── Color ──────────────────────────────────
  // Primary: #C4725A Terracotta. 따뜻함 + 절제 + 고급감.
  // 파란색이 주는 차가운 신뢰가 아니라, 가죽·도자기 같은 물성의 신뢰.
  color: {
    primary:      "#C4725A",
    primarySoft:  "rgba(196,114,90,0.08)",   // 선택 배경, 보증금 영역
    primaryMid:   "rgba(196,114,90,0.15)",   // 호버, 포커스
    primaryDark:  "#A85D48",                 // 프레스 상태, 진한 변형
    success:      "#00B578",                 // 확정, 완료, 승인
    successSoft:  "rgba(0,181,120,0.08)",
    warning:      "#FF8F1F",                 // 대기, 주의
    warningSoft:  "rgba(255,143,31,0.08)",
    error:        "#FF3141",                 // 취소, 노쇼, 에러
    errorSoft:    "rgba(255,49,65,0.08)",
    // Text: rgba 기반
    text1:        "rgba(0,0,0,0.88)",        // 제목, 금액, 핵심 정보
    text2:        "rgba(0,0,0,0.55)",        // 본문, 라벨
    text3:        "rgba(0,0,0,0.35)",        // 캡션, 보조 정보
    text4:        "rgba(0,0,0,0.15)",        // 비활성, 플레이스홀더
    // Surface
    bg:           "#F7F8FA",                 // 페이지 배경
    card:         "#FFFFFF",                 // 카드, 인풋
    border:       "rgba(0,0,0,0.06)",        // 기본 구분선
    borderStrong: "rgba(0,0,0,0.12)",        // 강조 구분선
    overlay:      "rgba(0,0,0,0.45)",        // 모달 배경
    white:        "#FFFFFF",
  },
  // ── Typography ────────────────────────────
  font: {
    family: "'Pretendard', -apple-system, BlinkMacSystemFont, 'Apple SD Gothic Neo', 'Noto Sans SC', 'Noto Sans JP', sans-serif",
    hero:    { size: 28, weight: 700, height: 1.25, spacing: -0.5 },
    h1:      { size: 22, weight: 700, height: 1.3,  spacing: -0.3 },
    h2:      { size: 17, weight: 600, height: 1.35, spacing: -0.2 },
    h3:      { size: 15, weight: 600, height: 1.4,  spacing: -0.1 },
    body:    { size: 14, weight: 400, height: 1.5,  spacing: 0 },
    caption: { size: 12, weight: 400, height: 1.4,  spacing: 0 },
    micro:   { size: 10, weight: 500, height: 1.3,  spacing: 0.2 },
  },
  // ── Spacing (4px grid) ────────────────────
  space: { 1: 4, 2: 8, 3: 12, 4: 16, 5: 20, 6: 24, 8: 32, 10: 40, 12: 48 },
  // ── Radius ────────────────────────────────
  radius: { sm: 6, md: 12, lg: 16, xl: 20, pill: 100, full: 9999 },
  // ── Elevation ─────────────────────────────
  shadow: {
    sm: "0 1px 2px rgba(0,0,0,0.04), 0 1px 4px rgba(0,0,0,0.04)",
    md: "0 2px 8px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)",
    lg: "0 4px 16px rgba(0,0,0,0.08), 0 2px 4px rgba(0,0,0,0.04)",
    xl: "0 8px 32px rgba(0,0,0,0.12), 0 2px 8px rgba(0,0,0,0.04)",
  },
  // ── Motion ────────────────────────────────
  motion: {
    instant:     "100ms",
    fast:        "200ms",
    normal:      "300ms",
    slow:        "500ms",
    celebration: "700ms",
    ease:    "cubic-bezier(0.4, 0, 0.2, 1)",
    easeOut: "cubic-bezier(0, 0, 0.2, 1)",
    easeIn:  "cubic-bezier(0.4, 0, 1, 1)",
    spring:  "cubic-bezier(0.34, 1.56, 0.64, 1)",
  },
  // ── Component Specs ───────────────────────
  component: {
    buttonHeight:      48,
    buttonHeightSmall: 36,
    inputHeight:       48,
    headerHeight:      52,
    bottomBarHeight:   64,
    cardPadding:       16,
    maxWidth:          420,   // 모바일
    maxWidthAdmin:     800,   // 관리자
  },
};

// ── Helper: apply font token ──
export const font = (level) => ({
  fontSize: tokens.font[level].size,
  fontWeight: tokens.font[level].weight,
  lineHeight: tokens.font[level].height,
  letterSpacing: tokens.font[level].spacing,
});
