#!/usr/bin/env python3
"""카카오맵에서 리뷰수/별점 가져와서 인기순 정렬"""
import json, re, time, urllib.request, urllib.error
from concurrent.futures import ThreadPoolExecutor

BASE = "/home/theredboat_ai/.openclaw/workspace/visa-app/src/data"

with open(f"{BASE}/seoul_restaurants_merged.json", encoding="utf-8") as f:
    restaurants = json.load(f)

print(f"총 {len(restaurants)}개 중 카카오 URL 있는 것만 리뷰 수집")

# 카카오 place ID로 리뷰수/별점 가져오기
def get_review_info(r):
    kakao_url = r.get("kakao_url", "")
    if not kakao_url:
        return None
    
    # place ID 추출
    m = re.search(r'/(\d+)$', kakao_url)
    if not m:
        return None
    place_id = m.group(1)
    
    # 카카오맵 place detail API (비공식이지만 공개 엔드포인트)
    url = f"https://place.map.kakao.com/main/v/{place_id}"
    req = urllib.request.Request(url)
    req.add_header("User-Agent", "Mozilla/5.0")
    req.add_header("Referer", "https://map.kakao.com/")
    
    try:
        with urllib.request.urlopen(req, timeout=5) as resp:
            data = json.loads(resp.read().decode())
        
        basic = data.get("basicInfo", {})
        feedback = basic.get("feedback", {})
        
        return {
            "review_count": feedback.get("blogrvwcnt", 0) + feedback.get("comntcnt", 0),
            "blog_review": feedback.get("blogrvwcnt", 0),
            "kakao_review": feedback.get("comntcnt", 0),
            "score_sum": feedback.get("scoresum", 0),
            "score_count": feedback.get("scorecnt", 0),
            "rating": round(feedback.get("scoresum", 0) / feedback.get("scorecnt", 1), 1) if feedback.get("scorecnt", 0) > 0 else 0,
            "place_id": place_id
        }
    except Exception as e:
        return None

# 카카오 URL 있는 것만 필터
with_kakao = [r for r in restaurants if r.get("kakao_url")]
print(f"카카오 URL 보유: {with_kakao.__len__()}개")

# 순차 수집 (rate limit 안전)
results = []
for i, r in enumerate(with_kakao):
    info = get_review_info(r)
    if info:
        r.update(info)
        results.append(r)
    
    if (i+1) % 50 == 0:
        print(f"  진행: {i+1}/{len(with_kakao)} ({len(results)}개 성공)")
    
    time.sleep(0.1)  # rate limit

print(f"\n✅ 리뷰 데이터 수집: {len(results)}개")

# 인기순 정렬 (리뷰수)
results.sort(key=lambda x: x.get("review_count", 0), reverse=True)

# TOP 30 출력
print(f"\n🔥 인기 맛집 TOP 30 (리뷰수 기준):")
print(f"{'순위':>3} | {'이름':<20} | {'지역':<6} | {'리뷰':>6} | {'별점':>4} | {'카테고리'}")
print("-" * 80)
for i, r in enumerate(results[:30]):
    name = r["name"][:18]
    area = r.get("area", "-")[:5]
    rev = r.get("review_count", 0)
    rating = r.get("rating", 0)
    cat = r.get("category", "")
    if ">" in cat:
        cat = cat.split(">")[-1].strip()
    print(f"{i+1:>3} | {name:<20} | {area:<6} | {rev:>6} | {rating:>4} | {cat}")

# 저장
out = f"{BASE}/seoul_restaurants_popular.json"
with open(out, "w", encoding="utf-8") as f:
    json.dump(results, f, ensure_ascii=False, indent=2)
print(f"\n📁 저장: {out}")

# 지역별 TOP 3도 출력
print(f"\n📍 지역별 TOP 3:")
from collections import defaultdict
by_area = defaultdict(list)
for r in results:
    if r.get("area"):
        by_area[r["area"]].append(r)

for area in sorted(by_area.keys()):
    top3 = by_area[area][:3]
    names = " / ".join(f"{r['name']}({r.get('review_count',0)})" for r in top3)
    print(f"  {area}: {names}")
