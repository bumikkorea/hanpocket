import { useState, useEffect, useRef } from 'react'
import { ChevronDown, ChevronUp, Plus, Trash2, Copy, Check, Printer, Save, FileText, User, GraduationCap, Briefcase, Award, PenTool, Lightbulb, ChevronRight } from 'lucide-react'

function L(lang, d) { if (typeof d === 'string') return d; return d?.[lang] || d?.en || d?.zh || d?.ko || '' }

// ─── Translation Dictionaries ───
const JOB_TITLES = {
  '软件工程师':'소프트웨어 엔지니어','销售经理':'영업 매니저','会计':'회계사','设计师':'디자이너','市场营销':'마케팅','人力资源':'인사','前端开发':'프론트엔드 개발자','后端开发':'백엔드 개발자','产品经理':'프로덕트 매니저','项目经理':'프로젝트 매니저','数据分析师':'데이터 분석가','运营':'운영','客服':'고객서비스','翻译':'번역가','教师':'교사','厨师':'요리사','护士':'간호사','医生':'의사','律师':'변호사','记者':'기자','摄影师':'포토그래퍼','编辑':'편집자','秘书':'비서','助理':'어시스턴트','总监':'총감독','总经理':'총괄 매니저','副总':'부사장','CEO':'대표이사','CTO':'기술이사','CFO':'재무이사','实习生':'인턴','研究员':'연구원','工程师':'엔지니어','技术员':'기술자','销售':'영업','采购':'구매','物流':'물류','仓管':'창고관리','品控':'품질관리','测试':'테스터','UI设计':'UI 디자이너','UX设计':'UX 디자이너','平面设计':'그래픽 디자이너','插画师':'일러스트레이터','视频编辑':'영상 편집','主播':'방송인/크리에이터','网红':'인플루언서','公关':'홍보','法务':'법무','审计':'감사','行政':'행정','财务':'재무','导游':'가이드','保安':'보안','清洁':'청소','配送':'배달','司机':'운전기사','服务员':'서비스직','收银':'캐셔',
  'Software Engineer':'소프트웨어 엔지니어','Sales Manager':'영업 매니저','Accountant':'회계사','Designer':'디자이너','Marketing':'마케팅','HR':'인사','Frontend Developer':'프론트엔드 개발자','Backend Developer':'백엔드 개발자','Product Manager':'프로덕트 매니저','Project Manager':'프로젝트 매니저','Data Analyst':'데이터 분석가','Operations':'운영','Customer Service':'고객서비스','Translator':'번역가','Teacher':'교사','Chef':'요리사','Nurse':'간호사','Doctor':'의사','Lawyer':'변호사','Intern':'인턴','Researcher':'연구원','Engineer':'엔지니어',
}

const DEPARTMENTS = {
  '技术部':'기술부','市场部':'마케팅부','销售部':'영업부','人事部':'인사부','财务部':'재무부','研发部':'연구개발부','设计部':'디자인부','运营部':'운영부','客服部':'고객서비스부','法务部':'법무부','行政部':'총무부','品控部':'품질관리부','采购部':'구매부','物流部':'물류부','公关部':'홍보부','总裁办':'대표이사실','秘书处':'비서실','企划部':'기획부','审计部':'감사부','国际部':'국제부','战略部':'전략부','生产部':'생산부','仓储部':'창고부','培训部':'교육부','投资部':'투자부',
}

const EDUCATION = {
  '本科':'학사','硕士':'석사','博士':'박사','专科':'전문학사','高中':'고등학교','MBA':'MBA','毕业':'졸업','在读':'재학중','肄业':'수료','学士学位':'학사학위','硕士学位':'석사학위','博士学位':'박사학위','计算机科学':'컴퓨터공학','经济学':'경제학','工商管理':'경영학','国际贸易':'국제무역','中文':'중국어','英语':'영어','韩语':'한국어','法学':'법학','医学':'의학','建筑':'건축학','电气工程':'전기공학','机械工程':'기계공학',
  "Bachelor's":'학사',"Master's":'석사','PhD':'박사','Diploma':'전문학사','High School':'고등학교',
}

function autoTranslate(text, dict) {
  if (!text) return ''
  if (dict[text]) return dict[text]
  // Try partial match
  for (const [k, v] of Object.entries(dict)) {
    if (text.includes(k)) return text.replace(k, v)
  }
  return text
}

