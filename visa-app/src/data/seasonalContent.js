/**
 * 계절별 맞춤 콘텐츠
 * 월별로 한국 여행 시 유용한 정보 제공
 */

// 현재 월을 기준으로 계절 판단
export const getCurrentSeason = () => {
  const month = new Date().getMonth() + 1; // 1-12
  
  if (month >= 3 && month <= 5) return 'spring';
  if (month >= 6 && month <= 8) return 'summer';
  if (month >= 9 && month <= 11) return 'autumn';
  return 'winter';
};

// 계절별 콘텐츠 데이터
export const seasonalContent = {
  spring: {
    icon: '🌸',
    period: 'ko:3~5월|zh:3~5月|en:Mar-May',
    title: {
      ko: '봄 여행 가이드',
      zh: '春季旅游指南',
      en: 'Spring Travel Guide'
    },
    subtitle: {
      ko: '벚꽃과 함께하는 서울',
      zh: '与樱花一起的首尔',
      en: 'Seoul with Cherry Blossoms'
    },
    highlights: [
      {
        title: { ko: '벚꽃 명소', zh: '赏樱名所', en: 'Cherry Blossom Spots' },
        items: [
          { ko: '여의도 한강공원', zh: '汝矣岛汉江公园', en: 'Yeouido Hangang Park' },
          { ko: '남산공원', zh: '南山公园', en: 'Namsan Park' },
          { ko: '석촌호수', zh: '石村湖', en: 'Seokchon Lake' },
          { ko: '창덕궁 후원', zh: '昌德宫后苑', en: 'Changdeokgung Secret Garden' }
        ]
      },
      {
        title: { ko: '3월 축제', zh: '3月节庆', en: 'March Festivals' },
        items: [
          { ko: '서울 빛초랑 축제', zh: '首尔灯光节', en: 'Seoul Lantern Festival' },
          { ko: '국립중앙박물관 봄 특별전', zh: '国立中央博物馆春季特展', en: 'National Museum Spring Exhibition' }
        ]
      }
    ],
    tips: [
      {
        category: { ko: '날씨 & 옷차림', zh: '天气&着装', en: 'Weather & Clothing' },
        content: { 
          ko: '일교차 큰 계절. 얇은 겉옷 필수. 평균 기온 5-15°C',
          zh: '昼夜温差大的季节。轻薄外套必备。平均气温5-15°C',
          en: 'Big temperature difference. Light jacket essential. Average temp 5-15°C'
        }
      },
      {
        category: { ko: '준비물', zh: '准备物品', en: 'What to Bring' },
        content: { 
          ko: '돗자리, 간식, 카메라, 마스크(미세먼지 대비)',
          zh: '野餐垫、零食、相机、口罩（防雾霾）',
          en: 'Picnic mat, snacks, camera, mask (for fine dust)'
        }
      },
      {
        category: { ko: '베스트 타이밍', zh: '最佳时机', en: 'Best Timing' },
        content: { 
          ko: '벚꽃: 3월 말~4월 초 (1-2주간), 주말 오전 추천',
          zh: '樱花：3月末~4月初（1-2周），周末上午推荐',
          en: 'Cherry blossoms: Late Mar~Early Apr (1-2 weeks), Weekend mornings recommended'
        }
      }
    ]
  },
  
  summer: {
    icon: '☀️',
    period: 'ko:6~8월|zh:6~8月|en:Jun-Aug',
    title: {
      ko: '여름 여행 가이드',
      zh: '夏季旅游指南', 
      en: 'Summer Travel Guide'
    },
    subtitle: {
      ko: '더위를 피하는 스마트한 여행',
      zh: '避暑的智慧旅行',
      en: 'Smart Travel to Beat the Heat'
    },
    highlights: [
      {
        title: { ko: '실내 명소', zh: '室内景点', en: 'Indoor Attractions' },
        items: [
          { ko: '롯데월드타워 스카이서울', zh: '乐天世界塔天空首尔', en: 'Lotte World Tower Sky Seoul' },
          { ko: '동대문 디자인플라자', zh: '东大门设计广场', en: 'Dongdaemun Design Plaza' },
          { ko: '코엑스 아쿠아리움', zh: 'COEX水族馆', en: 'COEX Aquarium' }
        ]
      }
    ],
    tips: [
      {
        category: { ko: '더위 대비', zh: '防暑对策', en: 'Heat Protection' },
        content: { 
          ko: '선크림, 모자, 충분한 수분 섭취. 지하상가 활용',
          zh: '防晒霜、帽子、充分补水。利用地下商街',
          en: 'Sunscreen, hat, stay hydrated. Use underground shopping areas'
        }
      }
    ]
  },

  autumn: {
    icon: '🍁',
    period: 'ko:9~11월|zh:9~11月|en:Sep-Nov',
    title: {
      ko: '가을 여행 가이드',
      zh: '秋季旅游指南',
      en: 'Autumn Travel Guide'
    },
    subtitle: {
      ko: '단풍과 함께하는 낭만적인 서울',
      zh: '与红叶一起的浪漫首尔',
      en: 'Romantic Seoul with Fall Foliage'
    },
    highlights: [
      {
        title: { ko: '단풍 명소', zh: '赏枫名所', en: 'Fall Foliage Spots' },
        items: [
          { ko: '북한산국립공원', zh: '北汉山国立公园', en: 'Bukhansan National Park' },
          { ko: '남산서울타워', zh: '南山首尔塔', en: 'N Seoul Tower' },
          { ko: '덕수궁 돌담길', zh: '德寿宫石墙路', en: 'Deoksugung Stone Wall Road' }
        ]
      }
    ],
    tips: [
      {
        category: { ko: '단풍 시기', zh: '红叶时期', en: 'Foliage Season' },
        content: { 
          ko: '10월 중순~11월 초 절정. 등산화 준비 권장',
          zh: '10月中旬~11月初最佳。建议准备登山鞋',
          en: 'Peak: Mid Oct~Early Nov. Hiking boots recommended'
        }
      }
    ]
  },

  winter: {
    icon: '❄️',
    period: 'ko:12~2월|zh:12~2月|en:Dec-Feb',
    title: {
      ko: '겨울 여행 가이드',
      zh: '冬季旅游指南',
      en: 'Winter Travel Guide'
    },
    subtitle: {
      ko: '따뜻한 실내와 겨울 축제',
      zh: '温暖室内与冬季庆典',
      en: 'Warm Indoors & Winter Festivals'
    },
    highlights: [
      {
        title: { ko: '겨울 축제', zh: '冬季节庆', en: 'Winter Festivals' },
        items: [
          { ko: '서울빛초랑 축제', zh: '首尔灯饰节', en: 'Seoul Lantern Festival' },
          { ko: '롯데월드 아이스링크', zh: '乐天世界溜冰场', en: 'Lotte World Ice Rink' }
        ]
      }
    ],
    tips: [
      {
        category: { ko: '한파 대비', zh: '防寒对策', en: 'Cold Protection' },
        content: { 
          ko: '패딩, 목도리, 핫팩 필수. 지하철 이용 권장',
          zh: '羽绒服、围巾、暖宝宝必备。推荐使用地铁',
          en: 'Padded jacket, scarf, heat packs essential. Use subway'
        }
      }
    ]
  }
};

// 현재 계절 정보 가져오기
export const getCurrentSeasonContent = () => {
  const season = getCurrentSeason();
  return seasonalContent[season];
};

// 다음 계절 미리보기
export const getNextSeasonPreview = () => {
  const currentSeason = getCurrentSeason();
  const seasons = ['winter', 'spring', 'summer', 'autumn'];
  const currentIndex = seasons.indexOf(currentSeason);
  const nextIndex = (currentIndex + 1) % 4;
  return seasonalContent[seasons[nextIndex]];
};