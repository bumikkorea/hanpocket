import { useState } from 'react'
import { CreditCard, ShoppingBag, Package, Printer, Zap, Gift, Smartphone, Bookmark } from 'lucide-react'
import KoreanPhraseCard, { useKoreanPocket } from './KoreanPhraseCard'

const L = (lang, text) => text[lang] || text['ko']

export default function ConveniencePocket({ lang }) {
  const [activeTab, setActiveTab] = useState('payment')
  const { bookmarkedCards, toastMessage, copyToClipboard, speak, toggleBookmark } = useKoreanPocket('convenience_bookmarks')

  const tabs = [
    { id: 'payment', name: { ko: '결제', zh: '支付', en: 'Payment' }, icon: CreditCard },
    { id: 'search', name: { ko: '상품찾기', zh: '找商品', en: 'Finding Items' }, icon: ShoppingBag },
    { id: 'lunchbox', name: { ko: '도시락', zh: '便当', en: 'Lunch Box' }, icon: Package },
    { id: 'parcel', name: { ko: '택배', zh: '快递', en: 'Parcel' }, icon: Package },
    { id: 'atm', name: { ko: 'ATM', zh: 'ATM', en: 'ATM' }, icon: CreditCard },
    { id: 'charge', name: { ko: '충전', zh: '充值', en: 'Top-up' }, icon: Zap },
    { id: 'print', name: { ko: '프린트', zh: '打印', en: 'Print' }, icon: Printer },
    { id: 'promotion', name: { ko: '1+1행사', zh: '1+1活动', en: '1+1 Deals' }, icon: Gift },
    { id: 'brands', name: { ko: '브랜드별', zh: '按品牌', en: 'By Brand' }, icon: Smartphone },
    { id: 'saved', name: { ko: '저장한 표현', zh: '收藏表达', en: 'Saved' }, icon: Bookmark }
  ]

  const cardData = {
    payment: [
      {
        id: 'pay_card',
        ko: '카드로 할게요',
        pronunciation: 'ka-deu-ro hal-ge-yo',
        zh: '我要刷卡',
        example_ko: '결제 카드로 할게요',
        example_zh: '支付用刷卡',
        example_pronunciation: 'gyeolje kadeuro halgeyo'
      },
      {
        id: 'pay_cash',
        ko: '현금으로 할게요',
        pronunciation: 'hyeon-geum-eu-ro hal-ge-yo',
        zh: '我付现金',
        example_ko: '현금으로 결제할게요',
        example_zh: '用现金支付',
        example_pronunciation: 'hyeongeumeuro gyeoljehalgeyo'
      },
      {
        id: 'samsung_pay',
        ko: '삼성페이로 결제할게요',
        pronunciation: 'sam-seong-pe-i-ro gyeol-je-hal-ge-yo',
        zh: '我用三星支付',
        example_ko: '삼성페이 되나요?',
        example_zh: '可以用三星支付吗？',
        example_pronunciation: 'samseongpei doenayo?'
      },
      {
        id: 'kakao_pay',
        ko: '카카오페이로 해주세요',
        pronunciation: 'ka-ka-o-pe-i-ro hae-ju-se-yo',
        zh: '请用KaKao支付',
        example_ko: '카카오페이 QR코드 찍어주세요',
        example_zh: '请扫KaKao支付二维码',
        example_pronunciation: 'kakaopei QR kodeu jjigeojuseyo'
      },
      {
        id: 'contactless_pay',
        ko: '터치 결제 돼요?',
        pronunciation: 'teo-chi gyeol-je dwae-yo',
        zh: '可以碰触支付吗？',
        example_ko: '카드 터치해서 결제할게요',
        example_zh: '我要碰触卡片支付',
        example_pronunciation: 'kadeu teochiaeseo gyeoljehalgeyo'
      },
      {
        id: 'installment',
        ko: '할부로 해주세요',
        pronunciation: 'hal-bu-ro hae-ju-se-yo',
        zh: '请分期付款',
        example_ko: '3개월 할부 가능해요?',
        example_zh: '可以3个月分期吗？',
        example_pronunciation: 'sam-gaewol halbu ganeunghaeyo?'
      },
      {
        id: 'points_card',
        ko: '포인트카드 있어요',
        pronunciation: 'po-in-teu-ka-deu iss-eo-yo',
        zh: '我有积分卡',
        example_ko: '포인트 적립해주세요',
        example_zh: '请给我积分',
        example_pronunciation: 'pointeu jeokripaejuseyo'
      },
      {
        id: 'receipt_please',
        ko: '영수증 주세요',
        pronunciation: 'yeong-su-jeung ju-se-yo',
        zh: '请给我收据',
        example_ko: '영수증 꼭 주세요',
        example_zh: '请一定给我收据',
        example_pronunciation: 'yeongsujeung kkok juseyo'
      },
      {
        id: 'bag_please',
        ko: '봉투 주세요',
        pronunciation: 'bong-tu ju-se-yo',
        zh: '请给我袋子',
        example_ko: '비닐봉투 하나 주세요',
        example_zh: '请给我一个塑料袋',
        example_pronunciation: 'binyeol bongtu hana juseyo'
      },
      {
        id: 'change_money',
        ko: '잔돈 받을게요',
        pronunciation: 'jan-don bad-eul-ge-yo',
        zh: '我要找零',
        example_ko: '잔돈은 현금으로 주세요',
        example_zh: '找零请给现金',
        example_pronunciation: 'jandoneun hyeongeumeuro juseyo'
      }
    ],
    search: [
      {
        id: 'where_is',
        ko: 'OO 어디에 있어요?',
        pronunciation: 'OO eo-di-e iss-eo-yo',
        zh: 'OO在哪里？',
        example_ko: '라면 어디에 있어요?',
        example_zh: '泡面在哪里？',
        example_pronunciation: 'ramyeon eodie isseoyo?'
      },
      {
        id: 'do_you_have',
        ko: 'OO 있어요?',
        pronunciation: 'OO iss-eo-yo',
        zh: '有OO吗？',
        example_ko: '바나나우유 있어요?',
        example_zh: '有香蕉牛奶吗？',
        example_pronunciation: 'banana-uyu isseoyo?'
      },
      {
        id: 'drinks_section',
        ko: '음료수는 어디 있어요?',
        pronunciation: 'eum-ryo-su-neun eo-di iss-eo-yo',
        zh: '饮料在哪里？',
        example_ko: '냉장고에서 음료수 찾고 있어요',
        example_zh: '我在冰箱里找饮料',
        example_pronunciation: 'naengjanggoeseo eumryosu chatgo isseoyo'
      },
      {
        id: 'snacks_section',
        ko: '과자 코너는 어디예요?',
        pronunciation: 'gwa-ja ko-neo-neun eo-di-ye-yo',
        zh: '零食区在哪里？',
        example_ko: '과자랑 초콜릿 사려고 해요',
        example_zh: '我想买零食和巧克力',
        example_pronunciation: 'gwajarang chokollit saryeogo haeyo'
      },
      {
        id: 'instant_food',
        ko: '인스턴트 음식은 어디 있어요?',
        pronunciation: 'in-seu-teon-teu eum-sik-eun eo-di iss-eo-yo',
        zh: '方便食品在哪里？',
        example_ko: '컵라면이랑 즉석밥 찾고 있어요',
        example_zh: '我在找杯面和速食米饭',
        example_pronunciation: 'keommyeonirang jeuktseokbap chatgo isseoyo'
      },
      {
        id: 'dairy_products',
        ko: '유제품은 어디에 있어요?',
        pronunciation: 'yu-je-pum-eun eo-di-e iss-eo-yo',
        zh: '乳制品在哪里？',
        example_ko: '우유랑 요거트 사려고 해요',
        example_zh: '我想买牛奶和酸奶',
        example_pronunciation: 'uyurang yogeoteu saryeogo haeyo'
      },
      {
        id: 'bathroom_items',
        ko: '화장실 용품 어디 있어요?',
        pronunciation: 'hwa-jang-sil yong-pum eo-di iss-eo-yo',
        zh: '卫生用品在哪里？',
        example_ko: '휴지랑 치약 사려고 해요',
        example_zh: '我想买纸巾和牙膏',
        example_pronunciation: 'hyujirang chiyak saryeogo haeyo'
      },
      {
        id: 'ice_cream',
        ko: '아이스크림 어디 있어요?',
        pronunciation: 'a-i-seu-keu-rim eo-di iss-eo-yo',
        zh: '冰淇淋在哪里？',
        example_ko: '냉동고에 아이스크림 있나요?',
        example_zh: '冷冻柜里有冰淇淋吗？',
        example_pronunciation: 'naengdonggo-e aiseukeulim innayo?'
      },
      {
        id: 'similar_item',
        ko: '비슷한 거 있어요?',
        pronunciation: 'bi-seu-tan geo iss-eo-yo',
        zh: '有类似的吗？',
        example_ko: '이거랑 비슷한 거 있어요?',
        example_zh: '有和这个类似的吗？',
        example_pronunciation: 'igeorang biseutan geo isseoyo?'
      },
      {
        id: 'how_much',
        ko: '이거 얼마예요?',
        pronunciation: 'i-geo eol-ma-ye-yo',
        zh: '这个多少钱？',
        example_ko: '이 과자 얼마예요?',
        example_zh: '这个零食多少钱？',
        example_pronunciation: 'i gwaja eolmayeyo?'
      },
      {
        id: 'cheaper_option',
        ko: '더 싼 거 있어요?',
        pronunciation: 'deo ssan geo iss-eo-yo',
        zh: '有更便宜的吗？',
        example_ko: '이거보다 싼 거 있나요?',
        example_zh: '有比这个便宜的吗？',
        example_pronunciation: 'igeoboda ssan geo innayo?'
      }
    ],
    lunchbox: [
      {
        id: 'recommend_lunchbox',
        ko: '어떤 도시락이 맛있어요?',
        pronunciation: 'eo-tteon do-si-rak-i ma-siss-eo-yo',
        zh: '哪个便当好吃？',
        example_ko: '인기 있는 도시락 뭐예요?',
        example_zh: '受欢迎的便当是什么？',
        example_pronunciation: 'ingi-inneun dosirak mwoyeyo?'
      },
      {
        id: 'microwave_please',
        ko: '전자레인지 써도 돼요?',
        pronunciation: 'jeon-ja-re-in-ji sseo-do dwae-yo',
        zh: '可以用微波炉吗？',
        example_ko: '도시락 데우고 싶어요',
        example_zh: '我想加热便当',
        example_pronunciation: 'dosirak deugo sipeoyo'
      },
      {
        id: 'heat_time',
        ko: '몇 분 돌리면 돼요?',
        pronunciation: 'myeot bun dol-li-myeon dwae-yo',
        zh: '转几分钟就行？',
        example_ko: '이거 2분 정도 데우면 돼요?',
        example_zh: '这个加热2分钟就行吗？',
        example_pronunciation: 'igeo i-bun jeongdo daeumyeon dwaeyo?'
      },
      {
        id: 'fresh_lunchbox',
        ko: '방금 나온 도시락 있어요?',
        pronunciation: 'bang-geum na-on do-si-rak iss-eo-yo',
        zh: '有刚出的便当吗？',
        example_ko: '따뜻한 도시락 있어요?',
        example_zh: '有热便当吗？',
        example_pronunciation: 'ttatteutan dosirak isseoyo?'
      },
      {
        id: 'spicy_level',
        ko: '이거 매워요?',
        pronunciation: 'i-geo mae-wo-yo',
        zh: '这个辣吗？',
        example_ko: '안 매운 도시락 있어요?',
        example_zh: '有不辣的便当吗？',
        example_pronunciation: 'an maeun dosirak isseoyo?'
      },
      {
        id: 'korean_meal',
        ko: '한국식 도시락 있어요?',
        pronunciation: 'han-guk-sik do-si-rak iss-eo-yo',
        zh: '有韩式便当吗？',
        example_ko: '김치찜이나 불고기 도시락 있나요?',
        example_zh: '有泡菜炖肉或烤肉便当吗？',
        example_pronunciation: 'gimchijjimina bulgogi dosirak innayo?'
      },
      {
        id: 'cheap_meal',
        ko: '싸고 맛있는 도시락 있어요?',
        pronunciation: 'ssa-go ma-sinn-neun do-si-rak iss-eo-yo',
        zh: '有便宜又好吃的便当吗？',
        example_ko: '5000원 이하 도시락 있나요?',
        example_zh: '有5000韩元以下的便当吗？',
        example_pronunciation: 'ocheon-won iha dosirak innayo?'
      },
      {
        id: 'rice_bowl',
        ko: '즉석밥도 있어요?',
        pronunciation: 'jeuk-seok-bap-do iss-eo-yo',
        zh: '也有速食米饭吗？',
        example_ko: '밥만 따로 사고 싶어요',
        example_zh: '我只想买米饭',
        example_pronunciation: 'bapman ttaro sago sipeoyo'
      },
      {
        id: 'sandwich',
        ko: '샌드위치도 있어요?',
        pronunciation: 'saen-deu-wi-chi-do iss-eo-yo',
        zh: '也有三明治吗？',
        example_ko: '가벼운 샌드위치 사고 싶어요',
        example_zh: '我想买轻便的三明治',
        example_pronunciation: 'gabyeoun saendeuwichi sago sipeoyo'
      },
      {
        id: 'discount_lunchbox',
        ko: '할인하는 도시락 있어요?',
        pronunciation: 'hal-in-ha-neun do-si-rak iss-eo-yo',
        zh: '有打折的便当吗？',
        example_ko: '저녁 시간 할인 도시락 있어요?',
        example_zh: '有晚餐时间打折便当吗？',
        example_pronunciation: 'jeonyeok sigan halin dosirak isseoyo?'
      },
      {
        id: 'salad',
        ko: '샐러드도 있어요?',
        pronunciation: 'sael-leo-deu-do iss-eo-yo',
        zh: '也有沙拉吗？',
        example_ko: '건강한 샐러드 사고 싶어요',
        example_zh: '我想买健康的沙拉',
        example_pronunciation: 'geonganhan saelleodeu sago sipeoyo'
      }
    ],
    parcel: [
      {
        id: 'send_parcel',
        ko: '택배 보내고 싶어요',
        pronunciation: 'taek-bae bo-nae-go si-peo-yo',
        zh: '我想寄快递',
        example_ko: '국내 택배 보내려고 해요',
        example_zh: '我想寄国内快递',
        example_pronunciation: 'gungnae taekbae bonaeryeogo haeyo'
      },
      {
        id: 'cu_postbox',
        ko: 'CU 택배 보낼 수 있어요?',
        pronunciation: 'si-yu taek-bae bo-nael su iss-eo-yo',
        zh: '可以在CU寄快递吗？',
        example_ko: 'CU POST 서비스 되나요?',
        example_zh: 'CU POST服务可以吗？',
        example_pronunciation: 'CU POST seobiseu doenayo?'
      },
      {
        id: 'gs_postbox',
        ko: 'GS편의점택배 되나요?',
        pronunciation: 'GS-pyeon-ui-jeom-taek-bae doe-na-yo',
        zh: 'GS便利店快递可以吗？',
        example_ko: 'GS편의점에서 택배 접수해요?',
        example_zh: 'GS便利店可以收快递吗？',
        example_pronunciation: 'GS-pyeonyijeomeseo taekbae jeopsurhaeyo?'
      },
      {
        id: 'parcel_fee',
        ko: '택배비 얼마예요?',
        pronunciation: 'taek-bae-bi eol-ma-ye-yo',
        zh: '快递费多少钱？',
        example_ko: '서울까지 보내는데 얼마예요?',
        example_zh: '寄到首尔要多少钱？',
        example_pronunciation: 'seoul-kkaji bonaeneunde eolmayeyo?'
      },
      {
        id: 'parcel_size',
        ko: '이 크기 보낼 수 있어요?',
        pronunciation: 'i keu-gi bo-nael su iss-eo-yo',
        zh: '这个尺寸可以寄吗？',
        example_ko: '너무 큰가요?',
        example_zh: '会不会太大？',
        example_pronunciation: 'neomu keungayo?'
      },
      {
        id: 'receive_parcel',
        ko: '택배 찾으러 왔어요',
        pronunciation: 'taek-bae chat-eu-reo wass-eo-yo',
        zh: '我来取快递',
        example_ko: '택배 도착 문자 받았어요',
        example_zh: '我收到快递到达短信',
        example_pronunciation: 'taekbae dochak munja badasseyo'
      },
      {
        id: 'parcel_code',
        ko: '송장번호 알려드릴게요',
        pronunciation: 'song-jang-beon-ho al-lyeo-deu-ril-ge-yo',
        zh: '我告诉您运单号',
        example_ko: '택배 송장번호가 필요해요?',
        example_zh: '需要快递单号吗？',
        example_pronunciation: 'taekbae songjang-beonho-ga piryohaeyo?'
      },
      {
        id: 'parcel_box',
        ko: '박스 필요해요',
        pronunciation: 'bak-seu pi-ryo-hae-yo',
        zh: '我需要箱子',
        example_ko: '택배 보낼 박스 있어요?',
        example_zh: '有寄快递的箱子吗？',
        example_pronunciation: 'taekbae bonael bakseu isseoyo?'
      },
      {
        id: 'bubble_wrap',
        ko: '뽁뽁이 있어요?',
        pronunciation: 'ppok-ppok-i iss-eo-yo',
        zh: '有泡沫包装纸吗？',
        example_ko: '포장재료 사고 싶어요',
        example_zh: '我想买包装材料',
        example_pronunciation: 'pojang-jaeryo sago sipeoyo'
      },
      {
        id: 'parcel_time',
        ko: '언제 도착해요?',
        pronunciation: 'eon-je do-chak-hae-yo',
        zh: '什么时候到？',
        example_ko: '내일까지 도착할 수 있어요?',
        example_zh: '明天能到吗？',
        example_pronunciation: 'naeil-kkaji dochakal su isseoyo?'
      }
    ],
    atm: [
      {
        id: 'withdraw_money',
        ko: '돈 뽑고 싶어요',
        pronunciation: 'don ppop-go si-peo-yo',
        zh: '我想取钱',
        example_ko: 'ATM에서 돈 뽑고 싶어요',
        example_zh: '我想从ATM取钱',
        example_pronunciation: 'ATM-eseo don ppopgo sipeoyo'
      },
      {
        id: 'atm_fee',
        ko: '수수료 얼마예요?',
        pronunciation: 'su-su-ryo eol-ma-ye-yo',
        zh: '手续费多少？',
        example_ko: 'ATM 수수료가 비싸요?',
        example_zh: 'ATM手续费贵吗？',
        example_pronunciation: 'ATM susuryo-ga bissayo?'
      },
      {
        id: 'foreign_card',
        ko: '해외카드 돼요?',
        pronunciation: 'hae-oe-ka-deu dwae-yo',
        zh: '海外卡可以吗？',
        example_ko: '외국 카드로 인출 돼요?',
        example_zh: '用外国卡可以取钱吗？',
        example_pronunciation: 'oeguk kadeuro inchul dwaeyo?'
      },
      {
        id: 'visa_mastercard',
        ko: '비자 마스터카드 돼요?',
        pronunciation: 'bi-ja ma-seu-teo-ka-deu dwae-yo',
        zh: 'VISA万事达卡可以吗？',
        example_ko: '비자카드로 출금할 수 있어요?',
        example_zh: '可以用VISA卡取钱吗？',
        example_pronunciation: 'bijaka-deuro chulgeum-hal su isseoyo?'
      },
      {
        id: 'exchange_money',
        ko: '환전도 돼요?',
        pronunciation: 'hwan-jeon-do dwae-yo',
        zh: '也可以换钱吗？',
        example_ko: '달러를 원화로 바꿀 수 있어요?',
        example_zh: '可以把美元换成韩元吗？',
        example_pronunciation: 'dalleoreul wonhwa-ro bakkul su isseoyo?'
      },
      {
        id: 'daily_limit',
        ko: '하루에 얼마까지 뽑을 수 있어요?',
        pronunciation: 'ha-ru-e eol-ma-kka-ji ppop-eul su iss-eo-yo',
        zh: '一天可以取多少钱？',
        example_ko: '인출 한도가 있어요?',
        example_zh: '有取款限额吗？',
        example_pronunciation: 'inchul hando-ga isseoyo?'
      },
      {
        id: 'atm_not_working',
        ko: 'ATM이 안 돼요',
        pronunciation: 'ATM-i an dwae-yo',
        zh: 'ATM不工作',
        example_ko: '카드가 안 들어가요',
        example_zh: '卡插不进去',
        example_pronunciation: 'kadeuga an deureogayo'
      },
      {
        id: 'card_stuck',
        ko: '카드가 안 나와요',
        pronunciation: 'ka-deu-ga an na-wa-yo',
        zh: '卡出不来',
        example_ko: '카드가 ATM에 끼었어요',
        example_zh: '卡卡在ATM里了',
        example_pronunciation: 'kadeuga ATM-e kkieosseoyo'
      },
      {
        id: 'receipt_needed',
        ko: '영수증 뽑을 수 있어요?',
        pronunciation: 'yeong-su-jeung ppop-eul su iss-eo-yo',
        zh: '可以打印收据吗？',
        example_ko: 'ATM 영수증 필요해요',
        example_zh: '我需要ATM收据',
        example_pronunciation: 'ATM yeongsujeung piryohaeyo'
      },
      {
        id: 'balance_check',
        ko: '잔액 확인하고 싶어요',
        pronunciation: 'jan-aek hwak-in-ha-go si-peo-yo',
        zh: '我想查余额',
        example_ko: '통장 잔고 봐도 돼요?',
        example_zh: '可以看账户余额吗？',
        example_pronunciation: 'tongjang jango bwado dwaeyo?'
      }
    ],
    charge: [
      {
        id: 'charge_phone',
        ko: '휴대폰 충전하고 싶어요',
        pronunciation: 'hyu-dae-pon chung-jeon-ha-go si-peo-yo',
        zh: '我想给手机充电',
        example_ko: '핸드폰 충전기 있어요?',
        example_zh: '有手机充电器吗？',
        example_pronunciation: 'haendeupon chungjeongi isseoyo?'
      },
      {
        id: 'phone_cable',
        ko: '충전 케이블 있어요?',
        pronunciation: 'chung-jeon ke-i-beul iss-eo-yo',
        zh: '有充电线吗？',
        example_ko: 'C타입 충전기 팔아요?',
        example_zh: '卖C型充电器吗？',
        example_pronunciation: 'C-taip chungjeongi parayo?'
      },
      {
        id: 'portable_charger',
        ko: '보조배터리 있어요?',
        pronunciation: 'bo-jo-bae-teo-ri iss-eo-yo',
        zh: '有充电宝吗？',
        example_ko: '휴대용 충전기 사고 싶어요',
        example_zh: '我想买便携式充电器',
        example_pronunciation: 'hyudaeyong chungjeongi sago sipeoyo'
      },
      {
        id: 'charge_transport',
        ko: '교통카드 충전하고 싶어요',
        pronunciation: 'gyo-tong-ka-deu chung-jeon-ha-go si-peo-yo',
        zh: '我想给交通卡充值',
        example_ko: 'T머니 충전 어떻게 해요?',
        example_zh: 'T-money怎么充值？',
        example_pronunciation: 'Timeoni chungjeon eotteoke haeyo?'
      },
      {
        id: 'how_much_charge',
        ko: '얼마 충전할까요?',
        pronunciation: 'eol-ma chung-jeon-hal-kka-yo',
        zh: '充值多少钱？',
        example_ko: '1만원 충전해주세요',
        example_zh: '请充值1万韩元',
        example_pronunciation: 'il-manwon chungjeonhaejuseyo'
      },
      {
        id: 'wibro_card',
        ko: '와이브로 카드 충전돼요?',
        pronunciation: 'wa-i-beu-ro ka-deu chung-jeon-dwae-yo',
        zh: '可以给WiBro卡充值吗？',
        example_ko: '인터넷 카드 충전하고 싶어요',
        example_zh: '我想给上网卡充值',
        example_pronunciation: 'inteoneu kadeu chungjeonhago sipeoyo'
      },
      {
        id: 'game_card',
        ko: '게임 머니 충전돼요?',
        pronunciation: 'ge-im meo-ni chung-jeon-dwae-yo',
        zh: '可以充游戏币吗？',
        example_ko: '넥슨 캐시 충전하고 싶어요',
        example_zh: '我想充Nexon现金',
        example_pronunciation: 'nekseon kaesi chungjeonhago sipeoyo'
      },
      {
        id: 'prepaid_card',
        ko: '선불카드 충전해주세요',
        pronunciation: 'seon-bul-ka-deu chung-jeon-hae-ju-se-yo',
        zh: '请给预付卡充值',
        example_ko: '문화상품권 충전해주세요',
        example_zh: '请给文化商品券充值',
        example_pronunciation: 'munhwa-sangpumgwon chungjeonhaejuseyo'
      },
      {
        id: 'gift_card',
        ko: '기프트카드 충전 되나요?',
        pronunciation: 'gi-peu-teu-ka-deu chung-jeon doe-na-yo',
        zh: '礼品卡可以充值吗？',
        example_ko: '구글플레이 기프트카드 있어요?',
        example_zh: '有谷歌Play礼品卡吗？',
        example_pronunciation: 'gugeul-peullei gipeuteukadeu isseoyo?'
      },
      {
        id: 'recharge_machine',
        ko: '충전기 어떻게 써요?',
        pronunciation: 'chung-jeon-gi eo-tteo-ke sseo-yo',
        zh: '充值机怎么用？',
        example_ko: '교통카드 충전기 사용법 알려주세요',
        example_zh: '请告诉我交通卡充值机使用方法',
        example_pronunciation: 'gyotong-kadeu chungjeongi sayongbeop allyeojuseyo'
      }
    ],
    print: [
      {
        id: 'want_print',
        ko: '프린트하고 싶어요',
        pronunciation: 'peu-rin-teu-ha-go si-peo-yo',
        zh: '我想打印',
        example_ko: '서류 프린트하려고 해요',
        example_zh: '我想打印文件',
        example_pronunciation: 'seoryu peurinteuharyeogo haeyo'
      },
      {
        id: 'multi_printer',
        ko: '복합기 어떻게 써요?',
        pronunciation: 'bok-hap-gi eo-tteo-ke sseo-yo',
        zh: '多功能打印机怎么用？',
        example_ko: '멀티복합기 사용법 알려주세요',
        example_zh: '请告诉我多功能打印机用法',
        example_pronunciation: 'meolti-bokhapgi sayongbeop allyeojuseyo'
      },
      {
        id: 'color_print',
        ko: '컬러로 프린트해주세요',
        pronunciation: 'keol-leo-ro peu-rin-teu-hae-ju-se-yo',
        zh: '请彩色打印',
        example_ko: '이 사진 컬러로 프린트해주세요',
        example_zh: '请彩色打印这张照片',
        example_pronunciation: 'i sajin keolerro peurinteuhae juseyo'
      },
      {
        id: 'black_white_print',
        ko: '흑백으로 프린트할게요',
        pronunciation: 'heuk-baek-eu-ro peu-rin-teu-hal-ge-yo',
        zh: '我要黑白打印',
        example_ko: '흑백이면 더 싸죠?',
        example_zh: '黑白的更便宜吧？',
        example_pronunciation: 'heukbaegimyeon deo ssajyo?'
      },
      {
        id: 'copy_id',
        ko: '신분증 복사하고 싶어요',
        pronunciation: 'sin-bun-jeung bok-sa-ha-go si-peo-yo',
        zh: '我想复印身份证',
        example_ko: '여권 복사 어떻게 해요?',
        example_zh: '怎么复印护照？',
        example_pronunciation: 'yeogwon boksa eotteoke haeyo?'
      },
      {
        id: 'usb_print',
        ko: 'USB로 프린트할 수 있어요?',
        pronunciation: 'USB-ro peu-rin-teu-hal su iss-eo-yo',
        zh: '可以用USB打印吗？',
        example_ko: 'USB 꽂는 곳이 어디예요?',
        example_zh: 'USB插口在哪里？',
        example_pronunciation: 'USB kkotneun gosi eodiyeyo?'
      },
      {
        id: 'scan_service',
        ko: '스캔도 할 수 있어요?',
        pronunciation: 'seu-kaen-do hal su iss-eo-yo',
        zh: '也可以扫描吗？',
        example_ko: '서류 스캔해서 이메일로 보낼 수 있어요?',
        example_zh: '可以扫描文件后发邮件吗？',
        example_pronunciation: 'seoryu seukaenaeseo imeilro bonael su isseoyo?'
      },
      {
        id: 'print_price',
        ko: '프린트 요금이 얼마예요?',
        pronunciation: 'peu-rin-teu yo-geum-i eol-ma-ye-yo',
        zh: '打印费多少钱？',
        example_ko: '한 장에 얼마예요?',
        example_zh: '一张多少钱？',
        example_pronunciation: 'han jang-e eolmayeyo?'
      },
      {
        id: 'paper_size',
        ko: 'A4 말고 다른 크기도 돼요?',
        pronunciation: 'A-sa mal-go da-reun keu-gi-do dwae-yo',
        zh: '除了A4还有其他尺寸吗？',
        example_ko: 'A3 크기로 프린트할 수 있어요?',
        example_zh: '可以打印A3尺寸吗？',
        example_pronunciation: 'A-sam keu-giro peurinteuhal su isseoyo?'
      },
      {
        id: 'mobile_print',
        ko: '핸드폰에서 바로 프린트할 수 있어요?',
        pronunciation: 'haen-deu-pon-e-seo ba-ro peu-rin-teu-hal su iss-eo-yo',
        zh: '可以直接从手机打印吗？',
        example_ko: '앱으로 프린트 되나요?',
        example_zh: '可以用应用程序打印吗？',
        example_pronunciation: 'aepeuro peurinteu doenayo?'
      }
    ],
    promotion: [
      {
        id: 'one_plus_one',
        ko: '1+1 행사하는 거 있어요?',
        pronunciation: 'won peul-leo-seu won haeng-sa-ha-neun geo iss-eo-yo',
        zh: '有1+1活动的吗？',
        example_ko: '과자 1+1 행사 뭐 있어요?',
        example_zh: '零食有什么1+1活动？',
        example_pronunciation: 'gwaja won peulleoseu won haengsa mwo isseoyo?'
      },
      {
        id: 'two_plus_one',
        ko: '2+1 행사도 있어요?',
        pronunciation: 'i peul-leo-seu won haeng-sa-do iss-eo-yo',
        zh: '也有2+1活动吗？',
        example_ko: '음료수 2+1 행사 중이에요?',
        example_zh: '饮料有2+1活动吗？',
        example_pronunciation: 'eumryosu i peulleoseu won haengsa jung-ieyo?'
      },
      {
        id: 'discount_time',
        ko: '언제 할인해요?',
        pronunciation: 'eon-je hal-in-hae-yo',
        zh: '什么时候打折？',
        example_ko: '저녁에 도시락 할인하나요?',
        example_zh: '晚上便当打折吗？',
        example_pronunciation: 'jeonyeoge dosirak halinhanayo?'
      },
      {
        id: 'how_to_get_deal',
        ko: '이 행사 어떻게 받아요?',
        pronunciation: 'i haeng-sa eo-tteo-ke bad-a-yo',
        zh: '这个活动怎么参加？',
        example_ko: '1+1 행사는 자동으로 적용돼요?',
        example_zh: '1+1活动是自动适用的吗？',
        example_pronunciation: 'won peulleoseu won haengsaneun jadongeuro jeokyongdwaeyo?'
      },
      {
        id: 'event_period',
        ko: '이 행사 언제까지예요?',
        pronunciation: 'i haeng-sa eon-je-kka-ji-ye-yo',
        zh: '这个活动到什么时候？',
        example_ko: '행사 기간이 얼마나 남았어요?',
        example_zh: '活动期间还剩多久？',
        example_pronunciation: 'haengsa gigani eolmana namasseoyo?'
      },
      {
        id: 'which_items',
        ko: '어떤 상품이 행사 상품이에요?',
        pronunciation: 'eo-tteon sang-pum-i haeng-sa sang-pum-i-e-yo',
        zh: '哪些商品是活动商品？',
        example_ko: '행사 표시가 어디에 있어요?',
        example_zh: '活动标识在哪里？',
        example_pronunciation: 'haengsa pyosiga eodie isseoyo?'
      },
      {
        id: 'discount_item',
        ko: '할인하는 상품 있어요?',
        pronunciation: 'hal-in-ha-neun sang-pum iss-eo-yo',
        zh: '有打折商品吗？',
        example_ko: '오늘 할인하는 거 뭐 있어요?',
        example_zh: '今天有什么打折的？',
        example_pronunciation: 'oneul halinneun geo mwo isseoyo?'
      },
      {
        id: 'expired_soon',
        ko: '유통기한 임박 상품 있어요?',
        pronunciation: 'yu-tong-gi-han im-bak sang-pum iss-eo-yo',
        zh: '有临期商品吗？',
        example_ko: '유통기한 가까운 건 더 싸나요?',
        example_zh: '临近保质期的更便宜吗？',
        example_pronunciation: 'yutong-gihan gakkaun geon deo ssanayo?'
      },
      {
        id: 'membership_discount',
        ko: '멤버십 할인 있어요?',
        pronunciation: 'mem-beo-sip hal-in iss-eo-yo',
        zh: '有会员折扣吗？',
        example_ko: '회원 가입하면 할인돼요?',
        example_zh: '注册会员有折扣吗？',
        example_pronunciation: 'hoewon gaiphamyeon halindwaeyo?'
      },
      {
        id: 'combo_deal',
        ko: '세트로 사면 더 싸져요?',
        pronunciation: 'se-teu-ro sa-myeon deo ssa-jyeo-yo',
        zh: '套餐购买更便宜吗？',
        example_ko: '조합해서 사면 할인되는 거 있어요?',
        example_zh: '有组合购买折扣吗？',
        example_pronunciation: 'johapaeseo samyeon halindoeneun geo isseoyo?'
      }
    ],
    brands: [
      {
        id: 'cu_special',
        ko: 'CU만의 특별한 상품이 있어요',
        pronunciation: 'si-yu-man-ui teuk-byeol-han sang-pum-i iss-eo-yo',
        zh: 'CU有特别的商品',
        example_ko: 'CU 도시락이 맛있다고 해요',
        example_zh: '听说CU便当很好吃',
        example_pronunciation: 'CU dosiragi masitdago haeyo'
      },
      {
        id: 'gs25_fresh',
        ko: 'GS25는 신선한 음식이 많아요',
        pronunciation: 'GS i-sib-o-neun sin-seon-han eum-sik-i man-a-yo',
        zh: 'GS25新鲜食品很多',
        example_ko: 'GS25 갓프레시 음식 어때요?',
        example_zh: 'GS25 GOD FRESH食品怎么样？',
        example_pronunciation: 'GS25 gaspeureusi eumsik eottaeyo?'
      },
      {
        id: 'seven_eleven',
        ko: '세븐일레븐은 일본풍 상품이 있어요',
        pronunciation: 'se-beun-il-le-beun-eun il-bon-pung sang-pum-i iss-eo-yo',
        zh: '7-ELEVEN有日式商品',
        example_ko: '세븐일레븐 디저트 추천해요',
        example_zh: '推荐7-ELEVEN甜点',
        example_pronunciation: 'sebeunil-lebeon dijeoteu chucheonhaeyo'
      },
      {
        id: 'emart24',
        ko: '이마트24는 이마트 브랜드 상품이 있어요',
        pronunciation: 'i-ma-teu i-sib-sa-neun i-ma-teu beu-raen-deu sang-pum-i iss-eo-yo',
        zh: 'E-mart24有E-mart品牌商品',
        example_ko: '이마트 PB 상품 가격이 저렴해요',
        example_zh: 'E-mart自有品牌商品价格便宜',
        example_pronunciation: 'imateu PB sangpum gagyeogi jeoryeomhaeyo'
      },
      {
        id: 'brand_difference',
        ko: '편의점마다 뭐가 다른가요?',
        pronunciation: 'pyeon-ui-jeom-ma-da mwo-ga da-reun-ga-yo',
        zh: '每个便利店有什么不同？',
        example_ko: '어떤 편의점이 더 좋아요?',
        example_zh: '哪个便利店更好？',
        example_pronunciation: 'eotteon pyeonyijeomi deo joayo?'
      },
      {
        id: 'cu_only',
        ko: 'CU에서만 파는 거 있어요?',
        pronunciation: 'si-yu-e-seo-man pa-neun geo iss-eo-yo',
        zh: '有只在CU卖的吗？',
        example_ko: 'CU 전용 브랜드가 있나요?',
        example_zh: '有CU专属品牌吗？',
        example_pronunciation: 'CU jeonyong beuraendi innayo?'
      },
      {
        id: 'gs_service',
        ko: 'GS25 서비스가 좋다고 들었어요',
        pronunciation: 'GS i-sib-o seo-bi-seu-ga jo-ta-go deul-eoss-eo-yo',
        zh: '听说GS25服务很好',
        example_ko: 'GS25 택배 서비스 편해요?',
        example_zh: 'GS25快递服务方便吗？',
        example_pronunciation: 'GS25 taekbae seobiseu pyeonhaeyo?'
      },
      {
        id: 'seven_coffee',
        ko: '세븐일레븐 커피가 맛있다고 해요',
        pronunciation: 'se-beun-il-le-beun keo-pi-ga ma-siss-da-go hae-yo',
        zh: '听说7-ELEVEN咖啡很好喝',
        example_ko: '세븐카페 추천하시나요?',
        example_zh: '推荐Seven Cafe吗？',
        example_pronunciation: 'sebeun-kape chucheonhasinayo?'
      },
      {
        id: 'emart_cheap',
        ko: '이마트24가 제일 싸다고 들었어요',
        pronunciation: 'i-ma-teu i-sib-sa-ga je-il ssa-da-go deul-eoss-eo-yo',
        zh: '听说E-mart24最便宜',
        example_ko: '이마트24 가격이 정말 저렴해요?',
        example_zh: 'E-mart24价格真的很便宜吗？',
        example_pronunciation: 'imateu24 gagyeogi jeongmal jeoryeomhaeyo?'
      },
      {
        id: 'which_brand',
        ko: '어떤 편의점을 추천하세요?',
        pronunciation: 'eo-tteon pyeon-ui-jeom-eul chu-cheon-ha-se-yo',
        zh: '推荐哪个便利店？',
        example_ko: '처음 가는데 어디가 좋을까요?',
        example_zh: '第一次去，哪里比较好？',
        example_pronunciation: 'cheoeum ganeunde eodiga joeulkkayo?'
      }
    ]
  }

  const currentCards = activeTab === 'saved'
    ? Object.values(cardData).flat().filter(c => bookmarkedCards.includes(c.id))
    : cardData[activeTab] || []

  return (
    <div className="space-y-4">
      {toastMessage && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-black text-white px-4 py-2 rounded-full text-sm">
          {toastMessage}
        </div>
      )}

      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-full text-xs font-medium shrink-0 transition ${
              activeTab === tab.id ? 'bg-[#111827] text-white' : 'bg-gray-100 text-gray-600'
            }`}
          >
            <tab.icon size={14} />
            {L(lang, tab.name)}
            {tab.id === 'saved' && bookmarkedCards.length > 0 && (
              <span className="ml-0.5 text-[10px]">({bookmarkedCards.length})</span>
            )}
          </button>
        ))}
      </div>

      {currentCards.length === 0 && activeTab === 'saved' && (
        <div className="text-center py-12 text-sm text-gray-400">
          {L(lang, { ko: '저장한 표현이 없습니다', zh: '暂无收藏', en: 'No saved phrases' })}
        </div>
      )}

      <div className="space-y-3">
        {currentCards.map(card => (
          <KoreanPhraseCard
            key={card.id}
            korean={card.ko}
            romanization={card.pronunciation}
            chinese={card.zh}
            exampleKo={card.example_ko}
            exampleZh={card.example_zh}
            exampleRoman={card.example_pronunciation}
            illustration="convenience"
            onCopy={() => copyToClipboard(card.ko + '\n' + (card.example_ko || ''), lang)}
            onSpeak={() => speak(card.ko)}
            onBookmark={() => toggleBookmark(card.id)}
            bookmarked={bookmarkedCards.includes(card.id)}
            lang={lang}
          />
        ))}
      </div>
    </div>
  )
}
