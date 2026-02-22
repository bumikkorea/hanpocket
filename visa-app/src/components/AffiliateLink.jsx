import React from 'react'
import { trackAffiliateClick } from '../utils/affiliateLinks'

const AffiliateLink = ({ 
  platform, 
  originalUrl, 
  children, 
  className = '', 
  target = '_blank',
  additionalData = {},
  ...props 
}) => {
  const handleClick = async (e) => {
    // 기본 링크 동작은 유지하되, 클릭 추적 추가
    try {
      const affiliateUrl = await trackAffiliateClick(platform, originalUrl, {
        clickedAt: new Date().toISOString(),
        userAgent: navigator.userAgent,
        referrer: document.referrer,
        widgetType: additionalData.widgetType || 'unknown',
        ...additionalData
      })
      
      // 새 탭에서 어필리에이트 링크 열기
      if (target === '_blank') {
        window.open(affiliateUrl, '_blank', 'noopener,noreferrer')
        e.preventDefault()
      } else {
        window.location.href = affiliateUrl
        e.preventDefault()
      }
    } catch (error) {
      console.warn('Affiliate tracking failed:', error)
      // 추적 실패 시 원본 링크로 폴백
      if (target === '_blank') {
        window.open(originalUrl, '_blank', 'noopener,noreferrer')
        e.preventDefault()
      }
    }
  }

  return (
    <a
      href={originalUrl}
      className={className}
      target={target}
      onClick={handleClick}
      rel={target === '_blank' ? 'noopener noreferrer' : undefined}
      {...props}
    >
      {children}
    </a>
  )
}

export default AffiliateLink

// 사용 예시:
// <AffiliateLink 
//   platform="klook" 
//   originalUrl="https://www.klook.com/ko/activity/123-seoul-tour/"
//   additionalData={{ widgetType: 'trip', category: 'seoul-tour' }}
//   className="btn btn-primary"
// >
//   예약하기
// </AffiliateLink>