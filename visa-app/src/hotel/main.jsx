import React from 'react'
import ReactDOM from 'react-dom/client'
import HotelApp from './HotelApp'
import '../index.css'

const _hotelEl = document.getElementById('hotel-root')
if (_hotelEl) {
  ReactDOM.createRoot(_hotelEl).render(
    <React.StrictMode>
      <HotelApp />
    </React.StrictMode>
  )
}
