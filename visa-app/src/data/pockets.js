export const pocketCategories = [
  {
    id: 'situational-korean',
    name: { ko: '상황별 한국어', zh: '场景韩语', en: 'Situational Korean' },
    icon: '💬',
    pockets: [
      { id: 'restaurant', name: { ko: '식당', zh: '餐厅', en: 'Restaurant' }, icon: '🍽️', description: { ko: '입장/주문/계산 표현', zh: '入店/点餐/结账表达', en: 'Entrance/order/payment phrases' }, size: 'md' },
      { id: 'cafe', name: { ko: '카페', zh: '咖啡厅', en: 'Cafe' }, icon: '☕', description: { ko: '주문/커스텀/포장 표현', zh: '点单/自定义/打包表达', en: 'Order/custom/takeout phrases' }, size: 'md' },
      { id: 'transport', name: { ko: '교통', zh: '交通', en: 'Transport' }, icon: '🚇', description: { ko: '택시/지하철/버스 표현', zh: '出租车/地铁/公交表达', en: 'Taxi/subway/bus phrases' }, size: 'md' },
      { id: 'convenience', name: { ko: '편의점', zh: '便利店', en: 'Convenience Store' }, icon: '🏪', description: { ko: '편의점 표현 + 꿀조합', zh: '便利店表达 + 推荐组合', en: 'CVS phrases + combos' }, size: 'md' },
      { id: 'accommodation', name: { ko: '숙소', zh: '住宿', en: 'Accommodation' }, icon: '🏨', description: { ko: '체크인/요청/체크아웃 표현', zh: '入住/请求/退房表达', en: 'Check-in/request/checkout phrases' }, size: 'md' },
      { id: 'emergency', name: { ko: '긴급', zh: '紧急', en: 'Emergency' }, icon: '🚨', description: { ko: 'SOS + 긴급연락처 + 증상 표현', zh: 'SOS + 紧急联系 + 症状表达', en: 'SOS + emergency contacts + symptoms' }, size: 'md' },
    ],
  },
  {
    id: 'travel-food',
    name: { ko: '여행', zh: '旅行', en: 'Travel' },
    icon: '✈️',
    pockets: [
      { id: 'travel', name: { ko: '여행', zh: '旅行', en: 'Travel' }, icon: '✈️', description: { ko: '여행 계획부터 현지 정보까지', zh: '从旅行计划到当地信息', en: 'From travel plans to local info' }, size: 'lg' },
      { id: 'koreanfood', name: { ko: '한식백과', zh: '韩食百科', en: 'Korean Food Guide' }, icon: '🍲', description: { ko: '126가지 한식 메뉴 가이드', zh: '126种韩餐菜单指南', en: 'Guide to 126 Korean dishes' }, size: 'lg' },
      { id: 'food', name: { ko: '맛집', zh: '美食', en: 'Food' }, icon: '🍜', description: { ko: '미슐랭부터 블루리본까지', zh: '从米其林到蓝丝带', en: 'From Michelin to Blue Ribbon' }, size: 'lg' },
      { id: 'trip', name: { ko: '여행 큐레이션', zh: '旅行精选', en: 'Travel Picks' }, icon: '🎫', description: { ko: '인기 체험 & 할인 티켓', zh: '热门体验 & 折扣门票', en: 'Popular experiences & discounted tickets' }, size: 'lg' },
      { id: 'festival', name: { ko: '축제/이벤트', zh: '节日/活动', en: 'Festivals' }, icon: '🎊', description: { ko: '이번 주 축제', zh: '本周节日', en: "This week's festivals" }, size: 'md' },
      { id: 'holiday', name: { ko: '한국 공휴일 캘린더', zh: '韩国公休日日历', en: 'Korean Holiday Calendar' }, icon: '📅', description: { ko: '네이버 달력 스타일', zh: 'Naver日历风格', en: 'Naver Calendar style' }, size: 'lg' },
      { id: 'themepark', name: { ko: '놀이공원 할인', zh: '游乐园折扣', en: 'Theme Park Deals' }, icon: '🎡', description: { ko: '롯데월드, 에버랜드 할인 꿀팁', zh: '乐天世界、爱宝乐园折扣攻略', en: 'Lotte World, Everland discount tips' }, size: 'md' },
    ],
  },
  {
    id: 'hallyu-entertainment',
    name: { ko: '한류 & 엔터', zh: '韩流 & 娱乐', en: 'Hallyu & Entertainment' },
    icon: '⭐',
    pockets: [
      { id: 'kpop', name: { ko: 'K-POP 차트', zh: 'K-POP排行榜', en: 'K-POP Chart' }, icon: '🎵', description: { ko: '실시간 음원 차트', zh: '实时音源排行', en: 'Real-time music chart' }, size: 'md' },
      { id: 'idol', name: { ko: '최애 스타', zh: '我的偶像', en: 'My Star' }, icon: '🌟', description: { ko: '아이돌/배우 스케줄', zh: '偶像/演员日程', en: 'Idol/actor schedule' }, size: 'lg' },
      { id: 'drama', name: { ko: '예능/드라마', zh: '综艺/韩剧', en: 'Shows & Dramas' }, icon: '📺', description: { ko: '방영 일정', zh: '播出日程', en: 'Airing schedule' }, size: 'md' },
      { id: 'fanevent', name: { ko: '팬 이벤트', zh: '粉丝活动', en: 'Fan Events' }, icon: '🎤', description: { ko: '콘서트/팬싸', zh: '演唱会/签名会', en: 'Concerts & fan signs' }, size: 'sm' },
      { id: 'tradition', name: { ko: '한국 전통 체험', zh: '韩国传统体验', en: 'Korean Traditional Experience' }, icon: '🏛️', description: { ko: '요리·문화·계절 체험', zh: '料理·文化·季节体验', en: 'Cooking, culture & seasonal activities' }, size: 'lg' },
    ],
  },
  {
    id: 'shopping-beauty',
    name: { ko: '쇼핑 & 뷰티', zh: '购物 & 美妆', en: 'Shopping & Beauty' },
    icon: '🛍️',
    pockets: [
      { id: 'shopping', name: { ko: '쇼핑탭', zh: '购物标签', en: 'Shopping Tab' }, icon: '🛍️', description: { ko: '한국에서 스마트하게 쇼핑하기', zh: '在韩国聪明购物', en: 'Shop smart in Korea' }, size: 'lg' },
      { id: 'beauty', name: { ko: 'K-뷰티', zh: 'K-美妆', en: 'K-Beauty' }, icon: '💄', description: { ko: '올리브영 매장 찾기 & 해외 배송', zh: 'Olive Young门店 & 海外配送', en: 'Olive Young stores & global shipping' }, size: 'lg' },
      { id: 'fashiontrend', name: { ko: 'K-패션', zh: 'K-时尚', en: 'K-Fashion' }, icon: '👕', description: { ko: '무신사/W컨셉/29CM 쇼핑', zh: 'MUSINSA/W Concept/29CM购物', en: 'MUSINSA/W Concept/29CM shopping' }, size: 'lg' },
      { id: 'taxrefund', name: { ko: '택스리펀드', zh: '退税指南', en: 'Tax Refund' }, icon: '💰', description: { ko: '환급 계산기 & 공항 안내', zh: '退税计算器 & 机场指南', en: 'Refund calculator & airport guide' }, size: 'lg' },
    ],
  },
  {
    id: 'daily-life',
    name: { ko: '생활', zh: '生活', en: 'Daily Life' },
    icon: '🏠',
    pockets: [
      { id: 'medical', name: { ko: '의료', zh: '医疗', en: 'Medical' }, icon: '🏥', description: { ko: '병원 검색, 건강보험, 응급실', zh: '医院搜索、健康保险、急诊室', en: 'Hospital search, insurance, ER' }, size: 'lg' },
      { id: 'delivery', name: { ko: '배달 주문', zh: '点外卖', en: 'Food Delivery' }, icon: '🛵', description: { ko: '배달앱 주문 & 이용 가이드', zh: '外卖App下单 & 使用指南', en: 'Delivery apps & how-to guide' }, size: 'lg' },
      { id: 'pet', name: { ko: '펫 입국가이드', zh: '宠物入境指南', en: 'Pet Entry Guide' }, icon: '🐾', description: { ko: '반려동물 한국 입국 절차', zh: '宠物入境韩国流程', en: 'Pet import to Korea process' }, size: 'lg' },
      { id: 'parcel', name: { ko: '택배', zh: '快递', en: 'Parcel' }, icon: '📦', description: { ko: '택배 보내기/조회', zh: '快递寄送/查询', en: 'Send & Track packages' }, size: 'md' },
      { id: 'cvsnew', name: { ko: '편의점 신상', zh: '便利店新品', en: 'CVS New Items' }, icon: '🛒', description: { ko: 'CU/GS25/세븐일레븐 신상품', zh: 'CU/GS25/7-ELEVEN新品', en: 'New convenience store items' }, size: 'md' },
    ],
  },
  {
    id: 'tools',
    name: { ko: '도구', zh: '工具', en: 'Tools' },
    icon: '🔧',
    pockets: [
      { id: 'translator', name: { ko: '통역', zh: '翻译', en: 'Translate' }, icon: '🔄', description: { ko: '실시간 통역과 간판 사전', zh: '实时翻译和招牌词典', en: 'Real-time translation and sign dictionary' }, size: 'lg' },
      { id: 'finance', name: { ko: '금융', zh: '金融', en: 'Finance' }, icon: '💵', description: { ko: '은행, 송금, 신용, 세금 완벽 가이드', zh: '银行、汇款、信用、税务完整指南', en: 'Complete guide to banking, remittance, credit, tax' }, size: 'lg' },
      { id: 'wallet', name: { ko: '월렛', zh: '钱包', en: 'Wallet' }, icon: '👛', description: { ko: '신분증, 서류, 이름을 한곳에서', zh: '证件、文件、姓名，一处管理', en: 'IDs, docs, and names in one place' }, size: 'lg' },
      { id: 'visaalert', name: { ko: '비자 알림', zh: '签证提醒', en: 'Visa Alert' }, icon: '⏰', description: { ko: '비자 만료일 관리와 스마트 알림', zh: '签证到期日管理和智能提醒', en: 'Visa expiry management and smart alerts' }, size: 'lg' },
    ],
  },
]

