/**
 * Context-aware Smart Recommendation Engine
 * Combines: time of day + weather + user location/area
 *
 * TODO: Integrate Naver Place API for real ratings/hours: VITE_NAVER_CLIENT_ID, VITE_NAVER_CLIENT_SECRET
 */

import { fetchCurrentWeather, AREA_COORDS } from './weatherApi'

// Recommendation templates by context
const RECOMMENDATIONS = {
  // Morning (6-11) + Rain
  morning_rain: [
    {
      title: { ko: '비 오는 아침, 따뜻한 카페에서 시작', zh: '雨天早晨，从温暖的咖啡馆开始', en: 'Rainy morning — start at a cozy café', ja: '雨の朝、温かいカフェからスタート' },
      items: [
        { name: { ko: '블루보틀 성수', zh: 'Blue Bottle 圣水', en: 'Blue Bottle Seongsu', ja: 'ブルーボトル聖水' }, type: 'cafe', area: 'seongsu' },
        { name: { ko: '프릳츠 마포', zh: 'Fritz 麻浦', en: 'Fritz Mapo', ja: 'フリッツ麻浦' }, type: 'cafe', area: 'hongdae' },
        { name: { ko: '테라로사 강남', zh: 'Terarosa 江南', en: 'Terarosa Gangnam', ja: 'テラロサ江南' }, type: 'cafe', area: 'gangnam' },
      ],
      icon: 'coffee',
    },
  ],
  // Morning (6-11) + Clear
  morning_clear: [
    {
      title: { ko: '상쾌한 아침, 한강 산책 어때요?', zh: '清爽的早晨，去汉江散步怎么样？', en: 'Fresh morning — how about a Han River walk?', ja: '爽やかな朝、漢江の散歩はいかが？' },
      items: [
        { name: { ko: '한강 여의도공원', zh: '汉江汝矣岛公园', en: 'Yeouido Hangang Park', ja: '漢江ヨイド公園' }, type: 'park', area: 'yeouido' },
        { name: { ko: '북촌 한옥마을', zh: '北村韩屋村', en: 'Bukchon Hanok Village', ja: '北村韓屋村' }, type: 'attraction', area: 'jongno' },
        { name: { ko: '남산타워 산책로', zh: '南山塔步道', en: 'Namsan Tower Trail', ja: '南山タワー散策路' }, type: 'attraction', area: 'myeongdong' },
      ],
      icon: 'sun',
    },
  ],
  // Afternoon (11-17) + Rain
  afternoon_rain: [
    {
      title: { ko: '비 오는 오후, 실내에서 즐기기', zh: '雨天下午，室内好去处', en: 'Rainy afternoon — best indoor spots', ja: '雨の午後、屋内で楽しむ' },
      items: [
        { name: { ko: '코엑스 별마당 도서관', zh: 'COEX星空图书馆', en: 'COEX Starfield Library', ja: 'COEXスターフィールド図書館' }, type: 'indoor', area: 'gangnam' },
        { name: { ko: '더현대 서울', zh: 'The Hyundai Seoul', en: 'The Hyundai Seoul', ja: 'ザ・ヒョンデ ソウル' }, type: 'shopping', area: 'yeouido' },
        { name: { ko: '국립중앙박물관', zh: '国立中央博物馆', en: 'National Museum of Korea', ja: '国立中央博物館' }, type: 'museum', area: 'itaewon' },
      ],
      icon: 'cloud-rain',
    },
  ],
  // Afternoon (11-17) + Clear
  afternoon_clear: [
    {
      title: { ko: '날씨 좋은 오후, 거리 구경하기', zh: '好天气的下午，逛街去', en: 'Nice afternoon — time to explore', ja: '天気のいい午後、街を散策' },
      items: [
        { name: { ko: '홍대 거리', zh: '弘大街', en: 'Hongdae Street', ja: 'ホンデ通り' }, type: 'street', area: 'hongdae' },
        { name: { ko: '성수동 카페거리', zh: '圣水洞咖啡街', en: 'Seongsu Cafe Street', ja: '聖水洞カフェ通り' }, type: 'street', area: 'seongsu' },
        { name: { ko: '이태원 경리단길', zh: '梨泰院经理团路', en: 'Gyeongridan-gil Itaewon', ja: 'イテウォン経理団キル' }, type: 'street', area: 'itaewon' },
      ],
      icon: 'map-pin',
    },
  ],
  // Evening (17-21) + Clear
  evening_clear: [
    {
      title: { ko: '노을이 예쁜 시간, 포토존 TOP 3', zh: '夕阳最美的时候，TOP 3打卡点', en: 'Golden hour — top 3 photo spots', ja: '夕日が美しい時間、フォトスポットTOP3' },
      items: [
        { name: { ko: '남산타워 전망대', zh: '南山塔观景台', en: 'N Seoul Tower Observatory', ja: 'Nソウルタワー展望台' }, type: 'viewpoint', area: 'myeongdong' },
        { name: { ko: '한강 반포대교 달빛무지개분수', zh: '盘浦大桥月光彩虹喷泉', en: 'Banpo Bridge Rainbow Fountain', ja: '盤浦大橋月光虹噴水' }, type: 'viewpoint', area: 'gangnam' },
        { name: { ko: '인왕산 서울 야경', zh: '仁王山首尔夜景', en: 'Inwangsan Night View', ja: '仁王山ソウル夜景' }, type: 'viewpoint', area: 'jongno' },
      ],
      icon: 'sunset',
    },
  ],
  // Evening (17-21) + Rain
  evening_rain: [
    {
      title: { ko: '비 오는 저녁, 맛있는 거 먹으러', zh: '雨天傍晚，去吃好吃的', en: 'Rainy evening — comfort food time', ja: '雨の夕方、美味しいものを食べに' },
      items: [
        { name: { ko: '을지로 노포 골목', zh: '乙支路老店胡同', en: 'Euljiro Old Shop Alley', ja: '乙支路老舗横丁' }, type: 'food', area: 'jongno' },
        { name: { ko: '광장시장 야시장', zh: '广藏市场夜市', en: 'Gwangjang Market Night', ja: '広蔵市場夜市' }, type: 'food', area: 'jongno' },
        { name: { ko: '명동교자 (칼국수)', zh: '明洞饺子（刀削面）', en: 'Myeongdong Kyoja (knife noodles)', ja: '明洞餃子（カルグクス）' }, type: 'food', area: 'myeongdong' },
      ],
      icon: 'utensils',
    },
  ],
  // Night (21-06)
  night: [
    {
      title: { ko: '밤이 깊었지만, 아직 즐길 곳', zh: '夜深了，但还有好去处', en: 'Late night — still things to do', ja: '夜更けでも、まだ楽しめる場所' },
      items: [
        { name: { ko: '편의점 야식 추천: 불닭볶음면, 삼각김밥', zh: '便利店夜宵推荐：火鸡面、三角饭团', en: 'Convenience store picks: Buldak, Onigiri', ja: 'コンビニ夜食おすすめ：ブルダック、おにぎり' }, type: 'convenience', area: '' },
        { name: { ko: '을지로 포장마차 골목', zh: '乙支路帐篷摊胡同', en: 'Euljiro Street Bar Alley', ja: '乙支路屋台横丁' }, type: 'bar', area: 'jongno' },
        { name: { ko: '한강 치맥 (치킨+맥주) 배달', zh: '汉江炸鸡+啤酒外卖', en: 'Han River Chimaek (chicken+beer) delivery', ja: '漢江チキン+ビール配達' }, type: 'food', area: 'yeouido' },
      ],
      icon: 'moon',
    },
  ],
  // Cold weather (< 5°C)
  cold: [
    {
      title: { ko: '추운 날, 따뜻한 곳으로', zh: '冷天，去暖和的地方', en: 'Cold day — warm places', ja: '寒い日、暖かい場所へ' },
      items: [
        { name: { ko: '찜질방 (드래곤힐스파)', zh: '汗蒸房（Dragon Hill Spa）', en: 'Jjimjilbang (Dragon Hill Spa)', ja: 'チムジルバン（ドラゴンヒルスパ）' }, type: 'spa', area: 'itaewon' },
        { name: { ko: '지하상가 쇼핑 (고투몰)', zh: '地下商场购物（GOTO Mall）', en: 'Underground shopping (GOTO Mall)', ja: '地下街ショッピング（GOTOモール）' }, type: 'shopping', area: 'gangnam' },
        { name: { ko: '뜨끈한 국밥 한 그릇', zh: '一碗热乎乎的汤饭', en: 'A bowl of hot gukbap (soup rice)', ja: '熱々のクッパ一杯' }, type: 'food', area: '' },
      ],
      icon: 'thermometer',
    },
  ],
}

