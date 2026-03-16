// 팝업스토어 데이터 — 실제 큐레이션 (2026년 3월 기준)
// 데이터 출처: 팝가(popga.co.kr), 성수동고릴라, 팝플리(popply.co.kr)
// 업데이트 주기: 매주 목요일 (수동 큐레이션 + popup-live worker 자동 갱신)

export const DISTRICTS = [
  { id: 'all',       label: { ko: '전체',      zh: '全部',        en: 'All' } },
  { id: 'seongsu',   label: { ko: '성수',       zh: '圣水',        en: 'Seongsu' } },
  { id: 'gangnam',   label: { ko: '강남/압구정', zh: '江南/狎鸥亭',  en: 'Gangnam' } },
  { id: 'hannam',    label: { ko: '한남/이태원', zh: '汉南/梨泰院',  en: 'Hannam' } },
  { id: 'hongdae',   label: { ko: '홍대/연남동', zh: '弘大/延南洞',  en: 'Hongdae' } },
  { id: 'myeongdong',label: { ko: '명동/을지로', zh: '明洞/乙支路',  en: 'Myeongdong' } },
  { id: 'yeouido',   label: { ko: '여의도/한강', zh: '汝矣岛/汉江',  en: 'Yeouido' } },
]

// 지역 정렬 순서 (카드 정렬용)
export const DISTRICT_ORDER = ['seongsu', 'gangnam', 'hannam', 'hongdae', 'myeongdong', 'yeouido']

