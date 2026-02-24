import React, { useState, useMemo } from 'react'
import { t } from '../data/i18n'
import { visaTransitions, visaOptions } from '../data/visaTransitions'
import { ChevronDown, ArrowRight, CheckCircle, XCircle, AlertTriangle, FileText, Clock, MapPin, DollarSign, ExternalLink } from 'lucide-react'

function L(lang, data) {
  if (typeof data === 'string') return data
  return data?.[lang] || data?.en || data?.zh || data?.ko || ''
}

export default function VisaSimulator({ profile, lang = 'ko' }) {
  const s = t[lang]
  const [currentVisa, setCurrentVisa] = useState(profile?.currentVisa || '')
  const [targetVisa, setTargetVisa] = useState('')
  const [isSimulated, setIsSimulated] = useState(false)

  // 사용자 국적에 따른 지역 판단
  const userRegion = useMemo(() => {
    if (!profile?.nationality) return 'mainland'
    return ['china_hk', 'china_macau', 'china_taiwan'].includes(profile.nationality) ? 'hkMoTw' : 'mainland'
  }, [profile?.nationality])

  // 현재 비자에서 가능한 전환 옵션
  const availableTransitions = useMemo(() => {
    if (!currentVisa || !visaTransitions[currentVisa]) return []
    
    return visaTransitions[currentVisa].transitions.filter(tr => {
      if (userRegion === 'mainland') {
        return !tr.hkMoTwOnly
      } else {
        return !tr.mainlandOnly
      }
    })
  }, [currentVisa, userRegion])

  // 현재 선택된 전환 경로
  const selectedTransition = useMemo(() => {
    if (!currentVisa || !targetVisa) return null
    return availableTransitions.find(tr => tr.to === targetVisa)
  }, [currentVisa, targetVisa, availableTransitions])

  // 시뮬레이션 실행
  const handleSimulate = () => {
    if (!currentVisa || !targetVisa) return
    setIsSimulated(true)
  }

  // 출입국관리사무소 찾기 (카카오맵 연동)
  const handleFindImmigrationOffice = () => {
    const searchQuery = '출입국관리사무소'
    const kakaoMapUrl = `https://map.kakao.com/link/search/${encodeURIComponent(searchQuery)}`
    window.open(kakaoMapUrl, '_blank', 'noopener,noreferrer')
  }

  // 전환 가능성 상태
  const getTransitionStatus = () => {
    if (!selectedTransition) {
      return {
        type: 'impossible',
        icon: XCircle,
        text: s.transitionImpossible,
        color: 'text-red-600'
      }
    }
    
    // 조건부 가능 여부 판단 (조건이 많거나 복잡한 경우)
    const conditions = selectedTransition.conditions?.[lang] || []
    const isConditional = conditions.length > 3 || 
                         conditions.some(cond => 
                           cond.includes('포인트') || 
                           cond.includes('점 이상') ||
                           cond.includes('积分') ||
                           cond.includes('point')
                         )

    if (isConditional) {
      return {
        type: 'conditional',
        icon: AlertTriangle,
        text: s.transitionConditional,
        color: 'text-amber-600'
      }
    }

    return {
      type: 'possible',
      icon: CheckCircle,
      text: s.transitionPossible,
      color: 'text-green-600'
    }
  }

  const transitionStatus = getTransitionStatus()
  const StatusIcon = transitionStatus.icon

  return (
    <div className="space-y-6 animate-fade-up">
      {/* 제목 */}
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-bold text-[#111827]">{s.visaSimulatorTitle}</h1>
        <p className="text-[#6B7280] text-sm">
          {lang === 'ko' && '현재 비자에서 원하는 비자로의 변경 경로를 시뮬레이션합니다.'}
          {lang === 'zh' && '模拟从当前签证变更到目标签证的路径。'}
          {lang === 'en' && 'Simulate the pathway from your current visa to desired visa.'}
        </p>
      </div>

      {/* 비자 선택 영역 */}
      <div className="bg-[#F8F9FA] rounded-xl p-6 border border-[#E5E7EB]">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
          {/* 현재 비자 */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-[#111827]">
              {s.currentVisaLabel}
            </label>
            <div className="relative">
              <select
                value={currentVisa}
                onChange={(e) => {
                  setCurrentVisa(e.target.value)
                  setTargetVisa('')
                  setIsSimulated(false)
                }}
                className="w-full appearance-none bg-white border border-[#D1D5DB] rounded-lg px-4 py-3 text-[#111827] font-medium focus:outline-none focus:ring-2 focus:ring-[#111827] focus:border-transparent"
              >
                <option value="">{s.selectCurrentVisa}</option>
                {visaOptions.map(visa => (
                  <option key={visa.id} value={visa.id}>
                    {L(lang, visa.label)}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#6B7280]" strokeWidth={1} />
            </div>
          </div>

          {/* 화살표 */}
          <div className="flex justify-center items-center">
            <div className="bg-white rounded-full p-3 border border-[#E5E7EB]">
              <ArrowRight className="w-6 h-6 text-[#6B7280]" strokeWidth={1} />
            </div>
          </div>

          {/* 목표 비자 */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-[#111827]">
              {s.targetVisaLabel}
            </label>
            <div className="relative">
              <select
                value={targetVisa}
                onChange={(e) => {
                  setTargetVisa(e.target.value)
                  setIsSimulated(false)
                }}
                disabled={!currentVisa}
                className="w-full appearance-none bg-white border border-[#D1D5DB] rounded-lg px-4 py-3 text-[#111827] font-medium focus:outline-none focus:ring-2 focus:ring-[#111827] focus:border-transparent disabled:bg-[#F3F4F6] disabled:text-[#9CA3AF]"
              >
                <option value="">{s.selectTargetVisa}</option>
                {visaOptions.map(visa => (
                  <option key={visa.id} value={visa.id}>
                    {L(lang, visa.label)}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#6B7280]" strokeWidth={1} />
            </div>
          </div>
        </div>

        {/* 시뮬레이션 버튼 */}
        <div className="mt-6 text-center">
          <button
            onClick={handleSimulate}
            disabled={!currentVisa || !targetVisa}
            className="bg-[#111827] text-white px-8 py-3 rounded-lg font-semibold disabled:bg-[#D1D5DB] disabled:text-[#9CA3AF] hover:bg-[#1F2937] transition-colors"
          >
            {s.simulate}
          </button>
        </div>
      </div>

      {/* 결과 영역 */}
      {isSimulated && (
        <div className="bg-white rounded-xl border border-[#E5E7EB] overflow-hidden animate-fade-up">
          {/* 결과 헤더 */}
          <div className="bg-[#F8F9FA] px-6 py-4 border-b border-[#E5E7EB]">
            <h2 className="text-lg font-bold text-[#111827] flex items-center gap-2">
              <StatusIcon className={`w-5 h-5 ${transitionStatus.color}`} strokeWidth={1} />
              {s.simulateResult}
            </h2>
          </div>

          <div className="p-6 space-y-6">
            {/* 전환 가능성 */}
            <div className="bg-gray-50 rounded-lg p-4">
              <div className={`text-lg font-semibold flex items-center gap-2 ${transitionStatus.color}`}>
                <StatusIcon className="w-6 h-6" strokeWidth={1} />
                {transitionStatus.text}
              </div>
              {targetVisa && (
                <div className="text-sm text-[#6B7280] mt-2">
                  {L(lang, visaTransitions[currentVisa]?.label)} → {L(lang, visaOptions.find(v => v.id === targetVisa)?.label)}
                </div>
              )}
            </div>

            {selectedTransition ? (
              <div className="grid gap-6">
                {/* 자격 조건 */}
                {selectedTransition.conditions?.[lang]?.length > 0 && (
                  <div className="space-y-3">
                    <h3 className="font-semibold text-[#111827] flex items-center gap-2">
                      <FileText className="w-5 h-5" strokeWidth={1} />
                      {s.eligibilityCriteria}
                    </h3>
                    <ul className="space-y-2">
                      {selectedTransition.conditions[lang].map((condition, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-sm text-[#374151]">
                          <span className="text-[#6B7280] mt-1">•</span>
                          <span>{condition}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* 필요 서류 */}
                <div className="space-y-3">
                  <h3 className="font-semibold text-[#111827] flex items-center gap-2">
                    <FileText className="w-5 h-5" strokeWidth={1} />
                    {s.requiredDocuments}
                  </h3>
                  <ul className="space-y-2 text-sm text-[#374151]">
                    <li className="flex items-start gap-2">
                      <span className="text-[#6B7280] mt-1">•</span>
                      <span>{lang === 'ko' ? '체류자격 변경 허가 신청서' : lang === 'zh' ? '居留资格变更许可申请书' : 'Application for Change of Status of Residence'}</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-[#6B7280] mt-1">•</span>
                      <span>{lang === 'ko' ? '여권 및 외국인등록증' : lang === 'zh' ? '护照及外国人登记证' : 'Passport and Alien Registration Card'}</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-[#6B7280] mt-1">•</span>
                      <span>{lang === 'ko' ? '해당 비자별 추가 서류' : lang === 'zh' ? '各签证类型的额外文件' : 'Additional documents specific to visa type'}</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-[#6B7280] mt-1">•</span>
                      <span>{lang === 'ko' ? '수수료 납부증명서' : lang === 'zh' ? '手续费缴纳证明' : 'Fee payment receipt'}</span>
                    </li>
                  </ul>
                </div>

                {/* 예상 정보 그리드 */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* 예상 수수료 */}
                  <div className="bg-[#F8F9FA] rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <DollarSign className="w-5 h-5 text-[#111827]" strokeWidth={1} />
                      <h4 className="font-semibold text-[#111827]">{s.expectedFee}</h4>
                    </div>
                    <p className="text-sm text-[#6B7280]">{s.estimatedFeeRange}</p>
                  </div>

                  {/* 예상 소요기간 */}
                  <div className="bg-[#F8F9FA] rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Clock className="w-5 h-5 text-[#111827]" strokeWidth={1} />
                      <h4 className="font-semibold text-[#111827]">{s.expectedDuration}</h4>
                    </div>
                    <p className="text-sm text-[#6B7280]">{s.estimatedDurationRange}</p>
                  </div>

                  {/* 신청 장소 */}
                  <div className="bg-[#F8F9FA] rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <MapPin className="w-5 h-5 text-[#111827]" strokeWidth={1} />
                      <h4 className="font-semibold text-[#111827]">{s.applicationLocation}</h4>
                    </div>
                    <p className="text-sm text-[#6B7280]">{s.immigrationOfficeGeneral}</p>
                  </div>
                </div>

                {/* 참고사항 */}
                {selectedTransition.notes?.[lang] && (
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                    <h3 className="font-semibold text-[#111827] mb-2">{s.notes}</h3>
                    <p className="text-sm text-[#374151]">{selectedTransition.notes[lang]}</p>
                  </div>
                )}

                {/* 일반 참고사항 (visaTransitions 데이터의 notes) */}
                {visaTransitions[currentVisa]?.notes?.[lang] && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h3 className="font-semibold text-[#111827] mb-2">{s.notes}</h3>
                    <p className="text-sm text-[#374151]">{visaTransitions[currentVisa].notes[lang]}</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8">
                <XCircle className="w-16 h-16 text-red-300 mx-auto mb-4" strokeWidth={1} />
                <p className="text-[#6B7280]">{s.noDataAvailable}</p>
                <p className="text-sm text-[#9CA3AF] mt-2">
                  {lang === 'ko' && '선택하신 비자 조합으로는 직접 변경이 어려울 수 있습니다.'}
                  {lang === 'zh' && '所选择的签证组合可能无法直接变更。'}
                  {lang === 'en' && 'Direct transition may not be possible for the selected visa combination.'}
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 출입국관리사무소 찾기 버튼 */}
      {isSimulated && (
        <div className="text-center">
          <button
            onClick={handleFindImmigrationOffice}
            className="bg-white border border-[#D1D5DB] text-[#111827] px-6 py-3 rounded-lg font-semibold hover:bg-[#F9FAFB] transition-colors flex items-center gap-2 mx-auto"
          >
            <MapPin className="w-5 h-5" strokeWidth={1} />
            {s.findImmigrationOffice}
            <ExternalLink className="w-4 h-4" strokeWidth={1} />
          </button>
        </div>
      )}

      {/* 안내 메시지 */}
      {!currentVisa || !targetVisa ? (
        <div className="text-center py-8">
          <p className="text-[#6B7280]">{s.pleaseSelectBothVisas}</p>
        </div>
      ) : null}
    </div>
  )
}