import { useState } from 'react'
import { Search, MapPin, Clock, Star, ExternalLink, Percent, CreditCard, ShoppingBag, Gift, Truck, Wallet } from 'lucide-react'

function L(lang, data) {
  if (typeof data === 'string') return data
  return data?.[lang] || data?.en || data?.zh || data?.ko || ''
}

// 실제 쇼핑 데이터
const DUTY_FREE_SHOPS = [
  {
    id: 'lotte-df',
    name: { ko: '롯데 면세점', zh: '乐天免税店', en: 'Lotte Duty Free' },
    location: { ko: '명동점', zh: '明洞店', en: 'Myeongdong' },
    address: { ko: '서울 중구 남대문로 81', zh: '首尔中区南大门路81号', en: '81 Namdaemun-ro, Jung-gu, Seoul' },
    phone: '02-771-2500',
    website: 'https://www.lottedfs.com',
    hours: '09:30-21:00',
    brands: ['샤넬', '디올', '에르메스', '구찌', 'LV', '프라다', '버버리', '까르띠에'],
    discount: '10-30%',
    paymentMethods: ['알리페이', '위챗페이', '유니온페이', '신용카드']
  },
  {
    id: 'shilla-df',
    name: { ko: '신라 면세점', zh: '新罗免税店', en: 'Shilla Duty Free' },
    location: { ko: '명동점', zh: '明洞店', en: 'Myeongdong' },
    address: { ko: '서울 중구 소공로 63', zh: '首尔中区小公路63号', en: '63 Sogong-ro, Jung-gu, Seoul' },
    phone: '1688-1110',
    website: 'https://www.shilladfs.com',
    hours: '09:00-21:30',
    brands: ['톰 브라운', '발렌시아가', '생 로랑', '펜디', '몽클레어', '골든구스', 'MCM'],
    discount: '15-40%',
    paymentMethods: ['알리페이', '위챗페이', '유니온페이', '현금', '카드']
  },
  {
    id: 'dongwha-df',
    name: { ko: '동화 면세점', zh: '东和免税店', en: 'Dongwha Duty Free' },
    location: { ko: '명동점', zh: '明洞店', en: 'Myeongdong' },
    address: { ko: '서울 중구 퇴계로 51', zh: '首尔中区退溪路51号', en: '51 Toegye-ro, Jung-gu, Seoul' },
    phone: '02-399-6000',
    website: 'https://www.dongwha.co.kr',
    hours: '09:00-20:30',
    brands: ['구치', '셀린느', '코치', '마이클코어스', '케이트스페이드', '랑콤', '에스티로더'],
    discount: '20-35%',
    paymentMethods: ['알리페이', '위챗페이', '현금', '카드']
  }
]

const SHOPPING_DISTRICTS = [
  {
    id: 'myeongdong',
    name: { ko: '명동', zh: '明洞', en: 'Myeongdong' },
    description: { 
      ko: '국제적인 쇼핑가. 화장품, 의류, 액세서리 집중 지역',
      zh: '国际购物街。化妆品、服装、饰品集中区域',
      en: 'International shopping district for cosmetics, fashion, accessories'
    },
    specialties: ['화장품', '면세점', '한국 브랜드', 'K-뷰티'],
    metro: '명동역 (4호선)',
    tips: { 
      ko: '중국어 가능한 매장 많음. 세금환급 서비스 이용 가능',
      zh: '很多商店可以说中文。可使用退税服务',
      en: 'Many Chinese-speaking staff. Tax refund services available'
    }
  },
  {
    id: 'hongdae',
    name: { ko: '홍대', zh: '弘大', en: 'Hongdae' },
    description: {
      ko: '젊은 감각의 쇼핑 명소. 독특한 패션 아이템과 소품',
      zh: '年轻时尚的购物圣地。独特的时尚单品和小商品',
      en: 'Trendy shopping area popular with youth for unique fashion and goods'
    },
    specialties: ['스트릿 패션', '독립 브랜드', '액세서리', '문화상품'],
    metro: '홍익대입구역 (2,6,공항철도)',
    tips: {
      ko: '야시장, 플리마켓 등 특별한 쇼핑 경험',
      zh: '夜市、跳蚤市场等特别的购物体验',
      en: 'Night markets and flee markets for unique shopping experience'
    }
  },
  {
    id: 'gangnam',
    name: { ko: '강남/압구정', zh: '江南/狎鸥亭', en: 'Gangnam/Apgujeong' },
    description: {
      ko: '럭셔리 쇼핑의 중심지. 명품 브랜드와 고급 부티크',
      zh: '奢侈品购物中心。名牌和高级精品店',
      en: 'Luxury shopping hub with premium brands and high-end boutiques'
    },
    specialties: ['명품', '럭셔리', '디자이너 브랜드', '갤러리아'],
    metro: '강남역/압구정역 (3호선)',
    tips: {
      ko: '갤러리아 백화점, 현대백화점 프리미엄 라인업',
      zh: '购物中心Galleria、现代百货的高端产品',
      en: 'Premium lineup at Galleria and Hyundai Department Stores'
    }
  },
  {
    id: 'dongdaemun',
    name: { ko: '동대문', zh: '东大门', en: 'Dongdaemun' },
    description: {
      ko: '24시간 패션 쇼핑몰. 도매와 소매 동시 진행',
      zh: '24小时时尚购物中心。批发和零售同时进行',
      en: '24-hour fashion district with wholesale and retail options'
    },
    specialties: ['도매', '패션', '원단', '액세서리', '심야쇼핑'],
    metro: '동대문역사문화공원역 (2,4,5호선)',
    tips: {
      ko: '새벽까지 운영. 대량 구매 시 할인 협상 가능',
      zh: '营业到凌晨。大量购买时可协商折扣',
      en: 'Open until dawn. Bulk purchase discounts negotiable'
    }
  }
]

