import { useState, useRef, useCallback } from 'react'
import { Baby, MapPin, ShoppingCart, Phone, Camera, AlertTriangle, Clock, Car } from 'lucide-react'
import GuideLayout from './GuideLayout'

function L(lang, d) { 
  if (typeof d === 'string') return d
  return d?.[lang] || d?.en || d?.zh || d?.ko || '' 
}

const AIRPORT_FACILITIES = [
  {
    terminal: 'T1',
    facilities: [
      { 
        type: 'nursing', 
        locations: ['3층 출국장 28번 게이트 근처', '지하1층 도착장 5번 출구 근처'],
        icon: '🍼',
        name: { ko: '수유실', zh: '哺乳室', en: 'Nursing Room' }
      },
      { 
        type: 'diaper', 
        locations: ['모든 화장실 내 기저귀교환대', '수유실 내 전용 공간'],
        icon: '👶',
        name: { ko: '기저귀교환대', zh: '换尿布台', en: 'Diaper Changing Station' }
      },
      { 
        type: 'stroller', 
        locations: ['1층 도착장 정보센터', '3층 출국장 인포메이션'],
        icon: '🚼',
        name: { ko: '유모차 대여', zh: '婴儿车租借', en: 'Stroller Rental' }
      }
    ]
  },
  {
    terminal: 'T2',
    facilities: [
      { 
        type: 'nursing', 
        locations: ['3층 출국장 253번 게이트 근처', '1층 도착장 중앙홀'],
        icon: '🍼',
        name: { ko: '수유실', zh: '哺乳室', en: 'Nursing Room' }
      },
      { 
        type: 'diaper', 
        locations: ['모든 화장실 내', '키즈 플레이룸 인근'],
        icon: '👶',
        name: { ko: '기저귀교환대', zh: '换尿布台', en: 'Diaper Changing Station' }
      },
      { 
        type: 'play', 
        locations: ['3층 출국장 키즈 플레이룸'],
        icon: '🎮',
        name: { ko: '키즈 플레이룸', zh: '儿童游戏室', en: 'Kids Play Room' }
      }
    ]
  }
]

const BABY_BRANDS = [
  {
    category: { ko: '분유', zh: '奶粉', en: 'Baby Formula' },
    items: [
      { name: '앱솔루트', brand: 'Maeil', price: '₩15,000-20,000', age: '0-12개월' },
      { name: '프리미엄 골드', brand: 'Namyang', price: '₩18,000-25,000', age: '0-24개월' },
      { name: '트루맘', brand: 'Maeil', price: '₩16,000-22,000', age: '6-24개월' }
    ]
  },
  {
    category: { ko: '기저귀', zh: '尿布', en: 'Diapers' },
    items: [
      { name: '하기스', brand: 'Huggies', price: '₩12,000-18,000', age: 'S-XL' },
      { name: '보솜이', brand: 'Bosomi', price: '₩10,000-15,000', age: 'S-XL' },
      { name: '페미센스', brand: 'Yuhan-Kimberly', price: '₩11,000-16,000', age: 'S-XL' }
    ]
  },
  {
    category: { ko: '이유식', zh: '婴儿辅食', en: 'Baby Food' },
    items: [
      { name: '아기랑', brand: 'Maeil', price: '₩2,000-4,000', age: '5-24개월' },
      { name: '베베쿡', brand: 'Bebecook', price: '₩3,000-6,000', age: '6-36개월' },
      { name: '리틀쿡', brand: 'Ottogi', price: '₩2,500-5,000', age: '7-24개월' }
    ]
  }
]

const PEDIATRIC_HOSPITALS = [
  {
    name: { ko: '서울대학교 어린이병원', zh: '首尔大学儿童医院', en: 'Seoul National University Children\'s Hospital' },
    address: '서울 종로구 대학로 101',
    phone: '02-2072-3570',
    emergency: '24시간',
    languages: { ko: '영어, 중국어 가능', zh: '可使用英语、中文', en: 'English, Chinese available' }
  },
  {
    name: { ko: '삼성서울병원 소아과', zh: '三星首尔医院儿科', en: 'Samsung Medical Center Pediatrics' },
    address: '서울 강남구 일원로 81',
    phone: '02-3410-3525',
    emergency: '24시간',
    languages: { ko: '영어 가능', zh: '可使용英语', en: 'English available' }
  },
  {
    name: { ko: '세브란스 어린이병원', zh: '世福兰斯儿童医院', en: 'Severance Children\'s Hospital' },
    address: '서울 서대문구 연세로 50-1',
    phone: '02-2228-5821',
    emergency: '24시간',
    languages: { ko: '영어, 중국어 가능', zh: '可使用英语、中文', en: 'English, Chinese available' }
  }
]

