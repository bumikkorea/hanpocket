import { useState } from 'react'
import { BarChart3, Users, Building2, Lock, Settings, FileText, LogOut } from 'lucide-react'
import SuperAdminHeader from './SuperAdminHeader'
import SuperAdminNav from './SuperAdminNav'
import DashboardTab from './tabs/DashboardTab'
import UsersTab from './tabs/UsersTab'
import AdminsTab from './tabs/AdminsTab'
import HotelsTab from './tabs/HotelsTab'
import SettingsTab from './tabs/SettingsTab'
import LogsTab from './tabs/LogsTab'

export default function SuperAdminApp() {
  const [currentTab, setCurrentTab] = useState('dashboard')
  const [user, setUser] = useState({
    name: 'Admin User',
    role: 'super_admin',
    email: 'admin@hanpocket.com',
  })

  const tabs = [
    { id: 'dashboard', label: '대시보드', icon: BarChart3 },
    { id: 'users', label: '사용자', icon: Users },
    { id: 'admins', label: '관리자', icon: Lock },
    { id: 'hotels', label: '호텔/점주', icon: Building2 },
    { id: 'settings', label: '설정', icon: Settings },
    { id: 'logs', label: '로그', icon: FileText },
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
        <div className="flex-1 overflow-y-auto p-4 md:p-6">
          {currentTab === 'dashboard' && <DashboardTab />}
          {currentTab === 'users' && <UsersTab />}
          {currentTab === 'admins' && <AdminsTab />}
          {currentTab === 'hotels' && <HotelsTab />}
          {currentTab === 'settings' && <SettingsTab />}
          {currentTab === 'logs' && <LogsTab />}
        </div>
      </div>
    </div>
  )
}
