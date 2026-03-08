import { useState, useRef, useCallback } from 'react'
import { MapPin, Clock, Utensils, Camera, Calendar, ShoppingBag, MessageSquare } from 'lucide-react'
import GuideLayout from './GuideLayout'

function L(lang, d) { 
  if (typeof d === 'string') return d
  return d?.[lang] || d?.en || d?.zh || d?.ko || '' 
}

const HALAL_RESTAURANTS = [
  {
    name: { ko: '아스마라 할랄레스토랑', zh: 'Asmara清真餐厅', en: 'Asmara Halal Restaurant' },
    area: { ko: '이태원', zh: '梨泰院', en: 'Itaewon' },
    type: { ko: '터키 음식', zh: '土耳其菜', en: 'Turkish Cuisine' },
    address: '서울 용산구 이태원로 183',
    phone: '02-793-1395'
  },
  {
    name: { ko: '알라딘', zh: 'Aladdin', en: 'Aladdin' },
    area: { ko: '이태원', zh: '梨泰院', en: 'Itaewon' },
    type: { ko: '중동 음식', zh: '中东菜', en: 'Middle Eastern' },
    address: '서울 용산구 이태원로27가길 39',
    phone: '02-796-8419'
  },
  {
    name: { ko: '케밥하우스', zh: 'Kebab House', en: 'Kebab House' },
    area: { ko: '명동', zh: '明洞', en: 'Myeongdong' },
    type: { ko: '케밥, 터키 음식', zh: '烤肉串、土耳其菜', en: 'Kebab, Turkish' },
    address: '서울 중구 명동2가 83-5',
    phone: '02-756-8277'
  },
  {
    name: { ko: '무르시드', zh: 'Murshed', en: 'Murshed' },
    area: { ko: '이태원', zh: '梨泰院', en: 'Itaewon' },
    type: { ko: '파키스탄 음식', zh: '巴基斯坦菜', en: 'Pakistani Cuisine' },
    address: '서울 용산구 보광로60길 38',
    phone: '02-797-5465'
  },
  {
    name: { ko: '버거로드', zh: 'Burger Road', en: 'Burger Road' },
    area: { ko: '홍대', zh: '弘大', en: 'Hongdae' },
    type: { ko: '할랄 버거', zh: '清真汉堡', en: 'Halal Burger' },
    address: '서울 마포구 와우산로 146',
    phone: '02-324-1234'
  },
  {
    name: { ko: '알리바바 레스토랑', zh: 'Ali Baba餐厅', en: 'Ali Baba Restaurant' },
    area: { ko: '이태원', zh: '梨泰院', en: 'Itaewon' },
    type: { ko: '인도 음식', zh: '印度菜', en: 'Indian Cuisine' },
    address: '서울 용산구 이태원로 179',
    phone: '02-794-8264'
  },
  {
    name: { ko: '인도팰리스', zh: 'India Palace', en: 'India Palace' },
    area: { ko: '강남', zh: '江南', en: 'Gangnam' },
    type: { ko: '인도 음식', zh: '印度菜', en: 'Indian Cuisine' },
    address: '서울 강남구 테헤란로 152',
    phone: '02-508-2929'
  },
  {
    name: { ko: '터키쉬하우스', zh: 'Turkish House', en: 'Turkish House' },
    area: { ko: '이태원', zh: '梨泰院', en: 'Itaewon' },
    type: { ko: '터키 음식', zh: '土耳其菜', en: 'Turkish Cuisine' },
    address: '서울 용산구 이태원로 145',
    phone: '02-797-2479'
  },
  {
    name: { ko: '할랄가이즈 서울', zh: 'Halal Guys首尔', en: 'Halal Guys Seoul' },
    area: { ko: '강남', zh: '江南', en: 'Gangnam' },
    type: { ko: '할랄 패스트푸드', zh: '清真快餐', en: 'Halal Fast Food' },
    address: '서울 강남구 강남대로 390',
    phone: '02-567-8901'
  },
  {
    name: { ko: '술탄케밥', zh: 'Sultan Kebab', en: 'Sultan Kebab' },
    area: { ko: '동대문', zh: '东大门', en: 'Dongdaemun' },
    type: { ko: '터키 케밥', zh: '土耳其烤肉', en: 'Turkish Kebab' },
    address: '서울 중구 을지로 281',
    phone: '02-2277-4567'
  }
]

