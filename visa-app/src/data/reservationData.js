// NEAR 예약 시스템 — 목업 데이터 & 상수 (네이버 예약 수준 확장)

// ─── 예약 상태 ───
export const RESERVATION_STATUS = {
  PENDING: 'pending',       // 대기
  CONFIRMED: 'confirmed',   // 확정
  COMPLETED: 'completed',   // 완료
  CANCELLED: 'cancelled',   // 취소
  NOSHOW: 'noshow',         // 노쇼
}

export const STATUS_CONFIG = {
  pending:   { color: '#EAB308', bg: '#FEF9C3', label: { ko: '대기', zh: '待确认', en: 'Pending' } },
  confirmed: { color: '#22C55E', bg: '#DCFCE7', label: { ko: '확정', zh: '已确认', en: 'Confirmed' } },
  completed: { color: '#6B7280', bg: '#F3F4F6', label: { ko: '완료', zh: '已完成', en: 'Completed' } },
  cancelled: { color: '#EF4444', bg: '#FEE2E2', label: { ko: '취소', zh: '已取消', en: 'Cancelled' } },
  noshow:    { color: '#991B1B', bg: '#FECACA', label: { ko: '노쇼', zh: '未到店', en: 'No-show' } },
}

// ─── 결제 수단 ───
export const PAYMENT_METHODS = [
  { id: 'alipay',  label: { ko: '알리페이', zh: '支付宝', en: 'Alipay' }, icon: '🅰️', recommended: true },
  { id: 'wechat',  label: { ko: '위챗페이', zh: '微信支付', en: 'WeChat Pay' }, icon: '💚' },
  { id: 'card',    label: { ko: '신용카드', zh: '信用卡', en: 'Credit Card' }, icon: '💳' },
]

// ─── 서비스 카테고리 ───
export const SERVICE_CATEGORIES = [
  { id: 'hair',     icon: '💇', label: { ko: '헤어', zh: '美发', en: 'Hair' } },
  { id: 'nail',     icon: '💅', label: { ko: '네일', zh: '美甲', en: 'Nail' } },
  { id: 'skin',     icon: '✨', label: { ko: '피부', zh: '皮肤管理', en: 'Skin Care' } },
  { id: 'makeup',   icon: '💄', label: { ko: '메이크업', zh: '化妆', en: 'Makeup' } },
  { id: 'massage',  icon: '💆', label: { ko: '마사지', zh: '按摩', en: 'Massage' } },
  { id: 'photo',    icon: '📸', label: { ko: '사진', zh: '写真', en: 'Photo' } },
  { id: 'restaurant', icon: '🍽️', label: { ko: '식당', zh: '餐厅', en: 'Restaurant' } },
  { id: 'activity', icon: '🎯', label: { ko: '액티비티', zh: '体验活动', en: 'Activity' } },
]

// ─── 성별 타겟 ───
export const GENDER_TYPES = {
  ALL: 'all',
  FEMALE: 'female',
  MALE: 'male',
}

// ─── 고객 세그먼트 ───
export const CUSTOMER_SEGMENTS = {
  NEW: 'new',           // 신규
  REGULAR: 'regular',   // 일반
  VIP: 'vip',           // VIP (5회 이상 또는 50만원 이상)
  DORMANT: 'dormant',   // 휴면 (90일 미방문)
}

export const SEGMENT_CONFIG = {
  new:     { color: '#3B82F6', bg: '#DBEAFE', label: { ko: '신규', zh: '新客', en: 'New' } },
  regular: { color: '#6B7280', bg: '#F3F4F6', label: { ko: '일반', zh: '普通', en: 'Regular' } },
  vip:     { color: '#F59E0B', bg: '#FEF3C7', label: { ko: 'VIP', zh: 'VIP', en: 'VIP' } },
  dormant: { color: '#9CA3AF', bg: '#F9FAFB', label: { ko: '휴면', zh: '休眠', en: 'Dormant' } },
}

// ─── 리뷰 평가 항목 ───
export const REVIEW_CRITERIA = [
  { id: 'skill',       label: { ko: '기술', zh: '技术', en: 'Skill' } },
  { id: 'service',     label: { ko: '서비스', zh: '服务态度', en: 'Service' } },
  { id: 'ambiance',    label: { ko: '분위기', zh: '环境氛围', en: 'Ambiance' } },
  { id: 'cleanliness', label: { ko: '청결', zh: '卫生清洁', en: 'Cleanliness' } },
  { id: 'value',       label: { ko: '가성비', zh: '性价比', en: 'Value' } },
]

