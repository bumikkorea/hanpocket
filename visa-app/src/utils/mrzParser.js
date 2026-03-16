/**
 * Passport MRZ (Machine Readable Zone) Parser
 * Parses TD3 format (passport) MRZ lines
 *
 * MRZ Line 1: P<NATIONALITY_CODE SURNAME<<GIVEN_NAMES<<<...
 * MRZ Line 2: PASSPORT_NUMBER CHECK NATIONALITY DOB CHECK SEX EXPIRY CHECK ...
 *
 * All passport data is stored locally only, never sent to server.
 */

// Country code → language mapping
const NATIONALITY_LANG_MAP = {
  CHN: 'zh', CN: 'zh',
  JPN: 'ja', JP: 'ja',
  USA: 'en', US: 'en',
  GBR: 'en', GB: 'en',
  AUS: 'en', AU: 'en',
  CAN: 'en', CA: 'en',
  TWN: 'zh', TW: 'zh',
  HKG: 'zh', HK: 'zh',
  MAC: 'zh', MO: 'zh',
  SGP: 'en', SG: 'en',
  MYS: 'en', MY: 'en',
  THA: 'en', TH: 'en',
  VNM: 'en', VN: 'en',
  PHL: 'en', PH: 'en',
  IDN: 'en', ID: 'en',
  IND: 'en', IN: 'en',
  DEU: 'en', DE: 'en',
  FRA: 'en', FR: 'en',
  RUS: 'en', RU: 'en',
}

// Visa requirement by nationality
const VISA_REQUIREMENTS = {
  CHN: { type: 'visa', desc: { ko: '비자 필요 (단체관광 사증면제 가능)', zh: '需要签证（团体观光可免签）', en: 'Visa required (group tour visa-free possible)', ja: 'ビザ必要（団体観光ビザ免除あり）' } },
  JPN: { type: 'visa-free-90', desc: { ko: '90일 무비자', zh: '90天免签', en: '90-day visa-free', ja: '90日ビザなし' } },
  USA: { type: 'k-eta', desc: { ko: 'K-ETA 필요', zh: '需要K-ETA', en: 'K-ETA required', ja: 'K-ETA必要' } },
  GBR: { type: 'k-eta', desc: { ko: 'K-ETA 필요', zh: '需要K-ETA', en: 'K-ETA required', ja: 'K-ETA必要' } },
  CAN: { type: 'k-eta', desc: { ko: 'K-ETA 필요', zh: '需要K-ETA', en: 'K-ETA required', ja: 'K-ETA必要' } },
  AUS: { type: 'k-eta', desc: { ko: 'K-ETA 필요', zh: '需要K-ETA', en: 'K-ETA required', ja: 'K-ETA必要' } },
  TWN: { type: 'visa-free-90', desc: { ko: '90일 무비자', zh: '90天免签', en: '90-day visa-free', ja: '90日ビザなし' } },
  HKG: { type: 'visa-free-90', desc: { ko: '90일 무비자', zh: '90天免签', en: '90-day visa-free', ja: '90日ビザなし' } },
  MAC: { type: 'visa-free-90', desc: { ko: '90일 무비자', zh: '90天免签', en: '90-day visa-free', ja: '90日ビザなし' } },
  SGP: { type: 'visa-free-90', desc: { ko: '90일 무비자', zh: '90天免签', en: '90-day visa-free', ja: '90日ビザなし' } },
  THA: { type: 'visa-free-90', desc: { ko: '90일 무비자', zh: '90天免签', en: '90-day visa-free', ja: '90日ビザなし' } },
  MYS: { type: 'visa-free-90', desc: { ko: '90일 무비자', zh: '90天免签', en: '90-day visa-free', ja: '90日ビザなし' } },
  DEU: { type: 'visa-free-90', desc: { ko: '90일 무비자', zh: '90天免签', en: '90-day visa-free', ja: '90日ビザなし' } },
  FRA: { type: 'visa-free-90', desc: { ko: '90일 무비자', zh: '90天免签', en: '90-day visa-free', ja: '90日ビザなし' } },
}

// Embassy contacts in Korea
const EMBASSIES = {
  CHN: { name: { ko: '주한중국대사관', zh: '中国驻韩大使馆', en: 'Chinese Embassy', ja: '在韓中国大使館' }, phone: '02-738-1038', address: '서울시 중구 명동2길 27' },
  JPN: { name: { ko: '주한일본대사관', zh: '日本驻韩大使馆', en: 'Japanese Embassy', ja: '在韓日本大使館' }, phone: '02-2170-5200', address: '서울시 종로구 율곡로 6' },
  USA: { name: { ko: '주한미국대사관', zh: '美国驻韩大使馆', en: 'US Embassy', ja: '在韓米国大使館' }, phone: '02-397-4114', address: '서울시 종로구 세종대로 188' },
  GBR: { name: { ko: '주한영국대사관', zh: '英国驻韩大使馆', en: 'British Embassy', ja: '在韓英国大使館' }, phone: '02-3210-5500', address: '서울시 중구 세종대로 24' },
  CAN: { name: { ko: '주한캐나다대사관', zh: '加拿大驻韩大使馆', en: 'Canadian Embassy', ja: '在韓カナダ大使館' }, phone: '02-3783-6000', address: '서울시 중구 정동길 21' },
  TWN: { name: { ko: '주한대만대표부', zh: '驻韩国台北代表部', en: 'Taiwan Representative Office', ja: '在韓台湾代表部' }, phone: '02-399-2780', address: '서울시 종로구 세종대로 149' },
}

