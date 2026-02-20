import { useState, useEffect, useMemo } from 'react'
import { Music, Search, Users, Tv, Calendar, Ticket, Landmark, PartyPopper, ChevronRight, ExternalLink, Star, Filter, ChevronDown } from 'lucide-react'
import { idolDatabase, IDOL_GENERATIONS, IDOL_COMPANIES } from '../data/idolData'

function L(lang, data) {
  if (typeof data === 'string') return data
  return data?.[lang] || data?.en || data?.zh || data?.ko || ''
}

const SECTIONS = [
  { id: 'chart', icon: Music, label: { ko: 'K-POP 차트', zh: 'K-POP榜单', en: 'K-POP Chart' } },
  { id: 'idol', icon: Users, label: { ko: '아이돌', zh: '偶像', en: 'Idols' } },
  { id: 'drama', icon: Tv, label: { ko: 'K-Drama', zh: 'K-Drama', en: 'K-Drama' } },
  { id: 'events', icon: Ticket, label: { ko: '팬이벤트', zh: '粉丝活动', en: 'Fan Events' } },
  { id: 'tradition', icon: Landmark, label: { ko: '전통체험', zh: '传统体验', en: 'Traditions' } },
  { id: 'festival', icon: PartyPopper, label: { ko: '축제', zh: '节日', en: 'Festivals' } },
]

const DRAMAS = [
  { title: { ko: '오징어 게임', zh: '鱿鱼游戏', en: 'Squid Game' }, year: 2021, genre: { ko: '스릴러', zh: '惊悚', en: 'Thriller' }, platform: 'Netflix', rating: 8.0 },
  { title: { ko: '더 글로리', zh: '黑暗荣耀', en: 'The Glory' }, year: 2023, genre: { ko: '드라마', zh: '剧情', en: 'Drama' }, platform: 'Netflix', rating: 8.1 },
  { title: { ko: '무빙', zh: 'Moving', en: 'Moving' }, year: 2023, genre: { ko: '액션/SF', zh: '动作/科幻', en: 'Action/Sci-Fi' }, platform: 'Disney+', rating: 8.5 },
  { title: { ko: '이상한 변호사 우영우', zh: '非常律师禹英禑', en: 'Extraordinary Attorney Woo' }, year: 2022, genre: { ko: '법률/드라마', zh: '法律/剧情', en: 'Legal/Drama' }, platform: 'Netflix', rating: 8.7 },
  { title: { ko: '눈물의 여왕', zh: '泪之女王', en: 'Queen of Tears' }, year: 2024, genre: { ko: '로맨스', zh: '爱情', en: 'Romance' }, platform: 'tvN/Netflix', rating: 8.3 },
  { title: { ko: '재벌집 막내아들', zh: '财阀家的小儿子', en: 'Reborn Rich' }, year: 2022, genre: { ko: '판타지/드라마', zh: '奇幻/剧情', en: 'Fantasy/Drama' }, platform: 'JTBC', rating: 7.9 },
  { title: { ko: '선재 업고 튀어', zh: '背着善宰跑', en: 'Lovely Runner' }, year: 2024, genre: { ko: '로맨스/판타지', zh: '爱情/奇幻', en: 'Romance/Fantasy' }, platform: 'tvN', rating: 8.6 },
  { title: { ko: '킹더랜드', zh: 'King the Land', en: 'King the Land' }, year: 2023, genre: { ko: '로맨스', zh: '爱情', en: 'Romance' }, platform: 'Netflix', rating: 7.5 },
  { title: { ko: '나의 해방일지', zh: '我的出走日记', en: 'My Liberation Notes' }, year: 2022, genre: { ko: '드라마', zh: '剧情', en: 'Drama' }, platform: 'JTBC', rating: 8.4 },
  { title: { ko: '사내맞선', zh: '社内相亲', en: 'Business Proposal' }, year: 2022, genre: { ko: '로맨스/코미디', zh: '爱情/喜剧', en: 'Rom-Com' }, platform: 'Netflix', rating: 7.8 },
  { title: { ko: '슬기로운 의사생활', zh: '机智的医生生活', en: 'Hospital Playlist' }, year: 2020, genre: { ko: '의학/드라마', zh: '医疗/剧情', en: 'Medical/Drama' }, platform: 'Netflix', rating: 9.0 },
  { title: { ko: '빈센조', zh: '文森佐', en: 'Vincenzo' }, year: 2021, genre: { ko: '범죄/코미디', zh: '犯罪/喜剧', en: 'Crime/Comedy' }, platform: 'Netflix', rating: 8.4 },
  { title: { ko: '지금 우리 학교는', zh: '僵尸校园', en: 'All of Us Are Dead' }, year: 2022, genre: { ko: '좀비/액션', zh: '丧尸/动作', en: 'Zombie/Action' }, platform: 'Netflix', rating: 7.5 },
  { title: { ko: '경이로운 소문', zh: '惊奇的传闻', en: 'The Uncanny Counter' }, year: 2020, genre: { ko: '액션/판타지', zh: '动作/奇幻', en: 'Action/Fantasy' }, platform: 'Netflix', rating: 7.8 },
  { title: { ko: '마이 디어 미스터', zh: '我的大叔', en: 'My Mister' }, year: 2018, genre: { ko: '드라마', zh: '剧情', en: 'Drama' }, platform: 'tvN', rating: 9.1 },
  { title: { ko: '도깨비', zh: '鬼怪', en: 'Goblin' }, year: 2016, genre: { ko: '판타지/로맨스', zh: '奇幻/爱情', en: 'Fantasy/Romance' }, platform: 'tvN', rating: 8.7 },
  { title: { ko: '사랑의 불시착', zh: '爱的迫降', en: 'Crash Landing on You' }, year: 2019, genre: { ko: '로맨스', zh: '爱情', en: 'Romance' }, platform: 'Netflix', rating: 8.7 },
  { title: { ko: '이태원 클라쓰', zh: '梨泰院Class', en: 'Itaewon Class' }, year: 2020, genre: { ko: '드라마', zh: '剧情', en: 'Drama' }, platform: 'Netflix', rating: 7.9 },
  { title: { ko: '스위트홈', zh: '甜蜜家园', en: 'Sweet Home' }, year: 2020, genre: { ko: '호러/SF', zh: '恐怖/科幻', en: 'Horror/Sci-Fi' }, platform: 'Netflix', rating: 7.4 },
  { title: { ko: '정신병동에도 아침이 와요', zh: '精神病房也会迎来清晨', en: 'Daily Dose of Sunshine' }, year: 2023, genre: { ko: '의학/드라마', zh: '医疗/剧情', en: 'Medical/Drama' }, platform: 'Netflix', rating: 8.2 },
]

