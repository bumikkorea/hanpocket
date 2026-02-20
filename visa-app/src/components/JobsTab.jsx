import { useState } from 'react'
import { Briefcase, MapPin, DollarSign, Calendar, Shield, ExternalLink, Phone, Clock, Users, Info } from 'lucide-react'

const T = (lang, obj) => obj[lang] || obj.en || ''

const JOB_CATEGORIES = [
  { id: 'all', label: { ko: '전체', zh: '全部', en: 'All' } },
  { id: 'restaurant', label: { ko: '음식점/서비스', zh: '餐饮/服务', en: 'Restaurant/Service' }, color: 'bg-orange-500/20 text-orange-300' },
  { id: 'trade', label: { ko: '무역/통역', zh: '贸易/翻译', en: 'Trade/Interpretation' }, color: 'bg-blue-500/20 text-blue-300' },
  { id: 'it', label: { ko: 'IT/사무', zh: 'IT/办公', en: 'IT/Office' }, color: 'bg-purple-500/20 text-purple-300' },
  { id: 'education', label: { ko: '교육', zh: '教育', en: 'Education' }, color: 'bg-green-500/20 text-green-300' },
  { id: 'other', label: { ko: '기타', zh: '其他', en: 'Other' }, color: 'bg-gray-500/20 text-gray-300' },
]

const JOBS = [
  { id: 1, title: { ko: '중식당 홀서빙', zh: '中餐厅服务员', en: 'Chinese Restaurant Server' }, company: '홍콩반점', location: '서울 강남', salary: '240~280만원', visas: ['F-6', 'E-7', 'F-2'], category: 'restaurant', date: '2026-02-18' },
  { id: 2, title: { ko: '무역회사 중국어 통역', zh: '贸易公司中文翻译', en: 'Trade Company Chinese Interpreter' }, company: '한중무역(주)', location: '서울 종로', salary: '280~350만원', visas: ['E-7', 'F-2', 'F-5'], category: 'trade', date: '2026-02-17' },
  { id: 3, title: { ko: 'IT 개발자 (프론트엔드)', zh: 'IT开发者(前端)', en: 'IT Developer (Frontend)' }, company: 'TechKorea', location: '서울 판교', salary: '350~500만원', visas: ['E-7', 'F-2', 'F-5'], category: 'it', date: '2026-02-17' },
  { id: 4, title: { ko: '중국어 학원 강사', zh: '中文学院讲师', en: 'Chinese Language Instructor' }, company: '차이나어학원', location: '서울 신촌', salary: '250~300만원', visas: ['E-2', 'F-6', 'F-2'], category: 'education', date: '2026-02-16' },
  { id: 5, title: { ko: '편의점 야간 알바', zh: '便利店夜班', en: 'Convenience Store Night Shift' }, company: 'GS25 인천점', location: '인천 부평', salary: '시급 10,030원', visas: ['F-6', 'F-2', 'H-2'], category: 'restaurant', date: '2026-02-16' },
  { id: 6, title: { ko: '물류센터 관리직', zh: '物流中心管理', en: 'Logistics Center Manager' }, company: '쿠팡로지스틱스', location: '경기 이천', salary: '300~350만원', visas: ['E-7', 'F-2', 'F-5'], category: 'other', date: '2026-02-15' },
  { id: 7, title: { ko: '관광가이드 (중국어)', zh: '旅游导游(中文)', en: 'Tour Guide (Chinese)' }, company: '서울관광', location: '서울 명동', salary: '250~320만원', visas: ['E-7', 'F-6', 'F-2'], category: 'trade', date: '2026-02-15' },
  { id: 8, title: { ko: '사무보조 (엑셀/한국어)', zh: '行政助理(Excel/韩语)', en: 'Office Assistant (Excel/Korean)' }, company: '대한상사', location: '서울 마포', salary: '230~260만원', visas: ['F-6', 'F-2', 'D-10'], category: 'it', date: '2026-02-14' },
  { id: 9, title: { ko: '화장품 판매원', zh: '化妆品销售', en: 'Cosmetics Sales' }, company: '이니스프리 명동', location: '서울 명동', salary: '220~260만원', visas: ['F-6', 'F-2', 'H-2'], category: 'restaurant', date: '2026-02-14' },
  { id: 10, title: { ko: '배달 라이더', zh: '外卖骑手', en: 'Delivery Rider' }, company: '배달의민족', location: '서울 전지역', salary: '건당 3,500~5,000원', visas: ['F-6', 'F-2', 'H-2'], category: 'other', date: '2026-02-13' },
]

