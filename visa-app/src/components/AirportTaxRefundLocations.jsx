import { useState } from 'react'
import { ChevronDown, AlertCircle, MapPin, Clock, DollarSign, Package } from 'lucide-react'
import { AIRPORT_TAX_REFUND, PAYMENT_METHOD_LABELS } from '../data/airportTaxRefund'

function L(lang, d) {
  if (typeof d === 'string') return d
  return d?.[lang] || d?.en || d?.zh || d?.ko || ''
}

const TEXTS = {
  title: { zh: '机场退税柜台位置', en: 'Airport Refund Locations', ja: '空港払戻窓口の位置', ko: '공항 환급 창구 위치' },
  selectAirport: { zh: '选择机场', en: 'Select Airport', ja: '空港を選択', ko: '공항 선택' },
  customs: { zh: '海关检查点', en: 'Customs Check', ja: '税関チェック', ko: '세관 확인' },
  refundCounter: { zh: '退税柜台', en: 'Refund Counter', ja: '払戻窓口', ko: '환급 창구' },
  staffed: { zh: '工作人员', en: 'Staffed', ja: 'スタッフ対応', ko: '유인 운영' },
  kiosk: { zh: '自动取款机', en: 'Kiosk', ja: 'キオスク', ko: '무인 키오스크' },
  mailbox: { zh: '邮箱 (仅限此机场)', en: 'Mailbox (This airport only)', ja: 'メールボックス (この空港のみ)', ko: '메일박스 (이 공항만 운영)' },
  operatedBy: { zh: '运营商', en: 'Operator', ja: '運営者', ko: '운영사' },
  acceptedPayment: { zh: '接受支付方式', en: 'Payment Methods', ja: '受け付け方法', ko: '지급 가능 통화/결제수단' },
  procedure: { zh: '退税流程', en: 'Refund Procedure', ja: '払戻手順', ko: '환급 절차' },
  step1: { zh: '1. 海关检查 (显示商品)', en: '1. Customs Check (Show goods)', ja: '1. 税関チェック (商品提示)', ko: '1. 세관 반출확인 (물건 보여주기)' },
  step2: { zh: '2. 在柜台或自动取款机领取退税', en: '2. Get refund at counter or kiosk', ja: '2. 窓口またはキオスクで払戻を受け取る', ko: '2. 창구/키오스크에서 환급 수령' },
  warning: { zh: '⚠️ 托运行李前必须先完成海关检查!', en: '⚠️ Always check customs BEFORE checking baggage!', ja: '⚠️ 荷物をチェックインする前に必ず税関を確認してください!', ko: '⚠️ 수화물 부치기 전에 반드시 세관 확인 먼저!' },
  note: { zh: '最终时间和地点请在机场现场确认', en: 'Confirm final times and locations at the airport', ja: '最終的な時間と場所は空港でご確認ください', ko: '최종 확인은 공항 현장에서' },
  mailboxOnly: { zh: '仅邮箱', en: 'Mailbox Only', ja: 'メールボックスのみ', ko: '메일박스만' },
}

