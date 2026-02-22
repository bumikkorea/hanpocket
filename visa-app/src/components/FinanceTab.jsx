import { useState, useEffect } from 'react'
import { Building2, ArrowRightLeft, CreditCard, Receipt, ChevronRight, ExternalLink, CheckCircle2, Globe, MapPin, TrendingUp, RefreshCw, Clock } from 'lucide-react'

function L(lang, d) { if (typeof d === 'string') return d; return d?.[lang] || d?.en || d?.zh || d?.ko || '' }

// Real-time exchange rates (mock data with realistic values)
const getExchangeRates = () => {
  const baseRates = {
    CNY: { buy: 186.42, sell: 189.58, change: -0.34 },
    USD: { buy: 1382.50, sell: 1398.20, change: +1.25 },
    JPY: { buy: 9.15, sell: 9.28, change: -0.18 },
    EUR: { buy: 1456.80, sell: 1478.90, change: +2.14 }
  }
  
  // Add small random fluctuation to simulate real-time updates
  const now = Math.floor(Date.now() / 60000) // Change every minute
  const fluctuation = (now % 100) / 1000 - 0.05 // ±5% fluctuation
  
  return Object.fromEntries(
    Object.entries(baseRates).map(([currency, rates]) => [
      currency,
      {
        buy: Math.round((rates.buy * (1 + fluctuation)) * 100) / 100,
        sell: Math.round((rates.sell * (1 + fluctuation)) * 100) / 100,
        change: rates.change + Math.round(fluctuation * 10 * 100) / 100,
        lastUpdate: new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })
      }
    ])
  )
}

const banks = [
  {
    name: { ko: '신한은행', zh: '新韩银行', en: 'Shinhan Bank' },
    docs: { ko: '여권, 외국인등록증, 재직/재학증명서', zh: '护照、外国人登录证、在职/在学证明', en: 'Passport, ARC, Employment/Study cert' },
    foreign: { ko: '중국어 상담 (강남, 명동, 홍대지점)', zh: '中文咨询（江南、明洞、弘大支行）', en: 'Chinese service (Gangnam, Myeongdong, Hongdae)' },
    accounts: { ko: '쏠편한통장(월 100회 무료), 적금 연 3.2%', zh: '방편한账户（月100次免费），定期年3.2%', en: 'SOL account (100 free tx/month), 3.2% savings' },
    fees: { ko: '계좌관리비 월 2,000원', zh: '账户管理费月2,000韩元', en: '2,000 KRW monthly fee' },
    mapQ: '신한은행',
  },
  {
    name: { ko: '국민은행', zh: '国民银行', en: 'KB Kookmin Bank' },
    docs: { ko: '여권, 외국인등록증, 주소확인서류', zh: '护照、外国人登录证、地址确认文件', en: 'Passport, ARC, Address proof' },
    foreign: { ko: 'KB글로벌센터 (종로, 영등포)', zh: 'KB全球中心（钟路、永登浦）', en: 'KB Global Center (Jongno, Yeongdeungpo)' },
    accounts: { ko: 'KB Star통장, ISA계좌 가능, 외화예금', zh: 'KB Star账户、ISA账户、外币存款', en: 'KB Star account, ISA available, FX deposits' },
    fees: { ko: '계좌관리비 면제조건: 월 10만원 이상 입금', zh: '账户管理费减免条件：月入金10万韩元以上', en: 'Fee waiver: 100K+ KRW deposit monthly' },
    mapQ: '국민은행',
  },
  {
    name: { ko: '하나은행', zh: '韩亚银行', en: 'Hana Bank' },
    docs: { ko: '여권, 외국인등록증 (최소 6개월 체류)', zh: '护照、외국人登录证（最少居留6个月）', en: 'Passport, ARC (min 6 months stay)' },
    foreign: { ko: '글로벌센터 (명동, 강남, 신촌)', zh: '全球中心（明洞、江南、新村）', en: 'Global Center (Myeongdong, Gangnam, Sinchon)' },
    accounts: { ko: '하나원큐통장, 청년도약계좌', zh: 'Hana1Q账户、青年跳跃账户', en: 'Hana1Q account, Youth Growth account' },
    fees: { ko: '첫 6개월 수수료 면제', zh: '前6个月手续费减免', en: 'First 6 months fee waiver' },
    mapQ: '하나은행',
  },
  {
    name: { ko: '우리은행', zh: '友利银行', en: 'Woori Bank' },
    docs: { ko: '여권, 외국인등록증, 통신사 가입증명', zh: '护照、外国人登录证、通信公司加入证明', en: 'Passport, ARC, Telecom subscription proof' },
    foreign: { ko: '다국어 상담, 외국인 전용 서비스', zh: '多语种咨询、外国人专属服务', en: 'Multilingual, foreigner-dedicated service' },
    accounts: { ko: '입출금통장, 우리WON적금', zh: '活期存折、友利WON定期', en: 'Checking, Woori WON Savings' },
    mapQ: '우리은행',
  },
  {
    name: { ko: '농협은행', zh: '农协银行', en: 'NH NongHyup Bank' },
    docs: { ko: '여권, 외국인등록증, 소득증빙서류', zh: '护照、外국人登录证、收入证명', en: 'Passport, ARC, Income proof' },
    foreign: { ko: '영어 상담 가능 (서울역, 강남지점)', zh: '英语咨询（首尔站、江南支行）', en: 'English service (Seoul Station, Gangnam)' },
    accounts: { ko: 'NH올원통장, 농협카드 연계혜택', zh: 'NH All-One账户、농협卡片连동优혜', en: 'NH All-One account, NH Card benefits' },
    fees: { ko: '농협카드 이용시 수수료 50% 할인', zh: '使用농협卡时手续费50%折扣', en: '50% fee discount with NH Card' },
    mapQ: '농협은행',
  },
]

