import { useState, lazy, Suspense } from 'react'
import { X } from 'lucide-react'
import {
  Translate, Camera, CurrencyDollar, Phone, BookOpen,
  ChatDots, CreditCard, Bell, CaretRight,
  Wallet, FileText, Heart, Barbell, Briefcase, House
} from '@phosphor-icons/react'

const TranslatorTab = lazy(() => import('./TranslatorTab'))
const ARTranslateTab = lazy(() => import('./ARTranslateTab'))
const SOSTab = lazy(() => import('./SOSTab'))
const KoreanTab = lazy(() => import('./KoreanTab'))
const CommunityTab = lazy(() => import('./CommunityTab'))
const FinanceTab = lazy(() => import('./FinanceTab'))
const TaxRefundChecker = lazy(() => import('./TaxRefundChecker'))
const VisaAlertTab = lazy(() => import('./VisaAlertTab'))
const DigitalWalletTab = lazy(() => import('./DigitalWalletTab'))
const MedicalTab = lazy(() => import('./MedicalTab'))
const FitnessTab = lazy(() => import('./FitnessTab'))
const JobsTab = lazy(() => import('./JobsTab'))
const HousingTab = lazy(() => import('./HousingTab'))

function L(lang, data) {
  if (typeof data === 'string') return data
  return data?.[lang] || data?.en || data?.zh || data?.ko || ''
}

function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center py-12">
      <div className="w-6 h-6 border-2 border-[#1A1A1A] border-t-transparent rounded-full animate-spin" />
    </div>
  )
}

const TOOL_SECTIONS = [
  {
    id: 'daily',
    title: { ko: '여행 필수', zh: '旅行必备', en: 'Travel Essentials' },
    items: [
      {
        id: 'translator',
        icon: Translate,
        label: { ko: '통역&번역', zh: '口译&翻译', en: 'Translate' },
        sub: { ko: '실시간 통역, 상황별 한국어', zh: '实时翻译、场景韩语', en: 'Real-time translation' },
        color: '#2D5A3D',
      },
      {
        id: 'artranslate',
        icon: Camera,
        label: { ko: '간판 사전', zh: '招牌词典', en: 'Sign Dictionary' },
        sub: { ko: '카메라로 간판 번역', zh: '相机翻译招牌', en: 'Camera-based sign translation' },
        color: '#4A6E8A',
      },
      {
        id: 'taxrefund',
        icon: CurrencyDollar,
        label: { ko: '세금환급 계산기', zh: '退税计算器', en: 'Tax Refund' },
        sub: { ko: '쇼핑 금액 → 환급액 계산', zh: '购物金额→退税额', en: 'Shopping → refund amount' },
        color: '#B8860B',
      },
      {
        id: 'sos',
        icon: Phone,
        label: { ko: '긴급 SOS', zh: '紧急SOS', en: 'Emergency SOS' },
        sub: { ko: '경찰·소방·병원 즉시 연결', zh: '警察、消防、医院即时连接', en: 'Police, fire, hospital' },
        color: '#C62828',
      },
    ],
  },
  {
    id: 'learn',
    title: { ko: '공부&커뮤니티', zh: '学习&社区', en: 'Learn & Community' },
    items: [
      {
        id: 'korean',
        icon: BookOpen,
        label: { ko: '한국어 학습', zh: '韩语学习', en: 'Korean Study' },
        sub: { ko: '여행자를 위한 실용 한국어', zh: '旅行者实用韩语', en: 'Practical Korean for travelers' },
        color: '#5B5EA6',
      },
      {
        id: 'community',
        icon: ChatDots,
        label: { ko: '커뮤니티', zh: '社区', en: 'Community' },
        sub: { ko: '중국인 여행자 정보 공유', zh: '中国旅行者信息分享', en: 'Chinese traveler community' },
        color: '#2D5A3D',
      },
    ],
  },
  {
    id: 'finance',
    title: { ko: '금융&서류', zh: '金融&证件', en: 'Finance & Docs' },
    items: [
      {
        id: 'finance',
        icon: CreditCard,
        label: { ko: '금융 가이드', zh: '金融指南', en: 'Finance Guide' },
        sub: { ko: '은행, 송금, 환전, 세금', zh: '银行、汇款、换钱、税务', en: 'Banking, remittance, tax' },
        color: '#1565C0',
      },
      {
        id: 'wallet',
        icon: Wallet,
        label: { ko: '디지털 월렛', zh: '数字钱包', en: 'Digital Wallet' },
        sub: { ko: '신분증, 서류를 한곳에', zh: '证件、文件一处管理', en: 'IDs and docs in one place' },
        color: '#37474F',
      },
      {
        id: 'visaalert',
        icon: Bell,
        label: { ko: '비자 D-day', zh: '签证D-day', en: 'Visa Alert' },
        sub: { ko: '비자 만료일 스마트 알림', zh: '签证到期智能提醒', en: 'Visa expiry notifications' },
        color: '#E65100',
      },
    ],
  },
  {
    id: 'life',
    title: { ko: '생활', zh: '生活', en: 'Life in Korea' },
    items: [
      {
        id: 'medical',
        icon: Heart,
        label: { ko: '의료 가이드', zh: '医疗指南', en: 'Medical Guide' },
        sub: { ko: '외국인 병원, 약국, 보험', zh: '外国人医院、药房、保险', en: 'Hospitals, clinics, insurance' },
        color: '#C62828',
      },
      {
        id: 'fitness',
        icon: Barbell,
        label: { ko: '운동 가이드', zh: '健身指南', en: 'Fitness' },
        sub: { ko: '헬스장, 수영장, 스포츠', zh: '健身房、游泳池、运动', en: 'Gyms, pools, sports' },
        color: '#2E7D32',
      },
      {
        id: 'jobs',
        icon: Briefcase,
        label: { ko: '구직 가이드', zh: '求职指南', en: 'Jobs' },
        sub: { ko: '외국인 취업, 알바, 비자', zh: '外国人就业、兼职、签证', en: 'Jobs, part-time, visa' },
        color: '#4527A0',
      },
      {
        id: 'housing',
        icon: House,
        label: { ko: '집 구하기', zh: '找房指南', en: 'Housing' },
        sub: { ko: '외국인 전월세, 고시원', zh: '外国人租房、考试院', en: 'Rent, goshiwon for foreigners' },
        color: '#00695C',
      },
    ],
  },
]

