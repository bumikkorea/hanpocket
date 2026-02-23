import React, { useState, useEffect } from 'react';
import { Home, AlertTriangle, MapPin, Luggage, Info, ExternalLink, Clock, MessageCircle, Bed } from 'lucide-react';
import { accommodation, kakaoMap, utils } from '../../utils/appLinks';

function L(lang, obj) {
  return obj[lang] || obj.ko;
}

export default function AccommodationPocket({ lang = 'ko' }) {
  const [toast, setToast] = useState('');
  const [address, setAddress] = useState('');
  const [savedAddress, setSavedAddress] = useState('');
  const [activeTab, setActiveTab] = useState('checkin');

  useEffect(() => {
    // localStorage에서 저장된 주소 불러오기
    const stored = localStorage.getItem('accommodationAddress');
    if (stored) {
      setSavedAddress(stored);
    }
  }, []);

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setToast('복사됨!');
    setTimeout(() => setToast(''), 2000);
  };

  const playAudio = (text) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'ko-KR';
      speechSynthesis.speak(utterance);
    }
  };

  const saveAddress = () => {
    if (address.trim()) {
      localStorage.setItem('accommodationAddress', address);
      setSavedAddress(address);
      setToast('주소가 저장되었습니다!');
      setTimeout(() => setToast(''), 2000);
    }
  };

  const clearAddress = () => {
    localStorage.removeItem('accommodationAddress');
    setSavedAddress('');
    setAddress('');
    setToast('주소가 삭제되었습니다!');
    setTimeout(() => setToast(''), 2000);
  };

  // 체크인/아웃 표현
  const checkInOutPhrases = [
    {
      korean: '체크인 하려고 왔어요',
      romanization: 'chekeu-in haryeogo wasseoyo',
      chinese: '我来办理入住',
      examples: [
        { korean: '예약 확인서 여기 있어요', chinese: '预订确认书在这里' },
        { korean: '신분증 드릴게요', chinese: '给您身份证' }
      ],
      audio: true
    },
    {
      korean: '체크아웃 하려고 해요',
      romanization: 'chekeu-auseu haryeogo haeyo',
      chinese: '我要办理退房',
      examples: [
        { korean: '짐 맡길 수 있어요?', chinese: '可以寄存行李吗？' },
        { korean: '계산서 주세요', chinese: '请给我账单' }
      ],
      audio: true
    },
    {
      korean: '방 열쇠 주세요',
      romanization: 'bang yeolsoe juseyo',
      chinese: '请给我房间钥匙',
      examples: [
        { korean: '카드키가 안 돼요', chinese: '房卡不能用' },
        { korean: '몇 호실이에요?', chinese: '几号房间？' }
      ],
      audio: true
    },
    {
      korean: '늦은 체크인 가능해요?',
      romanization: 'neujeun chekeu-in ganeunghaeyo?',
      chinese: '可以晚点入住吗？',
      examples: [
        { korean: '몇 시까지 가능해요?', chinese: '最晚几点可以？' },
        { korean: '추가 요금 있어요?', chinese: '有额外费用吗？' }
      ],
      audio: true
    }
  ];

  // 요청 표현
  const requestPhrases = [
    {
      korean: '수건 더 주실 수 있어요?',
      romanization: 'sugeon deo jusil su isseoyo?',
      chinese: '可以多给些毛巾吗？',
      examples: [
        { korean: '베개 하나 더 주세요', chinese: '请多给一个枕头' },
        { korean: '담요 필요해요', chinese: '我需要毯子' }
      ],
      audio: true
    },
    {
      korean: '방 청소 부탁해요',
      romanization: 'bang cheongso butakhaeyo',
      chinese: '请帮忙打扫房间',
      examples: [
        { korean: '언제 청소해주시나요?', chinese: '什么时候打扫？' },
        { korean: '지금은 방에 있어요', chinese: '现在我在房间里' }
      ],
      audio: true
    },
    {
      korean: '조식 포함인가요?',
      romanization: 'josik poham-ingayo?',
      chinese: '包含早餐吗？',
      examples: [
        { korean: '몇 시부터 몇 시까지요?', chinese: '几点到几点？' },
        { korean: '어디서 먹나요?', chinese: '在哪里吃？' }
      ],
      audio: true
    },
    {
      korean: 'WiFi 비밀번호 알려주세요',
      romanization: 'WiFi bimilbeonho allyeojuseyo',
      chinese: '请告诉我WiFi密码',
      examples: [
        { korean: 'WiFi가 안 돼요', chinese: 'WiFi连不上' },
        { korean: '인터넷이 느려요', chinese: '网络很慢' }
      ],
      audio: true
    }
  ];

  // 문제 신고 표현
  const problemReportPhrases = [
    {
      korean: '에어컨이 안 돼요',
      romanization: 'eeokeoni an dwaeyo',
      chinese: '空调坏了',
      examples: [
        { korean: '너무 더워요', chinese: '太热了' },
        { korean: '리모컨이 없어요', chinese: '没有遥控器' }
      ],
      audio: true
    },
    {
      korean: '온수가 안 나와요',
      romanization: 'onsu-ga an nawayo',
      chinese: '没有热水',
      examples: [
        { korean: '샤워할 수 없어요', chinese: '不能洗澡' },
        { korean: '수압이 약해요', chinese: '水压很小' }
      ],
      audio: true
    },
    {
      korean: '방이 너무 시끄러워요',
      romanization: 'bang-i neomu sikkeureowo-yo',
      chinese: '房间太吵了',
      examples: [
        { korean: '옆 방이 시끄러워요', chinese: '隔壁房间很吵' },
        { korean: '다른 방으로 바꿔주세요', chinese: '请换个房间' }
      ],
      audio: true
    },
    {
      korean: '전등이 안 켜져요',
      romanization: 'jeondeung-i an kyeojyeoyo',
      chinese: '灯不亮',
      examples: [
        { korean: '전구를 바꿔주세요', chinese: '请换个灯泡' },
        { korean: '스위치가 고장났어요', chinese: '开关坏了' }
      ],
      audio: true
    }
  ];

  // 숙박 연장 표현
  const extensionPhrases = [
    {
      korean: '하루 더 머무를 수 있어요?',
      romanization: 'haru deo meomureul su isseoyo?',
      chinese: '可以多住一天吗？',
      examples: [
        { korean: '같은 방에서 머물고 싶어요', chinese: '想住同一个房间' },
        { korean: '얼마예요?', chinese: '多少钱？' }
      ],
      audio: true
    },
    {
      korean: '체크아웃 시간 연장 가능해요?',
      romanization: 'chekeu-auseu sigan yeonjang ganeunghaeyo?',
      chinese: '可以延迟退房吗？',
      examples: [
        { korean: '한 시간만 더요', chinese: '只要多一个小时' },
        { korean: '추가 비용 있어요?', chinese: '有额外费用吗？' }
      ],
      audio: true
    },
    {
      korean: '일주일 더 머물고 싶어요',
      romanization: 'iljuil deo meomulgo sipeoyo',
      chinese: '想多住一周',
      examples: [
        { korean: '장기 할인 있어요?', chinese: '有长期折扣吗？' },
        { korean: '월 단위로 계산해 주세요', chinese: '请按月计算' }
      ],
      audio: true
    }
  ];

  // 에어비앤비 표현
  const airbnbPhrases = [
    {
      korean: '호스트에게 연락하고 싶어요',
      romanization: 'hoseuteu-ege yeonrak-hago sipeoyo',
      chinese: '我想联系房东',
      examples: [
        { korean: '문제가 있어요', chinese: '有问题' },
        { korean: '체크인 방법을 모르겠어요', chinese: '不知道怎么入住' }
      ],
      audio: true
    },
    {
      korean: '셀프 체크인이에요?',
      romanization: 'selpeu chekeu-in-ieyo?',
      chinese: '是自助入住吗？',
      examples: [
        { korean: '키박스 비밀번호 알려주세요', chinese: '请告诉我密码箱密码' },
        { korean: '어떻게 들어가죠?', chinese: '怎么进去？' }
      ],
      audio: true
    },
    {
      korean: '주방 사용해도 돼요?',
      romanization: 'jubang sayong-haedo dwaeyo?',
      chinese: '可以使用厨房吗？',
      examples: [
        { korean: '요리해도 돼요?', chinese: '可以做菜吗？' },
        { korean: '냉장고 사용 가능해요?', chinese: '可以用冰箱吗？' }
      ],
      audio: true
    }
  ];

  // 한국 숙소 유형
  const accommodationTypes = [
    {
      name: '호텔 (Hotel)',
      korean: '호텔',
      romanization: 'hotel',
      chinese: '酒店',
      description: '풀서비스, 24시간 프런트데스크, 룸서비스',
      features: ['24시간 리셉션', '룸서비스', '컨시어지', '레스토랑'],
      priceRange: '★★★★'
    },
    {
      name: '모텔 (Motel)',
      korean: '모텔',
      romanization: 'motel',
      chinese: '汽车旅馆',
      description: '저렴한 가격, 기본적인 서비스, 단기 숙박',
      features: ['주차 가능', '저렴한 요금', 'TV/에어컨', '기본 편의시설'],
      priceRange: '★★'
    },
    {
      name: '게스트하우스 (Guesthouse)',
      korean: '게스트하우스',
      romanization: 'geseuteu-hauseu',
      chinese: '青年旅社',
      description: '공용 공간, 백패커 친화적, 소셜한 분위기',
      features: ['도미토리', '공용 주방', '라운지', '저렴한 가격'],
      priceRange: '★'
    },
    {
      name: '한옥 (Hanok)',
      korean: '한옥',
      romanization: 'hanok',
      chinese: '韩屋',
      description: '전통 한국 건축, 문화 체험, 독특한 경험',
      features: ['온돌', '전통 건축', '문화 체험', '조용한 환경'],
      priceRange: '★★★'
    },
    {
      name: '펜션 (Pension)',
      korean: '펜션',
      romanization: 'pensyeon',
      chinese: '度假村',
      description: '휴양지 숙박, 독립된 공간, 가족/단체 여행',
      features: ['독립된 공간', '주방 시설', '바비큐', '자연 환경'],
      priceRange: '★★★'
    }
  ];

  // 예약 사이트
  const bookingSites = [
    {
      name: '야놀자',
      description: '국내 최대 숙박 플랫폼',
      features: '실시간 할인, 포인트 적립',
      openApp: () => accommodation.yanolja()
    },
    {
      name: '여기어때',
      description: '다양한 숙박 옵션',
      features: '특가 상품, 리뷰 시스템',
      openApp: () => accommodation.goodchoice()
    },
    {
      name: '에어비앤비',
      description: '개인 숙소 전문',
      features: '독특한 숙소, 현지 체험',
      openApp: () => accommodation.airbnb()
    }
  ];

  // 짐 보관 표현
  const luggagePhrases = [
    {
      korean: '짐 맡길 수 있어요?',
      romanization: 'jjim matgil su isseoyo?',
      chinese: '可以寄存行李吗？',
      examples: [
        { korean: '몇 시까지요?', chinese: '到几点？' },
        { korean: '비용이 있나요?', chinese: '需要费用吗？' }
      ],
      audio: true
    },
    {
      korean: '체크아웃 후에도 맡길 수 있어요?',
      romanization: 'chekeu-auseu hue-do matgil su isseoyo?',
      chinese: '退房后还能寄存吗？',
      examples: [
        { korean: '저녁에 가져갈게요', chinese: '晚上来拿' },
        { korean: '안전한가요?', chinese: '安全吗？' }
      ],
      audio: true
    }
  ];

  const renderPhraseItem = (phrase, index, onCopy) => (
    <div key={index} className="p-3 bg-gray-50 rounded-lg">
      <div className="flex items-center justify-between mb-2">
        <button
          onClick={() => onCopy(phrase.korean)}
          className="flex-1 text-left hover:bg-gray-100 p-2 rounded"
        >
          <div className="font-medium text-lg" style={{ color: '#111827' }}>
            {phrase.korean}
          </div>
          <div className="text-sm text-gray-600 mb-1">
            {phrase.romanization}
          </div>
          <div className="text-sm text-blue-600">
            {phrase.chinese}
          </div>
        </button>
        {phrase.audio && (
          <button
            onClick={() => playAudio(phrase.korean)}
            className="ml-3 p-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            🔊
          </button>
        )}
      </div>
      
      {phrase.examples && phrase.examples.length > 0 && (
        <div className="mt-3 p-2 bg-white rounded border-l-4 border-blue-500">
          <div className="text-xs text-gray-500 mb-1">예시:</div>
          {phrase.examples.map((example, exIdx) => (
            <div key={exIdx} className="text-sm mb-1">
              <div style={{ color: '#111827' }}>{example.korean}</div>
              <div className="text-blue-600">{example.chinese}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <div className="p-6 bg-white" style={{ fontFamily: 'Inter, sans-serif' }}>
      {/* 토스트 메시지 */}
      {toast && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 bg-black text-white px-4 py-2 rounded-lg z-50">
          {toast}
        </div>
      )}

      <div className="flex items-center gap-3 mb-6">
        <Home className="w-8 h-8" style={{ color: '#111827' }} />
        <h2 className="text-2xl font-bold" style={{ color: '#111827' }}>
          {L(lang, { ko: '숙소 주머니', zh: '住宿袋', en: 'Accommodation Pocket' })}
        </h2>
      </div>

      {/* 탭 네비게이션 */}
      <div className="flex mb-6 bg-gray-100 rounded-lg p-1 overflow-x-auto">
        {[
          { key: 'checkin', label: '체크인/아웃', icon: '🏨' },
          { key: 'requests', label: '요청사항', icon: '🛎️' },
          { key: 'problems', label: '문제신고', icon: '⚠️' },
          { key: 'extension', label: '연장', icon: '⏰' },
          { key: 'airbnb', label: '에어비앤비', icon: '🏠' },
          { key: 'types', label: '숙소유형', icon: '🏘️' },
          { key: 'booking', label: '예약앱', icon: '📱' },
          { key: 'tools', label: '도구', icon: '🔧' }
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex items-center gap-2 px-4 py-2 rounded whitespace-nowrap ${
              activeTab === tab.key ? 'bg-blue-500 text-white' : 'text-gray-600 hover:bg-gray-200'
            }`}
          >
            <span>{tab.icon}</span>
            <span className="text-sm">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* 체크인/아웃 */}
      {activeTab === 'checkin' && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold" style={{ color: '#111827' }}>
            체크인/아웃 표현
          </h3>
          <div className="space-y-3">
            {checkInOutPhrases.map((phrase, index) => 
              renderPhraseItem(phrase, index, copyToClipboard)
            )}
          </div>
        </div>
      )}

      {/* 요청사항 */}
      {activeTab === 'requests' && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <MessageCircle className="w-5 h-5" style={{ color: '#111827' }} />
            <h3 className="text-lg font-semibold" style={{ color: '#111827' }}>
              요청사항 표현
            </h3>
          </div>
          <div className="space-y-3">
            {requestPhrases.map((phrase, index) => 
              renderPhraseItem(phrase, index, copyToClipboard)
            )}
          </div>
        </div>
      )}

      {/* 문제신고 */}
      {activeTab === 'problems' && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5" style={{ color: '#111827' }} />
            <h3 className="text-lg font-semibold" style={{ color: '#111827' }}>
              문제신고 표현
            </h3>
          </div>
          <div className="space-y-3">
            {problemReportPhrases.map((phrase, index) => 
              renderPhraseItem(phrase, index, copyToClipboard)
            )}
          </div>
        </div>
      )}

      {/* 숙박 연장 */}
      {activeTab === 'extension' && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5" style={{ color: '#111827' }} />
            <h3 className="text-lg font-semibold" style={{ color: '#111827' }}>
              숙박 연장 표현
            </h3>
          </div>
          <div className="space-y-3">
            {extensionPhrases.map((phrase, index) => 
              renderPhraseItem(phrase, index, copyToClipboard)
            )}
          </div>
        </div>
      )}

      {/* 에어비앤비 */}
      {activeTab === 'airbnb' && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold" style={{ color: '#111827' }}>
            에어비앤비 표현
          </h3>
          <div className="space-y-3">
            {airbnbPhrases.map((phrase, index) => 
              renderPhraseItem(phrase, index, copyToClipboard)
            )}
          </div>
          
          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <h4 className="font-medium mb-2" style={{ color: '#111827' }}>💡 에어비앤비 팁</h4>
            <ul className="text-sm text-gray-700 space-y-1">
              <li>• 체크인 전 호스트와 미리 연락</li>
              <li>• 하우스 룰을 꼭 확인</li>
              <li>• 체크아웃 시 정리 정돈</li>
              <li>• 문제 시 즉시 호스트에게 연락</li>
            </ul>
          </div>
        </div>
      )}

      {/* 숙소 유형 */}
      {activeTab === 'types' && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Bed className="w-5 h-5" style={{ color: '#111827' }} />
            <h3 className="text-lg font-semibold" style={{ color: '#111827' }}>
              한국 숙소 유형 가이드
            </h3>
          </div>
          
          <div className="space-y-4">
            {accommodationTypes.map((type, index) => (
              <div key={index} className="p-4 bg-gray-50 rounded-lg">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h4 className="font-medium text-lg" style={{ color: '#111827' }}>
                      {type.name}
                    </h4>
                    <div className="text-sm text-gray-600">
                      <span className="mr-4">{type.romanization}</span>
                      <span className="text-blue-600">{type.chinese}</span>
                    </div>
                  </div>
                  <div className="text-xl text-yellow-500">
                    {type.priceRange}
                  </div>
                </div>
                
                <p className="text-sm text-gray-700 mb-3">{type.description}</p>
                
                <div className="grid grid-cols-2 gap-2">
                  {type.features.map((feature, fIdx) => (
                    <div key={fIdx} className="text-sm bg-white p-2 rounded">
                      ✓ {feature}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 예약 앱 */}
      {activeTab === 'booking' && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <ExternalLink className="w-5 h-5" style={{ color: '#111827' }} />
            <h3 className="text-lg font-semibold" style={{ color: '#111827' }}>
              숙소 예약 앱
            </h3>
          </div>
          
          <div className="space-y-3">
            {bookingSites.map((site, index) => (
              <div key={index} className="p-4 bg-gray-50 rounded-lg">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h4 className="font-medium text-lg mb-1" style={{ color: '#111827' }}>
                      {site.name}
                    </h4>
                    <p className="text-sm text-gray-600 mb-2">{site.description}</p>
                    <div className="text-xs text-blue-600">✨ {site.features}</div>
                  </div>
                  <button
                    onClick={site.openApp}
                    className="ml-3 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                  >
                    앱 열기
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* 주변 숙소 검색 */}
          <div className="mt-6 p-4 bg-green-50 rounded-lg">
            <h4 className="font-medium mb-3" style={{ color: '#111827' }}>
              🗺️ 주변 숙소 찾기
            </h4>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => utils.searchNearby('호텔')}
                className="p-3 bg-white rounded hover:bg-gray-50 text-sm"
              >
                🏨 호텔 찾기
              </button>
              <button
                onClick={() => utils.searchNearby('모텔')}
                className="p-3 bg-white rounded hover:bg-gray-50 text-sm"
              >
                🏨 모텔 찾기
              </button>
              <button
                onClick={() => utils.searchNearby('게스트하우스')}
                className="p-3 bg-white rounded hover:bg-gray-50 text-sm"
              >
                🏠 게스트하우스
              </button>
              <button
                onClick={() => utils.searchNearby('한옥')}
                className="p-3 bg-white rounded hover:bg-gray-50 text-sm"
              >
                🏘️ 한옥 찾기
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 도구들 */}
      {activeTab === 'tools' && (
        <div className="space-y-6">
          {/* 숙소 주소 저장 */}
          <div className="p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-2 mb-4">
              <MapPin className="w-5 h-5" style={{ color: '#111827' }} />
              <h3 className="text-lg font-semibold" style={{ color: '#111827' }}>
                숙소 주소 저장
              </h3>
            </div>
            
            <div className="mb-4">
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg"
                placeholder="숙소 주소를 입력하세요"
              />
              <div className="flex gap-2 mt-2">
                <button
                  onClick={saveAddress}
                  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                  저장
                </button>
                {savedAddress && (
                  <button
                    onClick={clearAddress}
                    className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                  >
                    삭제
                  </button>
                )}
              </div>
            </div>

            {/* 저장된 주소 표시 (택시용) */}
            {savedAddress && (
              <div className="p-4 bg-white rounded-lg border-2 border-blue-500">
                <p className="text-sm text-gray-600 mb-2">택시에 보여주기:</p>
                <p className="text-2xl font-bold text-center" style={{ color: '#111827' }}>
                  {savedAddress}
                </p>
                <button
                  onClick={() => copyToClipboard(savedAddress)}
                  className="w-full mt-3 p-2 bg-green-500 text-white rounded hover:bg-green-600"
                >
                  주소 복사
                </button>
              </div>
            )}
          </div>

          {/* 짐 보관 */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Luggage className="w-5 h-5" style={{ color: '#111827' }} />
              <h3 className="text-lg font-semibold" style={{ color: '#111827' }}>
                짐 보관 표현
              </h3>
            </div>
            <div className="space-y-3">
              {luggagePhrases.map((phrase, index) => 
                renderPhraseItem(phrase, index, copyToClipboard)
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}