import { useState } from 'react'
import { Utensils, MapPin, Star } from 'lucide-react'

function L(lang, data) {
  if (typeof data === 'string') return data
  return data?.[lang] || data?.en || data?.zh || data?.ko || ''
}

export default function FoodTab({ lang, setTab }) {
  return (
    <div className="space-y-6">
      <p className="text-sm text-[#6B7280]">Loading...</p>
    </div>
  )
}
