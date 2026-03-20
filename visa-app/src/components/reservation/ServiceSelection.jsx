// NEAR 예약 Step 1 — 서비스 선택 (차등가격 + 가격범위 + 성별 필터)
import { useState, useMemo } from 'react'
import { reservationText as T } from '../../data/reservationI18n'
import { MOCK_SERVICES, SERVICE_CATEGORIES, MOCK_STYLISTS, getServicePrice } from '../../data/reservationData'

const GENDER_FILTER = [
  { id: 'all',    label: { ko: '전체', zh: '全部', en: 'All' } },
  { id: 'female', label: { ko: '여성', zh: '女', en: 'Female' } },
  { id: 'male',   label: { ko: '남성', zh: '男', en: 'Male' } },
]

export default function ServiceSelection({ lang, shopId, selected, onSelect, onNext, onBack, selectedStylistId }) {
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [genderFilter, setGenderFilter] = useState('all')
  const [search, setSearch] = useState('')

  const stylists = useMemo(() => MOCK_STYLISTS.filter(s => s.shopId === shopId && s.isActive), [shopId])

  const services = useMemo(() => {
    let list = MOCK_SERVICES.filter(s => s.shopId === shopId)
    if (categoryFilter !== 'all') list = list.filter(s => s.category === categoryFilter)
    if (genderFilter !== 'all') list = list.filter(s => s.gender === 'all' || s.gender === genderFilter)
    if (search) {
      const q = search.toLowerCase()
      list = list.filter(s =>
        s.name.zh.includes(q) || s.name.ko.includes(q) || s.name.en.toLowerCase().includes(q)
      )
    }
    // 스타일리스트가 선택되어 있으면 해당 스타일리스트가 제공하는 서비스만
    if (selectedStylistId) {
      const stylist = stylists.find(s => s.id === selectedStylistId)
      if (stylist) list = list.filter(s => stylist.services.includes(s.id))
    }
    return list.sort((a, b) => (a.sortOrder || 99) - (b.sortOrder || 99))
  }, [shopId, categoryFilter, genderFilter, search, selectedStylistId, stylists])

  const isSelected = (svc) => selected.some(s => (s.id || s.serviceId) === svc.id)

  const toggleService = (svc) => {
    if (isSelected(svc)) {
      onSelect(selected.filter(s => (s.id || s.serviceId) !== svc.id))
    } else {
      // 스타일리스트별 가격 적용
      const price = getServicePrice(svc, selectedStylistId)
      onSelect([...selected, { ...svc, priceKrw: price.priceKrw, priceCny: price.priceCny }])
    }
  }

  const totalKrw = selected.reduce((sum, s) => sum + s.priceKrw, 0)
  const totalCny = selected.reduce((sum, s) => sum + s.priceCny, 0)
  const totalDuration = selected.reduce((sum, s) => sum + s.duration, 0)

  // 해당 매장의 카테고리만 추출
  const availableCategories = useMemo(() => {
    const cats = new Set(MOCK_SERVICES.filter(s => s.shopId === shopId).map(s => s.category))
    return SERVICE_CATEGORIES.filter(c => cats.has(c.id))
  }, [shopId])

  // 성별 필터가 필요한지 (남성/여성 전용 서비스가 있을 때만)
  const hasGenderSpecific = useMemo(() => {
    const shopServices = MOCK_SERVICES.filter(s => s.shopId === shopId)
    return shopServices.some(s => s.gender !== 'all')
  }, [shopId])

  // 가격 표시 헬퍼
  const renderPrice = (svc) => {
    const price = getServicePrice(svc, selectedStylistId)
    const hasRange = svc.priceRange
    const active = isSelected(svc)

    return (
      <div className="text-right">
        {hasRange ? (
          <>
            <p className="text-[14px] font-semibold" style={{ color: active ? '#fff' : '#111' }}>
              ¥{price.priceCny}~
            </p>
            <p className="text-[11px]" style={{ color: active ? '#9CA3AF' : '#999' }}>
              ₩{price.priceKrw.toLocaleString()}~{svc.priceRange.maxKrw.toLocaleString()}
            </p>
          </>
        ) : (
          <>
            <p className="text-[15px] font-semibold" style={{ color: active ? '#fff' : '#111' }}>
              ¥{price.priceCny}
            </p>
            <p className="text-[11px]" style={{ color: active ? '#9CA3AF' : '#999' }}>
              ₩{price.priceKrw.toLocaleString()}
            </p>
          </>
        )}
      </div>
    )
  }

  return (
    <div>
      {/* 검색 */}
      <div className="mb-4">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={T.searchService[lang]}
          className="w-full px-4 py-3 text-[14px] bg-white border-2 border-transparent outline-none input-y2k transition-all"
          style={{ color: 'var(--y2k-text)', borderRadius: '16px' }}
        />
      </div>

      {/* 카테고리 + 성별 필터 */}
      <div className="flex gap-2 mb-3 overflow-x-auto pb-1 scrollbar-hide">
        <button
          onClick={() => setCategoryFilter('all')}
          className="px-4 py-2 rounded-full text-[12px] font-semibold whitespace-nowrap transition-all active:scale-95"
          style={{
            background: categoryFilter === 'all' ? 'var(--gradient-dream)' : 'var(--y2k-surface)',
            color: categoryFilter === 'all' ? 'white' : 'var(--y2k-text-sub)',
            border: categoryFilter === 'all' ? 'none' : '1px solid var(--y2k-border)',
            boxShadow: categoryFilter === 'all' ? '0 4px 16px rgba(255, 133, 179, 0.25)' : 'none',
          }}
        >
          {lang === 'zh' ? '全部' : lang === 'ko' ? '전체' : 'All'}
        </button>
        {availableCategories.map(cat => (
          <button
            key={cat.id}
            onClick={() => setCategoryFilter(cat.id)}
            className="px-4 py-2 rounded-full text-[12px] font-semibold whitespace-nowrap transition-all active:scale-95"
            style={{
              background: categoryFilter === cat.id ? 'var(--gradient-dream)' : 'var(--y2k-surface)',
              color: categoryFilter === cat.id ? 'white' : 'var(--y2k-text-sub)',
              border: categoryFilter === cat.id ? 'none' : '1px solid var(--y2k-border)',
              boxShadow: categoryFilter === cat.id ? '0 4px 16px rgba(255, 133, 179, 0.25)' : 'none',
            }}
          >
            {cat.icon} {cat.label[lang]}
          </button>
        ))}
      </div>

      {/* 성별 필터 (남/여 전용 서비스 있을 때만) */}
      {hasGenderSpecific && (
        <div className="flex gap-2 mb-4">
          {GENDER_FILTER.map(g => (
            <button
              key={g.id}
              onClick={() => setGenderFilter(g.id)}
              className="px-3 py-1 rounded-full text-[11px] font-medium transition-all"
              style={{
                backgroundColor: genderFilter === g.id ? '#374151' : '#F3F4F6',
                color: genderFilter === g.id ? '#fff' : '#6B7280',
              }}
            >
              {g.label[lang]}
            </button>
          ))}
        </div>
      )}

      {/* 스타일리스트별 가격 안내 */}
      {selectedStylistId && (
        <div className="bg-blue-50 rounded-xl px-3 py-2 mb-4">
          <p className="text-[11px]" style={{ color: '#1D4ED8' }}>
            {(() => {
              const st = stylists.find(s => s.id === selectedStylistId)
              if (!st) return ''
              return lang === 'zh'
                ? `${st.nameEn || st.name} ${st.role?.zh || ''} — 专属价格`
                : lang === 'ko'
                ? `${st.name} ${st.role?.ko || ''} — 전용 가격 적용`
                : `${st.nameEn || st.name} ${st.role?.en || ''} — Special pricing`
            })()}
          </p>
        </div>
      )}

      {/* 서비스 목록 */}
      <div className="space-y-2 mb-6">
        {services.map(svc => {
          const active = isSelected(svc)
          return (
            <button
              key={svc.id}
              onClick={() => toggleService(svc)}
              className="w-full text-left p-4 card-y2k transition-all active:scale-[0.98]"
              style={{
                background: active ? 'var(--gradient-dream)' : 'var(--y2k-surface)',
                border: active ? '2px solid transparent' : '2px solid var(--y2k-border)',
                borderRadius: '20px',
                boxShadow: active ? '0 8px 30px rgba(255, 133, 179, 0.2)' : '0 2px 8px rgba(255, 133, 179, 0.08)',
                transform: active ? 'scale(1.02)' : 'scale(1)',
              }}
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[15px] font-medium" style={{ color: active ? '#fff' : '#111' }}>
                      {svc.name[lang]}
                    </span>
                    {svc.popular && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded-full"
                        style={{ backgroundColor: active ? '#374151' : '#FEF3C7', color: active ? '#FCD34D' : '#92400E' }}>
                        {T.popular[lang]}
                      </span>
                    )}
                    {svc.gender !== 'all' && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded-full"
                        style={{ backgroundColor: active ? '#374151' : '#EDE9FE', color: active ? '#C4B5FD' : '#6D28D9' }}>
                        {svc.gender === 'female'
                          ? (lang === 'zh' ? '女' : lang === 'ko' ? '여성' : 'F')
                          : (lang === 'zh' ? '男' : lang === 'ko' ? '남성' : 'M')
                        }
                      </span>
                    )}
                  </div>
                  {svc.description && (
                    <p className="text-[11px] mt-0.5" style={{ color: active ? '#9CA3AF' : '#999' }}>
                      {svc.description[lang]}
                    </p>
                  )}
                  {lang !== 'ko' && (
                    <p className="text-[12px] mt-0.5" style={{ color: active ? '#9CA3AF' : '#999' }}>
                      {svc.name.ko}
                    </p>
                  )}
                  <p className="text-[11px] mt-1" style={{ color: active ? '#9CA3AF' : '#999' }}>
                    {svc.duration}{T.minutes[lang]}
                  </p>
                </div>
                {renderPrice(svc)}
              </div>
              {active && (
                <div className="flex justify-end mt-1">
                  <span className="text-[11px]" style={{ color: '#22C55E' }}>✓ {T.selected[lang]}</span>
                </div>
              )}
            </button>
          )
        })}

        {services.length === 0 && (
          <p className="text-center py-8 text-[13px]" style={{ color: '#999' }}>
            {lang === 'zh' ? '没有符合条件的服务' : lang === 'ko' ? '조건에 맞는 서비스가 없습니다' : 'No matching services'}
          </p>
        )}
      </div>

      {/* 하단 고정 — 합계 + 다음 */}
      {selected.length > 0 && (
        <div className="sticky bottom-20 card-glass rounded-2xl p-4" style={{ backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', border: '1px solid var(--glass-border)', boxShadow: 'var(--glass-shadow)' }}>
          <div className="flex justify-between items-center mb-3">
            <div>
              <p className="text-[11px] typo-caption">
                {selected.length}{lang === 'zh' ? '项服务' : lang === 'ko' ? '개 서비스' : ' services'} · {totalDuration}{T.minutes[lang]}
              </p>
              <p className="text-[17px] font-bold typo-title">
                ¥{totalCny} <span className="text-[12px] font-normal typo-caption">/ ₩{totalKrw.toLocaleString()}</span>
              </p>
            </div>
            <button
              onClick={onNext}
              className="btn-y2k-primary px-6 py-2.5 rounded-full text-[14px] font-semibold text-white transition-all active:scale-[0.95]"
              style={{ background: 'var(--gradient-dream)', boxShadow: '0 4px 16px rgba(255, 133, 179, 0.3)' }}
            >
              {T.next[lang]}
            </button>
          </div>
        </div>
      )}

      {/* 뒤로 */}
      <button onClick={onBack} className="text-[13px] mt-2" style={{ color: '#999' }}>
        ← {T.back[lang]}
      </button>
    </div>
  )
}
