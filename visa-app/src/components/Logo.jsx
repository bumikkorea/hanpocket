import React from 'react'

export default function Logo({ size = 'md' }) {
  const scales = { sm: 0.7, md: 0.9, lg: 1.15 }
  const sc = scales[size] || scales.md
  
  return (
    <svg width={186 * sc} height={28 * sc} viewBox="0 0 186 28" fill="none" style={{ overflow: 'visible' }}>
      {/* HANPOCKET 텍스트 — 어두운 빨간색, 오른쪽 24도 기울임 */}
      <text x="82" y="19" textAnchor="middle" fontFamily="'Inter', sans-serif" fontWeight="300" fontSize="18" letterSpacing="0.25em" fill="#A31B2F" transform="rotate(24, 82, 14)">
        HANPOCKET
      </text>
    </svg>
  )
}