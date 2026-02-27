/**
 * TourAPI 코드 정의 (ContentType, Area, Sigungu)
 */

export const CONTENT_TYPES = {
  75: { ko: '레포츠', zh: '休闲运动', en: 'Leisure Sports', icon: 'Bike' },
  76: { ko: '관광지', zh: '景点', en: 'Attractions', icon: 'MapPin' },
  77: { ko: '교통', zh: '交通', en: 'Transport', icon: 'Bus' },
  78: { ko: '문화시설', zh: '文化设施', en: 'Culture', icon: 'Building2' },
  79: { ko: '쇼핑', zh: '购物', en: 'Shopping', icon: 'ShoppingBag' },
  80: { ko: '숙박', zh: '住宿', en: 'Accommodation', icon: 'Hotel' },
  82: { ko: '음식점', zh: '餐厅', en: 'Restaurants', icon: 'UtensilsCrossed' },
  85: { ko: '행사/축제', zh: '活动/庆典', en: 'Events/Festivals', icon: 'PartyPopper' },
}

export const AREA_CODES = {
  1:  { ko: '서울', zh: '首尔', en: 'Seoul' },
  2:  { ko: '인천', zh: '仁川', en: 'Incheon' },
  3:  { ko: '대전', zh: '大田', en: 'Daejeon' },
  4:  { ko: '대구', zh: '大邱', en: 'Daegu' },
  5:  { ko: '광주', zh: '光州', en: 'Gwangju' },
  6:  { ko: '부산', zh: '釜山', en: 'Busan' },
  7:  { ko: '울산', zh: '蔚山', en: 'Ulsan' },
  8:  { ko: '세종', zh: '世宗', en: 'Sejong' },
  31: { ko: '경기', zh: '京畿道', en: 'Gyeonggi' },
  32: { ko: '강원', zh: '江原道', en: 'Gangwon' },
  33: { ko: '충북', zh: '忠清北道', en: 'Chungbuk' },
  34: { ko: '충남', zh: '忠清南道', en: 'Chungnam' },
  35: { ko: '경북', zh: '庆尚北道', en: 'Gyeongbuk' },
  36: { ko: '경남', zh: '庆尚南道', en: 'Gyeongnam' },
  37: { ko: '전북', zh: '全罗北道', en: 'Jeonbuk' },
  38: { ko: '전남', zh: '全罗南道', en: 'Jeonnam' },
  39: { ko: '제주', zh: '济州', en: 'Jeju' },
}

// 주요 시군구 코드 (서울, 부산, 제주)
export const SIGUNGU_CODES = {
  1: { // 서울
    1: { ko: '강남구', zh: '江南区', en: 'Gangnam' },
    2: { ko: '강동구', zh: '江东区', en: 'Gangdong' },
    3: { ko: '강북구', zh: '江北区', en: 'Gangbuk' },
    4: { ko: '강서구', zh: '江西区', en: 'Gangseo' },
    5: { ko: '관악구', zh: '冠岳区', en: 'Gwanak' },
    6: { ko: '광진구', zh: '广津区', en: 'Gwangjin' },
    7: { ko: '구로구', zh: '九老区', en: 'Guro' },
    8: { ko: '금천구', zh: '衿川区', en: 'Geumcheon' },
    9: { ko: '노원구', zh: '芦原区', en: 'Nowon' },
    10: { ko: '도봉구', zh: '道峰区', en: 'Dobong' },
    11: { ko: '동대문구', zh: '东大门区', en: 'Dongdaemun' },
    12: { ko: '동작구', zh: '铜雀区', en: 'Dongjak' },
    13: { ko: '마포구', zh: '麻浦区', en: 'Mapo' },
    14: { ko: '서대문구', zh: '西大门区', en: 'Seodaemun' },
    15: { ko: '서초구', zh: '瑞草区', en: 'Seocho' },
    16: { ko: '성동구', zh: '城东区', en: 'Seongdong' },
    17: { ko: '성북구', zh: '城北区', en: 'Seongbuk' },
    18: { ko: '송파구', zh: '松坡区', en: 'Songpa' },
    19: { ko: '양천구', zh: '阳川区', en: 'Yangcheon' },
    20: { ko: '영등포구', zh: '永登浦区', en: 'Yeongdeungpo' },
    21: { ko: '용산구', zh: '龙山区', en: 'Yongsan' },
    22: { ko: '은평구', zh: '恩平区', en: 'Eunpyeong' },
    23: { ko: '종로구', zh: '钟路区', en: 'Jongno' },
    24: { ko: '중구', zh: '中区', en: 'Jung' },
    25: { ko: '중랑구', zh: '中浪区', en: 'Jungnang' },
  },
  6: { // 부산
    1: { ko: '강서구', zh: '江西区', en: 'Gangseo' },
    2: { ko: '금정구', zh: '金井区', en: 'Geumjeong' },
    3: { ko: '기장군', zh: '机张郡', en: 'Gijang' },
    4: { ko: '남구', zh: '南区', en: 'Nam' },
    5: { ko: '동구', zh: '东区', en: 'Dong' },
    6: { ko: '동래구', zh: '东莱区', en: 'Dongnae' },
    7: { ko: '부산진구', zh: '釜山镇区', en: 'Busanjin' },
    8: { ko: '북구', zh: '北区', en: 'Buk' },
    9: { ko: '사상구', zh: '沙上区', en: 'Sasang' },
    10: { ko: '사하구', zh: '沙下区', en: 'Saha' },
    11: { ko: '서구', zh: '西区', en: 'Seo' },
    12: { ko: '수영구', zh: '水营区', en: 'Suyeong' },
    13: { ko: '연제구', zh: '莲堤区', en: 'Yeonje' },
    14: { ko: '영도구', zh: '影岛区', en: 'Yeongdo' },
    15: { ko: '중구', zh: '中区', en: 'Jung' },
    16: { ko: '해운대구', zh: '海云台区', en: 'Haeundae' },
  },
  39: { // 제주
    1: { ko: '제주시', zh: '济州市', en: 'Jeju City' },
    2: { ko: '서귀포시', zh: '西归浦市', en: 'Seogwipo' },
  },
}

// 인기 지역 (홈 화면 빠른 선택용)
export const POPULAR_AREAS = [1, 6, 39, 31, 32, 4, 5]

export default { CONTENT_TYPES, AREA_CODES, SIGUNGU_CODES, POPULAR_AREAS }