// Mock data for pocket content rendering (기존 데이터 유지)
export const pocketMockData = {
  restaurant: {
    weekLabel: { ko: '큐레이션 준비 중', zh: '精选准备中', en: 'Curation in progress' },
    items: [
      {
        name: { ko: '을지로 노가리 골목', zh: '乙支路小鱼干街', en: 'Euljiro Nogari Alley' },
        area: { ko: '을지로', zh: '乙支路', en: 'Euljiro' },
        category: { ko: '포장마차/안주', zh: '路边摊/下酒菜', en: 'Street Food/Bar Snacks' },
        naverLink: 'https://map.naver.com/v5/search/을지로노가리골목',
        xhsLink: '',
      },
      {
        name: { ko: '광장시장 빈대떡', zh: '广藏市场绿豆饼', en: 'Gwangjang Market Bindaetteok' },
        area: { ko: '종로', zh: '钟路', en: 'Jongno' },
        category: { ko: '전통시장', zh: '传统市场', en: 'Traditional Market' },
        naverLink: 'https://map.naver.com/v5/search/광장시장빈대떡',
        xhsLink: '',
      },
      {
        name: { ko: '이태원 경리단길 브런치', zh: '梨泰院经理团路早午餐', en: 'Itaewon Gyeongridan Brunch' },
        area: { ko: '이태원', zh: '梨泰院', en: 'Itaewon' },
        category: { ko: '브런치/카페', zh: '早午餐/咖啡', en: 'Brunch/Café' },
        naverLink: 'https://map.naver.com/v5/search/경리단길브런치',
        xhsLink: '',
      },
      {
        name: { ko: '명동 칼국수 골목', zh: '明洞刀削面胡同', en: 'Myeongdong Kalguksu Alley' },
        area: { ko: '명동', zh: '明洞', en: 'Myeongdong' },
        category: { ko: '한식', zh: '韩餐', en: 'Korean' },
        naverLink: 'https://map.naver.com/v5/search/명동칼국수골목',
        xhsLink: '',
      },
      {
        name: { ko: '홍대 연남동 파스타', zh: '弘大延南洞意面', en: 'Hongdae Yeonnam Pasta' },
        area: { ko: '연남동', zh: '延南洞', en: 'Yeonnam-dong' },
        category: { ko: '양식', zh: '西餐', en: 'Western' },
        naverLink: 'https://map.naver.com/v5/search/연남동파스타맛집',
        xhsLink: '',
      },
    ],
  },
  coupon: {
    title: { ko: '할인 & 쿠폰', zh: '折扣与优惠券', en: 'Deals & Coupons' },
    categories: [
      {
        name: { ko: '면세점', zh: '免税店', en: 'Duty Free' },
        items: [
          { label: { ko: '롯데 면세점 쿠폰', zh: '乐天免税店优惠券', en: 'Lotte Duty Free Coupon' }, url: 'https://kor.lottedfs.com/kr/event/coupon', badge: 'HOT' },
          { label: { ko: '신라 면세점 쿠폰', zh: '新罗免税店优惠券', en: 'Shilla Duty Free Coupon' }, url: 'https://www.shilladfs.com/estore/kr/ko/event/coupon' },
        ]
      },
      {
        name: { ko: '뷰티', zh: '美妆', en: 'Beauty' },
        items: [
          { label: { ko: '올리브영 글로벌몰', zh: 'Olive Young全球商城', en: 'Olive Young Global' }, url: 'https://global.oliveyoung.com', badge: '추천' },
          { label: { ko: '시코르 할인', zh: 'CHICOR折扣', en: 'CHICOR Deals' }, url: 'https://www.chicor.com' },
        ]
      },
      {
        name: { ko: '여행/체험', zh: '旅行/体验', en: 'Travel' },
        items: [
          { label: { ko: 'Klook 한국 체험', zh: 'Klook韩国体验', en: 'Klook Korea' }, url: 'https://www.klook.com/ko/country/korea/', badge: '할인' },
          { label: { ko: 'Trip.com 특가', zh: 'Trip.com特价', en: 'Trip.com Deals' }, url: 'https://kr.trip.com' },
        ]
      },
      {
        name: { ko: '쇼핑', zh: '购物', en: 'Shopping' },
        items: [
          { label: { ko: 'WOWPASS 환전+결제', zh: 'WOWPASS换汇+支付', en: 'WOWPASS Exchange+Pay' }, url: 'https://www.wowpass.io' },
          { label: { ko: '카카오 선물하기 할인', zh: 'Kakao礼物折扣', en: 'Kakao Gift Deals' }, url: 'https://gift.kakao.com' },
        ]
      },
    ]
  },
  currency: {
    cnyToKrw: 191.52,
    usdToKrw: 1384.50,
    jpyToKrw: 9.21,
    change: '+0.8%',
    updated: '14:30',
  },
  timezone: {
    seoul: '14:30',
    beijing: '13:30',
    diff: '-1h',
  },
  holiday: {
    next: { ko: '삼일절', zh: '三一节', en: 'March 1st Movement Day' },
    date: '2026-03-01',
    daysUntil: 10,
    upcoming: [
      { name: { ko: '삼일절', zh: '三一节', en: 'Independence Day' }, date: '3/1' },
      { name: { ko: '어린이날', zh: '儿童节', en: "Children's Day" }, date: '5/5' },
    ],
  },
  trip: {
    items: [
      { emoji: 'Ferris wheel', name: { ko: '에버랜드 1일권', zh: '爱宝乐园一日票', en: 'Everland Day Pass' }, originalPrice: '₩52,000', price: '₩38,000', link: 'https://www.klook.com/ko/activity/1563-everland-ticket/', badge: { ko: 'Popular', zh: 'Popular', en: 'Popular' }, bgColor: 'bg-green-100' },
      { emoji: 'Castle', name: { ko: '롯데월드 입장권', zh: '乐天世界门票', en: 'Lotte World Ticket' }, originalPrice: '₩59,000', price: '₩42,000', link: 'https://www.klook.com/ko/activity/1552-lotte-world-ticket/', badge: { ko: 'Pick', zh: 'Pick', en: 'Pick' }, bgColor: 'bg-blue-100' },
      { emoji: 'Hanbok', name: { ko: '한복 체험', zh: '韩服体验', en: 'Hanbok Experience' }, price: '₩15,000~', link: 'https://www.klook.com/ko/search?query=hanbok', badge: { ko: 'Photo', zh: 'Photo', en: 'Photo' }, bgColor: 'bg-pink-100' },
      { emoji: 'Train', name: { ko: 'KTX 패스', zh: 'KTX通票', en: 'KTX Rail Pass' }, price: '₩121,000~', link: 'https://www.klook.com/ko/search?query=ktx+pass', badge: { ko: 'Transit', zh: 'Transit', en: 'Transit' }, bgColor: 'bg-indigo-100' },
      { emoji: 'Mountain', name: { ko: 'DMZ 투어', zh: 'DMZ之旅', en: 'DMZ Tour' }, price: '₩65,000~', link: 'https://www.klook.com/ko/search?query=dmz+tour', badge: { ko: 'Must', zh: 'Must', en: 'Must' }, bgColor: 'bg-amber-100' },
      { emoji: 'Ship', name: { ko: '한강 크루즈', zh: '汉江游轮', en: 'Han River Cruise' }, price: '₩16,000~', link: 'https://www.klook.com/ko/search?query=han+river+cruise', bgColor: 'bg-cyan-100' },
      { emoji: 'Spa', name: { ko: '찜질방 체험', zh: '汗蒸房体验', en: 'Jjimjilbang Experience' }, price: '₩12,000~', link: 'https://www.klook.com/ko/search?query=jjimjilbang', bgColor: 'bg-orange-100' },
      { emoji: 'Island', name: { ko: '제주도 패키지', zh: '济州岛套餐', en: 'Jeju Island Package' }, price: '₩89,000~', link: 'https://www.klook.com/ko/search?query=jeju', bgColor: 'bg-emerald-100' },
    ],
    platforms: [
      { name: 'Klook', url: 'https://www.klook.com/ko/?aid=aff_3219_hp&utm_source=hanpocket&utm_medium=app', badge: 'Alipay/WeChat Pay OK' },
      { name: 'KKday', url: 'https://www.kkday.com/ko?cid=aff_4327_hp&utm_source=hanpocket', badge: 'Alipay OK' },
      { name: 'Trip.com', url: 'https://www.trip.com/travel-guide/south-korea/?promo=aff_1892_hp&locale=ko-KR', badge: 'Alipay/WeChat/UnionPay OK' }
    ],
  },
  festival: {
    items: [
      {
        name: { ko: '서울빛초롱축제', zh: '首尔灯笼节', en: 'Seoul Lantern Festival' },
        location: { ko: '서울 청계천', zh: '首尔清溪川', en: 'Cheonggyecheon, Seoul' },
        category: { ko: '축제', zh: '节日', en: 'Festival' },
        categoryColor: 'bg-amber-100 text-amber-700',
        emoji: 'Lantern',
        ticketLink: 'https://www.klook.com/ko/search?query=seoul+lantern&aid=aff_3219_hp&utm_source=hanpocket&utm_medium=app',
        updating: true,
      },
      {
        name: { ko: '진해군항제 (벚꽃)', zh: '镇海军港节（樱花）', en: 'Jinhae Cherry Blossom Festival' },
        location: { ko: '경남 창원시 진해구', zh: '庆南昌原市镇海区', en: 'Jinhae, Changwon' },
        category: { ko: '축제', zh: '节日', en: 'Festival' },
        categoryColor: 'bg-pink-100 text-pink-700',
        emoji: 'Flower2',
        ticketLink: 'https://www.kkday.com/ko/product/searchresult?keyword=jinhae+cherry+blossom&cid=aff_4327_hp&utm_source=hanpocket',
        updating: true,
      },
      {
        name: { ko: '서울재즈페스티벌', zh: '首尔爵士音乐节', en: 'Seoul Jazz Festival' },
        location: { ko: '서울 올림픽공원', zh: '首尔奥林匹克公园', en: 'Olympic Park, Seoul' },
        category: { ko: '공연', zh: '演出', en: 'Performance' },
        categoryColor: 'bg-purple-100 text-purple-700',
        emoji: 'Music',
        ticketLink: 'https://www.klook.com/ko/search?query=seoul+jazz+festival&aid=aff_3219_hp&utm_source=hanpocket&utm_medium=app',
        updating: true,
      },
      {
        name: { ko: '보령머드축제', zh: '保宁泥浆节', en: 'Boryeong Mud Festival' },
        location: { ko: '충남 보령시 대천해수욕장', zh: '忠南保宁市大川海水浴场', en: 'Daecheon Beach, Boryeong' },
        category: { ko: '체험', zh: '体验', en: 'Experience' },
        categoryColor: 'bg-orange-100 text-orange-700',
        emoji: 'Umbrella',
        ticketLink: 'https://www.klook.com/ko/search?query=boryeong+mud+festival&aid=aff_3219_hp&utm_source=hanpocket&utm_medium=app',
        updating: true,
      },
      {
        name: { ko: '부산국제영화제', zh: '釜山国际电影节', en: 'Busan Intl Film Festival' },
        location: { ko: '부산 해운대 영화의전당', zh: '釜山海云台电影殿堂', en: 'Busan Cinema Center' },
        category: { ko: '전시', zh: '展览', en: 'Exhibition' },
        categoryColor: 'bg-blue-100 text-blue-700',
        emoji: 'Clapperboard',
        ticketLink: 'https://www.kkday.com/ko/product/searchresult?keyword=busan+film+festival&cid=aff_4327_hp&utm_source=hanpocket',
        updating: true,
      },
      {
        name: { ko: '수원화성문화제', zh: '水原华城文化节', en: 'Suwon Hwaseong Cultural Festival' },
        location: { ko: '경기 수원시 화성행궁', zh: '京畿水原市华城行宫', en: 'Hwaseong Haenggung, Suwon' },
        category: { ko: '축제', zh: '节日', en: 'Festival' },
        categoryColor: 'bg-emerald-100 text-emerald-700',
        emoji: 'Landmark',
        ticketLink: 'https://www.klook.com/ko/search?query=suwon+hwaseong&aid=aff_3219_hp&utm_source=hanpocket&utm_medium=app',
        updating: true,
      },
    ],
  },
  tradition: {
    categories: [
      { id: 'cooking', label: { ko: '요리', zh: '料理', en: 'Cooking' } },
      { id: 'culture', label: { ko: '문화', zh: '文化', en: 'Culture' } },
      { id: 'seasonal', label: { ko: '계절', zh: '季节', en: 'Seasonal' } },
    ],
    items: [
      // 요리 체험
      { category: 'cooking', name: { ko: '김치 만들기 체험', zh: '制作泡菜体验', en: 'Kimchi Making Experience' }, location: { ko: '종로/인사동 일대', zh: '钟路/仁寺洞一带', en: 'Jongno / Insadong area' }, price: '₩30,000~50,000', duration: { ko: '1.5~2시간', zh: '1.5~2小时', en: '1.5-2 hours' }, bookUrl: 'https://www.klook.com/ko/search?query=kimchi+making+seoul&aid=aff_3219_hp&utm_source=hanpocket&utm_medium=app', tripUrl: 'https://www.trip.com/travel-guide/seoul/kimchi-making/?promo=aff_1892_hp&locale=ko-KR', searchQuery: '김치만들기체험' },
      { category: 'cooking', name: { ko: '한국요리 쿠킹클래스', zh: '韩国料理烹饪课', en: 'Korean Cooking Class' }, location: { ko: '서울 각지', zh: '首尔各地', en: 'Various locations, Seoul' }, price: '₩40,000~70,000', duration: { ko: '2시간', zh: '2小时', en: '2 hours' }, bookUrl: 'https://www.klook.com/ko/search?query=korean+cooking+class+seoul&aid=aff_3219_hp&utm_source=hanpocket&utm_medium=app', tripUrl: 'https://www.trip.com/travel-guide/seoul/cooking-class/?promo=aff_1892_hp&locale=ko-KR', searchQuery: '한국요리쿠킹클래스' },
      { category: 'cooking', name: { ko: '전통 떡 만들기', zh: '传统年糕制作', en: 'Traditional Rice Cake Making' }, location: { ko: '서울 각지', zh: '首尔各地', en: 'Various locations, Seoul' }, price: '₩30,000~40,000', duration: { ko: '1~1.5시간', zh: '1~1.5小时', en: '1-1.5 hours' }, bookUrl: 'https://www.klook.com/ko/search?query=rice+cake+making+seoul&aid=aff_3219_hp&utm_source=hanpocket&utm_medium=app', searchQuery: '전통떡만들기체험' },
      { category: 'cooking', name: { ko: '막걸리/전통주 빚기', zh: '酿造米酒/传统酒', en: 'Makgeolli / Traditional Liquor Brewing' }, location: { ko: '서울 각지', zh: '首尔各地', en: 'Various locations, Seoul' }, price: '₩30,000~50,000', duration: { ko: '2시간', zh: '2小时', en: '2 hours' }, bookUrl: 'https://www.klook.com/ko/search?query=makgeolli+brewing+seoul&aid=aff_3219_hp&utm_source=hanpocket&utm_medium=app', searchQuery: '막걸리빚기체험' },
      // 문화 체험
      { category: 'culture', name: { ko: '한복 대여 & 체험', zh: '韩服租赁 & 体验', en: 'Hanbok Rental & Experience' }, location: { ko: '경복궁/북촌 일대', zh: '景福宫/北村一带', en: 'Gyeongbokgung / Bukchon area' }, price: '₩10,000~30,000', duration: { ko: '2~4시간 대여', zh: '租赁2~4小时', en: '2-4 hours rental' }, bookUrl: 'https://www.klook.com/ko/activity/19527-hanbok-rental-seoul/?aid=aff_3219_hp&utm_source=hanpocket&utm_medium=app', tripUrl: 'https://www.trip.com/travel-guide/seoul/hanbok/?promo=aff_1892_hp&locale=ko-KR', searchQuery: '한복대여체험' },
      { category: 'culture', name: { ko: '한지 공예', zh: '韩纸工艺', en: 'Hanji (Korean Paper) Craft' }, location: { ko: '서울 각지', zh: '首尔各地', en: 'Various locations, Seoul' }, price: '₩20,000~30,000', duration: { ko: '1~2시간', zh: '1~2小时', en: '1-2 hours' }, bookUrl: 'https://www.klook.com/ko/search?query=hanji+craft+seoul&aid=aff_3219_hp&utm_source=hanpocket&utm_medium=app', searchQuery: '한지공예체험' },
      { category: 'culture', name: { ko: '도자기/도예 체험', zh: '陶瓷/陶艺体验', en: 'Pottery / Ceramics Experience' }, location: { ko: '서울 각지', zh: '首尔各地', en: 'Various locations, Seoul' }, price: '₩30,000~50,000', duration: { ko: '1.5~2시간', zh: '1.5~2小时', en: '1.5-2 hours' }, bookUrl: 'https://www.klook.com/ko/search?query=pottery+experience+seoul&aid=aff_3219_hp&utm_source=hanpocket&utm_medium=app', searchQuery: '도자기체험' },
      { category: 'culture', name: { ko: '서예 체험', zh: '书法体験', en: 'Calligraphy Experience' }, location: { ko: '서울 각지', zh: '首尔各地', en: 'Various locations, Seoul' }, price: '₩20,000~30,000', duration: { ko: '1시간', zh: '1小时', en: '1 hour' }, bookUrl: 'https://www.klook.com/ko/search?query=calligraphy+seoul&aid=aff_3219_hp&utm_source=hanpocket&utm_medium=app', searchQuery: '서예체험' },
      { category: 'culture', name: { ko: '태권도 체험', zh: '跆拳道体验', en: 'Taekwondo Experience' }, location: { ko: '서울 각지', zh: '首尔各地', en: 'Various locations, Seoul' }, price: '₩20,000~40,000', duration: { ko: '1~2시간', zh: '1~2小时', en: '1-2 hours' }, bookUrl: 'https://www.klook.com/ko/search?query=taekwondo+experience+seoul&aid=aff_3219_hp&utm_source=hanpocket&utm_medium=app', searchQuery: '태권도체험' },
      { category: 'culture', name: { ko: '템플스테이', zh: '寺庙寄宿', en: 'Temple Stay' }, location: { ko: '전국 사찰', zh: '全国寺庙', en: 'Temples nationwide' }, price: '₩50,000~80,000', duration: { ko: '1박', zh: '1晚', en: '1 night' }, bookUrl: 'https://www.templestay.com/?ref=hanpocket&aff_id=aff_7890_hp', tripUrl: 'https://www.trip.com/travel-guide/south-korea/temple-stay/?promo=aff_1892_hp&locale=ko-KR', searchQuery: '템플스테이' },
      // 계절 체험
      { category: 'seasonal', name: { ko: '딸기 따기 (12~4월)', zh: '采草莓 (12~4月)', en: 'Strawberry Picking (Dec-Apr)' }, location: { ko: '서울 근교', zh: '首尔근교', en: 'Seoul suburbs' }, price: '₩15,000~25,000', duration: { ko: '1~2시간', zh: '1~2小时', en: '1-2 hours' }, bookUrl: 'https://www.klook.com/ko/search?query=strawberry+picking+seoul&aid=aff_3219_hp&utm_source=hanpocket&utm_medium=app', searchQuery: '딸기따기체험' },
      { category: 'seasonal', name: { ko: '한강 피크닉 세트', zh: '汉江野餐套装', en: 'Han River Picnic Set' }, location: { ko: '한강공원', zh: '汉江公园', en: 'Han River Park' }, price: '₩30,000~50,000', duration: { ko: '자유', zh: '自由', en: 'Flexible' }, bookUrl: 'https://www.klook.com/ko/search?query=han+river+picnic&aid=aff_3219_hp&utm_source=hanpocket&utm_medium=app', searchQuery: '한강피크닉세트' },
    ],
  },
  pet: {
    checklist: [
      { id: 'microchip', label: { ko: '마이크로칩 삽입', zh: '植入芯片', en: 'Microchip implant' }, icon: 'Syringe' },
      { id: 'vaccine', label: { ko: '광견병 예방접종', zh: '狂犬病疫苗', en: 'Rabies vaccination' }, icon: 'Pill' },
      { id: 'antibody', label: { ko: '항체가 검사', zh: '抗体检测', en: 'Antibody test' }, icon: 'Microscope' },
      { id: 'health', label: { ko: '건강증명서', zh: '健康证明', en: 'Health certificate' }, icon: 'ClipboardList' },
      { id: 'quarantine', label: { ko: '검역증명서', zh: '检疫证明', en: 'Quarantine cert' }, icon: 'FileCheck' },
    ],
  },
  parcel: {
    status: { ko: '택배', zh: '快递', en: 'Parcel' },
    sample: { ko: 'EMS: 배송 중 (인천 → 서울)', zh: 'EMS: 配送中 (仁川 → 首尔)', en: 'EMS: In transit (Incheon → Seoul)' },
    carriers: ['EMS', 'SF Express', 'CJ대한통운', 'YTO (圆通)'],
  },
  emergency: {
    items: [
      { label: '112', desc: { ko: '경찰', zh: '警察', en: 'Police' }, icon: 'Shield' },
      { label: '119', desc: { ko: '소방/응급', zh: '消防/急救', en: 'Fire/Emergency' }, icon: 'Truck' },
      { label: '1345', desc: { ko: '외국인종합안내', zh: '外国人综合咨询', en: 'Foreigner Helpline' }, icon: 'Phone' },
    ],
  },
  accommodation: {
    platforms: [
      {
        name: { ko: '야놀자', zh: '夜猫子', en: 'Yanolja' },
        description: { ko: '국내 1위 숙박 플랫폼', zh: '韩国第一住宿平台', en: 'Korea #1 booking platform' },
        url: 'https://www.yanolja.com/?utm_source=hanpocket&aff_id=aff_4567_hp',
        badge: { ko: '국내 최저가', zh: '国内最低价', en: 'Best price in Korea' },
        logo: 'yanolja-logo.png'
      },
      {
        name: { ko: '여기어때', zh: '这里如何', en: 'Goodchoice' },
        description: { ko: '다양한 숙박 옵션', zh: '多样住宿选择', en: 'Various accommodation options' },
        url: 'https://www.goodchoice.kr/?utm_source=hanpocket&aff_id=aff_8901_hp',
        badge: { ko: '할인 쿠폰', zh: '优惠券', en: 'Discount coupons' },
        logo: 'goodchoice-logo.png'
      },
      {
        name: { ko: 'Booking.com', zh: 'Booking.com', en: 'Booking.com' },
        description: { ko: '전 세계 숙박 예약', zh: '全球住宿预订', en: 'Worldwide accommodation' },
        url: 'https://www.booking.com/country/kr.html?aid=1234567&utm_source=hanpocket',
        badge: { ko: 'Global', zh: 'Global', en: 'Global' },
        logo: 'booking-logo.png'
      }
    ],
    popularAreas: [
      { name: { ko: '홍대', zh: '弘大', en: 'Hongdae' }, avgPrice: '₩45,000~80,000', description: { ko: '대학가 분위기', zh: '大学街氛围', en: 'University district vibe' } },
      { name: { ko: '강남', zh: '江南', en: 'Gangnam' }, avgPrice: '₩60,000~120,000', description: { ko: '현대적인 지역', zh: '现代化地区', en: 'Modern district' } },
      { name: { ko: '명동', zh: '明洞', en: 'Myeongdong' }, avgPrice: '₩50,000~90,000', description: { ko: '쇼핑 중심가', zh: '购物中心', en: 'Shopping district' } },
      { name: { ko: '인사동', zh: '仁寺洞', en: 'Insadong' }, avgPrice: '₩40,000~70,000', description: { ko: '전통 문화 거리', zh: '传统文化街', en: 'Traditional culture street' } }
    ]
  },
}

