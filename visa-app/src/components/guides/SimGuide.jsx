import { useState } from 'react'
import { Wifi, QrCode, CreditCard, AlertTriangle, ExternalLink, Smartphone, MapPin, ChevronDown, ChevronUp } from 'lucide-react'
import GuideLayout from './GuideLayout'

function L(lang, d) { if (typeof d === 'string') return d; return d?.[lang] || d?.en || d?.zh || d?.ko || '' }

const card = 'bg-white rounded-2xl p-5 border border-[#E5E7EB]'

const OPTIONS = [
  {
    id: 'esim',
    icon: QrCode,
    recommended: true,
    name: { ko: 'eSIM (추천)', zh: 'eSIM（推荐）', en: 'eSIM (Recommended)' },
    price: { ko: '5,000~15,000원', zh: '5,000~15,000韩元', en: '₩5,000~15,000' },
    time: { ko: '즉시', zh: '即时', en: 'Instant' },
    who: { ko: '아이폰 XS 이상', zh: 'iPhone XS以上', en: 'iPhone XS or later' },
    pros: { ko: '가장 저렴, 즉시 개통, 물리 SIM 교체 불필요', zh: '最便宜，即时开通，无需更换实体SIM', en: 'Cheapest, instant, no physical SIM swap' },
    cons: { ko: '구형 폰 미지원, 중국산 안드로이드 일부 미지원', zh: '旧手机不支持，部分中国安卓手机不支持', en: 'Not supported on older or some Chinese Android phones' },
  },
  {
    id: 'sim',
    icon: CreditCard,
    recommended: false,
    name: { ko: '공항 SIM카드', zh: '机场SIM卡', en: 'Airport SIM Card' },
    price: { ko: '20,000~55,000원', zh: '20,000~55,000韩元', en: '₩20,000~55,000' },
    time: { ko: '5분', zh: '5分钟', en: '5 min' },
    who: { ko: '모든 폰', zh: '所有手机', en: 'All phones' },
    pros: { ko: '모든 폰 호환, 현장 도움 가능', zh: '所有手机兼容，现场有人帮忙', en: 'Works with all phones, on-site assistance' },
    cons: { ko: 'eSIM보다 비쌈, 원래 SIM 보관 필요', zh: '比eSIM贵，需要保管原SIM卡', en: 'More expensive, need to keep original SIM' },
  },
  {
    id: 'pocket',
    icon: Wifi,
    recommended: false,
    name: { ko: '포켓 와이파이', zh: '随身WiFi', en: 'Pocket WiFi' },
    price: { ko: '3,000~5,000원/일', zh: '3,000~5,000韩元/天', en: '₩3,000~5,000/day' },
    time: { ko: '수령 5분', zh: '领取5分钟', en: '5 min pickup' },
    who: { ko: '여러 기기 공유', zh: '多设备共享', en: 'Multiple devices' },
    pros: { ko: '여러 기기 동시 연결, 원래 SIM 유지', zh: '多设备同时连接，保留原SIM卡', en: 'Multiple devices, keep original SIM' },
    cons: { ko: '충전 필요, 분실 시 배상, 반납 필요', zh: '需要充电，丢失需赔偿，需要归还', en: 'Needs charging, deposit risk, must return' },
  },
]

const ESIM_PROVIDERS = [
  { name: '유심사 (Yousimsa)', price: { ko: '5일 약 1만원대', zh: '5天约1万韩元', en: '5 days ~₩10,000' }, url: 'https://www.yousimsa.com' },
  { name: '에어알로 (Airalo)', price: { ko: '1GB 약 5천원대', zh: '1GB约5千韩元', en: '1GB ~₩5,000' }, url: 'https://www.airalo.com' },
  { name: '도시락eSIM (Dosirak)', price: { ko: '무제한 3일 약 1만원대', zh: '无限流量3天约1万韩元', en: 'Unlimited 3 days ~₩10,000' }, url: 'https://www.dosirakmobile.com' },
]

const AIRPORT_SIM = [
  { loc: { ko: '인천공항 T1', zh: '仁川机场T1', en: 'Incheon T1' }, detail: { ko: '1층 도착장 KT/SKT 부스', zh: '1楼到达大厅 KT/SKT柜台', en: 'Floor 1 Arrivals, KT/SKT booth' } },
  { loc: { ko: '인천공항 T2', zh: '仁川机场T2', en: 'Incheon T2' }, detail: { ko: '1층 도착장 KT 부스', zh: '1楼到达大厅 KT柜台', en: 'Floor 1 Arrivals, KT booth' } },
  { loc: { ko: '김포공항', zh: '金浦机场', en: 'Gimpo' }, detail: { ko: '1층 도착장', zh: '1楼到达大厅', en: 'Floor 1 Arrivals' } },
]

