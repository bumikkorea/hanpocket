// 한국 주요 면세점 데이터
// 실제 위치 좌표, 전화번호, 딥링크 기반

export const DUTY_FREE_STORES = [
  // === 롯데면세점 ===
  {
    id: 'lotte-myeongdong',
    brand: 'lotte',
    name: { ko: '롯데면세점 명동본점', zh: '乐天免税店明洞总店', en: 'Lotte Duty Free Myeongdong Main' },
    lat: 37.5656,
    lng: 126.9816,
    address: { ko: '서울 중구 남대문로 81', zh: '首尔中区南大门路81号', en: '81 Namdaemun-ro, Jung-gu, Seoul' },
    floors: 'B1-9F',
    brands: 'Louis Vuitton, Chanel, Hermès, Gucci, Dior, Sulwhasoo, Whoo',
    deepLink: 'https://www.lottedfs.com/branchGuide/main',
    phone: '1688-3000',
    hours: '09:30-21:00',
    pickup: {
      ko: '인천공항 T1 동편 28번 게이트 근처 / T2 서편 253번 게이트 근처',
      zh: '仁川机场T1东侧28号登机口附近 / T2西侧253号登机口附近',
      en: 'Incheon Airport T1 East near Gate 28 / T2 West near Gate 253'
    },
    features: ['tax-refund-counter', 'vip-lounge', 'chinese-staff', 'alipay', 'wechatpay']
  },
  {
    id: 'lotte-coex',
    brand: 'lotte',
    name: { ko: '롯데면세점 코엑스점', zh: '乐天免税店COEX店', en: 'Lotte Duty Free COEX' },
    lat: 37.5116,
    lng: 127.0595,
    address: { ko: '서울 강남구 영동대로 524', zh: '首尔江南区永东大路524号', en: '524 Yeongdong-daero, Gangnam-gu, Seoul' },
    floors: 'B1-2F',
    brands: 'Cartier, Bulgari, Tiffany, Sulwhasoo, Laneige, SK-II',
    deepLink: 'https://www.lottedfs.com/branchGuide/coex',
    phone: '1688-3000',
    hours: '10:00-20:30',
    pickup: {
      ko: '인천공항 T1·T2 인도장',
      zh: '仁川机场T1·T2提货处',
      en: 'Incheon Airport T1·T2 pickup counter'
    },
    features: ['chinese-staff', 'alipay', 'wechatpay']
  },
  {
    id: 'lotte-jamsil',
    brand: 'lotte',
    name: { ko: '롯데면세점 월드타워점', zh: '乐天免税店世界塔店', en: 'Lotte Duty Free World Tower' },
    lat: 37.5125,
    lng: 127.1025,
    address: { ko: '서울 송파구 올림픽로 300 롯데월드타워', zh: '首尔松坡区奥林匹克路300号 乐天世界塔', en: '300 Olympic-ro, Songpa-gu, Seoul (Lotte World Tower)' },
    floors: '8F-9F',
    brands: 'Louis Vuitton, Chanel, Dior, Fendi, Bottega Veneta',
    deepLink: 'https://www.lottedfs.com/branchGuide/worldtower',
    phone: '1688-3000',
    hours: '10:00-20:30',
    pickup: {
      ko: '인천공항 T1·T2 인도장',
      zh: '仁川机场T1·T2提货处',
      en: 'Incheon Airport T1·T2 pickup counter'
    },
    features: ['observatory-combo', 'chinese-staff', 'alipay', 'wechatpay']
  },

  // === 신라면세점 ===
  {
    id: 'shilla-jangchung',
    brand: 'shilla',
    name: { ko: '신라면세점 서울본점', zh: '新罗免税店首尔总店', en: 'Shilla Duty Free Seoul Main' },
    lat: 37.5572,
    lng: 127.0053,
    address: { ko: '서울 중구 동호로 249', zh: '首尔中区东湖路249号', en: '249 Dongho-ro, Jung-gu, Seoul' },
    floors: 'B1-8F',
    brands: 'Chanel, Louis Vuitton, Hermès, Cartier, Tiffany, Whoo, Sulwhasoo',
    deepLink: 'https://www.shilladfs.com/estore/kr/ko/store/store0101',
    phone: '1688-1110',
    hours: '09:30-21:00',
    pickup: {
      ko: '인천공항 T1 면세품 인도장 (동편·서편) / T2 면세품 인도장',
      zh: '仁川机场T1免税品提货处（东侧·西侧）/ T2免税品提货处',
      en: 'Incheon Airport T1 pickup (East/West) / T2 pickup'
    },
    features: ['vip-lounge', 'chinese-staff', 'alipay', 'wechatpay', 'unionpay']
  },
  {
    id: 'shilla-incheon-t1',
    brand: 'shilla',
    name: { ko: '신라면세점 인천공항 T1', zh: '新罗免税店仁川机场T1', en: 'Shilla Duty Free Incheon T1' },
    lat: 37.4492,
    lng: 126.4503,
    address: { ko: '인천 중구 공항로 272 인천국제공항 제1여객터미널', zh: '仁川中区机场路272号 仁川国际机场第1航站楼', en: '272 Gonghang-ro, Jung-gu, Incheon (Terminal 1)' },
    floors: '3F 출국장 내',
    brands: 'Chanel, Dior, Estée Lauder, Sulwhasoo, Whoo, MAC',
    deepLink: 'https://www.shilladfs.com/estore/kr/ko/store/store0201',
    phone: '1688-1110',
    hours: '06:30-22:00',
    pickup: {
      ko: '출국장 내 직접 구매',
      zh: '出境大厅内直接购买',
      en: 'Direct purchase inside departure area'
    },
    features: ['airside', 'chinese-staff', 'alipay', 'wechatpay', 'unionpay']
  },
  {
    id: 'shilla-incheon-t2',
    brand: 'shilla',
    name: { ko: '신라면세점 인천공항 T2', zh: '新罗免税店仁川机场T2', en: 'Shilla Duty Free Incheon T2' },
    lat: 37.4608,
    lng: 126.4407,
    address: { ko: '인천 중구 제2터미널대로 551 인천국제공항 제2여객터미널', zh: '仁川中区第2航站楼大路551号 第2航站楼', en: '551 2nd Terminal-daero, Jung-gu, Incheon (Terminal 2)' },
    floors: '3F 출국장 내',
    brands: 'Louis Vuitton, Chanel, Hermès, Bulgari, Cartier',
    deepLink: 'https://www.shilladfs.com/estore/kr/ko/store/store0301',
    phone: '1688-1110',
    hours: '06:30-22:00',
    pickup: {
      ko: '출국장 내 직접 구매',
      zh: '出境大厅内直接购买',
      en: 'Direct purchase inside departure area'
    },
    features: ['airside', 'chinese-staff', 'alipay', 'wechatpay', 'unionpay']
  },

  // === 신세계면세점 ===
  {
    id: 'ssg-myeongdong',
    brand: 'shinsegae',
    name: { ko: '신세계면세점 명동점', zh: '新世界免税店明洞店', en: 'Shinsegae Duty Free Myeongdong' },
    lat: 37.5633,
    lng: 126.9810,
    address: { ko: '서울 중구 퇴계로 77 신세계백화점 본점 신관', zh: '首尔中区退溪路77号 新世界百货总店新馆', en: '77 Toegye-ro, Jung-gu, Seoul (Shinsegae Dept. Store)' },
    floors: '8F-12F',
    brands: 'Chanel, Dior, Prada, Miu Miu, Loewe, Sulwhasoo, Whoo',
    deepLink: 'https://www.ssgdfs.com/kr/store/main',
    phone: '1661-8778',
    hours: '09:30-20:30',
    pickup: {
      ko: '인천공항 T1·T2 인도장',
      zh: '仁川机场T1·T2提货处',
      en: 'Incheon Airport T1·T2 pickup counter'
    },
    features: ['shinsegae-vip', 'chinese-staff', 'alipay', 'wechatpay', 'unionpay']
  },
  {
    id: 'ssg-gangnam',
    brand: 'shinsegae',
    name: { ko: '신세계면세점 강남점', zh: '新世界免税店江南店', en: 'Shinsegae Duty Free Gangnam' },
    lat: 37.5046,
    lng: 127.0040,
    address: { ko: '서울 서초구 신반포로 176 센트럴시티', zh: '首尔瑞草区新盘浦路176号 Central City', en: '176 Sinbanpo-ro, Seocho-gu, Seoul (Central City)' },
    floors: '3F-6F',
    brands: 'Gucci, Bottega Veneta, YSL, Givenchy, SK-II, Estée Lauder',
    deepLink: 'https://www.ssgdfs.com/kr/store/gangnam',
    phone: '1661-8778',
    hours: '10:00-20:00',
    pickup: {
      ko: '인천공항 T1·T2 인도장',
      zh: '仁川机场T1·T2提货处',
      en: 'Incheon Airport T1·T2 pickup counter'
    },
    features: ['chinese-staff', 'alipay', 'wechatpay', 'unionpay']
  },

  // === 현대백화점 면세점 ===
  {
    id: 'hyundai-trade',
    brand: 'hyundai',
    name: { ko: '현대백화점면세점 무역센터점', zh: '现代百货免税店贸易中心店', en: 'Hyundai Dept. Duty Free Trade Center' },
    lat: 37.5088,
    lng: 127.0608,
    address: { ko: '서울 강남구 테헤란로 517 현대백화점 무역센터', zh: '首尔江南区德黑兰路517号 现代百货贸易中心', en: '517 Teheran-ro, Gangnam-gu, Seoul' },
    floors: '8F-10F',
    brands: 'Chanel, Louis Vuitton, Rolex, Omega, Sulwhasoo, La Mer',
    deepLink: 'https://www.hddfs.com/shop/gn/main',
    phone: '1811-7788',
    hours: '10:00-20:00',
    pickup: {
      ko: '인천공항 T1·T2 인도장',
      zh: '仁川机场T1·T2提货处',
      en: 'Incheon Airport T1·T2 pickup counter'
    },
    features: ['chinese-staff', 'alipay', 'wechatpay']
  },
  {
    id: 'hyundai-dongdaemun',
    brand: 'hyundai',
    name: { ko: '현대시티아울렛 동대문점 면세점', zh: '现代城市奥特莱斯东大门店免税店', en: 'Hyundai City Outlets Dongdaemun DFS' },
    lat: 37.5669,
    lng: 127.0094,
    address: { ko: '서울 중구 장충단로 20', zh: '首尔中区奖忠坛路20号', en: '20 Jangchungdan-ro, Jung-gu, Seoul' },
    floors: '7F-8F',
    brands: 'Coach, Michael Kors, MCM, Laneige, Innisfree',
    deepLink: 'https://www.hddfs.com/shop/dm/main',
    phone: '1811-7788',
    hours: '10:00-20:00',
    pickup: {
      ko: '인천공항 T1·T2 인도장',
      zh: '仁川机场T1·T2提货处',
      en: 'Incheon Airport T1·T2 pickup counter'
    },
    features: ['chinese-staff', 'alipay', 'wechatpay']
  },

  // === 동화면세점 ===
  {
    id: 'donghwa-gwanghwamun',
    brand: 'donghwa',
    name: { ko: '동화면세점 광화문점', zh: '东和免税店光化门店', en: 'Donghwa Duty Free Gwanghwamun' },
    lat: 37.5710,
    lng: 126.9787,
    address: { ko: '서울 종로구 세종대로 149', zh: '首尔钟路区世宗大路149号', en: '149 Sejong-daero, Jongno-gu, Seoul' },
    floors: '2F-4F',
    brands: 'MCM, Coach, Furla, Sulwhasoo, Whoo, Laneige',
    deepLink: 'https://www.dutyfree24.com',
    phone: '02-399-3000',
    hours: '09:30-20:30',
    pickup: {
      ko: '인천공항 T1 인도장',
      zh: '仁川机场T1提货处',
      en: 'Incheon Airport T1 pickup counter'
    },
    features: ['chinese-staff', 'alipay', 'wechatpay']
  },

  // === HDC신라면세점 (용산) ===
  {
    id: 'hdc-yongsan',
    brand: 'hdc-shilla',
    name: { ko: 'HDC신라면세점 용산점', zh: 'HDC新罗免税店龙山店', en: 'HDC Shilla Duty Free Yongsan' },
    lat: 37.5283,
    lng: 126.9656,
    address: { ko: '서울 용산구 한강대로 23길 55 아이파크몰', zh: '首尔龙山区汉江大路23街55号 I\'PARK MALL', en: '55 Hangang-daero 23-gil, Yongsan-gu, Seoul (I\'PARK MALL)' },
    floors: '4F',
    brands: 'Gucci, Burberry, Ferragamo, Whoo, Sulwhasoo, SK-II',
    deepLink: 'https://www.hdcshilladfs.com',
    phone: '1688-0700',
    hours: '10:00-20:30',
    pickup: {
      ko: '인천공항 T1·T2 인도장',
      zh: '仁川机场T1·T2提货处',
      en: 'Incheon Airport T1·T2 pickup counter'
    },
    features: ['ktx-access', 'chinese-staff', 'alipay', 'wechatpay']
  },

  // === 제주 면세점 ===
  {
    id: 'lotte-jeju',
    brand: 'lotte',
    name: { ko: '롯데면세점 제주점', zh: '乐天免税店济州店', en: 'Lotte Duty Free Jeju' },
    lat: 33.4890,
    lng: 126.4983,
    address: { ko: '제주 제주시 도령로 83', zh: '济州市都令路83号', en: '83 Doryeong-ro, Jeju-si, Jeju' },
    floors: '4F-6F',
    brands: 'Chanel, Dior, Gucci, Sulwhasoo, Whoo, Innisfree',
    deepLink: 'https://www.lottedfs.com/branchGuide/jeju',
    phone: '1688-3000',
    hours: '10:00-19:30',
    pickup: {
      ko: '제주공항 국제선 인도장',
      zh: '济州机场国际线提货处',
      en: 'Jeju Airport international pickup'
    },
    features: ['chinese-staff', 'alipay', 'wechatpay']
  },
  {
    id: 'shilla-jeju',
    brand: 'shilla',
    name: { ko: '신라면세점 제주점', zh: '新罗免税店济州店', en: 'Shilla Duty Free Jeju' },
    lat: 33.4860,
    lng: 126.4870,
    address: { ko: '제주 제주시 노연로 69', zh: '济州市鲁连路69号', en: '69 Noyeon-ro, Jeju-si, Jeju' },
    floors: '1F-4F',
    brands: 'Louis Vuitton, Hermès, Cartier, Tiffany, SK-II, La Mer',
    deepLink: 'https://www.shilladfs.com/estore/kr/ko/store/store0401',
    phone: '1688-1110',
    hours: '10:00-19:30',
    pickup: {
      ko: '제주공항 국제선 인도장',
      zh: '济州机场国际线提货处',
      en: 'Jeju Airport international pickup'
    },
    features: ['chinese-staff', 'alipay', 'wechatpay']
  }
];

