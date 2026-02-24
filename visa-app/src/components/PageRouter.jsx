import React from 'react'
import HomePage from '../pages/HomePage'
import VisaPage from '../pages/VisaPage'
import PocketsPage from '../pages/PocketsPage'
import ChatTab from './ChatTab'

export default function PageRouter({ 
  currentTab,
  profile,
  exchangeRate,
  lang,
  view,
  setView,
  selCat,
  setSelCat,
  selVisa,
  setSelVisa,
  sq,
  setSq,
  subPage,
  setSubPage,
  onTabChange
}) {
  switch (currentTab) {
    case 'home':
      return (
        <HomePage 
          profile={profile} 
          exchangeRate={exchangeRate} 
          lang={lang} 
          onTabChange={onTabChange} 
        />
      )
    
    case 'visa':
      return (
        <VisaPage 
          profile={profile} 
          lang={lang} 
          view={view} 
          setView={setView}
          selCat={selCat} 
          setSelCat={setSelCat}
          selVisa={selVisa} 
          setSelVisa={setSelVisa}
          sq={sq} 
          setSq={setSq}
        />
      )
    
    case 'pockets':
      return (
        <PocketsPage 
          profile={profile} 
          exchangeRate={exchangeRate} 
          lang={lang} 
          subPage={subPage} 
          setSubPage={setSubPage}
          onTabChange={onTabChange}
        />
      )
    
    case 'chat':
      return <ChatTab profile={profile} lang={lang} />
    
    default:
      return (
        <HomePage 
          profile={profile} 
          exchangeRate={exchangeRate} 
          lang={lang} 
          onTabChange={onTabChange} 
        />
      )
  }
}