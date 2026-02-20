import { useState } from 'react'

const agencies = [
  {
    id: 1,
    name: { ko: '한중번역공증센터', zh: '韩中翻译公证中心', en: 'Korea-China Translation & Notary Center' },
    rating: 4.9,
    reviews: 412,
    services: ['translation', 'notarization', 'mofa', 'apostille'],
    languages: ['🇨🇳', '🇰🇷', '🇬🇧'],
    price: { ko: '5만원~', zh: '5万韩元起', en: 'From ₩50,000' },
    location: { ko: '서울 영등포구', zh: '首尔 永登浦区', en: 'Yeongdeungpo, Seoul' },
    experience: '10년+',
    certifications: ['대한번역사협회', '법무부 인가'],
    awards: ['2024 우수번역사무소'],
    hours: '월-금 09:00-18:00',
    badge: '👑',
  },
  {
    id: 2,
    name: { ko: '글로벌인증센터', zh: 'Global认证中心', en: 'Global Authentication Center' },
    rating: 4.7,
    reviews: 238,
    services: ['translation', 'notarization', 'mofa', 'apostille', 'consular'],
    languages: ['🇨🇳', '🇰🇷'],
    price: { ko: '3만원~', zh: '3万韩元起', en: 'From ₩30,000' },
    location: { ko: '서울 종로구', zh: '首尔 钟路区', en: 'Jongno, Seoul' },
    experience: '7년+',
    certifications: ['외교부 지정 대행기관'],
    awards: [],
    hours: '월-금 09:00-18:00 / 토 10:00-14:00',
    badge: '🏆',
  },
  {
    id: 3,
    name: { ko: '아포스티유 코리아', zh: 'Apostille Korea', en: 'Apostille Korea' },
    rating: 4.8,
    reviews: 567,
    services: ['mofa', 'apostille', 'consular'],
    languages: ['🇨🇳', '🇰🇷', '🇬🇧', '🇯🇵'],
    price: { ko: '4만원~', zh: '4万韩元起', en: 'From ₩40,000' },
    location: { ko: '서울 서초구', zh: '首尔 瑞草区', en: 'Seocho, Seoul' },
    experience: '15년+',
    certifications: ['법무부 인가', '외교부 지정 대행기관'],
    awards: ['2023 대한민국 서비스 대상'],
    hours: '월-금 08:30-18:30',
    badge: '⭐',
  },
]

const serviceLabels = {
  translation: { ko: '번역', zh: '翻译', en: 'Translation' },
  notarization: { ko: '공증', zh: '公证', en: 'Notarization' },
  mofa: { ko: '외교부 인증', zh: '外交部认证', en: 'MOFA Auth' },
  apostille: { ko: '아포스티유', zh: '海牙认证', en: 'Apostille' },
  consular: { ko: '영사 인증', zh: '领事认证', en: 'Consular' },
  pet: { ko: '반려동물 검역', zh: '宠物检疫', en: 'Pet Quarantine' },
}

function L(lang, data) {
  if (typeof data === 'string') return data
  return data?.[lang] || data?.en || ''
}

const initialRegForm = {
  agencyName: '',
  representative: '',
  businessNo: '',
  address: '',
  phone: '',
  email: '',
  certifications: [],
  experience: '',
  insurance: '',
  services: [],
  languages: [],
  businessHours: '',
  agreeTerms: false,
  agreePrivacy: false,
}

