/**
 * useUserPopups — 사용자가 소셜미디어 URL로 추가한 팝업 관리
 * localStorage 'hp_user_popups' 에 저장
 *
 * 파싱 우선순위:
 *  1. Cloudflare Worker (hanpocket-popup-parser) — 배포 시 풀파싱
 *  2. Microlink API — Worker 없을 때 og태그 기반 폴백 (무료 50req/월, CORS 허용)
 *  3. 로컬 감지 — Microlink도 실패 시 플랫폼만 감지
 */
import { useState, useCallback } from 'react'

const STORAGE_KEY = 'hp_user_popups'
const PARSER_ENDPOINT = 'https://hanpocket-popup-parser.hanpocket.workers.dev/parse'
const MICROLINK_ENDPOINT = 'https://api.microlink.io'

function loadFromStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function saveToStorage(popups) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(popups))
  } catch {}
}

/** Microlink API로 og태그 파싱 (Instagram, TikTok, 일반 웹) */
async function parseMicrolink(url) {
  const params = new URLSearchParams({
    url,
    palette: 'false',
    audio: 'false',
    video: 'false',
    iframe: 'false',
  })
  const resp = await fetch(`${MICROLINK_ENDPOINT}/?${params}`, {
    headers: { 'x-api-key': '' }, // 무료 플랜 — 키 없이 사용
  })
  if (!resp.ok) throw new Error(`Microlink ${resp.status}`)
  const json = await resp.json()
  if (json.status !== 'success') throw new Error(json.message || 'Microlink failed')

  const m = json.data
  const platform = detectPlatformLocal(url)
  return {
    platform,
    sourceUrl: url,
    title: m.title || '',
    brand: extractBrand(m.title, m.publisher, platform),
    description: m.description || '',
    image: m.image?.url || m.logo?.url || '',
    address: '',            // og태그에서는 주소 추출 안 됨 — 사용자 직접 입력
    district: 'other',
    period: { start: '', end: '' },
    tags: m.tags || [],
    color: PLATFORM_COLORS[platform] || '#374151',
    parsedBy: 'microlink',
  }
}

/** 브랜드명 추측 (제목 또는 publisher에서 추출) */
function extractBrand(title, publisher, platform) {
  if (publisher && publisher !== 'Instagram' && publisher !== 'TikTok' && publisher !== '小红书') {
    return publisher
  }
  // 제목 앞부분에서 브랜드 추측 (첫 번째 | 또는 - 앞)
  if (title) {
    const sep = title.match(/^(.+?)\s*[|\-–—]\s*/)
    if (sep) return sep[1].trim().slice(0, 30)
  }
  return ''
}

export function useUserPopups() {
  const [userPopups, setUserPopups] = useState(() => loadFromStorage())
  const [parsing, setParsing] = useState(false)
  const [parseError, setParseError] = useState(null)

  // URL 파싱 → 팝업 정보 추출
  const parseUrl = useCallback(async (url) => {
    setParsing(true)
    setParseError(null)

    // 1단계: Cloudflare Worker 시도
    try {
      const resp = await fetch(`${PARSER_ENDPOINT}?url=${encodeURIComponent(url)}`, {
        signal: AbortSignal.timeout(5000), // 5초 타임아웃
      })
      const data = await resp.json()
      if (data.error && !data.title) throw new Error(data.error)
      return { ...data, parsedBy: 'worker' }
    } catch {
      // Worker 실패 → Microlink 폴백
    }

    // 2단계: Microlink API 폴백
    try {
      const result = await parseMicrolink(url)
      return result
    } catch (mlErr) {
      // Microlink도 실패 → 로컬 감지만
      const platform = detectPlatformLocal(url)
      setParseError(mlErr.message)
      return {
        platform,
        sourceUrl: url,
        title: '',
        brand: '',
        description: '',
        image: '',
        address: '',
        district: 'other',
        period: { start: '', end: '' },
        tags: [],
        color: PLATFORM_COLORS[platform] || '#374151',
        parseError: true,
        parsedBy: 'local',
      }
    } finally {
      setParsing(false)
    }
  }, [])

  // 팝업 저장 (사용자가 확인/수정 후)
  const addPopup = useCallback((parsed, edits = {}) => {
    const popup = {
      id: `user_${Date.now()}`,
      addedAt: Date.now(),
      ...parsed,
      ...edits,
    }
    setUserPopups(prev => {
      const next = [popup, ...prev]
      saveToStorage(next)
      return next
    })
    return popup
  }, [])

  // 팝업 삭제
  const removePopup = useCallback((id) => {
    setUserPopups(prev => {
      const next = prev.filter(p => p.id !== id)
      saveToStorage(next)
      return next
    })
  }, [])

  // 팝업 수정
  const updatePopup = useCallback((id, changes) => {
    setUserPopups(prev => {
      const next = prev.map(p => p.id === id ? { ...p, ...changes } : p)
      saveToStorage(next)
      return next
    })
  }, [])

  return { userPopups, parsing, parseError, parseUrl, addPopup, removePopup, updatePopup }
}

function detectPlatformLocal(url) {
  const u = (url || '').toLowerCase()
  if (u.includes('instagram.com') || u.includes('instagr.am')) return 'instagram'
  if (u.includes('xiaohongshu.com') || u.includes('xhslink.com') || u.includes('xhs.cn')) return 'xiaohongshu'
  if (u.includes('facebook.com') || u.includes('fb.com')) return 'facebook'
  if (u.includes('tiktok.com') || u.includes('vm.tiktok.com')) return 'tiktok'
  if (u.includes('douyin.com')) return 'douyin'
  return 'web'
}

const PLATFORM_COLORS = {
  instagram: '#E1306C',
  xiaohongshu: '#FF2442',
  facebook: '#1877F2',
  tiktok: '#010101',
  douyin: '#FE2C55',
  web: '#374151',
}

export const PLATFORM_INFO = {
  instagram:    { name: 'Instagram', color: '#E1306C', icon: '📸' },
  xiaohongshu:  { name: '小红书',    color: '#FF2442', icon: '📕' },
  facebook:     { name: 'Facebook',  color: '#1877F2', icon: '👥' },
  tiktok:       { name: 'TikTok',    color: '#010101', icon: '🎵' },
  douyin:       { name: '抖音',      color: '#FE2C55', icon: '🎬' },
  web:          { name: 'Web',       color: '#374151', icon: '🌐' },
}
