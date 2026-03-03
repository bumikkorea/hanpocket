/**
 * Toss 스타일 스켈레톤 로딩 컴포넌트
 * variant: text | card | circle | widget | list
 */
export default function Skeleton({ variant = 'text', width, height, rounded, className = '', count = 1 }) {
  const base = 'bg-gray-200 animate-pulse'

  if (variant === 'circle') {
    const size = width || 'w-8'
    const h = height || 'h-8'
    return <div className={`${base} rounded-full ${size} ${h} ${className}`} />
  }

  if (variant === 'card') {
    return (
      <div className={`${base} rounded-2xl ${className}`} style={{ width: width || '100%', height: height || '96px' }} />
    )
  }

  if (variant === 'widget') {
    return (
      <div className={`space-y-3 ${className}`}>
        <div className="flex items-center gap-3">
          <div className={`${base} rounded-full w-8 h-8`} />
          <div className={`${base} rounded-lg w-1/2 h-6`} />
        </div>
      </div>
    )
  }

  if (variant === 'list') {
    return (
      <div className={`space-y-3 ${className}`}>
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className="space-y-2">
            <div className={`${base} rounded-lg w-3/4 h-4`} />
            <div className={`${base} rounded-lg w-full h-3`} />
            <div className={`${base} rounded-lg w-2/3 h-3`} />
          </div>
        ))}
      </div>
    )
  }

  // text variant (default)
  return (
    <div
      className={`${base} ${rounded ? 'rounded-full' : 'rounded-lg'} ${className}`}
      style={{ width: width || '100%', height: height || '16px' }}
    />
  )
}

// 프리셋 조합
export function CardSkeleton({ className = '' }) {
  return (
    <div className={`bg-white rounded-2xl p-4 border border-[#E5E7EB] space-y-3 ${className}`}>
      <Skeleton width="75%" height="16px" />
      <Skeleton width="100%" height="12px" />
      <Skeleton width="66%" height="12px" />
    </div>
  )
}

export function WidgetSkeleton({ className = '' }) {
  return (
    <div className={`bg-white rounded-2xl p-4 border border-[#E5E7EB] min-h-[80px] ${className}`}>
      <Skeleton variant="widget" />
    </div>
  )
}

export function ListSkeleton({ count = 3, className = '' }) {
  return (
    <div className={`space-y-3 ${className}`}>
      {Array.from({ length: count }).map((_, i) => (
        <CardSkeleton key={i} />
      ))}
    </div>
  )
}
