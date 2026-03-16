// ============================================================
// Flight Events - 상태 변경 감지 및 이벤트 기록
// ============================================================

import type {
  FlightArrivalRecord,
  FlightStatusEventRecord,
  FlightEventType,
  FlightStatus,
} from './types';

export interface DbAdapter {
  /** flight_arrivals UPSERT → 반환: { record, previousStatus } */
  upsertArrival(arrival: FlightArrivalRecord): Promise<{
    record: FlightArrivalRecord & { id: number };
    previousStatus: FlightStatus | null;
    isNew: boolean;
  }>;
  /** flight_status_events INSERT */
  insertEvent(event: Omit<FlightStatusEventRecord, 'id' | 'created_at'>): Promise<void>;
}

/** 상태 변경에서 이벤트 타입 결정 */
function determineEventType(
  previousStatus: FlightStatus | null,
  newStatus: FlightStatus,
  arrival: FlightArrivalRecord,
): FlightEventType | null {
  // 새 편 등록
  if (previousStatus === null) return 'SCHEDULED';

  // 상태가 같으면 이벤트 없음
  if (previousStatus === newStatus) {
    // 단, 입국장 게이트가 새로 배정된 경우
    if (arrival.immigration_gate) return 'GATE_ASSIGNED';
    return null;
  }

  // 상태 변경
  switch (newStatus) {
    case 'LANDED':
    case 'ARRIVED':
      return 'LANDED';
    case 'DELAYED':
      return 'DELAYED';
    case 'CANCELLED':
      return 'CANCELLED';
    default:
      return 'STATUS_CHANGED';
  }
}

/** 이벤트 메타데이터 구성 */
function buildEventMetadata(arrival: FlightArrivalRecord): Record<string, unknown> {
  const meta: Record<string, unknown> = {
    origin_airport: arrival.origin_airport,
    origin_city: arrival.origin_city,
    destination_airport: arrival.destination_airport,
    flight_number: arrival.flight_number,
  };

  if (arrival.foreign_passenger_count != null) {
    meta.foreign_passenger_count = arrival.foreign_passenger_count;
  }
  if (arrival.domestic_passenger_count != null) {
    meta.domestic_passenger_count = arrival.domestic_passenger_count;
  }
  if (arrival.congestion_level) {
    meta.congestion_level = arrival.congestion_level;
  }
  if (arrival.immigration_gate) {
    meta.immigration_gate = arrival.immigration_gate;
  }
  if (arrival.terminal) {
    meta.terminal = arrival.terminal;
  }

  return meta;
}

/**
 * 항공편 데이터를 DB에 저장하고 상태 변경 이벤트를 감지/기록
 * @returns 발생한 이벤트 목록
 */
export async function processFlightArrivals(
  db: DbAdapter,
  arrivals: FlightArrivalRecord[],
): Promise<FlightStatusEventRecord[]> {
  const events: FlightStatusEventRecord[] = [];

  for (const arrival of arrivals) {
    try {
      const { record, previousStatus, isNew } = await db.upsertArrival(arrival);

      const eventType = determineEventType(
        isNew ? null : previousStatus,
        arrival.status,
        arrival,
      );

      if (eventType) {
        const event: Omit<FlightStatusEventRecord, 'id' | 'created_at'> = {
          flight_arrival_id: record.id,
          previous_status: isNew ? null : previousStatus,
          new_status: arrival.status,
          event_type: eventType,
          metadata: buildEventMetadata(arrival),
        };

        await db.insertEvent(event);
        events.push(event as FlightStatusEventRecord);
      }
    } catch (err) {
      console.error(`[flight-events] Error processing ${arrival.flight_number}:`, err);
    }
  }

  return events;
}
