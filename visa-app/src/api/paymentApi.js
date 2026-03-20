// NEAR Payment API — Antom (Alipay Global) 결제 클라이언트
// Worker 프록시를 통해 Antom API와 통신

const PAYMENT_API_BASE = import.meta.env.VITE_PAYMENT_API_URL || 'https://hanpocket-payment-proxy.workers.dev'

// ─── 결제 생성 (보증금) ───
export async function createPayment({
  reservationNo,
  amount,          // 위안 단위
  currency = 'CNY',
  subject,         // 서비스 설명 (예: "剪发+染发 — 清潭美容沙龙")
  paymentMethod = 'ALIPAY_CN', // ALIPAY_CN, CONNECT_WALLET
  returnUrl,
}) {
  const response = await fetchPaymentApi('/pay/create', {
    method: 'POST',
    body: {
      reservationNo,
      amount,
      currency,
      subject,
      paymentMethod: mapPaymentMethod(paymentMethod),
      returnUrl: returnUrl || `${window.location.origin}/reservation/complete`,
    },
  })

  return response
}

// ─── 결제 상태 조회 ───
export async function checkPaymentStatus(paymentRequestId) {
  return await fetchPaymentApi(`/pay/status?paymentRequestId=${encodeURIComponent(paymentRequestId)}`, {
    method: 'GET',
  })
}

// ─── 환불 요청 ───
export async function requestRefund({
  paymentId,
  refundAmount,
  refundCurrency = 'CNY',
  refundReason = 'Customer cancellation',
}) {
  return await fetchPaymentApi('/pay/refund', {
    method: 'POST',
    body: {
      paymentId,
      refundAmount,
      refundCurrency,
      refundReason,
    },
  })
}

// ─── 결제 취소 ───
export async function cancelPayment(paymentRequestId) {
  return await fetchPaymentApi('/pay/cancel', {
    method: 'POST',
    body: { paymentRequestId },
  })
}

// ─── 결제 상태 폴링 (리다이렉트 복귀 후 사용) ───
export async function pollPaymentStatus(paymentRequestId, { maxAttempts = 10, intervalMs = 2000 } = {}) {
  for (let i = 0; i < maxAttempts; i++) {
    const result = await checkPaymentStatus(paymentRequestId)
    if (result.status === 'SUCCESS') return { ...result, settled: true }
    if (result.status === 'FAIL') return { ...result, settled: true, failed: true }
    await new Promise(r => setTimeout(r, intervalMs))
  }
  return { status: 'TIMEOUT', settled: false }
}

// ─── 내부 헬퍼 ───
async function fetchPaymentApi(path, { method = 'GET', body } = {}) {
  const url = `${PAYMENT_API_BASE}${path}`
  const options = {
    method,
    headers: { 'Content-Type': 'application/json' },
  }
  if (body) options.body = JSON.stringify(body)

  try {
    const res = await fetch(url, options)
    const data = await res.json()
    if (!res.ok) {
      throw new Error(data.error || `HTTP ${res.status}`)
    }
    return data
  } catch (err) {
    console.error(`Payment API error [${method} ${path}]:`, err)
    return { error: err.message, resultCode: 'NETWORK_ERROR' }
  }
}

// 앱 내 결제수단 ID → Antom paymentMethodType 매핑
function mapPaymentMethod(method) {
  const map = {
    alipay: 'ALIPAY_CN',
    wechat: 'CONNECT_WALLET', // WeChat Pay는 Antom에서 CONNECT_WALLET
    card: 'CARD',
  }
  return map[method] || method
}