const FAN_EVENTS = [
  { date: '2026-03-15', artist: 'BTS', venue: { ko: '잠실종합운동장', zh: '蚕室综合运动场', en: 'Jamsil Stadium' }, type: { ko: '팬미팅', zh: '粉丝见面会', en: 'Fan Meeting' }, ticket: 'https://ticket.interpark.com' },
  { date: '2026-03-20', artist: 'SEVENTEEN', venue: { ko: '잠실실내체육관', zh: '蚕室室内体育馆', en: 'Jamsil Indoor Arena' }, type: { ko: '콘서트', zh: '演唱会', en: 'Concert' }, ticket: 'https://ticket.yes24.com' },
  { date: '2026-03-28', artist: 'BLACKPINK', venue: { ko: '고척스카이돔', zh: '高尺天空巨蛋', en: 'Gocheok Sky Dome' }, type: { ko: '앙코르 콘서트', zh: '安可演唱会', en: 'Encore Concert' }, ticket: 'https://ticket.melon.com' },
  { date: '2026-03-30', artist: 'G-DRAGON', venue: { ko: 'KSPO돔', zh: 'KSPO圆顶', en: 'KSPO Dome' }, type: { ko: '솔로 콘서트', zh: '个人演唱会', en: 'Solo Concert' }, ticket: 'https://ticket.interpark.com' },
  { date: '2026-04-05', artist: 'aespa', venue: { ko: '올림픽공원', zh: '奥林匹克公园', en: 'Olympic Park' }, type: { ko: 'SYNK 콘서트', zh: 'SYNK演唱会', en: 'SYNK Concert' }, ticket: 'https://ticket.yes24.com' },
  { date: '2026-04-12', artist: 'Jackson Wang', venue: { ko: 'KINTEX', zh: 'KINTEX', en: 'KINTEX' }, type: { ko: 'MAGIC MAN 투어', zh: 'MAGIC MAN巡演', en: 'MAGIC MAN Tour' }, ticket: 'https://ticket.interpark.com' },
  { date: '2026-04-15', artist: 'NewJeans', venue: { ko: '여의도 IFC몰', zh: '汝矣岛IFC', en: 'Yeouido IFC' }, type: { ko: '팬사인회', zh: '粉丝签名会', en: 'Fan Sign' }, ticket: 'https://weverse.io/newjeans' },
  { date: '2026-04-25', artist: 'Stray Kids', venue: { ko: '잠실종합운동장', zh: '蚕室综合运动场', en: 'Jamsil Stadium' }, type: { ko: '도메인 투어', zh: 'DOMAIN巡演', en: 'DOMAIN Tour' }, ticket: 'https://ticket.yes24.com' },
  { date: '2026-05-01', artist: 'BTS', venue: { ko: '상암월드컵경기장', zh: '上岩世界杯体育场', en: 'World Cup Stadium' }, type: { ko: '월드투어', zh: '世界巡演', en: 'World Tour' }, ticket: 'https://weverse.io/bts' },
  { date: '2026-05-16', artist: 'IU', venue: { ko: '올림픽체조경기장', zh: '奥林匹克体操竞技场', en: 'Olympic Gymnastics Arena' }, type: { ko: '생일 콘서트', zh: '生日演唱会', en: 'Birthday Concert' }, ticket: 'https://ticket.melon.com' },
]

