import { useState, useEffect } from 'react'
import { Clock, ShoppingBag, MapPin, ChevronRight, AlertCircle, Plane, Coffee, Gift, CreditCard, Package, Store, Check } from 'lucide-react'

function L(lang, d) {
  if (typeof d === 'string') return d
  return d?.[lang] || d?.en || d?.zh || d?.ko || ''
}

const TEXTS = {
  title: { ko: '출국 타임어택 쇼핑', zh: '出境限时购物', en: 'Departure Shopping Route', ja: '出国タイムアタックショッピング' },
  subtitle: { ko: '남은 시간에 맞는 최적 쇼핑 동선', zh: '根据剩余时间规划最优购物路线', en: 'Optimized shopping route for your remaining time', ja: '残り時間に合わせた最適ショッピングルート' },
  remainingTime: { ko: '탑승까지 남은 시간', zh: '距登机剩余时间', en: 'Time until boarding', ja: '搭乗までの残り時間' },
  hours: { ko: '시간', zh: '小时', en: 'hrs', ja: '時間' },
  minutes: { ko: '분', zh: '分钟', en: 'min', ja: '分' },
  terminal: { ko: '터미널', zh: '航站楼', en: 'Terminal', ja: 'ターミナル' },
  gate: { ko: '게이트', zh: '登机口', en: 'Gate', ja: 'ゲート' },
  congestion: { ko: '예상 혼잡도', zh: '预计拥挤度', en: 'Est. congestion', ja: '予想混雑度' },
  estTime: { ko: '예상 소요', zh: '预计耗时', en: 'Est. time', ja: '所要時間' },
  mustBuy: { ko: '인기 구매', zh: '热门商品', en: 'Popular items', ja: '人気商品' },
  completed: { ko: '완료', zh: '完成', en: 'Done', ja: '完了' },
  shipHome: { ko: '못 산 것 본국 배송', zh: '没买到的寄回国', en: 'Ship what you missed home', ja: '買えなかったものを本国へ配送' },
  lowCongestion: { ko: '한산', zh: '空闲', en: 'Low', ja: '空いている' },
  medCongestion: { ko: '보통', zh: '一般', en: 'Medium', ja: '普通' },
  highCongestion: { ko: '혼잡', zh: '拥挤', en: 'Busy', ja: '混雑' },
  inputTime: { ko: '탑승까지 남은 시간 (분)', zh: '距登机剩余时间（分钟）', en: 'Minutes until boarding', ja: '搭乗までの残り時間（分）' },
  inputTerminal: { ko: '현재 터미널', zh: '当前航站楼', en: 'Current terminal', ja: '現在のターミナル' },
  generate: { ko: '동선 생성', zh: '生成路线', en: 'Generate Route', ja: 'ルート作成' },
  walkToGate: { ko: '게이트로 이동', zh: '前往登机口', en: 'Walk to gate', ja: 'ゲートへ移動' },
  hurryNote: { ko: '서둘러 주세요! 시간이 촉박합니다.', zh: '请抓紧时间！时间紧迫。', en: 'Hurry! Time is tight.', ja: 'お急ぎください！時間がタイトです。' },
}

