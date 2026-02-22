import { useState } from 'react'
import { 
  CreditCard, Phone, MapPin, Car, Home, Calculator, 
  Clock, Wifi, Zap, FileText, Building, Users, 
  Search, ExternalLink, Copy, Check, Globe, AlertCircle 
} from 'lucide-react'

function L(lang, data) {
  if (typeof data === 'string') return data
  return data?.[lang] || data?.en || data?.zh || data?.ko || ''
}

// 생활 도구 데이터
const lifeToolsData = {
  categories: [
    {
      id: 'banking',
      name: { ko: '은행 & 금융', zh: '银行&金融', en: 'Banking & Finance' },
      icon: CreditCard,
      tools: [
        {
          name: { ko: '계좌개설 필수서류', zh: '开户必需文件', en: 'Account Opening Documents' },
          items: [
            { ko: '외국인등록증 (체류 6개월 이상)', zh: '外国人登记证（居住6个月以上）', en: 'Alien Registration Card (6+ months stay)' },
            { ko: '여권', zh: '护照', en: 'Passport' },
            { ko: '도장 (또는 서명)', zh: '印章（或签名）', en: 'Seal or Signature' },
            { ko: '초기 입금액 (1만원~)', zh: '初始存款（1万韩元起）', en: 'Initial deposit (from ₩10,000)' },
            { ko: '재직/학업 증명서', zh: '在职/在学证明', en: 'Employment/Study Certificate' }
          ]
        },
        {
          name: { ko: '주요 은행 연락처', zh: '主要银行联系方式', en: 'Major Bank Contacts' },
          items: [
            { name: 'KB국민은행', phone: '1599-9999', features: { ko: '중국어 상담 가능', zh: '可中文咨询', en: 'Chinese service available' } },
            { name: '우리은행', phone: '1599-0800', features: { ko: '외국인 전용창구', zh: '外国人专用窗口', en: 'Foreigner counter' } },
            { name: '신한은행', phone: '1599-8000', features: { ko: '글로벌 서비스', zh: '全球服务', en: 'Global service' } },
            { name: '하나은행', phone: '1599-1111', features: { ko: '다국어 지원', zh: '多语言支持', en: 'Multi-language support' } }
          ]
        }
      ]
    },
    {
      id: 'telecom',
      name: { ko: '통신 & 인터넷', zh: '通信&网络', en: 'Telecom & Internet' },
      icon: Phone,
      tools: [
        {
          name: { ko: '휴대폰 개통 가이드', zh: '手机开通指南', en: 'Mobile Phone Setup Guide' },
          items: [
            { ko: '선불요금제: 신분증만으로 즉시 개통 가능', zh: '预付费套餐：仅凭身份证即可开通', en: 'Prepaid: Instant activation with ID only' },
            { ko: '후불요금제: 외국인등록증 + 통장 필요', zh: '后付费套餐：需外国人登记证+银行账户', en: 'Postpaid: Requires ARC + bank account' },
            { ko: 'SKT: 1599-0011 (중국어 1599-0013)', zh: 'SKT: 1599-0011（中文 1599-0013）', en: 'SKT: 1599-0011 (Chinese 1599-0013)' },
            { ko: 'KT: 100 (중국어 1588-0010)', zh: 'KT: 100（中文 1588-0010）', en: 'KT: 100 (Chinese 1588-0010)' },
            { ko: 'LG U+: 1544-0010', zh: 'LG U+: 1544-0010', en: 'LG U+: 1544-0010' }
          ]
        },
        {
          name: { ko: '인터넷 설치', zh: '网络安装', en: 'Internet Installation' },
          items: [
            { ko: '임대차계약서 또는 거주증명서 필요', zh: '需租房合同或居住证明', en: 'Lease contract or residence proof required' },
            { ko: '설치 기간: 신청 후 3~7일', zh: '安装周期：申请后3-7天', en: 'Installation: 3-7 days after application' },
            { ko: 'KT 인터넷: 100', zh: 'KT 网络: 100', en: 'KT Internet: 100' },
            { ko: 'SK브로드밴드: 106', zh: 'SK宽带: 106', en: 'SK Broadband: 106' },
            { ko: 'LG헬로비전: 1588-3002', zh: 'LG HelloVision: 1588-3002', en: 'LG HelloVision: 1588-3002' }
          ]
        }
      ]
    },
    {
      id: 'transport',
      name: { ko: '교통 & 이동', zh: '交通&出行', en: 'Transport & Travel' },
      icon: Car,
      tools: [
        {
          name: { ko: '교통카드 충전소', zh: '交通卡充值处', en: 'Transit Card Top-up' },
          items: [
            { ko: '지하철역 충전기 (현금/카드)', zh: '地铁站充值机（现金/卡）', en: 'Subway station machines (cash/card)' },
            { ko: '편의점 (CU, GS25, 세븐일레븐)', zh: '便利店（CU, GS25, 7-Eleven）', en: 'Convenience stores (CU, GS25, 7-Eleven)' },
            { ko: '카카오페이/네이버페이 앱', zh: 'KakaoPay/NaverPay App', en: 'KakaoPay/NaverPay App' },
            { ko: '티머니 고객센터: 1644-0088', zh: 'T-money客服：1644-0088', en: 'T-money Customer Service: 1644-0088' }
          ]
        },
        {
          name: { ko: '택시 앱 사용법', zh: '打车App使用方法', en: 'Taxi App Usage' },
          items: [
            { ko: '카카오T: 목적지 입력 → 호출 → 탑승', zh: 'KakaoT：输入目的地→呼叫→上车', en: 'KakaoT: Enter destination → Call → Board' },
            { ko: 'TADA: 프리미엄 택시 서비스', zh: 'TADA：高端出租车服务', en: 'TADA: Premium taxi service' },
            { ko: '우버: 서울 일부 지역만 운영', zh: 'Uber：仅在首尔部分地区运营', en: 'Uber: Limited areas in Seoul only' },
            { ko: '결제: 카드/현금/앱 결제', zh: '付款：卡/现金/App支付', en: 'Payment: Card/Cash/App payment' }
          ]
        }
      ]
    },
    {
      id: 'housing',
      name: { ko: '주거 & 부동산', zh: '住房&房地产', en: 'Housing & Real Estate' },
      icon: Home,
      tools: [
        {
          name: { ko: '집구하기 사이트', zh: '找房网站', en: 'House Hunting Sites' },
          items: [
            { name: '직방', url: 'https://www.zigbang.com', desc: { ko: '원룸, 투룸 전문', zh: '单间、两居室专业', en: 'Studio & 2-room specialist' } },
            { name: '다방', url: 'https://www.dabangapp.com', desc: { ko: '실시간 매물 정보', zh: '实时房源信息', en: 'Real-time property info' } },
            { name: '네이버 부동산', url: 'https://land.naver.com', desc: { ko: '종합 부동산 플랫폼', zh: '综合房地产平台', en: 'Comprehensive real estate platform' } },
            { name: '청년 전세 임대', url: 'https://www.lh.or.kr', desc: { ko: 'LH 청년 지원 주택', zh: 'LH青年支援住房', en: 'LH Youth Support Housing' } }
          ]
        },
        {
          name: { ko: '계약 시 주의사항', zh: '签约注意事项', en: 'Contract Precautions' },
          items: [
            { ko: '등기부등본 확인 (소유권, 근저당권)', zh: '确认不动产登记簿（所有权、抵押权）', en: 'Check property register (ownership, mortgage)' },
            { ko: '보증금 반환보증보험 가입', zh: '加入保证金返还保证保险', en: 'Subscribe to deposit return insurance' },
            { ko: '관리비 별도 여부 확인', zh: '确认管理费是否另计', en: 'Check if maintenance fee is separate' },
            { ko: '계약서 한국어/중국어 번역본 보관', zh: '保存合同韩文/中文翻译版', en: 'Keep Korean/Chinese contract translation' }
          ]
        }
      ]
    },
    {
      id: 'utilities',
      name: { ko: '공과금 & 세금', zh: '公用事业&税务', en: 'Utilities & Taxes' },
      icon: Zap,
      tools: [
        {
          name: { ko: '공과금 납부 방법', zh: '公用事业费缴费方式', en: 'Utility Payment Methods' },
          items: [
            { ko: '자동이체: 은행 앱에서 설정', zh: '自动扣款：银行App设置', en: 'Auto-pay: Set up in bank app' },
            { ko: '편의점 납부: 고지서 지참', zh: '便利店缴费：携带缴费单', en: 'Convenience store: Bring bill' },
            { ko: '인터넷 납부: 각 공사 홈페이지', zh: '网上缴费：各公司官网', en: 'Online payment: Company websites' },
            { ko: '한국전력공사: 123 (전기)', zh: '韩国电力公社：123（电费）', en: 'KEPCO: 123 (electricity)' },
            { ko: '한국가스공사: 1588-0599 (가스)', zh: '韩国燃气公社：1588-0599（燃气）', en: 'KOGAS: 1588-0599 (gas)' },
            { ko: '수도사업소: 지역별 상이', zh: '自来水公司：因地区而异', en: 'Water works: Varies by region' }
          ]
        }
      ]
    },
    {
      id: 'calculator',
      name: { ko: '계산기 도구', zh: '计算器工具', en: 'Calculator Tools' },
      icon: Calculator,
      tools: [
        {
          name: { ko: '환율 계산기', zh: '汇率计算器', en: 'Currency Converter' },
          type: 'currency_converter'
        },
        {
          name: { ko: '보증금 계산기', zh: '保证金计算器', en: 'Deposit Calculator' },
          type: 'deposit_calculator'
        }
      ]
    }
  ]
}

