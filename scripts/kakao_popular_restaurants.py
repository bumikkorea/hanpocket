#!/usr/bin/env python3
"""카카오맵 내부 검색 API로 28개 관광지 맛집 인기순(리뷰수) 수집"""
import json, time, urllib.request, urllib.parse
from collections import Counter, defaultdict

AREAS = [
    "동대문", "잠실", "송파", "뚝섬", "건대", "강남", "홍대", "연남",
    "연희동", "신촌", "성수", "명동", "남산", "을지로", "한남", "이태원",
    "북촌", "인사동", "익선동", "삼청동", "여의도", "압구정", "청담",
    "서촌", "광화문", "종로", "코엑스", "삼성동"
]

HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    'Referer': 'https://map.kakao.com/',
}

all_restaurants = []
seen = set()

for area in AREAS:
    query = urllib.parse.quote(f"{area} 맛집")
    area_count = 0
    
    for page in range(1, 6):  # 최대 5페이지 (75개)
        url = f"https://search.map.kakao.com/mapsearch/map.daum?callback=j&q={query}&msFlag=A&sort=0&page={page}&cnt=15"
        
        req = urllib.request.Request(url, headers=HEADERS)
        try:
            with urllib.request.urlopen(req, timeout=10) as resp:
                body = resp.read().decode()
                body = body[body.index('(') + 1 : body.rindex(')')]
                data = json.loads(body)
        except Exception as e:
            print(f"  ⚠️ {area} p{page}: {e}")
            break
        
        places = data.get("place", [])
        if not places:
            break
        
        for p in places:
            pid = p.get("confirmid") or p.get("sourceId", "")
            if pid in seen:
                continue
            seen.add(pid)
            
            # 음식점 카테고리만
            cat = p.get("cate_name_depth1", "")
            if cat and cat not in ["음식점", "카페,디저트", "카페", ""]:
                continue
            
            review_count = int(p.get("reviewCount", 0) or 0)
            rating = float(p.get("rating_average", 0) or p.get("kplace_rating", 0) or 0)
            rating_count = int(p.get("rating_count", 0) or p.get("kplace_ratings_count", 0) or 0)
            
            r = {
                "id": pid,
                "name": p.get("name", ""),
                "category": " > ".join(filter(None, [
                    p.get("cate_name_depth1", ""),
                    p.get("cate_name_depth2", ""),
                    p.get("cate_name_depth3", ""),
                ])),
                "phone": p.get("tel", ""),
                "address": p.get("new_address", "") or p.get("address", ""),
                "lat": float(p.get("lat", 0) or 0),
                "lng": float(p.get("lon", 0) or 0),
                "review_count": review_count,
                "rating": rating,
                "rating_count": rating_count,
                "area": area,
                "kakao_url": f"https://place.map.kakao.com/{pid}",
                "source": "kakao_search"
            }
            all_restaurants.append(r)
            area_count += 1
        
        time.sleep(0.2)
    
    print(f"✅ {area}: {area_count}개")
    time.sleep(0.15)

# 인기순 정렬
all_restaurants.sort(key=lambda x: x["review_count"], reverse=True)

print(f"\n🎯 총 {len(all_restaurants)}개 (중복 제거)")

# TOP 30
print(f"\n🔥 인기 맛집 TOP 30:")
print(f"{'#':>2} {'이름':<22} {'지역':<5} {'리뷰':>6} {'별점':>4} {'카테고리'}")
print("-" * 75)
for i, r in enumerate(all_restaurants[:30]):
    cat_short = r["category"].split(" > ")[-1] if r["category"] else ""
    rating_str = f"{r['rating']:.1f}" if r['rating'] else "-"
    print(f"{i+1:>2} {r['name'][:20]:<22} {r['area']:<5} {r['review_count']:>6} {rating_str:>4} {cat_short}")

# 지역별 TOP 3
print(f"\n📍 지역별 TOP 3:")
by_area = defaultdict(list)
for r in all_restaurants:
    by_area[r["area"]].append(r)

for area in AREAS:
    top = by_area[area][:3]
    entries = " | ".join(f"{r['name'][:12]}({r['review_count']})" for r in top)
    print(f"  {area}: {entries}")

# 리뷰 통계
reviews = [r["review_count"] for r in all_restaurants if r["review_count"] > 0]
if reviews:
    print(f"\n📊 리뷰 통계: 평균 {sum(reviews)/len(reviews):.0f} / 최대 {max(reviews)} / 리뷰있는곳 {len(reviews)}개")

# 저장
BASE = "/home/theredboat_ai/.openclaw/workspace/visa-app/src/data"
out = f"{BASE}/seoul_restaurants_popular.json"
with open(out, "w", encoding="utf-8") as f:
    json.dump(all_restaurants, f, ensure_ascii=False, indent=2)
print(f"\n📁 저장: {out}")
