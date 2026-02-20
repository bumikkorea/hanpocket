// ─── 한국어 교육 시스템 ───
// 6세션 (6개월), 평일 매일, TOPIK 3급 목표

export const levels = [
  { id: 'beginner', label: { ko: '입문 (한글부터)', zh: '入门（从韩文字母开始）', en: 'Beginner (from alphabet)' }, topik: '0' },
  { id: 'elementary', label: { ko: '초급 (기본 인사 가능)', zh: '初级（能基本打招呼）', en: 'Elementary (basic greetings)' }, topik: '1' },
  { id: 'intermediate', label: { ko: '중급 (일상 대화 가능)', zh: '中级（能日常对话）', en: 'Intermediate (daily conversation)' }, topik: '2-3' },
];

export const sessions = [
  {
    id: 0,
    title: { ko: '한글 기초', zh: '韩文基础', en: 'Hangul Basics' },
    subtitle: { ko: '읽기·쓰기·발음의 첫걸음', zh: '读写发音第一步', en: 'First steps in reading, writing & pronunciation' },
    weeks: 2,
    days: 10,
    icon: '🔤',
    color: 'from-violet-500 to-purple-600',
    topikLevel: '0',
    units: [
      { day: 1, title: { ko: '모음 ㅏㅓㅗㅜㅡㅣ', zh: '元音 ㅏㅓㅗㅜㅡㅣ', en: 'Vowels ㅏㅓㅗㅜㅡㅣ' } },
      { day: 2, title: { ko: '자음 ㄱㄴㄷㄹㅁ', zh: '辅音 ㄱㄴㄷㄹㅁ', en: 'Consonants ㄱㄴㄷㄹㅁ' } },
      { day: 3, title: { ko: '자음 ㅂㅅㅇㅈㅎ', zh: '辅音 ㅂㅅㅇㅈㅎ', en: 'Consonants ㅂㅅㅇㅈㅎ' } },
      { day: 4, title: { ko: '쌍자음 ㄲㄸㅃㅆㅉ', zh: '双辅音 ㄲㄸㅃㅆㅉ', en: 'Double consonants' } },
      { day: 5, title: { ko: '복합모음 ㅐㅔㅘㅙㅚ', zh: '复合元音 ㅐㅔㅘㅙㅚ', en: 'Compound vowels' } },
      { day: 6, title: { ko: '받침 (종성)', zh: '收音（终声）', en: 'Final consonants (받침)' } },
      { day: 7, title: { ko: '음절 조합 연습', zh: '音节组合练习', en: 'Syllable combination practice' } },
      { day: 8, title: { ko: '간단한 단어 읽기', zh: '简单单词阅读', en: 'Reading simple words' } },
      { day: 9, title: { ko: '인사말 배우기', zh: '学习问候语', en: 'Learning greetings' } },
      { day: 10, title: { ko: '🏆 한글 마스터 테스트', zh: '🏆 韩文字母测试', en: '🏆 Hangul Master Test' } },
    ],
  },
  {
    id: 1,
    title: { ko: '생존 기본', zh: '生存基础', en: 'Survival Basics' },
    subtitle: { ko: '숫자, 시간, 교통, 기본 표현', zh: '数字、时间、交通、基本表达', en: 'Numbers, time, transport, basic expressions' },
    weeks: 4,
    days: 20,
    icon: '🌱',
    color: 'from-green-500 to-emerald-600',
    topikLevel: '1',
    units: [
      { day: 1, title: { ko: '자기소개 하기', zh: '自我介绍', en: 'Self-introduction' } },
      { day: 2, title: { ko: '숫자 1-100 (한자어)', zh: '数字 1-100（汉字词）', en: 'Numbers 1-100 (Sino-Korean)' } },
      { day: 3, title: { ko: '숫자 하나-열 (고유어)', zh: '数字 一-十（固有词）', en: 'Numbers 1-10 (Native Korean)' } },
      { day: 4, title: { ko: '시간 말하기', zh: '表达时间', en: 'Telling time' } },
      { day: 5, title: { ko: '요일과 날짜', zh: '星期和日期', en: 'Days and dates' } },
      { day: 6, title: { ko: '지하철 타기', zh: '乘地铁', en: 'Taking the subway' } },
      { day: 7, title: { ko: '버스 타기', zh: '乘公交', en: 'Taking the bus' } },
      { day: 8, title: { ko: '택시 타기', zh: '乘出租车', en: 'Taking a taxi' } },
      { day: 9, title: { ko: '길 묻기', zh: '问路', en: 'Asking directions' } },
      { day: 10, title: { ko: '🏆 중간 테스트', zh: '🏆 期中测试', en: '🏆 Mid Test' } },
      { day: 11, title: { ko: '감사·사과 표현', zh: '感谢·道歉表达', en: 'Thanks & apologies' } },
      { day: 12, title: { ko: '부탁하기·거절하기', zh: '请求·拒绝', en: 'Requests & declining' } },
      { day: 13, title: { ko: '날씨 이야기', zh: '谈论天气', en: 'Talking about weather' } },
      { day: 14, title: { ko: '전화 기본 표현', zh: '电话基本表达', en: 'Basic phone expressions' } },
      { day: 15, title: { ko: '긴급 상황 표현', zh: '紧急情况表达', en: 'Emergency expressions' } },
      { day: 16, title: { ko: '배달 주문하기', zh: '外卖点餐', en: 'Ordering delivery' } },
      { day: 17, title: { ko: '가격 묻고 계산하기', zh: '问价格结账', en: 'Asking prices & paying' } },
      { day: 18, title: { ko: '위치 표현 (위/아래/옆)', zh: '位置表达（上/下/旁）', en: 'Location expressions' } },
      { day: 19, title: { ko: '기본 형용사 20개', zh: '基本形容词20个', en: '20 basic adjectives' } },
      { day: 20, title: { ko: '🏆 세션1 최종 테스트', zh: '🏆 Session 1 最终测试', en: '🏆 Session 1 Final Test' } },
    ],
  },
  {
    id: 2,
    title: { ko: '일상생활', zh: '日常生活', en: 'Daily Life' },
    subtitle: { ko: '쇼핑, 식당, 카페에서 자유롭게', zh: '在商店、餐厅、咖啡馆自由交流', en: 'Shopping, restaurants, cafes' },
    weeks: 4,
    days: 20,
    icon: '☕',
    color: 'from-amber-500 to-orange-600',
    topikLevel: '1-2',
    units: [
      { day: 1, title: { ko: '편의점에서', zh: '在便利店', en: 'At the convenience store' } },
      { day: 2, title: { ko: '슈퍼마켓 장보기', zh: '超市购物', en: 'Grocery shopping' } },
      { day: 3, title: { ko: '옷 가게에서', zh: '在服装店', en: 'At the clothing store' } },
      { day: 4, title: { ko: '교환/환불하기', zh: '换货/退款', en: 'Exchange & refund' } },
      { day: 5, title: { ko: '🗺️ 미니맵: 슈퍼마켓', zh: '🗺️ 迷你地图：超市', en: '🗺️ Minimap: Supermarket' }, minimap: 'supermarket' },
      { day: 6, title: { ko: '카페에서 주문하기', zh: '在咖啡馆点单', en: 'Ordering at a cafe' } },
      { day: 7, title: { ko: '식당 예약·주문', zh: '餐厅预约·点餐', en: 'Restaurant reservation & ordering' } },
      { day: 8, title: { ko: '맛 표현하기', zh: '表达味道', en: 'Describing tastes' } },
      { day: 9, title: { ko: '계산·영수증', zh: '结账·收据', en: 'Payment & receipts' } },
      { day: 10, title: { ko: '🗺️ 미니맵: 카페', zh: '🗺️ 迷你地图：咖啡馆', en: '🗺️ Minimap: Cafe' }, minimap: 'cafe' },
      { day: 11, title: { ko: '집 청소·세탁', zh: '打扫·洗衣', en: 'Cleaning & laundry' } },
      { day: 12, title: { ko: '택배 받기·보내기', zh: '收发快递', en: 'Sending & receiving packages' } },
      { day: 13, title: { ko: '인터넷·와이파이', zh: '网络·WiFi', en: 'Internet & WiFi' } },
      { day: 14, title: { ko: '한국 앱 사용법', zh: '韩国APP使用方法', en: 'Using Korean apps' } },
      { day: 15, title: { ko: '🏆 중간 테스트', zh: '🏆 期中测试', en: '🏆 Mid Test' } },
      { day: 16, title: { ko: '약속 잡기', zh: '约定见面', en: 'Making appointments' } },
      { day: 17, title: { ko: '감정 표현하기', zh: '表达感情', en: 'Expressing emotions' } },
      { day: 18, title: { ko: '한국 문화 에티켓', zh: '韩国文化礼仪', en: 'Korean cultural etiquette' } },
      { day: 19, title: { ko: '반말과 존댓말', zh: '半语和敬语', en: 'Casual vs. formal speech' } },
      { day: 20, title: { ko: '🏆 세션2 최종 테스트', zh: '🏆 Session 2 最终测试', en: '🏆 Session 2 Final Test' } },
    ],
  },
  {
    id: 3,
    title: { ko: '공공기관', zh: '公共机构', en: 'Public Services' },
    subtitle: { ko: '동사무소, 은행, 병원 정복하기', zh: '征服行政中心、银行、医院', en: 'Government office, bank, hospital' },
    weeks: 4,
    days: 20,
    icon: '🏢',
    color: 'from-blue-500 to-cyan-600',
    topikLevel: '2',
    units: [
      { day: 1, title: { ko: '동사무소: 전입신고', zh: '行政中心：迁入申报', en: 'Community center: Address registration' } },
      { day: 2, title: { ko: '동사무소: 서류 발급', zh: '行政中心：文件发放', en: 'Community center: Document issuance' } },
      { day: 3, title: { ko: '동사무소: 번호표·대기', zh: '行政中心：取号·等待', en: 'Community center: Queue & waiting' } },
      { day: 4, title: { ko: '동사무소: 질문하기', zh: '行政中心：提问', en: 'Community center: Asking questions' } },
      { day: 5, title: { ko: '🗺️ 미니맵: 동사무소', zh: '🗺️ 迷你地图：行政中心', en: '🗺️ Minimap: Community Center' }, minimap: 'office' },
      { day: 6, title: { ko: '병원: 접수하기', zh: '医院：挂号', en: 'Hospital: Registration' } },
      { day: 7, title: { ko: '병원: 증상 설명하기', zh: '医院：描述症状', en: 'Hospital: Describing symptoms' } },
      { day: 8, title: { ko: '약국에서', zh: '在药房', en: 'At the pharmacy' } },
      { day: 9, title: { ko: '병원: 보험 처리', zh: '医院：保险处理', en: 'Hospital: Insurance' } },
      { day: 10, title: { ko: '🗺️ 미니맵: 병원', zh: '🗺️ 迷你地图：医院', en: '🗺️ Minimap: Hospital' }, minimap: 'hospital' },
      { day: 11, title: { ko: '은행: 계좌 개설', zh: '银行：开户', en: 'Bank: Opening an account' } },
      { day: 12, title: { ko: '은행: 송금하기', zh: '银行：汇款', en: 'Bank: Money transfer' } },
      { day: 13, title: { ko: '은행: ATM 사용', zh: '银行：ATM使用', en: 'Bank: Using ATM' } },
      { day: 14, title: { ko: '은행: 환전·카드', zh: '银行：换汇·银行卡', en: 'Bank: Exchange & cards' } },
      { day: 15, title: { ko: '🗺️ 미니맵: 은행', zh: '🗺️ 迷你地图：银行', en: '🗺️ Minimap: Bank' }, minimap: 'bank' },
      { day: 16, title: { ko: '출입국관리사무소', zh: '出入境管理局', en: 'Immigration office' } },
      { day: 17, title: { ko: '비자 연장 대화', zh: '签证延期对话', en: 'Visa extension conversation' } },
      { day: 18, title: { ko: '경찰서: 분실신고', zh: '警察局：失物报案', en: 'Police: Lost items report' } },
      { day: 19, title: { ko: '우체국에서', zh: '在邮局', en: 'At the post office' } },
      { day: 20, title: { ko: '🏆 세션3 최종 테스트', zh: '🏆 Session 3 最终测试', en: '🏆 Session 3 Final Test' } },
    ],
  },
  {
    id: 4,
    title: { ko: '직장과 학교', zh: '职场与学校', en: 'Work & School' },
    subtitle: { ko: '비즈니스 한국어와 학교생활', zh: '商务韩语和学校生活', en: 'Business Korean & campus life' },
    weeks: 4,
    days: 20,
    icon: '💼',
    color: 'from-slate-600 to-gray-700',
    topikLevel: '2-3',
    units: [
      { day: 1, title: { ko: '직장 인사·소개', zh: '职场问候·介绍', en: 'Workplace greetings' } },
      { day: 2, title: { ko: '업무 지시·보고', zh: '工作指示·汇报', en: 'Instructions & reporting' } },
      { day: 3, title: { ko: '회의 참석하기', zh: '参加会议', en: 'Attending meetings' } },
      { day: 4, title: { ko: '이메일 쓰기', zh: '写邮件', en: 'Writing emails' } },
      { day: 5, title: { ko: '전화 업무 표현', zh: '电话工作用语', en: 'Phone business expressions' } },
      { day: 6, title: { ko: '휴가·조퇴 말하기', zh: '请假·早退', en: 'Leave & early departure' } },
      { day: 7, title: { ko: '동료와 점심시간', zh: '和同事午餐', en: 'Lunch with colleagues' } },
      { day: 8, title: { ko: '🗺️ 미니맵: 사무실', zh: '🗺️ 迷你地图：办公室', en: '🗺️ Minimap: Office' }, minimap: 'office_work' },
      { day: 9, title: { ko: '학교 등록·수강신청', zh: '学校注册·选课', en: 'School registration' } },
      { day: 10, title: { ko: '수업 중 표현', zh: '课堂用语', en: 'Classroom expressions' } },
      { day: 11, title: { ko: '시험·과제 이야기', zh: '考试·作业', en: 'Exams & assignments' } },
      { day: 12, title: { ko: '도서관 이용', zh: '图书馆使用', en: 'Using the library' } },
      { day: 13, title: { ko: '동아리·학교 생활', zh: '社团·校园生活', en: 'Clubs & campus life' } },
      { day: 14, title: { ko: '🗺️ 미니맵: 학교', zh: '🗺️ 迷你地图：学校', en: '🗺️ Minimap: School' }, minimap: 'school' },
      { day: 15, title: { ko: '🏆 중간 테스트', zh: '🏆 期中测试', en: '🏆 Mid Test' } },
      { day: 16, title: { ko: '부동산: 집 보기', zh: '房产：看房', en: 'Real estate: Viewing' } },
      { day: 17, title: { ko: '부동산: 계약하기', zh: '房产：签合同', en: 'Real estate: Contract' } },
      { day: 18, title: { ko: '통신사: 유심·요금제', zh: '通信公司：SIM卡·套餐', en: 'Telecom: SIM & plans' } },
      { day: 19, title: { ko: '🗺️ 미니맵: 부동산', zh: '🗺️ 迷你地图：房产', en: '🗺️ Minimap: Real Estate' }, minimap: 'realestate' },
      { day: 20, title: { ko: '🏆 세션4 최종 테스트', zh: '🏆 Session 4 最终测试', en: '🏆 Session 4 Final Test' } },
    ],
  },
  {
    id: 5,
    title: { ko: '심화 한국어', zh: '进阶韩语', en: 'Advanced Korean' },
    subtitle: { ko: '뉴스, 문화, 사회 이해하기', zh: '理解新闻、文化、社会', en: 'News, culture, society' },
    weeks: 4,
    days: 20,
    icon: '📰',
    color: 'from-rose-500 to-pink-600',
    topikLevel: '3',
    units: [
      { day: 1, title: { ko: '뉴스 헤드라인 읽기', zh: '阅读新闻标题', en: 'Reading news headlines' } },
      { day: 2, title: { ko: '사회 이슈 표현', zh: '社会话题表达', en: 'Social issue expressions' } },
      { day: 3, title: { ko: '의견 말하기', zh: '表达意见', en: 'Expressing opinions' } },
      { day: 4, title: { ko: '한국 드라마 표현', zh: '韩剧常用语', en: 'K-drama expressions' } },
      { day: 5, title: { ko: '속담과 관용어', zh: '谚语和惯用语', en: 'Proverbs & idioms' } },
      { day: 6, title: { ko: '한국 음식 문화', zh: '韩国饮食文化', en: 'Korean food culture' } },
      { day: 7, title: { ko: '명절과 기념일', zh: '节日和纪念日', en: 'Holidays & anniversaries' } },
      { day: 8, title: { ko: '한국사 기초 상식', zh: '韩国历史基础', en: 'Basic Korean history' } },
      { day: 9, title: { ko: '🗺️ 미니맵: 문화센터', zh: '🗺️ 迷你地图：文化中心', en: '🗺️ Minimap: Culture Center' }, minimap: 'culture' },
      { day: 10, title: { ko: '🏆 중간 테스트', zh: '🏆 期中测试', en: '🏆 Mid Test' } },
      { day: 11, title: { ko: '편지·감사장 쓰기', zh: '写信·感谢信', en: 'Writing letters' } },
      { day: 12, title: { ko: '면접 준비', zh: '面试准备', en: 'Interview preparation' } },
      { day: 13, title: { ko: '계약서 읽기 기초', zh: '合同阅读基础', en: 'Basic contract reading' } },
      { day: 14, title: { ko: '민원 제기하기', zh: '投诉', en: 'Filing complaints' } },
      { day: 15, title: { ko: '한국 법률 용어 기초', zh: '韩国法律用语基础', en: 'Basic legal terms' } },
      { day: 16, title: { ko: '🗺️ 미니맵: 경찰서', zh: '🗺️ 迷你地图：警察局', en: '🗺️ Minimap: Police Station' }, minimap: 'police' },
      { day: 17, title: { ko: '사회통합프로그램 준비', zh: '社会融合项目准备', en: 'KIIP preparation' } },
      { day: 18, title: { ko: 'TOPIK 문법 정리', zh: 'TOPIK语法整理', en: 'TOPIK grammar review' } },
      { day: 19, title: { ko: 'TOPIK 읽기 전략', zh: 'TOPIK阅读策略', en: 'TOPIK reading strategy' } },
      { day: 20, title: { ko: '🏆 세션5 최종 테스트', zh: '🏆 Session 5 最终测试', en: '🏆 Session 5 Final Test' } },
    ],
  },
  {
    id: 6,
    title: { ko: 'TOPIK 실전', zh: 'TOPIK实战', en: 'TOPIK Practice' },
    subtitle: { ko: '모의시험으로 3급 달성!', zh: '模拟考试达成3级！', en: 'Achieve Level 3 with mock tests!' },
    weeks: 2,
    days: 10,
    icon: '🎯',
    color: 'from-red-500 to-rose-600',
    topikLevel: '3',
    units: [
      { day: 1, title: { ko: 'TOPIK 시험 구조 이해', zh: 'TOPIK考试结构', en: 'TOPIK exam structure' } },
      { day: 2, title: { ko: '듣기 모의시험 1', zh: '听力模拟1', en: 'Listening mock 1' } },
      { day: 3, title: { ko: '읽기 모의시험 1', zh: '阅读模拟1', en: 'Reading mock 1' } },
      { day: 4, title: { ko: '쓰기 연습', zh: '写作练习', en: 'Writing practice' } },
      { day: 5, title: { ko: '🏆 모의 TOPIK 전체', zh: '🏆 全套模拟TOPIK', en: '🏆 Full mock TOPIK' } },
      { day: 6, title: { ko: '취약 파트 집중', zh: '薄弱环节集中', en: 'Focus on weak areas' } },
      { day: 7, title: { ko: '듣기 모의시험 2', zh: '听力模拟2', en: 'Listening mock 2' } },
      { day: 8, title: { ko: '읽기 모의시험 2', zh: '阅读模拟2', en: 'Reading mock 2' } },
      { day: 9, title: { ko: '최종 모의 TOPIK', zh: '最终模拟TOPIK', en: 'Final mock TOPIK' } },
      { day: 10, title: { ko: '🎓 졸업! 수료증 발급', zh: '🎓 毕业！颁发结业证', en: '🎓 Graduation! Certificate' } },
    ],
  },
];

