import { Globe, Cloud, TrendingUp } from 'lucide-react'

export default function HotelHeader({ hotel, language, onLanguageChange, L }) {
  const languages = [
    { code: 'zh', name: '中文' },
    { code: 'ko', name: '한국어' },
    { code: 'en', name: 'English' },
  ]

  return (
    <div className="bg-white border-b border-gray-100 px-4 py-6">
      {/* Hotel Name */}
      <div className="mb-4">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">
          {L(language, hotel.name)}
        </h1>
        <p className="text-sm text-gray-500">{hotel.address}</p>
      </div>

      {/* Language Switcher */}
      <div className="flex gap-2 mb-4">
        {languages.map((lang) => (
          <button
            key={lang.code}
            onClick={() => onLanguageChange(lang.code)}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
              language === lang.code
                ? 'bg-[#3182F6] text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {lang.name}
          </button>
        ))}
      </div>

      {/* Info Row: Weather + Exchange Rate */}
      <div className="flex gap-2 text-xs">
        <div className="flex items-center gap-1 text-gray-600">
          <Cloud size={16} />
          <span>22°C</span>
        </div>
        <div className="w-px bg-gray-200" />
        <div className="flex items-center gap-1 text-gray-600">
          <TrendingUp size={16} />
          <span>1 KRW = ¥0.0052</span>
        </div>
      </div>
    </div>
  )
}