const TRADITIONS = [
  { id: 'hanbok', name: { ko: '한복 체험', zh: '韩服体验', en: 'Hanbok Experience' }, desc: { ko: '전통 한복을 입고 경복궁, 북촌 등을 산책할 수 있습니다. 대여점이 경복궁역 주변에 밀집해 있습니다.', zh: '穿上传统韩服,漫步景福宫、北村等地。租赁店集中在景福宫站周边。', en: 'Wear traditional Korean hanbok and stroll around Gyeongbokgung Palace, Bukchon Hanok Village. Rental shops cluster near Gyeongbokgung Station.' }, location: { ko: '서울 종로구 경복궁역', zh: '首尔钟路区景福宫站', en: 'Gyeongbokgung Station, Jongno-gu, Seoul' }, price: '15,000~30,000 KRW', booking: 'https://search.naver.com/search.naver?query=경복궁+한복+대여' },
  { id: 'temple', name: { ko: '템플스테이', zh: '寺院住宿', en: 'Temple Stay' }, desc: { ko: '한국 전통 사찰에서 1박 2일간 수행 체험. 참선, 발우공양, 108배, 다도 등을 경험합니다.', zh: '在韩国传统寺院体验1夜2天的修行。体验参禅、钵盂供养、108拜、茶道等。', en: 'Overnight stay at a Korean temple. Experience Zen meditation, monastic meals, 108 bows, and tea ceremony.' }, location: { ko: '전국 사찰 (조계사, 봉은사 등)', zh: '全国寺院（曹溪寺、奉恩寺等）', en: 'Temples nationwide (Jogyesa, Bongeunsa, etc.)' }, price: '50,000~80,000 KRW', booking: 'https://www.templestay.com' },
  { id: 'pottery', name: { ko: '도자기 만들기', zh: '陶瓷制作', en: 'Pottery Making' }, desc: { ko: '물레를 돌려 나만의 도자기를 만드는 체험. 이천, 여주의 도자 마을이 유명합니다.', zh: '转动陶轮制作属于自己的陶器。利川、骊州的陶瓷村最为有名。', en: 'Spin the pottery wheel to create your own ceramics. Icheon and Yeoju pottery villages are famous.' }, location: { ko: '이천/여주 도자마을, 서울 북촌', zh: '利川/骊州陶瓷村, 首尔北村', en: 'Icheon/Yeoju Pottery Village, Bukchon Seoul' }, price: '25,000~50,000 KRW', booking: 'https://search.naver.com/search.naver?query=도자기+체험' },
  { id: 'tea', name: { ko: '다도 체험', zh: '茶道体验', en: 'Tea Ceremony' }, desc: { ko: '전통 다도를 배우며 녹차, 매실차 등 한국 전통차를 음미합니다. 인사동, 북촌에서 체험 가능합니다.', zh: '学习传统茶道,品味绿茶、梅子茶等韩国传统茶。可在仁寺洞、北村体验。', en: 'Learn the traditional tea ceremony and taste green tea, plum tea, and other Korean teas. Available in Insadong and Bukchon.' }, location: { ko: '서울 인사동, 북촌', zh: '首尔仁寺洞、北村', en: 'Insadong, Bukchon, Seoul' }, price: '15,000~30,000 KRW', booking: 'https://search.naver.com/search.naver?query=다도+체험+서울' },
  { id: 'taekwondo', name: { ko: '태권도 체험', zh: '跆拳道体验', en: 'Taekwondo Experience' }, desc: { ko: '한국 국기인 태권도를 직접 배워볼 수 있습니다. 무주 태권도원, 남산에서 단기 체험 가능합니다.', zh: '亲身学习韩国国技跆拳道。可在茂朱跆拳道院、南山进行短期体验。', en: 'Learn Korea\'s national martial art. Short courses available at Muju Taekwondowon and Namsan.' }, location: { ko: '무주 태권도원 / 서울 남산', zh: '茂朱跆拳道院 / 首尔南山', en: 'Muju Taekwondowon / Namsan, Seoul' }, price: '20,000~40,000 KRW', booking: 'https://search.naver.com/search.naver?query=태권도+체험' },
  { id: 'calligraphy', name: { ko: '서예 체험', zh: '书法体验', en: 'Calligraphy' }, desc: { ko: '붓과 먹을 사용하여 한글 또는 한자 서예를 체험합니다. 인사동 거리에서 쉽게 찾을 수 있습니다.', zh: '使用毛笔和墨水体验韩文或汉字书法。在仁寺洞街道很容易找到。', en: 'Experience Korean or Chinese calligraphy with brush and ink. Easily found on Insadong streets.' }, location: { ko: '서울 인사동', zh: '首尔仁寺洞', en: 'Insadong, Seoul' }, price: '15,000~25,000 KRW', booking: 'https://search.naver.com/search.naver?query=서예+체험+인사동' },
  { id: 'kimchi', name: { ko: '김치 만들기', zh: '制作泡菜', en: 'Kimchi Making' }, desc: { ko: '한국의 대표 발효식품 김치를 직접 담가봅니다. 만든 김치를 진공 포장해 가져갈 수 있습니다.', zh: '亲手腌制韩国代表性发酵食品泡菜。可以将制作的泡菜真空包装带走。', en: 'Make Korea\'s iconic fermented food, kimchi, hands-on. Take your vacuum-packed kimchi home.' }, location: { ko: '서울 종로/삼청동, 전주', zh: '首尔钟路/三清洞, 全州', en: 'Jongno/Samcheong-dong Seoul, Jeonju' }, price: '20,000~35,000 KRW', booking: 'https://search.naver.com/search.naver?query=김치+만들기+체험' },
  { id: 'hanji', name: { ko: '한지 공예', zh: '韩纸工艺', en: 'Hanji Craft' }, desc: { ko: '전통 한지를 이용해 부채, 등, 소품 등을 만드는 공예 체험입니다.', zh: '使用传统韩纸制作扇子、灯笼、小饰品等的工艺体验。', en: 'Craft fans, lanterns, and accessories using traditional Korean hanji paper.' }, location: { ko: '서울 인사동, 전주 한옥마을', zh: '首尔仁寺洞, 全州韩屋村', en: 'Insadong Seoul, Jeonju Hanok Village' }, price: '15,000~30,000 KRW', booking: 'https://search.naver.com/search.naver?query=한지+공예+체험' },
  { id: 'instrument', name: { ko: '전통 악기 체험', zh: '传统乐器体验', en: 'Traditional Instruments' }, desc: { ko: '가야금, 장구, 해금 등 한국 전통 악기를 배워볼 수 있습니다.', zh: '可以学习伽倻琴、长鼓、奚琴等韩国传统乐器。', en: 'Try playing gayageum, janggu drum, haegeum, and other Korean traditional instruments.' }, location: { ko: '국립국악원 / 서울 남산골한옥마을', zh: '国立国乐院 / 首尔南山谷韩屋村', en: 'National Gugak Center / Namsangol Hanok Village' }, price: '10,000~30,000 KRW', booking: 'https://search.naver.com/search.naver?query=전통악기+체험' },
  { id: 'games', name: { ko: '전통 놀이', zh: '传统游戏', en: 'Traditional Games' }, desc: { ko: '윷놀이, 제기차기, 팽이치기, 널뛰기 등 한국 전통 놀이를 체험합니다.', zh: '体验尤茨游戏、踢毽子、打陀螺、跳跷跷板等韩国传统游戏。', en: 'Experience yut nori, jegichagi, top spinning, and other Korean traditional games.' }, location: { ko: '서울 민속촌 / 국립민속박물관', zh: '首尔民俗村 / 国立民俗博物馆', en: 'Korean Folk Village / National Folk Museum' }, price: { ko: '무료~15,000 KRW', zh: '免费~15,000 KRW', en: 'Free~15,000 KRW' }, booking: 'https://search.naver.com/search.naver?query=전통놀이+체험' },
  { id: 'templefood', name: { ko: '사찰 음식', zh: '寺院料理', en: 'Temple Food' }, desc: { ko: '한국 사찰에서 전해 내려오는 채식 위주의 정갈한 음식을 체험합니다.', zh: '体验韩国寺院传承的以素食为主的精致料理。', en: 'Experience the refined vegetarian cuisine passed down in Korean temples.' }, location: { ko: '서울 조계사, 봉은사 / 양양 낙산사', zh: '首尔曹溪寺, 奉恩寺 / 襄阳洛山寺', en: 'Jogyesa, Bongeunsa / Naksansa' }, price: '30,000~60,000 KRW', booking: 'https://search.naver.com/search.naver?query=사찰음식+체험' },
  { id: 'hanok', name: { ko: '한옥 스테이', zh: '韩屋住宿', en: 'Hanok Stay' }, desc: { ko: '전통 한옥에서 1박 숙박하며 온돌, 한옥 건축미를 경험합니다. 북촌, 전주, 경주에서 인기.', zh: '在传统韩屋住宿一晚,体验暖炕和韩屋建筑之美。在北村、全州、庆州最受欢迎。', en: 'Stay overnight in a traditional hanok, experience ondol heating and beautiful architecture. Popular in Bukchon, Jeonju, Gyeongju.' }, location: { ko: '서울 북촌 / 전주 한옥마을 / 경주', zh: '首尔北村 / 全州韩屋村 / 庆州', en: 'Bukchon / Jeonju Hanok Village / Gyeongju' }, price: '80,000~200,000 KRW', booking: 'https://search.naver.com/search.naver?query=한옥스테이+예약' },
]

