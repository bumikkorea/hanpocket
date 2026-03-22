import { useState, useEffect, useRef } from 'react'
import { ChevronLeft, Share2, Phone, Navigation2, Ticket, Bookmark, Share } from 'lucide-react'
import { kakaoDirectionLink, getDirectionLinks } from '../utils/travelTime'
import { getLocalizedName } from '../utils/localize.js'

function L(lang, d) {
  if (typeof d === 'string') return d
  return d?.[lang] || d?.en || d?.zh || d?.ko || ''
}

const CATEGORY_EMOJI = {
  shopping: '🛍',
  restaurant: '🍽',
  hospital: '🏥',
  attraction: '🎭',
  transport: '✈️',
  accommodation: '🏨',
  convenience: '🏪',
}

const CATEGORY_LABEL = {
  shopping: { ko: '쇼핑', zh: '购物', en: 'Shopping' },
  restaurant: { ko: '맛집', zh: '餐厅', en: 'Restaurant' },
  hospital: { ko: '병원', zh: '医院', en: 'Hospital' },
  attraction: { ko: '관광지', zh: '景点', en: 'Attraction' },
  transport: { ko: '교통', zh: '交通', en: 'Transport' },
  accommodation: { ko: '숙소', zh: '住宿', en: 'Accommodation' },
  convenience: { ko: '편의점', zh: '便利店', en: 'Convenience' },
}

