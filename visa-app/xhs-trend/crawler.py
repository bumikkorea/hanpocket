"""
샤오홍슈 크롤러 — 매일 크론으로 실행
xhshow(순수 서명) + requests로 브라우저 없이 동작
"""
import json
import time
import sqlite3
import os
import sys
from datetime import date, datetime, timedelta

from xhshow import Xhshow
import requests

# 경로 설정
sys.path.insert(0, os.path.dirname(__file__))
from config import (
    XHS_COOKIE, XHS_A1, XHS_WEB_SESSION, XHS_WEB_ID,
    KEYWORDS, NOTES_PER_KEYWORD, CRAWL_DELAY
)
from db import get_db, init_db


class XhsCrawler:
    """xhshow 기반 샤오홍슈 크롤러 (브라우저 불필요)"""

    BASE_URL = "https://edith.xiaohongshu.com"
    USER_AGENT = (
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
        "AppleWebKit/537.36 (KHTML, like Gecko) "
        "Chrome/131.0.0.0 Safari/537.36"
    )

    def __init__(self):
        self.signer = Xhshow()
        self.session = requests.Session()
        self.session.headers.update({
            "User-Agent": self.USER_AGENT,
            "Content-Type": "application/json",
            "Origin": "https://www.xiaohongshu.com",
            "Referer": "https://www.xiaohongshu.com/",
        })

        # 쿠키 설정
        if XHS_COOKIE:
            self._set_cookie_from_string(XHS_COOKIE)
        elif XHS_A1:
            self.cookies = {
                "a1": XHS_A1,
                "web_session": XHS_WEB_SESSION,
                "webId": XHS_WEB_ID,
            }
            for k, v in self.cookies.items():
                self.session.cookies.set(k, v, domain=".xiaohongshu.com")
        else:
            print("⚠️  쿠키가 설정되지 않았습니다. config.py를 확인하세요.")
            sys.exit(1)

        self.cookies = {
            "a1": self.session.cookies.get("a1"),
            "web_session": self.session.cookies.get("web_session"),
            "webId": self.session.cookies.get("webId"),
        }

    def _set_cookie_from_string(self, cookie_str: str):
        """쿠키 문자열 파싱"""
        for item in cookie_str.split(";"):
            item = item.strip()
            if "=" in item:
                k, v = item.split("=", 1)
                self.session.cookies.set(k.strip(), v.strip(), domain=".xiaohongshu.com")

    def _get(self, uri: str, params: dict = None):
        """GET 요청 + xhshow 서명"""
        full_uri = uri
        if params:
            query = "&".join(f"{k}={v}" for k, v in params.items())
            full_uri = f"{uri}?{query}"

        headers = self.signer.sign_headers_get(
            uri=full_uri,
            cookies=self.cookies,
            params=params or {},
        )
        self.session.headers.update(headers)

        resp = self.session.get(f"{self.BASE_URL}{full_uri}")
        data = resp.json()
        if data.get("success"):
            return data.get("data", True)
        else:
            raise Exception(f"API 에러: {data}")

    def _post(self, uri: str, payload: dict):
        """POST 요청 + xhshow 서명"""
        headers = self.signer.sign_headers_post(
            uri=uri,
            cookies=self.cookies,
            payload=payload,
        )
        self.session.headers.update(headers)

        resp = self.session.post(
            f"{self.BASE_URL}{uri}",
            json=payload,
        )
        data = resp.json()
        if data.get("success"):
            return data.get("data", True)
        else:
            raise Exception(f"API 에러: {data}")

    def search_notes(self, keyword: str, page: int = 1, page_size: int = 20,
                     sort: str = "popularity_descending"):
        """키워드로 게시물 검색"""
        uri = "/api/sns/web/v1/search/notes"
        # search_id 생성 (랜덤)
        import random, string
        search_id = "".join(random.choices(string.ascii_lowercase + string.digits, k=21))

        payload = {
            "keyword": keyword,
            "page": page,
            "page_size": page_size,
            "search_id": search_id,
            "sort": sort,
            "note_type": 0,  # 전체
        }
        return self._post(uri, payload)

    def get_search_suggestions(self, keyword: str):
        """연관 검색어"""
        uri = "/api/sns/web/v1/sug/recommend"
        params = {"keyword": keyword}
        try:
            data = self._get(uri, params)
            return [s.get("text", "") for s in data.get("sug_items", [])]
        except Exception:
            return []


def parse_note(item: dict) -> dict:
    """검색 결과 아이템에서 필요한 필드 추출"""
    note = item.get("note_card", item)
    interact = note.get("interact_info", {})

    def safe_int(val):
        if val is None:
            return 0
        if isinstance(val, int):
            return val
        val = str(val).replace("万", "0000").replace("+", "")
        try:
            return int(float(val))
        except (ValueError, TypeError):
            return 0

    return {
        "note_id": note.get("note_id") or item.get("id", ""),
        "title": note.get("title", "") or note.get("display_title", ""),
        "desc_text": note.get("desc", ""),
        "type": note.get("type", "normal"),
        "tag_list": json.dumps([t.get("name", "") for t in note.get("tag_list", [])],
                               ensure_ascii=False),
        "liked_count": safe_int(interact.get("liked_count", 0)),
        "collected_count": safe_int(interact.get("collected_count", 0)),
        "comment_count": safe_int(interact.get("comment_count", 0)),
        "share_count": safe_int(interact.get("share_count", 0)),
        "created_time": note.get("time", 0),
        "last_update_time": note.get("last_update_time", 0),
    }


