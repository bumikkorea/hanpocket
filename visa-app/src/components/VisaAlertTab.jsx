import React, { useState, useEffect } from 'react'
import { Bell, BellOff, Calendar, CheckCircle2, Circle, Clock, ExternalLink, AlertTriangle, Shield, ChevronRight, Plus, Settings, Save } from 'lucide-react'

function L(lang, d) { if (typeof d === 'string') return d; return d?.[lang] || d?.en || d?.zh || d?.ko || '' }

function getDaysUntil(d) { 
  if(!d) return null; 
  const t = new Date(d);
  const n = new Date(); 
  t.setHours(0,0,0,0); 
  n.setHours(0,0,0,0); 
  return Math.ceil((t-n)/864e5) 
}

// 비자 D-Day 정보를 반환하는 유틸 함수 (HomeTab 연동용)
export function getVisaDDay() {
  try {
    const visaInfo = JSON.parse(localStorage.getItem('hp_visa_info') || '{}')
    if (!visaInfo.expiryDate) return null
    
    const days = getDaysUntil(visaInfo.expiryDate)
    return {
      days,
      expiryDate: visaInfo.expiryDate,
      visaType: visaInfo.visaType || 'Unknown',
      status: days === null ? 'unknown'
        : days <= 0 ? 'expired'
        : days <= 7 ? 'critical'
        : days <= 30 ? 'urgent'
        : days <= 90 ? 'warning'
        : 'safe'
    }
  } catch {
    return null
  }
}

// 원형 프로그레스 바 컴포넌트
function CircularProgress({ days, maxDays = 365 }) {
  if (days === null || days < 0) return null
  
  const progress = Math.max(0, Math.min(100, (days / maxDays) * 100))
  const circumference = 2 * Math.PI * 45
  const strokeDasharray = circumference
  const strokeDashoffset = circumference - (progress / 100) * circumference
  
  const colorClass = days <= 7 ? '#EF4444' 
    : days <= 30 ? '#F59E0B'
    : days <= 90 ? '#F59E0B' 
    : '#10B981'
  
  return (
    <div className="relative w-32 h-32 mx-auto">
      <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 100 100">
        {/* Background circle */}
        <circle
          cx="50"
          cy="50"
          r="45"
          stroke="#E5E7EB"
          strokeWidth="6"
          fill="transparent"
        />
        {/* Progress circle */}
        <circle
          cx="50"
          cy="50"
          r="45"
          stroke={colorClass}
          strokeWidth="6"
          fill="transparent"
          strokeDasharray={strokeDasharray}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          className="transition-all duration-500"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-2xl font-bold" style={{ color: colorClass }}>
          {days}
        </span>
      </div>
    </div>
  )
}

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

const VISA_TYPES = [
  { value: 'D-2', label: { ko: 'D-2 (유학)', zh: 'D-2 (留学)', en: 'D-2 (Study)' } },
  { value: 'D-4', label: { ko: 'D-4 (일반연수)', zh: 'D-4 (一般研修)', en: 'D-4 (General Training)' } },
  { value: 'E-7', label: { ko: 'E-7 (특정활동)', zh: 'E-7 (特定活动)', en: 'E-7 (Specific Activities)' } },
  { value: 'F-2', label: { ko: 'F-2 (거주)', zh: 'F-2 (居住)', en: 'F-2 (Residence)' } },
  { value: 'F-4', label: { ko: 'F-4 (재외동포)', zh: 'F-4 (海外同胞)', en: 'F-4 (Overseas Korean)' } },
  { value: 'H-1', label: { ko: 'H-1 (관광취업)', zh: 'H-1 (观光就业)', en: 'H-1 (Working Holiday)' } },
  { value: 'other', label: { ko: '기타', zh: '其他', en: 'Other' } }
]