export default function PlaceDetail({ place, onBack, onAddStop, onSetDestination, isStart = false, lang = 'zh' }) {
  const mapRef = useRef(null)

  const links = place?.lat ? getDirectionLinks({ lat: place.lat, lng: place.lng, name: place.name || place.ko }, { lat: place.lat, lng: place.lng, name: place.name || place.ko }) : {}
  const dirLinks = [
    { label: L(lang, { ko: '카카오맵', zh: '카카오地图', en: 'KakaoMap' }), url: links.kakao, color: '#FEE500', textColor: '#000' },
    { label: L(lang, { ko: '구글맵', zh: '谷歌地图', en: 'Google Maps' }), url: links.google, color: '#4285F4', textColor: '#fff' },
    { label: L(lang, { ko: '바이두맵', zh: '百度地图', en: 'Baidu Maps' }), url: links.baidu, color: '#3385FF', textColor: '#fff' },
    { label: L(lang, { ko: '가오더맵', zh: '高德地图', en: 'Amap' }), url: links.amap, color: '#2B6BFF', textColor: '#fff' },
  ].filter(l => l.url)

  useEffect(() => {
    if (!place?.lat || !mapRef.current) return
    const loadMap = () => {
      if (!window.kakao?.maps) return
      window.kakao.maps.load(() => {
        const pos = new window.kakao.maps.LatLng(place.lat, place.lng)
        const map = new window.kakao.maps.Map(mapRef.current, {
          center: pos,
          level: 3,
        })
        new window.kakao.maps.Marker({ position: pos, map })

        // 외국어 사용자를 위해 장소명 오버레이 표시
        if (lang !== 'ko') {
          const overlay = new window.kakao.maps.CustomOverlay({
            position: pos,
            content: `<div style="background:#111;color:#fff;padding:4px 10px;border-radius:6px;font-size:12px;font-weight:600;font-family:Inter,sans-serif;transform:translateY(-42px);white-space:nowrap">${L(lang, place)}</div>`,
            yAnchor: 1,
          })
          overlay.setMap(map)
        }
      })
    }
    if (window.kakao?.maps) {
      loadMap()
    } else {
      const script = document.createElement('script')
      script.src = `//dapi.kakao.com/v2/maps/sdk.js?appkey=5e0e466ca30c0807b0c563f1d35f43a8&autoload=false`
      script.onload = loadMap
      document.head.appendChild(script)
    }
  }, [place])

  if (!place || !place.category) return null

  const handleCall = () => {
    if (place.phone) window.location.href = `tel:${place.phone.replace(/[^0-9+]/g, '')}`
  }

  const handleNav = () => {
    const link = kakaoDirectionLink({ lat: 37.5547, lng: 126.9707, name: '현재위치' }, { ...place, name: place.ko })
    if (link) window.open(link, '_blank')
  }

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({ title: L(lang, place), text: L(lang, place), url: window.location.href })
    }
  }

  const handleSave = () => {
    const saved = JSON.parse(localStorage.getItem('hp_saved_places') || '[]')
    if (!saved.find(p => p.lat === place.lat && p.lng === place.lng)) {
      saved.push({ ko: place.ko, zh: place.zh, en: place.en, lat: place.lat, lng: place.lng })
      localStorage.setItem('hp_saved_places', JSON.stringify(saved))
      alert(L(lang, { ko: '저장되었습니다', zh: '已收藏', en: 'Saved' }))
    }
  }

  return (
    <div style={{
      maxWidth: 480,
      width: '100%',
      background: '#fff',
      minHeight: '100vh',
      margin: '0 auto',
      fontFamily: 'Inter, -apple-system, sans-serif',
      color: '#111',
    }}>
      {/* Header */}
      <div style={{
        position: 'sticky',
        top: 0,
        background: '#fff',
        zIndex: 10,
        padding: '16px 20px',
        borderBottom: '1px solid #eee',
        display: 'flex',
        alignItems: 'center',
        gap: 12,
      }}>
        <ChevronLeft size={20} onClick={onBack} style={{ cursor: 'pointer' }} />
        <span style={{ fontSize: 17, fontWeight: 600, flex: 1 }}>
          {L(lang, { ko: '장소 상세', zh: '场所详情', en: 'Place Detail' })}
        </span>
        <Share2 size={18} onClick={handleShare} style={{ cursor: 'pointer' }} />
      </div>

      {/* Mini Map */}
      <div style={{
        width: '100%',
        height: 180,
        background: 'linear-gradient(135deg, #ddd 0%, #ccc 100%)',
        position: 'relative',
        overflow: 'hidden',
      }}>
        <div ref={mapRef} style={{ width: '100%', height: '100%' }} />
        {place.nearest_station_zh && (
          <span style={{
            position: 'absolute',
            bottom: 8,
            right: 8,
            background: 'rgba(0,0,0,0.6)',
            color: '#fff',
            padding: '3px 8px',
            borderRadius: 4,
            fontSize: 11,
          }}>{place.nearest_station_zh}</span>
        )}
      </div>

      {/* Main Info */}
      <div style={{ padding: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 2 }}>
          <div style={{ fontSize: 22, fontWeight: 700, flex: 1 }}>{L(lang, place)}</div>
          {onAddStop && (
            <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
              <button onClick={() => onAddStop({ name: place.ko, lat: place.lat, lng: place.lng, address: place.address_ko })} style={{
                background: '#111',
                color: '#fff',
                border: 'none',
                padding: '8px 12px',
                borderRadius: 6,
                fontSize: 12,
                fontWeight: 600,
                cursor: 'pointer',
                whiteSpace: 'nowrap',
              }}>
                {isStart
                  ? L(lang, { ko: '출발지 설정', zh: '设为出发地', en: 'Set as Start' })
                  : L(lang, { ko: '+ 경유지', zh: '+ 途经', en: '+ Stop' })}
              </button>
              {!isStart && onSetDestination && (
                <button onClick={() => onSetDestination({ name: place.ko, lat: place.lat, lng: place.lng, address: place.address_ko })} style={{
                  background: '#fee500',
                  color: '#111',
                  border: 'none',
                  padding: '8px 12px',
                  borderRadius: 6,
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                }}>
                  {L(lang, { ko: '도착지', zh: '目的地', en: 'Go here' })}
                </button>
              )}
            </div>
          )}
        </div>
        {/* Map direction links */}
        <div style={{ display: 'flex', gap: 6, marginTop: 8 }}>
          {dirLinks.map((link, i) => (
            <button key={i} onClick={() => window.open(link.url, '_blank')} style={{
              flex: 1,
              background: link.color,
              color: link.textColor,
              border: 'none',
              padding: '10px 0',
              borderRadius: 6,
              fontSize: 12,
              fontWeight: 700,
              cursor: 'pointer',
            }}>
              {link.label}
            </button>
          ))}
        </div>
        {(place.ko !== L(lang, place)) && (
          <div style={{ fontSize: 13, color: '#888', marginBottom: 12 }}>
            {place.ko} · {place.en}
          </div>
        )}
        <span style={{
          display: 'inline-block',
          background: '#111',
          color: '#fff',
          padding: '3px 10px',
          borderRadius: 6,
          fontSize: 12,
          fontWeight: 500,
          marginRight: 6,
        }}>
          {CATEGORY_EMOJI[place.category]} {L(lang, CATEGORY_LABEL[place.category])}
        </span>
        {place.badges_zh && place.badges_zh.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 10 }}>
            {place.badges_zh.map((badge, i) => (
              <span key={i} style={{
                background: badge.includes('免税') || badge.includes('支付宝') || badge.includes('微信') || badge.includes('银联') ? '#e8f5e9' : '#f0f0f0',
                color: badge.includes('免税') || badge.includes('支付宝') || badge.includes('微信') || badge.includes('银联') ? '#2e7d32' : '#333',
                padding: '4px 10px',
                borderRadius: 6,
                fontSize: 12,
                fontWeight: 500,
              }}>{badge}</span>
            ))}
          </div>
        )}
      </div>

      {/* Action Bar */}
      <div style={{
        display: 'flex',
        gap: 0,
        padding: '16px 20px',
        borderTop: '1px solid #f0f0f0',
        borderBottom: '8px solid #f5f5f5',
      }}>
        {place.phone && (
          <ActionBtn emoji="📞" label={L(lang, { ko: '전화', zh: '电话', en: 'Call' })} onClick={handleCall} />
        )}
        <ActionBtn emoji="🗺" label={L(lang, { ko: '길찾기', zh: '导航', en: 'Directions' })} onClick={handleNav} />
        {place.coupon?.available && (
          <ActionBtn emoji="🎫" label={L(lang, { ko: '쿠폰', zh: '优惠券', en: 'Coupon' })} onClick={() => alert(place.coupon.desc_zh)} />
        )}
        <ActionBtn emoji="💾" label={L(lang, { ko: '저장', zh: '收藏', en: 'Save' })} onClick={handleSave} />
        <ActionBtn emoji="↗️" label={L(lang, { ko: '공유', zh: '分享', en: 'Share' })} onClick={handleShare} />
      </div>

      {/* Hours */}
      {place.hours && (
        <Section title={L(lang, { ko: '영업시간', zh: '营业时间', en: 'Hours' })}>
          <HoursRow label={L(lang, { ko: '평일', zh: '周一~周四', en: 'Weekdays' })} value={place.hours.weekday} />
          <HoursRow label={L(lang, { ko: '주말', zh: '周五~周日', en: 'Weekends' })} value={place.hours.weekend} />
          {place.hours.closed_zh && (
            <HoursRow label={L(lang, { ko: '휴무일', zh: '休息日', en: 'Closed' })} value={place.hours.closed_zh} color="#c62828" />
          )}
        </Section>
      )}

      {/* Payment & Wifi */}
      {(place.payment_methods || place.wifi || place.tax_refund) && (
        <Section title={L(lang, { ko: '외국인 정보', zh: '外国人专属信息', en: 'Tourist Info' })}>
          {place.tax_refund?.available && (
            <InfoCard
              title="🏷 即时退税"
              desc={`单次消费满 ₩${place.tax_refund.min_spend.toLocaleString()} 即可退税\n位置：${place.tax_refund.location_zh}\n携带护照，买完直接退，不用去机场排队`}
            />
          )}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            {place.payment_methods && (
              <InfoMini emoji="💳" label={L(lang, { ko: '결제', zh: '支付方式', en: 'Payment' })} value={place.payment_methods.includes('alipay') ? '支付宝/微信/银联' : 'Card OK'} />
            )}
            {place.wifi && (
              <InfoMini emoji="📶" label="WiFi" value={typeof place.wifi === 'string' ? place.wifi : 'Yes'} />
            )}
          </div>
        </Section>
      )}

      {/* Category-specific sections */}
      {place.category === 'shopping' && place.floors_zh && (
        <Section title={L(lang, { ko: '층별 안내', zh: '楼层指南', en: 'Floor Guide' })}>
          {place.floors_zh.map((f, i) => (
            <FloorItem key={i} floor={f.floor} name={f.name} desc={f.desc} special={f.special} />
          ))}
        </Section>
      )}

      {place.category === 'restaurant' && place.menu_top3_zh && (
        <Section title={L(lang, { ko: '인기 메뉴', zh: '招牌菜', en: 'Popular Menu' })}>
          {place.menu_top3_zh.map((m, i) => (
            <MenuItem key={i} name={m.name} price={m.price} desc={m.desc} />
          ))}
          {place.avg_spend && (
            <div style={{ marginTop: 10, fontSize: 13, color: '#888' }}>
              {L(lang, { ko: '1인 평균', zh: '人均消费', en: 'Avg. spend' })}: {place.avg_spend}
            </div>
          )}
        </Section>
      )}

      {place.category === 'hospital' && place.departments_zh && (
        <Section title={L(lang, { ko: '진료과목', zh: '诊疗科室', en: 'Departments' })}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {place.departments_zh.map((dept, i) => (
              <span key={i} style={{
                background: '#f5f5f5',
                padding: '6px 12px',
                borderRadius: 6,
                fontSize: 12,
              }}>{dept}</span>
            ))}
          </div>
          {place.symptom_guide_zh && (
            <div style={{ marginTop: 16 }}>
              <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 8 }}>
                {L(lang, { ko: '증상별 가이드', zh: '症状指南', en: 'Symptom Guide' })}
              </div>
              {place.symptom_guide_zh.map((sg, i) => (
                <div key={i} style={{
                  padding: '8px 0',
                  borderBottom: i < place.symptom_guide_zh.length - 1 ? '1px solid #f5f5f5' : 'none',
                  fontSize: 12,
                  color: '#555',
                }}>
                  <span style={{ fontWeight: 600, color: '#333' }}>{sg.symptom}</span> → {sg.zh} ({sg.cost})
                </div>
              ))}
            </div>
          )}
        </Section>
      )}

      {place.category === 'attraction' && (
        <Section title={L(lang, { ko: '관광 정보', zh: '游览信息', en: 'Visit Info' })}>
          {place.admission_fee && <InfoRow label={L(lang, { ko: '입장료', zh: '门票', en: 'Admission' })} value={place.admission_fee} />}
          {place.duration_avg && <InfoRow label={L(lang, { ko: '소요 시간', zh: '建议游览时间', en: 'Duration' })} value={place.duration_avg} />}
          {place.best_season && <InfoRow label={L(lang, { ko: '최적 시즌', zh: '最佳季节', en: 'Best season' })} value={place.best_season} />}
          {place.audio_guide_zh && <InfoRow label={L(lang, { ko: '오디오 가이드', zh: '语音导览', en: 'Audio guide' })} value={place.audio_guide_zh} />}
        </Section>
      )}

      {place.category === 'transport' && place.transfer_guide_zh && (
        <Section title={L(lang, { ko: '교통 가이드', zh: '交通指南', en: 'Transfer Guide' })}>
          {place.transfer_guide_zh.map((tg, i) => (
            <div key={i} style={{
              padding: '12px 0',
              borderBottom: i < place.transfer_guide_zh.length - 1 ? '1px solid #f5f5f5' : 'none',
            }}>
              <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 4 }}>{tg.method}</div>
              <div style={{ fontSize: 12, color: '#666' }}>{tg.time} · {tg.cost}</div>
              <div style={{ fontSize: 11, color: '#2e7d32', marginTop: 2 }}>{tg.zh}</div>
            </div>
          ))}
        </Section>
      )}

      {place.category === 'accommodation' && (
        <Section title={L(lang, { ko: '숙소 정보', zh: '酒店信息', en: 'Hotel Info' })}>
          {place.checkin_checkout && <InfoRow label={L(lang, { ko: '체크인/아웃', zh: '入住/退房', en: 'Check-in/out' })} value={place.checkin_checkout} />}
          {place.price_range_season && <InfoRow label={L(lang, { ko: '가격대', zh: '价格区间', en: 'Price range' })} value={place.price_range_season} />}
          {place.amenities_zh && (
            <div style={{ marginTop: 10 }}>
              <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 6 }}>
                {L(lang, { ko: '편의시설', zh: '设施服务', en: 'Amenities' })}
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {place.amenities_zh.map((a, i) => (
                  <span key={i} style={{
                    background: '#f5f5f5',
                    padding: '4px 10px',
                    borderRadius: 6,
                    fontSize: 11,
                  }}>{a}</span>
                ))}
              </div>
            </div>
          )}
        </Section>
      )}

      {place.category === 'convenience' && place.sim_plans_zh && (
        <Section title={L(lang, { ko: 'SIM 카드', zh: 'SIM卡套餐', en: 'SIM Plans' })}>
          {place.sim_plans_zh.map((sp, i) => (
            <div key={i} style={{
              padding: '10px 14px',
              background: '#fafafa',
              borderRadius: 6,
              marginBottom: 8,
              fontSize: 12,
            }}>
              <div style={{ fontWeight: 600, marginBottom: 2 }}>{sp.name}</div>
              <div style={{ color: '#666' }}>{sp.days}天 · {sp.data} — {sp.price}</div>
            </div>
          ))}
          {place.tourist_combo && (
            <div style={{ marginTop: 8, fontSize: 12, color: '#2e7d32', fontWeight: 600 }}>
              💡 {place.tourist_combo}
            </div>
          )}
        </Section>
      )}

      {/* Review Summary */}
      {place.review_summary && (
        <Section title={L(lang, { ko: '리뷰 요약', zh: '评价摘要', en: 'Reviews' })}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 16 }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 36, fontWeight: 700 }}>{place.review_summary.rating}</div>
              <div style={{ fontSize: 14, color: '#f59e0b' }}>{'★'.repeat(Math.round(place.review_summary.rating))}</div>
              <div style={{ fontSize: 12, color: '#999', marginTop: 2 }}>{place.review_summary.count.toLocaleString()}条</div>
            </div>
            <div style={{ flex: 1, fontSize: 12, color: '#555', lineHeight: 1.6 }}>
              <div style={{ color: '#2e7d32' }}>✓ {place.review_summary.positive_zh}</div>
              {place.review_summary.negative_zh && (
                <div style={{ color: '#c62828', marginTop: 4 }}>✗ {place.review_summary.negative_zh}</div>
              )}
            </div>
          </div>
          {place.review_summary.best_comment_zh && (
            <div style={{
              background: '#fafafa',
              borderRadius: 6,
              padding: 14,
              fontSize: 13,
              lineHeight: 1.6,
              color: '#555',
              fontStyle: 'italic',
            }}>
              "{place.review_summary.best_comment_zh}"
              <div style={{ fontSize: 11, color: '#999', marginTop: 6, fontStyle: 'normal' }}>
                — 小红书用户 · 2026
              </div>
            </div>
          )}
        </Section>
      )}

      {/* Nearby */}
      {place.nearby && place.nearby.length > 0 && (
        <Section title={L(lang, { ko: '주변 추천', zh: '周边推荐', en: 'Nearby' })} last>
          {place.nearby.map((nb, i) => (
            <NearbyItem key={i} name={getLocalizedName(nb, lang)} distance={nb.distance} tag={nb.tag} />
          ))}
        </Section>
      )}


    </div>
  )
}

