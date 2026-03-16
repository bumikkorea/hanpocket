/**
 * Tax Refund Checker API
 *
 * TODO: Register for the following API keys:
 * - VITE_CLOVA_OCR_API_KEY: Naver Clova OCR (https://www.ncloud.com/product/aiService/ocr)
 * - VITE_NTS_API_KEY: 국세청 Tax Free merchant API (https://www.data.go.kr)
 *
 * Fallback: Google Vision API (VITE_GOOGLE_VISION_API_KEY)
 */

// Exchange rates (fallback static rates, should be replaced with real-time data)
const EXCHANGE_RATES = {
  CNY: { rate: 0.0054, symbol: '¥', name: { ko: '중국 위안', zh: '人民币', en: 'Chinese Yuan', ja: '中国元' } },
  USD: { rate: 0.00074, symbol: '$', name: { ko: '미국 달러', zh: '美元', en: 'US Dollar', ja: '米ドル' } },
  JPY: { rate: 0.11, symbol: '¥', name: { ko: '일본 엔', zh: '日元', en: 'Japanese Yen', ja: '日本円' } },
  EUR: { rate: 0.00068, symbol: '€', name: { ko: '유로', zh: '欧元', en: 'Euro', ja: 'ユーロ' } },
  TWD: { rate: 0.024, symbol: 'NT$', name: { ko: '대만 달러', zh: '新台币', en: 'Taiwan Dollar', ja: '台湾ドル' } },
}

// 실제 환급요율표 (2024 기준, 관세청 고시)
// [최소금액, 최대금액, 환급액]
const REFUND_TABLE = [
  [15000, 29999, 1000],
  [30000, 49999, 2000],
  [50000, 74999, 3000],
  [75000, 99999, 5000],
  [100000, 124999, 7000],
  [125000, 149999, 8000],
  [150000, 174999, 9000],
  [175000, 199999, 10000],
  [200000, 224999, 12000],
  [225000, 249999, 13000],
  [250000, 274999, 15000],
  [275000, 299999, 17000],
  [300000, 324999, 19000],
  [325000, 349999, 21000],
  [350000, 374999, 23000],
  [375000, 399999, 25000],
  [400000, 424999, 27000],
  [425000, 449999, 28000],
  [450000, 474999, 30000],
  [475000, 499999, 32000],
  [500000, 549999, 35000],
  [550000, 599999, 37000],
  [600000, 649999, 41000],
  [650000, 699999, 45000],
  [700000, 749999, 50000],
  [750000, 799999, 53000],
  [800000, 849999, 57000],
  [850000, 899999, 60000],
  [900000, 949999, 65000],
  [950000, 999999, 68000],
  [1000000, 1099999, 75000],
  [1100000, 1199999, 80000],
  [1200000, 1299999, 90000],
  [1300000, 1399999, 95000],
  [1400000, 1499999, 105000],
  [1500000, 1599999, 110000],
  [1600000, 1699999, 115000],
  [1700000, 1799999, 127000],
  [1800000, 1899999, 135000],
  [1900000, 1999999, 140000],
  [2000000, 2099999, 150000],
  [2100000, 2199999, 155000],
  [2200000, 2299999, 160000],
  [2300000, 2399999, 170000],
  [2400000, 2499999, 177000],
  [2500000, 2599999, 185000],
  [2600000, 2699999, 190000],
  [2700000, 2799999, 200000],
  [2800000, 2899999, 210000],
  [2900000, 2999999, 215000],
  [3000000, 3099999, 225000],
  [3100000, 3199999, 230000],
  [3200000, 3299999, 235000],
  [3300000, 3399999, 240000],
  [3400000, 3499999, 250000],
  [3500000, 3599999, 260000],
  [3600000, 3699999, 270000],
  [3700000, 3799999, 280000],
  [3800000, 3899999, 285000],
  [3900000, 3999999, 290000],
  [4000000, 4099999, 300000],
  [4100000, 4199999, 310000],
  [4200000, 4299999, 315000],
  [4300000, 4399999, 320000],
  [4400000, 4499999, 333000],
  [4500000, 4599999, 340000],
  [4600000, 4699999, 350000],
  [4700000, 4799999, 360000],
  [4800000, 4899999, 370000],
  [4900000, 4999999, 380000],
  [5000000, 5099999, 390000],
  [5100000, 5199999, 400000],
  [5200000, 5299999, 410000],
  [5300000, 5399999, 420000],
  [5400000, 5499999, 430000],
  [5500000, 5599999, 440000],
  [5600000, 5699999, 450000],
  [5700000, 5799999, 460000],
  [5800000, 5899999, 470000],
  [5900000, 5999999, 480000],
]

const MIN_PURCHASE_AMOUNT = 15000 // Minimum ₩15,000 per receipt for tax refund eligibility

/**
 * OCR a receipt image
 * TODO: Replace with real Clova OCR API call
 */
