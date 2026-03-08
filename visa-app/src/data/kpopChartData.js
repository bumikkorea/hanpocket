// K-POP 주간 차트 데이터 — QQ뮤직 API 실제 데이터 (2026년 1월~3월)
// 소스: QQ Music 韩国榜 (topId:16) + 韩国Melon榜 (topId:129)

export const CHART_SOURCES = {
  qq: { id: 'qq', name: 'QQ音乐 韩国榜', nameKo: 'QQ뮤직 한국차트', nameEn: 'QQ Music Korea', color: '#FE9901' },
  melon: { id: 'melon', name: 'QQ音乐 Melon榜', nameKo: 'QQ뮤직 멜론차트', nameEn: 'QQ Music Melon', color: '#00CD3C' },
}

export const WEEKS = [
  { id: '2026_W01', label: { ko: '1월 1주', zh: '1月第1周', en: 'Jan W1' }, date: '2026-01-01' },
  { id: '2026_W02', label: { ko: '1월 2주', zh: '1月第2周', en: 'Jan W2' }, date: '2026-01-08' },
  { id: '2026_W03', label: { ko: '1월 3주', zh: '1月第3周', en: 'Jan W3' }, date: '2026-01-15' },
  { id: '2026_W04', label: { ko: '1월 4주', zh: '1月第4周', en: 'Jan W4' }, date: '2026-01-22' },
  { id: '2026_W05', label: { ko: '1월 5주', zh: '1月第5周', en: 'Jan W5' }, date: '2026-01-29' },
  { id: '2026_W06', label: { ko: '2월 1주', zh: '2月第1周', en: 'Feb W1' }, date: '2026-02-05' },
  { id: '2026_W07', label: { ko: '2월 2주', zh: '2月第2周', en: 'Feb W2' }, date: '2026-02-12' },
  { id: '2026_W08', label: { ko: '2월 3주', zh: '2月第3周', en: 'Feb W3' }, date: '2026-02-19' },
  { id: '2026_W09', label: { ko: '2월 4주', zh: '2月第4周', en: 'Feb W4' }, date: '2026-02-26' },
  { id: '2026_W10', label: { ko: '3월 1주', zh: '3月第1周', en: 'Mar W1' }, date: '2026-03-05' },
]

