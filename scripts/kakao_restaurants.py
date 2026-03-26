#!/usr/bin/env python3
"""카카오 로컬 API로 서울 관광지별 맛집 수집"""
import json, time, urllib.request, urllib.parse, urllib.error

API_KEY = "d93decd524c15c3455ff05983ca07fac"
AREAS = [
    "동대문", "잠실", "송파", "뚝섬", "건대", "강남", "홍대", "연남",
    "연희동", "신촌", "성수", "명동", "남산", "을지로", "한남", "이태원",
    "북촌", "인사동", "익선동", "삼청동", "여의도", "압구정", "청담",
    "서촌", "광화문", "종로", "코엑스", "삼성동"
]

all_restaurants = []
seen = set()  # 중복 제거용

for area in AREAS:
    query = f"{area} 맛집"
    area_count = 0
    
    for page in range(1, 4):  # 최대 3페이지 (45개)
        params = urllib.parse.urlencode({
            "query": query,
            "category_group_code": "FD6",  # 음식점
            "size": 15,
            "page": page,
            "sort": "accuracy"
        })
        url = f"https://dapi.kakao.com/v2/local/search/keyword.json?{params}"
        
        req = urllib.request.Request(url)
        req.add_header("Authorization", f"KakaoAK {API_KEY}")
        req.add_header("KA", "sdk/1.0 os/javascript origin/https://hanpocket.pages.dev")
        
        try:
            with urllib.request.urlopen(req) as resp:
                data = json.loads(resp.read().decode())
        except urllib.error.HTTPError as e:
            print(f"  ⚠️ {area} page {page}: HTTP {e.code}")
            break
        
        docs = data.get("documents", [])
        if not docs:
            break
            
        for d in docs:
            place_id = d.get("id")
            if place_id in seen:
                continue
            seen.add(place_id)
            
            all_restaurants.append({
                "id": place_id,
                "name": d.get("place_name"),
                "category": d.get("category_name"),
                "phone": d.get("phone"),
                "address": d.get("road_address_name") or d.get("address_name"),
                "lat": float(d.get("y", 0)),
                "lng": float(d.get("x", 0)),
                "url": d.get("place_url"),
                "area": area,
                "source": "kakao"
            })
            area_count += 1
        
        if data.get("meta", {}).get("is_end", True):
            break
        
        time.sleep(0.15)  # rate limit
    
    print(f"✅ {area}: {area_count}개")
    time.sleep(0.2)

print(f"\n🎯 총 {len(all_restaurants)}개 (중복 제거 후)")

# 저장
out_path = "/home/theredboat_ai/.openclaw/workspace/visa-app/src/data/kakao_area_restaurants.json"
with open(out_path, "w", encoding="utf-8") as f:
    json.dump(all_restaurants, f, ensure_ascii=False, indent=2)
print(f"📁 저장: {out_path}")

# 지역별 통계
from collections import Counter
area_stats = Counter(r["area"] for r in all_restaurants)
for area in AREAS:
    print(f"  {area}: {area_stats.get(area, 0)}개")