const PRAYER_PLACES = [
  {
    name: { ko: '서울중앙성원(이태원 모스크)', zh: '首尔中央圣院(梨泰院清真寺)', en: 'Seoul Central Mosque (Itaewon)' },
    address: '서울 용산구 우사단로10길 39',
    hours: { ko: '24시간 개방', zh: '24小时开放', en: '24 hours open' },
    phone: '02-793-6908',
    notes: { ko: '한국 최대 이슬람 사원, 금요 예배 12:30', zh: '韩国最大清真寺，周五礼拜12:30', en: 'Largest mosque in Korea, Friday prayer 12:30' }
  },
  {
    name: { ko: '인천공항 기도실', zh: '仁川机场祈祷室', en: 'Incheon Airport Prayer Room' },
    address: { ko: '인천공항 T1, T2 3층 출국장', zh: '仁川机场T1、T2三层出发厅', en: 'Incheon Airport T1, T2 3F Departure' },
    hours: { ko: '24시간 이용 가능', zh: '24小时可用', en: '24 hours available' },
    notes: { ko: '키블라 방향 표시, 세정 시설 완비', zh: '有朝拜方向指示，洗礼设施齐全', en: 'Qibla direction marked, ablution facilities' }
  },
  {
    name: { ko: '명동 이슬람센터', zh: '明洞伊斯兰中心', en: 'Myeongdong Islamic Center' },
    address: '서울 중구 명동길 42',
    hours: { ko: '일일 5회 예배 시간', zh: '每日五次礼拜时间', en: 'Daily 5 prayer times' },
    phone: '02-756-1234',
    notes: { ko: '명동 근처 기도 장소', zh: '明洞附近祈祷场所', en: 'Prayer place near Myeongdong' }
  }
]

const HALAL_PRODUCTS = [
  { name: 'CJ 햇반 (일부)', price: '₩3,000~4,000', store: { ko: '모든 편의점', zh: '所有便利店', en: 'All convenience stores' } },
  { name: '농심 신라면 (채식)', price: '₩1,200', store: { ko: '편의점/마트', zh: '便利店/超市', en: 'Convenience stores/Marts' } },
  { name: '삼양 불닭볶음면 (할랄인증)', price: '₩1,500', store: { ko: '대형마트', zh: '大型超市', en: 'Large marts' } },
  { name: '오뚜기 진라면 (순한맛)', price: '₩1,100', store: { ko: '편의점/마트', zh: '便利店/超市', en: 'Convenience stores/Marts' } },
  { name: '롯데 초코파이', price: '₩2,500', store: { ko: '편의점', zh: '便利店', en: 'Convenience stores' } },
  { name: '해태 허니버터칩', price: '₩2,000', store: { ko: '편의점', zh: '便利店', en: 'Convenience stores' } }
]