const ONLINE_PLATFORMS = [
  {
    name: { ko: '쿠팡', zh: 'Coupang', en: 'Coupang' },
    description: { ko: '한국 최대 이커머스. 로켓배송 당일/익일 배송', zh: '韩国最大电商。火箭配送当日/次日达', en: 'Korea\'s largest e-commerce with same/next-day delivery' },
    website: 'https://www.coupang.com',
    foreignSupport: true,
    paymentMethods: ['카드', '간편결제', '무통장입금'],
    specialty: '생활용품, 전자제품, 식료품'
  },
  {
    name: { ko: '11번가', zh: '11Street', en: '11Street' },
    description: { ko: 'SK의 오픈마켓. 다양한 판매자', zh: 'SK的开放市场。各种销售商', en: 'SK\'s open marketplace with various sellers' },
    website: 'https://www.11st.co.kr',
    foreignSupport: true,
    paymentMethods: ['카드', 'OK캐쉬백', '페이코'],
    specialty: '패션, 뷰티, 브랜드 상품'
  },
  {
    name: { ko: 'G마켓', zh: 'Gmarket', en: 'Gmarket' },
    description: { ko: '이베이코리아 운영. 경매 시스템', zh: 'eBay韩国运营。拍卖系统', en: 'Operated by eBay Korea with auction system' },
    website: 'https://www.gmarket.co.kr',
    foreignSupport: false,
    paymentMethods: ['카드', '스마일페이', '무통장입금'],
    specialty: '전자제품, 컴퓨터, 가전제품'
  }
]

const POPULAR_ITEMS = [
  {
    name: { ko: 'K-뷰티 세트', zh: 'K美妆套装', en: 'K-Beauty Set' },
    price: '₩50,000-200,000',
    description: { ko: '한국 화장품 브랜드 세트 (설화수, 후, 이니스프리 등)', zh: '韩国化妆品品牌套装（雪花秀、后、悦诗风吟等）', en: 'Korean cosmetics brand sets (Sulwhasoo, The History of Whoo, Innisfree)' },
    bestPlace: '면세점, 올리브영'
  },
  {
    name: { ko: '한국 인삼', zh: '韩国人参', en: 'Korean Ginseng' },
    price: '₩80,000-300,000',
    description: { ko: '6년근 홍삼, 정관장 브랜드가 유명', zh: '6年根红参，正官庄品牌著名', en: '6-year-old red ginseng, CheongKwanJang brand popular' },
    bestPlace: '인삼 전문점, 면세점'
  },
  {
    name: { ko: '한복', zh: '韩服', en: 'Hanbok' },
    price: '₩150,000-800,000',
    description: { ko: '전통 한복부터 개량한복까지', zh: '从传统韩服到改良韩服', en: 'From traditional to modernized hanbok' },
    bestPlace: '인사동, 남대문시장'
  },
  {
    name: { ko: 'K-POP 굿즈', zh: 'K-POP商品', en: 'K-POP Merchandise' },
    price: '₩10,000-100,000',
    description: { ko: 'BTS, 블랙핑크, 뉴진스 등 공식 굿즈', zh: 'BTS、BLACKPINK、NewJeans等官方商品', en: 'Official merchandise of BTS, BLACKPINK, NewJeans' },
    bestPlace: '명동, 홍대, 온라인'
  }
]