def run_daily_crawl():
    """매일 크롤링 실행"""
    init_db()
    crawler = XhsCrawler()
    conn = get_db()
    today = date.today().isoformat()

    total_notes = 0
    total_keywords = 0
    errors = []

    print(f"\n🚀 샤오홍슈 크롤링 시작 — {today}")
    print(f"   키워드 {sum(len(v) for v in KEYWORDS.values())}개 × {NOTES_PER_KEYWORD}개/키워드\n")

    for category, keywords in KEYWORDS.items():
        for keyword in keywords:
            total_keywords += 1
            print(f"[{total_keywords}] {category} > {keyword} ... ", end="", flush=True)

            try:
                # 1. 검색
                result = crawler.search_notes(keyword, page_size=NOTES_PER_KEYWORD)
                items = result.get("items", [])

                # 2. 연관 검색어
                suggestions = crawler.get_search_suggestions(keyword)
                for sug in suggestions[:10]:
                    conn.execute("""
                        INSERT OR IGNORE INTO search_suggestions (keyword, suggestion, fetched_date)
                        VALUES (?, ?, ?)
                    """, (keyword, sug, today))

                # 3. 게시물 저장
                keyword_liked = []
                keyword_collected = []
                keyword_comment = []

                for rank, item in enumerate(items, 1):
                    note = parse_note(item)
                    if not note["note_id"]:
                        continue

                    # notes 테이블 upsert
                    conn.execute("""
                        INSERT INTO notes (note_id, title, desc_text, type, tag_list,
                            liked_count, collected_count, comment_count, share_count,
                            created_time, last_update_time, first_fetched, last_fetched)
                        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                        ON CONFLICT(note_id) DO UPDATE SET
                            liked_count = excluded.liked_count,
                            collected_count = excluded.collected_count,
                            comment_count = excluded.comment_count,
                            share_count = excluded.share_count,
                            last_fetched = excluded.last_fetched
                    """, (
                        note["note_id"], note["title"], note["desc_text"], note["type"],
                        note["tag_list"], note["liked_count"], note["collected_count"],
                        note["comment_count"], note["share_count"], note["created_time"],
                        note["last_update_time"], today, today,
                    ))

                    # search_results 테이블
                    conn.execute("""
                        INSERT INTO search_results (keyword, category, note_id, rank, sort_type, fetched_date)
                        VALUES (?, ?, ?, ?, ?, ?)
                    """, (keyword, category, note["note_id"], rank, "popularity", today))

                    keyword_liked.append(note["liked_count"])
                    keyword_collected.append(note["collected_count"])
                    keyword_comment.append(note["comment_count"])
                    total_notes += 1

                    # 태그 집계
                    tags = json.loads(note["tag_list"]) if note["tag_list"] else []
                    week_start = (date.today() - timedelta(days=date.today().weekday())).isoformat()
                    for tag in tags:
                        if not tag:
                            continue
                        conn.execute("""
                            INSERT INTO tag_weekly (tag, category, count, avg_liked, avg_collected, week_start)
                            VALUES (?, ?, 1, ?, ?, ?)
                            ON CONFLICT(tag, category, week_start) DO UPDATE SET
                                count = count + 1,
                                avg_liked = (avg_liked * (count - 1) + ?) / count,
                                avg_collected = (avg_collected * (count - 1) + ?) / count
                        """, (tag, category, note["liked_count"], note["collected_count"],
                              week_start, note["liked_count"], note["collected_count"]))

                # 4. 키워드 일별 통계
                n = len(keyword_liked) or 1
                avg_l = sum(keyword_liked) / n
                avg_c = sum(keyword_collected) / n
                avg_cm = sum(keyword_comment) / n
                demand = avg_c / max(n, 1)

                conn.execute("""
                    INSERT OR REPLACE INTO keyword_daily
                        (keyword, category, total_notes, avg_liked, avg_collected, avg_comment,
                         max_liked, max_collected, demand_score, fetched_date)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """, (keyword, category, len(items), round(avg_l, 1), round(avg_c, 1),
                      round(avg_cm, 1), max(keyword_liked or [0]), max(keyword_collected or [0]),
                      round(demand, 2), today))

                conn.commit()
                print(f"✅ {len(items)}개 (좋아요 avg {avg_l:.0f}, 즐찜 avg {avg_c:.0f})")

            except Exception as e:
                errors.append(f"{keyword}: {e}")
                print(f"❌ {e}")

            time.sleep(CRAWL_DELAY)

    conn.close()

    # 결과 요약
    print(f"\n{'='*50}")
    print(f"📊 크롤링 완료!")
    print(f"   키워드: {total_keywords}개")
    print(f"   게시물: {total_notes}개")
    print(f"   에러: {len(errors)}개")
    if errors:
        print(f"\n⚠️  에러 목록:")
        for e in errors:
            print(f"   - {e}")
    print(f"{'='*50}\n")

    return total_notes, len(errors)


if __name__ == "__main__":
    run_daily_crawl()