const INTRO_TEMPLATES = [
  {
    ko: '저는 [국적]에서 온 [이름]입니다. [전공]을 전공하였으며, [경력년수]년간 [분야]에서 근무한 경험이 있습니다.',
    zh: '我是来自[국적]的[이름]。主修[전공]，在[분야]领域有[경력년수]年的工作经验。',
    en: 'I am [이름] from [국적]. I majored in [전공] and have [경력년수] years of experience in [분야].',
  },
  {
    ko: '한국에서 [분야]의 경험을 쌓고 싶어 지원하게 되었습니다.',
    zh: '希望在韩国积累[분야]方面的经验，因此申请了此职位。',
    en: 'I am applying to gain experience in [분야] in Korea.',
  },
  {
    ko: '저의 강점은 [강점]이며, 이를 통해 회사에 기여하고 싶습니다.',
    zh: '我的优势是[강점]，希望通过此为公司做出贡献。',
    en: 'My strength is [강점], and I wish to contribute to the company through it.',
  },
  {
    ko: '다국어 능력과 다문화 경험을 바탕으로 글로벌 업무에 기여하겠습니다.',
    zh: '凭借多语言能力和跨文化经验，为全球化业务贡献力量。',
    en: 'I will contribute to global operations with multilingual skills and cross-cultural experience.',
  },
  {
    ko: '성실하고 책임감 있는 태도로 맡은 업무를 완수하겠습니다.',
    zh: '以诚实和负责任的态度完成所有工作。',
    en: 'I will complete my duties with sincerity and responsibility.',
  },
  {
    ko: '[전공] 분야에서 [경력년수]년간 쌓은 전문성을 귀사에서 발휘하고 싶습니다.',
    zh: '希望在贵公司发挥在[전공]领域[경력년수]年积累的专业能力。',
    en: 'I want to apply my [경력년수] years of expertise in [전공] at your company.',
  },
  {
    ko: '한국 문화에 깊은 관심이 있으며, 한국어 능력을 업무에 적극 활용하겠습니다.',
    zh: '对韩国文化有深厚兴趣，将积极运用韩语能力开展工作。',
    en: 'I have deep interest in Korean culture and will actively use my Korean skills at work.',
  },
  {
    ko: '팀워크를 중시하며, 동료들과 원활한 소통으로 업무 효율을 높이겠습니다.',
    zh: '重视团队合作，通过与同事的顺畅沟通提高工作效率。',
    en: 'I value teamwork and will enhance efficiency through smooth communication.',
  },
  {
    ko: '빠른 학습 능력을 바탕으로 새로운 환경에 빠르게 적응하겠습니다.',
    zh: '凭借快速学习能力，迅速适应新环境。',
    en: 'With my quick learning ability, I will adapt rapidly to new environments.',
  },
  {
    ko: '귀사의 [분야] 사업에 공감하며, 함께 성장하고 싶습니다.',
    zh: '认同贵公司[분야]事业的方向，希望共同成长。',
    en: "I resonate with your company's [분야] business and wish to grow together.",
  },
  {
    ko: '외국인의 시각으로 한국 시장에 대한 새로운 인사이트를 제공하겠습니다.',
    zh: '从外国人的视角为韩国市场提供新的见解。',
    en: "I will provide fresh insights into the Korean market from a foreigner's perspective.",
  },
  {
    ko: '끊임없이 자기계발에 힘쓰며, 전문가로 성장하겠습니다.',
    zh: '不断自我提升，成长为专业人才。',
    en: 'I will continue self-improvement and grow as a professional.',
  },
]

const STORAGE_KEY = 'hp_resume_data'

function loadData() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) } catch { return null }
}

const emptyData = () => ({
  basic: { nameCn: '', nameKo: '', birth: '', nationality: '', visaType: '', phone: '', email: '' },
  education: [{ school: '', major: '', year: '', degree: '' }],
  career: [{ company: '', position: '', department: '', startDate: '', endDate: '', description: '' }],
  certs: [{ name: '', level: '' }],
  topik: '', hsk: '',
  intro: '',
  introTemplate: -1,
})