// Shopping stops by time tier
const STOPS_BY_TIER = {
  under60: [
    { id: 'cvs', name: { ko: '편의점 (게이트 근처)', zh: '便利店（登机口附近）', en: 'Convenience Store (near gate)', ja: 'コンビニ（ゲート近く）' }, icon: Store, estMin: 10, congestion: 'low',
      items: { ko: ['초코파이', '허니버터칩', '바나나맛우유', '소주 미니'], zh: ['巧克力派', '蜂蜜黄油薯片', '香蕉牛奶', '迷你烧酒'], en: ['Choco Pie', 'Honey Butter Chips', 'Banana Milk', 'Mini Soju'], ja: ['チョコパイ', 'ハニーバターチップス', 'バナナ牛乳', 'ミニ焼酎'] } },
  ],
  under120: [
    { id: 'olive', name: { ko: '올리브영', zh: 'Olive Young', en: 'Olive Young', ja: 'オリーブヤング' }, icon: ShoppingBag, estMin: 25, congestion: 'medium',
      items: { ko: ['마데카소사이드 시카크림', '라운드랩 독도토너', '메디힐 마스크팩', '조선미녀 선크림'], zh: ['Madecassoside积雪草霜', 'Round Lab独岛爽肤水', 'Mediheal面膜', '朝鲜美女防晒霜'], en: ['Madecassoside Cica Cream', 'Round Lab Dokdo Toner', 'Mediheal Sheet Masks', 'Beauty of Joseon Sunscreen'], ja: ['マデカソシド シカクリーム', 'ラウンドラブ独島トナー', 'メディヒール マスクパック', '朝鮮美女 日焼け止め'] } },
    { id: 'cvs', name: { ko: '편의점', zh: '便利店', en: 'Convenience Store', ja: 'コンビニ' }, icon: Store, estMin: 10, congestion: 'low',
      items: { ko: ['초코파이', '허니버터칩', '김 선물세트'], zh: ['巧克力派', '蜂蜜黄油薯片', '海苔礼盒'], en: ['Choco Pie', 'Honey Butter Chips', 'Seaweed gift set'], ja: ['チョコパイ', 'ハニーバターチップス', '海苔ギフトセット'] } },
  ],
  under180: [
    { id: 'dutyfree', name: { ko: '면세점 (핵심 아이템)', zh: '免税店（重点商品）', en: 'Duty Free (priority items)', ja: '免税店（優先アイテム）' }, icon: Gift, estMin: 35, congestion: 'high',
      items: { ko: ['설화수', '후 (Whoo)', '라네즈 립슬리핑마스크', '위스키/양주'], zh: ['雪花秀', '后 (Whoo)', '兰芝唇膜', '威士忌'], en: ['Sulwhasoo', 'Whoo', 'Laneige Lip Sleeping Mask', 'Whisky'], ja: ['雪花秀', '后 (Whoo)', 'ラネージュ リップスリーピングマスク', 'ウイスキー'] } },
    { id: 'olive', name: { ko: '올리브영', zh: 'Olive Young', en: 'Olive Young', ja: 'オリーブヤング' }, icon: ShoppingBag, estMin: 20, congestion: 'medium',
      items: { ko: ['K-뷰티 인기템', '마스크팩 세트'], zh: ['K-美妆人气品', '面膜套装'], en: ['K-Beauty bestsellers', 'Mask pack set'], ja: ['K-ビューティ人気アイテム', 'マスクパックセット'] } },
    { id: 'snack', name: { ko: '과자/간식 코너', zh: '零食区', en: 'Snack Corner', ja: 'お菓子コーナー' }, icon: Coffee, estMin: 10, congestion: 'low',
      items: { ko: ['한국 과자 세트', '건조 김치', '고추장'], zh: ['韩国零食套装', '干泡菜', '辣椒酱'], en: ['Korean snack set', 'Dried kimchi', 'Gochujang'], ja: ['韓国お菓子セット', '乾燥キムチ', 'コチュジャン'] } },
  ],
  over180: [
    { id: 'dutyfree', name: { ko: '면세점 풀투어', zh: '免税店全逛', en: 'Full Duty Free Tour', ja: '免税店フルツアー' }, icon: Gift, estMin: 50, congestion: 'high',
      items: { ko: ['화장품', '주류', '초콜릿', '명품'], zh: ['化妆品', '酒', '巧克力', '奢侈品'], en: ['Cosmetics', 'Alcohol', 'Chocolate', 'Luxury goods'], ja: ['化粧品', 'お酒', 'チョコレート', 'ブランド品'] } },
    { id: 'taxrefund', name: { ko: '세금환급 카운터', zh: '退税柜台', en: 'Tax Refund Counter', ja: '免税カウンター' }, icon: CreditCard, estMin: 15, congestion: 'medium',
      items: { ko: ['영수증 제출', '환급금 수령'], zh: ['提交收据', '领取退税'], en: ['Submit receipts', 'Receive refund'], ja: ['レシート提出', '還付金受取'] } },
    { id: 'olive', name: { ko: '올리브영', zh: 'Olive Young', en: 'Olive Young', ja: 'オリーブヤング' }, icon: ShoppingBag, estMin: 25, congestion: 'medium',
      items: { ko: ['K-뷰티 쇼핑'], zh: ['K-美妆购物'], en: ['K-Beauty shopping'], ja: ['K-ビューティショッピング'] } },
    { id: 'meal', name: { ko: '식당 (여유있게 식사)', zh: '餐厅（悠闲用餐）', en: 'Sit-down Meal', ja: 'レストラン（ゆっくり食事）' }, icon: Coffee, estMin: 30, congestion: 'low',
      items: { ko: ['비빔밥', '설렁탕', '김치찌개'], zh: ['拌饭', '雪浓汤', '泡菜汤'], en: ['Bibimbap', 'Seolleongtang', 'Kimchi Jjigae'], ja: ['ビビンバ', 'ソルロンタン', 'キムチチゲ'] } },
  ],
}

