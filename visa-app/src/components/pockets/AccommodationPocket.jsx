import React, { useState, useEffect } from 'react';
import { Home, AlertTriangle, MapPin, Luggage, Info, ExternalLink } from 'lucide-react';

function L(lang, obj) {
  return obj[lang] || obj.ko;
}

export default function AccommodationPocket({ lang = 'ko' }) {
  const [toast, setToast] = useState('');
  const [address, setAddress] = useState('');
  const [savedAddress, setSavedAddress] = useState('');

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

  const checkInOutPhrases = [
    '체크인이요',
    '체크아웃이요',
    '방 열쇠 주세요'
  ];

  const problemPhrases = [
    '에어컨이 안 돼요',
    '온수가 안 나와요',
    '와이파이가 안 돼요',
    '수건 더 주세요',
    '방이 너무 추워요'
  ];

  const luggagePhrases = [
    '짐 맡길 수 있어요?',
    '몇 시까지요?'
  ];

  const accommodationTypes = [
    {
      name: '호텔',
      desc: '풀서비스, 24시간 프런트데스크, 룸서비스'
    },
    {
      name: '모텔',
      desc: '저렴한 가격, 기본적인 서비스, 단기 숙박'
    },
    {
      name: '게스트하우스',
      desc: '공용 공간, 백패커 친화적, 소셜한 분위기'
    },
    {
      name: '에어비앤비',
      desc: '개인 숙소, 주방 사용 가능, 현지 체험'
    }
  ];

  const bookingSites = [
    {
      name: '야놀자',
      url: 'https://www.yanolja.com',
      desc: '국내 최대 숙박 플랫폼'
    },
    {
      name: '여기어때',
      url: 'https://www.goodchoice.kr',
      desc: '다양한 숙박 옵션'
    },
    {
      name: '에어비앤비',
      url: 'https://www.airbnb.co.kr',
      desc: '개인 숙소 전문'
    },
    {
      name: '부킹닷컴',
      url: 'https://www.booking.com',
      desc: '글로벌 호텔 예약'
    }
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
        <Home className="w-8 h-8" style={{ color: '#111827' }} />
        <h2 className="text-2xl font-bold" style={{ color: '#111827' }}>
          {L(lang, { ko: '숙소 주머니', zh: '住宿袋', en: 'Accommodation Pocket' })}
        </h2>
      </div>

      {/* 체크인/아웃 */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold mb-4" style={{ color: '#111827' }}>
          체크인/아웃
        </h3>
        <div className="grid grid-cols-1 gap-3">
          {checkInOutPhrases.map((phrase, index) => (
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

      {/* 문제 상황 */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-4">
          <AlertTriangle className="w-5 h-5" style={{ color: '#111827' }} />
          <h3 className="text-lg font-semibold" style={{ color: '#111827' }}>
            문제 상황
          </h3>
        </div>
        <div className="grid grid-cols-1 gap-3">
          {problemPhrases.map((phrase, index) => (
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

      {/* 숙소 주소 저장 */}
      <div className="mb-8 p-4 bg-gray-50 rounded-lg">
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
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-4">
          <Luggage className="w-5 h-5" style={{ color: '#111827' }} />
          <h3 className="text-lg font-semibold" style={{ color: '#111827' }}>
            짐 보관
          </h3>
        </div>
        <div className="grid grid-cols-1 gap-3">
          {luggagePhrases.map((phrase, index) => (
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

      {/* 숙소 타입 안내 */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-4">
          <Info className="w-5 h-5" style={{ color: '#111827' }} />
          <h3 className="text-lg font-semibold" style={{ color: '#111827' }}>
            숙소 타입 안내
          </h3>
        </div>
        <div className="space-y-3">
          {accommodationTypes.map((type, index) => (
            <div key={index} className="p-3 bg-gray-50 rounded-lg">
              <h4 className="font-medium mb-1" style={{ color: '#111827' }}>{type.name}</h4>
              <p className="text-sm text-gray-600">{type.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* 추천 예약 사이트 */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <ExternalLink className="w-5 h-5" style={{ color: '#111827' }} />
          <h3 className="text-lg font-semibold" style={{ color: '#111827' }}>
            추천 예약 사이트
          </h3>
        </div>
        <div className="space-y-3">
          {bookingSites.map((site, index) => (
            <div key={index} className="p-3 bg-gray-50 rounded-lg">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h4 className="font-medium mb-1" style={{ color: '#111827' }}>{site.name}</h4>
                  <p className="text-sm text-gray-600">{site.desc}</p>
                </div>
                <a
                  href={site.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ml-3 px-3 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600"
                >
                  방문
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}