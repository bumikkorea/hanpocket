import { MapPin, Users, MoreVertical } from 'lucide-react'
import { useState } from 'react'

export default function HotelsTab() {
  const [hotels] = useState([
    { id: 1, name: '명동롯데호텔', location: '서울 중구', admin: '홍길동', users: 1245, status: 'active' },
    { id: 2, name: '홍대L7호텔', location: '서울 마포구', admin: '김영미', users: 832, status: 'active' },
    { id: 3, name: '강남이비스', location: '서울 강남구', admin: '박준호', users: 456, status: 'pending' },
    { id: 4, name: '서울시청호텔', location: '서울 종로구', admin: '이순신', users: 678, status: 'active' },
    { id: 5, name: '인천공항 애비스', location: '인천 중구', admin: '미배정', users: 123, status: 'inactive' },
  ])

  return (
    <div className="space-y-4">
      {/* Add Hotel Button */}
      <div className="flex justify-end">
        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm">
          + 호텔 추가
        </button>
      </div>

      {/* Hotels Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {hotels.map((hotel) => (
          <div key={hotel.id} className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-3">
              <h3 className="font-bold text-gray-900">{hotel.name}</h3>
              <button className="p-2 hover:bg-gray-100 rounded-lg">
                <MoreVertical size={16} className="text-gray-500" />
              </button>
            </div>

            <div className="space-y-2 text-sm text-gray-600 mb-4">
              <div className="flex items-center gap-2">
                <MapPin size={16} className="text-gray-400" />
                <span>{hotel.location}</span>
              </div>
              <div className="flex items-center gap-2">
                <Users size={16} className="text-gray-400" />
                <span>{hotel.users.toLocaleString()}명 사용</span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-gray-100">
              <div>
                <p className="text-xs text-gray-500">관리자</p>
                <p className="font-medium text-sm">{hotel.admin}</p>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                hotel.status === 'active' ? 'bg-green-100 text-green-800' :
                hotel.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                'bg-gray-100 text-gray-800'
              }`}>
                {hotel.status === 'active' ? '활성' : hotel.status === 'pending' ? '대기' : '비활성'}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