const SECTIONS = [
  { id: 'duty-free', label: { ko: '면세점', zh: '免税店', en: 'Duty Free' }, icon: ShoppingBag },
  { id: 'districts', label: { ko: '쇼핑 지역', zh: '购物区域', en: 'Shopping Areas' }, icon: MapPin },
  { id: 'online', label: { ko: '온라인몰', zh: '在线商城', en: 'Online Shopping' }, icon: Truck },
  { id: 'payment', label: { ko: '결제 가이드', zh: '支付指南', en: 'Payment Guide' }, icon: CreditCard }
]

export default function ShoppingTab({ lang, setTab }) {
  const [section, setSection] = useState('duty-free')
  const [searchQuery, setSearchQuery] = useState('')

  return (
    <div className="space-y-4 animate-fade-up pb-4">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-[#111827] tracking-tight">
          {L(lang, { ko: '쇼핑 & 할인', zh: '购物与折扣', en: 'Shopping & Deals' })}
        </h1>
        <p className="text-sm text-[#6B7280] mt-1">
          {L(lang, { ko: '한국에서 스마트하게 쇼핑하기', zh: '在韩国聪明购物', en: 'Shop smart in Korea' })}
        </p>
      </div>

      {/* 인기 상품 섹션 */}
      <div className="bg-white rounded-2xl p-5 border border-[#E5E7EB] card-glow">
        <h2 className="text-sm font-bold text-[#111827] mb-3 flex items-center gap-2">
          <Star size={16} className="text-amber-500" />
          {L(lang, { ko: '인기 쇼핑 아이템', zh: '热门购物商品', en: 'Popular Shopping Items' })}
        </h2>
        <div className="grid grid-cols-2 gap-3">
          {POPULAR_ITEMS.map((item, i) => (
            <div key={i} className="bg-[#FAFAF8] rounded-lg p-3">
              <h3 className="text-xs font-bold text-[#111827]">{L(lang, item.name)}</h3>
              <p className="text-xs text-amber-600 font-semibold mt-1">{item.price}</p>
              <p className="text-[10px] text-[#6B7280] mt-1 leading-relaxed">{L(lang, item.description)}</p>
              <p className="text-[9px] text-[#9CA3AF] mt-1">{L(lang, { ko: `추천 장소: ${item.bestPlace}`, zh: `推荐地点: ${item.bestPlace}`, en: `Best Place: ${item.bestPlace}` })}</p>
            </div>
          ))}
        </div>
      </div>

      {/* 검색 */}
      <div className="relative">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9CA3AF]" />
        <input
          type="text"
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          placeholder={L(lang, { ko: '상점, 브랜드, 상품 검색...', zh: '搜索商店、品牌、商品...', en: 'Search stores, brands, products...' })}
          className="w-full pl-10 pr-4 py-2.5 text-sm bg-white border border-[#E5E7EB] rounded-xl outline-none focus:border-[#111827] text-[#111827] placeholder:text-[#9CA3AF]"
        />
      </div>

      {/* Section navigation */}
      <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1 scrollbar-hide">
        {SECTIONS.map(s => {
          const Icon = s.icon
          return (
            <button
              key={s.id}
              onClick={() => setSection(s.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all shrink-0 ${
                section === s.id
                  ? 'bg-[#111827] text-white'
                  : 'bg-[#F3F4F6] text-[#6B7280] hover:bg-[#E5E7EB]'
              }`}
            >
              <Icon size={14} />
              {L(lang, s.label)}
            </button>
          )
        })}
      </div>

      {/* Duty Free Shops */}
      {section === 'duty-free' && (
        <div className="space-y-3">
          <h2 className="text-sm font-bold text-[#111827]">{L(lang, { ko: '주요 면세점', zh: '主要免税店', en: 'Major Duty Free Shops' })}</h2>
          {DUTY_FREE_SHOPS.map(shop => (
            <div key={shop.id} className="bg-white rounded-2xl p-5 border border-[#E5E7EB] card-glow">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="text-sm font-bold text-[#111827]">{L(lang, shop.name)}</h3>
                  <p className="text-xs text-[#6B7280]">{L(lang, shop.location)}</p>
                  <div className="flex items-center gap-1 text-xs text-[#9CA3AF] mt-1">
                    <MapPin size={10} />
                    <span>{L(lang, shop.address)}</span>
                  </div>
                </div>
                <span className="text-xs font-bold text-red-600 bg-red-50 px-2 py-1 rounded-full">{shop.discount} 할인</span>
              </div>
              
              <div className="space-y-2 mb-3">
                <div className="flex items-center gap-1 text-xs text-[#374151]">
                  <Clock size={10} />
                  <span>{shop.hours}</span>
                </div>
                <div className="flex flex-wrap gap-1">
                  {shop.brands.slice(0, 6).map(brand => (
                    <span key={brand} className="text-[9px] px-1.5 py-0.5 bg-[#F3F4F6] text-[#6B7280] rounded">{brand}</span>
                  ))}
                  {shop.brands.length > 6 && <span className="text-[9px] text-[#9CA3AF]">+{shop.brands.length - 6}</span>}
                </div>
              </div>

              <div className="flex flex-wrap gap-1 mb-3">
                {shop.paymentMethods.map(method => (
                  <span key={method} className="text-[9px] px-1.5 py-0.5 bg-blue-50 text-blue-700 rounded font-semibold">{method}</span>
                ))}
              </div>

              <div className="flex gap-2">
                <a href={`tel:${shop.phone}`} className="text-xs text-[#6B7280] hover:text-[#111827]">{shop.phone}</a>
                <a href={shop.website} target="_blank" rel="noopener noreferrer" 
                   className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800">
                  <ExternalLink size={10} />
                  {L(lang, { ko: '홈페이지', zh: '官网', en: 'Website' })}
                </a>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Shopping Districts */}
      {section === 'districts' && (
        <div className="space-y-3">
          <h2 className="text-sm font-bold text-[#111827]">{L(lang, { ko: '쇼핑 지역 가이드', zh: '购物区域指南', en: 'Shopping Districts Guide' })}</h2>
          {SHOPPING_DISTRICTS.map(district => (
            <div key={district.id} className="bg-white rounded-2xl p-5 border border-[#E5E7EB] card-glow">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="text-sm font-bold text-[#111827]">{L(lang, district.name)}</h3>
                  <p className="text-xs text-[#6B7280] mt-1 leading-relaxed">{L(lang, district.description)}</p>
                </div>
              </div>
              
              <div className="flex flex-wrap gap-1 mb-3">
                {district.specialties.map(specialty => (
                  <span key={specialty} className="text-[9px] px-1.5 py-0.5 bg-purple-50 text-purple-700 rounded font-semibold">{specialty}</span>
                ))}
              </div>

              <div className="space-y-1 text-xs text-[#374151]">
                <div className="flex items-center gap-1">
                  <MapPin size={10} />
                  <span>{district.metro}</span>
                </div>
                <p className="text-[#6B7280] leading-relaxed">{L(lang, district.tips)}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Online Platforms */}
      {section === 'online' && (
        <div className="space-y-3">
          <h2 className="text-sm font-bold text-[#111827]">{L(lang, { ko: '온라인 쇼핑몰', zh: '在线购物商城', en: 'Online Shopping Platforms' })}</h2>
          {ONLINE_PLATFORMS.map((platform, i) => (
            <div key={i} className="bg-white rounded-2xl p-5 border border-[#E5E7EB] card-glow">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h3 className="text-sm font-bold text-[#111827]">{L(lang, platform.name)}</h3>
                  <p className="text-xs text-[#6B7280] mt-1">{L(lang, platform.description)}</p>
                </div>
                {platform.foreignSupport && (
                  <span className="text-[9px] px-2 py-1 bg-green-50 text-green-700 font-semibold rounded-full">
                    {L(lang, { ko: '외국인 지원', zh: '外国人支持', en: 'Foreigner Support' })}
                  </span>
                )}
              </div>
              
              <p className="text-xs text-[#9CA3AF] mb-3">{platform.specialty}</p>
              
              <div className="flex flex-wrap gap-1 mb-3">
                {platform.paymentMethods.map(method => (
                  <span key={method} className="text-[9px] px-1.5 py-0.5 bg-blue-50 text-blue-700 rounded font-semibold">{method}</span>
                ))}
              </div>

              <a href={platform.website} target="_blank" rel="noopener noreferrer" 
                 className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800">
                <ExternalLink size={10} />
                {L(lang, { ko: '사이트 방문', zh: '访问网站', en: 'Visit Website' })}
              </a>
            </div>
          ))}
        </div>
      )}

      {/* Payment Guide */}
      {section === 'payment' && (
        <div className="space-y-3">
          <h2 className="text-sm font-bold text-[#111827]">{L(lang, { ko: '결제 방법 가이드', zh: '支付方式指南', en: 'Payment Methods Guide' })}</h2>
          
          <div className="bg-white rounded-2xl p-5 border border-[#E5E7EB] card-glow">
            <h3 className="text-sm font-bold text-[#111827] mb-3">{L(lang, { ko: '중국인 친화적 결제수단', zh: '中国人友好的支付方式', en: 'Chinese-Friendly Payment Methods' })}</h3>
            <div className="space-y-2 text-xs">
              <div className="flex items-center gap-2 p-2 bg-blue-50 rounded">
                <Wallet size={14} className="text-blue-600" />
                <div>
                  <p className="font-semibold text-[#111827]">알리페이 (Alipay)</p>
                  <p className="text-[#6B7280]">{L(lang, { ko: '대부분 면세점, 백화점에서 사용 가능', zh: '大部分免税店、百货商店都可使用', en: 'Available at most duty-free shops and department stores' })}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 p-2 bg-green-50 rounded">
                <CreditCard size={14} className="text-green-600" />
                <div>
                  <p className="font-semibold text-[#111827]">위챗페이 (WeChat Pay)</p>
                  <p className="text-[#6B7280]">{L(lang, { ko: '명동, 홍대 등 관광지 중심 사용 가능', zh: '明洞、弘大等旅游地可使用', en: 'Available in tourist areas like Myeongdong and Hongdae' })}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 p-2 bg-orange-50 rounded">
                <Gift size={14} className="text-orange-600" />
                <div>
                  <p className="font-semibold text-[#111827]">유니온페이 (UnionPay)</p>
                  <p className="text-[#6B7280]">{L(lang, { ko: '대부분 카드 단말기에서 사용 가능', zh: '大部分刷卡机都可使用', en: 'Available at most card terminals' })}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-[#E5E7EB] card-glow">
            <h3 className="text-sm font-bold text-[#111827] mb-3">{L(lang, { ko: '세금 환급 (Tax Refund)', zh: '退税服务', en: 'Tax Refund Service' })}</h3>
            <div className="text-xs space-y-2 text-[#374151]">
              <p>{L(lang, { ko: '• 3만원 이상 구매 시 부가세 환급 가능', zh: '• 购买3万韩元以上可申请增值税退税', en: '• VAT refund available for purchases over 30,000 KRW' })}</p>
              <p>{L(lang, { ko: '• 출국 시 공항에서 환급 절차 진행', zh: '• 出境时在机场办理退税手续', en: '• Process refund at airport upon departure' })}</p>
              <p>{L(lang, { ko: '• 택스프리 스티커가 있는 매장에서만 가능', zh: '• 仅在有退税标识的商店可办理', en: '• Only at stores with Tax Free stickers' })}</p>
              <p>{L(lang, { ko: '• 환급률: 약 8-10% (상품에 따라 차이)', zh: '• 退税率：约8-10%（根据商品不同）', en: '• Refund rate: about 8-10% (varies by product)' })}</p>
            </div>
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5">
            <h3 className="text-sm font-bold text-amber-800 mb-2">{L(lang, { ko: '쇼핑 꿀팁', zh: '购物秘籍', en: 'Shopping Tips' })}</h3>
            <div className="text-xs space-y-1 text-amber-700">
              <p>• {L(lang, { ko: '면세점은 출국 3시간 전까지 픽업 가능', zh: '免税店可在出境前3小时内取货', en: 'Duty-free pickup available until 3 hours before departure' })}</p>
              <p>• {L(lang, { ko: '명동은 중국어 가능 스태프 많음', zh: '明洞很多员工会说中文', en: 'Many Myeongdong staff speak Chinese' })}</p>
              <p>• {L(lang, { ko: '온라인 쇼핑몰도 해외배송 가능', zh: '网上商城也可海外配送', en: 'Online malls offer international shipping' })}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}