function getRoute(minutesRemaining) {
  const gateBuffer = 15 // Always leave 15min for gate walk
  const available = minutesRemaining - gateBuffer
  if (available < 60) return { tier: 'under60', stops: STOPS_BY_TIER.under60, tight: true }
  if (available < 120) return { tier: 'under120', stops: STOPS_BY_TIER.under120, tight: false }
  if (available < 180) return { tier: 'under180', stops: STOPS_BY_TIER.under180, tight: false }
  return { tier: 'over180', stops: STOPS_BY_TIER.over180, tight: false }
}

const CONGESTION_STYLE = {
  low: { label: 'lowCongestion', color: 'text-emerald-600 bg-emerald-50' },
  medium: { label: 'medCongestion', color: 'text-amber-600 bg-amber-50' },
  high: { label: 'highCongestion', color: 'text-red-600 bg-red-50' },
}

export default function DepartureShoppingRoute({ lang, profile }) {
  const [minutesInput, setMinutesInput] = useState('')
  const [terminal, setTerminal] = useState('T1')
  const [route, setRoute] = useState(null)
  const [completedStops, setCompletedStops] = useState(new Set())

  function handleGenerate() {
    const mins = parseInt(minutesInput)
    if (!mins || mins < 15) return
    setRoute(getRoute(mins))
    setCompletedStops(new Set())
  }

  function toggleComplete(id) {
    setCompletedStops(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const totalEstMin = route?.stops?.reduce((sum, s) => sum + s.estMin, 0) || 0

  return (
    <div className="space-y-4 pb-6">
      {/* Header */}
      <div className="text-center pt-2 pb-2">
        <div className="w-14 h-14 mx-auto mb-3 rounded-2xl bg-orange-50 flex items-center justify-center">
          <ShoppingBag size={28} className="text-orange-600" />
        </div>
        <h2 className="text-lg font-bold text-[#111827]">{L(lang, TEXTS.title)}</h2>
        <p className="text-xs text-[#6B7280] mt-1 px-8">{L(lang, TEXTS.subtitle)}</p>
      </div>

      {/* Input */}
      {!route && (
        <div className="mx-4 p-4 rounded-xl border border-[#E5E7EB] space-y-3">
          <div>
            <label className="text-xs text-[#6B7280] mb-1 block">{L(lang, TEXTS.inputTime)}</label>
            <input
              type="number"
              value={minutesInput}
              onChange={e => setMinutesInput(e.target.value)}
              placeholder="120"
              className="w-full px-3 py-2.5 rounded-lg border border-[#E5E7EB] text-sm focus:outline-none focus:border-[#111827]"
            />
          </div>
          <div>
            <label className="text-xs text-[#6B7280] mb-1 block">{L(lang, TEXTS.inputTerminal)}</label>
            <div className="flex gap-2">
              {['T1', 'T2'].map(t => (
                <button
                  key={t}
                  onClick={() => setTerminal(t)}
                  className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
                    terminal === t ? 'bg-[#111827] text-white' : 'bg-[#F3F4F6] text-[#6B7280]'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
          <button
            onClick={handleGenerate}
            disabled={!minutesInput || parseInt(minutesInput) < 15}
            className="w-full py-3 rounded-xl bg-[#111827] text-white text-sm font-medium disabled:opacity-30"
          >
            {L(lang, TEXTS.generate)}
          </button>
        </div>
      )}

      {/* Route */}
      {route && (
        <>
          {/* Time summary */}
          <div className="mx-4 p-4 rounded-xl bg-gradient-to-r from-orange-50 to-amber-50 border border-orange-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-orange-700">{L(lang, TEXTS.remainingTime)}</span>
              <span className="text-xs text-orange-500">{terminal}</span>
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-light text-orange-700">{minutesInput}</span>
              <span className="text-sm text-orange-500">{L(lang, TEXTS.minutes)}</span>
            </div>
            <p className="text-[10px] text-orange-400 mt-1">
              {L(lang, { ko: `쇼핑 ${totalEstMin}분 + 이동 15분`, zh: `购物${totalEstMin}分钟 + 移动15分钟`, en: `Shopping ${totalEstMin}min + walking 15min`, ja: `ショッピング${totalEstMin}分 + 移動15分` })}
            </p>
          </div>

          {route.tight && (
            <div className="mx-4 p-3 rounded-xl bg-red-50 border border-red-200 flex items-center gap-2">
              <AlertCircle size={14} className="text-red-500 shrink-0" />
              <p className="text-xs text-red-600">{L(lang, TEXTS.hurryNote)}</p>
            </div>
          )}

          {/* Stops */}
          <div className="mx-4 space-y-0">
            {route.stops.map((stop, i) => {
              const StopIcon = stop.icon
              const isCompleted = completedStops.has(stop.id)
              const cStyle = CONGESTION_STYLE[stop.congestion]
              return (
                <div key={stop.id + i}>
                  <div className={`flex gap-3 p-4 rounded-xl border ${isCompleted ? 'bg-[#F9FAFB] border-[#E5E7EB] opacity-60' : 'bg-white border-[#E5E7EB]'}`}>
                    <button onClick={() => toggleComplete(stop.id)} className="shrink-0 mt-0.5">
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center ${isCompleted ? 'bg-emerald-500' : 'bg-[#F3F4F6]'}`}>
                        {isCompleted ? <Check size={14} className="text-white" /> : <StopIcon size={14} className="text-[#6B7280]" />}
                      </div>
                    </button>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <p className={`text-sm font-medium ${isCompleted ? 'line-through text-[#9CA3AF]' : 'text-[#111827]'}`}>{L(lang, stop.name)}</p>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${cStyle.color}`}>{L(lang, TEXTS[cStyle.label])}</span>
                      </div>
                      <div className="flex items-center gap-3 text-[10px] text-[#9CA3AF] mb-2">
                        <span className="flex items-center gap-0.5"><Clock size={10} /> ~{stop.estMin}{L(lang, TEXTS.minutes)}</span>
                      </div>
                      {!isCompleted && (
                        <div className="flex flex-wrap gap-1">
                          {(stop.items?.[lang] || stop.items?.en || []).map((item, j) => (
                            <span key={j} className="text-[10px] px-2 py-0.5 rounded-full bg-[#F3F4F6] text-[#6B7280]">{item}</span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                  {i < route.stops.length - 1 && (
                    <div className="flex justify-center py-1">
                      <div className="w-0.5 h-4 bg-[#E5E7EB]" />
                    </div>
                  )}
                </div>
              )
            })}

            {/* Gate walk */}
            <div className="flex justify-center py-1">
              <div className="w-0.5 h-4 bg-[#E5E7EB]" />
            </div>
            <div className="flex gap-3 p-4 rounded-xl bg-blue-50 border border-blue-200">
              <div className="w-7 h-7 rounded-full bg-blue-500 flex items-center justify-center shrink-0">
                <Plane size={14} className="text-white" />
              </div>
              <div>
                <p className="text-sm font-bold text-blue-700">{L(lang, TEXTS.walkToGate)}</p>
                <p className="text-[10px] text-blue-500">~15{L(lang, TEXTS.minutes)}</p>
              </div>
            </div>
          </div>

          {/* Ship home CTA */}
          <div className="mx-4 p-4 rounded-xl border border-dashed border-[#D1D5DB] text-center">
            <Package size={20} className="mx-auto text-[#9CA3AF] mb-2" />
            <p className="text-xs font-medium text-[#374151]">{L(lang, TEXTS.shipHome)}</p>
            <p className="text-[10px] text-[#9CA3AF] mt-1">{L(lang, { ko: '인천공항 내 EMS/택배 서비스', zh: '仁川机场EMS/快递服务', en: 'EMS/courier service at Incheon Airport', ja: '仁川空港内EMS/宅配サービス' })}</p>
          </div>

          {/* Reset */}
          <div className="mx-4 text-center">
            <button onClick={() => setRoute(null)} className="text-xs text-[#9CA3AF]">
              {L(lang, { ko: '다시 설정', zh: '重新设置', en: 'Reset', ja: 'リセット' })}
            </button>
          </div>
        </>
      )}
    </div>
  )
}
