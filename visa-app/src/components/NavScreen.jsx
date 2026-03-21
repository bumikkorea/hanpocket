import { useState } from 'react'
import { ArrowLeft } from '@phosphor-icons/react'
import { t, tLang } from '../locales/index.js'
import { buildTransitRoute, calcTaxiFare, LINE_COLORS } from '../data/stationData.js'

// ─── 교통 모드 카드 ───
function ModeCard({ icon, labelKey, duration, fareKrw, fareCny, active, lang, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        flex: '0 0 auto',
        minWidth: fareKrw ? 110 : 88,
        padding: '10px 14px',
        borderRadius: 14,
        background: active ? '#1A1A1A' : 'white',
        color: active ? 'white' : '#374151',
        border: active ? 'none' : '1px solid #E5E7EB',
        boxShadow: active ? '0 2px 10px rgba(0,0,0,0.25)' : '0 1px 4px rgba(0,0,0,0.06)',
        textAlign: 'center',
        cursor: 'pointer',
        transition: 'all 0.15s',
      }}
    >
      <div style={{ fontSize: 20, marginBottom: 4 }}>{icon}</div>
      <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 2 }}>
        {tLang(labelKey, lang)}
      </div>
      <div style={{ fontSize: 16, fontWeight: 700 }}>
        {duration}<span style={{ fontSize: 11, fontWeight: 400, opacity: 0.8 }}>{tLang('nav_min', lang)}</span>
      </div>
      {fareKrw && (
        <div style={{ fontSize: 10, opacity: 0.7, marginTop: 2 }}>
          ₩{fareKrw.toLocaleString()} ≈ {fareCny}{tLang('nav_cny', lang)}
        </div>
      )}
    </button>
  )
}

