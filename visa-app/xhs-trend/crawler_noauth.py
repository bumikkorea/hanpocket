"""
샤오홍슈 비로그인 크롤러 v2
- 쿠키/계정 불필요
- explore 피드 (카테고리별) → SSR 데이터 파싱
- 홈피드 추천 + 카테고리별 피드 (여행/음식/패션 등)
- 매일 돌리면 트렌드 축적
"""
import json
import re
import time
import os
import sys
import random
from datetime import date, timedelta

import requests

sys.path.insert(0, os.path.dirname(__file__))
from config import CRAWL_DELAY
from db import get_db, init_db


# 샤오홍슈 공식 피드 카테고리
FEED_CATEGORIES = {
    "추천": "homefeed_recommend",
    "패션": "homefeed.fashion_v3",
    "음식": "homefeed.food_v3",
    "뷰티": "homefeed.cosmetics_v3",
    "여행": "homefeed.travel_v3",
    "인테리어": "homefeed.household_product_v3",
    "운동": "homefeed.fitness_v3",
    "직장": "homefeed.career_v3",
    "감성": "homefeed.love_v3",
    "영화": "homefeed.movie_and_tv_v3",
    "게임": "homefeed.gaming_v3",
}

# NEAR에 관련 있는 카테고리만 집중
TARGET_CATEGORIES = ["추천", "여행", "음식", "패션", "뷰티"]

USER_AGENTS = [
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:121.0) Gecko/20100101 Firefox/121.0",
]


class XhsFeedCrawler:
    """비로그인 피드 크롤러 — explore 페이지 SSR 파싱"""

    def __init__(self):
        self.session = requests.Session()
        self.session.headers.update({
            "User-Agent": random.choice(USER_AGENTS),
            "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
            "Accept-Language": "zh-CN,zh;q=0.9,en;q=0.8",
        })

    def _get_initial_state(self, url: str) -> dict | None:
        """페이지에서 __INITIAL_STATE__ 추출"""
        try:
            self.session.headers["User-Agent"] = random.choice(USER_AGENTS)
            resp = self.session.get(url, timeout=15)
            if resp.status_code != 200:
                return None

            match = re.search(
                r'window\.__INITIAL_STATE__\s*=\s*(\{.+?\})\s*</script>',
                resp.text, re.DOTALL
            )
            if not match:
                return None

            raw = match.group(1).replace("undefined", "null")
            return json.loads(raw)
        except Exception as e:
            print(f"    State 파싱 에러: {e}")
            return None

    def fetch_explore_feed(self) -> list[dict]:
        """메인 explore 페이지 피드 (추천 25개)"""
        state = self._get_initial_state("https://www.xiaohongshu.com/explore")
        if not state:
            return []

        feeds = state.get("feed", {}).get("feeds", [])
        return [self._parse_feed_item(item) for item in feeds if item.get("noteCard")]

    def fetch_category_feed(self, category_id: str) -> list[dict]:
        """카테고리별 explore 피드"""
        url = f"https://www.xiaohongshu.com/explore?channel_id={category_id}"
        state = self._get_initial_state(url)
        if not state:
            return []

        feeds = state.get("feed", {}).get("feeds", [])
        return [self._parse_feed_item(item) for item in feeds if item.get("noteCard")]

    def _parse_feed_item(self, item: dict) -> dict:
        """피드 아이템 파싱"""
        nc = item.get("noteCard", {})
        ii = nc.get("interactInfo", {})
        user = nc.get("user", {})

        def safe_int(val):
            if val is None:
                return 0
            val = str(val).replace("+", "")
            if "万" in val:
                val = val.replace("万", "")
                try:
                    return int(float(val) * 10000)
                except (ValueError, TypeError):
                    return 0
            try:
                return int(float(val))
            except (ValueError, TypeError):
                return 0

        return {
            "note_id": item.get("id", ""),
            "title": nc.get("displayTitle", ""),
            "type": nc.get("type", "normal"),
            "user_id": user.get("userId", ""),
            "user_name": user.get("nickname", ""),
            "liked_count": safe_int(ii.get("likedCount", 0)),
            "xsec_token": item.get("xsecToken", ""),
        }


def extract_korea_keywords(title: str) -> list[str]:
    """제목에서 한국 관련 키워드 추출"""
    korea_terms = [
        "韩国", "首尔", "釜山", "济州", "明洞", "弘大", "东大门", "仁川",
        "韩式", "韩剧", "韩系", "韩妆", "韩服", "韩餐", "烤肉", "炸鸡",
        "Kpop", "KPOP", "kpop", "韩流", "追星", "偶像",
        "乐天", "免税", "olive", "橄榄", "新罗",
    ]
    found = []
    for term in korea_terms:
        if term.lower() in title.lower():
            found.append(term)
    return found


