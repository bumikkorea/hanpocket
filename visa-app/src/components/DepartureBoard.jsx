/**
 * DepartureBoard — 인천공항 출발 전광판 (White theme)
 * - 현재시각 표시
 * - 항공편 입력 → T1/T2/탑승동 안내
 * - 도시명·항공사 다국어 번역
 */
import { useState, useEffect, useRef } from 'react'
import { RefreshCw, Search, X, PlaneTakeoff } from 'lucide-react'
import { fetchDepartureFlights, getRemarkInfo } from '../api/flightApi'
import NearPageHeader from './NearPageHeader'
import { useLanguage } from '../i18n/index.jsx'

// ─── qwen-mt-turbo 도시명 번역 ───
const TRANSLATE_CACHE_KEY = (lang) => `flight-city-translations-${lang}`
const CACHE_TTL = 30 * 24 * 60 * 60 * 1000 // 30일

function loadTranslationCache(lang) {
  try {
    const raw = localStorage.getItem(TRANSLATE_CACHE_KEY(lang))
    if (!raw) return {}
    const { data, ts } = JSON.parse(raw)
    if (Date.now() - ts > CACHE_TTL) return {}
    return data || {}
  } catch { return {} }
}

function saveTranslationCache(lang, cache) {
  localStorage.setItem(TRANSLATE_CACHE_KEY(lang), JSON.stringify({ data: cache, ts: Date.now() }))
}

async function translateCityNames(names, lang) {
  if (!names.length || lang === 'ko') return {}
  const targetLang = lang === 'zh' ? 'Chinese' : 'English'
  const cache = loadTranslationCache(lang)
  const uncached = names.filter(n => !cache[n])
  if (uncached.length === 0) return cache

  try {
    // 일괄 번역: 줄바꿈으로 구분
    const text = uncached.join('\n')
    const resp = await fetch('https://dashscope-intl.aliyuncs.com/compatible-mode/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer sk-placeholder' },
      body: JSON.stringify({
        model: 'qwen-mt-turbo',
        messages: [{ role: 'user', content: text }],
        translation_options: { source_lang: 'Korean', target_lang: targetLang },
      }),
    })
    if (!resp.ok) throw new Error('translate failed')
    const data = await resp.json()
    const translated = (data.choices?.[0]?.message?.content || '').split('\n')
    uncached.forEach((name, i) => { if (translated[i]) cache[name] = translated[i].trim() })
    saveTranslationCache(lang, cache)
  } catch {
    // 실패 시 Google Translate fallback
    try {
      const tl = lang === 'zh' ? 'zh-CN' : 'en'
      for (const name of uncached.slice(0, 10)) { // 최대 10개씩
        const r = await fetch(`https://translate.googleapis.com/translate_a/single?client=gtx&sl=ko&tl=${tl}&dt=t&q=${encodeURIComponent(name)}`)
        const d = await r.json()
        cache[name] = d[0]?.map(s => s[0]).join('') || name
      }
      saveTranslationCache(lang, cache)
    } catch { /* 캐시된 것만 사용 */ }
  }
  return cache
}

function L(lang, d) {
  if (typeof d === 'string') return d
  return d?.[lang] || d?.ko || d?.zh || d?.en || ''
}
function fmt(hhmm) {
  if (!hhmm || hhmm.length < 4) return '--:--'
  return `${hhmm.slice(0, 2)}:${hhmm.slice(2, 4)}`
}

