#!/usr/bin/env node
// ============================================================
// Flight Tracker CLI
// Usage:
//   npx tsx src/services/flight-tracker/cli.ts status
//   npx tsx src/services/flight-tracker/cli.ts poll
//   npx tsx src/services/flight-tracker/cli.ts events --last 1h
// ============================================================

import 'dotenv/config';
import { createDbAdapter, queryUpcomingFlights, queryRecentEvents } from './db';
import { pollAll } from './flight-poller';
import { getAirportByCode, CHINA_AIRPORTS } from './china-airports';
import type { FlightArrivalRecord } from './types';

const DB_URL = process.env.DATABASE_URL;
const API_KEY_ENC = process.env.DATA_GO_KR_API_KEY_ENCODED || '';
const API_KEY_DEC = process.env.DATA_GO_KR_API_KEY_DECODED || '';

function requireDb(): string {
  if (!DB_URL) {
    console.error('❌ DATABASE_URL 환경변수가 설정되지 않았습니다.');
    process.exit(1);
  }
  return DB_URL;
}

function requireApiKeys() {
  if (!API_KEY_ENC && !API_KEY_DEC) {
    console.error('❌ DATA_GO_KR_API_KEY_ENCODED 또는 DATA_GO_KR_API_KEY_DECODED가 설정되지 않았습니다.');
    process.exit(1);
  }
}

/** 시간 문자열 (1h, 30m, 2d) → interval */
function parseTimeArg(arg: string): string {
  const match = arg.match(/^(\d+)(m|h|d)$/);
  if (!match) return '1 hour';
  const [, num, unit] = match;
  const unitMap: Record<string, string> = { m: 'minutes', h: 'hours', d: 'days' };
  return `${num} ${unitMap[unit]}`;
}

/** 비행편 테이블 출력 */
function printFlightsTable(flights: (FlightArrivalRecord & { id: number })[]) {
  if (flights.length === 0) {
    console.log('  (도착 예정편 없음)');
    return;
  }

  console.log(
    '  ' +
    'Flight'.padEnd(10) +
    'From'.padEnd(6) +
    'City'.padEnd(16) +
    'To'.padEnd(5) +
    'Term'.padEnd(6) +
    'Scheduled'.padEnd(18) +
    'Status'.padEnd(12) +
    'Gate'.padEnd(8) +
    'Frgn'.padEnd(6) +
    'Cong'
  );
  console.log('  ' + '-'.repeat(95));

  for (const f of flights) {
    const airport = getAirportByCode(f.origin_airport);
    const city = f.origin_city || airport?.nameKo || f.origin_airport;
    const sched = f.scheduled_at ? new Date(f.scheduled_at).toLocaleString('ko-KR', { timeZone: 'Asia/Seoul', hour: '2-digit', minute: '2-digit', month: '2-digit', day: '2-digit' }) : '-';

    console.log(
      '  ' +
      (f.flight_number || '-').padEnd(10) +
      (f.origin_airport || '-').padEnd(6) +
      city.slice(0, 14).padEnd(16) +
      (f.destination_airport || '-').padEnd(5) +
      (f.terminal || '-').padEnd(6) +
      sched.padEnd(18) +
      (f.status || '-').padEnd(12) +
      (f.gate || '-').padEnd(8) +
      (f.foreign_passenger_count?.toString() || '-').padEnd(6) +
      (f.congestion_level || '-')
    );
  }
}

// ============================================================
// Commands
// ============================================================

async function cmdStatus() {
  const dbUrl = requireDb();
  const db = createDbAdapter(dbUrl);

  try {
    const flights = await queryUpcomingFlights(db.pool);
    console.log(`\n🛬 중국발 한국 도착편 현황 (±4시간)\n`);
    console.log(`  총 ${flights.length}편\n`);
    printFlightsTable(flights);
    console.log();
  } finally {
    await db.close();
  }
}