const FESTIVALS = [
  { name: { ko: '봉은사 연등회', zh: '奉恩寺燃灯会', en: 'Bongeunsa Lotus Lantern Festival' }, date: { ko: '매년 5월 (석가탄신일)', zh: '每年5月（佛诞节）', en: 'May (Buddha\'s Birthday)' }, location: { ko: '서울 봉은사~조계사', zh: '首尔奉恩寺~曹溪寺', en: 'Bongeunsa~Jogyesa, Seoul' }, desc: { ko: '수천 개의 연등이 종로를 밝히는 화려한 행사. 유네스코 인류무형문화유산 등재.', zh: '数千盏莲花灯照亮钟路的华丽活动。已被列入联合国教科文组织人类非物质文化遗产。', en: 'Thousands of lotus lanterns illuminate Jongno. UNESCO Intangible Cultural Heritage.' } },
  { name: { ko: '보령 머드축제', zh: '保宁泥浆节', en: 'Boryeong Mud Festival' }, date: { ko: '매년 7월', zh: '每年7月', en: 'July' }, location: { ko: '충남 보령 대천해수욕장', zh: '忠南保宁大川海水浴场', en: 'Daecheon Beach, Boryeong' }, desc: { ko: '머드(진흙)를 테마로 한 여름 축제. 머드씨름, 머드슬라이드 등 체험 다수.', zh: '以泥浆为主题的夏季节日。有泥浆摔跤、泥浆滑梯等多种体验。', en: 'Summer festival themed around mud. Features mud wrestling, mud slides, and more.' } },
  { name: { ko: '진해 군항제', zh: '镇海军港节', en: 'Jinhae Cherry Blossom Festival' }, date: { ko: '매년 4월 초', zh: '每年4月初', en: 'Early April' }, location: { ko: '경남 창원시 진해구', zh: '庆南昌原市镇海区', en: 'Jinhae-gu, Changwon' }, desc: { ko: '한국 최대의 벚꽃 축제. 35만 그루의 벚나무가 만개하며 군함 관람도 가능.', zh: '韩国最大的樱花节。35万棵樱花树盛开,还可以参观军舰。', en: 'Korea\'s biggest cherry blossom festival with 350,000 cherry trees. Navy ship tours available.' } },
  { name: { ko: '안동 국제탈춤페스티벌', zh: '安东国际假面舞节', en: 'Andong Mask Dance Festival' }, date: { ko: '매년 9~10월', zh: '每年9~10月', en: 'Sep~Oct' }, location: { ko: '경북 안동 하회마을', zh: '庆北安东河回村', en: 'Hahoe Village, Andong' }, desc: { ko: '한국 전통 탈춤과 세계 각국의 가면극을 볼 수 있는 국제 축제.', zh: '可以观看韩国传统假面舞和世界各国面具剧的国际节日。', en: 'International festival featuring Korean mask dance and world mask performances.' } },
  { name: { ko: '부산 국제영화제 (BIFF)', zh: '釜山国际电影节', en: 'Busan International Film Festival' }, date: { ko: '매년 10월', zh: '每年10月', en: 'October' }, location: { ko: '부산 해운대 영화의전당', zh: '釜山海云台电影殿堂', en: 'Busan Cinema Center, Haeundae' }, desc: { ko: '아시아 최대 영화제 중 하나. 전 세계 영화인이 모이는 행사.', zh: '亚洲最大的电影节之一。全世界电影人聚集的盛会。', en: 'One of Asia\'s largest film festivals, attracting filmmakers from around the world.' } },
  { name: { ko: '전주 국제영화제', zh: '全州国际电影节', en: 'Jeonju International Film Festival' }, date: { ko: '매년 5월', zh: '每年5月', en: 'May' }, location: { ko: '전북 전주 한옥마을 일대', zh: '全北全州韩屋村一带', en: 'Jeonju Hanok Village area' }, desc: { ko: '독립영화와 대안영화에 초점을 맞춘 영화제. 전주 한옥마을과 함께 즐기기 좋음.', zh: '聚焦独立电影和另类电影的电影节。适合与全州韩屋村一起享受。', en: 'Film festival focusing on independent and alternative films. Great combined with Jeonju Hanok Village.' } },
  { name: { ko: '춘천 마임축제', zh: '春川默剧节', en: 'Chuncheon Mime Festival' }, date: { ko: '매년 5월', zh: '每年5月', en: 'May' }, location: { ko: '강원 춘천시', zh: '江原春川市', en: 'Chuncheon, Gangwon' }, desc: { ko: '마임, 무용, 서커스 등 비언어 공연 예술 축제. 거리 공연이 도시 전체를 무대로 바꿈.', zh: '哑剧、舞蹈、马戏等非语言表演艺术节日。街头演出将整个城市变成舞台。', en: 'Non-verbal performing arts festival with mime, dance, and circus. Street shows transform the entire city.' } },
  { name: { ko: '화천 산천어축제', zh: '华川山鳟鱼庆典', en: 'Hwacheon Sancheoneo Ice Festival' }, date: { ko: '매년 1월', zh: '每年1月', en: 'January' }, location: { ko: '강원 화천군', zh: '江原华川郡', en: 'Hwacheon, Gangwon' }, desc: { ko: '얼어붙은 강에서 얼음낚시를 즐기는 겨울 축제. 맨손잡기, 썰매 등 체험 다양.', zh: '在结冰的河上享受冰钓的冬季节日。有徒手抓鱼、雪橇等多种体验。', en: 'Winter festival with ice fishing on a frozen river. Bare-hand fishing, sledding, and more.' } },
  { name: { ko: '강릉 커피축제', zh: '江陵咖啡节', en: 'Gangneung Coffee Festival' }, date: { ko: '매년 10월', zh: '每年10月', en: 'October' }, location: { ko: '강원 강릉시 안목해변', zh: '江原江陵市安木海滩', en: 'Anmok Beach, Gangneung' }, desc: { ko: '한국 커피의 성지 강릉에서 열리는 커피 축제. 바리스타 대회, 핸드드립 체험 등.', zh: '在韩国咖啡圣地江陵举办的咖啡节。有咖啡师大赛、手冲体验等。', en: 'Coffee festival in Gangneung, Korea\'s coffee mecca. Barista competitions, hand-drip workshops.' } },
  { name: { ko: '서울 빛초롱축제', zh: '首尔灯节', en: 'Seoul Lantern Festival' }, date: { ko: '매년 11월', zh: '每年11月', en: 'November' }, location: { ko: '서울 청계천', zh: '首尔清溪川', en: 'Cheonggyecheon Stream, Seoul' }, desc: { ko: '청계천에 수천 개의 등불이 설치되는 겨울 축제. 한국 전통과 현대 문화를 조명으로 표현.', zh: '清溪川上安置数千盏灯笼的冬季节日。用灯光表现韩国传统和现代文化。', en: 'Winter festival with thousands of lanterns along Cheonggyecheon. Lights showcasing Korean traditional and modern culture.' } },
]

