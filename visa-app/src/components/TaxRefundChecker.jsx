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
  ktReward: { ko: 'KT Tourist Reward', zh: 'KT Tourist Reward', en: 'KT Tourist Reward', ja: 'KT Tourist Reward' },
  refundOperators: { ko: '환급 사업자', zh: '退税运营商', en: 'Refund Operators', ja: '還付事業者' },
  instantRefund: { ko: '즉시환급', zh: '即时退税', en: 'Instant Refund', ja: '即時還付' },
  airportRefund: { ko: '공항환급', zh: '机场退税', en: 'Airport Refund', ja: '空港還付' },
  downtownRefund: { ko: '시내환급', zh: '市内退税', en: 'Downtown Refund', ja: '市内還付' },
  refundMethods: { ko: '환급 방법 3가지', zh: '3种退税方式', en: '3 Refund Methods', ja: '3つの還付方法' },
  instantDesc: { ko: '매장에서 바로 세금 차감 (₩50만 이하, 연 ₩250만 한도)', zh: '在商店直接扣除税金（₩50万以下，年度限额₩250万）', en: 'Tax deducted at store (under ₩500K, annual limit ₩2.5M)', ja: '店舗で即時税控除（₩50万以下、年間₩250万限度）' },
  airportDesc: { ko: '출국 시 공항 키오스크/카운터에서 환급', zh: '出境时在机场自助机/柜台退税', en: 'Refund at airport kiosk/counter when departing', ja: '出国時に空港キオスク/カウンターで還付' },
  downtownDesc: { ko: '명동·동대문 등 시내 환급 창구', zh: '明洞·东大门等市内退税窗口', en: 'Downtown refund counters in Myeongdong, Dongdaemun, etc.', ja: '明洞・東大門などの市内還付窓口' },
  tip: { ko: '💡 팁', zh: '💡 小贴士', en: '💡 Tip', ja: '💡 ヒント' },
  instantTip: { ko: '₩50만 이하 구매는 즉시환급이 가장 편해요! 매장에서 여권만 보여주세요.', zh: '₩50万以下购物，即时退税最方便！在商店出示护照即可。', en: 'For purchases under ₩500K, instant refund is easiest! Just show your passport at the store.', ja: '₩50万以下の購入は即時還付が最も便利！店舗でパスポートを見せるだけ。' },
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

      {/* Instant refund tip */}
      <div className="mx-4 p-3 rounded-xl bg-amber-50 border border-amber-200">
        <p className="text-xs font-semibold text-amber-800">{L(lang, TEXTS.tip)}</p>
        <p className="text-xs text-amber-700 mt-1">{L(lang, TEXTS.instantTip)}</p>
      </div>

      {/* 3 Refund Methods */}
      <div className="mx-4 p-4 rounded-xl border border-[#E5E7EB] space-y-3">
        <h3 className="text-sm font-bold text-[#111827] flex items-center gap-2">
          <AlertCircle size={14} />
          {L(lang, TEXTS.refundMethods)}
        </h3>

        {/* Method 1: Instant */}
        <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-100">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold text-emerald-700 bg-emerald-200 px-2 py-0.5 rounded-full">1</span>
            <span className="text-xs font-bold text-emerald-800">{L(lang, TEXTS.instantRefund)}</span>
            <span className="text-[10px] text-emerald-600 bg-emerald-100 px-1.5 py-0.5 rounded ml-auto">⚡ {L(lang, { ko: '가장 편리', zh: '最方便', en: 'Easiest', ja: '最も便利' })}</span>
          </div>
          <p className="text-[11px] text-emerald-700">{L(lang, TEXTS.instantDesc)}</p>
        </div>

        {/* Method 2: Airport */}
        <div className="p-3 rounded-lg bg-blue-50 border border-blue-100">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold text-blue-700 bg-blue-200 px-2 py-0.5 rounded-full">2</span>
            <span className="text-xs font-bold text-blue-800">{L(lang, TEXTS.airportRefund)}</span>
          </div>
          <p className="text-[11px] text-blue-700">{L(lang, TEXTS.airportDesc)}</p>
        </div>

        {/* Method 3: Downtown */}
        <div className="p-3 rounded-lg bg-purple-50 border border-purple-100">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold text-purple-700 bg-purple-200 px-2 py-0.5 rounded-full">3</span>
            <span className="text-xs font-bold text-purple-800">{L(lang, TEXTS.downtownRefund)}</span>
          </div>
          <p className="text-[11px] text-purple-700">{L(lang, TEXTS.downtownDesc)}</p>
        </div>

        {/* Basic steps */}
        <div className="space-y-1.5 text-xs text-[#6B7280] pt-1 border-t border-[#E5E7EB]">
          <p>{L(lang, { ko: '✓ ₩15,000 이상 구매 + Tax Free 가맹점', zh: '✓ 购买₩15,000以上 + Tax Free加盟店', en: '✓ Purchase ₩15,000+ at Tax Free merchant', ja: '✓ ₩15,000以上購入 + Tax Free加盟店' })}</p>
          <p>{L(lang, { ko: '✓ 구매일로부터 3개월 이내 출국', zh: '✓ 购买日起3个月内出境', en: '✓ Depart within 3 months of purchase', ja: '✓ 購入日から3ヶ月以内に出国' })}</p>
          <p>{L(lang, { ko: '✓ 여권 필수 (구매 시 + 환급 시)', zh: '✓ 必须携带护照（购买时+退税时）', en: '✓ Passport required (at purchase + refund)', ja: '✓ パスポート必須（購入時+還付時）' })}</p>
        </div>
      </div>

      {/* Refund operators */}
      <div className="mx-4 p-4 rounded-xl border border-[#E5E7EB] space-y-3">
        <h3 className="text-sm font-bold text-[#111827]">{L(lang, TEXTS.refundOperators)}</h3>
        <p className="text-[11px] text-[#9CA3AF]">{L(lang, { ko: '환급액은 관세청 고시 요율표로 동일합니다. 영수증의 사업자를 확인하세요.', zh: '退税金额按海关公示费率统一。请确认收据上的运营商。', en: 'Refund amounts are identical (set by Korea Customs). Check the operator on your receipt.', ja: '還付額は関税庁告示の料率表で統一。レシートの事業者を確認。' })}</p>

        <div className="grid grid-cols-3 gap-2">
          {/* Global Tax Free */}
          <a href="https://apps.apple.com/kr/app/global-tax-free/id1141552845" target="_blank" rel="noopener noreferrer"
            className="flex flex-col items-center gap-1.5 p-3 rounded-lg bg-blue-50 hover:bg-blue-100 transition-colors">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white text-[10px] font-bold">GTF</div>
            <span className="text-[10px] font-medium text-blue-800 text-center leading-tight">Global<br/>Tax Free</span>
            <span className="text-[9px] text-blue-500">🥇 {L(lang, { ko: '1위', zh: '第1', en: '#1', ja: '1位' })}</span>
          </a>

          {/* KT Tourist Reward */}
          <a href="https://apps.apple.com/kr/app/kt-tourist-reward/id1493aborting" target="_blank" rel="noopener noreferrer"
            className="flex flex-col items-center gap-1.5 p-3 rounded-lg bg-red-50 hover:bg-red-100 transition-colors">
            <div className="w-8 h-8 rounded-lg bg-red-600 flex items-center justify-center text-white text-[10px] font-bold">KT</div>
            <span className="text-[10px] font-medium text-red-800 text-center leading-tight">KT Tourist<br/>Reward</span>
            <span className="text-[9px] text-red-500">🥈 {L(lang, { ko: '2위', zh: '第2', en: '#2', ja: '2位' })}</span>
          </a>

          {/* Easy Tax Refund */}
          <a href="https://apps.apple.com/kr/app/easy-tax-refund/id994757554" target="_blank" rel="noopener noreferrer"
            className="flex flex-col items-center gap-1.5 p-3 rounded-lg bg-purple-50 hover:bg-purple-100 transition-colors">
            <div className="w-8 h-8 rounded-lg bg-purple-600 flex items-center justify-center text-white text-[10px] font-bold">ETR</div>
            <span className="text-[10px] font-medium text-purple-800 text-center leading-tight">Easy Tax<br/>Refund</span>
            <span className="text-[9px] text-purple-500">🥉 {L(lang, { ko: '3위', zh: '第3', en: '#3', ja: '3位' })}</span>
          </a>
        </div>

        <div className="grid grid-cols-2 gap-2">
          {/* EB Tax Free */}
          <div className="flex items-center gap-2 p-2.5 rounded-lg bg-[#F9FAFB] border border-[#E5E7EB]">
            <div className="w-6 h-6 rounded bg-gray-500 flex items-center justify-center text-white text-[9px] font-bold shrink-0">EB</div>
            <span className="text-[10px] font-medium text-[#374151]">EB Tax Free</span>
          </div>

          {/* CubeRefund */}
          <div className="flex items-center gap-2 p-2.5 rounded-lg bg-[#F9FAFB] border border-[#E5E7EB]">
            <div className="w-6 h-6 rounded bg-teal-500 flex items-center justify-center text-white text-[9px] font-bold shrink-0">CR</div>
            <span className="text-[10px] font-medium text-[#374151]">CubeRefund</span>
          </div>
        </div>
      </div>
    </div>
  )
}
