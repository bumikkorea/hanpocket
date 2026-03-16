/**
 * #56 서울 공공 와이파이 핫스팟 API
 * 서울 열린데이터광장 API + 정적 폴백 데이터
 */

const SEOUL_API_KEY = '725171716a6b656c39317953597056'
const BASE_URL = `http://openAPI.seoul.go.kr:8088/${SEOUL_API_KEY}/json`

let _cache = null
let _cacheTs = 0
const CACHE_TTL = 30 * 60 * 1000 // 30분

/**
 * 서울 공공와이파이 위치 조회
 * @returns {Promise<Array>} wifi spots
 */
export async function fetchPublicWifi() {
  if (_cache && Date.now() - _cacheTs < CACHE_TTL) return _cache

  try {
    // 서울 열린데이터: 공공와이파이 위치정보
    const res = await fetch(`${BASE_URL}/PublicWiFiPlaceInfo/1/200/`)
    if (!res.ok) throw new Error('API error')
    const data = await res.json()
    const rows = data?.PublicWiFiPlaceInfo?.row || []

    _cache = rows.map(r => ({
      id: `wifi-${r.X_SWIFI_WIFINAME || r.X_SWIFI_MAIN_NM}`,
      name: r.X_SWIFI_MAIN_NM || r.X_SWIFI_ADRES1,
      address: r.X_SWIFI_ADRES1 || '',
      district: r.X_SWIFI_ADRES2 || '',
      lat: parseFloat(r.LAT) || 0,
      lng: parseFloat(r.LNT) || 0,
      provider: r.X_SWIFI_INSTL_MBY || '서울시',
      type: r.X_SWIFI_INSTL_TY || '',
      indoor: r.X_SWIFI_INOUT_DOOR === '실내',
    })).filter(w => w.lat && w.lng)

    _cacheTs = Date.now()
    return _cache
  } catch (e) {
    console.warn('WiFi API fallback:', e.message)
    return FALLBACK_WIFI
  }
}

// 주요 관광지 근처 공공와이파이 폴백 데이터
const FALLBACK_WIFI = [
  // 명동
  { id: 'wifi-1', name: '명동 관광특구 무료 와이파이', address: '서울 중구 명동', lat: 37.5636, lng: 126.9869, provider: '서울시', indoor: false },
  { id: 'wifi-2', name: '명동역 무료 와이파이', address: '서울 중구 명동역', lat: 37.5609, lng: 126.9862, provider: '서울시', indoor: true },
  // 홍대
  { id: 'wifi-3', name: '홍대 걷고싶은거리 와이파이', address: '서울 마포구 홍대', lat: 37.5563, lng: 126.9236, provider: '서울시', indoor: false },
  { id: 'wifi-4', name: '홍대입구역 와이파이', address: '서울 마포구 홍대입구역', lat: 37.5571, lng: 126.9254, provider: '서울시', indoor: true },
  // 강남
  { id: 'wifi-5', name: '강남역 무료 와이파이', address: '서울 강남구 강남역', lat: 37.4979, lng: 127.0276, provider: '서울시', indoor: true },
  { id: 'wifi-6', name: '코엑스 무료 와이파이', address: '서울 강남구 코엑스', lat: 37.5116, lng: 127.0592, provider: '서울시', indoor: true },
  // 성수
  { id: 'wifi-7', name: '성수동 카페거리 와이파이', address: '서울 성동구 성수동', lat: 37.5446, lng: 127.0560, provider: '서울시', indoor: false },
  // 이태원
  { id: 'wifi-8', name: '이태원 관광특구 와이파이', address: '서울 용산구 이태원', lat: 37.5345, lng: 126.9946, provider: '서울시', indoor: false },
  // 잠실
  { id: 'wifi-9', name: '잠실역 와이파이', address: '서울 송파구 잠실역', lat: 37.5133, lng: 127.1001, provider: '서울시', indoor: true },
  { id: 'wifi-10', name: '롯데월드몰 와이파이', address: '서울 송파구 롯데월드몰', lat: 37.5125, lng: 127.1025, provider: '서울시', indoor: true },
  // DDP
  { id: 'wifi-11', name: 'DDP 동대문디자인플라자 와이파이', address: '서울 중구 DDP', lat: 37.5671, lng: 127.0095, provider: '서울시', indoor: true },
  // 여의도
  { id: 'wifi-12', name: '여의도공원 와이파이', address: '서울 영등포구 여의도공원', lat: 37.5254, lng: 126.9234, provider: '서울시', indoor: false },
  { id: 'wifi-13', name: 'IFC몰 와이파이', address: '서울 영등포구 IFC몰', lat: 37.5252, lng: 126.9261, provider: '서울시', indoor: true },
  // 광화문
  { id: 'wifi-14', name: '광화문광장 와이파이', address: '서울 종로구 광화문광장', lat: 37.5722, lng: 126.9769, provider: '서울시', indoor: false },
  // 남산
  { id: 'wifi-15', name: 'N서울타워 와이파이', address: '서울 용산구 남산', lat: 37.5512, lng: 126.9882, provider: '서울시', indoor: true },
  // 경복궁
  { id: 'wifi-16', name: '경복궁역 와이파이', address: '서울 종로구 경복궁역', lat: 37.5759, lng: 126.9732, provider: '서울시', indoor: true },
  // 인사동
  { id: 'wifi-17', name: '인사동 문화거리 와이파이', address: '서울 종로구 인사동', lat: 37.5741, lng: 126.9856, provider: '서울시', indoor: false },
  // 북촌
  { id: 'wifi-18', name: '북촌한옥마을 와이파이', address: '서울 종로구 북촌', lat: 37.5826, lng: 126.9831, provider: '서울시', indoor: false },
  // 서울역
  { id: 'wifi-19', name: '서울역 무료 와이파이', address: '서울 중구 서울역', lat: 37.5546, lng: 126.9707, provider: '서울시', indoor: true },
  // 동대문
  { id: 'wifi-20', name: '동대문 쇼핑타운 와이파이', address: '서울 중구 동대문', lat: 37.5713, lng: 127.0093, provider: '서울시', indoor: true },
]

export { FALLBACK_WIFI }
