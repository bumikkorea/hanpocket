import { Search, Filter, MoreVertical, Trash2, CheckCircle } from 'lucide-react'
import { useState } from 'react'

export default function UsersTab() {
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')

  const users = [
    { id: 1, name: '김철수', email: 'kim@example.com', joined: '2026-03-20', status: 'active', country: '중국' },
    { id: 2, name: '이영희', email: 'lee@example.com', joined: '2026-03-19', status: 'active', country: '중국' },
    { id: 3, name: '박준호', email: 'park@example.com', joined: '2026-03-18', status: 'pending', country: '미국' },
    { id: 4, name: '정수진', email: 'jung@example.com', joined: '2026-03-17', status: 'blocked', country: '중국' },
    { id: 5, name: '최민서', email: 'choi@example.com', joined: '2026-03-16', status: 'active', country: '일본' },
  ]

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.includes(searchTerm) || user.email.includes(searchTerm)
    const matchesStatus = filterStatus === 'all' || user.status === filterStatus
    return matchesSearch && matchesStatus
  })

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="bg-white rounded-lg border border-gray-200 p-4 flex flex-col md:flex-row gap-4">
        <div className="flex-1 flex items-center gap-2 bg-gray-100 rounded-lg px-3 py-2">
          <Search size={18} className="text-gray-400" />
          <input
            type="text"
            placeholder="사용자 검색..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-transparent outline-none text-sm flex-1"
          />
        </div>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg text-sm"
        >
          <option value="all">모든 상태</option>
          <option value="active">활성</option>
          <option value="pending">대기</option>
          <option value="blocked">차단</option>
        </select>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-6 py-3 font-semibold text-gray-700">이름</th>
                <th className="text-left px-6 py-3 font-semibold text-gray-700">이메일</th>
                <th className="text-left px-6 py-3 font-semibold text-gray-700">국가</th>
                <th className="text-left px-6 py-3 font-semibold text-gray-700">가입일</th>
                <th className="text-left px-6 py-3 font-semibold text-gray-700">상태</th>
                <th className="text-right px-6 py-3 font-semibold text-gray-700">작업</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => (
                <tr key={user.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="px-6 py-3 font-medium text-gray-900">{user.name}</td>
                  <td className="px-6 py-3 text-gray-600">{user.email}</td>
                  <td className="px-6 py-3 text-gray-600">{user.country}</td>
                  <td className="px-6 py-3 text-gray-600">{user.joined}</td>
                  <td className="px-6 py-3">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      user.status === 'active' ? 'bg-green-100 text-green-800' :
                      user.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {user.status === 'active' ? '활성' : user.status === 'pending' ? '대기' : '차단'}
                    </span>
                  </td>
                  <td className="px-6 py-3 text-right">
                    <button className="p-2 hover:bg-gray-200 rounded-lg transition-colors">
                      <MoreVertical size={18} className="text-gray-600" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {filteredUsers.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">검색 결과가 없습니다.</p>
        </div>
      )}
    </div>
  )
}
