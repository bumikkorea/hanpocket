import { useState } from 'react'
import { Lock, Settings, AlertCircle, Store, PlusCircle, Database, Flag } from 'lucide-react'
import { supabase as supabaseNear } from '../lib/supabase'
import { supabaseScraper } from '../lib/supabaseScraper'
import SuperAdminHeader from './SuperAdminHeader'
import SuperAdminNav from './SuperAdminNav'
import PopupReviewTab from './tabs/PopupReviewTab'
import PopupManualRegister from './tabs/PopupManualRegister'
import PopupNearManage from './tabs/PopupNearManage'
import ReportManageTab, { useReportPendingCount } from './tabs/ReportManageTab'
import SettingsTab from './tabs/SettingsTab'

/**
 * SHA-256으로 비밀번호 해싱
 */
async function hashPassword(password) {
  const encoder = new TextEncoder()
  const data = encoder.encode(password)
  const hash = await crypto.subtle.digest('SHA-256', data)
  return Array.from(new Uint8Array(hash))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('')
}

/**
 * 로그인 시도 잠금 관리 (5회 실패 시 1분 잠금)
 */
function getLoginAttempts() {
  const stored = sessionStorage.getItem('superadmin_login_attempts')
  if (!stored) return { count: 0, lockedUntil: 0 }
  return JSON.parse(stored)
}

function setLoginAttempts(count, lockedUntil = 0) {
  sessionStorage.setItem('superadmin_login_attempts', JSON.stringify({ count, lockedUntil }))
}

function isLoginLocked() {
  const { lockedUntil } = getLoginAttempts()
  return lockedUntil > Date.now()
}

/**
 * 로그인 화면
 */
function SuperAdminLoginScreen({ onLogin }) {
  const [pw, setPw] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()

    // 잠금 확인
    if (isLoginLocked()) {
      const { lockedUntil } = getLoginAttempts()
      const remainSec = Math.ceil((lockedUntil - Date.now()) / 1000)
      setError(`로그인이 잠겨있습니다. ${remainSec}초 후 시도해주세요.`)
      return
    }

    setIsLoading(true)
    try {
      const inputHash = await hashPassword(pw)
      const expectedHash = import.meta.env.VITE_SUPERADMIN_PASSWORD_HASH

      if (inputHash === expectedHash) {
        setLoginAttempts(0, 0) // 성공 시 초기화
        onLogin()
      } else {
        const { count } = getLoginAttempts()
        const newCount = count + 1

        if (newCount >= 5) {
          const lockedUntil = Date.now() + 60000 // 1분 잠금
          setLoginAttempts(newCount, lockedUntil)
          setError('비밀번호 5회 오류. 1분 동안 잠깁니다.')
        } else {
          setLoginAttempts(newCount)
          setError(`비밀번호가 올바르지 않습니다. (${5 - newCount}회 시도 남음)`)
        }
        setPw('')
      }
    } catch (err) {
      setError('인증 처리 중 오류가 발생했습니다.')
      console.error('Login error:', err)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50 p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 space-y-6">
        {/* 헤더 */}
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-100 rounded-full mb-4">
            <Lock size={24} className="text-blue-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">슈퍼관리자</h1>
          <p className="text-sm text-gray-500 mt-1">시스템 관리 대시보드</p>
        </div>

        {/* 오류 메시지 */}
        {error && (
          <div className="flex gap-3 p-3 bg-red-50 rounded-lg border border-red-200">
            <AlertCircle size={18} className="text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {/* 로그인 폼 */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              비밀번호
            </label>
            <input
              type="password"
              value={pw}
              onChange={(e) => setPw(e.target.value)}
              placeholder="비밀번호를 입력하세요"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              disabled={isLoading}
            />
          </div>

          <button
            type="submit"
            disabled={isLoading || isLoginLocked()}
            className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition-colors font-medium"
          >
            {isLoading ? '인증 중...' : '로그인'}
          </button>
        </form>

        {/* 안내 */}
        <p className="text-xs text-gray-500 text-center">
          5회 오류 시 1분 동안 로그인이 제한됩니다.
        </p>
      </div>
    </div>
  )
}

export default function SuperAdminApp() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [currentTab, setCurrentTab] = useState('popup-review')
  const [user, setUser] = useState({
    name: 'Admin User',
    role: 'super_admin',
    email: 'admin@hanpocket.com',
  })

  // 로그인되지 않았으면 로그인 화면 표시
  if (!isAuthenticated) {
    return <SuperAdminLoginScreen onLogin={() => setIsAuthenticated(true)} />
  }

  const reportPendingCount = useReportPendingCount(supabaseNear)

  const tabs = [
    { id: 'popup-review',    label: '팝업 검수', icon: Store },
    { id: 'manual-register', label: '수동 등록', icon: PlusCircle },
    { id: 'near-manage',     label: '매장 관리', icon: Database },
    { id: 'report-manage',   label: '신고 관리', icon: Flag, badge: reportPendingCount || null },
    { id: 'settings',        label: '설정',      icon: Settings },
  ]

  const handleLogout = () => {
    if (confirm('정말 로그아웃하시겠습니까?')) {
      window.location.href = '/'
    }
  }

  return (
    <div className="w-full min-h-screen bg-gray-50 flex flex-col md:flex-row">
      {/* Sidebar Navigation */}
      <SuperAdminNav
        tabs={tabs}
        currentTab={currentTab}
        onTabChange={setCurrentTab}
        user={user}
        onLogout={handleLogout}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <SuperAdminHeader user={user} currentTab={currentTab} />

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 pb-24 md:pb-6">
          {currentTab === 'popup-review'    && <PopupReviewTab supabaseScraper={supabaseScraper} supabaseNear={supabaseNear} />}
          {currentTab === 'manual-register' && <PopupManualRegister supabaseNear={supabaseNear} />}
          {currentTab === 'near-manage'     && <PopupNearManage supabaseNear={supabaseNear} />}
          {currentTab === 'report-manage'   && <ReportManageTab supabaseNear={supabaseNear} />}
          {currentTab === 'settings'        && <SettingsTab />}
        </div>
      </div>
    </div>
  )
}