// 면세점 주요 취급 브랜드
export const DUTY_FREE_BRANDS = [
  // 럭셔리
  'Louis Vuitton', 'Chanel', 'Hermès', 'Gucci', 'Dior', 'Prada', 'Cartier', 'Tiffany & Co.',
  'Bulgari', 'Rolex', 'Omega', 'Burberry', 'Fendi', 'Bottega Veneta', 'Loewe', 'YSL',
  // K-뷰티
  'Sulwhasoo', 'Whoo', 'SK-II', 'Estée Lauder', 'La Mer', 'MAC', 'Laneige', 'Innisfree',
  'Hera', 'NARS', 'Tom Ford Beauty', 'Bobbi Brown', 'Clinique', 'Shiseido'
];

// 면세점 쇼핑 팁
export const DUTY_FREE_TIPS = {
  ko: [
    '시내 면세점에서 구매 → 출국 시 공항 인도장에서 수령',
    '인터넷 면세점이 매장보다 10-20% 저렴한 경우 많음',
    '구매 한도: 1인당 $5,000 (미화 기준)',
    '면세점 멤버십 가입 시 추가 5-15% 할인',
    '공항 면세점은 출국 2-3시간 전 도착 권장',
    '인기 제품은 온라인 사전 예약 필수',
    '중국 입국 시 면세 한도 ¥5,000 (5000위안) 주의'
  ],
  zh: [
    '市内免税店购买 → 出境时在机场提货处领取',
    '网上免税店比实体店便宜10-20%的情况很多',
    '购买限额：每人5,000美元',
    '注册免税店会员可额外享受5-15%折扣',
    '建议出发前2-3小时到达机场免税店',
    '热门商品需要提前在线预约',
    '入境中国时免税额度为¥5,000（5000元）请注意'
  ],
  en: [
    'Buy at downtown DFS → Pick up at airport departure pickup counter',
    'Online duty free stores are often 10-20% cheaper than in-store',
    'Purchase limit: $5,000 USD per person',
    'DFS membership gives additional 5-15% discount',
    'Arrive 2-3 hours before departure for airport DFS shopping',
    'Popular items require online pre-reservation',
    'China entry duty-free limit is ¥5,000 (CNY) — be aware'
  ]
};

// 면세점 브랜드별 색상 (UI용)
export const DUTY_FREE_BRAND_COLORS = {
  lotte: '#E60012',
  shilla: '#C8102E',
  shinsegae: '#000000',
  hyundai: '#006241',
  donghwa: '#1B3A5C',
  'hdc-shilla': '#8B0000'
};
