#!/usr/bin/env python3
"""카카오 + 네이버 통합 후 TOP 500 메뉴 수집"""
import json, re, time, urllib.request, urllib.parse
from collections import Counter, defaultdict

BASE = "/home/theredboat_ai/.openclaw/workspace/visa-app/src/data"

# 1. 데이터 로드
with open(f"{BASE}/seoul_restaurants_popular.json", encoding="utf-8") as f:
    kakao_data = json.load(f)  # 1942개 (리뷰수/별점 포함)

with open(f"{BASE}/naver_top_restaurants.json", encoding="utf-8") as f:
    naver_data = json.load(f)  # 1972개

print(f"카카오: {len(kakao_data)}개 / 네이버: {len(naver_data)}개")

# 2. 이름 정규화
def norm(name):
    if not name: return ""
    name = re.sub(r'[·\-_()\s.]', '', name)
    name = re.sub(r'<[^>]+>', '', name)  # HTML 태그 제거
    name = re.sub(r'(본점|직영점|강남점|홍대점|명동점|잠실점|종로점|신촌점|이태원점|여의도점|건대점|성수점|을지로점|삼성점|코엑스점|압구정점|청담점|서촌점|광화문점|연남점|연희점|한남점|인사동점|익선동점|삼청점|북촌점|뚝섬점|송파점|남산점)$', '', name)
    return name.lower().strip()

# 3. 카카오 기준으로 시작 (리뷰/별점 있으니까)
merged = {}
for r in kakao_data:
    key = norm(r["name"])
    merged[key] = {
        "name": r["name"],
        "category": r.get("category", ""),
        "phone": r.get("phone", ""),
        "address": r.get("address", ""),
        "lat": r.get("lat", 0),
        "lng": r.get("lng", 0),
        "area": r.get("area", ""),
        "review_count": r.get("review_count", 0),
        "rating": r.get("rating", 0),
        "rating_count": r.get("rating_count", 0),
        "kakao_url": r.get("kakao_url", ""),
        "kakao_id": r.get("id", ""),
        "naver_url": "",
        "naver_id": "",
        "source": "kakao",
    }

# 4. 네이버 병합
dup = 0
for r in naver_data:
    key = norm(r["name"])
    naver_link = r.get("link", "")
    
    if key in merged:
        # 중복 → 네이버 URL만 추가
        merged[key]["naver_url"] = naver_link
        if not merged[key]["phone"] and r.get("phone"):
            merged[key]["phone"] = r["phone"]
        merged[key]["source"] = "both"
        dup += 1
    else:
        # 새로운 항목
        # 지역 감지
        addr = r.get("address", "")
        area = ""
        area_map = {
            "동대문": ["동대문", "신설동", "제기동"],
            "잠실": ["잠실", "신천동"], "송파": ["송파", "방이동", "문정동"],
            "뚝섬": ["뚝섬", "성수동", "서울숲"], "건대": ["화양동", "자양동"],
            "강남": ["강남", "역삼", "서초", "논현", "신사동"],
            "홍대": ["서교동", "상수동", "합정"], "연남": ["연남동"],
            "연희동": ["연희동"], "신촌": ["신촌", "창천동"],
            "성수": ["성수"], "명동": ["명동", "충무로"],
            "남산": ["남산", "후암동"], "을지로": ["을지로", "초동"],
            "한남": ["한남"], "이태원": ["이태원", "녹사평"],
            "북촌": ["가회동", "계동"], "인사동": ["인사동", "관훈동"],
            "익선동": ["익선동"], "삼청동": ["삼청"],
            "여의도": ["여의도"], "압구정": ["압구정"],
            "청담": ["청담"], "서촌": ["통인동", "효자동", "체부동"],
            "광화문": ["광화문", "세종"], "종로": ["종로", "관철동"],
            "코엑스": ["코엑스", "봉은사"], "삼성동": ["삼성동"],
        }
        for a, kws in area_map.items():
            if any(kw in addr for kw in kws):
                area = a
                break
        
        merged[key] = {
            "name": re.sub(r'<[^>]+>', '', r["name"]),
            "category": r.get("category", ""),
            "phone": r.get("phone", ""),
            "address": addr,
            "lat": r.get("lat", 0),
            "lng": r.get("lng", 0),
            "area": area,
            "review_count": 0,
            "rating": 0,
            "rating_count": 0,
            "kakao_url": "",
            "kakao_id": "",
            "naver_url": naver_link,
            "naver_id": "",
            "source": "naver",
        }

