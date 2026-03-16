// 아이돌 마스터 데이터 — 시가총액 기준 TOP 10 엔터테인먼트 회사 소속
// 수집 대상: 이 목록에 있는 아티스트의 팝업/전시/굿즈숍은 모두 수집
// 갱신 주기: 분기별 (시가총액 순위 변동 반영)
// 최종 갱신: 2026-03-16

export const ENTERTAINMENT_AGENCIES = [
  {
    rank: 1,
    name: 'HYBE',
    name_cn: 'HYBE',
    website: 'https://www.hybecorp.com',
    instagram: '@hyloghybe',
    sublabels: ['빅히트뮤직', '플레디스', '어도어', '쏘스뮤직', '하이브레이블즈재팬', 'KOZ', '빌리프랩'],
  },
  {
    rank: 2,
    name: 'SM엔터테인먼트',
    name_cn: 'SM娱乐',
    website: 'https://www.smentertainment.com',
    instagram: '@smtown',
    sublabels: [],
  },
  {
    rank: 3,
    name: 'JYP엔터테인먼트',
    name_cn: 'JYP娱乐',
    website: 'https://www.jype.com',
    instagram: '@jaborajyp',
    sublabels: [],
  },
  {
    rank: 4,
    name: 'YG엔터테인먼트',
    name_cn: 'YG娱乐',
    website: 'https://www.ygfamily.com',
    instagram: '@yg_ent_official',
    sublabels: ['YG PLUS'],
  },
  {
    rank: 5,
    name: 'CJ ENM',
    name_cn: 'CJ ENM',
    website: 'https://www.cjenm.com',
    instagram: '@cjenm.official',
    sublabels: ['Mnet', 'WAKE ONE'],
  },
  {
    rank: 6,
    name: '카카오엔터테인먼트',
    name_cn: 'Kakao娱乐',
    website: 'https://www.kakaoent.com',
    instagram: '@kakaoent_official',
    sublabels: ['IST엔터', '스타쉽', '이담엔터'],
  },
  {
    rank: 7,
    name: '큐브엔터테인먼트',
    name_cn: 'CUBE娱乐',
    website: 'https://www.cubeent.co.kr',
    instagram: '@cubeent_official',
    sublabels: [],
  },
  {
    rank: 8,
    name: '스타쉽엔터테인먼트',
    name_cn: 'Starship娱乐',
    website: 'https://www.starship-ent.com',
    instagram: '@starshipent',
    sublabels: [],
  },
  {
    rank: 9,
    name: 'FNC엔터테인먼트',
    name_cn: 'FNC娱乐',
    website: 'https://www.fncent.com',
    instagram: '@fncent',
    sublabels: [],
  },
  {
    rank: 10,
    name: 'RBW',
    name_cn: 'RBW',
    website: 'https://www.rbbridge.com',
    instagram: '@rbw_official',
    sublabels: ['WM엔터'],
  },
]

