import { useState, useEffect, useCallback } from 'react'

const STORAGE_KEY = 'hp_wishlist'
const LAST_VISIT_KEY = 'hp_wishlist_last_visit'

function loadWishlist() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || []
  } catch {
    return []
  }
}

function saveWishlist(items) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
}

const useWishlist = () => {
  const [items, setItems] = useState(loadWishlist)

  // Update last visit timestamp on mount
  useEffect(() => {
    localStorage.setItem(LAST_VISIT_KEY, new Date().toISOString())
  }, [])

  // Sync to localStorage whenever items change
  useEffect(() => {
    saveWishlist(items)
  }, [items])

  const addItem = useCallback(({ type = 'place', name, note = '', imageUrl = '' }) => {
    const newItem = {
      id: Date.now().toString(36) + Math.random().toString(36).slice(2, 7),
      type,
      name,
      note,
      imageUrl,
      addedAt: new Date().toISOString()
    }
    setItems(prev => [newItem, ...prev])
    return newItem
  }, [])

  const removeItem = useCallback((id) => {
    setItems(prev => prev.filter(item => item.id !== id))
  }, [])

  const updateItem = useCallback((id, updates) => {
    setItems(prev => prev.map(item =>
      item.id === id ? { ...item, ...updates } : item
    ))
  }, [])

  const getAll = useCallback(() => items, [items])

  const getLastVisitDate = useCallback(() => {
    try {
      const d = localStorage.getItem(LAST_VISIT_KEY)
      return d ? new Date(d) : null
    } catch {
      return null
    }
  }, [])

  const shouldShowReengagement = useCallback(() => {
    if (items.length === 0) return false
    const last = getLastVisitDate()
    if (!last) return false
    const diffMs = Date.now() - last.getTime()
    const diffDays = diffMs / (1000 * 60 * 60 * 24)
    return diffDays >= 30
  }, [items, getLastVisitDate])

  return {
    items,
    addItem,
    removeItem,
    updateItem,
    getAll,
    getLastVisitDate,
    shouldShowReengagement
  }
}

export default useWishlist