// ─── 목업 매장 (네이버 예약 수준 필드) ───
export const MOCK_SHOPS = [
  {
    id: 'shop-001',
    name: { ko: '청담 뷰티살롱', zh: '清潭美容沙龙', en: 'Cheongdam Beauty Salon' },
    category: 'hair',
    subcategory: 'salon',
    address: { ko: '서울 강남구 청담동 123-4', zh: '首尔 江南区 清潭洞 123-4', en: '123-4 Cheongdam-dong, Gangnam-gu, Seoul' },
    lat: 37.5200, lng: 127.0388,
    phone: '02-1234-5678',
    description: {
      ko: '청담동 프리미엄 뷰티살롱. 외국인 고객 전문.',
      zh: '清潭洞高端美容沙龙，专注服务外国客人。',
      en: 'Premium beauty salon in Cheongdam, specializing in foreign guests.',
    },
    rating: 4.8,
    reviewCount: 342,
    image: null,
    photos: [],
    operatingHours: { open: '10:00', close: '21:00' },
    breakTime: { start: '14:00', end: '15:00' },
    closedDays: [0], // 일요일
    // 예약 설정
    slotIntervalMin: 30,        // 예약 슬롯 간격
    maxConcurrentBookings: 3,   // 동시 예약 가능 수
    maxAdvanceDays: 30,         // 최대 예약 가능 일수
    autoConfirm: false,         // 자동 승인 여부
    allowModification: true,    // 예약 변경 허용
    modificationDeadlineHours: 24, // 변경 마감 시간
    // 중국인 관련
    chineseStaffAvailable: true,
    languagesSupported: ['ko', 'zh', 'en'],
    alipayAccepted: true,
    wechatPayAccepted: true,
    // 매장 정보
    parkingAvailable: true,
    wifiAvailable: true,
    depositRate: 0.30,
    isVerified: true,
    isPremium: true,
    createdAt: '2025-06-01T00:00:00Z',
  },
  {
    id: 'shop-002',
    name: { ko: '홍대 네일아트', zh: '弘大美甲艺术', en: 'Hongdae Nail Art' },
    category: 'nail',
    subcategory: 'nail_art',
    address: { ko: '서울 마포구 홍대입구 45-2', zh: '首尔 麻浦区 弘大入口 45-2', en: '45-2 Hongdae, Mapo-gu, Seoul' },
    lat: 37.5563, lng: 126.9237,
    phone: '02-9876-5432',
    description: {
      ko: '홍대 트렌디 네일아트. SNS 인기 네일숍.',
      zh: '弘大潮流美甲艺术，SNS人气美甲店。',
      en: 'Trendy nail art in Hongdae. Popular on social media.',
    },
    rating: 4.6,
    reviewCount: 189,
    image: null,
    photos: [],
    operatingHours: { open: '11:00', close: '20:00' },
    breakTime: null,
    closedDays: [1], // 월요일
    slotIntervalMin: 30,
    maxConcurrentBookings: 2,
    maxAdvanceDays: 14,
    autoConfirm: true,
    allowModification: true,
    modificationDeadlineHours: 12,
    chineseStaffAvailable: false,
    languagesSupported: ['ko', 'en'],
    alipayAccepted: true,
    wechatPayAccepted: false,
    parkingAvailable: false,
    wifiAvailable: true,
    depositRate: 0.30,
    isVerified: true,
    isPremium: false,
    createdAt: '2025-08-15T00:00:00Z',
  },
]

