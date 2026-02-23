import React, { useState } from 'react';
import { ShoppingBag, Calculator, Percent, MapPin } from 'lucide-react';

function L(lang, obj) {
  return obj[lang] || obj.ko;
}

export default function ShoppingPocket({ lang = 'ko' }) {
  const [toast, setToast] = useState('');
  const [clothingSize, setClothingSize] = useState('');
  const [shoeSize, setShoeSize] = useState('');
  const [purchaseAmount, setPurchaseAmount] = useState('');
  const [activeTab, setActiveTab] = useState('clothing');

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setToast('복사됨!');
    setTimeout(() => setToast(''), 2000);
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

  const shoppingPhrases = [
    '다른 색 있어요?',
    '입어봐도 돼요?',
    '교환하고 싶어요',
    '환불해주세요'
  ];

  const discountPhrases = [
    '할인돼요?',
    '학생 할인 있어요?',
    '멤버십 있어요?'
  ];

  const shoppingSpots = [
    { name: '명동', desc: '글로벌 브랜드 집결지, 관광객 특화' },
    { name: '홍대', desc: '젊은 패션, 독특한 브랜드' },
    { name: '강남', desc: '프리미엄 브랜드, 고급 쇼핑몰' },
    { name: '동대문', desc: '24시간 도매시장, 저렴한 가격' },
    { name: '남대문', desc: '전통시장, 생활용품 위주' }
  ];

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

      {/* 사이즈 변환기 */}
      <div className="mb-8 p-4 bg-gray-50 rounded-lg">
        <h3 className="text-lg font-semibold mb-4" style={{ color: '#111827' }}>
          사이즈 변환기
        </h3>

        {/* 탭 */}
        <div className="flex mb-4 bg-white rounded-lg p-1">
          <button
            onClick={() => setActiveTab('clothing')}
            className={`flex-1 p-2 rounded ${activeTab === 'clothing' ? 'bg-blue-500 text-white' : 'text-gray-600'}`}
          >
            옷
          </button>
          <button
            onClick={() => setActiveTab('shoes')}
            className={`flex-1 p-2 rounded ${activeTab === 'shoes' ? 'bg-blue-500 text-white' : 'text-gray-600'}`}
          >
            신발
          </button>
        </div>

        {/* 옷 사이즈 */}
        {activeTab === 'clothing' && (
          <div>
            <h4 className="font-medium mb-3" style={{ color: '#111827' }}>옷 사이즈 변환표</h4>
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
        )}

        {/* 신발 사이즈 */}
        {activeTab === 'shoes' && (
          <div>
            <h4 className="font-medium mb-3" style={{ color: '#111827' }}>신발 사이즈 변환</h4>
            <div className="grid grid-cols-4 gap-2 text-sm mb-4">
              {Object.entries(shoeSizeMap).map(([china, korea]) => (
                <React.Fragment key={china}>
                  <div className="p-2 bg-white rounded text-center">
                    중국 {china} → {korea}
                  </div>
                </React.Fragment>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 쇼핑 한국어 */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold mb-4" style={{ color: '#111827' }}>
          쇼핑 한국어
        </h3>
        <div className="grid grid-cols-1 gap-3">
          {shoppingPhrases.map((phrase, index) => (
            <button
              key={index}
              onClick={() => copyToClipboard(phrase)}
              className="p-3 bg-gray-50 rounded-lg hover:bg-gray-100 text-left"
              style={{ color: '#111827' }}
            >
              {phrase}
            </button>
          ))}
        </div>
      </div>

      {/* 택스프리 계산기 */}
      <div className="mb-8 p-4 bg-gray-50 rounded-lg">
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

      {/* 할인 표현 */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-4">
          <Percent className="w-5 h-5" style={{ color: '#111827' }} />
          <h3 className="text-lg font-semibold" style={{ color: '#111827' }}>
            할인 표현
          </h3>
        </div>
        <div className="grid grid-cols-1 gap-3">
          {discountPhrases.map((phrase, index) => (
            <button
              key={index}
              onClick={() => copyToClipboard(phrase)}
              className="p-3 bg-gray-50 rounded-lg hover:bg-gray-100 text-left"
              style={{ color: '#111827' }}
            >
              {phrase}
            </button>
          ))}
        </div>
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
              <h4 className="font-medium mb-1" style={{ color: '#111827' }}>{spot.name}</h4>
              <p className="text-sm text-gray-600">{spot.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}