import { Save, Eye, EyeOff } from 'lucide-react'
import { useState } from 'react'

export default function SettingsTab() {
  const [settings, setSettings] = useState({
    siteName: 'NEAR - 당신의 서울 가이드',
    supportEmail: 'support@hanpocket.com',
    maxUsersPerHotel: '5000',
    maintenanceMode: false,
    apiRateLimit: '1000',
    showApiKey: false,
  })

  const [showSave, setShowSave] = useState(false)

  const handleChange = (key, value) => {
    setSettings({ ...settings, [key]: value })
    setShowSave(true)
  }

  const handleSave = () => {
    alert('설정이 저장되었습니다.')
    setShowSave(false)
  }

  return (
    <div className="space-y-4">
      {/* General Settings */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-6">일반 설정</h3>

        <div className="space-y-6">
          {/* Site Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">사이트명</label>
            <input
              type="text"
              value={settings.siteName}
              onChange={(e) => handleChange('siteName', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Support Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">지원 이메일</label>
            <input
              type="email"
              value={settings.supportEmail}
              onChange={(e) => handleChange('supportEmail', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Max Users Per Hotel */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">호텔당 최대 사용자</label>
            <input
              type="number"
              value={settings.maxUsersPerHotel}
              onChange={(e) => handleChange('maxUsersPerHotel', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Maintenance Mode */}
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <p className="font-medium text-gray-900">유지보수 모드</p>
              <p className="text-sm text-gray-500">활성화하면 사용자가 앱에 접근할 수 없습니다.</p>
            </div>
            <label className="flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.maintenanceMode}
                onChange={(e) => handleChange('maintenanceMode', e.target.checked)}
                className="w-4 h-4 text-blue-600"
              />
              <span className="ml-2 text-sm">{settings.maintenanceMode ? '활성화' : '비활성화'}</span>
            </label>
          </div>
        </div>
      </div>

      {/* API Settings */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-6">API 설정</h3>

        <div className="space-y-6">
          {/* API Rate Limit */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">API 요청 제한 (분당)</label>
            <input
              type="number"
              value={settings.apiRateLimit}
              onChange={(e) => handleChange('apiRateLimit', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* API Key */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">API Key</label>
            <div className="flex gap-2">
              <input
                type={settings.showApiKey ? 'text' : 'password'}
                value="sk_live_51234567890abcdef"
                readOnly
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600"
              />
              <button
                onClick={() => setSettings({ ...settings, showApiKey: !settings.showApiKey })}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                {settings.showApiKey ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Save Button */}
      {showSave && (
        <div className="flex justify-end gap-3">
          <button
            onClick={() => setShowSave(false)}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium"
          >
            취소
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center gap-2"
          >
            <Save size={18} />
            저장
          </button>
        </div>
      )}
    </div>
  )
}
