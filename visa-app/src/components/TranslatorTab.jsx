import { useState, useRef } from 'react'
import { Volume2, Copy, Check, ChevronLeft, Search, Building2, Pill, Shield, Home, Landmark, Banknote, ShoppingCart, Car, MessageSquare, Languages, Heart, Utensils, BookOpen } from 'lucide-react'
import { trackTranslation, trackEvent } from '../utils/analytics'

function L(lang, d) { if (typeof d === 'string') return d; return d?.[lang] || d?.en || d?.zh || d?.ko || '' }

const situations = [
  {
    id: 'hospital', icon: Building2, label: { ko: '병원', zh: '医院', en: 'Hospital' },
    phrases: [
      { zh: '我头疼。', ko: '머리가 아파요.', en: 'I have a headache.', pron: 'meo-ri-ga a-pa-yo' },
      { zh: '我肚子疼。', ko: '배가 아파요.', en: 'I have a stomachache.', pron: 'bae-ga a-pa-yo' },
      { zh: '我发烧了。', ko: '열이 나요.', en: 'I have a fever.', pron: 'yeol-i na-yo' },
      { zh: '我想看医生。', ko: '진료를 받고 싶어요.', en: 'I want to see a doctor.', pron: 'jin-ryo-reul bat-go si-peo-yo' },
      { zh: '这里疼。', ko: '여기가 아파요.', en: 'It hurts here.', pron: 'yeo-gi-ga a-pa-yo' },
      { zh: '我有过敏。', ko: '알레르기가 있어요.', en: 'I have allergies.', pron: 'al-le-reu-gi-ga i-sseo-yo' },
      { zh: '请给我开处方。', ko: '처방전을 써 주세요.', en: 'Please write a prescription.', pron: 'cheo-bang-jeon-eul sseo ju-se-yo' },
      { zh: '我需要做检查。', ko: '검사를 받아야 해요.', en: 'I need to get tested.', pron: 'geom-sa-reul ba-da-ya hae-yo' },
      { zh: '可以用保险吗？', ko: '보험 적용이 되나요?', en: 'Can I use insurance?', pron: 'bo-heom jeok-yong-i doe-na-yo' },
      { zh: '我需要住院吗？', ko: '입원해야 하나요?', en: 'Do I need to be hospitalized?', pron: 'i-bwon-hae-ya ha-na-yo' },
      { zh: '我怀孕了。', ko: '임신했어요.', en: 'I am pregnant.', pron: 'im-sin-hae-sseo-yo' },
      { zh: '请给我诊断书。', ko: '진단서를 주세요.', en: 'Please give me a diagnosis certificate.', pron: 'jin-dan-seo-reul ju-se-yo' },
    ],
  },
  {
    id: 'pharmacy', icon: Pill, label: { ko: '약국', zh: '药店', en: 'Pharmacy' },
    phrases: [
      { zh: '我需要感冒药。', ko: '감기약 주세요.', en: 'I need cold medicine.', pron: 'gam-gi-yak ju-se-yo' },
      { zh: '我需要止痛药。', ko: '진통제 주세요.', en: 'I need painkillers.', pron: 'jin-tong-je ju-se-yo' },
      { zh: '我需要消化药。', ko: '소화제 주세요.', en: 'I need digestive medicine.', pron: 'so-hwa-je ju-se-yo' },
      { zh: '这个药怎么吃？', ko: '이 약은 어떻게 먹어요?', en: 'How do I take this medicine?', pron: 'i yak-eun eo-tteo-ke meo-geo-yo' },
      { zh: '一天吃几次？', ko: '하루에 몇 번 먹어요?', en: 'How many times a day?', pron: 'ha-ru-e myeot beon meo-geo-yo' },
      { zh: '有处方药吗？', ko: '처방전이 있어요.', en: 'I have a prescription.', pron: 'cheo-bang-jeon-i i-sseo-yo' },
      { zh: '我需要创可贴。', ko: '반창고 주세요.', en: 'I need band-aids.', pron: 'ban-chang-go ju-se-yo' },
      { zh: '有退烧药吗？', ko: '해열제 있어요?', en: 'Do you have fever reducer?', pron: 'hae-yeol-je i-sseo-yo' },
      { zh: '这个有副作用吗？', ko: '이거 부작용 있어요?', en: 'Are there side effects?', pron: 'i-geo bu-jak-yong i-sseo-yo' },
      { zh: '我对青霉素过敏。', ko: '페니실린 알레르기가 있어요.', en: 'I am allergic to penicillin.', pron: 'pe-ni-sil-lin al-le-reu-gi-ga i-sseo-yo' },
    ],
  },
  {
    id: 'police', icon: Shield, label: { ko: '경찰서', zh: '警察局', en: 'Police' },
    phrases: [
      { zh: '我的钱包被偷了。', ko: '지갑을 도난당했어요.', en: 'My wallet was stolen.', pron: 'ji-gap-eul do-nan-dang-hae-sseo-yo' },
      { zh: '我的手机丢了。', ko: '핸드폰을 잃어버렸어요.', en: 'I lost my phone.', pron: 'haen-deu-pon-eul il-eo-beo-ryeo-sseo-yo' },
      { zh: '我要报警。', ko: '신고하고 싶어요.', en: 'I want to file a report.', pron: 'sin-go-ha-go si-peo-yo' },
      { zh: '请帮帮我。', ko: '도와주세요.', en: 'Please help me.', pron: 'do-wa-ju-se-yo' },
      { zh: '我是中国人。', ko: '저는 중국 사람이에요.', en: 'I am Chinese.', pron: 'jeo-neun jung-guk sa-ram-i-e-yo' },
      { zh: '我需要翻译。', ko: '통역이 필요해요.', en: 'I need an interpreter.', pron: 'tong-yeok-i pil-yo-hae-yo' },
      { zh: '发生了交通事故。', ko: '교통사고가 났어요.', en: 'There was a traffic accident.', pron: 'gyo-tong-sa-go-ga na-sseo-yo' },
      { zh: '我被骗了。', ko: '사기를 당했어요.', en: 'I was scammed.', pron: 'sa-gi-reul dang-hae-sseo-yo' },
      { zh: '请给我报案证明。', ko: '사건 접수증을 주세요.', en: 'Please give me a case receipt.', pron: 'sa-geon jeop-su-jeung-eul ju-se-yo' },
      { zh: '我需要联系大使馆。', ko: '대사관에 연락해야 해요.', en: 'I need to contact the embassy.', pron: 'dae-sa-gwan-e yeol-lak-hae-ya hae-yo' },
    ],
  },
  {
    id: 'realestate', icon: Home, label: { ko: '부동산', zh: '房产中介', en: 'Real Estate' },
    phrases: [
      { zh: '我想租房子。', ko: '집을 구하고 싶어요.', en: 'I want to rent a place.', pron: 'jib-eul gu-ha-go si-peo-yo' },
      { zh: '月租多少钱？', ko: '월세가 얼마예요?', en: 'How much is the monthly rent?', pron: 'wol-se-ga eol-ma-ye-yo' },
      { zh: '押金多少？', ko: '보증금이 얼마예요?', en: 'How much is the deposit?', pron: 'bo-jeung-geum-i eol-ma-ye-yo' },
      { zh: '包含管理费吗？', ko: '관리비 포함이에요?', en: 'Does it include maintenance?', pron: 'gwan-ri-bi po-ham-i-e-yo' },
      { zh: '可以看房吗？', ko: '집을 볼 수 있어요?', en: 'Can I see the place?', pron: 'jib-eul bol su i-sseo-yo' },
      { zh: '附近有地铁站吗？', ko: '근처에 지하철역 있어요?', en: 'Is there a subway station nearby?', pron: 'geun-cheo-e ji-ha-cheol-yeok i-sseo-yo' },
      { zh: '外国人可以签合同吗？', ko: '외국인도 계약할 수 있어요?', en: 'Can foreigners sign a contract?', pron: 'oe-guk-in-do gye-yak-hal su i-sseo-yo' },
      { zh: '可以养宠物吗？', ko: '반려동물 키울 수 있어요?', en: 'Can I have pets?', pron: 'ban-ryeo-dong-mul ki-ul su i-sseo-yo' },
      { zh: '什么时候可以入住？', ko: '언제 입주할 수 있어요?', en: 'When can I move in?', pron: 'eon-je ip-ju-hal su i-sseo-yo' },
      { zh: '有家具吗？', ko: '가구가 있어요?', en: 'Is it furnished?', pron: 'ga-gu-ga i-sseo-yo' },
    ],
  },
  {
    id: 'government', icon: Landmark, label: { ko: '관공서', zh: '政府机关', en: 'Government' },
    phrases: [
      { zh: '我要办外国人登录证。', ko: '외국인등록증을 만들고 싶어요.', en: 'I want to get an ARC.', pron: 'oe-guk-in-deung-rok-jeung-eul man-deul-go si-peo-yo' },
      { zh: '我要延长签证。', ko: '비자를 연장하고 싶어요.', en: 'I want to extend my visa.', pron: 'bi-ja-reul yeon-jang-ha-go si-peo-yo' },
      { zh: '需要什么材料？', ko: '어떤 서류가 필요해요?', en: 'What documents do I need?', pron: 'eo-tteon seo-ryu-ga pil-yo-hae-yo' },
      { zh: '请问在哪里办理？', ko: '어디에서 신청하나요?', en: 'Where do I apply?', pron: 'eo-di-e-seo sin-cheong-ha-na-yo' },
      { zh: '需要预约吗？', ko: '예약이 필요한가요?', en: 'Do I need a reservation?', pron: 'ye-yak-i pil-yo-han-ga-yo' },
      { zh: '处理需要多长时间？', ko: '처리 기간이 얼마나 걸려요?', en: 'How long does it take?', pron: 'cheo-ri gi-gan-i eol-ma-na geol-ryeo-yo' },
      { zh: '我的签证快到期了。', ko: '비자가 곧 만료돼요.', en: 'My visa is expiring soon.', pron: 'bi-ja-ga got man-ryo-dwae-yo' },
      { zh: '在哪里拍证件照？', ko: '증명사진 어디에서 찍어요?', en: 'Where can I take ID photos?', pron: 'jeung-myeong-sa-jin eo-di-e-seo jjik-eo-yo' },
      { zh: '费用是多少？', ko: '수수료가 얼마예요?', en: 'How much is the fee?', pron: 'su-su-ryo-ga eol-ma-ye-yo' },
      { zh: '可以用中文服务吗？', ko: '중국어 서비스가 있나요?', en: 'Is Chinese service available?', pron: 'jung-guk-eo seo-bi-seu-ga in-na-yo' },
    ],
  },
  {
    id: 'bank', icon: Banknote, label: { ko: '은행', zh: '银行', en: 'Bank' },
    phrases: [
      { zh: '我想开户。', ko: '계좌를 개설하고 싶어요.', en: 'I want to open an account.', pron: 'gye-jwa-reul gae-seol-ha-go si-peo-yo' },
      { zh: '我要汇款到中国。', ko: '중국으로 송금하고 싶어요.', en: 'I want to remit to China.', pron: 'jung-guk-eu-ro song-geum-ha-go si-peo-yo' },
      { zh: '手续费是多少？', ko: '수수료가 얼마예요?', en: 'What is the fee?', pron: 'su-su-ryo-ga eol-ma-ye-yo' },
      { zh: '我要办银行卡。', ko: '체크카드를 만들고 싶어요.', en: 'I want to get a debit card.', pron: 'che-keu-ka-deu-reul man-deul-go si-peo-yo' },
      { zh: '我要取钱。', ko: '돈을 찾고 싶어요.', en: 'I want to withdraw money.', pron: 'don-eul chat-go si-peo-yo' },
      { zh: '可以换钱吗？', ko: '환전할 수 있어요?', en: 'Can I exchange money?', pron: 'hwan-jeon-hal su i-sseo-yo' },
      { zh: '今天的汇率是多少？', ko: '오늘 환율이 얼마예요?', en: 'What is today\'s exchange rate?', pron: 'o-neul hwan-yul-i eol-ma-ye-yo' },
      { zh: '需要外国人登录证吗？', ko: '외국인등록증이 필요한가요?', en: 'Do I need an ARC?', pron: 'oe-guk-in-deung-rok-jeung-i pil-yo-han-ga-yo' },
      { zh: '我要办网上银行。', ko: '인터넷뱅킹을 신청하고 싶어요.', en: 'I want to apply for internet banking.', pron: 'in-teo-net-baeng-king-eul sin-cheong-ha-go si-peo-yo' },
      { zh: '可以办信用卡吗？', ko: '신용카드를 만들 수 있나요?', en: 'Can I get a credit card?', pron: 'sin-yong-ka-deu-reul man-deul su in-na-yo' },
    ],
  },
  {
    id: 'mart', icon: ShoppingCart, label: { ko: '마트', zh: '超市', en: 'Mart' },
    phrases: [
      { zh: '这个多少钱？', ko: '이거 얼마예요?', en: 'How much is this?', pron: 'i-geo eol-ma-ye-yo' },
      { zh: '可以用微信支付吗？', ko: '위챗페이 되나요?', en: 'Can I use WeChat Pay?', pron: 'wi-chaet-pe-i doe-na-yo' },
      { zh: '可以退税吗？', ko: '텍스리펀 가능한가요?', en: 'Can I get a tax refund?', pron: 'tek-seu-ri-peon ga-neung-han-ga-yo' },
      { zh: '塑料袋多少钱？', ko: '비닐봉지 얼마예요?', en: 'How much is a plastic bag?', pron: 'bi-nil-bong-ji eol-ma-ye-yo' },
      { zh: '有折扣吗？', ko: '할인 있어요?', en: 'Is there a discount?', pron: 'hal-in i-sseo-yo' },
      { zh: '在哪里结账？', ko: '계산대가 어디예요?', en: 'Where is the checkout?', pron: 'gye-san-dae-ga eo-di-ye-yo' },
      { zh: '可以刷卡吗？', ko: '카드 결제 되나요?', en: 'Can I pay by card?', pron: 'ka-deu gyeol-je doe-na-yo' },
      { zh: '有会员卡优惠吗？', ko: '포인트 카드 있어요?', en: 'Do you have a point card?', pron: 'po-in-teu ka-deu i-sseo-yo' },
      { zh: '可以配送吗？', ko: '배송 가능한가요?', en: 'Can you deliver?', pron: 'bae-song ga-neung-han-ga-yo' },
      { zh: '营业到几点？', ko: '몇 시까지 영업해요?', en: 'Until what time are you open?', pron: 'myeot si-kka-ji yeong-eop-hae-yo' },
    ],
  },
  {
    id: 'taxi', icon: Car, label: { ko: '택시', zh: '出租车', en: 'Taxi' },
    phrases: [
      { zh: '请去这个地方。', ko: '이 주소로 가 주세요.', en: 'Please go to this address.', pron: 'i ju-so-ro ga ju-se-yo' },
      { zh: '到那里要多少钱？', ko: '거기까지 얼마예요?', en: 'How much to get there?', pron: 'geo-gi-kka-ji eol-ma-ye-yo' },
      { zh: '需要多长时间？', ko: '얼마나 걸려요?', en: 'How long does it take?', pron: 'eol-ma-na geol-ryeo-yo' },
      { zh: '请打表。', ko: '미터기 켜 주세요.', en: 'Please turn on the meter.', pron: 'mi-teo-gi kyeo ju-se-yo' },
      { zh: '请在这里停。', ko: '여기서 세워 주세요.', en: 'Please stop here.', pron: 'yeo-gi-seo se-wo ju-se-yo' },
      { zh: '可以刷卡吗？', ko: '카드로 결제할 수 있어요?', en: 'Can I pay by card?', pron: 'ka-deu-ro gyeol-je-hal su i-sseo-yo' },
      { zh: '请开后备箱。', ko: '트렁크 열어 주세요.', en: 'Please open the trunk.', pron: 'teu-reong-keu yeo-reo ju-se-yo' },
      { zh: '请走最快的路。', ko: '가장 빠른 길로 가 주세요.', en: 'Please take the fastest route.', pron: 'ga-jang ppa-reun gil-ro ga ju-se-yo' },
      { zh: '可以开发票吗？', ko: '영수증 주세요.', en: 'Can I get a receipt?', pron: 'yeong-su-jeung ju-se-yo' },
      { zh: '请开空调。', ko: '에어컨 켜 주세요.', en: 'Please turn on the AC.', pron: 'e-eo-keon kyeo ju-se-yo' },
    ],
  },
  {
    id: 'emergency', icon: Heart, label: { ko: '응급상황', zh: '紧急情况', en: 'Emergency' },
    phrases: [
      { zh: '救命！', ko: '도와주세요!', en: 'Help!', pron: 'do-wa-ju-se-yo' },
      { zh: '请叫救护车。', ko: '구급차를 불러주세요.', en: 'Please call an ambulance.', pron: 'gu-geup-cha-reul bul-leo-ju-se-yo' },
      { zh: '请叫警察。', ko: '경찰을 불러주세요.', en: 'Please call the police.', pron: 'gyeong-chal-eul bul-leo-ju-se-yo' },
      { zh: '我迷路了。', ko: '길을 잃었어요.', en: 'I am lost.', pron: 'gil-eul il-eo-sseo-yo' },
      { zh: '我的钱包不见了。', ko: '지갑을 잃어버렸어요.', en: 'I lost my wallet.', pron: 'ji-gap-eul il-eo-beo-ryeo-sseo-yo' },
      { zh: '火灾！', ko: '화재!', en: 'Fire!', pron: 'hwa-jae' },
      { zh: '我需要翻译。', ko: '통역이 필요해요.', en: 'I need an interpreter.', pron: 'tong-yeok-i pil-yo-hae-yo' },
      { zh: '请联系中国领事馆。', ko: '중국 영사관에 연락해주세요.', en: 'Please contact Chinese consulate.', pron: 'jung-guk yeong-sa-gwan-e yeol-lak-hae-ju-se-yo' },
    ],
  },
  {
    id: 'restaurant', icon: Utensils, label: { ko: '식당', zh: '餐厅', en: 'Restaurant' },
    phrases: [
      { zh: '请给我菜单。', ko: '메뉴판 주세요.', en: 'Please give me the menu.', pron: 'me-nyu-pan ju-se-yo' },
      { zh: '我要点餐。', ko: '주문하고 싶어요.', en: 'I want to order.', pron: 'ju-mun-ha-go si-peo-yo' },
      { zh: '我不吃辣。', ko: '매운 거 못 먹어요.', en: 'I can\'t eat spicy food.', pron: 'mae-un geo mot meo-geo-yo' },
      { zh: '我是素食主义者。', ko: '저는 채식주의자예요.', en: 'I am vegetarian.', pron: 'jeo-neun chae-sik-ju-ui-ja-ye-yo' },
      { zh: '这个多少钱？', ko: '이거 얼마예요?', en: 'How much is this?', pron: 'i-geo eol-ma-ye-yo' },
      { zh: '结账。', ko: '계산해 주세요.', en: 'Check please.', pron: 'gye-san-hae ju-se-yo' },
      { zh: '可以打包吗？', ko: '포장 가능한가요?', en: 'Can I take it to go?', pron: 'po-jang ga-neung-han-ga-yo' },
      { zh: '很好吃！', ko: '맛있어요!', en: 'It\'s delicious!', pron: 'ma-si-sseo-yo' },
      { zh: '请给我水。', ko: '물 주세요.', en: 'Please give me water.', pron: 'mul ju-se-yo' },
      { zh: '我有过敏。', ko: '알레르기가 있어요.', en: 'I have allergies.', pron: 'al-le-reu-gi-ga i-sseo-yo' },
    ],
  },
  {
    id: 'school', icon: BookOpen, label: { ko: '학교', zh: '学校', en: 'School' },
    phrases: [
      { zh: '我是交换学生。', ko: '저는 교환학생이에요.', en: 'I am an exchange student.', pron: 'jeo-neun gyo-hwan-hak-saeng-i-e-yo' },
      { zh: '我想选这门课。', ko: '이 과목을 수강하고 싶어요.', en: 'I want to take this course.', pron: 'i gwa-mok-eul su-gang-ha-go si-peo-yo' },
      { zh: '作业什么时候交？', ko: '과제 언제 내야 해요?', en: 'When is the assignment due?', pron: 'gwa-je eon-je nae-ya hae-yo' },
      { zh: '考试是什么时候？', ko: '시험이 언제예요?', en: 'When is the exam?', pron: 'si-heom-i eon-je-ye-yo' },
      { zh: '我没听懂。', ko: '이해하지 못했어요.', en: 'I didn\'t understand.', pron: 'i-hae-ha-ji mot-hae-sseo-yo' },
      { zh: '请再说一遍。', ko: '다시 말씀해 주세요.', en: 'Please say it again.', pron: 'da-si mal-sseum-hae ju-se-yo' },
      { zh: '我需要帮助。', ko: '도움이 필요해요.', en: 'I need help.', pron: 'do-um-i pil-yo-hae-yo' },
      { zh: '图书馆在哪里？', ko: '도서관이 어디예요?', en: 'Where is the library?', pron: 'do-seo-gwan-i eo-di-ye-yo' },
    ],
  },
]