// IATA 코드 → 도시명 (zh / en) + 국가명 (co)
const CITY = {
  // 일본
  NRT:{ zh:'东京成田', en:'Tokyo Narita',  co:{ ko:'일본', zh:'日本', en:'Japan' } },
  HND:{ zh:'东京羽田', en:'Tokyo Haneda',  co:{ ko:'일본', zh:'日本', en:'Japan' } },
  KIX:{ zh:'大阪',     en:'Osaka',         co:{ ko:'일본', zh:'日本', en:'Japan' } },
  ITM:{ zh:'大阪伊丹', en:'Osaka Itami',   co:{ ko:'일본', zh:'日本', en:'Japan' } },
  CTS:{ zh:'札幌',     en:'Sapporo',       co:{ ko:'일본', zh:'日本', en:'Japan' } },
  FUK:{ zh:'福冈',     en:'Fukuoka',       co:{ ko:'일본', zh:'日本', en:'Japan' } },
  NGO:{ zh:'名古屋',   en:'Nagoya',        co:{ ko:'일본', zh:'日本', en:'Japan' } },
  OKA:{ zh:'冲绳',     en:'Okinawa',       co:{ ko:'일본', zh:'日本', en:'Japan' } },
  SDJ:{ zh:'仙台',     en:'Sendai',        co:{ ko:'일본', zh:'日本', en:'Japan' } },
  HIJ:{ zh:'广岛',     en:'Hiroshima',     co:{ ko:'일본', zh:'日本', en:'Japan' } },
  KMJ:{ zh:'熊本',     en:'Kumamoto',      co:{ ko:'일본', zh:'日本', en:'Japan' } },
  // 중국 (본토)
  PEK:{ zh:'北京首都', en:'Beijing Cap.',  co:{ ko:'중국', zh:'中国', en:'China' } },
  PKX:{ zh:'北京大兴', en:'Beijing Daxing',co:{ ko:'중국', zh:'中国', en:'China' } },
  PVG:{ zh:'上海浦东', en:'Shanghai PVG',  co:{ ko:'중국', zh:'中国', en:'China' } },
  SHA:{ zh:'上海虹桥', en:'Shanghai Hongq',co:{ ko:'중국', zh:'中国', en:'China' } },
  CAN:{ zh:'广州',     en:'Guangzhou',     co:{ ko:'중국', zh:'中国', en:'China' } },
  SZX:{ zh:'深圳',     en:'Shenzhen',      co:{ ko:'중국', zh:'中国', en:'China' } },
  CTU:{ zh:'成都',     en:'Chengdu',       co:{ ko:'중국', zh:'中国', en:'China' } },
  TFU:{ zh:'成都天府', en:'Chengdu Tianfu',co:{ ko:'중국', zh:'中国', en:'China' } },
  CKG:{ zh:'重庆',     en:'Chongqing',     co:{ ko:'중국', zh:'中국', en:'China' } },
  XIY:{ zh:'西安',     en:"Xi'an",         co:{ ko:'중국', zh:'中国', en:'China' } },
  WUH:{ zh:'武汉',     en:'Wuhan',         co:{ ko:'중국', zh:'中国', en:'China' } },
  HGH:{ zh:'杭州',     en:'Hangzhou',      co:{ ko:'중국', zh:'中国', en:'China' } },
  NKG:{ zh:'南京',     en:'Nanjing',       co:{ ko:'중국', zh:'中国', en:'China' } },
  XMN:{ zh:'厦门',     en:'Xiamen',        co:{ ko:'중국', zh:'中国', en:'China' } },
  TAO:{ zh:'青岛',     en:'Qingdao',       co:{ ko:'중국', zh:'中国', en:'China' } },
  TSN:{ zh:'天津',     en:'Tianjin',       co:{ ko:'중국', zh:'中国', en:'China' } },
  DLC:{ zh:'大连',     en:'Dalian',        co:{ ko:'중국', zh:'中国', en:'China' } },
  SHE:{ zh:'沈阳',     en:'Shenyang',      co:{ ko:'중국', zh:'中国', en:'China' } },
  HRB:{ zh:'哈尔滨',   en:'Harbin',        co:{ ko:'중국', zh:'中国', en:'China' } },
  CGO:{ zh:'郑州',     en:'Zhengzhou',     co:{ ko:'중국', zh:'中国', en:'China' } },
  TNA:{ zh:'济南',     en:"Jinan",         co:{ ko:'중국', zh:'中国', en:'China' } },
  KMG:{ zh:'昆明',     en:'Kunming',       co:{ ko:'중국', zh:'中国', en:'China' } },
  URC:{ zh:'乌鲁木齐', en:'Urumqi',        co:{ ko:'중국', zh:'中国', en:'China' } },
  CSX:{ zh:'长沙',     en:'Changsha',      co:{ ko:'중국', zh:'中国', en:'China' } },
  KHN:{ zh:'南昌',     en:'Nanchang',      co:{ ko:'중국', zh:'中国', en:'China' } },
  NNG:{ zh:'南宁',     en:'Nanning',       co:{ ko:'중국', zh:'中国', en:'China' } },
  HAK:{ zh:'海口',     en:'Haikou',        co:{ ko:'중국', zh:'中国', en:'China' } },
  SYX:{ zh:'三亚',     en:'Sanya',         co:{ ko:'중국', zh:'中国', en:'China' } },
  WEH:{ zh:'威海',     en:'Weihai',        co:{ ko:'중국', zh:'中国', en:'China' } },
  YNT:{ zh:'烟台',     en:'Yantai',        co:{ ko:'중국', zh:'中国', en:'China' } },
  // 홍콩·마카오·대만
  HKG:{ zh:'香港',     en:'Hong Kong',     co:{ ko:'홍콩', zh:'香港', en:'Hong Kong' } },
  MFM:{ zh:'澳门',     en:'Macau',         co:{ ko:'마카오', zh:'澳门', en:'Macau' } },
  TPE:{ zh:'台北桃园', en:'Taipei',        co:{ ko:'대만', zh:'台湾', en:'Taiwan' } },
  KHH:{ zh:'高雄',     en:'Kaohsiung',     co:{ ko:'대만', zh:'台湾', en:'Taiwan' } },
  // 동남아
  MNL:{ zh:'马尼拉',   en:'Manila',        co:{ ko:'필리핀', zh:'菲律宾', en:'Philippines' } },
  CEB:{ zh:'宿务',     en:'Cebu',          co:{ ko:'필리핀', zh:'菲律宾', en:'Philippines' } },
  DPS:{ zh:'巴厘岛',   en:'Bali',          co:{ ko:'인도네시아', zh:'印度尼西亚', en:'Indonesia' } },
  CGK:{ zh:'雅加达',   en:'Jakarta',       co:{ ko:'인도네시아', zh:'印度尼西亚', en:'Indonesia' } },
  SIN:{ zh:'新加坡',   en:'Singapore',     co:{ ko:'싱가포르', zh:'新加坡', en:'Singapore' } },
  KUL:{ zh:'吉隆坡',   en:'Kuala Lumpur',  co:{ ko:'말레이시아', zh:'马来西亚', en:'Malaysia' } },
  BKK:{ zh:'曼谷素万',  en:'Bangkok BKK',  co:{ ko:'태국', zh:'泰国', en:'Thailand' } },
  DMK:{ zh:'曼谷廊曼',  en:'Bangkok DMK',  co:{ ko:'태국', zh:'泰国', en:'Thailand' } },
  HKT:{ zh:'普吉',     en:'Phuket',        co:{ ko:'태국', zh:'泰国', en:'Thailand' } },
  CNX:{ zh:'清迈',     en:'Chiang Mai',    co:{ ko:'태국', zh:'泰国', en:'Thailand' } },
  HAN:{ zh:'河内',     en:'Hanoi',         co:{ ko:'베트남', zh:'越南', en:'Vietnam' } },
  SGN:{ zh:'胡志明市', en:'Ho Chi Minh',   co:{ ko:'베트남', zh:'越南', en:'Vietnam' } },
  DAD:{ zh:'岘港',     en:'Da Nang',       co:{ ko:'베트남', zh:'越南', en:'Vietnam' } },
  RGN:{ zh:'仰光',     en:'Yangon',        co:{ ko:'미얀마', zh:'缅甸', en:'Myanmar' } },
  REP:{ zh:'暹粒',     en:'Siem Reap',     co:{ ko:'캄보디아', zh:'柬埔寨', en:'Cambodia' } },
  // 남아시아·중앙아시아
  KTM:{ zh:'加德满都', en:'Kathmandu',     co:{ ko:'네팔', zh:'尼泊尔', en:'Nepal' } },
  DEL:{ zh:'德里',     en:'Delhi',         co:{ ko:'인도', zh:'印度', en:'India' } },
  BOM:{ zh:'孟买',     en:'Mumbai',        co:{ ko:'인도', zh:'印度', en:'India' } },
  ULN:{ zh:'乌兰巴托', en:'Ulaanbaatar',   co:{ ko:'몽골', zh:'蒙古', en:'Mongolia' } },
  TAS:{ zh:'塔什干',   en:'Tashkent',      co:{ ko:'우즈베키스탄', zh:'乌兹别克斯坦', en:'Uzbekistan' } },
  ALA:{ zh:'阿拉木图', en:'Almaty',        co:{ ko:'카자흐스탄', zh:'哈萨克斯坦', en:'Kazakhstan' } },
  // 중동
  DXB:{ zh:'迪拜',     en:'Dubai',         co:{ ko:'UAE', zh:'阿联酋', en:'UAE' } },
  DOH:{ zh:'多哈',     en:'Doha',          co:{ ko:'카타르', zh:'卡塔尔', en:'Qatar' } },
  AUH:{ zh:'阿布扎比', en:'Abu Dhabi',     co:{ ko:'UAE', zh:'阿联酋', en:'UAE' } },
  IST:{ zh:'伊斯坦布尔',en:'Istanbul',     co:{ ko:'터키', zh:'土耳其', en:'Turkey' } },
  // 유럽
  LHR:{ zh:'伦敦',     en:'London',        co:{ ko:'영국', zh:'英国', en:'UK' } },
  CDG:{ zh:'巴黎',     en:'Paris',         co:{ ko:'프랑스', zh:'法国', en:'France' } },
  FRA:{ zh:'法兰克福', en:'Frankfurt',     co:{ ko:'독일', zh:'德国', en:'Germany' } },
  AMS:{ zh:'阿姆斯特丹',en:'Amsterdam',    co:{ ko:'네덜란드', zh:'荷兰', en:'Netherlands' } },
  VIE:{ zh:'维也纳',   en:'Vienna',        co:{ ko:'오스트리아', zh:'奥地利', en:'Austria' } },
  ZRH:{ zh:'苏黎世',   en:'Zurich',        co:{ ko:'스위스', zh:'瑞士', en:'Switzerland' } },
  FCO:{ zh:'罗马',     en:'Rome',          co:{ ko:'이탈리아', zh:'意大利', en:'Italy' } },
  BCN:{ zh:'巴塞罗那', en:'Barcelona',     co:{ ko:'스페인', zh:'西班牙', en:'Spain' } },
  MAD:{ zh:'马德里',   en:'Madrid',        co:{ ko:'스페인', zh:'西班牙', en:'Spain' } },
  // 북미·오세아니아
  LAX:{ zh:'洛杉矶',   en:'Los Angeles',   co:{ ko:'미국', zh:'美国', en:'USA' } },
  JFK:{ zh:'纽约',     en:'New York',      co:{ ko:'미국', zh:'美国', en:'USA' } },
  SFO:{ zh:'旧金山',   en:'San Francisco', co:{ ko:'미국', zh:'美国', en:'USA' } },
  ORD:{ zh:'芝加哥',   en:'Chicago',       co:{ ko:'미국', zh:'美国', en:'USA' } },
  SEA:{ zh:'西雅图',   en:'Seattle',       co:{ ko:'미국', zh:'美国', en:'USA' } },
  YVR:{ zh:'温哥华',   en:'Vancouver',     co:{ ko:'캐나다', zh:'加拿大', en:'Canada' } },
  YYZ:{ zh:'多伦多',   en:'Toronto',       co:{ ko:'캐나다', zh:'加拿大', en:'Canada' } },
  SYD:{ zh:'悉尼',     en:'Sydney',        co:{ ko:'호주', zh:'澳大利亚', en:'Australia' } },
  MEL:{ zh:'墨尔本',   en:'Melbourne',     co:{ ko:'호주', zh:'澳大利亚', en:'Australia' } },
}