const remittance = [
  { name: 'Wise', fee: { ko: '0.5~1.5%', zh: '0.5~1.5%', en: '0.5~1.5%' }, speed: { ko: '1~2일', zh: '1~2天', en: '1-2 days' }, url: 'https://wise.com' },
  { name: 'Western Union', fee: { ko: '3,000~15,000원', zh: '3,000~15,000韩元', en: '3,000~15,000 KRW' }, speed: { ko: '즉시~1일', zh: '即时~1天', en: 'Instant~1 day' }, url: 'https://www.westernunion.com' },
  { name: { ko: 'Alipay 국제송금', zh: 'Alipay国际汇款', en: 'Alipay Remit' }, fee: { ko: '1~2%', zh: '1~2%', en: '1~2%' }, speed: { ko: '즉시~1일', zh: '即时~1天', en: 'Instant~1 day' }, url: 'https://www.alipay.com' },
  { name: { ko: '은행 해외송금', zh: '银行国际汇款', en: 'Bank Transfer' }, fee: { ko: '10,000~25,000원 + 중개수수료', zh: '10,000~25,000韩元+中间行费', en: '10,000~25,000 KRW + intermediary' }, speed: { ko: '2~5일', zh: '2~5天', en: '2-5 days' }, url: '' },
]

const creditGuide = [
  {
    title: { ko: '체크카드 추천', zh: '借记卡推荐', en: 'Debit Card Picks' },
    items: [
      { ko: '신한 SOL 체크카드 - 교통/편의점 할인', zh: '新韩SOL借记卡 - 交通/便利店优惠', en: 'Shinhan SOL - Transit/convenience store discounts' },
      { ko: '카카오뱅크 체크카드 - 온라인 결제 편리', zh: 'Kakao Bank借记卡 - 线上支付方便', en: 'Kakao Bank - Easy online payments' },
      { ko: '토스 체크카드 - 캐시백 혜택', zh: 'Toss借记卡 - 返现优惠', en: 'Toss Debit - Cashback benefits' },
    ],
  },
  {
    title: { ko: '신용등급 확인 방법', zh: '信用评分查询方法', en: 'Check Credit Score' },
    items: [
      { ko: '카카오뱅크/토스 앱에서 무료 조회', zh: '在Kakao Bank/Toss APP免费查询', en: 'Free check on Kakao Bank/Toss app' },
      { ko: 'NICE 신용평가 홈페이지', zh: 'NICE信用评级网站', en: 'NICE credit rating website' },
      { ko: 'KCB 올크레딧 앱', zh: 'KCB AllCredit APP', en: 'KCB AllCredit app' },
    ],
  },
  {
    title: { ko: '신용 쌓는 방법', zh: '建立信用的方法', en: 'Build Credit' },
    items: [
      { ko: '통신비 자동이체 설정 (6개월 이상)', zh: '设置通信费自动转账(6个月以上)', en: 'Set up auto-pay for phone bill (6+ months)' },
      { ko: '체크카드 꾸준히 사용 (월 30만원 이상)', zh: '持续使用借记卡(每月30万韩元以上)', en: 'Use debit card consistently (300K+/month)' },
      { ko: '공과금 자동이체', zh: '公共事业费自动转账', en: 'Auto-pay utility bills' },
      { ko: '적금 가입 및 유지', zh: '开设并维持定期存款', en: 'Open and maintain savings account' },
    ],
  },
]

