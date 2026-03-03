// 한국어 게임 학습 데이터 — Chapter 1: 공항 도착 (3 레슨)
export const CHAPTERS = [
  {
    id: 'airport',
    name: { ko: '공항 도착', zh: '机场到达', en: 'Airport Arrival' },
    gradient: 'from-sky-400 to-blue-500',
    lessons: [
      {
        id: 'immigration',
        name: { ko: '입국심사', zh: '入境审查', en: 'Immigration' },
        questions: [
          {
            type: 'multiple-choice',
            question: { zh: '"旅游目的是什么？" 用韩语怎么说？', en: 'How do you say "What is the purpose of your visit?" in Korean?' },
            options: [
              { text: '여행 목적이 뭐예요?', correct: true },
              { text: '어디에서 왔어요?', correct: false },
              { text: '얼마나 있을 거예요?', correct: false },
              { text: '호텔이 어디예요?', correct: false },
            ],
            explanation: { zh: '여행(旅行) + 목적(目的) + 이(是) + 뭐예요(什么)', en: 'Travel + purpose + is + what' },
            xp: 10,
          },
          {
            type: 'multiple-choice',
            question: { zh: '"观光" 的韩语是？', en: 'What is "sightseeing" in Korean?' },
            options: [
              { text: '관광', correct: true },
              { text: '출장', correct: false },
              { text: '유학', correct: false },
              { text: '방문', correct: false },
            ],
            explanation: { zh: '관광 = 观光/旅游, 출장 = 出差, 유학 = 留学, 방문 = 访问', en: 'Sightseeing, business trip, studying abroad, visit' },
            xp: 10,
          },
          {
            type: 'word-arrange',
            question: { zh: '请排列正确的韩语语序：', en: 'Arrange the correct Korean word order:' },
            words: ['관광', '왔어요', '하러'],
            answer: ['관광', '하러', '왔어요'],
            translation: { zh: '我来观光的', en: 'I came for sightseeing' },
            xp: 15,
          },
          {
            type: 'multiple-choice',
            question: { zh: '入境审查官问 "몇 일 있을 거예요?" 是什么意思？', en: 'What does the officer mean by "몇 일 있을 거예요?"' },
            options: [
              { text: { zh: '你要待几天？', en: 'How many days will you stay?' }, correct: true },
              { text: { zh: '你住在哪里？', en: 'Where do you live?' }, correct: false },
              { text: { zh: '你来过韩国吗？', en: 'Have you been to Korea?' }, correct: false },
              { text: { zh: '你的职业是什么？', en: 'What is your occupation?' }, correct: false },
            ],
            xp: 10,
          },
          {
            type: 'fill-blank',
            question: { zh: '"___天" (3天)', en: '"___ days" (3 days)' },
            sentence: '___ 일',
            answer: '삼',
            hint: { zh: '三 = 삼 (sam)', en: 'Three = 삼 (sam)' },
            xp: 10,
          },
          {
            type: 'multiple-choice',
            question: { zh: '如果审查官说 "여권 보여주세요", 你应该？', en: 'If the officer says "여권 보여주세요", what should you do?' },
            options: [
              { text: { zh: '出示护照', en: 'Show passport' }, correct: true },
              { text: { zh: '出示机票', en: 'Show ticket' }, correct: false },
              { text: { zh: '填写表格', en: 'Fill out form' }, correct: false },
              { text: { zh: '打开行李', en: 'Open luggage' }, correct: false },
            ],
            explanation: { zh: '여권(护照) + 보여주세요(请给我看)', en: 'Passport + please show me' },
            xp: 10,
          },
          {
            type: 'word-arrange',
            question: { zh: '排列："我要待5天"', en: 'Arrange: "I will stay 5 days"' },
            words: ['있을', '오', '거예요', '일'],
            answer: ['오', '일', '있을', '거예요'],
            translation: { zh: '我要待5天', en: 'I will stay 5 days' },
            xp: 15,
          },
        ],
      },
      {
        id: 'taxi-bus',
        name: { ko: '택시와 버스', zh: '出租车和巴士', en: 'Taxi & Bus' },
        questions: [
          {
            type: 'multiple-choice',
            question: { zh: '"明洞多少钱？" 用韩语？', en: '"How much to Myeongdong?" in Korean?' },
            options: [
              { text: '명동까지 얼마예요?', correct: true },
              { text: '명동이 어디예요?', correct: false },
              { text: '명동에 가주세요', correct: false },
              { text: '명동은 멀어요?', correct: false },
            ],
            explanation: { zh: '명동(明洞) + 까지(到) + 얼마예요(多少钱)', en: 'Myeongdong + to + how much' },
            xp: 10,
          },
          {
            type: 'multiple-choice',
            question: { zh: '上出租车后第一句话通常说？', en: 'First thing to say after getting in a taxi?' },
            options: [
              { text: '○○까지 가주세요', correct: true },
              { text: '안녕하세요', correct: false },
              { text: '감사합니다', correct: false },
              { text: '얼마예요?', correct: false },
            ],
            explanation: { zh: '○○까지(到○○) + 가주세요(请去)', en: '○○ + please go to' },
            xp: 10,
          },
          {
            type: 'word-arrange',
            question: { zh: '排列："请到这个地址"', en: 'Arrange: "Please go to this address"' },
            words: ['가주세요', '이', '주소로'],
            answer: ['이', '주소로', '가주세요'],
            translation: { zh: '请到这个地址', en: 'Please go to this address' },
            xp: 15,
          },
          {
            type: 'fill-blank',
            question: { zh: '"请在这里停车" = "여기서 ___"', en: '"Please stop here" = "여기서 ___"' },
            sentence: '여기서 ___',
            answer: '세워주세요',
            hint: { zh: '세워주세요 = 请停', en: 'Please stop' },
            xp: 10,
          },
          {
            type: 'multiple-choice',
            question: { zh: '"카드 돼요?" 是什么意思？', en: 'What does "카드 돼요?" mean?' },
            options: [
              { text: { zh: '可以刷卡吗？', en: 'Can I pay by card?' }, correct: true },
              { text: { zh: '有折扣吗？', en: 'Is there a discount?' }, correct: false },
              { text: { zh: '到了吗？', en: 'Are we there?' }, correct: false },
              { text: { zh: '收据呢？', en: 'Receipt?' }, correct: false },
            ],
            xp: 10,
          },
          {
            type: 'multiple-choice',
            question: { zh: '在地铁站问路："이 역에서 내려요?" 意思是？', en: 'At subway station: "이 역에서 내려요?" means?' },
            options: [
              { text: { zh: '在这站下车吗？', en: 'Do I get off at this station?' }, correct: true },
              { text: { zh: '这站叫什么？', en: 'What is this station called?' }, correct: false },
              { text: { zh: '还有几站？', en: 'How many stops left?' }, correct: false },
              { text: { zh: '往哪个方向？', en: 'Which direction?' }, correct: false },
            ],
            xp: 10,
          },
          {
            type: 'word-arrange',
            question: { zh: '排列："到弘大要多长时间？"', en: 'Arrange: "How long to Hongdae?"' },
            words: ['홍대까지', '걸려요?', '얼마나'],
            answer: ['홍대까지', '얼마나', '걸려요?'],
            translation: { zh: '到弘大要多长时间？', en: 'How long to Hongdae?' },
            xp: 15,
          },
        ],
      },
      {
        id: 'hotel-checkin',
        name: { ko: '호텔 체크인', zh: '酒店入住', en: 'Hotel Check-in' },
        questions: [
          {
            type: 'multiple-choice',
            question: { zh: '"我有预约" 用韩语？', en: '"I have a reservation" in Korean?' },
            options: [
              { text: '예약했어요', correct: true },
              { text: '방 있어요?', correct: false },
              { text: '체크인이요', correct: false },
              { text: '여기 처음이에요', correct: false },
            ],
            explanation: { zh: '예약(预约) + 했어요(做了)', en: 'Reservation + did' },
            xp: 10,
          },
          {
            type: 'multiple-choice',
            question: { zh: '前台说 "신분증 보여주세요", 意思是？', en: 'Front desk says "신분증 보여주세요", meaning?' },
            options: [
              { text: { zh: '请出示身份证/护照', en: 'Please show your ID/passport' }, correct: true },
              { text: { zh: '请签名', en: 'Please sign' }, correct: false },
              { text: { zh: '请付款', en: 'Please pay' }, correct: false },
              { text: { zh: '请填表', en: 'Please fill out form' }, correct: false },
            ],
            xp: 10,
          },
          {
            type: 'fill-blank',
            question: { zh: '"请给我Wi-Fi密码" = "와이파이 ___ 알려주세요"', en: '"Please tell me Wi-Fi password" = "와이파이 ___ 알려주세요"' },
            sentence: '와이파이 ___ 알려주세요',
            answer: '비밀번호',
            hint: { zh: '비밀번호 = 密码', en: 'Password' },
            xp: 10,
          },
          {
            type: 'word-arrange',
            question: { zh: '排列："请帮我叫出租车"', en: 'Arrange: "Please call a taxi for me"' },
            words: ['불러주세요', '택시', '좀'],
            answer: ['택시', '좀', '불러주세요'],
            translation: { zh: '请帮我叫出租车', en: 'Please call a taxi for me' },
            xp: 15,
          },
          {
            type: 'multiple-choice',
            question: { zh: '"체크아웃이 몇 시예요?" 是在问？', en: '"체크아웃이 몇 시예요?" is asking?' },
            options: [
              { text: { zh: '退房时间是几点？', en: 'What time is checkout?' }, correct: true },
              { text: { zh: '入住时间是几点？', en: 'What time is check-in?' }, correct: false },
              { text: { zh: '早餐几点开始？', en: 'What time does breakfast start?' }, correct: false },
              { text: { zh: '房间在几楼？', en: 'What floor is the room?' }, correct: false },
            ],
            xp: 10,
          },
          {
            type: 'multiple-choice',
            question: { zh: '想延迟退房说什么？', en: 'What to say for late checkout?' },
            options: [
              { text: '레이트 체크아웃 가능해요?', correct: true },
              { text: '방 바꿔주세요', correct: false },
              { text: '청소해주세요', correct: false },
              { text: '짐 맡아주세요', correct: false },
            ],
            explanation: { zh: '레이트 체크아웃(延迟退房) + 가능해요?(可以吗)', en: 'Late checkout + is it possible?' },
            xp: 10,
          },
          {
            type: 'fill-blank',
            question: { zh: '"请帮我保管行李" = "___ 맡아주세요"', en: '"Please keep my luggage" = "___ 맡아주세요"' },
            sentence: '___ 맡아주세요',
            answer: '짐',
            hint: { zh: '짐 = 行李', en: 'Luggage/baggage' },
            xp: 10,
          },
        ],
      },
    ],
  },
  {
    id: 'food',
    name: { ko: '맛집 탐방', zh: '美食探索', en: 'Food Adventure' },
    gradient: 'from-orange-400 to-red-500',
    locked: true,
    lessons: [],
  },
  {
    id: 'shopping',
    name: { ko: '쇼핑', zh: '购物', en: 'Shopping' },
    gradient: 'from-pink-400 to-rose-500',
    locked: true,
    lessons: [],
  },
  {
    id: 'transport',
    name: { ko: '교통', zh: '交通', en: 'Transport' },
    gradient: 'from-green-400 to-emerald-500',
    locked: true,
    lessons: [],
  },
  {
    id: 'emergency',
    name: { ko: '긴급 상황', zh: '紧急情况', en: 'Emergency' },
    gradient: 'from-red-400 to-red-600',
    locked: true,
    lessons: [],
  },
]