// 항공사명 번역 (한국어 → zh / en)
const AIRLINE = {
  '대한항공':     { zh:'大韩航空',       en:'Korean Air'         },
  '아시아나항공': { zh:'韩亚航空',       en:'Asiana Airlines'    },
  '제주항공':     { zh:'济州航空',       en:'Jeju Air'           },
  '진에어':       { zh:'真航空',         en:'Jin Air'            },
  '에어부산':     { zh:'釜山航空',       en:'Air Busan'          },
  '티웨이항공':   { zh:'T\'way航空',     en:"T'way Air"          },
  '에어서울':     { zh:'首尔航空',       en:'Air Seoul'          },
  '이스타항공':   { zh:'易斯达航空',     en:'Eastar Jet'         },
  '에어프레미아': { zh:'Air Premia',     en:'Air Premia'         },
  '중국국제항공': { zh:'中国国际航空',   en:'Air China'          },
  '중국동방항공': { zh:'中国东方航空',   en:'China Eastern'      },
  '중국남방항공': { zh:'中国南方航空',   en:'China Southern'     },
  '일본항공':     { zh:'日本航空',       en:'Japan Airlines'     },
  '전일본공수':   { zh:'全日本空输',     en:'ANA'                },
  '말레이시아항공':{ zh:'马来西亚航空',  en:'Malaysia Airlines'  },
  '말레이시아 항공':{ zh:'马来西亚航空', en:'Malaysia Airlines'  },
  '싱가포르항공': { zh:'新加坡航空',     en:'Singapore Airlines' },
  '타이항공':     { zh:'泰国航空',       en:'Thai Airways'       },
  '베트남항공':   { zh:'越南航空',       en:'Vietnam Airlines'   },
  '필리핀항공':   { zh:'菲律宾航空',     en:'Philippine Airlines'},
  '에미레이트항공':{ zh:'阿联酋航空',    en:'Emirates'           },
  '카타르항공':   { zh:'卡塔尔航空',     en:'Qatar Airways'      },
  '터키항공':     { zh:'土耳其航空',     en:'Turkish Airlines'   },
  '루프트한자':   { zh:'汉莎航空',       en:'Lufthansa'          },
  '에어프랑스':   { zh:'法国航空',       en:'Air France'         },
  '영국항공':     { zh:'英国航空',       en:'British Airways'    },
  '델타항공':     { zh:'达美航空',       en:'Delta Air Lines'    },
  '유나이티드항공':{ zh:'联合航空',      en:'United Airlines'    },
  '아메리칸항공': { zh:'美国航공',       en:'American Airlines'  },
  'KLM':          { zh:'荷兰皇家航空',   en:'KLM'                },
}

