/**
 * 인천공항 상업시설 하드코딩 데이터
 * API 연동 예정 (인천국제공항공사_상업시설 정보 서비스)
 * 출처: 인천공항 공식 사이트 (airport.kr)
 */

export const AIRPORT_SHOP_CATEGORIES = [
  { id: 'all', name: { ko: '전체', zh: '全部', en: 'All' } },
  { id: 'dutyfree', name: { ko: '면세점', zh: '免税店', en: 'Duty Free' } },
  { id: 'restaurant', name: { ko: '식당', zh: '餐厅', en: 'Restaurant' } },
  { id: 'cafe', name: { ko: '카페', zh: '咖啡', en: 'Cafe' } },
]

export const AIRPORT_TERMINALS = [
  { id: 'all', name: { ko: '전체', zh: '全部', en: 'All' } },
  { id: 'T1', name: { ko: '제1터미널', zh: '第1航站楼', en: 'Terminal 1' } },
  { id: 'T2', name: { ko: '제2터미널', zh: '第2航站楼', en: 'Terminal 2' } },
]

export const API_STATUS = 'pending' // 'pending' | 'active'

export const AIRPORT_SHOPS = [
  // 면세점 (5개)
  { id: 1, name: { ko: '롯데면세점', zh: '乐天免税店', en: 'Lotte Duty Free' }, category: 'dutyfree', terminal: 'T1', floor: '3F 출국장', hours: '06:30-21:30', description: { ko: '화장품, 향수, 주류, 담배', zh: '化妆品、香水、酒类、烟草', en: 'Cosmetics, perfume, liquor, tobacco' } },
  { id: 2, name: { ko: '신라면세점', zh: '新罗免税店', en: 'Shilla Duty Free' }, category: 'dutyfree', terminal: 'T1', floor: '3F 출국장', hours: '06:30-21:30', description: { ko: '명품 브랜드, 화장품, 전자제품', zh: '奢侈品牌、化妆品、电子产品', en: 'Luxury brands, cosmetics, electronics' } },
  { id: 3, name: { ko: '신세계면세점', zh: '新世界免税店', en: 'Shinsegae Duty Free' }, category: 'dutyfree', terminal: 'T1', floor: '3F 출국장', hours: '06:30-21:30', description: { ko: '패션, 뷰티, 식품', zh: '时尚、美妆、食品', en: 'Fashion, beauty, food' } },
  { id: 4, name: { ko: '롯데면세점 T2', zh: '乐天免税店 T2', en: 'Lotte Duty Free T2' }, category: 'dutyfree', terminal: 'T2', floor: '3F 출국장', hours: '06:30-21:30', description: { ko: 'T2 최대 면세점', zh: 'T2最大免税店', en: 'Largest duty free in T2' } },
  { id: 5, name: { ko: '신라면세점 T2', zh: '新罗免税店 T2', en: 'Shilla Duty Free T2' }, category: 'dutyfree', terminal: 'T2', floor: '3F 출국장', hours: '06:30-21:30', description: { ko: 'K-뷰티 특화 매장', zh: 'K-Beauty专区', en: 'K-Beauty specialty store' } },

  // 식당 (10개)
  { id: 6, name: { ko: '한식당 비빔밥', zh: '韩式拌饭', en: 'Korean Bibimbap' }, category: 'restaurant', terminal: 'T1', floor: '4F 푸드코트', hours: '06:00-21:00', description: { ko: '전통 한식, 비빔밥, 불고기', zh: '传统韩餐、拌饭、烤肉', en: 'Traditional Korean, bibimbap, bulgogi' } },
  { id: 7, name: { ko: '놀부 부대찌개', zh: 'Nolbu部队锅', en: 'Nolbu Budae Jjigae' }, category: 'restaurant', terminal: 'T1', floor: 'B1F', hours: '06:00-21:30', description: { ko: '부대찌개, 김치찌개 전문', zh: '部队锅、泡菜锅专营', en: 'Army stew & kimchi stew' } },
  { id: 8, name: { ko: '평양면옥', zh: '平壤面屋', en: 'Pyongyang Myeonok' }, category: 'restaurant', terminal: 'T1', floor: '4F', hours: '07:00-21:00', description: { ko: '냉면, 만두 전문', zh: '冷面、饺子专营', en: 'Cold noodles & dumplings' } },
  { id: 9, name: { ko: '본죽', zh: 'Bonjuk粥', en: 'Bonjuk Porridge' }, category: 'restaurant', terminal: 'T1', floor: 'B1F', hours: '05:30-22:00', description: { ko: '죽 전문점, 가벼운 식사', zh: '粥专卖店，轻食', en: 'Porridge shop, light meals' } },
  { id: 10, name: { ko: 'CJ 더 마켓', zh: 'CJ The Market', en: 'CJ The Market' }, category: 'restaurant', terminal: 'T1', floor: '1F 입국장', hours: '07:00-22:00', description: { ko: '편의 음식, 간편식', zh: '便利食品、简餐', en: 'Convenience food, ready meals' } },
  { id: 11, name: { ko: '고메스트리트', zh: 'Gourmet Street', en: 'Gourmet Street' }, category: 'restaurant', terminal: 'T2', floor: 'B1F', hours: '06:00-21:30', description: { ko: '다양한 한식/양식/중식', zh: '多种韩餐/西餐/中餐', en: 'Korean, Western, Chinese' } },
  { id: 12, name: { ko: '칸다소바', zh: '神田荞麦面', en: 'Kanda Soba' }, category: 'restaurant', terminal: 'T2', floor: '4F', hours: '07:00-21:00', description: { ko: '일식 소바, 우동', zh: '日式荞麦面、乌冬', en: 'Japanese soba & udon' } },
  { id: 13, name: { ko: '이연복 중화요리', zh: '李莲福中华料理', en: 'Chef Lee Chinese' }, category: 'restaurant', terminal: 'T2', floor: '4F', hours: '07:00-21:00', description: { ko: '유명 셰프 중화요리', zh: '名厨中华料理', en: 'Celebrity chef Chinese cuisine' } },
  { id: 14, name: { ko: '김가네 김밥', zh: '金家紫菜饭卷', en: 'Kimgane Gimbap' }, category: 'restaurant', terminal: 'T1', floor: 'B1F', hours: '06:00-21:30', description: { ko: '김밥, 라면, 돈까스', zh: '紫菜饭卷、拉面、炸猪排', en: 'Gimbap, ramen, tonkatsu' } },
  { id: 15, name: { ko: '한촌설렁탕', zh: '韩村雪浓汤', en: 'Hanchon Seolleongtang' }, category: 'restaurant', terminal: 'T2', floor: 'B1F', hours: '06:00-22:00', description: { ko: '설렁탕, 갈비탕', zh: '雪浓汤、排骨汤', en: 'Beef bone soup' } },

  // 카페 (5개)
  { id: 16, name: { ko: '스타벅스', zh: '星巴克', en: 'Starbucks' }, category: 'cafe', terminal: 'T1', floor: '3F 출국장', hours: '06:00-21:30', description: { ko: '커피, 음료, 디저트', zh: '咖啡、饮料、甜点', en: 'Coffee, drinks, desserts' } },
  { id: 17, name: { ko: '투썸플레이스', zh: 'A Twosome Place', en: 'A Twosome Place' }, category: 'cafe', terminal: 'T1', floor: '1F', hours: '06:00-22:00', description: { ko: '커피, 케이크, 디저트', zh: '咖啡、蛋糕、甜点', en: 'Coffee, cake, desserts' } },
  { id: 18, name: { ko: '할리스커피', zh: 'Hollys Coffee', en: 'Hollys Coffee' }, category: 'cafe', terminal: 'T2', floor: '3F', hours: '06:00-21:30', description: { ko: '커피, 브런치', zh: '咖啡、早午餐', en: 'Coffee, brunch' } },
  { id: 19, name: { ko: '파리바게뜨', zh: 'Paris Baguette', en: 'Paris Baguette' }, category: 'cafe', terminal: 'T1', floor: 'B1F', hours: '05:30-22:00', description: { ko: '빵, 케이크, 커피', zh: '面包、蛋糕、咖啡', en: 'Bread, cake, coffee' } },
  { id: 20, name: { ko: '이디야커피 T2', zh: 'Ediya Coffee T2', en: 'Ediya Coffee T2' }, category: 'cafe', terminal: 'T2', floor: 'B1F', hours: '06:00-22:00', description: { ko: '가성비 커피, 음료', zh: '高性价比咖啡、饮料', en: 'Affordable coffee, drinks' } },
]
