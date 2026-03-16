/**
 * C 섹션 (51~70) 실용/생존 정보 — 독립 가이드 페이지들
 * 각 가이드를 subPage로 라우팅하여 MorePage/HomeTab에서 접근
 */
import { useState, useEffect } from 'react'

function L(lang, d) { if (typeof d === 'string') return d; return d?.[lang] || d?.en || d?.zh || d?.ko || '' }

// ─── #51 환율 계산기 ────────────────────────────────────────
export function CurrencyCalc({ lang }) {
  const [amount, setAmount] = useState('')
  const [direction, setDirection] = useState('cny2krw') // cny2krw | krw2cny
  const RATE = 192.5 // 1 CNY ≈ 192.5 KRW (폴백)
  const converted = direction === 'cny2krw'
    ? (parseFloat(amount) || 0) * RATE
    : (parseFloat(amount) || 0) / RATE

  return (
    <div className="px-4 pt-4 pb-24">
      <p className="text-[20px] font-bold text-[#1A1A1A] mb-4">💱 {L(lang, { ko: '환율 계산기', zh: '汇率计算器', en: 'Currency Converter' })}</p>
      <div className="bg-white rounded-[14px] p-4" style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
        <div className="flex items-center gap-2 mb-3">
          <button onClick={() => setDirection(d => d === 'cny2krw' ? 'krw2cny' : 'cny2krw')}
            className="text-[13px] font-bold text-[#C4725A] px-3 py-1.5 rounded-full bg-[#FFF5F2] active:scale-95">
            {direction === 'cny2krw' ? '🇨🇳 → 🇰🇷' : '🇰🇷 → 🇨🇳'} ⇄
          </button>
          <span className="text-[11px] text-[#9CA3AF]">1 CNY ≈ {RATE.toFixed(1)} KRW</span>
        </div>
        <input type="number" value={amount} onChange={e => setAmount(e.target.value)}
          placeholder={direction === 'cny2krw' ? '人民币金额' : '韩元金额'}
          className="w-full text-[24px] font-bold text-[#111827] bg-[#F3F4F6] rounded-[12px] px-4 py-3 mb-3 outline-none" />
        <div className="text-center">
          <p className="text-[11px] text-[#9CA3AF]">{direction === 'cny2krw' ? '≈ 韩元' : '≈ 人民币'}</p>
          <p className="text-[28px] font-bold text-[#C4725A]">
            {direction === 'cny2krw' ? `₩ ${converted.toLocaleString('ko-KR', { maximumFractionDigits: 0 })}` : `¥ ${converted.toFixed(2)}`}
          </p>
        </div>
      </div>
      <div className="mt-4 bg-[#F9FAFB] rounded-[12px] p-3">
        <p className="text-[11px] font-bold text-[#374151] mb-2">💡 {L(lang, { ko: '빠른 참고', zh: '快速参考', en: 'Quick Reference' })}</p>
        {[100, 500, 1000, 5000, 10000].map(v => (
          <div key={v} className="flex justify-between text-[11px] text-[#555] py-1" style={{ borderBottom: '1px solid #F3F4F6' }}>
            <span>¥{v}</span><span>≈ ₩{(v * RATE).toLocaleString('ko-KR', { maximumFractionDigits: 0 })}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── #52 긴급 전화번호 ────────────────────────────────────────
export function EmergencyNumbers({ lang }) {
  const numbers = [
    { emoji: '🚔', label: { ko: '경찰', zh: '警察', en: 'Police' }, num: '112', desc: { ko: '범죄·사고 신고', zh: '犯罪/事故报警', en: 'Crime/Accident' } },
    { emoji: '🚒', label: { ko: '소방/구급', zh: '消防/急救', en: 'Fire/Ambulance' }, num: '119', desc: { ko: '화재·응급환자', zh: '火灾/急救', en: 'Fire/Emergency' } },
    { emoji: '📞', label: { ko: '외국인 안내', zh: '外国人咨询', en: 'Foreigner Help' }, num: '1345', desc: { ko: '비자·체류 문의', zh: '签证/居留咨询', en: 'Visa/Stay info' } },
    { emoji: '🏥', label: { ko: '응급의료 정보', zh: '急救医疗', en: 'Emergency Medical' }, num: '1339', desc: { ko: '의료상담·병원안내', zh: '医疗咨询/医院', en: 'Medical advice' } },
    { emoji: '🏛️', label: { ko: '중국대사관', zh: '中国大使馆', en: 'Chinese Embassy' }, num: '02-738-1038', desc: { ko: '영사 업무', zh: '领事服务', en: 'Consular' } },
    { emoji: '👮', label: { ko: '관광경찰', zh: '旅游警察', en: 'Tourist Police' }, num: '1330', desc: { ko: '관광 불편 신고', zh: '旅游投诉', en: 'Tourism complaints' } },
    { emoji: '🆘', label: { ko: '범죄 피해 외국인', zh: '外国人犯罪受害', en: 'Crime Victim' }, num: '02-2075-4138', desc: { ko: '다국어 상담', zh: '多语言咨询', en: 'Multilingual' } },
    { emoji: '💊', label: { ko: '약국 안내', zh: '药房咨询', en: 'Pharmacy Info' }, num: '1393', desc: { ko: '야간/휴일 약국', zh: '夜间/节假日药房', en: 'Night pharmacy' } },
  ]
  return (
    <div className="px-4 pt-4 pb-24">
      <p className="text-[20px] font-bold text-[#1A1A1A] mb-4">🆘 {L(lang, { ko: '긴급 전화번호', zh: '紧急电话', en: 'Emergency Numbers' })}</p>
      <div className="bg-white rounded-[14px] overflow-hidden" style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
        {numbers.map((n, i) => (
          <a key={n.num} href={`tel:${n.num.replace(/-/g, '')}`}
            className="flex items-center gap-3 px-4 py-3 active:bg-[#F9FAFB]"
            style={i > 0 ? { borderTop: '1px solid #F3F4F6' } : {}}>
            <span className="text-xl">{n.emoji}</span>
            <div className="flex-1">
              <p className="text-[13px] font-semibold text-[#111827]">{L(lang, n.label)}</p>
              <p className="text-[10px] text-[#9CA3AF]">{L(lang, n.desc)}</p>
            </div>
            <span className="text-[14px] font-bold text-[#C4725A]">{n.num}</span>
          </a>
        ))}
      </div>
    </div>
  )
}

// ─── #53 기본 한국어 회화 ────────────────────────────────────
export function BasicKorean({ lang }) {
  const phrases = [
    { ko: '안녕하세요', zh: '你好', en: 'Hello', pron: 'an-nyeong-ha-se-yo' },
    { ko: '감사합니다', zh: '谢谢', en: 'Thank you', pron: 'gam-sa-ham-ni-da' },
    { ko: '죄송합니다', zh: '对不起', en: 'Sorry', pron: 'joe-song-ham-ni-da' },
    { ko: '이거 얼마예요?', zh: '这个多少钱？', en: 'How much is this?', pron: 'i-geo eol-ma-ye-yo' },
    { ko: '화장실 어디예요?', zh: '洗手间在哪里？', en: 'Where is the bathroom?', pron: 'hwa-jang-sil eo-di-ye-yo' },
    { ko: '도와주세요', zh: '请帮帮我', en: 'Help me please', pron: 'do-wa-ju-se-yo' },
    { ko: '네 / 아니요', zh: '是 / 不是', en: 'Yes / No', pron: 'ne / a-ni-yo' },
    { ko: '물 주세요', zh: '请给我水', en: 'Water please', pron: 'mul ju-se-yo' },
    { ko: '계산해 주세요', zh: '请结账', en: 'Check please', pron: 'gye-san-hae ju-se-yo' },
    { ko: '이것 추천해 주세요', zh: '请推荐这个', en: 'Please recommend', pron: 'i-geot chu-cheon-hae ju-se-yo' },
    { ko: '한국어 못해요', zh: '我不会韩语', en: "I can't speak Korean", pron: 'han-gug-eo mot-hae-yo' },
    { ko: '중국어 할 수 있어요?', zh: '你会说中文吗？', en: 'Do you speak Chinese?', pron: 'jung-gug-eo hal su iss-eo-yo?' },
    { ko: '택시 불러 주세요', zh: '请叫出租车', en: 'Please call a taxi', pron: 'taek-si bul-leo ju-se-yo' },
    { ko: '여기서 내릴게요', zh: '我在这里下车', en: 'I\'ll get off here', pron: 'yeo-gi-seo nae-ril-ge-yo' },
    { ko: '사진 찍어 주세요', zh: '请帮我拍照', en: 'Please take a photo', pron: 'sa-jin jjig-eo ju-se-yo' },
    { ko: '너무 매워요', zh: '太辣了', en: 'Too spicy', pron: 'neo-mu mae-wo-yo' },
    { ko: '맛있어요!', zh: '好吃！', en: 'Delicious!', pron: 'mas-iss-eo-yo' },
    { ko: '할인 돼요?', zh: '可以打折吗？', en: 'Any discount?', pron: 'hal-in dwae-yo?' },
    { ko: '길을 잃었어요', zh: '我迷路了', en: "I'm lost", pron: 'gil-eul ilh-eoss-eo-yo' },
    { ko: '병원에 가야 해요', zh: '我需要去医院', en: 'I need to go to hospital', pron: 'byeong-won-e ga-ya hae-yo' },
  ]
  return (
    <div className="px-4 pt-4 pb-24">
      <p className="text-[20px] font-bold text-[#1A1A1A] mb-1">🗣️ {L(lang, { ko: '기본 한국어 20문장', zh: '基础韩语20句', en: '20 Basic Korean Phrases' })}</p>
      <p className="text-[11px] text-[#9CA3AF] mb-4">{L(lang, { ko: '탭하면 발음을 볼 수 있어요', zh: '点击查看发音', en: 'Tap to see pronunciation' })}</p>
      <div className="flex flex-col gap-2">
        {phrases.map((p, i) => (
          <details key={i} className="bg-white rounded-[12px] overflow-hidden" style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
            <summary className="flex items-center gap-3 px-4 py-3 cursor-pointer list-none">
              <span className="text-[11px] text-[#9CA3AF] w-5 text-right">{i + 1}</span>
              <div className="flex-1">
                <p className="text-[14px] font-bold text-[#111827]">{p.ko}</p>
                <p className="text-[12px] text-[#6B7280]">{lang === 'en' ? p.en : p.zh}</p>
              </div>
            </summary>
            <div className="px-4 pb-3 pt-0">
              <p className="text-[12px] text-[#C4725A] font-medium">🔊 {p.pron}</p>
              {lang !== 'en' && <p className="text-[11px] text-[#9CA3AF] mt-0.5">{p.en}</p>}
            </div>
          </details>
        ))}
      </div>
    </div>
  )
}

// ─── #54 교통카드 안내 ────────────────────────────────────────
export function TransitCardGuide({ lang }) {
  return (
    <div className="px-4 pt-4 pb-24">
      <p className="text-[20px] font-bold text-[#1A1A1A] mb-4">🎫 {L(lang, { ko: '교통카드 안내', zh: '交通卡指南', en: 'Transit Card Guide' })}</p>
      <div className="space-y-3">
        {[
          { title: { ko: 'T-money 카드', zh: 'T-money卡', en: 'T-money Card' }, emoji: '💳',
            items: [
              { ko: '편의점(CU, GS25, 세븐일레븐)에서 구매', zh: '便利店(CU/GS25/7-11)购买', en: 'Buy at convenience stores' },
              { ko: '카드 가격: ₩2,500', zh: '卡费：₩2,500', en: 'Card fee: ₩2,500' },
              { ko: '편의점/지하철역에서 충전', zh: '便利店/地铁站充值', en: 'Recharge at stores/stations' },
              { ko: '지하철, 버스, 택시 모두 사용 가능', zh: '地铁、公交、出租车均可使用', en: 'Use on subway, bus, taxi' },
            ]},
          { title: { ko: 'WOWPASS', zh: 'WOWPASS', en: 'WOWPASS' }, emoji: '🌟',
            items: [
              { ko: '선불 체크카드 + 교통카드 + 환전', zh: '预付卡+交通卡+换汇一体', en: 'Prepaid + transit + exchange' },
              { ko: '인천공항, 명동, 홍대 등에서 발급', zh: '仁川机场/明洞/弘大等可办理', en: 'Get at airport, Myeongdong, Hongdae' },
              { ko: '알리페이/위챗으로 충전 가능', zh: '支持支付宝/微信充值', en: 'Top up via Alipay/WeChat' },
              { ko: '환전 수수료 무료', zh: '免换汇手续费', en: 'Free currency exchange' },
            ]},
          { title: { ko: '충전 위치', zh: '充值地点', en: 'Where to Recharge' }, emoji: '📍',
            items: [
              { ko: '모든 지하철역 충전기', zh: '所有地铁站充值机', en: 'All subway station machines' },
              { ko: 'CU, GS25, 세븐일레븐 (현금)', zh: 'CU/GS25/7-11 (现金)', en: 'CU, GS25, 7-11 (cash)' },
              { ko: '최소 ₩1,000 단위로 충전', zh: '最低₩1,000起充', en: 'Min ₩1,000 per charge' },
            ]},
        ].map(section => (
          <div key={L(lang, section.title)} className="bg-white rounded-[14px] p-4" style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
            <p className="text-[14px] font-bold text-[#111827] mb-2">{section.emoji} {L(lang, section.title)}</p>
            <div className="space-y-1.5">
              {section.items.map((item, j) => (
                <p key={j} className="text-[12px] text-[#555] flex items-start gap-2">
                  <span className="text-[#C4725A] mt-0.5">•</span> {L(lang, item)}
                </p>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── #55 한국 콘센트/전압 ────────────────────────────────────
export function VoltageGuide({ lang }) {
  return (
    <div className="px-4 pt-4 pb-24">
      <p className="text-[20px] font-bold text-[#1A1A1A] mb-4">🔌 {L(lang, { ko: '콘센트/전압 안내', zh: '插座/电压指南', en: 'Plug & Voltage Guide' })}</p>
      <div className="bg-white rounded-[14px] p-4" style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
        <div className="text-center mb-4">
          <span className="text-[60px]">🔌</span>
        </div>
        <div className="space-y-3">
          <div className="flex justify-between items-center py-2" style={{ borderBottom: '1px solid #F3F4F6' }}>
            <span className="text-[13px] text-[#6B7280]">{L(lang, { ko: '전압', zh: '电压', en: 'Voltage' })}</span>
            <span className="text-[14px] font-bold text-[#111827]">220V / 60Hz</span>
          </div>
          <div className="flex justify-between items-center py-2" style={{ borderBottom: '1px solid #F3F4F6' }}>
            <span className="text-[13px] text-[#6B7280]">{L(lang, { ko: '플러그 타입', zh: '插头类型', en: 'Plug Type' })}</span>
            <span className="text-[14px] font-bold text-[#111827]">C / F {L(lang, { ko: '(둥근 2핀)', zh: '(圆形双孔)', en: '(round 2-pin)' })}</span>
          </div>
          <div className="flex justify-between items-center py-2">
            <span className="text-[13px] text-[#6B7280]">{L(lang, { ko: '중국과 호환', zh: '与中国兼容', en: 'China Compatible' })}</span>
            <span className="text-[14px] font-bold text-[#16A34A]">⚠️ {L(lang, { ko: '어댑터 필요', zh: '需要转换器', en: 'Adapter needed' })}</span>
          </div>
        </div>
      </div>
      <div className="mt-4 bg-[#FFFBEB] rounded-[14px] p-4">
        <p className="text-[13px] font-bold text-[#92400E] mb-2">💡 {L(lang, { ko: '팁', zh: '提示', en: 'Tips' })}</p>
        <div className="space-y-1">
          <p className="text-[12px] text-[#B45309]">• {L(lang, { ko: '편의점/다이소에서 어댑터 ₩1,000~3,000에 구매 가능', zh: '便利店/Daiso可买转换器 ₩1,000~3,000', en: 'Buy adapter at convenience stores ₩1,000~3,000' })}</p>
          <p className="text-[12px] text-[#B45309]">• {L(lang, { ko: '대부분의 호텔에서 무료 대여', zh: '大部分酒店免费借用', en: 'Most hotels lend for free' })}</p>
          <p className="text-[12px] text-[#B45309]">• {L(lang, { ko: '중국 220V 기기는 어댑터만 있으면 바로 사용', zh: '中国220V设备有转换器就可直接使用', en: 'Chinese 220V devices work with just an adapter' })}</p>
        </div>
      </div>
    </div>
  )
}

// ─── #58 쇼핑 면세 안내 ────────────────────────────────────
export function TaxFreeGuide({ lang }) {
  return (
    <div className="px-4 pt-4 pb-24">
      <p className="text-[20px] font-bold text-[#1A1A1A] mb-4">🧾 {L(lang, { ko: '쇼핑 면세 안내', zh: '退税购物指南', en: 'Tax-Free Shopping' })}</p>
      <div className="space-y-3">
        <div className="bg-white rounded-[14px] p-4" style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
          <p className="text-[14px] font-bold text-[#111827] mb-2">📋 {L(lang, { ko: '면세 조건', zh: '退税条件', en: 'Conditions' })}</p>
          <div className="space-y-1.5 text-[12px] text-[#555]">
            <p>• {L(lang, { ko: '1회 구매 ₩15,000 이상 (2024년 기준)', zh: '单次购买满₩15,000 (2024年)', en: 'Min ₩15,000 per purchase (2024)' })}</p>
            <p>• {L(lang, { ko: 'Tax Free/Tax Refund 마크가 있는 매장', zh: '有Tax Free/Tax Refund标志的店铺', en: 'Stores with Tax Free/Refund mark' })}</p>
            <p>• {L(lang, { ko: '출국 시 공항에서 환급 (3개월 이내)', zh: '出境时在机场退税 (3个月内)', en: 'Refund at airport within 3 months' })}</p>
          </div>
        </div>
        <div className="bg-white rounded-[14px] p-4" style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
          <p className="text-[14px] font-bold text-[#111827] mb-2">💰 {L(lang, { ko: '환급율', zh: '退税比例', en: 'Refund Rate' })}</p>
          <div className="space-y-1 text-[12px]">
            {[
              ['₩15,000 ~ ₩49,999', '₩1,000'],
              ['₩50,000 ~ ₩74,999', '₩3,500'],
              ['₩75,000 ~ ₩99,999', '₩5,000'],
              ['₩100,000 ~ ₩199,999', '₩7,000 ~ ₩14,000'],
              ['₩200,000+', '~7%'],
            ].map(([range, refund]) => (
              <div key={range} className="flex justify-between py-1" style={{ borderBottom: '1px solid #F3F4F6' }}>
                <span className="text-[#555]">{range}</span>
                <span className="font-bold text-[#C4725A]">{refund}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="bg-[#EEF2FF] rounded-[14px] p-4">
          <p className="text-[13px] font-bold text-[#4F46E5] mb-1">✈️ {L(lang, { ko: '공항 환급 절차', zh: '机场退税流程', en: 'Airport Refund Process' })}</p>
          <div className="space-y-1 text-[12px] text-[#4338CA]">
            <p>1. {L(lang, { ko: '자동환급 키오스크에서 여권 스캔', zh: '自助退税机扫描护照', en: 'Scan passport at kiosk' })}</p>
            <p>2. {L(lang, { ko: '환급 금액 확인 → 신용카드/현금 수령', zh: '确认退税金额→信用卡/现金领取', en: 'Confirm amount → receive via card/cash' })}</p>
            <p>3. {L(lang, { ko: '₩75,000 초과 시 세관 확인 필요', zh: '超过₩75,000需海关确认', en: 'Customs check if over ₩75,000' })}</p>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── #59 한국 팁/에티켓 ────────────────────────────────────
export function EtiquetteGuide({ lang }) {
  const tips = [
    { emoji: '🍜', title: { ko: '식사 예절', zh: '用餐礼仪', en: 'Dining' }, items: [
      { ko: '어른이 먼저 수저를 들 때까지 기다림', zh: '等长辈先动筷', en: 'Wait for elders to start eating' },
      { ko: '밥그릇을 들고 먹지 않음', zh: '不端起饭碗吃', en: 'Don\'t lift rice bowl' },
      { ko: '팁 문화가 없음 (팁 불필요!)', zh: '没有小费文化 (不需要给小费！)', en: 'No tipping culture!' },
    ]},
    { emoji: '🚇', title: { ko: '대중교통', zh: '公共交通', en: 'Transport' }, items: [
      { ko: '지하철에서 통화 삼가', zh: '地铁上尽量不打电话', en: 'Avoid phone calls on subway' },
      { ko: '노약자석에 앉지 않기', zh: '不要坐老弱病残孕专座', en: 'Don\'t sit in priority seats' },
      { ko: '에스컬레이터 오른쪽 서기', zh: '扶梯靠右站', en: 'Stand right on escalators' },
    ]},
    { emoji: '🏠', title: { ko: '일반 매너', zh: '一般礼仪', en: 'General' }, items: [
      { ko: '신발 벗고 실내 입장 (한옥, 일부 식당)', zh: '进屋脱鞋 (韩屋、部分餐厅)', en: 'Remove shoes indoors' },
      { ko: '두 손으로 물건 주고받기', zh: '双手递接物品', en: 'Use both hands to give/receive' },
      { ko: '쓰레기 분리수거 (일반/재활용/음식물)', zh: '垃圾分类 (一般/可回收/厨余)', en: 'Separate recycling' },
    ]},
  ]
  return (
    <div className="px-4 pt-4 pb-24">
      <p className="text-[20px] font-bold text-[#1A1A1A] mb-4">🎎 {L(lang, { ko: '한국 에티켓', zh: '韩国礼仪', en: 'Korean Etiquette' })}</p>
      <div className="space-y-3">
        {tips.map(section => (
          <div key={L(lang, section.title)} className="bg-white rounded-[14px] p-4" style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
            <p className="text-[14px] font-bold text-[#111827] mb-2">{section.emoji} {L(lang, section.title)}</p>
            <div className="space-y-1.5">
              {section.items.map((item, j) => (
                <p key={j} className="text-[12px] text-[#555]">• {L(lang, item)}</p>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── #61 SIM/eSIM 안내 ────────────────────────────────────
export function SimGuide({ lang }) {
  return (
    <div className="px-4 pt-4 pb-24">
      <p className="text-[20px] font-bold text-[#1A1A1A] mb-4">📱 {L(lang, { ko: 'SIM/eSIM 구매 안내', zh: 'SIM/eSIM购买指南', en: 'SIM/eSIM Guide' })}</p>
      <div className="space-y-3">
        {[
          { title: 'eSIM', emoji: '📲', desc: { ko: '공항 도착 전 온라인 구매 추천', zh: '建议到达前在线购买', en: 'Buy online before arrival' },
            items: [
              { ko: 'Airalo, eSIM2fly 등 앱에서 구매', zh: 'Airalo, eSIM2fly等APP购买', en: 'Buy via Airalo, eSIM2fly apps' },
              { ko: '가격: 5일 약 ₩8,000~15,000', zh: '价格：5天约₩8,000~15,000', en: 'Price: ~₩8,000-15,000 for 5 days' },
              { ko: 'QR코드 스캔으로 즉시 활성화', zh: '扫描QR码即时激活', en: 'Instant activation via QR scan' },
            ]},
          { title: { ko: '유심 (USIM)', zh: 'USIM实体卡', en: 'Physical SIM' }, emoji: '💳',
            items: [
              { ko: '인천공항 1층 통신사 부스', zh: '仁川机场1层运营商柜台', en: 'Airport 1F carrier booths' },
              { ko: 'KT, SKT, LG U+ 선불 유심', zh: 'KT/SKT/LG U+ 预付费USIM', en: 'KT, SKT, LG U+ prepaid' },
              { ko: '가격: 1일 ₩4,000~, 5일 ₩20,000~', zh: '价格：1天₩4,000~, 5天₩20,000~', en: 'Price: 1 day ₩4,000~, 5 days ₩20,000~' },
              { ko: '여권 필요', zh: '需要护照', en: 'Passport required' },
            ]},
          { title: { ko: '포켓 와이파이', zh: '随身WiFi', en: 'Pocket WiFi' }, emoji: '📶',
            items: [
              { ko: '인천공항 수령/반납', zh: '仁川机场领取/归还', en: 'Pick up/return at airport' },
              { ko: '여러 기기 연결 가능 (가족여행 추천)', zh: '可连接多台设备 (家庭旅行推荐)', en: 'Connect multiple devices' },
              { ko: '가격: 1일 ₩3,000~5,000', zh: '价格：1天₩3,000~5,000', en: 'Price: ₩3,000-5,000/day' },
            ]},
        ].map(section => (
          <div key={typeof section.title === 'string' ? section.title : L(lang, section.title)} className="bg-white rounded-[14px] p-4" style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
            <p className="text-[14px] font-bold text-[#111827] mb-2">{section.emoji} {typeof section.title === 'string' ? section.title : L(lang, section.title)}</p>
            {section.desc && <p className="text-[11px] text-[#C4725A] mb-2">{L(lang, section.desc)}</p>}
            <div className="space-y-1.5">
              {section.items.map((item, j) => (
                <p key={j} className="text-[12px] text-[#555]">• {L(lang, item)}</p>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── #64 한국 물가 가이드 ────────────────────────────────────
export function PriceGuide({ lang }) {
  const prices = [
    { emoji: '☕', item: { ko: '아메리카노', zh: '美式咖啡', en: 'Americano' }, price: '₩4,500~5,500', note: { ko: '스타벅스 기준', zh: '星巴克价格', en: 'Starbucks' } },
    { emoji: '🍜', item: { ko: '김치찌개', zh: '泡菜汤', en: 'Kimchi Stew' }, price: '₩8,000~10,000', note: { ko: '일반 식당', zh: '普通餐厅', en: 'Regular restaurant' } },
    { emoji: '🍚', item: { ko: '편의점 도시락', zh: '便利店便当', en: 'Convenience Store Lunch' }, price: '₩3,500~5,000', note: { ko: 'CU/GS25', zh: 'CU/GS25', en: 'CU/GS25' } },
    { emoji: '🚇', item: { ko: '지하철 기본요금', zh: '地铁基本票价', en: 'Subway Base Fare' }, price: '₩1,400', note: { ko: 'T-money 기준', zh: 'T-money', en: 'with T-money' } },
    { emoji: '🚕', item: { ko: '택시 기본요금', zh: '出租车起步价', en: 'Taxi Base Fare' }, price: '₩4,800', note: { ko: '일반 택시', zh: '普通出租车', en: 'Regular taxi' } },
    { emoji: '🍺', item: { ko: '맥주 (500ml)', zh: '啤酒 (500ml)', en: 'Beer (500ml)' }, price: '₩4,000~7,000', note: { ko: '식당/편의점', zh: '餐厅/便利店', en: 'Restaurant/Store' } },
    { emoji: '💧', item: { ko: '생수 (500ml)', zh: '矿泉水 (500ml)', en: 'Water (500ml)' }, price: '₩800~1,200', note: { ko: '편의점', zh: '便利店', en: 'Convenience store' } },
    { emoji: '🎬', item: { ko: '영화 티켓', zh: '电影票', en: 'Movie Ticket' }, price: '₩13,000~15,000', note: { ko: 'CGV/롯데시네마', zh: 'CGV/乐天影院', en: 'CGV/Lotte Cinema' } },
    { emoji: '🏨', item: { ko: '게스트하우스', zh: '民宿', en: 'Guesthouse' }, price: '₩25,000~50,000', note: { ko: '1박', zh: '每晚', en: 'per night' } },
    { emoji: '🏪', item: { ko: '삼각김밥', zh: '三角饭团', en: 'Rice Ball' }, price: '₩1,000~1,500', note: { ko: '편의점', zh: '便利店', en: 'Convenience store' } },
  ]
  return (
    <div className="px-4 pt-4 pb-24">
      <p className="text-[20px] font-bold text-[#1A1A1A] mb-4">💰 {L(lang, { ko: '한국 물가 가이드', zh: '韩国物价指南', en: 'Korea Price Guide' })}</p>
      <div className="bg-white rounded-[14px] overflow-hidden" style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
        {prices.map((p, i) => (
          <div key={i} className="flex items-center gap-3 px-4 py-3" style={i > 0 ? { borderTop: '1px solid #F3F4F6' } : {}}>
            <span className="text-lg">{p.emoji}</span>
            <div className="flex-1">
              <p className="text-[13px] font-medium text-[#111827]">{L(lang, p.item)}</p>
              <p className="text-[10px] text-[#9CA3AF]">{L(lang, p.note)}</p>
            </div>
            <span className="text-[13px] font-bold text-[#C4725A]">{p.price}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── #66 음식 알레르기 카드 ────────────────────────────────────
export function AllergyCard({ lang }) {
  const allergies = [
    { emoji: '🥜', ko: '땅콩', zh: '花生', en: 'Peanut' },
    { emoji: '🌾', ko: '밀 (글루텐)', zh: '小麦 (麸质)', en: 'Wheat (Gluten)' },
    { emoji: '🥛', ko: '우유 (유제품)', zh: '牛奶 (乳制品)', en: 'Milk (Dairy)' },
    { emoji: '🥚', ko: '계란', zh: '鸡蛋', en: 'Egg' },
    { emoji: '🦐', ko: '새우/갑각류', zh: '虾/甲壳类', en: 'Shrimp/Shellfish' },
    { emoji: '🐟', ko: '생선', zh: '鱼', en: 'Fish' },
    { emoji: '🫘', ko: '대두 (콩)', zh: '大豆', en: 'Soy' },
    { emoji: '🌰', ko: '견과류', zh: '坚果', en: 'Tree Nuts' },
    { emoji: '🍑', ko: '복숭아', zh: '桃子', en: 'Peach' },
  ]
  const [selected, setSelected] = useState([])
  const toggle = (ko) => setSelected(prev => prev.includes(ko) ? prev.filter(x => x !== ko) : [...prev, ko])

  return (
    <div className="px-4 pt-4 pb-24">
      <p className="text-[20px] font-bold text-[#1A1A1A] mb-1">⚠️ {L(lang, { ko: '음식 알레르기 카드', zh: '食物过敏卡', en: 'Food Allergy Card' })}</p>
      <p className="text-[11px] text-[#9CA3AF] mb-4">{L(lang, { ko: '알레르기를 선택하고 식당에 보여주세요', zh: '选择过敏原，在餐厅出示', en: 'Select allergies and show at restaurant' })}</p>

      <div className="flex flex-wrap gap-2 mb-4">
        {allergies.map(a => (
          <button key={a.ko} onClick={() => toggle(a.ko)}
            className="px-3 py-2 rounded-full text-[12px] font-medium transition-all"
            style={{ background: selected.includes(a.ko) ? '#DC2626' : '#F3F4F6', color: selected.includes(a.ko) ? '#FFF' : '#555' }}>
            {a.emoji} {L(lang, a)}
          </button>
        ))}
      </div>

      {selected.length > 0 && (
        <div className="bg-white rounded-[14px] p-5 text-center" style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.1)', border: '2px solid #DC2626' }}>
          <p className="text-[16px] font-bold text-[#DC2626] mb-3">⚠️ 식품 알레르기 / 食物过敏</p>
          <p className="text-[14px] text-[#111827] mb-2">
            {L(lang, { ko: '아래 음식을 먹을 수 없습니다:', zh: '我不能吃以下食物：', en: 'I cannot eat the following:' })}
          </p>
          <div className="space-y-1 mb-3">
            {selected.map(ko => {
              const item = allergies.find(a => a.ko === ko)
              return (
                <p key={ko} className="text-[16px] font-bold text-[#DC2626]">
                  {item.emoji} {item.ko} / {item.zh} / {item.en}
                </p>
              )
            })}
          </div>
          <p className="text-[13px] text-[#555]">
            이 음식이 포함된 메뉴가 있으면 알려주세요.<br/>
            如果菜单中含有这些食物，请告诉我。
          </p>
        </div>
      )}
    </div>
  )
}

// ─── #68 분실물 신고 안내 ────────────────────────────────────
export function LostItemGuide({ lang }) {
  return (
    <div className="px-4 pt-4 pb-24">
      <p className="text-[20px] font-bold text-[#1A1A1A] mb-4">📦 {L(lang, { ko: '분실물 신고', zh: '失物报告', en: 'Lost & Found' })}</p>
      <div className="space-y-3">
        <div className="bg-white rounded-[14px] p-4" style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
          <p className="text-[14px] font-bold text-[#111827] mb-2">📞 {L(lang, { ko: '전화 신고', zh: '电话报告', en: 'Phone Report' })}</p>
          <a href="tel:112" className="flex items-center gap-2 py-2">
            <span className="text-[14px] font-bold text-[#C4725A]">112</span>
            <span className="text-[12px] text-[#555]">{L(lang, { ko: '경찰 (24시간)', zh: '警察 (24小时)', en: 'Police (24h)' })}</span>
          </a>
          <a href="tel:1566-0112" className="flex items-center gap-2 py-2">
            <span className="text-[14px] font-bold text-[#C4725A]">1566-0112</span>
            <span className="text-[12px] text-[#555]">{L(lang, { ko: '경찰 분실물센터', zh: '警察失物中心', en: 'Police Lost & Found' })}</span>
          </a>
        </div>
        <div className="bg-white rounded-[14px] p-4" style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
          <p className="text-[14px] font-bold text-[#111827] mb-2">🌐 {L(lang, { ko: '온라인 조회', zh: '在线查询', en: 'Online Search' })}</p>
          <a href="https://www.lost112.go.kr" target="_blank" rel="noreferrer"
            className="block bg-[#EEF2FF] rounded-[10px] px-4 py-3 text-[12px] font-semibold text-[#4F46E5] active:scale-95 transition-transform">
            🔗 lost112.go.kr — {L(lang, { ko: '경찰청 분실물 종합관리', zh: '警察厅失物综合管理', en: 'Police Lost Property System' })}
          </a>
        </div>
        <div className="bg-[#FFFBEB] rounded-[14px] p-4">
          <p className="text-[13px] font-bold text-[#92400E] mb-2">💡 {L(lang, { ko: '장소별 신고', zh: '按地点报告', en: 'By Location' })}</p>
          <div className="space-y-1.5 text-[12px] text-[#B45309]">
            <p>• {L(lang, { ko: '지하철: 해당 역 분실물센터 또는 1544-7788', zh: '地铁：该站失物中心或 1544-7788', en: 'Subway: station Lost & Found or 1544-7788' })}</p>
            <p>• {L(lang, { ko: '버스: 120 (다산콜센터)', zh: '公交：120 (首尔热线)', en: 'Bus: 120 (Seoul Helpline)' })}</p>
            <p>• {L(lang, { ko: '택시: 120 또는 앱 내 분실물 신고', zh: '出租车：120或APP内失物报告', en: 'Taxi: 120 or in-app report' })}</p>
            <p>• {L(lang, { ko: '공항: 인천공항 1577-2600', zh: '机场：仁川机场 1577-2600', en: 'Airport: Incheon 1577-2600' })}</p>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── #65 공휴일 캘린더 ────────────────────────────────────
export function HolidayCalendar({ lang }) {
  const holidays2026 = [
    { date: '01-01', ko: '신정', zh: '元旦', en: "New Year's Day" },
    { date: '02-17', ko: '설날 연휴', zh: '春节', en: 'Lunar New Year' },
    { date: '02-18', ko: '설날', zh: '春节', en: 'Lunar New Year' },
    { date: '02-19', ko: '설날 연휴', zh: '春节', en: 'Lunar New Year' },
    { date: '03-01', ko: '삼일절', zh: '三一节', en: 'Independence Movement Day' },
    { date: '05-05', ko: '어린이날', zh: '儿童节', en: "Children's Day" },
    { date: '05-24', ko: '부처님 오신 날', zh: '佛诞节', en: "Buddha's Birthday" },
    { date: '06-06', ko: '현충일', zh: '显忠日', en: 'Memorial Day' },
    { date: '08-15', ko: '광복절', zh: '光复节', en: 'Liberation Day' },
    { date: '09-24', ko: '추석 연휴', zh: '中秋节', en: 'Chuseok' },
    { date: '09-25', ko: '추석', zh: '中秋节', en: 'Chuseok' },
    { date: '09-26', ko: '추석 연휴', zh: '中秋节', en: 'Chuseok' },
    { date: '10-03', ko: '개천절', zh: '开天节', en: 'National Foundation Day' },
    { date: '10-09', ko: '한글날', zh: '韩文日', en: 'Hangul Day' },
    { date: '12-25', ko: '크리스마스', zh: '圣诞节', en: 'Christmas' },
  ]
  const today = new Date().toISOString().slice(5, 10)
  return (
    <div className="px-4 pt-4 pb-24">
      <p className="text-[20px] font-bold text-[#1A1A1A] mb-4">📅 {L(lang, { ko: '2026 공휴일', zh: '2026韩国公休日', en: '2026 Korean Holidays' })}</p>
      <div className="bg-white rounded-[14px] overflow-hidden" style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
        {holidays2026.map((h, i) => {
          const isPast = h.date < today
          return (
            <div key={`${h.date}-${i}`} className="flex items-center gap-3 px-4 py-3" style={i > 0 ? { borderTop: '1px solid #F3F4F6' } : {}}>
              <span className={`text-[13px] font-mono w-12 ${isPast ? 'text-[#D1D5DB]' : 'text-[#C4725A] font-bold'}`}>{h.date.replace('-', '/')}</span>
              <p className={`text-[13px] flex-1 ${isPast ? 'text-[#D1D5DB]' : 'text-[#111827] font-medium'}`}>{L(lang, h)}</p>
              {h.date === today && <span className="text-[10px] bg-[#DC2626] text-white px-2 py-0.5 rounded-full font-bold">TODAY</span>}
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ─── 디스커버서울패스 가성비 시뮬레이터 ────────────────────────
export function DiscoverSeoulPass({ lang }) {
  const [selectedSpots, setSelectedSpots] = useState([])
  const spots = [
    { name: { ko: '경복궁', zh: '景福宫', en: 'Gyeongbokgung' }, price: 3000 },
    { name: { ko: 'N서울타워', zh: 'N首尔塔', en: 'N Seoul Tower' }, price: 16000 },
    { name: { ko: '롯데월드', zh: '乐天世界', en: 'Lotte World' }, price: 62000 },
    { name: { ko: '코엑스 아쿠아리움', zh: 'COEX水族馆', en: 'COEX Aquarium' }, price: 29000 },
    { name: { ko: '남산 케이블카', zh: '南山缆车', en: 'Namsan Cable Car' }, price: 14000 },
    { name: { ko: '한강 유람선', zh: '汉江游船', en: 'Han River Cruise' }, price: 18000 },
    { name: { ko: '63스퀘어 전망대', zh: '63展望台', en: '63 Square Observatory' }, price: 15000 },
    { name: { ko: 'AREX 직통 (편도)', zh: 'AREX直达 (单程)', en: 'AREX Express (one-way)' }, price: 9500 },
    { name: { ko: '시티투어 버스', zh: '观光巴士', en: 'City Tour Bus' }, price: 15000 },
    { name: { ko: '따릉이 24시간', zh: '公共自行车24小时', en: 'Ttareungyi 24h' }, price: 2000 },
  ]
  const toggle = (i) => setSelectedSpots(p => p.includes(i) ? p.filter(x => x !== i) : [...p, i])
  const total = selectedSpots.reduce((s, i) => s + spots[i].price, 0)
  const passes = [
    { name: 'Pick 3 Basic', price: 49000 },
    { name: 'All 72h', price: 90000 },
    { name: 'All 120h', price: 130000 },
  ]

  return (
    <div className="px-4 pt-4 pb-24">
      <p className="text-[20px] font-bold text-[#1A1A1A] mb-1">🎫 {L(lang, { ko: '디스커버서울패스', zh: 'Discover Seoul Pass', en: 'Discover Seoul Pass' })}</p>
      <p className="text-[11px] text-[#9CA3AF] mb-4">{L(lang, { ko: '갈 곳을 선택하고 얼마나 아끼는지 확인!', zh: '选择目的地，看能省多少钱！', en: 'Select spots and see how much you save!' })}</p>

      <div className="flex flex-wrap gap-2 mb-4">
        {spots.map((s, i) => (
          <button key={i} onClick={() => toggle(i)}
            className="px-3 py-2 rounded-full text-[11px] font-medium transition-all"
            style={{ background: selectedSpots.includes(i) ? '#111827' : '#F3F4F6', color: selectedSpots.includes(i) ? '#FFF' : '#555' }}>
            {L(lang, s.name)} <span className="opacity-60">₩{s.price.toLocaleString()}</span>
          </button>
        ))}
      </div>

      {selectedSpots.length > 0 && (
        <div className="bg-white rounded-[14px] p-4 mb-4" style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
          <p className="text-[13px] font-bold text-[#374151] mb-2">💰 {L(lang, { ko: '비교 결과', zh: '对比结果', en: 'Comparison' })}</p>
          <div className="flex justify-between text-[12px] py-1.5" style={{ borderBottom: '1px solid #F3F4F6' }}>
            <span className="text-[#555]">{L(lang, { ko: '개별 구매', zh: '单独购买', en: 'Individual' })}</span>
            <span className="font-bold">₩{total.toLocaleString()}</span>
          </div>
          {passes.map(p => {
            const saved = total - p.price
            return (
              <div key={p.name} className="flex justify-between text-[12px] py-1.5" style={{ borderBottom: '1px solid #F3F4F6' }}>
                <span className="text-[#555]">{p.name}</span>
                <span className={`font-bold ${saved > 0 ? 'text-[#16A34A]' : 'text-[#DC2626]'}`}>
                  {saved > 0 ? `✅ ₩${saved.toLocaleString()} ${L(lang, { ko: '절약', zh: '省', en: 'saved' })}` : `❌ ₩${Math.abs(saved).toLocaleString()} ${L(lang, { ko: '더 비쌈', zh: '更贵', en: 'more' })}`}
                </span>
              </div>
            )
          })}
        </div>
      )}

      <a href="https://www.discoverseoulpass.com" target="_blank" rel="noreferrer"
        className="block w-full py-3 rounded-[12px] bg-[#C4725A] text-white text-[13px] font-bold text-center active:scale-95 transition-transform">
        🛒 {L(lang, { ko: '디스커버서울패스 구매하기', zh: '购买Discover Seoul Pass', en: 'Buy Discover Seoul Pass' })}
      </a>
    </div>
  )
}

// ─── 한류 체험 프로그램 예약 ────────────────────────
export function HallyuExperiences({ lang }) {
  const [filter, setFilter] = useState('all')
  const [exps, setExps] = useState([])

  useEffect(() => {
    import('../api/visitSeoulApi').then(mod => setExps(mod.HALLYU_EXPERIENCES))
  }, [])

  const filtered = filter === 'all' ? exps : exps.filter(e => e.category === filter)

  return (
    <div className="px-4 pt-4 pb-24">
      <p className="text-[20px] font-bold text-[#1A1A1A] mb-1">🎪 {L(lang, { ko: '한류 체험 프로그램', zh: '韩流体验项目', en: 'Hallyu Experiences' })}</p>
      <p className="text-[11px] text-[#9CA3AF] mb-3">{L(lang, { ko: 'Visit Seoul 공식 프로그램', zh: 'Visit Seoul官方项目', en: 'Official Visit Seoul Programs' })}</p>

      <div className="flex gap-1.5 overflow-x-auto pb-2 mb-3" style={{ scrollbarWidth: 'none' }}>
        {[
          { id: 'all', label: { ko: '전체', zh: '全部', en: 'All' } },
          { id: 'beauty', label: { ko: '뷰티', zh: '美妆', en: 'Beauty' } },
          { id: 'kpop', label: { ko: 'K-POP', zh: 'K-POP', en: 'K-POP' } },
          { id: 'food', label: { ko: '음식', zh: '美食', en: 'Food' } },
          { id: 'culture', label: { ko: '문화', zh: '文化', en: 'Culture' } },
        ].map(c => (
          <button key={c.id} onClick={() => setFilter(c.id)}
            className="px-3 py-1.5 rounded-full text-[11px] font-medium shrink-0"
            style={{ background: filter === c.id ? '#111827' : '#F3F4F6', color: filter === c.id ? '#FFF' : '#555' }}>
            {L(lang, c.label)}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {filtered.map(exp => (
          <div key={exp.id} className="bg-white rounded-[14px] p-4" style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
            <div className="flex items-start gap-3">
              <span className="text-2xl">{exp.emoji}</span>
              <div className="flex-1">
                <p className="text-[14px] font-bold text-[#111827]">{L(lang, exp.title)}</p>
                <p className="text-[11px] text-[#6B7280] mt-0.5">{exp.brand} · {exp.duration}</p>
                <p className="text-[12px] text-[#555] mt-1">{L(lang, exp.desc)}</p>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-[14px] font-bold text-[#C4725A]">{exp.price}</span>
                  <a href={exp.bookingUrl} target="_blank" rel="noreferrer"
                    className="text-[11px] bg-[#111827] text-white px-3 py-1.5 rounded-full font-medium active:scale-95 transition-transform">
                    {L(lang, { ko: '예약하기', zh: '立即预约', en: 'Book Now' })}
                  </a>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── 도심 등산 코스 ────────────────────────
export function HikingCourses({ lang }) {
  const [courses, setCourses] = useState([])

  useEffect(() => {
    import('../api/visitSeoulApi').then(mod => setCourses(mod.HIKING_COURSES))
  }, [])

  return (
    <div className="px-4 pt-4 pb-24">
      <p className="text-[20px] font-bold text-[#1A1A1A] mb-1">🥾 {L(lang, { ko: '서울 등산 코스', zh: '首尔登山路线', en: 'Seoul Hiking Courses' })}</p>
      <p className="text-[11px] text-[#9CA3AF] mb-4">{L(lang, { ko: '도심 속 가벼운 하이킹 (轻徒步)', zh: '城市轻徒步', en: 'Urban Light Hiking' })}</p>

      <div className="space-y-3">
        {courses.map(c => (
          <div key={c.id} className="bg-white rounded-[14px] p-4" style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
            <div className="flex items-start gap-3">
              <span className="text-2xl">{c.emoji}</span>
              <div className="flex-1">
                <p className="text-[14px] font-bold text-[#111827]">{L(lang, c.title)}</p>
                <p className="text-[12px] text-[#555] mt-1">{L(lang, c.desc)}</p>
                <div className="flex gap-2 mt-2">
                  <span className="text-[10px] bg-[#F3F4F6] text-[#555] px-2 py-0.5 rounded-full">{L(lang, c.difficulty)}</span>
                  <span className="text-[10px] bg-[#F3F4F6] text-[#555] px-2 py-0.5 rounded-full">⏱ {c.duration}</span>
                  <span className="text-[10px] bg-[#F3F4F6] text-[#555] px-2 py-0.5 rounded-full">📏 {c.length}</span>
                </div>
                <a href={`https://map.kakao.com/link/to/${encodeURIComponent(L(lang, c.title))},${c.start.lat},${c.start.lng}`}
                  target="_blank" rel="noreferrer"
                  className="mt-2 inline-block text-[11px] bg-[#FEE500] text-[#111827] font-bold px-3 py-1.5 rounded-full active:scale-95 transition-transform">
                  🗺 {L(lang, { ko: '출발점 길찾기', zh: '导航到起点', en: 'Navigate to Start' })}
                </a>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Taste of Seoul 서울의 맛 ────────────────────────────────
const TASTE_CATEGORIES = [
  { id: 'all', label: { ko: '전체', zh: '全部', en: 'All' }, emoji: '🍽️' },
  { id: 'classic', label: { ko: '한식 클래식', zh: '韩食经典', en: 'Korean Classic' }, emoji: '🇰🇷' },
  { id: 'street', label: { ko: '길거리 음식', zh: '街头小吃', en: 'Street Food' }, emoji: '🛒' },
  { id: 'trendy', label: { ko: '트렌디', zh: '网红美食', en: 'Trendy' }, emoji: '🔥' },
  { id: 'dessert', label: { ko: '디저트', zh: '甜品', en: 'Dessert' }, emoji: '🍰' },
  { id: 'drink', label: { ko: '술·음료', zh: '酒饮', en: 'Drinks' }, emoji: '🍶' },
]

const TASTE_ITEMS = [
  // 한식 클래식
  { id: 'bibimbap', category: 'classic', emoji: '🍚', name: { ko: '비빔밥', zh: '拌饭', en: 'Bibimbap' }, price: '8,000~12,000', desc: { ko: '밥 위에 나물·고추장·계란, 전주 비빔밥이 유명', zh: '米饭上放蔬菜·辣酱·鸡蛋，全州拌饭最有名', en: 'Rice with vegetables, gochujang & egg' }, area: { ko: '전주·서울 종로', zh: '全州·首尔钟路', en: 'Jeonju · Jongno' }, tip: { ko: '돌솥비빔밥은 바닥 누룽지가 핵심!', zh: '石锅拌饭底部的锅巴是精华！', en: 'Stone pot bibimbap: the crispy rice is the best part!' } },
  { id: 'samgyeopsal', category: 'classic', emoji: '🥩', name: { ko: '삼겹살', zh: '五花肉', en: 'Samgyeopsal' }, price: '14,000~18,000', desc: { ko: '한국식 돼지 삼겹살 구이, 소주와 함께!', zh: '韩式烤五花肉，配烧酒！', en: 'Korean grilled pork belly with soju!' }, area: { ko: '마포·종로', zh: '麻浦·钟路', en: 'Mapo · Jongno' }, tip: { ko: '상추+마늘+쌈장으로 쌈 싸서 먹기', zh: '用生菜+蒜+酱包着吃', en: 'Wrap in lettuce with garlic & ssamjang' } },
  { id: 'kimchijjigae', category: 'classic', emoji: '🍲', name: { ko: '김치찌개', zh: '泡菜汤', en: 'Kimchi Jjigae' }, price: '7,000~9,000', desc: { ko: '한국의 소울푸드, 묵은지 김치찌개가 일품', zh: '韩国灵魂食物，陈年泡菜汤绝了', en: "Korea's soul food, aged kimchi stew" }, area: { ko: '어디서나', zh: '到处都有', en: 'Everywhere' }, tip: { ko: '밥 말아먹으면 최고', zh: '泡饭吃最好', en: 'Mix with rice for the best experience' } },
  { id: 'tteokbokki-classic', category: 'classic', emoji: '🌶️', name: { ko: '떡볶이', zh: '炒年糕', en: 'Tteokbokki' }, price: '3,500~5,000', desc: { ko: '매콤달콤 국민간식, 매운맛 레벨 확인!', zh: '甜辣国民小吃，注意辣度等级！', en: 'Sweet & spicy rice cakes, check the spice level!' }, area: { ko: '신당동 떡볶이 골목', zh: '新堂洞炒年糕巷', en: 'Sindang-dong Tteokbokki Alley' }, tip: { ko: '순대+튀김 세트가 정석', zh: '配米肠+炸物套餐是正宗吃法', en: 'Add sundae + tempura for the full set' } },
  { id: 'galbi', category: 'classic', emoji: '🔥', name: { ko: '갈비', zh: '排骨', en: 'Galbi' }, price: '25,000~45,000', desc: { ko: '달콤하게 양념한 소갈비, 특별한 날 추천', zh: '甜味腌制牛排骨，特殊日子推荐', en: 'Sweet marinated beef ribs, great for special occasions' }, area: { ko: '마포·강남', zh: '麻浦·江南', en: 'Mapo · Gangnam' }, tip: { ko: '냉면과 함께가 한국 정석', zh: '配冷面是韩国标配', en: 'Pair with naengmyeon like locals' } },

  // 길거리 음식
  { id: 'hotteok', category: 'street', emoji: '🥞', name: { ko: '호떡', zh: '糖饼', en: 'Hotteok' }, price: '1,500~2,000', desc: { ko: '겨울 필수! 흑설탕+견과류 녹진한 맛', zh: '冬天必吃！黑糖+坚果满满的味道', en: 'Winter must-eat! Melty brown sugar & nuts' }, area: { ko: '남대문·명동', zh: '南大门·明洞', en: 'Namdaemun · Myeongdong' }, tip: { ko: '꿀/치즈 호떡도 도전!', zh: '也试试蜂蜜/芝士糖饼！', en: 'Try honey or cheese hotteok too!' } },
  { id: 'eomuk', category: 'street', emoji: '🍢', name: { ko: '어묵', zh: '鱼糕', en: 'Fish Cake' }, price: '1,000~1,500', desc: { ko: '따뜻한 어묵 국물, 추울 때 한 그릇', zh: '温暖的鱼糕汤，冷天来一碗', en: 'Warm fish cake broth, perfect when cold' }, area: { ko: '포장마차 어디서나', zh: '路边摊到处都有', en: 'Street stalls everywhere' }, tip: { ko: '국물은 무료! 종이컵으로 셀프', zh: '汤是免费的！自助纸杯', en: 'Broth is free! Self-serve with paper cups' } },
  { id: 'gimbap', category: 'street', emoji: '🍙', name: { ko: '김밥', zh: '紫菜包饭', en: 'Gimbap' }, price: '3,000~4,500', desc: { ko: '한국식 김밥, 한 줄에 다양한 재료', zh: '韩式紫菜包饭，一卷多种食材', en: 'Korean seaweed rice rolls, multiple fillings' }, area: { ko: '분식집 어디서나', zh: '小吃店到处都有', en: 'Bunsik restaurants everywhere' }, tip: { ko: '참치김밥이 가장 인기!', zh: '金枪鱼紫菜包饭最受欢迎！', en: 'Tuna gimbap is the most popular!' } },
  { id: 'twigim', category: 'street', emoji: '🍤', name: { ko: '튀김', zh: '炸物', en: 'Twigim' }, price: '1,000~2,000', desc: { ko: '고구마·김말이·새우 등 바삭한 튀김', zh: '红薯·紫菜卷·虾等酥脆炸物', en: 'Crispy fried sweet potato, seaweed rolls, shrimp' }, area: { ko: '시장·포장마차', zh: '市场·路边摊', en: 'Markets · Street stalls' }, tip: { ko: '떡볶이 국물에 찍어 먹기!', zh: '蘸炒年糕酱汁吃！', en: 'Dip in tteokbokki sauce!' } },

  // 트렌디
  { id: 'croffle', category: 'trendy', emoji: '🧇', name: { ko: '크로플', zh: '可颂华夫', en: 'Croffle' }, price: '4,500~7,000', desc: { ko: '크루아상+와플 = 크로플! 한국 카페 대세', zh: '牛角面包+华夫=可颂华夫！韩国咖啡厅潮流', en: 'Croissant + waffle = croffle! Korean cafe trend' }, area: { ko: '성수·연남·한남', zh: '圣水·延南·汉南', en: 'Seongsu · Yeonnam · Hannam' }, tip: { ko: '아이스크림 토핑 추천', zh: '推荐冰淇淋顶配', en: 'Add ice cream topping' } },
  { id: 'yakgwa', category: 'trendy', emoji: '🍪', name: { ko: '약과', zh: '药果', en: 'Yakgwa' }, price: '3,000~5,000', desc: { ko: '전통 과자의 트렌디한 부활! 약과 라떼, 약과 크림', zh: '传统糕点时尚回归！药果拿铁、药果奶油', en: "Traditional cookie's trendy revival! Yakgwa latte & cream" }, area: { ko: '익선동·삼청동', zh: '益善洞·三清洞', en: 'Ikseon-dong · Samcheong-dong' }, tip: { ko: '2024~2026 최대 트렌드 디저트', zh: '2024~2026最火甜品趋势', en: '2024-2026 biggest dessert trend' } },
  { id: 'korean-bbq-omakase', category: 'trendy', emoji: '🥓', name: { ko: '고기 오마카세', zh: '烤肉Omakase', en: 'BBQ Omakase' }, price: '35,000~80,000', desc: { ko: '셰프가 골라주는 최상급 한우 코스', zh: '主厨精选顶级韩牛套餐', en: 'Chef-selected premium Hanwoo course' }, area: { ko: '압구정·청담', zh: '狎鸥亭·清潭', en: 'Apgujeong · Cheongdam' }, tip: { ko: '예약 필수! 최소 1주 전', zh: '必须预约！至少提前1周', en: 'Reservation required! At least 1 week ahead' } },

  // 디저트
  { id: 'bingsu', category: 'dessert', emoji: '🍧', name: { ko: '빙수', zh: '刨冰', en: 'Bingsu' }, price: '12,000~18,000', desc: { ko: '여름 필수! 팥빙수·망고빙수·인절미빙수', zh: '夏天必吃！红豆·芒果·年糕刨冰', en: 'Summer must! Red bean, mango, injeolmi bingsu' }, area: { ko: '설빙·카페 어디서나', zh: '雪冰·各咖啡厅', en: 'Sulbing · cafes everywhere' }, tip: { ko: '2인이서 나눠먹기 적당한 양', zh: '适合2人分享的量', en: 'Perfect amount for 2 people to share' } },
  { id: 'bungeoppang', category: 'dessert', emoji: '🐟', name: { ko: '붕어빵', zh: '鲫鱼饼', en: 'Bungeoppang' }, price: '1,000~2,000', desc: { ko: '겨울 간식! 팥·슈크림·고구마 속', zh: '冬季小吃！红豆·奶油·红薯馅', en: 'Winter snack! Red bean, custard, sweet potato' }, area: { ko: '길거리 어디서나', zh: '街边到处都有', en: 'Street stalls everywhere' }, tip: { ko: '꼬리부터 먹을 것인가, 머리부터 먹을 것인가?', zh: '从尾巴开始吃还是从头开始？', en: 'Tail first or head first?' } },

  // 술·음료
  { id: 'soju', category: 'drink', emoji: '🍶', name: { ko: '소주', zh: '烧酒', en: 'Soju' }, price: '4,500~5,500', desc: { ko: '한국의 국민 술! 참이슬·처음처럼·새로', zh: '韩国国民酒！真露·初次·새로', en: "Korea's national drink! Chamisul, Chum Churum, Saero" }, area: { ko: '편의점·식당 어디서나', zh: '便利店·餐厅到处都有', en: 'Convenience stores & restaurants' }, tip: { ko: '과일 소주(자몽·청포도)가 외국인에게 인기', zh: '水果烧酒(葡萄柚·青葡萄)外国人最爱', en: 'Fruit soju (grapefruit, green grape) popular with foreigners' } },
  { id: 'makgeolli', category: 'drink', emoji: '🥛', name: { ko: '막걸리', zh: '米酒', en: 'Makgeolli' }, price: '5,000~8,000', desc: { ko: '전통 쌀 발효주, 파전과 찰떡궁합', zh: '传统米发酵酒，配煎饼绝配', en: 'Traditional rice wine, perfect with pajeon' }, area: { ko: '익선동·종로', zh: '益善洞·钟路', en: 'Ikseon-dong · Jongno' }, tip: { ko: '비 오는 날 파전+막걸리 = 한국의 정석', zh: '下雨天煎饼+米酒=韩国标配', en: 'Rainy day + pajeon + makgeolli = Korean tradition' } },
  { id: 'dalgona', category: 'drink', emoji: '☕', name: { ko: '달고나 라떼', zh: '达尔戈纳拿铁', en: 'Dalgona Latte' }, price: '5,500~7,000', desc: { ko: '인스타그램에서 시작된 한국 카페 시그니처', zh: 'Instagram爆红的韩国咖啡厅特调', en: 'Instagram-born Korean cafe signature' }, area: { ko: '성수·연남 카페', zh: '圣水·延南咖啡厅', en: 'Seongsu · Yeonnam cafes' }, tip: { ko: '사진 먼저, 맛은 그 다음!', zh: '先拍照，再喝！', en: 'Photo first, taste second!' } },
]

export function TasteOfSeoul({ lang }) {
  const [filter, setFilter] = useState('all')
  const [expanded, setExpanded] = useState(null)
  const filtered = filter === 'all' ? TASTE_ITEMS : TASTE_ITEMS.filter(i => i.category === filter)

  return (
    <div className="px-4 pt-4 pb-24">
      <p className="text-[20px] font-bold text-[#1A1A1A] mb-1">🍽️ {L(lang, { ko: 'Taste of Seoul', zh: '首尔之味', en: 'Taste of Seoul' })}</p>
      <p className="text-[11px] text-[#9CA3AF] mb-3">{L(lang, { ko: '서울에서 꼭 먹어야 할 음식 가이드', zh: '在首尔必吃的美食指南', en: 'Must-eat food guide in Seoul' })}</p>

      {/* 카테고리 필터 */}
      <div className="flex gap-1.5 overflow-x-auto pb-2 mb-4" style={{ scrollbarWidth: 'none' }}>
        {TASTE_CATEGORIES.map(c => (
          <button key={c.id} onClick={() => setFilter(c.id)}
            className="flex items-center gap-1 px-3 py-1.5 rounded-full text-[11px] font-medium shrink-0 transition-all"
            style={{ background: filter === c.id ? '#111827' : '#F3F4F6', color: filter === c.id ? '#FFF' : '#555' }}>
            {c.emoji} {L(lang, c.label)}
          </button>
        ))}
      </div>

      {/* 음식 카드 */}
      <div className="space-y-2.5">
        {filtered.map(item => {
          const isOpen = expanded === item.id
          return (
            <button key={item.id} onClick={() => setExpanded(isOpen ? null : item.id)}
              className="w-full text-left bg-white rounded-[14px] overflow-hidden transition-all"
              style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
              <div className="px-4 py-3 flex items-center gap-3">
                <span className="text-2xl">{item.emoji}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-[14px] font-bold text-[#111827]">{L(lang, item.name)}</p>
                  <p className="text-[11px] text-[#9CA3AF] mt-0.5">💰 ₩{item.price}</p>
                </div>
                <span className={`text-[#9CA3AF] transition-transform ${isOpen ? 'rotate-180' : ''}`}>▾</span>
              </div>

              {isOpen && (
                <div className="px-4 pb-4 pt-0">
                  <div className="bg-[#F9FAFB] rounded-[10px] p-3 space-y-2">
                    <p className="text-[12px] text-[#555]">{L(lang, item.desc)}</p>
                    <div className="flex items-center gap-1.5 text-[10px] text-[#6B7280]">
                      <span>📍 {L(lang, item.area)}</span>
                    </div>
                    {item.tip && (
                      <div className="bg-[#FFF5F2] rounded-lg px-2.5 py-1.5">
                        <p className="text-[10px] text-[#C4725A] font-medium">💡 {L(lang, item.tip)}</p>
                      </div>
                    )}
                    <a href={`https://map.kakao.com/link/search/${encodeURIComponent(L(lang, item.name))}`}
                      target="_blank" rel="noreferrer"
                      onClick={e => e.stopPropagation()}
                      className="inline-block text-[10px] bg-[#FEE500] text-[#111827] font-bold px-2.5 py-1 rounded-full mt-1">
                      🗺 {L(lang, { ko: '근처 맛집 찾기', zh: '搜索附近餐厅', en: 'Find nearby restaurants' })}
                    </a>
                  </div>
                </div>
              )}
            </button>
          )
        })}
      </div>

      {/* 하단 Visit Seoul 링크 */}
      <a href="https://www.visitseoul.net/food" target="_blank" rel="noreferrer"
        className="block w-full mt-4 py-3 rounded-[12px] bg-[#111827] text-white text-[13px] font-bold text-center active:scale-95 transition-transform">
        🍴 {L(lang, { ko: 'Visit Seoul 맛집 더보기', zh: '查看更多Visit Seoul美食', en: 'More on Visit Seoul Food' })}
      </a>
    </div>
  )
}

// ─── 오늘의 서울 이벤트 피드 ────────────────────────────────
export function TodayEvents({ lang }) {
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')

  useEffect(() => {
    import('../api/visitSeoulApi').then(mod => {
      mod.fetchTodayEvents(lang, 30).then(data => {
        if (data && data.length > 0) {
          setEvents(data.map((e, i) => ({
            id: e.id || `ev-${i}`,
            title: e.title || e.name || '',
            category: e.category || 'event',
            date: e.start_date || e.date || '',
            endDate: e.end_date || '',
            location: e.address || e.location || '',
            image: e.image || e.thumbnail || '',
            url: e.url || e.link || '',
            desc: e.description || e.summary || '',
          })))
        } else {
          setEvents(FALLBACK_EVENTS)
        }
        setLoading(false)
      }).catch(() => { setEvents(FALLBACK_EVENTS); setLoading(false) })
    }).catch(() => { setEvents(FALLBACK_EVENTS); setLoading(false) })
  }, [lang])

  const categories = [
    { id: 'all', label: { ko: '전체', zh: '全部', en: 'All' }, emoji: '📋' },
    { id: 'festival', label: { ko: '축제', zh: '节庆', en: 'Festival' }, emoji: '🎉' },
    { id: 'exhibition', label: { ko: '전시', zh: '展览', en: 'Exhibition' }, emoji: '🖼️' },
    { id: 'performance', label: { ko: '공연', zh: '演出', en: 'Performance' }, emoji: '🎭' },
    { id: 'market', label: { ko: '마켓', zh: '市集', en: 'Market' }, emoji: '🛍️' },
  ]
  const filtered = filter === 'all' ? events : events.filter(e => e.category === filter)

  return (
    <div className="px-4 pt-4 pb-24">
      <p className="text-[20px] font-bold text-[#1A1A1A] mb-1">📅 {L(lang, { ko: '오늘의 서울', zh: '今日首尔', en: "Today's Seoul" })}</p>
      <p className="text-[11px] text-[#9CA3AF] mb-3">{L(lang, { ko: '지금 진행 중인 축제·전시·공연·마켓', zh: '正在进行的节庆·展览·演出·市集', en: 'Ongoing festivals, exhibitions, shows & markets' })}</p>

      <div className="flex gap-1.5 overflow-x-auto pb-2 mb-3" style={{ scrollbarWidth: 'none' }}>
        {categories.map(c => (
          <button key={c.id} onClick={() => setFilter(c.id)}
            className="flex items-center gap-1 px-3 py-1.5 rounded-full text-[11px] font-medium shrink-0 transition-all"
            style={{ background: filter === c.id ? '#111827' : '#F3F4F6', color: filter === c.id ? '#FFF' : '#555' }}>
            {c.emoji} {L(lang, c.label)}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-8"><div className="animate-spin w-6 h-6 border-2 border-gray-300 border-t-[#C4725A] rounded-full" /></div>
      ) : filtered.length === 0 ? (
        <p className="text-center text-[13px] text-[#9CA3AF] py-8">{L(lang, { ko: '진행 중인 행사가 없습니다', zh: '暂无活动', en: 'No events found' })}</p>
      ) : (
        <div className="space-y-3">
          {filtered.map(ev => (
            <div key={ev.id} className="bg-white rounded-[14px] overflow-hidden" style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
              {ev.image && (
                <div className="w-full h-[140px] bg-[#F3F4F6]">
                  <img src={ev.image} alt="" className="w-full h-full object-cover"
                    onError={e => { e.target.style.display = 'none' }} />
                </div>
              )}
              <div className="p-4">
                <div className="flex items-start gap-2">
                  <span className="text-[10px] bg-[#F3F4F6] text-[#555] px-2 py-0.5 rounded-full shrink-0">{ev.category === 'festival' ? '🎉' : ev.category === 'exhibition' ? '🖼️' : ev.category === 'performance' ? '🎭' : ev.category === 'market' ? '🛍️' : '📅'}</span>
                  <p className="text-[14px] font-bold text-[#111827] flex-1">{ev.title}</p>
                </div>
                {ev.desc && <p className="text-[12px] text-[#555] mt-1.5 line-clamp-2">{ev.desc}</p>}
                <div className="flex items-center gap-3 mt-2 text-[10px] text-[#9CA3AF]">
                  {ev.date && <span>📅 {ev.date}{ev.endDate && ev.endDate !== ev.date ? ` ~ ${ev.endDate}` : ''}</span>}
                  {ev.location && <span className="truncate">📍 {ev.location}</span>}
                </div>
                {ev.url && (
                  <a href={ev.url} target="_blank" rel="noreferrer"
                    className="mt-2 inline-block text-[11px] text-[#C4725A] font-medium">
                    {L(lang, { ko: '자세히 보기 →', zh: '查看详情 →', en: 'View Details →' })}
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// 오늘의 서울 폴백 이벤트 데이터 (2026년 기준 주요 연중 행사)
const FALLBACK_EVENTS = [
  { id: 'ev-1', title: '서울빛초롱축제', category: 'festival', date: '2026-03-01', endDate: '2026-03-31', location: '청계천', desc: '청계천을 따라 아름다운 등불이 빛나는 빛축제', image: '', url: 'https://www.visitseoul.net' },
  { id: 'ev-2', title: '서울 벚꽃 축제', category: 'festival', date: '2026-04-01', endDate: '2026-04-15', location: '여의도 윤중로', desc: '여의도 한강공원 벚꽃길을 걸으며 봄을 만끽', image: '', url: 'https://www.visitseoul.net' },
  { id: 'ev-3', title: 'DDP 디자인 페어', category: 'exhibition', date: '2026-03-10', endDate: '2026-04-10', location: '동대문디자인플라자', desc: '한국 디자인 트렌드를 한눈에 볼 수 있는 전시', image: '', url: 'https://www.ddp.or.kr' },
  { id: 'ev-4', title: '한강 나이트마켓', category: 'market', date: '2026-03-15', endDate: '2026-10-31', location: '여의도 한강공원', desc: '금~토 18시~23시, 핸드메이드·푸드트럭·버스킹', image: '', url: 'https://www.visitseoul.net' },
  { id: 'ev-5', title: '국립중앙박물관 특별전', category: 'exhibition', date: '2026-02-01', endDate: '2026-05-31', location: '국립중앙박물관', desc: '한국 고대 유물 특별기획전', image: '', url: 'https://www.museum.go.kr' },
  { id: 'ev-6', title: 'K-POP 콘서트 위크', category: 'performance', date: '2026-03-14', endDate: '2026-03-21', location: 'KSPO DOME', desc: '주요 아이돌 그룹 릴레이 콘서트', image: '', url: 'https://www.visitseoul.net' },
  { id: 'ev-7', title: '성수 플리마켓', category: 'market', date: '2026-03-01', endDate: '2026-12-31', location: '성수동 서울숲', desc: '매주 토~일, 빈티지·핸드메이드·로컬 브랜드', image: '', url: '' },
  { id: 'ev-8', title: '남산골 한옥마을 전통 공연', category: 'performance', date: '2026-03-01', endDate: '2026-11-30', location: '남산골한옥마을', desc: '전통 국악, 판소리, 사물놀이 무료 공연', image: '', url: 'https://www.hanokmaeul.or.kr' },
  { id: 'ev-9', title: '코엑스 봄 아트페어', category: 'exhibition', date: '2026-03-20', endDate: '2026-03-24', location: 'COEX Hall A', desc: '국내외 갤러리 150곳이 참여하는 미술장터', image: '', url: '' },
  { id: 'ev-10', title: '경복궁 야간 특별관람', category: 'festival', date: '2026-03-01', endDate: '2026-06-30', location: '경복궁', desc: '한복 입고 야간 궁궐 산책! 인스타 핫스팟', image: '', url: 'https://www.royalpalace.go.kr' },
]

// ─── 한류 테마 코스 지도 ────────────────────────────────
export function HallyuCourseMap({ lang }) {
  const [courses, setCourses] = useState([])
  const [selected, setSelected] = useState(null)

  useEffect(() => {
    import('../api/visitSeoulApi').then(mod => setCourses(mod.HALLYU_COURSES))
  }, [])

  const current = selected !== null ? courses[selected] : null

  return (
    <div className="px-4 pt-4 pb-24">
      <p className="text-[20px] font-bold text-[#1A1A1A] mb-1">💜 {L(lang, { ko: '한류 테마 코스', zh: '韩流主题路线', en: 'Hallyu Themed Courses' })}</p>
      <p className="text-[11px] text-[#9CA3AF] mb-4">{L(lang, { ko: 'K-POP, K-Drama, K-Beauty 성지 순례 코스', zh: 'K-POP、K-Drama、K-Beauty圣地巡礼路线', en: 'K-POP, K-Drama, K-Beauty pilgrimage courses' })}</p>

      {/* 코스 선택 카드 */}
      <div className="grid grid-cols-2 gap-2 mb-4">
        {courses.map((c, i) => (
          <button key={c.id} onClick={() => setSelected(selected === i ? null : i)}
            className="rounded-[12px] p-3 text-left transition-all"
            style={{ background: selected === i ? '#111827' : '#FFF', color: selected === i ? '#FFF' : '#1A1A1A', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
            <span className="text-xl">{c.emoji}</span>
            <p className="text-[13px] font-bold mt-1">{L(lang, c.title)}</p>
            <p className="text-[10px] mt-0.5" style={{ opacity: 0.7 }}>{c.spots.length} {L(lang, { ko: '장소', zh: '个地点', en: 'spots' })}</p>
          </button>
        ))}
      </div>

      {/* 선택한 코스 상세 */}
      {current && (
        <div className="bg-white rounded-[14px] p-4 mb-4" style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
          <p className="text-[15px] font-bold text-[#111827] mb-3">{current.emoji} {L(lang, current.title)}</p>

          {/* 코스 타임라인 */}
          <div className="relative pl-6">
            {current.spots.map((spot, i) => (
              <div key={i} className="relative pb-4">
                {/* 세로선 */}
                {i < current.spots.length - 1 && (
                  <div className="absolute left-[-16px] top-[20px] w-[2px] h-full bg-[#E5E7EB]" />
                )}
                {/* 번호 원 */}
                <div className="absolute left-[-22px] top-[2px] w-[14px] h-[14px] rounded-full bg-[#111827] text-white text-[8px] font-bold flex items-center justify-center">
                  {i + 1}
                </div>
                {/* 장소 카드 */}
                <div className="bg-[#F9FAFB] rounded-[10px] px-3 py-2.5">
                  <p className="text-[13px] font-medium text-[#111827]">{L(lang, spot.name)}</p>
                  <div className="flex gap-2 mt-1.5">
                    <a href={`https://map.kakao.com/link/to/${encodeURIComponent(L(lang, spot.name))},${spot.lat},${spot.lng}`}
                      target="_blank" rel="noreferrer"
                      className="text-[10px] bg-[#FEE500] text-[#111827] font-bold px-2 py-1 rounded-full active:scale-95 transition-transform">
                      🗺 {L(lang, { ko: '길찾기', zh: '导航', en: 'Navigate' })}
                    </a>
                    <a href={`https://map.kakao.com/link/map/${encodeURIComponent(L(lang, spot.name))},${spot.lat},${spot.lng}`}
                      target="_blank" rel="noreferrer"
                      className="text-[10px] bg-[#EEF2FF] text-[#4F46E5] font-medium px-2 py-1 rounded-full active:scale-95 transition-transform">
                      📍 {L(lang, { ko: '지도', zh: '地图', en: 'Map' })}
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* 전체 코스 카카오맵 길찾기 */}
          <a href={`https://map.kakao.com/link/to/${encodeURIComponent(L(lang, current.spots[current.spots.length - 1].name))},${current.spots[current.spots.length - 1].lat},${current.spots[current.spots.length - 1].lng}`}
            target="_blank" rel="noreferrer"
            className="block w-full mt-2 py-2.5 rounded-[10px] bg-[#111827] text-white text-[12px] font-bold text-center active:scale-95 transition-transform">
            🚶 {L(lang, { ko: '전체 코스 출발하기', zh: '开始全程路线', en: 'Start Full Course' })}
          </a>
        </div>
      )}

      {/* 근처 맛집/카페 바로가기 */}
      {current && (
        <div className="flex gap-2">
          <a href={`https://map.kakao.com/link/search/${encodeURIComponent(L(lang, current.spots[0].name) + ' 맛집')}`}
            target="_blank" rel="noreferrer"
            className="flex-1 py-2.5 rounded-[10px] bg-[#FFF5F2] text-[#C4725A] text-[12px] font-bold text-center active:scale-95 transition-transform">
            🍽️ {L(lang, { ko: '근처 맛집', zh: '附近美食', en: 'Nearby Food' })}
          </a>
          <a href={`https://map.kakao.com/link/search/${encodeURIComponent(L(lang, current.spots[0].name) + ' 카페')}`}
            target="_blank" rel="noreferrer"
            className="flex-1 py-2.5 rounded-[10px] bg-[#F0FDF4] text-[#16A34A] text-[12px] font-bold text-center active:scale-95 transition-transform">
            ☕ {L(lang, { ko: '근처 카페', zh: '附近咖啡', en: 'Nearby Cafe' })}
          </a>
        </div>
      )}
    </div>
  )
}

// ─── #56 공공 와이파이 핫스팟 ────────────────────────────────
export function WifiHotspot({ lang }) {
  const [spots, setSpots] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    import('../api/wifiApi').then(mod => {
      mod.fetchPublicWifi().then(data => { setSpots(data); setLoading(false) })
    }).catch(() => {
      import('../api/wifiApi').then(mod => { setSpots(mod.FALLBACK_WIFI); setLoading(false) })
    })
  }, [])

  return (
    <div className="px-4 pt-4 pb-24">
      <p className="text-[20px] font-bold text-[#1A1A1A] mb-1">📶 {L(lang, { ko: '공공 와이파이', zh: '公共WiFi热点', en: 'Public WiFi Hotspots' })}</p>
      <p className="text-[11px] text-[#9CA3AF] mb-4">{L(lang, { ko: '서울시 무료 와이파이 위치', zh: '首尔市免费WiFi位置', en: 'Free WiFi locations in Seoul' })}</p>

      {loading ? (
        <div className="flex justify-center py-8"><div className="animate-spin w-6 h-6 border-2 border-gray-300 border-t-[#C4725A] rounded-full" /></div>
      ) : (
        <div className="space-y-2">
          {spots.map(s => (
            <div key={s.id} className="bg-white rounded-[12px] px-4 py-3 flex items-center gap-3" style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
              <span className="text-lg">{s.indoor ? '🏢' : '🌳'}</span>
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-medium text-[#111827] truncate">{s.name}</p>
                <p className="text-[10px] text-[#9CA3AF] truncate">{s.address}</p>
              </div>
              <a href={`https://map.kakao.com/link/map/${encodeURIComponent(s.name)},${s.lat},${s.lng}`}
                target="_blank" rel="noreferrer"
                className="text-[10px] text-[#4F46E5] font-medium px-2 py-1 bg-[#EEF2FF] rounded-full shrink-0">
                🗺 {L(lang, { ko: '지도', zh: '地图', en: 'Map' })}
              </a>
            </div>
          ))}
        </div>
      )}

      <div className="mt-4 bg-[#FFFBEB] rounded-[14px] p-4">
        <p className="text-[13px] font-bold text-[#92400E] mb-2">💡 {L(lang, { ko: '팁', zh: '提示', en: 'Tips' })}</p>
        <div className="space-y-1 text-[12px] text-[#B45309]">
          <p>• {L(lang, { ko: '서울 지하철 전역에 무료 와이파이 (Seoul Free WiFi)', zh: '首尔地铁全线免费WiFi (Seoul Free WiFi)', en: 'Free WiFi on all Seoul subway lines' })}</p>
          <p>• {L(lang, { ko: '스타벅스, 이디야 등 카페에서 무료 이용 가능', zh: '星巴克、EDIYA等咖啡厅可免费使用', en: 'Free at Starbucks, EDIYA cafes' })}</p>
          <p>• {L(lang, { ko: 'SSID: "Seoul_Free_WiFi" 또는 "Public_WiFi_Free"', zh: 'SSID: "Seoul_Free_WiFi" 或 "Public_WiFi_Free"', en: 'SSID: "Seoul_Free_WiFi" or "Public_WiFi_Free"' })}</p>
        </div>
      </div>
    </div>
  )
}

// ─── #69 날씨별 관광지 추천 DB ────────────────────────────────
const WEATHER_RECS = {
  // 온도별 (5도 구간) × 날씨 조건
  'cold-clear':   { emoji: '🏔️', places: [
    { ko: '인왕산 성곽길', zh: '仁王山城墙路', en: 'Inwangsan Fortress Trail', why: { ko: '맑은 겨울 하늘 + 서울 전경', zh: '冬日晴空+首尔全景', en: 'Clear winter sky + Seoul panorama' } },
    { ko: '경복궁', zh: '景福宫', en: 'Gyeongbokgung', why: { ko: '겨울 궁궐의 고즈넉함', zh: '冬日宫殿的静谧', en: 'Serene winter palace' } },
    { ko: 'N서울타워', zh: 'N首尔塔', en: 'N Seoul Tower', why: { ko: '맑은 날 최고의 전망', zh: '晴天最佳观景', en: 'Best view on clear days' } },
  ]},
  'cold-cloudy':  { emoji: '☁️', places: [
    { ko: '찜질방 (드래곤힐스파)', zh: '汗蒸房 (Dragon Hill)', en: 'Jjimjilbang', why: { ko: '추운 날 몸 녹이기 최고', zh: '寒天暖身最佳', en: 'Best for warming up' } },
    { ko: '코엑스 스타필드', zh: 'COEX Starfield', en: 'COEX Starfield', why: { ko: '실내에서 하루 종일 놀기', zh: '室内一整天', en: 'Indoor all-day fun' } },
    { ko: '동대문 지하상가', zh: '东大门地下商场', en: 'Dongdaemun Underground', why: { ko: '따뜻한 쇼핑', zh: '温暖购物', en: 'Warm shopping' } },
  ]},
  'cold-rain':    { emoji: '🌧️', places: [
    { ko: '국립중앙박물관', zh: '国立中央博物馆', en: 'National Museum', why: { ko: '무료 입장 + 거대한 실내', zh: '免费+巨大室内', en: 'Free + huge indoor space' } },
    { ko: 'GOTO몰 (고투몰)', zh: 'GOTO Mall', en: 'GOTO Mall', why: { ko: '7km 지하 쇼핑가', zh: '7公里地下商场', en: '7km underground mall' } },
    { ko: '롯데월드', zh: '乐天世界', en: 'Lotte World', why: { ko: '실내 테마파크', zh: '室内主题乐园', en: 'Indoor theme park' } },
  ]},
  'cold-snow':    { emoji: '❄️', places: [
    { ko: '덕수궁 돌담길', zh: '德寿宫石墙路', en: 'Deoksugung Stonewall', why: { ko: '눈 오는 궁궐길 = 인생샷', zh: '雪中宫殿路=人生照', en: 'Snowy palace = best photos' } },
    { ko: '남산 케이블카', zh: '南山缆车', en: 'Namsan Cable Car', why: { ko: '설경 + 서울 야경', zh: '雪景+首尔夜景', en: 'Snow view + night view' } },
    { ko: '북촌한옥마을', zh: '北村韩屋村', en: 'Bukchon Hanok', why: { ko: '한옥 + 눈 = 최고 조합', zh: '韩屋+雪=最佳组合', en: 'Hanok + snow = perfect combo' } },
  ]},
  'mild-clear':   { emoji: '🌸', places: [
    { ko: '여의도 한강공원', zh: '汝矣岛汉江公园', en: 'Yeouido Hangang Park', why: { ko: '피크닉 + 치맥', zh: '野餐+炸鸡啤酒', en: 'Picnic + chicken & beer' } },
    { ko: '성수동 카페거리', zh: '圣水洞咖啡街', en: 'Seongsu Cafe Street', why: { ko: '산책하기 딱 좋은 날씨', zh: '散步的好天气', en: 'Perfect weather for walking' } },
    { ko: '홍대 걷고싶은거리', zh: '弘大步行街', en: 'Hongdae Walking Street', why: { ko: '버스킹 + 쇼핑', zh: '街头表演+购物', en: 'Busking + shopping' } },
  ]},
  'mild-cloudy':  { emoji: '⛅', places: [
    { ko: '이태원 경리단길', zh: '梨泰院经理团路', en: 'Itaewon Gyeongridan', why: { ko: '카페 호핑 + 다국적 맛집', zh: '咖啡厅+异国美食', en: 'Cafe hopping + global food' } },
    { ko: '익선동 한옥거리', zh: '益善洞韩屋街', en: 'Ikseon-dong', why: { ko: '레트로 감성 카페 투어', zh: '复古风咖啡之旅', en: 'Retro cafe tour' } },
    { ko: '망리단길', zh: '望理团路', en: 'Mangridangil', why: { ko: '로컬 핫플', zh: '本地热门', en: 'Local hotspot' } },
  ]},
  'mild-rain':    { emoji: '☔', places: [
    { ko: '삼청동 갤러리 투어', zh: '三清洞画廊之旅', en: 'Samcheong Gallery Tour', why: { ko: '비 오는 날 갤러리 감상', zh: '雨天看画廊', en: 'Rainy day gallery tour' } },
    { ko: '더현대 서울', zh: 'The Hyundai Seoul', en: 'The Hyundai Seoul', why: { ko: '쇼핑 + 인스타 포토존', zh: '购物+拍照', en: 'Shopping + photo spots' } },
    { ko: '을지로 노포 투어', zh: '乙支路老店之旅', en: 'Euljiro Old Shop Tour', why: { ko: '비 + 을지로 골목 감성', zh: '雨+乙支路胡同感', en: 'Rain + retro alley vibes' } },
  ]},
  'hot-clear':    { emoji: '☀️', places: [
    { ko: '뚝섬 한강수영장', zh: '纛岛汉江游泳池', en: 'Ttukseom Pool', why: { ko: '여름 한강 물놀이', zh: '夏天汉江玩水', en: 'Summer Han River pool' } },
    { ko: '반포 달빛무지개분수', zh: '盘浦月光彩虹喷泉', en: 'Banpo Bridge Fountain', why: { ko: '저녁에 시원한 분수 쇼', zh: '傍晚清凉喷泉秀', en: 'Cool fountain show at night' } },
    { ko: '북한산 백운대', zh: '北汉山白云台', en: 'Bukhansan Peak', why: { ko: '새벽 등산 → 더위 피하기', zh: '凌晨登山→避暑', en: 'Early hike to beat heat' } },
  ]},
  'hot-cloudy':   { emoji: '🌤️', places: [
    { ko: '올림픽공원', zh: '奥林匹克公园', en: 'Olympic Park', why: { ko: '넓은 공원 산책', zh: '宽阔公园散步', en: 'Wide park walk' } },
    { ko: '서울숲', zh: '首尔林', en: 'Seoul Forest', why: { ko: '그늘 + 사슴 + 피크닉', zh: '树荫+小鹿+野餐', en: 'Shade + deer + picnic' } },
    { ko: '선유도공원', zh: '仙游岛公园', en: 'Seonyudo Park', why: { ko: '한강 위 섬 공원', zh: '汉江上的岛屿公园', en: 'Island park on Han River' } },
  ]},
  'hot-rain':     { emoji: '⛈️', places: [
    { ko: '아쿠아플라넷 63', zh: 'Aqua Planet 63', en: 'Aqua Planet 63', why: { ko: '아쿠아리움 + 에어컨', zh: '水族馆+空调', en: 'Aquarium + AC' } },
    { ko: '타임스퀘어', zh: 'Times Square', en: 'Times Square', why: { ko: '쇼핑 + 영화관 + 맛집', zh: '购物+电影+美食', en: 'Shopping + movies + food' } },
    { ko: '그라운드시소 성수', zh: 'Ground Seesaw 圣水', en: 'Ground Seesaw', why: { ko: '전시 + 카페 복합공간', zh: '展览+咖啡复合空间', en: 'Exhibition + cafe complex' } },
  ]},
}

// 온도 → 구간 매핑
function getTempZone(temp) {
  if (temp <= 10) return 'cold'
  if (temp <= 25) return 'mild'
  return 'hot'
}

// 날씨 조건 매핑
function getWeatherCond(code) {
  // WMO weather codes
  if (code >= 71) return 'snow'
  if (code >= 51 || (code >= 80 && code <= 82)) return 'rain'
  if (code >= 1 && code <= 3) return 'cloudy'
  return 'clear'
}

export function WeatherRecommend({ lang }) {
  const [weather, setWeather] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Open-Meteo API (무료, 키 불필요)
    fetch('https://api.open-meteo.com/v1/forecast?latitude=37.5665&longitude=126.9780&current=temperature_2m,weather_code&timezone=Asia/Seoul')
      .then(r => r.json())
      .then(data => {
        setWeather({
          temp: Math.round(data.current.temperature_2m),
          code: data.current.weather_code,
        })
        setLoading(false)
      })
      .catch(() => {
        // 폴백: 현재 월 기준 대략적 온도
        const month = new Date().getMonth()
        const fallbackTemp = [0, 2, 7, 13, 18, 23, 27, 28, 24, 17, 10, 3][month]
        setWeather({ temp: fallbackTemp, code: 0 })
        setLoading(false)
      })
  }, [])

  if (loading) return <div className="flex justify-center py-8"><div className="animate-spin w-6 h-6 border-2 border-gray-300 border-t-[#C4725A] rounded-full" /></div>

  const zone = getTempZone(weather.temp)
  const cond = getWeatherCond(weather.code)
  const key = `${zone}-${cond}`
  const rec = WEATHER_RECS[key] || WEATHER_RECS['mild-clear']

  return (
    <div className="px-4 pt-4 pb-24">
      <p className="text-[20px] font-bold text-[#1A1A1A] mb-1">🌤️ {L(lang, { ko: '날씨별 추천 관광지', zh: '天气推荐景点', en: 'Weather-Based Recommendations' })}</p>
      <p className="text-[11px] text-[#9CA3AF] mb-4">{L(lang, { ko: '지금 서울 날씨에 딱 맞는 장소', zh: '最适合当前首尔天气的地方', en: 'Perfect spots for current Seoul weather' })}</p>

      {/* 현재 날씨 카드 */}
      <div className="bg-gradient-to-r from-[#111827] to-[#374151] rounded-[14px] p-4 mb-4 text-white">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[11px] opacity-70">{L(lang, { ko: '지금 서울', zh: '首尔现在', en: 'Seoul Now' })}</p>
            <p className="text-[32px] font-bold">{weather.temp}°C</p>
          </div>
          <span className="text-[48px]">{rec.emoji}</span>
        </div>
      </div>

      {/* 추천 장소 */}
      <p className="text-[13px] font-bold text-[#374151] mb-2">📍 {L(lang, { ko: '오늘 추천 장소', zh: '今天推荐地点', en: "Today's Recommended" })}</p>
      <div className="space-y-2 mb-4">
        {rec.places.map((p, i) => (
          <div key={i} className="bg-white rounded-[12px] p-4" style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[14px] font-bold text-[#111827]">{L(lang, p)}</p>
                <p className="text-[11px] text-[#C4725A] mt-1">{L(lang, p.why)}</p>
              </div>
              <a href={`https://map.kakao.com/link/search/${encodeURIComponent(p.ko)}`}
                target="_blank" rel="noreferrer"
                className="text-[10px] bg-[#FEE500] text-[#111827] font-bold px-2.5 py-1 rounded-full shrink-0 ml-2">
                🗺
              </a>
            </div>
          </div>
        ))}
      </div>

      {/* 다른 날씨 조합 미리보기 */}
      <p className="text-[13px] font-bold text-[#374151] mb-2">📋 {L(lang, { ko: '날씨별 추천 모아보기', zh: '各天气推荐汇总', en: 'All Weather Recommendations' })}</p>
      <div className="grid grid-cols-2 gap-2">
        {Object.entries(WEATHER_RECS).map(([k, v]) => {
          const [z, c] = k.split('-')
          const zLabel = { cold: { ko: '추울 때', zh: '冷天', en: 'Cold' }, mild: { ko: '선선할 때', zh: '凉爽天', en: 'Mild' }, hot: { ko: '더울 때', zh: '热天', en: 'Hot' } }
          const cLabel = { clear: '☀️', cloudy: '☁️', rain: '🌧️', snow: '❄️' }
          const isActive = k === key
          return (
            <div key={k} className={`rounded-[10px] p-2.5 text-center ${isActive ? 'bg-[#111827] text-white' : 'bg-[#F3F4F6] text-[#555]'}`}>
              <span className="text-lg">{cLabel[c]} {v.emoji}</span>
              <p className="text-[10px] font-medium mt-0.5">{L(lang, zLabel[z])} {cLabel[c]}</p>
              <p className="text-[9px] opacity-70 mt-0.5">{v.places[0] && L(lang, v.places[0])}</p>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ─── Visit Seoul B등급: 의료관광 ────────────────────────────────
const MEDICAL_ITEMS = [
  { id: 'mt-1', emoji: '💉', name: { ko: '피부과/미용', zh: '皮肤科/美容', en: 'Dermatology/Beauty' },
    area: { ko: '강남 압구정', zh: '江南狎鸥亭', en: 'Gangnam Apgujeong' },
    desc: { ko: '보톡스, 필러, 레이저 시술. 중국어 상담 가능 병원 다수', zh: '肉毒素、玻尿酸、激光治疗。多家医院提供中文咨询', en: 'Botox, filler, laser treatments. Many clinics offer Chinese consultation' },
    price: '₩100,000~', hospitals: [
      { name: { ko: '아이디병원', zh: 'ID医院', en: 'ID Hospital' }, tel: '02-3496-9500', chinese: true, lat: 37.5249, lng: 127.0390 },
      { name: { ko: '바노바기성형외과', zh: 'Banobagi整形外科', en: 'Banobagi' }, tel: '02-522-6636', chinese: true, lat: 37.5040, lng: 127.0395 },
    ]},
  { id: 'mt-2', emoji: '🦷', name: { ko: '치과', zh: '牙科', en: 'Dentistry' },
    area: { ko: '강남 신사동', zh: '江南新沙洞', en: 'Gangnam Sinsa' },
    desc: { ko: '임플란트, 라미네이트, 치아교정. 한국 치과 가성비 최고', zh: '种植牙、贴面、牙齿矫正。韩国牙科性价比极高', en: 'Implants, veneers, orthodontics. Best value in Korea' },
    price: '₩500,000~', hospitals: [
      { name: { ko: '연세세브란스치과', zh: '延世Severance牙科', en: 'Yonsei Severance Dental' }, tel: '02-2228-3200', chinese: true, lat: 37.5622, lng: 126.9410 },
    ]},
  { id: 'mt-3', emoji: '👁️', name: { ko: '안과 (라식/라섹)', zh: '眼科(LASIK/LASEK)', en: 'Ophthalmology (LASIK)' },
    area: { ko: '강남역', zh: '江南站', en: 'Gangnam Station' },
    desc: { ko: '라식/라섹/렌즈삽입. 한국이 세계 최저 가격대', zh: 'LASIK/LASEK/ICL。韩国价格全球最低', en: 'LASIK/LASEK/ICL. Lowest prices worldwide' },
    price: '₩800,000~', hospitals: [
      { name: { ko: '비앤빛강남밝은세상안과', zh: 'B&VIIT江南明亮眼科', en: 'B&VIIT Gangnam' }, tel: '02-533-5501', chinese: true, lat: 37.4970, lng: 127.0285 },
    ]},
  { id: 'mt-4', emoji: '🏥', name: { ko: '종합검진', zh: '综合体检', en: 'Health Checkup' },
    area: { ko: '서울 전역', zh: '首尔全域', en: 'All Seoul' },
    desc: { ko: '1~2일 종합건강검진. 중국 대비 50% 이상 저렴', zh: '1~2天综合健康体检。比中国便宜50%以上', en: '1-2 day comprehensive checkup. 50%+ cheaper than China' },
    price: '₩300,000~', hospitals: [
      { name: { ko: '삼성서울병원', zh: '三星首尔医院', en: 'Samsung Medical Center' }, tel: '02-3410-2000', chinese: true, lat: 37.4881, lng: 127.0857 },
      { name: { ko: '서울아산병원', zh: '首尔峨山医院', en: 'Asan Medical Center' }, tel: '02-3010-5001', chinese: true, lat: 37.5262, lng: 127.1076 },
    ]},
]

export function MedicalTourism({ lang }) {
  const [expanded, setExpanded] = useState(null)

  return (
    <div className="px-4 pt-4 pb-24">
      <p className="text-[20px] font-bold text-[#1A1A1A] mb-1">🏥 {L(lang, { ko: '의료관광', zh: '医疗旅游', en: 'Medical Tourism' })}</p>
      <p className="text-[11px] text-[#9CA3AF] mb-1">{L(lang, { ko: '한국 의료 서비스를 합리적 가격에', zh: '以合理的价格享受韩国医疗服务', en: 'Korean medical services at reasonable prices' })}</p>
      <div className="bg-[#FFF5F2] rounded-[10px] px-3 py-2 mb-4">
        <p className="text-[10px] text-[#C4725A] font-medium">💡 {L(lang, { ko: '한국은 성형, 피부, 치과, 안과, 종합검진 분야에서 세계적 수준이며 가격은 미국·중국 대비 30~70% 저렴합니다', zh: '韩国在整形、皮肤、牙科、眼科、综合体检领域世界领先，价格比美国·中国低30~70%', en: 'Korea is world-class in cosmetic, dental, ophthalmology, and health checkups at 30-70% lower prices' })}</p>
      </div>

      <div className="space-y-3">
        {MEDICAL_ITEMS.map(item => {
          const isOpen = expanded === item.id
          return (
            <div key={item.id} className="bg-white rounded-[14px] overflow-hidden" style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
              <button onClick={() => setExpanded(isOpen ? null : item.id)} className="w-full text-left px-4 py-3 flex items-center gap-3">
                <span className="text-2xl">{item.emoji}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-[14px] font-bold text-[#111827]">{L(lang, item.name)}</p>
                  <p className="text-[10px] text-[#9CA3AF] mt-0.5">📍 {L(lang, item.area)} · {item.price}</p>
                </div>
                <span className={`text-[#9CA3AF] transition-transform ${isOpen ? 'rotate-180' : ''}`}>▾</span>
              </button>
              {isOpen && (
                <div className="px-4 pb-4">
                  <p className="text-[12px] text-[#555] mb-3">{L(lang, item.desc)}</p>
                  <p className="text-[11px] font-bold text-[#374151] mb-2">{L(lang, { ko: '추천 병원', zh: '推荐医院', en: 'Recommended Hospitals' })}</p>
                  <div className="space-y-2">
                    {item.hospitals.map(h => (
                      <div key={L(lang, h.name)} className="bg-[#F9FAFB] rounded-[10px] px-3 py-2.5 flex items-center gap-2">
                        <div className="flex-1 min-w-0">
                          <p className="text-[12px] font-medium text-[#111827]">{L(lang, h.name)}</p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <a href={`tel:${h.tel}`} className="text-[10px] text-[#4F46E5]">📞 {h.tel}</a>
                            {h.chinese && <span className="text-[9px] bg-[#DCFCE7] text-[#16A34A] px-1.5 py-0.5 rounded-full">🇨🇳 {L(lang, { ko: '중국어 OK', zh: '中文OK', en: 'Chinese OK' })}</span>}
                          </div>
                        </div>
                        <a href={`https://map.kakao.com/link/map/${encodeURIComponent(L(lang, h.name))},${h.lat},${h.lng}`}
                          target="_blank" rel="noreferrer"
                          className="text-[10px] bg-[#FEE500] text-[#111827] font-bold px-2 py-1 rounded-full shrink-0">🗺</a>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>

      <a href="https://www.visitseoul.net/medical" target="_blank" rel="noreferrer"
        className="block w-full mt-4 py-3 rounded-[12px] bg-[#111827] text-white text-[13px] font-bold text-center">
        🏥 {L(lang, { ko: 'Visit Seoul 의료관광 더보기', zh: '查看更多Visit Seoul医疗旅游', en: 'More Medical Tourism on Visit Seoul' })}
      </a>
    </div>
  )
}

// ─── Visit Seoul B등급: 서울스테이 ────────────────────────────────
const SEOUL_STAY_DATA = [
  { id: 'ss-1', emoji: '🏛', type: { ko: '한옥스테이', zh: '韩屋民宿', en: 'Hanok Stay' },
    desc: { ko: '전통 한옥에서 하룻밤. 북촌, 서촌, 은평 한옥마을', zh: '在传统韩屋住一晚。北村、西村、恩平韩屋村', en: 'One night in traditional hanok. Bukchon, Seochon, Eunpyeong' },
    areas: [
      { name: { ko: '북촌한옥마을', zh: '北村韩屋村', en: 'Bukchon Hanok Village' }, lat: 37.5826, lng: 126.9849, price: '₩80,000~' },
      { name: { ko: '서촌 (경복궁 서쪽)', zh: '西村(景福宫西)', en: 'Seochon' }, lat: 37.5768, lng: 126.9706, price: '₩70,000~' },
    ]},
  { id: 'ss-2', emoji: '🏢', type: { ko: '게스트하우스', zh: '旅馆', en: 'Guesthouse' },
    desc: { ko: '합리적 가격 + 여행자 교류. 홍대, 이태원, 명동 밀집', zh: '合理价格+旅行者交流。弘大、梨泰院、明洞集中', en: 'Affordable + traveler exchange. Concentrated in Hongdae, Itaewon, Myeongdong' },
    areas: [
      { name: { ko: '홍대입구역', zh: '弘大入口站', en: 'Hongdae Station' }, lat: 37.5571, lng: 126.9254, price: '₩25,000~' },
      { name: { ko: '명동', zh: '明洞', en: 'Myeongdong' }, lat: 37.5636, lng: 126.9869, price: '₩30,000~' },
    ]},
  { id: 'ss-3', emoji: '🌿', type: { ko: '템플스테이', zh: '寺庙住宿', en: 'Temple Stay' },
    desc: { ko: '사찰에서 명상과 전통 체험. 서울 도심 속 사찰', zh: '在寺庙冥想和体验传统文化。首尔市中心的寺庙', en: 'Meditation and traditional experience at temples in Seoul' },
    areas: [
      { name: { ko: '조계사', zh: '曹溪寺', en: 'Jogyesa Temple' }, lat: 37.5733, lng: 126.9835, price: '₩50,000~' },
      { name: { ko: '봉은사', zh: '奉恩寺', en: 'Bongeunsa Temple' }, lat: 37.5154, lng: 127.0582, price: '₩50,000~' },
    ]},
  { id: 'ss-4', emoji: '🏨', type: { ko: '한강뷰 호텔', zh: '汉江景酒店', en: 'Han River View Hotel' },
    desc: { ko: '한강이 보이는 호텔에서 서울 야경 감상', zh: '在可以看到汉江的酒店欣赏首尔夜景', en: 'Enjoy Seoul night view from hotels overlooking Han River' },
    areas: [
      { name: { ko: '여의도 콘래드', zh: '汝矣岛康莱德', en: 'Conrad Seoul Yeouido' }, lat: 37.5253, lng: 126.9270, price: '₩250,000~' },
      { name: { ko: '반포 JW메리어트', zh: '盘浦JW万豪', en: 'JW Marriott Banpo' }, lat: 37.5084, lng: 127.0001, price: '₩300,000~' },
    ]},
]

export function SeoulStay({ lang }) {
  const [selected, setSelected] = useState(null)

  return (
    <div className="px-4 pt-4 pb-24">
      <p className="text-[20px] font-bold text-[#1A1A1A] mb-1">🏠 {L(lang, { ko: '서울 스테이', zh: '首尔住宿', en: 'Seoul Stay' })}</p>
      <p className="text-[11px] text-[#9CA3AF] mb-4">{L(lang, { ko: '한옥부터 한강뷰 호텔까지, 서울에서 어디서 잘까?', zh: '从韩屋到汉江景酒店，在首尔住哪里？', en: 'From hanok to Han River view hotels, where to stay in Seoul?' })}</p>

      <div className="space-y-3">
        {SEOUL_STAY_DATA.map(item => {
          const isOpen = selected === item.id
          return (
            <div key={item.id} className="bg-white rounded-[14px] overflow-hidden" style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
              <button onClick={() => setSelected(isOpen ? null : item.id)} className="w-full text-left px-4 py-3.5 flex items-center gap-3">
                <span className="text-2xl">{item.emoji}</span>
                <div className="flex-1">
                  <p className="text-[14px] font-bold text-[#111827]">{L(lang, item.type)}</p>
                  <p className="text-[11px] text-[#9CA3AF] mt-0.5">{L(lang, item.desc)}</p>
                </div>
                <span className={`text-[#9CA3AF] transition-transform ${isOpen ? 'rotate-180' : ''}`}>▾</span>
              </button>
              {isOpen && (
                <div className="px-4 pb-4 space-y-2">
                  {item.areas.map(a => (
                    <div key={L(lang, a.name)} className="bg-[#F9FAFB] rounded-[10px] px-3 py-2.5 flex items-center gap-3">
                      <div className="flex-1 min-w-0">
                        <p className="text-[12px] font-medium text-[#111827]">{L(lang, a.name)}</p>
                        <p className="text-[10px] text-[#9CA3AF] mt-0.5">💰 {a.price}</p>
                      </div>
                      <a href={`https://map.kakao.com/link/search/${encodeURIComponent(L(lang, a.name) + ' 숙소')}`}
                        target="_blank" rel="noreferrer"
                        className="text-[10px] bg-[#FEE500] text-[#111827] font-bold px-2 py-1 rounded-full shrink-0">🗺 {L(lang, { ko: '검색', zh: '搜索', en: 'Search' })}</a>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )
        })}
      </div>

      <a href="https://www.visitseoul.net/accommodation" target="_blank" rel="noreferrer"
        className="block w-full mt-4 py-3 rounded-[12px] bg-[#111827] text-white text-[13px] font-bold text-center">
        🏠 {L(lang, { ko: 'Visit Seoul 숙소 더보기', zh: '查看更多Visit Seoul住宿', en: 'More on Visit Seoul Accommodation' })}
      </a>
    </div>
  )
}

// ─── Visit Seoul B등급: 문화 라운지 ────────────────────────────────
const CULTURE_LOUNGE_DATA = [
  { id: 'cl-1', emoji: '🎨', name: { ko: '서울문화재단 문화비축기지', zh: '首尔文化储备基地', en: 'Culture Tank' },
    desc: { ko: '옛 석유비축기지를 문화공간으로 재탄생. 전시·공연·마켓', zh: '旧石油储备基地变身文化空间。展览·演出·市集', en: 'Former oil reserve converted to cultural space. Exhibitions, shows, markets' },
    address: { ko: '마포구 증산로 87', zh: '麻浦区增山路87号', en: '87 Jeungsan-ro, Mapo-gu' },
    lat: 37.5679, lng: 126.9137, free: true },
  { id: 'cl-2', emoji: '📚', name: { ko: '서울책보고', zh: '首尔书宝库', en: 'Seoul Book Repository' },
    desc: { ko: '고가 하부 공간을 활용한 세계 최대 중고서점. 무료', zh: '利用高架桥下空间打造的世界最大二手书店。免费', en: "World's largest secondhand bookstore under an overpass. Free" },
    address: { ko: '송파구 잠실로 32', zh: '松坡区蚕室路32号', en: '32 Jamsil-ro, Songpa-gu' },
    lat: 37.5117, lng: 127.1019, free: true },
  { id: 'cl-3', emoji: '🎭', name: { ko: '서울로7017', zh: '首尔路7017', en: 'Seoullo 7017' },
    desc: { ko: '옛 고가도로를 공중 정원으로. 서울역~남산 산책 코스', zh: '旧高架路变空中花园。首尔站~南山散步路线', en: 'Old overpass turned aerial garden. Seoul Station to Namsan walk' },
    address: { ko: '중구 청파로 432', zh: '中区青坡路432号', en: '432 Cheongpa-ro, Jung-gu' },
    lat: 37.5544, lng: 126.9710, free: true },
  { id: 'cl-4', emoji: '🖼️', name: { ko: 'DDP (동대문디자인플라자)', zh: 'DDP(东大门设计广场)', en: 'DDP (Dongdaemun Design Plaza)' },
    desc: { ko: '자하 하디드 건축. 전시·패션쇼·야시장. 서울의 랜드마크', zh: '扎哈·哈迪德建筑。展览·时装秀·夜市。首尔地标', en: 'Zaha Hadid architecture. Exhibitions, fashion shows, night market' },
    address: { ko: '중구 을지로 281', zh: '中区乙支路281号', en: '281 Eulji-ro, Jung-gu' },
    lat: 37.5671, lng: 127.0095, free: false },
  { id: 'cl-5', emoji: '🎵', name: { ko: '서울예술의전당', zh: '首尔艺术殿堂', en: 'Seoul Arts Center' },
    desc: { ko: '오페라, 발레, 클래식. 한국 최고의 공연 예술 공간', zh: '歌剧、芭蕾、古典乐。韩国最高水平的表演艺术空间', en: 'Opera, ballet, classical. Korea\'s premier performing arts venue' },
    address: { ko: '서초구 남부순환로 2406', zh: '瑞草区南部循环路2406号', en: '2406 Nambusunhwan-ro, Seocho-gu' },
    lat: 37.4784, lng: 127.0113, free: false },
  { id: 'cl-6', emoji: '🏛', name: { ko: '국립현대미술관 서울관', zh: '国立现代美术馆首尔馆', en: 'MMCA Seoul' },
    desc: { ko: '삼청동 위치. 현대미술 상설전 + 특별전', zh: '三清洞位置。现代美术常设展+特别展', en: 'In Samcheong-dong. Permanent + special exhibitions of contemporary art' },
    address: { ko: '종로구 삼청로 30', zh: '钟路区三清路30号', en: '30 Samcheong-ro, Jongno-gu' },
    lat: 37.5787, lng: 126.9800, free: false },
]

export function CultureLounge({ lang }) {
  return (
    <div className="px-4 pt-4 pb-24">
      <p className="text-[20px] font-bold text-[#1A1A1A] mb-1">🎨 {L(lang, { ko: '서울 문화 라운지', zh: '首尔文化空间', en: 'Seoul Culture Lounge' })}</p>
      <p className="text-[11px] text-[#9CA3AF] mb-4">{L(lang, { ko: '서울에서 꼭 가봐야 할 문화 공간', zh: '在首尔必访的文化空间', en: 'Must-visit cultural spaces in Seoul' })}</p>

      <div className="space-y-2.5">
        {CULTURE_LOUNGE_DATA.map(item => (
          <div key={item.id} className="bg-white rounded-[14px] p-4" style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
            <div className="flex items-start gap-3">
              <span className="text-2xl mt-0.5">{item.emoji}</span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-[14px] font-bold text-[#111827]">{L(lang, item.name)}</p>
                  {item.free && <span className="text-[9px] bg-[#DCFCE7] text-[#16A34A] px-1.5 py-0.5 rounded-full font-medium">FREE</span>}
                </div>
                <p className="text-[12px] text-[#555] mt-1">{L(lang, item.desc)}</p>
                <p className="text-[10px] text-[#9CA3AF] mt-1">📍 {L(lang, item.address)}</p>
                <div className="flex gap-2 mt-2">
                  <a href={`https://map.kakao.com/link/to/${encodeURIComponent(L(lang, item.name))},${item.lat},${item.lng}`}
                    target="_blank" rel="noreferrer"
                    className="text-[10px] bg-[#FEE500] text-[#111827] font-bold px-2.5 py-1 rounded-full active:scale-95 transition-transform">
                    🗺 {L(lang, { ko: '길찾기', zh: '导航', en: 'Navigate' })}
                  </a>
                  <a href={`https://map.kakao.com/link/map/${encodeURIComponent(L(lang, item.name))},${item.lat},${item.lng}`}
                    target="_blank" rel="noreferrer"
                    className="text-[10px] bg-[#EEF2FF] text-[#4F46E5] font-medium px-2.5 py-1 rounded-full active:scale-95 transition-transform">
                    📍 {L(lang, { ko: '지도', zh: '地图', en: 'Map' })}
                  </a>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <a href="https://www.visitseoul.net/culture" target="_blank" rel="noreferrer"
        className="block w-full mt-4 py-3 rounded-[12px] bg-[#111827] text-white text-[13px] font-bold text-center">
        🎨 {L(lang, { ko: 'Visit Seoul 문화관광 더보기', zh: '查看更多Visit Seoul文化旅游', en: 'More Culture on Visit Seoul' })}
      </a>
    </div>
  )
}
