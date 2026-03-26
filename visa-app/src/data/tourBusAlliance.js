/**
 * 서울시티투어버스 제휴할인 매장 데이터
 * // 주 1회 https://www.seoulcitybus.com/alliance/alliance_list.php 확인하여 변동사항 업데이트
 * // 마지막 업데이트: 2026-03-26
 */

export const TOURBUS_ALLIANCE = [
  {
    id: 'alliance-1',
    name: '에잇세컨즈',
    name_cn: '8seconds',
    location: { ko: '명동', zh: '明洞', en: 'Myeongdong' },
    discount: '5%',
    note: { ko: '외국인 전용', zh: '仅限外国人', en: 'Foreigners only' },
    lat: 37.5636,
    lng: 126.9827,
    category: 'shopping',
  },
  {
    id: 'alliance-2',
    name: '방태막국수 남산서울타워점',
    name_cn: '方台荞麦面 南山首尔塔店',
    location: { ko: 'N서울타워', zh: 'N首尔塔', en: 'N Seoul Tower' },
    discount: '10%',
    note: null,
    lat: 37.5512,
    lng: 126.9882,
    category: 'food',
  },
  {
    id: 'alliance-3',
    name: '강가(무교점)',
    name_cn: '江边(武桥店)',
    location: { ko: '광화문역', zh: '光化门站', en: 'Gwanghwamun Stn' },
    discount: '15%',
    note: null,
    lat: 37.5690,
    lng: 126.9784,
    category: 'food',
  },
  {
    id: 'alliance-4',
    name: '광화문 한상',
    name_cn: '光化门韩餐',
    location: { ko: '광화문역', zh: '光化门站', en: 'Gwanghwamun Stn' },
    discount: '10%',
    note: null,
    lat: 37.5717,
    lng: 126.9769,
    category: 'food',
  },
  {
    id: 'alliance-5',
    name: '관호 광화문',
    name_cn: '冠湖 光化门',
    location: { ko: '광화문역', zh: '光化门站', en: 'Gwanghwamun Stn' },
    discount: '10%',
    note: null,
    lat: 37.5710,
    lng: 126.9775,
    category: 'food',
  },
  {
    id: 'alliance-6',
    name: '하우스 커피 앤 디저트',
    name_cn: 'House Coffee & Dessert',
    location: { ko: '신라호텔·장충단공원', zh: '新罗酒店·奖忠坛公园', en: 'Shilla Hotel' },
    discount: '10%',
    note: null,
    lat: 37.5571,
    lng: 127.0042,
    category: 'cafe',
  },
]
