/**
 * CourseCreatorPage — 내 코스 만들기
 * 코스명 + 설명 + 경유지(장소 검색) → localStorage 저장
 */
import { useState, useRef } from 'react'
import { Search, Plus, X, ChevronUp, ChevronDown } from 'lucide-react'
import { useLanguage } from '../i18n/index.jsx'
import { supabase } from '../lib/supabase.js'
import NearPageHeader from './NearPageHeader.jsx'

function L(lang, d) { if (typeof d === 'string') return d; return d?.[lang] || d?.zh || d?.ko || d?.en || '' }

// ─── 장소 검색 바텀시트 ───
function StopSearchModal({ lang, onAdd, onClose, addedIds }) {
  const [q, setQ] = useState('')
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const debounceRef = useRef(null)

  const search = async (term) => {
    if (!term.trim()) { setResults([]); return }
    setLoading(true)
    try {
      const { data } = await supabase
        .from('popups')
        .select('id, name, name_zh, name_ko, name_en, category, address_zh, address_ko, lat, lng')
        .or(`name_zh.ilike.%${term}%,name_ko.ilike.%${term}%,name_en.ilike.%${term}%`)
        .limit(20)
      setResults(data || [])
    } catch {
      setResults([])
    }
    setLoading(false)
  }

  const handleChange = (v) => {
    setQ(v)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => search(v), 300)
  }

  return (
    <div
      onClick={onClose}
      style={{ position: 'fixed', inset: 0, zIndex: 9900, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'flex-end' }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{ width: '100%', height: '75vh', background: 'white', borderRadius: '24px 24px 0 0', display: 'flex', flexDirection: 'column' }}
      >
        {/* 핸들 */}
        <div style={{ width: 40, height: 4, borderRadius: 2, background: '#E0E0E0', margin: '12px auto 0', flexShrink: 0 }} />

        {/* 검색 인풋 */}
        <div style={{ padding: '12px 20px 8px', flexShrink: 0 }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: '#111', marginBottom: 10 }}>
            {L(lang, { zh: '搜索并添加地点', ko: '장소 검색', en: 'Search Stops' })}
          </div>
          <div style={{ position: 'relative' }}>
            <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#999', pointerEvents: 'none' }} />
            <input
              autoFocus
              value={q}
              onChange={e => handleChange(e.target.value)}
              placeholder={L(lang, { zh: '搜索店铺名称...', ko: '매장명 검색...', en: 'Search shop name...' })}
              style={{ width: '100%', padding: '11px 12px 11px 38px', borderRadius: 12, border: '1.5px solid #E0E0E0', fontSize: 14, boxSizing: 'border-box', outline: 'none', color: '#111' }}
            />
          </div>
        </div>

        {/* 결과 리스트 */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '4px 20px 32px' }}>
          {loading && (
            <div style={{ textAlign: 'center', padding: '24px 0', color: '#999', fontSize: 13 }}>
              {L(lang, { zh: '搜索中...', ko: '검색 중...', en: 'Searching...' })}
            </div>
          )}
          {!loading && results.map(item => {
            const name = lang === 'zh' ? (item.name_zh || item.name) : lang === 'en' ? (item.name_en || item.name) : (item.name_ko || item.name)
            const alreadyAdded = addedIds.includes(item.id)
            return (
              <button
                key={item.id}
                onClick={() => !alreadyAdded && onAdd(item)}
                style={{
                  width: '100%', display: 'flex', alignItems: 'center', gap: 12,
                  padding: '12px 0', borderBottom: '1px solid #F3F4F6',
                  background: 'none', border: 'none', borderBottom: '1px solid #F3F4F6',
                  cursor: alreadyAdded ? 'default' : 'pointer', textAlign: 'left',
                  opacity: alreadyAdded ? 0.4 : 1,
                }}
              >
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 14, fontWeight: 600, color: '#111', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{name}</div>
                  <div style={{ fontSize: 11, color: '#999', marginTop: 2 }}>
                    {item.category} · {item.address_zh || item.address_ko || ''}
                  </div>
                </div>
                {alreadyAdded
                  ? <span style={{ fontSize: 11, color: '#999', flexShrink: 0 }}>{L(lang, { zh: '已添加', ko: '추가됨', en: 'Added' })}</span>
                  : <Plus size={16} color="#999" style={{ flexShrink: 0 }} />
                }
              </button>
            )
          })}
          {!loading && q.trim() && results.length === 0 && (
            <div style={{ textAlign: 'center', padding: '40px 20px', color: '#999', fontSize: 14 }}>
              {L(lang, { zh: '没有搜索结果', ko: '검색 결과 없음', en: 'No results' })}
            </div>
          )}
          {!loading && !q.trim() && (
            <div style={{ textAlign: 'center', padding: '32px 20px', color: '#ccc', fontSize: 13 }}>
              {L(lang, { zh: '输入店铺名称开始搜索', ko: '매장명을 입력해 검색하세요', en: 'Type a name to search' })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── 메인 컴포넌트 ───
export default function CourseCreatorPage({ onClose, setTab }) {
  const { lang } = useLanguage()
  const [title, setTitle] = useState('')
  const [desc, setDesc] = useState('')
  const [stops, setStops] = useState([])
  const [showSearch, setShowSearch] = useState(false)

  const addedIds = stops.map(s => s.id)

  const addStop = (item) => {
    if (stops.length >= 10) return
    setStops(prev => [...prev, {
      id: item.id,
      name_zh: item.name_zh || item.name || '',
      name_ko: item.name_ko || item.name || '',
      name_en: item.name_en || item.name || '',
      lat: item.lat,
      lng: item.lng,
      address_zh: item.address_zh || item.address_ko || '',
    }])
    setShowSearch(false)
  }

  const moveStop = (idx, dir) => {
    const next = [...stops]
    const target = idx + dir
    if (target < 0 || target >= next.length) return
    ;[next[idx], next[target]] = [next[target], next[idx]]
    setStops(next)
  }

  const removeStop = (idx) => setStops(prev => prev.filter((_, i) => i !== idx))

  const canSave = title.trim().length > 0 && stops.length >= 2

  const handleSave = () => {
    if (!canSave) return
    const course = {
      id: 'custom_' + Date.now(),
      title_zh: title.trim(),
      title_ko: title.trim(),
      title_en: title.trim(),
      description_zh: desc.trim(),
      description_ko: desc.trim(),
      description_en: desc.trim(),
      type: 'custom',
      poi_ids: [],
      stops,
      estimated_hours: +(stops.length * 0.5).toFixed(1),
      stop_count: stops.length,
      created_at: new Date().toISOString(),
    }
    try {
      const existing = JSON.parse(localStorage.getItem('near_custom_courses') || '[]')
      localStorage.setItem('near_custom_courses', JSON.stringify([course, ...existing]))
    } catch {}
    onClose('saved')
  }

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 9600, background: 'var(--bg)', display: 'flex', flexDirection: 'column', fontFamily: '"Noto Sans SC", Pretendard, Inter, sans-serif' }}>

      <NearPageHeader onBack={onClose} setTab={setTab} />

      {/* 스크롤 영역 */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '20px 20px 100px' }}>

        <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 24, letterSpacing: '-0.02em' }}>
          {L(lang, { zh: '创建路线', ko: '코스 만들기', en: 'Create Course' })}
        </div>

        {/* 코스 이름 */}
        <div style={{ marginBottom: 16 }}>
          <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 8 }}>
            {L(lang, { zh: '路线名称', ko: '코스 이름', en: 'Course Name' })} <span style={{ color: '#EF4444' }}>*</span>
          </label>
          <input
            value={title}
            onChange={e => setTitle(e.target.value)}
            maxLength={40}
            placeholder={L(lang, { zh: '给你的路线起个名字', ko: '코스 이름을 입력하세요', en: 'Name your course' })}
            style={{ width: '100%', padding: '14px 16px', borderRadius: 12, border: '1.5px solid var(--border)', fontSize: 15, color: 'var(--text-primary)', background: 'var(--bg)', boxSizing: 'border-box', outline: 'none', fontFamily: 'inherit' }}
          />
        </div>

        {/* 코스 설명 */}
        <div style={{ marginBottom: 28 }}>
          <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 8 }}>
            {L(lang, { zh: '路线描述（可选）', ko: '코스 설명 (선택)', en: 'Description (optional)' })}
          </label>
          <textarea
            value={desc}
            onChange={e => setDesc(e.target.value)}
            maxLength={100}
            rows={2}
            placeholder={L(lang, { zh: '简单描述一下你的路线...', ko: '코스에 대해 간단히 설명해 주세요...', en: 'Briefly describe your course...' })}
            style={{ width: '100%', padding: '14px 16px', borderRadius: 12, border: '1.5px solid var(--border)', fontSize: 14, color: 'var(--text-primary)', background: 'var(--bg)', boxSizing: 'border-box', resize: 'none', outline: 'none', lineHeight: 1.6, fontFamily: 'inherit' }}
          />
        </div>

        {/* 경유지 섹션 */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: 12 }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)' }}>
              {L(lang, { zh: '停靠地点', ko: '경유지', en: 'Stops' })}
            </span>
            <span style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 400, marginLeft: 6 }}>
              {stops.length}/10 · {L(lang, { zh: '最少2个', ko: '최소 2개', en: 'min 2' })}
            </span>
          </div>

          {/* 경유지 리스트 */}
          {stops.length > 0 && (
            <div style={{ marginBottom: 10, borderRadius: 14, overflow: 'hidden', background: 'var(--card)', boxShadow: 'var(--shadow-card)' }}>
              {stops.map((stop, idx) => (
                <div
                  key={stop.id + '-' + idx}
                  style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 14px', borderBottom: idx < stops.length - 1 ? '1px solid var(--border)' : 'none' }}
                >
                  {/* 번호 뱃지 */}
                  <div style={{ width: 24, height: 24, borderRadius: '50%', background: '#E3F2FD', color: '#2196F3', fontSize: 12, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    {idx + 1}
                  </div>

                  {/* 이름 + 주소 */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {lang === 'zh' ? stop.name_zh : lang === 'en' ? stop.name_en : stop.name_ko}
                    </div>
                    {stop.address_zh && (
                      <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{stop.address_zh}</div>
                    )}
                  </div>

                  {/* 위/아래 */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 2, flexShrink: 0 }}>
                    <button
                      onClick={() => moveStop(idx, -1)} disabled={idx === 0}
                      style={{ width: 22, height: 22, borderRadius: 5, background: idx === 0 ? 'transparent' : 'var(--surface)', border: 'none', cursor: idx === 0 ? 'default' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: idx === 0 ? 0.2 : 1, padding: 0 }}
                    >
                      <ChevronUp size={13} color="var(--text-secondary)" />
                    </button>
                    <button
                      onClick={() => moveStop(idx, 1)} disabled={idx === stops.length - 1}
                      style={{ width: 22, height: 22, borderRadius: 5, background: idx === stops.length - 1 ? 'transparent' : 'var(--surface)', border: 'none', cursor: idx === stops.length - 1 ? 'default' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: idx === stops.length - 1 ? 0.2 : 1, padding: 0 }}
                    >
                      <ChevronDown size={13} color="var(--text-secondary)" />
                    </button>
                  </div>

                  {/* 삭제 */}
                  <button
                    onClick={() => removeStop(idx)}
                    style={{ width: 26, height: 26, borderRadius: '50%', background: '#FEE2E2', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}
                  >
                    <X size={12} color="#EF4444" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* 장소 추가 버튼 */}
          {stops.length < 10 && (
            <button
              onClick={() => setShowSearch(true)}
              style={{ width: '100%', padding: '14px', borderRadius: 12, border: '1.5px dashed var(--border)', background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
            >
              <Plus size={17} color="var(--text-muted)" />
              <span style={{ fontSize: 14, color: 'var(--text-muted)', fontWeight: 500 }}>
                {L(lang, { zh: '添加地点', ko: '장소 추가', en: 'Add Stop' })}
              </span>
            </button>
          )}

          {/* 안내 */}
          {stops.length < 2 && (
            <p style={{ fontSize: 12, color: 'var(--text-muted)', textAlign: 'center', marginTop: 12, lineHeight: 1.6 }}>
              {L(lang, { zh: '至少需要添加2个地点', ko: '경유지를 2개 이상 추가해야 저장할 수 있어요', en: 'Add at least 2 stops to save' })}
            </p>
          )}
        </div>
      </div>

      {/* 저장 버튼 (fixed 하단) */}
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '16px 20px calc(16px + env(safe-area-inset-bottom, 0px))', background: 'var(--bg)', borderTop: '1px solid var(--border)' }}>
        <button
          onClick={handleSave}
          disabled={!canSave}
          style={{ width: '100%', padding: '16px', borderRadius: 14, background: canSave ? '#111' : 'var(--surface)', color: canSave ? 'white' : 'var(--text-muted)', border: 'none', cursor: canSave ? 'pointer' : 'default', fontSize: 15, fontWeight: 700, transition: 'background 0.2s, color 0.2s' }}
        >
          {L(lang, { zh: '保存路线', ko: '코스 저장', en: 'Save Course' })}
        </button>
      </div>

      {/* 장소 검색 모달 */}
      {showSearch && (
        <StopSearchModal
          lang={lang}
          onAdd={addStop}
          onClose={() => setShowSearch(false)}
          addedIds={addedIds}
        />
      )}
    </div>
  )
}
