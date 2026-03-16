// 한국 주요 환전소 데이터
// 실제 위치 좌표 기반

export const EXCHANGE_OFFICES = [
  // === 명동 지역 (환율 최고) ===
  {
    id: 'myeongdong-daeil',
    type: 'private',
    name: { ko: '대일환전소', zh: '大日换钱所', en: 'Daeil Money Exchange' },
    lat: 37.5636,
    lng: 126.9835,
    address: { ko: '서울 중구 명동8나길 25', zh: '首尔中区明洞8NA街25号', en: '25 Myeongdong 8na-gil, Jung-gu, Seoul' },
    rateScore: 5,
    hours: '09:00-21:00',
    phone: '02-776-2768',
    currencies: ['CNY', 'USD', 'JPY', 'EUR', 'HKD', 'TWD'],
    notes: {
      ko: '명동 최고 환율, 항상 줄이 길음',
      zh: '明洞最佳汇率，总是排长队',
      en: 'Best rate in Myeongdong, always long queues'
    }
  },
  {
    id: 'myeongdong-daesung',
    type: 'private',
    name: { ko: '대성환전소', zh: '大成换钱所', en: 'Daesung Money Exchange' },
    lat: 37.5632,
    lng: 126.9841,
    address: { ko: '서울 중구 명동8가길 8', zh: '首尔中区明洞8GA街8号', en: '8 Myeongdong 8ga-gil, Jung-gu, Seoul' },
    rateScore: 5,
    hours: '09:00-20:30',
    phone: '02-318-0361',
    currencies: ['CNY', 'USD', 'JPY', 'EUR', 'HKD'],
    notes: {
      ko: '대일환전소 바로 근처, 환율 거의 동일',
      zh: '就在大日换钱所旁边，汇率几乎一样',
      en: 'Right next to Daeil, nearly identical rates'
    }
  },
  {
    id: 'myeongdong-yonsei',
    type: 'private',
    name: { ko: '연세환전소', zh: '延世换钱所', en: 'Yonsei Money Exchange' },
    lat: 37.5627,
    lng: 126.9845,
    address: { ko: '서울 중구 명동8나길 35', zh: '首尔中区明洞8NA街35号', en: '35 Myeongdong 8na-gil, Jung-gu, Seoul' },
    rateScore: 4,
    hours: '09:00-21:00',
    phone: '02-752-6627',
    currencies: ['CNY', 'USD', 'JPY', 'EUR'],
    notes: {
      ko: '명동역 6번 출구 근처',
      zh: '明洞站6号出口附近',
      en: 'Near Myeongdong Station Exit 6'
    }
  },

  // === 동대문 지역 ===
  {
    id: 'dongdaemun-dongah',
    type: 'private',
    name: { ko: '동아환전소', zh: '东亚换钱所', en: 'Donga Money Exchange' },
    lat: 37.5669,
    lng: 127.0093,
    address: { ko: '서울 중구 을지로6가 18-186', zh: '首尔中区乙支路6街18-186', en: '18-186 Euljiro 6-ga, Jung-gu, Seoul' },
    rateScore: 4,
    hours: '09:30-22:00',
    phone: '02-2268-5647',
    currencies: ['CNY', 'USD', 'JPY'],
    notes: {
      ko: '동대문 야간 쇼핑 시 편리',
      zh: '东大门夜间购物时很方便',
      en: 'Convenient for Dongdaemun night shopping'
    }
  },

  // === 이태원 지역 ===
  {
    id: 'itaewon-travel',
    type: 'private',
    name: { ko: '이태원 트래블 환전', zh: '梨泰院Travel换钱所', en: 'Itaewon Travel Exchange' },
    lat: 37.5347,
    lng: 126.9945,
    address: { ko: '서울 용산구 이태원로 179', zh: '首尔龙山区梨泰院路179号', en: '179 Itaewon-ro, Yongsan-gu, Seoul' },
    rateScore: 4,
    hours: '09:00-20:00',
    phone: '02-798-7850',
    currencies: ['CNY', 'USD', 'JPY', 'EUR', 'GBP', 'AUD', 'SAR'],
    notes: {
      ko: '다양한 통화 취급, 이태원역 1번 출구',
      zh: '处理多种货币，梨泰院站1号出口',
      en: 'Handles many currencies, Itaewon Station Exit 1'
    }
  },

  // === 홍대 지역 ===
  {
    id: 'hongdae-travel',
    type: 'private',
    name: { ko: '홍대 트래블 환전', zh: '弘大Travel换钱所', en: 'Hongdae Travel Exchange' },
    lat: 37.5563,
    lng: 126.9237,
    address: { ko: '서울 마포구 양화로 152', zh: '首尔麻浦区杨花路152号', en: '152 Yanghwa-ro, Mapo-gu, Seoul' },
    rateScore: 3,
    hours: '09:30-20:00',
    phone: '02-332-2040',
    currencies: ['CNY', 'USD', 'JPY'],
    notes: {
      ko: '홍대입구역 9번 출구 도보 2분',
      zh: '弘大入口站9号出口步行2分钟',
      en: '2 min walk from Hongik Univ. Station Exit 9'
    }
  },

  // === 은행 환전 ===
  {
    id: 'kb-myeongdong',
    type: 'bank',
    name: { ko: 'KB국민은행 명동지점', zh: 'KB国民银行明洞支行', en: 'KB Kookmin Bank Myeongdong' },
    lat: 37.5638,
    lng: 126.9852,
    address: { ko: '서울 중구 명동길 42', zh: '首尔中区明洞街42号', en: '42 Myeongdong-gil, Jung-gu, Seoul' },
    rateScore: 3,
    hours: '09:00-16:00 (평일만)',
    phone: '02-757-7111',
    currencies: ['CNY', 'USD', 'JPY', 'EUR', 'GBP', 'AUD', 'CAD', 'CHF'],
    notes: {
      ko: '환전 우대쿠폰 앱에서 발급 가능 (최대 90% 우대)',
      zh: '可在APP领取换汇优惠券（最高90%优惠）',
      en: 'Get exchange discount coupons on KB app (up to 90% off fees)'
    }
  },
  {
    id: 'woori-myeongdong',
    type: 'bank',
    name: { ko: '우리은행 명동금융센터', zh: '友利银行明洞金融中心', en: 'Woori Bank Myeongdong Financial Center' },
    lat: 37.5644,
    lng: 126.9830,
    address: { ko: '서울 중구 을지로 35', zh: '首尔中区乙支路35号', en: '35 Euljiro, Jung-gu, Seoul' },
    rateScore: 3,
    hours: '09:00-16:00 (평일만)',
    phone: '02-2006-5000',
    currencies: ['CNY', 'USD', 'JPY', 'EUR', 'GBP'],
    notes: {
      ko: '중국어 가능 직원 상주',
      zh: '有会说中文的职员',
      en: 'Chinese-speaking staff available'
    }
  },
  {
    id: 'hana-myeongdong',
    type: 'bank',
    name: { ko: '하나은행 명동점', zh: '韩亚银行明洞支行', en: 'Hana Bank Myeongdong' },
    lat: 37.5640,
    lng: 126.9818,
    address: { ko: '서울 중구 남대문로 81', zh: '首尔中区南大门路81号', en: '81 Namdaemun-ro, Jung-gu, Seoul' },
    rateScore: 3,
    hours: '09:00-16:00 (평일만)',
    phone: '02-2002-1111',
    currencies: ['CNY', 'USD', 'JPY', 'EUR', 'GBP', 'HKD', 'TWD'],
    notes: {
      ko: '환전 90% 우대율 적용 가능',
      zh: '可享受90%换汇优惠率',
      en: '90% preferential exchange rate available'
    }
  },
  {
    id: 'shinhan-myeongdong',
    type: 'bank',
    name: { ko: '신한은행 명동점', zh: '新韩银行明洞支行', en: 'Shinhan Bank Myeongdong' },
    lat: 37.5631,
    lng: 126.9826,
    address: { ko: '서울 중구 남대문로 69', zh: '首尔中区南大门路69号', en: '69 Namdaemun-ro, Jung-gu, Seoul' },
    rateScore: 3,
    hours: '09:00-16:00 (평일만)',
    phone: '02-756-0505',
    currencies: ['CNY', 'USD', 'JPY', 'EUR'],
    notes: {
      ko: '신한 SOL 앱 사전환전 시 우대',
      zh: '通过新韩SOL APP提前换汇可享优惠',
      en: 'Pre-exchange via Shinhan SOL app for better rates'
    }
  },

  // === 강남 지역 ===
  {
    id: 'gangnam-seocho',
    type: 'private',
    name: { ko: '서초 환전소', zh: '瑞草换钱所', en: 'Seocho Money Exchange' },
    lat: 37.5045,
    lng: 127.0246,
    address: { ko: '서울 강남구 강남대로 396', zh: '首尔江南区江南大路396号', en: '396 Gangnam-daero, Gangnam-gu, Seoul' },
    rateScore: 4,
    hours: '09:30-19:00',
    phone: '02-534-4811',
    currencies: ['CNY', 'USD', 'JPY', 'EUR'],
    notes: {
      ko: '강남역 11번 출구 근처',
      zh: '江南站11号出口附近',
      en: 'Near Gangnam Station Exit 11'
    }
  },

  // === 공항 환전 ===
  {
    id: 'incheon-t1-kb',
    type: 'airport',
    name: { ko: 'KB국민은행 인천공항 T1', zh: 'KB国民银行仁川机场T1', en: 'KB Bank Incheon Airport T1' },
    lat: 37.4491,
    lng: 126.4505,
    address: { ko: '인천 중구 공항로 272 제1여객터미널 1F', zh: '仁川机场第1航站楼1层', en: 'Incheon Airport Terminal 1, 1F' },
    rateScore: 1,
    hours: '06:00-22:00',
    phone: '032-743-5371',
    currencies: ['CNY', 'USD', 'JPY', 'EUR', 'GBP', 'AUD', 'CAD', 'HKD', 'TWD', 'THB', 'SGD'],
    notes: {
      ko: '공항 환율은 시내보다 3-5% 불리 — 소액만 환전 권장',
      zh: '机场汇率比市内差3-5%——建议只换少量',
      en: 'Airport rates 3-5% worse than downtown — exchange minimum only'
    }
  },
  {
    id: 'incheon-t2-woori',
    type: 'airport',
    name: { ko: '우리은행 인천공항 T2', zh: '友利银行仁川机场T2', en: 'Woori Bank Incheon Airport T2' },
    lat: 37.4608,
    lng: 126.4407,
    address: { ko: '인천 중구 제2터미널대로 551 제2여객터미널 1F', zh: '仁川机场第2航站楼1层', en: 'Incheon Airport Terminal 2, 1F' },
    rateScore: 1,
    hours: '06:00-22:00',
    phone: '032-743-0900',
    currencies: ['CNY', 'USD', 'JPY', 'EUR', 'GBP', 'AUD', 'CAD', 'HKD'],
    notes: {
      ko: '비상용으로만 사용 — 시내 환전이 훨씬 유리',
      zh: '仅供紧急使用——市内换钱更划算',
      en: 'Emergency use only — downtown exchange is much better'
    }
  },

  // === 서울역 지역 ===
  {
    id: 'seoul-station-travel',
    type: 'private',
    name: { ko: '서울역 환전소', zh: '首尔站换钱所', en: 'Seoul Station Money Exchange' },
    lat: 37.5547,
    lng: 126.9707,
    address: { ko: '서울 용산구 한강대로 405', zh: '首尔龙山区汉江大路405号', en: '405 Hangang-daero, Yongsan-gu, Seoul' },
    rateScore: 3,
    hours: '09:00-18:00',
    phone: '02-318-4730',
    currencies: ['CNY', 'USD', 'JPY', 'EUR'],
    notes: {
      ko: 'AREX 이용 시 편리, 공항보다 환율 좋음',
      zh: '乘坐AREX时方便，汇率比机场好',
      en: 'Convenient for AREX users, better rates than airport'
    }
  }
];