// 소속 아이돌 그룹 (팝업 수집 대상)
// is_group=true: 그룹 단위, members: 멤버 목록 (개인 인스타 감지용)
export const IDOL_GROUPS = [
  // ── HYBE ──
  { name_ko: 'BTS',              name_cn: '防弹少年团',   name_en: 'BTS',              agency: 'HYBE', sublabel: '빅히트뮤직',   instagram: '@bts.bighitofficial',   cn_fandom: 'ARMY',   debut: 2013 },
  { name_ko: '세븐틴',           name_cn: 'SEVENTEEN',    name_en: 'SEVENTEEN',        agency: 'HYBE', sublabel: '플레디스',     instagram: '@saythename_17',        cn_fandom: 'CARAT',  debut: 2015 },
  { name_ko: '투모로우바이투게더', name_cn: 'TXT',          name_en: 'TXT',              agency: 'HYBE', sublabel: '빅히트뮤직',   instagram: '@txt_bighit',           cn_fandom: 'MOA',    debut: 2019 },
  { name_ko: '뉴진스',           name_cn: 'NewJeans',     name_en: 'NewJeans',         agency: 'HYBE', sublabel: '어도어',       instagram: '@newjeans_official',    cn_fandom: 'Bunnies',debut: 2022 },
  { name_ko: '르세라핌',          name_cn: 'LE SSERAFIM',  name_en: 'LE SSERAFIM',      agency: 'HYBE', sublabel: '쏘스뮤직',     instagram: '@le_sserafim',          cn_fandom: 'FEARNOT',debut: 2022 },
  { name_ko: 'ILLIT',           name_cn: 'ILLIT',        name_en: 'ILLIT',            agency: 'HYBE', sublabel: '빌리프랩',     instagram: '@illit_official',       cn_fandom: 'GLLIT',  debut: 2024 },
  { name_ko: 'TWS',             name_cn: 'TWS',          name_en: 'TWS',              agency: 'HYBE', sublabel: '플레디스',     instagram: '@tws_pledis',           cn_fandom: '',       debut: 2024 },
  { name_ko: '&TEAM',           name_cn: '&TEAM',        name_en: '&TEAM',            agency: 'HYBE', sublabel: '하이브레이블즈재팬', instagram: '@andteam_official', cn_fandom: 'LUNÉ',   debut: 2022 },

  // ── SM엔터 ──
  { name_ko: 'aespa',           name_cn: 'aespa',        name_en: 'aespa',            agency: 'SM엔터테인먼트', sublabel: '', instagram: '@aespa_official',       cn_fandom: 'MY',        debut: 2020 },
  { name_ko: 'NCT',             name_cn: 'NCT',          name_en: 'NCT',              agency: 'SM엔터테인먼트', sublabel: '', instagram: '@nct',                  cn_fandom: 'NCTzen',    debut: 2016 },
  { name_ko: 'NCT DREAM',      name_cn: 'NCT DREAM',    name_en: 'NCT DREAM',        agency: 'SM엔터테인먼트', sublabel: '', instagram: '@nctdream',             cn_fandom: 'NCTzen',    debut: 2016 },
  { name_ko: 'NCT 127',        name_cn: 'NCT 127',      name_en: 'NCT 127',          agency: 'SM엔터테인먼트', sublabel: '', instagram: '@nct127',              cn_fandom: 'NCTzen',    debut: 2016 },
  { name_ko: 'Red Velvet',     name_cn: 'Red Velvet',    name_en: 'Red Velvet',       agency: 'SM엔터테인먼트', sublabel: '', instagram: '@redvelvet.smtown',    cn_fandom: 'ReVeluv',   debut: 2014 },
  { name_ko: 'SHINee',         name_cn: 'SHINee',        name_en: 'SHINee',           agency: 'SM엔터테인먼트', sublabel: '', instagram: '@shinee',              cn_fandom: 'SHINee World',debut: 2008 },
  { name_ko: 'EXO',            name_cn: 'EXO',           name_en: 'EXO',              agency: 'SM엔터테인먼트', sublabel: '', instagram: '@weareone.exo',        cn_fandom: 'EXO-L',    debut: 2012 },
  { name_ko: 'RIIZE',          name_cn: 'RIIZE',         name_en: 'RIIZE',            agency: 'SM엔터테인먼트', sublabel: '', instagram: '@riaborariize',         cn_fandom: 'BRIIZE',   debut: 2023 },
  { name_ko: 'WISH',           name_cn: 'WISH',          name_en: 'WISH',             agency: 'SM엔터테인먼트', sublabel: '', instagram: '@wish_smtown',          cn_fandom: '',         debut: 2024 },

  // ── JYP ──
  { name_ko: 'TWICE',          name_cn: 'TWICE',         name_en: 'TWICE',            agency: 'JYP엔터테인먼트', sublabel: '', instagram: '@twicetagram',         cn_fandom: 'ONCE',     debut: 2015 },
  { name_ko: 'Stray Kids',     name_cn: 'Stray Kids',    name_en: 'Stray Kids',       agency: 'JYP엔터테인먼트', sublabel: '', instagram: '@realstraykids',       cn_fandom: 'STAY',     debut: 2018 },
  { name_ko: 'ITZY',           name_cn: 'ITZY',          name_en: 'ITZY',             agency: 'JYP엔터테인먼트', sublabel: '', instagram: '@itzy.all.in.us',      cn_fandom: 'MIDZY',    debut: 2019 },
  { name_ko: 'NMIXX',          name_cn: 'NMIXX',         name_en: 'NMIXX',            agency: 'JYP엔터테인먼트', sublabel: '', instagram: '@nmixx_official',      cn_fandom: 'NSWer',    debut: 2022 },

  // ── YG ──
  { name_ko: 'BLACKPINK',      name_cn: 'BLACKPINK',     name_en: 'BLACKPINK',        agency: 'YG엔터테인먼트', sublabel: '', instagram: '@blackpinkofficial',    cn_fandom: 'BLINK',    debut: 2016 },
  { name_ko: 'TREASURE',       name_cn: 'TREASURE',      name_en: 'TREASURE',         agency: 'YG엔터테인먼트', sublabel: '', instagram: '@treasuremembers',      cn_fandom: 'TEUME',    debut: 2020 },
  { name_ko: 'BABYMONSTER',    name_cn: 'BABYMONSTER',   name_en: 'BABYMONSTER',      agency: 'YG엔터테인먼트', sublabel: '', instagram: '@baaborabymonster',     cn_fandom: 'Monstiez',debut: 2023 },

  // ── CJ ENM / WAKE ONE ──
  { name_ko: 'ZEROBASEONE',    name_cn: 'ZEROBASEONE',   name_en: 'ZEROBASEONE',      agency: 'CJ ENM',        sublabel: 'WAKE ONE', instagram: '@zfrob1_official',   cn_fandom: 'ZEROSE',   debut: 2023 },
  { name_ko: 'INI',            name_cn: 'INI',           name_en: 'INI',              agency: 'CJ ENM',        sublabel: 'WAKE ONE', instagram: '@official__ini',     cn_fandom: 'MINI',     debut: 2021 },

  // ── 카카오엔터/IST/스타쉽 ──
  { name_ko: 'ATEEZ',          name_cn: 'ATEEZ',         name_en: 'ATEEZ',            agency: '카카오엔터테인먼트', sublabel: '', instagram: '@ateez_official_',    cn_fandom: 'ATINY',    debut: 2018 },
  { name_ko: 'THE BOYZ',       name_cn: 'THE BOYZ',      name_en: 'THE BOYZ',         agency: '카카오엔터테인먼트', sublabel: 'IST엔터', instagram: '@the_boyz',    cn_fandom: 'DEOBI',    debut: 2017 },
  { name_ko: 'IVE',            name_cn: 'IVE',           name_en: 'IVE',              agency: '카카오엔터테인먼트', sublabel: '스타쉽', instagram: '@ivestarship',     cn_fandom: 'DIVE',     debut: 2021 },
  { name_ko: '몬스타엑스',      name_cn: 'MONSTA X',      name_en: 'MONSTA X',         agency: '카카오엔터테인먼트', sublabel: '스타쉽', instagram: '@official_monsta_x',cn_fandom: 'MONBEBE', debut: 2015 },
  { name_ko: 'CRAVITY',        name_cn: 'CRAVITY',       name_en: 'CRAVITY',          agency: '카카오엔터테인먼트', sublabel: '스타쉽', instagram: '@cravity_official', cn_fandom: 'LUVITY',  debut: 2020 },

  // ── 큐브 ──
  { name_ko: '(여자)아이들',    name_cn: '(G)I-DLE',     name_en: '(G)I-DLE',         agency: '큐브엔터테인먼트',   sublabel: '', instagram: '@official_g_i_dle',   cn_fandom: 'Neverland', debut: 2018 },
  { name_ko: 'PENTAGON',       name_cn: 'PENTAGON',      name_en: 'PENTAGON',         agency: '큐브엔터테인먼트',   sublabel: '', instagram: '@cube_ptg',            cn_fandom: 'Universe', debut: 2016 },
  { name_ko: 'LIGHTSUM',       name_cn: 'LIGHTSUM',      name_en: 'LIGHTSUM',         agency: '큐브엔터테인먼트',   sublabel: '', instagram: '@lightsum_official',   cn_fandom: 'Sumit',    debut: 2021 },

  // ── FNC ──
  { name_ko: 'CNBLUE',         name_cn: 'CNBLUE',        name_en: 'CNBLUE',           agency: 'FNC엔터테인먼트',   sublabel: '', instagram: '@cnaborablue_official', cn_fandom: 'BOICE',   debut: 2010 },
  { name_ko: 'SF9',            name_cn: 'SF9',           name_en: 'SF9',              agency: 'FNC엔터테인먼트',   sublabel: '', instagram: '@sf9official',          cn_fandom: 'FANTASY', debut: 2016 },
  { name_ko: 'P1Harmony',      name_cn: 'P1Harmony',     name_en: 'P1Harmony',        agency: 'FNC엔터테인먼트',   sublabel: '', instagram: '@p1h_official',         cn_fandom: 'P1ece',   debut: 2020 },

  // ── RBW / WM ──
  { name_ko: '마마무',          name_cn: 'MAMAMOO',       name_en: 'MAMAMOO',          agency: 'RBW',               sublabel: '', instagram: '@maboramamamoo',        cn_fandom: 'MooMoo',  debut: 2014 },
  { name_ko: 'ONEUS',          name_cn: 'ONEUS',         name_en: 'ONEUS',            agency: 'RBW',               sublabel: '', instagram: '@official_oneus',       cn_fandom: 'TOMOON',  debut: 2019 },
  { name_ko: 'ONEWE',          name_cn: 'ONEWE',         name_en: 'ONEWE',            agency: 'RBW',               sublabel: '', instagram: '@oneweofficial',        cn_fandom: 'WEVE',    debut: 2019 },
  { name_ko: 'OH MY GIRL',     name_cn: 'OH MY GIRL',    name_en: 'OH MY GIRL',       agency: 'RBW',               sublabel: 'WM엔터', instagram: '@wm_ohmygirl',   cn_fandom: 'Miracle',debut: 2015 },
]

// 소속사별 그룹 인덱스 (빠른 조회용)
export const IDOL_BY_AGENCY = IDOL_GROUPS.reduce((acc, idol) => {
  const key = idol.agency
  if (!acc[key]) acc[key] = []
  acc[key].push(idol)
  return acc
}, {})

// 팝업 매칭용: 아이돌 이름 → 소속사
export const IDOL_NAME_MAP = Object.fromEntries(
  IDOL_GROUPS.flatMap(g => [
    [g.name_ko, g],
    [g.name_en, g],
    [g.name_cn, g],
  ].filter(([k]) => k))
)
