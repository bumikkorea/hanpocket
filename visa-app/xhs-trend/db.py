"""
SQLite DB 스키마 및 유틸리티
"""
import sqlite3
import os
from config import DB_PATH


def get_db():
    db_path = os.path.join(os.path.dirname(__file__), DB_PATH)
    conn = sqlite3.connect(db_path)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA journal_mode=WAL")
    conn.execute("PRAGMA foreign_keys=ON")
    return conn


def init_db():
    conn = get_db()
    cursor = conn.cursor()

    # 1. 게시물 (핵심 테이블)
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS notes (
            note_id TEXT PRIMARY KEY,
            title TEXT,
            desc_text TEXT,
            type TEXT,                    -- normal / video
            tag_list TEXT,                -- JSON array
            liked_count INTEGER DEFAULT 0,
            collected_count INTEGER DEFAULT 0,
            comment_count INTEGER DEFAULT 0,
            share_count INTEGER DEFAULT 0,
            created_time INTEGER,
            last_update_time INTEGER,
            first_fetched DATE,           -- 최초 수집일
            last_fetched DATE             -- 마지막 수집일
        )
    """)

    # 2. 검색 결과 (키워드 ↔ 게시물 매핑)
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS search_results (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            keyword TEXT NOT NULL,
            category TEXT,                -- 여행/맛집/쇼핑 등
            note_id TEXT NOT NULL,
            rank INTEGER,                 -- 검색 순위 (1~20)
            sort_type TEXT DEFAULT 'popularity',
            fetched_date DATE NOT NULL,
            FOREIGN KEY (note_id) REFERENCES notes(note_id)
        )
    """)

    # 3. 태그 집계 (주간 태그 빈도)
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS tag_weekly (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            tag TEXT NOT NULL,
            category TEXT,
            count INTEGER DEFAULT 0,
            avg_liked REAL DEFAULT 0,
            avg_collected REAL DEFAULT 0,
            week_start DATE NOT NULL,     -- 주 시작일 (월요일)
            UNIQUE(tag, category, week_start)
        )
    """)

    # 4. 키워드 트렌드 (일별 키워드 통계)
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS keyword_daily (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            keyword TEXT NOT NULL,
            category TEXT,
            total_notes INTEGER DEFAULT 0,     -- 검색 결과 수
            avg_liked REAL DEFAULT 0,
            avg_collected REAL DEFAULT 0,
            avg_comment REAL DEFAULT 0,
            max_liked INTEGER DEFAULT 0,
            max_collected INTEGER DEFAULT 0,
            demand_score REAL DEFAULT 0,        -- collected / total_notes
            fetched_date DATE NOT NULL,
            UNIQUE(keyword, fetched_date)
        )
    """)

    # 5. 연관 검색어
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS search_suggestions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            keyword TEXT NOT NULL,
            suggestion TEXT NOT NULL,
            fetched_date DATE NOT NULL,
            UNIQUE(keyword, suggestion, fetched_date)
        )
    """)

    # 인덱스
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_search_date ON search_results(fetched_date)")
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_search_keyword ON search_results(keyword, fetched_date)")
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_keyword_daily ON keyword_daily(keyword, fetched_date)")
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_tag_weekly ON tag_weekly(week_start, count DESC)")
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_notes_collected ON notes(collected_count DESC)")

    conn.commit()
    conn.close()
    print("✅ DB 초기화 완료")


if __name__ == "__main__":
    init_db()
