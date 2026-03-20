// NEAR 예약 시스템 — 다국어 텍스트

export const reservationText = {
  // ─── 탭 & 네비게이션 ───
  tabTitle: { ko: '예약', zh: '预约', en: 'Booking' },
  myReservations: { ko: '내 예약', zh: '我的预约', en: 'My Bookings' },
  newReservation: { ko: '새 예약', zh: '新预约', en: 'New Booking' },

  // ─── 예약 Step 1: 서비스 선택 ───
  step1Title: { ko: '서비스 선택', zh: '选择服务', en: 'Select Service' },
  searchService: { ko: '서비스 검색', zh: '搜索服务', en: 'Search services' },
  popular: { ko: '인기', zh: '热门', en: 'Popular' },
  duration: { ko: '소요시간', zh: '所需时间', en: 'Duration' },
  minutes: { ko: '분', zh: '分钟', en: 'min' },
  selected: { ko: '선택됨', zh: '已选', en: 'Selected' },
  selectServices: { ko: '서비스를 선택하세요', zh: '请选择服务', en: 'Select services' },
  totalAmount: { ko: '합계', zh: '合计', en: 'Total' },
  next: { ko: '다음', zh: '下一步', en: 'Next' },

  // ─── 예약 Step 2: 날짜/시간 ───
  step2Title: { ko: '날짜 & 시간', zh: '选择日期和时间', en: 'Date & Time' },
  selectDate: { ko: '날짜 선택', zh: '选择日期', en: 'Select date' },
  selectTime: { ko: '시간 선택', zh: '选择时间', en: 'Select time' },
  unavailable: { ko: '예약 불가', zh: '不可预约', en: 'Unavailable' },
  breakTime: { ko: '브레이크타임', zh: '休息时间', en: 'Break time' },
  selectStylist: { ko: '담당자 선택', zh: '选择设计师', en: 'Select stylist' },
  anyStylist: { ko: '아무나', zh: '随机分配', en: 'Any' },
  back: { ko: '이전', zh: '上一步', en: 'Back' },

  // ─── 중국어 요일 ───
  weekdays: {
    ko: ['일', '월', '화', '수', '목', '금', '토'],
    zh: ['日', '一', '二', '三', '四', '五', '六'],
    en: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
  },
  months: {
    ko: ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월'],
    zh: ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'],
    en: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
  },

  // ─── 예약 Step 3: 결제 ───
  step3Title: { ko: '결제 확인', zh: '确认支付', en: 'Payment' },
  reservationSummary: { ko: '예약 내역', zh: '预约详情', en: 'Booking Summary' },
  service: { ko: '서비스', zh: '服务', en: 'Service' },
  dateTime: { ko: '일시', zh: '日期时间', en: 'Date & Time' },
  stylist: { ko: '담당', zh: '设计师', en: 'Stylist' },
  totalPrice: { ko: '총 금액', zh: '总金额', en: 'Total Price' },
  deposit: { ko: '보증금', zh: '定金', en: 'Deposit' },
  depositDesc: { ko: '총액의 30% 선결제', zh: '预付总额的30%', en: '30% prepayment' },
  remainingBalance: { ko: '잔금 (현장 결제)', zh: '余款（到店支付）', en: 'Balance (pay at shop)' },
  paymentMethod: { ko: '결제 수단', zh: '支付方式', en: 'Payment Method' },
  recommended: { ko: '추천', zh: '推荐', en: 'Recommended' },
  payDeposit: { ko: '보증금 결제', zh: '支付定金', en: 'Pay Deposit' },

  // ─── 환불 정책 ───
  refundPolicy: { ko: '환불 정책', zh: '退款政策', en: 'Refund Policy' },
  refundTier72h: { ko: '24시간 전 취소 → 전액 환불', zh: '24小时前取消 → 全额退款', en: 'Cancel 24h before → Full refund' },
  refundTier24h: { ko: '24시간 이내 취소 → 50% 환불', zh: '24小时内取消 → 退款50%', en: 'Cancel within 24h → 50% refund' },
  refundNoshow: { ko: '노쇼(미도착) → 환불 불가', zh: '未到店 → 不退款', en: 'No-show → No refund' },
  agreeRefundPolicy: { ko: '환불 정책에 동의합니다', zh: '我同意退款政策', en: 'I agree to the refund policy' },

  // ─── 결제 처리 ───
  processingPayment: { ko: '결제 처리 중...', zh: '正在处理支付...', en: 'Processing payment...' },
  redirectingAlipay: { ko: '알리페이로 이동 중...', zh: '正在跳转支付宝...', en: 'Redirecting to Alipay...' },

  // ─── 완료 화면 ───
  bookingComplete: { ko: '예약 완료!', zh: '预约成功！', en: 'Booking Complete!' },
  bookingConfirmMsg: { ko: '예약이 접수되었습니다. 매장 확인 후 확정됩니다.', zh: '预约已提交，店铺确认后将生效。', en: 'Your booking has been submitted. It will be confirmed by the shop.' },
  depositPaid: { ko: '보증금 결제 완료', zh: '定金已支付', en: 'Deposit Paid' },
  balanceAtShop: { ko: '잔금은 현장에서 결제해주세요', zh: '余款请到店支付', en: 'Please pay the balance at the shop' },
  viewMyBookings: { ko: '내 예약 보기', zh: '查看我的预约', en: 'View My Bookings' },
  goHome: { ko: '홈으로', zh: '返回首页', en: 'Go Home' },
  reservationNo: { ko: '예약번호', zh: '预约编号', en: 'Booking No.' },

  // ─── 내 예약 목록 ───
  upcoming: { ko: '예정', zh: '即将到来', en: 'Upcoming' },
  past: { ko: '지난 예약', zh: '历史预约', en: 'Past' },
  noReservations: { ko: '예약이 없습니다', zh: '暂无预约', en: 'No bookings' },
  cancelReservation: { ko: '예약 취소', zh: '取消预约', en: 'Cancel Booking' },
  cancelConfirm: { ko: '정말 예약을 취소하시겠습니까?', zh: '确定要取消预约吗？', en: 'Are you sure you want to cancel?' },
  refundAmount: { ko: '환불 금액', zh: '退款金额', en: 'Refund Amount' },

  // ─── 관리자: 공통 ───
  adminTitle: { ko: 'NEAR 관리', zh: 'NEAR 管理', en: 'NEAR Admin' },
  todayTab: { ko: '오늘', zh: '今天', en: 'Today' },
  calendarTab: { ko: '캘린더', zh: '日历', en: 'Calendar' },
  customersTab: { ko: '고객', zh: '客户', en: 'Customers' },
  settlementsTab: { ko: '정산', zh: '结算', en: 'Settlements' },

  // ─── 관리자: 오늘 ───
  todayBookings: { ko: '오늘 예약', zh: '今日预约', en: "Today's Bookings" },
  pendingCount: { ko: '대기', zh: '待确认', en: 'Pending' },
  confirmedCount: { ko: '확정', zh: '已确认', en: 'Confirmed' },
  todayRevenue: { ko: '오늘 매출', zh: '今日营收', en: "Today's Revenue" },
  newBookingAlert: { ko: '새 예약이 도착했습니다!', zh: '有新预约！', en: 'New booking arrived!' },
  approve: { ko: '승인', zh: '确认', en: 'Approve' },
  reject: { ko: '거절', zh: '拒绝', en: 'Reject' },

  // ─── 관리자: 예약 상세 ───
  reservationDetail: { ko: '예약 상세', zh: '预约详情', en: 'Booking Detail' },
  customer: { ko: '고객', zh: '客户', en: 'Customer' },
  contact: { ko: '연락처', zh: '联系方式', en: 'Contact' },
  assignedStylist: { ko: '담당 스타일리스트', zh: '指定设计师', en: 'Assigned Stylist' },
  depositStatus: { ko: '보증금 상태', zh: '定金状态', en: 'Deposit Status' },
  depositPaidVia: { ko: '결제 완료', zh: '已通过{method}支付', en: 'Paid via {method}' },
  memo: { ko: '메모', zh: '备注', en: 'Memo' },
  customerMemo: { ko: '고객 요청사항', zh: '客户备注', en: 'Customer Note' },
  shopMemo: { ko: '매장 메모', zh: '店铺备注', en: 'Shop Note' },
  markComplete: { ko: '시술 완료', zh: '服务完成', en: 'Mark Complete' },
  markNoshow: { ko: '노쇼 처리', zh: '标记未到店', en: 'Mark No-show' },
  noshowConfirm: { ko: '노쇼로 처리하시겠습니까?\n보증금은 환불되지 않습니다.', zh: '确定标记为未到店吗？\n定金将不予退还。', en: "Mark as no-show?\nThe deposit won't be refunded." },

  // ─── 관리자: 고객 ───
  searchCustomer: { ko: '고객 검색', zh: '搜索客户', en: 'Search customers' },
  visits: { ko: '방문', zh: '到店', en: 'Visits' },
  totalSpent: { ko: '총 매출', zh: '总消费', en: 'Total Spent' },
  noshowHistory: { ko: '노쇼', zh: '未到店', en: 'No-shows' },
  blocked: { ko: '차단됨', zh: '已拉黑', en: 'Blocked' },
  unblock: { ko: '차단 해제', zh: '解除拉黑', en: 'Unblock' },
  block: { ko: '차단', zh: '拉黑', en: 'Block' },
  addMemo: { ko: '메모 추가', zh: '添加备注', en: 'Add memo' },

  // ─── 관리자: 정산 ───
  settlementPeriod: { ko: '정산 기간', zh: '结算周期', en: 'Settlement Period' },
  totalRevenue: { ko: '총 매출', zh: '总营收', en: 'Total Revenue' },
  depositsCollected: { ko: '보증금 수금', zh: '已收定金', en: 'Deposits Collected' },
  nearCommission: { ko: 'NEAR 수수료 (10%)', zh: 'NEAR 佣金 (10%)', en: 'NEAR Commission (10%)' },
  payout: { ko: '정산 금액', zh: '结算金额', en: 'Payout' },
  payoutSchedule: { ko: '정산일: 매월 15일/25일', zh: '结算日：每月15日/25日', en: 'Payout: 15th/25th monthly' },
  statusPending: { ko: '정산 대기', zh: '待结算', en: 'Pending' },
  statusCompleted: { ko: '정산 완료', zh: '已结算', en: 'Completed' },

  // ─── 관리자: 캘린더 ───
  dayView: { ko: '일간', zh: '日视图', en: 'Day' },
  weekView: { ko: '주간', zh: '周视图', en: 'Week' },
  today: { ko: '오늘', zh: '今天', en: 'Today' },

  // ─── 리뷰 ───
  reviews: { ko: '리뷰', zh: '评价', en: 'Reviews' },
  writeReview: { ko: '리뷰 작성', zh: '写评价', en: 'Write Review' },
  overallRating: { ko: '전체 평점', zh: '总评分', en: 'Overall Rating' },
  detailedRating: { ko: '세부 평점', zh: '详细评分', en: 'Detailed Rating' },
  reviewContent: { ko: '리뷰 내용', zh: '评价内容', en: 'Review Content' },
  reviewPlaceholder: { ko: '서비스에 대한 후기를 남겨주세요', zh: '请写下您对服务的评价', en: 'Share your experience about the service' },
  submitReview: { ko: '리뷰 등록', zh: '提交评价', en: 'Submit Review' },
  reviewSubmitted: { ko: '리뷰가 등록되었습니다', zh: '评价已提交', en: 'Review submitted' },
  verifiedVisit: { ko: '방문 인증', zh: '已验证到店', en: 'Verified Visit' },
  ownerReply: { ko: '업주 답글', zh: '店主回复', en: 'Owner Reply' },
  noReviews: { ko: '아직 리뷰가 없습니다', zh: '暂无评价', en: 'No reviews yet' },
  allReviews: { ko: '전체 리뷰', zh: '所有评价', en: 'All Reviews' },
  photoReviews: { ko: '사진 리뷰', zh: '带图评价', en: 'Photo Reviews' },
  ratingLabel: { ko: '점', zh: '分', en: 'pts' },
  reviewCount: { ko: '개 리뷰', zh: '条评价', en: ' reviews' },
  sortLatest: { ko: '최신순', zh: '最新', en: 'Latest' },
  sortHighest: { ko: '높은순', zh: '评分最高', en: 'Highest' },
  sortLowest: { ko: '낮은순', zh: '评分最低', en: 'Lowest' },

  // ─── 리뷰 세부 평가 ───
  rateSkill: { ko: '기술', zh: '技术', en: 'Skill' },
  rateService: { ko: '서비스', zh: '服务态度', en: 'Service' },
  rateAmbiance: { ko: '분위기', zh: '环境氛围', en: 'Ambiance' },
  rateCleanliness: { ko: '청결', zh: '卫生清洁', en: 'Cleanliness' },
  rateValue: { ko: '가성비', zh: '性价比', en: 'Value' },

  // ─── 쿠폰/포인트 ───
  coupons: { ko: '쿠폰', zh: '优惠券', en: 'Coupons' },
  myCoupons: { ko: '내 쿠폰', zh: '我的优惠券', en: 'My Coupons' },
  availableCoupons: { ko: '사용 가능', zh: '可用', en: 'Available' },
  usedCoupons: { ko: '사용 완료', zh: '已使用', en: 'Used' },
  expiredCoupons: { ko: '만료', zh: '已过期', en: 'Expired' },
  applyCoupon: { ko: '쿠폰 적용', zh: '使用优惠券', en: 'Apply Coupon' },
  couponApplied: { ko: '적용됨', zh: '已使用', en: 'Applied' },
  discount: { ko: '할인', zh: '优惠', en: 'Discount' },
  validUntil: { ko: '유효기간', zh: '有效期至', en: 'Valid until' },
  minOrder: { ko: '최소 주문 금액', zh: '最低消费', en: 'Min. order' },
  points: { ko: '포인트', zh: '积分', en: 'Points' },
  myPoints: { ko: '내 포인트', zh: '我的积分', en: 'My Points' },
  pointsEarned: { ko: '적립', zh: '获得', en: 'Earned' },
  pointsUsed: { ko: '사용', zh: '使用', en: 'Used' },
  usePoints: { ko: '포인트 사용', zh: '使用积分', en: 'Use Points' },

  // ─── 채팅 ───
  chat: { ko: '채팅', zh: '聊天', en: 'Chat' },
  chatWithShop: { ko: '매장에 문의', zh: '联系店铺', en: 'Chat with Shop' },
  typeMessage: { ko: '메시지 입력', zh: '输入消息', en: 'Type a message' },
  send: { ko: '전송', zh: '发送', en: 'Send' },
  noChatHistory: { ko: '대화 내역이 없습니다', zh: '暂无聊天记录', en: 'No chat history' },

  // ─── 알림 ───
  notifications: { ko: '알림', zh: '通知', en: 'Notifications' },
  noNotifications: { ko: '알림이 없습니다', zh: '暂无通知', en: 'No notifications' },
  markAllRead: { ko: '모두 읽음', zh: '全部已读', en: 'Mark all read' },

  // ─── 예약 변경 ───
  modifyReservation: { ko: '예약 변경', zh: '变更预约', en: 'Modify Booking' },
  modifyConfirm: { ko: '예약을 변경하시겠습니까?', zh: '确定要变更预约吗？', en: 'Modify this booking?' },
  modificationNotAllowed: { ko: '변경 가능 시간이 지났습니다', zh: '已超过可变更时间', en: 'Modification deadline passed' },

  // ─── 워크인 ───
  walkin: { ko: '워크인', zh: '现场预约', en: 'Walk-in' },
  registerWalkin: { ko: '워크인 등록', zh: '登记现场客人', en: 'Register Walk-in' },
}
