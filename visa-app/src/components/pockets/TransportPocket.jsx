import { useState } from 'react'
import { Copy, MapPin, Phone, Train, Bus, Car, ArrowRight } from 'lucide-react'

// 다국어 헬퍼 함수
const L = (lang, text) => text[lang] || text['ko']

export default function TransportPocket({ lang }) {
  const [address, setAddress] = useState('')
  const [showDisplayMode, setShowDisplayMode] = useState(false)
  const [toastMessage, setToastMessage] = useState('')

  // 토스트 메시지 표시 함수
  const showToast = (message) => {
    setToastMessage(message)
    setTimeout(() => setToastMessage(''), 2000)
  }

  // 클립보드 복사 함수
  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(() => {
      showToast(L(lang, { ko: '복사됨!', zh: '已复制!', en: 'Copied!' }))
    })
  }

  // 앱 딥링크 함수
  const openApp = (appType) => {
    const links = {
      kakaoT: 'kakaot://launch',
      naverMap: 'nmap://search?query=' + encodeURIComponent(address),
      subway: 'citymapper://directions'
    }
    
    const fallbackUrls = {
      kakaoT: 'https://play.google.com/store/apps/details?id=com.kakao.taxi',
      naverMap: 'https://map.naver.com/',
      subway: 'https://www.citymapper.com/'
    }

    // 딥링크 시도 후 실패하면 웹사이트로 이동
    const link = document.createElement('a')
    link.href = links[appType]
    link.click()
    
    // 1초 후 앱이 실행되지 않았다면 웹사이트로 이동
    setTimeout(() => {
      window.open(fallbackUrls[appType], '_blank')
    }, 1000)
  }

  // 교통 표현
  const expressions = {
    taxi: {
      title: { ko: '택시', zh: '出租车', en: 'Taxi' },
      items: [
        {
          ko: '여기로 가주세요',
          zh: '请到这里',
          en: 'Please go here',
          pronunciation: 'yeo-gi-ro ga-ju-se-yo'
        },
        {
          ko: '세워주세요',
          zh: '请停车',
          en: 'Please stop',
          pronunciation: 'se-wo-ju-se-yo'
        },
        {
          ko: '트렁크 열어주세요',
          zh: '请打开后备箱',
          en: 'Please open the trunk',
          pronunciation: 'teu-rung-keu yeo-reo-ju-se-yo'
        },
        {
          ko: '얼마예요?',
          zh: '多少钱？',
          en: 'How much?',
          pronunciation: 'eol-ma-ye-yo'
        }
      ]
    },
    subway: {
      title: { ko: '지하철', zh: '地铁', en: 'Subway' },
      items: [
        {
          ko: 'OO역 어떻게 가요?',
          zh: '怎么去OO站？',
          en: 'How to get to OO station?',
          pronunciation: 'OO-yeok eo-tteo-ke ga-yo'
        },
        {
          ko: '만원 충전해주세요',
          zh: '请充值一万韩元',
          en: 'Please charge 10,000 won',
          pronunciation: 'man-won chung-jeon-hae-ju-se-yo'
        },
        {
          ko: '몇 번 출구예요?',
          zh: '几号出口？',
          en: 'Which exit?',
          pronunciation: 'myeot beon chul-gu-ye-yo'
        },
        {
          ko: '갈아타야 해요?',
          zh: '需要换乘吗？',
          en: 'Do I need to transfer?',
          pronunciation: 'ga-ra-ta-ya hae-yo'
        }
      ]
    },
    bus: {
      title: { ko: '버스', zh: '公交车', en: 'Bus' },
      items: [
        {
          ko: '이 버스 OO 가요?',
          zh: '这班车去OO吗？',
          en: 'Does this bus go to OO?',
          pronunciation: 'i beo-seu OO ga-yo'
        },
        {
          ko: '다음 정류장에서 내려주세요',
          zh: '请在下一站让我下车',
          en: 'Please let me off at the next stop',
          pronunciation: 'da-eum jeong-ryu-jang-e-seo nae-ryeo-ju-se-yo'
        },
        {
          ko: 'OO까지 얼마나 걸려요?',
          zh: '到OO要多长时间？',
          en: 'How long to OO?',
          pronunciation: 'OO-kka-ji eol-ma-na geol-lyeo-yo'
        }
      ]
    }
  }

  return (
    <div className="space-y-4" style={{ fontFamily: 'Inter, sans-serif' }}>
      {/* 토스트 메시지 */}
      {toastMessage && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white px-4 py-2 rounded-lg text-sm z-50">
          {toastMessage}
        </div>
      )}

      {/* 택시 보여주기 모드 */}
      {!showDisplayMode ? (
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
            <Car className="w-5 h-5" />
            {L(lang, { ko: '택시 보여주기 모드', zh: '出租车显示模式', en: 'Taxi Display Mode' })}
          </h3>
          <div className="space-y-3">
            <input
              type="text"
              placeholder={L(lang, { ko: '목적지 주소를 입력하세요', zh: '请输入目的地地址', en: 'Enter destination address' })}
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={() => setShowDisplayMode(true)}
              disabled={!address.trim()}
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium disabled:bg-gray-300 disabled:cursor-not-allowed hover:bg-blue-700 transition-colors"
            >
              {L(lang, { ko: '큰 글씨로 보여주기', zh: '大字显示', en: 'Show in large text' })}
            </button>
          </div>
        </div>
      ) : (
        // 전체화면 주소 표시 모드
        <div className="fixed inset-0 bg-white z-50 flex flex-col">
          <div className="p-4 border-b border-gray-200">
            <button
              onClick={() => setShowDisplayMode(false)}
              className="text-blue-600 font-medium"
            >
              ← {L(lang, { ko: '돌아가기', zh: '返回', en: 'Back' })}
            </button>
          </div>
          <div className="flex-1 flex items-center justify-center p-6">
            <div className="text-center">
              <div className="text-4xl font-bold text-gray-800 mb-4 leading-tight">
                {address}
              </div>
              <div className="text-lg text-gray-600">
                {L(lang, { 
                  ko: '기사님에게 보여주세요', 
                  zh: '给司机看', 
                  en: 'Show to driver' 
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 상황별 교통 표현 */}
      {!showDisplayMode && Object.entries(expressions).map(([key, section]) => (
        <div key={key} className="bg-gray-50 p-4 rounded-lg">
          <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
            {key === 'taxi' && <Car className="w-5 h-5" />}
            {key === 'subway' && <Train className="w-5 h-5" />}
            {key === 'bus' && <Bus className="w-5 h-5" />}
            {L(lang, section.title)}
          </h3>
          <div className="space-y-2">
            {section.items.map((item, index) => (
              <button
                key={index}
                onClick={() => copyToClipboard(item[lang])}
                className="w-full p-3 bg-white border border-gray-200 rounded-lg text-left hover:bg-gray-100 transition-colors group"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="font-medium text-gray-800 mb-1">
                      {item[lang]}
                    </div>
                    <div className="text-sm text-gray-500">
                      {item.pronunciation}
                    </div>
                  </div>
                  <Copy className="w-4 h-4 text-gray-400 group-hover:text-gray-600" />
                </div>
              </button>
            ))}
          </div>
        </div>
      ))}

      {/* 앱 딥링크 */}
      {!showDisplayMode && (
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="font-semibold text-gray-800 mb-3">
            {L(lang, { ko: '교통 앱', zh: '交通应用', en: 'Transport Apps' })}
          </h3>
          <div className="space-y-2">
            <button
              onClick={() => openApp('kakaoT')}
              className="w-full p-3 bg-yellow-100 border border-yellow-300 rounded-lg text-left hover:bg-yellow-200 transition-colors flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <Car className="w-5 h-5 text-yellow-700" />
                <div>
                  <div className="font-medium text-yellow-800">
                    {L(lang, { ko: '카카오T', zh: 'Kakao T', en: 'Kakao T' })}
                  </div>
                  <div className="text-sm text-yellow-600">
                    {L(lang, { ko: '택시 호출', zh: '叫车', en: 'Call taxi' })}
                  </div>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-yellow-600" />
            </button>

            <button
              onClick={() => openApp('naverMap')}
              className="w-full p-3 bg-green-100 border border-green-300 rounded-lg text-left hover:bg-green-200 transition-colors flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <MapPin className="w-5 h-5 text-green-700" />
                <div>
                  <div className="font-medium text-green-800">
                    {L(lang, { ko: '네이버지도', zh: 'Naver地图', en: 'Naver Map' })}
                  </div>
                  <div className="text-sm text-green-600">
                    {L(lang, { ko: '길찾기', zh: '导航', en: 'Navigation' })}
                  </div>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-green-600" />
            </button>

            <button
              onClick={() => openApp('subway')}
              className="w-full p-3 bg-blue-100 border border-blue-300 rounded-lg text-left hover:bg-blue-200 transition-colors flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <Train className="w-5 h-5 text-blue-700" />
                <div>
                  <div className="font-medium text-blue-800">
                    {L(lang, { ko: '지하철 지도', zh: '地铁地图', en: 'Subway Map' })}
                  </div>
                  <div className="text-sm text-blue-600">
                    {L(lang, { ko: '노선도', zh: '路线图', en: 'Route map' })}
                  </div>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-blue-600" />
            </button>
          </div>
        </div>
      )}

      {/* 사용법 안내 */}
      {!showDisplayMode && (
        <div className="text-xs text-gray-500 bg-blue-50 p-3 rounded-lg">
          💡 {L(lang, { 
            ko: '표현을 탭하면 클립보드에 복사됩니다. 택시 모드에서 큰 글씨로 기사님에게 보여주세요.', 
            zh: '点击表达即可复制。出租车模式可大字显示给司机。', 
            en: 'Tap expressions to copy. Use taxi mode to show address to driver in large text.' 
          })}
        </div>
      )}
    </div>
  )
}