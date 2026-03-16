// ============================================================
// 인천공항 API 클라이언트
// - 입국장현황 정보 서비스 (실시간)
// - 여객편 주간 운항 현황 (스케줄)
// ============================================================

import type {
  IncheonArrivalItem,
  IncheonWeeklyItem,
  IncheonApiResponse,
  FlightArrivalRecord,
  FlightStatus,
  CongestionLevel,
} from './types';

const INCHEON_BASE_URL = 'http://apis.data.go.kr/B551177';

const ARRIVALS_CONGESTION_PATH = '/StatusOfArrivals/getArrivalsCongestion';
const PASSENGER_ARRIVALS_PATH = '/StatusOfPassenger/getPassengerArrivals';

/** 인천공항 API 날짜/시간 포맷 → Date 변환 */
function parseIncheonDateTime(dateStr: string | null | undefined): Date | null {
  if (!dateStr || dateStr.trim() === '') return null;
  const cleaned = dateStr.trim();

  // YYYYMMDD HHmm 또는 YYYYMMDDHHmm
  if (/^\d{12}$/.test(cleaned)) {
    const y = cleaned.slice(0, 4);
    const m = cleaned.slice(4, 6);
    const d = cleaned.slice(6, 8);
    const h = cleaned.slice(8, 10);
    const min = cleaned.slice(10, 12);
    return new Date(`${y}-${m}-${d}T${h}:${min}:00+09:00`);
  }

  if (/^\d{8}\s+\d{4}$/.test(cleaned)) {
    const parts = cleaned.split(/\s+/);
    const date = parts[0];
    const time = parts[1];
    const y = date.slice(0, 4);
    const m = date.slice(4, 6);
    const d = date.slice(6, 8);
    const h = time.slice(0, 2);
    const min = time.slice(2, 4);
    return new Date(`${y}-${m}-${d}T${h}:${min}:00+09:00`);
  }

  // ISO 형식 시도
  const parsed = new Date(cleaned);
  return isNaN(parsed.getTime()) ? null : parsed;
}

/** 인천공항 혼잡도 문자열 → CongestionLevel */
function parseCongestion(raw: string | null | undefined): CongestionLevel {
  if (!raw) return 'UNKNOWN';
  const lower = raw.trim().toLowerCase();
  if (lower === '원활' || lower === 'smooth') return 'SMOOTH';
  if (lower === '보통' || lower === 'normal') return 'NORMAL';
  if (lower === '혼잡' || lower === 'busy') return 'BUSY';
  if (lower === '매우혼잡' || lower === 'very busy') return 'VERY_BUSY';
  return 'UNKNOWN';
}

/** 인천공항 운항상태 → FlightStatus */
function parseIncheonStatus(remark: string | null | undefined, actualAt: string | null | undefined): FlightStatus {
  if (!remark && !actualAt) return 'SCHEDULED';
  if (actualAt && actualAt.trim() !== '') return 'LANDED';

  const r = (remark || '').trim();
  if (r.includes('착륙') || r.includes('도착') || r === 'ARRIVED') return 'LANDED';
  if (r.includes('지연') || r === 'DELAYED') return 'DELAYED';
  if (r.includes('결항') || r === 'CANCELLED') return 'CANCELLED';
  if (r.includes('회항') || r === 'DIVERTED') return 'DIVERTED';
  if (r.includes('접근') || r === 'APPROACHING') return 'APPROACHING';
  return 'SCHEDULED';
}

/** API 응답에서 아이템 배열 추출 (다양한 응답 형태 대응) */
function extractItems<T>(body: IncheonApiResponse<T>['response']['body']): T[] {
  if (!body || !body.items) return [];

  // items가 직접 배열인 경우
  if (Array.isArray(body.items)) return body.items;

  // items.item이 배열인 경우
  if ('item' in body.items) {
    const item = body.items.item;
    if (Array.isArray(item)) return item;
    if (item) return [item];
  }

  return [];
}

/** HTTP 요청 (인코딩/디코딩 키 양쪽 시도) */
async function fetchWithKeyFallback(
  url: string,
  params: Record<string, string>,
  apiKeyEncoded: string,
  apiKeyDecoded: string,
): Promise<unknown> {
  // 1차: 인코딩된 키 시도
  const url1 = buildUrl(url, { ...params, serviceKey: apiKeyEncoded });
  const res1 = await fetch(url1);
  if (res1.ok) {
    const data = await res1.json();
    if (data?.response?.header?.resultCode === '00') return data;
  }

  // 2차: 디코딩된 키 시도
  const url2 = buildUrl(url, { ...params, serviceKey: apiKeyDecoded });
  const res2 = await fetch(url2);
  if (!res2.ok) throw new Error(`Incheon API error: ${res2.status} ${res2.statusText}`);
  return res2.json();
}