// ─── 목업 서비스 (가격범위 + 성별 + 스타일리스트별 가격) ───
export const MOCK_SERVICES = [
  // 헤어 (shop-001)
  {
    id: 'svc-001', shopId: 'shop-001', category: 'hair',
    name: { ko: '커트', zh: '剪发', en: 'Haircut' },
    description: { ko: '스타일 상담 포함', zh: '含造型咨询', en: 'Includes style consultation' },
    duration: 60,
    priceKrw: 35000, priceCny: 185,
    priceRange: null, // null이면 고정가
    gender: 'all',
    popular: true,
    sortOrder: 1,
    // 스타일리스트별 차등가격
    stylistPricing: {
      'sty-001': { priceKrw: 45000, priceCny: 240 }, // 원장 민지
      'sty-002': { priceKrw: 35000, priceCny: 185 }, // 디자이너 수진
    },
  },
  {
    id: 'svc-002', shopId: 'shop-001', category: 'hair',
    name: { ko: '염색', zh: '染发', en: 'Hair Coloring' },
    description: { ko: '약제 포함, 길이별 추가요금', zh: '含药剂，按发长加价', en: 'Includes chemicals, extra charge by length' },
    duration: 120,
    priceKrw: 80000, priceCny: 420,
    priceRange: { minKrw: 80000, maxKrw: 150000, minCny: 420, maxCny: 790 }, // 가격 범위
    gender: 'all',
    popular: true,
    sortOrder: 2,
    stylistPricing: {
      'sty-001': { priceKrw: 100000, priceCny: 530 },
      'sty-002': { priceKrw: 80000, priceCny: 420 },
    },
  },
  {
    id: 'svc-003', shopId: 'shop-001', category: 'hair',
    name: { ko: '펌', zh: '烫发', en: 'Perm' },
    description: { ko: '디지털펌/셋팅펌/볼륨펌', zh: '数码烫/定型烫/蓬松烫', en: 'Digital/Setting/Volume perm' },
    duration: 150,
    priceKrw: 100000, priceCny: 530,
    priceRange: { minKrw: 100000, maxKrw: 200000, minCny: 530, maxCny: 1060 },
    gender: 'all',
    popular: false,
    sortOrder: 3,
    stylistPricing: {
      'sty-001': { priceKrw: 150000, priceCny: 790 },
      'sty-002': { priceKrw: 100000, priceCny: 530 },
    },
  },
  {
    id: 'svc-004', shopId: 'shop-001', category: 'hair',
    name: { ko: '두피케어', zh: '头皮护理', en: 'Scalp Care' },
    description: { ko: '두피 스케일링 + 영양 트리트먼트', zh: '头皮去角质+营养护理', en: 'Scalp scaling + nutrition treatment' },
    duration: 45,
    priceKrw: 50000, priceCny: 265,
    priceRange: null,
    gender: 'all',
    popular: false,
    sortOrder: 5,
    stylistPricing: null, // 모든 스타일리스트 동일가
  },
  {
    id: 'svc-005', shopId: 'shop-001', category: 'hair',
    name: { ko: '커트 + 염색', zh: '剪发+染发', en: 'Cut + Color' },
    description: { ko: '세트 할인', zh: '套餐优惠', en: 'Set discount' },
    duration: 150,
    priceKrw: 100000, priceCny: 530,
    priceRange: { minKrw: 100000, maxKrw: 180000, minCny: 530, maxCny: 950 },
    gender: 'all',
    popular: true,
    sortOrder: 4,
    stylistPricing: {
      'sty-001': { priceKrw: 130000, priceCny: 690 },
      'sty-002': { priceKrw: 100000, priceCny: 530 },
    },
  },
  {
    id: 'svc-010', shopId: 'shop-001', category: 'hair',
    name: { ko: '남성 커트', zh: '男士理发', en: "Men's Cut" },
    description: { ko: '남성 전용 커트', zh: '男士专享剪发', en: "Men's exclusive haircut" },
    duration: 40,
    priceKrw: 25000, priceCny: 132,
    priceRange: null,
    gender: 'male',
    popular: false,
    sortOrder: 6,
    stylistPricing: null,
  },

  // 네일 (shop-002)
  {
    id: 'svc-006', shopId: 'shop-002', category: 'nail',
    name: { ko: '젤 네일', zh: '甲油胶美甲', en: 'Gel Nail' },
    description: { ko: '원컬러 젤 네일', zh: '纯色甲油胶美甲', en: 'Single color gel nail' },
    duration: 60,
    priceKrw: 40000, priceCny: 210,
    priceRange: null,
    gender: 'female',
    popular: true,
    sortOrder: 1,
    stylistPricing: null,
  },
  {
    id: 'svc-007', shopId: 'shop-002', category: 'nail',
    name: { ko: '네일 아트', zh: '美甲彩绘', en: 'Nail Art' },
    description: { ko: '디자인 아트 (10본)', zh: '设计彩绘(10指)', en: 'Design art (10 nails)' },
    duration: 90,
    priceKrw: 60000, priceCny: 315,
    priceRange: { minKrw: 60000, maxKrw: 120000, minCny: 315, maxCny: 630 },
    gender: 'female',
    popular: true,
    sortOrder: 2,
    stylistPricing: null,
  },
  {
    id: 'svc-008', shopId: 'shop-002', category: 'nail',
    name: { ko: '패디큐어', zh: '足部护理', en: 'Pedicure' },
    description: { ko: '발 관리 + 젤 도포', zh: '足部护理+甲油胶', en: 'Foot care + gel application' },
    duration: 60,
    priceKrw: 35000, priceCny: 185,
    priceRange: null,
    gender: 'all',
    popular: false,
    sortOrder: 3,
    stylistPricing: null,
  },
  {
    id: 'svc-009', shopId: 'shop-002', category: 'nail',
    name: { ko: '젤 제거', zh: '卸甲', en: 'Gel Removal' },
    description: { ko: '기존 젤 제거', zh: '去除旧甲油胶', en: 'Remove existing gel' },
    duration: 30,
    priceKrw: 15000, priceCny: 80,
    priceRange: null,
    gender: 'all',
    popular: false,
    sortOrder: 4,
    stylistPricing: null,
  },
]