// { city, country } 반환 — 3개 언어 병기 + 번역 캐시 fallback
function getCityInfo(lang, airportCode, koName, translations) {
  const c = CITY[airportCode]
  if (c) {
    const parts = []
    if (c.zh) parts.push(c.zh)
    if (c.en && c.en !== c.zh) parts.push(c.en)
    const city = parts.length > 0 ? parts.join(' ') : koName
    const coParts = []
    if (c.co?.zh) coParts.push(c.co.zh)
    if (c.co?.en && c.co.en !== c.co.zh) coParts.push(c.co.en)
    const country = coParts.join(' ')
    return { city, country }
  }
  // CITY에 없는 도시 — 번역 캐시에서 조회
  const translated = translations?.[koName]
  if (translated && translated !== koName) {
    return { city: `${translated} ${koName}`, country: '' }
  }
  return { city: koName, country: '' }
}
function translateAirline(lang, koName) {
  const a = AIRLINE[koName]
  if (!a) return koName
  // 병기: 중국어 + 영어
  const parts = []
  if (a.zh) parts.push(a.zh)
  if (a.en && a.en !== a.zh) parts.push(a.en)
  return parts.length > 0 ? parts.join(' ') : koName
}

// P01=T1 본관 / P02=T2 / P03=탑승동(T1 소속, 셔틀 이용)
const TERM_LABEL = {
  P01: { ko: 'T1', zh: 'T1', en: 'T1', color: '#3B82F6', note: null },
  P02: { ko: 'T2', zh: 'T2', en: 'T2', color: '#8B5CF6', note: null },
  P03: { ko: 'T1', zh: 'T1', en: 'T1', color: '#3B82F6',
    note: { ko: '탑승동(셔틀)', zh: 'T1卫星楼', en: 'T1 Concourse' } },
}

