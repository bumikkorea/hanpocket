import React from 'react'
import HomeTab from '../components/HomeTab'

export default function HomePage({ profile, exchangeRate, lang, onTabChange }) {
  return (
    <HomeTab 
      profile={profile}
      exchangeRate={exchangeRate}
      lang={lang}
      onTabChange={onTabChange}
    />
  )
}