export const POPUP_STORES = [
  // ── 성수 · 운영 중 ──
  {
    id: 'lush-theater-seongsu',
    brand: 'LUSH',
    title: { ko: 'LUSH 씨어터 팝업', zh: 'LUSH剧场快闪店', en: 'LUSH Theater Popup' },
    district: 'seongsu',
    address: {
      ko: '서울 성동구 연무장길 58-1 러쉬 성수점',
      zh: '首尔城东区연무장길58-1 LUSH圣水店',
      en: '58-1 Yeonmujang-gil, Seongdong-gu',
    },
    period: { start: '2026-01-27', end: '2026-03-31' },
    tags: { ko: ['배스밤', '비건', '뷰티'], zh: ['浴缸炸弹', '纯素', '美妆'], en: ['Bath Bomb', 'Vegan', 'Beauty'] },
    image: 'https://images.unsplash.com/photo-1585421514284-efb74c2b69ba?w=400&h=300&fit=crop',
    hot: false,
    color: '#2E7D32',
    sourceUrl: 'https://kr.lush.com/',
    naverMapUrl: 'nmap://search?query=러쉬%20성수점&appname=kr.hanpocket.app',
    kakaoMapUrl: 'kakaomap://search?q=러쉬%20성수',
  },
  {
    id: 'eql-omnipeople-seongsu',
    brand: 'EQL × Omnipeople',
    title: { ko: 'EQL 옴니피플 빈티지 팝업', zh: 'EQL Omnipeople复古快闪', en: 'EQL Omnipeople Vintage Popup' },
    district: 'seongsu',
    address: {
      ko: '서울 성동구 연무장15길 11',
      zh: '首尔城东区연무장15길11号',
      en: '11 Yeonmujang 15-gil, Seongdong-gu',
    },
    period: { start: '2026-02-06', end: '2026-04-05' },
    tags: { ko: ['빈티지', '패션', '스트리트'], zh: ['复古', '时尚', '街头'], en: ['Vintage', 'Fashion', 'Street'] },
    image: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=400&h=300&fit=crop',
    hot: false,
    color: '#4A4A4A',
    sourceUrl: 'https://eql.kr/',
    naverMapUrl: 'nmap://search?query=EQL%20성수&appname=kr.hanpocket.app',
    kakaoMapUrl: 'kakaomap://search?q=EQL%20옴니피플%20성수',
  },
  {
    id: 'samsung-galaxy-market',
    brand: 'Samsung Galaxy',
    title: { ko: '갤럭시 마켓 이벤트', zh: 'Galaxy市场体验活动', en: 'Galaxy Market Event' },
    district: 'seongsu',
    address: {
      ko: '서울 성동구 연무장1길 7-1 T팩토리 성수',
      zh: '首尔城东区연무장1길7-1 T Factory圣水',
      en: '7-1 Yeonmujang 1-gil, T Factory Seongsu',
    },
    period: { start: '2026-02-27', end: '2026-03-29' },
    tags: { ko: ['갤럭시', '테크', '체험'], zh: ['Galaxy', '科技', '体验'], en: ['Galaxy', 'Tech', 'Experience'] },
    image: 'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=400&h=300&fit=crop',
    hot: true,
    color: '#1565C0',
    sourceUrl: 'https://www.samsung.com/kr/',
    naverMapUrl: 'nmap://search?query=T팩토리%20성수&appname=kr.hanpocket.app',
    kakaoMapUrl: 'kakaomap://search?q=T팩토리%20성수',
  },
  {
    id: 'jo-malone-factorial',
    brand: 'Jo Malone London',
    title: { ko: '조말론 잉글리시 페어', zh: 'Jo Malone英伦集市快闪', en: 'Jo Malone English Fair' },
    district: 'seongsu',
    address: {
      ko: '서울 성동구 연무장7길 13 팩토리얼 성수',
      zh: '首尔城东区연무장7길13 Factorial圣水',
      en: '13 Yeonmujang 7-gil, Factorial Seongsu',
    },
    period: { start: '2026-03-01', end: '2026-03-15' },
    tags: { ko: ['향수', '럭셔리', '뷰티'], zh: ['香水', '奢侈品', '美妆'], en: ['Perfume', 'Luxury', 'Beauty'] },
    image: 'https://images.unsplash.com/photo-1541643600914-78b084683702?w=400&h=300&fit=crop',
    hot: true,
    color: '#8B6914',
    sourceUrl: 'https://www.jomalone.co.kr/',
    naverMapUrl: 'nmap://search?query=조말론%20성수&appname=kr.hanpocket.app',
    kakaoMapUrl: 'kakaomap://search?q=조말론%20성수',
  },
  {
    id: 'nike-airmax-seongsu',
    brand: 'Nike Air Max',
    title: { ko: '나이키 에어맥스 팝업', zh: 'Nike Air Max快闪店', en: 'Nike Air Max Popup' },
    district: 'seongsu',
    address: {
      ko: '서울 성동구 성수이로 74 무신사 대림창고',
      zh: '首尔城东区圣水路74号 Musinsa大林仓库',
      en: '74 Seongsu-iro, Musinsa Daelim Warehouse',
    },
    period: { start: '2026-03-05', end: '2026-03-15' },
    tags: { ko: ['나이키', '스니커즈', '스포츠'], zh: ['耐克', '球鞋', '运动'], en: ['Nike', 'Sneakers', 'Sports'] },
    image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=300&fit=crop',
    hot: true,
    color: '#E53935',
    sourceUrl: 'https://www.nike.com/kr/',
    naverMapUrl: 'nmap://search?query=무신사%20대림창고&appname=kr.hanpocket.app',
    kakaoMapUrl: 'kakaomap://search?q=무신사%20대림창고%20성수',
  },
  {
    id: 'onyu-tough-love',
    brand: '온유 (SHINee)',
    title: { ko: '온유 TOUGH LOVE 팝업', zh: '温流TOUGH LOVE快闪', en: 'Onew TOUGH LOVE Popup' },
    district: 'seongsu',
    address: {
      ko: '서울 성동구 왕십리로 104 영화104',
      zh: '首尔城东区往十里路104号 영화104',
      en: '104 Wangsimni-ro, Yeong-hwa 104',
    },
    period: { start: '2026-03-08', end: '2026-03-15' },
    tags: { ko: ['샤이니', 'K팝', '아이돌', '굿즈'], zh: ['SHINee', 'K-Pop', '爱豆', '周边'], en: ['SHINee', 'K-Pop', 'Idol', 'Merch'] },
    image: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=400&h=300&fit=crop',
    hot: true,
    color: '#6A1B9A',
    sourceUrl: 'https://www.smtown.com/',
    naverMapUrl: 'nmap://search?query=영화104%20성수&appname=kr.hanpocket.app',
    kakaoMapUrl: 'kakaomap://search?q=온유%20팝업%20성수',
  },
  {
    id: 'doosan-bears-snuggle',
    brand: '두산베어스 × Snuggle',
    title: { ko: '두산베어스 × 스너글 팝업', zh: '斗山熊×Snuggle联名快闪', en: 'Doosan Bears × Snuggle Popup' },
    district: 'seongsu',
    address: {
      ko: '서울 성동구 성수이로16길 5 맵달 서울 성수',
      zh: '首尔城东区圣水路16街5号 Mapdal Seoul圣水',
      en: '5 Seongsu-iro 16-gil, Mapdal Seoul Seongsu',
    },
    period: { start: '2026-03-10', end: '2026-03-27' },
    tags: { ko: ['야구', '콜라보', '굿즈'], zh: ['棒球', '联名', '周边'], en: ['Baseball', 'Collab', 'Merch'] },
    image: 'https://images.unsplash.com/photo-1566577739112-5180d4bf9390?w=400&h=300&fit=crop',
    hot: false,
    color: '#1565C0',
    sourceUrl: 'https://www.doosanbears.com/',
    naverMapUrl: 'nmap://search?query=맵달%20성수&appname=kr.hanpocket.app',
    kakaoMapUrl: 'kakaomap://search?q=두산베어스%20팝업%20성수',
  },
  {
    id: 'saero-central-museum',
    brand: '데오가베',
    title: { ko: '세로 팝업 — 중앙박물관', zh: '竖屏快闪—中央博物馆', en: 'Saero Popup — Central Museum' },
    district: 'seongsu',
    address: {
      ko: '서울 성동구 연무장13길 11 데오가베 성수',
      zh: '首尔城东区연무장13길11号 데오가베圣水',
      en: '11 Yeonmujang 13-gil, Deo Gabe Seongsu',
    },
    period: { start: '2026-03-21', end: '2026-04-05' },
    tags: { ko: ['아트', '전시', '사진'], zh: ['艺术', '展览', '摄影'], en: ['Art', 'Exhibition', 'Photo'] },
    image: 'https://images.unsplash.com/photo-1518998053901-5348d3961a04?w=400&h=300&fit=crop',
    hot: false,
    color: '#37474F',
    sourceUrl: 'https://www.instagram.com/seronseoul/',
    naverMapUrl: 'nmap://search?query=데오가베%20성수&appname=kr.hanpocket.app',
    kakaoMapUrl: 'kakaomap://search?q=데오가베%20성수',
  },
  {
    id: 'nike-skims-seongsu',
    brand: 'Nike × SKIMS',
    title: { ko: '나이키스킴스 성수 팝업', zh: 'Nike×SKIMS圣水快闪', en: 'NikeSKIMS Seongsu Popup' },
    district: 'seongsu',
    address: {
      ko: '서울 성동구 연무장5길 20 씬 성수',
      zh: '首尔城东区연무장5길20号 Scene圣水',
      en: '20 Yeonmujang 5-gil, Scene Seongsu',
    },
    period: { start: '2026-02-26', end: '2026-03-09' },
    tags: { ko: ['나이키', '스킴스', '리사'], zh: ['耐克', 'SKIMS', 'LISA'], en: ['Nike', 'SKIMS', 'Lisa'] },
    image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=300&fit=crop',
    hot: true,
    color: '#FF6F00',
    sourceUrl: 'https://www.nike.com/kr/nikeskims',
    naverMapUrl: 'nmap://search?query=씬%20성수&appname=kr.hanpocket.app',
    kakaoMapUrl: 'kakaomap://search?q=나이키스킴스%20성수',
  },

  // ── 홍대 / 연남 ──
  {
    id: 'nikke-kakao-hongdae',
    brand: '승리의여신 니케 × 카카오프렌즈',
    title: { ko: '니케 × 카카오 팝업', zh: '女神异闻录尼克×Kakao联名快闪', en: 'Nikke × Kakao Friends Popup' },
    district: 'hongdae',
    address: {
      ko: '서울 마포구 양화로 162 카카오프렌즈 홍대 플래그십',
      zh: '首尔麻浦区杨花路162号 Kakao Friends弘大旗舰店',
      en: '162 Yanghwa-ro, Kakao Friends Hongdae Flagship',
    },
    period: { start: '2026-03-20', end: '2026-04-02' },
    tags: { ko: ['게임', '캐릭터', '콜라보', '굿즈'], zh: ['游戏', '角色', '联名', '周边'], en: ['Game', 'Character', 'Collab', 'Merch'] },
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop',
    hot: true,
    color: '#FDD835',
    sourceUrl: 'https://store.kakaofriends.com/',
    naverMapUrl: 'nmap://search?query=카카오프렌즈%20홍대&appname=kr.hanpocket.app',
    kakaoMapUrl: 'kakaomap://search?q=카카오프렌즈%20홍대',
  },
  {
    id: 'omniscient-reader-yeonnam',
    brand: '전지적 독자 시점 × SPOT',
    title: { ko: '전독시 팝업 — 연남동', zh: '全知读者视角快闪—延南洞', en: 'Omniscient Reader Popup — Yeonnam' },
    district: 'hongdae',
    address: {
      ko: '서울 마포구 연남동 (연남동 스팟)',
      zh: '首尔麻浦区延南洞 (延南洞SPOT)',
      en: 'Yeonnam-dong, Mapo-gu (SPOT venue)',
    },
    period: { start: '2026-03-14', end: '2026-03-30' },
    tags: { ko: ['웹툰', '소설', '굿즈', '팬덤'], zh: ['漫画', '小说', '周边', '粉丝'], en: ['Webtoon', 'Novel', 'Merch', 'Fandom'] },
    image: 'https://images.unsplash.com/photo-1524578271613-d550eacf6090?w=400&h=300&fit=crop',
    hot: true,
    color: '#1565C0',
    sourceUrl: 'https://series.naver.com/novel/detail.series?productNo=5048479',
    naverMapUrl: 'nmap://search?query=전독시%20팝업%20연남동&appname=kr.hanpocket.app',
    kakaoMapUrl: 'kakaomap://search?q=전독시%20팝업%20연남동',
  },
  {
    id: 'mediheal-hongdae',
    brand: 'MEDIHEAL',
    title: { ko: '메디힐 홍대 팝업', zh: 'MEDIHEAL弘大快闪', en: 'MEDIHEAL Hongdae Popup' },
    district: 'hongdae',
    address: {
      ko: '서울 마포구 어울마당로 35',
      zh: '首尔麻浦区欢聚广场路35号',
      en: '35 Eoulmadang-ro, Mapo-gu',
    },
    period: { start: '2026-03-01', end: '2026-04-01' },
    tags: { ko: ['마스크팩', 'K뷰티', '스킨케어'], zh: ['面膜', 'K美妆', '护肤'], en: ['Sheet Mask', 'K-Beauty', 'Skincare'] },
    image: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=400&h=300&fit=crop',
    hot: false,
    color: '#5B9EAF',
    sourceUrl: 'https://www.mediheal.com/',
    naverMapUrl: 'nmap://search?query=메디힐%20홍대&appname=kr.hanpocket.app',
    kakaoMapUrl: 'kakaomap://search?q=메디힐%20홍대',
  },

  // ── 한남 / 이태원 ──
  {
    id: 'aespa-sm-hannam',
    brand: 'aespa × SM Entertainment',
    title: { ko: 'aespa 팝업 스토어', zh: 'aespa快闪店', en: 'aespa Popup Store' },
    district: 'hannam',
    address: {
      ko: '서울 용산구 한남대로42길 14',
      zh: '首尔龙山区汉南大路42巷14号',
      en: '14 Hannam-daero 42-gil, Yongsan-gu',
    },
    period: { start: '2026-03-20', end: '2026-04-06' },
    tags: { ko: ['aespa', 'K팝', 'SM', '굿즈'], zh: ['aespa', 'K-Pop', 'SM', '周边'], en: ['aespa', 'K-Pop', 'SM', 'Merch'] },
    image: 'https://images.unsplash.com/photo-1540039155733-5bb30b4f3bf3?w=400&h=300&fit=crop',
    hot: true,
    color: '#7B2FBE',
    sourceUrl: 'https://www.smtown.com/',
    naverMapUrl: 'nmap://search?query=aespa%20팝업%20한남&appname=kr.hanpocket.app',
    kakaoMapUrl: 'kakaomap://search?q=aespa%20팝업스토어',
  },
  {
    id: 'bottega-hannam',
    brand: 'Bottega Veneta',
    title: { ko: '보테가 베네타 한남', zh: 'Bottega Veneta汉南快闪', en: 'Bottega Veneta Hannam' },
    district: 'hannam',
    address: {
      ko: '서울 용산구 이태원로 237',
      zh: '首尔龙山区梨泰院路237号',
      en: '237 Itaewon-ro, Yongsan-gu',
    },
    period: { start: '2026-03-15', end: '2026-04-20' },
    tags: { ko: ['럭셔리', '가죽', '이탈리아'], zh: ['奢侈品', '皮具', '意大利'], en: ['Luxury', 'Leather', 'Italian'] },
    image: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=400&h=300&fit=crop',
    hot: false,
    color: '#5C4D3A',
    sourceUrl: 'https://www.bottegaveneta.com/ko-kr',
    naverMapUrl: 'nmap://search?query=보테가베네타%20한남&appname=kr.hanpocket.app',
    kakaoMapUrl: 'kakaomap://search?q=보테가베네타%20한남',
  },

  // ── 강남 / 압구정 ──
  {
    id: 'chanel-apgujeong',
    brand: 'CHANEL',
    title: { ko: '샤넬 뷰티 팝업', zh: 'CHANEL美妆快闪', en: 'CHANEL Beauty Popup' },
    district: 'gangnam',
    address: {
      ko: '서울 강남구 압구정로 424',
      zh: '首尔江南区狎鸥亭路424号',
      en: '424 Apgujeong-ro, Gangnam-gu',
    },
    period: { start: '2026-03-12', end: '2026-03-28' },
    tags: { ko: ['럭셔리', '뷰티', '향수'], zh: ['奢侈品', '美妆', '香水'], en: ['Luxury', 'Beauty', 'Perfume'] },
    image: 'https://images.unsplash.com/photo-1541963463532-d68292c34b19?w=400&h=300&fit=crop',
    hot: false,
    color: '#1A1A1A',
    sourceUrl: 'https://www.chanel.com/kr/',
    naverMapUrl: 'nmap://search?query=샤넬%20압구정&appname=kr.hanpocket.app',
    kakaoMapUrl: 'kakaomap://search?q=샤넬%20압구정',
  },

  // ── 여의도 (더현대 서울) ──
  {
    id: 'limbus-thehyundai',
    brand: '림버스 컴퍼니',
    title: { ko: '림버스 3주년 팝업 — 더현대', zh: '边狱公司3周年快闪—现代百货', en: 'Limbus Co. 3rd Anniv. — The Hyundai' },
    district: 'yeouido',
    address: {
      ko: '서울 영등포구 여의대로 108 더현대 서울',
      zh: '首尔永登浦区汝矣大路108号 The Hyundai Seoul',
      en: '108 Yeoui-daero, Yeongdeungpo-gu, The Hyundai Seoul',
    },
    period: { start: '2026-03-13', end: '2026-03-30' },
    tags: { ko: ['게임', '로보토미', '팬덤', '굿즈'], zh: ['游戏', '迷宫公司', '粉丝', '周边'], en: ['Game', 'Lobotomy Corp', 'Fandom', 'Merch'] },
    image: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=400&h=300&fit=crop',
    hot: true,
    color: '#BF360C',
    sourceUrl: 'https://limbuscompany.com/',
    naverMapUrl: 'nmap://search?query=더현대서울&appname=kr.hanpocket.app',
    kakaoMapUrl: 'kakaomap://search?q=더현대%20서울%20림버스',
  },
  {
    id: 'macallan-thehyundai',
    brand: 'The Macallan',
    title: { ko: '맥캘란 하모니 IV 팝업', zh: 'Macallan Harmony IV快闪', en: 'Macallan Harmony IV Popup' },
    district: 'yeouido',
    address: {
      ko: '서울 영등포구 여의대로 108 더현대 서울 B1F',
      zh: '首尔永登浦区汝矣大路108号 The Hyundai Seoul B1F',
      en: '108 Yeoui-daero, The Hyundai Seoul B1F',
    },
    period: { start: '2026-03-21', end: '2026-03-30' },
    tags: { ko: ['위스키', '럭셔리', '주류'], zh: ['威士忌', '奢侈品', '酒类'], en: ['Whisky', 'Luxury', 'Spirits'] },
    image: 'https://images.unsplash.com/photo-1527281400683-1aae777175f8?w=400&h=300&fit=crop',
    hot: false,
    color: '#795548',
    sourceUrl: 'https://www.themacallan.com/',
    naverMapUrl: 'nmap://search?query=더현대서울&appname=kr.hanpocket.app',
    kakaoMapUrl: 'kakaomap://search?q=더현대%20서울%20맥캘란',
  },
  {
    id: 'blackpink-musinsa',
    brand: 'BLACKPINK × 무신사',
    title: { ko: '블랙핑크 DEADLINE 팝업', zh: 'BLACKPINK DEADLINE快闪', en: 'BLACKPINK DEADLINE Popup' },
    district: 'seongsu',
    address: {
      ko: '서울 성동구 연무장길 83 무신사 스탠다드 성수',
      zh: '首尔城东区연무장길83号 Musinsa Standard圣水',
      en: '83 Yeonmujang-gil, Musinsa Standard Seongsu',
    },
    period: { start: '2026-02-28', end: '2026-03-09' },
    tags: { ko: ['블랙핑크', 'K팝', '무신사', '패션'], zh: ['BLACKPINK', 'K-Pop', 'Musinsa', '时尚'], en: ['BLACKPINK', 'K-Pop', 'Musinsa', 'Fashion'] },
    image: 'https://images.unsplash.com/photo-1511367461989-f85a21fda167?w=400&h=300&fit=crop',
    hot: true,
    color: '#212121',
    sourceUrl: 'https://www.musinsa.com/',
    naverMapUrl: 'nmap://search?query=무신사스탠다드%20성수&appname=kr.hanpocket.app',
    kakaoMapUrl: 'kakaomap://search?q=무신사스탠다드%20성수',
  },

  // ── 명동 / 롯데 / 신세계 (백화점 팝업 — 중국인 관광객 집중 방문 지역) ──
  {
    id: 'lotte-kpop-myeongdong',
    brand: '롯데백화점 본점 × K팝',
    title: { ko: 'K팝 굿즈 팝업 — 롯데 본점', zh: 'K-Pop周边快闪—乐天百货本店', en: 'K-Pop Merch Popup — Lotte Main' },
    district: 'myeongdong',
    address: {
      ko: '서울 중구 남대문로 81 롯데백화점 본점 9F',
      zh: '首尔中区南大门路81号 乐天百货本店9F',
      en: '81 Namdaemun-ro, Lotte Dept. Store Main B., 9F',
    },
    period: { start: '2026-03-01', end: '2026-03-31' },
    tags: { ko: ['K팝', '굿즈', '롯데', '명동'], zh: ['K-Pop', '周边', '乐天', '明洞'], en: ['K-Pop', 'Merch', 'Lotte', 'Myeongdong'] },
    image: 'https://images.unsplash.com/photo-1605296867304-46d5465a13f1?w=400&h=300&fit=crop',
    hot: true,
    color: '#E53935',
    sourceUrl: 'https://www.lotteshopping.com/',
    naverMapUrl: 'nmap://search?query=롯데백화점%20본점&appname=kr.hanpocket.app',
    kakaoMapUrl: 'kakaomap://search?q=롯데백화점%20본점',
  },
  {
    id: 'lotte-beauty-festival',
    brand: '롯데백화점 × K뷰티',
    title: { ko: 'K뷰티 페스티벌 — 롯데 에비뉴엘', zh: 'K美妆节—乐天百货AVENUEL', en: 'K-Beauty Festival — Lotte Avenuel' },
    district: 'myeongdong',
    address: {
      ko: '서울 중구 남대문로 81 롯데 에비뉴엘 1F',
      zh: '首尔中区南大门路81号 乐天AVENUEL 1F',
      en: '81 Namdaemun-ro, Lotte Avenuel 1F',
    },
    period: { start: '2026-03-05', end: '2026-03-30' },
    tags: { ko: ['뷰티', 'K뷰티', '화장품', '면세'], zh: ['美妆', 'K美妆', '化妆品', '免税'], en: ['Beauty', 'K-Beauty', 'Cosmetics', 'Tax-free'] },
    image: 'https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?w=400&h=300&fit=crop',
    hot: false,
    color: '#AD1457',
    sourceUrl: 'https://www.lotteshopping.com/',
    naverMapUrl: 'nmap://search?query=롯데에비뉴엘%20명동&appname=kr.hanpocket.app',
    kakaoMapUrl: 'kakaomap://search?q=롯데에비뉴엘%20명동',
  },
  {
    id: 'shinsegae-gangnam-luxury',
    brand: '신세계백화점 강남 × 럭셔리',
    title: { ko: '봄 럭셔리 팝업 — 신세계 강남', zh: '春季奢品快闪—新世界江南', en: 'Spring Luxury Popup — Shinsegae Gangnam' },
    district: 'gangnam',
    address: {
      ko: '서울 서초구 신반포로 176 신세계백화점 강남 1F',
      zh: '首尔瑞草区新盘浦路176号 新世界百货江南店 1F',
      en: '176 Sinbanpo-ro, Shinsegae Dept. Store Gangnam, 1F',
    },
    period: { start: '2026-03-10', end: '2026-04-06' },
    tags: { ko: ['럭셔리', '패션', '신세계', '봄'], zh: ['奢侈品', '时尚', '新世界', '春季'], en: ['Luxury', 'Fashion', 'Shinsegae', 'Spring'] },
    image: 'https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=400&h=300&fit=crop',
    hot: false,
    color: '#1A237E',
    sourceUrl: 'https://www.shinsegae.com/',
    naverMapUrl: 'nmap://search?query=신세계백화점%20강남&appname=kr.hanpocket.app',
    kakaoMapUrl: 'kakaomap://search?q=신세계백화점%20강남',
  },
  {
    id: 'galleria-kbeauty-apgujeong',
    brand: '갤러리아백화점 명품관',
    title: { ko: '갤러리아 K뷰티 팝업존', zh: '嘉汇华百货K美妆快闪区', en: 'Galleria K-Beauty Popup Zone' },
    district: 'gangnam',
    address: {
      ko: '서울 강남구 압구정로 343 갤러리아백화점 명품관 EAST 1F',
      zh: '首尔江南区狎鸥亭路343号 嘉汇华百货名品馆EAST 1F',
      en: '343 Apgujeong-ro, Galleria Dept. Store Luxury Wing EAST, 1F',
    },
    period: { start: '2026-03-07', end: '2026-03-31' },
    tags: { ko: ['뷰티', 'K뷰티', '갤러리아', '압구정'], zh: ['美妆', 'K美妆', '嘉汇华', '狎鸥亭'], en: ['Beauty', 'K-Beauty', 'Galleria', 'Apgujeong'] },
    image: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=400&h=300&fit=crop',
    hot: false,
    color: '#880E4F',
    sourceUrl: 'https://www.galleria.co.kr/',
    naverMapUrl: 'nmap://search?query=갤러리아명품관%20압구정&appname=kr.hanpocket.app',
    kakaoMapUrl: 'kakaomap://search?q=갤러리아명품관%20압구정',
  },
  {
    id: 'hyundai-coex-food',
    brand: '현대백화점 무역센터점',
    title: { ko: '봄 미식 팝업 — 무역센터점', zh: '春季美食快闪—贸易中心店', en: 'Spring Gourmet Popup — Trade Center' },
    district: 'gangnam',
    address: {
      ko: '서울 강남구 봉은사로 524 현대백화점 무역센터점 B1F',
      zh: '首尔江南区奉恩寺路524号 现代百货贸易中心店 B1F',
      en: '524 Bongeunsa-ro, Hyundai Dept. Store Trade Center, B1F',
    },
    period: { start: '2026-03-14', end: '2026-03-30' },
    tags: { ko: ['음식', '디저트', '현대', 'COEX'], zh: ['美食', '甜点', '现代', 'COEX'], en: ['Food', 'Dessert', 'Hyundai', 'COEX'] },
    image: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=400&h=300&fit=crop',
    hot: false,
    color: '#1B5E20',
    sourceUrl: 'https://www.thehyundai.com/',
    naverMapUrl: 'nmap://search?query=현대백화점%20무역센터&appname=kr.hanpocket.app',
    kakaoMapUrl: 'kakaomap://search?q=현대백화점%20무역센터',
  },
  {
    id: 'starfield-coex-chinese-new-year',
    brand: '스타필드 COEX몰',
    title: { ko: '중국 관광객 봄 특별전', zh: '中国游客春季特展 — COEX购物中心', en: 'Spring Special for Chinese Visitors — COEX' },
    district: 'gangnam',
    address: {
      ko: '서울 강남구 영동대로 513 코엑스몰 B1F',
      zh: '首尔江南区永东大路513号 COEX购物中心 B1F',
      en: '513 Yeongdong-daero, COEX Mall B1F',
    },
    period: { start: '2026-03-01', end: '2026-04-15' },
    tags: { ko: ['중국어', '코엑스', '쇼핑', '체험'], zh: ['中文服务', 'COEX', '购物', '体验'], en: ['Chinese friendly', 'COEX', 'Shopping', 'Experience'] },
    image: 'https://images.unsplash.com/photo-1555529669-2269763671c0?w=400&h=300&fit=crop',
    hot: false,
    color: '#006064',
    sourceUrl: 'https://www.starfield.co.kr/coex/index.do',
    naverMapUrl: 'nmap://search?query=코엑스몰&appname=kr.hanpocket.app',
    kakaoMapUrl: 'kakaomap://search?q=코엑스몰',
  },
  {
    id: 'thehyundai-food-popup',
    brand: '더현대 서울 B1F 식품관',
    title: { ko: '디저트 페스티벌 — 더현대 서울', zh: '甜品节快闪—The Hyundai Seoul', en: 'Dessert Festival — The Hyundai Seoul' },
    district: 'yeouido',
    address: {
      ko: '서울 영등포구 여의대로 108 더현대 서울 B1F',
      zh: '首尔永登浦区汝矣大路108号 The Hyundai Seoul B1F',
      en: '108 Yeoui-daero, The Hyundai Seoul B1F',
    },
    period: { start: '2026-03-07', end: '2026-03-30' },
    tags: { ko: ['디저트', '음식', '더현대', '여의도'], zh: ['甜品', '美食', '现代百货', '汝矣岛'], en: ['Dessert', 'Food', 'The Hyundai', 'Yeouido'] },
    image: 'https://images.unsplash.com/photo-1551024601-bec78aea704b?w=400&h=300&fit=crop',
    hot: true,
    color: '#F57F17',
    sourceUrl: 'https://www.thehyundai.com/',
    naverMapUrl: 'nmap://search?query=더현대서울&appname=kr.hanpocket.app',
    kakaoMapUrl: 'kakaomap://search?q=더현대%20서울',
  },
]