// ━━━ Sub-components ━━━

function ActionBtn({ emoji, label, onClick }) {
  return (
    <button onClick={onClick} style={{
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: 4,
      cursor: 'pointer',
      border: 'none',
      background: 'none',
      padding: '8px 0',
    }}>
      <div style={{
        width: 44,
        height: 44,
        borderRadius: '50%',
        background: '#f5f5f5',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: 18,
      }}>{emoji}</div>
      <span style={{ fontSize: 11, color: '#555', fontWeight: 500 }}>{label}</span>
    </button>
  )
}

function Section({ title, children, last = false }) {
  return (
    <div style={{
      padding: 20,
      borderBottom: last ? 'none' : '8px solid #f5f5f5',
      paddingBottom: last ? 80 : 20,
    }}>
      <div style={{
        fontSize: 15,
        fontWeight: 700,
        marginBottom: 14,
        display: 'flex',
        alignItems: 'center',
        gap: 6,
      }}>{title}</div>
      {children}
    </div>
  )
}

function HoursRow({ label, value, color = '#555' }) {
  return (
    <div style={{
      display: 'flex',
      justifyContent: 'space-between',
      padding: '6px 0',
      fontSize: 13,
      color,
    }}>
      <span style={{ fontWeight: 500, color: '#333' }}>{label}</span>
      <span>{value}</span>
    </div>
  )
}

