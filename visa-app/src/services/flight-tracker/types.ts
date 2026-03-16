// ============================================================
// Flight Tracker - Type Definitions
// ============================================================

/** 공항 티어 분류 (API 호출 우선순위 결정용) */
export type AirportTier = 'tier1' | 'tier2' | 'hongkong_macau';

/** 중국 공항 정보 */
export interface ChinaAirport {
  code: string;          // IATA 3자리 코드
  nameKo: string;        // 한국어 공항명
  nameZh: string;        // 중국어 공항명
  nameEn: string;        // 영어 공항명
  tier: AirportTier;
  hasGimpoRoute: boolean; // 김포 노선 여부
}

/** 도착 공항 */
export type DestinationAirport = 'ICN' | 'GMP';

/** 데이터 소스 */
export type FlightSource = 'INCHEON' | 'GIMPO';

/** 운항 상태 */
export type FlightStatus =
  | 'SCHEDULED'    // 예정
  | 'DELAYED'      // 지연
  | 'APPROACHING'  // 접근중
  | 'LANDED'       // 착륙
  | 'ARRIVED'      // 도착 (입국장)
  | 'CANCELLED'    // 결항
  | 'DIVERTED'     // 회항
  | 'UNKNOWN';

/** 이벤트 타입 */
export type FlightEventType =
  | 'SCHEDULED'       // 새 편 등록
  | 'LANDED'          // 착륙 확인
  | 'DELAYED'         // 지연 감지
  | 'CANCELLED'       // 결항
  | 'GATE_ASSIGNED'   // 입국장 게이트 배정
  | 'STATUS_CHANGED'; // 기타 상태 변경

/** 혼잡도 */
export type CongestionLevel = 'SMOOTH' | 'NORMAL' | 'BUSY' | 'VERY_BUSY' | 'UNKNOWN';

// ============================================================
// DB 레코드 타입
// ============================================================

export interface FlightArrivalRecord {
  id?: number;
  flight_number: string;
  airline_code: string | null;
  airline_name: string | null;
  origin_airport: string;
  origin_city: string | null;
  destination_airport: DestinationAirport;
  terminal: string | null;
  scheduled_at: Date | null;
  estimated_at: Date | null;
  actual_at: Date | null;
  gate: string | null;
  immigration_gate: string | null;
  status: FlightStatus;
  foreign_passenger_count: number | null;
  domestic_passenger_count: number | null;
  congestion_level: CongestionLevel | null;
  raw_data: Record<string, unknown>;
  source: FlightSource;
  polled_at?: Date;
  created_at?: Date;
  updated_at?: Date;
}

export interface FlightStatusEventRecord {
  id?: number;
  flight_arrival_id: number;
  previous_status: FlightStatus | null;
  new_status: FlightStatus;
  event_type: FlightEventType;
  metadata: Record<string, unknown> | null;
  created_at?: Date;
}

// ============================================================
// API 응답 타입 - 인천공항
// ============================================================

/** 인천공항 입국장현황 API 응답 아이템 */
export interface IncheonArrivalItem {
  flightId: string;           // 편명
  airFln: string;             // 항공사
  city: string;               // 출발도시
  airport: string;            // 출발공항 IATA
  estimatedDateTime: string;  // 도착 예정 시간
  actualDateTime: string;     // 도착 실제 시간
  gateNbr: string;            // 도착 게이트
  entGateNbr: string;         // 입국장 게이트
  terno: string;              // 터미널 (T1, T2)
  waitPCnt1: string;          // 내국인 대기인원
  waitPCnt2: string;          // 외국인 대기인원
  congestion: string;         // 혼잡도
  [key: string]: unknown;
}

/** 인천공항 여객편 주간 운항현황 API 응답 아이템 */
export interface IncheonWeeklyItem {
  airline: string;
  flightId: string;
  scheduleDateTime: string;
  estimatedDateTime: string;
  airport: string;
  city: string;
  gateNbr: string;
  terminalId: string;
  remark: string;             // 운항상태
  codeshare: string;
  [key: string]: unknown;
}

/** 인천공항 API 공통 응답 래퍼 */
export interface IncheonApiResponse<T> {
  response: {
    header: {
      resultCode: string;
      resultMsg: string;
    };
    body: {
      items: T[] | { item: T | T[] } | null;
      numOfRows: number;
      pageNo: number;
      totalCount: number;
    };
  };
}

// ============================================================
// API 응답 타입 - 김포공항 (한국공항공사)
// ============================================================

/** 김포공항 운항정보 API 응답 아이템 */
export interface GimpoFlightItem {
  airline: string;          // 항공사명
  airlineCode: string;      // 항공사 코드
  flightNum: string;        // 편명
  schedTime: string;        // 예정시각 (HHmm)
  changeTime: string;       // 변경시각 (HHmm)
  depCity: string;          // 출발도시
  depCityCode: string;      // 출발도시 코드
  arrCity: string;          // 도착도시
  arrCityCode: string;      // 도착도시 코드
  gateNum: string;          // 탑승구
  io: string;               // 입출항 (I/O)
  domesticOrInternational: string; // 국내/국외
  status: string;           // 운항상태
  [key: string]: unknown;
}

/** 김포공항 API 공통 응답 래퍼 */
export interface GimpoApiResponse {
  response: {
    header: {
      resultCode: string;
      resultMsg: string;
    };
    body: {
      items: { item: GimpoFlightItem | GimpoFlightItem[] } | '' | null;
      numOfRows: number;
      pageNo: number;
      totalCount: number;
    };
  };
}

// ============================================================
// 폴링 설정
// ============================================================

export interface PollerConfig {
  /** 인천공항 입국장현황 폴링 간격 (ms) */
  incheonRealtimeIntervalMs: number;
  /** 인천공항 주간 운항현황 폴링 간격 (ms) */
  incheonWeeklyIntervalMs: number;
  /** 김포공항 실시간 폴링 간격 (ms) */
  gimpoIntervalMs: number;
  /** API 호출 간 딜레이 (rate limit 보호, ms) */
  apiCallDelayMs: number;
  /** API 키 (인코딩) */
  apiKeyEncoded: string;
  /** API 키 (디코딩) */
  apiKeyDecoded: string;
  /** DB 연결 문자열 */
  databaseUrl: string;
}

export const DEFAULT_POLLER_CONFIG: Omit<PollerConfig, 'apiKeyEncoded' | 'apiKeyDecoded' | 'databaseUrl'> = {
  incheonRealtimeIntervalMs: 5 * 60 * 1000,   // 5분
  incheonWeeklyIntervalMs: 60 * 60 * 1000,     // 1시간
  gimpoIntervalMs: 10 * 60 * 1000,             // 10분
  apiCallDelayMs: 500,                          // 0.5초
};