const ESIM_STEPS = {
  iphone: [
    { ko: '설정 → 셀룰러 → eSIM 추가', zh: '设置 → 蜂窝网络 → 添加eSIM', en: 'Settings → Cellular → Add eSIM' },
    { ko: 'QR코드 스캔 또는 수동 입력', zh: '扫描QR码或手动输入', en: 'Scan QR code or enter manually' },
    { ko: '데이터 전환 → 새 eSIM 선택 → 완료!', zh: '切换数据 → 选择新eSIM → 完成！', en: 'Switch data → Select new eSIM → Done!' },
  ],
  android: [
    { ko: '설정 → 네트워크 → SIM 관리자 → eSIM 추가', zh: '设置 → 网络 → SIM管理器 → 添加eSIM', en: 'Settings → Network → SIM Manager → Add eSIM' },
    { ko: 'QR코드 스캔', zh: '扫描QR码', en: 'Scan QR code' },
    { ko: '모바일 데이터 → 새 eSIM 선택 → 완료!', zh: '移动数据 → 选择新eSIM → 完成！', en: 'Mobile data → Select new eSIM → Done!' },
  ],
}

export default function SimGuide({ lang, onClose }) {
  const [expandedOption, setExpandedOption] = useState('esim')
  const [esimDevice, setEsimDevice] = useState('iphone')

  return (
    <GuideLayout
      title={{ ko: 'SIM/eSIM 구매 가이드', zh: 'SIM/eSIM购买指南', en: 'SIM/eSIM Guide' }}
      lang={lang}
      onClose={onClose}
    >
        {/* 기준일자 */}
        <p className="text-xs text-gray-400 text-center">
          {L(lang, { ko: '정보 기준: 2026년 3월', zh: '信息基准: 2026年3月', en: 'As of March 2026' })}
        </p>

        {/* 경고 카드 */}
        <div className="bg-red-50 border border-red-200 rounded-2xl p-5">
          <div className="flex items-start gap-3">
            <Wifi size={20} className="text-red-500 shrink-0 mt-0.5" />
            <div>
              <p className="text-base font-bold text-red-700">
                {L(lang, { ko: '인터넷 없으면 아무것도 못해요!', zh: '没有网络什么都做不了！', en: 'You can\'t do anything without internet!' })}
              </p>
              <p className="text-xs text-red-600 mt-1">
                {L(lang, { ko: '카카오맵, 번역, 결제 모두 인터넷 필요', zh: 'KakaoMap、翻译、支付都需要网络', en: 'KakaoMap, translation, payment all need internet' })}
              </p>
            </div>
          </div>
        </div>

        {/* 3가지 옵션 비교 */}
        <div className="space-y-3">
          {OPTIONS.map(opt => (
            <button key={opt.id}
              onClick={() => setExpandedOption(expandedOption === opt.id ? null : opt.id)}
              className={`${card} w-full text-left transition-all duration-200 active:scale-[0.98] ${opt.recommended ? '!border-[#111827]' : ''}`}>
              <div className="flex items-center gap-3">
                <opt.icon size={24} className={opt.recommended ? 'text-[#111827]' : 'text-[#9CA3AF]'} />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-[#111827]">{L(lang, opt.name)}</span>
                    {opt.recommended && (
                      <span className="text-[10px] bg-[#111827] text-white px-2 py-0.5 rounded-full">BEST</span>
                    )}
                  </div>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-xs text-[#6B7280]">{L(lang, opt.price)}</span>
                    <span className="text-xs text-[#9CA3AF]">·</span>
                    <span className="text-xs text-[#6B7280]">{L(lang, opt.time)}</span>
                  </div>
                </div>
                {expandedOption === opt.id ? <ChevronUp size={16} className="text-[#9CA3AF]" /> : <ChevronDown size={16} className="text-[#9CA3AF]" />}
              </div>
              {expandedOption === opt.id && (
                <div className="mt-3 pt-3 border-t border-[#E5E7EB] space-y-2">
                  <p className="text-xs text-[#6B7280]"><span className="font-semibold text-[#111827]">{L(lang, { ko: '추천', zh: '推荐', en: 'For' })}:</span> {L(lang, opt.who)}</p>
                  <p className="text-xs text-green-600">✓ {L(lang, opt.pros)}</p>
                  <p className="text-xs text-red-500">✗ {L(lang, opt.cons)}</p>
                </div>
              )}
            </button>
          ))}
        </div>

        {/* eSIM 추천 업체 */}
        <div className={card}>
          <h3 className="text-sm font-bold text-[#111827] mb-3 flex items-center gap-2">
            <QrCode size={16} />
            {L(lang, { ko: 'eSIM 추천 업체', zh: 'eSIM推荐商家', en: 'Recommended eSIM Providers' })}
          </h3>
          <div className="space-y-3">
            {ESIM_PROVIDERS.map((p, i) => (
              <div key={i} className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-[#111827]">{p.name}</p>
                  <p className="text-xs text-[#6B7280]">{L(lang, p.price)}</p>
                </div>
                <a href={p.url} target="_blank" rel="noopener noreferrer"
                  className="text-sm text-blue-600 underline flex items-center gap-1">
                  {L(lang, { ko: '최신 가격 확인', zh: '查看最新价格', en: 'Check price' })}
                  <ExternalLink size={12} />
                </a>
              </div>
            ))}
          </div>
          <p className="text-[10px] text-gray-400 mt-3">
            {L(lang, { ko: '※ 가격은 참고용이며, 실제 가격은 구매 시점에 확인하세요.', zh: '※ 价格仅供参考，请在购买时确认实际价格。', en: '※ Prices are approximate. Please verify at time of purchase.' })}
          </p>
        </div>

        {/* 공항 SIM 구매 위치 */}
        <div className={card}>
          <h3 className="text-sm font-bold text-[#111827] mb-3 flex items-center gap-2">
            <MapPin size={16} />
            {L(lang, { ko: '공항 SIM 구매 위치', zh: '机场SIM卡购买地点', en: 'Airport SIM Locations' })}
          </h3>
          <div className="space-y-2">
            {AIRPORT_SIM.map((a, i) => (
              <div key={i} className="flex items-start gap-2">
                <span className="text-xs font-bold text-white bg-[#111827] w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5">{i + 1}</span>
                <div>
                  <p className="text-sm font-semibold text-[#111827]">{L(lang, a.loc)}</p>
                  <p className="text-xs text-[#6B7280]">{L(lang, a.detail)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* eSIM 설정 방법 */}
        <div className={card}>
          <h3 className="text-sm font-bold text-[#111827] mb-3 flex items-center gap-2">
            <Smartphone size={16} />
            {L(lang, { ko: 'eSIM 설정 방법', zh: 'eSIM设置方法', en: 'eSIM Setup' })}
          </h3>
          <div className="flex gap-2 mb-3">
            <button onClick={() => setEsimDevice('iphone')}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${esimDevice === 'iphone' ? 'bg-[#111827] text-white' : 'bg-[#F3F4F6] text-[#6B7280]'}`}>
              iPhone
            </button>
            <button onClick={() => setEsimDevice('android')}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${esimDevice === 'android' ? 'bg-[#111827] text-white' : 'bg-[#F3F4F6] text-[#6B7280]'}`}>
              Android
            </button>
          </div>
          <div className="space-y-2">
            {ESIM_STEPS[esimDevice].map((step, i) => (
              <div key={i} className="flex items-start gap-2">
                <span className="text-xs font-bold text-white bg-[#111827] w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5">{i + 1}</span>
                <p className="text-sm text-[#374151]">{L(lang, step)}</p>
              </div>
            ))}
          </div>
        </div>

        {/* 주의: 로밍 vs SIM */}
        <div className="bg-[#FFFBEB] border border-[#FDE68A] rounded-2xl p-4">
          <div className="flex items-start gap-2">
            <AlertTriangle size={16} className="text-[#F59E0B] shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-[#111827] mb-1">
                {L(lang, { ko: '중국 번호 로밍 vs 한국 SIM', zh: '中国号码漫游 vs 韩国SIM', en: 'Chinese Roaming vs Korean SIM' })}
              </p>
              <div className="text-xs text-[#374151] space-y-1">
                <p>{L(lang, { ko: '• 로밍: 문자 수신 가능(인증용), 비쌈', zh: '• 漫游：可接收短信（验证用），贵', en: '• Roaming: Can receive SMS (for verification), expensive' })}</p>
                <p>{L(lang, { ko: '• 한국 SIM: 저렴, 중국 문자 수신 불가', zh: '• 韩国SIM：便宜，无法接收中国短信', en: '• Korean SIM: Cheap, can\'t receive Chinese SMS' })}</p>
                <p className="font-semibold">{L(lang, { ko: '💡 추천: eSIM(데이터) + 중국 SIM(문자수신) 듀얼', zh: '💡 推荐：eSIM(数据) + 中国SIM(接收短信) 双卡', en: '💡 Best: eSIM (data) + Chinese SIM (SMS) dual' })}</p>
              </div>
            </div>
          </div>
        </div>

        {/* 출처 + 푸터 */}
        <p className="text-[10px] text-gray-400 text-center">
          {L(lang, { ko: '출처: 각 통신사 공식 사이트', zh: '来源：各运营商官方网站', en: 'Source: Official carrier websites' })}
        </p>
        <p className="text-xs text-gray-400 text-center mt-8">
          {L(lang, { ko: '정보 기준: 2026년 3월 | 문의: hanpocket@email.com', zh: '信息基准: 2026年3月 | 联系: hanpocket@email.com', en: 'As of March 2026 | Contact: hanpocket@email.com' })}
        </p>
    </GuideLayout>
  )
}
