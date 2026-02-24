import React from 'react'

export default function Logo({ size = 'md' }) {
  const scales = { sm: 0.7, md: 0.9, lg: 1.15 }
  const sc = scales[size] || scales.md
  
  return (
    <svg width={186 * sc} height={28 * sc} viewBox="0 0 186 28" fill="none" style={{ overflow: 'visible' }}>
      {/* HANPOCKET 텍스트 */}
      <text x="82" y="19" textAnchor="middle" fontFamily="'Inter', sans-serif" fontWeight="300" fontSize="18" letterSpacing="0.25em" fill="#111827">
        HANPOCKET
      </text>

      {/* 복주머니 — 마침표 위치 (T 오른쪽 바로 뒤) */}
      <g transform="translate(162, 8) scale(0.5)">
        <path d="M6,7 Q10,2 14,7" fill="none" stroke="#111827" strokeWidth="1.4" strokeLinecap="round"/>
        <circle cx="10" cy="7.5" r="1.3" fill="#111827"/>
        <line x1="8.5" y1="8.5" x2="7" y2="12" stroke="#111827" strokeWidth="0.8" strokeLinecap="round"/>
        <line x1="11.5" y1="8.5" x2="13" y2="12" stroke="#111827" strokeWidth="0.8" strokeLinecap="round"/>
        <path d="M3,9 Q1,14 3,19 Q5,23 10,24 Q15,23 17,19 Q19,14 17,9 Z" fill="#D42B40"/>
        <path d="M4,9 Q6,10.5 10,10.5 Q14,10.5 16,9" fill="none" stroke="#B02535" strokeWidth="0.5"/>
        <rect x="8" y="14" width="4" height="4" rx="0.5" fill="none" stroke="#111827" strokeWidth="0.6"/>
        <line x1="10" y1="14" x2="10" y2="18" stroke="#111827" strokeWidth="0.4"/>
        <line x1="8" y1="16" x2="12" y2="16" stroke="#111827" strokeWidth="0.4"/>
      </g>
    </svg>
  )
}