// ─── 지하철 경로 상세 ───
function TransitDetail({ steps, destName, lang }) {
  return (
    <div style={{ paddingTop: 4 }}>
      {steps.map((step, i) => {
        const nextStep = steps[i + 1]
        const connectorColor = nextStep?.type === 'ride' ? nextStep.color : '#E5E7EB'

        if (step.type === 'depart') {
          return (
            <div key={i} style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
              <div style={{ width: 24, display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
                <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#378ADD', border: '2px solid #378ADD', marginTop: 2 }} />
                <div style={{ width: 2, flex: 1, borderLeft: '2px dashed #D1D5DB', minHeight: 28 }} />
              </div>
              <div style={{ fontSize: 12, color: '#9CA3AF', paddingBottom: 12 }}>
                {tLang('nav_walk_about', lang)}{step.walk_min}{tLang('nav_min', lang)}
              </div>
            </div>
          )
        }

        if (step.type === 'station') {
          const hasTransfer = step.transfer_to != null
          const transferColor = hasTransfer ? LINE_COLORS[step.transfer_to] : null
          return (
            <div key={i} style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
              <div style={{ width: 24, display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
                {/* 호선 색상 원형 뱃지 */}
                <div style={{
                  width: 24, height: 24, borderRadius: '50%',
                  background: step.color, color: 'white',
                  fontSize: 11, fontWeight: 700,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0, border: '2px solid white',
                  boxShadow: `0 0 0 2px ${step.color}`,
                }}>
                  {step.line}
                </div>
                {/* 다음 단계 연결선 */}
                <div style={{
                  width: 3, flex: 1,
                  background: hasTransfer ? `linear-gradient(${step.color}, ${transferColor})` : connectorColor,
                  minHeight: 24,
                }} />
              </div>
              <div style={{ paddingBottom: 14, flex: 1 }}>
                {/* 중국어 역명 (주) */}
                <div style={{ fontSize: 15, fontWeight: 700, color: '#111827', lineHeight: 1.3 }}>
                  {step.name_zh}
                </div>
                {/* 한국어 + 영어 역명 */}
                <div style={{ fontSize: 11, color: '#9CA3AF', marginTop: 1 }}>
                  ({step.name_ko})&nbsp;&nbsp;{step.name_en}
                </div>
                {/* 환승 표시 */}
                {hasTransfer && (
                  <div style={{
                    marginTop: 6, display: 'inline-flex', alignItems: 'center', gap: 4,
                    background: `${transferColor}18`,
                    borderRadius: 6, padding: '3px 8px',
                  }}>
                    <div style={{ width: 14, height: 14, borderRadius: '50%', background: transferColor, color: 'white', fontSize: 9, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {step.transfer_to}
                    </div>
                    <span style={{ fontSize: 11, fontWeight: 700, color: transferColor }}>
                      {tLang('nav_transfer', lang)}{step.transfer_to}{tLang('nav_line', lang)}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )
        }

        if (step.type === 'ride') {
          return (
            <div key={i} style={{ display: 'flex', gap: 14, alignItems: 'stretch' }}>
              <div style={{ width: 24, display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
                <div style={{ width: 3, flex: 1, background: step.color, minHeight: 40 }} />
              </div>
              <div style={{ fontSize: 12, color: '#9CA3AF', padding: '6px 0 6px', display: 'flex', alignItems: 'center', gap: 4 }}>
                <span style={{ display: 'inline-block', width: 16, height: 16, borderRadius: '50%', background: step.color, color: 'white', fontSize: 9, fontWeight: 700, textAlign: 'center', lineHeight: '16px', flexShrink: 0 }}>
                  {step.line}
                </span>
                {tLang('nav_ride_on', lang)}{step.line}{tLang('nav_line', lang)}
                &nbsp;→&nbsp;{step.stops}{tLang('nav_stops', lang)}&nbsp;({step.min}{tLang('nav_min', lang)})
              </div>
            </div>
          )
        }

        if (step.type === 'arrive') {
          return (
            <div key={i} style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
              <div style={{ width: 24, display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
                <div style={{ width: 2, height: 24, borderLeft: '2px dashed #D1D5DB' }} />
                <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#E24B4A', border: '2px solid white', boxShadow: '0 0 0 2px #E24B4A', flexShrink: 0 }} />
              </div>
              <div style={{ paddingTop: 22 }}>
                <div style={{ fontSize: 12, color: '#9CA3AF', marginBottom: 4 }}>
                  {tLang('nav_walk_about', lang)}{step.walk_min}{tLang('nav_min', lang)}
                </div>
                <div style={{ fontSize: 14, fontWeight: 700, color: '#E24B4A' }}>
                  {destName}
                </div>
              </div>
            </div>
          )
        }

        return null
      })}
    </div>
  )
}

// ─── 도보 상세 ───
function WalkDetail({ walkMin, lang }) {
  return (
    <div style={{ textAlign: 'center', padding: '48px 0 24px' }}>
      <div style={{ fontSize: 56 }}>🚶</div>
      <div style={{ marginTop: 12, display: 'flex', alignItems: 'baseline', justifyContent: 'center', gap: 4 }}>
        <span style={{ fontSize: 48, fontWeight: 700, color: '#111827' }}>{walkMin}</span>
        <span style={{ fontSize: 16, color: '#9CA3AF' }}>{tLang('nav_min', lang)}</span>
      </div>
      <div style={{ marginTop: 8, fontSize: 13, color: '#9CA3AF' }}>
        {tLang('nav_walk', lang)} · {Math.round(walkMin * 67)}m
      </div>
    </div>
  )
}

// ─── 택시 상세 ───
function TaxiDetail({ taxiMin, fareKrw, fareCny, lang }) {
  return (
    <div style={{ textAlign: 'center', padding: '48px 0 24px' }}>
      <div style={{ fontSize: 56 }}>🚕</div>
      <div style={{ marginTop: 12, display: 'flex', alignItems: 'baseline', justifyContent: 'center', gap: 4 }}>
        <span style={{ fontSize: 48, fontWeight: 700, color: '#111827' }}>{taxiMin}</span>
        <span style={{ fontSize: 16, color: '#9CA3AF' }}>{tLang('nav_min', lang)}</span>
      </div>
      <div style={{
        marginTop: 20, display: 'inline-block',
        background: '#F9FAFB', borderRadius: 16,
        padding: '16px 32px', border: '1px solid #F3F4F6',
      }}>
        <div style={{ fontSize: 11, color: '#9CA3AF', marginBottom: 4 }}>
          {tLang('nav_fare', lang)}
        </div>
        <div style={{ fontSize: 24, fontWeight: 700, color: '#111827' }}>
          ₩{fareKrw.toLocaleString()}
        </div>
        <div style={{ fontSize: 13, color: '#6B7280', marginTop: 2 }}>
          ≈ {fareCny} {tLang('nav_cny', lang)}
        </div>
      </div>
    </div>
  )
}

// ─── 메인 컴포넌트 ───
export default function NavScreen({ poi, onClose, lang }) {
  const [mode, setMode] = useState('transit')

  const route = buildTransitRoute(poi)
  const dist = poi.distance ?? 4000
  const walkMin = Math.max(3, Math.ceil(dist / 67))
  const taxiMin = Math.max(5, Math.ceil(dist / 350))
  const taxiFareKrw = calcTaxiFare(dist)
  const taxiFareCny = Math.round(taxiFareKrw / 183)
  const destName = poi.name_zh || poi.name_ko

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 200,
      background: 'white', display: 'flex', flexDirection: 'column',
    }}>
      {/* ─── 헤더 ─── */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 12,
        padding: '14px 16px 12px',
        borderBottom: '1px solid #F3F4F6',
        flexShrink: 0,
      }}>
        <button
          onClick={onClose}
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#374151', padding: 4, display: 'flex' }}
        >
          <ArrowLeft size={22} weight="bold" />
        </button>
        <span style={{ fontSize: 16, fontWeight: 700, color: '#111827' }}>
          {tLang('nav_route_detail', lang)}
        </span>
      </div>

      {/* ─── 출발지 → 도착지 ─── */}
      <div style={{
        background: '#F9FAFB', padding: '14px 20px',
        borderBottom: '1px solid #F0F0F0',
        flexShrink: 0,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
          <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#378ADD', flexShrink: 0, boxShadow: '0 0 0 3px rgba(55,138,221,0.2)' }} />
          <span style={{ fontSize: 13, color: '#6B7280' }}>{tLang('nav_my_location', lang)}</span>
        </div>
        {/* 점선 연결 */}
        <div style={{ marginLeft: 5, width: 2, height: 18, borderLeft: '2px dashed #CBD5E1' }} />
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 6 }}>
          <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#E24B4A', flexShrink: 0, boxShadow: '0 0 0 3px rgba(226,75,74,0.2)' }} />
          <span style={{ fontSize: 14, fontWeight: 700, color: '#111827' }}>{destName}</span>
        </div>
      </div>

      {/* ─── 교통 모드 카드 ─── */}
      <div style={{
        display: 'flex', gap: 8, padding: '12px 16px',
        overflowX: 'auto', scrollbarWidth: 'none',
        borderBottom: '1px solid #F3F4F6',
        flexShrink: 0,
      }}>
        <ModeCard
          icon="🚇" labelKey="nav_transit"
          duration={route.transit_min}
          active={mode === 'transit'}
          lang={lang}
          onClick={() => setMode('transit')}
        />
        <ModeCard
          icon="🚶" labelKey="nav_walk"
          duration={walkMin}
          active={mode === 'walk'}
          lang={lang}
          onClick={() => setMode('walk')}
        />
        <ModeCard
          icon="🚕" labelKey="nav_taxi"
          duration={taxiMin}
          fareKrw={taxiFareKrw}
          fareCny={taxiFareCny}
          active={mode === 'taxi'}
          lang={lang}
          onClick={() => setMode('taxi')}
        />
      </div>

      {/* ─── 경로 상세 ─── */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px 48px' }}>
        {mode === 'transit' && (
          <TransitDetail
            steps={route.steps}
            destName={destName}
            lang={lang}
          />
        )}
        {mode === 'walk' && <WalkDetail walkMin={walkMin} lang={lang} />}
        {mode === 'taxi' && (
          <TaxiDetail
            taxiMin={taxiMin}
            fareKrw={taxiFareKrw}
            fareCny={taxiFareCny}
            lang={lang}
          />
        )}
      </div>
    </div>
  )
}
