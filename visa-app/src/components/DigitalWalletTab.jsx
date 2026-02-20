import { useState, useEffect, useRef } from 'react'
import { CreditCard, FileText, Search, Plus, Trash2, Edit3, Eye, EyeOff, Clock, Shield, ChevronDown, ChevronUp, Smartphone, Building, AlertTriangle, Check, X, Maximize2, MinusCircle } from 'lucide-react'

function L(lang, d) { if (typeof d === 'string') return d; return d?.[lang] || d?.en || d?.zh || d?.ko || '' }

// ─── Surname Transliteration Dictionary ───
const SURNAME_MAP = {
  '王':'왕','李':'이','张':'장','刘':'류/유','陈':'진/천','杨':'양','黄':'황','赵':'조','周':'주','吴':'오','徐':'서','孙':'손','马':'마','朱':'주','胡':'호','林':'임','郭':'곽','何':'하','高':'고','罗':'라/나','郑':'정','梁':'량/양','谢':'사','宋':'송','唐':'당','韩':'한','许':'허','邓':'등','冯':'풍','曹':'조','彭':'팽','蔡':'채','潘':'반','田':'전','董':'동','袁':'원','于':'우','余':'여','叶':'엽','蒋':'장','杜':'두','苏':'소','魏':'위','程':'정','吕':'여','丁':'정','沈':'심','任':'임','姚':'요','卢':'노/로','傅':'부','钟':'종','姜':'강','崔':'최','谭':'담','廖':'료','范':'범','汪':'왕','陆':'육','金':'금/김','石':'석','戴':'대','贾':'가','方':'방','邹':'추','熊':'웅','孟':'맹','秦':'진','白':'백','江':'강','阎':'염','薛':'설','尹':'윤','段':'단','雷':'뢰','侯':'후','龙':'용','史':'사','黎':'려','贺':'하','顾':'고','毛':'모','郝':'학','龚':'공','邵':'소','万':'만','覃':'담','武':'무','钱':'전','严':'엄',
}

const DEFAULT_INSTITUTIONS = [
  '출입국관리사무소','국민건강보험공단','국세청','주민센터','경찰서',
  '신한은행','국민은행','하나은행','우리은행','농협',
  'SK텔레콤','KT','LG U+','학교','병원','부동산중개소',
]

const DOC_TYPES = [
  { id: 'arc', label: { ko: '외국인등록증 (ARC)', zh: '外国人登录证', en: 'Alien Registration Card' }, icon: CreditCard, fields: ['number','issueDate','expiryDate','registeredName'], hasExpiry: true },
  { id: 'passport', label: { ko: '여권', zh: '护照', en: 'Passport' }, icon: FileText, fields: ['number','expiryDate','nationality'], hasExpiry: true },
  { id: 'visa', label: { ko: '비자', zh: '签证', en: 'Visa' }, icon: FileText, fields: ['type','expiryDate'], hasExpiry: true },
  { id: 'insurance', label: { ko: '건강보험증', zh: '健康保险证', en: 'Health Insurance' }, icon: Shield, fields: ['number','issueDate'], hasExpiry: false },
  { id: 'license', label: { ko: '운전면허', zh: '驾驶证', en: "Driver's License" }, icon: CreditCard, fields: ['number','expiryDate'], hasExpiry: true },
  { id: 'bank', label: { ko: '은행계좌', zh: '银行账户', en: 'Bank Account' }, icon: Building, fields: ['bankName','accountNumber'], hasExpiry: false, masked: true },
  { id: 'card', label: { ko: '체크/신용카드', zh: '借记/信用卡', en: 'Debit/Credit Card' }, icon: CreditCard, fields: ['cardCompany','last4'], hasExpiry: false },
  { id: 'telecom', label: { ko: '통신사', zh: '通信公司', en: 'Telecom' }, icon: Smartphone, fields: ['company','phoneNumber','issueDate'], hasExpiry: false },
]