// Nationality-specific tips
const NATIONALITY_TIPS = {
  CHN: [
    { ko: '위챗페이/알리페이 사용 가능 매장 확인', zh: '微信支付/支付宝可用商店查询', en: 'Check WeChat Pay/Alipay accepted stores', ja: 'WeChat Pay/Alipay対応店舗確認' },
    { ko: '면세점 사전예약하면 최대 40% 할인', zh: '免税店提前预约最高享40%折扣', en: 'Pre-book duty free for up to 40% off', ja: '免税店事前予約で最大40%オフ' },
    { ko: '한국 입국 시 개인통관고유부호 필요할 수 있음', zh: '入韩时可能需要个人通关号', en: 'May need personal customs code for entry', ja: '入国時に個人通関番号が必要な場合あり' },
  ],
  JPN: [
    { ko: '교통카드 T-money는 일본 Suica와 유사', zh: '交通卡T-money类似日本Suica', en: 'T-money transit card is similar to Suica', ja: '交通カードT-moneyはSuicaと同様' },
    { ko: '한국은 팁 문화가 없습니다', zh: '韩国没有小费文化', en: 'No tipping culture in Korea', ja: '韓国にはチップの文化がありません' },
  ],
  USA: [
    { ko: '한국은 220V, 타입 C/F 콘센트 (어댑터 필요)', zh: '韩国使用220V，C/F型插座（需要转换器）', en: 'Korea uses 220V, Type C/F outlets (adapter needed)', ja: '韓国は220V、Cタイプ/Fタイプコンセント（変換器必要）' },
    { ko: '대부분의 음식점은 현금보다 카드 결제 선호', zh: '大多数餐厅更倾向刷卡', en: 'Most restaurants prefer card over cash', ja: 'ほとんどの飲食店はカード決済を好む' },
  ],
}

/**
 * Parse MRZ text (two lines from TD3 passport)
 */
export function parseMRZ(line1, line2) {
  if (!line1 || !line2 || line1.length < 44 || line2.length < 44) {
    return null
  }

  // Line 1: P<ISSUING_STATE SURNAME<<GIVEN_NAMES
  const docType = line1.substring(0, 1)
  if (docType !== 'P') return null

  const issuingState = line1.substring(2, 5).replace(/</g, '')
  const namePart = line1.substring(5)
  const nameParts = namePart.split('<<')
  const surname = (nameParts[0] || '').replace(/</g, ' ').trim()
  const givenNames = (nameParts[1] || '').replace(/</g, ' ').trim()

  // Line 2: PASSPORT_NO(9) CHECK(1) NATIONALITY(3) DOB(6) CHECK(1) SEX(1) EXPIRY(6) CHECK(1) ...
  const passportNumber = line2.substring(0, 9).replace(/</g, '')
  const nationality = line2.substring(10, 13).replace(/</g, '')
  const dobRaw = line2.substring(13, 19)
  const sex = line2.substring(20, 21)
  const expiryRaw = line2.substring(21, 27)

  // Parse date: YYMMDD
  const parseDate = (raw) => {
    if (!raw || raw.length !== 6) return null
    const yy = parseInt(raw.substring(0, 2))
    const mm = raw.substring(2, 4)
    const dd = raw.substring(4, 6)
    const year = yy > 50 ? 1900 + yy : 2000 + yy
    return `${year}-${mm}-${dd}`
  }

  return {
    surname,
    givenNames,
    fullName: `${givenNames} ${surname}`.trim(),
    passportNumber,
    nationality,
    issuingState,
    dateOfBirth: parseDate(dobRaw),
    sex: sex === 'M' ? 'male' : sex === 'F' ? 'female' : 'other',
    expiryDate: parseDate(expiryRaw),
  }
}

/**
 * Get recommended language for a nationality
 */
export function getLanguageForNationality(nationalityCode) {
  return NATIONALITY_LANG_MAP[nationalityCode] || 'en'
}

/**
 * Get visa requirement info for a nationality
 */
export function getVisaRequirement(nationalityCode) {
  return VISA_REQUIREMENTS[nationalityCode] || {
    type: 'check',
    desc: { ko: '비자 요건 확인 필요', zh: '需确认签证要求', en: 'Check visa requirements', ja: 'ビザ要件の確認が必要' },
  }
}

/**
 * Get embassy contact for a nationality
 */
export function getEmbassy(nationalityCode) {
  return EMBASSIES[nationalityCode] || null
}

/**
 * Get nationality-specific tips
 */
export function getNationalityTips(nationalityCode) {
  return NATIONALITY_TIPS[nationalityCode] || []
}

/**
 * Build a full profile setup from MRZ data
 */
export function buildProfileFromMRZ(mrzData) {
  const lang = getLanguageForNationality(mrzData.nationality)
  const visa = getVisaRequirement(mrzData.nationality)
  const embassy = getEmbassy(mrzData.nationality)
  const tips = getNationalityTips(mrzData.nationality)

  return {
    name: mrzData.fullName,
    passportNumber: mrzData.passportNumber,
    nationality: mrzData.nationality,
    passportExpiry: mrzData.expiryDate,
    recommendedLang: lang,
    visaRequirement: visa,
    embassy,
    tips,
    scannedAt: new Date().toISOString(),
  }
}
