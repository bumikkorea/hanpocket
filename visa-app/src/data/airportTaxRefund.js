/**
 * 공항별 세금환급 창구 위치 및 운영정보
 * 다국어: 중국어(zh) 우선, 영어(en), 일본어(ja), 한국어(ko)
 */

export const AIRPORT_TAX_REFUND = [
  {
    id: 'icn-t1',
    airport: { zh: '仁川国际机场 第1航站楼', en: 'Incheon T1', ja: '仁川国際空港 第1ターミナル', ko: '인천국제공항 제1터미널' },
    customs: {
      location: { zh: '3楼 E、J柜台', en: '3F Counter E & J', ja: '3F E・Jカウンター', ko: '3F E,J카운터' }
    },
    refundCounter: {
      location: { zh: '3楼 28号登机口', en: '3F Gate 28', ja: '3F 28番ゲート', ko: '3F 28번 게이트' }
    },
    hours: { staffed: '24시간', kiosk: '24시간' },
    currencies: {
      staffed: ['KRW', 'CNY', 'USD', 'JPY'],
      kiosk: ['KRW', 'Alipay', 'WeChat Pay']
    },
    operators: ['Global Tax Free', 'Easy Tax Refund', 'NICE Tax Free'],
    mailbox: null
  },
  {
    id: 'icn-t2',
    airport: { zh: '仁川国际机场 第2航站楼', en: 'Incheon T2', ja: '仁川国際空港 第2ターミナル', ko: '인천국제공항 제2터미널' },
    customs: {
      location: { zh: '3楼 F、G柜台', en: '3F Counter F & G', ja: '3F F・Gカウンター', ko: '3F F,G카운터' }
    },
    refundCounter: {
      location: {
        zh: '3楼 249号登机口 / 274号(东侧) / 225号(西侧)',
        en: '3F Gate 249 / Gate 274 (East) / Gate 225 (West)',
        ja: '3F 249番ゲート / 274番(東側) / 225番(西側)',
        ko: '3F 249번 게이트 / 274번 게이트(동편) / 225번 게이트(서편)'
      }
    },
    hours: { staffed: '07:00 ~ 21:30', kiosk: null },
    currencies: {
      staffed: ['KRW', 'CNY', 'USD', 'JPY', 'WeChat Pay'],
      kiosk: null
    },
    operators: ['Global Tax Free'],
    mailbox: null
  },
  {
    id: 'gmp',
    airport: { zh: '金浦国际机场', en: 'Gimpo International', ja: '金浦国際空港', ko: '김포국제공항' },
    customs: {
      location: { zh: '2楼 1号登机口', en: '2F Gate 1', ja: '2F 1番ゲート', ko: '2F Gate 1' }
    },
    refundCounter: {
      location: { zh: '3楼 36号登机口', en: '3F Gate 36', ja: '3F 36番ゲート', ko: '3F 36번 게이트' }
    },
    hours: { staffed: '06:30 ~ 20:00', kiosk: '24시간' },
    currencies: {
      staffed: ['KRW', 'USD', 'JPY', 'Alipay', 'WeChat Pay'],
      kiosk: ['KRW', 'Alipay', 'WeChat Pay']
    },
    operators: ['Global Tax Free'],
    mailbox: null
  },
  {
    id: 'pus',
    airport: { zh: '金海国际机场', en: 'Gimhae International', ja: '金海国際空港', ko: '김해국제공항' },
    customs: {
      location: { zh: '2楼 4号登机口', en: '2F Gate 4', ja: '2F 4番ゲート', ko: '2F Gate 4' }
    },
    refundCounter: {
      location: { zh: '2楼 4号登机口', en: '2F Gate 4', ja: '2F 4番ゲート', ko: '2F 4번 게이트' }
    },
    hours: { staffed: '06:30 ~ 21:00', kiosk: null },
    currencies: {
      staffed: ['KRW', 'USD', 'JPY', 'Alipay'],
      kiosk: null
    },
    operators: ['Global Tax Free'],
    mailbox: null
  },
  {
    id: 'cju',
    airport: { zh: '济州国际机场', en: 'Jeju International', ja: '済州国際空港', ko: '제주국제공항' },
    customs: {
      location: { zh: '3楼 5号登机口', en: '3F Gate 5', ja: '3F 5番ゲート', ko: '3F Gate 5' }
    },
    refundCounter: {
      location: { zh: '3楼 16号登机口', en: '3F Gate 16', ja: '3F 16番ゲート', ko: '3F 16번 게이트' }
    },
    hours: { staffed: '06:00 ~ 22:00', kiosk: null },
    currencies: {
      staffed: ['KRW', 'CNY', 'USD', 'Alipay', 'WeChat Pay'],
      kiosk: null
    },
    operators: ['Global Tax Free'],
    mailbox: null
  },
  // 메일박스만 운영
  {
    id: 'cjj',
    airport: { zh: '清州机场', en: 'Cheongju', ja: '清州空港', ko: '청주공항' },
    customs: {
      location: { zh: '1楼', en: '1F', ja: '1F', ko: '1F' }
    },
    refundCounter: null,
    mailbox: {
      location: { zh: '1楼', en: '1F', ja: '1F', ko: '1F' },
      hours: '출항 시'
    },
    hours: { staffed: null, kiosk: null },
    currencies: null,
    operators: ['Global Tax Free (메일박스만)'],
    isMailboxOnly: true
  },
  {
    id: 'mwx',
    airport: { zh: '务安机场', en: 'Muan', ja: '務安空港', ko: '무안공항' },
    customs: {
      location: { zh: '1楼', en: '1F', ja: '1F', ko: '1F' }
    },
    refundCounter: null,
    mailbox: {
      location: { zh: '1楼', en: '1F', ja: '1F', ko: '1F' },
      hours: '출항 시'
    },
    hours: { staffed: null, kiosk: null },
    currencies: null,
    operators: ['Global Tax Free (메일박스만)'],
    isMailboxOnly: true
  },
  {
    id: 'tae',
    airport: { zh: '大邱机场', en: 'Daegu', ja: '大邱空港', ko: '대구공항' },
    customs: {
      location: { zh: '1楼', en: '1F', ja: '1F', ko: '1F' }
    },
    refundCounter: null,
    mailbox: {
      location: { zh: '1楼', en: '1F', ja: '1F', ko: '1F' },
      hours: '출항 시'
    },
    hours: { staffed: null, kiosk: null },
    currencies: null,
    operators: ['Global Tax Free (메일박스만)'],
    isMailboxOnly: true
  },
];

export const PAYMENT_METHOD_LABELS = {
  'KRW': { zh: '韩元', en: 'KRW', ja: '韓国ウォン', ko: '원화' },
  'CNY': { zh: '人民币', en: 'CNY', ja: '人民元', ko: '위안' },
  'USD': { zh: '美元', en: 'USD', ja: '米ドル', ko: '달러' },
  'JPY': { zh: '日元', en: 'JPY', ja: '日本円', ko: '엔' },
  'Alipay': { zh: '支付宝', en: 'Alipay', ja: 'Alipay', ko: '알리페이' },
  'WeChat Pay': { zh: '微信支付', en: 'WeChat Pay', ja: 'WeChat Pay', ko: '위챗페이' },
};