// ─── 목업 스타일리스트 (확장) ───
export const MOCK_STYLISTS = [
  {
    id: 'sty-001', shopId: 'shop-001',
    name: '민지',
    nameEn: 'Minji',
    color: '#EC4899',
    role: { ko: '원장', zh: '院长', en: 'Director' },
    experience: 12,
    specialties: { ko: ['발레아쥬', '에어터치'], zh: ['巴黎画染', '空气触染'], en: ['Balayage', 'Air Touch'] },
    bio: { ko: '청담동 12년 경력. 외국인 고객 전문.', zh: '清潭洞12年经验，专注外国客人。', en: '12 years in Cheongdam. Foreign client specialist.' },
    certifications: ['한국미용사 1급', 'L\'Oréal Color Specialist'],
    awards: ['2025 서울 뷰티어워드 수상'],
    portfolioPhotos: [],
    services: ['svc-001','svc-002','svc-003','svc-004','svc-005','svc-010'],
    workingDays: [1,2,3,4,5,6], // 월~토
    isActive: true,
  },
  {
    id: 'sty-002', shopId: 'shop-001',
    name: '수진',
    nameEn: 'Sujin',
    color: '#8B5CF6',
    role: { ko: '디자이너', zh: '设计师', en: 'Designer' },
    experience: 5,
    specialties: { ko: ['레이어드컷', '내추럴펌'], zh: ['层次剪裁', '自然烫'], en: ['Layered Cut', 'Natural Perm'] },
    bio: { ko: '자연스러운 스타일 전문.', zh: '自然风格专家。', en: 'Natural style specialist.' },
    certifications: ['한국미용사 2급'],
    awards: [],
    portfolioPhotos: [],
    services: ['svc-001','svc-002','svc-005','svc-010'],
    workingDays: [1,2,3,4,5], // 월~금
    isActive: true,
  },
  {
    id: 'sty-003', shopId: 'shop-002',
    name: '유나',
    nameEn: 'Yuna',
    color: '#06B6D4',
    role: { ko: '네일 아티스트', zh: '美甲师', en: 'Nail Artist' },
    experience: 7,
    specialties: { ko: ['글리터아트', '캐릭터아트'], zh: ['闪粉艺术', '卡通艺术'], en: ['Glitter Art', 'Character Art'] },
    bio: { ko: 'SNS 인기 네일 아티스트.', zh: 'SNS人气美甲师。', en: 'Popular nail artist on social media.' },
    certifications: ['네일미용사'],
    awards: ['2025 네일엑스포 금상'],
    portfolioPhotos: [],
    services: ['svc-006','svc-007','svc-008','svc-009'],
    workingDays: [2,3,4,5,6,0], // 화~일
    isActive: true,
  },
]

// ─── 목업 리뷰 데이터 ───
export const MOCK_REVIEWS = [
  {
    id: 'rev-001',
    shopId: 'shop-001',
    reservationId: 'res-001',
    customerId: 'cust-001',
    customerName: '王小明',
    stylistId: 'sty-001',
    overallRating: 5,
    subRatings: { skill: 5, service: 5, ambiance: 5, cleanliness: 5, value: 4 },
    content: '民智老师的染发技术太棒了！颜色非常自然，整个过程也很舒适。强烈推荐！',
    photos: [],
    isVerified: true, // 실제 방문 후 작성
    ownerReply: '谢谢您的好评！期待下次再见 😊',
    ownerReplyAt: '2026-03-17T10:00:00Z',
    createdAt: '2026-03-17T09:00:00Z',
  },
  {
    id: 'rev-002',
    shopId: 'shop-002',
    reservationId: 'res-003',
    customerId: 'cust-003',
    stylistId: 'sty-003',
    overallRating: 4,
    subRatings: { skill: 5, service: 4, ambiance: 4, cleanliness: 4, value: 3 },
    content: '유나老师做的春天花朵图案很漂亮！但价格稍微有点贵。',
    photos: [],
    isVerified: true,
    ownerReply: null,
    ownerReplyAt: null,
    createdAt: '2026-03-18T16:00:00Z',
  },
]

