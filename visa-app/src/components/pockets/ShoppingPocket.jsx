import React, { useState } from 'react';
import { ShoppingBag, Calculator, Percent, MapPin, RefreshCw, CreditCard, Smartphone, Gift } from 'lucide-react';
import { openCoupang, openMusinsa, openKakaoMap } from '../../utils/appLinks';

function L(lang, obj) {
  return obj[lang] || obj.ko;
}

export default function ShoppingPocket({ lang = 'ko' }) {
  const [toast, setToast] = useState('');
  const [clothingSize, setClothingSize] = useState('');
  const [shoeSize, setShoeSize] = useState('');
  const [purchaseAmount, setPurchaseAmount] = useState('');
  const [activeTab, setActiveTab] = useState('basic');

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

  // 옷 사이즈 변환
  const clothingSizeMap = {
    'XS': { china: 'XS', korea: '85' },
    'S': { china: 'S', korea: '90' },
    'M': { china: 'M', korea: '95' },
    'L': { china: 'L', korea: '100' },
    'XL': { china: 'XL', korea: '105' },
    'XXL': { china: 'XXL', korea: '110' }
  };

  // 신발 사이즈 변환 (중국 → 한국 mm)
  const shoeSizeMap = {
    '35': '230mm',
    '36': '235mm',
    '37': '240mm',
    '38': '245mm',
    '39': '250mm',
    '40': '255mm',
    '41': '260mm',
    '42': '265mm',
    '43': '270mm',
    '44': '275mm',
    '45': '280mm'
  };

  // 택스프리 계산
  const calculateTaxRefund = (amount) => {
    if (amount < 30000) return 0;
    return Math.floor(amount * 0.08); // 약 8% 환급
  };

  // 기본 쇼핑 표현
  const basicPhrases = [
    {
      korean: '다른 색 있어요?',
      romanization: 'dareun saek isseoyo?',
      chinese: '有其他颜色吗？',
      examples: [
        { korean: '검은색 있어요?', chinese: '有黑色的吗？' },
        { korean: '흰색으로 주세요', chinese: '请给我白色的' }
      ],
      audio: true
    },
    {
      korean: '입어봐도 돼요?',
      romanization: 'ibeobwado dwaeyo?',
      chinese: '可以试穿吗？',
      examples: [
        { korean: '탈의실 어디예요?', chinese: '试衣间在哪里？' },
        { korean: '거울 있어요?', chinese: '有镜子吗？' }
      ],
      audio: true
    },
    {
      korean: '얼마예요?',
      romanization: 'eolmayeyo?',
      chinese: '多少钱？',
      examples: [
        { korean: '너무 비싸요', chinese: '太贵了' },
        { korean: '할인돼요?', chinese: '能打折吗？' }
      ],
      audio: true
    }
  ];

  // 환불/교환 표현
  const refundExchangePhrases = [
    {
      korean: '환불하고 싶어요',
      romanization: 'hwanbul hago sipeoyo',
      chinese: '我想退货',
      examples: [
        { korean: '영수증 여기 있어요', chinese: '收据在这里' },
        { korean: '언제까지 환불 되나요?', chinese: '什么时候可以退货？' }
      ],
      audio: true
    },
    {
      korean: '교환 가능해요?',
      romanization: 'gyohwan ganeunghaeyo?',
      chinese: '可以换货吗？',
      examples: [
        { korean: '다른 사이즈로 바꿔주세요', chinese: '请换个尺码' },
        { korean: '불량품이에요', chinese: '这是次品' }
      ],
      audio: true
    },
    {
      korean: '환불 정책이 어떻게 되나요?',
      romanization: 'hwanbul jeongchaegi eotteoke doenayo?',
      chinese: '退货政策是什么？',
      examples: [
        { korean: '며칠 안에 환불되나요?', chinese: '几天内可以退货？' },
        { korean: '환불 수수료 있어요?', chinese: '有退货手续费吗？' }
      ],
      audio: true
    }
  ];

  // 결제 표현
  const paymentPhrases = [
    {
      korean: '카드로 결제할게요',
      romanization: 'kadeuro gyeolje halgeyo',
      chinese: '我用卡支付',
      examples: [
        { korean: '현금도 돼요?', chinese: '现金也可以吗？' },
        { korean: '할부 되나요?', chinese: '可以分期付款吗？' }
      ],
      audio: true
    },
    {
      korean: '영수증 주세요',
      romanization: 'yeongsujeung juseyo',
      chinese: '请给我收据',
      examples: [
        { korean: '세금계산서 필요해요', chinese: '需要税务发票' },
        { korean: '보증서도 주세요', chinese: '也请给我保修卡' }
      ],
      audio: true
    },
    {
      korean: '포인트 적립 되나요?',
      romanization: 'pointeu jeokrib doenayo?',
      chinese: '可以积分吗？',
      examples: [
        { korean: '멤버십 카드 있어요', chinese: '我有会员卡' },
        { korean: '쿠폰 사용할게요', chinese: '我要使用优惠券' }
      ],
      audio: true
    }
  ];

  // 시장 흥정 표현
  const bargainingPhrases = [
    {
      korean: '좀 깎아주세요',
      romanization: 'jom kkakkajuseyo',
      chinese: '请便宜一点',
      examples: [
        { korean: '너무 비싸요', chinese: '太贵了' },
        { korean: '다른 곳은 더 싸던데', chinese: '别的地方更便宜' }
      ],
      audio: true
    },
    {
      korean: '현금으로 할게요',
      romanization: 'hyeongeeumeuro halgeyo',
      chinese: '我用现金付',
      examples: [
        { korean: '현금 할인 있어요?', chinese: '现金有折扣吗？' },
        { korean: '두 개 사면 할인돼요?', chinese: '买两个有折扣吗？' }
      ],
      audio: true
    },
    {
      korean: '마지막 가격이에요?',
      romanization: 'majimak gagyegieyo?',
      chinese: '这是最后价格吗？',
      examples: [
        { korean: '정말 안 되나요?', chinese: '真的不能再便宜了吗？' },
        { korean: '다음에 또 올게요', chinese: '我下次再来' }
      ],
      audio: true
    }
  ];

  // 택스리펀드 정보
  const taxRefundInfo = [
    {
      title: '택스프리 신청 조건',
      content: '• 한 번에 3만원 이상 구매\n• 구매일로부터 3개월 내 출국\n• 한국 체류 6개월 미만',
      icon: '📋'
    },
    {
      title: '환급 절차',
      content: '• 매장에서 택스프리 서류 요청\n• 공항에서 세관 확인\n• 리펀드 카운터에서 환급',
      icon: '✈️'
    },
    {
      title: '환급 방법',
      content: '• 현금 환급 (원화/달러)\n• 신용카드 취소\n• 은행 계좌 이체',
      icon: '💳'
    }
  ];

  // 면세점 정보
  const dutyFreeStores = [
    {
      name: '롯데면세점',
      locations: '명동, 김포공항, 인천공항',
      specialties: '화장품, 명품, 주류',
      openApp: () => window.open('https://www.lottedfs.com', '_blank')
    },
    {
      name: '신라면세점',
      locations: '인천공항, 김포공항, 제주공항',
      specialties: '한국 전통 상품, 화장품',
      openApp: () => window.open('https://www.shilladfs.com', '_blank')
    },
    {
      name: '신세계면세점',
      locations: '인천공항, 부산',
      specialties: '패션, 액세서리, 가전',
      openApp: () => window.open('https://www.ssgdfs.com', '_blank')
    }
  ];

  // 온라인 쇼핑몰
  const onlineStores = [
    {
      name: '쿠팡',
      description: '생필품, 전자제품, 빠른 배송',
      features: '로켓배송, 새벽배송',
      openApp: () => openCoupang()
    },
    {
      name: '무신사',
      description: '패션 전문, 스트릿 브랜드',
      features: '무료배송, 무료반품',
      openApp: () => openMusinsa()
    }
  ];

  // 할인 표현
  const discountPhrases = [
    '할인돼요?',
    '학생 할인 있어요?',
    '멤버십 있어요?',
    '쿠폰 사용할 수 있어요?'
  ];

  // 쇼핑 스팟
  const shoppingSpots = [
    { name: '명동', desc: '글로벌 브랜드 집결지, 관광객 특화', search: () => openKakaoMap('명동 쇼핑') },
    { name: '홍대', desc: '젊은 패션, 독특한 브랜드', search: () => openKakaoMap('홍대 쇼핑') },
    { name: '강남', desc: '프리미엄 브랜드, 고급 쇼핑몰', search: () => openKakaoMap('강남 쇼핑') },
    { name: '동대문', desc: '24시간 도매시장, 저렴한 가격', search: () => openKakaoMap('동대문 쇼핑') },
    { name: '남대문', desc: '전통시장, 생활용품 위주', search: () => openKakaoMap('남대문시장') }
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
        <ShoppingBag className="w-8 h-8" style={{ color: '#111827' }} />
        <h2 className="text-2xl font-bold" style={{ color: '#111827' }}>
          {L(lang, { ko: '쇼핑 주머니', zh: '购物袋', en: 'Shopping Pocket' })}
        </h2>
      </div>

      {/* 탭 네비게이션 */}
      <div className="flex mb-6 bg-gray-100 rounded-lg p-1 overflow-x-auto">
        {[
          { key: 'basic', label: '기본', icon: '🛍️' },
          { key: 'refund', label: '환불/교환', icon: '🔄' },
          { key: 'payment', label: '결제', icon: '💳' },
          { key: 'bargain', label: '흥정', icon: '💬' },
          { key: 'online', label: '온라인', icon: '📱' },
          { key: 'dutyfree', label: '면세점', icon: '✈️' },
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

      {/* 기본 쇼핑 표현 */}
      {activeTab === 'basic' && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold" style={{ color: '#111827' }}>
            기본 쇼핑 표현
          </h3>
          <div className="space-y-3">
            {basicPhrases.map((phrase, index) => 
              renderPhraseItem(phrase, index, copyToClipboard)
            )}
          </div>
        </div>
      )}

      {/* 환불/교환 */}
      {activeTab === 'refund' && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <RefreshCw className="w-5 h-5" style={{ color: '#111827' }} />
            <h3 className="text-lg font-semibold" style={{ color: '#111827' }}>
              환불/교환 표현
            </h3>
          </div>
          <div className="space-y-3">
            {refundExchangePhrases.map((phrase, index) => 
              renderPhraseItem(phrase, index, copyToClipboard)
            )}
          </div>
        </div>
      )}

      {/* 결제 */}
      {activeTab === 'payment' && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <CreditCard className="w-5 h-5" style={{ color: '#111827' }} />
            <h3 className="text-lg font-semibold" style={{ color: '#111827' }}>
              결제 표현
            </h3>
          </div>
          <div className="space-y-3">
            {paymentPhrases.map((phrase, index) => 
              renderPhraseItem(phrase, index, copyToClipboard)
            )}
          </div>
        </div>
      )}

      {/* 시장 흥정 */}
      {activeTab === 'bargain' && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold" style={{ color: '#111827' }}>
            시장 흥정 표현
          </h3>
          <div className="space-y-3">
            {bargainingPhrases.map((phrase, index) => 
              renderPhraseItem(phrase, index, copyToClipboard)
            )}
          </div>
          
          <div className="mt-6 p-4 bg-yellow-50 rounded-lg">
            <h4 className="font-medium mb-2" style={{ color: '#111827' }}>💡 흥정 팁</h4>
            <ul className="text-sm text-gray-700 space-y-1">
              <li>• 전통시장에서는 흥정이 일반적</li>
              <li>• 여러 개 구매 시 할인 요청</li>
              <li>• 현금 결제 시 더 큰 할인 가능</li>
              <li>• 웃으면서 정중하게 요청</li>
            </ul>
          </div>
        </div>
      )}

      {/* 온라인 쇼핑 */}
      {activeTab === 'online' && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Smartphone className="w-5 h-5" style={{ color: '#111827' }} />
            <h3 className="text-lg font-semibold" style={{ color: '#111827' }}>
              온라인 쇼핑몰
            </h3>
          </div>
          <div className="space-y-3">
            {onlineStores.map((store, index) => (
              <div key={index} className="p-4 bg-gray-50 rounded-lg">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h4 className="font-medium text-lg mb-1" style={{ color: '#111827' }}>
                      {store.name}
                    </h4>
                    <p className="text-sm text-gray-600 mb-2">{store.description}</p>
                    <div className="text-xs text-blue-600">✨ {store.features}</div>
                  </div>
                  <button
                    onClick={store.openApp}
                    className="ml-3 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                  >
                    앱 열기
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 면세점 */}
      {activeTab === 'dutyfree' && (
        <div className="space-y-6">
          <div className="flex items-center gap-2">
            <Gift className="w-5 h-5" style={{ color: '#111827' }} />
            <h3 className="text-lg font-semibold" style={{ color: '#111827' }}>
              면세점 정보
            </h3>
          </div>
          
          {/* 면세점 앱들 */}
          <div className="space-y-3">
            {dutyFreeStores.map((store, index) => (
              <div key={index} className="p-4 bg-gray-50 rounded-lg">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h4 className="font-medium text-lg mb-1" style={{ color: '#111827' }}>
                      {store.name}
                    </h4>
                    <p className="text-sm text-gray-600 mb-1">
                      📍 {store.locations}
                    </p>
                    <p className="text-sm text-blue-600">
                      🛍️ {store.specialties}
                    </p>
                  </div>
                  <button
                    onClick={store.openApp}
                    className="ml-3 px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600"
                  >
                    앱 열기
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* 택스리펀드 정보 */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold" style={{ color: '#111827' }}>
              택스리펀드 가이드
            </h4>
            {taxRefundInfo.map((info, index) => (
              <div key={index} className="p-4 bg-white border-l-4 border-green-500 rounded">
                <div className="flex items-start gap-3">
                  <span className="text-2xl">{info.icon}</span>
                  <div>
                    <h5 className="font-medium mb-2" style={{ color: '#111827' }}>
                      {info.title}
                    </h5>
                    <div className="text-sm text-gray-700 whitespace-pre-line">
                      {info.content}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 도구들 */}
      {activeTab === 'tools' && (
        <div className="space-y-6">
          {/* 사이즈 변환기 */}
          <div className="p-4 bg-gray-50 rounded-lg">
            <h3 className="text-lg font-semibold mb-4" style={{ color: '#111827' }}>
              사이즈 변환표
            </h3>

            {/* 옷 사이즈 */}
            <div className="mb-6">
              <h4 className="font-medium mb-3" style={{ color: '#111827' }}>옷 사이즈</h4>
              <div className="grid grid-cols-3 gap-2 text-sm">
                <div className="font-medium p-2 bg-white rounded">사이즈</div>
                <div className="font-medium p-2 bg-white rounded">중국</div>
                <div className="font-medium p-2 bg-white rounded">한국</div>
                {Object.entries(clothingSizeMap).map(([size, conversion]) => (
                  <React.Fragment key={size}>
                    <div className="p-2 bg-white rounded">{size}</div>
                    <div className="p-2 bg-white rounded">{conversion.china}</div>
                    <div className="p-2 bg-white rounded">{conversion.korea}</div>
                  </React.Fragment>
                ))}
              </div>
            </div>

            {/* 신발 사이즈 */}
            <div>
              <h4 className="font-medium mb-3" style={{ color: '#111827' }}>신발 사이즈</h4>
              <div className="grid grid-cols-2 gap-2 text-sm">
                {Object.entries(shoeSizeMap).map(([china, korea]) => (
                  <div key={china} className="p-2 bg-white rounded text-center">
                    중국 {china} → {korea}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* 택스프리 계산기 */}
          <div className="p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-2 mb-4">
              <Calculator className="w-5 h-5" style={{ color: '#111827' }} />
              <h3 className="text-lg font-semibold" style={{ color: '#111827' }}>
                택스프리 계산기
              </h3>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2" style={{ color: '#111827' }}>
                구매 금액 (원)
              </label>
              <input
                type="number"
                value={purchaseAmount}
                onChange={(e) => setPurchaseAmount(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg"
                placeholder="예: 50000"
              />
            </div>
            {purchaseAmount && (
              <div className="p-3 bg-white rounded-lg">
                <p className="text-sm text-gray-600 mb-2">환급 예상액:</p>
                {parseInt(purchaseAmount) >= 30000 ? (
                  <p className="text-xl font-bold text-green-600">
                    {calculateTaxRefund(parseInt(purchaseAmount)).toLocaleString()}원
                  </p>
                ) : (
                  <p className="text-red-500">
                    3만원 이상 구매 시 환급 가능
                  </p>
                )}
              </div>
            )}
          </div>

          {/* 인기 쇼핑 스팟 */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <MapPin className="w-5 h-5" style={{ color: '#111827' }} />
              <h3 className="text-lg font-semibold" style={{ color: '#111827' }}>
                인기 쇼핑 스팟
              </h3>
            </div>
            <div className="space-y-3">
              {shoppingSpots.map((spot, index) => (
                <div key={index} className="p-3 bg-gray-50 rounded-lg">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h4 className="font-medium mb-1" style={{ color: '#111827' }}>{spot.name}</h4>
                      <p className="text-sm text-gray-600">{spot.desc}</p>
                    </div>
                    <button
                      onClick={spot.search}
                      className="ml-3 px-3 py-1 bg-green-500 text-white text-sm rounded hover:bg-green-600"
                    >
                      지도 보기
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}