function buildUrl(base: string, params: Record<string, string>): string {
  const qs = Object.entries(params)
    .map(([k, v]) => `${encodeURIComponent(k)}=${k === 'serviceKey' ? v : encodeURIComponent(v)}`)
    .join('&');
  return `${base}?${qs}`;
}

// ============================================================
// 공개 API
// ============================================================

export interface IncheonApiConfig {
  apiKeyEncoded: string;
  apiKeyDecoded: string;
}

/**
 * 인천공항 입국장현황 조회 (실시간, H-2~H+2)
 * @param airportCode 출발공항 IATA 코드 (예: PVG)
 * @param terminal T1 | T2 (미지정시 T1)
 */
export async function fetchIncheonArrivals(
  config: IncheonApiConfig,
  airportCode: string,
  terminal?: 'T1' | 'T2',
): Promise<FlightArrivalRecord[]> {
  const params: Record<string, string> = {
    type: 'json',
    numOfRows: '100',
    pageNo: '1',
    from_airport: airportCode,
  };
  if (terminal) params.terno = terminal;

  const data = await fetchWithKeyFallback(
    `${INCHEON_BASE_URL}${ARRIVALS_CONGESTION_PATH}`,
    params,
    config.apiKeyEncoded,
    config.apiKeyDecoded,
  ) as IncheonApiResponse<IncheonArrivalItem>;

  const items = extractItems(data.response.body);

  return items.map((item): FlightArrivalRecord => ({
    flight_number: item.flightId?.trim() || 'UNKNOWN',
    airline_code: null,
    airline_name: item.airFln?.trim() || null,
    origin_airport: item.airport?.trim() || airportCode,
    origin_city: item.city?.trim() || null,
    destination_airport: 'ICN',
    terminal: item.terno?.trim() || terminal || null,
    scheduled_at: parseIncheonDateTime(item.estimatedDateTime),
    estimated_at: parseIncheonDateTime(item.estimatedDateTime),
    actual_at: parseIncheonDateTime(item.actualDateTime),
    gate: item.gateNbr?.trim() || null,
    immigration_gate: item.entGateNbr?.trim() || null,
    status: parseIncheonStatus(null, item.actualDateTime),
    foreign_passenger_count: item.waitPCnt2 ? parseInt(item.waitPCnt2, 10) || null : null,
    domestic_passenger_count: item.waitPCnt1 ? parseInt(item.waitPCnt1, 10) || null : null,
    congestion_level: parseCongestion(item.congestion),
    raw_data: item as unknown as Record<string, unknown>,
    source: 'INCHEON',
  }));
}

/**
 * 인천공항 여객편 주간 운항현황 조회 (D+0~D+6)
 * @param airportCode 출발공항 IATA 코드
 */
export async function fetchIncheonWeeklyArrivals(
  config: IncheonApiConfig,
  airportCode: string,
): Promise<FlightArrivalRecord[]> {
  const params: Record<string, string> = {
    type: 'json',
    numOfRows: '200',
    pageNo: '1',
    from_airport: airportCode,
  };

  const data = await fetchWithKeyFallback(
    `${INCHEON_BASE_URL}${PASSENGER_ARRIVALS_PATH}`,
    params,
    config.apiKeyEncoded,
    config.apiKeyDecoded,
  ) as IncheonApiResponse<IncheonWeeklyItem>;

  const items = extractItems(data.response.body);

  return items.map((item): FlightArrivalRecord => ({
    flight_number: item.flightId?.trim() || 'UNKNOWN',
    airline_code: null,
    airline_name: item.airline?.trim() || null,
    origin_airport: item.airport?.trim() || airportCode,
    origin_city: item.city?.trim() || null,
    destination_airport: 'ICN',
    terminal: item.terminalId?.trim() || null,
    scheduled_at: parseIncheonDateTime(item.scheduleDateTime),
    estimated_at: parseIncheonDateTime(item.estimatedDateTime),
    actual_at: null,
    gate: item.gateNbr?.trim() || null,
    immigration_gate: null,
    status: parseIncheonStatus(item.remark, null),
    foreign_passenger_count: null,
    domestic_passenger_count: null,
    congestion_level: null,
    raw_data: item as unknown as Record<string, unknown>,
    source: 'INCHEON',
  }));
}
