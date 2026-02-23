import { useState } from 'react'
import { AlertTriangle, Phone, MapPin, Copy, Check, Navigation, Shield, Flame, Stethoscope, Car, Search as SearchIcon, HelpCircle, Building } from 'lucide-react'

function L(lang, d) { if (typeof d === 'string') return d; return d?.[lang] || d?.en || d?.zh || d?.ko || '' }

const emergencyNumbers = [
  { number: '112', label: { ko: '경찰', zh: '警察', en: 'Police' }, icon: Shield, color: 'bg-blue-600' },
  { number: '119', label: { ko: '소방/구급', zh: '消防/急救', en: 'Fire/Ambulance' }, icon: Flame, color: 'bg-red-600' },
  { number: '1345', label: { ko: '외국인종합안내', zh: '外国人综合咨询', en: 'Foreigner Help' }, icon: HelpCircle, color: 'bg-green-600' },
]

const situations = [
  { id: 'accident', label: { ko: '교통사고', zh: '交通事故', en: 'Traffic Accident' }, icon: Car,
    ko: '교통사고가 발생했습니다.', pron: 'gyo-tong-sa-go-ga bal-saeng-hae-sseum-ni-da' },
  { id: 'theft', label: { ko: '도난/분실', zh: '盗窃/遗失', en: 'Theft/Lost' }, icon: SearchIcon,
    ko: '도난/분실 사건이 발생했습니다.', pron: 'do-nan/bun-sil sa-geon-i bal-saeng-hae-sseum-ni-da' },
  { id: 'assault', label: { ko: '폭행', zh: '暴力', en: 'Assault' }, icon: AlertTriangle,
    ko: '폭행을 당했습니다.', pron: 'pok-haeng-eul dang-hae-sseum-ni-da' },
  { id: 'fire', label: { ko: '화재', zh: '火灾', en: 'Fire' }, icon: Flame,
    ko: '화재가 발생했습니다.', pron: 'hwa-jae-ga bal-saeng-hae-sseum-ni-da' },
  { id: 'medical', label: { ko: '의료 응급', zh: '医疗急救', en: 'Medical Emergency' }, icon: Stethoscope,
    ko: '의료 응급 상황입니다.', pron: 'ui-ryo eung-geup sang-hwang-im-ni-da' },
  { id: 'lost', label: { ko: '길을 잃음', zh: '迷路', en: 'Lost' }, icon: Navigation,
    ko: '길을 잃었습니다.', pron: 'gil-eul il-eo-sseum-ni-da' },
]

const nationalityMap = {
  china_mainland: { ko: '중국', zh: '中国', en: 'Chinese' },
  china_hk: { ko: '홍콩', zh: '香港', en: 'Hong Kong' },
  china_macau: { ko: '마카오', zh: '澳门', en: 'Macau' },
  china_taiwan: { ko: '대만', zh: '台湾', en: 'Taiwan' },
}

const embassies = [
  { name: { ko: '주한중국대사관', zh: '中国驻韩大使馆', en: 'Chinese Embassy in Korea' }, phone: '02-738-1038', addr: { ko: '서울 중구 명동2길 27', zh: '首尔中区明洞2街27号', en: '27, Myeongdong 2-gil, Jung-gu, Seoul' } },
  { name: { ko: '주부산중국총영사관', zh: '中国驻釜山总领事馆', en: 'Chinese Consulate in Busan' }, phone: '051-743-7990', addr: { ko: '부산 해운대구 APEC로 51', zh: '釜山海云台区APEC路51号', en: '51, APEC-ro, Haeundae-gu, Busan' } },
  { name: { ko: '주광주중국총영사관', zh: '中国驻光州总领事馆', en: 'Chinese Consulate in Gwangju' }, phone: '062-385-8874', addr: { ko: '광주 남구 치문대로 39', zh: '光州南区致文大路39号', en: '39, Chimundae-ro, Nam-gu, Gwangju' } },
  { name: { ko: '주제주중국총영사관', zh: '中国驻济州总领事馆', en: 'Chinese Consulate in Jeju' }, phone: '064-900-8830', addr: { ko: '제주 제주시 1100로 3351', zh: '济州市1100路3351号', en: '3351, 1100-ro, Jeju-si, Jeju' } },
]