const TEXTS = {
  title:      { ko: '인천공항 출발 현황', zh: '仁川机场出发航班', en: 'ICN Departures' },
  myFlight:   { ko: '내 항공편 찾기',   zh: '查找我的航班',   en: 'Find My Flight' },
  placeholder:{ ko: '편명 입력 (예: KE001)', zh: '输入航班号 (如: KE001)', en: 'Flight no. (e.g. KE001)' },
  notFound:   { ko: '해당 편명을 찾을 수 없습니다', zh: '未找到该航班', en: 'Flight not found' },
  search:     { ko: '편명·목적지 검색', zh: '搜索航班/目的地', en: 'Search' },
  noKey:      { ko: '실시간 데이터 준비 중', zh: '实时数据准备中', en: 'Loading data...' },
  noKeySub:   { ko: '인천공항 API 승인 후 표시됩니다', zh: '仁川机场API审批后显示', en: 'Awaiting API approval' },
  noFlight:   { ko: '운항 정보가 없습니다', zh: '暂无航班信息', en: 'No flights found' },
  updated:    { ko: '업데이트',  zh: '更新', en: 'Updated' },
  all:        { ko: '전체',      zh: '全部', en: 'All' },
  time:       { ko: '시간',      zh: '时间', en: 'Time' },
  dest:       { ko: '목적지',    zh: '目的地', en: 'Destination' },
  flight:     { ko: '편명',      zh: '航班', en: 'Flight' },
  gate:       { ko: '게이트·체크인', zh: '登机口·值机', en: 'Gate·Chk-in' },
  status:     { ko: '상태',      zh: '状态', en: 'Status' },
  terminal:   { ko: '터미널',    zh: '航站楼', en: 'Terminal' },
  gimpo:      { ko: '* 인천공항 전용 (김포 미지원)', zh: '* 仅限仁川机场', en: '* Incheon only' },
  disclaimer: {
    ko: '⚠️ 본 정보는 참고용입니다. 실제 탑승 전 공항 공식 전광판을 반드시 확인하세요.',
    zh: '⚠️ 本信息仅供参考，请以机场官方显示屏信息为准。',
    en: '⚠️ For reference only. Always verify at the official airport departure board.',
  },
}

function FlightRow({ f, lang, isEven }) {
  const ri = getRemarkInfo(f.remark)
  const delayed = f.remark === '지연' || (f.actualTime && f.actualTime !== f.scheduledTime && f.actualTime.length === 4)
  const tl = TERM_LABEL[f.terminal]
  const hasChkin = f.chkinrange && f.chkinrange !== '-' && f.chkinrange.trim()

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: '50px 1fr 66px 68px 70px',
      alignItems: 'center',
      padding: '10px 16px',
      background: isEven ? '#F9FAFB' : 'white',
      borderBottom: '1px solid #F3F4F6',
      gap: 6,
    }}>
      {/* 시간 */}
      <div>
        <div style={{ fontSize: 15, fontWeight: 700, color: delayed ? '#F59E0B' : '#111827', fontVariantNumeric: 'tabular-nums' }}>
          {fmt(f.scheduledTime)}
        </div>
        {delayed && <div style={{ fontSize: 10, color: '#F59E0B', marginTop: 1 }}>{fmt(f.actualTime)}</div>}
        {tl && (
          <div>
            <div style={{ marginTop: 3, display: 'inline-block', fontSize: 9, fontWeight: 700, color: tl.color, background: tl.color + '18', borderRadius: 3, padding: '1px 4px' }}>
              {L(lang, tl)}
            </div>
            {tl.note && (
              <div style={{ fontSize: 8, color: '#06B6D4', marginTop: 1 }}>{L(lang, tl.note)}</div>
            )}
          </div>
        )}
      </div>

      {/* 목적지 + 국가 + 항공사 */}
      <div style={{ minWidth: 0 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: '#111827', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {getCityInfo(lang, f.airportCode, f.destination, cityTranslations).city}
        </div>
        <div style={{ fontSize: 10, color: '#9CA3AF', marginTop: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {getCityInfo(lang, f.airportCode, f.destination, cityTranslations).country
            ? `${getCityInfo(lang, f.airportCode, f.destination, cityTranslations).country} · ${translateAirline(lang, f.airline)}`
            : translateAirline(lang, f.airline)}
        </div>
      </div>

      {/* 편명 */}
      <div style={{ fontSize: 11, color: '#6B7280', fontVariantNumeric: 'tabular-nums', textAlign: 'right' }}>
        {f.flightId}
      </div>

      {/* 게이트 + 체크인 */}
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: f.gate && f.gate !== '-' ? '#3B82F6' : '#D1D5DB' }}>
          {f.gate || '-'}
        </div>
        {hasChkin && (
          <div style={{ fontSize: 9, color: '#9CA3AF', marginTop: 1 }}>{f.chkinrange}</div>
        )}
      </div>

      {/* 상태 */}
      <div style={{ textAlign: 'right' }}>
        <span style={{ fontSize: 10, fontWeight: 700, color: ri.color, background: ri.color + '18', borderRadius: 5, padding: '3px 6px', whiteSpace: 'nowrap', display: 'inline-block' }}>
          {lang === 'zh' ? ri.zh : lang === 'en' ? ri.en : (f.remark || '정시')}
        </span>
      </div>
    </div>
  )
}

