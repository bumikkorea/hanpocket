import { useState, useEffect } from 'react'
import { ChevronLeft } from 'lucide-react'
import HotelHeader from './HotelHeader'
import HotelMenuGrid from './HotelMenuGrid'
import DeliveryPage from './pages/DeliveryPage'
import TaxiPage from './pages/TaxiPage'
import NearbyFoodPage from './pages/NearbyFoodPage'
import BeautyBookingPage from './pages/BeautyBookingPage'
import NearbyMapPage from './pages/NearbyMapPage'
import EmergencyPage from './pages/EmergencyPage'
import { hotels } from '../data/hotels'

const L = (lang, data) => {
  if (typeof data === 'string') return data
  return data?.[lang] || data?.ko || data?.en || ''
}

export default function HotelApp() {
  const [currentPage, setCurrentPage] = useState('menu') // 'menu' | 'delivery' | 'taxi' | 'food' | 'beauty' | 'map' | 'emergency'
  const [language, setLanguage] = useState('zh') // 'ko' | 'zh' | 'en'
  const [hotel, setHotel] = useState(null)

  // Extract hotel ID from URL query params
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const hotelId = params.get('h')

    if (hotelId) {
      const selectedHotel = hotels.find(h => h.id === hotelId)
      if (selectedHotel) {
        setHotel(selectedHotel)
      }
    } else {
      // Default to first hotel if no param
      setHotel(hotels[0])
    }
  }, [])

  const pageProps = {
    hotel,
    language,
    onBack: () => setCurrentPage('menu'),
    L,
  }

  if (!hotel) {
    return (
      <div className="w-full h-screen flex items-center justify-center bg-gradient-to-b from-gray-50 to-gray-100">
        <div className="text-center">
          <div className="text-gray-500 text-sm">Loading hotel...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full h-screen bg-white flex flex-col overflow-hidden">
      {/* Header with back button */}
      {currentPage !== 'menu' && (
        <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-100 bg-white">
          <button
            onClick={() => setCurrentPage('menu')}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ChevronLeft size={24} />
          </button>
          <div className="flex-1 text-center">
            <h2 className="font-semibold text-gray-900">
              {currentPage === 'delivery' && L(language, '点餐')}
              {currentPage === 'taxi' && L(language, '打车')}
              {currentPage === 'food' && L(language, '附近美食')}
              {currentPage === 'beauty' && L(language, '美容预约')}
              {currentPage === 'map' && L(language, '周边地图')}
              {currentPage === 'emergency' && L(language, '紧急求助')}
            </h2>
          </div>
          <div className="w-10" />
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 overflow-y-auto">
        {currentPage === 'menu' && (
          <>
            <HotelHeader hotel={hotel} language={language} onLanguageChange={setLanguage} L={L} />
            <HotelMenuGrid
              hotel={hotel}
              language={language}
              onSelectMenu={(menu) => setCurrentPage(menu)}
              L={L}
            />
          </>
        )}

        {currentPage === 'delivery' && <DeliveryPage {...pageProps} />}
        {currentPage === 'taxi' && <TaxiPage {...pageProps} />}
        {currentPage === 'food' && <NearbyFoodPage {...pageProps} />}
        {currentPage === 'beauty' && <BeautyBookingPage {...pageProps} />}
        {currentPage === 'map' && <NearbyMapPage {...pageProps} />}
        {currentPage === 'emergency' && <EmergencyPage {...pageProps} />}
      </div>
    </div>
  )
}
