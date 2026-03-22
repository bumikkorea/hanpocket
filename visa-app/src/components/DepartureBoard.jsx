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

function L(lang, d) {
  if (typeof d === 'string') return d
  return d?.[lang] || d?.ko || d?.zh || d?.en || ''
}
function fmt(hhmm) {
  if (!hhmm || hhmm.length < 4) return '--:--'
  return `${hhmm.slice(0, 2)}:${hhmm.slice(2, 4)}`
}

// IATA 코드 → 도시명 (zh / en)
const CITY = {
  NRT:{ zh:'东京成田', en:'Tokyo (NRT)' }, HND:{ zh:'东京羽田', en:'Tokyo (HND)' },
  KIX:{ zh:'大阪',    en:'Osaka'       }, CTS:{ zh:'札幌',    en:'Sapporo'     },
  FUK:{ zh:'福冈',    en:'Fukuoka'     }, NGO:{ zh:'名古屋',  en:'Nagoya'      },
  OKA:{ zh:'冲绳',    en:'Okinawa'     }, SDJ:{ zh:'仙台',    en:'Sendai'      },
  PEK:{ zh:'北京首都',en:'Beijing Cap' }, PKX:{ zh:'北京大兴',en:'Beijing Dax' },
  PVG:{ zh:'上海浦东',en:'Shanghai PVG'}, SHA:{ zh:'上海虹桥',en:'Shanghai SHA'},
  CAN:{ zh:'广州',    en:'Guangzhou'   }, SZX:{ zh:'深圳',    en:'Shenzhen'    },
  CTU:{ zh:'成都',    en:'Chengdu'     }, CKG:{ zh:'重庆',    en:'Chongqing'   },
  XIY:{ zh:'西安',    en:"Xi'an"       }, WUH:{ zh:'武汉',    en:'Wuhan'       },
  HGH:{ zh:'杭州',    en:'Hangzhou'    }, NKG:{ zh:'南京',    en:'Nanjing'     },
  XMN:{ zh:'厦门',    en:'Xiamen'      }, TAO:{ zh:'青岛',    en:'Qingdao'     },
  TSN:{ zh:'天津',    en:'Tianjin'     }, DLC:{ zh:'大连',    en:'Dalian'      },
  SHE:{ zh:'沈阳',    en:'Shenyang'    }, HRB:{ zh:'哈尔滨',  en:'Harbin'      },
  CGO:{ zh:'郑州',    en:'Zhengzhou'   }, TNA:{ zh:'济南',    en:"Ji'nan"      },
  KMG:{ zh:'昆明',    en:'Kunming'     }, URC:{ zh:'乌鲁木齐',en:'Urumqi'      },
  CSX:{ zh:'长沙',    en:'Changsha'    }, KHN:{ zh:'南昌',    en:'Nanchang'    },
  HKG:{ zh:'香港',    en:'Hong Kong'   }, MFM:{ zh:'澳门',    en:'Macau'       },
  TPE:{ zh:'台北',    en:'Taipei'      }, KHH:{ zh:'高雄',    en:'Kaohsiung'   },
  MNL:{ zh:'马尼拉',  en:'Manila'      }, CEB:{ zh:'宿务',    en:'Cebu'        },
  DPS:{ zh:'巴厘岛',  en:'Bali'        }, SIN:{ zh:'新加坡',  en:'Singapore'   },
  KUL:{ zh:'吉隆坡',  en:'Kuala Lumpur'}, BKK:{ zh:'曼谷',    en:'Bangkok'     },
  DMK:{ zh:'曼谷廊曼',en:'Bangkok DMK' }, HKT:{ zh:'普吉',    en:'Phuket'      },
  HAN:{ zh:'河内',    en:'Hanoi'       }, SGN:{ zh:'胡志明市',en:'Ho Chi Minh' },
  DAD:{ zh:'岘港',    en:'Da Nang'     }, RGN:{ zh:'仰光',    en:'Yangon'      },
  KTM:{ zh:'加德满都',en:'Kathmandu'   }, DEL:{ zh:'德里',    en:'Delhi'       },
  BOM:{ zh:'孟买',    en:'Mumbai'      }, ULN:{ zh:'乌兰巴托',en:'Ulaanbaatar' },
  TAS:{ zh:'塔什干',  en:'Tashkent'    }, ALA:{ zh:'阿拉木图',en:'Almaty'      },
  DXB:{ zh:'迪拜',    en:'Dubai'       }, DOH:{ zh:'多哈',    en:'Doha'        },
  AUH:{ zh:'阿布扎比',en:'Abu Dhabi'   }, IST:{ zh:'伊斯坦布尔',en:'Istanbul'  },
  LHR:{ zh:'伦敦',    en:'London'      }, CDG:{ zh:'巴黎',    en:'Paris'       },
  FRA:{ zh:'法兰克福',en:'Frankfurt'   }, AMS:{ zh:'阿姆斯特丹',en:'Amsterdam' },
  VIE:{ zh:'维也纳',  en:'Vienna'      }, ZRH:{ zh:'苏黎世',  en:'Zurich'      },
  FCO:{ zh:'罗马',    en:'Rome'        }, BCN:{ zh:'巴塞罗那',en:'Barcelona'   },
  LAX:{ zh:'洛杉矶',  en:'Los Angeles' }, JFK:{ zh:'纽约',    en:'New York'    },
  SFO:{ zh:'旧金山',  en:'San Francisco'}, ORD:{ zh:'芝加哥', en:'Chicago'     },
  YVR:{ zh:'温哥华',  en:'Vancouver'   }, YYZ:{ zh:'多伦多',  en:'Toronto'     },
  SYD:{ zh:'悉尼',    en:'Sydney'      }, MEL:{ zh:'墨尔本',  en:'Melbourne'   },
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

function translateCity(lang, airportCode, koName) {
  if (lang === 'ko') return koName
  const c = CITY[airportCode]
  if (c) return c[lang] || koName
  return koName
}
function translateAirline(lang, koName) {
  if (lang === 'ko') return koName
  const a = AIRLINE[koName]
  if (a) return a[lang] || koName
  return koName
}

// P01=T1 본관 / P02=T2 / P03=탑승동(T1)
const TERM_LABEL = {
  P01: { ko: 'T1',   zh: 'T1',   en: 'T1',   color: '#3B82F6' },
  P02: { ko: 'T2',   zh: 'T2',   en: 'T2',   color: '#8B5CF6' },
  P03: { ko: '탑승동', zh: '卫星楼', en: 'Conc', color: '#06B6D4' },
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
          <div style={{ marginTop: 3, display: 'inline-block', fontSize: 9, fontWeight: 700, color: tl.color, background: tl.color + '18', borderRadius: 3, padding: '1px 4px' }}>
            {L(lang, tl)}
          </div>
        )}
      </div>

      {/* 목적지 + 항공사 */}
      <div style={{ minWidth: 0 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: '#111827', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {translateCity(lang, f.airportCode, f.destination)}
        </div>
        <div style={{ fontSize: 10, color: '#9CA3AF', marginTop: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {translateAirline(lang, f.airline)}
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
          <span style={{ fontSize: 12, color: '#6B7280' }}>→ {translateCity(lang, flight.airportCode, flight.destination)}</span>
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
  const [now, setNow] = useState(new Date())
  const hasKey = !!import.meta.env.VITE_AIRPORT_API_KEY

  useEffect(() => {
    const iv = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(iv)
  }, [])

  async function load() {
    setLoading(true)
    const data = await fetchDepartureFlights({ numOfRows: 200 })
    setFlights(data)
    setUpdated(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }))
    setLoading(false)
  }

  useEffect(() => { if (hasKey) load(); else setLoading(false) }, [])

  const allFlights = flights || []
  const airlines = [...new Set(allFlights.map(f => f.airline).filter(Boolean))].sort()

  const myFlight = myFlightInput.trim()
    ? allFlights.find(f => f.flightId?.toUpperCase() === myFlightInput.trim().toUpperCase())
    : null
  const myFlightNotFound = myFlightInput.trim().length >= 3 && !loading && !myFlight

  const filtered = allFlights.filter(f => {
    const q = query.toLowerCase()
    const matchQ = !query || f.flightId?.toLowerCase().includes(q) || f.destination?.toLowerCase().includes(q) || f.airline?.toLowerCase().includes(q)
    const matchA = !airlineFilter || f.airline === airlineFilter
    return matchQ && matchA
  })

  const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false })

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 9500, display: 'flex', flexDirection: 'column', background: 'white', fontFamily: '"Noto Sans SC", Pretendard, Inter, sans-serif' }}>

      <NearPageHeader onBack={onBack} setTab={setTab} />

      {/* 현재시각 + 타이틀 */}
      <div style={{ background: '#0A0E1A', padding: '12px 16px 10px', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 2 }}>
              {L(lang, TEXTS.title)}
            </div>
            <div style={{ fontSize: 28, fontWeight: 300, color: 'white', fontVariantNumeric: 'tabular-nums', letterSpacing: '0.02em' }}>
              {timeStr}
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
            <div style={{ padding: '12px 16px', fontSize: 10, color: '#D1D5DB', textAlign: 'center' }}>
              {L(lang, TEXTS.gimpo)}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
