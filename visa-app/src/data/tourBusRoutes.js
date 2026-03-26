/**
 * 서울시티투어버스 노선 데이터 v2
 * // 주 1회 https://www.seoulcitybus.com/ 확인하여 노선/정류장/시간표 변동사항 업데이트
 * // 나머지 노선 데이터 추가 예정: TOUR02 파노라마, TOUR03 전통문화/하이라이트, 강남순환, GLOW UP IN SEOUL
 */

export const TOURBUS_ROUTES_V2 = [
  {
    id: 'TOUR01',
    label: { ko: '도심고궁남산코스', zh: '都心古宫南山线', en: 'Downtown Palace Namsan' },
    color: '#8B0000',
    interval: 60, // 배차간격(분)
    operatingDays: ['tue','wed','thu','fri','sat','sun'], // 월요일 휴무
    fee: { adult: 15000, child: 10000 },
    phone: '02-777-6090',
    period: null, // 상시 운행
    stops: [
      {
        id: 'T01-01', name: { ko: '광화문역', zh: '光化门站', en: 'Gwanghwamun Stn' },
        lat: 37.5710, lng: 126.9769, isTicketStop: true,
        timetable: ['9:30','10:30','11:30','12:30','13:30','14:30','15:30','16:30'],
        summary: {
          stop: { ko: '광화문역 사거리, 동화면세점, 코리아나 호텔', zh: '光化门十字路口，东和免税店，Koreana酒店', en: 'Gwanghwamun intersection, Donghwa Duty Free, Koreana Hotel' },
          marker: { ko: '매표소/쉘터', zh: '售票处/候车亭', en: 'Ticket office / Shelter' },
          subway: { ko: '5호선 광화문역 6번 출구 100m, 1·2호선 시청역 3번 출구 300m', zh: '5号线光化门站6号出口100m', en: 'Line 5 Gwanghwamun Exit 6, 100m' },
          address: { ko: '서울 중구 태평로 1가 63-1', zh: '首尔中区太平路1街63-1', en: 'Taepyeong-ro 1-ga 63-1, Jung-gu' },
        },
        nearbySpots: [
          { name: { ko: '서울광장', zh: '首尔广场', en: 'Seoul Plaza' }, lat: 37.5660, lng: 126.9784 },
          { name: { ko: '광화문광장', zh: '光化门广场', en: 'Gwanghwamun Square' }, lat: 37.5724, lng: 126.9768 },
          { name: { ko: '청계광장', zh: '清溪广场', en: 'Cheonggyecheon Plaza' }, lat: 37.5691, lng: 126.9784 },
        ],
        story: { ko: '광화문역은 대한민국의 정부, 대기업, 문화시설 등이 모여있는 곳으로 근처에는 광화문광장, 청계천광장 등과 같이 시민 및 관광객을 위한 아름다운 명소가 조성되어 있습니다. 서울 관광을 대표하는 서울시티투어버스도 광화문역 6번출구 앞에서 출발합니다.', zh: '光化门站是韩国政府、大企业和文化设施的聚集地，周边有光化门广场、清溪川广场等美丽景点。首尔城市观光巴士也从光化门站6号出口前出发。', en: 'Gwanghwamun is the heart of Korean government and culture. The Seoul City Tour Bus departs from Exit 6.' },
      },
      {
        id: 'T01-02', name: { ko: '덕수궁', zh: '德寿宫', en: 'Deoksugung' },
        lat: 37.5660, lng: 126.9754, isTicketStop: false,
        timetable: ['9:31','10:31','11:31','12:31','13:31','14:31','15:31','16:31'],
        summary: {
          stop: { ko: '덕수궁대한문, 서울광장 건너편', zh: '德寿宫大汉门，首尔广场对面', en: 'Deoksugung Daehanmun, across Seoul Plaza' },
          marker: { ko: '쉘터', zh: '候车亭', en: 'Shelter' },
          subway: { ko: '시청역 3번출구', zh: '市厅站3号出口', en: 'City Hall Stn Exit 3' },
          address: { ko: '서울 중구 세종대로 101', zh: '首尔中区世宗大路101', en: 'Sejong-daero 101, Jung-gu' },
        },
        nearbySpots: [
          { name: { ko: '덕수궁', zh: '德寿宫', en: 'Deoksugung' }, lat: 37.5658, lng: 126.9750 },
          { name: { ko: '덕수궁돌담길', zh: '德寿宫石墙路', en: 'Deoksugung Stone Wall' }, lat: 37.5665, lng: 126.9740 },
          { name: { ko: '정동전망대', zh: '贞洞展望台', en: 'Jeongdong Observatory' }, lat: 37.5670, lng: 126.9720 },
        ],
        story: null,
      },
      {
        id: 'T01-03', name: { ko: '남대문시장', zh: '南大门市场', en: 'Namdaemun Market' },
        lat: 37.5594, lng: 126.9772, isTicketStop: false,
        timetable: ['9:33','10:33','11:33','12:33','13:33','14:33','15:33','16:33'],
        summary: {
          stop: { ko: '부영태평빌딩앞, 프레이저플레이스남대문서울 건너', zh: '富荣太平大厦前', en: 'In front of Buyoung Taepyeong Bldg' },
          marker: { ko: '사인폴', zh: '标志杆', en: 'Sign pole' },
          subway: { ko: '2호선 시청역 8번 출구 300m', zh: '2号线市厅站8号出口300m', en: 'Line 2 City Hall Exit 8, 300m' },
          address: { ko: '서울 중구 세종대로 53-2', zh: '首尔中区世宗大路53-2', en: 'Sejong-daero 53-2, Jung-gu' },
        },
        nearbySpots: [
          { name: { ko: '남대문시장', zh: '南大门市场', en: 'Namdaemun Market' }, lat: 37.5593, lng: 126.9775 },
          { name: { ko: '숭례문광장', zh: '崇礼门广场', en: 'Sungnyemun Plaza' }, lat: 37.5600, lng: 126.9753 },
        ],
        story: { ko: '남대문시장은 서울의 대표적인 600년 전통의 재래시장으로 숭례문(남대문) 근처에 위치해 있습니다. 의류, 잡화, 주방용품 등 1700여 종의 다양한 상품을 판매하며, 맛있는 갈치조림을 먹을 수 있는 갈치조림골목이 위치해 있습니다.', zh: '南大门市场是首尔具有600年传统的代表性传统市场，销售1700多种商品，还有著名的带鱼炖巷。', en: 'Namdaemun Market is a 600-year-old traditional market near Sungnyemun Gate, selling over 1,700 types of goods.' },
      },
      {
        id: 'T01-04', name: { ko: '서울역', zh: '首尔站', en: 'Seoul Station' },
        lat: 37.5547, lng: 126.9707, isTicketStop: false,
        timetable: ['9:36','10:36','11:36','12:36','13:36','14:36','15:36','16:36'],
        summary: {
          stop: { ko: '서울역, 남대문경찰서 건너편', zh: '首尔站，南大门警察局对面', en: 'Seoul Station, across Namdaemun Police' },
          marker: { ko: '사인폴', zh: '标志杆', en: 'Sign pole' },
          subway: { ko: '1호선 서울역 14번 출구 앞', zh: '1号线首尔站14号出口前', en: 'Line 1 Seoul Station Exit 14' },
          address: { ko: '서울 용산구 한강대로 393-1', zh: '首尔龙山区汉江大路393-1', en: 'Hangang-daero 393-1, Yongsan-gu' },
        },
        nearbySpots: [
          { name: { ko: '서울로7017', zh: '首尔路7017', en: 'Seoullo 7017' }, lat: 37.5553, lng: 126.9725 },
          { name: { ko: '서소문역사공원', zh: '西小门历史公园', en: 'Seosomun History Park' }, lat: 37.5563, lng: 126.9683 },
        ],
        story: { ko: '서울역은 대한민국의 주요 교통 허브로 전국 각지로 이동할 수 있는 중추적인 역할을 합니다. 1900년에 남대문 정거장이라는 이름으로 처음 문을 열었고, 1925년에 르네상스 양식의 역사를 준공하였습니다.', zh: '首尔站是韩国主要的交通枢纽，建于1900年，1925年建成文艺复兴风格的站房。', en: 'Seoul Station is a major transport hub, first opened in 1900 as Namdaemun Station.' },
      },
      {
        id: 'T01-05', name: { ko: '전쟁기념관', zh: '战争纪念馆', en: 'War Memorial' },
        lat: 37.5349, lng: 126.9772, isTicketStop: false,
        timetable: ['9:44','10:44','11:44','12:44','13:44','14:44','15:44','16:44'],
        summary: {
          stop: { ko: '솔밭어린이공원, 대우월드마크 부근', zh: '松林儿童公园附近', en: 'Near Solbat Children Park' },
          marker: { ko: '사인폴', zh: '标志杆', en: 'Sign pole' },
          subway: { ko: '6호선 삼각지역 10번 출구 200m', zh: '6号线三角地站10号出口200m', en: 'Line 6 Samgakji Exit 10, 200m' },
          address: { ko: '서울 용산구 한강로1가 1-2', zh: '首尔龙山区汉江路1街1-2', en: 'Hangang-ro 1-ga 1-2, Yongsan-gu' },
        },
        nearbySpots: [
          { name: { ko: '전쟁기념관', zh: '战争纪念馆', en: 'War Memorial' }, lat: 37.5349, lng: 126.9772 },
          { name: { ko: '용리단길', zh: '龙理团路', en: 'Yongridan-gil' }, lat: 37.5320, lng: 126.9700 },
        ],
        story: { ko: '전쟁기념관은 서울 용산에 위치한 호국 전시 및 교육 시설로, 한국전쟁을 포함한 전쟁의 역사를 기억하고, 평화를 배우는 공간입니다.', zh: '战争纪念馆位于首尔龙山区，是纪念包括朝鲜战争在内的战争历史、学习和平的空间。', en: 'The War Memorial of Korea is a space to remember war history and learn about peace.' },
      },
      {
        id: 'T01-06', name: { ko: '용산역', zh: '龙山站', en: 'Yongsan Station' },
        lat: 37.5299, lng: 126.9648, isTicketStop: false,
        timetable: ['9:52','10:52','11:52','12:52','13:52','14:52','15:52','16:52'],
        summary: {
          stop: { ko: '나인트리프리미어로카우스호텔 앞', zh: 'Nine Tree酒店前', en: 'In front of Nine Tree Hotel' },
          marker: { ko: '사인폴', zh: '标志杆', en: 'Sign pole' },
          subway: { ko: '1호선 용산역 1번출구 150m', zh: '1号线龙山站1号出口150m', en: 'Line 1 Yongsan Exit 1, 150m' },
          address: { ko: '서울 용산구 한강로3가 99-1', zh: '首尔龙山区汉江路3街99-1', en: 'Hangang-ro 3-ga 99-1, Yongsan-gu' },
        },
        nearbySpots: [
          { name: { ko: '아이파크몰', zh: 'I\'Park Mall', en: 'I\'Park Mall' }, lat: 37.5299, lng: 126.9650 },
          { name: { ko: '용산어린이정원', zh: '龙山儿童花园', en: 'Yongsan Children Garden' }, lat: 37.5280, lng: 126.9670 },
        ],
        story: { ko: '용산역은 대한민국의 주요 철도 허브로 호남선을 중심으로 하는 KTX 및 다양한 기차들의 기점 및 종착역으로 기능합니다.', zh: '龙山站是韩国主要铁路枢纽，是湖南线KTX等列车的起点和终点站。', en: 'Yongsan Station is a major railway hub for KTX trains on the Honam Line.' },
      },
      {
        id: 'T01-07', name: { ko: '하이브본사, 용산역사박물관', zh: 'HYBE总部, 龙山历史博物馆', en: 'HYBE HQ, Yongsan Museum' },
        lat: 37.5283, lng: 126.9654, isTicketStop: false,
        timetable: ['9:54','10:54','11:54','12:54','13:54','14:54','15:54','16:54'],
        summary: {
          stop: { ko: '용산역사박물관 앞 버스정류장', zh: '龙山历史博物馆前公交站', en: 'Bus stop near Yongsan History Museum' },
          marker: { ko: '사인폴', zh: '标志杆', en: 'Sign pole' },
          subway: { ko: '1호선 용산역 1번 출구 500m', zh: '1号线龙山站1号出口500m', en: 'Line 1 Yongsan Exit 1, 500m' },
          address: { ko: '서울특별시 용산구 한강로3가 64', zh: '首尔市龙山区汉江路3街64', en: 'Hangang-ro 3-ga 64, Yongsan-gu' },
        },
        nearbySpots: [
          { name: { ko: '용산역사박물관', zh: '龙山历史博物馆', en: 'Yongsan History Museum' }, lat: 37.5285, lng: 126.9660 },
        ],
        story: { ko: '하이브 본사는 서울 용산구에 위치한 글로벌 엔터테인먼트 기업 하이브(HYBE)의 중심 공간으로, K-pop을 대표하는 기업의 본사 건물입니다. 방탄소년단(BTS)을 비롯한 다양한 아티스트들이 소속된 회사로 알려져 있어 전 세계 팬들이 찾는 장소이기도 합니다.', zh: 'HYBE总部是全球娱乐企业HYBE的核心空间，是以BTS为代表的K-pop公司总部，吸引全球粉丝前来。', en: 'HYBE HQ is the headquarters of the global entertainment company known for BTS, attracting fans worldwide.' },
        btsCityDay: true, // BTS THE CITY DAY 특별 표시
      },
      {
        id: 'T01-08', name: { ko: '국립중앙박물관', zh: '国立中央博物馆', en: 'National Museum' },
        lat: 37.5239, lng: 126.9803, isTicketStop: false,
        timetable: ['10:00','11:00','12:00','13:00','14:00','15:00','16:00','17:00'],
        summary: {
          stop: { ko: '국립중앙박물관 정문 건너편, 한강성당 부근', zh: '国立中央博物馆正门对面', en: 'Across National Museum main gate' },
          marker: { ko: '사인폴', zh: '标志杆', en: 'Sign pole' },
          subway: { ko: '4호선 이촌역 3번출구 300m', zh: '4号线二村站3号出口300m', en: 'Line 4 Ichon Exit 3, 300m' },
          address: { ko: '서울 용산구 용산동6가 11-376', zh: '首尔龙山区龙山洞6街11-376', en: 'Yongsan-dong 6-ga 11-376' },
        },
        nearbySpots: [
          { name: { ko: '국립중앙박물관', zh: '国立中央博物馆', en: 'National Museum of Korea' }, lat: 37.5239, lng: 126.9803 },
          { name: { ko: '국립한글박물관', zh: '国立韩文博物馆', en: 'Hangeul Museum' }, lat: 37.5220, lng: 126.9815 },
        ],
        story: { ko: '국립중앙박물관은 한국 최대 규모의 국립 박물관으로, 관람객수 기준 세계 6위, 아시아 1위입니다. 해외에서 약탈한 유물 없이 자국의 유물만으로 이룬 성과는 그 의미가 더욱 깊습니다.', zh: '国立中央博物馆是韩国最大的国立博物馆，按参观人数计全球第6、亚洲第1。', en: 'The National Museum of Korea is the largest in Korea, ranked 6th globally by visitors.' },
      },
      {
        id: 'T01-09', name: { ko: '이태원, 해밀턴호텔', zh: '梨泰院, Hamilton酒店', en: 'Itaewon, Hamilton Hotel' },
        lat: 37.5346, lng: 126.9946, isTicketStop: false,
        timetable: ['10:09','11:09','12:09','13:09','14:09','15:09','16:09','17:09'],
        summary: {
          stop: { ko: '해밀턴호텔 건너편', zh: 'Hamilton酒店对面', en: 'Across Hamilton Hotel' },
          marker: { ko: '사인폴', zh: '标志杆', en: 'Sign pole' },
          subway: { ko: '6호선 이태원역 4번 출구 30m', zh: '6号线梨泰院站4号出口30m', en: 'Line 6 Itaewon Exit 4, 30m' },
          address: { ko: '서울특별시 용산구 이태원로 171-1', zh: '首尔市龙山区梨泰院路171-1', en: 'Itaewon-ro 171-1, Yongsan-gu' },
        },
        nearbySpots: [
          { name: { ko: '리움미술관', zh: 'Leeum美术馆', en: 'Leeum Museum' }, lat: 37.5380, lng: 126.9990 },
          { name: { ko: '서울중앙성원', zh: '首尔中央清真寺', en: 'Seoul Central Mosque' }, lat: 37.5348, lng: 126.9932 },
        ],
        story: { ko: '이태원은 서울 용산구에 위치한 대표적인 국제 문화 거리로, 다양한 국가의 음식과 문화를 경험할 수 있는 지역입니다.', zh: '梨泰院是首尔龙山区的代表性国际文化街，可体验各国美食和文化。', en: 'Itaewon is an international culture street where you can experience food and culture from around the world.' },
      },
      {
        id: 'T01-10', name: { ko: '동대문DDP, 동대문시장', zh: '东大门DDP, 东大门市场', en: 'DDP, Dongdaemun Market' },
        lat: 37.5673, lng: 127.0095, isTicketStop: false,
        timetable: ['10:24','11:24','12:24','13:24','14:24','15:24','16:24','17:24'],
        summary: {
          stop: { ko: '동대문디자인플라자(DDP) 중앙, 태극기 게양대 앞', zh: '东大门设计广场(DDP)中央', en: 'DDP center, in front of flag pole' },
          marker: { ko: '사인폴', zh: '标志杆', en: 'Sign pole' },
          subway: { ko: '2·4호선 동대문역사문화공원역 1번 출구 200m', zh: '2·4号线东大门历史文化公园站1号出口200m', en: 'Line 2/4 DHCP Exit 1, 200m' },
          address: { ko: '서울 중구 을지로7가 2-34', zh: '首尔中区乙支路7街2-34', en: 'Euljiro 7-ga 2-34, Jung-gu' },
        },
        nearbySpots: [
          { name: { ko: '동대문디자인플라자(DDP)', zh: '东大门设计广场(DDP)', en: 'Dongdaemun Design Plaza' }, lat: 37.5673, lng: 127.0095 },
          { name: { ko: '광장시장', zh: '广藏市场', en: 'Gwangjang Market' }, lat: 37.5700, lng: 127.0100 },
        ],
        story: { ko: '동대문 DDP는 컨벤션, 디자인 전시, 공연, 패션쇼 등이 이뤄지는 복합문화공간으로, 우주선을 닮은 건축 랜드마크입니다.', zh: 'DDP是举办展览、演出、时装秀等的复合文化空间，建筑外形如同宇宙飞船。', en: 'DDP is a cultural complex for exhibitions, performances, and fashion shows, with a spaceship-like architecture.' },
      },
      {
        id: 'T01-11', name: { ko: '창덕궁', zh: '昌德宫', en: 'Changdeokgung' },
        lat: 37.5794, lng: 126.9910, isTicketStop: false,
        timetable: ['10:35','11:35','12:35','13:35','14:35','15:35','16:35','17:35'],
        summary: {
          stop: { ko: '창덕궁 정문 근처 단봉문 앞', zh: '昌德宫正门附近', en: 'Near Changdeokgung main gate' },
          marker: { ko: '쉘터', zh: '候车亭', en: 'Shelter' },
          subway: { ko: '3호선 안국역 3번 출구 500m', zh: '3号线安国站3号出口500m', en: 'Line 3 Anguk Exit 3, 500m' },
          address: { ko: '서울 종로구 와룡동 8', zh: '首尔钟路区卧龙洞8', en: 'Waryong-dong 8, Jongno-gu' },
        },
        nearbySpots: [
          { name: { ko: '창덕궁', zh: '昌德宫', en: 'Changdeokgung' }, lat: 37.5794, lng: 126.9910 },
          { name: { ko: '운현궁', zh: '云岘宫', en: 'Unhyeongung' }, lat: 37.5766, lng: 126.9878 },
        ],
        story: { ko: '유네스코 세계 문화유산이자 조선 시대 궁궐 중 원형이 가장 잘 보존된 창덕궁은 역대 조선의 왕들이 가장 오랫동안 머물렀던 궁궐입니다.', zh: '昌德宫是联合国教科文组织世界文化遗产，是朝鲜时代保存最完好的宫殿。', en: 'A UNESCO World Heritage Site, Changdeokgung is the best-preserved Joseon Dynasty palace.' },
      },
      {
        id: 'T01-12', name: { ko: '인사동, 북촌', zh: '仁寺洞, 北村', en: 'Insadong, Bukchon' },
        lat: 37.5760, lng: 126.9854, isTicketStop: false,
        timetable: ['10:39','11:39','12:39','13:39','14:39','15:39','16:39','17:39'],
        summary: {
          stop: { ko: '종로경찰서 건너편', zh: '钟路警察局对面', en: 'Across Jongno Police Station' },
          marker: { ko: '쉘터', zh: '候车亭', en: 'Shelter' },
          subway: { ko: '3호선 안국역 1번 출구 50m', zh: '3号线安国站1号出口50m', en: 'Line 3 Anguk Exit 1, 50m' },
          address: { ko: '서울 종로구 안국동 175-92', zh: '首尔钟路区安国洞175-92', en: 'Anguk-dong 175-92, Jongno-gu' },
        },
        nearbySpots: [
          { name: { ko: '인사동거리', zh: '仁寺洞街', en: 'Insadong Street' }, lat: 37.5743, lng: 126.9858 },
          { name: { ko: '북촌한옥마을', zh: '北村韩屋村', en: 'Bukchon Hanok Village' }, lat: 37.5826, lng: 126.9831 },
        ],
        story: { ko: '인사동 거리는 오래전부터 화랑과 갤러리가 많아 서울의 대표적인 화랑거리로 꼽힙니다. 북촌 한옥마을은 경복궁과 창덕궁 사이에 9백여 동의 한옥이 빼곡히 들어선 곳입니다.', zh: '仁寺洞是首尔代表性的画廊街。北村韩屋村有900多栋韩屋。', en: 'Insadong is known for galleries and art. Bukchon has over 900 traditional hanok houses.' },
      },
      {
        id: 'T01-13', name: { ko: '청와대 앞', zh: '青瓦台前', en: 'Cheongwadae' },
        lat: 37.5866, lng: 126.9748, isTicketStop: false,
        timetable: ['10:43','11:43','12:43','13:43','14:43','15:43','16:43','17:43'],
        summary: {
          stop: { ko: '청와대 앞 삼거리 분수대 인근', zh: '青瓦台前三岔口喷泉附近', en: 'Near Cheongwadae intersection fountain' },
          marker: { ko: '쉘터', zh: '候车亭', en: 'Shelter' },
          subway: { ko: '없음', zh: '无', en: 'None' },
          address: { ko: '서울 종로구 세종로 1-39', zh: '首尔钟路区世宗路1-39', en: 'Sejong-ro 1-39, Jongno-gu' },
        },
        nearbySpots: [
          { name: { ko: '청와대', zh: '青瓦台', en: 'Cheongwadae' }, lat: 37.5866, lng: 126.9748 },
          { name: { ko: '통인시장', zh: '通仁市场', en: 'Tongin Market' }, lat: 37.5790, lng: 126.9695 },
        ],
        story: { ko: '청와대는 대한민국 대통령의 집무실과 관저 등이 있는 복합 시설로 최근 국민에게 개방되어 사전 예약 시 내부를 관람할 수 있습니다.', zh: '青瓦台是韩国总统的办公和居住设施，近年向公众开放参观。', en: 'Cheongwadae (Blue House) is the former presidential residence, now open to the public.' },
      },
      {
        id: 'T01-14', name: { ko: '경복궁, 민속박물관', zh: '景福宫, 民俗博物馆', en: 'Gyeongbokgung, Folk Museum' },
        lat: 37.5815, lng: 126.9790, isTicketStop: false,
        timetable: ['10:46','11:46','12:46','13:46','14:46','15:46','16:46','17:46'],
        summary: {
          stop: { ko: '국립민속박물관 정문 옆 버스 정류장', zh: '国立民俗博物馆正门旁公交站', en: 'Bus stop next to Folk Museum gate' },
          marker: { ko: '쉘터', zh: '候车亭', en: 'Shelter' },
          subway: { ko: '3호선 경복궁역', zh: '3号线景福宫站', en: 'Line 3 Gyeongbokgung Stn' },
          address: { ko: '서울 종로구 세종로 1-61', zh: '首尔钟路区世宗路1-61', en: 'Sejong-ro 1-61, Jongno-gu' },
        },
        nearbySpots: [
          { name: { ko: '경복궁', zh: '景福宫', en: 'Gyeongbokgung' }, lat: 37.5796, lng: 126.9770 },
          { name: { ko: '국립현대미술관', zh: '国立现代美术馆', en: 'MMCA Seoul' }, lat: 37.5789, lng: 126.9802 },
        ],
        story: { ko: '경복궁은 조선 시대 최초의 궁궐입니다. 매주 화요일 휴궁일입니다.', zh: '景福宫是朝鲜时代第一座宫殿。每周二闭宫。', en: 'Gyeongbokgung is the first Joseon Dynasty palace. Closed every Tuesday.' },
      },
      {
        id: 'T01-15', name: { ko: '세종문화회관, 광화문광장', zh: '世宗文化会馆, 光化门广场', en: 'Sejong Center, Gwanghwamun Sq' },
        lat: 37.5724, lng: 126.9768, isTicketStop: false,
        timetable: ['10:50','11:50','12:50','13:50','14:50','15:50','16:50','17:50'],
        summary: {
          stop: { ko: '세종문화회관 정문 근처, 미국대사관 건너', zh: '世宗文化会馆正门附近', en: 'Near Sejong Center, across US Embassy' },
          marker: { ko: '쉘터', zh: '候车亭', en: 'Shelter' },
          subway: { ko: '5호선 광화문역 2번 출구', zh: '5号线光化门站2号出口', en: 'Line 5 Gwanghwamun Exit 2' },
          address: { ko: '서울 종로구 세종로 1-68', zh: '首尔钟路区世宗路1-68', en: 'Sejong-ro 1-68, Jongno-gu' },
        },
        nearbySpots: [
          { name: { ko: '세종문화회관', zh: '世宗文化会馆', en: 'Sejong Center' }, lat: 37.5724, lng: 126.9768 },
          { name: { ko: '광화문광장', zh: '光化门广场', en: 'Gwanghwamun Square' }, lat: 37.5724, lng: 126.9768 },
        ],
        story: { ko: '세종문화회관은 한국을 대표하는 공연장이자 복합문화공간입니다. 광화문광장은 길이 557m, 너비 34m의 대형 광장으로 세종대왕, 이순신 장군 동상을 만날 수 있습니다.', zh: '世宗文化会馆是韩国代表性演出场所。光化门广场长557米、宽34米，可看到世宗大王和李舜臣将军铜像。', en: 'Sejong Center is a premier performance venue. Gwanghwamun Square features statues of King Sejong and Admiral Yi Sun-sin.' },
      },
    ],
    // 광화문역 도착: [11:00, 12:00, ..., 18:00]
  },
  {
    id: 'TOUR04',
    // 2026-03-22~04-19: "BTS THE CITY SEOUL NIGHT" 임시 운영, 04-21~: 원래 야간 한강·남산 코스 복귀
    label: { ko: '야경코스', zh: '夜景线', en: 'Night Tour' },
    _tempLabel: { ko: 'BTS THE CITY SEOUL NIGHT', zh: 'BTS THE CITY SEOUL NIGHT', en: 'BTS THE CITY SEOUL NIGHT' },
    _tempStart: '2026-03-22', _tempEnd: '2026-04-19',
    color: '#CC0000',
    interval: null, // 1회 운행
    operatingDays: ['mon','tue','wed','thu','fri','sat','sun'],
    fee: { adult: 20000, child: 17000 },
    phone: '02-777-6090',
    period: null,
    type: 'driving', // Hop-on Hop-off 아님, 무정차 순환
    duration: 90, // 약 90분
    departureTime: '19:00',
    boardingStart: '18:20', // 출발 40분 전 탑승
    nSeoulTowerStop: 20, // N서울타워 20분 정차
    stops: [
      { id: 'T04-01', name: { ko: '광화문', zh: '光化门', en: 'Gwanghwamun' }, lat: 37.5710, lng: 126.9769, isTicketStop: true, noStop: false,
        timetable: ['19:00'], summary: null, nearbySpots: [], story: null },
      { id: 'T04-02', name: { ko: '덕수궁', zh: '德寿宫', en: 'Deoksugung' }, lat: 37.5660, lng: 126.9754, noStop: true,
        timetable: ['19:02'], summary: null, nearbySpots: [], story: null },
      { id: 'T04-03', name: { ko: '남대문시장', zh: '南大门市场', en: 'Namdaemun Market' }, lat: 37.5594, lng: 126.9772, noStop: true,
        timetable: ['19:04'], summary: null, nearbySpots: [], story: null },
      { id: 'T04-04', name: { ko: '명동', zh: '明洞', en: 'Myeongdong' }, lat: 37.5607, lng: 126.9860, noStop: true,
        timetable: ['19:08'],
        summary: {
          stop: { ko: '프린스 호텔 옆, 노스페이스 빌딩 앞', zh: 'Prince酒店旁', en: 'Next to Prince Hotel' },
          marker: { ko: '쉘터', zh: '候车亭', en: 'Shelter' },
          subway: { ko: '4호선 명동역 2,3번 출구 사이', zh: '4号线明洞站2、3号出口之间', en: 'Line 4 Myeongdong Exit 2-3' },
          address: { ko: '서울 중구 퇴계로 124-1', zh: '首尔中区退溪路124-1', en: 'Toegye-ro 124-1, Jung-gu' },
        },
        nearbySpots: [{ name: { ko: '명동성당', zh: '明洞圣堂', en: 'Myeongdong Cathedral' }, lat: 37.5633, lng: 126.9873 }],
        story: { ko: '명동 거리는 서울의 대표적인 쇼핑타운으로, 백화점을 비롯해 각종 의류, 신발 브랜드 매장, 유명 화장품, 보세 가게와 액세서리 숍을 만날 수 있습니다.', zh: '明洞是首尔代表性购物区，有百货商店、各种品牌店和化妆品店。', en: 'Myeongdong is Seoul\'s premier shopping district with department stores, brand shops, and cosmetics.' },
      },
      { id: 'T04-05', name: { ko: '남산골 한옥마을', zh: '南山韩屋村', en: 'Namsangol Hanok' }, lat: 37.5590, lng: 126.9940, noStop: true,
        timetable: ['19:12'],
        summary: {
          stop: { ko: '파리바게트 앞, 이디야 커피 앞', zh: '巴黎贝甜前', en: 'In front of Paris Baguette' },
          marker: { ko: '사인폴', zh: '标志杆', en: 'Sign pole' },
          subway: { ko: '3,4호선 충무로역 4번 출구 50m', zh: '3、4号线忠武路站4号出口50m', en: 'Line 3/4 Chungmuro Exit 4, 50m' },
          address: { ko: '서울 중구 필동1가 22-1', zh: '首尔中区笔洞1街22-1', en: 'Pildong 1-ga 22-1, Jung-gu' },
        },
        nearbySpots: [{ name: { ko: '남산골 한옥마을', zh: '南山韩屋村', en: 'Namsangol Hanok Village' }, lat: 37.5590, lng: 126.9941 }],
        story: { ko: '조선 시대 마을의 모습을 그대로 간직한 남산골 한옥마을에서는 한글 쓰기, 전통 매듭짓기 등 전통문화 체험을 할 수 있습니다.', zh: '南山韩屋村保留了朝鲜时代村庄面貌，可体验韩文书写、传统结艺等。', en: 'Namsangol Hanok Village offers traditional culture experiences like Hangeul writing and knot-tying.' },
      },
      { id: 'T04-06', name: { ko: '앰배서더 서울 풀만 호텔', zh: 'Ambassador首尔铂尔曼酒店', en: 'Ambassador Pullman Hotel' }, lat: 37.5580, lng: 126.9980, noStop: true,
        timetable: ['19:14'],
        summary: {
          stop: { ko: '앰배서더 서울 풀만 호텔 정문 앞', zh: '酒店正门前', en: 'Hotel main entrance' },
          marker: { ko: '사인폴', zh: '标志杆', en: 'Sign pole' },
          subway: null,
          address: { ko: '서울 중구 장충동2가 186-169', zh: '首尔中区奖忠洞2街186-169', en: 'Jangchung-dong 2-ga 186-169' },
        },
        nearbySpots: [],
        story: { ko: '서울의 중심에 위치한 앰배서더 서울 풀만 호텔은 국내 첫 민영 호텔로써 1955년부터 현재까지 유서 깊은 헤리티지를 지켜오고 있습니다.', zh: '位于首尔中心的Ambassador首尔铂尔曼酒店是韩国首家民营酒店，自1955年延续至今。', en: 'Ambassador Seoul Pullman Hotel is Korea\'s first private hotel, operating since 1955.' },
      },
      { id: 'T04-07', name: { ko: '신라호텔, 장충단공원', zh: '新罗酒店, 奖忠坛公园', en: 'Shilla Hotel, Jangchungdan' }, lat: 37.5571, lng: 127.0042, noStop: true,
        timetable: ['19:16'],
        summary: {
          stop: { ko: '장충체육관 건너 장충단공원 입구', zh: '奖忠体育馆对面公园入口', en: 'Across Jangchung Gym, park entrance' },
          marker: { ko: '사인폴', zh: '标志杆', en: 'Sign pole' },
          subway: { ko: '3호선 동대입구역 6번 출구 50m', zh: '3号线东大入口站6号出口50m', en: 'Line 3 Dongguk Univ Exit 6, 50m' },
          address: { ko: '서울 중구 장충동2가 산 4-91', zh: '首尔中区奖忠洞2街山4-91', en: 'Jangchung-dong 2-ga san 4-91' },
        },
        nearbySpots: [
          { name: { ko: '장충단공원', zh: '奖忠坛公园', en: 'Jangchungdan Park' }, lat: 37.5565, lng: 127.0050 },
          { name: { ko: '장충동 족발거리', zh: '奖忠洞猪蹄街', en: 'Jokbal Street' }, lat: 37.5575, lng: 127.0055 },
        ],
        story: { ko: '신라호텔은 수많은 국빈 방문과 국제행사를 치뤄낸 서울의 대표 호텔로 1979년 현재의 건물을 새로 지어 개관하였습니다.', zh: '新罗酒店是首尔代表性酒店，1979年建成现在的建筑。', en: 'Shilla Hotel is one of Seoul\'s premier hotels, rebuilt in 1979.' },
      },
      { id: 'T04-08', name: { ko: 'N서울타워 (20분 정차)', zh: 'N首尔塔（停留20分钟）', en: 'N Seoul Tower (20min stop)' }, lat: 37.5512, lng: 126.9882, noStop: false,
        timetable: ['19:25'],
        summary: {
          stop: { ko: 'N서울타워 버스정류장', zh: 'N首尔塔公交站', en: 'N Seoul Tower bus stop' },
          marker: { ko: '사인폴', zh: '标志杆', en: 'Sign pole' },
          subway: null,
          address: { ko: '서울 중구 예장동 산 5-6', zh: '首尔中区艺场洞山5-6', en: 'Yejang-dong san 5-6, Jung-gu' },
        },
        nearbySpots: [
          { name: { ko: 'N서울타워', zh: 'N首尔塔', en: 'N Seoul Tower' }, lat: 37.5512, lng: 126.9882 },
          { name: { ko: '남산케이블카', zh: '南山缆车', en: 'Namsan Cable Car' }, lat: 37.5570, lng: 126.9813 },
        ],
        story: { ko: '서울 관광 명소 1위로 꼽힌 바 있는 서울의 상징이자, 멋진 전망대 뷰와 함께 연인들의 사랑의 자물쇠가 걸려있는 로맨틱한 장소입니다. 야경 투어에서는 약 20분간 정차합니다.', zh: '曾被评为首尔观光名胜第1名的首尔象征，夜景优美，恋人锁所在的浪漫之地。夜景游在此停留约20分钟。', en: 'Seoul\'s #1 landmark with stunning observatory views and love locks. Night tour stops here for ~20 minutes.' },
      },
      { id: 'T04-09', name: { ko: '하얏트호텔', zh: '凯悦酒店', en: 'Hyatt Hotel' }, lat: 37.5380, lng: 126.9920, noStop: true,
        timetable: ['19:50'],
        summary: {
          stop: { ko: '하얏트호텔, 육교 버스 정류장', zh: '凯悦酒店天桥公交站', en: 'Hyatt Hotel overpass bus stop' },
          marker: { ko: '쉘터', zh: '候车亭', en: 'Shelter' },
          subway: null,
          address: { ko: '서울 용산구 이태원동 258-466', zh: '首尔龙山区梨泰院洞258-466', en: 'Itaewon-dong 258-466, Yongsan-gu' },
        },
        nearbySpots: [{ name: { ko: '경리단길', zh: '经理团路', en: 'Gyeongridan-gil' }, lat: 37.5370, lng: 126.9900 }],
        story: { ko: '1978년 개관한 하얏트호텔은 서울의 상징인 남산과 한강을 가까이 즐길 수 있는 곳입니다.', zh: '凯悦酒店于1978年开业，可近距离欣赏南山和汉江。', en: 'Hyatt Hotel, opened in 1978, offers views of Namsan and Han River.' },
      },
      { id: 'T04-10', name: { ko: '동대문DDP', zh: '东大门DDP', en: 'DDP' }, lat: 37.5673, lng: 127.0095, noStop: true,
        timetable: ['20:00'], summary: null, nearbySpots: [], story: null },
      { id: 'T04-11', name: { ko: '창덕궁', zh: '昌德宫', en: 'Changdeokgung' }, lat: 37.5794, lng: 126.9910, noStop: true,
        timetable: ['20:10'], summary: null, nearbySpots: [], story: null },
      { id: 'T04-12', name: { ko: '인사동, 북촌', zh: '仁寺洞, 北村', en: 'Insadong, Bukchon' }, lat: 37.5760, lng: 126.9854, noStop: true,
        timetable: ['20:14'], summary: null, nearbySpots: [], story: null },
      { id: 'T04-13', name: { ko: '경복궁, 현대미술관', zh: '景福宫, 现代美术馆', en: 'Gyeongbokgung, MMCA' }, lat: 37.5815, lng: 126.9790, noStop: true,
        timetable: ['20:18'], summary: null, nearbySpots: [], story: null },
      { id: 'T04-14', name: { ko: '청와대 앞', zh: '青瓦台前', en: 'Cheongwadae' }, lat: 37.5866, lng: 126.9748, noStop: true,
        timetable: ['20:22'], summary: null, nearbySpots: [], story: null },
      { id: 'T04-15', name: { ko: '세종문화회관, 광화문광장', zh: '世宗文化会馆', en: 'Sejong Center' }, lat: 37.5724, lng: 126.9768, noStop: false,
        timetable: ['20:30'], summary: null, nearbySpots: [], story: null },
    ],
  },
  {
    id: 'BTS-CITY-DAY',
    label: { ko: 'BTS THE CITY DAY', zh: 'BTS THE CITY DAY', en: 'BTS THE CITY DAY' },
    color: '#FF0000',
    interval: 60,
    operatingDays: ['tue','wed','thu','fri','sat','sun'],
    fee: { adult: 15000, child: 10000 },
    phone: '02-777-6090',
    period: { start: '2026-03-23', end: '2026-04-17' }, // 한정 기간
    // TOUR01과 동일 정류장 (참조)
    _baseRouteId: 'TOUR01',
    stops: null, // getActiveRoutes()에서 TOUR01 stops 복사
  },
]

