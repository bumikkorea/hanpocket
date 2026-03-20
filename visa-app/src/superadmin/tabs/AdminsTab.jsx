import { CheckCircle, XCircle, MoreVertical, Download, QrCode } from 'lucide-react'
import { useState } from 'react'
import QRCode from 'qrcode'

export default function AdminsTab() {
  const [admins] = useState([
    { id: 1, name: '홍길동', email: 'admin1@example.com', hotel: '명동롯데호텔', status: 'approved', joined: '2026-01-15' },
    { id: 2, name: '김영미', email: 'admin2@example.com', hotel: '홍대L7호텔', status: 'approved', joined: '2026-02-10' },
    { id: 3, name: '박준호', email: 'admin3@example.com', hotel: '강남이비스', status: 'pending', joined: '2026-03-18' },
    { id: 4, name: '이순신', email: 'admin4@example.com', hotel: '서울시청호텔', status: 'approved', joined: '2026-02-20' },
  ])

  const [qrModal, setQrModal] = useState(null)

  const generateQRCode = async (adminId, adminName) => {
    try {
      const qrUrl = `${window.location.origin}/admin.html?a=${adminId}`
      const qrDataUrl = await QRCode.toDataURL(qrUrl, {
        width: 300,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF',
        },
      })
      setQrModal({ adminId, adminName, qrUrl, qrDataUrl })
    } catch (error) {
      alert('QR 코드 생성 실패: ' + error.message)
    }
  }

  const downloadQRCode = async (adminId, adminName) => {
    try {
      const canvas = await QRCode.toCanvas(document.createElement('canvas'), `${window.location.origin}/admin.html?a=${adminId}`, {
        width: 300,
        margin: 2,
      })
      const link = document.createElement('a')
      link.href = canvas.toDataURL('image/png')
      link.download = `admin-qr-${adminId}-${adminName}.png`
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
                  <td className="px-6 py-3 text-right flex gap-1 justify-end">
                    <button
                      onClick={() => generateQRCode(admin.id, admin.name)}
                      className="p-2 hover:bg-blue-100 rounded-lg transition-colors text-blue-600"
                      title="QR 코드 생성"
                    >
                      <QrCode size={18} />
                    </button>
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

      {/* QR Code Modal */}
      {qrModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6 space-y-4">
            <div className="text-center">
              <h3 className="text-lg font-bold text-gray-900 mb-2">{qrModal.adminName}</h3>
              <p className="text-sm text-gray-500 mb-4">점주 관리자 QR 코드</p>
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
                onClick={() => downloadQRCode(qrModal.adminId, qrModal.adminName)}
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
