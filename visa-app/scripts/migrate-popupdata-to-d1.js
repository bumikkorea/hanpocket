// scripts/migrate-popupdata-to-d1.js
// popupData.js → Cloudflare D1 마이그레이션
// 실행: node scripts/migrate-popupdata-to-d1.js

const API = 'https://hanpocket-popup-store.bumik-korea.workers.dev/api/popups'
const ADMIN_TOKEN = 'near2024admin'

// 지역 중심 좌표 (lat/lng 없는 데이터용 fallback)
const DISTRICT_CENTER = {
  seongsu:    [37.5443, 127.0563],
  gangnam:    [37.5172, 127.0473],
  hannam:     [37.5355, 127.0052],
  hongdae:    [37.5575, 126.9245],
  myeongdong: [37.5635, 126.9845],
  yeouido:    [37.5260, 126.9289],
  jongno:     [37.5651, 126.9815],
  itaewon:    [37.5345, 126.9946],
  coex:       [37.5130, 127.0587],
  other:      [37.5665, 126.9780],
}

// 키워드 기반 popup_type 추측
function guessPopupType(title, tags) {
  const text = [title?.ko, title?.en, ...(tags?.ko || [])].join(' ').toLowerCase()
  if (['kpop', 'k팝', '아이돌', 'idol', 'kpop', 'ive', 'aespa', 'bts', 'stray', 'shinee', 'blackpink', '온유', '림버스', '니케', '전독시'].some(k => text.includes(k))) return 'kpop'
  if (['뷰티', 'beauty', '화장품', 'cosmetic', '스킨', 'skin', '메디힐', 'mediheal', '향수', 'perfume', 'chanel', '조말론'].some(k => text.includes(k))) return 'beauty'
  if (['패션', 'fashion', '의류', '스니커', 'sneaker', 'nike', 'dunst', 'omnipeople', 'skims'].some(k => text.includes(k))) return 'fashion'
  if (['캐릭터', 'character', '카카오', 'kakao', '산리오'].some(k => text.includes(k))) return 'character'
  if (['게임', 'game', '림버스', 'limbus', '니케', 'nikke'].some(k => text.includes(k))) return 'game'
  if (['전시', 'exhibition', '아트', 'art', '박물관', 'museum'].some(k => text.includes(k))) return 'exhibition'
  if (['음식', 'food', '디저트', 'dessert', '미식'].some(k => text.includes(k))) return 'food'
  if (['럭셔리', 'luxury', 'macallan', '맥캘란', 'bottega', '보테가'].some(k => text.includes(k))) return 'luxury'
  if (['웹툰', 'webtoon', '소설', '만화'].some(k => text.includes(k))) return 'webtoon'
  return 'other'
}

// 지역/이름 기반 venue_type 추측
function guessVenueType(district, title, address) {
  const text = [title?.ko, address?.ko].join(' ').toLowerCase()
  if (['백화점', '더현대', '롯데', '신세계', '갤러리아', '현대백화점'].some(k => text.includes(k))) return 'department_store'
  if (['coex', '코엑스', '스타필드'].some(k => text.includes(k))) return 'mall'
  if (['한강'].some(k => district?.includes(k) || text.includes(k))) return 'hangang'
  return 'hotplace'
}

// 팝업 유형별 이모지
const TYPE_EMOJI = {
  kpop: '🎤', beauty: '💄', fashion: '👗', character: '🧸',
  game: '🎮', exhibition: '🎨', food: '🍽️', luxury: '💎',
  webtoon: '📱', other: '📌',
}

// popupData.js에서 데이터 직접 임포트 (ESM)
async function main() {
  const { POPUP_STORES } = await import('../src/data/popupData.js')

  console.log(`\n📦 총 ${POPUP_STORES.length}개 팝업 마이그레이션 시작...\n`)

  let ok = 0
  let fail = 0

  for (const p of POPUP_STORES) {
    const district = p.district || 'other'
    const [lat, lng] = DISTRICT_CENTER[district] || DISTRICT_CENTER.other
    const popupType = guessPopupType(p.title, p.tags)
    const venueType = guessVenueType(district, p.title, p.address)

    const body = {
      slug:        p.id,
      brand:       p.brand || '',
      title_ko:    p.title?.ko || '',
      title_zh:    p.title?.zh || p.title?.ko || '',
      title_en:    p.title?.en || p.title?.ko || '',
      address_ko:  p.address?.ko || '',
      address_zh:  p.address?.zh || '',
      start_date:  p.period?.start || '',
      end_date:    p.period?.end || '',
      cover_image: p.image || '',
      is_hot:      p.hot ? 1 : 0,
      color:       p.color || '#6366F1',
      source_url:  p.sourceUrl || '',
      district,
      lat,
      lng,
      popup_type:  popupType,
      venue_type:  venueType,
      emoji:       TYPE_EMOJI[popupType] || '📌',
      source_type: 'manual',
      is_verified: 1,
      is_active:   1,
    }

    try {
      const res = await fetch(API, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${ADMIN_TOKEN}`,
        },
        body: JSON.stringify(body),
      })
      const data = await res.json()

      if (res.ok) {
        ok++
        console.log(`  ✅ [${popupType}] ${body.title_ko} → id:${data.id}`)
      } else {
        fail++
        console.log(`  ❌ ${body.title_ko} → ${data.error}`)
      }
    } catch (e) {
      fail++
      console.log(`  ❌ ${body.title_ko} → ${e.message}`)
    }

    // 요청 간격 (rate limit 방지)
    await new Promise(r => setTimeout(r, 100))
  }

  console.log(`\n✨ 완료: 성공 ${ok}개 / 실패 ${fail}개`)
}

main().catch(console.error)
