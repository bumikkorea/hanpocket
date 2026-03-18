import { useState, useEffect } from "react";
import { tokens as T, font as f } from "./tokens";
/*
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 *  NEAR Admin Dashboard — 사장님 관리 화면
 *  Brand: #C4725A (Terracotta)
 *  "신뢰감이 묻어나는 간결함. 하지만 분명함."
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 */
// ── Mock Data ──
const TODAY = new Date();
const STYLISTS = [
  { id: 1, name: "김수진", color: "#C4725A" },
  { id: 2, name: "박민호", color: "#5A8FC4" },
  { id: 3, name: "이하은", color: "#6B9E5E" },
];
const STATUS = {
  pending:   { label: "대기", bg: T.color.warningSoft, color: T.color.warning, border: "rgba(255,143,31,0.2)" },
  confirmed: { label: "확정", bg: T.color.successSoft, color: T.color.success, border: "rgba(0,181,120,0.2)" },
  completed: { label: "완료", bg: T.color.bg, color: T.color.text3, border: T.color.border },
  cancelled: { label: "취소", bg: T.color.errorSoft, color: T.color.error, border: "rgba(255,49,65,0.2)" },
  noshow:    { label: "노쇼", bg: "rgba(255,49,65,0.12)", color: "#C62828", border: "rgba(255,49,65,0.3)" },
};
const LANG = { ZH: "🇨🇳", JA: "🇯🇵", EN: "🇺🇸" };
const BOOKINGS = [
  { id: "N-0318-001", name: "王小明", nameEn: "Wang Xiaoming", phone: "+86 138****5521", service: "여성 커트", serviceCn: "女士剪发", stylist: 1, time: "10:00", dur: 60, price: 45000, cny: 230, dep: 69, status: "confirmed", lang: "ZH", note: "첫 방문" },
  { id: "N-0318-002", name: "田中花子", nameEn: "Tanaka Hanako", phone: "+81 90****3312", service: "염색", serviceCn: "染发", stylist: 3, time: "11:00", dur: 120, price: 120000, cny: 620, dep: 186, status: "pending", lang: "JA", note: "" },
  { id: "N-0318-003", name: "李美玲", nameEn: "Li Meiling", phone: "+86 159****8843", service: "펌", serviceCn: "烫发", stylist: 2, time: "13:00", dur: 150, price: 150000, cny: 775, dep: 233, status: "confirmed", lang: "ZH", note: "알레르기 확인" },
  { id: "N-0318-004", name: "Sarah Kim", nameEn: "Sarah Kim", phone: "+1 310****7729", service: "여성 커트", serviceCn: "女士剪发", stylist: 1, time: "14:00", dur: 60, price: 45000, cny: 230, dep: 69, status: "pending", lang: "EN", note: "" },
  { id: "N-0318-005", name: "陈伟", nameEn: "Chen Wei", phone: "+86 186****2201", service: "남성 커트", serviceCn: "男士剪发", stylist: 2, time: "15:30", dur: 40, price: 30000, cny: 155, dep: 47, status: "confirmed", lang: "ZH", note: "" },
  { id: "N-0318-006", name: "木村太郎", nameEn: "Kimura Taro", phone: "+81 80****1198", service: "스타일링", serviceCn: "造型设计", stylist: 1, time: "17:00", dur: 30, price: 25000, cny: 130, dep: 39, status: "confirmed", lang: "JA", note: "" },
  { id: "N-0318-007", name: "张丽", nameEn: "Zhang Li", phone: "+86 135****9910", service: "두피 케어", serviceCn: "头皮护理", stylist: 3, time: "18:00", dur: 60, price: 80000, cny: 415, dep: 125, status: "confirmed", lang: "ZH", note: "" },
];
const STATS = { bookings: 47, done: 38, cancel: 4, noshow: 2, rev: 3850000, dep: 5970, fee: 385000, pay: 3465000 };
const TABS = ["오늘 예약", "캘린더", "고객", "정산"];
const HOURS = ["09:00","09:30","10:00","10:30","11:00","11:30","12:00","12:30","13:00","13:30","14:00","14:30","15:00","15:30","16:00","16:30","17:00","17:30","18:00","18:30","19:00","19:30","20:00"];
// ── Skeleton ──
function Skel({ w = "100%", h = 16, r = T.radius.sm }) {
  return <div style={{ width: w, height: h, borderRadius: r, background: "linear-gradient(90deg,#EBEBEB 25%,#F5F5F5 50%,#EBEBEB 75%)", backgroundSize: "200% 100%", animation: "near-shimmer 1.5s ease-in-out infinite" }} />;
}
// ── AnimCheck ──
function AnimCheck({ size = 48, color = T.color.success }) {
  const [s, setS] = useState(false);
  useEffect(() => { const t = setTimeout(() => setS(true), 100); return () => clearTimeout(t); }, []);
  return (
    <div style={{ width: size, height: size, borderRadius: T.radius.full, background: color, display: "flex", alignItems: "center", justifyContent: "center", transform: s ? "scale(1)" : "scale(0.3)", opacity: s ? 1 : 0, transition: `all ${T.motion.celebration} ${T.motion.spring}` }}>
      <svg width={size*0.45} height={size*0.45} viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" style={{ strokeDasharray: 30, strokeDashoffset: s ? 0 : 30, transition: `stroke-dashoffset 600ms ${T.motion.easeOut} 200ms` }}><polyline points="4 12 10 18 20 6"/></svg>
    </div>
  );
}
export default function AdminDashboard() {
  const [tab, setTab] = useState(0);
  const [bks, setBks] = useState(BOOKINGS);
  const [sel, setSel] = useState(null);
  const [vis, setVis] = useState(false);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  useEffect(() => { const t = setTimeout(() => setLoading(false), 600); return () => clearTimeout(t); }, []);
  useEffect(() => { setVis(false); requestAnimationFrame(() => requestAnimationFrame(() => setVis(true))); }, [tab]);
  const pending = bks.filter(b => b.status === "pending").length;
  const confirmed = bks.filter(b => b.status === "confirmed").length;
  const todayRev = bks.filter(b => b.status !== "cancelled").reduce((s, b) => s + b.price, 0);
  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(null), 2500); };
  const updateStatus = (id, status) => {
    setBks(p => p.map(b => b.id === id ? { ...b, status } : b));
    setSel(null);
    const labels = { confirmed: "승인되었습니다", cancelled: "거절되었습니다", completed: "완료 처리되었습니다", noshow: "노쇼 처리되었습니다" };
    showToast(labels[status]);
  };
  return (
    <div style={{ maxWidth: 800, margin: "0 auto", background: T.color.bg, minHeight: "100vh", fontFamily: T.font.family, color: T.color.text1, WebkitFontSmoothing: "antialiased" }}>
      {/* ── Header ── */}
      <div style={{ background: T.color.card, borderBottom: `1px solid ${T.color.border}`, padding: `${T.space[3]}px ${T.space[5]}px`, display: "flex", justifyContent: "space-between", alignItems: "center", position: "sticky", top: 0, zIndex: 50, backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: T.space[2] }}>
          <div style={{ width: 28, height: 28, borderRadius: T.radius.sm, background: T.color.primary, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <span style={{ ...f("micro"), color: T.color.white, fontWeight: 800, letterSpacing: 0.5 }}>N</span>
          </div>
          <div>
            <span style={{ ...f("h3"), color: T.color.text1 }}>사장님 관리</span>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: T.space[2] }}>
          <span style={{ ...f("caption"), color: T.color.text2 }}>르살롱 드 서울</span>
          <div style={{ width: 7, height: 7, borderRadius: T.radius.full, background: T.color.success }} />
        </div>
      </div>
      {/* ── Stats Bar ── */}
      <div style={{ background: T.color.card, borderBottom: `1px solid ${T.color.border}`, padding: `${T.space[4]}px ${T.space[5]}px`, display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: T.space[2] }}>
        {loading ? [1,2,3,4].map(i => <div key={i} style={{ textAlign: "center" }}><Skel h={12} w="50%" /><Skel h={24} w="60%" /></div>) : [
          { label: "오늘 예약", value: bks.length, unit: "건", color: T.color.text1 },
          { label: "대기 중", value: pending, unit: "건", color: pending > 0 ? T.color.warning : T.color.text3 },
          { label: "확정", value: confirmed, unit: "건", color: T.color.success },
          { label: "오늘 매출", value: `${(todayRev/10000).toFixed(0)}`, unit: "만", color: T.color.text1 },
        ].map((s, i) => (
          <div key={i} style={{ textAlign: "center" }}>
            <span style={{ ...f("micro"), color: T.color.text3 }}>{s.label}</span>
            <div style={{ marginTop: 2 }}>
              <span style={{ ...f("h1"), color: s.color }}>{s.value}</span>
              <span style={{ ...f("caption"), color: T.color.text3, marginLeft: 1 }}>{s.unit}</span>
            </div>
          </div>
        ))}
      </div>
      {/* ── Pending Alert ── */}
      {pending > 0 && (
        <div style={{ margin: `${T.space[3]}px ${T.space[5]}px 0`, padding: `${T.space[3]}px ${T.space[4]}px`, background: T.color.warningSoft, borderRadius: T.radius.md, display: "flex", alignItems: "center", gap: T.space[2], border: `1px solid rgba(255,143,31,0.15)` }}>
          <div style={{ width: 6, height: 6, borderRadius: T.radius.full, background: T.color.warning, animation: "near-pulse 1.5s infinite" }} />
          <span style={{ ...f("caption"), color: T.color.warning, fontWeight: 500, flex: 1 }}>새 예약 {pending}건 승인 대기 중</span>
          <button onClick={() => setTab(0)} style={{ ...f("micro"), fontWeight: 700, color: T.color.warning, background: "rgba(255,143,31,0.12)", border: "none", padding: "4px 10px", borderRadius: T.radius.sm, cursor: "pointer", fontFamily: T.font.family }}>확인</button>
        </div>
      )}
      {/* ── Tabs ── */}
      <div style={{ display: "flex", background: T.color.card, borderBottom: `1px solid ${T.color.border}`, margin: `${T.space[3]}px 0 0`, padding: `0 ${T.space[5]}px` }}>
        {TABS.map((t, i) => (
          <button key={i} onClick={() => setTab(i)} style={{
            flex: 1, padding: `${T.space[3]}px 0`, background: "none",
            border: "none", borderBottom: `2px solid ${tab === i ? T.color.primary : "transparent"}`,
            ...f("caption"), fontWeight: tab === i ? 700 : 400,
            color: tab === i ? T.color.primary : T.color.text3,
            cursor: "pointer", fontFamily: T.font.family, position: "relative",
            transition: `all ${T.motion.fast} ${T.motion.ease}`,
          }}>
            {t}
            {i === 0 && pending > 0 && <span style={{ position: "absolute", top: 6, right: "calc(50% - 22px)", ...f("micro"), fontWeight: 700, background: T.color.error, color: T.color.white, borderRadius: T.radius.full, padding: "1px 5px", minWidth: 14, textAlign: "center" }}>{pending}</span>}
          </button>
        ))}
      </div>
      {/* ── Content ── */}
      <div style={{ padding: T.space[5], opacity: vis ? 1 : 0, transform: vis ? "translateY(0)" : "translateY(8px)", transition: `all ${T.motion.normal} ${T.motion.easeOut}` }}>
        {/* ═══ Tab 0: 오늘 예약 ═══ */}
        {tab === 0 && (
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: T.space[4] }}>
              <h3 style={{ ...f("h2"), margin: 0 }}>{TODAY.getMonth()+1}월 {TODAY.getDate()}일</h3>
              <span style={{ ...f("caption"), color: T.color.text3 }}>{bks.length}건</span>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: T.space[2] }}>
              {loading ? [1,2,3,4].map(i => <Skel key={i} h={80} r={T.radius.md} />) :
              bks.sort((a,b) => a.time.localeCompare(b.time)).map(bk => {
                const st = STATUS[bk.status];
                const sty = STYLISTS.find(s => s.id === bk.stylist);
                return (
                  <div key={bk.id} onClick={() => setSel(bk)} style={{
                    background: T.color.card, borderRadius: T.radius.md, padding: T.space[4],
                    border: `1px solid ${bk.status === "pending" ? "rgba(255,143,31,0.2)" : T.color.border}`,
                    boxShadow: T.shadow.sm, cursor: "pointer",
                    transition: `all ${T.motion.fast} ${T.motion.ease}`,
                  }}>
                    <div style={{ display: "flex", gap: T.space[3] }}>
                      {/* Time */}
                      <div style={{ minWidth: 44, flexShrink: 0 }}>
                        <span style={{ ...f("h3"), color: T.color.text1 }}>{bk.time}</span>
                        <br/><span style={{ ...f("micro"), color: T.color.text3 }}>{bk.dur}분</span>
                      </div>
                      {/* Info */}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: T.space[1], marginBottom: 2 }}>
                          <span style={{ fontSize: 13 }}>{LANG[bk.lang]}</span>
                          <span style={{ ...f("body"), fontWeight: 600, color: T.color.text1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{bk.name}</span>
                          {bk.note && <span style={{ fontSize: 10, opacity: 0.5 }}>📝</span>}
                        </div>
                        <span style={{ ...f("caption"), color: T.color.text2 }}>{bk.service} ({bk.serviceCn})</span>
                        <div style={{ display: "flex", alignItems: "center", gap: T.space[2], marginTop: T.space[1] }}>
                          <span style={{ ...f("micro"), fontWeight: 600, color: sty.color, background: sty.color + "12", padding: "1px 6px", borderRadius: T.radius.sm }}>{sty.name}</span>
                          <span style={{ ...f("caption"), fontWeight: 500, color: T.color.text1 }}>₩{bk.price.toLocaleString()}</span>
                          <span style={{ ...f("micro"), color: T.color.primary }}>보증금 ¥{bk.dep}</span>
                        </div>
                      </div>
                      {/* Status */}
                      <div style={{ ...f("micro"), fontWeight: 700, color: st.color, background: st.bg, border: `1px solid ${st.border}`, padding: "3px 8px", borderRadius: T.radius.sm, alignSelf: "flex-start", whiteSpace: "nowrap" }}>
                        {st.label}
                      </div>
                    </div>
                    {/* Pending actions */}
                    {bk.status === "pending" && (
                      <div style={{ display: "flex", gap: T.space[2], marginTop: T.space[3], paddingTop: T.space[3], borderTop: `1px solid ${T.color.border}` }}>
                        <button onClick={e => { e.stopPropagation(); updateStatus(bk.id, "confirmed"); }}
                          style={{ ...btnSm, flex: 1, background: T.color.success, color: T.color.white }}>승인</button>
                        <button onClick={e => { e.stopPropagation(); updateStatus(bk.id, "cancelled"); }}
                          style={{ ...btnSm, flex: 1, background: T.color.card, color: T.color.error, border: `1px solid ${T.color.error}20` }}>거절</button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
        {/* ═══ Tab 1: 캘린더 ═══ */}
        {tab === 1 && (
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: T.space[4] }}>
              <h3 style={{ ...f("h2"), margin: 0 }}>{TODAY.getMonth()+1}월 {TODAY.getDate()}일</h3>
            </div>
            <div style={{ overflowX: "auto", borderRadius: T.radius.md, border: `1px solid ${T.color.border}`, background: T.color.card }}>
              <div style={{ display: "grid", gridTemplateColumns: "52px repeat(3,1fr)", minWidth: 480 }}>
                {/* Header */}
                <div style={{ padding: T.space[2], ...f("micro"), color: T.color.text3, textAlign: "center", background: T.color.bg, borderBottom: `1px solid ${T.color.border}`, borderRight: `1px solid ${T.color.border}` }}>시간</div>
                {STYLISTS.map(s => (
                  <div key={s.id} style={{ padding: T.space[2], ...f("caption"), fontWeight: 600, textAlign: "center", background: T.color.bg, borderBottom: `1px solid ${T.color.border}`, borderRight: `1px solid ${T.color.border}`, display: "flex", alignItems: "center", justifyContent: "center", gap: T.space[1] }}>
                    <div style={{ width: 7, height: 7, borderRadius: T.radius.full, background: s.color }} />
                    {s.name}
                  </div>
                ))}
                {/* Rows */}
                {HOURS.map(hour => (
                  <>
                    <div key={hour} style={{ padding: `${T.space[1]}px`, ...f("micro"), color: T.color.text3, textAlign: "center", borderBottom: `1px solid ${T.color.border}`, borderRight: `1px solid ${T.color.border}`, height: 34, display: "flex", alignItems: "center", justifyContent: "center" }}>{hour}</div>
                    {STYLISTS.map(st => {
                      const bk = bks.find(b => b.time === hour && b.stylist === st.id && b.status !== "cancelled");
                      if (bk) {
                        const slots = Math.ceil(bk.dur / 30);
                        const stObj = STATUS[bk.status];
                        return (
                          <div key={`${st.id}-${hour}`}
                            onClick={() => setSel(bk)}
                            style={{
                              gridRow: `span ${slots}`, margin: 2, padding: `${T.space[1]}px ${T.space[2]}px`,
                              background: st.color + "10", borderLeft: `3px solid ${st.color}`,
                              borderRadius: T.radius.sm, cursor: "pointer", overflow: "hidden",
                              transition: `all ${T.motion.fast} ${T.motion.ease}`,
                            }}>
                            <span style={{ ...f("micro"), fontWeight: 600, color: T.color.text1 }}>{LANG[bk.lang]} {bk.name}</span>
                            <br/><span style={{ ...f("micro"), color: T.color.text3 }}>{bk.service}</span>
                            <br/><span style={{ ...f("micro"), fontWeight: 600, color: stObj.color }}>{stObj.label}</span>
                          </div>
                        );
                      }
                      const above = bks.find(b => {
                        if (b.stylist !== st.id || b.status === "cancelled") return false;
                        const si = HOURS.indexOf(b.time), ei = si + Math.ceil(b.dur / 30), ci = HOURS.indexOf(hour);
                        return ci > si && ci < ei;
                      });
                      if (above) return null;
                      return <div key={`${st.id}-${hour}`} style={{ borderBottom: `1px solid ${T.color.border}`, borderRight: `1px solid ${T.color.border}`, height: 34 }} />;
                    })}
                  </>
                ))}
              </div>
            </div>
          </div>
        )}
        {/* ═══ Tab 2: 고객 ═══ */}
        {tab === 2 && (
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: T.space[4] }}>
              <h3 style={{ ...f("h2"), margin: 0 }}>NEAR 고객</h3>
              <span style={{ ...f("caption"), color: T.color.text3 }}>{bks.length}명</span>
            </div>
            {/* Search */}
            <div style={{ display: "flex", alignItems: "center", gap: T.space[2], padding: `${T.space[3]}px ${T.space[4]}px`, background: T.color.card, borderRadius: T.radius.md, border: `1px solid ${T.color.border}`, marginBottom: T.space[4], boxShadow: T.shadow.sm }}>
              <span style={{ color: T.color.text4, fontSize: 14 }}>🔍</span>
              <input placeholder="고객명 · 전화번호" style={{ border: "none", outline: "none", ...f("body"), flex: 1, fontFamily: T.font.family, background: "transparent", color: T.color.text1 }} />
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: T.space[2] }}>
              {[...new Map(bks.map(b => [b.name, b])).values()].map(bk => (
                <div key={bk.name} style={{ background: T.color.card, borderRadius: T.radius.md, padding: T.space[4], border: `1px solid ${T.color.border}`, boxShadow: T.shadow.sm }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: T.space[1] }}>
                        <span style={{ fontSize: 14 }}>{LANG[bk.lang]}</span>
                        <span style={{ ...f("body"), fontWeight: 600 }}>{bk.name}</span>
                      </div>
                      <span style={{ ...f("caption"), color: T.color.text3 }}>{bk.phone}</span>
                    </div>
                    <span style={{ ...f("micro"), fontWeight: 600, color: T.color.text2, background: T.color.bg, padding: "2px 8px", borderRadius: T.radius.sm }}>
                      {bk.lang === "ZH" ? "中文" : bk.lang === "JA" ? "日本語" : "English"}
                    </span>
                  </div>
                  <div style={{ display: "flex", gap: T.space[4], marginTop: T.space[3] }}>
                    {[{ l: "방문", v: "1회" },{ l: "매출", v: `₩${bk.price.toLocaleString()}` },{ l: "노쇼", v: "0회" }].map((m,i) => (
                      <div key={i}>
                        <span style={{ ...f("micro"), color: T.color.text3, display: "block" }}>{m.l}</span>
                        <span style={{ ...f("caption"), fontWeight: 500, color: T.color.text1 }}>{m.v}</span>
                      </div>
                    ))}
                  </div>
                  {bk.note && (
                    <div style={{ marginTop: T.space[3], padding: `${T.space[2]}px ${T.space[3]}px`, background: T.color.primarySoft, borderRadius: T.radius.sm }}>
                      <span style={{ ...f("micro"), color: T.color.text2 }}>📝 {bk.note}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
        {/* ═══ Tab 3: 정산 ═══ */}
        {tab === 3 && (
          <div>
            <h3 style={{ ...f("h2"), margin: `0 0 ${T.space[4]}px` }}>{TODAY.getMonth()+1}월 정산</h3>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: T.space[2], marginBottom: T.space[2] }}>
              {[
                { l: "총 예약", v: `${STATS.bookings}건`, sub: `완료 ${STATS.done} · 취소 ${STATS.cancel} · 노쇼 ${STATS.noshow}`, c: T.color.text1 },
                { l: "총 매출", v: `₩${(STATS.rev/10000).toFixed(0)}만`, sub: `¥${(STATS.rev * 0.00517).toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ',')} 상당`, c: T.color.text1 },
                { l: "보증금 수금", v: `¥${STATS.dep.toLocaleString()}`, sub: "알리페이 · 위챗", c: T.color.primary },
                { l: "NEAR 수수료", v: `-₩${(STATS.fee/10000).toFixed(1)}만`, sub: "매출의 10%", c: T.color.error },
              ].map((c, i) => (
                <div key={i} style={{ background: T.color.card, borderRadius: T.radius.md, padding: T.space[4], border: `1px solid ${T.color.border}`, boxShadow: T.shadow.sm }}>
                  <span style={{ ...f("micro"), color: T.color.text3 }}>{c.l}</span>
                  <div style={{ ...f("h1"), color: c.c, margin: `${T.space[1]}px 0 2px` }}>{c.v}</div>
                  <span style={{ ...f("micro"), color: T.color.text4 }}>{c.sub}</span>
                </div>
              ))}
            </div>
            {/* Payout */}
            <div style={{ background: T.color.primary, borderRadius: T.radius.md, padding: T.space[5], marginTop: T.space[2] }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ ...f("caption"), color: "rgba(255,255,255,0.7)" }}>정산 예정</span>
                <span style={{ ...f("hero"), color: T.color.white }}>₩{STATS.pay.toLocaleString()}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", marginTop: T.space[3], paddingTop: T.space[3], borderTop: "1px solid rgba(255,255,255,0.15)" }}>
                <span style={{ ...f("micro"), color: "rgba(255,255,255,0.5)" }}>매월 15일 · 25일</span>
                <span style={{ ...f("micro"), color: "rgba(255,255,255,0.5)" }}>국민 ****-1234</span>
              </div>
            </div>
            {/* Table */}
            <div style={{ marginTop: T.space[5] }}>
              <h4 style={{ ...f("h3"), margin: `0 0 ${T.space[3]}px` }}>최근 거래</h4>
              <div style={{ background: T.color.card, borderRadius: T.radius.md, border: `1px solid ${T.color.border}`, overflow: "hidden" }}>
                <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1.5fr 1fr 0.8fr 0.6fr", padding: `${T.space[2]}px ${T.space[3]}px`, background: T.color.bg, borderBottom: `1px solid ${T.color.border}` }}>
                  {["일시","고객","서비스","매출","상태"].map(h => <span key={h} style={{ ...f("micro"), color: T.color.text3 }}>{h}</span>)}
                </div>
                {bks.map(bk => {
                  const st = STATUS[bk.status];
                  return (
                    <div key={bk.id} style={{ display: "grid", gridTemplateColumns: "1.2fr 1.5fr 1fr 0.8fr 0.6fr", padding: `${T.space[2]}px ${T.space[3]}px`, borderBottom: `1px solid ${T.color.border}`, alignItems: "center" }}>
                      <span style={{ ...f("micro"), color: T.color.text2 }}>{bk.time}</span>
                      <span style={{ ...f("caption"), color: T.color.text1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{LANG[bk.lang]} {bk.name}</span>
                      <span style={{ ...f("micro"), color: T.color.text2 }}>{bk.service}</span>
                      <span style={{ ...f("caption"), fontWeight: 500, color: T.color.text1 }}>₩{(bk.price/1000).toFixed(0)}k</span>
                      <span style={{ ...f("micro"), fontWeight: 600, color: st.color }}>{st.label}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
      {/* ── Detail Modal ── */}
      {sel && (
        <div onClick={() => setSel(null)} style={{ position: "fixed", inset: 0, background: T.color.overlay, display: "flex", alignItems: "flex-end", justifyContent: "center", zIndex: 100, padding: 0 }}>
          <div onClick={e => e.stopPropagation()} style={{
            background: T.color.card, borderRadius: `${T.radius.lg}px ${T.radius.lg}px 0 0`,
            width: "100%", maxWidth: 800, maxHeight: "85vh", overflow: "auto",
            animation: "near-slideUp 300ms cubic-bezier(0, 0, 0.2, 1)",
          }}>
            {/* Handle */}
            <div style={{ display: "flex", justifyContent: "center", padding: `${T.space[3]}px 0 0` }}>
              <div style={{ width: 36, height: 4, borderRadius: 2, background: T.color.text4 }} />
            </div>
            <div style={{ padding: `${T.space[4]}px ${T.space[5]}px ${T.space[6]}px` }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: T.space[4] }}>
                <h3 style={{ ...f("h2"), margin: 0 }}>예약 상세</h3>
                <button onClick={() => setSel(null)} style={{ background: "none", border: "none", ...f("body"), color: T.color.text3, cursor: "pointer" }}>✕</button>
              </div>
              {(() => {
                const st = STATUS[sel.status];
                const sty = STYLISTS.find(s => s.id === sel.stylist);
                return (
                  <>
                    <div style={{ ...f("micro"), fontWeight: 700, color: st.color, background: st.bg, border: `1px solid ${st.border}`, padding: "4px 10px", borderRadius: T.radius.sm, display: "inline-block", marginBottom: T.space[4] }}>
                      {st.label}
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 0, background: T.color.bg, borderRadius: T.radius.md, padding: `0 ${T.space[4]}px` }}>
                      {[
                        { l: "예약번호", v: sel.id },
                        { l: "고객", v: `${LANG[sel.lang]} ${sel.name} (${sel.nameEn})` },
                        { l: "연락처", v: sel.phone },
                        { l: "서비스", v: `${sel.service} (${sel.serviceCn})` },
                        { l: "담당", v: sty.name },
                        { l: "시간", v: `${sel.time} · ${sel.dur}분` },
                        { l: "금액", v: `₩${sel.price.toLocaleString()} / ¥${sel.cny}` },
                      ].map((r, i) => (
                        <div key={i}>
                          <div style={{ display: "flex", justifyContent: "space-between", padding: `${T.space[3]}px 0` }}>
                            <span style={{ ...f("caption"), color: T.color.text3 }}>{r.l}</span>
                            <span style={{ ...f("caption"), fontWeight: 500, color: T.color.text1, textAlign: "right" }}>{r.v}</span>
                          </div>
                          {i < 6 && <div style={{ height: 1, background: T.color.border }} />}
                        </div>
                      ))}
                    </div>
                    {/* Deposit highlight */}
                    <div style={{ marginTop: T.space[3], padding: T.space[4], background: T.color.primarySoft, borderRadius: T.radius.md, border: `1px solid ${T.color.primaryMid}` }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <span style={{ ...f("caption"), color: T.color.primary, fontWeight: 600 }}>보증금 결제완료</span>
                        <span style={{ ...f("h2"), color: T.color.primary }}>¥{sel.dep}</span>
                      </div>
                    </div>
                    {sel.note && (
                      <div style={{ marginTop: T.space[3], padding: T.space[3], background: T.color.bg, borderRadius: T.radius.sm }}>
                        <span style={{ ...f("caption"), color: T.color.text2 }}>📝 {sel.note}</span>
                      </div>
                    )}
                    {/* Actions */}
                    <div style={{ display: "flex", gap: T.space[2], marginTop: T.space[5] }}>
                      {sel.status === "pending" && (
                        <>
                          <button onClick={() => updateStatus(sel.id, "confirmed")} style={{ ...btnFull, background: T.color.success, color: T.color.white }}>승인</button>
                          <button onClick={() => updateStatus(sel.id, "cancelled")} style={{ ...btnFull, background: T.color.card, color: T.color.error, border: `1px solid rgba(255,49,65,0.2)` }}>거절</button>
                        </>
                      )}
                      {sel.status === "confirmed" && (
                        <>
                          <button onClick={() => updateStatus(sel.id, "completed")} style={{ ...btnFull, background: T.color.primary, color: T.color.white }}>시술 완료</button>
                          <button onClick={() => updateStatus(sel.id, "noshow")} style={{ ...btnFull, background: T.color.card, color: T.color.error, border: `1px solid rgba(255,49,65,0.2)` }}>노쇼 처리</button>
                        </>
                      )}
                    </div>
                  </>
                );
              })()}
            </div>
          </div>
        </div>
      )}
      {/* ── Toast ── */}
      {toast && (
        <div style={{
          position: "fixed", bottom: T.space[8], left: "50%", transform: "translateX(-50%)",
          background: T.color.text1, color: T.color.white,
          padding: `${T.space[3]}px ${T.space[5]}px`,
          borderRadius: T.radius.pill, boxShadow: T.shadow.lg,
          ...f("caption"), fontWeight: 500,
          animation: "near-fadeInUp 300ms cubic-bezier(0, 0, 0.2, 1)",
          zIndex: 200,
        }}>
          {toast}
        </div>
      )}
    </div>
  );
}
const btnSm = {
  padding: `${T.space[2]}px 0`, borderRadius: T.radius.sm, border: "none",
  ...f("caption"), fontWeight: 600, cursor: "pointer", fontFamily: T.font.family,
  WebkitTapHighlightColor: "transparent", touchAction: "manipulation",
};
const btnFull = {
  flex: 1, padding: `${T.space[3]}px 0`, borderRadius: T.radius.md, border: "none",
  ...f("body"), fontWeight: 600, cursor: "pointer", fontFamily: T.font.family,
  WebkitTapHighlightColor: "transparent", touchAction: "manipulation",
};
if (typeof document !== 'undefined' && !document.getElementById('near-admin-ds')) {
  const s = document.createElement("style");
  s.id = 'near-admin-ds';
  s.textContent = `
    @keyframes near-spin { to { transform: rotate(360deg); } }
    @keyframes near-shimmer { 0% { background-position: -200% 0; } 100% { background-position: 200% 0; } }
    @keyframes near-pulse { 0%,100% { opacity:1; } 50% { opacity:0.3; } }
    @keyframes near-slideUp { from { transform: translateY(100%); } to { transform: translateY(0); } }
    @keyframes near-fadeInUp { from { opacity:0; transform: translate(-50%, 12px); } to { opacity:1; transform: translate(-50%, 0); } }
    * { box-sizing: border-box; }
    button:active { transform: scale(0.98); transition: transform 100ms cubic-bezier(0.4, 0, 0.2, 1); }
    @media (prefers-reduced-motion: reduce) { *, *::before, *::after { animation-duration: 0.01ms !important; transition-duration: 0.01ms !important; } }
  `;
  document.head.appendChild(s);
}