function MyFlightCard({ flight, lang }) {
  const ri = getRemarkInfo(flight.remark)
  const tl = TERM_LABEL[flight.terminal]
  const hasChkin = flight.chkinrange && flight.chkinrange !== '-'
  return (
    <div style={{ margin: '0 16px 12px', borderRadius: 14, border: `2px solid ${tl?.color || '#3B82F6'}`, background: (tl?.color || '#3B82F6') + '08', padding: '14px 16px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <PlaneTakeoff size={16} color={tl?.color || '#3B82F6'} />
          <span style={{ fontSize: 15, fontWeight: 700, color: '#111827' }}>{flight.flightId}</span>
          <span style={{ fontSize: 12, color: '#6B7280' }}>→ {getCityInfo(lang, flight.airportCode, flight.destination, cityTranslations).city}</span>
        </div>
        <span style={{ fontSize: 11, fontWeight: 700, color: ri.color, background: ri.color + '18', borderRadius: 6, padding: '3px 8px' }}>
          {lang === 'zh' ? ri.zh : lang === 'en' ? ri.en : (flight.remark || '정시')}
        </span>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
        <div style={{ textAlign: 'center', background: 'white', borderRadius: 10, padding: '8px 4px' }}>
          <div style={{ fontSize: 10, color: '#9CA3AF', marginBottom: 3 }}>{L(lang, TEXTS.terminal)}</div>
          <div style={{ fontSize: 18, fontWeight: 800, color: tl?.color || '#3B82F6' }}>{L(lang, tl) || '-'}</div>
        </div>
        <div style={{ textAlign: 'center', background: 'white', borderRadius: 10, padding: '8px 4px' }}>
          <div style={{ fontSize: 10, color: '#9CA3AF', marginBottom: 3 }}>{L(lang, TEXTS.gate)}</div>
          <div style={{ fontSize: 18, fontWeight: 800, color: '#111827' }}>{flight.gate || '-'}</div>
          {hasChkin && <div style={{ fontSize: 9, color: '#9CA3AF', marginTop: 2 }}>{flight.chkinrange}</div>}
        </div>
        <div style={{ textAlign: 'center', background: 'white', borderRadius: 10, padding: '8px 4px' }}>
          <div style={{ fontSize: 10, color: '#9CA3AF', marginBottom: 3 }}>{L(lang, TEXTS.time)}</div>
          <div style={{ fontSize: 18, fontWeight: 800, color: '#111827' }}>{fmt(flight.scheduledTime)}</div>
        </div>
      </div>
      <div style={{ marginTop: 8, fontSize: 11, color: '#9CA3AF', textAlign: 'center' }}>
        {translateAirline(lang, flight.airline)}
      </div>
      {flight.terminal === 'P03' && (
        <div style={{ marginTop: 8, padding: '7px 10px', background: '#ECFEFF', borderRadius: 8, border: '1px solid #A5F3FC', fontSize: 11, color: '#0891B2', textAlign: 'center' }}>
          {L(lang, {
            ko: '🚌 T1 도착 후 탑승동 셔틀 탑승 필요 (약 10분)',
            zh: '🚌 到达T1后需乘摆渡车前往卫星楼（约10分钟）',
            en: '🚌 Go to T1 → take shuttle to Concourse (~10 min)',
          })}
        </div>
      )}
    </div>
  )
}

export default function DepartureBoard({ onBack, setTab }) {
  const { lang } = useLanguage()
  const [flights, setFlights] = useState(null)
  const [loading, setLoading] = useState(true)
  const [query, setQuery] = useState('')
  const [updated, setUpdated] = useState(null)
  const [myFlightInput, setMyFlightInput] = useState('')
  const [airlineFilter, setAirlineFilter] = useState(null)
  const hasKey = !!(import.meta.env.VITE_AIRPORT_PROXY_URL || import.meta.env.VITE_AIRPORT_API_KEY)
  const [cityTranslations, setCityTranslations] = useState(() => loadTranslationCache(lang))

  // 항공편 로드 후 도시명 번역
  useEffect(() => {
    if (!flights || lang === 'ko') return
    const koNames = [...new Set(flights.map(f => f.destination).filter(Boolean))]
    const uncachedNames = koNames.filter(n => !CITY[n] && !cityTranslations[n])
    if (uncachedNames.length === 0) return
    translateCityNames(uncachedNames, lang).then(cache => setCityTranslations(cache))
  }, [flights, lang])

  async function load() {
    setLoading(true)
    const data = await fetchDepartureFlights({ numOfRows: 200 })
    setFlights(data)
    const kst = new Date(Date.now() + 9 * 60 * 60 * 1000)
    const hh = String(kst.getUTCHours()).padStart(2, '0')
    const min = String(kst.getUTCMinutes()).padStart(2, '0')
    setUpdated(`${hh}:${min}`)
    setLoading(false)
  }

  useEffect(() => { if (hasKey) load(); else setLoading(false) }, [])

  const allFlights = flights || []
  const airlines = [...new Set(allFlights.map(f => f.airline).filter(Boolean))].sort()

  const myFlight = myFlightInput.trim()
    ? allFlights.find(f => f.flightId?.toUpperCase() === myFlightInput.trim().toUpperCase())
    : null
  const myFlightNotFound = myFlightInput.trim().length >= 3 && !loading && !myFlight

  // 현재 KST 기준 -30분 이전 출발 편 숨김 (공항 전광판 기준)
  const nowHHMM = (() => {
    const kst = new Date(Date.now() + 9 * 60 * 60 * 1000)
    return kst.getUTCHours() * 60 + kst.getUTCMinutes() - 30
  })()
  const filtered = allFlights.filter(f => {
    const q = query.toLowerCase()
    const matchQ = !query || f.flightId?.toLowerCase().includes(q) || f.destination?.toLowerCase().includes(q) || f.airline?.toLowerCase().includes(q)
    const matchA = !airlineFilter || f.airline === airlineFilter
    const t = f.scheduledTime
    const flightMin = t?.length >= 4 ? parseInt(t.slice(0,2)) * 60 + parseInt(t.slice(2,4)) : 9999
    const matchTime = flightMin >= nowHHMM
    return matchQ && matchA && matchTime
  })

  // KST 날짜 (정적, 화면 열릴 때 계산)
  const kst = new Date(Date.now() + 9 * 60 * 60 * 1000)
  const kstDate = `${kst.getUTCFullYear()}.${String(kst.getUTCMonth()+1).padStart(2,'0')}.${String(kst.getUTCDate()).padStart(2,'0')}`

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 9500, display: 'flex', flexDirection: 'column', background: 'white', fontFamily: '"Noto Sans SC", Pretendard, Inter, sans-serif' }}>

      <NearPageHeader onBack={onBack} setTab={setTab} />

      {/* 현재시각 + 타이틀 */}
      <div style={{ background: '#0A0E1A', padding: '12px 16px 10px', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 4 }}>
              {L(lang, TEXTS.title)}
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
              <span style={{ fontSize: 22, fontWeight: 600, color: 'white', fontVariantNumeric: 'tabular-nums' }}>
                {kstDate}
              </span>
              <span style={{ fontSize: 11, fontWeight: 700, color: '#60A5FA', background: 'rgba(96,165,250,0.15)', borderRadius: 4, padding: '2px 6px' }}>
                KST
              </span>
            </div>
          </div>
          {hasKey && (
            <button onClick={load} style={{ background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: 8, cursor: 'pointer', padding: '6px 10px', display: 'flex', alignItems: 'center', gap: 5 }}>
              <RefreshCw size={13} color="rgba(255,255,255,0.6)" style={{ animation: loading ? 'spin 1s linear infinite' : 'none' }} />
              {updated && <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)' }}>{updated}</span>}
            </button>
          )}
        </div>
      </div>

      {/* 면책 고지 — 항상 표시 */}
      <div style={{ padding: '8px 16px', background: '#FFFBEB', borderBottom: '1px solid #FDE68A', flexShrink: 0 }}>
        <p style={{ margin: 0, fontSize: 11, color: '#92400E', lineHeight: 1.5 }}>
          {L(lang, TEXTS.disclaimer)}
        </p>
      </div>

      {/* 내 항공편 찾기 */}
      {hasKey && (
        <div style={{ background: '#F9FAFB', borderBottom: '1px solid #E5E7EB', padding: '10px 16px', flexShrink: 0 }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 6 }}>
            {L(lang, TEXTS.myFlight)}
          </div>
          <div style={{ position: 'relative' }}>
            <input
              value={myFlightInput}
              onChange={e => setMyFlightInput(e.target.value.toUpperCase())}
              placeholder={L(lang, TEXTS.placeholder)}
              style={{ width: '100%', boxSizing: 'border-box', padding: '9px 36px 9px 12px', borderRadius: 10, border: '1.5px solid ' + (myFlight ? '#3B82F6' : myFlightNotFound ? '#EF4444' : '#E5E7EB'), background: 'white', fontSize: 13, fontWeight: 600, outline: 'none', letterSpacing: '0.05em' }}
            />
            {myFlightInput && (
              <button onClick={() => setMyFlightInput('')} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', padding: 2 }}>
                <X size={13} color="#9CA3AF" />
              </button>
            )}
          </div>
          {myFlight && <MyFlightCard flight={myFlight} lang={lang} />}
          {myFlightNotFound && (
            <div style={{ marginTop: 6, fontSize: 12, color: '#EF4444' }}>{L(lang, TEXTS.notFound)}</div>
          )}
        </div>
      )}

      {/* 검색 + 항공사 필터 */}
      {hasKey && (
        <div style={{ background: 'white', borderBottom: '1px solid #F3F4F6', flexShrink: 0 }}>
          <div style={{ padding: '8px 16px 0', position: 'relative' }}>
            <Search size={13} style={{ position: 'absolute', left: 28, top: '50%', transform: 'translateY(-50%)', color: '#D1D5DB', pointerEvents: 'none' }} />
            <input
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder={L(lang, TEXTS.search)}
              style={{ width: '100%', boxSizing: 'border-box', padding: '8px 32px 8px 32px', borderRadius: 10, border: '1px solid #E5E7EB', background: '#F9FAFB', fontSize: 12, outline: 'none', color: '#111827' }}
            />
            {query && (
              <button onClick={() => setQuery('')} style={{ position: 'absolute', right: 28, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', padding: 2 }}>
                <X size={12} color="#9CA3AF" />
              </button>
            )}
          </div>
          {airlines.length > 0 && (
            <div style={{ display: 'flex', gap: 5, padding: '6px 16px 8px', overflowX: 'auto' }}>
              <button onClick={() => setAirlineFilter(null)}
                style={{ padding: '4px 11px', borderRadius: 16, fontSize: 11, fontWeight: 500, border: '1px solid ' + (!airlineFilter ? '#111827' : '#E5E7EB'), cursor: 'pointer', whiteSpace: 'nowrap', flexShrink: 0, background: !airlineFilter ? '#111827' : 'white', color: !airlineFilter ? 'white' : '#6B7280' }}>
                {L(lang, TEXTS.all)}
              </button>
              {airlines.map(a => (
                <button key={a} onClick={() => setAirlineFilter(airlineFilter === a ? null : a)}
                  style={{ padding: '4px 11px', borderRadius: 16, fontSize: 11, fontWeight: 500, border: '1px solid ' + (airlineFilter === a ? '#111827' : '#E5E7EB'), cursor: 'pointer', whiteSpace: 'nowrap', flexShrink: 0, background: airlineFilter === a ? '#111827' : 'white', color: airlineFilter === a ? 'white' : '#6B7280' }}>
                  {translateAirline(lang, a)}
                </button>
              ))}
            </div>
          )}
          {/* 컬럼 헤더 */}
          <div style={{ display: 'grid', gridTemplateColumns: '50px 1fr 66px 68px 70px', padding: '5px 16px', gap: 6, background: '#F9FAFB', borderTop: '1px solid #F3F4F6' }}>
            {['time','dest','flight','gate','status'].map((k, i) => (
              <div key={k} style={{ fontSize: 9, fontWeight: 700, color: '#9CA3AF', letterSpacing: '0.06em', textTransform: 'uppercase', textAlign: i >= 2 ? (i === 3 ? 'center' : 'right') : 'left' }}>
                {L(lang, TEXTS[k])}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 본문 */}
      <div style={{ flex: 1, overflowY: 'auto' }}>
        {!hasKey ? (
          <div style={{ padding: '60px 20px', textAlign: 'center' }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>🛫</div>
            <div style={{ fontSize: 15, fontWeight: 600, color: '#374151', marginBottom: 6 }}>{L(lang, TEXTS.noKey)}</div>
            <div style={{ fontSize: 12, color: '#9CA3AF' }}>{L(lang, TEXTS.noKeySub)}</div>
          </div>
        ) : loading ? (
          <div style={{ padding: '60px 20px', textAlign: 'center', color: '#9CA3AF', fontSize: 13 }}>준비 중...</div>
        ) : filtered.length === 0 ? (
          <div style={{ padding: '60px 20px', textAlign: 'center', color: '#9CA3AF', fontSize: 13 }}>{L(lang, TEXTS.noFlight)}</div>
        ) : (
          <>
            {filtered.map((f, i) => <FlightRow key={f.flightId + i} f={f} lang={lang} isEven={i % 2 === 0} />)}
            <div style={{ padding: '12px 16px 16px', fontSize: 10, color: '#D1D5DB', textAlign: 'center' }}>
              {L(lang, TEXTS.gimpo)}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