// ─── 목업 쿠폰 정의 ───
export const MOCK_COUPON_DEFINITIONS = [
  {
    id: 'cpn-def-001',
    shopId: 'shop-001',
    name: { ko: '첫 방문 10% 할인', zh: '首次到店9折', en: '10% off first visit' },
    type: 'percentage', // percentage | fixed
    value: 10,
    minOrderAmount: 50000, // 최소 주문 금액 (KRW)
    maxDiscountKrw: 30000,
    validDays: 30,
    applicableServices: [], // 빈배열 = 전체
    targetSegment: 'new',
    isActive: true,
    totalIssued: 100,
    totalUsed: 23,
    createdAt: '2026-03-01T00:00:00Z',
  },
  {
    id: 'cpn-def-002',
    shopId: 'shop-001',
    name: { ko: 'VIP 재방문 ₩5,000 할인', zh: 'VIP回访减￥26', en: 'VIP revisit ₩5,000 off' },
    type: 'fixed',
    value: 5000,
    minOrderAmount: 30000,
    maxDiscountKrw: 5000,
    validDays: 60,
    applicableServices: [],
    targetSegment: 'vip',
    isActive: true,
    totalIssued: 50,
    totalUsed: 12,
    createdAt: '2026-03-01T00:00:00Z',
  },
]

// ─── 목업 발급 쿠폰 ───
export const MOCK_COUPONS_ISSUED = [
  {
    id: 'cpn-001',
    definitionId: 'cpn-def-001',
    customerId: 'cust-002',
    shopId: 'shop-001',
    status: 'active', // active | used | expired
    issuedAt: '2026-03-15T09:00:00Z',
    expiresAt: '2026-04-14T23:59:59Z',
    usedAt: null,
    usedReservationId: null,
  },
]

// ─── 목업 포인트 거래 ───
export const MOCK_POINT_TRANSACTIONS = [
  {
    id: 'pt-001',
    customerId: 'cust-001',
    shopId: 'shop-001',
    type: 'earn', // earn | use | expire
    amount: 530,  // 결제금액 1% 적립
    balance: 530,
    description: { ko: '예약 완료 적립', zh: '预约完成积分', en: 'Booking completion reward' },
    reservationId: 'res-001',
    createdAt: '2026-03-17T18:00:00Z',
  },
  {
    id: 'pt-002',
    customerId: 'cust-003',
    shopId: 'shop-002',
    type: 'earn',
    amount: 525,
    balance: 1200,
    description: { ko: '예약 완료 적립', zh: '预约完成积分', en: 'Booking completion reward' },
    reservationId: 'res-003',
    createdAt: '2026-03-18T18:00:00Z',
  },
]

// ─── 목업 채팅 ───
export const MOCK_CHAT_ROOMS = [
  {
    id: 'chat-001',
    shopId: 'shop-001',
    customerId: 'cust-001',
    reservationId: 'res-001',
    lastMessage: '好的，明天下午2点见！',
    lastMessageAt: '2026-03-16T15:30:00Z',
    unreadShop: 0,
    unreadCustomer: 0,
  },
]

export const MOCK_CHAT_MESSAGES = [
  {
    id: 'msg-001', roomId: 'chat-001',
    sender: 'customer', senderId: 'cust-001',
    content: '你好，想确认一下明天的预约，可以稍微提前到吗？',
    createdAt: '2026-03-16T15:00:00Z',
    readAt: '2026-03-16T15:10:00Z',
  },
  {
    id: 'msg-002', roomId: 'chat-001',
    sender: 'shop', senderId: 'shop-001',
    content: '可以的！提前15分钟到就好。',
    createdAt: '2026-03-16T15:15:00Z',
    readAt: '2026-03-16T15:20:00Z',
  },
  {
    id: 'msg-003', roomId: 'chat-001',
    sender: 'customer', senderId: 'cust-001',
    content: '好的，明天下午2点见！',
    createdAt: '2026-03-16T15:30:00Z',
    readAt: '2026-03-16T15:35:00Z',
  },
]

