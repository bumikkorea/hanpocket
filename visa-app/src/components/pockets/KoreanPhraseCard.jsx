import { useState, useEffect, useCallback } from 'react'
import { Bookmark, Volume2, Copy } from 'lucide-react'

const L = (lang, text) => text[lang] || text['ko']

// ─── CSS Illustrations (29CM minimal line drawing) ───

function RestaurantIllustration() {
  return (
    <svg viewBox="0 0 200 100" fill="none" stroke="#111827" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full">
      {/* Rice bowl */}
      <ellipse cx="100" cy="62" rx="32" ry="10" />
      <path d="M68 62 C68 82, 132 82, 132 62" />
      <path d="M78 56 C82 48, 90 44, 100 44 C110 44, 118 48, 122 56" />
      {/* Steam */}
      <path d="M88 40 C86 34, 90 30, 88 24" opacity="0.4">
        <animate attributeName="d" values="M88 40 C86 34, 90 30, 88 24;M88 40 C90 34, 86 30, 88 24;M88 40 C86 34, 90 30, 88 24" dur="2s" repeatCount="indefinite" />
      </path>
      <path d="M100 38 C98 32, 102 28, 100 22" opacity="0.3">
        <animate attributeName="d" values="M100 38 C98 32, 102 28, 100 22;M100 38 C102 32, 98 28, 100 22;M100 38 C98 32, 102 28, 100 22" dur="2.5s" repeatCount="indefinite" />
      </path>
      <path d="M112 40 C110 34, 114 30, 112 24" opacity="0.4">
        <animate attributeName="d" values="M112 40 C110 34, 114 30, 112 24;M112 40 C114 34, 110 30, 112 24;M112 40 C110 34, 114 30, 112 24" dur="2.2s" repeatCount="indefinite" />
      </path>
      {/* Chopsticks */}
      <line x1="140" y1="20" x2="120" y2="58" />
      <line x1="148" y1="20" x2="126" y2="58" />
    </svg>
  )
}

function CafeIllustration() {
  return (
    <svg viewBox="0 0 200 100" fill="none" stroke="#111827" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full">
      {/* Cup body */}
      <path d="M70 45 L75 80 C75 85, 125 85, 125 80 L130 45" />
      {/* Cup top */}
      <ellipse cx="100" cy="45" rx="30" ry="6" />
      {/* Handle */}
      <path d="M130 52 C145 52, 145 70, 130 70" />
      {/* Saucer */}
      <ellipse cx="100" cy="85" rx="38" ry="5" />
      {/* Steam - animated */}
      <path d="M88 36 C86 28, 90 22, 88 14" opacity="0.4">
        <animate attributeName="opacity" values="0.4;0.15;0.4" dur="3s" repeatCount="indefinite" />
        <animate attributeName="d" values="M88 36 C86 28, 90 22, 88 14;M88 36 C90 28, 86 22, 88 14;M88 36 C86 28, 90 22, 88 14" dur="2.5s" repeatCount="indefinite" />
      </path>
      <path d="M100 34 C98 26, 102 20, 100 12" opacity="0.3">
        <animate attributeName="opacity" values="0.3;0.1;0.3" dur="3.5s" repeatCount="indefinite" />
        <animate attributeName="d" values="M100 34 C98 26, 102 20, 100 12;M100 34 C102 26, 98 20, 100 12;M100 34 C98 26, 102 20, 100 12" dur="3s" repeatCount="indefinite" />
      </path>
      <path d="M112 36 C110 28, 114 22, 112 14" opacity="0.35">
        <animate attributeName="opacity" values="0.35;0.1;0.35" dur="2.8s" repeatCount="indefinite" />
        <animate attributeName="d" values="M112 36 C110 28, 114 22, 112 14;M112 36 C114 28, 110 22, 112 14;M112 36 C110 28, 114 22, 112 14" dur="2.2s" repeatCount="indefinite" />
      </path>
    </svg>
  )
}