export default function KidsGuide({ lang, onClose }) {
  const [activeTab, setActiveTab] = useState('airport')
  const [showCard, setShowCard] = useState(false)
  const [cardData, setCardData] = useState({
    childName: '',
    parentName: '',
    parentPhone: '',
    hotelName: '',
    hotelPhone: '',
    emergency: ''
  })
  const cardRef = useRef(null)

  const handleCapture = useCallback(async () => {
    const el = cardRef.current
    if (!el) return

    try {
      const { default: html2canvas } = await import('https://cdn.jsdelivr.net/npm/html2canvas@1.4.1/+esm')
      const canvas = await html2canvas(el, {
        backgroundColor: '#ffffff',
        scale: 2,
        useCORS: true,
        logging: false
      })
      const link = document.createElement('a')
      link.download = 'kids-safety-card.png'
      link.href = canvas.toDataURL('image/png')
      link.click()
    } catch {
      alert(L(lang, {
        ko: '스크린샷 기능을 사용할 수 없습니다. 기기의 스크린샷 기능을 사용해주세요.',
        zh: '截图功能不可用，请使用设备自带的截图功能。',
        en: 'Screenshot not available. Please use your device screenshot feature.'
      }))
    }
  }, [lang])

  const updateCardData = (field, value) => {
    setCardData(prev => ({ ...prev, [field]: value }))
  }

  const isCardDataComplete = () => {
    return cardData.childName && cardData.parentName && cardData.parentPhone
  }

  const title = { 
    ko: '유아동반 여행 가이드', 
    zh: '携婴幼儿旅行指南', 
    en: 'Traveling with Kids Guide' 
  }

  const tip = {
    ko: '한국은 아이에게 친화적인 시설이 잘 갖춰져 있습니다. 미아 방지 카드를 미리 만들어서 아이 옷에 붙여주세요.',
    zh: '韩国的儿童友好设施很完善。请提前制作防走失卡片，贴在孩子衣服上。',
    en: 'Korea has excellent kid-friendly facilities. Create a safety card in advance and attach it to your child\'s clothes.'
  }

  return (
    <GuideLayout title={title} lang={lang} onClose={onClose} tip={tip}>
      {/* Tab Navigation */}
      <div className="flex border-b border-gray-200 mb-4">
        <button
          onClick={() => setActiveTab('airport')}
          className={`flex-1 py-3 text-sm font-medium text-center transition-colors ${
            activeTab === 'airport'
              ? 'border-b-2 border-blue-600 text-blue-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <MapPin size={16} className="inline-block mr-1" />
          {L(lang, { ko: '공항시설', zh: '机场设施', en: 'Airport Facilities' })}
        </button>
        <button
          onClick={() => setActiveTab('shopping')}
          className={`flex-1 py-3 text-sm font-medium text-center transition-colors ${
            activeTab === 'shopping'
              ? 'border-b-2 border-blue-600 text-blue-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <ShoppingCart size={16} className="inline-block mr-1" />
          {L(lang, { ko: '육아용품', zh: '育儿用品', en: 'Baby Products' })}
        </button>
        <button
          onClick={() => setActiveTab('emergency')}
          className={`flex-1 py-3 text-sm font-medium text-center transition-colors ${
            activeTab === 'emergency'
              ? 'border-b-2 border-blue-600 text-blue-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <Phone size={16} className="inline-block mr-1" />
          {L(lang, { ko: '응급/안전', zh: '急救/安全', en: 'Emergency/Safety' })}
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === 'airport' && (
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-[#1A1A1A] mb-4">
            {L(lang, { ko: '인천공항 육아 시설', zh: '仁川机场育儿设施', en: 'Incheon Airport Baby Facilities' })}
          </h2>

          {AIRPORT_FACILITIES.map((terminal) => (
            <div key={terminal.terminal} className="bg-white border border-gray-200 rounded-xl p-4">
              <h3 className="font-bold text-[#1A1A1A] mb-3 flex items-center gap-2">
                <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-sm">
                  {terminal.terminal}
                </span>
                {L(lang, { ko: '터미널', zh: '航站楼', en: 'Terminal' })}
              </h3>
              
              <div className="space-y-3">
                {terminal.facilities.map((facility, index) => (
                  <div key={index} className="border-l-4 border-blue-200 pl-4">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-lg">{facility.icon}</span>
                      <h4 className="font-semibold text-gray-800">{L(lang, facility.name)}</h4>
                    </div>
                    <ul className="text-sm text-gray-600 space-y-1">
                      {facility.locations.map((location, locIndex) => (
                        <li key={locIndex} className="flex items-start gap-1">
                          <span className="text-blue-500 mt-1">•</span>
                          {location}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          ))}

          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
            <h3 className="font-bold text-[#1A1A1A] mb-2">
              <Car className="inline-block mr-2" size={16} />
              {L(lang, { ko: '택시 카시트 정보', zh: '出租车儿童座椅信息', en: 'Taxi Car Seat Info' })}
            </h3>
            <div className="text-sm space-y-2">
              <p><strong>{L(lang, { ko: '카카오T 카시트:', zh: 'KakaoT儿童座椅:', en: 'KakaoT Car Seat:' })}</strong></p>
              <ul className="text-gray-600 space-y-1 ml-4">
                <li>• {L(lang, { ko: '카카오T 앱에서 "카시트" 옵션 선택', zh: 'KakaoT应用中选择"儿童座椅"选项', en: 'Select "Car Seat" option in KakaoT app' })}</li>
                <li>• {L(lang, { ko: '추가 요금: 약 2,000-3,000원', zh: '额外费用：约2,000-3,000韩元', en: 'Extra fee: ~₩2,000-3,000' })}</li>
                <li>• {L(lang, { ko: '6세 이하 권장', zh: '建议6岁以下使用', en: 'Recommended for under 6 years old' })}</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'shopping' && (
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-[#1A1A1A] mb-4">
            {L(lang, { ko: '한국 육아용품 브랜드', zh: '韩国育儿用品品牌', en: 'Korean Baby Product Brands' })}
          </h2>

          {BABY_BRANDS.map((category, categoryIndex) => (
            <div key={categoryIndex} className="bg-white border border-gray-200 rounded-xl p-4">
              <h3 className="font-bold text-[#1A1A1A] mb-3 flex items-center gap-2">
                <span className="text-2xl">
                  {category.category.ko === '분유' && '🍼'}
                  {category.category.ko === '기저귀' && '👶'}
                  {category.category.ko === '이유식' && '🥄'}
                </span>
                {L(lang, category.category)}
              </h3>
              
              <div className="space-y-3">
                {category.items.map((item, index) => (
                  <div key={index} className="flex justify-between items-start bg-gray-50 rounded-lg p-3">
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-800">{item.name}</h4>
                      <p className="text-sm text-gray-600">{item.brand}</p>
                      <p className="text-xs text-gray-500">{item.age}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-blue-600">{item.price}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}

          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
            <h3 className="font-bold text-[#1A1A1A] mb-2">
              <ShoppingCart className="inline-block mr-2" size={16} />
              {L(lang, { ko: '구매 장소', zh: '购买地点', en: 'Where to Buy' })}
            </h3>
            <div className="text-sm space-y-2">
              <div>
                <p className="font-medium">{L(lang, { ko: '대형마트:', zh: '大型超市:', en: 'Large Marts:' })}</p>
                <ul className="text-gray-600 ml-4">
                  <li>• 이마트, 롯데마트, 홈플러스</li>
                  <li>• {L(lang, { ko: '24시간 운영점 일부 있음', zh: '部分店铺24小时营业', en: 'Some locations open 24/7' })}</li>
                </ul>
              </div>
              <div>
                <p className="font-medium">{L(lang, { ko: '편의점:', zh: '便利店:', en: 'Convenience Stores:' })}</p>
                <ul className="text-gray-600 ml-4">
                  <li>• {L(lang, { ko: '기본 기저귀, 분유만 판매', zh: '只销售基本尿布、奶粉', en: 'Basic diapers and formula only' })}</li>
                  <li>• {L(lang, { ko: '24시간 이용 가능', zh: '24小时可用', en: '24/7 available' })}</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'emergency' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-bold text-[#1A1A1A]">
              {L(lang, { ko: '응급 상황 대비', zh: '紧急情况准备', en: 'Emergency Preparedness' })}
            </h2>
            <button
              onClick={() => setShowCard(!showCard)}
              className="px-3 py-1 text-sm bg-red-100 text-red-700 rounded-lg"
            >
              {L(lang, { ko: '미아방지 카드', zh: '防走失卡', en: 'Safety Card' })}
            </button>
          </div>

          {/* Pediatric Hospitals */}
          <div>
            <h3 className="font-bold text-[#1A1A1A] mb-3">
              {L(lang, { ko: '소아과 병원', zh: '儿科医院', en: 'Pediatric Hospitals' })}
            </h3>
            {PEDIATRIC_HOSPITALS.map((hospital, index) => (
              <div key={index} className="bg-white border border-gray-200 rounded-xl p-4 mb-3">
                <h4 className="font-bold text-[#1A1A1A] mb-2">{L(lang, hospital.name)}</h4>
                <div className="text-sm space-y-1">
                  <p className="flex items-center gap-2">
                    <MapPin size={14} className="text-blue-600" />
                    {hospital.address}
                  </p>
                  <p className="flex items-center gap-2">
                    <Phone size={14} className="text-green-600" />
                    {hospital.phone}
                  </p>
                  <p className="flex items-center gap-2">
                    <Clock size={14} className="text-orange-600" />
                    {L(lang, { ko: '응급실:', zh: '急诊室:', en: 'Emergency:' })} {hospital.emergency}
                  </p>
                  <p className="text-gray-600">{L(lang, hospital.languages)}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Safety Card Generator */}
          {showCard && (
            <div className="space-y-4">
              <h3 className="font-bold text-[#1A1A1A]">
                {L(lang, { ko: '미아방지 카드 생성', zh: '制作防走失卡', en: 'Create Safety Card' })}
              </h3>
              
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {L(lang, { ko: '아이 이름', zh: '孩子姓名', en: 'Child\'s Name' })}
                  </label>
                  <input
                    type="text"
                    value={cardData.childName}
                    onChange={(e) => updateCardData('childName', e.target.value)}
                    placeholder={L(lang, { ko: '예: 김민수', zh: '例: 김민수', en: 'e.g. 김민수' })}
                    className="w-full p-2 border border-gray-200 rounded-lg"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {L(lang, { ko: '부모 이름', zh: '父母姓名', en: 'Parent\'s Name' })}
                  </label>
                  <input
                    type="text"
                    value={cardData.parentName}
                    onChange={(e) => updateCardData('parentName', e.target.value)}
                    placeholder={L(lang, { ko: '예: 김철수', zh: '例: 김철수', en: 'e.g. 김철수' })}
                    className="w-full p-2 border border-gray-200 rounded-lg"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {L(lang, { ko: '부모 연락처', zh: '父母联系方式', en: 'Parent\'s Phone' })}
                  </label>
                  <input
                    type="tel"
                    value={cardData.parentPhone}
                    onChange={(e) => updateCardData('parentPhone', e.target.value)}
                    placeholder={L(lang, { ko: '예: +82-10-1234-5678', zh: '例: +82-10-1234-5678', en: 'e.g. +82-10-1234-5678' })}
                    className="w-full p-2 border border-gray-200 rounded-lg"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {L(lang, { ko: '숙소 이름', zh: '住宿名称', en: 'Hotel Name' })}
                  </label>
                  <input
                    type="text"
                    value={cardData.hotelName}
                    onChange={(e) => updateCardData('hotelName', e.target.value)}
                    placeholder={L(lang, { ko: '예: 롯데호텔', zh: '例: 乐天酒店', en: 'e.g. Lotte Hotel' })}
                    className="w-full p-2 border border-gray-200 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {L(lang, { ko: '숙소 연락처', zh: '住宿联系方式', en: 'Hotel Phone' })}
                  </label>
                  <input
                    type="tel"
                    value={cardData.hotelPhone}
                    onChange={(e) => updateCardData('hotelPhone', e.target.value)}
                    placeholder={L(lang, { ko: '예: 02-771-1000', zh: '例: 02-771-1000', en: 'e.g. 02-771-1000' })}
                    className="w-full p-2 border border-gray-200 rounded-lg"
                  />
                </div>
              </div>

              {isCardDataComplete() && (
                <div className="space-y-4">
                  <div className="flex justify-end">
                    <button
                      onClick={handleCapture}
                      className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700"
                    >
                      <Camera size={14} />
                      {L(lang, { ko: '카드 저장', zh: '保存卡片', en: 'Save Card' })}
                    </button>
                  </div>

                  <div className="flex justify-center">
                    <div 
                      ref={cardRef}
                      className="w-72 bg-white border-4 border-red-500 rounded-2xl p-4 "
                    >
                      <div className="text-center space-y-3">
                        <div className="bg-red-100 rounded-lg p-2">
                          <h3 className="text-xl font-bold text-red-700">
                            {L(lang, { ko: '미아 방지 카드', zh: '防走失卡', en: '미아 방지 카드' })}
                          </h3>
                        </div>
                        
                        <div className="text-left space-y-2">
                          <div>
                            <p className="text-sm text-gray-600">{L(lang, { ko: '아이 이름:', zh: '孩子姓名:', en: '아이 이름:' })}</p>
                            <p className="text-lg font-bold">{cardData.childName}</p>
                          </div>
                          
                          <div>
                            <p className="text-sm text-gray-600">{L(lang, { ko: '부모님:', zh: '父母:', en: '부모님:' })}</p>
                            <p className="font-medium">{cardData.parentName}</p>
                            <p className="text-blue-600 font-medium">{cardData.parentPhone}</p>
                          </div>
                          
                          {cardData.hotelName && (
                            <div>
                              <p className="text-sm text-gray-600">{L(lang, { ko: '숙소:', zh: '住宿:', en: '숙소:' })}</p>
                              <p className="font-medium">{cardData.hotelName}</p>
                              {cardData.hotelPhone && (
                                <p className="text-green-600 font-medium">{cardData.hotelPhone}</p>
                              )}
                            </div>
                          )}

                          <div className="bg-yellow-100 rounded-lg p-2">
                            <p className="text-sm font-bold text-center">
                              {L(lang, { ko: '경찰서: 112', zh: '报警电话: 112', en: '경찰서: 112' })}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Emergency Contacts */}
          <div className="bg-red-50 border border-red-200 rounded-xl p-4">
            <h3 className="font-bold text-[#1A1A1A] mb-2">
              <AlertTriangle className="inline-block mr-2" size={16} />
              {L(lang, { ko: '응급 연락처', zh: '紧急联系方式', en: 'Emergency Contacts' })}
            </h3>
            <div className="text-sm space-y-2">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="font-medium">{L(lang, { ko: '응급실/구급차', zh: '急诊/救护车', en: 'Emergency/Ambulance' })}</p>
                  <p className="text-xl font-bold text-red-600">119</p>
                </div>
                <div>
                  <p className="font-medium">{L(lang, { ko: '경찰/미아신고', zh: '报警/走失举报', en: 'Police/Missing Child' })}</p>
                  <p className="text-xl font-bold text-blue-600">112</p>
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                {L(lang, { 
                  ko: '한국어를 못해도 괜찮습니다. "Emergency", "Help" 라고 말하면 도움을 받을 수 있습니다.',
                  zh: '不会韩语也没关系。说"Emergency"、"Help"就能得到帮助。',
                  en: 'Don\'t worry if you can\'t speak Korean. Say "Emergency" or "Help" to get assistance.'
                })}
              </p>
            </div>
          </div>
        </div>
      )}
    </GuideLayout>
  )
}