// ─── 미니맵 테마 ───
export const minimaps = {
  supermarket: {
    name: { ko: '🏪 슈퍼마켓', zh: '🏪 超市', en: '🏪 Supermarket' },
    scenes: [
      {
        id: 'buy',
        title: { ko: '물건 사기', zh: '买东西', en: 'Buying items' },
        dialogue: {
          ko: [
            { speaker: 'you', text: '이거 얼마예요?' },
            { speaker: 'staff', text: '3,500원이에요.' },
            { speaker: 'you', text: '카드 돼요?' },
            { speaker: 'staff', text: '네, 됩니다. 여기에 대주세요.' },
          ],
          zh: [
            { speaker: 'you', text: '이거 얼마예요?（这个多少钱？）' },
            { speaker: 'staff', text: '3,500원이에요.（3500韩元。）' },
            { speaker: 'you', text: '카드 돼요?（可以刷卡吗？）' },
            { speaker: 'staff', text: '네, 됩니다. 여기에 대주세요.（可以，请放这里。）' },
          ],
          en: [
            { speaker: 'you', text: '이거 얼마예요? (How much is this?)' },
            { speaker: 'staff', text: '3,500원이에요. (It\'s 3,500 won.)' },
            { speaker: 'you', text: '카드 돼요? (Can I use a card?)' },
            { speaker: 'staff', text: '네, 됩니다. 여기에 대주세요. (Yes, tap here please.)' },
          ],
        },
        quiz: {
          question: { ko: '"이거 얼마예요?"는 무슨 뜻일까요?', zh: '"이거 얼마예요?"是什么意思？', en: 'What does "이거 얼마예요?" mean?' },
          options: {
            ko: ['이것은 뭐예요?', '이거 얼마예요?', '이거 주세요', '어디에 있어요?'],
            zh: ['这是什么？', '这个多少钱？', '请给我这个', '在哪里？'],
            en: ['What is this?', 'How much is this?', 'Give me this', 'Where is it?'],
          },
          answer: 1,
        },
      },
      {
        id: 'bag',
        title: { ko: '봉투 요청', zh: '要袋子', en: 'Asking for a bag' },
        dialogue: {
          ko: [
            { speaker: 'staff', text: '봉투 필요하세요?' },
            { speaker: 'you', text: '네, 하나 주세요.' },
            { speaker: 'staff', text: '100원입니다.' },
          ],
          zh: [
            { speaker: 'staff', text: '봉투 필요하세요?（需要袋子吗？）' },
            { speaker: 'you', text: '네, 하나 주세요.（是的，给我一个。）' },
            { speaker: 'staff', text: '100원입니다.（100韩元。）' },
          ],
          en: [
            { speaker: 'staff', text: '봉투 필요하세요? (Do you need a bag?)' },
            { speaker: 'you', text: '네, 하나 주세요. (Yes, one please.)' },
            { speaker: 'staff', text: '100원입니다. (It\'s 100 won.)' },
          ],
        },
        quiz: {
          question: { ko: '"봉투"는 무엇일까요?', zh: '"봉투"是什么？', en: 'What is "봉투"?' },
          options: { ko: ['영수증', '봉투', '카드', '포인트'], zh: ['收据', '袋子', '银行卡', '积分'], en: ['Receipt', 'Bag', 'Card', 'Points'] },
          answer: 1,
        },
      },
      {
        id: 'refund',
        title: { ko: '교환/환불', zh: '换货/退款', en: 'Exchange/Refund' },
        dialogue: {
          ko: [
            { speaker: 'you', text: '이거 교환하고 싶은데요.' },
            { speaker: 'staff', text: '영수증 있으세요?' },
            { speaker: 'you', text: '네, 여기요.' },
            { speaker: 'staff', text: '같은 제품으로 교환해 드릴게요.' },
          ],
          zh: [
            { speaker: 'you', text: '이거 교환하고 싶은데요.（我想换这个。）' },
            { speaker: 'staff', text: '영수증 있으세요?（有收据吗？）' },
            { speaker: 'you', text: '네, 여기요.（有，在这里。）' },
            { speaker: 'staff', text: '같은 제품으로 교환해 드릴게요.（给您换同款。）' },
          ],
          en: [
            { speaker: 'you', text: '이거 교환하고 싶은데요. (I\'d like to exchange this.)' },
            { speaker: 'staff', text: '영수증 있으세요? (Do you have the receipt?)' },
            { speaker: 'you', text: '네, 여기요. (Yes, here.)' },
            { speaker: 'staff', text: '같은 제품으로 교환해 드릴게요. (I\'ll exchange it for the same item.)' },
          ],
        },
        quiz: {
          question: { ko: '"교환"은 무슨 뜻일까요?', zh: '"교환"是什么意思？', en: 'What does "교환" mean?' },
          options: { ko: ['환불', '교환', '구매', '배달'], zh: ['退款', '换货', '购买', '配送'], en: ['Refund', 'Exchange', 'Purchase', 'Delivery'] },
          answer: 1,
        },
      },
      {
        id: 'points',
        title: { ko: '포인트 적립', zh: '积分', en: 'Points' },
        dialogue: {
          ko: [
            { speaker: 'staff', text: '포인트 카드 있으세요?' },
            { speaker: 'you', text: '전화번호로 적립해 주세요.' },
            { speaker: 'staff', text: '전화번호 말씀해 주세요.' },
            { speaker: 'you', text: '010-1234-5678이요.' },
          ],
          zh: [
            { speaker: 'staff', text: '포인트 카드 있으세요?（有积分卡吗？）' },
            { speaker: 'you', text: '전화번호로 적립해 주세요.（用手机号积分。）' },
            { speaker: 'staff', text: '전화번호 말씀해 주세요.（请说手机号。）' },
            { speaker: 'you', text: '010-1234-5678이요.' },
          ],
          en: [
            { speaker: 'staff', text: '포인트 카드 있으세요? (Do you have a points card?)' },
            { speaker: 'you', text: '전화번호로 적립해 주세요. (Please add points by phone number.)' },
            { speaker: 'staff', text: '전화번호 말씀해 주세요. (Please tell me your number.)' },
            { speaker: 'you', text: '010-1234-5678이요.' },
          ],
        },
        quiz: {
          question: { ko: '"적립"은 무슨 뜻일까요?', zh: '"적립"是什么意思？', en: 'What does "적립" mean?' },
          options: { ko: ['할인', '적립', '결제', '반품'], zh: ['打折', '积累', '支付', '退货'], en: ['Discount', 'Accumulate', 'Payment', 'Return'] },
          answer: 1,
        },
      },
      {
        id: 'find',
        title: { ko: '물건 찾기', zh: '找东西', en: 'Finding items' },
        dialogue: {
          ko: [
            { speaker: 'you', text: '라면이 어디에 있어요?' },
            { speaker: 'staff', text: '3번 통로 오른쪽에 있어요.' },
            { speaker: 'you', text: '감사합니다!' },
          ],
          zh: [
            { speaker: 'you', text: '라면이 어디에 있어요?（方便面在哪里？）' },
            { speaker: 'staff', text: '3번 통로 오른쪽에 있어요.（在3号通道右边。）' },
            { speaker: 'you', text: '감사합니다!（谢谢！）' },
          ],
          en: [
            { speaker: 'you', text: '라면이 어디에 있어요? (Where is the ramen?)' },
            { speaker: 'staff', text: '3번 통로 오른쪽에 있어요. (In aisle 3, on the right.)' },
            { speaker: 'you', text: '감사합니다! (Thank you!)' },
          ],
        },
        quiz: {
          question: { ko: '"어디에 있어요?"는 무슨 뜻일까요?', zh: '"어디에 있어요?"是什么意思？', en: 'What does "어디에 있어요?" mean?' },
          options: { ko: ['얼마예요?', '뭐예요?', '어디에 있어요?', '언제 와요?'], zh: ['多少钱？', '是什么？', '在哪里？', '什么时候来？'], en: ['How much?', 'What is it?', 'Where is it?', 'When does it come?'] },
          answer: 2,
        },
      },
    ],
  },
  cafe: {
    name: { ko: '☕ 카페', zh: '☕ 咖啡馆', en: '☕ Cafe' },
    scenes: [
      {
        id: 'order',
        title: { ko: '주문하기', zh: '点单', en: 'Ordering' },
        dialogue: {
          ko: [
            { speaker: 'staff', text: '어서오세요~ 주문하시겠어요?' },
            { speaker: 'you', text: '아메리카노 한 잔 주세요.' },
            { speaker: 'staff', text: '아이스? 핫?' },
            { speaker: 'you', text: '아이스요. 사이즈는 큰 걸로요.' },
            { speaker: 'staff', text: '4,500원입니다.' },
          ],
          zh: [
            { speaker: 'staff', text: '어서오세요~ 주문하시겠어요?（欢迎～要点单吗？）' },
            { speaker: 'you', text: '아메리카노 한 잔 주세요.（请给我一杯美式。）' },
            { speaker: 'staff', text: '아이스? 핫?（冰的？热的？）' },
            { speaker: 'you', text: '아이스요. 사이즈는 큰 걸로요.（冰的，大杯。）' },
            { speaker: 'staff', text: '4,500원입니다.（4500韩元。）' },
          ],
          en: [
            { speaker: 'staff', text: '어서오세요~ 주문하시겠어요? (Welcome~ Ready to order?)' },
            { speaker: 'you', text: '아메리카노 한 잔 주세요. (One Americano please.)' },
            { speaker: 'staff', text: '아이스? 핫? (Iced? Hot?)' },
            { speaker: 'you', text: '아이스요. 사이즈는 큰 걸로요. (Iced. Large size.)' },
            { speaker: 'staff', text: '4,500원입니다. (That\'s 4,500 won.)' },
          ],
        },
        quiz: {
          question: { ko: '"한 잔"은 몇 잔일까요?', zh: '"한 잔"是几杯？', en: 'How many cups is "한 잔"?' },
          options: { ko: ['2잔', '1잔', '3잔', '반 잔'], zh: ['2杯', '1杯', '3杯', '半杯'], en: ['2 cups', '1 cup', '3 cups', 'Half cup'] },
          answer: 1,
        },
      },
      {
        id: 'here_togo',
        title: { ko: '매장/포장', zh: '堂食/打包', en: 'Dine-in/Take-out' },
        dialogue: {
          ko: [
            { speaker: 'staff', text: '드시고 가세요? 가져가세요?' },
            { speaker: 'you', text: '여기서 먹을게요.' },
            { speaker: 'staff', text: '진동벨 드릴게요. 번호 나오면 가져가세요.' },
          ],
          zh: [
            { speaker: 'staff', text: '드시고 가세요? 가져가세요?（在这里吃还是带走？）' },
            { speaker: 'you', text: '여기서 먹을게요.（在这里吃。）' },
            { speaker: 'staff', text: '진동벨 드릴게요.（给您震动铃。）' },
          ],
          en: [
            { speaker: 'staff', text: '드시고 가세요? 가져가세요? (Dine in or take out?)' },
            { speaker: 'you', text: '여기서 먹을게요. (I\'ll eat here.)' },
            { speaker: 'staff', text: '진동벨 드릴게요. (Here\'s your buzzer.)' },
          ],
        },
        quiz: {
          question: { ko: '"가져가세요"는 무슨 뜻?', zh: '"가져가세요"什么意思？', en: 'What does "가져가세요" mean?' },
          options: { ko: ['여기서 드세요', '가져가세요', '버리세요', '기다리세요'], zh: ['在这里吃', '带走', '扔掉', '等一下'], en: ['Eat here', 'Take out', 'Throw away', 'Wait'] },
          answer: 1,
        },
      },
      {
        id: 'wifi',
        title: { ko: 'Wi-Fi 묻기', zh: '问WiFi', en: 'Asking for WiFi' },
        dialogue: {
          ko: [
            { speaker: 'you', text: '와이파이 비밀번호가 뭐예요?' },
            { speaker: 'staff', text: '영수증에 적혀 있어요.' },
            { speaker: 'you', text: '아, 감사합니다!' },
          ],
          zh: [
            { speaker: 'you', text: '와이파이 비밀번호가 뭐예요?（WiFi密码是什么？）' },
            { speaker: 'staff', text: '영수증에 적혀 있어요.（写在收据上。）' },
            { speaker: 'you', text: '아, 감사합니다!（啊，谢谢！）' },
          ],
          en: [
            { speaker: 'you', text: '와이파이 비밀번호가 뭐예요? (What\'s the WiFi password?)' },
            { speaker: 'staff', text: '영수증에 적혀 있어요. (It\'s on the receipt.)' },
            { speaker: 'you', text: '아, 감사합니다! (Oh, thank you!)' },
          ],
        },
        quiz: {
          question: { ko: '"비밀번호"는?', zh: '"비밀번호"是？', en: 'What is "비밀번호"?' },
          options: { ko: ['이름', '비밀번호', '전화번호', '주소'], zh: ['名字', '密码', '电话号码', '地址'], en: ['Name', 'Password', 'Phone number', 'Address'] },
          answer: 1,
        },
      },
      {
        id: 'extra',
        title: { ko: '추가 요청', zh: '追加要求', en: 'Extra requests' },
        dialogue: {
          ko: [
            { speaker: 'you', text: '샷 추가해 주세요.' },
            { speaker: 'staff', text: '500원 추가됩니다.' },
            { speaker: 'you', text: '네, 괜찮아요.' },
          ],
          zh: [
            { speaker: 'you', text: '샷 추가해 주세요.（请加一份浓缩。）' },
            { speaker: 'staff', text: '500원 추가됩니다.（加500韩元。）' },
            { speaker: 'you', text: '네, 괜찮아요.（好的，没关系。）' },
          ],
          en: [
            { speaker: 'you', text: '샷 추가해 주세요. (Add an extra shot please.)' },
            { speaker: 'staff', text: '500원 추가됩니다. (That\'s 500 won extra.)' },
            { speaker: 'you', text: '네, 괜찮아요. (Yes, that\'s fine.)' },
          ],
        },
        quiz: {
          question: { ko: '"추가"는?', zh: '"추가"是？', en: 'What is "추가"?' },
          options: { ko: ['빼기', '추가', '변경', '취소'], zh: ['减少', '追加', '变更', '取消'], en: ['Remove', 'Add', 'Change', 'Cancel'] },
          answer: 1,
        },
      },
      {
        id: 'pay',
        title: { ko: '계산하기', zh: '结账', en: 'Paying' },
        dialogue: {
          ko: [
            { speaker: 'you', text: '계산이요.' },
            { speaker: 'staff', text: '카드요? 현금이요?' },
            { speaker: 'you', text: '카카오페이로 할게요.' },
            { speaker: 'staff', text: 'QR코드 찍어주세요.' },
          ],
          zh: [
            { speaker: 'you', text: '계산이요.（结账。）' },
            { speaker: 'staff', text: '카드요? 현금이요?（刷卡？现金？）' },
            { speaker: 'you', text: '카카오페이로 할게요.（用KakaoPay。）' },
            { speaker: 'staff', text: 'QR코드 찍어주세요.（请扫二维码。）' },
          ],
          en: [
            { speaker: 'you', text: '계산이요. (Check please.)' },
            { speaker: 'staff', text: '카드요? 현금이요? (Card or cash?)' },
            { speaker: 'you', text: '카카오페이로 할게요. (I\'ll use KakaoPay.)' },
            { speaker: 'staff', text: 'QR코드 찍어주세요. (Please scan the QR code.)' },
          ],
        },
        quiz: {
          question: { ko: '"계산"은?', zh: '"계산"是？', en: 'What is "계산"?' },
          options: { ko: ['주문', '계산', '예약', '배달'], zh: ['点单', '结账', '预约', '配送'], en: ['Order', 'Payment', 'Reservation', 'Delivery'] },
          answer: 1,
        },
      },
    ],
  },
};

// ─── 게이미피케이션 ───
export const xpRules = {
  dailyLogin: 10,
  quizCorrect: 5,
  quizWrong: 1,
  lessonComplete: 15,
  minimapComplete: 50,
  streakBonus7: 100,
  streakBonus30: 500,
  sessionComplete: 200,
};

export const levelTitles = {
  ko: ['여행자', '초보자', '거주자', '적응러', '현지인', '한국통', '달인', '마스터'],
  zh: ['旅行者', '初学者', '居住者', '适应者', '本地人', '韩国通', '达人', '大师'],
  en: ['Traveler', 'Beginner', 'Resident', 'Adapted', 'Local', 'Korea Expert', 'Master', 'Grandmaster'],
};

export function getLevelFromXp(xp) {
  if (xp < 100) return 0
  if (xp < 300) return 1
  if (xp < 600) return 2
  if (xp < 1000) return 3
  if (xp < 1500) return 4
  if (xp < 2200) return 5
  if (xp < 3000) return 6
  return 7
}

export function getNextLevelXp(level) {
  return [100, 300, 600, 1000, 1500, 2200, 3000, 9999][level] || 9999
}