async function cmdPoll() {
  const dbUrl = requireDb();
  requireApiKeys();
  const db = createDbAdapter(dbUrl);

  try {
    console.log('\n🔄 수동 폴링 실행...\n');
    const result = await pollAll(
      { apiKeyEncoded: API_KEY_ENC, apiKeyDecoded: API_KEY_DEC, apiCallDelayMs: 500 },
      db,
    );
    console.log(`\n✅ 완료: 인천 ${result.incheon}편, 김포 ${result.gimpo}편, 이벤트 ${result.events}건\n`);
  } finally {
    await db.close();
  }
}

async function cmdEvents(timeArg: string) {
  const dbUrl = requireDb();
  const db = createDbAdapter(dbUrl);

  try {
    const interval = parseTimeArg(timeArg);
    const events = await queryRecentEvents(db.pool, interval);

    console.log(`\n📋 최근 이벤트 (${interval})\n`);

    if (events.length === 0) {
      console.log('  (이벤트 없음)');
    } else {
      console.log(
        '  ' +
        'Time'.padEnd(20) +
        'Flight'.padEnd(10) +
        'Event'.padEnd(16) +
        'Status'.padEnd(25) +
        'Origin'
      );
      console.log('  ' + '-'.repeat(80));

      for (const e of events) {
        const time = e.created_at
          ? new Date(e.created_at).toLocaleString('ko-KR', { timeZone: 'Asia/Seoul', hour: '2-digit', minute: '2-digit', second: '2-digit', month: '2-digit', day: '2-digit' })
          : '-';
        const statusChange = `${e.previous_status || '(new)'} → ${e.new_status}`;

        console.log(
          '  ' +
          time.padEnd(20) +
          ((e as any).flight_number || '-').padEnd(10) +
          (e.event_type || '-').padEnd(16) +
          statusChange.padEnd(25) +
          ((e as any).origin_airport || '-')
        );
      }
    }
    console.log();
  } finally {
    await db.close();
  }
}

async function cmdAirports() {
  console.log(`\n✈️  추적 대상 중국 공항 (${CHINA_AIRPORTS.length}개)\n`);
  console.log('  ' + 'Code'.padEnd(6) + 'Tier'.padEnd(8) + 'Name (KO)'.padEnd(20) + 'Name (ZH)'.padEnd(16) + 'GMP');
  console.log('  ' + '-'.repeat(55));
  for (const a of CHINA_AIRPORTS) {
    console.log(
      '  ' +
      a.code.padEnd(6) +
      a.tier.padEnd(8) +
      a.nameKo.padEnd(20) +
      a.nameZh.padEnd(16) +
      (a.hasGimpoRoute ? '✓' : '')
    );
  }
  console.log();
}

// ============================================================
// Main
// ============================================================

async function main() {
  const args = process.argv.slice(2);
  const command = args[0];

  switch (command) {
    case 'status':
      await cmdStatus();
      break;

    case 'poll':
      await cmdPoll();
      break;

    case 'events': {
      const lastIdx = args.indexOf('--last');
      const timeArg = lastIdx >= 0 ? args[lastIdx + 1] || '1h' : '1h';
      await cmdEvents(timeArg);
      break;
    }

    case 'airports':
      await cmdAirports();
      break;

    default:
      console.log(`
Flight Tracker CLI - 중국발 한국행 항공편 도착 추적

Commands:
  status              현재 중국발 도착 예정편 목록 (DB 조회)
  poll                수동 1회 폴링 실행 (API → DB)
  events --last <t>   최근 이벤트 로그 (예: 1h, 30m, 2d)
  airports            추적 대상 중국 공항 목록

Usage:
  npx tsx src/services/flight-tracker/cli.ts status
  npx tsx src/services/flight-tracker/cli.ts poll
  npx tsx src/services/flight-tracker/cli.ts events --last 1h
  npx tsx src/services/flight-tracker/cli.ts airports

Environment:
  DATABASE_URL                  PostgreSQL 연결 문자열
  DATA_GO_KR_API_KEY_ENCODED    공공데이터포털 API 키 (URL 인코딩)
  DATA_GO_KR_API_KEY_DECODED    공공데이터포털 API 키 (디코딩)
      `);
  }
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