// ─── 목업 알림 ───
export const MOCK_NOTIFICATIONS = [
  {
    id: 'notif-001',
    recipientType: 'customer',
    recipientId: 'cust-001',
    type: 'reservation_confirmed',
    title: { ko: '예약 확정', zh: '预约已确认', en: 'Booking Confirmed' },
    body: { ko: '3/17 14:00 청담 뷰티살롱 예약이 확정되었습니다.', zh: '3/17 14:00 清潭美容沙龙的预约已确认。', en: 'Your booking at Cheongdam Beauty Salon on 3/17 14:00 is confirmed.' },
    isRead: true,
    reservationId: 'res-001',
    createdAt: '2026-03-16T11:00:00Z',
  },
  {
    id: 'notif-002',
    recipientType: 'customer',
    recipientId: 'cust-001',
    type: 'reservation_reminder',
    title: { ko: '예약 알림 (내일)', zh: '预约提醒（明天）', en: 'Booking Reminder (Tomorrow)' },
    body: { ko: '내일 14:00 청담 뷰티살롱 예약이 있습니다.', zh: '明天14:00有清潭美容沙龙的预约。', en: 'You have a booking at Cheongdam Beauty Salon tomorrow at 14:00.' },
    isRead: false,
    reservationId: 'res-001',
    createdAt: '2026-03-16T18:00:00Z',
  },
  {
    id: 'notif-003',
    recipientType: 'shop',
    recipientId: 'shop-001',
    type: 'new_reservation',
    title: { ko: '새 예약 도착', zh: '新预约', en: 'New Booking' },
    body: { ko: '李美华님이 3/17 10:30 커트를 예약했습니다.', zh: '李美华预约了3/17 10:30的剪发。', en: 'Li Meihua booked a Haircut on 3/17 at 10:30.' },
    isRead: false,
    reservationId: 'res-002',
    createdAt: '2026-03-15T09:00:00Z',
  },
]

// ─── 매장 소식 ───
export const MOCK_SHOP_NEWS = [
  {
    id: 'news-001',
    shopId: 'shop-001',
    type: 'promotion', // promotion | notice | portfolio
    title: { ko: '봄 맞이 염색 20% 할인', zh: '春季染发8折优惠', en: 'Spring Hair Coloring 20% Off' },
    content: { ko: '3월 한 달간 모든 염색 서비스 20% 할인!', zh: '3月期间所有染发服务8折！', en: '20% off all coloring services in March!' },
    image: null,
    validFrom: '2026-03-01',
    validTo: '2026-03-31',
    isActive: true,
    createdAt: '2026-03-01T00:00:00Z',
  },
]

// ─── 기본 환불 정책 ───
export const DEFAULT_REFUND_POLICY = {
  depositRate: 0.30,
  noshowRefundRate: 0.00,
  cancellationTiers: [
    { hoursBefore: 72, refundRate: 1.0,  label: { ko: '72시간 전', zh: '72小时前', en: '72h before' } },
    { hoursBefore: 24, refundRate: 0.5,  label: { ko: '24시간 전', zh: '24小时前', en: '24h before' } },
    { hoursBefore: 0,  refundRate: 0.0,  label: { ko: '당일', zh: '当天', en: 'Same day' } },
  ],
  noshowEscalation: [
    { noshowCount: 2, depositRate: 0.50, label: { ko: '보증금 50% 상향', zh: '定金提高至50%', en: 'Deposit raised to 50%' } },
    { noshowCount: 3, action: 'block',   label: { ko: '예약 차단', zh: '禁止预约', en: 'Booking blocked' } },
  ],
}

// ─── 목업 예약 데이터 (확장) ───
export const MOCK_RESERVATIONS = [
  {
    id: 'res-001',
    reservationNo: 'N-0317-001',
    shopId: 'shop-001',
    customerId: 'cust-001',
    stylistId: 'sty-001',
    services: [
      { serviceId: 'svc-005', name: { ko: '커트 + 염색', zh: '剪发+染发', en: 'Cut + Color' }, duration: 150, priceKrw: 130000, priceCny: 690 },
    ],
    totalPriceKrw: 130000,
    totalPriceCny: 690,
    totalDuration: 150,
    date: '2026-03-17',
    time: '14:00',
    depositCny: 207,
    depositKrw: 39000,
    depositRate: 0.30,
    paymentMethod: 'alipay',
    paymentId: 'PL-20260317-001',
    depositPaidAt: '2026-03-16T10:30:00Z',
    status: 'confirmed',
    bookingType: 'online', // online | walkin | phone
    customerLang: 'ZH',
    customerNote: '想要自然一点的颜色',
    shopNote: '',
    couponId: null,
    pointsUsed: 0,
    modifiedAt: null,
    modifiedFrom: null, // 변경 전 원본 (date/time)
    createdAt: '2026-03-16T10:30:00Z',
    confirmedAt: '2026-03-16T11:00:00Z',
  },
  {
    id: 'res-002',
    reservationNo: 'N-0317-002',
    shopId: 'shop-001',
    customerId: 'cust-002',
    stylistId: 'sty-002',
    services: [
      { serviceId: 'svc-001', name: { ko: '커트', zh: '剪发', en: 'Haircut' }, duration: 60, priceKrw: 35000, priceCny: 185 },
    ],
    totalPriceKrw: 35000,
    totalPriceCny: 185,
    totalDuration: 60,
    date: '2026-03-17',
    time: '10:30',
    depositCny: 56,
    depositKrw: 10500,
    depositRate: 0.30,
    paymentMethod: 'alipay',
    paymentId: 'PL-20260317-002',
    depositPaidAt: '2026-03-15T09:00:00Z',
    status: 'pending',
    bookingType: 'online',
    customerLang: 'ZH',
    customerNote: '',
    shopNote: '',
    couponId: null,
    pointsUsed: 0,
    modifiedAt: null,
    modifiedFrom: null,
    createdAt: '2026-03-15T09:00:00Z',
  },
  {
    id: 'res-003',
    reservationNo: 'N-0317-003',
    shopId: 'shop-002',
    customerId: 'cust-003',
    stylistId: 'sty-003',
    services: [
      { serviceId: 'svc-006', name: { ko: '젤 네일', zh: '甲油胶美甲', en: 'Gel Nail' }, duration: 60, priceKrw: 40000, priceCny: 210 },
      { serviceId: 'svc-007', name: { ko: '네일 아트', zh: '美甲彩绘', en: 'Nail Art' }, duration: 90, priceKrw: 60000, priceCny: 315 },
    ],
    totalPriceKrw: 100000,
    totalPriceCny: 525,
    totalDuration: 150,
    date: '2026-03-18',
    time: '13:00',
    depositCny: 158,
    depositKrw: 30000,
    depositRate: 0.30,
    paymentMethod: 'wechat',
    paymentId: 'PL-20260317-003',
    depositPaidAt: '2026-03-16T14:00:00Z',
    status: 'confirmed',
    bookingType: 'online',
    customerLang: 'ZH',
    customerNote: '要做春天花朵的图案',
    shopNote: '',
    couponId: null,
    pointsUsed: 0,
    modifiedAt: null,
    modifiedFrom: null,
    createdAt: '2026-03-16T14:00:00Z',
    confirmedAt: '2026-03-16T15:00:00Z',
  },
]

