import { useState, useEffect } from 'react';
import { Download, X } from 'lucide-react';

export default function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // 이미 설치되어 있는지 확인
    const checkInstalled = () => {
      if (window.matchMedia && window.matchMedia('(display-mode: standalone)').matches) {
        setIsInstalled(true);
        return;
      }
      
      if (window.navigator.standalone) {
        setIsInstalled(true);
        return;
      }

      // 모바일 브라우저에서 이미 설치되어 있는지 확인
      if (document.referrer.includes('android-app://')) {
        setIsInstalled(true);
        return;
      }
    };

    checkInstalled();

    // beforeinstallprompt 이벤트 리스너
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      
      // 한번 닫았다면 다시 보여주지 않음
      const hasClosedBefore = localStorage.getItem('pwa-prompt-closed');
      if (!hasClosedBefore && !isInstalled) {
        setShowPrompt(true);
      }
    };

    // 앱이 설치되었을 때
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setShowPrompt(false);
      setDeferredPrompt(null);
      localStorage.removeItem('pwa-prompt-closed');
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, [isInstalled]);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    try {
      const result = await deferredPrompt.prompt();
      
      if (result.outcome === 'accepted') {
        setIsInstalled(true);
        setShowPrompt(false);
      }
      
      setDeferredPrompt(null);
    } catch (error) {
      console.error('PWA 설치 중 오류:', error);
    }
  };

  const handleClose = () => {
    setShowPrompt(false);
    localStorage.setItem('pwa-prompt-closed', 'true');
    
    // 24시간 후에 다시 보여주기
    setTimeout(() => {
      localStorage.removeItem('pwa-prompt-closed');
    }, 24 * 60 * 60 * 1000);
  };

  const handleManualInstall = () => {
    const instructions = getInstallInstructions();
    alert(instructions);
  };

  const getInstallInstructions = () => {
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    const isSamsung = /SamsungBrowser/.test(navigator.userAgent);
    const isChrome = /Chrome/.test(navigator.userAgent);

    if (isIOS) {
      return '홈 화면에 추가하려면:\n1. Safari 하단의 공유 버튼(📤)을 누르세요\n2. "홈 화면에 추가"를 선택하세요\n3. "추가"를 누르세요';
    } else if (isSamsung) {
      return '홈 화면에 추가하려면:\n1. 브라우저 메뉴(⋮)를 누르세요\n2. "앱 설치" 또는 "홈 화면에 추가"를 선택하세요';
    } else if (isChrome) {
      return '홈 화면에 추가하려면:\n1. 브라우저 메뉴(⋮)를 누르세요\n2. "홈 화면에 추가"를 선택하세요';
    } else {
      return '홈 화면에 추가하려면:\n1. 브라우저 메뉴를 누르세요\n2. "홈 화면에 추가" 또는 "바로가기 추가"를 선택하세요';
    }
  };

  if (isInstalled || !showPrompt) {
    return null;
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 mx-auto max-w-sm relative overflow-hidden">
        {/* 그라데이션 배경 */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-50 to-indigo-50"></div>
        
        <div className="relative p-4">
          {/* 닫기 버튼 */}
          <button
            onClick={handleClose}
            className="absolute top-3 right-3 p-1 rounded-full hover:bg-gray-100 transition-colors"
          >
            <X size={16} className="text-gray-500" />
          </button>

          <div className="flex items-start space-x-3">
            {/* 앱 아이콘 */}
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-gray-900 rounded-xl flex items-center justify-center shadow-md">
                <span className="text-white font-bold text-lg">H</span>
              </div>
            </div>

            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-semibold text-gray-900 mb-1">
                HanPocket 앱 설치
              </h3>
              <p className="text-xs text-gray-600 mb-3 leading-4">
                빠른 접근과 오프라인 사용을 위해 홈 화면에 추가하세요
              </p>

              <div className="flex space-x-2">
                {deferredPrompt ? (
                  <button
                    onClick={handleInstallClick}
                    className="flex items-center space-x-1 bg-gray-900 text-white px-3 py-2 rounded-lg text-xs font-medium hover:bg-gray-800 transition-colors"
                  >
                    <Download size={12} />
                    <span>설치하기</span>
                  </button>
                ) : (
                  <button
                    onClick={handleManualInstall}
                    className="flex items-center space-x-1 bg-gray-900 text-white px-3 py-2 rounded-lg text-xs font-medium hover:bg-gray-800 transition-colors"
                  >
                    <Download size={12} />
                    <span>설치 방법</span>
                  </button>
                )}
                
                <button
                  onClick={handleClose}
                  className="px-3 py-2 text-xs font-medium text-gray-600 hover:text-gray-800 transition-colors"
                >
                  나중에
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}