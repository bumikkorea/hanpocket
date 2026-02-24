import React from 'react'
import { updateLog } from '../data/updateLog'

export default function NoticePopup({ lang, onClose }) {
  const handleDismiss = (type) => {
    if (type === 'forever') {
      localStorage.setItem('hp_notice_dismiss', 'forever')
    } else if (type === 'today') {
      localStorage.setItem('hp_notice_dismiss', new Date().toDateString())
    }
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-lg w-full max-w-md max-h-[80vh] overflow-hidden shadow-2xl animate-fade-up">
        <div className="bg-white border-b border-[#E5E7EB] p-6">
          <h2 className="text-lg font-bold text-[#111827]">
            {lang === 'ko' ? '공지사항' : lang === 'zh' ? '公告' : 'Notice'}
          </h2>
          <p className="text-[#6B7280] text-xs mt-1">
            {lang === 'ko' ? '출입국관리법 기반 · 법무부 공개데이터' : 
             lang === 'zh' ? '基于出入境管理法 · 法务部公开数据' : 'Based on Immigration Act · MOJ Open Data'}
          </p>
        </div>
        
        <div className="p-5 overflow-y-auto max-h-[50vh] space-y-5">
          {updateLog.slice(0, 3).map((entry, idx) => (
            <div key={idx}>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs font-bold bg-[#F3F4F6] text-[#111827] px-2 py-0.5 rounded-full">
                  v{entry.version}
                </span>
                <span className="text-xs text-[#6B7280]">{entry.date}</span>
                {idx === 0 && <span className="text-xs bg-[#111827]/10 text-[#111827] px-2 py-0.5 rounded-full">NEW</span>}
              </div>
              <ul className="space-y-1">
                {entry.items[lang]?.map((item, i) => (
                  <li key={i} className="text-sm text-[#6B7280]">{item}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        
        <div className="p-4 border-t border-[#E5E7EB] space-y-2">
          <button 
            onClick={() => handleDismiss('close')} 
            className="w-full bg-[#111827] text-white font-semibold py-3 rounded-xl hover:bg-[#1F2937] transition-all btn-press"
          >
            {lang === 'ko' ? '닫기' : lang === 'zh' ? '关闭' : 'Close'}
          </button>
          <div className="flex justify-center gap-4">
            <button 
              onClick={() => handleDismiss('today')} 
              className="text-xs text-[#6B7280] hover:text-[#111827]"
            >
              {lang === 'ko' ? '내일 다시' : lang === 'zh' ? '明天再说' : 'Tomorrow'}
            </button>
            <button 
              onClick={() => handleDismiss('forever')} 
              className="text-xs text-[#6B7280] hover:text-[#111827]"
            >
              {lang === 'ko' ? '다시 보지 않기' : lang === 'zh' ? '不再显示' : 'Never show'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}