export default function VisaAlertTab({ lang, profile }) {
  // 비자 정보 상태 (localStorage에서 독립적으로 관리)
  const [visaInfo, setVisaInfo] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('hp_visa_info') || '{}')
      return {
        expiryDate: saved.expiryDate || profile?.visaExpiry || profile?.expiryDate || '',
        visaType: saved.visaType || profile?.currentVisa || 'D-2'
      }
    } catch {
      return {
        expiryDate: profile?.visaExpiry || profile?.expiryDate || '',
        visaType: profile?.currentVisa || 'D-2'
      }
    }
  })
  
  const [showSettings, setShowSettings] = useState(false)
  const [notifGranted, setNotifGranted] = useState(Notification?.permission === 'granted')
  const [notifEnabled, setNotifEnabled] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('hp_visa_notif_enabled') || 'true')
    } catch {
      return true
    }
  })
  
  const [checkedItems, setCheckedItems] = useState(() => {
    try { 
      return JSON.parse(localStorage.getItem('hp_visa_checked') || '{}') 
    } catch { 
      return {} 
    }
  })
  
  const [alertsSet, setAlertsSet] = useState(() => {
    try { 
      return JSON.parse(localStorage.getItem('hp_visa_alerts') || '[]') 
    } catch { 
      return [] 
    }
  })

  const days = getDaysUntil(visaInfo.expiryDate)
  const checklist = monthlyChecklist[visaInfo.visaType] || monthlyChecklist.default

  // 비자 정보 저장
  const saveVisaInfo = () => {
    localStorage.setItem('hp_visa_info', JSON.stringify(visaInfo))
    setShowSettings(false)
    // 알림 다시 설정
    if (notifGranted && notifEnabled) {
      setupAlerts()
    }
  }

  // 체크리스트 토글
  const toggleCheck = (key) => {
    const updated = { ...checkedItems, [key]: !checkedItems[key] }
    setCheckedItems(updated)
    localStorage.setItem('hp_visa_checked', JSON.stringify(updated))
  }

  // 알림 권한 요청
  const requestNotif = async () => {
    if (!('Notification' in window)) return
    const perm = await Notification.requestPermission()
    setNotifGranted(perm === 'granted')
    
    if (perm === 'granted' && notifEnabled) {
      setupAlerts()
    }
  }

  // 알림 ON/OFF 토글
  const toggleNotifications = () => {
    const newEnabled = !notifEnabled
    setNotifEnabled(newEnabled)
    localStorage.setItem('hp_visa_notif_enabled', JSON.stringify(newEnabled))
    
    if (!newEnabled) {
      // 알림 끄기 - 기존 알림 취소
      alertsSet.forEach(alert => {
        if (alert.timeoutId) {
          clearTimeout(alert.timeoutId)
        }
      })
      setAlertsSet([])
      localStorage.setItem('hp_visa_alerts', '[]')
    } else if (notifGranted && visaInfo.expiryDate) {
      // 알림 켜기 - 다시 설정
      setupAlerts()
    }
  }

  // 알림 설정 함수 (D-90, D-60, D-30, D-7 시점)
  const setupAlerts = () => {
    if (!notifGranted || !notifEnabled || !visaInfo.expiryDate) return

    const expiryDate = new Date(visaInfo.expiryDate)
    const now = new Date()
    const alertDays = [90, 60, 30, 7]
    const newAlerts = []

    // 기존 알림 취소
    alertsSet.forEach(alert => {
      if (alert.timeoutId) {
        clearTimeout(alert.timeoutId)
      }
    })

    alertDays.forEach(daysBefore => {
      const alertDate = new Date(expiryDate)
      alertDate.setDate(alertDate.getDate() - daysBefore)
      alertDate.setHours(9, 0, 0, 0) // 오전 9시에 알림
      
      if (alertDate > now) {
        const timeUntilAlert = alertDate.getTime() - now.getTime()
        
        if (timeUntilAlert <= 2147483647) { // setTimeout 최대값
          const timeoutId = setTimeout(() => {
            const message = lang === 'ko' 
              ? `⚠️ ${visaInfo.visaType} 비자 만료 ${daysBefore}일 전입니다`
              : lang === 'zh' 
              ? `⚠️ ${visaInfo.visaType} 签证还有${daysBefore}天到期`
              : `⚠️ ${visaInfo.visaType} visa expires in ${daysBefore} days`
            
            new Notification('HanPocket 비자 알림', {
              body: message,
              icon: '/favicon.ico',
              badge: '/favicon.ico',
              tag: `visa-alert-${daysBefore}`,
              requireInteraction: daysBefore <= 30,
              actions: daysBefore <= 30 ? [
                { action: 'extend', title: L(lang, { ko: '연장 신청하기', zh: '申请延期', en: 'Apply Extension' }) }
              ] : []
            })
          }, timeUntilAlert)
          
          newAlerts.push({ 
            daysBefore, 
            timeoutId, 
            alertDate: alertDate.toISOString() 
          })
        }
      }
    })

    setAlertsSet(newAlerts)
    localStorage.setItem('hp_visa_alerts', JSON.stringify(
      newAlerts.map(a => ({ 
        daysBefore: a.daysBefore, 
        alertDate: a.alertDate 
      }))
    ))
  }

  // 컴포넌트 마운트 시 알림 설정
  useEffect(() => {
    if (notifGranted && notifEnabled && visaInfo.expiryDate) {
      setupAlerts()
    }
  }, [notifGranted, notifEnabled, visaInfo.expiryDate])

  // 테스트 알림
  const testNotification = () => {
    if (!notifGranted) return
    new Notification('HanPocket 테스트', {
      body: L(lang, { ko: '알림이 정상 작동합니다!', zh: '通知功能正常！', en: 'Notifications are working!' }),
      icon: '/favicon.ico'
    })
  }

  const colorClass = days === null ? 'text-[#9CA3AF]'
    : days <= 0 ? 'text-red-600'
    : days <= 7 ? 'text-red-500'
    : days <= 30 ? 'text-orange-500'
    : days <= 90 ? 'text-yellow-500'
    : 'text-green-600'

  const bgClass = days === null ? 'bg-[#F3F4F6]'
    : days <= 0 ? 'bg-red-50 border-red-200'
    : days <= 7 ? 'bg-red-50 border-red-200'
    : days <= 30 ? 'bg-orange-50 border-orange-200'
    : days <= 90 ? 'bg-yellow-50 border-yellow-200'
    : 'bg-green-50 border-green-200'

  return (
    <div className="space-y-4 animate-fade-up">
      {/* Visa Info Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md">
            <h3 className="font-bold text-lg mb-4">{L(lang, { ko: '비자 정보 설정', zh: '签证信息设置', en: 'Visa Information' })}</h3>
            
            <div className="space-y-4">
              {/* 비자 종류 선택 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {L(lang, { ko: '비자 종류', zh: '签证类型', en: 'Visa Type' })}
                </label>
                <select 
                  value={visaInfo.visaType}
                  onChange={(e) => setVisaInfo(prev => ({ ...prev, visaType: e.target.value }))}
                  className="w-full p-3 border border-gray-200 rounded-lg bg-white text-sm"
                >
                  {VISA_TYPES.map(type => (
                    <option key={type.value} value={type.value}>
                      {L(lang, type.label)}
                    </option>
                  ))}
                </select>
              </div>

              {/* 만료일 선택 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {L(lang, { ko: '비자 만료일', zh: '签证到期日', en: 'Visa Expiry Date' })}
                </label>
                <input
                  type="date"
                  value={visaInfo.expiryDate}
                  onChange={(e) => setVisaInfo(prev => ({ ...prev, expiryDate: e.target.value }))}
                  className="w-full p-3 border border-gray-200 rounded-lg text-sm"
                />
              </div>
            </div>

            <div className="flex gap-2 mt-6">
              <button
                onClick={() => setShowSettings(false)}
                className="flex-1 py-2 px-4 bg-gray-100 text-gray-700 rounded-lg font-medium"
              >
                {L(lang, { ko: '취소', zh: '取消', en: 'Cancel' })}
              </button>
              <button
                onClick={saveVisaInfo}
                className="flex-1 py-2 px-4 bg-black text-white rounded-lg font-medium flex items-center justify-center gap-2"
              >
                <Save size={16} />
                {L(lang, { ko: '저장', zh: '保存', en: 'Save' })}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* D-day Display with Circular Progress */}
      <div className={`rounded-2xl p-8 border text-center ${bgClass}`}>
        <div className="flex items-center justify-between mb-4">
          <div></div>
          <button
            onClick={() => setShowSettings(true)}
            className="p-2 rounded-lg bg-white/60 hover:bg-white/80 transition-colors"
          >
            <Settings size={18} className="text-gray-600" />
          </button>
        </div>

        {days !== null ? (
          <>
            <CircularProgress days={Math.max(0, days)} />
            <p className={`text-4xl font-black mt-4 ${colorClass}`}>
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
              {visaInfo.visaType} | {L(lang, { ko: '만료일', zh: '到期日', en: 'Expires' })}: {visaInfo.expiryDate}
            </p>
          </>
        ) : (
          <div>
            <p className="text-2xl font-bold text-[#9CA3AF] mb-4">--</p>
            <p className="text-sm text-[#9CA3AF] mt-2 mb-4">{L(lang, { ko: '비자 정보를 설정해주세요', zh: '请设置签证信息', en: 'Please set visa information' })}</p>
            <button
              onClick={() => setShowSettings(true)}
              className="px-4 py-2 bg-black text-white rounded-lg text-sm font-medium flex items-center gap-2 mx-auto"
            >
              <Plus size={16} />
              {L(lang, { ko: '정보 입력', zh: '输入信息', en: 'Add Info' })}
            </button>
          </div>
        )}
      </div>

      {/* Notification Settings */}
      <div className="bg-white rounded-2xl p-5 border border-[#E5E7EB] card-glow">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            {notifGranted && notifEnabled ? (
              <Bell size={18} className="text-green-600" />
            ) : (
              <BellOff size={18} className="text-[#9CA3AF]" />
            )}
            <div>
              <p className="font-bold text-[#111827] text-sm">{L(lang, { ko: '알림 설정', zh: '通知设置', en: 'Notifications' })}</p>
              <p className="text-xs text-[#9CA3AF]">
                {!notifGranted 
                  ? L(lang, { ko: '권한 필요', zh: '需要权限', en: 'Permission needed' })
                  : notifEnabled 
                    ? L(lang, { ko: '활성화됨', zh: '已开启', en: 'Enabled' }) 
                    : L(lang, { ko: '비활성화됨', zh: '未开启', en: 'Disabled' })
                }
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            {notifGranted && (
              <button
                onClick={toggleNotifications}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                  notifEnabled 
                    ? 'bg-green-100 text-green-700 hover:bg-green-200' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {notifEnabled ? L(lang, { ko: 'ON', zh: '开启', en: 'ON' }) : L(lang, { ko: 'OFF', zh: '关闭', en: 'OFF' })}
              </button>
            )}
            {!notifGranted && (
              <button 
                onClick={requestNotif} 
                className="px-3 py-1.5 bg-[#111827] text-white text-xs font-semibold rounded-lg hover:bg-gray-800 transition-colors"
              >
                {L(lang, { ko: '허용', zh: '允许', en: 'Allow' })}
              </button>
            )}
          </div>
        </div>
        
        {notifGranted && (
          <div className="flex gap-2 pt-2 border-t border-[#F3F4F6]">
            <button 
              onClick={testNotification} 
              className="px-3 py-1.5 bg-[#F3F4F6] text-[#111827] text-xs font-semibold rounded-lg hover:bg-[#E5E7EB] transition-colors"
            >
              {L(lang, { ko: '테스트 알림', zh: '测试通知', en: 'Test Notification' })}
            </button>
            <div className="text-xs text-[#9CA3AF] flex items-center">
              {notifEnabled && alertsSet.length > 0 && (
                <span>{alertsSet.length}{L(lang, { ko: '개 알림 설정됨', zh: '个提醒已设置', en: ' alerts set' })}</span>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Monthly Checklist */}
      <div className="bg-white rounded-2xl p-5 border border-[#E5E7EB] card-glow">
        <h3 className="font-bold text-[#111827] text-sm mb-3 flex items-center gap-2">
          <CheckCircle2 size={16} />
          {L(lang, { ko: '월간 체크리스트', zh: '月度清单', en: 'Monthly Checklist' })}
          <span className="text-xs text-[#9CA3AF] font-normal">({visaInfo.visaType})</span>
        </h3>
        <div className="space-y-2">
          {checklist.map((item, i) => {
            const key = `${visaInfo.visaType}-${i}`
            return (
              <button 
                key={i} 
                onClick={() => toggleCheck(key)}
                className="w-full flex items-center gap-3 text-left p-2 rounded-lg hover:bg-[#F8F9FA] transition-colors"
              >
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

      {/* Extension Guide - Show when less than 30 days */}
      {days !== null && days <= 30 && days > 0 && (
        <div className="bg-orange-50 border border-orange-200 rounded-2xl p-5">
          <div className="flex items-start gap-3">
            <AlertTriangle size={20} className="text-orange-600 shrink-0 mt-0.5" />
            <div>
              <h3 className="font-bold text-orange-900 text-sm mb-2">
                {L(lang, { ko: '비자 연장 신청 안내', zh: '签证延期申请指南', en: 'Visa Extension Guide' })}
              </h3>
              <div className="space-y-2 text-sm text-orange-800">
                <p>{L(lang, { ko: '필요 서류:', zh: '所需文件:', en: 'Required Documents:' })}</p>
                <ul className="ml-4 space-y-1 text-xs">
                  <li>• {L(lang, { ko: '체류기간연장허가 신청서', zh: '居留期延长许可申请书', en: 'Extension application form' })}</li>
                  <li>• {L(lang, { ko: '여권 및 외국인등록증', zh: '护照及外国人登录证', en: 'Passport & ARC' })}</li>
                  <li>• {L(lang, { ko: '재학증명서 (학생비자)', zh: '在学证明书(学生签证)', en: 'Enrollment certificate (student visa)' })}</li>
                  <li>• {L(lang, { ko: '수수료 6만원', zh: '手续费6万韩元', en: 'Fee 60,000 KRW' })}</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

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
                  {isPast ? (
                    <CheckCircle2 size={12} className="text-white" />
                  ) : isCurrent ? (
                    <AlertTriangle size={10} className="text-white" />
                  ) : (
                    <Circle size={8} className="text-white" />
                  )}
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
          { 
            label: { ko: 'Hi-Korea 방문 예약', zh: 'Hi-Korea预约', en: 'Hi-Korea Reservation' }, 
            url: 'https://www.hikorea.go.kr/resv/ResveInfo.pt' 
          },
          { 
            label: { ko: '출입국관리사무소 찾기', zh: '查找出入境管理事务所', en: 'Find Immigration Office' }, 
            url: 'https://www.immigration.go.kr/immigration/1555/subview.do' 
          },
          { 
            label: { ko: '체류기간 연장 안내', zh: '居留期延期指南', en: 'Stay Extension Guide' }, 
            url: 'https://www.hikorea.go.kr/info/InfoDatail.pt' 
          },
          {
            label: { ko: '카카오맵 출입국관리사무소', zh: '카카오맵 出入境管理事务所', en: 'KakaoMap Immigration Offices' },
            url: 'https://map.kakao.com/?q=출입국관리사무소'
          }
        ].map((link, i) => (
          <a 
            key={i} 
            href={link.url} 
            target="_blank" 
            rel="noopener noreferrer"
            className="w-full flex items-center justify-between bg-white rounded-xl p-4 border border-[#E5E7EB] hover:border-[#111827]/20 transition-all"
          >
            <span className="text-sm font-semibold text-[#111827]">{L(lang, link.label)}</span>
            <ExternalLink size={14} className="text-[#9CA3AF]" />
          </a>
        ))}
      </div>
    </div>
  )
}