// ─── Component ───

export default function HallyuTab({ lang }) {
  const [section, setSection] = useState('chart')
  const [chartData, setChartData] = useState([])
  const [chartLoading, setChartLoading] = useState(false)

  // Idol filters
  const [idolSearch, setIdolSearch] = useState('')
  const [idolGen, setIdolGen] = useState('')
  const [idolCompany, setIdolCompany] = useState('')
  const [idolShown, setIdolShown] = useState(20)

  // Fetch Apple Music chart
  useEffect(() => {
    if (section !== 'chart' || chartData.length > 0) return
    setChartLoading(true)
    fetch('https://rss.applemarketingtools.com/api/v2/kr/music/most-played/10/songs.json')
      .then(r => r.json())
      .then(data => {
        const songs = data?.feed?.results || []
        setChartData(songs)
      })
      .catch(() => setChartData([]))
      .finally(() => setChartLoading(false))
  }, [section])

  // Filtered idols
  const filteredIdols = useMemo(() => {
    let list = [...idolDatabase]
    if (idolSearch.trim()) {
      const q = idolSearch.trim().toLowerCase()
      list = list.filter(i => i.name.toLowerCase().includes(q) || i.id.toLowerCase().includes(q))
    }
    if (idolGen) list = list.filter(i => i.gen === idolGen)
    if (idolCompany) list = list.filter(i => i.company.toUpperCase().includes(idolCompany.toUpperCase()))
    return list
  }, [idolSearch, idolGen, idolCompany])

  const GEN_LABELS = { '1st': { ko: '1세대', zh: '第1代', en: '1st Gen' }, '2nd': { ko: '2세대', zh: '第2代', en: '2nd Gen' }, '3rd': { ko: '3세대', zh: '第3代', en: '3rd Gen' }, '4th': { ko: '4세대', zh: '第4代', en: '4th Gen' }, '5th': { ko: '5세대', zh: '第5代', en: '5th Gen' } }

  return (
    <div className="space-y-4">
      {/* Section nav pills */}
      <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1 scrollbar-hide">
        {SECTIONS.map(s => {
          const Icon = s.icon
          return (
            <button
              key={s.id}
              onClick={() => setSection(s.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all shrink-0 ${
                section === s.id
                  ? 'bg-[#111827] text-white'
                  : 'bg-[#F3F4F6] text-[#6B7280] hover:bg-[#E5E7EB]'
              }`}
            >
              <Icon size={14} />
              {L(lang, s.label)}
            </button>
          )
        })}
      </div>

      {/* K-POP Chart */}
      {section === 'chart' && (
        <div className="space-y-3">
          <h2 className="text-sm font-bold text-[#111827]">Apple Music Korea TOP 10</h2>
          {chartLoading && <p className="text-xs text-[#9CA3AF]">{lang === 'ko' ? '로딩 중...' : lang === 'zh' ? '加载中...' : 'Loading...'}</p>}
          {chartData.map((song, i) => (
            <div key={song.id || i} className="bg-white rounded-2xl p-5 border border-[#E5E7EB] card-glow flex items-center gap-3">
              <span className="text-lg font-black text-[#111827] w-7 text-center shrink-0">{i + 1}</span>
              {song.artworkUrl100 && (
                <img src={song.artworkUrl100} alt="" className="w-11 h-11 rounded-lg shrink-0 bg-[#F3F4F6]" />
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-[#111827] truncate">{song.name}</p>
                <p className="text-xs text-[#6B7280] truncate">{song.artistName}</p>
              </div>
              {song.url && (
                <a href={song.url} target="_blank" rel="noopener noreferrer" className="shrink-0 text-[#9CA3AF] hover:text-[#111827]">
                  <ExternalLink size={14} />
                </a>
              )}
            </div>
          ))}
          {!chartLoading && chartData.length === 0 && (
            <p className="text-xs text-[#9CA3AF]">{lang === 'ko' ? '차트를 불러올 수 없습니다' : lang === 'zh' ? '无法加载排行榜' : 'Could not load chart'}</p>
          )}
        </div>
      )}

      {/* Idol Database */}
      {section === 'idol' && (
        <div className="space-y-3">
          <h2 className="text-sm font-bold text-[#111827]">{lang === 'ko' ? '아이돌 데이터베이스' : lang === 'zh' ? '偶像数据库' : 'Idol Database'} ({idolDatabase.length})</h2>
          
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9CA3AF]" />
            <input
              type="text"
              value={idolSearch}
              onChange={e => { setIdolSearch(e.target.value); setIdolShown(20) }}
              placeholder={lang === 'ko' ? '아이돌 검색...' : lang === 'zh' ? '搜索偶像...' : 'Search idols...'}
              className="w-full pl-9 pr-3 py-2.5 text-sm bg-white border border-[#E5E7EB] rounded-xl outline-none focus:border-[#111827] text-[#111827] placeholder:text-[#9CA3AF]"
            />
          </div>

          <div className="flex gap-2 flex-wrap">
            <div className="relative">
              <select value={idolGen} onChange={e => { setIdolGen(e.target.value); setIdolShown(20) }} className="appearance-none text-xs bg-white border border-[#E5E7EB] rounded-lg px-3 py-2 pr-7 text-[#111827] outline-none">
                <option value="">{lang === 'ko' ? '세대 전체' : lang === 'zh' ? '全部世代' : 'All Generations'}</option>
                {IDOL_GENERATIONS.map(g => <option key={g} value={g}>{L(lang, GEN_LABELS[g] || g)}</option>)}
              </select>
              <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 text-[#9CA3AF] pointer-events-none" />
            </div>
            <div className="relative">
              <select value={idolCompany} onChange={e => { setIdolCompany(e.target.value); setIdolShown(20) }} className="appearance-none text-xs bg-white border border-[#E5E7EB] rounded-lg px-3 py-2 pr-7 text-[#111827] outline-none">
                <option value="">{lang === 'ko' ? '소속사 전체' : lang === 'zh' ? '全部经纪公司' : 'All Companies'}</option>
                {IDOL_COMPANIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 text-[#9CA3AF] pointer-events-none" />
            </div>
          </div>

          <p className="text-xs text-[#9CA3AF]">{filteredIdols.length} {lang === 'ko' ? '결과' : lang === 'zh' ? '个结果' : 'results'}</p>

          {filteredIdols.slice(0, idolShown).map(idol => (
            <div key={idol.id} className="bg-white rounded-2xl p-5 border border-[#E5E7EB] card-glow">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-sm font-bold text-[#111827]">{idol.name}</h3>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#F3F4F6] text-[#6B7280]">{L(lang, GEN_LABELS[idol.gen] || idol.gen)}</span>
                  </div>
                  <p className="text-xs text-[#6B7280] mt-1">{idol.company} / {idol.debutYear} / {idol.members > 1 ? `${idol.members} ${lang === 'ko' ? '명' : lang === 'zh' ? '人' : 'members'}` : (lang === 'ko' ? '솔로' : lang === 'zh' ? '个人' : 'Solo')}</p>
                </div>
                {idol.socials?.instagram && (
                  <a href={idol.socials.instagram} target="_blank" rel="noopener noreferrer" className="text-[#9CA3AF] hover:text-[#111827]">
                    <ExternalLink size={14} />
                  </a>
                )}
              </div>
            </div>
          ))}

          {idolShown < filteredIdols.length && (
            <button
              onClick={() => setIdolShown(s => s + 20)}
              className="w-full py-3 text-sm font-semibold text-[#111827] bg-[#F3F4F6] hover:bg-[#E5E7EB] rounded-xl transition-colors"
            >
              {lang === 'ko' ? '더보기' : lang === 'zh' ? '加载更多' : 'Load More'}
            </button>
          )}
        </div>
      )}

      {/* K-Drama */}
      {section === 'drama' && (
        <div className="space-y-3">
          <h2 className="text-sm font-bold text-[#111827]">{lang === 'ko' ? '인기 K-Drama TOP 20' : lang === 'zh' ? '热门韩剧 TOP 20' : 'Popular K-Drama TOP 20'}</h2>
          {DRAMAS.map((d, i) => (
            <div key={i} className="bg-white rounded-2xl p-5 border border-[#E5E7EB] card-glow">
              <div className="flex items-start gap-3">
                <span className="text-lg font-black text-[#111827] w-7 text-center shrink-0">{i + 1}</span>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-bold text-[#111827]">{L(lang, d.title)}</h3>
                  {lang !== 'ko' && <p className="text-xs text-[#9CA3AF]">{d.title.ko}</p>}
                  <div className="flex items-center gap-2 mt-1 text-xs text-[#6B7280] flex-wrap">
                    <span>{d.year}</span>
                    <span>{L(lang, d.genre)}</span>
                    <span>{d.platform}</span>
                    <span className="flex items-center gap-0.5"><Star size={10} className="fill-amber-400 text-amber-400" /> {d.rating}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Fan Events */}
      {section === 'events' && (
        <div className="space-y-3">
          <h2 className="text-sm font-bold text-[#111827]">{lang === 'ko' ? '예정된 팬이벤트' : lang === 'zh' ? '即将举行的粉丝活动' : 'Upcoming Fan Events'}</h2>
          {FAN_EVENTS.map((e, i) => (
            <div key={i} className="bg-white rounded-2xl p-5 border border-[#E5E7EB] card-glow">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-sm font-bold text-[#111827]">{e.artist}</h3>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-purple-50 text-purple-700">{L(lang, e.type)}</span>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-[#6B7280]">
                    <Calendar size={12} />
                    <span>{e.date}</span>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-[#6B7280] mt-0.5">
                    <Landmark size={12} />
                    <span>{L(lang, e.venue)}</span>
                  </div>
                </div>
                <a href={e.ticket} target="_blank" rel="noopener noreferrer" className="shrink-0 flex items-center gap-1 text-[11px] font-semibold text-[#111827] bg-[#F3F4F6] hover:bg-[#E5E7EB] px-3 py-2 rounded-lg transition-colors">
                  <Ticket size={12} />
                  {lang === 'ko' ? '티켓' : lang === 'zh' ? '购票' : 'Tickets'}
                </a>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Traditional Experiences */}
      {section === 'tradition' && (
        <div className="space-y-3">
          <h2 className="text-sm font-bold text-[#111827]">{lang === 'ko' ? '한국 전통 체험' : lang === 'zh' ? '韩国传统体验' : 'Korean Traditional Experiences'}</h2>
          {TRADITIONS.map(t => (
            <div key={t.id} className="bg-white rounded-2xl p-5 border border-[#E5E7EB] card-glow">
              <h3 className="text-sm font-bold text-[#111827] mb-2">{L(lang, t.name)}</h3>
              <p className="text-xs text-[#6B7280] mb-2 leading-relaxed">{L(lang, t.desc)}</p>
              <div className="flex items-center gap-1 text-xs text-[#9CA3AF] mb-1">
                <Landmark size={12} className="shrink-0" />
                <span>{L(lang, t.location)}</span>
              </div>
              <div className="flex items-center justify-between mt-2">
                <span className="text-xs font-semibold text-[#111827]">{L(lang, t.price)}</span>
                <a href={t.booking} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-[11px] font-semibold text-[#111827] bg-[#F3F4F6] hover:bg-[#E5E7EB] px-3 py-2 rounded-lg transition-colors">
                  {lang === 'ko' ? '예약 검색' : lang === 'zh' ? '搜索预约' : 'Search Booking'}
                  <ExternalLink size={10} />
                </a>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Festivals */}
      {section === 'festival' && (
        <div className="space-y-3">
          <h2 className="text-sm font-bold text-[#111827]">{lang === 'ko' ? '한국 주요 축제' : lang === 'zh' ? '韩国主要节日' : 'Major Korean Festivals'}</h2>
          {FESTIVALS.map((f, i) => (
            <div key={i} className="bg-white rounded-2xl p-5 border border-[#E5E7EB] card-glow">
              <h3 className="text-sm font-bold text-[#111827] mb-1">{L(lang, f.name)}</h3>
              <div className="flex items-center gap-1 text-xs text-[#6B7280] mb-1">
                <Calendar size={12} />
                <span>{L(lang, f.date)}</span>
              </div>
              <div className="flex items-center gap-1 text-xs text-[#6B7280] mb-2">
                <Landmark size={12} className="shrink-0" />
                <span>{L(lang, f.location)}</span>
              </div>
              <p className="text-xs text-[#6B7280] leading-relaxed">{L(lang, f.desc)}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