export default function ResumeTab({ lang, profile }) {
  const [step, setStep] = useState(1)
  const [data, setData] = useState(() => loadData() || emptyData())
  const [copied, setCopied] = useState(false)
  const [tipsOpen, setTipsOpen] = useState(false)
  const printRef = useRef(null)

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  }, [data])

  const updateBasic = (k, v) => setData(d => ({ ...d, basic: { ...d.basic, [k]: v } }))
  const updateList = (key, idx, field, val) => setData(d => {
    const arr = [...d[key]]; arr[idx] = { ...arr[idx], [field]: val }; return { ...d, [key]: arr }
  })
  const addItem = (key, empty) => setData(d => ({ ...d, [key]: [...d[key], empty] }))
  const removeItem = (key, idx) => setData(d => ({ ...d, [key]: d[key].filter((_, i) => i !== idx) }))

  const steps = [
    { num: 1, icon: User, label: { ko: '기본정보', zh: '基本信息', en: 'Basic Info' } },
    { num: 2, icon: GraduationCap, label: { ko: '학력', zh: '学历', en: 'Education' } },
    { num: 3, icon: Briefcase, label: { ko: '경력', zh: '工作经历', en: 'Career' } },
    { num: 4, icon: Award, label: { ko: '자격증/어학', zh: '资格证/语言', en: 'Certs/Lang' } },
    { num: 5, icon: PenTool, label: { ko: '자기소개', zh: '自我介绍', en: 'Introduction' } },
  ]

  const inputCls = 'w-full bg-[#F3F4F6] rounded-xl px-4 py-3 text-sm border-0 outline-none focus:ring-2 focus:ring-[#111827]/30 placeholder:text-[#9CA3AF] text-[#111827]'
  const labelCls = 'text-xs text-[#6B7280] font-medium block mb-1.5'
  const cardCls = 'bg-white rounded-2xl p-5 border border-[#E5E7EB] card-glow'

  const handleCopy = () => {
    if (!printRef.current) return
    const text = printRef.current.innerText
    navigator.clipboard.writeText(text).then(() => { setCopied(true); setTimeout(() => setCopied(false), 2000) })
  }

  const handlePrint = () => window.print()

  return (
    <div className="space-y-6 animate-fade-up">
      {/* Step Indicator */}
      <div className="flex items-center justify-between gap-1">
        {steps.map((s, i) => {
          const Icon = s.icon
          const active = step === s.num
          const done = step > s.num
          return (
            <button key={s.num} onClick={() => setStep(s.num)}
              className={`flex-1 flex flex-col items-center gap-1 py-2 rounded-xl transition-all ${active ? 'bg-[#111827] text-white' : done ? 'bg-[#F3F4F6] text-[#111827]' : 'bg-[#F3F4F6] text-[#9CA3AF]'}`}>
              <Icon size={16} />
              <span className="text-[10px] font-medium">{L(lang, s.label)}</span>
            </button>
          )
        })}
      </div>

      {/* Step 1: Basic Info */}
      {step === 1 && (
        <div className={cardCls}>
          <h3 className="font-bold text-[#111827] text-sm mb-4">{L(lang, { ko: '기본정보', zh: '基本信息', en: 'Basic Information' })}</h3>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelCls}>{L(lang, { ko: '이름 (한자/영문)', zh: '姓名（汉字/英文）', en: 'Name (Chinese/English)' })}</label>
                <input className={inputCls} value={data.basic.nameCn} onChange={e => updateBasic('nameCn', e.target.value)} placeholder="王小明 / Wang Xiaoming" />
              </div>
              <div>
                <label className={labelCls}>{L(lang, { ko: '이름 (한글)', zh: '姓名（韩文）', en: 'Name (Korean)' })}</label>
                <input className={inputCls} value={data.basic.nameKo} onChange={e => updateBasic('nameKo', e.target.value)} placeholder="왕샤오밍" />
              </div>
            </div>
            <div>
              <label className={labelCls}>{L(lang, { ko: '생년월일', zh: '出生日期', en: 'Date of Birth' })}</label>
              <input type="date" className={inputCls} value={data.basic.birth} onChange={e => updateBasic('birth', e.target.value)} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelCls}>{L(lang, { ko: '국적', zh: '国籍', en: 'Nationality' })}</label>
                <input className={inputCls} value={data.basic.nationality} onChange={e => updateBasic('nationality', e.target.value)} placeholder={L(lang, { ko: '중국', zh: '中国', en: 'China' })} />
              </div>
              <div>
                <label className={labelCls}>{L(lang, { ko: '비자유형', zh: '签证类型', en: 'Visa Type' })}</label>
                <input className={inputCls} value={data.basic.visaType} onChange={e => updateBasic('visaType', e.target.value)} placeholder="E-7, D-10..." />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelCls}>{L(lang, { ko: '연락처', zh: '联系电话', en: 'Phone' })}</label>
                <input className={inputCls} value={data.basic.phone} onChange={e => updateBasic('phone', e.target.value)} placeholder="010-1234-5678" />
              </div>
              <div>
                <label className={labelCls}>{L(lang, { ko: '이메일', zh: '邮箱', en: 'Email' })}</label>
                <input className={inputCls} type="email" value={data.basic.email} onChange={e => updateBasic('email', e.target.value)} placeholder="email@example.com" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Step 2: Education */}
      {step === 2 && (
        <div className={cardCls}>
          <h3 className="font-bold text-[#111827] text-sm mb-4">{L(lang, { ko: '학력', zh: '学历', en: 'Education' })}</h3>
          <div className="space-y-4">
            {data.education.map((edu, i) => (
              <div key={i} className="bg-[#F9FAFB] rounded-xl p-4 space-y-3 relative">
                {data.education.length > 1 && (
                  <button onClick={() => removeItem('education', i)} className="absolute top-3 right-3 text-[#9CA3AF] hover:text-red-500"><Trash2 size={14} /></button>
                )}
                <div>
                  <label className={labelCls}>{L(lang, { ko: '학교명', zh: '学校名称', en: 'School Name' })}</label>
                  <input className={inputCls} value={edu.school} onChange={e => updateList('education', i, 'school', e.target.value)} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={labelCls}>{L(lang, { ko: '전공', zh: '专业', en: 'Major' })}</label>
                    <input className={inputCls} value={edu.major} onChange={e => updateList('education', i, 'major', e.target.value)} />
                    {edu.major && autoTranslate(edu.major, EDUCATION) !== edu.major && (
                      <p className="text-[10px] text-[#111827] mt-1">= {autoTranslate(edu.major, EDUCATION)}</p>
                    )}
                  </div>
                  <div>
                    <label className={labelCls}>{L(lang, { ko: '학위', zh: '学位', en: 'Degree' })}</label>
                    <input className={inputCls} value={edu.degree} onChange={e => updateList('education', i, 'degree', e.target.value)} placeholder={L(lang, { ko: '학사, 석사...', zh: '本科、硕士...', en: "Bachelor's, Master's..." })} />
                    {edu.degree && autoTranslate(edu.degree, EDUCATION) !== edu.degree && (
                      <p className="text-[10px] text-[#111827] mt-1">= {autoTranslate(edu.degree, EDUCATION)}</p>
                    )}
                  </div>
                </div>
                <div>
                  <label className={labelCls}>{L(lang, { ko: '졸업년도', zh: '毕业年份', en: 'Graduation Year' })}</label>
                  <input className={inputCls} value={edu.year} onChange={e => updateList('education', i, 'year', e.target.value)} placeholder="2023" />
                </div>
              </div>
            ))}
            <button onClick={() => addItem('education', { school: '', major: '', year: '', degree: '' })}
              className="flex items-center gap-1 text-xs text-[#111827] font-medium hover:underline">
              <Plus size={14} /> {L(lang, { ko: '학력 추가', zh: '添加学历', en: 'Add Education' })}
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Career */}
      {step === 3 && (
        <div className={cardCls}>
          <h3 className="font-bold text-[#111827] text-sm mb-4">{L(lang, { ko: '경력', zh: '工作经历', en: 'Career' })}</h3>
          <div className="space-y-4">
            {data.career.map((c, i) => (
              <div key={i} className="bg-[#F9FAFB] rounded-xl p-4 space-y-3 relative">
                {data.career.length > 1 && (
                  <button onClick={() => removeItem('career', i)} className="absolute top-3 right-3 text-[#9CA3AF] hover:text-red-500"><Trash2 size={14} /></button>
                )}
                <div>
                  <label className={labelCls}>{L(lang, { ko: '회사명', zh: '公司名称', en: 'Company' })}</label>
                  <input className={inputCls} value={c.company} onChange={e => updateList('career', i, 'company', e.target.value)} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={labelCls}>{L(lang, { ko: '직위', zh: '职位', en: 'Position' })}</label>
                    <input className={inputCls} value={c.position} onChange={e => updateList('career', i, 'position', e.target.value)} />
                    {c.position && autoTranslate(c.position, JOB_TITLES) !== c.position && (
                      <p className="text-[10px] text-[#111827] mt-1">= {autoTranslate(c.position, JOB_TITLES)}</p>
                    )}
                  </div>
                  <div>
                    <label className={labelCls}>{L(lang, { ko: '부서', zh: '部门', en: 'Department' })}</label>
                    <input className={inputCls} value={c.department} onChange={e => updateList('career', i, 'department', e.target.value)} />
                    {c.department && autoTranslate(c.department, DEPARTMENTS) !== c.department && (
                      <p className="text-[10px] text-[#111827] mt-1">= {autoTranslate(c.department, DEPARTMENTS)}</p>
                    )}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={labelCls}>{L(lang, { ko: '시작일', zh: '开始日期', en: 'Start Date' })}</label>
                    <input type="month" className={inputCls} value={c.startDate} onChange={e => updateList('career', i, 'startDate', e.target.value)} />
                  </div>
                  <div>
                    <label className={labelCls}>{L(lang, { ko: '종료일', zh: '结束日期', en: 'End Date' })}</label>
                    <input type="month" className={inputCls} value={c.endDate} onChange={e => updateList('career', i, 'endDate', e.target.value)} />
                  </div>
                </div>
                <div>
                  <label className={labelCls}>{L(lang, { ko: '업무내용', zh: '工作内容', en: 'Description' })}</label>
                  <textarea className={inputCls + ' min-h-[60px] resize-none'} value={c.description} onChange={e => updateList('career', i, 'description', e.target.value)} />
                </div>
              </div>
            ))}
            <button onClick={() => addItem('career', { company: '', position: '', department: '', startDate: '', endDate: '', description: '' })}
              className="flex items-center gap-1 text-xs text-[#111827] font-medium hover:underline">
              <Plus size={14} /> {L(lang, { ko: '경력 추가', zh: '添加经历', en: 'Add Career' })}
            </button>
          </div>
        </div>
      )}

      {/* Step 4: Certs & Language */}
      {step === 4 && (
        <div className={cardCls}>
          <h3 className="font-bold text-[#111827] text-sm mb-4">{L(lang, { ko: '자격증 / 어학', zh: '资格证 / 语言', en: 'Certifications / Language' })}</h3>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelCls}>TOPIK {L(lang, { ko: '등급', zh: '等级', en: 'Level' })}</label>
                <select className={inputCls} value={data.topik} onChange={e => setData(d => ({ ...d, topik: e.target.value }))}>
                  <option value="">-</option>
                  {[1,2,3,4,5,6].map(n => <option key={n} value={n}>{n}{L(lang, { ko: '급', zh: '级', en: '' })}</option>)}
                </select>
              </div>
              <div>
                <label className={labelCls}>HSK {L(lang, { ko: '등급', zh: '等级', en: 'Level' })}</label>
                <select className={inputCls} value={data.hsk} onChange={e => setData(d => ({ ...d, hsk: e.target.value }))}>
                  <option value="">-</option>
                  {[1,2,3,4,5,6].map(n => <option key={n} value={n}>{n}{L(lang, { ko: '급', zh: '级', en: '' })}</option>)}
                </select>
              </div>
            </div>
            <div className="space-y-3">
              <label className={labelCls}>{L(lang, { ko: '기타 자격증', zh: '其他资格证', en: 'Other Certifications' })}</label>
              {data.certs.map((c, i) => (
                <div key={i} className="flex gap-2 items-center">
                  <input className={inputCls + ' flex-1'} value={c.name} onChange={e => updateList('certs', i, 'name', e.target.value)}
                    placeholder={L(lang, { ko: '자격증명', zh: '证书名称', en: 'Certificate Name' })} />
                  <input className={inputCls + ' w-24'} value={c.level} onChange={e => updateList('certs', i, 'level', e.target.value)}
                    placeholder={L(lang, { ko: '등급', zh: '等级', en: 'Level' })} />
                  {data.certs.length > 1 && (
                    <button onClick={() => removeItem('certs', i)} className="text-[#9CA3AF] hover:text-red-500 shrink-0"><Trash2 size={14} /></button>
                  )}
                </div>
              ))}
              <button onClick={() => addItem('certs', { name: '', level: '' })}
                className="flex items-center gap-1 text-xs text-[#111827] font-medium hover:underline">
                <Plus size={14} /> {L(lang, { ko: '자격증 추가', zh: '添加资格证', en: 'Add Certification' })}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Step 5: Introduction */}
      {step === 5 && (
        <div className="space-y-4">
          <div className={cardCls}>
            <h3 className="font-bold text-[#111827] text-sm mb-4">{L(lang, { ko: '자기소개', zh: '自我介绍', en: 'Self Introduction' })}</h3>
            <p className="text-xs text-[#6B7280] mb-3">{L(lang, { ko: '템플릿을 선택하거나 직접 작성하세요', zh: '选择模板或自行填写', en: 'Select a template or write your own' })}</p>
            <div className="space-y-2 mb-4 max-h-48 overflow-y-auto">
              {INTRO_TEMPLATES.map((tmpl, i) => (
                <button key={i} onClick={() => setData(d => ({ ...d, intro: tmpl.ko, introTemplate: i }))}
                  className={`w-full text-left text-xs p-3 rounded-xl border transition-all ${data.introTemplate === i ? 'border-[#111827] bg-[#F9FAFB]' : 'border-[#E5E7EB] hover:border-[#111827]/40'}`}>
                  <span className="text-[#6B7280]">{i + 1}.</span> {L(lang, tmpl)}
                </button>
              ))}
            </div>
            <textarea className={inputCls + ' min-h-[120px] resize-none'} value={data.intro}
              onChange={e => setData(d => ({ ...d, intro: e.target.value, introTemplate: -1 }))}
              placeholder={L(lang, { ko: '자기소개를 작성하세요...', zh: '请填写自我介绍...', en: 'Write your introduction...' })} />
          </div>

          {/* Korean Resume Preview */}
          <div className={cardCls}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-[#111827] text-sm flex items-center gap-2">
                <FileText size={16} /> {L(lang, { ko: '한국어 이력서 미리보기', zh: '韩语简历预览', en: 'Korean Resume Preview' })}
              </h3>
              <div className="flex gap-2">
                <button onClick={handleCopy} className="text-xs text-[#6B7280] hover:text-[#111827] flex items-center gap-1">
                  {copied ? <Check size={12} /> : <Copy size={12} />} {copied ? 'OK' : L(lang, { ko: '복사', zh: '复制', en: 'Copy' })}
                </button>
                <button onClick={handlePrint} className="text-xs text-[#6B7280] hover:text-[#111827] flex items-center gap-1">
                  <Printer size={12} /> {L(lang, { ko: '인쇄', zh: '打印', en: 'Print' })}
                </button>
              </div>
            </div>
            <div ref={printRef} className="border border-[#E5E7EB] rounded-xl p-4 text-xs space-y-3 bg-white print:p-8">
              <h2 className="text-center font-bold text-lg text-[#111827] mb-4">
                {L(lang, { ko: '이 력 서', zh: '履 历 书', en: 'RESUME' })}
              </h2>
              <table className="w-full border-collapse text-[#111827]">
                <tbody>
                  <tr className="border border-[#D1D5DB]">
                    <td className="border border-[#D1D5DB] bg-[#F9FAFB] px-3 py-2 font-semibold w-24">{L(lang, { ko: '성명', zh: '姓名', en: 'Name' })}</td>
                    <td className="border border-[#D1D5DB] px-3 py-2">{data.basic.nameKo || data.basic.nameCn || '-'}</td>
                    <td className="border border-[#D1D5DB] bg-[#F9FAFB] px-3 py-2 font-semibold w-24">{L(lang, { ko: '한자/영문', zh: '汉字/英文', en: 'Chinese/EN' })}</td>
                    <td className="border border-[#D1D5DB] px-3 py-2">{data.basic.nameCn || '-'}</td>
                  </tr>
                  <tr className="border border-[#D1D5DB]">
                    <td className="border border-[#D1D5DB] bg-[#F9FAFB] px-3 py-2 font-semibold">{L(lang, { ko: '생년월일', zh: '出生日期', en: 'DOB' })}</td>
                    <td className="border border-[#D1D5DB] px-3 py-2">{data.basic.birth || '-'}</td>
                    <td className="border border-[#D1D5DB] bg-[#F9FAFB] px-3 py-2 font-semibold">{L(lang, { ko: '국적', zh: '国籍', en: 'Nationality' })}</td>
                    <td className="border border-[#D1D5DB] px-3 py-2">{data.basic.nationality || '-'}</td>
                  </tr>
                  <tr className="border border-[#D1D5DB]">
                    <td className="border border-[#D1D5DB] bg-[#F9FAFB] px-3 py-2 font-semibold">{L(lang, { ko: '비자유형', zh: '签证', en: 'Visa' })}</td>
                    <td className="border border-[#D1D5DB] px-3 py-2">{data.basic.visaType || '-'}</td>
                    <td className="border border-[#D1D5DB] bg-[#F9FAFB] px-3 py-2 font-semibold">{L(lang, { ko: '연락처', zh: '电话', en: 'Phone' })}</td>
                    <td className="border border-[#D1D5DB] px-3 py-2">{data.basic.phone || '-'}</td>
                  </tr>
                  <tr className="border border-[#D1D5DB]">
                    <td className="border border-[#D1D5DB] bg-[#F9FAFB] px-3 py-2 font-semibold">{L(lang, { ko: '이메일', zh: '邮箱', en: 'Email' })}</td>
                    <td className="border border-[#D1D5DB] px-3 py-2" colSpan={3}>{data.basic.email || '-'}</td>
                  </tr>
                </tbody>
              </table>

              {/* Education */}
              <h4 className="font-bold text-[#111827] mt-4 mb-1">{L(lang, { ko: '학력사항', zh: '学历', en: 'Education' })}</h4>
              <table className="w-full border-collapse text-[#111827]">
                <thead>
                  <tr className="bg-[#F9FAFB] border border-[#D1D5DB]">
                    <th className="border border-[#D1D5DB] px-2 py-1.5 text-left font-semibold">{L(lang, { ko: '학교명', zh: '学校', en: 'School' })}</th>
                    <th className="border border-[#D1D5DB] px-2 py-1.5 text-left font-semibold">{L(lang, { ko: '전공', zh: '专业', en: 'Major' })}</th>
                    <th className="border border-[#D1D5DB] px-2 py-1.5 text-left font-semibold">{L(lang, { ko: '학위', zh: '学位', en: 'Degree' })}</th>
                    <th className="border border-[#D1D5DB] px-2 py-1.5 text-left font-semibold">{L(lang, { ko: '졸업', zh: '毕业', en: 'Year' })}</th>
                  </tr>
                </thead>
                <tbody>
                  {data.education.filter(e => e.school).map((edu, i) => (
                    <tr key={i} className="border border-[#D1D5DB]">
                      <td className="border border-[#D1D5DB] px-2 py-1.5">{edu.school}</td>
                      <td className="border border-[#D1D5DB] px-2 py-1.5">{autoTranslate(edu.major, EDUCATION) || edu.major}</td>
                      <td className="border border-[#D1D5DB] px-2 py-1.5">{autoTranslate(edu.degree, EDUCATION) || edu.degree}</td>
                      <td className="border border-[#D1D5DB] px-2 py-1.5">{edu.year}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Career */}
              <h4 className="font-bold text-[#111827] mt-4 mb-1">{L(lang, { ko: '경력사항', zh: '工作经历', en: 'Career' })}</h4>
              <table className="w-full border-collapse text-[#111827]">
                <thead>
                  <tr className="bg-[#F9FAFB] border border-[#D1D5DB]">
                    <th className="border border-[#D1D5DB] px-2 py-1.5 text-left font-semibold">{L(lang, { ko: '기간', zh: '时间', en: 'Period' })}</th>
                    <th className="border border-[#D1D5DB] px-2 py-1.5 text-left font-semibold">{L(lang, { ko: '회사', zh: '公司', en: 'Company' })}</th>
                    <th className="border border-[#D1D5DB] px-2 py-1.5 text-left font-semibold">{L(lang, { ko: '직위', zh: '职位', en: 'Position' })}</th>
                    <th className="border border-[#D1D5DB] px-2 py-1.5 text-left font-semibold">{L(lang, { ko: '업무', zh: '工作内容', en: 'Description' })}</th>
                  </tr>
                </thead>
                <tbody>
                  {data.career.filter(c => c.company).map((c, i) => (
                    <tr key={i} className="border border-[#D1D5DB]">
                      <td className="border border-[#D1D5DB] px-2 py-1.5 whitespace-nowrap">{c.startDate} ~ {c.endDate}</td>
                      <td className="border border-[#D1D5DB] px-2 py-1.5">{c.company}</td>
                      <td className="border border-[#D1D5DB] px-2 py-1.5">{autoTranslate(c.position, JOB_TITLES)}</td>
                      <td className="border border-[#D1D5DB] px-2 py-1.5">{c.description}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Certs */}
              {(data.topik || data.hsk || data.certs.some(c => c.name)) && (
                <>
                  <h4 className="font-bold text-[#111827] mt-4 mb-1">{L(lang, { ko: '자격/어학', zh: '资格/语言', en: 'Certifications' })}</h4>
                  <div className="space-y-1">
                    {data.topik && <p>TOPIK {data.topik}{L(lang, { ko: '급', zh: '级', en: '' })}</p>}
                    {data.hsk && <p>HSK {data.hsk}{L(lang, { ko: '급', zh: '级', en: '' })}</p>}
                    {data.certs.filter(c => c.name).map((c, i) => <p key={i}>{c.name} {c.level}</p>)}
                  </div>
                </>
              )}

              {/* Intro */}
              {data.intro && (
                <>
                  <h4 className="font-bold text-[#111827] mt-4 mb-1">{L(lang, { ko: '자기소개', zh: '自我介绍', en: 'Introduction' })}</h4>
                  <p className="whitespace-pre-wrap text-[#374151]">{data.intro}</p>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Navigation Buttons */}
      <div className="flex gap-3">
        {step > 1 && (
          <button onClick={() => setStep(step - 1)}
            className="flex-1 py-3 rounded-xl border border-[#E5E7EB] text-[#6B7280] text-sm font-semibold hover:bg-[#F9FAFB] transition-all">
            {L(lang, { ko: '이전', zh: '上一步', en: 'Previous' })}
          </button>
        )}
        {step < 5 && (
          <button onClick={() => setStep(step + 1)}
            className="flex-1 py-3 rounded-xl bg-[#111827] text-white text-sm font-semibold hover:bg-[#1F2937] transition-all">
            {L(lang, { ko: '다음', zh: '下一步', en: 'Next' })} <ChevronRight size={14} className="inline ml-1" />
          </button>
        )}
      </div>

      {/* Tips */}
      <div className={cardCls}>
        <button onClick={() => setTipsOpen(!tipsOpen)} className="w-full flex items-center justify-between">
          <span className="font-bold text-[#111827] text-sm flex items-center gap-2">
            <Lightbulb size={16} /> {L(lang, { ko: '이력서 작성 팁', zh: '简历撰写技巧', en: 'Resume Tips' })}
          </span>
          {tipsOpen ? <ChevronUp size={16} className="text-[#6B7280]" /> : <ChevronDown size={16} className="text-[#6B7280]" />}
        </button>
        {tipsOpen && (
          <div className="mt-4 space-y-3 text-xs text-[#6B7280]">
            <div className="bg-[#F9FAFB] rounded-xl p-3">
              <p className="font-semibold text-[#111827] mb-1">{L(lang, { ko: '증명사진', zh: '证件照', en: 'ID Photo' })}</p>
              <p>{L(lang, { ko: '3x4cm, 정장 착용, 흰색 배경, 최근 6개월 이내 촬영', zh: '3x4cm，穿正装，白色背景，6个月内拍摄', en: '3x4cm, formal attire, white background, taken within 6 months' })}</p>
            </div>
            <div className="bg-[#F9FAFB] rounded-xl p-3">
              <p className="font-semibold text-[#111827] mb-1">{L(lang, { ko: '희망연봉', zh: '期望薪资', en: 'Expected Salary' })}</p>
              <p>{L(lang, { ko: '"면접 시 협의" 또는 "회사 내규에 따름" 권장', zh: '"面试时协商"或"按公司规定"为宜', en: '"Negotiable at interview" or "Per company policy" recommended' })}</p>
            </div>
            <div className="bg-[#F9FAFB] rounded-xl p-3">
              <p className="font-semibold text-[#111827] mb-1">{L(lang, { ko: '이력서 vs 자기소개서', zh: '简历 vs 自我介绍', en: 'Resume vs Cover Letter' })}</p>
              <p>{L(lang, { ko: '이력서 = 사실 기반 (학력, 경력), 자기소개서 = 동기와 스토리', zh: '简历 = 事实为主（学历、经历），自我介绍 = 动机与故事', en: 'Resume = factual (education, career), Cover Letter = motivation & story' })}</p>
            </div>
            <div className="bg-[#F9FAFB] rounded-xl p-3">
              <p className="font-semibold text-[#111827] mb-1">{L(lang, { ko: '외국인 추가 서류', zh: '外国人附加材料', en: 'Additional Documents for Foreigners' })}</p>
              <p>{L(lang, { ko: '외국인등록증, 취업허가서/특정활동허가서, 학력인증(아포스티유)', zh: '外国人登录证、就业许可证/特定活动许可证、学历认证（海牙认证）', en: 'ARC, Work Permit/Activity Permit, Degree Authentication (Apostille)' })}</p>
            </div>
          </div>
        )}
      </div>

      {/* Save indicator */}
      <div className="flex items-center justify-center gap-1 text-[10px] text-[#9CA3AF]">
        <Save size={10} /> {L(lang, { ko: '자동 저장됨', zh: '已自动保存', en: 'Auto-saved' })}
      </div>
    </div>
  )
}