// Simple dictionary for custom translation
const dict = {
  '你好': '안녕하세요', '谢谢': '감사합니다', '对不起': '죄송합니다', '再见': '안녕히 가세요',
  '是': '네', '不是': '아니요', '多少钱': '얼마예요', '在哪里': '어디예요',
  '我': '저', '你': '당신', '他': '그', '她': '그녀', '我们': '우리',
  '吃': '먹다', '喝': '마시다', '去': '가다', '来': '오다', '看': '보다',
  '好': '좋아요', '不好': '안 좋아요', '可以': '가능해요', '不可以': '안 돼요',
  '今天': '오늘', '明天': '내일', '昨天': '어제', '现在': '지금',
  '请问': '실례합니다', '没关系': '괜찮아요', '不客气': '천만에요',
  '水': '물', '饭': '밥', '咖啡': '커피', '茶': '차',
  '厕所': '화장실', '地铁': '지하철', '公交车': '버스', '出租车': '택시',
  'hello': '안녕하세요', 'thank you': '감사합니다', 'sorry': '죄송합니다',
  'yes': '네', 'no': '아니요', 'how much': '얼마예요', 'where': '어디예요',
  'help': '도와주세요', 'please': '주세요', 'excuse me': '실례합니다',
}

function simpleTranslate(text) {
  if (!text.trim()) return ''
  const lower = text.toLowerCase().trim()
  if (dict[lower] || dict[text.trim()]) return dict[lower] || dict[text.trim()]
  // Try partial matches
  let result = text
  let found = false
  for (const [src, tgt] of Object.entries(dict)) {
    if (result.includes(src)) { result = result.replace(src, tgt); found = true }
  }
  if (found) return result
  return L('ko', { ko: '(사전에 없는 표현입니다. 상황별 템플릿을 이용해 주세요.)', zh: '(词典中没有此表达。请使用情景模板。)', en: '(Not in dictionary. Please use situation templates.)' })
}

