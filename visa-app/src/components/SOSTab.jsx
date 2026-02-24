import { useState } from 'react'
import { 
  AlertTriangle, Phone, MapPin, Copy, Check, Navigation, Shield, Flame, 
  Stethoscope, Car, Search as SearchIcon, HelpCircle, Building, 
  Volume2, Heart, Thermometer, Wind, Pill, Activity, Eye, Brain, 
  Zap, Bandage, Baby, User, ChevronRight, Share2, RefreshCw, Map
} from 'lucide-react'

function L(lang, d) { if (typeof d === 'string') return d; return d?.[lang] || d?.en || d?.zh || d?.ko || '' }

const emergencyNumbers = [
  { number: '112', label: { ko: '경찰', zh: '警察', en: 'Police' }, icon: Shield, color: 'bg-blue-600' },
  { number: '119', label: { ko: '소방/구급', zh: '消防/急救', en: 'Fire/Ambulance' }, icon: Flame, color: 'bg-red-600' },
  { number: '1345', label: { ko: '외국인종합안내', zh: '外国人综合咨询', en: 'Foreigner Help' }, icon: HelpCircle, color: 'bg-green-600' },
]

// 20+ Medical symptom cards
const medicalCards = [
  { id: 'headache', ko: '머리가 아파요', zh: '头痛', pinyin: 'tóu tòng', pron: 'meo-ri-ga a-pa-yo', icon: Brain },
  { id: 'stomachache', ko: '배가 아파요', zh: '肚子痛', pinyin: 'dù zi tòng', pron: 'bae-ga a-pa-yo', icon: Activity },
  { id: 'fever', ko: '열이 나요', zh: '发烧', pinyin: 'fā shāo', pron: 'yeol-i na-yo', icon: Thermometer },
  { id: 'breathing', ko: '숨이 차요', zh: '呼吸困难', pinyin: 'hū xī kùn nán', pron: 'sum-i cha-yo', icon: Wind },
  { id: 'allergy', ko: '알레르기가 있어요', zh: '我有过敏', pinyin: 'wǒ yǒu guò mǐn', pron: 'al-le-reu-gi-ga is-seo-yo', icon: Pill },
  { id: 'chest', ko: '가슴이 아파요', zh: '胸痛', pinyin: 'xiōng tòng', pron: 'ga-seum-i a-pa-yo', icon: Heart },
  { id: 'back', ko: '허리가 아파요', zh: '腰痛', pinyin: 'yāo tòng', pron: 'heo-ri-ga a-pa-yo', icon: User },
  { id: 'dizzy', ko: '어지러워요', zh: '头晕', pinyin: 'tóu yūn', pron: 'eo-ji-reo-wo-yo', icon: Zap },
  { id: 'nausea', ko: '구역질이 나요', zh: '恶心', pinyin: 'ě xīn', pron: 'gu-yeok-jil-i na-yo', icon: Activity },
  { id: 'diarrhea', ko: '설사를 해요', zh: '腹泻', pinyin: 'fù xiè', pron: 'seol-sa-reul hae-yo', icon: Activity },
  { id: 'vomit', ko: '토해요', zh: '呕吐', pinyin: 'ǒu tù', pron: 'to-hae-yo', icon: Activity },
  { id: 'sore_throat', ko: '목이 아파요', zh: '嗓子疼', pinyin: 'sǎng zi téng', pron: 'mog-i a-pa-yo', icon: Activity },
  { id: 'cough', ko: '기침이 나요', zh: '咳嗽', pinyin: 'ké sòu', pron: 'gi-chim-i na-yo', icon: Wind },
  { id: 'tooth', ko: '이가 아파요', zh: '牙疼', pinyin: 'yá téng', pron: 'i-ga a-pa-yo', icon: Activity },
  { id: 'eye', ko: '눈이 아파요', zh: '眼睛疼', pinyin: 'yǎn jīng téng', pron: 'nun-i a-pa-yo', icon: Eye },
  { id: 'ear', ko: '귀가 아파요', zh: '耳朵疼', pinyin: 'ěr duǒ téng', pron: 'gwi-ga a-pa-yo', icon: Activity },
  { id: 'leg', ko: '다리가 아파요', zh: '腿疼', pinyin: 'tuǐ téng', pron: 'da-ri-ga a-pa-yo', icon: User },
  { id: 'arm', ko: '팔이 아파요', zh: '胳膊疼', pinyin: 'gē bó téng', pron: 'pal-i a-pa-yo', icon: User },
  { id: 'skin', ko: '피부가 가려워요', zh: '皮肤痒', pinyin: 'pí fū yǎng', pron: 'pi-bu-ga ga-ryeo-wo-yo', icon: User },
  { id: 'cut', ko: '상처가 났어요', zh: '受伤了', pinyin: 'shòu shāng le', pron: 'sang-cheo-ga nas-seo-yo', icon: Bandage },
  { id: 'burn', ko: '화상을 입었어요', zh: '烫伤了', pinyin: 'tàng shāng le', pron: 'hwa-sang-eul ib-eoss-eo-yo', icon: Flame },
  { id: 'faint', ko: '기절할 것 같아요', zh: '要昏倒了', pinyin: 'yào hūn dǎo le', pron: 'gi-jeol-hal geot gat-a-yo', icon: Zap },
  { id: 'pregnant', ko: '임신했어요', zh: '我怀孕了', pinyin: 'wǒ huái yùn le', pron: 'im-sin-hae-sseo-yo', icon: Baby },
  { id: 'medicine', ko: '약이 필요해요', zh: '需要药物', pinyin: 'xū yào yào wù', pron: 'yag-i pil-yo-hae-yo', icon: Pill },
]