function AgencyRegistrationModal({ lang, onClose }) {
  const [form, setForm] = useState(initialRegForm)
  const [submitted, setSubmitted] = useState(false)

  const t = (ko, zh, en) => lang === 'ko' ? ko : lang === 'zh' ? zh : en

  const set = (key, val) => setForm(prev => ({ ...prev, [key]: val }))
  const toggleArr = (key, val) => setForm(prev => ({
    ...prev,
    [key]: prev[key].includes(val) ? prev[key].filter(v => v !== val) : [...prev[key], val],
  }))

  const certOptions = [
    { value: '행정사', label: t('행정사', '行政士', 'Administrative Agent') },
    { value: '번역사', label: t('번역사', '翻译师', 'Translator') },
    { value: '법무사', label: t('법무사', '法务士', 'Judicial Scrivener') },
    { value: '공인중개사', label: t('공인중개사', '公认中介师', 'Licensed Realtor') },
    { value: '기타', label: t('기타', '其他', 'Other') },
  ]

  const expOptions = [
    { value: '1년미만', label: t('1년 미만', '不到1年', 'Less than 1 year') },
    { value: '1-3년', label: t('1-3년', '1-3年', '1-3 years') },
    { value: '3-5년', label: t('3-5년', '3-5年', '3-5 years') },
    { value: '5-10년', label: t('5-10년', '5-10年', '5-10 years') },
    { value: '10년이상', label: t('10년 이상', '10年以上', '10+ years') },
  ]

  const svcOptions = [
    { value: '번역', label: t('번역', '翻译', 'Translation') },
    { value: '공증', label: t('공증', '公证', 'Notarization') },
    { value: '외교부인증', label: t('외교부 인증', '外交部认证', 'MOFA Authentication') },
    { value: '아포스티유', label: t('아포스티유', '海牙认证', 'Apostille') },
    { value: '영사인증', label: t('영사 인증', '领事认证', 'Consular Legalization') },
  ]

  const langOptions = [
    { value: '한국어', label: t('한국어', '韩语', 'Korean') },
    { value: '중국어', label: t('중국어', '中文', 'Chinese') },
    { value: '영어', label: t('영어', '英语', 'English') },
    { value: '일본어', label: t('일본어', '日语', 'Japanese') },
    { value: '베트남어', label: t('베트남어', '越南语', 'Vietnamese') },
    { value: '기타', label: t('기타', '其他', 'Other') },
  ]

  const isValid = form.agencyName && form.representative && form.businessNo && form.address && form.phone && form.email && form.agreeTerms && form.agreePrivacy

  const handleSubmit = () => {
    if (!isValid) return
    const subject = encodeURIComponent(`[HanPocket] 대행사 등록 신청 - ${form.agencyName}`)
    const body = encodeURIComponent(
      `=== 대행사 등록 신청서 / 代办商注册申请 / Agency Registration ===\n\n` +
      `대행사명 / 代办商名 / Agency Name: ${form.agencyName}\n` +
      `대표자명 / 代表人 / Representative: ${form.representative}\n` +
      `사업자등록번호 / 营业执照号 / Business Reg. No.: ${form.businessNo}\n` +
      `사업장 주소 / 地址 / Address: ${form.address}\n` +
      `연락처 / 联系方式 / Phone: ${form.phone}\n` +
      `이메일 / 邮箱 / Email: ${form.email}\n` +
      `보유 자격증 / 资格证 / Certifications: ${form.certifications.join(', ') || '-'}\n` +
      `경력 / 经验 / Experience: ${form.experience || '-'}\n` +
      `전문배상책임보험 / 专业赔偿责任保险 / Liability Insurance: ${form.insurance || '-'}\n` +
      `제공 가능 서비스 / 可提供服务 / Services: ${form.services.join(', ') || '-'}\n` +
      `취급 가능 언어 / 可用语言 / Languages: ${form.languages.join(', ') || '-'}\n` +
      `업무 시간 / 工作时间 / Business Hours: ${form.businessHours || '-'}\n`
    )
    window.open(`mailto:admin@hanpocket.com?subject=${subject}&body=${body}`, '_self')
    setSubmitted(true)
  }

  if (submitted) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
        <div className="bg-white rounded-lg w-full max-w-md shadow-2xl animate-fade-up p-8 text-center space-y-4">
          <div className="text-5xl">✅</div>
          <h3 className="text-lg font-bold text-[#1C1C1E]">
            {t('신청 완료', '申请完成', 'Application Submitted')}
          </h3>
          <p className="text-sm text-[#6B2035]">
            {t(
              '신청서가 이메일로 전송됩니다. 검토 후 영업일 기준 3일 이내 연락드리겠습니다.',
              '申请将通过邮件发送。审核后将在3个工作日内与您联系。',
              'Your application will be sent via email. We will contact you within 3 business days after review.'
            )}
          </p>
          <button onClick={onClose} className="w-full bg-[#1C1C1E] text-[#111827] font-semibold py-3 rounded-xl mt-4">
            {t('확인', '确认', 'OK')}
          </button>
        </div>
      </div>
    )
  }

  const inputCls = "w-full bg-[#EDE9E3] rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[#111827]/30"
  const labelCls = "block text-sm font-semibold text-[#2C2C2E] mb-1"
  const subLabelCls = "text-[10px] text-[#8E8E93]"
  const checkCls = "w-4 h-4 accent-[#111827] rounded"

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-lg w-full max-w-lg shadow-2xl animate-fade-up flex flex-col" style={{ maxHeight: '90vh' }}>
        {/* Header */}
        <div className="bg-[#1C1C1E] rounded-t-2xl px-6 py-4 flex items-center justify-between flex-shrink-0">
          <div>
            <h3 className="text-base font-bold text-[#111827]">
              {t('대행사 등록 신청', '代办商注册申请', 'Agency Registration')}
            </h3>
            <p className="text-[10px] text-[#8E8E93] mt-0.5">
              {t('아래 양식을 작성해 주세요', '请填写以下表格', 'Please fill out the form below')}
            </p>
          </div>
          <button onClick={onClose} className="text-[#8E8E93] hover:text-white text-xl leading-none">✕</button>
        </div>

        {/* Scrollable form */}
        <div className="overflow-y-auto px-6 py-4 space-y-4 flex-1">
          {/* Agency Name */}
          <div>
            <label className={labelCls}>대행사명 <span className={subLabelCls}>/ 代办商名 / Agency Name</span> *</label>
            <input value={form.agencyName} onChange={e => set('agencyName', e.target.value)} className={inputCls} />
          </div>
          {/* Representative */}
          <div>
            <label className={labelCls}>대표자명 <span className={subLabelCls}>/ 代表人 / Representative</span> *</label>
            <input value={form.representative} onChange={e => set('representative', e.target.value)} className={inputCls} />
          </div>
          {/* Business No */}
          <div>
            <label className={labelCls}>사업자등록번호 <span className={subLabelCls}>/ 营业执照号 / Business Reg. No.</span> *</label>
            <input value={form.businessNo} onChange={e => set('businessNo', e.target.value)} placeholder="000-00-00000" className={inputCls} />
          </div>
          {/* Address */}
          <div>
            <label className={labelCls}>사업장 주소 <span className={subLabelCls}>/ 地址 / Address</span> *</label>
            <input value={form.address} onChange={e => set('address', e.target.value)} className={inputCls} />
          </div>
          {/* Phone */}
          <div>
            <label className={labelCls}>연락처 <span className={subLabelCls}>/ 联系方式 / Phone</span> *</label>
            <input type="tel" value={form.phone} onChange={e => set('phone', e.target.value)} placeholder="010-0000-0000" className={inputCls} />
          </div>
          {/* Email */}
          <div>
            <label className={labelCls}>이메일 <span className={subLabelCls}>/ 邮箱 / Email</span> *</label>
            <input type="email" value={form.email} onChange={e => set('email', e.target.value)} className={inputCls} />
          </div>

          {/* Certifications */}
          <div>
            <label className={labelCls}>보유 자격증 <span className={subLabelCls}>/ 资格证 / Certifications</span></label>
            <div className="flex flex-wrap gap-3 mt-1">
              {certOptions.map(opt => (
                <label key={opt.value} className="flex items-center gap-1.5 text-sm text-[#6B2035]">
                  <input type="checkbox" className={checkCls} checked={form.certifications.includes(opt.value)}
                    onChange={() => toggleArr('certifications', opt.value)} />
                  {opt.label}
                </label>
              ))}
            </div>
          </div>

          {/* Experience */}
          <div>
            <label className={labelCls}>경력 <span className={subLabelCls}>/ 经验 / Experience</span></label>
            <select value={form.experience} onChange={e => set('experience', e.target.value)}
              className={inputCls + ' appearance-none'}>
              <option value="">{t('선택해 주세요', '请选择', 'Select')}</option>
              {expOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
            </select>
          </div>

          {/* Insurance */}
          <div>
            <label className={labelCls}>전문배상책임보험 <span className={subLabelCls}>/ 专业赔偿责任保险 / Liability Insurance</span></label>
            <div className="flex gap-6 mt-1">
              {[
                { value: '가입', label: t('가입', '已投保', 'Insured') },
                { value: '미가입', label: t('미가입', '未投保', 'Not insured') },
              ].map(opt => (
                <label key={opt.value} className="flex items-center gap-1.5 text-sm text-[#6B2035]">
                  <input type="radio" name="insurance" className={checkCls} checked={form.insurance === opt.value}
                    onChange={() => set('insurance', opt.value)} />
                  {opt.label}
                </label>
              ))}
            </div>
          </div>

          {/* Services */}
          <div>
            <label className={labelCls}>제공 가능 서비스 <span className={subLabelCls}>/ 可提供服务 / Available Services</span></label>
            <div className="flex flex-wrap gap-3 mt-1">
              {svcOptions.map(opt => (
                <label key={opt.value} className="flex items-center gap-1.5 text-sm text-[#6B2035]">
                  <input type="checkbox" className={checkCls} checked={form.services.includes(opt.value)}
                    onChange={() => toggleArr('services', opt.value)} />
                  {opt.label}
                </label>
              ))}
            </div>
          </div>

          {/* Languages */}
          <div>
            <label className={labelCls}>취급 가능 언어 <span className={subLabelCls}>/ 可用语言 / Languages</span></label>
            <div className="flex flex-wrap gap-3 mt-1">
              {langOptions.map(opt => (
                <label key={opt.value} className="flex items-center gap-1.5 text-sm text-[#6B2035]">
                  <input type="checkbox" className={checkCls} checked={form.languages.includes(opt.value)}
                    onChange={() => toggleArr('languages', opt.value)} />
                  {opt.label}
                </label>
              ))}
            </div>
          </div>

          {/* Business Hours */}
          <div>
            <label className={labelCls}>업무 시간 <span className={subLabelCls}>/ 工作时间 / Business Hours</span></label>
            <input value={form.businessHours} onChange={e => set('businessHours', e.target.value)}
              placeholder={t('예: 월-금 09:00-18:00', '例: 周一至周五 09:00-18:00', 'e.g. Mon-Fri 09:00-18:00')} className={inputCls} />
          </div>

          {/* Required Documents Notice */}
          <div className="bg-[#EDE9E3] rounded-xl p-4">
            <h4 className="text-sm font-semibold text-[#2C2C2E] mb-2">
              📎 {t('첨부서류 안내', '附件说明', 'Required Documents')}
            </h4>
            <p className="text-[10px] text-[#8E8E93] mb-2">
              {t('등록 승인 시 아래 서류를 별도 제출해야 합니다.',
                '注册批准后需另行提交以下文件。',
                'The following documents must be submitted separately upon approval.')}
            </p>
            <ul className="text-xs text-[#6B2035] space-y-1 list-disc list-inside">
              <li>{t('사업자등록증 사본', '营业执照副本', 'Copy of Business Registration')}</li>
              <li>{t('자격증 사본', '资格证副本', 'Copy of Certifications')}</li>
              <li>{t('전문배상책임보험 증권 사본', '专业赔偿责任保险证券副本', 'Copy of Professional Liability Insurance')}</li>
              <li>{t('포트폴리오 (선택)', '作品集（可选）', 'Portfolio (optional)')}</li>
            </ul>
          </div>

          {/* Agreements */}
          <div className="space-y-2">
            <label className="flex items-start gap-2 text-sm text-[#6B2035]">
              <input type="checkbox" className={checkCls + ' mt-0.5'} checked={form.agreeTerms}
                onChange={e => set('agreeTerms', e.target.checked)} />
              <span>{t('서비스 이용약관에 동의합니다', '同意服务使用条款', 'I agree to the Terms of Service')} *</span>
            </label>
            <label className="flex items-start gap-2 text-sm text-[#6B2035]">
              <input type="checkbox" className={checkCls + ' mt-0.5'} checked={form.agreePrivacy}
                onChange={e => set('agreePrivacy', e.target.checked)} />
              <span>{t('개인정보 수집 및 이용에 동의합니다', '同意个人信息收集与使用', 'I agree to the Privacy Policy')} *</span>
            </label>
          </div>
        </div>

        {/* Footer buttons */}
        <div className="px-6 py-4 border-t border-[#EDE9E3] flex-shrink-0 space-y-2">
          <button onClick={handleSubmit} disabled={!isValid}
            className={`w-full font-semibold py-3 rounded-xl transition-all ${isValid ? 'bg-[#1C1C1E] text-[#111827] hover:bg-[#2C2C2E]' : 'bg-[#EDE9E3] text-[#8E8E93] cursor-not-allowed'}`}>
            {t('신청서 제출', '提交申请', 'Submit Application')}
          </button>
          <button onClick={onClose} className="w-full text-[#8E8E93] text-xs py-2">
            {t('취소', '取消', 'Cancel')}
          </button>
        </div>
      </div>
    </div>
  )
}

