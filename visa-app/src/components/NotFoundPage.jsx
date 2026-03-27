/**
 * 404 페이지 — NEAR 브랜딩
 */
export default function NotFoundPage({ lang = 'zh', onGoHome }) {
  const L = (d) => (typeof d === 'string' ? d : d?.[lang] || d?.zh || d?.en || d?.ko || '')

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 text-center" style={{ background: '#FAFAF7' }}>
      <div className="text-[80px] mb-4">🗺️</div>
      <h1 className="text-[28px] font-bold mb-2" style={{ color: '#191F28', fontFamily: "'Pretendard Variable', 'Noto Sans SC', sans-serif" }}>
        {L({ ko: '길을 잃었어요', zh: '迷路了', en: 'Page Not Found' })}
      </h1>
      <p className="text-[14px] mb-8" style={{ color: '#8A8A7A' }}>
        {L({ ko: '요청하신 페이지를 찾을 수 없습니다', zh: '找不到您请求的页面', en: "The page you're looking for doesn't exist" })}
      </p>
      <button
        onClick={onGoHome}
        className="px-6 py-3 rounded-full text-[14px] font-semibold text-white active:scale-95 transition-transform"
        style={{ backgroundColor: '#3182F6' }}
      >
        {L({ ko: 'NEAR 홈으로', zh: '回到NEAR首页', en: 'Back to NEAR' })}
      </button>
    </div>
  )
}