// Feature completion scores from docs/feature-review-10k*.md
export const featureScores = {
  travel: 84,     // 수정중 (70-84)
  food: 87,       // 완료 (85+)
  shopping: 91,   // 완료 (85+)
  hallyu: 92,     // 완료 (85+)
  medical: 90,    // 완료 (85+)
  translator: 92.5, // 완료 (85+)
  finance: 87,    // 완료 (85+)
  wallet: 95,     // 완료 (85+)
  visaalert: 86,  // 완료 (85+)
}

// Service items (exploreItems + toolItems from App.jsx but without dynamic labels)
export const serviceItems = [
  // Explore items
  { id: 'travel', name: { ko: '여행', zh: '旅行', en: 'Travel' }, category: 'explore' },
  { id: 'food', name: { ko: '맛집', zh: '美食', en: 'Food' }, category: 'explore' },
  { id: 'shopping', name: { ko: '쇼핑', zh: '购物', en: 'Shopping' }, category: 'explore' },
  { id: 'hallyu', name: { ko: '한류', zh: '韩流', en: 'Hallyu' }, category: 'explore' },
  { id: 'medical', name: { ko: '의료', zh: '医疗', en: 'Medical' }, category: 'explore' },

  // Tool items
  { id: 'translator', name: { ko: '통역', zh: '翻译', en: 'Translate' }, category: 'tool' },
  { id: 'finance', name: { ko: '금융', zh: '金融', en: 'Finance' }, category: 'tool' },
  { id: 'wallet', name: { ko: '월렛', zh: '钱包', en: 'Wallet' }, category: 'tool' },
  { id: 'visaalert', name: { ko: '비자 알림', zh: '签证提醒', en: 'Visa Alert' }, category: 'tool' },
]

