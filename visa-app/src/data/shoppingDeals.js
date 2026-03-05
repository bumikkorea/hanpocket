export const OLIVEYOUNG_SALES = [
  { name: '올영세일', period: '1월 초 (약 2주)', month: 1, discount: '최대 50%', note: { ko: '신년 세일, 전 품목 대상', zh: '新年大促，全品类', en: 'New Year sale, all items' } },
  { name: '올영세일', period: '4월 초 (약 2주)', month: 4, discount: '최대 50%', note: { ko: '봄 시즌 세일', zh: '春季促销', en: 'Spring sale' } },
  { name: '올영세일', period: '6월 초 (약 2주)', month: 6, discount: '최대 50%', note: { ko: '여름 세일', zh: '夏季促销', en: 'Summer sale' } },
  { name: '올영세일', period: '9월 초 (약 2주)', month: 9, discount: '최대 50%', note: { ko: '가을 세일', zh: '秋季促销', en: 'Autumn sale' } },
  { name: '올영세일', period: '11월 말~12월 초 (약 2주)', month: 11, discount: '최대 70%', note: { ko: '연말 최대 세일, 블프 시즌', zh: '年末最大促销', en: 'Year-end biggest sale' } },
  { name: '올리브영 데이', period: '매월 25일', month: 0, discount: '추가 할인+적립', note: { ko: '매월 25일 멤버십 혜택', zh: '每月25号会员优惠', en: 'Monthly membership day' } },
]

export const SHOPPING_EVENTS = [
  { name: '코리아 세일 페스타', period: '11월 (약 2주)', discount: '전국 오프라인+온라인', note: { ko: '한국판 블랙프라이데이, 백화점+면세점+소상공인 참여', zh: '韩国版黑五，百货+免税店+小商户参加', en: 'Korea Black Friday equivalent' } },
  { name: '코리아 그랜드 세일', period: '1~2월 (약 6주)', discount: '관광객 대상 할인', note: { ko: '외국인 관광객 대상 쇼핑 축제, 면세점 추가 할인', zh: '面向外国游客的购物节', en: 'Tourist shopping festival' } },
  { name: '다이소 균일가 이벤트', period: '수시', discount: '1,000~5,000원', note: { ko: '한국판 100엔샵, 생활용품 최저가', zh: '韩国版百元店', en: 'Korean dollar store' } },
  { name: '무신사 세일', period: '5월, 11월', discount: '최대 80%', note: { ko: '패션 최대 할인, MZ세대 인기', zh: '时尚最大折扣', en: 'Fashion mega sale' } },
]

// 현재 월 기준 다음 세일 안내
export function getNextSale() {
  const now = new Date()
  const month = now.getMonth() + 1
  const day = now.getDate()

  // 올영데이 (매월 25일)
  if (day < 25) {
    return { type: 'oliveyoung-day', daysLeft: 25 - day, name: '올리브영 데이' }
  }

  // 다음 올영세일
  const saleMonths = [1, 4, 6, 9, 11]
  for (const sm of saleMonths) {
    if (sm > month) return { type: 'oliveyoung-sale', month: sm, name: '올영세일' }
  }
  return { type: 'oliveyoung-sale', month: 1, name: '올영세일 (내년)' }
}
