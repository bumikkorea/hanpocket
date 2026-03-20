import { Users, Building2, TrendingUp, AlertCircle, Activity, Eye } from 'lucide-react'

export default function DashboardTab() {
  const stats = [
    { label: '총 사용자', value: '12,548', change: '+2.3%', icon: Users, color: 'bg-blue-500' },
    { label: '활성 호텔', value: '328', change: '+5.1%', icon: Building2, color: 'bg-purple-500' },
    { label: '가입 관리자', value: '45', change: '+0.8%', icon: Activity, color: 'bg-green-500' },
    { label: '오류 알림', value: '12', change: '-3.2%', icon: AlertCircle, color: 'bg-red-500' },
  ]

  const recentUsers = [
    { id: 1, name: '김철수', email: 'kim@example.com', joined: '2026-03-20', status: 'active' },
    { id: 2, name: '이영희', email: 'lee@example.com', joined: '2026-03-19', status: 'active' },
    { id: 3, name: '박준호', email: 'park@example.com', joined: '2026-03-18', status: 'pending' },
    { id: 4, name: '정수진', email: 'jung@example.com', joined: '2026-03-17', status: 'active' },
  ]

  const recentActivity = [
    { id: 1, action: '새 사용자 가입', target: '김철수', timestamp: '2시간 전' },
    { id: 2, action: '호텔 등록', target: '명동롯데호텔', timestamp: '4시간 전' },
    { id: 3, action: '관리자 승인', target: '이영희', timestamp: '6시간 전' },
    { id: 4, action: '결제 처리', target: '강남이비스', timestamp: '8시간 전' },
  ]

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, idx) => {
          const Icon = stat.icon
          return (
            <div key={idx} className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className={`${stat.color} p-3 rounded-lg text-white`}>
                  <Icon size={24} />
                </div>
                <span className="text-sm font-semibold text-green-600">{stat.change}</span>
              </div>
              <p className="text-gray-500 text-sm mb-1">{stat.label}</p>
              <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
            </div>
          )
        })}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* User Growth Chart Placeholder */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">사용자 증가 추이</h3>
          <div className="h-64 bg-gradient-to-b from-blue-50 to-gray-50 rounded-lg flex items-center justify-center">
            <div className="text-center text-gray-400">
              <TrendingUp size={32} className="mx-auto mb-2" />
              <p className="text-sm">차트 데이터 로딩 중...</p>
            </div>
          </div>
        </div>

        {/* Activity Overview */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">최근 활동</h3>
          <div className="space-y-3">
            {recentActivity.map((activity) => (
              <div key={activity.id} className="flex items-start gap-3 pb-3 border-b border-gray-100 last:border-0">
                <div className="w-2 h-2 rounded-full bg-blue-500 mt-2 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">
                    {activity.action} - <span className="text-blue-600">{activity.target}</span>
                  </p>
                  <p className="text-xs text-gray-500 mt-1">{activity.timestamp}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Users Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-bold text-gray-900">최근 가입 사용자</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-6 py-3 font-semibold text-gray-700">이름</th>
                <th className="text-left px-6 py-3 font-semibold text-gray-700">이메일</th>
                <th className="text-left px-6 py-3 font-semibold text-gray-700">가입일</th>
                <th className="text-left px-6 py-3 font-semibold text-gray-700">상태</th>
              </tr>
            </thead>
            <tbody>
              {recentUsers.map((user) => (
                <tr key={user.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="px-6 py-3 font-medium text-gray-900">{user.name}</td>
                  <td className="px-6 py-3 text-gray-600">{user.email}</td>
                  <td className="px-6 py-3 text-gray-600">{user.joined}</td>
                  <td className="px-6 py-3">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      user.status === 'active'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {user.status === 'active' ? '활성' : '대기'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
