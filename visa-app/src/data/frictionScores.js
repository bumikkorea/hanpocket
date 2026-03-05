// 외국인 막힘 점수: 한국 폰번호 없는 외국인이 해당 서비스를 이용할 때 겪는 어려움 (1-10)
// 10 = 완전히 불가능, 1 = 전혀 문제 없음
export const FRICTION_SCORES = [
  { service: '배달의민족', score: 10, reason: '한국 폰번호 필수, 한국 카드 필수', hanpocket: '주문 대행 가이드 제공' },
  { service: '카카오택시', score: 9, reason: '한국 폰번호 필수', hanpocket: '길에서 택시 잡는 법 + 기사에게 보여줄 한국어 카드' },
  { service: '네이버 예약', score: 9, reason: '한국 폰번호 필수', hanpocket: '직접 전화 예약용 한국어 스크립트' },
  { service: '카카오톡', score: 8, reason: '폰번호 인증 필요 (해외번호 가능하나 불안정)', hanpocket: '위챗으로 대체 가능 안내' },
  { service: '무인 키오스크', score: 8, reason: '한국어만 지원, UI 복잡', hanpocket: '키오스크 사용법 사진 가이드' },
  { service: '대중교통 (버스)', score: 7, reason: '현금 불가, 교통카드 필수', hanpocket: '교통카드 구매처 + 충전법 가이드' },
  { service: '병원 예약', score: 7, reason: '한국어 전화 예약, 보험 문제', hanpocket: '외국인 진료 가능 병원 목록 + 통역 서비스' },
  { service: '택배 보내기', score: 7, reason: '한국어 주소 작성, 폰번호', hanpocket: '편의점 택배 보내기 가이드' },
  { service: '은행 환전', score: 6, reason: '영어 소통 제한적', hanpocket: '환전소 위치 + 환율 비교' },
  { service: '편의점 택배', score: 6, reason: '한국어 양식 작성', hanpocket: '작성 예시 이미지 제공' },
  { service: '지하철', score: 5, reason: '영어 안내 있으나 환승 복잡', hanpocket: '노선 가이드 + 환승 꿀팁' },
  { service: '관광지 입장', score: 4, reason: '대부분 현장 구매 가능', hanpocket: '사전 예약 시 할인 정보' },
  { service: '카페', score: 3, reason: '키오스크 한국어지만 손가락으로 가능', hanpocket: '주문 한국어 카드' },
  { service: '편의점 구매', score: 2, reason: '셀프 결제 쉬움', hanpocket: '꿀팁 (1+1 등)' },
  { service: '호텔 체크인', score: 2, reason: '영어 가능', hanpocket: '짐 보관/택시 요청 한국어' },
  { service: '면세점', score: 1, reason: '중국어 직원 많음', hanpocket: '면세한도 안내' },
  { service: '인천공항', score: 1, reason: '다국어 완벽 지원', hanpocket: '공항 내 서비스 위치 안내' },
]
