import { useState, useEffect, useRef } from "react";
import { tokens as T, font } from "./tokens";
/*
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 *  NEAR Booking — 고객용 예약 화면
 *  "신뢰감이 묻어나는 간결함. 하지만 분명함."
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 */
// ── Mock Data ──
const SHOP = { name: "르살롱 드 서울", nameCn: "首尔沙龙", rating: 4.8, reviews: 342, category: "Hair · Beauty" };
const SERVICES = [
  { id: 1, name: "女士剪发", nameKo: "여성 커트", duration: 60, price: 45000, priceCny: 230, popular: true },
  { id: 2, name: "男士剪发", nameKo: "남성 커트", duration: 40, price: 30000, priceCny: 155 },
  { id: 3, name: "染发", nameKo: "염색", duration: 120, price: 120000, priceCny: 620, popular: true },
  { id: 4, name: "烫发", nameKo: "펌", duration: 150, price: 150000, priceCny: 775 },
  { id: 5, name: "头皮护理", nameKo: "두피 케어", duration: 60, price: 80000, priceCny: 415 },
  { id: 6, name: "造型设计", nameKo: "스타일링", duration: 30, price: 25000, priceCny: 130 },
];
const TIME_SLOTS = [
  "10:00","10:30","11:00","11:30","13:00","13:30",
  "14:00","15:00","15:30","16:00","17:00","17:30",
  "18:00","19:00","19:30","20:00",
];
const UNAVAILABLE = new Set(["10:30","13:30","16:00","18:00"]);
const WEEKDAYS = ["日","一","二","三","四","五","六"];
const MONTH_NAMES = ["1月","2月","3月","4月","5月","6月","7月","8月","9月","10月","11月","12月"];
function genCal(y, m) {
  const f = new Date(y, m, 1).getDay(), c = new Date(y, m + 1, 0).getDate(), now = new Date();
  const days = [];
  for (let i = 0; i < f; i++) days.push(null);
  for (let d = 1; d <= c; d++) {
    const dt = new Date(y, m, d);
    days.push({ day: d, past: dt < new Date(now.getFullYear(), now.getMonth(), now.getDate()), today: d === now.getDate() && m === now.getMonth() && y === now.getFullYear() });
  }
  return days;
}
// ── Animated Check SVG ──
function AnimCheck({ size = 56, delay = 0 }) {
  const [show, setShow] = useState(false);
  useEffect(() => { const t = setTimeout(() => setShow(true), delay + 100); return () => clearTimeout(t); }, []);
  return (
    <div style={{ width: size, height: size, borderRadius: T.radius.full, background: T.color.primary, display: "flex", alignItems: "center", justifyContent: "center", transform: show ? "scale(1)" : "scale(0.3)", opacity: show ? 1 : 0, transition: `all ${T.motion.celebration} ${T.motion.spring}` }}>
      <svg width={size * 0.45} height={size * 0.45} viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"
        style={{ strokeDasharray: 30, strokeDashoffset: show ? 0 : 30, transition: `stroke-dashoffset 600ms ${T.motion.easeOut} ${delay + 200}ms` }}>
        <polyline points="4 12 10 18 20 6" />
      </svg>
    </div>
  );
}
// ── Skeleton shimmer ──
function Skeleton({ w = "100%", h = 16, r = T.radius.sm, style: sx }) {
  return <div style={{ width: w, height: h, borderRadius: r, background: `linear-gradient(90deg, #EBEBEB 25%, #F5F5F5 50%, #EBEBEB 75%)`, backgroundSize: "200% 100%", animation: "near-shimmer 1.5s ease-in-out infinite", ...sx }} />;
}
// ── Step indicator (dot-line) ──
function Steps({ current, labels }) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: `${T.space[5]}px ${T.space[8]}px`, gap: 0 }}>
      {labels.map((l, i) => (
        <div key={i} style={{ display: "flex", alignItems: "center", gap: T.space[2] }}>
          <div style={{
            width: 24, height: 24, borderRadius: T.radius.full,
            background: i <= current ? T.color.primary : T.color.bg,
            border: i <= current ? "none" : `1.5px solid ${T.color.borderStrong}`,
            color: i <= current ? T.color.white : T.color.text3,
            display: "flex", alignItems: "center", justifyContent: "center",
            ...font("micro"),
            transition: `all ${T.motion.normal} ${T.motion.ease}`,
            transform: i === current ? "scale(1.15)" : "scale(1)",
          }}>
            {i < current ? "✓" : i + 1}
          </div>
          <span style={{ ...font("caption"), color: i === current ? T.color.text1 : T.color.text3, fontWeight: i === current ? 600 : 400, transition: `all ${T.motion.normal} ${T.motion.ease}` }}>{l}</span>
          {i < labels.length - 1 && <div style={{ width: 24, height: 1.5, background: i < current ? T.color.primary : T.color.border, margin: `0 ${T.space[2]}px`, borderRadius: 1, transition: `background ${T.motion.normal} ${T.motion.ease}` }} />}
        </div>
      ))}
    </div>
  );
}
// ── Alipay icon ──
function AlipayIcon({ s = 20 }) {
  return <svg width={s} height={s} viewBox="0 0 48 48" fill="none"><rect width="48" height="48" rx="8" fill="#C4725A"/><path d="M35.5 28.2c-2.8-1.2-6.2-2.6-8.2-3.4 1.4-2.2 2.5-4.8 3.1-7.6H24v-2.8h8V12h-8V8h-3v4h-8v2.4h8v2.8H14v2.4h12.6c-.5 2-1.4 3.9-2.5 5.5-2.8-.8-5.8-1.2-8.1-.6-4.2 1.1-5.8 4.5-4.8 7.2 1 2.7 4.2 4.1 7.6 2.4 2.2-1.1 4.2-3.2 5.8-5.8 3 1.3 7.8 3.4 10.9 4.8V28.2zM17.2 34.4c-2.4 1-4.2.2-4.8-1.2-.6-1.4.2-3.4 2.6-4 1.6-.4 3.6-.1 5.6.5-1 1.8-2.1 3.5-3.4 4.7z" fill="white"/></svg>;
}
// ── Main Component ──
export default function NEARBooking() {
  const [step, setStep] = useState(0);
  const [sels, setSels] = useState([]);
  const [date, setDate] = useState(null);
  const [time, setTime] = useState(null);
  const [calM, setCalM] = useState(new Date().getMonth());
  const [calY, setCalY] = useState(new Date().getFullYear());
  const [pay, setPay] = useState("alipay");
  const [loading, setLoading] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [done, setDone] = useState(false);
  const [vis, setVis] = useState(false);
  useEffect(() => { setVis(false); requestAnimationFrame(() => requestAnimationFrame(() => setVis(true))); }, [step, done]);
  // Simulate initial load
  useEffect(() => { setLoading(true); const t = setTimeout(() => setLoading(false), 800); return () => clearTimeout(t); }, []);
  const total = sels.reduce((s, id) => s + SERVICES.find(v => v.id === id).price, 0);
  const totalCny = sels.reduce((s, id) => s + SERVICES.find(v => v.id === id).priceCny, 0);
  const dur = sels.reduce((s, id) => s + SERVICES.find(v => v.id === id).duration, 0);
  const dep = Math.ceil(totalCny * 0.3);
  const depK = Math.ceil(total * 0.3);
  const rem = totalCny - dep;
  const toggle = id => setSels(p => p.includes(id) ? p.filter(x => x !== id) : [...p, id]);
  const calDays = genCal(calY, calM);
  const nextM = () => { if (calM === 11) { setCalM(0); setCalY(y => y + 1); } else setCalM(m => m + 1); };
  const prevM = () => { const n = new Date(); if (calY === n.getFullYear() && calM === n.getMonth()) return; if (calM === 0) { setCalM(11); setCalY(y => y - 1); } else setCalM(m => m - 1); };
  const handlePay = () => {
    setProcessing(true);
    setTimeout(() => { setProcessing(false); setDone(true); }, 2400);
  };
  const canNext = (step === 0 && sels.length > 0) || (step === 1 && date && time) || step === 2;
  // ── Processing ──
  if (processing) {
    return (
      <div style={base}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "80vh", gap: T.space[5] }}>
          <AlipayIcon s={40} />
          <div style={{ width: 36, height: 36, border: `3px solid ${T.color.primarySoft}`, borderTop: `3px solid ${T.color.primary}`, borderRadius: T.radius.full, animation: "near-spin 0.8s linear infinite" }} />
          <div style={{ textAlign: "center" }}>
            <p style={{ ...font("h3"), color: T.color.text1, margin: 0 }}>正在处理支付...</p>
            <p style={{ ...font("caption"), color: T.color.text3, margin: `${T.space[1]}px 0 0` }}>Processing payment</p>
          </div>
          <div style={{ padding: T.space[4], background: T.color.primarySoft, borderRadius: T.radius.md, minWidth: 200 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ ...font("caption"), color: T.color.text2 }}>保证金</span>
              <span style={{ ...font("h2"), color: T.color.primary }}>¥{dep}</span>
            </div>
          </div>
        </div>
      </div>
    );
  }
  // ── Done ──
  if (done) {
    return (
      <div style={base}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: `${T.space[12]}px ${T.space[6]}px`, opacity: vis ? 1 : 0, transform: vis ? "translateY(0)" : "translateY(16px)", transition: `all ${T.motion.slow} ${T.motion.easeOut}` }}>
          <AnimCheck />
          <h2 style={{ ...font("h1"), color: T.color.text1, margin: `${T.space[5]}px 0 0` }}>预约成功</h2>
          <p style={{ ...font("caption"), color: T.color.text3, margin: `${T.space[1]}px 0 ${T.space[6]}px` }}>예약이 완료되었습니다</p>
          <div style={{ ...cardStyle, width: "100%" }}>
            <InfoRow label="店铺" value={SHOP.nameCn} />
            <Divider />
            <InfoRow label="日期" value={`${calY}.${calM+1}.${date} ${time}`} />
            <Divider />
            <InfoRow label="服务" value={sels.map(id => SERVICES.find(s=>s.id===id).name).join("、")} />
            <Divider />
            <div style={{ padding: `${T.space[4]}px 0` }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ ...font("caption"), color: T.color.primary, fontWeight: 600 }}>已支付保证金</span>
                <span style={{ ...font("h2"), color: T.color.primary }}>¥{dep}</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: T.space[1], marginTop: T.space[2] }}>
                <AlipayIcon s={14} />
                <span style={{ ...font("micro"), color: T.color.text3 }}>支付宝已扣款 · 알리페이 결제완료</span>
              </div>
            </div>
            <Divider />
            <InfoRow label="到店支付 · 현장결제" value={`¥${rem} / ₩${(total - depK).toLocaleString()}`} />
            <Divider />
            <InfoRow label="总计 · 합계" value={`¥${totalCny} / ₩${total.toLocaleString()}`} bold />
          </div>
          {/* Refund policy */}
          <div style={{ width: "100%", marginTop: T.space[4], padding: T.space[4], background: T.color.bg, borderRadius: T.radius.md }}>
            <p style={{ ...font("micro"), color: T.color.text2, fontWeight: 600, margin: `0 0 ${T.space[2]}px` }}>退款政策 · 환불 정책</p>
            {[
              { c: T.color.success, t: "24h前 → 全额退款 · 전액 환불" },
              { c: T.color.warning, t: "24h内 → 退50% · 50% 환불" },
              { c: T.color.error, t: "No-show → 不退 · 환불 불가" },
            ].map((r, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: T.space[2], marginBottom: 2 }}>
                <div style={{ width: 5, height: 5, borderRadius: T.radius.full, background: r.c, flexShrink: 0 }} />
                <span style={{ ...font("micro"), color: T.color.text2 }}>{r.t}</span>
              </div>
            ))}
          </div>
          <div style={{ display: "flex", gap: T.space[3], marginTop: T.space[6], width: "100%" }}>
            <button onClick={() => { setDone(false); setStep(0); setSels([]); setDate(null); setTime(null); }} style={{ ...btnBase, flex: 1, background: T.color.primary, color: T.color.white }}>返回首页</button>
            <button style={{ ...btnBase, flex: 1, background: T.color.card, color: T.color.text1, border: `1px solid ${T.color.borderStrong}` }}>我的预约</button>
          </div>
        </div>
      </div>
    );
  }
  // ── Main ──
  return (
    <div style={base}>
      {/* Header — glass effect */}
      <div style={{ position: "sticky", top: 0, zIndex: 50, background: "rgba(255,255,255,0.85)", backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)", borderBottom: `1px solid ${T.color.border}`, padding: `${T.space[3]}px ${T.space[5]}px`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ display: "flex", alignItems: "center", gap: T.space[3] }}>
          <span style={{ ...font("body"), cursor: "pointer", color: T.color.text2 }}>←</span>
          <span style={{ ...font("h3"), color: T.color.text1 }}>预约</span>
        </div>
        <span style={{ ...font("micro"), fontWeight: 800, letterSpacing: 1.2, color: T.color.text3 }}>NEAR</span>
      </div>
      {/* Shop — minimal */}
      <div style={{ padding: `${T.space[5]}px ${T.space[5]}px ${T.space[4]}px`, borderBottom: `1px solid ${T.color.border}` }}>
        {loading ? (
          <div style={{ display: "flex", gap: T.space[3] }}>
            <Skeleton w={56} h={56} r={T.radius.md} />
            <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: T.space[2] }}>
              <Skeleton h={18} w="60%" />
              <Skeleton h={13} w="40%" />
              <Skeleton h={13} w="30%" />
            </div>
          </div>
        ) : (
          <div style={{ display: "flex", gap: T.space[3] }}>
            <div style={{ width: 56, height: 56, borderRadius: T.radius.md, background: T.color.bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, flexShrink: 0 }}>✂</div>
            <div>
              <h2 style={{ ...font("h2"), color: T.color.text1, margin: 0 }}>{SHOP.nameCn}</h2>
              <p style={{ ...font("caption"), color: T.color.text3, margin: `2px 0 ${T.space[1]}px` }}>{SHOP.name}</p>
              <div style={{ display: "flex", alignItems: "center", gap: T.space[1] }}>
                <span style={{ ...font("caption"), fontWeight: 600, color: T.color.text1 }}>★ {SHOP.rating}</span>
                <span style={{ ...font("caption"), color: T.color.text3 }}>({SHOP.reviews})</span>
                <span style={{ ...font("caption"), color: T.color.text4 }}>·</span>
                <span style={{ ...font("caption"), color: T.color.text3 }}>{SHOP.category}</span>
              </div>
            </div>
          </div>
        )}
      </div>
      {/* Steps */}
      <Steps current={step} labels={["服务", "时间", "支付"]} />
      {/* Content — fade transition */}
      <div style={{ padding: `0 ${T.space[5]}px ${T.space[12] + T.space[8]}px`, opacity: vis ? 1 : 0, transform: vis ? "translateY(0)" : "translateY(8px)", transition: `all ${T.motion.normal} ${T.motion.easeOut}` }}>
        {/* ── Step 0: Service ── */}
        {step === 0 && (
          <div>
            <SectionTitle cn="选择服务" ko="서비스 선택" />
            {loading ? (
              <div style={{ display: "flex", flexDirection: "column", gap: T.space[3] }}>
                {[1,2,3,4].map(i => <Skeleton key={i} h={72} r={T.radius.md} />)}
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: T.space[2] }}>
                {SERVICES.map(sv => {
                  const on = sels.includes(sv.id);
                  return (
                    <div key={sv.id} onClick={() => toggle(sv.id)}
                      style={{
                        display: "flex", justifyContent: "space-between", alignItems: "center",
                        padding: `${T.space[4]}px`, borderRadius: T.radius.md,
                        border: `1.5px solid ${on ? T.color.primary : T.color.border}`,
                        background: on ? T.color.primarySoft : T.color.card,
                        cursor: "pointer",
                        transition: `all ${T.motion.fast} ${T.motion.ease}`,
                        transform: on ? "scale(1)" : "scale(1)",
                      }}>
                      <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: T.space[2] }}>
                          <span style={{ ...font("body"), fontWeight: 600, color: T.color.text1 }}>{sv.name}</span>
                          {sv.popular && <span style={{ ...font("micro"), color: T.color.error, background: T.color.errorSoft, padding: "1px 6px", borderRadius: T.radius.sm }}>HOT</span>}
                        </div>
                        <span style={{ ...font("caption"), color: T.color.text3 }}>{sv.nameKo} · {sv.duration}min</span>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: T.space[3] }}>
                        <div style={{ textAlign: "right" }}>
                          <span style={{ ...font("body"), fontWeight: 700, color: T.color.text1 }}>¥{sv.priceCny}</span>
                          <br /><span style={{ ...font("micro"), color: T.color.text3 }}>₩{sv.price.toLocaleString()}</span>
                        </div>
                        <div style={{
                          width: 20, height: 20, borderRadius: T.radius.sm,
                          border: `1.5px solid ${on ? T.color.primary : T.color.borderStrong}`,
                          background: on ? T.color.primary : "transparent",
                          display: "flex", alignItems: "center", justifyContent: "center",
                          transition: `all ${T.motion.instant} ${T.motion.ease}`,
                        }}>
                          {on && <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round"><polyline points="4 12 10 18 20 6"/></svg>}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
        {/* ── Step 1: Date & Time ── */}
        {step === 1 && (
          <div>
            <SectionTitle cn="选择日期" ko="날짜 선택" />
            <div style={{ ...cardStyle, padding: T.space[4] }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: T.space[4] }}>
                <button onClick={prevM} style={calNavBtn}>‹</button>
                <span style={{ ...font("h3"), color: T.color.text1 }}>{calY}年 {MONTH_NAMES[calM]}</span>
                <button onClick={nextM} style={calNavBtn}>›</button>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 0, marginBottom: T.space[2] }}>
                {WEEKDAYS.map(w => <div key={w} style={{ ...font("micro"), color: T.color.text3, textAlign: "center", padding: T.space[1] }}>{w}</div>)}
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 2 }}>
                {calDays.map((d, i) => {
                  const sel = date === d?.day;
                  return (
                    <div key={i} onClick={() => d && !d.past && setDate(d.day)}
                      style={{
                        ...font("caption"), fontWeight: d?.today ? 700 : 400,
                        textAlign: "center", padding: `${T.space[2]}px 0`, borderRadius: T.radius.sm,
                        color: !d ? "transparent" : d.past ? T.color.text4 : sel ? T.color.white : T.color.text1,
                        background: sel ? T.color.primary : d?.today ? T.color.bg : "transparent",
                        cursor: d && !d.past ? "pointer" : "default",
                        transition: `all ${T.motion.instant} ${T.motion.ease}`,
                      }}>
                      {d?.day || ""}
                    </div>
                  );
                })}
              </div>
            </div>
            {date && (
              <div style={{ marginTop: T.space[6] }}>
                <SectionTitle cn="选择时间" ko="시간 선택" />
                <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: T.space[2] }}>
                  {TIME_SLOTS.map(s => {
                    const off = UNAVAILABLE.has(s);
                    const sel = time === s;
                    return (
                      <button key={s} disabled={off} onClick={() => setTime(s)}
                        style={{
                          ...font("caption"), fontWeight: 500,
                          padding: `${T.space[3]}px 0`, borderRadius: T.radius.sm,
                          border: `1.5px solid ${sel ? T.color.primary : off ? "transparent" : T.color.border}`,
                          background: sel ? T.color.primary : off ? T.color.bg : T.color.card,
                          color: sel ? T.color.white : off ? T.color.text4 : T.color.text1,
                          cursor: off ? "not-allowed" : "pointer",
                          transition: `all ${T.motion.instant} ${T.motion.ease}`,
                        }}>
                        {s}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}
        {/* ── Step 2: Confirm + Pay ── */}
        {step === 2 && (
          <div>
            <SectionTitle cn="确认预约" ko="예약 확인" />
            <div style={cardStyle}>
              <ConfRow label="店铺 · 매장" value={`${SHOP.nameCn} (${SHOP.name})`} />
              <Divider />
              <ConfRow label="日期 · 날짜" value={`${calY}.${calM+1}.${date} (${WEEKDAYS[new Date(calY,calM,date).getDay()]})`} />
              <Divider />
              <ConfRow label="时间 · 시간" value={`${time} ~ 约${dur}min`} />
              <Divider />
              <div style={{ padding: `${T.space[3]}px 0` }}>
                <span style={{ ...font("micro"), color: T.color.text3 }}>服务 · 서비스</span>
                <div style={{ marginTop: T.space[2] }}>
                  {sels.map(id => { const sv = SERVICES.find(s=>s.id===id); return (
                    <div key={id} style={{ display: "flex", justifyContent: "space-between", ...font("caption"), marginBottom: 3 }}>
                      <span style={{ color: T.color.text2 }}>{sv.name} ({sv.nameKo})</span>
                      <span style={{ color: T.color.text1, fontWeight: 500 }}>¥{sv.priceCny}</span>
                    </div>
                  ); })}
                </div>
              </div>
              <Divider />
              <div style={{ padding: `${T.space[3]}px 0` }}>
                <span style={{ ...font("micro"), color: T.color.text3 }}>总计 · 합계</span>
                <div style={{ marginTop: T.space[1] }}>
                  <span style={{ ...font("h1"), color: T.color.text1 }}>¥{totalCny}</span>
                  <span style={{ ...font("caption"), color: T.color.text3, marginLeft: T.space[2] }}>₩{total.toLocaleString()}</span>
                </div>
              </div>
            </div>
            {/* Deposit */}
            <div style={{ marginTop: T.space[5] }}>
              <SectionTitle cn="支付明细" ko="결제 내역" />
              <p style={{ ...font("caption"), color: T.color.text3, margin: `${-T.space[2]}px 0 ${T.space[3]}px` }}>30%保证金先付，余额到店支付</p>
              <div style={{ border: `1.5px solid ${T.color.primary}`, borderRadius: T.radius.md, overflow: "hidden" }}>
                <div style={{ padding: `${T.space[4]}px`, background: T.color.primarySoft }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: T.space[2] }}>
                      <span style={{ ...font("micro"), fontWeight: 700, color: T.color.primary, background: T.color.card, padding: "2px 8px", borderRadius: T.radius.sm }}>立即支付</span>
                      <span style={{ ...font("caption"), fontWeight: 500, color: T.color.text1 }}>保证金</span>
                    </div>
                    <span style={{ ...font("h1"), color: T.color.primary }}>¥{dep}</span>
                  </div>
                </div>
                <div style={{ height: 1, background: T.color.border }} />
                <div style={{ padding: `${T.space[4]}px`, background: T.color.card }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: T.space[2] }}>
                      <span style={{ ...font("micro"), fontWeight: 700, color: T.color.text3, background: T.color.bg, padding: "2px 8px", borderRadius: T.radius.sm }}>到店支付</span>
                      <span style={{ ...font("caption"), fontWeight: 500, color: T.color.text2 }}>余额</span>
                    </div>
                    <span style={{ ...font("h2"), color: T.color.text3 }}>¥{rem}</span>
                  </div>
                </div>
              </div>
            </div>
            {/* Payment method */}
            <div style={{ marginTop: T.space[5] }}>
              <SectionTitle cn="支付方式" ko="결제 수단" />
              <div style={{ display: "flex", gap: T.space[2] }}>
                {[
                  { id: "alipay", label: "支付宝", icon: <AlipayIcon s={22} /> },
                  { id: "wechat", label: "微信", icon: <span style={{ fontSize: 18 }}>💬</span> },
                  { id: "card", label: "Card", icon: <span style={{ fontSize: 18 }}>💳</span> },
                ].map(pm => (
                  <div key={pm.id} onClick={() => setPay(pm.id)}
                    style={{
                      flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: T.space[1],
                      padding: `${T.space[3]}px 0`, borderRadius: T.radius.md,
                      border: `1.5px solid ${pay === pm.id ? T.color.primary : T.color.border}`,
                      background: pay === pm.id ? T.color.primarySoft : T.color.card,
                      cursor: "pointer",
                      transition: `all ${T.motion.fast} ${T.motion.ease}`,
                    }}>
                    {pm.icon}
                    <span style={{ ...font("micro"), color: pay === pm.id ? T.color.primary : T.color.text2, fontWeight: pay === pm.id ? 700 : 400 }}>{pm.label}</span>
                  </div>
                ))}
              </div>
            </div>
            {/* Notice */}
            <div style={{ marginTop: T.space[5], padding: T.space[4], background: T.color.bg, borderRadius: T.radius.md }}>
              <p style={{ ...font("micro"), color: T.color.text3, margin: "2px 0" }}>· 到店可用现金/卡/支付宝支付余额</p>
              <p style={{ ...font("micro"), color: T.color.text3, margin: "2px 0" }}>· 잔금은 매장에서 현금/카드/알리페이로 결제</p>
              <p style={{ ...font("micro"), color: T.color.text3, margin: "2px 0" }}>· 迟到15分钟以上预约可能被取消</p>
            </div>
          </div>
        )}
      </div>
      {/* ── Bottom Bar ── */}
      <div style={{
        position: "fixed", bottom: 0, left: "50%", transform: "translateX(-50%)",
        width: "100%", maxWidth: 420,
        padding: `${T.space[3]}px ${T.space[5]}px`,
        paddingBottom: `max(${T.space[3]}px, env(safe-area-inset-bottom))`,
        background: "rgba(255,255,255,0.92)", backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)",
        borderTop: `1px solid ${T.color.border}`,
        display: "flex", justifyContent: "space-between", alignItems: "center",
        zIndex: 50, boxSizing: "border-box",
      }}>
        <div>
          {sels.length > 0 && step < 2 && (
            <>
              <span style={{ ...font("h2"), color: T.color.text1 }}>¥{totalCny}</span>
              <br /><span style={{ ...font("micro"), color: T.color.text3 }}>{sels.length}项 · 约{dur}min</span>
            </>
          )}
          {sels.length > 0 && step === 2 && (
            <>
              <div style={{ display: "flex", alignItems: "baseline", gap: T.space[1] }}>
                <span style={{ ...font("micro"), color: T.color.primary, fontWeight: 600 }}>保证金</span>
                <span style={{ ...font("h2"), color: T.color.primary }}>¥{dep}</span>
              </div>
              <span style={{ ...font("micro"), color: T.color.text3 }}>总计¥{totalCny}的30%</span>
            </>
          )}
        </div>
        <div style={{ display: "flex", gap: T.space[2] }}>
          {step > 0 && <button onClick={() => setStep(s => s - 1)} style={{ ...btnBase, background: T.color.card, color: T.color.text2, border: `1px solid ${T.color.borderStrong}` }}>上一步</button>}
          {step < 2 ? (
            <button onClick={() => canNext && setStep(s => s + 1)} disabled={!canNext}
              style={{
                ...btnBase, minWidth: 100,
                background: canNext ? T.color.primary : T.color.bg,
                color: canNext ? T.color.white : T.color.text4,
                transition: `all ${T.motion.fast} ${T.motion.ease}`,
              }}>
              下一步
            </button>
          ) : (
            <button onClick={handlePay}
              style={{ ...btnBase, background: T.color.primary, color: T.color.white, display: "flex", alignItems: "center", gap: T.space[2] }}>
              <AlipayIcon s={16} />
              <span>支付 ¥{dep}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
// ── Sub-components ──
function SectionTitle({ cn, ko }) {
  return <h3 style={{ ...font("h3"), color: T.color.text1, margin: `0 0 ${T.space[3]}px` }}>{cn} <span style={{ ...font("caption"), fontWeight: 400, color: T.color.text3, marginLeft: T.space[1] }}>{ko}</span></h3>;
}
function Divider() { return <div style={{ height: 1, background: T.color.border }} />; }
function InfoRow({ label, value, bold }) {
  return <div style={{ display: "flex", justifyContent: "space-between", padding: `${T.space[3]}px 0` }}>
    <span style={{ ...font("micro"), color: T.color.text3 }}>{label}</span>
    <span style={{ ...font("caption"), fontWeight: bold ? 600 : 400, color: T.color.text1, textAlign: "right", maxWidth: "65%" }}>{value}</span>
  </div>;
}
function ConfRow({ label, value }) {
  return <div style={{ padding: `${T.space[3]}px 0` }}>
    <span style={{ ...font("micro"), color: T.color.text3, display: "block", marginBottom: 2 }}>{label}</span>
    <span style={{ ...font("body"), fontWeight: 500, color: T.color.text1 }}>{value}</span>
  </div>;
}
// ── Shared styles ──
const base = {
  maxWidth: 420, margin: "0 auto", background: T.color.card, minHeight: "100vh",
  fontFamily: T.font.family, color: T.color.text1,
  WebkitFontSmoothing: "antialiased", MozOsxFontSmoothing: "grayscale",
};
const cardStyle = {
  background: T.color.card, borderRadius: T.radius.md,
  border: `1px solid ${T.color.border}`, padding: `0 ${T.space[4]}px`,
  boxShadow: T.shadow.sm,
};
const btnBase = {
  padding: `${T.space[3]}px ${T.space[5]}px`,
  borderRadius: T.radius.md, border: "none",
  ...font("caption"), fontWeight: 600,
  cursor: "pointer", fontFamily: T.font.family,
  WebkitTapHighlightColor: "transparent",
  touchAction: "manipulation",
};
const calNavBtn = {
  background: "none", border: "none", fontSize: 20, cursor: "pointer",
  color: T.color.text2, padding: `${T.space[1]}px ${T.space[3]}px`,
  WebkitTapHighlightColor: "transparent",
};
// ── CSS injection ──
if (typeof document !== 'undefined' && !document.getElementById('near-ds')) {
  const s = document.createElement("style");
  s.id = 'near-ds';
  s.textContent = `
    @keyframes near-spin { to { transform: rotate(360deg); } }
    @keyframes near-shimmer { 0% { background-position: -200% 0; } 100% { background-position: 200% 0; } }
    * { box-sizing: border-box; }
    button:active { transform: scale(0.98); transition: transform 100ms cubic-bezier(0.4, 0, 0.2, 1); }
    @media (prefers-reduced-motion: reduce) { *, *::before, *::after { animation-duration: 0.01ms !important; transition-duration: 0.01ms !important; } }
  `;
  document.head.appendChild(s);
}