export default function AirportTaxRefundLocations({ lang, profile }) {
  const [selectedAirport, setSelectedAirport] = useState(
    profile?.departureAirport || 'icn-t1'
  )
  const [expandedMailbox, setExpandedMailbox] = useState(false)

  const mainAirports = AIRPORT_TAX_REFUND.filter(a => !a.isMailboxOnly)
  const mailboxAirports = AIRPORT_TAX_REFUND.filter(a => a.isMailboxOnly)

  const airport = AIRPORT_TAX_REFUND.find(a => a.id === selectedAirport)

  return (
    <div className="space-y-4">
      {/* 섹션 제목 */}
      <div className="flex items-center gap-2 px-4 pt-4">
        <MapPin size={18} className="text-blue-600" />
        <h3 className="text-sm font-bold text-[#111827]">{L(lang, TEXTS.title)}</h3>
      </div>

      {/* 공항 선택 탭 */}
      <div className="px-4">
        <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide">
          {mainAirports.map(a => (
            <button
              key={a.id}
              onClick={() => setSelectedAirport(a.id)}
              className={`shrink-0 px-4 py-2 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
                selectedAirport === a.id
                  ? 'bg-[#111827] text-white'
                  : 'bg-[#F3F4F6] text-[#6B7280] hover:bg-[#E5E7EB]'
              }`}
            >
              {L(lang, a.airport)}
            </button>
          ))}
        </div>
      </div>

      {/* 선택된 공항 상세 정보 */}
      {airport && !airport.isMailboxOnly && (
        <div className="mx-4 space-y-3">
          {/* 세관 */}
          <div className="p-4 rounded-xl border border-[#E5E7EB]">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center shrink-0">
                <AlertCircle size={16} className="text-blue-600" />
              </div>
              <div className="flex-1">
                <p className="text-xs text-[#6B7280] font-medium mb-1">{L(lang, TEXTS.customs)}</p>
                <p className="text-sm font-semibold text-[#111827]">{L(lang, airport.customs.location)}</p>
              </div>
            </div>
          </div>

          {/* 환급 창구 */}
          <div className="p-4 rounded-xl border border-[#E5E7EB]">
            <div className="flex items-start gap-3 mb-3">
              <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center shrink-0">
                <DollarSign size={16} className="text-emerald-600" />
              </div>
              <div className="flex-1">
                <p className="text-xs text-[#6B7280] font-medium mb-1">{L(lang, TEXTS.refundCounter)}</p>
                <p className="text-sm font-semibold text-[#111827]">{L(lang, airport.refundCounter.location)}</p>
              </div>
            </div>
          </div>

          {/* 운영시간 */}
          {(airport.hours.staffed || airport.hours.kiosk) && (
            <div className="p-4 rounded-xl border border-[#E5E7EB] space-y-2">
              <div className="flex items-start gap-3">
                <Clock size={16} className="text-amber-600 mt-0.5" />
                <div className="flex-1">
                  <p className="text-xs text-[#6B7280] font-medium mb-2">운영시간</p>
                  {airport.hours.staffed && (
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-[#6B7280]">{L(lang, TEXTS.staffed)}</span>
                      <span className="font-medium text-[#111827]">{airport.hours.staffed}</span>
                    </div>
                  )}
                  {airport.hours.kiosk && (
                    <div className="flex justify-between text-sm">
                      <span className="text-[#6B7280]">{L(lang, TEXTS.kiosk)}</span>
                      <span className="font-medium text-[#111827]">{airport.hours.kiosk}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* 지급 가능 통화/결제수단 */}
          {airport.currencies && (
            <div className="p-4 rounded-xl border border-[#E5E7EB]">
              <p className="text-xs text-[#6B7280] font-medium mb-3">{L(lang, TEXTS.acceptedPayment)}</p>
              <div className="space-y-2">
                {airport.currencies.staffed && (
                  <div>
                    <p className="text-xs text-[#9CA3AF] mb-1.5">{L(lang, TEXTS.staffed)}</p>
                    <div className="flex flex-wrap gap-2">
                      {airport.currencies.staffed.map(method => (
                        <span
                          key={method}
                          className={`px-3 py-1.5 rounded-full text-xs font-medium ${
                            ['Alipay', 'WeChat Pay'].includes(method)
                              ? 'bg-amber-50 text-amber-700'
                              : 'bg-[#F3F4F6] text-[#6B7280]'
                          }`}
                        >
                          {L(lang, PAYMENT_METHOD_LABELS[method] || method)}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                {airport.currencies.kiosk && (
                  <div>
                    <p className="text-xs text-[#9CA3AF] mb-1.5">{L(lang, TEXTS.kiosk)}</p>
                    <div className="flex flex-wrap gap-2">
                      {airport.currencies.kiosk.map(method => (
                        <span
                          key={method}
                          className={`px-3 py-1.5 rounded-full text-xs font-medium ${
                            ['Alipay', 'WeChat Pay'].includes(method)
                              ? 'bg-amber-50 text-amber-700'
                              : 'bg-[#F3F4F6] text-[#6B7280]'
                          }`}
                        >
                          {L(lang, PAYMENT_METHOD_LABELS[method] || method)}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* 운영사 */}
          {airport.operators && (
            <div className="p-3 rounded-lg bg-[#F9FAFB] border border-[#F0F0F0]">
              <p className="text-[10px] text-[#9CA3AF] mb-1">{L(lang, TEXTS.operatedBy)}</p>
              <p className="text-xs text-[#6B7280]">{airport.operators.join(', ')}</p>
            </div>
          )}
        </div>
      )}

      {/* 환급 절차 안내 */}
      <div className="mx-4 p-4 rounded-xl bg-blue-50 border border-blue-200 space-y-3">
        <p className="text-sm font-bold text-blue-900">{L(lang, TEXTS.procedure)}</p>
        <div className="space-y-2">
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center shrink-0 text-xs font-bold">
              1
            </div>
            <p className="text-sm text-blue-800">{L(lang, TEXTS.step1)}</p>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center shrink-0 text-xs font-bold">
              2
            </div>
            <p className="text-sm text-blue-800">{L(lang, TEXTS.step2)}</p>
          </div>
        </div>
      </div>

      {/* 경고 */}
      <div className="mx-4 p-4 rounded-xl bg-red-50 border border-red-200">
        <p className="text-sm font-bold text-red-700">{L(lang, TEXTS.warning)}</p>
      </div>

      {/* 메일박스만 운영하는 공항 (접힘 상태) */}
      {mailboxAirports.length > 0 && (
        <div className="mx-4">
          <button
            onClick={() => setExpandedMailbox(!expandedMailbox)}
            className="w-full flex items-center justify-between p-3 rounded-lg bg-[#F9FAFB] border border-[#E5E7EB] hover:bg-[#F3F4F6] transition-colors"
          >
            <div className="flex items-center gap-2">
              <Package size={14} className="text-[#6B7280]" />
              <span className="text-xs font-medium text-[#6B7280]">
                {L(lang, TEXTS.mailboxOnly)} ({mailboxAirports.length})
              </span>
            </div>
            <ChevronDown
              size={14}
              className={`text-[#9CA3AF] transition-transform ${expandedMailbox ? 'rotate-180' : ''}`}
            />
          </button>

          {expandedMailbox && (
            <div className="mt-2 space-y-2">
              {mailboxAirports.map(airport => (
                <div key={airport.id} className="p-3 rounded-lg border border-[#E5E7EB]">
                  <p className="text-sm font-semibold text-[#111827] mb-2">{L(lang, airport.airport)}</p>
                  <div className="space-y-1.5 text-xs text-[#6B7280]">
                    <div className="flex justify-between">
                      <span>{L(lang, TEXTS.mailbox)}</span>
                      <span className="text-[#111827]">{L(lang, airport.mailbox.location)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>시간</span>
                      <span className="text-[#111827]">{airport.mailbox.hours}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 주의 사항 */}
      <div className="mx-4 p-3 rounded-lg bg-[#F9FAFB] border border-[#F0F0F0]">
        <p className="text-[10px] text-[#9CA3AF]">
          ℹ️ {L(lang, TEXTS.note)}
        </p>
      </div>
    </div>
  )
}