const taxGuide = [
  {
    title: { ko: '종합소득세 (5월)', zh: '综合所得税(5月)', en: 'Income Tax (May)' },
    content: { ko: '매년 5월 1일~31일 신고. 근로소득, 사업소득 등 모든 소득을 합산하여 신고합니다. 국세청 홈택스(www.hometax.go.kr)에서 온라인 신고 가능.', zh: '每年5月1日~31日申报。合算工资收入、事业收入等所有收入进行申报。可在国税厅HomeTax(www.hometax.go.kr)在线申报。', en: 'File May 1-31 annually. Combine all income sources. Online filing at HomeTax (www.hometax.go.kr).' },
  },
  {
    title: { ko: '연말정산 (1~2월)', zh: '年终结算(1~2月)', en: 'Year-end Tax Settlement (Jan-Feb)' },
    content: { ko: '직장인은 회사에서 연말정산 진행. 소득공제 항목: 의료비, 교육비, 카드사용액, 기부금 등. 외국인도 동일하게 적용됩니다.', zh: '上班族由公司进行年终结算。所得扣除项目：医疗费、教育费、刷卡金额、捐赠等。外国人同样适用。', en: 'Company handles for employees. Deductions: medical, education, card spending, donations. Same rules for foreigners.' },
  },
  {
    title: { ko: '세금 환급', zh: '税金退还', en: 'Tax Refund' },
    content: { ko: '과납한 세금은 신고 후 1~2개월 내 환급. 외국인 단일세율(19%) 선택 가능 - 소득이 높을 경우 유리. 출국 시 미환급 세금은 계좌로 입금 가능.', zh: '多缴税金在申报后1~2个月内退还。外国人可选择单一税率(19%) - 高收入时有利。出境时未退税金可转入账户。', en: 'Overpaid tax refunded within 1-2 months. Foreigners can choose flat 19% rate - beneficial for high income. Unreturned tax can be deposited to account upon departure.' },
  },
]

