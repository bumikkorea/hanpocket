// ============================================================
// DB Adapter - PostgreSQL (pg 라이브러리 사용)
// ============================================================

import pg from 'pg';
import type {
  FlightArrivalRecord,
  FlightStatus,
  FlightStatusEventRecord,
} from './types';
import type { DbAdapter } from './flight-events';

const { Pool } = pg;

export function createDbAdapter(databaseUrl: string): DbAdapter & { pool: pg.Pool; close: () => Promise<void> } {
  const pool = new Pool({ connectionString: databaseUrl });

  return {
    pool,

    async close() {
      await pool.end();
    },

    async upsertArrival(arrival: FlightArrivalRecord) {
      // 먼저 기존 레코드 조회
      const existing = await pool.query<FlightArrivalRecord & { id: number }>(
        `SELECT id, status FROM flight_arrivals
         WHERE flight_number = $1 AND scheduled_at = $2 AND destination_airport = $3`,
        [arrival.flight_number, arrival.scheduled_at, arrival.destination_airport],
      );

      const previousStatus: FlightStatus | null = existing.rows[0]?.status ?? null;
      const isNew = existing.rows.length === 0;

      // UPSERT
      const result = await pool.query<FlightArrivalRecord & { id: number }>(
        `INSERT INTO flight_arrivals (
          flight_number, airline_code, airline_name,
          origin_airport, origin_city, destination_airport,
          terminal, scheduled_at, estimated_at, actual_at,
          gate, immigration_gate, status,
          foreign_passenger_count, domestic_passenger_count,
          congestion_level, raw_data, source, polled_at
        ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,NOW())
        ON CONFLICT (flight_number, scheduled_at, destination_airport)
        DO UPDATE SET
          airline_code = COALESCE(EXCLUDED.airline_code, flight_arrivals.airline_code),
          airline_name = COALESCE(EXCLUDED.airline_name, flight_arrivals.airline_name),
          origin_city = COALESCE(EXCLUDED.origin_city, flight_arrivals.origin_city),
          terminal = COALESCE(EXCLUDED.terminal, flight_arrivals.terminal),
          estimated_at = COALESCE(EXCLUDED.estimated_at, flight_arrivals.estimated_at),
          actual_at = COALESCE(EXCLUDED.actual_at, flight_arrivals.actual_at),
          gate = COALESCE(EXCLUDED.gate, flight_arrivals.gate),
          immigration_gate = COALESCE(EXCLUDED.immigration_gate, flight_arrivals.immigration_gate),
          status = EXCLUDED.status,
          foreign_passenger_count = COALESCE(EXCLUDED.foreign_passenger_count, flight_arrivals.foreign_passenger_count),
          domestic_passenger_count = COALESCE(EXCLUDED.domestic_passenger_count, flight_arrivals.domestic_passenger_count),
          congestion_level = COALESCE(EXCLUDED.congestion_level, flight_arrivals.congestion_level),
          raw_data = EXCLUDED.raw_data,
          polled_at = NOW()
        RETURNING *`,
        [
          arrival.flight_number, arrival.airline_code, arrival.airline_name,
          arrival.origin_airport, arrival.origin_city, arrival.destination_airport,
          arrival.terminal, arrival.scheduled_at, arrival.estimated_at, arrival.actual_at,
          arrival.gate, arrival.immigration_gate, arrival.status,
          arrival.foreign_passenger_count, arrival.domestic_passenger_count,
          arrival.congestion_level, JSON.stringify(arrival.raw_data), arrival.source,
        ],
      );

      return {
        record: result.rows[0],
        previousStatus,
        isNew,
      };
    },

    async insertEvent(event: Omit<FlightStatusEventRecord, 'id' | 'created_at'>) {
      await pool.query(
        `INSERT INTO flight_status_events
         (flight_arrival_id, previous_status, new_status, event_type, metadata)
         VALUES ($1, $2, $3, $4, $5)`,
        [
          event.flight_arrival_id,
          event.previous_status,
          event.new_status,
          event.event_type,
          event.metadata ? JSON.stringify(event.metadata) : null,
        ],
      );
    },
  };
}

// ============================================================
// CLI용 조회 헬퍼
// ============================================================

export async function queryUpcomingFlights(pool: pg.Pool, hours = 4): Promise<(FlightArrivalRecord & { id: number })[]> {
  const result = await pool.query<FlightArrivalRecord & { id: number }>(
    `SELECT * FROM flight_arrivals
     WHERE scheduled_at BETWEEN NOW() - interval '${hours} hours' AND NOW() + interval '${hours} hours'
     ORDER BY scheduled_at ASC`,
  );
  return result.rows;
}

export async function queryRecentEvents(pool: pg.Pool, intervalStr: string): Promise<(FlightStatusEventRecord & { flight_number?: string })[]> {
  const result = await pool.query(
    `SELECT e.*, f.flight_number, f.origin_airport, f.origin_city
     FROM flight_status_events e
     JOIN flight_arrivals f ON f.id = e.flight_arrival_id
     WHERE e.created_at >= NOW() - $1::interval
     ORDER BY e.created_at DESC`,
    [intervalStr],
  );
  return result.rows;
}
