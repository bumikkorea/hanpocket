export const SCENE_PHRASE_DETAILS = {
  restaurant: {
    title: { ko: '식당', zh: '餐厅', en: 'Restaurant' },
    icon: '🍽️',
    phrases: [
      { ko: '이거 주세요', zh: '请给我这个', en: 'This one please', roman: 'i-geo ju-se-yo' },
      { ko: '메뉴판 주세요', zh: '请给我菜单', en: 'Menu please', roman: 'me-nyu-pan ju-se-yo' },
      { ko: '추천 메뉴가 뭐예요?', zh: '推荐菜是什么？', en: 'What do you recommend?', roman: 'chu-cheon me-nyu-ga mwo-ye-yo' },
      { ko: '맵지 않게 해주세요', zh: '请做不辣的', en: 'Not spicy please', roman: 'maep-ji an-ke hae-ju-se-yo' },
      { ko: '계산해 주세요', zh: '请结账', en: 'Check please', roman: 'gye-san-hae ju-se-yo' },
      { ko: '카드 돼요?', zh: '可以刷卡吗？', en: 'Can I pay by card?', roman: 'ka-deu dwae-yo' },
      { ko: '포장해 주세요', zh: '请打包', en: 'Takeaway please', roman: 'po-jang-hae ju-se-yo' },
      { ko: '물 좀 주세요', zh: '请给我水', en: 'Water please', roman: 'mul jom ju-se-yo' },
      { ko: '여기요!', zh: '服务员！', en: 'Excuse me!', roman: 'yeo-gi-yo' },
      { ko: '맛있어요!', zh: '好吃！', en: 'Delicious!', roman: 'ma-si-sseo-yo' },
    ]
  },
  cafe: {
    title: { ko: '카페', zh: '咖啡厅', en: 'Cafe' },
    icon: '☕',
    phrases: [
      { ko: '아이스 아메리카노 주세요', zh: '请给我冰美式', en: 'Iced Americano please', roman: 'a-i-seu a-me-ri-ka-no ju-se-yo' },
      { ko: '따뜻한 걸로 주세요', zh: '请给我热的', en: 'Hot one please', roman: 'tta-tteu-tan geol-lo ju-se-yo' },
      { ko: '사이즈 큰 걸로요', zh: '大杯的', en: 'Large size please', roman: 'sa-i-jeu keun geol-lo-yo' },
      { ko: '여기서 먹을게요', zh: '在这里吃', en: 'For here', roman: 'yeo-gi-seo meo-geul-ge-yo' },
      { ko: '가져갈게요', zh: '带走', en: 'To go', roman: 'ga-jyeo-gal-ge-yo' },
      { ko: '와이파이 있어요?', zh: '有WiFi吗？', en: 'Do you have WiFi?', roman: 'wa-i-pa-i i-sseo-yo' },
      { ko: '콘센트 있어요?', zh: '有插座吗？', en: 'Any outlets?', roman: 'kon-sen-teu i-sseo-yo' },
      { ko: '디카페인 있어요?', zh: '有无咖啡因的吗？', en: 'Decaf available?', roman: 'di-ka-pe-in i-sseo-yo' },
      { ko: '케이크 뭐가 있어요?', zh: '有什么蛋糕？', en: 'What cakes do you have?', roman: 'ke-i-keu mwo-ga i-sseo-yo' },
      { ko: '영수증 주세요', zh: '请给我收据', en: 'Receipt please', roman: 'yeong-su-jeung ju-se-yo' },
    ]
  },
  transport: {
    title: { ko: '교통', zh: '交通', en: 'Transport' },
    icon: '🚕',
    phrases: [
      { ko: '여기 가 주세요', zh: '请去这里', en: 'Please go here', roman: 'yeo-gi ga ju-se-yo' },
      { ko: '얼마예요?', zh: '多少钱？', en: 'How much?', roman: 'eol-ma-ye-yo' },
      { ko: '여기서 내려주세요', zh: '请在这里停车', en: 'Drop me off here', roman: 'yeo-gi-seo nae-ryeo-ju-se-yo' },
      { ko: '지하철역 어디예요?', zh: '地铁站在哪里？', en: 'Where is the subway?', roman: 'ji-ha-cheol-yeok eo-di-ye-yo' },
      { ko: '이 버스 명동 가요?', zh: '这个公交去明洞吗？', en: 'Does this bus go to Myeongdong?', roman: 'i beo-seu myeong-dong ga-yo' },
      { ko: '환승이에요', zh: '换乘', en: 'Transfer', roman: 'hwan-seung-i-e-yo' },
      { ko: '교통카드 충전해 주세요', zh: '请充值交通卡', en: 'Please recharge my transit card', roman: 'gyo-tong-ka-deu chung-jeon-hae ju-se-yo' },
      { ko: '몇 번 출구예요?', zh: '几号出口？', en: 'Which exit?', roman: 'myeot beon chul-gu-ye-yo' },
      { ko: '트렁크 열어주세요', zh: '请打开后备箱', en: 'Open the trunk please', roman: 'teu-reong-keu yeo-reo-ju-se-yo' },
      { ko: '카카오T 불러주세요', zh: '请帮我叫KakaoT', en: 'Call a KakaoT please', roman: 'ka-ka-o-ti bul-leo-ju-se-yo' },
    ]
  },
  convenience: {
    title: { ko: '편의점', zh: '便利店', en: 'Convenience Store' },
    icon: '🏪',
    phrases: [
      { ko: '봉투 주세요', zh: '请给我袋子', en: 'Bag please', roman: 'bong-tu ju-se-yo' },
      { ko: '데워주세요', zh: '请加热', en: 'Heat it up please', roman: 'de-wo-ju-se-yo' },
      { ko: '젓가락 주세요', zh: '请给我筷子', en: 'Chopsticks please', roman: 'jeot-ga-rak ju-se-yo' },
      { ko: '화장실 어디예요?', zh: '洗手间在哪里？', en: 'Where is the restroom?', roman: 'hwa-jang-sil eo-di-ye-yo' },
      { ko: '이거 1+1이에요?', zh: '这个买一送一吗？', en: 'Is this buy 1 get 1?', roman: 'i-geo won-peul-leo-won-i-e-yo' },
      { ko: '충전기 있어요?', zh: '有充电器吗？', en: 'Do you have a charger?', roman: 'chung-jeon-gi i-sseo-yo' },
      { ko: 'SIM카드 있어요?', zh: '有SIM卡吗？', en: 'Do you have SIM cards?', roman: 'sim-ka-deu i-sseo-yo' },
      { ko: '현금만 돼요?', zh: '只能付现金吗？', en: 'Cash only?', roman: 'hyeon-geum-man dwae-yo' },
      { ko: '택배 보내고 싶어요', zh: '我想寄快递', en: 'I want to send a package', roman: 'taek-bae bo-nae-go si-peo-yo' },
      { ko: '이거 얼마예요?', zh: '这个多少钱？', en: 'How much is this?', roman: 'i-geo eol-ma-ye-yo' },
    ]
  },
  shopping: {
    title: { ko: '쇼핑', zh: '购物', en: 'Shopping' },
    icon: '🛍️',
    phrases: [
      { ko: '좀 깎아 주세요', zh: '请便宜一点', en: 'Discount please', roman: 'jom kka-kka ju-se-yo' },
      { ko: '다른 색상 있어요?', zh: '有其他颜色吗？', en: 'Other colors?', roman: 'da-reun saek-sang i-sseo-yo' },
      { ko: '입어봐도 돼요?', zh: '可以试穿吗？', en: 'Can I try it on?', roman: 'i-beo-bwa-do dwae-yo' },
      { ko: '세금 환급 돼요?', zh: '可以退税吗？', en: 'Tax refund available?', roman: 'se-geum hwan-geup dwae-yo' },
      { ko: '좀 더 큰 사이즈요', zh: '大一号的', en: 'One size bigger', roman: 'jom deo keun sa-i-jeu-yo' },
      { ko: '선물 포장해 주세요', zh: '请帮我包装成礼物', en: 'Gift wrap please', roman: 'seon-mul po-jang-hae ju-se-yo' },
      { ko: '면세 가격이에요?', zh: '是免税价吗？', en: 'Is this duty-free price?', roman: 'myeon-se ga-gyeo-gi-e-yo' },
      { ko: '알리페이 돼요?', zh: '可以用支付宝吗？', en: 'Alipay accepted?', roman: 'al-li-pe-i dwae-yo' },
      { ko: '교환/환불 가능해요?', zh: '可以换货/退款吗？', en: 'Exchange/refund?', roman: 'gyo-hwan/hwan-bul ga-neung-hae-yo' },
      { ko: '인기 상품 뭐예요?', zh: '热门商品是什么？', en: 'What\'s popular?', roman: 'in-gi sang-pum mwo-ye-yo' },
    ]
  },
  accommodation: {
    title: { ko: '숙소', zh: '住宿', en: 'Hotel' },
    icon: '🏨',
    phrases: [
      { ko: '체크인 하려고요', zh: '我要办入住', en: 'Check-in please', roman: 'che-keu-in ha-ryeo-go-yo' },
      { ko: '체크아웃 몇 시예요?', zh: '退房时间是几点？', en: 'Check-out time?', roman: 'che-keu-a-ut myeot si-ye-yo' },
      { ko: '짐 맡아주세요', zh: '请帮我保管行李', en: 'Store my luggage please', roman: 'jim ma-ta-ju-se-yo' },
      { ko: '와이파이 비밀번호요?', zh: 'WiFi密码是什么？', en: 'WiFi password?', roman: 'wa-i-pa-i bi-mil-beon-ho-yo' },
      { ko: '수건 더 주세요', zh: '请再给我毛巾', en: 'More towels please', roman: 'su-geon deo ju-se-yo' },
      { ko: '택시 불러주세요', zh: '请帮我叫出租车', en: 'Call a taxi please', roman: 'taek-si bul-leo-ju-se-yo' },
      { ko: '조식 몇 시부터예요?', zh: '早餐几点开始？', en: 'Breakfast time?', roman: 'jo-sik myeot si-bu-teo-ye-yo' },
      { ko: '방 바꿔주세요', zh: '请换一间房', en: 'Change room please', roman: 'bang ba-kkwo-ju-se-yo' },
      { ko: '에어컨이 안 돼요', zh: '空调不工作', en: 'AC is not working', roman: 'e-eo-keon-i an dwae-yo' },
      { ko: '늦은 체크아웃 가능해요?', zh: '可以延迟退房吗？', en: 'Late check-out?', roman: 'neu-jeun che-keu-a-ut ga-neung-hae-yo' },
    ]
  },
  emergency: {
    title: { ko: '긴급', zh: '紧急', en: 'Emergency' },
    icon: '🆘',
    phrases: [
      { ko: '도와주세요!', zh: '请帮帮我！', en: 'Help me!', roman: 'do-wa-ju-se-yo' },
      { ko: '경찰 불러주세요', zh: '请叫警察', en: 'Call the police', roman: 'gyeong-chal bul-leo-ju-se-yo' },
      { ko: '병원 가야 돼요', zh: '我需要去医院', en: 'I need a hospital', roman: 'byeong-won ga-ya dwae-yo' },
      { ko: '여권을 잃어버렸어요', zh: '我的护照丢了', en: 'I lost my passport', roman: 'yeo-gwon-eul il-eo-beo-ryeo-sseo-yo' },
      { ko: '약국 어디예요?', zh: '药店在哪里？', en: 'Where is the pharmacy?', roman: 'yak-guk eo-di-ye-yo' },
      { ko: '알레르기가 있어요', zh: '我有过敏症', en: 'I have allergies', roman: 'al-le-reu-gi-ga i-sseo-yo' },
      { ko: '대사관에 연락해 주세요', zh: '请联系大使馆', en: 'Contact the embassy', roman: 'dae-sa-gwan-e yeol-lak-hae ju-se-yo' },
      { ko: '지갑을 도둑맞았어요', zh: '钱包被偷了', en: 'My wallet was stolen', roman: 'ji-gap-eul do-duk-ma-ja-sseo-yo' },
      { ko: '길을 잃었어요', zh: '我迷路了', en: 'I\'m lost', roman: 'gi-reul il-eo-sseo-yo' },
      { ko: '한국어 못해요', zh: '我不会韩语', en: 'I can\'t speak Korean', roman: 'han-gu-geo mo-tae-yo' },
    ]
  },
}