// 서울 열린데이터광장 실시간 지하철 도착정보 API
const API_KEY = '725171716a6b656c39317953597056';
const BASE_URL = 'http://swopenAPI.seoul.go.kr/api/subway';

// 호선별 색상
export const SUBWAY_LINE_COLORS = {
  1001: '#0052A4', // 1호선
  1002: '#00A84D', // 2호선
  1003: '#EF7C1C', // 3호선
  1004: '#00A5DE', // 4호선
  1005: '#996CAC', // 5호선
  1006: '#CD7C2F', // 6호선
  1007: '#747F00', // 7호선
  1008: '#E6186C', // 8호선
  1009: '#BDB092', // 9호선
};

// 호선 이름 매핑
const LINE_NAMES = {
  1001: { ko: '1호선', zh: '1号线', en: 'Line 1' },
  1002: { ko: '2호선', zh: '2号线', en: 'Line 2' },
  1003: { ko: '3호선', zh: '3号线', en: 'Line 3' },
  1004: { ko: '4호선', zh: '4号线', en: 'Line 4' },
  1005: { ko: '5호선', zh: '5号线', en: 'Line 5' },
  1006: { ko: '6호선', zh: '6号线', en: 'Line 6' },
  1007: { ko: '7호선', zh: '7号线', en: 'Line 7' },
  1008: { ko: '8호선', zh: '8号线', en: 'Line 8' },
  1009: { ko: '9호선', zh: '9号线', en: 'Line 9' },
};

// 인기역 목록
export const POPULAR_STATIONS = [
  { ko: '서울역', zh: '首尔站', en: 'Seoul Station' },
  { ko: '홍대입구', zh: '弘大入口', en: 'Hongdae' },
  { ko: '강남', zh: '江南', en: 'Gangnam' },
  { ko: '명동', zh: '明洞', en: 'Myeongdong' },
  { ko: '동대문', zh: '东大门', en: 'Dongdaemun' },
  { ko: '잠실', zh: '蚕室', en: 'Jamsil' },
  { ko: '신촌', zh: '新村', en: 'Sinchon' },
  { ko: '이태원', zh: '梨泰院', en: 'Itaewon' },
  { ko: '종로3가', zh: '钟路3街', en: 'Jongno 3-ga' },
  { ko: '합정', zh: '合井', en: 'Hapjeong' },
];

// 캐시 (30초)
const cache = new Map();
const CACHE_TTL = 30 * 1000;

export async function fetchSubwayArrival(stationName) {
  const now = Date.now();
  const cached = cache.get(stationName);
  if (cached && now - cached.timestamp < CACHE_TTL) {
    return cached.data;
  }

  try {
    const url = `${BASE_URL}/${API_KEY}/json/realtimeStationArrival/0/10/${encodeURIComponent(stationName)}`;
    const res = await fetch(url);

    if (!res.ok) {
      throw new Error(`HTTP ${res.status}`);
    }

    const json = await res.json();

    if (json.errorMessage) {
      const code = json.errorMessage.code;
      if (code === 'INFO-200') {
        // 해당 역에 데이터 없음
        return { arrivals: [], error: null, empty: true };
      }
      if (code !== 'INFO-000') {
        throw new Error(json.errorMessage.message || 'API Error');
      }
    }

    const rawList = json.realtimeArrivalList || [];

    const arrivals = rawList.map((item) => {
      const subwayId = Number(item.subwayId);
      return {
        subwayId,
        lineColor: SUBWAY_LINE_COLORS[subwayId] || '#888888',
        lineName: LINE_NAMES[subwayId] || { ko: item.trainLineNm, zh: item.trainLineNm, en: item.trainLineNm },
        direction: item.updnLine, // 상행/하행
        trainLineNm: item.trainLineNm,
        arrivalMessage: item.arvlMsg2, // "3분 후 도착" 등
        arrivalStation: item.arvlMsg3, // 현재 위치 역명
        arrivalSeconds: Number(item.barvlDt) || 0,
        destination: item.bstatnNm || '', // 종착역
      };
    });

    // 호선별, 방면별 정렬
    arrivals.sort((a, b) => {
      if (a.subwayId !== b.subwayId) return a.subwayId - b.subwayId;
      if (a.direction !== b.direction) return a.direction < b.direction ? -1 : 1;
      return a.arrivalSeconds - b.arrivalSeconds;
    });

    const result = { arrivals, error: null, empty: false };
    cache.set(stationName, { data: result, timestamp: now });
    return result;
  } catch (err) {
    console.error('[SubwayAPI] Error:', err);
    return {
      arrivals: [],
      error: err.message || 'Network error',
      empty: false,
    };
  }
}