// ─── 목업 고객 데이터 (세그먼트 + 포인트) ───
export const MOCK_CUSTOMERS = [
  {
    id: 'cust-001',
    name: '王小明',
    nameEn: 'Wang Xiaoming',
    phone: '+86-138-1234-5678',
    email: 'wang@example.com',
    lang: 'ZH',
    countryCode: 'CN',
    passportVerified: true,
    totalVisits: 3,
    totalSpentKrw: 280000,
    noshowCount: 0,
    isBlocked: false,
    memo: '',
    segment: 'regular',
    points: 530,
    lastVisitAt: '2026-03-17T18:00:00Z',
    createdAt: '2026-01-15T08:00:00Z',
  },
  {
    id: 'cust-002',
    name: '李美华',
    nameEn: 'Li Meihua',
    phone: '+86-139-8765-4321',
    email: 'li.mh@example.com',
    lang: 'ZH',
    countryCode: 'CN',
    passportVerified: false,
    totalVisits: 0,
    totalSpentKrw: 0,
    noshowCount: 0,
    isBlocked: false,
    memo: '',
    segment: 'new',
    points: 0,
    lastVisitAt: null,
    createdAt: '2026-03-15T09:00:00Z',
  },
  {
    id: 'cust-003',
    name: '张丽',
    nameEn: 'Zhang Li',
    phone: '+86-136-5555-8888',
    email: 'zhangli@example.com',
    lang: 'ZH',
    countryCode: 'CN',
    passportVerified: true,
    totalVisits: 5,
    totalSpentKrw: 450000,
    noshowCount: 1,
    isBlocked: false,
    memo: '甲油过敏史',
    segment: 'vip',
    points: 1200,
    lastVisitAt: '2026-03-18T18:00:00Z',
    createdAt: '2025-12-01T10:00:00Z',
  },
]

