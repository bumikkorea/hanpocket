-- HanPocket 커뮤니티 D1 데이터베이스 스키마
-- 다국어 지원 (ko/zh/en), 사용자 인증, 카테고리 분류, 검색 최적화

-- ===== 사용자 관리 =====

-- 사용자 기본 정보
CREATE TABLE users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    uuid TEXT NOT NULL UNIQUE, -- 외부 식별자
    email TEXT UNIQUE,
    phone TEXT UNIQUE,
    password_hash TEXT,
    username TEXT NOT NULL,
    profile_image TEXT,
    is_verified BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    last_login_at DATETIME,
    -- 사용자 설정
    preferred_language TEXT DEFAULT 'ko' CHECK (preferred_language IN ('ko', 'zh', 'en')),
    timezone TEXT DEFAULT 'Asia/Seoul',
    notification_enabled BOOLEAN DEFAULT TRUE
);

-- 사용자 프로필 (다국어 지원)
CREATE TABLE user_profiles (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    language_code TEXT NOT NULL CHECK (language_code IN ('ko', 'zh', 'en')),
    display_name TEXT,
    bio TEXT,
    location TEXT,
    occupation TEXT,
    interests TEXT, -- JSON array
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE(user_id, language_code)
);

-- 사용자 인증 토큰
CREATE TABLE user_tokens (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    token_hash TEXT NOT NULL,
    token_type TEXT NOT NULL CHECK (token_type IN ('access', 'refresh', 'email_verify', 'password_reset')),
    expires_at DATETIME NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    is_revoked BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ===== 게시판 카테고리 =====

-- 카테고리 기본 정보
CREATE TABLE categories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    slug TEXT NOT NULL UNIQUE, -- URL용 식별자 (jobs, real-estate, general 등)
    parent_id INTEGER, -- 하위 카테고리용
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    -- 메타 정보
    icon TEXT, -- 아이콘 클래스 또는 이미지 URL
    color TEXT, -- 카테고리 색상
    description TEXT,
    FOREIGN KEY (parent_id) REFERENCES categories(id) ON DELETE SET NULL
);

-- 카테고리 다국어 정보
CREATE TABLE category_translations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    category_id INTEGER NOT NULL,
    language_code TEXT NOT NULL CHECK (language_code IN ('ko', 'zh', 'en')),
    name TEXT NOT NULL,
    description TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE,
    UNIQUE(category_id, language_code)
);

-- ===== 게시글 관리 =====

-- 게시글 기본 정보
CREATE TABLE posts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    uuid TEXT NOT NULL UNIQUE, -- 외부 식별자
    author_id INTEGER NOT NULL,
    category_id INTEGER NOT NULL,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    content_type TEXT DEFAULT 'markdown' CHECK (content_type IN ('markdown', 'html', 'plain')),
    
    -- 게시글 상태
    status TEXT DEFAULT 'published' CHECK (status IN ('draft', 'published', 'archived', 'deleted')),
    is_pinned BOOLEAN DEFAULT FALSE,
    is_featured BOOLEAN DEFAULT FALSE,
    
    -- 메타 정보
    view_count INTEGER DEFAULT 0,
    like_count INTEGER DEFAULT 0,
    comment_count INTEGER DEFAULT 0,
    
    -- 구직/부동산 전용 필드
    job_type TEXT, -- 'full-time', 'part-time', 'contract', 'freelance'
    salary_min INTEGER,
    salary_max INTEGER,
    currency TEXT DEFAULT 'KRW',
    location TEXT, -- 지역 정보
    contact_method TEXT, -- 연락 방법
    expires_at DATETIME, -- 만료일
    
    -- 시간 정보
    published_at DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    -- 검색 최적화
    search_vector TEXT, -- 검색용 텍스트 벡터
    tags TEXT, -- JSON array of tags
    
    FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE RESTRICT
);

-- 게시글 다국어 번역
CREATE TABLE post_translations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    post_id INTEGER NOT NULL,
    language_code TEXT NOT NULL CHECK (language_code IN ('ko', 'zh', 'en')),
    title TEXT,
    content TEXT,
    is_auto_translated BOOLEAN DEFAULT FALSE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
    UNIQUE(post_id, language_code)
);

