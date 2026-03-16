// ============================================================
// Flight Poller - 통합 폴링 서비스
// Tier 1 매 사이클 / Tier 2 라운드로빈 / 김포 별도 사이클
// ============================================================

import { fetchIncheonArrivals, fetchIncheonWeeklyArrivals } from './incheon-api';
import { fetchGimpoArrivals } from './gimpo-api';
import { processFlightArrivals, type DbAdapter } from './flight-events';
import { TIER1_CODES, TIER2_CODES, GIMPO_ROUTE_CODES } from './china-airports';
import type { FlightArrivalRecord, PollerConfig } from './types';

/** Tier 2 라운드로빈 인덱스 */
let tier2Index = 0;

/** 한 사이클에 조회할 Tier 2 공항 수 */
const TIER2_BATCH_SIZE = 5;

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * 인천공항 실시간 폴링 (입국장현황)
 * - Tier 1: 매 사이클 전체 조회
 * - Tier 2: 라운드로빈으로 BATCH_SIZE개씩
 */
export async function pollIncheonRealtime(
  config: Pick<PollerConfig, 'apiKeyEncoded' | 'apiKeyDecoded' | 'apiCallDelayMs'>,
  db: DbAdapter,
): Promise<{ total: number; events: number }> {
  const apiConfig = {
    apiKeyEncoded: config.apiKeyEncoded,
    apiKeyDecoded: config.apiKeyDecoded,
  };

  let allArrivals: FlightArrivalRecord[] = [];

  // Tier 1 - 전체 조회
  for (const code of TIER1_CODES) {
    try {
      // T1, T2 모두 조회
      const [t1, t2] = await Promise.all([
        fetchIncheonArrivals(apiConfig, code, 'T1'),
        fetchIncheonArrivals(apiConfig, code, 'T2'),
      ]);
      allArrivals = allArrivals.concat(t1, t2);
      await sleep(config.apiCallDelayMs);
    } catch (err) {
      console.error(`[poller] Incheon Tier1 ${code} failed:`, err);
    }
  }

  // Tier 2 - 라운드로빈
  const tier2Batch = getTier2Batch();
  for (const code of tier2Batch) {
    try {
      const results = await fetchIncheonArrivals(apiConfig, code);
      allArrivals = allArrivals.concat(results);
      await sleep(config.apiCallDelayMs);
    } catch (err) {
      console.error(`[poller] Incheon Tier2 ${code} failed:`, err);
    }
  }

  // DB 저장 + 이벤트 감지
  const events = await processFlightArrivals(db, allArrivals);

  console.log(
    `[poller] Incheon realtime: ${allArrivals.length} flights, ${events.length} events ` +
    `(Tier1: ${TIER1_CODES.length} airports, Tier2 batch: [${tier2Batch.join(',')}])`
  );

  return { total: allArrivals.length, events: events.length };
}

/**
 * 인천공항 주간 운항현황 폴링
 */
export async function pollIncheonWeekly(
  config: Pick<PollerConfig, 'apiKeyEncoded' | 'apiKeyDecoded' | 'apiCallDelayMs'>,
  db: DbAdapter,
): Promise<{ total: number; events: number }> {
  const apiConfig = {
    apiKeyEncoded: config.apiKeyEncoded,
    apiKeyDecoded: config.apiKeyDecoded,
  };

  let allArrivals: FlightArrivalRecord[] = [];
  const allCodes = [...TIER1_CODES, ...TIER2_CODES];

  for (const code of allCodes) {
    try {
      const results = await fetchIncheonWeeklyArrivals(apiConfig, code);
      allArrivals = allArrivals.concat(results);
      await sleep(config.apiCallDelayMs);
    } catch (err) {
      console.error(`[poller] Incheon weekly ${code} failed:`, err);
    }
  }

  const events = await processFlightArrivals(db, allArrivals);

  console.log(`[poller] Incheon weekly: ${allArrivals.length} flights, ${events.length} events`);

  return { total: allArrivals.length, events: events.length };
}

/**
 * 김포공항 폴링
 */
export async function pollGimpo(
  config: Pick<PollerConfig, 'apiKeyEncoded' | 'apiKeyDecoded' | 'apiCallDelayMs'>,
  db: DbAdapter,
): Promise<{ total: number; events: number }> {
  const apiConfig = {
    apiKeyEncoded: config.apiKeyEncoded,
    apiKeyDecoded: config.apiKeyDecoded,
  };

  let allArrivals: FlightArrivalRecord[] = [];

  for (const code of GIMPO_ROUTE_CODES) {
    try {
      const results = await fetchGimpoArrivals(apiConfig, code);
      allArrivals = allArrivals.concat(results);
      await sleep(config.apiCallDelayMs);
    } catch (err) {
      console.error(`[poller] Gimpo ${code} failed:`, err);
    }
  }

  const events = await processFlightArrivals(db, allArrivals);

  console.log(`[poller] Gimpo: ${allArrivals.length} flights, ${events.length} events`);

  return { total: allArrivals.length, events: events.length };
}

/**
 * 전체 1회 폴링 (CLI에서 수동 실행용)
 */
export async function pollAll(
  config: Pick<PollerConfig, 'apiKeyEncoded' | 'apiKeyDecoded' | 'apiCallDelayMs'>,
  db: DbAdapter,
): Promise<{ incheon: number; gimpo: number; events: number }> {
  console.log('[poller] Starting full poll cycle...');
  const start = Date.now();

  const [icn, gmp] = await Promise.all([
    pollIncheonRealtime(config, db),
    pollGimpo(config, db),
  ]);

  const elapsed = ((Date.now() - start) / 1000).toFixed(1);
  console.log(
    `[poller] Full cycle done in ${elapsed}s: ` +
    `Incheon ${icn.total}, Gimpo ${gmp.total}, Events ${icn.events + gmp.events}`
  );

  return {
    incheon: icn.total,
    gimpo: gmp.total,
    events: icn.events + gmp.events,
  };
}

/** Tier 2 라운드로빈 배치 추출 */
function getTier2Batch(): string[] {
  const batch: string[] = [];
  for (let i = 0; i < TIER2_BATCH_SIZE && i < TIER2_CODES.length; i++) {
    batch.push(TIER2_CODES[tier2Index % TIER2_CODES.length]);
    tier2Index++;
  }
  return batch;
}