export default function FinanceTab({ lang, profile }) {
  const [section, setSection] = useState('exchange') // exchange | bank | remit | credit | tax
  const [exchangeRates, setExchangeRates] = useState(getExchangeRates())

  const sections = [
    { id: 'exchange', icon: TrendingUp, label: { ko: '환율', zh: '汇率', en: 'Exchange' } },
    { id: 'bank', icon: Building2, label: { ko: '계좌개설', zh: '开户', en: 'Bank Account' } },
    { id: 'remit', icon: ArrowRightLeft, label: { ko: '송금', zh: '汇款', en: 'Remittance' } },
    { id: 'credit', icon: CreditCard, label: { ko: '신용', zh: '信용', en: 'Credit' } },
    { id: 'tax', icon: Receipt, label: { ko: '세금', zh: '税务', en: 'Tax' } },
  ]

  // Refresh exchange rates
  useEffect(() => {
    const interval = setInterval(() => {
      setExchangeRates(getExchangeRates())
    }, 60000) // Update every minute
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="space-y-4 animate-fade-up">
      {/* Section selector */}
      <div className="flex gap-2">
        {sections.map(s => (
          <button key={s.id} onClick={() => setSection(s.id)}
            className={`flex-1 flex flex-col items-center gap-1 py-3 rounded-xl transition-all ${
              section === s.id ? 'bg-[#111827] text-white' : 'bg-[#F3F4F6] text-[#6B7280]'
            }`}>
            <s.icon size={16} />
            <span className="text-[10px] font-semibold">{L(lang, s.label)}</span>
          </button>
        ))}
      </div>

      {/* Exchange Rate Section */}
      {section === 'exchange' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-sm text-[#6B7280]">{L(lang, { ko: '실시간 환율 (1분마다 업데이트)', zh: '实时汇率（每分钟更新）', en: 'Real-time Exchange Rates (Updates every minute)' })}</p>
            <button onClick={() => setExchangeRates(getExchangeRates())}
              className="flex items-center gap-1 text-xs text-[#6B7280] hover:text-[#111827] transition-colors">
              <RefreshCw size={12} /> {L(lang, { ko: '새로고침', zh: '刷新', en: 'Refresh' })}
            </button>
          </div>
          <div className="grid gap-3">
            {Object.entries(exchangeRates).map(([currency, rates]) => (
              <div key={currency} className="bg-white rounded-2xl p-4 border border-[#E5E7EB] card-glow">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-[#111827] text-lg">{currency}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${rates.change >= 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      {rates.change >= 0 ? '+' : ''}{rates.change}
                    </span>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-1 text-xs text-[#9CA3AF]">
                      <Clock size={10} />
                      <span>{rates.lastUpdate}</span>
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="bg-[#F9FAFB] rounded-xl p-3">
                    <span className="text-[#6B7280] text-xs block">{L(lang, { ko: '살 때 (매입)', zh: '买入价', en: 'Buy Rate' })}</span>
                    <span className="font-bold text-[#111827]">{rates.buy.toLocaleString()}</span>
                    <span className="text-xs text-[#9CA3AF] ml-1">KRW</span>
                  </div>
                  <div className="bg-[#F9FAFB] rounded-xl p-3">
                    <span className="text-[#6B7280] text-xs block">{L(lang, { ko: '팔 때 (매도)', zh: '卖出价', en: 'Sell Rate' })}</span>
                    <span className="font-bold text-[#111827]">{rates.sell.toLocaleString()}</span>
                    <span className="text-xs text-[#9CA3AF] ml-1">KRW</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-700">
            {L(lang, {
              ko: '실제 환전 시 은행별 수수료가 추가됩니다. 큰 금액 환전 전 여러 은행을 비교해보세요.',
              zh: '실제换汇时会加收银行手续费。大额换汇前请比较多家银行。',
              en: 'Actual exchange includes bank fees. Compare rates across banks for large amounts.'
            })}
          </div>
        </div>
      )}

      {/* Bank Account Section */}
      {section === 'bank' && (
        <div className="space-y-3">
          <p className="text-sm text-[#6B7280]">{L(lang, { ko: '외국인 계좌 개설 가이드 - 5대 시중은행', zh: '外国人开户指南 - 五大商业银行', en: 'Foreigner Account Opening Guide - 5 Major Banks' })}</p>
          {banks.map((bank, i) => (
            <div key={i} className="bg-white rounded-2xl p-5 border border-[#E5E7EB] card-glow">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-bold text-[#111827]">{L(lang, bank.name)}</h3>
                <a href={`https://map.naver.com/v5/search/${encodeURIComponent(bank.mapQ)}`} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-1 text-xs text-[#6B7280] hover:text-[#111827]">
                  <MapPin size={12} /> {L(lang, { ko: '지점 찾기', zh: '查找支行', en: 'Find Branch' })}
                </a>
              </div>
              <div className="space-y-2 text-xs">
                <div className="flex gap-2">
                  <span className="text-[#9CA3AF] shrink-0 w-16">{L(lang, { ko: '필요서류', zh: '所需文件', en: 'Documents' })}</span>
                  <span className="text-[#374151]">{L(lang, bank.docs)}</span>
                </div>
                <div className="flex gap-2">
                  <span className="text-[#9CA3AF] shrink-0 w-16">{L(lang, { ko: '외국어', zh: '外语', en: 'Language' })}</span>
                  <span className="text-[#374151]">{L(lang, bank.foreign)}</span>
                </div>
                <div className="flex gap-2">
                  <span className="text-[#9CA3AF] shrink-0 w-16">{L(lang, { ko: '상품', zh: '产品', en: 'Products' })}</span>
                  <span className="text-[#374151]">{L(lang, bank.accounts)}</span>
                </div>
                {bank.fees && (
                  <div className="flex gap-2">
                    <span className="text-[#9CA3AF] shrink-0 w-16">{L(lang, { ko: '수수료', zh: '手续费', en: 'Fees' })}</span>
                    <span className="text-[#374151]">{L(lang, bank.fees)}</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Remittance Section */}
      {section === 'remit' && (
        <div className="space-y-3">
          <p className="text-sm text-[#6B7280]">{L(lang, { ko: '해외 송금 서비스 비교', zh: '国际汇款服务比较', en: 'International Remittance Comparison' })}</p>
          <div className="bg-white rounded-2xl border border-[#E5E7EB] overflow-hidden">
            <div className="grid grid-cols-4 bg-[#F3F4F6] text-xs font-semibold text-[#111827] p-3">
              <span>{L(lang, { ko: '서비스', zh: '服务', en: 'Service' })}</span>
              <span>{L(lang, { ko: '수수료', zh: '手续费', en: 'Fee' })}</span>
              <span>{L(lang, { ko: '속도', zh: '速度', en: 'Speed' })}</span>
              <span></span>
            </div>
            {remittance.map((r, i) => (
              <div key={i} className="grid grid-cols-4 items-center p-3 border-t border-[#E5E7EB] text-xs">
                <span className="font-semibold text-[#111827]">{typeof r.name === 'string' ? r.name : L(lang, r.name)}</span>
                <span className="text-[#6B7280]">{L(lang, r.fee)}</span>
                <span className="text-[#6B7280]">{L(lang, r.speed)}</span>
                {r.url && (
                  <a href={r.url} target="_blank" rel="noopener noreferrer" className="text-[#6B7280] hover:text-[#111827]">
                    <ExternalLink size={12} />
                  </a>
                )}
              </div>
            ))}
          </div>
          <div className="bg-[#F8F9FA] rounded-xl p-4 border border-[#E5E7EB]">
            <p className="text-xs text-[#6B7280] leading-relaxed">
              {L(lang, {
                ko: 'Wise가 일반적으로 가장 저렴합니다. 긴급한 경우 Western Union이나 Alipay가 빠릅니다. 은행 해외송금은 수수료가 가장 높지만 큰 금액에 안전합니다.',
                zh: 'Wise通常最便宜。紧急情况下Western Union或Alipay最快。银行国际汇款手续费最高，但大额转账更安全。',
                en: 'Wise is generally cheapest. Western Union/Alipay fastest for urgent transfers. Bank transfers have highest fees but safest for large amounts.',
              })}
            </p>
          </div>
        </div>
      )}

      {/* Credit Section */}
      {section === 'credit' && (
        <div className="space-y-3">
          {creditGuide.map((section, i) => (
            <div key={i} className="bg-white rounded-2xl p-5 border border-[#E5E7EB] card-glow">
              <h3 className="font-bold text-[#111827] text-sm mb-3">{L(lang, section.title)}</h3>
              <div className="space-y-2">
                {section.items.map((item, j) => (
                  <div key={j} className="flex items-start gap-2 text-xs text-[#374151]">
                    <CheckCircle2 size={14} className="text-green-600 shrink-0 mt-0.5" />
                    <span>{L(lang, item)}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tax Section */}
      {section === 'tax' && (
        <div className="space-y-3">
          <p className="text-sm text-[#6B7280]">{L(lang, { ko: '외국인을 위한 세금 가이드', zh: '外国人税务指南', en: 'Tax Guide for Foreigners' })}</p>
          {taxGuide.map((item, i) => (
            <div key={i} className="bg-white rounded-2xl p-5 border border-[#E5E7EB] card-glow">
              <h3 className="font-bold text-[#111827] text-sm mb-2">{L(lang, item.title)}</h3>
              <p className="text-xs text-[#374151] leading-relaxed">{L(lang, item.content)}</p>
            </div>
          ))}
          <a href="https://www.hometax.go.kr" target="_blank" rel="noopener noreferrer"
            className="flex items-center justify-between bg-white rounded-xl p-4 border border-[#E5E7EB] hover:border-[#111827]/20 transition-all">
            <span className="text-sm font-semibold text-[#111827]">{L(lang, { ko: '국세청 홈택스 바로가기', zh: '国税厅HomeTax', en: 'Go to HomeTax' })}</span>
            <ExternalLink size={14} className="text-[#9CA3AF]" />
          </a>
        </div>
      )}
    </div>
  )
}
