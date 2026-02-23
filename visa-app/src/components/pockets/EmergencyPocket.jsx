import { useState, useEffect } from 'react'
import { Copy, Phone, MapPin, Shield, Truck, AlertTriangle, User } from 'lucide-react'

// 다국어 헬퍼 함수
const L = (lang, text) => text[lang] || text['ko']

export default function EmergencyPocket({ lang }) {
  const [showSOSMode, setShowSOSMode] = useState(false)
  const [location, setLocation] = useState(null)
  const [loadingLocation, setLoadingLocation] = useState(false)
  const [toastMessage, setToastMessage] = useState('')

  // 토스트 메시지 표시 함수
  const showToast = (message) => {
    setToastMessage(message)
    setTimeout(() => setToastMessage(''), 2000)
  }

  // 클립보드 복사 함수
  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(() => {
      showToast(L(lang, { ko: '복사됨!', zh: '已复制!', en: 'Copied!' }))
    })
  }

  // SOS 모드 활성화 (진동 효과)
  const activateSOS = () => {
    setShowSOSMode(true)
    // 진동 효과 (지원하는 디바이스에서)
    if (navigator.vibrate) {
      navigator.vibrate([200, 100, 200, 100, 200])
    }
  }

  // 현재 위치 가져오기
  const getCurrentLocation = () => {
    setLoadingLocation(true)
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords
          try {
            // 카카오 지오코딩 API 등을 사용할 수 있지만, 여기서는 간단한 좌표 표시
            setLocation({
              coords: `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`,
              address: L(lang, { 
                ko: '위치 정보를 가져오는 중...', 
                zh: '正在获取位置信息...', 
                en: 'Getting location info...' 
              })
            })
          } catch (error) {
            setLocation({
              coords: `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`,
              address: L(lang, { 
                ko: '주소 변환 실패', 
                zh: '地址转换失败', 
                en: 'Address conversion failed' 
              })
            })
          }
          setLoadingLocation(false)
        },
        (error) => {
          showToast(L(lang, { 
            ko: '위치 정보를 가져올 수 없습니다', 
            zh: '无法获取位置信息', 
            en: 'Cannot get location' 
          }))
          setLoadingLocation(false)
        },
        { enableHighAccuracy: true, timeout: 10000 }
      )
    } else {
      showToast(L(lang, { 
        ko: '위치 서비스가 지원되지 않습니다', 
        zh: '不支持位置服务', 
        en: 'Location service not supported' 
      }))
      setLoadingLocation(false)
    }
  }

  // 전화 걸기
  const makeCall = (number) => {
    window.open(`tel:${number}`)
  }

  // 긴급 연락처
  const emergencyContacts = [
    {
      number: '112',
      name: { ko: '경찰', zh: '警察', en: 'Police' },
      description: { ko: '범죄신고, 사고신고', zh: '犯罪举报、事故报告', en: 'Crime & accident reports' },
      icon: Shield,
      color: 'bg-blue-600 hover:bg-blue-700'
    },
    {
      number: '119',
      name: { ko: '소방/응급', zh: '消防/急救', en: 'Fire/Emergency' },
      description: { ko: '화재, 응급의료', zh: '火灾、急救医疗', en: 'Fire & emergency medical' },
      icon: Truck,
      color: 'bg-red-600 hover:bg-red-700'
    },
    {
      number: '1345',
      name: { ko: '외국인종합안내', zh: '外国人综合咨询', en: 'Foreigner Helpline' },
      description: { ko: '24시간 다국어 상담', zh: '24小时多语言咨询', en: '24/7 multilingual support' },
      icon: User,
      color: 'bg-green-600 hover:bg-green-700'
    }
  ]

  // 증상 표현
  const symptoms = [
    {
      ko: '머리가 아파요',
      zh: '头疼',
      en: 'I have a headache',
      pronunciation: 'meo-ri-ga a-pa-yo'
    },
    {
      ko: '배가 아파요',
      zh: '肚子疼',
      en: 'I have a stomachache',
      pronunciation: 'bae-ga a-pa-yo'
    },
    {
      ko: '다쳤어요',
      zh: '受伤了',
      en: 'I am injured',
      pronunciation: 'da-chyeo-sseo-yo'
    },
    {
      ko: '열이 나요',
      zh: '发烧',
      en: 'I have a fever',
      pronunciation: 'yeo-ri na-yo'
    },
    {
      ko: '숨쉬기 힘들어요',
      zh: '呼吸困难',
      en: 'I have difficulty breathing',
      pronunciation: 'sum-swi-gi him-deu-reo-yo'
    },
    {
      ko: '가슴이 아파요',
      zh: '胸口疼',
      en: 'I have chest pain',
      pronunciation: 'ga-seu-mi a-pa-yo'
    }
  ]

  // 중국대사관 정보
  const embassy = {
    name: { ko: '주한중국대사관', zh: '中国驻韩国大使馆', en: 'Chinese Embassy in Korea' },
    phone: '02-738-1038',
    emergency: '010-8581-0110',
    address: { ko: '서울특별시 중구 명동2가 27-6', zh: '首尔特别市中区明洞2街27-6', en: '27-6 Myeongdong 2-ga, Jung-gu, Seoul' },
    procedures: [
      { ko: '1. 경찰서에 분실신고', zh: '1. 到警察局报失', en: '1. Report loss to police' },
      { ko: '2. 분실신고서 받기', zh: '2. 获得遗失报告书', en: '2. Get loss report' },
      { ko: '3. 대사관 방문 (여권용 사진 2장)', zh: '3. 访问大使馆 (2张护照照片)', en: '3. Visit embassy (2 passport photos)' },
      { ko: '4. 임시여행증명서 발급', zh: '4. 申请临时旅行证', en: '4. Apply for temporary travel document' }
    ]
  }

  return (
    <div className="space-y-4" style={{ fontFamily: 'Inter, sans-serif' }}>
      {/* 토스트 메시지 */}
      {toastMessage && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white px-4 py-2 rounded-lg text-sm z-50">
          {toastMessage}
        </div>
      )}

      {/* SOS 모드 */}
      {!showSOSMode ? (
        <div className="bg-red-50 border-2 border-red-200 p-4 rounded-lg">
          <button
            onClick={activateSOS}
            className="w-full bg-red-600 hover:bg-red-700 text-white py-6 rounded-xl font-bold text-xl transition-colors flex items-center justify-center gap-3"
          >
            <AlertTriangle className="w-8 h-8" />
            {L(lang, { ko: 'SOS 도와주세요!', zh: 'SOS 救命!', en: 'SOS HELP!' })}
          </button>
          <div className="text-center text-sm text-red-600 mt-2">
            {L(lang, { ko: '탭하면 큰 화면으로 표시됩니다', zh: '点击后大屏显示', en: 'Tap to show on large screen' })}
          </div>
        </div>
      ) : (
        // 전체화면 SOS 모드
        <div className="fixed inset-0 bg-red-600 z-50 flex flex-col">
          <div className="p-4">
            <button
              onClick={() => setShowSOSMode(false)}
              className="text-white font-medium opacity-80"
            >
              ← {L(lang, { ko: '돌아가기', zh: '返回', en: 'Back' })}
            </button>
          </div>
          <div className="flex-1 flex items-center justify-center p-6">
            <div className="text-center">
              <AlertTriangle className="w-24 h-24 text-white mx-auto mb-6" />
              <div className="text-6xl font-bold text-white mb-4">
                SOS
              </div>
              <div className="text-3xl font-bold text-white">
                {L(lang, { ko: '도와주세요!', zh: '救命!', en: 'HELP!' })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 긴급 연락처 */}
      {!showSOSMode && (
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
            <Phone className="w-5 h-5" />
            {L(lang, { ko: '긴급 연락처', zh: '紧急联系方式', en: 'Emergency Contacts' })}
          </h3>
          <div className="space-y-3">
            {emergencyContacts.map((contact, index) => (
              <button
                key={index}
                onClick={() => makeCall(contact.number)}
                className={`w-full ${contact.color} text-white p-4 rounded-lg transition-colors flex items-center gap-3`}
              >
                <contact.icon className="w-6 h-6" />
                <div className="flex-1 text-left">
                  <div className="font-bold text-lg">{contact.number}</div>
                  <div className="font-medium">{L(lang, contact.name)}</div>
                  <div className="text-sm opacity-90">{L(lang, contact.description)}</div>
                </div>
                <Phone className="w-5 h-5" />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 현재 위치 */}
      {!showSOSMode && (
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
            <MapPin className="w-5 h-5" />
            {L(lang, { ko: '현재 위치', zh: '当前位置', en: 'Current Location' })}
          </h3>
          <button
            onClick={getCurrentLocation}
            disabled={loadingLocation}
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium mb-3 disabled:bg-gray-400 hover:bg-blue-700 transition-colors"
          >
            {loadingLocation 
              ? L(lang, { ko: '위치 확인 중...', zh: '正在获取位置...', en: 'Getting location...' })
              : L(lang, { ko: '내 위치 확인', zh: '获取我的位置', en: 'Get my location' })
            }
          </button>
          {location && (
            <div className="bg-white border border-gray-200 rounded-lg p-3">
              <div className="font-medium text-gray-800 mb-2">
                {L(lang, { ko: '좌표', zh: '坐标', en: 'Coordinates' })}
              </div>
              <div className="text-sm text-gray-600 mb-2">{location.coords}</div>
              <button
                onClick={() => copyToClipboard(location.coords)}
                className="text-blue-600 text-sm hover:underline flex items-center gap-1"
              >
                <Copy className="w-3 h-3" />
                {L(lang, { ko: '좌표 복사', zh: '复制坐标', en: 'Copy coordinates' })}
              </button>
            </div>
          )}
        </div>
      )}

      {/* 증상 표현 */}
      {!showSOSMode && (
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="font-semibold text-gray-800 mb-3">
            {L(lang, { ko: '증상 표현', zh: '症状表达', en: 'Symptoms' })}
          </h3>
          <div className="space-y-2">
            {symptoms.map((item, index) => (
              <button
                key={index}
                onClick={() => copyToClipboard(item[lang])}
                className="w-full p-3 bg-white border border-gray-200 rounded-lg text-left hover:bg-gray-100 transition-colors group"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="font-medium text-gray-800 mb-1">
                      {item[lang]}
                    </div>
                    <div className="text-sm text-gray-500">
                      {item.pronunciation}
                    </div>
                  </div>
                  <Copy className="w-4 h-4 text-gray-400 group-hover:text-gray-600" />
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 여권 분실 - 중국대사관 */}
      {!showSOSMode && (
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="font-semibold text-gray-800 mb-3">
            {L(lang, { ko: '여권 분실', zh: '护照遗失', en: 'Lost Passport' })}
          </h3>
          
          {/* 대사관 연락처 */}
          <div className="bg-white border border-gray-200 rounded-lg p-3 mb-3">
            <div className="font-semibold text-gray-800 mb-2">
              {L(lang, embassy.name)}
            </div>
            <div className="space-y-1">
              <button
                onClick={() => makeCall(embassy.phone)}
                className="flex items-center gap-2 text-blue-600 hover:underline"
              >
                <Phone className="w-4 h-4" />
                {L(lang, { ko: '일반전화', zh: '普通电话', en: 'General' })}: {embassy.phone}
              </button>
              <button
                onClick={() => makeCall(embassy.emergency)}
                className="flex items-center gap-2 text-red-600 hover:underline"
              >
                <Phone className="w-4 h-4" />
                {L(lang, { ko: '응급전화', zh: '紧急电话', en: 'Emergency' })}: {embassy.emergency}
              </button>
            </div>
            <div className="text-sm text-gray-600 mt-2">
              {L(lang, embassy.address)}
            </div>
          </div>

          {/* 절차 안내 */}
          <div className="bg-yellow-50 border border-yellow-300 rounded-lg p-3">
            <div className="font-semibold text-yellow-800 mb-2">
              {L(lang, { ko: '절차 안내', zh: '办理流程', en: 'Procedures' })}
            </div>
            <div className="space-y-1">
              {embassy.procedures.map((step, index) => (
                <div key={index} className="text-sm text-yellow-700">
                  {L(lang, step)}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 사용법 안내 */}
      {!showSOSMode && (
        <div className="text-xs text-gray-500 bg-red-50 p-3 rounded-lg">
          🚨 {L(lang, { 
            ko: 'SOS 버튼은 응급상황에서 사용하세요. 증상 표현을 미리 복사해두면 의사소통에 도움이 됩니다.', 
            zh: 'SOS按钮用于紧急情况。提前复制症状表达有助于沟通。', 
            en: 'Use SOS button in emergencies. Copy symptom expressions in advance for better communication.' 
          })}
        </div>
      )}
    </div>
  )
}