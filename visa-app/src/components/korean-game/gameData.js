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
    locked: false,
    lessons: [
      {
        id: 'entering-restaurant',
        name: { ko: '식당 입장', zh: '进餐厅', en: 'Entering a Restaurant' },
        questions: [
          {
            type: 'multiple-choice',
            question: { zh: '服务员问 "몇 명이세요?" 意思是？', en: 'The server asks "몇 명이세요?" What does it mean?' },
            options: [
              { text: { zh: '几位？', en: 'How many people?' }, correct: true },
              { text: { zh: '预约了吗？', en: 'Do you have a reservation?' } },
              { text: { zh: '坐哪里？', en: 'Where to sit?' } },
              { text: { zh: '点什么？', en: 'What to order?' } },
            ],
            xp: 10,
          },
          {
            type: 'multiple-choice',
            question: { zh: '"两个人" 韩语怎么说？', en: 'How do you say "two people" in Korean?' },
            options: [
              { text: '두 명이요', correct: true },
              { text: '두 개요' },
              { text: '이 명이요' },
              { text: '둘이서요' },
            ],
            explanation: { zh: '두(两) + 명(位/人) + 이요(是)', en: 'du(two) + myeong(people) + iyo(is)' },
            xp: 10,
          },
          {
            type: 'word-arrange',
            question: { zh: '排列："请给我菜单"', en: 'Arrange: "Please give me the menu"' },
            words: ['주세요', '메뉴', '좀'],
            answer: ['메뉴', '좀', '주세요'],
            translation: { zh: '请给我菜单', en: 'Please give me the menu' },
            xp: 15,
          },
          {
            type: 'fill-blank',
            question: { zh: '"请等一下" = "잠깐 ___"', en: '"Please wait a moment" = "잠깐 ___"' },
            sentence: '잠깐 ___',
            answer: '기다려주세요',
            hint: { zh: '기다려주세요 = 请等', en: 'Please wait' },
            xp: 10,
          },
          {
            type: 'multiple-choice',
            question: { zh: '"자리 있어요?" 是在问？', en: '"자리 있어요?" is asking?' },
            options: [
              { text: { zh: '有座位吗？', en: 'Are there seats available?' }, correct: true },
              { text: { zh: '可以坐这里吗？', en: 'Can I sit here?' } },
              { text: { zh: '几点关门？', en: 'What time do you close?' } },
              { text: { zh: '要排队吗？', en: 'Do I need to wait in line?' } },
            ],
            xp: 10,
          },
          {
            type: 'multiple-choice',
            question: { zh: '想坐窗边说？', en: 'How to ask for a window seat?' },
            options: [
              { text: '창가 자리로 주세요', correct: true },
              { text: '화장실 어디예요?' },
              { text: '메뉴 주세요' },
              { text: '예약했어요' },
            ],
            explanation: { zh: '창가(窗边) + 자리(座位) + 로(往) + 주세요(请给)', en: 'changga(window) + jari(seat) + ro(to) + juseyo(please give)' },
            xp: 10,
          },
          {
            type: 'word-arrange',
            question: { zh: '排列："要排多久？"', en: 'Arrange: "How long do I have to wait?"' },
            words: ['얼마나', '기다려야', '돼요?'],
            answer: ['얼마나', '기다려야', '돼요?'],
            translation: { zh: '要等多久？', en: 'How long do I have to wait?' },
            xp: 15,
          },
        ],
      },
      {
        id: 'ordering',
        name: { ko: '주문하기', zh: '点餐', en: 'Ordering Food' },
        questions: [
          {
            type: 'multiple-choice',
            question: { zh: '"이거 하나 주세요" 意思是？', en: 'What does "이거 하나 주세요" mean?' },
            options: [
              { text: { zh: '请给我一个这个', en: 'Please give me one of this' }, correct: true },
              { text: { zh: '这个多少钱？', en: 'How much is this?' } },
              { text: { zh: '这个好吃吗？', en: 'Is this delicious?' } },
              { text: { zh: '这个是什么？', en: 'What is this?' } },
            ],
            xp: 10,
          },
          {
            type: 'fill-blank',
            question: { zh: '"请给我两份" = "이거 ___ 주세요"', en: '"Please give me two" = "이거 ___ 주세요"' },
            sentence: '이거 ___ 주세요',
            answer: '두 개',
            hint: { zh: '두 개 = 两个', en: 'du gae = two items' },
            xp: 10,
          },
          {
            type: 'multiple-choice',
            question: { zh: '不吃辣想说？', en: 'How to say you don\'t eat spicy food?' },
            options: [
              { text: '안 매운 걸로 주세요', correct: true },
              { text: '많이 주세요' },
              { text: '빨리 주세요' },
              { text: '따뜻한 걸로 주세요' },
            ],
            explanation: { zh: '안 매운(不辣的) + 걸로(选那个) + 주세요(请给)', en: 'an maeun(not spicy) + geollo(that one) + juseyo(please give)' },
            xp: 10,
          },
          {
            type: 'word-arrange',
            question: { zh: '排列："推荐什么？"', en: 'Arrange: "What\'s good here?"' },
            words: ['뭐가', '맛있어요?', '여기서'],
            answer: ['여기서', '뭐가', '맛있어요?'],
            translation: { zh: '这里什么好吃？', en: 'What\'s delicious here?' },
            xp: 15,
          },
          {
            type: 'multiple-choice',
            question: { zh: '"소주 한 병 주세요" 是点？', en: '"소주 한 병 주세요" is ordering?' },
            options: [
              { text: { zh: '一瓶烧酒', en: 'One bottle of soju' }, correct: true },
              { text: { zh: '一杯啤酒', en: 'One glass of beer' } },
              { text: { zh: '一瓶水', en: 'One bottle of water' } },
              { text: { zh: '一杯可乐', en: 'One glass of cola' } },
            ],
            xp: 10,
          },
          {
            type: 'multiple-choice',
            question: { zh: '服务员说 "드시고 가세요? 포장이요?" 在问？', en: 'The server says "드시고 가세요? 포장이요?" What are they asking?' },
            options: [
              { text: { zh: '堂食还是打包？', en: 'Dine in or takeaway?' }, correct: true },
              { text: { zh: '要加什么？', en: 'What to add?' } },
              { text: { zh: '大份还是小份？', en: 'Large or small?' } },
              { text: { zh: '要不要饮料？', en: 'Do you want a drink?' } },
            ],
            xp: 10,
          },
          {
            type: 'fill-blank',
            question: { zh: '"请再给一份" = "하나 ___ 주세요"', en: '"One more please" = "하나 ___ 주세요"' },
            sentence: '하나 ___ 주세요',
            answer: '더',
            hint: { zh: '더 = 更多/再', en: 'deo = more' },
            xp: 10,
          },
        ],
      },
      {
        id: 'paying',
        name: { ko: '계산하기', zh: '结账', en: 'Paying the Bill' },
        questions: [
          {
            type: 'multiple-choice',
            question: { zh: '"계산이요" 意思是？', en: 'What does "계산이요" mean?' },
            options: [
              { text: { zh: '买单', en: 'Check please' }, correct: true },
              { text: { zh: '打包', en: 'Takeaway' } },
              { text: { zh: '再来一份', en: 'One more' } },
              { text: { zh: '好吃', en: 'Delicious' } },
            ],
            xp: 10,
          },
          {
            type: 'multiple-choice',
            question: { zh: '想分开付款说？', en: 'How to ask to pay separately?' },
            options: [
              { text: '따로따로 계산해주세요', correct: true },
              { text: '같이 계산해주세요' },
              { text: '현금으로 할게요' },
              { text: '영수증 주세요' },
            ],
            explanation: { zh: '따로따로(各自) + 계산(结算) + 해주세요(请做)', en: 'ttarottaro(separately) + gyesan(payment) + haejuseyo(please do)' },
            xp: 10,
          },
          {
            type: 'word-arrange',
            question: { zh: '排列："可以刷卡吗？"', en: 'Arrange: "Can I pay by card?"' },
            words: ['돼요?', '카드'],
            answer: ['카드', '돼요?'],
            translation: { zh: '可以刷卡吗？', en: 'Can I pay by card?' },
            xp: 15,
          },
          {
            type: 'fill-blank',
            question: { zh: '"请给我收据" = "___ 주세요"', en: '"Please give me a receipt" = "___ 주세요"' },
            sentence: '___ 주세요',
            answer: '영수증',
            hint: { zh: '영수증 = 收据', en: 'yeongsujeung = receipt' },
            xp: 10,
          },
          {
            type: 'multiple-choice',
            question: { zh: '"맛있었어요!" 表达？', en: 'What does "맛있었어요!" express?' },
            options: [
              { text: { zh: '很好吃！（过去式）', en: 'It was delicious! (past tense)' }, correct: true },
              { text: { zh: '很好吃！（现在）', en: 'It\'s delicious! (present)' } },
              { text: { zh: '一般般', en: 'It\'s so-so' } },
              { text: { zh: '不好吃', en: 'Not delicious' } },
            ],
            explanation: { zh: '맛있었어요 = 过去式，表示"吃过了，很好吃"', en: 'massisseosseoyo = past tense, meaning "I ate it and it was delicious"' },
            xp: 10,
          },
          {
            type: 'multiple-choice',
            question: { zh: '结账时店员说 "감사합니다, 또 오세요" 意思？', en: 'The cashier says "감사합니다, 또 오세요". What does it mean?' },
            options: [
              { text: { zh: '谢谢，欢迎再来', en: 'Thank you, please come again' }, correct: true },
              { text: { zh: '请慢走', en: 'Take care' } },
              { text: { zh: '收您XX元', en: 'That will be XX won' } },
              { text: { zh: '需要打包吗', en: 'Do you need a bag?' } },
            ],
            xp: 10,
          },
          {
            type: 'word-arrange',
            question: { zh: '排列："吃得很好，谢谢"', en: 'Arrange: "I ate well, thank you"' },
            words: ['감사합니다', '잘', '먹었습니다'],
            answer: ['잘', '먹었습니다', '감사합니다'],
            translation: { zh: '吃得很好，谢谢', en: 'I ate well, thank you' },
            xp: 15,
          },
        ],
      },
    ],
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
