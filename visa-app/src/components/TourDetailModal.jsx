import { useState, useEffect } from 'react'
import { X, MapPin, Clock, Phone, DollarSign, ChevronLeft, ChevronRight, Share2, Heart, ExternalLink, Navigation, Star, Loader2 } from 'lucide-react'
import { useTourDetail } from '../hooks/useTourApi'
import { CONTENT_TYPES } from '../data/tourApiCodes'

function L(lang, d) { if (typeof d === 'string') return d; return d?.[lang] || d?.en || d?.zh || d?.ko || '' }

/**
 * TourAPI 관광지 상세 모달
 */
export default function TourDetailModal({ item, lang = 'zh', darkMode, onClose }) {
  if (!item) return null

  const { data, loading } = useTourDetail(item.contentid, item.contenttypeid)
  const [imgIdx, setImgIdx] = useState(0)
  const [liked, setLiked] = useState(false)

  const common = data?.common || {}
  const intro = data?.intro || {}
  const images = data?.images || []
  const allImages = images.length > 0
    ? images.map(i => i.originimgurl)
    : item.firstimage ? [item.firstimage] : []

  const typeLabel = CONTENT_TYPES[item.contenttypeid]
  const typeName = typeLabel ? L(lang, typeLabel) : ''

  // Type-specific fields
  const getIntroFields = () => {
    const tid = String(item.contenttypeid)
    const fields = []
    
    const add = (icon, label, value) => {
      if (value && value !== '' && value !== 'null') fields.push({ icon, label, value })
    }

    if (tid === '76') { // 관광지
      add('Clock', L(lang, { ko: '이용시간', zh: '开放时间', en: 'Hours' }), intro.usetime)
      add('X', L(lang, { ko: '쉬는날', zh: '休息日', en: 'Closed' }), intro.restdate)
      add('Phone', L(lang, { ko: '문의', zh: '咨询', en: 'Contact' }), intro.infocenter)
      add('DollarSign', L(lang, { ko: '주차', zh: '停车', en: 'Parking' }), intro.parking)
      add('Star', L(lang, { ko: '체험안내', zh: '体验指南', en: 'Experience' }), intro.expguide)
    } else if (tid === '78') { // 문화시설
      add('Clock', L(lang, { ko: '이용시간', zh: '开放时间', en: 'Hours' }), intro.usetimeculture)
      add('X', L(lang, { ko: '쉬는날', zh: '休息日', en: 'Closed' }), intro.restdateculture)
      add('DollarSign', L(lang, { ko: '이용요금', zh: '费用', en: 'Fee' }), intro.usefee)
      add('Clock', L(lang, { ko: '소요시간', zh: '所需时间', en: 'Duration' }), intro.spendtime)
    } else if (tid === '85') { // 행사/축제
      add('Clock', L(lang, { ko: '기간', zh: '期间', en: 'Period' }),
        intro.eventstartdate && intro.eventenddate ? `${intro.eventstartdate} ~ ${intro.eventenddate}` : '')
      add('MapPin', L(lang, { ko: '장소', zh: '地点', en: 'Venue' }), intro.eventplace)
      add('DollarSign', L(lang, { ko: '이용요금', zh: '费用', en: 'Fee' }), intro.usetimefestival)
      add('Star', L(lang, { ko: '프로그램', zh: '节目', en: 'Program' }), intro.program)
    } else if (tid === '80') { // 숙박
      add('Clock', L(lang, { ko: '체크인', zh: '入住', en: 'Check-in' }), intro.checkintime)
      add('Clock', L(lang, { ko: '체크아웃', zh: '退房', en: 'Check-out' }), intro.checkouttime)
      add('Star', L(lang, { ko: '객실수', zh: '客房数', en: 'Rooms' }), intro.roomcount)
      add('ExternalLink', L(lang, { ko: '예약', zh: '预约', en: 'Reservation' }), intro.reservationurl)
      add('Star', L(lang, { ko: '부대시설', zh: '附属设施', en: 'Facilities' }), intro.subfacility)
    } else if (tid === '82') { // 음식점
      add('Star', L(lang, { ko: '대표메뉴', zh: '招牌菜', en: 'Signature' }), intro.firstmenu)
      add('Clock', L(lang, { ko: '영업시간', zh: '营业时间', en: 'Hours' }), intro.opentimefood)
      add('X', L(lang, { ko: '쉬는날', zh: '休息日', en: 'Closed' }), intro.restdatefood)
      add('Star', L(lang, { ko: '메뉴', zh: '菜单', en: 'Menu' }), intro.treatmenu)
      add('Star', L(lang, { ko: '좌석수', zh: '座位数', en: 'Seats' }), intro.seat)
    } else if (tid === '79') { // 쇼핑
      add('Clock', L(lang, { ko: '영업시간', zh: '营业时间', en: 'Hours' }), intro.opentime)
      add('X', L(lang, { ko: '쉬는날', zh: '休息日', en: 'Closed' }), intro.restdateshopping)
      add('Star', L(lang, { ko: '판매품목', zh: '商品', en: 'Products' }), intro.saleitem)
      add('Star', L(lang, { ko: '매장안내', zh: '商场指南', en: 'Guide' }), intro.shopguide)
    } else if (tid === '75') { // 레포츠
      add('Clock', L(lang, { ko: '이용시간', zh: '开放时间', en: 'Hours' }), intro.usetimeleports)
      add('X', L(lang, { ko: '쉬는날', zh: '休息日', en: 'Closed' }), intro.restdateleports)
      add('DollarSign', L(lang, { ko: '이용요금', zh: '费用', en: 'Fee' }), intro.usefeeleports)
      add('Star', L(lang, { ko: '예약', zh: '预约', en: 'Reservation' }), intro.reservation)
    }
    return fields
  }

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: item.title,
        text: common.overview?.replace(/<[^>]*>/g, '').slice(0, 100),
        url: common.homepage || window.location.href,
      }).catch(() => {})
    }
  }

  const handleNavigate = () => {
    const lat = item.mapy || common.mapy
    const lng = item.mapx || common.mapx
    if (lat && lng) {
      window.open(`https://map.kakao.com/link/to/${encodeURIComponent(item.title)},${lat},${lng}`, '_blank')
    }
  }

  return (
    <div className="fixed inset-0 z-[9999] flex items-end sm:items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      
      {/* Modal */}
      <div className={`relative w-full sm:max-w-lg max-h-[90vh] overflow-y-auto rounded-t-2xl sm:rounded-2xl ${
        darkMode ? 'bg-zinc-900 text-white' : 'bg-white text-gray-900'
      }`}>
        {/* Header / Image */}
        <div className="relative">
          {allImages.length > 0 ? (
            <div className="relative h-64 sm:h-72">
              <img
                src={allImages[imgIdx]}
                alt={item.title}
                className="w-full h-full object-cover rounded-t-2xl"
                onError={(e) => { e.target.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300"><rect fill="%23eee" width="400" height="300"/><text x="50%" y="50%" text-anchor="middle" fill="%23999" font-size="16">No Image</text></svg>' }}
              />
              {allImages.length > 1 && (
                <>
                  <button
                    onClick={() => setImgIdx(i => (i - 1 + allImages.length) % allImages.length)}
                    className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/40 text-white rounded-full p-1.5"
                  >
                    <ChevronLeft size={20} />
                  </button>
                  <button
                    onClick={() => setImgIdx(i => (i + 1) % allImages.length)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/40 text-white rounded-full p-1.5"
                  >
                    <ChevronRight size={20} />
                  </button>
                  <div className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-black/50 text-white text-xs px-2 py-0.5 rounded-full">
                    {imgIdx + 1} / {allImages.length}
                  </div>
                </>
              )}
            </div>
          ) : (
            <div className={`h-32 rounded-t-2xl ${darkMode ? 'bg-zinc-800' : 'bg-gray-100'} flex items-center justify-center`}>
              <MapPin size={32} className="text-gray-400" />
            </div>
          )}

          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-3 right-3 bg-black/40 text-white rounded-full p-1.5 hover:bg-black/60"
          >
            <X size={20} />
          </button>

          {/* Type badge */}
          {typeName && (
            <div className="absolute top-3 left-3 bg-black/50 text-white text-xs px-2 py-1 rounded-full">
              {typeName}
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-4 space-y-4">
          {/* Title + Actions */}
          <div className="flex items-start justify-between gap-2">
            <h2 className="text-xl font-bold leading-tight">{item.title}</h2>
            <div className="flex gap-2 shrink-0">
              <button onClick={() => setLiked(!liked)} className="p-1.5">
                <Heart size={20} className={liked ? 'fill-red-500 text-red-500' : ''} />
              </button>
              <button onClick={handleShare} className="p-1.5">
                <Share2 size={20} />
              </button>
            </div>
          </div>

          {/* Address */}
          {(item.addr1 || common.addr1) && (
            <div className="flex items-start gap-2 text-sm opacity-70">
              <MapPin size={14} className="mt-0.5 shrink-0" />
              <span>{item.addr1 || common.addr1} {item.addr2 || common.addr2 || ''}</span>
            </div>
          )}

          {/* Distance */}
          {item.dist && (
            <div className="flex items-center gap-1 text-sm text-blue-500">
              <Navigation size={14} />
              <span>{Number(item.dist) < 1000 ? `${Math.round(item.dist)}m` : `${(item.dist / 1000).toFixed(1)}km`}</span>
            </div>
          )}

          {/* Navigate button */}
          {(item.mapx || common.mapx) && (
            <button
              onClick={handleNavigate}
              className="w-full py-2.5 rounded-xl bg-blue-500 text-white font-medium text-sm flex items-center justify-center gap-2"
            >
              <Navigation size={16} />
              {L(lang, { ko: '길찾기', zh: '导航', en: 'Navigate' })}
            </button>
          )}

          {/* Loading */}
          {loading && (
            <div className="flex items-center justify-center py-4">
              <Loader2 size={24} className="animate-spin text-blue-500" />
            </div>
          )}

          {/* Intro fields */}
          {!loading && data && (
            <div className="space-y-2">
              {getIntroFields().map((f, i) => (
                <div key={i} className={`flex items-start gap-3 text-sm p-2.5 rounded-lg ${
                  darkMode ? 'bg-zinc-800' : 'bg-gray-50'
                }`}>
                  <span className="font-medium shrink-0 min-w-[60px] opacity-60">{f.label}</span>
                  <span dangerouslySetInnerHTML={{ __html: f.value }} />
                </div>
              ))}
            </div>
          )}

          {/* Overview */}
          {common.overview && (
            <div className={`text-sm leading-relaxed p-3 rounded-lg ${
              darkMode ? 'bg-zinc-800' : 'bg-gray-50'
            }`}>
              <div dangerouslySetInnerHTML={{ __html: common.overview }} />
            </div>
          )}

          {/* Tel */}
          {(item.tel || common.tel) && (
            <a
              href={`tel:${(item.tel || common.tel).replace(/[^0-9+]/g, '')}`}
              className="flex items-center gap-2 text-sm text-blue-500"
            >
              <Phone size={14} />
              {item.tel || common.tel}
            </a>
          )}

          {/* Homepage */}
          {common.homepage && (
            <div className="text-sm">
              <span dangerouslySetInnerHTML={{ __html: common.homepage }} />
            </div>
          )}

          {/* Image gallery thumbnails */}
          {allImages.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-2">
              {allImages.map((url, i) => (
                <img
                  key={i}
                  src={url}
                  alt={`${i + 1}`}
                  onClick={() => setImgIdx(i)}
                  className={`h-16 w-16 rounded-lg object-cover cursor-pointer shrink-0 border-2 ${
                    i === imgIdx ? 'border-blue-500' : 'border-transparent'
                  }`}
                />
              ))}
            </div>
          )}
        </div>

        {/* Bottom safe area */}
        <div className="h-6" />
      </div>
    </div>
  )
}
