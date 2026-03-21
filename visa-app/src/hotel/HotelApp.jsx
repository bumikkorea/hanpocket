import { useState, useEffect } from 'react'
import { X } from 'lucide-react'
import HotelHeader from './components/HotelHeader'
import HotelMenuGrid from './components/HotelMenuGrid'
import DeliveryPage from './pages/DeliveryPage'
import TaxiPage from './pages/TaxiPage'
import NearbyFoodPage from './pages/NearbyFoodPage'
import BeautyBookingPage from './pages/BeautyBookingPage'
import NearbyMapPage from './pages/NearbyMapPage'
import EmergencyPage from './pages/EmergencyPage'
import OnboardingFlow from './components/OnboardingFlow'

const hotels = {
  'myeongdong-lotte': {
    id: 'myeongdong-lotte',
    name: { ko: '명동 롯데호텔', zh: '明洞乐天酒店', en: 'Lotte Hotel Myeongdong' },
    address: { ko: '서울 중구 명동 1-1', zh: '首尔市中区明洞1-1', en: 'Myeongdong 1-1, Jung-gu, Seoul' },
    phone: '02-1661-7000',
    lat: 37.5643,
    lng: 127.0021
  },
  'hongdae-l7': {
    id: 'hongdae-l7',
    name: { ko: '홍대 L7 호텔', zh: '弘大L7酒店', en: 'L7 Hotel Hongdae' },
    address: { ko: '서울 마포구 홍대 2-4', zh: '首尔市麻浦区弘大2-4', en: 'Hongdae 2-4, Mapo-gu, Seoul' },
    phone: '02-6954-7000',
    lat: 37.5548,
    lng: 126.9224
  },
  'gangnam-ibis': {
    id: 'gangnam-ibis',
    name: { ko: '강남 이비스 호텔', zh: '江南宜必思酒店', en: 'Ibis Gangnam Hotel' },
    address: { ko: '서울 강남구 강남 2-5', zh: '首尔市江南区江南2-5', en: 'Gangnam 2-5, Gangnam-gu, Seoul' },
    phone: '02-3451-2222',
    lat: 37.4979,
    lng: 127.0277
  }
}

const L = (obj) => {
  if (!obj) return ''
  if (typeof obj === 'string') return obj
  return obj.zh || obj.ko || obj.en || ''
}

export default function HotelApp() {
  const [hotel, setHotel] = useState(null)
  const [currentPage, setCurrentPage] = useState('menu')
  const [showOnboarding, setShowOnboarding] = useState(false)

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const hotelId = params.get('h') || 'myeongdong-lotte'
    const selectedHotel = hotels[hotelId]
    
    if (selectedHotel) {
      setHotel(selectedHotel)
    } else {
      setHotel(hotels['myeongdong-lotte'])
    }

    const visited = localStorage.getItem('hotel_app_visited')
    if (!visited) {
      setShowOnboarding(true)
      localStorage.setItem('hotel_app_visited', 'true')
    }
  }, [])

  if (!hotel) {
    return <div className="w-full h-screen flex items-center justify-center bg-white">로딩중...</div>
  }

  if (showOnboarding) {
    return (
      <OnboardingFlow
        onComplete={() => setShowOnboarding(false)}
      />
    )
  }

  return (
    <div className="fixed inset-0 flex flex-col bg-white">
      {/* 상단 헤더 */}
      <HotelHeader
        hotel={hotel}
        onClose={() => window.close()}
      />

      {/* 메인 콘텐츠 */}
      <div className="flex-1 overflow-y-auto">
        {currentPage === 'menu' && (
          <HotelMenuGrid
            hotel={hotel}
            onSelectMenu={(menu) => setCurrentPage(menu)}
          />
        )}

        {currentPage === 'delivery' && (
          <DeliveryPage
            hotel={hotel}
            onBack={() => setCurrentPage('menu')}
          />
        )}

        {currentPage === 'taxi' && (
          <TaxiPage
            hotel={hotel}
            onBack={() => setCurrentPage('menu')}
          />
        )}

        {currentPage === 'food' && (
          <NearbyFoodPage
            hotel={hotel}
            onBack={() => setCurrentPage('menu')}
          />
        )}

        {currentPage === 'beauty' && (
          <BeautyBookingPage
            hotel={hotel}
            onBack={() => setCurrentPage('menu')}
          />
        )}

        {currentPage === 'map' && (
          <NearbyMapPage
            hotel={hotel}
            onBack={() => setCurrentPage('menu')}
          />
        )}

        {currentPage === 'emergency' && (
          <EmergencyPage
            onBack={() => setCurrentPage('menu')}
          />
        )}
      </div>
    </div>
  )
}
