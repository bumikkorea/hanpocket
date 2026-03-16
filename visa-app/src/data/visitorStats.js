// 월별 외국인 입국자 통계 (출처: 법무부 출입국통계, 외국인+승객+입국)
// 매월 업데이트 필요 — KOSIS API 정상화 시 자동화 예정
// 최신 데이터 추가 시 배열 맨 뒤에 추가하면 됨

export const MONTHLY_VISITORS = [
  { year: 2024, month: 1, total: 853347 },
  { year: 2024, month: 2, total: 1032539 },
  { year: 2024, month: 3, total: 1445108 },
  { year: 2024, month: 4, total: 1399919 },
  { year: 2024, month: 5, total: 1356097 },
  { year: 2024, month: 6, total: 1358600 },
  { year: 2024, month: 7, total: 1360568 },
  { year: 2024, month: 8, total: 1530419 },
  { year: 2024, month: 9, total: 1417969 },
  { year: 2024, month: 10, total: 1537877 },
  { year: 2024, month: 11, total: 1308610 },
  { year: 2024, month: 12, total: 1225603 },
  { year: 2025, month: 1, total: 1083026 },
  { year: 2025, month: 2, total: 1134984 },
  { year: 2025, month: 3, total: 1565383 },
  { year: 2025, month: 4, total: 1634451 },
  { year: 2025, month: 5, total: 1553872 },
  { year: 2025, month: 6, total: 1551639 },
  { year: 2025, month: 7, total: 1667849 },
  { year: 2025, month: 8, total: 1781016 },
  { year: 2025, month: 9, total: 1637706 },
  { year: 2025, month: 10, total: 1691145 },
  { year: 2025, month: 11, total: 1534807 },
  { year: 2025, month: 12, total: 1515967 },
  { year: 2026, month: 1, total: 1281704 },
]

// 최신(마지막) 데이터 가져오기
export function getLatestVisitorData() {
  const latest = MONTHLY_VISITORS[MONTHLY_VISITORS.length - 1]
  return {
    year: latest.year,
    month: latest.month,
    total: latest.total,
  }
}
