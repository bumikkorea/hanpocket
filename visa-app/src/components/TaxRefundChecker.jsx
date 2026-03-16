import { useState, useRef, useEffect } from 'react'
import { Camera, Image, Receipt, Check, X, Trash2, ChevronDown, ChevronUp, ExternalLink, AlertCircle } from 'lucide-react'
import { ocrReceipt, checkTaxFreeStatus, calculateRefund, EXCHANGE_RATES } from '../api/taxRefundApi'

function L(lang, d) {
  if (typeof d === 'string') return d
  return d?.[lang] || d?.en || d?.zh || d?.ko || ''
}

const TEXTS = {
  title: { ko: '세금환급 판별기', zh: '退税检查器', en: 'Tax Refund Checker', ja: '免税チェッカー' },
  subtitle: { ko: '영수증을 촬영하면 환급 가능 여부를 알려드려요', zh: '拍摄收据，查看是否可以退税', en: 'Scan your receipt to check tax refund eligibility', ja: 'レシートを撮影して免税対象か確認' },
  camera: { ko: '카메라 촬영', zh: '拍照', en: 'Take Photo', ja: '写真を撮る' },
  gallery: { ko: '갤러리에서 선택', zh: '从相册选择', en: 'Choose from Gallery', ja: 'ギャラリーから選択' },
  analyzing: { ko: '분석 중...', zh: '分析中...', en: 'Analyzing...', ja: '分析中...' },
  eligible: { ko: '환급 가능!', zh: '可以退税！', en: 'Eligible for Refund!', ja: '免税対象！' },
  notEligible: { ko: '환급 불가', zh: '不可退税', en: 'Not Eligible', ja: '免税対象外' },
  minAmount: { ko: '최소 금액 미달 (₩15,000 이상)', zh: '未达最低金额（₩15,000以上）', en: 'Below minimum (₩15,000+)', ja: '最低金額未満（₩15,000以上）' },
  storeName: { ko: '매장', zh: '商店', en: 'Store', ja: '店舗' },
  amount: { ko: '구매 금액', zh: '购买金额', en: 'Purchase Amount', ja: '購入金額' },
  refundEst: { ko: '예상 환급액', zh: '预计退税金额', en: 'Estimated Refund', ja: '推定還付額' },
  bizNumber: { ko: '사업자번호', zh: '营业执照号', en: 'Business #', ja: '事業者番号' },
  history: { ko: '영수증 기록', zh: '收据记录', en: 'Receipt History', ja: 'レシート履歴' },
  totalRefund: { ko: '이번 여행 총 예상 환급액', zh: '本次旅行预计总退税', en: 'Total Trip Refund Estimate', ja: '今回の旅行の推定還付総額' },
  noReceipts: { ko: '아직 스캔한 영수증이 없어요', zh: '还没有扫描的收据', en: 'No scanned receipts yet', ja: 'まだスキャンしたレシートがありません' },
  howToRefund: { ko: '환급받는 방법', zh: '如何退税', en: 'How to Get Refund', ja: '還付方法' },
  currency: { ko: '환산 통화', zh: '换算货币', en: 'Currency', ja: '通貨' },
  delete: { ko: '삭제', zh: '删除', en: 'Delete', ja: '削除' },
  scanAnother: { ko: '다른 영수증 스캔', zh: '扫描其他收据', en: 'Scan Another', ja: '別のレシートをスキャン' },
  globalTaxFree: { ko: 'Global Tax Free 앱', zh: 'Global Tax Free App', en: 'Global Tax Free App', ja: 'Global Tax Free アプリ' },
  easyTaxRefund: { ko: 'Easy Tax Refund 앱', zh: 'Easy Tax Refund App', en: 'Easy Tax Refund App', ja: 'Easy Tax Refund アプリ' },
}

const STORAGE_KEY = 'hp_tax_receipts'

function loadReceipts() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [] } catch { return [] }
}
function saveReceipts(items) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
}