function speak(text) {
  try {
    if (!('speechSynthesis' in window)) {
      console.warn('Web Speech API not available')
      return
    }
    window.speechSynthesis.cancel()
    const u = new SpeechSynthesisUtterance(text)
    u.lang = 'ko-KR'
    u.rate = 0.85
    window.speechSynthesis.speak(u)
  } catch (err) {
    console.warn('Web Speech API unavailable:', err)
    // Silent fail for better UX
  }
}

const FAVORITES_KEY = 'hp_translator_favorites'

export default function TranslatorTab({ lang }) {
  const [selected, setSelected] = useState(null)
  const [customText, setCustomText] = useState('')
  const [customResult, setCustomResult] = useState('')
  const [copiedIdx, setCopiedIdx] = useState(null)
  const [searchQ, setSearchQ] = useState('')
  const [favorites, setFavorites] = useState(() => {
    try { return JSON.parse(localStorage.getItem(FAVORITES_KEY)) || [] }
    catch { return [] }
  })

  const copyText = (text, idx) => {
    navigator.clipboard.writeText(text).catch(() => {})
    setCopiedIdx(idx)
    setTimeout(() => setCopiedIdx(null), 1500)
    
    // 번역 텍스트 복사 이벤트 추적
    trackEvent('translation_text_copied', {
      event_category: 'translation',
      event_label: 'copy_text',
      text_length: text.length,
      feature: 'translator'
    })
  }

  const toggleFavorite = (phrase, situationId) => {
    const key = `${situationId}-${phrase.zh}`
    const isFav = favorites.some(f => f.key === key)
    let newFavorites
    if (isFav) {
      newFavorites = favorites.filter(f => f.key !== key)
    } else {
      newFavorites = [...favorites, { ...phrase, key, situationId }]
    }
    setFavorites(newFavorites)
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(newFavorites))
  }

  const isFavorite = (phrase, situationId) => {
    return favorites.some(f => f.key === `${situationId}-${phrase.zh}`)
  }

  const handleCustomTranslate = () => {
    if (!customText.trim()) return
    
    const result = simpleTranslate(customText)
    setCustomResult(result)
    
    // 번역 이벤트 추적
    trackTranslation('auto', lang, 'text', {
      source_text_length: customText.length,
      feature: 'custom_translator',
      has_result: !!result
    })
  }

  if (selected) {
    if (selected === 'favorites') {
      const filtered = searchQ
        ? favorites.filter(p => p.zh.includes(searchQ) || p.ko.includes(searchQ) || p.en.toLowerCase().includes(searchQ.toLowerCase()))
        : favorites
      return (
        <div className="space-y-4 animate-fade-up">
          <button onClick={() => { setSelected(null); setSearchQ('') }} className="flex items-center gap-1 text-sm text-[#6B7280] hover:text-[#111827] transition-colors">
            <ChevronLeft size={16} />
            {L(lang, { ko: '뒤로', zh: '返回', en: 'Back' })}
          </button>
          <div className="flex items-center gap-3">
            <Heart size={20} className="text-red-500" fill="currentColor" />
            <div>
              <h2 className="text-lg font-bold text-[#111827]">{L(lang, { ko: '즐겨찾기', zh: '收藏夹', en: 'Favorites' })}</h2>
              <p className="text-xs text-[#6B7280]">{favorites.length} {L(lang, { ko: '개 표현', zh: '个表达', en: 'phrases' })}</p>
            </div>
          </div>

          {favorites.length > 0 && (
            <div className="relative">
              <Search size={16} className="absolute left-3 top-3 text-[#9CA3AF]" />
              <input type="text" value={searchQ} onChange={e => setSearchQ(e.target.value)}
                placeholder={L(lang, { ko: '즐겨찾기 검색...', zh: '搜索收藏...', en: 'Search favorites...' })}
                className="w-full bg-[#F3F4F6] rounded-xl pl-10 pr-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#111827]/10" />
            </div>
          )}

          <div className="space-y-3">
            {filtered.length === 0 && favorites.length === 0 && (
              <div className="text-center py-12 text-[#9CA3AF] text-sm">
                {L(lang, { ko: '즐겨찾기한 표현이 없습니다', zh: '没有收藏的表达', en: 'No favorite phrases yet' })}
              </div>
            )}
            {filtered.map((p, i) => (
              <div key={i} className="bg-white rounded-2xl p-5 border border-[#E5E7EB] card-glow">
                <p className="text-sm font-semibold text-[#111827]">{p.zh}</p>
                <p className="text-base font-bold text-[#111827] mt-2">{p.ko}</p>
                <p className="text-xs text-[#9CA3AF] mt-1 italic">[{p.pron}]</p>
                <p className="text-xs text-[#6B7280] mt-1">{p.en}</p>
                <div className="flex gap-2 mt-3">
                  <button onClick={() => speak(p.ko)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-[#F3F4F6] rounded-lg text-xs text-[#111827] hover:bg-[#E5E7EB] transition-colors">
                    <Volume2 size={14} /> {L(lang, { ko: '듣기', zh: '听', en: 'Listen' })}
                  </button>
                  <button onClick={() => copyText(p.ko, `fav-${i}`)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-[#F3F4F6] rounded-lg text-xs text-[#111827] hover:bg-[#E5E7EB] transition-colors">
                    {copiedIdx === `fav-${i}` ? <Check size={14} /> : <Copy size={14} />}
                    {copiedIdx === `fav-${i}` ? L(lang, { ko: '복사됨', zh: '已复制', en: 'Copied' }) : L(lang, { ko: '복사', zh: '复制', en: 'Copy' })}
                  </button>
                  <button onClick={() => toggleFavorite(p, p.situationId)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg text-xs transition-colors">
                    <Heart size={14} fill="currentColor" />
                    {L(lang, { ko: '제거', zh: '移除', en: 'Remove' })}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )
    }

    const sit = situations.find(s => s.id === selected)
    const filtered = searchQ
      ? sit.phrases.filter(p => p.zh.includes(searchQ) || p.ko.includes(searchQ) || p.en.toLowerCase().includes(searchQ.toLowerCase()))
      : sit.phrases
    return (
      <div className="space-y-4 animate-fade-up">
        <button onClick={() => { setSelected(null); setSearchQ('') }} className="flex items-center gap-1 text-sm text-[#6B7280] hover:text-[#111827] transition-colors">
          <ChevronLeft size={16} />
          {L(lang, { ko: '뒤로', zh: '返回', en: 'Back' })}
        </button>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[#F3F4F6] rounded-xl flex items-center justify-center">
            <sit.icon size={20} className="text-[#111827]" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-[#111827]">{L(lang, sit.label)}</h2>
            <p className="text-xs text-[#6B7280]">{sit.phrases.length} {L(lang, { ko: '개 표현', zh: '个表达', en: 'phrases' })}</p>
          </div>
        </div>

        <div className="relative">
          <Search size={16} className="absolute left-3 top-3 text-[#9CA3AF]" />
          <input type="text" value={searchQ} onChange={e => setSearchQ(e.target.value)}
            placeholder={L(lang, { ko: '표현 검색...', zh: '搜索表达...', en: 'Search phrases...' })}
            className="w-full bg-[#F3F4F6] rounded-xl pl-10 pr-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#111827]/10" />
        </div>

        <div className="space-y-3">
          {filtered.map((p, i) => (
            <div key={i} className="bg-white rounded-2xl p-5 border border-[#E5E7EB] card-glow">
              <p className="text-sm font-semibold text-[#111827]">{p.zh}</p>
              <p className="text-base font-bold text-[#111827] mt-2">{p.ko}</p>
              <p className="text-xs text-[#9CA3AF] mt-1 italic">[{p.pron}]</p>
              <p className="text-xs text-[#6B7280] mt-1">{p.en}</p>
              <div className="flex gap-2 mt-3">
                <button onClick={() => speak(p.ko)}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-[#F3F4F6] rounded-lg text-xs text-[#111827] hover:bg-[#E5E7EB] transition-colors">
                  <Volume2 size={14} /> {L(lang, { ko: '듣기', zh: '听', en: 'Listen' })}
                </button>
                <button onClick={() => copyText(p.ko, `${selected}-${i}`)}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-[#F3F4F6] rounded-lg text-xs text-[#111827] hover:bg-[#E5E7EB] transition-colors">
                  {copiedIdx === `${selected}-${i}` ? <Check size={14} /> : <Copy size={14} />}
                  {copiedIdx === `${selected}-${i}` ? L(lang, { ko: '복사됨', zh: '已复制', en: 'Copied' }) : L(lang, { ko: '복사', zh: '复制', en: 'Copy' })}
                </button>
                <button onClick={() => toggleFavorite(p, selected)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs transition-colors ${
                    isFavorite(p, selected) 
                      ? 'bg-red-50 text-red-600 hover:bg-red-100' 
                      : 'bg-[#F3F4F6] text-[#111827] hover:bg-[#E5E7EB]'
                  }`}>
                  <Heart size={14} fill={isFavorite(p, selected) ? 'currentColor' : 'none'} />
                  {L(lang, { ko: '즐겨찾기', zh: '收藏', en: 'Favorite' })}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-5 animate-fade-up">
      {/* Free text translation */}
      <div className="bg-white rounded-2xl p-5 border border-[#E5E7EB] card-glow">
        <div className="flex items-center gap-2 mb-3">
          <Languages size={18} className="text-[#111827]" />
          <h3 className="font-bold text-[#111827] text-sm">{L(lang, { ko: '자유 번역', zh: '自由翻译', en: 'Free Translation' })}</h3>
        </div>
        <textarea value={customText} onChange={e => setCustomText(e.target.value)}
          placeholder={L(lang, { ko: '중국어 또는 영어를 입력하세요...', zh: '请输入中文或英文...', en: 'Enter Chinese or English...' })}
          className="w-full bg-[#F3F4F6] rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[#111827]/10 resize-none h-20 placeholder:text-[#9CA3AF]" />
        <button onClick={handleCustomTranslate}
          className="w-full mt-2 bg-[#111827] text-white font-semibold py-2.5 rounded-xl text-sm hover:bg-[#1F2937] transition-colors">
          {L(lang, { ko: '번역하기', zh: '翻译', en: 'Translate' })}
        </button>
        {customResult && (
          <div className="mt-3 bg-[#F8F9FA] rounded-xl p-4 border border-[#E5E7EB]">
            <p className="text-sm font-bold text-[#111827]">{customResult}</p>
            <div className="flex gap-2 mt-2">
              <button onClick={() => speak(customResult)} className="flex items-center gap-1 px-2 py-1 bg-white rounded-lg text-xs text-[#111827] border border-[#E5E7EB]">
                <Volume2 size={12} /> {L(lang, { ko: '듣기', zh: '听', en: 'Listen' })}
              </button>
              <button onClick={() => copyText(customResult, 'custom')} className="flex items-center gap-1 px-2 py-1 bg-white rounded-lg text-xs text-[#111827] border border-[#E5E7EB]">
                {copiedIdx === 'custom' ? <Check size={12} /> : <Copy size={12} />}
                {copiedIdx === 'custom' ? L(lang, { ko: '복사됨', zh: '已复制', en: 'Copied' }) : L(lang, { ko: '복사', zh: '复制', en: 'Copy' })}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Situation templates */}
      <h3 className="font-bold text-[#111827] text-sm">{L(lang, { ko: '상황별 통역', zh: '场景翻译', en: 'Situation Templates' })}</h3>
      <div className="grid grid-cols-2 gap-3">
        {/* Favorites section */}
        <button onClick={() => {
          setSelected('favorites')
          trackEvent('translation_section_selected', {
            section: 'favorites',
            event_category: 'translation',
            event_label: 'select_favorites'
          })
        }}
          className="bg-white rounded-2xl p-5 border border-[#E5E7EB] card-glow text-left hover:border-[#111827]/20 transition-all">
          <Heart size={22} className="text-red-500 mb-2" fill="currentColor" />
          <p className="font-bold text-[#111827] text-sm">{L(lang, { ko: '즐겨찾기', zh: '收藏夹', en: 'Favorites' })}</p>
          <p className="text-xs text-[#6B7280] mt-1">{favorites.length}</p>
        </button>
        
        {situations.map(sit => (
          <button key={sit.id} onClick={() => {
            setSelected(sit.id)
            trackEvent('translation_section_selected', {
              section: sit.id,
              section_label: L(lang, sit.label),
              phrase_count: sit.phrases.length,
              event_category: 'translation',
              event_label: `select_${sit.id}`
            })
          }}
            className="bg-white rounded-2xl p-5 border border-[#E5E7EB] card-glow text-left hover:border-[#111827]/20 transition-all">
            <sit.icon size={22} className="text-[#111827] mb-2" />
            <p className="font-bold text-[#111827] text-sm">{L(lang, sit.label)}</p>
            <p className="text-xs text-[#6B7280] mt-1">{sit.phrases.length}+</p>
          </button>
        ))}
      </div>
    </div>
  )
}
