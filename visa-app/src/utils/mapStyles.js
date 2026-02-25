// HanPocket 맞춤 지도 스타일들

export const mapStyles = {
  // 기본 HanPocket 테마 (한국 전통 색상)
  hanpocket: [
    {
      "featureType": "all",
      "elementType": "all",
      "stylers": [
        { "saturation": -20 },
        { "lightness": 10 }
      ]
    },
    {
      "featureType": "water",
      "elementType": "all",
      "stylers": [
        { "color": "#1976D2" },  // 청자 블루
        { "lightness": 10 }
      ]
    },
    {
      "featureType": "road.highway",
      "elementType": "all",
      "stylers": [
        { "color": "#D32F2F" },  // 한국 전통 빨강
        { "weight": 2 }
      ]
    },
    {
      "featureType": "road.arterial",
      "elementType": "all", 
      "stylers": [
        { "color": "#424242" },  // 차분한 회색
        { "lightness": 20 }
      ]
    },
    {
      "featureType": "landscape",
      "elementType": "all",
      "stylers": [
        { "color": "#F5F5F5" },  // 한지 색상
        { "lightness": 20 }
      ]
    },
    {
      "featureType": "poi.park",
      "elementType": "all",
      "stylers": [
        { "color": "#388E3C" },  // 전통 초록
        { "lightness": 30 }
      ]
    },
    {
      "featureType": "poi.business",
      "elementType": "labels",
      "stylers": [
        { "color": "#FF6F00" },  // 단청 주황
        { "weight": "bold" }
      ]
    }
  ],

  // 중국인 친화 테마 (중국인 관심 장소 강조)
  chineseFriendly: [
    {
      "featureType": "all",
      "elementType": "all",
      "stylers": [
        { "saturation": -10 },
        { "lightness": 15 }
      ]
    },
    {
      "featureType": "poi.business",
      "elementType": "labels",
      "stylers": [
        { "color": "#FF1744" },  // 중국 빨강
        { "weight": "bold" },
        { "visibility": "on" }
      ]
    },
    {
      "featureType": "poi.medical",
      "elementType": "labels",
      "stylers": [
        { "color": "#00BCD4" },  // 의료 청록
        { "visibility": "on" }
      ]
    },
    {
      "featureType": "poi.attraction",
      "elementType": "labels", 
      "stylers": [
        { "color": "#FF9800" },  // 관광 주황
        { "visibility": "on" }
      ]
    },
    {
      "featureType": "transit.station",
      "elementType": "labels",
      "stylers": [
        { "color": "#9C27B0" },  // 교통 보라
        { "visibility": "on" }
      ]
    }
  ],

  // 다크 모드 (야간/고급스러운 느낌)
  darkMode: [
    {
      "featureType": "all",
      "elementType": "all",
      "stylers": [
        { "invert_lightness": true },
        { "saturation": -30 },
        { "lightness": 5 },
        { "gamma": 0.13 }
      ]
    },
    {
      "featureType": "poi.business",
      "elementType": "labels",
      "stylers": [
        { "color": "#FF4081" },  // 네온 핑크
        { "visibility": "on" }
      ]
    },
    {
      "featureType": "water",
      "elementType": "all",
      "stylers": [
        { "color": "#0D47A1" }   // 깊은 파랑
      ]
    }
  ],

  // 미니멀 모드 (깔끔한 느낌)
  minimal: [
    {
      "featureType": "all",
      "elementType": "all",
      "stylers": [
        { "saturation": -100 },  // 흑백
        { "lightness": 50 }
      ]
    },
    {
      "featureType": "poi",
      "elementType": "labels",
      "stylers": [
        { "visibility": "off" }  // POI 라벨 숨김
      ]
    },
    {
      "featureType": "poi.business",
      "elementType": "labels",
      "stylers": [
        { "color": "#FF5722" },  // 포인트 컬러만 빨강
        { "visibility": "on" }
      ]
    }
  ]
}

// 스타일 적용 함수
export const applyMapStyle = (map, styleName) => {
  const style = mapStyles[styleName]
  if (!style) {
    console.warn(`스타일 '${styleName}'을 찾을 수 없습니다.`)
    return
  }

  // 네이버 지도에 스타일 적용
  map.setOptions({
    mapTypeId: naver.maps.MapTypeId.NORMAL,
    styles: style
  })
}

// 동적 스타일 전환 함수
export const switchMapTheme = (map, theme) => {
  switch(theme) {
    case 'hanpocket':
      applyMapStyle(map, 'hanpocket')
      break
    case 'chinese':
      applyMapStyle(map, 'chineseFriendly')
      break
    case 'dark':
      applyMapStyle(map, 'darkMode')
      break
    case 'minimal':
      applyMapStyle(map, 'minimal')
      break
    default:
      // 기본 네이버 스타일로 복원
      map.setOptions({ styles: null })
  }
}