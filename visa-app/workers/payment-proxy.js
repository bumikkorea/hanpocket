/**
 * NEAR Payment Proxy Worker — Antom (Alipay Global) 결제 연동
 *
 * 엔드포인트:
 *   POST /pay/create    — 결제 생성 (보증금)
 *   POST /pay/notify    — Antom 결제 결과 콜백 (서버→서버)
 *   GET  /pay/status    — 결제 상태 조회
 *   POST /pay/refund    — 환불 요청
 *   POST /pay/cancel    — 결제 취소
 *
 * Antom API Docs: https://global.alipay.com/docs/ac/ams/api
 * 서명: SHA256withRSA
 */

const ALLOWED_ORIGINS = [
  'https://hanpocket.com',
  'https://www.hanpocket.com',
  'https://near.hanpocket.com',
  'http://localhost:3000',
  'http://172.30.1.1:3000',
]

// Antom API 엔드포인트
const ANTOM_GATEWAY = 'https://open-sea-global.alipay.com' // production
const ANTOM_SANDBOX = 'https://open-sea-global.alipay.com'  // sandbox도 동일 도메인, clientId로 구분
const RATE_LIMIT = 30 // 결제는 더 엄격하게

export default {
  async fetch(request, env) {
    const url = new URL(request.url)
    const origin = request.headers.get('Origin') || ''

    // CORS preflight
    if (request.method === 'OPTIONS') {
      return json(null, 204, corsHeaders(origin))
    }

    // Antom 콜백은 CORS 없이 처리
    if (url.pathname === '/pay/notify') {
      return handleNotify(request, env)
    }

    // 나머지 엔드포인트는 Rate limit 적용
    const ip = request.headers.get('CF-Connecting-IP') || 'unknown'
    const rateLimitKey = `pay-rate:${ip}:${Math.floor(Date.now() / 60000)}`
    const count = parseInt(await env.KV?.get(rateLimitKey) || '0')
    if (count >= RATE_LIMIT) {
      return json({ error: 'Rate limit exceeded' }, 429, corsHeaders(origin))
    }
    await env.KV?.put(rateLimitKey, String(count + 1), { expirationTtl: 120 })

    // 라우팅
    try {
      if (request.method === 'POST' && url.pathname === '/pay/create') {
        return await handleCreatePayment(request, env, origin)
      }
      if (request.method === 'GET' && url.pathname === '/pay/status') {
        return await handlePaymentStatus(request, env, origin)
      }
      if (request.method === 'POST' && url.pathname === '/pay/refund') {
        return await handleRefund(request, env, origin)
      }
      if (request.method === 'POST' && url.pathname === '/pay/cancel') {
        return await handleCancel(request, env, origin)
      }

      return json({ error: 'Not Found' }, 404, corsHeaders(origin))
    } catch (err) {
      console.error('Payment proxy error:', err)
      return json({ error: 'Internal server error', details: err.message }, 500, corsHeaders(origin))
    }
  },
}

// ─── 결제 생성 ───
async function handleCreatePayment(request, env, origin) {
  const body = await request.json()
  const {
    reservationNo,
    amount,       // 위안 단위 (센트 아님, 예: 159)
    currency = 'CNY',
    subject,      // 서비스 설명
    paymentMethod = 'ALIPAY_CN', // ALIPAY_CN, ALIPAY_HK, CONNECT_WALLET
    returnUrl,
  } = body

  if (!reservationNo || !amount || !subject) {
    return json({ error: 'Missing required fields: reservationNo, amount, subject' }, 400, corsHeaders(origin))
  }

  const paymentRequestId = `NEAR-${reservationNo}-${Date.now()}`

  // Antom Cashier Payment API
  // https://global.alipay.com/docs/ac/web/integration
  const antomRequest = {
    productCode: 'CASHIER_PAYMENT',
    paymentRequestId,
    paymentAmount: {
      currency,
      value: String(Math.round(amount * 100)), // Antom은 센트 단위
    },
    order: {
      referenceOrderId: reservationNo,
      orderDescription: subject,
      orderAmount: {
        currency,
        value: String(Math.round(amount * 100)),
      },
    },
    paymentMethod: {
      paymentMethodType: paymentMethod,
    },
    paymentRedirectUrl: returnUrl || 'https://hanpocket.com/reservation/complete',
    paymentNotifyUrl: `https://hanpocket-payment.${env.WORKER_DOMAIN || 'workers.dev'}/pay/notify`,
    settlementStrategy: {
      settlementCurrency: 'KRW', // 원화 정산
    },
  }

  const response = await callAntom(
    '/ams/api/v1/payments/pay',
    antomRequest,
    env
  )

  // 결제 세션 저장 (KV에 paymentRequestId → reservationNo 매핑)
  if (response.result?.resultCode === 'SUCCESS' || response.result?.resultCode === 'REDIRECT') {
    await env.KV?.put(
      `payment:${paymentRequestId}`,
      JSON.stringify({
        reservationNo,
        amount,
        currency,
        status: 'CREATED',
        createdAt: new Date().toISOString(),
        paymentId: response.paymentId,
      }),
      { expirationTtl: 86400 } // 24시간
    )
  }

  return json({
    paymentRequestId,
    paymentId: response.paymentId,
    redirectUrl: response.normalUrl || response.schemeUrl || response.applinkUrl,
    resultCode: response.result?.resultCode,
    resultMessage: response.result?.resultMessage,
    raw: env.DEBUG === 'true' ? response : undefined,
  }, 200, corsHeaders(origin))
}

