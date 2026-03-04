import { X, AlertTriangle, Wine, Cigarette, Droplets, Banknote, Package, ShieldAlert } from 'lucide-react'

function L(lang, d) { if (typeof d === 'string') return d; return d?.[lang] || d?.en || d?.zh || d?.ko || '' }

const card = 'bg-white rounded-2xl p-5 border border-[#E5E7EB]'

const DUTY_FREE_LIMITS = [
  { icon: Wine, label: { ko: '주류', zh: '酒类', en: 'Alcohol' }, limit: { ko: '1병 (1.5L 이하)', zh: '1瓶（1.5L以下）', en: '1 bottle (≤1.5L)' }, note: { ko: '알코올 12% 이상은 제한', zh: '酒精12%以上有限制', en: 'Restrictions for >12% alcohol' } },
  { icon: Cigarette, label: { ko: '담배', zh: '香烟', en: 'Cigarettes' }, limit: { ko: '400개비 (2보루)', zh: '400支（2条）', en: '400 sticks (2 cartons)' }, note: null },
  { icon: Droplets, label: { ko: '향수', zh: '香水', en: 'Perfume' }, limit: { ko: '합리적 개인 사용량', zh: '合理个人使用量', en: 'Reasonable personal use' }, note: null },
  { icon: Banknote, label: { ko: '총액 한도', zh: '总额限制', en: 'Total Limit' }, limit: { ko: '5,000위안 (약 100만원)', zh: '5,000人民币（约100万韩元）', en: '¥5,000 (~₩1,000,000)' }, note: { ko: '중국 입국 기준', zh: '中国入境标准', en: 'China entry limit' } },
]

const LIQUID_RULES = [
  { ko: '개별 용기 100ml 이하', zh: '单个容器100ml以下', en: 'Each container ≤100ml' },
  { ko: '투명 지퍼백 1개 (20cm × 20cm)', zh: '透明密封袋1个（20cm×20cm）', en: '1 clear zip bag (20cm × 20cm)' },
  { ko: '총 1L 이내', zh: '总量1L以内', en: 'Total ≤1L' },
  { ko: '면세점 구매 액체류: 밀봉 STEB 백이면 OK', zh: '免税店购买的液体：密封STEB袋即可', en: 'Duty-free liquids: OK if in sealed STEB bag' },
]

const CONFISCATED_TOP5 = [
  { rank: 1, item: { ko: '화장품 큰 통 (100ml 초과)', zh: '大瓶化妆品（超过100ml）', en: 'Large cosmetics (>100ml)' }, emoji: '🧴' },
  { rank: 2, item: { ko: '꿀 / 잼 (액체 분류)', zh: '蜂蜜/果酱（归类为液体）', en: 'Honey / Jam (classified as liquid)' }, emoji: '🍯' },
  { rank: 3, item: { ko: '음료수', zh: '饮料', en: 'Beverages' }, emoji: '🥤' },
  { rank: 4, item: { ko: '치약 대용량', zh: '大管牙膏', en: 'Large toothpaste' }, emoji: '🪥' },
  { rank: 5, item: { ko: '김치 국물', zh: '泡菜汤汁', en: 'Kimchi liquid' }, emoji: '🥬' },
]