export default function TaxRefundChecker({ lang, profile }) {
  const [receipts, setReceipts] = useState(loadReceipts)
  const [analyzing, setAnalyzing] = useState(false)
  const [result, setResult] = useState(null)
  const [showHistory, setShowHistory] = useState(false)
  const [currency, setCurrency] = useState(profile?.nationality === 'japan' ? 'JPY' : profile?.nationality === 'usa' ? 'USD' : 'CNY')
  const cameraRef = useRef(null)
  const galleryRef = useRef(null)

  useEffect(() => { saveReceipts(receipts) }, [receipts])

  async function handleImage(file) {
    if (!file) return
    setAnalyzing(true)
    setResult(null)

    try {
      const ocr = await ocrReceipt(file)
      const taxFree = await checkTaxFreeStatus(ocr.businessNumber)
      const refund = calculateRefund(ocr.amount, currency)

      const newResult = {
        id: Date.now().toString(),
        ...ocr,
        taxFreeEligible: taxFree.eligible,
        refund,
        scannedAt: new Date().toISOString(),
      }

      setResult(newResult)

      if (refund.eligible && taxFree.eligible) {
        setReceipts(prev => [newResult, ...prev])
      }
    } catch (e) {
      console.error('Receipt analysis failed:', e)
    }
    setAnalyzing(false)
  }

  function deleteReceipt(id) {
    setReceipts(prev => prev.filter(r => r.id !== id))
  }

  const totalRefundKRW = receipts.reduce((sum, r) => sum + (r.refund?.refundKRW || 0), 0)
  const totalRefundCalc = calculateRefund(Math.floor(totalRefundKRW / 0.0909), currency)

  return (
    <div className="space-y-4 pb-6">
      {/* Header */}
      <div className="text-center pt-2 pb-4">
        <div className="w-14 h-14 mx-auto mb-3 rounded-2xl bg-emerald-50 flex items-center justify-center">
          <Receipt size={28} className="text-emerald-600" />
        </div>
        <h2 className="text-lg font-bold text-[#111827]">{L(lang, TEXTS.title)}</h2>
        <p className="text-xs text-[#6B7280] mt-1 px-8">{L(lang, TEXTS.subtitle)}</p>
      </div>

      {/* Currency selector */}
      <div className="flex items-center justify-center gap-2 px-4">
        <span className="text-xs text-[#6B7280]">{L(lang, TEXTS.currency)}:</span>
        <div className="flex gap-1">
          {Object.keys(EXCHANGE_RATES).map(c => (
            <button
              key={c}
              onClick={() => setCurrency(c)}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                currency === c ? 'bg-[#111827] text-white' : 'bg-[#F3F4F6] text-[#6B7280]'
              }`}
            >
              {EXCHANGE_RATES[c].symbol} {c}
            </button>
          ))}
        </div>
      </div>

      {/* Scan buttons */}
      <div className="px-4 flex gap-3">
        <input ref={cameraRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={e => handleImage(e.target.files[0])} />
        <input ref={galleryRef} type="file" accept="image/*" className="hidden" onChange={e => handleImage(e.target.files[0])} />
        <button
          onClick={() => cameraRef.current?.click()}
          disabled={analyzing}
          className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl bg-[#111827] text-white text-sm font-medium disabled:opacity-50"
        >
          <Camera size={18} />
          {L(lang, TEXTS.camera)}
        </button>
        <button
          onClick={() => galleryRef.current?.click()}
          disabled={analyzing}
          className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl border border-[#E5E7EB] text-[#111827] text-sm font-medium disabled:opacity-50"
        >
          <Image size={18} />
          {L(lang, TEXTS.gallery)}
        </button>
      </div>

      {/* Analyzing state */}
      {analyzing && (
        <div className="mx-4 p-6 rounded-xl bg-[#F9FAFB] border border-[#E5E7EB] text-center">
          <div className="w-8 h-8 border-2 border-gray-200 border-t-[#111827] rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm text-[#6B7280]">{L(lang, TEXTS.analyzing)}</p>
        </div>
      )}

      {/* Result */}
      {result && !analyzing && (
        <div className="mx-4 rounded-xl border border-[#E5E7EB] overflow-hidden">
          <div className={`p-4 ${result.taxFreeEligible && result.refund.eligible ? 'bg-emerald-50' : 'bg-red-50'}`}>
            <div className="flex items-center gap-2 mb-1">
              {result.taxFreeEligible && result.refund.eligible ? (
                <Check size={20} className="text-emerald-600" />
              ) : (
                <X size={20} className="text-red-600" />
              )}
              <span className={`text-base font-bold ${result.taxFreeEligible && result.refund.eligible ? 'text-emerald-700' : 'text-red-700'}`}>
                {L(lang, result.taxFreeEligible && result.refund.eligible ? TEXTS.eligible : TEXTS.notEligible)}
              </span>
            </div>
            {result.refund.reason === 'min_amount' && (
              <p className="text-xs text-red-600 ml-7">{L(lang, TEXTS.minAmount)}</p>
            )}
          </div>
          <div className="p-4 space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-[#6B7280]">{L(lang, TEXTS.storeName)}</span>
              <span className="font-medium text-[#111827]">{result.storeName}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-[#6B7280]">{L(lang, TEXTS.amount)}</span>
              <span className="font-medium text-[#111827]">₩{result.amount.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-[#6B7280]">{L(lang, TEXTS.bizNumber)}</span>
              <span className="font-mono text-xs text-[#6B7280]">{result.businessNumber}</span>
            </div>
            {result.refund.eligible && result.taxFreeEligible && (
              <div className="pt-2 border-t border-[#E5E7EB]">
                <div className="flex justify-between text-sm">
                  <span className="text-[#6B7280]">{L(lang, TEXTS.refundEst)}</span>
                  <div className="text-right">
                    <span className="font-bold text-emerald-600">₩{result.refund.refundKRW.toLocaleString()}</span>
                    <span className="text-xs text-[#9CA3AF] block">{result.refund.symbol}{result.refund.refundForeign}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
          <div className="px-4 pb-4">
            <button
              onClick={() => setResult(null)}
              className="w-full py-2.5 rounded-lg bg-[#F3F4F6] text-sm text-[#374151] font-medium"
            >
              {L(lang, TEXTS.scanAnother)}
            </button>
          </div>
        </div>
      )}

      {/* Total refund tracker */}
      {receipts.length > 0 && (
        <div className="mx-4 p-4 rounded-xl bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200">
          <p className="text-xs text-emerald-700 mb-1">{L(lang, TEXTS.totalRefund)}</p>
          <p className="text-2xl font-light text-emerald-700">₩{totalRefundKRW.toLocaleString()}</p>
          <p className="text-xs text-emerald-600 opacity-70">
            ≈ {EXCHANGE_RATES[currency]?.symbol}{totalRefundCalc.refundForeign || 0} {currency}
          </p>
        </div>
      )}

      {/* Receipt history */}
      <div className="mx-4">
        <button
          onClick={() => setShowHistory(!showHistory)}
          className="flex items-center justify-between w-full py-3"
        >
          <span className="text-sm font-semibold text-[#111827]">
            {L(lang, TEXTS.history)} ({receipts.length})
          </span>
          {showHistory ? <ChevronUp size={16} className="text-[#9CA3AF]" /> : <ChevronDown size={16} className="text-[#9CA3AF]" />}
        </button>

        {showHistory && (
          <div className="space-y-2">
            {receipts.length === 0 ? (
              <p className="text-center text-xs text-[#9CA3AF] py-6">{L(lang, TEXTS.noReceipts)}</p>
            ) : (
              receipts.map(r => (
                <div key={r.id} className="flex items-center justify-between p-3 rounded-lg bg-[#F9FAFB] border border-[#E5E7EB]">
                  <div>
                    <p className="text-sm font-medium text-[#111827]">{r.storeName}</p>
                    <p className="text-xs text-[#6B7280]">₩{r.amount.toLocaleString()} → ₩{r.refund.refundKRW.toLocaleString()} refund</p>
                    <p className="text-[10px] text-[#9CA3AF]">{new Date(r.scannedAt).toLocaleDateString()}</p>
                  </div>
                  <button onClick={() => deleteReceipt(r.id)} className="p-2 text-[#9CA3AF] hover:text-red-500">
                    <Trash2 size={14} />
                  </button>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* How to get refund + CTA */}
      <div className="mx-4 p-4 rounded-xl border border-[#E5E7EB] space-y-3">
        <h3 className="text-sm font-bold text-[#111827] flex items-center gap-2">
          <AlertCircle size={14} />
          {L(lang, TEXTS.howToRefund)}
        </h3>
        <div className="space-y-2 text-xs text-[#6B7280]">
          <p>{L(lang, { ko: '1. ₩15,000 이상 구매 시 환급 가능', zh: '1. 购买₩15,000以上可退税', en: '1. Purchases ₩15,000+ are eligible', ja: '1. ₩15,000以上の購入が対象' })}</p>
          <p>{L(lang, { ko: '2. 출국 시 공항 세관에서 영수증 제시', zh: '2. 出境时在机场海关出示收据', en: '2. Show receipts at airport customs when departing', ja: '2. 出国時に空港の税関でレシートを提示' })}</p>
          <p>{L(lang, { ko: '3. Tax Free 키오스크 또는 카운터에서 환급', zh: '3. 在Tax Free自助机或柜台退税', en: '3. Get refund at Tax Free kiosk or counter', ja: '3. Tax Freeキオスクまたはカウンターで還付' })}</p>
        </div>
        <div className="flex gap-2 pt-1">
          <a
            href="https://apps.apple.com/kr/app/global-tax-free/id1141552845"
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg bg-blue-50 text-blue-700 text-xs font-medium"
          >
            <ExternalLink size={12} />
            {L(lang, TEXTS.globalTaxFree)}
          </a>
          <a
            href="https://apps.apple.com/kr/app/easy-tax-refund/id994757554"
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg bg-purple-50 text-purple-700 text-xs font-medium"
          >
            <ExternalLink size={12} />
            {L(lang, TEXTS.easyTaxRefund)}
          </a>
        </div>
      </div>
    </div>
  )
}