export default function LifeToolsTab({ lang, setTab }) {
  const [activeCategory, setActiveCategory] = useState('banking')
  const [copiedText, setCopiedText] = useState('')
  const [currencyAmount, setCurrencyAmount] = useState('')
  const [depositAmount, setDepositAmount] = useState('')

  const copyToClipboard = (text) => {
    navigator.clipboard?.writeText(text)
    setCopiedText(text)
    setTimeout(() => setCopiedText(''), 2000)
  }

  const currentCategory = lifeToolsData.categories.find(cat => cat.id === activeCategory)

  // 환율 계산 (2026년 2월 기준 대략적 환율)
  const exchangeRate = 1350 // 1 CNY = 1350 KRW
  const convertedAmount = currencyAmount ? (parseFloat(currencyAmount) * exchangeRate).toLocaleString() : ''

  // 보증금 계산 (대략적 공식)
  const monthlyRent = depositAmount ? Math.floor(parseFloat(depositAmount) / 10 * 0.8).toLocaleString() : ''

  return (
    <div className="space-y-4 animate-fade-up pb-4">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-[#111827] tracking-tight">
          {L(lang, { ko: '생활 도구.', zh: '生活工具。', en: 'Life Tools.' })}
        </h1>
        <p className="text-sm text-[#6B7280] mt-1">
          {L(lang, { ko: '한국 생활에 꼭 필요한 실용 도구.', zh: '韩国生活必需的实用工具。', en: 'Essential tools for Korean life.' })}
        </p>
      </div>

      {/* 카테고리 탭 */}
      <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
        {lifeToolsData.categories.map(category => {
          const IconComponent = category.icon
          return (
            <button
              key={category.id}
              onClick={() => setActiveCategory(category.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
                activeCategory === category.id
                  ? 'bg-[#111827] text-white'
                  : 'bg-[#F3F4F6] text-[#6B7280] hover:bg-[#E5E7EB]'
              }`}
            >
              <IconComponent size={16} />
              {L(lang, category.name)}
            </button>
          )
        })}
      </div>

      {/* 콘텐츠 */}
      <div className="space-y-4">
        {currentCategory?.tools.map((tool, idx) => (
          <div key={idx} className="bg-white border border-[#E5E7EB] rounded-lg p-4">
            <h3 className="text-sm font-semibold text-[#111827] mb-3">{L(lang, tool.name)}</h3>
            
            {/* 계산기 도구 */}
            {tool.type === 'currency_converter' && (
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <input
                    type="number"
                    placeholder={L(lang, { ko: 'CNY 금액 입력', zh: '输入人民币金额', en: 'Enter CNY amount' })}
                    value={currencyAmount}
                    onChange={(e) => setCurrencyAmount(e.target.value)}
                    className="flex-1 px-3 py-2 text-sm border border-[#D1D5DB] rounded-lg focus:ring-2 focus:ring-[#DBEAFE] focus:border-[#3B82F6]"
                  />
                  <span className="text-sm text-[#6B7280]">CNY</span>
                </div>
                {convertedAmount && (
                  <div className="bg-[#F3F4F6] rounded-lg p-3">
                    <div className="text-sm text-[#6B7280]">
                      {L(lang, { ko: '한국 원화', zh: '韩元', en: 'Korean Won' })}
                    </div>
                    <div className="text-lg font-bold text-[#111827]">₩{convertedAmount}</div>
                    <div className="text-xs text-[#9CA3AF] mt-1">
                      {L(lang, { ko: '환율: 1 CNY = 1,350 KRW (참고용)', zh: '汇率：1人民币=1,350韩元（参考）', en: 'Rate: 1 CNY = 1,350 KRW (reference)' })}
                    </div>
                  </div>
                )}
              </div>
            )}
            
            {tool.type === 'deposit_calculator' && (
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <input
                    type="number"
                    placeholder={L(lang, { ko: '전세금 입력 (만원)', zh: '输入保证金（万韩元）', en: 'Enter deposit (10K KRW)' })}
                    value={depositAmount}
                    onChange={(e) => setDepositAmount(e.target.value)}
                    className="flex-1 px-3 py-2 text-sm border border-[#D1D5DB] rounded-lg focus:ring-2 focus:ring-[#DBEAFE] focus:border-[#3B82F6]"
                  />
                  <span className="text-sm text-[#6B7280]">{L(lang, { ko: '만원', zh: '万韩元', en: '10K KRW' })}</span>
                </div>
                {monthlyRent && (
                  <div className="bg-[#F3F4F6] rounded-lg p-3">
                    <div className="text-sm text-[#6B7280]">
                      {L(lang, { ko: '예상 월세', zh: '预计月租', en: 'Estimated Monthly Rent' })}
                    </div>
                    <div className="text-lg font-bold text-[#111827]">₩{monthlyRent}</div>
                    <div className="text-xs text-[#9CA3AF] mt-1">
                      {L(lang, { ko: '대략적 계산 (실제와 차이 있을 수 있음)', zh: '大概计算（与实际可能有差异）', en: 'Rough calculation (may differ from actual)' })}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* 일반 리스트 도구 */}
            {!tool.type && (
              <div className="space-y-2">
                {tool.items?.map((item, itemIdx) => (
                  <div key={itemIdx} className="flex items-start gap-3 p-3 bg-[#F9FAFB] rounded-lg">
                    <div className="flex-1 min-w-0">
                      {typeof item === 'string' ? (
                        <span className="text-sm text-[#374151]">{L(lang, item)}</span>
                      ) : item.name ? (
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-sm font-medium text-[#111827]">{item.name}</span>
                            {item.phone && (
                              <button
                                onClick={() => copyToClipboard(item.phone)}
                                className="flex items-center gap-1 px-2 py-1 text-xs bg-blue-50 text-blue-600 rounded hover:bg-blue-100 transition-colors"
                              >
                                {copiedText === item.phone ? <Check size={12} /> : <Copy size={12} />}
                                {item.phone}
                              </button>
                            )}
                          </div>
                          {item.features && <p className="text-xs text-[#6B7280]">{L(lang, item.features)}</p>}
                          {item.desc && <p className="text-xs text-[#6B7280]">{L(lang, item.desc)}</p>}
                          {item.url && (
                            <a href={item.url} target="_blank" rel="noopener noreferrer" 
                               className="inline-flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 mt-1">
                              <ExternalLink size={12} />
                              {L(lang, { ko: '사이트 방문', zh: '访问网站', en: 'Visit Site' })}
                            </a>
                          )}
                        </div>
                      ) : (
                        <span className="text-sm text-[#374151]">{L(lang, item)}</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* 주의사항 */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex items-start gap-2">
          <AlertCircle size={16} className="text-yellow-600 mt-0.5 shrink-0" />
          <div className="text-sm text-yellow-800">
            <p className="font-semibold mb-1">
              {L(lang, { ko: '⚠️ 주의사항', zh: '⚠️ 注意事项', en: '⚠️ Important Notice' })}
            </p>
            <p>
              {L(lang, { 
                ko: '이 정보는 2026년 2월 기준이며, 실제 상황과 다를 수 있습니다. 정확한 정보는 해당 기관에 직접 문의하세요.', 
                zh: '此信息基于2026年2月，与实际情况可能有所不同。准确信息请直接咨询相关机构。', 
                en: 'This information is as of February 2026 and may differ from actual situations. Please contact relevant institutions for accurate information.' 
              })}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