// ─── Antom 콜백 (서버→서버) ───
async function handleNotify(request, env) {
  const body = await request.text()

  // 서명 검증
  const signature = request.headers.get('Signature') || ''
  const isValid = await verifyAntomSignature(body, signature, env)
  if (!isValid) {
    console.error('Invalid Antom signature on notify')
    return new Response('Invalid signature', { status: 401 })
  }

  const data = JSON.parse(body)
  const { paymentRequestId, paymentId, paymentStatus } = data

  // KV에 상태 업데이트
  const existingRaw = await env.KV?.get(`payment:${paymentRequestId}`)
  if (existingRaw) {
    const existing = JSON.parse(existingRaw)
    existing.status = paymentStatus // SUCCESS, FAIL, PROCESSING
    existing.paymentId = paymentId
    existing.notifiedAt = new Date().toISOString()
    await env.KV?.put(`payment:${paymentRequestId}`, JSON.stringify(existing), { expirationTtl: 86400 * 30 })
  }

  // Antom은 "result" 객체로 응답 기대
  return new Response(JSON.stringify({
    result: { resultCode: 'SUCCESS', resultMessage: 'success' }
  }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  })
}

// ─── 결제 상태 조회 ───
async function handlePaymentStatus(request, env, origin) {
  const url = new URL(request.url)
  const paymentRequestId = url.searchParams.get('paymentRequestId')

  if (!paymentRequestId) {
    return json({ error: 'Missing paymentRequestId' }, 400, corsHeaders(origin))
  }

  // 먼저 KV 캐시 확인
  const cached = await env.KV?.get(`payment:${paymentRequestId}`)
  if (cached) {
    const data = JSON.parse(cached)
    if (data.status === 'SUCCESS' || data.status === 'FAIL') {
      return json(data, 200, corsHeaders(origin))
    }
  }

  // Antom API로 실시간 조회
  const response = await callAntom(
    '/ams/api/v1/payments/inquiryPayment',
    { paymentRequestId },
    env
  )

  return json({
    paymentRequestId,
    status: response.paymentStatus,
    paymentId: response.paymentId,
    amount: response.paymentAmount,
    resultCode: response.result?.resultCode,
  }, 200, corsHeaders(origin))
}

// ─── 환불 ───
async function handleRefund(request, env, origin) {
  const body = await request.json()
  const { paymentId, refundAmount, refundCurrency = 'CNY', refundReason = 'Customer cancellation' } = body

  if (!paymentId || !refundAmount) {
    return json({ error: 'Missing paymentId or refundAmount' }, 400, corsHeaders(origin))
  }

  const refundRequestId = `REFUND-${paymentId}-${Date.now()}`

  const response = await callAntom(
    '/ams/api/v1/payments/refund',
    {
      paymentId,
      refundRequestId,
      refundAmount: {
        currency: refundCurrency,
        value: String(Math.round(refundAmount * 100)),
      },
      refundReason,
    },
    env
  )

  return json({
    refundRequestId,
    refundId: response.refundId,
    status: response.refundStatus,
    resultCode: response.result?.resultCode,
    resultMessage: response.result?.resultMessage,
  }, 200, corsHeaders(origin))
}