// Emergency Korean phrases
const emergencyPhrases = [
  { ko: '도와주세요', zh: '请帮助我', pinyin: 'qǐng bāng zhù wǒ', pron: 'do-wa-ju-se-yo' },
  { ko: '저는 중국인입니다', zh: '我是中国人', pinyin: 'wǒ shì zhōng guó rén', pron: 'jeo-neun jung-gug-in-im-ni-da' },
  { ko: '한국어를 못합니다', zh: '我不会韩语', pinyin: 'wǒ bù huì hán yǔ', pron: 'han-gug-eo-reul mot-ham-ni-da' },
  { ko: '여기가 어디예요?', zh: '这是哪里？', pinyin: 'zhè shì nǎ lǐ', pron: 'yeo-gi-ga eo-di-ye-yo' },
  { ko: '병원에 가야 해요', zh: '我需要去医院', pinyin: 'wǒ xū yào qù yī yuán', pron: 'byeong-won-e ga-ya hae-yo' },
  { ko: '응급실이 어디예요?', zh: '急诊室在哪里？', pinyin: 'jí zhěn shì zài nǎ lǐ', pron: 'eung-geup-sil-i eo-di-ye-yo' },
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
  const [currentSection, setCurrentSection] = useState('main')
  const [addressCopied, setAddressCopied] = useState(false)
  const [koAddress, setKoAddress] = useState('')
  const [selectedSymptom, setSelectedSymptom] = useState(null)

  const nat = nationalityMap[profile?.nationality] || nationalityMap.china_mainland

  // TTS Function
  const speakKorean = (text) => {
    if ('speechSynthesis' in window) {
      speechSynthesis.cancel()
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.lang = 'ko-KR'
      utterance.rate = 0.8
      speechSynthesis.speak(utterance)
    }
  }

  // Enhanced location with Korean address conversion
  const getLocation = async () => {
    setLocLoading(true)
    try {
      if (!navigator.geolocation) {
        throw new Error('Geolocation not supported')
      }
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          const lat = pos.coords.latitude.toFixed(6)
          const lng = pos.coords.longitude.toFixed(6)
          
          // Try to get Korean address using reverse geocoding
          try {
            // Using Kakao Map API for Korean address (free tier available)
            const response = await fetch(`https://dapi.kakao.com/v2/local/geo/coord2address.json?x=${lng}&y=${lat}`, {
              headers: {
                'Authorization': 'KakaoAK YOUR_KAKAO_API_KEY' // Would need actual API key
              }
            })
            if (response.ok) {
              const data = await response.json()
              const addr = data.documents?.[0]?.address
              if (addr) {
                setKoAddress(`${addr.region_1depth_name} ${addr.region_2depth_name} ${addr.region_3depth_name}`)
              }
            }
          } catch (e) {
            // Fallback: use district based on coordinates (simplified)
            if (lat > 37.4 && lat < 37.7 && lng > 126.8 && lng < 127.2) {
              setKoAddress('서울특별시 (대략적 위치)')
            } else if (lat > 35.0 && lat < 35.3 && lng > 128.9 && lng < 129.3) {
              setKoAddress('부산광역시 (대략적 위치)')
            } else {
              setKoAddress('대한민국 (대략적 위치)')
            }
          }
          
          setLocation({ lat, lng })
          setLocLoading(false)
        },
        (err) => { 
          console.warn('Geolocation access denied or failed:', err)
          setLocation({ lat: '37.5665', lng: '126.9780', fallback: true })
          setKoAddress('서울특별시 중구 (기본 위치)')
          setLocLoading(false)
        },
        { enableHighAccuracy: true, timeout: 15000 }
      )
    } catch (err) {
      console.warn('Geolocation API unavailable:', err)
      setLocation({ 
        lat: '37.5665', 
        lng: '126.9780', 
        fallback: true,
        error: lang === 'ko' ? '위치 서비스를 사용할 수 없습니다' : lang === 'zh' ? '无法使用位置服务' : 'Location service unavailable'
      })
      setKoAddress('서울특별시 중구 (기본 위치)')
      setLocLoading(false)
    }
  }

  const handleSOS = () => {
    setSosActive(true)
    getLocation()
  }

  const locStr = location ? `${location.lat}, ${location.lng}${location.fallback ? ' ('+L(lang,{ko:'위치확인불가',zh:'无法确认位置',en:'Location unavailable'})+')' : ''}` : L(lang, { ko: '위치 확인 중...', zh: '确认位置中...', en: 'Getting location...' })

  const sit = situations.find(s => s.id === selectedSit)
  const emergencyText = `저는 ${L('ko', nat)} 사람입니다.\n현재 위치는 ${koAddress || (location ? `위도 ${location.lat}, 경도 ${location.lng}` : '확인 중')} 입니다.\n${sit ? sit.ko : '도움이 필요합니다.'}\n도움이 필요합니다. 한국어를 잘 못합니다.\n외국인 도움 전화: 1345`

  const copyAll = () => {
    navigator.clipboard.writeText(emergencyText).catch(() => {})
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const copyAddress = () => {
    const fullAddress = `${koAddress}\n위도: ${location?.lat}, 경도: ${location?.lng}`
    navigator.clipboard.writeText(fullAddress).catch(() => {})
    setAddressCopied(true)
    setTimeout(() => setAddressCopied(false), 2000)
  }

  const shareLocation = () => {
    const shareText = `내 위치: ${koAddress}\n좌표: ${location?.lat}, ${location?.lng}\nhttps://map.kakao.com/link/map/내위치,${location?.lat},${location?.lng}`
    
    if (navigator.share) {
      navigator.share({
        title: '내 현재 위치',
        text: shareText,
      }).catch(console.error)
    } else {
      navigator.clipboard.writeText(shareText).catch(() => {})
      setAddressCopied(true)
      setTimeout(() => setAddressCopied(false), 2000)
    }
  }

  if (currentSection === 'symptoms') {
    return (
      <div className="space-y-4 animate-fade-up">
        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <button onClick={() => setCurrentSection('main')} className="text-red-600 hover:text-red-700">
            <ChevronRight size={20} className="rotate-180" strokeWidth={1} />
          </button>
          <h2 className="text-xl font-black text-red-600">{L(lang, { ko: '증상 표현 카드', zh: '症状表达卡', en: 'Symptom Cards' })}</h2>
        </div>

        {/* Symptom Cards Grid */}
        <div className="grid grid-cols-1 gap-3">
          {medicalCards.map((symptom) => (
            <div key={symptom.id} className="bg-white rounded-2xl p-4 border-2 border-red-100 shadow-sm hover:border-red-300 transition-all">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                  <symptom.icon size={20} className="text-red-600" strokeWidth={1} />
                </div>
                <div className="flex-1">
                  <p className="text-2xl font-black text-gray-900">{symptom.ko}</p>
                  <p className="text-lg text-red-600 font-bold">{symptom.zh}</p>
                </div>
                <button 
                  onClick={() => speakKorean(symptom.ko)}
                  className="w-12 h-12 bg-red-600 hover:bg-red-700 text-white rounded-full flex items-center justify-center transition-colors"
                >
                  <Volume2 size={20} strokeWidth={1} />
                </button>
              </div>
              <div className="bg-gray-50 rounded-xl p-3">
                <p className="text-sm text-gray-600">
                  <span className="font-medium">{L(lang, { ko: '중국어 발음:', zh: '拼音:', en: 'Pinyin:' })}</span> {symptom.pinyin}
                </p>
                <p className="text-sm text-gray-600 mt-1">
                  <span className="font-medium">{L(lang, { ko: '한국어 발음:', zh: '韩语发音:', en: 'Korean pronunciation:' })}</span> [{symptom.pron}]
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (currentSection === 'phrases') {
    return (
      <div className="space-y-4 animate-fade-up">
        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <button onClick={() => setCurrentSection('main')} className="text-red-600 hover:text-red-700">
            <ChevronRight size={20} className="rotate-180" strokeWidth={1} />
          </button>
          <h2 className="text-xl font-black text-red-600">{L(lang, { ko: '긴급 한국어 문장', zh: '紧急韩语句子', en: 'Emergency Korean Phrases' })}</h2>
        </div>

        {/* Phrase Cards */}
        <div className="grid grid-cols-1 gap-3">
          {emergencyPhrases.map((phrase, index) => (
            <div key={index} className="bg-white rounded-2xl p-4 border-2 border-red-100 shadow-sm hover:border-red-300 transition-all">
              <div className="flex items-center gap-3">
                <div className="flex-1">
                  <p className="text-3xl font-black text-gray-900 mb-2">{phrase.ko}</p>
                  <p className="text-lg text-red-600 font-bold mb-1">{phrase.zh}</p>
                  <p className="text-sm text-gray-600">[{phrase.pron}]</p>
                </div>
                <button 
                  onClick={() => speakKorean(phrase.ko)}
                  className="w-14 h-14 bg-red-600 hover:bg-red-700 text-white rounded-full flex items-center justify-center transition-colors"
                >
                  <Volume2 size={24} strokeWidth={1} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4 animate-fade-up">
      {/* SOS Button */}
      <button onClick={handleSOS}
        className={`w-full rounded-3xl p-8 text-center transition-all ${
          sosActive ? 'bg-red-600 animate-pulse shadow-2xl' : 'bg-red-500 hover:bg-red-600 shadow-xl'
        }`}>
        <AlertTriangle size={56} className="text-white mx-auto mb-3" strokeWidth={1} />
        <p className="text-white text-3xl font-black mb-1">SOS</p>
        <p className="text-white/90 text-base font-medium">{L(lang, { ko: '긴급 도움 요청', zh: '紧急求助', en: 'Emergency Help' })}</p>
      </button>

      {/* Emergency Call Buttons - Enhanced */}
      <div className="grid grid-cols-3 gap-3">
        {emergencyNumbers.map(em => (
          <a key={em.number} href={`tel:${em.number}`}
            className="bg-white rounded-2xl p-5 border-2 border-gray-100 hover:border-red-300 text-center hover:shadow-lg transition-all transform hover:scale-105">
            <div className={`w-12 h-12 ${em.color} rounded-full flex items-center justify-center mx-auto mb-3`}>
              <em.icon size={24} className="text-white" strokeWidth={1} />
            </div>
            <p className="font-black text-gray-900 text-xl mb-1">{em.number}</p>
            <p className="text-xs text-gray-600 font-medium">{L(lang, em.label)}</p>
          </a>
        ))}
      </div>

      {/* Quick Access Cards */}
      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={() => setCurrentSection('symptoms')}
          className="bg-red-50 border-2 border-red-200 rounded-2xl p-4 hover:bg-red-100 transition-all"
        >
          <Stethoscope size={32} className="text-red-600 mx-auto mb-2" strokeWidth={1} />
          <p className="font-black text-red-700 text-sm">{L(lang, { ko: '증상 표현 카드', zh: '症状表达卡', en: 'Symptom Cards' })}</p>
          <p className="text-xs text-red-600 mt-1">{L(lang, { ko: '20개+ 증상', zh: '20+症状', en: '20+ symptoms' })}</p>
        </button>
        
        <button
          onClick={() => setCurrentSection('phrases')}
          className="bg-blue-50 border-2 border-blue-200 rounded-2xl p-4 hover:bg-blue-100 transition-all"
        >
          <Volume2 size={32} className="text-blue-600 mx-auto mb-2" strokeWidth={1} />
          <p className="font-black text-blue-700 text-sm">{L(lang, { ko: '긴급 문장', zh: '紧急句子', en: 'Emergency Phrases' })}</p>
          <p className="text-xs text-blue-600 mt-1">{L(lang, { ko: 'TTS 지원', zh: 'TTS支持', en: 'TTS Support' })}</p>
        </button>
      </div>

      {/* Enhanced Location Section */}
      {sosActive && (
        <div className="bg-white rounded-2xl p-5 border-2 border-red-200 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <MapPin size={20} className="text-red-600" strokeWidth={1} />
            <h3 className="font-black text-red-700 text-lg">{L(lang, { ko: '현재 위치', zh: '当前位置', en: 'Current Location' })}</h3>
          </div>
          
          {locLoading ? (
            <div className="flex items-center gap-2">
              <RefreshCw size={16} className="text-gray-400 animate-spin" strokeWidth={1} />
              <p className="text-gray-600">{L(lang, { ko: '위치 확인 중...', zh: '定位中...', en: 'Getting location...' })}</p>
            </div>
          ) : location ? (
            <div className="space-y-3">
              {/* Korean Address */}
              {koAddress && (
                <div className="bg-red-50 rounded-xl p-4">
                  <p className="font-black text-gray-900 text-lg mb-1">{koAddress}</p>
                  <p className="text-sm text-gray-600 font-mono">{L(lang, { ko: '좌표:', zh: '坐标:', en: 'Coordinates:' })} {location.lat}, {location.lng}</p>
                  {location.fallback && <p className="text-xs text-red-500 mt-1">{L(lang, { ko: '대략적 위치', zh: '大概位置', en: 'Approximate location' })}</p>}
                </div>
              )}
              
              {/* Action Buttons */}
              <div className="flex gap-2">
                <button onClick={copyAddress} className="flex-1 flex items-center justify-center gap-1 px-4 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors">
                  {addressCopied ? <Check size={16} strokeWidth={1} /> : <Copy size={16} strokeWidth={1} />}
                  <span className="text-sm font-bold">{addressCopied ? L(lang, { ko: '복사됨!', zh: '已复制!', en: 'Copied!' }) : L(lang, { ko: '주소 복사', zh: '复制地址', en: 'Copy Address' })}</span>
                </button>
                <button onClick={shareLocation} className="flex-1 flex items-center justify-center gap-1 px-4 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors">
                  <Share2 size={16} strokeWidth={1} />
                  <span className="text-sm font-bold">{L(lang, { ko: '위치 공유', zh: '分享位置', en: 'Share Location' })}</span>
                </button>
              </div>
              
              {/* Map Links */}
              <div className="flex gap-2">
                <a href={`https://map.kakao.com/link/map/내위치,${location.lat},${location.lng}`} target="_blank" rel="noopener noreferrer"
                  className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">
                  <Map size={14} strokeWidth={1} />
                  <span className="text-xs font-semibold text-gray-700">{L(lang, { ko: '카카오맵', zh: 'Kakao地图', en: 'Kakao Map' })}</span>
                </a>
                <a href={`https://www.google.com/maps?q=${location.lat},${location.lng}`} target="_blank" rel="noopener noreferrer"
                  className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">
                  <Map size={14} strokeWidth={1} />
                  <span className="text-xs font-semibold text-gray-700">{L(lang, { ko: '구글 지도', zh: '谷歌地图', en: 'Google Maps' })}</span>
                </a>
              </div>
            </div>
          ) : (
            <button onClick={getLocation} className="w-full py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors font-bold">
              {L(lang, { ko: '위치 가져오기', zh: '获取位置', en: 'Get Location' })}
            </button>
          )}
        </div>
      )}

      {/* Situation Select */}
      <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-sm">
        <h3 className="font-black text-gray-900 text-lg mb-3">{L(lang, { ko: '상황 선택', zh: '选择情况', en: 'Select Situation' })}</h3>
        <div className="grid grid-cols-3 gap-2">
          {situations.map(s => (
            <button key={s.id} onClick={() => setSelectedSit(s.id)}
              className={`p-4 rounded-xl text-center transition-all ${
                selectedSit === s.id ? 'bg-red-600 text-white shadow-lg' : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
              }`}>
              <s.icon size={20} className="mx-auto mb-2" strokeWidth={1} />
              <p className="text-xs font-bold">{L(lang, s.label)}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Generated Korean Text */}
      {(sosActive || selectedSit) && (
        <div className="bg-red-50 rounded-2xl p-5 border-2 border-red-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-black text-red-800 text-lg">{L(lang, { ko: '한국인에게 보여주세요', zh: '给韩国人看', en: 'Show to Korean person' })}</h3>
            <button onClick={copyAll} className="flex items-center gap-2 px-4 py-2 bg-white rounded-xl text-red-600 border-2 border-red-200 hover:bg-red-50 transition-colors">
              {copied ? <Check size={16} strokeWidth={1} /> : <Copy size={16} strokeWidth={1} />}
              <span className="text-sm font-bold">{copied ? L(lang, { ko: '복사됨', zh: '已复制', en: 'Copied' }) : L(lang, { ko: '전체 복사', zh: '全部复制', en: 'Copy All' })}</span>
            </button>
          </div>
          <div className="bg-white rounded-xl p-5 text-gray-900 text-lg whitespace-pre-line font-medium leading-relaxed shadow-sm">
            {emergencyText}
          </div>
          {sit && (
            <div className="mt-3 flex items-center gap-2">
              <p className="text-sm text-red-600 italic flex-1">[{sit.pron}]</p>
              <button 
                onClick={() => speakKorean(sit.ko)}
                className="w-8 h-8 bg-red-600 hover:bg-red-700 text-white rounded-full flex items-center justify-center"
              >
                <Volume2 size={14} strokeWidth={1} />
              </button>
            </div>
          )}
        </div>
      )}

      {/* Nearby Search Links */}
      <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-sm">
        <h3 className="font-black text-gray-900 text-lg mb-3">{L(lang, { ko: '주변 검색', zh: '附近搜索', en: 'Nearby Search' })}</h3>
        <div className="grid grid-cols-2 gap-2">
          {[
            { label: { ko: '가까운 병원', zh: '附近医院', en: 'Nearby Hospital' }, q: '병원', icon: Stethoscope, color: 'red' },
            { label: { ko: '가까운 경찰서', zh: '附近警察局', en: 'Nearby Police' }, q: '경찰서', icon: Shield, color: 'blue' },
            { label: { ko: '가까운 약국', zh: '附近药店', en: 'Nearby Pharmacy' }, q: '약국', icon: Pill, color: 'green' },
            { label: { ko: '가까운 편의점', zh: '附近便利店', en: 'Nearby Convenience Store' }, q: '편의점', icon: Building, color: 'gray' },
          ].map((item, i) => (
            <a key={i} href={`https://map.kakao.com/link/search/${encodeURIComponent(item.q)}`} target="_blank" rel="noopener noreferrer"
              className={`flex items-center gap-3 bg-${item.color}-50 border border-${item.color}-200 rounded-xl p-3 hover:bg-${item.color}-100 transition-colors`}>
              <item.icon size={18} className={`text-${item.color}-600`} strokeWidth={1} />
              <span className="text-sm font-bold text-gray-800">{L(lang, item.label)}</span>
            </a>
          ))}
        </div>
      </div>

      {/* Embassy Info - Enhanced */}
      <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-sm">
        <h3 className="font-black text-gray-900 text-lg mb-4">{L(lang, { ko: '중국 대사관/영사관', zh: '中国大使馆/领事馆', en: 'Chinese Embassy/Consulate' })}</h3>
        <div className="space-y-3">
          {embassies.map((em, i) => (
            <div key={i} className="bg-blue-50 rounded-xl p-4 border border-blue-100">
              <p className="font-black text-gray-900 text-base mb-1">{L(lang, em.name)}</p>
              <p className="text-sm text-gray-600 mb-3">{L(lang, em.addr)}</p>
              <a href={`tel:${em.phone.replace(/-/g, '')}`} 
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors">
                <Phone size={16} strokeWidth={1} /> 
                <span className="font-bold">{em.phone}</span>
              </a>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}