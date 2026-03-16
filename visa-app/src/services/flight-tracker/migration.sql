-- ============================================================
-- Flight Tracker - Database Migration
-- NEAR 항공편 도착 추적 모듈
-- ============================================================

-- 항공편 도착 정보
CREATE TABLE IF NOT EXISTS flight_arrivals (
    id SERIAL PRIMARY KEY,
    flight_number VARCHAR(20) NOT NULL,
    airline_code VARCHAR(10),
    airline_name VARCHAR(100),
    origin_airport VARCHAR(10) NOT NULL,
    origin_city VARCHAR(100),
    destination_airport VARCHAR(10) NOT NULL,
    terminal VARCHAR(10),
    scheduled_at TIMESTAMPTZ,
    estimated_at TIMESTAMPTZ,
    actual_at TIMESTAMPTZ,
    gate VARCHAR(20),
    immigration_gate VARCHAR(20),
    status VARCHAR(30) NOT NULL DEFAULT 'SCHEDULED',
    foreign_passenger_count INTEGER,
    domestic_passenger_count INTEGER,
    congestion_level VARCHAR(20),
    raw_data JSONB,
    source VARCHAR(20) NOT NULL,
    polled_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    UNIQUE(flight_number, scheduled_at, destination_airport)
);

CREATE INDEX IF NOT EXISTS idx_flight_arrivals_origin ON flight_arrivals(origin_airport);
CREATE INDEX IF NOT EXISTS idx_flight_arrivals_status ON flight_arrivals(status);
CREATE INDEX IF NOT EXISTS idx_flight_arrivals_scheduled ON flight_arrivals(scheduled_at);
CREATE INDEX IF NOT EXISTS idx_flight_arrivals_destination ON flight_arrivals(destination_airport);

-- 상태 변경 이력 (향후 푸시 알림 트리거용)
CREATE TABLE IF NOT EXISTS flight_status_events (
    id SERIAL PRIMARY KEY,
    flight_arrival_id INTEGER REFERENCES flight_arrivals(id),
    previous_status VARCHAR(30),
    new_status VARCHAR(30) NOT NULL,
    event_type VARCHAR(50) NOT NULL,
    metadata JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_flight_events_type ON flight_status_events(event_type);
CREATE INDEX IF NOT EXISTS idx_flight_events_created ON flight_status_events(created_at);
CREATE INDEX IF NOT EXISTS idx_flight_events_arrival_id ON flight_status_events(flight_arrival_id);

-- updated_at 자동 갱신 트리거
CREATE OR REPLACE FUNCTION update_flight_arrivals_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_flight_arrivals_updated_at ON flight_arrivals;
CREATE TRIGGER trg_flight_arrivals_updated_at
    BEFORE UPDATE ON flight_arrivals
    FOR EACH ROW
    EXECUTE FUNCTION update_flight_arrivals_updated_at();
