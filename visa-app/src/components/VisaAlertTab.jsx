import { useState } from 'react'
import { Bell, BellOff, Calendar, CheckCircle2, Circle, Clock, ExternalLink, AlertTriangle, Shield, ChevronRight } from 'lucide-react'

function L(lang, d) { if (typeof d === 'string') return d; return d?.[lang] || d?.en || d?.zh || d?.ko || '' }

function getDaysUntil(d) { if(!d) return null; const t=new Date(d),n=new Date(); t.setHours(0,0,0,0); n.setHours(0,0,0,0); return Math.ceil((t-n)/864e5) }

const milestones = [
  { days: 180, label: { ko: '6개월 전', zh: '6个月前', en: '6 months before' }, tasks: [
    { ko: '비자 연장/변경 계획 수립', zh: '制定签证延期/变更计划', en: 'Plan visa extension/change' },
    { ko: '필요 서류 목록 확인', zh: '确认所需文件清单', en: 'Check required documents list' },
  ]},
  { days: 90, label: { ko: '3개월 전', zh: '3个月前', en: '3 months before' }, tasks: [
    { ko: '서류 준비 시작', zh: '开始准备文件', en: 'Start preparing documents' },
    { ko: '건강보험 상태 확인', zh: '确认健康保险状态', en: 'Check health insurance status' },
    { ko: '체류지 변경 여부 확인', zh: '确认是否变更居住地', en: 'Check if address change needed' },
  ]},
  { days: 60, label: { ko: '2개월 전', zh: '2个月前', en: '2 months before' }, tasks: [
    { ko: 'Hi-Korea 방문 예약', zh: 'Hi-Korea预约', en: 'Book Hi-Korea appointment' },
    { ko: '서류 공증/번역 완료', zh: '完成文件公证/翻译', en: 'Complete notarization/translation' },
    { ko: '수수료 준비 (6만원~)', zh: '准备手续费(6万韩元~)', en: 'Prepare fees (60,000 KRW~)' },
  ]},
  { days: 30, label: { ko: '1개월 전', zh: '1个月前', en: '1 month before' }, tasks: [
    { ko: '출입국관리사무소 방문', zh: '前往出入境管理事务所', en: 'Visit immigration office' },
    { ko: '연장 신청서 제출', zh: '提交延期申请', en: 'Submit extension application' },
    { ko: '접수증 수령 및 보관', zh: '领取并保管收据', en: 'Keep the receipt' },
  ]},
  { days: 14, label: { ko: '2주 전', zh: '2周前', en: '2 weeks before' }, tasks: [
    { ko: '심사 결과 확인', zh: '确认审查结果', en: 'Check review result' },
    { ko: '추가 서류 요청 시 즉시 제출', zh: '如有补充材料要求立即提交', en: 'Submit additional docs if requested' },
  ]},
  { days: 7, label: { ko: '1주 전', zh: '1周前', en: '1 week before' }, tasks: [
    { ko: '외국인등록증 수령', zh: '领取外国人登录证', en: 'Pick up ARC' },
    { ko: '새 체류기간 확인', zh: '确认新居留期限', en: 'Confirm new stay period' },
    { ko: '만료일 재설정', zh: '重新设置到期日', en: 'Reset expiry date' },
  ]},
]

const monthlyChecklist = {
  'D-2': [
    { ko: '건강보험료 납부', zh: '缴纳健康保险费', en: 'Pay health insurance' },
    { ko: '출석률 확인 (80% 이상)', zh: '确认出勤率(80%以上)', en: 'Check attendance (80%+)' },
    { ko: '성적 확인', zh: '确认成绩', en: 'Check grades' },
    { ko: '시간제 취업 시간 확인 (주20시간)', zh: '确认打工时间(每周20小时)', en: 'Check part-time hours (20h/week)' },
  ],
  'D-4': [
    { ko: '건강보험료 납부', zh: '缴纳健康保险费', en: 'Pay health insurance' },
    { ko: '어학원 출석률 확인', zh: '确认语言学校出勤率', en: 'Check language school attendance' },
    { ko: 'TOPIK 시험 일정 확인', zh: '确认TOPIK考试日程', en: 'Check TOPIK exam schedule' },
  ],
  'E-7': [
    { ko: '건강보험료 납부', zh: '缴纳健康保险费', en: 'Pay health insurance' },
    { ko: '소득세 원천징수 확인', zh: '确认所得税预扣', en: 'Check income tax withholding' },
    { ko: '근로계약서 갱신 여부 확인', zh: '确认劳动合同是否需要续签', en: 'Check employment contract renewal' },
  ],
  'F-2': [
    { ko: '건강보험료 납부', zh: '缴纳健康保险费', en: 'Pay health insurance' },
    { ko: '종합소득세 신고 (5월)', zh: '综合所得税申报(5月)', en: 'File income tax (May)' },
    { ko: '체류지 변경 신고 (14일 이내)', zh: '居住地变更申报(14天内)', en: 'Report address change (within 14 days)' },
  ],
  default: [
    { ko: '건강보험료 납부', zh: '缴纳健康保险费', en: 'Pay health insurance' },
    { ko: '체류지 변경 시 신고', zh: '居住地变更时申报', en: 'Report address changes' },
    { ko: '외국인등록증 항시 소지', zh: '随身携带外国人登录证', en: 'Always carry ARC' },
    { ko: '출국 시 재입국허가 확인', zh: '出境时确认再入境许可', en: 'Check re-entry permit before travel' },
  ],
}

