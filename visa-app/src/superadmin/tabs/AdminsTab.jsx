import { CheckCircle, XCircle, MoreVertical } from 'lucide-react'
import { useState } from 'react'

export default function AdminsTab() {
  const [admins] = useState([
    { id: 1, name: '홍길동', email: 'admin1@example.com', hotel: '명동롯데호텔', status: 'approved', joined: '2026-01-15' },
    { id: 2, name: '김영미', email: 'admin2@example.com', hotel: '홍대L7호텔', status: 'approved', joined: '2026-02-10' },
    { id: 3, name: '박준호', email: 'admin3@example.com', hotel: '강남이비스', status: 'pending', joined: '2026-03-18' },
    { id: 4, name: '이순신', email: 'admin4@example.com', hotel: '서울시청호텔', status: 'approved', joined: '2026-02-20' },
  ])

  return (
    <div className="space-y-4">
      {/* Add Admin Button */}
      <div className="flex justify-end">
        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm">
          + 관리자 추가
        </button>
      </div>

      {/* Admins Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-6 py-3 font-semibold text-gray-700">이름</th>
                <th className="text-left px-6 py-3 font-semibold text-gray-700">이메일</th>
                <th className="text-left px-6 py-3 font-semibold text-gray-700">관리 호텔</th>
                <th className="text-left px-6 py-3 font-semibold text-gray-700">가입일</th>
                <th className="text-left px-6 py-3 font-semibold text-gray-700">상태</th>
                <th className="text-right px-6 py-3 font-semibold text-gray-700">작업</th>
              </tr>
            </thead>
            <tbody>
              {admins.map((admin) => (
                <tr key={admin.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="px-6 py-3 font-medium text-gray-900">{admin.name}</td>
                  <td className="px-6 py-3 text-gray-600">{admin.email}</td>
                  <td className="px-6 py-3 text-gray-600">{admin.hotel}</td>
                  <td className="px-6 py-3 text-gray-600">{admin.joined}</td>
                  <td className="px-6 py-3">
                    {admin.status === 'approved' ? (
                      <div className="flex items-center gap-2 text-green-600 font-semibold text-xs">
                        <CheckCircle size={16} />
                        승인됨
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 text-yellow-600 font-semibold text-xs">
                        <XCircle size={16} />
                        대기중
                      </div>
                    )}
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
    </div>
  )
}