function TransportIllustration() {
  return (
    <svg viewBox="0 0 200 100" fill="none" stroke="#111827" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full">
      {/* Subway car body */}
      <rect x="50" y="30" width="100" height="40" rx="10" />
      {/* Windows */}
      <rect x="62" y="38" width="18" height="14" rx="2" />
      <rect x="91" y="38" width="18" height="14" rx="2" />
      <rect x="120" y="38" width="18" height="14" rx="2" />
      {/* Door */}
      <line x1="85" y1="34" x2="85" y2="66" opacity="0.5" />
      <line x1="115" y1="34" x2="115" y2="66" opacity="0.5" />
      {/* Wheels */}
      <circle cx="72" cy="74" r="4" />
      <circle cx="128" cy="74" r="4" />
      {/* Rail */}
      <line x1="20" y1="78" x2="180" y2="78" />
      {/* Moving dots on rail */}
      <circle cx="30" cy="78" r="1.5" fill="#111827" opacity="0.3">
        <animate attributeName="cx" values="20;180" dur="2s" repeatCount="indefinite" />
        <animate attributeName="opacity" values="0.3;0;0.3" dur="2s" repeatCount="indefinite" />
      </circle>
      <circle cx="60" cy="78" r="1.5" fill="#111827" opacity="0.2">
        <animate attributeName="cx" values="20;180" dur="2s" begin="0.5s" repeatCount="indefinite" />
        <animate attributeName="opacity" values="0.2;0;0.2" dur="2s" begin="0.5s" repeatCount="indefinite" />
      </circle>
      <circle cx="90" cy="78" r="1.5" fill="#111827" opacity="0.25">
        <animate attributeName="cx" values="20;180" dur="2s" begin="1s" repeatCount="indefinite" />
        <animate attributeName="opacity" values="0.25;0;0.25" dur="2s" begin="1s" repeatCount="indefinite" />
      </circle>
    </svg>
  )
}

function ConvenienceIllustration() {
  return (
    <svg viewBox="0 0 200 100" fill="none" stroke="#111827" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full">
      {/* Triangle kimbap (samgak) */}
      <polygon points="80,25 60,70 100,70" />
      <line x1="80" y1="45" x2="80" y2="65" opacity="0.3" />
      {/* Nori wrap band */}
      <path d="M67 58 L93 58" strokeWidth="4" opacity="0.15" />
      {/* Drink can */}
      <rect x="115" y="30" width="24" height="42" rx="4" />
      <ellipse cx="127" cy="30" rx="12" ry="3" />
      <ellipse cx="127" cy="72" rx="12" ry="3" />
      {/* Tab on can */}
      <ellipse cx="127" cy="34" rx="5" ry="2" opacity="0.4" />
      {/* Straw */}
      <line x1="132" y1="18" x2="132" y2="34" />
      <path d="M132 18 C132 14, 136 14, 136 18" />
    </svg>
  )
}

function AccommodationIllustration() {
  return (
    <svg viewBox="0 0 200 100" fill="none" stroke="#111827" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full">
      {/* Bed frame */}
      <rect x="40" y="50" width="100" height="25" rx="3" />
      {/* Mattress/blanket */}
      <path d="M42 50 C42 42, 138 42, 138 50" />
      {/* Pillow */}
      <ellipse cx="60" cy="46" rx="14" ry="6" />
      {/* Headboard */}
      <rect x="40" y="30" width="6" height="45" rx="2" />
      {/* Legs */}
      <line x1="46" y1="75" x2="46" y2="82" />
      <line x1="134" y1="75" x2="134" y2="82" />
      {/* Key */}
      <circle cx="160" cy="40" r="8" />
      <circle cx="160" cy="40" r="3" />
      <line x1="160" y1="48" x2="160" y2="68" />
      <line x1="160" y1="58" x2="166" y2="58" />
      <line x1="160" y1="64" x2="168" y2="64" />
    </svg>
  )
}

function EmergencyIllustration() {
  return (
    <svg viewBox="0 0 200 100" fill="none" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full">
      {/* Red cross */}
      <g stroke="#DC2626">
        <rect x="88" y="20" width="24" height="60" rx="2">
          <animate attributeName="opacity" values="1;0.4;1" dur="2s" repeatCount="indefinite" />
        </rect>
        <rect x="70" y="38" width="60" height="24" rx="2">
          <animate attributeName="opacity" values="1;0.4;1" dur="2s" repeatCount="indefinite" />
        </rect>
      </g>
      {/* Pulse line */}
      <polyline points="20,80 50,80 60,60 70,90 80,70 90,80 180,80" stroke="#DC2626" opacity="0.4" fill="none">
        <animate attributeName="stroke-dashoffset" values="200;0" dur="3s" repeatCount="indefinite" />
      </polyline>
    </svg>
  )
}

