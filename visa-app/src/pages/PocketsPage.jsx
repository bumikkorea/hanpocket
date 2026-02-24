import React, { useState } from 'react'
import { pocketCategories, serviceItems, subMenuData } from '../data/pockets'
import EducationTab from '../components/EducationTab'
import AgencyTab from '../components/AgencyTab'
import PetTab from '../components/PetTab'
import MedicalTab from '../components/MedicalTab'
import FitnessTab from '../components/FitnessTab'
import ShoppingTab from '../components/ShoppingTab'
import CultureTab from '../components/CultureTab'
import LifeToolsTab from '../components/LifeToolsTab'
import JobsTab from '../components/JobsTab'
import HousingTab from '../components/HousingTab'
import TravelTab from '../components/TravelTab'
import FoodTab from '../components/FoodTab'
import HallyuTab from '../components/HallyuTab'
import TranslatorTab from '../components/TranslatorTab'
import ARTranslateTab from '../components/ARTranslateTab'
import SOSTab from '../components/SOSTab'
import CommunityTab from '../components/CommunityTab'
import VisaAlertTab from '../components/VisaAlertTab'
import FinanceTab from '../components/FinanceTab'
import ResumeTab from '../components/ResumeTab'
import DigitalWalletTab from '../components/DigitalWalletTab'

const pocketComponents = {
  education: EducationTab,
  agency: AgencyTab,
  pet: PetTab,
  medical: MedicalTab,
  fitness: FitnessTab,
  shopping: ShoppingTab,
  culture: CultureTab,
  lifetools: LifeToolsTab,
  jobs: JobsTab,
  housing: HousingTab,
  travel: TravelTab,
  food: FoodTab,
  hallyu: HallyuTab,
  translator: TranslatorTab,
  artranslate: ARTranslateTab,
  sos: SOSTab,
  community: CommunityTab,
  visaalert: VisaAlertTab,
  finance: FinanceTab,
  resume: ResumeTab,
  digitalwallet: DigitalWalletTab,
}

function L(lang, data) {
  if (typeof data === 'string') return data
  return data?.[lang] || data?.en || data?.zh || data?.ko || ''
}

export default function PocketsPage({ profile, exchangeRate, lang, subPage, setSubPage, onTabChange }) {
  if (subPage) {
    const Component = pocketComponents[subPage]
    if (Component) {
      return (
        <div className="space-y-4">
          <button 
            onClick={() => setSubPage(null)}
            className="text-[#111827] text-sm font-medium"
          >
            ← {lang === 'ko' ? '뒤로' : lang === 'zh' ? '返回' : 'Back'}
          </button>
          <Component 
            profile={profile} 
            exchangeRate={exchangeRate} 
            lang={lang} 
            onTabChange={onTabChange}
          />
        </div>
      )
    }
  }

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-3">
        {pocketCategories.map((cat, i) => (
          <button
            key={cat.id}
            onClick={() => setSubPage(cat.id)}
            style={{ animationDelay: `${i * 0.05}s` }}
            className="glass rounded-lg p-4 card-hover btn-press text-left animate-fade-up"
          >
            <div className="text-2xl mb-2">{cat.icon}</div>
            <div className="font-bold text-[#111827] text-sm">{L(lang, cat.name)}</div>
            <div className="text-xs text-[#6B7280] mt-1">{L(lang, cat.description)}</div>
          </button>
        ))}
      </div>
    </div>
  )
}