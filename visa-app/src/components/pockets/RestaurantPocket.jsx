import { useState } from 'react'
import { DoorOpen, UtensilsCrossed, CreditCard, ChefHat, Utensils, AlertTriangle, Volume2, Bookmark } from 'lucide-react'
import KoreanPhraseCard, { useKoreanPocket } from './KoreanPhraseCard'

const L = (lang, text) => text[lang] || text['ko']

export default function RestaurantPocket({ lang }) {
  const [activeTab, setActiveTab] = useState('entrance')
  const { bookmarkedCards, toastMessage, copyToClipboard, speak, toggleBookmark } = useKoreanPocket('restaurant_bookmarks')

  const tabs = [
    { id: 'entrance', name: { ko: '입장', zh: '入店', en: 'Entrance' }, icon: DoorOpen },
    { id: 'order', name: { ko: '주문', zh: '点餐', en: 'Order' }, icon: UtensilsCrossed },
    { id: 'allergy', name: { ko: '알레르기', zh: '过敏', en: 'Allergy' }, icon: AlertTriangle },
    { id: 'payment', name: { ko: '계산', zh: '结账', en: 'Payment' }, icon: CreditCard },
    { id: 'banchan', name: { ko: '반찬', zh: '小菜', en: 'Banchan' }, icon: ChefHat },
    { id: 'reservation', name: { ko: '예약', zh: '预约', en: 'Reservation' }, icon: Volume2 },
    { id: 'menu', name: { ko: '메뉴판 읽기', zh: '看菜单', en: 'Menu Reading' }, icon: Utensils },
    { id: 'delivery', name: { ko: '배달앱', zh: '外卖App', en: 'Delivery App' }, icon: ChefHat },
    { id: 'etiquette', name: { ko: '식사예절', zh: '用餐礼仪', en: 'Dining Etiquette' }, icon: UtensilsCrossed },
    { id: 'tip', name: { ko: '팁문화', zh: '小费文化', en: 'Tip Culture' }, icon: CreditCard },
    { id: 'saved', name: { ko: '저장한 표현', zh: '收藏表达', en: 'Saved' }, icon: Bookmark }
  ]

  const cardData = {
    entrance: [
      {
        id: 'hello',
        ko: '안녕하세요',
        pronunciation: 'ān-nyeong-ha-se-yo',
        zh: '你好',
        example_ko: '안녕하세요, 예약한 김철수입니다',
        example_zh: '你好，我是预约的金哲洙',
        example_pronunciation: 'annyeonghaseyo, yeyakhan gimcheolsu-imnida'
      },
      {
        id: 'people_count',
        ko: '2명이요',
        pronunciation: '2-myeong-i-yo',
        zh: '2位',
        example_ko: '2명 자리 있나요?',
        example_zh: '有2位的位置吗？',
        example_pronunciation: '2myeong jari innayo?'
      },
      {
        id: 'reservation',
        ko: '예약했어요',
        pronunciation: 'ye-yak-haess-eo-yo',
        zh: '我预约了',
        example_ko: '7시에 예약했어요',
        example_zh: '我7点预约了',
        example_pronunciation: 'ilgopsi-e yeyakhaesseoyo'
      },
      {
        id: 'seats_available',
        ko: '자리 있어요?',
        pronunciation: 'ja-ri iss-eo-yo',
        zh: '有位子吗？',
        example_ko: '창가 자리 있어요?',
        example_zh: '有靠窗的位子吗？',
        example_pronunciation: 'changgajari isseoyo?'
      },
      {
        id: 'wait_time',
        ko: '얼마나 기다려요?',
        pronunciation: 'eol-ma-na gi-da-ryeo-yo',
        zh: '要等多久？',
        example_ko: '30분 정도 기다려요',
        example_zh: '大概等30分钟',
        example_pronunciation: 'samsipbun jeongdo gidaryeoyo'
      },
      {
        id: 'window_seat',
        ko: '창가 자리 주세요',
        pronunciation: 'chang-ga ja-ri ju-se-yo',
        zh: '请给我靠窗的位子',
        example_ko: '창가 자리가 편해서 창가로 주세요',
        example_zh: '靠窗的位子比较舒适，请给我靠窗的',
        example_pronunciation: 'changgajariga pyeonhaeseo changgaro juseyo'
      },
      {
        id: 'private_room',
        ko: '룸 있어요?',
        pronunciation: 'rum iss-eo-yo',
        zh: '有包间吗？',
        example_ko: '조용한 룸이나 프라이빗한 공간 있어요?',
        example_zh: '有安静的包间或私人空间吗？',
        example_pronunciation: 'joyonghan rumi-na peuraibethan gonggan isseoyo?'
      },
      {
        id: 'table_number',
        ko: '몇 번 테이블이에요?',
        pronunciation: 'myeot beon te-i-beul-i-e-yo',
        zh: '是几号桌？',
        example_ko: '저희가 앉을 테이블이 몇 번이에요?',
        example_zh: '我们坐的桌子是几号？',
        example_pronunciation: 'jeohuiga anjeul teibeuri myeot beonieyo?'
      },
      {
        id: 'smoking_section',
        ko: '흡연석 있어요?',
        pronunciation: 'heu-byeon-seok iss-eo-yo',
        zh: '有吸烟区吗？',
        example_ko: '흡연석이나 금연석 어디 앉을까요?',
        example_zh: '吸烟区还是无烟区，坐哪里好呢？',
        example_pronunciation: 'heubyeonseogi-na geumyeonseok eodi anjeulkkayo?'
      },
      {
        id: 'follow_me',
        ko: '따라오세요',
        pronunciation: 'tta-ra-o-se-yo',
        zh: '请跟我来',
        example_ko: '이쪽으로 따라오세요',
        example_zh: '请跟我往这边来',
        example_pronunciation: 'ijjog-euro ttaraoseyo'
      }
    ],
    order: [
      {
        id: 'this_please',
        ko: '이거 주세요',
        pronunciation: 'i-geo ju-se-yo',
        zh: '请给我这个',
        example_ko: '이거 주세요, 매운 걸로요',
        example_zh: '请给我这个，要辣的',
        example_pronunciation: 'igeo juseyo, maeun geollo-yo'
      },
      {
        id: 'recommend',
        ko: '추천 메뉴 뭐예요?',
        pronunciation: 'chu-cheon me-nyu mwo-ye-yo',
        zh: '推荐菜是什么？',
        example_ko: '가장 인기 있는 추천 메뉴 뭐예요?',
        example_zh: '最受欢迎的推荐菜是什么？',
        example_pronunciation: 'gajang ingi-inneun chucheon menyu mwoyeyo?'
      },
      {
        id: 'no_spicy',
        ko: '매운 거 빼주세요',
        pronunciation: 'mae-un geo ppae-ju-se-yo',
        zh: '请不要放辣的',
        example_ko: '매운 거 빼고 만들어주세요',
        example_zh: '请做不辣的',
        example_pronunciation: 'maeun geo ppaego mandeureo-juseyo'
      },
      {
        id: 'one_more',
        ko: '한 개 더 주세요',
        pronunciation: 'han gae deo ju-se-yo',
        zh: '请再给一个',
        example_ko: '같은 걸로 한 개 더 주세요',
        example_zh: '请再给一个同样的',
        example_pronunciation: 'gateun geollo han gae deo juseyo'
      },
      {
        id: 'water',
        ko: '물 주세요',
        pronunciation: 'mul ju-se-yo',
        zh: '请给我水',
        example_ko: '찬물 좀 주세요',
        example_zh: '请给我一些冰水',
        example_pronunciation: 'chanmul jom juseyo'
      },
      {
        id: 'ready_to_order',
        ko: '주문할게요',
        pronunciation: 'ju-mun-hal-ge-yo',
        zh: '我要点菜',
        example_ko: '메뉴 다 봤으니까 주문할게요',
        example_zh: '菜单都看过了，现在点菜',
        example_pronunciation: 'menyu da bwasseunikka jumunhalgeyo'
      },
      {
        id: 'large_portion',
        ko: '큰 걸로 주세요',
        pronunciation: 'keun geol-lo ju-se-yo',
        zh: '请给我大份的',
        example_ko: '배고픈데 큰 걸로 주세요',
        example_zh: '我很饿，请给我大份的',
        example_pronunciation: 'baegopeu-nde keun geollo juseyo'
      },
      {
        id: 'small_portion',
        ko: '작은 걸로 주세요',
        pronunciation: 'ja-geun geol-lo ju-se-yo',
        zh: '请给我小份的',
        example_ko: '많이 못 먹어서 작은 걸로 주세요',
        example_zh: '吃不了太多，请给我小份的',
        example_pronunciation: 'mani mot meogeoseo jageun geollo juseyo'
      },
      {
        id: 'how_long',
        ko: '얼마나 걸려요?',
        pronunciation: 'eol-ma-na geol-lyeo-yo',
        zh: '需要多长时间？',
        example_ko: '음식 나오는 데 얼마나 걸려요?',
        example_zh: '菜上来需要多长时间？',
        example_pronunciation: 'eumsik naoneun de eolmana geollyeoyo?'
      },
      {
        id: 'side_dishes',
        ko: '사이드 메뉴도 주문해요',
        pronunciation: 'sa-i-deu me-nyu-do ju-mun-hae-yo',
        zh: '也点配菜',
        example_ko: '메인 메뉴랑 사이드 메뉴도 주문해요',
        example_zh: '主菜和配菜都要点',
        example_pronunciation: 'mein menyurang saideu menyudo jumunhaeyo'
      },
      {
        id: 'cancel_order',
        ko: '주문 취소할게요',
        pronunciation: 'ju-mun chwi-so-hal-ge-yo',
        zh: '我要取消订单',
        example_ko: '죄송한데 이 메뉴 주문 취소할게요',
        example_zh: '不好意思，这个菜我要取消',
        example_pronunciation: 'joesonghande i menyu jumun chwisohalgeyo'
      },
      {
        id: 'change_order',
        ko: '주문 바꿀게요',
        pronunciation: 'ju-mun ba-kkul-ge-yo',
        zh: '我要换菜',
        example_ko: '다른 메뉴로 주문 바꿀게요',
        example_zh: '换成别的菜',
        example_pronunciation: 'dareun menyuro jumun bakkulgey'
      }
    ],
    allergy: [
      {
        id: 'have_allergy',
        ko: '알레르기가 있어요',
        pronunciation: 'al-le-reu-gi-ga iss-eo-yo',
        zh: '我有过敏',
        example_ko: '음식 알레르기가 있어서 조심해야 해요',
        example_zh: '我有食物过敏，需要小心',
        example_pronunciation: 'eumsik allereugi-ga isseoseo josimhaeya haeyo'
      },
      {
        id: 'what_ingredients',
        ko: '어떤 재료 들어가요?',
        pronunciation: 'eo-tteon jae-ryo deul-eo-ga-yo',
        zh: '里面有什么食材？',
        example_ko: '이 음식에 어떤 재료가 들어가요?',
        example_zh: '这道菜里面有什么食材？',
        example_pronunciation: 'i eumsikg-e eotteon jaeryoga deul-eogayo?'
      },
      {
        id: 'no_nuts',
        ko: '견과류 못 먹어요',
        pronunciation: 'gyeon-gwa-ryu mot meog-eo-yo',
        zh: '不能吃坚果',
        example_ko: '견과류 알레르기가 있어서 못 먹어요',
        example_zh: '我对坚果过敏，不能吃',
        example_pronunciation: 'gyeonggwaryu allereugiga isseoseo mot meogeoyo'
      },
      {
        id: 'seafood_allergy',
        ko: '해산물 알레르기 있어요',
        pronunciation: 'hae-san-mul al-le-reu-gi iss-eo-yo',
        zh: '我对海鲜过敏',
        example_ko: '새우, 게 같은 해산물 알레르기 있어요',
        example_zh: '对虾、蟹等海鲜过敏',
        example_pronunciation: 'saeu, ge gateun haesanmul allereul isseoyo'
      },
      {
        id: 'dairy_free',
        ko: '유제품 빼주세요',
        pronunciation: 'yu-je-pum ppae-ju-se-yo',
        zh: '请不要放乳制品',
        example_ko: '우유, 치즈 같은 유제품 빼주세요',
        example_zh: '请不要放牛奶、奶酪等乳制品',
        example_pronunciation: 'uyu, chijeu gateun yujepum ppaejuseyo'
      },
      {
        id: 'gluten_free',
        ko: '밀가루 못 먹어요',
        pronunciation: 'mil-ga-ru mot meog-eo-yo',
        zh: '不能吃面粉',
        example_ko: '글루텐 때문에 밀가루 못 먹어요',
        example_zh: '因为麸质不能吃面粉',
        example_pronunciation: 'geulluteu ttaemune milgaru mot meogeoyo'
      },
      {
        id: 'alternative_dish',
        ko: '다른 메뉴 추천해주세요',
        pronunciation: 'da-reun me-nyu chu-cheon-hae-ju-se-yo',
        zh: '请推荐其他菜品',
        example_ko: '알레르기 때문에 먹을 수 없으니 다른 메뉴 추천해주세요',
        example_zh: '因为过敏不能吃，请推荐其他菜品',
        example_pronunciation: 'allereug ttaemune meogeul su eopseuni dareun menyu chucheonhaejuseyo'
      },
      {
        id: 'severe_allergy',
        ko: '심한 알레르기예요',
        pronunciation: 'sim-han al-le-reu-gi-ye-yo',
        zh: '过敏很严重',
        example_ko: '정말 심한 알레르기라서 조심해 주세요',
        example_zh: '过敏很严重，请小心',
        example_pronunciation: 'jeongmal simhan allereugiraseo josimhae juseyo'
      }
    ],
    payment: [
      {
        id: 'bill_please',
        ko: '계산이요',
        pronunciation: 'gye-san-i-yo',
        zh: '结账',
        example_ko: '계산이요, 카드로 할게요',
        example_zh: '结账，用卡支付',
        example_pronunciation: 'gyesaniyo, kadeu-ro halgeyo'
      },
      {
        id: 'card_ok',
        ko: '카드 돼요?',
        pronunciation: 'ka-deu dwae-yo',
        zh: '可以刷卡吗？',
        example_ko: '카드 결제 돼요?',
        example_zh: '可以用卡支付吗？',
        example_pronunciation: 'kadeu gyeolje dwaeyo?'
      },
      {
        id: 'receipt',
        ko: '영수증 주세요',
        pronunciation: 'yeong-su-jeung ju-se-yo',
        zh: '请给我收据',
        example_ko: '영수증 따로 주세요',
        example_zh: '请单独给我收据',
        example_pronunciation: 'yeongsujeung ttaro juseyo'
      },
      {
        id: 'separate_bills',
        ko: '따로따로 계산해주세요',
        pronunciation: 'tta-ro-tta-ro gye-san-hae-ju-se-yo',
        zh: '请分开结账',
        example_ko: 'N빵으로 따로따로 계산해주세요',
        example_zh: '请分N份结账',
        example_pronunciation: 'enbppang-eulo ttarottaro gyesanhae-juseyo'
      },
      {
        id: 'cash_payment',
        ko: '현금으로 낼게요',
        pronunciation: 'hyeon-geum-eu-ro nael-ge-yo',
        zh: '我用现金付',
        example_ko: '카드 말고 현금으로 낼게요',
        example_zh: '不用卡，用现金付',
        example_pronunciation: 'kadeu malgo hyeongeumeu-ro naelgeyo'
      },
      {
        id: 'total_amount',
        ko: '총 얼마예요?',
        pronunciation: 'chong eol-ma-ye-yo',
        zh: '总共多少钱？',
        example_ko: '다 합쳐서 총 얼마예요?',
        example_zh: '全部加起来总共多少钱？',
        example_pronunciation: 'da hapchyeoseo chong eolmayeyo?'
      },
      {
        id: 'discount',
        ko: '할인 돼요?',
        pronunciation: 'hal-in dwae-yo',
        zh: '可以打折吗？',
        example_ko: '학생 할인이나 쿠폰 할인 돼요?',
        example_zh: '有学生折扣或优惠券折扣吗？',
        example_pronunciation: 'haksaeng harini-na kupon harin dwaeyo?'
      },
      {
        id: 'service_charge',
        ko: '서비스 요금 있어요?',
        pronunciation: 'seo-bi-seu yo-geum iss-eo-yo',
        zh: '有服务费吗？',
        example_ko: '계산서에 서비스 요금 포함되어 있어요?',
        example_zh: '账单里包含服务费吗？',
        example_pronunciation: 'gyesanseoe seobiseu yogeum pohamdoeeo isseoyo?'
      },
      {
        id: 'pay_together',
        ko: '같이 낼게요',
        pronunciation: 'ga-chi nael-ge-yo',
        zh: '我们一起付',
        example_ko: '전부 다 같이 낼게요',
        example_zh: '全部我们一起付',
        example_pronunciation: 'jeonbu da gachi naelgeyo'
      },
      {
        id: 'change_money',
        ko: '거스름돈 주세요',
        pronunciation: 'geo-seu-reum-don ju-se-yo',
        zh: '请给我找零',
        example_ko: '거스름돈 있으면 주세요',
        example_zh: '如果有找零请给我',
        example_pronunciation: 'geoseureumdeo isseumyeon juseyo'
      }
    ],
    banchan: [
      {
        id: 'kimchi',
        ko: '김치',
        pronunciation: 'gimchi',
        zh: '泡菜',
        example_ko: '김치 맛있어요',
        example_zh: '泡菜很好吃',
        example_pronunciation: 'gimchi masisseoyo'
      },
      {
        id: 'kkakdugi',
        ko: '깍두기',
        pronunciation: 'kkakdugi',
        zh: '萝卜泡菜',
        example_ko: '깍두기 더 주세요',
        example_zh: '请再给一些萝卜泡菜',
        example_pronunciation: 'kkakdugi deo juseyo'
      },
      {
        id: 'spinach',
        ko: '시금치나물',
        pronunciation: 'sigeumchi-namul',
        zh: '菠菜',
        example_ko: '시금치나물 어떻게 만들어요?',
        example_zh: '菠菜怎么做？',
        example_pronunciation: 'sigeumchi-namul eotteoke mandeureoyo?'
      },
      {
        id: 'beansprouts',
        ko: '콩나물',
        pronunciation: 'kongnamul',
        zh: '豆芽',
        example_ko: '콩나물 아삭아삭해요',
        example_zh: '豆芽很脆',
        example_pronunciation: 'kongnamul asakasak-haeyo'
      },
      {
        id: 'japchae',
        ko: '잡채',
        pronunciation: 'japchae',
        zh: '杂菜',
        example_ko: '잡채 맛있게 만드셨네요',
        example_zh: '杂菜做得很好吃',
        example_pronunciation: 'japchae masitkke mandeusy-eotneyo'
      },
      {
        id: 'more_banchan',
        ko: '반찬 더 주세요',
        pronunciation: 'ban-chan deo ju-se-yo',
        zh: '请再给一些小菜',
        example_ko: '반찬 맛있으니까 더 주세요',
        example_zh: '小菜很好吃，请再给一些',
        example_pronunciation: 'banchan masisseunikka deo juseyo'
      },
      {
        id: 'radish_kimchi',
        ko: '동치미',
        pronunciation: 'dong-chi-mi',
        zh: '水萝卜泡菜',
        example_ko: '시원한 동치미 국물 좋아요',
        example_zh: '清爽的水萝卜泡菜汤很好喝',
        example_pronunciation: 'siwonhan dongchimi gukmul joayo'
      },
      {
        id: 'cucumber_kimchi',
        ko: '오이소박이',
        pronunciation: 'o-i-so-ba-gi',
        zh: '腌黄瓜',
        example_ko: '오이소박이 아삭하고 시원해요',
        example_zh: '腌黄瓜脆嫩清爽',
        example_pronunciation: 'oisobagi asakago siwonhaeyo'
      },
      {
        id: 'bean_paste_soup',
        ko: '된장찌개',
        pronunciation: 'doen-jang-jji-gae',
        zh: '大酱汤',
        example_ko: '된장찌개 끓여주세요',
        example_zh: '请煮大酱汤',
        example_pronunciation: 'doenjang-jjigae kkeullyeo-juseyo'
      },
      {
        id: 'seaweed_soup',
        ko: '미역국',
        pronunciation: 'mi-yeok-guk',
        zh: '海带汤',
        example_ko: '미역국 짜지 않고 맛있어요',
        example_zh: '海带汤不咸很好吃',
        example_pronunciation: 'miyeokguk jjaji anko masisseoyo'
      },
      {
        id: 'pickled_garlic',
        ko: '마늘 장아찌',
        pronunciation: 'ma-neul jang-a-jji',
        zh: '腌蒜',
        example_ko: '마늘 장아찌 매콤하고 맛있어요',
        example_zh: '腌蒜有点辣很好吃',
        example_pronunciation: 'maneul jangajji maekkomhago masisseoyo'
      },
      {
        id: 'egg_roll',
        ko: '계란말이',
        pronunciation: 'gye-ran-ma-ri',
        zh: '鸡蛋卷',
        example_ko: '계란말이 부드럽고 달콤해요',
        example_zh: '鸡蛋卷软嫩甘甜',
        example_pronunciation: 'gyeranmari budeuleoupgo dalkomhaeyo'
      }
    ],
    reservation: [
      {
        id: 'make_reservation',
        ko: '예약하고 싶어요',
        pronunciation: 'ye-yak-ha-go si-peo-yo',
        zh: '我想预约',
        example_ko: '내일 저녁에 예약하고 싶어요',
        example_zh: '我想预约明天晚上',
        example_pronunciation: 'naeil jeonyeoge yeyakha-go sipeoyo'
      },
      {
        id: 'what_time',
        ko: '몇 시에 가능해요?',
        pronunciation: 'myeot si-e ga-neung-hae-yo',
        zh: '几点可以？',
        example_ko: '오늘 몇 시에 가능해요?',
        example_zh: '今天几点可以？',
        example_pronunciation: 'oneul myeot si-e ganeunghaeyo?'
      },
      {
        id: 'cancel_reservation',
        ko: '예약 취소할게요',
        pronunciation: 'ye-yak chwi-so-hal-ge-yo',
        zh: '我要取消预约',
        example_ko: '죄송하지만 예약 취소할게요',
        example_zh: '不好意思，我要取消预约',
        example_pronunciation: 'joesonghajiman yeyak chwisohalgeyo'
      },
      {
        id: 'change_time',
        ko: '시간 바꿀 수 있어요?',
        pronunciation: 'si-gan ba-kkul su iss-eo-yo',
        zh: '可以改时间吗？',
        example_ko: '예약 시간 다른 시간으로 바꿀 수 있어요?',
        example_zh: '可以把预约时间改到其他时间吗？',
        example_pronunciation: 'yeyak sigan dareun siganeuro bakkul su isseoyo?'
      },
      {
        id: 'phone_number',
        ko: '전화번호 알려드릴게요',
        pronunciation: 'jeon-hwa-beon-ho al-lyeo-deu-ril-ge-yo',
        zh: '我告诉你电话号码',
        example_ko: '예약용 전화번호 알려드릴게요',
        example_zh: '告诉你预约用的电话号码',
        example_pronunciation: 'yeyagyong jeonhwa-beonho allyeodeurilgeyo'
      },
      {
        id: 'name_for_reservation',
        ko: '예약자 이름은 김철수예요',
        pronunciation: 'ye-yak-ja i-reum-eun gim-cheol-su-ye-yo',
        zh: '预约人姓名是金哲洙',
        example_ko: '예약할 때 이름은 김철수로 해주세요',
        example_zh: '预约时请用金哲洙这个名字',
        example_pronunciation: 'yeyak-hal ttae ireumeun gimcheolsuro haejuseyo'
      },
      {
        id: 'special_occasion',
        ko: '생일이라서 예약해요',
        pronunciation: 'saeng-il-i-ra-seo ye-yak-hae-yo',
        zh: '因为生日所以预约',
        example_ko: '오늘이 생일이라서 특별히 예약해요',
        example_zh: '今天是生日，所以特别预约',
        example_pronunciation: 'oneuri saengiliraseo teukbyeolhi yeyakhaeyo'
      },
      {
        id: 'table_near_window',
        ko: '창가 쪽 테이블로 예약해요',
        pronunciation: 'chang-ga jjok te-i-beul-lo ye-yak-hae-yo',
        zh: '预约靠窗的桌子',
        example_ko: '가능하면 창가 쪽 테이블로 예약해주세요',
        example_zh: '如果可以的话，请预约靠窗的桌子',
        example_pronunciation: 'ganeunghamyeon changgajjok teibeurollo yeyak-haejuseyo'
      },
      {
        id: 'wait_list',
        ko: '대기 목록에 올려주세요',
        pronunciation: 'dae-gi mok-rok-e ol-lyeo-ju-se-yo',
        zh: '请把我加到等候名单',
        example_ko: '예약이 꽉 찼으면 대기 목록에 올려주세요',
        example_zh: '如果预约满了，请把我加到等候名单',
        example_pronunciation: 'yeyagi kkwak chasseumyeon daegi mokroke ollyeojuseyo'
      },
      {
        id: 'confirm_reservation',
        ko: '예약 확인하고 싶어요',
        pronunciation: 'ye-yak hwak-in-ha-go si-peo-yo',
        zh: '我想确认预约',
        example_ko: '내일 예약한 것 확인하고 싶어요',
        example_zh: '我想确认明天的预约',
        example_pronunciation: 'naeil yeyakhan geot hwagin-hago sipeoyo'
      }
    ],
    menu: [
      {
        id: 'whats_this',
        ko: '이거 뭐예요?',
        pronunciation: 'i-geo mwo-ye-yo',
        zh: '这是什么？',
        example_ko: '메뉴에서 이거 뭐예요?',
        example_zh: '菜单上这个是什么？',
        example_pronunciation: 'menyueseo igeo mwoyeyo?'
      },
      {
        id: 'how_spicy',
        ko: '얼마나 매워요?',
        pronunciation: 'eol-ma-na mae-wo-yo',
        zh: '有多辣？',
        example_ko: '이 음식 얼마나 매워요?',
        example_zh: '这个菜有多辣？',
        example_pronunciation: 'i eumsik eolmana maewoyo?'
      },
      {
        id: 'set_menu',
        ko: '세트 메뉴 있어요?',
        pronunciation: 'se-teu me-nyu iss-eo-yo',
        zh: '有套餐吗？',
        example_ko: '2인 세트 메뉴 있어요?',
        example_zh: '有2人套餐吗？',
        example_pronunciation: 'i-in seteu menyu isseoyo?'
      },
      {
        id: 'todays_special',
        ko: '오늘의 특선 메뉴가 뭐예요?',
        pronunciation: 'o-neul-ui teuk-seon me-nyu-ga mwo-ye-yo',
        zh: '今天的特色菜是什么？',
        example_ko: '오늘의 특선이나 시즌 메뉴가 뭐예요?',
        example_zh: '今天的特色菜或季节菜单是什么？',
        example_pronunciation: 'oneurui teukseoni-na sijeun menyuga mwoyeyo?'
      },
      {
        id: 'english_menu',
        ko: '영어 메뉴 있어요?',
        pronunciation: 'yeong-eo me-nyu iss-eo-yo',
        zh: '有英文菜单吗？',
        example_ko: '영어나 중국어 메뉴 있어요?',
        example_zh: '有英文或中文菜单吗？',
        example_pronunciation: 'yeongeo-na junggugeo menyu isseoyo?'
      },
      {
        id: 'menu_photos',
        ko: '메뉴 사진 있어요?',
        pronunciation: 'me-nyu sa-jin iss-eo-yo',
        zh: '有菜单照片吗？',
        example_ko: '음식 사진이 있는 메뉴 있어요?',
        example_zh: '有带食物照片的菜单吗？',
        example_pronunciation: 'eumsik sajini inneun menyu isseoyo?'
      },
      {
        id: 'vegetarian_menu',
        ko: '채식 메뉴 있어요?',
        pronunciation: 'chae-sik me-nyu iss-eo-yo',
        zh: '有素食菜单吗？',
        example_ko: '고기 없는 채식 메뉴 있어요?',
        example_zh: '有不含肉的素食菜单吗？',
        example_pronunciation: 'gogi eomneun chaesik menyu isseoyo?'
      },
      {
        id: 'price_range',
        ko: '가격대가 어떻게 돼요?',
        pronunciation: 'ga-gyeok-dae-ga eo-tteok-e dwae-yo',
        zh: '价格区间怎么样？',
        example_ko: '이 식당 가격대가 어떻게 돼요?',
        example_zh: '这家餐厅的价格区间怎么样？',
        example_pronunciation: 'i sikdang gagyeokdaega eotteoke dwaeyo?'
      },
      {
        id: 'portion_size',
        ko: '양이 많아요?',
        pronunciation: 'yang-i ma-na-yo',
        zh: '份量多吗？',
        example_ko: '이 메뉴는 양이 많아요? 적어요?',
        example_zh: '这个菜份量多吗？还是少？',
        example_pronunciation: 'i menyuneun yangi manayo? jeogeoyo?'
      },
      {
        id: 'ingredients_list',
        ko: '재료가 뭐 들어가요?',
        pronunciation: 'jae-ryo-ga mwo deul-eo-ga-yo',
        zh: '里面放了什么食材？',
        example_ko: '이 요리에 어떤 재료가 들어가요?',
        example_zh: '这道菜里面放了什么食材？',
        example_pronunciation: 'i yorire eotteon jaeryoga deureogayo?'
      },
      {
        id: 'cooking_method',
        ko: '어떻게 요리해요?',
        pronunciation: 'eo-tteok-e yo-ri-hae-yo',
        zh: '怎么烹饪的？',
        example_ko: '이 음식은 어떻게 요리하는 거예요?',
        example_zh: '这个菜是怎么烹饪的？',
        example_pronunciation: 'i eumsigeun eotteoke yorihaneun geoyeyo?'
      }
    ],
    delivery: [
      {
        id: 'delivery_order',
        ko: '배달 주문하고 싶어요',
        pronunciation: 'bae-dal ju-mun-ha-go si-peo-yo',
        zh: '我想叫外卖',
        example_ko: '여기서 배달 주문하고 싶어요',
        example_zh: '我想在这里叫外卖',
        example_pronunciation: 'yeogiseo baedal jumunhago sipeoyo'
      },
      {
        id: 'baemin_app',
        ko: '배달의민족 앱',
        pronunciation: 'bae-dal-ui min-jok aep',
        zh: '配送的民族App',
        example_ko: '배달의민족 앱으로 주문할게요',
        example_zh: '用配送的民族App点单',
        example_pronunciation: 'baedal-ui minjok aepeuro jumunhalgeyo'
      },
      {
        id: 'yogiyo_app',
        ko: '요기요 앱',
        pronunciation: 'yo-gi-yo aep',
        zh: '这里呀App',
        example_ko: '요기요 앱도 사용할 수 있어요',
        example_zh: '也可以用这里呀App',
        example_pronunciation: 'yogiyo aepdo sayonghal su isseoyo'
      },
      {
        id: 'delivery_fee',
        ko: '배달비가 얼마예요?',
        pronunciation: 'bae-dal-bi-ga eol-ma-ye-yo',
        zh: '配送费多少钱？',
        example_ko: '여기까지 배달비가 얼마예요?',
        example_zh: '配送到这里要多少配送费？',
        example_pronunciation: 'yeogikkaji baedalbiga eolmayeyo?'
      },
      {
        id: 'delivery_time',
        ko: '배달 시간이 얼마나 걸려요?',
        pronunciation: 'bae-dal si-gan-i eol-ma-na geol-lyeo-yo',
        zh: '配送需要多长时间？',
        example_ko: '주문하면 배달 오는데 얼마나 걸려요?',
        example_zh: '点单后配送需要多长时间？',
        example_pronunciation: 'jumunhamyeon baedal oneunde eolmana geollyeoyo?'
      },
      {
        id: 'minimum_order',
        ko: '최소 주문 금액이 얼마예요?',
        pronunciation: 'choe-so ju-mun geum-aek-i eol-ma-ye-yo',
        zh: '最低订单金额是多少？',
        example_ko: '배달 주문할 때 최소 금액이 얼마예요?',
        example_zh: '外卖订单的最低金额是多少？',
        example_pronunciation: 'baedal jumun-hal ttae choeso geumaegi eolmayeyo?'
      },
      {
        id: 'delivery_area',
        ko: '배달 지역이 어디까지예요?',
        pronunciation: 'bae-dal ji-yeok-i eo-di-kka-ji-ye-yo',
        zh: '配送区域到哪里？',
        example_ko: '이 식당 배달 지역이 어디까지예요?',
        example_zh: '这家餐厅的配送区域到哪里？',
        example_pronunciation: 'i sikdang baedal jiryeogi eodikkajiyeyo?'
      },
      {
        id: 'address_input',
        ko: '주소를 알려드릴게요',
        pronunciation: 'ju-so-reul al-lyeo-deu-ril-ge-yo',
        zh: '我告诉你地址',
        example_ko: '배달받을 주소를 알려드릴게요',
        example_zh: '我告诉你收货地址',
        example_pronunciation: 'baedal-badeul jusoreul allyeodeurilgeyo'
      },
      {
        id: 'phone_order',
        ko: '전화로도 주문할 수 있어요?',
        pronunciation: 'jeon-hwa-ro-do ju-mun-hal su iss-eo-yo',
        zh: '也可以电话订餐吗？',
        example_ko: '앱 말고 전화로도 주문할 수 있어요?',
        example_zh: '除了App，也可以电话订餐吗？',
        example_pronunciation: 'aep malgo jeonhwa-rodo jumunhal su isseoyo?'
      },
      {
        id: 'coupon_discount',
        ko: '쿠폰이나 할인 있어요?',
        pronunciation: 'ku-pon-i-na hal-in iss-eo-yo',
        zh: '有优惠券或折扣吗？',
        example_ko: '배달 앱에서 쿠폰이나 할인 이벤트 있어요?',
        example_zh: '外卖App有优惠券或折扣活动吗？',
        example_pronunciation: 'baedal aep-eseo kuponi-na harin ibenteu isseoyo?'
      }
    ],
    etiquette: [
      {
        id: 'chopsticks',
        ko: '젓가락 사용법',
        pronunciation: 'jeot-ga-rak sa-yong-beop',
        zh: '筷子使用方法',
        example_ko: '젓가락 사용법을 배우고 싶어요',
        example_zh: '我想学习筷子使用方法',
        example_pronunciation: 'jeotgarak sayongbeobeul baeugo sipeoyo'
      },
      {
        id: 'dont_stick_chopsticks',
        ko: '젓가락을 밥에 세우면 안돼요',
        pronunciation: 'jeot-ga-rak-eul bab-e se-u-myeon an-dwae-yo',
        zh: '不能把筷子插在米饭里',
        example_ko: '젓가락을 밥에 세우는 건 예의에 어긋나요',
        example_zh: '把筷子插在米饭里是不礼貌的',
        example_pronunciation: 'jeotgarageul babe seuneun geon yeuie eogeutnayo'
      },
      {
        id: 'share_banchan',
        ko: '반찬은 함께 나눠먹어요',
        pronunciation: 'ban-chan-eun ham-kke na-nwo-meog-eo-yo',
        zh: '小菜要一起分享',
        example_ko: '반찬은 모두 함께 나눠먹는 거예요',
        example_zh: '小菜是大家一起分享的',
        example_pronunciation: 'banchaneun modu hamkke nanwomeogneun geoyeyo'
      },
      {
        id: 'elder_first',
        ko: '어른이 먼저 드세요',
        pronunciation: 'eo-reun-i meon-jeo deu-se-yo',
        zh: '长辈先用餐',
        example_ko: '어른이 먼저 드시고 나서 먹어요',
        example_zh: '长辈先用餐，然后我们再吃',
        example_pronunciation: 'eoreuni meonjeo deusigo naseeo meogeoyo'
      },
      {
        id: 'both_hands',
        ko: '두 손으로 받으세요',
        pronunciation: 'du son-eu-ro bad-eu-se-yo',
        zh: '用双手接',
        example_ko: '어른에게 뭔가 받을 때는 두 손으로 받으세요',
        example_zh: '从长辈那里接东西时要用双手',
        example_pronunciation: 'eoreu-ne-ge mwon-ga badeul ttae-neun du soneuro badeuse-yo'
      },
      {
        id: 'no_blowing_nose',
        ko: '식사 중에 코 풀면 안돼요',
        pronunciation: 'sik-sa jung-e ko pul-myeon an-dwae-yo',
        zh: '用餐时不能擤鼻涕',
        example_ko: '식당에서 코 푸는 건 예의에 어긋나요',
        example_zh: '在餐厅擤鼻涕是不礼貌的',
        example_pronunciation: 'sikdaneseo ko puneun geon yeuie eogeutnayo'
      },
      {
        id: 'turn_away_drinking',
        ko: '어른 앞에서 술 마실 때는 고개를 돌려요',
        pronunciation: 'eo-reun ap-e-seo sul ma-sil ttae-neun go-gae-reul dol-lyeo-yo',
        zh: '在长辈面前喝酒要转过头',
        example_ko: '어른과 함께 있을 때는 고개를 돌리고 술을 마셔요',
        example_zh: '和长辈在一起时要转过头喝酒',
        example_pronunciation: 'eoreu-ngwa hamkke isseul ttaeneun gogae-reul dolligo sureul masyeoyo'
      },
      {
        id: 'finish_food',
        ko: '음식을 남기지 마세요',
        pronunciation: 'eum-sik-eul nam-gi-ji ma-se-yo',
        zh: '不要剩饭',
        example_ko: '음식을 남기는 것은 예의에 어긋나요',
        example_zh: '剩饭是不礼貌的',
        example_pronunciation: 'eumsigeul namgineun geoseun yeuie eogeutnayo'
      },
      {
        id: 'no_phone',
        ko: '식사 중에는 휴대폰 사용 안 해요',
        pronunciation: 'sik-sa jung-e-neun hyu-dae-pon sa-yong an hae-yo',
        zh: '用餐时不使用手机',
        example_ko: '식사할 때는 휴대폰 말고 대화를 해요',
        example_zh: '用餐时不用手机，要聊天',
        example_pronunciation: 'siksahal ttaeneun hyudaepon malgo daehwareul haeyo'
      },
      {
        id: 'proper_seating',
        ko: '올바른 자세로 앉으세요',
        pronunciation: 'ol-ba-reun ja-se-ro an-jeu-se-yo',
        zh: '要端正地坐',
        example_ko: '식탁에서는 올바른 자세로 앉아야 해요',
        example_zh: '在餐桌上要端正地坐着',
        example_pronunciation: 'siktageseo-neun olbareun jase-ro anjaya haeyo'
      }
    ],
    tip: [
      {
        id: 'no_tip',
        ko: '한국은 팁 문화가 없어요',
        pronunciation: 'han-guk-eun tip mun-hwa-ga eop-seo-yo',
        zh: '韩国没有小费文化',
        example_ko: '한국 식당은 팁을 주지 않아요',
        example_zh: '韩国餐厅不给小费',
        example_pronunciation: 'hanguk sikdangeun tibeul juji anayo'
      },
      {
        id: 'service_included',
        ko: '서비스는 포함되어 있어요',
        pronunciation: 'seo-bi-seu-neun po-ham-doe-eo iss-eo-yo',
        zh: '服务费已包含',
        example_ko: '계산서에 서비스가 포함되어 있어요',
        example_zh: '账单里已包含服务费',
        example_pronunciation: 'gyesanseoe seobiseuga pohamdoeeo isseoyo'
      },
      {
        id: 'just_pay_bill',
        ko: '계산서 금액만 내면 돼요',
        pronunciation: 'gye-san-seo geum-aek-man nae-myeon dwae-yo',
        zh: '只要付账单金额就可以了',
        example_ko: '추가로 팁을 줄 필요 없어요',
        example_zh: '不需要额외给小费',
        example_pronunciation: 'chugaro tibeul jul piryo eopseoyo'
      },
      {
        id: 'dont_be_offended',
        ko: '팁을 안 받아도 기분 나빠하지 마세요',
        pronunciation: 'tip-eul an bad-a-do gi-bun na-ppa-ha-ji ma-se-yo',
        zh: '不收小费也不要生气',
        example_ko: '웨이터가 팁을 안 받아도 정상이에요',
        example_zh: '服务员不收小费也是正常的',
        example_pronunciation: 'weiteoage tibeul an badado jeongsangieyo'
      },
      {
        id: 'different_from_west',
        ko: '서양과는 다른 문화예요',
        pronunciation: 'seo-yang-gwa-neun da-reun mun-hwa-ye-yo',
        zh: '和西方文化不同',
        example_ko: '미국이나 유럽과는 팁 문화가 달라요',
        example_zh: '和美国或欧洲的小费文化不同',
        example_pronunciation: 'migug-i-na yureobgwa-neun tip munhwaga dallayo'
      },
      {
        id: 'sometimes_refuse',
        ko: '팁을 주려고 해도 거절할 수 있어요',
        pronunciation: 'tip-eul ju-ryeo-go hae-do geo-jeol-hal su iss-eo-yo',
        zh: '即使想给小费也可能被拒绝',
        example_ko: '한국 사람들은 팁을 주려고 해도 거절해요',
        example_zh: '韩国人即使想给小费也会拒绝',
        example_pronunciation: 'hanguk saramdeul-eun tibeul juryeogo haedo geojeorhaeyo'
      },
      {
        id: 'good_service_appreciation',
        ko: '좋은 서비스는 감사 인사로',
        pronunciation: 'jo-eun seo-bi-seu-neun gam-sa in-sa-ro',
        zh: '好的服务用感谢表示',
        example_ko: '서비스가 좋으면 고맙다고 인사해요',
        example_zh: '服务好的话就说谢谢',
        example_pronunciation: 'seobiseuga joeumyeon gomaptago insahaeyo'
      },
      {
        id: 'fair_wages',
        ko: '직원들은 정당한 급여를 받아요',
        pronunciation: 'jik-won-deul-eun jeong-dang-han geum-yeo-reul bad-a-yo',
        zh: '员工获得合理工资',
        example_ko: '한국은 직원들이 정당한 급여를 받기 때문에 팁이 없어요',
        example_zh: '韩国员工获得合理工资，所以没有小费',
        example_pronunciation: 'hangugeun jikwondeuri jeongdanghan geumyeoreul badgi ttaemune tibi eopseoyo'
      }
    ]
  }

  const currentCards = activeTab === 'saved'
    ? Object.values(cardData).flat().filter(c => bookmarkedCards.includes(c.id))
    : cardData[activeTab] || []

  return (
    <div className="space-y-4">
      {/* 토스트 메시지 */}
      {toastMessage && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-black text-white px-4 py-2 rounded-full text-sm">
          {toastMessage}
        </div>
      )}

      {/* 소주제 탭 - 가로 스크롤 */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-full text-xs font-medium shrink-0 transition ${
              activeTab === tab.id
                ? 'bg-[#111827] text-white'
                : 'bg-gray-100 text-gray-600'
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

      {/* 저장한 표현 없을 때 */}
      {currentCards.length === 0 && activeTab === 'saved' && (
        <div className="text-center py-12 text-sm text-gray-400">
          {L(lang, { ko: '저장한 표현이 없습니다', zh: '暂无收藏', en: 'No saved phrases' })}
        </div>
      )}

      {/* 카드 렌더링 */}
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
            illustration="restaurant"
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
