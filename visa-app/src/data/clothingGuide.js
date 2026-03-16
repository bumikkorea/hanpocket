// 날씨 기반 의상 추천 가이드
// 중국인 관광객 맞춤 의상 문화 반영

export const CLOTHING_GUIDE = {
  // 기온별 의상 추천
  temperature: {
    cold: { // -10°C ~ 5°C
      min: -20,
      max: 5,
      clothes: {
        ko: '패딩/두꺼운 코트 + 목도리 + 장갑',
        zh: '羽绒服/厚外套 + 围巾 + 手套',
        en: 'Down jacket/thick coat + scarf + gloves'
      },
      icon: '🧥',
      tips: {
        ko: '실내외 온도차 큰 편이니 탈착 가능한 옷으로 준비하세요',
        zh: '室内外温差较大，建议穿脱方便的衣服',
        en: 'Large temperature difference indoors/outdoors, wear layered clothes'
      }
    },
    cool: { // 6°C ~ 15°C
      min: 6,
      max: 15,
      clothes: {
        ko: '자켓/얇은 코트 + 긴팔 + 긴바지',
        zh: '夹克/薄外套 + 长袖 + 长裤',
        en: 'Jacket/light coat + long sleeves + long pants'
      },
      icon: '🧥',
      tips: {
        ko: '아침저녁 쌀쌀하니 겉옷 준비하세요',
        zh: '早晚较凉，请准备外套',
        en: 'Mornings and evenings are chilly, bring a jacket'
      }
    },
    mild: { // 16°C ~ 22°C
      min: 16,
      max: 22,
      clothes: {
        ko: '긴팔 셔츠 + 얇은 가디건',
        zh: '长袖衬衫 + 薄开衫',
        en: 'Long-sleeve shirt + light cardigan'
      },
      icon: '👕',
      tips: {
        ko: '걷기 좋은 날씨, 편안한 운동화 추천',
        zh: '适合步行的天气，推荐舒适的运动鞋',
        en: 'Perfect weather for walking, comfortable sneakers recommended'
      }
    },
    warm: { // 23°C ~ 27°C
      min: 23,
      max: 27,
      clothes: {
        ko: '반팔 + 얇은 긴팔 (에어컨 대비)',
        zh: '短袖 + 薄长袖（应对空调）',
        en: 'T-shirt + light long sleeves (for AC)'
      },
      icon: '👕',
      tips: {
        ko: '실내 에어컨이 강하니 얇은 겉옷 준비하세요',
        zh: '室内空调较强，请准备薄外套',
        en: 'Strong indoor AC, bring a light jacket'
      }
    },
    hot: { // 28°C+
      min: 28,
      max: 45,
      clothes: {
        ko: '반팔 + 반바지 + 썬크림',
        zh: '短袖 + 短裤 + 防晒霜',
        en: 'T-shirt + shorts + sunscreen'
      },
      icon: '☀️',
      tips: {
        ko: '자외선 강하니 모자와 선글라스 준비하세요',
        zh: '紫外线较强，请准备帽子和太阳镜',
        en: 'Strong UV rays, bring hat and sunglasses'
      }
    }
  },

  // 날씨별 추가 아이템
  weather: {
    rain: {
      items: {
        ko: '우산 + 방수 신발',
        zh: '雨伞 + 防水鞋',
        en: 'Umbrella + waterproof shoes'
      },
      icon: '☔',
      warning: {
        ko: '지하철역에서 우산 구매 가능 (2000-3000원)',
        zh: '地铁站内可购买雨伞（2000-3000韩元）',
        en: 'Umbrellas available at subway stations (2000-3000 KRW)'
      }
    },
    snow: {
      items: {
        ko: '미끄럼방지 신발 + 두꺼운 양말',
        zh: '防滑鞋 + 厚袜子',
        en: 'Non-slip shoes + thick socks'
      },
      icon: '❄️',
      warning: {
        ko: '서울 겨울 길이 미끄러우니 주의하세요',
        zh: '首尔冬天路面湿滑请小心',
        en: 'Seoul winter roads can be slippery, be careful'
      }
    },
    wind: {
      items: {
        ko: '바람막이 + 모자',
        zh: '风衣 + 帽子',
        en: 'Windbreaker + hat'
      },
      icon: '💨',
      warning: {
        ko: '강풍 시 지하철 이용 추천',
        zh: '大风时建议使用地铁',
        en: 'Use subway during strong winds'
      }
    }
  },

  // 습도별 주의사항
  humidity: {
    dry: { // < 40%
      max: 40,
      care: {
        ko: '립밤 + 핸드크림 필수',
        zh: '润唇膏 + 护手霜必备',
        en: 'Lip balm + hand cream essential'
      },
      icon: '💄'
    },
    humid: { // > 70%
      min: 70,
      care: {
        ko: '통풍 좋은 옷 + 물티슈',
        zh: '透气衣物 + 湿巾',
        en: 'Breathable clothes + wet wipes'
      },
      icon: '💧'
    }
  },

  // 중국인 맞춤 문화적 고려사항
  culturalTips: {
    mask: {
      ko: '한국도 마스크 착용 자유롭습니다',
      zh: '韩国佩戴口罩也很自由',
      en: 'Mask wearing is also common in Korea'
    },
    fashion: {
      ko: '한국은 레이어드룩 문화 - 얇은 옷 여러 겹',
      zh: '韩国流行层次穿搭 - 多层薄衣',
      en: 'Korea favors layered fashion - multiple thin layers'
    },
    shopping: {
      ko: '동대문/명동에서 현지 스타일 구매 가능',
      zh: '可在东大门/明洞购买当地风格服装',
      en: 'Local style clothes available at Dongdaemun/Myeongdong'
    }
  }
}

// 현재 날씨에 맞는 의상 추천 반환
export function getClothingRecommendation(temperature, weatherCode, humidity, language = 'ko') {
  let recommendation = {
    temperature: null,
    weather: [],
    humidity: null,
    icon: '👕',
    tips: []
  }

  // 기온별 의상
  for (const [key, range] of Object.entries(CLOTHING_GUIDE.temperature)) {
    if (temperature >= range.min && temperature <= range.max) {
      recommendation.temperature = {
        clothes: range.clothes[language],
        icon: range.icon,
        tips: range.tips[language]
      }
      break
    }
  }

  // 날씨별 추가 아이템
  if (weatherCode >= 61 && weatherCode <= 67) { // 비
    recommendation.weather.push({
      ...CLOTHING_GUIDE.weather.rain,
      items: CLOTHING_GUIDE.weather.rain.items[language],
      warning: CLOTHING_GUIDE.weather.rain.warning[language]
    })
  }
  if (weatherCode >= 71 && weatherCode <= 77) { // 눈
    recommendation.weather.push({
      ...CLOTHING_GUIDE.weather.snow,
      items: CLOTHING_GUIDE.weather.snow.items[language],
      warning: CLOTHING_GUIDE.weather.snow.warning[language]
    })
  }

  // 습도별 케어
  if (humidity < 40) {
    recommendation.humidity = {
      ...CLOTHING_GUIDE.humidity.dry,
      care: CLOTHING_GUIDE.humidity.dry.care[language]
    }
  } else if (humidity > 70) {
    recommendation.humidity = {
      ...CLOTHING_GUIDE.humidity.humid,
      care: CLOTHING_GUIDE.humidity.humid.care[language]
    }
  }

  return recommendation
}