export default function ToolsTab({ lang, profile }) {
  const [active, setActive] = useState(null)

  const safeProfile = profile || { name: '', nationality: 'china_mainland', lang: 'zh' }

  if (active) {
    return (
      <div className="fixed inset-0 z-50 bg-white flex flex-col">
        <div className="flex items-center gap-3 px-4 py-3 border-b border-[#E5E7EB] flex-shrink-0">
          <button onClick={() => setActive(null)} className="p-1 text-[#1A1A1A]">
            <X size={22} />
          </button>
          <h2 className="text-base font-semibold text-[#1A1A1A]">
            {L(lang, TOOL_SECTIONS.flatMap(s => s.items).find(i => i.id === active)?.label || {})}
          </h2>
        </div>
        <div className="flex-1 overflow-y-auto">
          <Suspense fallback={<LoadingSpinner />}>
            {active === 'translator' && <TranslatorTab lang={lang} />}
            {active === 'artranslate' && <ARTranslateTab lang={lang} />}
            {active === 'sos' && <SOSTab lang={lang} profile={safeProfile} />}
            {active === 'korean' && <KoreanTab lang={lang} />}
            {active === 'community' && <CommunityTab lang={lang} profile={safeProfile} />}
            {active === 'finance' && <FinanceTab lang={lang} profile={safeProfile} />}
            {active === 'taxrefund' && <TaxRefundChecker lang={lang} profile={safeProfile} />}
            {active === 'visaalert' && <VisaAlertTab lang={lang} profile={safeProfile} />}
            {active === 'wallet' && <DigitalWalletTab lang={lang} profile={safeProfile} />}
            {active === 'medical' && <MedicalTab lang={lang} />}
            {active === 'fitness' && <FitnessTab lang={lang} />}
            {active === 'jobs' && <JobsTab lang={lang} />}
            {active === 'housing' && <HousingTab lang={lang} />}
          </Suspense>
        </div>
      </div>
    )
  }

  return (
    <div className="pt-4 pb-24 bg-white mx-auto w-full" style={{ maxWidth: 480 }}>
      {TOOL_SECTIONS.map(section => (
        <div key={section.id} className="mb-8 px-4">
          <h2 className="text-[13px] font-semibold tracking-wider uppercase text-[#999] mb-3">
            {L(lang, section.title)}
          </h2>
          <div className="space-y-2">
            {section.items.map(item => {
              const Icon = item.icon
              return (
                <button
                  key={item.id}
                  onClick={() => setActive(item.id)}
                  className="w-full flex items-center gap-4 p-4 bg-white rounded-[8px] border border-[#E5E7EB] active:scale-[0.98] transition-all duration-150 text-left"
                >
                  <div
                    className="w-10 h-10 rounded-[8px] flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: item.color + '18' }}
                  >
                    <Icon size={20} weight="light" style={{ color: item.color }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[14px] font-semibold text-[#1A1A1A] leading-tight">
                      {L(lang, item.label)}
                    </p>
                    <p className="text-[12px] text-[#999] mt-0.5 leading-snug">
                      {L(lang, item.sub)}
                    </p>
                  </div>
                  <CaretRight size={16} weight="light" className="text-[#CCC] flex-shrink-0" />
                </button>
              )
            })}
          </div>
        </div>
      ))}
    </div>
  )
}
