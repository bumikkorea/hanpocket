// ============================================================
// 김포공항 API 클라이언트 (한국공항공사)
// - 항공기 운항정보 조회
// - 실시간 항공운항 현황 상세 조회
// ============================================================

import type {
  GimpoFlightItem,
  GimpoApiResponse,
  FlightArrivalRecord,
  FlightStatus,
} from './types';

// 한국공항공사 API는 HTTP (HTTPS 아님)
const GIMPO_BASE_URL = 'http://openapi.airport.co.kr/service/rest/FlightStatusList';
const FLIGHT_STATUS_PATH = '/getFlightStatusList';

/** 김포공항 시간 포맷 (HHmm) → 오늘 날짜 기준 Date */
function parseGimpoTime(timeStr: string | null | undefined, dateStr: string): Date | null {
  if (!timeStr || timeStr.trim() === '') return null;
  const t = timeStr.trim();
  if (t.length < 4) return null;

  const h = t.slice(0, 2);
  const m = t.slice(2, 4);
  const y = dateStr.slice(0, 4);
  const mo = dateStr.slice(4, 6);
  const d = dateStr.slice(6, 8);

  return new Date(`${y}-${mo}-${d}T${h}:${m}:00+09:00`);
}

/** 김포공항 운항상태 → FlightStatus */
function parseGimpoStatus(status: string | null | undefined): FlightStatus {
  if (!status) return 'SCHEDULED';
  const s = status.trim();
  if (s.includes('착륙') || s.includes('도착') || s === 'ARRIVED') return 'LANDED';
  if (s.includes('지연') || s === 'DELAYED') return 'DELAYED';
  if (s.includes('결항') || s === 'CANCELLED') return 'CANCELLED';
  if (s.includes('회항') || s === 'DIVERTED') return 'DIVERTED';
  if (s.includes('출발') || s === 'DEPARTED') return 'APPROACHING';
  return 'SCHEDULED';
}

/** API 응답에서 아이템 배열 추출 */
function extractGimpoItems(body: GimpoApiResponse['response']['body']): GimpoFlightItem[] {
  if (!body || !body.items || body.items === '') return [];
  const items = body.items;
  if ('item' in items) {
    if (Array.isArray(items.item)) return items.item;
    if (items.item) return [items.item];
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
  // 1차: 인코딩된 키
  const url1 = buildUrl(url, { ...params, serviceKey: apiKeyEncoded });
  const res1 = await fetch(url1);
  if (res1.ok) {
    const data = await res1.json();
    if (data?.response?.header?.resultCode === '00') return data;
  }

  // 2차: 디코딩된 키
  const url2 = buildUrl(url, { ...params, serviceKey: apiKeyDecoded });
  const res2 = await fetch(url2);
  if (!res2.ok) throw new Error(`Gimpo API error: ${res2.status} ${res2.statusText}`);
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

export interface GimpoApiConfig {
  apiKeyEncoded: string;
  apiKeyDecoded: string;
}

/**
 * 김포공항 입항 운항정보 조회
 * @param deptCityCode 출발도시 IATA 코드 (PEK, SHA 등)
 * @param date 조회일 (YYYYMMDD, 미지정시 오늘)
 */
export async function fetchGimpoArrivals(
  config: GimpoApiConfig,
  deptCityCode: string,
  date?: string,
): Promise<FlightArrivalRecord[]> {
  const today = date || formatDate(new Date());

  const params: Record<string, string> = {
    _type: 'json',              // 김포 API는 _type (언더스코어)
    numOfRows: '100',
    pageNo: '1',
    schDate: today,
    schDeptCityCode: deptCityCode,
    schArrvCityCode: 'GMP',
    schIOType: 'I',             // 입항
  };

  const data = await fetchWithKeyFallback(
    `${GIMPO_BASE_URL}${FLIGHT_STATUS_PATH}`,
    params,
    config.apiKeyEncoded,
    config.apiKeyDecoded,
  ) as GimpoApiResponse;

  const items = extractGimpoItems(data.response.body);

  return items
    .filter(item => item.io === 'I')  // 입항만
    .map((item): FlightArrivalRecord => ({
      flight_number: item.flightNum?.trim() || 'UNKNOWN',
      airline_code: item.airlineCode?.trim() || null,
      airline_name: item.airline?.trim() || null,
      origin_airport: item.depCityCode?.trim() || deptCityCode,
      origin_city: item.depCity?.trim() || null,
      destination_airport: 'GMP',
      terminal: 'INT',  // 김포 국제선 터미널
      scheduled_at: parseGimpoTime(item.schedTime, today),
      estimated_at: parseGimpoTime(item.changeTime, today),
      actual_at: null,  // 김포 API는 실제 도착 시간 별도 필드 없음 - 상태로 판단
      gate: item.gateNum?.trim() || null,
      immigration_gate: null,
      status: parseGimpoStatus(item.status),
      foreign_passenger_count: null,  // 김포 API에는 없음
      domestic_passenger_count: null,
      congestion_level: null,
      raw_data: item as unknown as Record<string, unknown>,
      source: 'GIMPO',
    }));
}

/** 날짜를 YYYYMMDD 형식 문자열로 */
function formatDate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}${m}${d}`;
}