/**
 * 날짜 기반 노선명 — 임시 변경 기간이면 _tempLabel 반환
 */
export function getRouteDisplayLabel(route, date = new Date()) {
  if (route._tempLabel && route._tempStart && route._tempEnd) {
    const d = date.toISOString().slice(0, 10)
    if (d >= route._tempStart && d <= route._tempEnd) return route._tempLabel
  }
  return route.label
}

/**
 * 현재 날짜 기준 활성 노선 반환
 * - period가 있으면 기간 체크
 * - operatingDays 체크 (현재 요일)
 * - BTS-CITY-DAY는 TOUR01 정류장 복사
 */
export function getActiveRoutes(date = new Date()) {
  const today = date.toISOString().slice(0, 10)
  const dayName = ['sun','mon','tue','wed','thu','fri','sat'][date.getDay()]

  return TOURBUS_ROUTES_V2
    .filter(r => {
      if (r.period && (today < r.period.start || today > r.period.end)) return false
      return true
    })
    .map(r => {
      // BTS CITY DAY → TOUR01 정류장 복사
      if (r._baseRouteId && !r.stops) {
        const base = TOURBUS_ROUTES_V2.find(b => b.id === r._baseRouteId)
        if (base) return { ...r, stops: base.stops }
      }
      return r
    })
    .filter(r => r.stops && r.stops.length > 0)
}

/**
 * 현재 요일이 운행일인지
 */
export function isOperatingToday(route, date = new Date()) {
  const dayName = ['sun','mon','tue','wed','thu','fri','sat'][date.getDay()]
  return route.operatingDays.includes(dayName)
}

/**
 * 다음 버스 도착 예정시간 계산
 */
export function getNextArrival(stop, date = new Date()) {
  if (!stop.timetable) return null
  const nowMin = date.getHours() * 60 + date.getMinutes()
  for (const t of stop.timetable) {
    const [h, m] = t.split(':').map(Number)
    if (h * 60 + m > nowMin) return t
  }
  return null // 오늘 운행 종료
}

/**
 * 요금 포맷
 */
export function formatFee(fee, lang) {
  if (lang === 'zh') return `成人 ¥${Math.round(fee.adult / 180)} / 儿童 ¥${Math.round(fee.child / 180)}`
  if (lang === 'en') return `Adult ₩${fee.adult.toLocaleString()} / Child ₩${fee.child.toLocaleString()}`
  return `성인 ${fee.adult.toLocaleString()}원 / 소인 ${fee.child.toLocaleString()}원`
}
