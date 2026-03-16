// popupApi.js — 팝업스토어 v3 API 클라이언트
// 전체 사용자 여정: 리스트 → 상세 → 체크인 → 반응 → 리뷰 → 추천

const BASE = import.meta.env.VITE_POPUP_API_URL || 'https://hanpocket-popup-store.bumik-korea.workers.dev'
const V3 = `${BASE}/api/v3`

// 사용자 토큰 (익명, 기기별)
function getUserToken() {
  let token = localStorage.getItem('hp_user_token')
  if (!token) {
    token = 'u_' + crypto.randomUUID()
    localStorage.setItem('hp_user_token', token)
  }
  return token
}

async function api(path, options = {}) {
  const { method = 'GET', body, admin } = options
  const headers = { 'Content-Type': 'application/json' }
  if (admin) headers['Authorization'] = `Bearer ${admin}`

  const res = await fetch(`${V3}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }))
    throw new Error(err.error || `HTTP ${res.status}`)
  }
  return res.json()
}


// ================================================================
//  1. 팝업 리스트 조회 + 필터
// ================================================================

/**
 * 팝업 목록 조회 (12종 카테고리 + 중국인 필터)
 *
 * @param {Object} filters
 * @param {string} filters.category   - 카테고리 (다중: "BEAUTY,IDOL")
 * @param {string} filters.district   - 지역 (다중: "seongsu,hongdae")
 * @param {string} filters.status     - active/upcoming/all (기본: active)
 * @param {boolean} filters.cn_pay    - 알리페이/위챗페이 가능
 * @param {boolean} filters.alipay    - 알리페이만
 * @param {boolean} filters.cn_staff  - 중국어 스태프
 * @param {boolean} filters.tax_free  - 면세
 * @param {boolean} filters.free      - 무료 입장
 * @param {boolean} filters.no_reservation - 예약 불필요
 * @param {boolean} filters.hot       - HOT만
 * @param {boolean} filters.closing_soon - 마감 7일 이내
 * @param {number}  filters.min_cn_score - 최소 cn_score
 * @param {string}  filters.q         - 키워드 검색
 * @param {string}  filters.sort      - closing/newest/cn_score/popular/rating/hot
 * @param {number}  filters.limit     - 개수 (기본 30, 최대 100)
 * @param {number}  filters.offset    - 페이지네이션
 *
 * @returns {{ popups: Array, total: number, has_more: boolean }}
 */
export async function getPopups(filters = {}) {
  const params = new URLSearchParams()

  if (filters.category)        params.set('category', filters.category)
  if (filters.district)        params.set('district', filters.district)
  if (filters.status)          params.set('status', filters.status)
  if (filters.cn_pay)          params.set('cn_pay', '1')
  if (filters.alipay)          params.set('alipay', '1')
  if (filters.wechatpay)       params.set('wechatpay', '1')
  if (filters.cn_staff)        params.set('cn_staff', '1')
  if (filters.tax_free)        params.set('tax_free', '1')
  if (filters.cn_no_phone)     params.set('cn_no_phone', '1')
  if (filters.free)            params.set('free', '1')
  if (filters.no_reservation)  params.set('no_reservation', '1')
  if (filters.hot)             params.set('hot', '1')
  if (filters.closing_soon)    params.set('closing_soon', '1')
  if (filters.min_cn_score)    params.set('min_cn_score', String(filters.min_cn_score))
  if (filters.q)               params.set('q', filters.q)
  if (filters.sort)            params.set('sort', filters.sort)
  if (filters.limit)           params.set('limit', String(filters.limit))
  if (filters.offset)          params.set('offset', String(filters.offset))
  if (filters.brand_id)        params.set('brand_id', String(filters.brand_id))

  return api(`/popups?${params}`)
}

/**
 * 지도 핀용 팝업 목록 (경량)
 */
export async function getPopupsMap({ category, cn_pay, swLat, neLat, swLng, neLng } = {}) {
  const params = new URLSearchParams()
  if (category) params.set('category', category)
  if (cn_pay)   params.set('cn_pay', '1')
  if (swLat)    params.set('swLat', String(swLat))
  if (neLat)    params.set('neLat', String(neLat))
  if (swLng)    params.set('swLng', String(swLng))
  if (neLng)    params.set('neLng', String(neLng))

  return api(`/popups/map?${params}`)
}

/**
 * 현재 위치 기반 근처 팝업
 */
export async function getPopupsNearby(lat, lng, radiusKm = 2) {
  return api(`/popups/nearby?lat=${lat}&lng=${lng}&radius=${radiusKm}`)
}

/**
 * 팝업 상세 조회 (조회수 자동 +1)
 */
export async function getPopupDetail(popupId) {
  return api(`/popups/${popupId}`)
}


// ================================================================
//  2. 체크인
// ================================================================

/**
 * 체크인 (geofence/QR/수동)
 *
 * @param {number} popupId
 * @param {Object} options
 * @param {string} options.method - geofence/qr/manual
 * @param {number} options.lat
 * @param {number} options.lng
 */
export async function checkin(popupId, { method = 'manual', lat, lng } = {}) {
  return api(`/popups/${popupId}/checkin`, {
    method: 'POST',
    body: { user_token: getUserToken(), method, lat, lng },
  })
}

/**
 * 체크아웃 (체류시간 기록)
 */
export async function checkout(popupId) {
  return api(`/popups/${popupId}/checkout`, {
    method: 'POST',
    body: { user_token: getUserToken() },
  })
}


// ================================================================
//  3. 반응 + 리뷰
// ================================================================

/**
 * 왕좋아요 / 좋아요
 * @param {number} popupId
 * @param {'super_like'|'like'} reactionType
 */
export async function submitReaction(popupId, reactionType) {
  return api(`/popups/${popupId}/reaction`, {
    method: 'POST',
    body: { user_token: getUserToken(), reaction_type: reactionType },
  })
}

/**
 * 리뷰 작성
 *
 * @param {number} popupId
 * @param {Object} reviewData
 * @param {number} reviewData.rating       - 1~5
 * @param {string} reviewData.crowd_level  - low/medium/high/packed
 * @param {string} reviewData.comment
 * @param {string} reviewData.lang         - zh/ko/en
 * @param {string[]} reviewData.photos     - URL 배열
 * @param {string[]} reviewData.tags       - 태그 코드 배열
 * @param {string} reviewData.review_tier  - mini/normal/premium
 * @param {string} reviewData.reward_type  - points/coupon/brand_sample/random_box
 * @param {string} reviewData.reward_detail - "150P" 등
 * @param {string} reviewData.reward_source - system/brand
 */
export async function submitReview(popupId, reviewData) {
  return api(`/popups/${popupId}/review`, {
    method: 'POST',
    body: { user_token: getUserToken(), ...reviewData },
  })
}

/**
 * 리뷰 목록 조회
 */
export async function getReviews(popupId, { limit = 20, offset = 0 } = {}) {
  return api(`/popups/${popupId}/reviews?limit=${limit}&offset=${offset}`)
}


// ================================================================
//  4. 리뷰 후 추천
// ================================================================

/**
 * 리뷰 후 맞춤 추천 (같은 카테고리 70% + 취향 30% + 날씨)
 *
 * @param {number} popupId  - 방금 리뷰한 팝업
 * @param {Object} context
 * @param {number} context.lat
 * @param {number} context.lng
 * @param {string} context.weather - sunny/cloudy/rainy/snowy/cold
 */
export async function getPostReviewRecommend(popupId, { lat, lng, weather } = {}) {
  const params = new URLSearchParams()
  params.set('user_token', getUserToken())
  if (lat) params.set('lat', String(lat))
  if (lng) params.set('lng', String(lng))
  if (weather) params.set('weather', weather)

  return api(`/popups/${popupId}/recommend?${params}`)
}

/**
 * 추천 카드 클릭 추적
 */
export async function trackPostReviewClick(sourcePopupId, clickedType, clickedId, cardPosition) {
  return api('/post-review-click', {
    method: 'POST',
    body: {
      user_token: getUserToken(),
      source_popup: sourcePopupId,
      clicked_type: clickedType,
      clicked_id: clickedId,
      card_position: cardPosition,
    },
  })
}


// ================================================================
//  5. 위시리스트
// ================================================================

/**
 * 위시리스트 토글 (추가/제거)
 */
export async function toggleWishlist(popupId) {
  return api(`/popups/${popupId}/wishlist`, {
    method: 'POST',
    body: { user_token: getUserToken() },
  })
}


// ================================================================
//  6. 사용자 데이터
// ================================================================

/**
 * 사용자 취향 프로필
 */
export async function getUserTaste() {
  return api(`/user/${getUserToken()}/taste`)
}

/**
 * 내 위시리스트 목록
 */
export async function getMyWishlists() {
  return api(`/user/${getUserToken()}/wishlists`)
}

/**
 * 내 리뷰 목록
 */
export async function getMyReviews() {
  return api(`/user/${getUserToken()}/reviews`)
}


// ================================================================
//  7. 지오펜스 로그
// ================================================================

/**
 * 지오펜스 트리거 로그
 */
export async function logGeoTrigger(popupId, triggerType, lat, lng) {
  return api(`/popups/${popupId}/geo-trigger`, {
    method: 'POST',
    body: { user_token: getUserToken(), trigger_type: triggerType, lat, lng },
  }).catch(() => {}) // 실패해도 무시
}


// ================================================================
//  8. 관리자
// ================================================================

/**
 * 팝업 등록 (관리자)
 */
export async function createPopup(data, adminToken) {
  return api('/popups', { method: 'POST', body: data, admin: adminToken })
}

/**
 * 팝업 수정 (관리자)
 */
export async function updatePopup(popupId, data, adminToken) {
  return api(`/popups/${popupId}`, { method: 'PUT', body: data, admin: adminToken })
}

/**
 * 팝업 통계 (관리자/브랜드)
 */
export async function getPopupStats(popupId) {
  return api(`/popups/${popupId}/stats`)
}


// ================================================================
//  9. 위챗 미니샵 — 방한 후 구매 흐름
//  "현장에서 못 샀다 / 귀국 후에도 사고 싶다"
//  → 위챗방 문의 → 미니샵 → 사전주문 → 확정 시 결제/배송
// ================================================================

/**
 * 팝업별 상품 목록
 * @param {number} popupId
 * @param {string} status - active/soldout/upcoming/all
 */
export async function getPopupProducts(popupId, status = 'active') {
  return api(`/popups/${popupId}/products?status=${status}`)
}

/**
 * 상품 상세 (조회수 자동 +1)
 */
export async function getProductDetail(productId) {
  return api(`/products/${productId}`)
}

/**
 * 사전주문 (미니샵)
 *
 * @param {number} productId
 * @param {Object} orderData
 * @param {number} orderData.quantity
 * @param {string} orderData.receiver_name  - 수령인 이름
 * @param {string} orderData.receiver_phone - 수령인 전화번호
 * @param {string} orderData.receiver_address - 배송지
 * @param {string} orderData.receiver_city  - 도시
 * @param {string} orderData.source         - minishop/wechat_group/app
 */
export async function createPreorder(productId, orderData) {
  return api(`/products/${productId}/preorder`, {
    method: 'POST',
    body: { user_token: getUserToken(), ...orderData },
  })
}

/**
 * 주문 조회
 * @param {string} orderNo - "HP-20260316-001"
 */
export async function getOrder(orderNo) {
  return api(`/orders/${orderNo}`)
}

/**
 * 내 주문 목록
 */
export async function getMyOrders() {
  return api(`/user/${getUserToken()}/orders`)
}


// ================================================================
//  10. 위챗방 문의
// ================================================================

/**
 * 위챗방 문의 등록
 *
 * @param {Object} inquiryData
 * @param {number} inquiryData.popup_id
 * @param {number} inquiryData.product_id
 * @param {string} inquiryData.question_type  - payment/wait_time/freebies/location/reservation/language/purchase/stock/shipping/other
 * @param {string} inquiryData.question_text  - 원문 (중국어)
 * @param {string} inquiryData.wechat_group
 * @param {string} inquiryData.wechat_user
 */
export async function createWechatInquiry(inquiryData) {
  return api('/wechat/inquiry', { method: 'POST', body: inquiryData })
}


// ================================================================
//  11. SNS 공유 추적
// ================================================================

/**
 * SNS 공유 추적 (小红书/抖音/위챗 모멘트)
 *
 * @param {number} popupId
 * @param {string} platform - xhs/douyin/wechat_moment/instagram
 * @param {string} action   - copy_tag/deeplink/share_card
 * @param {string} hashtag  - 복사한 해시태그
 */
export async function trackSnsShare(popupId, platform, action = 'copy_tag', hashtag = '') {
  return api(`/popups/${popupId}/share`, {
    method: 'POST',
    body: { user_token: getUserToken(), platform, action, hashtag },
  }).catch(() => {}) // 실패해도 무시
}
