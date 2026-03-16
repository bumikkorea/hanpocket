// 애니/웹툰 IP 마스터 데이터
// 수집 대상: 중국에서 인기 + 한국에서 인지도 있는 IP만
// 이 목록에 있는 IP의 팝업/전시/콜라보는 모두 수집
// 갱신 주기: 분기별
// 최종 갱신: 2026-03-16

// cn_tier 기준:
//   S: 빌리빌리 5억뷰+ or 小红书 50만 게시물+
//   A: 빌리빌리 1억뷰+ or 小红书 10만 게시물+
//   B: 빌리빌리 3천만뷰+ or 小红书 3만 게시물+

export const ANIME_IP_LIST = [
  // ── S티어 — 중국에서 폭발적 인기 ──
  {
    title_ko: '나 혼자만 레벨업',
    title_cn: '我独自升级',
    title_en: 'Solo Leveling',
    origin: 'webtoon',
    platform_kr: '카카오웹툰',
    streaming: ['크런치롤', 'A-1 Pictures'],
    cn_tier: 'S',
    bilibili_views: 8,  // 억
    xhs_posts: 60,      // 만
    official_url: 'https://sololeveling-anime.net',
    instagram: '',
  },
  {
    title_ko: '슬램덩크',
    title_cn: '灌篮高手',
    title_en: 'Slam Dunk',
    origin: 'manga',
    platform_kr: '극장 개봉',
    streaming: ['넷플릭스'],
    cn_tier: 'S',
    bilibili_views: 12,
    xhs_posts: 100,
    official_url: '',
    instagram: '',
  },
  {
    title_ko: '원피스',
    title_cn: '海贼王',
    title_en: 'One Piece',
    origin: 'manga',
    platform_kr: '투니버스, 넷플릭스',
    streaming: ['넷플릭스', '크런치롤'],
    cn_tier: 'S',
    bilibili_views: 20,
    xhs_posts: 200,
    official_url: 'https://one-piece.com',
    instagram: '@onepieceofficial',
  },
  {
    title_ko: '짱구는 못말려',
    title_cn: '蜡笔小新',
    title_en: 'Crayon Shin-chan',
    origin: 'manga',
    platform_kr: 'EBS, 극장',
    streaming: ['웨이브'],
    cn_tier: 'S',
    bilibili_views: 15,
    xhs_posts: 80,
    official_url: '',
    instagram: '',
  },
  {
    title_ko: '산리오 캐릭터즈',
    title_cn: '三丽鸥',
    title_en: 'Sanrio Characters',
    origin: 'character',
    platform_kr: '산리오코리아',
    streaming: [],
    cn_tier: 'S',
    bilibili_views: 0,
    xhs_posts: 150,
    official_url: 'https://www.sanrio.co.kr',
    instagram: '@sanrio_korea',
  },
  {
    title_ko: '포켓몬',
    title_cn: '宝可梦',
    title_en: 'Pokémon',
    origin: 'game',
    platform_kr: '한국닌텐도',
    streaming: ['넷플릭스'],
    cn_tier: 'S',
    bilibili_views: 10,
    xhs_posts: 120,
    official_url: 'https://pokemonkorea.co.kr',
    instagram: '@pokemonkorea',
  },
  {
    title_ko: '원신',
    title_cn: '原神',
    title_en: 'Genshin Impact',
    origin: 'game',
    platform_kr: 'miHoYo Korea',
    streaming: [],
    cn_tier: 'S',
    bilibili_views: 30,
    xhs_posts: 300,
    official_url: 'https://genshin.hoyoverse.com/ko',
    instagram: '@gaboraenshinimpact_kr',
  },

  // ── A티어 — 중국에서 인기 ──
  {
    title_ko: '신의 탑',
    title_cn: '神之塔',
    title_en: 'Tower of God',
    origin: 'webtoon',
    platform_kr: '네이버웹툰',
    streaming: ['크런치롤'],
    cn_tier: 'A',
    bilibili_views: 3,
    xhs_posts: 15,
    official_url: '',
    instagram: '',
  },
  {
    title_ko: '갓 오브 하이스쿨',
    title_cn: '高中之神',
    title_en: 'The God of High School',
    origin: 'webtoon',
    platform_kr: '네이버웹툰',
    streaming: ['크런치롤'],
    cn_tier: 'A',
    bilibili_views: 2,
    xhs_posts: 10,
    official_url: '',
    instagram: '',
  },
  {
    title_ko: '스파이패밀리',
    title_cn: '间谍过家家',
    title_en: 'SPY×FAMILY',
    origin: 'manga',
    platform_kr: '넷플릭스',
    streaming: ['넷플릭스', '크런치롤'],
    cn_tier: 'A',
    bilibili_views: 5,
    xhs_posts: 40,
    official_url: '',
    instagram: '',
  },
  {
    title_ko: '주술회전',
    title_cn: '咒术回战',
    title_en: 'Jujutsu Kaisen',
    origin: 'manga',
    platform_kr: '넷플릭스, 극장',
    streaming: ['넷플릭스', '크런치롤'],
    cn_tier: 'A',
    bilibili_views: 8,
    xhs_posts: 50,
    official_url: '',
    instagram: '',
  },
  {
    title_ko: '블루아카이브',
    title_cn: '蔚蓝档案',
    title_en: 'Blue Archive',
    origin: 'game',
    platform_kr: '넥슨',
    streaming: [],
    cn_tier: 'A',
    bilibili_views: 6,
    xhs_posts: 45,
    official_url: 'https://bluearchive.nexon.com/home',
    instagram: '@bluearchive_kr',
  },
  {
    title_ko: '명탐정 코난',
    title_cn: '名侦探柯南',
    title_en: 'Detective Conan',
    origin: 'manga',
    platform_kr: 'KBS, 극장',
    streaming: ['웨이브', '넷플릭스'],
    cn_tier: 'A',
    bilibili_views: 7,
    xhs_posts: 35,
    official_url: '',
    instagram: '',
  },
  {
    title_ko: '잔망루피',
    title_cn: '小企鹅Pororo',
    title_en: 'Zanmang Loopy',
    origin: 'character',
    platform_kr: 'EBS',
    streaming: [],
    cn_tier: 'A',
    bilibili_views: 1,
    xhs_posts: 30,
    official_url: '',
    instagram: '@zanmangloopy',
  },

  // ── B티어 — 한국에서 인기 + 중국에서 인지도 ──
  {
    title_ko: '여신강림',
    title_cn: '女神降临',
    title_en: 'True Beauty',
    origin: 'webtoon',
    platform_kr: '네이버웹툰',
    streaming: ['비키'],
    cn_tier: 'B',
    bilibili_views: 1,
    xhs_posts: 8,
    official_url: '',
    instagram: '',
  },
  {
    title_ko: '외모지상주의',
    title_cn: '外貌至上主义',
    title_en: 'Lookism',
    origin: 'webtoon',
    platform_kr: '네이버웹툰',
    streaming: ['넷플릭스'],
    cn_tier: 'B',
    bilibili_views: 2,
    xhs_posts: 12,
    official_url: '',
    instagram: '',
  },
  {
    title_ko: '귀멸의 칼날',
    title_cn: '鬼灭之刃',
    title_en: 'Demon Slayer',
    origin: 'manga',
    platform_kr: '극장, 넷플릭스',
    streaming: ['넷플릭스', '크런치롤'],
    cn_tier: 'B',
    bilibili_views: 6,
    xhs_posts: 25,
    official_url: '',
    instagram: '',
  },
]

// IP명으로 빠른 조회
export const ANIME_IP_MAP = Object.fromEntries(
  ANIME_IP_LIST.flatMap(ip => [
    [ip.title_ko, ip],
    [ip.title_cn, ip],
    [ip.title_en, ip],
  ].filter(([k]) => k))
)

// 티어별 필터
export const ANIME_BY_TIER = {
  S: ANIME_IP_LIST.filter(ip => ip.cn_tier === 'S'),
  A: ANIME_IP_LIST.filter(ip => ip.cn_tier === 'A'),
  B: ANIME_IP_LIST.filter(ip => ip.cn_tier === 'B'),
}

// origin별 필터
export const ANIME_BY_ORIGIN = ANIME_IP_LIST.reduce((acc, ip) => {
  if (!acc[ip.origin]) acc[ip.origin] = []
  acc[ip.origin].push(ip)
  return acc
}, {})