export default function AgencyTab({ profile, lang }) {
  const [showLogin, setShowLogin] = useState(false)
  const [showRegister, setShowRegister] = useState(false)

  const labels = {
    title: { ko: '📋 서류 대행 서비스', zh: '📋 文件代办服务', en: '📋 Document Services' },
    subtitle: { ko: '번역 · 공증 · 인증 전문 대행', zh: '翻译 · 公证 · 认证专业代办', en: 'Translation · Notarization · Authentication' },
    services: { ko: '가능한 업무', zh: '可办业务', en: 'Services' },
    reviews: { ko: '리뷰', zh: '评价', en: 'reviews' },
    experience: { ko: '경력', zh: '经验', en: 'Experience' },
    hours: { ko: '업무 시간', zh: '工作时间', en: 'Hours' },
    contact: { ko: '문의하기', zh: '咨询', en: 'Contact' },
    agencyLogin: { ko: '대행사 로그인', zh: '代办商登录', en: 'Agency Login' },
    agencyId: { ko: '대행사 ID', zh: '代办商 ID', en: 'Agency ID' },
    password: { ko: '비밀번호', zh: '密码', en: 'Password' },
    login: { ko: '로그인', zh: '登录', en: 'Login' },
    registerInquiry: { ko: '대행사 등록 문의', zh: '代办商注册咨询', en: 'Agency registration inquiry' },
    comingSoon: { ko: '서비스 준비 중', zh: '服务准备中', en: 'Service coming soon' },
    cancel: { ko: '취소', zh: '取消', en: 'Cancel' },
    serviceCategories: { ko: '서비스 분류', zh: '服务分类', en: 'Service Categories' },
  }

  const allServices = [
    { key: 'translation', icon: '📝', desc: { ko: '각종 서류 번역 (한↔중/영)', zh: '各类文件翻译 (韩↔中/英)', en: 'Document translation (KR↔CN/EN)' } },
    { key: 'notarization', icon: '📜', desc: { ko: '공증사무소 공증 대행', zh: '公证处公证代办', en: 'Notary office notarization' } },
    { key: 'mofa', icon: '🏛️', desc: { ko: '외교부 문서 인증', zh: '外交部文件认证', en: 'MOFA document authentication' } },
    { key: 'apostille', icon: '🌐', desc: { ko: '헤이그 아포스티유 확인', zh: '海牙认证确认', en: 'Hague Apostille certification' } },
    { key: 'consular', icon: '🏢', desc: { ko: '주한 대사관/영사관 인증', zh: '驻韩大使馆/领事馆认证', en: 'Embassy/Consulate legalization' } },
    { key: 'pet', icon: '🐾', desc: { ko: '반려동물 검역 서류 대행', zh: '宠物检疫文件代办', en: 'Pet quarantine document service' } },
  ]

  return (
    <div className="space-y-4">
      {/* Login Modal */}
      {showLogin && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-lg w-full max-w-sm shadow-2xl animate-fade-up p-6 space-y-4">
            <h3 className="text-lg font-bold text-[#1C1C1E]">{L(lang, labels.agencyLogin)}</h3>
            <p className="text-xs text-[#8E8E93]">{L(lang, labels.comingSoon)}</p>
            <input type="text" placeholder={L(lang, labels.agencyId)}
              className="w-full bg-[#EDE9E3] rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[#111827]/30" />
            <input type="password" placeholder={L(lang, labels.password)}
              className="w-full bg-[#EDE9E3] rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[#111827]/30" />
            <button className="w-full bg-[#1C1C1E] text-[#111827] font-semibold py-3 rounded-xl">{L(lang, labels.login)}</button>
            <button onClick={() => { setShowLogin(false); setShowRegister(true) }}
              className="w-full text-[#111827] text-sm hover:underline">{L(lang, labels.registerInquiry)} →</button>
            <button onClick={() => setShowLogin(false)} className="w-full text-[#8E8E93] text-xs py-2">{L(lang, labels.cancel)}</button>
          </div>
        </div>
      )}

      {/* Registration Modal */}
      {showRegister && (
        <AgencyRegistrationModal lang={lang} onClose={() => setShowRegister(false)} />
      )}

      {/* Header */}
      <div className="bg-dark-gradient rounded-lg p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold">{L(lang, labels.title)}</h2>
            <p className="text-sm text-[#8E8E93] mt-1">{L(lang, labels.subtitle)}</p>
          </div>
          <button onClick={() => setShowLogin(true)}
            className="text-xs text-[#111827] border border-[#111827]/30 px-3 py-1.5 rounded-full hover:bg-[#111827]/10 transition-all">
            {L(lang, labels.agencyLogin)}
          </button>
        </div>
      </div>

      {/* Service categories */}
      <div className="glass rounded-lg p-4">
        <h3 className="font-bold text-[#1C1C1E] text-sm mb-3">{L(lang, labels.serviceCategories)}</h3>
        <div className="grid grid-cols-2 gap-2">
          {allServices.map(svc => (
            <div key={svc.key} className="flex items-center gap-2 text-sm p-2 rounded-xl bg-[#EDE9E3]">
              <span>{svc.icon}</span>
              <div>
                <div className="font-semibold text-[#2C2C2E] text-xs">{L(lang, serviceLabels[svc.key])}</div>
                <div className="text-[10px] text-[#8E8E93]">{L(lang, svc.desc)}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Agency listings */}
      <div className="space-y-3">
        {agencies.map(agency => (
          <div key={agency.id} className="glass rounded-lg p-4 animate-fade-up">
            <div className="flex items-start gap-3">
              <div className="text-2xl">{agency.badge}</div>
              <div className="flex-1">
                <div className="font-bold text-[#2C2C2E]">{L(lang, agency.name)}</div>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-yellow-500 text-sm">★ {agency.rating}</span>
                  <span className="text-xs text-[#8E8E93]">({agency.reviews} {L(lang, labels.reviews)})</span>
                  {agency.languages.map((l, i) => <span key={i} className="text-xs">{l}</span>)}
                </div>
                <div className="text-xs text-[#8E8E93] mt-1">{L(lang, agency.location)}</div>

                {/* Badges */}
                <div className="flex flex-wrap gap-1.5 mt-2">
                  <span className="text-[10px] bg-[#1C1C1E] text-[#111827] px-2 py-0.5 rounded-full">{L(lang, labels.experience)}: {agency.experience}</span>
                  <span className="text-[10px] bg-[#1C1C1E] text-[#8E8E93] px-2 py-0.5 rounded-full">🕐 {agency.hours}</span>
                  {agency.certifications.map((c, i) => (
                    <span key={i} className="text-[10px] bg-[#111827]/10 text-[#111827] px-2 py-0.5 rounded-full">✓ {c}</span>
                  ))}
                  {agency.awards.map((a, i) => (
                    <span key={i} className="text-[10px] bg-yellow-50 text-yellow-700 px-2 py-0.5 rounded-full">🏆 {a}</span>
                  ))}
                </div>

                {/* Services */}
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {agency.services.map(s => (
                    <span key={s} className="text-[10px] bg-[#EDE9E3] text-[#6B2035] px-2 py-0.5 rounded-full">{L(lang, serviceLabels[s])}</span>
                  ))}
                </div>

                <div className="flex items-center justify-between mt-3">
                  <span className="font-bold text-[#111827] text-sm">{L(lang, agency.price)}</span>
                  <button className="bg-[#1C1C1E] text-[#111827] text-xs font-semibold px-4 py-2 rounded-xl hover:bg-[#2C2C2E] transition-all btn-press">
                    {L(lang, labels.contact)}
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