const FIELD_LABELS = {
  number: { ko: '번호', zh: '号码', en: 'Number' },
  issueDate: { ko: '발급일', zh: '发行日', en: 'Issue Date' },
  expiryDate: { ko: '만료일', zh: '到期日', en: 'Expiry Date' },
  registeredName: { ko: '등록이름(한글)', zh: '登记姓名(韩文)', en: 'Registered Name (KR)' },
  nationality: { ko: '국적', zh: '国籍', en: 'Nationality' },
  type: { ko: '종류', zh: '类型', en: 'Type' },
  bankName: { ko: '은행명', zh: '银行名', en: 'Bank Name' },
  accountNumber: { ko: '계좌번호', zh: '账号', en: 'Account Number' },
  cardCompany: { ko: '카드사', zh: '卡公司', en: 'Card Company' },
  last4: { ko: '마지막 4자리', zh: '末四位', en: 'Last 4 digits' },
  company: { ko: '회사명', zh: '公司名', en: 'Company' },
  phoneNumber: { ko: '전화번호', zh: '电话号码', en: 'Phone Number' },
}

const STORAGE_KEY = 'hp_wallet_docs'
const NAME_MAP_KEY = 'hp_wallet_names'

function getDday(dateStr) {
  if (!dateStr) return null
  const t = new Date(dateStr), n = new Date()
  t.setHours(0,0,0,0); n.setHours(0,0,0,0)
  return Math.ceil((t - n) / 864e5)
}

function ddayColor(d) {
  if (d === null) return ''
  if (d < 0) return 'text-red-600 bg-red-50'
  if (d <= 30) return 'text-red-600 bg-red-50'
  if (d <= 90) return 'text-amber-600 bg-amber-50'
  return 'text-green-600 bg-green-50'
}

function maskValue(val) {
  if (!val || val.length <= 4) return val || ''
  return '*'.repeat(val.length - 4) + val.slice(-4)
}

function getSurnameKo(chineseName) {
  if (!chineseName) return []
  const surname = chineseName.charAt(0)
  const ko = SURNAME_MAP[surname]
  if (!ko) return []
  return ko.split('/')
}