-- 게시글 첨부파일
CREATE TABLE post_attachments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    post_id INTEGER NOT NULL,
    file_name TEXT NOT NULL,
    file_size INTEGER,
    file_type TEXT,
    file_url TEXT NOT NULL,
    sort_order INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE
);

-- ===== 댓글 시스템 =====

-- 댓글
CREATE TABLE comments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    uuid TEXT NOT NULL UNIQUE,
    post_id INTEGER NOT NULL,
    author_id INTEGER NOT NULL,
    parent_id INTEGER, -- 대댓글용
    content TEXT NOT NULL,
    content_type TEXT DEFAULT 'plain' CHECK (content_type IN ('markdown', 'html', 'plain')),
    
    -- 상태
    status TEXT DEFAULT 'published' CHECK (status IN ('published', 'hidden', 'deleted')),
    like_count INTEGER DEFAULT 0,
    reply_count INTEGER DEFAULT 0,
    
    -- 시간 정보
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
    FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (parent_id) REFERENCES comments(id) ON DELETE CASCADE
);

-- 댓글 다국어 번역
CREATE TABLE comment_translations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    comment_id INTEGER NOT NULL,
    language_code TEXT NOT NULL CHECK (language_code IN ('ko', 'zh', 'en')),
    content TEXT,
    is_auto_translated BOOLEAN DEFAULT FALSE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (comment_id) REFERENCES comments(id) ON DELETE CASCADE,
    UNIQUE(comment_id, language_code)
);

-- ===== 좋아요 시스템 =====

-- 게시글 좋아요
CREATE TABLE post_likes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    post_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE(post_id, user_id)
);

-- 댓글 좋아요
CREATE TABLE comment_likes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    comment_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (comment_id) REFERENCES comments(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE(comment_id, user_id)
);

-- ===== 알림 시스템 =====

-- 알림
CREATE TABLE notifications (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('like', 'comment', 'reply', 'mention', 'system')),
    title TEXT NOT NULL,
    message TEXT,
    data TEXT, -- JSON 데이터
    is_read BOOLEAN DEFAULT FALSE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ===== 관리자 및 모더레이션 =====