/**
 * Get contextual recommendation based on current conditions
 */
export async function getSmartRecommendation(userArea = null) {
  const weather = await fetchCurrentWeather()
  const hour = new Date().getHours()

  let timeSlot
  if (hour >= 6 && hour < 11) timeSlot = 'morning'
  else if (hour >= 11 && hour < 17) timeSlot = 'afternoon'
  else if (hour >= 17 && hour < 21) timeSlot = 'evening'
  else timeSlot = 'night'

  // Cold weather override
  if (weather.temp < 5 && timeSlot !== 'night') {
    const recs = RECOMMENDATIONS.cold
    return { ...recs[0], weather, timeSlot, area: userArea }
  }

  // Night override (no weather distinction)
  if (timeSlot === 'night') {
    const recs = RECOMMENDATIONS.night
    return { ...recs[0], weather, timeSlot, area: userArea }
  }

  // Time + weather combination
  const weatherType = weather.isRaining || weather.isSnowing ? 'rain' : 'clear'
  const key = `${timeSlot}_${weatherType}`
  const recs = RECOMMENDATIONS[key] || RECOMMENDATIONS[`${timeSlot}_clear`]

  if (!recs || recs.length === 0) {
    return null
  }

  const rec = recs[0]

  // If user has a specific area, prioritize items from that area
  if (userArea && rec.items) {
    const sorted = [...rec.items].sort((a, b) => {
      if (a.area === userArea && b.area !== userArea) return -1
      if (b.area === userArea && a.area !== userArea) return 1
      return 0
    })
    return { ...rec, items: sorted, weather, timeSlot, area: userArea }
  }

  return { ...rec, weather, timeSlot, area: userArea }
}