export default function SOSTab({ lang, profile }) {
  const [location, setLocation] = useState(null)
  const [locLoading, setLocLoading] = useState(false)
  const [selectedSit, setSelectedSit] = useState(null)
  const [copied, setCopied] = useState(false)
  const [sosActive, setSosActive] = useState(false)

  const nat = nationalityMap[profile?.nationality] || nationalityMap.china_mainland

  const getLocation = () => {
    setLocLoading(true)
    try {
      if (!navigator.geolocation) {
        throw new Error('Geolocation not supported')
      }
      navigator.geolocation.getCurrentPosition(
        pos => {
          setLocation({ lat: pos.coords.latitude.toFixed(6), lng: pos.coords.longitude.toFixed(6) })
          setLocLoading(false)
        },
        (err) => { 
          console.warn('Geolocation access denied or failed:', err)
          setLocation({ lat: '37.5665', lng: '126.9780', fallback: true })
          setLocLoading(false)
        },
        { enableHighAccuracy: true, timeout: 10000 }
      )
    } catch (err) {
      console.warn('Geolocation API unavailable:', err)
      setLocation({ 
        lat: '37.5665', 
        lng: '126.9780', 
        fallback: true,
        error: lang === 'ko' ? '위치 서비스를 사용할 수 없습니다' : lang === 'zh' ? '无法使用位置服务' : 'Location service unavailable'
      })
      setLocLoading(false)
    }
  }

  const handleSOS = () => {
    setSosActive(true)
    getLocation()
  }

  const locStr = location ? `${location.lat}, ${location.lng}${location.fallback ? ' ('+L(lang,{ko:'위치확인불가',zh:'无法确认位置',en:'Location unavailable'})+')' : ''}` : L(lang, { ko: '위치 확인 중...', zh: '确认位置中...', en: 'Getting location...' })

  const sit = situations.find(s => s.id === selectedSit)
  const emergencyText = `저는 ${L('ko', nat)} 사람입니다.\n현재 위치는 ${location ? `위도 ${location.lat}, 경도 ${location.lng}` : '확인 중'} 입니다.\n${sit ? sit.ko : '도움이 필요합니다.'}\n도움이 필요합니다. 한국어를 잘 못합니다.\n외국인 도움 전화: 1345`

  const copyAll = () => {
    navigator.clipboard.writeText(emergencyText).catch(() => {})
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="space-y-4 animate-fade-up">
      {/* SOS Button */}
      <button onClick={handleSOS}
        className={`w-full rounded-2xl p-8 text-center transition-all ${
          sosActive ? 'bg-red-600 animate-pulse' : 'bg-red-500 hover:bg-red-600'
        } shadow-lg`}>
        <AlertTriangle size={48} className="text-white mx-auto mb-3" />
        <p className="text-white text-2xl font-black">SOS</p>
        <p className="text-white/80 text-sm mt-1">{L(lang, { ko: '긴급 도움 요청', zh: '紧急求助', en: 'Emergency Help' })}</p>
      </button>

      {/* Emergency Numbers */}
      <div className="grid grid-cols-3 gap-2">
        {emergencyNumbers.map(em => (
          <a key={em.number} href={`tel:${em.number}`}
            className="bg-white rounded-2xl p-4 border border-[#E5E7EB] card-glow text-center hover:shadow-md transition-all">
            <div className={`w-10 h-10 ${em.color} rounded-full flex items-center justify-center mx-auto mb-2`}>
              <em.icon size={18} className="text-white" />
            </div>
            <p className="font-black text-[#111827] text-lg">{em.number}</p>
            <p className="text-[10px] text-[#6B7280] mt-0.5">{L(lang, em.label)}</p>
          </a>
        ))}
      </div>

      {/* Location */}
      {sosActive && (
        <div className="bg-white rounded-2xl p-5 border border-[#E5E7EB] card-glow">
          <div className="flex items-center gap-2 mb-2">
            <MapPin size={16} className="text-[#111827]" />
            <h3 className="font-bold text-[#111827] text-sm">{L(lang, { ko: '현재 위치', zh: '当前位置', en: 'Current Location' })}</h3>
          </div>
          {locLoading ? (
            <p className="text-sm text-[#6B7280]">{L(lang, { ko: '위치 확인 중...', zh: '定位中...', en: 'Getting location...' })}</p>
          ) : location ? (
            <div>
              <p className="text-sm text-[#111827] font-mono">{location.lat}, {location.lng}</p>
              {location.fallback && <p className="text-xs text-red-500 mt-1">{L(lang, { ko: '정확한 위치를 가져올 수 없습니다', zh: '无法获取精确位置', en: 'Could not get exact location' })}</p>}
              <div className="flex gap-2 mt-3">
                <a href={`https://map.kakao.com/link/map/내위치,${location.lat},${location.lng}`} target="_blank" rel="noopener noreferrer"
                  className="text-xs px-3 py-1.5 bg-[#F3F4F6] rounded-lg text-[#111827] hover:bg-[#E5E7EB]">
                  {L(lang, { ko: '카카오맵', zh: 'Kakao地图', en: 'Kakao Map' })}
                </a>
                <a href={`https://www.google.com/maps?q=${location.lat},${location.lng}`} target="_blank" rel="noopener noreferrer"
                  className="text-xs px-3 py-1.5 bg-[#F3F4F6] rounded-lg text-[#111827] hover:bg-[#E5E7EB]">
                  {L(lang, { ko: '구글 지도', zh: '谷歌地图', en: 'Google Maps' })}
                </a>
              </div>
            </div>
          ) : (
            <button onClick={getLocation} className="text-sm text-[#111827] underline">{L(lang, { ko: '위치 가져오기', zh: '获取位置', en: 'Get Location' })}</button>
          )}
        </div>
      )}

      {/* Situation Select */}
      <div className="bg-white rounded-2xl p-5 border border-[#E5E7EB] card-glow">
        <h3 className="font-bold text-[#111827] text-sm mb-3">{L(lang, { ko: '상황 선택', zh: '选择情况', en: 'Select Situation' })}</h3>
        <div className="grid grid-cols-3 gap-2">
          {situations.map(s => (
            <button key={s.id} onClick={() => setSelectedSit(s.id)}
              className={`p-3 rounded-xl text-center transition-all ${
                selectedSit === s.id ? 'bg-[#111827] text-white' : 'bg-[#F3F4F6] text-[#111827] hover:bg-[#E5E7EB]'
              }`}>
              <s.icon size={18} className="mx-auto mb-1" />
              <p className="text-[10px] font-semibold">{L(lang, s.label)}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Generated Korean Text */}
      {(sosActive || selectedSit) && (
        <div className="bg-red-50 rounded-2xl p-5 border border-red-200">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold text-red-800 text-sm">{L(lang, { ko: '한국인에게 보여주세요', zh: '给韩国人看', en: 'Show to Korean person' })}</h3>
            <button onClick={copyAll} className="flex items-center gap-1 px-3 py-1.5 bg-white rounded-lg text-xs text-red-600 border border-red-200">
              {copied ? <Check size={12} /> : <Copy size={12} />}
              {copied ? L(lang, { ko: '복사됨', zh: '已复制', en: 'Copied' }) : L(lang, { ko: '전체 복사', zh: '全部复制', en: 'Copy All' })}
            </button>
          </div>
          <div className="bg-white rounded-xl p-4 text-[#111827] text-sm whitespace-pre-line font-medium leading-relaxed">
            {emergencyText}
          </div>
          {sit && (
            <p className="text-xs text-red-600 mt-2 italic">[{sit.pron}]</p>
          )}
        </div>
      )}

      {/* Nearby Search Links */}
      <div className="bg-white rounded-2xl p-5 border border-[#E5E7EB] card-glow">
        <h3 className="font-bold text-[#111827] text-sm mb-3">{L(lang, { ko: '주변 검색', zh: '附近搜索', en: 'Nearby Search' })}</h3>
        <div className="grid grid-cols-2 gap-2">
          {[
            { label: { ko: '가까운 병원', zh: '附近医院', en: 'Nearby Hospital' }, q: '병원', icon: Stethoscope },
            { label: { ko: '가까운 경찰서', zh: '附近警察局', en: 'Nearby Police' }, q: '경찰서', icon: Shield },
            { label: { ko: '가까운 약국', zh: '附近药店', en: 'Nearby Pharmacy' }, q: '약국', icon: Building },
            { label: { ko: '가까운 편의점', zh: '附近便利店', en: 'Nearby Convenience Store' }, q: '편의점', icon: Building },
          ].map((item, i) => (
            <a key={i} href={`https://map.kakao.com/link/search/${encodeURIComponent(item.q)}`} target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-2 bg-[#F3F4F6] rounded-xl p-3 hover:bg-[#E5E7EB] transition-colors">
              <item.icon size={16} className="text-[#111827]" />
              <span className="text-xs font-semibold text-[#111827]">{L(lang, item.label)}</span>
            </a>
          ))}
        </div>
      </div>

      {/* Embassy Info */}
      <div className="bg-white rounded-2xl p-5 border border-[#E5E7EB] card-glow">
        <h3 className="font-bold text-[#111827] text-sm mb-3">{L(lang, { ko: '중국 대사관/영사관', zh: '中国大使馆/领事馆', en: 'Chinese Embassy/Consulate' })}</h3>
        <div className="space-y-3">
          {embassies.map((em, i) => (
            <div key={i} className="bg-[#F8F9FA] rounded-xl p-3">
              <p className="font-semibold text-[#111827] text-sm">{L(lang, em.name)}</p>
              <p className="text-xs text-[#6B7280] mt-1">{L(lang, em.addr)}</p>
              <a href={`tel:${em.phone.replace(/-/g, '')}`} className="flex items-center gap-1 mt-2 text-xs text-blue-600 font-semibold">
                <Phone size={12} /> {em.phone}
              </a>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