function InfoCard({ title, desc }) {
  return (
    <div style={{
      background: '#fafafa',
      borderRadius: 6,
      padding: 14,
      marginBottom: 10,
    }}>
      <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 6 }}>{title}</div>
      <div style={{ fontSize: 12, color: '#666', lineHeight: 1.6, whiteSpace: 'pre-line' }}>{desc}</div>
    </div>
  )
}

function InfoMini({ emoji, label, value }) {
  return (
    <div style={{
      background: '#fafafa',
      borderRadius: 6,
      padding: 12,
      textAlign: 'center',
    }}>
      <div style={{ fontSize: 22, marginBottom: 4 }}>{emoji}</div>
      <div style={{ fontSize: 11, color: '#999', marginBottom: 2 }}>{label}</div>
      <div style={{ fontSize: 13, fontWeight: 600 }}>{value}</div>
    </div>
  )
}

function FloorItem({ floor, name, desc, special = false }) {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      padding: '12px 0',
      borderBottom: '1px solid #f5f5f5',
    }}>
      <div style={{
        width: 44,
        height: 44,
        background: special ? '#2e7d32' : '#111',
        color: '#fff',
        borderRadius: 6,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: 13,
        fontWeight: 700,
        marginRight: 14,
        flexShrink: 0,
      }}>{floor}</div>
      <div>
        <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 2 }}>{name}</div>
        <div style={{ fontSize: 12, color: '#888' }}>{desc}</div>
      </div>
    </div>
  )
}

