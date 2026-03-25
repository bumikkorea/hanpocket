/**
 * 에디토리얼 상세 페이지 — 풀스크린 오버레이
 * 서울 10개 지역 깊이 읽기
 */
import NearPageHeader from './NearPageHeader.jsx'

function L(lang, d) { if (typeof d === 'string') return d; return d?.[lang] || d?.zh || d?.ko || d?.en || '' }

export default function EditorialDetailPage({ editorial, lang, onBack, setTab }) {
  if (!editorial) return null

  const paragraphs = L(lang, editorial.body).split('\n\n').filter(Boolean)
  const spots = (editorial.spots?.[lang] || editorial.spots?.zh || [])
  const isLight = editorial.textDark

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 9800, background: '#FAFAFA', display: 'flex', flexDirection: 'column', fontFamily: '"Noto Sans SC", Pretendard, Inter, sans-serif' }}>

      {/* ─── 공통 헤더 ─── */}
      <NearPageHeader onBack={onBack} setTab={setTab} />

      {/* ─── 스크롤 영역 ─── */}
      <div style={{ flex: 1, overflowY: 'auto' }}>

        {/* 상단 그라디언트 영역 */}
        <div style={{
          height: 220,
          background: editorial.gradient,
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'flex-end',
          padding: '0 24px 28px',
          flexShrink: 0,
        }}>
          {/* 장식 번호 */}
          <div style={{
            position: 'absolute', right: 20, top: 20,
            fontSize: 80, fontWeight: 900, lineHeight: 1,
            color: '#F0F0F0',
            fontFamily: 'Inter, sans-serif',
            userSelect: 'none',
          }}>
            {editorial.number}
          </div>

          {/* 콘텐츠 */}
          <div>
            <div style={{ fontSize: 12, fontWeight: 600, color: '#AAAAAA', letterSpacing: '0.1em', marginBottom: 8, textTransform: 'uppercase' }}>
              SEOUL EDITORIAL {editorial.number}
            </div>
            <h1 style={{ fontSize: 20, fontWeight: 700, color: '#111', lineHeight: 1.4, margin: '0 0 10px', letterSpacing: '-0.02em' }}>
              {L(lang, editorial.title)}
            </h1>
            <p style={{ fontSize: 13, color: '#999999', margin: 0, lineHeight: 1.5, fontStyle: 'italic' }}>
              {L(lang, editorial.oneLiner)}
            </p>
          </div>
        </div>

        {/* ─── 본문 영역 ─── */}
        <div style={{ padding: '28px 24px 60px', background: '#FAFAFA' }}>

          {/* 추천 방문 시간 */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 8,
            padding: '12px 16px', borderRadius: 14,
            background: '#FAFAFA', marginBottom: 24,
            boxShadow: '4px 4px 10px rgba(200,200,200,0.5), -4px -4px 10px #FFFFFF',
          }}>
            <span style={{ fontSize: 13, color: '#666' }}>
              {L(lang, { ko: '추천 방문 시간', zh: '推荐游览时间', en: 'Best time to visit' })}:&nbsp;
              <strong style={{ color: '#111' }}>{L(lang, editorial.timeRecommend)}</strong>
            </span>
          </div>

          {/* 본문 텍스트 */}
          <div style={{ marginBottom: 32 }}>
            {paragraphs.map((para, i) => (
              <p key={i} style={{
                fontSize: 16, lineHeight: 1.85, color: '#333',
                margin: i < paragraphs.length - 1 ? '0 0 24px' : 0,
                wordBreak: 'keep-all',
              }}>
                {para}
              </p>
            ))}
          </div>

          {/* "어디를 가야 해?" 섹션 */}
          {spots.length > 0 && (
            <div style={{ marginBottom: 28 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 14 }}>
                <span style={{ fontSize: 14, fontWeight: 700, color: '#111' }}>
                  {L(lang, { ko: '어디를 가야 할까?', zh: '去哪里好？', en: 'Where to go?' })}
                </span>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {spots.map((spot, i) => (
                  <span key={i} style={{
                    display: 'inline-block', padding: '7px 14px',
                    borderRadius: 20, background: '#FAFAFA',
                    fontSize: 13, color: '#444', fontWeight: 500,
                    boxShadow: '4px 4px 10px rgba(200,200,200,0.5), -4px -4px 10px #FFFFFF',
                  }}>
                    {spot}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* 중국 도시 비유 섹션 */}
          {editorial.subtitle && (
            <div style={{
              padding: '16px 18px', borderRadius: 16,
              background: '#FAFAFA',
              boxShadow: '6px 6px 14px rgba(200,200,200,0.5), -6px -6px 14px #FFFFFF',
            }}>
              <div style={{ fontSize: 11, color: '#C4725A', fontWeight: 700, letterSpacing: '0.08em', marginBottom: 6, textTransform: 'uppercase' }}>
                {L(lang, { ko: '이런 곳과 비슷해요', zh: '类似的地方', en: 'Feels like' })}
              </div>
              <p style={{ fontSize: 14, color: '#555', margin: 0, lineHeight: 1.6 }}>
                {L(lang, editorial.subtitle)}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