export default function HalalGuide({ lang, onClose }) {
  const [activeTab, setActiveTab] = useState('restaurants')
  const [showCard, setShowCard] = useState(false)
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
      link.download = 'halal-card.png'
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

  const title = { 
    ko: '할랄 음식 & 무슬림 가이드', 
    zh: '清真美食 & 穆斯林指南', 
    en: 'Halal Food & Muslim Guide' 
  }

  const tip = {
    ko: '한국의 할랄 인증 제품은 한국할랄인증원(KHC) 마크를 확인하세요. 대부분의 한식에는 돼지고기나 술이 들어가니 주의해주세요.',
    zh: '在韩国，请确认韩国清真认证院(KHC)标志的清真认证产品。大部分韩式料理含有猪肉或酒类，请注意。',
    en: 'In Korea, look for KHC (Korea Halal Certification) mark on halal products. Most Korean dishes contain pork or alcohol, please be careful.'
  }

  return (
    <GuideLayout title={title} lang={lang} onClose={onClose} tip={tip}>
      {/* Tab Navigation */}
      <div className="flex border-b border-gray-200 mb-4">
        <button
          onClick={() => setActiveTab('restaurants')}
          className={`flex-1 py-3 text-sm font-medium text-center transition-colors ${
            activeTab === 'restaurants'
              ? 'border-b-2 border-green-600 text-green-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <Utensils size={16} className="inline-block mr-1" />
          {L(lang, { ko: '할랄 식당', zh: '清真餐厅', en: 'Halal Restaurants' })}
        </button>
        <button
          onClick={() => setActiveTab('prayer')}
          className={`flex-1 py-3 text-sm font-medium text-center transition-colors ${
            activeTab === 'prayer'
              ? 'border-b-2 border-green-600 text-green-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <MapPin size={16} className="inline-block mr-1" />
          {L(lang, { ko: '기도실', zh: '祈祷室', en: 'Prayer Rooms' })}
        </button>
        <button
          onClick={() => setActiveTab('info')}
          className={`flex-1 py-3 text-sm font-medium text-center transition-colors ${
            activeTab === 'info'
              ? 'border-b-2 border-green-600 text-green-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <MessageSquare size={16} className="inline-block mr-1" />
          {L(lang, { ko: '유용정보', zh: '实用信息', en: 'Useful Info' })}
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === 'restaurants' && (
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-[#1A1A1A] mb-4">
            {L(lang, { ko: '서울 할랄 식당 TOP 10', zh: '首尔清真餐厅TOP 10', en: 'Seoul Top 10 Halal Restaurants' })}
          </h2>
          
          {HALAL_RESTAURANTS.map((restaurant, index) => (
            <div key={index} className="bg-white border border-gray-200 rounded-xl p-4">
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-bold text-[#1A1A1A]">{L(lang, restaurant.name)}</h3>
                <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                  {L(lang, restaurant.area)}
                </span>
              </div>
              <p className="text-sm text-gray-600 mb-2">{L(lang, restaurant.type)}</p>
              <div className="text-xs text-gray-500 space-y-1">
                <p className="flex items-center gap-1">
                  <MapPin size={12} />
                  {restaurant.address}
                </p>
                {restaurant.phone && (
                  <p>📞 {restaurant.phone}</p>
                )}
              </div>
            </div>
          ))}

          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
            <h3 className="font-bold text-[#1A1A1A] mb-2">
              {L(lang, { ko: '편의점 할랄 제품', zh: '便利店清真产品', en: 'Convenience Store Halal Products' })}
            </h3>
            <div className="space-y-2">
              {HALAL_PRODUCTS.map((product, index) => (
                <div key={index} className="flex justify-between items-center">
                  <span className="text-sm">{product.name}</span>
                  <div className="text-right">
                    <div className="text-sm font-medium">{product.price}</div>
                    <div className="text-xs text-gray-500">{L(lang, product.store)}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'prayer' && (
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-[#1A1A1A] mb-4">
            {L(lang, { ko: '기도실 & 모스크 위치', zh: '祈祷室 & 清真寺位置', en: 'Prayer Rooms & Mosque Locations' })}
          </h2>
          
          {PRAYER_PLACES.map((place, index) => (
            <div key={index} className="bg-white border border-gray-200 rounded-xl p-4">
              <h3 className="font-bold text-[#1A1A1A] mb-2">{L(lang, place.name)}</h3>
              <div className="text-sm space-y-2">
                <div className="flex items-start gap-2">
                  <MapPin size={14} className="text-green-600 mt-1 shrink-0" />
                  <span className="text-gray-700">{typeof place.address === 'string' ? place.address : L(lang, place.address)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock size={14} className="text-blue-600" />
                  <span className="text-gray-700">{L(lang, place.hours)}</span>
                </div>
                {place.phone && (
                  <div className="flex items-center gap-2">
                    <span className="text-gray-700">📞 {place.phone}</span>
                  </div>
                )}
                {place.notes && (
                  <p className="text-xs text-gray-500 bg-gray-50 p-2 rounded">
                    {L(lang, place.notes)}
                  </p>
                )}
              </div>
            </div>
          ))}

          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
            <h3 className="font-bold text-[#1A1A1A] mb-2">
              {L(lang, { ko: '기도 시간 알림', zh: '礼拜时间提醒', en: 'Prayer Time Reminder' })}
            </h3>
            <p className="text-sm text-gray-600">
              {L(lang, { 
                ko: '한국 서울 기준 기도 시간은 이슬람 앱(Athan Pro, Muslim Pro 등)에서 확인하세요. 키블라 방향은 서쪽에서 약간 남쪽입니다.',
                zh: '韩国首尔的礼拜时间请通过伊斯兰应用(Athan Pro, Muslim Pro等)查看。朝拜方向为西偏南。',
                en: 'Check prayer times for Seoul, Korea using Islamic apps like Athan Pro or Muslim Pro. Qibla direction is west-southwest.'
              })}
            </p>
          </div>
        </div>
      )}

      {activeTab === 'info' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-bold text-[#1A1A1A]">
              {L(lang, { ko: '무슬림 여행자 정보', zh: '穆斯림旅行者信息', en: 'Muslim Traveler Information' })}
            </h2>
            <button
              onClick={() => setShowCard(!showCard)}
              className="px-3 py-1 text-sm bg-green-100 text-green-700 rounded-lg"
            >
              {L(lang, { ko: '한국어 카드', zh: '韩语卡片', en: 'Korean Card' })}
            </button>
          </div>

          {showCard && (
            <div className="space-y-4">
              <div className="flex justify-end">
                <button
                  onClick={handleCapture}
                  className="flex items-center gap-1 px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded-lg"
                >
                  <Camera size={14} />
                  {L(lang, { ko: '카드 저장', zh: '保存卡片', en: 'Save Card' })}
                </button>
              </div>

              <div ref={cardRef} className="bg-white border-2 border-green-600 rounded-xl p-6 text-center">
                <h3 className="text-2xl font-bold mb-4">저는 무슬림입니다</h3>
                <div className="space-y-2 text-lg">
                  <p>돼지고기는 먹을 수 없습니다</p>
                  <p>술은 마실 수 없습니다</p>
                  <p>할랄 음식이 필요합니다</p>
                </div>
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <p className="text-sm text-gray-600">I am Muslim</p>
                  <p className="text-sm text-gray-600">No pork, No alcohol, Need halal food</p>
                </div>
              </div>
            </div>
          )}

          <div className="bg-green-50 border border-green-200 rounded-xl p-4">
            <h3 className="font-bold text-[#1A1A1A] mb-2">
              <Calendar className="inline-block mr-2" size={16} />
              {L(lang, { ko: '라마단 기간 안내 (2026년)', zh: '斋月期间指南 (2026年)', en: 'Ramadan Period Guide (2026)' })}
            </h3>
            <div className="text-sm space-y-2">
              <p><strong>{L(lang, { ko: '예상 기간:', zh: '预期时间:', en: 'Expected Period:' })}</strong> {L(lang, { ko: '2026년 2월 17일 ~ 3월 18일', zh: '2026年2月17日 ~ 3月18日', en: 'Feb 17 - Mar 18, 2026' })}</p>
              <p><strong>{L(lang, { ko: '서울 일출:', zh: '首尔日出:', en: 'Seoul Sunrise:' })}</strong> {L(lang, { ko: '약 07:00', zh: '约 07:00', en: 'Around 07:00' })}</p>
              <p><strong>{L(lang, { ko: '서울 일몰:', zh: '首尔日落:', en: 'Seoul Sunset:' })}</strong> {L(lang, { ko: '약 18:30', zh: '约 18:30', en: 'Around 18:30' })}</p>
              <p className="text-xs text-gray-500">
                {L(lang, { 
                  ko: '* 정확한 시간은 이슬람 달력 앱에서 확인하세요',
                  zh: '* 请通过伊斯兰历应用查看准确时间',
                  en: '* Check exact times using Islamic calendar apps'
                })}
              </p>
            </div>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
            <h3 className="font-bold text-[#1A1A1A] mb-2">
              <ShoppingBag className="inline-block mr-2" size={16} />
              {L(lang, { ko: '한국 음식 주의사항', zh: '韩国料理注意事项', en: 'Korean Food Precautions' })}
            </h3>
            <div className="text-sm space-y-2">
              <div className="bg-red-50 p-2 rounded">
                <p className="font-medium text-red-700 mb-1">{L(lang, { ko: '피해야 할 음식:', zh: '应避免的食物:', en: 'Foods to Avoid:' })}</p>
                <ul className="text-red-600 text-xs space-y-1">
                  <li>• {L(lang, { ko: '김치찌개, 된장찌개 (돼지고기 육수)', zh: '泡菜汤、大酱汤(猪肉汤底)', en: 'Kimchi-jjigae, Doenjang-jjigae (pork broth)' })}</li>
                  <li>• {L(lang, { ko: '삼겹살, 갈비 (돼지고기)', zh: '五花肉、排骨(猪肉)', en: 'Samgyeopsal, Galbi (pork)' })}</li>
                  <li>• {L(lang, { ko: '소주, 막걸리 (알코올)', zh: '烧酒、马格利(含酒精)', en: 'Soju, Makgeolli (alcohol)' })}</li>
                  <li>• {L(lang, { ko: '많은 라면 (돼지기름)', zh: '很多拉面(猪油)', en: 'Many ramyeon (pork fat)' })}</li>
                </ul>
              </div>
              <div className="bg-green-50 p-2 rounded">
                <p className="font-medium text-green-700 mb-1">{L(lang, { ko: '안전한 음식:', zh: '安全的食物:', en: 'Safe Foods:' })}</p>
                <ul className="text-green-600 text-xs space-y-1">
                  <li>• {L(lang, { ko: '불고기 (소고기)', zh: '烤牛肉', en: 'Bulgogi (beef)' })}</li>
                  <li>• {L(lang, { ko: '비빔밥 (고기 없는 버전)', zh: '拌饭(无肉版本)', en: 'Bibimbap (vegetarian version)' })}</li>
                  <li>• {L(lang, { ko: '과일, 채소', zh: '水果、蔬菜', en: 'Fruits, vegetables' })}</li>
                  <li>• {L(lang, { ko: '할랄 인증 제품', zh: '清真认证产品', en: 'Halal certified products' })}</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
    </GuideLayout>
  )
}