export const ILLUSTRATIONS = {
  restaurant: <RestaurantIllustration />,
  cafe: <CafeIllustration />,
  transport: <TransportIllustration />,
  convenience: <ConvenienceIllustration />,
  accommodation: <AccommodationIllustration />,
  emergency: <EmergencyIllustration />,
}

// ─── Korean Phrase Card Component ───

export default function KoreanPhraseCard({
  korean,
  romanization,
  chinese,
  exampleKo,
  exampleZh,
  exampleRoman,
  illustration,
  onCopy,
  onSpeak,
  onBookmark,
  bookmarked,
  lang = 'zh',
}) {
  const illustrationNode = typeof illustration === 'string'
    ? ILLUSTRATIONS[illustration]
    : illustration

  return (
    <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 relative">
      {/* H) Bookmark icon — top right */}
      <button
        onClick={onBookmark}
        className="absolute top-3 right-3 z-10 p-1.5 rounded-full bg-white/80 backdrop-blur-sm"
      >
        <Bookmark
          size={18}
          className={bookmarked ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}
        />
      </button>

      {/* A) CSS Illustration */}
      <div className="bg-gray-50 rounded-t-2xl h-[120px] flex items-center justify-center px-8">
        {illustrationNode}
      </div>

      <div className="p-4">
        {/* B) Korean expression */}
        <p className="text-xl font-bold text-[#111827]">{korean}</p>

        {/* C) Romanization + Chinese */}
        <p className="text-sm text-gray-500 mt-1">
          [{romanization}] {chinese}
        </p>

        {/* D) Example Korean */}
        {exampleKo && (
          <p className="text-base text-[#111827] mt-3">&ldquo;{exampleKo}&rdquo;</p>
        )}

        {/* E) Example Chinese */}
        {exampleZh && (
          <p className="text-sm text-gray-400 mt-0.5">&ldquo;{exampleZh}&rdquo;</p>
        )}

        {/* F) Example romanization */}
        {exampleRoman && (
          <p className="text-xs text-gray-300 italic mt-0.5">{exampleRoman}</p>
        )}

        {/* G) Action buttons */}
        <div className="flex gap-2 mt-4">
          <button
            onClick={onCopy}
            className="flex-1 bg-gray-100 rounded-xl p-3 flex items-center justify-center gap-2 text-sm font-medium text-[#111827] active:scale-[0.97] transition-transform"
          >
            <Copy size={14} />
            {L(lang, { ko: '복사', zh: '复制', en: 'Copy' })}
          </button>
          <button
            onClick={onSpeak}
            className="bg-blue-50 rounded-xl p-3 flex items-center justify-center active:scale-[0.97] transition-transform"
          >
            <Volume2 size={18} className="text-blue-600" />
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Shared Utilities ───

export function useKoreanPocket(storageKey) {
  const [bookmarkedCards, setBookmarkedCards] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(storageKey)) || []
    } catch {
      return []
    }
  })
  const [toastMessage, setToastMessage] = useState('')

  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify(bookmarkedCards))
  }, [bookmarkedCards, storageKey])

  const showToast = useCallback((message) => {
    setToastMessage(message)
    setTimeout(() => setToastMessage(''), 2000)
  }, [])

  const copyToClipboard = useCallback((text, lang = 'zh') => {
    navigator.clipboard.writeText(text).then(() => {
      showToast(L(lang, { ko: '복사됨!', zh: '已复制!', en: 'Copied!' }))
    })
  }, [showToast])

  const speak = useCallback((text) => {
    try {
      if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(text)
        utterance.lang = 'ko-KR'
        utterance.rate = 0.75
        speechSynthesis.speak(utterance)
      }
    } catch {
      // silently fail
    }
  }, [])

  const toggleBookmark = useCallback((cardId) => {
    setBookmarkedCards(prev =>
      prev.includes(cardId)
        ? prev.filter(id => id !== cardId)
        : [...prev, cardId]
    )
  }, [])

  return { bookmarkedCards, toastMessage, showToast, copyToClipboard, speak, toggleBookmark }
}