// QQ Music 韩国榜 (topId:16) — 주간 TOP 10
const QQ_KOREAN = {
  '2026_W01': [
    { rank: 1, title: 'NOT CUTE ANYMORE', artist: 'ILLIT' },
    { rank: 2, title: 'OVERDRIVE', artist: 'TWS' },
    { rank: 3, title: 'FOCUS', artist: 'Hearts2Hearts' },
    { rank: 4, title: 'ONE MORE TIME', artist: 'ALLDAY PROJECT' },
    { rank: 5, title: 'WE GO UP', artist: 'BABYMONSTER' },
    { rank: 6, title: 'Ketchup And Lemonade', artist: 'aespa (NINGNING)' },
    { rank: 7, title: 'Have A Good Time', artist: 'Paul Kim/YUQI' },
    { rank: 8, title: 'PSYCHO', artist: 'BABYMONSTER' },
    { rank: 9, title: 'WHERE YOU AT', artist: 'ALLDAY PROJECT' },
    { rank: 10, title: 'Do It', artist: 'Stray Kids' },
  ],
  '2026_W02': [
    { rank: 1, title: 'NOT CUTE ANYMORE', artist: 'ILLIT' },
    { rank: 2, title: 'Love Me More', artist: 'Apink' },
    { rank: 3, title: 'OVERDRIVE', artist: 'TWS' },
    { rank: 4, title: 'FOCUS', artist: 'Hearts2Hearts' },
    { rank: 5, title: 'WHERE YOU AT', artist: 'ALLDAY PROJECT' },
    { rank: 6, title: 'WE GO UP', artist: 'BABYMONSTER' },
    { rank: 7, title: 'ONE MORE TIME', artist: 'ALLDAY PROJECT' },
    { rank: 8, title: 'Have A Good Time', artist: 'Paul Kim/YUQI' },
    { rank: 9, title: 'PSYCHO', artist: 'BABYMONSTER' },
    { rank: 10, title: 'Ketchup And Lemonade', artist: 'aespa (NINGNING)' },
  ],
  '2026_W03': [
    { rank: 1, title: 'Love Me More', artist: 'Apink' },
    { rank: 2, title: 'NOT CUTE ANYMORE', artist: 'ILLIT' },
    { rank: 3, title: 'Rockstar (DK Solo)', artist: 'SEVENTEEN' },
    { rank: 4, title: 'Running to Future', artist: 'ZEROBASEONE' },
    { rank: 5, title: 'WHERE YOU AT', artist: 'ALLDAY PROJECT' },
    { rank: 6, title: '冷空气', artist: 'HENRY' },
    { rank: 7, title: 'Blue', artist: 'SEVENTEEN' },
    { rank: 8, title: 'Sunday Morning', artist: 'ILLIT' },
    { rank: 9, title: 'FOCUS', artist: 'Hearts2Hearts' },
    { rank: 10, title: 'Guilty Pleasure', artist: 'SEVENTEEN' },
  ],
  '2026_W04': [
    { rank: 1, title: 'Love Me More', artist: 'Apink' },
    { rank: 2, title: '冷空气', artist: 'HENRY' },
    { rank: 3, title: 'Crown', artist: 'EXO' },
    { rank: 4, title: 'NOT CUTE ANYMORE', artist: 'ILLIT' },
    { rank: 5, title: 'Crazy', artist: 'EXO' },
    { rank: 6, title: 'Back It Up', artist: 'EXO' },
    { rank: 7, title: 'WHERE YOU AT', artist: 'ALLDAY PROJECT' },
    { rank: 8, title: 'Hello Mellow', artist: 'NCT WISH' },
    { rank: 9, title: 'Daydream', artist: 'WENDY' },
    { rank: 10, title: "I'm Home", artist: 'EXO' },
  ],
  '2026_W05': [
    { rank: 1, title: 'Love Me More', artist: 'Apink' },
    { rank: 2, title: 'Mono', artist: '(G)I-DLE' },
    { rank: 3, title: 'Delulu', artist: 'KiiiKiii' },
    { rank: 4, title: "Saucin'", artist: 'LNGSHOT' },
    { rank: 5, title: '404 (New Era)', artist: 'KiiiKiii' },
    { rank: 6, title: '冷空气', artist: 'HENRY' },
    { rank: 7, title: 'NOT CUTE ANYMORE', artist: 'ILLIT' },
    { rank: 8, title: 'Obsession', artist: 'KANGDANIEL' },
    { rank: 9, title: 'Daydream', artist: 'WENDY' },
    { rank: 10, title: 'Crown', artist: 'EXO' },
  ],
  '2026_W06': [
    { rank: 1, title: '404 (New Era)', artist: 'KiiiKiii' },
    { rank: 2, title: 'Love Me More', artist: 'Apink' },
    { rank: 3, title: 'Mono', artist: '(G)I-DLE' },
    { rank: 4, title: 'Delulu', artist: 'KiiiKiii' },
    { rank: 5, title: "Saucin'", artist: 'LNGSHOT' },
    { rank: 6, title: 'NOT CUTE ANYMORE', artist: 'ILLIT' },
    { rank: 7, title: 'Promise', artist: 'Wonstein' },
    { rank: 8, title: 'Daydream', artist: 'WENDY' },
    { rank: 9, title: 'UNDERDOGS', artist: 'KiiiKiii' },
    { rank: 10, title: '冷空气', artist: 'HENRY' },
  ],
  '2026_W07': [
    { rank: 1, title: 'BANG BANG', artist: 'IVE' },
    { rank: 2, title: '404 (New Era)', artist: 'KiiiKiii' },
    { rank: 3, title: 'All of You', artist: 'RIIZE' },
    { rank: 4, title: 'Love Me More', artist: 'Apink' },
    { rank: 5, title: '다시 만난 오늘', artist: 'TWS' },
    { rank: 6, title: 'NOT CUTE ANYMORE', artist: 'ILLIT' },
    { rank: 7, title: 'Delulu', artist: 'KiiiKiii' },
    { rank: 8, title: 'Mono', artist: '(G)I-DLE' },
    { rank: 9, title: 'Promise', artist: 'Wonstein' },
    { rank: 10, title: "Saucin'", artist: 'LNGSHOT' },
  ],
  '2026_W08': [
    { rank: 1, title: 'BANG BANG', artist: 'IVE' },
    { rank: 2, title: 'Never Let Go', artist: 'LNGSHOT' },
    { rank: 3, title: '404 (New Era)', artist: 'KiiiKiii' },
    { rank: 4, title: "Moonwalkin'", artist: 'LNGSHOT' },
    { rank: 5, title: 'Love Me More', artist: 'Apink' },
    { rank: 6, title: 'Mention Me', artist: 'CORTIS' },
    { rank: 7, title: 'Flashlight', artist: 'RIIZE' },
    { rank: 8, title: '다시 만난 오늘', artist: 'TWS' },
    { rank: 9, title: 'NOT CUTE ANYMORE', artist: 'ILLIT' },
    { rank: 10, title: 'All of You', artist: 'RIIZE' },
  ],
  '2026_W09': [
    { rank: 1, title: 'RUDE!', artist: 'Hearts2Hearts' },
    { rank: 2, title: 'BANG BANG', artist: 'IVE' },
    { rank: 3, title: 'Never Let Go', artist: 'LNGSHOT' },
    { rank: 4, title: '8 (JANGWONYOUNG Solo)', artist: 'WONYOUNG' },
    { rank: 5, title: '404 (New Era)', artist: 'KiiiKiii' },
    { rank: 6, title: 'BLACKHOLE', artist: 'IVE' },
    { rank: 7, title: 'Love Me More', artist: 'Apink' },
    { rank: 8, title: "Moonwalkin'", artist: 'LNGSHOT' },
    { rank: 9, title: 'Odd (GAEUL Solo)', artist: 'GAEUL' },
    { rank: 10, title: 'Flashlight', artist: 'RIIZE' },
  ],
  '2026_W10': [
    { rank: 1, title: 'RUDE!', artist: 'Hearts2Hearts' },
    { rank: 2, title: 'GO', artist: 'BLACKPINK' },
    { rank: 3, title: 'Champion', artist: 'BLACKPINK' },
    { rank: 4, title: 'JUMP', artist: 'BLACKPINK' },
    { rank: 5, title: 'Me and my', artist: 'BLACKPINK' },
    { rank: 6, title: 'Tiny Light', artist: 'SEVENTEEN' },
    { rank: 7, title: 'Fxxxboy', artist: 'BLACKPINK' },
    { rank: 8, title: 'BANG BANG', artist: 'IVE' },
    { rank: 9, title: 'Never Let Go', artist: 'LNGSHOT' },
    { rank: 10, title: '404 (New Era)', artist: 'KiiiKiii' },
  ],
}

