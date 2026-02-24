import React from 'react'
import { Shield, AlertTriangle, Clock, CheckCircle2 } from 'lucide-react'
import { getVisaDDay } from '../VisaAlertTab'

function L(lang, d) { 
  if (typeof d === 'string') return d; 
  return d?.[lang] || d?.en || d?.zh || d?.ko || '' 
}

// 미니 원형 프로그레스 바
function MiniCircularProgress({ days, maxDays = 365, size = 40 }) {
  if (days === null || days < 0) return null
  
  const progress = Math.max(0, Math.min(100, (days / maxDays) * 100))
  const radius = size / 2 - 3
  const circumference = 2 * Math.PI * radius
  const strokeDasharray = circumference
  const strokeDashoffset = circumference - (progress / 100) * circumference
  
  const color = days <= 7 ? '#EF4444' 
    : days <= 30 ? '#F59E0B'
    : days <= 90 ? '#F59E0B' 
    : '#10B981'
  
  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg 
        className="transform -rotate-90" 
        viewBox={`0 0 ${size} ${size}`}
        width={size}
        height={size}
      >
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#E5E7EB"
          strokeWidth="3"
          fill="transparent"
        />
        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth="3"
          fill="transparent"
          strokeDasharray={strokeDasharray}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          className="transition-all duration-500"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-xs font-bold" style={{ color }}>
          {days}
        </span>
      </div>
    </div>
  )
}

export default function VisaWidget({ lang, onClick }) {
  const visaData = getVisaDDay()

  if (!visaData || !visaData.expiryDate) {
    return (
      <div 
        onClick={onClick}
        className="bg-white rounded-2xl p-4 border border-[#E5E7EB] hover:border-[#111827]/20 transition-all cursor-pointer"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
            <Shield size={18} className="text-gray-400" />
          </div>
          <div className="flex-1">
            <p className="font-bold text-sm text-[#111827]">
              {L(lang, { ko: '비자 관리', zh: '签证管理', en: 'Visa Management' })}
            </p>
            <p className="text-xs text-[#9CA3AF]">
              {L(lang, { ko: '정보를 입력해주세요', zh: '请输入信息', en: 'Set up visa info' })}
            </p>
          </div>
          <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
            <Clock size={12} className="text-gray-400" />
          </div>
        </div>
      </div>
    )
  }

  const { days, expiryDate, visaType, status } = visaData
  
  const statusConfig = {
    expired: {
      color: 'text-red-600',
      bg: 'bg-red-50 border-red-200',
      icon: AlertTriangle,
      message: { ko: '만료됨', zh: '已到期', en: 'Expired' }
    },
    critical: {
      color: 'text-red-500',
      bg: 'bg-red-50 border-red-200',
      icon: AlertTriangle,
      message: { ko: '긴급!', zh: '紧急！', en: 'Urgent!' }
    },
    urgent: {
      color: 'text-orange-500',
      bg: 'bg-orange-50 border-orange-200',
      icon: Clock,
      message: { ko: '연장 필요', zh: '需要延期', en: 'Extension needed' }
    },
    warning: {
      color: 'text-yellow-600',
      bg: 'bg-yellow-50 border-yellow-200',
      icon: Clock,
      message: { ko: '준비 시작', zh: '开始准备', en: 'Start preparing' }
    },
    safe: {
      color: 'text-green-600',
      bg: 'bg-green-50 border-green-200',
      icon: CheckCircle2,
      message: { ko: '여유 있음', zh: '时间充裕', en: 'Plenty of time' }
    }
  }

  const config = statusConfig[status] || statusConfig.safe
  const StatusIcon = config.icon

  return (
    <div 
      onClick={onClick}
      className={`bg-white rounded-2xl p-4 border hover:border-[#111827]/20 transition-all cursor-pointer ${config.bg}`}
    >
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-white/60 rounded-full flex items-center justify-center backdrop-blur-sm">
          <Shield size={18} className={config.color} />
        </div>
        <div className="flex-1">
          <p className="font-bold text-sm text-[#111827] flex items-center gap-1">
            {visaType} {L(lang, { ko: '비자', zh: '签证', en: 'Visa' })}
            <StatusIcon size={12} className={config.color} />
          </p>
          <p className={`text-xs font-medium ${config.color}`}>
            D{days <= 0 ? '+' + Math.abs(days) : '-' + days} - {L(lang, config.message)}
          </p>
          <p className="text-xs text-[#9CA3AF] mt-0.5">
            {L(lang, { ko: '만료', zh: '到期', en: 'Expires' })}: {new Date(expiryDate).toLocaleDateString()}
          </p>
        </div>
        <MiniCircularProgress days={Math.max(0, days)} />
      </div>
    </div>
  )
}