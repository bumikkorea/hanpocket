/**
 * NEAR 매장 시드 데이터 (로컬)
 * DB 연동 전까지 프론트에서 직접 사용
 * 스키마: workers/schema-stores.sql 기준
 */

export const SERVICE_TYPES = {
  photo_studio:    { ko: '사진스튜디오', zh: '照相馆',   en: 'Photo Studio'    },
  dermatology:     { ko: '피부과',       zh: '皮肤科',   en: 'Dermatology'     },
  plastic_surgery: { ko: '성형외과',     zh: '整形外科', en: 'Plastic Surgery' },
  restaurant:      { ko: '레스토랑',     zh: '餐厅',     en: 'Restaurant'      },
  cafe:            { ko: '카페',         zh: '咖啡厅',   en: 'Cafe'            },
  hair:            { ko: '헤어',         zh: '美发',     en: 'Hair Salon'      },
  makeup:          { ko: '메이크업',     zh: '化妆',     en: 'Makeup'          },
  popup:           { ko: '팝업',         zh: '快闪店',   en: 'Popup'           },
  nail:            { ko: '네일',         zh: '美甲',     en: 'Nail'            },
  cosmetics:       { ko: '화장품',       zh: '化妆品',   en: 'Cosmetics'       },
  hotel:           { ko: '호텔',         zh: '酒店',     en: 'Hotel'           },
  hospital:        { ko: '병원',         zh: '医院',     en: 'Hospital'        },
  shopping:        { ko: '쇼핑',         zh: '购物',     en: 'Shopping'        },
  other:           { ko: '기타',         zh: '其他',     en: 'Other'           },
}

export const RESERVATION_TYPES = {
  near:   { ko: 'NEAR 예약',   zh: 'NEAR预约',       en: 'NEAR Booking'  },
  phone:  { ko: '전화 예약',   zh: '电话预约',       en: 'Phone Booking' },
  walkin: { ko: '바로 방문',   zh: '直接到店',       en: 'Walk-in'       },
  none:   { ko: '확인 필요',   zh: '需确认',         en: 'TBD'           },
}

export const STORES = [
  {
    id: 'mined-seongsu',
    name_kr: '마인디 성수',
    name_cn: 'MINE:D 圣水美发沙龙',
    service_type: 'hair',
    description_kr: '성수 트렌디 헤어살롱, 1:1 맞춤 컨설팅',
    description_cn: '圣水潮流美发沙龙，1:1定制发型咨询',
    address_kr: '서울시 성동구 왕십리로8길 24, GO-CCE건물 2층',
    address_cn: '首尔市城东区往十里路8街24号 GO-CCE大楼2层',
    latitude: 37.5458161,
    longitude: 127.0473519,
    nearest_station: '성수역',
    station_exit: '3번 출구',
    walk_minutes: 5,
    phone: '+82-507-1317-0273',
    phone_dial: '050713170273',
    hours: {
      mon: null,
      tue: '11:00-19:30',
      wed: '11:00-19:30',
      thu: '11:00-19:30',
      fri: '11:00-19:30',
      sat: '11:00-19:30',
      sun: '11:00-19:30',
    },
    hours_note: '마지막 접수 시간은 시술에 따라 상이',
    reservation_type: 'phone',
    is_reservable: true,
    walkin_available: false,
    walkin_note: '100% 예약제',
    instagram_id: 'mine.d_m_official',
    pay_alipay: false,
    pay_wechatpay: false,
    keywords_cn: ['美发', '染发', '烫发', '剪发', '头皮护理', '圣水美发', 'MINED美发沙龙', '韩国美发'],
    google_place_id: 'ChIJWWz37I6lfDURd_NA7tC2hZM',
    google_rating: 4.9,
    google_review_count: 50,
    photos: [],
    price_range: '₩30,000~₩150,000',
    languages: ['ko', 'en'],
    vibe_tags: ['트렌디', '힙', '감성'],
    staff: [
      {
        id: 'chai-mined',
        name_kr: '차이',
        name_cn: '小柴',
        role_kr: '실장',
        role_cn: '室长',
        off_days: ['monday', 'tuesday'],
        work_hours: '11:00-19:30',
        is_featured: true,
        featured_note_cn: 'NEAR推荐发型师，预约时请指定小柴室长',
      },
    ],
  },
  {
    id: 'beluga-studio',
    name_kr: '벨루가사진관',
    name_cn: '白鲸照相馆',
    service_type: 'photo_studio',
    description_kr: '이수역 프로필/가족/증명사진 전문 스튜디오',
    description_cn: '梨水站专业写真/全家福/证件照工作室',
    address_kr: '서울 동작구 사당동 132-20',
    address_cn: '首尔铜雀区舍堂洞132-20',
    latitude: 37.4878086,
    longitude: 126.9810195,
    nearest_station: '이수역',
    station_exit: null,
    walk_minutes: null,
    phone: '+82-70-4109-8888',
    phone_dial: '07041098888',
    hours: {
      mon: null,
      tue: '11:00-19:30',
      wed: '11:00-19:30',
      thu: '11:00-19:30',
      fri: '11:00-19:30',
      sat: '11:00-19:30',
      sun: '11:00-19:30',
    },
    hours_note: '마지막 예약 19:00',
    reservation_type: 'phone',
    is_reservable: true,
    walkin_available: false,
    walkin_note: '100% 예약제',
    instagram_id: 'beluga___studio_',
    pay_alipay: false,
    pay_wechatpay: false,
    keywords_cn: ['证件照', '写真', '全家福', '艺术照', '个人写真', '形象照', '白鲸照相馆', '梨水站照相馆'],
    google_place_id: 'ChIJhcsgfgChfDURTbcYrR2IcjE',
    google_rating: null,
    google_review_count: null,
    photos: [],
    price_range: '₩30,000~₩100,000',
    languages: ['ko'],
    vibe_tags: ['감성', '로컬'],
    staff: [],
  },
]

// ─── 유틸리티 ───

const DAY_KEYS = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat']

/** 특정 날짜에 매장이 영업하는지 */
export function isStoreOpen(store, date = new Date()) {
  const dow = date.getDay()
  return store.hours[DAY_KEYS[dow]] !== null
}

/** 특정 날짜의 영업시간 반환 */
export function getStoreHours(store, date = new Date()) {
  const dow = date.getDay()
  return store.hours[DAY_KEYS[dow]]
}

/** 특정 날짜에 담당자가 출근하는지 */
export function isStaffAvailable(staff, date = new Date()) {
  if (!staff.off_days || staff.off_days.length === 0) return true
  const dayName = ['sunday','monday','tuesday','wednesday','thursday','friday','saturday'][date.getDay()]
  return !staff.off_days.includes(dayName)
}

/** service_type으로 매장 필터 */
export function filterByType(type) {
  return STORES.filter(s => s.service_type === type)
}

/** 키워드 검색 (name_kr, name_cn, keywords_cn) */
export function searchStores(query) {
  if (!query.trim()) return STORES
  const q = query.toLowerCase()
  return STORES.filter(s =>
    s.name_kr.toLowerCase().includes(q) ||
    s.name_cn.toLowerCase().includes(q) ||
    s.keywords_cn.some(k => k.toLowerCase().includes(q)) ||
    (s.nearest_station && s.nearest_station.includes(q))
  )
}
