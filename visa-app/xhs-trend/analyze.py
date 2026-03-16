"""
샤오홍슈 트렌드 분석 — 주간 리포트 생성
"""
import json
import os
import sys
from datetime import date, timedelta

sys.path.insert(0, os.path.dirname(__file__))
from db import get_db


def get_demand_ranking(conn, target_date=None):
    """수요 점수 랭킹 — 즐겨찾기 높은데 게시물 적은 = 블루오션"""
    if not target_date:
        target_date = date.today().isoformat()

    rows = conn.execute("""
        SELECT keyword, category, total_notes, avg_liked, avg_collected,
               avg_comment, demand_score
        FROM keyword_daily
        WHERE fetched_date = ?
        ORDER BY demand_score DESC
    """, (target_date,)).fetchall()

    return [dict(r) for r in rows]


def get_trending_tags(conn, weeks_back=2):
    """급상승 태그 감지 — 이번 주 vs 지난 주"""
    today = date.today()
    this_week = (today - timedelta(days=today.weekday())).isoformat()
    last_week = (today - timedelta(days=today.weekday() + 7)).isoformat()

    this_tags = {}
    for r in conn.execute("""
        SELECT tag, SUM(count) as cnt, AVG(avg_liked) as avg_l, AVG(avg_collected) as avg_c
        FROM tag_weekly WHERE week_start = ?
        GROUP BY tag ORDER BY cnt DESC LIMIT 100
    """, (this_week,)):
        this_tags[r["tag"]] = {"count": r["cnt"], "avg_liked": r["avg_l"], "avg_collected": r["avg_c"]}

    last_tags = {}
    for r in conn.execute("""
        SELECT tag, SUM(count) as cnt
        FROM tag_weekly WHERE week_start = ?
        GROUP BY tag
    """, (last_week,)):
        last_tags[r["tag"]] = r["cnt"]

    trending = []
    for tag, data in this_tags.items():
        prev = last_tags.get(tag, 0)
        if prev > 0:
            change = ((data["count"] - prev) / prev) * 100
        elif data["count"] > 3:
            change = 999  # 새로 등장
        else:
            continue
        trending.append({
            "tag": tag,
            "this_week": data["count"],
            "last_week": prev,
            "change_pct": round(change, 1),
            "avg_liked": round(data["avg_liked"], 1),
            "avg_collected": round(data["avg_collected"], 1),
        })

    trending.sort(key=lambda x: x["change_pct"], reverse=True)
    return trending


def get_content_gaps(conn, target_date=None):
    """콘텐츠 갭 분석 — 수요 높은데 공급 부족한 주제"""
    if not target_date:
        target_date = date.today().isoformat()

    rows = conn.execute("""
        SELECT keyword, category, total_notes, avg_collected, demand_score
        FROM keyword_daily
        WHERE fetched_date = ?
          AND avg_collected > 100
          AND total_notes < 20
        ORDER BY avg_collected DESC
    """, (target_date,)).fetchall()

    return [dict(r) for r in rows]


def get_suggestions_map(conn, target_date=None):
    """키워드별 연관 검색어"""
    if not target_date:
        target_date = date.today().isoformat()

    result = {}
    for r in conn.execute("""
        SELECT keyword, suggestion FROM search_suggestions
        WHERE fetched_date = ?
    """, (target_date,)):
        result.setdefault(r["keyword"], []).append(r["suggestion"])
    return result


def get_keyword_trend(conn, keyword, days=14):
    """특정 키워드의 일별 추이"""
    rows = conn.execute("""
        SELECT fetched_date, total_notes, avg_liked, avg_collected, demand_score
        FROM keyword_daily
        WHERE keyword = ?
        ORDER BY fetched_date DESC
        LIMIT ?
    """, (keyword, days)).fetchall()

    return [dict(r) for r in rows]


def generate_weekly_report(target_date=None):
    """주간 리포트 생성"""
    conn = get_db()
    if not target_date:
        target_date = date.today().isoformat()

    report = []
    report.append(f"# 📊 샤오홍슈 트렌드 리포트 — {target_date}")
    report.append("")

    # 1. 수요 점수 TOP 10
    report.append("## 🔴 수요 점수 TOP 10 (블루오션)")
    report.append("| 순위 | 키워드 | 카테고리 | 게시물 | 평균 즐찜 | 수요 점수 |")
    report.append("|---|---|---|---|---|---|")
    demand = get_demand_ranking(conn, target_date)
    for i, d in enumerate(demand[:10], 1):
        report.append(
            f"| {i} | {d['keyword']} | {d['category']} | "
            f"{d['total_notes']} | {d['avg_collected']:.0f} | "
            f"**{d['demand_score']:.1f}** |"
        )
    report.append("")

    # 2. 급상승 태그 TOP 15
    report.append("## 🔥 급상승 태그 TOP 15")
    trending = get_trending_tags(conn)
    if trending:
        report.append("| 태그 | 이번 주 | 지난 주 | 변화율 | 평균 좋아요 |")
        report.append("|---|---|---|---|---|")
        for t in trending[:15]:
            arrow = "🆕" if t["last_week"] == 0 else (
                "📈" if t["change_pct"] > 0 else "📉"
            )
            report.append(
                f"| {t['tag']} | {t['this_week']} | {t['last_week']} | "
                f"{arrow} {t['change_pct']:+.0f}% | {t['avg_liked']:.0f} |"
            )
    else:
        report.append("_데이터 부족 (최소 2주 수집 필요)_")
    report.append("")

    # 3. 콘텐츠 갭 (범범뻠 액션 아이템)
    report.append("## 💡 콘텐츠 갭 — 지금 만들면 먹히는 주제")
    gaps = get_content_gaps(conn, target_date)
    if gaps:
        for g in gaps[:5]:
            report.append(
                f"- **{g['keyword']}** ({g['category']}) — "
                f"평균 즐찜 {g['avg_collected']:.0f} / 게시물 {g['total_notes']}개뿐"
            )
    else:
        report.append("_현재 뚜렷한 갭 없음 (데이터 축적 중)_")
    report.append("")

    # 4. 연관 검색어 (새로운 키워드 발굴)
    report.append("## 🔍 연관 검색어 (키워드 확장 후보)")
    suggestions = get_suggestions_map(conn, target_date)
    for kw in list(suggestions.keys())[:10]:
        sugs = suggestions[kw][:5]
        report.append(f"- **{kw}** → {', '.join(sugs)}")
    report.append("")

    # 5. NEAR 반영 제안
    report.append("## 🎯 NEAR 반영 제안")
    if demand:
        top = demand[0]
        report.append(f"- 홈탭 '지금 뜨는': **{top['keyword']}** (수요 점수 {top['demand_score']:.1f})")
    if trending:
        hot = [t for t in trending[:3] if t["change_pct"] > 50]
        if hot:
            tags_str = ", ".join(f"#{t['tag']}" for t in hot)
            report.append(f"- 검색 태그 추가: {tags_str}")
    if gaps:
        report.append(f"- 콘텐츠 제작 우선순위: **{gaps[0]['keyword']}**")
    report.append("")

    conn.close()

    report_text = "\n".join(report)

    # 파일 저장
    report_dir = os.path.join(os.path.dirname(__file__), "reports")
    os.makedirs(report_dir, exist_ok=True)
    report_path = os.path.join(report_dir, f"weekly-{target_date}.md")
    with open(report_path, "w", encoding="utf-8") as f:
        f.write(report_text)

    print(f"📄 리포트 저장: {report_path}")
    return report_text


if __name__ == "__main__":
    report = generate_weekly_report()
    print(report)