-- 신고
CREATE TABLE reports (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    reporter_id INTEGER NOT NULL,
    target_type TEXT NOT NULL CHECK (target_type IN ('post', 'comment', 'user')),
    target_id INTEGER NOT NULL,
    reason TEXT NOT NULL,
    description TEXT,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'reviewing', 'resolved', 'dismissed')),
    admin_notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    resolved_at DATETIME,
    FOREIGN KEY (reporter_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ===== 검색 최적화 =====

-- FTS (Full-Text Search) 가상 테이블
CREATE VIRTUAL TABLE posts_fts USING fts5(
    title, 
    content, 
    tags, 
    location,
    content=posts, 
    content_rowid=id
);

-- FTS 트리거 (게시글 변경 시 검색 인덱스 업데이트)
CREATE TRIGGER posts_ai AFTER INSERT ON posts BEGIN
    INSERT INTO posts_fts(rowid, title, content, tags, location) 
    VALUES (new.id, new.title, new.content, new.tags, new.location);
END;

CREATE TRIGGER posts_ad AFTER DELETE ON posts BEGIN
    INSERT INTO posts_fts(posts_fts, rowid, title, content, tags, location) 
    VALUES('delete', old.id, old.title, old.content, old.tags, old.location);
END;

CREATE TRIGGER posts_au AFTER UPDATE ON posts BEGIN
    INSERT INTO posts_fts(posts_fts, rowid, title, content, tags, location) 
    VALUES('delete', old.id, old.title, old.content, old.tags, old.location);
    INSERT INTO posts_fts(rowid, title, content, tags, location) 
    VALUES (new.id, new.title, new.content, new.tags, new.location);
END;

-- ===== 인덱스 생성 (성능 최적화) =====

-- 사용자 인덱스
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_phone ON users(phone);
CREATE INDEX idx_users_uuid ON users(uuid);
CREATE INDEX idx_users_active ON users(is_active);

-- 사용자 프로필 인덱스
CREATE INDEX idx_user_profiles_user_lang ON user_profiles(user_id, language_code);

-- 토큰 인덱스
CREATE INDEX idx_user_tokens_user ON user_tokens(user_id);
CREATE INDEX idx_user_tokens_hash ON user_tokens(token_hash);
CREATE INDEX idx_user_tokens_expires ON user_tokens(expires_at);

-- 카테고리 인덱스
CREATE INDEX idx_categories_slug ON categories(slug);
CREATE INDEX idx_categories_parent ON categories(parent_id);
CREATE INDEX idx_categories_active ON categories(is_active);

-- 게시글 인덱스
CREATE INDEX idx_posts_author ON posts(author_id);
CREATE INDEX idx_posts_category ON posts(category_id);
CREATE INDEX idx_posts_status ON posts(status);
CREATE INDEX idx_posts_published ON posts(published_at);
CREATE INDEX idx_posts_created ON posts(created_at);
CREATE INDEX idx_posts_pinned ON posts(is_pinned);
CREATE INDEX idx_posts_featured ON posts(is_featured);
CREATE INDEX idx_posts_location ON posts(location);
CREATE INDEX idx_posts_job_type ON posts(job_type);
CREATE INDEX idx_posts_expires ON posts(expires_at);

-- 댓글 인덱스
CREATE INDEX idx_comments_post ON comments(post_id);
CREATE INDEX idx_comments_author ON comments(author_id);
CREATE INDEX idx_comments_parent ON comments(parent_id);
CREATE INDEX idx_comments_created ON comments(created_at);

-- 좋아요 인덱스
CREATE INDEX idx_post_likes_post ON post_likes(post_id);
CREATE INDEX idx_post_likes_user ON post_likes(user_id);
CREATE INDEX idx_comment_likes_comment ON comment_likes(comment_id);
CREATE INDEX idx_comment_likes_user ON comment_likes(user_id);

-- 알림 인덱스
CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_notifications_read ON notifications(is_read);
CREATE INDEX idx_notifications_created ON notifications(created_at);

-- 신고 인덱스
CREATE INDEX idx_reports_reporter ON reports(reporter_id);
CREATE INDEX idx_reports_target ON reports(target_type, target_id);
CREATE INDEX idx_reports_status ON reports(status);

-- ===== 기본 데이터 삽입 =====

-- 기본 카테고리
INSERT INTO categories (slug, sort_order, icon, color) VALUES 
('general', 1, '💬', '#6366f1'),
('jobs', 2, '💼', '#059669'),
('real-estate', 3, '🏠', '#dc2626'),
('marketplace', 4, '🛍️', '#ea580c'),
('lifestyle', 5, '✨', '#8b5cf6'),
('tech', 6, '💻', '#0891b2');

-- 카테고리 다국어 번역
INSERT INTO category_translations (category_id, language_code, name, description) VALUES
-- 일반 게시판
(1, 'ko', '일반', '자유롭게 이야기를 나누는 공간입니다'),
(1, 'zh', '综合', '自由交流讨论的地方'),
(1, 'en', 'General', 'A place for free discussion'),

-- 구직/구인
(2, 'ko', '구직/구인', '취업 정보와 구인 공고를 공유하는 게시판입니다'),
(2, 'zh', '求职/招聘', '分享就业信息和招聘公告的板块'),
(2, 'en', 'Jobs', 'Share job opportunities and employment information'),

-- 부동산
(3, 'ko', '부동산', '매매, 임대 등 부동산 정보를 공유합니다'),
(3, 'zh', '房地产', '分享买卖、租赁等房地产信息'),
(3, 'en', 'Real Estate', 'Share real estate information including sales and rentals'),

-- 중고거래
(4, 'ko', '중고거래', '물품 사고팔기, 나눔 게시판입니다'),
(4, 'zh', '二手交易', '买卖二手物品、分享物品的板块'),
(4, 'en', 'Marketplace', 'Buy, sell, and share items'),

-- 생활정보
(5, 'ko', '생활정보', '일상 생활에 유용한 정보를 공유합니다'),
(5, 'zh', '生活信息', '分享日常生活中有用的信息'),
(5, 'en', 'Lifestyle', 'Share useful information for daily life'),

-- 기술/IT
(6, 'ko', '기술/IT', '기술, 프로그래밍, IT 관련 정보를 공유합니다'),
(6, 'zh', '技术/IT', '分享技术、编程、IT相关信息'),
(6, 'en', 'Tech/IT', 'Share technology, programming, and IT information');

-- ===== 트리거 및 함수 =====

-- 게시글 좋아요 수 업데이트 트리거
CREATE TRIGGER update_post_like_count_insert 
    AFTER INSERT ON post_likes
BEGIN
    UPDATE posts SET 
        like_count = like_count + 1,
        updated_at = CURRENT_TIMESTAMP
    WHERE id = NEW.post_id;
END;

CREATE TRIGGER update_post_like_count_delete 
    AFTER DELETE ON post_likes
BEGIN
    UPDATE posts SET 
        like_count = like_count - 1,
        updated_at = CURRENT_TIMESTAMP
    WHERE id = OLD.post_id;
END;

-- 댓글 수 업데이트 트리거
CREATE TRIGGER update_post_comment_count_insert 
    AFTER INSERT ON comments
BEGIN
    UPDATE posts SET 
        comment_count = comment_count + 1,
        updated_at = CURRENT_TIMESTAMP
    WHERE id = NEW.post_id;
END;

CREATE TRIGGER update_post_comment_count_delete 
    AFTER DELETE ON comments
BEGIN
    UPDATE posts SET 
        comment_count = comment_count - 1,
        updated_at = CURRENT_TIMESTAMP
    WHERE id = OLD.post_id;
END;

-- 댓글 좋아요 수 업데이트 트리거
CREATE TRIGGER update_comment_like_count_insert 
    AFTER INSERT ON comment_likes
BEGIN
    UPDATE comments SET 
        like_count = like_count + 1,
        updated_at = CURRENT_TIMESTAMP
    WHERE id = NEW.comment_id;
END;

CREATE TRIGGER update_comment_like_count_delete 
    AFTER DELETE ON comment_likes
BEGIN
    UPDATE comments SET 
        like_count = like_count - 1,
        updated_at = CURRENT_TIMESTAMP
    WHERE id = OLD.comment_id;
END;

-- updated_at 자동 업데이트 트리거
CREATE TRIGGER users_updated_at AFTER UPDATE ON users BEGIN
    UPDATE users SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

CREATE TRIGGER user_profiles_updated_at AFTER UPDATE ON user_profiles BEGIN
    UPDATE user_profiles SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

CREATE TRIGGER categories_updated_at AFTER UPDATE ON categories BEGIN
    UPDATE categories SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

CREATE TRIGGER category_translations_updated_at AFTER UPDATE ON category_translations BEGIN
    UPDATE category_translations SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

CREATE TRIGGER posts_updated_at AFTER UPDATE ON posts BEGIN
    UPDATE posts SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

CREATE TRIGGER post_translations_updated_at AFTER UPDATE ON post_translations BEGIN
    UPDATE post_translations SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

CREATE TRIGGER comments_updated_at AFTER UPDATE ON comments BEGIN
    UPDATE comments SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

-- ===== 뷰 생성 (자주 사용되는 쿼리 최적화) =====

-- 게시글 목록 뷰 (작성자 정보 포함)
CREATE VIEW posts_with_author AS
SELECT 
    p.id,
    p.uuid,
    p.title,
    p.content,
    p.category_id,
    p.status,
    p.is_pinned,
    p.is_featured,
    p.view_count,
    p.like_count,
    p.comment_count,
    p.job_type,
    p.salary_min,
    p.salary_max,
    p.currency,
    p.location,
    p.expires_at,
    p.published_at,
    p.created_at,
    p.updated_at,
    u.username as author_username,
    u.profile_image as author_profile_image,
    c.slug as category_slug
FROM posts p
JOIN users u ON p.author_id = u.id
JOIN categories c ON p.category_id = c.id
WHERE p.status = 'published' AND u.is_active = TRUE;

-- 댓글 트리 뷰 (작성자 정보 포함)
CREATE VIEW comments_with_author AS
SELECT 
    c.id,
    c.uuid,
    c.post_id,
    c.parent_id,
    c.content,
    c.like_count,
    c.reply_count,
    c.created_at,
    c.updated_at,
    u.username as author_username,
    u.profile_image as author_profile_image
FROM comments c
JOIN users u ON c.author_id = u.id
WHERE c.status = 'published' AND u.is_active = TRUE;