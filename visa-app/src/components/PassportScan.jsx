import { useState, useRef } from 'react'
import { Camera, Shield, Check, AlertTriangle, Globe, Phone, ChevronRight, X, FileText } from 'lucide-react'
import { parseMRZ, buildProfileFromMRZ, getLanguageForNationality, getVisaRequirement, getEmbassy, getNationalityTips } from '../utils/mrzParser'

function L(lang, d) {
  if (typeof d === 'string') return d
  return d?.[lang] || d?.en || d?.zh || d?.ko || ''
}

const TEXTS = {
  title: { ko: '여권 스캔', zh: '护照扫描', en: 'Passport Scan', ja: 'パスポートスキャン' },
  subtitle: { ko: '여권 하단의 MRZ 코드를 촬영하세요', zh: '拍摄护照底部的MRZ码', en: 'Scan the MRZ code at the bottom of your passport', ja: 'パスポート下部のMRZコードを撮影してください' },
  privacy: { ko: '여권 정보는 이 기기에만 저장됩니다. 서버로 전송되지 않습니다.', zh: '护照信息仅保存在此设备上，不会发送到服务器。', en: 'Passport data is stored on this device only. Never sent to any server.', ja: 'パスポート情報はこのデバイスにのみ保存されます。サーバーには送信されません。' },
  scan: { ko: '여권 촬영', zh: '拍摄护照', en: 'Scan Passport', ja: 'パスポート撮影' },
  manual: { ko: '직접 입력', zh: '手动输入', en: 'Enter Manually', ja: '手動入力' },
  analyzing: { ko: '분석 중...', zh: '分析中...', en: 'Analyzing...', ja: '分析中...' },
  result: { ko: '스캔 결과', zh: '扫描结果', en: 'Scan Result', ja: 'スキャン結果' },
  name: { ko: '이름', zh: '姓名', en: 'Name', ja: '氏名' },
  nationality: { ko: '국적', zh: '国籍', en: 'Nationality', ja: '国籍' },
  passportNo: { ko: '여권번호', zh: '护照号', en: 'Passport No.', ja: 'パスポート番号' },
  expiry: { ko: '만료일', zh: '有效期', en: 'Expiry', ja: '有効期限' },
  visa: { ko: '비자 요건', zh: '签证要求', en: 'Visa Requirement', ja: 'ビザ要件' },
  embassy: { ko: '대사관', zh: '大使馆', en: 'Embassy', ja: '大使館' },
  tips: { ko: '맞춤 여행 팁', zh: '个性化旅行提示', en: 'Personalized Tips', ja: 'カスタマイズ旅行ヒント' },
  lang: { ko: '추천 언어', zh: '推荐语言', en: 'Recommended Language', ja: '推奨言語' },
  apply: { ko: '이 설정으로 시작하기', zh: '使用此设置开始', en: 'Start with these settings', ja: 'この設定で開始' },
  skip: { ko: '나중에 하기', zh: '稍后再说', en: 'Skip for now', ja: '後で' },
  mrzLine1: { ko: 'MRZ 첫째 줄 (P<...)', zh: 'MRZ第一行 (P<...)', en: 'MRZ Line 1 (P<...)', ja: 'MRZ1行目 (P<...)' },
  mrzLine2: { ko: 'MRZ 둘째 줄', zh: 'MRZ第二行', en: 'MRZ Line 2', ja: 'MRZ2行目' },
  parse: { ko: '분석', zh: '解析', en: 'Parse', ja: '解析' },
  parseError: { ko: 'MRZ를 인식할 수 없습니다. 다시 시도해주세요.', zh: '无法识别MRZ，请重试。', en: 'Could not parse MRZ. Please try again.', ja: 'MRZを認識できません。もう一度お試しください。' },
  langNames: { ko: '한국어', zh: '中文', en: 'English', ja: '日本語' },
}

const VISA_TYPE_ICONS = {
  'visa-free-90': { color: 'text-emerald-600', bg: 'bg-emerald-50', icon: Check },
  'k-eta': { color: 'text-blue-600', bg: 'bg-blue-50', icon: Globe },
  'visa': { color: 'text-amber-600', bg: 'bg-amber-50', icon: AlertTriangle },
  'check': { color: 'text-gray-600', bg: 'bg-gray-50', icon: AlertTriangle },
}

