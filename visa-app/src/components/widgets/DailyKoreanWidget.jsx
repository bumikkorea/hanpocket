import { L } from '../home/utils/helpers'

const EXPRESSIONS = [
  { korean: '안녕하세요', chinese: '你好', roman: 'an-nyeong-ha-se-yo', usage: { ko: '처음 만난 사람에게 인사할 때', zh: '初次见面打招呼时', en: 'Greeting someone you meet' } },
  { korean: '감사합니다', chinese: '谢谢', roman: 'gam-sa-ham-ni-da', usage: { ko: '고마움을 표현할 때', zh: '表达感谢时', en: 'Expressing thanks' } },
  { korean: '죄송합니다', chinese: '对不起', roman: 'joe-song-ham-ni-da', usage: { ko: '사과할 때', zh: '道歉时', en: 'Apologizing' } },
  { korean: '이거 주세요', chinese: '请给我这个', roman: 'i-geo ju-se-yo', usage: { ko: '음식점에서 주문할 때', zh: '在餐厅点餐时', en: 'Ordering at a restaurant' } },
  { korean: '얼마예요?', chinese: '多少钱？', roman: 'eol-ma-ye-yo', usage: { ko: '가격을 물어볼 때', zh: '询问价格时', en: 'Asking the price' } },
  { korean: '화장실 어디예요?', chinese: '洗手间在哪里？', roman: 'hwa-jang-sil eo-di-ye-yo', usage: { ko: '화장실 위치를 물어볼 때', zh: '询问洗手间位置时', en: 'Asking for the restroom' } },
  { korean: '계산해 주세요', chinese: '请结账', roman: 'gye-san-hae ju-se-yo', usage: { ko: '식당에서 계산할 때', zh: '在餐厅结账时', en: 'Asking for the bill' } },
  { korean: '여기 가 주세요', chinese: '请去这里', roman: 'yeo-gi ga ju-se-yo', usage: { ko: '택시 기사에게 목적지를 알릴 때', zh: '告诉出租车司机目的地时', en: 'Telling taxi driver destination' } },
  { korean: '맵지 않게 해주세요', chinese: '请做不辣的', roman: 'maep-ji an-ke hae-ju-se-yo', usage: { ko: '매운 음식을 못 먹을 때', zh: '不能吃辣时', en: 'Requesting non-spicy food' } },
  { korean: '카드 돼요?', chinese: '可以刷卡吗？', roman: 'ka-deu dwae-yo', usage: { ko: '카드 결제 가능한지 물어볼 때', zh: '询问能否刷卡时', en: 'Asking if card payment is OK' } },
  { korean: '좀 깎아 주세요', chinese: '请便宜一点', roman: 'jom kkak-ka ju-se-yo', usage: { ko: '시장에서 흥정할 때', zh: '在市场讨价还价时', en: 'Bargaining at a market' } },
  { korean: '도와주세요', chinese: '请帮帮我', roman: 'do-wa-ju-se-yo', usage: { ko: '도움이 필요할 때', zh: '需要帮助时', en: 'Asking for help' } },
  { korean: '지하철역이 어디예요?', chinese: '地铁站在哪里？', roman: 'ji-ha-cheol-yeok-i eo-di-ye-yo', usage: { ko: '지하철역을 찾을 때', zh: '寻找地铁站时', en: 'Looking for subway station' } },
  { korean: '사진 찍어 주세요', chinese: '请帮我拍照', roman: 'sa-jin jjig-eo ju-se-yo', usage: { ko: '사진을 부탁할 때', zh: '请人帮忙拍照时', en: 'Asking someone to take photo' } },
  { korean: '맛있어요!', chinese: '好吃！', roman: 'ma-si-sseo-yo', usage: { ko: '음식이 맛있을 때', zh: '食物好吃时', en: 'When food is delicious' } },
  { korean: '와이파이 비밀번호가 뭐예요?', chinese: 'WiFi密码是什么？', roman: 'wa-i-pa-i bi-mil-beon-ho-ga mwo-ye-yo', usage: { ko: '와이파이 비밀번호를 물어볼 때', zh: '询问WiFi密码时', en: 'Asking for WiFi password' } },
  { korean: '추천해 주세요', chinese: '请推荐', roman: 'chu-cheon-hae ju-se-yo', usage: { ko: '메뉴나 상품 추천을 받을 때', zh: '请人推荐菜品或商品时', en: 'Asking for recommendations' } },
  { korean: '괜찮아요', chinese: '没关系', roman: 'gwaen-chan-a-yo', usage: { ko: '상대방이 사과할 때 대답', zh: '别人道歉时的回答', en: 'Responding to an apology' } },
  { korean: '잠깐만요', chinese: '请等一下', roman: 'jam-kkan-man-yo', usage: { ko: '잠시 기다려 달라고 할 때', zh: '请对方稍等时', en: 'Asking someone to wait' } },
  { korean: '이게 뭐예요?', chinese: '这是什么？', roman: 'i-ge mwo-ye-yo', usage: { ko: '모르는 것을 물어볼 때', zh: '询问不认识的东西时', en: 'Asking what something is' } },
  { korean: '여기요!', chinese: '这里！/服务员！', roman: 'yeo-gi-yo', usage: { ko: '식당에서 직원을 부를 때', zh: '在餐厅叫服务员时', en: 'Calling staff at restaurant' } },
  { korean: '포장해 주세요', chinese: '请打包', roman: 'po-jang-hae ju-se-yo', usage: { ko: '음식을 포장할 때', zh: '打包食物时', en: 'Asking for takeaway' } },
  { korean: '아파요', chinese: '疼/不舒服', roman: 'a-pa-yo', usage: { ko: '아플 때 증상을 말할 때', zh: '身体不适时描述症状', en: 'Saying you feel pain/sick' } },
  { korean: '영수증 주세요', chinese: '请给我收据', roman: 'yeong-su-jeung ju-se-yo', usage: { ko: '영수증이 필요할 때', zh: '需要收据时', en: 'Asking for a receipt' } },
  { korean: '한국어 못해요', chinese: '我不会韩语', roman: 'han-gug-eo mot-hae-yo', usage: { ko: '한국어를 못할 때', zh: '不会韩语时', en: 'Saying you can\'t speak Korean' } },
  { korean: '천천히 말해 주세요', chinese: '请说慢一点', roman: 'cheon-cheon-hi mal-hae ju-se-yo', usage: { ko: '상대방이 빨리 말할 때', zh: '对方说话太快时', en: 'Asking to speak slowly' } },
  { korean: '환전해 주세요', chinese: '请帮我换钱', roman: 'hwan-jeon-hae ju-se-yo', usage: { ko: '환전소에서 환전할 때', zh: '在换钱所换钱时', en: 'Exchanging currency' } },
  { korean: '네 / 아니요', chinese: '是 / 不是', roman: 'ne / a-ni-yo', usage: { ko: '긍정/부정 대답할 때', zh: '肯定/否定回答时', en: 'Saying yes/no' } },
  { korean: '또 올게요', chinese: '我会再来的', roman: 'tto ol-ge-yo', usage: { ko: '다음에 또 오겠다고 할 때', zh: '表示下次还会再来时', en: 'Saying you\'ll come again' } },
  { korean: '수고하세요', chinese: '辛苦了', roman: 'su-go-ha-se-yo', usage: { ko: '떠날 때 직원에게 인사', zh: '离开时对工作人员说', en: 'Saying goodbye to staff' } },
]

export default function DailyKoreanWidget({ lang }) {
  const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000)
  const expr = EXPRESSIONS[dayOfYear % EXPRESSIONS.length]

  return (
    <div>
      <p className="text-[10px] font-semibold text-[#6B7280] mb-2">
        {L(lang, { ko: '오늘의 한국어', zh: '今日韩语', en: "Today's Korean" })}
      </p>
      <div className="flex items-center justify-between gap-4">
        <div className="flex-1 min-w-0">
          <p className="text-xl font-black text-[#111827] leading-tight">{expr.korean}</p>
          <p className="text-[11px] text-[#9CA3AF] mt-1">{expr.roman}</p>
        </div>
        <div className="text-right shrink-0">
          <p className="text-base font-bold text-[#111827]">{expr.chinese}</p>
          <p className="text-[11px] text-[#6B7280] mt-1">{L(lang, expr.usage)}</p>
        </div>
      </div>
    </div>
  )
}