export async function ocrReceipt(imageFile) {
  const apiKey = import.meta.env.VITE_CLOVA_OCR_API_KEY

  if (apiKey) {
    try {
      // TODO: Real Clova OCR implementation
      const formData = new FormData()
      formData.append('image', imageFile)
      const res = await fetch('https://8oi9s0nnth.apigw.ntruss.com/custom/v1/ocr/receipt', {
        method: 'POST',
        headers: { 'X-OCR-SECRET': apiKey },
        body: formData,
      })
      if (res.ok) {
        const data = await res.json()
        // Parse Clova OCR response format
        return parseOcrResponse(data)
      }
    } catch (e) {
      console.warn('Clova OCR failed:', e)
    }
  }

  // Mock OCR result for demo
  return new Promise(resolve => {
    setTimeout(() => {
      resolve({
        businessNumber: '123-45-67890',
        storeName: 'OLIVE YOUNG 명동본점',
        amount: 85000,
        date: new Date().toISOString().split('T')[0],
        items: [
          { name: '화장품', price: 45000 },
          { name: '마스크팩', price: 40000 },
        ],
        raw: 'Mock OCR result',
      })
    }, 1500)
  })
}

function parseOcrResponse(data) {
  // TODO: Parse actual Clova OCR response
  const result = data?.images?.[0]?.receipt?.result || {}
  return {
    businessNumber: result?.storeInfo?.bizNum?.text || '',
    storeName: result?.storeInfo?.name?.text || '',
    amount: parseInt(result?.totalPrice?.price?.text?.replace(/[^0-9]/g, '') || '0'),
    date: result?.paymentInfo?.date?.text || '',
    items: (result?.subResults || []).map(item => ({
      name: item.name?.text || '',
      price: parseInt(item.price?.text?.replace(/[^0-9]/g, '') || '0'),
    })),
  }
}

/**
 * Check if a merchant is Tax Free registered
 * TODO: Replace with real NTS API call
 */
export async function checkTaxFreeStatus(businessNumber) {
  const apiKey = import.meta.env.VITE_NTS_API_KEY

  if (apiKey) {
    try {
      // TODO: Real NTS API endpoint
      const res = await fetch(
        `https://api.odcloud.kr/api/nts-businessman/v1/validate?serviceKey=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ businesses: [{ b_no: businessNumber.replace(/-/g, '') }] }),
        }
      )
      if (res.ok) {
        const data = await res.json()
        const biz = data?.data?.[0]
        return {
          eligible: biz?.tax_free === 'Y',
          storeName: biz?.b_nm || '',
          storeType: biz?.b_type || '',
          valid: biz?.valid === '01',
        }
      }
    } catch (e) {
      console.warn('NTS API failed:', e)
    }
  }

  // Mock: most major stores in tourist areas are Tax Free eligible
  const eligible = !businessNumber.startsWith('999')
  return new Promise(resolve => {
    setTimeout(() => {
      resolve({
        eligible,
        storeName: '',
        storeType: 'retail',
        valid: true,
      })
    }, 800)
  })
}

/**
 * 환급요율표 기반 환급액 조회
 * - 15,000 ~ 5,999,999: 구간별 정액 환급
 * - 6,000,000 이상: 부가세(판매가÷1.1×0.1)의 90%, 백원단위 절사
 */
function lookupRefundKRW(amountKRW) {
  if (amountKRW < MIN_PURCHASE_AMOUNT) return 0

  // 요율표 범위 내
  for (const [min, max, refund] of REFUND_TABLE) {
    if (amountKRW >= min && amountKRW <= max) return refund
  }

  // 6,000,000원 이상: 부가세의 90% (백원단위 이하 절사)
  if (amountKRW >= 6000000) {
    const vat = Math.floor(amountKRW / 11) // 판매가 ÷ 1.1 × 0.1 = 판매가 ÷ 11
    const refund = Math.floor(vat * 0.9)
    return Math.floor(refund / 100) * 100 // 백원단위 절사
  }

  return 0
}

/**
 * Calculate VAT refund amount (실제 환급요율표 기준)
 */
export function calculateRefund(amountKRW, currency = 'CNY') {
  if (amountKRW < MIN_PURCHASE_AMOUNT) {
    return { eligible: false, refundKRW: 0, refundForeign: 0, currency, reason: 'min_amount' }
  }

  const refundKRW = lookupRefundKRW(amountKRW)
  const rate = EXCHANGE_RATES[currency] || EXCHANGE_RATES.CNY
  const refundForeign = (refundKRW * rate.rate).toFixed(2)

  return {
    eligible: true,
    refundKRW,
    refundForeign: parseFloat(refundForeign),
    currency,
    symbol: rate.symbol,
    currencyName: rate.name,
  }
}

export { EXCHANGE_RATES, MIN_PURCHASE_AMOUNT, REFUND_TABLE, lookupRefundKRW }