const WORK_RULES = [
  { visa: 'F-6', rule: { ko: '취업 제한 없음 (배우자 비자)', zh: '无就业限制（配偶签证）', en: 'No work restrictions (spouse visa)' } },
  { visa: 'F-2', rule: { ko: '취업 제한 없음 (거주 비자)', zh: '无就业限制（居住签证）', en: 'No work restrictions (residence visa)' } },
  { visa: 'F-5', rule: { ko: '취업 제한 없음 (영주권)', zh: '无就业限制（永住权）', en: 'No work restrictions (permanent resident)' } },
  { visa: 'E-7', rule: { ko: '지정 업종/업체에서만 취업 가능', zh: '仅限指定行业/企业就业', en: 'Work only at designated employer/industry' } },
  { visa: 'D-10', rule: { ko: '구직활동만 가능 (아르바이트 제한)', zh: '仅限求职活动（兼职受限）', en: 'Job-seeking only (part-time restricted)' } },
  { visa: 'H-2', rule: { ko: '허용된 단순노무 업종에서만 취업', zh: '仅限许可的简单劳务行业', en: 'Work only in permitted manual labor sectors' } },
]

function Badge({ children, className = '' }) {
  return <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${className}`}>{children}</span>
}

function SectionCard({ children, className = '' }) {
  return <div className={`bg-white border border-[#E5E7EB] shadow-sm rounded-2xl p-4 ${className}`}>{children}</div>
}

export default function JobsTab({ lang }) {
  const [jobCategory, setJobCategory] = useState('all')
  const filteredJobs = jobCategory === 'all' ? JOBS : JOBS.filter(j => j.category === jobCategory)
  const getCatStyle = (catId) => JOB_CATEGORIES.find(c => c.id === catId)?.color || 'bg-gray-500/20 text-gray-300'
  const getCatLabel = (catId) => { const cat = JOB_CATEGORIES.find(c => c.id === catId); return cat ? T(lang, cat.label) : '' }

  return (
    <div className="space-y-5 animate-fade-up">
      {/* Job Listings */}
      <div className="space-y-3">
        <h2 className="text-base font-bold text-[#111827] flex items-center gap-2">
          <Briefcase size={18} className="text-[#6B7280]" />
          {T(lang, { ko: '구인 정보', zh: '招聘信息', en: 'Job Listings' })}
        </h2>
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
          {JOB_CATEGORIES.map(cat => (
            <button key={cat.id} onClick={() => setJobCategory(cat.id)}
              className={`shrink-0 text-xs px-3 py-1.5 rounded-full transition-all ${
                jobCategory === cat.id ? 'bg-[#D4A574] text-[#1A0A0F] font-semibold' : 'bg-white border border-[#E5E7EB] shadow-sm text-[#6B7280]'
              }`}>
              {T(lang, cat.label)}
            </button>
          ))}
        </div>
        {filteredJobs.map(job => (
          <SectionCard key={job.id}>
            <div className="flex items-start justify-between mb-2">
              <h3 className="text-sm font-bold text-[#111827] flex-1">{T(lang, job.title)}</h3>
              <Badge className={getCatStyle(job.category)}>{getCatLabel(job.category)}</Badge>
            </div>
            <p className="text-xs text-[#6B7280] font-medium mb-2">{job.company}</p>
            <div className="flex flex-wrap gap-3 text-xs text-[#6B7280] mb-2">
              <span className="flex items-center gap-1"><MapPin size={12} />{job.location}</span>
              <span className="flex items-center gap-1"><DollarSign size={12} />{job.salary}</span>
              <span className="flex items-center gap-1"><Calendar size={12} />{job.date}</span>
            </div>
            <div className="flex flex-wrap gap-1.5 mb-3">
              {job.visas.map(v => (
                <Badge key={v} className="bg-[#D4A574]/15 text-[#6B7280] border border-[#D4A574]/30">{v}</Badge>
              ))}
            </div>
            <button onClick={() => alert(T(lang, { ko: '연락 기능은 준비 중입니다.', zh: '联系功能正在准备中。', en: 'Contact feature coming soon.' }))}
              className="w-full py-2 text-xs font-semibold rounded-xl bg-[#8B1D2E] text-white hover:bg-[#6B2035] transition-all">
              {T(lang, { ko: '연락하기', zh: '联系', en: 'Contact' })}
            </button>
          </SectionCard>
        ))}
      </div>

      {/* Job Seeker Guide */}
      <div className="space-y-3">
        <h2 className="text-base font-bold text-[#111827] flex items-center gap-2">
          <Users size={18} className="text-[#6B7280]" />
          {T(lang, { ko: '구직 가이드', zh: '求职指南', en: 'Job Seeker Guide' })}
        </h2>
        <SectionCard>
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <Info size={16} className="text-[#6B7280] shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-[#111827] mb-1">{T(lang, { ko: '구직 등록 방법', zh: '求职注册方法', en: 'How to Register' })}</p>
                <p className="text-xs text-[#6B7280]">{T(lang, { ko: '워크넷(work.go.kr)에서 외국인 구직자 등록 가능. 외국인등록증 필요.', zh: '可在WorkNet(work.go.kr)注册外国人求职者。需要外国人登录证。', en: 'Register as foreign job seeker on WorkNet (work.go.kr). ARC required.' })}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Shield size={16} className="text-[#6B7280] shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-[#111827] mb-1">{T(lang, { ko: '비자별 취업 제한', zh: '各签证就业限制', en: 'Work Restrictions by Visa' })}</p>
                <p className="text-xs text-[#6B7280]">{T(lang, { ko: 'F계열(F-2,F-5,F-6)은 자유취업, E계열은 업종제한, D-10은 구직활동만 가능', zh: 'F系列(F-2,F-5,F-6)自由就业，E系列限制行业，D-10仅限求职活动', en: 'F-series (F-2,F-5,F-6): free work. E-series: industry restricted. D-10: job-seeking only.' })}</p>
              </div>
            </div>
          </div>
        </SectionCard>
        <div className="grid grid-cols-2 gap-3">
          {[
            { name: { ko: '워크넷', zh: 'WorkNet', en: 'WorkNet' }, url: 'https://www.work.go.kr', desc: { ko: '고용노동부 구직사이트', zh: '雇佣劳动部求职网', en: 'MOL Job Portal' } },
            { name: { ko: '외국인고용관리', zh: '外国人雇佣系统', en: 'EPS' }, url: 'https://www.eps.go.kr', desc: { ko: '외국인 고용허가제', zh: '外国人雇佣许可制', en: 'Employment Permit' } },
          ].map(link => (
            <a key={link.url} href={link.url} target="_blank" rel="noopener noreferrer">
              <SectionCard className="h-full hover:border-[#D4A574]/50 transition-all">
                <div className="flex items-center gap-1 mb-1">
                  <ExternalLink size={12} className="text-[#6B7280]" />
                  <p className="text-sm font-bold text-[#6B7280]">{T(lang, link.name)}</p>
                </div>
                <p className="text-[10px] text-[#6B7280]">{T(lang, link.desc)}</p>
              </SectionCard>
            </a>
          ))}
        </div>
        <SectionCard className="border-dashed border-[#D4A574]/30">
          <div className="text-center py-4">
            <Clock size={24} className="text-[#6B7280]/50 mx-auto mb-2" />
            <p className="text-sm font-semibold text-[#6B7280]/70">{T(lang, { ko: 'Coming Soon: 구직 등록', zh: 'Coming Soon: 求职注册', en: 'Coming Soon: Job Seeker Registration' })}</p>
            <p className="text-xs text-[#6B7280] mt-1">{T(lang, { ko: '곧 직접 구직 프로필을 등록할 수 있습니다', zh: '即将可以直接注册求职档案', en: 'Register your job seeker profile soon' })}</p>
          </div>
        </SectionCard>
      </div>

      {/* Useful Info */}
      <div className="space-y-3">
        <h2 className="text-base font-bold text-[#111827] flex items-center gap-2">
          <Info size={18} className="text-[#6B7280]" />
          {T(lang, { ko: '유용한 정보', zh: '实用信息', en: 'Useful Info' })}
        </h2>
        <SectionCard>
          <h3 className="text-sm font-bold text-[#111827] mb-3 flex items-center gap-2">
            <Shield size={14} className="text-[#6B7280]" />
            {T(lang, { ko: '비자별 취업 규정', zh: '各签证就业规定', en: 'Work Rules by Visa' })}
          </h3>
          <div className="space-y-2">
            {WORK_RULES.map(wr => (
              <div key={wr.visa} className="flex gap-2 items-start">
                <Badge className="bg-[#D4A574]/15 text-[#6B7280] border border-[#D4A574]/30 shrink-0">{wr.visa}</Badge>
                <p className="text-xs text-[#6B7280]">{T(lang, wr.rule)}</p>
              </div>
            ))}
          </div>
        </SectionCard>
        <div className="grid grid-cols-2 gap-3">
          <SectionCard>
            <DollarSign size={20} className="text-[#6B7280] mb-2" />
            <p className="text-xs text-[#6B7280] mb-1">{T(lang, { ko: '2026 최저시급', zh: '2026最低时薪', en: '2026 Min. Wage' })}</p>
            <p className="text-lg font-bold text-[#111827]">10,030{T(lang, { ko: '원', zh: '韩元', en: 'KRW' })}</p>
          </SectionCard>
          <SectionCard>
            <Phone size={20} className="text-[#6B7280] mb-2" />
            <p className="text-xs text-[#6B7280] mb-1">{T(lang, { ko: '노동권익 상담', zh: '劳动权益咨询', en: 'Labor Rights' })}</p>
            <p className="text-lg font-bold text-[#111827]">1350</p>
            <p className="text-[10px] text-[#6B7280]">{T(lang, { ko: '다국어 지원', zh: '多语言支持', en: 'Multilingual' })}</p>
          </SectionCard>
        </div>
      </div>
    </div>
  )
}