// 환전 팁
export const EXCHANGE_TIPS = {
  ko: [
    '명동 사설 환전소가 은행보다 환율 좋음 (대일·대성 추천)',
    '공항 환전은 최악 — 택시비 정도만 환전하고 시내에서 할 것',
    '은행 앱에서 환전 우대쿠폰 받으면 90% 우대 가능',
    '위안화(CNY) → 원화(KRW) 직접 환전 가능한 곳 확인',
    '평일 은행 영업시간(09:00-16:00)에만 은행 환전 가능',
    '알리페이/위챗페이 결제가 되는 곳이면 환전 필요 없음',
    '대량 환전(100만원 이상) 시 신분증 필요',
    '환전소 영수증은 반드시 보관 (재환전 시 필요)'
  ],
  zh: [
    '明洞私人换钱所比银行汇率好（推荐大日·大成）',
    '机场换钱最不划算——只换出租车费就好，到市内再换',
    '在银行APP领取换汇优惠券可享90%优惠',
    '确认可以直接将人民币(CNY)兑换韩元(KRW)的地方',
    '银行只在工作日营业时间(09:00-16:00)可以换钱',
    '如果可以用支付宝/微信支付，就不需要换钱',
    '大额换钱（100万韩元以上）需要身份证',
    '换钱收据一定要保管好（再次换钱时需要）'
  ],
  en: [
    'Private exchange offices in Myeongdong have better rates than banks (Daeil, Daesung recommended)',
    'Airport exchange has the worst rates — exchange taxi fare only, do the rest downtown',
    'Get exchange discount coupons on bank apps for up to 90% off fees',
    'Check locations that directly exchange CNY → KRW',
    'Bank exchange only available during weekday hours (09:00-16:00)',
    'No need to exchange if Alipay/WeChat Pay is accepted',
    'Large exchanges (over 1M KRW) require ID',
    'Always keep exchange receipts (needed for re-exchange)'
  ]
};

// 환전소 타입별 라벨
export const EXCHANGE_TYPE_LABELS = {
  private: { ko: '사설 환전소', zh: '私人换钱所', en: 'Private Exchange' },
  bank: { ko: '은행', zh: '银行', en: 'Bank' },
  airport: { ko: '공항 환전', zh: '机场换钱', en: 'Airport Exchange' }
};

// 환율 등급 설명
export const RATE_SCORE_LABELS = {
  1: { ko: '매우 불리', zh: '非常不划算', en: 'Very unfavorable' },
  2: { ko: '불리', zh: '不划算', en: 'Unfavorable' },
  3: { ko: '보통', zh: '一般', en: 'Average' },
  4: { ko: '좋음', zh: '划算', en: 'Good' },
  5: { ko: '최고', zh: '最划算', en: 'Best' }
};