// ─── 결제 취소 ───
async function handleCancel(request, env, origin) {
  const body = await request.json()
  const { paymentRequestId } = body

  if (!paymentRequestId) {
    return json({ error: 'Missing paymentRequestId' }, 400, corsHeaders(origin))
  }

  const response = await callAntom(
    '/ams/api/v1/payments/cancel',
    { paymentRequestId },
    env
  )

  return json({
    paymentRequestId,
    resultCode: response.result?.resultCode,
    resultMessage: response.result?.resultMessage,
  }, 200, corsHeaders(origin))
}

// ─── Antom API 호출 헬퍼 ───
async function callAntom(path, body, env) {
  const gateway = env.ANTOM_SANDBOX === 'true' ? ANTOM_SANDBOX : ANTOM_GATEWAY
  const clientId = env.ANTOM_CLIENT_ID
  const url = `${gateway}${path}`

  const bodyStr = JSON.stringify(body)
  const timestamp = new Date().toISOString().replace('Z', '+00:00')
  const httpMethod = 'POST'

  // 서명 생성: POST /path\nclientId.timestamp.body
  const signContent = `${httpMethod} ${path}\n${clientId}.${timestamp}.${bodyStr}`
  const signature = await signWithRSA(signContent, env.ANTOM_PRIVATE_KEY)

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Client-Id': clientId,
      'Request-Time': timestamp,
      'Signature': `algorithm=RSA256,keyVersion=1,signature=${signature}`,
    },
    body: bodyStr,
  })

  return await response.json()
}

// ─── RSA-SHA256 서명 (Web Crypto API) ───
async function signWithRSA(content, privateKeyPem) {
  // PEM → ArrayBuffer 변환
  const pemBody = privateKeyPem
    .replace('-----BEGIN PRIVATE KEY-----', '')
    .replace('-----END PRIVATE KEY-----', '')
    .replace('-----BEGIN RSA PRIVATE KEY-----', '')
    .replace('-----END RSA PRIVATE KEY-----', '')
    .replace(/\s/g, '')

  const binaryKey = Uint8Array.from(atob(pemBody), c => c.charCodeAt(0))

  const cryptoKey = await crypto.subtle.importKey(
    'pkcs8',
    binaryKey.buffer,
    { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
    false,
    ['sign']
  )

  const encoder = new TextEncoder()
  const signatureBuffer = await crypto.subtle.sign(
    'RSASSA-PKCS1-v1_5',
    cryptoKey,
    encoder.encode(content)
  )

  // ArrayBuffer → Base64
  return btoa(String.fromCharCode(...new Uint8Array(signatureBuffer)))
}

// ─── Antom 서명 검증 ───
async function verifyAntomSignature(body, signatureHeader, env) {
  if (!signatureHeader || !env.ANTOM_PUBLIC_KEY) return false

  try {
    // Signature 헤더 파싱: algorithm=RSA256,keyVersion=1,signature=xxx
    const sigMatch = signatureHeader.match(/signature=(.+)/)
    if (!sigMatch) return false
    const sig = sigMatch[1]

    const pemBody = env.ANTOM_PUBLIC_KEY
      .replace('-----BEGIN PUBLIC KEY-----', '')
      .replace('-----END PUBLIC KEY-----', '')
      .replace(/\s/g, '')

    const binaryKey = Uint8Array.from(atob(pemBody), c => c.charCodeAt(0))

    const cryptoKey = await crypto.subtle.importKey(
      'spki',
      binaryKey.buffer,
      { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
      false,
      ['verify']
    )

    const encoder = new TextEncoder()
    const sigBuffer = Uint8Array.from(atob(sig), c => c.charCodeAt(0))

    return await crypto.subtle.verify(
      'RSASSA-PKCS1-v1_5',
      cryptoKey,
      sigBuffer.buffer,
      encoder.encode(body)
    )
  } catch (err) {
    console.error('Signature verification error:', err)
    return false
  }
}

// ─── 유틸 ───
function json(data, status = 200, headers = {}) {
  return new Response(data ? JSON.stringify(data) : null, {
    status,
    headers: { 'Content-Type': 'application/json', ...headers },
  })
}

function corsHeaders(origin) {
  const allowed = ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0]
  return {
    'Access-Control-Allow-Origin': allowed,
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Max-Age': '86400',
  }
}