// 마감 임박 (7일 이내)
export function isClosingSoon(popup) {
  const end = new Date(popup.period.end)
  const now = new Date()
  const diff = Math.ceil((end - now) / (1000 * 60 * 60 * 24))
  return diff >= 0 && diff <= 7
}

// 오늘 운영 중 OR 2주 이내 오픈 예정
export function isActiveOrUpcoming(popup) {
  const now = new Date()
  const start = new Date(popup.period.start)
  const end = new Date(popup.period.end)
  const twoWeeksLater = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000)
  return end >= now && start <= twoWeeksLater
}

// 오늘 운영 중
export function isOpenToday(popup) {
  const now = new Date()
  const start = new Date(popup.period.start)
  const end = new Date(popup.period.end)
  return now >= start && now <= end
}

// D-day 레이블
export function getDdayLabel(popup, lang) {
  const end = new Date(popup.period.end)
  const start = new Date(popup.period.start)
  const now = new Date()
  if (end < now) return lang === 'zh' ? '已结束' : lang === 'en' ? 'Ended' : '종료'
  if (start > now) {
    const daysUntilOpen = Math.ceil((start - now) / (1000 * 60 * 60 * 24))
    return lang === 'zh' ? `${daysUntilOpen}天后开始` : lang === 'en' ? `Opens in ${daysUntilOpen}d` : `${daysUntilOpen}일 후 오픈`
  }
  const diff = Math.ceil((end - now) / (1000 * 60 * 60 * 24))
  if (diff === 0) return 'D-day'
  return `D-${diff}`
}

// 오픈 여부 레이블
export function getStatusLabel(popup, lang) {
  const now = new Date()
  const start = new Date(popup.period.start)
  const end = new Date(popup.period.end)
  if (end < now) return lang === 'zh' ? '已结束' : lang === 'en' ? 'Ended' : '종료'
  if (start > now) return lang === 'zh' ? '即将开幕' : lang === 'en' ? 'Upcoming' : '오픈 예정'
  return lang === 'zh' ? '运营中' : lang === 'en' ? 'Open' : '운영 중'
}
