#!/usr/bin/env python3
"""네이버 + 카카오 맛집 데이터 병합 v2 — 이름 기반 fuzzy 매칭"""
import json, re
from collections import Counter

BASE = "/home/theredboat_ai/.openclaw/workspace/visa-app/src/data"

with open(f"{BASE}/naver_top_restaurants.json", encoding="utf-8") as f:
    naver = json.load(f)
with open(f"{BASE}/kakao_area_restaurants.json", encoding="utf-8") as f:
    kakao = json.load(f)

print(f"네이버: {len(naver)}개 / 카카오: {len(kakao)}개")

# 지역 매핑 (주소 기반)
AREA_KEYWORDS = {
    "동대문": ["동대문", "신설동", "제기동", "장안동", "답십리", "회기동"],
    "잠실": ["잠실", "신천동", "석촌동"],
    "송파": ["송파", "방이동", "오금동", "문정동", "가락동"],
    "뚝섬": ["뚝섬", "성수동", "서울숲"],
    "건대": ["건대", "화양동", "자양동", "구의동"],
    "강남": ["강남", "역삼동", "서초", "논현", "신사동"],
    "홍대": ["홍대", "서교동", "상수동", "합정"],
    "연남": ["연남동"],
    "연희동": ["연희동"],
    "신촌": ["신촌", "창천동", "대현동"],
    "성수": ["성수동", "성수"],
    "명동": ["명동", "충무로"],
    "남산": ["남산", "후암동", "한남동"],
    "을지로": ["을지로", "초동", "인현동", "주교동"],
    "한남": ["한남동", "한남"],
    "이태원": ["이태원", "녹사평", "보광동"],
    "북촌": ["북촌", "가회동", "계동", "재동"],
    "인사동": ["인사동", "관훈동"],
    "익선동": ["익선동"],
    "삼청동": ["삼청동", "삼청"],
    "여의도": ["여의도", "여의나루"],
    "압구정": ["압구정", "신사동"],
    "청담": ["청담동", "청담"],
    "서촌": ["서촌", "통인동", "효자동", "옥인동", "누상동", "체부동"],
    "광화문": ["광화문", "세종", "종로1"],
    "종로": ["종로", "관철동", "공평동", "낙원동"],
    "코엑스": ["코엑스", "삼성1동", "봉은사"],
    "삼성동": ["삼성동", "삼성"],
}

def detect_area(addr):
    if not addr:
        return ""
    for area, keywords in AREA_KEYWORDS.items():
        for kw in keywords:
            if kw in addr:
                return area
    return ""

# 이름 정규화 (공백/특수문자/점 제거, 소문자)
def norm_name(name):
    if not name:
        return ""
    name = re.sub(r'[·\-_().\s]', '', name)
    # 지점명 제거
    name = re.sub(r'(본점|본관|직영점|강남점|홍대점|명동점|잠실점|종로점|신촌점|이태원점|여의도점|건대점|성수점|을지로점|삼성점|코엑스점|압구정점|청담점)$', '', name)
    return name.lower().strip()

# 카카오 데이터를 lookup dict로
kakao_lookup = {}
for r in kakao:
    key = norm_name(r["name"])
    if key not in kakao_lookup:
        kakao_lookup[key] = r

# 병합
merged = {}
dup_count = 0

# 카카오 먼저
for r in kakao:
    nk = norm_name(r["name"])
    uid = f"{nk}|{r.get('lat',0):.4f}"
    merged[uid] = {
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

# 네이버 추가
for r in naver:
    nk = norm_name(r["name"])
    area = detect_area(r.get("address", ""))
    
    # 카카오에 같은 이름 있는지 체크
    if nk in kakao_lookup:
        kr = kakao_lookup[nk]
        uid = f"{nk}|{kr.get('lat',0):.4f}"
        if uid in merged:
            merged[uid]["naver_url"] = r.get("link", "")
            if not merged[uid]["phone"] and r.get("phone"):
                merged[uid]["phone"] = r["phone"]
            merged[uid]["source"] = "both"
            if not merged[uid]["area"] and area:
                merged[uid]["area"] = area
            dup_count += 1
            continue
    
    # 새 항목
    uid = f"{nk}|{r.get('lat',0):.4f}"
    if uid in merged:
        dup_count += 1
        continue
        
    merged[uid] = {
        "name": r["name"],
        "category": r.get("category", ""),
        "phone": r.get("phone", ""),
        "address": r.get("address", ""),
        "lat": r.get("lat", 0),
        "lng": r.get("lng", 0),
        "area": area,
        "kakao_url": "",
        "naver_url": r.get("link", ""),
        "source": "naver"
    }

result = list(merged.values())
print(f"\n중복 매칭: {dup_count}개")
print(f"카카오 단독: {sum(1 for r in result if r['source']=='kakao')}개")
print(f"네이버 단독: {sum(1 for r in result if r['source']=='naver')}개")
print(f"양쪽 모두: {sum(1 for r in result if r['source']=='both')}개")
print(f"✅ 최종: {len(result)}개")

# 지역별
area_stats = Counter(r["area"] for r in result if r["area"])
print(f"\n지역별 (area 있는 것):")
for area, cnt in area_stats.most_common():
    print(f"  {area}: {cnt}개")
no_area = sum(1 for r in result if not r["area"])
print(f"  (지역 미분류: {no_area}개)")

# 카테고리
cat_stats = Counter()
for r in result:
    c = r["category"]
    if ">" in c:
        cat = c.split(">")[0].strip()
    elif " > " in c:
        cat = c.split(" > ")[0].strip()
    else:
        cat = c or "기타"
    cat_stats[cat] += 1
print(f"\n카테고리 TOP 10:")
for cat, cnt in cat_stats.most_common(10):
    print(f"  {cat}: {cnt}개")

# 좌표
no_coord = sum(1 for r in result if not r["lat"] or not r["lng"])
print(f"\n좌표 없음: {no_coord}개")

# 저장
out = f"{BASE}/seoul_restaurants_merged.json"
with open(out, "w", encoding="utf-8") as f:
    json.dump(result, f, ensure_ascii=False, indent=2)
print(f"\n📁 저장: {out}")