// ─── 목업 정산 데이터 (확장) ───
export const MOCK_SETTLEMENTS = [
  {
    id: 'stl-001',
    shopId: 'shop-001',
    periodStart: '2026-03-01',
    periodEnd: '2026-03-15',
    totalBookings: 45,
    completedBookings: 38,
    cancelledBookings: 5,
    noshowBookings: 2,
    totalRevenueKrw: 3200000,
    totalDepositsCny: 5040,
    commissionKrw: 320000,
    commissionRate: 0.10,
    payoutKrw: 2880000,
    status: 'completed',
    payoutDate: '2026-03-15',
    // 스타일리스트별 매출
    stylistBreakdown: [
      { stylistId: 'sty-001', bookings: 25, revenueKrw: 2000000 },
      { stylistId: 'sty-002', bookings: 20, revenueKrw: 1200000 },
    ],
    // 서비스별 매출
    serviceBreakdown: [
      { serviceId: 'svc-005', count: 18, revenueKrw: 1800000 },
      { serviceId: 'svc-001', count: 15, revenueKrw: 525000 },
      { serviceId: 'svc-002', count: 12, revenueKrw: 960000 },
    ],
    // 시간대별 매출
    hourlyBreakdown: [
      { hour: 10, bookings: 8 }, { hour: 11, bookings: 10 },
      { hour: 13, bookings: 7 }, { hour: 15, bookings: 12 },
      { hour: 16, bookings: 5 }, { hour: 17, bookings: 3 },
    ],
  },
  {
    id: 'stl-002',
    shopId: 'shop-001',
    periodStart: '2026-03-16',
    periodEnd: '2026-03-25',
    totalBookings: 12,
    completedBookings: 8,
    cancelledBookings: 1,
    noshowBookings: 0,
    totalRevenueKrw: 960000,
    totalDepositsCny: 1512,
    commissionKrw: 96000,
    commissionRate: 0.10,
    payoutKrw: 864000,
    status: 'pending',
    payoutDate: '2026-03-25',
    stylistBreakdown: [],
    serviceBreakdown: [],
    hourlyBreakdown: [],
  },
]

// ─── 타임슬롯 생성 헬퍼 ───
export function generateTimeSlots(openTime = '10:00', closeTime = '21:00', intervalMin = 30, breakTime = null) {
  const slots = []
  const [openH, openM] = openTime.split(':').map(Number)
  const [closeH, closeM] = closeTime.split(':').map(Number)
  let h = openH, m = openM

  while (h < closeH || (h === closeH && m < closeM)) {
    const timeStr = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`

    // 브레이크 타임 체크
    let isBreak = false
    if (breakTime) {
      const [bsH, bsM] = breakTime.start.split(':').map(Number)
      const [beH, beM] = breakTime.end.split(':').map(Number)
      const cur = h * 60 + m
      const bs = bsH * 60 + bsM
      const be = beH * 60 + beM
      if (cur >= bs && cur < be) isBreak = true
    }

    slots.push({ time: timeStr, available: !isBreak })
    m += intervalMin
    if (m >= 60) { h += Math.floor(m / 60); m = m % 60 }
  }
  return slots
}

// ─── 동시 예약 가능 여부 체크 ───
export function checkConcurrentAvailability(reservations, shopId, date, time, duration, maxConcurrent = 3) {
  const slotStart = timeToMinutes(time)
  const slotEnd = slotStart + duration

  const overlapping = reservations.filter(r => {
    if (r.shopId !== shopId || r.date !== date) return false
    if (!['pending', 'confirmed'].includes(r.status)) return false
    const rStart = timeToMinutes(r.time)
    const rEnd = rStart + r.totalDuration
    return slotStart < rEnd && slotEnd > rStart
  })

  return overlapping.length < maxConcurrent
}

function timeToMinutes(timeStr) {
  const [h, m] = timeStr.split(':').map(Number)
  return h * 60 + m
}

// ─── 서비스 가격 조회 (스타일리스트별 차등가격 적용) ───
export function getServicePrice(service, stylistId) {
  if (stylistId && service.stylistPricing && service.stylistPricing[stylistId]) {
    return service.stylistPricing[stylistId]
  }
  return { priceKrw: service.priceKrw, priceCny: service.priceCny }
}

// ─── 고객 세그먼트 자동 계산 ───
export function calculateSegment(customer) {
  if (customer.isBlocked) return 'dormant'
  if (customer.totalVisits === 0) return 'new'
  if (customer.totalVisits >= 5 || customer.totalSpentKrw >= 500000) return 'vip'
  if (customer.lastVisitAt) {
    const daysSinceVisit = (Date.now() - new Date(customer.lastVisitAt).getTime()) / (1000 * 60 * 60 * 24)
    if (daysSinceVisit > 90) return 'dormant'
  }
  return 'regular'
}

// ─── 국기 매핑 ───
export const COUNTRY_FLAGS = {
  CN: '🇨🇳', JP: '🇯🇵', US: '🇺🇸', TW: '🇹🇼', HK: '🇭🇰',
  TH: '🇹🇭', VN: '🇻🇳', MY: '🇲🇾', SG: '🇸🇬',
}

// ─── 언어 매핑 ───
export const LANG_LABELS = {
  ZH: '中文', JA: '日本語', EN: 'English',
}

// ─── 예약번호 생성 ───
export function generateReservationNo() {
  const now = new Date()
  const mm = String(now.getMonth() + 1).padStart(2, '0')
  const dd = String(now.getDate()).padStart(2, '0')
  const seq = String(Math.floor(Math.random() * 999) + 1).padStart(3, '0')
  return `N-${mm}${dd}-${seq}`
}
