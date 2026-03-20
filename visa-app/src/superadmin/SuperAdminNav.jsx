import { LogOut, Menu, X } from 'lucide-react'
import { useState } from 'react'

export default function SuperAdminNav({ tabs, currentTab, onTabChange, user, onLogout }) {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setMobileOpen(!mobileOpen)}
        className="md:hidden fixed top-4 left-4 z-40 p-2 hover:bg-gray-100 rounded-lg"
      >
        {mobileOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Sidebar */}
      <aside
        className={`
          w-64 bg-gray-900 text-white flex flex-col
          fixed md:relative inset-0 md:inset-auto z-30
          transform transition-transform duration-300
          ${mobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        `}
      >
        {/* Logo */}
        <div className="p-6 border-b border-gray-800">
          <h1 className="text-2xl font-bold text-white">NEAR</h1>
          <p className="text-xs text-gray-400 mt-1">시스템 관리</p>
        </div>

        {/* Nav Items */}
        <nav className="flex-1 p-4 space-y-2">
          {tabs.map((tab) => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => {
                  onTabChange(tab.id)
                  setMobileOpen(false)
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  currentTab === tab.id
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                }`}
              >
                <Icon size={20} />
                <span className="font-medium text-sm">{tab.label}</span>
              </button>
            )
          })}
        </nav>

        {/* User Info + Logout */}
        <div className="p-4 border-t border-gray-800 space-y-3">
          <div className="px-4 py-3 bg-gray-800 rounded-lg">
            <p className="text-sm font-semibold text-white">{user.name}</p>
            <p className="text-xs text-gray-400 mt-1">{user.email}</p>
          </div>
          <button
            onClick={onLogout}
            className="w-full flex items-center gap-2 px-4 py-3 text-red-400 hover:bg-red-500 hover:text-white rounded-lg transition-colors font-medium text-sm"
          >
            <LogOut size={18} />
            로그아웃
          </button>
        </div>
      </aside>

      {/* Mobile Overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 md:hidden z-20"
          onClick={() => setMobileOpen(false)}
        />
      )}
    </>
  )
}