// ─── Identity Verification Guide Data ───
const VERIFY_GUIDE = [
  {
    title: { ko: '휴대폰 본인인증 (PASS)', zh: '手机身份验证 (PASS)', en: 'Mobile Verification (PASS)' },
    steps: {
      ko: ['통신사 가입 (본인 명의)', '외국인등록증 정보 등록', 'PASS 앱 설치', '앱에서 본인인증 등록', '각 서비스에서 PASS 인증 사용'],
      zh: ['注册通信公司（本人名义）', '登记外国人登录证信息', '安装PASS应用', '在应用中注册身份验证', '在各服务中使用PASS认证'],
      en: ['Sign up with telecom (your name)', 'Register ARC information', 'Install PASS app', 'Register identity in app', 'Use PASS verification in services'],
    },
    note: { ko: '외국인등록증 + 본인명의 통신사 가입 필수', zh: '需要外国人登录证 + 本人名义通信公司', en: 'Requires ARC + telecom account in your name' },
  },
  {
    title: { ko: '공동인증서 (구 공인인증서)', zh: '共同认证书（原公认认证书）', en: 'Joint Certificate (formerly Accredited)' },
    steps: {
      ko: ['은행 영업점 방문', '외국인등록증 + 여권 지참', '인터넷뱅킹 신청', '공동인증서 발급 (무료)', '유효기간: 1년 (갱신 필요)'],
      zh: ['访问银行营业点', '携带外国人登录证 + 护照', '申请网上银行', '领取共同认证书（免费）', '有效期：1年（需续期）'],
      en: ['Visit bank branch', 'Bring ARC + passport', 'Apply for internet banking', 'Issue joint certificate (free)', 'Valid: 1 year (renewal needed)'],
    },
    note: { ko: '외국인 발급 가능, 은행 방문 필수', zh: '外国人可领取，需访问银行', en: 'Available for foreigners, bank visit required' },
  },
  {
    title: { ko: '간편인증', zh: '简易认证', en: 'Easy Authentication' },
    steps: {
      ko: [
        '카카오인증서: 카카오톡 > 더보기 > 인증서 (외국인 가능, 휴대폰 본인인증 필요)',
        '네이버인증서: 네이버 앱 > 인증서 (외국인 가능, 일부 서비스 제한)',
        '토스 인증: 토스 앱 > 인증서 (외국인등록증 등록 필요)',
      ],
      zh: [
        'Kakao认证：KakaoTalk > 更多 > 认证书（外国人可用，需手机认证）',
        'Naver认证：Naver应用 > 认证书（外国人可用，部分服务受限）',
        'Toss认证：Toss应用 > 认证书（需登记外国人登录证）',
      ],
      en: [
        'Kakao Cert: KakaoTalk > More > Certificate (foreigners OK, phone verification needed)',
        'Naver Cert: Naver app > Certificate (foreigners OK, some limits)',
        'Toss Cert: Toss app > Certificate (ARC registration needed)',
      ],
    },
    note: { ko: '간편인증은 모든 곳에서 사용 가능하지 않음', zh: '简易认证并非所有地方都可使用', en: 'Easy auth not accepted everywhere' },
  },
  {
    title: { ko: '외국인 한정 팁', zh: '外国人专属技巧', en: 'Tips for Foreigners' },
    steps: {
      ko: [
        'PASS 앱이 안 될 때: 은행 공동인증서로 대체',
        '본인인증 없이 가능한 서비스: 네이버 쇼핑(비회원), 쿠팡(이메일 가입), 배달의민족(전화번호)',
        '외국인등록증 모바일 신분증: 정부24 앱에서 발급 가능',
        '비대면 계좌개설: 일부 은행 외국인 가능 (카카오뱅크, 토스뱅크)',
      ],
      zh: [
        'PASS不可用时：用银行共同认证书替代',
        '无需身份验证的服务：Naver购物(非会员)、Coupang(邮箱注册)、外卖民族(电话号码)',
        '外国人登录证移动身份证：可在政府24应用中领取',
        '非面对面开户：部分银行外国人可用（Kakao Bank、Toss Bank）',
      ],
      en: [
        'If PASS fails: use bank joint certificate instead',
        'Services without verification: Naver Shopping (guest), Coupang (email signup), Baemin (phone)',
        'Mobile ARC: available via Government24 app',
        'Non-face-to-face account: some banks allow foreigners (Kakao Bank, Toss Bank)',
      ],
    },
    note: { ko: '상황에 따라 다를 수 있으니 미리 확인', zh: '情况可能因人而异，请提前确认', en: 'May vary by situation, check in advance' },
  },
]

