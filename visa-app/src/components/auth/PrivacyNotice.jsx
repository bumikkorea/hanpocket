import React from 'react'
import { t } from '../../data/i18n'

const PrivacyNotice = ({ lang, onAccept, onDecline }) => {
  const requiredData = {
    ko: ['닉네임', '언어 설정'],
    zh: ['昵称', '语言设置'],
    en: ['Nickname', 'Language Settings']
  }
  
  const optionalData = {
    ko: ['프로필 사진', '친구 목록'],
    zh: ['头像', '好友列表'],
    en: ['Profile Photo', 'Friends List']
  }

  return (
    <div className="privacy-notice bg-[#F8F9FA] border border-[#E5E7EB] rounded-[6px] p-4 mb-4">
      <h3 className="text-sm font-bold text-[#1A1A1A] mb-3">
        {lang === 'ko' ? '수집하는 정보' : lang === 'zh' ? '我们收集的信息' : 'Information We Collect'}
      </h3>
      
      <div className="space-y-2">
        <div className="flex items-start gap-2">
          <span className="text-green-600 text-sm">✅</span>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-[#1A1A1A]">
              {lang === 'ko' ? '필수:' : lang === 'zh' ? '必需：' : 'Required:'}
            </p>
            <p className="text-xs text-[#666666]">
              {requiredData[lang].join(', ')}
            </p>
          </div>
        </div>
        
        <div className="flex items-start gap-2">
          <span className="text-orange-500 text-sm">⭕</span>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-[#1A1A1A]">
              {lang === 'ko' ? '선택:' : lang === 'zh' ? '可选：' : 'Optional:'}
            </p>
            <p className="text-xs text-[#666666]">
              {optionalData[lang].join(', ')}
            </p>
          </div>
        </div>
      </div>
      
      <div className="mt-3 pt-3 border-t border-[#E5E7EB]">
        <p className="text-[10px] text-[#9CA3AF] leading-relaxed">
          {lang === 'ko' 
            ? '개인정보는 안전하게 보호되며, 서비스 개선 목적으로만 사용됩니다. 언제든 계정 설정에서 삭제할 수 있습니다.'
            : lang === 'zh'
            ? '个人信息将得到安全保护，仅用于服务改进。您可以随时在账户设置中删除。'
            : 'Personal information is securely protected and used only for service improvement. You can delete it anytime in account settings.'
          }
        </p>
      </div>
      
      {onAccept && onDecline && (
        <div className="flex gap-2 mt-3">
          <button
            onClick={onDecline}
            className="flex-1 px-3 py-2 text-xs border border-[#E5E7EB] rounded-[6px] text-[#666666] hover:bg-[#F3F4F6]"
          >
            {lang === 'ko' ? '취소' : lang === 'zh' ? '取消' : 'Cancel'}
          </button>
          <button
            onClick={onAccept}
            className="flex-1 px-3 py-2 text-xs bg-[#2D5A3D] text-white rounded-[6px] hover:bg-[#245530]"
          >
            {lang === 'ko' ? '동의' : lang === 'zh' ? '同意' : 'Accept'}
          </button>
        </div>
      )}
    </div>
  )
}

export default PrivacyNotice