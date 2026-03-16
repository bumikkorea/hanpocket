// usePopupReview — 팝업 리뷰 + 반응(왕좋아요/좋아요) + 보상 관리
// 3차원 현장 반응 루프의 핵심 훅

import { useState, useCallback } from 'react'
import { REWARD_TIERS, EXPLORER_LEVELS } from '../data/popupCategories'

const API = 'https://hanpocket-popup-store.bumik-korea.workers.dev/api'
const TASTE_KEY = 'hp_popup_taste'
const REWARDS_KEY = 'hp_popup_rewards'

// 사용자 토큰 (익명, 기기별)
function getUserToken() {
  let token = localStorage.getItem('hp_user_token')
  if (!token) {
    token = 'u_' + crypto.randomUUID()
    localStorage.setItem('hp_user_token', token)
  }
  return token
}

// 로컬 취향 프로필 로드
function loadTaste() {
  try {
    return JSON.parse(localStorage.getItem(TASTE_KEY)) || {
      fav_categories: [],
      fav_districts: [],
      visit_count: 0,
      review_count: 0,
      total_points: 0,
      explorer_level: 1,
      badges: [],
    }
  } catch { return { fav_categories: [], fav_districts: [], visit_count: 0, review_count: 0, total_points: 0, explorer_level: 1, badges: [] } }
}

function saveTaste(taste) {
  localStorage.setItem(TASTE_KEY, JSON.stringify(taste))
}

// 보상 이력 로드
function loadRewards() {
  try {
    return JSON.parse(localStorage.getItem(REWARDS_KEY)) || []
  } catch { return [] }
}

function saveRewards(rewards) {
  localStorage.setItem(REWARDS_KEY, JSON.stringify(rewards))
}

// 랜덤 포인트 생성
function rollRewardPoints(tier) {
  const range = REWARD_TIERS[tier]
  if (!range) return 50
  const [min, max] = range.points
  return Math.floor(Math.random() * (max - min + 1)) + min
}

// 탐험가 레벨 계산
function calcExplorerLevel(visitCount) {
  let level = 1
  for (const l of EXPLORER_LEVELS) {
    if (visitCount >= l.minVisits) level = l.level
  }
  return level
}

// 취향 카테고리 업데이트 (최근 방문 가중)
function updateFavCategories(current, newCategory) {
  const map = {}
  for (const c of current) map[c] = (map[c] || 0) + 1
  map[newCategory] = (map[newCategory] || 0) + 2 // 최근 것 가중치

  return Object.entries(map)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([k]) => k)
}


export function usePopupReview() {
  const [submitting, setSubmitting] = useState(false)
  const [lastReward, setLastReward] = useState(null)
  const [taste, setTaste] = useState(() => loadTaste())

  // ── 반응: 왕좋아요 / 좋아요 ──
  const submitReaction = useCallback(async (popupId, reactionType) => {
    const user_token = getUserToken()
    try {
      const res = await fetch(`${API}/popups/${popupId}/reaction`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_token, reaction_type: reactionType }),
      })
      return res.ok
    } catch {
      // 오프라인 → 로컬 저장 후 나중에 싱크
      const pending = JSON.parse(localStorage.getItem('hp_pending_reactions') || '[]')
      pending.push({ popupId, reactionType, user_token, at: Date.now() })
      localStorage.setItem('hp_pending_reactions', JSON.stringify(pending))
      return true
    }
  }, [])

  // ── 리뷰 제출 ──
  const submitReview = useCallback(async (popupId, reviewData) => {
    // reviewData: { rating, crowd_level, comment, lang, photos, tags }
    setSubmitting(true)
    const user_token = getUserToken()

    // 리뷰 티어 판별
    let review_tier = 'mini'
    if (reviewData.photos?.length > 0 && reviewData.comment) review_tier = 'premium'
    else if (reviewData.comment) review_tier = 'normal'

    // 보상 계산
    const points = rollRewardPoints(review_tier)
    const reward = {
      type: 'points',
      detail: `${points}P`,
      source: 'system',
      tier: review_tier,
    }

    try {
      const res = await fetch(`${API}/popups/${popupId}/review`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_token,
          ...reviewData,
          review_tier,
          reward_type: reward.type,
          reward_detail: reward.detail,
          reward_source: reward.source,
        }),
      })

      if (!res.ok) throw new Error('리뷰 제출 실패')

      // 로컬 취향 업데이트
      const newTaste = { ...taste }
      newTaste.review_count += 1
      newTaste.visit_count += 1
      newTaste.total_points += points
      if (reviewData.category) {
        newTaste.fav_categories = updateFavCategories(newTaste.fav_categories, reviewData.category)
      }
      if (reviewData.district) {
        newTaste.fav_districts = updateFavCategories(newTaste.fav_districts, reviewData.district)
      }
      newTaste.explorer_level = calcExplorerLevel(newTaste.visit_count)

      // 배지 체크
      if (newTaste.review_count === 1 && !newTaste.badges.includes('first_review')) {
        newTaste.badges.push('first_review')
      }
      if (review_tier === 'premium' && !newTaste.badges.includes('photo_master')) {
        const premiumCount = loadRewards().filter(r => r.tier === 'premium').length + 1
        if (premiumCount >= 5) newTaste.badges.push('photo_master')
      }

      saveTaste(newTaste)
      setTaste(newTaste)

      // 보상 이력 저장
      const rewards = loadRewards()
      rewards.push({ ...reward, popupId, at: Date.now() })
      saveRewards(rewards)
      setLastReward(reward)

      return { success: true, reward, taste: newTaste }

    } catch (err) {
      // 오프라인 폴백
      const pending = JSON.parse(localStorage.getItem('hp_pending_reviews') || '[]')
      pending.push({ popupId, ...reviewData, review_tier, reward, user_token, at: Date.now() })
      localStorage.setItem('hp_pending_reviews', JSON.stringify(pending))

      // 로컬 취향은 업데이트
      const newTaste = { ...taste, review_count: taste.review_count + 1, total_points: taste.total_points + points }
      saveTaste(newTaste)
      setTaste(newTaste)
      setLastReward(reward)

      return { success: true, reward, taste: newTaste, offline: true }

    } finally {
      setSubmitting(false)
    }
  }, [taste])

  // ── 리뷰 후 추천 클릭 추적 ──
  const trackPostReviewClick = useCallback(async (sourcePopupId, clickedType, clickedId, cardPosition) => {
    const user_token = getUserToken()
    try {
      await fetch(`${API}/popups/post-review-click`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_token, source_popup: sourcePopupId, clicked_type: clickedType, clicked_id: clickedId, card_position: cardPosition }),
      })
    } catch {} // 실패해도 무시
  }, [])

  // ── 탐험가 정보 ──
  const explorerInfo = EXPLORER_LEVELS.find(l => l.level === taste.explorer_level) || EXPLORER_LEVELS[0]

  return {
    // 상태
    submitting,
    lastReward,
    taste,
    explorerInfo,

    // 액션
    submitReaction,
    submitReview,
    trackPostReviewClick,

    // 유틸
    getUserToken,
  }
}