// Sub-menu data (from App.jsx but as data structure, not JSX)
export const subMenuData = {
  transition: {
    title: { ko: '비자 · 서류', zh: '签证 · 文件', en: 'Visa · Docs' },
    items: [
      { label: { ko: '비자 종류별 안내', zh: '签证类型指南', en: 'Visa Types' }, action: 'visaTypes' },
      { label: { ko: '비자 변경/전환', zh: '签证变更', en: 'Visa Change' }, action: 'visaChange' },
      { label: { ko: 'D-day 알림', zh: 'D-day提醒', en: 'D-day Alert' }, action: 'visaalert' },
      { label: { ko: '서류 대행', zh: '文件代办', en: 'Document Services' }, action: 'agency' },
    ],
  },
  travel: {
    title: { ko: '여행', zh: '旅行', en: 'Travel' },
    items: [
      { label: { ko: '입국 가이드', zh: '入境指南', en: 'Arrival Guide' } },
      { label: { ko: '도시 가이드', zh: '城市指南', en: 'City Guides' } },
      { label: { ko: '교통', zh: '交通', en: 'Transportation' } },
      { label: { ko: '숙소', zh: '住宿', en: 'Accommodation' } },
      { label: { ko: '코스 추천', zh: '行程推荐', en: 'Itineraries' } },
      { label: { ko: '테마파크', zh: '主题公园', en: 'Theme Parks' } },
    ],
  },
  food: {
    title: { ko: '맛집', zh: '美食', en: 'Food' },
    items: [
      { label: { ko: '미슐랭 가이드', zh: '米其林指南', en: 'Michelin Guide' } },
      { label: { ko: '블루리본', zh: '蓝丝带', en: 'Blue Ribbon' } },
      { label: { ko: '지역별', zh: '按地区', en: 'By Area' } },
      { label: { ko: '종류별', zh: '按类型', en: 'By Cuisine' } },
      { label: { ko: '가격대별', zh: '按价格', en: 'By Price' } },
      { label: { ko: '범범뻠 PICK', zh: '范范呗精选', en: "Editor's Pick" } },
    ],
  },
  shopping: {
    title: { ko: '쇼핑', zh: '购物', en: 'Shopping' },
    items: [
      { label: { ko: 'K-뷰티', zh: 'K-Beauty', en: 'K-Beauty' } },
      { label: { ko: 'K-패션', zh: 'K-Fashion', en: 'K-Fashion' } },
      { label: { ko: '면세/택스리펀', zh: '免税/退税', en: 'Duty-free/Tax Refund' } },
      { label: { ko: '할인/쿠폰', zh: '折扣/优惠', en: 'Coupons' } },
    ],
  },
  hallyu: {
    title: { ko: '한류', zh: '韩流', en: 'Hallyu' },
    items: [
      { label: { ko: 'K-POP 차트', zh: 'K-POP榜单', en: 'K-POP Chart' } },
      { label: { ko: '내 아이돌', zh: '我的爱豆', en: 'My Idols' } },
      { label: { ko: 'K-드라마', zh: '韩剧', en: 'K-Drama' } },
      { label: { ko: '팬 이벤트', zh: '粉丝活动', en: 'Fan Events' } },
      { label: { ko: '전통 체험', zh: '传统体验', en: 'Traditional' } },
      { label: { ko: '축제', zh: '节日', en: 'Festivals' } },
    ],
  },
  life: {
    title: { ko: '생활', zh: '生活', en: 'Life' },
    items: [
      { label: { ko: '환율 계산기', zh: '汇率计算器', en: 'Currency' } },
      { label: { ko: '택배/배송', zh: '快递/配送', en: 'Delivery' } },
      { label: { ko: '의료/병원', zh: '医疗/医院', en: 'Medical' }, action: 'medical' },
      { label: { ko: '통신/SIM', zh: '通信/SIM', en: 'Telecom' } },
      { label: { ko: '금융 가이드', zh: '金融指南', en: 'Finance Guide' }, action: 'finance' },
    ],
  },
  jobs: {
    title: { ko: '구직', zh: '求职', en: 'Jobs' },
    items: [
      { label: { ko: '아르바이트', zh: '兼职', en: 'Part-time' } },
      { label: { ko: '정규직', zh: '全职', en: 'Full-time' } },
      { label: { ko: '취업 가이드', zh: '就业指南', en: 'Job Guide' } },
      { label: { ko: '이력서 변환', zh: '简历转换', en: 'Resume Builder' }, action: 'resume' },
    ],
  },
  housing: {
    title: { ko: '부동산', zh: '房产', en: 'Housing' },
    items: [
      { label: { ko: '원룸/셰어하우스', zh: '单间/合租', en: 'Studio/Share' } },
      { label: { ko: '전월세 가이드', zh: '租房指南', en: 'Rent Guide' } },
      { label: { ko: '실거래가', zh: '实际交易价', en: 'Price Check' } },
    ],
  },
  medical: {
    title: { ko: '의료', zh: '医疗', en: 'Medical' },
    items: [
      { label: { ko: '병원 검색', zh: '医院搜索', en: 'Hospital Search' } },
      { label: { ko: '건강보험 가이드', zh: '健康保险指南', en: 'Health Insurance' } },
      { label: { ko: '응급실 안내', zh: '急诊室指南', en: 'Emergency' } },
      { label: { ko: '외국어 진료', zh: '外语诊疗', en: 'Foreign Language' } },
    ],
  },
  translator: {
    title: { ko: '통역 · 번역', zh: '口译 · 翻译', en: 'Interpreter · Translator' },
    items: [
      { label: { ko: '실시간 통역', zh: '实时口译', en: 'Real-time Translation' }, action: 'translator' },
      { label: { ko: '간판 사전', zh: '招牌词典', en: 'Sign Dictionary' }, action: 'artranslate' },
    ],
  },
  wallet: {
    title: { ko: '디지털 월렛', zh: '数字钱包', en: 'Digital Wallet' },
    items: [
      { label: { ko: '신분증 보관', zh: '证件保管', en: 'ID Storage' }, action: 'wallet' },
      { label: { ko: '이름 관리', zh: '姓名管理', en: 'Name Management' }, action: 'wallet' },
      { label: { ko: '본인인증 가이드', zh: '身份验证指南', en: 'Verification Guide' }, action: 'wallet' },
      { label: { ko: '만료 알림', zh: '到期提醒', en: 'Expiry Alert' }, action: 'wallet' },
    ],
  },
}

// 콘텐츠가 구현된 포켓 ID (이 목록에 없는 포켓은 [更新中] 배지 표시)
export const IMPLEMENTED_POCKETS = new Set([
  // PocketContent.jsx — 전용 컴포넌트
  'restaurant', 'cafe', 'transport', 'convenience', 'shopping', 'accommodation', 'emergency', 'medical', 'koreanfood',
  // WidgetContent.jsx — 실제 위젯 컴포넌트
  'holiday', 'parcel',
])

// Export 별칭 - 기존 코드와의 호환성 유지
export const widgetCategories = pocketCategories
export const widgetMockData = pocketMockData

// Idol data moved to ./idolData.js