const STORAGE_KEY = 'hanpocket_korean_game'

export function loadGameState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return defaultState()
    return JSON.parse(raw)
  } catch { return defaultState() }
}

export function saveGameState(state) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
}

function defaultState() {
  return {
    xp: 0,
    level: 1,
    streak: 0,
    lastPlayDate: null,
    hearts: 5,
    lastHeartLoss: null,
    completedLessons: [],
    lessonScores: {},
  }
}

export function xpToLevel(xp) {
  if (xp < 100) return 1
  if (xp < 250) return 2
  if (xp < 500) return 3
  if (xp < 800) return 4
  if (xp < 1200) return 5
  return Math.floor(xp / 250) + 1
}

export function levelXpRange(level) {
  const thresholds = [0, 100, 250, 500, 800, 1200]
  if (level <= 5) {
    return { min: thresholds[level - 1], max: thresholds[level] }
  }
  const min = (level - 1) * 250
  return { min, max: min + 250 }
}

export function recoverHearts(state) {
  if (state.hearts >= 5 || !state.lastHeartLoss) return state
  const elapsed = Date.now() - state.lastHeartLoss
  const recovered = Math.floor(elapsed / (60 * 60 * 1000)) // 1 hour per heart
  if (recovered <= 0) return state
  const newHearts = Math.min(5, state.hearts + recovered)
  return {
    ...state,
    hearts: newHearts,
    lastHeartLoss: newHearts >= 5 ? null : state.lastHeartLoss + recovered * 60 * 60 * 1000,
  }
}

export function updateStreak(state) {
  const today = new Date().toDateString()
  if (state.lastPlayDate === today) return state
  const yesterday = new Date(Date.now() - 86400000).toDateString()
  const isConsecutive = state.lastPlayDate === yesterday
  return {
    ...state,
    streak: isConsecutive ? state.streak + 1 : 1,
    lastPlayDate: today,
  }
}