// QQ Music 韩国Melon榜 (topId:129) — 주간 TOP 10
const QQ_MELON = {
  '2026_W01': [
    { rank: 1, title: 'Good Goodbye', artist: 'HWASA' },
    { rank: 2, title: '타임캡슐', artist: 'DAVICHI' },
    { rank: 3, title: 'Drowning', artist: 'WOODZ' },
    { rank: 4, title: 'Blue Valentine', artist: 'NMIXX' },
    { rank: 5, title: 'Golden', artist: 'KPop Demon Hunters' },
    { rank: 6, title: '사랑하게 될 거야', artist: '한로로' },
    { rank: 7, title: 'ONE MORE TIME', artist: 'ALLDAY PROJECT' },
    { rank: 8, title: 'SPAGHETTI', artist: 'LE SSERAFIM/j-hope' },
    { rank: 9, title: '멸종위기사랑', artist: '이찬혁' },
    { rank: 10, title: '어제보다 슬픈 오늘', artist: 'Woody' },
  ],
  '2026_W02': [
    { rank: 1, title: 'Good Goodbye', artist: 'HWASA' },
    { rank: 2, title: 'Drowning', artist: 'WOODZ' },
    { rank: 3, title: '타임캡슐', artist: 'DAVICHI' },
    { rank: 4, title: '사랑하게 될 거야', artist: '한로로' },
    { rank: 5, title: 'Blue Valentine', artist: 'NMIXX' },
    { rank: 6, title: 'Golden', artist: 'KPop Demon Hunters' },
    { rank: 7, title: 'SPAGHETTI', artist: 'LE SSERAFIM/j-hope' },
    { rank: 8, title: 'ONE MORE TIME', artist: 'ALLDAY PROJECT' },
    { rank: 9, title: '멸종위기사랑', artist: '이찬혁' },
    { rank: 10, title: '어제보다 슬픈 오늘', artist: 'Woody' },
  ],
  '2026_W03': [
    { rank: 1, title: 'Good Goodbye', artist: 'HWASA' },
    { rank: 2, title: '사랑하게 될 거야', artist: '한로로' },
    { rank: 3, title: 'Drowning', artist: 'WOODZ' },
    { rank: 4, title: '타임캡슐', artist: 'DAVICHI' },
    { rank: 5, title: 'Blue Valentine', artist: 'NMIXX' },
    { rank: 6, title: 'Golden', artist: 'KPop Demon Hunters' },
    { rank: 7, title: 'SPAGHETTI', artist: 'LE SSERAFIM/j-hope' },
    { rank: 8, title: 'ONE MORE TIME', artist: 'ALLDAY PROJECT' },
    { rank: 9, title: '멸종위기사랑', artist: '이찬혁' },
    { rank: 10, title: '0+0', artist: '한로로' },
  ],
  '2026_W04': [
    { rank: 1, title: 'Good Goodbye', artist: 'HWASA' },
    { rank: 2, title: '사랑하게 될 거야', artist: '한로로' },
    { rank: 3, title: '그대 작은 나의 세상이 되어', artist: 'Car, the garden' },
    { rank: 4, title: 'Drowning', artist: 'WOODZ' },
    { rank: 5, title: '타임캡슐', artist: 'DAVICHI' },
    { rank: 6, title: 'Blue Valentine', artist: 'NMIXX' },
    { rank: 7, title: 'Golden', artist: 'KPop Demon Hunters' },
    { rank: 8, title: 'SPAGHETTI', artist: 'LE SSERAFIM/j-hope' },
    { rank: 9, title: '0+0', artist: '한로로' },
    { rank: 10, title: 'ONE MORE TIME', artist: 'ALLDAY PROJECT' },
  ],
  '2026_W05': [
    { rank: 1, title: '그대 작은 나의 세상이 되어', artist: 'Car, the garden' },
    { rank: 2, title: 'Good Goodbye', artist: 'HWASA' },
    { rank: 3, title: '사랑하게 될 거야', artist: '한로로' },
    { rank: 4, title: 'Drowning', artist: 'WOODZ' },
    { rank: 5, title: '타임캡슐', artist: 'DAVICHI' },
    { rank: 6, title: 'Blue Valentine', artist: 'NMIXX' },
    { rank: 7, title: 'Golden', artist: 'KPop Demon Hunters' },
    { rank: 8, title: '0+0', artist: '한로로' },
    { rank: 9, title: 'SPAGHETTI', artist: 'LE SSERAFIM/j-hope' },
    { rank: 10, title: '멸종위기사랑', artist: '이찬혁' },
  ],
  '2026_W06': [
    { rank: 1, title: '그대 작은 나의 세상이 되어', artist: 'Car, the garden' },
    { rank: 2, title: 'Good Goodbye', artist: 'HWASA' },
    { rank: 3, title: '사랑하게 될 거야', artist: '한로로' },
    { rank: 4, title: 'Drowning', artist: 'WOODZ' },
    { rank: 5, title: '타임캡슐', artist: 'DAVICHI' },
    { rank: 6, title: 'Blue Valentine', artist: 'NMIXX' },
    { rank: 7, title: '0+0', artist: '한로로' },
    { rank: 8, title: 'Golden', artist: 'KPop Demon Hunters' },
    { rank: 9, title: '멸종위기사랑', artist: '이찬혁' },
    { rank: 10, title: 'SPAGHETTI', artist: 'LE SSERAFIM/j-hope' },
  ],
  '2026_W07': [
    { rank: 1, title: '404 (New Era)', artist: 'KiiiKiii' },
    { rank: 2, title: 'Good Goodbye', artist: 'HWASA' },
    { rank: 3, title: '그대 작은 나의 세상이 되어', artist: 'Car, the garden' },
    { rank: 4, title: '사랑하게 될 거야', artist: '한로로' },
    { rank: 5, title: 'Drowning', artist: 'WOODZ' },
    { rank: 6, title: 'BANG BANG', artist: 'IVE' },
    { rank: 7, title: '타임캡슐', artist: 'DAVICHI' },
    { rank: 8, title: 'Blue Valentine', artist: 'NMIXX' },
    { rank: 9, title: '0+0', artist: '한로로' },
    { rank: 10, title: 'Golden', artist: 'KPop Demon Hunters' },
  ],
  '2026_W08': [
    { rank: 1, title: '404 (New Era)', artist: 'KiiiKiii' },
    { rank: 2, title: 'BANG BANG', artist: 'IVE' },
    { rank: 3, title: 'Good Goodbye', artist: 'HWASA' },
    { rank: 4, title: '그대 작은 나의 세상이 되어', artist: 'Car, the garden' },
    { rank: 5, title: '사랑하게 될 거야', artist: '한로로' },
    { rank: 6, title: 'Drowning', artist: 'WOODZ' },
    { rank: 7, title: '타임캡슐', artist: 'DAVICHI' },
    { rank: 8, title: 'Blue Valentine', artist: 'NMIXX' },
    { rank: 9, title: '0+0', artist: '한로로' },
    { rank: 10, title: 'Golden', artist: 'KPop Demon Hunters' },
  ],
  '2026_W09': [
    { rank: 1, title: 'BANG BANG', artist: 'IVE' },
    { rank: 2, title: '404 (New Era)', artist: 'KiiiKiii' },
    { rank: 3, title: 'Good Goodbye', artist: 'HWASA' },
    { rank: 4, title: '사랑하게 될 거야', artist: '한로로' },
    { rank: 5, title: '그대 작은 나의 세상이 되어', artist: 'Car, the garden' },
    { rank: 6, title: 'Drowning', artist: 'WOODZ' },
    { rank: 7, title: '타임캡슐', artist: 'DAVICHI' },
    { rank: 8, title: '0+0', artist: '한로로' },
    { rank: 9, title: 'Blue Valentine', artist: 'NMIXX' },
    { rank: 10, title: 'Golden', artist: 'KPop Demon Hunters' },
  ],
}

export function getChartData(source, weekId) {
  if (source === 'qq') return QQ_KOREAN[weekId] || []
  if (source === 'melon') return QQ_MELON[weekId] || []
  return []
}

// 아티스트/곡명 검색
export function searchCharts(query, source) {
  const q = query.toLowerCase().trim()
  if (!q) return []
  const data = source === 'qq' ? QQ_KOREAN : QQ_MELON
  const results = []
  for (const [weekId, songs] of Object.entries(data)) {
    const week = WEEKS.find(w => w.id === weekId)
    for (const song of songs) {
      if (song.title.toLowerCase().includes(q) || song.artist.toLowerCase().includes(q)) {
        results.push({ ...song, weekId, weekLabel: week?.label })
      }
    }
  }
  return results
}