export default function PassportScan({ lang, onComplete, onSkip }) {
  const [mode, setMode] = useState('intro') // intro | manual | result
  const [mrzLine1, setMrzLine1] = useState('')
  const [mrzLine2, setMrzLine2] = useState('')
  const [profileData, setProfileData] = useState(null)
  const [error, setError] = useState(null)
  const cameraRef = useRef(null)

  function handleParse() {
    setError(null)
    const parsed = parseMRZ(mrzLine1.trim(), mrzLine2.trim())
    if (!parsed) {
      setError(true)
      return
    }
    const profile = buildProfileFromMRZ(parsed)
    setProfileData(profile)
    setMode('result')
  }

  function handleCameraCapture() {
    // TODO: Integrate react-native-mrz-scanner or Tesseract.js OCR for MRZ extraction
    // For now, switch to manual mode
    setMode('manual')
  }

  function handleApply() {
    if (profileData && onComplete) {
      onComplete(profileData)
    }
  }

  // Intro screen
  if (mode === 'intro') {
    return (
      <div className="space-y-6 pb-8">
        <div className="text-center pt-4">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-[#F3F4F6] flex items-center justify-center">
            <FileText size={32} className="text-[#111827]" />
          </div>
          <h2 className="text-lg font-bold text-[#111827]">{L(lang, TEXTS.title)}</h2>
          <p className="text-xs text-[#6B7280] mt-2 px-6">{L(lang, TEXTS.subtitle)}</p>
        </div>

        {/* Privacy notice */}
        <div className="mx-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 flex items-start gap-2">
          <Shield size={16} className="text-emerald-600 mt-0.5 shrink-0" />
          <p className="text-xs text-emerald-700">{L(lang, TEXTS.privacy)}</p>
        </div>

        {/* MRZ example illustration */}
        <div className="mx-4 p-4 rounded-xl bg-[#F9FAFB] border border-[#E5E7EB]">
          <div className="bg-[#1A1A1A] rounded-lg p-3 font-mono text-[10px] text-green-400 leading-relaxed overflow-x-auto">
            <div>P&lt;CHNZHANG&lt;&lt;XIAOMING&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;</div>
            <div>E12345678&lt;6CHN9001011M3012315&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;02</div>
          </div>
          <p className="text-[10px] text-[#9CA3AF] mt-2 text-center">{L(lang, { ko: '여권 하단 두 줄 (MRZ)', zh: '护照底部两行（MRZ）', en: 'Two lines at bottom of passport (MRZ)', ja: 'パスポート下部の2行（MRZ）' })}</p>
        </div>

        {/* Action buttons */}
        <div className="px-4 space-y-3">
          <button
            onClick={handleCameraCapture}
            className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-[#111827] text-white text-sm font-medium"
          >
            <Camera size={18} />
            {L(lang, TEXTS.scan)}
          </button>
          <button
            onClick={() => setMode('manual')}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-[#E5E7EB] text-[#374151] text-sm font-medium"
          >
            {L(lang, TEXTS.manual)}
          </button>
          {onSkip && (
            <button onClick={onSkip} className="w-full py-2 text-xs text-[#9CA3AF]">
              {L(lang, TEXTS.skip)}
            </button>
          )}
        </div>
      </div>
    )
  }

  // Manual MRZ input
  if (mode === 'manual') {
    return (
      <div className="space-y-4 pb-8">
        <div className="text-center pt-4">
          <h2 className="text-lg font-bold text-[#111827]">{L(lang, TEXTS.manual)}</h2>
          <p className="text-xs text-[#6B7280] mt-1">{L(lang, { ko: '여권 하단의 두 줄을 입력하세요', zh: '请输入护照底部的两行', en: 'Enter the two lines at the bottom of your passport', ja: 'パスポート下部の2行を入力してください' })}</p>
        </div>

        <div className="mx-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 flex items-start gap-2">
          <Shield size={16} className="text-emerald-600 mt-0.5 shrink-0" />
          <p className="text-xs text-emerald-700">{L(lang, TEXTS.privacy)}</p>
        </div>

        <div className="px-4 space-y-3">
          <div>
            <label className="text-xs text-[#6B7280] mb-1 block">{L(lang, TEXTS.mrzLine1)}</label>
            <input
              type="text"
              value={mrzLine1}
              onChange={e => setMrzLine1(e.target.value.toUpperCase())}
              placeholder="P<CHNZHANG<<XIAOMING<<<<<<<<<<<<<<<<<"
              className="w-full px-3 py-2.5 rounded-lg border border-[#E5E7EB] font-mono text-xs focus:outline-none focus:border-[#111827]"
            />
          </div>
          <div>
            <label className="text-xs text-[#6B7280] mb-1 block">{L(lang, TEXTS.mrzLine2)}</label>
            <input
              type="text"
              value={mrzLine2}
              onChange={e => setMrzLine2(e.target.value.toUpperCase())}
              placeholder="E12345678<6CHN9001011M3012315<<<<<<<<<<02"
              className="w-full px-3 py-2.5 rounded-lg border border-[#E5E7EB] font-mono text-xs focus:outline-none focus:border-[#111827]"
            />
          </div>

          {error && (
            <p className="text-xs text-red-500 text-center">{L(lang, TEXTS.parseError)}</p>
          )}

          <button
            onClick={handleParse}
            disabled={!mrzLine1.trim() || !mrzLine2.trim()}
            className="w-full py-3 rounded-xl bg-[#111827] text-white text-sm font-medium disabled:opacity-30"
          >
            {L(lang, TEXTS.parse)}
          </button>
          <button onClick={() => setMode('intro')} className="w-full py-2 text-xs text-[#9CA3AF]">
            {L(lang, { ko: '뒤로', zh: '返回', en: 'Back', ja: '戻る' })}
          </button>
        </div>
      </div>
    )
  }

  // Result screen
  if (mode === 'result' && profileData) {
    const visa = profileData.visaRequirement
    const visaStyle = VISA_TYPE_ICONS[visa.type] || VISA_TYPE_ICONS.check
    const VisaIcon = visaStyle.icon
    const embassy = profileData.embassy
    const tips = profileData.tips
    const recLang = profileData.recommendedLang

    return (
      <div className="space-y-4 pb-8">
        <div className="text-center pt-4">
          <div className="w-14 h-14 mx-auto mb-3 rounded-full bg-emerald-50 flex items-center justify-center">
            <Check size={28} className="text-emerald-600" />
          </div>
          <h2 className="text-lg font-bold text-[#111827]">{L(lang, TEXTS.result)}</h2>
        </div>

        {/* Profile info */}
        <div className="mx-4 p-4 rounded-xl border border-[#E5E7EB] space-y-3">
          {[
            { label: TEXTS.name, value: profileData.name },
            { label: TEXTS.nationality, value: profileData.nationality },
            { label: TEXTS.passportNo, value: profileData.passportNumber.replace(/(.{3})/g, '$1 ').trim() },
            { label: TEXTS.expiry, value: profileData.passportExpiry },
          ].map((row, i) => (
            <div key={i} className="flex justify-between text-sm">
              <span className="text-[#6B7280]">{L(lang, row.label)}</span>
              <span className="font-medium text-[#111827]">{row.value}</span>
            </div>
          ))}
        </div>

        {/* Visa requirement */}
        <div className={`mx-4 p-4 rounded-xl ${visaStyle.bg} border ${visaStyle.bg.replace('bg-', 'border-')}`}>
          <div className="flex items-center gap-2 mb-1">
            <VisaIcon size={16} className={visaStyle.color} />
            <span className={`text-sm font-bold ${visaStyle.color}`}>{L(lang, TEXTS.visa)}</span>
          </div>
          <p className={`text-xs ${visaStyle.color}`}>{L(lang, visa.desc)}</p>
        </div>

        {/* Recommended language */}
        <div className="mx-4 p-4 rounded-xl border border-[#E5E7EB] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Globe size={16} className="text-[#6B7280]" />
            <span className="text-sm text-[#6B7280]">{L(lang, TEXTS.lang)}</span>
          </div>
          <span className="text-sm font-medium text-[#111827]">{TEXTS.langNames[recLang] || recLang}</span>
        </div>

        {/* Embassy */}
        {embassy && (
          <div className="mx-4 p-4 rounded-xl border border-[#E5E7EB]">
            <div className="flex items-center gap-2 mb-2">
              <Phone size={14} className="text-[#6B7280]" />
              <span className="text-sm font-bold text-[#111827]">{L(lang, TEXTS.embassy)}</span>
            </div>
            <p className="text-xs text-[#374151]">{L(lang, embassy.name)}</p>
            <p className="text-xs text-[#6B7280] mt-0.5">{embassy.phone}</p>
            <p className="text-xs text-[#9CA3AF]">{embassy.address}</p>
          </div>
        )}

        {/* Tips */}
        {tips.length > 0 && (
          <div className="mx-4 p-4 rounded-xl border border-[#E5E7EB]">
            <p className="text-sm font-bold text-[#111827] mb-2">{L(lang, TEXTS.tips)}</p>
            <div className="space-y-2">
              {tips.map((tip, i) => (
                <div key={i} className="flex items-start gap-2">
                  <ChevronRight size={12} className="text-[#9CA3AF] mt-0.5 shrink-0" />
                  <p className="text-xs text-[#374151]">{L(lang, tip)}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Apply button */}
        <div className="px-4 space-y-2">
          <button
            onClick={handleApply}
            className="w-full py-3.5 rounded-xl bg-[#111827] text-white text-sm font-medium"
          >
            {L(lang, TEXTS.apply)}
          </button>
          {onSkip && (
            <button onClick={onSkip} className="w-full py-2 text-xs text-[#9CA3AF]">
              {L(lang, TEXTS.skip)}
            </button>
          )}
        </div>
      </div>
    )
  }

  return null
}