result = list(merged.values())
result.sort(key=lambda x: x["review_count"], reverse=True)

print(f"\n통합 결과:")
print(f"  중복 매칭: {dup}개")
print(f"  카카오 단독: {sum(1 for r in result if r['source']=='kakao')}개")
print(f"  네이버 단독: {sum(1 for r in result if r['source']=='naver')}개")
print(f"  양쪽 모두: {sum(1 for r in result if r['source']=='both')}개")
print(f"  ✅ 최종: {len(result)}개")

# 5. TOP 500 네이버 플레이스 메뉴 수집
print(f"\n--- TOP 500 메뉴 수집 시작 ---")

def get_naver_menu(name, address):
    """네이버 플레이스 검색 → 메뉴 가져오기"""
    query = urllib.parse.quote(f"{name} {address.split()[0] if address else ''}")
    url = f"https://map.naver.com/p/api/search/allSearch?query={query}&type=all&searchCoord=126.978;37.566&boundary="
    
    req = urllib.request.Request(url)
    req.add_header("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64)")
    req.add_header("Referer", "https://map.naver.com/")
    
    try:
        with urllib.request.urlopen(req, timeout=5) as resp:
            data = json.loads(resp.read().decode())
        
        places = data.get("result", {}).get("place", {}).get("list", [])
        if not places:
            return None, None
        
        place = places[0]
        naver_id = place.get("id", "")
        menus = place.get("menuInfo", {}).get("menuList", [])
        
        menu_list = []
        for m in menus[:10]:  # 최대 10개
            menu_list.append({
                "name": m.get("name", ""),
                "price": m.get("price", ""),
            })
        
        # 추가 정보
        extra = {
            "naver_id": naver_id,
            "naver_place_url": f"https://pcmap.place.naver.com/restaurant/{naver_id}",
            "menu": menu_list,
            "keywords": place.get("keywords", []),
            "visitor_review_count": place.get("visitorReviewCount", 0),
            "blog_review_count": place.get("blogReviewCount", 0),
            "booking_url": place.get("bookingUrl", ""),
        }
        return extra, None
    except Exception as e:
        return None, str(e)

success = 0
for i, r in enumerate(result[:500]):
    extra, err = get_naver_menu(r["name"], r["address"])
    if extra:
        r["naver_id"] = extra.get("naver_id", "")
        r["naver_place_url"] = extra.get("naver_place_url", "")
        r["menu"] = extra.get("menu", [])
        r["keywords"] = extra.get("keywords", [])
        r["visitor_review_count"] = extra.get("visitor_review_count", 0)
        r["blog_review_count"] = extra.get("blog_review_count", 0)
        r["booking_url"] = extra.get("booking_url", "")
        success += 1
    
    if (i+1) % 50 == 0:
        print(f"  진행: {i+1}/500 ({success}개 메뉴 확보)")
    
    time.sleep(0.15)

print(f"\n✅ 메뉴 수집 완료: {success}/500")

# 메뉴 있는 것 통계
with_menu = sum(1 for r in result[:500] if r.get("menu"))
print(f"메뉴 보유: {with_menu}개")

# 저장
out = f"{BASE}/seoul_restaurants_final.json"
with open(out, "w", encoding="utf-8") as f:
    json.dump(result, f, ensure_ascii=False, indent=2)
print(f"\n📁 저장: {out}")

# TOP 10 메뉴 미리보기
print(f"\n🍽️ TOP 10 메뉴 미리보기:")
for r in result[:10]:
    menus = r.get("menu", [])
    menu_str = " / ".join(f"{m['name']}({m['price']})" for m in menus[:3]) if menus else "(메뉴 없음)"
    print(f"  {r['name']} [{r['area']}] 리뷰:{r['review_count']} → {menu_str}")
