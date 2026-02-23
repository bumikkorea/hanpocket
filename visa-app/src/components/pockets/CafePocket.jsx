import React, { useState } from 'react';
import { Coffee, Wifi, Zap, Package, MapPin } from 'lucide-react';

function L(lang, obj) {
  return obj[lang] || obj.ko;
}

export default function CafePocket({ lang = 'ko' }) {
  const [selectedDrink, setSelectedDrink] = useState('아메리카노');
  const [selectedTemp, setSelectedTemp] = useState('아이스');
  const [selectedSize, setSelectedSize] = useState('톨');
  const [customOptions, setCustomOptions] = useState({
    lessIce: false,
    noSyrup: false,
    extraShot: false
  });
  const [toast, setToast] = useState('');

  const drinks = ['아메리카노', '라떼', '에이드', '스무디'];
  const temps = ['아이스', '핫'];
  const sizes = ['톨', '그란데'];

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setToast('복사됨!');
    setTimeout(() => setToast(''), 2000);
  };

  const buildOrder = () => {
    let order = `${selectedTemp} ${selectedDrink} ${selectedSize} 사이즈 주세요`;
    
    const customs = [];
    if (customOptions.lessIce) customs.push('얼음 적게요');
    if (customOptions.noSyrup) customs.push('시럽 빼주세요');
    if (customOptions.extraShot) customs.push('샷 추가요');
    
    if (customs.length > 0) {
      order += `, ${customs.join(', ')}`;
    }
    
    return order;
  };

  const toggleCustom = (option) => {
    setCustomOptions(prev => ({
      ...prev,
      [option]: !prev[option]
    }));
  };

  const cafeChains = [
    { name: '스타벅스', price: '5,000-7,000원' },
    { name: '이디야', price: '2,000-4,000원' },
    { name: '투썸플레이스', price: '4,000-6,000원' },
    { name: '메가커피', price: '1,500-3,000원' },
    { name: '컴포즈커피', price: '1,500-3,000원' }
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
        <Coffee className="w-8 h-8" style={{ color: '#111827' }} />
        <h2 className="text-2xl font-bold" style={{ color: '#111827' }}>
          {L(lang, { ko: '카페 주머니', zh: '咖啡袋', en: 'Cafe Pocket' })}
        </h2>
      </div>

      {/* 주문 빌더 */}
      <div className="mb-8 p-4 bg-gray-50 rounded-lg">
        <h3 className="text-lg font-semibold mb-4" style={{ color: '#111827' }}>
          주문 빌더
        </h3>

        {/* 음료 선택 */}
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2" style={{ color: '#111827' }}>음료</label>
          <div className="grid grid-cols-2 gap-2">
            {drinks.map(drink => (
              <button
                key={drink}
                onClick={() => setSelectedDrink(drink)}
                className={`p-2 rounded border ${selectedDrink === drink ? 'bg-blue-100 border-blue-500' : 'bg-white border-gray-300'}`}
              >
                {drink}
              </button>
            ))}
          </div>
        </div>

        {/* 온도 선택 */}
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2" style={{ color: '#111827' }}>온도</label>
          <div className="grid grid-cols-2 gap-2">
            {temps.map(temp => (
              <button
                key={temp}
                onClick={() => setSelectedTemp(temp)}
                className={`p-2 rounded border ${selectedTemp === temp ? 'bg-blue-100 border-blue-500' : 'bg-white border-gray-300'}`}
              >
                {temp}
              </button>
            ))}
          </div>
        </div>

        {/* 사이즈 선택 */}
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2" style={{ color: '#111827' }}>사이즈</label>
          <div className="grid grid-cols-2 gap-2">
            {sizes.map(size => (
              <button
                key={size}
                onClick={() => setSelectedSize(size)}
                className={`p-2 rounded border ${selectedSize === size ? 'bg-blue-100 border-blue-500' : 'bg-white border-gray-300'}`}
              >
                {size}
              </button>
            ))}
          </div>
        </div>

        {/* 커스텀 옵션 */}
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2" style={{ color: '#111827' }}>커스텀 옵션</label>
          <div className="space-y-2">
            {[
              { key: 'lessIce', label: '얼음 적게요' },
              { key: 'noSyrup', label: '시럽 빼주세요' },
              { key: 'extraShot', label: '샷 추가요' }
            ].map(option => (
              <button
                key={option.key}
                onClick={() => toggleCustom(option.key)}
                className={`w-full text-left p-2 rounded border ${customOptions[option.key] ? 'bg-green-100 border-green-500' : 'bg-white border-gray-300'}`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        {/* 생성된 주문 */}
        <div className="p-3 bg-white rounded border">
          <p className="font-medium mb-2" style={{ color: '#111827' }}>생성된 주문:</p>
          <p className="text-lg" style={{ color: '#111827' }}>{buildOrder()}</p>
        </div>
        <button
          onClick={() => copyToClipboard(buildOrder())}
          className="w-full mt-2 p-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          주문 복사하기
        </button>
      </div>

      {/* 카페 상황별 표현 */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold mb-4" style={{ color: '#111827' }}>
          카페 상황별 표현
        </h3>
        <div className="grid grid-cols-1 gap-3">
          {[
            { icon: Wifi, text: '와이파이 비밀번호 뭐예요?' },
            { icon: Zap, text: '충전할 수 있는 자리 있어요?' },
            { icon: Package, text: '포장해주세요' },
            { icon: MapPin, text: '여기서 먹을게요' }
          ].map((item, index) => (
            <button
              key={index}
              onClick={() => copyToClipboard(item.text)}
              className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 text-left"
            >
              <item.icon className="w-5 h-5" style={{ color: '#111827' }} />
              <span style={{ color: '#111827' }}>{item.text}</span>
            </button>
          ))}
        </div>
      </div>

      {/* 인기 카페 체인 */}
      <div>
        <h3 className="text-lg font-semibold mb-4" style={{ color: '#111827' }}>
          인기 카페 체인
        </h3>
        <div className="space-y-3">
          {cafeChains.map((cafe, index) => (
            <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
              <span className="font-medium" style={{ color: '#111827' }}>{cafe.name}</span>
              <span className="text-sm text-gray-600">{cafe.price}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}