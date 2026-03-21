-- ============================================================
-- NEAR App — 홍대 카테고리별 시드 데이터
-- Supabase SQL Editor에 붙여넣어 실행하세요.
-- ============================================================

-- 맛집 (food) 5개
INSERT INTO popups (name_zh, name_ko, name_en, category, address_ko, address_zh, lat, lng, district, is_temporary, open_time, close_time, has_alipay, has_wechat_pay, has_visa, has_reservation) VALUES
('姜虎东白丁烤肉 弘大店', '강호동백정 홍대점', 'Baekjeong Hongdae', 'food', '서울 마포구 양화로 166', '首尔 麻浦区 杨花路 166', 37.5563, 126.9234, 'hongdae', false, '11:00', '23:00', false, false, true, false),
('新村食堂 弘大店', '새마을식당 홍대점', 'Saemaeul Sikdang Hongdae', 'food', '서울 마포구 어울마당로 92', '首尔 麻浦区 和谐广场路 92', 37.5535, 126.9210, 'hongdae', false, '00:00', '24:00', false, false, true, false),
('连陌 弘大店', '연모 홍대점', 'Yeonmo Hongdae', 'food', '서울 마포구 어울마당로 118', '首尔 麻浦区 和谐广场路 118', 37.5526, 126.9220, 'hongdae', false, '11:00', '22:00', false, false, true, false),
('校村炸鸡 弘大店', '교촌치킨 홍대점', 'Kyochon Chicken Hongdae', 'food', '서울 마포구 양화로 160', '首尔 麻浦区 杨花路 160', 37.5558, 126.9228, 'hongdae', false, '11:00', '01:00', false, false, true, false),
('满足五花肉 弘大店', '만족오겹살 홍대점', 'Manjok Ogyeopsal Hongdae', 'food', '서울 마포구 와우산로 29길 18', '首尔 麻浦区 卧牛山路29街 18', 37.5548, 126.9268, 'hongdae', false, '11:00', '02:00', false, false, true, false);

-- 카페 (cafe) 5개
INSERT INTO popups (name_zh, name_ko, name_en, category, address_ko, address_zh, lat, lng, district, is_temporary, open_time, close_time, has_alipay, has_wechat_pay, has_visa, has_reservation) VALUES
('延南洞223-14', '연남동 223-14', 'Yeonnamdong 223-14', 'cafe', '서울 마포구 동교로46길 33', '首尔 麻浦区 东桥路46街 33', 37.5616, 126.9250, 'hongdae', false, '11:00', '22:00', false, false, true, false),
('Anthracite Coffee 弘大', '앤트러사이트 커피 홍대', 'Anthracite Coffee Hongdae', 'cafe', '서울 마포구 토정로5길 10', '首尔 麻浦区 土亭路5街 10', 37.5482, 126.9172, 'hongdae', false, '09:00', '22:00', false, false, true, false),
('FRITZ Coffee 延南', '프릳츠 커피 연남', 'Fritz Coffee Yeonnam', 'cafe', '서울 마포구 동교로51길 5', '首尔 麻浦区 东桥路51街 5', 37.5631, 126.9256, 'hongdae', false, '10:00', '22:00', false, false, true, false),
('Cafe Onion 弘大', '카페 어니언 홍대', 'Cafe Onion Hongdae', 'cafe', '서울 마포구 양화로 72', '首尔 麻浦区 杨花路 72', 37.5502, 126.9138, 'hongdae', false, '08:00', '22:00', false, false, true, false),
('Cafe Libre 弘大', '카페 리브레 홍대', 'Cafe Libre Hongdae', 'cafe', '서울 마포구 와우산로29나길 12', '首尔 麻浦区 卧牛山路29NA街 12', 37.5543, 126.9258, 'hongdae', false, '12:00', '22:00', false, false, true, false);

-- 패션 (fashion) 3개
INSERT INTO popups (name_zh, name_ko, name_en, category, address_ko, address_zh, lat, lng, district, is_temporary, open_time, close_time, has_alipay, has_wechat_pay, has_visa, has_reservation) VALUES
('ALAND 弘大旗舰店', '에이랜드 홍대 플래그십', 'ALAND Hongdae', 'fashion', '서울 마포구 어울마당로 144', '首尔 麻浦区 和谐广场路 144', 37.5537, 126.9245, 'hongdae', false, '11:00', '22:00', true, false, true, false),
('STYLENANDA 弘大旗舰店', '스타일난다 홍대 플래그십', 'STYLENANDA Hongdae', 'fashion', '서울 마포구 어울마당로 37', '首尔 麻浦区 和谐广场路 37', 37.5530, 126.9200, 'hongdae', false, '11:00', '22:00', true, true, true, false),
('ADER ERROR 弘大', '아더에러 홍대', 'ADER ERROR Hongdae', 'fashion', '서울 마포구 홍익로3길 20', '首尔 麻浦区 弘益路3街 20', 37.5555, 126.9238, 'hongdae', false, '12:00', '21:00', false, false, true, false);

-- 편의 (convenience) 3개
INSERT INTO popups (name_zh, name_ko, name_en, category, address_ko, address_zh, lat, lng, district, is_temporary, open_time, close_time, has_alipay, has_wechat_pay, has_visa, has_reservation) VALUES
('OLIVE YOUNG 弘大入口站店', '올리브영 홍대입구역점', 'Olive Young Hongdae Station', 'convenience', '서울 마포구 양화로 160 1층', '首尔 麻浦区 杨花路 160 1楼', 37.5565, 126.9230, 'hongdae', false, '10:00', '23:00', true, true, true, false),
('DAISO 弘大入口店', '다이소 홍대입구점', 'Daiso Hongdae', 'convenience', '서울 마포구 양화로 152', '首尔 麻浦区 杨花路 152', 37.5560, 126.9222, 'hongdae', false, '10:00', '22:00', false, false, true, false),
('CU 弘大正门店', 'CU 홍대정문점', 'CU Hongdae Main Gate', 'convenience', '서울 마포구 와우산로 94', '首尔 麻浦区 卧牛山路 94', 37.5510, 126.9260, 'hongdae', false, '00:00', '24:00', false, false, false, false);
