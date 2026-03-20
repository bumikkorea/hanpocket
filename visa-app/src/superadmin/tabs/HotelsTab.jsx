import { MapPin, Users, MoreVertical, Download, QrCode } from 'lucide-react'
import { useState } from 'react'
import QRCode from 'qrcode'

export default function HotelsTab() {
  const [hotels] = useState([
    { id: 1, name: '명동롯데호텔', location: '서울 중구', admin: '홍길동', users: 1245, status: 'active' },
    { id: 2, name: '홍대L7호텔', location: '서울 마포구', admin: '김영미', users: 832, status: 'active' },
    { id: 3, name: '강남이비스', location: '서울 강남구', admin: '박준호', users: 456, status: 'pending' },
    { id: 4, name: '서울시청호텔', location: '서울 종로구', admin: '이순신', users: 678, status: 'active' },
    { id: 5, name: '인천공항 애비스', location: '인천 중구', admin: '미배정', users: 123, status: 'inactive' },
  ])

  const [qrModal, setQrModal] = useState(null)

  const generateQRCode = async (hotelId, hotelName) => {
    try {
      const qrUrl = `${window.location.origin}/hotel.html?h=hotel-${hotelId}`
      const qrDataUrl = await QRCode.toDataURL(qrUrl, {
        width: 300,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF',
        },
      })
      setQrModal({ hotelId, hotelName, qrUrl, qrDataUrl })
    } catch (error) {
      alert('QR 코드 생성 실패: ' + error.message)
    }
  }

  const downloadQRCode = async (hotelId, hotelName) => {
    try {
      const canvas = await QRCode.toCanvas(document.createElement('canvas'), `${window.location.origin}/hotel.html?h=hotel-${hotelId}`, {
        width: 300,
        margin: 2,
      })
      const link = document.createElement('a')
      link.href = canvas.toDataURL('image/png')
      link.download = `hotel-qr-${hotelId}-${hotelName}.png`
      link.click()
    } catch (error) {
      alert('QR 코드 다운로드 실패: ' + error.message)
    }
  }

  const copyQRLink = (qrUrl) => {
    navigator.clipboard.writeText(qrUrl)
    alert('링크가 복사되었습니다.')
  }

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

            <div className="flex items-center justify-between pt-3 border-t border-gray-100 mb-3">
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

            <button
              onClick={() => generateQRCode(hotel.id, hotel.name)}
              className="w-full px-3 py-2 bg-blue-50 border border-blue-200 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors text-sm font-medium flex items-center justify-center gap-2"
            >
              <QrCode size={16} />
              QR 코드 생성
            </button>
          </div>
        ))}
      </div>

      {/* QR Code Modal */}
      {qrModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6 space-y-4">
            <div className="text-center">
              <h3 className="text-lg font-bold text-gray-900 mb-2">{qrModal.hotelName}</h3>
              <p className="text-sm text-gray-500 mb-4">호텔 QR 코드</p>
            </div>

            <div className="flex justify-center bg-gray-50 p-4 rounded-lg">
              <img src={qrModal.qrDataUrl} alt="QR Code" className="w-64 h-64" />
            </div>

            <div className="bg-gray-50 p-3 rounded-lg">
              <p className="text-xs text-gray-500 mb-1">QR 링크</p>
              <p className="text-xs text-gray-700 break-all font-mono">{qrModal.qrUrl}</p>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => copyQRLink(qrModal.qrUrl)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium text-sm"
              >
                링크 복사
              </button>
              <button
                onClick={() => downloadQRCode(qrModal.hotelId, qrModal.hotelName)}
                className="flex-1 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm flex items-center justify-center gap-2"
              >
                <Download size={16} />
                다운로드
              </button>
            </div>

            <button
              onClick={() => setQrModal(null)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium text-sm"
            >
              닫기
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