export default function DutyFreeGuide({ lang, onClose }) {
  return (
    <div className="fixed inset-0 z-[999] bg-white overflow-y-auto">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white border-b border-[#E5E7EB] px-5 py-4 flex items-center justify-between">
        <h1 className="text-lg font-bold text-[#111827]">
          {L(lang, { ko: '면세 한도 & 액체류', zh: '免税限额 & 液体规定', en: 'Duty-Free & Liquids' })}
        </h1>
        <button onClick={onClose} className="p-1 rounded-full hover:bg-[#F3F4F6] transition-colors">
          <X size={22} className="text-[#111827]" />
        </button>
      </div>

      <div className="px-5 py-4 space-y-4 pb-20">
        {/* 기준일자 */}
        <p className="text-xs text-gray-400 text-center">
          {L(lang, { ko: '정보 기준: 2026년 3월', zh: '信息基准: 2026年3月', en: 'As of March 2026' })}
        </p>

        {/* 경고 카드 */}
        <div className="bg-red-50 border border-red-200 rounded-2xl p-5">
          <div className="flex items-start gap-3">
            <ShieldAlert size={20} className="text-red-500 shrink-0 mt-0.5" />
            <div>
              <p className="text-base font-bold text-red-700">
                {L(lang, { ko: '공항에서 압수당하지 마세요!', zh: '别在机场被没收！', en: "Don't get items confiscated!" })}
              </p>
              <p className="text-xs text-red-600 mt-1">
                {L(lang, { ko: '매년 수만 건 압수 — 미리 확인하세요', zh: '每年数万件被没收——请提前确认', en: 'Tens of thousands confiscated yearly — check before you go' })}
              </p>
            </div>
          </div>
        </div>

        {/* 면세 한도 — 시각적 아이콘 카드 */}
        <div className={card}>
          <h3 className="text-sm font-bold text-[#111827] mb-4">
            {L(lang, { ko: '🇨🇳 중국 입국 면세 한도', zh: '🇨🇳 中国入境免税限额', en: '🇨🇳 China Entry Duty-Free Limits' })}
          </h3>
          <div className="grid grid-cols-2 gap-3">
            {DUTY_FREE_LIMITS.map((item, i) => (
              <div key={i} className="bg-[#F9FAFB] rounded-xl p-4 text-center">
                <item.icon size={28} className="text-[#111827] mx-auto mb-2" />
                <p className="text-xs text-[#6B7280] mb-1">{L(lang, item.label)}</p>
                <p className="text-sm font-bold text-[#111827]">{L(lang, item.limit)}</p>
                {item.note && <p className="text-[10px] text-[#9CA3AF] mt-1">{L(lang, item.note)}</p>}
              </div>
            ))}
          </div>
          <p className="text-[10px] text-gray-400 mt-3">
            {L(lang, { ko: '※ 중국 해관총서 규정 기준. 최신 규정은 해관총서에서 확인하세요.', zh: '※ 基于中国海关总署规定。请查阅海关总署最新规定。', en: '※ Based on China Customs regulations. Please verify the latest rules.' })}
          </p>
        </div>

        {/* 액체류 기내 반입 규정 */}
        <div className={card}>
          <h3 className="text-sm font-bold text-[#111827] mb-3 flex items-center gap-2">
            <Droplets size={16} />
            {L(lang, { ko: '액체류 기내 반입 규정', zh: '液体类随身携带规定', en: 'Carry-On Liquid Rules' })}
          </h3>
          <div className="space-y-2">
            {LIQUID_RULES.map((rule, i) => (
              <div key={i} className="flex items-start gap-2">
                <span className="text-xs font-bold text-white bg-[#111827] w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5">{i + 1}</span>
                <p className="text-sm text-[#374151]">{L(lang, rule)}</p>
              </div>
            ))}
          </div>

          {/* 시각적 요약 */}
          <div className="mt-4 bg-[#F0F9FF] border border-[#BAE6FD] rounded-xl p-4 text-center">
            <div className="flex items-center justify-center gap-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-[#111827]">100ml</p>
                <p className="text-[10px] text-[#6B7280]">{L(lang, { ko: '용기당', zh: '每瓶', en: 'per item' })}</p>
              </div>
              <span className="text-xl text-[#9CA3AF]">×</span>
              <div className="text-center">
                <p className="text-2xl font-bold text-[#111827]">1L</p>
                <p className="text-[10px] text-[#6B7280]">{L(lang, { ko: '총량', zh: '总量', en: 'total' })}</p>
              </div>
              <span className="text-xl text-[#9CA3AF]">=</span>
              <div className="text-center">
                <p className="text-2xl font-bold text-[#111827]">1</p>
                <p className="text-[10px] text-[#6B7280]">{L(lang, { ko: '지퍼백', zh: '密封袋', en: 'zip bag' })}</p>
              </div>
            </div>
          </div>
        </div>

        {/* 자주 압수되는 것 TOP 5 */}
        <div className={card}>
          <h3 className="text-sm font-bold text-[#111827] mb-3 flex items-center gap-2">
            <Package size={16} />
            {L(lang, { ko: '자주 압수되는 것 TOP 5', zh: '最常被没收的TOP 5', en: 'Top 5 Confiscated Items' })}
          </h3>
          <div className="space-y-2">
            {CONFISCATED_TOP5.map(c => (
              <div key={c.rank} className="flex items-center gap-3 bg-[#FEF2F2] rounded-xl px-4 py-3">
                <span className="text-lg font-bold text-red-400">#{c.rank}</span>
                <span className="text-xl">{c.emoji}</span>
                <span className="text-sm text-[#374151] flex-1">{L(lang, c.item)}</span>
              </div>
            ))}
          </div>
        </div>

        {/* 팁 카드 */}
        <div className="bg-[#FFFBEB] border border-[#FDE68A] rounded-2xl p-4">
          <div className="flex items-start gap-2">
            <AlertTriangle size={16} className="text-[#F59E0B] shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-[#111827] mb-1">
                {L(lang, { ko: '꿀팁', zh: '小贴士', en: 'Pro Tips' })}
              </p>
              <ul className="text-xs text-[#374151] space-y-1">
                <li>{L(lang, { ko: '• 100ml 초과 화장품은 수하물에 넣기', zh: '• 超过100ml的化妆品放入托运行李', en: '• Put >100ml cosmetics in checked baggage' })}</li>
                <li>{L(lang, { ko: '• 면세점에서 산 액체류는 STEB 백 뜯지 않기', zh: '• 免税店买的液体不要拆开STEB密封袋', en: '• Don\'t open STEB bags from duty-free' })}</li>
                <li>{L(lang, { ko: '• 김치는 진공포장 후 수하물로!', zh: '• 泡菜真空包装后放入托运行李！', en: '• Vacuum-pack kimchi and check it in!' })}</li>
              </ul>
            </div>
          </div>
        </div>

        {/* 국가별 면세한도 */}
        <div className={card}>
          <h3 className="text-sm font-bold text-[#111827] mb-3">
            🌍 {L(lang, { ko: '국가별 면세한도 (귀국 시)', zh: '各国免税额度（回国时）', en: 'Duty-Free Limits by Country (Return)' })}
          </h3>
          <p className="text-xs text-[#F59E0B] mb-4 leading-relaxed">
            {L(lang, { ko: '⚠️ 면세한도는 각 국가 세관 정책에 따라 변경될 수 있습니다. 출국 전 반드시 최신 정보를 확인하세요.', zh: '⚠️ 免税额度可能因各国海关政策而变化，出境前请务必确认最新信息。', en: '⚠️ Duty-free limits may change. Please verify latest info before departure.' })}
          </p>
          <div className="space-y-2">
            {[
              { country: '🇨🇳', name: { ko: '중국', zh: '中国', en: 'China' }, limit: '¥5,000 (약 ₩100만)', note: { ko: '초과 시 세관 신고 필수', zh: '超额必须申报', en: 'Must declare if exceeded' }, updated: '2024.07' },
              { country: '🇯🇵', name: { ko: '일본', zh: '日本', en: 'Japan' }, limit: '¥200,000 (약 ₩180만)', note: { ko: '주류 3병, 담배 400개비', zh: '酒3瓶，烟400支', en: '3 bottles alcohol, 400 cigarettes' }, updated: '2024.04' },
              { country: '🇺🇸', name: { ko: '미국', zh: '美国', en: 'USA' }, limit: '$800 (약 ₩110만)', note: { ko: '주류 1L, 담배 200개비', zh: '酒1L，烟200支', en: '1L alcohol, 200 cigarettes' }, updated: '2024.01' },
              { country: '🇹🇭', name: { ko: '태국', zh: '泰国', en: 'Thailand' }, limit: '฿20,000 (약 ₩80만)', note: { ko: '주류 1L, 담배 200개비', zh: '酒1L，烟200支', en: '1L alcohol, 200 cigarettes' }, updated: '2024.01' },
              { country: '🇻🇳', name: { ko: '베트남', zh: '越南', en: 'Vietnam' }, limit: '₫10,000,000 (약 ₩55만)', note: { ko: '주류 1.5L, 담배 200개비', zh: '酒1.5L，烟200支', en: '1.5L alcohol, 200 cigarettes' }, updated: '2024.01' },
              { country: '🇸🇬', name: { ko: '싱가포르', zh: '新加坡', en: 'Singapore' }, limit: 'S$600 (약 ₩60만)', note: { ko: '주류 1L, 면세 주류 별도', zh: '酒1L，免税酒另算', en: '1L alcohol, duty-free separate' }, updated: '2024.01' },
              { country: '🇹🇼', name: { ko: '대만', zh: '台湾', en: 'Taiwan' }, limit: 'NT$20,000 (약 ₩85만)', note: { ko: '주류 1L, 담배 200개비', zh: '酒1L，烟200支', en: '1L alcohol, 200 cigarettes' }, updated: '2024.01' },
              { country: '🇵🇭', name: { ko: '필리핀', zh: '菲律宾', en: 'Philippines' }, limit: '₱10,000 (약 ₩24만)', note: { ko: '주류 2병, 담배 400개비', zh: '酒2瓶，烟400支', en: '2 bottles alcohol, 400 cigarettes' }, updated: '2024.01' },
              { country: '🇲🇾', name: { ko: '말레이시아', zh: '马来西亚', en: 'Malaysia' }, limit: 'RM500 (약 ₩15만)', note: { ko: '주류 1L, 담배 200개비', zh: '酒1L，烟200支', en: '1L alcohol, 200 cigarettes' }, updated: '2024.01' },
              { country: '🇦🇺', name: { ko: '호주', zh: '澳大利亚', en: 'Australia' }, limit: 'A$900 (약 ₩80만)', note: { ko: '주류 2.25L, 담배 25개비', zh: '酒2.25L，烟25支', en: '2.25L alcohol, 25 cigarettes' }, updated: '2024.01' },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-3 bg-[#F9FAFB] rounded-xl px-4 py-3">
                <span className="text-xl">{item.country}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline gap-2">
                    <span className="text-sm font-bold text-[#111827]">{L(lang, item.name)}</span>
                    <span className="text-xs font-semibold text-blue-600">{item.limit}</span>
                  </div>
                  <p className="text-[10px] text-[#6B7280] mt-0.5">{L(lang, item.note)}</p>
                </div>
                <span className="text-[9px] text-[#9CA3AF] shrink-0">{item.updated}</span>
              </div>
            ))}
          </div>
        </div>

        {/* 출처 + 푸터 */}
        <p className="text-[10px] text-gray-400 text-center">
          {L(lang, { ko: '출처: 인천국제공항공사, 중국 해관총서', zh: '来源：仁川国际机场公社、中国海关总署', en: 'Source: Incheon Airport Corp., China Customs' })}
        </p>
        <p className="text-xs text-gray-400 text-center mt-8">
          {L(lang, { ko: '정보 기준: 2026년 3월 | 문의: hanpocket@email.com', zh: '信息基准: 2026年3月 | 联系: hanpocket@email.com', en: 'As of March 2026 | Contact: hanpocket@email.com' })}
        </p>
      </div>
    </div>
  )
}
