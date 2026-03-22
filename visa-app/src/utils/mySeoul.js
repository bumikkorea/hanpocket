/**
 * mySeoul.js — 내 서울 데이터 유틸
 * localStorage key: 'near_my_seoul'
 * { pins: [...], courses: [...] }
 */

export const getMySeoul = () => {
  try {
    const data = localStorage.getItem('near_my_seoul')
    return data ? JSON.parse(data) : { pins: [], courses: [] }
  } catch { return { pins: [], courses: [] } }
}

export const addPin = (popup) => {
  const data = getMySeoul()
  if (data.pins.find(p => p.id === popup.id)) return false
  data.pins.push({
    id: popup.id,
    name_zh: popup.name_zh,
    name_ko: popup.name_ko,
    name_en: popup.name_en,
    lat: popup.lat,
    lng: popup.lng,
    category: popup.category,
    addedAt: new Date().toISOString(),
  })
  localStorage.setItem('near_my_seoul', JSON.stringify(data))
  return true
}

export const removePin = (popupId) => {
  const data = getMySeoul()
  data.pins = data.pins.filter(p => p.id !== popupId)
  data.courses.forEach(c => {
    c.pinIds = c.pinIds.filter(id => id !== popupId)
  })
  localStorage.setItem('near_my_seoul', JSON.stringify(data))
}

export const isPinSaved = (popupId) => {
  return getMySeoul().pins.some(p => p.id === popupId)
}

export const addBulkPins = (popups) => {
  const data = getMySeoul()
  let added = 0
  popups.forEach(popup => {
    if (!data.pins.find(p => p.id === popup.id)) {
      data.pins.push({
        id: popup.id,
        name_zh: popup.name_zh || popup.name || '',
        name_ko: popup.name_ko || '',
        name_en: popup.name_en || '',
        lat: popup.lat,
        lng: popup.lng,
        category: popup.category || 'custom',
        addedAt: new Date().toISOString(),
      })
      added++
    }
  })
  localStorage.setItem('near_my_seoul', JSON.stringify(data))
  return added
}

export const saveMyCourse = (title, pinIds) => {
  const data = getMySeoul()
  const id = 'my_' + Date.now()
  data.courses.push({ id, title, pinIds, createdAt: new Date().toISOString() })
  localStorage.setItem('near_my_seoul', JSON.stringify(data))
  // NearMap 호환: near_custom_courses에도 저장
  const pins = data.pins.filter(p => pinIds.includes(p.id))
  const customCourse = {
    id,
    type: 'custom',
    title_zh: title,
    title_ko: title,
    title_en: title,
    stop_count: pins.length,
    estimated_hours: +(pins.length * 0.5).toFixed(1),
    poi_ids: pinIds,
  }
  try {
    const existing = JSON.parse(localStorage.getItem('near_custom_courses') || '[]')
    localStorage.setItem('near_custom_courses', JSON.stringify([customCourse, ...existing]))
  } catch {}
}

export const deleteMyCourse = (courseId) => {
  const data = getMySeoul()
  data.courses = data.courses.filter(c => c.id !== courseId)
  localStorage.setItem('near_my_seoul', JSON.stringify(data))
  // near_custom_courses에서도 삭제
  try {
    const existing = JSON.parse(localStorage.getItem('near_custom_courses') || '[]')
    localStorage.setItem('near_custom_courses', JSON.stringify(existing.filter(c => c.id !== courseId)))
  } catch {}
}