function MenuItem({ name, price, desc }) {
  return (
    <div style={{
      padding: '10px 0',
      borderBottom: '1px solid #f5f5f5',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 2 }}>
        <span style={{ fontSize: 14, fontWeight: 600 }}>{name}</span>
        <span style={{ fontSize: 14, fontWeight: 600, color: '#111' }}>{price}</span>
      </div>
      <div style={{ fontSize: 12, color: '#888' }}>{desc}</div>
    </div>
  )
}

function InfoRow({ label, value }) {
  return (
    <div style={{
      padding: '8px 0',
      borderBottom: '1px solid #f5f5f5',
      display: 'flex',
      justifyContent: 'space-between',
      fontSize: 13,
    }}>
      <span style={{ color: '#666' }}>{label}</span>
      <span style={{ fontWeight: 500, color: '#333' }}>{value}</span>
    </div>
  )
}

function NearbyItem({ name, distance, tag }) {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      padding: '12px 0',
      borderBottom: '1px solid #f5f5f5',
    }}>
      <div style={{
        width: 40,
        height: 40,
        borderRadius: 6,
        background: '#f5f5f5',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: 18,
        marginRight: 12,
        flexShrink: 0,
      }}>📍</div>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 14, fontWeight: 500 }}>{name}</div>
        <div style={{ fontSize: 12, color: '#999' }}>{distance}</div>
      </div>
      <span style={{
        background: '#f0f0f0',
        padding: '3px 8px',
        borderRadius: 6,
        fontSize: 11,
        color: '#555',
      }}>{tag}</span>
    </div>
  )
}