export default function VisaAlertTab({ lang, profile }) {
  const [notifGranted, setNotifGranted] = useState(Notification?.permission === 'granted')
  const [checkedItems, setCheckedItems] = useState(() => {
    try { return JSON.parse(localStorage.getItem('hp_visa_checked') || '{}') } catch { return {} }
  })

  const days = getDaysUntil(profile?.visaExpiry || profile?.expiryDate)
  const visaType = profile?.currentVisa || 'default'
  const checklist = monthlyChecklist[visaType] || monthlyChecklist.default

  const toggleCheck = (key) => {
    const updated = { ...checkedItems, [key]: !checkedItems[key] }
    setCheckedItems(updated)
    localStorage.setItem('hp_visa_checked', JSON.stringify(updated))
  }

  const requestNotif = async () => {
    if (!('Notification' in window)) return
    const perm = await Notification.requestPermission()
    setNotifGranted(perm === 'granted')
  }

  const colorClass = days === null ? 'text-[#9CA3AF]'
    : days <= 0 ? 'text-red-600'
    : days <= 30 ? 'text-red-500'
    : days <= 90 ? 'text-amber-500'
    : 'text-green-600'

  const bgClass = days === null ? 'bg-[#F3F4F6]'
    : days <= 0 ? 'bg-red-50 border-red-200'
    : days <= 30 ? 'bg-red-50 border-red-200'
    : days <= 90 ? 'bg-amber-50 border-amber-200'
    : 'bg-green-50 border-green-200'

  return (
    <div className="space-y-4 animate-fade-up">
      {/* D-day Display */}
      <div className={`rounded-2xl p-8 border text-center ${bgClass}`}>
        <p className="text-xs text-[#6B7280] mb-1">{L(lang, { ko: '비자 만료까지', zh: '签证到期还有', en: 'Days until visa expiry' })}</p>
        {days !== null ? (
          <>
            <p className={`text-6xl font-black ${colorClass}`}>
              {days <= 0 ? 'D+' + Math.abs(days) : 'D-' + days}
            </p>
            <p className={`text-sm font-semibold mt-2 ${colorClass}`}>
              {days <= 0 ? L(lang, { ko: '만료됨', zh: '已到期', en: 'Expired' })
                : days <= 7 ? L(lang, { ko: '긴급! 즉시 연장 필요', zh: '紧急！需立即延期', en: 'Urgent! Extend now' })
                : days <= 30 ? L(lang, { ko: '연장 신청이 필요합니다', zh: '需要申请延期', en: 'Extension needed' })
                : days <= 90 ? L(lang, { ko: '서류 준비를 시작하세요', zh: '请开始准备文件', en: 'Start preparing documents' })
                : L(lang, { ko: '여유 있습니다', zh: '时间充裕', en: 'Plenty of time' })}
            </p>
            <p className="text-xs text-[#9CA3AF] mt-1">
              {L(lang, { ko: '만료일', zh: '到期日', en: 'Expiry' })}: {profile?.visaExpiry || profile?.expiryDate || '-'}
            </p>
          </>
        ) : (
          <div>
            <p className="text-2xl font-bold text-[#9CA3AF]">--</p>
            <p className="text-sm text-[#9CA3AF] mt-2">{L(lang, { ko: '프로필에서 만료일을 설정하세요', zh: '请在个人资料中设置到期日', en: 'Set expiry date in profile' })}</p>
          </div>
        )}
      </div>

      {/* Notification Permission */}
      <div className="bg-white rounded-2xl p-5 border border-[#E5E7EB] card-glow">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {notifGranted ? <Bell size={18} className="text-green-600" /> : <BellOff size={18} className="text-[#9CA3AF]" />}
            <div>
              <p className="font-bold text-[#111827] text-sm">{L(lang, { ko: '알림 설정', zh: '通知设置', en: 'Notifications' })}</p>
              <p className="text-xs text-[#9CA3AF]">{notifGranted ? L(lang, { ko: '활성화됨', zh: '已开启', en: 'Enabled' }) : L(lang, { ko: '비활성화됨', zh: '未开启', en: 'Disabled' })}</p>
            </div>
          </div>
          {!notifGranted && (
            <button onClick={requestNotif} className="px-3 py-1.5 bg-[#111827] text-white text-xs font-semibold rounded-lg">
              {L(lang, { ko: '허용', zh: '允许', en: 'Allow' })}
            </button>
          )}
        </div>
      </div>

      {/* Monthly Checklist */}
      <div className="bg-white rounded-2xl p-5 border border-[#E5E7EB] card-glow">
        <h3 className="font-bold text-[#111827] text-sm mb-3 flex items-center gap-2">
          <CheckCircle2 size={16} />
          {L(lang, { ko: '월간 체크리스트', zh: '月度清单', en: 'Monthly Checklist' })}
          <span className="text-xs text-[#9CA3AF] font-normal">({visaType})</span>
        </h3>
        <div className="space-y-2">
          {checklist.map((item, i) => {
            const key = `${visaType}-${i}`
            return (
              <button key={i} onClick={() => toggleCheck(key)}
                className="w-full flex items-center gap-3 text-left p-2 rounded-lg hover:bg-[#F8F9FA] transition-colors">
                {checkedItems[key]
                  ? <CheckCircle2 size={18} className="text-green-600 shrink-0" />
                  : <Circle size={18} className="text-[#D1D5DB] shrink-0" />}
                <span className={`text-sm ${checkedItems[key] ? 'text-[#9CA3AF] line-through' : 'text-[#374151]'}`}>
                  {L(lang, item)}
                </span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Timeline */}
      <div className="bg-white rounded-2xl p-5 border border-[#E5E7EB] card-glow">
        <h3 className="font-bold text-[#111827] text-sm mb-4 flex items-center gap-2">
          <Clock size={16} />
          {L(lang, { ko: '비자 연장 타임라인', zh: '签证延期时间线', en: 'Visa Extension Timeline' })}
        </h3>
        <div className="space-y-0">
          {milestones.map((m, i) => {
            const isPast = days !== null && days < m.days
            const isCurrent = days !== null && days >= m.days && (i === 0 || days < milestones[i - 1].days)
            return (
              <div key={i} className="relative pl-8 pb-6 last:pb-0">
                {/* Line */}
                {i < milestones.length - 1 && (
                  <div className={`absolute left-[11px] top-6 w-0.5 h-full ${isPast ? 'bg-green-300' : 'bg-[#E5E7EB]'}`} />
                )}
                {/* Dot */}
                <div className={`absolute left-0 top-0 w-6 h-6 rounded-full flex items-center justify-center ${
                  isCurrent ? 'bg-[#111827] ring-4 ring-[#111827]/10' : isPast ? 'bg-green-500' : 'bg-[#E5E7EB]'
                }`}>
                  {isPast ? <CheckCircle2 size={12} className="text-white" /> : isCurrent ? <AlertTriangle size={10} className="text-white" /> : <Circle size={8} className="text-white" />}
                </div>
                <div>
                  <p className={`font-bold text-sm ${isCurrent ? 'text-[#111827]' : isPast ? 'text-green-600' : 'text-[#9CA3AF]'}`}>
                    D-{m.days} {L(lang, m.label)}
                  </p>
                  <div className="mt-1 space-y-1">
                    {m.tasks.map((task, j) => (
                      <p key={j} className={`text-xs ${isPast ? 'text-green-600/60 line-through' : 'text-[#6B7280]'}`}>
                        {L(lang, task)}
                      </p>
                    ))}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Quick Links */}
      <div className="space-y-2">
        <h3 className="font-bold text-[#111827] text-sm">{L(lang, { ko: '빠른 링크', zh: '快速链接', en: 'Quick Links' })}</h3>
        {[
          { label: { ko: 'Hi-Korea 방문 예약', zh: 'Hi-Korea预约', en: 'Hi-Korea Reservation' }, url: 'https://www.hikorea.go.kr/resv/ResveInfo.pt' },
          { label: { ko: '출입국관리사무소 찾기', zh: '查找出入境管理事务所', en: 'Find Immigration Office' }, url: 'https://www.immigration.go.kr/immigration/1555/subview.do' },
          { label: { ko: '체류기간 연장 안내', zh: '居留期延期指南', en: 'Stay Extension Guide' }, url: 'https://www.hikorea.go.kr/info/InfoDatail.pt' },
        ].map((link, i) => (
          <a key={i} href={link.url} target="_blank" rel="noopener noreferrer"
            className="w-full flex items-center justify-between bg-white rounded-xl p-4 border border-[#E5E7EB] hover:border-[#111827]/20 transition-all">
            <span className="text-sm font-semibold text-[#111827]">{L(lang, link.label)}</span>
            <ExternalLink size={14} className="text-[#9CA3AF]" />
          </a>
        ))}
      </div>
    </div>
  )
}