export default function DigitalWalletTab({ lang, profile }) {
  const [section, setSection] = useState('docs') // docs, names, verify, timeline, present
  const [docs, setDocs] = useState(() => {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [] } catch { return [] }
  })
  const [nameMap, setNameMap] = useState(() => {
    try { return JSON.parse(localStorage.getItem(NAME_MAP_KEY)) || {} } catch { return {} }
  })
  const [editingDoc, setEditingDoc] = useState(null)
  const [addingType, setAddingType] = useState(null)
  const [revealedId, setRevealedId] = useState(null)
  const [chineseName, setChineseName] = useState('')
  const [nameSearch, setNameSearch] = useState('')
  const [presentDoc, setPresentDoc] = useState(null)
  const [editingInst, setEditingInst] = useState(null)
  const [newInstName, setNewInstName] = useState('')
  const [newInstKoName, setNewInstKoName] = useState('')
  const revealTimer = useRef(null)

  useEffect(() => { localStorage.setItem(STORAGE_KEY, JSON.stringify(docs)) }, [docs])
  useEffect(() => { localStorage.setItem(NAME_MAP_KEY, JSON.stringify(nameMap)) }, [nameMap])

  const cardCls = 'bg-white rounded-2xl p-5 border border-[#E5E7EB] card-glow'
  const inputCls = 'w-full bg-[#F3F4F6] rounded-xl px-4 py-3 text-sm border-0 outline-none focus:ring-2 focus:ring-[#111827]/30 placeholder:text-[#9CA3AF] text-[#111827]'
  const labelCls = 'text-xs text-[#6B7280] font-medium block mb-1.5'
  const btnPrimary = 'bg-[#111827] text-white text-sm font-semibold py-2.5 px-4 rounded-xl hover:bg-[#1F2937] transition-all'
  const btnSecondary = 'border border-[#E5E7EB] text-[#6B7280] text-sm font-semibold py-2.5 px-4 rounded-xl hover:bg-[#F9FAFB] transition-all'

  const revealData = (docId) => {
    setRevealedId(docId)
    if (revealTimer.current) clearTimeout(revealTimer.current)
    revealTimer.current = setTimeout(() => setRevealedId(null), 3000)
  }

  const saveDoc = (doc) => {
    if (editingDoc !== null) {
      setDocs(d => d.map((dd, i) => i === editingDoc ? doc : dd))
    } else {
      setDocs(d => [...d, doc])
    }
    setAddingType(null)
    setEditingDoc(null)
  }

  const deleteDoc = (idx) => {
    setDocs(d => d.filter((_, i) => i !== idx))
  }

  // Name management
  const institutions = Object.keys(nameMap).length > 0
    ? [...new Set([...DEFAULT_INSTITUTIONS, ...Object.keys(nameMap)])]
    : DEFAULT_INSTITUTIONS

  const setInstName = (inst, koName) => {
    setNameMap(m => ({ ...m, [inst]: koName }))
  }

  const removeInstName = (inst) => {
    setNameMap(m => { const n = { ...m }; delete n[inst]; return n })
  }

  const searchResults = nameSearch
    ? institutions.filter(inst => nameMap[inst] && nameMap[inst].includes(nameSearch))
    : []

  // Timeline: docs with expiry sorted by urgency
  const timelineDocs = docs
    .map((d, i) => ({ ...d, _idx: i, _dday: getDday(d.expiryDate) }))
    .filter(d => d._dday !== null)
    .sort((a, b) => a._dday - b._dday)

  const sectionButtons = [
    { id: 'docs', icon: FileText, label: { ko: '문서 보관함', zh: '文件保管箱', en: 'Documents' } },
    { id: 'names', icon: CreditCard, label: { ko: '이름 관리', zh: '姓名管理', en: 'Name Manager' } },
    { id: 'verify', icon: Shield, label: { ko: '본인인증', zh: '身份验证', en: 'Verification' } },
    { id: 'timeline', icon: Clock, label: { ko: '만료 알림', zh: '到期提醒', en: 'Expiry Alert' } },
  ]

  // ─── Fullscreen Present Mode ───
  if (presentDoc !== null) {
    const doc = docs[presentDoc]
    if (!doc) { setPresentDoc(null); return null }
    const docType = DOC_TYPES.find(t => t.id === doc.docType)
    return (
      <div className="fixed inset-0 z-50 bg-white flex flex-col items-center justify-center p-8" onClick={() => setPresentDoc(null)}>
        <div className="text-center space-y-6 max-w-md">
          <p className="text-sm text-[#6B7280]">{L(lang, docType?.label)}</p>
          {doc.registeredName && <p className="text-4xl font-bold text-[#111827]">{doc.registeredName}</p>}
          {docType?.fields.map(f => {
            if (f === 'registeredName') return null
            const val = doc[f]
            if (!val) return null
            const isMasked = (f === 'accountNumber' || f === 'number')
            return (
              <div key={f} className="text-2xl font-mono text-[#111827] tracking-wider">
                <span className="text-sm text-[#6B7280] block mb-1">{L(lang, FIELD_LABELS[f])}</span>
                {isMasked ? maskValue(val) : val}
              </div>
            )
          })}
          <p className="text-xs text-[#9CA3AF] mt-8">{L(lang, { ko: '화면을 터치하면 닫힙니다', zh: '点击屏幕关闭', en: 'Tap to close' })}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-fade-up">
      {/* Section Selector */}
      <div className="grid grid-cols-4 gap-2">
        {sectionButtons.map(s => {
          const Icon = s.icon
          return (
            <button key={s.id} onClick={() => setSection(s.id)}
              className={`flex flex-col items-center gap-1 py-3 rounded-xl transition-all text-center ${section === s.id ? 'bg-[#111827] text-white' : 'bg-[#F3F4F6] text-[#6B7280]'}`}>
              <Icon size={16} />
              <span className="text-[10px] font-medium">{L(lang, s.label)}</span>
            </button>
          )
        })}
      </div>

      {/* ═══ A. Document Storage ═══ */}
      {section === 'docs' && (
        <div className="space-y-4">
          {/* Add Document */}
          {!addingType ? (
            <div className={cardCls}>
              <h3 className="font-bold text-[#111827] text-sm mb-3">{L(lang, { ko: '문서 추가', zh: '添加文件', en: 'Add Document' })}</h3>
              <div className="grid grid-cols-2 gap-2">
                {DOC_TYPES.map(dt => {
                  const Icon = dt.icon
                  return (
                    <button key={dt.id} onClick={() => { setAddingType(dt.id); setEditingDoc(null) }}
                      className="flex items-center gap-2 text-xs text-left p-3 rounded-xl border border-[#E5E7EB] hover:border-[#111827]/40 transition-all">
                      <Icon size={14} className="text-[#6B7280] shrink-0" />
                      <span className="text-[#111827]">{L(lang, dt.label)}</span>
                    </button>
                  )
                })}
              </div>
            </div>
          ) : (
            <DocForm lang={lang} docType={addingType} existing={editingDoc !== null ? docs[editingDoc] : null}
              onSave={saveDoc} onCancel={() => { setAddingType(null); setEditingDoc(null) }}
              cardCls={cardCls} inputCls={inputCls} labelCls={labelCls} btnPrimary={btnPrimary} btnSecondary={btnSecondary} />
          )}

          {/* Document List */}
          {docs.map((doc, i) => {
            const dt = DOC_TYPES.find(t => t.id === doc.docType)
            if (!dt) return null
            const Icon = dt.icon
            const dday = getDday(doc.expiryDate)
            const revealed = revealedId === i
            return (
              <div key={i} className={cardCls}>
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Icon size={16} className="text-[#6B7280]" />
                    <span className="font-bold text-[#111827] text-sm">{L(lang, dt.label)}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <button onClick={() => setPresentDoc(i)} className="text-[#9CA3AF] hover:text-[#111827]"><Maximize2 size={14} /></button>
                    <button onClick={() => { setEditingDoc(i); setAddingType(doc.docType) }} className="text-[#9CA3AF] hover:text-[#111827]"><Edit3 size={14} /></button>
                    <button onClick={() => deleteDoc(i)} className="text-[#9CA3AF] hover:text-red-500"><Trash2 size={14} /></button>
                  </div>
                </div>
                {dt.fields.map(f => {
                  const val = doc[f]
                  if (!val) return null
                  const isSensitive = f === 'accountNumber' || f === 'number'
                  return (
                    <div key={f} className="flex items-center justify-between text-xs mb-1.5">
                      <span className="text-[#6B7280]">{L(lang, FIELD_LABELS[f])}</span>
                      <div className="flex items-center gap-1">
                        <span className="text-[#111827] font-mono">{isSensitive && !revealed ? maskValue(val) : val}</span>
                        {isSensitive && (
                          <button onClick={() => revealData(i)} className="text-[#9CA3AF] hover:text-[#111827]">
                            {revealed ? <EyeOff size={12} /> : <Eye size={12} />}
                          </button>
                        )}
                      </div>
                    </div>
                  )
                })}
                {dday !== null && (
                  <div className={`mt-2 inline-block text-xs font-bold px-2.5 py-1 rounded-full ${ddayColor(dday)}`}>
                    {dday < 0 ? L(lang, { ko: '만료됨', zh: '已过期', en: 'Expired' })
                      : dday === 0 ? L(lang, { ko: '오늘 만료', zh: '今天到期', en: 'Expires today' })
                      : `D-${dday}`}
                  </div>
                )}
              </div>
            )
          })}

          {docs.length === 0 && !addingType && (
            <div className="text-center py-12 text-[#9CA3AF] text-sm">
              {L(lang, { ko: '등록된 문서가 없습니다', zh: '暂无登记文件', en: 'No documents registered' })}
            </div>
          )}
        </div>
      )}

      {/* ═══ B. Name Management ═══ */}
      {section === 'names' && (
        <div className="space-y-4">
          {/* Chinese Name Input */}
          <div className={cardCls}>
            <h3 className="font-bold text-[#111827] text-sm mb-3">{L(lang, { ko: '중국어 이름 입력', zh: '输入中文姓名', en: 'Enter Chinese Name' })}</h3>
            <input className={inputCls} value={chineseName} onChange={e => setChineseName(e.target.value)}
              placeholder={L(lang, { ko: '예: 王小明', zh: '例：王小明', en: 'e.g. 王小明' })} />
            {chineseName && (
              <div className="mt-3 space-y-2">
                <p className="text-xs text-[#6B7280]">{L(lang, { ko: '성씨 음역 변환', zh: '姓氏音译转换', en: 'Surname Transliteration' })}</p>
                {getSurnameKo(chineseName).length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {getSurnameKo(chineseName).map((ko, i) => (
                      <span key={i} className="text-sm bg-[#F3F4F6] px-3 py-1.5 rounded-full text-[#111827] font-medium">
                        {chineseName.charAt(0)} = {ko}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-[#9CA3AF]">{L(lang, { ko: '사전에 없는 성씨입니다', zh: '词典中没有此姓氏', en: 'Surname not in dictionary' })}</p>
                )}
              </div>
            )}
          </div>

          {/* Search */}
          <div className={cardCls}>
            <h3 className="font-bold text-[#111827] text-sm mb-3">{L(lang, { ko: '어떤 이름으로 등록했지?', zh: '用什么名字注册的？', en: 'Which name did I register?' })}</h3>
            <div className="relative">
              <Search size={14} className="absolute left-3 top-3.5 text-[#9CA3AF]" />
              <input className={inputCls + ' pl-9'} value={nameSearch} onChange={e => setNameSearch(e.target.value)}
                placeholder={L(lang, { ko: '한글 이름으로 검색...', zh: '搜索韩文名...', en: 'Search Korean name...' })} />
            </div>
            {nameSearch && (
              <div className="mt-3 space-y-2">
                {searchResults.length > 0 ? searchResults.map(inst => (
                  <div key={inst} className="flex items-center justify-between bg-[#F9FAFB] rounded-xl px-3 py-2">
                    <span className="text-xs text-[#6B7280]">{inst}</span>
                    <span className="text-sm font-bold text-[#111827]">{nameMap[inst]}</span>
                  </div>
                )) : (
                  <p className="text-xs text-[#9CA3AF]">{L(lang, { ko: '결과 없음', zh: '无结果', en: 'No results' })}</p>
                )}
              </div>
            )}
          </div>

          {/* Institution Name Mapping */}
          <div className={cardCls}>
            <h3 className="font-bold text-[#111827] text-sm mb-3">{L(lang, { ko: '기관별 등록 이름', zh: '各机构登记姓名', en: 'Name by Institution' })}</h3>
            <div className="space-y-2">
              {institutions.map(inst => (
                <div key={inst} className="flex items-center justify-between bg-[#F9FAFB] rounded-xl px-3 py-2.5">
                  <span className="text-xs text-[#6B7280] flex-1">{inst}</span>
                  {editingInst === inst ? (
                    <div className="flex items-center gap-1">
                      <input className="bg-white border border-[#E5E7EB] rounded-lg px-2 py-1 text-xs w-24 outline-none focus:ring-1 focus:ring-[#111827]"
                        value={newInstKoName} onChange={e => setNewInstKoName(e.target.value)}
                        placeholder={L(lang, { ko: '한글 이름', zh: '韩文名', en: 'Korean name' })} />
                      <button onClick={() => { if (newInstKoName) { setInstName(inst, newInstKoName) }; setEditingInst(null); setNewInstKoName('') }}
                        className="text-green-600"><Check size={14} /></button>
                      <button onClick={() => { setEditingInst(null); setNewInstKoName('') }}
                        className="text-[#9CA3AF]"><X size={14} /></button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-[#111827]">{nameMap[inst] || '-'}</span>
                      <button onClick={() => { setEditingInst(inst); setNewInstKoName(nameMap[inst] || '') }}
                        className="text-[#9CA3AF] hover:text-[#111827]"><Edit3 size={12} /></button>
                      {nameMap[inst] && (
                        <button onClick={() => removeInstName(inst)} className="text-[#9CA3AF] hover:text-red-500"><Trash2 size={12} /></button>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
            {/* Add custom institution */}
            <div className="flex gap-2 mt-3">
              <input className={inputCls + ' flex-1'} value={newInstName} onChange={e => setNewInstName(e.target.value)}
                placeholder={L(lang, { ko: '기관명 추가...', zh: '添加机构名...', en: 'Add institution...' })} />
              <button onClick={() => { if (newInstName) { setInstName(newInstName, ''); setNewInstName('') } }}
                className={btnPrimary + ' shrink-0'}><Plus size={14} /></button>
            </div>
          </div>
        </div>
      )}

      {/* ═══ C. Verification Guide ═══ */}
      {section === 'verify' && (
        <div className="space-y-4">
          {VERIFY_GUIDE.map((guide, i) => (
            <VerifySection key={i} guide={guide} lang={lang} cardCls={cardCls} />
          ))}
        </div>
      )}

      {/* ═══ D. Expiry Timeline ═══ */}
      {section === 'timeline' && (
        <div className="space-y-4">
          <div className={cardCls}>
            <h3 className="font-bold text-[#111827] text-sm mb-4">{L(lang, { ko: '만료 일정', zh: '到期时间线', en: 'Expiry Timeline' })}</h3>
            {timelineDocs.length === 0 ? (
              <p className="text-xs text-[#9CA3AF] text-center py-8">
                {L(lang, { ko: '만료일이 있는 문서가 없습니다', zh: '没有有到期日的文件', en: 'No documents with expiry dates' })}
              </p>
            ) : (
              <div className="relative pl-6 space-y-4">
                {/* Vertical line */}
                <div className="absolute left-2 top-0 bottom-0 w-0.5 bg-[#E5E7EB]" />
                {timelineDocs.map((doc, i) => {
                  const dt = DOC_TYPES.find(t => t.id === doc.docType)
                  const dc = ddayColor(doc._dday)
                  return (
                    <div key={i} className="relative">
                      <div className={`absolute -left-4 top-1 w-3 h-3 rounded-full border-2 border-white ${doc._dday <= 30 ? 'bg-red-500' : doc._dday <= 90 ? 'bg-amber-500' : 'bg-green-500'}`} />
                      <div className="bg-[#F9FAFB] rounded-xl p-3">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-bold text-[#111827]">{L(lang, dt?.label)}</span>
                          <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${dc}`}>
                            {doc._dday < 0 ? L(lang, { ko: '만료', zh: '已过期', en: 'Expired' }) : `D-${doc._dday}`}
                          </span>
                        </div>
                        <p className="text-[10px] text-[#6B7280]">{doc.expiryDate}</p>
                        {doc._dday <= 30 && doc._dday >= 0 && (
                          <div className="mt-2 flex items-center gap-1 text-[10px] text-amber-600">
                            <AlertTriangle size={10} />
                            {L(lang, { ko: '갱신이 필요합니다', zh: '需要续期', en: 'Renewal needed' })}
                          </div>
                        )}
                        {doc.docType === 'arc' && (
                          <a href="https://www.hikorea.go.kr" target="_blank" rel="noopener noreferrer"
                            className="text-[10px] text-[#111827] hover:underline mt-1 block">Hi-Korea</a>
                        )}
                        {doc.docType === 'passport' && (
                          <p className="text-[10px] text-[#9CA3AF] mt-1">{L(lang, { ko: '대사관/영사관 방문', zh: '访问大使馆/领事馆', en: 'Visit embassy/consulate' })}</p>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Document Form ───
function DocForm({ lang, docType, existing, onSave, onCancel, cardCls, inputCls, labelCls, btnPrimary, btnSecondary }) {
  const dt = DOC_TYPES.find(t => t.id === docType)
  const [formData, setFormData] = useState(existing || { docType })

  const update = (k, v) => setFormData(d => ({ ...d, [k]: v }))

  return (
    <div className={cardCls}>
      <h3 className="font-bold text-[#111827] text-sm mb-4">{L(lang, dt?.label)}</h3>
      <div className="space-y-3">
        {dt?.fields.map(f => (
          <div key={f}>
            <label className={labelCls}>{L(lang, FIELD_LABELS[f])}</label>
            {f.includes('Date') ? (
              <input type="date" className={inputCls} value={formData[f] || ''} onChange={e => update(f, e.target.value)} />
            ) : (
              <input className={inputCls} value={formData[f] || ''} onChange={e => update(f, e.target.value)} />
            )}
          </div>
        ))}
      </div>
      <div className="flex gap-2 mt-4">
        <button onClick={() => onSave({ ...formData, docType })} className={btnPrimary + ' flex-1'}>
          {L(lang, { ko: '저장', zh: '保存', en: 'Save' })}
        </button>
        <button onClick={onCancel} className={btnSecondary}>
          {L(lang, { ko: '취소', zh: '取消', en: 'Cancel' })}
        </button>
      </div>
    </div>
  )
}

// ─── Verify Section (collapsible) ───
function VerifySection({ guide, lang, cardCls }) {
  const [open, setOpen] = useState(false)
  return (
    <div className={cardCls}>
      <button onClick={() => setOpen(!open)} className="w-full flex items-center justify-between">
        <span className="font-bold text-[#111827] text-sm">{L(lang, guide.title)}</span>
        {open ? <ChevronUp size={16} className="text-[#6B7280]" /> : <ChevronDown size={16} className="text-[#6B7280]" />}
      </button>
      {open && (
        <div className="mt-3 space-y-2">
          {(guide.steps[lang] || guide.steps.en).map((step, i) => (
            <div key={i} className="flex gap-2 text-xs text-[#374151]">
              <span className="text-[#111827] font-bold shrink-0">{i + 1}.</span>
              <span>{step}</span>
            </div>
          ))}
          <div className="mt-2 bg-[#F9FAFB] rounded-xl p-2.5">
            <p className="text-[10px] text-[#6B7280]">{L(lang, guide.note)}</p>
          </div>
        </div>
      )}
    </div>
  )
}
