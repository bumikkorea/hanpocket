#!/usr/bin/env python3
"""네이버 + 카카오 맛집 데이터 병합 및 중복 제거"""
import json, re
from collections import Counter

BASE = "/home/theredboat_ai/.openclaw/workspace/visa-app/src/data"

# 로드
with open(f"{BASE}/naver_top_restaurants.json", encoding="utf-8") as f:
    naver = json.load(f)
with open(f"{BASE}/kakao_area_restaurants.json", encoding="utf-8") as f:
    kakao = json.load(f)

print(f"네이버: {len(naver)}개 / 카카오: {len(kakao)}개")

# 이름 정규화 (공백, 특수문자 제거, 소문자)
def normalize(name):
    name = re.sub(r'\s+', '', name)
    name = re.sub(r'[·\-_()]', '', name)
    return name.lower().strip()

# 주소에서 핵심 부분 추출
def addr_key(addr):
    if not addr:
        return ""
    # 번지/호수까지만
    m = re.search(r'(서울\S*\s+\S+구\s+\S+)', addr)
    return m.group(1) if m else addr[:20]

merged = {}

# 카카오 먼저 (좌표가 더 정확)
for r in kakao:
    key = normalize(r["name"]) + "|" + addr_key(r.get("address", ""))
    merged[key] = {
        "name": r["name"],
        "category": r.get("category", ""),
        "phone": r.get("phone", ""),
        "address": r.get("address", ""),
        "lat": r.get("lat", 0),
        "lng": r.get("lng", 0),
        "area": r.get("area", ""),
        "kakao_url": r.get("url", ""),
        "naver_url": "",
        "source": "kakao"
    }

# 네이버 추가 (중복이면 naver_url만 보강)
naver_new = 0
naver_dup = 0
for r in naver:
    key = normalize(r["name"]) + "|" + addr_key(r.get("address", ""))
    if key in merged:
        merged[key]["naver_url"] = r.get("link", "")
        if not merged[key]["phone"] and r.get("phone"):
            merged[key]["phone"] = r["phone"]
        merged[key]["source"] = "both"
        naver_dup += 1
    else:
        merged[key] = {
            "name": r["name"],
            "category": r.get("category", ""),
            "phone": r.get("phone", ""),
            "address": r.get("address", ""),
            "lat": r.get("lat", 0),
            "lng": r.get("lng", 0),
            "area": r.get("area", ""),
            "kakao_url": "",
            "naver_url": r.get("link", ""),
            "source": "naver"
        }
        naver_new += 1

result = list(merged.values())
print(f"\n병합 결과:")
print(f"  카카오 단독: {sum(1 for r in result if r['source']=='kakao')}개")
print(f"  네이버 단독: {sum(1 for r in result if r['source']=='naver')}개")
print(f"  양쪽 모두: {sum(1 for r in result if r['source']=='both')}개")
print(f"  → 총 {len(result)}개")

# 지역별 통계
area_stats = Counter(r["area"] for r in result)
print(f"\n지역별:")
for area, cnt in area_stats.most_common():
    print(f"  {area}: {cnt}개")

# 카테고리 통계
cat_stats = Counter()
for r in result:
    cat = r["category"].split(">")[0].split(" > ")[0].strip() if r["category"] else "기타"
    cat_stats[cat] += 1
print(f"\n카테고리 TOP 15:")
for cat, cnt in cat_stats.most_common(15):
    print(f"  {cat}: {cnt}개")

# 좌표 없는 것
no_coord = sum(1 for r in result if not r["lat"] or not r["lng"])
print(f"\n좌표 없음: {no_coord}개")

# 저장
out_path = f"{BASE}/seoul_restaurants_merged.json"
with open(out_path, "w", encoding="utf-8") as f:
    json.dump(result, f, ensure_ascii=False, indent=2)
print(f"\n📁 저장: {out_path}")
