/**
 * 에디토리얼 상세 페이지 — 풀스크린 오버레이
 * 서울 10개 지역 깊이 읽기
 */
import { ArrowLeft, Clock, MapPin } from 'lucide-react'

function L(lang, d) { if (typeof d === 'string') return d; return d?.[lang] || d?.zh || d?.ko || d?.en || '' }

export default function EditorialDetailPage({ editorial, lang, onBack }) {
  if (!editorial) return null

  const paragraphs = L(lang, editorial.body).split('\n\n').filter(Boolean)
  const spots = (editorial.spots?.[lang] || editorial.spots?.zh || [])
  const isLight = editorial.textDark

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 9800, background: 'white', overflowY: 'auto', fontFamily: '"Noto Sans SC", Pretendard, Inter, sans-serif' }}>

      {/* ─── 상단 그라디언트 영역 (240px) ─── */}
      <div style={{
        height: 240,
        background: editorial.gradient,
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-end',
        padding: '0 24px 28px',
        flexShrink: 0,
      }}>
        {/* 뒤로가기 버튼 */}
        <button
          onClick={onBack}
          style={{
            position: 'absolute', top: 52, left: 20,
            width: 36, height: 36, borderRadius: '50%',
            background: 'rgba(0,0,0,0.15)', border: 'none', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            backdropFilter: 'blur(8px)',
          }}
        >
          <ArrowLeft size={18} color={isLight ? '#111' : 'white'} />
        </button>

        {/* 장식 번호 (대형, opacity) */}
        <div style={{
          position: 'absolute', right: 20, top: 40,
          fontSize: 80, fontWeight: 900, lineHeight: 1,
          color: isLight ? 'rgba(0,0,0,0.08)' : 'rgba(255,255,255,0.12)',
          fontFamily: 'Inter, sans-serif',
          userSelect: 'none',
        }}>
          {editorial.number}
        </div>

        {/* 콘텐츠 */}
        <div>
          <div style={{ fontSize: 12, fontWeight: 600, color: isLight ? 'rgba(0,0,0,0.5)' : 'rgba(255,255,255,0.6)', letterSpacing: '0.1em', marginBottom: 8, textTransform: 'uppercase' }}>
            SEOUL EDITORIAL {editorial.number}
          </div>
          <h1 style={{ fontSize: 20, fontWeight: 700, color: isLight ? '#111' : 'white', lineHeight: 1.4, margin: '0 0 10px', letterSpacing: '-0.02em' }}>
            {L(lang, editorial.title)}
          </h1>
          <p style={{ fontSize: 13, color: isLight ? 'rgba(0,0,0,0.55)' : 'rgba(255,255,255,0.75)', margin: 0, lineHeight: 1.5, fontStyle: 'italic' }}>
            {L(lang, editorial.oneLiner)}
          </p>
        </div>
      </div>

      {/* ─── 본문 영역 ─── */}
      <div style={{ padding: '28px 24px 60px', background: 'white' }}>

        {/* 추천 방문 시간 */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8,
          padding: '12px 16px', borderRadius: 12,
          background: '#F7F7F7', marginBottom: 24,
        }}>
          <Clock size={16} color="#999" />
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
              <MapPin size={15} color="#C4725A" />
              <span style={{ fontSize: 14, fontWeight: 700, color: '#111' }}>
                {L(lang, { ko: '어디를 가야 할까?', zh: '去哪里好？', en: 'Where to go?' })}
              </span>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {spots.map((spot, i) => (
                <span key={i} style={{
                  display: 'inline-block', padding: '7px 14px',
                  borderRadius: 20, background: '#F5F5F5',
                  fontSize: 13, color: '#444', fontWeight: 500,
                }}>
                  {spot}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* 중국 지역 비유 섹션 */}
        {editorial.subtitle && (
          <div style={{
            padding: '16px 18px', borderRadius: 12,
            background: 'linear-gradient(135deg, #FDF8F5, #F9F2EC)',
            borderLeft: '3px solid #C4725A',
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
  )
}
