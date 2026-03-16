// ============================================================
// Flight Tracker - 서비스 엔트리 + Cron 스케줄러
// Usage: npx tsx src/services/flight-tracker/index.ts
// ============================================================

import 'dotenv/config';
import { CronJob } from 'cron';
import { createDbAdapter } from './db';
import { pollIncheonRealtime, pollIncheonWeekly, pollGimpo } from './flight-poller';
import { DEFAULT_POLLER_CONFIG } from './types';

// ============================================================
// 환경변수
// ============================================================

const DB_URL = process.env.DATABASE_URL;
const API_KEY_ENC = process.env.DATA_GO_KR_API_KEY_ENCODED || '';
const API_KEY_DEC = process.env.DATA_GO_KR_API_KEY_DECODED || '';

if (!DB_URL) {
  console.error('❌ DATABASE_URL 환경변수가 필요합니다.');
  process.exit(1);
}

if (!API_KEY_ENC && !API_KEY_DEC) {
  console.error('❌ DATA_GO_KR_API_KEY_ENCODED 또는 DATA_GO_KR_API_KEY_DECODED가 필요합니다.');
  process.exit(1);
}

const config = {
  apiKeyEncoded: API_KEY_ENC,
  apiKeyDecoded: API_KEY_DEC,
  apiCallDelayMs: DEFAULT_POLLER_CONFIG.apiCallDelayMs,
};

// ============================================================
// DB 초기화
// ============================================================

const db = createDbAdapter(DB_URL);

// ============================================================
// Cron 스케줄 설정
// 시간대: Asia/Seoul (KST)
// ============================================================

// 인천공항 실시간 (입국장현황) - 5분 간격
const incheonRealtimeCron = new CronJob(
  '*/5 * * * *',  // 매 5분
  async () => {
    try {
      await pollIncheonRealtime(config, db);
    } catch (err) {
      console.error('[cron] Incheon realtime poll error:', err);
    }
  },
  null,
  false,
  'Asia/Seoul',
);

// 인천공항 주간 운항현황 - 1시간 간격
const incheonWeeklyCron = new CronJob(
  '0 * * * *',  // 매시 정각
  async () => {
    try {
      await pollIncheonWeekly(config, db);
    } catch (err) {
      console.error('[cron] Incheon weekly poll error:', err);
    }
  },
  null,
  false,
  'Asia/Seoul',
);

// 김포공항 - 10분 간격
const gimpoCron = new CronJob(
  '*/10 * * * *',  // 매 10분
  async () => {
    try {
      await pollGimpo(config, db);
    } catch (err) {
      console.error('[cron] Gimpo poll error:', err);
    }
  },
  null,
  false,
  'Asia/Seoul',
);

// ============================================================
// 시작
// ============================================================

function start() {
  console.log('');
  console.log('✈️  NEAR Flight Tracker 시작');
  console.log('  - 인천공항 실시간: 5분 간격');
  console.log('  - 인천공항 주간: 1시간 간격');
  console.log('  - 김포공항: 10분 간격');
  console.log('  - 시간대: Asia/Seoul (KST)');
  console.log('');

  incheonRealtimeCron.start();
  incheonWeeklyCron.start();
  gimpoCron.start();

  // 시작 직후 1회 실행
  console.log('[startup] Initial poll...');
  Promise.all([
    pollIncheonRealtime(config, db).catch(e => console.error('[startup] Incheon realtime:', e)),
    pollGimpo(config, db).catch(e => console.error('[startup] Gimpo:', e)),
  ]).then(() => {
    console.log('[startup] Initial poll complete.');
  });
}

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n[shutdown] Stopping cron jobs...');
  incheonRealtimeCron.stop();
  incheonWeeklyCron.stop();
  gimpoCron.stop();
  await db.close();
  console.log('[shutdown] Done.');
  process.exit(0);
});

process.on('SIGTERM', async () => {
  incheonRealtimeCron.stop();
  incheonWeeklyCron.stop();
  gimpoCron.stop();
  await db.close();
  process.exit(0);
});

start();
