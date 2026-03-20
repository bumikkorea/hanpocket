import { Bell, Search, User } from 'lucide-react'

export default function SuperAdminHeader({ user, currentTab }) {
  const tabNames = {
    dashboard: '대시보드',
    users: '사용자 관리',
    admins: '관리자 관리',
    hotels: '호텔/점주 관리',
    settings: '시스템 설정',
    logs: '로그 및 분석',
  }

  return (
    <div className="bg-white border-b border-gray-200 px-4 md:px-6 py-4 sticky top-0 z-30">
      <div className="flex items-center justify-between gap-4">
        {/* Title */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">NEAR 시스템</h1>
          <p className="text-sm text-gray-500">{tabNames[currentTab]}</p>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-3 md:gap-4">
          {/* Search */}
          <div className="hidden md:flex items-center gap-2 bg-gray-100 rounded-lg px-3 py-2">
            <Search size={18} className="text-gray-400" />
            <input
              type="text"
              placeholder="검색..."
              className="bg-transparent outline-none text-sm w-40"
            />
          </div>

          {/* Notifications */}
          <button className="relative p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <Bell size={20} className="text-gray-600" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
          </button>

          {/* User Profile */}
          <button className="flex items-center gap-2 p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-sm font-bold">
              {user.name.charAt(0)}
            </div>
            <div className="hidden md:block text-left">
              <p className="text-sm font-semibold text-gray-900">{user.name}</p>
              <p className="text-xs text-gray-500">Super Admin</p>
            </div>
          </button>
        </div>
      </div>
    </div>
  )
}