def run_daily_crawl():
    """매일 크롤링 — 카테고리별 피드 수집"""
    init_db()
    crawler = XhsFeedCrawler()
    conn = get_db()
    today = date.today().isoformat()
    week_start = (date.today() - timedelta(days=date.today().weekday())).isoformat()

    total_notes = 0
    korea_related = 0

    print(f"\n🚀 샤오홍슈 피드 크롤링 시작 — {today}")
    print(f"   카테고리: {', '.join(TARGET_CATEGORIES)}\n")

    for cat_name in TARGET_CATEGORIES:
        cat_id = FEED_CATEGORIES[cat_name]
        print(f"[{cat_name}] ({cat_id})")

        if cat_name == "추천":
            items = crawler.fetch_explore_feed()
        else:
            items = crawler.fetch_category_feed(cat_id)

        print(f"   피드 {len(items)}개 수집")

        for rank, item in enumerate(items, 1):
            if not item["note_id"]:
                continue

            # notes 테이블 upsert (피드에서는 liked_count만 있음)
            conn.execute("""
                INSERT INTO notes (note_id, title, type, liked_count,
                    first_fetched, last_fetched)
                VALUES (?, ?, ?, ?, ?, ?)
                ON CONFLICT(note_id) DO UPDATE SET
                    liked_count = MAX(notes.liked_count, excluded.liked_count),
                    last_fetched = excluded.last_fetched
            """, (
                item["note_id"], item["title"], item["type"],
                item["liked_count"], today, today,
            ))

            # search_results에 피드 데이터도 저장 (category로 구분)
            conn.execute("""
                INSERT INTO search_results (keyword, category, note_id, rank, sort_type, fetched_date)
                VALUES (?, ?, ?, ?, ?, ?)
            """, (f"__feed_{cat_name}", cat_name, item["note_id"], rank, "feed", today))

            total_notes += 1

            # 제목에서 태그/키워드 추출
            title = item["title"]
            # 해시태그 추출
            hashtags = re.findall(r'[\s]?([^\s#]+)', title)

            # 한국 관련 여부
            korea_kws = extract_korea_keywords(title)
            if korea_kws:
                korea_related += 1
                # 한국 관련 키워드별로 keyword_daily에도 반영
                for kw in korea_kws:
                    conn.execute("""
                        INSERT INTO tag_weekly (tag, category, count, avg_liked, avg_collected, week_start)
                        VALUES (?, ?, 1, ?, 0, ?)
                        ON CONFLICT(tag, category, week_start) DO UPDATE SET
                            count = count + 1,
                            avg_liked = (avg_liked * (count - 1) + ?) / count
                    """, (kw, cat_name, item["liked_count"], week_start, item["liked_count"]))

        conn.commit()
        print(f"   → ✅ 저장 완료")
        time.sleep(random.uniform(CRAWL_DELAY, CRAWL_DELAY + 3))

    # web_fetch로 보조 데이터 수집 시도 (검색 트렌드)
    print(f"\n📈 트렌드 키워드 보조 수집...")
    try:
        _fetch_trending_keywords(crawler, conn, today, week_start)
    except Exception as e:
        print(f"   ⚠️ 트렌드 키워드 수집 실패 (비필수): {e}")

    conn.close()

    print(f"\n{'='*50}")
    print(f"📊 크롤링 완료!")
    print(f"   총 게시물: {total_notes}개")
    print(f"   한국 관련: {korea_related}개 ({korea_related/max(total_notes,1)*100:.0f}%)")
    print(f"{'='*50}\n")

    return total_notes, korea_related


def _fetch_trending_keywords(crawler, conn, today, week_start):
    """샤오홍슈 검색 자동완성으로 트렌드 키워드 수집"""
    seed_keywords = ["韩国", "首尔", "韩国旅游", "韩国美食", "韩国购物"]

    for seed in seed_keywords:
        try:
            url = f"https://www.xiaohongshu.com/search_result?keyword={seed}"
            state = crawler._get_initial_state(url)
            if not state:
                continue

            search = state.get("search", {})
            suggestions = search.get("suggestions", [])
            if isinstance(suggestions, list):
                for sug in suggestions:
                    text = sug.get("text", "") if isinstance(sug, dict) else str(sug)
                    if text:
                        conn.execute("""
                            INSERT OR IGNORE INTO search_suggestions (keyword, suggestion, fetched_date)
                            VALUES (?, ?, ?)
                        """, (seed, text, today))

            # trending info
            trending = search.get("queryTrendingInfo", {})
            if trending:
                print(f"   [{seed}] 트렌드 info: {json.dumps(trending, ensure_ascii=False)[:200]}")

            conn.commit()
            time.sleep(random.uniform(2, 4))

        except Exception as e:
            print(f"   [{seed}] 실패: {e}")
            continue


if __name__ == "__main__":
    run_daily_crawl()
