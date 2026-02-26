import { useState, useEffect } from 'react'

const useDarkMode = () => {
  // 시스템 다크모드 감지
  const prefersDark = typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches

  // localStorage에서 설정 불러오기, 없으면 시스템 설정 사용
  const [isDark, setIsDark] = useState(() => {
    if (typeof window === 'undefined') return false
    
    const saved = localStorage.getItem('hp_dark_mode')
    if (saved !== null) {
      return JSON.parse(saved)
    }
    return prefersDark
  })

  // 다크모드 토글 함수
  const toggleDarkMode = () => {
    setIsDark(!isDark)
  }

  // 다크모드 직접 설정 함수
  const setDarkMode = (value) => {
    setIsDark(value)
  }

  // DOM과 localStorage 업데이트
  useEffect(() => {
    if (typeof window === 'undefined') return

    const root = document.documentElement
    
    if (isDark) {
      root.classList.add('dark')
    } else {
      root.classList.remove('dark')
    }

    // localStorage에 설정 저장
    localStorage.setItem('hp_dark_mode', JSON.stringify(isDark))

    // 메타 테마 컬러 업데이트 (모바일 상단바 색상)
    const metaThemeColor = document.querySelector('meta[name="theme-color"]')
    if (metaThemeColor) {
      metaThemeColor.setAttribute('content', isDark ? '#111827' : '#ffffff')
    }
  }, [isDark])

  // 시스템 다크모드 변경 감지
  useEffect(() => {
    if (typeof window === 'undefined') return

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    
    const handleChange = (e) => {
      // localStorage에 사용자 설정이 없는 경우에만 시스템 설정 따라가기
      const userPreference = localStorage.getItem('hp_dark_mode')
      if (userPreference === null) {
        setIsDark(e.matches)
      }
    }

    mediaQuery.addEventListener('change', handleChange)
    
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [])

  return {
    isDark,
    toggleDarkMode,
    setDarkMode
  }
}

export default useDarkMode